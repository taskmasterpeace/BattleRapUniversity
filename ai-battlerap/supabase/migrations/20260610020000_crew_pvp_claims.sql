-- ═══════════════════════════════════════════════════════════════════════════
-- CREW RECRUITING + ASYNC PVP + VERIFIED CLAIM CODES
-- One migration for the three systems shipping together, so feature branches
-- never fight over schema.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. CREW (recruiting) ────────────────────────────────────────────────────
-- Players recruit AI battlers into their crew. You must be IN a battler's city
-- to recruit them (travel matters). Max 3 members. Each member contributes a
-- specialty bonus to battle prep.
CREATE TABLE IF NOT EXISTS crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  member_battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL CHECK (specialty IN ('research', 'writing', 'performance')),
  recruited_in_city_id UUID REFERENCES cities(id),
  recruit_cost INTEGER NOT NULL DEFAULT 0,
  recruited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_battler_id, member_battler_id)
);

CREATE INDEX IF NOT EXISTS idx_crew_owner ON crew_members(owner_battler_id);

ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crew_read" ON crew_members;
CREATE POLICY "crew_read" ON crew_members FOR SELECT USING (true);

-- ── 2. ASYNC PVP ────────────────────────────────────────────────────────────
-- PvP battles reuse the battles table: battler_player_id = challenger,
-- battler_ai_id = challenged player's battler (is_ai = false on both).
-- Each side preps independently; when both lock in, the battle simulates
-- immediately. If scheduled_at passes first, the cron simulates with whatever
-- prep exists (existing no-show penalties handle ghosting).
ALTER TABLE battles ADD COLUMN IF NOT EXISTS is_pvp BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS challenger_locked_at TIMESTAMPTZ;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS challenged_locked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_battles_pvp ON battles(is_pvp) WHERE is_pvp = true;

-- ── 3. VERIFIED CLAIM CODES ────────────────────────────────────────────────
-- Admin generates a one-time code for a real battler; the battler signs up,
-- enters the code at /claim, and their account is linked to the verified
-- profile + granted the verified_battler role.
CREATE TABLE IF NOT EXISTS claim_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  claimed_by UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMPTZ
);

ALTER TABLE claim_codes ENABLE ROW LEVEL SECURITY;
-- No public read: codes are secrets. Service-role only.

-- ── 4. TRAVEL COSTS (config via city scene_size) ───────────────────────────
-- Flat-rate travel priced by destination scene size; read by the travel API.
-- (Kept as data, not code, so ops can tune without a deploy.)
CREATE TABLE IF NOT EXISTS travel_costs (
  scene_size TEXT PRIMARY KEY,
  cost INTEGER NOT NULL
);

INSERT INTO travel_costs (scene_size, cost) VALUES
  ('small', 100),
  ('medium', 200),
  ('large', 350),
  ('massive', 500),
  ('major', 500)
ON CONFLICT (scene_size) DO NOTHING;
