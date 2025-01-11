-- Create materialized view for frequently accessed data
CREATE MATERIALIZED VIEW IF NOT EXISTS speech_search_view AS
SELECT 
  s.nlp_speech_id,
  s.text,
  s.abstract_summary,
  s.lemmas,
  p.id as protocol_id,
  p.title as protocol_title,
  p.legislature_period,
  p.number as protocol_number,
  p.date as protocol_date,
  to_tsvector('english', COALESCE(s.text, '') || ' ' || COALESCE(s.abstract_summary, '') || ' ' || COALESCE(s.lemmas, '')) as search_vector
FROM speech s
JOIN protocol p ON s.protocol_id = p.id;

-- Create indexes on materialized view
CREATE INDEX IF NOT EXISTS idx_speech_search_vector ON speech_search_view USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_speech_search_date ON speech_search_view(protocol_date DESC);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_speech_search_view()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY speech_search_view;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh materialized view
CREATE TRIGGER refresh_speech_search_view_on_speech
AFTER INSERT OR UPDATE OR DELETE ON speech
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_speech_search_view();

CREATE TRIGGER refresh_speech_search_view_on_protocol
AFTER INSERT OR UPDATE OR DELETE ON protocol
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_speech_search_view();

-- Optimize search function to use materialized view
CREATE OR REPLACE FUNCTION search_speeches_optimized(
  search_query text,
  page_number integer DEFAULT 0,
  results_per_page integer DEFAULT 10
)
RETURNS json AS $$
DECLARE
  total_count integer;
  search_results json;
  query_tokens text[];
BEGIN
  -- Split search query into tokens
  query_tokens := regexp_split_to_array(lower(search_query), '\s+');
  
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

  -- Insert results using parallel query
  INSERT INTO temp_search_results
  SELECT DISTINCT ON (protocol_id)
    protocol_id,
    protocol_title,
    legislature_period,
    protocol_number,
    protocol_date,
    nlp_speech_id,
    abstract_summary,
    ts_rank_cd(search_vector, to_tsquery('english', array_to_string(query_tokens, ' & '))) as rank
  FROM speech_search_view
  WHERE search_vector @@ to_tsquery('english', array_to_string(query_tokens, ' & '))
  ORDER BY protocol_id, rank DESC;

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

-- Set session parameters for better performance
ALTER DATABASE CURRENT SET effective_cache_size = '1GB';
ALTER DATABASE CURRENT SET maintenance_work_mem = '128MB';
ALTER DATABASE CURRENT SET random_page_cost = 1.1;
ALTER DATABASE CURRENT SET effective_io_concurrency = 200;

-- Create function to periodically refresh materialized view
CREATE OR REPLACE FUNCTION schedule_refresh_speech_search_view()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY speech_search_view;
END;
$$ LANGUAGE plpgsql;

-- Create a job to refresh the materialized view every hour
SELECT cron.schedule(
  'refresh_speech_search_view',
  '0 * * * *',
  'SELECT schedule_refresh_speech_search_view()'
);