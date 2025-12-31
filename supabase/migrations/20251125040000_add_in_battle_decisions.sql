-- ============================================================================
-- In-Battle Decision System
-- Live gameplay mechanics when battler is "locked in"
-- ============================================================================

-- ==========================================================================
-- Table: battle_decisions (Decisions made during battle)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS battle_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL CHECK (round_number >= 1 AND round_number <= 3),
  segment_number INTEGER NOT NULL CHECK (segment_number >= 1 AND segment_number <= 6),

  -- Decision Details
  decision_type TEXT NOT NULL CHECK (decision_type IN (
    'freestyle', 'rebuttal', 'speed_up', 'slow_down', 'volume_increase',
    'emphasis_change', 'flow_switch', 'repetition', 'accent_usage',
    'gimmick', 'crowd_work', 'body_language_adjust', 'facial_expression',
    'stay_course'
  )),

  decision_label TEXT NOT NULL,

  -- Outcome
  success_roll DECIMAL(4,3) NOT NULL,
  success_threshold DECIMAL(4,3) NOT NULL,
  was_successful BOOLEAN NOT NULL,

  effects_applied JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE battle_decisions IS 'In-battle decisions made between segments (only when locked in)';
COMMENT ON COLUMN battle_decisions.decision_type IS 'Type of decision: content, delivery, or performance';
COMMENT ON COLUMN battle_decisions.success_roll IS 'Random roll (0-1) vs threshold to determine success';

CREATE INDEX idx_battle_decisions_battle ON battle_decisions(battle_id);
CREATE INDEX idx_battle_decisions_battler ON battle_decisions(battler_id);

-- ==========================================================================
-- Table: decision_options (Available decision templates)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS decision_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('content', 'delivery', 'performance')),

  -- Requirements
  requires_locked_in BOOLEAN DEFAULT true,
  badge_synergies TEXT[] DEFAULT '{}',
  badge_conflicts TEXT[] DEFAULT '{}',

  -- Effects (if successful)
  success_effects JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Risks (if failed)
  failure_effects JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Mechanics
  base_success_rate DECIMAL(4,3) NOT NULL DEFAULT 0.70,
  cooldown_segments INTEGER DEFAULT 0,
  choke_risk_increase DECIMAL(4,3) DEFAULT 0.00,

  description TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE decision_options IS 'Templates for available in-battle decisions';
COMMENT ON COLUMN decision_options.badge_synergies IS 'Badges that improve success rate (e.g., {freestyle, off_the_top})';
COMMENT ON COLUMN decision_options.cooldown_segments IS 'Segments before can use again';

CREATE INDEX idx_decision_options_code ON decision_options(code);
CREATE INDEX idx_decision_options_category ON decision_options(category);

-- ==========================================================================
-- Add "locked in" status to battles
-- ==========================================================================
ALTER TABLE battles
ADD COLUMN IF NOT EXISTS battler_a_locked_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS battler_b_locked_in BOOLEAN DEFAULT false;

COMMENT ON COLUMN battles.battler_a_locked_in IS 'TRUE if battler is fully engaged and can make in-battle decisions';
COMMENT ON COLUMN battles.battler_b_locked_in IS 'TRUE if battler is fully engaged and can make in-battle decisions';

-- ==========================================================================
-- Seed Decision Options
-- ==========================================================================

-- Content Decisions (Freestyle/Rebuttal)
INSERT INTO decision_options (code, label, category, badge_synergies, success_effects, failure_effects, base_success_rate, choke_risk_increase, description)
VALUES
  ('drop_freestyle', 'Drop a Freestyle', 'content', ARRAY['freestyle', 'off_the_top'],
   '{"creativityBonus": 0.3, "peakBonus": 0.2, "crowdReactionBonus": 15}',
   '{"chokeChance": 0.08, "segmentScore": -0.3}',
   0.60, 0.05,
   'Improvise on the spot. High risk, high reward.'),

  ('throw_rebuttal', 'Throw a Rebuttal', 'content', ARRAY['freestyle', 'rebuttal_king'],
   '{"creativityBonus": 0.25, "crowdReactionBonus": 20, "opponentMomentum": -0.2}',
   '{"segmentScore": -0.15}',
   0.65, 0.03,
   'React to opponent''s previous round.'),

  ('stay_course', 'Stay the Course', 'content', ARRAY['prepared_battler', 'technical_writer'],
   '{"consistencyBonus": 0.1}',
   '{}',
   0.95, 0.00,
   'Stick to your prepared material.')
ON CONFLICT (code) DO NOTHING;

-- Delivery Decisions
INSERT INTO decision_options (code, label, category, badge_synergies, success_effects, failure_effects, base_success_rate, choke_risk_increase, description)
VALUES
  ('speed_up', 'Speed Up Delivery', 'delivery', ARRAY['speed_rapper'],
   '{"deliveryBonus": 0.2, "energyIncrease": 10}',
   '{"deliveryPenalty": -0.15, "clarityLoss": true}',
   0.70, 0.02,
   'Increase pace for intensity.'),

  ('slow_down', 'Slow Down for Emphasis', 'delivery', ARRAY['smooth_flow', 'storyteller'],
   '{"deliveryBonus": 0.15, "crowdReactionBonus": 10}',
   '{"energyDecrease": -10}',
   0.75, 0.01,
   'Slow down to let bars hit.'),

  ('volume_increase', 'Increase Volume', 'delivery', ARRAY['aggressive', 'main_stage_specialist'],
   '{"deliveryBonus": 0.15, "crowdReactionBonus": 12}',
   '{"deliveryPenalty": -0.10}',
   0.75, 0.01,
   'Project louder to command attention.'),

  ('flow_switch', 'Switch Flow Pattern', 'delivery', ARRAY['smooth_flow', 'unpredictable'],
   '{"deliveryBonus": 0.2, "creativityBonus": 0.1}',
   '{"consistencyPenalty": -0.15}',
   0.68, 0.03,
   'Change your flow mid-round.')
ON CONFLICT (code) DO NOTHING;

-- Performance Decisions
INSERT INTO decision_options (code, label, category, badge_synergies, success_effects, failure_effects, base_success_rate, choke_risk_increase, description)
VALUES
  ('work_crowd', 'Work the Crowd', 'performance', ARRAY['crowd_control', 'crowd_favorite', 'charismatic'],
   '{"crowdReactionBonus": 25, "crowdControlBonus": 0.2}',
   '{"crowdReactionBonus": -10}',
   0.70, 0.02,
   'Engage directly with audience.'),

  ('use_gimmick', 'Use a Gimmick', 'performance', ARRAY['shock_value', 'comedian', 'controversial'],
   '{"peakBonus": 0.25, "crowdReactionBonus": 20, "polarizing": true}',
   '{"crowdReactionBonus": -15, "reputationRisk": true}',
   0.55, 0.04,
   'Pull out a stunt or prop. Risky but memorable.'),

  ('adjust_body_language', 'Adjust Body Language', 'performance', ARRAY['stage_presence', 'animated', 'performance_beast'],
   '{"stagePresenceBonus": 0.15, "deliveryBonus": 0.1}',
   '{"stagePresencePenalty": -0.05}',
   0.80, 0.01,
   'Modify gestures and movement.')
ON CONFLICT (code) DO NOTHING;

-- ==========================================================================
-- Helper function: Get available decisions for battler
-- ==========================================================================
CREATE OR REPLACE FUNCTION get_available_decisions(
  p_battler_id UUID,
  p_battle_id UUID,
  p_round_number INTEGER,
  p_segment_number INTEGER
) RETURNS TABLE (
  code TEXT,
  label TEXT,
  category TEXT,
  description TEXT,
  success_rate DECIMAL,
  choke_risk DECIMAL,
  has_synergy BOOLEAN
) AS $$
DECLARE
  battler_badges TEXT[];
  is_locked_in BOOLEAN;
BEGIN
  -- Get battler's badges
  SELECT style_tags INTO battler_badges
  FROM battlers
  WHERE id = p_battler_id;

  -- Check if locked in
  SELECT CASE
    WHEN battler_a_id = p_battler_id THEN battler_a_locked_in
    WHEN battler_b_id = p_battler_id THEN battler_b_locked_in
    ELSE false
  END INTO is_locked_in
  FROM battles
  WHERE id = p_battle_id;

  -- If not locked in, only return "stay_course"
  IF NOT is_locked_in THEN
    RETURN QUERY
    SELECT
      opt.code,
      opt.label,
      opt.category,
      opt.description,
      opt.base_success_rate,
      opt.choke_risk_increase,
      false as has_synergy
    FROM decision_options opt
    WHERE opt.code = 'stay_course';
    RETURN;
  END IF;

  -- Return all applicable decisions with synergy info
  RETURN QUERY
  SELECT
    opt.code,
    opt.label,
    opt.category,
    opt.description,
    CASE
      WHEN opt.badge_synergies && battler_badges THEN opt.base_success_rate * 1.2
      WHEN opt.badge_conflicts && battler_badges THEN opt.base_success_rate * 0.8
      ELSE opt.base_success_rate
    END as success_rate,
    opt.choke_risk_increase,
    opt.badge_synergies && battler_badges as has_synergy
  FROM decision_options opt;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_available_decisions IS 'Get available decisions for battler with badge synergies calculated';
