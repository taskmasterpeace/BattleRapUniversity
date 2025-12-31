-- ============================================================================
-- Migration: Add Sprite Image Columns
-- Date: 2025-12-01
-- Purpose: Attach 1,856 sprite images to database records
-- ============================================================================

-- ============================================================================
-- PHASE 1: Add Image Columns to Existing Tables
-- ============================================================================

-- Leagues table: Add logo and icon columns
ALTER TABLE leagues
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS icon_url TEXT;

COMMENT ON COLUMN leagues.logo_url IS 'Path to league logo sprite: /sprites/leagues/[subdir]/[league_name].png';
COMMENT ON COLUMN leagues.icon_url IS 'Path to league icon sprite for quick reference UI';

-- Cities table: Add background and skyline columns
ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS background_url TEXT,
  ADD COLUMN IF NOT EXISTS skyline_url TEXT;

COMMENT ON COLUMN cities.background_url IS 'Path to city background: /sprites/cities/[region]/[city_name].png. Regions: east-coast, west-coast, midwest, south, canada';
COMMENT ON COLUMN cities.skyline_url IS 'Alternative skyline variant for dynamic scene generation';

-- Badge Costs table: Add icon column
ALTER TABLE badge_costs
  ADD COLUMN IF NOT EXISTS icon_url TEXT;

COMMENT ON COLUMN badge_costs.icon_url IS 'Path to badge icon: /sprites/badges/[subdir]/badge_[001-120].png. Organized: 001-040 (content), 041-080 (positive), 081-120 (negative)';

-- ============================================================================
-- PHASE 2: Create Crowd Reactions Table (NEW)
-- ============================================================================

CREATE TABLE IF NOT EXISTS crowd_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  reaction_code TEXT NOT NULL UNIQUE,
  reaction_name TEXT NOT NULL,

  -- Demographics and reaction type
  demographic TEXT NOT NULL CHECK (demographic IN ('black', 'white', 'mixed', 'any')),
  reaction_type TEXT NOT NULL CHECK (reaction_type IN (
    'hype', 'cheer', 'laugh', 'stunned',
    'watch', 'record', 'think', 'talk', 'listen',
    'boo', 'cringe', 'disappointed', 'unimpressed', 'bored', 'leave',
    'confused', 'pause', 'erupt'
  )),

  -- Sprite attachment
  sprite_url TEXT NOT NULL,
  variant_number INT DEFAULT 1 CHECK (variant_number >= 1),

  -- Categorization for battle simulation
  emotional_polarity TEXT NOT NULL CHECK (emotional_polarity IN ('positive', 'neutral', 'negative')),
  intensity_level INT DEFAULT 3 CHECK (intensity_level BETWEEN 1 AND 5),

  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Uniqueness: only one sprite per demographic + reaction + variant combo
  UNIQUE(demographic, reaction_type, variant_number)
);

COMMENT ON TABLE crowd_reactions IS 'Crowd reaction sprites (580 total) organized by demographic and reaction type. Used in battle simulation for crowd composition and media generation.';
COMMENT ON COLUMN crowd_reactions.demographic IS 'black (~70%), white (~15%), mixed (~15%), or any (universal)';
COMMENT ON COLUMN crowd_reactions.reaction_type IS 'Emotional response category: positive (hype, cheer, laugh, stunned), neutral (watch, record, think, talk, listen), negative (boo, cringe, etc.), special (pause, erupt, confused)';
COMMENT ON COLUMN crowd_reactions.intensity_level IS '1-5 scale: 1=subtle, 5=extreme. Used for weighting in crowd reaction calculations.';
COMMENT ON COLUMN crowd_reactions.sprite_url IS 'Path to crowd sprite: /sprites/crowd/[reaction_type]/crowd_[demographic]_[reaction_type]_[variant].png';

-- Indexes for crowd reactions table
CREATE INDEX idx_crowd_reactions_type ON crowd_reactions(reaction_type);
CREATE INDEX idx_crowd_reactions_demographic ON crowd_reactions(demographic);
CREATE INDEX idx_crowd_reactions_polarity ON crowd_reactions(emotional_polarity);
CREATE INDEX idx_crowd_reactions_intensity ON crowd_reactions(intensity_level);

-- ============================================================================
-- PHASE 3: Enable RLS and Set Policies (Crowd Reactions)
-- ============================================================================

ALTER TABLE crowd_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read crowd reactions" ON crowd_reactions
  FOR SELECT USING (TRUE);

COMMENT ON POLICY "Anyone can read crowd reactions" ON crowd_reactions
  IS 'Crowd reactions are public data used in battle simulation and media generation';

-- ============================================================================
-- PHASE 4: Validation and Helper Functions
-- ============================================================================

-- Function: Check image URL coverage
CREATE OR REPLACE FUNCTION check_image_url_coverage()
RETURNS TABLE (
  table_name TEXT,
  total_records INT,
  with_images INT,
  coverage_percent NUMERIC
) AS $$
DECLARE
  battlers_total INT;
  battlers_with_avatar INT;
  leagues_total INT;
  leagues_with_logo INT;
  cities_total INT;
  cities_with_background INT;
  badges_total INT;
  badges_with_icon INT;
  crowd_total INT;
BEGIN
  -- Battlers
  SELECT COUNT(*) INTO battlers_total FROM battlers;
  SELECT COUNT(*) INTO battlers_with_avatar FROM battlers WHERE avatar_url IS NOT NULL;

  -- Leagues
  SELECT COUNT(*) INTO leagues_total FROM leagues;
  SELECT COUNT(*) INTO leagues_with_logo FROM leagues WHERE logo_url IS NOT NULL;

  -- Cities
  SELECT COUNT(*) INTO cities_total FROM cities;
  SELECT COUNT(*) INTO cities_with_background FROM cities WHERE background_url IS NOT NULL;

  -- Badges
  SELECT COUNT(*) INTO badges_total FROM badge_costs;
  SELECT COUNT(*) INTO badges_with_icon FROM badge_costs WHERE icon_url IS NOT NULL;

  -- Crowd Reactions
  SELECT COUNT(*) INTO crowd_total FROM crowd_reactions;

  -- Return results
  RETURN QUERY
  VALUES
    ('battlers', battlers_total, battlers_with_avatar, ROUND((battlers_with_avatar::NUMERIC / NULLIF(battlers_total, 0)) * 100, 2)),
    ('leagues', leagues_total, leagues_with_logo, ROUND((leagues_with_logo::NUMERIC / NULLIF(leagues_total, 0)) * 100, 2)),
    ('cities', cities_total, cities_with_background, ROUND((cities_with_background::NUMERIC / NULLIF(cities_total, 0)) * 100, 2)),
    ('badges', badges_total, badges_with_icon, ROUND((badges_with_icon::NUMERIC / NULLIF(badges_total, 0)) * 100, 2)),
    ('crowd_reactions', crowd_total, crowd_total, 100.00);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_image_url_coverage IS 'Returns coverage report for image URL population across all tables. Usage: SELECT * FROM check_image_url_coverage();';

-- ============================================================================
-- PHASE 5: Seed Initial Data (Optional - Example)
-- ============================================================================

-- NOTE: Actual data seeding is done via separate bulk attachment script
-- This is just a template showing the expected format

-- Example: If you have a badge with code 'wordplay_wizard'
-- INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative, icon_url)
-- VALUES ('wordplay_wizard_icon', 'Wordplay Wizard', 'silver', 'writing', 6, false, '/sprites/badges/image_1764193677602/badge_041.png')
-- ON CONFLICT (badge_code) DO UPDATE SET icon_url = EXCLUDED.icon_url;

-- Example: If you have a crowd reaction category
-- INSERT INTO crowd_reactions (reaction_code, reaction_name, demographic, reaction_type, sprite_url, emotional_polarity, intensity_level)
-- VALUES
--   ('black_hype_001', 'Black Hype #1', 'black', 'hype', '/sprites/crowd/hype/crowd_black_hype_001.png', 'positive', 5),
--   ('white_watch_001', 'White Watch #1', 'white', 'watch', '/sprites/crowd/watch/crowd_white_watch_001.png', 'neutral', 2);

-- ============================================================================
-- VERIFICATION QUERIES (Run after population)
-- ============================================================================

/*
-- Check coverage
SELECT * FROM check_image_url_coverage();

-- Find battlers without avatars
SELECT id, stage_name, tier FROM battlers WHERE avatar_url IS NULL LIMIT 10;

-- Find leagues without logos
SELECT id, name, short_code FROM leagues WHERE logo_url IS NULL;

-- Find cities without backgrounds
SELECT id, name, scene_size FROM cities WHERE background_url IS NULL;

-- Find badges without icons
SELECT id, badge_code, badge_name FROM badge_costs WHERE icon_url IS NULL LIMIT 10;

-- Count crowd reactions by type
SELECT reaction_type, demographic, COUNT(*) as count
FROM crowd_reactions
GROUP BY reaction_type, demographic
ORDER BY reaction_type, demographic;
*/

-- ============================================================================
-- Migration Status
-- ============================================================================

-- This migration:
-- ✅ Adds image columns to leagues, cities, badge_costs
-- ✅ Creates crowd_reactions table (new)
-- ✅ Enables RLS on crowd_reactions
-- ✅ Creates validation function
-- ⏳ Data population (handled by bulk attachment script)

-- Expected state after bulk attachment:
-- - Battlers: 920/920 avatars (100%) - already seeded
-- - Leagues: 2/2+ logos (100% when populated)
-- - Cities: 10/10 backgrounds (100% when populated)
-- - Badges: 120/120 icons (100% when populated)
-- - Crowd Reactions: 580 sprites (100% when seeded)
-- - Total: 1,856 sprites attached
