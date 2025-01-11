-- Add protocol_id column to speech table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'speech' AND column_name = 'protocol_id'
  ) THEN
    ALTER TABLE speech ADD COLUMN protocol_id TEXT;
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'speech_protocol_id_fkey'
  ) THEN
    ALTER TABLE speech 
    ADD CONSTRAINT speech_protocol_id_fkey 
    FOREIGN KEY (protocol_id) 
    REFERENCES protocol(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Create index on protocol_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_speech_protocol_id ON speech(protocol_id);

-- Update protocol_id based on existing relationships
UPDATE speech s
SET protocol_id = a.protocol_id
FROM agenda_items a
WHERE s.agenda_item_id = a.id
AND s.protocol_id IS NULL;