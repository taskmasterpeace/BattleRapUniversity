# Storyline System - Developer Reference

This document explains how to create, modify, and manage storylines in Battle Rap University.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [JSON Schema Reference](#json-schema-reference)
3. [Creating a New Storyline](#creating-a-new-storyline)
4. [Trigger System](#trigger-system)
5. [Effect System](#effect-system)
6. [State Integration](#state-integration)
7. [NPC System](#npc-system)
8. [Scheduled Events](#scheduled-events)
9. [Testing Storylines](#testing-storylines)
10. [Best Practices](#best-practices)

---

## Architecture Overview

### File Locations

```
lib/
├── data/
│   └── storylines/           # JSON storyline definitions
│       ├── family.json
│       ├── legal.json
│       ├── street.json
│       ├── crew.json
│       ├── financial.json
│       ├── rivalry.json
│       ├── health.json
│       ├── career.json
│       └── romance.json
├── game/
│   ├── storylineEngine.ts    # Core storyline processing
│   ├── battlerState.ts       # State management functions
│   └── lifeEventTriggers.ts  # Trigger evaluation
```

### Database Tables

| Table | Purpose |
|-------|---------|
| `storyline_templates` | Stores storyline JSON definitions |
| `active_storylines` | Tracks player's current storylines |
| `battler_life_events` | Individual events from storylines |
| `battler_life_state` | Persistent state (legal, family, etc.) |
| `battler_npcs` | Named characters in player's life |
| `scheduled_life_events` | Future events on timeline |
| `storyline_completions` | History of completed storylines |

### Flow Diagram

```
[Battle Ends]
    ↓
[Trigger Evaluation] ← storyline_templates
    ↓ (if triggered)
[Create active_storyline]
    ↓
[Create Chapter 1 Event] → battler_life_events
    ↓
[Player Makes Choice]
    ↓
[Apply Effects] → battler_life_state, battler_attributes
    ↓
[leads_to: chapter|ending]
    ↓
[If chapter: Schedule next event]
[If ending: Complete storyline, award badge]
```

---

## JSON Schema Reference

### Root Storyline Object

```typescript
interface Storyline {
  code: string;           // Unique identifier: "FEDERAL_HEAT"
  name: string;           // Display name: "Federal Heat"
  description: string;    // Opening hook text
  category: Category;     // One of 9 categories
  min_chapters: number;   // Minimum chapters (2-7)
  max_chapters: number;   // Maximum chapters (2-7)
  trigger: Trigger;       // When does this start?
  chapters: Chapter[];    // All chapter definitions
  endings: Ending[];      // All possible endings
}

type Category =
  | 'family'    // Family issues
  | 'legal'     // Legal problems
  | 'financial' // Money issues
  | 'rivalry'   // Opponent beef
  | 'health'    // Physical/mental health
  | 'career'    // Industry/career
  | 'street'    // Street/violence
  | 'crew'      // Gang/crew
  | 'romance';  // Relationships
```

### Chapter Object

```typescript
interface Chapter {
  id: string;              // Unique within storyline: "federal_ch1"
  chapter_number: number;  // Sequential: 1, 2, 3...
  title: string;           // "The Knock"
  description: string;     // Narrative text shown to player

  delay: {
    type: 'immediate' | 'days' | 'battles';
    value: number;         // 0 for immediate, N for days/battles
  };

  urgency: 'passive' | 'timed' | 'battle_gated' | 'immediate';
  deadline_hours?: number; // Only if urgency is 'timed'
  prep_days_cost?: number; // Days consumed by this chapter

  choices: Choice[];       // 2-3 options for player
}
```

### Choice Object

```typescript
interface Choice {
  id: string;              // "cooperate"
  label: string;           // Button text: "Cooperate"
  description: string;     // Explanation of choice
  effects: Effect[];       // Consequences
  leads_to: {
    type: 'chapter' | 'ending';
    id: string;            // ID of next chapter or ending
  };

  // Optional
  branches_to_storyline?: string;  // Start different storyline
  requires_state?: object;         // State conditions to show choice
}
```

### Effect Object

```typescript
interface Effect {
  type: 'permanent' | 'temporary';

  // Attribute changes (0-10 scale, use decimals)
  reputation?: number;
  financial_stability?: number;
  family_bond?: number;
  resilience?: number;
  crew_loyalty?: number;

  // Stress (0-100 scale)
  stress?: number;

  // Writing attributes (nested)
  writing?: {
    lyricism?: number;
    wordplay?: number;
    creativity?: number;
    flow?: number;
  };

  // Performance attributes (nested)
  performance?: {
    stage_presence?: number;
    crowd_control?: number;
    delivery?: number;
  };

  // Prep impact
  prep_days_lost?: number;
  choke_chance_modifier?: number;
  prep_efficiency_modifier?: number;

  // For temporary effects
  duration_days?: number;
  duration_battles?: number;

  // NPC creation
  create_npc?: {
    relationship_type: NPCType;
    name?: string;
    gender?: 'male' | 'female';
    personality?: string;
    set_as_partner?: boolean;
    set_as_manager?: boolean;
  };

  // State changes (permanent flags)
  state_changes?: {
    set_felony?: boolean;
    felony_type?: string;
    set_probation?: boolean;
    probation_months?: number;
    set_relationship_status?: string;
    set_gang_affiliated?: boolean;
    gang_name?: string;
    add_street_enemy?: boolean;
    increase_heat?: number;
    set_signed_to_label?: boolean;
    label_name?: string;
    hire_manager?: boolean;
    ban_from_league?: string;
  };

  // Schedule future events
  schedule_event?: {
    event_type: string;
    delay_days: number;
    details?: object;
    priority?: number;
    can_be_cancelled?: boolean;
    triggers_storyline?: string;
  };
}
```

### Ending Object

```typescript
interface Ending {
  id: string;              // "federal_end_prison"
  type: 'positive' | 'negative' | 'neutral' | 'catastrophic';
  title: string;           // "Did Time"
  description: string;     // Resolution narrative
  effects: Effect[];       // Final consequences
  badge?: string;          // Badge awarded (optional)
}
```

---

## Creating a New Storyline

### Step 1: Choose Category and Theme

Pick from the 9 categories based on your story:
- Real battle rap event → Usually `legal`, `street`, or `rivalry`
- Relationship drama → `romance` or `family`
- Money problems → `financial`
- Career decisions → `career`

### Step 2: Define Trigger Conditions

```json
"trigger": {
  "type": "random",
  "probability": 0.08,
  "conditions": {
    "min_battles": 10,
    "min_tier": "rising"
  }
}
```

Common trigger patterns:
- **Random after X battles**: `min_battles: 10, probability: 0.08`
- **After loss streak**: `type: "streak", streak_type: "loss", streak_count: 3`
- **Low attribute**: `max_attribute: { "financial_stability": 3 }`
- **Has badge**: `has_badge: ["Choker"]`
- **Previous storyline**: `completed_storyline: [{ storyline_code: "FAMILY_DRAMA" }]`

### Step 3: Design Chapter Flow

Map out your story branches:

```
Chapter 1 (The Hook)
├── Choice A → Chapter 2A
├── Choice B → Chapter 2B
└── Choice C → Ending (Early Resolution)

Chapter 2A
├── Choice A → Chapter 3
└── Choice B → Ending (Bad)

Chapter 2B
├── Choice A → Chapter 3
└── Choice B → Ending (Neutral)

Chapter 3 (Climax)
├── Choice A → Ending (Good)
└── Choice B → Ending (Bad)
```

### Step 4: Write Chapters

Each chapter needs:
1. **Compelling narrative** - What's happening?
2. **2-3 meaningful choices** - Each should feel different
3. **Clear consequences** - Player should understand trade-offs
4. **Appropriate delays** - When does next chapter appear?

### Step 5: Define Endings

Every branch must lead to an ending. Endings should feel:
- **Positive**: Player made good choices, rewarded
- **Negative**: Player made poor choices, consequences
- **Neutral**: Mixed results, life goes on
- **Catastrophic**: Worst case, major setback (use sparingly)

### Step 6: Balance Effects

Guidelines for effect values:
- **Small impact**: ±0.3 to ±0.5
- **Medium impact**: ±0.5 to ±1.0
- **Large impact**: ±1.0 to ±2.0
- **Catastrophic**: ±2.0 to ±3.0

Stress guidelines:
- **Minor stress**: +10 to +20
- **Moderate stress**: +20 to +40
- **Major stress**: +40 to +60
- **Catastrophic**: +60+

---

## Trigger System

### Trigger Types

```typescript
type TriggerType =
  | 'random'        // Random chance after battles
  | 'attribute'     // Based on attribute values
  | 'streak'        // Win/loss streaks
  | 'battle_result' // Specific battle outcomes
  | 'prep_pattern'  // How player preps
  | 'compound';     // Complex AND/OR logic
```

### Compound Triggers

Use `all` (AND) and `any` (OR) for complex conditions:

```json
"trigger": {
  "type": "compound",
  "probability": 0.15,
  "conditions": {
    "all": [
      { "min_tier": "established" },
      { "min_attribute": { "reputation": 6 } },
      {
        "any": [
          { "has_badge": ["Crowd Favorite"] },
          { "min_battles": 30 }
        ]
      }
    ]
  }
}
```

### Condition Reference

| Condition | Type | Example |
|-----------|------|---------|
| `min_battles` | number | `10` |
| `max_battles` | number | `50` |
| `min_attribute` | object | `{ "reputation": 5 }` |
| `max_attribute` | object | `{ "financial_stability": 3 }` |
| `has_badge` | string[] | `["Choker", "Did Time"]` |
| `lacks_badge` | string[] | `["Industry Plant"]` |
| `min_tier` | string | `"established"` |
| `max_tier` | string | `"rising"` |
| `completed_storyline` | object[] | `[{ "storyline_code": "X" }]` |
| `active_storyline` | string[] | `["LEGAL_TROUBLES"]` |
| `no_active_storyline` | string[] | `["FEDERAL_HEAT"]` |
| `has_rival` | boolean | `true` |
| `gang_affiliated` | boolean | `true` |
| `has_felony` | boolean | `true` |

---

## Effect System

### Applying Effects

Effects are processed by `applyStateEffects()` in `battlerState.ts`:

```typescript
await applyStateEffects(supabase, battlerId, effects, storylineCode);
```

### Permanent vs Temporary

**Permanent effects** modify base attributes:
```json
{ "type": "permanent", "reputation": 1.5 }
```

**Temporary effects** create modifiers with expiration:
```json
{
  "type": "temporary",
  "stress": 30,
  "duration_days": 14
}
```

### State Changes

State changes update `battler_life_state` directly:

```json
{
  "type": "permanent",
  "state_changes": {
    "set_felony": true,
    "felony_type": "RICO conspiracy",
    "set_probation": false
  }
}
```

Available state changes:
- `set_felony`, `felony_type`
- `set_probation`, `probation_months`
- `set_relationship_status` (single, dating, married)
- `set_gang_affiliated`, `gang_name`
- `add_street_enemy`, `increase_heat`
- `set_signed_to_label`, `label_name`
- `hire_manager`
- `ban_from_league`

---

## NPC System

### Creating NPCs from Effects

```json
{
  "type": "permanent",
  "create_npc": {
    "relationship_type": "baby_mama",
    "name": "Keisha",
    "gender": "female",
    "personality": "Protective of the kids. Will go public if ignored.",
    "set_as_partner": false
  }
}
```

### NPC Types

| Type | Category | Auto-names from |
|------|----------|-----------------|
| `mother`, `father` | family | Parent name pools |
| `brother`, `sister` | family | Sibling name pools |
| `girlfriend`, `boyfriend` | romantic | Romantic name pools |
| `wife`, `husband` | romantic | Romantic name pools |
| `baby_mama`, `baby_daddy` | romantic | Romantic name pools |
| `manager` | professional | Professional name pools |
| `lawyer` | professional | Professional name pools |
| `og` | street | Street name pools |
| `enemy` | street | Street name pools |
| `crew_member` | street | Street name pools |

### NPC Lifecycle

1. **Created** - Via storyline effect or dev tools
2. **Active** - Normal state, interacts with storylines
3. **Estranged** - Relationship damaged, may reconnect
4. **Deceased** - Permanently gone (triggers grief events)

---

## Scheduled Events

### Creating Future Events

```json
{
  "type": "permanent",
  "schedule_event": {
    "event_type": "prison_release",
    "delay_days": 180,
    "details": {
      "sentence_type": "federal",
      "conviction": "RICO"
    },
    "priority": 10,
    "can_be_cancelled": false,
    "triggers_storyline": "COMEBACK_TOUR"
  }
}
```

### Event Types

| Event Type | Delay | Triggers |
|------------|-------|----------|
| `baby_birth` | ~270 days | BABY_BORN storyline |
| `prison_release` | Variable | COMEBACK storyline |
| `probation_ends` | Variable | Clears probation state |
| `contract_expires` | Variable | FREE_AGENT storyline |
| `court_date` | Variable | COURT_APPEARANCE event |

### Processing Events

The `checkScheduledEvents()` function runs daily (game time):

```typescript
await checkScheduledEvents(supabase, battlerId, currentGameDate);
```

---

## Testing Storylines

### Using Dev Tools

1. Go to `/dev` → **Storylines** tab
2. Select a battler
3. Click **Trigger Storyline** to manually start any storyline
4. Use **Life State** tab to modify state for testing triggers

### Test Scenarios

Always test:
1. **Happy path** - Best choices, positive ending
2. **Bad path** - Worst choices, catastrophic ending
3. **Mixed path** - Some good, some bad
4. **Timeout** - What happens if player ignores timed events?
5. **Prerequisite states** - Does it trigger correctly based on conditions?

### Debug Logging

Enable storyline debug logs:
```typescript
// In storylineEngine.ts
const DEBUG = true;
```

---

## Best Practices

### Writing Quality

1. **Use battle rap voice** - Write like a battle rap blogger, not a textbook
2. **Keep it real** - Base on actual battle rap scenarios
3. **Show don't tell** - Describe situations, let player infer meaning
4. **Meaningful choices** - No obviously "correct" answer

### Balance Guidelines

1. **Prep day costs**:
   - Minor event: 0-1 days
   - Moderate event: 2-3 days
   - Major event: 4-5 days
   - Catastrophic: 6+ days

2. **Story length**:
   - Quick events: 2 chapters
   - Standard stories: 3-4 chapters
   - Epic arcs: 5-7 chapters

3. **Ending distribution**:
   - 1-2 positive endings
   - 1-2 neutral endings
   - 1-2 negative endings
   - 0-1 catastrophic ending

### Technical Guidelines

1. **Unique IDs** - All `id` fields must be unique within the storyline
2. **Valid references** - `leads_to.id` must match an existing chapter or ending
3. **No orphan chapters** - Every chapter must be reachable from chapter 1
4. **No dead ends** - Every chapter must lead somewhere

### Common Mistakes

- **Effect values too high** - Don't give +3 reputation for minor choices
- **No consequences** - Every choice should matter
- **Linear story** - If all paths lead to same ending, why have choices?
- **Unrealistic triggers** - Don't trigger "label interest" for rookie tier players

---

## Adding to Database

Storylines are loaded from JSON files in `lib/data/storylines/`. To add:

1. Create JSON file or add to existing category file
2. Run seed script to load into `storyline_templates` table
3. Test via Dev Tools

Or directly insert:

```sql
INSERT INTO storyline_templates (code, name, description, category, min_chapters, max_chapters, trigger_config, chapters, endings)
VALUES (
  'YOUR_CODE',
  'Your Name',
  'Your description',
  'category',
  3,
  5,
  '{"type": "random", "probability": 0.08}'::jsonb,
  '[...]'::jsonb,
  '[...]'::jsonb
);
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/dev/storylines` | GET | List all storyline templates |
| `/api/dev/storylines` | POST | Trigger storyline for battler |
| `/api/dev/state` | GET | Get battler's full state |
| `/api/dev/state` | POST | Apply effects to battler |
| `/api/dev/state/npcs` | GET | List battler's NPCs |
| `/api/dev/state/npcs` | POST | Create NPC |
| `/api/dev/state/scheduled-events` | GET | List scheduled events |

---

*Build drama. Create consequences. Make choices matter.*
