-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create own search history" ON search_history;
DROP POLICY IF EXISTS "Users can view own search history" ON search_history;

-- Create new policies with correct syntax
CREATE POLICY "Users can insert own search history"
ON search_history FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own search history"
ON search_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;