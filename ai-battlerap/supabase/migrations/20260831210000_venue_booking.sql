-- Venue booking (2026-08-31): battles get booked into a real ROOM (venues
-- table, city-tied, sized) and the biggest nights go out on national TV.
-- Scoring context stays the 3-value system; TV is a broadcast layer on top.
ALTER TABLE battles ADD COLUMN IF NOT EXISTS tv_broadcast BOOLEAN DEFAULT FALSE;

-- Venue prestige moves onto the same 1-10 scale leagues use, so booking can
-- match a league to a room of its size.
ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_prestige_level_check;
ALTER TABLE venues ADD CONSTRAINT venues_prestige_level_check CHECK (
  prestige_level >= 1 AND prestige_level <= 10
);

COMMENT ON COLUMN battles.tv_broadcast IS
  'Special event carried on national TV — booked into the city''s biggest room.';
