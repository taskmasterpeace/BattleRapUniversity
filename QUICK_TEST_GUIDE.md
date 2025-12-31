# Battle Simulation - Quick Test Guide

## TL;DR

**Status**: ✅ Code is solid, ready for manual testing

**Prerequisite**: Create a player battler via onboarding first

**Quick Test**: Accept battle → Prep 7 days → Click "⚡ SIMULATE NOW" → View results

---

## What Was Fixed

✅ **Round Winner Display Bug** - Fixed in `app/battle/[id]/page.tsx`
- Lines 101-121 now correctly calculate rounds won by comparing average scores
- Previously: Counted all player rounds (always 3) instead of checking who won each round

---

## How to Test (5 Minutes)

### 1. Setup (First Time Only)
```bash
# If not already running:
cd ai-battlerap
npm run dev
# Server will be at http://localhost:3006 or :3000
```

### 2. Create Player Battler
- Go to http://localhost:3006
- Complete onboarding (create account + battler)

### 3. Run Your First Battle

**Get a Battle:**
1. Click "🔄 GENERATE OFFERS (DEV)" on dashboard
2. Click "VIEW OFFERS"
3. Accept any battle

**Prep:**
4. Click "PREP NOW"
5. Fill in 7 days of prep (any focus works)
6. Return to dashboard

**Simulate:**
7. Click "⚡ SIMULATE NOW (DEV)"
8. Wait 2-3 seconds
9. Redirected to battle results

### 4. Verify Results

**Check these things:**

✅ **3 Rounds Created**
- Round selector shows ROUND 1, 2, 3

✅ **Correct Segment Count**
- Small Room Circuit: 4 segments per round
- Main Stage Arena: 6 segments per round

✅ **Valid Scores**
- Segment scores: 3.0 - 11.0
- Average scores: typically 5-8
- Crowd reactions: 0-100%

✅ **Winner Correct**
- Best 2 of 3 rounds
- Check each round's average score
- Higher score wins that round

✅ **Visual Elements**
- Segment bars show with heights
- Colors: Amber (haymaker), Red (choke), Blue/Gray (normal)
- Stats display for both battlers

---

## Expected Simulation Behavior

### Segment Count by League
| League | Round Length | Segments Per Round | Total Segments |
|--------|--------------|-------------------|----------------|
| Small Room Circuit | 2 minutes | 4 | 24 |
| Main Stage Arena | 3 minutes | 6 | 36 |

### Score Ranges
- **Segment scores**: 3.0 to 11.0 (configurable floor/ceiling)
- **Average scores**: Typically 5-8 range
- **Peak scores**: Usually 7-11 (the "haymaker" moment)
- **Consistency**: 0-10 scale (inverse of standard deviation)
- **Crowd reaction**: 0-100 percentage

### Event Probabilities
- **Haymakers** (peak moments): ~15% of segments (amber bars)
- **Chokes**: ~5-15% of battles, rare per segment (red bars)
- **Normal performance**: Most segments (blue/gray bars)

### Prep Impact
Different prep types boost different attributes:
- **Writing**: Lyricism, Wordplay, Creativity
- **Performance**: Stage Presence, Crowd Control, Delivery
- **Research**: Creativity + better angles (more haymakers)
- **Rest**: Resilience (reduces choke chance)
- **Life**: Family Bond, Financial Stability

### No-Show Penalty
If you skip prep:
- Warning displayed: "⚠ You were marked as a no-show..."
- 60% performance penalty applied
- Higher choke probability
- Still simulated (not forfeit)

---

## Common Issues & Solutions

### "Battle not found"
- Battle might not exist or wrong ID
- Check you're using the correct battle ID from dashboard

### "Battle has not been simulated yet"
- Battle status is still "accepted" or "locked"
- Click "⚡ SIMULATE NOW (DEV)" to trigger simulation

### No segments showing
- Check browser console for errors
- Verify simulation completed (status should be "completed")
- Check database has `battle_segments` records

### Wrong winner displayed
- ✅ Fixed in this update
- Winner is now correctly calculated from round average scores

### Simulation takes too long
- Expected: < 5 seconds
- If longer: Check server logs for errors
- Database may be slow or API timing out

---

## Quick Validation Script

If you want to run automated checks (requires player battler):

```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
export SUPABASE_SERVICE_ROLE_KEY="your-service-key"

# Run test
node test-simulation.js
```

This will:
- Create a test battle
- Add balanced prep
- Trigger simulation
- Validate all data
- Report results

---

## Testing Priority

### Must Test (Critical)
1. ✅ **Small Room battle** with full prep
2. ✅ **Main Stage battle** with full prep
3. ✅ **No-show battle** (skip prep)

### Should Test (Important)
4. **Variance** - Run 2-3 battles with same prep, verify different results
5. **Different prep patterns** - Writing-heavy vs Performance-heavy

### Nice to Test (Optional)
6. **Special events** - After 10+ battles, check haymaker/choke rates
7. **Edge cases** - Invalid battle IDs, battles not yet simulated

---

## Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Simulation time | < 5 sec | _____ sec |
| Page load | < 2 sec | _____ sec |
| Round switching | Instant | _____ |

---

## Key Files Reference

### Simulation Engine
- **Main logic**: `lib/game/simulation.ts`
- **Configuration**: `lib/game/config.ts`
- **Badge effects**: `lib/game/badges.ts`

### API Endpoints
- **Simulate**: `/api/internal/run-due-battles` (POST)
- **Get battle data**: `/api/battles/[id]` (GET)

### UI Components
- **Results page**: `app/battle/[id]/page.tsx` ✅ (fixed)
- **Dashboard**: `components/battler/DashboardClient.tsx`

---

## Configuration Values (Current)

From `lib/game/config.ts`:

```javascript
PREP_EFFECT_MULTIPLIER: 0.25      // 25% boost per prep day
CHOKE_BASE_PROBABILITY: 0.03      // 3% base choke chance
SEGMENT_VARIANCE: 0.80            // ±80% variance
PEAK_PROBABILITY: 0.15            // 15% haymaker chance
SCORE_FLOOR: 3.0                  // Min segment score
SCORE_CEILING: 11.0               // Max segment score
MOMENTUM_MULTIPLIER: 0.02         // 2% per momentum point
```

---

## What to Report

### If Everything Works ✅
- "Simulation tested successfully"
- Note any interesting results (upsets, chokes, etc.)

### If Issues Found ❌
Report:
1. **What you did** (steps to reproduce)
2. **What happened** (actual behavior)
3. **What you expected** (expected behavior)
4. **Screenshots/logs** if applicable

---

## Next Steps After Testing

### If Tests Pass
1. Test balance over 10+ battles
2. Analyze outcome distribution:
   - Body rate (3-0): Should be 20-30%
   - Debatable (2-1): Should be 40-50%
   - Upset rate: Should be 10-20%
3. Adjust config if needed

### If Tests Fail
1. Document specific failures
2. Check server logs for errors
3. Verify database state
4. File bug report with details

---

## Support

**Documentation**:
- Full report: `SIMULATION_TEST_REPORT.md`
- Detailed checklist: `SIMULATION_TESTING_CHECKLIST.md`

**Test Scripts**:
- Database check: `node check-db.js`
- Full simulation test: `node test-simulation.js` (requires player battler)

**Dev Server**: http://localhost:3006 (or :3000)

---

## Summary

The battle simulation system is **ready for testing**. All core functionality has been implemented and code-reviewed. One bug was found and fixed (round winner display).

**To test**: Create a battler → Accept battle → Prep → Simulate → Verify results ✅
