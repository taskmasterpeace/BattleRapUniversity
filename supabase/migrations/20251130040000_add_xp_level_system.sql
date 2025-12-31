/**
 * XP and Level System
 *
 * Adds career progression tracking through XP (experience points) and levels.
 * Players earn XP from battles based on performance, with level-ups awarding skill points.
 *
 * XP Formula:
 * - Base: 100 XP per battle
 * - Win bonus: +50 XP
 * - Margin of victory: 3-0 (+75 XP), 2-1 (+25 XP)
 * - Performance bonuses: Haymakers (+30 each), Perfect consistency (+40), Dominant crowd (+25)
 * - Career milestones: 10th battle (+200), 25th (+500), 50th (+1000), 100th (+2500)
 *
 * Level Progression:
 * - Max level: 30
 * - XP curve: 500 * (level^1.5)
 * - Total to max: ~135,000 XP (~180-220 battles)
 * - Skill points: 2 per level-up (can boost attributes)
 */

-- ============================================================================
-- ADD XP/LEVEL FIELDS TO BATTLERS
-- ============================================================================

ALTER TABLE battlers
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 30),
  ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
  ADD COLUMN IF NOT EXISTS current_level_xp INTEGER DEFAULT 0 CHECK (current_level_xp >= 0),
  ADD COLUMN IF NOT EXISTS skill_points_available INTEGER DEFAULT 0 CHECK (skill_points_available >= 0),
  ADD COLUMN IF NOT EXISTS skill_points_spent JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN battlers.level IS 'Current career level (1-30). Increases as total_xp reaches thresholds.';
COMMENT ON COLUMN battlers.total_xp IS 'Total XP earned across career. Never decreases.';
COMMENT ON COLUMN battlers.current_level_xp IS 'XP progress toward next level. Resets on level-up.';
COMMENT ON COLUMN battlers.skill_points_available IS 'Unspent skill points from level-ups (2 per level).';
COMMENT ON COLUMN battlers.skill_points_spent IS 'JSONB mapping attribute names to skill points spent (max 10 per attribute).';

-- Create index for level-based queries (leaderboards, tier matchmaking)
CREATE INDEX IF NOT EXISTS idx_battlers_level ON battlers(level DESC, total_xp DESC);

-- ============================================================================
-- XP HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- References
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,

  -- XP Data
  xp_earned INTEGER NOT NULL CHECK (xp_earned >= 0),
  source TEXT NOT NULL, -- 'battle_win', 'battle_loss', 'haymaker', 'milestone', 'tournament_win', etc.

  -- Breakdown (optional JSONB for detailed tracking)
  xp_breakdown JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_xp_history_battler ON xp_history(battler_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_history_battle ON xp_history(battle_id);

COMMENT ON TABLE xp_history IS 'Tracks all XP gains for battlers. Useful for displaying career progression timeline.';
COMMENT ON COLUMN xp_history.source IS 'Category of XP gain: battle_win, battle_loss, haymaker, milestone, tournament, etc.';
COMMENT ON COLUMN xp_history.xp_breakdown IS 'Optional detailed breakdown: { base: 100, win_bonus: 50, haymaker: 30, ... }';

-- ============================================================================
-- ADD XP DATA TO BATTLE_PROGRESSION
-- ============================================================================

ALTER TABLE battle_progression
  ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
  ADD COLUMN IF NOT EXISTS xp_breakdown JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS level_before INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS level_after INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS skill_points_earned INTEGER DEFAULT 0;

COMMENT ON COLUMN battle_progression.xp_earned IS 'Total XP earned from this battle';
COMMENT ON COLUMN battle_progression.xp_breakdown IS 'Detailed XP breakdown: { base: 100, win_bonus: 50, haymaker: 60, ... }';
COMMENT ON COLUMN battle_progression.level_before IS 'Player level before battle';
COMMENT ON COLUMN battle_progression.level_after IS 'Player level after battle (may have leveled up)';
COMMENT ON COLUMN battle_progression.skill_points_earned IS 'Skill points earned from level-ups in this battle (0, 2, 4, etc.)';
