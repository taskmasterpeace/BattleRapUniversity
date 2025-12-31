/**
 * Add Believability Personal Attribute
 *
 * Believability (1-10) measures how believable a battler's tough/street persona is.
 * This affects effectiveness of gun bars, aggression delivery, and intimidation angles.
 *
 * High (8-10): Street credible, gang affiliated, court cases, believable tough guy
 * Medium (5-7): Some credibility but has issues
 * Low (2-4): Intellectual, nerdy, comedy-focused, not believable as tough guy
 */

-- ========================================
-- GOD TIER - Believability
-- ========================================

-- The Architect (Loaded Lux) - 5 (Respected elder, not tough guy persona)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 5}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'The Architect');

-- Tsunami Wave (Tsu Surf) - 9 (Gang member, court case, very believable)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 9}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Tsunami Wave');

-- The Nitro Puncher (Rum Nitty) - 7 (Gun bar specialist, believable delivery)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 7}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'The Nitro Puncher');

-- The Comedian (Charlie Clips) - 3 (Comedy-focused, not tough persona)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 3}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'The Comedian');

-- ========================================
-- TOP TIER - Believability
-- ========================================

-- Compton Kingpin (Geechi Gotti) - 9 (Crip gang member, very street credible)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 9}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Compton Kingpin');

-- Baltimore Rocker (Tay Roc) - 6 (Chain snatched hurts credibility, but aggression overpowers)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 6}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Baltimore Rocker');

-- Daybreak Lit (Daylyt) - 4 (Troll/creative persona, not believable tough guy)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 4}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Daybreak Lit');

-- Hollow Victory (Hollow Da Don) - 7 (Was very believable, still has credibility)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 7}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Hollow Victory');

-- ========================================
-- MID TIER - Believability
-- ========================================

-- The Titan Scribe (JC) - 2 (Nerdy pen gamer, not believable)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 2}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'The Titan Scribe');

-- Boston Scheme King (Chilla Jones) - 3 (Scheme master, intellectual, not street)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 3}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Boston Scheme King');

-- Freestyle Dynasty (DNA) - 6 (Freestyle king, moderately believable)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 6}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Freestyle Dynasty');

-- Money Talk God (Goodz) - 6 (Money talk believable, gun bars not so much)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 6}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Money Talk God');

-- Reference Vault (Ave) - 4 (Pop culture references, not street)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 4}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Reference Vault');

-- Showtime Holla (Hitman Holla) - 6 (Performer more than street, moderate believability)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 6}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Showtime Holla');

-- Punch Wizard (B Magic) - 4 (Technical puncher, not street credible)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 4}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Punch Wizard');

-- Harlem Shiner (K-Shine) - 6 (Moderate street credibility)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 6}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Harlem Shiner');

-- ========================================
-- LOW TIER - Believability
-- ========================================

-- Tru Foe - 8 (War dog persona, believable tough guy)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 8}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Tru Foe');

-- Pontiac Threat (Ill Will) - 6 (Moderate street credibility)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 6}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Pontiac Threat');

-- Newark Aggro (O-Red) - 8 (Street aggressive, very believable)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 8}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Newark Aggro');

-- Strategy Chess (Chess) - 5 (Mid-range believability)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 5}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Strategy Chess');

-- Island Puzzle (Mike P) - 2 (Very nerdy, not believable at all)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 2}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Island Puzzle');

-- Brooklyn Overlooked (Cortez) - 3 (Technical writer, intellectual)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 3}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Brooklyn Overlooked');

-- Soldier Tampa (Loso) - 8 (Military background, street credible)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 8}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Soldier Tampa');

-- Professional Prep (Prep) - 3 (Not believable tough guy)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 3}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Professional Prep');

-- Veteran Journey (Real Deal) - 7 (Veteran status, believable)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 7}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Veteran Journey');

-- Connecticut Grind (Bangz) - 7 (Believable street persona)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 7}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Connecticut Grind');

-- Bar Fest Flow (Footz) - 4 (Fast rapper, not particularly believable)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 4}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Bar Fest Flow');

-- Philly Prospect (Tex Saygo) - 4 (Beginner, not established believability)
UPDATE battler_attributes SET
  personal = personal || '{"believability": 4}'::jsonb
WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Philly Prospect');

-- ========================================
-- Summary Output
-- ========================================

DO $$
DECLARE
  total_count INTEGER;
  avg_believability NUMERIC;
  high_believability INTEGER;
  low_believability INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM battlers WHERE is_ai = true;

  SELECT AVG((ba.personal->>'believability')::int)::numeric(10,2) INTO avg_believability
  FROM battler_attributes ba
  JOIN battlers b ON ba.battler_id = b.id
  WHERE b.is_ai = true;

  SELECT COUNT(*) INTO high_believability
  FROM battler_attributes ba
  JOIN battlers b ON ba.battler_id = b.id
  WHERE b.is_ai = true AND (ba.personal->>'believability')::int >= 8;

  SELECT COUNT(*) INTO low_believability
  FROM battler_attributes ba
  JOIN battlers b ON ba.battler_id = b.id
  WHERE b.is_ai = true AND (ba.personal->>'believability')::int <= 3;

  RAISE NOTICE '╔═══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║          BELIEVABILITY ATTRIBUTE ADDED ✅                     ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'Total AI Battlers: %', total_count;
  RAISE NOTICE 'Average Believability: %', avg_believability;
  RAISE NOTICE 'High Believability (8-10): % battlers', high_believability;
  RAISE NOTICE 'Low Believability (1-3): % battlers', low_believability;
  RAISE NOTICE '';
  RAISE NOTICE 'BELIEVABILITY SCALE:';
  RAISE NOTICE '  9-10: Highly believable street/gang credible (Geechi, Surf)';
  RAISE NOTICE '  7-8:  Believable tough persona (Nitty, Hollow, Tru Foe)';
  RAISE NOTICE '  5-6:  Moderate believability (Tay Roc, DNA, Goodz)';
  RAISE NOTICE '  3-4:  Low believability (Clips, Daylyt, Ave, B Magic)';
  RAISE NOTICE '  1-2:  Very low believability (JC, Mike P - nerdy pen gamers)';
  RAISE NOTICE '';
  RAISE NOTICE 'EFFECT ON SIMULATION:';
  RAISE NOTICE '  High believability boosts:';
  RAISE NOTICE '    - Gun bar content effectiveness';
  RAISE NOTICE '    - Aggressive delivery impact';
  RAISE NOTICE '    - Intimidation angles';
  RAISE NOTICE '  Low believability reduces impact of tough-guy content';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Integrate believability into simulation.ts';
END $$;
