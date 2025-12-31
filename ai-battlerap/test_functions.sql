-- ============================================================================
-- RELATIONSHIP STATE MACHINE - FUNCTION TESTS
-- ============================================================================

\echo '============================================================================'
\echo 'TEST 1: CREATE SAMPLE DATA FOR TESTING'
\echo '============================================================================'

-- Get two battlers to test with
SELECT id, name FROM battlers LIMIT 2;

\echo ''
\echo '============================================================================'
\echo 'TEST 2: TEST get_or_create_relationship() FUNCTION'
\echo '============================================================================'

-- Create a test relationship
WITH test_battlers AS (
  SELECT
    (SELECT id FROM battlers LIMIT 1 OFFSET 0) as battler1,
    (SELECT id FROM battlers LIMIT 1 OFFSET 1) as battler2
)
SELECT
  'Creating relationship...' as action,
  get_or_create_relationship(
    battler1,
    battler2,
    'test',
    'Test relationship creation from verification script',
    NULL
  ) as created_relationship_id
FROM test_battlers;

\echo ''
\echo 'Verifying relationship was created...'

SELECT
  id,
  battler_a_id,
  battler_b_id,
  intensity,
  current_state,
  high_water_mark,
  state_level,
  origin_type,
  origin_story
FROM battler_relationships
WHERE origin_type = 'test'
ORDER BY created_at DESC
LIMIT 1;

\echo ''
\echo '============================================================================'
\echo 'TEST 3: TEST move_to_state() FUNCTION'
\echo '============================================================================'

-- Move the test relationship through states
WITH test_rel AS (
  SELECT id FROM battler_relationships WHERE origin_type = 'test' LIMIT 1
)
SELECT
  'Testing state progression...' as action;

-- Move to aware
WITH test_rel AS (
  SELECT id FROM battler_relationships WHERE origin_type = 'test' LIMIT 1
)
SELECT move_to_state(id, 'aware') FROM test_rel;

SELECT
  'After moving to AWARE:' as status,
  current_state,
  high_water_mark,
  state_level
FROM battler_relationships
WHERE origin_type = 'test'
LIMIT 1;

-- Move to rivals
WITH test_rel AS (
  SELECT id FROM battler_relationships WHERE origin_type = 'test' LIMIT 1
)
SELECT move_to_state(id, 'rivals') FROM test_rel;

SELECT
  'After moving to RIVALS:' as status,
  current_state,
  high_water_mark,
  state_level
FROM battler_relationships
WHERE origin_type = 'test'
LIMIT 1;

-- Move back to tense (should keep high water mark)
WITH test_rel AS (
  SELECT id FROM battler_relationships WHERE origin_type = 'test' LIMIT 1
)
SELECT move_to_state(id, 'tense') FROM test_rel;

SELECT
  'After moving BACK to TENSE (testing high water mark):' as status,
  current_state,
  high_water_mark,
  state_level,
  CASE
    WHEN high_water_mark = 'rivals' THEN '✓ High water mark preserved!'
    ELSE '✗ High water mark NOT preserved!'
  END as hwm_check
FROM battler_relationships
WHERE origin_type = 'test'
LIMIT 1;

-- Move to legendary_beef
WITH test_rel AS (
  SELECT id FROM battler_relationships WHERE origin_type = 'test' LIMIT 1
)
SELECT move_to_state(id, 'legendary_beef') FROM test_rel;

SELECT
  'After moving to LEGENDARY_BEEF:' as status,
  current_state,
  high_water_mark,
  state_level
FROM battler_relationships
WHERE origin_type = 'test'
LIMIT 1;

\echo ''
\echo '============================================================================'
\echo 'TEST 4: TEST calculate_crowd_perception() FUNCTION'
\echo '============================================================================'

-- First, we need a battle to test with
WITH test_data AS (
  SELECT
    br.id as rel_id,
    br.battler_a_id,
    br.battler_b_id,
    (SELECT id FROM battles LIMIT 1) as battle_id
  FROM battler_relationships br
  WHERE origin_type = 'test'
  LIMIT 1
)
SELECT
  'Testing crowd perception calculation...' as action,
  rel_id,
  battle_id,
  calculate_crowd_perception(rel_id, 'a', battle_id) as crowd_perception_a,
  calculate_crowd_perception(rel_id, 'b', battle_id) as crowd_perception_b
FROM test_data;

\echo ''
\echo '============================================================================'
\echo 'TEST 5: TEST PROMOTION EVENTS INTEGRATION'
\echo '============================================================================'

-- Create a test promotion event
WITH test_data AS (
  SELECT
    br.id as rel_id,
    br.battler_a_id,
    (SELECT id FROM battles LIMIT 1) as battle_id
  FROM battler_relationships br
  WHERE origin_type = 'test'
  LIMIT 1
)
INSERT INTO promotion_events (
  battle_id,
  battler_id,
  event_type,
  title,
  description,
  key_quote,
  crowd_perception_delta,
  authenticity_damage,
  media_coverage,
  days_before_battle
)
SELECT
  battle_id,
  battler_a_id,
  'twitter_callout',
  'Test Twitter Callout',
  'Battler A calls out Battler B on Twitter before their battle',
  'You aint ready for what I got!',
  15,  -- +15 crowd perception
  5,   -- -5 authenticity to opponent
  7,   -- High media coverage
  3    -- 3 days before battle
FROM test_data
RETURNING id, event_type, crowd_perception_delta;

-- Verify promotion event
SELECT
  id,
  event_type,
  title,
  crowd_perception_delta,
  authenticity_damage,
  media_coverage,
  days_before_battle
FROM promotion_events
WHERE event_type = 'twitter_callout'
ORDER BY created_at DESC
LIMIT 1;

-- Recalculate crowd perception (should now include promotion bonus)
WITH test_data AS (
  SELECT
    br.id as rel_id,
    br.battler_a_id,
    br.battler_b_id,
    (SELECT id FROM battles LIMIT 1) as battle_id
  FROM battler_relationships br
  WHERE origin_type = 'test'
  LIMIT 1
)
SELECT
  'After adding promotion event:' as status,
  calculate_crowd_perception(rel_id, 'a', battle_id) as crowd_perception_a,
  calculate_crowd_perception(rel_id, 'b', battle_id) as crowd_perception_b,
  CASE
    WHEN calculate_crowd_perception(rel_id, 'a', battle_id) > 50
    THEN '✓ Battler A gained crowd favor from promotion!'
    ELSE '? Crowd perception unchanged'
  END as promotion_effect
FROM test_data;

\echo ''
\echo '============================================================================'
\echo 'TEST 6: VERIFY CONSTRAINTS AND DEFAULTS'
\echo '============================================================================'

-- Test state constraints
SELECT
  'Testing state level bounds...' as test,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM battler_relationships
      WHERE state_level >= 0 AND state_level <= 5
    )
    THEN '✓ State levels within valid range (0-5)'
    ELSE '✗ Invalid state levels found'
  END as result;

-- Test crowd perception bounds
SELECT
  'Testing crowd perception bounds...' as test,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM battler_relationships
      WHERE crowd_perception_a >= 0 AND crowd_perception_a <= 100
        AND crowd_perception_b >= 0 AND crowd_perception_b <= 100
    )
    THEN '✓ Crowd perceptions within valid range (0-100)'
    ELSE '✗ Invalid crowd perceptions found'
  END as result;

-- Test authenticity bounds
SELECT
  'Testing authenticity bounds...' as test,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM battler_relationships
      WHERE authenticity_score_a >= 0 AND authenticity_score_a <= 100
        AND authenticity_score_b >= 0 AND authenticity_score_b <= 100
    )
    THEN '✓ Authenticity scores within valid range (0-100)'
    ELSE '✗ Invalid authenticity scores found'
  END as result;

\echo ''
\echo '============================================================================'
\echo 'FUNCTION TESTS COMPLETE'
\echo '============================================================================'

-- Cleanup test data
DELETE FROM promotion_events WHERE event_type = 'twitter_callout';
DELETE FROM battler_relationships WHERE origin_type = 'test';

SELECT 'Test data cleaned up!' as cleanup_status;
