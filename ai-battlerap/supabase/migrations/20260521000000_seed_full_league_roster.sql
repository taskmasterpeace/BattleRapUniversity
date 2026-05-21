-- =====================================================
-- Seed full league roster + AI battlers across all tiers
-- =====================================================
-- Date: 2026-05-21
-- Purpose: Expand from 2 leagues / ~34 AI battlers to 19 leagues / ~100 AI battlers
-- for a playable test build covering Underground → Regional → National → Premier
--
-- Tier breakdown (matches CLAUDE.md design):
--   Underground: 8 leagues, $200-500 base payouts, prestige 1-3, 2-min rounds
--   Regional:    7 leagues, $500-2000 base payouts, prestige 4-6, 2-min or 3-min
--   National:    2 leagues, $2000-5000 base payouts, prestige 7-8, 3-min rounds
--   Premier:     2 leagues, $5000+ base payouts, prestige 9-10, 3-min rounds
--
-- Adds 17 NEW leagues (keeping the existing 2: SRC and MSA), and ~4 AI battlers
-- per new league for a total of ~68 new battlers on top of existing roster.
-- =====================================================

-- =====================================================
-- PHASE 1: Update existing 2 leagues with logo paths
-- =====================================================

UPDATE leagues SET logo_url = '/sprites/leagues/image_1764195530615/league_129.png'
WHERE short_code = 'SRC';

UPDATE leagues SET logo_url = '/sprites/leagues/image_1764195526092/league_151.png'
WHERE short_code = 'MSA';

-- =====================================================
-- PHASE 2: Insert 17 new leagues across all tiers
-- =====================================================

INSERT INTO leagues (
  name, short_code, round_length_minutes, base_crowd_factor,
  writing_weight, performance_weight, booking_pace_days, description,
  logo_url, personality_style, base_payout, prestige_level
) VALUES
  -- ==================== UNDERGROUND (7 new, total 8 with SRC) ====================
  ('Street Cipher', 'STC', 2, 0.5, 0.5, 0.5, 5,
    'Raw underground league. Street poetry meets pure bars. Where unknowns make names.',
    '/sprites/leagues/image_1764195526092/league_147.png', 'street', 250, 2),

  ('You Got Smoked', 'YGS', 2, 0.6, 0.4, 0.6, 5,
    'Aggressive underground vibe. Body bag energy required. Crowd eats hard punchlines.',
    '/sprites/leagues/image_1764195526092/league_146.png', 'aggressive', 300, 2),

  ('Gunbarz Assembly', 'GBA', 2, 0.6, 0.45, 0.55, 6,
    'Underground stronghold for gun bar specialists. Heavy violence imagery rewarded.',
    '/sprites/leagues/image_1764195526092/league_145.png', 'street', 350, 3),

  ('I Do What I Want', 'IDW', 2, 0.55, 0.45, 0.55, 6,
    'Unpredictable underground league. Anything goes - shock value, comedy, raw aggression.',
    '/sprites/leagues/image_1764195933542/league_101.png', 'aggressive', 300, 2),

  ('Slap', 'SLP', 2, 0.5, 0.45, 0.55, 7,
    'East coast underground league known for slap-worthy haymaker bars and gritty energy.',
    '/sprites/leagues/image_1764195933542/league_103.png', 'street', 350, 3),

  ('Get It Get It', 'GIG', 2, 0.55, 0.5, 0.5, 7,
    'Hustle-themed underground league. Tight booking pace, hungry battlers, bag chasers.',
    '/sprites/leagues/image_1764195933542/league_104.png', 'street', 400, 3),

  ('Milwaukee Massacre', 'MIL', 2, 0.6, 0.4, 0.6, 7,
    'Midwest underground league. Gun-gritty regional pride. Aggressive crowd, no-shows pay heavy.',
    '/sprites/leagues/image_1764195933542/league_100.png', 'aggressive', 400, 3),

  -- ==================== REGIONAL (7 new) ====================
  ('Mic Masters Arena', 'MMA', 2, 0.6, 0.55, 0.45, 10,
    'East coast regional powerhouse. Technical lyricism prized. Booking standards tighten here.',
    '/sprites/leagues/image_1764195530615/league_129.png', 'technical', 800, 4),

  ('Barz Supreme League', 'BSL', 3, 0.55, 0.6, 0.4, 10,
    'Regional league for true bar-heads. 3-minute rounds mean writing depth matters most.',
    '/sprites/leagues/image_1764195530615/league_130.png', 'technical', 1000, 5),

  ('Flow Syndicate', 'FSY', 3, 0.65, 0.5, 0.5, 12,
    'Diverse regional league. Flow patterns, cadence variety, and delivery rewarded equally.',
    '/sprites/leagues/image_1764195530615/league_131.png', 'diverse', 1100, 5),

  ('Crown City Battle League', 'CCB', 3, 0.65, 0.45, 0.55, 12,
    'Regional crown-jewel league. Stage presence and crowd control define winners here.',
    '/sprites/leagues/image_1764195537197/league_105.png', 'diverse', 1200, 6),

  ('Block Buster Battles', 'BBB', 3, 0.7, 0.4, 0.6, 14,
    'Mid-tier regional with big-stage feel. High energy, heavy crowd reaction, premier-bound talent.',
    '/sprites/leagues/image_1764195534646/league_120.png', 'aggressive', 1500, 6),

  ('Spitfire Arena', 'SFA', 3, 0.65, 0.5, 0.5, 14,
    'Regional league known for fast-paced delivery and rapid-fire haymakers.',
    '/sprites/leagues/image_1764195537197/league_110.png', 'aggressive', 1300, 6),

  ('Urban Warfare League', 'UWL', 3, 0.6, 0.5, 0.5, 14,
    'Regional league with battle-tested veterans. Reputation and resilience tested every match.',
    '/sprites/leagues/image_1764195537197/league_111.png', 'street', 1400, 6),

  -- ==================== NATIONAL (2 new) ====================
  ('Respect The Craft', 'RTC', 3, 0.6, 0.6, 0.4, 18,
    'National league. Technical excellence required. Where craft and pen game matter most.',
    '/sprites/leagues/image_1764195933542/league_099.png', 'technical', 3000, 8),

  ('Stay Forever', 'STF', 3, 0.7, 0.5, 0.5, 18,
    'National stage. Career-defining battles. Legacy moments. Top-tier roster.',
    '/sprites/leagues/image_1764195933542/league_097.png', 'diverse', 3500, 8),

  -- ==================== PREMIER (1 new, total 2 with MSA) ====================
  ('Royal Wordsmiths', 'RWS', 3, 0.65, 0.55, 0.45, 21,
    'Premier league. The crown. Where the greatest battlers cement legendary status.',
    '/sprites/leagues/image_1764195526092/league_152.png', 'technical', 7500, 10);

-- =====================================================
-- PHASE 3: Insert ~4 AI battlers per new league
-- =====================================================
-- Distribution across tiers (low/mid/top/god) per league varies by league tier:
--   Underground leagues: 2 low, 1 mid, 1 top
--   Regional leagues:    1 low, 2 mid, 1 top
--   National leagues:    1 mid, 2 top, 1 god
--   Premier leagues:     2 top, 2 god

DO $$
DECLARE
  league_rec RECORD;
  battler_id UUID;
  i INT;
  total_battlers INT := 0;

  -- Battler names: ordered by league short_code in the league iteration order.
  -- Each league gets exactly 4 names. League order matches the ORDER BY below:
  --   prestige 2: GBA, IDW, STC, YGS  (underground low-mid)
  --   prestige 3: GIG, MIL, SLP       (underground mid)
  --   prestige 4: MMA                  (regional)
  --   prestige 5: BSL, FSY             (regional)
  --   prestige 6: BBB, CCB, SFA, UWL   (regional)
  --   prestige 8: RTC, STF             (national)
  --   prestige 10: RWS                 (premier)
  -- That's 17 leagues × 4 names = 68 names
  all_names TEXT[] := ARRAY[
    -- GBA (Gunbarz Assembly)
    'Iron Clip', 'Glock Talk', 'Steel Lyric', 'Trigger Pen',
    -- IDW (I Do What I Want)
    'Wild Card Will', 'No Rules Ronnie', 'Off Script', 'Anything Goes',
    -- STC (Street Cipher)
    'Block Veteran', 'Pavement Poet', 'Corner Code', 'Concrete Truth',
    -- YGS (You Got Smoked)
    'Body Bag Bryan', 'Smoke Out', 'Punchline Reaper', 'Bag Em Up',
    -- GIG (Get It Get It)
    'Hustle Hayes', 'Bag Chaser', 'Grind Mode', 'Bread Winner',
    -- MIL (Milwaukee Massacre)
    'Brew City Beast', 'Cream City Killer', 'Midwest Menace', 'Lake Effect',
    -- SLP (Slap)
    'Backhand Bishop', 'Slap Master', 'Right Cross', 'Knockout Nas',
    -- MMA (Mic Masters Arena)
    'Technical Tony', 'Precision Penn', 'Schematic Sage', 'Multi Master',
    -- BSL (Barz Supreme League)
    'Bar Architect', 'Verse Vault', 'Punchline Professor', 'Scheme Genius',
    -- FSY (Flow Syndicate)
    'Cadence King', 'Rhythm Reign', 'Pocket Master', 'Flow Frequency',
    -- BBB (Block Buster Battles)
    'Box Office Bryan', 'Blockbuster Boss', 'Main Event Mike', 'Premier Performer',
    -- CCB (Crown City Battle League)
    'Stage Royalty', 'Crowd Conductor', 'Spotlight Sage', 'Crown Holder',
    -- SFA (Spitfire Arena)
    'Rapid Fire Rico', 'Velocity Vinny', 'Sprint Spitter', 'Triple Time',
    -- UWL (Urban Warfare League)
    'War Vet Wesley', 'Battle Tested', 'Frontline Fury', 'Combat Cole',
    -- RTC (Respect The Craft)
    'Craft Marcus', 'Pen Pope', 'Lyric Legend', 'Bar God Bishop',
    -- STF (Stay Forever)
    'Eternal Erik', 'Legacy Lou', 'Forever Foe', 'Immortal Ink',
    -- RWS (Royal Wordsmiths)
    'Crown Calvin', 'Royal Rage', 'King Karver', 'Throne Talker'
  ];

  -- Character sprite folders (10 of 23 available — cycle through them)
  sprite_folders TEXT[] := ARRAY[
    '/sprites/characters/image_1764146494580',
    '/sprites/characters/image_1764146517369',
    '/sprites/characters/image_1764146527629',
    '/sprites/characters/image_1764146552156',
    '/sprites/characters/image_1764146653229',
    '/sprites/characters/image_1764146658637',
    '/sprites/characters/image_1764146668083',
    '/sprites/characters/image_1764146672519',
    '/sprites/characters/image_1764146678469',
    '/sprites/characters/image_1764146680724'
  ];
  sprite_idx INT := 0;
  current_tier TEXT;
  rating_base INT;
  writing_stats JSONB;
  performance_stats JSONB;
  personal_stats JSONB;
  resilience_val INT;
  name_idx INT;

BEGIN
  -- Iterate over the 17 new leagues we just inserted, ordered by prestige then short_code
  -- to match the order of `all_names` above.
  FOR league_rec IN
    SELECT id, name, short_code, prestige_level FROM leagues
    WHERE short_code IN ('STC','YGS','GBA','IDW','SLP','GIG','MIL',
                         'MMA','BSL','FSY','CCB','BBB','SFA','UWL',
                         'RTC','STF','RWS')
    ORDER BY prestige_level ASC, short_code ASC
  LOOP
    -- Insert 4 battlers for this league
    FOR i IN 1..4 LOOP
      name_idx := (total_battlers) + 1;  -- 1-indexed into all_names
      -- Determine tier per index (varies by league tier)
      IF league_rec.prestige_level <= 3 THEN
        -- Underground: 2 low, 1 mid, 1 top
        current_tier := CASE WHEN i <= 2 THEN 'low' WHEN i = 3 THEN 'mid' ELSE 'top' END;
        rating_base := CASE WHEN i <= 2 THEN 1100 + (i * 50) WHEN i = 3 THEN 1300 ELSE 1500 END;
      ELSIF league_rec.prestige_level <= 6 THEN
        -- Regional: 1 low, 2 mid, 1 top
        current_tier := CASE WHEN i = 1 THEN 'low' WHEN i <= 3 THEN 'mid' ELSE 'top' END;
        rating_base := CASE WHEN i = 1 THEN 1250 WHEN i <= 3 THEN 1450 + ((i-2) * 50) ELSE 1650 END;
      ELSIF league_rec.prestige_level <= 8 THEN
        -- National: 1 mid, 2 top, 1 god
        current_tier := CASE WHEN i = 1 THEN 'mid' WHEN i <= 3 THEN 'top' ELSE 'god' END;
        rating_base := CASE WHEN i = 1 THEN 1500 WHEN i <= 3 THEN 1700 + ((i-2) * 50) ELSE 1850 END;
      ELSE
        -- Premier: 2 top, 2 god
        current_tier := CASE WHEN i <= 2 THEN 'top' ELSE 'god' END;
        rating_base := CASE WHEN i <= 2 THEN 1700 + (i * 25) ELSE 1850 + ((i-2) * 25) END;
      END IF;

      -- Generate stats based on tier
      CASE current_tier
        WHEN 'low' THEN
          writing_stats := jsonb_build_object('lyricism', 3, 'wordplay', 3, 'creativity', 4, 'flow', 4);
          performance_stats := jsonb_build_object('stage_presence', 3, 'crowd_control', 3, 'delivery', 4);
          personal_stats := jsonb_build_object('financial_stability', 3, 'reputation', 2, 'family_bond', 5, 'preparation', 4);
          resilience_val := 4;
        WHEN 'mid' THEN
          writing_stats := jsonb_build_object('lyricism', 5, 'wordplay', 5, 'creativity', 5, 'flow', 6);
          performance_stats := jsonb_build_object('stage_presence', 5, 'crowd_control', 5, 'delivery', 6);
          personal_stats := jsonb_build_object('financial_stability', 5, 'reputation', 5, 'family_bond', 6, 'preparation', 5);
          resilience_val := 6;
        WHEN 'top' THEN
          writing_stats := jsonb_build_object('lyricism', 7, 'wordplay', 7, 'creativity', 7, 'flow', 8);
          performance_stats := jsonb_build_object('stage_presence', 7, 'crowd_control', 7, 'delivery', 8);
          personal_stats := jsonb_build_object('financial_stability', 7, 'reputation', 8, 'family_bond', 6, 'preparation', 7);
          resilience_val := 7;
        ELSE -- god
          writing_stats := jsonb_build_object('lyricism', 9, 'wordplay', 9, 'creativity', 8, 'flow', 9);
          performance_stats := jsonb_build_object('stage_presence', 9, 'crowd_control', 9, 'delivery', 9);
          personal_stats := jsonb_build_object('financial_stability', 8, 'reputation', 10, 'family_bond', 6, 'preparation', 8);
          resilience_val := 8;
      END CASE;

      -- Insert battler
      sprite_idx := (sprite_idx % 10) + 1;
      INSERT INTO battlers (
        stage_name, primary_league_id, is_ai, tier,
        region, style_tags, avatar_url
      )
      VALUES (
        all_names[name_idx],
        league_rec.id,
        TRUE,
        current_tier,
        CASE (sprite_idx % 5) WHEN 0 THEN 'East Coast' WHEN 1 THEN 'West Coast'
                              WHEN 2 THEN 'Midwest' WHEN 3 THEN 'South'
                              ELSE 'International' END,
        '["wordplay", "punchlines"]'::jsonb,
        sprite_folders[sprite_idx] || '/sprite_' || LPAD((((total_battlers * 13) % 40) + 1)::TEXT, 3, '0') || '.png'
      )
      RETURNING id INTO battler_id;

      INSERT INTO battler_attributes (
        battler_id, writing, performance, personal, resilience, public_knowledge
      ) VALUES (
        battler_id, writing_stats, performance_stats, personal_stats, resilience_val, 20
      );

      INSERT INTO rankings (battler_id, rating, wins, losses, streak)
      VALUES (battler_id, rating_base, 0, 0, 0);

      total_battlers := total_battlers + 1;
    END LOOP;
  END LOOP;

  RAISE NOTICE '✅ Seeded % new AI battlers across 17 new leagues', total_battlers;
END $$;

-- =====================================================
-- Verification
-- =====================================================
DO $$
DECLARE
  league_count INT;
  battler_count INT;
  leagues_with_logos INT;
BEGIN
  SELECT COUNT(*) INTO league_count FROM leagues;
  SELECT COUNT(*) INTO battler_count FROM battlers WHERE is_ai = TRUE;
  SELECT COUNT(*) INTO leagues_with_logos FROM leagues WHERE logo_url IS NOT NULL;

  RAISE NOTICE '📊 Final counts:';
  RAISE NOTICE '   Total leagues: %', league_count;
  RAISE NOTICE '   Leagues with logos: %', leagues_with_logos;
  RAISE NOTICE '   AI battlers: %', battler_count;
END $$;
