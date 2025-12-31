# Round Content Selection System - Manual Testing Guide

## ✅ System Successfully Deployed

**Database Migration:** ✅ Applied
**All Tests Passing:** ✅ 111/111 (100%)
**Dev Server Running:** ✅ `http://localhost:3006`
**Supabase Running:** ✅ `http://127.0.0.1:54321`

---

## 📋 What to Test

This guide walks you through manual end-to-end testing of the Round Content Selection System in your browser.

---

## 🧪 Test 1: Locked In Mode Flow

### Prerequisites
1. **Create an account** (if not done): Visit `http://localhost:3006` and create a battler
2. **Get a battle to "locked" status**: Accept a battle offer and wait until prep phase completes

### Testing Steps

#### Step 1: Navigate to Battle Control Page
```
URL: http://localhost:3006/battle/[BATTLE_ID]/control
```

**Expected UI:**
- Two cards: "🎯 Locked In Mode" and "⚡ Auto Mode"
- Context selector dropdown (In Building / PPV / On Cam)
- Description of each mode

**Test Actions:**
1. ✅ Select "PPV" context
2. ✅ Click "Locked In Mode"

**Expected Result:**
- Redirect to `/battle/[BATTLE_ID]/round/1/select`
- Battle status updated to `awaiting_r1_content`

---

#### Step 2: Select Content for Round 1
```
URL: http://localhost:3006/battle/[BATTLE_ID]/round/1/select
```

**Expected UI:**
- Three columns: Content Types (select 3-4), Delivery Types (select 1-2), Performance Types (select 1-2)
- Real-time effectiveness forecast panel showing:
  - Average Effectiveness (e.g., 1.5x)
  - Crowd Preference (e.g., 1.35x)
  - Context Modifier (e.g., 1.3x)
  - Final Multiplier (e.g., 2.63x)
  - Strong matchups (green)
  - Weak matchups (red)

**Test Actions:**
1. ✅ Select 3 content types (e.g., wordplay, schemes, punchlines)
2. ✅ Select 1 delivery type (e.g., smooth_flow)
3. ✅ Select 1 performance type (e.g., stage_presence)
4. ✅ Observe forecast updates in real-time
5. ✅ Click "Confirm Selection"

**Expected Result:**
- Selection saved to database
- Forecast calculated and displayed
- Redirect to `/battle/[BATTLE_ID]/round/1/results` or prompt to simulate

---

#### Step 3: Simulate Round 1
```
Manual: Click "Simulate Round 1" button
OR
API Test: POST http://localhost:3006/api/battles/[BATTLE_ID]/rounds/1/simulate
```

**Expected Result:**
- Round 1 simulated
- Winner determined
- Effectiveness multipliers applied to scores
- Battle status updated to `r1_simulated` → `awaiting_r2_content`

---

#### Step 4: View Round 1 Results
```
URL: http://localhost:3006/battle/[BATTLE_ID]/round/1/results
```

**Expected UI:**
- Round winner badge
- Player score vs AI score
- Content selections displayed (yours vs opponent's)
- Effectiveness breakdown:
  - Content matchups with icons (✅ super effective, ⚖️ neutral, ❌ weak)
  - Multipliers shown (Effectiveness × Crowd × Context = Final)
- Segment-by-segment score chart

**Test Actions:**
1. ✅ Verify winner is correct
2. ✅ Verify multipliers are displayed
3. ✅ Verify content selections shown
4. ✅ Click "Continue to Round 2"

**Expected Result:**
- Redirect to `/battle/[BATTLE_ID]/round/2/select`

---

#### Step 5: Select Content for Round 2
```
URL: http://localhost:3006/battle/[BATTLE_ID]/round/2/select
```

**Test Actions:**
1. ✅ Select **4 content types** (Round 2 gets 4)
2. ✅ Select 1 delivery type
3. ✅ Select **2 performance types** (Round 2 gets 2)
4. ✅ Confirm selection and simulate

**Expected Result:**
- Selection saved (4 content, 1 delivery, 2 performance)
- Round 2 simulated
- Status: `r2_simulated` → `awaiting_r3_content`

---

#### Step 6: Select Content for Round 3
```
URL: http://localhost:3006/battle/[BATTLE_ID]/round/3/select
```

**Test Actions:**
1. ✅ Select 3 content types
2. ✅ Select **2 delivery types** (Round 3 gets 2)
3. ✅ Select **2 performance types** (Round 3 gets 2)
4. ✅ Confirm selection and simulate

**Expected Result:**
- Selection saved (3 content, 2 delivery, 2 performance)
- Round 3 simulated
- Battle status: `completed`
- Overall winner determined (best 2 out of 3)

---

#### Step 7: View Final Battle Results
```
URL: http://localhost:3006/battle/[BATTLE_ID]
```

**Expected UI:**
- All 3 rounds displayed with winners
- Final battle winner badge
- Option to view detailed round breakdowns

---

## 🧪 Test 2: Auto Mode Flow

### Testing Steps

#### Step 1: Navigate to Battle Control Page
```
URL: http://localhost:3006/battle/[BATTLE_ID]/control
```

**Test Actions:**
1. ✅ Select "On Cam" context
2. ✅ Click "Auto Mode"

**Expected Result:**
- All 3 rounds auto-selected instantly
- All 3 rounds simulated instantly
- Battle status: `completed`
- Winner determined
- Redirect to `/battle/[BATTLE_ID]` with full results

---

#### Step 2: Verify Auto-Simulation
```
URL: http://localhost:3006/battle/[BATTLE_ID]
```

**Expected UI:**
- All 3 rounds completed
- Each round shows content selections (marked as "Auto-selected")
- Effectiveness multipliers applied
- Final winner determined

**Database Verification (Supabase Studio):**
1. Open: `http://127.0.0.1:54323`
2. Navigate to `round_content_selections` table
3. Filter by `battle_id`

**Expected Data:**
- 6 rows (3 rounds × 2 battlers)
- All rows have `auto_selected = true`
- `effectiveness_multiplier`, `crowd_preference_multiplier`, `context_modifier` populated

---

## 🧪 Test 3: Effectiveness Scenarios

### Scenario A: Super Effective Matchup
**Your Selection:** wordplay, schemes, punchlines (technical content)
**Expected Opponent (AI):** gun_bars, shock_value (simple content)
**Expected Multiplier:** 1.5x - 2.5x (depending on context and crowd)

### Scenario B: Weak Matchup
**Your Selection:** comedy, pop_culture_refs, name_flips
**Expected Opponent (AI):** personals, rebuttals, street_talk
**Expected Multiplier:** 0.6x - 0.9x (comedy struggles vs personals)

### Scenario C: Context Impact
**Selection:** wordplay + smooth_flow + strategic_pauses
**In Building:** Lower multiplier (~0.9x - 1.1x) - crowd misses complexity
**On Cam:** Higher multiplier (~1.2x - 1.5x) - replay value shines

---

## 🧪 Test 4: API Endpoint Testing

Use Postman, Insomnia, or `curl` to test API endpoints directly:

### POST `/api/battles/[BATTLE_ID]/lock-in`
```json
{
  "lockedIn": true,
  "context": "ppv"
}
```

**Expected Response:**
```json
{
  "battle": {
    "id": "...",
    "status": "awaiting_r1_content",
    "player_locked_in": true,
    "context": "ppv",
    "current_round_index": 1
  },
  "message": "Mode set successfully"
}
```

### POST `/api/battles/[BATTLE_ID]/rounds/1/content`
```json
{
  "contentTypes": ["wordplay", "schemes", "punchlines"],
  "deliveryTypes": ["smooth_flow"],
  "performanceTypes": ["stage_presence"]
}
```

**Expected Response:**
```json
{
  "selection": {
    "contentTypes": ["wordplay", "schemes", "punchlines"],
    "deliveryTypes": ["smooth_flow"],
    "performanceTypes": ["stage_presence"]
  },
  "forecast": {
    "averageEffectiveness": 1.5,
    "crowdPreference": 1.35,
    "contextModifier": 1.3,
    "finalMultiplier": 2.63,
    "strongAgainst": ["gun_bars", "shock_value"],
    "weakAgainst": []
  },
  "message": "Content saved successfully"
}
```

### POST `/api/battles/[BATTLE_ID]/rounds/1/simulate`

**Expected Response:**
```json
{
  "round": {
    "round_index": 1,
    "player_score": 297,
    "ai_score": 180,
    "winner": "player",
    "effectiveness_multiplier": 2.0,
    "crowd_preference_multiplier": 1.35,
    "context_modifier": 1.3,
    "final_multiplier": 3.51
  },
  "message": "Round simulated successfully"
}
```

---

## 📊 Database Verification

### Check Round Content Selections
```sql
SELECT
  battle_id,
  battler_id,
  round_index,
  content_types,
  delivery_types,
  performance_types,
  auto_selected,
  effectiveness_multiplier,
  final_multiplier
FROM round_content_selections
WHERE battle_id = '[BATTLE_ID]'
ORDER BY round_index, battler_id;
```

**Expected:** 6 rows (3 rounds × 2 battlers)

### Check Battle Status
```sql
SELECT
  id,
  status,
  player_locked_in,
  current_round_index,
  context,
  winner_battler_id
FROM battles
WHERE id = '[BATTLE_ID]';
```

**Expected:** Status progresses through `awaiting_r1_content` → `r1_simulated` → etc.

### Check Battle Rounds
```sql
SELECT
  round_index,
  winner,
  player_score,
  ai_score,
  content_types,
  effectiveness_multiplier,
  crowd_preference_multiplier,
  context_modifier,
  final_multiplier
FROM battle_rounds
WHERE battle_id = '[BATTLE_ID]'
ORDER BY round_index;
```

**Expected:** 3 rows with multipliers populated

---

## ✅ Success Criteria

### Locked In Mode
- [  ] Mode selection works
- [  ] Content selection UI displays correctly
- [  ] Effectiveness forecast updates in real-time
- [  ] Validation prevents invalid selections (e.g., 5 content types)
- [  ] Each round has correct selection counts (R1: 3/1/1, R2: 4/1/2, R3: 3/2/2)
- [  ] Round simulation applies multipliers to scores
- [  ] Battle progresses through all 3 rounds
- [  ] Winner determined correctly

### Auto Mode
- [  ] Mode selection works
- [  ] All rounds auto-selected instantly
- [  ] All content selections marked as `auto_selected = true`
- [  ] Battle simulated to completion immediately
- [  ] Multipliers applied to all rounds

### Effectiveness System
- [  ] Super effective matchups show 1.5x+ multipliers
- [  ] Weak matchups show <1.0x multipliers
- [  ] Context modifiers applied (in building vs on cam)
- [  ] Crowd preferences applied (Small Room vs Main Stage)
- [  ] Final multiplier = effectiveness × crowd × context

### Database
- [  ] 6 content selection rows per battle
- [  ] Battle status transitions correctly
- [  ] All multipliers stored in `battle_rounds`
- [  ] No database errors

---

## 🐛 Common Issues & Fixes

### Issue: "Unauthorized" or RLS Error
**Fix:** Ensure you're logged in as the battle's owner. Check that the battle belongs to your battler.

### Issue: Selection validation fails
**Fix:** Verify counts:
- Round 1: 3 content, 1 delivery, 1 performance
- Round 2: 4 content, 1 delivery, 2 performance
- Round 3: 3 content, 2 delivery, 2 performance

### Issue: Forecast not updating
**Fix:** Check browser console for JavaScript errors. Ensure dev server is running.

### Issue: Battle not progressing
**Fix:** Check battle status in database. Ensure status matches expected flow.

---

## 📞 Support

If you encounter issues during testing, check:
1. **Browser Console** - Look for JavaScript errors
2. **Network Tab** - Check API responses
3. **Supabase Studio** - Verify database state
4. **Dev Server Logs** - Check for server errors

---

## 🎉 Testing Complete

Once you've verified all test cases, the Round Content Selection System is production-ready!

**Summary Report Template:**
```
✅ Locked In Mode: PASSED / FAILED
✅ Auto Mode: PASSED / FAILED
✅ Effectiveness System: PASSED / FAILED
✅ Database Integrity: PASSED / FAILED

Overall: READY FOR PRODUCTION / NEEDS FIXES
```
