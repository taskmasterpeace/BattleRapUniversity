-- LEAGUE CULTURE RE-MAP
-- League->city was an arbitrary round-robin (SLAP read "east coast" while
-- sitting in Detroit; Milwaukee Massacre landed in Toronto). This re-anchors
-- all 19 leagues to real battle-rap geography and rewrites each identity to
-- match the city's actual reputation, grounded in the culture:
--   NYC   = the crown + the gutter (URL/standard-bearer)
--   Detroit = pen/scheme town, dark humor
--   Toronto = bar-forward (KOTD "King of the Dot")
--   London  = wit / wordplay, the writers' room (Don't Flop)
--   Bay/Oakland = street / gun bars
--   Philly  = aggression + the coldest crowd in the country
--   Houston = flow + unpredictable
--   Atlanta = performance / stage presence
--   Chicago = Midwest grit
--   LA      = the legacy stage + the hustle
--
-- writing_weight  = how much "the pen" decides it
-- performance_weight = how much "did he perform it right" decides it
-- base_crowd_factor = crowd volatility / hostility (gas + boos)

WITH remap(name, city_name, descr, w_write, w_perf, crowd) AS (
  VALUES
    -- NEW YORK CITY
    ('Royal Wordsmiths', 'New York City',
     'The crown of the whole sport. New York''s main stage - where legends get cemented and the entire culture watches who''s next.',
     0.55, 0.45, 0.70),
    ('Street Cipher', 'New York City',
     'Raw New York street corners. Pure bars, no frills - where unknowns make their names the hard way.',
     0.55, 0.45, 0.55),

    -- DETROIT - pen town
    ('Respect The Craft', 'Detroit',
     'Detroit''s temple of the pen. Scheme kings and dark humor - bring nothing but craft or don''t bother booking.',
     0.68, 0.32, 0.55),
    ('Mic Masters Arena', 'Detroit',
     'Detroit''s proving ground for technical writers. Multis, schemes, layered wordplay - no room for filler.',
     0.62, 0.38, 0.55),

    -- TORONTO - bar-forward (KOTD)
    ('Crown City Battle League', 'Toronto',
     'Toronto''s crown-jewel league and the bar capital of the north. Lyricism is king - the pen is respected above the gas.',
     0.58, 0.42, 0.60),
    ('Barz Supreme League', 'Toronto',
     'For true bar-heads. Three-minute rounds mean writing depth wins - no crowd reaction can save weak pen.',
     0.62, 0.38, 0.55),

    -- LONDON - wit / wordplay
    ('Small Room Circuit', 'London',
     'London''s intimate circuit. Two-minute rounds, wit and wordplay over spectacle - the UK''s writers'' room.',
     0.68, 0.32, 0.45),

    -- LOS ANGELES - legacy stage + hustle
    ('Stay Forever', 'Los Angeles',
     'The West Coast''s career-defining stage. Legacy battles under the lights - this is where you become forever.',
     0.50, 0.50, 0.70),
    ('Get It Get It', 'Los Angeles',
     'LA''s hustle league. Hungry battlers, tight bookings, everybody chasing the bag and the buzz at once.',
     0.48, 0.52, 0.58),

    -- CHICAGO - Midwest grit
    ('Block Buster Battles', 'Chicago',
     'Chicago''s big-stage regional. High energy, heavy crowd reaction, premier-bound talent - the Midwest showcase.',
     0.42, 0.58, 0.72),
    ('Milwaukee Massacre', 'Chicago',
     'Gutter energy out of the Chicago-Milwaukee corridor. Gun-gritty regional pride - no-shows pay heavy here.',
     0.42, 0.58, 0.62),

    -- ATLANTA - performance / stage presence
    ('Main Stage Arena', 'Atlanta',
     'Atlanta''s showcase - performance and crowd control decide winners. Stage presence over everything.',
     0.32, 0.68, 0.72),
    ('Slap', 'Atlanta',
     'Atlanta slap-house. Haymaker bars and gritty energy - one big one can flip the whole room.',
     0.45, 0.55, 0.55),

    -- HOUSTON - flow + unpredictable
    ('Flow Syndicate', 'Houston',
     'Houston''s flow league - pockets, cadence, and delivery rewarded as much as the pen itself.',
     0.50, 0.50, 0.62),
    ('I Do What I Want', 'Houston',
     'Houston''s wild card. Anything goes - shock value, comedy, raw aggression, no rulebook and no apologies.',
     0.45, 0.55, 0.58),

    -- OAKLAND / BAY - street / gun bars
    ('Urban Warfare League', 'Oakland',
     'Bay Area battle-tested. Reputation and resilience earned every match - the streets are always watching.',
     0.48, 0.52, 0.60),
    ('Gunbarz Assembly', 'Oakland',
     'Oakland''s gun-bar stronghold. Heavy street imagery and the hardest content in the game rewarded.',
     0.45, 0.55, 0.60),

    -- PHILADELPHIA - aggression + the coldest crowd
    ('Spitfire Arena', 'Philadelphia',
     'Philly speed and venom. Rapid-fire haymakers - and the coldest crowd in the country. They do not clap for you.',
     0.48, 0.52, 0.75),
    ('You Got Smoked', 'Philadelphia',
     'Philadelphia''s body-bag league. Aggression required; the crowd eats hard punchlines and boos the weak out.',
     0.40, 0.60, 0.68)
)
UPDATE leagues l
SET city_id = c.id,
    description = r.descr,
    writing_weight = r.w_write,
    performance_weight = r.w_perf,
    base_crowd_factor = r.crowd
FROM remap r
JOIN cities c ON c.name = r.city_name
WHERE l.name = r.name;
