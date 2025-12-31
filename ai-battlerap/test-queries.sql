-- =================================================================
-- Battle Acceptance Flow - Database Test Queries
-- =================================================================
-- Run these queries to verify the battle acceptance flow works correctly

-- =================================================================
-- 1. CHECK CURRENT USER AND BATTLER
-- =================================================================
-- Verify you have a battler created
SELECT
  b.id as battler_id,
  b.stage_name,
  b.tier,
  l.name as league,
  r.rating,
  r.wins,
  r.losses
FROM battlers b
LEFT JOIN leagues l ON b.primary_league_id = l.id
LEFT JOIN rankings r ON b.id = r.battler_id
WHERE b.user_id = auth.uid()
  AND b.is_ai = false;

-- Expected: 1 row with your battler info
-- If 0 rows: You need to complete onboarding first

-- =================================================================
-- 2. CHECK AVAILABLE BATTLE OFFERS
-- =================================================================
-- See what offers are available to you
SELECT
  b.id,
  b.status,
  b.scheduled_at,
  b.lock_prep_at,
  l.name as league,
  ai.stage_name as opponent,
  ai.tier as opponent_tier,
  -- Check if offer is expired
  CASE
    WHEN NOW() >= b.lock_prep_at THEN 'EXPIRED'
    ELSE 'VALID'
  END as offer_status
FROM battles b
JOIN battlers player ON b.battler_player_id = player.id
JOIN battlers ai ON b.battler_ai_id = ai.id
JOIN leagues l ON b.league_id = l.id
WHERE player.user_id = auth.uid()
  AND b.status = 'offered'
ORDER BY b.scheduled_at;

-- Expected: List of offered battles
-- If 0 rows: No offers available (run cron job to generate offers)

-- =================================================================
-- 3. CHECK FOR EXISTING ACTIVE BATTLES
-- =================================================================
-- This is what the API checks before allowing acceptance
SELECT
  b.id,
  b.status,
  b.scheduled_at,
  b.lock_prep_at,
  ai.stage_name as opponent,
  l.name as league
FROM battles b
JOIN battlers player ON b.battler_player_id = player.id
JOIN battlers ai ON b.battler_ai_id = ai.id
JOIN leagues l ON b.league_id = l.id
WHERE player.user_id = auth.uid()
  AND b.status IN ('accepted', 'locked')
ORDER BY b.scheduled_at;

-- Expected: 0 rows (if you can accept a battle)
-- Expected: 1 row (if you already have an active battle)

-- =================================================================
-- 4. SIMULATE BATTLE ACCEPTANCE (READ-ONLY TEST)
-- =================================================================
-- This simulates what the accept API does, without actually changing data
WITH my_battler AS (
  SELECT id FROM battlers
  WHERE user_id = auth.uid() AND is_ai = false
  LIMIT 1
),
target_battle AS (
  SELECT * FROM battles
  WHERE battler_player_id = (SELECT id FROM my_battler)
    AND status = 'offered'
  ORDER BY scheduled_at
  LIMIT 1
),
validation_checks AS (
  SELECT
    tb.id,
    tb.status,
    tb.lock_prep_at,
    -- Check 1: Battle exists
    CASE WHEN tb.id IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as battle_exists,
    -- Check 2: Status is offered
    CASE WHEN tb.status = 'offered' THEN 'PASS' ELSE 'FAIL' END as status_offered,
    -- Check 3: Not expired
    CASE WHEN NOW() < tb.lock_prep_at THEN 'PASS' ELSE 'FAIL' END as not_expired,
    -- Check 4: No existing active battles
    CASE
      WHEN NOT EXISTS (
        SELECT 1 FROM battles
        WHERE battler_player_id = (SELECT id FROM my_battler)
          AND status IN ('accepted', 'locked')
      ) THEN 'PASS'
      ELSE 'FAIL'
    END as no_active_battles
  FROM target_battle tb
)
SELECT
  *,
  CASE
    WHEN battle_exists = 'PASS'
     AND status_offered = 'PASS'
     AND not_expired = 'PASS'
     AND no_active_battles = 'PASS'
    THEN 'WOULD ACCEPT'
    ELSE 'WOULD REJECT'
  END as acceptance_result
FROM validation_checks;

-- Expected: WOULD ACCEPT if all checks pass
-- Expected: WOULD REJECT with specific check failures if not

-- =================================================================
-- 5. CHECK BATTLE STATUS AFTER ACCEPTANCE (run after accepting)
-- =================================================================
-- Verify a battle was successfully accepted
SELECT
  b.id,
  b.status,
  b.scheduled_at,
  b.lock_prep_at,
  ai.stage_name as opponent,
  l.name as league,
  -- Calculate days until battle
  EXTRACT(EPOCH FROM (b.scheduled_at - NOW())) / 86400 as days_until_battle,
  -- Calculate days until prep locks
  EXTRACT(EPOCH FROM (b.lock_prep_at - NOW())) / 86400 as days_until_prep_lock
FROM battles b
JOIN battlers player ON b.battler_player_id = player.id
JOIN battlers ai ON b.battler_ai_id = ai.id
JOIN leagues l ON b.league_id = l.id
WHERE player.user_id = auth.uid()
  AND b.status = 'accepted'
ORDER BY b.scheduled_at;

-- Expected: 1 row showing your accepted battle

-- =================================================================
-- 6. CHECK PREP BLOCKS FOR ACCEPTED BATTLE
-- =================================================================
-- See if any prep has been planned yet
SELECT
  pb.day_index,
  pb.focus,
  pb.auto_generated,
  b.id as battle_id,
  b.status as battle_status
FROM prep_blocks pb
JOIN battles b ON pb.battle_id = b.id
JOIN battlers player ON b.battler_player_id = player.id
WHERE player.user_id = auth.uid()
  AND b.status IN ('accepted', 'locked')
ORDER BY pb.day_index;

-- Expected: 0 rows initially (no prep yet)
-- Expected: Multiple rows after you start planning prep

-- =================================================================
-- 7. DETECT MULTIPLE ACTIVE BATTLES (BUG CHECK)
-- =================================================================
-- This should NEVER return more than 1 row
-- If it does, there's a bug (race condition)
SELECT
  COUNT(*) as active_battle_count,
  CASE
    WHEN COUNT(*) > 1 THEN 'BUG DETECTED: Multiple active battles!'
    WHEN COUNT(*) = 1 THEN 'OK: One active battle'
    ELSE 'OK: No active battles'
  END as status
FROM battles b
JOIN battlers player ON b.battler_player_id = player.id
WHERE player.user_id = auth.uid()
  AND b.status IN ('accepted', 'locked');

-- Expected: active_battle_count = 0 or 1
-- If > 1: BUG! Race condition occurred

-- =================================================================
-- 8. CHECK BATTLE HISTORY
-- =================================================================
-- See all your battles and their statuses
SELECT
  b.id,
  b.status,
  b.scheduled_at,
  b.created_at,
  ai.stage_name as opponent,
  l.name as league,
  CASE
    WHEN b.winner_battler_id = player.id THEN 'WON'
    WHEN b.winner_battler_id IS NOT NULL THEN 'LOST'
    ELSE 'NOT COMPLETED'
  END as result
FROM battles b
JOIN battlers player ON b.battler_player_id = player.id
JOIN battlers ai ON b.battler_ai_id = ai.id
JOIN leagues l ON b.league_id = l.id
WHERE player.user_id = auth.uid()
ORDER BY b.created_at DESC;

-- Expected: List of all battles you've been involved in

-- =================================================================
-- 9. TEST EXPIRED OFFER DETECTION
-- =================================================================
-- Check which offers are expired (can't be accepted)
SELECT
  b.id,
  b.scheduled_at,
  b.lock_prep_at,
  ai.stage_name as opponent,
  NOW() as current_time,
  b.lock_prep_at < NOW() as is_expired,
  EXTRACT(EPOCH FROM (b.lock_prep_at - NOW())) / 3600 as hours_until_expiry
FROM battles b
JOIN battlers player ON b.battler_player_id = player.id
JOIN battlers ai ON b.battler_ai_id = ai.id
WHERE player.user_id = auth.uid()
  AND b.status = 'offered'
ORDER BY b.lock_prep_at;

-- Expected: Shows which offers are still valid vs expired

-- =================================================================
-- 10. SIMULATE MULTIPLE BATTLES SCENARIO (BUG TEST)
-- =================================================================
-- If you somehow have multiple accepted battles, this will show them
WITH my_battler AS (
  SELECT id FROM battlers WHERE user_id = auth.uid() AND is_ai = false
)
SELECT
  b.id,
  b.status,
  b.scheduled_at,
  ai.stage_name as opponent,
  ROW_NUMBER() OVER (ORDER BY b.created_at) as battle_number
FROM battles b
JOIN battlers ai ON b.battler_ai_id = ai.id
WHERE b.battler_player_id = (SELECT id FROM my_battler)
  AND b.status IN ('accepted', 'locked')
ORDER BY b.created_at;

-- Expected: 0 or 1 row
-- If multiple rows: BUG - multiple active battles exist

-- =================================================================
-- ADMIN QUERIES (for debugging)
-- =================================================================

-- Check all battles in the system
SELECT
  b.id,
  b.status,
  player.stage_name as player,
  ai.stage_name as ai,
  b.scheduled_at,
  b.created_at
FROM battles b
JOIN battlers player ON b.battler_player_id = player.id
JOIN battlers ai ON b.battler_ai_id = ai.id
ORDER BY b.created_at DESC
LIMIT 20;

-- Check status distribution
SELECT
  status,
  COUNT(*) as count
FROM battles
GROUP BY status
ORDER BY count DESC;

-- Check how many offered battles exist per player
SELECT
  player.stage_name,
  COUNT(*) as offered_battles
FROM battles b
JOIN battlers player ON b.battler_player_id = player.id
WHERE b.status = 'offered'
GROUP BY player.id, player.stage_name
ORDER BY offered_battles DESC;

-- =================================================================
-- PROPOSED DATABASE CONSTRAINT (to prevent race condition bug)
-- =================================================================
-- Run this to add a constraint that prevents multiple active battles

-- Option 1: Check constraint (PostgreSQL 12+)
-- This will prevent inserting/updating a battle to accepted/locked
-- if another battle for the same player is already accepted/locked

CREATE OR REPLACE FUNCTION check_one_active_battle()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('accepted', 'locked') THEN
    IF EXISTS (
      SELECT 1 FROM battles
      WHERE battler_player_id = NEW.battler_player_id
        AND id != NEW.id
        AND status IN ('accepted', 'locked')
    ) THEN
      RAISE EXCEPTION 'Battler % already has an active battle', NEW.battler_player_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Don't run this yet - it's just a proposal
-- DROP TRIGGER IF EXISTS enforce_one_active_battle ON battles;
-- CREATE TRIGGER enforce_one_active_battle
--   BEFORE INSERT OR UPDATE ON battles
--   FOR EACH ROW
--   EXECUTE FUNCTION check_one_active_battle();

-- =================================================================
-- CLEANUP QUERIES (use with caution)
-- =================================================================

-- Delete all your offered battles (to reset for testing)
-- CAUTION: Only run if you want to clear all offers
/*
DELETE FROM battles
WHERE battler_player_id = (
  SELECT id FROM battlers WHERE user_id = auth.uid() AND is_ai = false
)
AND status = 'offered';
*/

-- Reset an accepted battle back to offered (for re-testing acceptance)
-- CAUTION: Only run for testing purposes
/*
UPDATE battles
SET status = 'offered'
WHERE id = 'BATTLE_ID_HERE'
  AND status = 'accepted';
*/
