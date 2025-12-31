# Game Logic Modules

This directory contains the core game logic for the Battle Rap University simulation.

## Modules

### simulation.ts
The main battle simulation engine.

**Key Functions**:
- `simulateBattle(battleId, supabase)` - Simulates a complete 3-round battle
- Handles prep modifiers, segment scoring, round calculations
- Updates rankings using ELO
- Triggers news generation and attribute progression

**Flow**:
1. Load battle, league, and battler data
2. Build prep profiles
3. Apply prep modifiers to attributes
4. Simulate 3 rounds (4 or 6 segments each)
5. Determine winner
6. Save results to database
7. Update rankings
8. Generate news articles
9. Apply attribute progression

### progression.ts
Handles attribute improvements after battles.

**Key Functions**:
- `applyAttributeProgression(battleId, supabase)` - Analyzes performance and improves attributes

**Criteria**:
- High writing performance → +writing attributes
- High crowd reaction → +performance attributes
- No chokes → +resilience
- Haymaker moments → +creativity bonus
- Winner bonus → small boost to all
- Loser penalty → 50% reduced gains

**Configuration**: All values tunable in `PROGRESSION_CONFIG`

### getPlayerBattler.ts
Helper for retrieving player's battler data.

**Key Functions**:
- `getPlayerBattler(userId, supabase)` - Gets player's battler with full details

## Data Flow

```
Battle Accepted
    ↓
Prep Planning (player chooses daily focus)
    ↓
Battle Scheduled
    ↓
Simulation Triggered (via cron or manual API call)
    ↓
simulateBattle()
    ├→ Load Data
    ├→ Apply Prep Modifiers
    ├→ Simulate Rounds
    ├→ Calculate Winner
    ├→ Save Results
    ├→ Update Rankings (ELO)
    ├→ Generate News (newsGenerator.ts)
    └→ Apply Progression (progression.ts)
    ↓
Battle Completed
```

## Configuration

All tunable values are in configuration objects:

### simulation.ts - CONFIG
```typescript
PREP_EFFECT_MULTIPLIER: 0.15    // Prep impact on stats
CHOKE_BASE_PROBABILITY: 0.05    // Base choke chance
PEAK_PROBABILITY: 0.15          // Haymaker chance
SEGMENT_VARIANCE: 0.2           // Score randomness
RATING_K_FACTOR: 32             // ELO K-factor
```

### progression.ts - PROGRESSION_CONFIG
```typescript
HIGH_SCORE_THRESHOLD: 7.0       // Writing bonus threshold
HIGH_CROWD_THRESHOLD: 75        // Performance bonus threshold
HAYMAKER_THRESHOLD: 8.5         // Peak score for bonus
BASE_WRITING_GAIN: 0.05         // Writing improvement
BASE_PERFORMANCE_GAIN: 0.05     // Performance improvement
WINNER_BONUS: 0.02              // Win bonus
LOSER_PENALTY: 0.5              // Loss penalty
ATTRIBUTE_CAP: 10.0             // Max attribute
MAX_TOTAL_GAIN: 0.3             // Max per battle
```

## Testing

Run tests for game logic:

```bash
# All game tests
npm test -- __tests__/unit/simulation.test.ts
npm test -- __tests__/unit/progression.test.ts

# Specific test
npm test -- progression.test.ts
```

## Future Enhancements

Potential additions:

1. **Badge System**: Award badges based on performance
2. **Rivalry System**: Track battles between same opponents
3. **Tournament Mode**: Bracket-based multi-battle events
4. **Training Mode**: Practice battles that don't affect ranking
5. **Difficulty Scaling**: Adjust AI difficulty based on player tier
6. **Simulation Replays**: Save and replay battle simulations
7. **Custom Battle Rules**: Different rulesets per league
8. **Team Battles**: 2v2 or tag team formats

## Related Documentation

- `/PROGRESSION_SYSTEM.md` - Detailed progression docs
- `/PROGRESSION_TESTING.md` - Testing guide
- `/GAME_LOOP_COMPLETE.md` - Full game loop documentation
- `/Doc2.txt` - Master build specification
