# Local Development Setup - No Cloud Needed

**Status**: Ready to run locally once Docker starts

---

## Quick Start (5 minutes)

### 1. Start Docker Desktop
- Open Docker Desktop app
- Wait for it to say "Docker Desktop is running"

### 2. Start Local Supabase
```bash
cd C:\git\battlerapuniversity\ai-battlerap
npx supabase start
```

This will:
- Download Supabase Docker images (first time only, ~2GB)
- Start local Postgres database
- Start local Auth server
- Start local API server
- Give you URLs and keys (already in `.env.local`)

### 3. Run Migrations
```bash
npx supabase db reset
```

This automatically runs all 4 migration files in order.

### 4. Start the Game
The dev server is already running at http://localhost:3000

---

## Full Playtest Flow

1. **Sign Up**: http://localhost:3000
   - Enter email (doesn't need to be real for local)
   - Check terminal for magic link
   - Click link or copy code

2. **Create Battler**: Onboarding wizard
   - Pick name
   - Choose league (Small Room or Main Stage)
   - Pick 1-3 style tags

3. **Generate Battle Offer**:
   ```bash
   curl -X POST http://localhost:3000/api/internal/generate-battle-offers \
     -H "x-internal-secret: local-dev-secret-123"
   ```

4. **Accept Offer**: Dashboard → View Offers → Accept

5. **Prep for Battle**: Go to Prep → Click days → Choose focus

6. **Run Battle** (manual trigger for testing):
   ```bash
   # First, update battle to be "now" in DB
   # Then run simulation:
   curl -X POST http://localhost:3000/api/internal/run-due-battles \
     -H "x-internal-secret: local-dev-secret-123"
   ```

7. **View Results**: Dashboard → should show completed battle → Click to see visual timeline

8. **Read Media**: `/media` → See auto-generated recap article

---

## Local Supabase URLs

Once started, you'll see:

```
API URL: http://127.0.0.1:54321
GraphQL URL: http://127.0.0.1:54321/graphql/v1
S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324
JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
service_role key: [shown in terminal]
```

**Supabase Studio**: http://127.0.0.1:54323
- Visual DB browser
- Run SQL queries
- View tables and data
- Check auth users

**Inbucket** (email viewer): http://127.0.0.1:54324
- See all magic link emails
- No real email needed

---

## Useful Commands

```bash
# Start local Supabase
npx supabase start

# Stop local Supabase
npx supabase stop

# Reset database (runs all migrations fresh)
npx supabase db reset

# View logs
npx supabase logs

# Open Studio in browser
npx supabase studio
```

---

## Database Access

**Via Studio**: http://127.0.0.1:54323

**Via psql**:
```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

**Via any Postgres client**:
- Host: 127.0.0.1
- Port: 54322
- User: postgres
- Password: postgres
- Database: postgres

---

## Current Status

✅ `.env.local` created with local URLs
✅ Supabase initialized
✅ Dev server running at http://localhost:3000
⏳ Waiting for Docker Desktop to start
⏳ Then run `npx supabase start`
⏳ Then run `npx supabase db reset`

---

## Troubleshooting

**"Docker not running"**:
- Start Docker Desktop
- Wait for green "running" indicator

**"Port already in use"**:
```bash
npx supabase stop
npx supabase start
```

**"Migration failed"**:
```bash
npx supabase db reset --no-seed
```

**"Can't connect to DB"**:
- Check Docker Desktop is running
- Check `npx supabase status` shows all services running

---

**Next Step**: Start Docker Desktop, then run `npx supabase start`
