-- GAME-DAY FOUNDATION — action-based career clock (TIME_SYSTEM_DECISION.md
-- "Option A: pure action-based time", Persona-5 style: the clock only advances
-- when the PLAYER acts (preps a day, battles, rests, explicitly advances).
--
-- This is strictly ADDITIVE. It does NOT replace the existing real wall-clock
-- scheduling (`battles.scheduled_at`, `getVirtualNow()`); that machinery keeps
-- running untouched. `game_day` is a parallel, per-player counter that features
-- can migrate onto over time.
--
-- Fully idempotent (IF NOT EXISTS everywhere) so it is safe to re-run.

-- ---------------------------------------------------------------------------
-- Per-player game-day counter on battlers.
-- 0 = freshly created, hasn't acted yet ("how many days into your career
-- you've acted"). Advances only through advanceGameDay() in lib/game/time.
-- ---------------------------------------------------------------------------
ALTER TABLE battlers
  ADD COLUMN IF NOT EXISTS game_day INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN battlers.game_day IS
  'Action-based career clock: how many in-game days this player has advanced by acting (prep, battles, rests, explicit advances). Per-player, independent of real wall-clock time. Additive to scheduled_at.';

-- ---------------------------------------------------------------------------
-- Append-only log of every advance, so a career timeline can be reconstructed.
-- `game_day` stores the NEW value AFTER the advance that this row records.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS game_day_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  game_day INTEGER NOT NULL,   -- resulting game_day AFTER this advance
  action_type TEXT NOT NULL,   -- what caused it: prep_day | battle | rest | life_event | travel | advance | ...
  note TEXT
);

CREATE INDEX IF NOT EXISTS game_day_history_battler_idx
  ON game_day_history (battler_id, created_at);

COMMENT ON TABLE game_day_history IS
  'Append-only log of game_day advances per battler — reconstruct the action-based career timeline.';

-- ---------------------------------------------------------------------------
-- Optional action-based schedule target on battles, alongside scheduled_at.
-- Nullable + additive: existing flows that read scheduled_at are unaffected.
-- ---------------------------------------------------------------------------
ALTER TABLE battles
  ADD COLUMN IF NOT EXISTS game_day_scheduled INTEGER;

COMMENT ON COLUMN battles.game_day_scheduled IS
  'Optional action-based schedule target (the player game_day this battle lands on). Additive — scheduled_at wall-clock remains authoritative for existing flows.';

-- ---------------------------------------------------------------------------
-- Service-role only, matching game_events and other internal tables: gameplay
-- writes go through internal / service-role routes; players never read or write
-- this table directly. RLS enabled with NO policies = only the service role
-- (which bypasses RLS) can touch it.
-- ---------------------------------------------------------------------------
ALTER TABLE game_day_history ENABLE ROW LEVEL SECURITY;
