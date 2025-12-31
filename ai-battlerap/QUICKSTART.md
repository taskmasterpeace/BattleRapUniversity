# Battle Rap University - Local Playtest

**Everything is ready. Just need Docker running.**

---

## 3 Steps to Play

### 1. Start Docker Desktop
Open Docker Desktop and wait for it to show "running" (green light)

### 2. Start Local Database
```bash
npm run supabase:start
```

First time: Downloads ~2GB of Docker images (5 minutes)
After that: Starts in 30 seconds

### 3. Setup Database
```bash
npm run supabase:reset
```

This runs all migrations and creates:
- 2 leagues (Small Room, Main Stage)
- 10 AI battlers with ratings

---

## You're Playing!

**Game**: http://localhost:3000 (already running)
**Database UI**: http://127.0.0.1:54323
**Email Viewer**: http://127.0.0.1:54324 (for magic links)

---

## Quick Test Flow

1. **Sign Up** at http://localhost:3000
   - Any email works (local only)
   - Check http://127.0.0.1:54324 for magic link

2. **Create Battler** (onboarding)

3. **Generate Offer**:
   ```bash
   curl -X POST http://localhost:3000/api/internal/generate-battle-offers -H "x-internal-secret: local-dev-secret-123"
   ```

4. **Accept Battle** → **Prep** → Click days, choose focus

5. **Run Battle**:
   ```bash
   curl -X POST http://localhost:3000/api/internal/run-due-battles -H "x-internal-secret: local-dev-secret-123"
   ```

6. **View Results** → See visual timeline with haymakers/chokes

7. **Read Media** at `/media` → Auto-generated recap

---

## That's It

**Stop database**: `npm run supabase:stop`
**View data**: `npm run supabase:studio`
**Full docs**: See [LOCAL_SETUP.md](LOCAL_SETUP.md)

---

**Current Status**:
- ✅ Next.js running (http://localhost:3000)
- ✅ .env.local configured
- ✅ All code ready
- ⏳ **Just need: Start Docker Desktop**
