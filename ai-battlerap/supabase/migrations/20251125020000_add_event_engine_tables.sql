-- ============================================================================
-- Event Engine - Branching Storylines System
-- Models real battle rap scandals: Math Hoffa, Twork, Geechi, Chess, Tsu Surf
-- ============================================================================

-- ==========================================================================
-- Table: event_definitions (Event Templates)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS event_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'criminal', 'financial', 'relationship', 'family',
    'substance', 'mental_health', 'career_failure',
    'betrayal', 'secret_identity'
  )),

  -- Trigger Conditions (JSONB)
  trigger_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  base_trigger_probability DECIMAL(4,3) NOT NULL DEFAULT 0.05,
  cooldown_battles INTEGER DEFAULT 5,

  -- Event Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Choices (JSONB array of choice objects)
  choices JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE event_definitions IS 'Event templates with trigger conditions and choice branches';
COMMENT ON COLUMN event_definitions.trigger_conditions IS 'JSONB: {badges_required: [], min_battles: 3, stress_threshold: 60, or_conditions: true}';
COMMENT ON COLUMN event_definitions.choices IS 'JSONB array: [{id, label, immediate_effects, future_consequences, karmic_debt_event}]';

CREATE INDEX idx_event_definitions_code ON event_definitions(code);
CREATE INDEX idx_event_definitions_category ON event_definitions(category);

-- ==========================================================================
-- Table: active_events (Current events affecting battler)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS active_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  event_definition_id UUID NOT NULL REFERENCES event_definitions(id),

  -- Event State
  triggered_week INTEGER NOT NULL,
  expires_week INTEGER,
  status TEXT NOT NULL CHECK (status IN ('pending_choice', 'resolved', 'ongoing')) DEFAULT 'pending_choice',

  -- Choices Made
  choice_selected TEXT,
  choice_timestamp TIMESTAMP WITH TIME ZONE,

  -- Effects (JSONB)
  active_effects JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE active_events IS 'Active event instances affecting battlers';
COMMENT ON COLUMN active_events.active_effects IS 'JSONB: Current attribute penalties/bonuses while event is active';

CREATE INDEX idx_active_events_battler ON active_events(battler_id);
CREATE INDEX idx_active_events_status ON active_events(status);
CREATE INDEX idx_active_events_week ON active_events(triggered_week);

-- ==========================================================================
-- Table: event_history (Permanent record of all events)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS event_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  event_definition_code TEXT NOT NULL,

  triggered_week INTEGER NOT NULL,
  resolved_week INTEGER,
  choice_made TEXT,
  outcome TEXT,

  -- For media/blog generation
  media_coverage_level INTEGER DEFAULT 5 CHECK (media_coverage_level >= 0 AND media_coverage_level <= 10),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE event_history IS 'Permanent record of all events for media generation and career narrative';

CREATE INDEX idx_event_history_battler ON event_history(battler_id);
CREATE INDEX idx_event_history_week ON event_history(triggered_week);

-- ==========================================================================
-- Table: karmic_debt (Future consequence triggers)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS karmic_debt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  source_event_code TEXT NOT NULL,
  consequence_event_code TEXT NOT NULL,
  trigger_probability DECIMAL(4,3) NOT NULL DEFAULT 0.15,

  accumulated_weight INTEGER DEFAULT 1,
  triggered BOOLEAN DEFAULT false,
  triggered_week INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE karmic_debt IS 'Choice consequences that trigger future events (e.g., stealing deposit → blacklist)';

CREATE INDEX idx_karmic_debt_battler ON karmic_debt(battler_id);
CREATE INDEX idx_karmic_debt_triggered ON karmic_debt(triggered);

-- ==========================================================================
-- Table: scandals (Week-based scandal tracking)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS scandals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  scandal_code TEXT NOT NULL,
  title TEXT NOT NULL,
  week_started INTEGER NOT NULL,
  week_expires INTEGER NOT NULL,

  intensity INTEGER DEFAULT 7 CHECK (intensity >= 1 AND intensity <= 10),
  media_coverage_level INTEGER DEFAULT 5 CHECK (media_coverage_level >= 0 AND media_coverage_level <= 10),

  -- Effects
  attribute_penalties JSONB DEFAULT '{}'::jsonb,
  reputation_impact INTEGER DEFAULT -2,

  -- Redemption
  redemption_path TEXT,
  redemption_progress INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE scandals IS 'Active scandals with week-based duration (Week 0-4: active, 5+: expired)';
COMMENT ON COLUMN scandals.intensity IS '1-10 scale. Math Hoffa punch = 10, Twork choke = 6, Geechi deposit = 7';

CREATE INDEX idx_scandals_battler ON scandals(battler_id);
CREATE INDEX idx_scandals_week_started ON scandals(week_started);
CREATE INDEX idx_scandals_active ON scandals(week_expires) WHERE week_expires IS NOT NULL;

-- ==========================================================================
-- Table: jail_events (Career interruption)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS jail_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  week_started INTEGER NOT NULL,
  duration_weeks INTEGER NOT NULL, -- Years = 52 weeks, Months = 4 weeks
  week_released INTEGER,

  reason TEXT,
  career_impact JSONB DEFAULT '{}'::jsonb,

  -- Away from culture flag
  is_incarcerated BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE jail_events IS 'Jail time events (Tsu Surf: years, others: months/weeks)';
COMMENT ON COLUMN jail_events.duration_weeks IS 'Years=52 weeks, Months=4 weeks, Weeks=1-3';

CREATE INDEX idx_jail_events_battler ON jail_events(battler_id);
CREATE INDEX idx_jail_events_active ON jail_events(is_incarcerated) WHERE is_incarcerated = true;

-- ==========================================================================
-- SEED EVENT DEFINITIONS (Real Battle Rap Scandals)
-- ==========================================================================

-- Event 1: Math Hoffa Punch (Violence → 3-year ban)
INSERT INTO event_definitions (code, name, category, title, description, trigger_conditions, base_trigger_probability, cooldown_battles, choices)
VALUES (
  'math_hoffa_punch',
  'Violent Altercation',
  'criminal',
  'Physical Confrontation at Event',
  'During a heated exchange, things escalated to physical violence. The entire culture is watching how you handle this.',
  '{"badges_required": ["drama_starter", "disrespectful"], "or_conditions": true, "min_battles": 3, "stress_threshold": 60}',
  0.08,
  15,
  '[
    {
      "id": "apologize_publicly",
      "label": "Issue public apology and take full responsibility",
      "immediate_effects": {"reputation": -2, "media_attention": 50},
      "future_consequences": {"redemption_arc_possible": true, "league_ban_duration_weeks": 52, "can_return_gradually": true},
      "karmic_debt_event": "redemption_opportunity"
    },
    {
      "id": "double_down",
      "label": "Stand by your actions, refuse to apologize",
      "immediate_effects": {"reputation": -4, "media_attention": 100},
      "future_consequences": {"league_ban_duration_weeks": 156, "blacklist_permanent": true},
      "karmic_debt_event": "blacklisted_everywhere"
    },
    {
      "id": "blame_others",
      "label": "Shift blame to others involved",
      "immediate_effects": {"reputation": -3, "media_attention": 75},
      "future_consequences": {"league_ban_duration_weeks": 104, "trust_issues": true},
      "karmic_debt_event": "backstabber_reputation"
    }
  ]'
)
ON CONFLICT (code) DO NOTHING;

-- Event 2: Twork Choking Pattern (6 years → redemption)
INSERT INTO event_definitions (code, name, category, title, description, trigger_conditions, base_trigger_probability, cooldown_battles, choices)
VALUES (
  'chronic_choking_crisis',
  'Pattern of Choking',
  'career_failure',
  'Your Reputation as a Choker is Affecting Your Career',
  'After multiple high-profile chokes, your reliability is being questioned. This could define your entire career.',
  '{"badges_required": ["choker"], "min_choke_count": 3, "min_battles": 8}',
  0.25,
  5,
  '[
    {
      "id": "address_publicly",
      "label": "Address it publicly, commit to redemption",
      "immediate_effects": {"reputation": -1, "media_attention": 60},
      "future_consequences": {"redemption_year_possible": true, "pressure_increased": true},
      "karmic_debt_event": "redemption_arc_2023"
    },
    {
      "id": "ignore_criticism",
      "label": "Ignore the critics, keep battling",
      "immediate_effects": {"reputation": -2, "stress": 20},
      "future_consequences": {"choker_badge_permanent": true, "offers_decrease": 30},
      "karmic_debt_event": null
    },
    {
      "id": "take_break",
      "label": "Take a break from battling to work on craft",
      "immediate_effects": {"stress": -30, "media_attention": -20},
      "future_consequences": {"comeback_potential": true, "miss_4_weeks": true},
      "karmic_debt_event": "triumphant_return"
    }
  ]'
)
ON CONFLICT (code) DO NOTHING;

-- Event 3: Geechi Deposit Theft (Financial scandal)
INSERT INTO event_definitions (code, name, category, title, description, trigger_conditions, base_trigger_probability, cooldown_battles, choices)
VALUES (
  'deposit_theft_scandal',
  'Deposit Theft Accusation',
  'financial',
  'You''re Accused of Stealing a Deposit',
  'A league publicly claims you took a deposit and never showed up. Your financial practices are under scrutiny.',
  '{"badges_required": ["known_stealer", "financial_struggles"], "or_conditions": true, "financial_stability": 3}',
  0.15,
  8,
  '[
    {
      "id": "return_money",
      "label": "Return the money and apologize",
      "immediate_effects": {"financial_stability": -2, "reputation": -1},
      "future_consequences": {"can_rebuild_trust": true, "reputation_recoverable": true},
      "karmic_debt_event": null
    },
    {
      "id": "deny_everything",
      "label": "Deny the accusations completely",
      "immediate_effects": {"reputation": -3, "media_attention": 80},
      "future_consequences": {"leagues_require_full_upfront": true, "offers_decrease": 50},
      "karmic_debt_event": "known_stealer_permanent"
    },
    {
      "id": "justify_keeping_it",
      "label": "Justify keeping it due to league''s unprofessionalism",
      "immediate_effects": {"financial_stability": 2, "reputation": -2},
      "future_consequences": {"controversy_badge": true, "some_leagues_blacklist": true},
      "karmic_debt_event": "controversial_figure"
    }
  ]'
)
ON CONFLICT (code) DO NOTHING;

-- Event 4: Chess Health Issues (Gets sick during battles)
INSERT INTO event_definitions (code, name, category, title, description, trigger_conditions, base_trigger_probability, cooldown_battles, choices)
VALUES (
  'recurring_health_crisis',
  'Health Issue During Battle',
  'mental_health',
  'You Get Sick During a High-Profile Battle',
  'Mid-battle, you experience a health episode. The crowd and media are speculating about your reliability.',
  '{"badges_required": ["health_issues"], "stress_threshold": 50}',
  0.30,
  3,
  '[
    {
      "id": "push_through",
      "label": "Push through and finish the battle",
      "immediate_effects": {"resilience": -1, "choke_chance": 0.08},
      "future_consequences": {"health_worsens": true, "respect_for_toughness": true},
      "karmic_debt_event": null
    },
    {
      "id": "stop_battle",
      "label": "Stop and prioritize your health",
      "immediate_effects": {"reputation": -2, "media_attention": 40},
      "future_consequences": {"leagues_hesitant": true, "health_improves": true},
      "karmic_debt_event": null
    },
    {
      "id": "seek_medical_help",
      "label": "Publicly seek medical help and treatment",
      "immediate_effects": {"stress": -20, "media_attention": 60},
      "future_consequences": {"health_badge_removable": true, "comeback_narrative": true},
      "karmic_debt_event": "health_redemption"
    }
  ]'
)
ON CONFLICT (code) DO NOTHING;

-- Event 5: Tsu Surf Jail Time (Years duration)
INSERT INTO event_definitions (code, name, category, title, description, trigger_conditions, base_trigger_probability, cooldown_battles, choices)
VALUES (
  'incarceration_event',
  'Arrested and Facing Jail Time',
  'criminal',
  'Legal Issues Lead to Incarceration',
  'Your criminal record caught up with you. You''re facing significant jail time, potentially ending your career.',
  '{"badges_required": ["jail_risk"], "min_battles": 5}',
  0.12,
  20,
  '[
    {
      "id": "accept_sentence",
      "label": "Accept the sentence, plan comeback",
      "immediate_effects": {"reputation": -2, "media_attention": 70},
      "future_consequences": {"jail_duration_years": 2, "career_on_hold": true, "comeback_legendary": true},
      "karmic_debt_event": "legendary_return"
    },
    {
      "id": "fight_charges",
      "label": "Fight the charges legally",
      "immediate_effects": {"financial_stability": -3, "stress": 40},
      "future_consequences": {"jail_duration_months": 6, "legal_drama": true},
      "karmic_debt_event": null
    }
  ]'
)
ON CONFLICT (code) DO NOTHING;

-- Event 6: Daylyt SquatterGate (Controversy → Fame)
INSERT INTO event_definitions (code, name, category, title, description, trigger_conditions, base_trigger_probability, cooldown_battles, choices)
VALUES (
  'outrageous_antic_scandal',
  'Outrageous Public Antic',
  'secret_identity',
  'You Pull an Outrageous Stunt That Goes Viral',
  'Your shocking behavior has the entire internet talking. Is this genius marketing or career suicide?',
  '{"badges_required": ["controversial", "shock_value"], "or_conditions": true, "min_battles": 4}',
  0.10,
  10,
  '[
    {
      "id": "monetize_controversy",
      "label": "Lean into the controversy, monetize the attention",
      "immediate_effects": {"media_attention": 150, "reputation": -1},
      "future_consequences": {"controversial_badge": true, "bookings_increase": 40, "mainstream_crossover": true},
      "karmic_debt_event": "culture_icon"
    },
    {
      "id": "apologize_and_retreat",
      "label": "Apologize and step back from the spotlight",
      "immediate_effects": {"media_attention": -30, "reputation": 0},
      "future_consequences": {"normal_career_path": true},
      "karmic_debt_event": null
    },
    {
      "id": "escalate_further",
      "label": "Double down with an even wilder stunt",
      "immediate_effects": {"media_attention": 200, "reputation": -3},
      "future_consequences": {"polarizing_figure": true, "banned_some_leagues": true, "cult_following": true},
      "karmic_debt_event": "legend_or_joke"
    }
  ]'
)
ON CONFLICT (code) DO NOTHING;

-- Event 7: Substance Issues
INSERT INTO event_definitions (code, name, category, title, description, trigger_conditions, base_trigger_probability, cooldown_battles, choices)
VALUES (
  'substance_abuse_crisis',
  'Substance Abuse Issue',
  'substance',
  'Your Substance Use is Affecting Your Career',
  'Your struggles with drugs or alcohol are becoming public knowledge. Your performance is suffering.',
  '{"badges_required": ["substance_issues"], "resilience": 4}',
  0.20,
  6,
  '[
    {
      "id": "enter_rehab",
      "label": "Enter rehab, take career break",
      "immediate_effects": {"stress": -40, "media_attention": 50},
      "future_consequences": {"miss_12_weeks": true, "substance_badge_removable": true, "comeback_inspiring": true},
      "karmic_debt_event": "recovery_champion"
    },
    {
      "id": "deny_problem",
      "label": "Deny there''s a problem, keep battling",
      "immediate_effects": {"reputation": -2, "choke_chance": 0.06},
      "future_consequences": {"problem_worsens": true, "career_spiral": true},
      "karmic_debt_event": "rock_bottom_event"
    },
    {
      "id": "address_privately",
      "label": "Address it privately without publicizing",
      "immediate_effects": {"stress": -20},
      "future_consequences": {"slow_recovery": true, "reputation_stable": true},
      "karmic_debt_event": null
    }
  ]'
)
ON CONFLICT (code) DO NOTHING;

-- Event 8: Financial Bankruptcy
INSERT INTO event_definitions (code, name, category, title, description, trigger_conditions, base_trigger_probability, cooldown_battles, choices)
VALUES (
  'financial_bankruptcy',
  'Financial Crisis',
  'financial',
  'You''re Broke and Desperate',
  'Your finances have hit rock bottom. You need money immediately and it''s affecting your decision-making.',
  '{"badges_required": ["financial_struggles"], "financial_stability": 2}',
  0.15,
  5,
  '[
    {
      "id": "take_bad_matchup",
      "label": "Accept a terrible matchup for the money",
      "immediate_effects": {"financial_stability": 1},
      "future_consequences": {"bad_loss_likely": true, "reputation_risk": true},
      "karmic_debt_event": null
    },
    {
      "id": "borrow_money",
      "label": "Borrow money from the culture",
      "immediate_effects": {"financial_stability": 2},
      "future_consequences": {"debt_to_repay": true, "reputation_hit_if_not_repaid": true},
      "karmic_debt_event": "debt_collection"
    },
    {
      "id": "side_hustle",
      "label": "Focus on side hustles, miss battles",
      "immediate_effects": {"financial_stability": 2, "miss_2_weeks": true},
      "future_consequences": {"career_momentum_lost": true},
      "karmic_debt_event": null
    }
  ]'
)
ON CONFLICT (code) DO NOTHING;

-- Event 9: Beef/Rivalry
INSERT INTO event_definitions (code, name, category, title, description, trigger_conditions, base_trigger_probability, cooldown_battles, choices)
VALUES (
  'major_beef_erupts',
  'Beef with Another Battler',
  'betrayal',
  'You''re in a Public Beef',
  'A heated rivalry has erupted. The culture wants to see you battle it out, but emotions are high.',
  '{"badges_required": ["drama_starter", "backstabber"], "or_conditions": true, "min_battles": 5}',
  0.18,
  8,
  '[
    {
      "id": "accept_battle",
      "label": "Accept the battle and settle it in the ring",
      "immediate_effects": {"media_attention": 80, "stress": 20},
      "future_consequences": {"big_battle_booked": true, "rivalry_storyline": true},
      "karmic_debt_event": null
    },
    {
      "id": "escalate_online",
      "label": "Escalate the beef on social media",
      "immediate_effects": {"media_attention": 100, "reputation": -1},
      "future_consequences": {"drama_starter_badge": true, "leagues_wary": true},
      "karmic_debt_event": "social_media_war"
    },
    {
      "id": "squash_beef",
      "label": "Privately squash the beef",
      "immediate_effects": {"media_attention": -20, "respect": 1},
      "future_consequences": {"mature_reputation": true},
      "karmic_debt_event": null
    }
  ]'
)
ON CONFLICT (code) DO NOTHING;

-- Event 10: Family Crisis
INSERT INTO event_definitions (code, name, category, title, description, trigger_conditions, base_trigger_probability, cooldown_battles, choices)
VALUES (
  'family_emergency',
  'Family Emergency',
  'family',
  'A Family Crisis Demands Your Attention',
  'Something serious has happened with your family. You need to choose between your career and being there for them.',
  '{"family_bond": 7}',
  0.10,
  12,
  '[
    {
      "id": "prioritize_family",
      "label": "Put family first, miss battles",
      "immediate_effects": {"family_bond": 2, "miss_4_weeks": true},
      "future_consequences": {"career_momentum_lost": true, "family_support_strong": true},
      "karmic_debt_event": null
    },
    {
      "id": "prioritize_career",
      "label": "Stay focused on your career",
      "immediate_effects": {"family_bond": -3, "stress": 30},
      "future_consequences": {"family_issues_worsen": true, "career_unaffected": true},
      "karmic_debt_event": "family_breakdown"
    },
    {
      "id": "balance_both",
      "label": "Try to balance both (difficult)",
      "immediate_effects": {"stress": 40},
      "future_consequences": {"burnout_risk": true, "neither_fully_addressed": true},
      "karmic_debt_event": null
    }
  ]'
)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- Seed more events (11-20)
-- ============================================================================

-- Event 11: Career Comeback Opportunity
INSERT INTO event_definitions (code, name, category, title, description, trigger_conditions, base_trigger_probability, choices)
VALUES (
  'redemption_opportunity',
  'Redemption Battle Offer',
  'career_failure',
  'A Major Battle Offer for Redemption',
  'After your struggles, a major league is offering you a high-profile redemption battle. This could be your comeback.',
  '{"has_karmic_debt": true, "min_battles": 10, "reputation": 4}',
  0.08,
  '[
    {"id": "accept_redemption", "label": "Accept and prepare like never before", "immediate_effects": {"stress": 30, "preparation": 2}, "future_consequences": {"redemption_narrative": true, "pressure_extreme": true}, "karmic_debt_event": null},
    {"id": "decline_offer", "label": "Decline, not ready yet", "immediate_effects": {"stress": -10}, "future_consequences": {"missed_opportunity": true}, "karmic_debt_event": null}
  ]'
)
ON CONFLICT (code) DO NOTHING;

-- Event 12: Veteran Respect Moment
INSERT INTO event_definitions (code, name, category, title, description, trigger_conditions, base_trigger_probability, choices)
VALUES (
  'veteran_co_sign',
  'Veteran Publicly Endorses You',
  'career_failure',
  'A Respected Veteran Gives You Props',
  'A legendary battler publicly praised your work. This could elevate your status significantly.',
  '{"min_battles": 8, "reputation": 6}',
  0.05,
  '[
    {"id": "accept_humbly", "label": "Accept humbly, show respect", "immediate_effects": {"reputation": 1}, "future_consequences": {"veteran_respect": true}, "karmic_debt_event": null},
    {"id": "act_cocky", "label": "Use it to promote yourself aggressively", "immediate_effects": {"media_attention": 50, "reputation": -1}, "future_consequences": {"polarizing_figure": true}, "karmic_debt_event": null}
  ]'
)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- Add week tracking to battlers
-- ============================================================================
ALTER TABLE battlers
ADD COLUMN IF NOT EXISTS current_week INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS away_from_culture BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS away_reason TEXT;

COMMENT ON COLUMN battlers.current_week IS 'Current game week for time-based event triggers';
COMMENT ON COLUMN battlers.away_from_culture IS 'TRUE when in jail, hospital, vacation, etc.';
COMMENT ON COLUMN battlers.away_reason IS 'Why they are away: "incarcerated", "hospital", "rehab", "vacation"';
