-- THE TAPE — the internet's verdict alongside the room's (2026-08-31).
-- Battle rap's two audiences (see docs/design/culture/LEAGUE_CULTURES_AND_PPV.md):
-- the ROOM reacts live; the TAPE gets rewound online. battles.verdict stays the
-- room's call; tape_verdict is the re-judge with no crowd term
-- (avg × 0.55 + peak × 0.45 per round — lib/game/tapeVerdict.ts).
-- Divergence between them is "debatable" culture, and feeds newsroom leads.

ALTER TABLE battles
  ADD COLUMN IF NOT EXISTS tape_verdict text,
  ADD COLUMN IF NOT EXISTS tape_winner_battler_id uuid REFERENCES battlers(id);

COMMENT ON COLUMN battles.tape_verdict IS 'The internet''s re-judge when the battle drops online (no crowd term); verdict stays the room''s call';

-- Backfill every completed battle that has full round data.
WITH scored AS (
  SELECT br.battle_id, br.round_index, br.battler_id,
         (br.average_score * 0.55 + br.peak_score * 0.45) AS tape_score
  FROM battle_rounds br
), pairs AS (
  SELECT s.battle_id, s.round_index,
         b.battler_player_id, b.battler_ai_id,
         MAX(CASE WHEN s.battler_id = b.battler_player_id THEN s.tape_score END) AS p_score,
         MAX(CASE WHEN s.battler_id = b.battler_ai_id THEN s.tape_score END) AS a_score
  FROM scored s JOIN battles b ON b.id = s.battle_id
  WHERE b.status = 'completed' AND b.verdict IS NOT NULL
  GROUP BY s.battle_id, s.round_index, b.battler_player_id, b.battler_ai_id
), tallies AS (
  SELECT battle_id, battler_player_id, battler_ai_id,
         COUNT(*) FILTER (WHERE p_score >= a_score) AS p_rounds,
         COUNT(*) FILTER (WHERE a_score > p_score) AS a_rounds
  FROM pairs
  WHERE p_score IS NOT NULL AND a_score IS NOT NULL
  GROUP BY battle_id, battler_player_id, battler_ai_id
  HAVING COUNT(*) = 3
)
UPDATE battles b SET
  tape_verdict = CASE WHEN GREATEST(t.p_rounds, t.a_rounds) = 3 THEN '3-0' ELSE '2-1' END,
  tape_winner_battler_id = CASE WHEN t.p_rounds > t.a_rounds THEN t.battler_player_id ELSE t.battler_ai_id END
FROM tallies t
WHERE b.id = t.battle_id AND b.tape_verdict IS NULL;
