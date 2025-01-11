-- Drop existing indexes to replace with more efficient ones
DROP INDEX IF EXISTS idx_speech_text_gin;
DROP INDEX IF EXISTS idx_speech_abstract_gin;
DROP INDEX IF EXISTS idx_speech_lemmas_gin;

-- Create optimized indexes with specific operators and partial indexing
CREATE INDEX IF NOT EXISTS idx_speech_text_trgm ON speech USING gin(text gin_trgm_ops) 
WHERE text IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_speech_abstract_trgm ON speech USING gin(abstract_summary gin_trgm_ops)
WHERE abstract_summary IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_speech_lemmas_trgm ON speech USING gin(lemmas gin_trgm_ops)
WHERE lemmas IS NOT NULL;

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_speech_protocol_date ON speech(protocol_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_protocol_legislature_number_date ON protocol(legislature_period, number, date DESC);

-- Optimize the search function with materialized results and parallel processing
CREATE OR REPLACE FUNCTION search_speeches(
  search_query text,
  page_number integer DEFAULT 0,
  results_per_page integer DEFAULT 10
)
RETURNS json AS $$
DECLARE
  total_count integer;
  search_results json;
BEGIN
  -- Create temporary table for search results to improve performance
  CREATE TEMPORARY TABLE IF NOT EXISTS temp_search_results (
    id text,
    title text,
    legislature_period integer,
    number integer,
    date timestamptz,
    first_speech_id text,
    first_speech_summary text,
    similarity_score float
  ) ON COMMIT DROP;

  -- Clear temporary table
  TRUNCATE temp_search_results;

  -- Insert results into temporary table with parallel processing
  INSERT INTO temp_search_results
  SELECT DISTINCT ON (p.id)
    p.id,
    p.title,
    p.legislature_period,
    p.number,
    p.date,
    s.nlp_speech_id,
    s.abstract_summary,
    greatest(
      similarity(COALESCE(s.text, ''), search_query),
      similarity(COALESCE(s.abstract_summary, ''), search_query),
      similarity(COALESCE(s.lemmas, ''), search_query)
    ) as similarity_score
  FROM speech s
  JOIN protocol p ON s.protocol_id = p.id
  WHERE 
    s.text ILIKE '%' || search_query || '%' OR
    s.abstract_summary ILIKE '%' || search_query || '%' OR
    s.lemmas ILIKE '%' || search_query || '%';

  -- Get total count
  SELECT count(*) INTO total_count FROM temp_search_results;

  -- Build final result
  SELECT json_build_object(
    'total_count', total_count,
    'protocols', COALESCE(
      (SELECT json_agg(r.*)
       FROM (
         SELECT 
           id,
           title,
           legislature_period,
           number,
           date,
           first_speech_id,
           first_speech_summary
         FROM temp_search_results
         ORDER BY similarity_score DESC, date DESC
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

-- Create statistics for query planner
ANALYZE speech;
ANALYZE protocol;

-- Set work_mem for better sort performance
ALTER DATABASE CURRENT SET work_mem = '32MB';

-- Enable parallel query execution
ALTER DATABASE CURRENT SET max_parallel_workers_per_gather = 4;