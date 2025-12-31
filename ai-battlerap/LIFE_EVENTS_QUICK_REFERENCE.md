# Life Events - Quick Reference Card

## Event Types at a Glance

| Type | Player Input | When Fires | Example |
|------|-------------|------------|---------|
| **PASSIVE** | None (automatic) | Behavior threshold met | 5 writing days → Burnout |
| **CHOICE** | Player chooses A/B/C | Random/Attribute trigger | Podcast invite → Accept or Decline |
| **TRIGGERED** | None (automatic) | Battle performance | 3-0 win → Viral buzz |

## Stress System Cheat Sheet

| Stress Level | Choke Impact | Description |
|--------------|-------------|-------------|
| 0-19 | +0% | Calm |
| 20-39 | +3% | Slightly tense |
| 40-59 | +8% | Moderate stress |
| 60-79 | +15% | High stress |
| 80-100 | +25% | Breaking point |

**Accumulation**: Back-to-back battles (+8-15), High-intensity prep (+10-15), Chokes (+10-20)
**Reduction**: Rest days (-5 each), Wins (-10), Smart choices (variable)

## Effect Durations

| Duration | Meaning | Example |
|----------|---------|---------|
| **immediate** | Permanent | Reputation +2 |
| **next_battle** | Until next battle | Writing power -15% |
| **prep_cycle** | This prep only | Prep bonus +10% |
| **cumulative** | Ongoing | Stress +15 |

## Common Passive Events

| Event | Trigger | Effect | Duration |
|-------|---------|--------|----------|
| Writing Burnout | 5 consecutive writing days | Stress +15, Writing -15%, Creativity -1 | next_battle |
| Performance Strain | 5 consecutive performance days | Stress +15, Performance -15%, Delivery -1 | next_battle |
| No Rest Crash | 3 battles without rest | Stress +25, Resilience -1, Choke +15% | next_battle |
| High Stress | Stress >= 70 | Choke +20%, Resilience -1, Prep -20% | next_battle |
| Choke Trauma | 1 recent choke | Stress +20, Resilience -2, Choke +15% | next_battle |
| Chronic Choker | 2 recent chokes | Rep -2, Resilience -2, Choke +25% | immediate |

## Common Choice Events

| Event | When | Best For | Winning Choice |
|-------|------|----------|----------------|
| Podcast Invite | Reputation >= 5 | Performers: A, Writers: B | A = Bold, B = Safe, C = Decline |
| Twitter Beef | Win streak 2+ | Performers: A, Writers: B | A = Engage, B = Strategic, C = High road |
| Sponsor Offer | Public knowledge 40+ | Balanced: C | A = Sign deal, B = Negotiate, C = Stay independent |
| Training Camp | Random | All: A | A = Full commit, B = Partial, C = Decline |
| Relationship Ultimatum | 3 battles no rest | Writers: B | A = Choose relationship, B = Compromise, C = Choose battle |
| After Choke | Choked = true | Writers: B, Performers: A | A = Book immediately, B = Take break, C = Switch leagues |

## Common Triggered Events

| Event | Trigger | Effect | Duration |
|-------|---------|--------|----------|
| Bodybag Buzz | 3-0 + crowd 75+ | Rep +2, PK +25, Confidence +20% | next_battle |
| Perfect Execution | 3-0 + consistency 0.9+ | Rep +2, Resilience +1, All attrs +0.5 | next_battle |
| Upset Victory | Win + rating diff 150+ | Rep +3, PK +30, Resilience +2 | immediate |
| Haymaker Moment | Peak score 9+ | Rep +2, PK +20, Lyricism +1 | immediate |
| Choke Redemption | Dominant win + 1 recent choke | Rep +3, Resilience +3, Stress -25 | immediate |
| Bad Loss Backlash | 0-3 + PK 50+ | Rep -2, Stress +25, PK -15 | next_battle |

## Integration Points

```typescript
// PRE-BATTLE (in simulation.ts before sim runs)
await preBattleLifeEventCheck(supabase, battleId, playerBattlerId);

// DURING BATTLE (inside simulateBattle())
const modifiers = await getBattleModifiers(supabase, playerBattlerId);
const stressChokeImpact = calculateStressChokeImpact(stress);
const modifiedStats = applyModifiersToSimulation(baseStats, modifiers, prepProfile);

// POST-BATTLE (after results saved)
await postBattleLifeEventCheck(supabase, battleId, playerBattlerId, battleContext);
```

## SQL Quick Queries

```sql
-- Check pending choices
SELECT * FROM get_pending_choice_events('battler-id');

-- Check active effects
SELECT * FROM battler_life_events WHERE battler_id = '...' AND active = true;

-- Check stress level
SELECT stress FROM battler_attributes WHERE battler_id = '...';

-- Check prep patterns
SELECT * FROM prep_pattern_tracking WHERE battler_id = '...';

-- Get event stats
SELECT * FROM get_life_event_stats('battler-id');
```

## Rock-Paper-Scissors Guide

| Battler Type | Determination | Winning Choices |
|--------------|--------------|-----------------|
| **Writer** | Writing avg > Performance avg + 1.5 | Calculated, strategic, craft-focused |
| **Performer** | Performance avg > Writing avg + 1.5 | Bold, aggressive, spotlight-seeking |
| **Balanced** | Difference <= 1.5 | Middle ground, compromise |

## Key Modifiers

| Modifier | What It Does |
|----------|--------------|
| `writing_power_modifier` | Multiplies writing power (e.g., -0.15 = -15%) |
| `performance_power_modifier` | Multiplies performance power |
| `choke_chance_modifier` | Adds to choke probability (e.g., +0.2 = +20%) |
| `prep_efficiency_modifier` | Multiplies prep effectiveness |
| `confidence_boost` | Adds to all calculations |
| `consistency_penalty` | Increases segment variance |
| `prep_bonus_writing` | Bonus if writingDays > 0 |
| `prep_bonus_all` | Bonus to all prep types |

## Configuration Locations

| What | Where |
|------|-------|
| Event probabilities | SQL templates: `trigger_probability` |
| Stress thresholds | `lifeEventEffects.ts`: `calculateStressChokeImpact()` |
| Effect magnitudes | SQL templates: `passive_effects`, `choice_X_effects` |
| Cooldowns | SQL templates: `cooldown_battles` |
| Winning choices | SQL templates: `winning_choice_for_X` |

## Testing Commands

```bash
# Apply migrations
supabase migration up 007_add_stress_stat
supabase migration up 008_three_tier_life_events
supabase migration up 009_seed_passive_events
supabase migration up 010_seed_choice_events
supabase migration up 011_seed_triggered_events
supabase migration up 012_life_event_helper_functions
```

```sql
-- Force a passive event
UPDATE prep_pattern_tracking
SET consecutive_writing_days = 5
WHERE battler_id = 'test-id';

-- Create a choice event
INSERT INTO battler_life_events (battler_id, template_code, event_type, status)
VALUES ('test-id', 'CHOICE_PODCAST_INVITE', 'choice', 'pending');

-- Simulate high stress
UPDATE battler_attributes SET stress = 75 WHERE battler_id = 'test-id';
```

## Event Counts

- **Total**: 60 templates
  - Passive: 20
  - Choice: 20
  - Triggered: 20

## Files Created

- Migrations: `007` through `012`
- Code: `lifeEventTriggers.ts`, `lifeEventEffects.ts`, `simulationIntegration.ts`
- Docs: `THREE_TIER_LIFE_EVENTS_README.md`, `LIFE_EVENTS_THREE_TIER_TESTING.md`, `LIFE_EVENTS_IMPLEMENTATION_SUMMARY.md`

## Design Principles

✅ **Events have mechanical teeth** - Not just story flavor
✅ **Stress creates tension** - Real consequences from burnout
✅ **Choices matter** - Different outcomes per battler type
✅ **Performance responds** - Triggered events feel earned
✅ **Patterns matter** - Behavior tracking enables strategic depth

---

*For detailed documentation, see `THREE_TIER_LIFE_EVENTS_README.md`*
*For testing guide, see `LIFE_EVENTS_THREE_TIER_TESTING.md`*
*For implementation details, see `LIFE_EVENTS_IMPLEMENTATION_SUMMARY.md`*
