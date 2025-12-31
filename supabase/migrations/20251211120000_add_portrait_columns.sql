/**
 * Add Portrait Columns for Battler Images
 *
 * Allows admin to change battler sprites and save crop settings
 */

-- Add sprite_url column if it doesn't exist (for custom/changed images)
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS sprite_url TEXT;

-- Add portrait_crop column for zoom/offset settings
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS portrait_crop JSONB DEFAULT '{"scale": 1, "offsetX": 0, "offsetY": 0}';

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_battlers_sprite_url ON battlers(sprite_url) WHERE sprite_url IS NOT NULL;

-- ========================================
-- Summary
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '╔═══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║           PORTRAIT COLUMNS ADDED ✅                           ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'New Columns on battlers:';
  RAISE NOTICE '  • sprite_url - custom sprite URL (overrides avatar_url)';
  RAISE NOTICE '  • portrait_crop - JSONB with scale, offsetX, offsetY';
  RAISE NOTICE '';
  RAISE NOTICE 'Dev tools can now:';
  RAISE NOTICE '  • Change battler images';
  RAISE NOTICE '  • Save crop/zoom settings';
  RAISE NOTICE '';
END $$;
