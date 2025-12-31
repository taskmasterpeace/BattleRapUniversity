# V0 API Contract Spec

This document defines the API endpoints V0 should call. Backend will implement these.

**Note**: Use mock data for now where APIs don't exist. Backend will provide real implementations.

---

## BATTLE FLOW APIs

### 1. Get Battle Offers

**Endpoint**: `GET /api/battles/offers`

**Response**:
```typescript
{
  offers: {
    id: string;
    opponent: {
      id: string;
      name: string;
      rating: number;
      record: string;       // "12-3"
      styleTags: string[];
      avatar?: string;
    };
    league: {
      id: string;
      name: string;
      tier: string;         // "god_tier" | "top_tier" | "mid_tier" | "small_room"
    };
    scheduledAt: string;    // ISO date
    prepDays: number;       // Days until battle
    expiresAt: string;      // ISO date - offer expires
    purse: number;          // Money offered
  }[];
}
```

**Mock Data**:
```typescript
const mockOffers = [
  {
    id: "offer-1",
    opponent: {
      id: "opp-1",
      name: "Gotti Geechi",
      rating: 1420,
      record: "15-4",
      styleTags: ["Angles", "Street Talk", "Aggressive"],
    },
    league: {
      id: "league-1",
      name: "Main Stage Arena",
      tier: "top_tier",
    },
    scheduledAt: "2024-12-20T20:00:00Z",
    prepDays: 14,
    expiresAt: "2024-12-08T20:00:00Z",
    purse: 5000,
  }
];
```

---

### 2. Accept Battle Offer

**Endpoint**: `POST /api/battles/[id]/accept`

**Request Body**: None needed

**Response**:
```typescript
{
  success: boolean;
  battle: {
    id: string;
    status: "accepted";
    prepStartsAt: string;
    prepLocksAt: string;
    scheduledAt: string;
  };
}
```

**On Success**: Redirect to `/battle/[id]/prep`

---

### 3. Decline Battle Offer

**Endpoint**: `POST /api/battles/[id]/decline`

**Request Body**: None needed

**Response**:
```typescript
{
  success: boolean;
}
```

**On Success**: Remove offer from list, stay on offers page

---

### 4. Get Battle Details

**Endpoint**: `GET /api/battles/[id]`

**Response**:
```typescript
{
  battle: {
    id: string;
    status: "offered" | "accepted" | "locked" | "simulating" | "completed";
    player: {
      id: string;
      name: string;
      rating: number;
      // ... battler details
    };
    opponent: {
      id: string;
      name: string;
      rating: number;
      // ... battler details
    };
    league: {
      id: string;
      name: string;
      tier: string;
      roundLength: number;  // seconds per round
      roundCount: number;   // usually 3
    };
    scheduledAt: string;
    prepLocksAt: string;
    mode?: "locked_in" | "auto";
    winner?: string;        // battler id if completed
    rounds?: BattleRound[]; // if completed
  };
}
```

---

### 5. Get/Save Prep Blocks

**Endpoint**: `GET /api/battles/[id]/prep`

**Response**:
```typescript
{
  prepBlocks: {
    day: number;          // 1-based day number
    focus: "research" | "writing" | "rehearsal" | "life" | "rest";
    date: string;
  }[];
  prepProgress: {
    research: number;     // 0-100
    writing: number;      // 0-100
    rehearsal: number;    // 0-100
  };
  prepLocksAt: string;
  isLocked: boolean;
}
```

**Endpoint**: `POST /api/battles/[id]/prep`

**Request Body**:
```typescript
{
  prepBlocks: {
    day: number;
    focus: "research" | "writing" | "rehearsal" | "life" | "rest";
  }[];
}
```

**Response**:
```typescript
{
  success: boolean;
  prepProgress: {
    research: number;
    writing: number;
    rehearsal: number;
  };
}
```

---

### 6. Lock In Battle Mode

**Endpoint**: `POST /api/battles/[id]/lock-in`

**Request Body**:
```typescript
{
  mode: "locked_in" | "auto";
}
```

**Response**:
```typescript
{
  success: boolean;
  battle: {
    id: string;
    mode: "locked_in" | "auto";
    status: "locked";
  };
  // If mode is "auto", also returns simulation results
  simulationResult?: {
    winner: string;
    rounds: BattleRound[];
  };
}
```

**On Success**:
- If `locked_in`: Redirect to `/battle/[id]/round/1`
- If `auto`: Redirect to `/battle/[id]` with results

---

### 7. Get Round Content Options

**Endpoint**: `GET /api/battles/[id]/rounds/[roundNum]`

**Response**:
```typescript
{
  roundNum: number;
  playerSelection?: ContentSelection;  // if already selected
  opponentSelection?: ContentSelection; // hidden until round simulated
  isSimulated: boolean;
  result?: RoundResult;
}
```

---

### 8. Submit Round Content Selection

**Endpoint**: `POST /api/battles/[id]/rounds/[roundNum]/content`

**Request Body**:
```typescript
{
  contentTypes: string[];     // 3-4 content type IDs
  deliveryTypes: string[];    // 1-2 delivery type IDs
  performanceTypes: string[]; // 1-2 performance type IDs
}
```

**Response**:
```typescript
{
  success: boolean;
  selection: ContentSelection;
}
```

**On Success**: Call simulate endpoint

---

### 9. Simulate Round

**Endpoint**: `POST /api/battles/[id]/rounds/[roundNum]/simulate`

**Request Body**: None (uses saved content selection)

**Response**:
```typescript
{
  roundNum: number;
  playerScore: number;
  opponentScore: number;
  playerWon: boolean;
  segments: {
    segmentNum: number;
    playerScore: number;
    opponentScore: number;
    playerMoment?: "haymaker" | "stumble" | "choke";
    opponentMoment?: "haymaker" | "stumble" | "choke";
  }[];
  crowdReaction: number;
  effectiveness: {
    contentEffectiveness: number;
    crowdPreference: number;
    contextModifier: number;
    finalMultiplier: number;
  };
  opponentSelection: ContentSelection;  // Now revealed
  runningScore: {
    playerRounds: number;
    opponentRounds: number;
  };
}
```

**On Success**: Redirect to `/battle/[id]/round/[roundNum]/results`

---

## DATA TYPES

### ContentSelection
```typescript
interface ContentSelection {
  contentTypes: string[];      // e.g., ["personals", "wordplay", "schemes"]
  deliveryTypes: string[];     // e.g., ["aggressive", "smooth_flow"]
  performanceTypes: string[];  // e.g., ["stage_presence", "crowd_interaction"]
}
```

### BattleRound
```typescript
interface BattleRound {
  roundNum: number;
  playerScore: number;
  opponentScore: number;
  playerWon: boolean;
  playerSelection: ContentSelection;
  opponentSelection: ContentSelection;
  segments: Segment[];
  crowdReaction: number;
}
```

### Segment
```typescript
interface Segment {
  segmentNum: number;
  playerScore: number;
  opponentScore: number;
  playerMoment?: "haymaker" | "stumble" | "choke";
  opponentMoment?: "haymaker" | "stumble" | "choke";
}
```

---

## CONTENT TYPE IDs

Use these IDs when calling APIs:

**Content Types** (select 3-4):
- `personals` - Personal attacks
- `wordplay` - Wordplay/double meanings
- `schemes` - Multi-bar setups
- `punchlines` - Hard-hitting punchlines
- `comedy` - Humor/jokes
- `storytelling` - Narrative bars
- `gun_bars` - Weapon references
- `street_talk` - Street credibility
- `freestyles` - Off-the-top content
- `rebuttals` - Direct responses
- `pop_culture` - Pop culture references
- `name_flips` - Name-based wordplay
- `shock_value` - Controversial content
- `social_commentary` - Social/political themes

**Delivery Types** (select 1-2):
- `aggressive` - High energy attack
- `smooth_flow` - Smooth cadence
- `speed_rapping` - Fast delivery
- `staccato` - Choppy delivery
- `passionate` - Emotional delivery
- `nonchalant` - Casual delivery
- `conversational` - Talking style

**Performance Types** (select 1-2):
- `stage_presence` - Command the stage
- `crowd_interaction` - Engage the crowd
- `theatrical` - Dramatic performance
- `charismatic` - Natural charm
- `dynamic_range` - Varied energy
- `facial_expression` - Expressive face
- `strategic_pauses` - Timed pauses
- `minimalist` - Understated style

---

## MOCK DATA UNTIL BACKEND READY

For pages that need data before APIs exist, use these mocks:

### Mock Battle
```typescript
const mockBattle = {
  id: "battle-123",
  status: "accepted",
  player: {
    id: "player-1",
    name: "Your Battler",
    rating: 1350,
  },
  opponent: {
    id: "opp-1",
    name: "Gotti Geechi",
    rating: 1420,
  },
  league: {
    id: "league-1",
    name: "Main Stage Arena",
    tier: "top_tier",
    roundLength: 180,
    roundCount: 3,
  },
  scheduledAt: "2024-12-20T20:00:00Z",
  prepLocksAt: "2024-12-18T20:00:00Z",
};
```

### Mock Round Result
```typescript
const mockRoundResult = {
  roundNum: 1,
  playerScore: 8.2,
  opponentScore: 7.5,
  playerWon: true,
  segments: [
    { segmentNum: 1, playerScore: 7.5, opponentScore: 7.2 },
    { segmentNum: 2, playerScore: 8.8, opponentScore: 7.8, playerMoment: "haymaker" },
    { segmentNum: 3, playerScore: 7.9, opponentScore: 7.0 },
    { segmentNum: 4, playerScore: 8.5, opponentScore: 8.0 },
  ],
  crowdReaction: 78,
  effectiveness: {
    contentEffectiveness: 1.15,
    crowdPreference: 1.08,
    contextModifier: 1.0,
    finalMultiplier: 1.24,
  },
  runningScore: {
    playerRounds: 1,
    opponentRounds: 0,
  },
};
```

---

## ERROR HANDLING

All API calls should handle these errors:

```typescript
interface ApiError {
  error: string;
  code: string;
  message: string;
}
```

**Common Error Codes**:
- `BATTLE_NOT_FOUND` - Battle ID doesn't exist
- `NOT_AUTHORIZED` - User doesn't own this battle
- `PREP_LOCKED` - Cannot modify prep after lock date
- `INVALID_SELECTION` - Content selection doesn't meet requirements
- `ROUND_ALREADY_SIMULATED` - Round has already been played
- `BATTLE_COMPLETED` - Battle is already finished

**Error Display**:
```tsx
if (error) {
  return (
    <div className="bg-red-900/20 border-2 border-red-600 rounded-lg p-4">
      <p className="text-red-400">{error.message}</p>
    </div>
  );
}
```
