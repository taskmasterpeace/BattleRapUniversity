-- ============================================================================
-- Time, Economy, and Cities System
-- Week-based calendar, battle scheduling, deposits, city/league system
-- ============================================================================

-- ==========================================================================
-- Table: cities (Battle rap cities)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  state TEXT,
  country TEXT DEFAULT 'USA',

  -- City characteristics
  scene_size TEXT CHECK (scene_size IN ('small', 'medium', 'large', 'major')) DEFAULT 'medium',
  culture_style TEXT CHECK (culture_style IN ('technical', 'aggressive', 'diverse', 'street')) DEFAULT 'diverse',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE cities IS 'Battle rap cities (NYC, Philly, Detroit, LA, etc.)';

CREATE INDEX idx_cities_name ON cities(name);

-- Seed major battle rap cities
INSERT INTO cities (name, state, scene_size, culture_style)
VALUES
  ('New York City', 'NY', 'major', 'diverse'),
  ('Philadelphia', 'PA', 'large', 'aggressive'),
  ('Detroit', 'MI', 'large', 'technical'),
  ('Los Angeles', 'CA', 'major', 'diverse'),
  ('Chicago', 'IL', 'large', 'aggressive'),
  ('Toronto', 'ON', 'large', 'technical'),
  ('London', 'UK', 'large', 'technical'),
  ('Atlanta', 'GA', 'medium', 'street'),
  ('Houston', 'TX', 'medium', 'aggressive'),
  ('Oakland', 'CA', 'medium', 'street')
ON CONFLICT (name) DO NOTHING;

-- ==========================================================================
-- Update leagues table with city association
-- ==========================================================================
ALTER TABLE leagues
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id),
ADD COLUMN IF NOT EXISTS requires_deposit BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS deposit_percentage DECIMAL(3,2) DEFAULT 0.40 CHECK (deposit_percentage >= 0 AND deposit_percentage <= 1),
ADD COLUMN IF NOT EXISTS tolerance_unreliable INTEGER DEFAULT 2 CHECK (tolerance_unreliable >= 0 AND tolerance_unreliable <= 10),
ADD COLUMN IF NOT EXISTS blacklist_threshold INTEGER DEFAULT 3;

COMMENT ON COLUMN leagues.city_id IS 'Which city this league is based in';
COMMENT ON COLUMN leagues.deposit_percentage IS 'Percentage of payout given as deposit (0.40 = 40%)';
COMMENT ON COLUMN leagues.tolerance_unreliable IS '1-10 how tolerant of no-shows (Twork scenario: high talent can overcome)';
COMMENT ON COLUMN leagues.blacklist_threshold IS 'Number of no-shows before blacklist';

-- Associate existing leagues with cities
UPDATE leagues SET city_id = (SELECT id FROM cities WHERE name = 'New York City' LIMIT 1) WHERE short_code = 'SMALL_ROOM';
UPDATE leagues SET city_id = (SELECT id FROM cities WHERE name = 'Los Angeles' LIMIT 1) WHERE short_code = 'MAIN_STAGE';

-- ==========================================================================
-- Table: league_blacklists (Per-league blacklist tracking)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS league_blacklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  reason TEXT NOT NULL,
  blacklisted_week INTEGER NOT NULL,

  is_permanent BOOLEAN DEFAULT false,
  can_return_week INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(league_id, battler_id)
);

COMMENT ON TABLE league_blacklists IS 'Per-league blacklisting (Math Hoffa: 3-year ban, Twork: high talent overcomes)';

CREATE INDEX idx_league_blacklists_league ON league_blacklists(league_id);
CREATE INDEX idx_league_blacklists_battler ON league_blacklists(battler_id);

-- ==========================================================================
-- Table: battle_schedule (Week-based battle scheduling)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS battle_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,

  -- Timeline
  week_announced INTEGER NOT NULL,
  week_prep_start INTEGER NOT NULL,
  week_prep_end INTEGER NOT NULL,
  week_live_event INTEGER NOT NULL,
  week_public_release INTEGER,

  -- Event Type
  is_ppv BOOLEAN DEFAULT false,
  is_streamed_live BOOLEAN DEFAULT false,

  -- Audience Reactions (can differ)
  live_audience_verdict TEXT,
  live_crowd_reaction INTEGER,

  camera_audience_verdict TEXT,
  online_views INTEGER DEFAULT 0,
  online_reaction_score INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE battle_schedule IS 'Week-based battle scheduling: announced → prep → live → release';
COMMENT ON COLUMN battle_schedule.is_ppv IS 'If TRUE, public knows immediately. If FALSE, 4-8 week delay';
COMMENT ON COLUMN battle_schedule.live_audience_verdict IS 'In-building verdict (can differ from camera)';

CREATE INDEX idx_battle_schedule_battle ON battle_schedule(battle_id);
CREATE INDEX idx_battle_schedule_live_week ON battle_schedule(week_live_event);
CREATE INDEX idx_battle_schedule_release_week ON battle_schedule(week_public_release);

-- ==========================================================================
-- Table: battle_deposits (Deposit tracking)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS battle_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- Deposit Details
  deposit_amount INTEGER NOT NULL,
  remaining_payout INTEGER NOT NULL,

  deposit_paid_week INTEGER,
  deposit_paid BOOLEAN DEFAULT false,

  -- Theft/Issues
  deposit_stolen BOOLEAN DEFAULT false,
  deposit_stolen_week INTEGER,

  final_payout_paid BOOLEAN DEFAULT false,
  final_payout_week INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE battle_deposits IS 'Deposit tracking (Geechi steals deposits, Chess/Twork no-shows)';
COMMENT ON COLUMN battle_deposits.deposit_stolen IS 'TRUE if battler took deposit and didn''t show up';

CREATE INDEX idx_battle_deposits_battle ON battle_deposits(battle_id);
CREATE INDEX idx_battle_deposits_battler ON battle_deposits(battler_id);

-- ==========================================================================
-- Table: battler_financial_history (Cash flow tracking)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS battler_financial_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  week INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'deposit_received', 'final_payout', 'deposit_stolen',
    'fine_paid', 'expense', 'side_income', 'debt_payment'
  )),

  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,

  description TEXT,
  related_battle_id UUID REFERENCES battles(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE battler_financial_history IS 'Complete financial transaction history per battler';

CREATE INDEX idx_financial_history_battler ON battler_financial_history(battler_id);
CREATE INDEX idx_financial_history_week ON battler_financial_history(week);

-- ==========================================================================
-- Table: public_knowledge (What the culture knows vs insider knowledge)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  knowledge_type TEXT NOT NULL CHECK (knowledge_type IN (
    'battle_result', 'scandal', 'event', 'secret_revealed', 'beef'
  )),

  related_battler_id UUID REFERENCES battlers(id) ON DELETE CASCADE,
  related_battle_id UUID REFERENCES battles(id),
  related_event_code TEXT,

  week_became_public INTEGER NOT NULL,
  publicity_level TEXT NOT NULL CHECK (publicity_level IN (
    'insider_only', 'culture_knows', 'mainstream_public'
  )) DEFAULT 'culture_knows',

  title TEXT NOT NULL,
  description TEXT,

  media_coverage_level INTEGER DEFAULT 5 CHECK (media_coverage_level >= 0 AND media_coverage_level <= 10),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public_knowledge IS 'Tracks what is publicly known vs insider knowledge';
COMMENT ON COLUMN public_knowledge.publicity_level IS 'insider_only (few know), culture_knows (battle rap fans), mainstream_public (TMZ level)';

CREATE INDEX idx_public_knowledge_battler ON public_knowledge(related_battler_id);
CREATE INDEX idx_public_knowledge_week ON public_knowledge(week_became_public);
CREATE INDEX idx_public_knowledge_type ON public_knowledge(knowledge_type);

-- ==========================================================================
-- Add financial tracking to battlers
-- ==========================================================================
ALTER TABLE battlers
ADD COLUMN IF NOT EXISTS current_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_career_earnings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS debt_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS no_show_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_battles_count INTEGER DEFAULT 0;

COMMENT ON COLUMN battlers.current_balance IS 'Current cash on hand';
COMMENT ON COLUMN battlers.total_career_earnings IS 'Lifetime earnings from battles';
COMMENT ON COLUMN battlers.no_show_count IS 'Number of no-shows (affects reputation and booking)';
COMMENT ON COLUMN battlers.completed_battles_count IS 'Number of battles actually completed';

-- ==========================================================================
-- Update battles table with deposit tracking
-- ==========================================================================
ALTER TABLE battles
ADD COLUMN IF NOT EXISTS deposit_amount_a INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_amount_b INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_paid_a BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_paid_b BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_required BOOLEAN DEFAULT true;

COMMENT ON COLUMN battles.deposit_required IS 'If FALSE, league doesn''t require deposits (rare)';

-- ==========================================================================
-- Seed example battle schedule for testing
-- ==========================================================================
-- (Will be created when battles are scheduled, this is just structure)

-- ==========================================================================
-- Helper function: Calculate deposit amount
-- ==========================================================================
CREATE OR REPLACE FUNCTION calculate_deposit_amount(
  base_payout INTEGER,
  battler_rating INTEGER,
  deposit_percentage DECIMAL
) RETURNS INTEGER AS $$
BEGIN
  -- Calculate total payout based on rating
  DECLARE
    rating_multiplier DECIMAL := GREATEST(0.5, LEAST(2.0, battler_rating / 1200.0));
    total_payout INTEGER := FLOOR(base_payout * rating_multiplier);
    deposit INTEGER := FLOOR(total_payout * deposit_percentage);
  BEGIN
    RETURN deposit;
  END;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_deposit_amount IS 'Calculate deposit: base_payout * (rating/1200) * deposit_percentage';

-- ==========================================================================
-- Helper function: Check if battler is blacklisted from league
-- ==========================================================================
CREATE OR REPLACE FUNCTION is_blacklisted_from_league(
  p_battler_id UUID,
  p_league_id UUID,
  current_week INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  blacklist_record RECORD;
BEGIN
  SELECT * INTO blacklist_record
  FROM league_blacklists
  WHERE battler_id = p_battler_id
    AND league_id = p_league_id
  LIMIT 1;

  IF blacklist_record IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if permanent
  IF blacklist_record.is_permanent THEN
    RETURN TRUE;
  END IF;

  -- Check if can return yet
  IF blacklist_record.can_return_week IS NOT NULL AND current_week >= blacklist_record.can_return_week THEN
    -- Blacklist expired, remove it
    DELETE FROM league_blacklists WHERE id = blacklist_record.id;
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_blacklisted_from_league IS 'Check if battler is currently blacklisted from a league';
