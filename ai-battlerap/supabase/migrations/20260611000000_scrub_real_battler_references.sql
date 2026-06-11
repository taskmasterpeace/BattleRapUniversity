-- Owner directive (live playtest 2026-06-11): no real battlers or real leagues
-- may be referenced anywhere except Tru Foe himself — "not yet." Scrub his
-- accolades and bio of Geechi Gotti / URL / Ultimate Madness / Midnight
-- Madness while keeping the legend intact.

DO $$
DECLARE
  v_battler UUID;
BEGIN
  SELECT id INTO v_battler FROM battlers WHERE stage_name = 'Tru Foe' AND is_real = true;
  IF v_battler IS NULL THEN
    RAISE NOTICE 'Tru Foe not found, skipping scrub';
    RETURN;
  END IF;

  -- Replace all accolades with anonymized versions
  DELETE FROM battler_accolades WHERE battler_id = v_battler AND scope = 'real_world';

  INSERT INTO battler_accolades (battler_id, rank, title, scope, region, year, source) VALUES
    (v_battler, 1,    'Inaugural Invite-Only Tournament Champion', 'real_world', 'US', 2022, 'verified'),
    (v_battler, NULL, 'Sent a Three-Time Champion Home in Round One', 'real_world', 'US', 2022, 'verified'),
    (v_battler, 1,    'Highest Round Reactions — Major Tournament Round 1 (51K)', 'real_world', 'US', 2022, 'verified'),
    (v_battler, 1,    'Highest Round Reactions — Major Tournament Round 1 (29K)', 'real_world', 'US', 2021, 'verified'),
    (v_battler, NULL, 'Big-League Proving Grounds Alumni', 'real_world', 'US', 2019, 'verified'),
    (v_battler, NULL, '15+ Leagues Battled — Certified Road Warrior', 'real_world', 'US', 2025, 'verified');

  -- Scrubbed bio: same voice, no real names
  UPDATE battlers SET bio =
    '"Tha Solid One" out of Chicago''s Northside built his name the hard way — no hometown league, just a trunk full of rounds and a decade of pulling up on anybody''s stage from St. Louis to Houston. He announced himself to the mainstream by sending a three-time champion home in the first round of a major tournament — an upset that still gets argued about. Gun bars with intricate flows, conviction you can''t fake, and a habit of performing his best when he''s supposed to lose: Tru Foe doesn''t enter rooms as the favorite. He leaves them as the story.'
  WHERE id = v_battler;

  RAISE NOTICE '✅ Real-battler references scrubbed from Tru Foe profile';
END $$;
