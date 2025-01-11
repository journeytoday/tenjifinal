-- Create extension for full text search if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create function for speech search
CREATE OR REPLACE FUNCTION search_speeches(
  search_query text,
  max_results integer DEFAULT 20
)
RETURNS TABLE (
  speech_id text,
  speech_text text,
  abstract_summary text,
  protocol_id text,
  protocol_title text,
  legislature_period integer,
  protocol_number integer,
  protocol_date timestamptz,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.nlp_speech_id,
    s.text,
    s.abstract_summary,
    p.id,
    p.title,
    p.legislature_period,
    p.protocol_number,
    p.date,
    similarity(
      COALESCE(s.text, '') || ' ' || COALESCE(s.abstract_summary, ''),
      search_query
    ) as similarity_score
  FROM speeches s
  JOIN protocols p ON s.protocol_id = p.id
  WHERE 
    COALESCE(s.text, '') || ' ' || COALESCE(s.abstract_summary, '') % search_query
  ORDER BY similarity_score DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;