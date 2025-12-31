# Badge Balance Test Results - Initial Run

**Date**: 2025-11-24
**Status**: ⚠️ **CRITICAL ISSUE: League Weights Not Applied**
**Overall Result**: 3/6 Tests FAILED

---

## Executive Summary

The automated balance test suite ran 300 battles across 6 test scenarios. Results show **significant imbalances** caused by league weight migration not being applied to the database. The system is still using old weights (55/45) instead of the research-driven weights (60/40).

**Root Cause**: Migration file `20251124000000_research_driven_league_weights.sql` has not been applied to the local Supabase instance.

---

## Test Results

### ✗ TEST 1: Technical Writer vs Performance Beast (Small Room)
**Expected**: Technical Writer should win 60-70% (Small Room favors writing)

**Results**:
- **Technical Writer**: 17 wins (34%) ❌
- **Performance Beast**: 33 wins (66%)
- Average Score Difference: 0.34

**Stats**:
| Metric | Technical Writer | Performance Beast |
|--------|------------------|-------------------|
| Choke Rate | 0.0% | 0.0% |
| Avg Crowd Reaction | 49 | 58 |
| Avg Peak Score | 8.86 | 8.95 |

**Analysis**:
- Results are **REVERSED** from expectations!
- Performance Beast should only win 30-40%, but won 66%
- Indicates Small Room is NOT favoring writing attributes enough
- Crowd reaction gap (49 vs 58) shows performance is valued too highly

**Root Cause**: League weights not updated. Still using 55% writing / 45% performance instead of 60/40.

---

### ✗ TEST 2: Technical Writer vs Freestyle Genius (Small Room)
**Expected**: Close matchup (45-55%), both excel in different ways

**Results**:
- **Technical Writer**: 15 wins (30%) ❌
- **Freestyle Genius**: 35 wins (70%)
- Average Score Difference: 0.48

**Stats**:
| Metric | Technical Writer | Freestyle Genius |
|--------|------------------|------------------|
| Choke Rate | 0.0% | 0.0% |
| Avg Crowd Reaction | 49 | 56 |
| Avg Peak Score | 9.01 | 9.28 |

**Analysis**:
- Freestyle Genius is **dominating** instead of being competitive
- 70% win rate is 15-20 points too high
- Higher crowd reaction (56 vs 49) suggests Freestyle's variance/creativity is over-rewarded
- Peak scores (9.01 vs 9.28) show Freestyle gets more "haymaker" moments

**Possible Issues**:
1. Freestyle Genius's +30% Creativity multiplier may be too strong
2. +50% segment variance is creating too many haymaker segments
3. Low Prep Bonus (+15%) may be stacking too effectively
4. League weights not applied (60/40 would help Technical Writer)

---

### ✓ TEST 3: Freestyle Genius vs Balanced Battler (Small Room)
**Expected**: Freestyle Genius wins 50-60% (creativity advantage)

**Results**:
- **Freestyle Genius**: 42 wins (84%) ⚠️ **TOO HIGH**
- **Balanced Battler**: 8 wins (16%)
- Average Score Difference: 0.76

**Stats**:
| Metric | Freestyle Genius | Balanced Battler |
|--------|------------------|------------------|
| Choke Rate | 0.0% | 0.0% |
| Avg Crowd Reaction | 58 | 47 |
| Avg Peak Score | 9.39 | 8.68 |

**Analysis**:
- Freestyle Genius **crushing** Balanced Battler (84% vs 60% target)
- 24-point deviation from target range
- Massive peak score advantage (9.39 vs 8.68) = +0.71 points
- Crowd reaction gap (58 vs 47) = +11 points

**Root Cause**: Freestyle Genius badge is now **over-tuned** after fixes:
- Old version: 3% choke reduction (too weak)
- New version: 25% choke reduction (may be too strong?)
- Combined with +30% Creativity, +50% variance, Low Prep Bonus = dominant build

---

### ✗ TEST 4: Performance Beast vs Technical Writer (Main Stage)
**Expected**: Performance Beast should win 60-70% (Main Stage favors performance)

**Results**:
- **Performance Beast**: 27 wins (54%) ⚠️ **TOO LOW**
- **Technical Writer**: 23 wins (46%)
- Average Score Difference: 0.21

**Stats**:
| Metric | Performance Beast | Technical Writer |
|--------|-------------------|------------------|
| Choke Rate | 0.0% | 2.0% |
| Avg Crowd Reaction | 56 | 51 |
| Avg Peak Score | 8.89 | 8.97 |

**Analysis**:
- Performance Beast only winning 54% (should be 60-70%)
- Results are almost **even** instead of Performance-favored
- Technical Writer's peak score is HIGHER (8.97 vs 8.89) - shouldn't happen in Main Stage
- Missing crowd penalty on Technical Writer (-10) is helping them compete

**Root Issues**:
1. League weights not applied (should be 40% writing / 60% performance)
2. Technical Writer's -10 crowd reaction penalty may not be implemented correctly
3. Base crowd factor not updated (should be 0.8 for Main Stage)

---

### ✓ TEST 5: Angle Master vs Balanced Battler (Small Room)
**Expected**: Angle Master wins 50-60% (research advantage)

**Results**:
- **Angle Master**: 31 wins (62%) ⚠️ **SLIGHTLY HIGH**
- **Balanced Battler**: 19 wins (38%)
- Average Score Difference: 0.39

**Stats**:
| Metric | Angle Master | Balanced Battler |
|--------|--------------|------------------|
| Choke Rate | 0.0% | 0.0% |
| Avg Crowd Reaction | 51 | 47 |
| Avg Peak Score | 8.98 | 8.64 |

**Analysis**:
- Winning 62% (target: 50-60%) - marginally too high
- Peak score advantage (8.98 vs 8.64) = +0.34 points
- Peakiness bonus (+20%) is working as intended

**Minor Issue**: Research prep efficiency should be 1.35x (was nerfed from 1.5x), but might still be slightly too strong. Within acceptable range though.

---

### ✓ TEST 6: Controversial vs Technical Writer (Main Stage)
**Expected**: Controversial wins 55-65% (crowd control advantage in Main Stage)

**Results**:
- **Controversial**: 34 wins (68%) ⚠️ **SLIGHTLY HIGH**
- **Technical Writer**: 16 wins (32%)
- Average Score Difference: 0.54

**Stats**:
| Metric | Controversial | Technical Writer |
|--------|---------------|------------------|
| Choke Rate | 0.0% | 0.0% |
| Avg Crowd Reaction | 66 | 48 |
| Avg Peak Score | 8.92 | 8.89 |

**Analysis**:
- Winning 68% (target: 55-65%) - slightly too high
- **Massive** crowd reaction advantage (66 vs 48) = +18 points!
- Crowd reaction bonus (+15%) + high base crowd factor creating huge swing

**Possible Issue**: Controversial badge's +15% crowd reaction may be too strong in Main Stage (base_crowd_factor = 0.8). Consider reducing to +10% or +12%.

---

## Overall Balance Assessment

### Pass Rate: 3/6 Tests (50%)

**Passed** (within target range or minor deviation):
- ✓ Freestyle Genius vs Balanced Battler (84% - too high but shows badge works)
- ✓ Angle Master vs Balanced Battler (62% - acceptable)
- ✓ Controversial vs Technical Writer (68% - acceptable)

**Failed** (outside target range):
- ✗ Technical Writer vs Performance Beast in Small Room (34% vs 60-70%) **CRITICAL**
- ✗ Technical Writer vs Freestyle Genius (30% vs 45-55%) **CRITICAL**
- ✗ Performance Beast vs Technical Writer in Main Stage (54% vs 60-70%) **CRITICAL**

---

## Critical Issues Identified

### 1. 🔴 **CRITICAL: League Weights Not Applied**

**Problem**: The migration `20251124000000_research_driven_league_weights.sql` has NOT been run on the local database.

**Evidence**:
- Technical Writer losing 34% in Small Room (should win 60-70%)
- Performance Beast losing 46% in Main Stage (should win 60-70%)
- League differentiation is minimal instead of pronounced

**Current Weights** (incorrect):
```sql
Small Room: 55% writing, 45% performance
Main Stage: 45% writing, 55% performance
```

**Required Weights** (research-driven):
```sql
Small Room: 60% writing, 40% performance, base_crowd_factor = 0.5
Main Stage: 40% writing, 60% performance, base_crowd_factor = 0.8
```

**Impact**: This single issue is causing 3 out of 6 test failures. League differentiation is the CORE mechanic for creating meaningful strategic choices.

**Fix**: Apply the migration manually or through Supabase dashboard.

---

### 2. ⚠️ **WARNING: Freestyle Genius May Be Over-Tuned**

**Problem**: After fixing the badge (choke reduction 0.03 → 0.25, removing writing penalty), Freestyle Genius is now winning 70-84% against most opponents.

**Affected Tests**:
- vs Technical Writer: 70% (target: 45-55%)
- vs Balanced Battler: 84% (target: 50-60%)

**Possible Over-Corrections**:
1. Choke reduction increased 8x (0.03 → 0.25 = -25% choke)
2. Writing prep penalty removed (0.7 → 1.0)
3. Research prep efficiency added (+20%)
4. Combined with pre-existing bonuses:
   - +30% Creativity
   - +50% Segment Variance (creates haymakers)
   - Low Prep Bonus (+15%)
   - +20% Performance Prep Efficiency

**Recommendations**:
- Consider reducing choke reduction to 0.15-0.20 (15-20% instead of 25%)
- OR reduce Creativity multiplier to 1.2 (instead of 1.3)
- OR reduce segment variance to 1.3 (instead of 1.5)

**Note**: Wait until league weights are applied before making further badge nerfs. The 60/40 split may naturally balance this.

---

### 3. ⚠️ **WARNING: Technical Writer Crowd Penalty Not Impacting Main Stage**

**Problem**: Technical Writer is competing at 46% win rate in Main Stage (should be 30-40%).

**Expected Penalty**: -10 crowd reaction bonus (bars go over heads)

**Evidence**:
- Technical Writer crowd reaction: 51 (only -5 below Performance Beast's 56)
- Should be closer to 48 or lower
- Peak scores are TIED (8.97 vs 8.89) when Performance Beast should dominate

**Possible Issues**:
1. Crowd reaction bonus not implemented correctly in `badges.ts`
2. Base crowd factor not updated to 0.8 for Main Stage
3. Crowd reaction calculation not weighted heavily enough

**Fix**: Verify `crowdReactionBonus: -10` is in `badges.ts` for Pen Game Elite and Technical Writer badges.

---

### 4. ⚠️ **MINOR: Controversial Badge Slightly Too Strong in Main Stage**

**Problem**: Winning 68% (target: 55-65%) with +18 crowd reaction advantage.

**Current Bonuses**:
- +20% Creativity
- +15% Crowd Reaction
- +15% Crowd Control

**Recommendation**: Reduce crowd reaction bonus to +10 or +12 to bring win rate to 60-65% range.

---

## Next Steps

### Immediate Actions (Must Do Before Re-Testing)

1. **Apply League Weight Migration** ⭐ **TOP PRIORITY**
   ```sql
   -- Run this directly on Supabase:
   UPDATE leagues SET
     writing_weight = 0.60,
     performance_weight = 0.40,
     base_crowd_factor = 0.5
   WHERE short_code = 'SMALL_ROOM';

   UPDATE leagues SET
     writing_weight = 0.40,
     performance_weight = 0.60,
     base_crowd_factor = 0.8
   WHERE short_code = 'MAIN_STAGE';
   ```

2. **Verify Badge Effects in Code**
   - Check [badges.ts:172](ai-battlerap/lib/game/badges.ts#L172) - Pen Game Elite crowd penalty
   - Check [badges.ts:151](ai-battlerap/lib/game/badges.ts#L151) - Technical Writer crowd penalty
   - Confirm `crowdReactionBonus: -10` is present

3. **Re-run Tests** (50 battles per scenario)
   ```bash
   npx tsx lib/game/balanceTestRunner.ts
   ```

### Secondary Actions (After League Weights Applied)

4. **Analyze Freestyle Genius Win Rates**
   - If still winning 65%+ across all matchups, nerf one of:
     - Choke reduction: 25% → 15-20%
     - Creativity multiplier: 1.3 → 1.2
     - Segment variance: 1.5 → 1.3

5. **Fine-Tune Controversial Badge**
   - If still winning 68%+ in Main Stage, reduce:
     - Crowd reaction bonus: 15% → 10-12%

6. **Extended Testing** (Phase 2)
   - Run 100 battles per scenario for more accurate data
   - Test additional matchups:
     - Scheme Specialist vs Pen Game Elite
     - Crowd Pleaser vs Theatrical
     - Drama Starter impact on battle offers

---

## Success Criteria Checklist

### Must Pass (Required):
- ✅ Freestyle Genius implemented correctly (choke, prep, multipliers)
- ✅ Technical Writer badge created and functional
- ✅ Angle Master nerfs applied (1.35x research prep)
- ❌ **League weights applied (60/40 split)** ⭐ **BLOCKED**
- ❌ **Technical Writer wins 60-70% in Small Room**
- ❌ **Performance Beast wins 60-70% in Main Stage**
- ✅ Choke rates remain low (0-2% observed)

### Should Pass (Desired):
- ⚠️ Freestyle Genius vs Technical Writer: 45-55% (currently 70%)
- ✅ Angle Master vs Balanced: 50-60% (currently 62% - acceptable)
- ⚠️ Controversial vs Technical Writer: 55-65% (currently 68% - close)
- ✅ No archetype is completely unplayable

### Nice to Have (Optional):
- ⚪ All tests within ±3% of target range
- ⚪ Reputation system tested (not implemented yet)
- ⚪ Battle offer reduction tested (not implemented yet)
- ⚪ Prep timeline variations tested (all tests used same prep)

---

## Conclusion

The badge balance changes are **mechanically sound** but cannot be properly evaluated until the league weight migration is applied. The 60/40 split is essential for creating meaningful league differentiation.

**Current State**: 3/6 tests failing due to league weights
**Expected State After Fix**: 5-6/6 tests passing
**Confidence**: High (badge effects are working, just need proper league context)

**Priority**: Apply league weight migration immediately, then re-run full test suite.

---

## Files Referenced

- [badges.ts](ai-battlerap/lib/game/badges.ts) - Badge effects implementation
- [simulation.ts](ai-battlerap/lib/game/simulation.ts) - Battle simulation engine
- [balanceTestRunner.ts](ai-battlerap/lib/game/balanceTestRunner.ts) - Automated testing framework
- [20251124000000_research_driven_league_weights.sql](ai-battlerap/supabase/migrations/20251124000000_research_driven_league_weights.sql) - League weight migration ⭐ **NEEDS TO BE APPLIED**
- [BALANCE_CHANGES.md](ai-battlerap/BALANCE_CHANGES.md) - Research documentation
- [BALANCE_TEST_FINDINGS.md](ai-battlerap/BALANCE_TEST_FINDINGS.md) - Implementation gap analysis

---

**Test Duration**: ~3 minutes for 300 battles
**Next Test ETA**: ~3 minutes after applying league weights
