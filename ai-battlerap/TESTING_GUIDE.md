# Battle Rap University - Manual Testing Guide

**Version**: 1.0
**Last Updated**: November 30, 2025
**Purpose**: Step-by-step testing instructions for launch verification

---

## Overview

This guide provides detailed testing procedures for all major user flows in Battle Rap University. Each test includes:
- Prerequisites
- Step-by-step instructions
- Expected results
- How to verify success
- Common issues and solutions

**Estimated Time**: 3-4 hours for complete test suite

---

## Test Environment Setup

### Prerequisites

1. **Browser**: Chrome or Firefox (latest version)
2. **Device**: Desktop + mobile device (or Chrome DevTools mobile emulation)
3. **Tools**:
   - Browser DevTools (F12)
   - Network tab for monitoring requests
   - Console tab for errors
4. **Test Accounts**:
   - Email address you can access (for magic links)
   - Alternatively: Use temp email service

### Initial Setup

```bash
# For local testing
cd ai-battlerap
npm run dev

# For production testing
# Use deployed URL: https://[your-domain].com
```

---

## TEST SUITE 1: AUTHENTICATION

### Test 1.1: New User Signup

**Objective**: Verify new user can create account

**Steps**:
1. Open browser, navigate to `/login`
2. Enter email: `test+newuser@example.com`
3. Click "SEND MAGIC LINK"
4. Check email inbox
5. Click magic link in email
6. Observe redirect

**Expected Results**:
- ✓ "Magic link sent" message appears
- ✓ Email arrives within 30 seconds
- ✓ Clicking link redirects to `/auth/confirm`
- ✓ Loading spinner shows briefly
- ✓ Redirects to `/onboarding`
- ✓ No errors in console

**Verification**:
```sql
-- Check Supabase dashboard
SELECT * FROM auth.users WHERE email = 'test+newuser@example.com';
-- Should show 1 user
```

**Common Issues**:
- Email not arriving: Check Supabase email settings
- Redirect fails: Check console for auth errors
- Stuck on confirm page: Check `exchangeCodeForSession` call

---

### Test 1.2: Returning User Login

**Objective**: Verify existing user can login

**Prerequisites**: Complete Test 1.1 first

**Steps**:
1. Logout (or open incognito window)
2. Navigate to `/login`
3. Enter same email: `test+newuser@example.com`
4. Click "SEND MAGIC LINK"
5. Check email
6. Click magic link
7. Observe redirect

**Expected Results**:
- ✓ Magic link sent confirmation
- ✓ Clicking link redirects to `/auth/confirm`
- ✓ Redirects to `/onboarding` (if no battler created)
- ✓ OR redirects to `/dashboard` (if battler exists from Test 2.1)

**Verification**:
- If user has battler → Dashboard loads
- If user has no battler → Onboarding wizard appears

---

### Test 1.3: Protected Route Enforcement

**Objective**: Verify unauthenticated users can't access protected pages

**Steps**:
1. Open incognito window
2. Navigate directly to `/dashboard`
3. Observe result

**Expected Results**:
- ✓ Redirects to `/login`
- ✓ Shows "Please log in" message (or similar)

**Repeat for**:
- `/battle/offers`
- `/battle/[any-id]/prep`
- `/onboarding`

**Verification**:
- None of these pages load without auth
- All redirect to login

---

## TEST SUITE 2: BATTLER CREATION

### Test 2.1: Onboarding Wizard

**Objective**: Create a battler from scratch

**Prerequisites**: Logged in user with no battler (from Test 1.1)

**Steps**:

**Step 1: Name & Profile**
1. On `/onboarding`, enter battler name: "Test Battler 1"
2. (Optional) Upload profile image
3. Click "NEXT"

**Expected**:
- ✓ Name field accepts input
- ✓ Name must be 3-30 characters
- ✓ Image upload works (if used)
- ✓ Advances to Step 2

**Step 2: League Selection**
4. View league options:
   - Small Room Circuit
   - Main Stage Arena
5. Click "Small Room Circuit"
6. Click "NEXT"

**Expected**:
- ✓ Both leagues displayed
- ✓ Description shown for each
- ✓ Selection highlights chosen league
- ✓ Advances to Step 3

**Step 3: Style Tags**
7. View available style tags (badges)
8. Select 3 tags:
   - "Wordplay"
   - "Aggressive"
   - "Crowd Favorite"
9. Click "COMPLETE ONBOARDING"

**Expected**:
- ✓ Badge list loads
- ✓ Can select exactly 3 badges
- ✓ Can deselect and reselect
- ✓ Cannot select 4th badge
- ✓ "Complete" button enabled after 3 selected

**Final Result**:
- ✓ Redirects to `/dashboard`
- ✓ Battler name appears in header
- ✓ Rating shows 1200
- ✓ No errors in console

**Verification**:
```sql
-- Check battler created
SELECT * FROM battlers WHERE name = 'Test Battler 1';

-- Check attributes initialized
SELECT * FROM battler_attributes WHERE battler_id = '[id from above]';

-- Check ranking created
SELECT * FROM rankings WHERE battler_id = '[id]';
-- Should show: rating = 1200, wins = 0, losses = 0
```

---

### Test 2.2: Attribute Initialization

**Objective**: Verify all attributes start at 4.0

**Prerequisites**: Complete Test 2.1

**Steps**:
1. On dashboard, view battler stats
2. Check each attribute value

**Expected Attributes**:
```
WRITING:
- Lyricism: 4.0
- Wordplay: 4.0
- Creativity: 4.0
- Flow: 4.0

PERFORMANCE:
- Stage Presence: 4.0
- Crowd Control: 4.0
- Delivery: 4.0

PERSONAL:
- Resilience: 4.0
- Financial Stability: 4.0
- Reputation: 4.0
- Preparation: 4.0
- Family Bond: 4.0
```

**Verification**:
- ✓ All attributes visible
- ✓ All start at 4.0/10
- ✓ Attributes grouped by category

---

## TEST SUITE 3: BATTLE OFFERS

### Test 3.1: Generate Battle Offers

**Objective**: Create battle offers for testing

**Prerequisites**: Battler created (Test 2.1)

**Steps**:
1. Open terminal or API client (Postman/Insomnia)
2. Send POST request:
   ```bash
   curl -X POST https://[your-domain]/api/internal/generate-battle-offers \
     -H "Authorization: Bearer [INTERNAL_API_SECRET]"
   ```
3. Check response

**Expected Results**:
- ✓ 200 OK response
- ✓ JSON response: `{ "success": true, "offersGenerated": 3 }`
- ✓ Offers created in database

**Verification**:
```sql
SELECT * FROM battles WHERE status = 'offered' AND player_battler_id = '[your battler id]';
-- Should show 3-5 offers
```

---

### Test 3.2: View Battle Offers

**Objective**: See available battles on offers page

**Prerequisites**: Complete Test 3.1

**Steps**:
1. Navigate to `/battle/offers`
2. View offer list

**Expected Results**:
- ✓ Page loads within 1 second
- ✓ 3-5 offer cards displayed
- ✓ Each card shows:
  - Opponent name
  - League
  - Scheduled date
  - Purse amount
  - "ACCEPT BATTLE" button
  - "DECLINE" button

**Verification**:
- Offers sorted by scheduled date (nearest first)
- Dates are in future
- Opponent names are AI battlers

---

### Test 3.3: Accept Battle

**Objective**: Accept a battle offer

**Prerequisites**: Complete Test 3.2

**Steps**:
1. On `/battle/offers`, find first offer
2. Click "ACCEPT BATTLE"
3. Observe redirect

**Expected Results**:
- ✓ Button shows loading state briefly
- ✓ Redirects to `/battle/[id]/prep`
- ✓ Prep calendar loads
- ✓ Battle status changes to 'accepted'

**Verification**:
```sql
SELECT status FROM battles WHERE id = '[battle id]';
-- Should show: status = 'accepted'
```

**Check Dashboard**:
- Navigate to `/dashboard`
- "Next Battle" section should show accepted battle

---

### Test 3.4: Decline Battle

**Objective**: Decline a battle offer

**Prerequisites**: At least 2 offers exist (from Test 3.1)

**Steps**:
1. On `/battle/offers`, find second offer
2. Click "DECLINE"
3. Observe result

**Expected Results**:
- ✓ Offer card disappears
- ✓ "Offer declined" message appears
- ✓ Battle status changes to 'declined'
- ✓ Reputation decreases by 0.1

**Verification**:
```sql
SELECT status FROM battles WHERE id = '[battle id]';
-- Should show: status = 'declined'

SELECT reputation FROM battler_attributes WHERE battler_id = '[your battler id]';
-- Should be: 3.9 (decreased from 4.0)
```

---

## TEST SUITE 4: PREP CALENDAR

### Test 4.1: Prep Calendar Loads

**Objective**: View prep calendar for accepted battle

**Prerequisites**: Battle accepted (Test 3.3)

**Steps**:
1. Navigate to `/battle/[id]/prep` (or should already be there)
2. View calendar

**Expected Results**:
- ✓ Calendar displays days from today to lock date
- ✓ Each day has dropdown menu
- ✓ Dropdown options:
  - Research
  - Writing
  - Performance
  - Life
  - Rest
- ✓ Prep summary card shows counts
- ✓ "LOCK IN PREP" button visible

**Verification**:
- Number of days = (lock_prep_at - accepted_at) / 1 day
- Default: All days set to "Rest" or empty

---

### Test 4.2: Select Prep Focus

**Objective**: Choose daily prep activities

**Prerequisites**: Test 4.1

**Steps**:
1. Day 1: Select "Writing"
2. Day 2: Select "Performance"
3. Day 3: Select "Research"
4. Day 4: Select "Writing"
5. Day 5: Select "Rest"
6. Observe auto-save

**Expected Results**:
- ✓ Each selection saves immediately (no submit button)
- ✓ Dropdown updates to show selected value
- ✓ Prep summary updates:
  - Writing: 2 days
  - Performance: 1 day
  - Research: 1 day
  - Rest: 1 day
- ✓ Loading indicator appears briefly on each change

**Verification**:
```sql
SELECT * FROM prep_blocks WHERE battle_id = '[battle id]';
-- Should show 5 rows with chosen focus types
```

---

### Test 4.3: Prep Persistence

**Objective**: Verify prep choices persist across sessions

**Prerequisites**: Complete Test 4.2

**Steps**:
1. Refresh page (F5)
2. Navigate away to `/dashboard`
3. Navigate back to `/battle/[id]/prep`
4. Check selections

**Expected Results**:
- ✓ All previous selections still shown
- ✓ Prep summary matches previous state
- ✓ No data lost

---

### Test 4.4: Lock In Prep

**Objective**: Finalize prep before battle

**Prerequisites**: Complete Test 4.2

**Steps**:
1. On `/battle/[id]/prep`, click "LOCK IN PREP"
2. Confirm dialog (if present)
3. Observe result

**Expected Results**:
- ✓ Success message appears
- ✓ Dropdowns become disabled
- ✓ "LOCK IN PREP" button changes to "PREP LOCKED"
- ✓ Cannot change selections anymore

**Verification**:
```sql
SELECT status FROM battles WHERE id = '[battle id]';
-- Should show: status = 'locked'
```

---

### Test 4.5: Prep Lock Enforcement

**Objective**: Verify locked prep can't be changed

**Prerequisites**: Complete Test 4.4

**Steps**:
1. Try to change any dropdown
2. Observe result

**Expected Results**:
- ✓ Dropdowns disabled
- ✓ OR error message: "Prep is locked"
- ✓ Changes not saved

---

## TEST SUITE 5: BATTLE SIMULATION

### Test 5.1: Manual Battle Trigger (Dev Mode)

**Objective**: Force a battle to simulate

**Prerequisites**: Battle locked (Test 4.4)

**Steps**:
1. Find battle ID from URL or database
2. Send POST request:
   ```bash
   curl -X POST "https://[your-domain]/api/internal/run-due-battles?battle_id=[id]" \
     -H "Authorization: Bearer [INTERNAL_API_SECRET]"
   ```
3. Check response

**Expected Results**:
- ✓ 200 OK response
- ✓ JSON: `{ "success": true, "battlesSimulated": 1 }`
- ✓ Battle status changes to 'completed'

**Verification**:
```sql
SELECT status, winner_id FROM battles WHERE id = '[battle id]';
-- Should show: status = 'completed', winner_id = '[battler id]'

SELECT * FROM battle_rounds WHERE battle_id = '[battle id]';
-- Should show: 3 rounds with scores

SELECT * FROM battle_segments WHERE battle_id = '[battle id]';
-- Should show: 12-18 segments depending on league
```

---

### Test 5.2: View Battle Results

**Objective**: See completed battle details

**Prerequisites**: Complete Test 5.1

**Steps**:
1. Navigate to `/battle/[id]`
2. View results page

**Expected Results**:
- ✓ Page loads within 2 seconds
- ✓ Winner announced at top
- ✓ Result: "2-1" or "3-0" or "1-2" or "0-3"
- ✓ Round-by-round scores shown:
  - Round 1: Player X.XX vs Opponent X.XX
  - Round 2: Player X.XX vs Opponent X.XX
  - Round 3: Player X.XX vs Opponent X.XX
- ✓ Segment timeline displayed
- ✓ Peak moments highlighted
- ✓ Choke indicators (if occurred)

**Verification**:
- Winner matches higher score
- Segments add up to round totals
- No NaN values
- No negative scores

---

### Test 5.3: Rating Update After Battle

**Objective**: Verify ELO rating changes

**Prerequisites**: Complete Test 5.2

**Steps**:
1. Note rating before battle (from dashboard)
2. Complete battle (Test 5.1)
3. Navigate to `/dashboard`
4. Check new rating

**Expected Results**:
- ✓ If WON: Rating increased (+10 to +40 depending on opponent)
- ✓ If LOST: Rating decreased (-10 to -40)
- ✓ Rating change shown on dashboard
- ✓ Win/loss record updated

**Verification**:
```sql
SELECT rating, wins, losses FROM rankings WHERE battler_id = '[your battler id]';
-- Rating changed
-- Wins or losses incremented by 1
```

---

### Test 5.4: Post-Battle Summary

**Objective**: View progression after battle

**Prerequisites**: Complete Test 5.2

**Steps**:
1. On battle results page, scroll to "POST-BATTLE SUMMARY"
2. View changes

**Expected Results**:
- ✓ XP gained shown
- ✓ Level progress bar updated
- ✓ Attribute changes displayed:
  - Before → After for each attribute that changed
- ✓ Skill points earned (if leveled up)
- ✓ Rating change: XXXX → YYYY

**Verification**:
- XP gain ≥ 50 (minimum per battle)
- Attributes increased if won
- Attributes flat or slightly decreased if lost

---

## TEST SUITE 6: LIFE EVENTS

### Test 6.1: Trigger Life Event

**Objective**: Complete a battle that triggers a life event

**Prerequisites**: None (fresh battler)

**Steps**:
1. Accept battle
2. Prep with all "Writing" focus
3. Simulate battle (Test 5.1)
4. Navigate to `/dashboard`
5. Check for notification bell

**Trigger Conditions** (any of these):
- Win battle (50% chance of event)
- Lose battle (30% chance of event)
- Win streak of 2+ (guaranteed event)
- Choke in battle (guaranteed event)

**Expected Results**:
- ✓ Notification bell shows red badge (if event triggered)
- ✓ Badge count = 1

**If No Event Triggered**:
- Complete another battle
- Events are probabilistic

---

### Test 6.2: View Life Event

**Objective**: Read event details

**Prerequisites**: Event triggered (Test 6.1)

**Steps**:
1. Click notification bell
2. Click life event notification
3. Observe redirect to `/life-events/[id]`
4. Read event

**Expected Results**:
- ✓ Event page loads
- ✓ Event title displayed (e.g., "Record Label Offer")
- ✓ Event description shown (narrative text)
- ✓ 3 choice buttons visible:
  - Choice 1 (e.g., "Accept the Deal")
  - Choice 2 (e.g., "Decline Politely")
  - Choice 3 (e.g., "Negotiate Terms")
- ✓ Each choice shows potential consequences

**Verification**:
- Consequences listed (e.g., "+0.5 Reputation, -0.3 Financial Stability")

---

### Test 6.3: Make Life Event Choice

**Objective**: Select and confirm choice

**Prerequisites**: Complete Test 6.2

**Steps**:
1. On `/life-events/[id]`, click "Choice 1"
2. Confirm dialog (if present)
3. Observe result

**Expected Results**:
- ✓ "Choice Made" success message
- ✓ Attributes updated immediately
- ✓ Event marked as resolved
- ✓ Cannot change choice after confirming

**Verification**:
```sql
SELECT * FROM life_events WHERE id = '[event id]';
-- Should show: resolved = true, choice_made = 1

SELECT * FROM battler_attributes WHERE battler_id = '[your battler id]';
-- Attributes changed according to choice consequences
```

---

### Test 6.4: Life Event History

**Objective**: View past events

**Prerequisites**: At least 1 resolved event (Test 6.3)

**Steps**:
1. Navigate to `/life-events/history`
2. View list

**Expected Results**:
- ✓ All resolved events shown
- ✓ Event title, date, choice made displayed
- ✓ Consequences summary shown
- ✓ Sorted by date (newest first)

---

## TEST SUITE 7: NOTIFICATIONS

### Test 7.1: Notification Bell

**Objective**: Verify notification UI

**Prerequisites**: At least 1 unread notification (from Test 6.1)

**Steps**:
1. On any page, view top-right corner
2. Check notification bell icon

**Expected Results**:
- ✓ Bell icon visible
- ✓ Red badge with count (e.g., "1", "3")
- ✓ Badge disappears if no unread notifications

---

### Test 7.2: Notification List

**Objective**: View all notifications

**Prerequisites**: Complete Test 7.1

**Steps**:
1. Click bell icon
2. View notification dropdown or page

**Expected Results**:
- ✓ List of notifications appears
- ✓ Unread notifications in bold
- ✓ Read notifications in normal weight
- ✓ Each notification shows:
  - Title
  - Brief description
  - Time ago (e.g., "2 hours ago")
  - Type icon (battle result, life event, etc.)

---

### Test 7.3: Notification Navigation

**Objective**: Click notification to navigate

**Prerequisites**: Complete Test 7.2

**Steps**:
1. Click a notification
2. Observe redirect

**Expected Results**:
- ✓ Redirects to relevant page:
  - Battle result → `/battle/[id]`
  - Life event → `/life-events/[id]`
  - Tournament → `/tournaments/[id]`
- ✓ Notification marked as read
- ✓ Badge count decreases

**Verification**:
```sql
SELECT is_read FROM notifications WHERE id = '[notification id]';
-- Should show: is_read = true
```

---

### Test 7.4: Mark All Read

**Objective**: Clear all notifications

**Prerequisites**: Multiple unread notifications

**Steps**:
1. Open notification list
2. Click "MARK ALL READ" button
3. Observe result

**Expected Results**:
- ✓ All notifications marked as read
- ✓ Badge count becomes 0
- ✓ Bold text changes to normal weight

---

## TEST SUITE 8: MOBILE RESPONSIVENESS

### Test 8.1: Mobile Dashboard

**Objective**: Verify dashboard on mobile

**Setup**:
- Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M)
- Select "iPhone SE" (375px width)
- OR use real mobile device

**Steps**:
1. Navigate to `/dashboard`
2. Scroll through page

**Expected Results**:
- ✓ Stats cards stack vertically
- ✓ No horizontal scrolling
- ✓ Text readable (not too small)
- ✓ Buttons tappable (≥44px height)
- ✓ Navigation menu accessible

**Verification**:
- Tap all buttons (should respond)
- Zoom in/out (should work)
- Rotate device (should adapt)

---

### Test 8.2: Mobile Prep Calendar

**Objective**: Verify prep calendar on mobile

**Steps**:
1. On mobile device, navigate to `/battle/[id]/prep`
2. View calendar

**Expected Results**:
- ✓ Calendar scrolls horizontally (OK for this page)
- ✓ Dropdowns work with touch
- ✓ Selections save
- ✓ Summary card visible

**Common Issues**:
- Dropdowns may be cut off → Scroll to view
- This is acceptable UX for calendar

---

### Test 8.3: Mobile Battle Results

**Objective**: Verify results page on mobile

**Steps**:
1. On mobile device, navigate to `/battle/[id]`
2. View results

**Expected Results**:
- ✓ Segment timeline readable
- ✓ Round scores visible
- ✓ Winner announcement clear
- ✓ Can scroll through all content

---

## TEST SUITE 9: TOURNAMENTS

### Test 9.1: View Available Tournaments

**Objective**: See tournaments on tournaments page

**Prerequisites**: Tournaments exist (auto-generated or seeded)

**Steps**:
1. Navigate to `/tournaments`
2. View list

**Expected Results**:
- ✓ Active tournaments shown
- ✓ Each tournament shows:
  - Name
  - Start date
  - Prize pool
  - Participants count
  - "REGISTER" button (if not full)

---

### Test 9.2: Register for Tournament

**Objective**: Join a tournament

**Prerequisites**: Complete Test 9.1

**Steps**:
1. On `/tournaments`, click "REGISTER"
2. Confirm registration
3. Observe result

**Expected Results**:
- ✓ "Registration successful" message
- ✓ Button changes to "REGISTERED"
- ✓ Participant count increases

**Verification**:
```sql
SELECT * FROM tournament_participants WHERE tournament_id = '[id]' AND battler_id = '[your battler id]';
-- Should show 1 row
```

---

### Test 9.3: View Tournament Bracket

**Objective**: See tournament structure

**Prerequisites**: Complete Test 9.2

**Steps**:
1. Navigate to `/tournaments/[id]`
2. View bracket

**Expected Results**:
- ✓ Bracket tree displayed
- ✓ Matches organized by round
- ✓ Your battler visible in bracket
- ✓ Opponents shown (or TBD)

---

### Test 9.4: Tournament Match Completion

**Objective**: Watch tournament progress

**Prerequisites**: Tournament started (requires time manipulation or waiting)

**Steps**:
1. Trigger tournament battles:
   ```bash
   curl -X POST "https://[your-domain]/api/internal/run-due-battles" \
     -H "Authorization: Bearer [INTERNAL_API_SECRET]"
   ```
2. Refresh `/tournaments/[id]`
3. View updated bracket

**Expected Results**:
- ✓ Match results appear
- ✓ Winners advance to next round
- ✓ Losers eliminated
- ✓ Notification sent for your match result

---

## TEST SUITE 10: EDGE CASES

### Test 10.1: No Prep (Auto-Default)

**Objective**: Accept battle but don't fill prep calendar

**Steps**:
1. Accept battle
2. Don't visit `/battle/[id]/prep`
3. Wait for battle date (or force simulate)
4. View results

**Expected Results**:
- ✓ Battle still simulates
- ✓ System auto-generates "rest" prep
- ✓ `no_show_player` flag set to false (prep exists)
- ✓ Performance likely poor (no focused prep)

---

### Test 10.2: Choke Occurrence

**Objective**: Witness a choke in battle

**Setup**:
- Create battler with low resilience (requires editing attributes in database)
- OR run many battles until choke occurs naturally (~7% chance per battle)

**Steps**:
1. Complete battle
2. View results
3. Look for choke indicator

**Expected Results**:
- ✓ Segment timeline shows choke marker
- ✓ Score for that segment drastically low
- ✓ Round likely lost due to choke

**Verification**:
```sql
SELECT choke FROM battle_rounds WHERE battle_id = '[id]';
-- Should show: choke = true for at least one round
```

---

### Test 10.3: Extreme Rating Difference

**Objective**: Battle much higher/lower rated opponent

**Setup**:
- Use database to create battle between:
  - Your battler (rating 1200)
  - AI battler (rating 1800)

**Steps**:
1. Simulate battle
2. View results
3. Check rating change

**Expected Results**:
- ✓ Upset win (unlikely but possible)
- ✓ Rating gain huge (~+40) if you win
- ✓ Rating loss small (~-5) if you lose
- ✓ Vice versa for expected win

---

## TEST COMPLETION CHECKLIST

After completing all tests, verify:

- [ ] All 10 test suites completed
- [ ] No critical failures
- [ ] Edge cases handled gracefully
- [ ] Mobile responsiveness confirmed
- [ ] Performance acceptable (<2s page loads)
- [ ] No console errors
- [ ] Data integrity maintained

---

## COMMON ISSUES & SOLUTIONS

### Issue: Magic link email not arriving

**Solutions**:
1. Check Supabase email settings
2. Check spam folder
3. Use temp email service (mailtrap.io)
4. Enable local email debugging

---

### Issue: Battle simulation fails

**Symptoms**: 500 error, battle stays in 'locked' status

**Solutions**:
1. Check console logs
2. Verify prep blocks exist
3. Check battle status is 'locked' or 'accepted'
4. Ensure `scheduled_at` is in past (for cron)
5. Check Supabase service role key is set

---

### Issue: Rating not updating

**Symptoms**: Battle completes but rating unchanged

**Solutions**:
1. Check `applyRatingChanges` function logs
2. Verify `rankings` table has row for battler
3. Check `winner_id` is set on battle

---

### Issue: Prep calendar doesn't save

**Symptoms**: Selections reset on refresh

**Solutions**:
1. Check network tab for API errors
2. Verify battle status is 'accepted' (not locked)
3. Check `prep_blocks` table for rows
4. Ensure `battle_id` is valid

---

### Issue: Notifications don't appear

**Symptoms**: No bell badge even after events

**Solutions**:
1. Check `notifications` table for rows
2. Verify `is_read = false`
3. Check notification creation in battle simulation
4. Refresh page (notifications fetch on load)

---

## REPORTING TEST FAILURES

If a test fails:

1. **Document**:
   - Test number (e.g., "Test 5.1")
   - Steps completed before failure
   - Expected vs actual result
   - Console errors (screenshot or copy)
   - Network request details (if relevant)

2. **Create Issue**:
   - Use GitHub Issues (when set up)
   - Tag as "bug" and "testing"
   - Include all documentation above

3. **Workaround** (if possible):
   - Note temporary solution
   - Continue testing other suites

---

**Testing Guide Version**: 1.0
**Last Updated**: November 30, 2025
**Next Review**: Post-launch (after first 100 users)
