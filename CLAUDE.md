# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Research Battle Rap Culture First

**Before designing or integrating any battle rap game features, ALWAYS research real battle rap culture first.** This includes:
- How leagues actually work (URL, KOTD, RBE, etc.)
- Real battler behaviors, rivalries, and storylines
- What fans care about (bars, performance, moments, angles)
- Authentic terminology and slang
- What makes battles memorable or controversial
- How careers actually progress in the culture

Use web search to find recent battles, controversies, and cultural moments. The game should feel authentic to people who know battle rap. Ask the user clarifying questions based on your research to ensure features match the real culture.

## Important: Handling Ambiguity

**When facing ambiguous decisions or multiple valid approaches, ALWAYS ask for guidance before proceeding.** This includes:
- Design choices with multiple valid implementations
- UI/UX decisions that could go different directions
- Database schema changes with trade-offs
- Feature scope that isn't clearly defined
- Priority ordering when multiple tasks are pending

Do not assume or guess - ask the user for clarification to ensure alignment with their vision.

## Project Overview

**Algorithm Institute of BattleRap** is a battle rap simulation and strategy game where players manage and develop battle rappers. The game combines strategic decision-making with narrative storytelling, featuring AI opponents, preparation mechanics, segment-based battle simulation, and a dynamic media/news system.

**Current Status**: Core game loop implemented and in local playtesting phase. Battle offers, prep planning, simulation, and results viewing are functional.

**Tech Stack**:
- Frontend: Next.js 15 (App Router) + React + TypeScript
- Backend: Next.js API routes + Supabase (Postgres + Auth)
- Styling: TailwindCSS with custom dark theme
- Local Development: Docker + Supabase CLI

## Core Game Concepts

### Game Flow
1. **Character Creation**: Player creates one battler, allocates attributes (1-10 scale), chooses origin story, primary league, and style tags
2. **Origin System**: Three origin paths that shape your starting attributes and early game:
   - **Text Forums** (Writer): +2 Lyricism, +1 Wordplay, +1 Creativity / -1 Stage Presence, -1 Delivery
   - **App Camera** (Performer): +2 Stage Presence, +1 Delivery, +1 Crowd Control / -1 Lyricism, -1 Wordplay
   - **Crew** (Street): +1 Reputation, +1 Resilience / -1 Financial Stability
3. **League System**: Multi-tiered league structure with progression path:
   - **Underground** (8 leagues): Text Wars (virtual/text), BattleRap App (virtual/recorded), and 6 local leagues
   - **Regional** (7 leagues): Small Room Circuit, G.U.N., City Beatz, etc.
   - **National** (2 leagues): Respect The Craft, Royal Rhyme
   - **Premier** (2 leagues): Main Stage, Global Word War
4. **Starter Crews**: Three AI-owned crews available for new battlers to study:
   - **Street Prophets** (Street style): Truth Seeker, Raw Prophet, Corner Poet
   - **Bar Scientists** (Technical style): Scheme Architect, Wordplay Wizard, Technical Professor
   - **Gutter Kings** (Aggressive style): Street Brawler, Grime Lord, Raw Energy
5. **Battle Offers**: AI generates battle offers against AI opponents based on rating/reputation
6. **Prep Phase**: Player chooses daily focus (research/writing/performance/life/rest) leading up to battle
7. **Battle Simulation**: Segment-based simulation (not typed lyrics) generating peaks, averages, and momentum
8. **Media Generation**: AI-generated blog articles recap battles and create storylines

### Attribute System (1-10 Scale)

**Writing Attributes**: Lyricism, Wordplay, Creativity, Flow
**Performance Attributes**: Stage Presence, Crowd Control, Delivery
**Personal Attributes**: Financial Stability, Reputation, Family Bond, Preparation
**Resilience**: Ability to handle pressure and avoid choking

**Progression Tiers**: Low (1-3), Mid (4-6), Top (7-9), God (10)

### Battle Simulation Mechanics

Battles are **segment-based**, not bar-based. Each round is divided into 30-second segments:
- 2-min rounds = 4 segments
- 3-min rounds = 6 segments

**Simulation calculates**:
- `average_score`: Mean performance across segments
- `peak_score`: Best segment (the "haymaker" moment)
- `consistency_score`: Based on standard deviation
- `crowd_reaction`: 0-100 score influenced by league's `base_crowd_factor`
- `momentum_delta`: Performance difference between battlers
- `choke`: Boolean flag for catastrophic failures (based on resilience + prep)

**Winner determination**: Round-by-round scoring (best 2 out of 3)

### Content & Badge System

The game uses a comprehensive badge system (see "Attributes Badges.txt"):
- **Content Badges**: Angles, Comedy, Storytelling, Wordplay, etc.
- **Delivery Badges**: Aggressive, Speed Rapping, Smooth Flow, etc.
- **Performance Badges**: Stage Presence, Crowd Control, Charisma
- **Reputation Badges**: Positive (Respected Veteran, Crowd Favorite) and Negative (Choker, Drama Starter)

## Database Schema Structure

All tables use `snake_case` and UUID primary keys. Key tables (per Doc2.txt):

**Core Data**:
- `profiles`: User profile data (links to Supabase auth.users)
- `leagues`: League configuration (weights, round length, crowd factors)
- `battlers`: Battler records (player-owned and AI)
- `battler_attributes`: JSONB fields for writing/performance/personal attributes
- `rankings`: ELO-style rating system

**Battle System**:
- `battles`: Battle records with status flow (offered → accepted → locked → simulated → completed)
- `prep_blocks`: Daily prep choices per battle
- `battle_rounds`: Round-level summaries (average/peak/consistency scores)
- `battle_segments`: Segment-by-segment scoring data
- `life_events`: Personal events affecting attributes

**Media Layer**:
- `news_articles`: AI-generated blog posts (battle recaps, scandals, career updates)

## Implementation Status

**Completed Phases**:
- ✅ **Phase 1**: Database schema + seed data (4 migrations, seed.sql with leagues/AI battlers)
- ✅ **Phase 2**: Auth (auto-login dev mode) + onboarding wizard + battler creation
- ✅ **Phase 3**: Battle offer generation system via internal API
- ✅ **Phase 4**: Prep planner UI with auto-save, calendar view, focus selection
- ✅ **Phase 5**: Battle simulation engine + battle results viewer with segment timeline
- ✅ **Dashboard**: Stats, next battle, recent battles history, offers count

**In Progress**:
- 🚧 **Badge Earning System**: 97 badges defined, earning logic designed (see BADGE_SYSTEM_REDESIGN_PROPOSAL.md)
- 🚧 **XP/Level System**: Career progression designed (see XP_AND_LEVEL_SYSTEM_DESIGN.md)
- 🚧 **UI/UX Polish**: PostBattleSummary exists but not used, light theme on 3 pages needs fixing

**Completed Recently**:
- ✅ **Attribute Progression**: Performance-based gains implemented (`lib/game/progression.ts`)
- ✅ **Life Events**: Triggers implemented (win streaks, chokes, close victories, etc.)
- ✅ **News Generation**: Battle recaps auto-generated with AI
- ✅ **Choke/Stumble System**: Validated with real battler (Tru Foe), rates tuned to 7% avg, 46% choker, 40% stumbles

**Future Work**:
- **Notifications System**: Player alerts for new offers, battle results, life events
- **Career Stats Dashboard**: Total battles, win rate, streak display
- **Opponent Info**: Show opponent stats in battle offers
- **Badge Progression UI**: Level-up screens, badge unlock notifications

## Key Design Principles

### No User-Generated Text
Players do NOT write actual bars or lyrics. All content is abstract attribute-based simulation. This is fundamental to the design.

### Segment-Based Peaks
The simulation creates natural "he had a couple big moments but was overall weak" outcomes through segment-level variance. High `peak_score` + low `average_score` + low `consistency_score` = flashy but inconsistent performance.

### Prep Matters
Daily prep focus directly affects battle performance:
- `research`: Enables better angles/rebuttals, increases "angle bonus"
- `writing`: Boosts lyricism/wordplay/creativity
- `performance`: Improves stage presence/delivery/crowd control
- `rest`: Buffers resilience, reduces choke risk
- `life`: Affects personal attributes and can trigger life events

### No-Show Handling
Players who accept battles but don't prep get:
- Auto-generated minimal `rest`/`life` prep
- `no_show_player = true` flag
- Significant penalties: lower resilience, higher choke chance, poor consistency
- Still simulated (not forfeit) so they experience the consequences

### Balancing Philosophy
Even though V1 is player vs AI, balancing is critical:
- Prevent attribute dominance (e.g., lyricism shouldn't override everything)
- League weights must create meaningfully different experiences
- Prep focus options should have roughly comparable value
- Choke probability: High enough to matter, low enough not to feel random
- AI difficulty curve: Easy early battles, progressive challenge

## Critical Implementation Patterns

### Supabase Client Architecture

There are **two types** of Supabase clients - use the correct one:

**1. Service Role Client** (bypasses RLS):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

**Use service role for**:
- Internal API routes (`/api/internal/*`)
- Battle offer generation
- Battle acceptance (needs to update battles created by system)
- Battle simulation
- Any operation that shouldn't be subject to user-scoped RLS

**2. User Client** (subject to RLS):
```typescript
import { createServerSupabaseClient } from '@/lib/db/server';
const supabase = await createServerSupabaseClient();
```

**Use user client for**:
- User-facing queries (dashboard, battler stats)
- Profile operations
- Any operation that should be scoped to the authenticated user

**Common Issue**: If battles created with service role can't be queried with user client, you're hitting RLS restrictions. Switch the endpoint to use service role.

### Design System

All UI follows a consistent dark theme:

**Colors**:
- Background: `bg-zinc-950` (darkest)
- Cards: `bg-zinc-900`
- Borders: `border-zinc-800`
- Text Primary: `text-zinc-100`
- Text Secondary: `text-zinc-500` / `text-zinc-400`
- Accent: `bg-orange-500`, `text-orange-500`
- Success: `bg-green-500/20`, `text-green-500`, `border-green-500/30`
- Danger: `bg-red-500/20`, `text-red-500`, `border-red-500/30`

**Typography**:
- Headers: `font-black`, `uppercase`, `tracking-tighter`
- Body: `font-bold`, `uppercase`, `tracking-wider`
- Small text: `text-xs`, `uppercase`, `tracking-wide`

**Layout**:
- Max width: `max-w-5xl mx-auto px-6`
- Spacing: Use `space-y-*` and `gap-*` for consistent spacing
- Never use scattered layout - always center containers

### Dev Mode Controls

For time-gated features (battles scheduled in future), add dev bypass:

```typescript
// In API route
const battleId = url.searchParams.get('battle_id');
if (battleId) {
  // Dev mode: ignore date, just simulate this battle
  const { data } = await supabase.from('battles')
    .select('*').eq('id', battleId)
    .in('status', ['accepted', 'locked']).limit(1);
}
```

```typescript
// In component
<button onClick={() => fetch(`/api/internal/run-due-battles?battle_id=${battleId}`)}>
  ⚡ SIMULATE NOW (DEV)
</button>
```

**Pattern**: Use `?battle_id=` query param to force operations on specific battles regardless of scheduled dates.

### Battle Flow Implementation

**Complete flow**:
1. **Offers**: `POST /api/internal/generate-battle-offers` creates battles with `status='offered'`
2. **Accept**: Player clicks accept → `POST /api/battles/[id]/accept` → `status='accepted'`
3. **Prep**: Player fills prep calendar → auto-saves to `prep_blocks` table
4. **Simulate**:
   - Production: Cron calls `/api/internal/run-due-battles` when `scheduled_at` passes
   - Dev: "SIMULATE NOW" button calls `/api/internal/run-due-battles?battle_id=X`
5. **Results**: Redirect to `/battle/[id]` to view completed battle
6. **Dashboard History**: Completed battles shown in "RECENT BATTLES" section

**Critical**: After simulation, battle `status='completed'` and disappears from "next battle" query (which filters `status='accepted'`). Must query completed battles separately for history.

## Progression System Architecture

**Attribute Progression** (`lib/game/progression.ts`):
- Automatic performance-based gains after EVERY battle
- Triggered by: `await applyAttributeProgression(battleId, supabase)`
- Thresholds:
  - Writing improvement: average score ≥ 7.0
  - Performance improvement: crowd reaction ≥ 75%
  - Resilience improvement: No chokes in battle
  - Haymaker bonus: peak score ≥ 8.5
- Base gain: +0.05 per attribute
- Winner bonus: +0.02 additional
- Loser penalty: 50% reduction
- Max gain per battle: 0.30 total points

**XP/Level System** (designed, not implemented):
- See `XP_AND_LEVEL_SYSTEM_DESIGN.md` for full spec
- XP = career impact (wins, haymakers, milestones)
- Levels = story progression (Rookie → GOAT)
- 150-220 battles to max level (30)
- Level-up rewards: skill points, unlocks, story beats

**Badge System** (designed, not implemented):
- See `BADGE_SYSTEM_REDESIGN_PROPOSAL.md` for full spec
- 97 badges defined in `lib/game/badges.ts`
- Earning methods: Performance, Playstyle, Career, Life events
- Currently only style tags selectable at creation

## Known Critical Issues

**1. PostBattleSummary Component Not Used** (HIGH PRIORITY)
- **Component**: `components/battle/PostBattleSummary.tsx` (fully built)
- **Problem**: Not rendered on battle results page
- **Blocker**: API doesn't return required data:
  - Rating changes (before/after)
  - Attribute changes (before/after)
  - Badges earned
  - Stress changes
- **Fix**: Enhance `/api/battles/[id]` to fetch progression data

**2. Light Theme Pages** (EASY FIX)
- **Pages**: Battle offers, media hub, article pages use `bg-white`/`bg-gray-50`
- **Fix**: Replace with `bg-zinc-950`/`bg-zinc-900` (dark theme)
- **Files**:
  - `app/battle/offers/page.tsx`
  - `app/media/page.tsx`
  - `app/media/[slug]/page.tsx`

**3. Missing Career Stats** (EASY FIX)
- **Problem**: Dashboard doesn't show total battles, win rate, streak
- **Data available**: Already in `rankings` table
- **Fix**: Add stats card to `components/battler/DashboardClient.tsx`

**4. No Opponent Info in Battle Offers**
- **Problem**: Can't see opponent stats before accepting
- **Fix**: Enhance `/api/battles/offers` to fetch opponent attributes, ratings

## File Organization

**Implemented structure**:

```
ai-battlerap/
├── app/
│   ├── api/
│   │   ├── battler/create/         # Create player battler
│   │   ├── battles/
│   │   │   ├── [id]/
│   │   │   │   ├── accept/         # Accept battle offer
│   │   │   │   └── prep/           # Get/update prep blocks
│   │   │   └── offers/             # Get battle offers
│   │   ├── internal/
│   │   │   ├── generate-battle-offers/  # Create new offers (service role)
│   │   │   └── run-due-battles/         # Simulate battles (service role)
│   │   └── debug/                  # Debug endpoint for DB inspection
│   ├── battle/
│   │   ├── [id]/
│   │   │   ├── page.tsx            # Battle results viewer
│   │   │   └── prep/page.tsx       # Prep calendar
│   │   └── offers/page.tsx         # View available offers
│   ├── media/
│   │   ├── page.tsx                # Media hub (articles list)
│   │   └── [slug]/page.tsx         # Article detail page
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── onboarding/page.tsx         # Character creation
│   └── login/page.tsx              # Auto-login for dev
├── components/
│   ├── battle/
│   │   └── PostBattleSummary.tsx   # ⚠️ Exists but NOT USED
│   └── battler/
│       ├── DashboardClient.tsx     # Dashboard UI with stats, next battle, history
│       └── OnboardingWizard.tsx    # Character creation flow
├── lib/
│   ├── db/
│   │   ├── client.ts               # Browser Supabase client
│   │   └── server.ts               # Server Supabase client + helpers
│   ├── game/
│   │   ├── simulation.ts           # Battle simulation engine
│   │   ├── progression.ts          # Attribute progression (implemented)
│   │   ├── config.ts               # Game balance constants ⭐
│   │   ├── badges.ts               # Badge definitions & effects ⭐
│   │   ├── truFoeValidation.ts     # Validation test script
│   │   ├── comprehensiveChokeValidation.ts
│   │   └── comprehensiveSystemValidation.ts  # Full system validation
│   └── services/
│       └── newsGenerator.ts        # AI battle recap generation
└── supabase/
    ├── migrations/                 # Database migrations (7 files)
    └── seed.sql                    # Seed data (leagues, AI battlers)
```

## Important Constraints & Reminders

### V1 Scope Limitations
- **No human vs human**: All opponents are AI
- **Single battler per player**: No stable management
- **No audio/voice**: Text-based UI only
- **No actual bars generated**: Simulation is purely statistical

### Data Integrity
- All battle state transitions must follow: `offered → accepted → locked → simulated → completed`
- `lock_prep_at` must be enforced before simulation runs
- Never allow prep changes after `lock_prep_at`
- Winner must be set atomically with `status = completed`

### Game Balance Configuration (`lib/game/config.ts`)

**All balance constants are centralized** in `lib/game/config.ts` for easy tuning:

**Critical Constants** (validated with real battler Tru Foe):
- `CHOKE_BASE_PROBABILITY`: 0.015 (1.5% per segment)
- `CHOKE_MINIMUM`: 0.007 (ensures 7% avg choke rate)
- `CHOKE_SCORE_MULTIPLIER`: 0.15 (85% penalty - makes round unwinnable)
- `STUMBLE_BASE_PROBABILITY`: 0.050 (5.0% per segment)
- `STUMBLE_SCORE_MULTIPLIER`: 0.85 (15% penalty)
- `PREP_EFFECT_MULTIPLIER`: 0.25 (25% improvement per prep day)

**Badge Effects** are defined in `lib/game/badges.ts`:
- Known Choker: `chokeIncrease: 0.070` (+7.0% per segment → 45% choke rate)
- Clutch Performer: `chokeReduction: 0.030` (-3.0% → 3% choke rate)
- Freestyle Genius: `chokeReduction: 0.025` (-2.5% → comfortable winging it)

**Balance Targets** (validated):
- Average battler choke rate: ~7% per battle
- Known Choker choke rate: ~45-46% per battle
- Stumble rate: ~40% of battles have at least one stumble
- Body rate (3-0): 20-30% of battles
- Debatable rate (2-1): 40-50% of battles

## Testing Approach

### Simulation Testing
The battle simulation is the heart of the game. Test scenarios:
- **Dominant win**: High attributes vs low attributes → 3-0 expected
- **Upset**: Lower-rated battler with perfect prep vs higher-rated with no prep
- **Choke scenario**: Low resilience + poor prep → should trigger choke flag
- **Peak vs consistency**: High creativity + low consistency → high `peak_score`, low `average_score`
- **League differences**: Same battler in Small Room vs Main Stage should yield different scores

### Balance Testing & Validation

**Validation Test Scripts** (`lib/game/`):
- `truFoeValidation.ts` - Validate choke/stumble rates with test profiles
- `comprehensiveChokeValidation.ts` - Test across prep/resilience variation
- `comprehensiveSystemValidation.ts` - Full system test with 15 battler archetypes

**Run validation tests**:
```bash
cd ai-battlerap
npx tsx lib/game/comprehensiveSystemValidation.ts 40  # 40 battles per profile
```

**What it tests**:
- Known Choker: Should choke ~45-46% of battles
- Average Battler: Should choke ~7% of battles
- Clutch Performer: Should choke ~3-5% of battles
- Stumble rates: ~40% of battles should have at least one stumble
- System response to prep variation (0, 2, 5, 10 days)
- System response to resilience variation (3, 5, 7, 9)

**Interpreting results**:
- ✓ PASSED: Result within ±5% of target
- ✗ FAILED: Result outside target range
- Variance is normal with <50 battles - run with higher count for accuracy

## AI Content Generation

The news/media system uses LLMs to generate battle recaps. When implementing:

**Input to LLM**: Structured JSON with:
```json
{
  "battle_result": "2-1",
  "winner": "Battler A",
  "main_story": "upset" | "dominant_win" | "choke" | "classic",
  "round_summaries": [...],
  "peak_moments": 2,
  "choke_occurred": false,
  "scandal_level": 0
}
```

**Prompt template**: "You are a battle rap blog writer. Write a 300-500 word recap in battle rap media style. Do NOT invent actual bars. Focus on performance, momentum, crowd reaction, angles, and narrative."

**Output**: Markdown stored in `news_articles.body_markdown`

## Development Setup

### First Time Setup

1. **Start Supabase locally** (requires Docker):
   ```bash
   cd ai-battlerap
   npm run supabase:start
   ```
   This downloads containers and starts local Supabase on `http://127.0.0.1:54321`

2. **Apply migrations and seed data**:
   ```bash
   npm run supabase:reset
   ```
   This creates all tables and seeds leagues/AI battlers

3. **Start dev server**:
   ```bash
   npm run dev
   ```
   App runs on `http://localhost:3000`

4. **Access Supabase Studio**:
   - URL: `http://127.0.0.1:54323`
   - View tables, run queries, inspect data

### Common Commands

**Development**:
- `npm run dev` - Start Next.js dev server (port 3000)
- `npm run build` - Production build
- `npm run lint` - Lint code

**Database** (from `ai-battlerap/` directory):
- `npm run supabase:start` - Start local Supabase (Docker required)
- `npm run supabase:stop` - Stop local Supabase
- `npm run supabase:reset` - Reset DB and reapply all migrations + seed
- `npm run supabase:status` - Check running services
- `npx supabase migration new <name>` - Create new migration

### Authentication in Dev Mode

The app uses **auto-login** for local development:
- User: `dev@test.com`
- Password: `password123`
- Auto-login happens on page load in `app/login/page.tsx`
- Skip magic link flow (which was problematic in local dev)

## Debugging & Common Issues

### Inspecting Database State

Use the `/api/debug` endpoint to see recent battles and battlers:
```bash
curl http://localhost:3000/api/debug
```

Or access Supabase Studio at `http://127.0.0.1:54323` to:
- Browse tables
- Run SQL queries
- Inspect RLS policies
- View auth users

### Common Issues

**1. "No battles due for simulation"**
- Battle `scheduled_at` is in the future
- Use dev mode: `/api/internal/run-due-battles?battle_id=X`
- Or manually update `scheduled_at` in Supabase Studio

**2. "Failed to accept battle" / "Cannot coerce to single JSON object"**
- RLS issue: endpoint using user client can't access battles created by service role
- Fix: Switch endpoint to use service role client

**3. "Battle disappears after simulation"**
- Expected: dashboard queries `status='accepted'`, completed battles have `status='completed'`
- Check "RECENT BATTLES" section for completed battles
- Or query directly: `battles` table filtered by `status='completed'`

**4. "No battle offers available"**
- Run: `POST http://localhost:3000/api/internal/generate-battle-offers` (header: `Authorization: Bearer local-dev-secret-123`)
- Or trigger from code/Postman/curl

**5. Docker not running**
- Supabase requires Docker Desktop to be running
- Start Docker, then `npm run supabase:start`

### Generating Test Data

**Create battle offers manually**:
```bash
curl -X POST http://localhost:3000/api/internal/generate-battle-offers \
  -H "Authorization: Bearer local-dev-secret-123"
```

**Force simulate a battle**:
```bash
curl -X POST "http://localhost:3000/api/internal/run-due-battles?battle_id=BATTLE_ID" \
  -H "Authorization: Bearer local-dev-secret-123"
```

## References

- **Game Doc Skeliton.txt**: Full game design document with detailed mechanics
- **Doc2.txt**: Master build specification for V1 prototype implementation
- **New Text Document.txt**: Original comprehensive game design document
- **Attributes Badges.txt**: Complete badge and attribute system reference
- The game's visual identity uses:
  - Rajdhani (font-display) - Headers, display text
  - Inter (font-sans) - Body text
  - JetBrains Mono (font-mono) - Code
- always playtest in Playwrite before responding that somehting is fixed