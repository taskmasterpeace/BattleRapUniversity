-- battle_rounds.won — the simulation has always computed per-round winners but
-- stripped them before insert because this column never existed. Every consumer
-- that filtered on r.won (news recaps, grudge engine, H2H records, career
-- battle history scores) silently counted 0-0. Add the column, backfill from
-- round scores, and the engine writes it going forward.

ALTER TABLE battle_rounds ADD COLUMN IF NOT EXISTS won BOOLEAN NOT NULL DEFAULT false;

-- Backfill: a round is won when your average_score beats your opponent's in
-- the same battle+round (ties resolve false for both, matching UI behavior).
UPDATE battle_rounds br
SET won = (br.average_score > opp.average_score)
FROM battle_rounds opp
WHERE opp.battle_id = br.battle_id
  AND opp.round_index = br.round_index
  AND opp.battler_id <> br.battler_id;
