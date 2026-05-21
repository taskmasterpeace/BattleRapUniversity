-- =====================================================
-- Player avatar backfill + sprite_id cleanup note
-- =====================================================
-- Date: 2026-05-21
-- Purpose:
--   1. Assign avatar_url to any human-player battlers that still have NULL.
--      We use the legacy "low-numbered" sheet folder image_1764147239421
--      (sprite_001.png .. sprite_040.png) so player characters look
--      visually distinct from the AI roster (which uses sprites 481-880).
--   2. Document that battlers.sprite_id never existed as a column. Several
--      old routes still SELECT it; this migration is the canonical
--      ground truth that the field is dead. The follow-up code refactor
--      kills the remaining references.
-- =====================================================

DO $$
DECLARE
  rec RECORD;
  counter INT := 0;
  sprite_num INT;
BEGIN
  FOR rec IN
    SELECT id FROM battlers WHERE is_ai = FALSE AND avatar_url IS NULL
    ORDER BY created_at, id
  LOOP
    counter := counter + 1;
    -- Pick a deterministic sprite from 1-40 in the legacy player sheet
    sprite_num := ((counter * 13) % 40) + 1;
    UPDATE battlers
    SET avatar_url = '/sprites/characters/image_1764147239421/sprite_' ||
                     LPAD(sprite_num::TEXT, 3, '0') || '.png'
    WHERE id = rec.id;
  END LOOP;
  RAISE NOTICE '✅ Backfilled avatar_url on % human-player battlers', counter;
END $$;

DO $$
DECLARE
  total_players INT;
  total_with_avatar INT;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE avatar_url IS NOT NULL)
  INTO total_players, total_with_avatar
  FROM battlers WHERE is_ai = FALSE;
  RAISE NOTICE '📊 Player battlers: % total, % with avatars', total_players, total_with_avatar;
END $$;
