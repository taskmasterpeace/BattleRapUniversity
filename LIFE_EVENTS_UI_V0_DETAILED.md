# LIFE EVENTS UI V0 - COMPREHENSIVE FRONTEND SPECIFICATION

## 1. OVERVIEW

Life events are narrative moments that affect your battler's attributes and career. They create meaningful decision points and consequences that shape your battler's story.

**3 Event Types:**
| Type | Player Input | When Fires | Example |
|------|-------------|------------|---------|
| **PASSIVE** | None (automatic) | Behavior threshold met | 5 writing-focused days → Burnout |
| **CHOICE** | Player chooses A/B | Random/Attribute trigger | Podcast interview invite |
| **TRIGGERED** | None (automatic) | Battle performance | 3-0 victory → Viral moment |

**5 Event Categories:**
| Category | Icon | Color | Examples |
|----------|------|-------|----------|
| career | 💼 | Orange (#ff8c42) | Sponsorship offer, label interest |
| personal | 🏠 | Blue | Family emergency, relationship issues |
| scandal | 📰 | Red | Social media beef, leaked info |
| financial | 💰 | Green | Bill trouble, investment opportunity |
| relationship | ❤️ | Purple | Romance, family bond moments |

**4 Severity Levels:**
| Severity | Label Color | Impact Range |
|----------|-------------|--------------|
| minor | zinc-500 | Small stat changes (±0.1-0.3) |
| moderate | yellow-500 | Medium changes (±0.3-0.5) |
| major | orange-500 | Large changes (±0.5-1.0) |
| critical | red-500 | Career-altering (±1.0+) |

---

## 2. WHEN LIFE EVENTS APPEAR

### Trigger Points

**A. On Login / Dashboard Load**
- Dashboard fetches all pending events (`status = 'pending'`)
- Events display in `PendingLifeEventsWidget` on dashboard
- If events exist, widget is prominently displayed
- If >2 events, "URGENT" styling activates

**B. After Battle Completion**
- Battle results page checks for triggered events
- Shows alert: "This battle triggered X life events"
- "RESOLVE LIFE EVENT" button appears
- Links directly to event resolution page

**C. Via Notifications**
- `life_event` notification type with yellow styling
- Appears in notification dropdown
- Icon: 📰
- Links to `/dashboard` (which shows the widget)

**D. Passive Event Triggers (Background)**
- Triggered by prep patterns (5+ writing days, etc.)
- Triggered by attribute thresholds
- Triggered by career milestones
- Player discovers them on next dashboard load

---

## 3. PAGE ARCHITECTURE

### Pages Required

```
app/
├── life-events/
│   ├── page.tsx              // All pending events (list view)
│   ├── history/
│   │   └── page.tsx          // Resolved events history
│   └── [id]/
│       └── page.tsx          // Single event resolution page
```

### Page: Pending Events List (`/life-events`)
```
┌─────────────────────────────────────────────────────────────────┐
│  ALGORITHM INSTITUTE  |  Life Events                    [Back]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ⚠️ YOU HAVE 3 PENDING LIFE EVENTS                      │   │
│  │                                                          │   │
│  │  These events require your decisions before they expire. │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Sort: [URGENT FIRST ▼] [RECENT] [OLDEST]                       │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  💼 CAREER • MAJOR                    Triggered: Nov 30 │    │
│  │  ─────────────────────────────────────────────────────  │    │
│  │  RECORD LABEL INTEREST                                  │    │
│  │  A major label exec reached out about a meeting...      │    │
│  │                                                          │    │
│  │  [▼ PREVIEW CHOICES]      [MAKE DECISION →]             │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  📰 SCANDAL • MODERATE                 Triggered: Nov 29 │    │
│  │  ─────────────────────────────────────────────────────  │    │
│  │  LEAKED DMS                                              │    │
│  │  Old messages from before your career surfaced online... │    │
│  │                                                          │    │
│  │  [▼ PREVIEW CHOICES]      [MAKE DECISION →]             │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Page: Event Resolution (`/life-events/[id]`)
```
┌─────────────────────────────────────────────────────────────────┐
│  ALGORITHM INSTITUTE  |  Life Event                     [Back]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Triggered After Battle                                 │    │
│  │  vs KING VERBAL • Nov 28, 2025                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [💼 CAREER] [MAJOR]                                            │
│                                                                 │
│  ████████████████████████████████████████████████████████       │
│  RECORD LABEL INTEREST                                          │
│  ████████████████████████████████████████████████████████       │
│                                                                 │
│  After your dominant 3-0 victory, a major label executive      │
│  reached out about setting up a meeting. This could change     │
│  everything - or distract you from the battle circuit.         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Event Context                                           │   │
│  │  ───────────────────────────────────────────────────     │   │
│  │  Battle Result: 3-0    │    Outcome: WIN                 │   │
│  │  Win Streak: 4         │    Crowd Reaction: 92           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ════════════════════════════════════════════════════════════   │
│  MAKE YOUR DECISION                                             │
│  ════════════════════════════════════════════════════════════   │
│                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────┐      │
│  │  CHOICE A               │  │  CHOICE B               │      │
│  │  ─────────────────────  │  │  ─────────────────────  │      │
│  │                         │  │                         │      │
│  │  Take the meeting.      │  │  Stay focused on        │      │
│  │  Explore what they      │  │  battles. You're on     │      │
│  │  have to offer.         │  │  a streak - don't       │      │
│  │                         │  │  lose momentum.         │      │
│  │  ─────────────────────  │  │  ─────────────────────  │      │
│  │  EFFECTS:               │  │  EFFECTS:               │      │
│  │  ▲ +1.0 Reputation      │  │  ▲ +0.5 Resilience      │      │
│  │  ▲ +0.5 Financial       │  │  ▲ +0.3 Lyricism        │      │
│  │  ▼ -0.3 Prep Focus      │  │  ▲ +10% Public Know.    │      │
│  │                         │  │                         │      │
│  │  [SELECT ○]             │  │  [SELECT ○]             │      │
│  └─────────────────────────┘  └─────────────────────────┘      │
│                                                                 │
│              [ ████████ CONFIRM DECISION ████████ ]             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ⚠️ WARNING                                              │   │
│  │  This decision is permanent and will affect your        │   │
│  │  battler's attributes and future performance.           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Page: Event History (`/life-events/history`)
```
┌─────────────────────────────────────────────────────────────────┐
│  ALGORITHM INSTITUTE  |  Life Event History             [Back]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Total Events │  │ Most Recent  │  │  Categories  │          │
│  │      12      │  │  Nov 30      │  │ 💼4 📰3 🏠5  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  Filter: [ALL] [💼CAREER] [🏠PERSONAL] [📰SCANDAL]              │
│          [💰FINANCIAL] [❤️RELATIONSHIP]                         │
│                                                                 │
│  Sort: [RECENT ▼] [OLDEST]                                      │
│                                                                 │
│  [ Search events... __________________________________ ]        │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  💼 RECORD LABEL INTEREST              Resolved: Nov 30 │    │
│  │  ─────────────────────────────────────────────────────  │    │
│  │                                                          │    │
│  │  Choice Made:                                            │    │
│  │  ┌────────────────────────────────────────────────────┐ │    │
│  │  │ "Took the meeting. Explored what they had to offer"│ │    │
│  │  └────────────────────────────────────────────────────┘ │    │
│  │                                                          │    │
│  │  Effects Applied:                                        │    │
│  │  [+1.0 REPUTATION] [+0.5 FINANCIAL] [-0.3 PREP FOCUS]   │    │
│  │                                                          │    │
│  │                                          [DETAILS ▼]     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. DASHBOARD WIDGET

### PendingLifeEventsWidget (On Dashboard)
```
Normal State (1-2 events):
┌─────────────────────────────────────────────────────────────────┐
│  LIFE EVENTS [2]                              [View History →]  │
│  ─────────────────────────────────────────────────────────────  │
│  2 life events need your decision.                              │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  RECORD LABEL INTEREST                     Nov 30      │    │
│  │  A major label exec reached out about a meeting...     │    │
│  │  [MAKE DECISION]                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  FAMILY EMERGENCY                          Nov 29      │    │
│  │  Your mother called with urgent news...                │    │
│  │  [MAKE DECISION]                                        │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

Urgent State (3+ events):
┌─────────────────────────────────────────────────────────────────┐
│  🔥 LIFE EVENTS [5]        [REQUIRES ATTENTION]  [History →]   │
│  ─────────────────────────────────────────────────────────────  │
│  5 life events need your decision.                              │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  CRITICAL: LEAKED SCANDAL INFO             Nov 30      │    │
│  │  Screenshots of old messages surfaced online...        │    │
│  │  [MAKE DECISION]                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ... (up to 3 event previews)                                   │
│                                                                 │
│  +2 more events                                                 │
│  [VIEW ALL EVENTS]                                              │
└─────────────────────────────────────────────────────────────────┘
```

**Widget Visibility Rules:**
- Hidden if no pending events
- Yellow styling for 1-2 events
- Orange "urgent" styling for 3+ events
- Shows max 3 event previews
- "View All" button if more than 3

---

## 5. BATTLE RESULTS INTEGRATION

### Post-Battle Event Alert
```
On Battle Results Page (/battle/[id]):
┌─────────────────────────────────────────────────────────────────┐
│  ⚡ LIFE EVENT TRIGGERED                                        │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Your dominant 3-0 victory caught the attention of some        │
│  important people. This battle triggered 2 life events that    │
│  require your decisions.                                        │
│                                                                 │
│  Event Summary:                                                 │
│  • 💼 Record Label Interest (MAJOR)                            │
│  • 📰 Social Media Buzz (MINOR)                                │
│                                                                 │
│         [ ████ RESOLVE LIFE EVENTS ████ ]                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. NOTIFICATION SYSTEM

### Notification Dropdown Entry
```typescript
// Notification type configuration
{
  type: 'life_event',
  icon: '📰',
  color: 'border-yellow-500/30 bg-yellow-500/10',
  destination: '/dashboard'  // Shows widget with pending events
}
```

### Notification Bell Badge
- Shows count of unread notifications
- Life events contribute to this count
- Yellow dot indicator for pending life events

---

## 7. COMPONENT ARCHITECTURE

### Required Components

```typescript
// components/lifeEvents/PendingLifeEventsWidget.tsx
// Dashboard widget showing pending events
interface PendingLifeEventsWidgetProps {
  initialEvents?: LifeEvent[];
}

// components/lifeEvents/LifeEventCard.tsx
// Reusable event card for lists
interface LifeEventCardProps {
  event: LifeEvent;
  variant: 'preview' | 'full' | 'history';
  onResolve?: () => void;
}

// components/lifeEvents/LifeEventResolutionClient.tsx
// Full resolution page UI with choice cards
interface LifeEventResolutionClientProps {
  event: LifeEvent;
  battler: Battler;
}

// components/lifeEvents/LifeEventHistoryClient.tsx
// History page with filters and search
interface LifeEventHistoryClientProps {
  events: LifeEvent[];
  battler: Battler;
}

// components/lifeEvents/ChoiceCard.tsx
// Individual choice option card
interface ChoiceCardProps {
  choice: 'a' | 'b';
  label: string;
  text: string;
  effects: Effect[];
  selected: boolean;
  onSelect: () => void;
}

// components/lifeEvents/EffectBadge.tsx
// Display stat change badge
interface EffectBadgeProps {
  effect: string;
  value: number;
  isPositive: boolean;
}

// components/lifeEvents/CategoryBadge.tsx
// Display event category
interface CategoryBadgeProps {
  category: 'career' | 'personal' | 'scandal' | 'financial' | 'relationship';
}

// components/lifeEvents/SeverityBadge.tsx
// Display event severity
interface SeverityBadgeProps {
  severity: 'minor' | 'moderate' | 'major' | 'critical';
}

// components/lifeEvents/EventContextCard.tsx
// Display battle context for triggered events
interface EventContextCardProps {
  battleId?: string;
  details: {
    battle_result?: string;
    outcome?: 'win' | 'loss';
    win_streak?: number;
    choked?: boolean;
  };
}

// components/lifeEvents/BattleTriggeredAlert.tsx
// Alert on battle results page
interface BattleTriggeredAlertProps {
  events: LifeEvent[];
  battleId: string;
}
```

---

## 8. DATA TYPES

```typescript
// types/lifeEvents.ts

export type EventCategory = 'career' | 'personal' | 'scandal' | 'financial' | 'relationship';
export type EventSeverity = 'minor' | 'moderate' | 'major' | 'critical';
export type EventStatus = 'pending' | 'resolved';
export type ChoiceOption = 'a' | 'b';

export interface LifeEventTemplate {
  id: string;
  code: string;
  title: string;
  description: string;
  category: EventCategory;
  severity: EventSeverity;
  choice_a_text: string;
  choice_a_effects: EffectMap;
  choice_b_text: string | null;
  choice_b_effects: EffectMap | null;
}

export interface LifeEvent {
  id: string;
  battler_id: string;
  template_code: string;
  battle_id: string | null;
  status: EventStatus;
  chosen_option: ChoiceOption | null;
  triggered_at: string;
  resolved_at: string | null;
  details_json: EventDetails | null;
  template: LifeEventTemplate;
  battle?: Battle | null;
}

export interface EffectMap {
  reputation?: number;
  financial_stability?: number;
  family_bond?: number;
  resilience?: number;
  lyricism?: number;
  wordplay?: number;
  creativity?: number;
  flow?: number;
  stage_presence?: number;
  crowd_control?: number;
  delivery?: number;
  preparation?: number;
  public_knowledge?: number;
  prep_bonus_writing?: number;
  prep_bonus_performance?: number;
  prep_penalty?: number;
}

export interface EventDetails {
  battle_result?: string;
  outcome?: 'win' | 'loss';
  win_streak?: number;
  choked?: boolean;
  trigger_type?: 'passive' | 'choice' | 'triggered';
}
```

---

## 9. STYLING CONSTANTS

```typescript
// lib/constants/lifeEventStyles.ts

export const EVENT_CATEGORIES = {
  career: {
    icon: '💼',
    label: 'Career',
    bgClass: 'bg-[#ff8c42]/10',
    borderClass: 'border-[#ff8c42]/30',
    textClass: 'text-[#ff8c42]'
  },
  personal: {
    icon: '🏠',
    label: 'Personal',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/30',
    textClass: 'text-blue-500'
  },
  scandal: {
    icon: '📰',
    label: 'Scandal',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/30',
    textClass: 'text-red-500'
  },
  financial: {
    icon: '💰',
    label: 'Financial',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/30',
    textClass: 'text-green-500'
  },
  relationship: {
    icon: '❤️',
    label: 'Relationship',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/30',
    textClass: 'text-purple-500'
  }
};

export const SEVERITY_LEVELS = {
  minor: {
    label: 'Minor',
    color: 'text-zinc-500',
    bgClass: 'bg-zinc-500/10',
    borderClass: 'border-zinc-500/30'
  },
  moderate: {
    label: 'Moderate',
    color: 'text-yellow-500',
    bgClass: 'bg-yellow-500/10',
    borderClass: 'border-yellow-500/30'
  },
  major: {
    label: 'Major',
    color: 'text-[#ff8c42]',
    bgClass: 'bg-[#ff8c42]/10',
    borderClass: 'border-[#ff8c42]/30'
  },
  critical: {
    label: 'Critical',
    color: 'text-red-500',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/30'
  }
};

export const EFFECT_DISPLAY = {
  positive: {
    icon: '▲',
    color: 'text-green-500',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/30'
  },
  negative: {
    icon: '▼',
    color: 'text-red-500',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/30'
  },
  neutral: {
    icon: '•',
    color: 'text-zinc-400',
    bgClass: 'bg-zinc-500/10',
    borderClass: 'border-zinc-500/30'
  }
};
```

---

## 10. API ENDPOINTS

```typescript
// GET /api/life-events
// Returns all pending life events for player's battler
{
  events: LifeEvent[];
  count: number;
}

// GET /api/life-events/history
// Returns resolved events with pagination
{
  events: LifeEvent[];
  total: number;
  page: number;
  hasMore: boolean;
}

// POST /api/life-events/[id]/resolve
// Resolves an event with chosen option
{
  choice: 'a' | 'b';
}
// Response:
{
  success: boolean;
  effects: EffectMap;
  newAttributes: BattlerAttributes;
}
```

---

## 11. NAVIGATION FLOW

```
Dashboard
    │
    ├── [PendingLifeEventsWidget] ──► /life-events/[id] (resolve single)
    │   └── "View History" ──────────► /life-events/history
    │
    └── [NotificationDropdown]
            └── life_event notification ──► /dashboard (shows widget)

Battle Results (/battle/[id])
    │
    └── [BattleTriggeredAlert] ──► /life-events/[id] (resolve triggered)

Life Events List (/life-events)
    │
    ├── [LifeEventCard] ──► /life-events/[id] (resolve single)
    └── Back ──────────────► /dashboard

Life Event Resolution (/life-events/[id])
    │
    ├── [ConfirmDecision] ──► /dashboard (with outcome params)
    └── Back ────────────────► /dashboard

Life Event History (/life-events/history)
    │
    └── Back ────────────────► /dashboard
```

---

## 12. ANIMATIONS & UX

### Entry Animations
```css
/* Event card slide-in */
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Choice card hover */
.choice-card:hover {
  transform: scale(1.02);
  transition: all 0.3s ease;
}

/* Selected choice */
.choice-card.selected {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(255, 140, 66, 0.2);
}

/* Confirm button shake when no selection */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}
```

### Interaction States
- **Hover on choice card**: Scale up, highlight border
- **Selected choice**: Orange border, checkmark icon, scale 1.05
- **Confirm without selection**: Shake animation, highlight choices
- **Resolving**: Button disabled, "RESOLVING..." text, spinner

---

## 13. MOBILE RESPONSIVENESS

### Dashboard Widget
- Full width on mobile
- Stack event cards vertically
- Smaller text sizes (text-xs for dates)

### Resolution Page
- Stack choice cards vertically on mobile
- Full-width buttons
- Larger touch targets (min 44px)

### History Page
- Single column layout
- Collapsible filter sections
- Swipe to expand details

---

## 14. INFORMATION PLAYERS NEED

### On Dashboard Widget:
1. **Event title** - What is this about?
2. **Category icon** - Career/Personal/etc.
3. **Description preview** - First 2 lines
4. **Triggered date** - When did this happen?
5. **Count badge** - How many pending?

### On Resolution Page:
1. **Full description** - Complete event narrative
2. **Category + Severity** - How serious is this?
3. **Battle context** (if triggered) - What battle caused this?
4. **Choice A text** - What does this option mean?
5. **Choice A effects** - Exact stat changes
6. **Choice B text** - What does this option mean?
7. **Choice B effects** - Exact stat changes
8. **Warning** - This is permanent

### On History Page:
1. **Event title** - What was this?
2. **Category + Date** - Type and when resolved
3. **Choice made** - What did player choose?
4. **Effects applied** - What changed?
5. **Battle context** (if any) - Related battle

---

## 15. IMPLEMENTATION CHECKLIST

### Components
- [ ] `PendingLifeEventsWidget` - Dashboard widget
- [ ] `LifeEventCard` - Reusable event card
- [ ] `LifeEventResolutionClient` - Resolution page
- [ ] `LifeEventHistoryClient` - History page
- [ ] `ChoiceCard` - A/B choice display
- [ ] `EffectBadge` - Stat change badge
- [ ] `CategoryBadge` - Category display
- [ ] `SeverityBadge` - Severity display
- [ ] `EventContextCard` - Battle context
- [ ] `BattleTriggeredAlert` - Post-battle alert

### Pages
- [ ] `/life-events` - Pending events list
- [ ] `/life-events/[id]` - Single event resolution
- [ ] `/life-events/history` - Resolved events history

### API Endpoints
- [ ] `GET /api/life-events` - Fetch pending events
- [ ] `GET /api/life-events/history` - Fetch resolved events
- [ ] `POST /api/life-events/[id]/resolve` - Resolve event

### Integration
- [ ] Dashboard shows `PendingLifeEventsWidget`
- [ ] Battle results shows triggered events alert
- [ ] Notifications include life event type
- [ ] Navigation links in header/sidebar

### Styling
- [ ] Category color constants
- [ ] Severity level styling
- [ ] Effect badge colors (positive/negative)
- [ ] Animations (slide-in, hover, shake)
- [ ] Mobile responsive layouts

---

## 16. FILES TO CREATE/MODIFY

```
components/
├── lifeEvents/
│   ├── PendingLifeEventsWidget.tsx    ✓ EXISTS
│   ├── LifeEventCard.tsx              CREATE
│   ├── LifeEventResolutionClient.tsx  ✓ EXISTS (as battler/...)
│   ├── LifeEventHistoryClient.tsx     ✓ EXISTS
│   ├── ChoiceCard.tsx                 CREATE
│   ├── EffectBadge.tsx                CREATE
│   ├── CategoryBadge.tsx              CREATE
│   ├── SeverityBadge.tsx              CREATE
│   ├── EventContextCard.tsx           CREATE
│   └── BattleTriggeredAlert.tsx       CREATE

app/
├── life-events/
│   ├── page.tsx                       CREATE (pending list)
│   ├── history/
│   │   └── page.tsx                   ✓ EXISTS
│   └── [id]/
│       └── page.tsx                   ✓ EXISTS

lib/
├── constants/
│   └── lifeEventStyles.ts             CREATE

types/
└── lifeEvents.ts                       CREATE
```
