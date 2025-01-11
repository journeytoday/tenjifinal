-- Fix column names in speech table
ALTER TABLE speech RENAME COLUMN nlp_speech_id TO nlpspeechid;
ALTER TABLE speech RENAME COLUMN abstract_summary TO abstractsummary;

-- Update indexes to use new column names
DROP INDEX IF EXISTS idx_speech_protocol;
CREATE INDEX idx_speech_protocol ON speech(protocol_id);

-- Update search function to use correct column names
CREATE OR REPLACE FUNCTION search_speeches_fast(
  search_query text,
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
  -- Detect language and normalize query
  detected_lang := detect_language(search_query);
  normalized_query := normalize_search_text(search_query);
  query_tokens := regexp_replace(normalized_query, '\s+', ' & ', 'g');
  
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

  -- Insert results using the appropriate language vector
  INSERT INTO temp_search_results
  SELECT DISTINCT ON (p.id)
    p.id,
    p.title,
    p.legislatureperiod,
    p.number,
    p.date,
    s.nlpspeechid,
    s.abstractsummary,
    ts_rank_cd(
      CASE 
        WHEN detected_lang = 'german' THEN s.search_vector_de 
        ELSE s.search_vector 
      END,
      to_tsquery(detected_lang, query_tokens),
      32
    ) as rank
  FROM speech s
  JOIN protocol p ON s.protocol_id = p.id
  WHERE 
    CASE 
      WHEN detected_lang = 'german' THEN s.search_vector_de @@ to_tsquery('german', query_tokens)
      ELSE s.search_vector @@ to_tsquery('english', query_tokens)
    END
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