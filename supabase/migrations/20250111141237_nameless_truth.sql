-- Create function to get and process user queries
CREATE OR REPLACE FUNCTION get_user_queries(user_id_param uuid)
RETURNS TABLE (
  step_number integer,
  step_description text,
  query_list text[]
) AS $$
DECLARE
  user_preferences text[];
  user_id text;
BEGIN
  -- Step 1: Get user ID and preferences
  SELECT id::text, preferences INTO user_id, user_preferences
  FROM profiles
  WHERE id = user_id_param;

  -- Return Step 1 result
  RETURN QUERY SELECT 
    1,
    'User Preferences Retrieved',
    COALESCE(user_preferences, ARRAY[]::text[]);

  -- Return Step 2 result (user ID)
  RETURN QUERY SELECT 
    2,
    'User ID Retrieved',
    ARRAY[user_id];

  -- Return Step 3 result (combined info)
  RETURN QUERY SELECT 
    3,
    'Process Complete',
    COALESCE(user_preferences, ARRAY[]::text[]);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_queries(uuid) TO authenticated;