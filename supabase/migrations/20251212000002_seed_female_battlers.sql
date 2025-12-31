-- Seed Female AI Battlers + RON-RON
-- 5 female battlers across tiers + 1 street authentic male battler

-- =====================================================
-- TOP TIER: QUEEN VENOM
-- =====================================================

INSERT INTO battlers (
  id, stage_name, city_id, region, tier, is_ai,
  style_tags, gender, race
) VALUES (
  gen_random_uuid(),
  'Queen Venom',
  (SELECT id FROM cities WHERE name = 'Harlem' LIMIT 1),
  'East Coast',
  'top',
  true,
  '["Angles", "Personals", "Aggressive", "Performance"]'::jsonb,
  'female',
  'black'
);

-- =====================================================
-- MID TIER: MS. CALCULATE, BROOKLYN BADDIE
-- =====================================================

INSERT INTO battlers (
  id, stage_name, city_id, region, tier, is_ai,
  style_tags, gender, race
) VALUES
(
  gen_random_uuid(),
  'Ms. Calculate',
  (SELECT id FROM cities WHERE name = 'Detroit' LIMIT 1),
  'Midwest',
  'mid',
  true,
  '["Schemes", "Technical", "Wordplay", "Setups"]'::jsonb,
  'female',
  'black'
),
(
  gen_random_uuid(),
  'Brooklyn Baddie',
  (SELECT id FROM cities WHERE name = 'Brooklyn' LIMIT 1),
  'East Coast',
  'mid',
  true,
  '["Street", "Aggressive", "Personals", "Energy"]'::jsonb,
  'female',
  'black'
);

-- =====================================================
-- LOW TIER: YA GIRL SHAWANDA, HOE CARD
-- =====================================================

INSERT INTO battlers (
  id, stage_name, city_id, region, tier, is_ai,
  style_tags, gender, race
) VALUES
(
  gen_random_uuid(),
  'Ya Girl Shawanda',
  (SELECT id FROM cities WHERE name = 'Atlanta' LIMIT 1),
  'South',
  'low',
  true,
  '["Comedy", "Crowd Control", "Entertainment", "Personals"]'::jsonb,
  'female',
  'black'
),
(
  gen_random_uuid(),
  'Hoe Card',
  (SELECT id FROM cities WHERE name = 'Houston' LIMIT 1),
  'South',
  'low',
  true,
  '["Angles", "Personals", "Comedy", "Raw"]'::jsonb,
  'female',
  'black'
);

-- =====================================================
-- STREET AUTHENTIC MALE: RON-RON
-- =====================================================

INSERT INTO battlers (
  id, stage_name, city_id, region, tier, is_ai,
  style_tags, gender, race
) VALUES (
  gen_random_uuid(),
  'RON-RON',
  (SELECT id FROM cities WHERE name = 'Baltimore' LIMIT 1),
  'East Coast',
  'mid',
  true,
  '["Street", "Authenticity", "Aggressive", "Raw", "Personals"]'::jsonb,
  'male',
  'black'
);

-- =====================================================
-- RANKINGS
-- =====================================================

-- Queen Venom - Top tier (1700-1850)
INSERT INTO rankings (battler_id, rating, wins, losses)
SELECT id, 1750, 18, 4
FROM battlers WHERE stage_name = 'Queen Venom'
ON CONFLICT (battler_id) DO NOTHING;

-- Ms. Calculate - Mid tier (1350-1500)
INSERT INTO rankings (battler_id, rating, wins, losses)
SELECT id, 1420, 12, 6
FROM battlers WHERE stage_name = 'Ms. Calculate'
ON CONFLICT (battler_id) DO NOTHING;

-- Brooklyn Baddie - Mid tier (1300-1450)
INSERT INTO rankings (battler_id, rating, wins, losses)
SELECT id, 1380, 10, 7
FROM battlers WHERE stage_name = 'Brooklyn Baddie'
ON CONFLICT (battler_id) DO NOTHING;

-- Ya Girl Shawanda - Low tier (950-1100)
INSERT INTO rankings (battler_id, rating, wins, losses)
SELECT id, 1020, 5, 6
FROM battlers WHERE stage_name = 'Ya Girl Shawanda'
ON CONFLICT (battler_id) DO NOTHING;

-- Hoe Card - Low tier (900-1050)
INSERT INTO rankings (battler_id, rating, wins, losses)
SELECT id, 980, 4, 5
FROM battlers WHERE stage_name = 'Hoe Card'
ON CONFLICT (battler_id) DO NOTHING;

-- RON-RON - Mid tier (1300-1450)
INSERT INTO rankings (battler_id, rating, wins, losses)
SELECT id, 1350, 11, 8
FROM battlers WHERE stage_name = 'RON-RON'
ON CONFLICT (battler_id) DO NOTHING;

-- =====================================================
-- ATTRIBUTES
-- =====================================================

-- Queen Venom - Top tier attributes
INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
SELECT id,
  '{"lyricism": 8, "wordplay": 7, "creativity": 7, "flow": 8}'::jsonb,
  '{"stage_presence": 9, "crowd_control": 8, "delivery": 8}'::jsonb,
  '{"financial": 6, "reputation": 8, "family": 5, "resilience": 7, "stress": 35}'::jsonb,
  7
FROM battlers WHERE stage_name = 'Queen Venom'
ON CONFLICT (battler_id) DO NOTHING;

-- Ms. Calculate - Technical mid tier
INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
SELECT id,
  '{"lyricism": 7, "wordplay": 8, "creativity": 6, "flow": 6}'::jsonb,
  '{"stage_presence": 5, "crowd_control": 5, "delivery": 6}'::jsonb,
  '{"financial": 4, "reputation": 5, "family": 6, "resilience": 5, "stress": 45}'::jsonb,
  5
FROM battlers WHERE stage_name = 'Ms. Calculate'
ON CONFLICT (battler_id) DO NOTHING;

-- Brooklyn Baddie - Performance mid tier
INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
SELECT id,
  '{"lyricism": 5, "wordplay": 5, "creativity": 6, "flow": 7}'::jsonb,
  '{"stage_presence": 7, "crowd_control": 7, "delivery": 7}'::jsonb,
  '{"financial": 4, "reputation": 6, "family": 5, "resilience": 6, "stress": 40}'::jsonb,
  6
FROM battlers WHERE stage_name = 'Brooklyn Baddie'
ON CONFLICT (battler_id) DO NOTHING;

-- Ya Girl Shawanda - Comedy low tier
INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
SELECT id,
  '{"lyricism": 4, "wordplay": 4, "creativity": 6, "flow": 5}'::jsonb,
  '{"stage_presence": 6, "crowd_control": 7, "delivery": 5}'::jsonb,
  '{"financial": 3, "reputation": 4, "family": 7, "resilience": 4, "stress": 50}'::jsonb,
  4
FROM battlers WHERE stage_name = 'Ya Girl Shawanda'
ON CONFLICT (battler_id) DO NOTHING;

-- Hoe Card - Raw low tier
INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
SELECT id,
  '{"lyricism": 4, "wordplay": 3, "creativity": 5, "flow": 5}'::jsonb,
  '{"stage_presence": 5, "crowd_control": 5, "delivery": 5}'::jsonb,
  '{"financial": 2, "reputation": 3, "family": 4, "resilience": 5, "stress": 55}'::jsonb,
  5
FROM battlers WHERE stage_name = 'Hoe Card'
ON CONFLICT (battler_id) DO NOTHING;

-- RON-RON - Street authentic mid tier
INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
SELECT id,
  '{"lyricism": 5, "wordplay": 4, "creativity": 5, "flow": 6}'::jsonb,
  '{"stage_presence": 7, "crowd_control": 6, "delivery": 7}'::jsonb,
  '{"financial": 3, "reputation": 7, "family": 4, "resilience": 8, "stress": 35}'::jsonb,
  8
FROM battlers WHERE stage_name = 'RON-RON'
ON CONFLICT (battler_id) DO NOTHING;

-- =====================================================
-- UPDATE EXISTING AI BATTLERS WITH DEMOGRAPHICS
-- =====================================================

-- Set existing AI battlers to male (default)
UPDATE battlers
SET gender = 'male'
WHERE is_ai = true AND gender IS NULL;

-- Set race based on typical demographics
UPDATE battlers
SET race = 'black'
WHERE is_ai = true AND race IS NULL;
