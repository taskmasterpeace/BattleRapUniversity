/**
 * Battle Progression Tracking
 *
 * Stores before/after snapshots of battler progression for each battle.
 * Used to display post-battle summary showing attribute changes, rating changes,
 * badges earned, stress changes, view counts, and fan growth.
 */

-- ============================================================================
-- BATTLE PROGRESSION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS battle_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- References
  battle_id UUID NOT NULL UNIQUE REFERENCES battles(id) ON DELETE CASCADE,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- Rating Changes
  rating_before INTEGER NOT NULL,
  rating_after INTEGER NOT NULL,
  rating_change INTEGER NOT NULL,

  -- Attribute Changes (JSONB for flexibility)
  -- Structure: { "lyricism": { "before": 5.0, "after": 5.05, "change": 0.05 }, ... }
  attribute_changes JSONB NOT NULL DEFAULT '{}',

  -- Badges Earned (array of badge keys)
  badges_earned TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Stress Changes
  stress_before INTEGER NOT NULL DEFAULT 0,
  stress_after INTEGER NOT NULL DEFAULT 0,
  stress_change INTEGER NOT NULL DEFAULT 0,

  -- View Data (denormalized for quick access)
  total_views INTEGER NOT NULL DEFAULT 0,
  view_tier TEXT NOT NULL DEFAULT 'low' CHECK (view_tier IN ('low', 'mid', 'top', 'goat')),

  -- Fan Growth
  fans_before INTEGER NOT NULL DEFAULT 0,
  fans_after INTEGER NOT NULL DEFAULT 0,
  fans_gained INTEGER NOT NULL DEFAULT 0,

  -- Trending Score Change
  trending_before NUMERIC NOT NULL DEFAULT 0.0,
  trending_after NUMERIC NOT NULL DEFAULT 0.0,
  trending_change NUMERIC NOT NULL DEFAULT 0.0
);

CREATE INDEX IF NOT EXISTS idx_battle_progression_battle ON battle_progression(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_progression_battler ON battle_progression(battler_id);

COMMENT ON TABLE battle_progression IS 'Stores before/after progression data for each battle';
COMMENT ON COLUMN battle_progression.attribute_changes IS 'JSONB storing all attribute changes with before/after/change values';
COMMENT ON COLUMN battle_progression.badges_earned IS 'Array of badge keys earned in this battle';
COMMENT ON COLUMN battle_progression.fans_gained IS 'Net fan growth from this battle (can be negative)';
