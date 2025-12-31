-- ============================================================================
-- Badge Point-Buy System - Database Schema
-- Adds tables for character creation point-buy system
-- ============================================================================

-- ==========================================================================
-- Table: badge_costs
-- Stores the point cost/grant for each badge in character creation
-- ==========================================================================
CREATE TABLE IF NOT EXISTS badge_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_code TEXT NOT NULL UNIQUE,
  badge_name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold')),
  category TEXT NOT NULL CHECK (category IN ('writing', 'performance', 'content', 'delivery', 'reputation_positive', 'reputation_negative')),

  -- Point Cost/Grant
  point_cost INTEGER NOT NULL, -- Positive for cost, negative for grant

  -- Badge Type
  is_negative BOOLEAN NOT NULL DEFAULT false,
  available_at_creation BOOLEAN NOT NULL DEFAULT true, -- Gold badges must be earned

  -- Constraints and Metadata
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE badge_costs IS 'Point costs for badges in character creation point-buy system';
COMMENT ON COLUMN badge_costs.badge_code IS 'Unique badge identifier (e.g., pen_game_elite, choker)';
COMMENT ON COLUMN badge_costs.point_cost IS 'Point cost (positive) or grant (negative). Bronze: 3/-4, Silver: 6/-7, Gold: 10/-12';
COMMENT ON COLUMN badge_costs.is_negative IS 'Whether this is a negative badge (grants points instead of costing)';
COMMENT ON COLUMN badge_costs.available_at_creation IS 'FALSE for gold badges - must be earned through gameplay, not bought at creation';

-- Index for fast lookups
CREATE INDEX idx_badge_costs_code ON badge_costs(badge_code);
CREATE INDEX idx_badge_costs_tier ON badge_costs(tier);
CREATE INDEX idx_badge_costs_category ON badge_costs(category);

-- ==========================================================================
-- Table: badge_rule_exceptions
-- Stores badge-specific rule overrides (e.g., Freestyle Genius ignores low prep penalty)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS badge_rule_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_code TEXT NOT NULL,
  rule_domain TEXT NOT NULL CHECK (rule_domain IN (
    'choke_calculation',
    'prep_requirements',
    'event_immunity',
    'battle_offers',
    'deposit_rules',
    'cancellation_penalties',
    'league_blacklist',
    'angle_research',
    'decision_availability',
    'scandal_duration',
    'reputation_effects'
  )),

  -- Exception Configuration (JSONB for flexibility)
  exception_config JSONB NOT NULL,

  -- Metadata
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Unique constraint: one exception per badge per rule domain
  UNIQUE(badge_code, rule_domain)
);

COMMENT ON TABLE badge_rule_exceptions IS 'Badge-specific exceptions to core game rules';
COMMENT ON COLUMN badge_rule_exceptions.rule_domain IS 'Which game system this exception applies to';
COMMENT ON COLUMN badge_rule_exceptions.exception_config IS 'JSONB configuration defining how the rule is modified. Structure varies by rule_domain.';

-- Example exception_config structures:
-- choke_calculation: {"ignore_low_prep": true, "minimum_choke_chance": 0.02}
-- event_immunity: {"immune_to_events": ["substance_issues_trigger", "jail_risk_trigger"]}
-- prep_requirements: {"minimum_prep_days": 0, "maximum_prep_days": 3}
-- deposit_rules: {"can_steal_without_blacklist": true, "reputation_penalty_multiplier": 0.5}

-- Indexes
CREATE INDEX idx_badge_exceptions_code ON badge_rule_exceptions(badge_code);
CREATE INDEX idx_badge_exceptions_domain ON badge_rule_exceptions(rule_domain);

-- ==========================================================================
-- Add badges_at_creation field to battlers table
-- Stores which badges the player selected during character creation
-- ==========================================================================
ALTER TABLE battlers
ADD COLUMN IF NOT EXISTS badges_at_creation JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN battlers.badges_at_creation IS 'Array of badge codes selected during character creation (for point-buy system)';

-- ==========================================================================
-- Seed initial badge costs
-- Based on point-buy research: Bronze (3/-4), Silver (6/-7), Gold (10/-12)
-- ==========================================================================

-- Positive Writing Badges (Bronze)
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative)
VALUES
  ('wordplay', 'Wordplay Master', 'bronze', 'writing', 3, false),
  ('overprepared', 'Overprepared', 'bronze', 'writing', 3, false),
  ('prepared_battler', 'Prepared Battler', 'silver', 'writing', 6, false)
ON CONFLICT (badge_code) DO NOTHING;

-- Positive Writing Badges (Silver)
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative)
VALUES
  ('multisyllabic_master', 'Multisyllabic Master', 'silver', 'writing', 6, false),
  ('metaphor_magician', 'Metaphor Magician', 'silver', 'writing', 6, false)
ON CONFLICT (badge_code) DO NOTHING;

-- Positive Writing Badges (Gold) - MUST BE EARNED, NOT BOUGHT
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative, available_at_creation)
VALUES
  ('pen_game_elite', 'Pen Game Elite', 'gold', 'writing', 10, false, false),
  ('scheme_king', 'Scheme King', 'gold', 'writing', 10, false, false),
  ('technical_writer', 'Technical Writer', 'gold', 'writing', 10, false, false)
ON CONFLICT (badge_code) DO NOTHING;

-- Negative Writing Badges (Bronze)
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative)
VALUES
  ('recycler', 'Recycler', 'bronze', 'writing', -4, true),
  ('biter', 'Biter', 'bronze', 'writing', -4, true),
  ('reach_god', 'Reach God', 'bronze', 'writing', -4, true),
  ('one_trick_pony', 'One-Trick Pony', 'bronze', 'writing', -4, true),
  ('filler_abuser', 'Filler Abuser', 'bronze', 'writing', -4, true),
  ('outdated_referencer', 'Outdated Referencer', 'bronze', 'writing', -4, true),
  ('lazy_writer', 'Lazy Writer', 'bronze', 'writing', -4, true),
  ('predictable', 'Predictable', 'bronze', 'writing', -4, true),
  ('redundant', 'Redundant', 'bronze', 'writing', -4, true),
  ('cliche_abuser', 'Cliche Abuser', 'bronze', 'writing', -4, true),
  ('name_flip_dependent', 'Name Flip Dependent', 'bronze', 'writing', -4, true)
ON CONFLICT (badge_code) DO NOTHING;

-- Negative Writing Badges (Silver)
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative)
VALUES
  ('overcomplicated', 'Overcomplicated', 'silver', 'writing', -7, true)
ON CONFLICT (badge_code) DO NOTHING;

-- Positive Performance Badges
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative)
VALUES
  ('stage_presence', 'Commanding Presence', 'bronze', 'performance', 3, false),
  ('crowd_control', 'Crowd Control Expert', 'bronze', 'performance', 3, false),
  ('aggressive', 'Aggressive Battler', 'bronze', 'delivery', 3, false),
  ('animated', 'Animated Performer', 'bronze', 'delivery', 3, false),
  ('speed_rapper', 'Speed Rapper', 'bronze', 'delivery', 3, false),
  ('main_stage_specialist', 'Main Stage Specialist', 'silver', 'performance', 6, false),
  ('small_room_killer', 'Small Room Killer', 'silver', 'performance', 6, false),
  ('smooth_flow', 'Smooth Flow', 'silver', 'delivery', 6, false)
ON CONFLICT (badge_code) DO NOTHING;

-- Positive Performance Badges (Gold) - MUST BE EARNED
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative, available_at_creation)
VALUES
  ('performance_beast', 'Performance Beast', 'gold', 'performance', 10, false, false) -- MUST EARN
ON CONFLICT (badge_code) DO NOTHING;

-- Negative Performance Badges
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative)
VALUES
  ('mumbler', 'Mumbler', 'bronze', 'performance', -4, true),
  ('monotone_deliverer', 'Monotone Deliverer', 'bronze', 'performance', -4, true),
  ('poor_breath_control', 'Poor Breath Control', 'bronze', 'performance', -4, true),
  ('energy_drainer', 'Energy Drainer', 'bronze', 'performance', -4, true),
  ('stiff_body_language', 'Stiff Body Language', 'bronze', 'performance', -4, true)
ON CONFLICT (badge_code) DO NOTHING;

-- Content Badges (Bronze/Silver)
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative)
VALUES
  ('punchline_heavy', 'Punchline Heavy', 'silver', 'content', 6, false),
  ('storyteller', 'Master Storyteller', 'silver', 'content', 6, false),
  ('comedian', 'Comedian', 'silver', 'content', 6, false),
  ('braggadocious', 'Braggadocious', 'bronze', 'content', 3, false),
  ('gritty', 'Gritty', 'silver', 'content', 6, false),
  ('political_commentary', 'Political Commentary', 'silver', 'content', 6, false),
  ('shock_value', 'Shock Value', 'bronze', 'content', 3, false),
  ('personal_attack_specialist', 'Personal Attack Specialist', 'silver', 'content', 6, false)
ON CONFLICT (badge_code) DO NOTHING;

-- Content Badges (Gold) - MUST BE EARNED
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative, available_at_creation)
VALUES
  ('angle_master', 'Angle Master', 'gold', 'content', 10, false, false), -- MUST EARN
  ('enhanced_storyteller', 'Enhanced Storyteller', 'gold', 'content', 10, false, false) -- MUST EARN
ON CONFLICT (badge_code) DO NOTHING;

-- Freestyle/Improvisation Badges (Bronze/Silver)
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative)
VALUES
  ('unpredictable', 'Unpredictable', 'bronze', 'delivery', 3, false),
  ('off_the_top', 'Off the Top', 'silver', 'delivery', 6, false)
ON CONFLICT (badge_code) DO NOTHING;

-- Freestyle/Improvisation Badges (Gold) - MUST BE EARNED
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative, available_at_creation)
VALUES
  ('freestyle', 'Freestyle Genius', 'gold', 'delivery', 10, false, false) -- MUST EARN
ON CONFLICT (badge_code) DO NOTHING;

-- Positive Reputation Badges (Silver)
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative)
VALUES
  ('crowd_favorite', 'Crowd Favorite', 'silver', 'reputation_positive', 6, false),
  ('viral_sensation', 'Viral Sensation', 'silver', 'reputation_positive', 6, false),
  ('consistent_performer', 'Consistent Performer', 'silver', 'reputation_positive', 6, false),
  ('consistent_grinder', 'Consistent Grinder', 'silver', 'reputation_positive', 6, false)
ON CONFLICT (badge_code) DO NOTHING;

-- Positive Reputation Badges (Gold) - MUST BE EARNED
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative, available_at_creation)
VALUES
  ('believable_persona', 'Believable Persona', 'gold', 'reputation_positive', 10, false, false), -- MUST EARN
  ('respected_veteran', 'Respected Veteran', 'gold', 'reputation_positive', 10, false, false), -- MUST EARN
  ('clutch_performer', 'Clutch Performer', 'gold', 'reputation_positive', 10, false, false), -- MUST EARN
  ('consummate_professional', 'Consummate Professional', 'gold', 'reputation_positive', 10, false, false), -- MUST EARN
  ('battle_of_the_night_winner', 'Battle of the Night Winner', 'gold', 'reputation_positive', 10, false, false) -- MUST EARN
ON CONFLICT (badge_code) DO NOTHING;

-- Negative Reputation Badges (Bronze)
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative)
VALUES
  ('choker', 'Known Choker', 'bronze', 'reputation_negative', -4, true),
  ('unreliable', 'Unreliable', 'bronze', 'reputation_negative', -4, true),
  ('controversial', 'Controversial', 'bronze', 'reputation_negative', -4, true),
  ('drama_starter', 'Drama Starter', 'bronze', 'reputation_negative', -4, true),
  ('social_media_created', 'Social Media Created', 'bronze', 'reputation_negative', -4, true),
  ('clout_chaser', 'Clout Chaser', 'bronze', 'reputation_negative', -4, true),
  ('career_plateaued', 'Career Plateaued', 'bronze', 'reputation_negative', -4, true),
  ('disrespectful', 'Disrespectful', 'bronze', 'reputation_negative', -4, true),
  ('health_issues', 'Health Issues', 'bronze', 'reputation_negative', -4, true),
  ('financial_struggles', 'Financial Struggles', 'bronze', 'reputation_negative', -4, true),
  ('bitter_veteran', 'Bitter Veteran', 'bronze', 'reputation_negative', -4, true),
  ('weak_chin', 'Weak Chin', 'bronze', 'reputation_negative', -4, true),
  ('culture_vulture', 'Culture Vulture', 'bronze', 'reputation_negative', -4, true),
  ('glory_days_living', 'Living in Glory Days', 'bronze', 'reputation_negative', -4, true)
ON CONFLICT (badge_code) DO NOTHING;

-- Negative Reputation Badges (Silver)
INSERT INTO badge_costs (badge_code, badge_name, tier, category, point_cost, is_negative)
VALUES
  ('fallen_star', 'Fallen Star', 'silver', 'reputation_negative', -7, true),
  ('known_stealer', 'Known Stealer', 'silver', 'reputation_negative', -7, true),
  ('jail_risk', 'Jail Risk', 'silver', 'reputation_negative', -7, true),
  ('substance_issues', 'Substance Issues', 'silver', 'reputation_negative', -7, true),
  ('backstabber', 'Backstabber', 'silver', 'reputation_negative', -7, true),
  ('washed', 'Washed', 'silver', 'reputation_negative', -7, true)
ON CONFLICT (badge_code) DO NOTHING;

-- ==========================================================================
-- Seed initial badge rule exceptions
-- Examples of how badges override core game rules
-- ==========================================================================

-- Freestyle Genius: Ignores low prep penalties
INSERT INTO badge_rule_exceptions (badge_code, rule_domain, exception_config, description)
VALUES
  ('freestyle', 'prep_requirements',
   '{"ignore_low_prep_penalty": true, "minimum_prep_days": 0, "maximum_optimal_prep": 3}',
   'Freestyle Genius thrives on minimal prep (≤3 days) and ignores low prep penalties')
ON CONFLICT (badge_code, rule_domain) DO NOTHING;

-- Freestyle Genius: Choke calculation exception
INSERT INTO badge_rule_exceptions (badge_code, rule_domain, exception_config, description)
VALUES
  ('freestyle', 'choke_calculation',
   '{"choke_reduction": 0.25, "freestyle_safety_net": true}',
   'Freestyle Genius has -25% choke chance and can recover from mistakes')
ON CONFLICT (badge_code, rule_domain) DO NOTHING;

-- Known Choker: Immune to additional choke events (already maxed out)
INSERT INTO badge_rule_exceptions (badge_code, rule_domain, exception_config, description)
VALUES
  ('choker', 'event_immunity',
   '{"immune_to_events": ["choke_scandal", "pressure_event"]}',
   'Already has choker reputation, cannot trigger additional choke events')
ON CONFLICT (badge_code, rule_domain) DO NOTHING;

-- Unreliable: Can cancel battles but with penalties
INSERT INTO badge_rule_exceptions (badge_code, rule_domain, exception_config, description)
VALUES
  ('unreliable', 'cancellation_penalties',
   '{"penalty_multiplier": 1.5, "no_show_risk": 0.12}',
   'Cancellations and no-shows have increased penalties due to reputation')
ON CONFLICT (badge_code, rule_domain) DO NOTHING;

-- Known Stealer: Special deposit rules
INSERT INTO badge_rule_exceptions (badge_code, rule_domain, exception_config, description)
VALUES
  ('known_stealer', 'deposit_rules',
   '{"requires_full_upfront": true, "steal_triggers_blacklist": true, "reputation_penalty_per_theft": 3}',
   'Leagues require full payment upfront. Stealing deposit triggers immediate blacklist.')
ON CONFLICT (badge_code, rule_domain) DO NOTHING;

-- Consummate Professional: Never gets blacklisted
INSERT INTO badge_rule_exceptions (badge_code, rule_domain, exception_config, description)
VALUES
  ('consummate_professional', 'league_blacklist',
   '{"immune_to_blacklist": true, "reputation_bonus_per_completion": 0.5}',
   'Perfect reliability means leagues will always book you')
ON CONFLICT (badge_code, rule_domain) DO NOTHING;

-- Drama Starter: Scandal duration modified
INSERT INTO badge_rule_exceptions (badge_code, rule_domain, exception_config, description)
VALUES
  ('drama_starter', 'scandal_duration',
   '{"duration_multiplier": 1.5, "media_attention_multiplier": 2.0}',
   'Scandals last 50% longer and get double media attention')
ON CONFLICT (badge_code, rule_domain) DO NOTHING;

-- ============================================================================
-- Verification Query
-- ============================================================================
-- SELECT * FROM badge_costs ORDER BY category, tier, point_cost;
-- SELECT * FROM badge_rule_exceptions;
