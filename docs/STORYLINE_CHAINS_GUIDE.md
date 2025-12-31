# Storyline Chains System Guide

This guide covers the Storyline Chains system - a narrative arc system that creates multi-chapter story events where player choices lead to different paths and endings.

---

## Table of Contents

1. [Part 1: Player Guide](#part-1-player-guide)
2. [Part 2: Author Guide](#part-2-author-guide)
3. [Part 3: Trigger Conditions Reference](#part-3-trigger-conditions-reference)
4. [Part 4: Effects Reference](#part-4-effects-reference)
5. [Part 5: Best Practices](#part-5-best-practices)

---

# Part 1: Player Guide

## What Are Storylines?

Storylines are multi-event narrative arcs that unfold over time based on your choices. Unlike standalone life events, storylines:

- **Have multiple chapters** (2-7 events connected together)
- **Branch based on your choices** - different decisions lead to different outcomes
- **Have endings** - positive, negative, neutral, or catastrophic
- **Can earn you badges** - certain endings unlock special badges
- **Cost prep days** - dealing with life drama takes time away from battle prep

## How Storylines Appear In-Game

### Dashboard View
Active storylines appear on your dashboard in the "Active Storylines" card. Each shows:
- **Storyline name** and current chapter
- **Category icon** (family, legal, career, etc.)
- **Urgency indicator** - red warning if deadline approaching
- **Prep days lost** - total days the storyline has cost you

### Life Events Page
When a storyline chapter is ready, it appears in your Life Events. The event shows:
- **Chapter title** and description
- **Available choices** (usually 2-3 options)
- **Effects preview** - what each choice will do
- **Deadline** (if timed)

## Making Choices

Each chapter presents you with 2-3 choices. Consider:

1. **Immediate effects** - How does this affect your stats right now?
2. **Prep day cost** - How many days will this choice take?
3. **Story path** - Where does this choice lead? (more chapters or an ending)

### Example: Family Crisis

```
Chapter 1: The First Call
Your mom called. Something's wrong at home.

CHOICE A: Go Home
  - Family Bond +1.5
  - Lose 3 prep days
  - Leads to: ENDING (Family First)

CHOICE B: Send Money
  - Family Bond -0.3
  - Financial Stability -0.5
  - Leads to: Chapter 2

CHOICE C: Focus on Career
  - Family Bond -1.0
  - Stress +15
  - Leads to: Chapter 3 (Crisis)
```

## Understanding Effects

Effects modify your battler's attributes:

| Effect Type | Duration | Example |
|------------|----------|---------|
| **Permanent** | Forever | Family Bond +1.0 |
| **Temporary** | X days/battles | Stress +20 for 30 days |
| **Prep Cost** | Immediate | Lose 3 prep days |

### Key Attributes Affected

- **Reputation** - How others view you in the scene
- **Financial Stability** - Your money situation
- **Family Bond** - Relationship with family
- **Resilience** - Ability to handle pressure
- **Stress** - Mental load (high stress = bad performance)
- **Crew Loyalty** - Street/gang affiliations

## Prep Day Costs

Storyline events can cost you prep days. When this happens:

1. Your **prep calendar loses days** - those days are simply gone
2. The impact is recorded so you know why
3. You get fewer prep days before your next battle

**Strategy**: If you have a big battle coming up, try to choose options that minimize prep day loss.

## Urgency and Deadlines

Storyline chapters have different urgency levels:

| Urgency | Behavior |
|---------|----------|
| `passive` | No deadline - resolve whenever |
| `timed` | Must respond within X hours |
| `battle_gated` | Triggers after X battles |
| `immediate` | Appears right away |

### Missing a Deadline

If you miss a timed deadline:
- The storyline is **abandoned**
- You receive **penalty effects** (stress +15, reputation -0.5)
- No badge is earned
- The story ends abruptly

## Endings and Badges

Storylines have 4 ending types:

| Type | Meaning | Badge |
|------|---------|-------|
| `positive` | Best outcome | Often earns a good badge |
| `neutral` | Neither good nor bad | Rarely earns a badge |
| `negative` | Bad outcome | May earn a negative badge |
| `catastrophic` | Worst outcome | Usually earns a bad badge |

### Example Badges from Storylines

- **"Family First"** - Dropped everything when family needed you
- **"Forgot Where You Came From"** - Abandoned your family
- **"Street Survivor"** - Made it through a violent situation
- **"Debt Free"** - Climbed out of financial trouble

## Storyline Categories

| Category | Theme | Examples |
|----------|-------|----------|
| `family` | Home and relatives | Parent illness, sibling drama |
| `legal` | Law trouble | Arrest, lawsuit, contract dispute |
| `financial` | Money issues | Debt spiral, bad investment |
| `rivalry` | Battler beef | Opponent won't let it go |
| `health` | Physical/mental | Injury, burnout, addiction |
| `career` | Industry drama | Label deal, league politics |
| `street` | Violence | Got jumped, altercation |
| `crew` | Gang/set drama | Old crew wants you back |
| `romance` | Relationship | Cheating scandal, baby mama |

---

# Part 2: Author Guide

## JSON Format Reference

Every storyline is defined as a JSON file with this structure:

```json
{
  "code": "UNIQUE_CODE",
  "name": "Display Name",
  "description": "Opening hook shown to player",
  "category": "family",
  "min_chapters": 2,
  "max_chapters": 5,

  "trigger": { ... },
  "chapters": [ ... ],
  "endings": [ ... ]
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Unique identifier (SCREAMING_SNAKE_CASE) |
| `name` | string | Human-readable name |
| `description` | string | Hook text for player |
| `category` | string | One of the 9 categories |
| `min_chapters` | number | Minimum chapters (for display) |
| `max_chapters` | number | Maximum chapters (for display) |
| `trigger` | object | When this storyline starts |
| `chapters` | array | All chapter definitions |
| `endings` | array | All possible endings |

## Creating a New Storyline

### Step 1: Plan Your Story Arc

Before writing JSON, outline:

1. **Theme**: What's the core conflict?
2. **Entry point**: How does the player get into this?
3. **Key decision points**: What are the 2-3 major choices?
4. **Endings**: What are the possible outcomes?
5. **Duration**: How many chapters (2-7)?

### Step 2: Define the Trigger

The trigger determines when this storyline starts:

```json
"trigger": {
  "type": "random",
  "probability": 0.12,
  "conditions": {
    "min_battles": 5,
    "max_attribute": { "family_bond": 7 }
  }
}
```

### Step 3: Write the Chapters

Each chapter needs:

```json
{
  "id": "family_ch1",
  "chapter_number": 1,
  "title": "The First Call",
  "description": "Your mom called. Something's wrong at home.",

  "delay": { "type": "immediate", "value": 0 },
  "urgency": "timed",
  "deadline_hours": 72,
  "prep_days_cost": 0,

  "choices": [ ... ]
}
```

### Step 4: Define Choices

Each choice in a chapter:

```json
{
  "id": "go_home",
  "label": "Go Home",
  "description": "Drop everything and go.",
  "effects": [
    { "type": "permanent", "family_bond": 1.5 },
    { "type": "temporary", "prep_days_lost": 3 }
  ],
  "leads_to": { "type": "ending", "id": "family_end_resolved" }
}
```

### Step 5: Define Endings

Each ending:

```json
{
  "id": "family_end_resolved",
  "type": "positive",
  "title": "Family First",
  "description": "You dropped everything when it mattered.",
  "effects": [
    { "type": "permanent", "family_bond": 1.0 },
    { "type": "temporary", "stress": -15 }
  ],
  "badge": "Family First"
}
```

## Full Example: Simple Storyline

```json
{
  "code": "QUICK_CASH",
  "name": "Quick Money Offer",
  "description": "Someone approaches you with a way to make fast cash...",
  "category": "financial",
  "min_chapters": 2,
  "max_chapters": 3,

  "trigger": {
    "type": "attribute",
    "probability": 0.10,
    "conditions": {
      "min_attribute": { "financial_stability": 3 },
      "max_attribute": { "financial_stability": 5 }
    }
  },

  "chapters": [
    {
      "id": "quick_ch1",
      "chapter_number": 1,
      "title": "The Offer",
      "description": "A guy at the venue says he knows how you can make some quick money. No questions asked.",
      "delay": { "type": "immediate", "value": 0 },
      "urgency": "timed",
      "deadline_hours": 48,
      "prep_days_cost": 0,
      "choices": [
        {
          "id": "take_offer",
          "label": "Hear Him Out",
          "description": "Money is money...",
          "effects": [],
          "leads_to": { "type": "chapter", "id": "quick_ch2" }
        },
        {
          "id": "decline",
          "label": "Walk Away",
          "description": "If it sounds too good to be true...",
          "effects": [
            { "type": "temporary", "stress": 5, "duration_days": 7 }
          ],
          "leads_to": { "type": "ending", "id": "quick_end_safe" }
        }
      ]
    },
    {
      "id": "quick_ch2",
      "chapter_number": 2,
      "title": "The Job",
      "description": "Turns out he needs you to transport something. You don't ask what's in the bag.",
      "delay": { "type": "days", "value": 2 },
      "urgency": "timed",
      "deadline_hours": 24,
      "prep_days_cost": 2,
      "choices": [
        {
          "id": "do_it",
          "label": "Do the Job",
          "description": "Get that money.",
          "effects": [
            { "type": "permanent", "financial_stability": 2.0 }
          ],
          "leads_to": { "type": "ending", "id": "quick_end_paid" }
        },
        {
          "id": "bail",
          "label": "Back Out",
          "description": "This ain't worth it.",
          "effects": [
            { "type": "permanent", "reputation": -0.5 }
          ],
          "leads_to": { "type": "ending", "id": "quick_end_bail" }
        }
      ]
    }
  ],

  "endings": [
    {
      "id": "quick_end_safe",
      "type": "neutral",
      "title": "Dodged a Bullet",
      "description": "You hear later that the guy got arrested. Good call.",
      "effects": []
    },
    {
      "id": "quick_end_paid",
      "type": "positive",
      "title": "Easy Money",
      "description": "You got paid and nobody's the wiser. For now.",
      "effects": [
        { "type": "temporary", "stress": 10, "duration_days": 14 }
      ]
    },
    {
      "id": "quick_end_bail",
      "type": "negative",
      "title": "Burned Bridge",
      "description": "Word gets around that you're unreliable. Some doors may be closed now.",
      "effects": []
    }
  ]
}
```

---

# Part 3: Trigger Conditions Reference

Triggers determine when a storyline can start. The system checks triggers after each battle.

## Trigger Types

### `random`
Simple probability check.

```json
{
  "type": "random",
  "probability": 0.15
}
```

### `attribute`
Triggers based on battler attribute values.

```json
{
  "type": "attribute",
  "probability": 0.12,
  "conditions": {
    "min_attribute": { "financial_stability": 3 },
    "max_attribute": { "reputation": 8 }
  }
}
```

### `streak`
Triggers based on win/loss streaks.

```json
{
  "type": "streak",
  "conditions": {
    "streak_type": "win",
    "streak_count": 3
  }
}
```

### `battle_result`
Triggers based on specific battle outcome.

```json
{
  "type": "battle_result",
  "conditions": {
    "outcome": "loss",
    "choke_required": true
  }
}
```

### `prep_pattern`
Triggers based on prep behavior.

```json
{
  "type": "prep_pattern",
  "conditions": {
    "max_prep_days": 3
  }
}
```

### `compound`
Combines multiple conditions with AND/OR logic.

```json
{
  "type": "compound",
  "probability": 0.15,
  "conditions": {
    "all": [
      { "has_badge": ["Choker"] },
      { "min_battles": 10 },
      { "min_tier": "rising" }
    ]
  }
}
```

## Condition Reference

### Basic Conditions

| Condition | Type | Description |
|-----------|------|-------------|
| `min_battles` | number | Minimum total battles |
| `max_battles` | number | Maximum total battles |
| `min_attribute` | object | Minimum attribute values |
| `max_attribute` | object | Maximum attribute values |

### Badge Conditions

| Condition | Type | Description |
|-----------|------|-------------|
| `has_badge` | string[] | Must have ALL of these badges |
| `lacks_badge` | string[] | Must NOT have any of these badges |
| `badge_count_min` | number | Must have at least X total badges |

### Previous Decision Conditions

| Condition | Type | Description |
|-----------|------|-------------|
| `made_choice` | array | Must have made specific choice(s) |
| `completed_storyline` | array | Must have completed storyline(s) |
| `active_storyline` | string[] | Must have active storyline(s) |
| `no_active_storyline` | string[] | Must NOT have active storyline(s) |

**made_choice format:**
```json
{
  "made_choice": [{
    "storyline_code": "FAMILY_DRAMA",
    "choice_id": "ignore"
  }]
}
```

**completed_storyline format:**
```json
{
  "completed_storyline": [{
    "storyline_code": "FAMILY_DRAMA",
    "ending_type": "negative"
  }]
}
```

### Relationship Conditions

| Condition | Type | Description |
|-----------|------|-------------|
| `has_rival` | boolean | Has at least one rivalry |
| `rival_with` | string | Specific battler rivalry |
| `has_ally` | boolean | Has at least one ally |
| `ally_with` | string | Specific battler alliance |
| `relationship_count_min` | number | Minimum relationships |

### Career Tier Conditions

| Condition | Type | Description |
|-----------|------|-------------|
| `tier` | string | Must be exactly this tier |
| `min_tier` | string | Must be at least this tier |
| `max_tier` | string | Must be at most this tier |

**Tiers (lowest to highest):**
- `rookie` - Rating 0-1200, 0-10 battles
- `rising` - Rating 1200-1500, 10-25 battles
- `established` - Rating 1500-1800, 25-50 battles
- `elite` - Rating 1800-2100, 50-100 battles
- `legend` - Rating 2100+, 100+ battles

### League/Event Conditions

| Condition | Type | Description |
|-----------|------|-------------|
| `league_affiliation` | string[] | Member of league(s) |
| `league_standing_min` | number | Top X in their league |
| `attended_event` | string[] | Has attended event(s) |

### Compound Logic

Use `all` for AND logic (all conditions must be true):

```json
{
  "conditions": {
    "all": [
      { "has_badge": ["Choker"] },
      { "min_tier": "rising" },
      { "max_attribute": { "resilience": 5 } }
    ]
  }
}
```

Use `any` for OR logic (any condition can be true):

```json
{
  "conditions": {
    "any": [
      { "has_badge": ["Street Legend"] },
      { "min_attribute": { "crew_loyalty": 8 } },
      { "completed_storyline": [{ "storyline_code": "CREW_PRESSURE" }] }
    ]
  }
}
```

Combine them for complex logic:

```json
{
  "conditions": {
    "all": [
      { "min_tier": "established" },
      {
        "any": [
          { "has_badge": ["Choker"] },
          { "completed_storyline": [{ "storyline_code": "HEALTH_CRISIS", "ending_type": "negative" }] }
        ]
      }
    ]
  }
}
```

---

# Part 4: Effects Reference

Effects are changes applied to battler attributes when choices are made.

## Effect Types

### `permanent`
Changes that persist forever.

```json
{ "type": "permanent", "family_bond": 1.5 }
```

### `temporary`
Changes that fade over time.

```json
{
  "type": "temporary",
  "stress": 20,
  "duration_days": 30
}
```

### `prep_days_lost`
Special effect that removes prep days from upcoming battles.

```json
{ "type": "temporary", "prep_days_lost": 3 }
```

## Available Attributes

### Personal Attributes

| Attribute | Range | Description |
|-----------|-------|-------------|
| `reputation` | 0-10 | Standing in the scene |
| `financial_stability` | 0-10 | Money situation |
| `family_bond` | 0-10 | Family relationships |
| `resilience` | 0-10 | Mental fortitude |
| `preparation` | 0-10 | Prep effectiveness |
| `crew_loyalty` | 0-10 | Gang/crew standing (hidden) |
| `stress` | 0-100 | Mental load |

### Writing Attributes

```json
{
  "type": "permanent",
  "writing": {
    "lyricism": 0.5,
    "wordplay": 0.3,
    "creativity": -0.2,
    "flow": 0.1
  }
}
```

### Performance Attributes

```json
{
  "type": "permanent",
  "performance": {
    "stage_presence": 0.5,
    "crowd_control": 0.3,
    "delivery": 0.2
  }
}
```

### Battle Modifiers

| Modifier | Description |
|----------|-------------|
| `choke_chance_modifier` | Adjust choke probability |
| `prep_efficiency_modifier` | How effective prep is |

### Duration Options

For temporary effects:

| Option | Description |
|--------|-------------|
| `duration_days` | Effect lasts X real days |
| `duration_battles` | Effect lasts X battles |

## Effect Examples

**Stress increase (temporary):**
```json
{ "type": "temporary", "stress": 25, "duration_days": 14 }
```

**Reputation boost (permanent):**
```json
{ "type": "permanent", "reputation": 1.0 }
```

**Multiple effects:**
```json
[
  { "type": "permanent", "family_bond": -2.0 },
  { "type": "permanent", "resilience": -0.5 },
  { "type": "temporary", "stress": 40, "duration_days": 60 }
]
```

**Lose prep days:**
```json
{ "type": "temporary", "prep_days_lost": 3 }
```

---

# Part 5: Best Practices

## Balancing Prep Costs

### Guidelines by Category

| Category | Typical Prep Cost | Rationale |
|----------|------------------|-----------|
| `family` | 1-3 days | Emotional drain |
| `legal` | 2-5 days | Court dates, meetings |
| `financial` | 0-2 days | Mostly mental stress |
| `rivalry` | 0-1 days | Can fuel performance |
| `health` | 3-7 days | Physical recovery |
| `career` | 1-2 days | Meetings, decisions |
| `street` | 0-7 days | Depends on violence |
| `crew` | 1-3 days | Obligations |
| `romance` | 0-2 days | Emotional distraction |

### Don't Punish Too Hard

- Keep total possible prep loss reasonable
- The "good" path shouldn't always be free
- Sometimes the "bad" choice should cost less prep but hurt stats

## Creating Meaningful Choices

### Avoid Obvious Best Choices

Bad:
```
A) Get $1000, lose 1 prep day
B) Get nothing, lose 5 prep days
```

Good:
```
A) Get $1000, lose 3 prep days, reputation -1
B) Stay focused, keep prep, stress +10
C) Ask crew for help, prep -1, crew_loyalty +1
```

### Trade-offs Matter

Each choice should have:
- At least one positive
- At least one negative
- Different value for different playstyles

### Consider Player Build

A "writing-focused" player might value:
- Keeping creativity high
- Trading performance stats for writing stats

A "street" player might value:
- Crew loyalty
- Reputation in certain circles

## Avoiding Dead Ends

### Every Path Should Continue

- Each choice should lead somewhere
- Don't create chapters with no outgoing choices
- Every story path should reach an ending

### Chapter IDs Must Match

If a choice `leads_to: { type: "chapter", id: "family_ch3" }`, that chapter must exist.

### Ending IDs Must Match

If a choice `leads_to: { type: "ending", id: "family_end_good" }`, that ending must exist.

## Cross-Category Storylines

### Branching to Other Categories

Some choices can trigger different category storylines:

```json
{
  "id": "fight_back",
  "label": "Fight Back",
  "description": "You ain't backing down.",
  "effects": [...],
  "leads_to": { "type": "ending", "id": "street_end_fought" },
  "branches_to_storyline": "HEALTH_CRISIS"
}
```

### Natural Category Transitions

| From | Can Lead To | Example |
|------|------------|---------|
| `street` | `health` | Getting injured in fight |
| `street` | `legal` | Cops got involved |
| `crew` | `street` | Crew beef gets violent |
| `financial` | `legal` | Debts lead to legal trouble |
| `romance` | `career` | Ex exposes you publicly |

## Testing Storylines

### Validation Checklist

1. All chapter IDs are unique
2. All `leads_to.id` references exist
3. All endings have proper types
4. Effects use valid attribute names
5. Trigger conditions are achievable

### Test All Paths

Walk through every possible path:
1. Chapter 1 → Choice A → Where does it go?
2. Chapter 1 → Choice B → Where does it go?
3. Continue until all endings are reached

### Edge Cases to Test

- What if player has max/min attributes?
- What if player already has required badge?
- What if deadline passes?
- What if player has no prep days to lose?

---

## Quick Reference: Creating a Storyline

1. **Choose a code**: `CATEGORY_THEME` (e.g., `FAMILY_DRAMA`)
2. **Write the hook**: 1-2 sentence description
3. **Set trigger conditions**: When should this start?
4. **Outline chapters**: What happens in each step?
5. **Define choices**: 2-3 options per chapter
6. **Connect the paths**: What leads where?
7. **Write endings**: 3-4 possible conclusions
8. **Balance effects**: Make trade-offs meaningful
9. **Add badges**: Reward memorable outcomes
10. **Test all paths**: Make sure nothing breaks

---

## Files Location

Storyline templates go in: `lib/data/storylines/`

Example files:
- `family.json` - Family category storylines
- `legal.json` - Legal category storylines
- `street.json` - Street category storylines
- etc.

Each file contains one storyline template. Files are loaded into the database via seed migrations.
