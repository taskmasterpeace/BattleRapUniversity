# Balance Tuning Summary

## Validation Iterations

### Validation v1 (Initial Fixes)
**Config**:
- CHOKE_BASE_PROBABILITY: 0.02
- CHOKE_RESILIENCE_FACTOR: 0.015
- CHOKE_PREP_REDUCTION: 0.008
- CHOKE_MINIMUM: 0.02
- ATTRIBUTE_GAP_HUGE_MULTIPLIER: 1.20
- ATTRIBUTE_GAP_MEDIUM_MULTIPLIER: 1.12
- SEGMENT_VARIANCE: 0.35

**Results**:
- Choke rate: **43%** (target: 5-15%) ❌
- Body rate: **53%** (target: 20-30%) ❌
- Debatable rate: **10%** (target: 40-50%) ❌
- Upset rate: **4%** (target: 10-20%) ❌

**Improvement from v0**: Choke rate dropped from 78% to 43% (-35pp)

### Validation v2 (Aggressive Adjustments)
**Config Changes**:
- CHOKE_BASE_PROBABILITY: 0.02 → **0.01** (50% reduction)
- ATTRIBUTE_GAP_HUGE_MULTIPLIER: 1.20 → **1.15**
- ATTRIBUTE_GAP_MEDIUM_MULTIPLIER: 1.12 → **1.10**
- SEGMENT_VARIANCE: 0.35 → **0.45**

**Results**:
- Choke rate: **48%** (target: 5-15%) ❌ **INCREASED!**
- Body rate: **51%** (target: 20-30%) ❌
- Debatable rate: **13%** (target: 40-50%) ❌
- Upset rate: **7%** (target: 10-20%) ❌

**Critical Finding**: Choke rate **INCREASED** from 43% to 48% despite reducing the base probability. This is backwards.

## Root Cause Analysis

### Issue 1: CHOKE_MINIMUM Overrides Base
- CHOKE_BASE_PROBABILITY = 0.01 (1%)
- CHOKE_MINIMUM = 0.02 (2%)
- Since minimum > base, the floor is **always** applied
- This means reducing the base from 0.02 to 0.01 has **no effect** on most battlers

### Issue 2: 60-85% Choke Rates in Low Tier Scenarios
Looking at specific scenarios:
- "Top Balanced vs Low Balanced (Small Room)": **85.7% chokes** (6/7 battles)
- "Mid Writer vs Low Writer (Small Room)": **71.4% chokes** (5/7 battles)
- "God Writer vs Low Writer (Small Room)": **60% chokes** (3/5 battles)

**This is impossible** with a 2% choke threshold. Even with two battlers:
- Probability neither chokes: 0.98² = 96%
- Probability at least one chokes: 4%

But we're seeing **60-85%** of battles with chokes.

### Issue 3: Low Tier Battlers Can't Reduce Choke
Low tier battlers have:
- **Resilience 5** (average) → 0 reduction (formula: max(0, resilience-5))
- **4 prep days** → 0.032 reduction
- **Total choke probability**: 0.01 - 0.032 = -0.022 → floored to 0.02 (2%)

They're at the minimum no matter what.

### Issue 4: Attribute Gap Multipliers Too Strong
Even after reducing to 1.15x and 1.10x:
- "God Writer vs Low Writer" scenarios still produce **100% body rate**
- "Mid vs Low" scenarios produce **85.7% body rate** (target: 15-35%)

The multipliers amplify attribute advantages so much that outcomes become deterministic.

### Issue 5: Variance Increase Not Helping
Increasing SEGMENT_VARIANCE from 0.25 to 0.45 only improved debatable rate from 10% to 13% (target: 40-50%). Need even more variance or different approach.

## Potential Bugs

1. **Choke rate increasing when base decreases**: This suggests the choke logic may have a bug, or there's badge/event modifiers being applied that we're not seeing.

2. **60-85% choke rates with 2% threshold**: Something is drastically wrong. Possible causes:
   - Choke probability being interpreted as percentage (0-100) instead of decimal (0-1)
   - Multiple chokes per battle being counted
   - Badge effects adding +50-80% choke chance (not visible in test battler configs)

3. **Prep reduction formula**: The formula `(writingDays + performanceDays) * 0.008` gives 0.032 reduction for 4 days, which EXCEEDS the 0.01 base. This creates negative probabilities that get floored to the minimum.

## Recommendations

### Immediate Fixes (High Priority)
1. **Lower CHOKE_MINIMUM to 0.001** (0.1%) to stop overriding the base
2. **Set CHOKE_BASE_PROBABILITY to 0.005** (0.5%) to account for prep reductions
3. **Remove attribute gap multipliers entirely** (set both to 1.0) to see baseline behavior
4. **Increase SEGMENT_VARIANCE to 0.60** (±60%) for much more overlap

### Medium Term (If Above Doesn't Work)
1. **Investigate choke logic for bugs**:
   - Add debug logging to see actual choke probabilities
   - Verify Math.random() comparison is correct
   - Check if badges are being applied invisibly

2. **Redesign attribute gap system**:
   - Instead of multipliers, use additive bonuses (+10% per point advantage)
   - Cap maximum advantage at ±30%

3. **Increase prep impact**:
   - Double PREP_EFFECT_MULTIPLIER from 0.10 to 0.20
   - Make prep more meaningful for upsets

### Long Term (Architectural Changes)
1. **Separate choke systems for player vs AI**:
   - Players: 2-10% choke range
   - AI: 5-15% choke range
   - Different formulas prevent scenarios like "85.7% choke rate"

2. **Implement diminishing returns** on attribute advantages:
   - First 2 points: 10% each
   - Points 3-4: 5% each
   - Points 5+: 2% each

3. **Add variance to prep quality**:
   - Same prep days shouldn't always give same reduction
   - Roll effectiveness: 0.5x to 1.5x normal impact

## Next Steps

Try validation v3 with immediate fixes:
```typescript
CHOKE_BASE_PROBABILITY: 0.005
CHOKE_MINIMUM: 0.001
CHOKE_RESILIENCE_FACTOR: 0.015
CHOKE_PREP_REDUCTION: 0.008
ATTRIBUTE_GAP_HUGE_MULTIPLIER: 1.0  // REMOVED
ATTRIBUTE_GAP_MEDIUM_MULTIPLIER: 1.0  // REMOVED
SEGMENT_VARIANCE: 0.60
```

If choke rate is still 40%+, there's definitely a bug in the simulation code that needs investigation.

## Test Battler Prep Allocation

For reference, the bulk validation uses "balanced" prep:
- 7 total days
- 3 writing days (days 2, 5, 7)
- 1 performance day (day 3)
- 1 research day (days 1, 6)
- 1 rest day (day 4)
- **Total choke reduction**: 4 days × 0.008 = 0.032 (3.2%)

This means most battlers end up with negative choke probability before the floor is applied, which is why CHOKE_MINIMUM dominates everything.
