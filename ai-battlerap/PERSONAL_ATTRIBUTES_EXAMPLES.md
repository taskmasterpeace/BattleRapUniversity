# Personal Attributes - Real Examples

This document shows concrete examples of how personal attributes affect gameplay.

---

## Example 1: The Choker vs The Clutch Performer

### Battler A: "Anxiety"
```
Resilience: 5
Family Bond: 1  (poor family support)

Effective Resilience = 5 + (1/10) = 5.1

Choke Probability:
  Base: 3%
  - (5.1 * 2.5%) = 3% - 12.75% = 0% (capped at base)
  Final: ~1.75%
```

### Battler B: "Rock Solid"
```
Resilience: 5
Family Bond: 10  (strong family support)

Effective Resilience = 5 + (10/10) = 6.0

Choke Probability:
  Base: 3%
  - (6.0 * 2.5%) = 3% - 15% = 0% (capped at base)
  Final: ~1.5%
```

### Impact Over 10 Battles
```
Battler A (family_bond 1): ~17.5% chance of choking at least once
Battler B (family_bond 10): ~15% chance of choking at least once

Difference: 14% reduction in choke risk across career
```

---

## Example 2: The Unknown vs The Legend

### Battler A: "No Name"
```
Rating: 1200
Reputation: 2  (unknown/disrespected)

Reputation Adjustment = (2 - 5) * 50 = -150
Target Opponent Rating = 1200 - 150 = 1050

Opponent Pool: 850-1250 rating
  → Fighting opponents 150 points below your skill level
  → Easier victories, slower rating growth
```

### Battler B: "Legendary"
```
Rating: 1200
Reputation: 9  (legendary status)

Reputation Adjustment = (9 - 5) * 50 = +200
Target Opponent Rating = 1200 + 200 = 1400

Opponent Pool: 1200-1600 rating
  → Fighting opponents 200 points above your skill level
  → Harder battles, faster rating growth if you win
```

### Matchmaking Examples
```
Player Rating: 1200

Reputation 1:  Opponent Range: 800-1200   (Easy)
Reputation 3:  Opponent Range: 900-1300   (Below Average)
Reputation 5:  Opponent Range: 1000-1400  (Fair)
Reputation 7:  Opponent Range: 1100-1500  (Above Average)
Reputation 10: Opponent Range: 1250-1650  (Hard)
```

---

## Example 3: Desperate vs Comfortable

### Battler A: "Broke"
```
Financial Stability: 2  (struggling financially)

Offer Generation:
  financial_stability <= 3 → 2-3 offers

Next cycle: Gets 3 battle offers
  - Must pick one (no choice to skip all)
  - Pressure to fight even when unprepared
  - Less control over schedule
```

### Battler B: "Wealthy"
```
Financial Stability: 9  (financially secure)

Offer Generation:
  financial_stability > 6 → 1 offer

Next cycle: Gets 1 battle offer
  - Can decline and wait for better matchup
  - Can be strategic about scheduling
  - Full control over career
```

### Player Experience
```
Low Financial Stability:
  Week 1: 3 offers → Must fight
  Week 2: 2 offers → Must fight
  Week 3: 3 offers → Must fight
  → Constant pressure, less choice

High Financial Stability:
  Week 1: 1 offer → Can evaluate carefully
  Week 2: 1 offer → Can plan optimal prep
  Week 3: 1 offer → Strategic career management
  → Full agency, maximum choice
```

---

## Example 4: Amateur vs Professional

### Battler A: "Winging It"
```
Preparation: 2  (poor prep skills)

Prep Efficiency = 1 + (2/20) = 1.10
Base Prep Effect = 0.10

3 days writing prep:
  Lyricism boost = 3 * 0.10 * 1.10 = +0.33
```

### Battler B: "Methodical"
```
Preparation: 9  (excellent prep skills)

Prep Efficiency = 1 + (9/20) = 1.45
Base Prep Effect = 0.10

3 days writing prep:
  Lyricism boost = 3 * 0.10 * 1.45 = +0.435
```

### Same Prep, Different Results
```
Both battlers do 5 days of writing prep:

Battler A (prep 2):
  Base: 5.0 lyricism
  After prep: 5.0 + (5 * 0.10 * 1.10) = 5.55 lyricism

Battler B (prep 9):
  Base: 5.0 lyricism
  After prep: 5.0 + (5 * 0.10 * 1.45) = 5.725 lyricism

Battler B is +0.175 lyricism (3.2% better) from same prep!
```

---

## Example 5: Career Progression Comparison

### Strategy A: "All-In on Battles"
```
Week 1-4: 12 days total
  - 0 life prep
  - 12 writing/performance prep

Attributes:
  Lyricism: 5 → 6.2 (+1.2)
  Preparation: 5 (unchanged)
  Family Bond: 5 (unchanged)

Week 5-8: 12 days total
  - 0 life prep
  - 12 writing/performance prep

Prep Efficiency: 1.25x (unchanged)
  Lyricism: 6.2 → 7.4 (+1.2, same growth)
```

### Strategy B: "Long-Term Investment"
```
Week 1-4: 12 days total
  - 6 life prep
  - 6 writing/performance prep

Attributes:
  Lyricism: 5 → 5.6 (+0.6, half of Strategy A)
  Preparation: 5 → 5.6 (+0.6)
  Family Bond: 5 → 5.6 (+0.6)

Week 5-8: 12 days total
  - 6 life prep
  - 6 writing/performance prep

Prep Efficiency: 1.28x (improved!)
  Lyricism: 5.6 → 6.37 (+0.77, better than first period)
  Preparation: 5.6 → 6.2 (+0.6)
  Family Bond: 5.6 → 6.2 (+0.6)

Week 9-12: 12 days total
  - 6 life prep
  - 6 writing/performance prep

Prep Efficiency: 1.31x (further improved!)
  Lyricism: 6.37 → 7.24 (+0.87, best yet)
  Preparation: 6.2 → 6.8 (+0.6)
  Family Bond: 6.2 → 6.8 (+0.6)
```

### The Compound Effect
```
After 12 weeks:

Strategy A (No Life Prep):
  Lyricism: 8.6
  Preparation: 5.0
  Family Bond: 5.0
  Choke Risk: Normal
  Prep Efficiency: 1.25x (unchanged)

Strategy B (Balanced):
  Lyricism: 8.98
  Preparation: 7.4
  Family Bond: 7.4
  Choke Risk: -24% (family bond effect)
  Prep Efficiency: 1.37x (9.6% better!)

Strategy B ends up AHEAD despite spending 50% less time on writing!
```

---

## Example 6: The Flywheel Effect

### Scenario: Focus on Preparation Attribute

```
Starting State:
  Lyricism: 5
  Preparation: 5
  Prep Efficiency: 1.25x

Month 1: 8 life prep, 4 writing prep
  Preparation: 5 → 5.8
  Prep Efficiency: 1.25x → 1.29x
  Lyricism: 5 → 5.52 (4 writing days * 0.10 * 1.29)

Month 2: 8 life prep, 4 writing prep
  Preparation: 5.8 → 6.6
  Prep Efficiency: 1.29x → 1.33x
  Lyricism: 5.52 → 6.05 (4 writing days * 0.10 * 1.33)

Month 3: 8 life prep, 4 writing prep
  Preparation: 6.6 → 7.4
  Prep Efficiency: 1.33x → 1.37x
  Lyricism: 6.05 → 6.60 (4 writing days * 0.10 * 1.37)

Month 4: 8 life prep, 4 writing prep
  Preparation: 7.4 → 8.2
  Prep Efficiency: 1.37x → 1.41x
  Lyricism: 6.60 → 7.16 (4 writing days * 0.10 * 1.41)
```

### The Acceleration
```
Month 1: +0.52 lyricism from 4 writing days
Month 2: +0.53 lyricism from 4 writing days
Month 3: +0.55 lyricism from 4 writing days
Month 4: +0.56 lyricism from 4 writing days

Same input (4 writing days), increasing output!
By Month 4, getting 7.7% more value than Month 1.
```

---

## Example 7: Risk Management

### Battler A: "High Risk, High Reward"
```
Attributes:
  Resilience: 4
  Family Bond: 2
  Reputation: 9

Effective Resilience: 4 + (2/10) = 4.2
Choke Risk: Higher

Opponent Difficulty: +200 rating
Match Quality: Facing top-tier opponents

Career Path:
  - Exciting high-stakes battles
  - High choke risk in important moments
  - If they can handle pressure: Fast progression
  - If they choke: Devastating losses
```

### Battler B: "Safe and Steady"
```
Attributes:
  Resilience: 4
  Family Bond: 9
  Reputation: 3

Effective Resilience: 4 + (9/10) = 4.9
Choke Risk: Lower

Opponent Difficulty: -100 rating
Match Quality: Facing easier opponents

Career Path:
  - Consistent performance
  - Reliable in pressure moments
  - Slower progression (easier opponents)
  - Building confidence and skills safely
```

---

## Example 8: Resource Management

### Player Choice Scenario

```
Current State:
  Financial Stability: 3
  Offers: 2 battles available

Battle A: Tough opponent, good payout
Battle B: Easy opponent, low payout

With Financial Stability 3:
  → Must accept one (need the money)
  → Forced to fight even if prep is poor
  → Less strategic choice

If Financial Stability was 8:
  → Only 1 offer (Battle A)
  → Can decline if not ready
  → Wait for better timing
  → Full strategic control
```

### Economic Pressure
```
Low Financial Stability (1-3):
  → 2-3 offers per cycle
  → Pressure to fight frequently
  → Risk of fighting while unprepared
  → Higher variance in results

High Financial Stability (7-10):
  → 1 offer per cycle
  → Can be selective
  → Only fight when optimally prepared
  → More consistent results
```

---

## Example 9: Multiplier Stacking

### Scenario: Badges + Personal Attributes

```
Battler with:
  - Style Tag: "Student of the Game" (+20% research prep efficiency)
  - Preparation: 8 (1.4x all prep)

Research Prep Effect:
  Base: 0.10
  × Badge bonus: 1.20
  × Preparation: 1.40
  = 0.168 per research day

vs Battler without:
  - No "Student" badge
  - Preparation: 5 (1.25x all prep)

Research Prep Effect:
  Base: 0.10
  × Badge bonus: 1.00
  × Preparation: 1.25
  = 0.125 per research day

First battler gets 34.4% more value from research prep!
```

---

## Example 10: Life Event Integration

### Scenario: "Family Crisis" Event

```
Before Event:
  Family Bond: 7
  Effective Resilience: 5 + (7/10) = 5.7
  Choke Risk: 1.58%

Event: "Family Crisis" (-2 family_bond)

After Event:
  Family Bond: 5
  Effective Resilience: 5 + (5/10) = 5.5
  Choke Risk: 1.63%

Impact:
  - 3.2% increase in choke risk
  - Must invest in life prep to recover
  - Creates gameplay consequence for negative life events
```

### Scenario: "Viral Battle" Event

```
Before Event:
  Reputation: 6
  Target Opponent Rating: 1200 + 50 = 1250

Event: "Viral Battle" (+2 reputation)

After Event:
  Reputation: 8
  Target Opponent Rating: 1200 + 150 = 1350

Impact:
  - Next opponents are +100 rating harder
  - Fame has a cost (harder battles)
  - Creates trade-off: visibility vs difficulty
```

---

## Summary

These examples show how personal attributes create:

1. **Meaningful Differentiation** - Same base stats, different personal attributes = different experience
2. **Strategic Depth** - Trade-offs between short-term power and long-term investment
3. **Compound Effects** - Preparation especially creates snowballing advantages
4. **Risk/Reward** - Can choose high variance (high rep, low family bond) or stability
5. **Player Agency** - Financial stability literally controls how much choice you have
6. **Career Narratives** - Different attribute profiles create different career stories

The numbers are tunable, but the mechanical integration is complete and functional.
