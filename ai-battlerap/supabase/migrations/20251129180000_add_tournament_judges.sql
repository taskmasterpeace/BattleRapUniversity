/**
 * Add Tournament Judge System
 *
 * Adds judge panel to tournaments table and creates battle_judge_scores table
 * for detailed judge evaluations of tournament battles.
 */

-- Add judge panel to tournaments
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS judges JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS judge_names TEXT[] DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN tournaments.judges IS 'Array of judge IDs (e.g., ["battle_eyez", "small_room_report", "the_battle_breakdown"])';
COMMENT ON COLUMN tournaments.judge_names IS 'Array of judge display names for UI (e.g., ["Battle Eyez", "Small Room Report", "The Battle Breakdown"])';

-- Create battle_judge_scores table
CREATE TABLE IF NOT EXISTS battle_judge_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Battle and judge identifiers
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  judge_id TEXT NOT NULL,
  judge_name TEXT NOT NULL,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- Overall scores
  rounds_won INTEGER NOT NULL CHECK (rounds_won >= 0 AND rounds_won <= 3),
  overall_composite_average NUMERIC NOT NULL,
  winner BOOLEAN NOT NULL,

  -- Round-by-round evaluations (stored as JSONB for flexibility)
  round_evaluations JSONB NOT NULL,

  -- Metadata
  badge_bias_overall NUMERIC, -- Average badge bias across all rounds
  content_preference_overall NUMERIC, -- Average content preference across all rounds

  UNIQUE(battle_id, judge_id, battler_id)
);

CREATE INDEX IF NOT EXISTS idx_judge_scores_battle ON battle_judge_scores(battle_id);
CREATE INDEX IF NOT EXISTS idx_judge_scores_judge ON battle_judge_scores(judge_id);
CREATE INDEX IF NOT EXISTS idx_judge_scores_battler ON battle_judge_scores(battler_id);
CREATE INDEX IF NOT EXISTS idx_judge_scores_winner ON battle_judge_scores(winner);

COMMENT ON TABLE battle_judge_scores IS 'Judge evaluations for tournament battles - stores detailed scoring from each judge perspective';
COMMENT ON COLUMN battle_judge_scores.round_evaluations IS 'JSONB array of round evaluations including composite scores, modifiers, and segment details';
COMMENT ON COLUMN battle_judge_scores.rounds_won IS 'How many rounds (0-3) this judge scored for this battler';
COMMENT ON COLUMN battle_judge_scores.winner IS 'Did this judge score this battler as the overall winner';

-- Create tournament_scorecard view for easy querying
CREATE OR REPLACE VIEW tournament_battle_scorecards AS
SELECT
  b.id AS battle_id,
  b.tournament_id,
  b.battler_player_id,
  b.battler_ai_id,
  b.winner_battler_id,

  -- Count judge votes for player
  COUNT(CASE WHEN bjs.battler_id = b.battler_player_id AND bjs.winner = true THEN 1 END) AS player_judge_votes,

  -- Count judge votes for opponent
  COUNT(CASE WHEN bjs.battler_id = b.battler_ai_id AND bjs.winner = true THEN 1 END) AS opponent_judge_votes,

  -- Decision type
  CASE
    WHEN COUNT(CASE WHEN bjs.battler_id = b.battler_player_id AND bjs.winner = true THEN 1 END) = 3 THEN 'unanimous_player'
    WHEN COUNT(CASE WHEN bjs.battler_id = b.battler_ai_id AND bjs.winner = true THEN 1 END) = 3 THEN 'unanimous_opponent'
    ELSE 'split_decision'
  END AS decision_type

FROM battles b
LEFT JOIN battle_judge_scores bjs ON bjs.battle_id = b.id
WHERE b.tournament_id IS NOT NULL
GROUP BY b.id, b.tournament_id, b.battler_player_id, b.battler_ai_id, b.winner_battler_id;

COMMENT ON VIEW tournament_battle_scorecards IS 'Aggregated judge scorecards for tournament battles';
