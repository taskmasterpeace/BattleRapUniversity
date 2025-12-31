# LIFE EVENTS V2 - THE HEARTBEAT OF THE GAME

## 1. PHILOSOPHY

Life events are NOT just stat changes. They are the **soul of the narrative**. When a life event pops, the player should feel:
- "Oh shit, this is serious"
- "I need to think about this"
- "This could change everything"

Life events create **consequences**, **drama**, and **story**. They make the game feel alive.

---

## 2. EFFECT TYPES - BEYOND STAT CHANGES

### A. PERMANENT Effects
Changes that stay forever.

```typescript
type PermanentEffect = {
  type: 'permanent';

  // Stat changes (forever)
  attribute_changes?: {
    lyricism?: number;      // +/- permanently
    resilience?: number;
    reputation?: number;
    // etc.
  };

  // Badge unlock/removal
  badge_earned?: string;    // "Street Credible"
  badge_lost?: string;      // "Clean Image"

  // Relationship changes
  rival_created?: string;   // battler_id - now a rival
  ally_gained?: string;     // battler_id - now an ally
  ally_lost?: string;       // friendship ended

  // Career changes
  league_banned?: string;   // Can't battle in this league anymore
  city_rep_changed?: { city: string; change: number };
};
```

### B. TEMPORARY Effects
Changes that expire after time or battles.

```typescript
type TemporaryEffect = {
  type: 'temporary';
  duration_type: 'battles' | 'days' | 'until_event';
  duration_value: number;   // 3 battles, 14 days, etc.
  expires_at?: timestamp;

  // Temporary buffs/debuffs
  attribute_modifier?: {
    attribute: string;
    modifier: number;       // +1.5 lyricism for 3 battles
  };

  // Temporary status
  status_effect?: 'inspired' | 'distracted' | 'motivated' | 'stressed' | 'injured' | 'hot_streak' | 'cold_streak';

  // Prep modifiers
  prep_bonus?: number;      // +2 to all prep for next battle
  prep_penalty?: number;    // -2 to all prep for next battle

  // Battle restrictions
  cant_battle_until?: timestamp;
  must_rest_days?: number;
};
```

### C. CONDITIONAL Effects
Effects that trigger under certain conditions.

```typescript
type ConditionalEffect = {
  type: 'conditional';

  // If player does X, then Y happens
  trigger_condition: string;  // "next_loss", "next_choke", "battle_in_league_X"
  then_effect: PermanentEffect | TemporaryEffect;

  // Time limit on condition
  expires_after_battles?: number;
  expires_after_days?: number;
};
```

### D. LOCKOUT Effects
Can't do certain things.

```typescript
type LockoutEffect = {
  type: 'lockout';

  // League restrictions
  league_locked?: {
    league_id: string;
    duration_battles?: number;
    duration_days?: number;
    reason: string;           // "Bad blood with league owner"
  };

  // City restrictions
  city_locked?: {
    city_id: string;
    duration_battles?: number;
    reason: string;           // "Not welcome in Philly right now"
  };

  // Opponent restrictions
  cant_battle_battler?: {
    battler_id: string;
    duration: 'permanent' | number;  // battles
    reason: string;
  };

  // Feature restrictions
  feature_locked?: {
    feature: 'media_interviews' | 'sponsorships' | 'special_events';
    duration_days: number;
  };
};
```

---

## 3. EVENT PRESENTATION TYPES

Not all events look the same. Different events have different presentation styles.

### A. Text-Only Events
Simple narrative moments.

```
┌─────────────────────────────────────────────────────────────────┐
│  LIFE EVENT                                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [💼 CAREER]  [MODERATE]                                        │
│                                                                  │
│  ════════════════════════════════════════════════════════════   │
│  OLD FRIEND REACHES OUT                                          │
│  ════════════════════════════════════════════════════════════   │
│                                                                  │
│  Your childhood friend hits you up. They're going through        │
│  something and need your support. But you've got a battle        │
│  coming up and prep time is limited.                             │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │ CHOICE A        │  │ CHOICE B        │                       │
│  │ Take time off   │  │ Stay focused    │                       │
│  │ for them        │  │ on your career  │                       │
│  └─────────────────┘  └─────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### B. Picture + Text Events (With Aspect Ratios)

**9:16 Portrait** - For dramatic reveals, phone-style notifications

```
┌───────────────────────────────────────┐
│                                        │
│  ┌──────────────────────────────┐     │
│  │                              │     │
│  │   [9:16 IMAGE]               │     │
│  │                              │     │
│  │   DMS leaked...              │     │
│  │   Screenshots circulating    │     │
│  │                              │     │
│  │                              │     │
│  │                              │     │
│  │                              │     │
│  │                              │     │
│  │                              │     │
│  └──────────────────────────────┘     │
│                                        │
│  📰 SCANDAL                            │
│  LEAKED MESSAGES                       │
│                                        │
│  Someone leaked your old DMs...        │
│                                        │
│  [ADDRESS IT] [IGNORE IT]              │
│                                        │
└───────────────────────────────────────┘
```

**16:9 Landscape** - For news articles, battle footage, interviews

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │   [16:9 IMAGE - BATTLE FOOTAGE / NEWS SCREENSHOT]       │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  💼 CAREER  |  MAJOR                                            │
│                                                                  │
│  INTERVIEW REQUEST                                               │
│                                                                  │
│  A major podcast wants you on. This could boost your profile    │
│  or backfire if you say the wrong thing...                      │
│                                                                  │
│  [ACCEPT INTERVIEW]  [DECLINE]                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**1:1 Square** - For social media style, simple moments

```
┌────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────┐       │
│  │                             │       │
│  │  [1:1 IMAGE]                │       │
│  │                             │       │
│  │  Instagram post:            │       │
│  │  "Battler X said what       │       │
│  │  about you?"                │       │
│  │                             │       │
│  └─────────────────────────────┘       │
│                                         │
│  📰 SCANDAL                             │
│  SOCIAL MEDIA CALLOUT                   │
│                                         │
│  [RESPOND PUBLICLY] [IGNORE]            │
│                                         │
└────────────────────────────────────────┘
```

**21:9 Ultrawide** - For epic moments, career milestones

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │   [21:9 CINEMATIC IMAGE - CROWD SHOT / VENUE / MILESTONE MOMENT]     │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  💼 CAREER  |  CRITICAL                                                    │
│                                                                             │
│  YOU'VE ARRIVED                                                            │
│                                                                             │
│  After your dominant performance, everyone's talking. A legendary          │
│  battler just called you out. This is the moment you've been waiting for. │
│                                                                             │
│  [ACCEPT THE CHALLENGE]  [WAIT FOR BETTER TIMING]                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. EVENT URGENCY LEVELS

Different events have different urgency. Some you CAN'T ignore.

### LEVEL 1: PASSIVE (Can Wait)
- Player can resolve whenever
- No deadline
- Events stack in queue
- Example: "Fan mail arrived" - resolve when convenient

### LEVEL 2: TIMED (Must Resolve Within X Days)
- Has a deadline
- Consequences if ignored
- Shows countdown timer
- Example: "Interview offer expires in 3 days"

### LEVEL 3: BATTLE-GATED (Must Resolve Before Next Battle)
- Can't start next battle until resolved
- Blocks progression
- Example: "Legal issue - must handle before you can battle"

### LEVEL 4: IMMEDIATE (Resolve NOW)
- Modal locks screen
- Cannot close without choosing
- No "back" button
- Example: "Opponent just called you out ON STAGE. What do you do?"

```typescript
type EventUrgency = 'passive' | 'timed' | 'battle_gated' | 'immediate';

interface LifeEventTemplate {
  // ...existing fields...

  urgency: EventUrgency;

  // For timed events
  deadline_hours?: number;        // 72 hours to respond

  // For immediate events
  force_immediate?: boolean;      // Can't dismiss modal

  // Consequences of ignoring
  ignore_consequence?: Effect[];  // What happens if you don't respond
}
```

---

## 5. WHAT HAPPENS IF PLAYER IGNORES EVENTS?

**PASSIVE Events:** Stack up. After 5+ pending events, stress increases. After 10+, random negative events start triggering.

**TIMED Events:** Auto-resolve with WORST outcome after deadline.

```typescript
// Example: Interview offer ignored
{
  ignore_consequence: {
    type: 'permanent',
    reputation: -0.5,
    public_knowledge: -10,
    badge_earned: 'Media Dodger'  // Negative badge
  }
}
```

**BATTLE-GATED Events:** Player literally cannot accept battle offers until resolved. Dashboard shows blocker.

**IMMEDIATE Events:** Cannot happen - player is forced to choose.

---

## 6. STRESS & MENTAL STATE INTEGRATION

Life events affect and are affected by the **Stress System**.

### Current Stress Display on Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│  MENTAL STATE                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stress Level: 45/100                                            │
│  ████████████████████░░░░░░░░░░░░░░░░░░                         │
│  Status: MANAGING                                                │
│                                                                  │
│  Contributing Factors:                                           │
│  • 3 pending life events (+15 stress)                           │
│  • 2 battle loss streak (+10 stress)                            │
│  • Family situation unresolved (+20 stress)                      │
│                                                                  │
│  [VIEW LIFE EVENTS]                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Stress Thresholds
| Level | Range | Effects |
|-------|-------|---------|
| Relaxed | 0-20 | +5% resilience |
| Comfortable | 21-40 | Normal |
| Managing | 41-60 | Slight choke risk increase |
| Strained | 61-80 | +10% choke risk, prep effectiveness -10% |
| Breaking Point | 81-100 | +25% choke risk, prep effectiveness -25%, random negative events |

### Events Affected by Stress
- High stress = more negative random events trigger
- Low stress = more positive opportunity events
- Breaking point = "Mental Health Crisis" event forces time off

---

## 7. DASHBOARD INTEGRATION

### Where Life Events Show

**A. Dedicated Widget (Current)**
```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ LIFE EVENTS                                           [3]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  URGENT: Interview offer expires in 2 days                       │
│  [RESOLVE NOW]                                                   │
│                                                                  │
│  +2 more pending events                                          │
│  [VIEW ALL]                                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**B. Battle Blocker (When Battle-Gated)**
```
┌─────────────────────────────────────────────────────────────────┐
│  🚫 CANNOT ACCEPT BATTLES                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  You have unresolved life events that must be handled            │
│  before you can battle again.                                    │
│                                                                  │
│  Blocking Event: "Legal Situation"                               │
│                                                                  │
│  [RESOLVE NOW]                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**C. Mental State Widget**
Shows stress level with contributing factors.

**D. Immediate Event Modal (Full Screen Takeover)**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                    ⚡ IMMEDIATE DECISION                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │   [FULL WIDTH IMAGE - 16:9]                             │   │
│  │                                                          │   │
│  │   Your opponent just grabbed the mic and called         │   │
│  │   you out in front of everyone...                       │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  📰 SCANDAL  |  CRITICAL  |  DECIDE NOW                         │
│                                                                  │
│  CALLED OUT ON STAGE                                             │
│                                                                  │
│  The crowd is watching. What do you do?                          │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │ ACCEPT THE SMOKE    │  │ WALK AWAY           │              │
│  │ Battle right now.   │  │ Live to fight       │              │
│  │ Unprepared but      │  │ another day.        │              │
│  │ your pride intact.  │  │                     │              │
│  │                     │  │                     │              │
│  │ [SELECT]            │  │ [SELECT]            │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                  │
│  ⚠️ You must choose. This modal cannot be closed.               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. EVENT TEMPLATE STRUCTURE (V2)

```typescript
interface LifeEventTemplateV2 {
  id: string;
  code: string;                    // "interview_offer_major"

  // Basic Info
  title: string;
  description: string;
  category: 'career' | 'personal' | 'scandal' | 'financial' | 'relationship';
  severity: 'minor' | 'moderate' | 'major' | 'critical';

  // Urgency
  urgency: 'passive' | 'timed' | 'battle_gated' | 'immediate';
  deadline_hours?: number;

  // Presentation
  presentation_type: 'text_only' | 'image_text';
  image_aspect_ratio?: '1:1' | '9:16' | '16:9' | '21:9';
  image_url?: string;
  image_placeholder?: string;      // Description for AI image gen

  // Choices
  choice_a: {
    text: string;
    short_label: string;           // "Accept" - for buttons
    effects: Effect[];
  };
  choice_b?: {
    text: string;
    short_label: string;
    effects: Effect[];
  };
  choice_c?: {                     // Some events have 3 choices
    text: string;
    short_label: string;
    effects: Effect[];
  };

  // Ignore Consequences
  can_ignore: boolean;
  ignore_effects?: Effect[];

  // Triggers
  trigger_conditions?: TriggerCondition[];
  required_attributes?: AttributeRequirement[];
  mutually_exclusive_with?: string[];  // Can't happen if these happened
}
```

---

## 9. SAMPLE EVENTS (V2 STYLE)

### Event: Called Out On Stage (IMMEDIATE)
```typescript
{
  code: 'called_out_on_stage',
  title: 'CALLED OUT ON STAGE',
  description: 'Your opponent just grabbed the mic and challenged you in front of everyone. The crowd is watching.',
  category: 'scandal',
  severity: 'critical',

  urgency: 'immediate',

  presentation_type: 'image_text',
  image_aspect_ratio: '16:9',
  image_placeholder: 'Battle stage, crowd watching, opponent with mic pointed at camera',

  choice_a: {
    text: 'Accept the smoke. Battle right now, unprepared but pride intact.',
    short_label: 'ACCEPT',
    effects: [
      { type: 'conditional', trigger: 'next_battle', effect: { prep_penalty: -5 } },
      { type: 'permanent', reputation: +1.5 },
      { type: 'permanent', badge_earned: 'Never Ducked' }
    ]
  },
  choice_b: {
    text: 'Walk away. Live to fight another day.',
    short_label: 'WALK AWAY',
    effects: [
      { type: 'permanent', reputation: -1.0 },
      { type: 'temporary', status_effect: 'humiliated', duration_battles: 3 },
      { type: 'permanent', badge_earned: 'Known Ducker' }
    ]
  },

  can_ignore: false
}
```

### Event: League Ban Threat (BATTLE-GATED)
```typescript
{
  code: 'league_ban_warning',
  title: 'YOU MIGHT GET BANNED',
  description: 'The league owner heard about what you said on that podcast. They\'re threatening to ban you.',
  category: 'career',
  severity: 'major',

  urgency: 'battle_gated',

  presentation_type: 'text_only',

  choice_a: {
    text: 'Apologize publicly. Swallow your pride to stay in the league.',
    short_label: 'APOLOGIZE',
    effects: [
      { type: 'permanent', reputation: -0.5 },
      { type: 'temporary', status_effect: 'humbled', duration_days: 7 }
    ]
  },
  choice_b: {
    text: 'Stand on your words. Risk the ban.',
    short_label: 'STAND FIRM',
    effects: [
      { type: 'conditional',
        trigger: 'random_50_percent',
        then_effect: {
          type: 'lockout',
          league_locked: { league_id: 'xxx', duration_battles: 10, reason: 'Banned for disrespect' }
        }
      },
      { type: 'permanent', reputation: +0.5 },
      { type: 'permanent', badge_earned: 'Never Folded' }
    ]
  },

  can_ignore: false
}
```

### Event: Family Emergency (TIMED)
```typescript
{
  code: 'family_emergency',
  title: 'FAMILY NEEDS YOU',
  description: 'Your mom called. Something happened and she needs you home.',
  category: 'personal',
  severity: 'major',

  urgency: 'timed',
  deadline_hours: 48,

  presentation_type: 'image_text',
  image_aspect_ratio: '9:16',
  image_placeholder: 'Phone showing missed calls from "Mom"',

  choice_a: {
    text: 'Drop everything and go home.',
    short_label: 'GO HOME',
    effects: [
      { type: 'permanent', family_bond: +2.0 },
      { type: 'temporary', cant_battle_until: '+7_days' },
      { type: 'temporary', stress: -20 }
    ]
  },
  choice_b: {
    text: 'Send money and support from here. You have a battle coming.',
    short_label: 'SEND SUPPORT',
    effects: [
      { type: 'permanent', family_bond: -0.5 },
      { type: 'permanent', financial_stability: -0.5 },
      { type: 'temporary', stress: +15, duration_days: 14 }
    ]
  },

  can_ignore: true,
  ignore_effects: [
    { type: 'permanent', family_bond: -2.0 },
    { type: 'permanent', badge_earned: 'Forgot Where You Came From' },
    { type: 'temporary', stress: +30, duration_days: 30 }
  ]
}
```

---

## 10. IMPLEMENTATION CHECKLIST

### Database
- [ ] Add `urgency` column to `life_event_templates`
- [ ] Add `deadline_hours` column
- [ ] Add `presentation_type` column
- [ ] Add `image_aspect_ratio` column
- [ ] Add `image_url` column
- [ ] Add `ignore_effects` JSONB column
- [ ] Create `effect_types` enum
- [ ] Add `expires_at` to `battler_life_events`

### Components
- [ ] `ImmediateEventModal` - Full screen takeover, no escape
- [ ] `TimedEventCard` - Shows countdown timer
- [ ] `BattleGatedBlocker` - Shows on dashboard when blocked
- [ ] `EventImage` - Handles all aspect ratios
- [ ] `IgnoreConsequenceWarning` - Shows what happens if ignored
- [ ] `StressWidget` - Shows mental state on dashboard
- [ ] `ThreeChoiceEvent` - For events with 3 options

### Logic
- [ ] Auto-resolve timed events at deadline
- [ ] Block battle acceptance for battle-gated events
- [ ] Trigger stress increases from pending events
- [ ] Apply ignore consequences
- [ ] Handle conditional effects
- [ ] Apply temporary effects with expiration

### Pages
- [ ] Enhanced `/life-events/[id]` with image support
- [ ] Dashboard stress widget integration
- [ ] Battle offer blocking UI

---

## 11. FILES TO CREATE/MODIFY

```
lib/
├── constants/
│   └── lifeEventStyles.ts          [MODIFY - add urgency colors]
├── game/
│   ├── lifeEvents.ts               [CREATE - event processing logic]
│   └── stressSystem.ts             [CREATE - stress calculation]

components/
├── lifeEvents/
│   ├── ImmediateEventModal.tsx     [CREATE]
│   ├── TimedEventCard.tsx          [CREATE]
│   ├── BattleGatedBlocker.tsx      [CREATE]
│   ├── EventImage.tsx              [CREATE]
│   ├── IgnoreWarning.tsx           [CREATE]
│   ├── ThreeChoiceEvent.tsx        [CREATE]
│   └── StressWidget.tsx            [CREATE]

app/
├── life-events/
│   └── [id]/
│       └── page.tsx                [MODIFY - handle all presentation types]

types/
└── lifeEvents.ts                   [MODIFY - V2 types]

supabase/
└── migrations/
    └── XXX_life_events_v2.sql      [CREATE]
```
