/*
  # Legislative Data Schema with Natural Primary Keys

  1. New Tables
    - protocols (legislative session records with id PK)
    - agenda_items (items discussed in sessions with id PK)
    - speeches (speeches given during sessions with nlp_speech_id PK)
    - speakers (information about speakers with speaker_id PK)
    - final_table (combined view of all data)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create protocols table
CREATE TABLE IF NOT EXISTS protocols (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL,
  legislature_period INTEGER NOT NULL,
  protocol_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  agenda_items_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(legislature_period, protocol_number)
);

-- Create agenda_items table
CREATE TABLE IF NOT EXISTS agenda_items (
  id TEXT PRIMARY KEY,
  protocol_id TEXT REFERENCES protocols(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  agenda_item_number INTEGER NOT NULL,
  item_order INTEGER NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  match_ag TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(protocol_id, item_order)
);

-- Create speakers table
CREATE TABLE IF NOT EXISTS speakers (
  speaker_id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  academic_title TEXT,
  gender TEXT,
  party TEXT,
  fraction TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    TRIM(CONCAT(
      COALESCE(academic_title || ' ', ''),
      first_name || ' ',
      last_name
    ))
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create speeches table
CREATE TABLE IF NOT EXISTS speeches (
  nlp_speech_id TEXT PRIMARY KEY,
  speaker_id TEXT REFERENCES speakers(speaker_id) ON DELETE CASCADE,
  agenda_item_id TEXT REFERENCES agenda_items(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  abstract_summary TEXT,
  lemmas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Function to update match_ag
CREATE OR REPLACE FUNCTION update_match_ag()
RETURNS TRIGGER AS $$
BEGIN
  SELECT 
    NEW.match_ag = legislature_period::TEXT || protocol_number::TEXT || NEW.item_order::TEXT
  FROM protocols 
  WHERE id = NEW.protocol_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for match_ag
CREATE TRIGGER update_agenda_match_ag
  BEFORE INSERT OR UPDATE OF protocol_id, item_order
  ON agenda_items
  FOR EACH ROW
  EXECUTE FUNCTION update_match_ag();

-- Create final_table view
CREATE VIEW final_table AS
SELECT 
  p.id AS protocol_id,
  p.legislature_period,
  p.protocol_number,
  p.title AS protocol_title,
  p.date AS protocol_date,
  a.id AS agenda_item_id,
  a.title AS agenda_item_title,
  a.item_order AS agenda_order,
  s.nlp_speech_id AS speech_id,
  s.abstract_summary,
  a.match_ag,
  sp.speaker_id,
  sp.full_name AS speaker_full_name
FROM protocols p
JOIN agenda_items a ON a.protocol_id = p.id
JOIN speeches s ON s.agenda_item_id = a.id
JOIN speakers sp ON s.speaker_id = sp.speaker_id
ORDER BY p.date DESC, p.legislature_period DESC, p.protocol_number DESC;

-- Enable Row Level Security
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE speeches ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Allow read access to all authenticated users for protocols"
  ON protocols FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users for agenda_items"
  ON agenda_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users for speeches"
  ON speeches FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users for speakers"
  ON speakers FOR SELECT TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_protocols_legislature_number 
  ON protocols(legislature_period, protocol_number);

CREATE INDEX IF NOT EXISTS idx_agenda_items_protocol_order 
  ON agenda_items(protocol_id, item_order);

CREATE INDEX IF NOT EXISTS idx_speeches_speaker 
  ON speeches(speaker_id);

-- Function to update agenda_items_count
CREATE OR REPLACE FUNCTION update_protocol_agenda_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE protocols 
    SET agenda_items_count = agenda_items_count + 1
    WHERE id = NEW.protocol_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE protocols 
    SET agenda_items_count = agenda_items_count - 1
    WHERE id = OLD.protocol_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for agenda_items_count
CREATE TRIGGER update_protocol_agenda_count
  AFTER INSERT OR DELETE ON agenda_items
  FOR EACH ROW
  EXECUTE FUNCTION update_protocol_agenda_count();