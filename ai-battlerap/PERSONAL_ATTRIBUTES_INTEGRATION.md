# Personal Attributes Integration

This document describes how personal attributes (Financial Stability, Reputation, Family Bond, Preparation) now affect battles and gameplay.

## Overview

Previously, personal attributes existed but had **ZERO** effect on battles or matchmaking. This integration makes them meaningful and impactful.

## Changes Implemented

### 1. Family Bond → Resilience Buffer (Choke Calculation)

**File:** `lib/game/simulation.ts` (line 595)

**Formula:**
```typescript
effective_resilience = resilience + (family_bond / 10)
```

**Effect:**
- Family bond acts as an additive resilience buffer
- Higher family bond = lower chance of choking under pressure
- Example: A battler with resilience 5 and family_bond 8 has effective resilience of 5.8

**Impact:**
```
family_bond = 1  → +0.1 resilience
family_bond = 5  → +0.5 resilience
family_bond = 10 → +1.0 resilience
```

**Gameplay Meaning:**
- Battlers with strong family support can handle pressure better
- Life prep that improves family_bond now directly reduces choke risk
- Creates strategic value for maintaining family relationships

---

### 2. Reputation → Opponent Matching

**File:** `lib/services/battleOffers.ts` (lines 86-90)

**Formula:**
```typescript
reputation_adjustment = (player_reputation - 5) * 50
target_rating = player_rating + reputation_adjustment
```

**Effect:**
- Higher reputation = tougher AI opponents
- Lower reputation = easier opponents
- Reputation acts as a modifier on the rating range used for matchmaking

**Impact:**
```
reputation = 1  → -200 rating adjustment (easier opponents)
reputation = 5  → 0 rating adjustment (neutral)
reputation = 10 → +250 rating adjustment (tougher opponents)
```

**Gameplay Meaning:**
- As your reputation grows, you face tougher competition
- Scandals that damage reputation will result in easier matchups
- Creates natural difficulty progression tied to career success

---

### 3. Financial Stability → Battle Offer Frequency

**File:** `app/api/internal/generate-battle-offers/route.ts` (lines 50-57)

**Formula:**
```typescript
if (financial_stability <= 3) {
  offer_count = 2-3 offers  // Need money, take more fights
} else if (financial_stability <= 6) {
  offer_count = 1-2 offers  // Balanced
} else {
  offer_count = 1 offer     // Can be selective
}
```

**Effect:**
- Low financial stability = 2-3 battle offers (desperate for money)
- Mid financial stability = 1-2 battle offers (normal)
- High financial stability = 1 battle offer (can be picky)

**Gameplay Meaning:**
- Financial struggles force you to fight more often
- Financial success gives you choice and control over matchmaking
- Life events that affect finances now have gameplay consequences

---

### 4. Preparation Attribute → Prep Efficiency

**File:** `lib/game/simulation.ts` (lines 314-316)

**Formula:**
```typescript
preparation_attribute = personal.preparation (1-10)
prep_efficiency_multiplier = 1 + (preparation / 20)
effective_prep_multiplier = base_prep_modifier * prep_efficiency_multiplier
```

**Effect:**
- Higher preparation attribute = more effective prep days
- Applies to ALL prep types (writing, performance, research, rest, life)

**Impact:**
```
preparation = 1  → 1.05x prep effectiveness
preparation = 5  → 1.25x prep effectiveness
preparation = 10 → 1.50x prep effectiveness
```

**Gameplay Meaning:**
- Battlers who are naturally good at preparation get more value from prep time
- A battler with high preparation can achieve better results with fewer prep days
- Life prep that improves preparation creates compounding benefits

---

## Database Schema Changes

### New Attribute: `preparation`

**Added to:** `PersonalStats` interface in `lib/models/index.ts`

**Migration:** `supabase/migrations/20251125000000_add_preparation_attribute.sql`

**Default Values:**
- Player battlers: `5` (baseline)
- AI battlers (low tier): `4`
- AI battlers (mid tier): `5`
- AI battlers (top tier): `7`

**Storage:**
- Stored as JSONB field in `battler_attributes.personal`
- No schema changes required (JSONB is flexible)
- Migration updates all existing records with default value of 5

---

## Testing Scenarios

### Test 1: Family Bond Reduces Choke Rate
1. Create battler with high family bond (8-10)
2. Create battler with low family bond (1-3)
3. Run multiple battles with same attributes except family bond
4. Verify battler with high family bond chokes less frequently

### Test 2: Reputation Affects Opponent Difficulty
1. Create battler with high reputation (8-10)
2. Generate battle offers
3. Verify opponents have higher ratings (approximately +150-250 rating)
4. Create battler with low reputation (1-3)
5. Verify opponents have lower ratings (approximately -200-100 rating)

### Test 3: Financial Stability Affects Offer Count
1. Create battler with low financial stability (1-3)
2. Trigger offer generation
3. Verify 2-3 offers are generated
4. Create battler with high financial stability (7-10)
5. Verify only 1 offer is generated

### Test 4: Preparation Improves Prep Effectiveness
1. Create battler with high preparation (8-10)
2. Do 3 days of writing prep
3. Compare attribute improvements to battler with low preparation (1-3)
4. High preparation battler should show 30-40% better improvements

---

## Integration with Life Events

Life prep now has **meaningful impact** through multiple pathways:

1. **Direct Effects:**
   - Improves family_bond → reduces choke risk
   - Improves financial_stability → reduces offer pressure
   - Improves preparation → increases all future prep efficiency

2. **Indirect Effects:**
   - Better family relationships provide resilience safety net
   - Financial security allows strategic battle selection
   - Preparation skills compound over time

3. **Trade-offs:**
   - Life prep takes time away from writing/performance prep
   - But provides long-term benefits that accumulate
   - Creates strategic depth: short-term vs long-term optimization

---

## Balancing Considerations

### Family Bond
- **Current:** +0.1 to +1.0 effective resilience
- **Tunable:** `family_bond / 10` factor in choke calculation
- **Risk:** Too strong could eliminate choke risk entirely

### Reputation
- **Current:** ±250 rating points at extremes
- **Tunable:** Multiplier in `(reputation - 5) * 50`
- **Risk:** Could create difficulty spikes or make progression too easy

### Financial Stability
- **Current:** 1-3 offers based on tier
- **Tunable:** Thresholds (currently 3, 6) and offer counts
- **Risk:** Too many offers could overwhelm player

### Preparation
- **Current:** 5-50% boost to prep effectiveness
- **Tunable:** Divisor in `preparation / 20`
- **Risk:** Could create runaway advantage if too strong

---

## Configuration Constants

All formulas use tunable constants that can be adjusted for balance:

```typescript
// In simulation.ts
CONFIG = {
  CHOKE_RESILIENCE_FACTOR: 0.025  // How much resilience reduces choke
  PREP_EFFECT_MULTIPLIER: 0.10    // Base prep effectiveness
  // ... other constants
}

// In battleOffers.ts
const REPUTATION_MULTIPLIER = 50  // Rating adjustment per reputation point
const RATING_RANGE = 200          // Base rating search range

// In generate-battle-offers/route.ts
const LOW_FIN_THRESHOLD = 3      // Financial stability threshold for high offers
const MID_FIN_THRESHOLD = 6      // Financial stability threshold for normal offers
```

---

## Summary

All four personal attributes now have **measurable, meaningful effects** on gameplay:

1. **Family Bond:** Reduces choke risk by buffering resilience
2. **Reputation:** Determines opponent difficulty
3. **Financial Stability:** Controls number of battle offers
4. **Preparation:** Multiplies effectiveness of all prep days

These changes make Life prep strategically valuable and create interesting long-term vs short-term trade-offs for players.
