-- ============================================================================
-- Venue & Crowd System
-- Manages battle venues, crowd sizes, and venue-specific effects
-- ============================================================================

-- ==========================================================================
-- Table: venue_types
-- Master list of venue categories (virtual, small, medium, large)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS venue_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('virtual', 'small', 'medium', 'large')),
  description TEXT,

  -- Capacity
  base_capacity INTEGER NOT NULL,
  max_capacity INTEGER NOT NULL,

  -- Gameplay modifiers (1.0 = no change, >1 = boost, <1 = penalty)
  writing_modifier DECIMAL(4,2) DEFAULT 1.00,
  performance_modifier DECIMAL(4,2) DEFAULT 1.00,
  crowd_intensity DECIMAL(4,2) DEFAULT 1.00,  -- How reactive the crowd is

  -- Payout
  base_payout_multiplier DECIMAL(4,2) DEFAULT 1.00,

  -- Visual
  sprite_key TEXT,  -- Reference to sprite asset
  ambient_sound TEXT CHECK (ambient_sound IN ('intimate', 'moderate', 'loud', 'roaring', 'online')),

  -- Flavor
  vibe_description TEXT,  -- "Raw underground energy"

  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE venue_types IS 'Categories of venues (garage, theater, arena, etc.)';

-- Indexes
CREATE INDEX idx_venue_types_tier ON venue_types(tier);
CREATE INDEX idx_venue_types_slug ON venue_types(slug);

-- ==========================================================================
-- Table: venues
-- Specific venue instances tied to cities
-- ==========================================================================
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_type_id UUID NOT NULL REFERENCES venue_types(id),
  city_id UUID REFERENCES cities(id),  -- Optional: generic venues have no city

  name TEXT NOT NULL,  -- "The Bunker" or "Madison Square Garden"

  -- Override defaults from venue_type
  custom_capacity INTEGER,
  custom_sprite_path TEXT,
  custom_writing_modifier DECIMAL(4,2),
  custom_performance_modifier DECIMAL(4,2),

  -- Prestige (affects reputation gain)
  prestige_level INTEGER DEFAULT 1 CHECK (prestige_level BETWEEN 1 AND 5),

  -- League associations
  primary_league_id UUID REFERENCES leagues(id),  -- Some venues are league-specific

  -- Active status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE venues IS 'Specific venue instances (e.g., "The Bunker in NYC")';

-- Indexes
CREATE INDEX idx_venues_type ON venues(venue_type_id);
CREATE INDEX idx_venues_city ON venues(city_id);
CREATE INDEX idx_venues_league ON venues(primary_league_id);

-- ==========================================================================
-- Add venue fields to battles table
-- ==========================================================================
ALTER TABLE battles ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id);
ALTER TABLE battles ADD COLUMN IF NOT EXISTS crowd_size INTEGER;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS crowd_energy_start INTEGER DEFAULT 50;  -- 0-100
ALTER TABLE battles ADD COLUMN IF NOT EXISTS crowd_energy_final INTEGER;  -- 0-100 at end
ALTER TABLE battles ADD COLUMN IF NOT EXISTS crowd_momentum TEXT DEFAULT 'neutral' CHECK (crowd_momentum IN ('battler_a', 'battler_b', 'neutral', 'split'));

-- ==========================================================================
-- Seed venue types
-- ==========================================================================

-- VIRTUAL TIER (Online/Stream)
INSERT INTO venue_types (name, slug, tier, description, base_capacity, max_capacity, writing_modifier, performance_modifier, crowd_intensity, base_payout_multiplier, ambient_sound, vibe_description)
VALUES
  ('Home Studio', 'home-studio', 'virtual',
   'Recording setup for online battles',
   100, 500, 1.00, 0.90, 0.70, 0.50,
   'online', 'Intimate streaming vibes. Chat is the crowd.'),

  ('Podcast Studio', 'podcast-studio', 'virtual',
   'Professional podcast recording space',
   200, 1000, 1.00, 0.95, 0.75, 0.60,
   'online', 'Interview setting. Lower pressure, focused energy.'),

  ('Stream Platform', 'stream-platform', 'virtual',
   'Major streaming platform battle',
   500, 10000, 1.00, 0.95, 0.80, 0.70,
   'online', 'Big stream energy. Chat going crazy.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- SMALL TIER (Underground/Intimate)
INSERT INTO venue_types (name, slug, tier, description, base_capacity, max_capacity, writing_modifier, performance_modifier, crowd_intensity, base_payout_multiplier, ambient_sound, vibe_description)
VALUES
  ('Garage', 'garage', 'small',
   'Raw DIY battle space',
   20, 50, 1.15, 0.90, 1.10, 0.30,
   'intimate', 'Raw underground energy. Every bar lands.'),

  ('Basement', 'basement', 'small',
   'Underground warehouse vibes',
   30, 75, 1.15, 0.85, 1.15, 0.35,
   'intimate', 'True underground. Bars echo off the walls.'),

  ('Barbershop', 'barbershop', 'small',
   'Community gathering spot',
   15, 40, 1.10, 0.90, 1.20, 0.25,
   'intimate', 'Neighborhood energy. Everyone knows everyone.'),

  ('Alley', 'alley', 'small',
   'Street battle location',
   25, 60, 1.10, 0.85, 1.25, 0.20,
   'intimate', 'Raw street energy. Guerrilla battle vibes.'),

  ('Small Bar', 'small-bar', 'small',
   'Local bar with battle space',
   40, 80, 1.10, 0.95, 1.10, 0.40,
   'moderate', 'Drinks flowing. Intimate club energy.'),

  ('Art Gallery', 'art-gallery', 'small',
   'White walls and culture',
   30, 60, 1.15, 0.90, 0.90, 0.45,
   'intimate', 'Artsy crowd. They appreciate the craft.'),

  ('Boxing Gym', 'boxing-gym', 'small',
   'Fighter training facility',
   40, 80, 1.05, 1.05, 1.20, 0.35,
   'moderate', 'Gritty fighter energy. Competitive vibes.'),

  ('Coffee Shop', 'coffee-shop', 'small',
   'Casual cafe cipher',
   20, 40, 1.10, 0.85, 0.85, 0.25,
   'intimate', 'Low-key cipher vibes. Open mic energy.'),

  ('Record Store', 'record-store', 'small',
   'Music lover gathering',
   25, 50, 1.15, 0.90, 1.00, 0.30,
   'intimate', 'Hip-hop heads. They know the culture.'),

  ('Subway Station', 'subway-station', 'small',
   'Underground transit battle',
   50, 100, 1.05, 0.80, 1.15, 0.20,
   'loud', 'Random crowd. Trains interrupting. Chaos energy.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- MEDIUM TIER (Local/Regional)
INSERT INTO venue_types (name, slug, tier, description, base_capacity, max_capacity, writing_modifier, performance_modifier, crowd_intensity, base_payout_multiplier, ambient_sound, vibe_description)
VALUES
  ('Community Center', 'community-center', 'medium',
   'Local community venue',
   100, 300, 1.05, 1.05, 1.00, 0.70,
   'moderate', 'Neighborhood support. Local pride on display.'),

  ('Small Theater', 'small-theater', 'medium',
   'Intimate theater space',
   150, 400, 1.10, 1.10, 1.05, 0.90,
   'moderate', 'Semi-professional setting. Red curtain energy.'),

  ('Gymnasium', 'gymnasium', 'medium',
   'School or rec center gym',
   200, 500, 1.00, 1.10, 1.10, 0.65,
   'loud', 'School assembly vibes. Bleacher crowd.'),

  ('Nightclub', 'nightclub', 'medium',
   'Club venue with stage',
   150, 400, 0.95, 1.15, 1.20, 0.85,
   'loud', 'Party atmosphere. Crowd is hype.'),

  ('Outdoor Park', 'outdoor-park', 'medium',
   'Public park event space',
   200, 600, 1.00, 1.05, 1.00, 0.55,
   'moderate', 'Festival vibes. Open air energy.'),

  ('Restaurant Bar', 'restaurant-bar', 'medium',
   'Upscale bar with stage',
   100, 250, 1.05, 1.05, 0.95, 0.75,
   'moderate', 'Dinner crowd energy. More refined.'),

  ('Church Hall', 'church-hall', 'medium',
   'Community church event space',
   150, 350, 1.10, 1.00, 0.90, 0.60,
   'moderate', 'Respectful crowd. Focused listening.'),

  ('Comedy Club', 'comedy-club', 'medium',
   'Stand-up venue',
   120, 280, 1.00, 1.15, 1.15, 0.80,
   'moderate', 'Entertainment crowd. They want to laugh.'),

  ('Rooftop', 'rooftop', 'medium',
   'City rooftop venue',
   80, 200, 1.05, 1.10, 1.05, 1.00,
   'moderate', 'Exclusive skyline views. VIP energy.'),

  ('Warehouse', 'warehouse', 'medium',
   'Industrial event space',
   250, 600, 1.05, 1.05, 1.15, 0.70,
   'loud', 'Underground but bigger. Echo chamber.'),

  ('Amphitheater', 'amphitheater', 'medium',
   'Outdoor tiered seating',
   300, 800, 1.05, 1.15, 1.10, 0.90,
   'moderate', 'Greek theater energy. Natural acoustics.'),

  ('Barn', 'barn', 'medium',
   'Rural event venue',
   150, 350, 1.05, 1.00, 1.10, 0.55,
   'moderate', 'Country vibes. Different energy entirely.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- LARGE TIER (Main Stage/Major)
INSERT INTO venue_types (name, slug, tier, description, base_capacity, max_capacity, writing_modifier, performance_modifier, crowd_intensity, base_payout_multiplier, ambient_sound, vibe_description)
VALUES
  ('Grand Theater', 'grand-theater', 'large',
   'Prestigious ornate theater',
   800, 2000, 1.00, 1.20, 1.15, 2.00,
   'roaring', 'Prestigious venue. History on these walls.'),

  ('Boxing Arena', 'boxing-arena', 'large',
   'Fight venue with ring setup',
   1000, 3000, 0.95, 1.25, 1.30, 2.50,
   'roaring', 'Fight night energy. Blood sport vibes.'),

  ('Basketball Arena', 'basketball-arena', 'large',
   'Full sports arena',
   2000, 5000, 0.90, 1.30, 1.25, 3.00,
   'roaring', 'Stadium energy. Sports crowd hype.'),

  ('Concert Hall', 'concert-hall', 'large',
   'Professional music venue',
   1500, 4000, 0.95, 1.25, 1.20, 2.50,
   'roaring', 'Industry venue. Major label energy.'),

  ('Convention Center', 'convention-center', 'large',
   'Large event space',
   1000, 3000, 1.00, 1.15, 1.10, 1.80,
   'loud', 'Corporate event vibes. Big screens everywhere.'),

  ('Shipping Container Venue', 'container-venue', 'large',
   'Industrial URL-style venue',
   500, 1500, 1.05, 1.20, 1.35, 2.00,
   'roaring', 'URL energy. Packed crowd. Intimate but major.'),

  ('VIP Nightclub', 'vip-nightclub', 'large',
   'Exclusive club venue',
   400, 1000, 0.95, 1.25, 1.25, 2.20,
   'loud', 'Money in the building. VIP everything.'),

  ('Ballroom', 'ballroom', 'large',
   'Elegant event hall',
   600, 1500, 1.05, 1.15, 1.00, 1.90,
   'moderate', 'High society venue. Chandeliers and class.'),

  ('Festival Stage', 'festival-stage', 'large',
   'Outdoor festival main stage',
   2000, 10000, 0.85, 1.35, 1.30, 3.50,
   'roaring', 'Festival main stage. Maximum exposure.'),

  ('Modern Atrium', 'modern-atrium', 'large',
   'Corporate glass venue',
   800, 2000, 1.00, 1.15, 1.05, 2.00,
   'moderate', 'Tech money venue. Modern architecture.'),

  ('Outdoor Arena', 'outdoor-arena', 'large',
   'Open-air large venue',
   3000, 8000, 0.85, 1.30, 1.25, 3.00,
   'roaring', 'Under the stars. Epic battles only.'),

  ('Historic Venue', 'historic-venue', 'large',
   'Legendary battle location',
   1000, 2500, 1.05, 1.20, 1.20, 2.50,
   'roaring', 'Legends battled here. History on these walls.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ==========================================================================
-- Function: Calculate crowd size for a battle
-- ==========================================================================
CREATE OR REPLACE FUNCTION calculate_crowd_size(
  p_venue_id UUID,
  p_battler_a_rating INTEGER,
  p_battler_b_rating INTEGER,
  p_is_grudge_match BOOLEAN DEFAULT false,
  p_tournament_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_venue RECORD;
  v_venue_type RECORD;
  v_base_capacity INTEGER;
  v_avg_rating INTEGER;
  v_rating_multiplier DECIMAL;
  v_grudge_multiplier DECIMAL;
  v_tournament_multiplier DECIMAL;
  v_final_crowd INTEGER;
BEGIN
  -- Get venue and type
  SELECT v.*, vt.*
  INTO v_venue
  FROM venues v
  JOIN venue_types vt ON vt.id = v.venue_type_id
  WHERE v.id = p_venue_id;

  IF v_venue IS NULL THEN
    RETURN 100;  -- Default crowd
  END IF;

  -- Base capacity (custom or type default)
  v_base_capacity := COALESCE(v_venue.custom_capacity, v_venue.base_capacity);

  -- Rating draw (higher rated battles draw more)
  v_avg_rating := (p_battler_a_rating + p_battler_b_rating) / 2;
  v_rating_multiplier := 0.5 + (v_avg_rating::decimal / 2000);  -- 0.5x to 1.5x

  -- Grudge match bonus (+30%)
  v_grudge_multiplier := CASE WHEN p_is_grudge_match THEN 1.3 ELSE 1.0 END;

  -- Tournament bonus (+50%)
  v_tournament_multiplier := CASE WHEN p_tournament_id IS NOT NULL THEN 1.5 ELSE 1.0 END;

  -- Calculate final crowd
  v_final_crowd := (v_base_capacity * v_rating_multiplier * v_grudge_multiplier * v_tournament_multiplier)::INTEGER;

  -- Cap at venue max
  RETURN LEAST(v_final_crowd, v_venue.max_capacity);
END;
$$ LANGUAGE plpgsql;

-- ==========================================================================
-- Function: Get venue modifiers for battle simulation
-- ==========================================================================
CREATE OR REPLACE FUNCTION get_venue_modifiers(p_venue_id UUID)
RETURNS TABLE (
  venue_name TEXT,
  venue_tier TEXT,
  writing_mod DECIMAL,
  performance_mod DECIMAL,
  crowd_intensity DECIMAL,
  payout_multiplier DECIMAL,
  ambient_sound TEXT,
  vibe TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vt.name,
    vt.tier,
    COALESCE(v.custom_writing_modifier, vt.writing_modifier),
    COALESCE(v.custom_performance_modifier, vt.performance_modifier),
    vt.crowd_intensity,
    vt.base_payout_multiplier,
    vt.ambient_sound,
    vt.vibe_description
  FROM venues v
  JOIN venue_types vt ON vt.id = v.venue_type_id
  WHERE v.id = p_venue_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================================================
-- Function: Assign venue based on ratings and league
-- ==========================================================================
CREATE OR REPLACE FUNCTION assign_battle_venue(
  p_avg_rating INTEGER,
  p_league_id UUID,
  p_city_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_tier TEXT;
  v_venue_id UUID;
BEGIN
  -- Determine appropriate tier based on rating
  v_tier := CASE
    WHEN p_avg_rating < 1000 THEN 'small'
    WHEN p_avg_rating < 1200 THEN 'small'
    WHEN p_avg_rating < 1400 THEN 'medium'
    WHEN p_avg_rating < 1600 THEN 'medium'
    WHEN p_avg_rating < 1800 THEN 'large'
    ELSE 'large'
  END;

  -- Try to find venue in specified city first
  IF p_city_id IS NOT NULL THEN
    SELECT v.id INTO v_venue_id
    FROM venues v
    JOIN venue_types vt ON vt.id = v.venue_type_id
    WHERE v.city_id = p_city_id
      AND vt.tier = v_tier
      AND v.is_active = true
      AND (v.primary_league_id IS NULL OR v.primary_league_id = p_league_id)
    ORDER BY RANDOM()
    LIMIT 1;

    IF v_venue_id IS NOT NULL THEN
      RETURN v_venue_id;
    END IF;
  END IF;

  -- Fall back to any venue of appropriate tier
  SELECT v.id INTO v_venue_id
  FROM venues v
  JOIN venue_types vt ON vt.id = v.venue_type_id
  WHERE vt.tier = v_tier
    AND v.is_active = true
    AND (v.primary_league_id IS NULL OR v.primary_league_id = p_league_id)
  ORDER BY RANDOM()
  LIMIT 1;

  RETURN v_venue_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================================================
-- Seed some default venues (not city-specific)
-- ==========================================================================
INSERT INTO venues (venue_type_id, name, prestige_level)
SELECT
  vt.id,
  vt.name || ' (Default)',
  CASE vt.tier
    WHEN 'virtual' THEN 1
    WHEN 'small' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'large' THEN 4
  END
FROM venue_types vt
ON CONFLICT DO NOTHING;

-- ==========================================================================
-- Summary
-- ==========================================================================
DO $$
DECLARE
  total_venue_types INTEGER;
  virtual_count INTEGER;
  small_count INTEGER;
  medium_count INTEGER;
  large_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_venue_types FROM venue_types;
  SELECT COUNT(*) INTO virtual_count FROM venue_types WHERE tier = 'virtual';
  SELECT COUNT(*) INTO small_count FROM venue_types WHERE tier = 'small';
  SELECT COUNT(*) INTO medium_count FROM venue_types WHERE tier = 'medium';
  SELECT COUNT(*) INTO large_count FROM venue_types WHERE tier = 'large';

  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║            VENUE & CROWD SYSTEM CREATED ✅                    ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables Created:';
  RAISE NOTICE '  - venue_types (venue categories)';
  RAISE NOTICE '  - venues (specific venue instances)';
  RAISE NOTICE '';
  RAISE NOTICE 'Battle Table Updated:';
  RAISE NOTICE '  - Added venue_id, crowd_size, crowd_energy columns';
  RAISE NOTICE '';
  RAISE NOTICE 'Venue Types Seeded: %', total_venue_types;
  RAISE NOTICE '  - Virtual: % (online/stream)', virtual_count;
  RAISE NOTICE '  - Small: % (underground/intimate)', small_count;
  RAISE NOTICE '  - Medium: % (local/regional)', medium_count;
  RAISE NOTICE '  - Large: % (main stage/major)', large_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Functions Created:';
  RAISE NOTICE '  - calculate_crowd_size(venue, ratings, grudge, tournament)';
  RAISE NOTICE '  - get_venue_modifiers(venue_id)';
  RAISE NOTICE '  - assign_battle_venue(rating, league, city)';
  RAISE NOTICE '';
END $$;
