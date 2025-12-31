-- Migration: Seed Starter Crews with AI Battler Members
-- Description: Creates 3 starter crews (Street Prophets, Bar Scientists, Gutter Kings) with AI battlers
-- Date: December 7, 2025

-- =====================================================
-- Step 1: Add columns to support starter crews
-- =====================================================

ALTER TABLE crews ADD COLUMN IF NOT EXISTS is_starter_crew BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE crews ADD COLUMN IF NOT EXISTS style TEXT;

CREATE INDEX IF NOT EXISTS idx_crews_is_starter ON crews(is_starter_crew);

-- =====================================================
-- Step 2: Create system user for crew ownership
-- =====================================================

-- Create a system user UUID constant for AI-owned crews
-- Using a fixed UUID so it's consistent across environments
DO $$
DECLARE
  system_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Insert system user if it doesn't exist (will be used for AI crew ownership)
  -- Note: This is a placeholder in auth.users for system-owned records
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES (
    system_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'system@battlerap.ai',
    'SYSTEM_NO_PASSWORD',
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"system","providers":["system"]}'::jsonb,
    '{"name":"System"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- =====================================================
-- Step 3: Get league IDs for battler creation
-- =====================================================

DO $$
DECLARE
  small_room_id UUID;
  main_stage_id UUID;
  system_user_id UUID := '00000000-0000-0000-0000-000000000000';

  -- Crew IDs
  street_prophets_id UUID;
  bar_scientists_id UUID;
  gutter_kings_id UUID;

  -- Battler IDs for Street Prophets
  prophet_1_id UUID;
  prophet_2_id UUID;
  prophet_3_id UUID;

  -- Battler IDs for Bar Scientists
  scientist_1_id UUID;
  scientist_2_id UUID;
  scientist_3_id UUID;

  -- Battler IDs for Gutter Kings
  king_1_id UUID;
  king_2_id UUID;
  king_3_id UUID;

BEGIN
  -- Get league IDs
  SELECT id INTO small_room_id FROM leagues WHERE short_code = 'SRC';
  SELECT id INTO main_stage_id FROM leagues WHERE short_code = 'MSA';

-- =====================================================
-- Step 4: Create the 3 starter crews
-- =====================================================

  -- Street Prophets (street style, mid reputation)
  INSERT INTO crews (name, tag, created_by, reputation, style, is_starter_crew, active)
  VALUES ('Street Prophets', 'SP', system_user_id, 35, 'street', true, true)
  RETURNING id INTO street_prophets_id;

  -- Bar Scientists (technical style, higher reputation)
  INSERT INTO crews (name, tag, created_by, reputation, style, is_starter_crew, active)
  VALUES ('Bar Scientists', 'BS', system_user_id, 40, 'technical', true, true)
  RETURNING id INTO bar_scientists_id;

  -- Gutter Kings (aggressive style, lower reputation)
  INSERT INTO crews (name, tag, created_by, reputation, style, is_starter_crew, active)
  VALUES ('Gutter Kings', 'GK', system_user_id, 30, 'aggressive', true, true)
  RETURNING id INTO gutter_kings_id;

-- =====================================================
-- Step 5: Create AI battlers for Street Prophets
-- =====================================================

  -- Street Prophets Member 1: "Truth Seeker" (street/storytelling)
  INSERT INTO battlers (stage_name, is_ai, primary_league_id, region, style_tags, tier, crew_id)
  VALUES ('Truth Seeker', TRUE, small_room_id, 'East Coast', '["storytelling", "angles"]'::jsonb, 'mid', street_prophets_id)
  RETURNING id INTO prophet_1_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience, public_knowledge)
  VALUES (
    prophet_1_id,
    jsonb_build_object('lyricism', 5, 'wordplay', 4, 'creativity', 6),
    jsonb_build_object('stage_presence', 6, 'crowd_control', 5, 'delivery', 5),
    jsonb_build_object('financial_stability', 4, 'reputation', 4, 'family_bond', 6, 'preparation', 5),
    6,
    25
  );

  INSERT INTO rankings (battler_id, rating, wins, losses, streak)
  VALUES (prophet_1_id, 1320, 8, 5, 0);

  -- Street Prophets Member 2: "Raw Prophet" (aggressive/street)
  INSERT INTO battlers (stage_name, is_ai, primary_league_id, region, style_tags, tier, crew_id)
  VALUES ('Raw Prophet', TRUE, main_stage_id, 'West Coast', '["aggressive", "personals"]'::jsonb, 'mid', street_prophets_id)
  RETURNING id INTO prophet_2_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience, public_knowledge)
  VALUES (
    prophet_2_id,
    jsonb_build_object('lyricism', 4, 'wordplay', 5, 'creativity', 5),
    jsonb_build_object('stage_presence', 6, 'crowd_control', 6, 'delivery', 6),
    jsonb_build_object('financial_stability', 4, 'reputation', 4, 'family_bond', 5, 'preparation', 5),
    7,
    22
  );

  INSERT INTO rankings (battler_id, rating, wins, losses, streak)
  VALUES (prophet_2_id, 1340, 9, 6, 1);

  -- Street Prophets Member 3: "Corner Poet" (street/resilient)
  INSERT INTO battlers (stage_name, is_ai, primary_league_id, region, style_tags, tier, crew_id)
  VALUES ('Corner Poet', TRUE, small_room_id, 'South', '["storytelling", "metaphors"]'::jsonb, 'mid', street_prophets_id)
  RETURNING id INTO prophet_3_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience, public_knowledge)
  VALUES (
    prophet_3_id,
    jsonb_build_object('lyricism', 6, 'wordplay', 5, 'creativity', 5),
    jsonb_build_object('stage_presence', 5, 'crowd_control', 4, 'delivery', 5),
    jsonb_build_object('financial_stability', 3, 'reputation', 4, 'family_bond', 7, 'preparation', 6),
    7,
    20
  );

  INSERT INTO rankings (battler_id, rating, wins, losses, streak)
  VALUES (prophet_3_id, 1300, 7, 7, 0);

-- =====================================================
-- Step 6: Create AI battlers for Bar Scientists
-- =====================================================

  -- Bar Scientists Member 1: "Scheme Architect" (technical/lyrical)
  INSERT INTO battlers (stage_name, is_ai, primary_league_id, region, style_tags, tier, crew_id)
  VALUES ('Scheme Architect', TRUE, small_room_id, 'East Coast', '["schemes", "multisyllabic"]'::jsonb, 'mid', bar_scientists_id)
  RETURNING id INTO scientist_1_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience, public_knowledge)
  VALUES (
    scientist_1_id,
    jsonb_build_object('lyricism', 7, 'wordplay', 7, 'creativity', 5),
    jsonb_build_object('stage_presence', 4, 'crowd_control', 4, 'delivery', 5),
    jsonb_build_object('financial_stability', 5, 'reputation', 5, 'family_bond', 5, 'preparation', 6),
    5,
    30
  );

  INSERT INTO rankings (battler_id, rating, wins, losses, streak)
  VALUES (scientist_1_id, 1380, 10, 4, 2);

  -- Bar Scientists Member 2: "Wordplay Wizard" (technical/wordplay)
  INSERT INTO battlers (stage_name, is_ai, primary_league_id, region, style_tags, tier, crew_id)
  VALUES ('Wordplay Wizard', TRUE, small_room_id, 'Midwest', '["wordplay", "metaphors"]'::jsonb, 'top', bar_scientists_id)
  RETURNING id INTO scientist_2_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience, public_knowledge)
  VALUES (
    scientist_2_id,
    jsonb_build_object('lyricism', 8, 'wordplay', 8, 'creativity', 6),
    jsonb_build_object('stage_presence', 5, 'crowd_control', 5, 'delivery', 6),
    jsonb_build_object('financial_stability', 6, 'reputation', 6, 'family_bond', 5, 'preparation', 7),
    6,
    35
  );

  INSERT INTO rankings (battler_id, rating, wins, losses, streak)
  VALUES (scientist_2_id, 1520, 12, 3, 3);

  -- Bar Scientists Member 3: "Technical Professor" (technical/analytical)
  INSERT INTO battlers (stage_name, is_ai, primary_league_id, region, style_tags, tier, crew_id)
  VALUES ('Technical Professor', TRUE, small_room_id, 'International', '["technical", "angles"]'::jsonb, 'mid', bar_scientists_id)
  RETURNING id INTO scientist_3_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience, public_knowledge)
  VALUES (
    scientist_3_id,
    jsonb_build_object('lyricism', 6, 'wordplay', 7, 'creativity', 5),
    jsonb_build_object('stage_presence', 4, 'crowd_control', 4, 'delivery', 5),
    jsonb_build_object('financial_stability', 5, 'reputation', 5, 'family_bond', 6, 'preparation', 6),
    6,
    28
  );

  INSERT INTO rankings (battler_id, rating, wins, losses, streak)
  VALUES (scientist_3_id, 1350, 9, 5, 1);

-- =====================================================
-- Step 7: Create AI battlers for Gutter Kings
-- =====================================================

  -- Gutter Kings Member 1: "Street Brawler" (aggressive/raw)
  INSERT INTO battlers (stage_name, is_ai, primary_league_id, region, style_tags, tier, crew_id)
  VALUES ('Street Brawler', TRUE, main_stage_id, 'East Coast', '["aggressive", "gun_bars"]'::jsonb, 'mid', gutter_kings_id)
  RETURNING id INTO king_1_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience, public_knowledge)
  VALUES (
    king_1_id,
    jsonb_build_object('lyricism', 4, 'wordplay', 4, 'creativity', 5),
    jsonb_build_object('stage_presence', 7, 'crowd_control', 6, 'delivery', 7),
    jsonb_build_object('financial_stability', 3, 'reputation', 4, 'family_bond', 5, 'preparation', 4),
    6,
    18
  );

  INSERT INTO rankings (battler_id, rating, wins, losses, streak)
  VALUES (king_1_id, 1280, 6, 8, -1);

  -- Gutter Kings Member 2: "Grime Lord" (aggressive/theatrical)
  INSERT INTO battlers (stage_name, is_ai, primary_league_id, region, style_tags, tier, crew_id)
  VALUES ('Grime Lord', TRUE, main_stage_id, 'West Coast', '["theatrical", "aggressive"]'::jsonb, 'mid', gutter_kings_id)
  RETURNING id INTO king_2_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience, public_knowledge)
  VALUES (
    king_2_id,
    jsonb_build_object('lyricism', 3, 'wordplay', 4, 'creativity', 6),
    jsonb_build_object('stage_presence', 7, 'crowd_control', 7, 'delivery', 6),
    jsonb_build_object('financial_stability', 3, 'reputation', 3, 'family_bond', 4, 'preparation', 4),
    5,
    15
  );

  INSERT INTO rankings (battler_id, rating, wins, losses, streak)
  VALUES (king_2_id, 1260, 7, 9, 0);

  -- Gutter Kings Member 3: "Raw Energy" (aggressive/high presence)
  INSERT INTO battlers (stage_name, is_ai, primary_league_id, region, style_tags, tier, crew_id)
  VALUES ('Raw Energy', TRUE, main_stage_id, 'South', '["aggressive", "crowd_engagement"]'::jsonb, 'low', gutter_kings_id)
  RETURNING id INTO king_3_id;

  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience, public_knowledge)
  VALUES (
    king_3_id,
    jsonb_build_object('lyricism', 3, 'wordplay', 3, 'creativity', 4),
    jsonb_build_object('stage_presence', 6, 'crowd_control', 7, 'delivery', 6),
    jsonb_build_object('financial_stability', 2, 'reputation', 3, 'family_bond', 5, 'preparation', 3),
    5,
    12
  );

  INSERT INTO rankings (battler_id, rating, wins, losses, streak)
  VALUES (king_3_id, 1220, 5, 10, -2);

-- =====================================================
-- Step 8: Add crew members to crew_members table
-- =====================================================

  -- Street Prophets members (first member is leader)
  INSERT INTO crew_members (crew_id, user_id, battler_id, role, is_active)
  VALUES
    (street_prophets_id, system_user_id, prophet_1_id, 'leader', true),
    (street_prophets_id, system_user_id, prophet_2_id, 'member', true),
    (street_prophets_id, system_user_id, prophet_3_id, 'member', true);

  -- Update Street Prophets leader
  UPDATE crews SET leader_battler_id = prophet_1_id WHERE id = street_prophets_id;

  -- Bar Scientists members (Wordplay Wizard is leader - highest tier)
  INSERT INTO crew_members (crew_id, user_id, battler_id, role, is_active)
  VALUES
    (bar_scientists_id, system_user_id, scientist_1_id, 'member', true),
    (bar_scientists_id, system_user_id, scientist_2_id, 'leader', true),
    (bar_scientists_id, system_user_id, scientist_3_id, 'member', true);

  -- Update Bar Scientists leader
  UPDATE crews SET leader_battler_id = scientist_2_id WHERE id = bar_scientists_id;

  -- Gutter Kings members (Street Brawler is leader)
  INSERT INTO crew_members (crew_id, user_id, battler_id, role, is_active)
  VALUES
    (gutter_kings_id, system_user_id, king_1_id, 'leader', true),
    (gutter_kings_id, system_user_id, king_2_id, 'member', true),
    (gutter_kings_id, system_user_id, king_3_id, 'member', true);

  -- Update Gutter Kings leader
  UPDATE crews SET leader_battler_id = king_1_id WHERE id = gutter_kings_id;

-- =====================================================
-- Step 9: Record crew membership history
-- =====================================================

  -- Street Prophets history
  INSERT INTO crew_membership_history (battler_id, crew_id, crew_name, joined_at)
  VALUES
    (prophet_1_id, street_prophets_id, 'Street Prophets', NOW()),
    (prophet_2_id, street_prophets_id, 'Street Prophets', NOW()),
    (prophet_3_id, street_prophets_id, 'Street Prophets', NOW());

  -- Bar Scientists history
  INSERT INTO crew_membership_history (battler_id, crew_id, crew_name, joined_at)
  VALUES
    (scientist_1_id, bar_scientists_id, 'Bar Scientists', NOW()),
    (scientist_2_id, bar_scientists_id, 'Bar Scientists', NOW()),
    (scientist_3_id, bar_scientists_id, 'Bar Scientists', NOW());

  -- Gutter Kings history
  INSERT INTO crew_membership_history (battler_id, crew_id, crew_name, joined_at)
  VALUES
    (king_1_id, gutter_kings_id, 'Gutter Kings', NOW()),
    (king_2_id, gutter_kings_id, 'Gutter Kings', NOW()),
    (king_3_id, gutter_kings_id, 'Gutter Kings', NOW());

END $$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN crews.is_starter_crew IS 'Indicates if this is a pre-built starter crew available to all players';
COMMENT ON COLUMN crews.style IS 'Primary style/identity of the crew (street, technical, aggressive, etc.)';
