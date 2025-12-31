/**
 * Fix battle_progression UNIQUE Constraint
 *
 * CRITICAL SCHEMA BUG (C8):
 * - Current: UNIQUE(battle_id) - only one progression record per battle
 * - Problem: Each battle has TWO battlers (player + AI)
 * - Impact: Second insert fails, AI progression data lost
 * - Solution: Composite UNIQUE(battle_id, battler_id)
 */

-- Remove the single-column UNIQUE constraint
ALTER TABLE battle_progression
  DROP CONSTRAINT IF EXISTS battle_progression_battle_id_key;

-- Add composite UNIQUE constraint (battle_id + battler_id)
-- This allows TWO progression records per battle (one per battler)
ALTER TABLE battle_progression
  ADD CONSTRAINT battle_progression_battle_battler_unique
  UNIQUE (battle_id, battler_id);

-- Update index for better query performance
DROP INDEX IF EXISTS idx_battle_progression_battle;

CREATE INDEX idx_battle_progression_battle_battler
  ON battle_progression(battle_id, battler_id);

-- Additional index for queries by battler
CREATE INDEX IF NOT EXISTS idx_battle_progression_battler
  ON battle_progression(battler_id);

COMMENT ON CONSTRAINT battle_progression_battle_battler_unique ON battle_progression IS
  'Allows one progression record per battler per battle (player + AI)';
