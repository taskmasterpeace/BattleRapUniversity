# Round Content Selection System - Complete Documentation

**Status**: Phase 2 Complete (Implementation, Testing, Documentation)
**Version**: 1.0
**Last Updated**: November 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Game Mechanics](#game-mechanics)
3. [Scoring Formula](#scoring-formula)
4. [Auto-Selection Algorithm](#auto-selection-algorithm)
5. [API Endpoints](#api-endpoints)
6. [UI Flow](#ui-flow)
7. [Database Schema](#database-schema)
8. [Examples](#examples)
9. [Testing](#testing)
10. [Future Enhancements](#future-enhancements)

---

## Overview

### What is the Round Content Selection System?

The Round Content Selection System introduces **strategic depth** to battle simulation by allowing players to choose their **content approach** for each round. Instead of writing actual lyrics (which remains outside the game's scope), players select from predefined **content types**, **delivery styles**, and **performance approaches** that influence round scoring through effectiveness multipliers.

This system is inspired by Pokémon-style type matchups applied to battle rap dynamics.

### Two Modes

**1. Locked In Mode (Manual Selection)**
- Player manually selects content for each round
- UI provides effectiveness forecasts vs predicted opponent content
- Round-by-round gameplay with strategic decision-making
- Takes ~30-60 seconds per round selection

**2. Auto Mode (Quick Simulation)**
- System automatically selects content for all 3 rounds based on battler badges
- AI opponent also auto-selects
- Entire battle simulated at once
- Takes ~5 seconds total

### Key Concepts

**Content Types** (14 total): Personals, Wordplay, Schemes, Punchlines, Comedy, etc.
**Delivery Types** (7 total): Aggressive, Smooth Flow, Speed Rapping, Passionate, etc.
**Performance Types** (8 total): Theatrical, Charismatic, Crowd Interaction, etc.

**Effectiveness**: Pokémon-style matchups (2.0x super effective, 1.0x neutral, 0.5x weak)
**Crowd Demographics**: 5 fan types with different preferences (Purists, Street Fans, Comedy Fans, etc.)
**Context Modifiers**: In Building vs PPV vs On Cam (1.5x to 0.8x multipliers)

---

## Game Mechanics

### Content Types (14)

| Content Type | Description | Category | Strategic Identity |
|--------------|-------------|----------|-------------------|
| **Personals** | Direct personal attacks targeting opponent's life, family, secrets | Attack | Deep psychological damage |
| **Wordplay** | Clever word manipulation, double meanings, puns | Technical | Requires rewatch value |
| **Schemes** | Extended metaphorical structures, multi-bar setups | Technical | High-level pen game |
| **Punchlines** | Hard-hitting memorable knockout lines | Attack | Instant crowd reaction |
| **Comedy** | Humor-based attacks, jokes that undermine opponent | Entertainment | Makes opponent look foolish |
| **Storytelling** | Narrative-driven content painting vivid pictures | Technical | Builds tension and payoff |
| **Gun Bars** | Violent imagery and street threats | Attack | Proves toughness |
| **Street Talk** | Authentic street culture references | Attack | Credibility, realness |
| **Freestyles** | Improvised on-the-spot content | Adaptive | Shows raw talent |
| **Rebuttals** | Direct responses to opponent's material | Adaptive | Dismantles opponent's angles |
| **Pop Culture Refs** | Current events, movies, sports references | Entertainment | Timely relevance |
| **Name Flips** | Creative alterations of opponent's name | Entertainment | Crowd participation hooks |
| **Shock Value** | Controversial or unexpected content | Attack | Provokes strong reactions |
| **Social Commentary** | Political/social issues woven into attacks | Technical | Depth and intelligence |

### Delivery Types (7)

| Delivery Type | Description | Strategic Identity |
|---------------|-------------|-------------------|
| **Aggressive** | Intense, confrontational, intimidating tone | Dominance, psychological warfare |
| **Smooth Flow** | Fluid, effortless, melodic delivery | Professional polish |
| **Speed Rapping** | Exceptionally fast-paced delivery | Technical skill, overwhelms opponent |
| **Staccato** | Sharp, punctuated, choppy rhythm | Emphasis, dramatic pauses |
| **Passionate** | Emotional, intense conviction | Makes bars feel real |
| **Nonchalant** | Effortlessly cool, unbothered | Dismissive of opponent |
| **Conversational** | Casual, relatable tone | Disarming accessibility |

### Performance Types (8)

| Performance Type | Description | Strategic Identity |
|------------------|-------------|-------------------|
| **Stage Presence** | Commands attention, owns the space | Impossible to ignore |
| **Crowd Interaction** | Engages audience directly | Controls atmosphere |
| **Theatrical** | Dramatic, exaggerated performance | Memorable moments |
| **Charismatic** | Charming, naturally engaging | Wins crowd favor |
| **Dynamic Range** | Varies volume and intensity | Keeps attention |
| **Facial Expression** | Uses face to convey emotion/mockery | Non-verbal intimidation |
| **Strategic Pauses** | Uses silence for emphasis | Lets bars breathe |
| **Minimalist** | Controlled, subtle gestures | Mysterious aura |

### Selection Requirements

Players must select:
- **3-4 Content Types** (minimum 3, maximum 4)
- **1-2 Delivery Types** (minimum 1, maximum 2)
- **1-2 Performance Types** (minimum 1, maximum 2)

No duplicates allowed within each category.

### Effectiveness Matrix (Pokémon-Style)

**Super Effective Matchups (2.0x multiplier):**

| Your Content | VS Opponent Content | Reasoning |
|--------------|---------------------|-----------|
| Personals | Comedy | Serious attacks make jokes look shallow |
| Personals | Gun Bars | Real research trumps generic threats |
| Street Talk | Gun Bars | Authenticity exposes fake posturing |
| Comedy | Wordplay | Crowd laughs make technical bars boring |
| Comedy | Schemes | Entertainment beats complexity |
| Wordplay | Gun Bars | Technical skill dominates one-dimensional content |
| Schemes | Shock Value | Craftsmanship beats cheap provocations |
| Freestyles | Rebuttals | On-spot adaptation beats pre-written responses |
| Rebuttals | Personals | Dismantling attacks makes opponent unprepared |
| Aggressive | Nonchalant | Intense energy overwhelms cool demeanor |
| Theatrical | Minimalist | Dramatic showmanship buries subtle gestures |

**Not Very Effective Matchups (0.5x multiplier):**

| Your Content | VS Opponent Content | Reasoning |
|--------------|---------------------|-----------|
| Comedy | Personals | Jokes can't deflect real damage |
| Gun Bars | Street Talk | Generic threats lose to authentic experience |
| Gun Bars | Personals | Generic threats demolished by research |
| Wordplay | Comedy | Complex bars get laughed at |
| Schemes | Freestyles | Pre-written complexity can't counter spontaneity |
| Shock Value | Schemes | Cheap provocations lack substance |
| Pop Culture Refs | Wordplay | Surface-level loses to technical depth |
| Nonchalant | Aggressive | Cool demeanor overwhelmed by intensity |
| Minimalist | Theatrical | Subtle gestures buried by showmanship |

**Neutral Matchups (1.0x multiplier):**
All other combinations default to neutral (execution decides outcome).

### Crowd Demographics (5 Types)

Each league has a different demographic distribution that affects content scoring.

#### 1. Purists (Tech Heads)
**Values**: Technical writing, complexity, lyrical skill
**Top Preferences**: Wordplay (+35%), Schemes (+30%), Freestyles (+25%), Storytelling (+15%)
**Dislikes**: Comedy (-15%), Gun Bars (-10%)
**Typical League**: Small Room Circuit (45% of crowd)

#### 2. Street Fans (Authenticity First)
**Values**: Realness, lived experience, street credibility
**Top Preferences**: Street Talk (+40%), Gun Bars (+30%), Personals (+25%), Rebuttals (+15%)
**Dislikes**: Wordplay (-20%), Pop Culture Refs (-15%)
**Typical League**: Main Stage Arena (20% of crowd)

#### 3. Comedy Fans (Entertainment)
**Values**: Fun, laughs, entertainment
**Top Preferences**: Comedy (+40%), Name Flips (+30%), Pop Culture Refs (+25%), Punchlines (+15%)
**Dislikes**: Schemes (-10%), Social Commentary (-15%)
**Typical League**: Main Stage Arena (15% of crowd)

#### 4. Aggression Fans (Energy)
**Values**: Intensity, passion, aggressive performance
**Top Preferences**: Gun Bars (+35%), Aggressive Delivery (+40%), Theatrical Performance (+30%)
**Dislikes**: Smooth Flow (-20%), Minimalist Performance (-15%)
**Typical League**: Main Stage Arena (25% of crowd)

#### 5. Performance Fans (Showmanship)
**Values**: Stage presence, charisma, showmanship
**Top Preferences**: Charismatic (+35%), Theatrical (+35%), Crowd Interaction (+30%)
**Dislikes**: Nonchalant (-10%), Minimalist (-20%)
**Typical League**: Main Stage Arena (30% of crowd - dominant)

### League Demographic Distributions

**Small Room Circuit:**
- Purists: 45% (dominant)
- Street Fans: 25%
- Comedy Fans: 15%
- Aggression Fans: 10%
- Performance Fans: 5%

**Main Stage Arena:**
- Performance Fans: 30% (dominant)
- Aggression Fans: 25%
- Street Fans: 20%
- Comedy Fans: 15%
- Purists: 10%

### Context Modifiers (In Building vs PPV vs On Cam)

Different contexts score content differently based on real battle rap phenomenon: **"crazy in the building but debatable on cam."**

**Context Types:**
- **In Building**: Smallest crowd, league-specific demographic, most biased
- **PPV**: Medium crowd, invested fans
- **On Cam/Subscribers**: Largest crowd, general community, replay value

**Key Modifiers:**

| Content/Delivery/Performance | In Building | PPV | On Cam | Reasoning |
|------------------------------|-------------|-----|--------|-----------|
| **Wordplay** | 0.8x | 1.0x | 1.3x | Needs rewatch to catch layers |
| **Schemes** | 0.9x | 1.0x | 1.25x | Complexity appreciated on replay |
| **Gun Bars** | 1.2x | 1.1x | 0.9x | Threats feel real in person, generic on cam |
| **Comedy** | 1.3x | 1.2x | 1.1x | Live laughter infectious |
| **Freestyles** | 1.4x | 1.2x | 1.0x | Spontaneity impressive live |
| **Personals** | 1.2x | 1.15x | 1.1x | Live discomfort palpable |
| **Aggressive** | 1.4x | 1.2x | 0.9x | Energy translates live, excessive on replay |
| **Smooth Flow** | 1.0x | 1.1x | 1.2x | Professional polish shines on replay |
| **Crowd Interaction** | 1.5x | 1.3x | 0.8x | Live participation, awkward on replay |
| **Theatrical** | 1.3x | 1.1x | 0.95x | Stage presence hits harder in person |
| **Minimalist** | 0.85x | 0.95x | 1.05x | Subtlety gets lost live, shines on replay |

**League-Specific Adjustments:**

*Small Room Circuit (intimate setting):*
- Wordplay: 1.0x (no penalty vs 0.8x in Main Stage)
- Schemes: 1.0x (no penalty)
- Comedy: 0.9x (smaller crowd = less amplification)
- Aggressive: 0.85x (too much energy feels forced)

*Main Stage Arena (large venue):*
- Theatrical: 1.4x (big stage demands big presence)
- Crowd Interaction: 1.6x (larger crowd = feedback loop)
- Aggressive: 1.5x (energy needed to fill space)
- Wordplay: 0.7x (harder to catch in loud environment)

---

## Scoring Formula

### Final Round Score Calculation

```
Base Score = (Writing Power × League Writing Weight) + (Performance Power × League Performance Weight)

Adjusted Score = Base Score × Effectiveness × Crowd Preference × Context Modifier

Where:
- Effectiveness: 2.0 (super effective), 1.0 (neutral), 0.5 (not very effective)
- Crowd Preference: 0.8 - 1.4 (based on league demographics)
- Context Modifier: 0.8 - 1.5 (in building vs ppv vs on cam)

Final Round Score = Adjusted Score (with variance, peaks, chokes applied)
```

### Component Breakdown

**1. Effectiveness Multiplier**
- Calculated by averaging all matchups between your content types and opponent's content types
- Example: If you have 3 content types and opponent has 3, that's 9 matchup calculations averaged

**2. Crowd Preference Multiplier**
- Weighted average based on league demographic distribution
- Each demographic's preference for your content types × their percentage of crowd
- Example: Wordplay in Small Room = (0.45 × 1.35 purist bonus) + (0.25 × 0.8 street penalty) + ...

**3. Context Modifier**
- Average of context modifiers for all your selected content/delivery/performance types
- Applied differently based on scoring context (in_building, ppv, on_cam)

**4. Final Multiplier**
```
Final Multiplier = Effectiveness × Crowd Preference × Context Modifier
```

### Example Calculation

**Scenario:**
- Player: Wordplay, Schemes, Punchlines | Smooth Flow | Minimalist
- Opponent: Gun Bars, Street Talk, Comedy | Aggressive | Theatrical
- League: Small Room Circuit (Purists 45%, Street Fans 25%, Comedy Fans 15%, etc.)
- Context: PPV

**Step 1: Effectiveness**
- Wordplay vs Gun Bars: 2.0 (super effective)
- Wordplay vs Street Talk: 1.0 (neutral)
- Wordplay vs Comedy: 0.5 (weak)
- Schemes vs Gun Bars: 1.0
- Schemes vs Street Talk: 1.0
- Schemes vs Comedy: 2.0 (super effective)
- Punchlines vs Gun Bars: 1.0
- Punchlines vs Street Talk: 1.0
- Punchlines vs Comedy: 1.0
- Smooth Flow vs Aggressive: 1.0
- Minimalist vs Theatrical: 0.5 (weak)

Average Effectiveness = (2.0 + 1.0 + 0.5 + 1.0 + 1.0 + 2.0 + 1.0 + 1.0 + 1.0 + 1.0 + 0.5) / 11 = **1.09**

**Step 2: Crowd Preference**
- Wordplay: Small Room favors (purists +35% × 45% weight) = ~1.15
- Schemes: Small Room favors (purists +30% × 45% weight) = ~1.13
- Punchlines: Neutral = 1.0
- Smooth Flow: Slight favor = 1.05
- Minimalist: Slight disfavor = 0.95

Average Crowd Preference = **1.06**

**Step 3: Context Modifier**
- Wordplay: PPV = 1.0
- Schemes: PPV = 1.0
- Punchlines: PPV = 1.1
- Smooth Flow: PPV = 1.1
- Minimalist: PPV = 0.95

Average Context Modifier = **1.03**

**Final Multiplier:**
1.09 × 1.06 × 1.03 = **1.19**

**Result:**
Player's base score of 7.5 becomes 7.5 × 1.19 = **8.93** (adjusted score)

---

## Auto-Selection Algorithm

### How Auto-Selection Works

When a battler uses Auto Mode (or AI opponent always), the system automatically selects content based on:

1. **Badge → Content Type Mapping**
2. **League Demographic Influence**
3. **Round-Based Variation**

### Badge Weight Mapping

Badges are mapped to content types with weight multipliers:

```typescript
'Wordplay Wizard' → wordplay (2.5x weight)
'Punchline King' → punchlines (2.5x weight)
'Comedy' → comedy (2.5x weight)
'Aggressive' → aggressive delivery (2.5x) + gun_bars (2.0x)
'Crowd Favorite' → comedy (1.5x) + pop_culture_refs (1.5x) + crowd_interaction (2.0x)
'Technical' → wordplay (2.0x) + schemes (2.0x)
```

Multiple badges combine additively (Wordplay Wizard + Technical = 4.5x weight for wordplay).

### Selection Process

```
1. Create badge weight map (badges → content types with weights)
2. Apply crowd preference boost (multiply weights by league crowd preferences)
3. Add default weights for unweighted types (0.5x base for variety)
4. Add randomness for round variation (±20% variance seeded by round index)
5. Sort by final weights
6. Select top N types:
   - Round 1: 3 content, 1 delivery, 1 performance
   - Round 2: 4 content, 1 delivery, 2 performance
   - Round 3: 3 content, 2 delivery, 2 performance
```

### Round-Based Variation

To prevent identical selections across rounds, the algorithm:
- Uses round index as randomness seed
- Varies selection counts (R1: 3/1/1, R2: 4/1/2, R3: 3/2/2)
- Applies ±20% random weight adjustment per round

### Example Auto-Selection

**Battler**: Wordplay Wizard + Technical badges
**League**: Small Room Circuit
**Round**: 1

**Step 1**: Badge Weights
- Wordplay: 4.5 (2.5 from Wordplay Wizard + 2.0 from Technical)
- Schemes: 2.0 (from Technical)
- All others: 0 (no badge weight)

**Step 2**: Crowd Preference Boost (Small Room favors tech)
- Wordplay: 4.5 × 1.35 (purist bonus) = 6.08
- Schemes: 2.0 × 1.30 (purist bonus) = 2.60
- Comedy: 0 × 0.85 (purist penalty) = 0
- Gun Bars: 0 × 0.90 (purist penalty) = 0

**Step 3**: Add Default Weights
- Punchlines: 0.5 (base)
- Storytelling: 0.5 (base)
- Personals: 0.5 (base)
- etc.

**Step 4**: Apply Round 1 Randomness
- Wordplay: 6.08 × 1.15 (random) = 6.99
- Schemes: 2.60 × 0.92 (random) = 2.39
- Punchlines: 0.5 × 1.18 (random) = 0.59

**Step 5**: Select Top 3 Content Types
- Wordplay (6.99)
- Schemes (2.39)
- Punchlines (0.59)

Similar process for delivery (top 1) and performance (top 1).

---

## API Endpoints

### POST /api/battles/[id]/lock-in

**Purpose**: Player chooses Locked In mode vs Auto mode after prep lock
**Request Body:**
```json
{
  "mode": "locked_in" | "auto"
}
```
**Response:**
```json
{
  "battle": { ... },
  "status": "awaiting_r1_content" | "simulated"
}
```

### POST /api/battles/[id]/rounds/[roundNum]/content

**Purpose**: Submit content selection for a specific round (Locked In mode only)
**Request Body:**
```json
{
  "contentTypes": ["personals", "wordplay", "punchlines"],
  "deliveryTypes": ["aggressive"],
  "performanceTypes": ["theatrical"]
}
```
**Response:**
```json
{
  "selection": { ... },
  "opponentSelection": { ... },
  "forecast": {
    "averageEffectiveness": 1.25,
    "crowdPreference": 1.1,
    "contextModifier": 1.05,
    "finalMultiplier": 1.44,
    "strongAgainst": ["comedy", "gun_bars"],
    "weakAgainst": []
  }
}
```

### POST /api/battles/[id]/rounds/[roundNum]/simulate

**Purpose**: Simulate a specific round after content is selected
**Request Body:** (empty)
**Response:**
```json
{
  "playerRound": {
    "average_score": 8.5,
    "peak_score": 9.2,
    "consistency_score": 7.8,
    "content_types": ["personals", "wordplay", "punchlines"],
    "effectiveness_multiplier": 1.25,
    "final_multiplier": 1.44
  },
  "aiRound": { ... },
  "playerSegments": [ ... ],
  "aiSegments": [ ... ]
}
```

### GET /api/battles/[id]/rounds/[roundNum]

**Purpose**: Get results for a specific round
**Response:**
```json
{
  "playerRound": { ... },
  "aiRound": { ... },
  "playerSegments": [ ... ],
  "aiSegments": [ ... ]
}
```

---

## UI Flow

### Battle Control Flow (Locked In Mode)

```
1. Battle Prep Complete → lock_prep_at reached
2. Battle Status: "awaiting_lock_in_choice"
3. Player chooses "Locked In" vs "Auto"

IF Locked In:
  4a. Battle Status: "awaiting_r1_content"
  5a. Show Round 1 Content Selector UI
  6a. Player selects content → POST /api/battles/[id]/rounds/1/content
  7a. Show effectiveness forecast
  8a. Confirm → POST /api/battles/[id]/rounds/1/simulate
  9a. Battle Status: "r1_simulated"
  10a. Show Round 1 Results
  11a. Repeat for Round 2 (status → "awaiting_r2_content" → "r2_simulated")
  12a. Repeat for Round 3 (status → "awaiting_r3_content" → "r3_simulated")
  13a. Battle Status: "completed"

IF Auto:
  4b. System auto-selects all 3 rounds
  5b. Simulate all 3 rounds
  6b. Battle Status: "completed"
  7b. Show final results
```

### UI Components

#### 1. RoundContentSelector
**Location**: `components/battle/RoundContentSelector.tsx`
**Purpose**: Multi-column selector for content/delivery/performance types
**Features**:
- Category tabs (Content | Delivery | Performance)
- Type cards with descriptions
- Real-time validation feedback
- Selection counter (e.g., "3/4 Content Types Selected")

#### 2. EffectivenessForecast
**Location**: `components/battle/EffectivenessForecast.tsx`
**Purpose**: Show predicted effectiveness vs opponent
**Features**:
- Final multiplier display (e.g., "1.44x advantage")
- Strong matchups (green badges)
- Weak matchups (red badges)
- Breakdown: Effectiveness × Crowd × Context

#### 3. RoundResultsBreakdown
**Location**: `components/battle/RoundResultsBreakdown.tsx`
**Purpose**: Show round results with content metadata
**Features**:
- Average/Peak/Consistency scores
- Content selections display
- Multiplier breakdown
- Segment timeline

---

## Database Schema

### round_content_selections Table

```sql
CREATE TABLE round_content_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  round_index INTEGER NOT NULL CHECK (round_index BETWEEN 1 AND 3),
  content_types TEXT[] NOT NULL CHECK (array_length(content_types, 1) BETWEEN 3 AND 4),
  delivery_types TEXT[] NOT NULL CHECK (array_length(delivery_types, 1) BETWEEN 1 AND 2),
  performance_types TEXT[] NOT NULL CHECK (array_length(performance_types, 1) BETWEEN 1 AND 2),
  auto_selected BOOLEAN DEFAULT FALSE,
  effectiveness_multiplier NUMERIC,
  crowd_preference_multiplier NUMERIC,
  context_modifier NUMERIC,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(battle_id, battler_id, round_index)
);
```

### battle_rounds Table (Extended)

```sql
-- Existing fields + new content metadata fields:
ALTER TABLE battle_rounds ADD COLUMN content_types TEXT[];
ALTER TABLE battle_rounds ADD COLUMN delivery_types TEXT[];
ALTER TABLE battle_rounds ADD COLUMN performance_types TEXT[];
ALTER TABLE battle_rounds ADD COLUMN effectiveness_multiplier NUMERIC;
ALTER TABLE battle_rounds ADD COLUMN crowd_preference_multiplier NUMERIC;
ALTER TABLE battle_rounds ADD COLUMN context_modifier NUMERIC;
ALTER TABLE battle_rounds ADD COLUMN final_multiplier NUMERIC;
```

### Battle Status Flow

```
offered → accepted → locked → awaiting_lock_in_choice →

IF Locked In:
  awaiting_r1_content → r1_simulated →
  awaiting_r2_content → r2_simulated →
  awaiting_r3_content → r3_simulated → completed

IF Auto:
  simulated → completed
```

---

## Examples

### Example 1: Wordplay vs Gun Bars in Small Room (Super Effective)

**Scenario:**
- Player (Wordplay Wizard): Wordplay, Schemes, Punchlines | Smooth Flow | Minimalist
- AI (Street Battler): Gun Bars, Street Talk, Personals | Aggressive | Theatrical
- League: Small Room Circuit
- Context: PPV

**Effectiveness:**
- Wordplay vs Gun Bars: **2.0** (super effective)
- Wordplay vs Street Talk: 1.0
- Wordplay vs Personals: 1.0
- Schemes vs Gun Bars: 1.0
- Schemes vs Street Talk: 1.0
- Schemes vs Personals: 1.0
- Punchlines vs Gun Bars: 1.0
- Punchlines vs Street Talk: 1.0
- Punchlines vs Personals: 1.0

Average Effectiveness: **1.22**

**Crowd Preference:**
- Wordplay in Small Room: 1.35 (purists love it)
- Schemes in Small Room: 1.30
- Punchlines: 1.05
- Smooth Flow: 1.05
- Minimalist: 0.95

Average Crowd Preference: **1.14**

**Context Modifier:**
- Wordplay PPV: 1.0
- Schemes PPV: 1.0
- Punchlines PPV: 1.1
- Smooth Flow PPV: 1.1
- Minimalist PPV: 0.95

Average Context Modifier: **1.03**

**Final Multiplier:**
1.22 × 1.14 × 1.03 = **1.43**

**Result:**
Player's base score of 7.0 → **10.01** (adjusted)
AI's base score of 7.0 → **6.3** (adjusted with ~0.9x multiplier from reverse matchup)

**Player wins decisively** due to content matchup advantage.

---

### Example 2: Comedy vs Personals in Main Stage (Weak Scenario)

**Scenario:**
- Player (Comedy Battler): Comedy, Name Flips, Pop Culture Refs | Conversational | Charismatic
- AI (Personal Attacker): Personals, Wordplay, Schemes | Aggressive | Theatrical
- League: Main Stage Arena
- Context: In Building

**Effectiveness:**
- Comedy vs Personals: **0.5** (weak)
- Comedy vs Wordplay: **0.5** (weak)
- Comedy vs Schemes: **2.0** (super effective)
- Name Flips vs all: 1.0 (neutral)
- Pop Culture Refs vs Wordplay: **0.5** (weak)

Average Effectiveness: **0.92** (disadvantage)

**Crowd Preference:**
- Comedy in Main Stage: 1.2 (comedy fans present)
- Name Flips: 1.15
- Pop Culture Refs: 1.1
- Conversational: 1.0
- Charismatic: 1.35 (performance fans dominant)

Average Crowd Preference: **1.16**

**Context Modifier:**
- Comedy In Building: 1.3
- Name Flips In Building: 1.3
- Pop Culture Refs In Building: 1.2
- Conversational In Building: 1.0
- Charismatic In Building: 1.2

Average Context Modifier: **1.20**

**Final Multiplier:**
0.92 × 1.16 × 1.20 = **1.28**

**Result:**
Player's base score of 6.5 → **8.32** (adjusted)
AI's base score of 7.5 → **11.25** (adjusted with ~1.5x from reverse matchup)

**AI wins** despite player having crowd/context bonuses, because effectiveness disadvantage is significant.

---

### Example 3: Balanced Matchup

**Scenario:**
- Player: Punchlines, Storytelling, Freestyles | Passionate | Dynamic Range
- AI: Schemes, Social Commentary, Rebuttals | Smooth Flow | Strategic Pauses
- League: Small Room Circuit
- Context: On Cam

**Effectiveness:**
- Most matchups: 1.0 (neutral)
- Freestyles vs Rebuttals: **2.0** (one super effective)
- Schemes vs Freestyles: **0.5** (AI's weakness)

Average Effectiveness: **1.05** (near neutral)

**Crowd Preference:**
- Both selections have mixed purist appeal
Average: **1.02** for both

**Context Modifier:**
- Punchlines On Cam: 1.05
- Storytelling On Cam: 1.1
- Freestyles On Cam: 1.0
- Passionate On Cam: 1.05
- Dynamic Range On Cam: 1.05

Average: **1.05**

**Final Multiplier:**
Player: 1.05 × 1.02 × 1.05 = **1.12**
AI: 1.05 × 1.02 × 1.05 = **1.12**

**Result:**
Effectively neutral matchup. **Winner determined by attributes and execution**, not content selection strategy.

---

## Testing

### Running Tests

**Unit Tests:**
```bash
npx tsx lib/game/roundContentSelectionTests.ts
```

Tests badge weight mapping, auto-selection, validation, effectiveness calculations, crowd preferences, context modifiers, forecasting, and recommendations.

**Integration Tests:**
```bash
npx tsx lib/game/roundContentIntegrationTests.ts
```

Tests full flow scenarios: auto mode flow, locked-in mode flow, effectiveness impact on scores, league differences, context impact, and edge cases.

### Test Coverage

**Unit Tests (8 test suites):**
- Badge Weight Map Tests
- Auto-Selection Tests
- Validation Tests
- Effectiveness Tests
- Crowd Preference Tests
- Context Modifier Tests
- Effectiveness Forecast Tests
- Recommendation Tests

**Integration Tests (6 test suites):**
- Full Auto Mode Flow
- Locked-In Mode Flow
- Effectiveness Impact on Scores
- League Differences
- Context Impact
- Edge Cases

### Test Results

All tests should pass with 100% success rate. Run tests after any changes to content system logic.

### Manual Testing Checklist

- [ ] Create battle in Small Room Circuit
- [ ] Complete prep phase
- [ ] Choose "Locked In" mode
- [ ] Select Round 1 content (verify validation)
- [ ] Review effectiveness forecast
- [ ] Simulate Round 1
- [ ] Verify round results show content metadata
- [ ] Repeat for Rounds 2 and 3
- [ ] Verify final battle completion
- [ ] Verify content selections saved in database
- [ ] Test Auto mode (full battle simulation)
- [ ] Test Main Stage Arena (different crowd preferences)
- [ ] Test different contexts (in_building, ppv, on_cam)

---

## Future Enhancements

### Phase 3: Dynamic Mid-Round Adjustments (Planned)

**Concept**: Add freestyle/rebuttal opportunities mid-round based on opponent's performance.

**Mechanic**:
- After segment 2 (in 2-min round) or segment 3 (in 3-min round)
- If opponent just had a haymaker segment, player gets option to:
  - Freestyle counter (improv response, high risk/reward)
  - Rebuttal shift (switch one content type mid-round)
  - Stay course (no change, safer)

**Implementation**:
```typescript
interface MidRoundChoice {
  segmentIndex: number;
  trigger: 'opponent_haymaker' | 'low_crowd_reaction';
  options: {
    freestyle_counter: { bonus: 1.5, choke_risk: +0.1 };
    rebuttal_shift: { swap_content_type: ContentType };
    stay_course: { consistency_bonus: 0.1 };
  };
}
```

### Phase 4: League-Specific Content Types

**Concept**: Add league-exclusive content types.

**Examples**:
- Small Room Circuit exclusive: "Deep Cuts" (obscure references for hardcore fans)
- Main Stage Arena exclusive: "Viral Moments" (designed for social media clips)

### Phase 5: Content Progression System

**Concept**: Unlock advanced content types through XP/battles.

**Mechanic**:
- Start with 8 content types unlocked
- Unlock "Advanced Wordplay", "Master Schemes", etc. through usage XP
- Advanced types have higher base multipliers but require higher attributes

### Phase 6: Content Combo Bonuses

**Concept**: Specific content combinations unlock synergy bonuses.

**Examples**:
- Personals + Rebuttals = "Counter Punch" (1.2x bonus)
- Wordplay + Schemes + Storytelling = "Technical Masterclass" (1.3x bonus)
- Comedy + Name Flips + Pop Culture = "Entertainment Package" (1.25x bonus)

### Phase 7: Opponent Scouting

**Concept**: Research opponents before battle to see their typical content selections.

**Mechanic**:
- Spend prep days on "Scouting" (new prep type)
- Reveals AI opponent's most common content types
- Improves forecast accuracy

---

## Known Limitations

1. **V1 Scope**: Player vs AI only (no human vs human in Locked In mode)
2. **No Mid-Round Adjustments**: Content locked once round starts (Phase 3 feature)
3. **Fixed Selection Counts**: Round 1 (3/1/1), Round 2 (4/1/2), Round 3 (3/2/2) - not customizable
4. **No Content Type Unlocks**: All 29 types available from start (Phase 5 feature)
5. **Limited Badge Mappings**: Only ~15 badges mapped to content types (expandable)

---

## File References

### Core Logic Files
- `lib/game/contentTypes.ts` - Content/delivery/performance type definitions
- `lib/game/contentEffectiveness.ts` - Effectiveness matrix (Pokémon-style matchups)
- `lib/game/crowdDemographics.ts` - Crowd demographic preferences
- `lib/game/contextModifiers.ts` - In building vs PPV vs on cam modifiers
- `lib/game/roundContentSelection.ts` - Auto-selection algorithm, validation, forecasting

### Simulation Integration
- `lib/game/singleRoundSimulation.ts` - Single round simulation with content multipliers
- `lib/game/simulation.ts` - Full battle simulation (auto mode)

### API Routes
- `app/api/battles/[id]/lock-in/route.ts` - Lock in mode selection
- `app/api/battles/[id]/rounds/[roundNum]/content/route.ts` - Content submission
- `app/api/battles/[id]/rounds/[roundNum]/simulate/route.ts` - Round simulation
- `app/api/battles/[id]/rounds/[roundNum]/route.ts` - Get round results

### UI Components
- `components/battle/RoundContentSelector.tsx` - Content selection UI
- `components/battle/EffectivenessForecast.tsx` - Forecast display
- `components/battle/RoundResultsBreakdown.tsx` - Results display
- `components/battle/BattleControl.tsx` - Main battle control flow

### Database Migrations
- `supabase/migrations/YYYYMMDD_round_content_selections.sql` - Schema
- `supabase/migrations/YYYYMMDD_battle_rounds_content_metadata.sql` - Extended fields

### Tests
- `lib/game/roundContentSelectionTests.ts` - Unit tests
- `lib/game/roundContentIntegrationTests.ts` - Integration tests

---

## Support & Contact

For questions or issues with the Round Content Selection System:

1. Check this documentation first
2. Run test suites to verify system integrity
3. Review example scenarios for expected behavior
4. Consult battle simulation validation logs

---

**End of Documentation**
**Version 1.0 - Phase 2 Complete**
**Next Phase**: Phase 3 - Dynamic Mid-Round Adjustments (TBD)
