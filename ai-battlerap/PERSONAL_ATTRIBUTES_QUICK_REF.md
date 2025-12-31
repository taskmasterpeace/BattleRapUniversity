# Personal Attributes Quick Reference

Quick lookup for formulas and effects of personal attributes.

---

## The Four Personal Attributes

| Attribute | Range | Effect On | Formula Location |
|-----------|-------|-----------|------------------|
| **Financial Stability** | 1-10 | Battle offer frequency | `app/api/internal/generate-battle-offers/route.ts:50-57` |
| **Reputation** | 1-10 | Opponent difficulty | `lib/services/battleOffers.ts:86-90` |
| **Family Bond** | 1-10 | Choke resistance | `lib/game/simulation.ts:595` |
| **Preparation** | 1-10 | Prep efficiency | `lib/game/simulation.ts:314-316` |

---

## Formulas

### Family Bond → Choke Resistance
```typescript
effective_resilience = resilience + (family_bond / 10)
```
**Impact:** +0.1 to +1.0 effective resilience

### Reputation → Opponent Rating
```typescript
reputation_adjustment = (reputation - 5) * 50
target_rating = player_rating + reputation_adjustment
```
**Impact:** -200 to +250 rating adjustment

### Financial Stability → Offer Count
```typescript
if (financial_stability <= 3) → 2-3 offers
else if (financial_stability <= 6) → 1-2 offers
else → 1 offer
```
**Impact:** 1-3 battle offers per generation cycle

### Preparation → Prep Multiplier
```typescript
prep_efficiency = 1 + (preparation / 20)
effective_prep = base_prep * prep_efficiency
```
**Impact:** 1.05x to 1.5x prep effectiveness

---

## Quick Impact Table

| Value | Fin Stability | Reputation | Family Bond | Preparation |
|-------|---------------|------------|-------------|-------------|
| **1**  | 2-3 offers | -200 rating | +0.1 res | 1.05x prep |
| **3**  | 2-3 offers | -100 rating | +0.3 res | 1.15x prep |
| **5**  | 1-2 offers | 0 rating | +0.5 res | 1.25x prep |
| **7**  | 1 offer | +100 rating | +0.7 res | 1.35x prep |
| **10** | 1 offer | +250 rating | +1.0 res | 1.50x prep |

---

## File Locations

### Core Logic
- **Simulation:** `lib/game/simulation.ts`
  - Line 595: Family bond choke calculation
  - Lines 314-316: Preparation prep efficiency

### Battle Offers
- **Offer Service:** `lib/services/battleOffers.ts`
  - Lines 69-104: Reputation-based opponent matching

- **Offer Generation:** `app/api/internal/generate-battle-offers/route.ts`
  - Lines 36-66: Financial stability offer frequency

### Models
- **Types:** `lib/models/index.ts`
  - Lines 48-53: PersonalStats interface

### Database
- **Migration:** `supabase/migrations/20251125000000_add_preparation_attribute.sql`
- **Seed Data:** `supabase/migrations/002_seed_data.sql` (lines 78-98)

---

## Testing Locations

- **Unit Tests:** `tests/personal-attributes-integration.test.ts`
- **Documentation:** `PERSONAL_ATTRIBUTES_INTEGRATION.md`
- **Flow Diagram:** `PERSONAL_ATTRIBUTES_FLOW.md`
- **Change Log:** `PERSONAL_ATTRIBUTES_CHANGES.md`

---

## Configuration Constants

```typescript
// In lib/game/simulation.ts
CONFIG = {
  CHOKE_RESILIENCE_FACTOR: 0.025,  // How much resilience reduces choke
  PREP_EFFECT_MULTIPLIER: 0.10,    // Base prep effectiveness
}

// In lib/services/battleOffers.ts
REPUTATION_MULTIPLIER = 50  // Rating points per reputation point
RATING_RANGE = 200          // Base rating search range

// In app/api/internal/generate-battle-offers/route.ts
LOW_FIN_THRESHOLD = 3   // Financial stability <= 3 gets more offers
MID_FIN_THRESHOLD = 6   // Financial stability <= 6 gets normal offers
```

---

## Common Use Cases

### Check if battler has high choke risk
```typescript
const effectiveResilience = battler.resilience + (battler.personal.family_bond / 10);
const isHighRisk = effectiveResilience < 5;
```

### Calculate expected opponent rating
```typescript
const adjustment = (battler.personal.reputation - 5) * 50;
const expectedOpponentRating = battler.rating + adjustment;
```

### Determine offer count for battler
```typescript
const finStability = battler.personal.financial_stability;
const expectedOffers = finStability <= 3 ? "2-3" : finStability <= 6 ? "1-2" : "1";
```

### Calculate prep effectiveness
```typescript
const prep = battler.personal.preparation;
const efficiency = 1 + (prep / 20);
const effectiveBoost = basePrepBoost * efficiency;
```

---

## Integration Points

### Where Personal Attributes Are Used

1. **Battle Simulation** (`lib/game/simulation.ts`)
   - Family bond: Choke calculation (line 595)
   - Preparation: Prep modifier calculation (lines 314-376)

2. **Battle Offers** (`lib/services/battleOffers.ts`)
   - Reputation: Opponent matching (lines 86-104)

3. **Offer Generation** (`app/api/internal/generate-battle-offers/route.ts`)
   - Financial stability: Offer frequency (lines 36-66)

4. **Life Prep** (various life event files)
   - All personal attributes can be modified by life events
   - Life prep increases family_bond, financial_stability, preparation

### Where Personal Attributes Are Modified

1. **Life Events** (`lib/game/lifeEvents.ts`)
2. **Life Prep** (`lib/game/simulation.ts` - prep modifiers)
3. **Attribute Progression** (`lib/game/progression.ts`)

---

## Debugging Tips

### Check personal attribute values
```typescript
console.log('Personal attrs:', battler.personal);
// Should show: { financial_stability, reputation, family_bond, preparation }
```

### Verify choke calculation
```typescript
const effectiveRes = attrs.resilience + (attrs.personal.family_bond / 10);
console.log('Effective resilience:', effectiveRes);
```

### Check prep efficiency
```typescript
const prepEff = 1 + (attrs.personal.preparation / 20);
console.log('Prep efficiency multiplier:', prepEff);
```

### Verify opponent matching
```typescript
const repAdj = (playerRep - 5) * 50;
const targetRating = playerRating + repAdj;
console.log('Target opponent rating:', targetRating);
```

---

## Migration Checklist

- [ ] Run migration: `supabase db push`
- [ ] Verify all battlers have `preparation` field
- [ ] Test battle simulation with family bond
- [ ] Test battle offers with reputation
- [ ] Test offer generation with financial stability
- [ ] Test prep effectiveness with preparation
- [ ] Run integration tests
- [ ] Monitor choke rates
- [ ] Monitor opponent difficulty
- [ ] Monitor offer frequency

---

## Quick Wins for Players

**Want to stop choking?**
→ Increase family_bond through life prep

**Want easier opponents?**
→ Lower reputation (or wait for scandals)

**Want more battle offers?**
→ Lower financial_stability (or spend money)

**Want better prep results?**
→ Increase preparation through life prep

---

## Related Systems

- **Badges:** Multiply with personal attributes (e.g., "Consistent" + high family_bond)
- **Life Events:** Can modify personal attributes (positive or negative)
- **Progression:** Battle XP can be invested in personal attributes
- **Prep System:** All prep types affected by preparation multiplier

---

## Performance Notes

- All formulas are simple arithmetic (no database queries)
- Personal attributes loaded once per battle
- No significant performance impact
- Caching recommended for offer generation if called frequently
