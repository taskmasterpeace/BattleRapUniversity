# LEAGUE EVENTS SYSTEM - COMPREHENSIVE SPECIFICATION

## 1. OVERVIEW

Leagues host events (battle cards). Players discover events by visiting the league page, not just through media. Each league has personality, regional ties, and upcoming cards that players can explore and potentially get booked on.

---

## 2. WHAT IS A LEAGUE EVENT/CARD?

A **Card** is a battle rap event hosted by a league. Think of it like a boxing card or concert.

### Card Properties
```typescript
interface LeagueCard {
  id: string;
  league_id: string;

  // Basic Info
  name: string;                    // "Night of Main Events"
  slug: string;                    // "night-of-main-events"
  description: string;             // Event description

  // Timing
  scheduled_at: timestamp;         // When the event happens
  doors_open_at: timestamp;        // When doors open
  status: 'announced' | 'lineup_released' | 'sold_out' | 'completed' | 'cancelled';

  // Location
  city_id: string;                 // Which city (FK to cities)
  venue_id: string;                // Which venue (FK to venues)
  is_regional: boolean;            // City-specific card
  region_name?: string;            // "NYC vs Philly" theme

  // Flyer/Media
  flyer_url?: string;              // Optional flyer image
  flyer_aspect_ratio?: '1:1' | '9:16' | '16:9' | '21:9';  // Flyer format
  has_flyer: boolean;

  // Card Details
  main_event_battle_id?: string;   // Featured battle
  co_main_battle_id?: string;      // Co-main
  undercard_count: number;         // How many undercard battles

  // Pricing/Prestige
  ticket_price_min: number;        // $20
  ticket_price_max: number;        // $100 (VIP)
  prestige_level: 1-5;             // How prestigious this card is
  expected_crowd: number;          // Projected attendance
}
```

---

## 3. CARD TYPES

### A. Regular League Cards
Standard events that happen regularly.

```
┌────────────────────────────────────────────────────────────────────┐
│  SMALL ROOM CIRCUIT PRESENTS                                       │
│                                                                     │
│  ████████████████████████████████████████████████████████████████  │
│  █                                                              █  │
│  █   [FLYER IMAGE - 16:9]                                      █  │
│  █   "NIGHT OF MAIN EVENTS"                                    █  │
│  █                                                              █  │
│  █   MAIN EVENT:                                               █  │
│  █   LUX CODED vs JC THE TITAN                                 █  │
│  █                                                              █  │
│  █   Dec 15, 2025 • The Warehouse • NYC                        █  │
│  █                                                              █  │
│  ████████████████████████████████████████████████████████████████  │
│                                                                     │
│  Status: LINEUP RELEASED                                            │
│  Prestige: ⭐⭐⭐⭐                                                   │
│  Expected Crowd: 250                                               │
│                                                                     │
│  FULL CARD:                                                         │
│  • Lux Coded vs JC the Titan (MAIN EVENT)                          │
│  • Jones Chilla vs P Mike (CO-MAIN)                                │
│  • Chess vs Cortez (UNDERCARD)                                     │
│  • [YOUR BATTLE HERE?]                                              │
│                                                                     │
│  [GET BOOKED] [VIEW DETAILS]                                        │
└────────────────────────────────────────────────────────────────────┘
```

---

### B. Regional Cards (City vs City)
Showcase battles between cities/regions.

```
┌────────────────────────────────────────────────────────────────────┐
│  MAIN STAGE ARENA PRESENTS                                         │
│                                                                     │
│  [FLYER IMAGE - 9:16 PORTRAIT]                                     │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════   │
│  NYC vs PHILLY                                                      │
│  "WAR OF WORDS"                                                     │
│  ═══════════════════════════════════════════════════════════════   │
│                                                                     │
│  Every battle: NYC battler vs Philly battler                        │
│                                                                     │
│  Dec 20, 2025 • The Ballroom • Philadelphia                        │
│                                                                     │
│  [VIEW FULL CARD]                                                   │
└────────────────────────────────────────────────────────────────────┘
```

---

### C. Themed Cards
Special theme events.

```
┌────────────────────────────────────────────────────────────────────┐
│  "VOLUME 47"                                                        │
│  SMALL ROOM CIRCUIT                                                │
│                                                                     │
│  [NO FLYER - TEXT ONLY ANNOUNCEMENT]                               │
│                                                                     │
│  Dec 22, 2025                                                       │
│  Location: TBA                                                      │
│                                                                     │
│  STATUS: ANNOUNCED                                                  │
│  Card Not Yet Released                                              │
│                                                                     │
│  [NOTIFY ME WHEN LINEUP DROPS]                                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## 4. FLYER ASPECT RATIOS

Support multiple aspect ratios for different contexts:

| Ratio | Dimensions | Use Case |
|-------|-----------|----------|
| **1:1** | 1080x1080 | Instagram square, dashboard widgets |
| **9:16** | 1080x1920 | Instagram stories, mobile portrait |
| **16:9** | 1920x1080 | YouTube thumbnails, desktop banners |
| **21:9** | 2560x1080 | Ultrawide banners, hero sections |

### Flyer Display Component
```typescript
interface FlyerDisplayProps {
  url: string;
  aspectRatio: '1:1' | '9:16' | '16:9' | '21:9';
  alt: string;
  className?: string;
}

// Aspect ratio CSS classes
const ASPECT_RATIOS = {
  '1:1': 'aspect-square',           // 1:1
  '9:16': 'aspect-[9/16]',          // Portrait
  '16:9': 'aspect-video',           // Landscape
  '21:9': 'aspect-[21/9]',          // Ultrawide
};
```

### Cards WITHOUT Flyers
Some cards don't have flyers yet (text-only announcements):

```
┌────────────────────────────────────────────────────────────────────┐
│  [NO FLYER]                                                        │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │          SMALL ROOM CIRCUIT                                  │   │
│  │          ─────────────────                                  │   │
│  │                                                              │   │
│  │          VOLUME 47                                           │   │
│  │                                                              │   │
│  │          DECEMBER 22, 2025                                   │   │
│  │          LOCATION TBA                                        │   │
│  │                                                              │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Card Announced - Lineup Coming Soon                               │
└────────────────────────────────────────────────────────────────────┘
```

---

## 5. LEAGUE PAGE - EVENTS SECTION

### Layout: Events Tab on League Detail Page

```
/leagues/[slug]

┌─────────────────────────────────────────────────────────────────┐
│  SMALL ROOM CIRCUIT                                              │
│  ─────────────────────────────────────────────────────────────  │
│  [OVERVIEW] [EVENTS] [ROSTER] [STATS] [MEDIA]                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│  UPCOMING EVENTS                                                 │
│  ═══════════════════════════════════════════════════════════    │
│                                                                  │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │ [FLYER 1:1]                 │  │ [FLYER 1:1]             │  │
│  │                             │  │                          │  │
│  │ NIGHT OF MAIN EVENTS        │  │ VOLUME 47               │  │
│  │ Dec 15 • NYC • 250 capacity │  │ Dec 22 • TBA            │  │
│  │ [LINEUP RELEASED]           │  │ [ANNOUNCED]             │  │
│  │                             │  │                          │  │
│  │ [VIEW CARD]                 │  │ [GET NOTIFIED]          │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│  PAST EVENTS                                                     │
│  ═══════════════════════════════════════════════════════════    │
│                                                                  │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │ VOLUME 46 • Nov 28          │  │ VOLUME 45 • Nov 14      │  │
│  │ [COMPLETED]                 │  │ [COMPLETED]             │  │
│  │ [WATCH RECAPS]              │  │ [WATCH RECAPS]          │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. EVENT DETAIL PAGE

### Route: `/events/[slug]`

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Small Room Circuit                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  [FLYER IMAGE - FULL WIDTH - 16:9]                      │   │
│  │                                                          │   │
│  │  NIGHT OF MAIN EVENTS                                    │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  STATUS: LINEUP RELEASED                                         │
│  DATE: December 15, 2025 @ 7:00 PM                              │
│  VENUE: The Warehouse                                            │
│  CITY: New York City, NY                                         │
│  TICKETS: $30 - $100                                             │
│  PRESTIGE: ⭐⭐⭐⭐                                                │
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│  FULL CARD                                                       │
│  ═══════════════════════════════════════════════════════════    │
│                                                                  │
│  MAIN EVENT                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Avatar] LUX CODED (1900)  vs  JC THE TITAN [Avatar]   │   │
│  │           God Tier              Top Tier                 │   │
│  │           NYC                   Pontiac                  │   │
│  │                                                          │   │
│  │  Betting Line: Lux -150 / JC +130                       │   │
│  │  [VIEW MATCHUP BREAKDOWN]                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  CO-MAIN                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  JONES CHILLA (1700)  vs  P MIKE (1525)                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  UNDERCARD                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CHESS THE STRATEGIST vs CORTEZ THE PEN                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│  YOUR OPPORTUNITY                                                │
│  ═══════════════════════════════════════════════════════════    │
│                                                                  │
│  You could get booked on this card!                              │
│  Your rating: 1380 | Required for undercard: 1300+               │
│                                                                  │
│  [REQUEST TO BE BOOKED]                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. LEAGUE PERSONALITY & REGIONAL TIES

Each league has preferences for types of events:

### Small Room Circuit
- **Personality:** Technical, writing-focused
- **Card Style:** Intimate venues, pen-vs-pen matchups
- **Regional Focus:** NYC, Boston, Detroit pen gamers
- **Card Names:** "Volume XX", "Small Room Sessions", "The Breakdown"
- **Flyer Style:** Minimal, text-heavy, serious

### Main Stage Arena
- **Personality:** Aggressive, performance-focused
- **Card Style:** Big venues, crowd-pleasing matchups
- **Regional Focus:** Multi-city, coastal rivalries
- **Card Names:** "Night of Main Events", "Summer Impact", "War Ready"
- **Flyer Style:** Flashy, bold graphics, hype-focused

---

## 8. DATABASE SCHEMA

```sql
CREATE TABLE league_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id) NOT NULL,

  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Timing
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  doors_open_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('announced', 'lineup_released', 'sold_out', 'completed', 'cancelled')) DEFAULT 'announced',

  -- Location
  city_id UUID REFERENCES cities(id),
  venue_id UUID REFERENCES venue_types(id),
  is_regional BOOLEAN DEFAULT FALSE,
  region_theme TEXT,  -- "NYC vs Philly"

  -- Media
  flyer_url TEXT,
  flyer_aspect_ratio TEXT CHECK (flyer_aspect_ratio IN ('1:1', '9:16', '16:9', '21:9')),
  has_flyer BOOLEAN DEFAULT FALSE,

  -- Card Details
  main_event_battle_id UUID REFERENCES battles(id),
  co_main_battle_id UUID REFERENCES battles(id),

  -- Economics
  ticket_price_min INTEGER DEFAULT 0,
  ticket_price_max INTEGER DEFAULT 0,
  prestige_level INTEGER CHECK (prestige_level BETWEEN 1 AND 5) DEFAULT 3,
  expected_crowd INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card battles (multiple battles per card)
CREATE TABLE card_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES league_cards(id) NOT NULL,
  battle_id UUID REFERENCES battles(id) NOT NULL,
  position TEXT CHECK (position IN ('main_event', 'co_main', 'undercard', 'opener')),
  order_number INTEGER DEFAULT 0,

  UNIQUE(card_id, battle_id)
);

-- Index for efficient queries
CREATE INDEX idx_league_cards_league ON league_cards(league_id);
CREATE INDEX idx_league_cards_status ON league_cards(status);
CREATE INDEX idx_league_cards_scheduled ON league_cards(scheduled_at);
CREATE INDEX idx_league_cards_city ON league_cards(city_id);
```

---

## 9. API ENDPOINTS

```typescript
// GET /api/leagues/[slug]/events
// Returns upcoming and past events for a league
{
  upcoming: LeagueCard[];
  past: LeagueCard[];
  featured: LeagueCard | null;
}

// GET /api/events/[slug]
// Returns single event detail
{
  card: LeagueCard;
  battles: CardBattle[];
  league: League;
  venue: Venue;
  city: City;
  playerEligible: boolean;
  playerRequirement: number;
}

// POST /api/events/[slug]/request-booking
// Player requests to be booked on a card
{
  success: boolean;
  message: string;
  battle_offer?: BattleOffer;
}
```

---

## 10. COMPONENTS

```typescript
// components/events/CardFlyer.tsx
interface CardFlyerProps {
  card: LeagueCard;
  size: 'thumbnail' | 'medium' | 'large' | 'hero';
}

// components/events/CardPreview.tsx
interface CardPreviewProps {
  card: LeagueCard;
  showBattles?: boolean;
}

// components/events/CardDetail.tsx
interface CardDetailProps {
  card: LeagueCard;
  battles: CardBattle[];
  playerEligible: boolean;
}

// components/events/BattleMatchup.tsx
interface BattleMatchupProps {
  battle: Battle;
  position: 'main_event' | 'co_main' | 'undercard' | 'opener';
}

// components/events/EventsTab.tsx
interface EventsTabProps {
  leagueId: string;
  upcoming: LeagueCard[];
  past: LeagueCard[];
}

// components/events/NoFlyerPlaceholder.tsx
interface NoFlyerPlaceholderProps {
  cardName: string;
  leagueName: string;
  date: string;
  aspectRatio: '1:1' | '9:16' | '16:9' | '21:9';
}
```

---

## 11. IMPLEMENTATION CHECKLIST

### Database
- [ ] Create `league_cards` table
- [ ] Create `card_battles` table
- [ ] Add indexes
- [ ] Seed sample cards for both leagues

### API
- [ ] `GET /api/leagues/[slug]/events`
- [ ] `GET /api/events/[slug]`
- [ ] `POST /api/events/[slug]/request-booking`

### Components
- [ ] `CardFlyer` - Display flyer with aspect ratio support
- [ ] `CardPreview` - Card thumbnail for lists
- [ ] `CardDetail` - Full card page
- [ ] `BattleMatchup` - Battle display on card
- [ ] `EventsTab` - League page events section
- [ ] `NoFlyerPlaceholder` - Text-only card display

### Pages
- [ ] Add Events tab to `/leagues/[slug]`
- [ ] Create `/events/[slug]` event detail page
- [ ] Add upcoming events to dashboard

### Integration
- [ ] Link battles to cards
- [ ] Player booking request flow
- [ ] Media coverage of cards
