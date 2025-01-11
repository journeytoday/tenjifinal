-- Standardize column names in speech table
ALTER TABLE speech RENAME COLUMN protocolid TO protocol_id;
ALTER TABLE speech RENAME COLUMN nlpspeechid TO nlp_speech_id;
ALTER TABLE speech RENAME COLUMN abstractsummary TO abstract_summary;

-- Standardize column names in protocol table
ALTER TABLE protocol RENAME COLUMN legislatureperiod TO legislature_period;

-- Recreate indexes with new column names
DROP INDEX IF EXISTS idx_speech_protocol_id;
CREATE INDEX idx_speech_protocol_id ON speech(protocol_id);

DROP INDEX IF EXISTS idx_speech_nlp_speech_id;
CREATE INDEX idx_speech_nlp_speech_id ON speech(nlp_speech_id);

-- Update the search function to use new column names
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
    p.legislature_period,
    p.number,
    p.date,
    s.nlp_speech_id,
    s.abstract_summary,
    ts_rank_cd(
      to_tsvector('english', COALESCE(s.text, '') || ' ' || COALESCE(s.abstract_summary, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM speech s
  JOIN protocol p ON s.protocol_id = p.id
  WHERE 
    to_tsvector('english', COALESCE(s.text, '') || ' ' || COALESCE(s.abstract_summary, '')) @@
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

-- Analyze tables for query optimizer
ANALYZE speech;
ANALYZE protocol;