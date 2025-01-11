-- Create a combined text search vector column
ALTER TABLE speech ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION speech_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.text, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.abstract_summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.lemmas, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS speech_search_vector_update ON speech;
CREATE TRIGGER speech_search_vector_update
  BEFORE INSERT OR UPDATE ON speech
  FOR EACH ROW
  EXECUTE FUNCTION speech_search_vector_trigger();

-- Update existing rows
UPDATE speech SET search_vector =
  setweight(to_tsvector('english', COALESCE(text, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(abstract_summary, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(lemmas, '')), 'C');

-- Create GiST index for search_vector (faster indexing, slower searching)
CREATE INDEX IF NOT EXISTS idx_speech_search_vector_gist ON speech USING gist(search_vector);

-- Create GIN index for search_vector (slower indexing, faster searching)
CREATE INDEX IF NOT EXISTS idx_speech_search_vector_gin ON speech USING gin(search_vector);

-- Create optimized search function with weighted ranking
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
BEGIN
  -- Normalize search query
  query_tokens := regexp_replace(trim(search_query), '\s+', ' & ', 'g');
  
  -- Create temporary table with search results
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

  -- Insert results using parallel query and weighted ranking
  INSERT INTO temp_search_results
  SELECT DISTINCT ON (p.id)
    p.id,
    p.title,
    p.legislature_period,
    p.number,
    p.date,
    s.nlp_speech_id,
    s.abstract_summary,
    ts_rank_cd(s.search_vector, to_tsquery('english', query_tokens), 32) as rank
  FROM speech s
  JOIN protocol p ON s.protocol_id = p.id
  WHERE s.search_vector @@ to_tsquery('english', query_tokens)
  ORDER BY p.id, rank DESC;

  -- Get total count
  GET DIAGNOSTICS total_count = ROW_COUNT;

  -- Build paginated results with caching hint
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

-- Set additional database parameters for better performance
ALTER DATABASE CURRENT SET default_statistics_target = 1000;
ALTER DATABASE CURRENT SET effective_cache_size = '2GB';
ALTER DATABASE CURRENT SET maintenance_work_mem = '256MB';
ALTER DATABASE CURRENT SET checkpoint_completion_target = 0.9;
ALTER DATABASE CURRENT SET wal_buffers = '16MB';
ALTER DATABASE CURRENT SET random_page_cost = 1.1;
ALTER DATABASE CURRENT SET effective_io_concurrency = 200;