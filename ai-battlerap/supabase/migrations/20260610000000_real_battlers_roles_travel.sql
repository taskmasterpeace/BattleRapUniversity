-- ═══════════════════════════════════════════════════════════════════════════
-- REAL BATTLER INFRASTRUCTURE + ROLES + TRAVEL + DAILY BATTLE SLOTS
--
-- The sustainability layer: real battle rappers' licensed likenesses live in
-- the game as verified profiles (Tru Foe is the pilot). Players choose a home
-- city and can travel to recruit/battle. AI battles are rate-limited per day
-- so competing beats grinding.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. ROLES ────────────────────────────────────────────────────────────────
-- player          : default, owns a created battler
-- verified_battler: a real battle rapper managing their licensed likeness
-- league_operator : trusted user who can run leagues/events
-- admin           : full content tools
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('player', 'verified_battler', 'league_operator', 'admin')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Everyone can read roles (needed to render VERIFIED badges etc.);
-- only service role can write (role grants happen through admin endpoints).
DROP POLICY IF EXISTS "user_roles_read" ON user_roles;
CREATE POLICY "user_roles_read" ON user_roles FOR SELECT USING (true);

-- ── 2. REAL BATTLERS ────────────────────────────────────────────────────────
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS is_real BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS verified_user_id UUID REFERENCES auth.users(id);
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS real_name TEXT;
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS hometown_city_id UUID REFERENCES cities(id);
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS current_city_id UUID REFERENCES cities(id);
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS likeness_status TEXT
  CHECK (likeness_status IN ('licensed', 'pending', 'unofficial'))
  DEFAULT NULL; -- only meaningful when is_real = true

CREATE INDEX IF NOT EXISTS idx_battlers_is_real ON battlers(is_real) WHERE is_real = true;
CREATE INDEX IF NOT EXISTS idx_battlers_current_city ON battlers(current_city_id);

-- ── 3. ACCOLADES (RapVerdict-style ranked achievements) ─────────────────────
-- Both real-world accolades (entered by admins for real battlers) and
-- in-game earned accolades (season records) live here.
CREATE TABLE IF NOT EXISTS battler_accolades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  rank INTEGER,                          -- 1 = "1st", null = unranked honor
  title TEXT NOT NULL,                   -- "Longest Win Streak", "Most 3-0s"
  scope TEXT NOT NULL DEFAULT 'in_game', -- 'real_world' | 'in_game'
  region TEXT,                           -- "US", "Midwest", "STL"
  year INTEGER,
  source TEXT,                           -- where a real-world accolade comes from
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accolades_battler ON battler_accolades(battler_id);

ALTER TABLE battler_accolades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "accolades_read" ON battler_accolades;
CREATE POLICY "accolades_read" ON battler_accolades FOR SELECT USING (true);

-- ── 4. DAILY AI BATTLE SLOTS ────────────────────────────────────────────────
-- 3 base slots/day + earned bonus slots. PvP battles never consume slots.
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS bonus_battle_slots INTEGER NOT NULL DEFAULT 0;
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS slots_reset_at DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS slots_used_today INTEGER NOT NULL DEFAULT 0;

-- ── 5. TRAVEL ───────────────────────────────────────────────────────────────
-- A battler's current city affects which local battlers/leagues they see and
-- can recruit/study. Travel history feeds storylines ("he came to Philly...").
CREATE TABLE IF NOT EXISTS battler_travels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  from_city_id UUID REFERENCES cities(id),
  to_city_id UUID NOT NULL REFERENCES cities(id),
  traveled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  purpose TEXT CHECK (purpose IN ('recruit', 'battle', 'visit')) DEFAULT 'visit'
);

CREATE INDEX IF NOT EXISTS idx_travels_battler ON battler_travels(battler_id);

ALTER TABLE battler_travels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "travels_read" ON battler_travels;
CREATE POLICY "travels_read" ON battler_travels FOR SELECT USING (true);

-- ── 6. Backfill: AI battlers' current city = their league's city ───────────
UPDATE battlers b
SET current_city_id = l.city_id,
    hometown_city_id = COALESCE(b.hometown_city_id, l.city_id)
FROM leagues l
WHERE b.primary_league_id = l.id
  AND l.city_id IS NOT NULL
  AND b.current_city_id IS NULL;

-- ── 7. Matchup simulations (shareable exhibition battles) ───────────────────
-- Fantasy matchups between any two battlers. NOT career battles — exhibition
-- sims with a permanent shareable URL. The anti-RapVerdict.
CREATE TABLE IF NOT EXISTS matchup_sims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,             -- "tru-foe-vs-scheme-architect-x7k2"
  battler_a_id UUID NOT NULL REFERENCES battlers(id),
  battler_b_id UUID NOT NULL REFERENCES battlers(id),
  winner_id UUID REFERENCES battlers(id),
  verdict TEXT,                          -- "3-0", "2-1"
  rounds_json JSONB NOT NULL DEFAULT '[]', -- per-round scores/events for replay
  headline TEXT,                         -- AI-generated recap headline
  recap_markdown TEXT,                   -- short AI recap body
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_matchup_sims_slug ON matchup_sims(slug);

ALTER TABLE matchup_sims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "matchup_sims_read" ON matchup_sims;
CREATE POLICY "matchup_sims_read" ON matchup_sims FOR SELECT USING (true);
