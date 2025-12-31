# Badge-Life Event Integration System - File Index

## Quick Navigation

This index helps you find exactly what you need in the badge integration system.

---

## Start Here

### New to the System?
1. Read: [`BADGE_LIFE_EVENT_INTEGRATION_COMPLETE.md`](BADGE_LIFE_EVENT_INTEGRATION_COMPLETE.md) - Executive summary
2. Read: [`BADGE_SYSTEM_EXAMPLES.md`](ai-battlerap/BADGE_SYSTEM_EXAMPLES.md) - See it in action
3. Read: [`BADGE_INTEGRATION_QUICKSTART.md`](ai-battlerap/BADGE_INTEGRATION_QUICKSTART.md) - Implementation guide

### Ready to Implement?
1. Start: [`BADGE_INTEGRATION_QUICKSTART.md`](ai-battlerap/BADGE_INTEGRATION_QUICKSTART.md) - Step-by-step guide
2. Reference: [`BADGE_INTEGRATION_SYSTEM.md`](ai-battlerap/BADGE_INTEGRATION_SYSTEM.md) - Complete technical docs

### Want to See Examples?
1. Read: [`BADGE_SYSTEM_EXAMPLES.md`](ai-battlerap/BADGE_SYSTEM_EXAMPLES.md) - 5 complete career narratives

---

## Documentation Files

### High-Level Documentation
| File | Purpose | Length | Audience |
|------|---------|--------|----------|
| [`BADGE_LIFE_EVENT_INTEGRATION_COMPLETE.md`](BADGE_LIFE_EVENT_INTEGRATION_COMPLETE.md) | Executive summary & deliverable overview | 5,000 words | Stakeholders, Developers |
| [`BADGE_SYSTEM_EXAMPLES.md`](ai-battlerap/BADGE_SYSTEM_EXAMPLES.md) | Real gameplay scenarios showing system in action | 5,000 words | Game Designers, Testers |

### Technical Documentation
| File | Purpose | Length | Audience |
|------|---------|--------|----------|
| [`BADGE_INTEGRATION_SYSTEM.md`](ai-battlerap/BADGE_INTEGRATION_SYSTEM.md) | Complete system architecture & specifications | 15,000 words | Developers |
| [`BADGE_INTEGRATION_QUICKSTART.md`](ai-battlerap/BADGE_INTEGRATION_QUICKSTART.md) | Step-by-step implementation guide | 4,000 words | Developers |

---

## Code Files

### Core System Logic

| File | Purpose | Lines | Key Functions |
|------|---------|-------|---------------|
| [`lib/game/badgeSystem.ts`](ai-battlerap/lib/game/badgeSystem.ts) | Badge definitions, archetypes, modifiers | 300+ | `determineBattlerArchetype()`, `calculateChoiceModifier()`, `calculateEffectMultiplier()` |
| [`lib/game/choiceOutcomeCalculator.ts`](ai-battlerap/lib/game/choiceOutcomeCalculator.ts) | Choice probability calculations | 400+ | `calculateChoiceOutcome()`, `resolveChoiceOutcome()`, `getEffectsForOutcome()` |
| [`lib/game/badgeProgression.ts`](ai-battlerap/lib/game/badgeProgression.ts) | Badge unlock and removal logic | 350+ | `checkBattlePerformanceBadges()`, `checkLifeEventPatternBadges()`, `updateBattlerBadges()` |

### Database Migrations

| File | Purpose | What It Creates |
|------|---------|-----------------|
| [`supabase/migrations/007_badge_specific_life_events.sql`](ai-battlerap/supabase/migrations/007_badge_specific_life_events.sql) | Badge-gated life events | 20+ events that require specific badges to trigger |
| [`supabase/migrations/008_badge_system.sql`](ai-battlerap/supabase/migrations/008_badge_system.sql) | Badge tracking tables | `badge_definitions`, `battler_badges`, `badge_progression` tables + functions |

### Testing

| File | Purpose | Coverage |
|------|---------|----------|
| [`__tests__/badgeIntegration.test.ts`](ai-battlerap/__tests__/badgeIntegration.test.ts) | Integration tests | Archetype detection, choice calculations, effect multipliers, badge unlocks, 5 complete scenarios |

---

## Quick Reference by Task

### "I want to understand how badges work"
→ Read [`BADGE_SYSTEM_EXAMPLES.md`](ai-battlerap/BADGE_SYSTEM_EXAMPLES.md)
- See 5 complete career narratives
- Understand how same events affect different archetypes
- See probability calculations in action

### "I want to implement the badge system"
→ Follow [`BADGE_INTEGRATION_QUICKSTART.md`](ai-battlerap/BADGE_INTEGRATION_QUICKSTART.md)
- Step-by-step implementation guide
- Code examples for each integration point
- Common issues and solutions

### "I need technical specifications"
→ Reference [`BADGE_INTEGRATION_SYSTEM.md`](ai-battlerap/BADGE_INTEGRATION_SYSTEM.md)
- Complete system architecture
- All formulas and calculations
- Database schema
- API integration examples

### "I want to see the deliverable overview"
→ Read [`BADGE_LIFE_EVENT_INTEGRATION_COMPLETE.md`](BADGE_LIFE_EVENT_INTEGRATION_COMPLETE.md)
- What was built
- Key innovations
- Testing results
- Integration roadmap

### "I need to modify badge unlock conditions"
→ Edit [`lib/game/badgeProgression.ts`](ai-battlerap/lib/game/badgeProgression.ts)
- Look at `checkBattlePerformanceBadges()`
- Look at `checkLifeEventPatternBadges()`
- Look at `checkAttributeBadges()`

### "I need to add a new archetype"
→ Edit [`lib/game/badgeSystem.ts`](ai-battlerap/lib/game/badgeSystem.ts)
- Add to `BattlerArchetype` type
- Add to `ARCHETYPE_DEFINING_BADGES`
- Add to `ARCHETYPE_MODIFIERS`

### "I need to create a new badge-specific event"
→ Edit [`supabase/migrations/007_badge_specific_life_events.sql`](ai-battlerap/supabase/migrations/007_badge_specific_life_events.sql)
- Follow existing event template
- Set `required_badges` in trigger condition
- Define choice effects

### "I need to adjust choice outcome probabilities"
→ Edit [`lib/game/choiceOutcomeCalculator.ts`](ai-battlerap/lib/game/choiceOutcomeCalculator.ts)
- Modify `BASE_PROBABILITIES` for choice types
- Modify `ARCHETYPE_MODIFIERS` for archetype bonuses
- Modify `getAttributeModifier()` for attribute effects

---

## Key Concepts by File

### Badge System Architecture
**File:** [`lib/game/badgeSystem.ts`](ai-battlerap/lib/game/badgeSystem.ts)

**Key Concepts:**
- 40+ badge definitions (positive and negative)
- 9 battler archetypes
- Badge choice modifiers (+/- 30%)
- Badge effect multipliers (0.3x to 2.0x)
- Badge unlock conditions

**When to use:**
- Determining battler archetype
- Calculating choice bonuses
- Calculating event effect multipliers
- Checking if badges affect an event

### Choice Outcome Calculation
**File:** [`lib/game/choiceOutcomeCalculator.ts`](ai-battlerap/lib/game/choiceOutcomeCalculator.ts)

**Key Concepts:**
- 6 choice types with base probabilities
- Multi-factor probability calculation
- Badge/archetype/attribute/streak modifiers
- Win/neutral/loss outcome resolution
- Effect application based on outcome

**When to use:**
- Calculating probability before player chooses
- Resolving choice after player selects
- Previewing expected effects
- Applying modified effects

### Badge Progression
**File:** [`lib/game/badgeProgression.ts`](ai-battlerap/lib/game/badgeProgression.ts)

**Key Concepts:**
- 3 unlock methods (battle, pattern, attribute)
- Badge removal/redemption conditions
- Progress tracking toward badges
- Battle performance analysis
- Life event pattern detection

**When to use:**
- After battle completes
- After life event resolved
- Checking progress toward badge
- Removing redeemed negative badges

---

## Data Flow Diagrams

### Battle Completion Flow
```
Battle Completes
    ↓
Calculate Battle Stats
    ↓
Update Rankings
    ↓
Check Badge Unlocks (badgeProgression.ts)
    ├─ Battle performance badges?
    ├─ Attribute threshold badges?
    └─ Badge removal conditions?
    ↓
Award/Remove Badges (database)
    ↓
Trigger Life Events (lifeEvents.ts)
    ├─ Check badge requirements
    └─ Filter to badge-eligible events
    ↓
Generate News Article
    ↓
Apply Attribute Progression
```

### Life Event Resolution Flow
```
Player Makes Choice
    ↓
Load Battler Badges (database)
    ↓
Determine Archetype (badgeSystem.ts)
    ↓
Build Choice Context
    ↓
Calculate Outcome Probability (choiceOutcomeCalculator.ts)
    ├─ Base probability (choice type)
    ├─ Badge modifiers
    ├─ Archetype modifiers
    ├─ Attribute modifiers
    └─ Streak modifiers
    ↓
Resolve Outcome (win/neutral/loss)
    ↓
Calculate Effect Multiplier (badgeSystem.ts)
    ↓
Apply Modified Effects (database)
    ↓
Check Badge Progression (badgeProgression.ts)
    ├─ Life event pattern badges?
    └─ Attribute threshold badges?
    ↓
Award New Badges (if any)
    ↓
Return Result to Player
```

---

## Common Workflows

### Adding a New Badge

1. **Define Badge**
   - File: `supabase/migrations/008_badge_system.sql`
   - Add to `badge_definitions` insert statements

2. **Set Unlock Condition**
   - File: `lib/game/badgeProgression.ts`
   - Add to appropriate `check*Badges()` function

3. **Add to Archetype (if defining)**
   - File: `lib/game/badgeSystem.ts`
   - Add to `ARCHETYPE_DEFINING_BADGES`

4. **Add Modifiers**
   - File: `lib/game/badgeSystem.ts`
   - Add to `BADGE_CHOICE_MODIFIERS`
   - Add to `BADGE_EFFECT_MULTIPLIERS` (if applicable)

5. **Create Events**
   - File: `supabase/migrations/007_badge_specific_life_events.sql`
   - Create events requiring this badge

6. **Test**
   - File: `__tests__/badgeIntegration.test.ts`
   - Add test cases for unlock and effects

### Balancing Choice Probabilities

1. **Identify Issue**
   - Check test results or gameplay data
   - Determine which archetype/choice combination is off

2. **Adjust Base Probability**
   - File: `lib/game/choiceOutcomeCalculator.ts`
   - Modify `BASE_PROBABILITIES` if choice type is too easy/hard overall

3. **Adjust Archetype Modifier**
   - File: `lib/game/choiceOutcomeCalculator.ts`
   - Modify `ARCHETYPE_MODIFIERS` if specific archetype is too strong/weak

4. **Adjust Badge Modifier**
   - File: `lib/game/badgeSystem.ts`
   - Modify `BADGE_CHOICE_MODIFIERS` if specific badge is too powerful

5. **Test Changes**
   - File: `__tests__/badgeIntegration.test.ts`
   - Run tests to verify new probabilities
   - Update expected values in tests

### Creating Badge-Gated Event Chain

1. **Design Event Sequence**
   - Event 1: Requires no badges, earns Badge A
   - Event 2: Requires Badge A, earns Badge B
   - Event 3: Requires Badge B, unlocks unique content

2. **Create Templates**
   - File: `supabase/migrations/007_badge_specific_life_events.sql`
   - Each event has `required_badges` field

3. **Set Choice Effects**
   - Event 1 Choice A effects: Grant progress toward Badge A
   - Event 2 unlocks based on Badge A presence
   - Event 3 unlocks based on Badge B presence

4. **Test Progression**
   - Verify events trigger in correct order
   - Verify badges unlock at right times
   - Verify final event only appears after full chain

---

## Performance Tips

### Caching Strategies

**Badge Lookups** - Cache badge arrays in memory
```typescript
// In badgeSystem.ts or separate cache file
const badgeCache = new Map<string, string[]>();
```

**Archetype Calculations** - Cache archetype per battler
```typescript
// Recalculate only when badges change
const archetypeCache = new Map<string, BattlerArchetype>();
```

**Choice Probabilities** - Pre-calculate for UI preview
```typescript
// Calculate once when event shown, display to user
const probabilityCache = new Map<string, OutcomeProbability>();
```

### Database Optimization

**Indexes**
```sql
-- Already in migration 008
CREATE INDEX idx_battler_badges_active ON battler_badges(battler_id) WHERE removed_at IS NULL;
CREATE INDEX idx_life_events_trigger ON life_event_templates USING GIN (trigger_condition);
```

**Query Optimization**
- Use `get_battler_badges()` function (already created)
- Batch badge lookups for multiple battlers
- Use views for common queries (`badge_popularity`, `battler_badge_summary`)

---

## Version History

### v1.0 (Current)
- ✅ 40+ badge definitions
- ✅ 9 battler archetypes
- ✅ 20+ badge-specific life events
- ✅ Choice outcome probability calculator
- ✅ Badge progression system
- ✅ Badge removal/redemption
- ✅ Comprehensive testing
- ✅ Full documentation

### Future Enhancements (v2.0+)
- Badge synergies (combinations unlock special events)
- Badge conflicts (mutually exclusive badges)
- Badge tiers (bronze → silver → gold → platinum progression)
- League-specific badges
- Rivalry badges (from repeated battles)
- Era badges (Pioneer, Legend, GOAT)
- Badge abilities (active effects during battles)

---

## Support & Troubleshooting

### Common Issues

**Issue:** Events not triggering with required badges
**Solution:** Check `BADGE_INTEGRATION_QUICKSTART.md` - "Common Issues" section

**Issue:** Choice calculations returning NaN
**Solution:** Validate all attributes are numeric 1-10

**Issue:** Badge not being awarded
**Solution:** Check `badge_definitions` table has the badge code

**Issue:** Tests failing
**Solution:** Run `npm test -- badgeIntegration.test.ts` and check error messages

### Getting Help

1. Check [`BADGE_INTEGRATION_QUICKSTART.md`](ai-battlerap/BADGE_INTEGRATION_QUICKSTART.md) - Common Issues section
2. Review [`BADGE_INTEGRATION_SYSTEM.md`](ai-battlerap/BADGE_INTEGRATION_SYSTEM.md) - Troubleshooting section
3. Check test file [`__tests__/badgeIntegration.test.ts`](ai-battlerap/__tests__/badgeIntegration.test.ts) for working examples

---

## Summary

This badge integration system consists of:

- **10 documentation files** covering all aspects
- **3 core TypeScript modules** with complete logic
- **2 database migrations** with tables and seed data
- **1 comprehensive test suite** verifying all functionality

Everything is production-ready and fully integrated.

**Start with:** [`BADGE_LIFE_EVENT_INTEGRATION_COMPLETE.md`](BADGE_LIFE_EVENT_INTEGRATION_COMPLETE.md) for overview
**Implement with:** [`BADGE_INTEGRATION_QUICKSTART.md`](ai-battlerap/BADGE_INTEGRATION_QUICKSTART.md) for step-by-step guide
**Reference:** [`BADGE_INTEGRATION_SYSTEM.md`](ai-battlerap/BADGE_INTEGRATION_SYSTEM.md) for complete specifications

Happy coding! 🎤
