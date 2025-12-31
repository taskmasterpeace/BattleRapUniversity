-- SQL Integrity Tests for Battle Rap University
-- Run these queries against your Supabase database to verify data integrity

-- =====================================================
-- A. Schema Sanity Checks
-- =====================================================

-- A.1 Verify all foreign keys are enforced
-- Query information_schema to list all foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Expected foreign keys:
-- battlers.user_id → auth.users.id
-- battlers.primary_league_id → leagues.id
-- battler_attributes.battler_id → battlers.id (CASCADE)
-- rankings.battler_id → battlers.id (CASCADE)
-- battles.league_id → leagues.id
-- battles.battler_player_id → battlers.id
-- battles.battler_ai_id → battlers.id
-- battles.winner_battler_id → battlers.id
-- prep_blocks.battle_id → battles.id (CASCADE)
-- prep_blocks.battler_id → battlers.id (CASCADE)
-- battle_rounds.battle_id → battles.id (CASCADE)
-- battle_rounds.battler_id → battlers.id
-- battle_segments.battle_id → battles.id (CASCADE)
-- battle_segments.battler_id → battlers.id
-- news_articles.primary_battler_id → battlers.id
-- news_articles.secondary_battler_id → battlers.id
-- news_articles.battle_id → battles.id
-- news_articles.league_id → leagues.id
-- battler_life_events.battler_id → battlers.id
-- battler_life_events.template_id → life_event_templates.id
-- battler_life_events.battle_id → battles.id
-- battler_life_events.league_id → leagues.id

-- =====================================================
-- B. Status Lifecycle Validation
-- =====================================================

-- B.1 Check for inconsistent battle statuses

-- B.1.1 Battles marked 'completed' but missing battle_rounds
SELECT
  b.id,
  b.status,
  COUNT(br.id) as round_count
FROM battles b
LEFT JOIN battle_rounds br ON br.battle_id = b.id
WHERE b.status = 'completed'
GROUP BY b.id, b.status
HAVING COUNT(br.id) != 6;
-- Expected: 0 rows (every completed battle should have exactly 6 rounds)

-- B.1.2 Battles marked 'completed' but missing winner
SELECT id, status, winner_battler_id
FROM battles
WHERE status = 'completed'
  AND winner_battler_id IS NULL;
-- Expected: 0 rows

-- B.1.3 Battles NOT completed but have a winner
SELECT id, status, winner_battler_id
FROM battles
WHERE status NOT IN ('completed')
  AND winner_battler_id IS NOT NULL;
-- Expected: 0 rows

-- B.1.4 Battles with battle_rounds but status not 'completed'
SELECT DISTINCT
  b.id,
  b.status,
  COUNT(br.id) as round_count
FROM battles b
INNER JOIN battle_rounds br ON br.battle_id = b.id
WHERE b.status != 'completed'
GROUP BY b.id, b.status;
-- Expected: 0 rows

-- =====================================================
-- C. Data Consistency Checks
-- =====================================================

-- C.1 Verify battle_segments count matches expected
-- Small Room (2 min): 3 rounds * 4 segments * 2 battlers = 24 segments
-- Main Stage (3 min): 3 rounds * 6 segments * 2 battlers = 36 segments
SELECT
  b.id as battle_id,
  l.round_length_minutes,
  CASE
    WHEN l.round_length_minutes = 2 THEN 24
    WHEN l.round_length_minutes = 3 THEN 36
  END as expected_segments,
  COUNT(bs.id) as actual_segments,
  CASE
    WHEN l.round_length_minutes = 2 AND COUNT(bs.id) != 24 THEN 'MISMATCH'
    WHEN l.round_length_minutes = 3 AND COUNT(bs.id) != 36 THEN 'MISMATCH'
    ELSE 'OK'
  END as status
FROM battles b
INNER JOIN leagues l ON l.id = b.league_id
LEFT JOIN battle_segments bs ON bs.battle_id = b.id
WHERE b.status = 'completed'
GROUP BY b.id, l.round_length_minutes
HAVING status = 'MISMATCH';
-- Expected: 0 rows

-- C.2 Verify each battler has exactly 3 rounds per completed battle
SELECT
  b.id as battle_id,
  br.battler_id,
  COUNT(*) as round_count
FROM battles b
INNER JOIN battle_rounds br ON br.battle_id = b.id
WHERE b.status = 'completed'
GROUP BY b.id, br.battler_id
HAVING COUNT(*) != 3;
-- Expected: 0 rows

-- C.3 Check for orphaned prep_blocks (battle doesn't exist)
SELECT pb.id, pb.battle_id
FROM prep_blocks pb
LEFT JOIN battles b ON b.id = pb.battle_id
WHERE b.id IS NULL;
-- Expected: 0 rows

-- C.4 Check for orphaned battle_rounds
SELECT br.id, br.battle_id
FROM battle_rounds br
LEFT JOIN battles b ON b.id = br.battle_id
WHERE b.id IS NULL;
-- Expected: 0 rows

-- C.5 Check for orphaned battle_segments
SELECT bs.id, bs.battle_id
FROM battle_segments bs
LEFT JOIN battles b ON b.id = bs.battle_id
WHERE b.id IS NULL;
-- Expected: 0 rows

-- C.6 Verify no duplicate prep blocks for same day
SELECT
  battle_id,
  battler_id,
  day_index,
  COUNT(*) as duplicate_count
FROM prep_blocks
GROUP BY battle_id, battler_id, day_index
HAVING COUNT(*) > 1;
-- Expected: 0 rows (UNIQUE constraint should prevent this)

-- =====================================================
-- D. ELO Rating Validation
-- =====================================================

-- D.1 Check for extreme rating drift (outside reasonable bounds)
SELECT
  b.stage_name,
  r.rating,
  r.wins,
  r.losses
FROM rankings r
INNER JOIN battlers b ON b.id = r.battler_id
WHERE r.rating < 800 OR r.rating > 2400;
-- Expected: 0 rows for normal gameplay (extreme ratings indicate bugs)

-- D.2 Verify streak logic consistency
SELECT
  b.stage_name,
  r.wins,
  r.losses,
  r.streak
FROM rankings r
INNER JOIN battlers b ON b.id = r.battler_id
WHERE (r.streak > r.wins)  -- Positive streak can't exceed total wins
   OR (r.streak < -r.losses); -- Negative streak can't exceed total losses
-- Expected: 0 rows

-- D.3 Check AI battler ratings are evolving (not static)
-- This query checks if AI battlers have had rating changes
SELECT
  b.id,
  b.stage_name,
  r.rating,
  r.wins,
  r.losses
FROM battlers b
INNER JOIN rankings r ON r.battler_id = b.id
WHERE b.is_ai = true
  AND (r.wins > 0 OR r.losses > 0)
  AND r.rating = 1200;
-- Expected: 0 rows after battles (AI ratings should change from initial 1200)

-- =====================================================
-- E. RLS & Ownership Validation
-- =====================================================

-- E.1 Verify every player battler has a user_id
SELECT id, stage_name, user_id
FROM battlers
WHERE is_ai = false
  AND user_id IS NULL;
-- Expected: 0 rows

-- E.2 Verify every AI battler has NULL user_id
SELECT id, stage_name, user_id
FROM battlers
WHERE is_ai = true
  AND user_id IS NOT NULL;
-- Expected: 0 rows

-- E.3 Verify every battler has attributes
SELECT b.id, b.stage_name
FROM battlers b
LEFT JOIN battler_attributes ba ON ba.battler_id = b.id
WHERE ba.battler_id IS NULL;
-- Expected: 0 rows

-- E.4 Verify every battler has a ranking
SELECT b.id, b.stage_name
FROM battlers b
LEFT JOIN rankings r ON r.battler_id = b.id
WHERE r.battler_id IS NULL;
-- Expected: 0 rows

-- =====================================================
-- F. News & Life Events Validation
-- =====================================================

-- F.1 Verify completed battles have news articles
SELECT
  b.id as battle_id,
  b.status,
  COUNT(na.id) as article_count
FROM battles b
LEFT JOIN news_articles na ON na.battle_id = b.id
WHERE b.status = 'completed'
GROUP BY b.id, b.status
HAVING COUNT(na.id) = 0;
-- Expected: 0 rows after Phase 6 (every completed battle should have a recap)

-- F.2 Verify news articles have valid slugs (unique and non-null)
SELECT slug, COUNT(*) as duplicate_count
FROM news_articles
GROUP BY slug
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- F.3 Check for life events without valid templates
SELECT ble.id, ble.template_id
FROM battler_life_events ble
LEFT JOIN life_event_templates let ON let.id = ble.template_id
WHERE ble.template_id IS NOT NULL
  AND let.id IS NULL;
-- Expected: 0 rows

-- =====================================================
-- G. Summary Statistics (For Info)
-- =====================================================

-- G.1 Battle status distribution
SELECT status, COUNT(*) as count
FROM battles
GROUP BY status
ORDER BY count DESC;

-- G.2 Average battles per player
SELECT
  COUNT(DISTINCT battler_player_id) as total_players,
  COUNT(*) as total_battles,
  ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT battler_player_id), 0), 2) as avg_battles_per_player
FROM battles
WHERE status = 'completed';

-- G.3 Rating distribution
SELECT
  CASE
    WHEN r.rating < 1100 THEN '<1100'
    WHEN r.rating < 1200 THEN '1100-1200'
    WHEN r.rating < 1300 THEN '1200-1300'
    WHEN r.rating < 1400 THEN '1300-1400'
    WHEN r.rating < 1500 THEN '1400-1500'
    ELSE '1500+'
  END as rating_range,
  COUNT(*) as battler_count
FROM rankings r
GROUP BY rating_range
ORDER BY rating_range;

-- G.4 Prep completion rate
SELECT
  b.id,
  b.battler_player_id,
  CASE
    WHEN COUNT(pb.id) > 0 THEN 'Prepped'
    ELSE 'No Prep'
  END as prep_status
FROM battles b
LEFT JOIN prep_blocks pb ON pb.battle_id = b.id AND pb.battler_id = b.battler_player_id
WHERE b.status = 'completed'
GROUP BY b.id, b.battler_player_id;

-- G.5 Most common event flags in segments
SELECT
  jsonb_array_elements_text(event_flags) as event_flag,
  COUNT(*) as occurrence_count
FROM battle_segments
GROUP BY event_flag
ORDER BY occurrence_count DESC;
