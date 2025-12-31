-- Seed data for Algorithm Institute of BattleRap

-- =====================================================
-- SEED LEAGUES
-- =====================================================

INSERT INTO leagues (name, short_code, round_length_minutes, base_crowd_factor, writing_weight, performance_weight, booking_pace_days, description)
VALUES
  (
    'Small Room Circuit',
    'SRC',
    2,
    0.4,
    0.6,
    0.4,
    7,
    '2-minute rounds focused on writing and lyricism. Less crowd emphasis, more technical wordplay.'
  ),
  (
    'Main Stage Arena',
    'MSA',
    3,
    0.7,
    0.4,
    0.6,
    10,
    '3-minute rounds focused on performance and crowd control. High energy, stage presence matters.'
  );

-- Get league IDs for reference
DO $$
DECLARE
  small_room_id UUID;
  main_stage_id UUID;
BEGIN
  SELECT id INTO small_room_id FROM leagues WHERE short_code = 'SRC';
  SELECT id INTO main_stage_id FROM leagues WHERE short_code = 'MSA';

-- =====================================================
-- SEED AI BATTLERS
-- =====================================================

  -- Small Room battlers (technical, writing-focused)
  INSERT INTO battlers (stage_name, is_ai, primary_league_id, region, style_tags, tier)
  VALUES
    ('Young Pattern', TRUE, small_room_id, 'East Coast', '["angles", "storytelling"]'::jsonb, 'low'),
    ('Lyric Storm', TRUE, small_room_id, 'West Coast', '["wordplay", "metaphors"]'::jsonb, 'mid'),
    ('Clever Scheme', TRUE, small_room_id, 'Midwest', '["schemes", "multisyllabic"]'::jsonb, 'mid'),
    ('Angle Master', TRUE, small_room_id, 'South', '["angles", "personals"]'::jsonb, 'top'),
    ('Wordsmith Elite', TRUE, small_room_id, 'International', '["wordplay", "creativity"]'::jsonb, 'top');

  -- Main Stage battlers (performance-focused)
  INSERT INTO battlers (stage_name, is_ai, primary_league_id, region, style_tags, tier)
  VALUES
    ('Crowd Killa', TRUE, main_stage_id, 'East Coast', '["comedy", "crowd_engagement"]'::jsonb, 'low'),
    ('Stage Commander', TRUE, main_stage_id, 'West Coast', '["aggressive", "gun_bars"]'::jsonb, 'mid'),
    ('Hype Beast', TRUE, main_stage_id, 'Midwest', '["comedy", "slapstick"]'::jsonb, 'mid'),
    ('Performance King', TRUE, main_stage_id, 'South', '["theatrical", "aggressive"]'::jsonb, 'top'),
    ('Main Event', TRUE, main_stage_id, 'International', '["charismatic", "gun_bars"]'::jsonb, 'top');

END $$;

-- =====================================================
-- SEED BATTLER ATTRIBUTES
-- =====================================================

DO $$
DECLARE
  battler RECORD;
  writing_stats JSONB;
  performance_stats JSONB;
  personal_stats JSONB;
  resilience_val INT;
BEGIN
  FOR battler IN SELECT id, tier FROM battlers WHERE is_ai = TRUE LOOP
    -- Generate stats based on tier
    CASE battler.tier
      WHEN 'low' THEN
        writing_stats := jsonb_build_object('lyricism', 3, 'wordplay', 3, 'creativity', 4);
        performance_stats := jsonb_build_object('stage_presence', 3, 'crowd_control', 3, 'delivery', 4);
        personal_stats := jsonb_build_object('financial_stability', 3, 'reputation', 2, 'family_bond', 5, 'preparation', 4);
        resilience_val := 4;
      WHEN 'mid' THEN
        writing_stats := jsonb_build_object('lyricism', 5, 'wordplay', 6, 'creativity', 5);
        performance_stats := jsonb_build_object('stage_presence', 5, 'crowd_control', 5, 'delivery', 6);
        personal_stats := jsonb_build_object('financial_stability', 5, 'reputation', 5, 'family_bond', 5, 'preparation', 5);
        resilience_val := 6;
      WHEN 'top' THEN
        writing_stats := jsonb_build_object('lyricism', 8, 'wordplay', 8, 'creativity', 7);
        performance_stats := jsonb_build_object('stage_presence', 7, 'crowd_control', 8, 'delivery', 8);
        personal_stats := jsonb_build_object('financial_stability', 7, 'reputation', 8, 'family_bond', 6, 'preparation', 7);
        resilience_val := 8;
      ELSE
        writing_stats := jsonb_build_object('lyricism', 5, 'wordplay', 5, 'creativity', 5);
        performance_stats := jsonb_build_object('stage_presence', 5, 'crowd_control', 5, 'delivery', 5);
        personal_stats := jsonb_build_object('financial_stability', 5, 'reputation', 5, 'family_bond', 5, 'preparation', 5);
        resilience_val := 5;
    END CASE;

    INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience, public_knowledge)
    VALUES (battler.id, writing_stats, performance_stats, personal_stats, resilience_val, 20);
  END LOOP;
END $$;

-- =====================================================
-- SEED RANKINGS
-- =====================================================

DO $$
DECLARE
  battler RECORD;
  base_rating INT;
BEGIN
  FOR battler IN SELECT id, tier FROM battlers WHERE is_ai = TRUE LOOP
    -- Assign ratings based on tier
    CASE battler.tier
      WHEN 'low' THEN base_rating := 1100;
      WHEN 'mid' THEN base_rating := 1300;
      WHEN 'top' THEN base_rating := 1500;
      ELSE base_rating := 1200;
    END CASE;

    INSERT INTO rankings (battler_id, rating, wins, losses, streak)
    VALUES (
      battler.id,
      base_rating + floor(random() * 100)::int,
      floor(random() * 10)::int,
      floor(random() * 8)::int,
      0
    );
  END LOOP;
END $$;
