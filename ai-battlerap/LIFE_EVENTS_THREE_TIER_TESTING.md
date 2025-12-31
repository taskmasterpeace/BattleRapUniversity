# Three-Tier Life Event System - Testing Guide

This document provides test scenarios for all three types of life events: **Passive**, **Choice**, and **Triggered**.

## System Overview

### Event Types

1. **PASSIVE** - "This just happened to you"
   - Automatic consequences from behavior thresholds
   - No player input required
   - Examples: Burnout, stress overload, material leaks

2. **CHOICE** - "You choose how to respond"
   - Player makes a decision (A, B, or C)
   - Rock-paper-scissors outcomes based on battler type
   - Examples: Interview decisions, beef responses, sponsor offers

3. **TRIGGERED** - "You caused this by performance"
   - Direct response to battle stats/outcomes
   - Automatic based on performance
   - Examples: Bodybag buzz, choke redemption, league interest

### Effect Durations

- **immediate**: Permanent attribute change
- **next_battle**: Temporary buff/debuff until next battle
- **prep_cycle**: This prep window only
- **cumulative**: Ongoing effects (e.g., stress buildup)

---

## Test Scenario 1: PASSIVE Event - Writing Burnout

### Setup
```sql
-- Create a battler with 5 consecutive writing prep days
INSERT INTO prep_blocks (battle_id, battler_id, day_index, focus)
VALUES
  ('battle-123', 'battler-456', 1, 'writing'),
  ('battle-123', 'battler-456', 2, 'writing'),
  ('battle-123', 'battler-456', 3, 'writing'),
  ('battle-123', 'battler-456', 4, 'writing'),
  ('battle-123', 'battler-456', 5, 'writing');

-- This should trigger prep_pattern_tracking updates
-- consecutive_writing_days should = 5
```

### Expected Trigger
Event: `PASSIVE_WRITING_BURNOUT`
- **Condition**: `consecutive_writing_days >= 5`
- **Probability**: 70%
- **Effects**:
  - `stress: +15`
  - `writing_power_modifier: -0.15` (15% reduction)
  - `creativity: -1` (permanent)
- **Duration**: `next_battle`

### Verification
```sql
-- Check that event was triggered
SELECT * FROM battler_life_events
WHERE battler_id = 'battler-456'
  AND template_code = 'PASSIVE_WRITING_BURNOUT'
  AND status = 'resolved';

-- Check stress increased
SELECT stress FROM battler_attributes
WHERE battler_id = 'battler-456';
-- Expected: Previous stress + 15

-- Check creativity decreased
SELECT writing->>'creativity' FROM battler_attributes
WHERE battler_id = 'battler-456';
-- Expected: Previous value - 1

-- Check active modifier
SELECT effects_applied FROM battler_life_events
WHERE battler_id = 'battler-456'
  AND template_code = 'PASSIVE_WRITING_BURNOUT'
  AND active = true;
-- Expected: {"writing_power_modifier": -0.15}
```

### Battle Simulation Impact
During battle simulation for `battle-123`:
- Writing power should be reduced by 15%
- Battler is more likely to have lower segment scores
- Creativity is permanently reduced (affects future battles too)

---

## Test Scenario 2: CHOICE Event - Podcast Interview

### Setup
```sql
-- Battler with reputation >= 5 (eligible for podcast invite)
UPDATE battler_attributes
SET personal = jsonb_set(personal, '{reputation}', '6')
WHERE battler_id = 'battler-456';

-- Trigger random evaluation (may need multiple battles to trigger)
-- Or manually insert event for testing
INSERT INTO battler_life_events (
  battler_id,
  template_code,
  battle_id,
  event_type,
  status,
  details_json
) VALUES (
  'battler-456',
  'CHOICE_PODCAST_INVITE',
  'battle-123',
  'choice',
  'pending',
  '{}'::jsonb
);
```

### Event Details
Event: `CHOICE_PODCAST_INVITE`
- **Title**: "Podcast Interview Offer"
- **Description**: "Popular battle rap podcast wants you on. Great exposure, but you could say something that gets clipped and used against you."

### Choice Options

**Option A: "Accept - be yourself, speak freely"**
- Effects: `{public_knowledge: 15, reputation: 2, stress: 10, controversy_risk: 0.3}`
- Best for: **Performers** (winning choice)

**Option B: "Accept - play it safe, give PR answers"**
- Effects: `{public_knowledge: 10, reputation: -1, resilience: 1}`
- Best for: **Writers** and **Balanced** (winning choice)

**Option C: "Decline - stay mysterious"**
- Effects: `{reputation: 1, public_knowledge: -5}`
- Best for: Nobody (neutral/loss choice)

### Verification - Player Chooses Option A
```typescript
// Call resolve API
await resolveChoiceEvent(supabase, eventId, 'a');
```

```sql
-- Check event was resolved
SELECT chosen_option, status, effects_applied
FROM battler_life_events
WHERE id = 'event-id';
-- Expected: chosen_option = 'a', status = 'resolved'

-- Check attributes updated
SELECT
  public_knowledge,
  personal->>'reputation',
  stress
FROM battler_attributes
WHERE battler_id = 'battler-456';
-- Expected:
-- public_knowledge: +15
-- reputation: +2
-- stress: +10
```

### Rock-Paper-Scissors Outcome
If battler is a **Performer** (performance > writing):
- Option A is the "winning" choice → Maximum benefit
- They thrive on authenticity and direct engagement

If battler is a **Writer** (writing > performance):
- Option B is the "winning" choice → Better outcome
- They prefer calculated, strategic responses

If battler is **Balanced**:
- Option B is the "winning" choice → Safe middle ground

---

## Test Scenario 3: TRIGGERED Event - Bodybag Buzz

### Setup
```sql
-- Simulate a dominant 3-0 victory with high crowd reaction
-- This would be created by simulation.ts, but we can test the trigger manually

-- First, complete a battle
UPDATE battles
SET status = 'completed',
    winner_battler_id = 'battler-456'
WHERE id = 'battle-123';

-- Insert battle rounds showing 3-0 dominance
INSERT INTO battle_rounds (battle_id, round_index, battler_id, average_score, peak_score, consistency_score, crowd_reaction, choked)
VALUES
  ('battle-123', 1, 'battler-456', 8.5, 9.2, 0.88, 85, false),
  ('battle-123', 2, 'battler-456', 8.7, 9.5, 0.90, 82, false),
  ('battle-123', 3, 'battler-456', 8.3, 9.0, 0.85, 78, false);

-- Average crowd reaction: (85 + 82 + 78) / 3 = 81.67
```

### Expected Trigger
Event: `TRIGGERED_BODYBAG_BUZZ`
- **Condition**: `result = "3-0" AND outcome = "win" AND avg_crowd_reaction >= 75`
- **Probability**: 80%
- **Effects**:
  - `reputation: +2`
  - `public_knowledge: +25`
  - `confidence_boost: +0.2` (20% boost)
- **Duration**: `next_battle`

### Trigger Call
```typescript
// This is called from simulation after battle completes
await evaluatePostBattleEvents(supabase, battleContext, playerContext);
```

### Verification
```sql
-- Check that triggered event was created
SELECT * FROM battler_life_events
WHERE battler_id = 'battler-456'
  AND template_code = 'TRIGGERED_BODYBAG_BUZZ'
  AND event_type = 'triggered'
  AND status = 'resolved';

-- Check effects were applied
SELECT
  personal->>'reputation',
  public_knowledge
FROM battler_attributes
WHERE battler_id = 'battler-456';
-- Expected:
-- reputation: +2 from previous
-- public_knowledge: +25 from previous

-- Check active confidence boost
SELECT effects_applied->>'confidence_boost'
FROM battler_life_events
WHERE battler_id = 'battler-456'
  AND template_code = 'TRIGGERED_BODYBAG_BUZZ'
  AND active = true;
-- Expected: 0.2
```

### Next Battle Impact
- Battler will have +20% confidence boost
- This affects performance calculations in next battle
- After next battle completes, the effect expires

---

## Test Scenario 4: Stress Accumulation and Impact

### Setup - Build High Stress
```sql
-- Simulate 3 back-to-back battles without rest
UPDATE prep_pattern_tracking
SET battles_without_rest = 3
WHERE battler_id = 'battler-456';

-- Manually set stress to 65
UPDATE battler_attributes
SET stress = 65
WHERE battler_id = 'battler-456';
```

### Expected Passive Events

**Event 1: PASSIVE_HIGH_STRESS**
- **Condition**: `stress >= 70` (not triggered yet at 65)
- **Effects**: `choke_chance_modifier: +0.2, resilience: -1, prep_efficiency: -0.2`

**Event 2: PASSIVE_NO_REST_CRASH**
- **Condition**: `battles_without_rest >= 3`
- **Probability**: 90%
- **Effects**: `stress: +25, resilience: -1, choke_chance_modifier: +0.15`

### Trigger Sequence
```typescript
// Pre-battle check
await preBattleLifeEventCheck(supabase, 'battle-456', 'battler-456');
```

### Verification
```sql
-- Check NO_REST_CRASH triggered
SELECT * FROM battler_life_events
WHERE battler_id = 'battler-456'
  AND template_code = 'PASSIVE_NO_REST_CRASH';

-- Check stress increased to 90 (65 + 25)
SELECT stress FROM battler_attributes
WHERE battler_id = 'battler-456';
-- Expected: 90

-- Now HIGH_STRESS should trigger on next evaluation
-- Check for it
SELECT * FROM battler_life_events
WHERE battler_id = 'battler-456'
  AND template_code = 'PASSIVE_HIGH_STRESS';
```

### Battle Simulation Impact
With stress at 90:
```typescript
const stressChokeImpact = calculateStressChokeImpact(90);
// Returns: 0.25 (25% increased choke chance)

const modifiers = await getActiveModifiers(supabase, 'battler-456');
// modifiers.choke_chance_modifier = 0.35 (0.15 from NO_REST + 0.2 from HIGH_STRESS)
```

**Result**: Battler has 35% increased choke probability - very likely to choke!

---

## Test Scenario 5: Full Battle Flow with All 3 Types

### Complete Integration Test

**Setup**: Battler with burnout, pending choice, and upcoming battle

```typescript
// 1. PRE-BATTLE: Passive event triggers
await preBattleLifeEventCheck(supabase, battleId, playerBattlerId);
// - Checks prep patterns: 5 writing days in a row
// - Triggers PASSIVE_WRITING_BURNOUT
// - Applies stress +15
// - Creates writing_power_modifier -15%

// 2. PLAYER SEES CHOICE EVENT
const pendingEvents = await getPendingChoiceEvents(playerBattlerId);
// Returns: CHOICE_PODCAST_INVITE (from previous random trigger)

// 3. PLAYER RESOLVES CHOICE
await resolveChoiceEvent(supabase, choiceEventId, 'b');
// Option B: Play it safe
// Effects: public_knowledge +10, reputation -1, resilience +1

// 4. DURING BATTLE: Active modifiers applied
const modifiers = await getBattleModifiers(supabase, playerBattlerId);
// Returns:
// {
//   writing_power_modifier: -0.15,  // From PASSIVE_WRITING_BURNOUT
//   choke_chance_modifier: 0.08     // From stress level (45)
// }

const baseStats = calculateBaseStats(attributes);
const modifiedStats = applyModifiersToSimulation(baseStats, modifiers, prepProfile);
// writingPower reduced by 15%
// chokeChance increased by 8%

// 5. BATTLE SIMULATES
// Battler performs slightly worse due to modifiers
// Wins 2-1 (close victory)

// 6. POST-BATTLE: Triggered events fire
await postBattleLifeEventCheck(supabase, battleId, playerBattlerId, battleResult);
// Triggers: TRIGGERED_CLOSE_VICTORY (2-1 win)
// Effects: reputation +2, resilience +1, respect_modifier +0.2
// Expires: PASSIVE_WRITING_BURNOUT (next_battle effect)
```

### Final Verification
```sql
-- Check all events for battler
SELECT
  template_code,
  event_type,
  status,
  active,
  effects_applied
FROM battler_life_events
WHERE battler_id = 'battler-456'
ORDER BY triggered_at DESC;

-- Expected:
-- 1. TRIGGERED_CLOSE_VICTORY (triggered, resolved, active=false)
-- 2. CHOICE_PODCAST_INVITE (choice, resolved, active=false)
-- 3. PASSIVE_WRITING_BURNOUT (passive, resolved, active=false - expired)

-- Check final attribute state
SELECT
  stress,
  resilience,
  public_knowledge,
  personal->>'reputation',
  writing->>'creativity'
FROM battler_attributes
WHERE battler_id = 'battler-456';

-- Expected changes:
-- stress: +15 (from burnout) -10 (if had rest) = net +5
-- resilience: -1 (burnout) +1 (choice B) +1 (close victory) = net +1
-- public_knowledge: +10 (choice B)
-- reputation: -1 (choice B) +2 (close victory) = net +1
-- creativity: -1 (burnout - permanent)
```

---

## SQL Queries for Testing

### Check Prep Patterns
```sql
SELECT
  battler_id,
  consecutive_writing_days,
  consecutive_performance_days,
  consecutive_research_days,
  battles_without_rest,
  recent_chokes,
  total_writing_days,
  total_performance_days
FROM prep_pattern_tracking
WHERE battler_id = 'battler-456';
```

### Check Active Life Events
```sql
SELECT
  let.code,
  let.title,
  let.event_type,
  ble.status,
  ble.active,
  ble.effects_applied,
  ble.triggered_at
FROM battler_life_events ble
JOIN life_event_templates let ON ble.template_code = let.code
WHERE ble.battler_id = 'battler-456'
  AND ble.active = true;
```

### Check Pending Choices
```sql
SELECT * FROM get_pending_choice_events('battler-456');
```

### Check Stress Level and Impact
```sql
SELECT
  stress,
  CASE
    WHEN stress >= 80 THEN '25% increased choke chance'
    WHEN stress >= 60 THEN '15% increased choke chance'
    WHEN stress >= 40 THEN '8% increased choke chance'
    WHEN stress >= 20 THEN '3% increased choke chance'
    ELSE 'No stress impact'
  END as stress_impact
FROM battler_attributes
WHERE battler_id = 'battler-456';
```

### Get Life Event Statistics
```sql
SELECT * FROM get_life_event_stats('battler-456');
```

---

## Expected Behavior Summary

### Passive Events
- ✅ Trigger automatically when thresholds met
- ✅ No player input required
- ✅ Apply effects immediately
- ✅ Can be temporary or permanent
- ✅ Track consecutive prep day patterns
- ✅ Monitor stress thresholds

### Choice Events
- ✅ Trigger based on conditions (random, attribute, battle_result)
- ✅ Create pending event requiring player decision
- ✅ Offer 2-3 options with different effects
- ✅ Badge-aware outcomes (writer/performer/balanced)
- ✅ Apply effects only after player chooses
- ✅ Update event status to resolved

### Triggered Events
- ✅ Fire automatically after battle based on performance
- ✅ Respond to specific battle outcomes (3-0, choke, streak, etc.)
- ✅ Apply immediate or temporary effects
- ✅ Create narrative moments (bodybag buzz, choke redemption)
- ✅ Affect reputation and public knowledge

### Stress System
- ✅ Hidden stat (0-100)
- ✅ Accumulates from: back-to-back battles, high prep intensity, life events
- ✅ Reduces from: rest prep days
- ✅ Affects: choke probability, prep efficiency
- ✅ Triggers: passive events at thresholds (50, 70)

### Effect System
- ✅ Immediate: Permanent attribute changes
- ✅ Next_battle: Temporary modifiers (expire after next battle)
- ✅ Prep_cycle: Affects current prep only
- ✅ Cumulative: Ongoing effects like stress
- ✅ Modifiers stack when multiple events active

---

## Manual Testing Checklist

- [ ] Passive event triggers from consecutive writing days
- [ ] Passive event triggers from high stress
- [ ] Passive event triggers from battles without rest
- [ ] Choice event creates pending status
- [ ] Choice event resolves with option A
- [ ] Choice event resolves with option B
- [ ] Choice event resolves with option C (if available)
- [ ] Triggered event fires from 3-0 win
- [ ] Triggered event fires from choke
- [ ] Triggered event fires from win streak
- [ ] Stress accumulates correctly
- [ ] Stress reduces from rest prep
- [ ] Active modifiers apply during simulation
- [ ] Temporary effects expire after battle
- [ ] Prep cycle effects expire when prep locks
- [ ] Cooldown prevents duplicate events
- [ ] can_trigger_multiple_times works correctly
- [ ] Prep pattern tracking updates after each prep block
- [ ] Battles_without_rest increments correctly
- [ ] Recent_chokes caps at 3

---

## Performance Verification

All events should be **mechanically meaningful**, not just story flavor:

### Writing Burnout Impact
- **Mechanic**: -15% writing power
- **Observable**: Lower segment scores, fewer haymakers
- **Duration**: Next battle only

### High Stress Impact
- **Mechanic**: +20% choke chance
- **Observable**: Higher probability of choke flag
- **Duration**: Until stress reduced

### Confidence Boost Impact
- **Mechanic**: +20% to performance calculations
- **Observable**: Higher segment scores, better consistency
- **Duration**: Next battle only

### Bodybag Buzz Impact
- **Mechanic**: +25 public knowledge, +2 reputation
- **Observable**: Better battle offers, sponsor interest
- **Duration**: Permanent

Events should create **meaningful tradeoffs** and **strategic decisions**, not just random flavor text.
