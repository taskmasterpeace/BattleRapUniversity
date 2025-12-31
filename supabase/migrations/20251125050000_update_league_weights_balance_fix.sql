-- ============================================================================
-- Balance Fix: Update League Weights (Per Playtest Findings)
-- ============================================================================
--
-- Playtest Issue: 50% upset rate (target: 10-20%)
-- Root Cause: League weights not differentiated enough
--
-- Small Room should heavily favor writing (technical battles)
-- Main Stage should heavily favor performance (crowd energy)
--
-- Research validation: Small rooms allow "intricate lines more palpable"
-- Main Stage: "Performance dominates if far from stage"
-- ============================================================================

-- Update Small Room Circuit: Favor writing heavily
UPDATE leagues
SET
  writing_weight = 0.70,      -- UP from ~0.55
  performance_weight = 0.30   -- DOWN from ~0.45
WHERE short_code = 'SRC';

-- Update Main Stage Arena: Favor performance heavily
UPDATE leagues
SET
  writing_weight = 0.30,      -- DOWN from ~0.45
  performance_weight = 0.70   -- UP from ~0.55
WHERE short_code = 'MSA';

-- Verify the changes
SELECT
  name,
  short_code,
  writing_weight,
  performance_weight,
  base_crowd_factor,
  round_length_minutes
FROM leagues
ORDER BY short_code;

-- Expected output:
-- Small Room Circuit (SRC): 0.70 writing, 0.30 performance
-- Main Stage Arena (MSA): 0.30 writing, 0.70 performance
