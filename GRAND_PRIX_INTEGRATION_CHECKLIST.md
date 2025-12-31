# Grand Prix Integration Checklist

Use this checklist to integrate the Grand Prix auto-tournament system into your game.

## ✅ Pre-Integration Verification

### Database Prerequisites
- [ ] `origin_milestones` table exists with `battler_id` and `milestone_key` columns
- [ ] `battlers` table has `origin_completed` boolean column
- [ ] `check_origin_completion(battler_id)` function exists and works
- [ ] `tournaments` table exists with full tournament system schema
- [ ] `tournament_participants` table exists
- [ ] `tournament_brackets` table exists
- [ ] At least 7 low-tier AI battlers exist in database (verify with query below)

**Verification Query**:
```sql
SELECT COUNT(*) as low_tier_ai_count
FROM battlers b
JOIN rankings r ON r.battler_id = b.id
WHERE b.is_ai = true
  AND b.tier = 'low'
  AND r.rating < 1400;
-- Expected: >= 7
```

### Tournament System Prerequisites
- [ ] `lib/game/tournamentManager.ts` exists and exports required functions
- [ ] `generateTournamentBrackets()` function works for 8-person tournaments
- [ ] `scheduleRoundBattles()` function works
- [ ] Tournament notification system functional (`create_notification` RPC)
- [ ] Tournament UI pages exist (`/tournaments/[id]`)

---

## 📦 Installation Steps

### Step 1: Copy Files
- [ ] Copy `lib/game/grand-prix.ts` to your project
- [ ] Copy `app/api/internal/grand-prix/create/route.ts` to your project
- [ ] Copy `scripts/test-grand-prix.ts` to your project (optional, for testing)

### Step 2: Verify Dependencies
Check that these imports work in `grand-prix.ts`:
- [ ] `import { SupabaseClient } from '@supabase/supabase-js'`
- [ ] `import { Tournament, generateTournamentBrackets, scheduleRoundBattles } from './tournamentManager'`

If imports fail, adjust paths accordingly.

---

## 🔧 Integration Steps

### Step 3: Find Milestone Award Logic

Locate where milestones are awarded in your codebase. Common locations:
- [ ] After battle completion (e.g., `app/api/battles/[id]/route.ts`)
- [ ] In life event handlers
- [ ] In progression/XP system
- [ ] Manual admin endpoints

**Search hints**:
```bash
# Find milestone insertion code
grep -r "INSERT INTO origin_milestones" .
grep -r "origin_milestones" . --include="*.ts"
```

### Step 4: Add Grand Prix Auto-Trigger

In **each location** where milestones are awarded, add:

```typescript
import { autoTriggerGrandPrix } from '@/lib/game/grand-prix';

// After inserting milestone
const gpResult = await autoTriggerGrandPrix(battlerId, supabase);

if (gpResult?.success) {
  console.log(`🎊 Grand Prix auto-generated: ${gpResult.tournament.name}`);
  // Optional: Add special UI/notification for this achievement
}
```

**Checklist**:
- [ ] Added to post-battle milestone awards
- [ ] Added to life event milestone awards
- [ ] Added to any other milestone award points
- [ ] Tested that it doesn't create duplicate tournaments

### Step 5: Add UI Elements (Optional)

Consider adding:
- [ ] Dashboard widget showing Grand Prix status/countdown
- [ ] Special "Origin Complete" celebration modal
- [ ] Grand Prix tournament badge on profile
- [ ] Grand Prix completion achievement tracking

---

## 🧪 Testing

### Step 6: Run Automated Tests

```bash
cd ai-battlerap
npx tsx scripts/test-grand-prix.ts
```

Expected output:
```
✅ TEST 1: Eligibility Check - PASSED
✅ TEST 2: Opponent Selection - PASSED (7 opponents)
✅ TEST 3: Participation History - PASSED
✅ TEST 4: Grand Prix Creation - PASSED
✅ TEST 5: Auto-Trigger System - PASSED
✅ TEST 6: Bracket Generation - PASSED (4 matches)
```

- [ ] All 6 tests pass
- [ ] Tournament created successfully
- [ ] Brackets generated correctly
- [ ] Participants registered (8 total)

### Step 7: Manual Integration Test

**Test Scenario**: New player completes origin story

1. [ ] Create test player or use existing player
2. [ ] Award 4 milestones (verify no Grand Prix created)
3. [ ] Award 5th milestone (verify Grand Prix auto-creates)
4. [ ] Check notification sent to player
5. [ ] View tournament page (`/tournaments/[id]`)
6. [ ] Verify brackets visible
7. [ ] Verify first round battles scheduled (21 days out)

**SQL Test**:
```sql
-- Create test player
INSERT INTO battlers (stage_name, primary_league_id, is_ai, tier, origin_type)
VALUES ('GP Test Player', (SELECT id FROM leagues LIMIT 1), false, 'low', 'text_forums')
RETURNING id;

-- Award 5 milestones (replace PLAYER_ID)
INSERT INTO origin_milestones (battler_id, milestone_key)
VALUES
  ('PLAYER_ID', 'test_milestone_1'),
  ('PLAYER_ID', 'test_milestone_2'),
  ('PLAYER_ID', 'test_milestone_3'),
  ('PLAYER_ID', 'test_milestone_4'),
  ('PLAYER_ID', 'test_milestone_5');

-- Trigger completion
SELECT check_origin_completion('PLAYER_ID');

-- Manually trigger Grand Prix (or test auto-trigger in your code)
-- POST to /api/internal/grand-prix/create with {"battler_id": "PLAYER_ID"}
```

### Step 8: Verify Database State

After test, verify:
- [ ] Tournament record exists with `metadata->>'grand_prix' = 'true'`
- [ ] 8 participants registered (1 player + 7 AI)
- [ ] 4 first-round brackets created
- [ ] Brackets have correct seeding (1v8, 4v5, 3v6, 2v7)
- [ ] Battles scheduled 21 days in future
- [ ] Notification created for player

**Verification Queries**:
```sql
-- Check tournament
SELECT * FROM tournaments
WHERE metadata->>'grand_prix' = 'true'
ORDER BY created_at DESC
LIMIT 1;

-- Check participants
SELECT COUNT(*) FROM tournament_participants
WHERE tournament_id = 'TOURNAMENT_ID';
-- Expected: 8

-- Check brackets
SELECT COUNT(*) FROM tournament_brackets
WHERE tournament_id = 'TOURNAMENT_ID'
  AND round = 'first_round';
-- Expected: 4
```

---

## 🐛 Troubleshooting

### Issue: Auto-Trigger Not Firing

**Symptoms**: Player completes 5 milestones but no tournament created

**Checklist**:
- [ ] Verify `autoTriggerGrandPrix()` is called in milestone award code
- [ ] Check `origin_completed` flag: `SELECT origin_completed FROM battlers WHERE id = 'X'`
- [ ] Check milestone count: `SELECT COUNT(*) FROM origin_milestones WHERE battler_id = 'X'`
- [ ] Check already participated: Query tournaments with `metadata->>'grand_prix' = 'true'`
- [ ] Check console logs for errors

**Fix**: Ensure `check_origin_completion()` runs after 5th milestone and sets `origin_completed = true`

### Issue: Not Enough Opponents Error

**Symptoms**: `createGrandPrix()` returns "Not enough AI battlers available"

**Checklist**:
- [ ] Run query: `SELECT COUNT(*) FROM battlers WHERE is_ai = true AND tier = 'low'`
- [ ] Need at least 7 low-tier AI battlers
- [ ] If insufficient, run battler seed migration or create more AI battlers

**Fix**: Add more low-tier AI battlers to database

### Issue: Brackets Not Generating

**Symptoms**: Tournament created but no brackets

**Checklist**:
- [ ] Check participant count: `SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = 'X'`
- [ ] Must be exactly 8 (power of 2)
- [ ] Check `generateTournamentBrackets()` error logs
- [ ] Verify tournament status is 'registration' before bracket generation

**Fix**: Ensure exactly 8 participants registered before calling `generateTournamentBrackets()`

### Issue: Battles Not Scheduled

**Symptoms**: Brackets exist but no battles created

**Checklist**:
- [ ] Check if `scheduleRoundBattles()` was called
- [ ] Verify battles table for tournament battles: `SELECT * FROM battles WHERE tournament_id = 'X'`
- [ ] Check tournament_brackets for `battle_id` references
- [ ] Review `scheduleRoundBattles()` logs for errors

**Fix**: Manually call `scheduleRoundBattles(tournamentId, 'first_round', 21)`

---

## 📊 Monitoring & Analytics

### Step 9: Add Tracking (Optional)

Consider tracking:
- [ ] Number of Grand Prix tournaments created
- [ ] Player completion rate (origin → Grand Prix)
- [ ] Grand Prix win rate (player vs AI)
- [ ] Average time from origin start to Grand Prix
- [ ] Most common origin path (text_forums/app_camera/crew)

**Example Analytics Query**:
```sql
-- Grand Prix participation stats
SELECT
  COUNT(DISTINCT t.id) as total_grand_prix,
  COUNT(DISTINCT CASE WHEN t.winner_battler_id = t.metadata->>'player_id' THEN t.id END) as player_wins,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed,
  COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as active
FROM tournaments t
WHERE t.metadata->>'grand_prix' = 'true';
```

---

## ✅ Final Verification

### Step 10: Production Readiness Check

Before deploying to production:
- [ ] All automated tests pass
- [ ] Manual integration test passes
- [ ] Database queries verified
- [ ] Notification system working
- [ ] Tournament UI displays correctly
- [ ] No console errors during creation
- [ ] Error handling tested (not enough opponents, already participated, etc.)
- [ ] Documentation reviewed
- [ ] Team briefed on new feature

### Step 11: User Documentation

Update player-facing docs:
- [ ] Add "Origin Story Completion" section to game guide
- [ ] Explain Grand Prix tournament
- [ ] List prize pool and rules
- [ ] Add FAQ entry for "What happens when I complete my origin?"

---

## 🚀 Launch

### Step 12: Deploy

1. [ ] Merge Grand Prix code to main branch
2. [ ] Deploy to staging environment
3. [ ] Run smoke tests in staging
4. [ ] Deploy to production
5. [ ] Monitor first few Grand Prix creations
6. [ ] Gather player feedback

### Step 13: Monitor

First week after launch:
- [ ] Check error logs daily
- [ ] Monitor Grand Prix creation rate
- [ ] Track completion rate (started origin → Grand Prix → won)
- [ ] Collect player feedback on difficulty
- [ ] Adjust opponent selection if needed (too easy/hard)

---

## 📝 Maintenance

### Ongoing Tasks
- [ ] Monitor Grand Prix creation failures
- [ ] Ensure low-tier AI battler pool stays healthy (>= 7 available)
- [ ] Update prize pool if needed (inflation, game balance)
- [ ] Consider adding Grand Prix achievements/badges
- [ ] Review participation data quarterly

### Future Enhancements
- [ ] Origin-specific badges for Grand Prix winners
- [ ] Media coverage system integration
- [ ] Dynamic difficulty based on player rating
- [ ] Multiple Grand Prix tiers (mid/high tier variants)
- [ ] Grand Prix leaderboard (fastest completion, highest prize winnings)

---

## 📚 Reference Links

- **Full Documentation**: `GRAND_PRIX_README.md`
- **Implementation Summary**: `GRAND_PRIX_IMPLEMENTATION_SUMMARY.md`
- **Quick Reference**: `GRAND_PRIX_QUICK_REFERENCE.md`
- **Core Code**: `lib/game/grand-prix.ts`
- **API Endpoint**: `app/api/internal/grand-prix/create/route.ts`
- **Test Suite**: `scripts/test-grand-prix.ts`

---

## ✅ Completion Status

Mark when complete:
- [ ] Pre-integration verification complete
- [ ] Files copied and dependencies verified
- [ ] Integration code added to milestone system
- [ ] Automated tests passing
- [ ] Manual tests passing
- [ ] Database state verified
- [ ] Troubleshooting guide reviewed
- [ ] Monitoring/analytics set up
- [ ] Production deployment complete
- [ ] First Grand Prix successfully created in production

**Integration Completed By**: ________________
**Date**: ________________
**Notes**: ________________________________
