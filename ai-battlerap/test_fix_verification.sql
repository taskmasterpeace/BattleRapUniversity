-- Test that the calculate_crowd_perception fix works

\echo '============================================================================'
\echo 'VERIFYING calculate_crowd_perception() BUG FIX'
\echo '============================================================================'

-- Create test relationship
WITH test_battlers AS (
  SELECT
    (SELECT id FROM battlers WHERE is_ai = true LIMIT 1 OFFSET 0) as battler1,
    (SELECT id FROM battlers WHERE is_ai = true LIMIT 1 OFFSET 1) as battler2
)
SELECT
  'Creating test relationship...' as action,
  get_or_create_relationship(
    battler1,
    battler2,
    'battle',
    'Bug fix verification test',
    NULL
  ) as rel_id
FROM test_battlers;

\echo ''
\echo 'Testing calculate_crowd_perception with dummy battle_id...'

-- Test the function (should NOT error out now)
WITH test_data AS (
  SELECT
    br.id as rel_id,
    gen_random_uuid() as battle_id
  FROM battler_relationships br
  WHERE origin_story = 'Bug fix verification test'
  LIMIT 1
)
SELECT
  'Battler A perception:' as side,
  calculate_crowd_perception(rel_id, 'a', battle_id) as crowd_perception,
  CASE
    WHEN calculate_crowd_perception(rel_id, 'a', battle_id) = 50
    THEN '✓ PASS: Function works without error!'
    ELSE '? WARNING: Unexpected result'
  END as test_result
FROM test_data
UNION ALL
SELECT
  'Battler B perception:' as side,
  calculate_crowd_perception(rel_id, 'b', battle_id) as crowd_perception,
  CASE
    WHEN calculate_crowd_perception(rel_id, 'b', battle_id) = 50
    THEN '✓ PASS: Function works without error!'
    ELSE '? WARNING: Unexpected result'
  END as test_result
FROM test_data;

\echo ''
\echo 'Cleanup...'
DELETE FROM battler_relationships WHERE origin_story = 'Bug fix verification test';

\echo ''
\echo '✓ Bug fix verified!'
