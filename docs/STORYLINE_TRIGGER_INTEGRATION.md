# Storyline Trigger Integration Report

## Executive Summary

This document analyzes the storyline trigger system and its integration points with the battle simulation flow. The storyline system uses complex trigger conditions to determine when narrative events should fire, with evaluation happening after battle completion.

## 1. Trigger Condition Types

The storyline engine supports multiple trigger types defined in `lib/game/storylineEngine.ts`:

### 1.1 Primary Trigger Types

#### **Random Trigger**
```typescript
{
  "type": "random",
  "probability": 0.12,
  "conditions": { "min_battles": 5, "family_bond_max": 7 }
}
```
- Fires based on probability (0.0 to 1.0)
- Can include additional conditions that must also be met
- Example: Family Drama has 12% chance after 5 battles if family bond ≤ 7

#### **Attribute Trigger**
```typescript
{
  "type": "attribute",
  "conditions": {
    "min_attribute": { "reputation": 5 },
    "max_attribute": { "resilience": 4 }
  }
}
```
- Evaluates battler attributes against thresholds
- Supports both `min_attribute` and `max_attribute` checks
- Legacy format also supported (e.g., `family_bond_max: 7`)

#### **Streak Trigger**
```typescript
{
  "type": "streak",
  "conditions": {
    "streak_type": "win",
    "streak_count": 3
  }
}
```
- Fires when battler hits a win or loss streak
- Requires battle context to be passed in
- `streak_type`: "win" or "loss"
- `streak_count`: minimum consecutive results needed

#### **Battle Result Trigger**
```typescript
{
  "type": "battle_result",
  "conditions": {
    "outcome": "win",
    "choke_required": false,
    "score": "3-0"
  }
}
```
- Fires based on specific battle outcomes
- Can require specific conditions like chokes or score margins
- Requires full battle context

#### **Prep Pattern Trigger**
```typescript
{
  "type": "prep_pattern",
  "conditions": {
    "min_prep_days": 5,
    "max_prep_days": 10
  }
}
```
- Fires based on player's prep behavior
- Checks total prep days used for a battle
- Can detect over-preparation or under-preparation

#### **Compound Trigger**
```typescript
{
  "type": "compound",
  "probability": 0.90,
  "conditions": {
    "all": [
      { "last_battle_had_choke": true },
      { "min_battles": 8 },
      {
        "any": [
          { "min_tier": "rising" },
          { "min_attribute": { "reputation": 5 } }
        ]
      }
    ]
  }
}
```
- Most powerful trigger type - supports complex boolean logic
- Uses `all` (AND logic) and `any` (OR logic) operators
- Can nest conditions deeply
- Example: VIRAL_CHOKE requires choke + 8 battles + (rising tier OR reputation ≥ 5)

### 1.2 Condition Properties

Available in `TriggerConditions` interface:

**Basic Conditions:**
- `min_battles`, `max_battles`: Career length gates
- `min_attribute`, `max_attribute`: Attribute thresholds
- `streak_type`, `streak_count`: Win/loss streak tracking

**Badge Requirements:**
- `has_badge`: Must have specific badges
- `lacks_badge`: Must NOT have specific badges
- `badge_count_min`: Minimum total badges earned

**Storyline History:**
- `made_choice`: Check if player made specific choices in past storylines
- `completed_storyline`: Check if player completed specific storylines with specific endings
- `active_storyline`: Must have specific storylines active
- `no_active_storyline`: Must NOT have specific storylines active

**Relationships:**
- `has_rival`, `rival_with`: Rivalry requirements
- `has_ally`, `ally_with`: Alliance requirements
- `relationship_count_min`: Minimum relationships

**Career Tier:**
- `tier`: Must be exact tier (rookie, rising, established, elite, legend)
- `min_tier`, `max_tier`: Tier range requirements
- Tiers based on rating and battle count thresholds

**League/Event:**
- `league_affiliation`: Must be in specific leagues
- `league_standing_min`: League ranking requirement
- `attended_event`: Must have attended specific events

**Special Conditions:**
- `career_is_hidden`: Career visibility state (for CAREER_EXPOSED storyline)
- `last_battle_had_choke`: Most recent battle had a choke
- `has_recent_big_win`: Won by 2+ rounds in last 14 days

**Compound Logic:**
- `all`: Array of conditions that must ALL be true (AND)
- `any`: Array of conditions where ANY can be true (OR)

### 1.3 Real-World Examples

**Example 1: FAMILY_DRAMA (Simple Random)**
```json
{
  "type": "random",
  "probability": 0.12,
  "conditions": { "min_battles": 5, "family_bond_max": 7 }
}
```
- 12% chance per battle
- Only after 5+ battles
- Only if family bond ≤ 7 (neglecting family)

**Example 2: VIRAL_CHOKE (Complex Compound)**
```json
{
  "type": "compound",
  "probability": 0.90,
  "conditions": {
    "all": [
      { "last_battle_had_choke": true },
      { "min_battles": 8 },
      {
        "any": [
          { "min_tier": "rising" },
          { "min_attribute": { "reputation": 5 } }
        ]
      }
    ]
  }
}
```
Logic breakdown:
1. Must have choked in last battle (required)
2. AND must have 8+ career battles (required)
3. AND either be "rising" tier OR have reputation ≥ 5
4. IF all true, 90% chance to trigger

**Example 3: CAREER_EXPOSED (Multi-Level Compound)**
```json
{
  "type": "compound",
  "probability": 0.25,
  "conditions": {
    "all": [
      { "career_is_hidden": true },
      { "min_battles": 12 },
      {
        "any": [
          { "min_tier": "rising" },
          { "min_attribute": { "reputation": 5 } },
          { "has_recent_big_win": true }
        ]
      }
    ]
  }
}
```
Logic breakdown:
1. Career must be hidden (not public knowledge)
2. AND must have 12+ battles
3. AND at least one of:
   - Rising tier or higher
   - Reputation ≥ 5
   - Won a battle 3-0 or 2-0 in last 14 days
4. IF all true, 25% chance to trigger

## 2. Battle Flow Integration Points

### 2.1 Current Battle Simulation Flow

From `app/api/internal/run-due-battles/route.ts`:

```
1. Load due battles
2. Check for no-shows (player didn't prep)
3. Generate AI prep if missing
4. PRE-BATTLE: evaluatePreBattleEvents() ← Not related to storylines
5. Run battle simulation (simulateBattle)
6. POST-BATTLE: evaluatePostBattleEvents() ← LIFE EVENTS HERE
7. Update battler stress
8. Generate new battle offers
```

### 2.2 Where Storyline Triggers Should Fire

**Current Implementation Status:**
- Life event triggers exist (`evaluatePostBattleEvents` in `lib/game/lifeEventTriggers.ts`)
- Storyline triggers are NOT currently integrated into the battle flow
- The `StorylineEngine.checkStorylineTriggers()` method exists but is not called

**Recommended Integration Point:**

After battle completion and before stress update:

```typescript
// Existing code in run-due-battles/route.ts (line ~205)
await evaluatePostBattleEvents(supabase, battleContext, playerContext);

// ADD HERE: Storyline trigger evaluation
await checkAndStartStorylines(supabase, battle.battler_player_id, battleContext);

// Then continue with stress update
await updateBattlerStress(supabase, battle.battler_player_id);
```

**Why this location?**
1. Battle results are finalized
2. Battle context is already computed (rounds won, chokes, etc.)
3. Player context is available
4. Happens before next offers generated
5. Allows storylines to affect attributes before next battle

### 2.3 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Battle Simulation                          │
│                                                                 │
│  1. Load battle data                                            │
│  2. Generate missing prep                                       │
│  3. Simulate rounds (lib/game/simulation.ts)                   │
│  4. Determine winner                                            │
│  5. Save battle_rounds and battle_segments                     │
│  6. Update battler rankings                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Build Battle Context (run-due-battles)             │
│                                                                 │
│  - winnerId, result (3-0, 2-1)                                 │
│  - playerRoundsWon, aiRoundsWon                                │
│  - playerChoked, aiChoked                                       │
│  - playerAvgCrowdReaction, aiAvgCrowdReaction                  │
│  - playerPeakScore, playerConsistencyScore                     │
│  - prepDaysUsed (from prep_blocks)                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│           Build Evaluation Context (storylineEngine)            │
│                                                                 │
│  Query database for:                                            │
│  - Total battles (career length)                                │
│  - Badges earned                                                │
│  - Completed storylines + endings                               │
│  - Choices made in past storylines                              │
│  - Active storylines (to avoid duplicates)                      │
│  - Relationships (rivals, allies)                               │
│  - Career tier (based on rating + battles)                      │
│  - League affiliations                                          │
│  - Recent battles (last 14 days for big wins, chokes)          │
│  - Career visibility status                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│         Evaluate Triggers (checkStorylineTriggers)              │
│                                                                 │
│  For each active storyline template:                            │
│    1. Skip if already active                                    │
│    2. Evaluate trigger conditions:                              │
│       - Check probability (if specified)                        │
│       - Check trigger type (random/attribute/streak/etc.)       │
│       - Evaluate compound conditions (all/any logic)            │
│       - Check special conditions (choke, big win, etc.)         │
│    3. If triggered, add to triggered array                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│             Start Triggered Storylines                          │
│                                                                 │
│  For each triggered storyline:                                  │
│    1. Create active_storylines record                           │
│    2. Create first chapter's life event                         │
│    3. Set deadlines if urgency = "timed"                        │
│    4. Link to battle_id (context for triggering)                │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Data Requirements for Trigger Evaluation

### 3.1 Required Database Queries

The `buildEvaluationContext()` method (line 692-845 in storylineEngine.ts) requires:

```typescript
// 1. Total battles
const { count: totalBattles } = await supabase
  .from('battles')
  .select('*', { count: 'exact', head: true })
  .or(`battler_player_id.eq.${battlerId},battler_opponent_id.eq.${battlerId}`)
  .eq('status', 'completed')

// 2. Badges
const { data: badgeData } = await supabase
  .from('battler_badges')
  .select('badge_name')
  .eq('battler_id', battlerId)

// 3. Completed storylines
const { data: completedData } = await supabase
  .from('active_storylines')
  .select('template_code, ending_type, ending_id, choices_made')
  .eq('battler_id', battlerId)
  .eq('status', 'completed')

// 4. Active storylines
const { data: activeData } = await supabase
  .from('active_storylines')
  .select('template_code, choices_made')
  .eq('battler_id', battlerId)
  .eq('status', 'active')

// 5. Current rating (for tier calculation)
const { data: ranking } = await supabase
  .from('rankings')
  .select('rating')
  .eq('battler_id', battlerId)
  .single()

// 6. Career data
const { data: battlerData } = await supabase
  .from('battlers')
  .select('primary_league_id, career_days, career_public')
  .eq('id', battlerId)
  .single()

// 7. Relationships (optional - table may not exist)
const { data: relData } = await supabase
  .from('battler_relationships')
  .select('relationship_type, target_battler_id')
  .eq('battler_id', battlerId)

// 8. Recent battles (last 14 days)
const twoWeeksAgo = new Date()
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

const { data: recentBattleData } = await supabase
  .from('battles')
  .select(`
    id,
    winner_battler_id,
    created_at,
    battle_rounds!inner(battler_id, choked)
  `)
  .or(`battler_player_id.eq.${battlerId},battler_opponent_id.eq.${battlerId}`)
  .eq('status', 'completed')
  .gte('created_at', twoWeeksAgo.toISOString())
  .order('created_at', { ascending: false })
  .limit(5)
```

### 3.2 Battle Context Required

From the battle simulation, triggers need:

```typescript
interface BattleContext {
  won: boolean              // Did player win?
  score: string             // "3-0", "2-1", etc.
  wasChoke: boolean         // Did player choke in any round?
  streakLength: number      // Current win/loss streak
  prepDaysUsed: number      // Total prep days for this battle
}
```

This is computed in `run-due-battles/route.ts` at lines 181-195:

```typescript
const battleContext = {
  battleId: battle.id,
  winnerId: completedBattle.winner_battler_id,
  playerBattlerId: battle.battler_player_id,
  result: `${playerRoundsWon}-${aiRoundsWon}`,
  playerRoundsWon,
  aiRoundsWon,
  playerChoked: playerRounds.some((r: any) => r.choke),
  aiChoked: aiRounds.some((r: any) => r.choke),
  playerAvgCrowdReaction,
  aiAvgCrowdReaction,
  playerPeakScore,
  playerConsistencyScore,
}
```

**Missing fields for storyline triggers:**
- `streakLength`: Need to query previous battles to calculate
- `prepDaysUsed`: Need to count prep_blocks for this battle

### 3.3 Tier Calculation

Career tiers are computed based on rating and battle count:

```typescript
const TIER_THRESHOLDS: Record<CareerTier, { minRating: number; minBattles: number }> = {
  rookie: { minRating: 0, minBattles: 0 },
  rising: { minRating: 1200, minBattles: 10 },
  established: { minRating: 1500, minBattles: 25 },
  elite: { minRating: 1800, minBattles: 50 },
  legend: { minRating: 2100, minBattles: 100 }
}

// Calculated by checking tiers from highest to lowest
function calculateTier(rating: number, totalBattles: number): CareerTier {
  for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
    const tier = TIER_ORDER[i]
    const threshold = TIER_THRESHOLDS[tier]
    if (rating >= threshold.minRating && totalBattles >= threshold.minBattles) {
      return tier
    }
  }
  return 'rookie'
}
```

## 4. Integration Code Example

### 4.1 Complete Integration Function

Add to `run-due-battles/route.ts` after line 208:

```typescript
/**
 * Check storyline triggers and start any that fire
 */
async function checkAndStartStorylines(
  supabase: any,
  battlerId: string,
  battleContext: {
    battleId: string
    winnerId: string
    playerBattlerId: string
    result: string
    playerRoundsWon: number
    aiRoundsWon: number
    playerChoked: boolean
    playerAvgCrowdReaction: number
    playerPeakScore: number
    playerConsistencyScore: number
  }
): Promise<void> {
  try {
    // 1. Calculate streak length
    const { data: recentBattles } = await supabase
      .from('battles')
      .select('winner_battler_id, created_at')
      .or(`battler_player_id.eq.${battlerId},battler_opponent_id.eq.${battlerId}`)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10)

    let streakLength = 0
    let lastOutcomeWasWin: boolean | null = null

    for (const battle of recentBattles || []) {
      const won = battle.winner_battler_id === battlerId

      if (lastOutcomeWasWin === null) {
        // First battle
        lastOutcomeWasWin = won
        streakLength = 1
      } else if (lastOutcomeWasWin === won) {
        // Streak continues
        streakLength++
      } else {
        // Streak broken
        break
      }
    }

    // 2. Count prep days used
    const { count: prepDaysUsed } = await supabase
      .from('prep_blocks')
      .select('*', { count: 'exact', head: true })
      .eq('battle_id', battleContext.battleId)
      .eq('battler_id', battlerId)

    // 3. Build battle context for storyline engine
    const storylineBattleContext = {
      won: battleContext.winnerId === battlerId,
      score: battleContext.result,
      wasChoke: battleContext.playerChoked,
      streakLength,
      prepDaysUsed: prepDaysUsed || 0
    }

    // 4. Create storyline engine instance
    const { createStorylineEngine } = await import('@/lib/game/storylineEngine')
    const engine = createStorylineEngine(supabase)

    // 5. Check which storylines trigger
    const triggered = await engine.checkStorylineTriggers(
      battlerId,
      storylineBattleContext
    )

    // 6. Start each triggered storyline
    for (const template of triggered) {
      console.log(`Starting storyline: ${template.code} for battler ${battlerId}`)

      const result = await engine.startStoryline(
        battlerId,
        template.code,
        battleContext.battleId  // Link to triggering battle
      )

      if (result) {
        console.log(`  ✓ Created storyline ${result.storylineId} with event ${result.eventId}`)
      } else {
        console.warn(`  ✗ Failed to start storyline ${template.code}`)
      }
    }

    if (triggered.length === 0) {
      console.log(`No storylines triggered for battler ${battlerId}`)
    }

  } catch (error) {
    console.error('Error checking storyline triggers:', error)
    // Don't throw - storyline failures shouldn't break battle simulation
  }
}
```

### 4.2 Call Site Integration

In `run-due-battles/route.ts`, modify the post-battle section:

```typescript
// Existing code (line ~200)
if (playerContext) {
  await evaluatePostBattleEvents(supabase, battleContext, playerContext);
}

// ADD THIS: Check and start storylines
await checkAndStartStorylines(supabase, battle.battler_player_id, battleContext);

// Continue with existing code
await updateBattlerStress(supabase, battle.battler_player_id);
```

### 4.3 Error Handling

The integration includes comprehensive error handling:

1. **Non-breaking**: Storyline failures don't stop battle simulation
2. **Logging**: All trigger evaluations logged to console
3. **Try-catch**: Wrapped in try-catch with graceful degradation
4. **Silent failures**: Missing data (relationships table) handled gracefully

### 4.4 Performance Considerations

**Database Queries:**
- 8 queries per trigger check per battler
- Queries are lightweight (counts, single rows)
- Most queries hit indexed columns (battler_id, battle_id)
- Recent battles limited to 10 rows

**Optimization Opportunities:**
1. Cache evaluation context between triggers (single battler)
2. Batch storyline starts if multiple trigger
3. Use database views for complex queries
4. Consider denormalizing streak data

**Expected Performance:**
- ~50-100ms per trigger evaluation
- Additional 50ms per storyline start
- Total overhead: 100-200ms per battle (acceptable)

## 5. Testing Strategy

### 5.1 Unit Testing

Test individual trigger types:

```typescript
// Test random trigger
const randomTrigger: StorylineTrigger = {
  type: 'random',
  probability: 1.0,  // Always trigger for test
  conditions: { min_battles: 5 }
}

// Test compound trigger
const compoundTrigger: StorylineTrigger = {
  type: 'compound',
  probability: 1.0,
  conditions: {
    all: [
      { last_battle_had_choke: true },
      { min_tier: 'rookie' }
    ]
  }
}
```

### 5.2 Integration Testing

Test end-to-end flow:

1. Create test battler with specific attributes
2. Simulate battle with desired outcome (choke, big win, etc.)
3. Verify correct storylines trigger
4. Verify storyline records created in database
5. Verify life event created for first chapter

### 5.3 Edge Cases to Test

**Multiple Triggers:**
- Two storylines trigger simultaneously
- Same category storylines (should only start one at a time)
- Verify no duplicate active storylines

**Missing Data:**
- Battler with no battles (career start)
- Battler with no badges
- Battler with no relationships table

**Boundary Conditions:**
- Exactly at tier threshold (rising = 1200 rating, 10 battles)
- Streak of exactly required length
- Probability of 0.0 and 1.0

**State Management:**
- Storyline already active (should skip)
- Storyline recently completed (check cooldown if implemented)
- Multiple active storylines in different categories

### 5.4 Manual Testing Scenarios

**Scenario 1: VIRAL_CHOKE**
1. Create battler with resilience = 3 (high choke chance)
2. Battle with rating 1300, 10 battles (rising tier)
3. Verify choke occurs in simulation
4. Verify VIRAL_CHOKE triggers after battle
5. Check life event created with correct chapter

**Scenario 2: CAREER_EXPOSED**
1. Create battler with career_public = false
2. Battle 12 times
3. Win 13th battle by 3-0 (big win)
4. Verify CAREER_EXPOSED has 25% chance to trigger
5. Run multiple times to verify probability

**Scenario 3: FAMILY_DRAMA**
1. Create battler with family_bond = 6
2. Battle 5+ times
3. Verify 12% trigger chance per battle
4. Track trigger rate over 100 simulations

## 6. Future Enhancements

### 6.1 Storyline Cooldowns

Prevent same storyline from triggering too frequently:

```typescript
interface StorylineTemplate {
  // ... existing fields
  cooldown_battles?: number  // Can't retrigger for N battles
  cooldown_days?: number     // Can't retrigger for N days
}
```

Implementation:
- Check `storyline_completions` table for last completion
- Compare time/battles since completion
- Skip trigger if in cooldown period

### 6.2 Sequel Triggers

Storylines that unlock after completing prerequisites:

```typescript
interface StorylineTrigger {
  // ... existing fields
  requires_completed?: string[]  // Storyline codes that must be completed
  blocks_if_completed?: string[] // Storyline codes that block this
}
```

Example: "Federal Investigation" sequel only available after completing "Legal Troubles" with specific endings.

### 6.3 Contextual Weight Modifiers

Adjust trigger probability based on recent events:

```typescript
interface StorylineTrigger {
  // ... existing fields
  probability_modifiers?: {
    recent_choke?: number      // +/- if choked in last 3 battles
    recent_big_win?: number    // +/- if big win in last 3 battles
    low_family_bond?: number   // +/- if family_bond < 4
  }
}
```

### 6.4 Multi-Battler Storylines

Storylines involving AI opponents or other players:

```typescript
interface StorylineTrigger {
  // ... existing fields
  requires_opponent?: {
    min_rating?: number
    has_badge?: string[]
    is_rival?: boolean
  }
}
```

Example: Rivalry storylines that only trigger when battling specific opponents.

### 6.5 Dynamic Probability

Adjust probability based on game state:

```typescript
// Example: FAMILY_DRAMA more likely if family_bond is very low
function calculateDynamicProbability(
  baseProbability: number,
  conditions: TriggerConditions,
  context: TriggerEvaluationContext
): number {
  let modifier = 1.0

  if (conditions.max_attribute?.family_bond) {
    const familyBond = context.battlerAttributes.family_bond || 5
    if (familyBond < 3) modifier *= 2.0  // Double chance if neglecting family
    if (familyBond < 1) modifier *= 3.0  // Triple if severely neglected
  }

  return Math.min(1.0, baseProbability * modifier)
}
```

## 7. Database Schema Requirements

### 7.1 Required Tables

**Existing tables used by trigger system:**

```sql
-- Storyline templates (stored as JSON files currently)
CREATE TABLE storyline_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  min_chapters INT,
  max_chapters INT,
  trigger_config JSONB,
  chapters JSONB,
  endings JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Active storyline instances
CREATE TABLE active_storylines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID REFERENCES battlers(id) ON DELETE CASCADE,
  template_code VARCHAR(50) NOT NULL,
  current_chapter_id VARCHAR(50),
  status VARCHAR(20) CHECK (status IN ('active', 'completed', 'abandoned')),
  choices_made JSONB DEFAULT '[]'::jsonb,
  ending_id VARCHAR(50),
  ending_type VARCHAR(20),
  next_chapter_available_at TIMESTAMP,
  next_chapter_deadline TIMESTAMP,
  started_at TIMESTAMP DEFAULT now(),
  ended_at TIMESTAMP,
  total_prep_days_lost INT DEFAULT 0,
  narrative_summary TEXT,
  UNIQUE(battler_id, template_code, status) -- Only one active instance per battler per template
);

-- Life events (where chapters appear)
CREATE TABLE battler_life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID REFERENCES battlers(id) ON DELETE CASCADE,
  template_code VARCHAR(50),  -- NULL for storyline chapters
  battle_id UUID REFERENCES battles(id),
  status VARCHAR(20) CHECK (status IN ('pending', 'resolved', 'expired')),
  storyline_id UUID REFERENCES active_storylines(id) ON DELETE CASCADE,
  chapter_id VARCHAR(50),
  prep_days_cost INT DEFAULT 0,
  is_storyline_chapter BOOLEAN DEFAULT false,
  details_json JSONB,
  created_at TIMESTAMP DEFAULT now(),
  resolved_at TIMESTAMP
);

-- Badges earned
CREATE TABLE battler_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID REFERENCES battlers(id) ON DELETE CASCADE,
  badge_name VARCHAR(100) NOT NULL,
  earned_at TIMESTAMP DEFAULT now(),
  source VARCHAR(50),  -- 'creation', 'storyline', 'battle', 'life_event'
  UNIQUE(battler_id, badge_name)
);

-- Rankings (for tier calculation)
CREATE TABLE rankings (
  battler_id UUID PRIMARY KEY REFERENCES battlers(id) ON DELETE CASCADE,
  rating INT DEFAULT 1000,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  streak INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now()
);

-- Storyline completions (for sequel/block logic)
CREATE TABLE storyline_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID REFERENCES battlers(id) ON DELETE CASCADE,
  storyline_code VARCHAR(50) NOT NULL,
  ending_id VARCHAR(50),
  ending_type VARCHAR(20),
  completed_at TIMESTAMP DEFAULT now(),
  narrative_data JSONB
);
```

### 7.2 Optional Tables

**For future enhancements:**

```sql
-- Relationships (rivals, allies)
CREATE TABLE battler_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID REFERENCES battlers(id) ON DELETE CASCADE,
  target_battler_id UUID REFERENCES battlers(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50),  -- 'rival', 'ally', 'mentor', etc.
  intensity INT CHECK (intensity BETWEEN 0 AND 10),
  formed_at TIMESTAMP DEFAULT now(),
  context JSONB,
  UNIQUE(battler_id, target_battler_id, relationship_type)
);

-- Event attendance tracking
CREATE TABLE event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID REFERENCES battlers(id) ON DELETE CASCADE,
  event_code VARCHAR(50) NOT NULL,
  attended_at TIMESTAMP DEFAULT now()
);
```

### 7.3 Indexes for Performance

```sql
-- Trigger evaluation indexes
CREATE INDEX idx_battles_battler_status ON battles(battler_player_id, status);
CREATE INDEX idx_battles_created_status ON battles(created_at, status) WHERE status = 'completed';
CREATE INDEX idx_storylines_battler_status ON active_storylines(battler_id, status);
CREATE INDEX idx_badges_battler ON battler_badges(battler_id);
CREATE INDEX idx_relationships_battler ON battler_relationships(battler_id);

-- Recent battles lookup
CREATE INDEX idx_battles_recent ON battles(created_at DESC, status)
  WHERE status = 'completed' AND created_at > now() - interval '14 days';
```

## 8. Key Takeaways

### ✅ Trigger System Strengths
1. **Flexible**: Supports simple random triggers and complex compound logic
2. **Powerful**: Can evaluate career history, relationships, streaks, and more
3. **Extensible**: Easy to add new condition types
4. **Well-architected**: Clear separation between trigger evaluation and storyline management

### ⚠️ Integration Considerations
1. **Timing**: Triggers evaluate AFTER battle completion but BEFORE stress/offers
2. **Performance**: 8+ database queries per trigger check - optimize as needed
3. **Error handling**: Must not break battle simulation if storyline system fails
4. **State management**: Prevent duplicate active storylines in same category

### 🎯 Implementation Priority
1. **HIGH**: Integrate `checkStorylineTriggers()` into battle flow
2. **HIGH**: Add streak calculation to battle context
3. **MEDIUM**: Add cooldown system to prevent spam
4. **MEDIUM**: Create admin tools to test trigger conditions
5. **LOW**: Add dynamic probability modifiers

### 📊 Testing Requirements
1. Test each trigger type individually
2. Test compound logic with nested conditions
3. Test edge cases (boundary values, missing data)
4. Test performance with 100+ simulated battles
5. Manual QA with real gameplay scenarios

---

**Document Version**: 1.0
**Last Updated**: 2025-12-11
**Author**: Claude Code Analysis
**Related Files**:
- `C:\git\battlerapuniversity\lib\game\storylineEngine.ts`
- `C:\git\battlerapuniversity\ai-battlerap\app\api\internal\run-due-battles\route.ts`
- `C:\git\battlerapuniversity\ai-battlerap\lib\game\simulation.ts`
- `C:\git\battlerapuniversity\lib\data\storylines\*.json`
