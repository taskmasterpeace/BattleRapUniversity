-- GAME EVENT LOG (owner ask 2026-09-01: "we need the logs captured so you can
-- examine them"). Every meaningful gameplay action lands here as a structured
-- row — offers, pen writes, performed rounds, finalizes, and errors — so a
-- playthrough can be reconstructed and examined after the fact.
CREATE TABLE IF NOT EXISTS game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL,
  battle_id UUID,
  battler_id UUID,
  user_id UUID,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS game_events_battle_idx ON game_events (battle_id, created_at);
CREATE INDEX IF NOT EXISTS game_events_type_idx ON game_events (event_type, created_at);
CREATE INDEX IF NOT EXISTS game_events_user_idx ON game_events (user_id, created_at);

-- Service-role only: gameplay writes go through internal routes; players never
-- read or write this table directly.
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE game_events IS
  'Structured gameplay log — reconstruct any battle/playthrough from its rows.';
