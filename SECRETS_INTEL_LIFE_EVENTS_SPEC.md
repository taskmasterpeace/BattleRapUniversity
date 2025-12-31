# Secrets, Intel & Life Events - Complete Specification

## Part 1: Image Asset Specifications

### Required Sprite Categories & Dimensions

| Category | Dimensions | Aspect Ratio | Format | Location | Notes |
|----------|------------|--------------|--------|----------|-------|
| **Badges** | 512 x 512 | 1:1 | PNG (RGBA) | `/sprites/badges/` | Includes new Angler badges |
| **Cities** | 512 x 512 | 1:1 | PNG (RGB) | `/sprites/cities/` | City backgrounds |
| **Crowd Reactions** | ~290 x 290 | 1:1 | PNG (RGBA) | `/sprites/crowd/{ethnicity}/` | Individual crowd members |
| **Storyline Scenes** | 1920 x 1080 | 16:9 | PNG/SVG | `/sprites/storylines/` | Life event backgrounds |
| **Characters** | Varies | 3:4 portrait | PNG (RGBA) | `/sprites/characters/` | Battler portraits |
| **Venues** | 1920 x 1080 | 16:9 | PNG | `/sprites/venues/` | Battle venue backgrounds |
| **Bloggers** | 256 x 256 | 1:1 | PNG (RGBA) | `/sprites/bloggers/` | Media personality avatars |
| **Secret Icons** | 128 x 128 | 1:1 | PNG (RGBA) | `/sprites/secrets/` | **NEW** - Per secret type |
| **Intel Icons** | 64 x 64 | 1:1 | PNG (RGBA) | `/sprites/intel/` | **NEW** - Intel type icons |
| **Research Icons** | 128 x 128 | 1:1 | PNG (RGBA) | `/sprites/research/` | **NEW** - Research action icons |

---

### NEW: Secret Type Icons (128x128, 1:1)

Need one icon per secret type. Style: Dark, moody, silhouette-style.

| File Name | Secret Type | Visual Description |
|-----------|-------------|-------------------|
| `secret_family_scandal.png` | family_scandal | Broken family photo silhouette |
| `secret_relationship_drama.png` | relationship_drama | Two figures arguing silhouette |
| `secret_baby_mama.png` | baby_mama_drama | Baby bottle + dollar sign |
| `secret_cheating.png` | cheating_scandal | Broken heart with shadow figure |
| `secret_deadbeat.png` | deadbeat_parent | Empty crib silhouette |
| `secret_financial.png` | financial_crisis | Empty wallet / falling coins |
| `secret_eviction.png` | eviction | Door with eviction notice |
| `secret_bankruptcy.png` | bankruptcy | Gavel + empty safe |
| `secret_debts.png` | unpaid_debts | Stack of bills with red marks |
| `secret_criminal.png` | criminal_record | Mugshot silhouette |
| `secret_pending_case.png` | pending_case | Courthouse + gavel |
| `secret_snitch.png` | snitch_allegations | Rat silhouette (DEVASTATING) |
| `secret_probation.png` | probation_violation | Ankle monitor |
| `secret_career_fail.png` | career_failure | Mic drop / broken trophy |
| `secret_choke.png` | choke_history | Microphone with X |
| `secret_ghostwriter.png` | ghostwriter | Pen with ghost shadow |
| `secret_fake_persona.png` | fake_persona | Mask / two faces |
| `secret_no_show.png` | no_show_history | Empty stage spotlight |
| `secret_mental.png` | mental_health | Head with storm clouds |
| `secret_substance.png` | substance_use | Pill bottle silhouette |
| `secret_addiction.png` | addiction_struggles | Chains / ball and chain |
| `secret_betrayal.png` | betrayal | Knife in back silhouette |
| `secret_crew_beef.png` | crew_beef_internal | Broken chain links |
| `secret_robbed.png` | got_robbed | Empty pockets / hands up |
| `secret_ran.png` | ran_from_fight | Running feet silhouette |
| `secret_identity.png` | secret_identity | Question mark face |
| `secret_fake_bg.png` | fake_background | Torn paper / false document |
| `secret_suburban.png` | suburban_kid | Picket fence silhouette |

---

### NEW: Research Action Icons (128x128, 1:1)

| File Name | Research Type | Visual Description |
|-----------|---------------|-------------------|
| `research_surface.png` | surface_scan | Magnifying glass over screen |
| `research_deep.png` | deep_dive | Diver going into files |
| `research_street.png` | street_intel | Ear to the ground / whispering figures |
| `research_social.png` | social_stalking | Phone with social media icons |

---

### NEW: Intel Notebook Icons (64x64, 1:1)

| File Name | Intel Type | Visual Description |
|-----------|------------|-------------------|
| `intel_public.png` | public_fact | Open book |
| `intel_rumor.png` | rumor | Whisper / speech bubbles |
| `intel_secret.png` | discovered_secret | Lock with crack |
| `intel_style.png` | style_note | Notepad with bars |
| `intel_weakness.png` | weakness | Target / crosshair |

---

### NEW: Angler Badge Icons (512x512, 1:1)

| File Name | Badge Name | Visual Description |
|-----------|------------|-------------------|
| `badge_researcher.png` | Researcher | Magnifying glass + files |
| `badge_social_stalker.png` | Social Media Stalker | Phone with eye |
| `badge_street_connected.png` | Street Connected | Network of people / city map |
| `badge_angler.png` | Angler | Fishing hook catching info |
| `badge_master_angler.png` | Master Angler | Golden fishing hook |
| `badge_fresh_angle.png` | Fresh Angle King | Old paper becoming new |
| `badge_angle_god.png` | Angle God | Crown with hooks |
| `badge_private_person.png` | Private Person | Lock / vault |
| `badge_media_trained.png` | Media Trained | Microphone with shield |
| `badge_untouchable.png` | Untouchable | Ghost / smoke figure |

---

### Storyline Scene Images (1920x1080, 16:9)

Already have placeholders for 9 categories. Need actual art:

| File Name | Category | Scene Description |
|-----------|----------|------------------|
| `storyline_career.png` | career | Stage/spotlight, mic stand, empty venue |
| `storyline_crew.png` | crew | Group silhouettes, city backdrop, loyalty theme |
| `storyline_family.png` | family | Home setting, photo frames, warm/cold contrast |
| `storyline_financial.png` | financial | Bills, empty wallet, stress in apartment |
| `storyline_health.png` | health | Hospital/bedroom, medicine, fatigue |
| `storyline_legal.png` | legal | Courthouse, jail bars, lawyer office |
| `storyline_rivalry.png` | rivalry | Two silhouettes facing off, tension |
| `storyline_romance.png` | romance | Relationship scenes, arguments, broken heart |
| `storyline_street.png` | street | Alley, confrontation, city night |
| `storyline_research.png` | **NEW** | Computer screen, files, late night research |
| `storyline_exposure.png` | **NEW** | Phone screens, social media, viral moment |

---

## Part 2: Secret Status Lifecycle

### Complete Status Flow

```
PERSONAL → PRIVATE → RUMORED → EXPOSED → ADDRESSED → STALE
```

### Status Definitions

| Status | Code | Description | Exposure Risk | Angle Power | Can Discover? |
|--------|------|-------------|---------------|-------------|---------------|
| **Personal** | `personal` | Only the battler knows. Deep secret. | 0-5% | N/A | Only via Angle God badge |
| **Private** | `private` | Close circle knows (family, crew, ex). | 5-20% | 100% | Street Intel, Deep Dive |
| **Rumored** | `rumored` | Scene is talking. Word is spreading. | 20-50% | 85% | Any research type |
| **Exposed** | `exposed` | Used in battle OR went public. | 100% | 70% | No research needed |
| **Addressed** | `addressed` | Battler has clapped back / responded. | N/A | 50% | N/A |
| **Stale** | `stale` | Used 3+ times. Crowd has heard it. | N/A | 25% | N/A |

### Status Transition Rules

```typescript
const STATUS_TRANSITIONS = {
  'personal': {
    next: 'private',
    triggers: ['exposure_risk_roll', 'life_event', 'angle_god_research']
  },
  'private': {
    next: 'rumored',
    triggers: ['exposure_risk_roll', 'research_discovery', 'life_event', 'leaked_by_insider']
  },
  'rumored': {
    next: 'exposed',
    triggers: ['used_in_battle', 'media_exposure', 'public_leak']
  },
  'exposed': {
    next: 'addressed',
    triggers: ['life_event_choice_address', 'public_response']
  },
  'addressed': {
    next: 'stale',
    triggers: ['used_3_plus_times']
  },
  'stale': {
    next: null,  // Terminal state (unless Fresh Angle King revives)
    triggers: []
  }
}
```

---

## Part 3: Complete Secret Types

### All Secret Types by Category

#### Personal Life Secrets

| Code | Title | Severity Options | Description |
|------|-------|------------------|-------------|
| `family_scandal` | Family Scandal | moderate, major, critical | Family drama that could be used as angle |
| `relationship_drama` | Relationship Drama | minor, moderate, major | Current/recent relationship problems |
| `baby_mama_drama` | Baby Mama Drama | moderate, major | Child support issues, custody battles |
| `cheating_scandal` | Cheating Scandal | moderate, major | Infidelity that could be exposed |
| `deadbeat_parent` | Deadbeat Parent | major, critical | Not taking care of kids |

#### Financial Secrets

| Code | Title | Severity Options | Description |
|------|-------|------------------|-------------|
| `financial_crisis` | Financial Crisis | minor, moderate, major | General money problems |
| `eviction` | Eviction | moderate, major | Got kicked out / losing housing |
| `bankruptcy` | Bankruptcy | major | Filed for bankruptcy |
| `unpaid_debts` | Unpaid Debts | minor, moderate | Owes money to people |

#### Legal Secrets

| Code | Title | Severity Options | Description |
|------|-------|------------------|-------------|
| `criminal_record` | Criminal Record | moderate, major, critical | Past convictions |
| `pending_case` | Pending Legal Case | major, critical | Currently facing charges |
| `snitch_allegations` | Snitch Allegations | **critical** | Accused of cooperating with police - CAREER ENDING |
| `probation_violation` | Probation Violation | major | Violated terms of probation |

#### Career Secrets

| Code | Title | Severity Options | Description |
|------|-------|------------------|-------------|
| `career_failure` | Career Failure | minor, moderate | Recent L's affecting confidence |
| `choke_history` | Choke History | moderate, major | Known for choking under pressure |
| `ghostwriter` | Ghostwriter | **critical** | Someone else writes their bars - DEVASTATING |
| `fake_persona` | Fake Persona | major, critical | Not who they claim to be |
| `no_show_history` | No-Show History | moderate | History of ducking battles |

#### Health Secrets

| Code | Title | Severity Options | Description |
|------|-------|------------------|-------------|
| `mental_health` | Mental Health Issues | minor, moderate | Struggling mentally |
| `substance_use` | Substance Use | moderate, major | Using to cope |
| `addiction_struggles` | Addiction Struggles | major | Full addiction problems |

#### Street Secrets

| Code | Title | Severity Options | Description |
|------|-------|------------------|-------------|
| `betrayal` | Betrayal | moderate, major | Betrayed someone close |
| `crew_beef_internal` | Crew Beef | moderate, major | Problems within their own crew |
| `got_robbed` | Got Robbed | moderate, major | Was robbed - street cred hit |
| `ran_from_fight` | Ran From Fight | major, critical | Ran when confronted - DEVASTATING |

#### Identity Secrets

| Code | Title | Severity Options | Description |
|------|-------|------------------|-------------|
| `secret_identity` | Secret Identity | minor, moderate, major | Has a secret other life |
| `fake_background` | Fake Background | major, critical | Lying about where they're from |
| `suburban_kid` | Suburban Kid | moderate | Actually from the suburbs, playing a role |

---

## Part 4: Life Events for Secrets System

### Secret-Creating Life Events

#### PERSONAL → PRIVATE Transitions

```typescript
const SECRET_CREATING_EVENTS = [
  {
    code: 'FAMILY_SECRET_LEAKS',
    title: 'Family Business Gets Out',
    description: 'Someone in your family been talking. Your business starting to spread.',
    trigger_type: 'random',
    trigger_condition: { probability: 0.08, min_battles: 5 },
    category: 'scandal',
    severity: 'moderate',

    choice_a: {
      text: 'Get ahead of it - tell your version first',
      effects: [
        { type: 'permanent', reputation: -0.3 },
        { modify_secret: { secret_type: 'family_scandal', new_status: 'rumored' }}
      ]
    },
    choice_b: {
      text: 'Find the leak and shut it down',
      effects: [
        { type: 'permanent', stress: 15, financial_stability: -0.5 },
        { modify_secret: { secret_type: 'family_scandal', exposure_risk_delta: -0.10 }}
      ]
    }
  },

  {
    code: 'EX_TALKING',
    title: 'Ex Is Talking',
    description: 'Your ex been on social media hinting at stuff. They got stories.',
    trigger_type: 'random',
    trigger_condition: { probability: 0.06, min_battles: 8 },
    category: 'relationship',
    severity: 'moderate',

    choice_a: {
      text: 'Reach out and smooth things over',
      effects: [
        { type: 'permanent', stress: 10, financial_stability: -0.3 },
        { modify_secret: { secret_type: 'relationship_drama', exposure_risk_delta: -0.15 }}
      ]
    },
    choice_b: {
      text: 'Let them talk - you got nothing to hide',
      effects: [
        { type: 'permanent', stress: 5 },
        { modify_secret: { secret_type: 'relationship_drama', new_status: 'rumored' }}
      ]
    }
  },

  {
    code: 'FINANCIAL_TROUBLE_NOTICED',
    title: 'People Starting to Notice',
    description: 'You been ducking events, not paying for studio time. People see you struggling.',
    trigger_type: 'attribute',
    trigger_condition: { attribute: 'financial_stability', operator: '<=', value: 3 },
    category: 'financial',
    severity: 'moderate',

    choice_a: {
      text: 'Take a quick-money gig to front',
      effects: [
        { type: 'permanent', financial_stability: 1.0, reputation: -0.3 }
      ]
    },
    choice_b: {
      text: 'Keep grinding, don\'t change nothing',
      effects: [
        { type: 'permanent', stress: 15 },
        { create_secret: {
            secret_type: 'financial_crisis',
            title: 'Struggling Financially',
            description: 'Can barely make rent, people in the scene starting to notice',
            severity: 'moderate',
            status: 'rumored',
            exposure_risk: 0.25
        }}
      ]
    }
  }
]
```

#### Research Discovery Events

```typescript
const RESEARCH_DISCOVERY_EVENTS = [
  {
    code: 'RESEARCH_BREAKTHROUGH',
    title: 'Research Pays Off',
    description: 'You found something. Your research on {opponent_name} turned up some real dirt.',
    trigger_type: 'research_complete',
    trigger_condition: { discovery_type: 'secret', min_severity: 'moderate' },
    category: 'career',

    choice_a: {
      text: 'Save it for the battle',
      effects: [
        { add_to_notebook: true, mark_premium: true }
      ]
    },
    choice_b: {
      text: 'Leak it to a blogger and watch them squirm',
      effects: [
        { expose_secret: { new_status: 'rumored' }},
        { type: 'permanent', reputation: -0.2 }  // Seen as grimy
      ]
    },
    choice_c: {
      text: 'Keep digging - there might be more',
      effects: [
        { add_to_notebook: true },
        { unlock_deeper_research: true }
      ]
    }
  },

  {
    code: 'STREET_SOURCE_COMES_THROUGH',
    title: 'Your People Came Through',
    description: 'That connect from {city_name} finally got back to you. They got the inside scoop.',
    trigger_type: 'street_intel_complete',
    category: 'career',

    choice_a: {
      text: 'Take the intel and pay up',
      effects: [
        { type: 'permanent', financial_stability: -0.3 },
        { add_intel: { confidence: 0.85 }}
      ]
    },
    choice_b: {
      text: 'Need proof - can they get receipts?',
      effects: [
        { type: 'permanent', financial_stability: -0.5 },
        { add_intel: { confidence: 0.95, has_receipts: true }}
      ]
    }
  }
]
```

#### Exposure Events

```typescript
const EXPOSURE_EVENTS = [
  {
    code: 'SECRET_USED_AGAINST_YOU',
    title: 'They Exposed You',
    description: '{opponent_name} brought up your {secret_title} in the battle. Crowd went crazy.',
    trigger_type: 'battle_result',
    trigger_condition: { secret_was_used: true },
    category: 'career',
    severity: 'major',

    choice_a: {
      text: 'Address it head on - own your truth',
      effects: [
        { type: 'permanent', reputation: 0.2, stress: -10 },
        { modify_secret: { new_status: 'addressed' }}
      ]
    },
    choice_b: {
      text: 'Stay silent - don\'t give it more energy',
      effects: [
        { type: 'permanent', stress: 20 },
        { modify_secret: { new_status: 'exposed', exposure_risk: 0.80 }}
      ]
    },
    choice_c: {
      text: 'Deny everything - call them a liar',
      effects: [
        { type: 'permanent', reputation: -0.3 },
        { modify_secret: { exposure_risk_delta: 0.15 }}  // Risk it comes back harder
      ]
    }
  },

  {
    code: 'ANGLE_GOING_STALE',
    title: 'They Keep Using That Same Angle',
    description: 'Third battle in a row someone brought up your {secret_title}. Crowd barely reacted this time.',
    trigger_type: 'battle_result',
    trigger_condition: { secret_times_used: 3 },
    category: 'career',
    severity: 'minor',

    choice_a: {
      text: 'Good - let it die',
      effects: [
        { modify_secret: { new_status: 'stale' }},
        { type: 'permanent', stress: -5 }
      ]
    },
    choice_b: {
      text: 'Make a joke about it - lean into it',
      effects: [
        { modify_secret: { new_status: 'stale' }},
        { type: 'permanent', reputation: 0.2 },
        { add_badge: 'Self-Aware' }
      ]
    }
  }
]
```

#### Snitch Allegation Events (CRITICAL)

```typescript
const SNITCH_EVENTS = [
  {
    code: 'SNITCH_RUMOR_STARTS',
    title: 'Word Is Going Around',
    description: 'Someone started a rumor that you cooperated with police on your case. This could destroy you.',
    trigger_type: 'random',
    trigger_condition: {
      probability: 0.02,  // Rare
      requires_secret: 'criminal_record'
    },
    category: 'scandal',
    severity: 'critical',

    choice_a: {
      text: 'Get your paperwork and show the world',
      effects: [
        { type: 'permanent', reputation: 0.5 },  // Cleared your name
        { prevent_secret: { secret_type: 'snitch_allegations' }}
      ]
    },
    choice_b: {
      text: 'Ignore it - your actions speak for themselves',
      effects: [
        { type: 'permanent', stress: 30 },
        { create_secret: {
            secret_type: 'snitch_allegations',
            title: 'Snitch Allegations',
            description: 'Rumored to have cooperated with police',
            severity: 'critical',
            status: 'rumored',
            exposure_risk: 0.40
        }}
      ]
    }
  }
]
```

---

## Part 5: Angle Effectiveness System

### Base Effectiveness Calculation

```typescript
function calculateAngleEffectiveness(
  secret: Secret,
  attacker: Battler,
  timesUsedGlobally: number
): { effectiveness: number, crowdBonus: number } {

  // Base by status
  const STATUS_POWER = {
    'personal': 1.20,  // Holy shit moment
    'private': 1.00,   // Devastating
    'rumored': 0.85,   // Hits hard
    'exposed': 0.70,   // Expected but effective
    'addressed': 0.50, // They have a response
    'stale': 0.25      // Played out
  }

  // Base by severity
  const SEVERITY_POWER = {
    'minor': 0.60,
    'moderate': 0.80,
    'major': 1.00,
    'critical': 1.30
  }

  let effectiveness = STATUS_POWER[secret.status] * SEVERITY_POWER[secret.severity]

  // Diminishing returns for repeated use
  const usageDecay = Math.max(0.30, 1.0 - (timesUsedGlobally * 0.12))
  effectiveness *= usageDecay

  // Attacker badge bonuses
  if (attacker.hasBadge('Angler')) effectiveness *= 1.25
  if (attacker.hasBadge('Master Angler')) effectiveness *= 1.15
  if (attacker.hasBadge('Angle God')) effectiveness *= 1.10

  // Fresh Angle King can revive stale angles
  if (secret.status === 'stale' && attacker.hasBadge('Fresh Angle King')) {
    effectiveness *= 1.50  // Brings it back to ~37.5% instead of 25%
  }

  // Special: snitch_allegations always hit hard
  if (secret.secret_type === 'snitch_allegations') {
    effectiveness = Math.max(effectiveness, 0.80)  // Minimum 80%
  }

  // Calculate crowd bonus
  let crowdBonus = Math.round(effectiveness * 25)  // Base crowd bonus
  if (attacker.hasBadge('Angler')) crowdBonus += 10
  if (attacker.hasBadge('Master Angler')) crowdBonus += 10

  return {
    effectiveness: Math.min(1.50, Math.max(0.20, effectiveness)),
    crowdBonus: Math.min(50, Math.max(-20, crowdBonus))
  }
}
```

### Special Case: First Time Exposure

When a secret moves from `personal` or `private` to `exposed` for the first time:

```typescript
const FIRST_EXPOSURE_BONUS = {
  'personal': {
    effectiveness_multiplier: 1.50,
    crowd_bonus: 30,
    narrative: 'HOLY SHIT moment - crowd loses their mind'
  },
  'private': {
    effectiveness_multiplier: 1.25,
    crowd_bonus: 20,
    narrative: 'Devastating exposure - crowd goes crazy'
  }
}
```

---

## Part 6: Database Schema Updates

### New/Modified Tables

```sql
-- Update battler_secrets status enum
ALTER TABLE battler_secrets
DROP CONSTRAINT battler_secrets_status_check;

ALTER TABLE battler_secrets
ADD CONSTRAINT battler_secrets_status_check
CHECK (status = ANY (ARRAY[
  'personal'::text,  -- NEW
  'private'::text,
  'rumored'::text,
  'exposed'::text,
  'addressed'::text,
  'stale'::text      -- NEW
]));

-- Add usage tracking
ALTER TABLE battler_secrets ADD COLUMN times_used_against INTEGER DEFAULT 0;
ALTER TABLE battler_secrets ADD COLUMN first_exposed_at TIMESTAMPTZ;
ALTER TABLE battler_secrets ADD COLUMN first_exposed_by UUID REFERENCES battlers(id);

-- Add new secret types
ALTER TABLE battler_secrets
DROP CONSTRAINT battler_secrets_secret_type_check;

ALTER TABLE battler_secrets
ADD CONSTRAINT battler_secrets_secret_type_check
CHECK (secret_type = ANY (ARRAY[
  -- Personal
  'family_scandal', 'relationship_drama', 'baby_mama_drama',
  'cheating_scandal', 'deadbeat_parent',
  -- Financial
  'financial_crisis', 'eviction', 'bankruptcy', 'unpaid_debts',
  -- Legal
  'criminal_record', 'pending_case', 'snitch_allegations', 'probation_violation',
  -- Career
  'career_failure', 'choke_history', 'ghostwriter', 'fake_persona', 'no_show_history',
  -- Health
  'mental_health', 'substance_use', 'addiction_struggles',
  -- Street
  'betrayal', 'crew_beef_internal', 'got_robbed', 'ran_from_fight',
  -- Identity
  'secret_identity', 'fake_background', 'suburban_kid'
]::text[]));

-- Add severity options
ALTER TABLE battler_secrets
DROP CONSTRAINT battler_secrets_severity_check;

ALTER TABLE battler_secrets
ADD CONSTRAINT battler_secrets_severity_check
CHECK (severity = ANY (ARRAY['minor', 'moderate', 'major', 'critical']::text[]));

-- Intel Notebook table
CREATE TABLE battler_intel_notebook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  target_battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  intel_type TEXT NOT NULL CHECK (intel_type IN ('public_fact', 'rumor', 'secret', 'style_note', 'weakness')),
  secret_id UUID REFERENCES battler_secrets(id),

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_level NUMERIC DEFAULT 0.5 CHECK (confidence_level >= 0 AND confidence_level <= 1),
  has_receipts BOOLEAN DEFAULT false,

  discovered_at TIMESTAMPTZ DEFAULT now(),
  discovery_method TEXT CHECK (discovery_method IN ('research', 'battle', 'life_event', 'rumor_mill', 'street_intel')),

  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  UNIQUE(owner_battler_id, target_battler_id, secret_id)
);

CREATE INDEX idx_intel_notebook_owner ON battler_intel_notebook(owner_battler_id);
CREATE INDEX idx_intel_notebook_target ON battler_intel_notebook(target_battler_id);

-- Battle Angle Usage tracking
CREATE TABLE battle_angle_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  battler_id UUID NOT NULL REFERENCES battlers(id),

  secret_id UUID REFERENCES battler_secrets(id),
  intel_id UUID REFERENCES battler_intel_notebook(id),

  round_number INTEGER NOT NULL,
  effectiveness_score NUMERIC,
  crowd_reaction INTEGER,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_angle_usage_battle ON battle_angle_usage(battle_id);
CREATE INDEX idx_angle_usage_secret ON battle_angle_usage(secret_id);
```

---

## Part 7: Summary Checklist

### Images Needed

- [ ] 28 Secret Type Icons (128x128)
- [ ] 4 Research Action Icons (128x128)
- [ ] 5 Intel Type Icons (64x64)
- [ ] 10 Angler Badge Icons (512x512)
- [ ] 2 Additional Storyline Scenes (1920x1080)

### Database Updates

- [ ] Add `personal` and `stale` to status enum
- [ ] Add usage tracking columns
- [ ] Expand secret types (28 total)
- [ ] Add `critical` severity
- [ ] Create `battler_intel_notebook` table
- [ ] Create `battle_angle_usage` table

### Life Events to Create

- [ ] Secret-creating events (5+)
- [ ] Research discovery events (3+)
- [ ] Exposure response events (3+)
- [ ] Snitch allegation events (2+)
- [ ] Angle staleness events (2+)

### Code Implementation

- [ ] Research engine (`lib/game/researchEngine.ts`)
- [ ] Angle effectiveness calculator
- [ ] Intel notebook UI
- [ ] Battle angle selection
