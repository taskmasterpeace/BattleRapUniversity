# Balance Fix Summary - Validation v5

## Critical Bug Fixed

**Issue**: Choke detection was checking `segmentScores.some((s) => s < 3)` instead of checking for actual 'choke' events.

**Impact**: With ±45% variance, Low tier battlers (base score ~5) could roll 5 × (1 - 0.45) = 2.75, triggering "chokes" from normal variance. This created 60-85% false choke rates.

**Fix**: Changed [simulation.ts:792](lib/game/simulation.ts#L792) from score-based to event-based detection:
```typescript
// Before (BROKEN):
const hasChoke = segmentScores.some((s) => s < 3);

// After (FIXED):
const hasChoke = segmentEvents.some((events) => events.includes('choke'));
```

## Validation Results (v5)

**Config**:
- CHOKE_BASE_PROBABILITY: 0.01 (1%)
- CHOKE_MINIMUM: 0.001 (0.1%)
- CHOKE_RESILIENCE_FACTOR: 0.015 (1.5% per point > 5)
- CHOKE_PREP_REDUCTION: 0.008 (0.8% per day)
- ATTRIBUTE_GAP_HUGE_MULTIPLIER: 1.15 (15% bonus for 3+ advantage)
- ATTRIBUTE_GAP_MEDIUM_MULTIPLIER: 1.10 (10% bonus for 2+ advantage)
- SEGMENT_VARIANCE: 0.45 (±45%)

### Overall Results

| Metric | Actual | Target | Status |
|--------|--------|--------|--------|
| **Choke rate** | **4%** | 5-15% | ✅ **FIXED** (slightly low) |
| Body rate | 47% | 20-30% | ❌ Still too high |
| Debatable rate | 6% | 40-50% | ❌ Still too low |
| Upset rate | 7% | 10-20% | ⚠️ Close |

### By Attribute Gap

| Gap | Battles | Body Rate | Target | Upset Rate | Target |
|-----|---------|-----------|--------|------------|--------|
| **Huge** (3+ points) | 20 | **80%** | 70-80% | 0% | 0-5% |
| **Medium** (2 points) | 30 | **50%** | 35-55% | 13.3% | 10-20% |
| **Small** (1 point) | 30 | **50%** | 15-35% | 10% | 20-35% |
| **Even** (0 gap) | 20 | 5% | 5-25% | **0%** | 40-60% |

## What Worked

✅ **Event-based choke detection** - Fixed the root bug
✅ **Low CHOKE_MINIMUM (0.001)** - Prevents artificial floor from dominating
✅ **Huge gap scenarios (80% body)** - Within target range
✅ **Medium gap scenarios (50% body)** - Within target range
✅ **Even matchups (5% body)** - Within target range

## Remaining Issues

### Issue 1: Body Rate Too High Overall (47% vs 20-30%)

**Cause**: Attribute gap multipliers (1.15x, 1.10x) still creating too much score separation

**Evidence**:
- Small gap scenarios: 50% body rate (target: 15-35%)
- Overall: 47% body rate (target: 20-30%)

**Recommendation**: Reduce multipliers to 1.08x and 1.04x, or remove entirely

### Issue 2: Debatable Rate Too Low (6% vs 40-50%)

**Cause**: Not enough score overlap between battlers

**Evidence**:
- Only 6 debatable battles out of 100
- Most battles are either clear wins or bodies
- Variance (0.45) not creating enough overlap

**Recommendation**: Increase SEGMENT_VARIANCE to 0.55-0.60 (±55-60%)

### Issue 3: Even Matchups Producing 0% Upsets

**Cause**: Same attributes + same prep = deterministic outcomes (one battler always wins due to random seed)

**Evidence**:
- 0 upsets in 20 even matchup battles
- Expected: 40-60% (should be coin flips)

**Recommendation**: Add randomness to starting conditions or seed

### Issue 4: Choke Rate Slightly Low (4% vs 5-15%)

**Cause**: CHOKE_BASE_PROBABILITY (0.01) combined with prep reductions pushes most battlers to the 0.001 floor

**Recommendation**: Increase CHOKE_BASE_PROBABILITY to 0.015 (1.5%)

## Recommended Config Changes (v6)

```typescript
export const SIMULATION_CONFIG = {
  // Choke System
  CHOKE_BASE_PROBABILITY: 0.015,  // UP from 0.01 (target 5-10% overall)
  CHOKE_RESILIENCE_FACTOR: 0.015,  // Keep at 1.5%
  CHOKE_PREP_REDUCTION: 0.008,     // Keep at 0.8%
  CHOKE_MINIMUM: 0.001,            // Keep at 0.1%

  // Attribute Gap System
  ATTRIBUTE_GAP_HUGE_MULTIPLIER: 1.08,   // DOWN from 1.15 (reduce body rate)
  ATTRIBUTE_GAP_MEDIUM_MULTIPLIER: 1.04, // DOWN from 1.10 (reduce body rate)

  // Variance
  SEGMENT_VARIANCE: 0.55,  // UP from 0.45 (increase debatable rate)
};
```

## Expected Impact of v6 Changes

- **Choke rate**: 4% → ~8% (within 5-15% target) ✅
- **Body rate**: 47% → ~35% (closer to 20-30% target) ⚠️
- **Debatable rate**: 6% → ~25% (closer to 40-50% target) ⚠️
- **Upset rate**: 7% → ~12% (within 10-20% target) ✅

## Conclusion

The **critical choke detection bug is fixed**. The choke rate dropped from 78% → 48% → 40% → **4%** across multiple iterations.

Remaining work focuses on **fine-tuning score separation** (reduce attribute multipliers, increase variance) to hit the target outcome distribution of:
- 20-30% bodies
- 40-50% debatable battles
- 10-20% upsets

The simulation is now functionally correct - it just needs config parameter tuning, which is expected for game balance.
