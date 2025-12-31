-- League Booking System Migration
-- Adds: Events, Cards, Battle Pairings, Exclusivity Contracts, League Economics

-- =====================================================
-- 1. LEAGUE ECONOMICS - Add budget and capacity fields
-- =====================================================

-- League tier for economic calculations
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS league_tier TEXT
  CHECK (league_tier IN ('virtual', 'underground', 'regional', 'national', 'premier'))
  DEFAULT 'regional';

-- Budget per card (how much they can spend on a single event)
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS budget_per_card INTEGER DEFAULT 15000;

-- Max cards per month (1-4 depending on tier)
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS cards_per_month INTEGER DEFAULT 2
  CHECK (cards_per_month BETWEEN 1 AND 4);

-- Max battles per card (virtual=1-3, underground=3-4, regional=4-5, national/premier=5-6)
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS max_battles_per_card INTEGER DEFAULT 5
  CHECK (max_battles_per_card BETWEEN 1 AND 6);

-- Style preference weights (how much they value each style when booking)
-- e.g., {"aggressive": 1.2, "technical": 0.8, "comedy": 1.0, "street": 1.5}
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS style_weights JSONB DEFAULT '{
  "aggressive": 1.0,
  "technical": 1.0,
  "comedy": 1.0,
  "street": 1.0,
  "performance": 1.0,
  "lyrical": 1.0
}'::jsonb;

-- Regional preference (battlers from this region get booking bonus)
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS regional_preference TEXT;

-- Minimum prep days required before battle
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS min_prep_days INTEGER DEFAULT 7;

-- Current budget remaining this month
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS monthly_budget_remaining INTEGER;

-- Month the budget was last reset
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS budget_month DATE;

-- =====================================================
-- 2. EVENTS/CARDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,

  -- Event details
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,

  -- Scheduling
  scheduled_date DATE NOT NULL,
  doors_time TIME,
  start_time TIME,

  -- Venue (optional - some events are virtual)
  venue_id UUID,
  venue_name TEXT,
  city TEXT,
  state TEXT,

  -- Budget
  total_budget INTEGER NOT NULL,
  budget_spent INTEGER DEFAULT 0,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning', 'booking', 'announced', 'locked', 'live', 'completed', 'cancelled')),

  -- Media
  flyer_url TEXT,
  flyer_generated_at TIMESTAMPTZ,
  stream_url TEXT,
  vod_url TEXT,

  -- Stats (populated after event)
  total_views INTEGER DEFAULT 0,
  peak_concurrent_viewers INTEGER DEFAULT 0,

  -- Timestamps
  announced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_league ON events(league_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_scheduled ON events(scheduled_date);
CREATE INDEX idx_events_slug ON events(slug);

-- =====================================================
-- 3. EVENT BATTLES - Links battles to events with card position
-- =====================================================

CREATE TABLE IF NOT EXISTS event_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,

  -- Card positioning
  card_position TEXT NOT NULL
    CHECK (card_position IN ('main_event', 'co_main', 'featured', 'undercard', 'opener')),
  position_order INTEGER NOT NULL, -- 1 = main event, 2 = co-main, etc.

  -- Budget allocation for this slot
  allocated_budget INTEGER NOT NULL,

  -- Battler slots (before battle is created)
  battler_a_id UUID REFERENCES battlers(id),
  battler_b_id UUID REFERENCES battlers(id),

  -- Booking status
  booking_status TEXT NOT NULL DEFAULT 'open'
    CHECK (booking_status IN ('open', 'partial', 'booked', 'confirmed', 'cancelled')),

  -- Timestamps
  booked_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(event_id, position_order)
);

CREATE INDEX idx_event_battles_event ON event_battles(event_id);
CREATE INDEX idx_event_battles_battle ON event_battles(battle_id);

-- =====================================================
-- 4. BATTLE PAIRINGS - Track history between any two battlers
-- =====================================================

CREATE TABLE IF NOT EXISTS battle_pairings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Always store with lower UUID first to ensure uniqueness
  battler_a_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  battler_b_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- Battle count
  total_battles INTEGER NOT NULL DEFAULT 0,

  -- Last battle info
  last_battle_id UUID REFERENCES battles(id),
  last_battle_date DATE,
  last_winner_id UUID REFERENCES battlers(id),
  last_verdict TEXT, -- '3-0', '2-1', 'debatable'
  last_decision_type TEXT, -- 'clear', 'close', 'controversial'

  -- Sequel eligibility
  sequel_eligible_date DATE, -- When they can rematch
  sequel_reason TEXT, -- Why sequel is/isn't allowed

  -- Rivalry tracking
  rivalry_intensity INTEGER DEFAULT 0 CHECK (rivalry_intensity BETWEEN 0 AND 100),
  rivalry_origin TEXT,

  -- Head to head record
  battler_a_wins INTEGER DEFAULT 0,
  battler_b_wins INTEGER DEFAULT 0,

  -- Fan interest (affects sequel demand)
  fan_demand_score INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure battler_a_id < battler_b_id for consistent ordering
  CONSTRAINT battler_order CHECK (battler_a_id < battler_b_id),
  UNIQUE(battler_a_id, battler_b_id)
);

CREATE INDEX idx_battle_pairings_a ON battle_pairings(battler_a_id);
CREATE INDEX idx_battle_pairings_b ON battle_pairings(battler_b_id);
CREATE INDEX idx_battle_pairings_last_battle ON battle_pairings(last_battle_date);

-- =====================================================
-- 5. BATTLER CONTRACTS - Exclusivity deals
-- =====================================================

CREATE TABLE IF NOT EXISTS battler_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,

  -- Contract type
  exclusivity_type TEXT NOT NULL
    CHECK (exclusivity_type IN ('full', 'primary', 'guest', 'none')),
  -- full = can ONLY battle on this league
  -- primary = this league gets first pick, can guest elsewhere with permission
  -- guest = occasional appearances only
  -- none = standard booking, no commitment

  -- Terms
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_value INTEGER, -- Guaranteed pay per month
  battles_guaranteed INTEGER, -- Min battles per contract period

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  terminated_early BOOLEAN DEFAULT FALSE,
  termination_reason TEXT,

  -- Timestamps
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  terminated_at TIMESTAMPTZ,

  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_contracts_battler ON battler_contracts(battler_id);
CREATE INDEX idx_contracts_league ON battler_contracts(league_id);
CREATE INDEX idx_contracts_active ON battler_contracts(is_active) WHERE is_active = TRUE;

-- =====================================================
-- 6. BATTLER BOOKING INFO - Add fields to battlers
-- =====================================================

-- Base booking fee (what they charge per battle)
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS base_booking_fee INTEGER DEFAULT 500;

-- Rest days required between battles
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS rest_days_required INTEGER DEFAULT 7;

-- Last battle date (for availability checking)
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS last_battle_date DATE;

-- Next available date
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS available_from DATE;

-- Booking status
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS booking_status TEXT DEFAULT 'available'
  CHECK (booking_status IN ('available', 'booked', 'resting', 'injured', 'retired', 'suspended'));

-- Popularity score (affects booking fee and demand)
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 50
  CHECK (popularity_score BETWEEN 0 AND 100);

-- =====================================================
-- 7. UPDATE BATTLES TABLE - Add event reference
-- =====================================================

ALTER TABLE battles ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id);
ALTER TABLE battles ADD COLUMN IF NOT EXISTS card_position TEXT;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS player_payout INTEGER;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS opponent_payout INTEGER;

CREATE INDEX IF NOT EXISTS idx_battles_event ON battles(event_id);

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Function to get or create battle pairing (ensures consistent ordering)
CREATE OR REPLACE FUNCTION get_or_create_battle_pairing(
  p_battler_1 UUID,
  p_battler_2 UUID
) RETURNS UUID AS $$
DECLARE
  v_battler_a UUID;
  v_battler_b UUID;
  v_pairing_id UUID;
BEGIN
  -- Ensure consistent ordering
  IF p_battler_1 < p_battler_2 THEN
    v_battler_a := p_battler_1;
    v_battler_b := p_battler_2;
  ELSE
    v_battler_a := p_battler_2;
    v_battler_b := p_battler_1;
  END IF;

  -- Try to find existing pairing
  SELECT id INTO v_pairing_id
  FROM battle_pairings
  WHERE battler_a_id = v_battler_a AND battler_b_id = v_battler_b;

  -- Create if not exists
  IF v_pairing_id IS NULL THEN
    INSERT INTO battle_pairings (battler_a_id, battler_b_id)
    VALUES (v_battler_a, v_battler_b)
    RETURNING id INTO v_pairing_id;
  END IF;

  RETURN v_pairing_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if sequel is allowed
CREATE OR REPLACE FUNCTION is_sequel_allowed(
  p_battler_1 UUID,
  p_battler_2 UUID,
  p_check_date DATE DEFAULT CURRENT_DATE
) RETURNS JSONB AS $$
DECLARE
  v_pairing battle_pairings%ROWTYPE;
  v_battler_a UUID;
  v_battler_b UUID;
BEGIN
  -- Ensure consistent ordering
  IF p_battler_1 < p_battler_2 THEN
    v_battler_a := p_battler_1;
    v_battler_b := p_battler_2;
  ELSE
    v_battler_a := p_battler_2;
    v_battler_b := p_battler_1;
  END IF;

  -- Get pairing
  SELECT * INTO v_pairing
  FROM battle_pairings
  WHERE battler_a_id = v_battler_a AND battler_b_id = v_battler_b;

  -- Never battled = allowed
  IF v_pairing IS NULL OR v_pairing.total_battles = 0 THEN
    RETURN jsonb_build_object(
      'allowed', TRUE,
      'is_sequel', FALSE,
      'reason', 'First meeting'
    );
  END IF;

  -- Check if enough time has passed
  IF v_pairing.sequel_eligible_date IS NOT NULL AND p_check_date >= v_pairing.sequel_eligible_date THEN
    RETURN jsonb_build_object(
      'allowed', TRUE,
      'is_sequel', TRUE,
      'sequel_number', v_pairing.total_battles + 1,
      'reason', v_pairing.sequel_reason
    );
  END IF;

  -- Check special conditions
  -- High rivalry (80+) = 90 day cooldown
  IF v_pairing.rivalry_intensity >= 80 AND
     v_pairing.last_battle_date + INTERVAL '90 days' <= p_check_date THEN
    RETURN jsonb_build_object(
      'allowed', TRUE,
      'is_sequel', TRUE,
      'sequel_number', v_pairing.total_battles + 1,
      'reason', 'High rivalry intensity demands resolution'
    );
  END IF;

  -- Debatable decision = 180 day cooldown
  IF v_pairing.last_decision_type = 'controversial' AND
     v_pairing.last_battle_date + INTERVAL '180 days' <= p_check_date THEN
    RETURN jsonb_build_object(
      'allowed', TRUE,
      'is_sequel', TRUE,
      'sequel_number', v_pairing.total_battles + 1,
      'reason', 'Controversial first battle warrants rematch'
    );
  END IF;

  -- High fan demand = override cooldown
  IF v_pairing.fan_demand_score >= 80 THEN
    RETURN jsonb_build_object(
      'allowed', TRUE,
      'is_sequel', TRUE,
      'sequel_number', v_pairing.total_battles + 1,
      'reason', 'Fan demand for rematch'
    );
  END IF;

  -- Default: 365 day cooldown
  IF v_pairing.last_battle_date + INTERVAL '365 days' <= p_check_date THEN
    RETURN jsonb_build_object(
      'allowed', TRUE,
      'is_sequel', TRUE,
      'sequel_number', v_pairing.total_battles + 1,
      'reason', 'Standard cooldown period passed'
    );
  END IF;

  -- Not allowed yet
  RETURN jsonb_build_object(
    'allowed', FALSE,
    'is_sequel', TRUE,
    'days_until_eligible', (v_pairing.last_battle_date + INTERVAL '365 days' - p_check_date)::INTEGER,
    'reason', 'Cooldown period not yet complete'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update battle pairing after a battle
CREATE OR REPLACE FUNCTION update_battle_pairing_after_battle()
RETURNS TRIGGER AS $$
DECLARE
  v_battler_a UUID;
  v_battler_b UUID;
  v_winner_is_a BOOLEAN;
BEGIN
  -- Only run when battle is completed
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Ensure consistent ordering
  IF NEW.battler_player_id < NEW.battler_ai_id THEN
    v_battler_a := NEW.battler_player_id;
    v_battler_b := NEW.battler_ai_id;
    v_winner_is_a := NEW.winner_battler_id = NEW.battler_player_id;
  ELSE
    v_battler_a := NEW.battler_ai_id;
    v_battler_b := NEW.battler_player_id;
    v_winner_is_a := NEW.winner_battler_id = NEW.battler_ai_id;
  END IF;

  -- Update or create pairing
  INSERT INTO battle_pairings (
    battler_a_id, battler_b_id, total_battles, last_battle_id,
    last_battle_date, last_winner_id, battler_a_wins, battler_b_wins,
    sequel_eligible_date
  )
  VALUES (
    v_battler_a, v_battler_b, 1, NEW.id,
    NEW.scheduled_at::DATE, NEW.winner_battler_id,
    CASE WHEN v_winner_is_a THEN 1 ELSE 0 END,
    CASE WHEN v_winner_is_a THEN 0 ELSE 1 END,
    (NEW.scheduled_at + INTERVAL '365 days')::DATE
  )
  ON CONFLICT (battler_a_id, battler_b_id)
  DO UPDATE SET
    total_battles = battle_pairings.total_battles + 1,
    last_battle_id = NEW.id,
    last_battle_date = NEW.scheduled_at::DATE,
    last_winner_id = NEW.winner_battler_id,
    battler_a_wins = battle_pairings.battler_a_wins + CASE WHEN v_winner_is_a THEN 1 ELSE 0 END,
    battler_b_wins = battle_pairings.battler_b_wins + CASE WHEN v_winner_is_a THEN 0 ELSE 1 END,
    sequel_eligible_date = (NEW.scheduled_at + INTERVAL '365 days')::DATE,
    updated_at = NOW();

  -- Update battler last_battle_date
  UPDATE battlers SET last_battle_date = NEW.scheduled_at::DATE
  WHERE id IN (NEW.battler_player_id, NEW.battler_ai_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_update_battle_pairing ON battles;
CREATE TRIGGER trg_update_battle_pairing
  AFTER UPDATE ON battles
  FOR EACH ROW
  EXECUTE FUNCTION update_battle_pairing_after_battle();

-- =====================================================
-- 9. ROW LEVEL SECURITY
-- =====================================================

-- Events: readable by all
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (TRUE);

-- Event battles: readable by all
ALTER TABLE event_battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read event battles" ON event_battles FOR SELECT USING (TRUE);

-- Battle pairings: readable by all
ALTER TABLE battle_pairings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read battle pairings" ON battle_pairings FOR SELECT USING (TRUE);

-- Contracts: readable by all (transparency)
ALTER TABLE battler_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read contracts" ON battler_contracts FOR SELECT USING (TRUE);

-- =====================================================
-- 10. UPDATE EXISTING LEAGUES WITH DEFAULT VALUES
-- =====================================================

-- Set league tiers and budgets based on existing prestige_level
UPDATE leagues SET
  league_tier = CASE
    WHEN prestige_level >= 9 THEN 'premier'
    WHEN prestige_level >= 7 THEN 'national'
    WHEN prestige_level >= 5 THEN 'regional'
    WHEN prestige_level >= 3 THEN 'underground'
    ELSE 'virtual'
  END,
  budget_per_card = CASE
    WHEN prestige_level >= 9 THEN 150000
    WHEN prestige_level >= 7 THEN 60000
    WHEN prestige_level >= 5 THEN 20000
    WHEN prestige_level >= 3 THEN 5000
    ELSE 1000
  END,
  cards_per_month = CASE
    WHEN prestige_level >= 9 THEN 1
    WHEN prestige_level >= 7 THEN 2
    WHEN prestige_level >= 5 THEN 2
    WHEN prestige_level >= 3 THEN 2
    ELSE 4
  END,
  max_battles_per_card = CASE
    WHEN prestige_level >= 9 THEN 6
    WHEN prestige_level >= 7 THEN 5
    WHEN prestige_level >= 5 THEN 5
    WHEN prestige_level >= 3 THEN 4
    ELSE 2
  END,
  min_prep_days = CASE
    WHEN prestige_level >= 9 THEN 21
    WHEN prestige_level >= 7 THEN 14
    WHEN prestige_level >= 5 THEN 10
    WHEN prestige_level >= 3 THEN 7
    ELSE 3
  END
WHERE league_tier IS NULL OR budget_per_card IS NULL;

-- =====================================================
-- 11. UPDATE BATTLERS WITH DEFAULT BOOKING FEES
-- =====================================================

UPDATE battlers SET
  base_booking_fee = CASE tier
    WHEN 'god' THEN 20000
    WHEN 'top' THEN 8000
    WHEN 'mid' THEN 2500
    WHEN 'low' THEN 800
    ELSE 500
  END,
  rest_days_required = 7,
  booking_status = 'available'
WHERE base_booking_fee IS NULL OR base_booking_fee = 500;
