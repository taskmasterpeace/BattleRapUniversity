/**
 * Assign Real Badges to AI Battlers
 *
 * Updates all 28 AI battlers with proper badge IDs from all-badges.ts
 * Based on their real-life battle rap counterparts
 */

-- ========================================
-- Add badges column FIRST if doesn't exist
-- ========================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'battlers' AND column_name = 'badges'
  ) THEN
    ALTER TABLE battlers ADD COLUMN badges JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ========================================
-- GOD TIER - Badge Assignments
-- ========================================

-- Lux Coded / The Architect (Loaded Lux)
-- Elite pen gamer, scheme master, metaphor god
UPDATE battlers SET badges = '["bar_god", "metaphor_master", "technical_writer", "scheme_specialist", "respected_veteran"]'::jsonb
WHERE stage_name IN ('The Architect', 'Lux Coded');

-- Nitty Rum / The Gunsmith (Rum Nitty)
-- Punchline king, gun bar specialist, never misses
UPDATE battlers SET badges = '["punchline_king", "gun_bar_specialist", "haymaker_specialist", "consistent_performer", "bars_on_lock"]'::jsonb
WHERE stage_name IN ('The Nitro Puncher', 'Nitty Rum', 'The Gunsmith');

-- Surf Tsu / The Jersey Wave (Tsu Surf)
-- Performance monster, known choker, crowd control god
UPDATE battlers SET badges = '["ring_general", "crowd_favorite", "aggressive_performer", "charismatic", "choker"]'::jsonb
WHERE stage_name IN ('Tsunami Wave', 'Surf Tsu', 'The Jersey Wave');

-- Roc Tay / The Baltimore Puncher (Tay Roc)
-- Energy machine, aggressive, intimidating presence
UPDATE battlers SET badges = '["energy_master", "aggressive_performer", "intimidator", "crowd_hyper", "aggressive_style"]'::jsonb
WHERE stage_name IN ('Baltimore Rocker', 'Roc Tay', 'The Baltimore Puncher');

-- Gotti Geechi / The Compton Crip (Geechi Gotti)
-- Storyteller, pocket checker, street credibility
UPDATE battlers SET badges = '["storyteller", "pocket_checker", "street_battler", "respected_veteran", "clutch_performer"]'::jsonb
WHERE stage_name IN ('Compton Kingpin', 'Gotti Geechi', 'The Compton Crip');

-- Clips Charlie / The Harlem Writer (Charlie Clips)
-- Elite writer + comedy, freestyle genius, never chokes
UPDATE battlers SET badges = '["bar_god", "comedy_battler", "freestyle_artist", "crowd_favorite", "clutch_performer"]'::jsonb
WHERE stage_name IN ('The Comedian', 'Clips Charlie', 'The Harlem Writer');

-- Day Lit / The Creative Troll (Daylyt)
-- Creative genius, unpredictable, but doesn't always prepare
UPDATE battlers SET badges = '["master_wordsmith", "comedy_battler", "freestyle_artist", "gunslinger", "controversial"]'::jsonb
WHERE stage_name IN ('Daybreak Lit', 'Day Lit', 'The Creative Troll');

-- ========================================
-- TOP TIER - Badge Assignments
-- ========================================

-- Hallow The Dawn / The Complete Package (Hollow Da Don)
-- Once elite, now inconsistent, but still dangerous
UPDATE battlers SET badges = '["ring_general", "versatile_writer", "respected_veteran", "slumping", "ring_rust"]'::jsonb
WHERE stage_name IN ('Hollow Victory', 'Hallow The Dawn', 'The Complete Package');

-- JC the Titan / The Pen Titan (JC)
-- Top 3 pen, but struggles with performance
UPDATE battlers SET badges = '["bar_god", "technical_writer", "multi_syllabic", "scheme_specialist", "underrated"]'::jsonb
WHERE stage_name IN ('The Titan Scribe', 'JC the Titan', 'The Pen Titan');

-- Jones Chilla / The Boston Kingpen (Chilla Jones)
-- Scheme master, hardest working, most consistent
UPDATE battlers SET badges = '["scheme_specialist", "multi_syllabic", "consistent_performer", "preparation_monster", "angle_master"]'::jsonb
WHERE stage_name IN ('Boston Scheme King', 'Jones Chilla', 'The Boston Kingpen');

-- DNA the Don / The Freestyle King (DNA)
-- Best freestyler ever, rebuttal king, never chokes
UPDATE battlers SET badges = '["freestyle_artist", "rebuttal_king", "crowd_favorite", "clutch_performer", "viral_battler"]'::jsonb
WHERE stage_name IN ('Freestyle Dynasty', 'DNA the Don', 'The Freestyle King');

-- Goodz the Animal / The Bronx Boss (Goodz)
-- Charismatic, lazy prep, but entertaining
UPDATE battlers SET badges = '["charismatic", "showman", "street_battler", "gunslinger", "ring_rust"]'::jsonb
WHERE stage_name IN ('Money Talk God', 'Goodz the Animal', 'The Bronx Boss');

-- Ave the Puncher / Norfolk Navigator (Ave)
-- Reference king, pop culture master, strong presence
UPDATE battlers SET badges = '["punchline_king", "pop_culture", "sports_bars", "vocal_presence", "consistent_performer"]'::jsonb
WHERE stage_name IN ('Reference Vault', 'Ave the Puncher', 'Norfolk Navigator');

-- Holla Hitman / The St. Louis Showman (Hitman Holla)
-- Performance god, showman, electrifying
UPDATE battlers SET badges = '["crowd_hyper", "showman", "aggressive_performer", "moment_maker", "crowd_favorite"]'::jsonb
WHERE stage_name IN ('Showtime Holla', 'Holla Hitman', 'The St. Louis Showman');

-- Magic B / The St. Louis Magician (B Magic)
-- Punchline wizard but inconsistent and chokes
UPDATE battlers SET badges = '["punchline_king", "clever_writer", "haymaker_specialist", "choker", "ring_rust"]'::jsonb
WHERE stage_name IN ('Punch Wizard', 'Magic B', 'The St. Louis Magician');

-- K the Shine / The Uptown Puncher (K-Shine)
-- Solid all-around, aggressive, consistent
UPDATE battlers SET badges = '["aggressive_performer", "consistent_performer", "energy_master", "street_battler"]'::jsonb
WHERE stage_name IN ('Harlem Shiner', 'K the Shine', 'The Uptown Puncher');

-- Will Ill / The Pontiac Danger (Ill Will)
-- Versatile, dangerous, high risk/reward
UPDATE battlers SET badges = '["versatile_writer", "street_battler", "underdog", "gunslinger"]'::jsonb
WHERE stage_name IN ('Pontiac Threat', 'Will Ill', 'The Pontiac Danger');

-- Red O / The Brick City Puncher (O-Red)
-- Aggressive, believable, heavy puncher
UPDATE battlers SET badges = '["aggressive_performer", "street_battler", "gun_bar_specialist", "intimidator"]'::jsonb
WHERE stage_name IN ('Newark Aggro', 'Red O', 'The Brick City Puncher');

-- Chess the Strategist / The Bronx Tactician (Chess)
-- Flow architect, scheme heavy, improving
UPDATE battlers SET badges = '["scheme_specialist", "structure_savant", "clever_writer", "underrated"]'::jsonb
WHERE stage_name IN ('Strategy Chess', 'Chess the Strategist', 'The Bronx Tactician');

-- P Mike / The Island Writer (Mike P)
-- Puzzle master, layered writer, weak stage presence
UPDATE battlers SET badges = '["layered_writer", "technical_writer", "quotable", "underrated"]'::jsonb
WHERE stage_name IN ('Island Puzzle', 'P Mike', 'The Island Writer');

-- Cortez the Pen / Brooklyn's Most Overlooked (Cortez)
-- Strong pen, slept on, consistent writer
UPDATE battlers SET badges = '["technical_writer", "multi_syllabic", "consistent_performer", "underrated", "gatekeeper"]'::jsonb
WHERE stage_name IN ('Brooklyn Overlooked', 'Cortez the Pen');

-- ========================================
-- MID TIER - Badge Assignments
-- ========================================

-- Foe Tru / The Chicago War Dog (Tru Foe)
-- War ready but stumbles, aggressive
UPDATE battlers SET badges = '["aggressive_style", "street_battler", "gun_bar_specialist", "choker"]'::jsonb
WHERE stage_name IN ('Tru Foe', 'Foe Tru', 'The Chicago War Dog');

-- Loso the Soldier / Tampa's Chess Player (Loso)
-- Solid all-around, consistent
UPDATE battlers SET badges = '["street_battler", "consistent_performer", "underdog"]'::jsonb
WHERE stage_name IN ('Soldier Tampa', 'Loso the Soldier');

-- Prep the Professional / Baltimore's Gentleman (Prep)
-- Technical but limited impact
UPDATE battlers SET badges = '["technical_writer", "wordsmith", "consistent_performer"]'::jsonb
WHERE stage_name IN ('Professional Prep', 'Prep the Professional');

-- ========================================
-- LOW TIER - Badge Assignments
-- ========================================

-- Deal Real / The Pittsburgh Vet (Real Deal)
-- Veteran journeyman, respected
UPDATE battlers SET badges = '["respected_veteran", "journeyman", "consistent_performer", "gatekeeper"]'::jsonb
WHERE stage_name IN ('Veteran Journey', 'Deal Real', 'The Pittsburgh Vet');

-- Bangz the Banger / New Haven Hustler (Bangz)
-- Street credible, mid ceiling
UPDATE battlers SET badges = '["street_battler", "aggressive_style", "underdog"]'::jsonb
WHERE stage_name IN ('Connecticut Grind', 'Bangz the Banger', 'New Haven Hustler');

-- Footz the Fast / The Bar Fest Warrior (Footz)
-- Speed rapper, flow switcher
UPDATE battlers SET badges = '["tempo_master", "multi_syllabic", "street_battler"]'::jsonb
WHERE stage_name IN ('Bar Fest Flow', 'Footz the Fast', 'The Bar Fest Warrior');

-- Saygo Tex / The Philly Underdog (Tex Saygo)
-- Prospect, developing
UPDATE battlers SET badges = '["underdog", "rookie", "street_battler"]'::jsonb
WHERE stage_name IN ('Philly Prospect', 'Saygo Tex', 'The Philly Underdog');

-- ========================================
-- Verify assignments
-- ========================================

DO $$
DECLARE
  battler_count INTEGER;
  badges_assigned INTEGER;
BEGIN
  SELECT COUNT(*) INTO battler_count FROM battlers WHERE is_ai = true;
  SELECT COUNT(*) INTO badges_assigned FROM battlers WHERE is_ai = true AND badges IS NOT NULL AND jsonb_array_length(badges) > 0;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'BADGE ASSIGNMENT COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total AI Battlers: %', battler_count;
  RAISE NOTICE 'Battlers with badges: %', badges_assigned;
  RAISE NOTICE '';
  RAISE NOTICE 'Key assignments:';
  RAISE NOTICE '  - Surf: choker badge (known for choking)';
  RAISE NOTICE '  - B Magic: choker badge (known for choking)';
  RAISE NOTICE '  - Tru Foe: choker badge (stumbles)';
  RAISE NOTICE '  - DNA: freestyle_artist, clutch_performer';
  RAISE NOTICE '  - Clips: clutch_performer (never chokes)';
  RAISE NOTICE '  - Chilla: preparation_monster (hardest working)';
  RAISE NOTICE '========================================';
END $$;
