/**
 * Add Legendary Battler Profiles
 *
 * Creates 6 AI battlers based on real battle rap legends with altered names.
 * These serve as placeholder opponents for testing and gameplay.
 */

-- Ron Gritty (based on Rum Nitty) - Punchline King
DO $$
DECLARE
  ron_id UUID;
  small_room_id UUID;
  main_stage_id UUID;
BEGIN
  -- Get league IDs
  SELECT id INTO small_room_id FROM leagues WHERE name = 'Small Room Circuit';
  SELECT id INTO main_stage_id FROM leagues WHERE name = 'Main Stage Arena';

  -- Create Ron Gritty
  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Ron Gritty', main_stage_id, true, 'top')
  RETURNING id INTO ron_id;

  -- Attributes
  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    ron_id,
    '{"lyricism": 9, "wordplay": 10, "creativity": 8, "flow": 7}'::jsonb,
    '{"stage_presence": 6, "crowd_control": 7, "delivery": 9}'::jsonb,
    '{"financial_stability": 7, "reputation": 9, "family_bond": 6, "preparation": 8}'::jsonb,
    8
  );

  -- Ranking
  INSERT INTO rankings (battler_id, rating)
  VALUES (ron_id, 1850);

  -- Public Info
  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    ron_id,
    'reputation_event',
    'The Punchline Assassin',
    'Known for relentless gun bars and technical wordplay that leaves opponents shattered.',
    'positive'
  );
END $$;

-- Coded Flux (based on Loaded Lux) - Lyrical Mastermind
DO $$
DECLARE
  coded_id UUID;
  small_room_id UUID;
BEGIN
  SELECT id INTO small_room_id FROM leagues WHERE name = 'Small Room Circuit';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Coded Flux', small_room_id, true, 'god')
  RETURNING id INTO coded_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    coded_id,
    '{"lyricism": 10, "wordplay": 10, "creativity": 10, "flow": 8}'::jsonb,
    '{"stage_presence": 9, "crowd_control": 8, "delivery": 9}'::jsonb,
    '{"financial_stability": 8, "reputation": 10, "family_bond": 7, "preparation": 9}'::jsonb,
    7
  );

  INSERT INTO rankings (battler_id, rating)
  VALUES (coded_id, 1900);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    coded_id,
    'reputation_event',
    'The Architect',
    'A lyrical mastermind who constructs intricate schemes and metaphors that transcend the battle.',
    'positive'
  );
END $$;

-- Hallow The Dawn (based on Hollow Da Don) - All-Rounder
DO $$
DECLARE
  hallow_id UUID;
  main_stage_id UUID;
BEGIN
  SELECT id INTO main_stage_id FROM leagues WHERE name = 'Main Stage Arena';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Hallow The Dawn', main_stage_id, true, 'top')
  RETURNING id INTO hallow_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    hallow_id,
    '{"lyricism": 8, "wordplay": 9, "creativity": 9, "flow": 9}'::jsonb,
    '{"stage_presence": 10, "crowd_control": 10, "delivery": 9}'::jsonb,
    '{"financial_stability": 7, "reputation": 9, "family_bond": 6, "preparation": 7}'::jsonb,
    9
  );

  INSERT INTO rankings (battler_id, rating)
  VALUES (hallow_id, 1875);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    hallow_id,
    'reputation_event',
    'The Versatile Veteran',
    'Adapts to any opponent with surgical precision, combining humor, aggression, and raw skill.',
    'positive'
  );
END $$;

-- Ray Rock (based on Tay Roc) - Performance Powerhouse
DO $$
DECLARE
  ray_id UUID;
  main_stage_id UUID;
BEGIN
  SELECT id INTO main_stage_id FROM leagues WHERE name = 'Main Stage Arena';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Ray Rock', main_stage_id, true, 'top')
  RETURNING id INTO ray_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    ray_id,
    '{"lyricism": 7, "wordplay": 7, "creativity": 7, "flow": 8}'::jsonb,
    '{"stage_presence": 10, "crowd_control": 10, "delivery": 10}'::jsonb,
    '{"financial_stability": 8, "reputation": 9, "family_bond": 7, "preparation": 6}'::jsonb,
    9
  );

  INSERT INTO rankings (battler_id, rating)
  VALUES (ray_id, 1825);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    ray_id,
    'reputation_event',
    'The Energy Machine',
    'Brings unmatched stage presence and aggressive delivery that overwhelms opponents.',
    'positive'
  );
END $$;

-- Beachie Knotty (based on Geechi Gotti) - Storyteller
DO $$
DECLARE
  beachie_id UUID;
  small_room_id UUID;
BEGIN
  SELECT id INTO small_room_id FROM leagues WHERE name = 'Small Room Circuit';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Beachie Knotty', small_room_id, true, 'top')
  RETURNING id INTO beachie_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    beachie_id,
    '{"lyricism": 8, "wordplay": 7, "creativity": 8, "flow": 9}'::jsonb,
    '{"stage_presence": 9, "crowd_control": 9, "delivery": 9}'::jsonb,
    '{"financial_stability": 7, "reputation": 9, "family_bond": 8, "preparation": 7}'::jsonb,
    8
  );

  INSERT INTO rankings (battler_id, rating)
  VALUES (beachie_id, 1840);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    beachie_id,
    'reputation_event',
    'The Street Philosopher',
    'Combines authentic storytelling with calculated angles that cut deep.',
    'positive'
  );
END $$;

-- Verb Alliance (based on Charlie Clips/Conceited) - Rebuttal Specialist
DO $$
DECLARE
  verb_id UUID;
  main_stage_id UUID;
BEGIN
  SELECT id INTO main_stage_id FROM leagues WHERE name = 'Main Stage Arena';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Verb Alliance', main_stage_id, true, 'top')
  RETURNING id INTO verb_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    verb_id,
    '{"lyricism": 8, "wordplay": 8, "creativity": 9, "flow": 8}'::jsonb,
    '{"stage_presence": 8, "crowd_control": 9, "delivery": 8}'::jsonb,
    '{"financial_stability": 6, "reputation": 8, "family_bond": 7, "preparation": 9}'::jsonb,
    10
  );

  INSERT INTO rankings (battler_id, rating)
  VALUES (verb_id, 1810);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    verb_id,
    'reputation_event',
    'The Rebuttal Specialist',
    'Known for devastating rebuttals and the ability to flip any angle back on opponents.',
    'positive'
  );
END $$;

-- Summary output
DO $$
BEGIN
  RAISE NOTICE '╔═══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║           LEGENDARY BATTLERS CREATED ✅                       ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '6 Legendary AI Battlers Added:';
  RAISE NOTICE '  1. Ron Gritty (1850) - Punchline King';
  RAISE NOTICE '  2. Coded Flux (1900) - Lyrical Mastermind';
  RAISE NOTICE '  3. Hallow The Dawn (1875) - All-Rounder';
  RAISE NOTICE '  4. Ray Rock (1825) - Performance Powerhouse';
  RAISE NOTICE '  5. Beachie Knotty (1840) - Storyteller';
  RAISE NOTICE '  6. Verb Alliance (1810) - Rebuttal Specialist';
  RAISE NOTICE '';
  RAISE NOTICE 'Average Rating: 1850';
  RAISE NOTICE 'These battlers are ready for testing and gameplay!';
END $$;
