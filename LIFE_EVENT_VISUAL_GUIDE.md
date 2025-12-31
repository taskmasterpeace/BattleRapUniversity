# Life Event System - Visual Guide

A visual walkthrough of the enhanced Life Event UI/UX system.

---

## 1. Life Event Resolution Screen

### Before Enhancement
```
┌─────────────────────────────────────────────┐
│ LIFE EVENT                                  │
│                                             │
│ Event Title                                 │
│ Description text here                       │
│                                             │
│ ┌─────────────┐  ┌─────────────┐          │
│ │ Choice A    │  │ Choice B    │          │
│ │ Text here   │  │ Text here   │          │
│ │             │  │             │          │
│ │ Effects:    │  │ Effects:    │          │
│ │ +2 Rep      │  │ -1 Rep      │          │
│ └─────────────┘  └─────────────┘          │
│                                             │
│      [CONFIRM DECISION]                     │
└─────────────────────────────────────────────┘
```

### After Enhancement
```
┌─────────────────────────────────────────────────────────────┐
│ ALGORITHM INSTITUTE | Life Event                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ╔══════════════════════════════════════════════════════╗ │
│  ║ 💼 CAREER  │  MAJOR                                  ║ │  ← Category & Severity Badges
│  ║                                                       ║ │
│  ║  ████ MAJOR RECORD DEAL                              ║ │  ← Gradient Title (5xl)
│  ║  A major label wants to sign you...                  ║ │
│  ╚══════════════════════════════════════════════════════╝ │
│                                                             │
│  ┌─── Event Context ────────────────────────┐             │
│  │ Battle Result: 3-0                        │             │
│  │ Outcome: WIN    Win Streak: 3             │             │
│  └───────────────────────────────────────────┘             │
│                                                             │
│  MAKE YOUR DECISION                                        │
│                                                             │
│  ╔═══════════════════════╗  ╔═══════════════════════╗    │
│  ║ ✓ CHOICE A            ║  ║   CHOICE B            ║    │  ← Animated Cards
│  ║                       ║  ║                       ║    │     (slide-in left/right)
│  ║ Accept the deal       ║  ║ Stay independent      ║    │
│  ║                       ║  ║                       ║    │
│  ║ ───────────────────── ║  ║ ───────────────────── ║    │
│  ║ Effects:              ║  ║ Effects:              ║    │
│  ║ ▲ +3 Financial        ║  ║ ▲ +2 Reputation       ║    │  ← Color-coded effects
│  ║ ▲ +10% Public Know.   ║  ║ ▼ -1 Financial        ║    │
│  ║ ▼ -1 Reputation       ║  ║ ▲ +5% Public Know.    ║    │
│  ╚═══════════════════════╝  ╚═══════════════════════╝    │
│                                                             │
│           [CONFIRM DECISION]                                │  ← Shake animation if
│                                                             │     no choice selected
│  ⚠ WARNING                                                 │
│  This decision is permanent and will affect...             │
└─────────────────────────────────────────────────────────────┘
```

**Enhancements:**
- 💼 Category icon and badge
- Severity indicator (MAJOR)
- 5xl gradient title
- Staggered animations (fade-in-up, slide-in)
- Selected card scales to 105%
- Checkmark bounces in
- Color-coded effects (green ▲, red ▼)
- Themed warning box

---

## 2. Impact Preview Component

```
┌─────────────────────────────────────────────────────────────┐
│ IMPACT PREVIEW: CHOICE A                Current → Projected │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Financial Stability ──────────────────────────────┐   │
│  │ Tier Change: Mid → Top                             │   │  ← Tier change notification
│  │                                                     │   │
│  │  3  →  6                                            │   │
│  │  ████████████████████░░░░░░░░░░░░░░░░              │   │  ← Visual bar
│  │  ████████████████████████████████████████████████  │   │     (before = grey)
│  │                                                     │   │     (after = green)
│  │  +3  ⭐ GOD TIER REACHED                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Reputation ───────────────────────────────────────┐   │
│  │                                                     │   │
│  │  7  ←  6                                            │   │  ← Arrow shows direction
│  │  ████████████████████████████████████████░░░░░░░░  │   │
│  │  ████████████████████████████░░░░░░░░░░░░░░░░░░░░  │   │  ← Red for negative
│  │                                                     │   │
│  │  -1  ⚠ CRITICAL LOW                                │   │  ← Warning indicator
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Before/after comparison
- Tier change detection (Low/Mid/Top/God)
- Warning indicators
- Visual progress bars
- Color coding (green positive, red negative)

---

## 3. Confirmation Modal (Major Events)

```
                    ┌──────────────────────────┐
                    │                          │
         ╔══════════════════════════════════════════════╗
         ║ ⚠  CONFIRM YOUR DECISION                     ║
         ║ MAJOR IMPACT • IRREVERSIBLE ACTION           ║
         ╠══════════════════════════════════════════════╣
         ║                                              ║
         ║ Event: Major Record Deal                     ║
         ║                                              ║
         ║ ┌──────────────────────────────────────┐    ║
         ║ │ Your Choice                          │    ║
         ║ │ Accept the deal and sign with...     │    ║
         ║ └──────────────────────────────────────┘    ║
         ║                                              ║
         ║ CONSEQUENCES                                 ║
         ║ ▲ +3 Financial Stability                     ║
         ║ ▲ +10% Public Knowledge                      ║
         ║ ▼ -1 Reputation                              ║
         ║                                              ║
         ║ ⚠ WARNING                                    ║
         ║ This choice has negative consequences.       ║
         ║ Make sure you understand the trade-offs.     ║
         ║                                              ║
         ║ ┌──────────────────────────────────────┐    ║
         ║ │ ARE YOU SURE YOU WANT TO PROCEED?    │    ║
         ║ └──────────────────────────────────────┘    ║
         ║                                              ║
         ║  [GO BACK]         [CONFIRM]                 ║
         ╚══════════════════════════════════════════════╝
                    │                          │
                    └──────────────────────────┘
```

**Severity-based styling:**
- **Critical:** Red confirm button, strong warning
- **Major:** Orange confirm button, moderate warning
- **Moderate:** Standard styling
- **Minor:** No modal (direct confirmation)

---

## 4. Event Outcome Screen

```
█████████████████████████████████████████████████████████████
█                                                           █
█   ╔═══════════════════════════════════════════════════╗ █
█   ║ 💰 LIFE EVENT RESOLVED                            ║ █
█   ║ Major Record Deal                                 ║ █
█   ║                                                   ║ █
█   ║ ┌─────────────────────────────────────────────┐  ║ █
█   ║ │ You chose: CHOICE A                          │  ║ █
█   ║ └─────────────────────────────────────────────┘  ║ █
█   ╠═══════════════════════════════════════════════════╣ █
█   ║                                                   ║ █
█   ║ ✓ DECISION EXECUTED                               ║ █
█   ║ Your choice has been enacted and the following    ║ █
█   ║ changes have been applied to your battler.        ║ █
█   ║                                                   ║ █
█   ╠═══════════════════════════════════════════════════╣ █
█   ║ ATTRIBUTE CHANGES                                 ║ █
█   ║                                                   ║ █
█   ║ ┌─────────────────────────────────────────────┐  ║ █
█   ║ │ FINANCIAL STABILITY              +3.0       │  ║ █  ← Counts up (animated)
█   ║ │ ████████████████████████████████           │  ║ █  ← Progress bar fills
█   ║ └─────────────────────────────────────────────┘  ║ █
█   ║                                                   ║ █
█   ║ ┌─────────────────────────────────────────────┐  ║ █
█   ║ │ PUBLIC KNOWLEDGE                 +10.0      │  ║ █
█   ║ │ ████████████████████                       │  ║ █
█   ║ └─────────────────────────────────────────────┘  ║ █
█   ║                                                   ║ █
█   ║ ┌─────────────────────────────────────────────┐  ║ █
█   ║ │ REPUTATION                       -1.0       │  ║ █  ← Red for negative
█   ║ │ ████████                                    │  ║ █
█   ║ └─────────────────────────────────────────────┘  ║ █
█   ║                                                   ║ █
█   ╠═══════════════════════════════════════════════════╣ █
█   ║         [CLOSE]    [RETURN TO DASHBOARD]         ║ █
█   ╚═══════════════════════════════════════════════════╝ █
█                                                           █
█████████████████████████████████████████████████████████████
```

**Features:**
- Full-screen overlay with backdrop blur
- Category-themed header
- Animated counting (0 → final value)
- Progress bars that fill as values count
- Celebration/warning message based on net impact
- Scale-in animation on appear

---

## 5. Life Events History Page

```
┌─────────────────────────────────────────────────────────────┐
│ ALGORITHM INSTITUTE | Life Event History                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ STATS ───────────────────────────────────────────────┐ │
│  │ Total: 47    Recent: Nov 30    Categories: 💼 12  📰 5 │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  Filters: [ALL] [💼 CAREER] [🏠 PERSONAL] [📰 SCANDAL]     │
│           [💰 FINANCIAL] [❤️ RELATIONSHIP]                  │
│                                                             │
│  Sort: [RECENT] [OLDEST]                                    │
│                                                             │
│  [Search events...                                      ]   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 💼 MAJOR RECORD DEAL             Nov 30 • career    │  │
│  │ Triggered after battle vs Hollow Da Don             │  │
│  │                                                     │  │
│  │ ┌─ Choice Made ────────────────────────────────┐   │  │
│  │ │ Accept the deal and sign with major label    │   │  │
│  │ └──────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  │ Effects Applied:                                    │  │
│  │ [+3 Financial] [+10% Public] [-1 Reputation]        │  │  ← Color-coded badges
│  │                                                     │  │
│  │                               [DETAILS]             │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📰 SCANDAL COVERAGE              Nov 28 • scandal   │  │
│  │ ...                                                 │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 🏠 FAMILY EMERGENCY              Nov 25 • personal  │  │
│  │ ...                                                 │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Stats summary cards
- Category filter buttons with icons
- Real-time search
- Expandable event cards
- Color-coded effect badges
- Battle context display

---

## 6. Event Statistics Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ EVENT STATISTICS                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ OVERVIEW ────────────────────────────────────────────┐ │
│  │ Total: 47  │  Resolved: 42  │  Pending: 5  │  30d: 12 │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ EVENTS BY CATEGORY ──────────────────────────────────┐ │
│  │                                                        │ │
│  │ 💼 Career      25 events                          53% │ │
│  │ ████████████████████████████████████████████          │ │  ← Progress bar
│  │                                                        │ │
│  │ 🏠 Personal    10 events                          21% │ │
│  │ ████████████████████                                  │ │
│  │                                                        │ │
│  │ 📰 Scandal      5 events                          11% │ │
│  │ ████████████                                          │ │
│  │                                                        │ │
│  │ 💰 Financial    7 events                          15% │ │
│  │ ████████████████                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ MOST COMMON EVENTS ──────────────────────────────────┐ │
│  │ #1  Win Streak Momentum               8x             │ │
│  │ #2  Choke Recovery                    6x             │ │
│  │ #3  Sponsor Offer                     5x             │ │
│  │ #4  Media Interview                   4x             │ │
│  │ #5  Family Conflict                   3x             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ BIGGEST IMPACTS ─────────────────────────────────────┐ │
│  │ Most Positive              │ Most Negative            │ │
│  │ Major Record Deal          │ Public Meltdown          │ │
│  │ +12 Total                  │ -8 Total                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ EVENT FREQUENCY (LAST 30 DAYS) ─────────────────────┐ │
│  │                                                        │ │
│  │     ██                                                │ │  ← Bar chart
│  │     ██        ████                                    │ │
│  │ ████████  ████████  ████    ██                        │ │
│  │ ████████  ████████  ████  ████      ██                │ │
│  │ ████████  ████████  ████  ████  ████████              │ │
│  │ -42d      -35d      -28d  -21d  -14d  -7d   Now       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Overview stats cards
- Category breakdown with percentages
- Most common events ranked
- Biggest impact analysis (pos/neg)
- 7-week frequency timeline
- Interactive hover tooltips

---

## 7. Mobile Responsive Layout

### Desktop (2 columns)
```
┌────────────────────────────────────────┐
│                                        │
│  ┌─────────────┐  ┌─────────────┐    │
│  │  Choice A   │  │  Choice B   │    │
│  │             │  │             │    │
│  │  Effects    │  │  Effects    │    │
│  └─────────────┘  └─────────────┘    │
│                                        │
└────────────────────────────────────────┘
```

### Mobile (Stacked)
```
┌──────────────────┐
│                  │
│  ┌────────────┐ │
│  │  Choice A  │ │
│  │            │ │
│  │  Effects   │ │
│  └────────────┘ │
│                  │
│  ┌────────────┐ │
│  │  Choice B  │ │
│  │            │ │
│  │  Effects   │ │
│  └────────────┘ │
│                  │
└──────────────────┘
```

---

## Animation Sequences

### 1. Page Load Sequence
```
Time  Element                Animation
0ms   Header                 Fade in
100ms Event context          Fade in
200ms Title & badges         Fade in up
300ms Choice A card          Slide in from left
400ms Choice B card          Slide in from right
500ms Confirm button         Fade in
600ms Warning box            Fade in
```

### 2. Choice Selection Sequence
```
User clicks Choice A
↓
Card scales to 105% (300ms)
↓
Checkmark bounces in (500ms)
↓
Other card dims slightly
↓
Confirm button highlights
```

### 3. Invalid Confirm Sequence
```
User clicks Confirm without selection
↓
Button shakes left/right (500ms)
↓
10% left, 20% right, etc.
↓
Returns to center
```

### 4. Outcome Screen Sequence
```
Modal appears (scale-in 400ms)
↓
Wait 200ms
↓
For each attribute (stagger 150ms):
  - Fade in card (400ms)
  - Count from 0 to value (500ms)
  - Fill progress bar (500ms)
↓
All complete
```

---

## Color Legend

### Category Colors
- 💼 **Career:** Orange (#fb923c)
- 🏠 **Personal:** Blue (#3b82f6)
- 📰 **Scandal:** Red (#ef4444)
- 💰 **Financial:** Green (#22c55e)
- ❤️ **Relationship:** Purple (#a855f7)

### Effect Indicators
- ▲ **Positive:** Green (#22c55e)
- ▼ **Negative:** Red (#ef4444)
- • **Neutral:** Zinc (#a1a1aa)

### Severity Colors
- **Minor:** Zinc (#71717a)
- **Moderate:** Yellow (#eab308)
- **Major:** Orange (#fb923c)
- **Critical:** Red (#ef4444)

### Tier Colors
- **Low (1-3):** Red
- **Mid (4-6):** Yellow
- **Top (7-9):** Green
- **God (10):** Purple

---

## Interactive States

### Buttons
```
Default:  [BUTTON TEXT]           (bg-zinc-900)
Hover:    [BUTTON TEXT]           (bg-zinc-700, scale 102%)
Active:   [BUTTON TEXT]           (bg-zinc-800)
Disabled: [BUTTON TEXT]           (bg-zinc-800, opacity 50%)
```

### Cards
```
Default:  ┌─────────┐            (border-zinc-800)
Hover:    ┌─────────┐            (border-zinc-700, scale 102%)
Selected: ┌─────────┐            (border-orange-500, scale 105%)
          │ ✓       │
          └─────────┘
```

### Input Fields
```
Default:  [___________]           (border-zinc-800)
Focus:    [___________]           (border-orange-500)
          │
```

---

## Accessibility Features

### Keyboard Navigation
- Tab through choices
- Enter to select choice
- Space to confirm
- Escape to cancel modal

### Screen Reader Labels
- Event category announced
- Severity level announced
- Effect changes announced with direction
- Tier changes announced

### Color Contrast
- All text meets WCAG AA standards
- Icons supplement color coding
- Text alternatives for visual indicators

---

## Browser Compatibility

### Supported Animations
✅ Chrome/Edge 90+
✅ Firefox 88+
✅ Safari 14+
✅ iOS Safari 14+
✅ Chrome Android 90+

### Graceful Degradation
If animations not supported:
- Elements still appear (just without animation)
- Functionality fully intact
- Layout remains correct

---

## Performance Metrics

### Target Performance
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s
- Animation frame rate: 60fps
- Bundle size increase: < 15kb gzipped

### Optimization Techniques
- CSS animations (no JS)
- RequestAnimationFrame for counting
- No heavy libraries
- Tree-shakeable components
- Lazy-loaded history page

---

This visual guide provides a comprehensive overview of the enhanced Life Event UI/UX system. All components work together to create a polished, professional, and engaging user experience.
