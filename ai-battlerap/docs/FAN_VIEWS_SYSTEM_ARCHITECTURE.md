# Fan & Views System Architecture

**Design Date**: 2025-11-29
**Status**: Design Phase
**Priority**: HIGH - Core progression mechanic

## Overview

The fan/views system tracks battler popularity through:
1. **Fan Base** - Loyal followers who watch their battles
2. **Battle Views** - How many people watch each battle
3. **League Impact** - Big leagues bring more eyeballs
4. **Viral Mechanics** - What makes battles blow up
5. **Scandal/Drama Impact** - Controversy drives viewership

## Database Schema

### Table: battler_fans

Tracks persistent fan base for each battler.

```sql
CREATE TABLE battler_fans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- Fan segments
  total_fans INTEGER NOT NULL DEFAULT 0,
  hardcore_fans INTEGER NOT NULL DEFAULT 0,      -- Watch everything (20-30% of total)
  casual_fans INTEGER NOT NULL DEFAULT 0,        -- Watch if hyped (70-80% of total)

  -- Engagement metrics
  avg_engagement_rate NUMERIC DEFAULT 0.05,      -- % of fans who comment/share
  trending_score INTEGER DEFAULT 0,               -- -100 to +100, affects discoverability

  -- Growth tracking
  fans_last_30_days INTEGER DEFAULT 0,
  fan_growth_rate NUMERIC DEFAULT 0.0,            -- % growth month-over-month

  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(battler_id)
);

CREATE INDEX idx_battler_fans_battler ON battler_fans(battler_id);
CREATE INDEX idx_battler_fans_trending ON battler_fans(trending_score DESC);
```

### Table: battle_views

Tracks views for each battle, per battler (both get credit).

```sql
CREATE TABLE battle_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- View breakdown
  total_views INTEGER NOT NULL DEFAULT 0,

  -- View sources
  from_fan_base INTEGER DEFAULT 0,               -- Existing fans
  from_league_subscribers INTEGER DEFAULT 0,     -- League's built-in audience
  from_viral_discovery INTEGER DEFAULT 0,        -- Recommended/trending
  from_scandal_boost INTEGER DEFAULT 0,          -- Drama-driven views
  from_opponent_fans INTEGER DEFAULT 0,          -- Opponent's fans watching

  -- Engagement
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,

  -- View velocity (for trending detection)
  views_24h INTEGER DEFAULT 0,
  views_7d INTEGER DEFAULT 0,
  views_30d INTEGER DEFAULT 0,

  -- Metadata
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(battle_id, battler_id)
);

CREATE INDEX idx_battle_views_battle ON battle_views(battle_id);
CREATE INDEX idx_battle_views_battler ON battle_views(battler_id);
CREATE INDEX idx_battle_views_total ON battle_views(total_views DESC);
CREATE INDEX idx_battle_views_24h ON battle_views(views_24h DESC);
```

### Table: league_audience

Tracks each league's built-in subscriber base and viewer demographics.

```sql
CREATE TABLE league_audience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,

  -- Audience size
  total_subscribers INTEGER NOT NULL DEFAULT 0,
  avg_views_per_battle INTEGER NOT NULL DEFAULT 0,

  -- Audience demographics (affects what performs well)
  young_hype_percentage NUMERIC DEFAULT 0.25,    -- 0-1, loves performance
  old_heads_percentage NUMERIC DEFAULT 0.25,     -- 0-1, loves technical
  mainstream_percentage NUMERIC DEFAULT 0.25,    -- 0-1, casual fans
  purists_percentage NUMERIC DEFAULT 0.25,       -- 0-1, hardcore fans

  -- Growth metrics
  subscriber_growth_rate NUMERIC DEFAULT 0.0,

  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(league_id)
);

CREATE INDEX idx_league_audience_league ON league_audience(league_id);
```

### Table: battler_view_history

Aggregate view stats per battler over time.

```sql
CREATE TABLE battler_view_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- Period tracking
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly', 'all_time')),
  period_start DATE NOT NULL,
  period_end DATE,

  -- View metrics
  total_views INTEGER NOT NULL DEFAULT 0,
  total_battles INTEGER NOT NULL DEFAULT 0,
  avg_views_per_battle INTEGER NOT NULL DEFAULT 0,

  -- Peak performance
  peak_views_single_battle INTEGER DEFAULT 0,
  peak_battle_id UUID REFERENCES battles(id),

  -- Engagement
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(battler_id, period_type, period_start)
);

CREATE INDEX idx_view_history_battler ON battler_view_history(battler_id);
CREATE INDEX idx_view_history_period ON battler_view_history(period_type, period_start);
```

## View Tier System

**✅ RESEARCH COMPLETE** - Based on versetracker.com analysis (Tru Foe, Loso, T-Top, Charlie Clips, Arsonal, DNA)

### Tier Definitions

```typescript
export enum ViewTier {
  LOW = 'low',           // Grinding, building name
  MID = 'mid',           // Established, has following
  TOP = 'top',           // Major name, draws big numbers
  GOAT = 'goat',         // Legend status, every battle is an event
}

export const VIEW_TIER_THRESHOLDS = {
  // REAL DATA from versetracker.com research
  low: {
    min: 1_000,
    max: 20_000,
    avgReference: 12_925,           // Tru Foe actual average
    description: 'Building reputation, regional/small league'
  },
  mid: {
    min: 50_000,
    max: 200_000,
    avgReference: 129_565,          // Loso actual average
    description: 'Established name, regular URL presence'
  },
  top: {
    min: 300_000,
    max: 800_000,
    avgReference: 577_539,          // T-Top actual average
    description: 'Elite star, URL main events, consistent 300K+'
  },
  goat: {
    min: 600_000,
    max: Infinity,
    avgReference: 1_247_059,        // Charlie Clips actual average
    description: 'Legend, culture icon, routinely 1M+ views'
  }
};

// Function to determine tier
export function getViewTier(avgViews: number): ViewTier {
  if (avgViews >= 1_000_000) return ViewTier.GOAT;
  if (avgViews >= 200_000) return ViewTier.TOP;
  if (avgViews >= 50_000) return ViewTier.MID;
  return ViewTier.LOW;
}
```

### Research Targets

**Battlers to analyze** (from user):
- **Tru Foe** (TRUFOE on versetracker) - MID TIER
- **Loso** - MID TIER
- **T-Top** - TOP TIER

**Metrics to extract**:
1. Average views per battle
2. View range (lowest to highest battle)
3. View velocity (how fast they accumulate)
4. League correlation (which leagues boost views most)

**Current Major Leagues** (from user):
- TBL (Takeover Battle League)
- Bags and Bodies (Hitman Holla's league)
- Easy The Block Captain's league

**Legacy Leagues** (reference only):
- URL (Ultimate Rap League)
- KOTD (King of the Dot)
- RBE (Rare Breed Entertainment) - inactive
- Can't Get A Dot - older

## View Calculation Formula

### Base View Calculation

```typescript
interface ViewCalculationInput {
  battler: Battler;
  opponent: Battler;
  battle: Battle;
  league: League;
  performance: BattlePerformance; // avg_score, peak_score, crowd_reaction
  lifeEvents: LifeEvent[];        // Recent scandals/drama
}

function calculateBattleViews(input: ViewCalculationInput): BattleViews {
  const {
    battler,
    opponent,
    battle,
    league,
    performance,
    lifeEvents
  } = input;

  // 1. FAN BASE CONTRIBUTION
  // Hardcore fans always watch
  const fanBaseViews = (battler.hardcore_fans * 1.0);

  // Casual fans watch based on hype/quality
  const hypeMultiplier = calculateHypeMultiplier(performance, battle.decision_type);
  const casualViews = (battler.casual_fans * hypeMultiplier);

  // 2. LEAGUE SUBSCRIBER CONTRIBUTION
  // League brings its own built-in audience
  const leagueViews = league.avg_views_per_battle * 0.5; // Both battlers share league audience

  // 3. OPPONENT CROSSOVER
  // Some of opponent's fans will watch
  const opponentCrossover = opponent.hardcore_fans * 0.3; // 30% of opponent fans watch

  // 4. VIRAL DISCOVERY BOOST
  const viralBoost = calculateViralBoost(performance, battle, lifeEvents);

  // 5. SCANDAL/DRAMA MULTIPLIER
  const scandalMultiplier = calculateScandalMultiplier(lifeEvents);

  // TOTAL VIEWS
  const baseViews =
    fanBaseViews +
    casualViews +
    leagueViews +
    opponentCrossover;

  const totalViews = Math.round(
    (baseViews + viralBoost) * scandalMultiplier
  );

  return {
    total_views: totalViews,
    from_fan_base: fanBaseViews + casualViews,
    from_league_subscribers: leagueViews,
    from_opponent_fans: opponentCrossover,
    from_viral_discovery: viralBoost,
    from_scandal_boost: Math.round(baseViews * (scandalMultiplier - 1))
  };
}
```

### Hype Multiplier (Casual Fan Conversion)

```typescript
function calculateHypeMultiplier(
  performance: BattlePerformance,
  decisionType: string
): number {
  let multiplier = 0.5; // Base 50% of casual fans watch

  // Decision type impact
  if (decisionType === 'bodybag') {
    multiplier += 0.3; // Dominant wins create hype
  } else if (decisionType === 'classic') {
    multiplier += 0.25; // Great battles get word of mouth
  }

  // Performance quality
  if (performance.peak_score >= 9.0) {
    multiplier += 0.2; // Had a legendary moment
  }

  if (performance.crowd_reaction >= 85) {
    multiplier += 0.15; // Crowd went crazy
  }

  // Choke impact (people watch to see trainwrecks)
  if (performance.choked) {
    multiplier += 0.25; // Controversy drives views
  }

  return Math.min(1.0, multiplier); // Cap at 100%
}
```

### Viral Boost Calculation

```typescript
function calculateViralBoost(
  performance: BattlePerformance,
  battle: Battle,
  lifeEvents: LifeEvent[]
): number {
  let viralViews = 0;

  // VIRAL TRIGGERS

  // 1. PERFECT PERFORMANCE (Rare)
  if (performance.average_score >= 9.0 && performance.peak_score >= 9.5) {
    viralViews += 50_000; // Incredible performance goes viral
  }

  // 2. BODYBAG (Dominant win)
  if (battle.decision_type === 'bodybag') {
    viralViews += 25_000;
  }

  // 3. CHOKE (Trainwreck appeal)
  if (performance.choked) {
    viralViews += 30_000; // People love watching disasters
  }

  // 4. BEEF/DRAMA (From life events)
  const hasBeef = lifeEvents.some(e =>
    e.event_type === 'beef_started' ||
    e.event_type === 'called_out'
  );
  if (hasBeef) {
    viralViews += 40_000; // Beef sells
  }

  // 5. RIVALRY MATCH
  const isRivalry = lifeEvents.some(e => e.metadata?.rivalry === true);
  if (isRivalry) {
    viralViews += 35_000;
  }

  // 6. TOURNAMENT FINAL
  if (battle.tournament_round === 'finals') {
    viralViews += 20_000;
  }

  // 7. COMEBACK STORY
  const isComeback = lifeEvents.some(e => e.event_type === 'comeback');
  if (isComeback) {
    viralViews += 15_000;
  }

  return viralViews;
}
```

### Scandal Multiplier

```typescript
function calculateScandalMultiplier(lifeEvents: LifeEvent[]): number {
  let multiplier = 1.0; // Base: no change

  for (const event of lifeEvents) {
    // Only count recent events (last 30 days)
    const daysSince = getDaysSince(event.occurred_at);
    if (daysSince > 30) continue;

    // Scandal type impact
    switch (event.event_type) {
      case 'cheating_scandal':
        multiplier *= 1.8; // +80% views (people love drama)
        break;

      case 'beef_started':
      case 'called_out':
        multiplier *= 1.6; // +60% views
        break;

      case 'arrest':
      case 'legal_trouble':
        multiplier *= 1.5; // +50% views
        break;

      case 'comeback':
        multiplier *= 1.4; // +40% views (redemption arc)
        break;

      case 'controversial_statement':
        multiplier *= 1.3; // +30% views
        break;

      case 'career_milestone':
        multiplier *= 1.2; // +20% views
        break;
    }
  }

  return Math.min(3.0, multiplier); // Cap at 3x (300% boost max)
}
```

## Fan Growth System

### Fan Acquisition After Battle

```typescript
function updateFansAfterBattle(
  battler: Battler,
  battleViews: BattleViews,
  performance: BattlePerformance,
  league: League
): FanUpdate {

  // CONVERSION RATE: Views → Fans
  // Not everyone who watches becomes a fan

  let baseConversionRate = 0.02; // 2% of viewers become fans

  // PERFORMANCE MODIFIERS

  // Great performance increases conversion
  if (performance.average_score >= 8.0) {
    baseConversionRate *= 1.5; // +50% conversion
  }

  // Peak moments create fans
  if (performance.peak_score >= 9.0) {
    baseConversionRate *= 1.3; // +30% conversion
  }

  // Winning converts more fans
  if (performance.won) {
    baseConversionRate *= 1.2; // +20% conversion
  }

  // Losing badly hurts conversion
  if (performance.decision_type === 'bodybag' && !performance.won) {
    baseConversionRate *= 0.5; // -50% conversion
  }

  // LEAGUE PRESTIGE MODIFIER
  const leaguePrestige = getLeaguePrestige(league);
  baseConversionRate *= leaguePrestige;

  // CALCULATE NEW FANS
  const newFans = Math.round(battleViews.total_views * baseConversionRate);

  // Split into hardcore vs casual (20/80 split)
  const newHardcoreFans = Math.round(newFans * 0.20);
  const newCasualFans = newFans - newHardcoreFans;

  return {
    new_total_fans: newFans,
    new_hardcore_fans: newHardcoreFans,
    new_casual_fans: newCasualFans,
    conversion_rate: baseConversionRate
  };
}

function getLeaguePrestige(league: League): number {
  // PLACEHOLDER - will be based on league.subscriber_base
  // Big leagues = more prestige = better fan conversion

  if (league.avg_views_per_battle >= 500_000) {
    return 1.5; // Major league boost
  } else if (league.avg_views_per_battle >= 100_000) {
    return 1.2; // Mid-tier league
  } else {
    return 1.0; // Small league
  }
}
```

### Fan Retention & Churn

```typescript
// Fans can be LOST due to poor performance or inactivity

function applyFanChurn(
  battler: Battler,
  performance: BattlePerformance,
  daysSinceLastBattle: number
): FanChurn {

  let churnRate = 0.0; // % of fans lost

  // INACTIVITY CHURN
  if (daysSinceLastBattle > 90) {
    churnRate += 0.05; // 5% churn after 3 months inactive
  }

  // POOR PERFORMANCE CHURN
  if (performance.decision_type === 'bodybag' && !performance.won) {
    churnRate += 0.03; // Lose 3% of fans after bad loss
  }

  if (performance.choked) {
    churnRate += 0.02; // Choking loses fans
  }

  // SCANDAL IMPACT (can lose OR gain fans)
  // Cheating scandal loses hardcore fans
  const hasCheatingScandal = battler.recent_events?.some(
    e => e.event_type === 'cheating_scandal'
  );
  if (hasCheatingScandal) {
    churnRate += 0.10; // Lose 10% of hardcore fans
  }

  // Apply churn (casual fans churn faster than hardcore)
  const casualFansLost = Math.round(battler.casual_fans * churnRate * 1.5);
  const hardcoreFansLost = Math.round(battler.hardcore_fans * churnRate * 0.5);

  return {
    casual_fans_lost: casualFansLost,
    hardcore_fans_lost: hardcoreFansLost,
    total_fans_lost: casualFansLost + hardcoreFansLost,
    churn_rate: churnRate
  };
}
```

## League Subscriber Impact

### League Audience Table

Each league has a built-in subscriber base that brings automatic views.

```typescript
interface LeagueAudience {
  league_id: string;
  total_subscribers: number;        // League's total fanbase
  avg_views_per_battle: number;     // How many views league brings

  // Demographic breakdown (affects performance)
  young_hype_percentage: number;    // 0-1, loves performance/energy
  old_heads_percentage: number;     // 0-1, loves technical/wordplay
  mainstream_percentage: number;    // 0-1, casual fans
  purists_percentage: number;       // 0-1, hardcore fans
}

// Example league audiences
const LEAGUE_AUDIENCES = {
  'TBL (Takeover Battle League)': {
    total_subscribers: 500_000,
    avg_views_per_battle: 150_000,
    young_hype_percentage: 0.40,     // Young, hype crowd
    old_heads_percentage: 0.20,
    mainstream_percentage: 0.25,
    purists_percentage: 0.15
  },

  'Small Room Circuit': {
    total_subscribers: 50_000,
    avg_views_per_battle: 15_000,
    young_hype_percentage: 0.15,
    old_heads_percentage: 0.30,      // More old heads in small rooms
    mainstream_percentage: 0.10,
    purists_percentage: 0.45         // Hardcore fans dominate
  }
};
```

### Crowd Demographics Effect

The league's crowd demographics affect how well different content performs:

```typescript
function calculateCrowdDemographicBonus(
  contentUsed: ContentType[],
  deliveryUsed: DeliveryType[],
  leagueAudience: LeagueAudience
): number {

  let bonus = 0;

  // YOUNG HYPE CROWD
  const youngHypeWeight = leagueAudience.young_hype_percentage;
  if (deliveryUsed.includes('aggressive') || deliveryUsed.includes('passionate')) {
    bonus += youngHypeWeight * 0.2; // Performance-heavy content gets boost
  }

  // OLD HEADS
  const oldHeadsWeight = leagueAudience.old_heads_percentage;
  if (contentUsed.includes('wordplay') || contentUsed.includes('schemes')) {
    bonus += oldHeadsWeight * 0.25; // Technical content gets boost
  }

  // MAINSTREAM
  const mainstreamWeight = leagueAudience.mainstream_percentage;
  if (contentUsed.includes('comedy') || contentUsed.includes('pop_culture_refs')) {
    bonus += mainstreamWeight * 0.15; // Accessible content gets boost
  }

  // PURISTS
  const puristWeight = leagueAudience.purists_percentage;
  if (contentUsed.includes('storytelling') || contentUsed.includes('rebuttals')) {
    bonus += puristWeight * 0.20; // Classic battle rap gets boost
  }

  return bonus; // Multiplier to crowd_reaction
}
```

## Viral Mechanics

### What Makes a Battle Go Viral?

Based on battle rap culture analysis:

#### 1. **Perfect Storm** (Multiple viral triggers)
```typescript
const VIRAL_PERFECT_STORM = {
  conditions: [
    'beef_history',        // Already drama between them
    'dominant_performance', // Bodybag or near-perfect
    'shocking_moment',     // Choke, incredible haymaker, or controversy
    'big_league'           // Major platform
  ],
  viralBoost: 200_000    // Massive boost
};
```

#### 2. **Quotable Moment** (Bar goes viral on social media)
```typescript
// If peak_score >= 9.5, battle has a "quotable" moment
// This drives social media shares → more views

if (performance.peak_score >= 9.5) {
  const quotableBoost = 30_000;
  const socialMediaShares = Math.round(quotableBoost * 0.1); // 10% share rate
}
```

#### 3. **Underdog Upset**
```typescript
// Lower-rated battler beats higher-rated = viral appeal

if (winner.rating < loser.rating - 200) { // 200+ rating gap
  viralBoost += 25_000; // Upset story drives clicks
}
```

#### 4. **Controversy/Drama**
```typescript
// Real battle rap examples:
// - Dizaster walking out mid-battle
// - Cassidy's "I will" scheme
// - Math Hoffa punching opponent

const VIRAL_CONTROVERSY_TYPES = {
  choke_spectacular: 20_000,      // Epic fail
  beef_escalation: 40_000,        // Beef gets physical/personal
  career_defining: 35_000,        // Make-or-break moment
  legendary_bar: 30_000,          // Bar that breaks the internet
  disrespect_moment: 25_000       // Line crossing
};
```

#### 5. **Timing & Context**
```typescript
// Battle drops during major event or relates to current drama

const TIMING_MULTIPLIERS = {
  tournament_final: 1.5,          // Championship stakes
  comeback_battle: 1.4,           // Return from hiatus/controversy
  grudge_match: 1.6,              // Settled beef
  title_match: 1.3                // Belt on the line
};
```

## Integration Points

### 1. After Battle Simulation

```typescript
// In simulation.ts, after saveBattleResults()

async function processBattleViews(
  battleId: string,
  battle: Battle,
  playerPerformance: Performance,
  aiPerformance: Performance,
  supabase: any
) {
  // Calculate views for both battlers
  const playerViews = calculateBattleViews({
    battler: playerBattler,
    opponent: aiBattler,
    battle,
    league,
    performance: playerPerformance,
    lifeEvents: recentPlayerEvents
  });

  const aiViews = calculateBattleViews({
    battler: aiBattler,
    opponent: playerBattler,
    battle,
    league,
    performance: aiPerformance,
    lifeEvents: recentAIEvents
  });

  // Save view records
  await supabase.from('battle_views').insert([
    { battle_id: battleId, battler_id: playerBattler.id, ...playerViews },
    { battle_id: battleId, battler_id: aiBattler.id, ...aiViews }
  ]);

  // Update fan counts
  const playerFanUpdate = updateFansAfterBattle(
    playerBattler,
    playerViews,
    playerPerformance,
    league
  );

  const aiFanUpdate = updateFansAfterBattle(
    aiBattler,
    aiViews,
    aiPerformance,
    league
  );

  // Apply updates
  await supabase.from('battler_fans').upsert({
    battler_id: playerBattler.id,
    total_fans: playerBattler.total_fans + playerFanUpdate.new_total_fans,
    hardcore_fans: playerBattler.hardcore_fans + playerFanUpdate.new_hardcore_fans,
    casual_fans: playerBattler.casual_fans + playerFanUpdate.new_casual_fans
  });

  // Same for AI battler...
}
```

### 2. During Tournament Battles

Tournament battles get additional viral boost:

```typescript
if (battle.tournament_id) {
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('current_round, name')
    .eq('id', battle.tournament_id)
    .single();

  if (tournament.current_round === 'finals') {
    viralBoost *= 1.8; // Finals get huge boost
  } else if (tournament.current_round === 'semifinals') {
    viralBoost *= 1.4;
  }
}
```

### 3. Blogger Coverage Impact

Bloggers writing about battles drives additional views:

```typescript
// After news article generation
async function applyBloggerViewBoost(
  battleId: string,
  blogger: Blogger,
  article: NewsArticle
) {
  // Blogger has their own audience
  const bloggerAudienceSize = getBloggerAudience(blogger);

  // Percentage of blogger's audience watches the battle
  const clickThroughRate = 0.15; // 15% of readers watch

  const additionalViews = Math.round(
    bloggerAudienceSize * clickThroughRate
  );

  // Add to battle views
  await supabase.from('battle_views').update({
    from_viral_discovery: from_viral_discovery + additionalViews
  }).eq('battle_id', battleId);
}
```

## UI/UX Display

### Battler Profile Stats

```typescript
// Show on battler profile page
{
  total_fans: "127,432",
  avg_views_per_battle: "82,150",
  view_tier: "MID",
  trending_score: +42,      // Shows as ↗ trending up
  last_battle_views: "156,200",
  career_total_views: "2,458,900"
}
```

### Battle Results Page

```typescript
// Show after battle completes
{
  views: "156,200",
  views_24h: "89,400",      // Fast start = viral potential
  view_sources: {
    "Your Fans": "45,000",
    "League Audience": "62,000",
    "Viral Discovery": "38,000",
    "Opponent Fans": "11,200"
  },
  new_fans_gained: "+1,842"
}
```

## Next Steps

1. ✅ Design complete (this document)
2. ⏳ Research view tiers (versetracker.com)
3. ⏳ Create database migrations
4. ⏳ Implement view calculation service
5. ⏳ Integrate into battle simulation
6. ⏳ Add UI components
7. ⏳ Balance testing

## Research Notes

### To Research on versetracker.com:

**Tru Foe (TRUFOE)** - MID TIER:
- [ ] Average views per battle
- [ ] View range (lowest to highest)
- [ ] Which leagues he battles on most
- [ ] View spike patterns (any viral battles?)

**Loso** - MID TIER:
- [ ] Average views per battle
- [ ] Consistency of views
- [ ] League correlation

**T-Top** - TOP TIER:
- [ ] Average views per battle
- [ ] Premium vs standard battles
- [ ] View floor (lowest views he gets)

### League Analysis:

**TBL (Takeover Battle League)**:
- [ ] Subscriber count
- [ ] Average views per battle
- [ ] Audience demographics (if available)

**Bags and Bodies (Hitman Holla)**:
- [ ] Subscriber count
- [ ] Average views

**Easy The Block Captain**:
- [ ] Subscriber count
- [ ] Average views

## Open Questions

1. **View decay over time?** - Do old battles lose views or keep accumulating?
2. **Rematch multiplier?** - Do rematches get more/less views than first matchups?
3. **Name recognition floor?** - Do big names have a minimum view count regardless of performance?
4. **League switching penalty?** - Does changing leagues affect fan retention?

---

**End of Architecture Document**
