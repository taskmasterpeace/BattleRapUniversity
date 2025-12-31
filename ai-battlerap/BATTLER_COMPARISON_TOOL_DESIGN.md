# Battler Comparison Tool - Design Specification

## Executive Summary

### Purpose
The **Battler Comparison Tool** is an admin-only diagnostic and balancing utility that enables game designers to identify overpowered attributes, detect badge imbalances, discover meta trends, and validate game balance across different battler archetypes and build configurations.

### Audience
- **Primary**: Game designers and balance leads
- **Secondary**: Admins and quality assurance engineers
- **NOT for**: Players (no visibility in normal game)

### Key Capabilities
1. **Multi-battler comparison** (2-10 battlers side-by-side)
2. **Visual attribute analysis** (radar charts, heatmaps)
3. **Performance metrics** (win rates, choke rates, haymakers)
4. **Badge effectiveness** analysis and conflict detection
5. **League-specific performance** breakdown
6. **Historical trend** analysis (win rate over battles)
7. **Data export** for deeper analysis

### Use Cases

**Use Case 1: Balance Investigation**
- Designer notices high win rate for a specific tier
- Selects all Top-tier battlers
- Compares attributes, badges, win rates
- Identifies "Lyricism + Wordplay combo" overrepresented
- Adjusts badge multipliers or tier composition

**Use Case 2: Badge Balancing**
- QA finds "Known Choker" badge underperforming
- Selects 5 battlers with that badge
- Views choke rate statistics (should be ~45-46%, currently ~30%)
- Checks if badge effects are being applied correctly
- Compares to similar badges (Pressure Performer, Inconsistent)

**Use Case 3: Meta Analysis**
- Designer wants to understand current playstyle diversity
- Selects all AI battlers (top 20)
- Analyzes badge distribution and win rates
- Discovers 80% have "Aggressive" badge
- Considers buffing alternative styles (Technical, Freestyle)

**Use Case 4: New Battler Testing**
- QA creates new legendary battler with unique badge combo
- Compares to similar archetype (rating, tier, badges)
- Runs quick simulations to validate balance
- Iterates on attributes before release

---

## Feature Specification

### Feature A: Multi-Battler Selection

**Purpose**: Allow users to curate the comparison set with flexible filtering

**Components**:

#### A1. Primary Selection Interface
- **Type**: Multi-select dropdown with search
- **Default**: Shows recent 10 AI battlers or player's own battler
- **Capacity**: 2-10 battlers (prevent UI overload)
- **Search**: Real-time filter by:
  - Stage name (fuzzy matching)
  - Battler ID
  - Region

**Example**:
```
[SELECT BATTLERS]

Search: __________ (Find battlers)

Selected (3/10):
  × Tru Foe (AI, Top tier, 1847 rating)
  × QX (AI, Mid tier, 1612 rating)
  × Eminent (AI, Top tier, 1923 rating)

[+] Add More
```

#### A2. Quick Filter Panel
**Purpose**: Preset filters for common comparison scenarios

**Filters**:
- **By Tier**: Low, Mid, Top, God
- **By Rating Range**: Slider (1200-2500)
- **By League**: Small Room, Main Stage, Both
- **By Badge**: Multi-select badge categories
- **Quick Presets**:
  - Top 5 (highest rated AI battlers)
  - Recent 10 (most recently modified)
  - Tier Comparison (1 each tier)
  - Best Vs Worst (highest vs lowest rating)
  - Badge Focus (all battlers with selected badge)

**Example**:
```
QUICK FILTERS
┌─────────────────────────────────────────┐
│ Tier: [Low] [Mid] [Top] [God]           │
│ Rating: 1200 ─────●────── 2500          │
│ League: [Small Room] [Main Stage] [Both] │
│ Badge: [Select...] ▼                    │
│ Preset: [Top 5] [Recent] [Tier Comp]    │
└─────────────────────────────────────────┘
[APPLY] [CLEAR]
```

#### A3. Selection Management
- **Remove button** (×) on each selected battler
- **Clear all** button (reset to default)
- **Save comparison** (see Feature G)
- Display count: "3/10 selected"
- Warn if < 2 selected (need minimum for comparison)

---

### Feature B: Attribute Radar Chart

**Purpose**: Visually compare all 7 key attributes across selected battlers

**Attributes Included** (1-10 scale):
1. **Lyricism** (Writing)
2. **Wordplay** (Writing)
3. **Creativity** (Writing)
4. **Stage Presence** (Performance)
5. **Crowd Control** (Performance)
6. **Delivery** (Performance)
7. **Resilience** (Personal)

**Chart Specifications**:

#### B1. Radar Chart Rendering
- **Type**: Multi-series radar chart (Recharts `RadarChart`)
- **Series**: One per selected battler (max 10 lines)
- **Colors**: Distinct palette for each battler:
  - Battler 1: Orange (primary accent)
  - Battler 2: Cyan
  - Battler 3: Magenta
  - Battler 4: Lime
  - Battler 5: Yellow
  - Battler 6-10: Pastel variants
- **Grid**: Semi-transparent background rings at 2, 4, 6, 8, 10
- **Hover Behavior**:
  - Show exact value tooltip: "Lyricism: 7.5"
  - Highlight that series line
  - Dim other lines (opacity 0.2)
- **Legend**: Below chart, clickable to toggle series visibility

#### B2. Radar Chart Sections
- **Inner Ring** (1-3): Low performers (color: red tint)
- **Middle Ring** (4-6): Mid performers (color: yellow tint)
- **Outer Ring** (7-10): Top performers (color: green tint)

#### B3. Peak/Average Overlay (Optional)
- Solid line: Current actual attributes
- Dashed line: Average of selected battlers (for reference)
- Checkbox: "Show average"

**Example Visual**:
```
        LYRICISM
            *
           /|\
          / | \
      WORDPLAY-+-CREATIVITY
        /      |      \
       /       |       \
 DELIVERY--+-CROWD_CONTROL
    \       |       /
     \      |      /
  RESILIENCE-STAGE_PRESENCE

Legend:
● Tru Foe (orange)
● QX (cyan)
● Eminent (magenta)
[⊡ Show Average]
```

---

### Feature C: Stats Comparison Table

**Purpose**: Side-by-side numerical comparison of performance metrics

**Table Structure**:

#### C1. Core Stats (Left Column Headers)
Stat Name | Tru Foe | QX | Eminent | ← Scrollable columns
-----------|---------|----|---------|-
**Rating** | 1847 | 1612 | 1923 |
**Tier** | Top | Mid | Top |
**Total Battles** | 127 | 89 | 156 |
**Wins** | 84 | 52 | 103 |
**Losses** | 43 | 37 | 53 |
**Win Rate** | 66.1% | 58.4% | 66.0% |
**Streak** | +3 | -1 | +5 |

#### C2. Performance Metrics
**Choke Stats**:
- **Choke Rate** (% of battles with ≥1 choke)
- **Avg Chokes/Battle** (mean occurrences)
- **Choke Consistency** (std dev, how unpredictable)

**Stumble Stats**:
- **Stumble Rate** (% of battles with ≥1 stumble)
- **Avg Stumbles/Battle**
- **Stumble Consistency**

**Scoring Stats**:
- **Avg Score** (mean `average_score` across segments)
- **Peak Score** (mean `peak_score` per battle)
- **Consistency Score** (mean std dev of segments)
- **Crowd Reaction Avg** (0-100 scale)

#### C3. League Breakdown
- **Small Room Win Rate** (%)
- **Main Stage Win Rate** (%)
- **League Preference** (which league > 55% win rate)

**Example**:
```
┌─────────────────┬────────┬────────┬────────┐
│ METRIC          │ Tru Foe│ QX     │ Eminent│
├─────────────────┼────────┼────────┼────────┤
│ Rating          │ 1847   │ 1612   │ 1923   │
│ Tier            │ Top    │ Mid    │ Top    │
│ Win Rate        │ 66.1%  │ 58.4%  │ 66.0%  │
│ Choke Rate      │ 7.9%   │ 6.2%   │ 8.1%   │
│ Avg Score       │ 6.82   │ 6.45   │ 6.95   │
│ Peak Score      │ 8.41   │ 8.12   │ 8.63   │
│ Small Room WR   │ 68.2%  │ 61.5%  │ 64.3%  │
│ Main Stage WR   │ 63.8%  │ 55.2%  │ 67.6%  │
└─────────────────┴────────┴────────┴────────┘
```

#### C4. Column Interactions
- **Sortable**: Click header to sort (ascending/descending)
- **Highlighted**: Highest/lowest values per row (green/red background)
- **Tooltip**: Long metric names show definition on hover
- **Sticky Header**: Column headers stay visible when scrolling vertically
- **Sticky Index**: Battler column stays visible when scrolling metrics

---

### Feature D: Badge Comparison Grid

**Purpose**: Visual matrix showing which badges each battler has and their effects

**Grid Specifications**:

#### D1. Badge Organization
**By Category** (collapsible sections):
- **Performance Badges**: Stage Presence, Crowd Control, etc.
- **Content Badges**: Storytelling, Wordplay, Angles, etc.
- **Delivery Badges**: Aggressive, Smooth Flow, Speed Rapping, etc.
- **Reputation Badges**: Respected Veteran, Choker, Crowd Favorite, etc.
- **Playstyle Badges**: Technical, Freestyle, Balanced, etc.

#### D2. Grid Layout

```
BADGE COMPARISON
┌──────────────────────┬─────────┬────────┬──────────┐
│ Badge Name           │ Tru Foe │ QX     │ Eminent  │
├──────────────────────┼─────────┼────────┼──────────┤
│ PERFORMANCE BADGES   │         │        │          │
│  Stage Presence      │    ✓    │        │    ✓     │
│  Crowd Control       │    ✓    │   ✓    │          │
│  Charisma            │         │        │    ✓     │
├──────────────────────┼─────────┼────────┼──────────┤
│ CONTENT BADGES       │         │        │          │
│  Storytelling        │    ✓    │   ✓    │    ✓     │
│  Wordplay            │    ✓    │        │    ✓     │
│  Angles              │         │   ✓    │          │
├──────────────────────┼─────────┼────────┼──────────┤
│ REPUTATION BADGES    │         │        │          │
│  Respected Veteran   │    ✓    │        │    ✓     │
│  Known Choker        │         │        │          │
│  Crowd Favorite      │    ✓    │        │    ✓     │
└──────────────────────┴─────────┴────────┴──────────┘
```

#### D3. Visual Indicators
- **Checkmark** (✓): Badge equipped
- **Empty cell**: Badge not equipped
- **Color coding** (optional):
  - Positive badges: Green tint
  - Negative badges: Red tint
  - Neutral badges: Gray tint
- **Hover tooltip**: Show badge description and mechanical effects

**Example Tooltip**:
```
STORYTELLING
━━━━━━━━━━━━━━━━━━━━━━━━━
Category: Content
Rarity: Common

Effects:
+ Lyricism: 1.1x (10% boost)
+ Creativity: 1.1x
+ Writing Prep: 1.15x efficiency
+ Consistency: +0.5 points

Description: Master of narrative-driven
rebuttals and constructed angles.
```

#### D4. Badge Heatmap (Alternative View)
- Toggle between grid/heatmap
- Color intensity: Rarity level
  - Light gray: Common
  - Blue: Rare
  - Purple: Epic
  - Gold: Legendary
- Badge count per battler (bottom row)

**Example Heatmap**:
```
               Tru Foe  QX  Eminent
Stage Presence    ███    █    ███     (Legendary)
Storytelling      ██     █     ██     (Epic)
Wordplay          ██    (-)   ██      (Epic, rare for QX)
```

---

### Feature E: Win Rate Trends

**Purpose**: Identify improving/declining battlers and momentum patterns

**Chart Specifications**:

#### E1. Line Chart
- **Type**: Multi-series line chart (Recharts `LineChart`)
- **X-axis**: Battle number (last 50 battles)
- **Y-axis**: Win rate (%) - rolling window
- **Series**: One per selected battler
- **Point size**: 4px, clickable for details
- **Line style**: Solid, 2px stroke
- **Legend**: Below chart

#### E2. Calculations
- **Rolling window**: 5-battle moving average
- **Formula**: (Wins in last N battles / N) × 100
- **Window sizes**: 5, 10, 20 (toggle buttons)
- **Smoothing**: Optional spline interpolation

#### E3. Visual Indicators
- **Uptrend**: Line ascending, green color
- **Downtrend**: Line descending, red color
- **Flat**: Horizontal line, gray color
- **Hover**: Show exact (battle #, win rate, date)

**Example Chart**:
```
Win Rate Trend (Last 50 Battles, 10-Battle Rolling Average)

100%|
  90|                    ╱╲
    |                   ╱  ╲         ╱─ Tru Foe (orange)
  80|        ╱───╲      ╱    ╲       ╱  ╱─ QX (cyan)
    |       ╱     ╲____╱      ╲_____╱   ╱─ Eminent (magenta)
  70|      ╱
    |     ╱
  60|────
    |
  50|________________________________
    └────┴────┴────┴────┴────┴────────
     1   11   21   31   41   51 Battle #

[Show Window] [5] [10] [20] battles
```

#### E4. Statistical Info
- **Current trend**: ↑ Improving, ↓ Declining, → Stable
- **Projection**: If trend continues, estimated win rate in 10 battles
- **Consistency**: Win rate std dev (is pattern predictable?)

---

### Feature F: League Performance Breakdown

**Purpose**: Identify battler specialization (Small Room vs Main Stage)

**Chart Type**: Grouped bar chart

#### F1. Bar Chart Layout
- **Groups**: One per battler
- **Bars per group**: 2 (Small Room, Main Stage)
- **Colors**:
  - Small Room: Orange/warm tone
  - Main Stage: Blue/cool tone
- **Height**: Win rate percentage (0-100%)
- **Hover**: Show exact win rate and battle count

**Example**:
```
League Performance Breakdown

100%|
    |
 80%|  ┌────┐           ┌────┐           ┌────┐
    |  │ SR │ MS        │ SR │ MS        │ SR │ MS
 60%|  │    │ ┌──────┐  │    │ ┌──────┐  │    │ ┌──────┐
    |  │    │ │      │  │    │ │      │  │    │ │      │
 40%|  └────┘ │      │  └────┘ │      │  └────┘ │      │
    |         │      │         │      │         │      │
  0%|_________└──────┘_________└──────┘_________└──────┘
        Tru Foe       QX              Eminent

SV = Small Room, MS = Main Stage
```

#### F2. League Specialization Detection
- **Small Room Specialist**: SR WR - MS WR > 10%
- **Main Stage Specialist**: MS WR - SR WR > 10%
- **Well-Rounded**: Difference < 10%
- **Struggling**: Win rate < 50% in both
- Display tag below each battler: "Small Room Specialist", etc.

#### F3. Battle Count Context
- Show sample size: "(SR: 42 battles, MS: 58 battles)"
- Warn if < 10 battles in a league: "Sample size small, may not be reliable"

---

### Feature G: Export Functionality

**Purpose**: Enable deeper analysis outside the tool

#### G1. Export Formats

**CSV Export**:
- Table format with all metrics
- Metadata header (export date, battlers, filters)
- One row per battler, columns per metric
- Compatible with Excel, Google Sheets, Python

**JSON Export**:
- Structured data for programmatic analysis
- Includes raw values and calculations
- Useful for custom analysis scripts

**Example CSV**:
```csv
Export Date,2025-11-30
Battlers,Tru Foe,QX,Eminent
Filters,Tier=Top,League=Both,MinRating=1600

Metric,Tru Foe,QX,Eminent
Rating,1847,1612,1923
Win Rate,66.1%,58.4%,66.0%
Choke Rate,7.9%,6.2%,8.1%
Avg Score,6.82,6.45,6.95
Small Room WR,68.2%,61.5%,64.3%
Main Stage WR,63.8%,55.2%,67.6%
```

#### G2. Comparison Saving
- **Save comparison**: Store current selection + filters
- **Naming**: "Top Tier Comparison Nov 30", auto-generate or custom
- **Storage**: Browser localStorage (up to 10 saved comparisons)
- **Load**: Dropdown to restore previous comparisons
- **Delete**: Remove saved comparison

**UI**:
```
[SAVED COMPARISONS]
┌────────────────────────────────────┐
│ Top Tier Comparison (Nov 30)       │
│ Badge Impact Study (Nov 28)        │
│ Tier Progression (Nov 25)          │
│ All Active Battlers (Nov 20)       │
└────────────────────────────────────┘

Name new comparison: ________________
[SAVE] [LOAD SELECTED] [DELETE SELECTED]
```

---

## UI/UX Specification

### Layout Overview

```
HEADER
┌──────────────────────────────────────────────────────────────────┐
│ ⚙️ BATTLER COMPARISON TOOL (ADMIN) | Settings | Help | [EXIT]   │
└──────────────────────────────────────────────────────────────────┘

SIDEBAR (Collapsible)
├─ Battler Selection
├─ Quick Filters
├─ Saved Comparisons
└─ Export Options

MAIN CONTENT (Scrollable)
├─ Selection Summary (selected battlers, count)
├─ Tab Navigation: [Overview] [Attributes] [League] [Trends]
├─ Content Area (depends on active tab)
└─ Footer: Last updated, data freshness
```

### Tab Navigation

#### Tab 1: Overview
- Battler info cards (name, rating, tier, image)
- Key stats summary (win rate, battles)
- Quick badge overview

#### Tab 2: Attributes
- Radar chart (Feature B)
- Attribute table (detailed numbers)
- Heatmap view (alternative)

#### Tab 3: Performance
- Stats comparison table (Feature C)
- Choke/stumble breakdown
- Scoring analysis

#### Tab 4: Badges
- Badge comparison grid (Feature D)
- Badge effect matrix
- Synergy analysis

#### Tab 5: League & Trends
- League breakdown chart (Feature F)
- Win rate trends chart (Feature E)
- Historical progression

#### Tab 6: Analysis
- Summary insights
- Outliers detection
- Balance recommendations

### Design System Adherence

**Dark Theme** (consistent with game):
- Background: `bg-zinc-950`
- Cards: `bg-zinc-900`
- Borders: `border-zinc-800`
- Primary text: `text-zinc-100`
- Secondary text: `text-zinc-500`
- Accent: `text-orange-500`, `bg-orange-500/20`
- Success: `text-green-500`, `bg-green-500/20`
- Warning: `text-yellow-500`, `bg-yellow-500/20`
- Error: `text-red-500`, `bg-red-500/20`

**Typography**:
- Headers: `font-black uppercase tracking-tighter`
- Body: `font-bold uppercase tracking-wider`
- Labels: `text-xs uppercase tracking-wide`

**Spacing**:
- Container max-width: `max-w-7xl` (wider than normal for data density)
- Padding: `px-6 py-4`
- Gap: `gap-4` between sections
- Margin: `space-y-4` between logical sections

---

## Data Requirements

### API Endpoint Specification

#### Endpoint 1: Fetch Battler Comparison Data

```
GET /api/admin/battlers/compare?ids=UUID1,UUID2,UUID3
```

**Authentication**:
- Requires admin authentication
- Check: User has `is_admin = true` in profiles table
- Return 403 Forbidden if not admin

**Query Parameters**:
- `ids`: Comma-separated battler UUIDs (required, 2-10 allowed)
- `detailed`: Boolean (default true) - include all metrics
- `include_trends`: Boolean (default true) - include win rate trends

**Response**:
```typescript
{
  success: boolean;
  data: {
    timestamp: ISO8601;
    battlers: Array<{
      id: UUID;
      stage_name: string;
      region: string;
      is_ai: boolean;

      // Tier & Rating
      tier: 'low' | 'mid' | 'top' | 'god';
      rating: number;

      // Attributes (1-10 scale)
      attributes: {
        writing: {
          lyricism: number;
          wordplay: number;
          creativity: number;
          flow: number;
        };
        performance: {
          stage_presence: number;
          crowd_control: number;
          delivery: number;
        };
        resilience: number;
      };

      // Rankings & Stats
      stats: {
        total_battles: number;
        wins: number;
        losses: number;
        win_rate: number;  // percentage 0-100
        current_streak: number;  // can be negative
      };

      // Performance Metrics
      performance: {
        choke_rate: number;  // % of battles with choke
        avg_chokes_per_battle: number;
        choke_consistency: number;  // std dev

        stumble_rate: number;
        avg_stumbles_per_battle: number;
        stumble_consistency: number;

        avg_score: number;  // 0-10 scale
        peak_score: number;
        consistency_score: number;  // higher = more consistent
        crowd_reaction_avg: number;  // 0-100
      };

      // League Breakdown
      league_stats: {
        small_room: {
          wins: number;
          losses: number;
          win_rate: number;
        };
        main_stage: {
          wins: number;
          losses: number;
          win_rate: number;
        };
      };

      // Badges
      badges: Array<{
        code: string;
        name: string;
        category: string;
        rarity: 'common' | 'rare' | 'epic' | 'legendary';
        effects: {
          lyricismMultiplier?: number;
          wordplayMultiplier?: number;
          chokeReduction?: number;
          smallRoomBonus?: number;
          // ... all BadgeEffects fields
        };
      }>;

      // Trends
      win_rate_trend?: Array<{
        battle_number: number;
        win_rate: number;  // rolling average
        date: ISO8601;
      }>;
    }>;
  };
  errors?: string[];
}
```

#### Endpoint 2: List Available Battlers (for selection)

```
GET /api/admin/battlers?filter=FILTER&search=QUERY&limit=50
```

**Query Parameters**:
- `filter`: 'all' | 'ai' | 'player' (default: 'all')
- `search`: Fuzzy search by stage name
- `tier`: Filter by tier (low,mid,top,god)
- `min_rating`: Minimum rating filter
- `max_rating`: Maximum rating filter
- `league`: Small Room, Main Stage (can use both)
- `badge`: Filter by badge code
- `limit`: Results limit (default 50, max 100)
- `offset`: Pagination offset

**Response**:
```typescript
{
  success: boolean;
  data: Array<{
    id: UUID;
    stage_name: string;
    tier: string;
    rating: number;
    is_ai: boolean;
    image_url?: string;
  }>;
  total_count: number;
  has_more: boolean;
}
```

#### Endpoint 3: Get Badge Definitions

```
GET /api/admin/badges
```

**Response**:
```typescript
{
  success: boolean;
  data: Array<{
    code: string;
    name: string;
    category: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    description: string;
    effects: BadgeEffects;
  }>;
}
```

#### Endpoint 4: Invalidate Comparison Cache (Optional)

```
POST /api/admin/battlers/cache/invalidate
Body: { battler_ids: UUID[] }
```

**Purpose**: Force refresh of cached battler data after balance changes

---

### Database Queries

#### Query 1: Fetch Battler with All Stats

```sql
SELECT
  b.id,
  b.stage_name,
  b.region,
  b.is_ai,
  b.tier,
  ba.writing,
  ba.performance,
  ba.resilience,
  r.rating,
  r.wins,
  r.losses,
  ROUND(CAST(r.wins AS float) / (r.wins + r.losses) * 100, 1) as win_rate,
  r.streak,
  b.style_tags
FROM battlers b
JOIN battler_attributes ba ON b.id = ba.battler_id
JOIN rankings r ON b.id = r.battler_id
WHERE b.id = ANY($1::uuid[])
ORDER BY r.rating DESC;
```

#### Query 2: Calculate Choke Rate

```sql
SELECT
  bt.battler_id,
  COUNT(DISTINCT b.id) as total_battles,
  SUM(CASE WHEN EXISTS(
    SELECT 1 FROM battle_segments bs
    WHERE bs.battle_id = b.id
    AND bs.battler_id = bt.battler_id
    AND bs.choked = true
  ) THEN 1 ELSE 0 END)::float / COUNT(DISTINCT b.id) * 100 as choke_rate
FROM battles b
JOIN battle_rounds br ON b.id = br.battle_id
JOIN (
  SELECT DISTINCT battler_player_id as battler_id FROM battles
  UNION ALL
  SELECT DISTINCT battler_ai_id as battler_id FROM battles
) bt ON true
WHERE b.status = 'completed'
  AND (b.battler_player_id = bt.battler_id OR b.battler_ai_id = bt.battler_id)
  AND bt.battler_id = ANY($1::uuid[])
GROUP BY bt.battler_id;
```

#### Query 3: Win Rate by League

```sql
SELECT
  CASE WHEN b.battler_player_id = $1 THEN 'player' ELSE 'ai' END as battler_role,
  l.id as league_id,
  l.name,
  SUM(CASE WHEN
    (b.battler_player_id = $1 AND b.winner_id = $1) OR
    (b.battler_ai_id = $1 AND b.winner_id = $1)
  THEN 1 ELSE 0 END)::float / COUNT(b.id) * 100 as win_rate,
  COUNT(b.id) as total_battles
FROM battles b
JOIN leagues l ON b.league_id = l.id
WHERE b.status = 'completed'
  AND ($1 = b.battler_player_id OR $1 = b.battler_ai_id)
GROUP BY league_id, l.name, battler_role;
```

#### Query 4: Average Performance Metrics

```sql
SELECT
  COALESCE(b.battler_player_id, b.battler_ai_id) as battler_id,
  AVG(
    (br_player.average_score + br_ai.average_score) / 2
  ) as avg_score_overall,
  AVG(CASE
    WHEN b.battler_player_id = br_player.battler_id
    THEN br_player.peak_score
    ELSE br_ai.peak_score
  END) as avg_peak_score,
  AVG(CASE
    WHEN b.battler_player_id = br_player.battler_id
    THEN br_player.crowd_reaction
    ELSE br_ai.crowd_reaction
  END) as avg_crowd_reaction
FROM battles b
JOIN battle_rounds br_player ON b.id = br_player.battle_id AND br_player.battler_id = b.battler_player_id
JOIN battle_rounds br_ai ON b.id = br_ai.battle_id AND br_ai.battler_id = b.battler_ai_id
WHERE b.status = 'completed'
  AND (b.battler_player_id = ANY($1::uuid[]) OR b.battler_ai_id = ANY($1::uuid[]))
GROUP BY battler_id;
```

#### Query 5: Win Rate Trends (Last 50 Battles)

```sql
WITH battler_battles AS (
  SELECT
    CASE
      WHEN battler_player_id = $1 THEN battler_player_id
      ELSE battler_ai_id
    END as battler_id,
    CASE
      WHEN winner_id = $1 THEN 1 ELSE 0
    END as is_win,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM battles
  WHERE status = 'completed' AND ($1 = battler_player_id OR $1 = battler_ai_id)
)
SELECT
  rn as battle_number,
  SUM(is_win) OVER (ORDER BY rn DESC ROWS BETWEEN CURRENT ROW AND 4 FOLLOWING)::float
    / 5 * 100 as win_rate_5,
  created_at
FROM battler_battles
WHERE rn <= 50
ORDER BY rn;
```

---

## Implementation Roadmap

### Phase 1: Basic Comparison (MVP) - 8-12 hours

**Goals**: Get core selection and comparison working

**Deliverables**:
1. Page structure: `/app/admin/compare/page.tsx`
2. Battler selection UI (Feature A)
3. Attribute radar chart (Feature B)
4. Stats table (Feature C) - basic version (top 10 metrics)
5. API endpoint: `GET /api/admin/battlers/compare`
6. Database query optimization

**Components**:
- `components/admin/BattlerSelector.tsx` - Multi-select UI
- `components/admin/FilterPanel.tsx` - Quick filters
- `components/admin/AttributeRadar.tsx` - Recharts radar
- `components/admin/StatsTable.tsx` - Comparison table
- `components/admin/ComparisonLayout.tsx` - Tab navigation

**Testing**:
- Load 3 battlers, verify all attributes display
- Radar chart with different attribute ranges
- Table sorting works correctly
- Admin-only access enforced

**Success Criteria**:
- Can select 2-10 battlers
- Radar chart renders without errors
- Stats table shows correct values
- Data loads in < 2 seconds

---

### Phase 2: Stats & Badges - 8-10 hours

**Goals**: Add comprehensive stats and badge analysis

**Deliverables**:
1. Extended stats table (Feature C) - all metrics
2. Badge comparison grid (Feature D)
3. Badge definitions API: `GET /api/admin/badges`
4. Choke/stumble rate calculations
5. League-specific queries
6. Heatmap view for badges

**Components**:
- `components/admin/StatsTableExtended.tsx` - Full metrics
- `components/admin/BadgeGrid.tsx` - Badge matrix
- `components/admin/BadgeTooltip.tsx` - Badge effects
- `components/admin/BadgeHeatmap.tsx` - Alternative view

**Database**:
- Optimize choke rate query (index on battle_segments.choked)
- Add materialized view for performance metrics (optional)

**Testing**:
- Badge grid shows all badges correctly
- Tooltips display badge effects
- Choke rates match actual simulation data
- Sorting by metrics works

**Success Criteria**:
- Badge grid loads without error
- All performance metrics calculate correctly
- Heatmap view functional
- Performance acceptable (< 3 seconds load)

---

### Phase 3: Charts & Visualizations - 10-12 hours

**Goals**: Add advanced analysis charts

**Deliverables**:
1. Win rate trends chart (Feature E)
2. League breakdown bar chart (Feature F)
3. Advanced filters (rating range, badge filter)
4. Chart caching/optimization
5. Tooltip enhancements

**Components**:
- `components/admin/WinRateTrendChart.tsx` - Line chart with rolling avg
- `components/admin/LeagueBreakdownChart.tsx` - Bar chart
- `components/admin/ChartTooltip.tsx` - Custom tooltips
- `hooks/useChartData.ts` - Data transformation

**Database**:
- Win rate trends query (see Query 5)
- League performance aggregation
- Consider caching for historical data

**Libraries**:
- Recharts (already used in codebase)
- Use existing theme tokens

**Testing**:
- Win rate trend with 50 battle history
- League breakdown bar chart
- Hover interactions work
- Chart responsiveness

**Success Criteria**:
- Charts render correctly
- Trends are visually identifiable
- League specialists identified correctly
- Performance < 3 seconds

---

### Phase 4: Advanced Features - 8-10 hours

**Goals**: Complete the tool with export and convenience features

**Deliverables**:
1. CSV/JSON export (Feature G)
2. Saved comparisons (localStorage)
3. Insights panel (analysis + recommendations)
4. Outlier detection (auto-flag unusual values)
5. Polish UI/UX
6. Admin auth verification

**Components**:
- `components/admin/ExportPanel.tsx` - CSV/JSON export
- `components/admin/SavedComparisons.tsx` - Load/save UI
- `components/admin/InsightsPanel.tsx` - Analysis & recommendations
- `components/admin/OutlierHighlight.tsx` - Auto-detection

**Features**:
- Detect overpowered attributes (top 5%)
- Suggest balance changes
- Identify badge synergies
- Find meta trends
- Compare to game balance targets

**Testing**:
- CSV export opens in Excel
- JSON export parseable
- Saved comparisons persist across sessions
- Insights panel is helpful

**Success Criteria**:
- Export functionality works
- Saved comparisons restore correctly
- Insights are actionable
- Tool is production-ready

---

## Technical Stack

### Frontend

**Framework**: Next.js 15 (App Router)
- Existing infrastructure in place
- Server components for data fetching
- API routes for backend integration

**UI Library**: React 18+
- Hooks for state management
- Custom components matching design system

**Charting**: Recharts 2.x
- Already used in codebase
- Dark theme support
- Responsive by default
- Works with Next.js SSR

**Styling**: TailwindCSS
- Dark theme tokens already defined
- Responsive utilities
- Custom color palette in place

**Data Fetching**: SWR or React Query (optional)
- Recommend SWR (simpler, used in codebase)
- Client-side caching of comparison data
- Refetch after balance changes

### Backend

**API Routes**: Next.js API routes
- Location: `/app/api/admin/`
- Middleware for auth verification
- Response standardization

**Database**: Supabase (Postgres)
- Existing schema optimized
- RLS policies for admin access
- Service role for admin queries

**Admin Auth**:
- Check `profiles.is_admin = true`
- Middleware in `lib/db/server.ts`
- Require user to be authenticated

### Performance Optimization

**Query Optimization**:
- Add indexes on `battles(status)`, `battle_segments(choked)`
- Use aggregations in queries (avoid N+1)
- Consider materialized views for heavy calculations

**Frontend Caching**:
- SWR cache with 5-minute revalidation
- localStorage for saved comparisons
- URL params for bookmarkability

**Data Fetching**:
- Lazy load charts on tab click
- Progressive data loading (quick stats first, trends later)
- Skeleton loaders while fetching

---

## Success Metrics

### Usability
- [ ] Tool loads in < 3 seconds
- [ ] Can compare 2-10 battlers without UI lag
- [ ] All metrics display correctly
- [ ] Charts render without errors
- [ ] Mobile responsive (tested on tablet)

### Accuracy
- [ ] Choke rates match game simulation (±2%)
- [ ] Win rates calculated correctly (verified with manual count)
- [ ] Attribute values match database
- [ ] Badge effects applied correctly
- [ ] League breakdown totals match overall wins/losses

### Functionality
- [ ] Admin auth enforced (non-admins blocked)
- [ ] All 6 tabs functional
- [ ] Export produces valid CSV/JSON
- [ ] Saved comparisons persist across sessions
- [ ] Filters work as intended (narrowing results correctly)

### Design
- [ ] Consistent with dark theme
- [ ] Professional appearance
- [ ] Readable typography and spacing
- [ ] Accessible color contrast
- [ ] Hover states clear and helpful

### Balance Analysis
- [ ] Outlier detection flags problematic attributes
- [ ] Insights panel identifies balance issues
- [ ] Suggested changes are actionable
- [ ] Badge synergies visible in grid
- [ ] League specialists identified correctly

---

## Future Enhancements

### v2 Features (Post-Launch)

1. **Real-time Simulation**
   - Run simulations between selected battlers
   - View battle replay in comparison context
   - "Simulate matchup" button

2. **Attribute Editor** (for admins)
   - Adjust battler attributes in real-time
   - Test balance changes before deploying
   - Simulation preview

3. **Badge Editor** (for admins)
   - Modify badge effects
   - Create custom badges
   - Test balance impact

4. **Build Optimizer** (for designers)
   - Suggest optimal attribute allocation
   - Find underpowered builds
   - Recommend badge combinations

5. **Meta Analysis Dashboard**
   - Top 10 builds by win rate
   - Badge co-occurrence heatmap
   - Attribute effectiveness scoring
   - Play rate vs win rate scatter

6. **Historical Snapshots**
   - Compare balance state over time
   - Track attribute changes to battlers
   - "Revert to date" feature

7. **Tournament Integration**
   - Compare tournament participants
   - Predict tournament outcomes
   - Analyze bracket balance

---

## Appendix: Example Data Structures

### Example API Response

```json
{
  "success": true,
  "data": {
    "timestamp": "2025-11-30T12:34:56Z",
    "battlers": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "stage_name": "Tru Foe",
        "region": "TX",
        "is_ai": true,
        "tier": "top",
        "rating": 1847,
        "attributes": {
          "writing": {
            "lyricism": 7.8,
            "wordplay": 7.5,
            "creativity": 7.2,
            "flow": 7.4
          },
          "performance": {
            "stage_presence": 8.1,
            "crowd_control": 8.0,
            "delivery": 7.9
          },
          "resilience": 8.2
        },
        "stats": {
          "total_battles": 127,
          "wins": 84,
          "losses": 43,
          "win_rate": 66.1,
          "current_streak": 3
        },
        "performance": {
          "choke_rate": 7.9,
          "avg_chokes_per_battle": 0.42,
          "choke_consistency": 0.65,
          "stumble_rate": 38.6,
          "avg_stumbles_per_battle": 1.24,
          "stumble_consistency": 0.88,
          "avg_score": 6.82,
          "peak_score": 8.41,
          "consistency_score": 7.12,
          "crowd_reaction_avg": 78.3
        },
        "league_stats": {
          "small_room": {
            "wins": 41,
            "losses": 19,
            "win_rate": 68.2
          },
          "main_stage": {
            "wins": 43,
            "losses": 24,
            "win_rate": 63.8
          }
        },
        "badges": [
          {
            "code": "STAGE_PRESENCE",
            "name": "Stage Presence",
            "category": "Performance",
            "rarity": "rare",
            "effects": {
              "stagePresenceMultiplier": 1.15,
              "crowdControlMultiplier": 1.10,
              "mainStageBonus": 0.05
            }
          },
          {
            "code": "STORYTELLING",
            "name": "Storytelling",
            "category": "Content",
            "rarity": "common",
            "effects": {
              "lyricismMultiplier": 1.10,
              "creativityMultiplier": 1.10
            }
          }
        ],
        "win_rate_trend": [
          {
            "battle_number": 1,
            "win_rate": 60.0,
            "date": "2025-11-20T14:22:11Z"
          },
          {
            "battle_number": 2,
            "win_rate": 65.0,
            "date": "2025-11-21T09:15:33Z"
          }
        ]
      }
    ]
  }
}
```

---

## Glossary

| Term | Definition |
|------|-----------|
| **Tier** | Battler difficulty/skill level (Low, Mid, Top, God) |
| **ELO Rating** | Numerical rating (1200-2500) based on battle results |
| **Choke** | Catastrophic failure (85% score penalty) |
| **Stumble** | Minor error (15% score penalty) |
| **Average Score** | Mean performance across all segments (0-10) |
| **Peak Score** | Best single segment performance (0-10) |
| **Consistency** | Standard deviation of segment scores (lower = more consistent) |
| **Crowd Reaction** | Audience enthusiasm (0-100) |
| **Badge** | Stylistic modifier with mechanical effects |
| **Rarity** | Badge power level (Common, Rare, Epic, Legendary) |
| **Admin** | User with special access for balance management |
| **League** | Battle format (Small Room Circuit, Main Stage Arena) |
| **Win Rate** | Percentage of battles won (0-100%) |

---

**Document Version**: 1.0
**Date**: November 30, 2025
**Status**: Design Complete - Ready for Implementation Handoff
