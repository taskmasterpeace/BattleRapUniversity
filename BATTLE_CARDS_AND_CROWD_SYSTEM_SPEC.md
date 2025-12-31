# BATTLE CARDS & CROWD COMPOSITION SYSTEM
## Design Specification for New Features

Based on user request and battle rap research.

---

## 1. BATTLE CARDS / EVENTS SYSTEM

### Concept

Real battle rap events feature **multiple battles on one card**. Example: URL's NOME XI had 10 battles.

**Card Structure:**
- **Main Event** = Headliner (top of card, highest-rated battlers)
- **Co-Main Event** = Secondary feature
- **Undercard** = Opening battles (lower card position)

**Why This Matters:**
- Multiple battles happen on same night
- Card position affects payout and prestige
- Bloggers cover entire events, not just individual battles
- Fans attend events, not battles

### Database Schema

```sql
CREATE TABLE battle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- "Night of Main Events XIV"
  slug TEXT NOT NULL UNIQUE,             -- "nome-14"
  league_id UUID NOT NULL REFERENCES leagues(id),
  venue_name TEXT,                       -- "Underground Cipher Spot"
  venue_location TEXT,                   -- "Brooklyn, NY"
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
  total_battles INTEGER NOT NULL DEFAULT 0,
  expected_attendance INTEGER,           -- Crowd size
  ticket_revenue DECIMAL(10, 2),         -- Event economics
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Modify battles table
ALTER TABLE battles
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES battle_events(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS card_position INTEGER,  -- 1 = main event, higher = undercard
ADD COLUMN IF NOT EXISTS card_label TEXT;        -- "MAIN EVENT", "CO-MAIN", "UNDERCARD"

CREATE INDEX idx_battles_event ON battles(event_id, card_position);
```

### Card Position Rules

**Main Event (Position 1)**:
- Highest combined ELO ratings
- Payout multiplier: **1.5x**
- Highest prestige gain
- Primary blogger focus

**Co-Main Event (Position 2)**:
- Second-highest ratings
- Payout multiplier: **1.25x**
- Secondary blogger focus

**Undercard (Positions 3+)**:
- Lower-rated battlers
- Payout multiplier: **1.0x**
- Mentioned in event recaps

### Event UI Flow

**Player Experience:**

1. **Event Browse Page** (`/events`)
```tsx
<EventCard>
  <h2>Night of Main Events XIV</h2>
  <p>March 15, 2025 • Underground Cipher Spot • Brooklyn, NY</p>
  <p>10 battles • Main Stage Arena</p>

  <BattleList>
    MAIN EVENT: Seed #1 vs Seed #2 (1500 ELO vs 1480 ELO)
    CO-MAIN: Seed #3 vs Seed #4 (1450 ELO vs 1420 ELO)
    UNDERCARD: 8 more battles...
  </BattleList>

  <Button>View Full Card</Button>
  <Button>My Battle (Position #5)</Button>
</EventCard>
```

2. **Event Detail Page** (`/events/nome-14`)
```tsx
<EventHeader>
  NIGHT OF MAIN EVENTS XIV
  March 15, 2025 | 8:00 PM EST
  Underground Cipher Spot, Brooklyn NY

  Crowd Expected: 500 battle rap fans
  Ticket Sales: $12,500
</EventHeader>

<BattleCard position={1} label="MAIN EVENT">
  WORDSMITH (1450) vs SHOWTIME (1420)
  Small Room Circuit • 2-minute rounds
  Payout: $4,500 (Main Event 1.5x)
  [PREP BATTLE] [VIEW DETAILS]
</BattleCard>

<BattleCard position={2} label="CO-MAIN EVENT">
  THE VETERAN (1400) vs THE CHOKER (1380)
  Payout: $3,750 (Co-Main 1.25x)
  [VIEW DETAILS]
</BattleCard>

<BattleCard position={3-10} label="UNDERCARD">
  <!-- 8 more battles -->
</BattleCard>

<CrowdComposition>
  🎭 Crowd Profile: "Bar-Heavy Heads"
  • 60% prefer lyrical content
  • 30% prefer performance
  • 10% casual fans
</CrowdComposition>
```

3. **After Event Completion**
```tsx
<EventRecap>
  NOME XIV RESULTS

  Main Event: WORDSMITH def. SHOWTIME (2-1)
  Co-Main: THE CHOKER def. THE VETERAN (3-0)
  Undercard Results: [6-2-2 record for favorites]

  Top Moment: WORDSMITH's R2 haymaker (8.6 score)
  Biggest Upset: UNDERDOG def. RISING STAR

  [READ FULL EVENT RECAP BLOG]
</EventRecap>
```

### Event Blogger Coverage

**Event Recap Article Structure:**

```typescript
interface EventRecap {
  eventId: string;
  eventName: string;
  eventDate: string;
  venueName: string;
  totalBattles: number;
  mainEventResult: string;
  coMainEventResult: string;
  undercardSummary: string;
  topMoments: string[];  // Best haymakers, biggest upsets
  crowdReaction: string;  // Overall atmosphere
  standoutPerformers: string[];
}
```

**Example Event Recap:**

> **NOME XIV DELIVERS INSTANT CLASSICS**
>
> Brooklyn's Underground Cipher Spot was PACKED Saturday night for Night of Main Events XIV, and the card delivered from top to bottom.
>
> **MAIN EVENT: WORDSMITH VS SHOWTIME**
> The headline battle lived up to the hype. WORDSMITH took it 2-1 in an EDGE battle that had the crowd split. Round 2's haymaker (8.6 score) from WORDSMITH was THE moment of the night—500 people ERUPTED. SHOWTIME's performance nearly stole it, but the bars won out in Small Room.
>
> **CO-MAIN: THE CHOKER SHEDS THE NAME**
> THE CHOKER 3-0'd THE VETERAN in a statement performance. ZERO chokes. Two haymakers. 78% crowd reaction. The narrative writes itself.
>
> **UNDERCARD CHAOS**
> Position #7 gave us the upset of the night: UNDERDOG (1150 ELO) stunned RISING STAR (1380) with a 2-1 decision. The crowd went WILD for the heart the underdog showed.
>
> **THE VERDICT**
> NOME XIV: 10 battles, 8 finishes, 2 crowd-splitting decisions. This is why we love battle rap. See you at NOME XV.

---

## 2. CROWD COMPOSITION SYSTEM

### Concept

Not all crowds are the same. A **Small Room underground crowd** values different things than a **Main Stage arena crowd**.

### Crowd Types

```typescript
enum CrowdType {
  BAR_HEAVY_HEADS = 'bar_heavy_heads',      // Underground cipher heads
  PERFORMANCE_CROWD = 'performance_crowd',   // Arena/Main Stage fans
  CASUAL_MIXED = 'casual_mixed',             // General entertainment seekers
  TOURNAMENT_PURISTS = 'tournament_purists', // Competitive-minded fans
  HYPE_CROWD = 'hype_crowd',                 // Energy/aggression focused
}

interface CrowdComposition {
  type: CrowdType;
  demographics: {
    lyrical_preference: number;      // 0-100, how much they value bars
    performance_preference: number;  // 0-100, how much they value delivery
    entertainment_preference: number; // 0-100, how much they want a show
  };
  base_energy: number;                // 0-100, starting enthusiasm
  volatility: number;                 // 0-100, how quickly they swing
  haymaker_bonus: number;             // Multiplier for big moments
  choke_penalty: number;              // Penalty severity for mistakes
}
```

### Crowd Profiles

**1. Bar-Heavy Heads** (Small Room Circuit default)
```json
{
  "type": "bar_heavy_heads",
  "demographics": {
    "lyrical_preference": 80,
    "performance_preference": 40,
    "entertainment_preference": 50
  },
  "base_energy": 60,
  "volatility": 40,
  "haymaker_bonus": 1.3,
  "choke_penalty": 0.7
}
```
*These crowds VALUE wordplay, multi-syllabic rhymes, and schemes. Performance matters less. They'll react BIG to haymakers but are forgiving of stumbles if the bars are there.*

**2. Performance Crowd** (Main Stage Arena default)
```json
{
  "type": "performance_crowd",
  "demographics": {
    "lyrical_preference": 50,
    "performance_preference": 85,
    "entertainment_preference": 75
  },
  "base_energy": 75,
  "volatility": 60,
  "haymaker_bonus": 1.5,
  "choke_penalty": 1.2
}
```
*Arena crowds want A SHOW. Stage presence, delivery, crowd control. They'll POP for big moments and TURN on you if you choke.*

**3. Casual Mixed** (Non-league events, exhibitions)
```json
{
  "type": "casual_mixed",
  "demographics": {
    "lyrical_preference": 40,
    "performance_preference": 70,
    "entertainment_preference": 90
  },
  "base_energy": 50,
  "volatility": 30,
  "haymaker_bonus": 1.2,
  "choke_penalty": 0.5
}
```
*Casual fans don't catch every bar. They want entertainment. Performance > Writing. Forgiving of mistakes.*

**4. Tournament Purists** (Tournaments)
```json
{
  "type": "tournament_purists",
  "demographics": {
    "lyrical_preference": 70,
    "performance_preference": 60,
    "entertainment_preference": 50
  },
  "base_energy": 70,
  "volatility": 50,
  "haymaker_bonus": 1.4,
  "choke_penalty": 1.5
}
```
*Tournament crowds are INVESTED. They value both bars and performance. HARSH on chokes (tournament pressure). BIG reactions to haymakers.*

**5. Hype Crowd** (Special events, rivalries)
```json
{
  "type": "hype_crowd",
  "demographics": {
    "lyrical_preference": 55,
    "performance_preference": 80,
    "entertainment_preference": 95
  },
  "base_energy": 90,
  "volatility": 80,
  "haymaker_bonus": 1.8,
  "choke_penalty": 1.4
}
```
*High-energy crowds for grudge matches or big rivalries. ELECTRIC atmosphere. Massive haymaker reactions. Will TURN on chokers.*

### Crowd Reaction Formula (Updated)

```typescript
function calculateSegmentCrowdReaction(
  segmentScore: number,
  battlerPerformance: number,
  crowdComposition: CrowdComposition,
  eventFlags: string[]
): number {
  // Base reaction from score
  let reaction = (segmentScore / 10) * 100;

  // Adjust based on crowd preferences
  const writingFactor = battlerWritingPower * (crowdComposition.demographics.lyrical_preference / 100);
  const performanceFactor = battlerPerformancePower * (crowdComposition.demographics.performance_preference / 100);

  reaction = reaction * 0.4 + writingFactor * 30 + performanceFactor * 30;

  // Apply haymaker bonus
  if (eventFlags.includes('haymaker')) {
    reaction *= crowdComposition.haymaker_bonus;
  }

  // Apply choke penalty
  if (eventFlags.includes('choke')) {
    reaction *= crowdComposition.choke_penalty;
  }

  // Base energy modifier
  reaction = reaction * (crowdComposition.base_energy / 100);

  // Clamp to 0-100
  return Math.max(0, Math.min(100, reaction));
}
```

### Crowd Feedback UI

**During Battle (If we add inter-round visibility):**

```tsx
<CrowdMeter>
  <div className="crowd-profile">
    🎭 CROWD: Bar-Heavy Heads
    Preference: 80% Lyrics, 40% Performance
  </div>

  <div className="crowd-reaction-r1">
    After Round 1:
    Favoring YOU: 74% reaction
    Favoring Opponent: 55% reaction

    Crowd Mood: 🔥 HYPED (Your haymaker in S2!)
  </div>
</CrowdMeter>
```

**In Battle Results:**

```tsx
<CrowdAnalysis>
  CROWD BREAKDOWN

  Type: Bar-Heavy Heads (Small Room)
  Preference: Lyrics (80%), Performance (40%)

  Your Performance:
  ├─ Lyrical Appeal: ✅ STRONG (Your 9.0 wordplay matched their taste)
  ├─ Performance Appeal: ⚠️ MODERATE (5.0 stage presence, not their priority)
  └─ Overall Reaction: 73% (Above average)

  Opponent Performance:
  ├─ Lyrical Appeal: ⚠️ WEAK (6.0 wordplay, not enough bars)
  ├─ Performance Appeal: ✅ STRONG (8.0 delivery, but crowd didn't prioritize it)
  └─ Overall Reaction: 55% (Below average)

  VERDICT: Your bar-focused approach matched this crowd perfectly.
  If this were Main Stage Arena (Performance Crowd), results might differ.
</CrowdAnalysis>
```

### Crowd-Based Badges

New badges that interact with crowd system:

- **Crowd Chameleon**: +20% crowd reaction in all crowd types
- **Underground Favorite**: +30% crowd reaction with Bar-Heavy Heads
- **Arena Master**: +30% crowd reaction with Performance Crowds
- **Crowd Killer**: Haymakers get +25% crowd bonus (stacks with crowd type bonus)
- **Pressure Proof**: Choke penalty reduced by 50% in Hype Crowds

---

## 3. INTER-ROUND FEEDBACK SYSTEM

### Concept

Players should see feedback BETWEEN rounds, not just after the whole battle.

### Battle Flow (Updated)

**Current**: Battle simulates all 3 rounds → show all results at once

**Proposed**: Battle simulates round-by-round → show results incrementally

### UI Flow

**After Round 1 Completes:**

```tsx
<RoundResult round={1}>
  🎤 ROUND 1 COMPLETE

  <YourPerformance>
    Your Score: 7.75
    ├─ Average: 7.75
    ├─ Peak: 8.5 (HAYMAKER in Segment 2!)
    ├─ Consistency: 0.52 (Good)
    └─ Segments: [7.2, 8.5, 7.8, 7.5]
  </YourPerformance>

  <OpponentPerformance>
    Opponent Score: 5.65
    ├─ Average: 5.65
    ├─ Peak: 6.1
    ├─ Consistency: 0.36
    └─ Segments: [5.2, 6.1, 5.8, 5.5]
  </OpponentPerformance>

  <CrowdFeedback>
    🔥 CROWD REACTION
    Favoring YOU: 74%
    Favoring Opponent: 55%

    Crowd Profile: Bar-Heavy Heads
    • Your haymaker in S2 got them HYPED (85% spike)
    • Your bars are connecting with this crowd
  </CrowdFeedback>

  <RoundVerdict>
    ✅ YOU WON ROUND 1
    Leading 1-0
  </RoundVerdict>

  <MomentumMeter>
    ████████████░░░░ +0.85 (DOMINATING)
  </MomentumMeter>

  <button>Continue to Round 2</button>
</RoundResult>
```

**Before Round 2 Begins:**

```tsx
<RoundPreview round={2}>
  ROUND 2 STARTING

  Current Score: 1-0 (You're leading)

  <StrategicInsight>
    💡 SITUATION
    • You're up 1-0, crowd favors you
    • Keep the pressure on
    • Opponent needs to adjust

    Your Stress: 22 (Low) ✅
    Your Prep: Strong writing focus ✅

    Opponent likely to:
    • Try to match your haymakers
    • May take risks (desperation)
  </StrategicInsight>

  <button>Simulate Round 2</button>
</RoundPreview>
```

**After Round 2:**

```tsx
<RoundResult round={2}>
  🎤 ROUND 2 COMPLETE

  [Similar breakdown as R1]

  ✅ YOU WON ROUND 2
  Leading 2-0

  <BattleStatus>
    🏆 ONE ROUND FROM VICTORY
    Win Round 3 for a 3-0 BODYBAG
    Or coast—you've already clinched 2-0
  </BattleStatus>

  <button>Continue to Round 3</button>
</RoundResult>
```

### Implementation Notes

**Database Changes:**
- None needed, already have round-level data

**Simulation Changes:**
- Simulate 1 round at a time
- Save round results after each round
- Check for early battle end (2-0 clinch, but still play R3)

**UX Benefits:**
- Creates tension/drama
- Players understand momentum shifts
- Learn from crowd reactions
- Makes battles feel like EVENTS not stat dumps

---

## 4. BATTLER PROFILE PAGE (Character Sheet)

### Concept

Dedicated page showing ALL battler stats, career history, achievements.

### Page Structure (`/battler/[id]`)

```tsx
<BattlerProfile>
  <ProfileHeader>
    <h1>WORDSMITH</h1>
    <p>Brooklyn, NY</p>
    <div className="rating">1450 ELO • Mid Tier</div>
    <div className="record">12-3 (80% win rate)</div>
    <div className="streak">🔥 5-game win streak</div>
  </ProfileHeader>

  <StatsGrid>
    {/* Writing Attributes */}
    <AttributeCard title="WRITING">
      Lyricism: 8/10 ████████░░
      Wordplay: 9/10 █████████░
      Creativity: 7/10 ███████░░░
      Flow: 7/10 ███████░░░
    </AttributeCard>

    {/* Performance Attributes */}
    <AttributeCard title="PERFORMANCE">
      Stage Presence: 5/10 █████░░░░░
      Crowd Control: 4/10 ████░░░░░░
      Delivery: 6/10 ██████░░░░
    </AttributeCard>

    {/* Personal Attributes */}
    <AttributeCard title="PERSONAL">
      Resilience: 6/10 ██████░░░░
      Reputation: 7/10 ███████░░░
      Financial Stability: 6/10 ██████░░░░
      Family Bond: 8/10 ████████░░
    </AttributeCard>

    {/* Mental State */}
    <AttributeCard title="MENTAL STATE">
      Stress: 15 (LOW) ✅
      Preparation: 7/10
      Public Knowledge: 45%
    </AttributeCard>
  </StatsGrid>

  <BadgesSection>
    <h3>BADGES & ABILITIES</h3>
    <Badge name="Lyrical Assassin">
      Lyricism +1
      Effect: Higher writing power in Small Room
    </Badge>
    <Badge name="Pen Game Strong">
      Wordplay +15%
      Effect: More likely to hit haymakers with wordplay
    </Badge>
  </BadgesSection>

  <CareerStats>
    <h3>CAREER STATISTICS</h3>
    Total Battles: 15
    Total Rounds Won: 34/45 (76%)
    Haymakers: 18 (1.2 per battle)
    Chokes: 3 (0.2 per battle)
    Avg Crowd Reaction: 71%
    Best Performance: 8.9 (vs ROOKIE, March 1)

    Earnings:
    ├─ Total Career: $34,500
    ├─ Battle Payouts: $28,000
    ├─ Win Bonuses: $4,500
    └─ Tournament Prizes: $2,000
  </CareerStats>

  <BattleHistory>
    <h3>RECENT BATTLES</h3>
    <BattleRow>
      ✅ def. UNDERDOG 3-0 (Bodybag) | Spring Champ R1
      Date: March 15, 2025 | +$0 (Tournament) | +5 ELO
    </BattleRow>
    <BattleRow>
      ✅ def. RISING STAR 2-1 (Edge) | Small Room
      Date: March 1, 2025 | +$3,900 | +12 ELO
    </BattleRow>
    <BattleRow>
      ❌ lost to VETERAN 1-2 | Main Stage
      Date: Feb 15, 2025 | +$3,000 | -8 ELO
    </BattleRow>
  </BattleHistory>

  <Achievements>
    <h3>ACHIEVEMENTS</h3>
    🏆 Tournament Finalist (Spring Championship 2025)
    📈 5-Win Streak (Current)
    💎 10+ Career Wins
    🎯 Haymaker Artist (15+ haymakers)
    📚 Bar God (8+ Lyricism)
  </Achievements>
</BattlerProfile>
```

---

## IMPLEMENTATION PRIORITY

**Phase 1 (High Priority):**
1. **Inter-Round Feedback** - Easiest to implement, BIG UX improvement
2. **Battler Profile Page** - Just UI, no new simulation logic

**Phase 2 (Medium Priority):**
3. **Crowd Composition** - Moderate complexity, adds strategic depth
4. **Crowd-specific badges** - Builds on crowd system

**Phase 3 (Lower Priority, but high value):**
5. **Battle Cards/Events** - Most complex, requires new DB tables and event system
6. **Event-level blogger coverage** - Builds on battle cards

---

## NEXT STEPS

1. Review this spec
2. Confirm which features to implement
3. Prioritize order
4. Begin Phase 1 implementation
