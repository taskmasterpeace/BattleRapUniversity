# League Weights Migration & Bulk Validation Results

**Date**: 2025-11-25
**Migration**: `20251125050000_update_league_weights_balance_fix.sql`

## Executive Summary

The league weights balance fix has been successfully applied to the local Supabase database. However, bulk validation testing reveals significant balance issues that require further tuning of the battle simulation engine.

---

## 1. Migration Application

### Status: SUCCESSFUL

The league weights have been successfully updated:

| League | Short Code | Writing Weight | Performance Weight | Previous Writing | Previous Performance |
|--------|------------|----------------|-------------------|------------------|---------------------|
| Small Room Circuit | SMALL_ROOM | **0.70** | **0.30** | 0.60 | 0.40 |
| Main Stage Arena | MAIN_STAGE | **0.30** | **0.70** | 0.40 | 0.60 |

### Changes Applied

- **Small Room Circuit**: Increased writing weight from 0.60 to **0.70** (heavy technical focus)
- **Main Stage Arena**: Increased performance weight from 0.60 to **0.70** (heavy crowd/performance focus)

This creates a clearer differentiation between the two leagues, matching the game design intent:
- Small Room: "Intricate lines more palpable" - writing-focused
- Main Stage: "Performance dominates if far from stage" - performance-focused

### Method Used

Due to SQL syntax errors in other pending migrations, the league weights were applied using a TypeScript script (`scripts/apply-league-weights.ts`) rather than the full database reset. This targeted approach successfully updated only the league weights without affecting other migrations.

---

## 2. League Weights Verification

Query executed:
```sql
SELECT name, short_code, writing_weight, performance_weight
FROM leagues
ORDER BY short_code;
```

**Confirmed Results**:
- Small Room Circuit (SMALL_ROOM): writing 0.70, performance 0.30
- Main Stage Arena (MAIN_STAGE): writing 0.30, performance 0.70

---

## 3. Bulk Validation Test Results

### Test Configuration

- **Total Battles Run**: 100
- **Test Scenarios**: 15 (covering huge, medium, small, and even attribute gaps)
- **Leagues Tested**: Both Small Room and Main Stage
- **Report Location**: `test-results/bulk-validation-report-1764095049948.md`

### Target Metrics vs Actual Results

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Body Rate** (3-0 dominant) | 20-30% | **53.0%** | FAIL |
| **Debatable Rate** (2-1 close) | 40-50% | **8.0%** | FAIL |
| **Upset Rate** (underdog wins) | 10-20% | **3.0%** | FAIL |
| **Choke Rate** | 5-15% | **78.0%** | FAIL |

**All metrics failed validation.**

---

## 4. Detailed Results by Attribute Gap

### Huge Gap (3+ points) - 20 battles

| Metric | Actual | Target | Status |
|--------|--------|--------|--------|
| Body Rate | 90.0% | 70-80% | Near target (slight overshoot) |
| Upset Rate | 0.0% | 0-5% | PASS |
| Choke Rate | 85.0% | - | Too high |

**Analysis**: God-tier vs Mid/Low tier battles are mostly working as expected, with very few upsets. However, choke rate is extremely high.

### Medium Gap (2 points) - 30 battles

| Metric | Actual | Target | Status |
|--------|--------|--------|--------|
| Body Rate | 56.7% | 35-55% | Slight overshoot |
| Upset Rate | 0.0% | 10-20% | FAIL |
| Choke Rate | 73.3% | - | Too high |

**Analysis**: Medium gaps showing too many bodies and zero upsets. Should see more competitive 2-1 battles.

### Small Gap (1 point) - 30 battles

| Metric | Actual | Target | Status |
|--------|--------|--------|--------|
| Body Rate | 56.7% | 15-35% | FAIL (way too high) |
| Upset Rate | 10.0% | 20-35% | Below target |
| Choke Rate | 79.3% | - | Too high |

**Analysis**: Small gaps should produce mostly competitive battles, but we're seeing too many bodies.

### Even Matchups (0 gap) - 20 battles

| Metric | Actual | Target | Status |
|--------|--------|--------|--------|
| Body Rate | 5.0% | 5-25% | PASS |
| Upset Rate | 0.0% | 40-60% | FAIL |
| Choke Rate | 65.0% | - | Too high |

**Analysis**: Bodies are good, but "upset" rate is misleading (both battlers are equal, so there's no underdog). Battles should be highly debatable, which they are not.

---

## 5. Key Findings

### Critical Issues

1. **Choke Rate Catastrophically High (78%)**
   - Target: 5-15%
   - Actual: 78%
   - **This is the primary issue** - nearly 4 out of 5 battles include a choke
   - Current `CHOKE_BASE_PROBABILITY = 0.1` is far too high

2. **Body Rate Too High (53%)**
   - Target: 20-30%
   - Actual: 53%
   - More than half of all battles are 3-0 sweeps
   - Indicates attribute gaps have too much impact

3. **Debatable Rate Too Low (8%)**
   - Target: 40-50%
   - Actual: 8%
   - Very few close, competitive 2-1 battles
   - Suggests insufficient variance or momentum mechanics

4. **Upset Rate Too Low (3%)**
   - Target: 10-20%
   - Actual: 3%
   - Prep and variance aren't creating enough opportunity for underdogs

### League Weight Impact

The league weights themselves appear to be working correctly:
- God Writer vs Mid Writer (Small Room): 80% body rate
- God Performer vs Mid Performer (Main Stage): 80% body rate

Both leagues show similar patterns, suggesting the weights are being applied but the underlying simulation mechanics are the issue.

---

## 6. Recommended Tuning Actions

### Immediate Priority: Fix Choke Rate

**Current Config**:
```json
"CHOKE_BASE_PROBABILITY": 0.1,
"CHOKE_RESILIENCE_FACTOR": 0.01,
"CHOKE_PREP_REDUCTION": 0.005,
"CHOKE_MINIMUM": 0.02,
"CHOKE_MAXIMUM": 0.25
```

**Recommended Changes**:
```json
"CHOKE_BASE_PROBABILITY": 0.02,  // Reduce from 0.1 to 0.02 (5x reduction)
"CHOKE_RESILIENCE_FACTOR": 0.015,  // Increase impact of resilience
"CHOKE_PREP_REDUCTION": 0.008,  // Increase prep benefit
```

### Secondary Priority: Increase Variance

**Current**:
```json
"SEGMENT_VARIANCE": 0.25
```

**Recommended**:
```json
"SEGMENT_VARIANCE": 0.35  // Increase from 0.25 to create more swing potential
```

### Tertiary Priority: Reduce Attribute Gap Impact

**Current**:
```json
"ATTRIBUTE_GAP_HUGE_MULTIPLIER": 1.25,
"ATTRIBUTE_GAP_MEDIUM_MULTIPLIER": 1.15
```

**Recommended**:
```json
"ATTRIBUTE_GAP_HUGE_MULTIPLIER": 1.20,  // Slight reduction
"ATTRIBUTE_GAP_MEDIUM_MULTIPLIER": 1.12  // Slight reduction
```

### Enhance Prep Impact

**Current**:
```json
"PREP_EFFECT_MULTIPLIER": 0.1
```

**Recommended**:
```json
"PREP_EFFECT_MULTIPLIER": 0.15  // Increase from 0.1 to make prep more valuable
```

---

## 7. Next Steps

1. **Apply Recommended Config Changes**
   - Update `lib/game/battleSimConfig.ts` with new values
   - Focus on choke rate first (most critical)

2. **Re-run Bulk Validation**
   - `npm run test:bulk-validation`
   - Target: Get all four metrics within acceptable ranges

3. **Iterate on Tuning**
   - If choke rate drops below 5%, slightly increase base probability
   - If upset rate still low, further increase prep effect or variance
   - Continue until all metrics pass

4. **Test Specific Scenarios**
   - Run targeted tests on small gap battles (should be most competitive)
   - Test even matchups to ensure high debatable rate

5. **Document Final Config**
   - Once validation passes, document final configuration
   - Create balance notes for future reference

---

## 8. Migration File Issues

### Discovered Issues

While attempting to apply the full migration suite via `supabase db reset`, the following migrations have SQL syntax errors:

1. **`20251125010000_add_badge_point_buy_tables.sql`**
   - Issue: Mixed column counts in INSERT statements (gold badges with `available_at_creation` parameter)
   - Status: Fixed manually by separating gold badge inserts

2. **`20251125040000_add_in_battle_decisions.sql`**
   - Issue: Multiple INSERT statements missing individual `ON CONFLICT` clauses
   - Status: Fixed manually by adding `ON CONFLICT` after each INSERT

### Resolution

The league weights migration was applied successfully using a targeted TypeScript script, bypassing the problematic migrations. The other migrations should be fixed before the next full database reset.

---

## 9. Files Generated

- **League weights script**: `C:\git\battlerapuniversity\ai-battlerap\scripts\apply-league-weights.ts`
- **Validation report**: `C:\git\battlerapuniversity\ai-battlerap\test-results\bulk-validation-report-1764095049948.md`
- **JSON results**: `C:\git\battlerapuniversity\ai-battlerap\test-results\bulk-validation-1764095049948.json`
- **This summary**: `C:\git\battlerapuniversity\ai-battlerap\LEAGUE_WEIGHTS_VALIDATION_RESULTS.md`

---

## Conclusion

**Migration Status**: SUCCESS
**Validation Status**: FAIL (all metrics out of range)
**Primary Issue**: Choke rate (78% vs 5-15% target)
**Recommended Action**: Reduce `CHOKE_BASE_PROBABILITY` from 0.1 to 0.02 and re-test

The league weights themselves are correctly differentiated and applied. The balance issues are in the core simulation engine parameters, not the league configuration.
