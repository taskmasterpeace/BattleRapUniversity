-- ADDITIVE PROD SEED - STAGE 2: reinforce the AI roster.
-- Idempotent: inserts the 68 canonical named battlers across the 17 leagues,
-- skipping any stage_name OR avatar_url already present (battlers.avatar_url is
-- UNIQUE - faces are exclusive). Each new battler gets tier-appropriate
-- attributes + rankings + city assignment + a distinct unclaimed avatar.

DO $$
DECLARE
  rec RECORD; lg RECORD; bid UUID;
  vtier TEXT; vrating INT;
  w JSONB; p JSONB; per JSONB; res INT; tags JSONB; reg TEXT;
  added INT := 0;
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
    ('GBA','Iron Clip',1,'/sprites/characters/image_1764146494580/sprite_842.png'),
    ('GBA','Glock Talk',2,'/sprites/characters/image_1764146494580/sprite_843.png'),
    ('GBA','Steel Lyric',3,'/sprites/characters/image_1764146494580/sprite_844.png'),
    ('GBA','Trigger Pen',4,'/sprites/characters/image_1764146494580/sprite_846.png'),
    ('IDW','Wild Card Will',1,'/sprites/characters/image_1764146494580/sprite_847.png'),
    ('IDW','No Rules Ronnie',2,'/sprites/characters/image_1764146494580/sprite_849.png'),
    ('IDW','Off Script',3,'/sprites/characters/image_1764146494580/sprite_850.png'),
    ('IDW','Anything Goes',4,'/sprites/characters/image_1764146494580/sprite_851.png'),
    ('STC','Block Veteran',1,'/sprites/characters/image_1764146494580/sprite_852.png'),
    ('STC','Pavement Poet',2,'/sprites/characters/image_1764146494580/sprite_853.png'),
    ('STC','Corner Code',3,'/sprites/characters/image_1764146494580/sprite_855.png'),
    ('STC','Concrete Truth',4,'/sprites/characters/image_1764146494580/sprite_856.png'),
    ('YGS','Body Bag Bryan',1,'/sprites/characters/image_1764146494580/sprite_857.png'),
    ('YGS','Smoke Out',2,'/sprites/characters/image_1764146494580/sprite_858.png'),
    ('YGS','Punchline Reaper',3,'/sprites/characters/image_1764146494580/sprite_859.png'),
    ('YGS','Bag Em Up',4,'/sprites/characters/image_1764146494580/sprite_860.png'),
    ('GIG','Hustle Hayes',1,'/sprites/characters/image_1764146494580/sprite_861.png'),
    ('GIG','Bag Chaser',2,'/sprites/characters/image_1764146494580/sprite_862.png'),
    ('GIG','Grind Mode',3,'/sprites/characters/image_1764146494580/sprite_863.png'),
    ('GIG','Bread Winner',4,'/sprites/characters/image_1764146494580/sprite_864.png'),
    ('MIL','Brew City Beast',1,'/sprites/characters/image_1764146494580/sprite_865.png'),
    ('MIL','Cream City Killer',2,'/sprites/characters/image_1764146494580/sprite_866.png'),
    ('MIL','Midwest Menace',3,'/sprites/characters/image_1764146494580/sprite_867.png'),
    ('MIL','Lake Effect',4,'/sprites/characters/image_1764146494580/sprite_869.png'),
    ('SLP','Backhand Bishop',1,'/sprites/characters/image_1764146494580/sprite_870.png'),
    ('SLP','Slap Master',2,'/sprites/characters/image_1764146494580/sprite_871.png'),
    ('SLP','Right Cross',3,'/sprites/characters/image_1764146494580/sprite_872.png'),
    ('SLP','Knockout Nas',4,'/sprites/characters/image_1764146494580/sprite_873.png'),
    ('MMA','Technical Tony',1,'/sprites/characters/image_1764146494580/sprite_874.png'),
    ('MMA','Precision Penn',2,'/sprites/characters/image_1764146494580/sprite_875.png'),
    ('MMA','Schematic Sage',3,'/sprites/characters/image_1764146494580/sprite_876.png'),
    ('MMA','Multi Master',4,'/sprites/characters/image_1764146494580/sprite_877.png'),
    ('BSL','Bar Architect',1,'/sprites/characters/image_1764146494580/sprite_879.png'),
    ('BSL','Verse Vault',2,'/sprites/characters/image_1764146494580/sprite_880.png'),
    ('BSL','Punchline Professor',3,'/sprites/characters/image_1764146517369/sprite_801.png'),
    ('BSL','Scheme Genius',4,'/sprites/characters/image_1764146517369/sprite_802.png'),
    ('FSY','Cadence King',1,'/sprites/characters/image_1764146517369/sprite_803.png'),
    ('FSY','Rhythm Reign',2,'/sprites/characters/image_1764146517369/sprite_804.png'),
    ('FSY','Pocket Master',3,'/sprites/characters/image_1764146517369/sprite_806.png'),
    ('FSY','Flow Frequency',4,'/sprites/characters/image_1764146517369/sprite_807.png'),
    ('BBB','Box Office Bryan',1,'/sprites/characters/image_1764146517369/sprite_808.png'),
    ('BBB','Blockbuster Boss',2,'/sprites/characters/image_1764146517369/sprite_809.png'),
    ('BBB','Main Event Mike',3,'/sprites/characters/image_1764146517369/sprite_810.png'),
    ('BBB','Premier Performer',4,'/sprites/characters/image_1764146517369/sprite_811.png'),
    ('CCB','Stage Royalty',1,'/sprites/characters/image_1764146517369/sprite_812.png'),
    ('CCB','Crowd Conductor',2,'/sprites/characters/image_1764146517369/sprite_813.png'),
    ('CCB','Spotlight Sage',3,'/sprites/characters/image_1764146517369/sprite_814.png'),
    ('CCB','Crown Holder',4,'/sprites/characters/image_1764146517369/sprite_816.png'),
    ('SFA','Rapid Fire Rico',1,'/sprites/characters/image_1764146517369/sprite_817.png'),
    ('SFA','Velocity Vinny',2,'/sprites/characters/image_1764146517369/sprite_818.png'),
    ('SFA','Sprint Spitter',3,'/sprites/characters/image_1764146517369/sprite_819.png'),
    ('SFA','Triple Time',4,'/sprites/characters/image_1764146517369/sprite_820.png'),
    ('UWL','War Vet Wesley',1,'/sprites/characters/image_1764146517369/sprite_821.png'),
    ('UWL','Battle Tested',2,'/sprites/characters/image_1764146517369/sprite_822.png'),
    ('UWL','Frontline Fury',3,'/sprites/characters/image_1764146517369/sprite_823.png'),
    ('UWL','Combat Cole',4,'/sprites/characters/image_1764146517369/sprite_824.png'),
    ('RTC','Craft Marcus',1,'/sprites/characters/image_1764146517369/sprite_825.png'),
    ('RTC','Pen Pope',2,'/sprites/characters/image_1764146517369/sprite_826.png'),
    ('RTC','Lyric Legend',3,'/sprites/characters/image_1764146517369/sprite_827.png'),
    ('RTC','Bar God Bishop',4,'/sprites/characters/image_1764146517369/sprite_828.png'),
    ('STF','Eternal Erik',1,'/sprites/characters/image_1764146517369/sprite_829.png'),
    ('STF','Legacy Lou',2,'/sprites/characters/image_1764146517369/sprite_830.png'),
    ('STF','Forever Foe',3,'/sprites/characters/image_1764146517369/sprite_831.png'),
    ('STF','Immortal Ink',4,'/sprites/characters/image_1764146517369/sprite_832.png'),
    ('RWS','Crown Calvin',1,'/sprites/characters/image_1764146517369/sprite_833.png'),
    ('RWS','Royal Rage',2,'/sprites/characters/image_1764146517369/sprite_834.png'),
    ('RWS','King Karver',3,'/sprites/characters/image_1764146517369/sprite_836.png'),
    ('RWS','Throne Talker',4,'/sprites/characters/image_1764146517369/sprite_837.png')
    ) AS t(sc, nm, slot, avatar)
  LOOP
    IF EXISTS (SELECT 1 FROM battlers WHERE stage_name = rec.nm) THEN CONTINUE; END IF;
    IF EXISTS (SELECT 1 FROM battlers WHERE avatar_url = rec.avatar) THEN CONTINUE; END IF;
    SELECT l.id, l.city_id, l.prestige_level, l.personality_style, c.name AS city_name
      INTO lg FROM leagues l LEFT JOIN cities c ON c.id = l.city_id
      WHERE l.short_code = rec.sc;
    IF lg.id IS NULL THEN CONTINUE; END IF;

    IF lg.prestige_level <= 3 THEN
      vtier := CASE WHEN rec.slot<=2 THEN 'low' WHEN rec.slot=3 THEN 'mid' ELSE 'top' END;
      vrating := CASE WHEN rec.slot<=2 THEN 1100+rec.slot*50 WHEN rec.slot=3 THEN 1300 ELSE 1500 END;
    ELSIF lg.prestige_level <= 6 THEN
      vtier := CASE WHEN rec.slot=1 THEN 'low' WHEN rec.slot<=3 THEN 'mid' ELSE 'top' END;
      vrating := CASE WHEN rec.slot=1 THEN 1250 WHEN rec.slot<=3 THEN 1450+(rec.slot-2)*50 ELSE 1650 END;
    ELSIF lg.prestige_level <= 8 THEN
      vtier := CASE WHEN rec.slot=1 THEN 'mid' WHEN rec.slot<=3 THEN 'top' ELSE 'god' END;
      vrating := CASE WHEN rec.slot=1 THEN 1500 WHEN rec.slot<=3 THEN 1700+(rec.slot-2)*50 ELSE 1850 END;
    ELSE
      vtier := CASE WHEN rec.slot<=2 THEN 'top' ELSE 'god' END;
      vrating := CASE WHEN rec.slot<=2 THEN 1700+rec.slot*25 ELSE 1850+(rec.slot-2)*25 END;
    END IF;

    CASE vtier
      WHEN 'low' THEN
        w := jsonb_build_object('lyricism',3,'wordplay',3,'creativity',4,'flow',4);
        p := jsonb_build_object('stage_presence',3,'crowd_control',3,'delivery',4);
        per := jsonb_build_object('financial_stability',3,'reputation',2,'family_bond',5,'preparation',4);
        res := 4;
      WHEN 'mid' THEN
        w := jsonb_build_object('lyricism',5,'wordplay',5,'creativity',5,'flow',6);
        p := jsonb_build_object('stage_presence',5,'crowd_control',5,'delivery',6);
        per := jsonb_build_object('financial_stability',5,'reputation',5,'family_bond',6,'preparation',5);
        res := 6;
      WHEN 'top' THEN
        w := jsonb_build_object('lyricism',7,'wordplay',7,'creativity',7,'flow',8);
        p := jsonb_build_object('stage_presence',7,'crowd_control',7,'delivery',8);
        per := jsonb_build_object('financial_stability',7,'reputation',8,'family_bond',6,'preparation',7);
        res := 7;
      ELSE
        w := jsonb_build_object('lyricism',9,'wordplay',9,'creativity',8,'flow',9);
        p := jsonb_build_object('stage_presence',9,'crowd_control',9,'delivery',9);
        per := jsonb_build_object('financial_stability',8,'reputation',10,'family_bond',6,'preparation',8);
        res := 8;
    END CASE;

    tags := CASE lg.personality_style
      WHEN 'street' THEN '["gun_bars","angles"]'::jsonb
      WHEN 'aggressive' THEN '["gun_bars","wordplay"]'::jsonb
      WHEN 'technical' THEN '["wordplay","storytelling"]'::jsonb
      ELSE '["wordplay","freestyle"]'::jsonb END;

    reg := CASE lg.city_name
      WHEN 'New York City' THEN 'East Coast' WHEN 'Philadelphia' THEN 'East Coast'
      WHEN 'Detroit' THEN 'Midwest' WHEN 'Chicago' THEN 'Midwest'
      WHEN 'Atlanta' THEN 'South' WHEN 'Houston' THEN 'South'
      WHEN 'Los Angeles' THEN 'West Coast' WHEN 'Oakland' THEN 'West Coast'
      ELSE 'International' END;

    INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier, region,
                          style_tags, avatar_url, current_city_id, hometown_city_id)
    VALUES (rec.nm, lg.id, TRUE, vtier, reg, tags, rec.avatar, lg.city_id, lg.city_id)
    RETURNING id INTO bid;
    INSERT INTO battler_attributes (battler_id, writing, performance, personal, resilience, public_knowledge)
    VALUES (bid, w, p, per, res, 20);
    INSERT INTO rankings (battler_id, rating, wins, losses, streak)
    VALUES (bid, vrating, 0, 0, 0);
    added := added + 1;
  END LOOP;
  RAISE NOTICE 'Reinforced roster: added % battlers', added;
END $$;
