-- THE ONLINE RUNG - text/app battling as the true bottom of the ladder.
-- Real battle rap starts online: forum text battles and recorded app battles
-- are where unknowns build a name before they ever touch a physical stage.
-- These are VIRTUAL (city_id NULL) so they're available to every player
-- regardless of city, and sit below the physical underground (prestige 1).
-- Idempotent by short_code.

INSERT INTO leagues (
  name, short_code, round_length_minutes, base_crowd_factor, writing_weight,
  performance_weight, booking_pace_days, personality_style, base_payout,
  prestige_level, logo_url, description, city_id
) VALUES
  ('Text Wars', 'TXW', 2, 0.10, 0.85, 0.15, 3, 'technical', 100, 1,
   '/sprites/leagues/image_1764196076327/league_053.png',
   'The forums. No stage, no crowd, just pens. Pure writing travels on text alone - where a scheme makes your name before you ever touch a mic.',
   NULL),
  ('The App', 'APP', 2, 0.30, 0.55, 0.45, 3, 'diverse', 150, 1,
   '/sprites/leagues/image_1764195933542/league_104.png',
   'Recorded battles straight to the timeline. Camera in your face, no live crowd - go viral or go home. The internet is the judge.',
   NULL)
ON CONFLICT (short_code) DO UPDATE SET
  round_length_minutes = EXCLUDED.round_length_minutes,
  base_crowd_factor = EXCLUDED.base_crowd_factor,
  writing_weight = EXCLUDED.writing_weight,
  performance_weight = EXCLUDED.performance_weight,
  personality_style = EXCLUDED.personality_style,
  base_payout = EXCLUDED.base_payout,
  prestige_level = EXCLUDED.prestige_level,
  description = EXCLUDED.description,
  city_id = EXCLUDED.city_id;
