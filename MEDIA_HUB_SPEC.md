# MEDIA HUB V0 - COMPREHENSIVE SPECIFICATION

## 1. OVERVIEW

The Media Hub is the game's central news and content platform, simulating a battle rap media ecosystem with multiple blogger personalities, league coverage, and personalized content. It should feel like browsing WorldStarHipHop, The Source, or a battle rap blog.

**Key Insight**: The game already has 8 distinct blogger personas with sentiment tracking and narrative memory. The UI should showcase these personalities and make the world feel alive.

---

## 2. THE 8 BLOGGERS (Already in Backend)

| Blogger | Specialty | Style |
|---------|-----------|-------|
| **Battle Eyez** | Technical analysis | Play-by-play breakdowns, bar-for-bar analysis |
| **Marijuana Piranha** | Underground/controversy | Raw energy, unfiltered takes, drama-focused |
| **Algorithm Institute** | Data/stats | Data-driven analysis, career trajectories |
| **Small Room Report** | Small venues | Intimate battle coverage, pen game focus |
| **The Main Stage Herald** | Big stages | Major event coverage, mainstream appeal |
| **Underground Voice** | Culture/community | Scene politics, culture commentary |
| **Coast to Coast Coverage** | Regional | Geographic focus, local scenes |
| **The Battle Breakdown** | Strategy | Round-by-round strategy, what went wrong/right |

---

## 3. PAGE STRUCTURE

### 3.1 Hero Section: Featured Story
```
┌───────────────────────────────────────────────────────────────────────────┐
│  [FEATURED IMAGE/VIDEO THUMBNAIL - Full Width]                            │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐│
│  │ BATTLE RECAP                                                        ││
│  │                                                                      ││
│  │ "CODED FLUX BODIES TRU FOE IN DOMINANT 3-0 SHOWING"                  ││
│  │                                                                      ││
│  │ By Battle Eyez | Small Room Circuit | 2 hours ago                   ││
│  │                                                                      ││
│  │ [READ FULL ARTICLE →]                                               ││
│  └──────────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────────────┘
```

---

### 3.2 Tab Navigation
```
┌───────────────────────────────────────────────────────────────────────────┐
│  [FOR YOU]  [LATEST]  [BATTLE RECAPS]  [SCANDALS]  [RANKINGS]  [BLOGGERS] │
└───────────────────────────────────────────────────────────────────────────┘
```

**Tab Descriptions:**
- **For You**: Personalized feed - articles featuring your battler, your league, your rivals
- **Latest**: Chronological feed of all articles
- **Battle Recaps**: Battle coverage only
- **Scandals**: Drama, controversies, beef
- **Rankings**: Power rankings, tier lists, predictions
- **Bloggers**: Explore the 8 blogger personalities

---

### 3.3 "FOR YOU" Tab (Personalized)

**Logic**: Show articles that mention the player's battler, opponents they've faced, their league, or their city/region.

```
┌───────────────────────────────────────────────────────────────────────────┐
│  FOR YOU                                                                  │
│  Stories featuring you and your scene                                     │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  YOUR COVERAGE                                                            │
│  ┌────────────────────────────────┐  ┌────────────────────────────────┐  │
│  │ [🎤 YOUR BATTLE]               │  │ [📊 YOUR CAREER]               │  │
│  │ "Stage Name Shows Up..."       │  │ "Rising Through the Ranks"    │  │
│  │ By Algorithm Institute         │  │ By Coast to Coast             │  │
│  │ Nov 28                         │  │ Nov 25                        │  │
│  └────────────────────────────────┘  └────────────────────────────────┘  │
│                                                                           │
│  ABOUT YOUR OPPONENTS                                                     │
│  ┌────────────────────────────────┐  ┌────────────────────────────────┐  │
│  │ [⚔️ RIVAL UPDATE]              │  │ [😤 SCANDAL]                   │  │
│  │ "Tru Foe Looking for Revenge"  │  │ "Drama in the Small Room"     │  │
│  │ By Underground Voice           │  │ By Marijuana Piranha          │  │
│  │ Nov 27                         │  │ Nov 24                        │  │
│  └────────────────────────────────┘  └────────────────────────────────┘  │
│                                                                           │
│  YOUR LEAGUE                                                              │
│  ┌────────────────────────────────┐                                      │
│  │ [🏆 LEAGUE UPDATE]             │                                      │
│  │ "Small Room Circuit Rankings"  │                                      │
│  │ By Small Room Report           │                                      │
│  │ Nov 26                         │                                      │
│  └────────────────────────────────┘                                      │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

**Personalization Query**:
```typescript
// Get articles relevant to player
const playerBattlerId = battler.id;
const playerLeagueId = battler.primary_league_id;
const playerRegion = battler.region;
const opponentIds = [...recentOpponents, ...rivalIds];

// Query articles where:
// - primary_battler_id = playerBattlerId (about me)
// - secondary_battler_id = playerBattlerId (I'm mentioned)
// - primary_battler_id IN opponentIds (about my opponents)
// - league_id = playerLeagueId (my league news)
```

---

### 3.4 "LATEST" Tab (Chronological Feed)

Standard reverse-chronological article list:

```
┌───────────────────────────────────────────────────────────────────────────┐
│  LATEST NEWS                                                              │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ [BATTLE RECAP]                                        2 hours ago   │ │
│  │ "Coded Flux Bodies Tru Foe in Dominant 3-0 Showing"                 │ │
│  │ Small Room Circuit | By Battle Eyez                                 │ │
│  │                                                                      │ │
│  │ The technical mastermind delivered a masterclass in scheme work... │ │
│  │ [Continue Reading →]                                                │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ [SCANDAL]                                             5 hours ago   │ │
│  │ "Beef Brewing Between NYC and Philly Scenes"                        │ │
│  │ By Marijuana Piranha                                                │ │
│  │                                                                      │ │
│  │ Tensions are rising after last week's controversial decision...    │ │
│  │ [Continue Reading →]                                                │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  [LOAD MORE...]                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

### 3.5 "BLOGGERS" Tab (Personality Showcase)

Show the 8 blogger personas as explorable profiles:

```
┌───────────────────────────────────────────────────────────────────────────┐
│  THE BLOGGERS                                                             │
│  Meet the voices of battle rap media                                      │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │ [AVATAR]         │  │ [AVATAR]         │  │ [AVATAR]         │        │
│  │                  │  │                  │  │                  │        │
│  │ BATTLE EYEZ      │  │ MARIJUANA        │  │ ALGORITHM        │        │
│  │                  │  │ PIRANHA          │  │ INSTITUTE        │        │
│  │ "The Technical   │  │                  │  │                  │        │
│  │  Analyst"        │  │ "The Underground │  │ "The Data        │        │
│  │                  │  │  Insider"        │  │  Scientist"      │        │
│  │ 156 Articles     │  │                  │  │                  │        │
│  │ 12.4K Followers  │  │ 87 Articles      │  │ 203 Articles     │        │
│  │                  │  │ 8.2K Followers   │  │ 15.1K Followers  │        │
│  │ [VIEW PROFILE]   │  │ [VIEW PROFILE]   │  │ [VIEW PROFILE]   │        │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘        │
│                                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │ SMALL ROOM       │  │ MAIN STAGE       │  │ UNDERGROUND      │        │
│  │ REPORT           │  │ HERALD           │  │ VOICE            │        │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘        │
│                                                                           │
│  ┌──────────────────┐  ┌──────────────────┐                              │
│  │ COAST TO COAST   │  │ THE BATTLE       │                              │
│  │ COVERAGE         │  │ BREAKDOWN        │                              │
│  └──────────────────┘  └──────────────────┘                              │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

### 3.6 Blogger Profile Page (`/media/bloggers/[slug]`)

When clicking a blogger, show their full profile and articles:

```
┌───────────────────────────────────────────────────────────────────────────┐
│  [LARGE AVATAR]                                                           │
│                                                                           │
│  BATTLE EYEZ                                                              │
│  "The Technical Analyst"                                                  │
│  ──────────────────────────────────────────────────────────────────────── │
│                                                                           │
│  SPECIALTY: Play-by-play analysis, bar breakdowns, technical scoring     │
│                                                                           │
│  BIO: Battle Eyez has been covering the scene for over a decade.         │
│  Known for detailed round-by-round breakdowns and calling out who        │
│  really won controversial battles. If you want to know who had the       │
│  better pen, Battle Eyez has the receipts.                               │
│                                                                           │
│  STATS:                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ 156        │  │ 12.4K      │  │ Small Room │  │ Battle     │         │
│  │ Articles   │  │ Followers  │  │ Circuit    │  │ Recaps     │         │
│  │            │  │            │  │ Home Base  │  │ Specialty  │         │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘         │
│                                                                           │
│  ──────────────────────────────────────────────────────────────────────── │
│                                                                           │
│  NOTABLE TAKES:                                                           │
│  • "Writing wins battles. Performance just gets you booked."              │
│  • "If you can't scheme, you can't win in the small room."               │
│  • "The 2-minute round exposes who really writes."                       │
│                                                                           │
│  ──────────────────────────────────────────────────────────────────────── │
│                                                                           │
│  BATTLERS THEY FOLLOW:                                                    │
│  [Coded Flux] [JC] [Chilla Jones] [B Magic] [+8 more]                    │
│                                                                           │
│  ──────────────────────────────────────────────────────────────────────── │
│                                                                           │
│  RECENT ARTICLES BY BATTLE EYEZ:                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ "Coded Flux Bodies Tru Foe" | Battle Recap | 2 hours ago            │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ "Technical Breakdown: How JC Lost" | Battle Recap | 3 days ago      │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

### 3.7 Sidebar Widgets

**Right sidebar (desktop) or below main content (mobile):**

#### A. Trending Topics
```
┌────────────────────────────┐
│ 🔥 TRENDING                │
├────────────────────────────┤
│ #1 Coded Flux 3-0 Victory  │
│ #2 NYC vs Philly Beef      │
│ #3 Tournament Bracket Drop │
│ #4 Rookie of the Month     │
│ #5 Choke Compilation       │
└────────────────────────────┘
```

#### B. Hot Rivalries
```
┌────────────────────────────┐
│ ⚔️ HOT RIVALRIES           │
├────────────────────────────┤
│ Stage Name vs Tru Foe      │
│ Intensity: 🔥🔥🔥🔥🔥         │
│ H2H: 2-1                   │
│ [Follow This Rivalry]      │
├────────────────────────────┤
│ Coded Flux vs JC           │
│ Intensity: 🔥🔥🔥            │
│ H2H: 1-1                   │
│ [Follow This Rivalry]      │
└────────────────────────────┘
```

#### C. Your Media Presence
```
┌────────────────────────────┐
│ 📊 YOUR MEDIA STATS        │
├────────────────────────────┤
│ Articles About You: 12     │
│ Mentions: 28               │
│ Sentiment: 72% Positive    │
│                            │
│ Most Coverage By:          │
│ • Battle Eyez (5 articles) │
│ • Algorithm Institute (3)  │
│                            │
│ [View All Coverage →]      │
└────────────────────────────┘
```

#### D. Quick Filters
```
┌────────────────────────────┐
│ 🔍 QUICK FILTERS           │
├────────────────────────────┤
│ League:                    │
│ [All ▼]                    │
│                            │
│ Region:                    │
│ [All ▼]                    │
│                            │
│ Time:                      │
│ [This Week ▼]              │
└────────────────────────────┘
```

---

## 4. ARTICLE DETAIL PAGE (`/media/[slug]`)

```
┌───────────────────────────────────────────────────────────────────────────┐
│  ← Back to Media Hub                                                      │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  [BATTLE RECAP]                                                           │
│                                                                           │
│  CODED FLUX BODIES TRU FOE IN DOMINANT 3-0 SHOWING                       │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐│
│  │ [BLOGGER AVATAR]  BATTLE EYEZ | Small Room Circuit | Nov 28, 2025   ││
│  └──────────────────────────────────────────────────────────────────────┘│
│                                                                           │
│  [ARTICLE BODY - MARKDOWN RENDERED]                                       │
│                                                                           │
│  The technical mastermind delivered a masterclass in scheme work at      │
│  the Small Room Circuit last night, dismantling Tru Foe in what can     │
│  only be described as a clinic.                                          │
│                                                                           │
│  ## Round 1: Setting the Tone                                            │
│                                                                           │
│  From the opening segment, it was clear Coded Flux came prepared.        │
│  His multi-syllabic patterns and callback schemes had the intimate      │
│  crowd on their feet...                                                  │
│                                                                           │
│  [... rest of article ...]                                               │
│                                                                           │
│  ──────────────────────────────────────────────────────────────────────── │
│                                                                           │
│  BATTLERS IN THIS ARTICLE:                                                │
│  ┌─────────────┐  ┌─────────────┐                                        │
│  │ [Avatar]    │  │ [Avatar]    │                                        │
│  │ Coded Flux  │  │ Tru Foe     │                                        │
│  │ 1890 Rating │  │ 1375 Rating │                                        │
│  │ [Profile]   │  │ [Profile]   │                                        │
│  └─────────────┘  └─────────────┘                                        │
│                                                                           │
│  ──────────────────────────────────────────────────────────────────────── │
│                                                                           │
│  RELATED COVERAGE:                                                        │
│  • "Pre-Battle: Coded Flux vs Tru Foe Preview" - Algorithm Institute     │
│  • "Tru Foe's Comeback Story" - Underground Voice                        │
│  • "Small Room Power Rankings (Week 4)" - Small Room Report              │
│                                                                           │
│  ──────────────────────────────────────────────────────────────────────── │
│                                                                           │
│  MORE FROM BATTLE EYEZ:                                                   │
│  • "Technical Breakdown: How JC Lost" - 3 days ago                       │
│  • "Bar Analysis: Best Wordplay of November" - 1 week ago                │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 5. API ENDPOINTS

### GET /api/news (Enhanced)
Add new query params:
```typescript
{
  // Existing
  type?: string;
  league_id?: string;
  battler_id?: string;
  limit?: number;

  // New
  for_battler_id?: string;     // Personalized feed for this battler
  blogger?: string;            // Filter by blogger name
  region?: string;             // Filter by region
  include_opponents?: boolean; // Include articles about player's opponents
  trending?: boolean;          // Return trending articles
}
```

### GET /api/news/for-you
Personalized feed endpoint:
```typescript
{
  about_me: NewsArticle[];      // Articles where I'm primary/secondary
  about_opponents: NewsArticle[]; // Articles about people I've battled
  my_league: NewsArticle[];     // League news
  my_region: NewsArticle[];     // Regional news
}
```

### GET /api/news/trending
```typescript
{
  trending: Array<{
    topic: string;
    article_count: number;
    recent_article: NewsArticle;
  }>;
}
```

### GET /api/bloggers
```typescript
{
  bloggers: Array<{
    name: string;
    slug: string;
    title: string;
    specialty: string;
    bio: string;
    avatar_url: string;
    article_count: number;
    follower_count: number;
    home_league: string;
    notable_takes: string[];
    followed_battlers: BattlerSummary[];
  }>;
}
```

### GET /api/bloggers/[slug]
Full blogger profile with articles.

### GET /api/battler/[id]/media-stats
```typescript
{
  total_articles_about: number;
  total_mentions: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  coverage_by_blogger: Array<{
    blogger: string;
    article_count: number;
    sentiment: number;
  }>;
  trending_rank: number | null;
}
```

---

## 6. BLOGGER DATA (Hardcoded for V0)

```typescript
const BLOGGERS = [
  {
    name: 'Battle Eyez',
    slug: 'battle-eyez',
    title: 'The Technical Analyst',
    specialty: 'Battle Recaps',
    bio: 'Battle Eyez has been covering the scene for over a decade. Known for detailed round-by-round breakdowns and calling out who really won controversial battles.',
    notable_takes: [
      'Writing wins battles. Performance just gets you booked.',
      'If you can\'t scheme, you can\'t win in the small room.',
      'The 2-minute round exposes who really writes.',
    ],
    home_league: 'Small Room Circuit',
    avatar_style: 'serious, analytical',
  },
  {
    name: 'Marijuana Piranha',
    slug: 'marijuana-piranha',
    title: 'The Underground Insider',
    specialty: 'Scandals & Drama',
    bio: 'MP keeps it raw and unfiltered. If there\'s beef, drama, or controversy, MP was there first. Not afraid to call out anyone, from rookies to legends.',
    notable_takes: [
      'The culture needs drama to survive.',
      'Half these battlers are industry plants.',
      'Real recognizes real, and most of y\'all are fake.',
    ],
    home_league: null, // Independent
    avatar_style: 'edgy, controversial',
  },
  {
    name: 'Algorithm Institute',
    slug: 'algorithm-institute',
    title: 'The Data Scientist',
    specialty: 'Career Updates & Rankings',
    bio: 'AI brings the numbers. Career trajectories, win rates, rating predictions - if it can be quantified, AI has the data. The most objective voice in battle rap media.',
    notable_takes: [
      'Stats don\'t lie, battlers do.',
      'Rating inflation is killing the scene.',
      'Historical analysis > hot takes.',
    ],
    home_league: null, // Both leagues
    avatar_style: 'professional, data-focused',
  },
  {
    name: 'Small Room Report',
    slug: 'small-room-report',
    title: 'The Pen Game Purist',
    specialty: 'Small Room Coverage',
    bio: 'SRR lives and breathes the Small Room Circuit. Champions pen game over performance, intimate crowds over stadium shows. The voice of lyrical purists.',
    notable_takes: [
      'Bars over performance, always.',
      'The small room is where legends are made.',
      'If you need a big crowd to win, you\'re not a real writer.',
    ],
    home_league: 'Small Room Circuit',
    avatar_style: 'underground, writer-focused',
  },
  {
    name: 'The Main Stage Herald',
    slug: 'main-stage-herald',
    title: 'The Big Stage Specialist',
    specialty: 'Main Stage Coverage',
    bio: 'Herald covers the biggest battles on the biggest stages. Major events, championship bouts, and everything that draws a crowd. Performance matters here.',
    notable_takes: [
      'If you can\'t rock a crowd, you can\'t be a champion.',
      'Main stage pressure separates the real from the rest.',
      'Entertainment value is part of the art.',
    ],
    home_league: 'Main Stage Arena',
    avatar_style: 'flashy, mainstream',
  },
  {
    name: 'Underground Voice',
    slug: 'underground-voice',
    title: 'The Culture Keeper',
    specialty: 'Culture & Community',
    bio: 'UV speaks for the culture. Scene politics, community issues, and the stories behind the stories. If it affects the battlers, UV is covering it.',
    notable_takes: [
      'Battle rap is more than bars and performance.',
      'The culture is the people.',
      'We need to protect the community.',
    ],
    home_league: null,
    avatar_style: 'community-focused, thoughtful',
  },
  {
    name: 'Coast to Coast Coverage',
    slug: 'coast-to-coast-coverage',
    title: 'The Regional Reporter',
    specialty: 'Regional News',
    bio: 'C2C tracks the scenes across all regions. NYC vs LA, Midwest grind, Southern style, international exposure - C2C has correspondents everywhere.',
    notable_takes: [
      'Every city has its own flavor.',
      'Regional pride drives the best battles.',
      'Don\'t sleep on the underground scenes.',
    ],
    home_league: null,
    avatar_style: 'well-traveled, diverse',
  },
  {
    name: 'The Battle Breakdown',
    slug: 'the-battle-breakdown',
    title: 'The Strategy Guru',
    specialty: 'Strategic Analysis',
    bio: 'TBB breaks down the chess match. What worked, what didn\'t, and why. If you want to understand how to win battles, TBB has the blueprint.',
    notable_takes: [
      'Every loss is a lesson.',
      'Preparation beats natural talent.',
      'Study your opponent or get studied.',
    ],
    home_league: null,
    avatar_style: 'strategic, educational',
  },
];
```

---

## 7. STYLING

### Article Type Colors (existing)
```css
.type-battle_recap { @apply bg-blue-500/20 text-blue-400 border-blue-500/30; }
.type-scandal { @apply bg-red-500/20 text-red-400 border-red-500/30; }
.type-career_update { @apply bg-green-500/20 text-green-400 border-green-500/30; }
.type-league_update { @apply bg-purple-500/20 text-purple-400 border-purple-500/30; }
.type-power_ranking { @apply bg-yellow-500/20 text-yellow-400 border-yellow-500/30; }
```

### Blogger Accent Colors (new)
```css
.blogger-battle-eyez { @apply border-l-4 border-l-blue-500; }
.blogger-marijuana-piranha { @apply border-l-4 border-l-red-500; }
.blogger-algorithm-institute { @apply border-l-4 border-l-cyan-500; }
.blogger-small-room-report { @apply border-l-4 border-l-orange-500; }
.blogger-main-stage-herald { @apply border-l-4 border-l-yellow-500; }
.blogger-underground-voice { @apply border-l-4 border-l-purple-500; }
.blogger-coast-to-coast { @apply border-l-4 border-l-green-500; }
.blogger-battle-breakdown { @apply border-l-4 border-l-pink-500; }
```

---

## 8. COMPONENT ARCHITECTURE

```typescript
// Page
app/media/page.tsx                    // Media Hub
app/media/[slug]/page.tsx             // Article Detail
app/media/bloggers/page.tsx           // All Bloggers
app/media/bloggers/[slug]/page.tsx    // Blogger Profile

// Components
components/media/
├── MediaHero.tsx                     // Featured story hero
├── MediaTabs.tsx                     // Tab navigation
├── ArticleCard.tsx                   // Article preview card
├── ArticleList.tsx                   // List of articles
├── ArticleFull.tsx                   // Full article view
├── BloggerCard.tsx                   // Blogger preview card
├── BloggerProfile.tsx                // Full blogger profile
├── TrendingWidget.tsx                // Trending topics sidebar
├── RivalriesWidget.tsx               // Hot rivalries sidebar
├── MediaStatsWidget.tsx              // Your media presence
├── ForYouFeed.tsx                    // Personalized feed
├── PersonalizedSection.tsx           // Section with personalization
└── RelatedArticles.tsx               // Related coverage
```

---

## 9. KEY USER FLOWS

### Flow 1: Check Your Coverage
1. Player opens Media Hub
2. Defaults to "For You" tab
3. Sees articles featuring them at top
4. Clicks "Your Media Stats" widget
5. Sees which bloggers cover them most, overall sentiment

### Flow 2: Follow a Rivalry
1. Player sees "Hot Rivalries" widget
2. Clicks their rivalry with an opponent
3. Sees all articles about that matchup
4. Understands the narrative being built

### Flow 3: Discover a Blogger
1. Player clicks "Bloggers" tab
2. Browses 8 personalities
3. Clicks one to see their profile
4. Reads their recent takes and followed battlers
5. Understands which blogger is most relevant to them

### Flow 4: Research an Opponent
1. Player has upcoming battle
2. Searches/filters for opponent's name
3. Reads coverage about opponent
4. Gets intel on their strengths, weaknesses, recent performance

---

## 10. IMPLEMENTATION CHECKLIST

### Phase 1: Core Structure
- [ ] Refactor media page to use tabs
- [ ] Add "For You" personalized feed
- [ ] Add featured story hero section
- [ ] Implement sidebar widgets (trending, rivalries)

### Phase 2: Blogger System
- [ ] Create `/api/bloggers` endpoint
- [ ] Create blogger profiles page
- [ ] Add blogger byline to articles
- [ ] Color-code articles by blogger

### Phase 3: Personalization
- [ ] Create `/api/news/for-you` endpoint
- [ ] Track player's opponents for relevant news
- [ ] Add "Your Media Stats" widget
- [ ] Show media sentiment about player

### Phase 4: Polish
- [ ] Add search functionality
- [ ] Add region filtering
- [ ] Improve article detail page
- [ ] Add related articles section
- [ ] Mobile responsive design

---

## 11. WHAT TO REMOVE

The current page showing "city at the top" should be replaced entirely with this new design. The city/region filter can be a dropdown in the sidebar, not the main focus.

---

## 12. SUMMARY

The Media Hub transforms from a simple article list into a living, breathing media ecosystem with:

1. **Personalized "For You" feed** - Shows content relevant to the player
2. **8 Distinct Blogger Personalities** - Each with their own beat and style
3. **Media Presence Tracking** - Players can see how they're being covered
4. **Trending & Rivalries** - Makes the world feel active and dramatic
5. **Article Types as First-Class Citizens** - Color-coded, filterable content

This creates narrative depth and makes players feel like their battler exists in a real media landscape.
