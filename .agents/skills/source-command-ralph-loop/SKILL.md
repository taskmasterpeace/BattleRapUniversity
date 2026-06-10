---
name: "source-command-ralph-loop"
description: "Ralph loop for iterative balance testing - test, fix, repeat until balanced"
---

# source-command-ralph-loop

Use this skill when the user asks to run the migrated source command `ralph-loop`.

## Command Template

# Ralph Loop - Balance Testing

Iterative balance testing loop. Run tests, find failures, fix issues, repeat until all pass.

## Balance Targets

| Metric | Target | Tolerance |
|--------|--------|-----------|
| Average battler choke rate | 7% | ±2% |
| Known Choker choke rate | 46% | ±5% |
| Stumble rate (battles with stumble) | 40% | ±5% |
| Body rate (3-0) | 20-30% | - |
| Debatable rate (2-1) | 40-50% | - |
| Upset rate | 10-20% | - |
| Archetype win rates | 45-55% | - |

## Test Suite Commands

Run these in order:

```bash
# Test 1: Comprehensive system validation (15 archetypes)
cd C:/git/battlerapuniversity && npx tsx ai-battlerap/lib/game/comprehensiveSystemValidation.ts 50

# Test 2: Choke/stumble rates (Tru Foe validation)
cd C:/git/battlerapuniversity && npx tsx ai-battlerap/lib/game/truFoeValidation.ts 50

# Test 3: Battle outcomes distribution
cd C:/git/battlerapuniversity && npx tsx ai-battlerap/lib/game/bulkValidationRunner.ts
```

## Files to Edit (in order of impact)

1. `lib/game/config.ts` - Balance constants (most impactful)
2. `lib/game/badges.ts` - Badge effects (choke modifiers, crowd bonuses)
3. `lib/game/simulation.ts` - Core formulas (if constants aren't enough)

## Process

1. **Run tests** - Execute all 3 test scripts
2. **Identify failures** - Note which metrics are off target
3. **Diagnose** - Is it a config value? Badge effect? Formula?
4. **Fix** - Make targeted adjustment
5. **Re-run tests** - Verify fix worked
6. **Repeat** - Until ALL tests pass

## Common Fixes

| Problem | Fix Location | Example |
|---------|--------------|---------|
| Choke rate too high | config.ts: PREP_SKILL_CHOKE_BASE | Reduce from 0.12 to 0.10 |
| Choke rate too low | config.ts: CHOKE_MINIMUM | Increase floor |
| Known Choker not choking enough | badges.ts: chokeIncrease | Increase from 0.07 |
| Stumbles too frequent | config.ts: STUMBLE_BASE_PROBABILITY | Reduce from 0.05 |
| Body rate too high | config.ts: SEGMENT_VARIANCE | Increase variance |
| Crowd bias too strong | config.ts: REPUTATION_CROWD_BIAS_FACTOR | Reduce from 0.02 |

## Success Criteria

ALL of these must pass:
- [ ] comprehensiveSystemValidation: 70%+ pass rate
- [ ] truFoeValidation: 7% avg choke, 46% choker, 40% stumble
- [ ] bulkValidationRunner: 20-30% body, 40-50% debatable

When complete, output: **BALANCED - All tests passing**

## Usage

```
/ralph-loop
```

Run this skill repeatedly until all balance targets are met.
