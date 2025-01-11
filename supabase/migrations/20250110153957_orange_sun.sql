-- Drop existing foreign key if it exists
ALTER TABLE speech DROP CONSTRAINT IF EXISTS speech_protocol_id_fkey;

-- Ensure protocol_id column exists with correct type
ALTER TABLE speech DROP COLUMN IF EXISTS protocol_id;
ALTER TABLE speech ADD COLUMN protocol_id TEXT REFERENCES protocol(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_speech_protocol_id ON speech(protocol_id);

-- Update protocol_id based on matchag pattern
UPDATE speech s
SET protocol_id = p.id
FROM protocol p
WHERE CONCAT(p.legislatureperiod::text, p.number::text) = LEFT(s.matchag, LENGTH(p.legislatureperiod::text) + LENGTH(p.number::text));

-- Create indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_speech_abstractsummary ON speech(abstractsummary);
CREATE INDEX IF NOT EXISTS idx_speech_nlpspeechid ON speech(nlpspeechid);

-- Enable RLS
ALTER TABLE speech ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Authenticated users can read speeches"
  ON speech FOR SELECT
  TO authenticated
  USING (true);