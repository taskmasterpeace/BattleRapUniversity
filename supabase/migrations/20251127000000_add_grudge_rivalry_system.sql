-- Migration: Add Grudge/Rivalry System
-- Description: Persistent relationship tracking, head-to-head records, blogger memory, and rivalry storylines
-- Date: November 27, 2025

-- =====================================================
-- TABLE 1: battler_relationships
-- =====================================================
-- Purpose: Track persistent grudges/rivalries between battlers
-- Key Features: Intensity (0-100), origin stories, rematch demand, status

CREATE TABLE IF NOT EXISTS battler_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_a_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  battler_b_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- Intensity tracking (0-100 scale)
  intensity INT NOT NULL DEFAULT 0 CHECK (intensity >= 0 AND intensity <= 100),

  -- Rematch demand (0-100 scale) - fan interest in seeing rematch
  rematch_demand INT NOT NULL DEFAULT 0 CHECK (rematch_demand >= 0 AND rematch_demand <= 100),

  -- Status: 'active' (high tension), 'dormant' (cooled off), 'resolved' (settled)
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dormant', 'resolved')),

  -- Origin type categories based on American battle rap culture
  -- career: spot-stealing, gatekeeping, rankings disputes
  -- regional: same city, coast wars
  -- personal: betrayal, scandals, family disrespect
  -- business: no-shows, money disputes
  -- media: narrative-driven
  -- battle: controversial decision, upset, humiliation
  origin_type TEXT NOT NULL CHECK (origin_type IN ('career', 'regional', 'personal', 'business', 'media', 'battle')),

  -- Human-readable origin story
  origin_story TEXT NOT NULL,

  -- Origin battle (if grudge started from a battle)
  origin_battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,

  -- Metadata for extensibility
  meta_json JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure bidirectional uniqueness (A-B is same as B-A)
  CONSTRAINT unique_battler_pair UNIQUE (battler_a_id, battler_b_id),
  -- Ensure no self-relationships
  CONSTRAINT no_self_relationship CHECK (battler_a_id != battler_b_id),
  -- Ensure alphabetical ordering (battler_a_id should always be "less than" battler_b_id)
  CONSTRAINT ordered_battler_ids CHECK (battler_a_id < battler_b_id)
);

-- Indexes for performance
CREATE INDEX idx_battler_relationships_battler_a ON battler_relationships(battler_a_id);
CREATE INDEX idx_battler_relationships_battler_b ON battler_relationships(battler_b_id);
CREATE INDEX idx_battler_relationships_status ON battler_relationships(status);
CREATE INDEX idx_battler_relationships_intensity ON battler_relationships(intensity DESC);
CREATE INDEX idx_battler_relationships_origin_battle ON battler_relationships(origin_battle_id);

-- Trigger to update last_modified_at
CREATE OR REPLACE FUNCTION update_battler_relationships_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER battler_relationships_update_timestamp
BEFORE UPDATE ON battler_relationships
FOR EACH ROW
EXECUTE FUNCTION update_battler_relationships_timestamp();

-- RLS Policies
ALTER TABLE battler_relationships ENABLE ROW LEVEL SECURITY;

-- Anyone can read relationships
CREATE POLICY "battler_relationships_select_policy"
ON battler_relationships FOR SELECT
USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "battler_relationships_service_policy"
ON battler_relationships FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- TABLE 2: head_to_head_records
-- =====================================================
-- Purpose: Track battle history between specific battlers (no rematches allowed in V1)
-- Key Features: Win/loss tracking, score differentials, performance metrics

CREATE TABLE IF NOT EXISTS head_to_head_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_a_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  battler_b_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- Overall head-to-head record
  battler_a_wins INT NOT NULL DEFAULT 0,
  battler_b_wins INT NOT NULL DEFAULT 0,

  -- Most recent battle
  last_battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,
  last_battle_at TIMESTAMPTZ,
  last_battle_winner_id UUID REFERENCES battlers(id) ON DELETE SET NULL,
  last_battle_score TEXT, -- e.g., "2-1"

  -- Performance metrics (averages across all battles)
  avg_score_differential DECIMAL(5, 2), -- positive = battler_a advantage
  avg_crowd_reaction_differential DECIMAL(5, 2),

  -- Battle IDs for history (array of UUIDs)
  battle_ids UUID[] DEFAULT ARRAY[]::UUID[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure bidirectional uniqueness
  CONSTRAINT unique_h2h_pair UNIQUE (battler_a_id, battler_b_id),
  -- Ensure no self-matches
  CONSTRAINT no_self_h2h CHECK (battler_a_id != battler_b_id),
  -- Ensure alphabetical ordering
  CONSTRAINT ordered_h2h_ids CHECK (battler_a_id < battler_b_id)
);

-- Indexes
CREATE INDEX idx_h2h_battler_a ON head_to_head_records(battler_a_id);
CREATE INDEX idx_h2h_battler_b ON head_to_head_records(battler_b_id);
CREATE INDEX idx_h2h_last_battle ON head_to_head_records(last_battle_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_h2h_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER h2h_update_timestamp
BEFORE UPDATE ON head_to_head_records
FOR EACH ROW
EXECUTE FUNCTION update_h2h_timestamp();

-- RLS Policies
ALTER TABLE head_to_head_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "h2h_select_policy"
ON head_to_head_records FOR SELECT
USING (true);

CREATE POLICY "h2h_service_policy"
ON head_to_head_records FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- TABLE 3: blogger_memory
-- =====================================================
-- Purpose: Persistent memory for each of the 8 blogger personas to ensure narrative continuity
-- Key Features: Track which battlers/battles/grudges a blogger has covered

CREATE TABLE IF NOT EXISTS blogger_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Blogger persona (8 bloggers from newsGenerator.ts)
  -- 'Battle Eyez', 'Marijuana Piranha', 'Algorithm Institute', 'Small Room Report',
  -- 'The Main Stage Herald', 'Underground Voice', 'Coast to Coast Coverage', 'The Battle Breakdown'
  blogger_name TEXT NOT NULL,

  -- What entity is being tracked
  entity_type TEXT NOT NULL CHECK (entity_type IN ('battler', 'battle', 'grudge', 'league', 'event')),
  entity_id UUID NOT NULL,

  -- Coverage history
  total_articles INT NOT NULL DEFAULT 1,
  first_covered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_covered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Article IDs for reference
  article_ids UUID[] DEFAULT ARRAY[]::UUID[],

  -- Sentiment tracking (for narrative consistency)
  -- positive (0-100), neutral (0-100), negative (0-100) - should sum to ~100
  sentiment_positive INT DEFAULT 50 CHECK (sentiment_positive >= 0 AND sentiment_positive <= 100),
  sentiment_neutral INT DEFAULT 50 CHECK (sentiment_neutral >= 0 AND sentiment_neutral <= 100),
  sentiment_negative INT DEFAULT 0 CHECK (sentiment_negative >= 0 AND sentiment_negative <= 100),

  -- Recent narrative summary (for LLM context)
  recent_narrative TEXT,

  -- Metadata for extensibility
  meta_json JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One record per blogger-entity pair
  CONSTRAINT unique_blogger_entity UNIQUE (blogger_name, entity_type, entity_id)
);

-- Indexes
CREATE INDEX idx_blogger_memory_blogger ON blogger_memory(blogger_name);
CREATE INDEX idx_blogger_memory_entity ON blogger_memory(entity_type, entity_id);
CREATE INDEX idx_blogger_memory_last_covered ON blogger_memory(last_covered_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_blogger_memory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blogger_memory_update_timestamp
BEFORE UPDATE ON blogger_memory
FOR EACH ROW
EXECUTE FUNCTION update_blogger_memory_timestamp();

-- RLS Policies
ALTER TABLE blogger_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blogger_memory_select_policy"
ON blogger_memory FOR SELECT
USING (true);

CREATE POLICY "blogger_memory_service_policy"
ON blogger_memory FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- TABLE 4: rivalry_storylines
-- =====================================================
-- Purpose: Track narrative arc of each rivalry with key moments and media coverage
-- Key Features: Timeline of events, key quotes, media references

CREATE TABLE IF NOT EXISTS rivalry_storylines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to the relationship
  relationship_id UUID NOT NULL REFERENCES battler_relationships(id) ON DELETE CASCADE,

  -- Storyline event type
  -- 'battle': A battle occurred between rivals
  -- 'media': Media coverage escalated/de-escalated tension
  -- 'intensity_change': Major shift in intensity
  -- 'status_change': Status changed (active→dormant, etc.)
  -- 'external_event': Non-battle event (social media, interview, life event)
  event_type TEXT NOT NULL CHECK (event_type IN ('battle', 'media', 'intensity_change', 'status_change', 'external_event')),

  -- Event description
  event_description TEXT NOT NULL,

  -- Related entities
  battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,
  article_id UUID REFERENCES news_articles(id) ON DELETE SET NULL,

  -- Impact on rivalry
  intensity_delta INT DEFAULT 0, -- change in intensity (-100 to +100)
  rematch_demand_delta INT DEFAULT 0, -- change in rematch demand

  -- Key quote or moment (optional)
  key_quote TEXT,

  -- Timestamps
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  meta_json JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_rivalry_storylines_relationship ON rivalry_storylines(relationship_id);
CREATE INDEX idx_rivalry_storylines_event_type ON rivalry_storylines(event_type);
CREATE INDEX idx_rivalry_storylines_occurred_at ON rivalry_storylines(occurred_at DESC);
CREATE INDEX idx_rivalry_storylines_battle ON rivalry_storylines(battle_id);
CREATE INDEX idx_rivalry_storylines_article ON rivalry_storylines(article_id);

-- RLS Policies
ALTER TABLE rivalry_storylines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rivalry_storylines_select_policy"
ON rivalry_storylines FOR SELECT
USING (true);

CREATE POLICY "rivalry_storylines_service_policy"
ON rivalry_storylines FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to get or create relationship between two battlers
-- Ensures proper ordering (smaller UUID always first)
CREATE OR REPLACE FUNCTION get_or_create_relationship(
  battler_1_id UUID,
  battler_2_id UUID,
  new_origin_type TEXT DEFAULT 'battle',
  new_origin_story TEXT DEFAULT 'Rivalry sparked from battle',
  new_origin_battle_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  rel_id UUID;
  a_id UUID;
  b_id UUID;
BEGIN
  -- Ensure proper ordering (smaller UUID first)
  IF battler_1_id < battler_2_id THEN
    a_id := battler_1_id;
    b_id := battler_2_id;
  ELSE
    a_id := battler_2_id;
    b_id := battler_1_id;
  END IF;

  -- Try to find existing relationship
  SELECT id INTO rel_id
  FROM battler_relationships
  WHERE battler_a_id = a_id AND battler_b_id = b_id;

  -- If not found, create new one
  IF rel_id IS NULL THEN
    INSERT INTO battler_relationships (
      battler_a_id,
      battler_b_id,
      origin_type,
      origin_story,
      origin_battle_id,
      intensity,
      status
    ) VALUES (
      a_id,
      b_id,
      new_origin_type,
      new_origin_story,
      new_origin_battle_id,
      30, -- Default starting intensity
      'active'
    ) RETURNING id INTO rel_id;
  END IF;

  RETURN rel_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update head-to-head record after a battle
CREATE OR REPLACE FUNCTION update_h2h_after_battle(
  battler_1_id UUID,
  battler_2_id UUID,
  battle_id UUID,
  winner_id UUID,
  score TEXT,
  battle_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS VOID AS $$
DECLARE
  a_id UUID;
  b_id UUID;
  a_wins INT := 0;
  b_wins INT := 0;
BEGIN
  -- Ensure proper ordering
  IF battler_1_id < battler_2_id THEN
    a_id := battler_1_id;
    b_id := battler_2_id;
  ELSE
    a_id := battler_2_id;
    b_id := battler_1_id;
  END IF;

  -- Determine wins
  IF winner_id = a_id THEN
    a_wins := 1;
  ELSIF winner_id = b_id THEN
    b_wins := 1;
  END IF;

  -- Insert or update head-to-head record
  INSERT INTO head_to_head_records (
    battler_a_id,
    battler_b_id,
    battler_a_wins,
    battler_b_wins,
    last_battle_id,
    last_battle_at,
    last_battle_winner_id,
    last_battle_score,
    battle_ids
  ) VALUES (
    a_id,
    b_id,
    a_wins,
    b_wins,
    battle_id,
    battle_date,
    winner_id,
    score,
    ARRAY[battle_id]
  )
  ON CONFLICT (battler_a_id, battler_b_id)
  DO UPDATE SET
    battler_a_wins = head_to_head_records.battler_a_wins + EXCLUDED.battler_a_wins,
    battler_b_wins = head_to_head_records.battler_b_wins + EXCLUDED.battler_b_wins,
    last_battle_id = EXCLUDED.last_battle_id,
    last_battle_at = EXCLUDED.last_battle_at,
    last_battle_winner_id = EXCLUDED.last_battle_winner_id,
    last_battle_score = EXCLUDED.last_battle_score,
    battle_ids = array_append(head_to_head_records.battle_ids, EXCLUDED.last_battle_id),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE battler_relationships IS 'Persistent grudges/rivalries between battlers with intensity tracking';
COMMENT ON TABLE head_to_head_records IS 'Battle history between specific battlers (no rematches in V1)';
COMMENT ON TABLE blogger_memory IS 'Coverage history for each blogger persona to ensure narrative continuity';
COMMENT ON TABLE rivalry_storylines IS 'Timeline of key moments and events in each rivalry';

COMMENT ON COLUMN battler_relationships.intensity IS 'Grudge intensity 0-100: 0-30=Cool, 31-60=Warm, 61-85=Hot, 86-100=Very Hot';
COMMENT ON COLUMN battler_relationships.rematch_demand IS 'Fan desire for rematch 0-100 based on closeness, recency, intensity';
COMMENT ON COLUMN battler_relationships.origin_type IS 'Grudge origin: career, regional, personal, business, media, battle';
COMMENT ON COLUMN battler_relationships.status IS 'active (high tension), dormant (cooled off), resolved (settled)';

COMMENT ON COLUMN blogger_memory.entity_type IS 'What the blogger covers: battler, battle, grudge, league, event';
COMMENT ON COLUMN blogger_memory.sentiment_positive IS 'Positive sentiment percentage (0-100)';
COMMENT ON COLUMN blogger_memory.sentiment_neutral IS 'Neutral sentiment percentage (0-100)';
COMMENT ON COLUMN blogger_memory.sentiment_negative IS 'Negative sentiment percentage (0-100)';
COMMENT ON COLUMN blogger_memory.recent_narrative IS 'Summary of recent coverage for LLM context';

COMMENT ON COLUMN rivalry_storylines.event_type IS 'battle, media, intensity_change, status_change, external_event';
COMMENT ON COLUMN rivalry_storylines.intensity_delta IS 'Change in intensity from this event (-100 to +100)';
