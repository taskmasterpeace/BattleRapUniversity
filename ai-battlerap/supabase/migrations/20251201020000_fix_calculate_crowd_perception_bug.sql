/**
 * FIX: Ambiguous column reference in calculate_crowd_perception()
 *
 * Bug: The function has ambiguous column references for battle_id and battler_id
 * when querying promotion_events, causing SQL errors.
 *
 * Solution: Use explicit table aliases and qualified column names in the query.
 */

-- Drop the old function first (parameter name change requires full drop)
DROP FUNCTION IF EXISTS calculate_crowd_perception(UUID, TEXT, UUID);

-- Recreate the function with fix
CREATE OR REPLACE FUNCTION calculate_crowd_perception(
  rel_id UUID,
  battler_side TEXT,  -- 'a' or 'b'
  battle_id_param UUID  -- Renamed parameter to avoid ambiguity
) RETURNS INT AS $$
DECLARE
  base_perception INT := 50;  -- Neutral
  promotion_total INT := 0;
  scandal_penalty INT := 0;
  auth_penalty INT := 0;
  result INT;
  battler_id_val UUID;
  auth_score INT;
BEGIN
  -- Get battler ID and authenticity score
  IF battler_side = 'a' THEN
    SELECT battler_a_id, authenticity_score_a
    INTO battler_id_val, auth_score
    FROM battler_relationships WHERE id = rel_id;
  ELSE
    SELECT battler_b_id, authenticity_score_b
    INTO battler_id_val, auth_score
    FROM battler_relationships WHERE id = rel_id;
  END IF;

  -- Sum promotion event deltas (FIX: Use explicit aliases to avoid ambiguity)
  SELECT COALESCE(SUM(pe.crowd_perception_delta), 0)
  INTO promotion_total
  FROM promotion_events pe
  WHERE pe.battle_id = battle_id_param
    AND pe.battler_id = battler_id_val;

  -- Active scandal penalties
  SELECT COALESCE(SUM(s.intensity * -3), 0)  -- -3 to -30 per scandal
  INTO scandal_penalty
  FROM scandals s
  WHERE s.battler_id = battler_id_val
    AND s.week_expires > EXTRACT(WEEK FROM NOW());

  -- Authenticity damage (lose 1 perception per point below 100)
  auth_penalty := 100 - auth_score;

  -- Calculate total
  result := base_perception
    + promotion_total
    + scandal_penalty
    - auth_penalty;

  -- Clamp to 0-100
  result := GREATEST(0, LEAST(100, result));

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add comment explaining the fix
COMMENT ON FUNCTION calculate_crowd_perception IS 'Calculates crowd perception for a battler in a relationship. Fixed ambiguous column reference bug by renaming battle_id parameter and using explicit table aliases.';
