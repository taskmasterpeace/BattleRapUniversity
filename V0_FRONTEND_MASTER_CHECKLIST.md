# V0 FRONTEND MASTER CHECKLIST

## Complete Frontend Implementation Checklist for Battle Rap University

This document consolidates ALL frontend tasks from the spec documents. Use this as your master guide for building the UI.

---

## PRIORITY LEVELS
- **P0** = Critical - Game won't function without this
- **P1** = High - Core feature, needed for V0 launch
- **P2** = Medium - Enhances experience
- **P3** = Low - Nice to have

---

## SECTION 1: LIFE EVENTS SYSTEM
**Spec Document:** `LIFE_EVENTS_UI_V0_DETAILED.md`

### Pages
- [ ] **P0** `/life-events` - Pending events list page
- [x] **P0** `/life-events/[id]` - Event resolution page (exists)
- [x] **P0** `/life-events/history` - Resolved events history (exists)

### Components
- [x] **P0** `PendingLifeEventsWidget` - Dashboard widget (exists)
- [ ] **P1** `LifeEventCard` - Reusable event card
- [x] **P0** `LifeEventResolutionClient` - Resolution page UI (exists)
- [x] **P0** `LifeEventHistoryClient` - History page UI (exists)
- [ ] **P1** `ChoiceCard` - A/B choice display
- [ ] **P1** `EffectBadge` - Stat change badge
- [ ] **P1** `CategoryBadge` - Event category display
- [ ] **P1** `SeverityBadge` - Event severity display
- [ ] **P2** `EventContextCard` - Battle context display
- [ ] **P1** `BattleTriggeredAlert` - Post-battle alert

### Integration
- [x] **P0** Dashboard shows `PendingLifeEventsWidget` (done)
- [ ] **P1** Battle results page shows triggered events alert
- [ ] **P1** Notification system includes life event type
- [ ] **P2** Navigation links in header/sidebar

### Styling/Constants
- [ ] **P1** `lib/constants/lifeEventStyles.ts` - Category/severity colors
- [ ] **P2** Entry animations (slide-in, hover, shake)
- [ ] **P2** Mobile responsive layouts

---

## SECTION 2: BLOGGER & MEDIA SYSTEM
**Spec Documents:** `BLOGGER_SYSTEM_V0_DETAILED.md`, `MEDIA_HUB_SPEC.md`

### Pages
- [ ] **P1** `/media` - Media hub landing page
- [ ] **P1** `/media/[slug]` - Article detail page
- [ ] **P1** `/bloggers` - All bloggers listing
- [ ] **P1** `/bloggers/[slug]` - Blogger profile page
- [ ] **P2** `/media/your-coverage` - Player's media coverage

### Components - Media Hub
- [ ] **P1** `MediaHubClient` - Main media page
- [ ] **P1** `ArticleCard` - Article preview card
- [ ] **P1** `ForYouFeed` - Personalized article feed
- [ ] **P1** `TrendingTopics` - Trending sidebar widget
- [ ] **P2** `HotRivalries` - Rivalries sidebar widget
- [ ] **P2** `YourMediaStats` - Player media presence card
- [ ] **P2** `QuickFilters` - Filter sidebar

### Components - Blogger System
- [ ] **P1** `BloggerCard` - Blogger preview card
- [ ] **P1** `BloggerProfileHeader` - Profile page header
- [ ] **P1** `BloggerStats` - Blogger statistics display
- [ ] **P1** `BloggerArticleList` - Articles by blogger
- [ ] **P2** `BloggerSentimentChart` - Battler sentiment tracker
- [ ] **P2** `NotableTakes` - Blogger quotes display
- [ ] **P2** `BattlersTheyFollow` - Followed battlers

### Components - Article Detail
- [ ] **P1** `ArticleDetailClient` - Full article page
- [ ] **P1** `ArticleHeader` - Title, author, date
- [ ] **P1** `ArticleBody` - Markdown rendered content
- [ ] **P2** `BattlersInArticle` - Featured battlers
- [ ] **P2** `RelatedArticles` - More to read
- [ ] **P2** `ArticleTypeBadge` - Type indicator

### Blogger Constants (8 Bloggers)
- [ ] **P1** Battle Eyez data (Technical analyst)
- [ ] **P1** Hype Machine data (Energy enthusiast)
- [ ] **P1** The Algorithm data (Stats nerd)
- [ ] **P1** Drama Central data (Controversy chaser)
- [ ] **P1** Street Official data (Authenticity judge)
- [ ] **P1** Quotables Daily data (One-liner curator)
- [ ] **P1** Rising Stars Report data (Newcomer scout)
- [ ] **P1** GOAT Watch data (Legend tracker)

### Styling
- [ ] **P1** Article type colors (recap, upset, scandal, preview)
- [ ] **P1** Blogger personality colors
- [ ] **P2** Reading progress indicator

---

## SECTION 3: LEAGUE SYSTEM
**Spec Documents:** `LEAGUE_UI_V0_DETAILED.md`, `LEAGUE_DETAIL_PAGE_SPEC.md`

### Pages
- [ ] **P1** `/leagues` - All leagues list page
- [ ] **P1** `/leagues/[slug]` - League detail page

### Components
- [ ] **P1** `LeagueCard` - League preview card
- [ ] **P1** `LeagueHeader` - League detail header
- [ ] **P1** `LeagueOverviewCards` - 3-column overview grid
  - [ ] League Identity card
  - [ ] Audience Preferences card (with bar chart)
  - [ ] Battle Mechanics card (judging weights)
- [ ] **P1** `LeagueBloggerCard` - Associated blogger display
- [ ] **P1** `LeagueRoster` - Battlers in league with pagination
- [ ] **P1** `LeagueStats` - Statistics dashboard
- [ ] **P1** `LeagueArticles` - Recent articles about league
- [ ] **P2** `LeagueExplainer` - Collapsible educational sections
- [ ] **P2** `LeagueSchedule` - Upcoming battles in league

### League Data (2 Leagues)
- [ ] **P1** Small Room Circuit profile
  - [ ] Logo placeholder (400x200)
  - [ ] Personality: Technical
  - [ ] Associated blogger: Battle Eyez
- [ ] **P1** Main Stage Arena profile
  - [ ] Logo placeholder (400x200)
  - [ ] Personality: Aggressive
  - [ ] Associated blogger: Hype Machine

### Styling
- [ ] **P1** League style colors (technical=blue, aggressive=red, diverse=purple, street=orange)
- [ ] **P1** Audience preference bar charts
- [ ] **P1** Judging weight visualizations

---

## SECTION 4: CITY/REGION SYSTEM
**Spec Document:** `CITY_REGION_SPEC.md`

### Pages
- [ ] **P1** `/regions` - All cities index page
- [ ] **P1** `/regions/[slug]` - City detail page

### Components
- [ ] **P1** `CityHeader` - City profile header
- [ ] **P1** `PowerRankings` - City leaderboard table
- [ ] **P1** `RecentBattlesSection` - Battles from city
- [ ] **P1** `RegionalBadgeCard` - Badge info display
- [ ] **P2** `CitySelector` - City dropdown/search

### Dashboard Integration
- [ ] **P1** `RegionalSceneWidget` - Dashboard widget showing:
  - [ ] Player's city rank
  - [ ] Top battlers in city
  - [ ] Record vs city / vs others
  - [ ] City selector

### City Data (10 Cities)
- [ ] **P1** New York City (major, diverse)
- [ ] **P1** Los Angeles (major, diverse)
- [ ] **P1** Philadelphia (large, aggressive)
- [ ] **P1** Detroit (large, street)
- [ ] **P1** Chicago (large, aggressive)
- [ ] **P1** Toronto (large, technical)
- [ ] **P1** Atlanta (medium, diverse)
- [ ] **P1** Houston (medium, street)
- [ ] **P1** Oakland (medium, street)
- [ ] **P1** London (medium, technical)

### Styling
- [ ] **P1** City tier colors (major=gold, large=silver, medium=orange, small=zinc)
- [ ] **P1** Culture style icons
- [ ] **P1** Regional badge styling

---

## SECTION 5: VENUE SYSTEM
**Spec Document:** `VENUE_SYSTEM_SPEC.md`

### Components
- [ ] **P1** `VenueCard` - Venue display card
  - [ ] Sprite image (400x300)
  - [ ] Tier badge (Virtual/Small/Medium/Large)
  - [ ] Capacity display
  - [ ] Modifier breakdown (writing/performance/crowd)
  - [ ] Vibe description
  - [ ] Prestige stars

### Integration Points
- [ ] **P1** Battle offers show venue info
- [ ] **P1** Battle results show venue/crowd info
- [ ] **P1** Dashboard "Next Battle" shows venue
- [ ] **P2** Prep page shows venue-specific tips

### Assets
- [ ] **P2** Venue sprites organized into `/public/sprites/venues/`
  - [ ] virtual/ (8 venues)
  - [ ] small/ (10 venues)
  - [ ] medium/ (11 venues)
  - [ ] large/ (8 venues)

### Styling
- [ ] **P1** Tier color coding (virtual=blue, small=orange, medium=red, large=gold)
- [ ] **P1** Modifier indicators (arrows for positive/negative)
- [ ] **P1** Prestige star display

---

## SECTION 6: DASHBOARD ENHANCEMENTS

### Existing Dashboard Updates
- [ ] **P1** Add `RegionalSceneWidget` (city rank, top battlers)
- [x] **P0** `PendingLifeEventsWidget` (done)
- [ ] **P1** Show venue in "Next Battle" section
- [ ] **P2** Add career stats card (total battles, win rate, streak)
- [ ] **P2** Add media presence summary widget

### Navigation
- [ ] **P1** Add "Leagues" link to navigation
- [ ] **P1** Add "Regions" link to navigation
- [ ] **P1** Add "Media" link to navigation
- [ ] **P1** Add "Bloggers" link to navigation

---

## SECTION 7: BATTLE OFFERS PAGE

### Current Issues
- [ ] **P0** Fix light theme (use dark theme: bg-zinc-950)
- [ ] **P1** Show opponent stats in offers
- [ ] **P1** Show venue info in offers

### Enhancements
- [ ] **P1** `VenueCard` display per offer
- [ ] **P1** Opponent attributes preview
- [ ] **P2** Historical H2H record

---

## SECTION 8: BATTLE RESULTS PAGE

### Enhancements
- [ ] **P1** Show triggered life events alert
- [ ] **P1** Show venue info in header
- [ ] **P1** Show crowd progression
- [ ] **P2** Link to blogger coverage of battle
- [ ] **P2** Post-battle summary component usage

---

## SECTION 9: NOTIFICATIONS SYSTEM

### Notification Types
- [x] `battle_offer` - Orange styling (exists)
- [x] `battle_complete` - Green styling (exists)
- [x] `life_event` - Yellow styling (exists)
- [ ] **P2** `badge_earned` - Purple styling
- [ ] **P2** `level_up` - Gold styling
- [ ] **P3** `tournament_update` - Blue styling
- [ ] **P3** `system_message` - Gray styling

### Components
- [x] `NotificationDropdown` (exists)
- [x] `NotificationToast` (exists)
- [ ] **P2** `/notifications` - Full notifications page

---

## SECTION 10: TYPES & CONSTANTS

### Type Definitions
- [ ] **P1** `types/lifeEvents.ts` - Life event types
- [ ] **P1** `types/blogger.ts` - Blogger types
- [ ] **P1** `types/league.ts` - League types
- [ ] **P1** `types/city.ts` - City/region types
- [ ] **P1** `types/venue.ts` - Venue types

### Constants Files
- [ ] **P1** `lib/constants/lifeEventStyles.ts`
- [ ] **P1** `lib/constants/bloggerData.ts` (8 bloggers)
- [ ] **P1** `lib/constants/leagueData.ts` (2 leagues)
- [ ] **P1** `lib/constants/cityData.ts` (10 cities)
- [ ] **P1** `lib/constants/venueData.ts` (37 venues)

---

## SECTION 11: API ENDPOINTS NEEDED

### Life Events
- [x] `GET /api/life-events` - Pending events (exists)
- [ ] **P1** `GET /api/life-events/history` - Resolved events
- [x] `POST /api/life-events/[id]/resolve` - Resolve event (exists)

### Media/Bloggers
- [ ] **P1** `GET /api/articles` - List articles with filters
- [ ] **P1** `GET /api/articles/[slug]` - Single article
- [ ] **P1** `GET /api/bloggers` - List all bloggers
- [ ] **P1** `GET /api/bloggers/[slug]` - Blogger profile
- [ ] **P2** `GET /api/bloggers/[slug]/articles` - Articles by blogger

### Leagues
- [ ] **P1** `GET /api/leagues` - List all leagues
- [ ] **P1** `GET /api/leagues/[slug]` - League detail
- [ ] **P1** `GET /api/leagues/[slug]/battlers` - League roster
- [ ] **P2** `GET /api/leagues/[slug]/articles` - League articles

### Cities
- [ ] **P1** `GET /api/cities` - List all cities
- [ ] **P1** `GET /api/cities/[slug]` - City detail with rankings
- [ ] **P2** `GET /api/dashboard/regional-summary` - Player's regional stats

---

## SECTION 12: ROUND CRAFTING SYSTEM
**Spec Document:** `ROUND_CRAFTING_FRONTEND_SPEC.md`

### Pages
- [ ] **P0** `/battle/[id]/mode` - Mode selection (Locked In vs Auto)
- [ ] **P0** `/battle/[id]/round/[roundNum]` - Round content selection
- [ ] **P0** `/battle/[id]/round/[roundNum]/results` - Round results display

### Components - Mode Selection
- [ ] **P0** `ModeSelectionCard` - Locked In vs Auto card
  - [ ] Icon, title, description, features list
  - [ ] Duration estimate
  - [ ] Selected/hover/disabled states

### Components - Content Selection
- [ ] **P0** `ContentTypeCard` - Selectable content/delivery/performance type card
  - [ ] Checkbox, name, description
  - [ ] Effectiveness indicator (strong/neutral/weak)
  - [ ] Category colors (purple/blue/emerald)
- [ ] **P0** `ContentCategorySection` - Category wrapper with validation
  - [ ] Title with min/max requirements
  - [ ] Selection counter
  - [ ] Expandable grid
- [ ] **P0** `RoundContentSelector` - Main content selection component
  - [ ] All 3 category sections
  - [ ] Selection validation
  - [ ] Confirm button
- [ ] **P1** `QuickSelectPresets` - Pre-made content combos
  - [ ] Tech Heavy, Street Mode, Entertainment
  - [ ] Badge-Based (calculated)

### Components - Forecast
- [ ] **P0** `EffectivenessForecast` - Matchup prediction display
  - [ ] Final multiplier (0.5x - 2.0x)
  - [ ] Breakdown bars (effectiveness, crowd, context)
  - [ ] Strong against / weak against badges
  - [ ] Multiplier color scale

### Components - Results
- [ ] **P0** `RoundResultsCard` - Round score comparison
  - [ ] Player vs opponent scores
  - [ ] Peak/consistency display
  - [ ] Content selections shown
  - [ ] Multipliers breakdown
  - [ ] Choke/stumble indicators
- [ ] **P1** `SegmentTimeline` - Visual segment scores
  - [ ] Segment boxes with scores
  - [ ] Peak star indicator
  - [ ] Choke/stumble markers
- [ ] **P1** `BattleScoreTracker` - Round-by-round score
  - [ ] Visual round indicators (won/lost/tie/pending)
  - [ ] Current score display

### Components - Utility
- [ ] **P1** `ContentTypeBadge` - Small type badge
  - [ ] Category-colored styling
  - [ ] Tooltip with description

### APIs
- [ ] **P0** `POST /api/battles/[id]/lock-in` - Submit mode choice
- [ ] **P0** `POST /api/battles/[id]/rounds/[roundNum]/content` - Submit selections
- [ ] **P0** `POST /api/battles/[id]/rounds/[roundNum]/simulate` - Simulate round
- [ ] **P1** `GET /api/battles/[id]/rounds/[roundNum]/forecast` - Get effectiveness
- [ ] **P1** `GET /api/battles/[id]/rounds/[roundNum]` - Get round results

### Type Definitions
- [ ] **P0** `types/contentTypes.ts` - 14 content types
- [ ] **P0** `types/deliveryTypes.ts` - 7 delivery types
- [ ] **P0** `types/performanceTypes.ts` - 8 performance types

### Constants
- [ ] **P0** `lib/constants/contentTypeData.ts` - Type info (names, descriptions)
- [ ] **P0** `lib/constants/categoryColors.ts` - Category color schemes
- [ ] **P0** `lib/constants/effectivenessColors.ts` - Multiplier color scale

### Integration
- [ ] **P0** Update battle results page to show content selections
- [ ] **P1** Rename prep "performance" option to "rehearse" in UI
- [ ] **P1** Show mode badge (Locked In / Auto) on battle results

---

## SECTION 13: LIFE EVENTS V2 (ENHANCED)
**Spec Document:** `LIFE_EVENTS_V2_FRONTEND_SPEC.md`

### Components - Urgency System
- [ ] **P0** `ImmediateEventModal` - Can't close, must resolve
  - [ ] Fullscreen overlay
  - [ ] Timer bar (for truly urgent)
  - [ ] No close button
- [ ] **P1** `TimedEventBanner` - Countdown banner
  - [ ] Deadline display
  - [ ] Progress bar
  - [ ] Consequences preview
- [ ] **P1** `BattleGatedBlocker` - Must resolve before battle
  - [ ] Blocks navigation to battle prep
  - [ ] Clear message about requirement

### Components - Effects Display
- [ ] **P1** `EffectPreview` - Shows all effects of a choice
  - [ ] Permanent vs temporary badges
  - [ ] Duration display for temp
  - [ ] Lockout warnings
- [ ] **P1** `ConditionalEffectNote` - Shows "if X then Y" effects
- [ ] **P2** `LeagueLockoutWarning` - Clear lockout messaging

### Components - Stress System
- [ ] **P0** `StressWidget` - Dashboard stress display
  - [ ] Current stress level (0-100)
  - [ ] State indicator (calm/focused/tense/overwhelmed)
  - [ ] Contributing factors list (NEW)
  - [ ] Choke probability impact
- [ ] **P1** `ContributingFactorItem` - Single stress factor
  - [ ] Factor name, value, trend
  - [ ] Color-coded by impact

### Styling Updates
- [ ] **P1** Add urgency colors to existing event cards
- [ ] **P1** Add permanent/temporary badges to effects
- [ ] **P1** Add lockout warning styling

---

## SECTION 14: LEAGUE EVENTS SYSTEM
**Spec Document:** `LEAGUE_EVENTS_SYSTEM_SPEC.md`

### Pages
- [ ] **P1** `/leagues/[slug]/events` - League events/cards listing
- [ ] **P2** `/leagues/[slug]/events/[cardId]` - Event card detail

### Components
- [ ] **P1** `LeagueEventCard` - Event card display
  - [ ] Flyer image support (multiple aspect ratios)
  - [ ] Text-only fallback
  - [ ] Date range display
- [ ] **P1** `LeagueCardFlyer` - Flyer image container
  - [ ] Supports 1:1, 9:16, 16:9, 21:9 ratios
  - [ ] Fallback placeholder
- [ ] **P2** `LeagueCardBattleList` - Battles on a card
- [ ] **P2** `UpcomingCardsWidget` - Dashboard widget

### APIs
- [ ] **P1** `GET /api/leagues/[slug]/cards` - League event cards
- [ ] **P2** `GET /api/leagues/[slug]/cards/[cardId]` - Card detail

---

## SECTION 15: QUICK WINS (Easy Fixes)

### Theme Fixes
- [ ] **P0** `app/battle/offers/page.tsx` - Change to dark theme
- [ ] **P0** `app/media/page.tsx` - Change to dark theme
- [ ] **P0** `app/media/[slug]/page.tsx` - Change to dark theme

### Missing Stats
- [ ] **P1** Add career stats to dashboard (total battles, win rate, streak)

---

## FILE STRUCTURE SUMMARY

```
app/
├── dashboard/page.tsx                    [ENHANCE]
├── battle/
│   ├── offers/page.tsx                   [FIX THEME]
│   ├── [id]/
│   │   ├── page.tsx                      [ADD LIFE EVENT ALERT + CONTENT DISPLAY]
│   │   ├── mode/page.tsx                 [CREATE - Mode selection]
│   │   └── round/
│   │       └── [roundNum]/
│   │           ├── page.tsx              [CREATE - Round crafting]
│   │           └── results/page.tsx      [CREATE - Round results]
├── life-events/
│   ├── page.tsx                          [CREATE]
│   ├── [id]/page.tsx                     [EXISTS]
│   └── history/page.tsx                  [EXISTS]
├── media/
│   ├── page.tsx                          [REBUILD]
│   ├── [slug]/page.tsx                   [EXISTS]
│   └── your-coverage/page.tsx            [CREATE]
├── bloggers/
│   ├── page.tsx                          [CREATE]
│   └── [slug]/page.tsx                   [CREATE]
├── leagues/
│   ├── page.tsx                          [CREATE]
│   ├── [slug]/
│   │   ├── page.tsx                      [CREATE]
│   │   └── events/
│   │       ├── page.tsx                  [CREATE - League events]
│   │       └── [cardId]/page.tsx         [CREATE - Event detail]
├── regions/
│   ├── page.tsx                          [CREATE]
│   └── [slug]/page.tsx                   [CREATE]
└── api/
    ├── life-events/...                   [ENHANCE]
    ├── articles/...                      [CREATE]
    ├── bloggers/...                      [CREATE]
    ├── leagues/...                       [CREATE]
    ├── cities/...                        [CREATE]
    └── battles/
        └── [id]/
            ├── lock-in/route.ts          [CREATE]
            └── rounds/
                └── [roundNum]/
                    ├── content/route.ts  [CREATE]
                    ├── simulate/route.ts [CREATE]
                    ├── forecast/route.ts [CREATE]
                    └── route.ts          [CREATE]

components/
├── battle/
│   ├── ModeSelectionCard.tsx             [CREATE - Locked In/Auto choice]
│   ├── ContentTypeCard.tsx               [CREATE - Selectable type card]
│   ├── ContentCategorySection.tsx        [CREATE - Category wrapper]
│   ├── RoundContentSelector.tsx          [CREATE - Main selection UI]
│   ├── EffectivenessForecast.tsx         [CREATE - Matchup preview]
│   ├── RoundResultsCard.tsx              [CREATE - Round comparison]
│   ├── SegmentTimeline.tsx               [CREATE - Segment scores]
│   ├── BattleScoreTracker.tsx            [CREATE - Round score tracker]
│   ├── ContentTypeBadge.tsx              [CREATE - Type badge]
│   └── QuickSelectPresets.tsx            [CREATE - Preset combos]
├── lifeEvents/
│   ├── PendingLifeEventsWidget.tsx       [EXISTS]
│   ├── LifeEventCard.tsx                 [CREATE]
│   ├── ChoiceCard.tsx                    [CREATE]
│   ├── EffectBadge.tsx                   [CREATE]
│   ├── CategoryBadge.tsx                 [CREATE]
│   ├── SeverityBadge.tsx                 [CREATE]
│   ├── EventContextCard.tsx              [CREATE]
│   ├── BattleTriggeredAlert.tsx          [CREATE]
│   ├── ImmediateEventModal.tsx           [CREATE - V2 urgency]
│   ├── TimedEventBanner.tsx              [CREATE - V2 countdown]
│   ├── BattleGatedBlocker.tsx            [CREATE - V2 blocker]
│   ├── EffectPreview.tsx                 [CREATE - V2 effects]
│   ├── ConditionalEffectNote.tsx         [CREATE - V2 conditional]
│   ├── StressWidget.tsx                  [CREATE - V2 stress display]
│   └── ContributingFactorItem.tsx        [CREATE - V2 factor item]
├── media/
│   ├── ArticleCard.tsx                   [CREATE]
│   ├── ForYouFeed.tsx                    [CREATE]
│   ├── TrendingTopics.tsx                [CREATE]
│   ├── HotRivalries.tsx                  [CREATE]
│   └── YourMediaStats.tsx                [CREATE]
├── bloggers/
│   ├── BloggerCard.tsx                   [CREATE]
│   ├── BloggerProfileHeader.tsx          [CREATE]
│   ├── BloggerStats.tsx                  [CREATE]
│   └── BloggerArticleList.tsx            [CREATE]
├── leagues/
│   ├── LeagueCard.tsx                    [CREATE]
│   ├── LeagueHeader.tsx                  [CREATE]
│   ├── LeagueOverviewCards.tsx           [CREATE]
│   ├── LeagueBloggerCard.tsx             [CREATE]
│   ├── LeagueRoster.tsx                  [CREATE]
│   ├── LeagueStats.tsx                   [CREATE]
│   ├── LeagueExplainer.tsx               [CREATE]
│   ├── LeagueEventCard.tsx               [CREATE - League events]
│   ├── LeagueCardFlyer.tsx               [CREATE - Flyer display]
│   ├── LeagueCardBattleList.tsx          [CREATE - Card battles]
│   └── UpcomingCardsWidget.tsx           [CREATE - Dashboard widget]
├── regions/
│   ├── CityHeader.tsx                    [CREATE]
│   ├── PowerRankings.tsx                 [CREATE]
│   ├── RegionalBadgeCard.tsx             [CREATE]
│   └── CitySelector.tsx                  [CREATE]
├── venues/
│   └── VenueCard.tsx                     [CREATE]
└── dashboard/
    └── RegionalSceneWidget.tsx           [CREATE]

lib/
└── constants/
    ├── lifeEventStyles.ts                [CREATE]
    ├── bloggerData.ts                    [CREATE]
    ├── leagueData.ts                     [CREATE]
    ├── cityData.ts                       [CREATE]
    ├── venueData.ts                      [CREATE]
    ├── contentTypeData.ts                [CREATE - 14 content types]
    ├── deliveryTypeData.ts               [CREATE - 7 delivery types]
    ├── performanceTypeData.ts            [CREATE - 8 performance types]
    ├── categoryColors.ts                 [CREATE - purple/blue/emerald]
    └── effectivenessColors.ts            [CREATE - multiplier scale]

types/
├── lifeEvents.ts                         [CREATE]
├── blogger.ts                            [CREATE]
├── league.ts                             [CREATE]
├── city.ts                               [CREATE]
├── venue.ts                              [CREATE]
├── contentTypes.ts                       [CREATE]
├── deliveryTypes.ts                      [CREATE]
└── performanceTypes.ts                   [CREATE]
```

---

## PRIORITY ORDER FOR IMPLEMENTATION

### Phase 1: Critical Path (P0)
1. Fix dark theme on battle offers page
2. Fix dark theme on media pages
3. Ensure life events can be resolved

### Phase 2: Core Features (P1)
1. Life Events
   - Create `/life-events` pending list page
   - Add battle triggered alert
   - Create reusable components

2. Media/Bloggers
   - Rebuild `/media` hub
   - Create `/bloggers` listing
   - Create blogger profile pages
   - Define 8 blogger constants

3. Leagues
   - Create `/leagues` listing
   - Create `/leagues/[slug]` detail
   - Build overview cards

4. Regions
   - Create `/regions` listing
   - Create `/regions/[slug]` detail
   - Add dashboard regional widget

5. Venues
   - Build venue card component
   - Add to battle offers
   - Add to battle results

### Phase 3: Polish (P2)
1. Sidebar widgets (trending, rivalries)
2. Player media presence tracking
3. League explainer sections
4. Venue-specific prep tips

### Phase 4: Nice to Have (P3)
1. Tournament notifications
2. Badge earned animations
3. Level up celebration screen

---

## TOTAL COMPONENT COUNT

| Section | Components | Pages | APIs |
|---------|-----------|-------|------|
| Life Events | 8 | 3 | 3 |
| Media/Bloggers | 12 | 4 | 5 |
| Leagues | 7 | 2 | 4 |
| Regions | 5 | 2 | 3 |
| Venues | 1 | 0 | 0 |
| Dashboard | 1 | 0 | 1 |
| **Round Crafting** | **10** | **3** | **5** |
| **Life Events V2** | **7** | **0** | **0** |
| **League Events** | **4** | **2** | **2** |
| **TOTAL** | **55** | **16** | **23** |

---

## DESIGN SYSTEM REMINDER

### Colors
- Background: `bg-zinc-950` (darkest), `bg-zinc-900` (cards)
- Borders: `border-zinc-800`
- Text: `text-zinc-100` (primary), `text-zinc-500` (secondary)
- Accent: `#ff8c42` (orange)
- Success: `text-green-500`
- Danger: `text-red-500`
- Warning: `text-yellow-500`

### Typography
- Headers: `font-black uppercase tracking-tighter`
- Body: `font-bold uppercase tracking-wider`
- Small: `text-xs uppercase tracking-wide`

### Layout
- Max width: `max-w-5xl mx-auto px-6`
- Cards: `bg-zinc-900 border-2 border-zinc-800`
- Spacing: Use `space-y-*` and `gap-*`
