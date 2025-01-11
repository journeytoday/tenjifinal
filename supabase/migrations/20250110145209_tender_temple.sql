-- Add German language support
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create function to detect language
CREATE OR REPLACE FUNCTION detect_language(text_input text)
RETURNS text AS $$
DECLARE
  german_chars text := 'äöüßÄÖÜ';
  german_words text[] := ARRAY['der', 'die', 'das', 'und', 'ist', 'von', 'für'];
  word text;
  word_count integer := 0;
BEGIN
  -- Check for German characters
  IF text_input ~ '[' || german_chars || ']' THEN
    RETURN 'german';
  END IF;

  -- Check for common German words
  FOREACH word IN ARRAY german_words LOOP
    IF text_input ~* ('\m' || word || '\M') THEN
      word_count := word_count + 1;
    END IF;
  END LOOP;

  IF word_count > 0 THEN
    RETURN 'german';
  END IF;

  RETURN 'english';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to normalize text for search
CREATE OR REPLACE FUNCTION normalize_search_text(text_input text)
RETURNS text AS $$
BEGIN
  RETURN unaccent(lower(regexp_replace(text_input, '[^a-zA-ZäöüßÄÖÜ\s]', '', 'g')));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update the search vector to support both languages
ALTER TABLE speech DROP COLUMN IF EXISTS search_vector_de;
ALTER TABLE speech ADD COLUMN search_vector_de tsvector;

-- Update trigger function to handle both languages
CREATE OR REPLACE FUNCTION speech_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  -- English vector
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.text, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.abstract_summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.lemmas, '')), 'C');
    
  -- German vector
  NEW.search_vector_de :=
    setweight(to_tsvector('german', COALESCE(NEW.text, '')), 'A') ||
    setweight(to_tsvector('german', COALESCE(NEW.abstract_summary, '')), 'B') ||
    setweight(to_tsvector('german', COALESCE(NEW.lemmas, '')), 'C');
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create index for German search vector
CREATE INDEX IF NOT EXISTS idx_speech_search_vector_de_gin ON speech USING gin(search_vector_de);

-- Update existing rows with German vectors
UPDATE speech SET
  search_vector_de =
    setweight(to_tsvector('german', COALESCE(text, '')), 'A') ||
    setweight(to_tsvector('german', COALESCE(abstract_summary, '')), 'B') ||
    setweight(to_tsvector('german', COALESCE(lemmas, '')), 'C');

-- Create optimized multilingual search function
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
    p.legislature_period,
    p.number,
    p.date,
    s.nlp_speech_id,
    s.abstract_summary,
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