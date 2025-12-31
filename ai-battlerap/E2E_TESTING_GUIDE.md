# End-to-End Testing Guide

## 📋 Summary of Testing Tools

### ✅ What's Already Working

**Life Events System:**
- ✅ **12 event definitions** active in database
- ✅ **Trigger rates configured:**
  - Health Crisis: 30% (every ~3 battles)
  - Chronic Choking: 25% (every ~4 battles)
  - Substance Abuse: 20% (every ~5 battles)
  - Major Beef: 18% (every ~5-6 battles)
  - Other events: 8-15%
- ✅ **Events auto-trigger** during gameplay
- ✅ **Choice system** with consequences
- ✅ **Karmic debt tracking**

### 🎯 E2E Testing Options

We have **3 ways** to test the full game flow:

1. **Browser Testing with Playwright** (Recommended)
2. **Programmatic API Testing** (No browser needed)
3. **Manual Browser Testing** (Most visual feedback)

---

## Option 1: Playwright Browser Testing (Recommended)

### Installation

```bash
cd ai-battlerap

# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install
```

### Run E2E Tests

```bash
# Run all E2E tests in headed mode (see the browser)
npx playwright test --headed

# Run specific test
npx playwright test e2e/fullGameFlow.spec.ts --headed

# Run in debug mode with inspector
npx playwright test --debug

# Generate HTML report
npx playwright show-report
```

### What It Tests

The Playwright test (`e2e/fullGameFlow.spec.ts`) covers:

**Full Game Flow:**
1. ✅ Create account & battler
2. ✅ Accept battle offer
3. ✅ Complete prep phase (select daily focus)
4. ✅ Choose Locked In mode
5. ✅ Select content for Round 1 (3 content, 1 delivery, 1 performance)
6. ✅ Simulate Round 1 & view results
7. ✅ Select content for Round 2 (4 content, 1 delivery, 2 performance)
8. ✅ Simulate Round 2 & view results
9. ✅ Select content for Round 3 (3 content, 2 delivery, 2 performance)
10. ✅ Simulate Round 3 & view results
11. ✅ View final battle results
12. ✅ Check for life events (20-30% chance)

**Auto Mode Test:**
1. ✅ Accept battle
2. ✅ Complete prep
3. ✅ Select Auto mode
4. ✅ Verify instant simulation
5. ✅ Verify all content auto-selected

---

## Option 2: Programmatic API Testing (No Browser)

### Installation

No additional dependencies needed! Uses existing setup.

### Run Programmatic E2E Test

```bash
cd ai-battlerap

# Run full game flow simulation
npx tsx lib/game/fullGameFlowTest.ts

# Run multiple battles to test event frequency
npx tsx lib/game/fullGameFlowTest.ts --battles=5
```

### What It Tests

The programmatic test simulates:
1. ✅ Create test battler
2. ✅ Generate battle offer
3. ✅ Complete prep phase
4. ✅ Test Locked In mode (all 3 rounds)
5. ✅ Test Auto mode
6. ✅ Trigger and resolve life events
7. ✅ Track event frequency over multiple battles
8. ✅ Verify all database state changes

---

## Option 3: Manual Browser Testing

Follow the [MANUAL_TESTING_GUIDE.md](MANUAL_TESTING_GUIDE.md) for step-by-step manual testing.

---

## 🎲 Life Event Testing

### Expected Frequency

Over 10 battles, you should see approximately:
- **3 health crises** (30% chance each battle)
- **2-3 choking events** (25% chance)
- **2 substance abuse events** (20% chance)
- **1-2 major beefs** (18% chance)
- **1-2 other events** (various rates)

### Testing Event Flow

1. **Accept battle** → Complete prep → Simulate battle
2. **After battle:** Check for event notification
3. **If event triggers:**
   - Read event description
   - View choices (typically 2-3 options)
   - Select a choice
   - See immediate effects (reputation, stress, etc.)
4. **Future consequences:**
   - Some choices create karmic debt (future events)
   - Some affect future battle offers
   - Some add/remove badges

### Forcing Events for Testing

To test specific events without waiting for random triggers:

```sql
-- Insert a test event directly
INSERT INTO active_events (
  battler_id,
  event_definition_id,
  triggered_week,
  status
)
SELECT
  (SELECT id FROM battlers LIMIT 1),
  (SELECT id FROM event_definitions WHERE code = 'chronic_choking_crisis'),
  1,
  'pending';
```

Then refresh your dashboard to see the event.

---

## 🧪 Comprehensive Testing Checklist

### Battle Flow
- [ ] Create battler with various attribute distributions
- [ ] Accept battle offers
- [ ] Test different prep strategies (writing-heavy, performance-heavy, balanced)
- [ ] Test Locked In mode
- [ ] Test Auto mode
- [ ] Verify effectiveness multipliers applied correctly
- [ ] Check round winners determined correctly
- [ ] Verify final battle winner (best 2 out of 3)

### Content System
- [ ] Test super effective matchups (wordplay vs gun_bars = 2.0x)
- [ ] Test weak matchups (comedy vs personals = 0.5x)
- [ ] Test neutral matchups
- [ ] Verify crowd preferences (Small Room favors wordplay, Main Stage favors performance)
- [ ] Verify context modifiers (On Cam favors technical, In Building favors energy)
- [ ] Test different round selection counts (R1: 3/1/1, R2: 4/1/2, R3: 3/2/2)

### Life Events
- [ ] Play 10 battles and track event frequency
- [ ] Test each event choice and consequences
- [ ] Verify karmic debt triggers follow-up events
- [ ] Check that cooldowns prevent spam (can't get same event twice in X battles)
- [ ] Verify attribute changes apply correctly
- [ ] Check badge additions/removals

### Edge Cases
- [ ] What happens if you choke (low resilience + poor prep)?
- [ ] What happens with maximum stress?
- [ ] What happens with zero financial stability?
- [ ] Can you trigger multiple events in one battle?
- [ ] Do events stack consequences correctly?

---

## 📊 Monitoring Event Frequency

### Query Event History

```sql
-- See all triggered events for a battler
SELECT
  ed.name,
  ed.category,
  eh.triggered_week,
  eh.choice_made,
  eh.resolved_week
FROM event_history eh
JOIN event_definitions ed ON ed.code = eh.event_definition_code
WHERE eh.battler_id = '[YOUR_BATTLER_ID]'
ORDER BY eh.triggered_week DESC;
```

### Expected Results Over 10 Battles

```
Category          | Expected Count | Probability
------------------|----------------|-------------
mental_health     | 3              | 30%
career_failure    | 2-3            | 25%
substance         | 2              | 20%
betrayal          | 1-2            | 18%
financial         | 1-2            | 15%
criminal          | 1              | 8-12%
family            | 1              | 10%
```

---

## 🚀 Quick Start Commands

```bash
# 1. Install Playwright (one-time setup)
npm install --save-dev @playwright/test
npx playwright install

# 2. Run Playwright E2E test (see browser)
npx playwright test --headed

# 3. OR run programmatic test (no browser)
npx tsx lib/game/fullGameFlowTest.ts

# 4. View Playwright report
npx playwright show-report

# 5. Debug specific test
npx playwright test e2e/fullGameFlow.spec.ts --debug
```

---

## 🎯 Expected Test Output

### Successful Full Game Flow

```
🎯 STEP 1: Creating account and battler...
✅ Battler created/logged in

🎯 STEP 2: Accepting battle offer...
✅ Battle accepted: [BATTLE_ID]

🎯 STEP 3: Completing prep phase...
✅ Prep phase completed

🎯 STEP 4: Entering Locked In mode...
✅ Locked In mode activated

🎯 STEP 5: Selecting content for Round 1...
   Forecast Multiplier: 2.35x
✅ Round 1 content selected

🎯 STEP 6: Simulating Round 1...
   Round 1 Winner: player
✅ Round 1 completed

🎯 STEP 7: Selecting content for Round 2...
✅ Round 2 completed

🎯 STEP 8: Selecting content for Round 3...
✅ Round 3 completed

🎯 STEP 9: Viewing final battle results...
   🏆 Battle Winner: player
✅ Battle completed successfully

🎯 STEP 10: Checking for life events...
   🎲 Life Event Triggered: Chronic Choking Crisis
   ✅ Event choice made

╔═══════════════════════════════════════════════════════════════╗
║                 E2E TEST COMPLETE ✅                          ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 🐛 Troubleshooting

### Playwright Issues

**Error: "Browser not found"**
```bash
npx playwright install
```

**Error: "Timeout waiting for selector"**
- Check dev server is running (`http://localhost:3006`)
- Verify UI components have correct `data-testid` attributes
- Increase timeout in test file

**Error: "Connection refused"**
- Ensure dev server is running: `npm run dev`
- Check port 3006 is not blocked by firewall

### Event Testing Issues

**Events not triggering:**
- Check event definitions exist: `SELECT * FROM event_definitions;`
- Verify cooldowns haven't blocked events
- Lower trigger probabilities for testing: `UPDATE event_definitions SET base_trigger_probability = 1.0;`

**Events triggering too often:**
- Restore normal probabilities: Use migration file values (8-30%)
- Check cooldown_battles is set correctly

---

## 📝 Adding New E2E Tests

### Template for New Playwright Test

```typescript
import { test, expect } from '@playwright/test';

test('Your test name', async ({ page }) => {
  await page.goto('/your-page');

  // Your test steps
  await page.click('button:has-text("Click Me")');
  await expect(page.locator('text=Success')).toBeVisible();
});
```

### Running Specific Tests

```bash
# Run one file
npx playwright test e2e/yourtest.spec.ts

# Run tests matching pattern
npx playwright test -g "pattern"

# Run in specific browser
npx playwright test --project=chromium
```

---

## ✅ Success Criteria

**Full Game Flow Test Passes When:**
- [x] Battler creation completes
- [x] Battle acceptance works
- [x] Prep phase saves correctly
- [x] Locked In mode activates
- [x] All 3 rounds complete with content selection
- [x] Effectiveness multipliers applied
- [x] Winners determined correctly
- [x] Life events trigger at expected frequency
- [x] Event choices apply consequences
- [x] Database state remains consistent

---

**Next Steps:**
1. Install Playwright: `npm install --save-dev @playwright/test && npx playwright install`
2. Run first E2E test: `npx playwright test --headed`
3. Play 10 battles manually to observe event frequency
4. Review results and adjust event probabilities if needed
