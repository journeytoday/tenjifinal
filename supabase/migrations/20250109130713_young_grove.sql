/*
  # Fix protocol table name and structure

  1. Changes
    - Rename protocol table to protocols
    - Add missing columns and constraints
    - Enable RLS with appropriate policies

  2. Security
    - Enable RLS on protocols table
    - Add policies for authenticated users
*/

-- Create protocols table if it doesn't exist
CREATE TABLE IF NOT EXISTS protocols (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  legislature_period INTEGER NOT NULL,
  protocol_number INTEGER NOT NULL,
  agenda_items_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(legislature_period, protocol_number)
);

-- Create speeches table if it doesn't exist
CREATE TABLE IF NOT EXISTS speeches (
  nlp_speech_id TEXT PRIMARY KEY,
  speaker_id TEXT,
  text TEXT NOT NULL,
  abstract_summary TEXT,
  protocol_id TEXT REFERENCES protocols(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_protocols_date ON protocols(date DESC);
CREATE INDEX IF NOT EXISTS idx_speeches_protocol ON speeches(protocol_id);

-- Enable RLS
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE speeches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can read protocols"
  ON protocols FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read speeches"
  ON speeches FOR SELECT
  TO authenticated
  USING (true);