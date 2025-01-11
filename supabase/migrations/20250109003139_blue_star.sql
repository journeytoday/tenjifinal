/*
  # Remove foreign key constraint between speech and speaker tables

  1. Changes
    - Remove foreign key constraint from speech table for speaker_id column
    - Keep speaker_id column for joining with speaker table
    - Add index on speaker_id for better join performance

  2. Notes
    - This allows more flexible data management while maintaining the ability to join tables
    - Index helps maintain query performance for speaker lookups
*/

-- Remove the foreign key constraint
ALTER TABLE speeches DROP CONSTRAINT IF EXISTS speeches_speaker_id_fkey;

-- Create an index on speaker_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_speeches_speaker_id ON speeches(speaker_id);