-- World-population articles were inserted in single batches, so every article
-- shared (nearly) the same published_at and the media hub showed "20 hours ago"
-- on everything. Spread existing clumped world articles across the past 5 days.
--
-- "Clumped" = world-event articles whose published_at falls in the same minute
-- as at least one other world-event article (i.e. inserted by the same batch).

WITH clumped AS (
  SELECT id
  FROM news_articles
  WHERE meta_json->>'world_event' = 'true'
    AND date_trunc('minute', published_at) IN (
      SELECT date_trunc('minute', published_at)
      FROM news_articles
      WHERE meta_json->>'world_event' = 'true'
      GROUP BY 1
      HAVING count(*) > 1
    )
)
UPDATE news_articles n
SET published_at = now() - (random() * interval '5 days')
WHERE n.id IN (SELECT id FROM clumped);
