-- Create extension for full text search if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create function for speech search
CREATE OR REPLACE FUNCTION search_speeches_fast(
  search_query text,
  page_number integer DEFAULT 0,
  results_per_page integer DEFAULT 10
)
RETURNS json AS $$
DECLARE
  total_count integer;
  search_results json;
BEGIN
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

  -- Insert results using parallel query
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
      to_tsvector('english', COALESCE(s.text, '') || ' ' || COALESCE(s.abstractsummary, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM speech s
  JOIN protocol p ON s.protocol_id = p.id
  WHERE 
    to_tsvector('english', COALESCE(s.text, '') || ' ' || COALESCE(s.abstractsummary, '')) @@
    plainto_tsquery('english', search_query)
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

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_speech_text_fts ON speech USING gin(to_tsvector('english', COALESCE(text, '')));
CREATE INDEX IF NOT EXISTS idx_speech_abstract_fts ON speech USING gin(to_tsvector('english', COALESCE(abstractsummary, '')));

-- Set work_mem for better sort performance
ALTER DATABASE CURRENT SET work_mem = '64MB';

-- Enable parallel query execution
ALTER DATABASE CURRENT SET max_parallel_workers_per_gather = 4;