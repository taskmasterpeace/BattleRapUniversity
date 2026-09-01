-- Sticky reputation labels — the "on your record" ledger.
-- See docs/design/STICKY_LABELS.md. One lifetime row per (battler, label);
-- pinned by life events or baked at generation, decays on the battle clock,
-- retires when its gate is met (or never, if permanent).

create table if not exists battler_labels (
  id uuid primary key default gen_random_uuid(),
  battler_id uuid not null references battlers(id) on delete cascade,
  key text not null,
  tier text not null check (tier in ('permanent', 'durable', 'fresh')),
  tone text not null check (tone in ('gas', 'shade', 'neutral')),
  heat smallint not null default 0 check (heat between 0 and 100),
  -- Completed-battle count already applied (prevents double / read-triggered decay).
  processed_battle_count integer not null default 0,
  -- Recovery progress (e.g. CHOKER's clean-battle streak).
  evidence_count smallint not null default 0,
  qualifying_evidence_count smallint not null default 0,
  status text not null default 'active' check (status in ('active', 'retired')),
  -- First/latest receipt: event code, choice, battle id, evidence stage, visibility.
  source jsonb not null default '{}',
  pinned_at timestamptz not null default now(),
  last_reinforced_at timestamptz not null default now(),
  retired_at timestamptz,
  unique (battler_id, key)
);

create index if not exists idx_battler_labels_active
  on battler_labels (battler_id, status, heat desc);

-- Reputation is observable: anyone can read a battler's labels.
alter table battler_labels enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'battler_labels' and policyname = 'battler_labels_public_read'
  ) then
    create policy battler_labels_public_read on battler_labels
      for select using (true);
  end if;
end $$;

-- Writes are service-role only (the post-battle / creation pipeline). No public
-- INSERT/UPDATE/DELETE policy — RLS denies them by default; service role bypasses RLS.

comment on table battler_labels is
  'Sticky reputation labels (on-your-record layer). Pinned by life events / generation, decays on the battle clock. Definitions (display, effect, modifiers, decay, recovery) live in lib/game/labels/registry.ts — never duplicated here.';
