-- Create function for filtered search
CREATE OR REPLACE FUNCTION search_speeches_filtered(
  search_query text DEFAULT '',
  filter_years integer[] DEFAULT NULL,
  filter_legislature_periods integer[] DEFAULT NULL,
  filter_sitting integer DEFAULT NULL,
  filter_speaker text DEFAULT NULL,
  page_number integer DEFAULT 0,
  results_per_page integer DEFAULT 10
)
RETURNS json AS $$
DECLARE
  total_count integer;
  search_results json;
  query_tokens text;
  detected_lang text;
  normalized_query text;
BEGIN
  -- Detect language and normalize query if provided
  IF search_query <> '' THEN
    detected_lang := detect_language(search_query);
    normalized_query := normalize_search_text(search_query);
    query_tokens := regexp_replace(normalized_query, '\s+', ' & ', 'g');
  END IF;
  
  -- Create temporary table for search results
  CREATE TEMPORARY TABLE IF NOT EXISTS temp_search_results (
    protocol_id text,
    title text,
    legislature_period integer,
    number integer,
    date timestamptz,
    first_speech_id text,
    first_speech_summary text,
    rank float
  ) ON COMMIT DROP;

  -- Insert results with filters
  INSERT INTO temp_search_results
  SELECT DISTINCT ON (p.id)
    p.id,
    p.title,
    p.legislatureperiod,
    p.number,
    p.date,
    s.nlpspeechid,
    s.abstractsummary,
    CASE 
      WHEN search_query <> '' THEN
        ts_rank_cd(
          CASE 
            WHEN detected_lang = 'german' THEN s.search_vector_de 
            ELSE s.search_vector 
          END,
          to_tsquery(detected_lang, query_tokens),
          32
        )
      ELSE 1.0
    END as rank
  FROM protocol p
  LEFT JOIN speech s ON s.protocol_id = p.id
  LEFT JOIN speaker sp ON s.speaker_id = sp.speaker_id
  WHERE 
    -- Apply search query if provided
    (
      search_query = '' OR
      CASE 
        WHEN detected_lang = 'german' THEN s.search_vector_de @@ to_tsquery('german', query_tokens)
        ELSE s.search_vector @@ to_tsquery('english', query_tokens)
      END
    )
    -- Apply year filter if provided
    AND (
      filter_years IS NULL OR
      EXTRACT(YEAR FROM p.date) = ANY(filter_years)
    )
    -- Apply legislature period filter if provided
    AND (
      filter_legislature_periods IS NULL OR
      p.legislatureperiod = ANY(filter_legislature_periods)
    )
    -- Apply sitting filter if provided
    AND (
      filter_sitting IS NULL OR
      p.number = filter_sitting
    )
    -- Apply speaker filter if provided
    AND (
      filter_speaker IS NULL OR
      sp.full_name = filter_speaker
    )
  ORDER BY p.id, rank DESC;

  -- Get total count
  GET DIAGNOSTICS total_count = ROW_COUNT;

  -- Build paginated results
  SELECT json_build_object(
    'total_count', total_count,
    'protocols', COALESCE(
      (SELECT json_agg(r.*)
       FROM (
         SELECT 
           protocol_id as id,
           title,
           legislature_period,
           number,
           date,
           first_speech_id,
           first_speech_summary
         FROM temp_search_results
         ORDER BY rank DESC, date DESC
         LIMIT results_per_page
         OFFSET page_number * results_per_page
       ) r
      ),
      '[]'::json
    )
  ) INTO search_results;

  RETURN search_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for date filtering
CREATE INDEX IF NOT EXISTS idx_protocol_date_year ON protocol(date);

-- Create index for speaker filtering
CREATE INDEX IF NOT EXISTS idx_speaker_full_name ON speaker(full_name);