# LEAGUE DETAIL PAGE V0 - COMPREHENSIVE SPECIFICATION

## 1. OVERVIEW

Each league in the game has distinct mechanics, personality, and media presence. This spec defines a League Detail Page where players can explore league characteristics and make strategic decisions.

---

## 2. LEAGUE DATA MODEL

### Core League Fields (from `leagues` table)
```typescript
{
  id: UUID;
  name: string;                 // "Small Room Circuit"
  slug: string;                 // "small-room-circuit"
  round_duration_seconds: number; // 120 or 180
  rounds_per_battle: number;    // 3

  // Judging Weights (sum to 100)
  writing_weight: number;       // e.g., 60
  performance_weight: number;   // e.g., 20
  crowd_reaction_weight: number; // e.g., 20

  // Crowd Mechanics
  base_crowd_factor: number;    // 0.7 to 1.3

  // Personality (from migration 20251124150000)
  personality_style: 'technical' | 'aggressive' | 'diverse' | 'street';
  prestige_level: number;       // 1-10

  // Audience Preferences (0-10 scale)
  audience_favors_lyricism: number;
  audience_favors_delivery: number;
  audience_favors_storytelling: number;
  audience_favors_crowd_engagement: number;

  // Economics
  base_payout: number;
}
```

---

## 3. PAGE SECTIONS

### Section 1: League Header Hero
```
┌───────────────────────────────────────────────────────────────┐
│  [LEAGUE LOGO/BANNER]                                         │
│                                                               │
│  SMALL ROOM CIRCUIT                                           │
│  "Where Pen Game Matters Most"                                │
│                                                               │
│  Style: TECHNICAL | Prestige: ⭐⭐⭐⭐ | Base Payout: $500      │
│                                                               │
│  Total Battles: 234  |  Active Battlers: 45  |  Avg Rating: 1340
│                                                               │
│  [JOIN LEAGUE]  [VIEW SCHEDULE]                               │
└───────────────────────────────────────────────────────────────┘
```

---

### Section 2: Overview Cards (3-Column Grid)

#### Card A: League Identity
```
┌────────────────────────────┐
│ 🎯 LEAGUE IDENTITY         │
├────────────────────────────┤
│ Style: Technical           │
│ Focus: Writing-First       │
│ Round Length: 2 minutes    │
│ Segments: 4 per round      │
│ Vibe: Intimate, focused    │
│        lyrical appreciation │
└────────────────────────────┘
```

#### Card B: Audience Preferences
```
┌────────────────────────────┐
│ 👥 WHAT THE CROWD WANTS    │
├────────────────────────────┤
│ Lyricism:     ████████░░ 8 │
│ Delivery:     ████░░░░░░ 4 │
│ Storytelling: ██████░░░░ 6 │
│ Engagement:   ███░░░░░░░ 3 │
│                            │
│ "This crowd analyzes bars" │
└────────────────────────────┘
```

#### Card C: Battle Mechanics
```
┌────────────────────────────┐
│ ⚙️ HOW BATTLES ARE JUDGED  │
├────────────────────────────┤
│ Writing:      60%   ▓▓▓▓▓▓ │
│ Performance:  20%   ▓▓     │
│ Crowd:        20%   ▓▓     │
│                            │
│ Crowd Factor: 0.85x        │
│ (Less reactive than avg)   │
└────────────────────────────┘
```

---

### Section 3: League Blogger / Media Personality
```
┌───────────────────────────────────────────────────────────────┐
│  📰 LEAGUE MEDIA                                              │
├───────────────────────────────────────────────────────────────┤
│  [BLOGGER AVATAR]                                             │
│                                                               │
│  MARCUS "PENMANSHIP" COLE                                     │
│  "The Small Room Report"                                      │
│                                                               │
│  Coverage Style: Technical analysis, bar-by-bar breakdowns    │
│                                                               │
│  Notable Takes:                                               │
│  • "The 2-minute round exposes who really writes"             │
│  • "Crowd control means nothing without content"              │
│                                                               │
│  Articles Written: 156 | Followers: 12.4K                     │
└───────────────────────────────────────────────────────────────┘
```

---

### Section 4: Battler Roster
```
┌───────────────────────────────────────────────────────────────┐
│  🎤 LEAGUE ROSTER (45 Battlers)                               │
├───────────────────────────────────────────────────────────────┤
│  Sort by: [Rating ▼] [Wins] [Win Rate] [Recent Activity]      │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐  ┌─────────────────────┐            │
│  │ [Avatar]            │  │ [Avatar]            │            │
│  │ CODED FLUX          │  │ PENMASTER JONES     │            │
│  │ Rating: 1890        │  │ Rating: 1720        │            │
│  │ 18-4 | 82% WR       │  │ 14-6 | 70% WR       │            │
│  │ Tier: GOD           │  │ Tier: TOP           │            │
│  │ [View Profile]      │  │ [View Profile]      │            │
│  └─────────────────────┘  └─────────────────────┘            │
│                                                               │
│  [LOAD MORE...]                                               │
└───────────────────────────────────────────────────────────────┘
```

---

### Section 5: Statistics Dashboard
```
┌───────────────────────────────────────────────────────────────┐
│  📊 LEAGUE STATISTICS                                         │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Total Battles (All Time): 234                                │
│  This Month: 28                                               │
│                                                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │ AVG CROWD  │ │ BODY RATE  │ │ CLOSE RATE │               │
│  │   72/100   │ │   22%      │ │   35%      │               │
│  │ "Reserved" │ │ (3-0 wins) │ │ (2-1 wins) │               │
│  └────────────┘ └────────────┘ └────────────┘               │
│                                                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │ AVG RATING │ │ CHOKE RATE │ │ BASE PAY   │               │
│  │   1340     │ │   8%       │ │   $500     │               │
│  └────────────┘ └────────────┘ └────────────┘               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

### Section 6: Recent Articles
```
┌───────────────────────────────────────────────────────────────┐
│  📰 RECENT COVERAGE                                           │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────┐      │
│  │ [BATTLE RECAP]                         Nov 28, 2025 │      │
│  │ "Technical Brilliance: Coded Flux Dominates 3-0"   │      │
│  │ The architect delivered a masterclass in scheme... │      │
│  │ [Read More →]                                      │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  ┌────────────────────────────────────────────────────┐      │
│  │ [UPSET ALERT]                          Nov 26, 2025 │      │
│  │ "Newcomer Shocks Top Tier with Pure Pen Game"      │      │
│  │ In what many are calling the upset of the month... │      │
│  │ [Read More →]                                      │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  [VIEW ALL ARTICLES →]                                        │
└───────────────────────────────────────────────────────────────┘
```

---

### Section 7: Educational Explainer
```
┌───────────────────────────────────────────────────────────────┐
│  ❓ UNDERSTANDING THIS LEAGUE                                 │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  [▼] How League Weights Work                                  │
│      Writing (60%): Lyricism, wordplay, creativity, flow      │
│      Performance (20%): Stage presence, delivery, crowd ctrl  │
│      Crowd (20%): Raw crowd reaction score                    │
│                                                               │
│  [▼] What "Technical" Personality Means                       │
│      Fans here appreciate intricate rhyme schemes,            │
│      multi-syllabic patterns, and dense wordplay.             │
│      Performance flash alone won't cut it.                    │
│                                                               │
│  [▼] How Crowd Factor Affects Your Battles                    │
│      0.85x means crowds are 15% less reactive than average.   │
│      Your bars need to be FIRE to get reactions here.         │
│                                                               │
│  [▼] Prestige & Payout                                        │
│      Higher prestige = more reputation gain per win.          │
│      $500 base payout scales with crowd size and win margin.  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 4. LEAGUE BLOGGER SYSTEM

### Blogger Assignments (Hardcoded V0)

| League | Blogger Name | Blog Name | Style |
|--------|-------------|-----------|-------|
| Small Room Circuit | Marcus "Penmanship" Cole | The Small Room Report | Technical analysis, bar breakdowns |
| Main Stage Arena | Victoria "Vibe Check" Hayes | Main Stage Herald | Performance focus, crowd energy |

### Blogger Data Structure
```typescript
interface LeagueBlogger {
  name: string;
  handle: string;
  blog_name: string;
  avatar_url: string;
  coverage_style: string;
  notable_takes: string[];
  articles_count: number;
  followers: number;
}
```

---

## 5. API ENDPOINTS

### GET /api/leagues/[leagueId]
```typescript
{
  league: {
    id: string;
    name: string;
    slug: string;
    // All league fields...
  };
  blogger: LeagueBlogger;
  stats: {
    totalBattles: number;
    totalBattlers: number;
    avgRating: number;
    avgCrowdReaction: number;
    bodyRate: number;     // % of 3-0 wins
    closeRate: number;    // % of 2-1 wins
    chokeRate: number;    // % of battles with chokes
  };
}
```

### GET /api/leagues/[leagueId]/battlers
```typescript
{
  battlers: Array<{
    id: string;
    stage_name: string;
    tier: string;
    rating: number;
    wins: number;
    losses: number;
    win_rate: number;
    last_active: string;
  }>;
  pagination: {
    page: number;
    total: number;
    hasMore: boolean;
  };
}
```

### GET /api/leagues/[leagueId]/articles
```typescript
{
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    article_type: string;
    published_at: string;
  }>;
}
```

---

## 6. STYLING

### League Style Colors
```css
.league-technical {
  @apply border-blue-500 bg-blue-500/10;
}
.league-aggressive {
  @apply border-red-500 bg-red-500/10;
}
.league-diverse {
  @apply border-purple-500 bg-purple-500/10;
}
.league-street {
  @apply border-orange-500 bg-orange-500/10;
}
```

### Article Type Colors
```css
.article-recap { @apply bg-blue-500/20 text-blue-400; }
.article-upset { @apply bg-orange-500/20 text-orange-400; }
.article-scandal { @apply bg-red-500/20 text-red-400; }
.article-preview { @apply bg-green-500/20 text-green-400; }
```

---

## 7. COMPONENT ARCHITECTURE

```typescript
// components/leagues/LeagueHeader.tsx
interface LeagueHeaderProps {
  league: League;
  stats: LeagueStats;
}

// components/leagues/LeagueOverviewCards.tsx
interface LeagueOverviewCardsProps {
  league: League;
}

// components/leagues/LeagueBloggerCard.tsx
interface LeagueBloggerCardProps {
  blogger: LeagueBlogger;
}

// components/leagues/LeagueRoster.tsx
interface LeagueRosterProps {
  battlers: BattlerSummary[];
  onLoadMore: () => void;
  hasMore: boolean;
}

// components/leagues/LeagueStats.tsx
interface LeagueStatsProps {
  stats: LeagueStats;
}

// components/leagues/LeagueArticles.tsx
interface LeagueArticlesProps {
  articles: Article[];
  leagueSlug: string;
}

// components/leagues/LeagueExplainer.tsx
interface LeagueExplainerProps {
  league: League;
}
```

---

## 8. FILES TO CREATE

```
app/
├── leagues/
│   ├── page.tsx                    // All leagues list
│   └── [slug]/
│       └── page.tsx                // League detail page
├── api/
│   └── leagues/
│       ├── route.ts                // List all leagues
│       └── [leagueId]/
│           ├── route.ts            // League details
│           ├── battlers/route.ts   // League roster
│           └── articles/route.ts   // League articles

components/
└── leagues/
    ├── LeagueHeader.tsx
    ├── LeagueOverviewCards.tsx
    ├── LeagueBloggerCard.tsx
    ├── LeagueRoster.tsx
    ├── LeagueStats.tsx
    ├── LeagueArticles.tsx
    └── LeagueExplainer.tsx
```

---

## 9. IMPLEMENTATION CHECKLIST

- [ ] Create `/api/leagues/[leagueId]` endpoint
- [ ] Create `/leagues/[slug]` page with all sections
- [ ] Add league blogger data structure
- [ ] Create LeagueHeader component
- [ ] Create LeagueOverviewCards component
- [ ] Create LeagueBloggerCard component
- [ ] Create LeagueRoster component with pagination
- [ ] Create LeagueStats component
- [ ] Create LeagueArticles component
- [ ] Create LeagueExplainer collapsible sections
- [ ] Add "Leagues" link to main navigation
