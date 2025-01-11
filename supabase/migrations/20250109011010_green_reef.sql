/*
  # Fix Protocol and Speech Relationship

  1. Changes
    - Add protocol_id column to speeches table
    - Create index on protocol_id
    - Add foreign key constraint
  
  2. Security
    - Enable RLS on speeches table
    - Add policy for authenticated users to read speeches
*/

-- Add protocol_id to speeches if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'speeches' AND column_name = 'protocol_id'
  ) THEN
    ALTER TABLE speeches ADD COLUMN protocol_id TEXT;
  END IF;
END $$;

-- Create index on protocol_id
CREATE INDEX IF NOT EXISTS idx_speeches_protocol_id ON speeches(protocol_id);

-- Add foreign key constraint
ALTER TABLE speeches 
  ADD CONSTRAINT fk_speeches_protocol 
  FOREIGN KEY (protocol_id) 
  REFERENCES protocols(id) 
  ON DELETE CASCADE;

-- Update RLS policies
ALTER TABLE speeches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read speeches"
  ON speeches FOR SELECT
  TO authenticated
  USING (true);