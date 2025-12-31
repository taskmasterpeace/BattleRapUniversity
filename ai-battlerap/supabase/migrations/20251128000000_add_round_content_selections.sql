/**
 * Round Content Selection System - Database Schema
 *
 * Enables "Locked In" mode where players manually select content/delivery/performance
 * types for each round, versus auto-simulation.
 *
 * Key Features:
 * - Store content selections per battler per round
 * - Support both manual selection (locked in) and auto-selection (AI/auto-mode)
 * - Track battle state for round-by-round progression
 */

-- =====================================================
-- TABLE: round_content_selections
-- =====================================================

CREATE TABLE round_content_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  round_index INT NOT NULL CHECK (round_index BETWEEN 1 AND 3),

  -- Content selections (3-4 content types from 14 options)
  content_types TEXT[] NOT NULL DEFAULT '{}',

  -- Delivery selections (1-2 delivery types from 7 options)
  delivery_types TEXT[] NOT NULL DEFAULT '{}',

  -- Performance selections (1-2 performance types from 8 options)
  performance_types TEXT[] NOT NULL DEFAULT '{}',

  -- Metadata
  auto_selected BOOLEAN NOT NULL DEFAULT false, -- AI auto-selected vs manual
  effectiveness_multiplier NUMERIC, -- Calculated effectiveness vs opponent
  crowd_preference_multiplier NUMERIC, -- Calculated crowd preference
  context_modifier NUMERIC, -- Calculated context modifier (in building/on cam)

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE (battle_id, battler_id, round_index),

  -- Validation constraints
  CHECK (array_length(content_types, 1) BETWEEN 3 AND 4),
  CHECK (array_length(delivery_types, 1) BETWEEN 1 AND 2),
  CHECK (array_length(performance_types, 1) BETWEEN 1 AND 2)
);

-- Indexes
CREATE INDEX idx_round_content_selections_battle ON round_content_selections(battle_id);
CREATE INDEX idx_round_content_selections_battler ON round_content_selections(battler_id);
CREATE INDEX idx_round_content_selections_round ON round_content_selections(battle_id, round_index);

-- RLS Policies
ALTER TABLE round_content_selections ENABLE ROW LEVEL SECURITY;

-- Users can view round content selections for their own battles
CREATE POLICY round_content_selections_view_own ON round_content_selections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM battles b
      INNER JOIN battlers bt ON bt.id = b.battler_player_id
      WHERE b.id = battle_id AND bt.user_id = auth.uid()
    )
  );

-- Users can insert/update round content selections for their own battler
CREATE POLICY round_content_selections_insert_own ON round_content_selections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM battlers bt
      WHERE bt.id = battler_id AND bt.user_id = auth.uid()
    )
  );

CREATE POLICY round_content_selections_update_own ON round_content_selections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM battlers bt
      WHERE bt.id = battler_id AND bt.user_id = auth.uid()
    )
  );

-- =====================================================
-- MODIFY: battles table
-- =====================================================

-- Add player_locked_in flag to battles table
ALTER TABLE battles
  ADD COLUMN player_locked_in BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN current_round_index INT CHECK (current_round_index BETWEEN 1 AND 3),
  ADD COLUMN context TEXT CHECK (context IN ('in_building', 'ppv', 'on_cam')) DEFAULT 'ppv';

-- Comment
COMMENT ON COLUMN battles.player_locked_in IS 'Player chose "Locked In" mode (manual content selection per round) vs auto-simulation';
COMMENT ON COLUMN battles.current_round_index IS 'Current round being prepared/simulated in locked-in mode';
COMMENT ON COLUMN battles.context IS 'Scoring context: in_building, ppv, or on_cam (affects content effectiveness)';

-- =====================================================
-- MODIFY: battle status for locked-in flow
-- =====================================================

-- Update status check constraint to include new states
ALTER TABLE battles DROP CONSTRAINT IF EXISTS battles_status_check;
ALTER TABLE battles ADD CONSTRAINT battles_status_check CHECK (
  status IN (
    'offered',
    'accepted',
    'locked',
    'awaiting_lock_in_choice',  -- NEW: After prep lock, waiting for player to choose locked-in vs auto
    'awaiting_r1_content',      -- NEW: Waiting for round 1 content selection
    'r1_simulated',             -- NEW: Round 1 completed
    'awaiting_r2_content',      -- NEW: Waiting for round 2 content selection
    'r2_simulated',             -- NEW: Round 2 completed
    'awaiting_r3_content',      -- NEW: Waiting for round 3 content selection
    'r3_simulated',             -- NEW: Round 3 completed
    'simulated',
    'completed',
    'cancelled',
    'no_show'
  )
);

-- =====================================================
-- MODIFY: battle_rounds table
-- =====================================================

-- Add content metadata to battle_rounds
ALTER TABLE battle_rounds
  ADD COLUMN content_types TEXT[] DEFAULT '{}',
  ADD COLUMN delivery_types TEXT[] DEFAULT '{}',
  ADD COLUMN performance_types TEXT[] DEFAULT '{}',
  ADD COLUMN effectiveness_multiplier NUMERIC,
  ADD COLUMN crowd_preference_multiplier NUMERIC,
  ADD COLUMN context_modifier NUMERIC,
  ADD COLUMN final_multiplier NUMERIC; -- Combined multiplier (effectiveness × crowd × context)

-- Comment
COMMENT ON COLUMN battle_rounds.content_types IS 'Content types used in this round (from round_content_selections)';
COMMENT ON COLUMN battle_rounds.delivery_types IS 'Delivery types used in this round';
COMMENT ON COLUMN battle_rounds.performance_types IS 'Performance types used in this round';
COMMENT ON COLUMN battle_rounds.effectiveness_multiplier IS 'Pokémon-style effectiveness (2.0x super, 1.0x neutral, 0.5x weak)';
COMMENT ON COLUMN battle_rounds.crowd_preference_multiplier IS 'League crowd demographic preference multiplier';
COMMENT ON COLUMN battle_rounds.context_modifier IS 'In building vs on cam scoring modifier';
COMMENT ON COLUMN battle_rounds.final_multiplier IS 'Combined effectiveness × crowd × context multiplier';

-- =====================================================
-- FUNCTION: Auto-update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_round_content_selections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER round_content_selections_updated_at
  BEFORE UPDATE ON round_content_selections
  FOR EACH ROW
  EXECUTE FUNCTION update_round_content_selections_updated_at();
