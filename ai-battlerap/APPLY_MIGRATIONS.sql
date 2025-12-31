-- ============================================================================
-- Battle Data Enhancements - Complete Migration SQL
-- Run this in Supabase Dashboard → SQL Editor (or psql/pgAdmin)
-- ============================================================================

-- Step 1: Add attribute contribution tracking to battle_rounds
-- This tracks what % of each round came from writing vs performance
ALTER TABLE battle_rounds
ADD COLUMN IF NOT EXISTS writing_contribution NUMERIC CHECK (writing_contribution >= 0 AND writing_contribution <= 1),
ADD COLUMN IF NOT EXISTS performance_contribution NUMERIC CHECK (performance_contribution >= 0 AND performance_contribution <= 1);

COMMENT ON COLUMN battle_rounds.writing_contribution IS 'Percentage (0-1) of round score from writing attributes. Used for blog generation.';
COMMENT ON COLUMN battle_rounds.performance_contribution IS 'Percentage (0-1) of round score from performance attributes. Sum with writing_contribution = 1.0.';

-- Step 2: Add segment-level crowd reaction tracking
-- This allows us to identify which specific segments got the biggest crowd reactions
ALTER TABLE battle_segments
ADD COLUMN IF NOT EXISTS crowd_reaction INT CHECK (crowd_reaction >= 0 AND crowd_reaction <= 100);

COMMENT ON COLUMN battle_segments.crowd_reaction IS 'Segment-level crowd reaction score (0-100). Haymaker segments get +15 bonus.';

-- Step 3: Add promotion personality fields to leagues
-- These fields transform leagues into full promotion systems with distinct personalities
ALTER TABLE leagues
ADD COLUMN IF NOT EXISTS personality_style TEXT CHECK (personality_style IN ('aggressive', 'technical', 'diverse', 'street')),
ADD COLUMN IF NOT EXISTS base_payout INT DEFAULT 2000,
ADD COLUMN IF NOT EXISTS prestige_level INT DEFAULT 5 CHECK (prestige_level >= 1 AND prestige_level <= 10),
ADD COLUMN IF NOT EXISTS audience_favor_lyricism INT DEFAULT 50 CHECK (audience_favor_lyricism >= 0 AND audience_favor_lyricism <= 100),
ADD COLUMN IF NOT EXISTS audience_favor_delivery INT DEFAULT 50 CHECK (audience_favor_delivery >= 0 AND audience_favor_delivery <= 100),
ADD COLUMN IF NOT EXISTS audience_favor_storytelling INT DEFAULT 50 CHECK (audience_favor_storytelling >= 0 AND audience_favor_storytelling <= 100),
ADD COLUMN IF NOT EXISTS audience_favor_crowd_engagement INT DEFAULT 50 CHECK (audience_favor_crowd_engagement >= 0 AND audience_favor_crowd_engagement <= 100);

COMMENT ON COLUMN leagues.personality_style IS 'Cultural style: aggressive (URL-style), technical (KOTD-style), diverse, street';
COMMENT ON COLUMN leagues.base_payout IS 'Base compensation in dollars per battle';
COMMENT ON COLUMN leagues.prestige_level IS 'Prestige rating 1-10. Higher = bigger reputation gains';
COMMENT ON COLUMN leagues.audience_favor_lyricism IS 'How much audience values technical lyricism (0-100)';
COMMENT ON COLUMN leagues.audience_favor_delivery IS 'How much audience values delivery/performance (0-100)';
COMMENT ON COLUMN leagues.audience_favor_storytelling IS 'How much audience values narrative (0-100)';
COMMENT ON COLUMN leagues.audience_favor_crowd_engagement IS 'How much audience values crowd interaction (0-100)';

-- Step 4: Populate existing leagues with personality data

-- Small Room Circuit: Technical writing-focused promotion
UPDATE leagues
SET
  personality_style = 'technical',
  base_payout = 1500,
  prestige_level = 5,
  audience_favor_lyricism = 80,
  audience_favor_delivery = 60,
  audience_favor_storytelling = 70,
  audience_favor_crowd_engagement = 40
WHERE short_code = 'SMALL_ROOM';

-- Main Stage Arena: Aggressive performance-focused promotion
UPDATE leagues
SET
  personality_style = 'aggressive',
  base_payout = 3000,
  prestige_level = 7,
  audience_favor_lyricism = 50,
  audience_favor_delivery = 80,
  audience_favor_storytelling = 60,
  audience_favor_crowd_engagement = 85
WHERE short_code = 'MAIN_STAGE';

-- Verify changes
SELECT
  name,
  short_code,
  personality_style,
  base_payout,
  prestige_level,
  audience_favor_lyricism,
  audience_favor_delivery,
  audience_favor_crowd_engagement
FROM leagues
ORDER BY short_code;

-- ============================================================================
-- After running this, test with: npx tsx lib/game/balanceTestRunner.ts
-- ============================================================================
