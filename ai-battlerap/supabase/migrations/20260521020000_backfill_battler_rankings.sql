-- =====================================================
-- Backfill rankings rows for AI battlers missing them
-- =====================================================
-- Date: 2026-05-21
-- Purpose: 75 mid-tier AI battlers from the league roster seed
-- were inserted without rankings rows. Matchmaking and offer
-- generation rely on rankings.rating, so backfill with a
-- tier-appropriate starting rating.
--
-- Rating bases by tier:
--   low:  1050 ± 50
--   mid:  1275 ± 75
--   top:  1475 ± 75
--   god:  1675 ± 75
-- =====================================================

INSERT INTO rankings (battler_id, rating, wins, losses, streak)
SELECT
  b.id,
  CASE b.tier
    WHEN 'low' THEN 1050 + (FLOOR(RANDOM() * 100) - 50)::INT
    WHEN 'mid' THEN 1275 + (FLOOR(RANDOM() * 150) - 75)::INT
    WHEN 'top' THEN 1475 + (FLOOR(RANDOM() * 150) - 75)::INT
    WHEN 'god' THEN 1675 + (FLOOR(RANDOM() * 150) - 75)::INT
    ELSE 1200
  END AS rating,
  0,
  0,
  0
FROM battlers b
WHERE b.is_ai = TRUE
  AND NOT EXISTS (SELECT 1 FROM rankings r WHERE r.battler_id = b.id);

DO $$
DECLARE
  total_ai INT;
  total_ranked INT;
  by_tier RECORD;
BEGIN
  SELECT COUNT(*) INTO total_ai FROM battlers WHERE is_ai = TRUE;
  SELECT COUNT(*) INTO total_ranked
    FROM battlers b
    JOIN rankings r ON r.battler_id = b.id
    WHERE b.is_ai = TRUE;
  RAISE NOTICE '📊 AI battlers: % total, % with rankings', total_ai, total_ranked;

  FOR by_tier IN
    SELECT b.tier, COUNT(*) AS cnt,
           ROUND(AVG(r.rating))::INT AS avg_rating,
           MIN(r.rating) AS min_r, MAX(r.rating) AS max_r
    FROM battlers b
    JOIN rankings r ON r.battler_id = b.id
    WHERE b.is_ai = TRUE
    GROUP BY b.tier
    ORDER BY avg_rating
  LOOP
    RAISE NOTICE '  tier=% count=% avg=% range=%-%',
      by_tier.tier, by_tier.cnt, by_tier.avg_rating, by_tier.min_r, by_tier.max_r;
  END LOOP;
END $$;
