-- Media persistence rail — durable ClipHive videos + Booth podcast episodes.
-- Composed once when a battle completes (lib/game/media/mediaPersistence.ts) and
-- read by /api/media/feed, so the media world is a permanent, browsable archive
-- instead of a rolling on-the-fly feed. Definitions live in code; this stores the
-- rendered items + the columns we filter on.

create table if not exists media_items (
  id uuid primary key default gen_random_uuid(),
  -- Deterministic item id from the composer (pod-<battleId> / vid-<battleId>) so
  -- re-composing a battle upserts instead of duplicating.
  slug text not null unique,
  battle_id uuid references battles(id) on delete cascade,
  kind text not null check (kind in ('podcast_episode', 'video_card')),
  title text not null,
  outlet text,                 -- show (podcast) or channel (video) name
  story text,                  -- upset | choke | dominant | classic | robbery | standard
  subject_battler_ids uuid[] not null default '{}',  -- who it's about → "about you"
  topic_tags text[] not null default '{}',           -- what it's about → filters
  payload jsonb not null,      -- the full MediaItem, ready to render
  created_at timestamptz not null default now()
);

create index if not exists idx_media_items_recent on media_items (created_at desc);
create index if not exists idx_media_items_kind on media_items (kind, created_at desc);
create index if not exists idx_media_items_subjects on media_items using gin (subject_battler_ids);
create index if not exists idx_media_items_tags on media_items using gin (topic_tags);

-- Media is observable: anyone can read it. Writes are service-role only.
alter table media_items enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'media_items' and policyname = 'media_items_public_read'
  ) then
    create policy media_items_public_read on media_items for select using (true);
  end if;
end $$;

comment on table media_items is
  'Persisted ClipHive/Booth media composed at battle completion. Rendered payload + filter columns; composer lives in lib/game/media/.';
