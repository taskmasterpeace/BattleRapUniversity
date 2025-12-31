# GAME MECHANICS REFERENCE
## What Effects What Throughout The Game

A comprehensive reference showing all game systems and their interactions.

---

## ATTRIBUTE EFFECTS BREAKDOWN

### WRITING ATTRIBUTES (1-10 Scale)

#### Lyricism
**Direct Effects:**
- Writing score contribution in battle segments (league-weighted)
- Small Room Circuit: 35% weight
- Main Stage Arena: 25% weight

**Indirect Effects:**
- Contributes to average writing skill for stumble reduction
- Improves effectiveness of "writing" prep days

**Affected By:**
- Writing prep days (+temporary boost during battle)
- XP gains from battles (permanent growth)
- Life events (temporary modifiers)

#### Wordplay
**Direct Effects:**
- Writing score contribution in battle segments (league-weighted)
- Same weights as Lyricism

**Indirect Effects:**
- Contributes to average writing skill
- Badge unlock conditions (Wordplay Artist requires 8+)

**Affected By:**
- Writing prep days
- XP gains
- Life events

#### Creativity
**Direct Effects:**
- Writing score contribution in battle segments (league-weighted)
- Same weights as Lyricism

**Indirect Effects:**
- Contributes to average writing skill
- Research prep effectiveness (creative angles)

**Affected By:**
- Writing prep days
- Research prep days (angles boost)
- XP gains
- Life events

---

### PERFORMANCE ATTRIBUTES (1-10 Scale)

#### Stage Presence
**Direct Effects:**
- Performance score contribution in battle segments (league-weighted)
- Small Room Circuit: 15% weight
- Main Stage Arena: 25% weight

**Indirect Effects:**
- Crowd reaction boost (+5-10% if Stage Presence ≥ 8)
- Stumble recovery skill (reduces stumble penalty)
- Crowd fatigue compensation (late card battles)

**Affected By:**
- Performance prep days (+temporary boost)
- XP gains
- Life events
- Crowd size (Main Stage builds this faster)

#### Crowd Control
**Direct Effects:**
- Performance score contribution (league-weighted)
- Crowd reaction multiplier

**Indirect Effects:**
- Stumble recovery skill (reduces stumble penalty from 0.70× to 0.85×)
- Crowd fatigue compensation (late card battles)
- Badge unlock (Crowd Favorite requires consistent high crowd reactions)

**Affected By:**
- Performance prep days
- XP gains
- Crowd composition (different crowd types react differently)

#### Delivery
**Direct Effects:**
- Performance score contribution (league-weighted)
- Flow score (rhythm and cadence)

**Indirect Effects:**
- Stumble recovery skill (key component)
- Reduces stumble probability (-0.08% per point above 5)

**Affected By:**
- Performance prep days
- XP gains
- Substance issues badge (negative effect)

---

### PERSONAL ATTRIBUTES (1-10 Scale)

#### Financial Stability
**Direct Effects:**
- Stress calculation: If < 4, adds +(4 - value) × 5 stress points
- **NEW**: Choke probability: If < 4, adds +(4 - value) × 0.8% choke chance

**Indirect Effects:**
- Affects willingness to take low-paying battles
- Life event trigger conditions (money problems more likely if low)

**Affected By:**
- Battle earnings (win bonus, base pay)
- Tournament prize money
- Living expenses (passive decay)
- Life events ("Financial Windfall", "Unexpected Bills")

#### Reputation
**Direct Effects:**
- Battle offer quality (higher rep = better opponents)
- **NEW**: Choke pressure when reputation is extreme:
  - Low rep (< 4): Adds +(4 - value) × 0.5% choke (nothing to lose desperation)
  - High rep (> 7): Adds +(value - 7) × 0.3% choke (pressure to maintain status)

**Indirect Effects:**
- Tournament seeding
- Media coverage frequency
- Public knowledge growth rate

**Affected By:**
- Battle results (wins increase, losses decrease)
- Media articles (scandals decrease, praise increases)
- Life events ("Public Scandal", "Viral Moment")
- Choking in high-profile battles (major reputation damage)

#### Family Bond
**Direct Effects:**
- Buffs effective resilience: +family_bond/10 to resilience for choke calculation
- Example: Resilience 6 + Family Bond 8 = Effective Resilience 6.8

**Indirect Effects:**
- Life event mitigation (strong family support reduces negative event impact)
- Stress recovery (high family bond helps manage stress)

**Affected By:**
- Life prep days (time with family strengthens bond)
- Life events ("Marriage", "Newborn", "Family Crisis")
- Touring extensively (too many battles can strain relationships)

#### Preparation
**Direct Effects:**
- Stress calculation: (preparation - 5) × 2 reduces stress
- **NEW**: Prep efficiency multiplier: Higher preparation = more effective prep days

**Indirect Effects:**
- Affects how much benefit each prep day provides
- Influences time management badges

**Affected By:**
- Life events ("Learned Discipline", "Lost Focus")
- Career experience (improves over time with battles)

---

### MENTAL STATE ATTRIBUTES (Dynamic)

#### Resilience (1-10 Scale, Semi-Permanent)
**Direct Effects:**
- Choke probability: Each point above 5 reduces choke by -0.15%
- Buffed by family bond (see above)

**Indirect Effects:**
- Pressure handling in tournaments
- Recovery from choking incidents (prevents spiral)

**Affected By:**
- Rest prep days (temporary resilience boost)
- Life events (major)
- Badge effects (Clutch Performer badge boosts resilience)
- Choking history (repeated chokes can erode resilience)

#### Stress (0-100 Scale, Dynamic)
**Direct Effects:**
- Choke probability: +(stress/100) × 10% added to choke chance
  - Example: 50 stress = +5% choke chance
- Stumble probability: +(stress/100) × 4% added to stumble chance
  - Example: 50 stress = +2% stumble chance

**Indirect Effects:**
- Performance consistency (high stress = more variance)
- Life satisfaction (high stress triggers negative life events)

**Affected By:**
- **Active battles**: (count - 1) × 15 stress per extra battle
- **Time pressure**: +10 stress per battle if next battle < 3 days away
- **Recent battles**: Last 7 days × 5 stress per battle
- **Financial stability**: < 4 adds stress (see above)
- **Preparation attribute**: Higher prep reduces stress (see above)
- **Badges**: Multitasker (-20%), Workaholic (-10%), Time Management Expert (-30%), Burnout Risk (+30%)
- **Decay**: -5 stress per day when inactive

**Formula:**
```
stress = (activeBattles - 1) × 15
       + (timePressed battles) × 10
       + (recentBattles) × 5
       + (financial < 4 ? (4 - financial) × 5 : 0)
       - (preparation - 5) × 2
       × badge multipliers
Clamped: 0-100
```

#### Public Knowledge (0-100 Scale, Semi-Permanent)
**Direct Effects:**
- **NEW**: Fame pressure on choking: If > 70, adds +(value - 70) × 0.03% choke
  - Example: 85 public knowledge = +0.45% choke chance

**Indirect Effects:**
- Media coverage frequency (higher = more articles)
- Battle offer visibility (famous battlers get more offers)
- Tournament invitations

**Affected By:**
- Winning battles (especially against famous opponents)
- Media articles mentioning the battler
- Viral moments (haymaker segments)
- Tournament performance (deep runs increase fame)

---

## BATTLE SIMULATION MECHANICS

### Segment Scoring (Per 30-Second Segment)

**Base Score Calculation:**
```
writingScore = (lyricism + wordplay + creativity) / 3
performanceScore = (stagePresence + crowdControl + delivery) / 3

segmentScore = (writingScore × league.writingWeight)
             + (performanceScore × league.performanceWeight)
             + (random variance ±15%)
```

**League Weights:**
- Small Room Circuit: Writing 35%, Performance 15%, Crowd 50%
- Main Stage Arena: Writing 25%, Performance 25%, Crowd 50%

### Failure Events (Segment-Level)

#### Stumbling (NEW - Not Yet Implemented)
**Trigger Probability Per Segment:**
```
stumbleChance = 0.8% (base)
              - (performanceDays × 0.08%)
              - ((delivery + crowdControl)/2 - 5) × 0.08%
              + (stress / 100) × 4%
              + badge modifiers
Clamped: 0.2% - 5%
```

**Target Frequency:** 25% of battles have at least one stumble

**Effects When Triggered:**
- Segment score × 0.70 (30% penalty)
- If recovery skill ≥ 8: Segment score × 0.85 (15% penalty instead)
- Recovery skill = (delivery + crowdControl) / 2
- Mutually exclusive with choking (stumble check happens first)

**Caused By:**
- Lack of performance prep days (rehearsal)
- High stress
- Low delivery/crowd_control attributes
- Substance Issues badge

#### Choking (Current System, Being Expanded)
**Trigger Probability Per Segment:**
```
chokeChance = 0.3% (base)
            - (resilience × 0.15%)
            - (familyBond / 10 × 0.15%)
            - (writingDays × 0.04%)
            + (stress / 100) × 10%
            + (financial < 4 ? (4 - financial) × 0.8% : 0)
            + reputation pressure
            + tournament pressure
            + opponent intimidation
            + fame pressure
            + life event modifiers
            + losing streak modifiers
            + badge modifiers
Clamped: 0.1% - 35%
```

**Person-Specific Targets:**
- Average battler: 5% per battle
- Choker badge: 25% per battle
- Clutch Performer: 3% per battle

**Effects When Triggered:**
- Segment score × 0.30 (70% penalty - catastrophic)
- Flags entire round as "choked"
- Major reputation damage if high-profile battle
- Can trigger negative life events

**Caused By:**
- Lack of writing prep days (memorization)
- High stress
- Low resilience
- Low financial stability
- Reputation extremes (too low or too high)
- Tournament pressure (finals = +3% choke)
- Opponent intimidation (rating diff > 200 = +1.5% choke)
- Fame pressure (public knowledge > 70)
- Losing streak (< -2 streak = +0.5% per loss)
- Life events (death in family, substance issues, etc.)
- Known Choker badge (+6%), Choker badge (+5%)

### Round Order Effects (NEW - Not Yet Implemented)

**Going First:**
- No bonuses
- No rebuttal opportunity
- Slight disadvantage in Round 3 (rebuttals hit harder)

**Going Second:**
- Crowd reaction +2% (base advantage)
- If opponent stumbled: +3% additional
- If opponent choked: +5% additional
- Round 3: +3% additional (closing is powerful)
- **Total advantage: +5% to +13% crowd reaction**

**Rebuttal System** (Badge-Based, Second Only):
- Base rebuttal bonus: +5% to segment scores
- Freestyle Genius badge: +15% bonus
- Rebuttal King/Queen badge: +10% bonus
- Enhanced if opponent stumbled (×1.5) or choked (×2.0)

---

### Crowd Reaction Calculation

**Base Formula:**
```
crowdReaction = segmentScore × league.baseCrowdFactor
              + momentum bonuses
              + round order bonuses
              - crowd fatigue penalties
```

**League Base Crowd Factors:**
- Small Room: 50% crowd weight (intimate, engaged)
- Main Stage: 50% crowd weight (energy, spectacle)

**Crowd Fatigue (Battle Card Position)** (NEW - Not Yet Implemented):
```
If battle position ≥ 6 on card:
  fatiguePenalty = 10% + ((position - 6) × 14%)

  Battle 6: -10%
  Battle 7: -24%
  Battle 8: -38% (max)

  If performance average ≥ 8.0:
    fatiguePenalty × 0.5 (elite performers compensate)
```

**Crowd Composition Effects** (NEW - Designed, Not Yet Implemented):
- Battle Rap Purists: +20% writing score weight, resistant to performance
- Performance Crowd: +20% performance score weight
- Casual Mixed: Balanced, loves haymakers
- Tournament Crowd: Higher standards, harder to impress
- Hype Crowd: Loves energy, less critical of substance

---

## PREP SYSTEM EFFECTS

### Daily Prep Focus Options (Leading Up to Battle)

#### Research Days
**Direct Effects:**
- Enables "angles" in battle (personal attack bonus)
- +angle bonus to segments (scales with creativity)

**Indirect Effects:**
- Reduces opponent's confidence (if they know you researched them)

#### Writing Days
**Direct Effects:**
- Reduces choke probability (-0.04% per day)
- Temporary boost to writing attributes during battle

**Best For:**
- Memorization and preventing chokes
- Writing-focused leagues (Small Room)

#### Performance Days
**Direct Effects:**
- Reduces stumble probability (-0.08% per day)
- Temporary boost to performance attributes during battle

**Best For:**
- Preventing stumbles
- Performance-focused leagues (Main Stage)
- Late card positions (crowd fatigue compensation)

#### Life Days
**Direct Effects:**
- Strengthens family bond (+0.1 per day)
- Can trigger positive life events

**Indirect Effects:**
- Buffs resilience through family bond
- Reduces stress (indirectly)

#### Rest Days
**Direct Effects:**
- Reduces stress (-5 per day)
- Buffs resilience temporarily

**Best For:**
- High-stress situations (multiple battles)
- Known chokers building confidence

---

## BADGE SYSTEM EFFECTS

### Performance Badges

**Freestyle Genius**
- Rebuttal bonus: +15% (when going second)
- Choke reduction: -25%

**Crowd Favorite**
- Crowd reaction: +10% all segments
- Unlocked by consistent high crowd reactions

**Clutch Performer**
- Choke reduction: -4%
- Target choke rate: 3% per battle

**Stage Presence Master**
- Performance score: +10%
- Crowd reaction: +5%

### Writing Badges

**Wordplay Artist** (Requires 8+ Wordplay)
- Writing score: +8%

**Lyrical Assassin**
- Writing score: +12%
- Consistency bonus

### Negative Badges

**Known Choker** / **Choker**
- Choke increase: +5-6%
- Target choke rate: 25% per battle
- **NEEDS TIERS**: Level 1-4 with escalating penalties

**Substance Issues**
- Choke increase: +6%
- Delivery penalty: -10%
- Can trigger from life events

**Burnout Risk**
- Stress multiplier: ×1.3 (+30% more stress)
- Triggered by overwork

**Drama Starter**
- Reputation volatility: ±20% swings
- Media coverage: +50% frequency (not always positive)

### Workload Badges

**Multitasker**
- Stress reduction: -20%
- Allows juggling multiple battles

**Workaholic**
- Stress reduction: -10%
- XP gains: +15%

**Time Management Expert**
- Stress reduction: -30% (best mitigation)
- Prep efficiency: +15%

---

## TOURNAMENT SYSTEM EFFECTS

### Tournament Structure
- Single elimination brackets (8 or 16 battlers)
- First round: 30 days prep
- Subsequent rounds: 14 days prep

### Tournament Pressure (NEW - Not Yet Implemented)

**Round-Specific Choke Modifiers:**
```
First Round:    +0.0% (no extra pressure)
Quarterfinals:  +1.0%
Semifinals:     +2.0%
Finals:         +3.0%
```

**Underdog Bonus:**
- If lower seed: -1.0% choke (nothing to lose)

**Tournament Flag:**
- Currently exists but unused in simulation
- Should apply pressure modifiers above

### Tournament Rewards
- Prize pool split (1st: 50%, 2nd: 30%, 3rd/4th: 10% each)
- Major reputation boost (winner)
- Public knowledge increase (all participants)
- Potential life events ("Tournament Champion")

---

## LIFE EVENTS SYSTEM

### Current System (Partial Implementation)
Life events can trigger based on:
- Random chance (daily/weekly rolls)
- Attribute thresholds (low financial = money problems)
- Battle outcomes (winning streak, choking)

### Life Event Categories

**Financial Events:**
- "Unexpected Bills": -Financial Stability, +Stress
- "Financial Windfall": +Financial Stability, -Stress

**Family Events:**
- "Marriage": +Family Bond (permanent)
- "Newborn": +Family Bond, +Stress (temporary)
- "Family Crisis": -Family Bond, +Stress
- "Death in Family": **Should add +10% choke for 3 battles** (NOT YET IMPLEMENTED)

**Career Events:**
- "Viral Moment": +Public Knowledge, +Reputation
- "Public Scandal": -Reputation, +Stress
- "Learned Discipline": +Preparation attribute

**Substance Events:**
- "Substance Issues": Adds Substance Issues badge, permanent negative effects

### Missing Integration (CRITICAL GAP)
**Temporary Status Effects Needed:**
- Life events currently only affect base attributes
- No system for temporary choke/stumble modifiers
- No system for "active life events" during battles
- Example needed: "Death in Family" status lasting 3 battles with +10% choke

---

## RATING & MATCHMAKING EFFECTS

### ELO Rating System
- Win: +rating based on opponent differential
- Loss: -rating based on opponent differential
- Choke in loss: -additional rating penalty
- Dominant win (3-0): +bonus rating

### Tier Determination
```
Low Tier:  Rating < 1200
Mid Tier:  Rating 1200-1599
Top Tier:  Rating 1600-1999
God Tier:  Rating 2000+
```

### Matchmaking Effects
- Battle offers generated based on ±200 rating range
- Higher rating = higher battle pay offers
- Reputation affects offer frequency
- Public knowledge affects media coverage of battles

### Opponent Intimidation (NEW - Not Yet Implemented)
```
If opponent rating - player rating > 200:
  Add +1.5% choke probability (intimidation factor)
```

---

## FINANCIAL SYSTEM EFFECTS

### Battle Earnings
**Base Pay (Tier-Based):**
- Low Tier: $750
- Mid Tier: $2,500
- Top Tier: $8,000
- God Tier: $30,000

**Win Bonus:**
- 2× base pay for winning

**Pay Modifiers:**
- League prestige (Main Stage pays slightly more)
- Reputation (famous battlers negotiate better)

### Tournament Earnings
**Prize Pool (Tier-Based):**
- Low Tier: $10,000 total
- Mid Tier: $30,000 total
- Top Tier: $100,000 total
- God Tier: $300,000 total

**Distribution:**
- 1st: 50%
- 2nd: 30%
- 3rd/4th: 10% each

### Expenses (Passive)
- Living costs drain financial stability over time
- Can trigger "Unexpected Bills" life events
- Affects stress and choke probability if low

---

## MEDIA SYSTEM EFFECTS

### News Article Generation
**Triggered By:**
- Battle completions (always)
- Tournament rounds (always)
- Major upsets (rating differential > 200)
- Choking incidents (high-profile battles)
- Life events (scandals, viral moments)

**Article Effects:**
- Shapes player's reputation
- Increases public knowledge
- Creates narrative context
- Can trigger life events (scandal articles)

**Article Types:**
- Battle Recap (most common)
- Tournament Coverage
- Career Profile
- Scandal Report
- Retirement Announcement

---

## MISSING SYSTEMS (Designed But Not Implemented)

### Battle Events / Cards System
**Purpose:** Group 4-8 battles into single events
**Effects:**
- Crowd fatigue for later battles
- Main event designation (top of card)
- Event prestige affects reputation gains
- Media covers entire cards, not just individual battles

**Implementation Needed:**
- `battle_events` table
- `card_position` field on battles
- Crowd fatigue formula integration

### Stumbling System
**Status:** Fully designed, not implemented
**Effects:** See "Failure Events" section above

### Round Order System
**Status:** Fully designed, not implemented
**Effects:** See "Round Order Effects" section above

### Life Event Status System
**Status:** Partially designed
**Missing:** Temporary modifier system for active life events during battles

### Badge Tier System
**Status:** Not designed
**Needed:** Multiple levels of badges (especially Choker badges)

### Crowd Composition System
**Status:** Designed in BATTLE_CARDS spec
**Missing:** Implementation in simulation

---

## SUMMARY: COMPLETE EFFECTS CHAIN

### Example: Low Financial Stability
```
Financial Stability < 4
  ↓
+Stress (immediate)
  ↓
+Choke Probability from stress (indirect)
+Stumble Probability from stress (indirect)
+Direct Choke Probability (NEW, direct)
  ↓
Worse battle performance
  ↓
More losses
  ↓
Less earnings
  ↓
Even lower Financial Stability
  ↓
DEATH SPIRAL
```

### Example: High-Prep Battle Approach
```
Accept Battle → 10 days until lock
  ↓
Allocate Prep:
- 4 Writing Days (memorization)
- 3 Performance Days (rehearsal)
- 2 Rest Days (stress management)
- 1 Research Day (angles)
  ↓
Effects:
- Choke probability: -1.6% (4 × 0.4%)
- Stumble probability: -2.4% (3 × 0.8%)
- Stress: -10 points (2 rest days)
- Angle bonus: +5% on applicable segments
- Resilience: +temporary boost
  ↓
Enter battle with optimal preparation
```

### Example: Tournament Finals Pressure
```
God Tier Finals Battle
  ↓
Factors:
- Tournament pressure: +3.0% choke
- Fame pressure (public knowledge 85): +0.45% choke
- High reputation (9): +0.6% choke
- Opponent rating +150: +0% (under threshold)
- Base choke: 0.3%
  ↓
Total choke chance per segment: 4.35%
  ↓
Over 18 segments (3 rounds × 6): ~55% chance of at least one choke
  ↓
FINALS ARE LEGITIMATELY SCARY
```

---

## CONFIGURATION REFERENCE

All tunable values that affect balance:

### Located in `config.ts`:
```typescript
// Choking (Current)
CHOKE_BASE_PROBABILITY: 0.03  // SHOULD BE 0.003
CHOKE_RESILIENCE_FACTOR: 0.015
CHOKE_PREP_REDUCTION: 0.008
CHOKE_STRESS_MULTIPLIER: 0.10
CHOKE_MINIMUM: 0.001
CHOKE_MAXIMUM: 0.25

// Stumbling (Not Yet Added)
STUMBLE_BASE_PROBABILITY: 0.008
STUMBLE_SCORE_MULTIPLIER: 0.70
STUMBLE_RECOVERY_MULTIPLIER: 0.85
STUMBLE_PREP_REDUCTION: 0.0008
STUMBLE_STRESS_MULTIPLIER: 0.04

// Round Order (Not Yet Added)
ROUND_ORDER_BASE_BONUS: 0.02
ROUND_ORDER_OPPONENT_STUMBLE_BONUS: 0.03
ROUND_ORDER_OPPONENT_CHOKE_BONUS: 0.05
ROUND_ORDER_ROUND3_BONUS: 0.03

// Crowd Fatigue (Not Yet Added)
CROWD_FATIGUE_START_POSITION: 6
CROWD_FATIGUE_BASE_PENALTY: 10
CROWD_FATIGUE_INCREMENT: 14
CROWD_FATIGUE_ELITE_COMPENSATION: 0.5
```

### Located in `stressManagement.ts`:
```typescript
Multiple battles: (count - 1) × 15
Time pressure: activeBattles × 10 (if < 3 days)
Recent fatigue: recentBattles × 5
Financial pressure: (4 - stability) × 5
Prep reduction: (prep - 5) × 2
Decay rate: -5 per day
```

---

**Last Updated:** Pre-Phase 4 Implementation (Stumbling/Choking Expansion)

**TODO:**
1. Implement stumbling system
2. Expand choke probability factors
3. Add round order mechanics
4. Add crowd fatigue system
5. Create life event status effect system
6. Add badge tier system
7. Fix `newsGenerator.ts` line 551 ("stumbled" → "choked")
