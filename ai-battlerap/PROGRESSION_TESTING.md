# Testing the Progression System

## Automated Tests

Run the unit tests:

```bash
npm test -- progression.test.ts
```

Expected output: All 5 tests should pass.

## Manual Integration Testing

To manually test the progression system with real battles:

### 1. Setup a Battle

```bash
# Start the dev server
npm run dev
```

1. Navigate to http://localhost:3000
2. Sign in / create account
3. Create a battler if you haven't already
4. Accept a battle offer
5. Complete prep planning (or skip to test no-show)

### 2. Run the Battle Simulation

Use the internal API to simulate the battle:

```bash
curl -X POST "http://localhost:3000/api/internal/run-due-battles?battle_id=YOUR_BATTLE_ID" \
  -H "X-Internal-Secret: your-secret-here"
```

Or trigger via the cron job simulation.

### 3. Check Attribute Changes

#### Via Database Query

```sql
-- Before battle
SELECT
  battler_id,
  writing,
  performance,
  resilience,
  updated_at
FROM battler_attributes
WHERE battler_id = 'your-battler-id';

-- After battle (check updated_at timestamp)
-- Values should have changed based on performance
```

#### Via UI

1. Navigate to your battler profile
2. Check the attribute values before and after the battle
3. Compare with battle performance metrics

### 4. Test Scenarios

#### Test Case 1: High Performance Win
**Setup**:
- Create a low-tier battler (attributes around 3-4)
- Accept a battle against an even lower-tier AI
- Complete full prep (good mix of writing, performance, research)

**Expected**:
- Win the battle with high scores
- See improvements across most attributes
- Resilience improves if no chokes occur

#### Test Case 2: Close Loss
**Setup**:
- Accept a battle against a higher-tier AI
- Complete partial prep

**Expected**:
- Lose the battle
- Still see small improvements (50% of normal gains)
- Improvements focused on areas where you performed well

#### Test Case 3: No-Show
**Setup**:
- Accept a battle
- Don't complete any prep
- Let the battle auto-simulate

**Expected**:
- Very poor performance due to no-show penalty
- Minimal or no attribute gains
- Battle completes but with low scores

#### Test Case 4: Near-Cap Attributes
**Setup**:
- Use database to set attributes to 9.5
- Win a battle with excellent performance

**Expected**:
- Attributes cap at exactly 10.0
- No overflow beyond cap

## Console Logging

The progression system logs to console:

```
Applied attribute progression for battler {id}: {
  lyricism: 0.05,
  wordplay: 0.07,
  creativity: 0.12,
  ...
}
```

Check server logs during battle simulation to see the exact improvements.

## Verification Queries

### Check Recent Battles
```sql
SELECT
  b.id,
  b.winner_battler_id,
  b.battler_player_id,
  b.status,
  b.scheduled_at
FROM battles b
WHERE b.battler_player_id = 'your-battler-id'
ORDER BY b.scheduled_at DESC
LIMIT 5;
```

### Check Battle Performance
```sql
SELECT
  br.round_index,
  br.average_score,
  br.peak_score,
  br.crowd_reaction,
  br.choked
FROM battle_rounds br
WHERE br.battle_id = 'your-battle-id'
  AND br.battler_id = 'your-battler-id'
ORDER BY br.round_index;
```

### Check Attribute History
```sql
-- Note: This shows current state only
-- For full history, you'd need to add an attribute_history table
SELECT
  ba.writing,
  ba.performance,
  ba.resilience,
  ba.updated_at,
  r.wins,
  r.losses
FROM battler_attributes ba
JOIN rankings r ON r.battler_id = ba.battler_id
WHERE ba.battler_id = 'your-battler-id';
```

## Expected Progression Rates

Based on default config:

### Starting from Tier "Low" (3-4 average)
- **After 1 good win**: +0.1 to +0.2 per attribute
- **After 5 good wins**: Should reach low-mid tier (4-5 average)
- **After 10 battles**: Should reach mid tier (5-6 average)
- **After 20 battles**: Should reach high-mid tier (6-7 average)

### Progression Curve
- **Low → Mid (3→5)**: ~10-15 battles
- **Mid → Top (5→7)**: ~15-20 battles
- **Top → God (7→10)**: ~20-30 battles

Note: This assumes a mix of wins/losses and good performance.

## Debugging

If progression doesn't seem to work:

1. **Check battle status**: Must be 'completed'
   ```sql
   SELECT status FROM battles WHERE id = 'battle-id';
   ```

2. **Check battler is not AI**:
   ```sql
   SELECT is_ai FROM battlers WHERE id = 'battler-id';
   ```

3. **Check rounds exist**:
   ```sql
   SELECT COUNT(*) FROM battle_rounds WHERE battle_id = 'battle-id';
   ```

4. **Check server logs** for error messages

5. **Verify function was called**:
   - Look for "Applied attribute progression" console log
   - Or "skipping progression" messages

## Future Enhancements for Testing

Consider adding:

1. **Attribute History Table**: Track changes over time
2. **Progression Events**: Log each progression application
3. **Admin Panel**: View progression calculations
4. **Dry Run Mode**: Preview improvements before applying
5. **Progression Dashboard**: Visual graph of attribute growth
