/**
 * Atomic Battle Results Save Migration
 *
 * CRITICAL DATA INTEGRITY FIX:
 * - Current code: Multiple separate database updates (C5, C6)
 * - Problem: If any update fails mid-sequence, data corrupted
 * - Solution: Single atomic PostgreSQL function with transaction
 *
 * This migration creates:
 * - Composite types for battle data
 * - Atomic save function that commits all-or-nothing
 */

-- Create composite type for round results
CREATE TYPE round_result AS (
  battle_id UUID,
  battler_id UUID,
  round_index INTEGER,
  average_score NUMERIC,
  peak_score NUMERIC,
  consistency_score NUMERIC,
  crowd_reaction NUMERIC,
  choke BOOLEAN
);

-- Create composite type for segment results
CREATE TYPE segment_result AS (
  battle_id UUID,
  battler_id UUID,
  round_index INTEGER,
  segment_index INTEGER,
  score NUMERIC,
  choke BOOLEAN,
  stumble BOOLEAN
);

/**
 * Atomic Battle Results Save Function
 *
 * Saves ALL battle results in a single atomic transaction:
 * - Battle status update
 * - Player ranking update
 * - AI ranking update
 * - Battle rounds insert (both battlers)
 * - Battle segments insert (all segments)
 *
 * If ANY operation fails, ALL operations rollback automatically.
 */
CREATE OR REPLACE FUNCTION save_battle_results(
  p_battle_id UUID,
  p_winner_id UUID,
  p_verdict TEXT,
  p_player_rounds round_result[],
  p_ai_rounds round_result[],
  p_segments segment_result[],
  p_player_rating_change INTEGER,
  p_ai_rating_change INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_battle RECORD;
  v_player_id UUID;
  v_ai_id UUID;
  v_player_won BOOLEAN;
  v_result JSONB;
BEGIN
  -- Lock battle row for update (prevents concurrent modifications)
  SELECT * INTO v_battle FROM battles WHERE id = p_battle_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Battle not found: %', p_battle_id;
  END IF;

  v_player_id := v_battle.battler_player_id;
  v_ai_id := v_battle.battler_ai_id;
  v_player_won := p_winner_id = v_player_id;

  -- Update battle status
  UPDATE battles
  SET
    status = 'completed',
    winner_battler_id = p_winner_id,
    verdict = p_verdict,
    updated_at = NOW()
  WHERE id = p_battle_id;

  -- Update player ranking
  UPDATE rankings
  SET
    rating = rating + p_player_rating_change,
    wins = wins + CASE WHEN v_player_won THEN 1 ELSE 0 END,
    losses = losses + CASE WHEN v_player_won THEN 0 ELSE 1 END,
    total_battles = total_battles + 1,
    streak = CASE
      WHEN v_player_won THEN GREATEST(0, streak) + 1
      ELSE LEAST(0, streak) - 1
    END
  WHERE battler_id = v_player_id;

  -- Update AI ranking
  UPDATE rankings
  SET
    rating = rating + p_ai_rating_change,
    wins = wins + CASE WHEN NOT v_player_won THEN 1 ELSE 0 END,
    losses = losses + CASE WHEN NOT v_player_won THEN 0 ELSE 1 END,
    total_battles = total_battles + 1,
    streak = CASE
      WHEN NOT v_player_won THEN GREATEST(0, streak) + 1
      ELSE LEAST(0, streak) - 1
    END
  WHERE battler_id = v_ai_id;

  -- Insert battle rounds (bulk insert for player)
  IF array_length(p_player_rounds, 1) > 0 THEN
    INSERT INTO battle_rounds
      (battle_id, battler_id, round_index, average_score, peak_score, consistency_score, crowd_reaction, choke)
    SELECT
      (r).battle_id,
      (r).battler_id,
      (r).round_index,
      (r).average_score,
      (r).peak_score,
      (r).consistency_score,
      (r).crowd_reaction,
      (r).choke
    FROM unnest(p_player_rounds) AS r;
  END IF;

  -- Insert battle rounds (bulk insert for AI)
  IF array_length(p_ai_rounds, 1) > 0 THEN
    INSERT INTO battle_rounds
      (battle_id, battler_id, round_index, average_score, peak_score, consistency_score, crowd_reaction, choke)
    SELECT
      (r).battle_id,
      (r).battler_id,
      (r).round_index,
      (r).average_score,
      (r).peak_score,
      (r).consistency_score,
      (r).crowd_reaction,
      (r).choke
    FROM unnest(p_ai_rounds) AS r;
  END IF;

  -- Insert battle segments (bulk insert)
  IF array_length(p_segments, 1) > 0 THEN
    INSERT INTO battle_segments
      (battle_id, battler_id, round_index, segment_index, score, choke, stumble)
    SELECT
      (s).battle_id,
      (s).battler_id,
      (s).round_index,
      (s).segment_index,
      (s).score,
      (s).choke,
      (s).stumble
    FROM unnest(p_segments) AS s;
  END IF;

  v_result := jsonb_build_object(
    'success', true,
    'battle_id', p_battle_id,
    'winner_id', p_winner_id
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Any error triggers automatic rollback of ALL changes
    RAISE EXCEPTION 'Failed to save battle results: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION save_battle_results IS
  'Atomically saves battle results in single transaction. All updates succeed or all rollback.';
