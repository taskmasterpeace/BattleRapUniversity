/**
 * Add Regions/Cities to AI Battlers
 *
 * Maps each battler to their real-world counterpart's city/region
 */

-- ========================================
-- GOD TIER REGIONS
-- ========================================

-- The Architect (Loaded Lux) - Harlem, NY
UPDATE battlers SET region = 'Harlem, NY' WHERE stage_name = 'The Architect';

-- Tsunami Wave (Tsu Surf) - Newark, NJ
UPDATE battlers SET region = 'Newark, NJ' WHERE stage_name = 'Tsunami Wave';

-- The Nitro Puncher (Rum Nitty) - Phoenix, AZ
UPDATE battlers SET region = 'Phoenix, AZ' WHERE stage_name = 'The Nitro Puncher';

-- The Comedian (Charlie Clips) - Harlem, NY
UPDATE battlers SET region = 'The Bronx, NY' WHERE stage_name = 'The Comedian';

-- ========================================
-- TOP TIER REGIONS
-- ========================================

-- Daybreak Lit (Daylyt) - Watts/Los Angeles, CA
UPDATE battlers SET region = 'Watts, CA' WHERE stage_name = 'Daybreak Lit';

-- Compton Kingpin (Geechi Gotti) - Compton, CA
UPDATE battlers SET region = 'Compton, CA' WHERE stage_name = 'Compton Kingpin';

-- Baltimore Rocker (Tay Roc) - Baltimore, MD
UPDATE battlers SET region = 'Baltimore, MD' WHERE stage_name = 'Baltimore Rocker';

-- Hollow Victory (Hollow Da Don) - Yonkers, NY
UPDATE battlers SET region = 'Yonkers, NY' WHERE stage_name = 'Hollow Victory';

-- ========================================
-- MID TIER REGIONS
-- ========================================

-- The Titan Scribe (JC) - Pontiac, MI
UPDATE battlers SET region = 'Pontiac, MI' WHERE stage_name = 'The Titan Scribe';

-- Boston Scheme King (Chilla Jones) - Boston, MA
UPDATE battlers SET region = 'Boston, MA' WHERE stage_name = 'Boston Scheme King';

-- Freestyle Dynasty (DNA) - The Bronx, NY
UPDATE battlers SET region = 'The Bronx, NY' WHERE stage_name = 'Freestyle Dynasty';

-- Money Talk God (Goodz) - Harlem, NY
UPDATE battlers SET region = 'Harlem, NY' WHERE stage_name = 'Money Talk God';

-- Reference Vault (Ave) - Newark, NJ
UPDATE battlers SET region = 'Newark, NJ' WHERE stage_name = 'Reference Vault';

-- Showtime Holla (Hitman Holla) - St. Louis, MO
UPDATE battlers SET region = 'St. Louis, MO' WHERE stage_name = 'Showtime Holla';

-- Punch Wizard (B Magic) - St. Louis, MO
UPDATE battlers SET region = 'St. Louis, MO' WHERE stage_name = 'Punch Wizard';

-- Harlem Shiner (K-Shine) - Harlem, NY
UPDATE battlers SET region = 'Harlem, NY' WHERE stage_name = 'Harlem Shiner';

-- ========================================
-- LOW TIER REGIONS
-- ========================================

-- Tru Foe - Chicago, IL
UPDATE battlers SET region = 'Chicago, IL' WHERE stage_name = 'Tru Foe';

-- Pontiac Threat (Ill Will) - Pontiac, MI
UPDATE battlers SET region = 'Pontiac, MI' WHERE stage_name = 'Pontiac Threat';

-- Newark Aggro (O-Red) - Newark, NJ
UPDATE battlers SET region = 'Newark, NJ' WHERE stage_name = 'Newark Aggro';

-- Strategy Chess (Chess) - Philadelphia, PA
UPDATE battlers SET region = 'Philadelphia, PA' WHERE stage_name = 'Strategy Chess';

-- Island Puzzle (Mike P) - Staten Island, NY
UPDATE battlers SET region = 'Staten Island, NY' WHERE stage_name = 'Island Puzzle';

-- Brooklyn Overlooked (Cortez) - Brooklyn, NY
UPDATE battlers SET region = 'Brooklyn, NY' WHERE stage_name = 'Brooklyn Overlooked';

-- Soldier Tampa (Loso) - Tampa, FL
UPDATE battlers SET region = 'Tampa, FL' WHERE stage_name = 'Soldier Tampa';

-- Professional Prep (Prep) - Detroit, MI
UPDATE battlers SET region = 'Detroit, MI' WHERE stage_name = 'Professional Prep';

-- Veteran Journey (Real Deal) - East Orange, NJ
UPDATE battlers SET region = 'East Orange, NJ' WHERE stage_name = 'Veteran Journey';

-- Connecticut Grind (Bangz) - New Haven, CT
UPDATE battlers SET region = 'New Haven, CT' WHERE stage_name = 'Connecticut Grind';

-- Bar Fest Flow (Footz) - Newark, NJ
UPDATE battlers SET region = 'Newark, NJ' WHERE stage_name = 'Bar Fest Flow';

-- Philly Prospect (Tex Saygo) - Philadelphia, PA
UPDATE battlers SET region = 'Philadelphia, PA' WHERE stage_name = 'Philly Prospect';

-- ========================================
-- Summary Output
-- ========================================

DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count FROM battlers WHERE is_ai = true AND region IS NOT NULL AND region != '';

  RAISE NOTICE '╔═══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║              BATTLER REGIONS ADDED ✅                         ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'Total battlers with regions: %', updated_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Regions by Area:';
  RAISE NOTICE '  NEW YORK:';
  RAISE NOTICE '    - Harlem, NY (The Architect, Money Talk God, Harlem Shiner)';
  RAISE NOTICE '    - The Bronx, NY (The Comedian, Freestyle Dynasty)';
  RAISE NOTICE '    - Brooklyn, NY (Brooklyn Overlooked)';
  RAISE NOTICE '    - Staten Island, NY (Island Puzzle)';
  RAISE NOTICE '    - Yonkers, NY (Hollow Victory)';
  RAISE NOTICE '';
  RAISE NOTICE '  NEW JERSEY:';
  RAISE NOTICE '    - Newark, NJ (Tsunami Wave, Reference Vault, Newark Aggro, Bar Fest Flow)';
  RAISE NOTICE '    - East Orange, NJ (Veteran Journey)';
  RAISE NOTICE '';
  RAISE NOTICE '  CALIFORNIA:';
  RAISE NOTICE '    - Compton, CA (Compton Kingpin)';
  RAISE NOTICE '    - Watts, CA (Daybreak Lit)';
  RAISE NOTICE '';
  RAISE NOTICE '  MICHIGAN:';
  RAISE NOTICE '    - Pontiac, MI (The Titan Scribe, Pontiac Threat)';
  RAISE NOTICE '    - Detroit, MI (Professional Prep)';
  RAISE NOTICE '';
  RAISE NOTICE '  MIDWEST:';
  RAISE NOTICE '    - St. Louis, MO (Showtime Holla, Punch Wizard)';
  RAISE NOTICE '    - Chicago, IL (Tru Foe)';
  RAISE NOTICE '';
  RAISE NOTICE '  EAST COAST:';
  RAISE NOTICE '    - Philadelphia, PA (Strategy Chess, Philly Prospect)';
  RAISE NOTICE '    - Boston, MA (Boston Scheme King)';
  RAISE NOTICE '    - Baltimore, MD (Baltimore Rocker)';
  RAISE NOTICE '    - New Haven, CT (Connecticut Grind)';
  RAISE NOTICE '';
  RAISE NOTICE '  SOUTHWEST:';
  RAISE NOTICE '    - Phoenix, AZ (The Nitro Puncher)';
  RAISE NOTICE '';
  RAISE NOTICE '  SOUTH:';
  RAISE NOTICE '    - Tampa, FL (Soldier Tampa)';
END $$;
