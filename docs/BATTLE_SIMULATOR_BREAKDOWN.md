# Battle Simulator Breakdown Feature

## Overview

The Battle Simulator in Dev Tools (`/dev` → Battle Sim tab) provides a complete turn-based battle experience with detailed round breakdowns explaining WHY each battler won or lost.

---

## Feature Location

- **Component**: `components/dev/battle-simulator-enhanced.tsx`
- **Access**: Dev Tools → Battle Sim tab
- **Purpose**: Test battles, debug simulation logic, understand round outcomes

---

## Battle Flow

### Phase 1: Setup
- Select Battler A and Battler B from dropdown
- Option to "Control both sides" (pick content for both battlers)
- Click "Start Battle"

### Phase 2: Craft Round (Per Round)
- Select Content Type (PERSONALS, WORDPLAY, SCHEMES, etc.)
- Select Delivery Type (AGGRESSIVE, SMOOTH FLOW, etc.)
- Select Performance Type (STAGE PRESENCE, CROWD INTERACTION, etc.)
- If controlling both sides, select for both battlers
- AI opponent auto-selects if not controlling both
- Click "LOCK IN & BATTLE"

### Phase 3: Performance Animation
- "NOW PERFORMING [NAME]" header shows current performer
- Segment-by-segment playback (4 segments per 3-minute round)
- Crowd reactions appear one by one
- Segment scores revealed with HAYMAKER/CHOKE indicators
- Controls: Pause, Skip to Opponent, Fast Forward mode

### Phase 4: Round Result (The Breakdown)
- **Summary headline**: "CLOSE ROUND - [Name] edges it" or "TOO CLOSE TO CALL"
- **Score display**: Proper "1 - 0" battle rap format
- **WHY? section**: Bullet points explaining the outcome
- **Side-by-side breakdown**: Both battlers' performance details
- **Segment timeline**: Visual comparison of each segment

### Phase 5: Battle Complete
- Trophy with winner name
- Final score (e.g., "2 - 1")
- All rounds breakdown with summaries
- "New Battle" button to restart

---

## Round Breakdown Components

### 1. Summary Headline

Generated based on score differential:

| Differential | Headline |
|--------------|----------|
| >= 1.5 | "CLEAR WIN - [Winner] dominated this round" |
| >= 0.8 | "[Winner] TAKES IT - Solid round edge" |
| >= 0.3 | "CLOSE ROUND - [Winner] edges it" |
| < 0.3 | "DEBATABLE - [Winner] gets the nod" |
| Tie | "TOO CLOSE TO CALL - Both battlers came correct" |

### 2. WHY? Section

Programmatic factors explaining the outcome:

**Choke-related:**
- "[Loser] CHOKED - crowd turned on him"

**Haymaker-related:**
- "[Winner] had a HAYMAKER that stole the round"
- "Both had haymakers but [Winner]'s landed harder"

**Consistency:**
- "[Winner] was more consistent throughout"

**Momentum:**
- "[Winner] built momentum while [Loser] faded"
- "[Winner] started strong and set the tone"

**Content:**
- "[Content Type] connected better with the crowd than [Other Content]"

**Delivery:**
- "[Delivery Type] delivery kept the energy up"

### 3. Per-Battler Breakdown

For each battler:
- **Content choices**: Content Type, Delivery, Performance
- **OPENING segment**: First segment description + score
- **MID segments**: Middle segment scores (e.g., "7.9 → 7.1")
- **CLOSING segment**: Last segment description + score
- **Stats**: AVG and PEAK scores
- **Badges**: HAYMAKER or CHOKE indicators

### 4. Segment Descriptions

Generated based on score and position:

```typescript
function describeSegment(segment, isFirst, isLast) {
  const position = isFirst ? "OPENING" : isLast ? "CLOSING" : "MID"

  if (segment.isPeak) {
    return `${position}: ${score} - HAYMAKER! Crowd went crazy`
  }
  if (segment.isChoke) {
    return `${position}: ${score} - CHOKED. Lost the crowd`
  }
  if (score >= 8.5) {
    return `${position}: ${score} - Strong delivery, crowd feeling it`
  }
  if (score >= 7.0) {
    return `${position}: ${score} - Good bars, crowd engaged`
  }
  if (score >= 5.0) {
    return `${position}: ${score} - Average, crowd lukewarm`
  }
  return `${position}: ${score} - Struggled, crowd quiet`
}
```

### 5. Segment Timeline

Visual comparison showing each segment:
- Green highlight: Battler A won that segment
- Red highlight: Battler B won that segment
- Gray: Tie segment
- Format: "S1: 7.9 - 7.8"

---

## Data Structures

### RoundResult Interface

```typescript
interface RoundResult {
  roundNum: number
  winner: "battlerA" | "battlerB" | "tie"
  battlerAPerformance: PerformanceResult
  battlerBPerformance: PerformanceResult
  battlerASelections: RoundSelections
  battlerBSelections: RoundSelections
}
```

### PerformanceResult Interface

```typescript
interface PerformanceResult {
  segments: SegmentResult[]
  averageScore: number
  peakScore: number
  hasPeak: boolean
  hasChoke: boolean
}
```

### SegmentResult Interface

```typescript
interface SegmentResult {
  segmentIndex: number
  score: number
  isPeak: boolean
  isChoke: boolean
}
```

### RoundSelections Interface

```typescript
interface RoundSelections {
  contentTypes: ContentType[]
  deliveryTypes: DeliveryType[]
  performanceTypes: PerformanceType[]
}
```

---

## Key Functions

### explainRoundResult()

Generates the WHY? explanation:

```typescript
function explainRoundResult(
  winner: "battlerA" | "battlerB" | "tie",
  aPerf: PerformanceResult,
  bPerf: PerformanceResult,
  aSelections: RoundSelections,
  bSelections: RoundSelections,
  aName: string,
  bName: string
): { summary: string; factors: string[] }
```

**Logic:**
1. Check for chokes (major factor)
2. Check for haymakers (can steal rounds)
3. Compare consistency (variance in scores)
4. Analyze opening vs closing momentum
5. Compare content effectiveness
6. Note delivery style impact

### describeSegment()

Generates human-readable segment descriptions:

```typescript
function describeSegment(
  segment: SegmentResult,
  isFirst: boolean,
  isLast: boolean
): string
```

---

## UI Components

### Round Result Phase

```
+------------------------------------------+
|              ROUND 1                      |
|  CLOSE ROUND - TSUNAMI WAVE EDGES IT     |
|               1 - 0                       |
+------------------------------------------+
|  WHY?                                     |
|  • Both had haymakers but Tsunami's      |
|    landed harder                          |
|  • PERSONALS connected better with the   |
|    crowd than GUN BARS                   |
|  • AGGRESSIVE delivery kept energy up    |
+------------------------------------------+
| Tsunami Wave    |    The Comedian         |
| PERSONALS       |    GUN BARS             |
| AGGRESSIVE •    |    SMOOTH FLOW •        |
| STAGE PRESENCE  |    STRATEGIC PAUSES     |
|                 |                         |
| OPENING: 7.9    |    OPENING: 7.8         |
| MID: 7.9 → 7.1  |    MID: 6.9 → 7.5       |
| CLOSING: 8.6    |    CLOSING: 7.8         |
| HAYMAKER!       |    HAYMAKER             |
|                 |                         |
| AVG: 7.9        |    AVG: 7.5             |
| PEAK: 8.6       |    PEAK: 7.8            |
+------------------------------------------+
|          SEGMENT TIMELINE                 |
| S1: 7.9-7.8 | S2: 7.9-6.9 | S3: 7.1-7.5 |
+------------------------------------------+
|        [Continue to Round 2]              |
+------------------------------------------+
```

### Battle Complete Phase

```
+------------------------------------------+
|              [TROPHY]                     |
|        TSUNAMI WAVE WINS!                 |
|               2 - 1                       |
+------------------------------------------+
|          ROUND BREAKDOWN                  |
|                                          |
| ROUND 1            Tsunami Wave          |
| 7.9 PERSONALS vs GUN BARS 7.5            |
| CLOSE ROUND - Tsunami Wave edges it      |
| • Both had haymakers but Tsunami's       |
|   landed harder                           |
| [Tsunami HAYMAKER] [The HAYMAKER]        |
|                                          |
| ROUND 2                   TIE            |
| 8.2 WORDPLAY vs WORDPLAY 8.1             |
| TOO CLOSE TO CALL                        |
| • Neither could pull away                 |
| [Tsunami HAYMAKER] [The HAYMAKER]        |
|                                          |
| ROUND 3            Tsunami Wave          |
| 7.8 SCHEMES vs STORYTELLING 7.2          |
| CLOSE ROUND - Tsunami Wave edges it      |
| • Tsunami built momentum while The faded |
+------------------------------------------+
|            [New Battle]                   |
+------------------------------------------+
```

---

## Integration with Debatable System

The round breakdown should be enhanced to show victory type:

| Outcome | Display |
|---------|---------|
| 3-0 with high differential | "BODY BAG" |
| 3-0 with medium differential | "CLEAR 3-0" |
| 3-0 with low differential | "GENTLEMAN'S 3-0" |
| 2-1 with clear rounds | "CLEAR 2-1" |
| 2-1 with close rounds | "2-1 DEBATABLE" |

---

## Crowd Momentum Meter System (IMPLEMENTED)

The momentum meter visualizes the psychological advantage/disadvantage during battle - the "fighting uphill" dynamic when you need to respond to a strong performance.

### How Momentum Works

**Core Mechanics:**
- Momentum ranges from -100 (Battler B dominant) to +100 (Battler A dominant)
- 0 = Even footing
- Displayed as a horizontal bar during performance phases
- Updates after each segment with smooth spring animation

**Momentum Shifts:**
```typescript
// Each segment calculates momentum based on:
scoreDiff * 8           // Score differential (each point = 8 momentum)
choke ? -35 : 0         // Choke = MASSIVE penalty
peak && !opponent ? +15 // Haymaker bonus when opponent doesn't have one
currentMomentum * 0.15  // Avalanche effect - momentum compounds
```

**Narrative Labels:**
| Momentum | Label |
|----------|-------|
| >= 60 | "DOMINANT" (pulsing animation) |
| >= 35 | "building" |
| >= 15 | "ahead" |
| Even | "EVEN" |
| <= -15 | "ahead" (opponent) |
| <= -35 | "building" (opponent) |
| <= -60 | "DOMINANT" (opponent) |

**"Fighting Uphill" Indicator:**
When a battler is performing while momentum is against them (< -35 for A, > 35 for B):
- Orange warning appears: "⚠️ FIGHTING UPHILL - Must exceed to recover!"
- This reflects real battle rap psychology where responding to a killer round puts pressure on you

**Between-Round Decay:**
- Momentum carries to the next round but decays by 30%
- Dominant momentum (>= 60) only decays 20% (crowd stays hyped)
- This creates the "reset" feel of a new round while maintaining some pressure

### UI Components

**During Performance (battlerAGoes/battlerBGoes):**
```
┌─────────────────────────────────────┐
│ Player A   CROWD MOMENTUM   Player B│
│────────────────────────────────────│
│ ▓▓▓▓▓▓▓▓▓▓▓░░░░│░░░░░░░░░░░░░░░░░ │
│            ●                        │
│────────────────────────────────────│
│         Player A building           │
│   ⚠️ FIGHTING UPHILL - Must exceed! │
└─────────────────────────────────────┘
```

**Round Results (before next round):**
- Compact momentum bar showing "MOMENTUM INTO ROUND X"
- Narrative text: "Player A DOMINANT - Player B FIGHTING UPHILL"
- Only shown if battle continues to next round

---

## Future Enhancements

### Planned Features
1. **Victory type classification** - Show "BODY BAG", "GENTLEMAN'S 3-0", etc.
2. **Trash battle detection** - Flag when both battlers underperform
3. ~~**Crowd energy visualization** - Show crowd meter during segments~~ ✅ DONE (Momentum Meter)
4. **Rebuttal system** - Allow content switching with penalties
5. **In-round actions** - Walk up, play to crowd, eye contact mechanics

### Data to Track
- Round-by-round differentials for victory type calculation
- Combined score averages for trash detection
- Haymaker counts for narrative generation
- Choke impact on round outcomes

---

## Related Documentation

- `docs/BATTLE_SCORING_AND_DEBATABLES.md` - Scoring terminology and victory types
- `lib/round-crafting.ts` - Content types and simulation logic
- `ROUND_CRAFTING_FRONTEND_SPEC.md` - UI specifications
- `CROWD_SYSTEM_FINAL_STATUS.md` - Crowd reaction system

---

*Last Updated: December 2024*
*Component: components/dev/battle-simulator-enhanced.tsx*
