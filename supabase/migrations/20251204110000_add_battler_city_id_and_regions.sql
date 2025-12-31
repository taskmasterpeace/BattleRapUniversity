/**
 * Add City ID to Battlers + Region Support
 *
 * 1. Add region column to cities table
 * 2. Add missing cities (Baltimore, Newark, Miami, etc.)
 * 3. Add city_id column to battlers
 * 4. Map each AI battler to their city
 */

-- ========================================
-- 1. ADD REGION COLUMN TO CITIES
-- ========================================
ALTER TABLE cities ADD COLUMN IF NOT EXISTS region TEXT;

COMMENT ON COLUMN cities.region IS 'Geographic region: East Coast, West Coast, Midwest, South, Canada, International';

-- Update existing cities with regions
UPDATE cities SET region = 'East Coast' WHERE name = 'New York City';
UPDATE cities SET region = 'East Coast' WHERE name = 'Philadelphia';
UPDATE cities SET region = 'Midwest' WHERE name = 'Detroit';
UPDATE cities SET region = 'West Coast' WHERE name = 'Los Angeles';
UPDATE cities SET region = 'Midwest' WHERE name = 'Chicago';
UPDATE cities SET region = 'Canada' WHERE name = 'Toronto';
UPDATE cities SET region = 'International' WHERE name = 'London';
UPDATE cities SET region = 'South' WHERE name = 'Atlanta';
UPDATE cities SET region = 'South' WHERE name = 'Houston';
UPDATE cities SET region = 'West Coast' WHERE name = 'Oakland';

-- ========================================
-- 2. ADD MISSING CITIES
-- ========================================

-- East Coast additions
INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Baltimore', 'MD', 'medium', 'aggressive', 'East Coast')
ON CONFLICT (name) DO UPDATE SET region = 'East Coast';

INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Newark', 'NJ', 'small', 'street', 'East Coast')
ON CONFLICT (name) DO UPDATE SET region = 'East Coast';

INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Boston', 'MA', 'small', 'technical', 'East Coast')
ON CONFLICT (name) DO UPDATE SET region = 'East Coast';

INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Yonkers', 'NY', 'small', 'aggressive', 'East Coast')
ON CONFLICT (name) DO UPDATE SET region = 'East Coast';

INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Brooklyn', 'NY', 'medium', 'diverse', 'East Coast')
ON CONFLICT (name) DO UPDATE SET region = 'East Coast';

INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Bronx', 'NY', 'medium', 'street', 'East Coast')
ON CONFLICT (name) DO UPDATE SET region = 'East Coast';

INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Harlem', 'NY', 'medium', 'diverse', 'East Coast')
ON CONFLICT (name) DO UPDATE SET region = 'East Coast';

INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Staten Island', 'NY', 'small', 'technical', 'East Coast')
ON CONFLICT (name) DO UPDATE SET region = 'East Coast';

INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('East Orange', 'NJ', 'small', 'street', 'East Coast')
ON CONFLICT (name) DO UPDATE SET region = 'East Coast';

INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('New Haven', 'CT', 'small', 'street', 'East Coast')
ON CONFLICT (name) DO UPDATE SET region = 'East Coast';

-- South additions
INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Miami', 'FL', 'medium', 'diverse', 'South')
ON CONFLICT (name) DO UPDATE SET region = 'South';

INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Dallas', 'TX', 'medium', 'street', 'South')
ON CONFLICT (name) DO UPDATE SET region = 'South';

INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Memphis', 'TN', 'small', 'street', 'South')
ON CONFLICT (name) DO UPDATE SET region = 'South';

INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Tampa', 'FL', 'small', 'street', 'South')
ON CONFLICT (name) DO UPDATE SET region = 'South';

-- Midwest additions
INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('St. Louis', 'MO', 'medium', 'aggressive', 'Midwest')
ON CONFLICT (name) DO UPDATE SET region = 'Midwest';

INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Pontiac', 'MI', 'small', 'technical', 'Midwest')
ON CONFLICT (name) DO UPDATE SET region = 'Midwest';

-- West Coast additions
INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Compton', 'CA', 'small', 'street', 'West Coast')
ON CONFLICT (name) DO UPDATE SET region = 'West Coast';

INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Watts', 'CA', 'small', 'aggressive', 'West Coast')
ON CONFLICT (name) DO UPDATE SET region = 'West Coast';

INSERT INTO cities (name, state, scene_size, culture_style, region)
VALUES ('Phoenix', 'AZ', 'medium', 'diverse', 'West Coast')
ON CONFLICT (name) DO UPDATE SET region = 'West Coast';

-- ========================================
-- 3. ADD CITY_ID TO BATTLERS
-- ========================================
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id);

COMMENT ON COLUMN battlers.city_id IS 'The city this battler is from';

CREATE INDEX IF NOT EXISTS idx_battlers_city ON battlers(city_id);

-- ========================================
-- 4. MAP AI BATTLERS TO CITIES
-- ========================================

-- God Tier
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Harlem' LIMIT 1) WHERE stage_name = 'The Architect';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Newark' LIMIT 1) WHERE stage_name = 'Tsunami Wave';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Phoenix' LIMIT 1) WHERE stage_name = 'The Nitro Puncher';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Bronx' LIMIT 1) WHERE stage_name = 'The Comedian';

-- Top Tier
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Watts' LIMIT 1) WHERE stage_name = 'Daybreak Lit';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Compton' LIMIT 1) WHERE stage_name = 'Compton Kingpin';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Baltimore' LIMIT 1) WHERE stage_name = 'Baltimore Rocker';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Yonkers' LIMIT 1) WHERE stage_name = 'Hollow Victory';

-- Mid Tier
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Pontiac' LIMIT 1) WHERE stage_name = 'The Titan Scribe';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Boston' LIMIT 1) WHERE stage_name = 'Boston Scheme King';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Bronx' LIMIT 1) WHERE stage_name = 'Freestyle Dynasty';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Harlem' LIMIT 1) WHERE stage_name = 'Money Talk God';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Newark' LIMIT 1) WHERE stage_name = 'Reference Vault';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'St. Louis' LIMIT 1) WHERE stage_name = 'Showtime Holla';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'St. Louis' LIMIT 1) WHERE stage_name = 'Punch Wizard';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Harlem' LIMIT 1) WHERE stage_name = 'Harlem Shiner';

-- Low Tier
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Chicago' LIMIT 1) WHERE stage_name = 'Tru Foe';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Pontiac' LIMIT 1) WHERE stage_name = 'Pontiac Threat';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Newark' LIMIT 1) WHERE stage_name = 'Newark Aggro';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Philadelphia' LIMIT 1) WHERE stage_name = 'Strategy Chess';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Staten Island' LIMIT 1) WHERE stage_name = 'Island Puzzle';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Brooklyn' LIMIT 1) WHERE stage_name = 'Brooklyn Overlooked';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Tampa' LIMIT 1) WHERE stage_name = 'Soldier Tampa';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Detroit' LIMIT 1) WHERE stage_name = 'Professional Prep';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'East Orange' LIMIT 1) WHERE stage_name = 'Veteran Journey';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'New Haven' LIMIT 1) WHERE stage_name = 'Connecticut Grind';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Newark' LIMIT 1) WHERE stage_name = 'Bar Fest Flow';
UPDATE battlers SET city_id = (SELECT id FROM cities WHERE name = 'Philadelphia' LIMIT 1) WHERE stage_name = 'Philly Prospect';

-- ========================================
-- 5. UPDATE REGION FIELD FROM CITY
-- ========================================
-- Set the region text field from the city's region (for backwards compatibility)
UPDATE battlers b
SET region = c.region
FROM cities c
WHERE b.city_id = c.id;

-- ========================================
-- Summary Output
-- ========================================
DO $$
DECLARE
  total_cities INTEGER;
  total_battlers_with_city INTEGER;
  east_count INTEGER;
  west_count INTEGER;
  midwest_count INTEGER;
  south_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_cities FROM cities;
  SELECT COUNT(*) INTO total_battlers_with_city FROM battlers WHERE city_id IS NOT NULL;

  SELECT COUNT(*) INTO east_count FROM battlers b
    JOIN cities c ON b.city_id = c.id WHERE c.region = 'East Coast';
  SELECT COUNT(*) INTO west_count FROM battlers b
    JOIN cities c ON b.city_id = c.id WHERE c.region = 'West Coast';
  SELECT COUNT(*) INTO midwest_count FROM battlers b
    JOIN cities c ON b.city_id = c.id WHERE c.region = 'Midwest';
  SELECT COUNT(*) INTO south_count FROM battlers b
    JOIN cities c ON b.city_id = c.id WHERE c.region = 'South';

  RAISE NOTICE '╔═══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║        BATTLER CITY/REGION SYSTEM UPDATED ✅                  ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'Total Cities: %', total_cities;
  RAISE NOTICE 'Battlers with City ID: %', total_battlers_with_city;
  RAISE NOTICE '';
  RAISE NOTICE 'BATTLERS BY REGION:';
  RAISE NOTICE '  East Coast: % battlers', east_count;
  RAISE NOTICE '  West Coast: % battlers', west_count;
  RAISE NOTICE '  Midwest: % battlers', midwest_count;
  RAISE NOTICE '  South: % battlers', south_count;
  RAISE NOTICE '';
  RAISE NOTICE 'NEW CITIES ADDED:';
  RAISE NOTICE '  East Coast: Baltimore, Newark, Boston, Yonkers, Brooklyn, Bronx, Harlem, Staten Island, East Orange, New Haven';
  RAISE NOTICE '  Midwest: St. Louis, Pontiac';
  RAISE NOTICE '  West Coast: Compton, Watts, Phoenix';
  RAISE NOTICE '  South: Miami, Dallas, Memphis, Tampa';
  RAISE NOTICE '';
  RAISE NOTICE 'FILTER BY REGION NOW AVAILABLE:';
  RAISE NOTICE '  - East Coast (NYC area, NJ, Philly, Boston, Baltimore)';
  RAISE NOTICE '  - West Coast (LA, Oakland, Compton, Phoenix)';
  RAISE NOTICE '  - Midwest (Detroit, Chicago, St. Louis, Pontiac)';
  RAISE NOTICE '  - South (Atlanta, Houston, Tampa, Miami)';
END $$;
