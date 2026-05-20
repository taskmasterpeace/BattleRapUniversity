-- Enforce "one player battler per user" rule.
-- CLAUDE.md: "Single battler per player: No stable management" (V1 scope).
-- AI battlers (is_ai = true) are excluded so the system can own many.
--
-- We first dedupe any historical data: if a user somehow has multiple player
-- battlers we keep the earliest one and remove the others (and their refs).

-- Step 1: pick the oldest player battler per user
WITH winners AS (
  SELECT DISTINCT ON (user_id) id, user_id
  FROM battlers
  WHERE is_ai = FALSE AND user_id IS NOT NULL
  ORDER BY user_id, created_at ASC
),
losers AS (
  SELECT b.id
  FROM battlers b
  LEFT JOIN winners w ON w.id = b.id
  WHERE b.is_ai = FALSE AND b.user_id IS NOT NULL AND w.id IS NULL
)
DELETE FROM battlers WHERE id IN (SELECT id FROM losers);

-- Step 2: enforce uniqueness going forward.
-- A partial unique index restricts the constraint to non-AI battlers only.
CREATE UNIQUE INDEX IF NOT EXISTS battlers_one_player_per_user
  ON battlers (user_id)
  WHERE is_ai = FALSE;
