-- Fix: 001_initial_schema.sql created news_articles with a restrictive type CHECK
-- (only 'battle_recap', 'scandal', 'career_update'). Migration 003 attempted to
-- recreate the table with an expanded CHECK using `create table if not exists`,
-- which was a no-op because the table already existed. The seed migration
-- 20251203000000_seed_news_articles.sql inserts rows of type 'league_update' and
-- 'power_ranking' and crashes the seed.
--
-- This migration drops the legacy constraint and recreates it with the full set
-- of allowed types from 003 + everything actually used in seeds.

ALTER TABLE news_articles DROP CONSTRAINT IF EXISTS news_articles_type_check;

ALTER TABLE news_articles ADD CONSTRAINT news_articles_type_check
  CHECK (type IN (
    'battle_recap',
    'scandal',
    'career_update',
    'league_update',
    'power_ranking'
  ));
