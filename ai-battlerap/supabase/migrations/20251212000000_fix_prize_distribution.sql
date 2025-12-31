-- Fix Prize Distribution Math Error (107% -> 100%)
--
-- The original default had:
--   winner: 0.50 (50%)
--   runner_up: 0.25 (25%)
--   semifinalists: 0.10 (10% each × 2 = 20%)
--   quarterfinalists: 0.03 (3% each × 4 = 12%)
--   TOTAL: 107%
--
-- Fixed distribution:
--   winner: 0.50 (50%)
--   runner_up: 0.20 (20%)
--   semifinalists: 0.10 (10% each × 2 = 20%)
--   quarterfinalists: 0.025 (2.5% each × 4 = 10%)
--   TOTAL: 100%

-- Update the default for new tournaments
ALTER TABLE tournaments
ALTER COLUMN prize_distribution SET DEFAULT '{
  "winner": 0.50,
  "runner_up": 0.20,
  "semifinalists": 0.10,
  "quarterfinalists": 0.025
}'::jsonb;

-- Update any existing tournaments that have the broken 107% distribution
-- Only update if they have the exact broken values
UPDATE tournaments
SET prize_distribution = '{
  "winner": 0.50,
  "runner_up": 0.20,
  "semifinalists": 0.10,
  "quarterfinalists": 0.025
}'::jsonb
WHERE prize_distribution->>'winner' = '0.50'
  AND prize_distribution->>'runner_up' = '0.25'
  AND prize_distribution->>'semifinalists' = '0.10'
  AND prize_distribution->>'quarterfinalists' = '0.03';

-- Add comment explaining the math
COMMENT ON COLUMN tournaments.prize_distribution IS
  'Percentage breakdown of prize pool. Values are per-placement:
   - winner: 1 person gets this % (e.g., 0.50 = 50%)
   - runner_up: 1 person gets this % (e.g., 0.20 = 20%)
   - semifinalists: EACH of 2 semifinalists gets this % (e.g., 0.10 × 2 = 20% total)
   - quarterfinalists: EACH of 4 quarterfinalists gets this % (e.g., 0.025 × 4 = 10% total)
   Total should equal 100% when accounting for participant counts.';
