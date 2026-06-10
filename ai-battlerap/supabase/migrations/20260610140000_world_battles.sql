-- World battles: AI-vs-AI cards booked by the world tick so the scene keeps
-- moving without the player. Flagged so the tick can manage its own slate
-- without touching player offers, PvP, or tournaments.
ALTER TABLE battles ADD COLUMN IF NOT EXISTS is_world BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_battles_world ON battles (is_world) WHERE is_world = true;
