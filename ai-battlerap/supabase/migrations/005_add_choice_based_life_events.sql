-- Phase 6: Add Choice-Based Life Events System
-- Extends the life events system with player choices and trigger conditions

-- ==========================================
-- 1. DROP EXISTING LIFE EVENT TABLES
-- ==========================================
-- We need to recreate these tables with the new schema

drop table if exists battler_life_events cascade;
drop table if exists life_event_templates cascade;

-- ==========================================
-- 2. LIFE EVENT TEMPLATES (WITH CHOICES)
-- ==========================================

create table if not exists life_event_templates (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  description text not null,

  -- Trigger configuration
  trigger_type text not null check (trigger_type in (
    'battle_result',  -- Triggered by battle outcomes
    'time',           -- Triggered by time passing (future)
    'attribute',      -- Triggered by attribute thresholds (future)
    'random'          -- Random events (future)
  )),
  trigger_condition jsonb not null, -- JSON conditions for triggering

  -- Choice A (always required)
  choice_a_text text not null,
  choice_a_effects jsonb not null, -- Attribute changes, prep bonuses, etc.

  -- Choice B (optional - some events may have only one option)
  choice_b_text text,
  choice_b_effects jsonb,

  created_at timestamptz default now()
);

-- Index for faster lookups by trigger type
create index if not exists idx_life_event_templates_trigger_type
  on life_event_templates (trigger_type);

-- ==========================================
-- 3. BATTLER LIFE EVENTS (INSTANCES)
-- ==========================================

create table if not exists battler_life_events (
  id uuid primary key default gen_random_uuid(),
  battler_id uuid not null references battlers(id) on delete cascade,
  template_code text not null references life_event_templates(code),
  battle_id uuid references battles(id), -- If triggered by a battle

  -- Status tracking
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  chosen_option text check (chosen_option in ('a', 'b')), -- Which choice was made

  -- Timestamps
  triggered_at timestamptz not null default now(),
  resolved_at timestamptz,

  -- Metadata
  details_json jsonb not null default '{}'
);

-- Indexes
create index if not exists idx_battler_life_events_battler
  on battler_life_events (battler_id, triggered_at desc);

create index if not exists idx_battler_life_events_status
  on battler_life_events (status);

create index if not exists idx_battler_life_events_template
  on battler_life_events (template_code);

-- RLS: Battlers can see their own pending events
alter table battler_life_events enable row level security;

create policy "Battlers can view their own life events"
  on battler_life_events for select
  to authenticated
  using (
    battler_id in (
      select id from battlers where user_id = auth.uid()
    )
  );

-- Only service role can create/update life events
create policy "Service role can manage life events"
  on battler_life_events for all
  to service_role
  using (true)
  with check (true);
