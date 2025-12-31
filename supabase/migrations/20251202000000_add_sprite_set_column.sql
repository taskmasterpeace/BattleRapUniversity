-- ============================================================================
-- Migration: Add sprite_set Column to Battlers
-- Date: 2025-12-02
-- Purpose: Store full array of character sprites per battler
-- ============================================================================

-- Add sprite_set column to battlers table
ALTER TABLE battlers
  ADD COLUMN IF NOT EXISTS sprite_set JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN battlers.sprite_set IS 'Array of sprite paths assigned to this battler for character visualization. Each battler gets ~40 sprites from their assigned folder.';

-- Create index for sprite_set queries
CREATE INDEX IF NOT EXISTS idx_battlers_sprite_set ON battlers USING GIN (sprite_set);

-- Validation function to check sprite assignments
CREATE OR REPLACE FUNCTION check_sprite_assignments()
RETURNS TABLE (
  battler_name TEXT,
  has_avatar BOOLEAN,
  sprite_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    stage_name,
    avatar_url IS NOT NULL as has_avatar,
    jsonb_array_length(COALESCE(sprite_set, '[]'::jsonb)) as sprite_count
  FROM battlers
  ORDER BY stage_name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_sprite_assignments IS 'Returns sprite assignment status for all battlers. Usage: SELECT * FROM check_sprite_assignments();';
