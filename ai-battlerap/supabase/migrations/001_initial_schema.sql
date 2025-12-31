-- Initial schema for Algorithm Institute of BattleRap

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- LEAGUES
-- =====================================================
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  round_length_minutes INT NOT NULL CHECK (round_length_minutes IN (2, 3)),
  base_crowd_factor NUMERIC NOT NULL,
  writing_weight NUMERIC NOT NULL,
  performance_weight NUMERIC NOT NULL,
  booking_pace_days INT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- BATTLERS
-- =====================================================
CREATE TABLE battlers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  stage_name TEXT NOT NULL,
  region TEXT,
  primary_league_id UUID REFERENCES leagues(id),
  style_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  tier TEXT NOT NULL DEFAULT 'low' CHECK (tier IN ('low', 'mid', 'top', 'god')),
  is_ai BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_battlers_user_id ON battlers(user_id);
CREATE INDEX idx_battlers_is_ai ON battlers(is_ai);
CREATE INDEX idx_battlers_primary_league ON battlers(primary_league_id);

-- =====================================================
-- BATTLER ATTRIBUTES
-- =====================================================
CREATE TABLE battler_attributes (
  battler_id UUID PRIMARY KEY REFERENCES battlers(id) ON DELETE CASCADE,
  writing JSONB NOT NULL,
  performance JSONB NOT NULL,
  personal JSONB NOT NULL,
  resilience INT NOT NULL CHECK (resilience BETWEEN 1 AND 10),
  public_knowledge INT NOT NULL DEFAULT 0 CHECK (public_knowledge BETWEEN 0 AND 100),
  xp JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- RANKINGS
-- =====================================================
CREATE TABLE rankings (
  battler_id UUID PRIMARY KEY REFERENCES battlers(id) ON DELETE CASCADE,
  rating INT NOT NULL DEFAULT 1200,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  streak INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_rankings_rating ON rankings(rating DESC);

-- =====================================================
-- BATTLES
-- =====================================================
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id),
  battler_player_id UUID NOT NULL REFERENCES battlers(id),
  battler_ai_id UUID NOT NULL REFERENCES battlers(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  lock_prep_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'offered', 'accepted', 'declined', 'locked', 'simulated', 'completed', 'forfeit'
  )) DEFAULT 'offered',
  winner_battler_id UUID REFERENCES battlers(id),
  no_show_player BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_battles_player ON battles(battler_player_id);
CREATE INDEX idx_battles_status ON battles(status);
CREATE INDEX idx_battles_scheduled ON battles(scheduled_at);

-- =====================================================
-- PREP BLOCKS
-- =====================================================
CREATE TABLE prep_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  day_index INT NOT NULL,
  focus TEXT NOT NULL CHECK (focus IN ('research', 'writing', 'performance', 'life', 'rest')),
  auto_generated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (battle_id, battler_id, day_index)
);

CREATE INDEX idx_prep_blocks_battle ON prep_blocks(battle_id);

-- =====================================================
-- BATTLE ROUNDS
-- =====================================================
CREATE TABLE battle_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  round_index INT NOT NULL CHECK (round_index BETWEEN 1 AND 3),
  battler_id UUID NOT NULL REFERENCES battlers(id),
  average_score NUMERIC NOT NULL,
  peak_score NUMERIC NOT NULL,
  consistency_score NUMERIC NOT NULL,
  momentum_delta NUMERIC NOT NULL,
  crowd_reaction INT NOT NULL CHECK (crowd_reaction BETWEEN 0 AND 100),
  choked BOOLEAN NOT NULL DEFAULT FALSE,
  summary_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (battle_id, round_index, battler_id)
);

CREATE INDEX idx_battle_rounds_battle ON battle_rounds(battle_id);

-- =====================================================
-- BATTLE SEGMENTS
-- =====================================================
CREATE TABLE battle_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  round_index INT NOT NULL,
  segment_index INT NOT NULL,
  battler_id UUID NOT NULL REFERENCES battlers(id),
  segment_score NUMERIC NOT NULL,
  event_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_battle_segments_battle ON battle_segments(battle_id);

-- =====================================================
-- LIFE EVENTS
-- =====================================================
CREATE TABLE life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  trigger_source TEXT NOT NULL CHECK (trigger_source IN ('time', 'attribute', 'random', 'battle_result')),
  choice_made TEXT,
  attribute_changes JSONB,
  public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_life_events_battler ON life_events(battler_id);

-- =====================================================
-- NEWS ARTICLES
-- =====================================================
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('battle_recap', 'scandal', 'career_update')),
  primary_battler_id UUID REFERENCES battlers(id),
  secondary_battler_id UUID REFERENCES battlers(id),
  battle_id UUID REFERENCES battles(id),
  league_id UUID REFERENCES leagues(id),
  body_markdown TEXT NOT NULL,
  meta_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_articles_slug ON news_articles(slug);
CREATE INDEX idx_news_articles_type ON news_articles(type);
CREATE INDEX idx_news_articles_published ON news_articles(published_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Profiles: users can read their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Battlers: users can read all, but only insert/update their own
ALTER TABLE battlers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read battlers" ON battlers
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert own battler" ON battlers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own battler" ON battlers
  FOR UPDATE USING (auth.uid() = user_id);

-- Battler attributes: readable by all, writable by owner
ALTER TABLE battler_attributes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read attributes" ON battler_attributes
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert own attributes" ON battler_attributes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM battlers WHERE battlers.id = battler_attributes.battler_id AND battlers.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own attributes" ON battler_attributes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM battlers WHERE battlers.id = battler_attributes.battler_id AND battlers.user_id = auth.uid()
    )
  );

-- Rankings: readable by all
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read rankings" ON rankings
  FOR SELECT USING (TRUE);

-- Leagues: readable by all
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read leagues" ON leagues
  FOR SELECT USING (TRUE);

-- Battles: readable by participants
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read battles" ON battles
  FOR SELECT USING (TRUE);

-- Prep blocks: writable by battler owner
ALTER TABLE prep_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own prep" ON prep_blocks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM battlers WHERE battlers.id = prep_blocks.battler_id AND battlers.user_id = auth.uid()
    )
  );

-- Battle rounds: readable by all
ALTER TABLE battle_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read battle rounds" ON battle_rounds
  FOR SELECT USING (TRUE);

-- Battle segments: readable by all
ALTER TABLE battle_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read battle segments" ON battle_segments
  FOR SELECT USING (TRUE);

-- Life events: readable by battler owner
ALTER TABLE life_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own life events" ON life_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM battlers WHERE battlers.id = life_events.battler_id AND battlers.user_id = auth.uid()
    )
  );

-- News articles: readable by all
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read news" ON news_articles
  FOR SELECT USING (TRUE);
