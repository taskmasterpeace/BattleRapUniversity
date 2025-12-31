-- Populate existing leagues with personality data
-- This gives each league distinct character and audience preferences

-- Small Room Circuit: Technical writing-focused promotion
-- Similar to KOTD/Don't Flop small room battles - emphasis on bars and technical skill
UPDATE leagues
SET
  personality_style = 'technical',
  base_payout = 1500,
  prestige_level = 5,
  audience_favor_lyricism = 80,
  audience_favor_delivery = 60,
  audience_favor_storytelling = 70,
  audience_favor_crowd_engagement = 40
WHERE short_code = 'SMALL_ROOM';

-- Main Stage Arena: Aggressive performance-focused promotion
-- Similar to URL main events - emphasis on crowd reaction and stage presence
UPDATE leagues
SET
  personality_style = 'aggressive',
  base_payout = 3000,
  prestige_level = 7,
  audience_favor_lyricism = 50,
  audience_favor_delivery = 80,
  audience_favor_storytelling = 60,
  audience_favor_crowd_engagement = 85
WHERE short_code = 'MAIN_STAGE';
