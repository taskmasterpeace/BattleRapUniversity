# Battle Simulation Testing Checklist

## Prerequisites

- [ ] Development server is running (`npm run dev`)
- [ ] Supabase is running locally
- [ ] Database is seeded with leagues and AI battlers
- [ ] User account created and logged in
- [ ] Player battler created via onboarding

---

## Test 1: Full Prep Battle - Small Room Circuit

### Setup
1. [ ] Navigate to dashboard
2. [ ] Click "🔄 GENERATE OFFERS (DEV)"
3. [ ] Click "VIEW OFFERS"
4. [ ] Accept a **Small Room Circuit** battle (2-minute rounds)
5. [ ] Note the opponent name: _________________
6. [ ] Click "PREP NOW"

### Prep Phase
Complete 7 days of balanced prep:
- [ ] Day 1: Research
- [ ] Day 2: Writing
- [ ] Day 3: Writing
- [ ] Day 4: Performance
- [ ] Day 5: Performance
- [ ] Day 6: Rest
- [ ] Day 7: Rest

### Simulation
7. [ ] Return to dashboard
8. [ ] Click "⚡ SIMULATE NOW (DEV)"
9. [ ] Verify redirect to battle results page
10. [ ] Wait for page to load

### Results Verification

#### Battle Header
- [ ] Player name displayed correctly
- [ ] Opponent name displayed correctly
- [ ] League shown as "Small Room Circuit"
- [ ] Round score shown (e.g., "2 - 1")
- [ ] Victory or Defeat badge displayed
- [ ] No "no-show" warning displayed

#### Round Structure
- [ ] Three round selector buttons visible (ROUND 1, 2, 3)
- [ ] Each button shows WON or LOST correctly
- [ ] Can click each round to view details

#### Round 1 Details
Click "ROUND 1" button:
- [ ] Player stats displayed:
  - [ ] Average Score (number between ~3-11)
  - [ ] Peak Score (number ≥ average score)
  - [ ] Consistency (number 0-10)
  - [ ] Crowd Reaction (percentage 0-100%)
- [ ] AI stats displayed with same metrics
- [ ] Segment Breakdown shows **4 segments** (Small Room = 2 min = 4 segments)
- [ ] Player segments shown as bars
- [ ] AI segments shown as bars
- [ ] Bar heights correspond to scores
- [ ] Each segment shows score value (e.g., "7.3")

#### Event Flags
- [ ] Some segments may be colored amber (Haymaker/Peak moments)
- [ ] Rare segments may be colored red (Choke)
- [ ] Most segments are blue (player) or gray (AI)
- [ ] Legend at bottom shows color meanings

#### Round 2 Details
Click "ROUND 2" button:
- [ ] Different segment scores than Round 1
- [ ] 4 segments displayed
- [ ] Stats updated for Round 2

#### Round 3 Details
Click "ROUND 3" button:
- [ ] Different segment scores than Rounds 1 & 2
- [ ] 4 segments displayed
- [ ] Stats updated for Round 3

#### Data Integrity Checks
Open browser DevTools Console, run:
```javascript
// Check total segments
const segments = document.querySelectorAll('[class*="rounded"]').length;
console.log('Segments per round:', segments / 2); // Should be 4 for Small Room
```

Record observations:
- Total segments visible per round: _______
- Expected: 4 segments
- Match: [ ] Yes [ ] No

#### Score Validation
- [ ] All segment scores are between 3.0 and 11.0
- [ ] Average scores make sense (typically 5-8 range)
- [ ] Peak scores are higher than averages
- [ ] Consistency scores are 0-10
- [ ] Crowd reactions are 0-100%

#### Winner Determination
Compare round scores:
- Round 1 winner: [ ] Player [ ] AI (higher average score)
- Round 2 winner: [ ] Player [ ] AI
- Round 3 winner: [ ] Player [ ] AI

Best of 3: [ ] Player [ ] AI

- [ ] Displayed winner matches best-of-3 calculation

---

## Test 2: Full Prep Battle - Main Stage Arena

### Setup
1. [ ] Return to dashboard
2. [ ] Generate new offers
3. [ ] Accept a **Main Stage Arena** battle (3-minute rounds)
4. [ ] Note the opponent name: _________________
5. [ ] Complete 7 days of prep (same pattern as Test 1)

### Simulation
6. [ ] Simulate battle
7. [ ] Verify redirect to results

### Main Stage Specific Checks
- [ ] League shown as "Main Stage Arena"
- [ ] Each round has **6 segments** (Main Stage = 3 min = 6 segments)
- [ ] Segment timeline wider (6 bars instead of 4)
- [ ] All other functionality same as Test 1

Record:
- Segments per round: _______
- Expected: 6 segments
- Match: [ ] Yes [ ] No

---

## Test 3: No-Show Battle (Skip Prep)

### Setup
1. [ ] Generate and accept any battle
2. [ ] **DO NOT** click "PREP NOW" or complete any prep
3. [ ] Wait or simulate immediately

### Simulation
4. [ ] Click "⚡ SIMULATE NOW (DEV)" from dashboard
5. [ ] Verify redirect to results

### No-Show Verification
- [ ] Warning message displayed: "⚠ You were marked as a no-show for not completing prep"
- [ ] Battle still simulated (not forfeited)
- [ ] Player scores noticeably lower than Test 1/2
- [ ] Likely lost (but check if you won anyway)

Record:
- Player average scores: R1: _____ R2: _____ R3: _____
- Did player win despite no-show? [ ] Yes [ ] No
- Performance felt penalized? [ ] Yes [ ] No

---

## Test 4: Variance Testing (Same Prep, Different Results)

Run 3 battles with identical prep:

### Battle A
- [ ] Accept battle
- [ ] Complete same prep: 1R, 2W, 2P, 2Rest
- [ ] Simulate
- [ ] Record results:
  - Winner: [ ] Player [ ] AI
  - Player R1 avg: _____
  - Player R2 avg: _____
  - Player R3 avg: _____

### Battle B
- [ ] Accept battle
- [ ] Complete same prep: 1R, 2W, 2P, 2Rest
- [ ] Simulate
- [ ] Record results:
  - Winner: [ ] Player [ ] AI
  - Player R1 avg: _____
  - Player R2 avg: _____
  - Player R3 avg: _____

### Battle C
- [ ] Accept battle
- [ ] Complete same prep: 1R, 2W, 2P, 2Rest
- [ ] Simulate
- [ ] Record results:
  - Winner: [ ] Player [ ] AI
  - Player R1 avg: _____
  - Player R2 avg: _____
  - Player R3 avg: _____

### Variance Validation
- [ ] Results are NOT identical across all 3 battles
- [ ] Segment scores vary between battles
- [ ] Winner may differ between battles (if evenly matched)
- [ ] Haymaker/choke occurrences differ

---

## Test 5: Prep Pattern Impact

Test different prep strategies:

### Writing-Heavy Prep
- [ ] Accept battle
- [ ] Prep: 0R, 5W, 0P, 2Rest
- [ ] Simulate
- [ ] Observe: Writing stats (lyricism/wordplay) should be higher

### Performance-Heavy Prep
- [ ] Accept battle
- [ ] Prep: 0R, 0W, 5P, 2Rest
- [ ] Simulate
- [ ] Observe: Performance stats and crowd reaction should be higher

### Research-Heavy Prep
- [ ] Accept battle
- [ ] Prep: 5R, 1W, 0P, 1Rest
- [ ] Simulate
- [ ] Observe: Creativity should be boosted, more haymakers expected

Record observations:
- Writing prep impact: [ ] Noticeable [ ] Unclear [ ] None
- Performance prep impact: [ ] Noticeable [ ] Unclear [ ] None
- Research prep impact: [ ] Noticeable [ ] Unclear [ ] None

---

## Test 6: Special Events

After running 10+ battles, tally occurrences:

### Haymakers (Peak Moments)
Expected: ~15% of all segments

- Total segments across all battles: _______
- Segments with haymaker flag (amber): _______
- Percentage: _______%
- Within expected range (10-20%)? [ ] Yes [ ] No

### Chokes
Expected: 5-15% of battles have at least one choke

- Total battles: _______
- Battles with at least one choke: _______
- Percentage: _______%
- Within expected range (5-15%)? [ ] Yes [ ] No

### Choke Observations
If chokes occurred:
- [ ] Segment score dropped significantly (red bar much shorter)
- [ ] Choke flag displayed in round stats
- [ ] Felt impactful but not overly common

---

## Test 7: Momentum System

Check if momentum affects later rounds:

### Observation Method
Run a battle and track:
- Round 1 result: [ ] Player won by ____ points [ ] AI won by ____ points
- Round 2 performance: Did winner of R1 perform better? [ ] Yes [ ] No [ ] Unclear
- Round 3 performance: Does momentum carry over? [ ] Yes [ ] No [ ] Unclear

Notes: _________________________________________________________________

---

## Test 8: Error Handling

### Invalid Battles
Try edge cases:
- [ ] Try to view a non-existent battle ID
  - URL: `/battle/00000000-0000-0000-0000-000000000000`
  - Expected: "Battle not found" message
- [ ] Try to view a battle that hasn't been simulated yet
  - Expected: "Battle has not been simulated yet" warning

---

## Performance Testing

### Simulation Speed
- [ ] Measure time from clicking "SIMULATE NOW" to results loading
- Time: _______ seconds
- Expected: < 5 seconds
- Acceptable: [ ] Yes [ ] No

### Page Load Speed
- [ ] Battle results page loads quickly
- [ ] Segment visualizations render without lag
- [ ] Round switching is responsive

---

## Visual/UX Testing

### Layout
- [ ] Battle header looks clean
- [ ] Round selector buttons are clear
- [ ] Stats are readable
- [ ] Segment timeline fits on screen (no horizontal scroll)
- [ ] Colors are distinguishable (amber/red/blue/gray)

### Mobile Responsiveness (Optional)
- [ ] Resize browser to mobile width
- [ ] Layout adjusts appropriately
- [ ] Segment bars still visible

---

## Critical Bugs to Watch For

### Data Issues
- [ ] Missing rounds (should always be 6 total: 3 rounds × 2 battlers)
- [ ] Missing segments (should be 24 for Small Room, 36 for Main Stage)
- [ ] Scores outside valid range (< 3.0 or > 11.0)
- [ ] Crowd reactions outside 0-100%
- [ ] Winner doesn't match best-of-3 calculation

### Simulation Errors
- [ ] Simulation fails with error message
- [ ] Redirect fails after simulation
- [ ] Database errors in console
- [ ] Battle status stuck in "accepted" instead of "completed"

### Display Issues
- [ ] Segment bars don't match scores
- [ ] Event colors wrong (haymaker not amber, choke not red)
- [ ] Round stats don't update when switching rounds
- [ ] Wrong battler name displayed

---

## Bug Report Template

If issues found, document:

**Issue #:** ______

**Severity:** [ ] Critical [ ] Major [ ] Minor

**Description:**
_________________________________________________________________

**Steps to Reproduce:**
1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________

**Expected Behavior:**
_________________________________________________________________

**Actual Behavior:**
_________________________________________________________________

**Screenshots/Logs:**
_________________________________________________________________

---

## Success Criteria

### Minimum Passing Requirements
- [x] Fixed round winner display bug ✅ (already fixed)
- [ ] Simulation completes without errors for all scenarios
- [ ] 3 rounds always created
- [ ] Correct segment count (4 or 6 based on league)
- [ ] Scores in valid range (3-11)
- [ ] Winner determination correct
- [ ] Segment visualization displays correctly
- [ ] Event flags work (haymaker/choke)
- [ ] Crowd reactions in range (0-100)

### Balance Validation
- [ ] Results show variance across multiple battles
- [ ] Prep impact is noticeable
- [ ] Haymakers occur ~15% of segments
- [ ] Chokes are rare but possible (5-15% of battles)
- [ ] Performance feels balanced (not too random, not too deterministic)

### User Experience
- [ ] Simulation is fast (< 5 seconds)
- [ ] Results page is clear and readable
- [ ] Round switching works smoothly
- [ ] No confusing error messages

---

## Notes Section

Additional observations or issues:

_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## Sign-Off

Tester: _________________
Date: _________________
Overall Result: [ ] PASS [ ] FAIL [ ] PASS WITH ISSUES

If FAIL or PASS WITH ISSUES, list blocking issues:
_________________________________________________________________
_________________________________________________________________
