/*
  # Update Speech-Protocol Relationship from Consolidated Data

  1. Changes
    - Updates protocol_id in speech table using consolidateddata table
    - Maintains existing RLS policies
    - Adds necessary indexes for performance

  2. Security
    - Preserves existing RLS policies
*/

-- Update protocol_id in speech table using consolidateddata
UPDATE speech s
SET protocol_id = c.protocolid
FROM consolidateddata c
WHERE s.nlpspeechid = c.nlpspeechid
AND s.protocol_id IS NULL;

-- Create index for better query performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_speech_protocol_id ON speech(protocol_id);

-- Create index on consolidateddata for better join performance
CREATE INDEX IF NOT EXISTS idx_consolidateddata_nlpspeechid ON consolidateddata(nlpspeechid);

-- Analyze tables for query optimizer
ANALYZE speech;
ANALYZE consolidateddata;