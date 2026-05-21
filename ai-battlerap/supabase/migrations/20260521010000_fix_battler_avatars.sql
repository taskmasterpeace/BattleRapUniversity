-- =====================================================
-- Fix battler avatar_url paths to point to real sprite files
-- =====================================================
-- Date: 2026-05-21
-- Purpose: The previous seed used /sprites/characters/<folder>/sprite_001.png
-- style paths, but actual sprite filenames are globally numbered (e.g. sprite_841).
-- Each folder holds 40 contiguous sprites:
--   folder index 1 (image_1764146494580): sprite_841 to sprite_880
--   folder index 2 (image_1764146517369): sprite_801 to sprite_840
--   folder index 3 (image_1764146527629): sprite_761 to sprite_800
--   folder index 4 (image_1764146552156): sprite_721 to sprite_760
--   folder index 5 (image_1764146653229): sprite_681 to sprite_720
--   folder index 6 (image_1764146658637): sprite_641 to sprite_680
--   folder index 7 (image_1764146668083): sprite_601 to sprite_640
--   folder index 8 (image_1764146672519): sprite_561 to sprite_600
--   folder index 9 (image_1764146678469): sprite_521 to sprite_560
--   folder index 10 (image_1764146680724): sprite_481 to sprite_520
--
-- Formula: folder N (1-indexed) holds sprites [881 - N*40, 920 - N*40]
-- =====================================================

DO $$
DECLARE
  battler_rec RECORD;
  folder_idx INT;
  folder_path TEXT;
  base_sprite INT;
  sprite_offset INT;
  sprite_num INT;
  counter INT := 0;
  fixed INT := 0;

  folders TEXT[] := ARRAY[
    '/sprites/characters/image_1764146494580',  -- 1: 841-880
    '/sprites/characters/image_1764146517369',  -- 2: 801-840
    '/sprites/characters/image_1764146527629',  -- 3: 761-800
    '/sprites/characters/image_1764146552156',  -- 4: 721-760
    '/sprites/characters/image_1764146653229',  -- 5: 681-720
    '/sprites/characters/image_1764146658637',  -- 6: 641-680
    '/sprites/characters/image_1764146668083',  -- 7: 601-640
    '/sprites/characters/image_1764146672519',  -- 8: 561-600
    '/sprites/characters/image_1764146678469',  -- 9: 521-560
    '/sprites/characters/image_1764146680724'   -- 10: 481-520
  ];

BEGIN
  -- Assign each AI battler a unique avatar deterministically by ID hash.
  FOR battler_rec IN
    SELECT id, stage_name FROM battlers WHERE is_ai = TRUE ORDER BY created_at, id
  LOOP
    counter := counter + 1;
    folder_idx := ((counter - 1) % 10) + 1;
    folder_path := folders[folder_idx];
    -- base sprite for this folder = 881 - folder_idx * 40
    base_sprite := 881 - folder_idx * 40;
    -- offset 0-39 within folder, derived from counter to spread evenly
    sprite_offset := ((counter * 7) % 40);
    sprite_num := base_sprite + sprite_offset;

    UPDATE battlers
    SET avatar_url = folder_path || '/sprite_' || LPAD(sprite_num::TEXT, 3, '0') || '.png'
    WHERE id = battler_rec.id;

    fixed := fixed + 1;
  END LOOP;

  RAISE NOTICE '✅ Fixed avatar_url on % AI battlers', fixed;
END $$;

-- =====================================================
-- Verification: count how many avatars now point to potentially-real files
-- (we can't check filesystem from SQL, but we can verify all are populated)
-- =====================================================
DO $$
DECLARE
  null_count INT;
  with_avatar INT;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE avatar_url IS NULL),
    COUNT(*) FILTER (WHERE avatar_url IS NOT NULL)
  INTO null_count, with_avatar
  FROM battlers WHERE is_ai = TRUE;

  RAISE NOTICE '📊 AI battlers — NULL avatars: %, with avatars: %', null_count, with_avatar;
END $$;
