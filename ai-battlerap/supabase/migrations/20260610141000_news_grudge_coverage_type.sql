-- The rivalry narrative generator writes type='grudge_coverage' articles for
-- grudge matches, but the original check constraint never allowed it — every
-- grudge-match recap silently failed. Allow the type the code already emits.
ALTER TABLE news_articles DROP CONSTRAINT IF EXISTS news_articles_type_check;
ALTER TABLE news_articles ADD CONSTRAINT news_articles_type_check
  CHECK (type = ANY (ARRAY[
    'battle_recap'::text,
    'scandal'::text,
    'career_update'::text,
    'league_update'::text,
    'power_ranking'::text,
    'grudge_coverage'::text
  ]));
