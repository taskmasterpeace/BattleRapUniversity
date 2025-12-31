-- Add image columns to battlers table
-- Migration: 20251130051000_add_battler_images.sql

ALTER TABLE battlers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Note: Storage buckets must be created manually in Supabase Dashboard or via CLI
-- See STORAGE_SETUP.md for instructions
--
-- Required buckets:
-- 1. battler-avatars (public read, 5MB limit, image/jpeg,image/png,image/webp)
-- 2. battler-banners (public read, 10MB limit, image/jpeg,image/png,image/webp)
