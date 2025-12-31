# UI/UX OVERHAUL MASTER PLAN
## Battle Rap University - Complete Visual Redesign

**Date**: 2025-12-02
**Status**: 🔴 CRITICAL - Current implementation does NOT match mockups
**Priority**: P0 - Complete redesign required

---

## Executive Summary

The current implementation is **functionally complete** but has **ZERO visual alignment** with the mockup designs. The game is supposed to have a **retro gaming/pixel art aesthetic** with character sprites, tournament brackets, badge systems, and rich data visualization. Currently it's just generic text forms.

### Asset Status
✅ **920 character sprites** exist (`sprite_001` to `sprite_880`)
✅ **120+ badge sprites** exist (`badge_001` to `badge_120`)
✅ **130+ crowd reaction sprites** exist and ARE implemented
❌ **Character sprites NOT mapped to battlers**
❌ **Badge sprites NOT integrated into UI**
❌ **Pixel art aesthetic NOT implemented**
❌ **Gaming UI patterns NOT present**

---

## Critical Blockers (Fix First)

### 🔴 BLOCKER #1: Attribute Point Allocation Bug
**Location**: Onboarding > Attributes Step
**Issue**: Templates allocate 59 points, budget is 25 points
**Impact**: Users cannot complete onboarding
**Fix**: See ONBOARDING_TEST_REPORT.md

### 🔴 BLOCKER #2: Missing City Sprites
**Location**: Onboarding > League Selection
**Issue**: 13+ city background images return 404
**Impact**: League cards show broken images
**Fix**: Generate/restore missing city sprites

---

## Design System Overhaul

### Color Palette (From Mockups)

**Background Layers:**
- `bg-primary`: `#18191c` (darkest - main bg)
- `bg-secondary`: `#24262b` (dark - cards/panels)
- `bg-tertiary`: `#2d2f35` (medium - nested cards)

**Accent Colors:**
- `accent-orange`: `#ff8c42` (primary CTA, fire emoji theme)
- `accent-green`: `#4caf50` (positive stats, success)
- `accent-red`: `#f44336` (negative stats, danger)
- `accent-blue`: `#42a5f5` (research, info)
- `accent-purple`: `#ab47bc` (performance, special)
- `accent-yellow`: `#ffeb3b` (writing, creative)

**Text:**
- `text-primary`: `#ffffff` (main text)
- `text-secondary`: `#b0b3b8` (dimmed text)
- `text-tertiary`: `#6b6f76` (labels, placeholders)

**Borders & Highlights:**
- `border-default`: `#3a3d44` (subtle borders)
- `border-highlight`: `#ff8c42` (selected/active)
- `border-tech`: `#00d4ff` (tech/cyber accents)

### Typography (Retro Gaming Style)

**Headers:**
```css
font-family: 'Press Start 2P', 'Courier New', monospace; /* Retro pixel font */
text-transform: uppercase;
letter-spacing: 0.1em;
font-weight: bold;
```

**Body:**
```css
font-family: 'Rajdhani', 'Inter', sans-serif; /* Already installed */
font-weight: 600;
text-transform: uppercase;
```

**Monospace (Stats/Numbers):**
```css
font-family: 'JetBrains Mono', monospace; /* Already installed */
```

### Border & Frame Style

**Tech Corners (Cyber Aesthetic):**
- 45-degree angle cuts on corners
- Gradient borders with orange/blue glow
- Scanline effects on large panels
- Inset borders on cards

**Reference Pattern:**
```html
<div class="tech-border">
  <div class="corner-tl"></div>
  <div class="corner-tr"></div>
  <div class="corner-bl"></div>
  <div class="corner-br"></div>
  <div class="content">...</div>
</div>
```

### Component Patterns

**Card Style:**
- Dark background (#24262b)
- 1-2px border (#3a3d44)
- Subtle inner shadow
- Tech corner accents
- Hover: orange border highlight

**Button Primary (CTA):**
- Orange background (#ff8c42)
- Black text (high contrast)
- All caps, bold
- Slight skew/angle effect
- Hover: lighter orange + glow

**Button Secondary:**
- Dark gray background
- White text
- Border: gray
- Hover: orange border

**Progress Bars:**
- Track: dark gray (#2d2f35)
- Fill: orange gradient
- Height: 8-12px
- Rounded or sharp corners (depends on context)
- Segmented for multi-step flows

**Stat Bars:**
- Color-coded by type:
  - Writing: Orange (#ff8c42)
  - Performance: Purple (#ab47bc)
  - Personal: Blue (#42a5f5)
  - Mental: Green (#4caf50)
- Include tier labels (LOW/MID/TOP/GOD)
- Show current value + tier text

---

## Page-by-Page Redesign Plan

---

## 1. LANDING PAGE

### Current State
- White background
- Generic text: "Algorithm Institute of BattleRap"
- Simple "Get Started" link
- No visual interest

### Mockup Vision (Inferred)
- Dark cyber background with tech patterns
- Animated character sprite showcase
- Tournament bracket tease
- Bold headline with pixel font
- Orange CTA button: "ENTER THE CIRCUIT"

### Implementation Tasks

**Phase 1: Background & Layout**
- [ ] Add dark gradient background (#18191c to #24262b)
- [ ] Add animated tech pattern overlay (CSS or SVG)
- [ ] Center hero content with max-width container
- [ ] Add tech corner borders to main panel

**Phase 2: Hero Content**
- [ ] Change headline font to pixel/retro style
- [ ] Add rotating character sprite carousel (3-5 sprites)
- [ ] Add tagline: "BUILD. BATTLE. DOMINATE."
- [ ] Style CTA button with orange + black text

**Phase 3: Feature Highlights**
- [ ] Add 3-column feature grid below hero
- [ ] Icon + Title + Description for each:
  - 🎮 "SIMULATE BATTLES" - No typing required
  - 🏆 "EARN BADGES" - 97 unique achievements
  - 📊 "TRACK STATS" - Deep career analytics
- [ ] Add pixel art icons/badges for each feature

**Priority**: P1 (High - First impression)

---

## 2. ONBOARDING: WELCOME SCREEN

### Current State
- Dark theme ✅
- Text-heavy explanation
- Two path buttons (Quick Start / Custom Build)
- Generic emoji icons

### Mockup Vision (Not in provided mockups, but inferred)
- Similar to current but with character sprite tease
- More visual hierarchy
- Badge showcase preview

### Implementation Tasks

**Phase 1: Visual Enhancements**
- [ ] Add animated character sprite at top
- [ ] Replace emoji with pixel art icons
- [ ] Add tech borders to path selection cards
- [ ] Improve button hover states (orange glow)

**Phase 2: Content Polish**
- [ ] Add "STEP 0 OF 4" progress indicator at top
- [ ] Highlight key stats in orange text
- [ ] Add badge icon previews in "Career Progression" section

**Priority**: P2 (Medium)

---

## 3. ONBOARDING: TEMPLATE SELECTION

### Current State
- 7 template cards with attribute breakdowns ✅
- Text-based strengths/weaknesses lists
- No visual character previews
- Template selected = checkmark appears

### Mockup Vision (Inferred - not in provided images)
- Each template should show example character sprite
- Badge icons for recommended styles
- Visual attribute bars instead of numbers

### Implementation Tasks

**Phase 1: Template Cards**
- [ ] Add character sprite preview to each template
  - Lyrical Assassin: Sprite with glasses/notebook vibe
  - Performance Beast: Sprite with stage presence pose
  - Versatile Warrior: Neutral balanced sprite
  - Etc.
- [ ] Replace attribute numbers with colored progress bars
- [ ] Add tier labels (LOW/MID/TOP) next to bars

**Phase 2: Visual Feedback**
- [ ] Improve selection state (orange border glow)
- [ ] Add animation when template is selected
- [ ] Show larger sprite preview when hovering

**Priority**: P1 (High - Part of onboarding flow)

---

## 4. ONBOARDING: IDENTITY (STEP 1 OF 4)

### Current State (Mockup Reference)
**From Mockup:**
- Progress bar at top (orange, showing step 1 of 4)
- "STAGE NAME" input field (orange border)
- "REGION" dropdown (East Coast, West Coast, Midwest)
- **PORTRAIT GENERATOR** with character sprite preview
  - Shows full character sprite (Tech Wizard style)
  - Customization buttons below (face, hair, clothes, accessories)
- "NEXT →" button (blue/gray)

### What We Have Now
- Plain text inputs
- No character sprite selector
- No progress bar
- Generic styling

### Implementation Tasks

**Phase 1: Progress Indicator**
- [ ] Add step progress bar at top
  - Format: "ONBOARDING: IDENTITY (STEP 1 OF 4)"
  - Orange fill showing 25% complete
  - Segment labels: IDENTITY | LEAGUE | ATTRIBUTES | STYLES

**Phase 2: Portrait Generator**
- [ ] Create `CharacterSpriteSelector` component
  - Display grid of 20-30 character sprites
  - Allow user to click to select
  - Show selected sprite in large preview (right side)
  - Add customization icons below (for future):
    - 👤 Face
    - 💈 Hair
    - 👕 Outfit
    - 🎩 Accessories
- [ ] Store selected sprite ID in onboarding state
- [ ] Save sprite selection to battler record on creation

**Phase 3: Form Styling**
- [ ] Style input with orange border on focus
- [ ] Make region a proper dropdown (not text input)
  - Options: East Coast, West Coast, South, Midwest, International
- [ ] Improve label typography (all caps, bold)

**Phase 4: Navigation**
- [ ] Style "NEXT →" button with blue-gray bg
- [ ] Add "← BACK" button to return to template selection
- [ ] Disable NEXT until stage name is filled

**Priority**: P0 (CRITICAL - Core onboarding)

---

## 5. ONBOARDING: LEAGUE SELECTION (STEP 2 OF 4)

### Current State (Mockup Reference)
**From Mockup:**
- Progress bar showing step 2 of 4 (50% complete)
- Two large league cards side-by-side:
  - **SMALL ROOM CIRCUIT**
    - Pixel art venue background (intimate stage, purple lights)
    - Text: "Intimate battles. Focus on bars & performance."
  - **MAIN STAGE ARENA**
    - Pixel art venue background (large arena, crowd, lights)
    - Text: "Grand stage. High stakes, media attention."
- Orange border on selected card
- "← BACK" and "NEXT →" buttons

### What We Have Now
- 15 league cards in grid (too many!)
- Missing venue background images (404 errors)
- No pixel art aesthetic
- Small cards with too much text

### Implementation Tasks

**Phase 1: League Consolidation**
- [ ] **DECISION**: Reduce to 2 leagues for onboarding OR keep all 15?
  - Option A: Show only Small Room + Main Stage in onboarding, unlock others later
  - Option B: Keep all 15 but improve presentation
  - **RECOMMENDATION**: Start with 2, unlock others after first battle

**Phase 2: League Card Redesign**
- [ ] Create large 2-column layout (if using 2 leagues)
- [ ] Add pixel art venue backgrounds:
  - Small Room: `/sprites/venues/small-room-purple.png`
  - Main Stage: `/sprites/venues/main-stage-arena.png`
- [ ] Simplify text: Name + 2-line description
- [ ] Add round info: "2-MIN ROUNDS" badge
- [ ] Remove percentages/stats (too detailed for step 2)

**Phase 3: Visual Polish**
- [ ] Add orange border glow on selection
- [ ] Add hover state (border highlight + scale up slightly)
- [ ] Improve card aspect ratio (wider, less tall)

**Phase 4: Missing Sprites**
- [ ] Generate pixel art venue backgrounds for all leagues
  - Use consistent style (isometric or side-view)
  - Color schemes matching league themes
  - Show crowd, stage, lighting
- [ ] Store in `/public/sprites/venues/`

**Priority**: P0 (CRITICAL - Core onboarding + fix 404 errors)

---

## 6. ONBOARDING: ATTRIBUTES (STEP 3 OF 4)

### Current State (Mockup Reference)
**From Mockup:**
- Progress bar showing step 3 of 4 (75% complete)
- **POINTS REMAINING: 25** (in orange at top)
- Three columns: WRITING | PERFORMANCE | PERSONAL
- Each attribute shows:
  - Icon (pixel art: ✏️ lyricism, 💬 wordplay, etc.)
  - Attribute name (all caps)
  - Progress bar (color-coded, showing LOW/MID/TOP tiers)
  - Minus/Plus buttons
- Fourth section: RESILIENCE (single attribute)
- "← BACK" and "NEXT →" buttons

### What We Have Now
- Attributes displayed in categories ✅
- Minus/Plus buttons ✅
- **CRITICAL BUG**: Points show -34 remaining (BLOCKER)
- No progress bars (just numbers)
- No tier labels
- No icons

### Implementation Tasks

**Phase 1: FIX CRITICAL BUG**
- [ ] Debug point allocation formula
- [ ] Verify template definitions total to 25 points
- [ ] Test all 7 templates
- [ ] Fix "Reset to Template" button
- **SEE**: ONBOARDING_TEST_REPORT.md for details

**Phase 2: Visual Redesign**
- [ ] Add pixel art icons for each attribute:
  - ✏️ Lyricism
  - 💬 Wordplay
  - 💡 Creativity
  - 🎵 Flow
  - 🎭 Stage Presence
  - 👥 Crowd Control
  - 🎤 Delivery
  - 💰 Financial
  - ⭐ Reputation
  - 👨‍👩‍👧 Family
  - 🧠 Resilience
- [ ] Replace number display with progress bar
  - Show fill color based on value
  - Add tier label (LOW/MID/TOP/GOD) to right
  - Color-code by category (orange=writing, purple=performance, etc.)

**Phase 3: Layout Improvements**
- [ ] Use 3-column grid (Writing, Performance, Personal)
- [ ] Place Resilience below in its own section
- [ ] Improve spacing and alignment
- [ ] Make +/- buttons larger and easier to click

**Phase 4: Points Display**
- [ ] Move "POINTS REMAINING" to top center (large, orange)
- [ ] Add warning if over budget (red text)
- [ ] Disable NEXT button if not exactly 0 remaining

**Priority**: P0 (CRITICAL - Blocking onboarding + major bug)

---

## 7. ONBOARDING: DEFINE YOUR STYLE (STEP 4 OF 4)

### Current State (Mockup Reference)
**From Mockup:**
- Progress bar showing step 4 of 4 (100% complete)
- **SELECTED STYLES: 0/3** (in orange at top)
- Grid of style badges:
  - 💬 WORDPLAY
  - 🎯 ANGLES
  - 🗣️ STORYTELLING
  - 〰️ FLOW
  - ⚔️ AGGRESSION
  - 😂 COMEDY
  - 🔁 REBUTTALS
  - 🧩 SCHEMES
- Each badge is a rounded rect with icon + text
- Selected badges have orange border glow
- "← BACK" and "CREATE BATTLER" buttons

### What We Have Now
- Style selection exists in template flow? (need to verify)
- Likely text-based, no badge UI

### Implementation Tasks

**Phase 1: Badge Grid**
- [ ] Create grid layout (4 columns, 2 rows)
- [ ] Design badge cards:
  - Icon (emoji or pixel art)
  - Style name (all caps, bold)
  - Background: dark gray (#2d2f35)
  - Border: subtle gray
- [ ] Add selection state (orange border + glow)
- [ ] Enforce 3-style maximum

**Phase 2: Style Definitions**
- [ ] Map styles to badge effects from CLAUDE.md
- [ ] Show tooltip on hover explaining style benefits
- [ ] Add visual feedback (checkmark on selected badges)

**Phase 3: Final Step**
- [ ] Change button from "NEXT" to "CREATE BATTLER"
- [ ] Make button large, orange, prominent
- [ ] Disable until exactly 3 styles selected
- [ ] Add loading state on click (sprite animation?)

**Priority**: P1 (High - Completes onboarding flow)

---

## 8. DASHBOARD

### Current State (Mockup Reference)
**From Mockup:**
- **Top Left**: Character card showing:
  - Large character sprite (Tech Wizard)
  - Name: "TECH WIZARD"
  - ELO: 1265
  - Region: East Coast | Small Room Circuit | Mid Tier
  - **Stats Grid**: 4 columns (WRITING: 8.0, PERFORMANCE: 6.0, PERSONAL: 6.5, MENTAL: FOCUSED)

- **Top Right**: Active Battles section:
  - Shows upcoming battle: "TECH WIZARD vs YOUNG PATTERN"
  - Character sprites head-to-head
  - "PREP NOW" button (orange)

- **Middle**: Battle Offers (3 OFFERS):
  - Shows placeholder buttons

- **Middle**: Active Rivalries:
  - "🔥 YOUNG PATTERN - Intensity 85/100 (HOT)"

- **Bottom**: Recent Battles:
  - List of past battles with results
  - "TECH WIZARD  15 / ↑3"
  - "YOUNG PATTERN  2 - 1"
  - "TECH WIZARD  01 / -2"

- **Bottom**: Recent Headlines:
  - Media recap articles with icons

### What We Have Now
- Dashboard exists with stats
- Probably missing character sprite
- Missing visual hierarchy from mockup
- No rivalry section

### Implementation Tasks

**Phase 1: Character Card (Top Left)**
- [ ] Add large character sprite (from selected sprite in onboarding)
- [ ] Display battler name in pixel font
- [ ] Show ELO rating prominently
- [ ] Add region/league/tier info
- [ ] Create stats grid with color-coded columns:
  - WRITING (orange): avg of lyricism/wordplay/creativity/flow
  - PERFORMANCE (purple): avg of stage/crowd/delivery
  - PERSONAL (blue): avg of financial/reputation/family
  - MENTAL (green): resilience-based label (FOCUSED, SHAKY, etc.)

**Phase 2: Active Battles (Top Right)**
- [ ] Show next scheduled battle
- [ ] Display both battler sprites head-to-head (vs icon between)
- [ ] Add "PREP NOW" button (orange, prominent)
- [ ] Show countdown to battle date

**Phase 3: Battle Offers**
- [ ] Keep existing functionality
- [ ] Add character sprites to offers
- [ ] Improve offer cards with tech borders
- [ ] Add visual indicators (⚡ medium, 🔥 high difficulty)

**Phase 4: Active Rivalries**
- [ ] Add "Active Rivalries" section
- [ ] Show rival sprite + name
- [ ] Display intensity meter (0-100) with fire emoji
- [ ] Color-code: <50 = warm, 50-75 = hot, >75 = VERY HOT
- [ ] Link to rivalry history

**Phase 5: Recent Battles**
- [ ] Add character sprites to battle history
- [ ] Show score: "2 - 1 (VICTORY)"
- [ ] Color-code result (green = win, red = loss)
- [ ] Add rating change: "+25 ELO ↑"

**Phase 6: Recent Headlines**
- [ ] Keep existing news feed
- [ ] Add blogger icons (🔥 Battle Eyez, etc.)
- [ ] Add article category badges

**Priority**: P0 (CRITICAL - Main hub after onboarding)

---

## 9. BATTLE OFFERS PAGE

### Current State (Mockup Reference)
**From Mockup:**
- **Regular Battle Offer Card:**
  - Battle icon (⚔️)
  - "YOUNG PATTERN - MID TIER ⚡ MEDIUM"
  - Character sprite icon
  - "Rating: 1250 (+50 vs You)"
  - 📍 Small Room Circuit
  - ⏱️ 2-min rounds (4 segments/round)
  - 📅 Scheduled: Dec 15, 2025
  - 🔒 Prep Locks: Dec 10, 2025
  - ⏳ Prep Window: 10 days
  - 💰 POTENTIAL EARNINGS:
    - Base Pay: $500
    - Win Bonus: $1,200
    - Total: $1,700
  - Opponent Style: Angles, Storytelling
  - Recent Record: 3-2 (Last 5)
  - Buttons: "VIEW PROFILE" | "ACCEPT ✓" | "DECLINE ✗"

- **Grudge Match Offer:**
  - Same layout but with 🔥 GRUDGE MATCH header (orange)
  - Higher intensity shown: "🔥 GRUDGE INTENSITY: 82/100"
  - "Origin: Controversial decision sparked beef"
  - Higher earnings: $2,100 total with rivalry bonus
  - "⚠️ STAKES: High intensity + media attention!"
  - "RECENT AV 3/IN 50%:" indicators

- **With Prep Assistant:**
  - Right sidebar shows:
    - "💡 PREP ASSISTANT"
    - "Based on Tech Writer vs Angles:"
    - "✓ Focus on WRITING (5-7 days) → Boost lyricism"
    - "⚠️ Consider 2+ RESEARCH days"
    - "PREDICTED IMPACT:"
    - Lyricism: +1.5
    - Flow: +1.2
    - Stress: 45 → 55
    - "APPLY RECOMMENDED PLAN" button

- **Rivalry History Modal:**
  - "🔥 RIVALRY HISTORY: TECH WIZARD vs YOUNG PATTERN"
  - 💀 Head-to-Head: 1-0 (You Lead)
  - 🔥 Intensity: 82/100 (Hot)
  - 📰 DEC 15, 2025: Controversial 2-1 Win (You) • 3 Media Articles
  - 📰 DEC 10, 2025: Online Trash Talk • 1 Article
  - 🔥 FAN SENTIMENT: 70% Demand Rematch
  - "CLOSE ✗" button

### What We Have Now
- Battle offers list exists
- Probably missing character sprites
- Missing grudge match differentiation
- No prep assistant
- No rivalry context

### Implementation Tasks

**Phase 1: Offer Card Redesign**
- [ ] Add character sprite to each offer (opponent portrait)
- [ ] Improve visual hierarchy:
  - Large opponent name at top
  - Tier + difficulty badges
  - Location, format, dates in grid layout
- [ ] Style potential earnings section:
  - Use gold coin emoji 💰
  - Highlight total in larger font
  - Color-code: green for base/bonus, orange for total

**Phase 2: Grudge Match Treatment**
- [ ] Add special card border for grudge matches (orange glow + fire pattern)
- [ ] Show 🔥 GRUDGE MATCH banner at top
- [ ] Display intensity meter (0-100 scale with fire emojis)
- [ ] Show grudge origin text
- [ ] Add rivalry bonus to earnings breakdown
- [ ] Add "⚠️ STAKES:" section

**Phase 3: Prep Assistant**
- [ ] Create sidebar component
- [ ] Show recommended prep strategy based on:
  - Player's strengths vs opponent's weaknesses
  - Available prep days
  - Stress management
- [ ] Display predicted impact on attributes:
  - Green bars for positive gains
  - Red bars for stress increase
- [ ] Add "APPLY RECOMMENDED PLAN" button
  - Pre-fills prep calendar when clicked

**Phase 4: Rivalry History**
- [ ] Add "VIEW RIVALRY HISTORY" button (opens modal)
- [ ] Show head-to-head record with win/loss icons
- [ ] Display intensity meter
- [ ] List previous encounters with:
  - Date
  - Result (score)
  - Media coverage count
  - Key events (trash talk, controversial decision, etc.)
- [ ] Show fan sentiment percentage

**Phase 5: Action Buttons**
- [ ] Redesign button layout:
  - "VIEW PROFILE" (secondary, gray)
  - "ACCEPT ✓" (primary, green)
  - "DECLINE ✗" (danger, red)
- [ ] Add hover states with glow effects
- [ ] Disable buttons during API calls (loading state)

**Priority**: P1 (High - Key decision point for players)

---

## 10. BATTLE PREP CALENDAR

### Current State (Mockup Reference)
**From Mockup (4 variations shown):**

**A. Empty Calendar:**
- Header: "← DASHBOARD | BATTLE PREP"
- Character sprites head-to-head at top (Tech Wizard vs Young Pattern)
- "BATTLE INFO" card:
  - Names, league, date, format
- "PREP RECOMMENDATIONS":
  - 📝 Focus on WRITING (5-7 days)
  - 💤 Include 2-3 REST days
  - "APPLY PLAN" button
- Calendar grid (days of week columns)
  - Empty cells with dropdown selectors
- "FOCUS LEGEND" at bottom:
  - 🔬 RESEARCH (green)
  - ✍️ WRITING (orange)
  - 🎭 PERFORMANCE (purple)
  - 💜 LIFE (pink)
  - 💤 REST (blue)

**B. Filled Calendar (Pre-lock):**
- Same layout
- Calendar cells filled with colored activity blocks
- Dropdowns still active
- "IMPACT PREVIEW" sidebar added:
  - LYRICISM: +1.2 (green bar)
  - FLOW: +0.8 (green bar)
  - STRESS: 45 → 58 (red bar)
- "✓ SAVE & RETURN" button (orange)

**C. Filled Calendar (View Only):**
- Same as B but:
  - Shows icons in calendar cells (🔬, ✍️, 🎭, 💜, 💤)
  - Icons have colored backgrounds
  - Impact preview still visible
  - "SAVE & RETURN" button present

**D. Locked Calendar:**
- Same layout
- Large "LOCKED" overlay with padlock icon 🔒
- Text: "PREP COMPLETE. LOCKS DEC 10."
- Calendar cells grayed out, no interaction
- "PREP STATUS: READY" badge (green)

### What We Have Now
- Prep calendar exists
- Functional auto-save
- Probably missing sprites
- Missing visual polish
- Missing impact preview

### Implementation Tasks

**Phase 1: Header & Battle Info**
- [ ] Add character sprites head-to-head at top
- [ ] Style "BATTLE PREP" title with pixel font
- [ ] Improve battle info card:
  - Use tech border frame
  - Display league logo/icon
  - Show countdown to battle
  - Show prep lock date prominently

**Phase 2: Calendar Grid**
- [ ] Redesign calendar layout:
  - Larger cells (easier to click)
  - Days of week as column headers
  - Week numbers or dates as row labels
- [ ] Style dropdowns:
  - Remove default dropdown styling
  - Use custom select with color-coded options
  - Show activity icon + name in dropdown
- [ ] Add visual feedback when cell is filled:
  - Background color matches activity type
  - Show icon prominently
  - Disable dropdown styling (show as badge)

**Phase 3: Focus Legend**
- [ ] Redesign legend as horizontal bar at bottom
- [ ] Use large, clear icons:
  - 🔬 RESEARCH (green #4caf50)
  - ✍️ WRITING (orange #ff8c42)
  - 🎭 PERFORMANCE (purple #ab47bc)
  - 💜 LIFE (pink #e91e63)
  - 💤 REST (blue #42a5f5)
- [ ] Add short descriptions below each

**Phase 4: Impact Preview Sidebar**
- [ ] Create sticky sidebar on right
- [ ] Show real-time preview as user fills calendar:
  - Calculate attribute gains based on selected activities
  - Show stress accumulation
  - Update immediately on change
- [ ] Display as progress bars:
  - Green bars for positive gains (writing attributes, performance)
  - Red bar for stress increase
  - Show before → after values

**Phase 5: Prep Recommendations**
- [ ] Style recommendations card:
  - Use bullet list with checkmarks/warnings
  - Color-code suggestions
  - Show reasoning (e.g., "Based on opponent's strength in X")
- [ ] Add "APPLY RECOMMENDED PLAN" button
  - Fills entire calendar automatically
  - Shows confirmation modal before applying
  - Preserves ability to edit after applying

**Phase 6: Locked State**
- [ ] Create locked overlay component:
  - Semi-transparent dark backdrop
  - Large padlock icon 🔒
  - Text: "PREP COMPLETE. LOCKS [DATE]."
  - Disable all interactions
- [ ] Show "PREP STATUS: READY" badge (green)
- [ ] Keep impact preview visible (show final values)

**Phase 7: Save & Return**
- [ ] Style button as large orange CTA at bottom
- [ ] Add checkmark icon: "✓ SAVE & RETURN"
- [ ] Show toast notification on save success
- [ ] Auto-save on navigation away (with confirmation if unsaved changes)

**Priority**: P1 (High - Core gameplay loop)

---

## 11. BATTLE RESULTS

### Current State (Mockup Reference)
**From Mockup:**
- Header: "← [BACK BUTTON] | BATTLE RESULTS"
- **Top Section: Score Display**
  - Left: "TECH WIZARD" with character sprite
  - Center: "2 - 1" (large, bold) with "YOUNG PATTERN" sprite
  - Score: "Score: 2-1 (VICTORY)" in green
  - "PostBattleSummary" label

- **PostBattleSummary Card:**
  - 🏅 "+25 Rating"
  - ✍️ "Writing: +0.5"
  - 🏆 "Master Wordsmith Badge Earned"

- **Battle Payout:**
  - 💰 "BATTLE PAYOUT: $1,900 Total"

- **Round-by-Round Stats Table:**
  - Columns: 1, 2, 3, 4
  - Rows:
    - Writing: 8.00, 8.00, 8.00, 8.00
    - Performance: +0.05, +0.05, +0.23, +0.65
    - Personal: 6.5, 6.0, 6.5, 6.5
    - Mental: 88.6%, 83.6%, 59.9%, 83.9%

- **Segment Timeline:**
  - Visual timeline showing segment performance
  - Color-coded bars (green = good, red = bad)
  - Segments labeled

- **Media Recap:**
  - Link: "https://lpsum Small Roomspers Circuit lit in article"

### What We Have Now
- Battle results page exists
- PostBattleSummary component EXISTS but may not be used
- Segment timeline may be present
- Likely missing character sprites
- Missing visual polish

### Implementation Tasks

**Phase 1: Score Header**
- [ ] Add character sprites head-to-head
  - Winner on left (larger, highlighted)
  - Loser on right (smaller, dimmed)
- [ ] Style score display:
  - Large "2 - 1" in center
  - Color-code winner's score (green)
  - Add "VICTORY" or "DEFEAT" label
  - Use pixel font for drama

**Phase 2: PostBattleSummary Integration**
- [ ] Verify PostBattleSummary component is rendered
- [ ] Style as prominent card below score
- [ ] Show:
  - Rating change with +/- and arrow (↑/↓)
  - Attribute gains (color-coded progress bars)
  - Badges earned (show badge sprite + name)
  - Stress change (if applicable)
- [ ] Add celebration animation if badge earned

**Phase 3: Battle Payout**
- [ ] Create payout card
- [ ] Show breakdown:
  - Base pay: $X
  - Win bonus: $X (if won)
  - Rivalry bonus: $X (if grudge match)
  - Total: $X,XXX (large, bold, orange)
- [ ] Add coin emoji 💰

**Phase 4: Round Stats Table**
- [ ] Redesign as clean data table:
  - Header: Round 1, Round 2, Round 3
  - Rows: Writing, Performance, Personal, Mental
  - Color-code cells by value (heatmap style)
  - Highlight winner's rows in each round
- [ ] Add column for "Winner" (checkmark or crown icon)

**Phase 5: Segment Timeline**
- [ ] Create visual timeline component
- [ ] Show segments as vertical bars:
  - Height = performance score
  - Color = player (you vs opponent, alternating)
  - Hover shows exact score + segment number
- [ ] Add peak moment indicators (⭐ for haymakers)
- [ ] Show choke/stumble events (💀 for chokes)

**Phase 6: Media Recap**
- [ ] Add media section at bottom
- [ ] Show article card with:
  - Blogger name + icon
  - Article headline
  - Publication date
  - View count / read time
- [ ] Link to full article page

**Priority**: P1 (High - Reward/feedback after battle)

---

## 12. BATTLER CAREER PAGE

### Current State (Mockup Reference)
**From Mockup:**
- Header: "← [BACK] | BATTLER CAREER: TECH WIZARD"
- **Tabs**: OVERVIEW | BATTLES | RIVALRIES | MEDIA

**OVERVIEW Tab:**
- **Career Summary Card:**
  - Total Battles: 15
  - Win Rate: 73%
  - "PERFORMANCE TREND" graph (line chart showing improvement over time)

**RIVALRIES Tab:**
- Character sprite card showing:
  - 🔥 "YOUNG PATTERN"
  - "Intensity: 85/100"
  - "Record: 2-3"
  - "MEDIA:" with article links

**MEDIA Tab:**
- List of related media articles

- **Earned Badges Section:**
  - Grid of badge icons (circular, gold/silver/bronze)
  - Shows: Punchline King, Comeback King, etc.
  - Some badges have checkmarks (earned)

### What We Have Now
- Battler profile page may exist
- Probably missing character sprite
- Missing badges grid
- Missing career stats visualization

### Implementation Tasks

**Phase 1: Header**
- [ ] Add character sprite (large) at top left
- [ ] Display battler name in pixel font
- [ ] Show career badges count: "15 BADGES EARNED"
- [ ] Add edit button (for player's own battler)

**Phase 2: Overview Tab**
- [ ] Create career summary cards:
  - Total Battles (number + icon)
  - Win Rate (percentage + color-coded)
  - Current Streak (W/L count)
  - Peak Rating (highest ELO)
- [ ] Add performance trend graph:
  - Use Recharts (already installed)
  - Line chart showing rating over time
  - X-axis: battles or dates
  - Y-axis: rating
  - Highlight wins/losses with colored dots

**Phase 3: Battles Tab**
- [ ] List all battles chronologically
- [ ] Each battle shows:
  - Opponent sprite + name
  - Result (score + W/L)
  - League + date
  - Rating change
- [ ] Filter options: All / Wins / Losses / Grudge Matches

**Phase 4: Rivalries Tab**
- [ ] List all rivalries
- [ ] Each rivalry shows:
  - Rival sprite + name
  - Intensity meter (0-100 with fire emoji)
  - Head-to-head record
  - Last encounter date
  - Link to rivalry history
- [ ] Sort by intensity (hottest first)

**Phase 5: Earned Badges**
- [ ] Create badge grid (4-5 columns)
- [ ] Show earned badges with:
  - Badge sprite (circular, color-coded by tier)
  - Badge name below
  - Hover shows badge description + effects
- [ ] Gray out unearned badges (silhouette)
- [ ] Link to Badge Compendium for full list

**Phase 6: Media Tab**
- [ ] List all articles mentioning this battler
- [ ] Filter by article type:
  - Battle Recaps
  - Career Updates
  - Scandals
  - Grudge Matches
- [ ] Sort by date (newest first)

**Priority**: P2 (Medium - Profile page)

---

## 13. BADGE COMPENDIUM

### Current State (Mockup Reference)
**From Mockup:**
- Header: "← DASHBOARD | BADGE COMPENDIUM"
- **Top**: "PERSONAL BADGES (5/∞)"
  - Shows 5 earned badges (circular, gold)
  - Checkmarks below each
  - "Archetype: Technical Writer" label

- **Filters**:
  - Tabs: All | Writing | Performance | Content | Delivery | Reputation+ | Reputation-

- **Badge Grid**:
  - Shows badges in grid (4-5 per row)
  - Each badge shows:
    - Circular icon (gold/silver/bronze)
    - Badge name (e.g., "MASTER WORDSMITH (Gold)")
    - Short description
    - "EFFECTS:" list with stat bonuses
  - Selected badge highlights

- **Badge Detail Modal:**
  - Large badge icon at top
  - "⚔️ MASTER WORDSMITH (Gold)"
  - "Exceptional wordplay and double entendres that captivate judges"
  - "EFFECTS:"
    - ▸ +15% wordplay skill
    - ▸ +10% creativity
    - ▸ +5% crowd reaction on haymakers
  - "SYNERGIES WITH:"
    - ✓ Punchline King (+5% combined)
    - ✓ Technical Writer (+3% flow)
  - "CONFLICTS WITH:"
    - ✗ Freestyler (-10% consistency)
  - "HOW TO EARN:"
    - "Win 5 battles with 8+ wordplay"
  - Character sprites shown at bottom (battlers with this badge)

### What We Have Now
- Badge definitions exist in code (97 badges in badges.ts)
- Badge sprites exist (120 PNG files)
- Badge system implemented in database
- UI probably doesn't exist or is basic

### Implementation Tasks

**Phase 1: Personal Badges Section**
- [ ] Show player's earned badges at top
- [ ] Display badge sprites (circular, color-coded)
- [ ] Show checkmarks below earned badges
- [ ] Display archetype label (based on badge combination)
- [ ] Show count: "PERSONAL BADGES (X/97)"

**Phase 2: Filter Tabs**
- [ ] Create filter tabs:
  - All
  - Writing
  - Performance
  - Content
  - Delivery
  - Reputation+ (positive)
  - Reputation- (negative)
- [ ] Apply filter to badge grid

**Phase 3: Badge Grid**
- [ ] Create grid layout (4-5 badges per row)
- [ ] For each badge show:
  - Badge sprite (use actual PNG from /sprites/badges/)
  - Badge name + tier (Gold/Silver/Bronze)
  - Short description (1 line)
  - "EFFECTS:" with 1-2 key bonuses
- [ ] Style earned badges differently:
  - Full color + glow
  - Checkmark icon
- [ ] Style unearned badges:
  - Grayscale + dimmed
  - Show "LOCKED" or progress bar

**Phase 4: Badge Detail Modal**
- [ ] Open modal on badge click
- [ ] Show large badge icon at top
- [ ] Display full description
- [ ] List all effects with bullets
- [ ] Show synergies (other badges that combine well)
- [ ] Show conflicts (badges that don't stack well)
- [ ] Show earning requirements (clear, actionable)
- [ ] List battlers who have this badge (sprites + names)

**Phase 5: Badge Sprites Integration**
- [ ] Map badge IDs to sprite files
  - Create mapping: `badge_001.png` → "Master Wordsmith"
  - Store in `lib/game/badgeSprites.ts`
- [ ] Load badge sprites dynamically
- [ ] Add fallback for missing sprites (emoji icon)

**Priority**: P2 (Medium - Engagement feature)

---

## 14. TOURNAMENT SYSTEM

### Current State (Mockup Reference)
**From Mockup (Page 1 - 4 screens):**

**A. Tournament List:**
- Header: "ALGORITHM INSTITUTE | TOURNAMENTS"
- Tabs: ALL | OPEN | INVITATIONAL
- **Tournament Cards:**
  - "CHAMPION'S CIRCLE GRAND PRIX"
    - Logo (diamond badge)
    - Dates: Dec 15 - Jan 10
    - Prize Pool: $50,000
    - Entry Fee: $2,000
    - Status: OPEN FOR REGISTRATION
    - "REGISTER NOW" button (orange)
  - "SMALL ROOM CIRCUIT SHOWDOWN"
    - Logo (diamond badge)
    - Prize Pool: $5,000
    - Entry Fee: $500
    - Status: UPCOMING
- **Upcoming Deadlines sidebar:**
  - Lists upcoming registration deadlines
- **Recent Winners sidebar:**
  - Shows past tournament winners with sprites

**B. Tournament Detail (Registration):**
- Header: "← BACK TO TOURNAMENTS | SMALL ROOM CIRCUIT SHOWDOWN"
- **Tournament Info:**
  - Dates: Dec 15 - Jan 10
  - Format: SINGLE ELIMINATION
  - Rules: 2-MIN ROUNDS, 3 ROUNDS
- **Participating Battlers:**
  - Grid of 8 character sprites
  - Names below: SWRMY, SHARRER, NKARLA, BRUKE1, etc.
- "REGISTRATION FEE: $500"
- "CONFIRM REGISTRATION" button (blue)

**C. My Tournaments:**
- Header: "ALGORITHM INSTITUTE | MY TOURNAMENTS"
- Tabs: ACTIVE | COMPLETED | WATCHLIST
- **Active Tournament Card:**
  - "CHAMPION'S CIRCLE GRAND PRIX"
  - Status: IN PROGRESS
  - Prize Pool: $50,000
  - Entry Fee: $2,000
  - Status: OPEN FOR REGISTRATION
  - Buttons: "IN PROGRESS" | "VIEW BRACKET"
- **Upcoming Tournament:**
  - "SMALL ROOM CIRCUIT SHOWDOWN"
  - Registered, starts Dec 15
  - Entry: $500
  - Status: UPCOMING
- **History:**
  - "ROYAL MASSACRE 2025 - QUARTERFINALIST"

**D. Tournament Bracket:**
- Header: "← BACK | CHAMPION'S CIRCLE GRAND PRIX - BRACKET"
- **Bracket Display:**
  - Shows single-elimination bracket
  - Character sprites in each slot
  - Scores shown: "2-1", "3-0"
  - Connecting lines between matches
  - Current round highlighted: "QUARTERFINALS"
- **Leaderboard (right sidebar):**
  - 1. BATTLE RAP (357 pts)
  - 2. ATLANTA (236 pts)
  - 3. NEW KAODR (105 pts)
  - 4. CLEVELAND (90 pts)

### What We Have Now
- Tournament system implemented in database
- Bracket generation, seeding, judging all coded
- UI probably doesn't exist

### Implementation Tasks

**Phase 1: Tournament List Page**
- [ ] Create tournament grid/list view
- [ ] Show tournament cards with:
  - Tournament logo (circular badge)
  - Name + subtitle
  - Dates
  - Prize pool (large, orange text)
  - Entry fee
  - Status badge (open/upcoming/in progress)
  - Participant count
- [ ] Add filter tabs (All, Open, Invitational)
- [ ] Add search bar
- [ ] Style "REGISTER NOW" button prominently

**Phase 2: Tournament Detail Page**
- [ ] Show tournament header with logo + name
- [ ] Display tournament info grid:
  - Format (single elim, double elim, etc.)
  - Dates (start - end)
  - Rules (round length, rounds per match)
  - Prize distribution
- [ ] Show registered participants:
  - Grid of character sprites
  - Names below sprites
  - Total count
- [ ] Add registration section:
  - Entry fee (large text with 💰)
  - "CONFIRM REGISTRATION" button
  - Show balance after fee deduction
- [ ] Show tournament rules/details (expandable section)

**Phase 3: My Tournaments Page**
- [ ] Create tabs: Active, Completed, Watchlist
- [ ] Show player's registered tournaments
- [ ] For active tournaments:
  - Show status (waiting/in progress)
  - Next match info if applicable
  - "VIEW BRACKET" button
- [ ] For completed tournaments:
  - Show final placement
  - Prize winnings
  - Link to bracket view

**Phase 4: Bracket View**
- [ ] Create bracket visualization component
  - Use SVG or Canvas for lines
  - Position character sprites in slots
  - Show scores between sprites
  - Highlight current round
  - Gray out eliminated battlers
- [ ] Make bracket interactive:
  - Click match to see details
  - Hover sprite to see battler info
- [ ] Add leaderboard sidebar (for point-based tournaments)

**Phase 5: Character Sprites in Brackets**
- [ ] Load battler sprites dynamically for all participants
- [ ] Show sprite + name in each bracket slot
- [ ] Add visual states:
  - Active (full color)
  - Eliminated (grayscale + dimmed)
  - Current match (highlighted border)
  - Winner (crown icon or glow)

**Priority**: P2 (Medium - Major feature but not core loop)

---

## 15. MEDIA HUB & ARTICLES

### Current State (Mockup Reference)
**From Mockup:**

**A. Media Hub:**
- Header: "ALGORITHM INSTITUTE | MEDIA HUB"
- **Featured Story:**
  - Large card with character sprites
  - "🔥 FEATURED STORY:"
  - "UPSET OF THE YEAR: ROOKIE TAKES DOWN TOP-RANKED VETERAN"
  - Carousel dots below (pagination)
- Search bar
- Filter tabs: ALL | BATTLE RECAPS | SCANDALS | CAREER UPDATES | LEAGUE UPDATES | 🔥 RIVALRIES
- **Article Cards Grid:**
  - Each card shows:
    - Thumbnail image (character sprites or venue)
    - Category tag: [Battle Recap], [Grudge Match], [Career Update], [Scandal]
    - Title
    - Byline: "By [Blogger] • Dec 15, 2025 • 5 min read • 234 views"
    - Short excerpt

**B. Article Detail:**
- Header: "← BACK TO MEDIA | ARTICLE DETAIL"
- **Article Header:**
  - Badge/logo
  - Category: [BATTLE RECAP]
  - Title: "UPSET OF THE YEAR: ROOKIE TAKES DOWN VETERAN"
  - Byline: "By AIBR Media • Dec 15, 2025 • 5 min read • 234 views"

- **Rivalry Context Box (orange border):**
  - "🔥 RIVALRY CONTEXT:"
  - "This battle is part of the ongoing rivalry between [Battler A] and [Battler B]."
  - "Head-to-Head: 2-1 ([Battler A] leads)."
  - "Grudge Intensity: 87/100 (Very Hot)"
  - "Origin: Controversial decision sparked beef"
  - "Previous Coverage: [link] [link]"
  - "VIEW FULL RIVALRY HISTORY →"

- **Article Body:**
  - Character sprites shown inline
  - Blockquotes for key moments
  - "VIEW BATTLE BREAKDOWN" button (orange)
  - Social share buttons at bottom
  - "READ NEXT:" section with related articles

### What We Have Now
- Media generation system implemented
- Articles stored in database
- Basic article list/detail pages exist
- Missing visual polish

### Implementation Tasks

**Phase 1: Media Hub Redesign**
- [ ] Add featured story carousel at top:
  - Large card with character sprites
  - Article headline
  - Carousel pagination dots
  - Auto-rotate every 5 seconds
- [ ] Style search bar with icon
- [ ] Improve filter tabs:
  - Add icons to each category
  - Highlight active tab (orange underline)
  - Show article count per category
- [ ] Redesign article cards:
  - Add thumbnail image (character sprites or venue)
  - Show category badge (color-coded)
  - Improve typography (headline, byline, excerpt)
  - Add hover effect (scale up + glow)

**Phase 2: Article Detail Page**
- [ ] Improve article header:
  - Show blogger icon/logo
  - Style category badge
  - Larger headline font (pixel style)
  - Better byline formatting
- [ ] Add character sprites to article body:
  - Show sprites of mentioned battlers
  - Link sprites to battler profiles
- [ ] Style blockquotes (for key moments/quotes)
- [ ] Add "VIEW BATTLE BREAKDOWN" CTA button
  - Links to battle results page

**Phase 3: Rivalry Context Box**
- [ ] Create special callout box for grudge match articles
- [ ] Show orange border + fire icon
- [ ] Display:
  - Rivalry intensity meter
  - Head-to-head record
  - Origin story
  - Links to previous coverage
  - "VIEW FULL RIVALRY HISTORY" link
- [ ] Only show for articles tagged as grudge matches

**Phase 4: Related Articles**
- [ ] Add "READ NEXT:" section at bottom
- [ ] Show 3-4 related articles based on:
  - Same battler(s)
  - Same category
  - Same time period
- [ ] Use horizontal card layout

**Phase 5: Social Features**
- [ ] Add social share buttons (Twitter, Facebook, copy link)
- [ ] Add view count
- [ ] Add "bookmark" feature (save article to read later)

**Priority**: P2 (Medium - Content layer)

---

## 16. FINANCES PAGE

### Current State (Mockup Reference)
**From Mockup:**
- Header: "← BACK | FINANCES | TECH WIZARD"
- **Three Big Cards (Top Row):**
  - "CURRENT BALANCE: $12,450" (green)
  - "LIFETIME EARNINGS: $34,200" (orange)
  - "BATTLE EARNINGS: $28,500" (blue)

- **Left Column:**
  - "EARNINGS BREAKDOWN" (horizontal bar chart):
    - Win Bonuses (green bar)
    - Base Pay (orange bar)
    - Tournament Prizes (blue bar)
  - "RECENT TRANSACTIONS":
    - 🏆 Dec 15 - Battle Win Bonus (+$1,200)
    - 🏆 Dec 14 - Battle Win Bonus (+$1,200)
    - 🏆 Dec 13 - Battle Win Bonus (+$1,200)
    - 🛡️ Dec 10 - Tournament Entry Fee (-$500)
    - 🏆 Dec 10 - Battle Win Bonus (+$200)

- **Right Column (Top):**
  - "EARNINGS OVER TIME" (line graph):
    - Shows cumulative earnings growth over time
    - Blue line trending upward

- **Right Column (Bottom):**
  - "FINANCIAL GOALS":
    - "Current: $5,000 / $10,000"
    - Progress bar (50% filled, green)
    - "Save for training upgrade"

- **Bottom Screens:**
  - "TRANSACTION HISTORY" (filterable table):
    - Dropdown: [Last 7 days] [All Types]
    - Min/Max amount filters
    - Search bar
    - Table rows:
      - 🏆 Dec 15 - Battle Win (+$1,200) → +$1,200
      - 🛡️ Dec 14 - League Fee (-$1,100) → -$500
      - 👕 Dec 13 - Battle Win (+$1,200) → -$200
      - ... etc.

  - "EARNINGS BREAKDOWN" (detailed):
    - Three sections:
      - Win Bonuses (green bar) - largest
      - Base Pay (orange bar) - medium
      - Tournament Prizes (blue bar) - smallest

  - "YOUR EARNINGS vs LEAGUE" (comparison):
    - "Your avg/battle: $1,200" (green, largest text)
    - "League avg: $950" (orange, medium text)
    - "Top earner this month: $15,000" (blue, large text)
    - Download CSV, PDF, Email statement buttons

### What We Have Now
- Financial system implemented in database
- Transactions tracked
- Balance calculations working
- UI probably basic or missing

### Implementation Tasks

**Phase 1: Balance Cards (Top Row)**
- [ ] Create three large stat cards:
  - Current Balance (green accent)
  - Lifetime Earnings (orange accent)
  - Battle Earnings (blue accent)
- [ ] Style with large numbers (pixel font)
- [ ] Add icons (💰, 📈, ⚔️)
- [ ] Show change from last period ("+$1,200 this week")

**Phase 2: Earnings Breakdown (Left)**
- [ ] Create horizontal bar chart:
  - Win Bonuses (green)
  - Base Pay (orange)
  - Tournament Prizes (blue)
  - Rivalry Bonuses (red, if applicable)
- [ ] Show percentage of each
- [ ] Make bars clickable (filter transactions)

**Phase 3: Recent Transactions (Left)**
- [ ] List last 5-10 transactions
- [ ] Show for each:
  - Icon (🏆 win, 🛡️ entry fee, 👕 merch, etc.)
  - Date
  - Description
  - Amount (color: green=positive, red=negative)
- [ ] Link to full transaction history

**Phase 4: Earnings Over Time (Right Top)**
- [ ] Create line chart using Recharts
- [ ] Show cumulative earnings growth
- [ ] X-axis: time (days, weeks, or months)
- [ ] Y-axis: dollars
- [ ] Add data points for each transaction
- [ ] Hover shows exact amount + date

**Phase 5: Financial Goals (Right Bottom)**
- [ ] Create goal card:
  - Goal name (e.g., "Save for training upgrade")
  - Current / Target amounts
  - Progress bar (color-coded)
  - Estimated time to goal
- [ ] Add "Set New Goal" button
- [ ] Show celebration animation when goal reached

**Phase 6: Transaction History Page**
- [ ] Create filterable table:
  - Filter by date range (dropdown)
  - Filter by type (all, earnings, expenses)
  - Filter by amount (min/max)
  - Search by description
- [ ] Show paginated results
- [ ] Export options (CSV, PDF)

**Phase 7: Earnings Comparison**
- [ ] Show player stats vs league averages:
  - Avg earnings per battle
  - Total career earnings
  - Current month earnings
  - Top earner comparison
- [ ] Display as large, color-coded numbers
- [ ] Add visual indicator (above/below average)

**Priority**: P2 (Medium - Management feature)

---

## 17. GENERAL UI COMPONENTS

### Components Needed Across All Pages

**A. Navigation Header**
- [ ] Create persistent top nav bar:
  - Logo + "ALGORITHM INSTITUTE" (left)
  - Main nav links: Dashboard, Battles, Tournaments, Media, Profile
  - Balance indicator (right): "💰 $12,450"
  - Sign out button (right)
- [ ] Style with dark background + tech borders
- [ ] Add active state highlighting (orange underline)
- [ ] Make responsive (hamburger menu on mobile)

**B. Character Sprite Component**
- [ ] Create reusable `<CharacterSprite>` component
- [ ] Props:
  - `spriteId`: number (1-880)
  - `size`: "small" | "medium" | "large" | "xl"
  - `showBorder`: boolean
  - `animate`: boolean (idle animation)
- [ ] Load sprite from `/public/sprites/characters/`
- [ ] Add fallback for missing sprites (silhouette)
- [ ] Add hover states (optional)

**C. Badge Component**
- [ ] Create reusable `<Badge>` component
- [ ] Props:
  - `badgeId`: number (1-120)
  - `size`: "small" | "medium" | "large"
  - `earned`: boolean (color vs grayscale)
  - `showTooltip`: boolean
- [ ] Load badge sprite from `/public/sprites/badges/`
- [ ] Show tooltip with badge info on hover

**D. Progress Bar Component**
- [ ] Create reusable `<ProgressBar>` component
- [ ] Props:
  - `value`: number (0-100)
  - `color`: string (hex or preset)
  - `showLabel`: boolean
  - `showTier`: boolean (LOW/MID/TOP/GOD)
  - `size`: "sm" | "md" | "lg"
- [ ] Style with rounded or sharp corners
- [ ] Animate fill on mount

**E. Stat Card Component**
- [ ] Create reusable `<StatCard>` component
- [ ] Props:
  - `label`: string
  - `value`: string | number
  - `icon`: React element
  - `color`: string (accent color)
  - `change`: string (e.g., "+25 ↑")
- [ ] Style with tech border + dark bg
- [ ] Add hover glow effect

**F. Modal Component**
- [ ] Create reusable `<Modal>` component
- [ ] Props:
  - `isOpen`: boolean
  - `onClose`: function
  - `title`: string
  - `size`: "sm" | "md" | "lg" | "xl"
- [ ] Style with dark overlay + centered card
- [ ] Add close button (X in corner)
- [ ] Close on ESC key or click outside

**G. Button Variants**
- [ ] Create button component with variants:
  - `primary`: orange bg, black text
  - `secondary`: gray bg, white text
  - `success`: green bg, white text
  - `danger`: red bg, white text
  - `ghost`: transparent bg, border only
- [ ] Add loading state (spinner)
- [ ] Add disabled state
- [ ] Add icon support (left/right)

**H. Toast Notifications**
- [ ] Create toast component for feedback:
  - Success (green)
  - Error (red)
  - Warning (orange)
  - Info (blue)
- [ ] Auto-dismiss after 3-5 seconds
- [ ] Stack multiple toasts
- [ ] Position in top-right corner

**I. Loading States**
- [ ] Create loading spinner component (pixel art style)
- [ ] Create skeleton loaders for:
  - Character cards
  - Battle cards
  - Article cards
  - Stat grids
- [ ] Add page transition animations

**Priority**: P0 (Critical - Foundation for all pages)

---

## Implementation Priority Matrix

### Phase 0: Critical Blockers (Week 1)
**Fix before ANY visual work:**
1. ✅ Fix attribute point allocation bug (BLOCKER)
2. ✅ Fix "Reset to Template" button
3. ✅ Add missing city sprite PNGs
4. ✅ Test all 7 onboarding templates

### Phase 1: Core Components (Week 1-2)
**Build reusable foundation:**
1. Design system setup (colors, fonts, spacing)
2. CharacterSprite component
3. Badge component
4. ProgressBar component
5. Button variants
6. Modal component
7. Navigation header
8. Toast notifications

### Phase 2: Onboarding Flow (Week 2-3)
**Critical user entry point:**
1. Identity step (sprite selector)
2. League selection (with venue backgrounds)
3. Attributes step (visual bars + fix bug)
4. Styles step (badge grid)
5. Progress indicator
6. Welcome screen polish

### Phase 3: Core Game Loop (Week 3-4)
**Main gameplay:**
1. Dashboard redesign (sprites, stats, rivalries)
2. Battle offers page (grudge matches, prep assistant)
3. Prep calendar (visual grid, impact preview, locked state)
4. Battle results (sprite header, post-battle summary, segment timeline)

### Phase 4: Profile & Progression (Week 4-5)
**Player engagement:**
1. Battler career page (stats, badges, graph)
2. Badge compendium (grid, detail modals)
3. Finances page (charts, transactions, goals)

### Phase 5: Meta Features (Week 5-6)
**Community & content:**
1. Media hub (article cards, filters, featured stories)
2. Article detail (rivalry context, related articles)
3. Tournament list & detail
4. Tournament bracket view

### Phase 6: Polish & Optimization (Week 6-7)
**Final touches:**
1. Loading states & animations
2. Responsive design (mobile/tablet)
3. Performance optimization (image loading, lazy load)
4. Accessibility (keyboard nav, screen readers)
5. Error states & edge cases
6. Cross-browser testing

---

## Technical Implementation Notes

### Sprite Loading Strategy

**Problem**: 920+ character sprites = potential performance issue

**Solution**:
1. **Lazy loading**: Only load sprites when needed
2. **Sprite sheets**: Combine multiple sprites into sheets
3. **Progressive loading**: Load low-res placeholder first
4. **Caching**: Cache sprites in localStorage or IndexedDB
5. **CDN**: Serve sprites from CDN for faster delivery

**Sprite Mapping System**:
```typescript
// lib/game/spriteMapping.ts
export const SPRITE_MAP = {
  // Map battler IDs to sprite IDs
  battler_uuid_1: 42, // sprite_042.png
  battler_uuid_2: 157, // sprite_157.png
  // ... etc
};

export function getSpriteUrl(battleId: string): string {
  const spriteId = SPRITE_MAP[battleId] || 1; // fallback to sprite_001
  const folder = getSpriteFolder(spriteId);
  return `/sprites/characters/${folder}/sprite_${spriteId.toString().padStart(3, '0')}.png`;
}
```

### Badge Sprite Integration

**Files**: `/public/sprites/badges/badge_001.png` through `badge_120.png`

**Mapping**:
```typescript
// lib/game/badgeSprites.ts
export const BADGE_SPRITE_MAP = {
  'master_wordsmith': 1, // badge_001.png (gold)
  'punchline_king': 2, // badge_002.png (gold)
  'technical_writer': 3, // badge_003.png (silver)
  // ... map all 97 badges to sprite IDs
};
```

### Animation Strategy

**Use CSS animations for**:
- Button hovers (glow, scale)
- Progress bar fills
- Card entrances (slide, fade)
- Loading spinners

**Use Framer Motion for**:
- Page transitions
- Modal open/close
- Complex sprite animations
- Gesture interactions

**Avoid JS animations for**:
- Static UI elements
- Simple state changes

### Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  /* Single column layouts */
  /* Larger touch targets */
  /* Simplified navigation */
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  /* Two column layouts */
  /* Collapsible sidebars */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Full layouts with sidebars */
  /* Multi-column grids */
}
```

---

## Asset Requirements

### Still Needed

**Venue Backgrounds** (for league selection):
- [ ] `/sprites/venues/freestyle-frenzy.png`
- [ ] `/sprites/venues/punchline-paradise.png`
- [ ] `/sprites/venues/east-coast-elites.png`
- [ ] `/sprites/venues/small-room-circuit.png` ✅ (exists)
- [ ] `/sprites/venues/urban-warfare.png`
- [ ] `/sprites/venues/apex-arena.png`
- [ ] `/sprites/venues/west-coast-warriors.png`
- [ ] `/sprites/venues/midwest-massacre.png`
- [ ] `/sprites/venues/southern-showdown.png`
- [ ] `/sprites/venues/international-circuit.png`
- [ ] `/sprites/venues/storytellers-summit.png`
- [ ] `/sprites/venues/lyrical-warfare.png`
- [ ] `/sprites/venues/main-stage-arena.png`
- [ ] `/sprites/venues/champions-circle.png`
- [ ] `/sprites/venues/royal-massacre.png`

**City Backgrounds** (currently 404):
- [ ] All city sprites referenced in league selection
- See ONBOARDING_TEST_REPORT.md for full list

**Pixel Art Icons**:
- [ ] Attribute icons (lyricism, wordplay, etc.)
- [ ] Activity icons (research, writing, performance, life, rest)
- [ ] UI icons (back arrow, settings, menu, etc.)

**Blogger Avatars**:
- [ ] Battle Eyez logo/avatar
- [ ] Marijuana Piranha logo
- [ ] Algorithm Institute logo
- [ ] Small Room Report logo
- [ ] Main Stage Herald logo
- [ ] Underground Voice logo
- [ ] Coast to Coast logo
- [ ] Battle Breakdown logo

**Retro Fonts**:
- [ ] Consider adding "Press Start 2P" or similar pixel font
- [ ] Rajdhani ✅ (already installed)
- [ ] JetBrains Mono ✅ (already installed)

---

## Testing Plan

### Visual Regression Testing
- [ ] Set up Playwright visual testing
- [ ] Capture screenshots of all pages
- [ ] Compare against mockups
- [ ] Flag deviations for review

### Component Testing
- [ ] Unit tests for all components
- [ ] Sprite loading tests
- [ ] Badge rendering tests
- [ ] Progress bar calculations

### Integration Testing
- [ ] Onboarding flow end-to-end
- [ ] Battle flow end-to-end
- [ ] Tournament flow end-to-end
- [ ] Media generation and display

### Performance Testing
- [ ] Lighthouse scores (target: 90+ performance)
- [ ] Image loading optimization
- [ ] Bundle size analysis
- [ ] Render time profiling

---

## Success Metrics

**Visual Alignment**:
- [ ] All pages match mockup aesthetic (pixel art, dark theme, tech borders)
- [ ] Character sprites appear on all relevant pages
- [ ] Badge sprites integrated and functional
- [ ] Color palette consistent across app

**Functional**:
- [ ] Onboarding flow completes without errors
- [ ] All buttons, forms, interactions work
- [ ] No console errors or warnings
- [ ] Smooth animations (60fps)

**User Experience**:
- [ ] Clear visual hierarchy
- [ ] Intuitive navigation
- [ ] Fast load times (<3s)
- [ ] Mobile-friendly (responsive)

---

## Timeline Estimate

**Total: 6-7 weeks (full-time)**

- Week 1: Fix blockers + build core components
- Week 2: Onboarding flow redesign
- Week 3-4: Core game loop (dashboard, offers, prep, results)
- Week 5: Profile, badges, finances
- Week 6: Tournaments, media hub
- Week 7: Polish, testing, bug fixes

**Parallel work opportunities**:
- Designer creates venue backgrounds while dev works on components
- Designer creates pixel art icons while dev works on layouts
- QA tests each phase as completed

---

## Notes & Considerations

### Design Consistency
- **ALL pages must use the same visual language**
- Tech borders, dark theme, orange accents everywhere
- Character sprites should be the visual anchor
- Badges should be prominent rewards

### Performance
- Sprite loading could be a bottleneck
- Consider lazy loading, sprite sheets, CDN
- Test on low-end devices

### Accessibility
- Ensure sufficient color contrast (dark bg + light text)
- Add keyboard navigation
- Screen reader support for character sprites (alt text)

### Future Expansion
- Sprite customization (hair, clothes, accessories)
- Animated sprites (idle, celebrate, defeated)
- More badge tiers (platinum, diamond)
- Seasonal themes/events

---

## Resources

**Mockups Location**: `c:\git\battlerapuniversity\raw images\mockups\`
**Character Sprites**: `c:\git\battlerapuniversity\ai-battlerap\public\sprites\characters\` (920 files)
**Badge Sprites**: `c:\git\battlerapuniversity\ai-battlerap\public\sprites\badges\` (120 files)
**Design Docs**: `CLAUDE.md`, `BADGE_SYSTEM_REDESIGN_PROPOSAL.md`, `XP_AND_LEVEL_SYSTEM_DESIGN.md`
**Test Report**: `ONBOARDING_TEST_REPORT.md`

---

**END OF UI/UX OVERHAUL MASTER PLAN**
