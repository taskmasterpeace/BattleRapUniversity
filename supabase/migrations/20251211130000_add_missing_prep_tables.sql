/**
 * Add Missing Prep Tables
 *
 * Creates prep_segments and prep_counters tables that are referenced
 * by the round prep system but were never created.
 */

-- ========================================
-- PREP SEGMENTS TABLE
-- ========================================
-- Tracks individual prepared segments for a battle
CREATE TABLE IF NOT EXISTS prep_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- Position in the round
  round_num INTEGER,  -- 1, 2, or 3 (null if unassigned)
  position INTEGER,   -- Order within the round (null if unassigned)

  -- Content type (what angle/approach)
  content_type TEXT NOT NULL DEFAULT 'bars',  -- bars, angle, rebuttal, freestyle, personals
  delivery_type TEXT NOT NULL DEFAULT 'standard',  -- aggressive, smooth, technical, comedic
  performance_type TEXT NOT NULL DEFAULT 'normal',  -- haymaker, setup, closer, opener

  -- Prep status
  is_freestyle BOOLEAN NOT NULL DEFAULT false,
  is_counter BOOLEAN NOT NULL DEFAULT false,
  counter_target TEXT,  -- What opponent content this counters
  is_written BOOLEAN NOT NULL DEFAULT false,
  is_rehearsed BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prep_segments_battle ON prep_segments(battle_id);
CREATE INDEX IF NOT EXISTS idx_prep_segments_battler ON prep_segments(battler_id);

-- ========================================
-- PREP COUNTERS TABLE
-- ========================================
-- Tracks prepared counter/rebuttal setups
CREATE TABLE IF NOT EXISTS prep_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- What content this counter anticipates
  anticipated_content TEXT NOT NULL,  -- e.g., "angle about my losses"

  -- The prepared segment that will be used as the counter
  segment_id UUID REFERENCES prep_segments(id) ON DELETE SET NULL,

  -- Battle outcome tracking
  was_triggered BOOLEAN,  -- Did opponent actually use this angle?
  was_effective BOOLEAN,  -- Did the counter land well?

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prep_counters_battle ON prep_counters(battle_id);
CREATE INDEX IF NOT EXISTS idx_prep_counters_battler ON prep_counters(battler_id);

-- ========================================
-- RLS POLICIES
-- ========================================
ALTER TABLE prep_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prep_counters ENABLE ROW LEVEL SECURITY;

-- Anyone can read prep segments (for battle display)
CREATE POLICY "Anyone can read prep segments" ON prep_segments
  FOR SELECT USING (TRUE);

-- Users can manage their own prep segments
CREATE POLICY "Users can manage own prep segments" ON prep_segments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM battlers
      WHERE battlers.id = prep_segments.battler_id
      AND battlers.user_id = auth.uid()
    )
  );

-- Anyone can read counters
CREATE POLICY "Anyone can read prep counters" ON prep_counters
  FOR SELECT USING (TRUE);

-- Users can manage their own counters
CREATE POLICY "Users can manage own prep counters" ON prep_counters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM battlers
      WHERE battlers.id = prep_counters.battler_id
      AND battlers.user_id = auth.uid()
    )
  );

-- ========================================
-- Summary
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '╔═══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║         MISSING PREP TABLES CREATED ✅                        ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'Created tables:';
  RAISE NOTICE '  • prep_segments - Track prepared content segments';
  RAISE NOTICE '  • prep_counters - Track prepared counter/rebuttals';
  RAISE NOTICE '';
END $$;
