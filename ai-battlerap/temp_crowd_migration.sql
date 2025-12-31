-- Add crowd demographics to leagues
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS crowd_demographics JSONB DEFAULT '{"black": 0.5, "white": 0.3, "mixed": 0.2}'::jsonb;

-- Update Small Room Circuit
UPDATE leagues SET crowd_demographics = '{"black": 0.75, "white": 0.10, "mixed": 0.15}'::jsonb WHERE name = 'Small Room Circuit';

-- Update Main Stage Arena
UPDATE leagues SET crowd_demographics = '{"black": 0.40, "white": 0.40, "mixed": 0.20}'::jsonb WHERE name = 'Main Stage Arena';

-- Verify
SELECT name, crowd_demographics FROM leagues;
