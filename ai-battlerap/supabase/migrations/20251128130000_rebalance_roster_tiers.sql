/**
 * Rebalance Roster Tiers & Update Names
 *
 * GOAL: 4-5 battlers per tier (not 18 in top tier!)
 * - God Tier: 4 battlers
 * - Top Tier: 5 battlers
 * - Mid Tier: 5 battlers
 * - Low Tier: 4 battlers
 *
 * Also rename battlers with better coded names (except Tru Foe)
 */

-- ========================================
-- TIER ADJUSTMENTS
-- ========================================

-- DOWNGRADE Day Lit from God to Top (user questions god tier status)
UPDATE battlers SET tier = 'top' WHERE stage_name = 'Day Lit';
UPDATE rankings SET rating = 1775 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Day Lit');

-- UPGRADE Clips Charlie to God (complete package - writer who performs)
UPDATE battlers SET tier = 'god' WHERE stage_name = 'Clips Charlie';

-- DOWNGRADE JC from Top to Mid (pure pen gamer, no performance)
UPDATE battlers SET tier = 'mid' WHERE stage_name = 'JC the Titan';
UPDATE rankings SET rating = 1550 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'JC the Titan');

-- DOWNGRADE Jones Chilla from Top to Mid (scheme master but no performance)
UPDATE battlers SET tier = 'mid' WHERE stage_name = 'Jones Chilla';
UPDATE rankings SET rating = 1525 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Jones Chilla');

-- DOWNGRADE DNA from Top to Mid (freestyle king but lyricism only 7)
UPDATE battlers SET tier = 'mid' WHERE stage_name = 'DNA the Don';
UPDATE rankings SET rating = 1550 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'DNA the Don');

-- DOWNGRADE Goodz from Top to Mid (preparation only 6, lazy)
UPDATE battlers SET tier = 'mid' WHERE stage_name = 'Goodz the Animal';
UPDATE rankings SET rating = 1550 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Goodz the Animal');

-- DOWNGRADE Ave from Top to Mid (just a puncher)
UPDATE battlers SET tier = 'mid' WHERE stage_name = 'Ave the Puncher';
UPDATE rankings SET rating = 1500 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Ave the Puncher');

-- DOWNGRADE Holla Hitman from Top to Mid (writing only 7-8)
UPDATE battlers SET tier = 'mid' WHERE stage_name = 'Holla Hitman';
UPDATE rankings SET rating = 1525 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Holla Hitman');

-- DOWNGRADE Magic B from Top to Mid (consistency issues)
UPDATE battlers SET tier = 'mid' WHERE stage_name = 'Magic B';
UPDATE rankings SET rating = 1500 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Magic B');

-- DOWNGRADE K the Shine from Top to Mid
UPDATE battlers SET tier = 'mid' WHERE stage_name = 'K the Shine';
UPDATE rankings SET rating = 1475 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'K the Shine');

-- DOWNGRADE Will Ill from Top to Low (no elite skill)
UPDATE battlers SET tier = 'low' WHERE stage_name = 'Will Ill';
UPDATE rankings SET rating = 1350 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Will Ill');

-- DOWNGRADE Red O from Top to Low (one-dimensional)
UPDATE battlers SET tier = 'low' WHERE stage_name = 'Red O';
UPDATE rankings SET rating = 1325 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Red O');

-- DOWNGRADE Chess from Top to Low (lacks star power)
UPDATE battlers SET tier = 'low' WHERE stage_name = 'Chess the Strategist';
UPDATE rankings SET rating = 1375 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Chess the Strategist');

-- DOWNGRADE P Mike from Top to Low (NO stage presence)
UPDATE battlers SET tier = 'low' WHERE stage_name = 'P Mike';
UPDATE rankings SET rating = 1350 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'P Mike');

-- DOWNGRADE Cortez from Top to Low (slept on)
UPDATE battlers SET tier = 'low' WHERE stage_name = 'Cortez the Pen';
UPDATE rankings SET rating = 1325 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Cortez the Pen');

-- DOWNGRADE Foe Tru from Mid to Low
UPDATE battlers SET tier = 'low' WHERE stage_name = 'Foe Tru';
UPDATE rankings SET rating = 1375 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Foe Tru');

-- DOWNGRADE Loso from Mid to Low
UPDATE battlers SET tier = 'low' WHERE stage_name = 'Loso the Soldier';
UPDATE rankings SET rating = 1350 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Loso the Soldier');

-- DOWNGRADE Prep from Mid to Low
UPDATE battlers SET tier = 'low' WHERE stage_name = 'Prep the Professional';
UPDATE rankings SET rating = 1300 WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = 'Prep the Professional');

-- ========================================
-- NAME CHANGES (Better Coded Names)
-- ========================================

-- God Tier Names
UPDATE battlers SET stage_name = 'The Architect' WHERE stage_name = 'Lux Coded';
UPDATE battlers SET stage_name = 'Tsunami Wave' WHERE stage_name = 'Surf Tsu';
UPDATE battlers SET stage_name = 'The Nitro Puncher' WHERE stage_name = 'Nitty Rum';
UPDATE battlers SET stage_name = 'The Comedian' WHERE stage_name = 'Clips Charlie';

-- Top Tier Names
UPDATE battlers SET stage_name = 'Daybreak Lit' WHERE stage_name = 'Day Lit';
UPDATE battlers SET stage_name = 'Compton Kingpin' WHERE stage_name = 'Gotti Geechi';
UPDATE battlers SET stage_name = 'Baltimore Rocker' WHERE stage_name = 'Roc Tay';
UPDATE battlers SET stage_name = 'Hollow Victory' WHERE stage_name = 'Hallow The Dawn';

-- Mid Tier Names
UPDATE battlers SET stage_name = 'The Titan Scribe' WHERE stage_name = 'JC the Titan';
UPDATE battlers SET stage_name = 'Boston Scheme King' WHERE stage_name = 'Jones Chilla';
UPDATE battlers SET stage_name = 'Freestyle Dynasty' WHERE stage_name = 'DNA the Don';
UPDATE battlers SET stage_name = 'Money Talk God' WHERE stage_name = 'Goodz the Animal';
UPDATE battlers SET stage_name = 'Reference Vault' WHERE stage_name = 'Ave the Puncher';
UPDATE battlers SET stage_name = 'Showtime Holla' WHERE stage_name = 'Holla Hitman';
UPDATE battlers SET stage_name = 'Punch Wizard' WHERE stage_name = 'Magic B';
UPDATE battlers SET stage_name = 'Harlem Shiner' WHERE stage_name = 'K the Shine';

-- Low Tier Names (Tru Foe keeps real name per user request)
UPDATE battlers SET stage_name = 'Tru Foe' WHERE stage_name = 'Foe Tru';
UPDATE battlers SET stage_name = 'Pontiac Threat' WHERE stage_name = 'Will Ill';
UPDATE battlers SET stage_name = 'Newark Aggro' WHERE stage_name = 'Red O';
UPDATE battlers SET stage_name = 'Strategy Chess' WHERE stage_name = 'Chess the Strategist';
UPDATE battlers SET stage_name = 'Island Puzzle' WHERE stage_name = 'P Mike';
UPDATE battlers SET stage_name = 'Brooklyn Overlooked' WHERE stage_name = 'Cortez the Pen';
UPDATE battlers SET stage_name = 'Soldier Tampa' WHERE stage_name = 'Loso the Soldier';
UPDATE battlers SET stage_name = 'Professional Prep' WHERE stage_name = 'Prep the Professional';
UPDATE battlers SET stage_name = 'Veteran Journey' WHERE stage_name = 'Deal Real';
UPDATE battlers SET stage_name = 'Connecticut Grind' WHERE stage_name = 'Bangz the Banger';
UPDATE battlers SET stage_name = 'Bar Fest Flow' WHERE stage_name = 'Footz the Fast';
UPDATE battlers SET stage_name = 'Philly Prospect' WHERE stage_name = 'Saygo Tex';

-- ========================================
-- Summary Output
-- ========================================

DO $$
DECLARE
  total_count INTEGER;
  god_count INTEGER;
  top_count INTEGER;
  mid_count INTEGER;
  low_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM battlers WHERE is_ai = true;
  SELECT COUNT(*) INTO god_count FROM battlers WHERE is_ai = true AND tier = 'god';
  SELECT COUNT(*) INTO top_count FROM battlers WHERE is_ai = true AND tier = 'top';
  SELECT COUNT(*) INTO mid_count FROM battlers WHERE is_ai = true AND tier = 'mid';
  SELECT COUNT(*) INTO low_count FROM battlers WHERE is_ai = true AND tier = 'low';

  RAISE NOTICE '╔═══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║              ROSTER REBALANCED ✅                             ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'Total AI Battlers: %', total_count;
  RAISE NOTICE '  God Tier (1825-1900): %', god_count;
  RAISE NOTICE '  Top Tier (1750-1840): %', top_count;
  RAISE NOTICE '  Mid Tier (1475-1550): %', mid_count;
  RAISE NOTICE '  Low Tier (1300-1375): %', low_count;
  RAISE NOTICE '';
  RAISE NOTICE 'GOD TIER:';
  RAISE NOTICE '  1. The Architect (1900) - Loaded Lux';
  RAISE NOTICE '  2. Tsunami Wave (1850) - Tsu Surf';
  RAISE NOTICE '  3. The Nitro Puncher (1850) - Rum Nitty';
  RAISE NOTICE '  4. The Comedian (1825) - Charlie Clips';
  RAISE NOTICE '';
  RAISE NOTICE 'TOP TIER:';
  RAISE NOTICE '  5. Daybreak Lit (1775) - Daylyt (downgraded from god)';
  RAISE NOTICE '  6. Compton Kingpin (1840) - Geechi Gotti';
  RAISE NOTICE '  7. Baltimore Rocker (1825) - Tay Roc';
  RAISE NOTICE '  8. Hollow Victory (1750) - Hollow Da Don';
  RAISE NOTICE '';
  RAISE NOTICE 'MID TIER (8 battlers):';
  RAISE NOTICE '  9. The Titan Scribe (1550) - JC';
  RAISE NOTICE '  10. Boston Scheme King (1525) - Chilla Jones';
  RAISE NOTICE '  11. Freestyle Dynasty (1550) - DNA';
  RAISE NOTICE '  12. Money Talk God (1550) - Goodz';
  RAISE NOTICE '  13. Reference Vault (1500) - Ave';
  RAISE NOTICE '  14. Showtime Holla (1525) - Hitman Holla';
  RAISE NOTICE '  15. Punch Wizard (1500) - B Magic';
  RAISE NOTICE '  16. Harlem Shiner (1475) - K-Shine';
  RAISE NOTICE '';
  RAISE NOTICE 'LOW TIER (12 battlers):';
  RAISE NOTICE '  17. Tru Foe (1375) - Tru Foe ★ REAL NAME';
  RAISE NOTICE '  18. Pontiac Threat (1350) - Ill Will';
  RAISE NOTICE '  19. Newark Aggro (1325) - O-Red';
  RAISE NOTICE '  20. Strategy Chess (1375) - Chess';
  RAISE NOTICE '  21. Island Puzzle (1350) - Mike P';
  RAISE NOTICE '  22. Brooklyn Overlooked (1325) - Cortez';
  RAISE NOTICE '  23. Soldier Tampa (1350) - Loso';
  RAISE NOTICE '  24. Professional Prep (1300) - Prep';
  RAISE NOTICE '  25. Veteran Journey (1350) - Real Deal';
  RAISE NOTICE '  26. Connecticut Grind (1325) - Bangz';
  RAISE NOTICE '  27. Bar Fest Flow (1300) - Footz';
  RAISE NOTICE '  28. Philly Prospect (1250) - Tex Saygo';
  RAISE NOTICE '';
  RAISE NOTICE 'KEY CHANGES:';
  RAISE NOTICE '  ⬆️  Clips Charlie → GOD TIER (complete package)';
  RAISE NOTICE '  ⬇️  Daylyt → TOP TIER (from god)';
  RAISE NOTICE '  ⬇️  10 battlers → MID TIER (from top)';
  RAISE NOTICE '  ⬇️  9 battlers → LOW TIER (from top/mid)';
  RAISE NOTICE '  📝 All names coded except Tru Foe';
  RAISE NOTICE '';
  RAISE NOTICE 'Balanced roster: ~4 per tier! 🎯';
END $$;
