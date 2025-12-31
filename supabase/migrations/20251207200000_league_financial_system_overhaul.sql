-- League Financial System & Game Foundation Overhaul
-- Transform from static mock data to real database-driven leagues

-- =====================================================
-- 1. ADD MISSING COLUMNS TO LEAGUES TABLE
-- =====================================================

-- Visual/branding fields
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#f97316';
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#1c1917';
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS logo_id TEXT;

-- Location fields
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS region TEXT;

-- Active state (critical for controlling playtesting)
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Financial tracking (revenue side - costs already exist)
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS monthly_revenue INTEGER DEFAULT 0;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS youtube_subscribers INTEGER DEFAULT 0;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS youtube_monthly_views INTEGER DEFAULT 0;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS platform_subscribers INTEGER DEFAULT 0;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS ppv_enabled BOOLEAN DEFAULT false;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS sponsor_revenue INTEGER DEFAULT 0;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS founded_year INTEGER;

-- Crowd reaction weight (if missing)
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS crowd_reaction_weight NUMERIC DEFAULT 0.2;

-- Add unique constraint on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_leagues_slug ON leagues(slug) WHERE slug IS NOT NULL;

-- =====================================================
-- 2. RENAME & RECONFIGURE STARTING LEAGUES
-- Both leagues now in New York for hometown advantage
-- =====================================================

-- Update "Small Room Circuit" (SRC) → "Algorithm Institute Battle League" (ALG)
UPDATE leagues SET
  name = 'Algorithm Institute Battle League',
  short_code = 'ALG',
  display_name = 'Algorithm Institute Battle League',
  slug = 'algorithm-institute',
  tagline = 'The Thinking Man''s League',
  description = 'Where technical lyricism reigns supreme. Intricate schemes, dense wordplay, and elevated pen game define this league. The crowd here analyzes every bar.',
  city = 'New York',
  state = 'NY',
  region = 'Northeast',
  primary_color = '#a855f7',
  secondary_color = '#3b0764',
  logo_id = 'league_alg',
  is_active = true,
  league_tier = 'regional',
  round_length_minutes = 2,
  base_crowd_factor = 0.85,
  writing_weight = 0.60,
  performance_weight = 0.20,
  crowd_reaction_weight = 0.20,
  personality_style = 'technical',
  prestige_level = 6,
  base_payout = 2500,
  audience_favor_lyricism = 90,
  audience_favor_delivery = 40,
  audience_favor_storytelling = 70,
  audience_favor_crowd_engagement = 30,
  budget_per_card = 25000,
  cards_per_month = 2,
  max_battles_per_card = 5,
  min_prep_days = 10,
  founded_year = 2018,
  youtube_subscribers = 45000,
  youtube_monthly_views = 250000,
  platform_subscribers = 500,
  ppv_enabled = false,
  sponsor_revenue = 2500
WHERE short_code = 'SRC';

-- Update "Main Stage Arena" (MSA) → "G.U.N. Battle League" (GUN)
UPDATE leagues SET
  name = 'G.U.N. Battle League',
  short_code = 'GUN',
  display_name = 'G.U.N. Battle League',
  slug = 'gun-battle-league',
  tagline = 'Aim. Fire. Body.',
  description = 'Where careers are made or broken. High-energy battles with aggressive delivery and crowd control. The audience wants blood.',
  city = 'New York',
  state = 'NY',
  region = 'Northeast',
  primary_color = '#22c55e',
  secondary_color = '#1c1917',
  logo_id = 'league_gun',
  is_active = true,
  league_tier = 'regional',
  round_length_minutes = 3,
  base_crowd_factor = 1.15,
  writing_weight = 0.40,
  performance_weight = 0.35,
  crowd_reaction_weight = 0.25,
  personality_style = 'aggressive',
  prestige_level = 6,
  base_payout = 3000,
  audience_favor_lyricism = 50,
  audience_favor_delivery = 85,
  audience_favor_storytelling = 40,
  audience_favor_crowd_engagement = 80,
  budget_per_card = 30000,
  cards_per_month = 2,
  max_battles_per_card = 5,
  min_prep_days = 10,
  founded_year = 2016,
  youtube_subscribers = 85000,
  youtube_monthly_views = 500000,
  platform_subscribers = 0,
  ppv_enabled = false,
  sponsor_revenue = 5000
WHERE short_code = 'MSA';

-- =====================================================
-- 3. ADD CONTRACT OFFERS TABLE (for pending offers)
-- battler_contracts is for active contracts
-- contract_offers is for pending offers
-- =====================================================

CREATE TABLE IF NOT EXISTS contract_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,

  -- Offer details
  exclusivity_type TEXT NOT NULL
    CHECK (exclusivity_type IN ('full', 'primary', 'guest', 'none'))
    DEFAULT 'none',
  monthly_value INTEGER,
  battles_guaranteed INTEGER,
  contract_duration_months INTEGER DEFAULT 12,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'countered')),

  -- AI recommendation (for hybrid mode)
  ai_recommendation TEXT CHECK (ai_recommendation IN ('accept', 'decline', 'counter')),
  ai_reasoning TEXT,

  -- Timestamps
  offered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Resulting contract (if accepted)
  resulting_contract_id UUID REFERENCES battler_contracts(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contract_offers_battler ON contract_offers(battler_id);
CREATE INDEX IF NOT EXISTS idx_contract_offers_league ON contract_offers(league_id);
CREATE INDEX IF NOT EXISTS idx_contract_offers_status ON contract_offers(status);

-- RLS for contract offers
ALTER TABLE contract_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read contract offers" ON contract_offers FOR SELECT USING (TRUE);

-- =====================================================
-- 4. BATTLER EARNINGS - Already exists from payment system
-- Just ensure any missing columns are added
-- =====================================================

-- Add league_id to battler_earnings if missing
ALTER TABLE battler_earnings ADD COLUMN IF NOT EXISTS league_id UUID REFERENCES leagues(id);

-- Ensure RLS is enabled
ALTER TABLE battler_earnings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read earnings" ON battler_earnings;
CREATE POLICY "Anyone can read earnings" ON battler_earnings FOR SELECT USING (TRUE);

-- =====================================================
-- 5. ADD HOMETOWN/ORIGIN FIELDS TO BATTLERS (if missing)
-- =====================================================

ALTER TABLE battlers ADD COLUMN IF NOT EXISTS hometown_city TEXT;
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS hometown_state TEXT;
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS is_hometown_public BOOLEAN DEFAULT true;

-- =====================================================
-- 6. ADD is_active TO BLOGGERS TABLE
-- =====================================================

ALTER TABLE bloggers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =====================================================
-- 7. HELPER FUNCTION: Calculate hometown crowd bias
-- =====================================================

CREATE OR REPLACE FUNCTION get_hometown_crowd_bias(
  p_battler_id UUID,
  p_league_id UUID
) RETURNS NUMERIC AS $$
DECLARE
  v_battler_city TEXT;
  v_battler_state TEXT;
  v_league_city TEXT;
  v_league_state TEXT;
  v_has_hometown_badge BOOLEAN;
BEGIN
  -- Get battler hometown
  SELECT hometown_city, hometown_state
  INTO v_battler_city, v_battler_state
  FROM battlers WHERE id = p_battler_id;

  -- Get league location
  SELECT city, state
  INTO v_league_city, v_league_state
  FROM leagues WHERE id = p_league_id;

  -- Check for hometown badge (amplifies effect)
  SELECT EXISTS(
    SELECT 1 FROM battler_badges bb
    JOIN badges b ON bb.badge_id = b.id
    WHERE bb.battler_id = p_battler_id
    AND b.name ILIKE '%hometown%'
  ) INTO v_has_hometown_badge;

  -- Calculate bias
  IF v_battler_city IS NOT NULL AND v_battler_city = v_league_city THEN
    -- Same city = 15% boost (20% with badge)
    RETURN CASE WHEN v_has_hometown_badge THEN 1.20 ELSE 1.15 END;
  ELSIF v_battler_state IS NOT NULL AND v_battler_state = v_league_state THEN
    -- Same state = 8% boost (12% with badge)
    RETURN CASE WHEN v_has_hometown_badge THEN 1.12 ELSE 1.08 END;
  ELSE
    -- Out of town = no bonus (potential 5% penalty in rival cities - future)
    RETURN 1.0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. HELPER FUNCTION: Calculate travel cost
-- =====================================================

CREATE OR REPLACE FUNCTION get_travel_cost(
  p_battler_id UUID,
  p_event_city TEXT,
  p_event_state TEXT
) RETURNS INTEGER AS $$
DECLARE
  v_battler_city TEXT;
  v_battler_state TEXT;
BEGIN
  SELECT hometown_city, hometown_state
  INTO v_battler_city, v_battler_state
  FROM battlers WHERE id = p_battler_id;

  -- Same city = no travel
  IF v_battler_city = p_event_city THEN
    RETURN 0;
  -- Same state = short travel
  ELSIF v_battler_state = p_event_state THEN
    RETURN 150;
  -- Cross-country = full travel
  ELSE
    RETURN 400;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. VIEW: League with dynamic battler counts
-- =====================================================

CREATE OR REPLACE VIEW league_summary AS
SELECT
  l.id,
  l.name,
  l.short_code,
  l.display_name,
  l.slug,
  l.tagline,
  l.description,
  l.city,
  l.state,
  l.region,
  l.primary_color,
  l.secondary_color,
  l.logo_url,
  l.logo_id,
  l.is_active,
  l.league_tier,
  l.round_length_minutes,
  l.base_crowd_factor,
  l.writing_weight,
  l.performance_weight,
  l.crowd_reaction_weight,
  l.personality_style,
  l.prestige_level,
  l.base_payout,
  l.audience_favor_lyricism,
  l.audience_favor_delivery,
  l.audience_favor_storytelling,
  l.audience_favor_crowd_engagement,
  l.budget_per_card,
  l.cards_per_month,
  l.max_battles_per_card,
  l.min_prep_days,
  l.monthly_revenue,
  l.youtube_subscribers,
  l.youtube_monthly_views,
  l.platform_subscribers,
  l.ppv_enabled,
  l.sponsor_revenue,
  l.founded_year,
  l.created_at,
  -- Dynamic counts
  COUNT(DISTINCT b.id) FILTER (WHERE b.booking_status = 'available' OR b.booking_status IS NULL) as active_battler_count,
  COUNT(DISTINCT b.id) as total_battler_count,
  COUNT(DISTINCT bt.id) FILTER (WHERE bt.status = 'completed') as total_battles,
  COALESCE(AVG(r.rating) FILTER (WHERE b.booking_status = 'available' OR b.booking_status IS NULL), 1200)::INTEGER as avg_rating
FROM leagues l
LEFT JOIN battlers b ON b.primary_league_id = l.id
LEFT JOIN rankings r ON r.battler_id = b.id
LEFT JOIN battles bt ON bt.league_id = l.id
GROUP BY l.id;

-- Grant access to view
GRANT SELECT ON league_summary TO anon, authenticated;

COMMENT ON VIEW league_summary IS 'Leagues with real-time battler counts and stats calculated from database';

-- =====================================================
-- 10. UPDATE EXISTING BATTLERS WITH NYC HOMETOWNS
-- Since both leagues are in NYC, set most battlers to NYC
-- =====================================================

-- Set NYC for battlers in ALG (formerly SRC)
UPDATE battlers SET
  hometown_city = 'New York',
  hometown_state = 'NY'
WHERE primary_league_id = (SELECT id FROM leagues WHERE short_code = 'ALG')
  AND hometown_city IS NULL;

-- Set NYC for battlers in GUN (formerly MSA)
UPDATE battlers SET
  hometown_city = 'New York',
  hometown_state = 'NY'
WHERE primary_league_id = (SELECT id FROM leagues WHERE short_code = 'GUN')
  AND hometown_city IS NULL;

-- =====================================================
-- 11. MARK MOST BATTLERS AS INACTIVE
-- Keep only 8-10 active per league for playtesting
-- =====================================================

-- First, mark all AI battlers as 'retired' (inactive)
UPDATE battlers SET
  booking_status = 'retired'
WHERE is_ai = true;

-- Then, reactivate top 8-10 battlers per league based on tier and rating
-- For ALG league
WITH alg_top_battlers AS (
  SELECT b.id
  FROM battlers b
  JOIN rankings r ON r.battler_id = b.id
  WHERE b.primary_league_id = (SELECT id FROM leagues WHERE short_code = 'ALG')
    AND b.is_ai = true
  ORDER BY
    CASE b.tier
      WHEN 'god' THEN 4
      WHEN 'top' THEN 3
      WHEN 'mid' THEN 2
      WHEN 'low' THEN 1
    END DESC,
    r.rating DESC
  LIMIT 10
)
UPDATE battlers SET booking_status = 'available'
WHERE id IN (SELECT id FROM alg_top_battlers);

-- For GUN league
WITH gun_top_battlers AS (
  SELECT b.id
  FROM battlers b
  JOIN rankings r ON r.battler_id = b.id
  WHERE b.primary_league_id = (SELECT id FROM leagues WHERE short_code = 'GUN')
    AND b.is_ai = true
  ORDER BY
    CASE b.tier
      WHEN 'god' THEN 4
      WHEN 'top' THEN 3
      WHEN 'mid' THEN 2
      WHEN 'low' THEN 1
    END DESC,
    r.rating DESC
  LIMIT 10
)
UPDATE battlers SET booking_status = 'available'
WHERE id IN (SELECT id FROM gun_top_battlers);

-- Player battlers always available
UPDATE battlers SET booking_status = 'available'
WHERE is_ai = false;

-- =====================================================
-- 12. ADD INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_battlers_booking_status ON battlers(booking_status);
CREATE INDEX IF NOT EXISTS idx_battlers_hometown ON battlers(hometown_city, hometown_state);
CREATE INDEX IF NOT EXISTS idx_leagues_is_active ON leagues(is_active);
CREATE INDEX IF NOT EXISTS idx_leagues_city_state ON leagues(city, state);

-- =====================================================
-- 13. COMMENTS
-- =====================================================

COMMENT ON COLUMN leagues.is_active IS 'Only active leagues appear in game. Used to control playtesting scope.';
COMMENT ON COLUMN leagues.city IS 'League headquarters city for hometown crowd bias calculations';
COMMENT ON COLUMN leagues.monthly_revenue IS 'Total monthly revenue from all sources (YouTube, subs, PPV, sponsors)';
COMMENT ON COLUMN battlers.booking_status IS 'available = can battle, retired = inactive for playtesting, booked/resting = temporarily unavailable';
COMMENT ON TABLE contract_offers IS 'Pending contract offers. When accepted, creates entry in battler_contracts.';
