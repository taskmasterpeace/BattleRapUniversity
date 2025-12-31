# ALGORITHM INSTITUTE TEST CARD 2

## The Fanbase System Introduction Card

**League:** Main Stage Arena
**Venue:** The Bunker (Los Angeles)
**Capacity:** 400
**Date:** Algorithm Institute Beta Testing - Phase 2
**Theme:** "UNDERSTANDING THE CROWD"

---

## PART 1: NEW SYSTEM - ARTIST FANBASE MECHANICS

### OVERVIEW

Every battler now brings their own fans to the venue. These fans:
- Favor their battler in scoring
- Come from demographics that match the battler's style
- Create "home game" advantages
- Affect momentum and crowd reactions

### FANBASE CALCULATION

```
BASE FANS = popularity_score / 10

Example: Popularity 70 = 7% of crowd are your fans
```

#### Badge Bonuses

| Badge | Effect |
|-------|--------|
| `cult_following` | +5% fans at every event |
| `hometown_hero` | +10% fans when in hometown |
| `local_hero` | +5% fans when in your region |

#### Hometown Bonus

- Battling in your city: +15% fans
- **Conflict Rule:** If both battlers from same city, bonus cancels out

### DEMOGRAPHIC MATCHING

Your fans come from demographics that match your style:

| Battler Style | Primary Fan Demographic |
|---------------|------------------------|
| Technical/Lyrical | Purists (Tech Heads) |
| Street/Authentic | Street Fans |
| Comedy/Entertainment | Comedy Fans |
| Aggressive/Energy | Aggression Fans |
| Showman/Charismatic | Performance Fans |

### FAN SPLIT FORMULA (When Both Match Same Demographic)

```
Your fans = Demographic size × (Your popularity / Combined popularity)

Example: Both match Purists (10% of crowd)
- You: popularity 70
- Opponent: popularity 50
- Combined: 120
- You get: 10% × (70/120) = 5.8% as your fans
- Opponent gets: 10% × (50/120) = 4.2% as their fans
```

### FAN EFFECTS

**1. Momentum Bonus** (Primary Effect)
```
Momentum modifier = (Your fan % - 0.5) × 0.5

60% fans = +0.05 momentum boost
30% fans = -0.10 momentum (hostile crowd)
```

**2. Crowd Reaction Bonus** (Secondary Effect)
```
Crowd reaction multiplier = 1.0 + (Your fan % × 0.3)

60% fans = 1.18x crowd reaction display
30% fans = 1.09x crowd reaction display
```

---

## PART 2: MAIN STAGE ARENA - LEAGUE PROFILE

### Demographics Distribution

| Demographic | Percentage | What They Love |
|-------------|------------|----------------|
| **Performance Fans** | 30% | Theatrics, charisma, showmanship |
| **Aggression Fans** | 25% | Intensity, energy, aggressive delivery |
| **Street Fans** | 20% | Realness, lived experience, authenticity |
| **Comedy Fans** | 15% | Entertainment, humor, crowd reactions |
| **Purists** | 10% | Technical writing, complexity, wordplay |

### League Weights

- **Performance Weight:** 60%
- **Writing Weight:** 40%

*Main Stage Arena favors performance over pure pen game*

---

## PART 3: THE TEST CARD - BATTLER PROFILES

### BATTLE 1: "THE GOD TIER CLASSIC"
**Lux Coded (The Architect) vs Gotti Geechi (The Compton Crip)**

| | Lux Coded | Gotti Geechi |
|---|---|---|
| **Real Inspiration** | Loaded Lux | Geechi Gotti |
| **Tier** | GOD | GOD |
| **Region** | Northeast | West Coast |
| **City** | Harlem, NY | Compton, CA |
| **Popularity** | 85 | 80 |
| **Badges** | bar_god, metaphor_master, technical_writer, scheme_specialist, respected_veteran | storyteller, pocket_checker, street_battler, respected_veteran, clutch_performer |
| **Style** | Elite pen, scheme master | Storyteller, street credibility |

#### Badge Effects Analysis

**Lux Coded:**
- `bar_god` → No choke/stumble modifiers (writing badge)
- `metaphor_master` → No choke/stumble modifiers
- `technical_writer` → No choke/stumble modifiers
- `scheme_specialist` → No choke/stumble modifiers
- `respected_veteran` → No choke/stumble modifiers
- **TOTAL: No protection, standard risk**

**Gotti Geechi:**
- `storyteller` → No choke/stumble modifiers
- `pocket_checker` → No choke/stumble modifiers
- `street_battler` → No choke/stumble modifiers
- `clutch_performer` → **-6% choke per segment!**
- **TOTAL: MAJOR choke protection**

#### Fanbase Calculation

**Venue:** The Bunker (Los Angeles) - 400 capacity

**Lux Coded (Harlem, NY):**
- Base fans: 85 / 10 = 8.5%
- Hometown bonus: 0% (not in NY)
- Style match: Purists (tech heads love Lux)
- Purist share: 10% × (85/165) = 5.2%
- **Total Lux fans: ~13% of crowd (52 people)**

**Gotti Geechi (Compton, CA):**
- Base fans: 80 / 10 = 8.0%
- Hometown bonus: +15% (battling in LA!)
- Style match: Street Fans (Geechi is street)
- Street share: 20% × (80/80) = 20% (no competition)
- **Total Geechi fans: ~43% of crowd (172 people)**

**Crowd Composition:**
```
┌─────────────────────────────────────┐
│  THE BUNKER - LOS ANGELES           │
│  Capacity: 400                       │
├─────────────────────────────────────┤
│  Gotti Geechi fans: 172 (43%)       │
│    - Street fan appeal: 80          │
│    - Hometown bonus: 60             │
│    - Base popularity: 32            │
│                                     │
│  Lux Coded fans: 52 (13%)           │
│    - Purist appeal: 20              │
│    - Base popularity: 32            │
│                                     │
│  Neutral crowd: 176 (44%)           │
└─────────────────────────────────────┘
```

**Expected Battle:** Geechi has MASSIVE home court advantage. Despite being GOD tier matchup, Geechi's clutch_performer badge + 43% crowd = significant edge. Lux needs haymakers to overcome crowd energy.

---

### BATTLE 2: "RING RUST REDEMPTION"
**Hallow The Dawn (The Complete Package) vs Goodz the Animal (The Bronx Boss)**

| | Hallow The Dawn | Goodz the Animal |
|---|---|---|
| **Real Inspiration** | Hollow Da Don | Goodz |
| **Tier** | TOP | TOP |
| **Region** | Northeast | Northeast |
| **City** | Yonkers, NY | Bronx, NY |
| **Popularity** | 70 | 65 |
| **Badges** | ring_general, versatile_writer, respected_veteran, slumping, ring_rust | charismatic, showman, street_battler, gunslinger, ring_rust |
| **Style** | Once elite, now inconsistent | Charismatic, lazy prep |

#### Badge Effects Analysis

**Hallow The Dawn:**
- `ring_general` → No choke/stumble modifiers
- `versatile_writer` → No choke/stumble modifiers
- `slumping` → **+4% stumble per segment**
- `ring_rust` → **+5% stumble per segment**
- **TOTAL: +9% stumble (MASSIVE stumble risk), standard choke**

**Goodz the Animal:**
- `charismatic` → No choke/stumble modifiers
- `showman` → No choke/stumble modifiers
- `gunslinger` → **+5% choke per segment**
- `ring_rust` → **+5% stumble per segment**
- **TOTAL: +5% stumble, +5% choke (HIGH RISK both ways)**

#### Fanbase Calculation

**Venue:** The Bunker (Los Angeles) - 400 capacity

**Hallow The Dawn (Yonkers, NY):**
- Base fans: 70 / 10 = 7.0%
- Hometown bonus: 0%
- Style match: Performance Fans (ring general = stage presence)
- Performance share: 30% × (70/135) = 15.6%
- **Total Hollow fans: ~23% of crowd (92 people)**

**Goodz the Animal (Bronx, NY):**
- Base fans: 65 / 10 = 6.5%
- Hometown bonus: 0%
- Style match: Performance Fans (showman = entertainment)
- Performance share: 30% × (65/135) = 14.4%
- **Total Goodz fans: ~21% of crowd (84 people)**

**Crowd Composition:**
```
┌─────────────────────────────────────┐
│  THE BUNKER - LOS ANGELES           │
│  Capacity: 400                       │
├─────────────────────────────────────┤
│  Hallow The Dawn fans: 92 (23%)     │
│    - Performance appeal: 62         │
│    - Base popularity: 30            │
│                                     │
│  Goodz the Animal fans: 84 (21%)    │
│    - Performance appeal: 58         │
│    - Base popularity: 26            │
│                                     │
│  Neutral crowd: 224 (56%)           │
└─────────────────────────────────────┘
```

**Expected Battle:** CHAOS INCOMING. Both have ring_rust (+5% stumble). Hollow has slumping on top of that (+4% more). Goodz has gunslinger (+5% choke). This battle will have MULTIPLE mishaps. Crowd is evenly split - pure battle of who stumbles less.

---

### BATTLE 3: "THE PUNCHER'S PARADISE"
**Nitty Rum (The Gunsmith) vs Ave the Puncher (Norfolk Navigator)**

| | Nitty Rum | Ave the Puncher |
|---|---|---|
| **Real Inspiration** | Rum Nitty | Ave |
| **Tier** | GOD | TOP |
| **Region** | Southwest | Southeast |
| **City** | Phoenix, AZ | Norfolk, VA |
| **Popularity** | 82 | 72 |
| **Badges** | punchline_king, gun_bar_specialist, haymaker_specialist, consistent_performer, bars_on_lock | punchline_king, pop_culture, sports_bars, vocal_presence, consistent_performer |
| **Style** | Punchline king, gun bars, never misses | Reference king, strong presence |

#### Badge Effects Analysis

**Nitty Rum:**
- `punchline_king` → No choke/stumble modifiers
- `gun_bar_specialist` → No choke/stumble modifiers
- `haymaker_specialist` → No choke/stumble modifiers
- `consistent_performer` → **-2% stumble per segment**
- `bars_on_lock` → **-4% choke per segment**
- **TOTAL: -2% stumble, -4% choke (SOLID PROTECTION)**

**Ave the Puncher:**
- `punchline_king` → No choke/stumble modifiers
- `pop_culture` → No choke/stumble modifiers
- `sports_bars` → No choke/stumble modifiers
- `vocal_presence` → No choke/stumble modifiers
- `consistent_performer` → **-2% stumble per segment**
- **TOTAL: -2% stumble, standard choke**

#### Fanbase Calculation

**Venue:** The Bunker (Los Angeles) - 400 capacity

**Nitty Rum (Phoenix, AZ):**
- Base fans: 82 / 10 = 8.2%
- Hometown bonus: 0%
- Style match: Purists (gun bars + punchlines = technical)
- Street Fans also (gun_bar_specialist)
- Purist share: 10% × (82/154) = 5.3%
- Street share: 20% × (82/154) = 10.6%
- **Total Rum fans: ~24% of crowd (96 people)**

**Ave the Puncher (Norfolk, VA):**
- Base fans: 72 / 10 = 7.2%
- Hometown bonus: 0%
- Style match: Purists (punchline technical)
- Comedy Fans also (pop_culture, sports_bars = entertaining)
- Purist share: 10% × (72/154) = 4.7%
- Comedy share: 15% × (72/72) = 15% (sole claim)
- **Total Ave fans: ~27% of crowd (108 people)**

**Crowd Composition:**
```
┌─────────────────────────────────────┐
│  THE BUNKER - LOS ANGELES           │
│  Capacity: 400                       │
├─────────────────────────────────────┤
│  Ave the Puncher fans: 108 (27%)    │
│    - Comedy fan appeal: 60          │
│    - Purist appeal: 19              │
│    - Base popularity: 29            │
│                                     │
│  Nitty Rum fans: 96 (24%)           │
│    - Street appeal: 42              │
│    - Purist appeal: 21              │
│    - Base popularity: 33            │
│                                     │
│  Neutral crowd: 196 (49%)           │
└─────────────────────────────────────┘
```

**Expected Battle:** TECHNICAL CLASSIC. Both have consistent_performer so stumbles will be rare. Rum Nitty has bars_on_lock for extra choke protection. This should be a CLEAN battle with winner determined by peak haymaker moments. Ave has slight crowd edge but Rum has better badge protection.

---

### BATTLE 4: "THE WILD CARD" (Main Event)
**Day Lit (The Creative Troll) vs Roc Tay (The Baltimore Puncher)**

| | Day Lit | Roc Tay |
|---|---|---|
| **Real Inspiration** | Daylyt | Tay Roc |
| **Tier** | GOD | GOD |
| **Region** | West Coast | Northeast |
| **City** | Watts, CA | Baltimore, MD |
| **Popularity** | 78 | 83 |
| **Badges** | master_wordsmith, comedy_battler, freestyle_artist, gunslinger, controversial | energy_master, aggressive_performer, intimidator, crowd_hyper, aggressive_style |
| **Style** | Creative genius, unpredictable | Energy machine, aggressive |

#### Badge Effects Analysis

**Day Lit:**
- `master_wordsmith` → No choke/stumble modifiers
- `comedy_battler` → No choke/stumble modifiers
- `freestyle_artist` → **-4% stumble, -5% choke per segment**
- `gunslinger` → **+5% choke per segment**
- `controversial` → No choke/stumble modifiers
- **TOTAL: -4% stumble, NET 0% choke (gunslinger cancels freestyle)**

**Roc Tay:**
- `energy_master` → No choke/stumble modifiers
- `aggressive_performer` → No choke/stumble modifiers (but +2% stumble from delivery)
- `intimidator` → No choke/stumble modifiers
- `crowd_hyper` → No choke/stumble modifiers
- `aggressive_style` → **+2% stumble per segment**
- **TOTAL: +2% stumble, standard choke**

#### Fanbase Calculation

**Venue:** The Bunker (Los Angeles) - 400 capacity

**Day Lit (Watts, CA):**
- Base fans: 78 / 10 = 7.8%
- Hometown bonus: +15% (battling in LA!)
- Style match: Comedy Fans (comedy_battler)
- Also Purists (master_wordsmith)
- Comedy share: 15% × (78/78) = 15%
- Purist share: 10% × (78/78) = 10%
- **Total Day Lit fans: ~48% of crowd (192 people)**

**Roc Tay (Baltimore, MD):**
- Base fans: 83 / 10 = 8.3%
- Hometown bonus: 0%
- Style match: Aggression Fans (aggressive everything!)
- Performance Fans (energy_master, crowd_hyper)
- Aggression share: 25% × (83/83) = 25%
- Performance share: 30% × (83/83) = 30%
- **Total Roc fans: ~63% of crowd... WAIT**

*Conflict: Both can't exceed 100%. Recalculate with neutral crowd.*

**Adjusted Calculation:**
- Day Lit claims: Comedy (15%) + Purists (10%) + Hometown (15%) + Base (7.8%) = 47.8%
- Roc Tay claims: Aggression (25%) + Performance (30%) + Base (8.3%) = 63.3%
- Total claimed: 111.1% - exceeds 100%

**Resolution:** Reduce proportionally:
- Day Lit: 47.8% × (100/111.1) = 43%
- Roc Tay: 63.3% × (100/111.1) = 57%

**Crowd Composition:**
```
┌─────────────────────────────────────┐
│  THE BUNKER - LOS ANGELES           │
│  Capacity: 400                       │
├─────────────────────────────────────┤
│  Roc Tay fans: 228 (57%)            │
│    - Performance appeal: 120        │
│    - Aggression appeal: 75          │
│    - Base popularity: 33            │
│                                     │
│  Day Lit fans: 172 (43%)            │
│    - Hometown LA bonus: 60          │
│    - Comedy appeal: 54              │
│    - Purist appeal: 27              │
│    - Base popularity: 31            │
│                                     │
│  Neutral crowd: 0 (0%)              │
└─────────────────────────────────────┘
```

**Expected Battle:** CROWD IS 100% INVESTED! No neutral attendees. This is a MAIN STAGE ARENA classic. Roc has crowd edge (57%) but Day Lit has hometown LA support (43%) plus freestyle_artist protection. Day Lit's gunslinger badge adds risk but freestyle_artist cancels it. Roc's aggressive_style adds stumble risk.

---

## PART 4: PROBABILITY BREAKDOWN BY BATTLE

### Per-Segment Probabilities (6 segments per round)

#### Battle 1: Lux Coded vs Gotti Geechi
| | Stumble/Seg | Choke/Seg | Stumble/Battle | Choke/Battle |
|---|---|---|---|---|
| Lux Coded | 5.0% | 2.0% | ~26% | ~11% |
| Gotti Geechi | 5.0% | **0% (clamped from -4%)** | ~26% | ~0% |

**Geechi's clutch_performer makes him nearly choke-proof!**

#### Battle 2: Hallow The Dawn vs Goodz the Animal
| | Stumble/Seg | Choke/Seg | Stumble/Battle | Choke/Battle |
|---|---|---|---|---|
| Hallow The Dawn | **14.0%** | 2.0% | **~60%** | ~11% |
| Goodz the Animal | **10.0%** | **7.0%** | ~47% | ~35% |

**CHAOS ALERT:** Hollow has 60% chance of stumbling! Goodz has 35% chance of choking!

#### Battle 3: Nitty Rum vs Ave the Puncher
| | Stumble/Seg | Choke/Seg | Stumble/Battle | Choke/Battle |
|---|---|---|---|---|
| Nitty Rum | **3.0%** | **0% (clamped from -2%)** | ~17% | ~0% |
| Ave the Puncher | **3.0%** | 2.0% | ~17% | ~11% |

**Clean battle expected. Rum Nitty's bars_on_lock makes him choke-proof!**

#### Battle 4: Day Lit vs Roc Tay (Main Event)
| | Stumble/Seg | Choke/Seg | Stumble/Battle | Choke/Battle |
|---|---|---|---|---|
| Day Lit | **1.0%** | 2.0% | ~6% | ~11% |
| Roc Tay | **7.0%** | 2.0% | ~35% | ~11% |

**Day Lit has elite stumble protection. Roc's aggressive style adds risk.**

---

## PART 5: FANBASE EFFECTS ON BATTLE

### Momentum Modifiers

| Battle | Battler A Fans | Battler B Fans | A Momentum | B Momentum |
|--------|----------------|----------------|------------|------------|
| 1 | Lux 13% | Geechi 43% | -0.19 | -0.04 |
| 2 | Hollow 23% | Goodz 21% | -0.14 | -0.15 |
| 3 | Rum 24% | Ave 27% | -0.13 | -0.12 |
| 4 | Day Lit 43% | Roc 57% | -0.04 | +0.04 |

*Formula: (fan% - 0.5) × 0.5*

### Crowd Reaction Multipliers

| Battle | Battler A | Battler B |
|--------|-----------|-----------|
| 1 | Lux: 1.04x | Geechi: 1.13x |
| 2 | Hollow: 1.07x | Goodz: 1.06x |
| 3 | Rum: 1.07x | Ave: 1.08x |
| 4 | Day Lit: 1.13x | Roc: 1.17x |

*Formula: 1.0 + (fan% × 0.3)*

---

## PART 6: POST-BATTLE DEMOGRAPHICS OPINION FORMAT

After each battle, you'll see results like this:

```
┌─────────────────────────────────────────────┐
│  OFFICIAL VERDICT: Battler A wins 2-1       │
├─────────────────────────────────────────────┤
│  CROWD OPINIONS (Round by Round):           │
│                                             │
│  Purists:        Battler A  2-1             │
│  Street Fans:    Battler B  2-1             │
│  Comedy Fans:    Battler A  3-0             │
│  Aggression:     Battler B  2-1             │
│  Performance:    Battler A  2-1             │
│                                             │
│  YOUR FANS:      You        3-0             │
│  THEIR FANS:     Opponent   2-1             │
└─────────────────────────────────────────────┘
```

**Key Points:**
- Each demographic gives their own round-by-round verdict
- YOUR FANS always favor you (that's what fans do!)
- THEIR FANS always favor them
- Official verdict is weighted average across all demographics

---

## PART 7: EXPECTED BATTLE NARRATIVES

### Battle 1: Lux Coded vs Gotti Geechi
**"The Pen vs The Street"**

**Pre-Battle Story:**
- Lux brings elite pen game to hostile territory
- Geechi has 43% of crowd as his fans - LA loves him
- Battle of Bar God vs Pocket Checker

**Expected Outcome:**
- Geechi's clutch_performer means he WON'T choke
- Lux has standard 11% choke risk
- Crowd heavily favors Geechi's style
- **Prediction:** Geechi 2-1 (crowd edge + choke protection)

**Demographics Opinion Forecast:**
```
Purists:        Lux 2-1    (they appreciate the pen)
Street Fans:    Geechi 3-0 (authenticity wins)
Comedy Fans:    Geechi 2-1 (pocket checking = comedy)
Aggression:     Geechi 2-1 (street energy)
Performance:    Geechi 2-1 (home crowd momentum)
```

---

### Battle 2: Hallow The Dawn vs Goodz the Animal
**"The Comeback Trail"**

**Pre-Battle Story:**
- Both veterans trying to recapture glory
- Both have ring_rust (+5% stumble each)
- Hollow has slumping on top of that (+4% more stumble)
- Goodz has gunslinger (+5% choke) - dangerous

**Expected Outcome:**
- Hollow: 60% chance to stumble at least once
- Goodz: 35% chance to choke + 47% stumble chance
- Whichever veteran stumbles/chokes LESS wins
- **Prediction:** Hollow 2-1 (Goodz choke risk higher)

**Demographics Opinion Forecast:**
```
Purists:        Hollow 2-1 (versatile_writer appreciation)
Street Fans:    Goodz 2-1  (street_battler credibility)
Comedy Fans:    Split 1-1  (both have entertainment value)
Aggression:     Hollow 2-1 (ring_general presence)
Performance:    Split 1-1  (both are showmen when on)
```

---

### Battle 3: Nitty Rum vs Ave the Puncher
**"The Punch-Off"**

**Pre-Battle Story:**
- Two punchline kings collide
- Both have consistent_performer (clean battle expected)
- Rum Nitty has bars_on_lock (choke-proof)
- Battle of who can hit HARDER

**Expected Outcome:**
- Neither should stumble or choke
- Winner determined by haymaker moments
- Rum Nitty's gun_bar_specialist vs Ave's pop_culture
- **Prediction:** Rum Nitty 2-1 (better badge protection)

**Demographics Opinion Forecast:**
```
Purists:        Rum 3-0    (gun bars = technical mastery)
Street Fans:    Rum 2-1    (gun_bar_specialist resonates)
Comedy Fans:    Ave 2-1    (pop culture references land)
Aggression:     Rum 2-1    (gun bars = aggression)
Performance:    Split 1-1  (both have vocal_presence)
```

---

### Battle 4: Day Lit vs Roc Tay (Main Event)
**"Chaos vs Control"**

**Pre-Battle Story:**
- Wildly different styles collide
- Day Lit: Creative genius, unpredictable, LA hometown
- Roc Tay: Pure energy, aggressive machine
- 100% of crowd is invested (no neutral fans!)

**Expected Outcome:**
- Day Lit has freestyle_artist protection (6% stumble)
- Roc's aggressive_style adds risk (35% stumble)
- Crowd split: 57% Roc / 43% Day Lit
- Main Stage Arena favors performance (Roc's strength)
- **Prediction:** Roc Tay 2-1 (performance weight + crowd edge)

**Demographics Opinion Forecast:**
```
Purists:        Day Lit 3-0  (master_wordsmith appreciation)
Street Fans:    Roc 2-1      (aggressive authenticity)
Comedy Fans:    Day Lit 3-0  (comedy_battler connects)
Aggression:     Roc 3-0      (energy_master dominance)
Performance:    Roc 2-1      (crowd_hyper = crowd control)
```

---

## PART 8: COMPLETE TEST CARD SUMMARY

| Battle | Battler A | Battler B | Tier Match | Badge Story |
|--------|-----------|-----------|------------|-------------|
| 1 | Lux Coded (13% fans) | Gotti Geechi (43% fans) | GOD vs GOD | Clutch vs Standard |
| 2 | Hallow The Dawn (23%) | Goodz the Animal (21%) | TOP vs TOP | Ring Rust vs Ring Rust + Gunslinger |
| 3 | Nitty Rum (24%) | Ave the Puncher (27%) | GOD vs TOP | Bars on Lock vs Standard |
| 4 | Day Lit (43%) | Roc Tay (57%) | GOD vs GOD | Freestyle Artist vs Aggressive Style |

### Total Expected Mishaps

| Battle | Expected Stumbles | Expected Chokes |
|--------|-------------------|-----------------|
| 1 | 1-2 | 0-1 (Lux only) |
| 2 | **4-6** | 1-2 (Goodz mainly) |
| 3 | 0-1 | 0 |
| 4 | 2-3 (Roc mainly) | 0-1 |

---

## PART 9: RELATED BADGES FOR FANBASE SYSTEM

These badges (designed but not yet implemented) will enhance the fanbase system:

| Badge | Effect | Rarity |
|-------|--------|--------|
| **Cult Following** | +5% fans at every event | Epic |
| **Hometown Hero** | +10% fans in hometown | Rare |
| **Local Hero** | +5% fans in your region | Rare |
| **Road Warrior** | +0.08 momentum when opponent has hometown advantage | Epic |
| **Crowd Killer** | +15% crowd reaction bonus | Legendary |

---

## PART 10: HOW TO READ POST-BATTLE RESULTS

### Sample Battle Result Display

```
════════════════════════════════════════════════════════════════
                    BATTLE COMPLETE
════════════════════════════════════════════════════════════════

GOTTI GEECHI defeats LUX CODED  2-1

────────────────────────────────────────────────────────────────
ROUND BREAKDOWN
────────────────────────────────────────────────────────────────

  ROUND 1: Geechi 7.8 - Lux 7.5  │  Geechi takes it
  ROUND 2: Lux 8.2 - Geechi 7.6  │  LUX HAYMAKER! (8.9 in S3)
  ROUND 3: Geechi 7.9 - Lux 7.3  │  Geechi closes strong

────────────────────────────────────────────────────────────────
CROWD COMPOSITION
────────────────────────────────────────────────────────────────

  Geechi fans: 172 (43%)
    Hometown LA: 60
    Street appeal: 80
    Base popularity: 32

  Lux fans: 52 (13%)
    Purist appeal: 20
    Base popularity: 32

  Neutral: 176 (44%)

────────────────────────────────────────────────────────────────
DEMOGRAPHICS OPINION (Round by Round)
────────────────────────────────────────────────────────────────

  Purists (10%):       LUX 2-1
  Street Fans (20%):   GEECHI 3-0
  Comedy Fans (15%):   GEECHI 2-1
  Aggression (25%):    GEECHI 2-1
  Performance (30%):   GEECHI 2-1

  GEECHI'S FANS:       GEECHI 3-0  (of course)
  LUX'S FANS:          LUX 2-1     (stayed loyal)

────────────────────────────────────────────────────────────────
BATTLE STATS
────────────────────────────────────────────────────────────────

  Chokes: 0
  Stumbles: 2 (Lux R1S2, Lux R3S5)
  Haymakers: 4 (Lux 2, Geechi 2)

  Geechi Momentum Bonus: +0.04 (43% fans)
  Lux Momentum Penalty: -0.19 (13% fans in hostile LA)

════════════════════════════════════════════════════════════════
```

---

## APPENDIX A: FANBASE FORMULAS QUICK REFERENCE

```
BASE FANS
─────────
base_fan_percent = popularity_score / 10

HOMETOWN BONUS
──────────────
if (battle_city === battler_hometown) {
  fan_percent += 15%
}

BADGE BONUSES
─────────────
cult_following:  +5%
hometown_hero:   +10% (only in hometown)
local_hero:      +5%  (only in region)

DEMOGRAPHIC MATCHING
────────────────────
demographic_fans = demographic_percent × (your_popularity / combined_popularity)

MOMENTUM EFFECT
───────────────
momentum_modifier = (fan_percent - 0.5) × 0.5

CROWD REACTION
──────────────
reaction_multiplier = 1.0 + (fan_percent × 0.3)
```

---

## APPENDIX B: BATTLERS USED (Avoid for Test Card 3)

| Battle | Battler A | Battler B |
|--------|-----------|-----------|
| Card 1 Battle 1 | Chess | P Mike |
| Card 1 Battle 2 | Magic B | Foe Tru |
| Card 1 Battle 3 | Chilla | Cortez |
| Card 1 Battle 4 | DNA | Hitman |
| Card 2 Battle 1 | Lux Coded | Gotti Geechi |
| Card 2 Battle 2 | Hallow The Dawn | Goodz the Animal |
| Card 2 Battle 3 | Nitty Rum | Ave the Puncher |
| Card 2 Battle 4 | Day Lit | Roc Tay |

**Available for Card 3:**
- Surf Tsu (The Jersey Wave) - GOD tier, choker badge
- Clips Charlie (The Harlem Writer) - GOD tier, clutch_performer
- JC the Titan (The Pen Titan) - TOP tier, technical
- K the Shine (The Uptown Puncher) - TOP tier, aggressive
- Will Ill (The Pontiac Danger) - TOP tier, versatile
- Red O (The Brick City Puncher) - TOP tier, aggressive
- Loso the Soldier - MID tier
- Prep the Professional - MID tier
- Deal Real (The Pittsburgh Vet) - LOW tier
- Bangz the Banger - LOW tier
- Footz the Fast - LOW tier
- Saygo Tex (The Philly Underdog) - LOW tier

---

**Document Version:** 1.0
**Created:** Algorithm Institute Beta Test - Phase 2
**Purpose:** Introduce Fanbase System with new battler matchups
**Theme:** Understanding how crowd composition affects battle outcomes

*"The crowd is the fifth judge."*
