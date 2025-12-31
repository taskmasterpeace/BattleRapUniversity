# BATTLE RAP UNIVERSITY - COMPREHENSIVE UI/UX DOCUMENTATION

**Version**: 2.0
**Last Updated**: December 1, 2025
**Purpose**: Master specification for all screens, pages, components, user flows, routes, and typography system

---

## Table of Contents
1. [Overview & Design System](#overview--design-system)
2. [User Flow Diagram](#user-flow-diagram)
3. [Page-by-Page Documentation](#page-by-page-documentation)
4. [Component Library](#component-library)
5. [Missing Features & Gaps](#missing-features--gaps)
6. [Priority Recommendations](#priority-recommendations)
7. [Complete Application Route Map](#complete-application-route-map)
8. [Complete Component Catalog](#complete-component-catalog)

---

## Overview & Design System

### Core Brand Identity
**Game Name**: Algorithm Institute of BattleRap
**Tagline**: Battle rap simulation and strategy game
**Theme**: Dark, gritty, competitive battle rap culture with technical/algorithmic aesthetic

### Color Palette

**Primary Colors:**
- Background Dark: `bg-zinc-950` (#0a0a0a)
- Card Background: `bg-zinc-900` (#18181b)
- Borders: `border-zinc-800` (#27272a)
- Text Primary: `text-zinc-100` (#f4f4f5)
- Text Secondary: `text-zinc-500` / `text-zinc-400` (#71717a / #a1a1aa)
- Accent/Brand: `bg-orange-500`, `text-orange-500` (#f97316)

**Status Colors:**
- Success: `bg-green-500/20`, `text-green-500`, `border-green-500/30`
- Warning: `bg-yellow-500/20`, `text-yellow-500`, `border-yellow-500/30`
- Danger: `bg-red-500/20`, `text-red-500`, `border-red-500/30`
- Info: `bg-blue-500/20`, `text-blue-500`, `border-blue-500/30`

**Badge Tiers:**
- Bronze: `text-amber-500`, `bg-amber-900/20`, `border-amber-700/40`
- Silver: `text-zinc-300`, `bg-zinc-700/20`, `border-zinc-500/40`
- Gold: `text-yellow-400`, `bg-yellow-600/20`, `border-yellow-500/40`

### Typography

**APPROVED FONT SYSTEM** (User Confirmed: Rajdhani + Inter)

**Font Stack:**
- **Display/Headers**: Rajdhani (Google Fonts)
  - Weights: 400, 500, 600, 700
  - Usage: Page titles, section headers, card titles
  - Tailwind class: `font-display`

- **Body/UI Text**: Inter (Google Fonts)
  - Usage: Body text, labels, descriptions, navigation
  - Tailwind class: `font-sans` (default)

- **Monospace/Stats**: JetBrains Mono (Google Fonts)
  - Usage: Numbers, stats, code, data displays
  - Tailwind class: `font-mono`

**Implementation:**
- Installed in: `app/layout.tsx` (lines 2-23)
- Configured in: `tailwind.config.ts` (lines 15-19)
- CSS variables: `--font-rajdhani`, `--font-inter`, `--font-jetbrains-mono`

**Typography Scale:**

**Headers (use font-display):**
- H1 Page Titles: `text-5xl font-display font-bold` or `text-6xl font-display font-black`
- H2 Section Headers: `text-3xl font-display font-semibold` or `text-4xl font-display font-bold`
- H3 Card Titles: `text-2xl font-display font-medium` or `text-2xl font-display font-semibold`
- H4 Subsections: `text-xl font-display font-medium`

**Body Text (use font-sans - Inter is default):**
- Large Body: `text-lg font-normal` or `text-lg font-medium`
- Base Body: `text-base font-normal`
- Small Body: `text-sm font-medium`
- Labels: `text-sm font-semibold uppercase tracking-wide`
- Captions: `text-xs font-medium text-zinc-500`

**Stats/Numbers (use font-mono):**
- Large Stats: `text-4xl font-mono font-bold`
- Medium Stats: `text-2xl font-mono font-semibold`
- Inline Numbers: `text-base font-mono`
- Small Data: `text-sm font-mono text-zinc-400`

**Text Transforms:**
- Headers: Can use `uppercase` for emphasis (optional)
- Labels: `uppercase tracking-wide` or `tracking-wider`
- Body: Normal case (no transform)

**Examples:**
```tsx
// Page Title
<h1 className="text-6xl font-display font-bold text-orange-500">
  ALGORITHM INSTITUTE
</h1>

// Section Header
<h2 className="text-3xl font-display font-semibold uppercase tracking-tight">
  ACTIVE BATTLES
</h2>

// Body Text
<p className="text-base text-zinc-300 leading-relaxed">
  Your battler has been offered a match in the Small Room Circuit.
</p>

// Stat Display
<div className="text-4xl font-mono font-bold text-green-500">
  1,245
</div>
<div className="text-xs font-mono text-zinc-500">
  ELO RATING
</div>

// Label
<span className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
  Win Rate
</span>
```

**Accessibility:**
- All fonts include `display: 'swap'` for faster page loads
- `antialiased` class on body for smoother rendering
- Sufficient color contrast maintained (WCAG AA compliant)

### Layout Patterns

**Container:**
- Max width: `max-w-5xl` or `max-w-7xl`
- Centering: `mx-auto`
- Padding: `px-6`

**Spacing:**
- Section spacing: `space-y-6`, `space-y-8`, `space-y-12`
- Grid gaps: `gap-4`, `gap-6`
- Card padding: `p-6`, `p-8`

**Borders & Corners:**
- Border style: `border`, `border-2`
- Border radius: Generally none (square) or `rounded-lg` for some cards
- Border colors: Always use zinc scale for neutrals

---

## User Flow Diagram

```
┌─────────────────────┐
│   Landing Page      │  (/)
│  "Get Started" CTA  │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│   Auto-Login        │  (/login)
│  (Dev Mode Only)    │
└──────────┬──────────┘
           │
           v
    ┌──────┴──────┐
    │ Has battler?│
    └──────┬──────┘
           │
    ┌──────┴──────────────────┐
    │ NO                 YES   │
    v                          v
┌─────────────────┐     ┌──────────────────┐
│  Onboarding     │     │    Dashboard     │  (Main Hub)
│  4-Step Wizard  │     │  - Stats         │
└─────────────────┘     │  - Next Battle   │
                        │  - Offers        │
                        │  - History       │
                        └────────┬─────────┘
                                 │
           ┌─────────────────────┼───────────────────────┐
           │                     │                       │
           v                     v                       v
    ┌─────────────┐      ┌──────────────┐      ┌──────────────┐
    │Battle Offers│      │ Prep Calendar│      │Battle Results│
    │  - Accept   │      │  - Set Focus │      │  - Rounds    │
    │  - Decline  │      │  - Auto-save │      │  - Segments  │
    └─────────────┘      └──────────────┘      │  - Stats     │
                                                └──────┬───────┘
                                                       │
           ┌───────────────────────────────────────────┼────────────┐
           │                                           │            │
           v                                           v            v
    ┌──────────────┐                          ┌─────────────┐  ┌────────────┐
    │ Media/News   │                          │  Finances   │  │ Tournaments│
    │  - Articles  │                          │  - Balance  │  │  - Browse  │
    │  - Recaps    │                          │  - History  │  │  - Register│
    └──────────────┘                          └─────────────┘  └────────────┘
           │
           v
    ┌──────────────┐
    │Article Detail│
    │  - Markdown  │
    │  - Battle    │
    │    Link      │
    └──────────────┘

    Additional Pages:
    - /badges - Badge Compendium
    - /guide - Gameplay Guide
    - /battler/[id] - Battler Career Page (NEW - Grudge System)
    - /dev - Dev Tools (time manipulation)
```

---

## Page-by-Page Documentation

### 1. DASHBOARD (Main Hub)

**Route**: `/dashboard`
**File**: `app/dashboard/page.tsx`, `components/battler/DashboardClient.tsx`

#### Current State

**Header Bar:**
- Left: "ALGORITHM INSTITUTE | Dashboard"
- Right: "Sign Out" button

**Key Sections:**
1. **Quick Nav**: Guide, Badges buttons
2. **Battler Header**: Stage name, ELO rating, region
3. **Status Tags**: League, tier, W-L record, finances link, tournaments link
4. **Style Tags**: All selected styles
5. **Archetype Display**: Detected archetype with synergies/conflicts
6. **Stats Grid**: Writing (4), Performance (3), Personal (4), Mental State
7. **Active Battles**: Shows upcoming battles with "PREP NOW" buttons
8. **Battle Offers**: Count with "VIEW OFFERS" button
9. **Recent Battles**: Last 5 completed with "VIEW RESULTS" links
10. **Recent Headlines**: Last 5 news articles

#### Grudge System Addition (Phase 6 Implementation)

**Active Rivalries Section:**
```
┌─────────────────────────────────────────────┐
│ 🔥 ACTIVE RIVALRIES                         │
│                                             │
│ [Rivalry Card: Young Pattern]              │
│ Intensity: ████████░░ 85/100 (HOT)        │
│ Last Battle: 2-1 Win (You) • 5 days ago    │
│ Origin: Controversial decision upset       │
│ Rematch Demand: 92% - Fans want rematch!   │
│                                             │
│ [VIEW ALL RIVALRIES →]                     │
└─────────────────────────────────────────────┘
```

Shows top 2 active grudges with quick stats, links to full career page

#### Final Vision - What Should Be Added

**Career Summary Card:**
```
┌─────────────────────────────────────┐
│ 📊 CAREER SUMMARY                   │
│                                     │
│ Total Battles: 15                   │
│ Win Rate: 73% (11-4)                │
│ Current Streak: 3 wins              │
│ League Rank: #12 of 47              │
│                                     │
│ Tier Progress: ████████░░ MID→TOP  │
│ Next Level: 2 more wins             │
└─────────────────────────────────────┘
```

**Notifications Bar:**
- Pending offers count badge
- Upcoming battle countdown (< 24hrs)
- Unread news count
- Life event alerts

**Recent Achievements:**
- Last 3 badges earned
- Recent attribute improvements
- Milestone celebrations

**When Users See It**: Main hub after login, return here from all pages

---

### 2. BATTLE OFFERS PAGE

**Route**: `/battle/offers`
**File**: `app/battle/offers/page.tsx`

#### Current State
⚠️ **STYLING ISSUE**: Uses light theme (gray-50 background, white cards) - DOES NOT MATCH app theme

**Layout:**
- Simple header with "← Back to Dashboard" link
- Grid of offer cards
- Each card shows: Opponent, league, tier, dates, format
- Accept/Decline buttons

#### Critical Issues
1. **Light theme must be changed to dark** (zinc-950 background, zinc-900 cards)
2. **No opponent stats shown** (rating, attributes, style)
3. **No difficulty indicator**
4. **No payout preview**

#### Final Vision

**Enhanced Offer Card:**
```
┌─────────────────────────────────────────┐
│ ⚔️ BATTLE OFFER                         │
│                                         │
│ YOUNG PATTERN - MID TIER    ⚡ MEDIUM  │
│ Rating: 1250 (+50 vs You)              │
│                                         │
│ 📍 Small Room Circuit                   │
│ ⏱️ 2-min rounds (4 segments/round)      │
│                                         │
│ 📅 Scheduled: Dec 15, 2025              │
│ 🔒 Prep Locks: Dec 10, 2025             │
│ ⏳ Prep Window: 10 days                 │
│                                         │
│ 💰 POTENTIAL EARNINGS:                  │
│   Base Pay: $500                        │
│   Win Bonus: $1,200                     │
│   Total if Win: $1,700                  │
│                                         │
│ Opponent Style: Angles, Storytelling    │
│ Recent Record: 3-2 (Last 5)             │
│                                         │
│ [VIEW PROFILE] [ACCEPT ✓] [DECLINE ✗]  │
└─────────────────────────────────────────┘
```

**Should Add:**
- Opponent mini-stats preview
- Difficulty rating (Easy/Medium/Hard based on rating difference)
- Win probability estimate
- Historical matchup data (if rematches)
- Filters: By league, tier, date, payout

**When Users See It**: When pending offers exist, via dashboard "VIEW OFFERS" button

#### Grudge System Addition (Phase 6 Implementation)

**Grudge Match Designation:**

When an offer involves a battler you have history with, add visual treatment:

```
┌─────────────────────────────────────────────┐
│ 🔥 GRUDGE MATCH OFFER                       │
│ ═══════════════════════════════════════════ │
│                                             │
│ YOUNG PATTERN - MID TIER    ⚡ HIGH        │
│ Rating: 1250 (+50 vs You)                  │
│                                             │
│ 💀 HEAD-TO-HEAD RECORD: 1-0 (You Lead)     │
│ Last Battle: 2-1 Win • 12 days ago         │
│                                             │
│ 🔥 GRUDGE INTENSITY: ████████░░ 82/100     │
│ Origin: Controversial decision sparked beef│
│                                             │
│ 📍 Small Room Circuit                       │
│ ⏱️ 2-min rounds (4 segments/round)          │
│                                             │
│ 📅 Scheduled: Dec 20, 2025                  │
│ 🔒 Prep Locks: Dec 15, 2025                 │
│                                             │
│ 💰 POTENTIAL EARNINGS:                      │
│   Base Pay: $500                            │
│   Win Bonus: $1,200                         │
│   🔥 Rivalry Bonus: $400                   │
│   Total if Win: $2,100                      │
│                                             │
│ ⚠️ STAKES: High intensity + media attention│
│ Performance under pressure matters!         │
│                                             │
│ [VIEW RIVALRY HISTORY] [ACCEPT ✓] [DECLINE]│
└─────────────────────────────────────────────┘
```

**Rivalry History Modal** (Click "VIEW RIVALRY HISTORY"):
- Shows full head-to-head breakdown
- Battle results, scores, key moments
- Grudge intensity timeline
- Media coverage links
- Fan sentiment meter

---

### 3. PREP CALENDAR PAGE

**Route**: `/battle/[id]/prep`
**File**: `app/battle/[id]/prep/page.tsx`

#### Current State

**Header**: "← DASHBOARD" link, "BATTLE PREP" title

**Battle Info Card**: Opponent name, league, dates

**Focus Legend**: 5 colored options (Research, Writing, Performance, Life, Rest)

**Prep Calendar**: Grid of day cards, each with dropdown selector

**Features:**
- Auto-save on selection
- All days must be selected to complete
- "✓ SAVE & RETURN" button when complete

#### Final Vision - Prep Assistant

**Recommendations Panel:**
```
┌─────────────────────────────────────┐
│ 💡 PREP RECOMMENDATIONS             │
│                                     │
│ Based on your Technical Writer     │
│ archetype and opponent analysis:    │
│                                     │
│ ✓ Focus on WRITING (5-7 days)     │
│   → Boost lyricism advantage        │
│                                     │
│ ✓ Include 2-3 REST days            │
│   → Keep stress manageable          │
│                                     │
│ ⚠ Opponent uses angles heavily     │
│   → Consider 2+ RESEARCH days       │
│                                     │
│ [APPLY RECOMMENDED PLAN]            │
└─────────────────────────────────────┘
```

**Impact Preview (Real-time):**
```
Your current plan will result in:
  Lyricism: +1.5
  Flow: +1.2
  Resilience: -0.5
  Stress: 45 → 55 (Focused)

Predicted Score: 7.2 avg
Choke Risk: 8%
```

**Templates:**
- "Copy from Last Battle"
- "Balanced Strategy"
- "Grind Strategy" (all writing/performance)
- "Recovery Strategy" (mostly rest)

**When Users See It**: After accepting battle offer, before prep lock date

---

### 4. BATTLE RESULTS PAGE

**Route**: `/battle/[id]`
**File**: `app/battle/[id]/page.tsx`

#### Current State

**Header**: "← DASHBOARD" link, "BATTLE RESULTS" title

**Battle Header Card**:
- Player vs Opponent
- Score: "2 - 1"
- Victory/Defeat badge
- No-show warning if applicable

**Round Selector**: 3 buttons for rounds, shows won/lost status

**Round Stats (2 columns)**:
- Average score, peak score, consistency, crowd reaction
- Crowd reaction window with sprites
- Choke indicator

**Segment Timeline**:
- Visual bar chart showing all segment scores
- Color-coded: Haymaker (amber), Choke (red), Normal (blue/gray)
- Legend at bottom

**Navigation**: "← BACK TO DASHBOARD", "VIEW NEW OFFERS →"

#### Critical Missing Feature

⚠️ **PostBattleSummary component EXISTS but is NOT being used!**

The component shows:
- Rating change
- Attribute improvements/decreases
- Badges earned
- Stress change
- Motivational message

**This must be added to the results page immediately!**

#### Final Vision

**Add at Top (After Battle Header):**
```tsx
<PostBattleSummary
  victory={battle.winner_battler_id === battle.player_battler.id}
  ratingChange={ratingChange}
  attributeChanges={attributeChanges}
  badgesEarned={badgesEarned}
  stressChange={stressChange}
/>
```

**Earnings Card:**
```
┌─────────────────────────────────┐
│ 💰 BATTLE PAYOUT                │
│                                 │
│ Base Pay: $500                  │
│ Win Bonus: $1,200 ✓             │
│ Performance Bonus: $200         │
│ ─────────────────────           │
│ TOTAL EARNED: $1,900            │
└─────────────────────────────────┘
```

**Performance Insights:**
```
📊 YOUR PERFORMANCE:
  Best Round: Round 2 (8.5 avg)
  Haymakers: 3 segments
  Consistency: -1.2 vs your average
  Crowd Reaction: 85% (Excellent!)
```

**News Article Link** (if generated):
```
📰 This battle was covered by media!
"Young Pattern Edges Out Technical Showdown"
[READ RECAP →]
```

**When Users See It**: After battle simulation completes, via dashboard "VIEW RESULTS"

---

### 5. MEDIA/NEWS HUB

**Route**: `/media`
**File**: `app/media/page.tsx`

#### Current State
⚠️ **STYLING ISSUE**: Uses light theme - DOES NOT MATCH app

**Layout:**
- Header with "← Back to Dashboard"
- Filter buttons: All, Battle Recaps, Scandals, Career Updates, League Updates
- List of article cards (white on gray-50)

#### Critical Issues
1. **Must convert to dark theme**
2. **No featured article section**
3. **No search functionality**
4. **No pagination/infinite scroll**

#### Final Vision

**Hero Featured Article:**
```
┌───────────────────────────────────────┐
│ 🔥 FEATURED STORY                     │
│                                       │
│ UPSET OF THE YEAR: ROOKIE TAKES      │
│ DOWN TOP-RANKED VETERAN               │
│                                       │
│ The battle that shocked the league... │
│                                       │
│ Battle Recap • Dec 15 • 234 views    │
│                                       │
│ [READ NOW →]                          │
└───────────────────────────────────────┘
```

**Enhanced Filters:**
- Search bar: "Search articles..."
- Type filters (current)
- Sort: Newest, Oldest, Most Viewed
- Date range picker

**Article Cards (Dark Theme):**
```
┌─────────────────────────────────┐
│ [Type Badge]        234 views   │
│                                 │
│ Article Title Here              │
│                                 │
│ League • Battlers • Date        │
│                                 │
│ [READ MORE →]                   │
└─────────────────────────────────┘
```

**When Users See It**: From dashboard "ALL NEWS →" link, after battles complete

#### Grudge System Addition (Phase 6 Implementation)

**Enhanced Type Filters:**
Add new filter button for grudge/rivalry content:
```tsx
<button
  onClick={() => setSelectedType('grudge_coverage')}
  className={`px-4 py-2 rounded-lg font-medium transition ${
    selectedType === 'grudge_coverage'
      ? 'bg-orange-600 text-white'
      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
  }`}
>
  🔥 Rivalries
</button>
```

**Grudge Coverage Badge:**
New TYPE_COLOR for grudge articles:
```typescript
grudge_coverage: 'bg-orange-950 text-orange-400 border border-orange-800'
```

**Rivalry Storyline Articles:**
Articles that reference ongoing grudges should have visual indicator:
```
┌─────────────────────────────────┐
│ [Battle Recap] 🔥 GRUDGE MATCH  │
│                                 │
│ Young Pattern Defeats Tech in  │
│ Heated Rematch                  │
│                                 │
│ Small Room Circuit • Dec 15     │
│ Part of ongoing rivalry saga    │
│                                 │
│ [READ MORE →]                   │
└─────────────────────────────────┘
```

---

### 6. ARTICLE DETAIL PAGE

**Route**: `/media/[slug]`
**File**: `app/media/[slug]/page.tsx`

#### Current State
⚠️ **STYLING ISSUE**: Light theme - must convert to dark

**Layout:**
- "← Back to Media" link
- Type badge
- Title (4xl)
- Metadata: League, battlers, date
- Markdown body
- "View Battle Breakdown →" link (if battle recap)

#### Final Vision

**Enhanced Header:**
```
┌─────────────────────────────────────┐
│ ← BACK TO MEDIA                     │
│                                     │
│ [BATTLE RECAP]                      │
│                                     │
│ UPSET OF THE YEAR: ROOKIE          │
│ TAKES DOWN VETERAN                  │
│                                     │
│ By AIBR Media • Dec 15, 2025        │
│ 5 min read • 234 views              │
│                                     │
│ [Share] [Bookmark] [More...]        │
└─────────────────────────────────────┘
```

**Better Markdown Styling:**
- Dark mode prose theme
- Orange border on blockquotes
- Larger line height
- Better spacing

**Bottom Actions:**
- "View Battle Breakdown" button (large, orange)
- Social share buttons
- "Read Next" recommended article

**When Users See It**: From media hub, from dashboard headlines, from external shares

#### Grudge System Addition (Phase 6 Implementation)

**Rivalry Context Panel** (For grudge match recaps):

When article is about a battle involving a grudge, show context:
```
┌─────────────────────────────────────────────┐
│ 🔥 RIVALRY CONTEXT                          │
│                                             │
│ This battle is part of the ongoing rivalry │
│ between [Battler A] and [Battler B]        │
│                                             │
│ Head-to-Head: 2-1 ([Battler A] leads)      │
│ Grudge Intensity: 87/100 (Very Hot)        │
│ Origin: Controversial decision sparked beef│
│                                             │
│ Previous Coverage:                          │
│ • "The Upset That Started It All"          │
│ • "Battler B Responds to Critics"          │
│                                             │
│ [VIEW FULL RIVALRY HISTORY →]              │
└─────────────────────────────────────────────┘
```

Insert this panel between metadata and markdown body.

**Related Articles Section** (Bottom of article):
```
┌─────────────────────────────────────────────┐
│ 📰 RELATED COVERAGE                         │
│                                             │
│ [Article 1: Previous grudge battle]        │
│ [Article 2: Origin story]                  │
│ [Article 3: Analyst predictions]           │
│                                             │
│ [VIEW ALL RIVALRY ARTICLES →]              │
└─────────────────────────────────────────────┘
```

---

### 7. ONBOARDING WIZARD

**Route**: `/onboarding`
**File**: `components/battler/OnboardingWizard.tsx`

#### Current State

**4-Step Process:**
1. **Identity**: Stage name, region
2. **League**: Small Room Circuit vs Main Stage Arena
3. **Attributes**: Allocate 25 points across 11 attributes
4. **Styles**: Select 1-3 style tags

**Features:**
- Progress bar at top
- Back/Next navigation
- Beautiful attribute allocation with tier labels
- "CREATE BATTLER" on final step
- Success alert before redirect

#### Final Vision

**Step 0 - Welcome:**
```
┌─────────────────────────────────────┐
│ WELCOME TO THE CIRCUIT              │
│                                     │
│ You're about to create your battler │
│ and start your journey to the top.  │
│                                     │
│ This wizard will help you:          │
│  ✓ Choose your identity             │
│  ✓ Select your league               │
│  ✓ Allocate your attributes         │
│  ✓ Define your style                │
│                                     │
│ [LET'S GO →]                        │
└─────────────────────────────────────┘
```

**Step 5 - Confirmation:**
```
┌─────────────────────────────────────┐
│ CONFIRM YOUR BATTLER                │
│                                     │
│ Name: TECH WIZARD                   │
│ Region: East Coast                  │
│ League: Small Room Circuit          │
│                                     │
│ ATTRIBUTES:                         │
│  Writing: Strong (Avg 7.0)          │
│  Performance: Average (Avg 6.0)     │
│  Personal: Balanced (Avg 6.5)       │
│                                     │
│ Predicted Archetype: Technical      │
│ Writer with Wordplay focus          │
│                                     │
│ Styles: Wordplay, Angles            │
│                                     │
│ [← EDIT] [CONFIRM & START →]       │
└─────────────────────────────────────┘
```

**When Users See It**: First-time users after login, only once

---

### 8. BADGES COMPENDIUM

**Route**: `/badges`
**File**: `app/badges/page.tsx`

#### Current State

**Header**: "← DASHBOARD", "BADGE COMPENDIUM"

**Filters**: All, Writing, Performance, Content, Delivery, Reputation+, Reputation-

**Badge Grid**: 3 columns showing all badges with:
- Tier-colored background/border
- Badge name
- Badge code
- Tier badge (bronze/silver/gold)
- Description
- Effects list

**Legend**: Explains bronze/silver/gold tiers

#### Final Vision

**Personal Badges Section (Top):**
```
┌─────────────────────────────────────┐
│ YOUR BADGES (5/∞)                   │
│                                     │
│ [Badge1] [Badge2] [Badge3] [Badge4] │
│ [Badge5]                            │
│                                     │
│ Active Synergies: 2 ✓               │
│ Badge Conflicts: 0 ✓                │
│                                     │
│ Archetype: Technical Writer         │
└─────────────────────────────────────┘
```

**Recommended Section:**
```
RECOMMENDED FOR YOUR BUILD:
[Badge A] [Badge B] [Badge C]
These synergize with your Technical Writer archetype
```

**Search Bar**:
```
🔍 Search badges... [________________]
```

**Badge Detail Modal** (Click badge):
```
┌─────────────────────────────────────┐
│ [X] CLOSE                           │
│                                     │
│ 🥇 MASTER WORDSMITH (Gold)          │
│                                     │
│ Exceptional wordplay and double     │
│ entendres that captivate judges     │
│                                     │
│ EFFECTS:                            │
│ ▸ +15% wordplay skill               │
│ ▸ +10% creativity                   │
│ ▸ +5% crowd reaction on haymakers   │
│                                     │
│ SYNERGIES WITH:                     │
│ ✓ Punchline King (+5% combined)    │
│ ✓ Technical Writer (+3% flow)      │
│                                     │
│ CONFLICTS WITH:                     │
│ ✗ Freestyler (-10% consistency)    │
│                                     │
│ HOW TO EARN:                        │
│ Win 5 battles with 8+ wordplay      │
└─────────────────────────────────────┘
```

**When Users See It**: From dashboard "🏆 All Badges" button, when exploring builds

---

### 9. FINANCES PAGE

**Route**: `/finances`
**File**: `app/finances/page.tsx`, `components/battler/FinancesClient.tsx`

#### Current State

**Header**: "← BACK", "FINANCES", battler name

**Summary Cards (3):**
- Current Balance (green, 4xl)
- Lifetime Earnings (orange, 4xl)
- Battle Earnings (blue, 4xl)

**Earnings Breakdown**: Win bonuses, base pay, tournament prizes

**Transaction History**: List of all transactions with:
- Icon (emoji)
- Description/type
- Date
- Metadata chips (tier, league)
- Amount (green/red)
- Battle link (if applicable)

#### Final Vision

**Earnings Chart:**
```
┌─────────────────────────────────────┐
│ 📈 EARNINGS OVER TIME               │
│                                     │
│ [Line graph showing cumulative      │
│  earnings over last 30 days]        │
│                                     │
│ Toggle: [Monthly] [All Time]        │
└─────────────────────────────────────┘
```

**Financial Goals:**
```
┌─────────────────────────────────────┐
│ 🎯 FINANCIAL GOALS                  │
│                                     │
│ Current: $5,000 / $10,000           │
│ Progress: ████████░░░░ 50%          │
│                                     │
│ Goal: Save for training upgrade     │
│ Estimated: 5 more battles           │
│                                     │
│ [SET NEW GOAL]                      │
└─────────────────────────────────────┘
```

**Filters:**
- Date range: [Last 7 days ▼]
- Type: [All Types ▼]
- Amount: Min $____ Max $____
- Search: "Search transactions..."

**Stats Comparison:**
```
YOUR EARNINGS vs LEAGUE:
  Your avg/battle: $1,200
  League avg: $950 ✓ +26%
  Top earner this month: $15,000
```

**Export Options:**
- [Download CSV]
- [Download PDF Report]
- [Email Statement]

**When Users See It**: From dashboard "💰 FINANCES" link, after earning money

---

### 10. GAMEPLAY GUIDE

**Route**: `/guide`
**File**: `app/guide/page.tsx`

#### Current State

**Comprehensive Sections:**
1. The Game Loop
2. Attributes System
3. Prep Focus Types
4. The Two Leagues
5. Battle Mechanics
6. Badge System
7. Stress Management
8. Life Events
9. Pro Tips

**Styling**: Well-formatted with colored cards, clear headers, good typography

#### Final Vision

**Sticky Table of Contents (Left):**
```
CONTENTS:
▸ Game Loop
▸ Attributes
▸ Prep System
▸ Leagues
▸ Battle Mechanics
▸ Badges
▸ Stress
▸ Life Events
▸ Pro Tips
```

**Interactive Elements:**

**Prep Simulator:**
```
┌─────────────────────────────────────┐
│ 🎮 TRY IT: PREP PLANNING            │
│                                     │
│ Plan a 7-day prep and see the      │
│ predicted outcome!                  │
│                                     │
│ [START SIMULATOR]                   │
└─────────────────────────────────────┘
```

**Attribute Calculator:**
```
┌─────────────────────────────────────┐
│ 🎮 TRY IT: BUILD CALCULATOR         │
│                                     │
│ Allocate 25 points and see your    │
│ predicted archetype and tier        │
│                                     │
│ [OPEN CALCULATOR]                   │
└─────────────────────────────────────┘
```

**Visual Media:**
- Screenshots of each page
- Annotated diagrams
- Example workflows

**When Users See It**: From dashboard "📖 Gameplay Guide" button, when learning mechanics

---

### 11. BATTLER CAREER PAGE (NEW - Grudge System)

**Route**: `/battler/[id]`
**File**: `app/battler/[id]/page.tsx`

#### Purpose

Comprehensive career view showing a battler's full story: battle history, performance trends, rivalries, media mentions, personal life timeline, and career achievements. This is the storytelling hub that transforms raw stats into narrative.

#### Layout Structure

**Hero Header:**
```
┌─────────────────────────────────────────────────────────┐
│ ← BACK TO DASHBOARD                                     │
│                                                         │
│ 🎤 TECH WIZARD                                          │
│ East Coast • Small Room Circuit • Mid Tier             │
│                                                         │
│ Rating: 1,245 (#12 of 47)  •  Record: 11-4 (73%)      │
│ Current Streak: 🔥🔥🔥 3 wins                          │
│                                                         │
│ Archetype: Technical Writer                            │
│ Active Since: Nov 1, 2025 (27 days)                    │
│                                                         │
│ [💰 $12,450] [🏆 5 Badges] [📊 View Stats]            │
└─────────────────────────────────────────────────────────┘
```

**Tab Navigation:**
```
┌──────────────────────────────────────────────┐
│ [Overview] [Battles] [Rivalries] [Media]    │
└──────────────────────────────────────────────┘
```

#### Tab 1: Overview

**Performance Summary:**
```
┌─────────────────────────────────────────────┐
│ 📊 PERFORMANCE OVERVIEW                     │
│                                             │
│ Career Averages (Last 15 Battles):         │
│                                             │
│ Average Score: 7.2/10                       │
│ Peak Score: 8.9/10                          │
│ Consistency: 1.8 SD                         │
│ Crowd Reaction: 78% avg                     │
│                                             │
│ Haymaker Rate: 18% (81 of 450 segments)    │
│ Choke Rate: 4% (18 chokes in 450 segments) │
│                                             │
│ Performance Trend: ↗ +0.8 last 5 battles  │
└─────────────────────────────────────────────┘
```

**Attribute Breakdown:**
```
┌─────────────────────────────────────────────┐
│ ⚡ CURRENT ATTRIBUTES                       │
│                                             │
│ WRITING:                                    │
│  Lyricism: ████████░░ 8 (MID→TOP)         │
│  Wordplay: █████████░ 9 (TOP)              │
│  Creativity: ███████░░░ 7 (MID→TOP)       │
│  Flow: ██████░░░░ 6 (MID)                  │
│                                             │
│ PERFORMANCE:                                │
│  Stage Presence: ██████░░░░ 6 (MID)       │
│  Crowd Control: █████░░░░░ 5 (MID)        │
│  Delivery: ███████░░░ 7 (MID→TOP)         │
│                                             │
│ PERSONAL:                                   │
│  Financial: ████████░░ 8 (Stable)          │
│  Reputation: ███████░░░ 7 (Rising)         │
│  Family: ██████░░░░ 6 (Balanced)           │
│  Resilience: ███████░░░ 7 (Solid)          │
│                                             │
│ [VIEW ATTRIBUTE HISTORY →]                 │
└─────────────────────────────────────────────┘
```

**Active Badges:**
```
┌─────────────────────────────────────────────┐
│ 🏆 EARNED BADGES (5)                        │
│                                             │
│ [🥇 Master Wordsmith] [🥇 Punchline King]  │
│ [🥈 Technical Writer] [🥈 Angle Assassin]  │
│ [🥉 Rising Star]                            │
│                                             │
│ Synergies: 2 active ✓                       │
│ Conflicts: 0 ✓                              │
└─────────────────────────────────────────────┘
```

**Recent Life Events:**
```
┌─────────────────────────────────────────────┐
│ 📅 RECENT LIFE EVENTS                       │
│                                             │
│ 7 days ago: Family emergency handled       │
│ Impact: Family Bond -1, Stress +15          │
│                                             │
│ 14 days ago: Financial windfall             │
│ Impact: Financial Stability +2              │
│                                             │
│ 21 days ago: Mentorship opportunity         │
│ Impact: Reputation +1, Lyricism +0.5        │
│                                             │
│ [VIEW ALL EVENTS →]                         │
└─────────────────────────────────────────────┘
```

#### Tab 2: Battles

**Battle History Table:**
```
┌──────────────────────────────────────────────────────────────────┐
│ 📊 BATTLE HISTORY (15 Total)                                    │
│                                                                  │
│ Filters: [All ▼] [League ▼] [Result ▼] [Date Range]            │
│ Sort by: [Most Recent ▼]                                         │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Dec 15 • VICTORY 2-1 vs Young Pattern                      │ │
│ │ Small Room Circuit • Mid Tier                              │ │
│ │ Avg: 7.8 • Peak: 9.2 • Crowd: 85%                         │ │
│ │ [VIEW BREAKDOWN] [READ RECAP]                              │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Dec 10 • VICTORY 2-0 vs Lyric Master                       │ │
│ │ Small Room Circuit • Mid Tier                              │ │
│ │ Avg: 8.1 • Peak: 9.0 • Crowd: 82%                         │ │
│ │ [VIEW BREAKDOWN] [READ RECAP]                              │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ... (13 more battles)                                            │
│                                                                  │
│ [LOAD MORE BATTLES ↓]                                           │
└──────────────────────────────────────────────────────────────────┘
```

**Performance Trends Graph:**
```
┌─────────────────────────────────────────────┐
│ 📈 PERFORMANCE TREND (Last 15 Battles)      │
│                                             │
│ 10│                            •            │
│  9│           •        •    •      •        │
│  8│      •  •   •   •   • •                 │
│  7│  •                                      │
│  6│                                         │
│  5│                                         │
│   └─────────────────────────────────────   │
│    Battle 1 ────────────────▸ Battle 15    │
│                                             │
│ • Average Score    Trend: ↗ Improving      │
└─────────────────────────────────────────────┘
```

#### Tab 3: Rivalries (NEW - Grudge System Core)

**Active Rivalries:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔥 ACTIVE RIVALRIES (2)                                     │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 🔥🔥🔥 YOUNG PATTERN                                     ││
│ │                                                          ││
│ │ Intensity: ████████░░ 85/100 (VERY HOT)                ││
│ │ Rematch Demand: 92% - Fans demanding rematch!           ││
│ │                                                          ││
│ │ Head-to-Head: 1-0 (You lead)                            ││
│ │ Last Battle: Dec 15 • 2-1 Victory (You)                 ││
│ │                                                          ││
│ │ Origin: Controversial Decision Upset                     ││
│ │ "Tech Wizard scored upset victory over favored Young    ││
│ │ Pattern in a battle many felt should have gone 2-1      ││
│ │ the other way. Pattern's camp disputed scoring."        ││
│ │                                                          ││
│ │ Grudge Started: Dec 15, 2025 (5 days ago)               ││
│ │ Status: 🔥 ACTIVE - High tension                        ││
│ │                                                          ││
│ │ Media Coverage: 3 articles                               ││
│ │ • "The Upset That Shocked The Circuit"                  ││
│ │ • "Young Pattern Responds to Controversial Loss"        ││
│ │ • "Tech Wizard's Rise Sparks Debate"                    ││
│ │                                                          ││
│ │ Battle Details:                                          ││
│ │ Dec 15: 2-1 Victory (You) - Avg 7.8 vs 7.5             ││
│ │ Round 1: ✗ Lost (7.2 vs 8.1)                           ││
│ │ Round 2: ✓ Won (8.5 vs 7.3) - Your haymaker!          ││
│ │ Round 3: ✓ Won (7.7 vs 7.1) - Close finish            ││
│ │                                                          ││
│ │ [VIEW FULL TIMELINE] [READ ALL COVERAGE]                ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 🔥 LYRIC MASTER                                         ││
│ │                                                          ││
│ │ Intensity: ████░░░░░░ 42/100 (Warm)                    ││
│ │ Rematch Demand: 28% - Mild interest                     ││
│ │                                                          ││
│ │ Head-to-Head: 1-0 (You lead)                            ││
│ │ Last Battle: Dec 10 • 2-0 Victory (You)                 ││
│ │                                                          ││
│ │ Origin: Career Rivalry - Rankings Dispute                ││
│ │ "Both battlers competing for same tier advancement.     ││
│ │ Lyric Master felt disrespected by Tech's rapid rise."   ││
│ │                                                          ││
│ │ [VIEW DETAILS →]                                        ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Dormant/Resolved Rivalries:**
```
┌─────────────────────────────────────────────┐
│ 💤 DORMANT RIVALRIES (1)                    │
│                                             │
│ Street Poet - Resolved after respectful    │
│ handshake post-battle                       │
│ Final Record: 1-0 (You)                     │
│ [VIEW HISTORY]                              │
└─────────────────────────────────────────────┘
```

**Rivalry Stats:**
```
┌─────────────────────────────────────────────┐
│ 📊 RIVALRY STATISTICS                       │
│                                             │
│ Total Rivalries: 3                          │
│ Active: 2 • Dormant: 1 • Resolved: 0        │
│                                             │
│ Grudge Match Record: 3-0 (100%)             │
│ Avg Performance in Grudges: 8.1/10          │
│ (vs career avg: 7.2/10)                     │
│                                             │
│ 📰 Total Grudge Coverage: 8 articles        │
│ 🔥 Hottest Rivalry: Young Pattern (85/100) │
└─────────────────────────────────────────────┘
```

#### Tab 4: Media

**Media Mentions:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📰 MEDIA COVERAGE (12 Articles)                            │
│                                                             │
│ Filters: [All Types ▼] [All Bloggers ▼] [Date Range]      │
│ Sort by: [Most Recent ▼]                                    │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ [Battle Recap] 🔥 GRUDGE MATCH                          ││
│ │                                                          ││
│ │ "The Upset That Shocked The Circuit"                    ││
│ │                                                          ││
│ │ By Battle Eyez • Dec 15, 2025                           ││
│ │ Tech Wizard vs Young Pattern                            ││
│ │ Small Room Circuit • 234 views                          ││
│ │                                                          ││
│ │ [READ ARTICLE →]                                        ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ [Career Update]                                         ││
│ │                                                          ││
│ │ "Tech Wizard's Rapid Rise Through The Ranks"            ││
│ │                                                          ││
│ │ By Algorithm Institute • Dec 12, 2025                   ││
│ │ Career milestone • 189 views                            ││
│ │                                                          ││
│ │ [READ ARTICLE →]                                        ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ... (10 more articles)                                      │
│                                                             │
│ [LOAD MORE ARTICLES ↓]                                     │
└─────────────────────────────────────────────────────────────┘
```

**Blogger Coverage Breakdown:**
```
┌─────────────────────────────────────────────┐
│ 📊 COVERAGE BY BLOGGER                      │
│                                             │
│ Battle Eyez: 4 articles                     │
│ Marijuana Piranha: 3 articles               │
│ Algorithm Institute: 2 articles             │
│ Small Room Report: 2 articles               │
│ The Main Stage Herald: 1 article            │
│                                             │
│ Most Recent: Battle Eyez (2 days ago)       │
└─────────────────────────────────────────────┘
```

**Sentiment Analysis:**
```
┌─────────────────────────────────────────────┐
│ 💬 MEDIA SENTIMENT                          │
│                                             │
│ Positive: ████████░░ 75%                    │
│ Neutral:  ███░░░░░░░ 20%                    │
│ Negative: █░░░░░░░░░ 5%                     │
│                                             │
│ Recent Narrative: "Rising technical star   │
│ with controversial upset victory"           │
└─────────────────────────────────────────────┘
```

#### When Users See It

**Primary Navigation:**
- From dashboard Active Rivalries section: "VIEW ALL RIVALRIES →" links to `/battler/[id]?tab=rivalries`
- From battle results: Click opponent name to view their career page
- From media articles: Click battler name in article to view their page
- From "View Profile" button in battle offers

**Use Cases:**
1. **Player views own career**: Full storytelling - see your journey, rivalries, how media portrays you
2. **Player views opponent career**: Scout upcoming opponent - analyze their style, weaknesses, recent performance
3. **Grudge context**: Understand rivalry history before accepting grudge match offer
4. **Achievement tracking**: See badge progression, attribute growth, career milestones
5. **Media engagement**: Read all articles written about you or your rival

#### Technical Notes

**API Endpoint**: `GET /api/battler/[id]/career`

Returns:
```typescript
{
  battler: BattlerProfile;
  stats: {
    totalBattles: number;
    record: { wins: number; losses: number };
    winRate: number;
    streak: number;
    avgScore: number;
    peakScore: number;
    consistency: number;
    crowdReaction: number;
    haymakerRate: number;
    chokeRate: number;
  };
  battles: BattleRecord[];
  rivalries: {
    active: Rivalry[];
    dormant: Rivalry[];
    resolved: Rivalry[];
  };
  media: MediaArticle[];
  lifeEvents: LifeEvent[];
  badges: Badge[];
  attributeHistory: AttributeSnapshot[];
}
```

**Component Files Needed:**
- `components/battler/CareerHeader.tsx`
- `components/battler/PerformanceSummary.tsx`
- `components/battler/AttributeBreakdown.tsx`
- `components/battler/BattleHistoryTable.tsx`
- `components/battler/RivalryCard.tsx`
- `components/battler/GrudgeMeter.tsx`
- `components/battler/MediaMentionsList.tsx`
- `components/battler/SentimentChart.tsx`

---

## Component Library

### Reusable Components

**1. PostBattleSummary** - `components/battle/PostBattleSummary.tsx`
- ⚠️ **BUILT BUT NOT USED** - Should be added to battle results page
- Shows: Rating change, attribute changes, badges earned, stress change
- Beautiful progress bars and color coding
- Motivational messages based on victory/defeat

**2. StressIndicator** - `components/battler/StressIndicator.tsx`
- Visual stress bar with color-coded states
- States: Calm (green), Focused (yellow), Tense (orange), Overwhelmed (red)
- Shows choke risk percentage
- Sizes: small, normal, large

**3. ArchetypeDisplay** - `components/battler/ArchetypeDisplay.tsx`
- Detects player archetype from badges
- Shows icon, name, description, playstyle tip
- Lists active synergies (green)
- Lists badge conflicts (red)

**4. CrowdReactionWindow** - `components/battle/CrowdReactionWindow.tsx`
- Visual crowd reaction with sprite display
- Shows 3 overlapped crowd member sprites
- Demographic breakdown based on league
- Score-based reaction selection

**5. BadgeTooltip** - `components/ui/BadgeTooltip.tsx`
- Hover tooltip for badge chips
- Shows full effects list
- Tier indicator
- Used throughout app for badge displays

**6. AttributeAllocationStep** - `components/battler/AttributeAllocationStep.tsx`
- Point allocation system
- +/- buttons with constraints
- Tier labels (LOW/MID/TOP/GOD)
- Real-time point tracking
- Used in onboarding

### NEW Components (Grudge System)

**7. GrudgeMeter** - `components/battler/GrudgeMeter.tsx`
- Visual intensity bar (0-100 scale)
- Color-coded states: Cool (0-30), Warm (31-60), Hot (61-85), Very Hot (86-100)
- Shows rematch demand percentage
- Flame emoji indicator based on intensity
- Props: intensity, rematchDemand, size (small/normal/large)

**8. RivalryCard** - `components/battler/RivalryCard.tsx`
- Displays rivalry summary in compact card
- Shows: Opponent name, intensity meter, head-to-head record, last battle result
- Origin story excerpt
- Status badge (Active/Dormant/Resolved)
- Media coverage count
- Click to expand full timeline
- Props: rivalry, onExpand, compact (boolean)

**9. CareerHeader** - `components/battler/CareerHeader.tsx`
- Hero section for battler career page
- Shows: Name, region, league, tier, rating, rank, record, streak
- Quick stats buttons (finances, badges, view stats)
- Archetype display
- Active since timestamp
- Props: battler, stats, ranking

**10. BattleHistoryTable** - `components/battler/BattleHistoryTable.tsx`
- Sortable/filterable table of all battles
- Columns: Date, Opponent, Result, League, Avg/Peak/Crowd scores
- Filter by: League, Result (W/L), Date range
- Sort by: Date, Rating, Score
- Links to battle breakdown and media recap
- Pagination or infinite scroll
- Props: battles, onFilterChange, onSort

**11. MediaMentionsList** - `components/battler/MediaMentionsList.tsx`
- List view of all articles mentioning battler
- Filter by: Article type, Blogger, Date range
- Shows: Article title, blogger, date, views, type badge
- Grudge match indicator for rivalry articles
- Props: articles, onFilterChange

**12. PerformanceSummary** - `components/battler/PerformanceSummary.tsx`
- Career performance statistics card
- Displays: Avg score, peak score, consistency, crowd reaction
- Haymaker rate, choke rate
- Performance trend indicator (up/down/stable)
- Comparison to career average
- Props: stats, comparisonPeriod

**13. SentimentChart** - `components/battler/SentimentChart.tsx`
- Visual breakdown of media sentiment
- Positive/Neutral/Negative percentages
- Color-coded bars (green/gray/red)
- Recent narrative text summary
- Props: sentiment (positive, neutral, negative percentages), narrative

---

## Missing Features & Gaps

### CRITICAL (Must Fix Immediately)

**0. Grudge/Rivalry System Not Implemented** 🔴🔴🔴
- **MAJOR FEATURE**: Career storytelling through persistent grudge tracking
- Database tables needed: `battler_relationships`, `head_to_head_records`, `blogger_memory`, `rivalry_storylines`
- Core logic needed: Grudge creation engine, H2H tracking, blogger memory system
- UI needed: Career page, rivalry components, enhanced media hub
- **Status**: Phase 1-6 implementation in progress (see Phase priorities below)
- **Impact**: CRITICAL - Game lacks long-term narrative depth and player engagement
- **Complexity**: High - 6-week phased implementation with comprehensive testing

**1. PostBattleSummary Not Displayed** 🔴
- Component exists and is beautiful
- NOT used in `/battle/[id]` results page
- Users don't see progression (rating, attributes, badges earned)
- **Action**: Add to results page immediately
- **Impact**: MAJOR - Players can't see growth

**2. Inconsistent Styling** ✅ FIXED
- `/battle/offers` ✓ Converted to dark theme
- `/media` ✓ Converted to dark theme
- `/media/[slug]` ✓ Converted to dark theme
- **Status**: All pages now use zinc-950/zinc-900 dark theme
- **Impact**: Fixed - Consistent immersion maintained

**3. No Opponent Information in Offers** 🟡
- Can't see opponent rating, stats, or style
- No difficulty indicator
- No payout preview
- **Action**: Enhance offer cards with opponent data
- **Impact**: MEDIUM - Reduces strategic depth

### HIGH PRIORITY

**4. No Career Stats Summary** ✅ FIXED
- Dashboard now shows: Total battles, win rate, ELO rating, streak
- Career stats card added to DashboardClient.tsx (lines 146-179)
- **Status**: Basic stats implemented, full career page planned in grudge system
- **Impact**: Improved - Players see core progression metrics

**5. No Notifications System** 🟡
- No alerts for new offers, upcoming battles, news
- **Action**: Build notification dropdown in header
- **Impact**: MEDIUM - Players might miss events

**6. No Prep Recommendations** 🟡
- Prep page doesn't suggest optimal strategy
- No historical data or impact preview
- **Action**: Add recommendations panel and impact calculator
- **Impact**: MEDIUM - New players confused

### MEDIUM PRIORITY

**7. No Training/Progression Visibility** 🟢
- Attribute improvements are opaque
- No XP system or "level up" notifications
- **Action**: Add progression indicators and XP tracking
- **Impact**: MEDIUM - Progression feels random

**8. Life Events Not Implemented** 🟢
- System designed but not built
- No random events, no choices
- **Action**: Build life events system
- **Impact**: MEDIUM - Missing core feature

**9. No Battle Narrative** 🟢
- Results are pure stats
- No flavor text or commentary
- **Action**: Generate round-by-round narrative
- **Impact**: LOW-MEDIUM - Less immersive

### LOW PRIORITY

**10. No Search/Filters in Many Places** ⚪
- Badges page: No search
- Media page: Limited filters
- Finances: No date filters
- **Action**: Add search bars and advanced filters
- **Impact**: LOW - Nice to have

**11. No Social Features** ⚪
- No sharing, screenshots, or comments
- **Action**: Add share buttons and export features
- **Impact**: LOW - Not core V1

---

## Priority Recommendations

### GRUDGE SYSTEM IMPLEMENTATION (6 Weeks - IN PROGRESS)

This is the most comprehensive change to the application and takes priority over other features.

**Phase 1: Database Foundation & Core Grudge Logic** (Week 1-2)
- ✅ Update UI_UX_DOCUMENTATION.md with grudge system vision
- ⏳ Create database migration: `battler_relationships`, `head_to_head_records`, `blogger_memory`, `rivalry_storylines`
- ⏳ Build grudge creation engine (grudgeEngine.ts)
- ⏳ Build head-to-head tracking system
- ⏳ Create grudge system validation tests

**Phase 2: Media System Enhancements** (Week 2-3)
- ⏳ Build blogger memory system (persistent coverage history)
- ⏳ Enhance news generator with rivalry narratives
- ⏳ Add grudge_coverage article type
- ⏳ Update media hub with rivalry filter

**Phase 3: Career Page Implementation** (Week 3-4)
- ⏳ Create battler career API endpoint (`/api/battler/[id]/career`)
- ⏳ Build career page UI with 4 tabs (Overview, Battles, Rivalries, Media)
- ⏳ Create new UI components (GrudgeMeter, RivalryCard, etc.)

**Phase 4: Grudge Match Integration** (Week 4-5)
- ⏳ Integrate grudge matches into battle offers (visual treatment)
- ⏳ Add grudge modifiers to battle simulation
- ⏳ Build post-battle grudge resolution logic
- ⏳ Add rivalry bonus to payouts

**Phase 5: Dashboard Integration** (Week 5)
- ⏳ Add Active Rivalries section to dashboard
- ⏳ Link to career page from dashboard
- ⏳ Add rivalry context to battle results

**Phase 6: Testing & Validation** (Week 6)
- ⏳ Run agent-based UX testing (spawn agents to navigate full flow)
- ⏳ Validate grudge creation triggers with 100+ battle simulations
- ⏳ Test blogger memory continuity
- ⏳ Performance testing (database queries, page load times)
- ⏳ Balance testing (grudge intensity decay, rematch demand)

---

### Phase 1: Critical Fixes (1 Week)

**Week 1 Tasks:**

1. **Display PostBattleSummary** (2 hours)
   - Add to `/battle/[id]` page after battle header
   - Test with real battle data
   - Verify all data displays correctly

2. **Restyle Light Theme Pages** (1 day)
   - Convert `/battle/offers` to dark theme
   - Convert `/media` to dark theme
   - Convert `/media/[slug]` to dark theme
   - Match all typography and colors

3. **Add Career Stats to Dashboard** (4 hours)
   - Create career summary card
   - Show: Total battles, win %, rank, streak
   - Add tier progress bar

4. **Enhance Battle Offers** (1 day)
   - Add opponent rating and difficulty
   - Add payout preview
   - Improve card layout

### Phase 2: Core Features (2-3 Weeks)

**Week 2-3 Tasks:**

5. **Build Notifications System** (3 days)
   - Design notification dropdown
   - Add to header
   - Show: Offers, battles, news alerts
   - Mark as read functionality

6. **Add Prep Recommendations** (4 days)
   - Archetype-based suggestions
   - Attribute impact preview
   - Stress forecast
   - Templates/presets

7. **Implement Life Events** (5 days)
   - Event triggering logic
   - UI (modal or page)
   - Choice handling
   - Attribute/badge changes

8. **Add Battle Narrative** (2 days)
   - Auto-generate round commentary
   - Flavor text for key moments
   - Highlight haymakers/chokes

### Phase 3: Polish & UX (2 Weeks)

**Week 4-5 Tasks:**

9. **Onboarding Tutorial** (3 days)
   - First-time walkthrough
   - Tooltips on key elements
   - Optional guides

10. **Search & Filters** (3 days)
    - Badges search
    - Media advanced filters
    - Finances date/type filters

11. **Progression Visibility** (4 days)
    - XP system
    - Level up indicators
    - Progression graphs

12. **Share & Export** (2 days)
    - Share battle results
    - Screenshot generation
    - CSV exports

### Phase 4: Nice to Have (Ongoing)

13. **Mobile Optimization**
14. **Advanced Dev Tools**
15. **Social Features** (V2)

---

## Design Patterns (Copy-Paste Templates)

### Page Structure Template
```tsx
<div className="min-h-screen bg-zinc-950 text-zinc-100">
  {/* Header Bar */}
  <div className="border-b border-zinc-800 bg-zinc-900/50">
    <div className="max-w-5xl mx-auto px-6 py-6">
      <Link href="/dashboard" className="text-orange-500 hover:text-orange-400 text-sm uppercase tracking-wider font-bold">
        ← DASHBOARD
      </Link>
      <h1 className="text-4xl font-black tracking-tighter mt-3">PAGE TITLE</h1>
    </div>
  </div>

  {/* Main Content */}
  <div className="max-w-5xl mx-auto px-6 py-12">
    {/* Content sections */}
  </div>
</div>
```

### Card Template
```tsx
<div className="bg-zinc-900 border border-zinc-800 p-6">
  <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4 font-bold">
    SECTION HEADER
  </h3>
  {/* Card content */}
</div>
```

### Button Styles
```tsx
{/* Primary Button */}
<button className="py-4 px-6 bg-orange-500 hover:bg-orange-600 text-black text-center font-black uppercase tracking-wider transition">
  ACTION
</button>

{/* Secondary Button */}
<button className="py-4 px-6 border border-zinc-700 text-zinc-400 hover:bg-zinc-900 text-center font-black uppercase tracking-wider transition">
  SECONDARY
</button>

{/* Success Button */}
<button className="py-4 px-6 bg-green-600 hover:bg-green-700 text-white text-center font-black uppercase tracking-wider transition">
  SUCCESS
</button>

{/* Danger Button */}
<button className="py-4 px-6 bg-red-600 hover:bg-red-700 text-white text-center font-black uppercase tracking-wider transition">
  DANGER
</button>
```

### Stat Bar
```tsx
<div>
  <div className="flex justify-between items-center mb-1">
    <span className="text-zinc-400 uppercase text-xs tracking-wide">Lyricism</span>
    <span className="font-bold text-orange-500">8/10</span>
  </div>
  <div className="h-1 bg-zinc-800">
    <div
      className="h-full bg-gradient-to-r from-orange-500 to-red-500"
      style={{ width: '80%' }}
    />
  </div>
</div>
```

### Status Badge
```tsx
{/* Victory */}
<span className="px-4 py-2 bg-green-500/20 text-green-500 border border-green-500/30 text-sm font-bold uppercase tracking-wider">
  VICTORY
</span>

{/* Defeat */}
<span className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/30 text-sm font-bold uppercase tracking-wider">
  DEFEAT
</span>

{/* Warning */}
<span className="px-4 py-2 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-sm font-bold uppercase tracking-wider">
  WARNING
</span>
```

---

## Complete Application Route Map

This section provides a comprehensive map of all 62 endpoints (28 user-facing pages + 34 API routes) in the Battle Rap University application.

### User-Facing Pages (28 Routes)

#### Authentication & Onboarding (3 routes)
**1. `/login`** - `app/login/page.tsx`
- Auto-login page for development mode
- Automatically signs in with dev@test.com
- Redirects to dashboard or onboarding based on battler existence

**2. `/onboarding`** - `app/onboarding/page.tsx`
- 4-step character creation wizard
- Steps: Identity → League → Attributes → Styles
- Only shown once per user, creates first battler

**3. `/` (root)** - `app/page.tsx`
- Landing page (if implemented) or redirects to dashboard
- Currently redirects to /login

#### Dashboard & Navigation (1 route)
**4. `/dashboard`** - `app/dashboard/page.tsx`
- Main hub after login
- Displays: Battler stats, active battles, offers, recent battles, news
- Uses: `components/battler/DashboardClient.tsx`

#### Battle System (6 routes)
**5. `/battle/offers`** - `app/battle/offers/page.tsx`
- Lists all available battle offers
- Shows: Opponent, league, tier, scheduled date, prep window
- Actions: Accept, Decline

**6. `/battle/[id]`** - `app/battle/[id]/page.tsx`
- Battle results page showing completed battle breakdown
- Displays: Winner, round-by-round scores, segment timeline, crowd reaction
- Links to: Dashboard, new offers

**7. `/battle/[id]/prep`** - `app/battle/[id]/prep/page.tsx`
- Prep calendar for accepted battles
- Features: Daily focus selection (research/writing/performance/life/rest)
- Auto-saves selections, validates completion

**8. `/battles`** - Planned (not implemented)
- Battle history page showing all past battles
- Filterable by: League, tier, result, date

**9. `/battles/upcoming`** - Planned (not implemented)
- Shows all upcoming scheduled battles
- Calendar view with prep status

**10. `/battles/stats`** - Planned (not implemented)
- Career battle statistics dashboard
- Charts, trends, performance analytics

#### Battler & Career (4 routes)
**11. `/battler/[id]`** - `app/battler/[id]/page.tsx` (NEW - Grudge System)
- Comprehensive career page with 4 tabs
- Tabs: Overview, Battles, Rivalries, Media
- Shows: Attributes, badges, performance stats, life events, rivalries, media mentions

**12. `/battler/create`** - Uses onboarding wizard
- Redirects to `/onboarding`

**13. `/battler/[id]/stats`** - Planned (not implemented)
- Detailed attribute history and progression graphs
- Shows attribute changes over time

**14. `/battler/[id]/edit`** - Planned (not implemented)
- Edit battler profile (name, region, etc.)
- Limited to non-gameplay elements

#### Badges & Progression (2 routes)
**15. `/badges`** - `app/badges/page.tsx`
- Badge compendium showing all 97 badges
- Filterable by: Category, tier
- Shows: Description, effects, tier, how to earn

**16. `/badges/earned`** - Planned (not implemented)
- Shows only player's earned badges
- Badge progression and unlock timeline

#### Media & News (3 routes)
**17. `/media`** - `app/media/page.tsx`
- Media hub listing all news articles
- Filterable by: Type (battle recap, scandal, career update, league update, grudge coverage)
- Shows: Title, type, date, views

**18. `/media/[slug]`** - `app/media/[slug]/page.tsx`
- Individual article detail page
- Displays: Markdown content, metadata, related battle link
- Includes grudge context panel for rivalry articles

**19. `/media/archive`** - Planned (not implemented)
- Archived articles older than 30 days
- Search functionality

#### Finances (2 routes)
**20. `/finances`** - `app/finances/page.tsx`
- Financial dashboard
- Shows: Current balance, lifetime earnings, transaction history
- Uses: `components/battler/FinancesClient.tsx`

**21. `/finances/history`** - Currently part of `/finances`
- Full transaction history with filters
- Export options (CSV, PDF)

#### Tournaments (3 routes)
**22. `/tournaments`** - `app/tournaments/page.tsx`
- Browse available tournaments
- Shows: Name, entry fee, prize pool, format, dates

**23. `/tournaments/[id]`** - Planned (not implemented)
- Tournament detail and bracket view
- Registration, standings, results

**24. `/tournaments/history`** - Planned (not implemented)
- Past tournaments you've participated in
- Performance stats

#### Guide & Help (3 routes)
**25. `/guide`** - `app/guide/page.tsx`
- Comprehensive gameplay guide
- Sections: Game loop, attributes, prep, leagues, mechanics, badges, stress, life events, pro tips

**26. `/guide/[section]`** - Planned (not implemented)
- Individual guide section pages
- Deep dives into specific mechanics

**27. `/help`** - Planned (not implemented)
- FAQ, troubleshooting, support contact

#### Dev Tools (1 route)
**28. `/dev`** - `app/dev/page.tsx`
- Development tools page
- Features: Time manipulation, battle simulation triggers, data inspection

---

### API Routes (34 Routes)

#### Authentication (2 routes)
**1. `GET /api/auth/session`** - `app/api/auth/session/route.ts`
- Returns current user session
- Used by: Dashboard, all protected pages

**2. `POST /api/auth/logout`** - `app/api/auth/logout/route.ts`
- Logs out current user
- Clears session cookies

#### Battler Management (5 routes)
**3. `POST /api/battler/create`** - `app/api/battler/create/route.ts`
- Creates new battler for user
- Body: name, region, league, attributes, style_tags
- Called by: Onboarding wizard

**4. `GET /api/battler/current`** - `app/api/battler/current/route.ts`
- Gets current user's battler
- Returns: Full battler profile with attributes, rankings, badges

**5. `GET /api/battler/[id]`** - `app/api/battler/[id]/route.ts`
- Gets specific battler by ID (for viewing opponents)
- Returns: Public battler profile

**6. `GET /api/battler/[id]/career`** - Planned (Grudge System)
- Gets comprehensive career data
- Returns: Stats, battles, rivalries, media, life events, badges

**7. `PATCH /api/battler/[id]`** - Planned (not implemented)
- Updates battler profile
- Limited to non-gameplay fields

#### Battle System (11 routes)
**8. `GET /api/battles/offers`** - `app/api/battles/offers/route.ts`
- Gets all pending battle offers for current user
- Returns: Array of battles with status='offered'

**9. `POST /api/battles/[id]/accept`** - `app/api/battles/[id]/accept/route.ts`
- Accepts a battle offer
- Updates battle status to 'accepted'

**10. `POST /api/battles/[id]/decline`** - Planned (not implemented)
- Declines a battle offer
- Updates battle status to 'declined'

**11. `GET /api/battles/[id]`** - `app/api/battles/[id]/route.ts`
- Gets full battle details including rounds, segments, battlers
- Used by: Battle results page

**12. `GET /api/battles/[id]/prep`** - `app/api/battles/[id]/prep/route.ts`
- Gets current prep plan for a battle
- Returns: Array of prep_blocks

**13. `POST /api/battles/[id]/prep`** - `app/api/battles/[id]/prep/route.ts`
- Saves prep plan for a battle
- Body: Array of { date, focus_type }

**14. `GET /api/battles/upcoming`** - Planned (not implemented)
- Gets all upcoming battles (status='accepted')
- Sorted by scheduled_at

**15. `GET /api/battles/completed`** - Planned (not implemented)
- Gets all completed battles
- Paginated, sortable

**16. `GET /api/battles/stats`** - Planned (not implemented)
- Gets battle statistics for current battler
- Returns: Win rate, avg scores, streaks, etc.

**17. `POST /api/battles/simulate`** - Redirects to internal route
- Triggers battle simulation
- Dev mode: Accepts battle_id query param

**18. `GET /api/battles/[id]/narrative`** - Planned (not implemented)
- Generates narrative commentary for battle
- Returns: Round-by-round flavor text

#### Internal/System Routes (5 routes)
**19. `POST /api/internal/generate-battle-offers`** - `app/api/internal/generate-battle-offers/route.ts`
- System route: Generates new battle offers for all players
- Auth: Requires Authorization header
- Creates battles with status='offered'

**20. `POST /api/internal/run-due-battles`** - `app/api/internal/run-due-battles/route.ts`
- System route: Simulates battles with scheduled_at <= now
- Auth: Requires Authorization header
- Dev mode: ?battle_id=X to force specific battle

**21. `POST /api/internal/trigger-life-events`** - Planned (not implemented)
- System route: Generates random life events
- Auth: Requires Authorization header

**22. `POST /api/internal/update-rankings`** - Planned (not implemented)
- System route: Recalculates ELO rankings
- Auth: Requires Authorization header

**23. `POST /api/internal/cleanup`** - Planned (not implemented)
- System route: Archives old data, cleans up
- Auth: Requires Authorization header

#### Media & News (4 routes)
**24. `GET /api/media/articles`** - `app/api/media/articles/route.ts`
- Gets all news articles
- Query params: ?type=, ?limit=, ?offset=

**25. `GET /api/media/articles/[slug]`** - `app/api/media/articles/[slug]/route.ts`
- Gets single article by slug
- Returns: Full article with markdown body

**26. `POST /api/media/generate`** - Planned (not implemented)
- Generates news article (internal use)
- Body: battle_id, article_type

**27. `GET /api/media/trending`** - Planned (not implemented)
- Gets trending articles (most viewed)
- Time range: last 7 days

#### Finances (3 routes)
**28. `GET /api/finances/summary`** - `app/api/finances/summary/route.ts`
- Gets financial summary for current battler
- Returns: Balance, lifetime earnings, breakdown by type

**29. `GET /api/finances/transactions`** - `app/api/finances/transactions/route.ts`
- Gets transaction history
- Query params: ?limit=, ?offset=, ?type=

**30. `POST /api/finances/transaction`** - Used internally
- Creates new transaction
- Body: battler_id, type, amount, metadata

#### Badges (2 routes)
**31. `GET /api/badges`** - `app/api/badges/route.ts`
- Gets all badge definitions
- Returns: Array of all 97 badges

**32. `GET /api/badges/earned`** - Planned (not implemented)
- Gets badges earned by current battler
- Returns: Array of earned badges with unlock dates

#### Tournaments (2 routes)
**33. `GET /api/tournaments`** - `app/api/tournaments/route.ts`
- Gets all active tournaments
- Returns: Array of tournament details

**34. `POST /api/tournaments/[id]/register`** - Planned (not implemented)
- Registers battler for tournament
- Deducts entry fee, adds to bracket

#### Debug (1 route)
**35. `GET /api/debug`** - `app/api/debug/route.ts`
- Debug endpoint for development
- Returns: Recent battles, battlers, system state

---

### Navigation Flow Map

```
LOGIN
  └─> Has Battler?
      ├─> NO: ONBOARDING → DASHBOARD
      └─> YES: DASHBOARD
          ├─> View Offers → BATTLE OFFERS → Accept → PREP CALENDAR → (wait) → BATTLE RESULTS
          ├─> Prep Now → PREP CALENDAR
          ├─> View Results → BATTLE RESULTS
          ├─> All News → MEDIA HUB → Article → MEDIA DETAIL
          ├─> Finances → FINANCES PAGE
          ├─> Tournaments → TOURNAMENTS PAGE
          ├─> All Badges → BADGES COMPENDIUM
          ├─> Gameplay Guide → GUIDE PAGE
          └─> View Rivalries → BATTLER CAREER PAGE (Grudge System)

BATTLER CAREER PAGE
  ├─> Tab: Overview (stats, attributes, badges, life events)
  ├─> Tab: Battles (full history, performance trends)
  ├─> Tab: Rivalries (active grudges, dormant, stats)
  └─> Tab: Media (all articles mentioning battler)

BATTLE RESULTS
  ├─> View Opponent Profile → BATTLER CAREER PAGE
  ├─> Read Recap → MEDIA DETAIL
  └─> Back to Dashboard → DASHBOARD
```

---

## Complete Component Catalog

This section documents all 51 components across 10 categories in the Battle Rap University application.

### 1. Battle Components (7 components)

**1.1 PostBattleSummary** - `components/battle/PostBattleSummary.tsx`
- **Purpose**: Displays post-battle progression summary (rating, attributes, badges, stress changes)
- **Status**: Built but NOT currently used (critical issue)
- **Key Props**: `victory`, `ratingChange`, `attributeChanges`, `badgesEarned`, `stressChange`
- **Used In**: Should be used in `/battle/[id]` results page
- **Features**: Progress bars, color-coded changes, motivational messages

**1.2 BattleHeader** - `app/battle/[id]/page.tsx` (inline component)
- **Purpose**: Displays battle matchup header with result
- **Status**: Page-specific
- **Key Props**: `playerBattler`, `opponentBattler`, `result`, `winner`
- **Used In**: `/battle/[id]`
- **Features**: VS display, score, victory/defeat badge

**1.3 RoundSelector** - `app/battle/[id]/page.tsx` (inline component)
- **Purpose**: Round navigation buttons
- **Status**: Page-specific
- **Key Props**: `rounds`, `selectedRound`, `onSelectRound`
- **Used In**: `/battle/[id]`
- **Features**: Shows won/lost status per round

**1.4 RoundStats** - `app/battle/[id]/page.tsx` (inline component)
- **Purpose**: Displays round statistics in two columns
- **Status**: Page-specific
- **Key Props**: `round`, `playerBattler`, `opponentBattler`
- **Used In**: `/battle/[id]`
- **Features**: Average, peak, consistency, crowd reaction stats

**1.5 CrowdReactionWindow** - `components/battle/CrowdReactionWindow.tsx`
- **Purpose**: Visual crowd reaction display with sprites
- **Status**: Reusable
- **Key Props**: `score`, `league`, `size`
- **Used In**: `/battle/[id]` round stats
- **Features**: 3 overlapping crowd sprites, demographic-based selection

**1.6 SegmentTimeline** - `app/battle/[id]/page.tsx` (inline component)
- **Purpose**: Visual bar chart of segment scores
- **Status**: Page-specific
- **Key Props**: `segments`, `playerBattlerId`
- **Used In**: `/battle/[id]`
- **Features**: Color-coded bars (haymaker=amber, choke=red, normal=blue/gray), legend

**1.7 BattleOfferCard** - `app/battle/offers/page.tsx` (inline component)
- **Purpose**: Displays battle offer with details
- **Status**: Page-specific
- **Key Props**: `battle`, `onAccept`, `onDecline`
- **Used In**: `/battle/offers`
- **Features**: Opponent info, league, dates, accept/decline buttons

### 2. Battler Components (13 components)

**2.1 DashboardClient** - `components/battler/DashboardClient.tsx`
- **Purpose**: Main dashboard UI with all battler info
- **Status**: Reusable
- **Key Props**: None (fetches data internally)
- **Used In**: `/dashboard`
- **Features**: Stats grid, active battles, offers, recent battles, news, archetype, style tags

**2.2 OnboardingWizard** - `components/battler/OnboardingWizard.tsx`
- **Purpose**: 4-step character creation flow
- **Status**: Reusable
- **Key Props**: None
- **Used In**: `/onboarding`
- **Features**: Progress bar, identity, league, attributes, styles, validation

**2.3 AttributeAllocationStep** - `components/battler/AttributeAllocationStep.tsx`
- **Purpose**: Point allocation system for attributes
- **Status**: Reusable
- **Key Props**: `attributes`, `onChange`, `totalPoints`, `maxPerAttribute`
- **Used In**: Onboarding wizard
- **Features**: +/- buttons, tier labels, real-time tracking

**2.4 ArchetypeDisplay** - `components/battler/ArchetypeDisplay.tsx`
- **Purpose**: Shows detected archetype from badges/attributes
- **Status**: Reusable
- **Key Props**: `badges`, `attributes`
- **Used In**: Dashboard, battler career page
- **Features**: Icon, name, description, synergies (green), conflicts (red), playstyle tip

**2.5 StressIndicator** - `components/battler/StressIndicator.tsx`
- **Purpose**: Visual stress bar with color-coded states
- **Status**: Reusable
- **Key Props**: `stress`, `size`
- **Used In**: Dashboard, prep calendar, battler stats
- **Features**: Color states (calm/focused/tense/overwhelmed), choke risk %

**2.6 FinancesClient** - `components/battler/FinancesClient.tsx`
- **Purpose**: Finances page UI with transactions
- **Status**: Reusable
- **Key Props**: None (fetches data internally)
- **Used In**: `/finances`
- **Features**: Balance, lifetime earnings, transaction history, battle links

**2.7 CareerHeader** - `components/battler/CareerHeader.tsx` (NEW - Grudge System)
- **Purpose**: Hero section for battler career page
- **Status**: Reusable
- **Key Props**: `battler`, `stats`, `ranking`
- **Used In**: `/battler/[id]`
- **Features**: Name, region, league, rating, rank, record, streak, archetype, quick stats buttons

**2.8 PerformanceSummary** - `components/battler/PerformanceSummary.tsx` (NEW - Grudge System)
- **Purpose**: Career performance statistics card
- **Status**: Reusable
- **Key Props**: `stats`, `comparisonPeriod`
- **Used In**: `/battler/[id]` Overview tab
- **Features**: Avg/peak/consistency scores, haymaker/choke rates, trend indicator

**2.9 AttributeBreakdown** - `components/battler/AttributeBreakdown.tsx` (NEW - Grudge System)
- **Purpose**: Visual display of all attributes with progress bars
- **Status**: Reusable
- **Key Props**: `attributes`
- **Used In**: `/battler/[id]` Overview tab
- **Features**: Grouped by category (Writing/Performance/Personal), tier labels, progress bars

**2.10 BattleHistoryTable** - `components/battler/BattleHistoryTable.tsx` (NEW - Grudge System)
- **Purpose**: Sortable/filterable table of all battles
- **Status**: Reusable
- **Key Props**: `battles`, `onFilterChange`, `onSort`
- **Used In**: `/battler/[id]` Battles tab
- **Features**: Filters (league, result, date), sort options, links to breakdown/recap, pagination

**2.11 RivalryCard** - `components/battler/RivalryCard.tsx` (NEW - Grudge System)
- **Purpose**: Displays rivalry summary in card
- **Status**: Reusable
- **Key Props**: `rivalry`, `onExpand`, `compact`
- **Used In**: `/battler/[id]` Rivalries tab, Dashboard active rivalries section
- **Features**: Intensity meter, H2H record, last battle, origin story, status badge, media count

**2.12 MediaMentionsList** - `components/battler/MediaMentionsList.tsx` (NEW - Grudge System)
- **Purpose**: List of all articles mentioning battler
- **Status**: Reusable
- **Key Props**: `articles`, `onFilterChange`
- **Used In**: `/battler/[id]` Media tab
- **Features**: Filter by type/blogger/date, grudge indicator, views count

**2.13 SentimentChart** - `components/battler/SentimentChart.tsx` (NEW - Grudge System)
- **Purpose**: Visual media sentiment breakdown
- **Status**: Reusable
- **Key Props**: `sentiment`, `narrative`
- **Used In**: `/battler/[id]` Media tab
- **Features**: Positive/neutral/negative bars, narrative summary

### 3. Badge Components (3 components)

**3.1 BadgeCompendium** - `app/badges/page.tsx` (inline component)
- **Purpose**: Displays all 97 badges in grid
- **Status**: Page-specific
- **Key Props**: `badges`, `selectedCategory`
- **Used In**: `/badges`
- **Features**: 3-column grid, tier-colored cards, filters

**3.2 BadgeCard** - `app/badges/page.tsx` (inline component)
- **Purpose**: Individual badge display card
- **Status**: Page-specific
- **Key Props**: `badge`
- **Used In**: `/badges` grid
- **Features**: Name, code, tier, description, effects list

**3.3 BadgeTooltip** - `components/ui/BadgeTooltip.tsx`
- **Purpose**: Hover tooltip for badge chips
- **Status**: Reusable
- **Key Props**: `badge`
- **Used In**: Dashboard, battler stats, badges page
- **Features**: Full effects list, tier indicator, synergies/conflicts

### 4. Notification Components (2 components - Planned)

**4.1 NotificationDropdown** - Planned (not implemented)
- **Purpose**: Header notification dropdown
- **Status**: Not built
- **Key Props**: `notifications`, `onMarkRead`
- **Used In**: Header (all pages)
- **Features**: Offers, battles, news alerts, mark as read

**4.2 NotificationBadge** - Planned (not implemented)
- **Purpose**: Unread count badge
- **Status**: Not built
- **Key Props**: `count`
- **Used In**: Header notification icon
- **Features**: Red badge with number

### 5. Tournament Components (3 components)

**5.1 TournamentList** - `app/tournaments/page.tsx` (inline component)
- **Purpose**: Lists all active tournaments
- **Status**: Page-specific
- **Key Props**: `tournaments`
- **Used In**: `/tournaments`
- **Features**: Tournament cards with entry fee, prize pool, format, dates

**5.2 TournamentCard** - `app/tournaments/page.tsx` (inline component)
- **Purpose**: Individual tournament display
- **Status**: Page-specific
- **Key Props**: `tournament`
- **Used In**: `/tournaments`
- **Features**: Name, status, dates, register button

**5.3 TournamentBracket** - Planned (not implemented)
- **Purpose**: Visual tournament bracket
- **Status**: Not built
- **Key Props**: `tournament`, `matches`
- **Used In**: `/tournaments/[id]`
- **Features**: Bracket tree, match results, standings

### 6. Life Events Components (2 components - Planned)

**6.1 LifeEventModal** - Planned (not implemented)
- **Purpose**: Displays life event with choices
- **Status**: Not built
- **Key Props**: `event`, `onChoose`
- **Used In**: Triggered globally
- **Features**: Event description, 2-3 choice buttons, consequence preview

**6.2 LifeEventTimeline** - Planned (not implemented)
- **Purpose**: Visual timeline of all life events
- **Status**: Not built
- **Key Props**: `events`
- **Used In**: `/battler/[id]` Overview tab
- **Features**: Chronological list, impact indicators

### 7. Grudge/Rivalry Components (2 components - NEW)

**7.1 GrudgeMeter** - `components/battler/GrudgeMeter.tsx` (NEW - Grudge System)
- **Purpose**: Visual intensity bar (0-100 scale)
- **Status**: Reusable
- **Key Props**: `intensity`, `rematchDemand`, `size`
- **Used In**: Rivalry cards, career page, battle offers
- **Features**: Color-coded states (cool/warm/hot/very hot), flame emoji, rematch demand %

**7.2 GrudgeContextPanel** - `app/media/[slug]/page.tsx` (NEW - Grudge System, inline component)
- **Purpose**: Shows rivalry context in battle recap articles
- **Status**: Page-specific
- **Key Props**: `rivalry`
- **Used In**: `/media/[slug]` for grudge match articles
- **Features**: H2H record, intensity, origin, previous coverage links

### 8. UI/Layout Components (12 components)

**8.1 Header** - Used inline across pages
- **Purpose**: Top navigation bar
- **Status**: Page-specific implementations
- **Key Props**: Varies by page
- **Used In**: All pages
- **Features**: Back links, sign out, page titles

**8.2 PageContainer** - Pattern (not component)
- **Purpose**: Standard page layout wrapper
- **Status**: Copy-paste pattern
- **Used In**: All pages
- **Features**: max-w-5xl, mx-auto, px-6, consistent spacing

**8.3 Card** - Pattern (not component)
- **Purpose**: Standard content card
- **Status**: Copy-paste pattern
- **Used In**: Throughout app
- **Features**: bg-zinc-900, border-zinc-800, p-6

**8.4 Button (Primary)** - Pattern (not component)
- **Purpose**: Orange accent button
- **Status**: Copy-paste pattern
- **Used In**: Throughout app
- **Features**: bg-orange-500, hover:bg-orange-600

**8.5 Button (Secondary)** - Pattern (not component)
- **Purpose**: Bordered neutral button
- **Status**: Copy-paste pattern
- **Used In**: Throughout app
- **Features**: border-zinc-700, hover:bg-zinc-900

**8.6 Button (Success)** - Pattern (not component)
- **Purpose**: Green confirmation button
- **Status**: Copy-paste pattern
- **Used In**: Forms, confirmations
- **Features**: bg-green-600, hover:bg-green-700

**8.7 Button (Danger)** - Pattern (not component)
- **Purpose**: Red destructive button
- **Status**: Copy-paste pattern
- **Used In**: Declines, deletions
- **Features**: bg-red-600, hover:bg-red-700

**8.8 StatBar** - Pattern (not component)
- **Purpose**: Progress bar for attributes/stats
- **Status**: Copy-paste pattern
- **Used In**: Attributes, stats displays
- **Features**: Gradient fill, value label, tier indicator

**8.9 StatusBadge** - Pattern (not component)
- **Purpose**: Victory/Defeat/Status indicators
- **Status**: Copy-paste pattern
- **Used In**: Battle results, offers, dashboard
- **Features**: Color-coded (green/red/yellow), uppercase, border

**8.10 TierBadge** - Pattern (not component)
- **Purpose**: Badge tier indicators (Bronze/Silver/Gold)
- **Status**: Copy-paste pattern
- **Used In**: Badges page, badge displays
- **Features**: Tier-colored background/border

**8.11 Modal** - Planned (not implemented)
- **Purpose**: Generic modal overlay
- **Status**: Not built
- **Key Props**: `isOpen`, `onClose`, `title`, `children`
- **Used In**: Life events, confirmations, details
- **Features**: Backdrop, close button, animations

**8.12 Dropdown** - Planned (not implemented)
- **Purpose**: Generic dropdown menu
- **Status**: Not built
- **Key Props**: `options`, `value`, `onChange`
- **Used In**: Filters, selectors
- **Features**: Custom styling, keyboard nav

### 9. Onboarding Components (4 components)

**9.1 IdentityStep** - `components/battler/OnboardingWizard.tsx` (inline)
- **Purpose**: Step 1 - Name and region input
- **Status**: Page-specific
- **Key Props**: `formData`, `onChange`
- **Used In**: Onboarding wizard
- **Features**: Text inputs, validation

**9.2 LeagueStep** - `components/battler/OnboardingWizard.tsx` (inline)
- **Purpose**: Step 2 - League selection
- **Status**: Page-specific
- **Key Props**: `formData`, `onChange`
- **Used In**: Onboarding wizard
- **Features**: Radio cards with league details

**9.3 AttributesStep** - Uses AttributeAllocationStep component
- **Purpose**: Step 3 - Attribute point allocation
- **Status**: Reusable component
- **Key Props**: See AttributeAllocationStep
- **Used In**: Onboarding wizard

**9.4 StylesStep** - `components/battler/OnboardingWizard.tsx` (inline)
- **Purpose**: Step 4 - Style tag selection
- **Status**: Page-specific
- **Key Props**: `formData`, `onChange`
- **Used In**: Onboarding wizard
- **Features**: Multi-select chips, 1-3 selection limit

### 10. Relationships/Grudge Components (3 components - NEW)

**10.1 HeadToHeadRecord** - Planned (Grudge System)
- **Purpose**: Displays H2H battle record between two battlers
- **Status**: Not built
- **Key Props**: `battler1`, `battler2`, `record`
- **Used In**: Career page rivalries tab, battle offers
- **Features**: Win/loss breakdown, last battle, total battles

**10.2 RivalryTimeline** - Planned (Grudge System)
- **Purpose**: Visual timeline of rivalry progression
- **Status**: Not built
- **Key Props**: `rivalry`
- **Used In**: Career page rivalry detail view
- **Features**: Chronological events, battle results, intensity changes, media coverage

**10.3 GrudgeMatchIndicator** - `app/battle/offers/page.tsx` (NEW - Grudge System, inline)
- **Purpose**: Visual treatment for grudge match offers
- **Status**: Page-specific
- **Key Props**: `rivalry`
- **Used In**: Battle offers page
- **Features**: 🔥 icon, intensity display, H2H record, rivalry bonus payout

---

### Component Organization Summary

**Total Components**: 51
- **Implemented & Used**: 23 components
- **Implemented but NOT Used**: 1 component (PostBattleSummary - CRITICAL)
- **Planned (Grudge System - In Progress)**: 11 components
- **Planned (Future Features)**: 16 components

**By Category**:
- Battle: 7 components (5 implemented, 2 planned)
- Battler: 13 components (6 implemented, 7 new for grudge system)
- Badge: 3 components (3 implemented)
- Notification: 2 components (2 planned)
- Tournament: 3 components (2 implemented, 1 planned)
- Life Events: 2 components (2 planned)
- Grudge/Rivalry: 2 components (2 new)
- UI/Layout: 12 components (9 patterns, 2 planned, 1 used)
- Onboarding: 4 components (4 implemented)
- Relationships: 3 components (3 planned)

**Reusability Ratio**: 28 reusable / 23 page-specific

---

## Conclusion

This documentation provides a complete specification for the Battle Rap University UI/UX. The application has a solid foundation with consistent dark theme, well-structured pages, and core functionality.

**Next Steps:**
1. Fix critical issues (PostBattleSummary, light theme pages)
2. Add career stats and notifications
3. Enhance battle offers with opponent info
4. Build prep recommendations
5. Implement life events system
6. Add polish and UX improvements

Follow the priority recommendations and design patterns in this document to ensure consistent, beautiful, and functional UI across the entire application.
