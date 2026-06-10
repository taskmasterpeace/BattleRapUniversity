-- ═══════════════════════════════════════════════════════════════════════════
-- DEV BACKFILL: populate the city layer of the world.
--
-- The travel/recruit system needs battlers and leagues to actually live in
-- cities. The original migration backfill (20260610000000 §6) was a no-op
-- because leagues.city_id was never seeded. This script:
--   1. Assigns every AI battler a current + hometown city based on region
--   2. Spreads leagues across cities round-robin
--
-- Run: docker exec -i supabase_db_ai-battlerap psql -U postgres -d postgres \
--        < scripts/backfill-city-data.sql
-- Idempotent: only touches rows with NULL city columns.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. AI battlers → cities by region (alternating within each region)
WITH ai AS (
  SELECT b.id, b.region,
         row_number() OVER (PARTITION BY COALESCE(b.region, 'none') ORDER BY b.id) AS rn
  FROM battlers b
  WHERE b.is_ai = true
    AND b.current_city_id IS NULL
    AND b.stage_name NOT LIKE 'Test\_%'
),
pick AS (
  SELECT ai.id AS battler_id,
         CASE COALESCE(ai.region, 'none')
           WHEN 'East Coast'    THEN (ARRAY['New York City','Philadelphia'])[(ai.rn % 2) + 1]
           WHEN 'West Coast'    THEN (ARRAY['Los Angeles','Oakland'])[(ai.rn % 2) + 1]
           WHEN 'Midwest'       THEN (ARRAY['Chicago','Detroit'])[(ai.rn % 2) + 1]
           WHEN 'South'         THEN (ARRAY['Atlanta','Houston'])[(ai.rn % 2) + 1]
           WHEN 'International' THEN (ARRAY['London','Toronto'])[(ai.rn % 2) + 1]
           ELSE (ARRAY['New York City','Los Angeles','Chicago','Atlanta','Houston',
                       'Detroit','Philadelphia','Oakland','Toronto','London'])[(ai.rn % 10) + 1]
         END AS city_name
  FROM ai
)
UPDATE battlers b
SET current_city_id  = c.id,
    hometown_city_id = COALESCE(b.hometown_city_id, c.id)
FROM pick p
JOIN cities c ON c.name = p.city_name
WHERE b.id = p.battler_id;

-- 2. Leagues → cities round-robin (only leagues without a city)
WITH l AS (
  SELECT id, row_number() OVER (ORDER BY name) AS rn
  FROM leagues
  WHERE city_id IS NULL
),
c AS (
  SELECT id, row_number() OVER (ORDER BY name) AS cn, count(*) OVER () AS total
  FROM cities
)
UPDATE leagues
SET city_id = c.id
FROM l
JOIN c ON c.cn = ((l.rn - 1) % c.total) + 1
WHERE leagues.id = l.id;
