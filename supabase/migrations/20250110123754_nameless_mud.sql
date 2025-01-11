-- Create protocols table if it doesn't exist
CREATE TABLE IF NOT EXISTS protocol (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  legislature_period INTEGER NOT NULL,
  number INTEGER NOT NULL,
  agenda_items_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(legislature_period, number)
);

-- Create speeches table if it doesn't exist
CREATE TABLE IF NOT EXISTS speech (
  nlp_speech_id TEXT PRIMARY KEY,
  speaker_id TEXT,
  text TEXT NOT NULL,
  abstract_summary TEXT,
  protocol_id TEXT REFERENCES protocol(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_protocol_date ON protocol(date DESC);
CREATE INDEX IF NOT EXISTS idx_speech_protocol ON speech(protocol_id);

-- Enable RLS
ALTER TABLE protocol ENABLE ROW LEVEL SECURITY;
ALTER TABLE speech ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can read protocols"
  ON protocol FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read speeches"
  ON speech FOR SELECT
  TO authenticated
  USING (true);