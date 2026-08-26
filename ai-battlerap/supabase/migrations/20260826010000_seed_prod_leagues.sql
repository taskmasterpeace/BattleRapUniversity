-- ADDITIVE PROD SEED - STAGE 1: the full 19-league world.
-- Prod had only SRC + MSA. This upserts all 19 leagues (culture-remapped,
-- city-anchored) idempotently by short_code: the 17 missing ones are inserted,
-- the 2 existing are updated to their culture identity. city_id resolves by
-- city NAME (prod city UUIDs differ from local). Safe to re-run.

WITH seed(short_code, name, rounds, crowd, w_write, w_perf, pace, style, payout, prestige, logo, city_name, descr) AS (
  VALUES
    ('STC','Street Cipher',2,0.55,0.55,0.45,5,'street',250,2,'/sprites/leagues/image_1764195528394/league_139.png','New York City','Raw New York street corners. Pure bars, no frills - where unknowns make their names the hard way.'),
    ('IDW','I Do What I Want',2,0.58,0.45,0.55,6,'aggressive',300,2,'/sprites/leagues/image_1764196239271/league_005.png','Houston','Houston''s wild card. Anything goes - shock value, comedy, raw aggression, no rulebook and no apologies.'),
    ('YGS','You Got Smoked',2,0.68,0.40,0.60,5,'aggressive',300,2,'/sprites/leagues/image_1764196086883/league_026.png','Philadelphia','Philadelphia''s body-bag league. Aggression required; the crowd eats hard punchlines and boos the weak out.'),
    ('GIG','Get It Get It',2,0.58,0.48,0.52,7,'street',400,3,'/sprites/leagues/image_1764195933542/league_104.png','Los Angeles','LA''s hustle league. Hungry battlers, tight bookings, everybody chasing the bag and the buzz at once.'),
    ('GBA','Gunbarz Assembly',2,0.60,0.45,0.55,6,'street',350,3,'/sprites/leagues/image_1764196086883/league_025.png','Oakland','Oakland''s gun-bar stronghold. Heavy street imagery and the hardest content in the game rewarded.'),
    ('MIL','Milwaukee Massacre',2,0.62,0.42,0.58,7,'aggressive',400,3,'/sprites/leagues/image_1764196239271/league_004.png','Chicago','Gutter energy out of the Chicago-Milwaukee corridor. Gun-gritty regional pride - no-shows pay heavy here.'),
    ('SLP','Slap',2,0.55,0.45,0.55,7,'street',350,3,'/sprites/leagues/image_1764195933542/league_103.png','Atlanta','Atlanta slap-house. Haymaker bars and gritty energy - one big one can flip the whole room.'),
    ('MMA','Mic Masters Arena',2,0.55,0.62,0.38,10,'technical',800,4,'/sprites/leagues/image_1764196076327/league_049.png','Detroit','Detroit''s proving ground for technical writers. Multis, schemes, layered wordplay - no room for filler.'),
    ('BSL','Barz Supreme League',3,0.55,0.62,0.38,10,'technical',1000,5,'/sprites/leagues/image_1764196076327/league_050.png','Toronto','For true bar-heads. Three-minute rounds mean writing depth wins - no crowd reaction can save weak pen.'),
    ('MSA','Main Stage Arena',3,0.72,0.32,0.68,10,'aggressive',2000,5,'/sprites/leagues/image_1764195537197/league_110.png','Atlanta','Atlanta''s showcase - performance and crowd control decide winners. Stage presence over everything.'),
    ('FSY','Flow Syndicate',3,0.62,0.50,0.50,12,'diverse',1100,5,'/sprites/leagues/image_1764196076327/league_051.png','Houston','Houston''s flow league - pockets, cadence, and delivery rewarded as much as the pen itself.'),
    ('SRC','Small Room Circuit',2,0.45,0.68,0.32,7,'technical',2000,5,'/sprites/leagues/image_1764196076327/league_053.png','London','London''s intimate circuit. Two-minute rounds, wit and wordplay over spectacle - the UK''s writers'' room.'),
    ('SFA','Spitfire Arena',3,0.75,0.48,0.52,14,'aggressive',1300,6,'/sprites/leagues/image_1764196065055/league_078.png','Philadelphia','Philly speed and venom. Rapid-fire haymakers - and the coldest crowd in the country. They do not clap for you.'),
    ('UWL','Urban Warfare League',3,0.60,0.48,0.52,14,'street',1400,6,'/sprites/leagues/image_1764196065055/league_079.png','Oakland','Bay Area battle-tested. Reputation and resilience earned every match - the streets are always watching.'),
    ('BBB','Block Buster Battles',3,0.72,0.42,0.58,14,'aggressive',1500,6,'/sprites/leagues/image_1764196070252/league_072.png','Chicago','Chicago''s big-stage regional. High energy, heavy crowd reaction, premier-bound talent - the Midwest showcase.'),
    ('CCB','Crown City Battle League',3,0.60,0.58,0.42,12,'diverse',1200,6,'/sprites/leagues/image_1764196065055/league_073.png','Toronto','Toronto''s crown-jewel league and the bar capital of the north. Lyricism is king - the pen is respected above the gas.'),
    ('RTC','Respect The Craft',3,0.55,0.68,0.32,18,'technical',3000,8,'/sprites/leagues/image_1764196239271/league_003.png','Detroit','Detroit''s temple of the pen. Scheme kings and dark humor - bring nothing but craft or don''t bother booking.'),
    ('STF','Stay Forever',3,0.70,0.50,0.50,18,'diverse',3500,8,'/sprites/leagues/image_1764196239271/league_001.png','Los Angeles','The West Coast''s career-defining stage. Legacy battles under the lights - this is where you become forever.'),
    ('RWS','Royal Wordsmiths',3,0.70,0.55,0.45,21,'technical',7500,10,'/sprites/leagues/image_1764195526092/league_152.png','New York City','The crown of the whole sport. New York''s main stage - where legends get cemented and the entire culture watches who''s next.')
)
INSERT INTO leagues (
  name, short_code, round_length_minutes, base_crowd_factor, writing_weight,
  performance_weight, booking_pace_days, personality_style, base_payout,
  prestige_level, logo_url, description, city_id
)
SELECT s.name, s.short_code, s.rounds, s.crowd, s.w_write, s.w_perf, s.pace,
       s.style, s.payout, s.prestige, s.logo, s.descr, c.id
FROM seed s
JOIN cities c ON c.name = s.city_name
ON CONFLICT (short_code) DO UPDATE SET
  name = EXCLUDED.name,
  round_length_minutes = EXCLUDED.round_length_minutes,
  base_crowd_factor = EXCLUDED.base_crowd_factor,
  writing_weight = EXCLUDED.writing_weight,
  performance_weight = EXCLUDED.performance_weight,
  booking_pace_days = EXCLUDED.booking_pace_days,
  personality_style = EXCLUDED.personality_style,
  base_payout = EXCLUDED.base_payout,
  prestige_level = EXCLUDED.prestige_level,
  logo_url = EXCLUDED.logo_url,
  description = EXCLUDED.description,
  city_id = EXCLUDED.city_id;
