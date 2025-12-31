# V0 Missing Components Spec

These components were identified as missing in the audit. Build each one.

---

## Component #1: JudgeScorecard

**Purpose**: Shows how judges scored each round

**File**: `components/battle/judge-scorecard.tsx`

**Props**:
```typescript
interface JudgeScorecardProps {
  rounds: {
    roundNum: number;
    playerScore: number;      // 0-10
    opponentScore: number;    // 0-10
    playerWon: boolean;
  }[];
  playerName: string;
  opponentName: string;
}
```

**Visual Design**:
```
┌─ JUDGE SCORECARD ───────────────────────────────────────────┐
│                                                             │
│              PLAYER NAME     vs     OPPONENT NAME           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ROUND 1    [8.5]  ────────────  [7.2]              │   │
│  │             ████████░░          ███████░░░          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ROUND 2    [7.8]  ────────────  [8.1]              │   │
│  │             ███████░░░          ████████░░          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ROUND 3    [9.2]  ────────────  [7.5]              │   │
│  │             █████████░          ███████░░░          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  FINAL:        2-1        WINNER: PLAYER NAME              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Styling**:
- Card: `bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6`
- Winner score: `text-green-500`
- Loser score: `text-zinc-400`
- Score bars: Winner side gets `bg-green-500`, loser gets `bg-zinc-600`

---

## Component #2: CrowdReactionWindow

**Purpose**: Shows live crowd reaction during/after battle

**File**: `components/battle/crowd-reaction-window.tsx`

**Props**:
```typescript
interface CrowdReactionWindowProps {
  reactionLevel: number;      // 0-100
  reactionType: 'quiet' | 'interested' | 'hyped' | 'going_crazy' | 'legendary';
  momentType?: 'haymaker' | 'choke' | 'rebuttal' | 'freestyle' | null;
  showAnimation?: boolean;
}
```

**Reaction Thresholds**:
- 0-20: `quiet` - "Crowd is silent..."
- 21-40: `interested` - "Crowd is paying attention"
- 41-60: `hyped` - "Crowd is feeling it!"
- 61-80: `going_crazy` - "CROWD GOING CRAZY!"
- 81-100: `legendary` - "LEGENDARY MOMENT!"

**Visual Design**:
```
┌─ CROWD REACTION ────────────────────────────────────────────┐
│                                                             │
│                    CROWD GOING CRAZY!                       │
│                                                             │
│     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░      │
│     ████████████████████████████████████████░░░░░░░░░      │
│                                                             │
│                         [78/100]                            │
│                                                             │
│                    "THAT WAS CRAZY!"                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Styling by Level**:
- quiet: `bg-zinc-800`, `text-zinc-500`
- interested: `bg-zinc-700`, `text-zinc-300`
- hyped: `bg-orange-900/30`, `text-orange-400`
- going_crazy: `bg-orange-500/30`, `text-orange-300`, add pulse animation
- legendary: `bg-yellow-500/30`, `text-yellow-300`, add glow effect

---

## Component #3: MatchupPreview

**Purpose**: Shows pre-battle matchup comparison between player and opponent

**File**: `components/battle/matchup-preview.tsx`

**Props**:
```typescript
interface MatchupPreviewProps {
  player: {
    name: string;
    rating: number;
    record: string;        // "12-3"
    streak: string;        // "W3" or "L1"
    styleTags: string[];
    avatar?: string;
  };
  opponent: {
    name: string;
    rating: number;
    record: string;
    streak: string;
    styleTags: string[];
    avatar?: string;
  };
  league: string;
  scheduledDate: string;
}
```

**Visual Design**:
```
┌─ MATCHUP PREVIEW ───────────────────────────────────────────┐
│                                                             │
│           MAIN STAGE ARENA • DEC 15, 2024                   │
│                                                             │
│  ┌─────────────────┐           ┌─────────────────┐         │
│  │                 │    VS     │                 │         │
│  │   [AVATAR]      │           │   [AVATAR]      │         │
│  │                 │           │                 │         │
│  │   PLAYER NAME   │           │  OPPONENT NAME  │         │
│  │   Rating: 1450  │           │   Rating: 1380  │         │
│  │   Record: 12-3  │           │   Record: 8-5   │         │
│  │   Streak: W3    │           │   Streak: W1    │         │
│  │                 │           │                 │         │
│  │  [Wordplay]     │           │  [Angles]       │         │
│  │  [Punchlines]   │           │  [Comedy]       │         │
│  └─────────────────┘           └─────────────────┘         │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  RATING ADVANTAGE: +70 (PLAYER FAVORED)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Styling**:
- Card: `bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6`
- VS text: `text-[#ff8c42] text-2xl font-black`
- Favored indicator: Green if player favored, red if opponent favored
- Style tags: `bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs`

---

## Component #4: BattleAnalysis

**Purpose**: Post-battle breakdown of what worked and what didn't

**File**: `components/battle/battle-analysis.tsx`

**Props**:
```typescript
interface BattleAnalysisProps {
  playerPerformance: {
    bestMoment: string;           // "Round 2 haymaker"
    worstMoment: string;          // "Round 3 stumble"
    effectiveContent: string[];   // ["Wordplay", "Angles"]
    ineffectiveContent: string[]; // ["Comedy"]
    crowdHighPoint: number;       // 0-100
    crowdLowPoint: number;        // 0-100
  };
  opponentPerformance: {
    bestMoment: string;
    worstMoment: string;
    effectiveContent: string[];
    ineffectiveContent: string[];
  };
  keyTurningPoint: string;        // "Round 2 rebuttal shifted momentum"
}
```

**Visual Design**:
```
┌─ BATTLE ANALYSIS ───────────────────────────────────────────┐
│                                                             │
│  YOUR PERFORMANCE                                           │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  BEST MOMENT:  Round 2 haymaker - crowd went crazy         │
│  WORST MOMENT: Round 3 stumble - lost momentum             │
│                                                             │
│  WHAT WORKED:           WHAT DIDN'T:                       │
│  [Wordplay] +1.4x       [Comedy] 0.7x                      │
│  [Angles] +1.2x                                            │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  KEY TURNING POINT                                          │
│  "Round 2 rebuttal shifted momentum in your favor"         │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  CROWD REACTION RANGE                                       │
│  Low: 45  ░░░░░████████████████████████░░░░░░  High: 92    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component #5: RoundResultsBreakdown

**Purpose**: Detailed breakdown of a single round's performance

**File**: `components/battle/round-results-breakdown.tsx`

**Props**:
```typescript
interface RoundResultsBreakdownProps {
  roundNum: number;
  playerSegments: {
    segmentNum: number;
    score: number;
    contentUsed: string[];
    hadMoment: boolean;
    momentType?: 'haymaker' | 'stumble' | 'choke';
  }[];
  opponentSegments: {
    segmentNum: number;
    score: number;
    contentUsed: string[];
    hadMoment: boolean;
    momentType?: 'haymaker' | 'stumble' | 'choke';
  }[];
  playerTotal: number;
  opponentTotal: number;
  playerWon: boolean;
  crowdReaction: number;
}
```

**Visual Design**:
```
┌─ ROUND 2 BREAKDOWN ─────────────────────────────────────────┐
│                                                             │
│  YOUR ROUND              OPPONENT'S ROUND                   │
│  Score: 8.2              Score: 7.5                         │
│  [WINNER]                                                   │
│                                                             │
│  SEGMENT BY SEGMENT:                                        │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  SEG 1:  [7.5] ███████░░░    [7.2] ███████░░░              │
│  SEG 2:  [8.8] █████████░    [7.8] ████████░░   HAYMAKER!  │
│  SEG 3:  [7.9] ████████░░    [7.0] ███████░░░              │
│  SEG 4:  [8.5] █████████░    [8.0] ████████░░              │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  CONTENT EFFECTIVENESS:                                     │
│  Wordplay: +1.3x  |  Angles: +1.1x  |  Comedy: 0.8x        │
│                                                             │
│  CROWD REACTION: 78/100 - "Crowd was feeling it!"          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component #6: BattleViewsDisplay

**Purpose**: Shows simulated view count and engagement for the battle

**File**: `components/battle/battle-views-display.tsx`

**Props**:
```typescript
interface BattleViewsDisplayProps {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  trending?: boolean;
  leagueName: string;
}
```

**Visual Design**:
```
┌─ BATTLE STATS ──────────────────────────────────────────────┐
│                                                             │
│  MAIN STAGE ARENA                         [TRENDING]       │
│                                                             │
│  👁 1.2M views   ❤ 45K likes   💬 2.3K comments   ↗ 890    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Formatting Function**:
```typescript
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
```

**Styling**:
- Trending badge: `bg-red-500 text-white px-2 py-1 rounded text-xs animate-pulse`
- Stats row: `flex gap-6 text-zinc-400`

---

## WHERE TO USE THESE COMPONENTS

| Component | Use On Page |
|-----------|-------------|
| JudgeScorecard | `/battle/[id]` (final results) |
| CrowdReactionWindow | `/battle/[id]/round/[roundNum]/results` |
| MatchupPreview | `/battle/[id]/mode` (before battle starts) |
| BattleAnalysis | `/battle/[id]` (final results) |
| RoundResultsBreakdown | `/battle/[id]/round/[roundNum]/results` |
| BattleViewsDisplay | `/battle/[id]` (final results) |

---

## IMPLEMENTATION ORDER

1. **JudgeScorecard** - Simple, needed for final results
2. **RoundResultsBreakdown** - Needed for round results page
3. **CrowdReactionWindow** - Adds life to round results
4. **MatchupPreview** - Pre-battle hype
5. **BattleAnalysis** - Post-battle insights
6. **BattleViewsDisplay** - Social proof (lowest priority)
