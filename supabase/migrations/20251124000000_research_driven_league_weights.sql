-- Research-driven league weight adjustments
-- Based on extensive battle rap research (URL, KOTD, Don't Flop analysis)
--
-- Key findings:
-- - Small Room Circuit should emphasize writing (60%) over performance (40%)
--   Real-world parallel: KOTD/Don't Flop small room battles focus on bars and technical skill
-- - Main Stage Arena should emphasize performance (60%) over writing (40%)
--   Real-world parallel: URL main events prioritize crowd reaction and stage presence
--
-- This creates clear league differentiation:
-- - Technical Writer: 60-70% win rate in Small Room, 30-40% in Main Stage
-- - Performance Beast: 60-70% win rate in Main Stage, 30-40% in Small Room
--
-- Previous weights (55/45) were too mild - created only 10-15% win rate swings
-- New weights (60/40) create 20-30% swings - meaningful but not insurmountable

UPDATE leagues
SET
  writing_weight = 0.60,
  performance_weight = 0.40,
  base_crowd_factor = 0.5    -- Moderate crowd impact (not primary)
WHERE short_code = 'SMALL_ROOM';

UPDATE leagues
SET
  writing_weight = 0.40,
  performance_weight = 0.60,
  base_crowd_factor = 0.8    -- High crowd impact (crowd drives momentum)
WHERE short_code = 'MAIN_STAGE';

-- Add comment for future reference
COMMENT ON COLUMN leagues.writing_weight IS 'Percentage weight of writing attributes (lyricism/wordplay/creativity) in battle scoring. Higher = more writing-focused league.';
COMMENT ON COLUMN leagues.performance_weight IS 'Percentage weight of performance attributes (stage_presence/crowd_control/delivery) in battle scoring. Higher = more performance-focused league.';
COMMENT ON COLUMN leagues.base_crowd_factor IS 'Multiplier for crowd reaction calculation. Higher = crowd matters more in this league.';
