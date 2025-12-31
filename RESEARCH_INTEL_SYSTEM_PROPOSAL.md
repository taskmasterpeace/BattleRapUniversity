# Research & Intel System - Comprehensive Proposal

## Executive Summary

This proposal redesigns the secrets/intel system to feel authentic to battle rap culture, where **months of research** and **hyper-specific personal attacks** separate good battlers from legends.

Key insight from research: *"The best battlers come armed with dossiers of dirt. When you drop hyper-specific references to your opponent's life, it undermines their confidence."* - [BeatsToRapOn](https://beatstorapon.com/blog/how-to-win-a-rap-battle-an-experts-guide/)

---

## Part 1: Expanded Secret Status Lifecycle

### Current Status Flow
```
private → rumored → exposed → addressed
```

### Proposed Status Flow
```
PERSONAL → PRIVATE → RUMORED → EXPOSED → ADDRESSED → STALE
    ↓          ↓         ↓          ↓          ↓         ↓
 Only you   Close     Scene is   Used in    You've    Worn out,
  know      circle    talking    a battle   responded  doesn't hit
```

### New Status Definitions

| Status | Description | Exposure Risk | Angle Power |
|--------|-------------|---------------|-------------|
| `personal` | Only the battler knows. Deep secret. | 0-5% | N/A (undiscoverable) |
| `private` | Close circle knows (family, crew). Can be discovered with deep research. | 5-20% | 100% (devastating) |
| `rumored` | Word is getting around. Scene is whispering. Research easily finds it. | 20-50% | 85% (still hits hard) |
| `exposed` | Has been used in a battle or leaked publicly. Everyone knows. | 100% (already out) | 70% (expected but effective) |
| `addressed` | Battler has publicly responded to it (life event choice). | Varies | 50% (they have a response) |
| `stale` | Used 3+ times against this battler. Crowd has heard it. | N/A | 25% (played out) |

### Status Transitions

```
PERSONAL (life event creates it)
    ↓ [exposure_risk roll OR deep research]
PRIVATE (leaked to close circle)
    ↓ [exposure_risk roll OR research discovery]
RUMORED (scene whispers)
    ↓ [used in battle OR public leak]
EXPOSED (everyone knows)
    ↓ [battler chooses to address via life event]
ADDRESSED (battler responded)
    ↓ [used 3+ times in battles]
STALE (played out angle)
```

---

## Part 2: Research System Architecture

### Core Concept: Research Anytime, Not Just Pre-Battle

**Why?** Real battlers are always collecting intel. They might research someone for MONTHS before even accepting a battle with them. Sometimes you hunt for dirt THEN call someone out.

### Research Mechanics

#### 2.1 Research Actions (Available Anytime)

```typescript
interface ResearchAction {
  type: 'surface_scan' | 'deep_dive' | 'street_intel' | 'social_stalking'
  target_battler_id: string
  time_cost: number  // in "prep days" or "career days"
  financial_cost?: number
  discovery_chances: {
    public_info: number      // Easy stuff (career record, style)
    rumored_secrets: number  // Moderate (stuff scene knows)
    private_secrets: number  // Hard (close circle stuff)
    personal_secrets: number // Near impossible (deep secrets)
  }
}

const RESEARCH_TYPES = {
  surface_scan: {
    name: "Surface Scan",
    description: "Watch their battles, check their socials",
    time_cost: 1,
    discovery_chances: { public: 0.95, rumored: 0.30, private: 0.05, personal: 0.00 }
  },
  deep_dive: {
    name: "Deep Dive",
    description: "Go through everything - old footage, interviews, tweets",
    time_cost: 3,
    discovery_chances: { public: 1.00, rumored: 0.60, private: 0.15, personal: 0.02 }
  },
  street_intel: {
    name: "Street Intel",
    description: "Talk to people who know them, their city, their crew",
    time_cost: 2,
    financial_cost: 500,
    discovery_chances: { public: 0.80, rumored: 0.70, private: 0.35, personal: 0.05 }
  },
  social_stalking: {
    name: "Social Stalking",
    description: "Deep social media investigation - old posts, tagged photos, exes",
    time_cost: 4,
    discovery_chances: { public: 0.90, rumored: 0.80, private: 0.40, personal: 0.08 }
  }
}
```

#### 2.2 Research Modifiers

**Battler Attributes That Affect Research:**

| Attribute | Effect on Research |
|-----------|-------------------|
| `writing.creativity` | +10% discovery chance per point above 5 |
| `personal.reputation` | Access to street intel sources |
| Badge: `Angler` | +20% to private/personal discovery |
| Badge: `Researcher` | -1 time cost on all research |
| Badge: `Connected` | Street intel costs 50% less |

**Target Attributes That Protect Secrets:**

| Attribute | Effect |
|-----------|--------|
| `personal.reputation` | Higher rep = more protection (people don't snitch) |
| Badge: `Private Person` | -30% discovery chance on all secrets |
| Badge: `Media Trained` | -50% discovery on addressed secrets |

#### 2.3 Intel Storage: The Notebook

All discovered intel goes into `battler_intel_notebook`:

```sql
CREATE TABLE battler_intel_notebook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_battler_id UUID NOT NULL REFERENCES battlers(id),
  target_battler_id UUID NOT NULL REFERENCES battlers(id),

  -- What was discovered
  intel_type TEXT NOT NULL,  -- 'public_fact', 'rumor', 'secret', 'style_note'
  secret_id UUID REFERENCES battler_secrets(id),  -- If it's a secret

  -- Intel details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_level NUMERIC DEFAULT 0.5,  -- How sure are you (0-1)

  -- Discovery metadata
  discovered_at TIMESTAMPTZ DEFAULT now(),
  discovery_method TEXT,  -- 'research', 'battle', 'life_event', 'rumor_mill'

  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  effectiveness_rating NUMERIC,  -- How well it worked when used

  UNIQUE(owner_battler_id, target_battler_id, secret_id)
);
```

---

## Part 3: Angle Usage & Staleness System

### The Problem
In real battle rap, if someone uses the same angle against you that 5 other battlers already used, the crowd doesn't react as hard. It's "played out."

### Angle Effectiveness Formula

```typescript
function calculateAngleEffectiveness(
  secret: BattlerSecret,
  intel: IntelNotebookEntry,
  battler: Battler
): number {
  let baseEffectiveness = 1.0

  // Status modifier
  const statusModifiers = {
    'personal': 1.2,   // Holy shit moment
    'private': 1.0,    // Devastating
    'rumored': 0.85,   // Hits hard
    'exposed': 0.70,   // Expected but effective
    'addressed': 0.50, // They have a response
    'stale': 0.25      // Played out
  }
  baseEffectiveness *= statusModifiers[secret.status]

  // Times used modifier (diminishing returns)
  const usageModifier = Math.max(0.3, 1.0 - (secret.times_used_against * 0.15))
  baseEffectiveness *= usageModifier

  // Severity modifier
  const severityModifiers = { 'minor': 0.6, 'moderate': 0.8, 'major': 1.0, 'critical': 1.2 }
  baseEffectiveness *= severityModifiers[secret.severity]

  // Angler badge bonus (skilled anglers get more out of angles)
  if (battler.badges.includes('Angler')) {
    baseEffectiveness *= 1.25  // +25% effectiveness
  }
  if (battler.badges.includes('Master Angler')) {
    baseEffectiveness *= 1.15  // Additional +15%
  }

  // Fresh angle badge (better at finding new angles on old info)
  if (battler.badges.includes('Fresh Angle King') && secret.times_used_against > 0) {
    baseEffectiveness *= 1.3  // Can revive stale angles
  }

  return Math.min(1.5, Math.max(0.2, baseEffectiveness))
}
```

### Global vs Personal Usage Tracking

```sql
-- Track how many times a secret has been used GLOBALLY
ALTER TABLE battler_secrets ADD COLUMN times_used_against INTEGER DEFAULT 0;
ALTER TABLE battler_secrets ADD COLUMN times_used_by_player INTEGER DEFAULT 0;  -- Specifically by player

-- Track usage per-battle
CREATE TABLE battle_angle_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id),
  battler_id UUID NOT NULL REFERENCES battlers(id),
  secret_id UUID REFERENCES battler_secrets(id),
  intel_id UUID REFERENCES battler_intel_notebook(id),

  round_number INTEGER NOT NULL,
  angle_type TEXT NOT NULL,  -- 'personal', 'career', 'appearance', 'generic'
  effectiveness_score NUMERIC,
  crowd_reaction INTEGER,  -- -100 to 100

  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Part 4: New Badge Category - "Angler" Badges

Based on your idea of Angler badges for battlers who excel at personal angles:

```typescript
const ANGLER_BADGES = {
  // Discovery badges
  'Researcher': {
    description: "Spends extra time on research",
    effect: { research_time_reduction: 1 }
  },
  'Social Media Stalker': {
    description: "Finds dirt through deep social media dives",
    effect: { social_research_bonus: 0.20 }
  },
  'Street Connected': {
    description: "Has sources in every city",
    effect: { street_intel_bonus: 0.25, street_intel_cost_reduction: 0.50 }
  },

  // Usage badges
  'Angler': {
    description: "Known for devastating personal attacks",
    effect: { angle_effectiveness: 0.25, angle_crowd_bonus: 10 }
  },
  'Master Angler': {
    description: "Elite at personal angles - makes it hurt",
    effect: { angle_effectiveness: 0.40, angle_crowd_bonus: 20 }
  },
  'Fresh Angle King': {
    description: "Finds new ways to use old information",
    effect: { stale_angle_revival: 0.30 }
  },
  'Angle God': {
    description: "Legendary for personal destruction",
    effect: { angle_effectiveness: 0.50, can_expose_personal: true }
  },

  // Defense badges
  'Private Person': {
    description: "Keeps their life locked down",
    effect: { discovery_resistance: 0.30 }
  },
  'Media Trained': {
    description: "Knows how to address angles and neutralize them",
    effect: { addressed_protection: 0.50 }
  },
  'Untouchable': {
    description: "Nothing sticks - always has a response",
    effect: { addressed_protection: 0.70, angle_crowd_penalty_reduction: 0.50 }
  }
}
```

---

## Part 5: Research UI Flow (Pre-Battle & Anytime)

### 5.1 Anytime Research (New Feature)

```
DASHBOARD
    └── INTEL HUB (New Section)
        ├── My Intel Notebook
        │   └── List of all battlers you have intel on
        │       └── Per-battler intel cards
        ├── Research Target
        │   ├── Search for battler
        │   ├── Choose research type
        │   └── Spend time/money
        ├── Rumors & Whispers
        │   └── Scene gossip (random intel hints)
        └── Call-Out Targets
            └── Battlers you have good intel on
```

### 5.2 Pre-Battle Research (Enhanced)

```
PREP PHASE
    └── Day Allocation
        ├── Writing (improve bars)
        ├── Performance (delivery practice)
        ├── Research (discover intel) ← ENHANCED
        │   ├── Surface scan (1 day)
        │   ├── Deep dive (2 days)
        │   └── Street intel (2 days + $)
        ├── Rest (reduce choke chance)
        └── Life (handle life events)
```

### 5.3 Intel Discovery Notification

When research discovers something:

```typescript
interface IntelDiscoveryEvent {
  type: 'intel_discovered'
  target_battler_id: string
  intel_type: 'public' | 'rumor' | 'secret'
  secret?: {
    id: string
    title: string
    status: string
    severity: string
    preview: string  // "Something about their family situation..."
  }
  confidence: number

  // Player choices
  actions: [
    { id: 'note_it', label: 'Add to notebook' },
    { id: 'dig_deeper', label: 'Dig deeper (costs more time)' },
    { id: 'share_rumor', label: 'Leak it to the scene' },  // Increases exposure_risk
    { id: 'save_for_battle', label: 'Save for the perfect moment' }
  ]
}
```

---

## Part 6: Authentic Battle Rap Secret Types (Expanded)

Based on real battle rap culture, expand secret types:

```typescript
const SECRET_TYPES = {
  // Personal Life
  'family_scandal': { category: 'personal', severity_range: ['moderate', 'major', 'critical'] },
  'relationship_drama': { category: 'personal', severity_range: ['minor', 'moderate', 'major'] },
  'baby_mama_drama': { category: 'personal', severity_range: ['moderate', 'major'] },
  'cheating_scandal': { category: 'personal', severity_range: ['moderate', 'major'] },
  'deadbeat_parent': { category: 'personal', severity_range: ['major', 'critical'] },

  // Financial
  'financial_crisis': { category: 'financial', severity_range: ['minor', 'moderate', 'major'] },
  'eviction': { category: 'financial', severity_range: ['moderate', 'major'] },
  'bankruptcy': { category: 'financial', severity_range: ['major'] },
  'unpaid_debts': { category: 'financial', severity_range: ['minor', 'moderate'] },

  // Legal
  'criminal_record': { category: 'legal', severity_range: ['moderate', 'major', 'critical'] },
  'pending_case': { category: 'legal', severity_range: ['major', 'critical'] },
  'snitch_allegations': { category: 'legal', severity_range: ['critical'] },  // DEVASTATING in battle rap
  'probation_violation': { category: 'legal', severity_range: ['major'] },

  // Career
  'career_failure': { category: 'career', severity_range: ['minor', 'moderate'] },
  'choke_history': { category: 'career', severity_range: ['moderate', 'major'] },
  'ghostwriter': { category: 'career', severity_range: ['critical'] },  // Career-ending if proven
  'fake_persona': { category: 'career', severity_range: ['major', 'critical'] },
  'no_show_history': { category: 'career', severity_range: ['moderate'] },

  // Mental/Health
  'mental_health': { category: 'health', severity_range: ['minor', 'moderate'] },
  'substance_use': { category: 'health', severity_range: ['moderate', 'major'] },
  'addiction_struggles': { category: 'health', severity_range: ['major'] },

  // Street/Crew
  'betrayal': { category: 'street', severity_range: ['moderate', 'major'] },
  'crew_beef_internal': { category: 'street', severity_range: ['moderate', 'major'] },
  'got_robbed': { category: 'street', severity_range: ['moderate', 'major'] },  // Street cred hit
  'ran_from_fight': { category: 'street', severity_range: ['major', 'critical'] },

  // Identity
  'secret_identity': { category: 'identity', severity_range: ['minor', 'moderate', 'major'] },
  'fake_background': { category: 'identity', severity_range: ['major', 'critical'] },
  'suburban_kid': { category: 'identity', severity_range: ['moderate'] }  // Playing a role
}
```

---

## Part 7: Integration Points

### 7.1 Battle Simulation Integration

When battle happens, the simulation engine should:

1. Check what intel the player has on opponent
2. Allow angle selection during round crafting
3. Calculate angle effectiveness using the formula
4. Apply crowd reaction bonuses/penalties
5. Update secret usage counts

### 7.2 Life Event Integration

Life events can:
- **Create secrets** (existing implementation)
- **Expose secrets** (status change)
- **Offer research opportunities** ("Your cousin knows someone from their crew...")
- **Warn of incoming exposure** ("Word is getting around about...")

### 7.3 Media/Blogger Integration

The media system should:
- Reference used angles in battle recaps
- Track "angle of the battle" moments
- Spread rumors (increase exposure_risk on secrets)
- Cover major exposures as news stories

---

## Part 8: Implementation Priority

### Phase A: Schema Updates (1 day)
1. Add `personal` and `stale` to secret status enum
2. Add `times_used_against` and `times_used_by_player` columns
3. Create `battler_intel_notebook` table
4. Create `battle_angle_usage` table

### Phase B: Research Engine (2 days)
1. Create `lib/game/researchEngine.ts`
2. Implement research action types
3. Add discovery probability calculations
4. Hook into prep phase

### Phase C: Angle System (2 days)
1. Create angle effectiveness calculator
2. Add angle selection to round crafting
3. Update battle simulation to use angles
4. Track angle usage

### Phase D: UI (3 days)
1. Intel Hub dashboard section
2. Research target interface
3. Intel notebook viewer
4. Battle prep angle selection

### Phase E: Content (2 days)
1. Expand secret types
2. Create life events for research opportunities
3. Add Angler badge category
4. Balance testing

---

## Summary

This system transforms research from a simple prep day option into a **strategic meta-game** where:

1. **You can research anytime** - not just before battles
2. **Intel compounds over time** - the more you know, the more devastating you can be
3. **Angles have a lifecycle** - fresh hits hard, stale gets groans
4. **Skill matters** - Angler badges let you get more from less
5. **Defense matters** - Private Person badges protect you

The feel should be: *"I've been collecting dirt on this guy for 6 months. When I finally battle him, I'm going to DESTROY him."*

---

## Sources

- [BeatsToRapOn - How to Win a Rap Battle](https://beatstorapon.com/blog/how-to-win-a-rap-battle-an-experts-guide/)
- [Rhymemakers - How To Battle Rap And Win](https://rhymemakers.com/how-to-rap-battle-and-win/)
- [DJ Booth - Mainstream Battle Rap](https://djbooth.net/features/2018-04-17-mainstream-battle-rap/)
- [VerseTracker - DNA Profile](https://versetracker.com/rapper/dna) (147 battles catalogued)
- [VerseTracker - Tay Roc Profile](https://versetracker.com/rapper/tay-roc) (60 battles catalogued)
