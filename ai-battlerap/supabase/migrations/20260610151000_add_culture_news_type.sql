-- World Events layer: scene/culture coverage that isn't tied to a battle.
-- Adds the 'culture' article type used by lib/game/worldEvents
-- (viral clips, barbershop debates, city scene reports, lifestyle stories).

ALTER TABLE news_articles DROP CONSTRAINT IF EXISTS news_articles_type_check;

ALTER TABLE news_articles ADD CONSTRAINT news_articles_type_check
  CHECK (type IN (
    'battle_recap',
    'scandal',
    'career_update',
    'league_update',
    'power_ranking',
    'grudge_coverage',
    'culture'
  ));
