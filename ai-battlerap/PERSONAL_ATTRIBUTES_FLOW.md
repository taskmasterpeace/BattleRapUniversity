# Personal Attributes Data Flow

This document shows how personal attributes flow through the system and affect gameplay.

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    BATTLER ATTRIBUTES                           │
│                                                                 │
│  personal: {                                                    │
│    financial_stability: 1-10                                    │
│    reputation: 1-10                                             │
│    family_bond: 1-10                                            │
│    preparation: 1-10                                            │
│  }                                                              │
└───────────────┬────────────┬────────────┬────────────┬─────────┘
                │            │            │            │
                │            │            │            │
                ▼            ▼            ▼            ▼
    ┌───────────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐
    │ FINANCIAL     │  │ REPUTA- │  │ FAMILY  │  │ PREPARA- │
    │ STABILITY     │  │ TION    │  │ BOND    │  │ TION     │
    └───────┬───────┘  └────┬────┘  └────┬────┘  └────┬─────┘
            │               │            │            │
            │               │            │            │
            ▼               ▼            ▼            ▼
    ┌───────────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐
    │ Battle Offer  │  │ Opponent│  │ Choke   │  │ Prep     │
    │ Frequency     │  │ Matching│  │ Resist  │  │ Efficiency│
    └───────┬───────┘  └────┬────┘  └────┬────┘  └────┬─────┘
            │               │            │            │
            │               │            │            │
            ▼               ▼            ▼            ▼
    ┌───────────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐
    │ Offer Count   │  │ AI      │  │ Segment │  │ Attribute│
    │ (1-3)         │  │ Rating  │  │ Scores  │  │ Boosts   │
    └───────────────┘  └─────────┘  └─────────┘  └──────────┘
```

---

## Attribute Effects Timeline

### 1. Before Battle (Offer Generation)

**Financial Stability** → Determines how many offers you receive
```
Low (1-3):   "Desperate for money"
             → 2-3 battle offers
             → Less choice, must fight more

Mid (4-6):   "Stable"
             → 1-2 battle offers
             → Some flexibility

High (7-10): "Comfortable"
             → 1 battle offer
             → Can be selective
```

**Reputation** → Determines opponent difficulty
```
Low (1-3):   "Unknown/Disrespected"
             → -200 to -100 rating
             → Easier opponents

Mid (4-6):   "Established"
             → -50 to +50 rating
             → Fair matchmaking

High (7-10): "Legendary"
             → +100 to +250 rating
             → Tougher opponents
```

### 2. During Prep Phase

**Preparation** → Multiplies effectiveness of ALL prep types
```
Low (1-3):   1.05-1.15x prep boost
Mid (4-6):   1.20-1.30x prep boost
High (7-10): 1.35-1.50x prep boost

Example:
  Battler A (prep=2): 3 writing days → +0.315 lyricism
  Battler B (prep=8): 3 writing days → +0.420 lyricism
  Battler B gets 33% more value from same prep!
```

### 3. During Battle (Simulation)

**Family Bond** → Reduces choke probability
```
Formula: effective_resilience = resilience + (family_bond / 10)

Example Choke Probability:
  Resilience 5, Family Bond 1:
    → Effective Resilience 5.1
    → Choke Chance: ~1.725%

  Resilience 5, Family Bond 10:
    → Effective Resilience 6.0
    → Choke Chance: ~1.5%
    → 13% reduction in choke risk!
```

---

## Life Prep Integration

Life prep now affects personal attributes, which have downstream effects:

```
LIFE PREP
    │
    ├─→ +family_bond
    │       └─→ Lower choke risk in battles
    │
    ├─→ +financial_stability
    │       └─→ Fewer offers (more choice)
    │
    ├─→ +preparation
    │       └─→ Future prep more effective (compounding!)
    │
    └─→ +reputation (sometimes)
            └─→ Tougher opponents
```

### Strategic Trade-off:
- **Short-term:** Life prep doesn't directly improve battle performance
- **Long-term:** Life prep creates compounding advantages
- **Decision:** Sacrifice immediate power for long-term benefits?

---

## Compound Effects Example

### Scenario: Player focuses on Life Prep

**Week 1-2:**
- 5 days life prep → family_bond +0.5, preparation +0.3
- Battle performance: Slightly worse (less writing/performance prep)

**Week 3-4:**
- Higher preparation (5.3) → All prep 26.5% more effective
- Higher family_bond (5.5) → Choke risk reduced
- Battle performance: Back to baseline

**Week 5-6:**
- Continued life prep → preparation now 6.0
- All prep now 30% more effective
- Can achieve same results with fewer prep days
- Battle performance: Better than baseline

**Week 10:**
- Preparation: 7.5 → 37.5% prep boost
- Family bond: 7.0 → +0.7 resilience buffer
- Financial stability: 8.0 → Only 1 offer (full choice)
- Battle performance: Significantly better with same effort

**The Flywheel Effect:**
```
Life Prep → +Preparation → More Effective Prep → Better Battles
     ↑                                                 ↓
     └─────────────── More Resources ─────────────────┘
```

---

## Extreme Cases

### Max Personal Attributes (All 10)
```
Financial Stability 10: Only 1 battle offer (maximum choice)
Reputation 10:          +250 rating opponents (hardest difficulty)
Family Bond 10:         +1.0 resilience (near-immune to choking)
Preparation 10:         1.5x prep effectiveness (50% boost)
```

### Min Personal Attributes (All 1)
```
Financial Stability 1:  2-3 battle offers (forced to fight)
Reputation 1:           -200 rating opponents (easiest difficulty)
Family Bond 1:          +0.1 resilience (high choke risk)
Preparation 1:          1.05x prep effectiveness (minimal boost)
```

### Balanced (All 5)
```
Financial Stability 5:  1-2 battle offers (normal)
Reputation 5:           0 rating adjustment (fair matchmaking)
Family Bond 5:          +0.5 resilience (moderate protection)
Preparation 5:          1.25x prep effectiveness (25% boost)
```

---

## Integration with Other Systems

### Badges + Personal Attributes
```
Style Tag: "Consistent"
  → +consistencyBonus in battles
  → Works WITH family_bond to reduce variance

Style Tag: "Student of the Game"
  → +researchPrepEfficiency
  → Multiplied BY preparation attribute
  → Compound effect!
```

### Life Events + Personal Attributes
```
Life Event: "Family Crisis"
  → -2 family_bond
  → Immediate: Higher choke risk
  → Long-term: Must spend life prep to recover

Life Event: "Viral Battle"
  → +1 reputation
  → Immediate: Tougher opponents next time
  → Trade-off: Fame vs difficulty
```

### Progression + Personal Attributes
```
Battle XP → Attribute Growth
  → Can invest in personal attributes
  → Preparation grows slowly but compounds
  → Family bond protects investments (less choking)
```

---

## Player Archetypes

### The Grinder (Low Financial Stability)
- 2-3 offers per cycle
- Must fight frequently
- Can't be picky about opponents
- High volume, lower choice

### The Professional (High Preparation)
- Every prep day counts extra
- Efficient use of time
- Compound growth over career
- Long-term planning pays off

### The People's Champion (High Family Bond)
- Rock-solid under pressure
- Rarely chokes
- Consistent performance
- Reliable in big moments

### The Legend (High Reputation)
- Only faces top-tier opponents
- High risk, high reward
- Career built on tough battles
- Difficulty constantly scaling

---

## Balance Knobs

If personal attributes feel too strong/weak, adjust these:

```typescript
// Family Bond strength
const familyBondDivisor = 10;  // Currently 10, lower = stronger
effective_resilience = resilience + (family_bond / familyBondDivisor);

// Reputation impact
const reputationMultiplier = 50;  // Currently 50, higher = more extreme
target_rating = player_rating + (reputation - 5) * reputationMultiplier;

// Preparation effectiveness
const preparationDivisor = 20;  // Currently 20, lower = stronger
prep_efficiency = 1 + (preparation / preparationDivisor);

// Financial stability thresholds
const LOW_THRESHOLD = 3;   // Currently 3
const MID_THRESHOLD = 6;   // Currently 6
```

---

## Summary

Personal attributes now create a **web of interconnected effects**:

1. **Financial Stability** controls **agency** (how many choices you have)
2. **Reputation** controls **challenge** (how hard opponents are)
3. **Family Bond** controls **reliability** (how consistent you are)
4. **Preparation** controls **efficiency** (how much you get from prep)

Together, they make **Life prep strategically meaningful** and create **long-term vs short-term trade-offs** that add depth to player decision-making.
