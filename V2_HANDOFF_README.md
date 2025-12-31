# V2 Handoff - Battle Rap University

**Date**: December 3, 2025
**Version**: 2.0 - Segment-Based Prep System

This is your master guide for V2 features. V1 core flow is working - now we add depth.

---

## WHAT'S NEW IN V2

V2 transforms prep from "pick daily focus" to a complete battle preparation system that mirrors real battle rap.

### Core Changes

| Feature | V1 (Current) | V2 (New) |
|---------|--------------|----------|
| Content | Round-based (pick per round) | Segment-based (craft then organize) |
| Prep | Daily focus only | Research → Write → Rehearse pipeline |
| Research | Not tracked | Casual vs Aggressive levels |
| Counters | None | Prepare for anticipated content |
| Round Order | Fixed | Can shift based on opponent |
| Freestyle | Not supported | Can mark segments as freestyle |

---

## DOCUMENTS TO READ

### 1. V2_FEATURES_SPEC.md
**What**: Complete feature breakdown
- Segment-based content system
- Research levels
- Counter preparation
- Round shifting
- Badge effects

### 2. V2_COMPONENTS_SPEC.md
**What**: New components to build
- SegmentCreator
- RoundOrganizer
- CounterSlotManager
- ResearchLevelIndicator
- PrepPipeline

### 3. V2_API_CONTRACT.md
**What**: New/updated API endpoints
- Segment CRUD
- Counter management
- Research level tracking
- Round organization

### 4. V2_AUDIT_CHECKLIST.md
**What**: Verification checklist
- Feature completeness
- Data flow
- UI requirements

### 5. ROUND_CRAFTING_AND_PREP_SYSTEM_V2.md
**What**: Full system design document (already exists)
- Real battle rap research
- Complete game flow
- Badge interactions

---

## V2 FEATURE PRIORITY

### Phase 1: Core Content System (HIGH)
1. Segment-based content creation
2. Round organization (assign segments to rounds)
3. Research level tracking (Casual/Aggressive)
4. Updated prep page with content crafting

### Phase 2: Counter System (MEDIUM)
5. Counter slot (1 default)
6. Counter effectiveness calculation
7. Badge effects on counter slots

### Phase 3: Advanced Features (LOWER)
8. Round shifting (change round order mid-battle)
9. Freestyle segments
10. New prep badges

---

## KEY CONCEPT: SEGMENTS

**Everything is segments now, not rounds.**

| Round Length | Segments per Round | Total for 3 Rounds |
|--------------|--------------------|--------------------|
| 90 seconds | 3 | 9 segments |
| 2 minutes | 4 | 12 segments |
| 3 minutes | 6 | 18 segments |

**Player workflow**:
1. Research opponent (days 1-3)
2. Write segments (days 4-10)
3. Organize segments into rounds
4. Rehearse rounds (days 11-14)
5. Battle

**Each segment has**:
- 1 Content Type (Personals, Wordplay, etc.)
- 1 Delivery Type (Aggressive, Smooth, etc.)
- 1 Performance Type (Stage Presence, Theatrical, etc.)
- Optional: Freestyle flag, Counter flag

---

## PREP PAGE TRANSFORMATION

### Current (V1)
```
┌─ BATTLE PREP ─────────────────────────────────────┐
│ vs OPPONENT • League Name                         │
│                                                   │
│ Day 1: [Research ▼]                              │
│ Day 2: [Writing ▼]                               │
│ Day 3: [Writing ▼]                               │
│ ...                                              │
│                                                   │
│ [SAVE & RETURN]  [READY TO BATTLE]               │
└───────────────────────────────────────────────────┘
```

### New (V2)
```
┌─ BATTLE PREP ─────────────────────────────────────────────────┐
│ VS GOTTI GEECHI • Main Stage Arena                            │
│ 3 ROUNDS • 3 MINUTES EACH • 18 SEGMENTS NEEDED               │
│ Battle in: 12 DAYS | Prep locks in: 10 DAYS                  │
│                                                               │
├─ PREP PROGRESS ───────────────────────────────────────────────┤
│ RESEARCH   ████████░░░░░░░░  Casual Level                    │
│ WRITING    ██████████████░░  14/18 segments                   │
│ REHEARSAL  ████░░░░░░░░░░░░  Round 1 only                    │
│                                                               │
├─ DAILY FOCUS ─────────────────────────────────────────────────┤
│ Day 1: [Research ▼]   Day 8: [Writing ▼]                     │
│ Day 2: [Research ▼]   Day 9: [Writing ▼]                     │
│ Day 3: [Research ▼]   Day 10: [Rehearsal ▼]                  │
│ Day 4: [Writing ▼]    Day 11: [Rehearsal ▼]                  │
│ Day 5: [Writing ▼]    Day 12: [Rest ▼]                       │
│ Day 6: [Writing ▼]    Day 13: [Rest ▼]                       │
│ Day 7: [Writing ▼]    Day 14: [Life ▼]                       │
│                                                               │
├─ CONTENT CRAFTING ────────────────────────────────────────────┤
│                                                               │
│  ROUND 1 (6 segs)    ROUND 2 (6 segs)    ROUND 3 (6 segs)   │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐      │
│  │ ✓ Wordplay │      │ ✓ Gun Bars │      │ ✓ Personals│      │
│  │ ✓ Schemes  │      │ ✓ Street   │      │ ✓ Punchline│      │
│  │ ✓ Punchline│      │ ○ Empty    │      │ ○ Empty    │      │
│  │ ✓ Comedy   │      │ ○ Empty    │      │ ○ Empty    │      │
│  │ ○ Empty    │      │ ○ Empty    │      │ ○ Empty    │      │
│  │ ○ Empty    │      │ ○ Empty    │      │ ○ Empty    │      │
│  └────────────┘      └────────────┘      └────────────┘      │
│                                                               │
│  [+ CREATE SEGMENT]                                           │
│                                                               │
│  COUNTER SLOT (1/1):                                         │
│  [+ Add Counter - anticipate opponent content]               │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ [SAVE & RETURN]                    [READY TO BATTLE →]       │
└───────────────────────────────────────────────────────────────┘
```

---

## IMMEDIATE PRIORITIES

### This Sprint: Segment System

1. **Update Prep Page**
   - Add header with round count, round length, segments needed
   - Add prep progress bars (research/writing/rehearsal)
   - Add content crafting section
   - Add counter slot

2. **Build Segment Creator**
   - Modal to create new segment
   - Select content/delivery/performance type
   - Option to mark as freestyle

3. **Build Round Organizer**
   - 3 columns for Round 1/2/3
   - Drag segments between rounds
   - Show empty slots

4. **Track Research Level**
   - None → Casual → Aggressive
   - Based on research days spent

### Next Sprint: Counter System

5. **Counter Slot Manager**
   - Create counter segments
   - Anticipate opponent content type
   - Risk/reward display

6. **Counter Calculation**
   - If opponent uses anticipated content: 1.5x
   - If opponent doesn't: 0.5x + credibility hit

### Future Sprint: Advanced

7. **Round Shifting** (after seeing opponent)
8. **Freestyle Segments** (no writing needed)
9. **New Badges** (Photographic Memory, Quick Writer, etc.)

---

## FILE STRUCTURE

### New/Modified Pages
```
app/battle/[id]/
├── prep/page.tsx          # MAJOR UPDATE - add content crafting
├── mode/page.tsx          # Minor - show prep summary
└── round/[roundNum]/
    └── page.tsx           # Update - use pre-organized segments
```

### New Components
```
components/
├── battle-prep/
│   ├── segment-creator.tsx        # NEW
│   ├── round-organizer.tsx        # NEW
│   ├── counter-slot-manager.tsx   # NEW
│   ├── research-level-indicator.tsx # NEW
│   ├── prep-pipeline.tsx          # NEW
│   ├── prep-progress-widget.tsx   # EXISTS - update
│   └── segment-crafting.tsx       # EXISTS - update
└── battle/
    └── ... (existing)
```

### New API Routes
```
app/api/battles/[id]/
├── segments/
│   ├── route.ts           # GET/POST segments
│   └── [segmentId]/
│       └── route.ts       # PUT/DELETE segment
├── counters/
│   └── route.ts           # GET/POST counters
└── research/
    └── route.ts           # GET research level
```

---

## DATA MODELS

### Segment
```typescript
interface Segment {
  id: string;
  battleId: string;
  roundNum: number | null;      // null = unassigned
  position: number | null;      // position in round (1-6)
  contentType: string;
  deliveryType: string;
  performanceType: string;
  isFreestyle: boolean;
  isCounter: boolean;
  counterTarget?: string;       // anticipated opponent content type
  createdAt: string;
}
```

### PrepProgress
```typescript
interface PrepProgress {
  battleId: string;
  researchLevel: 'none' | 'casual' | 'aggressive';
  researchDays: number;
  writingDays: number;
  rehearsalDays: number;
  segmentsWritten: number;
  segmentsNeeded: number;
  roundsRehearsed: number[];    // [1, 2] = rounds 1 and 2 rehearsed
}
```

### Counter
```typescript
interface Counter {
  id: string;
  battleId: string;
  segmentId: string;            // the counter segment
  anticipatedContent: string;   // what you expect opponent to say
  used: boolean;
  wasEffective: boolean | null;
}
```

---

## TESTING V2

### Test 1: Segment Creation
1. Go to prep page
2. Click "Create Segment"
3. Select content/delivery/performance
4. Segment appears in unassigned area
5. Drag to Round 1
6. Verify position saved

### Test 2: Research Progression
1. Set Day 1-2 to Research
2. Research level shows "Casual"
3. Set Day 3 to Research
4. Research level shows "Aggressive"

### Test 3: Counter System
1. Create a counter segment
2. Set anticipated content to "Personals"
3. Go through battle
4. If opponent uses Personals → Counter is 1.5x
5. If opponent doesn't → Counter is 0.5x

### Test 4: Round Organization
1. Create 12 segments
2. Drag 4 to each round
3. Save and reload
4. Verify organization persists
5. Enter battle → segments pre-loaded

---

## BACKEND STATUS

**Backend (Claude) will implement**:
- Segment database table
- Counter database table
- Research level calculation
- Segment effectiveness in simulation
- Counter resolution logic
- New badges

**Frontend (V0) should**:
- Build UI components
- Use mock data until APIs ready
- Handle drag-and-drop
- Form validation

---

## QUESTIONS FOR BACKEND

1. How does research level affect writing quality?
2. Exact penalty for using wrong counter?
3. Can segments be reused across battles?
4. How do freestyle segments work in simulation?

---

Good luck! Start with `V2_FEATURES_SPEC.md`.
