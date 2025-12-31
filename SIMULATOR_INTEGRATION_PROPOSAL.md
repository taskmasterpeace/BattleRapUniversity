# Simulator Integration Proposal

## Connecting Prep, Angles, Momentum & Rebuttals to the Battle Engine

---

## 1. Prep Phase Integration (Threshold System)

### Current State
The simulator assumes "5 writing days, 5 rehearsal days" for everyone - perfect prep. This makes prep meaningless.

### Proposed System: Prep Thresholds

**Core Concept:** The simulator's current output represents MAXIMUM POTENTIAL. Anything less than full prep REDUCES your performance.

#### Prep Threshold Formula

```
Required Prep Days = Round Length × 2
  - 4 segment round (2 min) = 8 prep days needed
  - 6 segment round (3 min) = 12 prep days needed

Prep Ratio = Actual Prep Days / Required Prep Days
  - 100% = Full potential (no penalty)
  - 75% = -10% to all scores
  - 50% = -25% to all scores
  - 25% = -40% to all scores + increased choke risk
  - 0% = -60% to all scores + high choke risk + no haymakers possible
```

#### Prep Day Type Bonuses

| Prep Type | What It Affects |
|-----------|-----------------|
| **Writing** | Base score for content-heavy segments (wordplay, schemes, punchlines) |
| **Rehearsal** | Consistency + reduced choke/stumble chance |
| **Research** | Angle effectiveness (see Section 2) |
| **Rest** | Resilience buffer, reduces fatigue penalty in Round 3 |
| **Life** | Can trigger life events, affects personal attributes |

#### Implementation in Simulator

```typescript
interface PrepBlock {
  writing_days: number;
  rehearsal_days: number;
  research_days: number;
  rest_days: number;
  life_days: number;
}

function calculatePrepEffectiveness(prep: PrepBlock, roundLength: number): PrepModifiers {
  const requiredDays = roundLength * 2;
  const totalPrep = prep.writing_days + prep.rehearsal_days + prep.research_days;
  const prepRatio = Math.min(1, totalPrep / requiredDays);

  return {
    scorePenalty: prepRatio < 1 ? (1 - prepRatio) * 0.6 : 0, // Up to -60%
    chokePenalty: prepRatio < 0.5 ? (0.5 - prepRatio) * 0.10 : 0, // Up to +5% choke
    haymakerAllowed: prepRatio >= 0.25, // Need at least 25% prep for haymakers
    writingBonus: prep.writing_days * 0.1, // +0.1 per writing day
    consistencyBonus: prep.rehearsal_days * 0.05, // +0.05 consistency per rehearsal
    angleAccuracy: prep.research_days * 0.15, // 15% accuracy per research day
  };
}
```

#### UI Changes
- Add prep sliders to simulator setup
- Show "Prep Effectiveness: 75%" warning when below threshold
- Display which bonuses/penalties are active

---

## 2. Research & Angles System

### Core Concept

**Angles = Personal attacks that reduce opponent's momentum**

Angles are the "personals" content type, but they need depth:
- **Accuracy** = How well-researched the angle is (research days)
- **Vulnerability** = Whether opponent has a weakness to this angle (badges/life events)
- **Impact** = How much momentum the angle takes away

### Angle Categories

| Angle Type | Vulnerability Source | Example |
|------------|---------------------|---------|
| **Career Angles** | Recent losses, chokes, no-shows | "You choked on your last 3 battles" |
| **Personal Life** | Life events (drama, money, family) | "Your baby mama drama is public" |
| **Style Critique** | Badges/playstyle | "You only got gun bars, no substance" |
| **Location/Rep** | Region, crew affiliations | "You claim the coast but never repped it" |

### Vulnerability System (Badge-Unlocked)

Certain badges make battlers VULNERABLE to specific angles:

| Badge | Unlocks Vulnerability To |
|-------|-------------------------|
| `choker` | Career angles about past chokes |
| `drama_starter` | Personal life angles |
| `one_dimensional` | Style critique angles |
| `money_problems` | Financial angles |
| `family_issues` | Family angles |
| `no_show_history` | Reliability angles |

**If opponent has vulnerability badge + you researched it = DEVASTATING angle**

### Angle Impact Formula

```typescript
function calculateAngleImpact(
  researchDays: number,
  opponentVulnerabilities: string[],
  angleType: string
): AngleResult {
  // Base accuracy from research
  const baseAccuracy = Math.min(1, researchDays * 0.15); // Max 100% at 7 research days

  // Vulnerability multiplier
  const hasVulnerability = opponentVulnerabilities.includes(angleType);
  const vulnerabilityMultiplier = hasVulnerability ? 2.0 : 1.0;

  // Random accuracy roll (research makes it more consistent)
  const accuracyRoll = baseAccuracy + (Math.random() * (1 - baseAccuracy) * 0.5);

  // Final impact on opponent's momentum
  const momentumDamage = accuracyRoll * vulnerabilityMultiplier * 0.15; // Up to -30% momentum

  return {
    accuracy: accuracyRoll,
    hitVulnerability: hasVulnerability,
    momentumDamage, // Applied to opponent's NEXT segment
    crowdReaction: hasVulnerability ? 'THAT WAS PERSONAL!' : 'decent angle',
  };
}
```

### How It Plays Out

1. **Before Battle:** Player sees opponent's PUBLIC badges (some vulnerabilities are hidden)
2. **Prep Phase:** Each research day increases angle accuracy by 15%
3. **During Battle:** When using PERSONALS content type:
   - Roll for accuracy (research-boosted)
   - Check if angle hits a vulnerability
   - If hit: Opponent loses momentum for next segment
   - Crowd reacts accordingly

### Example Battle Flow

```
Round 1, Segment 3: DNA uses PERSONALS (Street Pressure strategy)

DNA has 4 research days = 60% base accuracy
Geechi has "choker" badge = VULNERABLE to career angles

Roll: 0.72 (above 60% threshold = accurate)
Vulnerability: HIT - career angle about past chokes
Impact: -30% to Geechi's momentum for Segment 4

Crowd: "TALK ABOUT IT! HE DID CHOKE!"
Geechi's S4 score reduced by 30%
```

---

## 3. Momentum Carry-Over

### Current State
Simulator shows "Momentum into Round X: EVEN" but doesn't apply any effect.

### Proposed System

**Momentum = Advantage carried from previous round to next round opener**

#### Momentum Levels

| Level | Trigger | Effect on Next Round |
|-------|---------|---------------------|
| **HEAVY** | Won by 2.0+ avg difference | +15% to R+1 opener, opponent -10% |
| **SOLID** | Won by 1.0-2.0 avg | +10% to R+1 opener |
| **SLIGHT** | Won by 0.5-1.0 avg | +5% to R+1 opener |
| **EVEN** | Won by <0.5 avg | No effect |
| **BEHIND** | Lost previous round | -5% to R+1 opener |

#### Momentum Decay
- Momentum only affects the OPENER segment of next round
- After S1, both battlers are back to baseline
- This simulates "starting strong" after a good round

#### Momentum Theft (Angles)
When an angle hits a vulnerability, it STEALS momentum:
- Successful angle: +10% momentum to attacker
- Hit vulnerability: +20% momentum to attacker, -15% to defender

```typescript
function applyMomentum(
  previousRoundWinner: 'A' | 'B' | null,
  scoreDifference: number,
  battler: 'A' | 'B',
  segmentNumber: number
): number {
  // Momentum only affects opener
  if (segmentNumber !== 1) return 0;

  if (!previousRoundWinner) return 0;

  const isWinner = previousRoundWinner === battler;

  if (scoreDifference >= 2.0) {
    return isWinner ? 0.15 : -0.10; // Heavy momentum
  } else if (scoreDifference >= 1.0) {
    return isWinner ? 0.10 : -0.05; // Solid
  } else if (scoreDifference >= 0.5) {
    return isWinner ? 0.05 : 0; // Slight
  }

  return 0; // Even - no effect
}
```

---

## 4. Fatigue/Energy - SKIP FOR NOW

Per your direction, we'll skip this. The game is about BATTLE performance, not endurance. Rest days already provide resilience bonuses which handles the "not worn out" concept.

---

## 5. Life Events Impact

### Current State
Life events exist in the database but don't connect to battles.

### Proposed Integration

Life events should affect battles in TWO ways:
1. **Pre-Battle Attribute Modifiers** - Temporary boosts/penalties
2. **Angle Vulnerabilities** - Open you up to personal attacks

#### Life Event → Battle Impact

| Life Event | Attribute Effect | Vulnerability Created |
|------------|------------------|----------------------|
| **Win Streak (3+)** | +0.5 confidence, +5% crowd favor | None (but opponent may try to "humble" you) |
| **Loss Streak (3+)** | -0.3 confidence, -5% crowd favor | "losing momentum" angles |
| **Baby Born** | +0.2 motivation | None |
| **Relationship Drama** | -0.2 focus, +3% choke chance | "personal life" angles |
| **Money Problems** | -0.3 confidence | "financial" angles |
| **Beef/Callout Received** | +0.3 aggression | "running from the fade" angles |
| **Friend's Death** | -0.2 focus OR +0.3 passion (random) | "personal tragedy" angles (risky for opponent) |

#### Implementation

```typescript
interface LifeEventBattleModifier {
  event_type: string;
  attribute_changes: Record<string, number>;
  vulnerability_added?: string;
  expires_after_battles: number;
}

function applyLifeEventsToSimulator(battler: Battler): BattleModifiers {
  const recentEvents = battler.life_events.filter(e => e.active);

  let modifiers = {
    confidence: 0,
    focus: 0,
    aggression: 0,
    crowdFavor: 0,
    chokeModifier: 0,
    vulnerabilities: [...battler.existingVulnerabilities],
  };

  for (const event of recentEvents) {
    // Apply attribute changes
    Object.entries(event.attribute_changes).forEach(([attr, change]) => {
      modifiers[attr] += change;
    });

    // Add vulnerability if applicable
    if (event.vulnerability_added) {
      modifiers.vulnerabilities.push(event.vulnerability_added);
    }
  }

  return modifiers;
}
```

---

## 6. Counter-Play & Rebuttals

### The Challenge
Real battle rap has REBUTTALS - responding to what opponent just said. How do we simulate this without writing actual bars?

### Proposed System: Rebuttal Windows

**Core Concept:** After opponent performs, you have a CHOICE:
1. **Stick to your gameplan** - Use your prepared content (safer, consistent)
2. **Go for a rebuttal** - React to what they just said (riskier, higher ceiling)

#### Rebuttal Mechanics

```
REBUTTAL DECISION POINT (after opponent's segment)

Option A: PREPARED CONTENT
  - Use your selected strategy's content
  - Consistent scoring based on prep
  - No bonus, no risk

Option B: REBUTTAL ATTEMPT
  - Requires "freestyle_artist" or "rebuttal_king" badge for full bonus
  - Success: +20% to this segment + crowd loves it
  - Failure: -15% to this segment (looked forced)
  - Without badge: 40% success rate
  - With badge: 70% success rate
```

#### Rebuttal Triggers

Certain opponent moments create REBUTTAL OPPORTUNITIES:
- Opponent choked → Easy rebuttal ("You forgot your bars?")
- Opponent stumbled → Medium rebuttal ("Catch your breath")
- Opponent used weak angle → Counter-angle opportunity
- Opponent had haymaker → Risky to rebuttal (they're hot)

#### Implementation for Simulator

```typescript
interface RebuttalDecision {
  available: boolean;
  trigger: 'choke' | 'stumble' | 'weak_angle' | 'haymaker' | 'normal';
  successChance: number;
  potentialBonus: number;
  potentialPenalty: number;
}

function calculateRebuttalOpportunity(
  opponentLastSegment: SegmentResult,
  battlerBadges: string[]
): RebuttalDecision {
  const hasFreestyleBadge = battlerBadges.includes('freestyle_artist');
  const hasRebuttalBadge = battlerBadges.includes('rebuttal_king');
  const badgeBonus = (hasFreestyleBadge ? 0.15 : 0) + (hasRebuttalBadge ? 0.15 : 0);

  let trigger: RebuttalDecision['trigger'] = 'normal';
  let baseSuccess = 0.40;

  if (opponentLastSegment.choked) {
    trigger = 'choke';
    baseSuccess = 0.80; // Easy target
  } else if (opponentLastSegment.stumbled) {
    trigger = 'stumble';
    baseSuccess = 0.60;
  } else if (opponentLastSegment.isHaymaker) {
    trigger = 'haymaker';
    baseSuccess = 0.30; // Risky to rebuttal when they're hot
  }

  return {
    available: true,
    trigger,
    successChance: Math.min(0.90, baseSuccess + badgeBonus),
    potentialBonus: 0.20,
    potentialPenalty: 0.15,
  };
}
```

#### UI Flow for Simulator

```
SEGMENT 2 - Opponent just performed (scored 7.8)

Your turn. Choose:
[ GAMEPLAN: Use Schemes (prepared) ]
[ REBUTTAL: React to their weak closer ] → 65% success

If REBUTTAL selected:
  Roll: Success!
  "REBUTTAL LANDED! +20% to this segment"
  Crowd: "HE JUST FLIPPED THAT!"
```

### Freestyle Mode Strategy

The "Freestyle Mode" strategy already exists. With this system:
- Freestyle Mode = Higher rebuttal success rate
- Content: freestyles, rebuttals, crowd_work
- Badge synergy: freestyle_artist + rebuttal_king = 90% success rate
- Risk: More variance, but higher ceiling

---

## 7. Rating/Ranking Changes

### What This Means

After every battle, your **ELO rating** should change based on:
- Win/Loss result
- Opponent's rating (beating higher-rated = bigger gain)
- Performance quality (body vs debatable)
- Chokes/stumbles (even winners lose points for choking)

### Current System

The game has a `rankings` table with:
- `rating` (ELO-style number)
- `wins` / `losses`
- `streak`

But the simulator doesn't show or calculate rating changes.

### Proposed Display

After battle completion, show:

```
RATING CHANGES

Tsunami Wave:
  Before: 1450
  After:  1420 (-30)
  Reason: Lost to higher-rated opponent, choked in R1

The Comedian:
  Before: 1480
  After:  1510 (+30)
  Reason: Beat opponent, consistent performance
```

### Rating Change Formula

```typescript
function calculateRatingChange(
  winner: Battler,
  loser: Battler,
  battleResult: BattleResult
): { winnerChange: number; loserChange: number } {
  const K = 32; // Standard ELO K-factor

  // Expected win probability
  const expectedWinner = 1 / (1 + Math.pow(10, (loser.rating - winner.rating) / 400));
  const expectedLoser = 1 - expectedWinner;

  // Base change
  let winnerChange = Math.round(K * (1 - expectedWinner));
  let loserChange = Math.round(K * (0 - expectedLoser));

  // Bonus for dominant win (3-0)
  if (battleResult.isBody) {
    winnerChange = Math.round(winnerChange * 1.5);
    loserChange = Math.round(loserChange * 1.5);
  }

  // Penalty for choking (even winners)
  if (battleResult.winnerChoked) {
    winnerChange = Math.round(winnerChange * 0.7);
  }
  if (battleResult.loserChoked) {
    loserChange = Math.round(loserChange * 1.3); // Extra loss for choking
  }

  return { winnerChange, loserChange };
}
```

### Why This Matters

1. **Stakes** - Battles have consequences beyond win/loss
2. **Matchmaking** - Higher rating = better opponents = bigger opportunities
3. **Career Tracking** - See your rating climb over career
4. **Risk/Reward** - Taking risky battles (higher-rated opponents) has bigger payoffs

---

## Implementation Priority

### Phase 1: Core Mechanics (Do First)
1. **Prep Threshold System** - Easy to add, immediate impact
2. **Momentum Carry-Over** - Simple formula, already displayed
3. **Rating Changes Display** - Data exists, just show it

### Phase 2: Depth Systems (Next)
4. **Research & Angles** - Requires vulnerability mapping
5. **Life Events Integration** - Connect existing events to battles
6. **Rebuttal System** - New decision points during battle

### Phase 3: Polish
7. **UI for all new systems**
8. **Balance tuning based on playtesting**
9. **Tutorial/guide content**

---

## Questions for You

1. **Prep Threshold** - Should failed prep result in auto-loss scenarios (like 0 prep = forfeit)?

2. **Vulnerability Visibility** - Should players see opponent's vulnerabilities before battle, or discover them during research?

3. **Rebuttal Control** - Should rebuttals be:
   - A) Player choice each segment (more control, slower)
   - B) Strategy-based (Freestyle Mode = auto-attempts rebuttals)
   - C) Random based on badges (hands-off)

4. **Rating Floor** - Should there be a minimum rating players can't drop below?

---

*Proposal by Algorithm Institute Engineering Division*
*December 6, 2025*
