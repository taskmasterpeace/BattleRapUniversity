# CITIES & LOCATION SYSTEM RESEARCH
## Character Creation with Real City Data

Research and proposal for implementing structured location data in character creation.

---

## CURRENT SYSTEM

**What Exists Now:**
- Freeform text field: "Region (Optional)"
- Placeholder: "e.g., NYC, LONDON, LA"
- Database: `battlers.region` (nullable text)
- No validation, no structure, no game leverage

**Problems:**
- Inconsistent entry ("NYC" vs "New York" vs "New York City")
- No way to group battlers by actual location
- No data for location-based features
- No way to validate real cities
- Can't leverage for storylines, events, or rivalries

---

## APPROACH OPTIONS

### Option 1: City Database with Search/Autocomplete

**How It Works:**
- Maintain curated database of cities (top 500-1000 worldwide)
- User types city name, gets autocomplete suggestions
- Selects from dropdown or continues typing
- Stores structured data (city name, state/region, country)

**Data Source Options:**

#### A) Self-Hosted CSV/JSON (Recommended)
**Cities Dataset:** SimpleMaps World Cities Database (Free, 15k+ cities)
- Download: https://simplemaps.com/data/world-cities (Basic version is free)
- Size: ~4MB JSON, 15,000+ cities worldwide
- Fields: city, state/province, country, lat, lng, population
- License: Free for commercial use

**Implementation:**
```sql
-- New table
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  state_province TEXT,
  country TEXT NOT NULL,
  country_code TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  population INTEGER,
  searchable TEXT GENERATED ALWAYS AS (
    lower(name || ' ' || COALESCE(state_province, '') || ' ' || country)
  ) STORED
);

CREATE INDEX idx_cities_search ON cities USING gin(to_tsvector('english', searchable));

-- Update battlers table
ALTER TABLE battlers ADD COLUMN city_id UUID REFERENCES cities(id);
ALTER TABLE battlers ADD COLUMN hometown_display TEXT; -- e.g., "Brooklyn, NY, USA"
```

**Autocomplete API:**
```typescript
// /api/cities/search?q=new+york
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  const { data } = await supabase
    .from('cities')
    .select('id, name, state_province, country')
    .ilike('searchable', `%${query}%`)
    .order('population', { ascending: false }) // Popular cities first
    .limit(10);

  return Response.json(data);
}
```

**UI Component:**
```typescript
// Debounced search input with dropdown
<input
  type="text"
  value={citySearch}
  onChange={handleCitySearch}
  placeholder="Search for your city..."
/>
{suggestions.length > 0 && (
  <div className="autocomplete-dropdown">
    {suggestions.map(city => (
      <div key={city.id} onClick={() => selectCity(city)}>
        {city.name}, {city.state_province}, {city.country}
      </div>
    ))}
  </div>
)}
```

**Pros:**
- Complete control over data
- No API limits or costs
- Fast queries (local database)
- Can add custom cities for game lore
- Full text search with PostgreSQL

**Cons:**
- Need to seed database (one-time ~15k inserts)
- Need to maintain/update occasionally
- Takes up database space (~5MB)

---

#### B) Free Geocoding API (GeoNames)
**Service:** GeoNames.org
- Free tier: 30,000 requests/day (requires registration)
- Endpoint: http://api.geonames.org/searchJSON?q={city}&maxRows=10
- Returns: City name, country, lat/lng, population
- License: Creative Commons

**Implementation:**
```typescript
// Server-side only (don't expose API key)
export async function searchCities(query: string) {
  const response = await fetch(
    `http://api.geonames.org/searchJSON?q=${query}&maxRows=10&username=${GEONAMES_USERNAME}`
  );
  const data = await response.json();
  return data.geonames; // Array of city results
}
```

**Pros:**
- No database maintenance
- Always up-to-date
- Official geographic data

**Cons:**
- API rate limits (30k/day)
- Requires internet connectivity
- Slower than local database
- Service dependency
- Need to register/manage API key

---

#### C) Mapbox Geocoding API (Premium Option)
**Service:** Mapbox Places API
- Free tier: 100,000 requests/month
- Best autocomplete UX (industry standard)
- Includes neighborhoods, landmarks
- Paid: $5 per 1,000 requests after free tier

**Pros:**
- Best-in-class autocomplete
- Rich location data
- Used by Uber, Airbnb, etc.

**Cons:**
- Costs money at scale
- Overkill for simple city selection
- Requires API key management

---

### Option 2: ZIP Code System (US Only)

**How It Works:**
- User enters 5-digit ZIP code
- System looks up associated city/state
- Works only for United States

**Data Source:**
- Free ZIP code database: https://www.unitedstateszipcodes.org/zip-code-database/
- ~43,000 US ZIP codes
- Maps to city, state, county, lat/lng

**Database:**
```sql
CREATE TABLE us_zip_codes (
  zip_code TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  state_code TEXT NOT NULL,
  county TEXT,
  latitude DECIMAL,
  longitude DECIMAL
);
```

**Pros:**
- Simple 5-digit input
- Precise location (more specific than city)
- Familiar to US users
- Can derive metro areas (group by city)

**Cons:**
- **US ONLY** (no international)
- Less intuitive for battlers outside US
- Overkill precision (do we need ZIP-level data?)
- Privacy concerns (very specific location)

---

### Option 3: Hybrid System (Recommended)

**Combine best of both:**
1. **Primary:** City autocomplete (Option 1A - Self-hosted database)
2. **Optional:** ZIP code input for US users who prefer it
3. **Fallback:** Freeform text for unlisted locations

**Why This Works:**
- International support (15k+ cities worldwide)
- Convenience for US users (ZIP code option)
- Flexibility (freeform fallback for custom locations)
- Maximum game leverage (structured data + custom entries)

**UI Flow:**
```
┌─────────────────────────────────────┐
│  HOMETOWN                           │
├─────────────────────────────────────┤
│  Search by city:                    │
│  [Brooklyn________v]  ← Autocomplete│
│    └─> Brooklyn, NY, USA            │
│        Brooklyn, MN, USA            │
│        Brooklyn, NSW, Australia     │
│                                     │
│  Or enter ZIP code (US):            │
│  [11206___________]                 │
│                                     │
│  Or enter custom location:          │
│  [Custom text_____]                 │
└─────────────────────────────────────┘
```

---

## GAME LEVERAGE: How to Use Location Data

### 1. Battler Rivalries & Storylines

**City-Based Rivalries:**
- NYC vs Philly (East Coast beef)
- LA vs Oakland (West Coast)
- London vs Manchester (UK)
- Toronto vs Montreal (Canada)

**Media Generation:**
```typescript
if (battler1.city === "New York" && battler2.city === "Philadelphia") {
  article.angle = "classic NYC vs Philly rivalry reignites";
}
```

**City Dominance Leaderboards:**
- "Top Cities by Win Rate"
- "Which city produces the best battlers?"
- Player pride in representing their city

---

### 2. Regional Tournaments

**City-Specific Events:**
- "NYC Open" (only battlers from New York metro)
- "West Coast Championship"
- "International Battle Royale" (different countries)

**Implementation:**
```typescript
// Tournament eligibility filter
const nycTournament = {
  eligible_cities: ['New York', 'Newark', 'Yonkers', 'Jersey City'],
  prize_pool: 50000,
};
```

---

### 3. Travel & Tour System (Future Feature)

**Concept:** Battlers can travel to other cities for battles
- Home advantage: +5% crowd reaction in home city
- Travel costs: -$200 to travel to different city
- Jet lag penalty: -2% performance if traveled recently
- Tour schedule: Book battles in multiple cities (West Coast tour)

**Database:**
```sql
ALTER TABLE battles ADD COLUMN event_city_id UUID REFERENCES cities(id);
-- Battle location might differ from battler hometowns
```

---

### 4. League Expansion (Future Feature)

**Regional Leagues:**
- "NYC Underground Circuit" (Small Room in New York)
- "LA Main Stage Arena" (Performance-focused in LA)
- "London Battle League" (UK-based)

**Each league tied to specific city:**
```sql
ALTER TABLE leagues ADD COLUMN home_city_id UUID REFERENCES cities(id);
```

**Home Court Advantage:**
- Battling in your home city league: +3% crowd familiarity
- Away battles: Neutral or slight disadvantage

---

### 5. Demographics & Crowd Composition

**City Personality Affects Crowds:**
```typescript
const cityProfiles = {
  "New York": {
    crowd_type: "bar_heavy_heads",
    writing_preference: +10%
  },
  "Los Angeles": {
    crowd_type: "performance_crowd",
    performance_preference: +10%
  },
  "Chicago": {
    crowd_type: "balanced",
    aggressive_style_bonus: +5%
  }
};
```

**Implementation:**
```typescript
function getCrowdModifiers(battleCity: City) {
  return cityProfiles[battleCity.name] || defaultProfile;
}
```

---

### 6. Media Articles & Narratives

**Location-Rich Headlines:**
- "Brooklyn Battler Takes Down LA Legend"
- "Philadelphia's Finest Chokes in NYC Debut"
- "Is Toronto Producing the Next Generation of Top Tiers?"

**Blogger Voice Per Region:**
- NYC articles: Aggressive, direct, "real hip hop" rhetoric
- LA articles: Entertainment-focused, Hollywood comparisons
- UK articles: Different slang, cultural references

**Implementation:**
```typescript
const articleTemplate = {
  headline: `${winner.city} Native Dominates ${loser.city} Challenger`,
  intro: `The ${winner.city} battle rap scene continues its dominance...`
};
```

---

### 7. Portrait Integration (Your Current Addition)

**Location on Character Sheet:**
```
┌─────────────────────────────────────┐
│  [PORTRAIT IMAGE]                   │
│                                     │
│  STAGE NAME: "WORDSMITH"            │
│  FROM: Brooklyn, NY, USA            │  ← City display
│  LEAGUE: Small Room Circuit         │
│  TIER: Mid Tier                     │
│  RECORD: 8-3 (73%)                  │
└─────────────────────────────────────┘
```

**Media Articles with Headshots:**
```
┌────────────────────────────────────────────┐
│  [Portrait]  BROOKLYN'S WORDSMITH          │
│              DEFEATS LA'S SHOWTIME         │
│              IN UPSET VICTORY              │
│                                            │
│  Brooklyn, NY - In a stunning display...   │
└────────────────────────────────────────────┘
```

**Battler Comparison View:**
```
┌──────────────────┐      VS      ┌──────────────────┐
│  [Portrait]      │              │  [Portrait]      │
│  WORDSMITH       │              │  SHOWTIME        │
│  Brooklyn, NY    │  ← Cities    │  Los Angeles, CA │
│  Rating: 1450    │              │  Rating: 1520    │
└──────────────────┘              └──────────────────┘
```

---

## RECOMMENDED IMPLEMENTATION PLAN

### Phase 1: Basic City System (Week 1)

**Tasks:**
1. Seed `cities` table with SimpleMaps dataset (15k cities)
2. Create `/api/cities/search` autocomplete endpoint
3. Update `battlers` table schema:
   - Add `city_id` (UUID, nullable, references cities)
   - Add `hometown_display` (TEXT, generated from city data)
   - Keep `region` field for backward compatibility
4. Update onboarding wizard with city autocomplete
5. Display hometown on battler profiles and character sheets

**Database Migration:**
```sql
-- Phase 1 Migration
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  state_province TEXT,
  country TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  population INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cities_name ON cities(name);
CREATE INDEX idx_cities_country ON cities(country_code);

ALTER TABLE battlers
  ADD COLUMN city_id UUID REFERENCES cities(id),
  ADD COLUMN hometown_display TEXT;

-- Backfill existing battlers (optional)
-- Convert freeform "region" to structured city_id where possible
```

**Seed Script:**
```typescript
// scripts/seedCities.ts
import citiesData from './simplemaps-worldcities.json';

async function seedCities() {
  // Filter to top 15k cities by population
  const topCities = citiesData
    .sort((a, b) => b.population - a.population)
    .slice(0, 15000);

  for (const city of topCities) {
    await supabase.from('cities').insert({
      name: city.city,
      state_province: city.admin_name,
      country: city.country,
      country_code: city.iso2,
      latitude: city.lat,
      longitude: city.lng,
      population: city.population
    });
  }
}
```

---

### Phase 2: Game Integration (Week 2)

**Tasks:**
1. Add city-based rivalry detection in news generator
2. Create "City Leaderboards" page (top cities by win rate)
3. Add city context to battle viewer ("Brooklyn vs LA")
4. Generate city-aware media headlines

**Code Example:**
```typescript
// lib/game/cityRivalries.ts
const CITY_RIVALRIES = {
  'New York-Philadelphia': {
    name: 'East Coast Classic',
    intensity: 'high',
    media_angle: 'historic rivalry reignites'
  },
  'Los Angeles-San Francisco': {
    name: 'California Battle',
    intensity: 'medium',
    media_angle: 'NorCal vs SoCal showdown'
  }
};

export function detectRivalry(city1: string, city2: string) {
  const key = [city1, city2].sort().join('-');
  return CITY_RIVALRIES[key];
}
```

---

### Phase 3: Advanced Features (Week 3+)

**Tasks:**
1. Regional tournaments (city/state/country filters)
2. Travel system (home vs away battles)
3. City-specific crowd modifiers
4. League expansion (leagues tied to cities)
5. Portrait + location integration in all UI components

---

## DATA STRUCTURE EXAMPLES

### City Record
```json
{
  "id": "a1b2c3d4-...",
  "name": "Brooklyn",
  "state_province": "New York",
  "country": "United States",
  "country_code": "US",
  "latitude": 40.6782,
  "longitude": -73.9442,
  "population": 2736074
}
```

### Battler with City
```json
{
  "id": "...",
  "stage_name": "WORDSMITH",
  "city_id": "a1b2c3d4-...",
  "hometown_display": "Brooklyn, NY, USA",
  "region": "NYC" // Legacy field, kept for backward compatibility
}
```

### API Autocomplete Response
```json
{
  "results": [
    {
      "id": "a1b2c3d4-...",
      "display": "Brooklyn, NY, United States",
      "name": "Brooklyn",
      "state_province": "New York",
      "country": "United States"
    },
    {
      "id": "b2c3d4e5-...",
      "display": "Brooklyn, Victoria, Australia",
      "name": "Brooklyn",
      "state_province": "Victoria",
      "country": "Australia"
    }
  ]
}
```

---

## ALTERNATIVE: SIMPLIFIED MVP

If full city database is too complex for V1:

### Curated Short List Approach

**Just 50 Major Cities:**
- Top 25 US cities (NYC, LA, Chicago, Houston, Philly, etc.)
- Top 25 international (London, Toronto, Paris, Tokyo, etc.)
- Hardcoded dropdown, no autocomplete needed

**Implementation:**
```typescript
const CITIES = [
  { name: 'New York', state: 'NY', country: 'USA' },
  { name: 'Los Angeles', state: 'CA', country: 'USA' },
  // ... 48 more
];

// Simple dropdown, no API needed
<select value={selectedCity}>
  {CITIES.map(city => (
    <option value={city.name}>
      {city.name}, {city.state}, {city.country}
    </option>
  ))}
</select>
```

**Pros:**
- Extremely simple
- No database/API overhead
- Covers 90% of real users

**Cons:**
- Excludes smaller cities
- Still need "Other" option for unlisted cities
- Harder to expand later

---

## FINAL RECOMMENDATION

**Use Option 1A: Self-Hosted City Database (SimpleMaps)**

**Why:**
- One-time setup, then it just works
- No API dependencies or rate limits
- Fast local queries
- International support
- Can add custom cities for lore
- Scales to advanced features (travel, regional tournaments)
- Free forever

**With Optional Freeform Fallback:**
- If city not found, allow custom text entry
- Best of both worlds: structure + flexibility

**Migration Path:**
1. Phase 1: Add city database + autocomplete (Week 1)
2. Phase 2: City-based media and leaderboards (Week 2)
3. Phase 3: Regional tournaments and travel system (Week 3+)

**Effort Estimate:**
- Database setup: 2 hours
- Autocomplete API: 2 hours
- UI component: 3 hours
- Testing: 1 hour
- **Total: ~8 hours for Phase 1**

---

## PORTRAIT INTEGRATION CONSIDERATIONS

**Storage:**
- Store portraits in Supabase Storage (CDN)
- Path: `portraits/{battler_id}.jpg`
- Reference in `battlers.portrait_url`

**Display Locations:**
- Character sheet / Profile page
- Battle viewer (both battlers' portraits)
- News articles (headshots in byline)
- Dashboard (your battler's portrait)
- Leaderboards (top battlers with portraits)

**Database Addition:**
```sql
ALTER TABLE battlers ADD COLUMN portrait_url TEXT;
```

**UI Component:**
```tsx
<div className="battler-card">
  <img
    src={battler.portrait_url || '/default-portrait.png'}
    alt={battler.stage_name}
    className="battler-portrait"
  />
  <h2>{battler.stage_name}</h2>
  <p className="hometown">{battler.hometown_display}</p>
</div>
```

---

**Conclusion:**

Implement **Self-Hosted City Database** with autocomplete. It's the sweet spot of simplicity, functionality, and future-proofing. Integrate portraits in all relevant UI components alongside structured city data.
