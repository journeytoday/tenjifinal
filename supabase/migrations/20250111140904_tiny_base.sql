-- Create function to get and process user queries
CREATE OR REPLACE FUNCTION get_user_queries(user_id_param uuid)
RETURNS TABLE (
  step_number integer,
  step_description text,
  query_list text[]
) AS $$
DECLARE
  user_preferences text[];
  search_queries text[];
  combined_queries text[];
  final_queries text[];
BEGIN
  -- Step 1: Get user preferences
  SELECT preferences INTO user_preferences
  FROM profiles
  WHERE id = user_id_param;
  
  RETURN QUERY SELECT 
    1,
    'User Preferences Retrieved',
    COALESCE(user_preferences, ARRAY[]::text[]);

  -- Step 2: Get search history
  SELECT ARRAY_AGG(query ORDER BY created_at DESC)
  INTO search_queries
  FROM (
    SELECT DISTINCT ON (query) query, created_at
    FROM search_history
    WHERE user_id = user_id_param
    ORDER BY query, created_at DESC
    LIMIT 10
  ) sq;

  RETURN QUERY SELECT 
    2,
    'Search History Retrieved',
    COALESCE(search_queries, ARRAY[]::text[]);

  -- Step 3: Combine and deduplicate
  combined_queries := array_cat(
    COALESCE(user_preferences, ARRAY[]::text[]),
    COALESCE(search_queries, ARRAY[]::text[])
  );
  
  -- Keep only distinct values, preserving proper nouns
  SELECT ARRAY_AGG(DISTINCT word)
  INTO final_queries
  FROM (
    SELECT unnest(combined_queries) as word
    WHERE 
      -- Keep proper nouns (words starting with uppercase)
      word ~ '^[A-Z]' OR 
      -- Or if it appears in the first 10
      row_number() OVER (ORDER BY word) <= 10
  ) sq;

  RETURN QUERY SELECT 
    3,
    'Processed Unique Queries',
    COALESCE(final_queries, ARRAY[]::text[]);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;