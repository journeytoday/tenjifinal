/*
  # Fix Protocol and Speeches Relationship

  1. Changes
    - Update foreign key relationship between protocols and speeches
    - Add missing indexes
    - Update RLS policies
*/

-- Drop existing constraint if it exists
ALTER TABLE speeches DROP CONSTRAINT IF EXISTS fk_speeches_protocol;

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

-- Update protocol_id based on agenda_items
UPDATE speeches s
SET protocol_id = a.protocol_id
FROM agenda_items a
WHERE s.agenda_item_id = a.id
AND s.protocol_id IS NULL;

-- Create index on protocol_id
CREATE INDEX IF NOT EXISTS idx_speeches_protocol_id ON speeches(protocol_id);

-- Add foreign key constraint
ALTER TABLE speeches 
  ADD CONSTRAINT fk_speeches_protocols 
  FOREIGN KEY (protocol_id) 
  REFERENCES protocols(id) 
  ON DELETE CASCADE;