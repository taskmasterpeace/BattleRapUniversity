-- Add more valid types to news_articles
-- The original constraint only allowed: battle_recap, scandal, career_update
-- We need to also allow: league_update, grudge_coverage, power_ranking

ALTER TABLE news_articles DROP CONSTRAINT IF EXISTS news_articles_type_check;

ALTER TABLE news_articles ADD CONSTRAINT news_articles_type_check
  CHECK (type IN ('battle_recap', 'scandal', 'career_update', 'league_update', 'grudge_coverage', 'power_ranking'));
