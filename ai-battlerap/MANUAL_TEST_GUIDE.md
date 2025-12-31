# Manual Test Guide: Battle Acceptance Flow

## Prerequisites
1. Development server running on http://localhost:3005
2. User account created and logged in
3. Battler created via onboarding flow
4. At least 2 battle offers available in the database

## Test Scenarios

### Test 1: Accept a Battle from Offers Page

**Steps:**
1. Navigate to http://localhost:3005/battle/offers
2. Verify battle offers are displayed with:
   - Opponent name
   - League name
   - Tier level
   - Scheduled date/time
   - Prep deadline (lock_prep_at)
   - Accept and Decline buttons
3. Click "Accept" on the first battle offer
4. Wait for the request to complete

**Expected Results:**
- ✓ Accept button shows "Processing..." during request
- ✓ Success: Battle is removed from offers list
- ✓ Page shows fewer offers (accepted battle no longer visible)
- ✓ No error message displayed

**Pass Criteria:** Battle disappears from offers page after acceptance

---

### Test 2: Verify Battle Appears on Dashboard as "NEXT BATTLE"

**Steps:**
1. After accepting a battle in Test 1
2. Navigate to http://localhost:3005/dashboard
3. Look for "NEXT BATTLE" section

**Expected Results:**
- ✓ Dashboard displays accepted battle in "NEXT BATTLE" section
- ✓ Shows opponent name, league, scheduled date
- ✓ Shows prep deadline
- ✓ Battle status is shown (should be in prep phase)

**Pass Criteria:** Accepted battle is visible on dashboard with correct information

---

### Test 3: Try to Accept Another Battle (Should Fail)

**Steps:**
1. With one battle already accepted from Test 1
2. Navigate back to http://localhost:3005/battle/offers
3. Click "Accept" on a different battle offer

**Expected Results:**
- ✓ Accept button briefly shows "Processing..."
- ✓ Error alert appears with message: "You already have an active battle. Complete it before accepting another."
- ✓ Battle is NOT accepted
- ✓ Battle remains in offers list
- ✓ No changes to dashboard

**Pass Criteria:** Second battle acceptance is blocked with clear error message

---

### Test 4: Try to Accept Same Battle Twice

**Steps:**
1. Accept a battle (Test 1)
2. Use browser dev tools or direct API call to attempt accepting the same battle ID again
3. POST to `/api/battles/{battle_id}/accept`

**Expected Results:**
- ✓ HTTP 400 error response
- ✓ Error message: "Battle is not in offered status"
- ✓ Battle status remains "accepted" (unchanged)

**Pass Criteria:** Duplicate acceptance is blocked with status validation error

**Manual API Test (using browser console on the site):**
```javascript
// Get the battle ID from the first accepted battle
// Then try to accept it again
fetch('/api/battles/{BATTLE_ID_HERE}/accept', {
  method: 'POST',
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);

// Expected: { error: "Battle is not in offered status" }
```

---

### Test 5: Verify Multiple Battle Check Works

**Steps:**
1. Accept a battle
2. Using Supabase SQL editor or psql, manually create a second accepted battle:
   ```sql
   -- Get your battler ID
   SELECT id FROM battlers WHERE user_id = auth.uid() AND is_ai = false;

   -- Get an AI battler and league
   SELECT id FROM battlers WHERE is_ai = true LIMIT 1;
   SELECT id FROM leagues LIMIT 1;

   -- Create a second accepted battle (bypassing validation)
   INSERT INTO battles (
     battler_player_id,
     battler_ai_id,
     league_id,
     scheduled_at,
     lock_prep_at,
     status
   ) VALUES (
     '{your_battler_id}',
     '{ai_battler_id}',
     '{league_id}',
     now() + interval '3 days',
     now() + interval '2 days',
     'accepted'
   );
   ```
3. Try to accept another offer from the UI

**Expected Results:**
- ✓ Validation detects multiple accepted battles
- ✓ Error message: "You already have an active battle..."
- ✓ Accept is blocked

**Pass Criteria:** Multiple battle validation works correctly

---

### Test 6: Expired Offer Validation

**Prerequisites:**
- `DEV_MODE=true` in `.env.local`
- Time manipulation endpoint available

**Steps:**
1. Note the `lock_prep_at` date of an available offer
2. Use time manipulation to advance virtual time past the prep deadline
3. Attempt to accept the offer

**Expected Results:**
- ✓ HTTP 400 error response
- ✓ Error message: "This battle offer has expired. You cannot accept it as the prep deadline has passed."
- ✓ Battle is not accepted

**Pass Criteria:** Expired offers cannot be accepted

**API Test (with time manipulation):**
```javascript
// First, advance time (need time manipulation endpoint)
// Then try to accept offer
fetch('/api/battles/{EXPIRED_BATTLE_ID}/accept', {
  method: 'POST',
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);

// Expected: { error: "This battle offer has expired..." }
```

---

### Test 7: Battle Status Transition Verification

**Steps:**
1. Accept a battle
2. Query the database to verify status changes

**SQL Verification:**
```sql
-- Check battle status history
SELECT
  id,
  status,
  battler_player_id,
  battler_ai_id,
  created_at,
  scheduled_at,
  lock_prep_at
FROM battles
WHERE battler_player_id = (
  SELECT id FROM battlers
  WHERE user_id = auth.uid()
  AND is_ai = false
)
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Results:**
- ✓ Previously `offered` battle is now `accepted`
- ✓ `scheduled_at` is in the future
- ✓ `lock_prep_at` is before `scheduled_at`
- ✓ No `winner_id` set yet (should be NULL)

**Pass Criteria:** Battle status correctly transitions from `offered` to `accepted`

---

## Test Result Template

```
Test Date: [DATE]
Tester: [NAME]

| Test | Status | Notes |
|------|--------|-------|
| 1. Accept battle from offers | ⬜ PASS / ⬜ FAIL | |
| 2. Battle appears on dashboard | ⬜ PASS / ⬜ FAIL | |
| 3. Multiple battle blocked | ⬜ PASS / ⬜ FAIL | |
| 4. Duplicate acceptance blocked | ⬜ PASS / ⬜ FAIL | |
| 5. Multiple battle DB check | ⬜ PASS / ⬜ FAIL | |
| 6. Expired offer blocked | ⬜ PASS / ⬜ FAIL | |
| 7. Status transition correct | ⬜ PASS / ⬜ FAIL | |

Overall Result: ⬜ PASS / ⬜ FAIL

Bugs Found:
1. [Description]
2. [Description]

Suggested Improvements:
1. [Description]
2. [Description]
```

---

## Known Issues to Check

1. **Race Condition**: Can two Accept clicks on the same battle both succeed?
   - Test: Rapidly double-click Accept button
   - Expected: Only one succeeds due to status check

2. **UI State**: Does the offers page refresh after acceptance?
   - Test: Check if `fetchOffers()` is called after successful acceptance
   - Expected: Offers list updates automatically

3. **Error Display**: Are error messages user-friendly?
   - Test: Review all error messages
   - Expected: Clear, actionable error text (not technical database errors)

4. **Loading State**: Is the button disabled during acceptance?
   - Test: Check if button is disabled when `actionLoading === offer.id`
   - Expected: Button shows "Processing..." and is non-clickable

5. **Authorization**: Can user accept battles for another user's battler?
   - Test: Modify API request to use different battler_id
   - Expected: 403 Forbidden error

---

## Automated Test Ideas (Future)

For automated E2E testing with Playwright or Cypress:

```javascript
test('battle acceptance flow', async ({ page }) => {
  await page.goto('/battle/offers');

  // Get first offer
  const firstOffer = page.locator('[data-testid="battle-offer"]').first();
  const opponentName = await firstOffer.locator('[data-testid="opponent-name"]').textContent();

  // Accept battle
  await firstOffer.locator('button:has-text("Accept")').click();

  // Verify removed from offers
  await expect(page.locator(`text=${opponentName}`)).toHaveCount(0);

  // Navigate to dashboard
  await page.goto('/dashboard');

  // Verify appears as next battle
  await expect(page.locator('[data-testid="next-battle"]')).toContainText(opponentName);

  // Try to accept another (should fail)
  await page.goto('/battle/offers');
  await page.locator('[data-testid="battle-offer"] button:has-text("Accept")').first().click();

  // Verify error message
  await expect(page.locator('.alert-error')).toContainText('already have an active battle');
});
```

---

## Database Verification Queries

**Check current battle state:**
```sql
SELECT
  b.id,
  b.status,
  b.scheduled_at,
  b.lock_prep_at,
  bp.stage_name as player,
  ba.stage_name as opponent,
  l.name as league
FROM battles b
JOIN battlers bp ON b.battler_player_id = bp.id
JOIN battlers ba ON b.battler_ai_id = ba.id
JOIN leagues l ON b.league_id = l.id
WHERE bp.user_id = auth.uid()
ORDER BY b.created_at DESC;
```

**Check for multiple accepted battles (should return 0 or 1):**
```sql
SELECT COUNT(*)
FROM battles b
JOIN battlers bp ON b.battler_player_id = bp.id
WHERE bp.user_id = auth.uid()
  AND b.status IN ('accepted', 'locked');
```

**Check prep blocks for accepted battle:**
```sql
SELECT
  pb.battle_id,
  pb.day_number,
  pb.focus_type,
  b.status
FROM prep_blocks pb
JOIN battles b ON pb.battle_id = b.id
JOIN battlers bp ON b.battler_player_id = bp.id
WHERE bp.user_id = auth.uid()
  AND b.status = 'accepted';
```
