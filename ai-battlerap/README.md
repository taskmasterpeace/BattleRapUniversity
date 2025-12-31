# Algorithm Institute of BattleRap - V1 Prototype

A battle rap simulation and strategy game built with Next.js, TypeScript, and Supabase.

## Project Status

**Phases 1-4 Complete**: Core game loop is fully functional!

### What's Been Built

**Phase 1: Foundation ✅**
- ✅ Next.js 15 project with TypeScript
- ✅ Tailwind CSS configuration
- ✅ Complete database schema (11 tables)
- ✅ Database migrations (ready for Supabase)
- ✅ TypeScript models/interfaces
- ✅ Supabase client utilities

**Phase 2: Auth & Onboarding ✅**
- ✅ Email magic link authentication
- ✅ Protected routes with middleware
- ✅ 3-step onboarding wizard
- ✅ Battler creation API
- ✅ Dashboard with full battler stats

**Phase 3: Battle Offers ✅**
- ✅ Automated offer generation (cron)
- ✅ Rating-based matchmaking
- ✅ Accept/decline battle API
- ✅ Battle offers UI

**Phase 4: Prep Calendar ✅**
- ✅ Daily prep focus selection
- ✅ 5 focus types (research/writing/performance/life/rest)
- ✅ Prep summary visualization
- ✅ Lock enforcement

**Phase 5: Battle Simulation ⏳** (Next)
- ⏳ Segment-based simulation engine
- ⏳ Battle viewer/results page
- ⏳ Rating updates

**Phase 6: Media/News ⏳**
- ⏳ AI-generated battle recaps
- ⏳ News feed

**Phase 7: Polish ⏳**
- ⏳ Configuration tuning
- ⏳ Error handling improvements

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account ([supabase.com](https://supabase.com))

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key

### 3. Configure Environment Variables

Create `.env.local` in the project root:

```bash
# Copy from example
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Generate a secure random string for this
INTERNAL_API_SECRET=your-secret-key-for-cron-jobs

# Optional: for news generation (Phase 6)
OPENAI_API_KEY=your-openai-key
```

### 4. Run Database Migrations

You have two options:

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

#### Option B: Manual SQL Execution

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL from `supabase/migrations/001_initial_schema.sql`
4. Then run `supabase/migrations/002_seed_data.sql`

### 5. Verify Database Setup

After running migrations, you should have:

- 2 leagues (Small Room Circuit, Main Stage Arena)
- 10 AI battlers with attributes and rankings
- All necessary tables with Row Level Security policies

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ai-battlerap/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── battler/      # Battler management
│   │   ├── battles/      # Battle system
│   │   ├── news/         # News/media
│   │   └── internal/     # Cron jobs
│   ├── onboarding/       # Character creation
│   ├── dashboard/        # Main player view
│   ├── battle/           # Battle prep & viewer
│   └── media/            # News feed
├── components/            # React components
│   ├── battler/
│   ├── battle/
│   ├── prep/
│   └── ui/
├── lib/                   # Core logic
│   ├── db/               # Supabase clients
│   ├── models/           # TypeScript interfaces
│   ├── game/             # Simulation engine
│   └── services/         # News generation, etc.
├── supabase/
│   └── migrations/       # Database schema
└── scripts/              # Utility scripts
```

## Database Schema

### Core Tables

- **profiles**: User profile data
- **leagues**: League configurations (Small Room, Main Stage)
- **battlers**: Battler records (player & AI)
- **battler_attributes**: Writing, performance, personal stats (1-10 scale)
- **rankings**: ELO-style rating system

### Battle System

- **battles**: Battle records with status flow
- **prep_blocks**: Daily prep choices (research/writing/performance/life/rest)
- **battle_rounds**: Round-level summaries (average/peak/consistency)
- **battle_segments**: Segment-by-segment scoring

### Media & Events

- **life_events**: Personal events affecting attributes
- **news_articles**: AI-generated blog posts

## Implementation Phases

The game is being built in 7 phases:

### Phase 1: Database & Setup ✅
- Project initialization
- Database schema
- TypeScript models
- Supabase integration

### Phase 2: Auth & Onboarding (Current)
- User authentication
- Battler creation flow
- Dashboard

### Phase 3: Battle Offers
- Cron job to generate offers
- Accept/decline battles
- Offers UI

### Phase 4: Prep System
- Prep calendar
- Daily focus selection
- Prep tracking

### Phase 5: Simulation Engine
- Segment-based battle simulation
- Round scoring
- Winner calculation
- Battle viewer UI

### Phase 6: Media Generation
- AI-generated battle recaps
- News feed
- Article viewer

### Phase 7: Polish
- Configuration tuning
- Error handling
- Styling improvements

## Key Game Mechanics

### Attributes (1-10 Scale)

**Writing**: Lyricism, Wordplay, Creativity
**Performance**: Stage Presence, Crowd Control, Delivery
**Personal**: Financial Stability, Reputation, Family Bond
**Resilience**: Ability to avoid choking

### Leagues

**Small Room Circuit**
- 2-minute rounds (4 segments each)
- Writing-focused (60% writing, 40% performance)
- Lower crowd factor

**Main Stage Arena**
- 3-minute rounds (6 segments each)
- Performance-focused (40% writing, 60% performance)
- Higher crowd factor

### Battle Flow

1. User receives battle offer from league
2. Accepts offer → enters prep phase
3. Chooses daily focus (research/writing/performance/life/rest)
4. At battle time, system simulates 3 rounds
5. Each round split into segments with peaks and variance
6. Winner determined by best 2 of 3 rounds
7. AI-generated recap article published

### Simulation

Battles are **segment-based**, not bar-based. No actual lyrics are generated.

Each segment receives a score based on:
- Base attributes (writing/performance)
- Prep modifiers
- Style tags and research bonuses
- Random variance (resilience affects this)
- Choke probability (low resilience + poor prep)

Rounds are scored on:
- `average_score`: Mean of all segments
- `peak_score`: Best segment (the "haymaker")
- `consistency_score`: Inverse of standard deviation
- `crowd_reaction`: Mapped to 0-100 scale
- `momentum_delta`: Performance gap between battlers

## API Endpoints (Planned)

### Battler
- `POST /api/battler/create` - Create new battler
- `GET /api/battler/me` - Get user's battler + stats

### Battles
- `GET /api/battles/offers` - View battle offers
- `POST /api/battles/:id/accept` - Accept battle
- `POST /api/battles/:id/decline` - Decline battle
- `GET /api/battles/:id` - Get battle details
- `GET /api/battles/:id/prep` - Get prep calendar
- `POST /api/battles/:id/prep` - Set prep focus

### News
- `GET /api/news` - List articles
- `GET /api/news/[slug]` - Get article by slug

### Internal (Cron)
- `POST /api/internal/generate-battle-offers` - Daily job
- `POST /api/internal/run-due-battles` - Periodic job

## Development Notes

### No User-Generated Content
Players do NOT write actual bars or lyrics. All content is abstract attribute-based simulation.

### Segment-Based Peaks
The simulation creates natural variance where a battler can have "a couple big moments but was overall weak" through:
- High `peak_score` + Low `average_score` + Low `consistency_score`

### Balancing
Even though V1 is player vs AI, balancing is critical:
- Attribute weights must create meaningful league differences
- Prep options should have comparable value
- Choke probability must feel fair
- AI difficulty should scale appropriately

## Testing

```bash
# Lint
npm run lint

# Build
npm run build

# Type check
npx tsc --noEmit
```

## Deployment

This app is designed to deploy to Vercel:

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

Set up Supabase cron jobs using [pg_cron](https://supabase.com/docs/guides/database/extensions/pgcron):

```sql
-- Run daily at midnight UTC
SELECT cron.schedule(
  'generate-battle-offers',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url:='https://your-app.vercel.app/api/internal/generate-battle-offers',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SECRET"}'::jsonb
  ) as request_id;
  $$
);

-- Run every 5 minutes
SELECT cron.schedule(
  'run-due-battles',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://your-app.vercel.app/api/internal/run-due-battles',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SECRET"}'::jsonb
  ) as request_id;
  $$
);
```

## License

Private project - All rights reserved

## Support

For issues or questions, refer to the game design documents in the parent directory.
