-- Create extension for full text search if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes for faster text search
CREATE INDEX IF NOT EXISTS idx_speech_text_gin ON speech USING gin(text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_speech_abstract_gin ON speech USING gin(abstract_summary gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_speech_lemmas_gin ON speech USING gin(lemmas gin_trgm_ops);

-- Create optimized search function
CREATE OR REPLACE FUNCTION search_speeches(
  search_query text,
  page_number integer,
  results_per_page integer
)
RETURNS json AS $$
DECLARE
  total_count integer;
  search_results json;
BEGIN
  -- Get matching speeches with similarity scores
  WITH ranked_speeches AS (
    SELECT DISTINCT ON (p.id)
      p.id,
      p.title,
      p.legislature_period,
      p.number,
      p.date,
      s.nlp_speech_id as first_speech_id,
      s.abstract_summary as first_speech_summary,
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
      s.lemmas ILIKE '%' || search_query || '%'
    ORDER BY p.id, similarity_score DESC
  )
  SELECT 
    count(*) INTO total_count
  FROM ranked_speeches;

  SELECT json_build_object(
    'total_count', total_count,
    'protocols', COALESCE(
      (SELECT json_agg(r.*)
       FROM (
         SELECT *
         FROM ranked_speeches
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