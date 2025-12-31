/**
 * Relationship State Machine & Promotion System
 *
 * This migration implements:
 * 1. Inkle-inspired state machine for battler relationships
 * 2. Crowd perception and authenticity warfare mechanics
 * 3. Pre-battle promotion tracking
 * 4. Truth verification for scandals
 *
 * Based on Cassidy vs Easy model - promotion affects battle outcomes
 */

-- ============================================================================
-- 1. ENHANCE battler_relationships TABLE (State Machine)
-- ============================================================================

-- Add state machine columns
ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS
  -- State tree: Unknown → Aware → Tense → Rivals → At War → Legendary Beef
  current_state TEXT NOT NULL DEFAULT 'unknown'
    CHECK (current_state IN ('unknown', 'aware', 'tense', 'rivals', 'at_war', 'legendary_beef'));

ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS
  high_water_mark TEXT NOT NULL DEFAULT 'unknown'
    CHECK (high_water_mark IN ('unknown', 'aware', 'tense', 'rivals', 'at_war', 'legendary_beef'));

ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS
  state_level INT NOT NULL DEFAULT 0 CHECK (state_level >= 0 AND state_level <= 5);

-- Crowd perception (50 = neutral, 0-100 scale)
ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS
  crowd_perception_a INT DEFAULT 50 CHECK (crowd_perception_a >= 0 AND crowd_perception_a <= 100);

ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS
  crowd_perception_b INT DEFAULT 50 CHECK (crowd_perception_b >= 0 AND crowd_perception_b <= 100);

-- Duck tracking (avoiding rivals)
ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS
  consecutive_offers_ignored_by_a INT DEFAULT 0;

ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS
  consecutive_offers_ignored_by_b INT DEFAULT 0;

ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS
  is_ducking_a BOOLEAN DEFAULT FALSE;

ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS
  is_ducking_b BOOLEAN DEFAULT FALSE;

-- Authenticity scores (100 = fully authentic, damaged by scandals/promotion)
ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS
  authenticity_score_a INT DEFAULT 100 CHECK (authenticity_score_a >= 0 AND authenticity_score_a <= 100);

ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS
  authenticity_score_b INT DEFAULT 100 CHECK (authenticity_score_b >= 0 AND authenticity_score_b <= 100);

-- Twitter/social media beef tracking
ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS
  twitter_beef_active BOOLEAN DEFAULT FALSE;

ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS
  twitter_beef_started_at TIMESTAMPTZ;

ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS
  twitter_beef_initiator_id UUID REFERENCES battlers(id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_relationships_state
  ON battler_relationships(current_state, state_level);

CREATE INDEX IF NOT EXISTS idx_relationships_perception
  ON battler_relationships(crowd_perception_a, crowd_perception_b);

CREATE INDEX IF NOT EXISTS idx_relationships_ducking
  ON battler_relationships(is_ducking_a, is_ducking_b)
  WHERE is_ducking_a = true OR is_ducking_b = true;

-- ============================================================================
-- 2. ENHANCE scandals TABLE (Truth Verification & Battle Rap Terminology)
-- ============================================================================

-- Battle rap severity terminology (1-10 scale mapped to labels)
ALTER TABLE scandals ADD COLUMN IF NOT EXISTS
  severity_label TEXT NOT NULL DEFAULT 'minor'
    CHECK (severity_label IN ('minor', 'questionable', 'controversial', 'exposed', 'career_damaging', 'legendary'));

-- Promotion/media amplification
ALTER TABLE scandals ADD COLUMN IF NOT EXISTS
  media_amplification INT DEFAULT 0 CHECK (media_amplification >= 0 AND media_amplification <= 100);

ALTER TABLE scandals ADD COLUMN IF NOT EXISTS
  times_addressed_in_battles INT DEFAULT 0;

ALTER TABLE scandals ADD COLUMN IF NOT EXISTS
  last_addressed_battle_id UUID REFERENCES battles(id);

-- Truth verification system
ALTER TABLE scandals ADD COLUMN IF NOT EXISTS
  verification_status TEXT DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'researching', 'proven', 'disproven', 'debatable'));

ALTER TABLE scandals ADD COLUMN IF NOT EXISTS
  evidence_level INT DEFAULT 0 CHECK (evidence_level >= 0 AND evidence_level <= 100);

-- How secret is covered up (affects research difficulty)
ALTER TABLE scandals ADD COLUMN IF NOT EXISTS
  cover_up_strength INT DEFAULT 50 CHECK (cover_up_strength >= 0 AND cover_up_strength <= 100);

-- Resolution tracking (what happened when addressed in battle)
ALTER TABLE scandals ADD COLUMN IF NOT EXISTS
  resolved_in_battle_id UUID REFERENCES battles(id);

ALTER TABLE scandals ADD COLUMN IF NOT EXISTS
  resolution_type TEXT
    CHECK (resolution_type IN ('admitted', 'disproven', 'ignored', 'doubled_down'));

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_scandals_verification
  ON scandals(verification_status, evidence_level);

CREATE INDEX IF NOT EXISTS idx_scandals_severity
  ON scandals(severity_label, intensity);

-- ============================================================================
-- 3. CREATE promotion_events TABLE (Pre-Battle Promotion Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS promotion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which battle and battler
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- Event type
  event_type TEXT NOT NULL CHECK (event_type IN (
    'interview',           -- Media appearance
    'twitter_callout',     -- Social media beef
    'scandal_exposure',    -- Exposing opponent's scandal
    'truth_research',      -- Investigating opponent
    'media_appearance',    -- Generic media work
    'angle_teaser',        -- Teasing what you'll say in battle
    'authenticity_attack', -- Generic attack on credibility
    'battle_acceptance'    -- Accepting a rival's challenge
  )),

  -- Target (if attacking/researching opponent)
  target_battler_id UUID REFERENCES battlers(id),
  target_scandal_id UUID REFERENCES scandals(id),
  target_secret_id UUID REFERENCES battler_secrets(id),

  -- Impact metrics
  crowd_perception_delta INT DEFAULT 0,  -- How much this swayed the crowd (-100 to +100)
  authenticity_damage INT DEFAULT 0,      -- Damage to opponent's authenticity (0-100)
  media_coverage INT DEFAULT 0 CHECK (media_coverage >= 0 AND media_coverage <= 10),

  -- Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  key_quote TEXT,  -- Memorable line from the promotion

  -- Timing (affects impact)
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  days_before_battle INT,  -- Recency matters (closer = more impact)

  -- Metadata
  meta_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_promotion_events_battle
  ON promotion_events(battle_id, battler_id);

CREATE INDEX idx_promotion_events_timing
  ON promotion_events(occurred_at DESC, days_before_battle);

CREATE INDEX idx_promotion_events_type
  ON promotion_events(event_type);

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

/**
 * Get or create relationship between two battlers
 * Handles bidirectional relationship with proper ID ordering
 */
CREATE OR REPLACE FUNCTION get_or_create_relationship(
  battler_1_id UUID,
  battler_2_id UUID,
  new_origin_type TEXT DEFAULT 'battle',
  new_origin_story TEXT DEFAULT 'Rivalry began',
  new_origin_battle_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  rel_id UUID;
  a_id UUID;
  b_id UUID;
BEGIN
  -- Order IDs (smaller first for consistency)
  IF battler_1_id < battler_2_id THEN
    a_id := battler_1_id;
    b_id := battler_2_id;
  ELSE
    a_id := battler_2_id;
    b_id := battler_1_id;
  END IF;

  -- Try to get existing relationship
  SELECT id INTO rel_id
  FROM battler_relationships
  WHERE battler_a_id = a_id AND battler_b_id = b_id;

  -- If not found, create new relationship
  IF rel_id IS NULL THEN
    INSERT INTO battler_relationships (
      battler_a_id,
      battler_b_id,
      intensity,
      rematch_demand,
      status,
      origin_type,
      origin_story,
      origin_battle_id,
      current_state,
      high_water_mark,
      state_level,
      started_at,
      last_modified_at
    ) VALUES (
      a_id,
      b_id,
      0,  -- Start at 0 intensity
      0,  -- No rematch demand yet
      'active',
      new_origin_type,
      new_origin_story,
      new_origin_battle_id,
      'unknown',  -- Start at unknown state
      'unknown',
      0,  -- State level 0
      NOW(),
      NOW()
    )
    RETURNING id INTO rel_id;
  END IF;

  RETURN rel_id;
END;
$$ LANGUAGE plpgsql;

/**
 * Move relationship to new state (with defensive logic)
 * Automatically grants lower states and updates high water mark
 */
CREATE OR REPLACE FUNCTION move_to_state(
  rel_id UUID,
  new_state TEXT
) RETURNS VOID AS $$
DECLARE
  new_level INT;
  current_high_water TEXT;
  current_high_water_level INT;
BEGIN
  -- Map state to level
  new_level := CASE new_state
    WHEN 'unknown' THEN 0
    WHEN 'aware' THEN 1
    WHEN 'tense' THEN 2
    WHEN 'rivals' THEN 3
    WHEN 'at_war' THEN 4
    WHEN 'legendary_beef' THEN 5
    ELSE 0
  END;

  -- Get current high water mark
  SELECT high_water_mark INTO current_high_water
  FROM battler_relationships
  WHERE id = rel_id;

  -- Calculate current high water mark level
  current_high_water_level := CASE current_high_water
    WHEN 'unknown' THEN 0
    WHEN 'aware' THEN 1
    WHEN 'tense' THEN 2
    WHEN 'rivals' THEN 3
    WHEN 'at_war' THEN 4
    WHEN 'legendary_beef' THEN 5
    ELSE 0
  END;

  -- Update state and high water mark (if new state is higher)
  UPDATE battler_relationships
  SET
    current_state = new_state,
    state_level = new_level,
    high_water_mark = CASE
      WHEN new_level > current_high_water_level THEN new_state
      ELSE high_water_mark
    END,
    last_modified_at = NOW()
  WHERE id = rel_id;

END;
$$ LANGUAGE plpgsql;

/**
 * Calculate crowd perception for a battler in a specific relationship
 * Factors: promotion events, scandals, authenticity, win streak, underdog status
 */
CREATE OR REPLACE FUNCTION calculate_crowd_perception(
  rel_id UUID,
  battler_side TEXT,  -- 'a' or 'b'
  battle_id UUID
) RETURNS INT AS $$
DECLARE
  base_perception INT := 50;  -- Neutral
  promotion_total INT := 0;
  scandal_penalty INT := 0;
  auth_penalty INT := 0;
  result INT;
  battler_id_val UUID;
  auth_score INT;
BEGIN
  -- Get battler ID and authenticity score
  IF battler_side = 'a' THEN
    SELECT battler_a_id, authenticity_score_a
    INTO battler_id_val, auth_score
    FROM battler_relationships WHERE id = rel_id;
  ELSE
    SELECT battler_b_id, authenticity_score_b
    INTO battler_id_val, auth_score
    FROM battler_relationships WHERE id = rel_id;
  END IF;

  -- Sum promotion event deltas
  SELECT COALESCE(SUM(crowd_perception_delta), 0)
  INTO promotion_total
  FROM promotion_events
  WHERE battle_id = battle_id
    AND battler_id = battler_id_val;

  -- Active scandal penalties
  SELECT COALESCE(SUM(intensity * -3), 0)  -- -3 to -30 per scandal
  INTO scandal_penalty
  FROM scandals
  WHERE battler_id = battler_id_val
    AND week_expires > EXTRACT(WEEK FROM NOW());

  -- Authenticity damage (lose 1 perception per point below 100)
  auth_penalty := 100 - auth_score;

  -- Calculate total
  result := base_perception
    + promotion_total
    + scandal_penalty
    - auth_penalty;

  -- Clamp to 0-100
  result := GREATEST(0, LEAST(100, result));

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. DATA MIGRATION (Update existing relationships)
-- ============================================================================

-- Set default state for existing relationships based on intensity
UPDATE battler_relationships
SET
  current_state = CASE
    WHEN intensity >= 85 THEN 'at_war'
    WHEN intensity >= 60 THEN 'rivals'
    WHEN intensity >= 35 THEN 'tense'
    WHEN intensity >= 10 THEN 'aware'
    ELSE 'unknown'
  END,
  state_level = CASE
    WHEN intensity >= 85 THEN 4
    WHEN intensity >= 60 THEN 3
    WHEN intensity >= 35 THEN 2
    WHEN intensity >= 10 THEN 1
    ELSE 0
  END,
  high_water_mark = CASE
    WHEN intensity >= 85 THEN 'at_war'
    WHEN intensity >= 60 THEN 'rivals'
    WHEN intensity >= 35 THEN 'tense'
    WHEN intensity >= 10 THEN 'aware'
    ELSE 'unknown'
  END
WHERE current_state IS NULL OR current_state = 'unknown';

-- Map scandal intensity to severity labels
UPDATE scandals
SET severity_label = CASE
  WHEN intensity >= 9 THEN 'career_damaging'
  WHEN intensity >= 7 THEN 'exposed'
  WHEN intensity >= 5 THEN 'controversial'
  WHEN intensity >= 3 THEN 'questionable'
  ELSE 'minor'
END
WHERE severity_label = 'minor';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Comments for documentation
COMMENT ON TABLE promotion_events IS 'Tracks pre-battle promotion work (interviews, Twitter beef, scandal exposure) that affects crowd perception';
COMMENT ON COLUMN battler_relationships.current_state IS 'Current relationship state in the state tree (unknown → aware → tense → rivals → at_war → legendary_beef)';
COMMENT ON COLUMN battler_relationships.high_water_mark IS 'Highest state ever reached (crowd remembers the peak intensity)';
COMMENT ON COLUMN battler_relationships.crowd_perception_a IS 'How much the crowd favors battler A (0-100, 50 = neutral)';
COMMENT ON COLUMN battler_relationships.authenticity_score_a IS 'Battler A credibility (100 = fully authentic, damaged by scandals/promotion)';
COMMENT ON COLUMN scandals.verification_status IS 'Whether scandal has been researched and proven/disproven';
COMMENT ON COLUMN scandals.evidence_level IS 'Amount of evidence backing up the scandal (0-100)';
