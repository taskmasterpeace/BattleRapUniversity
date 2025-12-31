/**
 * Rename Battlers with Tougher, More Authentic Names
 *
 * Per user request - give battlers names with more personality and feel
 */

-- ========================================
-- NAME CHANGES (Tougher Authentic Names)
-- ========================================

-- Gun Gun - intimidating double-barrel vibe
UPDATE battlers SET stage_name = 'Gun Gun' WHERE stage_name = 'Freestyle Dynasty';

-- Tomorrow Man - mysterious, forward-thinking
UPDATE battlers SET stage_name = 'Tomorrow Man' WHERE stage_name = 'Punch Wizard';

-- Rough House - aggressive, physical energy
UPDATE battlers SET stage_name = 'Rough House' WHERE stage_name = 'Money Talk God';

-- Pottsville Pete - small town fighter
UPDATE battlers SET stage_name = 'Pottsville Pete' WHERE stage_name = 'Soldier Tampa';

-- Bar-Berian - barbarian wordplay, bar killer
UPDATE battlers SET stage_name = 'Bar-Berian' WHERE stage_name = 'Strategy Chess';

-- Snakeskin - cold, slithery, dangerous
UPDATE battlers SET stage_name = 'Snakeskin' WHERE stage_name = 'Connecticut Grind';

-- Kwame Asante - strong African name (Ghanaian origin)
UPDATE battlers SET stage_name = 'Kwame Asante' WHERE stage_name = 'Philly Prospect';

-- Daniel Williamson - regular government name, keeping it real
UPDATE battlers SET stage_name = 'Daniel Williamson' WHERE stage_name = 'Professional Prep';

-- ========================================
-- Summary Output
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '╔═══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║           BATTLERS RENAMED WITH TOUGHER NAMES ✅              ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'Name Changes:';
  RAISE NOTICE '  • Freestyle Dynasty → Gun Gun';
  RAISE NOTICE '  • Punch Wizard → Tomorrow Man';
  RAISE NOTICE '  • Money Talk God → Rough House';
  RAISE NOTICE '  • Soldier Tampa → Pottsville Pete';
  RAISE NOTICE '  • Strategy Chess → Bar-Berian';
  RAISE NOTICE '  • Connecticut Grind → Snakeskin';
  RAISE NOTICE '  • Philly Prospect → Kwame Asante';
  RAISE NOTICE '  • Professional Prep → Daniel Williamson';
  RAISE NOTICE '';
  RAISE NOTICE 'All names updated! 🔥';
END $$;
