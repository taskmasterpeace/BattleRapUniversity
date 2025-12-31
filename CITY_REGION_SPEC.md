# CITY & REGION SYSTEM V0 - COMPREHENSIVE SPECIFICATION

## 1. OVERVIEW

The game has a foundational **cities system** (migration `20251125030000_add_time_economy_cities.sql`) that establishes geographic depth. This spec outlines how to expose regional features as core navigation and discovery.

---

## 2. EXISTING INFRASTRUCTURE

### Cities Table
```sql
CREATE TABLE cities (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  state TEXT,
  country TEXT DEFAULT 'USA',
  scene_size TEXT CHECK (scene_size IN ('small', 'medium', 'large', 'major')),
  culture_style TEXT CHECK (culture_style IN ('technical', 'aggressive', 'diverse', 'street')),
  created_at TIMESTAMP
);
```

### Seeded Cities (10 major battle rap hubs)
- **Major** (2): New York City (NY), Los Angeles (CA)
- **Large** (4): Philadelphia (PA), Detroit (MI), Chicago (IL), Toronto (ON)
- **Medium** (4): Atlanta (GA), Houston (TX), Oakland (CA), London (UK)

### Regional Badges (from `getRegionalBadge()`)
| Region | Badge |
|--------|-------|
| NYC area | NYC Native |
| Philadelphia | Philly Rep |
| Detroit | Detroit Made |
| Chicago | Chicago Bred |
| LA area | LA Native |
| Bay Area | Bay Area Rep |
| Atlanta | ATL Rep |
| Houston | Houston Made |
| DMV | DMV Native |
| Miami | Miami Heat |
| Toronto | Toronto Rep |
| UK | UK Native |
| Default | Underground Rep |

---

## 3. FEATURE 1: CITY DRILL-DOWN PAGE

**Route:** `/regions/[slug]` (e.g., `/regions/new-york-city`)

### Header Section (City Profile)
```
┌─────────────────────────────────────┐
│  NEW YORK CITY                      │
│  New York, USA                      │
│  Scene Size: MAJOR | Culture: DIVERSE
│  ────────────────────────────────   │
│  Total Battlers: 34                 │
│  Avg Rating: 1247                   │
│  Win Rate (City vs Others): 62%      │
│  Recent Activity: 8 battles this week
└─────────────────────────────────────┘
```

### Power Rankings (City Leaderboard)
```
┌──────────────────────────────────────┐
│  NYC POWER RANKINGS                  │
├──────────────────────────────────────┤
│ 1. [AVATAR] Stage Name       1450 pts │
│    Tier: TOP | 12-3 record | 80% wr  │
│    Regional Badge: NYC Native        │
├──────────────────────────────────────┤
│ 2. [AVATAR] Young Lyricist   1380 pts │
│    Tier: MID | 8-4 record | 67% wr   │
│    Regional Badge: NYC Native        │
└──────────────────────────────────────┘
```

### Table Columns
- Rank (by rating)
- Battler Avatar + Stage Name
- Tier Badge (LOW/MID/TOP/GOD)
- Rating
- W-L Record
- Win Rate %
- Style Tags
- Recent Activity

### Regional Badge Showcase
```
┌──────────────────────────────────────┐
│  NYC NATIVE BADGE                    │
│  "Born & Raised in the Culture"      │
│  Held by: 23 battlers                │
│  Effect: +5% crowd reaction when     │
│  battling from home court            │
└──────────────────────────────────────┘
```

### Recent Battles from This City
```
┌──────────────────────────────────────┐
│  RECENT NYC BATTLES                  │
├──────────────────────────────────────┤
│ Stage Name (NYC) vs Stage Name (LA)  │
│ 2-1 Victory | Nov 28 | Crowd: 78/85  │
└──────────────────────────────────────┘
```

---

## 4. FEATURE 2: DASHBOARD REGIONAL SECTION

**Location:** Dashboard (`/dashboard`) - Below "Recent Battles"

### Section: "YOUR REGIONAL SCENE"
```
┌─────────────────────────────────────────────────────────┐
│  YOUR REGIONAL SCENE                                    │
│  You: NYC Native | Primary League: Small Room Circuit   │
├─────────────────────────────────────────────────────────┤
│  Select Region to Compare:                             │
│  [NYC ★] [LA] [Philly] [Detroit] [Chicago]             │
│                                                         │
│  YOUR CITY: NEW YORK CITY                              │
│  Your Rank: #3 (1380 rating) | #1 Opponent: 1450       │
│  Record vs City: 8-2 (80% wr)                           │
│  Record vs Other Cities: 4-6 (40% wr)                   │
│                                                         │
│  TOP BATTLERS IN NYC                                    │
│  1. [Avatar] King of Words      1480 | TOP Tier        │
│  2. [Avatar] Lyric Storm        1390 | MID Tier        │
│  3. [YOU]   Stage Name          1380 | MID Tier        │
│                                                         │
│  [VIEW FULL RANKINGS]  [SWITCH CITY]                    │
└─────────────────────────────────────────────────────────┘
```

---

## 5. API ENDPOINTS

### GET /api/cities/[slug]
```typescript
{
  city: {
    id: string;
    name: string;
    state: string;
    country: string;
    scene_size: 'small' | 'medium' | 'large' | 'major';
    culture_style: 'technical' | 'aggressive' | 'diverse' | 'street';
  };
  stats: {
    totalBattlers: number;
    totalBattlesInCity: number;
    avgRating: number;
    avgWinRate: number;
    avgCrowdReaction: number;
  };
  rankings: Array<{
    rank: number;
    battler: {
      id: string;
      stage_name: string;
      region: string;
      tier: string;
      avatar_url: string;
      style_tags: string[];
    };
    ranking: {
      rating: number;
      wins: number;
      losses: number;
      streak: number;
    };
  }>;
  recentBattles: Array<{
    id: string;
    date: string;
    battlerA: { stage_name: string; region: string; };
    battlerB: { stage_name: string; region: string; };
    winner: string;
    verdict: string;
  }>;
  regionalBadgeInfo: {
    badge_name: string;
    description: string;
    holder_count: number;
    effects: string;
  };
}
```

### GET /api/dashboard/regional-summary
```typescript
{
  playerCity: string;
  playerCitySlug: string;
  playerRankInCity: number;
  playerCityStats: {
    totalBattlers: number;
    totalBattlesThisWeek: number;
    recordVsCity: { wins: number; losses: number; };
    recordVsOthers: { wins: number; losses: number; };
  };
  topBattlersInCity: Array<{
    rank: number;
    id: string;
    stage_name: string;
    rating: number;
    tier: string;
  }>;
  regionComparisons: Array<{
    city_name: string;
    city_slug: string;
    top_battler_rating: number;
    total_battlers: number;
  }>;
}
```

---

## 6. CITY TIER STYLING

| Scene Size | Display | Styling |
|-----------|---------|---------|
| major | "MAJOR LEAGUE CITY" | Gold accent, larger header |
| large | "MAJOR BATTLE HUB" | Silver accent |
| medium | "REGIONAL SCENE" | Standard accent |
| small | "UNDERGROUND" | Muted colors |

```css
.city-major {
  @apply border-yellow-500 bg-yellow-500/10;
}
.city-large {
  @apply border-gray-400 bg-gray-400/10;
}
.city-medium {
  @apply border-orange-500 bg-orange-500/10;
}
.city-small {
  @apply border-zinc-700 bg-zinc-800;
}
```

### Culture Style Icons
| Style | Icon/Treatment |
|-------|---------------|
| technical | Binary symbols, code aesthetic |
| aggressive | Fire emoji, bold red accents |
| diverse | Multi-color gradient |
| street | Graffiti style font |

---

## 7. COMPONENT ARCHITECTURE

```typescript
// components/regions/CityHeader.tsx
interface CityHeaderProps {
  city: City;
  stats: CityStats;
}

// components/regions/PowerRankings.tsx
interface PowerRankingsProps {
  battlers: RankedBattler[];
  cityName: string;
  highlightBattlerId?: string; // Highlight player
}

// components/regions/RecentBattlesSection.tsx
interface RecentBattlesProps {
  battles: CityBattle[];
  cityName: string;
}

// components/regions/RegionalBadgeCard.tsx
interface RegionalBadgeCardProps {
  badgeName: string;
  description: string;
  holderCount: number;
  effects: string[];
}

// components/dashboard/RegionalSceneWidget.tsx
interface RegionalSceneWidgetProps {
  playerCity: string;
  playerRankInCity: number;
  topBattlers: BattlerSummary[];
  stats: CityStats;
}
```

---

## 8. DATABASE QUERIES

### Fetch City with Stats
```sql
SELECT
  c.*,
  COUNT(DISTINCT b.id) as total_battlers,
  AVG(r.rating) as avg_rating
FROM cities c
LEFT JOIN battlers b ON b.region ILIKE '%' || c.name || '%'
LEFT JOIN rankings r ON r.battler_id = b.id
WHERE c.name = $1
GROUP BY c.id;
```

### Top Battlers from City
```sql
SELECT
  ROW_NUMBER() OVER (ORDER BY r.rating DESC) as rank,
  b.id, b.stage_name, b.region, b.tier, b.style_tags,
  r.rating, r.wins, r.losses, r.streak
FROM battlers b
LEFT JOIN rankings r ON r.battler_id = b.id
WHERE b.region ILIKE '%' || $1 || '%'
ORDER BY r.rating DESC;
```

---

## 9. FILES TO CREATE

```
app/
├── regions/
│   ├── page.tsx                    // Region index (all cities)
│   └── [slug]/
│       └── page.tsx                // City drill-down
├── api/
│   └── cities/
│       ├── route.ts                // List all cities
│       └── [slug]/
│           └── route.ts            // Single city + stats

components/
├── regions/
│   ├── CityHeader.tsx
│   ├── PowerRankings.tsx
│   ├── RecentBattlesSection.tsx
│   ├── RegionalBadgeCard.tsx
│   └── CitySelector.tsx
└── dashboard/
    └── RegionalSceneWidget.tsx
```

---

## 10. IMPLEMENTATION CHECKLIST

- [ ] Create `/api/cities/[slug]` endpoint
- [ ] Create `/regions/[slug]` page with:
  - [ ] City header with stats
  - [ ] Power rankings table
  - [ ] Recent battles section
  - [ ] Regional badge card
- [ ] Add Regional Scene widget to dashboard
- [ ] Add "Regions" link to main navigation
- [ ] Create city slug generation utility
- [ ] Implement city search/selector
