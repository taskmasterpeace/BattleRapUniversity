# Life Events Integration - Validation Checklist

## Code Integration ✅

- [x] Imports added to `run-due-battles/route.ts`
- [x] Pre-battle life event check implemented
- [x] Post-battle life event evaluation implemented
- [x] Battle context properly constructed from rounds data
- [x] Battler context fetched with ratings and attributes
- [x] Error handling prevents simulation failures
- [x] Integration points match trigger function signatures

## Existing Infrastructure Verified ✅

- [x] `lib/game/lifeEventTriggers.ts` exists with complete logic
- [x] `lib/game/lifeEvents.ts` exists with event creation
- [x] `components/battler/PendingLifeEventsWidget.tsx` exists and functional
- [x] `app/api/life-events/route.ts` API endpoint exists
- [x] Dashboard fetches pending events (line 92-101 in `dashboard/page.tsx`)
- [x] Dashboard displays widget (line 522 in `DashboardClient.tsx`)
- [x] Life event templates seeded in database
- [x] Database tables exist and are accessible

## Manual Testing Required ⏳

### Test 1: Choke Event
1. Start the application
2. Create/login to a player battler
3. Accept a battle offer
4. Skip prep or do minimal prep
5. Simulate the battle
6. Check if choke occurs during simulation
7. Check dashboard for "CHOKE_EVENT" or "CHOKE_IN_BIG_BATTLE"
8. Navigate to life event resolution page
9. Choose an option
10. Verify attributes are updated

### Test 2: Dominant Victory (3-0)
1. Set player attributes very high (8-10 in all categories)
2. Accept battle against lower-rated opponent
3. Do full prep (writing, performance, research)
4. Simulate battle
5. Should win 3-0
6. Check dashboard for "DOMINANT_VICTORY" or "BODYBAG_HYPE"
7. Resolve event
8. Verify reputation/public knowledge increased

### Test 3: Win Streak
1. Win 3 battles in a row (may need to manipulate data)
2. On 3rd win, check for "WIN_STREAK_3" event
3. Continue to 5 wins for "WIN_STREAK_5"
4. Verify streak-based events trigger

### Test 4: Close Loss (2-1)
1. Create evenly-matched battle
2. Lose 2-1
3. Check for "NARROW_LOSS" or "CONTROVERSIAL_LOSS"
4. Verify event offers appropriate choices

## Database Queries for Verification

### Check for triggered events
```sql
SELECT
  ble.id,
  ble.template_code,
  let.title,
  ble.status,
  ble.triggered_at,
  ble.battle_id
FROM battler_life_events ble
JOIN life_event_templates let ON ble.template_code = let.code
WHERE ble.battler_id = 'PLAYER_BATTLER_ID'
ORDER BY ble.triggered_at DESC;
```

### Check battle results
```sql
SELECT
  b.id,
  b.status,
  b.winner_battler_id,
  br.round_number,
  br.battler_id,
  br.won,
  br.choke,
  br.crowd_reaction,
  br.peak_score
FROM battles b
JOIN battle_rounds br ON b.id = br.battle_id
WHERE b.battler_player_id = 'PLAYER_BATTLER_ID'
AND b.status = 'completed'
ORDER BY b.scheduled_at DESC, br.round_number ASC
LIMIT 12;
```

### Check prep patterns
```sql
SELECT *
FROM prep_pattern_tracking
WHERE battler_id = 'PLAYER_BATTLER_ID';
```

## Expected Behavior

### Pre-Battle Events
- Trigger BEFORE simulation runs
- Based on stress, prep patterns, attributes
- Should be rare (most battles won't trigger pre-battle events)
- Examples: "Burnout", "Inspiration", "Personal Crisis"

### Post-Battle Events
- Trigger AFTER simulation completes
- Based on battle results (win/loss, score, chokes)
- More common than pre-battle events
- Examples: "Dominant Victory", "Choke Event", "Win Streak"

### Dashboard Display
- Pending events show in PendingLifeEventsWidget
- Widget appears above "ACTIONS" section
- Orange/yellow highlight based on urgency
- Shows event count badge
- Preview cards with "MAKE DECISION" button
- Links to `/life-events/[id]` for resolution

### Event Resolution
- Player chooses option A, B, or C
- Effects immediately applied to attributes
- Event status changes from 'pending' to 'resolved'
- Event disappears from dashboard
- Attributes update visible on next page load

## Console Log Validation

When battle simulation runs, you should see:
```
[Life Events] Evaluating pre-battle events for battle BATTLE_ID
[Life Events] Evaluating post-battle events for battle BATTLE_ID
[Life Events] Triggering event: EVENT_CODE for battler BATTLER_ID
[Life Events] Successfully triggered: EVENT_CODE
```

## Debugging Steps

If events don't trigger:

1. **Check template existence**
   ```sql
   SELECT code, title, trigger_type, trigger_condition, trigger_probability
   FROM life_event_templates
   WHERE trigger_type = 'battle_result';
   ```

2. **Check trigger probability**
   - Most events have 100% probability (1.0)
   - Some are lower to avoid spam

3. **Check cooldowns**
   ```sql
   SELECT code, cooldown_battles, can_trigger_multiple_times
   FROM life_event_templates;
   ```

4. **Check recent events**
   ```sql
   SELECT battler_id, template_code, triggered_at
   FROM battler_life_events
   ORDER BY triggered_at DESC
   LIMIT 10;
   ```

5. **Verify battle context**
   - Check that rounds data exists
   - Verify winner_battler_id is set
   - Confirm choke flags are accurate

## Success Criteria

✅ Integration is successful when:
1. Life events appear on dashboard after battle simulation
2. Events can be resolved through UI
3. Effects are applied to battler attributes
4. Different battle outcomes trigger different events
5. Events respect cooldowns and trigger conditions
6. No simulation errors occur due to life event code

## Known Edge Cases

1. **No matching events** - Some battle results may not match any template conditions
2. **Cooldown blocking** - Recent events may block new ones of same type
3. **Probability roll fails** - Event condition matches but random roll fails
4. **Empty prep patterns** - New battlers have no prep history yet

## Performance Impact

- Minimal - two additional database queries per battle
- Pre-battle: 1 query for battler context, 1 query for templates
- Post-battle: 1 query for battle results, 1 query for rounds, 1 query for battler context, 1 query for templates
- Total: ~4-6 additional queries per battle simulation
- All queries use indexes and are fast
- Error handling prevents simulation failures

## Rollback Plan

If issues arise, comment out these sections in `run-due-battles/route.ts`:

```typescript
// Comment out lines 133-142 (pre-battle check)
// Comment out lines 147-208 (post-battle evaluation)
```

This reverts to previous behavior without life events.

---

**Status:** Integration complete, ready for testing
**Risk Level:** Low
**Impact:** High (unlocks major feature)
**Testing Priority:** High
