# Attribute Progression System

## Overview

The attribute progression system automatically improves a player's battler attributes after each completed battle based on their performance. This creates a sense of growth and rewards consistent good performance.

## How It Works

After each battle is completed and simulated, the system:

1. Analyzes battle performance across all rounds
2. Calculates attribute improvements based on performance criteria
3. Applies improvements to the player's battler (capped at 10.0)
4. Updates the database with new attribute values

## Performance Criteria

### Writing Attributes (Lyricism, Wordplay, Creativity)
- **Trigger**: Average score across rounds >= 7.0
- **Base Gain**: +0.05 to each writing attribute
- **Why**: Rewards strong technical performance

### Performance Attributes (Stage Presence, Crowd Control, Delivery)
- **Trigger**: Average crowd reaction >= 75%
- **Base Gain**: +0.05 to each performance attribute
- **Why**: Rewards ability to engage the crowd

### Resilience
- **Trigger**: No choke in any round
- **Base Gain**: +0.05
- **Why**: Rewards consistency and mental fortitude

### Haymaker Bonus
- **Trigger**: Peak score in any round >= 8.5
- **Creativity Gain**: +0.1
- **Wordplay Gain**: +0.05
- **Why**: Rewards ability to create standout moments

### Winner Bonus
- **Trigger**: Win the battle
- **Gain**: +0.02 to all attributes
- **Why**: Rewards overall success

### Loser Penalty
- **Penalty**: All gains reduced by 50%
- **Why**: Still rewards improvement, but at a slower pace for losses

## Configuration

All progression values are tunable in `lib/game/progression.ts`:

```typescript
const PROGRESSION_CONFIG = {
  HIGH_SCORE_THRESHOLD: 7.0,        // Score threshold for writing bonus
  HIGH_CROWD_THRESHOLD: 75,         // Crowd % for performance bonus
  HAYMAKER_THRESHOLD: 8.5,          // Peak score for haymaker bonus
  BASE_WRITING_GAIN: 0.05,          // Writing attribute improvement
  BASE_PERFORMANCE_GAIN: 0.05,      // Performance attribute improvement
  BASE_RESILIENCE_GAIN: 0.05,       // Resilience improvement
  WINNER_BONUS: 0.02,               // Bonus for winning
  HAYMAKER_BONUS: 0.1,              // Creativity bonus for haymaker
  LOSER_PENALTY: 0.5,               // Multiplier for losing (50%)
  ATTRIBUTE_CAP: 10.0,              // Maximum attribute value
  MAX_TOTAL_GAIN: 0.3,              // Maximum total gain per battle
};
```

## Example Scenarios

### Scenario 1: Dominant Win
**Performance**:
- Average score: 8.2
- Average crowd reaction: 85%
- Peak score: 9.5
- No chokes
- Result: Won

**Gains**:
- Lyricism: +0.07 (0.05 base + 0.02 winner)
- Wordplay: +0.12 (0.05 base + 0.05 haymaker + 0.02 winner)
- Creativity: +0.17 (0.05 base + 0.10 haymaker + 0.02 winner)
- Stage Presence: +0.07 (0.05 base + 0.02 winner)
- Crowd Control: +0.07 (0.05 base + 0.02 winner)
- Delivery: +0.07 (0.05 base + 0.02 winner)
- Resilience: +0.07 (0.05 base + 0.02 winner)

**Total**: ~0.74 before capping → scaled to 0.3 max

### Scenario 2: Close Loss
**Performance**:
- Average score: 6.5
- Average crowd reaction: 70%
- Peak score: 7.8
- No chokes
- Result: Lost

**Gains**:
- All writing: 0 (below threshold)
- All performance: 0 (below threshold)
- Resilience: +0.025 (0.05 base × 0.5 loser penalty)

**Total**: 0.025

### Scenario 3: Poor Performance
**Performance**:
- Average score: 5.0
- Average crowd reaction: 55%
- Peak score: 6.0
- Choked in round 2
- Result: Lost

**Gains**:
- All attributes: 0 (no thresholds met)

**Total**: 0

## Integration

The progression system is automatically called after each battle simulation in `lib/game/simulation.ts`:

```typescript
// After battle completion and news generation
try {
  const { applyAttributeProgression } = await import('@/lib/game/progression');
  await applyAttributeProgression(battleId, supabase);
} catch (err) {
  console.error('Failed to apply attribute progression', err);
}
```

## Important Notes

1. **Only Human Players**: Progression only applies to human players, not AI battlers
2. **Completed Battles Only**: Progression only runs for battles with status 'completed'
3. **Idempotent**: Safe to run multiple times - checks battle status first
4. **Attribute Cap**: All attributes are hard-capped at 10.0 (god tier)
5. **Minimum Value**: Attributes cannot go below 1.0
6. **Total Cap**: Maximum 0.3 total gain per battle (prevents too rapid progression)

## Testing

Run the progression tests:

```bash
npm test -- progression.test.ts
```

Tests cover:
- High performance scenarios
- Poor performance scenarios
- Attribute capping
- Skip conditions (AI battlers, incomplete battles)

## Future Enhancements

Potential improvements for later phases:

1. **Tier-Based Scaling**: Slower progression at higher tiers
2. **Skill Decay**: Small attribute decay over time without battles
3. **Prep-Based Bonuses**: Extra gains based on prep focus matching performance
4. **Badge Unlocks**: Trigger badge awards based on progression milestones
5. **XP Tracking**: Separate XP system for UI display
6. **League-Specific Gains**: Different gain rates for different leagues
