# Phase 2E: Round Content Selection System - User Flow Diagram

## Visual User Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PREP PHASE COMPLETE                          │
│                    /battle/[id]/prep (existing)                     │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BATTLE CONTROL SCREEN                          │
│                    /battle/[id]/control (NEW)                       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Battle Info: Opponent, League, Schedule                    │  │
│  │  Prep Summary: Research(3) Writing(4) Performance(2) etc.   │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Context Selection: [In Building] [PPV] [On Cam]            │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────┐         ┌──────────────────────┐        │
│  │   🎯 LOCKED IN       │         │    ⚡ AUTO           │        │
│  │   Strategic Mode     │         │    Quick Results     │        │
│  │                      │         │                      │        │
│  │   Round-by-round     │         │   AI auto-selects    │        │
│  │   content selection  │         │   instant battle     │        │
│  │                      │         │                      │        │
│  │  [Go Locked In]      │         │   [Go Auto]          │        │
│  └──────────┬───────────┘         └──────────┬───────────┘        │
└─────────────┼──────────────────────────────────┼──────────────────┘
              │                                  │
              │ LOCKED IN PATH                   │ AUTO PATH
              │                                  │
              ▼                                  ▼
┌─────────────────────────────────┐    ┌────────────────────────┐
│   ROUND 1 CONTENT SELECTION     │    │   AUTO SIMULATION      │
│  /battle/[id]/round/1/select     │    │   (all 3 rounds)       │
│           (NEW)                  │    │                        │
│                                  │    │   - AI picks content   │
│  ┌────────────────────────────┐ │    │   - Simulates all      │
│  │ Opponent Analysis:         │ │    │   - Generates results  │
│  │  - Style badges            │ │    │                        │
│  │  - Predicted content       │ │    └────────┬───────────────┘
│  └────────────────────────────┘ │             │
│                                  │             ▼
│  ┌────────────────────────────┐ │    ┌────────────────────────┐
│  │ YOUR CONTENT SELECTION:    │ │    │   FINAL RESULTS        │
│  │                            │ │    │  /battle/[id]/results  │
│  │ [Content Types] (3-4)      │ │    │                        │
│  │ [Delivery Types] (1-2)     │ │    │  Full battle summary   │
│  │ [Performance Types] (1-2)  │ │    │  with all 3 rounds     │
│  └────────────────────────────┘ │    └────────────────────────┘
│                                  │
│  ┌────────────────────────────┐ │
│  │ EFFECTIVENESS FORECAST:    │ │
│  │                            │ │
│  │  Content:     1.8x  🟢    │ │
│  │  Crowd:       1.2x  🟢    │ │
│  │  Context:     1.0x  ⚪    │ │
│  │  FINAL:       2.16x 🟢    │ │
│  │                            │ │
│  │  Strong vs: Wordplay...    │ │
│  │  Weak vs: Aggression...    │ │
│  └────────────────────────────┘ │
│                                  │
│         [Confirm Selection]      │
└─────────────┬────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ROUND 1 RESULTS SCREEN                           │
│              /battle/[id]/round/1/results (NEW)                     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │               [Simulate Round 1] Button                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                      ▼ (after simulation)                           │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              🏆 YOU WIN THIS ROUND! 🏆                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  SEGMENT TIMELINE:                                           │  │
│  │  Seg 1:  You ████████████ 85  vs  Opp ████████ 72           │  │
│  │  Seg 2:  You ██████████ 78    vs  Opp ████████████ 88       │  │
│  │  Seg 3:  You █████████████ 92 vs  Opp ████████ 75 ⭐       │  │
│  │  Seg 4:  You ██████████ 80    vs  Opp █████████ 79          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────┐         ┌──────────────────────┐        │
│  │   YOUR STATS         │         │   OPPONENT STATS     │        │
│  │   Average:    83.8   │         │   Average:    78.5   │        │
│  │   Peak:       92.0   │         │   Peak:       88.0   │        │
│  │   Consistency: 85.2  │         │   Consistency: 75.3  │        │
│  │   Crowd:       87    │         │   Crowd:       79    │        │
│  └──────────────────────┘         └──────────────────────┘        │
│                                                                     │
│  ┌──────────────────────┐         ┌──────────────────────┐        │
│  │  YOUR CONTENT        │         │  OPP CONTENT         │        │
│  │  Wordplay, Punchlines│         │  Gun Bars, Street... │        │
│  │  Smooth Flow         │         │  Aggressive          │        │
│  │  Stage Presence      │         │  Theatrical          │        │
│  │                      │         │                      │        │
│  │  Effectiveness: 1.8x │         │  Effectiveness: 0.7x │        │
│  │  Crowd Pref:    1.2x │         │  Crowd Pref:    0.9x │        │
│  │  Context:       1.0x │         │  Context:       1.0x │        │
│  │  FINAL:         2.16x│         │  FINAL:         0.63x│        │
│  └──────────────────────┘         └──────────────────────┘        │
│                                                                     │
│                    [Next Round →]                                   │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ROUND 2 CONTENT SELECTION                        │
│              /battle/[id]/round/2/select (NEW)                      │
│                                                                     │
│              (Same interface as Round 1 select)                     │
│                                                                     │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ROUND 2 RESULTS SCREEN                           │
│              /battle/[id]/round/2/results (NEW)                     │
│                                                                     │
│              (Same interface as Round 1 results)                    │
│                                                                     │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ROUND 3 CONTENT SELECTION                        │
│              /battle/[id]/round/3/select (NEW)                      │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ROUND 3 RESULTS SCREEN                           │
│              /battle/[id]/round/3/results (NEW)                     │
│                                                                     │
│              [View Final Results →]                                 │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FINAL BATTLE RESULTS                         │
│                  /battle/[id]/final-results                         │
│                        (Existing page)                              │
│                                                                     │
│                    Overall winner, rating changes,                  │
│                    grudge updates, media articles                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App Layout
└── Battle Control Page (/battle/[id]/control)
    ├── Battle Info Card
    ├── Prep Summary Card
    ├── Context Selector
    └── Mode Selection Cards
        ├── Locked In Card → redirects to Round 1 Select
        └── Auto Card → triggers full simulation → redirects to Final Results

Round Content Selection Page (/battle/[id]/round/[roundNum]/select)
├── Opponent Analysis Card
├── RoundContentSelector Component
│   ├── Content Types Column (14 types, select 3-4)
│   ├── Delivery Types Column (7 types, select 1-2)
│   └── Performance Types Column (8 types, select 1-2)
├── EffectivenessForecast Component
│   ├── Multiplier Stats Grid
│   │   ├── Content Effectiveness
│   │   ├── Crowd Preference
│   │   ├── Context Modifier
│   │   └── Final Multiplier
│   └── Matchup Analysis
│       ├── Strong Against List
│       └── Weak Against List
└── Confirm Selection Button

Round Results Page (/battle/[id]/round/[roundNum]/results)
├── Pre-simulation State
│   └── [Simulate Round] Button
└── Post-simulation State
    ├── RoundResultsBreakdown Component
    │   ├── Winner Banner
    │   ├── Segment Timeline
    │   │   └── Horizontal bar chart for each segment
    │   ├── Score Comparison Grid
    │   │   ├── Your Stats Card
    │   │   └── Opponent Stats Card
    │   └── Content Effectiveness Breakdown
    │       ├── Your Content Card
    │       │   ├── Content Types List
    │       │   ├── Delivery Types List
    │       │   ├── Performance Types List
    │       │   └── Multipliers Display
    │       └── Opponent Content Card
    │           └── (same structure)
    └── Navigation Controls
        └── [Next Round] or [View Final Results] Button
```

---

## Data Flow

### Page Load Sequence

**Control Page:**
```
1. Fetch /api/battles/[id] → get battle data
2. Fetch /api/battles/[id]/prep → get prep blocks
3. Calculate prep summary (count by focus type)
4. Display battle info and mode selection
```

**Content Selection Page:**
```
1. Fetch /api/battles/[id] → get battle data
2. Extract opponent style_tags and league name
3. Call predictOpponentContent() → generate AI prediction
4. Display opponent analysis
5. User selects content types
6. On selection change → calculateEffectivenessForecast()
7. Update forecast display in real-time
8. On confirm → POST /api/battles/[id]/rounds/[roundNum]/content
9. Redirect to results page
```

**Results Page (Pre-simulation):**
```
1. Fetch /api/battles/[id] → get battle data
2. Fetch /api/battles/[id]/rounds/[roundNum] → get round data
3. If no round data → show "Simulate Round" button
4. On simulate → POST /api/battles/[id]/rounds/[roundNum]/simulate
5. Refresh round data
6. Display results
```

**Results Page (Post-simulation):**
```
1. Fetch round data with segments
2. Calculate winner from scores
3. Display RoundResultsBreakdown component
4. Show navigation to next round
```

---

## State Transitions

### Battle Status Flow (Locked In Mode)

```
'locked' (prep complete)
    ↓
'awaiting_lock_in_choice' (control page)
    ↓
'awaiting_r1_content' (round 1 select)
    ↓
'r1_simulated' (round 1 results)
    ↓
'awaiting_r2_content' (round 2 select)
    ↓
'r2_simulated' (round 2 results)
    ↓
'awaiting_r3_content' (round 3 select)
    ↓
'r3_simulated' (round 3 results)
    ↓
'completed' (final results)
```

### Battle Status Flow (Auto Mode)

```
'locked' (prep complete)
    ↓
'awaiting_lock_in_choice' (control page)
    ↓
'simulated' (auto-simulation)
    ↓
'completed' (final results)
```

---

## Key Interactions

### Selection Validation

**Content Types:** 3-4 required
- Less than 3: Button disabled, counter shows orange
- 3-4: Valid, counter shows green
- Trying to add 5th: Button disabled

**Delivery Types:** 1-2 required
- 0: Button disabled
- 1-2: Valid
- Trying to add 3rd: Button disabled

**Performance Types:** 1-2 required
- 0: Button disabled
- 1-2: Valid
- Trying to add 3rd: Button disabled

### Effectiveness Calculation

**Real-time updates:**
1. User selects/deselects a type
2. Component state updates
3. `onSelectionChange` callback fires
4. Forecast component recalculates
5. Multipliers update with color coding
6. Strong/weak lists update

**Multiplier formula:**
```
Final = Effectiveness × Crowd × Context

Where:
- Effectiveness: vs opponent's content (0.5x to 2.0x)
- Crowd: league demographic preference (0.8x to 1.5x)
- Context: in building/PPV/on cam (0.9x to 1.2x)
```

---

## Mobile Responsiveness

### Desktop (lg+)
- 3-column grid for content selector
- 2-column grid for score comparison
- 4-card grid for multipliers

### Tablet (md)
- 3-column grid maintained
- 2-column grid maintained
- Slightly reduced padding

### Mobile (sm)
- 1-column stack for content selector
- 1-column stack for score comparison
- 2×2 grid for multipliers
- Larger touch targets
- Reduced font sizes

---

## Performance Considerations

### Optimization Strategies
- Components only re-render when selection changes
- Effectiveness calculations are pure functions (no side effects)
- API calls are debounced where appropriate
- Loading states prevent duplicate requests
- Segment timeline uses CSS for performance (not canvas)

### Bundle Size
- No additional dependencies added
- Reuses existing TailwindCSS classes
- TypeScript interfaces don't add runtime overhead
- Components are tree-shakeable

---

**User Flow Status: COMPLETE**

All navigation paths, state transitions, and data flows are fully implemented and documented.
