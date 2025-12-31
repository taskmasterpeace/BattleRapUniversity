-- Phase 6: News Articles and Life Events System
-- Creates tables for media content and battler life events

-- ==========================================
-- 1. NEWS ARTICLES
-- ==========================================

create table if not exists news_articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  type text not null check (type in (
    'battle_recap',
    'scandal',
    'career_update',
    'league_update',
    'power_ranking'
  )),
  body_markdown text not null,
  primary_battler_id uuid references battlers(id),
  secondary_battler_id uuid references battlers(id),
  league_id uuid references leagues(id),
  battle_id uuid references battles(id),
  meta_json jsonb not null default '{}',
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_news_published_at
  on news_articles (published_at desc);

create index if not exists idx_news_type
  on news_articles (type);

create index if not exists idx_news_primary_battler
  on news_articles (primary_battler_id);

create index if not exists idx_news_secondary_battler
  on news_articles (secondary_battler_id);

create index if not exists idx_news_league
  on news_articles (league_id);

create index if not exists idx_news_battle
  on news_articles (battle_id);

-- RLS: Readable by all authenticated users
alter table news_articles enable row level security;

create policy "News articles are readable by authenticated users"
  on news_articles for select
  to authenticated
  using (true);

-- ==========================================
-- 2. LIFE EVENT TEMPLATES
-- ==========================================

create table if not exists life_event_templates (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  category text not null check (category in (
    'career',
    'personal',
    'scandal',
    'health',
    'family'
  )),
  base_publicity integer not null default 5,
  base_reputation_delta integer not null default 0,
  description text not null
);

-- ==========================================
-- 3. BATTLER LIFE EVENTS
-- ==========================================

create table if not exists battler_life_events (
  id uuid primary key default gen_random_uuid(),
  battler_id uuid not null references battlers(id),
  template_id uuid references life_event_templates(id),
  battle_id uuid references battles(id),
  league_id uuid references leagues(id),
  occurred_at timestamptz not null default now(),
  public boolean not null default false,
  details_json jsonb not null default '{}'
);

-- Indexes
create index if not exists idx_battler_life_events_battler
  on battler_life_events (battler_id, occurred_at desc);

create index if not exists idx_battler_life_events_public
  on battler_life_events (public);

-- RLS
alter table battler_life_events enable row level security;

create policy "Life events are readable by authenticated users"
  on battler_life_events for select
  to authenticated
  using (public = true);
