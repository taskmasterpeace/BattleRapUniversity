# LIFE EVENTS V2 - COMPLETE FRONTEND SPEC FOR V0

This is the frontend implementation guide for the Life Events V2 system. Life events are the **heartbeat of the game**.

---

## 1. WHAT V0 NEEDS TO BUILD

### New Components (9)
1. `StressWidget` - Enhanced stress display with contributing factors
2. `ImmediateEventModal` - Full-screen, can't-escape modal
3. `TimedEventBanner` - Countdown timer event display
4. `BattleGatedBlocker` - Blocks battle offers until resolved
5. `EventImage` - Handles all aspect ratios (1:1, 9:16, 16:9, 21:9)
6. `ThreeChoiceEvent` - For events with 3 options
7. `IgnoreConsequenceWarning` - Shows what happens if you ignore
8. `EffectPreview` - Shows permanent/temporary/lockout effects
9. `ContributingFactors` - List of things affecting stress

### Enhanced Components (3)
1. `PendingLifeEventsWidget` - Add urgency badges, countdown timers
2. `LifeEventResolutionClient` - Add image support, urgency handling
3. `DashboardClient` - Add StressWidget with contributing factors

### New Pages (1)
1. Enhance `/life-events/[id]` to handle all presentation types

---

## 2. STRESS WIDGET WITH CONTRIBUTING FACTORS

### Component: `StressWidget.tsx`

```
┌─────────────────────────────────────────────────────────────────┐
│  MENTAL STATE                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stress Level: 58/100                                            │
│  ██████████████████████████████░░░░░░░░░░░░░░░░░░░░             │
│                                                                  │
│  Status: STRAINED                                                │
│  "Your focus is slipping. Handle your business."                 │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ⚠️ CHOKE RISK: +15%                                    │   │
│  │  Prep Effectiveness: -10%                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  CONTRIBUTING FACTORS                                            │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  📋 3 pending life events                            +15 stress  │
│  📉 2 battle loss streak                             +10 stress  │
│  🏠 Family situation unresolved                      +20 stress  │
│  ⏰ No rest in 14 days                               +8 stress   │
│  💰 Financial pressure                               +5 stress   │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  RELIEF OPTIONS                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  • Resolve pending life events (-15 stress)                      │
│  • Take a rest day (-5 stress per day)                          │
│  • Win your next battle (-10 stress)                            │
│                                                                  │
│  [RESOLVE LIFE EVENTS]                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Props Interface
```typescript
interface StressWidgetProps {
  stress: number;                    // 0-100
  contributingFactors: ContributingFactor[];
  pendingEventsCount: number;
  daysSinceRest: number;
  recentLosses: number;
  hasUnresolvedFamilyEvent: boolean;
  hasFinancialPressure: boolean;
}

interface ContributingFactor {
  icon: string;                      // Emoji
  label: string;                     // "3 pending life events"
  stressContribution: number;        // +15
  canResolve: boolean;               // Shows in relief options
  resolveAction?: string;            // "Resolve pending life events"
  resolveLink?: string;              // "/life-events"
}
```

### Stress States & Colors
```typescript
const STRESS_STATES = {
  relaxed: {
    range: [0, 20],
    label: 'RELAXED',
    description: 'You\'re in a good headspace. Keep it up.',
    color: 'green',
    chokeModifier: -5,
    prepModifier: +5
  },
  comfortable: {
    range: [21, 40],
    label: 'COMFORTABLE',
    description: 'Balanced. Nothing to worry about.',
    color: 'green',
    chokeModifier: 0,
    prepModifier: 0
  },
  managing: {
    range: [41, 60],
    label: 'MANAGING',
    description: 'Some pressure building. Stay aware.',
    color: 'yellow',
    chokeModifier: +5,
    prepModifier: -5
  },
  strained: {
    range: [61, 80],
    label: 'STRAINED',
    description: 'Your focus is slipping. Handle your business.',
    color: 'orange',
    chokeModifier: +15,
    prepModifier: -10
  },
  breaking: {
    range: [81, 100],
    label: 'BREAKING POINT',
    description: 'You\'re about to crack. Take a break.',
    color: 'red',
    chokeModifier: +30,
    prepModifier: -25
  }
};
```

### Contributing Factors Data
```typescript
const STRESS_FACTORS = {
  pending_events: {
    icon: '📋',
    label: (count: number) => `${count} pending life events`,
    perUnit: 5,                      // +5 stress per event
    maxContribution: 25
  },
  loss_streak: {
    icon: '📉',
    label: (count: number) => `${count} battle loss streak`,
    perUnit: 5,                      // +5 per loss
    maxContribution: 20
  },
  family_unresolved: {
    icon: '🏠',
    label: 'Family situation unresolved',
    flatAmount: 20
  },
  no_rest: {
    icon: '⏰',
    label: (days: number) => `No rest in ${days} days`,
    perDay: 1,                       // +1 per day after 7 days
    startAfter: 7,
    maxContribution: 15
  },
  financial_pressure: {
    icon: '💰',
    label: 'Financial pressure',
    flatAmount: 10
  },
  upcoming_big_battle: {
    icon: '🎤',
    label: 'High-stakes battle approaching',
    flatAmount: 10
  },
  recent_choke: {
    icon: '😰',
    label: 'Choked in recent battle',
    flatAmount: 15,
    decayAfterBattles: 3
  }
};
```

---

## 3. IMMEDIATE EVENT MODAL (CAN'T ESCAPE)

### Component: `ImmediateEventModal.tsx`

This modal **takes over the entire screen** and **cannot be closed** without making a choice.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                                                                             │
│                        ⚡ IMMEDIATE DECISION REQUIRED                       │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │                                                                        │ │
│  │   [EVENT IMAGE - 16:9 OR 21:9]                                        │ │
│  │                                                                        │ │
│  │                                                                        │ │
│  │   Your opponent just grabbed the mic...                               │ │
│  │                                                                        │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────┐                                                             │
│  │ 📰 SCANDAL │  CRITICAL                                                  │
│  └───────────┘                                                             │
│                                                                             │
│  ══════════════════════════════════════════════════════════════════════    │
│  CALLED OUT ON STAGE                                                        │
│  ══════════════════════════════════════════════════════════════════════    │
│                                                                             │
│  The crowd is watching. Your opponent just called you out in front of      │
│  everyone. The room went silent. They're waiting for your response.        │
│                                                                             │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐ │
│  │                                 │  │                                 │ │
│  │  CHOICE A                       │  │  CHOICE B                       │ │
│  │                                 │  │                                 │ │
│  │  ════════════════════════════   │  │  ════════════════════════════   │ │
│  │                                 │  │                                 │ │
│  │  ACCEPT THE SMOKE               │  │  WALK AWAY                      │ │
│  │                                 │  │                                 │ │
│  │  Battle right now. You're       │  │  Live to fight another day.    │ │
│  │  unprepared but your pride      │  │  The crowd will remember.      │ │
│  │  stays intact. The culture      │  │                                 │ │
│  │  respects this.                 │  │                                 │ │
│  │                                 │  │                                 │ │
│  │  ─────────────────────────────  │  │  ─────────────────────────────  │ │
│  │  EFFECTS:                       │  │  EFFECTS:                       │ │
│  │                                 │  │                                 │ │
│  │  PERMANENT:                     │  │  PERMANENT:                     │ │
│  │  ▲ +1.5 Reputation              │  │  ▼ -1.0 Reputation              │ │
│  │  🏆 Badge: "Never Ducked"       │  │  💀 Badge: "Known Ducker"       │ │
│  │                                 │  │                                 │ │
│  │  TEMPORARY (Next Battle):       │  │  TEMPORARY (3 Battles):         │ │
│  │  ▼ -5 Prep Effectiveness        │  │  😔 Status: Humiliated          │ │
│  │                                 │  │  ▼ -10% Crowd Reaction          │ │
│  │                                 │  │                                 │ │
│  │        [ SELECT THIS ]          │  │        [ SELECT THIS ]          │ │
│  │                                 │  │                                 │ │
│  └─────────────────────────────────┘  └─────────────────────────────────┘ │
│                                                                             │
│  ══════════════════════════════════════════════════════════════════════    │
│                                                                             │
│                    ⚠️ YOU MUST CHOOSE. THIS CANNOT BE CLOSED.              │
│                                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Props Interface
```typescript
interface ImmediateEventModalProps {
  event: LifeEvent;
  onResolve: (choice: 'a' | 'b' | 'c') => Promise<void>;
}
```

### Key Behaviors
- `position: fixed; inset: 0; z-index: 9999`
- No close button
- No click-outside-to-close
- Escape key disabled
- Scroll locked on body
- Must click a choice to continue

---

## 4. TIMED EVENT BANNER

### Component: `TimedEventBanner.tsx`

Shows on dashboard when there's a timed event with deadline approaching.

```
┌─────────────────────────────────────────────────────────────────┐
│  ⏰ DECISION REQUIRED                            EXPIRES IN 23:47 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  💼 CAREER • MAJOR                                               │
│                                                                  │
│  PODCAST INTERVIEW OFFER                                         │
│  A major platform wants you on. This could change everything.    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ⚠️ If you don't respond:                                │   │
│  │  • -0.5 Reputation (seen as unprofessional)             │   │
│  │  • 🏷️ Badge: "Media Dodger"                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [MAKE DECISION NOW]                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Countdown Timer Logic
```typescript
// Countdown display formatting
function formatCountdown(expiresAt: Date): string {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) return 'EXPIRED';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

// Urgency colors
function getUrgencyColor(hoursRemaining: number) {
  if (hoursRemaining <= 2) return 'red';      // Critical
  if (hoursRemaining <= 12) return 'orange';  // Urgent
  if (hoursRemaining <= 24) return 'yellow';  // Warning
  return 'zinc';                               // Normal
}
```

---

## 5. BATTLE-GATED BLOCKER

### Component: `BattleGatedBlocker.tsx`

Shows instead of battle offers when player has battle-gated events.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                        🚫 BATTLES LOCKED                         │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  You have unresolved issues that must be handled before you      │
│  can accept any battle offers.                                   │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  BLOCKING EVENT:                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ⚖️ LEGAL SITUATION                                      │   │
│  │                                                          │   │
│  │  There's a legal matter that needs your attention.       │   │
│  │  You can't take on new battles until this is handled.    │   │
│  │                                                          │   │
│  │  Status: MUST RESOLVE                                    │   │
│  │                                                          │   │
│  │  [HANDLE THIS NOW]                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Once resolved, you'll be able to view and accept battle         │
│  offers again.                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard Integration
```typescript
// In DashboardClient.tsx
const hasBattleGatedEvent = pendingEvents.some(
  e => e.template.urgency === 'battle_gated'
);

// Render
{hasBattleGatedEvent ? (
  <BattleGatedBlocker
    event={pendingEvents.find(e => e.template.urgency === 'battle_gated')!}
  />
) : (
  <BattleOffersSection offers={offers} />
)}
```

---

## 6. EVENT IMAGE COMPONENT

### Component: `EventImage.tsx`

Handles all aspect ratios with proper sizing.

```typescript
interface EventImageProps {
  src: string | null;
  aspectRatio: '1:1' | '9:16' | '16:9' | '21:9';
  alt: string;
  fallback?: React.ReactNode;  // What to show if no image
  className?: string;
}

const ASPECT_CLASSES = {
  '1:1': 'aspect-square',
  '9:16': 'aspect-[9/16]',
  '16:9': 'aspect-video',
  '21:9': 'aspect-[21/9]'
};

const MAX_HEIGHTS = {
  '1:1': 'max-h-[400px]',
  '9:16': 'max-h-[600px]',
  '16:9': 'max-h-[400px]',
  '21:9': 'max-h-[300px]'
};
```

### Usage
```tsx
<EventImage
  src={event.template.image_url}
  aspectRatio={event.template.image_aspect_ratio || '16:9'}
  alt={event.template.title}
  fallback={<NoImagePlaceholder category={event.template.category} />}
/>
```

---

## 7. EFFECT PREVIEW COMPONENT

### Component: `EffectPreview.tsx`

Shows effects categorized by type (permanent, temporary, lockout).

```
┌─────────────────────────────────────────────────────────────────┐
│  EFFECTS:                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PERMANENT:                                                      │
│  ▲ +1.5 Reputation                                              │
│  🏆 Badge Earned: "Never Ducked"                                │
│                                                                  │
│  TEMPORARY (3 battles):                                          │
│  ▼ -10% Crowd Reaction                                          │
│  😔 Status: Humiliated                                          │
│                                                                  │
│  LOCKOUT:                                                        │
│  🚫 Cannot battle in Main Stage Arena for 5 battles             │
│                                                                  │
│  CONDITIONAL:                                                    │
│  ⚠️ If you lose your next battle: -0.5 Reputation               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Props Interface
```typescript
interface EffectPreviewProps {
  effects: Effect[];
  showWarnings?: boolean;
}

interface Effect {
  type: 'permanent' | 'temporary' | 'lockout' | 'conditional';

  // For stat changes
  attribute?: string;
  value?: number;

  // For badges
  badge_earned?: string;
  badge_lost?: string;

  // For temporary
  duration_type?: 'battles' | 'days';
  duration_value?: number;
  status_effect?: string;

  // For lockout
  lockout_type?: 'league' | 'city' | 'battler';
  lockout_target?: string;
  lockout_reason?: string;

  // For conditional
  trigger_condition?: string;
  then_effect?: Effect;
}
```

### Effect Type Styling
```typescript
const EFFECT_STYLES = {
  permanent: {
    headerColor: 'text-zinc-400',
    headerText: 'PERMANENT',
    icon: null
  },
  temporary: {
    headerColor: 'text-yellow-500',
    headerText: (duration: string) => `TEMPORARY (${duration})`,
    icon: '⏱️'
  },
  lockout: {
    headerColor: 'text-red-500',
    headerText: 'LOCKOUT',
    icon: '🚫'
  },
  conditional: {
    headerColor: 'text-orange-500',
    headerText: 'CONDITIONAL',
    icon: '⚠️'
  }
};
```

---

## 8. THREE-CHOICE EVENT COMPONENT

### Component: `ThreeChoiceEvent.tsx`

Some events have 3 options. Layout needs to handle this.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  💼 CAREER • CRITICAL                                                       │
│                                                                             │
│  RECORD LABEL OFFER                                                         │
│                                                                             │
│  Three labels are interested. Each has different terms...                   │
│                                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │                     │  │                     │  │                     │ │
│  │  CHOICE A           │  │  CHOICE B           │  │  CHOICE C           │ │
│  │                     │  │                     │  │                     │ │
│  │  ════════════════   │  │  ════════════════   │  │  ════════════════   │ │
│  │                     │  │                     │  │                     │ │
│  │  MAJOR LABEL        │  │  INDIE LABEL        │  │  STAY INDEPENDENT   │ │
│  │                     │  │                     │  │                     │ │
│  │  Big money but      │  │  Less money but     │  │  No money but       │ │
│  │  you lose creative  │  │  more creative      │  │  full creative      │ │
│  │  control.           │  │  freedom.           │  │  control.           │ │
│  │                     │  │                     │  │                     │ │
│  │  ─────────────────  │  │  ─────────────────  │  │  ─────────────────  │ │
│  │  EFFECTS:           │  │  EFFECTS:           │  │  EFFECTS:           │ │
│  │  ▲ +2.0 Financial   │  │  ▲ +1.0 Financial   │  │  ▲ +1.0 Reputation  │ │
│  │  ▼ -1.0 Creativity  │  │  ▲ +0.5 Creativity  │  │  ▲ +0.5 Creativity  │ │
│  │                     │  │                     │  │  🏆 "Independent"   │ │
│  │                     │  │                     │  │                     │ │
│  │  [ SELECT ]         │  │  [ SELECT ]         │  │  [ SELECT ]         │ │
│  │                     │  │                     │  │                     │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Responsive Layout
```typescript
// Desktop: 3 columns
// Tablet: 2 + 1
// Mobile: Stack vertically

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {choices.map((choice, index) => (
    <ChoiceCard key={index} choice={choice} ... />
  ))}
</div>
```

---

## 9. PENDING EVENTS WIDGET (ENHANCED)

### Component: `PendingLifeEventsWidget.tsx` (Updated)

Add urgency badges and countdown timers.

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚡ LIFE EVENTS                                           [4]   │
│                                                 [View History →] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔴 IMMEDIATE                                            │   │
│  │  CALLED OUT ON STAGE                                     │   │
│  │  Must decide NOW                                         │   │
│  │  [DECIDE NOW]                                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🟠 EXPIRES IN 6:24                                      │   │
│  │  PODCAST INTERVIEW OFFER                                 │   │
│  │  [RESPOND]                                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🟡 BATTLE-GATED                                         │   │
│  │  LEGAL SITUATION                                         │   │
│  │  Must resolve before next battle                        │   │
│  │  [HANDLE]                                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  +1 more event                                                   │
│  [VIEW ALL EVENTS]                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Urgency Badge Component
```typescript
const URGENCY_BADGES = {
  immediate: {
    color: 'bg-red-500',
    textColor: 'text-white',
    label: 'IMMEDIATE',
    icon: '🔴'
  },
  timed: {
    color: 'bg-orange-500',
    textColor: 'text-white',
    label: (remaining: string) => `EXPIRES IN ${remaining}`,
    icon: '🟠'
  },
  battle_gated: {
    color: 'bg-yellow-500',
    textColor: 'text-black',
    label: 'BATTLE-GATED',
    icon: '🟡'
  },
  passive: {
    color: 'bg-zinc-700',
    textColor: 'text-zinc-300',
    label: 'PENDING',
    icon: '⚪'
  }
};
```

---

## 10. EVENT RESOLUTION PAGE (ENHANCED)

### Route: `/life-events/[id]/page.tsx`

Handle all presentation types and urgencies.

```typescript
export default function LifeEventPage({ params }) {
  const event = await fetchEvent(params.id);

  // Immediate events use modal instead of page
  if (event.template.urgency === 'immediate') {
    return <ImmediateEventModal event={event} />;
  }

  // All other events use standard layout
  return (
    <div className="min-h-screen bg-[#18191c]">
      {/* Header with back button */}
      <EventPageHeader event={event} />

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Urgency banner for timed events */}
        {event.template.urgency === 'timed' && (
          <TimedEventBanner event={event} />
        )}

        {/* Image if present */}
        {event.template.image_url && (
          <EventImage
            src={event.template.image_url}
            aspectRatio={event.template.image_aspect_ratio}
            alt={event.template.title}
          />
        )}

        {/* Category & Severity */}
        <div className="flex gap-2 mt-6">
          <CategoryBadge category={event.template.category} />
          <SeverityBadge severity={event.template.severity} />
        </div>

        {/* Title & Description */}
        <h1 className="text-4xl font-black mt-4">{event.template.title}</h1>
        <p className="text-zinc-400 mt-4">{event.template.description}</p>

        {/* Choices */}
        {event.template.choice_c ? (
          <ThreeChoiceEvent event={event} />
        ) : (
          <TwoChoiceEvent event={event} />
        )}

        {/* Ignore warning */}
        {event.template.can_ignore && event.template.ignore_effects && (
          <IgnoreConsequenceWarning effects={event.template.ignore_effects} />
        )}

      </div>
    </div>
  );
}
```

---

## 11. DASHBOARD INTEGRATION

### Updated `DashboardClient.tsx` Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ALGORITHM INSTITUTE                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │  YOUR BATTLER               │  │  MENTAL STATE            │  │
│  │  [Avatar] STAGE NAME        │  │  ─────────────────────── │  │
│  │  1380 Rating | MID Tier     │  │  Stress: 58/100          │  │
│  │  12-6 Record | 67% WR       │  │  ████████████░░░░░░░░░░  │  │
│  │                             │  │  Status: STRAINED        │  │
│  │  [VIEW PROFILE]             │  │                          │  │
│  │                             │  │  Contributing Factors:   │  │
│  │                             │  │  • 3 pending events +15  │  │
│  │                             │  │  • Loss streak +10       │  │
│  │                             │  │  • No rest 14 days +8    │  │
│  │                             │  │                          │  │
│  │                             │  │  [MANAGE STRESS]         │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│  ⚡ LIFE EVENTS [4]                            [View History →]  │
│  ═══════════════════════════════════════════════════════════    │
│                                                                  │
│  [IMMEDIATE: CALLED OUT ON STAGE - DECIDE NOW]                   │
│  [EXPIRES 6:24: PODCAST OFFER]                                   │
│  [BATTLE-GATED: LEGAL SITUATION]                                 │
│  +1 more                                                         │
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│  NEXT BATTLE / BATTLE OFFERS                                     │
│  ═══════════════════════════════════════════════════════════    │
│                                                                  │
│  [Shows BattleGatedBlocker if needed, otherwise normal offers]   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. FILE STRUCTURE

```
components/
├── lifeEvents/
│   ├── StressWidget.tsx              [CREATE]
│   ├── ContributingFactors.tsx       [CREATE]
│   ├── ImmediateEventModal.tsx       [CREATE]
│   ├── TimedEventBanner.tsx          [CREATE]
│   ├── BattleGatedBlocker.tsx        [CREATE]
│   ├── EventImage.tsx                [CREATE]
│   ├── EffectPreview.tsx             [CREATE]
│   ├── ThreeChoiceEvent.tsx          [CREATE]
│   ├── TwoChoiceEvent.tsx            [CREATE]
│   ├── IgnoreConsequenceWarning.tsx  [CREATE]
│   ├── UrgencyBadge.tsx              [CREATE]
│   ├── PendingLifeEventsWidget.tsx   [MODIFY - add urgency]
│   ├── ChoiceCard.tsx                [MODIFY - add effect types]
│   └── LifeEventResolutionClient.tsx [MODIFY - add image support]

lib/
├── constants/
│   ├── stressFactors.ts              [CREATE]
│   └── urgencyConfig.ts              [CREATE]
```

---

## 13. IMPLEMENTATION PRIORITY

### Phase 1: Core (Build First)
1. `StressWidget` with contributing factors
2. `EffectPreview` with all effect types
3. `EventImage` with aspect ratio support
4. Enhanced `PendingLifeEventsWidget` with urgency badges

### Phase 2: Urgency System
5. `ImmediateEventModal` (full screen takeover)
6. `TimedEventBanner` with countdown
7. `BattleGatedBlocker`
8. `UrgencyBadge` component

### Phase 3: Polish
9. `ThreeChoiceEvent` layout
10. `IgnoreConsequenceWarning`
11. `ContributingFactors` detailed breakdown

---

## 14. CONSTANTS FOR V0

### Stress Colors
```typescript
export const STRESS_COLORS = {
  relaxed: '#22c55e',      // green-500
  comfortable: '#22c55e',  // green-500
  managing: '#eab308',     // yellow-500
  strained: '#ff8c42',     // orange (brand)
  breaking: '#ef4444'      // red-500
};
```

### Urgency Colors
```typescript
export const URGENCY_COLORS = {
  immediate: '#ef4444',    // red-500
  timed: '#f97316',        // orange-500
  battle_gated: '#eab308', // yellow-500
  passive: '#71717a'       // zinc-500
};
```

### Effect Type Colors
```typescript
export const EFFECT_COLORS = {
  permanent: '#a1a1aa',    // zinc-400
  temporary: '#eab308',    // yellow-500
  lockout: '#ef4444',      // red-500
  conditional: '#f97316'   // orange-500
};
```

---

**This spec gives V0 everything needed to build the Life Events V2 system. The heartbeat of the game.**
