-- V2 Database Schema Additions
-- Run this after initial schema setup

-- ============================================
-- New Table: battle_segments
-- ============================================

CREATE TABLE IF NOT EXISTS battle_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  round_num INTEGER,           -- NULL = unassigned
  position INTEGER,            -- 1-6 position in round
  content_type VARCHAR(50) NOT NULL,
  delivery_type VARCHAR(50) NOT NULL,
  performance_type VARCHAR(50) NOT NULL,
  is_freestyle BOOLEAN DEFAULT FALSE,
  is_counter BOOLEAN DEFAULT FALSE,
  counter_target VARCHAR(50),
  is_rehearsed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_position CHECK (position IS NULL OR (position >= 1 AND position <= 6)),
  CONSTRAINT valid_round CHECK (round_num IS NULL OR (round_num >= 1 AND round_num <= 3)),
  CONSTRAINT counter_needs_target CHECK (NOT is_counter OR counter_target IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_segments_battle ON battle_segments(battle_id);
CREATE INDEX IF NOT EXISTS idx_segments_round ON battle_segments(battle_id, round_num);

-- ============================================
-- New Table: battle_counters
-- ============================================

CREATE TABLE IF NOT EXISTS battle_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES battle_segments(id) ON DELETE CASCADE,
  anticipated_content VARCHAR(50) NOT NULL,
  was_triggered BOOLEAN,        -- NULL until battle, then true/false
  was_effective BOOLEAN,        -- NULL until resolved
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(battle_id, segment_id)
);

CREATE INDEX IF NOT EXISTS idx_counters_battle ON battle_counters(battle_id);

-- ============================================
-- Update Table: battles (add round shifting)
-- ============================================

ALTER TABLE battles ADD COLUMN IF NOT EXISTS round_order INTEGER[] DEFAULT ARRAY[1,2,3];
ALTER TABLE battles ADD COLUMN IF NOT EXISTS rounds_shifted BOOLEAN DEFAULT FALSE;

-- ============================================
-- Helper function: Calculate research level
-- ============================================

CREATE OR REPLACE FUNCTION get_research_level(p_battle_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  research_days INTEGER;
BEGIN
  SELECT COUNT(*) INTO research_days
  FROM prep_blocks
  WHERE battle_id = p_battle_id AND focus = 'research';
  
  IF research_days >= 3 THEN
    RETURN 'aggressive';
  ELSIF research_days >= 2 THEN
    RETURN 'casual';
  ELSE
    RETURN 'none';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Helper function: Calculate prep progress
-- ============================================

CREATE OR REPLACE FUNCTION get_prep_progress(p_battle_id UUID)
RETURNS JSONB AS $$
DECLARE
  total_segments INTEGER;
  assigned_segments INTEGER;
  rehearsed_rounds INTEGER;
  research_level VARCHAR(20);
BEGIN
  SELECT COUNT(*) INTO total_segments
  FROM battle_segments WHERE battle_id = p_battle_id;
  
  SELECT COUNT(*) INTO assigned_segments
  FROM battle_segments WHERE battle_id = p_battle_id AND round_num IS NOT NULL;
  
  SELECT COUNT(DISTINCT round_num) INTO rehearsed_rounds
  FROM battle_segments 
  WHERE battle_id = p_battle_id AND is_rehearsed = TRUE AND round_num IS NOT NULL;
  
  research_level := get_research_level(p_battle_id);
  
  RETURN jsonb_build_object(
    'totalSegments', total_segments,
    'assignedSegments', assigned_segments,
    'rehearsedRounds', rehearsed_rounds,
    'researchLevel', research_level
  );
END;
$$ LANGUAGE plpgsql;
