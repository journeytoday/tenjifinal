/*
  # Update Protocol-Speech Relationship

  1. Changes
    - Updates protocol_id in speech table based on matching legislatureperiod and number from protocol table
    - Uses matchag field to determine the correct protocol relationship
    - Adds necessary indexes for performance

  2. Security
    - Maintains existing RLS policies
*/

-- Update protocol_id in speech table based on matchag pattern
UPDATE speech s
SET protocol_id = p.id
FROM protocol p
WHERE CONCAT(p.legislatureperiod::text, p.number::text) = LEFT(s.matchag, LENGTH(p.legislatureperiod::text) + LENGTH(p.number::text))
AND s.protocol_id IS NULL;

-- Create index for better query performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_speech_protocol_id ON speech(protocol_id);

-- Analyze tables for query optimizer
ANALYZE speech;
ANALYZE protocol;