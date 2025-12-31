# Badge System Quick Reference

## For Developers

### How to Use Badge Effects in Code

```typescript
import { calculateBadgeEffects } from '@/lib/game/badges';

// Get battler's style_tags
const styleTags = ['Freestyle Genius', 'Rebuttal King/Queen'];

// Calculate combined effects
const badgeEffects = calculateBadgeEffects(styleTags);

// Use in simulation
const writingBoost = prep.writingDays * 0.10 * badgeEffects.writingPrepEfficiency;
const modifiedLyricism = baseLyricism * badgeEffects.lyricismMultiplier;
```

### Adding New Badges

Edit `lib/game/badges.ts`:

```typescript
export const BADGE_REGISTRY: Record<string, Partial<BadgeEffects>> = {
  'New Badge Name': {
    // Prep efficiency (1.0 = normal, >1 = bonus, <1 = penalty)
    writingPrepEfficiency: 1.2,       // +20% writing prep
    performancePrepEfficiency: 0.8,   // -20% performance prep

    // Attribute multipliers (1.0 = normal)
    lyricismMultiplier: 1.3,          // +30% lyricism

    // Special mechanics
    chokeReduction: 0.02,             // -2% choke chance
    peakBonus: 0.15,                  // +15% peak multiplier
    crowdReactionBonus: 10,           // +10 crowd reaction

    // Prep patterns
    lowPrepBonus: true,               // Benefits from ≤3 prep days

    // League preference
    smallRoomBonus: 0.05,             // +5% in Small Room
  },
};
```

### Adding Badge Synergies

```typescript
export const BADGE_SYNERGIES: Record<string, string[]> = {
  'New Badge': ['Compatible Badge 1', 'Compatible Badge 2'],
};
```

### Adding Badge Conflicts

```typescript
export const BADGE_CONFLICTS: Record<string, string[]> = {
  'New Badge': ['Conflicting Badge 1', 'Conflicting Badge 2'],
};
```

## For Game Designers

### Badge Effect Values Guide

#### Prep Efficiency
- **Strong penalty**: 0.5 - 0.7 (Lazy Writer, Freestyler writing)
- **Mild penalty**: 0.8 - 0.9
- **Normal**: 1.0
- **Mild bonus**: 1.1 - 1.3 (most positive badges)
- **Strong bonus**: 1.4 - 1.6 (Angle Master research, Technical writing)

#### Attribute Multipliers
- **Penalty**: 0.7 - 0.9 (negative badges)
- **Normal**: 1.0
- **Mild bonus**: 1.1 - 1.2 (most badges)
- **Strong bonus**: 1.3 - 1.4 (signature badges like Wordplay Wizard)
- **Very strong**: 1.5+ (Pen Game Elite stacking)

#### Choke Modifiers
- **Strong reduction**: -0.04 to -0.03 (Clutch, Resilient)
- **Mild reduction**: -0.02 to -0.01
- **Normal**: 0
- **Mild increase**: +0.01 to +0.02
- **Strong increase**: +0.03 to +0.06 (Choker, Underprepared)

#### Peak Bonuses
- **Mild**: +0.10 (10% boost)
- **Standard**: +0.15 (15% boost)
- **Strong**: +0.20 (20% boost - Angle Master)

#### Consistency Modifiers
- **Strong penalty**: -1.5 to -2.0 (Freestyler, Inconsistent)
- **Mild penalty**: -0.5 to -1.0
- **Normal**: 0
- **Mild bonus**: +0.5 to +1.0
- **Strong bonus**: +1.5 to +2.0 (Consistent Writer)

#### Crowd Reaction Bonuses
- **Strong penalty**: -15 to -10 (Crowd Killer, Choker)
- **Mild penalty**: -8 to -5
- **Normal**: 0
- **Mild bonus**: +5 to +8
- **Strong bonus**: +10 to +15 (Crowd Favorite, Comedy)
- **Very strong**: +20+ (multiple stacking)

#### Variance Multipliers
- **Very consistent**: 0.5 - 0.7
- **Consistent**: 0.8 - 0.9
- **Normal**: 1.0
- **Inconsistent**: 1.3 - 1.5 (Freestyler)
- **Very inconsistent**: 1.6 - 2.0 (Inconsistent Performer)

### Prep Pattern Thresholds

```typescript
// Low Prep Bonus
if (totalPrep <= 3 && effects.lowPrepBonus) {
  return 0.15; // +15% to all stats
}

// High Prep Bonus
if (totalPrep >= 8 && effects.highPrepBonus) {
  return 0.12; // +12% to all stats
}

// Balanced Prep Bonus
if (categoriesUsed >= 3 && effects.balancedPrepBonus) {
  return 0.10; // +10% to all stats
}
```

### League Bonuses

```typescript
// Small Room Circuit (2-min rounds)
smallRoomBonus: 0.05,  // +5% typical range

// Main Stage Arena (3-min rounds)
mainStageBonus: 0.10,  // +10% typical range
```

## Common Badge Archetypes

### Freestyler Build
```typescript
badges: ['Freestyle Genius', 'Rebuttal King/Queen', 'Unorthodox']
optimal_prep: 0-3 days total
strengths: Low prep, high creativity, clutch, unpredictable
weaknesses: Low consistency, writing penalty
```

### Technical Writer Build
```typescript
badges: ['Scheme Specialist', 'Multisyllabic Master', 'Pen Game Elite']
optimal_prep: 8+ days total
strengths: Maxed writing stats, very consistent
weaknesses: Requires extensive prep, weaker performance
```

### Performance Build
```typescript
badges: ['Stage Domination', 'Charismatic', 'Crowd Favorite']
optimal_prep: Heavy performance focus
strengths: Maxed performance, huge crowd reaction
weaknesses: Lower writing stats
```

### Angle Hunter Build
```typescript
badges: ['Angle Master', 'Battle Technician', 'Personal Attacks']
optimal_prep: Max research, balanced across categories
strengths: Massive research efficiency, devastating peaks
weaknesses: Lower wordplay
```

### Comedy Build
```typescript
badges: ['Comedy', 'Charismatic', 'Impersonations']
optimal_prep: Balanced with rest emphasis
strengths: High crowd control, benefits from rest
weaknesses: Conflicts with aggressive styles
```

## Testing Your Changes

```bash
# Run the test suite
cd ai-battlerap
node test-badges.js

# Look for:
# - Expected efficiency percentages
# - Attribute multipliers working
# - Prep pattern bonuses activating
# - Synergies/conflicts detected
```

## Common Patterns

### Creating a Specialist Badge
Focus one attribute, penalize others:
```typescript
'Wordplay Specialist': {
  wordplayMultiplier: 1.4,        // Signature bonus
  writingPrepEfficiency: 1.2,     // Works harder at it
  lyricismMultiplier: 0.9,        // Slightly weaker elsewhere
  creativityMultiplier: 0.9,
}
```

### Creating a Clutch Badge
Reduce choke, boost pressure situations:
```typescript
'Ice in Veins': {
  chokeReduction: 0.04,           // Very clutch
  restEfficiency: 1.2,            // Stays calm
  consistencyBonus: 0.5,          // Steady under pressure
}
```

### Creating a Flashy Badge
High peaks, low consistency:
```typescript
'Haymaker Specialist': {
  peakBonus: 0.20,                // Big moments
  consistencyPenalty: 1.0,        // Inconsistent
  segmentVarianceMultiplier: 1.4, // Unpredictable
  crowdReactionBonus: 8,          // Crowd loves it
}
```

### Creating a League-Specific Badge
Excels in one format:
```typescript
'Small Room Assassin': {
  smallRoomBonus: 0.12,           // Dominant in small rooms
  mainStageBonus: -0.05,          // Weaker on big stages
  creativityMultiplier: 1.2,      // Intimate creativity
}
```

## Badge Naming Conventions

- Positive badges: Use aspirational names (King/Queen, Master, Elite)
- Negative badges: Use descriptive penalties (Choker, Lazy, Mumbler)
- Neutral/style badges: Use descriptive style (Aggressive, Theatrical, Comedy)
- Avoid overly generic names that don't convey the effect

## Balance Checklist

When adding/modifying badges:

- [ ] Does it create a unique playstyle?
- [ ] Are there meaningful trade-offs?
- [ ] Is it synergistic with some badges?
- [ ] Does it conflict with others?
- [ ] Is the effect magnitude appropriate? (see guide above)
- [ ] Does it favor a specific prep pattern?
- [ ] Does it have a clear use case?
- [ ] Can it be countered?
- [ ] Is it more powerful than existing badges? (avoid power creep)
- [ ] Test with various prep amounts (0, 3, 5, 8, 10 days)

## Files to Modify

```
lib/game/badges.ts           - Badge definitions and logic
lib/game/simulation.ts       - Already integrated, no changes needed
test-badges.js              - Add test scenarios for new badges
BADGE_SYSTEM_DOCUMENTATION.md - Update documentation
```

## Quick Math Examples

### Example 1: Writing Prep Effectiveness

```typescript
// Base: 5 lyricism, 4 writing prep days
const baseLyricism = 5;
const writingDays = 4;
const prepMultiplier = 0.10; // CONFIG constant

// Without badge
const gain = writingDays * prepMultiplier; // 0.4
const result = baseLyricism + gain; // 5.4

// With Scheme Specialist (1.3x efficiency, 1.25x multiplier)
const gainWithBadge = writingDays * prepMultiplier * 1.3; // 0.52
const resultWithMultiplier = (baseLyricism + gainWithBadge) * 1.25; // 6.9

// Impact: 5.0 → 5.4 (normal) vs 5.0 → 6.9 (with badge)
```

### Example 2: Prep Pattern Bonus

```typescript
// Freestyle Genius with 3 prep days
const totalPrep = 3;
const lowPrepBonus = 0.15; // +15%

// Writing goes from 6.0 to 6.9
const withBonus = 6.0 * (1 + lowPrepBonus); // 6.9

// Same freestyle with 10 prep days
const totalPrep = 10;
const noBonus = 0; // No bonus, just penalty

// Writing stuck at 6.0 (or worse due to low efficiency)
```

### Example 3: Choke Calculation

```typescript
// Base choke
const baseChoke = 0.03; // 3%
const resilience = 5;
const chokeResilienceFactor = 0.025;
const prepDays = 6;
const chokePrepReduction = 0.01;

// Normal battler
let choke = 0.03 - (5 * 0.025) - (6 * 0.01);
// = 0.03 - 0.125 - 0.06 = -0.155 → 0% (clamped)

// Known Choker (+0.06)
choke = 0.03 - (5 * 0.025) - (6 * 0.01) + 0.06;
// = 0.03 - 0.125 - 0.06 + 0.06 = -0.095 → 0% (still clamped)

// Known Choker with low prep (3 days)
choke = 0.03 - (5 * 0.025) - (3 * 0.01) + 0.06;
// = 0.03 - 0.125 - 0.03 + 0.06 = -0.065 → 0%

// Known Choker with low resilience (3) and low prep (2)
choke = 0.03 - (3 * 0.025) - (2 * 0.01) + 0.06;
// = 0.03 - 0.075 - 0.02 + 0.06 = -0.005 → 0%

// No-show Known Choker (3x multiplier)
choke = (0.03 - (3 * 0.025) - (0 * 0.01) + 0.06) * 3;
// = (0.03 - 0.075 + 0.06) * 3 = 0.015 * 3 = 0.045 = 4.5%
```

## API Reference

### Main Functions

```typescript
// Calculate combined badge effects
calculateBadgeEffects(styleTags: string[]): BadgeEffects

// Get prep pattern bonus
calculatePrepPatternBonus(prep: PrepProfile, effects: BadgeEffects): number

// Get league-specific bonus
getLeagueBonus(leagueRoundLength: number, effects: BadgeEffects): number

// Get human-readable descriptions
describeBadgeEffects(styleTags: string[]): string[]
```

### Helper Functions (Internal)

```typescript
// Count synergies
countSynergies(styleTags: string[]): number

// Count conflicts
countConflicts(styleTags: string[]): number

// Check prep pattern bonuses
hasLowPrepBonus(effects: BadgeEffects): boolean
hasHighPrepBonus(effects: BadgeEffects): boolean
hasBalancedPrepBonus(effects: BadgeEffects): boolean
```

## Support & Questions

For implementation questions, see:
- `BADGE_SYSTEM_DOCUMENTATION.md` - Full system documentation
- `BADGE_IMPLEMENTATION_SUMMARY.md` - Implementation details and test results
- `lib/game/badges.ts` - Source code with inline comments
- `test-badges.js` - Working examples and test cases
