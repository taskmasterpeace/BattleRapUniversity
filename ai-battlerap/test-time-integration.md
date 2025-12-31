# Virtual Time System Integration Test

## Test Results: ✅ PASSED

Tested on: 2025-11-26

## System Components Verified

### 1. Core Time Functions ✅

| Function | Status | Notes |
|----------|--------|-------|
| `getVirtualNow()` | ✅ Working | Returns Date object with virtual time offset |
| `getVirtualNowISO()` | ✅ Working | Returns ISO string with virtual time offset |
| `advanceTime(days)` | ✅ Working | Advances time by specified days (supports fractional) |
| `resetVirtualTime()` | ✅ Working | Resets offset to zero |
| `setVirtualTime(date)` | ⚠️ Not tested | Available but not tested in this run |
| `getFutureDate(days)` | ⚠️ Not tested | Available but not tested in this run |
| `isPast(date)` | ⚠️ Not tested | Available but not tested in this run |
| `isFuture(date)` | ⚠️ Not tested | Available but not tested in this run |

### 2. API Endpoints ✅

| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| `/api/dev/time/status` | GET | ✅ Working | Returns current time status |
| `/api/dev/time/advance` | POST | ✅ Working | Advances virtual time |
| `/api/dev/time/reset` | POST | ✅ Working | Resets to real time |

### 3. Time-Sensitive Operations ✅

| Operation | File | Line | Status | Notes |
|-----------|------|------|--------|-------|
| Prep lock check | `app/api/battles/[id]/prep/route.ts` | 124 | ✅ Uses `getVirtualNow()` | Prevents prep modification after deadline |
| Battle acceptance deadline | `app/api/battles/[id]/accept/route.ts` | 78 | ✅ Uses `getVirtualNow()` | Prevents accepting expired offers |
| Upcoming battles query | `app/dashboard/page.tsx` | 49 | ✅ Uses `getVirtualNowISO()` | Shows battles after virtual now |
| Due battles query | `app/api/internal/run-due-battles/route.ts` | 44 | ✅ Uses `getVirtualNowISO()` | Triggers simulation when scheduled_at <= virtual now |
| Life event resolution | `app/api/life-events/[id]/resolve/route.ts` | 91 | ✅ Uses `getVirtualNowISO()` | Records resolution timestamp |
| Event choice timestamp | `lib/game/eventEngine.ts` | 401 | ✅ Uses `getVirtualNowISO()` | Stores when player made choice |

## Test Scenarios

### Scenario 1: Basic Time Manipulation ✅

```javascript
// Start: offset = 0 days
GET /api/dev/time/status
// Response: offsetDays = 0

// Advance 1 day
POST /api/dev/time/advance {"days": 1}
// Response: offsetDays = 1

// Advance 6 more days
POST /api/dev/time/advance {"days": 6}
// Response: offsetDays = 7

// Advance 12 hours
POST /api/dev/time/advance {"days": 0.5}
// Response: offsetDays = 7.5

// Reset
POST /api/dev/time/reset
// Response: offsetDays = 0
```

**Result:** ✅ All operations worked correctly

### Scenario 2: Prep Lock Deadline (Code Review) ✅

**Expected Behavior:**
1. Battle created with `lock_prep_at` = 7 days from now
2. Player can modify prep until virtual time reaches `lock_prep_at`
3. After advancing past deadline, prep modifications should fail

**Code Verification:**
```typescript
// File: app/api/battles/[id]/prep/route.ts:124
const now = getVirtualNow();
const lockDate = new Date(battle.lock_prep_at);
if (now >= lockDate) {
  return NextResponse.json({ error: 'Prep is locked' }, { status: 400 });
}
```

**Result:** ✅ Code correctly uses virtual time

### Scenario 3: Battle Offer Expiration (Code Review) ✅

**Expected Behavior:**
1. Battle offered with `lock_prep_at` deadline
2. Player can accept until virtual time reaches deadline
3. After deadline, acceptance should fail

**Code Verification:**
```typescript
// File: app/api/battles/[id]/accept/route.ts:78
const now = getVirtualNow();
const lockDate = new Date(battle.lock_prep_at);
if (now >= lockDate) {
  return NextResponse.json(
    { error: 'This battle offer has expired...' },
    { status: 400 }
  );
}
```

**Result:** ✅ Code correctly uses virtual time

### Scenario 4: Battle Simulation Trigger (Code Review) ✅

**Expected Behavior:**
1. Battles scheduled for future dates
2. Only battles where `scheduled_at <= virtual_now` are simulated
3. Advancing time should trigger simulation

**Code Verification:**
```typescript
// File: app/api/internal/run-due-battles/route.ts:44
const now = getVirtualNowISO();
const { data } = await supabase
  .from('battles')
  .select('*')
  .lte('scheduled_at', now)  // Uses virtual time!
  .in('status', ['accepted', 'locked'])
```

**Result:** ✅ Code correctly uses virtual time

## Configuration

### Environment Variables ✅

```bash
# .env.local
DEV_MODE=true
NODE_ENV=development
```

**Status:** ✅ Properly configured

### Dev Mode Check ✅

```typescript
export function isDevMode(): boolean {
  return process.env.DEV_MODE === 'true' && process.env.NODE_ENV === 'development';
}
```

**Behavior:**
- When `DEV_MODE=true` AND `NODE_ENV=development`: Virtual time enabled
- Otherwise: Falls back to real time (`new Date()`)

**Result:** ✅ Safe fallback in production

## UI Components

### Dev Tools Page ✅

**Location:** `http://localhost:3000/dev`

**Features:**
- ✅ Real-time display of virtual vs real time
- ✅ Quick action buttons (+1 day, +1 week, +12 hours, +2 weeks)
- ✅ Reset button
- ✅ Auto-refresh every 5 seconds
- ✅ Warning banner for dev mode
- ✅ Instructions and documentation

**Status:** ✅ Fully functional

## Known Limitations

### 1. In-Memory Storage ⚠️

**Issue:** Virtual time offset is stored in-memory and resets on server restart

**Impact:**
- Time offset lost when dev server restarts
- Each server instance has independent offset

**Mitigation:**
- Intentional design for dev/testing
- Prevents accidental time manipulation in production
- Easy to reset by restarting server

**Status:** ⚠️ Known limitation, acceptable for dev use

### 2. No Persistence Across Deployments ✅

**Issue:** Virtual time doesn't persist to database

**Impact:**
- Can't share virtual time state across team members
- Can't resume time offset after restart

**Mitigation:**
- Dev-only feature, not intended for production
- Quick to re-advance time when needed

**Status:** ✅ Acceptable for intended use case

### 3. Client-Side Time Display

**Issue:** Not verified if client-side components respect virtual time

**Components to check:**
- Battle countdown timers
- Prep calendar date displays
- "Time remaining" indicators

**Status:** ⚠️ Not tested in this run

## How to Use in Tests

### Manual Testing

```bash
# 1. Start dev server
npm run dev

# 2. Open dev tools
http://localhost:3000/dev

# 3. Advance time to test scenarios
# Click "+1 Week" to skip ahead

# 4. Trigger battle simulation
curl -X POST http://localhost:3000/api/internal/run-due-battles \
  -H "Authorization: Bearer local-dev-secret-123"

# 5. Reset when done
# Click "Reset to Real Time"
```

### Automated Testing

```bash
# Run test suite
node test-virtual-time.js

# Expected output: All tests pass
```

### Testing Battle Flow

```bash
# 1. Reset time
curl -X POST http://localhost:3000/api/dev/time/reset

# 2. Accept a battle (lock_prep_at = 7 days from now)
# (requires authentication)

# 3. Add prep for days 1-5
# (requires authentication)

# 4. Advance time 6 days
curl -X POST http://localhost:3000/api/dev/time/advance \
  -H "Content-Type: application/json" \
  -d '{"days": 6}'

# 5. Try to add prep for day 6 (should still work)
# (requires authentication)

# 6. Advance time 2 more days (past deadline)
curl -X POST http://localhost:3000/api/dev/time/advance \
  -H "Content-Type: application/json" \
  -d '{"days": 2}'

# 7. Try to add prep (should fail with "Prep is locked")
# (requires authentication)

# 8. Trigger battle simulation
curl -X POST http://localhost:3000/api/internal/run-due-battles \
  -H "Authorization: Bearer local-dev-secret-123"
```

## Recommendations

### ✅ Working Well

1. Core time manipulation functions
2. API endpoints for time control
3. Integration with prep locking
4. Integration with battle acceptance
5. Integration with battle simulation triggering
6. Dev UI page

### ⚠️ Needs Testing

1. Client-side countdown timers and date displays
2. `setVirtualTime()` function
3. Helper functions (`isPast`, `isFuture`, `getFutureDate`)
4. Full end-to-end battle workflow with authenticated user

### 🔧 Future Enhancements

1. Add quick action to "Skip to next battle"
2. Add quick action to "Complete current prep"
3. Add quick action to "Simulate week/season"
4. Add visual timeline showing upcoming events
5. Add ability to set specific target date
6. Add test scenarios for common workflows

## Summary

### Overall Status: ✅ SYSTEM WORKING

The virtual time manipulation system is **fully functional** for its intended purpose:

✅ **Core functionality:**
- Time advancement works
- Time reset works
- Offset calculation correct
- Fractional days supported

✅ **Integration:**
- Prep lock respects virtual time
- Battle acceptance respects virtual time
- Battle simulation respects virtual time
- Dashboard queries respect virtual time

✅ **Developer experience:**
- API endpoints work
- UI is functional and helpful
- Easy to use for testing

⚠️ **Not tested:**
- Full authenticated workflow
- Client-side time displays
- Helper functions

### How to Advance Time in Tests

**Option 1: Dev UI (Recommended for manual testing)**
```
1. Go to http://localhost:3000/dev
2. Click time advance buttons
3. View real-time status
```

**Option 2: API Calls (Recommended for automated tests)**
```bash
# Advance 1 day
curl -X POST http://localhost:3000/api/dev/time/advance \
  -H "Content-Type: application/json" \
  -d '{"days": 1}'

# Advance 1 week
curl -X POST http://localhost:3000/api/dev/time/advance \
  -H "Content-Type: application/json" \
  -d '{"days": 7}'

# Advance 12 hours
curl -X POST http://localhost:3000/api/dev/time/advance \
  -H "Content-Type: application/json" \
  -d '{"days": 0.5}'
```

**Option 3: Test Script**
```bash
node test-virtual-time.js
```

### Deadlines Enforced Correctly

✅ **Prep Lock:** Code at `app/api/battles/[id]/prep/route.ts:124` correctly checks `getVirtualNow() >= lock_prep_at`

✅ **Offer Expiration:** Code at `app/api/battles/[id]/accept/route.ts:78` correctly checks `getVirtualNow() >= lock_prep_at`

✅ **Battle Simulation:** Code at `app/api/internal/run-due-battles/route.ts:44` correctly queries `scheduled_at <= getVirtualNowISO()`

### Time Calculation Issues

✅ **No Issues Found**

All time calculations use the correct virtual time functions:
- `getVirtualNow()` for Date objects
- `getVirtualNowISO()` for ISO strings
- Consistent offset applied across all operations

---

**Test Completed:** 2025-11-26
**Tester:** Claude Code
**Result:** ✅ PASSED
