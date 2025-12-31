-- Add crowd demographics to leagues table
-- This allows different leagues to have different racial/demographic crowd compositions
-- Used to select appropriate crowd reaction sprites based on league's audience

ALTER TABLE leagues
ADD COLUMN crowd_demographics JSONB DEFAULT '{
  "black": 0.5,
  "white": 0.3,
  "mixed": 0.2
}'::jsonb;

COMMENT ON COLUMN leagues.crowd_demographics IS 'Demographic breakdown of league crowd (black, white, mixed). Used to weight sprite selection for crowd reactions. Values should sum to 1.0.';

-- Update existing leagues with realistic demographic breakdowns
UPDATE leagues
SET crowd_demographics = '{
  "black": 0.75,
  "white": 0.10,
  "mixed": 0.15
}'::jsonb
WHERE name = 'Small Room Circuit';

UPDATE leagues
SET crowd_demographics = '{
  "black": 0.40,
  "white": 0.40,
  "mixed": 0.20
}'::jsonb
WHERE name = 'Main Stage Arena';

-- Note: Future leagues can have different demographics
-- Examples:
--   International league: {"black": 0.2, "white": 0.3, "mixed": 0.5}
--   Underground league: {"black": 0.85, "white": 0.05, "mixed": 0.1}
--   Commercial league: {"black": 0.3, "white": 0.5, "mixed": 0.2}
