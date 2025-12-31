# Bug Report: Battle Acceptance Flow

**Date:** 2025-11-25
**Component:** Battle Acceptance API & UI
**Severity:** Mixed (1 Critical, 2 Medium, 4 Low)
**Status:** Code review completed - manual testing required

---

## Executive Summary

The battle acceptance flow has been thoroughly analyzed through code review. The implementation is **mostly solid** but has **one critical race condition vulnerability** and several UX/reliability improvements needed.

### Quick Assessment

- **Core Flow:** ✅ Working as designed
- **Authentication/Authorization:** ✅ Secure
- **Status Validation:** ✅ Proper state transitions
- **Expiration Check:** ✅ Virtual time support working
- **Multiple Battle Prevention:** ⚠️ **CRITICAL BUG** - Race condition possible
- **Error Messages:** ⚠️ Could be more specific
- **UI/UX:** ⚠️ Uses alerts, no success feedback

---

## Critical Issues

### 🔴 BUG #1: Race Condition Allows Multiple Active Battles

**File:** `c:\git\battlerapuniversity\ai-battlerap\app\api\battles\[id]\accept\route.ts`
**Lines:** 62-93
**Severity:** CRITICAL
**Likelihood:** LOW (requires simultaneous requests)
**Impact:** HIGH (breaks core game constraint)

#### Description

The multiple battle check and status update are **not atomic**. A race condition exists where:

1. Request A checks for existing battles (lines 62-75) → finds none
2. Request B checks for existing battles (lines 62-75) → finds none
3. Request A updates battle 1 to "accepted" (lines 88-93)
4. Request B updates battle 2 to "accepted" (lines 88-93)
5. **Result:** Player has TWO accepted battles (should only have one)

#### Current Code

```typescript
// Check for existing active battles
const { data: existingBattles } = await supabase
  .from('battles')
  .select('id, status')
  .eq('battler_player_id', battler.id)
  .in('status', ['accepted', 'locked'])
  .limit(1);

if (existingBattles && existingBattles.length > 0) {
  return NextResponse.json({ error: '...' }, { status: 400 });
}

// ... later ...

// Update status (NOT in same transaction as check)
const { data: updatedBattle, error } = await supabase
  .from('battles')
  .update({ status: 'accepted' })
  .eq('id', id)
  .select()
  .single();
```

#### Reproduction Steps

1. Open two browser tabs to `/battle/offers`
2. Rapidly click "Accept" on two different battles simultaneously
3. Both API requests check for existing battles concurrently
4. Both pass the check (neither sees the other's update yet)
5. Both update their respective battles to "accepted"
6. Query database: `SELECT COUNT(*) FROM battles WHERE status='accepted' AND battler_player_id='...'`
7. **Expected:** 1, **Actual:** 2

#### Recommended Fix

**Option A: Database Constraint (RECOMMENDED)**

```sql
-- Migration file: add_one_active_battle_constraint.sql
CREATE OR REPLACE FUNCTION check_one_active_battle()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('accepted', 'locked') THEN
    IF EXISTS (
      SELECT 1 FROM battles
      WHERE battler_player_id = NEW.battler_player_id
        AND id != NEW.id
        AND status IN ('accepted', 'locked')
    ) THEN
      RAISE EXCEPTION 'Battler already has an active battle';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_one_active_battle
  BEFORE INSERT OR UPDATE ON battles
  FOR EACH ROW
  EXECUTE FUNCTION check_one_active_battle();
```

**Benefits:**
- Guarantees correctness at database level
- No code changes needed
- Works even if bug exists in application code
- Protects against future bugs

**Option B: Postgres RPC with Transaction**

```sql
-- Migration: Create stored procedure
CREATE OR REPLACE FUNCTION accept_battle(
  p_battle_id UUID,
  p_battler_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_battle battles;
  v_existing_count INT;
BEGIN
  -- Lock the battler row to prevent concurrent modifications
  PERFORM id FROM battlers WHERE id = p_battler_id FOR UPDATE;

  -- Check for existing active battles
  SELECT COUNT(*) INTO v_existing_count
  FROM battles
  WHERE battler_player_id = p_battler_id
    AND status IN ('accepted', 'locked');

  IF v_existing_count > 0 THEN
    RAISE EXCEPTION 'Battler already has an active battle';
  END IF;

  -- Update battle status
  UPDATE battles
  SET status = 'accepted'
  WHERE id = p_battle_id
    AND battler_player_id = p_battler_id
    AND status = 'offered'
  RETURNING * INTO v_battle;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Battle not found or not in offered status';
  END IF;

  RETURN row_to_json(v_battle);
END;
$$ LANGUAGE plpgsql;
```

```typescript
// Then in API route:
const { data, error } = await supabase.rpc('accept_battle', {
  p_battle_id: id,
  p_battler_id: battler.id
});
```

**Benefits:**
- Atomic operation
- All validation in one transaction
- Better performance (single DB round-trip)

#### Priority

**CRITICAL** - Should be fixed before production release. Add database constraint immediately as a safety net.

---

## Medium Priority Issues

### 🟡 BUG #2: Dashboard Query Excludes Locked Battles

**File:** `c:\git\battlerapuniversity\ai-battlerap\app\dashboard\page.tsx`
**Line:** 48
**Severity:** MEDIUM
**Impact:** Battle disappears from dashboard after prep deadline

#### Description

Dashboard only queries for `status = 'accepted'` battles. Once a battle transitions to `locked` status (when prep deadline passes), it **disappears from the dashboard** even though it hasn't been fought yet.

#### Current Code

```typescript
const { data: nextBattle } = await supabase
  .from('battles')
  .select(`...`)
  .eq('battler_player_id', battler.id)
  .eq('status', 'accepted')  // ← Only shows accepted, not locked
  .gt('scheduled_at', getVirtualNowISO())
  .order('scheduled_at', { ascending: true })
  .limit(1)
  .maybeSingle();
```

#### Problem Scenario

1. User accepts battle scheduled for Nov 30, prep deadline Nov 28
2. User sees battle on dashboard as "NEXT BATTLE"
3. Virtual time advances to Nov 29 (past prep deadline)
4. Battle status changes to "locked" via cron job
5. User visits dashboard
6. **Bug:** "NEXT BATTLE" section is empty (battle disappeared)
7. User is confused - battle is still upcoming but not visible

#### Recommended Fix

```typescript
.in('status', ['accepted', 'locked'])  // Show both accepted and locked
```

Or better yet, remove the scheduled_at filter too:

```typescript
const { data: nextBattle } = await supabase
  .from('battles')
  .select(`...`)
  .eq('battler_player_id', battler.id)
  .in('status', ['accepted', 'locked'])  // Changed
  // Remove: .gt('scheduled_at', getVirtualNowISO())
  .order('scheduled_at', { ascending: true })
  .limit(1)
  .maybeSingle();
```

#### Priority

**MEDIUM** - Affects UX but doesn't break functionality. Battle will reappear after simulation.

---

### 🟡 BUG #3: UI Double-Click Vulnerability

**File:** `c:\git\battlerapuniversity\ai-battlerap\app\battle\offers\page.tsx`
**Lines:** 42-62
**Severity:** MEDIUM
**Impact:** Multiple API calls for same battle

#### Description

React's `useState` is asynchronous. Rapidly double-clicking "Accept" could send two requests before `actionLoading` state updates.

#### Current Code

```typescript
const handleAccept = async (battleId: string) => {
  setActionLoading(battleId);  // ← Async state update
  try {
    const response = await fetch(`/api/battles/${battleId}/accept`, {
      method: 'POST',
    });
    // ...
```

Double-click sequence:
1. Click 1: `setActionLoading(battleId)` called
2. Click 2: Before state updates, `actionLoading` is still `null`
3. Click 2: Button not disabled yet, second request fires
4. Both requests hit API (backend validation will catch it, but wasteful)

#### Recommended Fix

```typescript
const handleAccept = async (battleId: string) => {
  // Early return if any action in progress
  if (actionLoading) return;

  setActionLoading(battleId);
  try {
    // ... rest of code
```

Or use `useCallback` with dependency:

```typescript
const handleAccept = useCallback(async (battleId: string) => {
  if (actionLoading) return;
  // ...
}, [actionLoading]);
```

#### Priority

**MEDIUM** - Backend validation prevents actual damage, but wastes API calls and creates console errors.

---

## Low Priority Issues

### 🟢 ISSUE #4: Generic Database Error Messages

**File:** `c:\git\battlerapuniversity\ai-battlerap\app\api\battles\[id]\accept\route.ts`
**Lines:** 95-98
**Severity:** LOW
**Impact:** Poor user experience on errors

#### Description

Database errors return generic "Failed to accept battle" message. User has no actionable information.

```typescript
if (error) {
  console.error('Error accepting battle:', error);
  return NextResponse.json({ error: 'Failed to accept battle' }, { status: 500 });
}
```

Possible errors:
- Network timeout
- Database connection failure
- Unique constraint violation
- Foreign key constraint violation

User sees same message for all.

#### Recommended Fix

```typescript
if (error) {
  console.error('Error accepting battle:', error);

  // Parse known error types
  if (error.code === '23505') {
    return NextResponse.json(
      { error: 'This battle has already been accepted.' },
      { status: 409 }
    );
  }

  if (error.code === '23503') {
    return NextResponse.json(
      { error: 'Battle or battler not found.' },
      { status: 404 }
    );
  }

  // Generic fallback
  return NextResponse.json(
    { error: 'Failed to accept battle. Please refresh and try again.' },
    { status: 500 }
  );
}
```

---

### 🟢 ISSUE #5: No UUID Validation

**File:** `c:\git\battlerapuniversity\ai-battlerap\app\api\battles\[id]\accept\route.ts`
**Line:** 15
**Severity:** LOW
**Impact:** Wastes database query on malformed IDs

#### Description

Battle ID parameter is not validated before querying database.

```typescript
const { id } = await params;
// No validation - could be "abc123" or "'; DROP TABLE battles; --"
const { data: battle } = await supabase.from('battles').select('*').eq('id', id).single();
```

While Supabase/Postgres is safe from SQL injection, malformed UUIDs cause unnecessary database queries.

#### Recommended Fix

```typescript
const { id } = await params;

// Validate UUID format
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(id)) {
  return NextResponse.json({ error: 'Invalid battle ID format' }, { status: 400 });
}
```

---

### 🟢 ISSUE #6: Uses Browser Alerts for Errors

**File:** `c:\git\battlerapuniversity\ai-battlerap\app\battle\offers\page.tsx`
**Lines:** 55, 80
**Severity:** LOW
**Impact:** Poor UX (alerts are jarring)

#### Description

Error handling uses `alert()` which is considered poor UX:

```typescript
} else {
  const data = await response.json();
  alert(data.error || 'Failed to accept battle');
}
```

Problems with alerts:
- Blocks entire page
- Can't be styled
- Feels outdated
- User must click OK to continue

#### Recommended Fix

Implement toast notification system:

```typescript
// Option 1: Use a library like react-hot-toast
import toast from 'react-hot-toast';

// In error handler:
toast.error(data.error || 'Failed to accept battle');

// Option 2: Simple inline error state
const [error, setError] = useState<string | null>(null);

// In error handler:
setError(data.error || 'Failed to accept battle');

// In JSX:
{error && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    {error}
  </div>
)}
```

---

### 🟢 ISSUE #7: No Success Feedback After Acceptance

**File:** `c:\git\battlerapuniversity\ai-battlerap\app\battle\offers\page.tsx`
**Lines:** 49-52
**Severity:** LOW
**Impact:** User unsure if action succeeded

#### Description

After accepting a battle, the offer just disappears. No confirmation message.

```typescript
if (response.ok) {
  // Refresh offers list
  await fetchOffers();
  // Could also redirect to prep page ← Comment acknowledges the issue
}
```

User experience:
1. Click "Accept"
2. Battle vanishes from list
3. No feedback
4. Was it accepted? Did it error? User must navigate to dashboard to confirm

#### Recommended Fix

```typescript
if (response.ok) {
  // Show success message
  toast.success('Battle accepted! Time to prepare.');

  // Refresh offers
  await fetchOffers();

  // Optional: Auto-redirect to prep page after 2 seconds
  setTimeout(() => {
    router.push(`/battle/${battleId}/prep`);
  }, 2000);
}
```

---

## Testing Recommendations

### Manual Tests Required

1. **Race Condition Test** (Critical)
   - Open 2 browser tabs
   - Click Accept on different battles simultaneously
   - Verify only one succeeds
   - **Expected:** Second shows error
   - **If bug:** Both succeed (query DB to confirm)

2. **Locked Battle Display** (Medium)
   - Accept a battle
   - Use time manipulation to advance past `lock_prep_at`
   - Visit dashboard
   - **Expected:** Battle still visible as "NEXT BATTLE"
   - **If bug:** Battle disappeared

3. **Expired Offer** (Medium)
   - Advance time past an offer's `lock_prep_at`
   - Try to accept it
   - **Expected:** Error "offer has expired"

4. **Multiple Battle Prevention** (High)
   - Accept one battle
   - Try to accept another
   - **Expected:** Error "already have an active battle"

5. **Duplicate Acceptance** (Medium)
   - Accept a battle
   - Use API to try accepting same battle again
   - **Expected:** Error "not in offered status"

### Automated Test Ideas

```typescript
describe('Battle Acceptance', () => {
  test('prevents multiple active battles', async () => {
    const battle1 = await acceptBattle(offerId1);
    expect(battle1.status).toBe('accepted');

    const result = await acceptBattle(offerId2);
    expect(result.error).toContain('already have an active battle');
  });

  test('prevents accepting expired offers', async () => {
    await advanceTime(5); // days
    const result = await acceptBattle(expiredOfferId);
    expect(result.error).toContain('expired');
  });

  test('prevents double-click race condition', async () => {
    const [result1, result2] = await Promise.all([
      acceptBattle(offerId),
      acceptBattle(offerId)
    ]);

    const succeeded = [result1, result2].filter(r => !r.error);
    expect(succeeded).toHaveLength(1);
  });
});
```

---

## Summary & Action Items

### Immediate Actions (Before Production)

1. ✅ **Add database constraint** for one active battle (prevents race condition)
2. ✅ **Fix dashboard query** to include 'locked' status
3. ✅ **Add double-click prevention** in UI

### Nice-to-Have (Can Be Done Later)

4. ✅ Improve error messages with specific codes
5. ✅ Replace alerts with toast notifications
6. ✅ Add success feedback after acceptance
7. ✅ Add UUID validation
8. ✅ Add logging for acceptance events

### Overall Risk Assessment

**Current State:** MEDIUM RISK
- Critical race condition exists but is unlikely to trigger in single-user testing
- UX issues are minor annoyances, not blockers
- Core logic is sound and well-validated

**After Fixes:** LOW RISK
- Database constraint makes race condition impossible
- Remaining issues are purely UX improvements

---

## Files for Review

1. **API Route:** `c:\git\battlerapuniversity\ai-battlerap\app\api\battles\[id]\accept\route.ts`
2. **Offers Page:** `c:\git\battlerapuniversity\ai-battlerap\app\battle\offers\page.tsx`
3. **Dashboard:** `c:\git\battlerapuniversity\ai-battlerap\app\dashboard\page.tsx`
4. **Schema:** `c:\git\battlerapuniversity\ai-battlerap\supabase\migrations\001_initial_schema.sql`

---

## Test Resources Created

1. **Manual Test Guide:** `MANUAL_TEST_GUIDE.md`
2. **SQL Test Queries:** `test-queries.sql`
3. **Code Review:** `BATTLE_ACCEPTANCE_CODE_REVIEW.md`
4. **This Bug Report:** `BUG_REPORT_BATTLE_ACCEPTANCE.md`
