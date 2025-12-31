# V2 API Contract

New and updated API endpoints for the V2 segment-based prep system.

---

## NEW ENDPOINTS

### 1. Segments CRUD

#### GET /api/battles/[id]/segments

Get all segments for a battle.

**Response**:
```typescript
{
  segments: {
    id: string;
    battleId: string;
    roundNum: number | null;     // null = unassigned
    position: number | null;     // 1-6 position in round
    contentType: ContentType;
    deliveryType: DeliveryType;
    performanceType: PerformanceType;
    isFreestyle: boolean;
    isCounter: boolean;
    counterTarget?: ContentType;
    isRehearsed: boolean;
    createdAt: string;
    updatedAt: string;
  }[];
  meta: {
    totalSegments: number;
    assignedSegments: number;
    unassignedSegments: number;
    segmentsPerRound: number;
    totalNeeded: number;
  };
}
```

#### POST /api/battles/[id]/segments

Create a new segment.

**Request Body**:
```typescript
{
  contentType: ContentType;
  deliveryType: DeliveryType;
  performanceType: PerformanceType;
  isFreestyle?: boolean;        // default: false
  isCounter?: boolean;          // default: false
  counterTarget?: ContentType;  // required if isCounter
  roundNum?: number;            // optional assignment
  position?: number;            // optional position
}
```

**Response**:
```typescript
{
  success: boolean;
  segment: Segment;
}
```

**Errors**:
- `PREP_LOCKED` - Cannot create segments after prep lock
- `INVALID_CONTENT_TYPE` - Unknown content type
- `COUNTER_REQUIRES_TARGET` - isCounter true but no target

#### PUT /api/battles/[id]/segments/[segmentId]

Update a segment.

**Request Body**:
```typescript
{
  roundNum?: number | null;     // move to round or unassign
  position?: number;            // change position
  isRehearsed?: boolean;        // mark as rehearsed
  contentType?: ContentType;    // change content
  deliveryType?: DeliveryType;
  performanceType?: PerformanceType;
}
```

**Response**:
```typescript
{
  success: boolean;
  segment: Segment;
}
```

**Errors**:
- `SEGMENT_NOT_FOUND`
- `ROUND_FULL` - Cannot add more segments to this round
- `CANNOT_REHEARSE` - Round not complete yet

#### DELETE /api/battles/[id]/segments/[segmentId]

Delete a segment.

**Response**:
```typescript
{
  success: boolean;
}
```

---

### 2. Segment Organization

#### POST /api/battles/[id]/segments/organize

Bulk update segment positions (for drag-and-drop).

**Request Body**:
```typescript
{
  assignments: {
    segmentId: string;
    roundNum: number | null;
    position: number | null;
  }[];
}
```

**Response**:
```typescript
{
  success: boolean;
  segments: Segment[];
}
```

---

### 3. Research Level

#### GET /api/battles/[id]/research

Get research progress.

**Response**:
```typescript
{
  level: 'none' | 'casual' | 'aggressive';
  daysSpent: number;
  daysForCasual: number;       // usually 2
  daysForAggressive: number;   // usually 3
  effects: {
    canWritePersonals: boolean;
    personalsEffectiveness: number;  // 1.0 = normal
    credibilityRisk: boolean;
  };
}
```

**Notes**:
- Research level is calculated from prep_blocks automatically
- Not directly editable - based on research days spent

---

### 4. Counters

#### GET /api/battles/[id]/counters

Get all counters for a battle.

**Response**:
```typescript
{
  counters: {
    id: string;
    battleId: string;
    segmentId: string;
    segment: Segment;
    anticipatedContent: ContentType;
    createdAt: string;
  }[];
  slots: {
    used: number;
    available: number;
    maxSlots: number;
    lockedSlots: {
      badge: string;
      slotsGranted: number;
    }[];
  };
}
```

#### POST /api/battles/[id]/counters

Create a counter.

**Request Body**:
```typescript
{
  segmentId: string;           // existing segment to use as counter
  anticipatedContent: ContentType;
}
```

**OR create segment inline**:
```typescript
{
  segment: {
    contentType: ContentType;
    deliveryType: DeliveryType;
    performanceType: PerformanceType;
  };
  anticipatedContent: ContentType;
}
```

**Response**:
```typescript
{
  success: boolean;
  counter: Counter;
}
```

**Errors**:
- `NO_COUNTER_SLOTS` - All slots used
- `SEGMENT_NOT_FOUND`
- `SEGMENT_ALREADY_COUNTER`

#### DELETE /api/battles/[id]/counters/[counterId]

Delete a counter.

**Response**:
```typescript
{
  success: boolean;
}
```

---

### 5. Prep Progress

#### GET /api/battles/[id]/prep-progress

Get comprehensive prep progress (for dashboard widget).

**Response**:
```typescript
{
  battleId: string;
  opponent: {
    id: string;
    name: string;
    avatar?: string;
  };
  league: {
    name: string;
    tier: string;
  };
  dates: {
    battleDate: string;
    prepLockDate: string;
    daysUntilBattle: number;
    daysUntilPrepLock: number;
  };
  roundInfo: {
    roundCount: number;
    roundLength: number;        // seconds
    segmentsPerRound: number;
    totalSegmentsNeeded: number;
  };
  research: {
    level: 'none' | 'casual' | 'aggressive';
    daysSpent: number;
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
  rounds: {
    roundNum: number;
    segmentsAssigned: number;
    segmentsNeeded: number;
    isComplete: boolean;
    isRehearsed: boolean;
    primaryContent?: ContentType;  // most common content type
  }[];
  counters: {
    used: number;
    available: number;
  };
  overall: {
    percent: number;
    isReadyForBattle: boolean;
    blockers: string[];          // ["Round 2 incomplete", "No rehearsal"]
  };
}
```

---

### 6. Round Shifting

#### POST /api/battles/[id]/rounds/shift

Shift round order mid-battle.

**Request Body**:
```typescript
{
  newOrder: number[];          // e.g., [2, 3] to swap rounds 2 and 3
}
```

**Response**:
```typescript
{
  success: boolean;
  penalty: {
    consistencyPenalty: number;    // e.g., 0.05 = 5%
    rehearsalPenalty: number;      // e.g., 0.10 = 10%
    totalPenalty: number;
  };
  newRoundOrder: {
    originalRound: number;
    newPosition: number;
  }[];
}
```

**Errors**:
- `ROUND_ALREADY_PLAYED` - Cannot shift a played round
- `SHIFT_LIMIT_REACHED` - Already shifted once
- `BATTLE_NOT_IN_PROGRESS`

---

## UPDATED ENDPOINTS

### Updated: POST /api/battles/[id]/prep

Add segment tracking to prep.

**Request Body** (unchanged):
```typescript
{
  prepBlocks: {
    day: number;
    focus: 'research' | 'writing' | 'rehearsal' | 'life' | 'rest';
  }[];
}
```

**Response** (updated):
```typescript
{
  success: boolean;
  prepBlocks: PrepBlock[];
  prepProgress: {
    research: {
      level: 'none' | 'casual' | 'aggressive';
      daysSpent: number;
    };
    writing: {
      daysSpent: number;
      segmentsPerDay: number;      // based on badges
      maxSegments: number;         // days × segmentsPerDay
    };
    rehearsal: {
      daysSpent: number;
      roundsCanRehearse: number;
    };
  };
}
```

---

### Updated: POST /api/battles/[id]/rounds/[roundNum]/simulate

Include segment-based simulation.

**Request Body**:
```typescript
{
  // No body needed if segments already assigned
  // OR override with:
  segments?: {
    position: number;
    contentType: ContentType;
    deliveryType: DeliveryType;
    performanceType: PerformanceType;
    isFreestyle: boolean;
  }[];
}
```

**Response** (updated):
```typescript
{
  roundNum: number;
  playerScore: number;
  opponentScore: number;
  playerWon: boolean;
  segments: {
    position: number;
    playerSegment: {
      contentType: ContentType;
      score: number;
      effectiveness: number;
      moment?: 'haymaker' | 'stumble' | 'choke';
      wasFreestyle: boolean;
    };
    opponentSegment: {
      contentType: ContentType;
      score: number;
      effectiveness: number;
      moment?: 'haymaker' | 'stumble' | 'choke';
    };
    matchupBonus: number;        // content type advantage
  }[];
  counters: {
    counterId: string;
    triggered: boolean;
    multiplier: number;
    message: string;
  }[];
  crowdReaction: number;
  penalties: {
    roundShiftPenalty?: number;
    credibilityPenalty?: number;
    lowPrepPenalty?: number;
  };
  runningScore: {
    playerRounds: number;
    opponentRounds: number;
  };
  // Only after round 1 and 2:
  canShiftRounds?: boolean;
}
```

---

## DATA TYPES

### ContentType
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
  | 'pop_culture'
  | 'name_flips'
  | 'shock_value'
  | 'social_commentary';
```

### DeliveryType
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

### PerformanceType
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

### Segment
```typescript
interface Segment {
  id: string;
  battleId: string;
  roundNum: number | null;
  position: number | null;
  contentType: ContentType;
  deliveryType: DeliveryType;
  performanceType: PerformanceType;
  isFreestyle: boolean;
  isCounter: boolean;
  counterTarget?: ContentType;
  isRehearsed: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Counter
```typescript
interface Counter {
  id: string;
  battleId: string;
  segmentId: string;
  anticipatedContent: ContentType;
  segment?: Segment;
  createdAt: string;
}
```

### PrepProgress
```typescript
interface PrepProgress {
  research: {
    level: 'none' | 'casual' | 'aggressive';
    daysSpent: number;
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

---

## DATABASE SCHEMA ADDITIONS

### New Table: battle_segments

```sql
CREATE TABLE battle_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  round_num INTEGER,           -- NULL = unassigned
  position INTEGER,            -- 1-6 position in round
  content_type VARCHAR(50) NOT NULL,
  delivery_type VARCHAR(50) NOT NULL,
  performance_type VARCHAR(50) NOT NULL,
  is_freestyle BOOLEAN DEFAULT FALSE,
  is_counter BOOLEAN DEFAULT FALSE,
  counter_target VARCHAR(50),
  is_rehearsed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_position CHECK (position IS NULL OR (position >= 1 AND position <= 6)),
  CONSTRAINT valid_round CHECK (round_num IS NULL OR (round_num >= 1 AND round_num <= 3)),
  CONSTRAINT counter_needs_target CHECK (NOT is_counter OR counter_target IS NOT NULL)
);

CREATE INDEX idx_segments_battle ON battle_segments(battle_id);
CREATE INDEX idx_segments_round ON battle_segments(battle_id, round_num);
```

### New Table: battle_counters

```sql
CREATE TABLE battle_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES battle_segments(id) ON DELETE CASCADE,
  anticipated_content VARCHAR(50) NOT NULL,
  was_triggered BOOLEAN,        -- NULL until battle, then true/false
  was_effective BOOLEAN,        -- NULL until resolved
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(battle_id, segment_id)
);

CREATE INDEX idx_counters_battle ON battle_counters(battle_id);
```

### Update Table: battles

```sql
ALTER TABLE battles ADD COLUMN round_order INTEGER[] DEFAULT ARRAY[1,2,3];
ALTER TABLE battles ADD COLUMN rounds_shifted BOOLEAN DEFAULT FALSE;
```

---

## MOCK DATA

### Mock Segments
```typescript
const mockSegments: Segment[] = [
  {
    id: 'seg-1',
    battleId: 'battle-123',
    roundNum: 1,
    position: 1,
    contentType: 'wordplay',
    deliveryType: 'aggressive',
    performanceType: 'stage_presence',
    isFreestyle: false,
    isCounter: false,
    isRehearsed: true,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'seg-2',
    battleId: 'battle-123',
    roundNum: 1,
    position: 2,
    contentType: 'schemes',
    deliveryType: 'smooth_flow',
    performanceType: 'theatrical',
    isFreestyle: false,
    isCounter: false,
    isRehearsed: true,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  // ... more segments
];
```

### Mock Prep Progress
```typescript
const mockPrepProgress = {
  battleId: 'battle-123',
  opponent: {
    id: 'opp-1',
    name: 'Gotti Geechi',
    avatar: '/avatars/gotti.png'
  },
  league: {
    name: 'Main Stage Arena',
    tier: 'god_tier'
  },
  dates: {
    battleDate: '2024-12-20T20:00:00Z',
    prepLockDate: '2024-12-18T20:00:00Z',
    daysUntilBattle: 12,
    daysUntilPrepLock: 10
  },
  roundInfo: {
    roundCount: 3,
    roundLength: 180,
    segmentsPerRound: 6,
    totalSegmentsNeeded: 18
  },
  research: {
    level: 'casual',
    daysSpent: 2,
    percent: 66
  },
  writing: {
    segmentsWritten: 14,
    segmentsNeeded: 18,
    percent: 78
  },
  rehearsal: {
    roundsRehearsed: [1],
    totalRounds: 3,
    percent: 33
  },
  rounds: [
    { roundNum: 1, segmentsAssigned: 6, segmentsNeeded: 6, isComplete: true, isRehearsed: true, primaryContent: 'wordplay' },
    { roundNum: 2, segmentsAssigned: 4, segmentsNeeded: 6, isComplete: false, isRehearsed: false, primaryContent: 'gun_bars' },
    { roundNum: 3, segmentsAssigned: 2, segmentsNeeded: 6, isComplete: false, isRehearsed: false }
  ],
  counters: {
    used: 1,
    available: 1
  },
  overall: {
    percent: 59,
    isReadyForBattle: false,
    blockers: ['Round 2 incomplete (4/6)', 'Round 3 incomplete (2/6)', 'Rounds 2 and 3 not rehearsed']
  }
};
```

---

## ERROR CODES

| Code | HTTP | Description |
|------|------|-------------|
| `PREP_LOCKED` | 403 | Prep period has ended |
| `SEGMENT_NOT_FOUND` | 404 | Segment ID not found |
| `ROUND_FULL` | 400 | Round has max segments |
| `CANNOT_REHEARSE` | 400 | Round not complete |
| `NO_COUNTER_SLOTS` | 400 | All counter slots used |
| `SEGMENT_ALREADY_COUNTER` | 400 | Segment is already a counter |
| `COUNTER_REQUIRES_TARGET` | 400 | Counter needs anticipated content |
| `INVALID_CONTENT_TYPE` | 400 | Unknown content type |
| `ROUND_ALREADY_PLAYED` | 400 | Cannot modify played round |
| `SHIFT_LIMIT_REACHED` | 400 | Already shifted once |
| `BATTLE_NOT_IN_PROGRESS` | 400 | Battle not started or finished |

---

**End of API Contract**
