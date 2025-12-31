# V2 Components Specification

New and updated components for the V2 segment-based prep system.

---

## NEW COMPONENT 1: SegmentCreator

**Purpose**: Modal/form to create new segments

**File**: `components/battle-prep/segment-creator.tsx`

### Props
```typescript
interface SegmentCreatorProps {
  battleId: string;
  onSegmentCreated: (segment: Segment) => void;
  onCancel: () => void;
  researchLevel: 'none' | 'casual' | 'aggressive';
}
```

### Visual Design
```
┌─ CREATE SEGMENT ────────────────────────────────────────────┐
│                                                       [X]   │
│                                                             │
│  CONTENT TYPE                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Personals]  [Wordplay]  [Schemes]  [Punchlines]   │   │
│  │ [Comedy]  [Storytelling]  [Gun Bars]  [Street Talk] │   │
│  │ [Freestyles]  [Rebuttals]  [Pop Culture]           │   │
│  │ [Name Flips]  [Shock Value]  [Social Commentary]   │   │
│  └─────────────────────────────────────────────────────┘   │
│  Selected: Wordplay                                        │
│                                                             │
│  DELIVERY TYPE                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Aggressive]  [Smooth Flow]  [Speed Rapping]       │   │
│  │ [Staccato]  [Passionate]  [Nonchalant]             │   │
│  │ [Conversational]                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  Selected: Aggressive                                      │
│                                                             │
│  PERFORMANCE TYPE                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Stage Presence]  [Crowd Interaction]  [Theatrical] │   │
│  │ [Charismatic]  [Dynamic Range]  [Facial Expression] │   │
│  │ [Strategic Pauses]  [Minimalist]                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  Selected: Stage Presence                                  │
│                                                             │
│  ────────────────────────────────────────────────────────  │
│                                                             │
│  OPTIONS                                                   │
│  [ ] Mark as FREESTYLE (no writing needed)                │
│  [ ] Mark as COUNTER (for anticipated opponent content)   │
│                                                             │
│  ⚠️ Personals without Aggressive research may hurt         │
│     credibility if opponent calls you out.                 │
│                                                             │
│  ────────────────────────────────────────────────────────  │
│                                                             │
│  [CANCEL]                              [CREATE SEGMENT]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Behavior
1. User selects one content type (required)
2. User selects one delivery type (required)
3. User selects one performance type (required)
4. Optionally mark as freestyle
5. Optionally mark as counter
6. If counter: Show additional field for anticipated content
7. Show warning if Personals selected without Aggressive research
8. Submit creates segment via API

### Styling
```tsx
// Selected type badge
className="bg-[#ff8c42] text-black px-3 py-2 rounded-lg font-bold"

// Unselected type badge
className="bg-zinc-800 text-zinc-300 px-3 py-2 rounded-lg hover:bg-zinc-700"

// Warning banner
className="bg-orange-900/30 border border-orange-600 rounded-lg p-3 text-orange-300"

// Create button
className="bg-[#ff8c42] hover:bg-[#ff9f5a] text-black font-bold px-6 py-3 rounded-lg"
```

---

## NEW COMPONENT 2: RoundOrganizer

**Purpose**: Drag-and-drop interface to organize segments into rounds

**File**: `components/battle-prep/round-organizer.tsx`

### Props
```typescript
interface RoundOrganizerProps {
  battleId: string;
  segments: Segment[];
  roundCount: number;          // usually 3
  segmentsPerRound: number;    // 4 for 2-min, 6 for 3-min
  onSegmentMove: (segmentId: string, roundNum: number | null, position: number | null) => void;
}
```

### Visual Design
```
┌─ ROUND ORGANIZATION ────────────────────────────────────────┐
│                                                             │
│  UNASSIGNED (3)                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [≡ Wordplay/Aggressive/Theatrical]                  │   │
│  │ [≡ Comedy/Smooth/Charismatic]                       │   │
│  │ [≡ Gun Bars/Aggressive/Stage Presence] ★ COUNTER   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ────────────────────────────────────────────────────────  │
│                                                             │
│  ROUND 1              ROUND 2              ROUND 3         │
│  (4/4 segments)       (2/4 segments)       (0/4 segments)  │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐ │
│  │ 1. Wordplay │      │ 1. Personals│      │ 1. [Empty]  │ │
│  │ 2. Schemes  │      │ 2. Street   │      │ 2. [Empty]  │ │
│  │ 3. Punchline│      │ 3. [Empty]  │      │ 3. [Empty]  │ │
│  │ 4. Comedy   │      │ 4. [Empty]  │      │ 4. [Empty]  │ │
│  └─────────────┘      └─────────────┘      └─────────────┘ │
│  ✓ READY              ○ INCOMPLETE         ○ EMPTY         │
│  [Rehearsed]                                               │
│                                                             │
│  ────────────────────────────────────────────────────────  │
│                                                             │
│  LEGEND:                                                   │
│  ≡ = Drag handle  ★ = Counter  ⚡ = Freestyle  ✓ = Ready │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Behavior
1. Drag segments from Unassigned to rounds
2. Drag segments between rounds
3. Drag segments back to Unassigned
4. Reorder within a round by dragging
5. Cannot drop more than `segmentsPerRound` in a round
6. Visual feedback on valid/invalid drop zones
7. Auto-save on every change

### Drag-and-Drop Implementation
```tsx
// Use react-beautiful-dnd or similar
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Droppable areas:
// - "unassigned"
// - "round-1", "round-2", "round-3"

// On drag end:
const onDragEnd = (result: DropResult) => {
  const { source, destination, draggableId } = result;
  if (!destination) return;

  const roundNum = destination.droppableId === 'unassigned'
    ? null
    : parseInt(destination.droppableId.split('-')[1]);

  onSegmentMove(draggableId, roundNum, destination.index + 1);
};
```

### Styling
```tsx
// Round column
className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-4 min-h-[200px]"

// Ready round
className="border-green-600"

// Incomplete round
className="border-orange-600"

// Empty round
className="border-[#3a3d44]"

// Segment card
className="bg-zinc-800 border border-[#3a3d44] rounded p-2 mb-2 cursor-grab"

// Segment card (dragging)
className="bg-zinc-700 border border-[#ff8c42] shadow-lg"

// Empty slot
className="bg-zinc-900/50 border-2 border-dashed border-zinc-700 rounded p-2 mb-2 text-center text-zinc-600"
```

---

## NEW COMPONENT 3: ResearchLevelIndicator

**Purpose**: Show current research level and progress

**File**: `components/battle-prep/research-level-indicator.tsx`

### Props
```typescript
interface ResearchLevelIndicatorProps {
  level: 'none' | 'casual' | 'aggressive';
  daysSpent: number;
  daysForCasual: number;      // usually 2
  daysForAggressive: number;  // usually 3
}
```

### Visual Design
```
┌─ RESEARCH LEVEL ────────────────────────────────────────────┐
│                                                             │
│  ○ None        ◐ Casual        ● Aggressive                │
│                    ▲                                        │
│                 Current                                     │
│                                                             │
│  Progress: ████████████░░░░  3/4 days                      │
│                                                             │
│  CASUAL: Basic info (city, crew, losses)                   │
│  → AGGRESSIVE: Deep secrets, family, embarrassing moments  │
│                                                             │
│  💡 1 more research day for Aggressive level               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Styling
```tsx
// Level indicators
const levelStyles = {
  none: 'bg-zinc-700 text-zinc-400',
  casual: 'bg-yellow-600 text-black',
  aggressive: 'bg-red-600 text-white'
};

// Active level
className="ring-2 ring-[#ff8c42] ring-offset-2 ring-offset-zinc-900"
```

---

## NEW COMPONENT 4: CounterSlotManager

**Purpose**: Manage counter preparation slots

**File**: `components/battle-prep/counter-slot-manager.tsx`

### Props
```typescript
interface CounterSlotManagerProps {
  battleId: string;
  counters: Counter[];
  maxSlots: number;            // usually 1, badges add more
  onCounterCreate: (counter: Omit<Counter, 'id'>) => void;
  onCounterDelete: (counterId: string) => void;
}

interface Counter {
  id: string;
  segmentId: string;
  anticipatedContent: ContentType;
  segment: Segment;
}
```

### Visual Design
```
┌─ COUNTER PREPARATION ───────────────────────────────────────┐
│                                                             │
│  Prepare material for anticipated opponent content.        │
│  High risk, high reward!                                   │
│                                                             │
│  COUNTER SLOT 1/1                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  IF OPPONENT USES: [Personals ▼]                     │   │
│  │                                                       │   │
│  │  MY COUNTER SEGMENT:                                 │   │
│  │  ┌───────────────────────────────────────────────┐   │   │
│  │  │ Rebuttals / Aggressive / Theatrical           │   │   │
│  │  │ [Edit] [Remove]                               │   │   │
│  │  └───────────────────────────────────────────────┘   │   │
│  │                                                       │   │
│  │  EFFECTIVENESS:                                      │   │
│  │  ✓ If triggered: 1.5x (Super Effective!)           │   │
│  │  ✗ If missed: 0.5x (Looks over-prepared)           │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ○ COUNTER SLOT 2 [LOCKED - requires "Prepared" badge]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Behavior
1. Show available counter slots
2. Show locked slots (need badges to unlock)
3. Create counter by selecting anticipated content + segment
4. Can use existing segment or create new one
5. Display effectiveness multipliers
6. Allow removing counters

### Styling
```tsx
// Counter slot card
className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-4"

// Active counter
className="border-[#ff8c42]"

// Locked slot
className="bg-zinc-900/50 opacity-50 cursor-not-allowed"

// Effectiveness indicator (positive)
className="text-green-400"

// Effectiveness indicator (negative)
className="text-red-400"
```

---

## NEW COMPONENT 5: PrepPipeline

**Purpose**: Visual representation of prep phase dependencies

**File**: `components/battle-prep/prep-pipeline.tsx`

### Props
```typescript
interface PrepPipelineProps {
  research: {
    level: 'none' | 'casual' | 'aggressive';
    percent: number;
  };
  writing: {
    segmentsWritten: number;
    segmentsNeeded: number;
    percent: number;
  };
  rehearsal: {
    roundsRehearsed: number[];
    totalRounds: number;
    percent: number;
  };
}
```

### Visual Design
```
┌─ PREP PIPELINE ─────────────────────────────────────────────┐
│                                                             │
│  RESEARCH         →         WRITING         →    REHEARSAL │
│  ┌─────────────┐          ┌─────────────┐     ┌───────────┐│
│  │   Casual    │    →     │  14/18 segs │  →  │  1/3 rnds ││
│  │ ████████░░░ │          │ █████████░░ │     │ ████░░░░░ ││
│  │    75%      │          │     78%     │     │    33%    ││
│  └─────────────┘          └─────────────┘     └───────────┘│
│                                                             │
│  💡 Research enables better angles                         │
│  💡 Can't rehearse Round 2 yet (2 segments missing)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Styling
```tsx
// Pipeline stage
className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-4 text-center"

// Stage complete
className="border-green-600"

// Stage in progress
className="border-orange-500"

// Stage not started
className="border-zinc-700"

// Arrow connector
className="text-zinc-600 text-2xl"  // →

// Progress bar
className="bg-zinc-700 h-2 rounded-full overflow-hidden"
className="bg-[#ff8c42] h-full"  // fill
```

---

## NEW COMPONENT 6: PrepProgressBars

**Purpose**: Compact progress bars for research/writing/rehearsal

**File**: `components/battle-prep/prep-progress-bars.tsx`

### Props
```typescript
interface PrepProgressBarsProps {
  research: { percent: number; label: string };
  writing: { percent: number; label: string };
  rehearsal: { percent: number; label: string };
  compact?: boolean;
}
```

### Visual Design (Full)
```
┌─ PREP PROGRESS ─────────────────────────────────────────────┐
│                                                             │
│  RESEARCH    ████████░░░░░░░░  50% • Casual level          │
│  WRITING     ██████████████░░  85% • 10/12 segments        │
│  REHEARSAL   ████░░░░░░░░░░░░  25% • Round 1 only          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Design (Compact - for dashboard)
```
┌─────────────────────────────────────────────────────────────┐
│  R ████████░░  W ██████████░░  H ████░░░░░░░░              │
│    50%            85%            25%                        │
└─────────────────────────────────────────────────────────────┘
```

### Styling
```tsx
// Progress bar container
className="flex items-center gap-3"

// Label
className="text-xs text-zinc-500 uppercase w-20"

// Bar background
className="flex-1 bg-zinc-800 h-2 rounded-full overflow-hidden"

// Bar fill (by category)
const fillColors = {
  research: 'bg-blue-500',
  writing: 'bg-green-500',
  rehearsal: 'bg-purple-500'
};

// Percent text
className="text-xs text-zinc-400 w-16 text-right"
```

---

## NEW COMPONENT 7: RoundShiftModal

**Purpose**: Modal for shifting rounds mid-battle

**File**: `components/battle/round-shift-modal.tsx`

### Props
```typescript
interface RoundShiftModalProps {
  currentRound: number;        // round just completed
  remainingRounds: {
    roundNum: number;
    primaryContent: string;    // main content type
    isRehearsed: boolean;
  }[];
  onShift: (newOrder: number[]) => void;
  onKeep: () => void;
  opponentPerformance: 'weak' | 'average' | 'strong';
}
```

### Visual Design
```
┌─ ROUND SHIFT ───────────────────────────────────────────────┐
│                                                       [X]   │
│                                                             │
│  Opponent had a WEAK Round 1 (6.2/10)                      │
│                                                             │
│  You can shift your upcoming rounds:                       │
│                                                             │
│  CURRENT ORDER:                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Round 2: Gun Bars focus (your weakest)              │   │
│  │ Round 3: Personals focus (your strongest)           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  SHIFT TO:                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Round 2: Personals focus (your strongest)           │   │
│  │ Round 3: Gun Bars focus (your weakest)              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚠️ PENALTY:                                               │
│  • -5% consistency (adaptation confusion)                  │
│  • Round 3 was rehearsed: additional -10%                 │
│                                                             │
│  ────────────────────────────────────────────────────────  │
│                                                             │
│  [KEEP ORIGINAL ORDER]               [SHIFT ROUNDS]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## UPDATED COMPONENT: PrepProgressWidget (Dashboard)

**File**: `components/battle-prep/prep-progress-widget.tsx`

### Updated Props
```typescript
interface PrepProgressWidgetProps {
  battleId: string;
  opponent: {
    name: string;
    avatar?: string;
  };
  league: string;
  daysUntilBattle: number;
  research: {
    level: 'none' | 'casual' | 'aggressive';
    percent: number;
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

### Visual Design
```
┌─ ACTIVE BATTLE PREP ────────────────────────────────────────┐
│                                                             │
│  [Avatar] VS GOTTI GEECHI                                  │
│           Main Stage Arena                                  │
│           Battle in: 12 DAYS                               │
│                                                             │
│  ────────────────────────────────────────────────────────  │
│                                                             │
│  RESEARCH    ████████░░░░░░░░  Casual                      │
│  WRITING     ██████████████░░  14/18 segments              │
│  REHEARSAL   ████░░░░░░░░░░░░  1/3 rounds                  │
│                                                             │
│  ROUNDS:                                                    │
│  [✓ R1] [◐ R2] [○ R3]                                      │
│                                                             │
│  COUNTER: 1/1 ready                                        │
│                                                             │
│  [CONTINUE PREP →]                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## UPDATED COMPONENT: PrepPage Header

**File**: `app/battle/[id]/prep/page.tsx` (header section)

### New Header Section
```typescript
interface PrepHeaderProps {
  opponent: {
    name: string;
    avatar?: string;
  };
  league: {
    name: string;
    tier: string;
  };
  roundCount: number;
  roundLength: number;        // seconds
  segmentsPerRound: number;
  totalSegmentsNeeded: number;
  battleDate: string;
  prepLockDate: string;
  daysUntilBattle: number;
  daysUntilPrepLock: number;
}
```

### Visual Design
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Avatar]  VS GOTTI GEECHI                                 │
│            Main Stage Arena • God Tier                      │
│                                                             │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐  │
│  │   3 ROUNDS     │ │   3 MINUTES    │ │  18 SEGMENTS   │  │
│  │                │ │   per round    │ │    needed      │  │
│  └────────────────┘ └────────────────┘ └────────────────┘  │
│                                                             │
│  📅 Battle: DEC 20, 2024 (12 days)                         │
│  🔒 Prep Locks: DEC 18, 2024 (10 days)                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## COMPONENT IMPLEMENTATION ORDER

### Sprint 1 (Core)
1. SegmentCreator
2. PrepProgressBars
3. Update PrepPage header

### Sprint 2 (Organization)
4. RoundOrganizer
5. Update PrepPage with content crafting section

### Sprint 3 (Research)
6. ResearchLevelIndicator
7. PrepPipeline

### Sprint 4 (Counters)
8. CounterSlotManager

### Sprint 5 (Advanced)
9. RoundShiftModal
10. Update PrepProgressWidget for dashboard

---

## SHARED STYLING CONSTANTS

```typescript
// Add to lib/constants.ts or similar

export const PREP_COLORS = {
  research: {
    bg: 'bg-blue-500',
    text: 'text-blue-400',
    border: 'border-blue-600'
  },
  writing: {
    bg: 'bg-green-500',
    text: 'text-green-400',
    border: 'border-green-600'
  },
  rehearsal: {
    bg: 'bg-purple-500',
    text: 'text-purple-400',
    border: 'border-purple-600'
  }
};

export const RESEARCH_LEVELS = {
  none: { color: 'bg-zinc-600', label: 'None' },
  casual: { color: 'bg-yellow-500', label: 'Casual' },
  aggressive: { color: 'bg-red-500', label: 'Aggressive' }
};

export const ROUND_STATUS = {
  empty: { icon: '○', color: 'text-zinc-600' },
  partial: { icon: '◐', color: 'text-orange-400' },
  complete: { icon: '✓', color: 'text-green-400' },
  rehearsed: { icon: '✓✓', color: 'text-green-500' }
};
```

---

**End of Components Spec**
