-- =====================================================
-- THE WIRE — in-world social network (MVP)
-- Spec: docs/design/THE_WIRE_SOCIAL_NETWORK.md
-- Battle rap lives online. Feed rhythm of a social network with an
-- original identity: Drops, Boosts, Props, Heating Up, Stamped.
-- Multiplayer-shaped from day one: nothing assumes a single player.
-- Additive + idempotent (prod-safe).
-- =====================================================

-- Accounts are AGENTS with incentives, not text dispensers.
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL UNIQUE,                 -- '@PenGameRespecter'
  display_name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('battler','fan','league','blogger','promoter','meme_page','manager','scout')),
  battler_id UUID REFERENCES battlers(id) ON DELETE CASCADE,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  voice_profile TEXT NOT NULL DEFAULT 'fan_casual',
  influence INT NOT NULL DEFAULT 30 CHECK (influence BETWEEN 0 AND 100),
  credibility INT NOT NULL DEFAULT 50 CHECK (credibility BETWEEN 0 AND 100),
  controversy_tolerance INT NOT NULL DEFAULT 50 CHECK (controversy_tolerance BETWEEN 0 AND 100),
  favorite_styles TEXT[] NOT NULL DEFAULT '{}',
  posting_frequency NUMERIC NOT NULL DEFAULT 0.5,   -- 0-1 share of eligible events they post on
  stamped BOOLEAN NOT NULL DEFAULT FALSE,           -- in-world "verified"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_social_accounts_kind ON social_accounts(kind);
CREATE INDEX IF NOT EXISTS idx_social_accounts_battler ON social_accounts(battler_id) WHERE battler_id IS NOT NULL;

-- Drops. body is described moments/reactions — NEVER generated rap bars.
CREATE TABLE IF NOT EXISTS wire_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) <= 300),
  category TEXT NOT NULL CHECK (category IN ('reaction','callout','rumor','league_news','meme','analysis','defense','announcement','viral_clip','snub')),
  feed_hint TEXT NOT NULL DEFAULT 'for_you' CHECK (feed_hint IN ('for_you','league_wire','rumor_mill','battle_live','scouting')),
  battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,
  life_event_id UUID REFERENCES battler_life_events(id) ON DELETE SET NULL,
  target_battler_id UUID REFERENCES battlers(id) ON DELETE CASCADE,
  crowd_tag TEXT,                              -- '#KiloVsNova' — feeds Heating Up
  props INT NOT NULL DEFAULT 0 CHECK (props >= 0),
  boosts INT NOT NULL DEFAULT 0 CHECK (boosts >= 0),
  replies INT NOT NULL DEFAULT 0 CHECK (replies >= 0),
  actionable TEXT CHECK (actionable IN ('callout','controversy')),  -- player can respond
  meta_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wire_posts_created ON wire_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wire_posts_target ON wire_posts(target_battler_id, created_at DESC) WHERE target_battler_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wire_posts_tag ON wire_posts(crowd_tag) WHERE crowd_tag IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wire_posts_battle ON wire_posts(battle_id) WHERE battle_id IS NOT NULL;

-- Player responses: manager drops, replies to callouts, deliberate silence.
-- Players never type free text — stance-based, templated (no user-generated text law).
CREATE TABLE IF NOT EXISTS wire_player_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES wire_posts(id) ON DELETE CASCADE,   -- NULL for standalone manager drops
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('manager_drop','reply','ignore')),
  stance TEXT,                                 -- 'hype' | 'defend' | 'humble' | 'fire_back' | 'take_high_road'
  result_post_id UUID REFERENCES wire_posts(id) ON DELETE SET NULL,
  effects_applied JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, battler_id)
);

-- RLS (repo convention: world-readable, service-role writes)
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wire_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wire_player_actions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'social_accounts' AND policyname = 'social_accounts_select_policy') THEN
    CREATE POLICY "social_accounts_select_policy" ON social_accounts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'social_accounts' AND policyname = 'social_accounts_service_policy') THEN
    CREATE POLICY "social_accounts_service_policy" ON social_accounts FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wire_posts' AND policyname = 'wire_posts_select_policy') THEN
    CREATE POLICY "wire_posts_select_policy" ON wire_posts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wire_posts' AND policyname = 'wire_posts_service_policy') THEN
    CREATE POLICY "wire_posts_service_policy" ON wire_posts FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wire_player_actions' AND policyname = 'wire_player_actions_select_policy') THEN
    CREATE POLICY "wire_player_actions_select_policy" ON wire_player_actions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wire_player_actions' AND policyname = 'wire_player_actions_service_policy') THEN
    CREATE POLICY "wire_player_actions_service_policy" ON wire_player_actions FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- =====================================================
-- SEED: the founding voices of the scene (fans, bloggers,
-- meme pages, promoters, scouts). League + battler accounts
-- are generated below from real rows.
-- =====================================================
INSERT INTO social_accounts (handle, display_name, kind, voice_profile, influence, credibility, controversy_tolerance, posting_frequency, stamped) VALUES
  ('@PenGameRespecter',  'Pen Game Respecter',   'fan',       'fan_purist',      42, 70, 30, 0.8, false),
  ('@barsonly',          'BARS ONLY',            'fan',       'fan_purist',      35, 65, 25, 0.7, false),
  ('@hoodclassics',      'Hood Classics',        'fan',       'fan_streets',     48, 55, 70, 0.7, false),
  ('@QueenOfTheCulture', 'Queen Of The Culture', 'fan',       'fan_hype',        61, 50, 60, 0.9, false),
  ('@CasualWatcher99',   'Casual Watcher',       'fan',       'fan_casual',      18, 35, 40, 0.5, false),
  ('@ThirdRowTina',      'Third Row Tina',       'fan',       'fan_eyewitness',  33, 75, 45, 0.6, false),
  ('@DebatableDee',      'Debatable Dee',        'fan',       'fan_contrarian',  40, 45, 80, 0.8, false),
  ('@SmokeDetector_BR',  'Smoke Detector',       'fan',       'fan_drama',       52, 40, 95, 0.9, false),
  ('@LeaguesideJay',     'Leagueside Jay',       'blogger',   'analyst_measured',58, 85, 35, 0.7, true),
  ('@PunchlineWatch',    'Punchline Watch',      'blogger',   'analyst_moments', 64, 78, 50, 0.8, true),
  ('@TheWireReport',     'The Wire Report',      'blogger',   'analyst_news',    72, 88, 30, 0.9, true),
  ('@BarometerBlog',     'The Barometer',        'blogger',   'analyst_rankings',55, 80, 40, 0.6, true),
  ('@ClipChannelKing',   'Clip Channel King',    'meme_page', 'meme_clips',      69, 30, 85, 0.9, false),
  ('@RewindThatBR',      'REWIND THAT',          'meme_page', 'meme_hype',       57, 25, 75, 0.8, false),
  ('@DeadRoomEnergy',    'Dead Room Energy',     'meme_page', 'meme_roast',      50, 20, 90, 0.7, false),
  ('@BookedAndBusyPromo','Booked & Busy',        'promoter',  'promoter_hustle', 46, 45, 65, 0.5, false),
  ('@CultureVultureCap', 'Culture Vulture Capital','promoter','promoter_money',  38, 30, 70, 0.4, false),
  ('@ScoutSeesAll',      'Scout Sees All',       'scout',     'scout_eye',       44, 82, 20, 0.5, true),
  ('@OpenMicMissionary', 'Open Mic Missionary',  'scout',     'scout_grassroots',28, 68, 15, 0.4, false),
  ('@RumorHasItBR',      'Rumor Has It',         'fan',       'rumor_anon',      47, 15, 100, 0.8, false)
ON CONFLICT (handle) DO NOTHING;

-- Every league speaks with an official Stamped account.
INSERT INTO social_accounts (handle, display_name, kind, league_id, voice_profile, influence, credibility, controversy_tolerance, posting_frequency, stamped)
SELECT
  '@' || regexp_replace(l.name, '[^a-zA-Z0-9]', '', 'g') || 'Official',
  l.name,
  'league',
  l.id,
  'league_official',
  70, 95, 5, 1.0, true
FROM leagues l
ON CONFLICT (handle) DO NOTHING;

-- Every AI battler gets a voice on the Wire (players' battlers speak
-- through manager drops instead — the player IS the voice).
INSERT INTO social_accounts (handle, display_name, kind, battler_id, voice_profile, influence, credibility, controversy_tolerance, posting_frequency, stamped)
SELECT
  '@' || regexp_replace(b.stage_name, '[^a-zA-Z0-9]', '', 'g'),
  b.stage_name,
  'battler',
  b.id,
  'battler_ego',
  35, 50, 60, 0.35, false
FROM battlers b
WHERE b.is_ai = TRUE AND b.stage_name NOT ILIKE 'Test_%'
ON CONFLICT (handle) DO NOTHING;

COMMENT ON TABLE social_accounts IS 'The Wire: in-world social accounts modeled as agents with incentives (spec: docs/design/THE_WIRE_SOCIAL_NETWORK.md)';
COMMENT ON TABLE wire_posts IS 'The Wire: drops. Described moments/reactions only — never generated rap bars.';
COMMENT ON TABLE wire_player_actions IS 'The Wire: stance-based player responses (manager drops, callout replies, deliberate silence). No free text.';
