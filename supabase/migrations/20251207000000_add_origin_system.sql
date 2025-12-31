-- Migration: Add Origin System
-- Description: Three origin paths (text forums, app camera, crew) with milestone tracking
-- Date: December 7, 2025

-- =====================================================
-- STEP 1: Add origin columns to battlers table
-- =====================================================

ALTER TABLE battlers ADD COLUMN IF NOT EXISTS origin_type TEXT
  CHECK (origin_type IN ('text_forums', 'app_camera', 'crew'));

ALTER TABLE battlers ADD COLUMN IF NOT EXISTS origin_completed BOOLEAN
  DEFAULT FALSE;

-- Add index for origin queries
CREATE INDEX IF NOT EXISTS idx_battlers_origin_type ON battlers(origin_type);
CREATE INDEX IF NOT EXISTS idx_battlers_origin_completed ON battlers(origin_completed);

COMMENT ON COLUMN battlers.origin_type IS 'The origin path chosen during onboarding: text_forums (writing focus), app_camera (performance focus), or crew (social focus)';
COMMENT ON COLUMN battlers.origin_completed IS 'Whether the battler has completed their origin story milestones';

-- =====================================================
-- STEP 2: Create origin_milestones table
-- =====================================================

CREATE TABLE IF NOT EXISTS origin_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  milestone_key TEXT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  context JSONB DEFAULT '{}'::jsonb,
  UNIQUE(battler_id, milestone_key)
);

-- Indexes for milestone queries
CREATE INDEX idx_origin_milestones_battler ON origin_milestones(battler_id);
CREATE INDEX idx_origin_milestones_key ON origin_milestones(milestone_key);
CREATE INDEX idx_origin_milestones_achieved ON origin_milestones(achieved_at DESC);

-- RLS policies
ALTER TABLE origin_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "origin_milestones_select_policy"
ON origin_milestones FOR SELECT
USING (true);

CREATE POLICY "origin_milestones_service_policy"
ON origin_milestones FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON TABLE origin_milestones IS 'Tracks milestone achievements for origin story progression (e.g., first_win, viral_moment, crew_formed)';
COMMENT ON COLUMN origin_milestones.milestone_key IS 'Unique identifier for the milestone (e.g., "text_forums_first_viral_post", "app_camera_10k_views", "crew_first_member_recruited")';
COMMENT ON COLUMN origin_milestones.context IS 'Additional metadata about the milestone achievement (e.g., battle_id, views_count, crew_member_id)';

-- =====================================================
-- STEP 3: Add origin-related columns to crews table
-- =====================================================

-- Check if is_starter_crew column exists, add if not
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crews' AND column_name = 'is_starter_crew'
  ) THEN
    ALTER TABLE crews ADD COLUMN is_starter_crew BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Check if style column exists, add if not
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crews' AND column_name = 'style'
  ) THEN
    ALTER TABLE crews ADD COLUMN style TEXT;
  END IF;
END $$;

-- Add constraint to style column if it doesn't have one
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'crews' AND column_name = 'style' AND constraint_name = 'crews_style_check'
  ) THEN
    ALTER TABLE crews ADD CONSTRAINT crews_style_check
      CHECK (style IS NULL OR style IN ('street', 'technical', 'aggressive'));
  END IF;
END $$;

-- Add index for starter crew queries
CREATE INDEX IF NOT EXISTS idx_crews_is_starter ON crews(is_starter_crew);

COMMENT ON COLUMN crews.is_starter_crew IS 'Whether this is a pre-generated starter crew available during onboarding (crew origin path)';
COMMENT ON COLUMN crews.style IS 'Crew style identity: street (underground culture), technical (lyricism focused), aggressive (performance focused)';

-- =====================================================
-- STEP 4: Add origin-related columns to leagues table
-- =====================================================

-- Check if is_virtual column exists, add if not
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leagues' AND column_name = 'is_virtual'
  ) THEN
    ALTER TABLE leagues ADD COLUMN is_virtual BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Check if battle_format column exists, add if not
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leagues' AND column_name = 'battle_format'
  ) THEN
    ALTER TABLE leagues ADD COLUMN battle_format TEXT DEFAULT 'live';
  END IF;
END $$;

-- Add constraint to battle_format column if it doesn't have one
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'leagues' AND column_name = 'battle_format' AND constraint_name = 'leagues_battle_format_check'
  ) THEN
    ALTER TABLE leagues ADD CONSTRAINT leagues_battle_format_check
      CHECK (battle_format IN ('live', 'asynchronous', 'recorded'));
  END IF;
END $$;

-- Add index for virtual league queries
CREATE INDEX IF NOT EXISTS idx_leagues_is_virtual ON leagues(is_virtual);

COMMENT ON COLUMN leagues.is_virtual IS 'Whether this is an online/virtual league (e.g., text forum battles, app-based battles) vs live venue league';
COMMENT ON COLUMN leagues.battle_format IS 'Battle format: live (in-person crowd), asynchronous (turn-based text/video), recorded (uploaded videos for judging)';

-- =====================================================
-- HELPER FUNCTION: Check origin completion
-- =====================================================

CREATE OR REPLACE FUNCTION check_origin_completion(p_battler_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_origin_type TEXT;
  v_milestone_count INT;
  v_required_milestones INT;
BEGIN
  -- Get battler's origin type
  SELECT origin_type INTO v_origin_type
  FROM battlers
  WHERE id = p_battler_id;

  -- If no origin type set, return false
  IF v_origin_type IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Count achieved milestones for this battler
  SELECT COUNT(*) INTO v_milestone_count
  FROM origin_milestones
  WHERE battler_id = p_battler_id;

  -- Set required milestones based on origin type
  -- TEXT_FORUMS: 5 milestones (first post, viral moment, first win, 10 battles, rivalry)
  -- APP_CAMERA: 5 milestones (first video, 10k views, first win, viral video, 100k total views)
  -- CREW: 5 milestones (crew formed, first recruit, crew battle, 5 members, crew victory)
  v_required_milestones := 5;

  -- Update origin_completed flag if threshold met
  IF v_milestone_count >= v_required_milestones THEN
    UPDATE battlers
    SET origin_completed = TRUE
    WHERE id = p_battler_id AND origin_completed = FALSE;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_origin_completion IS 'Checks if a battler has completed their origin story (5 milestones) and updates the origin_completed flag';

-- =====================================================
-- TRIGGER: Auto-check origin completion on milestone
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_check_origin_completion()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_origin_completion(NEW.battler_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER origin_milestone_completion_check
AFTER INSERT ON origin_milestones
FOR EACH ROW
EXECUTE FUNCTION trigger_check_origin_completion();

COMMENT ON TRIGGER origin_milestone_completion_check ON origin_milestones IS 'Automatically checks and updates origin_completed status when new milestones are achieved';
