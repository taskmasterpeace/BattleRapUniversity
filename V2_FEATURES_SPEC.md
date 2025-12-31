# V2 Features Specification

Complete breakdown of all V2 features for Battle Rap University.

---

## FEATURE 1: Segment-Based Content System

### Overview
Replace round-based content selection with segment-based crafting. Players create individual segments, then organize them into rounds.

### Why This Change
- More strategic depth
- Mirrors real battle rap (bars written individually, organized into rounds)
- Allows round shifting and adaptation
- Enables counter preparation

### Segment Structure

```typescript
interface Segment {
  id: string;
  battleId: string;
  roundNum: number | null;      // null = unassigned/backup
  position: number | null;      // 1-6 position within round
  contentType: ContentType;     // "personals", "wordplay", etc.
  deliveryType: DeliveryType;   // "aggressive", "smooth_flow", etc.
  performanceType: PerformanceType; // "stage_presence", etc.
  isFreestyle: boolean;         // true = no writing needed
  isCounter: boolean;           // true = counter segment
  counterTarget?: ContentType;  // what opponent content this counters
  isRehearsed: boolean;         // has this segment been rehearsed
  createdAt: string;
  updatedAt: string;
}
```

### Segments Per Round

| Round Length | Segments per Round | Total for Battle |
|--------------|--------------------|--------------------|
| 90 seconds | 3 | 9 |
| 2 minutes | 4 | 12 |
| 3 minutes | 6 | 18 |

### Segment States

```
UNWRITTEN → WRITTEN → ASSIGNED → REHEARSED → PERFORMED
     ↓
  FREESTYLE (skip writing)
```

### Rules
1. Cannot assign more segments to a round than round allows
2. Cannot rehearse segment until it's written (unless freestyle)
3. Can create MORE segments than needed (backups/counters)
4. Unassigned segments become backup material

---

## FEATURE 2: Research Level System

### Overview
Track how much research player has done on opponent. Affects writing quality and credibility.

### Research Levels

| Level | Days Required | Effects |
|-------|---------------|---------|
| **None** | 0 | Generic angles only. Personals are made up = credibility risk |
| **Casual** | 1-2 | Basic info: city, crew, loss record, public beefs |
| **Aggressive** | 3+ | Deep info: family, secrets, embarrassing moments |

### Credibility System

**Without Research**:
- Can still write "personals" content type
- But content is generic/made up
- If opponent calls it out → Crowd turns on you
- Credibility hit: -15% effectiveness for that round

**With Casual Research**:
- Safe personals about public info
- No credibility risk for known facts
- Standard effectiveness

**With Aggressive Research**:
- Deep personals that hit hard
- +20% effectiveness on personal content
- Can expose real secrets

### Database

```sql
-- Add to prep_progress or new table
research_level ENUM('none', 'casual', 'aggressive') DEFAULT 'none',
research_days INTEGER DEFAULT 0
```

### UI Display

```
RESEARCH LEVEL
┌─────────────────────────────────────────┐
│ ○ None    ◐ Casual    ● Aggressive     │
│           ▲                            │
│     Current Level                      │
│                                        │
│ 3 days of research completed           │
│ "You know their deepest secrets"       │
└─────────────────────────────────────────┘
```

---

## FEATURE 3: Prep Pipeline (Dependencies)

### Overview
Enforce realistic prep flow: Research enables Writing, Writing enables Rehearsal.

### Dependency Chain

```
RESEARCH → WRITING → REHEARSAL
    ↓          ↓          ↓
  Angles    Segments    Delivery
  Info      Created     Memorized
```

### Rules

| Activity | Prerequisites | Produces |
|----------|---------------|----------|
| Research | None | Research level, angle ideas |
| Writing | Research (for personals) | Written segments |
| Rehearsal | Written segments | Rehearsed status, reduced choke risk |
| Life | None | Stress reduction |
| Rest | None | Mental recovery, resilience boost |

### Enforcement

1. **Writing without Research**:
   - Can write generic content types (Wordplay, Punchlines, etc.)
   - Cannot write effective Personals without at least Casual research
   - UI shows warning: "Writing personals without research = credibility risk"

2. **Rehearsal without Writing**:
   - Cannot rehearse a round until all segments in that round are written
   - Can mark segments as "freestyle" to skip writing requirement
   - UI shows: "Round 2 not ready for rehearsal (2 segments missing)"

3. **Freestyle Exception**:
   - Segments marked as freestyle don't need writing OR rehearsal
   - Higher variance in performance
   - Requires Freestyle badge for good results

---

## FEATURE 4: Round Organization

### Overview
Players organize written segments into Round 1, 2, and 3. Strategic placement matters.

### Organization UI

```
┌─ ROUND ORGANIZATION ────────────────────────────────────────┐
│                                                             │
│  UNASSIGNED (4)     ROUND 1 (4/4)    ROUND 2 (2/4)        │
│  ┌─────────────┐    ┌─────────────┐   ┌─────────────┐      │
│  │ [Drag Me]   │    │ 1. Wordplay │   │ 1. Gun Bars │      │
│  │ [Drag Me]   │    │ 2. Schemes  │   │ 2. Street   │      │
│  │ [Drag Me]   │    │ 3. Punchline│   │ 3. [Empty]  │      │
│  │ [Drag Me]   │    │ 4. Comedy   │   │ 4. [Empty]  │      │
│  └─────────────┘    └─────────────┘   └─────────────┘      │
│                                                             │
│  ✓ Round 1 Ready    ○ Round 2 Incomplete                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Strategic Considerations

| Strategy | Description | Pros | Cons |
|----------|-------------|------|------|
| **Front Load** | Best stuff in Round 1 | Set tone, win early | May fade |
| **Build Up** | Save best for Round 3 | Strong finish | May lose early |
| **Balanced** | Spread evenly | Consistent | No standout |
| **Adaptive** | Adjust mid-battle | React to opponent | Needs badges |

### Rules
1. Each round must have exactly X segments (based on round length)
2. Segments can be reordered within a round
3. Segments can be moved between rounds
4. Battle cannot start until all rounds are complete

---

## FEATURE 5: Counter System

### Overview
Prepare material for anticipated opponent content. High risk/high reward.

### How Counters Work

1. **Create Counter Segment**
   - Write a segment specifically for anticipated content
   - Mark it as "Counter for: [Content Type]"
   - Example: "Counter for: Personals about my losses"

2. **During Battle**
   - If opponent uses anticipated content → Counter is SUPER EFFECTIVE (1.5x)
   - If opponent doesn't use it → Using counter looks desperate (0.5x)
   - Can choose NOT to use counter if opponent doesn't trigger it

3. **Counter Slots**
   - Default: 1 counter slot per battle
   - Badges can add more:
     - "Prepared" badge: +1 counter slot
     - "Over-Preparer" badge: +2 counter slots

### Counter UI

```
┌─ COUNTER PREPARATION ───────────────────────────────────────┐
│                                                             │
│  COUNTER SLOT 1/1                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ IF OPPONENT USES: [Personals ▼] about [my record ▼] │   │
│  │                                                       │   │
│  │ MY COUNTER:                                          │   │
│  │ Content: Rebuttals                                   │   │
│  │ Delivery: Aggressive                                 │   │
│  │ Performance: Theatrical                              │   │
│  │                                                       │   │
│  │ EFFECTIVENESS:                                       │   │
│  │ If triggered: 1.5x (Super Effective)                │   │
│  │ If not triggered: 0.5x (Wasted)                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [+ ADD COUNTER] (requires badge)                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Counter Resolution

```typescript
function resolveCounter(counter: Counter, opponentRound: Round): CounterResult {
  const opponentUsedContent = opponentRound.segments.some(
    s => s.contentType === counter.anticipatedContent
  );

  if (opponentUsedContent) {
    return {
      triggered: true,
      multiplier: 1.5,
      message: "Counter landed! Crowd goes wild!"
    };
  } else {
    return {
      triggered: false,
      multiplier: 0.5,
      message: "Counter missed - looks over-prepared"
    };
  }
}
```

---

## FEATURE 6: Round Shifting

### Overview
After seeing opponent's round, can shift remaining rounds to optimize matchup.

### How It Works

1. **After Round 1**:
   - See opponent's Round 1 performance
   - Option: "Shift Round 3 content to Round 2?"
   - If opponent was weak, save your best for later
   - If opponent was strong, bring out your best now

2. **Penalty for Shifting**:
   - Consistency penalty: -5%
   - If round was rehearsed: Additional -10% (memorization thrown off)
   - Creates more realistic feel (adapting mid-battle is hard)

### Shift UI

```
┌─ ROUND SHIFT OPTION ────────────────────────────────────────┐
│                                                             │
│  Opponent had a WEAK Round 1 (6.2/10)                      │
│                                                             │
│  You can shift your rounds:                                │
│                                                             │
│  CURRENT ORDER:                                            │
│  Round 2: Gun Bars focus (your weakest)                    │
│  Round 3: Personals focus (your strongest)                 │
│                                                             │
│  SHIFT TO:                                                 │
│  Round 2: Personals focus (your strongest)                 │
│  Round 3: Gun Bars focus (your weakest)                    │
│                                                             │
│  ⚠️ PENALTY: -5% consistency (adaptation confusion)        │
│                                                             │
│  [KEEP ORDER]                    [SHIFT ROUNDS]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Rules
1. Can only shift UNPLAYED rounds
2. Cannot change content, only position
3. Penalty increases if rehearsed (-10% additional)
4. Maximum 1 shift per battle

---

## FEATURE 7: Freestyle Segments

### Overview
Mark segments as "freestyle" instead of writing them. Skip writing and rehearsal.

### How It Works

1. **Creating Freestyle Segment**:
   - In segment creator, toggle "Freestyle" on
   - Don't need to spend writing days
   - Don't need to rehearse

2. **Performance**:
   - Higher variance (could be 5.0 or 9.5)
   - Requires Freestyle badges for good results
   - Without badge: Average 5.5, high variance
   - With Freestyle Genius: Average 7.5, moderate variance

3. **Use Cases**:
   - Not enough prep time
   - Want to react to opponent
   - Save writing days for other segments

### Freestyle Badges

| Badge | Effect |
|-------|--------|
| **Freestyle Genius** | +2.0 average freestyle score, -30% variance |
| **Off the Top** | +1.5 average freestyle score |
| **Quick Wit** | +1.0 average, great for rebuttals |

### Freestyle UI

```
┌─ CREATE SEGMENT ────────────────────────────────────────────┐
│                                                             │
│  Content Type: [Rebuttals ▼]                               │
│  Delivery: [Aggressive ▼]                                  │
│  Performance: [Stage Presence ▼]                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [✓] FREESTYLE THIS SEGMENT                          │   │
│  │                                                       │   │
│  │ • No writing days needed                            │   │
│  │ • No rehearsal needed                               │   │
│  │ • Higher performance variance                       │   │
│  │ • Best with Freestyle badges                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [CANCEL]                              [CREATE SEGMENT]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## FEATURE 8: New Badges

### Prep-Related Badges

| Badge | Effect | Requirements |
|-------|--------|--------------|
| **Photographic Memory** | -25% research days needed, +15% memorization | 50+ battles |
| **Quick Writer** | +40% writing speed, 2 segments per writing day | Lyricism 8+ |
| **Double Shift** | Can do TWO prep activities per day | Time Management Expert badge |
| **Team Player** | +20% writing speed when on team | Be on a team |
| **Last Minute Larry** | +30% effectiveness with <3 prep days | Win 3 battles with minimal prep |
| **Preparation Monster** | +50% effectiveness with 10+ prep days | Win 5 battles with full prep |

### Counter-Related Badges

| Badge | Effect | Requirements |
|-------|--------|--------------|
| **Prepared** | +1 counter slot | Research 10+ battles |
| **Over-Preparer** | +2 counter slots, -5% consistency | 100+ prep days total |
| **Counter King** | +25% counter effectiveness | Land 5 counters |

### Implementation Notes
- Add to `lib/game/badges.ts`
- Hook into prep calculations
- Display in badge selection UI

---

## FEATURE 9: Dashboard Prep Widget

### Overview
Show active battle prep progress on dashboard.

### Widget Design

```
┌─ ACTIVE BATTLE PREP ────────────────────────────────────────┐
│                                                             │
│  VS GOTTI GEECHI • Main Stage Arena                        │
│  Battle in: 12 DAYS                                         │
│                                                             │
│  RESEARCH    ████████░░░░░░░░  Casual                      │
│  WRITING     ██████████████░░  14/18 segments              │
│  REHEARSAL   ████░░░░░░░░░░░░  1/3 rounds                  │
│                                                             │
│  ROUNDS:                                                    │
│  [✓ R1 Ready] [◐ R2 4/6] [○ R3 0/6]                       │
│                                                             │
│  COUNTER: 1/1 prepared                                     │
│                                                             │
│  [CONTINUE PREP →]                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Needed

```typescript
interface DashboardPrepData {
  battleId: string;
  opponent: {
    name: string;
    avatar?: string;
  };
  league: string;
  daysUntilBattle: number;
  daysUntilPrepLock: number;
  research: {
    level: 'none' | 'casual' | 'aggressive';
    days: number;
  };
  writing: {
    completed: number;
    needed: number;
    percent: number;
  };
  rehearsal: {
    roundsRehearsed: number[];
    percent: number;
  };
  rounds: {
    roundNum: number;
    segmentsAssigned: number;
    segmentsNeeded: number;
    isReady: boolean;
  }[];
  counters: {
    used: number;
    available: number;
  };
}
```

---

## FEATURE 10: Prep Page Header Update

### Current Header
```
vs OPPONENT NAME
League Name
Days until battle: X
```

### New Header
```
┌─────────────────────────────────────────────────────────────┐
│  VS GOTTI GEECHI                                [Avatar]    │
│  Main Stage Arena • God Tier                                │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  3 ROUNDS    │ │  3 MINUTES   │ │ 18 SEGMENTS  │        │
│  │              │ │  per round   │ │   needed     │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
│  Battle: DEC 20, 2024    Prep Locks: DEC 18, 2024         │
│  (12 days)               (10 days)                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## IMPLEMENTATION ORDER

### Sprint 1: Core Content
1. SegmentCreator component
2. Database table for segments
3. Segment CRUD API
4. Update prep page with basic segment list

### Sprint 2: Organization
5. RoundOrganizer component (drag-and-drop)
6. Segment assignment API
7. Round completeness validation
8. Prep page integration

### Sprint 3: Research
9. ResearchLevelIndicator component
10. Research tracking in database
11. Research effects on writing
12. Credibility system

### Sprint 4: Counters
13. CounterSlotManager component
14. Counter database table
15. Counter resolution in simulation
16. Counter badges

### Sprint 5: Advanced
17. Round shifting UI and logic
18. Freestyle segment handling
19. New prep badges
20. Dashboard widget

---

**End of Features Spec**
