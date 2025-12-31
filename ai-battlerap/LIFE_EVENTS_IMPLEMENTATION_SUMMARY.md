# Three-Tier Life Event System - Implementation Summary

## What Was Implemented

A comprehensive three-tier life event system that adds **mechanical depth** to the battle rap game through behavior-based consequences, strategic choices, and performance-driven outcomes.

---

## Files Created

### Database Migrations

1. **`007_add_stress_stat.sql`**
   - Adds `stress` field (0-100) to `battler_attributes`
   - Hidden stat that accumulates from behavior
   - Affects choke probability and prep efficiency

2. **`008_three_tier_life_events.sql`**
   - Drops and recreates `life_event_templates` table with new schema
   - Creates `battler_life_events` table for event instances
   - Creates `prep_pattern_tracking` table for behavior monitoring
   - Adds trigger functions to track prep patterns automatically
   - Implements effect expiration system

3. **`009_seed_passive_events.sql`**
   - 20 PASSIVE event templates
   - Automatic consequences from thresholds
   - Examples: Burnout, stress overload, material leaks

4. **`010_seed_choice_events.sql`**
   - 20 CHOICE event templates
   - Player decision points with rock-paper-scissors outcomes
   - Badge-aware (writers, performers, balanced)
   - Examples: Interview offers, beef responses, sponsor deals

5. **`011_seed_triggered_events.sql`**
   - 20 TRIGGERED event templates
   - Performance-based automatic events
   - Examples: Bodybag buzz, choke redemption, upset victories

6. **`012_life_event_helper_functions.sql`**
   - SQL helper functions for event system
   - Stress management functions
   - Prep pattern tracking functions
   - Event query and cleanup functions

### TypeScript Modules

7. **`lib/game/lifeEventTriggers.ts`**
   - Trigger evaluation system
   - Pre-battle event checking (passive/choice)
   - Post-battle event checking (triggered)
   - Condition evaluation logic for all trigger types
   - Cooldown and probability handling

8. **`lib/game/lifeEventEffects.ts`**
   - Effect application system
   - Permanent attribute changes
   - Temporary modifier management
   - Active effect aggregation
   - Effect expiration handling
   - Stress calculation functions
   - Battler type determination (writer/performer/balanced)

9. **`lib/game/simulationIntegration.ts`**
   - Integration with battle simulation
   - Pre-battle lifecycle hook
   - During-battle modifier application
   - Post-battle lifecycle hook
   - Choice event resolution
   - Stress impact calculations

### Documentation

10. **`LIFE_EVENTS_THREE_TIER_TESTING.md`**
    - Comprehensive testing guide
    - 5 detailed test scenarios
    - SQL verification queries
    - Expected behavior documentation
    - Performance verification checklist

11. **`THREE_TIER_LIFE_EVENTS_README.md`**
    - Complete system documentation
    - Event type explanations
    - Stress system deep dive
    - Effect duration system
    - Integration points
    - Database schema reference
    - API integration guide
    - Configuration and tuning
    - 60 event template summaries

12. **`LIFE_EVENTS_IMPLEMENTATION_SUMMARY.md`** (this file)
    - Implementation overview
    - File manifest
    - Integration instructions
    - Quick start guide

---

## Event Breakdown

### 60 Total Event Templates

#### 20 Passive Events (Automatic)
- Prep burnout (writing, performance, research)
- Stress thresholds (moderate, high, critical)
- Material/sparring leaks
- Personal life events (relationship drama, job loss)
- Injuries and illness
- Reputation consequences
- Choke trauma
- Financial crises
- Prep imbalance warnings

#### 20 Choice Events (Player Decides)
- Media opportunities (podcasts, documentaries, interviews)
- Beef/confrontation responses (Twitter, backstage)
- Financial decisions (sponsors, easy money battles)
- Training opportunities (camps, partners)
- Personal life balance (relationship, family)
- Career moves (league changes, main events, grudge matches)
- Mental health (burnout, therapy)
- Lifestyle choices (party scene)
- Comeback decisions (after choke, losing streak)

#### 20 Triggered Events (Performance-Based)
- Victory celebrations (bodybag buzz, perfect execution, upsets)
- Loss consequences (backlash, exposed weaknesses)
- Choke events (public humiliation, redemption arcs)
- Reputation milestones (breakout star, legend status)
- League recognition (interest, main event status)
- Financial rewards (pay raises, sponsor interest)
- Crowd reactions (favorite, haymaker moments)
- Career narratives (comeback stories, controversy)

---

## Mechanical Systems

### Stress System (0-100 Hidden Stat)

**Accumulation Sources**:
- Back-to-back battles without rest: +8 to +25
- Consecutive high-intensity prep: +10 to +15
- Life event outcomes: Variable
- Recent chokes: +10 to +20

**Reduction Sources**:
- Rest prep days: -5 per day
- Winning battles: -10
- Choice event outcomes: Variable

**Impact**:
- Choke probability: +3% to +25% based on stress level
- Prep efficiency: Reduced at high stress
- Event triggers: Passive events at 50, 70, 90 thresholds

### Effect Duration System

1. **Immediate** (Permanent)
   - Attribute changes
   - Reputation shifts
   - Public knowledge

2. **Next Battle** (Temporary)
   - Power modifiers
   - Choke chance modifiers
   - Confidence boosts
   - Expires after next battle

3. **Prep Cycle** (Prep Window)
   - Prep bonuses/penalties
   - Efficiency modifiers
   - Expires when prep locks

4. **Cumulative** (Ongoing)
   - Stress accumulation
   - Momentum effects
   - Until explicitly reduced

### Prep Pattern Tracking

Automatic tracking via trigger on `prep_blocks`:
- Consecutive day counters (writing, performance, research, rest, life)
- Total day counters (all-time tracking)
- Battles without rest counter
- Recent chokes counter (capped at 3)

---

## Integration Points

### Pre-Battle (Before Simulation)

**Location**: `lib/game/simulation.ts` (or wherever battle simulation is triggered)

```typescript
import { preBattleLifeEventCheck } from '@/lib/game/simulationIntegration';

// Before running simulation
await preBattleLifeEventCheck(supabase, battleId, playerBattlerId);
```

**What It Does**:
- Calculates stress accumulation
- Evaluates passive event triggers
- Evaluates random/attribute choice events
- Applies immediate effects

### During Battle (In Simulation)

**Location**: Inside `simulateBattle()` function

```typescript
import { getBattleModifiers, applyModifiersToSimulation, calculateStressChokeImpact } from '@/lib/game/simulationIntegration';

// Fetch active modifiers
const modifiers = await getBattleModifiers(supabase, playerBattlerId);

// Calculate stress impact
const stressChokeImpact = calculateStressChokeImpact(playerAttributes.stress);

// Apply to base stats
const baseStats = {
  writingPower: calculateWritingPower(attributes),
  performancePower: calculatePerformancePower(attributes),
  chokeChance: baseChokeChance + stressChokeImpact,
  // ... other stats
};

const modifiedStats = applyModifiersToSimulation(baseStats, modifiers, prepProfile);

// Use modifiedStats in simulation
```

**What It Does**:
- Fetches all active temporary effects
- Applies power modifiers
- Increases/decreases choke chance
- Modifies prep effectiveness
- Applies bonuses/penalties

### Post-Battle (After Simulation)

**Location**: `lib/game/simulation.ts` after results are saved

```typescript
import { postBattleLifeEventCheck } from '@/lib/game/simulationIntegration';

// After battle results are saved
const battleContext = {
  battleId,
  winnerId,
  playerBattlerId,
  aiBattlerId,
  result: "3-0", // or "2-1", etc.
  playerRoundsWon,
  aiRoundsWon,
  playerChoked,
  aiChoked,
  playerAvgCrowdReaction,
  aiAvgCrowdReaction,
  playerPeakScore,
  playerConsistencyScore,
};

await postBattleLifeEventCheck(supabase, battleId, playerBattlerId, battleContext);
```

**What It Does**:
- Evaluates triggered events based on performance
- Updates prep patterns (choke tracking, streaks)
- Expires temporary effects
- Applies stress reduction from rest
- Resets/increments behavior counters

---

## API Endpoints (To Be Created)

### GET /api/life-events

**Purpose**: Fetch all life events for current battler

**Response**:
```json
{
  "pending": [
    {
      "id": "uuid",
      "code": "CHOICE_PODCAST_INVITE",
      "title": "Podcast Interview Offer",
      "description": "...",
      "choices": [
        {"option": "a", "text": "...", "effects": {...}},
        {"option": "b", "text": "...", "effects": {...}}
      ],
      "triggered_at": "timestamp"
    }
  ],
  "recent": [
    {
      "id": "uuid",
      "code": "TRIGGERED_BODYBAG_BUZZ",
      "title": "...",
      "effects_applied": {...},
      "resolved_at": "timestamp"
    }
  ],
  "stats": {
    "total_events": 15,
    "pending_choices": 1,
    "active_effects": 3
  }
}
```

### POST /api/life-events/:id/resolve

**Purpose**: Resolve a choice event

**Request**:
```json
{
  "chosen_option": "a"
}
```

**Response**:
```json
{
  "success": true,
  "event": {
    "id": "uuid",
    "code": "CHOICE_PODCAST_INVITE",
    "chosen_option": "a",
    "effects_applied": {
      "public_knowledge": 15,
      "reputation": 2,
      "stress": 10
    }
  }
}
```

---

## Frontend Integration (To Be Created)

### Pending Choice Events

**Location**: Dashboard or dedicated events page

**UI Elements**:
- Event card showing title and description
- 2-3 choice buttons with effect previews
- Tooltip showing which choice is "best" for battler type
- Confirmation modal before submitting choice

**Example**:
```tsx
<ChoiceEventCard event={event}>
  <h3>{event.title}</h3>
  <p>{event.description}</p>

  <ChoiceButton
    option="a"
    text={event.choice_a_text}
    effects={event.choice_a_effects}
    isBest={event.winning_choice_for_writers === 'a' && battlerType === 'writer'}
    onClick={() => resolveChoice(event.id, 'a')}
  />

  <ChoiceButton option="b" ... />
  <ChoiceButton option="c" ... />
</ChoiceEventCard>
```

### Event History

**Location**: Profile or stats page

**UI Elements**:
- Timeline of recent events
- Filter by event type (passive/choice/triggered)
- Show effects applied
- Highlight major events (bodybag, choke, etc.)

### Stress Indicator (Optional)

**Considerations**:
- Could remain hidden (mystery stat)
- Or show vague indicator ("calm" / "tense" / "stressed" / "breaking point")
- Visual cues (battler portrait mood, UI color shifts)

---

## Testing Quick Start

### 1. Run Migrations

```bash
# Apply migrations in order
supabase migration up 007_add_stress_stat
supabase migration up 008_three_tier_life_events
supabase migration up 009_seed_passive_events
supabase migration up 010_seed_choice_events
supabase migration up 011_seed_triggered_events
supabase migration up 012_life_event_helper_functions
```

### 2. Test Passive Event

```sql
-- Set up consecutive writing days
INSERT INTO prep_blocks (battle_id, battler_id, day_index, focus)
VALUES
  ('test-battle', 'test-battler', 1, 'writing'),
  ('test-battle', 'test-battler', 2, 'writing'),
  ('test-battle', 'test-battler', 3, 'writing'),
  ('test-battle', 'test-battler', 4, 'writing'),
  ('test-battle', 'test-battler', 5, 'writing');

-- Check prep patterns updated
SELECT * FROM prep_pattern_tracking WHERE battler_id = 'test-battler';
-- consecutive_writing_days should = 5

-- Trigger pre-battle check (via code)
-- await preBattleLifeEventCheck(supabase, 'test-battle', 'test-battler');

-- Verify event created
SELECT * FROM battler_life_events
WHERE battler_id = 'test-battler'
  AND template_code = 'PASSIVE_WRITING_BURNOUT';
```

### 3. Test Choice Event

```sql
-- Manually create pending choice event
INSERT INTO battler_life_events (
  battler_id,
  template_code,
  battle_id,
  event_type,
  status
) VALUES (
  'test-battler',
  'CHOICE_PODCAST_INVITE',
  NULL,
  'choice',
  'pending'
);

-- Fetch pending choices
SELECT * FROM get_pending_choice_events('test-battler');

-- Resolve via code
-- await resolveChoiceEvent(supabase, eventId, 'b');

-- Verify resolution
SELECT chosen_option, effects_applied, status
FROM battler_life_events
WHERE id = 'event-id';
```

### 4. Test Triggered Event

```sql
-- Create completed battle with 3-0 result
-- Insert battle_rounds with high crowd reactions

-- Trigger post-battle check (via code)
-- await postBattleLifeEventCheck(supabase, battleId, playerBattlerId, battleContext);

-- Verify triggered event
SELECT * FROM battler_life_events
WHERE battler_id = 'test-battler'
  AND event_type = 'triggered'
ORDER BY triggered_at DESC;
```

See `LIFE_EVENTS_THREE_TIER_TESTING.md` for complete test scenarios.

---

## Configuration and Tuning

### Event Probabilities

Adjust in SQL templates:
```sql
UPDATE life_event_templates
SET trigger_probability = 0.5  -- 50% chance when conditions met
WHERE code = 'PASSIVE_WRITING_BURNOUT';
```

### Stress Thresholds

Adjust in `lifeEventEffects.ts`:
```typescript
export function calculateStressChokeImpact(stress: number): number {
  if (stress >= 80) return 0.25;  // Tune these thresholds
  if (stress >= 60) return 0.15;
  if (stress >= 40) return 0.08;
  if (stress >= 20) return 0.03;
  return 0;
}
```

### Effect Magnitudes

Adjust in SQL templates:
```sql
UPDATE life_event_templates
SET passive_effects = '{"stress": 20, "writing_power_modifier": -0.2}'::jsonb
WHERE code = 'PASSIVE_WRITING_BURNOUT';
```

---

## Key Design Decisions

### 1. Events Have Mechanical Teeth

Every event affects gameplay mechanics, not just story:
- Attribute changes affect future battle calculations
- Modifiers directly impact current battle performance
- Stress creates cascading consequences
- Choices have real tradeoffs

### 2. Badge-Aware Choice Outcomes

Writers, performers, and balanced battlers get different optimal choices:
- Writers prefer calculated, strategic responses
- Performers thrive on bold, aggressive choices
- Balanced battlers split the difference

### 3. Stress as Hidden Stat

Stress is not directly shown to player (could change):
- Creates mystery and discovery
- Players learn stress patterns through consequences
- Encourages experimentation with rest days
- Could add indicator later if desired

### 4. Effect Duration Flexibility

Four duration types allow varied consequences:
- Permanent changes for major events
- Temporary boosts/debuffs for recent events
- Prep-specific effects for immediate impact
- Cumulative tracking for behavioral patterns

### 5. Automatic Prep Tracking

Database trigger automatically updates patterns:
- No manual tracking needed
- Impossible to miss
- Performant (single update per prep block)

---

## What's NOT Included (Future Work)

1. **API Endpoints** - Need to create actual routes
2. **Frontend UI** - Event cards, choice modals, history
3. **Notification System** - Alert player to new events
4. **Event Chains** - Events triggering follow-up events
5. **Time-Based Events** - Calendar-based triggers
6. **Media Integration** - Events generating news articles
7. **Advanced Analytics** - Event frequency, choice distribution stats
8. **Balancing Data** - Need playtesting to tune values

---

## Next Steps

### Immediate (Core Functionality)

1. Create `/api/life-events` GET endpoint
2. Create `/api/life-events/:id/resolve` POST endpoint
3. Integrate pre-battle check in simulation flow
4. Integrate during-battle modifiers in simulation
5. Integrate post-battle triggers in simulation
6. Test with actual battles

### Short-Term (User Experience)

1. Build pending choice events UI
2. Add event history viewer
3. Create event notification system
4. Add tutorial/onboarding for events
5. Playtest and gather data

### Long-Term (Enhancement)

1. Tune probabilities based on data
2. Add more event templates
3. Implement event chains
4. Add media/news integration
5. Build analytics dashboard
6. Consider stress visibility options

---

## Success Metrics

The system is successful if:

1. **Events fire regularly but not overwhelmingly**
   - ~1-2 events per battle cycle
   - Mix of passive, choice, triggered

2. **Choices feel meaningful**
   - No "always pick X" dominant strategy
   - Different outcomes for different battler types
   - Real mechanical consequences

3. **Stress system creates tension**
   - Players naturally balance rest vs prep
   - High stress visibly impacts performance
   - Burnout is real and scary

4. **Triggered events feel earned**
   - Bodybag wins feel special
   - Choke redemptions are dramatic
   - Upsets are celebrated

5. **System adds depth without complexity**
   - Easy to understand individual events
   - Complex emergent behavior from simple rules
   - Enhances core loop, doesn't distract

---

## Summary

The three-tier life event system is **fully implemented** at the database and logic layer. It adds:

- **60 event templates** across 3 types
- **Stress management system** with real consequences
- **Prep pattern tracking** for behavioral triggers
- **Effect duration framework** for varied impacts
- **Badge-aware choices** for strategic depth
- **Simulation integration** for mechanical teeth

**What remains**: API endpoints, frontend UI, playtesting, and tuning.

**Core philosophy**: Events MATTER mechanically. Every event has teeth.
