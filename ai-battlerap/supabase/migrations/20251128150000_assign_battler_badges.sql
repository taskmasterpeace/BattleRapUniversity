/**
 * Assign Badges to AI Battlers
 *
 * Assigns style_tags (badges) to all 28 AI battlers based on their archetypes.
 * Each battler gets 3-5 badges that define their strengths, weaknesses, and playstyle.
 */

-- ========================================
-- GOD TIER - Badge Assignments
-- ========================================

-- The Architect (Loaded Lux) - Elite pen, technical writing, schemes
UPDATE battlers SET style_tags = '["Pen Game Elite", "Metaphor Master", "Technical Writer", "Scheme Specialist", "Respected Veteran"]'::jsonb
WHERE stage_name = 'The Architect';

-- Tsunami Wave (Tsu Surf) - Performance beast, crowd favorite, aggressive
UPDATE battlers SET style_tags = '["Stage Domination", "Crowd Favorite", "Believable Persona", "Aggressive Battler", "Known Choker"]'::jsonb
WHERE stage_name = 'Tsunami Wave';

-- The Nitro Puncher (Rum Nitty) - Punchline king, gun bars, technical wordplay
UPDATE battlers SET style_tags = '["Punchline King\\Queen", "Gun Bar Specialist", "Wordplay Wizard", "Technical Writer"]'::jsonb
WHERE stage_name = 'The Nitro Puncher';

-- The Comedian (Charlie Clips) - Comedy, crowd pleaser, versatile, writer who performs
UPDATE battlers SET style_tags = '["Comedy King\\Queen", "Crowd Favorite", "Freestyle Genius", "Creativity Beast"]'::jsonb
WHERE stage_name = 'The Comedian';

-- ========================================
-- TOP TIER - Badge Assignments
-- ========================================

-- Compton Kingpin (Geechi Gotti) - Street credible, storytelling, believable
UPDATE battlers SET style_tags = '["Believable Persona", "Storyteller", "Angle Master", "Respected Veteran"]'::jsonb
WHERE stage_name = 'Compton Kingpin';

-- Baltimore Rocker (Tay Roc) - Energy machine, aggressive, stage presence
UPDATE battlers SET style_tags = '["Stage Domination", "Aggressive Battler", "Crowd Favorite", "Energy Machine"]'::jsonb
WHERE stage_name = 'Baltimore Rocker';

-- Daybreak Lit (Daylyt) - Creative troll, freestyle genius, unpredictable, but choker
UPDATE battlers SET style_tags = '["Creativity Beast", "Freestyle Genius", "Comedy King\\Queen", "Known Choker", "Unprepared"]'::jsonb
WHERE stage_name = 'Daybreak Lit';

-- Hollow Victory (Hollow Da Don) - Past his prime, versatile, but lazy prep
UPDATE battlers SET style_tags = '["Versatile Battler", "Respected Veteran", "Clutch Performer", "Unprepared", "Past His Prime"]'::jsonb
WHERE stage_name = 'Hollow Victory';

-- ========================================
-- MID TIER - Badge Assignments
-- ========================================

-- The Titan Scribe (JC) - Pure pen gamer, technical, no performance
UPDATE battlers SET style_tags = '["Technical Writer", "Pen Game Elite", "Scheme Specialist", "Stage Fright", "Overcomplicated"]'::jsonb
WHERE stage_name = 'The Titan Scribe';

-- Boston Scheme King (Chilla Jones) - Scheme master, wordplay, technical
UPDATE battlers SET style_tags = '["Scheme Specialist", "Wordplay Wizard", "Multisyllabic Master", "Consistent Writer"]'::jsonb
WHERE stage_name = 'Boston Scheme King';

-- Freestyle Dynasty (DNA) - Freestyle king, never chokes, rebuttal specialist
UPDATE battlers SET style_tags = '["Freestyle Genius", "Rebuttal King\\Queen", "Crowd Favorite", "Consistent Performer"]'::jsonb
WHERE stage_name = 'Freestyle Dynasty';

-- Money Talk God (Goodz) - Lazy prep, charismatic, but inconsistent
UPDATE battlers SET style_tags = '["Charismatic Charmer", "Believable Persona", "Unprepared", "Lazy Writer"]'::jsonb
WHERE stage_name = 'Money Talk God';

-- Reference Vault (Ave) - Pop culture punches, one-dimensional
UPDATE battlers SET style_tags = '["Punchline King\\Queen", "Reference Heavy", "One-Trick Pony"]'::jsonb
WHERE stage_name = 'Reference Vault';

-- Showtime Holla (Hitman Holla) - Aggressive performer, delivery beast
UPDATE battlers SET style_tags = '["Aggressive Battler", "Stage Domination", "Delivery Beast", "Energy Machine"]'::jsonb
WHERE stage_name = 'Showtime Holla';

-- Punch Wizard (B Magic) - Technical puncher, but inconsistent and choker
UPDATE battlers SET style_tags = '["Punchline King\\Queen", "Wordplay Wizard", "Known Choker", "Inconsistent"]'::jsonb
WHERE stage_name = 'Punch Wizard';

-- Harlem Shiner (K-Shine) - Solid all-around, no elite skills
UPDATE battlers SET style_tags = '["Aggressive Battler", "Consistent Writer", "Believable Persona"]'::jsonb
WHERE stage_name = 'Harlem Shiner';

-- ========================================
-- LOW TIER - Badge Assignments
-- ========================================

-- Tru Foe - War dog, believable street persona, aggressive
UPDATE battlers SET style_tags = '["Believable Persona", "Aggressive Battler", "Gun Bar Specialist"]'::jsonb
WHERE stage_name = 'Tru Foe';

-- Pontiac Threat (Ill Will) - Balanced, no standout features
UPDATE battlers SET style_tags = '["Consistent Writer", "Versatile Battler"]'::jsonb
WHERE stage_name = 'Pontiac Threat';

-- Newark Aggro (O-Red) - Aggressive, believable, but one-dimensional
UPDATE battlers SET style_tags = '["Aggressive Battler", "Believable Persona", "Gun Bar Specialist", "One-Trick Pony"]'::jsonb
WHERE stage_name = 'Newark Aggro';

-- Strategy Chess (Chess) - Scheme-heavy, lacks star power
UPDATE battlers SET style_tags = '["Scheme Specialist", "Technical Writer", "Stage Fright"]'::jsonb
WHERE stage_name = 'Strategy Chess';

-- Island Puzzle (Mike P) - Nerdy pen gamer, terrible performer
UPDATE battlers SET style_tags = '["Technical Writer", "Pen Game Elite", "Stage Fright", "Overcomplicated", "Weak Stage Presence"]'::jsonb
WHERE stage_name = 'Island Puzzle';

-- Brooklyn Overlooked (Cortez) - Underrated pen, overlooked
UPDATE battlers SET style_tags = '["Technical Writer", "Pen Game Elite", "Multisyllabic Master", "Stage Fright"]'::jsonb
WHERE stage_name = 'Brooklyn Overlooked';

-- Soldier Tampa (Loso) - Street credible, believable
UPDATE battlers SET style_tags = '["Believable Persona", "Aggressive Battler", "Gun Bar Specialist"]'::jsonb
WHERE stage_name = 'Soldier Tampa';

-- Professional Prep (Prep) - Ironically unprepared, technical writer
UPDATE battlers SET style_tags = '["Technical Writer", "Unprepared", "Lazy Writer"]'::jsonb
WHERE stage_name = 'Professional Prep';

-- Veteran Journey (Real Deal) - Old school veteran, consistent
UPDATE battlers SET style_tags = '["Respected Veteran", "Consistent Writer", "Believable Persona"]'::jsonb
WHERE stage_name = 'Veteran Journey';

-- Connecticut Grind (Bangz) - Street credible, aggressive
UPDATE battlers SET style_tags = '["Believable Persona", "Aggressive Battler", "Gun Bar Specialist"]'::jsonb
WHERE stage_name = 'Connecticut Grind';

-- Bar Fest Flow (Footz) - Speed rapper, fast flow
UPDATE battlers SET style_tags = '["Speed Demon", "Multisyllabic Master", "Delivery Beast"]'::jsonb
WHERE stage_name = 'Bar Fest Flow';

-- Philly Prospect (Tex Saygo) - Beginner, developing skills
UPDATE battlers SET style_tags = '["Consistent Writer", "Developing"]'::jsonb
WHERE stage_name = 'Philly Prospect';

-- ========================================
-- Summary Output
-- ========================================

DO $$
DECLARE
  total_battlers INTEGER;
  battlers_with_badges INTEGER;
  total_badges_assigned INTEGER;
  avg_badges_per_battler NUMERIC;
BEGIN
  SELECT COUNT(*) INTO total_battlers FROM battlers WHERE is_ai = true;

  SELECT COUNT(*) INTO battlers_with_badges
  FROM battlers
  WHERE is_ai = true AND jsonb_array_length(style_tags) > 0;

  SELECT SUM(jsonb_array_length(style_tags)) INTO total_badges_assigned
  FROM battlers
  WHERE is_ai = true;

  avg_badges_per_battler := total_badges_assigned::numeric / NULLIF(total_battlers, 0);

  RAISE NOTICE '╔═══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║              BADGES ASSIGNED TO AI BATTLERS ✅                ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'Total AI Battlers: %', total_battlers;
  RAISE NOTICE 'Battlers with Badges: %', battlers_with_badges;
  RAISE NOTICE 'Total Badges Assigned: %', total_badges_assigned;
  RAISE NOTICE 'Average Badges per Battler: %', ROUND(avg_badges_per_battler, 2);
  RAISE NOTICE '';
  RAISE NOTICE 'BADGE DISTRIBUTION:';
  RAISE NOTICE '  God Tier: Elite badges (Pen Game Elite, Crowd Favorite, Stage Domination)';
  RAISE NOTICE '  Top Tier: Strong badges + some weaknesses (Known Choker, Unprepared)';
  RAISE NOTICE '  Mid Tier: Mix of positive/negative badges';
  RAISE NOTICE '  Low Tier: Mostly negative badges (Stage Fright, Lazy Writer, One-Trick Pony)';
  RAISE NOTICE '';
  RAISE NOTICE 'KEY BADGES ASSIGNED:';
  RAISE NOTICE '  Punchline King\Queen: Nitty, Ave, B Magic';
  RAISE NOTICE '  Freestyle Genius: Clips, Daylyt, DNA';
  RAISE NOTICE '  Known Choker: Surf, Daylyt, B Magic';
  RAISE NOTICE '  Believable Persona: Geechi, Surf, Tru Foe, Newark Aggro';
  RAISE NOTICE '  Stage Domination: Surf, Tay Roc, Hitman';
  RAISE NOTICE '  Technical Writer: Lux, JC, Mike P, Cortez';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Test badges in battle simulation';
END $$;
