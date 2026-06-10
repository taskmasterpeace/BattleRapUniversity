-- ============================================================================
-- Seed News Articles for initial content
-- ============================================================================

-- Insert sample news articles
INSERT INTO news_articles (slug, title, type, body_markdown, meta_json, published_at)
VALUES
(
  'welcome-to-algorithm-institute',
  'Welcome to the Battle Rap University',
  'league_update',
  '## A New Era Begins

The Battle Rap University is now open for business. This isn''t your typical battle league - this is where careers are made, legends are born, and the culture evolves.

### Two Leagues, Two Paths

**Small Room Circuit (SRC)** - For the writers. 2-minute rounds where every bar counts. Technical lyricism, intricate wordplay, and complex schemes reign supreme here.

**Main Stage Arena (MSA)** - For the performers. 3-minute rounds where crowd control matters. Stage presence, energy, and showmanship determine your fate.

### Rise Through the Ranks

Start as a hungry up-and-comer facing Low Tier opponents. Prove yourself and advance to Mid Tier competition. Dominate there, and the Top Tier awaits - where only the elite survive.

The path to greatness starts now. Which league will you conquer first?',
  '{"category": "announcement", "featured": true}'::jsonb,
  NOW() - INTERVAL '7 days'
),
(
  'small-room-circuit-championship-announced',
  'BREAKING: Small Room Circuit Championship Tournament Announced',
  'league_update',
  '## 16 Battlers. $25,000. One Champion.

The Small Room Circuit has officially announced its first major tournament - a 16-battler single elimination bracket with a $25,000 prize pool.

### Tournament Details

- **Entry**: Low and Mid Tier battlers only
- **Format**: Single elimination, standard 3-round battles
- **Prize Pool**: $25,000 total
  - 1st Place: 50% ($12,500)
  - 2nd Place: 25% ($6,250)
  - Semi-finalists: 12.5% each ($3,125)

### Registration Opens Soon

Registration opens next week. Only 16 spots available - first come, first served for qualifying battlers.

This is your chance to prove you belong among the elite. Will you answer the call?',
  '{"category": "tournament", "featured": true}'::jsonb,
  NOW() - INTERVAL '3 days'
),
(
  'top-10-power-rankings-week-1',
  'Power Rankings: Top 10 Battlers to Watch',
  'power_ranking',
  '## Week 1 Power Rankings

The first official power rankings of Battle Rap University are in. Here''s who''s making noise:

### TOP 10

1. **Main Event** (MSA) - The total package. Can write AND perform at an elite level.
2. **Wordsmith Elite** (SRC) - Pure pen game. His wordplay is on another level.
3. **Angle Master** (SRC) - Nobody digs deeper. His angles are surgical.
4. **Performance King** (MSA) - Theatrics and aggression make him appointment viewing.
5. **Stage Commander** (MSA) - Gun bars and stage presence for days.
6. **Lyric Storm** (SRC) - West Coast wordplay wizard rising fast.
7. **Clever Scheme** (SRC) - Midwest representation with elite multisyllabic schemes.
8. **Hype Beast** (MSA) - Comedy and crowd work make him dangerous.
9. **Young Pattern** (SRC) - Up-and-comer with storytelling ability beyond his years.
10. **Crowd Killa** (MSA) - Name says it all - the crowd loves this guy.

### Ones to Watch

Keep an eye on new faces entering the scene. The next legend could be signing up right now.',
  '{"category": "rankings", "week": 1}'::jsonb,
  NOW() - INTERVAL '1 day'
),
(
  'prep-guide-how-to-win-battles',
  'Prep Guide: How Champions Prepare for Battle',
  'career_update',
  '## The Secret to Winning: Preparation

Every battler thinks they can wing it. Champions know better.

### The Five Pillars of Prep

**1. RESEARCH** - Know your opponent. Their style, their weaknesses, their past battles. The more you know, the sharper your angles.

**2. WRITING** - Craft your bars. Push your wordplay. Perfect your schemes. Writing days directly boost your lyricism and creativity.

**3. PERFORMANCE** - Practice delivery. Work on stage presence. The best bars mean nothing if you can''t perform them.

**4. REST** - Protect your mental. Fatigue leads to chokes. Rest days keep your resilience high and your mind sharp.

**5. LIFE** - Handle your business outside of battle rap. Family, finances, personal matters - ignoring them catches up eventually.

### The Winning Formula

There''s no perfect formula. SRC battlers might focus 60% on writing. MSA performers might prioritize performance and rest.

Find what works for you. But whatever you do - don''t show up unprepared.

**The crowd remembers chokes forever.**',
  '{"category": "guide", "featured": false}'::jsonb,
  NOW() - INTERVAL '5 days'
);

-- Verify insertion
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM news_articles;
  RAISE NOTICE 'Total news articles after seed: %', v_count;
END $$;
