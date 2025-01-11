/*
  # Add search history column to profiles table

  1. Changes
    - Add search_history column to profiles table as text array
    - Add function to manage search history size
    - Add trigger to automatically manage search history

  2. Notes
    - Maximum of 20 search terms stored per user
    - Oldest terms are removed when limit is exceeded
    - Empty array by default
*/

-- Add search_history column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'search_history'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN search_history text[] DEFAULT '{}';
  END IF;
END $$;

-- Create function to manage search history size
CREATE OR REPLACE FUNCTION manage_profile_search_history() 
RETURNS TRIGGER AS $$
BEGIN
  -- Keep only the most recent 20 search terms
  IF array_length(NEW.search_history, 1) > 20 THEN
    NEW.search_history := (
      SELECT array_agg(term)
      FROM (
        SELECT unnest(NEW.search_history) as term
        ORDER BY term DESC
        LIMIT 20
      ) subquery
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to manage search history size
DROP TRIGGER IF EXISTS manage_search_history_size ON profiles;
CREATE TRIGGER manage_search_history_size
  BEFORE UPDATE OF search_history ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION manage_profile_search_history();

-- Create function to add search term
CREATE OR REPLACE FUNCTION add_search_term(
  user_id uuid,
  search_term text
) RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET search_history = array_prepend(search_term, 
    COALESCE(search_history, '{}')
  )
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;