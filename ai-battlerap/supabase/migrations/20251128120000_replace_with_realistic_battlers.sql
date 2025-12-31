/**
 * Replace Generic AI Battlers with Realistic Battle Rap Profiles
 *
 * DELETES: Generic placeholder battlers (Angle Master, Clever Scheme, etc.)
 * CREATES: 28 realistic AI battlers based on actual battle rap legends
 *
 * Tier Distribution:
 * - God Tier (1800-1900): 7 battlers
 * - Top Tier (1600-1799): 13 battlers
 * - Mid Tier (1400-1599): 4 battlers
 * - Low Tier (1100-1399): 4 battlers
 */

-- ========================================
-- STEP 1: Delete Old Generic Battlers
-- ========================================

DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete generic AI battlers (but keep the 6 legendary ones we just created)
  DELETE FROM battlers
  WHERE is_ai = true
  AND stage_name NOT IN (
    'Ron Gritty',
    'Coded Flux',
    'Hallow The Dawn',
    'Ray Rock',
    'Beachie Knotty',
    'Verb Alliance'
  );

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RAISE NOTICE '🗑️  Deleted % generic AI battlers', deleted_count;
END $$;

-- ========================================
-- GOD TIER BATTLERS (1800-1900)
-- ========================================

-- 1. Surf Tsu (Tsu Surf) - The Wave
DO $$
DECLARE
  battler_id UUID;
  main_stage_id UUID;
BEGIN
  SELECT id INTO main_stage_id FROM leagues WHERE name = 'Main Stage Arena';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Surf Tsu', main_stage_id, true, 'god')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 8, "wordplay": 8, "creativity": 8, "flow": 9}'::jsonb,
    '{"stage_presence": 10, "crowd_control": 10, "delivery": 10}'::jsonb,
    '{"financial_stability": 6, "reputation": 9, "family_bond": 7, "preparation": 7}'::jsonb,
    7
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1850);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The Jersey Wave',
    'Chain-punching creates unstoppable momentum. When in AMG Mode, makes opponents seem irrelevant.',
    'positive'
  );
END $$;

-- 2. Day Lit (Daylyt) - The Creative Troll
DO $$
DECLARE
  battler_id UUID;
  small_room_id UUID;
BEGIN
  SELECT id INTO small_room_id FROM leagues WHERE name = 'Small Room Circuit';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Day Lit', small_room_id, true, 'god')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 9, "wordplay": 10, "creativity": 10, "flow": 8}'::jsonb,
    '{"stage_presence": 8, "crowd_control": 7, "delivery": 8}'::jsonb,
    '{"financial_stability": 7, "reputation": 9, "family_bond": 6, "preparation": 6}'::jsonb,
    6
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1800);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The Creative Troll',
    'Ruthless creativity meets absurdist humor. Elite pen game hidden behind outrageous antics.',
    'positive'
  );
END $$;

-- ========================================
-- TOP TIER BATTLERS (1600-1799)
-- ========================================

-- 3. JC the Titan - The Wizard
DO $$
DECLARE
  battler_id UUID;
  small_room_id UUID;
BEGIN
  SELECT id INTO small_room_id FROM leagues WHERE name = 'Small Room Circuit';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('JC the Titan', small_room_id, true, 'top')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 9, "wordplay": 10, "creativity": 9, "flow": 8}'::jsonb,
    '{"stage_presence": 6, "crowd_control": 6, "delivery": 7}'::jsonb,
    '{"financial_stability": 7, "reputation": 8, "family_bond": 7, "preparation": 9}'::jsonb,
    8
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1725);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The Pen Titan',
    'Top 3 writer in battle rap. Genius-level rhymes and setups. Performance cannot match elite pen game.',
    'positive'
  );
END $$;

-- 4. Jones Chilla (Chilla Jones) - The Scheme Master
DO $$
DECLARE
  battler_id UUID;
  small_room_id UUID;
BEGIN
  SELECT id INTO small_room_id FROM leagues WHERE name = 'Small Room Circuit';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Jones Chilla', small_room_id, true, 'top')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 9, "wordplay": 9, "creativity": 10, "flow": 7}'::jsonb,
    '{"stage_presence": 7, "crowd_control": 7, "delivery": 7}'::jsonb,
    '{"financial_stability": 8, "reputation": 8, "family_bond": 8, "preparation": 9}'::jsonb,
    8
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1700);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The Boston Kingpen',
    'Pioneered modern scheming. Most consistent, hardest working battler. Disguises schemes with elaborate wordplay.',
    'positive'
  );
END $$;

-- 5. DNA the Don (DNA) - The Freestyler
DO $$
DECLARE
  battler_id UUID;
  main_stage_id UUID;
BEGIN
  SELECT id INTO main_stage_id FROM leagues WHERE name = 'Main Stage Arena';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('DNA the Don', main_stage_id, true, 'top')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 7, "wordplay": 8, "creativity": 8, "flow": 9}'::jsonb,
    '{"stage_presence": 9, "crowd_control": 9, "delivery": 9}'::jsonb,
    '{"financial_stability": 8, "reputation": 9, "family_bond": 7, "preparation": 7}'::jsonb,
    8
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1700);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The Freestyle King',
    'Best freestyler in the world. Most viewed battler in history (95M+ views). Pristine angles and rebuttals.',
    'positive'
  );
END $$;

-- 6. Goodz the Animal (Goodz) - Slick Talk God
DO $$
DECLARE
  battler_id UUID;
  main_stage_id UUID;
BEGIN
  SELECT id INTO main_stage_id FROM leagues WHERE name = 'Main Stage Arena';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Goodz the Animal', main_stage_id, true, 'top')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 7, "wordplay": 8, "creativity": 8, "flow": 9}'::jsonb,
    '{"stage_presence": 10, "crowd_control": 9, "delivery": 9}'::jsonb,
    '{"financial_stability": 10, "reputation": 9, "family_bond": 8, "preparation": 6}'::jsonb,
    7
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1675);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The Bronx Boss',
    'The Cam''ron of battle rap. Oozes coolness and charisma. Best money-talk bars in the game.',
    'positive'
  );
END $$;

-- 7. Ave the Puncher (Ave) - The Reference King
DO $$
DECLARE
  battler_id UUID;
  main_stage_id UUID;
BEGIN
  SELECT id INTO main_stage_id FROM leagues WHERE name = 'Main Stage Arena';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Ave the Puncher', main_stage_id, true, 'top')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 8, "wordplay": 9, "creativity": 9, "flow": 8}'::jsonb,
    '{"stage_presence": 9, "crowd_control": 9, "delivery": 9}'::jsonb,
    '{"financial_stability": 7, "reputation": 8, "family_bond": 7, "preparation": 8}'::jsonb,
    8
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1675);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'Norfolk Navigator',
    'Endless supply of creative bars. Deep references to sports, movies, Hip Hop culture. Vocal projection commands attention.',
    'positive'
  );
END $$;

-- 8. Holla Hitman (Hitman Holla) - The Showman
DO $$
DECLARE
  battler_id UUID;
  main_stage_id UUID;
BEGIN
  SELECT id INTO main_stage_id FROM leagues WHERE name = 'Main Stage Arena';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Holla Hitman', main_stage_id, true, 'top')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 7, "wordplay": 7, "creativity": 8, "flow": 8}'::jsonb,
    '{"stage_presence": 10, "crowd_control": 10, "delivery": 10}'::jsonb,
    '{"financial_stability": 8, "reputation": 8, "family_bond": 7, "preparation": 7}'::jsonb,
    8
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1650);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The St. Louis Showman',
    'Electrifying performances and unmatched showmanship. Indescribable timing. Elite angler who crafts perfect personals.',
    'positive'
  );
END $$;

-- 9. Magic B (B Magic) - The Punchline Magician
DO $$
DECLARE
  battler_id UUID;
  small_room_id UUID;
BEGIN
  SELECT id INTO small_room_id FROM leagues WHERE name = 'Small Room Circuit';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Magic B', small_room_id, true, 'top')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 9, "wordplay": 9, "creativity": 8, "flow": 8}'::jsonb,
    '{"stage_presence": 7, "crowd_control": 7, "delivery": 8}'::jsonb,
    '{"financial_stability": 7, "reputation": 8, "family_bond": 7, "preparation": 7}'::jsonb,
    7
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1650);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The St. Louis Magician',
    'One of the best punchline rappers ever. Back-to-back clever punches at high lyricism. Consistency issues in prep.',
    'positive'
  );
END $$;

-- 10. K the Shine (K-Shine) - The Harlem Energizer
DO $$
DECLARE
  battler_id UUID;
  main_stage_id UUID;
BEGIN
  SELECT id INTO main_stage_id FROM leagues WHERE name = 'Main Stage Arena';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('K the Shine', main_stage_id, true, 'top')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 7, "wordplay": 8, "creativity": 8, "flow": 9}'::jsonb,
    '{"stage_presence": 9, "crowd_control": 9, "delivery": 9}'::jsonb,
    '{"financial_stability": 7, "reputation": 8, "family_bond": 7, "preparation": 8}'::jsonb,
    8
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1575);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The Uptown Puncher',
    'Flow, wittiness, and performance mastered. Back-to-back punching with high energy. Top 5 COTY candidate 3 years straight.',
    'positive'
  );
END $$;

-- 11. Will Ill (Ill Will) - The Unorthodox Threat
DO $$
DECLARE
  battler_id UUID;
  main_stage_id UUID;
BEGIN
  SELECT id INTO main_stage_id FROM leagues WHERE name = 'Main Stage Arena';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Will Ill', main_stage_id, true, 'top')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 7, "wordplay": 7, "creativity": 8, "flow": 8}'::jsonb,
    '{"stage_presence": 8, "crowd_control": 8, "delivery": 9}'::jsonb,
    '{"financial_stability": 6, "reputation": 7, "family_bond": 7, "preparation": 7}'::jsonb,
    8
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1550);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The Pontiac Danger',
    'Complete versatility: humor, wordplay, creativity, rebuttals. Grit and believability distinguish him. High risk, incredibly dangerous.',
    'positive'
  );
END $$;

-- 12. Red O (O-Red) - The Newark Aggressor
DO $$
DECLARE
  battler_id UUID;
  main_stage_id UUID;
BEGIN
  SELECT id INTO main_stage_id FROM leagues WHERE name = 'Main Stage Arena';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Red O', main_stage_id, true, 'top')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 7, "wordplay": 8, "creativity": 7, "flow": 8}'::jsonb,
    '{"stage_presence": 8, "crowd_control": 8, "delivery": 9}'::jsonb,
    '{"financial_stability": 6, "reputation": 7, "family_bond": 6, "preparation": 7}'::jsonb,
    7
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1550);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The Brick City Puncher',
    'Aggressive, intense performance style. Devastating punchlines with razor-sharp delivery. High energy and crowd engagement.',
    'positive'
  );
END $$;

-- 13. Chess the Strategist (Chess) - The Flow Architect
DO $$
DECLARE
  battler_id UUID;
  small_room_id UUID;
BEGIN
  SELECT id INTO small_room_id FROM leagues WHERE name = 'Small Room Circuit';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Chess the Strategist', small_room_id, true, 'top')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 7, "wordplay": 8, "creativity": 8, "flow": 9}'::jsonb,
    '{"stage_presence": 7, "crowd_control": 7, "delivery": 8}'::jsonb,
    '{"financial_stability": 6, "reputation": 7, "family_bond": 7, "preparation": 7}'::jsonb,
    7
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1525);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The Bronx Tactician',
    'Unique flow/rhyme pattern transitions. Subtle double entendres hard to catch. Improved writing over career.',
    'positive'
  );
END $$;

-- 14. P Mike (Mike P) - The Puzzle Master
DO $$
DECLARE
  battler_id UUID;
  small_room_id UUID;
BEGIN
  SELECT id INTO small_room_id FROM leagues WHERE name = 'Small Room Circuit';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('P Mike', small_room_id, true, 'top')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 8, "wordplay": 8, "creativity": 8, "flow": 7}'::jsonb,
    '{"stage_presence": 6, "crowd_control": 6, "delivery": 7}'::jsonb,
    '{"financial_stability": 7, "reputation": 7, "family_bond": 7, "preparation": 8}'::jsonb,
    7
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1525);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The Island Writer',
    '''Rewind and find'' ability with hidden references. Complex double meanings and layered writing. Lacks stage presence.',
    'positive'
  );
END $$;

-- 15. Cortez the Pen (Cortez) - The Slept-On Writer
DO $$
DECLARE
  battler_id UUID;
  small_room_id UUID;
BEGIN
  SELECT id INTO small_room_id FROM leagues WHERE name = 'Small Room Circuit';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Cortez the Pen', small_room_id, true, 'top')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 8, "wordplay": 8, "creativity": 7, "flow": 7}'::jsonb,
    '{"stage_presence": 6, "crowd_control": 6, "delivery": 7}'::jsonb,
    '{"financial_stability": 7, "reputation": 7, "family_bond": 7, "preparation": 8}'::jsonb,
    7
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1525);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'Brooklyn''s Most Overlooked',
    'Strong pen game and lyricism. ''Being overlooked creates a pen that''s over all.'' Most slept-on battler.',
    'positive'
  );
END $$;

-- ========================================
-- MID TIER BATTLERS (1400-1599)
-- ========================================

-- 16. Foe Tru (Tru Foe) - The War Dog
DO $$
DECLARE
  battler_id UUID;
  main_stage_id UUID;
BEGIN
  SELECT id INTO main_stage_id FROM leagues WHERE name = 'Main Stage Arena';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Foe Tru', main_stage_id, true, 'mid')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 6, "wordplay": 7, "creativity": 7, "flow": 7}'::jsonb,
    '{"stage_presence": 8, "crowd_control": 8, "delivery": 8}'::jsonb,
    '{"financial_stability": 6, "reputation": 7, "family_bond": 6, "preparation": 6}'::jsonb,
    6
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1500);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The Chicago War Dog',
    'Strong personality and performance. War-ready approach. Consistency plagued by stumbles. Still figuring out complete style.',
    'positive'
  );
END $$;

-- 17. Loso the Soldier (Loso) - The Christian Soldier
DO $$
DECLARE
  battler_id UUID;
  small_room_id UUID;
BEGIN
  SELECT id INTO small_room_id FROM leagues WHERE name = 'Small Room Circuit';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Loso the Soldier', small_room_id, true, 'mid')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 7, "wordplay": 7, "creativity": 7, "flow": 7}'::jsonb,
    '{"stage_presence": 8, "crowd_control": 7, "delivery": 8}'::jsonb,
    '{"financial_stability": 7, "reputation": 7, "family_bond": 9, "preparation": 8}'::jsonb,
    8
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1475);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'Tampa''s Chess Player',
    'Combines all aspects into one round. Hard-hitting lines. 2016 Rookie Battler of the Year. Christian persona limits believability.',
    'positive'
  );
END $$;

-- 18. Prep the Professional (Prep) - The GQ Battler
DO $$
DECLARE
  battler_id UUID;
  small_room_id UUID;
BEGIN
  SELECT id INTO small_room_id FROM leagues WHERE name = 'Small Room Circuit';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Prep the Professional', small_room_id, true, 'mid')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 7, "wordplay": 7, "creativity": 7, "flow": 6}'::jsonb,
    '{"stage_presence": 7, "crowd_control": 6, "delivery": 6}'::jsonb,
    '{"financial_stability": 7, "reputation": 6, "family_bond": 7, "preparation": 7}'::jsonb,
    7
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1375);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'Baltimore''s Gentleman',
    'Polished, GQ-friendly style. Strong pen game. Prefers debatables over clear victories. Limited impact in big battles.',
    'positive'
  );
END $$;

-- ========================================
-- LOW TIER BATTLERS (1100-1399)
-- ========================================

-- 19. Deal Real (Real Deal) - The Veteran Journeyman
DO $$
DECLARE
  battler_id UUID;
  small_room_id UUID;
BEGIN
  SELECT id INTO small_room_id FROM leagues WHERE name = 'Small Room Circuit';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Deal Real', small_room_id, true, 'low')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 6, "wordplay": 7, "creativity": 6, "flow": 6}'::jsonb,
    '{"stage_presence": 6, "crowd_control": 6, "delivery": 6}'::jsonb,
    '{"financial_stability": 6, "reputation": 6, "family_bond": 7, "preparation": 7}'::jsonb,
    7
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1350);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The Pittsburgh Vet',
    'Extensive experience (140 battles since Scribble Jam). Never reached elite level. Respected veteran presence.',
    'positive'
  );
END $$;

-- 20. Bangz the Banger (Bangz) - The Connecticut Grinder
DO $$
DECLARE
  battler_id UUID;
  main_stage_id UUID;
BEGIN
  SELECT id INTO main_stage_id FROM leagues WHERE name = 'Main Stage Arena';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Bangz the Banger', main_stage_id, true, 'low')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 6, "wordplay": 6, "creativity": 6, "flow": 7}'::jsonb,
    '{"stage_presence": 7, "crowd_control": 7, "delivery": 7}'::jsonb,
    '{"financial_stability": 6, "reputation": 6, "family_bond": 6, "preparation": 6}'::jsonb,
    6
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1325);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'New Haven Hustler',
    'Always entertaining. URL Proving Grounds graduate. Never broke through to top tier. Mid-level ceiling.',
    'positive'
  );
END $$;

-- 21. Footz the Fast (Footz) - The Flow Switcher
DO $$
DECLARE
  battler_id UUID;
  small_room_id UUID;
BEGIN
  SELECT id INTO small_room_id FROM leagues WHERE name = 'Small Room Circuit';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Footz the Fast', small_room_id, true, 'low')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 6, "wordplay": 6, "creativity": 6, "flow": 7}'::jsonb,
    '{"stage_presence": 6, "crowd_control": 6, "delivery": 7}'::jsonb,
    '{"financial_stability": 5, "reputation": 5, "family_bond": 6, "preparation": 6}'::jsonb,
    6
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1300);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The Bar Fest Warrior',
    'Flow switching and varied pockets. Rapid-fire punching. Limited name recognition. Inconsistent across battles.',
    'positive'
  );
END $$;

-- 22. Saygo Tex (Tex Saygo) - The Philly Prospect
DO $$
DECLARE
  battler_id UUID;
  main_stage_id UUID;
BEGIN
  SELECT id INTO main_stage_id FROM leagues WHERE name = 'Main Stage Arena';

  INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier)
  VALUES ('Saygo Tex', main_stage_id, true, 'low')
  RETURNING id INTO battler_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    battler_id,
    '{"lyricism": 5, "wordplay": 6, "creativity": 6, "flow": 6}'::jsonb,
    '{"stage_presence": 6, "crowd_control": 6, "delivery": 6}'::jsonb,
    '{"financial_stability": 5, "reputation": 5, "family_bond": 6, "preparation": 6}'::jsonb,
    6
  );

  INSERT INTO rankings (battler_id, rating) VALUES (battler_id, 1250);

  INSERT INTO battler_public_info (battler_id, info_type, title, description, impact)
  VALUES (
    battler_id,
    'reputation_event',
    'The Philly Underdog',
    'Learning the ropes on smaller stages. Battles frequently to gain experience. No signature style yet.',
    'positive'
  );
END $$;

-- ========================================
-- UPDATE EXISTING LEGENDARY BATTLERS
-- ========================================

-- Update Hollow Da Don (downgrade from 1875 to 1750)
DO $$
DECLARE
  hollow_id UUID;
BEGIN
  SELECT id INTO hollow_id FROM battlers WHERE stage_name = 'Hallow The Dawn';

  -- Update rating
  UPDATE rankings SET rating = 1750 WHERE battler_id = hollow_id;

  -- Update attributes (lower preparation and resilience)
  UPDATE battler_attributes SET
    personal = '{"financial_stability": 8, "reputation": 9, "family_bond": 7, "preparation": 6}'::jsonb,
    resilience = 7
  WHERE battler_id = hollow_id;

  -- Update public info to reflect fallen off status
  UPDATE battler_public_info SET
    title = 'The Complete Package (Past His Prime)',
    description = 'Once untouchable, now inconsistent. Elite crowd control but doesn''t bring the same hunger as earlier career.'
  WHERE battler_id = hollow_id;

  RAISE NOTICE '⬇️  Downgraded Hallow The Dawn to 1750 (fallen off in recent years)';
END $$;

-- Update Verb Alliance (reposition as writer, not just rebuttal specialist)
DO $$
DECLARE
  verb_id UUID;
BEGIN
  SELECT id INTO verb_id FROM battlers WHERE stage_name = 'Verb Alliance';

  -- Rename to Clips Charlie
  UPDATE battlers SET stage_name = 'Clips Charlie' WHERE id = verb_id;

  -- Update attributes (improve writing, adjust performance)
  UPDATE battler_attributes SET
    writing = '{"lyricism": 9, "wordplay": 9, "creativity": 9, "flow": 8}'::jsonb,
    performance = '{"stage_presence": 9, "crowd_control": 10, "delivery": 8}'::jsonb
  WHERE battler_id = verb_id;

  -- Update rating
  UPDATE rankings SET rating = 1825 WHERE battler_id = verb_id;

  -- Change to Small Room Circuit (writer-focused)
  UPDATE battlers SET primary_league_id = (SELECT id FROM leagues WHERE name = 'Small Room Circuit')
  WHERE id = verb_id;

  -- Update public info
  UPDATE battler_public_info SET
    title = 'The Harlem Writer',
    description = 'Elite writer comparable to Loaded Lux. Projects bars and controls crowd better than any pen gamer. Seamlessly blends jokes and serious bars.'
  WHERE battler_id = verb_id;

  RAISE NOTICE '🔄 Repositioned Verb Alliance → Clips Charlie (writer, not just rebuttal specialist)';
END $$;

-- Update Ron Gritty (change to Rum Nitty)
UPDATE battlers SET stage_name = 'Nitty Rum' WHERE stage_name = 'Ron Gritty';
UPDATE battler_public_info SET title = 'The Gunsmith' WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Nitty Rum');

-- Update Ray Rock (change to Roc Tay)
UPDATE battlers SET stage_name = 'Roc Tay' WHERE stage_name = 'Ray Rock';
UPDATE battler_public_info SET title = 'The Baltimore Puncher' WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Roc Tay');

-- Update Beachie Knotty (change to Gotti Geechi)
UPDATE battlers SET stage_name = 'Gotti Geechi' WHERE stage_name = 'Beachie Knotty';
UPDATE battler_public_info SET title = 'The Compton Crip' WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Gotti Geechi');

-- Update Coded Flux (change to Lux Coded)
UPDATE battlers SET stage_name = 'Lux Coded' WHERE stage_name = 'Coded Flux';

-- ========================================
-- Summary Output
-- ========================================

DO $$
DECLARE
  total_count INTEGER;
  god_count INTEGER;
  top_count INTEGER;
  mid_count INTEGER;
  low_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM battlers WHERE is_ai = true;
  SELECT COUNT(*) INTO god_count FROM battlers WHERE is_ai = true AND tier = 'god';
  SELECT COUNT(*) INTO top_count FROM battlers WHERE is_ai = true AND tier = 'top';
  SELECT COUNT(*) INTO mid_count FROM battlers WHERE is_ai = true AND tier = 'mid';
  SELECT COUNT(*) INTO low_count FROM battlers WHERE is_ai = true AND tier = 'low';

  RAISE NOTICE '╔═══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║        REALISTIC BATTLER ROSTER CREATED ✅                    ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'Total AI Battlers: %', total_count;
  RAISE NOTICE '  God Tier (1800-1900): %', god_count;
  RAISE NOTICE '  Top Tier (1600-1799): %', top_count;
  RAISE NOTICE '  Mid Tier (1400-1599): %', mid_count;
  RAISE NOTICE '  Low Tier (1100-1399): %', low_count;
  RAISE NOTICE '';
  RAISE NOTICE 'LEGENDARY BATTLERS:';
  RAISE NOTICE '  1. Lux Coded (1900) - The Architect';
  RAISE NOTICE '  2. Nitty Rum (1875) - The Gunsmith';
  RAISE NOTICE '  3. Surf Tsu (1850) - The Wave';
  RAISE NOTICE '  4. Roc Tay (1850) - The Baltimore Puncher';
  RAISE NOTICE '  5. Gotti Geechi (1825) - The Compton Crip';
  RAISE NOTICE '  6. Clips Charlie (1825) - The Harlem Writer';
  RAISE NOTICE '  7. Day Lit (1800) - The Creative Troll';
  RAISE NOTICE '';
  RAISE NOTICE 'KEY CHANGES:';
  RAISE NOTICE '  ⬇️  Hallow The Dawn: 1875 → 1750 (fallen off)';
  RAISE NOTICE '  🔄 Verb Alliance → Clips Charlie (repositioned as writer)';
  RAISE NOTICE '  🗑️  Deleted all generic placeholder battlers';
  RAISE NOTICE '';
  RAISE NOTICE 'Diverse archetypes represented:';
  RAISE NOTICE '  - Pure pen gamers (Lux, JC, Chilla, B Magic)';
  RAISE NOTICE '  - Performance machines (Tay Roc, Hitman, K-Shine, Surf)';
  RAISE NOTICE '  - Freestylers (DNA, Arsonal-inspired)';
  RAISE NOTICE '  - Comedy/Creative (Daylyt)';
  RAISE NOTICE '  - Balanced threats (Geechi, Ave, Chess)';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for realistic battle rap simulation! 🎤';
END $$;
