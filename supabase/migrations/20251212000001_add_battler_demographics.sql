-- Add gender and race fields to battlers for diversity and audience representation
-- These fields help with:
-- 1. Creating diverse AI battlers (including females)
-- 2. Matching audience members to crowd sprites
-- 3. Building more authentic battle rap representation

-- Gender enum
CREATE TYPE battler_gender AS ENUM ('male', 'female', 'non_binary');

-- Race/ethnicity for crowd sprite matching (matches available sprites)
CREATE TYPE battler_race AS ENUM ('black', 'white', 'mixed');

-- Add columns to battlers table
ALTER TABLE battlers
ADD COLUMN gender battler_gender DEFAULT 'male',
ADD COLUMN race battler_race DEFAULT 'black';

-- Update existing battlers with demographic data
-- Most existing AI battlers are male (default)
-- We'll add females via separate seed script

-- Create index for filtering by demographics
CREATE INDEX idx_battlers_gender ON battlers(gender);
CREATE INDEX idx_battlers_race ON battlers(race);

-- Comment on columns for documentation
COMMENT ON COLUMN battlers.gender IS 'Gender identity of the battler';
COMMENT ON COLUMN battlers.race IS 'Race/ethnicity for sprite matching and diversity';
