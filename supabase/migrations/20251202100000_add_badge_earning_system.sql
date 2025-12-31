-- ============================================================================
-- Badge Earning System
-- Tracks badge progress and earned badges during gameplay
-- ============================================================================

-- ==========================================================================
-- Table: badge_earned
-- Records when a battler earns a badge during gameplay
-- ==========================================================================
CREATE TABLE IF NOT EXISTS badge_earned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL,

  -- When and how it was earned
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  earned_reason TEXT,  -- "Won 5 battles after being down 0-1" or "Reached finals as #15 seed"
  battle_id UUID REFERENCES battles(id),  -- Optional: which battle triggered it

  -- Badge metadata at time of earning
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  category TEXT,  -- writing, performance, reputation, content, regional, tournament

  -- For negative badges that can be removed
  is_active BOOLEAN DEFAULT true,
  removed_at TIMESTAMPTZ,
  removal_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique: can only earn each badge once (unless removed and re-earned)
  UNIQUE(battler_id, badge_code, earned_at)
);

COMMENT ON TABLE badge_earned IS 'Tracks badges earned through gameplay (not character creation)';
COMMENT ON COLUMN badge_earned.is_active IS 'FALSE if badge was removed (negative badge redemption)';

-- Indexes for fast lookups
CREATE INDEX idx_badge_earned_battler ON badge_earned(battler_id);
CREATE INDEX idx_badge_earned_code ON badge_earned(badge_code);
CREATE INDEX idx_badge_earned_active ON badge_earned(battler_id, is_active) WHERE is_active = true;

-- ==========================================================================
-- Table: badge_progress
-- Tracks progress toward earning badges (e.g., 6/10 haymakers)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS badge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL,

  -- Progress tracking
  current_value INTEGER DEFAULT 0,  -- Current count (e.g., 6 haymakers)
  target_value INTEGER NOT NULL,    -- Required to earn (e.g., 10 haymakers)
  progress_pct DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN target_value > 0 THEN (current_value::decimal / target_value * 100) ELSE 0 END
  ) STORED,

  -- Progress history (for display)
  last_increment_at TIMESTAMPTZ,
  last_increment_battle_id UUID REFERENCES battles(id),

  -- For negative badge removal progress
  is_removal_progress BOOLEAN DEFAULT false,  -- true = tracking removal, false = tracking earning

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(battler_id, badge_code)
);

COMMENT ON TABLE badge_progress IS 'Tracks progress toward earning or removing badges';
COMMENT ON COLUMN badge_progress.is_removal_progress IS 'TRUE when tracking progress to REMOVE a negative badge';

-- Indexes
CREATE INDEX idx_badge_progress_battler ON badge_progress(battler_id);
CREATE INDEX idx_badge_progress_code ON badge_progress(badge_code);
CREATE INDEX idx_badge_progress_close ON badge_progress(battler_id) WHERE progress_pct >= 80;

-- ==========================================================================
-- Table: badge_definitions
-- Master list of all badges with earning requirements
-- ==========================================================================
CREATE TABLE IF NOT EXISTS badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_code TEXT UNIQUE NOT NULL,
  badge_name TEXT NOT NULL,

  -- Classification
  category TEXT NOT NULL CHECK (category IN (
    'writing', 'performance', 'reputation', 'content',
    'regional', 'tournament', 'special'
  )),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_negative BOOLEAN DEFAULT false,

  -- Display
  icon TEXT,  -- Emoji or icon code
  description TEXT NOT NULL,
  effect_text TEXT,  -- Full mechanical effect description

  -- Earning requirements (JSONB for flexibility)
  earning_requirements JSONB,
  -- Examples:
  -- {"type": "milestone", "metric": "haymaker_segments", "target": 10}
  -- {"type": "streak", "metric": "battles_without_choke", "target": 5}
  -- {"type": "threshold", "attribute": "lyricism", "min_value": 9}
  -- {"type": "career", "metric": "total_battles", "target": 20, "additional": {"reputation_min": 8}}

  -- Removal requirements (for negative badges)
  removal_requirements JSONB,
  -- Example: {"type": "streak", "metric": "battles_without_choke", "target": 5}

  -- Flags
  available_at_creation BOOLEAN DEFAULT false,
  can_be_removed BOOLEAN DEFAULT false,  -- For negative badges
  is_regional BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE badge_definitions IS 'Master list of all badges with earning/removal requirements';

-- ==========================================================================
-- Seed badge definitions
-- ==========================================================================

-- WRITING BADGES - Positive
INSERT INTO badge_definitions (badge_code, badge_name, category, rarity, icon, description, effect_text, earning_requirements, available_at_creation)
VALUES
  ('punchline_king_queen', 'Punchline King/Queen', 'writing', 'rare', '👑',
   'Your haymakers hit different',
   '+15% peak score, +5 crowd reaction. Trade-off: -10% consistency.',
   '{"type": "milestone", "metric": "haymaker_segments", "target": 10}', false),

  ('scheme_specialist', 'Scheme Specialist', 'writing', 'epic', '🧩',
   'Complex rhyme patterns are your bread and butter',
   '+25% lyricism, +30% writing prep efficiency, +20% consistency.',
   '{"type": "career", "metric": "battles_high_lyricism", "target": 15}', false),

  ('metaphor_master', 'Metaphor Master', 'writing', 'rare', '🎭',
   'Creative comparisons flow naturally',
   '+30% creativity, +15% lyricism, +20% writing prep. Small Room: +5%.',
   '{"type": "threshold", "attribute": "creativity", "min_value": 8}', true),

  ('wordplay_wizard', 'Wordplay Wizard', 'writing', 'rare', '✨',
   'Your wordplay is unmatched',
   '+40% wordplay, +25% writing prep, +8 crowd reaction.',
   '{"type": "threshold", "attribute": "wordplay", "min_value": 7}', true),

  ('freestyle_genius', 'Freestyle Genius', 'writing', 'legendary', '⚡',
   'You thrive with minimal prep',
   '+30% creativity, +20% peak, -25% choke. Low prep = bonus.',
   '{"type": "combo", "requirements": [{"metric": "battles_won_low_prep", "target": 10}, {"attribute": "creativity", "min_value": 7}]}', false),

  ('creativity_beast', 'Creativity Beast', 'writing', 'rare', '🎨',
   'Your content is always fresh',
   '+35% creativity, +15% wordplay, +30% research prep, +10% peak.',
   '{"type": "threshold", "attribute": "creativity", "min_value": 8}', true),

  ('consistent_writer', 'Consistent Writer', 'writing', 'rare', '📝',
   'Your pen game is reliable',
   '+40% consistency, -40% variance. +15% writing prep.',
   '{"type": "milestone", "metric": "battles_high_consistency", "target": 10}', false),

  ('technical_writer', 'Technical Writer', 'writing', 'epic', '🔬',
   'Precision bars are your specialty',
   '+35% writing prep, +25% lyricism. Small Room: +5%. Trade-off: -10% stage presence.',
   '{"type": "career", "metric": "battles_heavy_prep", "target": 15}', false),

  ('angle_master', 'Angle Master', 'writing', 'epic', '🎯',
   'Personal attacks are devastating',
   '+35% research prep, +20% peak, +20% creativity. Trade-off: -10% wordplay, -10 crowd.',
   '{"type": "career", "metric": "research_heavy_battles", "target": 20}', false),

  ('pen_game_elite', 'Pen Game Elite', 'writing', 'legendary', '🏆',
   'Writing mastery achieved',
   '+25% ALL writing attributes, +30% writing prep. Trade-off: -10 crowd reaction.',
   '{"type": "threshold_all", "attributes": ["lyricism", "wordplay", "creativity"], "min_value": 9}', false),

  ('multisyllabic_master', 'Multisyllabic Master', 'writing', 'rare', '📚',
   'Complex rhyme schemes flow naturally',
   '+30% lyricism, +20% wordplay, +25% writing prep. Trade-off: -5% delivery.',
   '{"type": "threshold", "attribute": "lyricism", "min_value": 7}', true),

  ('rebuttal_king_queen', 'Rebuttal King/Queen', 'writing', 'rare', '🔄',
   'You think on your feet',
   '-2% choke, +20% creativity, +15% performance prep.',
   '{"type": "milestone", "metric": "successful_rebuttals", "target": 15}', true)
ON CONFLICT (badge_code) DO UPDATE SET
  badge_name = EXCLUDED.badge_name,
  description = EXCLUDED.description,
  effect_text = EXCLUDED.effect_text,
  earning_requirements = EXCLUDED.earning_requirements;

-- WRITING BADGES - Negative
INSERT INTO badge_definitions (badge_code, badge_name, category, rarity, is_negative, can_be_removed, icon, description, effect_text, earning_requirements, removal_requirements)
VALUES
  ('recycler', 'Recycler', 'writing', 'common', true, true, '♻️',
   'You reuse material too often',
   '-30% creativity, -20% writing prep, -10 crowd reaction.',
   '{"type": "pattern", "metric": "low_creativity_battles", "target": 8}',
   '{"type": "streak", "metric": "battles_creativity_7_plus", "target": 8}'),

  ('biter', 'Biter', 'writing', 'rare', true, false, '🦷',
   'You steal bars',
   '-40% creativity, -15 crowd reaction, -2 reputation per battle.',
   '{"type": "event", "event_type": "caught_stealing"}',
   '{"type": "streak", "metric": "battles_creativity_8_plus", "target": 15}'),

  ('lazy_writer', 'Lazy Writer', 'writing', 'common', true, true, '😴',
   'Minimal effort in your writing',
   '-40% writing prep, -20% all writing attributes.',
   '{"type": "pattern", "metric": "low_prep_battles", "target": 10}',
   '{"type": "streak", "metric": "battles_6_plus_prep", "target": 10}'),

  ('one_trick_pony', 'One-Trick Pony', 'writing', 'common', true, true, '🎠',
   'Your content is predictable',
   '-25% creativity. Opponents get +10% prep bonus against you.',
   '{"type": "pattern", "metric": "same_style_battles", "target": 15}',
   '{"type": "diversity", "metric": "content_styles_used", "target": 3}')
ON CONFLICT (badge_code) DO UPDATE SET
  badge_name = EXCLUDED.badge_name,
  description = EXCLUDED.description,
  effect_text = EXCLUDED.effect_text,
  removal_requirements = EXCLUDED.removal_requirements;

-- PERFORMANCE BADGES - Positive
INSERT INTO badge_definitions (badge_code, badge_name, category, rarity, icon, description, effect_text, earning_requirements, available_at_creation)
VALUES
  ('crowd_favorite', 'Crowd Favorite', 'performance', 'rare', '🌟',
   'The crowd loves you',
   '+15 crowd reaction, +30% crowd control. Main Stage: +8%.',
   '{"type": "average", "metric": "crowd_reaction", "min_value": 80, "battles_required": 10}', false),

  ('stage_domination', 'Stage Domination', 'performance', 'legendary', '👑',
   'You command any stage',
   '+35% stage presence, +25% crowd control, +30% performance prep. Main Stage: +10%.',
   '{"type": "threshold_all", "attributes": ["stage_presence", "crowd_control", "delivery"], "min_value": 9}', false),

  ('smooth_flow', 'Smooth Flow', 'performance', 'rare', '🌊',
   'Effortless delivery',
   '+30% delivery, +20% consistency, +20% performance prep.',
   '{"type": "threshold", "attribute": "delivery", "min_value": 7}', true),

  ('aggressive', 'Aggressive', 'performance', 'rare', '🔥',
   'High energy presence',
   '+25% delivery, +20% stage presence, +5 crowd reaction. Main Stage: +5%. Trade-off: +1% choke.',
   '{"type": "pattern", "metric": "aggressive_performances", "target": 10}', true),

  ('charismatic', 'Charismatic', 'performance', 'rare', '✨',
   'Natural charm on stage',
   '+35% crowd control, +20% stage presence, +10 crowd reaction, +15% performance prep.',
   '{"type": "threshold", "attribute": "crowd_control", "min_value": 7}', true),

  ('theatrical', 'Theatrical', 'performance', 'rare', '🎪',
   'You put on a show',
   '+30% stage presence, +25% crowd control, +25% performance prep. Main Stage: +10%. Trade-off: -5% Small Room.',
   '{"type": "pattern", "metric": "theatrical_performances", "target": 10}', true)
ON CONFLICT (badge_code) DO UPDATE SET
  badge_name = EXCLUDED.badge_name,
  description = EXCLUDED.description,
  effect_text = EXCLUDED.effect_text,
  earning_requirements = EXCLUDED.earning_requirements;

-- PERFORMANCE BADGES - Negative
INSERT INTO badge_definitions (badge_code, badge_name, category, rarity, is_negative, can_be_removed, icon, description, effect_text, earning_requirements, removal_requirements)
VALUES
  ('choker', 'Choker', 'performance', 'common', true, true, '😰',
   'You struggle under pressure',
   '+2% choke per segment, -30% rest efficiency, -10 crowd reaction.',
   '{"type": "streak", "metric": "consecutive_chokes", "target": 2}',
   '{"type": "streak", "metric": "battles_without_choke", "target": 5}'),

  ('known_choker', 'Known Choker', 'performance', 'rare', true, true, '😱',
   'Everyone expects you to choke',
   '+7% choke PER SEGMENT, -40% rest efficiency, -12 crowd reaction.',
   '{"type": "career", "metric": "total_chokes", "target": 5}',
   '{"type": "streak", "metric": "battles_without_choke", "target": 10}'),

  ('mumbler', 'Mumbler', 'performance', 'common', true, false, '🤐',
   'Unclear delivery',
   '-30% delivery, -12 crowd reaction, -15% peak score.',
   '{"type": "threshold_below", "attribute": "delivery", "max_value": 4}',
   null),

  ('inconsistent_performer', 'Inconsistent Performer', 'performance', 'common', true, true, '📊',
   'Wildly variable performances',
   '+80% segment variance, -40% consistency.',
   '{"type": "pattern", "metric": "high_variance_battles", "target": 10}',
   '{"type": "streak", "metric": "consistent_battles", "target": 5}')
ON CONFLICT (badge_code) DO UPDATE SET
  badge_name = EXCLUDED.badge_name,
  description = EXCLUDED.description,
  effect_text = EXCLUDED.effect_text,
  removal_requirements = EXCLUDED.removal_requirements;

-- REPUTATION BADGES - Positive
INSERT INTO badge_definitions (badge_code, badge_name, category, rarity, icon, description, effect_text, earning_requirements, available_at_creation)
VALUES
  ('respected_veteran', 'Respected Veteran', 'reputation', 'epic', '🎖️',
   'Your experience commands respect',
   '+8 crowd reaction, -2% choke, +20% rest efficiency. +20% positive media.',
   '{"type": "combo", "requirements": [{"metric": "total_battles", "target": 20}, {"attribute": "reputation", "min_value": 8}]}', false),

  ('consummate_professional', 'Consummate Professional', 'reputation', 'legendary', '💼',
   'The ultimate professional',
   '+15% ALL prep types, -4% choke, +20% consistency. +2 reputation, +25% battle offers.',
   '{"type": "combo", "requirements": [{"attribute": "reputation", "min_value": 9}, {"metric": "completion_rate", "min_value": 95}]}', false),

  ('clutch_performer', 'Clutch Performer', 'reputation', 'epic', '🎯',
   'You deliver when it matters',
   '-4% choke, +15% peak, +20% rest efficiency.',
   '{"type": "milestone", "metric": "clutch_moments", "target": 5}', false),

  ('resilient_battler', 'Resilient Battler', 'reputation', 'rare', '💪',
   'Mentally tough',
   '-3% choke, +25% rest efficiency, +10% consistency.',
   '{"type": "streak", "metric": "battles_without_choke", "target": 10}', false),

  ('believable_persona', 'Believable Persona', 'reputation', 'rare', '🎭',
   'Your persona is authentic',
   '+12 crowd reaction, +15% delivery, +15% research prep. +1 reputation.',
   '{"type": "combo", "requirements": [{"attribute": "authenticity", "min_value": 8}, {"attribute": "reputation", "min_value": 6}]}', false),

  ('battle_of_the_night', 'Battle of the Night Winner', 'reputation', 'epic', '🏅',
   'You steal the show',
   '+20% peak, +10 crowd reaction, +20% variance. +15 public knowledge, +40% media attention.',
   '{"type": "milestone", "metric": "standout_performances", "target": 5}', false)
ON CONFLICT (badge_code) DO UPDATE SET
  badge_name = EXCLUDED.badge_name,
  description = EXCLUDED.description,
  effect_text = EXCLUDED.effect_text,
  earning_requirements = EXCLUDED.earning_requirements;

-- REPUTATION BADGES - Negative
INSERT INTO badge_definitions (badge_code, badge_name, category, rarity, is_negative, can_be_removed, icon, description, effect_text, earning_requirements, removal_requirements)
VALUES
  ('drama_starter', 'Drama Starter', 'reputation', 'common', true, true, '🎬',
   'You create controversy',
   '+5 crowd reaction, +1.5% choke. -30% battle offers, -2 reputation.',
   '{"type": "milestone", "metric": "drama_choices", "target": 3}',
   '{"type": "streak", "metric": "drama_free_choices", "target": 5}'),

  ('unreliable', 'Unreliable', 'reputation', 'rare', true, false, '❌',
   'You cant be counted on',
   '+2% choke, -20% rest efficiency. -40% battle offers.',
   '{"type": "event", "event_type": "no_show"}',
   '{"type": "streak", "metric": "completed_battles", "target": 20}'),

  ('washed', 'Washed', 'reputation', 'legendary', true, false, '🚿',
   'Past your prime',
   '-15% ALL attributes, -25% rest efficiency. -2 reputation, -40% offers.',
   '{"type": "decline", "metric": "attribute_drop", "threshold": 2, "timeframe": 10}',
   null),

  ('financial_struggles', 'Financial Struggles', 'reputation', 'common', true, true, '💸',
   'Money problems affect you',
   '-30% rest efficiency, -40% life prep, +2% choke.',
   '{"type": "threshold_below", "attribute": "financial_stability", "max_value": 3}',
   '{"type": "threshold", "attribute": "financial_stability", "min_value": 5}')
ON CONFLICT (badge_code) DO UPDATE SET
  badge_name = EXCLUDED.badge_name,
  description = EXCLUDED.description,
  effect_text = EXCLUDED.effect_text,
  removal_requirements = EXCLUDED.removal_requirements;

-- REGIONAL BADGES
INSERT INTO badge_definitions (badge_code, badge_name, category, rarity, is_regional, icon, description, effect_text, earning_requirements)
VALUES
  ('nyc_native', 'NYC Native', 'regional', 'rare', true, '🗽',
   'Born in the mecca of hip-hop',
   '+10% lyricism, +5 crowd reaction in East Coast venues. Respected by veterans.',
   '{"type": "regional", "cities": ["New York", "Brooklyn", "Bronx", "Queens", "Harlem"]}'),

  ('philly_rep', 'Philly Rep', 'regional', 'rare', true, '🔔',
   'Philadelphia blood',
   '+15% wordplay, +5% Small Room bonus. Lyrical city roots.',
   '{"type": "regional", "cities": ["Philadelphia"]}'),

  ('detroit_made', 'Detroit Made', 'regional', 'rare', true, '🚗',
   'Motor City warrior',
   '+15% aggressive delivery, +10% resilience. Detroit dont fold.',
   '{"type": "regional", "cities": ["Detroit"]}'),

  ('chicago_bred', 'Chicago Bred', 'regional', 'rare', true, '🌬️',
   'Windy City style',
   '+10% creativity, +10% stage presence. Chicago energy.',
   '{"type": "regional", "cities": ["Chicago"]}'),

  ('la_native', 'LA Native', 'regional', 'rare', true, '🌴',
   'West Coast swagger',
   '+15% stage presence, +10% Main Stage bonus. LA loves a show.',
   '{"type": "regional", "cities": ["Los Angeles", "Compton", "Long Beach", "Inglewood"]}'),

  ('bay_area_rep', 'Bay Area Rep', 'regional', 'rare', true, '🌉',
   'Bay Area originality',
   '+20% creativity, +10% unorthodox style. The Bay does things differently.',
   '{"type": "regional", "cities": ["San Francisco", "Oakland", "San Jose"]}'),

  ('atl_rep', 'ATL Rep', 'regional', 'rare', true, '🍑',
   'Southern hospitality',
   '+15% delivery, +10% crowd control. Southern charm meets bars.',
   '{"type": "regional", "cities": ["Atlanta"]}'),

  ('houston_made', 'Houston Made', 'regional', 'rare', true, '🤠',
   'Texas heavyweight',
   '+10% aggressive delivery, +10% stage presence. Texas presence.',
   '{"type": "regional", "cities": ["Houston"]}'),

  ('dmv_native', 'DMV Native', 'regional', 'rare', true, '🏛️',
   'DMV precision',
   '+15% technical writing, +10% research prep. Calculated bars.',
   '{"type": "regional", "cities": ["Washington", "Baltimore", "DC"]}'),

  ('miami_heat', 'Miami Heat', 'regional', 'rare', true, '🌊',
   '305 energy',
   '+15% performance, +10 crowd reaction. Miami brings heat.',
   '{"type": "regional", "cities": ["Miami"]}'),

  ('toronto_rep', 'Toronto Rep', 'regional', 'rare', true, '🍁',
   'North of the border',
   '+15% consistency, +10% professionalism. Toronto reliability.',
   '{"type": "regional", "cities": ["Toronto"]}'),

  ('uk_native', 'UK Native', 'regional', 'rare', true, '🇬🇧',
   'British bars',
   '+20% wordplay, +5% unique style. UK cadences.',
   '{"type": "regional", "countries": ["United Kingdom", "UK", "England"]}'),

  ('underground_rep', 'Underground Rep', 'regional', 'rare', true, '🏚️',
   'From the underground',
   '+20% hunger bonus when underdog, +10% authenticity. Something to prove.',
   '{"type": "regional", "tier": "underground"}')
ON CONFLICT (badge_code) DO UPDATE SET
  badge_name = EXCLUDED.badge_name,
  description = EXCLUDED.description,
  effect_text = EXCLUDED.effect_text,
  earning_requirements = EXCLUDED.earning_requirements;

-- TOURNAMENT BADGES
INSERT INTO badge_definitions (badge_code, badge_name, category, rarity, icon, description, effect_text, earning_requirements)
VALUES
  ('tournament_veteran', 'Tournament Veteran', 'tournament', 'epic', '🏆',
   'Tournament experience',
   '-3% choke in tournaments, +5 crowd reaction, +8% consistency, +10% stage presence. +10% prize money.',
   '{"type": "milestone", "metric": "tournaments_completed", "target": 3}'),

  ('big_stage_specialist', 'Big Stage Specialist', 'tournament', 'rare', '🎪',
   'Tournament performer',
   '+10 crowd reaction in tournaments, +15% stage presence, +10% delivery. Trade-off: -5% in regular battles.',
   '{"type": "average", "metric": "tournament_performance", "min_value": 7.5, "battles_required": 5}'),

  ('cinderella_story', 'Cinderella Story', 'tournament', 'legendary', '👟',
   'Underdog champion',
   '+20% peak, +8 crowd reaction, +12% creativity, -2% choke. +30% media attention. Effects last 30 days.',
   '{"type": "achievement", "metric": "finals_as_underdog", "seed_range": [13, 16]}')
ON CONFLICT (badge_code) DO UPDATE SET
  badge_name = EXCLUDED.badge_name,
  description = EXCLUDED.description,
  effect_text = EXCLUDED.effect_text,
  earning_requirements = EXCLUDED.earning_requirements;

-- CONTENT STYLE BADGES
INSERT INTO badge_definitions (badge_code, badge_name, category, rarity, icon, description, effect_text, earning_requirements, available_at_creation)
VALUES
  ('comedy', 'Comedy', 'content', 'rare', '😂',
   'Humor-based style',
   '+30% crowd control, +10 crowd reaction, +20% creativity, +15% rest efficiency, +15% delivery.',
   '{"type": "starter_or_earned", "earned_via": {"metric": "comedy_content_battles", "target": 10}}', true),

  ('comedian', 'Comedian', 'content', 'epic', '🎤',
   'Comedy master (evolved from Comedy)',
   '+30% crowd control, +10 crowd reaction, +25% creativity, +20% delivery, +10% peak.',
   '{"type": "evolution", "requires_badge": "comedy", "additional": {"metric": "comedy_battles_won", "target": 20}}', false),

  ('storytelling', 'Storytelling', 'content', 'rare', '📖',
   'Narrative verses',
   '+25% creativity, +20% lyricism, +20% consistency. Small Room: +8%.',
   '{"type": "starter_or_earned", "earned_via": {"metric": "storytelling_content_battles", "target": 10}}', true),

  ('enhanced_storyteller', 'Enhanced Storyteller', 'content', 'epic', '📚',
   'Narrative master (evolved from Storytelling)',
   '+35% creativity, +25% lyricism, +30% consistency, +15 crowd reaction, +20% writing prep. Small Room: +10%.',
   '{"type": "evolution", "requires_badge": "storytelling", "additional": {"metric": "storytelling_battles_won", "target": 20}}', false),

  ('gritty', 'Gritty', 'content', 'rare', '🏚️',
   'Street-style content',
   '+20% delivery, +15% stage presence. Small Room: +8%. Raw and authentic.',
   '{"type": "starter_or_earned"}', true),

  ('gun_bar_specialist', 'Gun Bar Specialist', 'content', 'rare', '🔫',
   'Violent imagery specialist',
   '+5% Small Room, +8% peak, +20% variance, +5% delivery, +3 crowd reaction.',
   '{"type": "pattern", "metric": "gun_bar_content_battles", "target": 15}', true),

  ('personal_attacks', 'Personal Attacks', 'content', 'rare', '🎯',
   'Angles specialist',
   '+30% research prep, +15% peak, +6 crowd reaction.',
   '{"type": "starter_or_earned"}', true)
ON CONFLICT (badge_code) DO UPDATE SET
  badge_name = EXCLUDED.badge_name,
  description = EXCLUDED.description,
  effect_text = EXCLUDED.effect_text,
  earning_requirements = EXCLUDED.earning_requirements;

-- ==========================================================================
-- Function: Get all badges for a battler (earned + creation + progress)
-- ==========================================================================
CREATE OR REPLACE FUNCTION get_battler_badges(p_battler_id UUID)
RETURNS TABLE (
  badge_code TEXT,
  badge_name TEXT,
  category TEXT,
  rarity TEXT,
  icon TEXT,
  description TEXT,
  effect_text TEXT,
  is_negative BOOLEAN,
  source TEXT,  -- 'creation', 'earned', 'in_progress'
  earned_at TIMESTAMPTZ,
  progress_current INTEGER,
  progress_target INTEGER,
  progress_pct DECIMAL
) AS $$
BEGIN
  RETURN QUERY

  -- Badges from creation (style_tags)
  SELECT
    bd.badge_code,
    bd.badge_name,
    bd.category,
    bd.rarity,
    bd.icon,
    bd.description,
    bd.effect_text,
    bd.is_negative,
    'creation'::TEXT as source,
    NULL::TIMESTAMPTZ as earned_at,
    NULL::INTEGER as progress_current,
    NULL::INTEGER as progress_target,
    NULL::DECIMAL as progress_pct
  FROM battlers b
  CROSS JOIN LATERAL jsonb_array_elements_text(b.style_tags) as tag
  LEFT JOIN badge_definitions bd ON bd.badge_code = tag OR bd.badge_name = tag
  WHERE b.id = p_battler_id AND bd.badge_code IS NOT NULL

  UNION ALL

  -- Earned badges
  SELECT
    bd.badge_code,
    bd.badge_name,
    bd.category,
    bd.rarity,
    bd.icon,
    bd.description,
    bd.effect_text,
    bd.is_negative,
    'earned'::TEXT as source,
    be.earned_at,
    NULL::INTEGER,
    NULL::INTEGER,
    NULL::DECIMAL
  FROM badge_earned be
  JOIN badge_definitions bd ON bd.badge_code = be.badge_code
  WHERE be.battler_id = p_battler_id AND be.is_active = true

  UNION ALL

  -- In-progress badges
  SELECT
    bd.badge_code,
    bd.badge_name,
    bd.category,
    bd.rarity,
    bd.icon,
    bd.description,
    bd.effect_text,
    bd.is_negative,
    'in_progress'::TEXT as source,
    NULL::TIMESTAMPTZ,
    bp.current_value,
    bp.target_value,
    bp.progress_pct
  FROM badge_progress bp
  JOIN badge_definitions bd ON bd.badge_code = bp.badge_code
  WHERE bp.battler_id = p_battler_id
    AND bp.current_value < bp.target_value
    AND NOT bp.is_removal_progress;

END;
$$ LANGUAGE plpgsql;

-- ==========================================================================
-- Summary
-- ==========================================================================
DO $$
DECLARE
  total_definitions INTEGER;
  positive_badges INTEGER;
  negative_badges INTEGER;
  regional_badges INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_definitions FROM badge_definitions;
  SELECT COUNT(*) INTO positive_badges FROM badge_definitions WHERE is_negative = false;
  SELECT COUNT(*) INTO negative_badges FROM badge_definitions WHERE is_negative = true;
  SELECT COUNT(*) INTO regional_badges FROM badge_definitions WHERE is_regional = true;

  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║          BADGE EARNING SYSTEM CREATED ✅                      ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables Created:';
  RAISE NOTICE '  - badge_earned (tracks earned badges)';
  RAISE NOTICE '  - badge_progress (tracks progress toward badges)';
  RAISE NOTICE '  - badge_definitions (master badge list)';
  RAISE NOTICE '';
  RAISE NOTICE 'Badge Definitions Seeded: %', total_definitions;
  RAISE NOTICE '  - Positive Badges: %', positive_badges;
  RAISE NOTICE '  - Negative Badges: %', negative_badges;
  RAISE NOTICE '  - Regional Badges: %', regional_badges;
  RAISE NOTICE '';
  RAISE NOTICE 'Function Created: get_battler_badges(battler_id)';
  RAISE NOTICE '';
END $$;
