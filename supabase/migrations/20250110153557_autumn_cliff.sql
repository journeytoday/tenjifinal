-- Create function for filtered protocol search
CREATE OR REPLACE FUNCTION filter_protocols(
  filter_years integer[] DEFAULT NULL,
  filter_legislature_periods integer[] DEFAULT NULL,
  filter_sitting integer DEFAULT NULL,
  filter_speaker text DEFAULT NULL,
  page_number integer DEFAULT 0,
  results_per_page integer DEFAULT 10
)
RETURNS json AS $$
DECLARE
  total_count integer;
  results json;
BEGIN
  -- Create temporary table for filtered results
  CREATE TEMPORARY TABLE IF NOT EXISTS temp_filtered_protocols (
    id text,
    title text,
    legislatureperiod integer,
    number integer,
    date timestamptz,
    first_speech_id text,
    first_speech_summary text
  ) ON COMMIT DROP;

  -- Insert filtered results
  INSERT INTO temp_filtered_protocols
  SELECT DISTINCT ON (p.id)
    p.id,
    p.title,
    p.legislatureperiod,
    p.number,
    p.date,
    s.nlpspeechid,
    s.abstractsummary
  FROM protocol p
  LEFT JOIN speech s ON s.protocol_id = p.id
  LEFT JOIN speaker sp ON s.speaker_id = sp.speaker_id
  WHERE 
    -- Apply year filter if provided
    (
      filter_years IS NULL OR
      EXTRACT(YEAR FROM p.date) = ANY(filter_years)
    )
    -- Apply legislature period filter if provided
    AND (
      filter_legislature_periods IS NULL OR
      p.legislatureperiod = ANY(filter_legislature_periods)
    )
    -- Apply sitting filter if provided
    AND (
      filter_sitting IS NULL OR
      p.number = filter_sitting
    )
    -- Apply speaker filter if provided
    AND (
      filter_speaker IS NULL OR
      sp.fullname = filter_speaker
    )
  ORDER BY p.id, p.date DESC;

  -- Get total count
  GET DIAGNOSTICS total_count = ROW_COUNT;

  -- Build paginated results
  SELECT json_build_object(
    'total_count', total_count,
    'protocols', COALESCE(
      (SELECT json_agg(r.*)
       FROM (
         SELECT *
         FROM temp_filtered_protocols
         ORDER BY date DESC
         LIMIT results_per_page
         OFFSET page_number * results_per_page
       ) r
      ),
      '[]'::json
    )
  ) INTO results;

  RETURN results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better filter performance
CREATE INDEX IF NOT EXISTS idx_protocol_date_year ON protocol(date);
CREATE INDEX IF NOT EXISTS idx_protocol_legislature ON protocol(legislatureperiod);
CREATE INDEX IF NOT EXISTS idx_protocol_number ON protocol(number);
CREATE INDEX IF NOT EXISTS idx_speaker_fullname ON speaker(fullname);