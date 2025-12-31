# Round Crafting Frontend Spec - V0 Build Guide

**Purpose**: Complete frontend implementation guide for V0 to build the Round Crafting System
**Prerequisite**: Read `ROUND_CONTENT_SELECTION_SYSTEM.md` for full game mechanics understanding
**Priority**: HIGH - This is core gameplay

---

## Table of Contents

1. [System Overview](#system-overview)
2. [User Flow](#user-flow)
3. [Components to Build](#components-to-build)
4. [Pages to Build](#pages-to-build)
5. [API Endpoints](#api-endpoints)
6. [Styling Constants](#styling-constants)
7. [Data Types](#data-types)
8. [Integration Notes](#integration-notes)

---

## System Overview

### What is Round Crafting?

Players don't write actual lyrics. Instead, they **craft rounds** by selecting:
- **Content Types** (3-4): What they're rapping about (Personals, Wordplay, Comedy, etc.)
- **Delivery Types** (1-2): How they're delivering it (Aggressive, Smooth Flow, etc.)
- **Performance Types** (1-2): How they're performing it (Theatrical, Charismatic, etc.)

Think of it like building a Pokemon team - your selections have **type matchups** against your opponent's selections.

### Two Battle Modes

**1. Locked In Mode (Strategic)**
- Player manually selects content for each round
- Sees effectiveness forecast before confirming
- Round-by-round gameplay (select → simulate → see results → repeat)
- Takes ~2-3 minutes per battle

**2. Auto Mode (Quick)**
- System auto-selects based on battler's badges
- All 3 rounds simulated at once
- Takes ~10 seconds total
- Good for players who want faster gameplay

### Where This Fits in Game Flow

```
Prep Phase Complete → lock_prep_at reached
         ↓
Mode Selection Screen (Locked In vs Auto)
         ↓
    ┌────┴────┐
    ↓         ↓
Locked In   Auto
    ↓         ↓
Round 1     Simulate
Select      All 3
    ↓         ↓
Simulate    Show
Round 1     Results
    ↓
Round 1
Results
    ↓
Round 2...
    ↓
Round 3...
    ↓
Battle Complete
```

---

## User Flow

### Flow 1: Mode Selection

**When**: After `lock_prep_at` is reached and battle status becomes `awaiting_lock_in_choice`

**Screen**: ModeSelectionScreen

```
┌─────────────────────────────────────────────────────────────┐
│                     BATTLE READY                             │
│              vs GOTTI GEECHI                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  How do you want to approach this battle?                   │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │                      │  │                      │        │
│  │    ⚔️ LOCKED IN      │  │    ⚡ AUTO MODE      │        │
│  │                      │  │                      │        │
│  │  Craft each round    │  │  Quick simulation   │        │
│  │  Strategic gameplay  │  │  Badge-based picks  │        │
│  │  See matchup preview │  │  ~10 seconds        │        │
│  │  ~2-3 minutes        │  │                      │        │
│  │                      │  │                      │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Flow 2: Round Content Selection (Locked In Mode)

**When**: After choosing Locked In, for each round (1, 2, 3)

**Screen**: RoundCraftingScreen

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ROUND 1 OF 3                                         vs GOTTI GEECHI    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─ CONTENT (Select 3-4) ──────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  [✓ PERSONALS]  [✓ WORDPLAY]  [✓ PUNCHLINES]  [ SCHEMES ]       │   │
│  │  [ COMEDY ]     [ STORYTELLING ]  [ GUN BARS ]  [ STREET TALK ] │   │
│  │  [ FREESTYLES ] [ REBUTTALS ]  [ POP CULTURE ]  [ NAME FLIPS ]  │   │
│  │  [ SHOCK VALUE ]  [ SOCIAL COMMENTARY ]                         │   │
│  │                                                                  │   │
│  │  3/4 Selected                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─ DELIVERY (Select 1-2) ─────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  [✓ AGGRESSIVE]  [ SMOOTH FLOW ]  [ SPEED RAPPING ]             │   │
│  │  [ STACCATO ]  [ PASSIONATE ]  [ NONCHALANT ]  [ CONVERSATIONAL]│   │
│  │                                                                  │   │
│  │  1/2 Selected                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─ PERFORMANCE (Select 1-2) ──────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  [ STAGE PRESENCE ]  [ CROWD INTERACTION ]  [✓ THEATRICAL]      │   │
│  │  [ CHARISMATIC ]  [ DYNAMIC RANGE ]  [ FACIAL EXPRESSION ]      │   │
│  │  [ STRATEGIC PAUSES ]  [ MINIMALIST ]                           │   │
│  │                                                                  │   │
│  │  1/2 Selected                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─ EFFECTIVENESS FORECAST ────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  FINAL MULTIPLIER: 1.44x                                        │   │
│  │  ████████████████████░░░░░░░░░░                                 │   │
│  │                                                                  │   │
│  │  Breakdown:                                                      │   │
│  │  • Effectiveness: 1.22x (good matchup)                          │   │
│  │  • Crowd Favor: 1.14x (purists love wordplay)                   │   │
│  │  • Context: 1.03x (PPV neutral)                                 │   │
│  │                                                                  │   │
│  │  STRONG AGAINST: [Comedy] [Gun Bars]                            │   │
│  │  WEAK AGAINST: None                                              │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│            [ CONFIRM ROUND 1 ]                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Flow 3: Round Results (After Each Round)

**When**: After simulating a round

**Screen**: RoundResultsScreen

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ROUND 1 COMPLETE                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│       YOU                              GOTTI GEECHI                     │
│                                                                         │
│      8.93                                 7.21                          │
│   ████████████                         ███████                          │
│                                                                         │
│   Peak: 9.2                            Peak: 7.8                        │
│   Consistency: 87%                     Consistency: 72%                 │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  YOUR SELECTIONS:                                                       │
│  Content: [Personals] [Wordplay] [Punchlines]                          │
│  Delivery: [Aggressive]                                                 │
│  Performance: [Theatrical]                                              │
│                                                                         │
│  MULTIPLIERS APPLIED:                                                   │
│  • Effectiveness: 1.22x (Wordplay beats Gun Bars)                      │
│  • Crowd: 1.14x (Purists loved it)                                     │
│  • Context: 1.03x                                                       │
│  • Final: 1.44x                                                         │
│                                                                         │
│  OPPONENT'S SELECTIONS:                                                 │
│  Content: [Gun Bars] [Street Talk] [Personals]                         │
│  Delivery: [Aggressive]                                                 │
│  Performance: [Stage Presence]                                          │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  SEGMENT TIMELINE:                                                      │
│  [1: 8.5] [2: 8.8] [3: 9.2★] [4: 8.3]                                  │
│           ↑ peak moment                                                 │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Current Score: YOU 1-0 OPPONENT                                        │
│                                                                         │
│            [ CONTINUE TO ROUND 2 ]                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Components to Build

### 1. ModeSelectionCard

**File**: `components/battle/ModeSelectionCard.tsx`

**Purpose**: Clickable card for Locked In vs Auto mode selection

```typescript
interface ModeSelectionCardProps {
  mode: 'locked_in' | 'auto';
  title: string;
  description: string;
  features: string[];
  duration: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}
```

**Visual States**:
- Default: `bg-zinc-900 border-zinc-800`
- Hover: `border-zinc-600`
- Selected: `border-orange-500 bg-orange-500/10`
- Disabled: `opacity-50 cursor-not-allowed`

**Layout**:
```
┌──────────────────────────────┐
│         [ICON]               │
│                              │
│         TITLE                │
│                              │
│     Description text         │
│                              │
│  • Feature 1                 │
│  • Feature 2                 │
│  • Feature 3                 │
│                              │
│     ~duration                │
└──────────────────────────────┘
```

---

### 2. ContentTypeCard

**File**: `components/battle/ContentTypeCard.tsx`

**Purpose**: Selectable card for content/delivery/performance types

```typescript
interface ContentTypeCardProps {
  type: ContentType | DeliveryType | PerformanceType;
  name: string;
  description: string;
  category: 'content' | 'delivery' | 'performance';
  selected: boolean;
  disabled: boolean;
  effectiveness?: 'strong' | 'neutral' | 'weak'; // Based on opponent prediction
  onClick: () => void;
}
```

**Visual States**:
- Default: `bg-zinc-900 border-zinc-700`
- Hover: `border-zinc-500`
- Selected: `border-orange-500 bg-orange-500/10`
- Disabled: `opacity-40 cursor-not-allowed`
- Strong effectiveness: green glow `ring-2 ring-green-500/30`
- Weak effectiveness: red tint `bg-red-500/5`

**Layout**:
```
┌─────────────────┐
│ [✓] TYPE NAME   │  ← checkbox on left, name bold
│                 │
│ Short desc...   │  ← text-zinc-400 text-xs
│                 │
│ [STRONG vs X]   │  ← optional effectiveness badge
└─────────────────┘
```

---

### 3. ContentCategorySection

**File**: `components/battle/ContentCategorySection.tsx`

**Purpose**: Section wrapper for content/delivery/performance selection grids

```typescript
interface ContentCategorySectionProps {
  category: 'content' | 'delivery' | 'performance';
  title: string;
  minSelections: number;
  maxSelections: number;
  currentSelections: number;
  children: React.ReactNode;
  expanded?: boolean;
  onToggleExpand?: () => void;
}
```

**Layout**:
```
┌─ CONTENT (Select 3-4) ─────────────────────────────────────┐
│                                                            │
│  [Grid of ContentTypeCards]                                │
│                                                            │
│  3/4 Selected  [✓ Valid]                                   │
└────────────────────────────────────────────────────────────┘
```

**Validation Display**:
- Below minimum: `text-red-500` "Select at least X more"
- At minimum: `text-green-500` "Valid"
- At maximum: `text-zinc-400` "Maximum reached"

---

### 4. EffectivenessForecast

**File**: `components/battle/EffectivenessForecast.tsx`

**Purpose**: Shows predicted effectiveness multiplier based on current selections

```typescript
interface EffectivenessForecastProps {
  selections: {
    contentTypes: ContentType[];
    deliveryTypes: DeliveryType[];
    performanceTypes: PerformanceType[];
  };
  opponentPredictedSelections?: {
    contentTypes: ContentType[];
    deliveryTypes: DeliveryType[];
    performanceTypes: PerformanceType[];
  };
  leagueId: string;
  context: 'in_building' | 'ppv' | 'on_cam';
  isLoading?: boolean;
}

interface ForecastResult {
  finalMultiplier: number;
  effectiveness: number;
  crowdPreference: number;
  contextModifier: number;
  strongAgainst: ContentType[];
  weakAgainst: ContentType[];
}
```

**Visual Layout**:
```
┌─ EFFECTIVENESS FORECAST ───────────────────────────────────┐
│                                                            │
│  FINAL MULTIPLIER                                          │
│                                                            │
│      1.44x                                                 │
│  ████████████████████░░░░░░░░░░  (scale 0.5x to 2.0x)     │
│                                                            │
│  Breakdown:                                                │
│  Effectiveness  ████████████░░░░░░  1.22x                 │
│  Crowd Favor    █████████████░░░░░  1.14x                 │
│  Context        █████████░░░░░░░░░  1.03x                 │
│                                                            │
│  ┌─ STRONG AGAINST ────────────────────────────────────┐  │
│  │ [Comedy] [Gun Bars]                                 │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─ WEAK AGAINST ──────────────────────────────────────┐  │
│  │ None - solid selections!                            │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Multiplier Color Scale**:
- 0.5x - 0.8x: `text-red-500` (disadvantage)
- 0.8x - 1.0x: `text-orange-500` (slight disadvantage)
- 1.0x - 1.2x: `text-zinc-100` (neutral)
- 1.2x - 1.5x: `text-green-500` (advantage)
- 1.5x - 2.0x: `text-green-400` (strong advantage)

---

### 5. RoundContentSelector

**File**: `components/battle/RoundContentSelector.tsx`

**Purpose**: Main content selection component combining all category sections

```typescript
interface RoundContentSelectorProps {
  battleId: string;
  roundIndex: 1 | 2 | 3;
  playerBattlerId: string;
  opponentBattlerId: string;
  leagueId: string;
  context: 'in_building' | 'ppv' | 'on_cam';
  onConfirm: (selections: RoundSelections) => void;
  isSubmitting?: boolean;
}

interface RoundSelections {
  contentTypes: ContentType[];
  deliveryTypes: DeliveryType[];
  performanceTypes: PerformanceType[];
}
```

**Selection Requirements per Round**:
- Round 1: 3 content, 1 delivery, 1 performance (baseline)
- Round 2: 3-4 content, 1-2 delivery, 1-2 performance (flex)
- Round 3: 3-4 content, 1-2 delivery, 1-2 performance (flex)

**Validation Logic**:
```typescript
function isValidSelection(round: number, selections: RoundSelections): boolean {
  const { contentTypes, deliveryTypes, performanceTypes } = selections;

  // Content: 3-4 required
  if (contentTypes.length < 3 || contentTypes.length > 4) return false;

  // Delivery: 1-2 required
  if (deliveryTypes.length < 1 || deliveryTypes.length > 2) return false;

  // Performance: 1-2 required
  if (performanceTypes.length < 1 || performanceTypes.length > 2) return false;

  return true;
}
```

---

### 6. RoundResultsCard

**File**: `components/battle/RoundResultsCard.tsx`

**Purpose**: Shows results after a round is simulated

```typescript
interface RoundResultsCardProps {
  roundIndex: 1 | 2 | 3;
  playerResult: {
    averageScore: number;
    peakScore: number;
    consistencyScore: number;
    contentTypes: ContentType[];
    deliveryTypes: DeliveryType[];
    performanceTypes: PerformanceType[];
    effectivenessMultiplier: number;
    crowdPreferenceMultiplier: number;
    contextModifier: number;
    finalMultiplier: number;
    choked: boolean;
    stumbled: boolean;
  };
  opponentResult: {
    averageScore: number;
    peakScore: number;
    consistencyScore: number;
    contentTypes: ContentType[];
    deliveryTypes: DeliveryType[];
    performanceTypes: PerformanceType[];
    effectivenessMultiplier: number;
    choked: boolean;
  };
  segments: {
    player: SegmentScore[];
    opponent: SegmentScore[];
  };
  roundWinner: 'player' | 'opponent' | 'tie';
}

interface SegmentScore {
  segmentIndex: number;
  score: number;
  isPeak: boolean;
  isChoke: boolean;
  isStumble: boolean;
}
```

**Key Visuals**:
- Score comparison with bars
- Winner highlight (green border on winner side)
- Choke/stumble indicators (red X or warning icon)
- Peak moment star indicator
- Segment timeline at bottom

---

### 7. SegmentTimeline

**File**: `components/battle/SegmentTimeline.tsx`

**Purpose**: Visual timeline of segment scores for a round

```typescript
interface SegmentTimelineProps {
  segments: SegmentScore[];
  showLabels?: boolean;
  compact?: boolean;
}
```

**Layout**:
```
[1: 8.5] [2: 8.8] [3: 9.2★] [4: 8.3]
   │        │         │        │
   ▼        ▼         ▼        ▼
  ████    █████    ██████★    ███
```

**Visual Indicators**:
- Peak: Star icon, green background `bg-green-500/20`
- Choke: X icon, red background `bg-red-500/20`
- Stumble: Warning icon, orange background `bg-orange-500/20`
- Normal: Gray background `bg-zinc-700`

---

### 8. BattleScoreTracker

**File**: `components/battle/BattleScoreTracker.tsx`

**Purpose**: Shows current round-by-round score

```typescript
interface BattleScoreTrackerProps {
  rounds: Array<{
    roundIndex: number;
    playerWon: boolean | null; // null = not yet played
    tie: boolean;
  }>;
  playerName: string;
  opponentName: string;
}
```

**Layout**:
```
┌──────────────────────────────────────────┐
│  YOU  [●] [○] [○]  vs  [○] [●] [ ]  OPP  │
│        1   2   3                         │
│                                          │
│  Current: 1-1 (Round 3 deciding!)        │
└──────────────────────────────────────────┘
```

**Round Indicators**:
- Player won: `●` filled green
- Opponent won: `●` filled red
- Tie: `◐` half-filled gray
- Not played: `○` empty

---

### 9. ContentTypeBadge

**File**: `components/battle/ContentTypeBadge.tsx`

**Purpose**: Small badge showing a content/delivery/performance type

```typescript
interface ContentTypeBadgeProps {
  type: ContentType | DeliveryType | PerformanceType;
  category: 'content' | 'delivery' | 'performance';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}
```

**Colors by Category**:
- Content: `bg-purple-500/20 text-purple-400 border-purple-500/30`
- Delivery: `bg-blue-500/20 text-blue-400 border-blue-500/30`
- Performance: `bg-emerald-500/20 text-emerald-400 border-emerald-500/30`

---

### 10. QuickSelectPresets

**File**: `components/battle/QuickSelectPresets.tsx`

**Purpose**: Pre-made content selection presets for faster selection

```typescript
interface QuickSelectPresetsProps {
  onSelect: (selections: RoundSelections) => void;
  playerBadges: string[];
}

const PRESETS = [
  {
    name: 'Tech Heavy',
    description: 'For purist crowds',
    selections: {
      contentTypes: ['wordplay', 'schemes', 'punchlines'],
      deliveryTypes: ['smooth_flow'],
      performanceTypes: ['minimalist']
    }
  },
  {
    name: 'Street Mode',
    description: 'Authenticity first',
    selections: {
      contentTypes: ['gun_bars', 'street_talk', 'personals'],
      deliveryTypes: ['aggressive'],
      performanceTypes: ['stage_presence']
    }
  },
  {
    name: 'Entertainment',
    description: 'Crowd favorite',
    selections: {
      contentTypes: ['comedy', 'name_flips', 'pop_culture_refs'],
      deliveryTypes: ['conversational'],
      performanceTypes: ['charismatic', 'crowd_interaction']
    }
  },
  {
    name: 'Badge-Based',
    description: 'Based on your badges',
    selections: null // Calculated from player badges
  }
];
```

**Layout**:
```
┌─ QUICK PRESETS ────────────────────────────────────────────┐
│                                                            │
│  [ TECH HEAVY ]  [ STREET MODE ]  [ ENTERTAINMENT ]        │
│                                                            │
│  [ BADGE-BASED (Recommended) ]                             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Pages to Build

### 1. Mode Selection Page

**File**: `app/battle/[id]/mode/page.tsx`

**Route**: `/battle/[id]/mode`

**When Shown**: After prep lock, status = `awaiting_lock_in_choice`

**Components Used**:
- ModeSelectionCard (x2)
- Battle info header

**API Calls**:
- `GET /api/battles/[id]` - Get battle details
- `POST /api/battles/[id]/lock-in` - Submit mode choice

---

### 2. Round Crafting Page

**File**: `app/battle/[id]/round/[roundNum]/page.tsx`

**Route**: `/battle/[id]/round/1`, `/battle/[id]/round/2`, `/battle/[id]/round/3`

**When Shown**: Status = `awaiting_r1_content`, `awaiting_r2_content`, `awaiting_r3_content`

**Components Used**:
- RoundContentSelector
- EffectivenessForecast
- QuickSelectPresets
- BattleScoreTracker
- ContentCategorySection (x3)
- ContentTypeCard (x29 total)

**API Calls**:
- `GET /api/battles/[id]` - Get battle and opponent info
- `GET /api/battles/[id]/rounds/[roundNum]/forecast` - Get effectiveness forecast
- `POST /api/battles/[id]/rounds/[roundNum]/content` - Submit selections

---

### 3. Round Results Page

**File**: `app/battle/[id]/round/[roundNum]/results/page.tsx`

**Route**: `/battle/[id]/round/1/results`, etc.

**When Shown**: After round simulation

**Components Used**:
- RoundResultsCard
- SegmentTimeline
- BattleScoreTracker
- ContentTypeBadge

**API Calls**:
- `GET /api/battles/[id]/rounds/[roundNum]` - Get round results

**Navigation**:
- Round 1/2 results → "Continue to Round X" → next round crafting
- Round 3 results → "View Final Results" → battle results page

---

### 4. Updated Battle Results Page

**File**: `app/battle/[id]/page.tsx` (enhance existing)

**Additional Data Shown**:
- Content selections per round (if Locked In mode)
- Effectiveness multipliers per round
- Mode used (Locked In vs Auto badge)

---

## API Endpoints

### POST /api/battles/[id]/lock-in

**Request**:
```typescript
{
  mode: 'locked_in' | 'auto'
}
```

**Response** (Locked In):
```typescript
{
  battle: Battle,
  status: 'awaiting_r1_content',
  nextRound: 1
}
```

**Response** (Auto):
```typescript
{
  battle: Battle,
  status: 'completed',
  results: BattleResults
}
```

---

### GET /api/battles/[id]/rounds/[roundNum]/forecast

**Query Params**:
```
contentTypes=personals,wordplay,punchlines
deliveryTypes=aggressive
performanceTypes=theatrical
```

**Response**:
```typescript
{
  forecast: {
    finalMultiplier: 1.44,
    effectiveness: 1.22,
    crowdPreference: 1.14,
    contextModifier: 1.03,
    strongAgainst: ['comedy', 'gun_bars'],
    weakAgainst: [],
    opponentPredictedTypes: ['gun_bars', 'street_talk', 'personals']
  }
}
```

---

### POST /api/battles/[id]/rounds/[roundNum]/content

**Request**:
```typescript
{
  contentTypes: ['personals', 'wordplay', 'punchlines'],
  deliveryTypes: ['aggressive'],
  performanceTypes: ['theatrical']
}
```

**Response**:
```typescript
{
  selection: {
    id: 'uuid',
    battleId: 'uuid',
    battlerId: 'uuid',
    roundIndex: 1,
    contentTypes: [...],
    deliveryTypes: [...],
    performanceTypes: [...],
    autoSelected: false
  },
  opponentSelection: {
    // AI's auto-selected content (revealed after submission)
    contentTypes: [...],
    deliveryTypes: [...],
    performanceTypes: [...]
  },
  forecast: {
    finalMultiplier: 1.44,
    effectiveness: 1.22,
    ...
  },
  nextStep: 'simulate' // or 'awaiting_opponent' for future PvP
}
```

---

### POST /api/battles/[id]/rounds/[roundNum]/simulate

**Request**: (empty body)

**Response**:
```typescript
{
  playerRound: {
    averageScore: 8.93,
    peakScore: 9.2,
    consistencyScore: 87,
    contentTypes: ['personals', 'wordplay', 'punchlines'],
    deliveryTypes: ['aggressive'],
    performanceTypes: ['theatrical'],
    effectivenessMultiplier: 1.22,
    crowdPreferenceMultiplier: 1.14,
    contextModifier: 1.03,
    finalMultiplier: 1.44,
    choked: false,
    stumbled: false
  },
  opponentRound: {
    averageScore: 7.21,
    peakScore: 7.8,
    consistencyScore: 72,
    contentTypes: ['gun_bars', 'street_talk', 'personals'],
    effectivenessMultiplier: 0.88,
    choked: false
  },
  playerSegments: [
    { segmentIndex: 1, score: 8.5, isPeak: false, isChoke: false, isStumble: false },
    { segmentIndex: 2, score: 8.8, isPeak: false, isChoke: false, isStumble: false },
    { segmentIndex: 3, score: 9.2, isPeak: true, isChoke: false, isStumble: false },
    { segmentIndex: 4, score: 8.3, isPeak: false, isChoke: false, isStumble: false }
  ],
  opponentSegments: [...],
  roundWinner: 'player',
  currentScore: { player: 1, opponent: 0 },
  nextStatus: 'awaiting_r2_content' // or 'completed' after round 3
}
```

---

### GET /api/battles/[id]/rounds/[roundNum]

**Response**: Same as simulate response above (for viewing past rounds)

---

## Styling Constants

### Colors

```typescript
// Category colors
const CATEGORY_COLORS = {
  content: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    hover: 'hover:border-purple-500/50'
  },
  delivery: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    hover: 'hover:border-blue-500/50'
  },
  performance: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    hover: 'hover:border-emerald-500/50'
  }
};

// Effectiveness colors
const EFFECTIVENESS_COLORS = {
  strong: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30',
    ring: 'ring-green-500/30'
  },
  neutral: {
    bg: 'bg-zinc-800',
    text: 'text-zinc-300',
    border: 'border-zinc-700'
  },
  weak: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30'
  }
};

// Multiplier scale colors
const MULTIPLIER_COLORS = {
  terrible: 'text-red-500',      // 0.5x - 0.8x
  poor: 'text-orange-500',       // 0.8x - 1.0x
  neutral: 'text-zinc-100',      // 1.0x - 1.2x
  good: 'text-green-500',        // 1.2x - 1.5x
  excellent: 'text-green-400'    // 1.5x - 2.0x
};
```

### Typography

```typescript
// Round titles
const ROUND_TITLE = 'font-black text-2xl uppercase tracking-tighter';

// Category headers
const CATEGORY_HEADER = 'font-bold text-sm uppercase tracking-wider text-zinc-400';

// Type names
const TYPE_NAME = 'font-bold text-sm uppercase';

// Multiplier display
const MULTIPLIER_LARGE = 'font-black text-4xl tabular-nums';
const MULTIPLIER_SMALL = 'font-bold text-lg tabular-nums';
```

### Spacing

```typescript
// Grid layouts
const CONTENT_GRID = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3';
const DELIVERY_GRID = 'grid grid-cols-2 sm:grid-cols-3 gap-3';
const PERFORMANCE_GRID = 'grid grid-cols-2 sm:grid-cols-4 gap-3';

// Section spacing
const SECTION_SPACING = 'space-y-6';
const CARD_PADDING = 'p-4';
```

---

## Data Types

### Content Type Enum

```typescript
type ContentType =
  | 'personals'
  | 'wordplay'
  | 'schemes'
  | 'punchlines'
  | 'comedy'
  | 'storytelling'
  | 'gun_bars'
  | 'street_talk'
  | 'freestyles'
  | 'rebuttals'
  | 'pop_culture_refs'
  | 'name_flips'
  | 'shock_value'
  | 'social_commentary';
```

### Delivery Type Enum

```typescript
type DeliveryType =
  | 'aggressive'
  | 'smooth_flow'
  | 'speed_rapping'
  | 'staccato'
  | 'passionate'
  | 'nonchalant'
  | 'conversational';
```

### Performance Type Enum

```typescript
type PerformanceType =
  | 'stage_presence'
  | 'crowd_interaction'
  | 'theatrical'
  | 'charismatic'
  | 'dynamic_range'
  | 'facial_expression'
  | 'strategic_pauses'
  | 'minimalist';
```

### Type Descriptions

```typescript
const CONTENT_TYPE_INFO: Record<ContentType, { name: string; description: string }> = {
  personals: {
    name: 'PERSONALS',
    description: 'Direct personal attacks on opponent\'s life, family, secrets'
  },
  wordplay: {
    name: 'WORDPLAY',
    description: 'Clever word manipulation, double meanings, puns'
  },
  schemes: {
    name: 'SCHEMES',
    description: 'Extended metaphors, multi-bar setups with payoffs'
  },
  punchlines: {
    name: 'PUNCHLINES',
    description: 'Hard-hitting memorable knockout lines'
  },
  comedy: {
    name: 'COMEDY',
    description: 'Humor-based attacks, jokes that undermine opponent'
  },
  storytelling: {
    name: 'STORYTELLING',
    description: 'Narrative-driven content painting vivid pictures'
  },
  gun_bars: {
    name: 'GUN BARS',
    description: 'Violent imagery and street threats'
  },
  street_talk: {
    name: 'STREET TALK',
    description: 'Authentic street culture references'
  },
  freestyles: {
    name: 'FREESTYLES',
    description: 'Improvised on-the-spot content'
  },
  rebuttals: {
    name: 'REBUTTALS',
    description: 'Direct responses to opponent\'s material'
  },
  pop_culture_refs: {
    name: 'POP CULTURE',
    description: 'Current events, movies, sports references'
  },
  name_flips: {
    name: 'NAME FLIPS',
    description: 'Creative alterations of opponent\'s name'
  },
  shock_value: {
    name: 'SHOCK VALUE',
    description: 'Controversial or unexpected content'
  },
  social_commentary: {
    name: 'SOCIAL COMMENTARY',
    description: 'Political/social issues woven into attacks'
  }
};

const DELIVERY_TYPE_INFO: Record<DeliveryType, { name: string; description: string }> = {
  aggressive: {
    name: 'AGGRESSIVE',
    description: 'Intense, confrontational, intimidating tone'
  },
  smooth_flow: {
    name: 'SMOOTH FLOW',
    description: 'Fluid, effortless, melodic delivery'
  },
  speed_rapping: {
    name: 'SPEED RAPPING',
    description: 'Exceptionally fast-paced delivery'
  },
  staccato: {
    name: 'STACCATO',
    description: 'Sharp, punctuated, choppy rhythm'
  },
  passionate: {
    name: 'PASSIONATE',
    description: 'Emotional, intense conviction'
  },
  nonchalant: {
    name: 'NONCHALANT',
    description: 'Effortlessly cool, unbothered'
  },
  conversational: {
    name: 'CONVERSATIONAL',
    description: 'Casual, relatable tone'
  }
};

const PERFORMANCE_TYPE_INFO: Record<PerformanceType, { name: string; description: string }> = {
  stage_presence: {
    name: 'STAGE PRESENCE',
    description: 'Commands attention, owns the space'
  },
  crowd_interaction: {
    name: 'CROWD INTERACTION',
    description: 'Engages audience directly'
  },
  theatrical: {
    name: 'THEATRICAL',
    description: 'Dramatic, exaggerated performance'
  },
  charismatic: {
    name: 'CHARISMATIC',
    description: 'Charming, naturally engaging'
  },
  dynamic_range: {
    name: 'DYNAMIC RANGE',
    description: 'Varies volume and intensity'
  },
  facial_expression: {
    name: 'FACIAL EXPRESSION',
    description: 'Uses face to convey emotion/mockery'
  },
  strategic_pauses: {
    name: 'STRATEGIC PAUSES',
    description: 'Uses silence for emphasis'
  },
  minimalist: {
    name: 'MINIMALIST',
    description: 'Controlled, subtle gestures'
  }
};
```

---

## Integration Notes

### Prep System Update

The existing prep system has options: `rest`, `writing`, `performance`, `research`, `life`

**Rename**: `performance` → `rehearse`

This is just a display name change - the backend value stays `performance` for backward compatibility.

```typescript
// In prep planner UI
const PREP_FOCUS_DISPLAY_NAMES = {
  rest: 'REST',
  writing: 'WRITING',
  performance: 'REHEARSE', // Changed from 'PERFORMANCE'
  research: 'RESEARCH',
  life: 'LIFE'
};
```

### Battle Status Flow Update

Current flow:
```
offered → accepted → locked → simulated → completed
```

New flow with round crafting:
```
offered → accepted → locked → awaiting_lock_in_choice →
  → (if auto) simulated → completed
  → (if locked_in) awaiting_r1_content → r1_simulated →
    awaiting_r2_content → r2_simulated →
    awaiting_r3_content → r3_simulated → completed
```

### Database Schema Already Exists

The `round_content_selections` table is already defined in:
`supabase/migrations/20251128000000_add_round_content_selections.sql`

No additional migrations needed.

### Simulation Integration

The existing simulation in `lib/game/simulation.ts` needs to be updated to:
1. Accept content selections as input
2. Apply effectiveness multipliers to round scores
3. Store content metadata in `battle_rounds` table

---

## Component Checklist

| Component | File | Priority |
|-----------|------|----------|
| ModeSelectionCard | `components/battle/ModeSelectionCard.tsx` | HIGH |
| ContentTypeCard | `components/battle/ContentTypeCard.tsx` | HIGH |
| ContentCategorySection | `components/battle/ContentCategorySection.tsx` | HIGH |
| EffectivenessForecast | `components/battle/EffectivenessForecast.tsx` | HIGH |
| RoundContentSelector | `components/battle/RoundContentSelector.tsx` | HIGH |
| RoundResultsCard | `components/battle/RoundResultsCard.tsx` | HIGH |
| SegmentTimeline | `components/battle/SegmentTimeline.tsx` | MEDIUM |
| BattleScoreTracker | `components/battle/BattleScoreTracker.tsx` | MEDIUM |
| ContentTypeBadge | `components/battle/ContentTypeBadge.tsx` | MEDIUM |
| QuickSelectPresets | `components/battle/QuickSelectPresets.tsx` | LOW |

## Page Checklist

| Page | Route | Priority |
|------|-------|----------|
| Mode Selection | `/battle/[id]/mode` | HIGH |
| Round Crafting | `/battle/[id]/round/[roundNum]` | HIGH |
| Round Results | `/battle/[id]/round/[roundNum]/results` | HIGH |
| Battle Results (update) | `/battle/[id]` | MEDIUM |

## API Checklist

| Endpoint | Method | Priority |
|----------|--------|----------|
| `/api/battles/[id]/lock-in` | POST | HIGH |
| `/api/battles/[id]/rounds/[roundNum]/content` | POST | HIGH |
| `/api/battles/[id]/rounds/[roundNum]/simulate` | POST | HIGH |
| `/api/battles/[id]/rounds/[roundNum]/forecast` | GET | MEDIUM |
| `/api/battles/[id]/rounds/[roundNum]` | GET | MEDIUM |

---

**End of Spec**
**Ready for V0 Implementation**
