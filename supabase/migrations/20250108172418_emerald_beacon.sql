/*
  # Legislative Data Schema with Natural Keys and Relationships

  1. New Tables
    - protocols: Legislative session records with natural id PK
    - agenda_items: Session items with natural id PK and protocol_id FK
    - speeches: Speech records with nlp_speech_id as PK and agenda relationships
    - speakers: Speaker information with speaker_id as PK
    
  2. Relationships
    - Agenda items belong to protocols (protocol_id FK)
    - Speeches link to agenda items via match_ag
    - Speeches link to speakers (speaker_id FK)
*/

-- Create protocols table
CREATE TABLE IF NOT EXISTS protocols (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  legislature_period INTEGER NOT NULL,
  protocol_number INTEGER NOT NULL,
  agenda_items_count INTEGER DEFAULT 0,
  mongo_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(legislature_period, protocol_number)
);

-- Create agenda_items table
CREATE TABLE IF NOT EXISTS agenda_items (
  id TEXT PRIMARY KEY,
  protocol_id TEXT REFERENCES protocols(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  agenda_item_number TEXT NOT NULL,
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
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create speeches table
CREATE TABLE IF NOT EXISTS speeches (
  nlp_speech_id TEXT PRIMARY KEY,
  speaker_id TEXT REFERENCES speakers(speaker_id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  abstract_summary TEXT,
  lemmas TEXT,
  agenda_item_id TEXT REFERENCES agenda_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_protocols_legislature_number 
  ON protocols(legislature_period, protocol_number);

CREATE INDEX IF NOT EXISTS idx_agenda_items_protocol_order 
  ON agenda_items(protocol_id, item_order);

CREATE INDEX IF NOT EXISTS idx_speeches_speaker 
  ON speeches(speaker_id);

CREATE INDEX IF NOT EXISTS idx_agenda_items_match_ag 
  ON agenda_items(match_ag);

-- Function to update match_ag
CREATE OR REPLACE FUNCTION update_agenda_match_ag()
RETURNS TRIGGER AS $$
BEGIN
  NEW.match_ag := (
    SELECT legislature_period::TEXT || protocol_number::TEXT || NEW.item_order::TEXT
    FROM protocols
    WHERE id = NEW.protocol_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update speaker full_name
CREATE OR REPLACE FUNCTION update_speaker_full_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.full_name := TRIM(
    CASE 
      WHEN NEW.academic_title IS NOT NULL THEN NEW.academic_title || ' '
      ELSE ''
    END ||
    NEW.first_name || ' ' ||
    NEW.last_name
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for computed columns
CREATE TRIGGER set_agenda_match_ag
  BEFORE INSERT OR UPDATE ON agenda_items
  FOR EACH ROW
  EXECUTE FUNCTION update_agenda_match_ag();

CREATE TRIGGER set_speaker_full_name
  BEFORE INSERT OR UPDATE ON speakers
  FOR EACH ROW
  EXECUTE FUNCTION update_speaker_full_name();

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

-- Create view for combined data
CREATE VIEW legislative_records AS
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