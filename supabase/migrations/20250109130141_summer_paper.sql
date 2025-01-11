/*
  # Recommendation System Implementation

  1. New Functions
    - text_similarity: Calculates similarity between two text strings
    - get_recommendations: Main recommendation function that returns personalized protocols
  
  2. Changes
    - Adds similarity-based recommendation logic
    - Supports user preferences and search history
    - Returns top 10 most relevant protocols
*/

-- Create extension for text similarity if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create a function to calculate text similarity using trigrams
CREATE OR REPLACE FUNCTION text_similarity(text1 text, text2 text) 
RETURNS float AS $$
BEGIN
  RETURN similarity(text1, text2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create the main recommendation function
CREATE OR REPLACE FUNCTION get_recommendations(
  p_user_id uuid,
  p_preferences text[]
)
RETURNS TABLE (
  id text,
  title text,
  legislatureperiod integer,
  number integer,
  date timestamptz,
  first_speech_id text,
  first_speech_summary text,
  similarity_score float
) AS $$
DECLARE
  preference_text text;
  user_search_history text[];
BEGIN
  -- Get user's search history
  SELECT search_history INTO user_search_history
  FROM profiles
  WHERE id = p_user_id;

  -- Combine preferences and recent search history into a single text
  preference_text := array_to_string(
    array_cat(
      p_preferences,
      COALESCE(user_search_history[array_length(user_search_history, 1)-5 : array_length(user_search_history, 1)], ARRAY[]::text[])
    ),
    ' '
  );
  
  RETURN QUERY
  WITH ranked_speeches AS (
    SELECT 
      p.id,
      p.title,
      p.legislature_period,
      p.protocol_number,
      p.date,
      s.nlp_speech_id,
      s.abstract_summary,
      text_similarity(COALESCE(s.abstract_summary, ''), preference_text) as score,
      ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY text_similarity(COALESCE(s.abstract_summary, ''), preference_text) DESC) as rn
    FROM protocols p
    JOIN speeches s ON s.protocol_id = p.id
    WHERE s.abstract_summary IS NOT NULL
  )
  SELECT DISTINCT ON (rs.id)
    rs.id,
    rs.title,
    rs.legislature_period,
    rs.protocol_number,
    rs.date,
    rs.nlp_speech_id,
    rs.abstract_summary,
    rs.score
  FROM ranked_speeches rs
  WHERE rn = 1
  ORDER BY rs.id, rs.score DESC, rs.date DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;