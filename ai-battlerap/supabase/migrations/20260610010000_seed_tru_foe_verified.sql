-- ═══════════════════════════════════════════════════════════════════════════
-- TRU FOE — FIRST VERIFIED REAL BATTLER (licensed likeness pilot)
--
-- "Tha Solid One" — Northside Chicago. Road warrior (2017-present).
-- Inaugural Midnight Madness War Dog Champion. Beat Geechi Gotti in UM5 R1.
-- Style: gun bars + intricate flows; performs best as the underdog.
-- Sources: VerseTracker, Let's Talk Battle Rap, AllHipHop, URL.
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_chicago UUID;
  v_league UUID;
  v_battler UUID;
BEGIN
  SELECT id INTO v_chicago FROM cities WHERE name = 'Chicago' LIMIT 1;
  -- Home league: highest-prestige league based in Chicago, else any premier league
  SELECT id INTO v_league FROM leagues WHERE city_id = v_chicago LIMIT 1;
  IF v_league IS NULL THEN
    SELECT id INTO v_league FROM leagues ORDER BY base_payout DESC NULLS LAST LIMIT 1;
  END IF;

  -- Skip if already seeded
  SELECT id INTO v_battler FROM battlers WHERE stage_name = 'Tru Foe' AND is_real = true;
  IF v_battler IS NOT NULL THEN
    RAISE NOTICE 'Tru Foe already seeded, skipping';
    RETURN;
  END IF;

  INSERT INTO battlers (
    stage_name, is_ai, is_real, likeness_status, real_name, region, tier,
    primary_league_id, hometown_city_id, current_city_id, avatar_url, bio, style_tags
  ) VALUES (
    'Tru Foe',
    true,            -- AI-driven in sim (not player-owned)
    true,            -- verified real battler
    'licensed',
    NULL,            -- real name withheld unless he wants it shown
    'Chicago',
    'top',
    v_league,
    v_chicago,
    v_chicago,
    '/sprites/characters/real/tru-foe-placeholder.png', -- placeholder until reference photos arrive

    '"Tha Solid One" out of Chicago''s Northside built his name the hard way — no hometown league, just a trunk full of rounds and a decade of pulling up on anybody''s stage from STL to Houston. The inaugural Midnight Madness War Dog Champion announced himself to the mainstream when he sent Geechi Gotti home in the first round of Ultimate Madness 5 — an upset that still gets argued about. Gun bars with intricate flows, conviction you can''t fake, and a habit of performing his best when he''s supposed to lose: Tru Foe doesn''t enter rooms as the favorite. He leaves them as the story.',
    '["Aggressive", "Wordplay", "Battle Tested"]'::jsonb
  )
  RETURNING id INTO v_battler;

  -- Attribute mapping from documented style: gun bars + intricate flows
  -- (high lyricism/flow), conviction + presence (high delivery/stage), and
  -- his defining trait — clutch under pressure (resilience 9).
  INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience)
  VALUES (
    v_battler,
    '{"lyricism": 8, "wordplay": 7, "creativity": 7, "flow": 9}'::jsonb,
    '{"stage_presence": 9, "crowd_control": 8, "delivery": 9}'::jsonb,
    '{"financial_stability": 6, "reputation": 8, "family_bond": 7, "preparation": 8}'::jsonb,
    9
  );

  INSERT INTO rankings (battler_id, rating, wins, losses, streak)
  VALUES (v_battler, 1820, 0, 0, 0);

  -- Real-world accolades (RapVerdict-style, scope = real_world)
  INSERT INTO battler_accolades (battler_id, rank, title, scope, region, year, source) VALUES
    (v_battler, 1,    'Inaugural Midnight Madness War Dog Champion', 'real_world', 'US', 2022, 'AllHipHop'),
    (v_battler, NULL, 'Eliminated Geechi Gotti — Ultimate Madness 5, Round 1', 'real_world', 'US', 2022, 'URL'),
    (v_battler, 1,    'Highest Round Reactions — Ultimate Madness 5 Round 1 (51K)', 'real_world', 'US', 2022, 'URL App'),
    (v_battler, 1,    'Highest Round Reactions — Ultimate Madness 4 Round 1 (29K)', 'real_world', 'US', 2021, 'URL App'),
    (v_battler, NULL, 'URL Proving Grounds Alumni', 'real_world', 'US', 2019, 'URL'),
    (v_battler, NULL, '15+ Leagues Battled — Certified Road Warrior', 'real_world', 'US', 2025, 'VerseTracker');

  RAISE NOTICE '✅ Tru Foe seeded as verified real battler (id %)', v_battler;
END $$;
