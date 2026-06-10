-- ═══════════════════════════════════════════════════════════════════════════
-- BATTLE PROGRESSION: ONE ROW PER (BATTLE, BATTLER)
--
-- The original table had UNIQUE(battle_id) because every battle had exactly
-- one human (the player side). Async PvP battles have humans on BOTH sides
-- and each gets their own progression snapshot — the second insert silently
-- violated the unique constraint and was dropped.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE battle_progression
  DROP CONSTRAINT IF EXISTS battle_progression_battle_id_key;

ALTER TABLE battle_progression
  DROP CONSTRAINT IF EXISTS battle_progression_battle_battler_key;

ALTER TABLE battle_progression
  ADD CONSTRAINT battle_progression_battle_battler_key UNIQUE (battle_id, battler_id);
