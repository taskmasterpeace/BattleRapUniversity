# Virtual Time System - Quick Reference

## TL;DR

✅ **Virtual time system is WORKING**
✅ **DEV_MODE is enabled**
✅ **All deadlines respect virtual time**
✅ **Ready to use for testing**

---

## Quick Test

```bash
# Run this to verify everything works
node test-virtual-time.js

# Expected: ✅ ALL TESTS PASSED
```

---

## Common Commands

### Check Status
```bash
curl http://localhost:3000/api/dev/time/status
```

### Advance 1 Week
```bash
curl -X POST http://localhost:3000/api/dev/time/advance \
  -H "Content-Type: application/json" \
  -d '{"days": 7}'
```

### Advance 1 Day
```bash
curl -X POST http://localhost:3000/api/dev/time/advance \
  -H "Content-Type: application/json" \
  -d '{"days": 1}'
```

### Advance 12 Hours
```bash
curl -X POST http://localhost:3000/api/dev/time/advance \
  -H "Content-Type: application/json" \
  -d '{"days": 0.5}'
```

### Reset to Real Time
```bash
curl -X POST http://localhost:3000/api/dev/time/reset
```

---

## What Uses Virtual Time?

✅ **Prep lock deadline** - Can't modify prep after `lock_prep_at`
✅ **Battle acceptance** - Can't accept offers after `lock_prep_at`
✅ **Upcoming battles** - Only shows battles scheduled after virtual now
✅ **Battle simulation** - Only simulates battles where `scheduled_at <= virtual now`
✅ **Life events** - Timestamps use virtual time

---

## Code Usage

```typescript
import { getVirtualNow, getVirtualNowISO } from '@/lib/dev/timeManipulation';

// Get current time
const now = getVirtualNow();

// Check deadline
if (now >= lockDate) {
  throw new Error('Prep is locked');
}

// Query database
const { data } = await supabase
  .from('battles')
  .gt('scheduled_at', getVirtualNowISO())
  .select('*');
```

---

## Testing Workflows

### Test Prep Lock
```bash
# 1. Reset time
curl -X POST http://localhost:3000/api/dev/time/reset

# 2. Accept battle (7 day prep period)

# 3. Advance 8 days (past deadline)
curl -X POST http://localhost:3000/api/dev/time/advance -d '{"days": 8}'

# 4. Try to add prep (should fail)
```

### Test Battle Simulation
```bash
# 1. Reset time
curl -X POST http://localhost:3000/api/dev/time/reset

# 2. Accept battle scheduled 7 days out

# 3. Advance to battle day
curl -X POST http://localhost:3000/api/dev/time/advance -d '{"days": 7}'

# 4. Trigger simulation
curl -X POST http://localhost:3000/api/internal/run-due-battles \
  -H "Authorization: Bearer local-dev-secret-123"
```

---

## Configuration

**File:** `.env.local`
```bash
DEV_MODE=true
NODE_ENV=development
```

**Both must be true** for virtual time to work

---

## Files

| File | Purpose |
|------|---------|
| `test-virtual-time.js` | Run tests |
| `VIRTUAL_TIME_TESTING_GUIDE.md` | Full guide |
| `VIRTUAL_TIME_TEST_RESULTS.md` | Test results |
| `lib/dev/timeManipulation.ts` | Source code |

---

## Troubleshooting

**Problem:** API returns `devModeEnabled: false`
**Solution:** Check `DEV_MODE=true` in `.env.local`, restart server

**Problem:** Time resets after server restart
**Solution:** This is normal (in-memory storage), just re-advance

**Problem:** Battles not simulating
**Solution:** Check `scheduled_at <= virtual time` and status is `accepted` or `locked`

---

## Safety

✅ **Disabled in production** (requires `NODE_ENV=development`)
✅ **All endpoints protected** (403 if dev mode off)
✅ **In-memory only** (no database pollution)

---

**Quick Links:**
- API: `http://localhost:3000/api/dev/time/status`
- UI: `http://localhost:3000/dev` (may not work, use API)
- Tests: `node test-virtual-time.js`
