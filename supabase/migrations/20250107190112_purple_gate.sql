/*
  # Update Search History and Preferences Management

  1. Changes
    - Add function to limit search history to latest 10 entries
    - Add function to update preferences with latest 10 items
    
  2. Security
    - Functions run with security definer to ensure proper access
*/

-- Function to manage search history limit
CREATE OR REPLACE FUNCTION manage_search_history() 
RETURNS TRIGGER AS $$
BEGIN
  -- Delete older entries if count exceeds 10
  DELETE FROM search_history
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id FROM search_history
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    LIMIT 10
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to manage search history
CREATE TRIGGER limit_search_history
  AFTER INSERT ON search_history
  FOR EACH ROW
  EXECUTE FUNCTION manage_search_history();

-- Function to update preferences
CREATE OR REPLACE FUNCTION update_user_preferences(
  user_id uuid,
  new_preference text
)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET preferences = (
    SELECT ARRAY(
      SELECT DISTINCT unnest(
        array_append(
          CASE 
            WHEN array_length(preferences, 1) >= 10 
            THEN preferences[2:10]
            ELSE preferences
          END,
          new_preference
        )
      )
      LIMIT 10
    )
  )
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;