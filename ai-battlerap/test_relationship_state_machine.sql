-- ============================================================================
-- RELATIONSHIP STATE MACHINE VERIFICATION TESTS
-- ============================================================================

\echo '============================================================================'
\echo 'TEST 1: VERIFY battler_relationships TABLE COLUMNS'
\echo '============================================================================'

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'battler_relationships'
  AND column_name IN (
    'current_state', 'high_water_mark', 'state_level',
    'crowd_perception_a', 'crowd_perception_b',
    'authenticity_score_a', 'authenticity_score_b',
    'is_ducking_a', 'is_ducking_b',
    'consecutive_offers_ignored_by_a', 'consecutive_offers_ignored_by_b',
    'twitter_beef_active', 'twitter_beef_started_at', 'twitter_beef_initiator_id'
  )
ORDER BY ordinal_position;

\echo ''
\echo '============================================================================'
\echo 'TEST 2: VERIFY scandals TABLE ENHANCEMENTS'
\echo '============================================================================'

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'scandals'
  AND column_name IN (
    'severity_label', 'media_amplification', 'times_addressed_in_battles',
    'last_addressed_battle_id', 'verification_status', 'evidence_level',
    'cover_up_strength', 'resolved_in_battle_id', 'resolution_type'
  )
ORDER BY ordinal_position;

\echo ''
\echo '============================================================================'
\echo 'TEST 3: VERIFY promotion_events TABLE EXISTS'
\echo '============================================================================'

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'promotion_events'
ORDER BY ordinal_position;

\echo ''
\echo '============================================================================'
\echo 'TEST 4: VERIFY INDEXES WERE CREATED'
\echo '============================================================================'

SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('battler_relationships', 'scandals', 'promotion_events')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

\echo ''
\echo '============================================================================'
\echo 'TEST 5: VERIFY HELPER FUNCTIONS EXIST'
\echo '============================================================================'

SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_or_create_relationship',
    'move_to_state',
    'calculate_crowd_perception'
  )
ORDER BY routine_name;

\echo ''
\echo '============================================================================'
\echo 'TEST 6: CHECK DATA MIGRATION - SAMPLE RELATIONSHIPS'
\echo '============================================================================'

SELECT
  id,
  battler_a_id,
  battler_b_id,
  intensity,
  current_state,
  high_water_mark,
  state_level,
  crowd_perception_a,
  crowd_perception_b,
  authenticity_score_a,
  authenticity_score_b
FROM battler_relationships
LIMIT 5;

\echo ''
\echo '============================================================================'
\echo 'TEST 7: VERIFY STATE DISTRIBUTION'
\echo '============================================================================'

SELECT
  current_state,
  COUNT(*) as count,
  AVG(intensity)::numeric(5,2) as avg_intensity,
  MIN(state_level) as min_level,
  MAX(state_level) as max_level
FROM battler_relationships
GROUP BY current_state
ORDER BY state_level DESC;

\echo ''
\echo '============================================================================'
\echo 'TEST 8: TEST get_or_create_relationship() FUNCTION'
\echo '============================================================================'

-- Get two random battlers
WITH random_battlers AS (
  SELECT id FROM battlers WHERE is_player = false ORDER BY random() LIMIT 2
),
battler_ids AS (
  SELECT
    (SELECT id FROM random_battlers LIMIT 1 OFFSET 0) as battler1,
    (SELECT id FROM random_battlers LIMIT 1 OFFSET 1) as battler2
)
SELECT
  get_or_create_relationship(
    battler1,
    battler2,
    'test',
    'Test relationship creation',
    NULL
  ) as created_relationship_id
FROM battler_ids;

\echo ''
\echo '============================================================================'
\echo 'TEST 9: TEST move_to_state() FUNCTION'
\echo '============================================================================'

-- Get a relationship and move it to 'rivals' state
WITH test_relationship AS (
  SELECT id FROM battler_relationships LIMIT 1
)
SELECT
  id as relationship_id,
  current_state as state_before,
  move_to_state(id, 'rivals'),
  (SELECT current_state FROM battler_relationships WHERE id = test_relationship.id) as state_after,
  (SELECT state_level FROM battler_relationships WHERE id = test_relationship.id) as level_after,
  (SELECT high_water_mark FROM battler_relationships WHERE id = test_relationship.id) as hwm_after
FROM test_relationship;

\echo ''
\echo '============================================================================'
\echo 'TEST 10: SAMPLE SCANDALS WITH NEW FIELDS'
\echo '============================================================================'

SELECT
  id,
  battler_id,
  title,
  intensity,
  severity_label,
  verification_status,
  evidence_level,
  cover_up_strength,
  media_amplification
FROM scandals
LIMIT 5;

\echo ''
\echo '============================================================================'
\echo 'VERIFICATION COMPLETE'
\echo '============================================================================'
