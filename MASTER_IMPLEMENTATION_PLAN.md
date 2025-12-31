# MASTER IMPLEMENTATION PLAN
**Battle Rap University - Visual System Integration**
**Date**: December 2, 2025
**Status**: Ready to Execute

---

## 🎯 THE VISION (From Mockups)

You've shown me 17 incredible mockups that reveal the COMPLETE visual system:

### Key Features
1. **Tournament System** - Full brackets with character portraits
2. **Dev Tools** - Time control, attribute editor, badge spawner, battle simulator
3. **Finances Dashboard** - Charts, earnings over time, transaction history
4. **Badge Compendium** - 120 badges with tooltips, synergies, conflicts, character portraits
5. **Media Hub** - Battle recaps with featured stories and categories
6. **Battle Offers** - Grudge matches with rivalry history, intensity bars, head-to-head records
7. **Dashboard** - Active battles with portraits, rivalries, recent battles
8. **Battle Results** - PostBattleSummary with rating, XP, attributes, badges, payout
9. **Battler Career Page** - Stats, performance trends, earned badges, media links
10. **Onboarding** - Portrait generator, league selection, attribute allocation
11. **Prep Calendar** - Color-coded days, impact preview, templates, daily focus detail

### Visual Elements Everywhere
- **Character portraits** (in battles, offers, career pages, brackets, dashboard)
- **Crowd reaction sprites** (dynamic crowd based on battle performance)
- **Badge icons** (with tooltips showing effects/synergies)
- **Charts/graphs** (performance trends, earnings, win rates)
- **Rivalry intensity bars** (grudge meter visualization)
- **Segment timeline** (battle performance visualization)
- **Color-coded prep days** (Research=blue, Writing=orange, Performance=red, Life=purple, Rest=gray)

---

## 📊 CURRENT STATE ANALYSIS

### ✅ What's WORKING
1. **Crowd Reaction System** - FULLY IMPLEMENTED
   - `CrowdReactionWindow.tsx` component displays 3 crowd sprites
   - 130+ organized crowd sprites (black/white/mixed demographics)
   - Reaction types: hype, cheer, laugh, stunned, watch, record, think, cringe, boo
   - Used on battle results page

2. **PostBattleSummary Component** - EXISTS and IS USED
   - Shows rating change, XP earned, level up, attribute changes, badges earned
   - Rendered on battle results page ([id]/page.tsx:445)
   - XP breakdown visualization included

3. **Badge Display System** - Working with emoji fallback
   - `BadgeCard.tsx` (3 variants: compact/default/detailed)
   - `BadgeUnlockModal.tsx` for unlock animations
   - `BadgeProgress.tsx` for progress tracking
   - Uses emoji icons (✍️ 🎤 ⭐) NOT sprite images

4. **Avatar System** - Functional but generic
   - `BattlerAvatar.tsx` with image upload support
   - Tier-based gradient fallbacks (shows initials)
   - Multiple sizes (xs, sm, md, lg, xl, 2xl)

### ❌ What's MISSING (The Gap)

1. **Character Sprite Integration** 🚨 CRITICAL
   - **880+ character sprites exist** but NOT used anywhere
   - Files: `public/sprites/characters/*/sprite_001.png` to `sprite_880.png`
   - Organized in timestamped folders, no semantic names
   - NO mapping to database battlers (~28-34 battlers)
   - Ratio: ~27-33 sprites per battler (multiple poses/expressions)
   - `BattlerAvatar` uses uploaded images or initials, not sprites

2. **Badge Sprite Integration** 🚨 CRITICAL
   - **120 badge sprites exist** but NOT used
   - Files: `public/sprites/badges/*/badge_001.png` to `badge_120.png`
   - `BadgeCard` component uses emoji icons instead
   - Badge sprites are pixel-art quality, matching mockup aesthetic

3. **Data Visualization Charts** 🚨 HIGH PRIORITY
   - **Recharts library installed** but NOT USED anywhere
   - No line charts (attribute progression over time)
   - No bar charts (win rate, battle stats)
   - Only CSS progress bars exist (`CareerStatsPanel.tsx`)

4. **Battler Career/Profile Page** 🚨 HIGH PRIORITY
   - `/battler/[id]/page.tsx` exists but basic
   - Mockups show: Overview/Battles/Rivalries tabs, performance trends chart, earned badges grid, media mentions
   - Current implementation: minimal

5. **Tournament Bracket Visualization** 🔶 MEDIUM
   - `TournamentBracket.tsx` exists
   - Mockups show: Full bracket with portraits, leaderboard, registration system
   - Current: needs visual enhancement

6. **Grudge Match/Rivalry UI** 🔶 MEDIUM
   - Components exist (`GrudgeMeter.tsx`, `HeadToHeadStats.tsx`)
   - Mockups show: Rivalry history modal, intensity bars, H2H records in battle offers
   - Current: needs integration into battle offers page

---

## 🗂️ ASSET INVENTORY

### Character Sprites (920 total)
**Location**: `ai-battlerap/public/sprites/characters/image_*/`
- sprite_001.png to sprite_880.png (sequential)
- 23 subdirectories (40 sprites each)
- Transparent background PNGs
- **Status**: Available, NOT mapped, NOT integrated

**Database Battlers**: ~28-34 battlers
**Mapping Challenge**: ~27-33 sprites per battler
- **Theory**: Multiple poses/expressions per battler (idle, talking, celebrating, defeated, etc.)

### Crowd Sprites (440 total, ~130 organized)
**Location**: `ai-battlerap/public/sprites/crowd/organized/{demographic}/`
- black/ - 75+ sprites
- white/ - 33+ sprites
- mixed/ - 22+ sprites
- **Status**: ✅ FULLY INTEGRATED via `CrowdReactionWindow.tsx`

### Badge Sprites (120 total)
**Location**: `ai-battlerap/public/sprites/badges/*/`
- badge_001.png to badge_120.png
- Organized by positive/negative/content categories (see NAMING_GUIDE.md)
- **Status**: Available, NOT integrated (uses emojis)

### League Sprites (152 total)
**Location**: `ai-battlerap/public/sprites/leagues/*/`
- league_001.png to league_152.png
- League logos and venue backgrounds
- **Status**: Available, NOT used (leagues use text names)

### City Backgrounds (70+ total)
**Location**: `ai-battlerap/public/sprites/cities/{region}/{time}/`
- 4 regions: east-coast, midwest, south, west-coast, canada
- 3 times: day, dusk, night
- **Status**: Available, usage unclear

---

## 🎯 IMPLEMENTATION ROADMAP

### Phase 1: CHARACTER SPRITE SYSTEM (Week 1 - 16 hours)

#### Task 1.1: Create Sprite Mapping Strategy
**Goal**: Map 880 sprites to 28-34 battlers

**Approach A: Manual Assignment** (Recommended for Phase 1)
1. Query database for all battler names and IDs
2. Assign sprite ranges manually:
   ```
   Surf Tsu (ID: xxx) → sprite_001 to sprite_030
   Day Lit (ID: xxx) → sprite_031 to sprite_060
   JC the Titan (ID: xxx) → sprite_061 to sprite_090
   ```
3. Create mapping JSON file: `sprite-mapping.json`
4. Write SQL migration to populate `battlers.avatar_url`

**Approach B: Pose-Based System** (Future enhancement)
1. Categorize sprites by pose (idle, talking, hyped, defeated)
2. Create pose selection logic for different contexts
3. More complex but allows dynamic expression

**Task 1.2: Update BattlerAvatar Component**
**File**: `components/battler/BattlerAvatar.tsx`

**Changes**:
```typescript
// BEFORE: Uses uploaded image or initials fallback
if (avatar_url) {
  return <Image src={avatar_url} alt={name} />
} else {
  return <div className="initials">{getInitials(name)}</div>
}

// AFTER: Use sprite system
import { getBattlerSprite } from '@/lib/sprites/battler-sprites'

const spriteUrl = getBattlerSprite(battlerId, 'idle') // or 'hyped', 'defeated'
return <Image src={spriteUrl} alt={name} fallback={<Initials />} />
```

**Task 1.3: Create Sprite Helper Library**
**File**: `lib/sprites/battler-sprites.ts`

```typescript
export type BattlerPose = 'idle' | 'hyped' | 'defeated' | 'talking' | 'celebrating'

export function getBattlerSprite(
  battlerId: string,
  pose: BattlerPose = 'idle'
): string {
  const mapping = SPRITE_MAPPING[battlerId]
  if (!mapping) return '/sprites/default-avatar.png'

  const spriteIndex = mapping.poses[pose] || mapping.poses.idle
  return `/sprites/characters/${mapping.folder}/sprite_${spriteIndex}.png`
}

// Load from sprite-mapping.json
const SPRITE_MAPPING = { /* ... */ }
```

**Task 1.4: Database Migration**
**File**: `supabase/migrations/20251202_populate_avatar_urls.sql`

```sql
-- Populate avatar_url for all battlers based on sprite mapping
UPDATE battlers SET avatar_url = '/sprites/characters/image_1764147239421/sprite_001.png' WHERE id = '...';
UPDATE battlers SET avatar_url = '/sprites/characters/image_1764147239421/sprite_002.png' WHERE id = '...';
-- etc.
```

**Task 1.5: Integration Points**
Update these components to use sprite-based avatars:
- Dashboard (`app/dashboard/page.tsx`) - Active battles, recent battles
- Battle Offers (`app/battle/offers/page.tsx`) - Opponent avatars
- Battle Results (`app/battle/[id]/page.tsx`) - Both battlers
- Tournament Brackets (`components/tournament/TournamentBracket.tsx`)
- Battler Career Page (`app/battler/[id]/page.tsx`)
- Media Articles (news recaps with battler faces)

**Deliverables**:
- ✅ `sprite-mapping.json` - Complete sprite-to-battler mapping
- ✅ `lib/sprites/battler-sprites.ts` - Sprite helper library
- ✅ Migration - Database avatar_url population
- ✅ Updated `BattlerAvatar.tsx` - Sprite-based rendering
- ✅ Integration - All pages using sprites
- ✅ Fallback system - Handles missing sprites gracefully

---

### Phase 2: BADGE SPRITE SYSTEM (Week 1-2 - 8 hours)

#### Task 2.1: Badge Sprite Mapping
**Goal**: Map 120 badge sprites to badge codes

**Reference**: `NAMING_GUIDE.md` already has complete mapping:
```
badge_001.png → angles
badge_002.png → personals
badge_003.png → disrespect
badge_041.png → wordplay_wizard
badge_042.png → freestyle_genius
...
badge_120.png → poor_networking
```

**Task 2.2: Update BadgeCard Component**
**File**: `components/badge/BadgeCard.tsx`

**Changes**:
```typescript
// BEFORE: Uses emoji icons
const icon = BADGE_EMOJI_MAP[badge.code] || '⭐'

// AFTER: Use sprite images
import { getBadgeSprite } from '@/lib/sprites/badge-sprites'

const spriteUrl = getBadgeSprite(badge.code)
return (
  <Image
    src={spriteUrl}
    alt={badge.name}
    className="badge-sprite"
    fallback={<span>{icon}</span>}
  />
)
```

**Task 2.3: Create Badge Sprite Helper**
**File**: `lib/sprites/badge-sprites.ts`

```typescript
const BADGE_SPRITE_MAP: Record<string, string> = {
  'angles': '/sprites/badges/characters/image_1764193680087/badge_001.png',
  'personals': '/sprites/badges/characters/image_1764193680087/badge_002.png',
  'wordplay_wizard': '/sprites/badges/characters/image_1764193677602/badge_041.png',
  // ... all 120 badges
}

export function getBadgeSprite(badgeCode: string): string {
  return BADGE_SPRITE_MAP[badgeCode] || '/sprites/default-badge.png'
}
```

**Task 2.4: Update Badge Display Locations**
- Badge Compendium page (`app/badges/page.tsx`)
- PostBattleSummary component (badge unlock)
- Battler career page (earned badges grid)
- Badge tooltips (hover effects)
- Badge unlock modal animation

**Deliverables**:
- ✅ `lib/sprites/badge-sprites.ts` - Complete badge sprite mapping
- ✅ Updated `BadgeCard.tsx` - Sprite-based rendering
- ✅ Badge integration - All badge displays using sprites
- ✅ Fallback system - emoji icons if sprite missing

---

### Phase 3: BATTLER CAREER/PROFILE PAGE (Week 2 - 12 hours)

#### Task 3.1: Career Page Layout
**File**: `app/battler/[id]/page.tsx`

**Mockup shows**:
- Tabs: Overview / Battles / Rivalries / Media
- Left sidebar: Career summary, total battles, win rate, performance trend chart, earned badges
- Right sidebar: Active rivalries with intensity bars, H2H records
- Center: Tab content (overview stats, battle history, rivalry details, media mentions)

**Task 3.2: Add Performance Trend Chart**
**Component**: `components/battler/PerformanceTrendChart.tsx`

**Use recharts**:
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export function PerformanceTrendChart({ battleHistory }) {
  const data = battleHistory.map(battle => ({
    battle: battle.battle_number,
    avgScore: battle.average_score,
    peakScore: battle.peak_score,
    consistency: battle.consistency_score
  }))

  return (
    <LineChart data={data}>
      <Line dataKey="avgScore" stroke="#f97316" name="Average" />
      <Line dataKey="peakScore" stroke="#22c55e" name="Peak" />
      <Line dataKey="consistency" stroke="#3b82f6" name="Consistency" />
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="battle" />
      <YAxis domain={[0, 10]} />
      <Tooltip />
    </LineChart>
  )
}
```

**Task 3.3: Earned Badges Grid**
**Component**: `components/battler/EarnedBadgesGrid.tsx`

**Display**:
- Badge sprites in grid layout
- Rarity-based border colors (gold/silver/bronze)
- Tooltip on hover showing badge effects
- Click to see "How to Earn" details
- Progress bars for badges close to earning

**Task 3.4: Rivalry Panel**
**Component**: `components/battler/RivalryPanel.tsx`

**Display**:
- Top 3-5 active rivalries
- Intensity bars (0-100)
- H2H record (wins-losses)
- Last battle date
- "View Full History" link

**Task 3.5: API Endpoint**
**File**: `app/api/battler/[id]/career/route.ts`

**Returns**:
```typescript
{
  battler: { /* full battler data */ },
  careerStats: {
    totalBattles: 15,
    winRate: 73,
    avgScore: 7.2,
    peakScore: 8.9,
    consistency: 0.78
  },
  performanceTrend: [ /* last 20 battles */ ],
  earnedBadges: [ /* badge objects with earn date */ ],
  activeRivalries: [ /* top 5 rivalries */ ],
  recentMedia: [ /* battle recaps mentioning this battler */ ]
}
```

**Deliverables**:
- ✅ Enhanced career page with tabs
- ✅ Performance trend chart (recharts)
- ✅ Earned badges grid with sprites
- ✅ Rivalry panel with intensity bars
- ✅ API endpoint for career data

---

### Phase 4: DATA VISUALIZATION CHARTS (Week 2-3 - 10 hours)

#### Task 4.1: Earnings Over Time Chart
**File**: `components/finances/EarningsChart.tsx`
**Mockup**: Finances page - line chart showing earnings growth

```typescript
import { LineChart, Line, Area, AreaChart } from 'recharts'

export function EarningsChart({ transactions }) {
  const data = transactions.map(t => ({
    date: t.created_at,
    balance: t.balance_after,
    earnings: t.amount
  }))

  return (
    <AreaChart data={data}>
      <defs>
        <linearGradient id="earnings" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <Area dataKey="balance" stroke="#22c55e" fill="url(#earnings)" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
    </AreaChart>
  )
}
```

**Integration**: `app/finances/page.tsx`

#### Task 4.2: Earnings Breakdown Bar Chart
**File**: `components/finances/EarningsBreakdown.tsx`
**Mockup**: Finances page - horizontal bars showing win bonuses, base pay, tournament prizes

```typescript
import { BarChart, Bar, XAxis, YAxis } from 'recharts'

export function EarningsBreakdown({ breakdown }) {
  const data = [
    { category: 'Win Bonuses', amount: breakdown.winBonuses, color: '#22c55e' },
    { category: 'Base Pay', amount: breakdown.basePay, color: '#f97316' },
    { category: 'Tournament Prizes', amount: breakdown.tournamentPrizes, color: '#3b82f6' }
  ]

  return (
    <BarChart layout="vertical" data={data}>
      <Bar dataKey="amount" fill="#f97316" />
      <XAxis type="number" />
      <YAxis type="category" dataKey="category" />
    </BarChart>
  )
}
```

#### Task 4.3: Win Rate Trends Chart
**File**: `components/battler/WinRateTrendChart.tsx`
**Mockup**: Battler career page - rolling average win rate

```typescript
export function WinRateTrendChart({ battles }) {
  // Calculate 5-battle rolling average
  const data = battles.map((battle, index) => {
    const last5 = battles.slice(Math.max(0, index - 4), index + 1)
    const wins = last5.filter(b => b.winner === 'player').length
    const winRate = (wins / last5.length) * 100

    return {
      battle: battle.battle_number,
      winRate,
      result: battle.winner === 'player' ? 1 : 0
    }
  })

  return (
    <LineChart data={data}>
      <Line dataKey="winRate" stroke="#f97316" strokeWidth={2} />
      <ReferenceLine y={50} stroke="#71717a" strokeDasharray="3 3" />
      <XAxis dataKey="battle" />
      <YAxis domain={[0, 100]} unit="%" />
      <Tooltip formatter={(value) => `${value}%`} />
    </LineChart>
  )
}
```

**Deliverables**:
- ✅ Earnings over time chart (Finances page)
- ✅ Earnings breakdown chart (Finances page)
- ✅ Win rate trends chart (Career page)
- ✅ Performance trend chart (Career page)
- ✅ Recharts fully integrated

---

### Phase 5: GRUDGE MATCH & RIVALRY SYSTEM (Week 3 - 10 hours)

#### Task 5.1: Enhanced Battle Offers Page
**File**: `app/battle/offers/page.tsx`

**Mockup shows**:
- Regular battle offers (gray border)
- **Grudge match offers** (orange/red border with flame icon)
- Grudge match includes:
  - Rivalry intensity bar (0-100, color-coded)
  - H2H record (1-0 You Lead)
  - Grudge origin ("Controversial decision sparked beef")
  - Stakes ("High intensity + media attention!")
  - Rivalry bonus payout (+$400)
  - "VIEW RIVALRY HISTORY" button

**Task 5.2: Rivalry History Modal**
**Component**: `components/relationship/RivalryHistoryModal.tsx`

**Display**:
- Timeline of all battles between battlers
- Battle outcomes (W/L) with scores
- Grudge intensity progression chart
- Media articles about the rivalry
- Fan sentiment meter
- Next battle stakes

**Task 5.3: Grudge Intensity Calculation**
**File**: `lib/game/grudgeEngine.ts` (already exists!)

**Verify it calculates**:
- Intensity increase on close battles (2-1)
- Intensity increase on controversial decisions
- Intensity increase on chokes/stumbles
- Intensity increase on media coverage
- Decay over time if no battles
- Rematch demand based on fan sentiment

**Task 5.4: Battle Offer Enhancement**
**Component**: `components/battle/BattleOfferCard.tsx`

**Add conditional rendering**:
```typescript
{isGrudgeMatch && (
  <div className="grudge-match-badge">
    🔥 GRUDGE MATCH
    <div className="intensity-bar">
      <div className="fill" style={{ width: `${intensity}%` }} />
      <span>{intensity}/100 Intensity</span>
    </div>
    <div className="h2h-record">
      HEAD-TO-HEAD: {record} (You {lead})
    </div>
    <div className="grudge-origin">
      Origin: {origin}
    </div>
    <button onClick={openRivalryHistory}>
      VIEW RIVALRY HISTORY
    </button>
  </div>
)}
```

**Deliverables**:
- ✅ Enhanced battle offers with grudge match visuals
- ✅ Rivalry history modal
- ✅ Intensity bar visualization
- ✅ H2H record display
- ✅ Rivalry bonus payout calculation

---

### Phase 6: PREP CALENDAR ENHANCEMENTS (Week 3-4 - 8 hours)

#### Task 6.1: Prep Templates
**Mockup shows**: "SELECT PREP TEMPLATE" modal with:
- **Balanced Strategy** (recommended mix)
- **Grind Strategy** (heavy writing & performance focus, high stress)
- **Recovery Strategy** (focus on rest & life to reduce stress)

**Component**: `components/battle/PrepTemplateSelector.tsx`

**Functionality**:
```typescript
const TEMPLATES = {
  balanced: {
    name: 'Balanced Strategy',
    description: 'Recommended mix of Writing, Performance, Rest',
    distribution: { writing: 5, performance: 3, research: 2, rest: 2, life: 1 }
  },
  grind: {
    name: 'Grind Strategy',
    description: 'Heavy Writing & Performance focus, high stress',
    distribution: { writing: 7, performance: 5, research: 1, rest: 0, life: 0 }
  },
  recovery: {
    name: 'Recovery Strategy',
    description: 'Focus on Rest & Life to reduce stress',
    distribution: { writing: 2, performance: 2, research: 1, rest: 5, life: 3 }
  }
}

function applyTemplate(template, totalDays) {
  // Distribute prep days according to template ratios
  // Return array of daily focus assignments
}
```

**Task 6.2: Daily Focus Detail Modal**
**Mockup shows**: When clicking a PERFORMANCE day:
- **DAY 3: PERFORMANCE FOCUS**
- Activity options (checkboxes):
  - ☑ Mirror Practice (+Stage Presence)
  - ☐ Crowd Control Drills (+Crowd Control)
  - ☐ Delivery Workshop (+Delivery)
- Daily focus: 60% complete (progress bar)
- Stress impact: +5
- "CONFIRM DAY'S PLAN" button

**Component**: `components/battle/DailyFocusModal.tsx`

**Functionality**:
- Select specific activities for the day
- Show attribute impact preview (+1.2 lyricism, +0.8 flow)
- Show stress impact
- Show choke risk change
- Confirm or edit

**Task 6.3: Prep Assistant Panel**
**Mockup shows**: Right sidebar during prep:
- **PREP RECOMMENDATIONS**
  - ✓ Focus on WRITING (5-7 days) → Boost lyricism
  - ✓ Include 2-3 REST days
  - ⚠ Opponent uses angles heavily → Consider 2+ RESEARCH days
- **IMPACT PREVIEW (REAL-TIME)**
  - Lyricism: +1.5 ████████░░
  - Flow: +1.2 ██████░░░░
  - Resilience: -0.5 ██░░░░░░░░
  - Stress: 45 → 55 (FOCUSED)
  - Predicted Score: 7.2 avg
  - Choke Risk: 8%
- Buttons: COPY LAST BATTLE, BALANCED STRATEGY, GRIND STRATEGY

**Component**: `components/battle/PrepAssistant.tsx`

**Real-time calculation**:
- As player adds prep days, recalculate impact preview
- Show color-coded bars (green = improvement, red = decline)
- Update predicted score based on prep choices

**Deliverables**:
- ✅ Prep template selector
- ✅ Daily focus detail modal
- ✅ Prep assistant with real-time preview
- ✅ Template application logic

---

### Phase 7: TOURNAMENT BRACKET VISUALIZATION (Week 4 - 8 hours)

#### Task 7.1: Enhanced Bracket Layout
**File**: `components/tournament/TournamentBracket.tsx`

**Mockup shows**:
- Full bracket tree with character portraits
- Seed numbers (1-16)
- Match scores (2-1, 3-0)
- Current round highlighted
- Leaderboard panel on right showing top battlers

**Enhancements**:
```typescript
export function TournamentBracket({ tournament, matches }) {
  return (
    <div className="tournament-bracket">
      <div className="bracket-tree">
        {/* Round 1 */}
        <div className="round">
          {matches.round1.map(match => (
            <BracketMatch
              key={match.id}
              seed1={match.battler1.seed}
              seed2={match.battler2.seed}
              portrait1={getBattlerSprite(match.battler1.id)}
              portrait2={getBattlerSprite(match.battler2.id)}
              score={match.result}
              winner={match.winner}
            />
          ))}
        </div>

        {/* Round 2, Quarters, Semis, Finals */}
        {/* ... */}
      </div>

      <div className="leaderboard">
        <h3>LEADERBOARD</h3>
        {tournament.participants.map((p, index) => (
          <div className="leaderboard-entry" key={p.id}>
            <span className="rank">{index + 1}</span>
            <img src={getBattlerSprite(p.id)} alt={p.name} />
            <span className="name">{p.name}</span>
            <span className="score">{p.totalScore}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Task 7.2: Match Card Component**
**Component**: `components/tournament/BracketMatch.tsx`

**Display**:
- Both battler portraits (from sprites)
- Seed numbers
- Match score (if completed)
- Winner highlight (gold border)
- Click to view full battle results

**Deliverables**:
- ✅ Enhanced bracket layout with portraits
- ✅ Match card component
- ✅ Leaderboard panel
- ✅ Responsive bracket design

---

### Phase 8: TESTING & POLISH (Week 4 - 8 hours)

#### Task 8.1: Visual Consistency Pass
**Use Playwright MCP** to screenshot all pages:

```bash
# Navigate and screenshot each page
/dashboard
/battle/offers
/battle/[id]
/battler/[id]
/badges
/finances
/tournaments
/media
```

**Verify**:
- Character sprites appear correctly
- Badge sprites render properly
- Charts display with correct data
- Color palette matches mockups (orange/zinc/green/red)
- Dark theme consistent throughout

#### Task 8.2: Sprite Fallback Testing
**Test scenarios**:
- Missing character sprite → shows initials
- Missing badge sprite → shows emoji
- Missing crowd sprite → shows emoji
- Slow image loading → shows placeholder

#### Task 8.3: Data Accuracy Validation
**Use Postgres MCP** to verify:
```sql
-- Check all battlers have avatar_url populated
SELECT stage_name, avatar_url FROM battlers WHERE avatar_url IS NULL;

-- Verify sprite paths are correct
SELECT avatar_url FROM battlers LIMIT 10;

-- Check badge earning is tracking
SELECT * FROM battle_progression WHERE badges_earned IS NOT NULL LIMIT 5;
```

#### Task 8.4: Performance Optimization
- Lazy load character sprites (only load visible portraits)
- Preload badge sprites (small file size)
- Optimize chart rendering (debounce data updates)
- Cache sprite URLs (avoid repeated file lookups)

**Deliverables**:
- ✅ Visual consistency verified across all pages
- ✅ Sprite fallback system tested
- ✅ Data accuracy validated
- ✅ Performance optimized

---

## 📋 EXECUTION CHECKLIST

### Before Starting
- [x] MCP servers installed (postgres, filesystem, playwright, memory, sequential-thinking)
- [x] Supabase running locally (port 54322)
- [x] Dev server running (`npm run dev`)
- [x] All mockups reviewed
- [x] Sprite assets inventoried

### Phase 1: Character Sprites
- [ ] Create sprite-to-battler mapping (sprite-mapping.json)
- [ ] Write sprite helper library (lib/sprites/battler-sprites.ts)
- [ ] Database migration to populate avatar_url
- [ ] Update BattlerAvatar component
- [ ] Integrate sprites into dashboard
- [ ] Integrate sprites into battle offers
- [ ] Integrate sprites into battle results
- [ ] Test sprite fallback system
- [ ] Screenshot comparison (before/after)

### Phase 2: Badge Sprites
- [ ] Create badge sprite mapping (lib/sprites/badge-sprites.ts)
- [ ] Update BadgeCard component
- [ ] Integrate into badge compendium
- [ ] Integrate into PostBattleSummary
- [ ] Integrate into career page
- [ ] Test badge fallback system

### Phase 3: Career Page
- [ ] Design career page layout (tabs, panels)
- [ ] Build performance trend chart component
- [ ] Build earned badges grid
- [ ] Build rivalry panel
- [ ] Create career API endpoint
- [ ] Test career page with real data

### Phase 4: Charts
- [ ] Earnings over time chart
- [ ] Earnings breakdown chart
- [ ] Win rate trends chart
- [ ] Test recharts integration

### Phase 5: Grudge Matches
- [ ] Enhance battle offers page
- [ ] Build rivalry history modal
- [ ] Add grudge match visuals (intensity bar, H2H)
- [ ] Test grudge system

### Phase 6: Prep Calendar
- [ ] Build prep template selector
- [ ] Build daily focus modal
- [ ] Build prep assistant panel
- [ ] Test template application

### Phase 7: Tournament Bracket
- [ ] Enhance bracket layout
- [ ] Build match card component
- [ ] Add leaderboard panel
- [ ] Test bracket visualization

### Phase 8: Testing & Polish
- [ ] Screenshot all pages (playwright)
- [ ] Test sprite fallbacks
- [ ] Validate data accuracy (postgres)
- [ ] Optimize performance
- [ ] Final visual consistency check

---

## 🚀 NEXT STEPS

**YOU tell me**:
1. **Start Phase 1 (Character Sprites)?** - This is the foundation, highest impact
2. **Start Phase 3 (Career Page)?** - You said "I care about building a battler and seeing all the statistics"
3. **Start Phase 5 (Grudge Matches)?** - Rivalry system is unique and exciting
4. **Something else?** - Any specific mockup you want to see come to life first?

I'm ready to code! Just tell me which phase to start and I'll build it step-by-step, testing with Playwright and Postgres MCPs as I go.

What's the call? 🎯
