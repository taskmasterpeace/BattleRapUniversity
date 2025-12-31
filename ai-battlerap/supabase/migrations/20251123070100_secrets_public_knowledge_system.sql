-- Secrets & Public Knowledge System
-- Implements information warfare mechanics for battle rap
-- Secrets can be exposed, researched, and used as battle angles

-- ==========================================
-- 1. BATTLER SECRETS TABLE
-- ==========================================

CREATE TABLE battler_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id uuid NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- Secret details
  secret_type text NOT NULL CHECK (secret_type IN (
    'criminal_record',
    'financial_crisis',
    'relationship_drama',
    'family_scandal',
    'substance_use',
    'mental_health',
    'career_failure',
    'betrayal',
    'secret_identity'    -- Day job, real name, past, etc.
  )),

  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('minor', 'moderate', 'major')),

  -- Visibility state
  status text NOT NULL DEFAULT 'private' CHECK (status IN (
    'private',           -- Only battler knows
    'rumored',           -- Some people suspect
    'exposed',           -- Publicly known
    'addressed'          -- Battler publicly acknowledged it
  )),

  -- Exposure tracking
  exposure_risk numeric DEFAULT 0.0 CHECK (exposure_risk >= 0.0 AND exposure_risk <= 1.0),
  exposed_at timestamptz,
  exposed_by text,     -- 'life_event', 'battle_angle', 'social_media', 'opponent_research'

  -- Battle impact (JSONB for flexibility)
  battle_vulnerability jsonb DEFAULT '{
    "angle_bonus": 0.15,
    "crowd_reaction_penalty": -10
  }'::jsonb,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_battler_secrets_battler ON battler_secrets(battler_id);
CREATE INDEX idx_battler_secrets_status ON battler_secrets(status);
CREATE INDEX idx_battler_secrets_type ON battler_secrets(secret_type);
CREATE INDEX idx_battler_secrets_exposed ON battler_secrets(exposed_at DESC)
  WHERE status IN ('exposed', 'addressed');

-- RLS: Players can see their own secrets
ALTER TABLE battler_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Battlers can view their own secrets"
  ON battler_secrets FOR SELECT
  TO authenticated
  USING (
    battler_id IN (
      SELECT id FROM battlers WHERE user_id = auth.uid()
    )
  );

-- Service role can manage all secrets
CREATE POLICY "Service role can manage secrets"
  ON battler_secrets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- 2. PUBLIC INFORMATION TABLE
-- ==========================================

CREATE TABLE battler_public_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id uuid NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  info_type text NOT NULL CHECK (info_type IN (
    'battle_record',
    'viral_moment',
    'public_beef',
    'career_milestone',
    'media_appearance',
    'social_media_presence',
    'league_affiliation',
    'reputation_event'
  )),

  title text NOT NULL,
  description text NOT NULL,
  impact text NOT NULL CHECK (impact IN ('positive', 'neutral', 'negative')),

  -- Visibility (0-100)
  public_knowledge_value integer NOT NULL DEFAULT 0 CHECK (public_knowledge_value >= 0 AND public_knowledge_value <= 100),

  -- Battle impact (JSONB for flexibility)
  battle_effects jsonb DEFAULT '{
    "crowd_reaction_bonus": 5,
    "respect_modifier": 0.1
  }'::jsonb,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_battler_public_info_battler ON battler_public_info(battler_id, created_at DESC);
CREATE INDEX idx_battler_public_info_type ON battler_public_info(info_type);
CREATE INDEX idx_battler_public_info_impact ON battler_public_info(impact);

-- RLS: Public info is visible to all authenticated users
ALTER TABLE battler_public_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public info visible to all authenticated users"
  ON battler_public_info FOR SELECT
  TO authenticated
  USING (true);

-- Service role can manage public info
CREATE POLICY "Service role can manage public info"
  ON battler_public_info FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- 3. BATTLE INTELLIGENCE TABLE
-- ==========================================

CREATE TABLE battle_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  researcher_battler_id uuid NOT NULL REFERENCES battlers(id),
  target_battler_id uuid NOT NULL REFERENCES battlers(id),

  -- What was discovered
  secrets_discovered uuid[] DEFAULT '{}',  -- Array of secret IDs
  public_info_found uuid[] DEFAULT '{}',   -- Array of public info IDs

  -- Research effectiveness
  research_quality numeric CHECK (research_quality >= 0.0 AND research_quality <= 1.0),
  research_days integer DEFAULT 0,

  -- Discovery log (JSONB for detailed tracking)
  discovery_rolls jsonb DEFAULT '[]'::jsonb,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_battle_intelligence_battle ON battle_intelligence(battle_id);
CREATE INDEX idx_battle_intelligence_researcher ON battle_intelligence(researcher_battler_id);
CREATE INDEX idx_battle_intelligence_target ON battle_intelligence(target_battler_id);

-- RLS: Players can see intelligence about their own battles
ALTER TABLE battle_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view their battle intelligence"
  ON battle_intelligence FOR SELECT
  TO authenticated
  USING (
    researcher_battler_id IN (
      SELECT id FROM battlers WHERE user_id = auth.uid()
    ) OR
    target_battler_id IN (
      SELECT id FROM battlers WHERE user_id = auth.uid()
    )
  );

-- Service role can manage battle intelligence
CREATE POLICY "Service role can manage battle intelligence"
  ON battle_intelligence FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- 4. HELPER FUNCTIONS
-- ==========================================

-- Calculate exposure risk based on battler context
CREATE OR REPLACE FUNCTION calculate_exposure_risk(
  p_secret_id uuid,
  p_battler_id uuid
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  v_base_risk numeric;
  v_severity text;
  v_public_knowledge integer;
  v_reputation numeric;
  v_final_risk numeric;
BEGIN
  -- Get secret base risk and severity
  SELECT
    exposure_risk,
    severity
  INTO v_base_risk, v_severity
  FROM battler_secrets
  WHERE id = p_secret_id;

  -- Get battler context
  SELECT
    ba.public_knowledge,
    ba.personal->>'reputation'
  INTO v_public_knowledge, v_reputation
  FROM battler_attributes ba
  WHERE ba.battler_id = p_battler_id;

  -- Calculate final risk
  v_final_risk := v_base_risk;

  -- Public knowledge multiplier (0-100 → 1.0-1.5x)
  v_final_risk := v_final_risk * (1.0 + (v_public_knowledge::numeric / 200.0));

  -- High reputation = more scrutiny
  IF v_reputation::numeric > 7 THEN
    v_final_risk := v_final_risk * 1.3;
  END IF;

  -- Cap at 80%
  v_final_risk := LEAST(v_final_risk, 0.80);

  RETURN v_final_risk;
END;
$$;

-- Update secret status (helper for life events)
CREATE OR REPLACE FUNCTION expose_secret(
  p_secret_id uuid,
  p_exposed_by text,
  p_new_status text DEFAULT 'exposed'
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE battler_secrets
  SET
    status = p_new_status,
    exposed_at = now(),
    exposed_by = p_exposed_by,
    updated_at = now()
  WHERE id = p_secret_id;
END;
$$;

-- Get secrets by battler and status
CREATE OR REPLACE FUNCTION get_battler_secrets(
  p_battler_id uuid,
  p_status text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  secret_type text,
  title text,
  description text,
  severity text,
  status text,
  exposure_risk numeric,
  created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bs.id,
    bs.secret_type,
    bs.title,
    bs.description,
    bs.severity,
    bs.status,
    bs.exposure_risk,
    bs.created_at
  FROM battler_secrets bs
  WHERE bs.battler_id = p_battler_id
    AND (p_status IS NULL OR bs.status = p_status)
  ORDER BY bs.created_at DESC;
END;
$$;

-- ==========================================
-- 5. TRIGGERS
-- ==========================================

-- Update updated_at timestamp on secrets
CREATE OR REPLACE FUNCTION update_secret_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_secret_timestamp
  BEFORE UPDATE ON battler_secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_secret_timestamp();

-- ==========================================
-- 6. SEED SOME EXAMPLE SECRETS
-- ==========================================

-- Note: In production, secrets would be created through life events
-- This is just for testing the system

COMMENT ON TABLE battler_secrets IS
  'Private and exposed secrets about battlers. Used for battle angles and information warfare.';

COMMENT ON TABLE battler_public_info IS
  'Public information about battlers. Visible to all players. Used for battle context.';

COMMENT ON TABLE battle_intelligence IS
  'Tracks what secrets/info were discovered through pre-battle research.';
