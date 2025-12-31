# Edge Case Testing Report

## Test Date: 2025-11-25

## Summary

This report documents edge case testing performed on the BattleRap University application. Tests covered authentication, validation, malformed requests, non-existent resources, security, and HTTP method handling.

---

## Overall Findings

### Strengths
1. **Authentication Working**: All protected endpoints properly return `401 Unauthorized` when accessed without authentication
2. **Method Validation**: Unsupported HTTP methods return proper `405 Method Not Allowed` responses
3. **Input Validation**: Attribute allocation validation is comprehensive (checks total points, min/max values)
4. **State Machine Protection**: Battle status transitions are validated (can't accept non-offered battles)
5. **Ownership Verification**: Routes check that users can only access their own battles
6. **Concurrent Battle Prevention**: Users cannot accept multiple battles simultaneously

### Critical Issues

#### 1. **500 Errors on Invalid UUIDs** (HIGH PRIORITY)
Multiple endpoints crash with `500 Internal Server Error` when given invalid UUIDs instead of returning proper `400 Bad Request` errors.

**Affected Endpoints:**
- `GET /api/battles/[id]` - Invalid UUID causes 500
- `POST /api/battles/[id]/accept` - Invalid UUID causes 500
- `POST /api/battles/[id]/prep` - Invalid UUID causes 500
- `GET /api/news/[slug]` - Non-existent article causes 500

**Root Cause:** Supabase `.single()` method throws an error when no result is found, causing unhandled exceptions.

**Impact:** Users see generic "Internal Server Error" instead of helpful error messages.

**Recommended Fix:**
```typescript
// CURRENT (BAD):
const { data: battle } = await supabase
  .from('battles')
  .select('*')
  .eq('id', id)
  .single();

if (!battle) {
  return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
}

// RECOMMENDED (GOOD):
const { data: battle, error } = await supabase
  .from('battles')
  .select('*')
  .eq('id', id)
  .maybeSingle();

if (error || !battle) {
  return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
}
```

**Files Requiring Changes:**
- `c:\git\battlerapuniversity\ai-battlerap\app\api\battles\[id]\route.ts`
- `c:\git\battlerapuniversity\ai-battlerap\app\api\battles\[id]\accept\route.ts`
- `c:\git\battlerapuniversity\ai-battlerap\app\api\battles\[id]\decline\route.ts`
- `c:\git\battlerapuniversity\ai-battlerap\app\api\battles\[id]\prep\route.ts`
- `c:\git\battlerapuniversity\ai-battlerap\app\api\news\[slug]\route.ts`
- `c:\git\battlerapuniversity\ai-battlerap\app\api\life-events\[id]\resolve\route.ts`

---

#### 2. **Internal API Error Handling** (MEDIUM PRIORITY)
Internal API endpoints (`/api/internal/*`) throw `500 Internal Server Error` when authentication fails, instead of returning proper error responses.

**Affected Endpoints:**
- `POST /api/internal/run-due-battles`
- `POST /api/internal/generate-battle-offers`

**Root Cause:** The `verifyInternalSecret` function in `lib/db/server.ts` throws an error when `INTERNAL_API_SECRET` is missing:

```typescript
export function verifyInternalSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.INTERNAL_API_SECRET;

  if (!secret) {
    throw new Error('INTERNAL_API_SECRET not configured'); // ❌ THROWS ERROR
  }

  return authHeader === `Bearer ${secret}`;
}
```

**Impact:** Cron jobs or internal calls with wrong credentials get 500 errors instead of 401.

**Recommended Fix:**
```typescript
export function verifyInternalSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.INTERNAL_API_SECRET;

  if (!secret) {
    console.error('INTERNAL_API_SECRET not configured');
    return false; // ✅ RETURN FALSE INSTEAD
  }

  return authHeader === `Bearer ${secret}`;
}
```

---

#### 3. **Missing Validation Edge Cases** (LOW PRIORITY)
Some validation edge cases could be more explicit:

**Day Index Validation:**
- Current: Checks `day_index < 1`
- Missing: What if `day_index` is not a number at all? (e.g., `"hello"`, `null`, `undefined`)

**Current Code:**
```typescript
if (typeof day_index !== 'number' || day_index < 1) {
  return NextResponse.json({ error: 'Invalid day_index' }, { status: 400 });
}
```

This is actually **correct** - the `typeof` check handles non-numbers properly.

**Focus Validation:**
- ✅ Properly validates focus is in allowed list
- ✅ Returns clear error message

---

## Detailed Test Results

### 1. Authentication Tests

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Access battle offers without auth | 401 Unauthorized | 401 Unauthorized | ✅ PASS |
| Create battler without auth | 401 Unauthorized | 401 Unauthorized | ✅ PASS |
| Access battle without auth | 401 Unauthorized | 500 Internal Server Error | ❌ FAIL |

**Note:** Test 1.3 fails because it tries to access a non-existent battle, which triggers the `.single()` error before auth is fully processed.

---

### 2. Invalid Data Tests

All tests properly return `401 Unauthorized` because they require authentication. To test these properly, authenticated tests are needed.

**Validation Logic Review (from code):**

#### Battler Creation Validation
✅ **Stage name validation:**
```typescript
if (!stage_name || stage_name.trim().length === 0) {
  return NextResponse.json({ error: 'Stage name is required' }, { status: 400 });
}
```

✅ **Style tags validation:**
```typescript
if (!Array.isArray(style_tags) || style_tags.length === 0 || style_tags.length > 3) {
  return NextResponse.json({ error: 'Must select 1-3 style tags' }, { status: 400 });
}
```

✅ **League validation:**
```typescript
if (!primary_league_id) {
  return NextResponse.json({ error: 'League selection is required' }, { status: 400 });
}

// Also verifies league exists in database
const { data: league } = await supabase
  .from('leagues')
  .select('id')
  .eq('id', primary_league_id)
  .single();

if (!league) {
  return NextResponse.json({ error: 'Invalid league ID' }, { status: 400 });
}
```

✅ **Attribute allocation validation:**
```typescript
function validateAllocatedAttributes(attrs: any): attrs is AllocatedAttributes {
  // Checks structure exists
  if (!attrs.writing || !attrs.performance || !attrs.personal || typeof attrs.resilience !== 'number') {
    return false;
  }

  // Checks each value is number and within bounds
  for (const value of values) {
    if (typeof value !== 'number' || value < MIN_PER_ATTRIBUTE || value > MAX_PER_ATTRIBUTE) {
      return false;
    }
  }

  // Checks total equals 25
  const total = values.reduce((sum, val) => sum + val, 0);
  if (total !== TOTAL_POINTS) {
    return false;
  }

  return true;
}
```

Error message:
```typescript
if (!validateAllocatedAttributes(allocated_attributes)) {
  return NextResponse.json(
    { error: 'Invalid attribute allocation. Must total 25 points with each stat between 1-8.' },
    { status: 400 }
  );
}
```

**Assessment:** ✅ Excellent validation coverage and clear error messages.

---

### 3. Prep Endpoint Validation

✅ **Day index validation:**
```typescript
if (typeof day_index !== 'number' || day_index < 1) {
  return NextResponse.json({ error: 'Invalid day_index' }, { status: 400 });
}
```

✅ **Focus validation:**
```typescript
const validFocus = ['research', 'writing', 'performance', 'life', 'rest'];
if (!validFocus.includes(focus)) {
  return NextResponse.json({ error: 'Invalid focus' }, { status: 400 });
}
```

✅ **Prep lock validation:**
```typescript
const now = getVirtualNow();
const lockDate = new Date(battle.lock_prep_at);
if (now >= lockDate) {
  return NextResponse.json({ error: 'Prep is locked' }, { status: 400 });
}
```

✅ **Day range validation:**
```typescript
if (day_index > totalPrepDays) {
  return NextResponse.json({ error: 'Invalid day_index' }, { status: 400 });
}
```

**Assessment:** ✅ Comprehensive validation with clear error messages.

---

### 4. Battle Acceptance Validation

✅ **Status validation:**
```typescript
if (battle.status !== 'offered') {
  return NextResponse.json({ error: 'Battle is not in offered status' }, { status: 400 });
}
```

✅ **Concurrent battle prevention:**
```typescript
const { data: existingBattles } = await supabase
  .from('battles')
  .select('id, status')
  .eq('battler_player_id', battler.id)
  .in('status', ['accepted', 'locked'])
  .limit(1);

if (existingBattles && existingBattles.length > 0) {
  return NextResponse.json(
    { error: 'You already have an active battle. Complete it before accepting another.' },
    { status: 400 }
  );
}
```

✅ **Expiration check:**
```typescript
const now = getVirtualNow();
const lockDate = new Date(battle.lock_prep_at);
if (now >= lockDate) {
  return NextResponse.json(
    { error: 'This battle offer has expired. You cannot accept it as the prep deadline has passed.' },
    { status: 400 }
  );
}
```

**Assessment:** ✅ Excellent business logic validation with helpful error messages.

---

### 5. Security Tests

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Internal API without secret | 401 Unauthorized | 500 Internal Server Error | ❌ FAIL |
| Internal API with wrong secret | 401 Unauthorized | 500 Internal Server Error | ❌ FAIL |

**Root Cause:** `verifyInternalSecret` throws error instead of returning false.

---

### 6. HTTP Method Tests

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| DELETE on POST-only endpoint | 405 Method Not Allowed | 405 Method Not Allowed | ✅ PASS |
| PUT on POST-only endpoint | 405 Method Not Allowed | 500 Internal Server Error | ❌ FAIL |
| PATCH on GET-only endpoint | 405 Method Not Allowed | 405 Method Not Allowed | ✅ PASS |

**Note:** The PUT test fails because it still tries to process the request and hits the `.single()` error.

---

## Missing Edge Cases to Test

### 1. **Duplicate Battler Creation**
What happens if a user tries to create a second battler?

**Current Code:**
```typescript
const { data: existingBattler } = await supabase
  .from('battlers')
  .select('id')
  .eq('user_id', user.id)
  .eq('is_ai', false)
  .maybeSingle();

if (existingBattler) {
  return NextResponse.json({ error: 'User already has a battler' }, { status: 400 });
}
```

**Assessment:** ✅ Already handled!

---

### 2. **Race Conditions**
What happens if:
- User accepts battle twice simultaneously?
- User sets prep for the same day twice simultaneously?

**Current Protection:**
- Database unique constraints should prevent duplicates
- Upsert operation handles concurrent prep updates:
```typescript
.upsert(
  { battle_id, battler_id, day_index, focus, auto_generated: false },
  { onConflict: 'battle_id,battler_id,day_index' }
)
```

**Assessment:** ✅ Properly handled with upsert logic.

---

### 3. **No-Show Scenario**
What happens if a user accepts a battle but never sets any prep?

**Current Code (from run-due-battles):**
```typescript
const { data: playerPrepBlocks } = await supabase
  .from('prep_blocks')
  .select('id')
  .eq('battle_id', battle.id)
  .eq('battler_id', battle.battler_player_id);

if (!playerPrepBlocks || playerPrepBlocks.length === 0) {
  noShowFlag = true;
  // Auto-generate "rest" prep for all days
  // Mark battle with no_show_player: true
}
```

**Assessment:** ✅ Handled gracefully - auto-generates minimal prep and marks as no-show.

---

### 4. **Boundary Conditions**

#### Test: Attribute Values at Exact Boundaries
- ✅ Each attribute must be between 1-8
- ✅ Total must equal exactly 25
- ✅ Validation checks `value < MIN_PER_ATTRIBUTE || value > MAX_PER_ATTRIBUTE`

**Recommendation:** Should test:
- All attributes = 1 (total = 11) - Should fail
- All attributes = 8 (total = 88) - Should fail
- Mixed values totaling exactly 25 - Should pass
- Mixed values totaling 24 or 26 - Should fail

---

## Error Message Quality Assessment

### Good Error Messages ✅
```
"Invalid attribute allocation. Must total 25 points with each stat between 1-8."
"You already have an active battle. Complete it before accepting another."
"This battle offer has expired. You cannot accept it as the prep deadline has passed."
"Must select 1-3 style tags"
"Battle is not in offered status"
```

These messages:
- ✅ Explain what went wrong
- ✅ Explain what the user should do
- ✅ Are user-friendly, not technical

### Generic Error Messages ⚠️
```
"Unauthorized"
"Battle not found"
"No battler found"
"Invalid day_index"
"Invalid focus"
"Prep is locked"
```

These messages:
- ⚠️ Could be more helpful
- ⚠️ Don't explain what the user should do

**Recommendations:**
- "Invalid day_index" → "Invalid day number. Must be between 1 and {totalPrepDays}."
- "Invalid focus" → "Invalid prep focus. Must be one of: research, writing, performance, life, rest."
- "Prep is locked" → "Prep deadline has passed. You can no longer modify your prep for this battle."

---

## HTTP Status Code Review

| Scenario | Current Status | Correct? |
|----------|---------------|----------|
| Not authenticated | 401 | ✅ Correct |
| Not authorized (wrong user) | 403 | ✅ Correct |
| Resource not found | 404 | ✅ Correct |
| Invalid input | 400 | ✅ Correct |
| Method not allowed | 405 | ✅ Correct |
| Server error | 500 | ⚠️ Should be 400 in many cases |

**Issues:**
- Invalid UUIDs should return `400 Bad Request`, not `500 Internal Server Error`
- Missing environment variables should fail gracefully with proper status codes

---

## Security Assessment

### ✅ Strong Security Points
1. **Authentication Required:** All user-facing endpoints check authentication
2. **Ownership Verification:** Routes verify users can only access their own data
3. **Service Role Separation:** Internal APIs use service role, user APIs use user auth
4. **State Machine Protection:** Can't skip states (e.g., can't prep without accepting)
5. **RLS Bypass Only When Needed:** Service role only used in internal APIs and specific mutations

### ⚠️ Security Concerns
1. **Internal API Secret Handling:** Should not throw error, should fail gracefully
2. **Error Information Leakage:** Generic 500 errors don't leak sensitive info (good), but should be more specific 400s
3. **No Rate Limiting:** Consider adding rate limiting to prevent abuse (future enhancement)

---

## Recommendations

### Priority 1: Critical Fixes
1. **Replace `.single()` with `.maybeSingle()`** in all API routes to prevent 500 errors on missing resources
2. **Fix `verifyInternalSecret`** to return false instead of throwing error

### Priority 2: Improvements
1. **Enhance error messages** for validation failures to be more descriptive
2. **Add try-catch wrappers** around all route handlers to catch unexpected errors
3. **Standardize error response format** across all endpoints

### Priority 3: Nice-to-Have
1. **Add request validation middleware** to centralize common checks
2. **Add logging** for all errors with request context
3. **Add monitoring** for 500 error rates

---

## Conclusion

The application has **strong foundational security and validation**, with proper authentication, ownership checks, and business logic validation. The main issues are:

1. **Technical debt in error handling** - Using `.single()` causes 500 errors instead of 404s
2. **Internal API error handling** - Should fail gracefully instead of throwing errors

These are **straightforward fixes** that will significantly improve the robustness and user experience of the application.

**Overall Grade: B+**
- Security: A
- Validation: A
- Error Handling: C (brings down overall score)
- Error Messages: B+
- HTTP Status Codes: B (would be A with fixes)
