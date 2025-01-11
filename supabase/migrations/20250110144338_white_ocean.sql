-- Create a new optimized search function that uses full text search
CREATE OR REPLACE FUNCTION search_speeches_fast(
  search_query text,
  page_number integer DEFAULT 0,
  results_per_page integer DEFAULT 10
)
RETURNS json AS $$
DECLARE
  total_count integer;
  search_results json;
  search_tokens text;
BEGIN
  -- Normalize search query and create search tokens
  search_tokens := regexp_replace(lower(search_query), '[^a-zA-Z0-9\s]', '', 'g');
  
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

  -- Insert results using parallel query and full text search
  INSERT INTO temp_search_results
  SELECT DISTINCT ON (p.id)
    p.id,
    p.title,
    p.legislature_period,
    p.number,
    p.date,
    s.nlp_speech_id,
    s.abstract_summary,
    ts_rank_cd(
      to_tsvector('english', COALESCE(s.text, '') || ' ' || COALESCE(s.abstract_summary, '') || ' ' || COALESCE(s.lemmas, '')),
      plainto_tsquery('english', search_tokens)
    ) as rank
  FROM speech s
  JOIN protocol p ON s.protocol_id = p.id
  WHERE 
    to_tsvector('english', COALESCE(s.text, '') || ' ' || COALESCE(s.abstract_summary, '') || ' ' || COALESCE(s.lemmas, '')) @@
    plainto_tsquery('english', search_tokens)
  ORDER BY p.id, rank DESC;

  -- Get total count
  SELECT count(*) INTO total_count FROM temp_search_results;

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

-- Create indexes for full text search
CREATE INDEX IF NOT EXISTS idx_speech_text_fts ON speech USING gin(to_tsvector('english', COALESCE(text, '')));
CREATE INDEX IF NOT EXISTS idx_speech_abstract_fts ON speech USING gin(to_tsvector('english', COALESCE(abstract_summary, '')));
CREATE INDEX IF NOT EXISTS idx_speech_lemmas_fts ON speech USING gin(to_tsvector('english', COALESCE(lemmas, '')));

-- Set work_mem for better sort performance
ALTER DATABASE CURRENT SET work_mem = '64MB';

-- Enable parallel query execution
ALTER DATABASE CURRENT SET max_parallel_workers_per_gather = 4;