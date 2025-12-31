-- ============================================================================
-- RELATIONSHIP STATE MACHINE - DEMONSTRATION & SAMPLE DATA
-- ============================================================================

\echo '============================================================================'
\echo 'RELATIONSHIP STATE MACHINE - COMPLETE DEMONSTRATION'
\echo 'This script demonstrates the full system working together'
\echo '============================================================================'
\echo ''

\echo '============================================================================'
\echo 'STEP 1: CREATE A RIVALRY BETWEEN TWO BATTLERS'
\echo '============================================================================'

WITH battlers_for_rivalry AS (
  SELECT
    (SELECT id FROM battlers WHERE stage_name = 'The Architect' LIMIT 1) as lux,
    (SELECT id FROM battlers WHERE stage_name = 'Tsunami Wave' LIMIT 1) as surf
)
SELECT
  'Creating Lux vs Surf rivalry...' as action,
  get_or_create_relationship(
    lux,
    surf,
    'battle',
    'Legendary rivalry born from championship clash',
    NULL
  ) as relationship_id
FROM battlers_for_rivalry;

\echo ''
\echo 'Initial relationship state:'
SELECT
  (SELECT stage_name FROM battlers WHERE id = battler_a_id) as battler_a,
  (SELECT stage_name FROM battlers WHERE id = battler_b_id) as battler_b,
  current_state,
  state_level,
  crowd_perception_a,
  crowd_perception_b,
  authenticity_score_a,
  authenticity_score_b
FROM battler_relationships
WHERE origin_story = 'Legendary rivalry born from championship clash';

\echo ''
\echo '============================================================================'
\echo 'STEP 2: PROGRESS THE RIVALRY THROUGH STATES'
\echo '============================================================================'

\echo 'Moving to AWARE (they notice each other)...'
WITH rivalry AS (
  SELECT id FROM battler_relationships
  WHERE origin_story = 'Legendary rivalry born from championship clash'
)
SELECT move_to_state(id, 'aware') FROM rivalry;

\echo ''
\echo 'Moving to TENSE (tension builds)...'
WITH rivalry AS (
  SELECT id FROM battler_relationships
  WHERE origin_story = 'Legendary rivalry born from championship clash'
)
SELECT move_to_state(id, 'tense') FROM rivalry;

\echo ''
\echo 'Moving to RIVALS (full rivalry)...'
WITH rivalry AS (
  SELECT id FROM battler_relationships
  WHERE origin_story = 'Legendary rivalry born from championship clash'
)
SELECT move_to_state(id, 'rivals') FROM rivalry;

SELECT
  'Current state:' as status,
  current_state,
  high_water_mark,
  state_level
FROM battler_relationships
WHERE origin_story = 'Legendary rivalry born from championship clash';

\echo ''
\echo '============================================================================'
\echo 'STEP 3: CREATE A BATTLE AND ADD PROMOTION EVENTS'
\echo '============================================================================'

-- Create a test battle
WITH rivalry AS (
  SELECT
    id as rel_id,
    battler_a_id as lux_id,
    battler_b_id as surf_id
  FROM battler_relationships
  WHERE origin_story = 'Legendary rivalry born from championship clash'
),
new_battle AS (
  INSERT INTO battles (
    battler_a_id,
    battler_b_id,
    league_id,
    status,
    scheduled_at,
    rounds
  )
  SELECT
    lux_id,
    surf_id,
    (SELECT id FROM leagues LIMIT 1),
    'accepted',
    NOW() + INTERVAL '7 days',
    3
  FROM rivalry
  RETURNING id, battler_a_id, battler_b_id
)
SELECT
  'Created battle:' as action,
  id as battle_id,
  (SELECT stage_name FROM battlers WHERE id = battler_a_id) as battler_a,
  (SELECT stage_name FROM battlers WHERE id = battler_b_id) as battler_b
FROM new_battle;

\echo ''
\echo 'Lux does a Twitter callout (boosts crowd perception)...'

WITH data AS (
  SELECT
    b.id as battle_id,
    b.battler_a_id as lux_id
  FROM battles b
  JOIN battler_relationships br ON
    (b.battler_a_id = br.battler_a_id AND b.battler_b_id = br.battler_b_id)
    OR (b.battler_a_id = br.battler_b_id AND b.battler_b_id = br.battler_a_id)
  WHERE br.origin_story = 'Legendary rivalry born from championship clash'
  ORDER BY b.created_at DESC
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
  days_before_battle
)
SELECT
  battle_id,
  lux_id,
  'twitter_callout',
  'Lux Calls Out Surf on Twitter',
  'The Architect goes viral with a calculated dissection of Surf''s recent performances, breaking down specific moments and predicting his own victory with surgical precision.',
  'I''ve studied every angle. There''s no version of this where you win.',
  25,  -- +25 crowd perception
  6    -- 6 days before battle
FROM data
RETURNING id, title, crowd_perception_delta;

\echo ''
\echo 'Surf responds with interview trash talk...'

WITH data AS (
  SELECT
    b.id as battle_id,
    b.battler_b_id as surf_id
  FROM battles b
  JOIN battler_relationships br ON
    (b.battler_a_id = br.battler_a_id AND b.battler_b_id = br.battler_b_id)
    OR (b.battler_a_id = br.battler_b_id AND b.battler_b_id = br.battler_a_id)
  WHERE br.origin_story = 'Legendary rivalry born from championship clash'
  ORDER BY b.created_at DESC
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
  days_before_battle
)
SELECT
  battle_id,
  surf_id,
  'interview',
  'Surf''s Fiery Interview Response',
  'Tsunami Wave fires back in an interview, bringing raw energy and street credibility to counter Lux''s technical analysis.',
  'All that study won''t save you when the wave hits. I''m DIFFERENT.',
  20,  -- +20 crowd perception
  5    -- 5 days before battle
FROM data
RETURNING id, title, crowd_perception_delta;

\echo ''
\echo '============================================================================'
\echo 'STEP 4: CALCULATE CROWD PERCEPTION WITH PROMOTION'
\echo '============================================================================'

WITH data AS (
  SELECT
    br.id as rel_id,
    b.id as battle_id
  FROM battler_relationships br
  JOIN battles b ON
    (b.battler_a_id = br.battler_a_id AND b.battler_b_id = br.battler_b_id)
    OR (b.battler_a_id = br.battler_b_id AND b.battler_b_id = br.battler_a_id)
  WHERE br.origin_story = 'Legendary rivalry born from championship clash'
  ORDER BY b.created_at DESC
  LIMIT 1
)
SELECT
  'Crowd perception after promotion:' as metric,
  calculate_crowd_perception(rel_id, 'a', battle_id) as lux_perception,
  calculate_crowd_perception(rel_id, 'b', battle_id) as surf_perception,
  CASE
    WHEN calculate_crowd_perception(rel_id, 'a', battle_id) > 50
    THEN 'Lux has the crowd edge!'
    WHEN calculate_crowd_perception(rel_id, 'b', battle_id) > 50
    THEN 'Surf has the crowd edge!'
    ELSE 'Even crowd split'
  END as crowd_favorite
FROM data;

\echo ''
\echo 'Promotion events for this battle:'
SELECT
  (SELECT stage_name FROM battlers WHERE id = battler_id) as battler,
  event_type,
  title,
  crowd_perception_delta,
  days_before_battle,
  key_quote
FROM promotion_events
WHERE battle_id = (
  SELECT b.id FROM battles b
  JOIN battler_relationships br ON
    (b.battler_a_id = br.battler_a_id AND b.battler_b_id = br.battler_b_id)
    OR (b.battler_a_id = br.battler_b_id AND b.battler_b_id = br.battler_a_id)
  WHERE br.origin_story = 'Legendary rivalry born from championship clash'
  ORDER BY b.created_at DESC
  LIMIT 1
)
ORDER BY occurred_at;

\echo ''
\echo '============================================================================'
\echo 'STEP 5: SHOW COMPLETE RELATIONSHIP STATE'
\echo '============================================================================'

SELECT
  (SELECT stage_name FROM battlers WHERE id = battler_a_id) as battler_a,
  (SELECT stage_name FROM battlers WHERE id = battler_b_id) as battler_b,
  current_state,
  high_water_mark,
  state_level,
  intensity,
  crowd_perception_a,
  crowd_perception_b,
  authenticity_score_a,
  authenticity_score_b,
  is_ducking_a,
  is_ducking_b,
  twitter_beef_active
FROM battler_relationships
WHERE origin_story = 'Legendary rivalry born from championship clash';

\echo ''
\echo '============================================================================'
\echo 'DEMONSTRATION COMPLETE'
\echo '============================================================================'

SELECT
  '✓ Relationship created' as step_1,
  '✓ State progression tested' as step_2,
  '✓ Promotion events added' as step_3,
  '✓ Crowd perception calculated' as step_4,
  '✓ Full system integrated' as step_5;

\echo ''
\echo 'This demonstrates:'
\echo '  - get_or_create_relationship() creating rivalries'
\echo '  - move_to_state() progressing through state tree'
\echo '  - promotion_events table storing pre-battle hype'
\echo '  - calculate_crowd_perception() factoring in promotion'
\echo '  - High water mark preservation'
\echo '  - All new columns and indexes working'
\echo ''
