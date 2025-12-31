# BATTLE SYSTEM

## Overview

Battles in Algorithm Institute of BattleRap are **segment-based, not bar-based**. Instead of writing or speaking actual lyrics, the game simulates a complete battle through statistical scoring of your attributes, prep work, and performance under pressure. Every battle follows the same structure: **3 rounds, best 2 of 3**, with the winner determined by round-by-round scoring.

The beauty of this design is that it creates realistic outcomes without players having to write bars—your attributes and choices directly determine how well you perform.

---

## Battle Structure

### The 3-Round Format

Every battle consists of exactly **3 rounds**, and you need to win **2 rounds to win the battle**. This mirrors real battle rap tournament structures and creates natural comeback narratives:
- Win both first two rounds → You already won (no need for round 3)
- Lose both first two rounds → You're already out (round 3 is just for show)
- Split the first two → Round 3 is sudden death

### League-Specific Round Mechanics

The league you're battling in determines how long each round is and how it's divided into segments:

**Small Room Circuit** (writing-focused)
- Round length: 2 minutes
- Segments per round: 4 (30-second segments each)
- Philosophy: Fast-paced exchanges where lyricism and wordplay shine

**Main Stage Arena** (performance-focused)
- Round length: 3 minutes
- Segments per round: 6 (30-second segments each)
- Philosophy: Bigger stage, more time for delivery and crowd interaction

---

## Segment-Based Simulation

### What are Segments?

A **segment** is the fundamental unit of battle simulation—think of it as a 30-second block where you perform. In each segment, your battler receives a score (0-10) based on their attributes and the league's scoring formula.

**Why segments instead of full rounds?**
- Creates natural **peaks and valleys** in performance (you had a few huge moments but struggled overall)
- Enables **consistency tracking** (did you perform evenly or spike sporadically?)
- Drives **strategic prep choices** (different prep types help different segments)
- Makes battles feel dynamic rather than predetermined

### Segment Scoring Process

For each 30-second segment, here's what happens behind the scenes:

1. **Calculate Base Score** from your attributes
2. **Apply Variance** (±25% random fluctuation)
3. **Check for Peak Moment** (15% chance of a "haymaker")
4. **Check for Choke** (3% base chance, modified by prep and resilience)
5. **Finalize Score** and record any special events

The segment score is what feeds into the round summary stats (average, peak, consistency).

---

## Scoring Breakdown

### The Core Formula

Your segment score is calculated by blending your **writing power** and **performance power**, weighted by the league's preference:

```
Writing Power = (Lyricism + Wordplay + Creativity) / 3
Performance Power = (Stage Presence + Crowd Control + Delivery) / 3

Base Segment Score = (Writing Power × League Writing Weight) + (Performance Power × League Performance Weight)
```

### Example: Small Room vs Main Stage

Let's say you have:
- Lyricism: 8, Wordplay: 7, Creativity: 6 → **Writing Power = 7.0**
- Stage Presence: 6, Crowd Control: 5, Delivery: 5 → **Performance Power = 5.3**

**In Small Room Circuit** (2-minute rounds, writing-focused):
- Writing Weight: 0.65, Performance Weight: 0.35
- Base Score = (7.0 × 0.65) + (5.3 × 0.35) = 4.55 + 1.86 = **6.41**
- This high base represents the league favoring your writing strength

**In Main Stage Arena** (3-minute rounds, performance-focused):
- Writing Weight: 0.40, Performance Weight: 0.60
- Base Score = (7.0 × 0.40) + (5.3 × 0.60) = 2.8 + 3.18 = **5.98**
- Lower base, but still decent because the league rewards performance less, yet your writing still contributes

### Attribute Modification Through Prep

Your actual effective attributes aren't just your base stats—**prep directly improves them** before the battle starts.

Each day of focused prep adds **10% of that attribute's value**:

- **Writing Prep** (+10% × writing days): Boosts Lyricism, Wordplay, Creativity
- **Performance Prep** (+10% × performance days): Boosts Stage Presence, Crowd Control, Delivery
- **Research Prep** (+10% × research days × 0.5): Boosts Creativity (50%) and Lyricism (30%)—good for finding angles
- **Rest Prep** (+10% × rest days): Boosts Resilience (helps avoid chokes)
- **Life Prep** (+10% × life days × 0.5): Boosts Personal attributes (Family Bond, Financial Stability)

**Example with Prep:**
- Base Lyricism: 8
- 3 days of Writing Prep: 8 + (8 × 0.10 × 3) = 8 + 2.4 = **10.3** → clamped to **10**
- 2 days of Research Prep: 10 + (10 × 0.10 × 2 × 0.5) = 10 + 1 = **11** → clamped to **10**

You can only reach a maximum of 10, so diminishing returns kick in early. This prevents prep from being a guaranteed win—it's a significant advantage, but attributes matter more.

### Badge Multipliers

Your style badges can further modify your attributes and prep effectiveness:

- **Content Badges** (Angles, Comedy, Wordplay, etc.): Modify specific attributes by up to ±20%
- **Delivery Badges** (Aggressive, Smooth Flow, etc.): Increase performance attribute multipliers
- **Reputation Badges**: Positive badges boost crowd reaction; negative badges increase choke risk

Example: If you have the "Speed Rapping" badge, it might give you a 1.15× multiplier to Delivery, making you more effective in performance-heavy moments.

### Crowd Reaction Calculation

Crowd reaction is a **0-100 score** that represents how the crowd responded to your performance in a round. It's calculated as:

```
Crowd Reaction = (Average Score / 10) × 50 + (Performance Power / 10) × 50 × League Crowd Factor
```

**Small Room Circuit**: Lower crowd factor (0.7) because the venue is intimate
**Main Stage Arena**: Higher crowd factor (1.2) because the crowd is massive

A battler with high Performance Power will get a bigger crowd boost in Main Stage, but their average score always counts for half the crowd reaction. This prevents pure performance from dominating—you still need to actually perform well overall.

---

## Special Moments

### Haymakers: Peak Segments

A **haymaker** (or peak segment) is when you **crush a single segment**. Instead of your normal base score, it gets multiplied by **1.2-1.4×** (depending on badges):

- **Chance**: 15% base, **doubled to 30%** if you did research prep (because you found angles)
- **Effect**: Creates those memorable "he had THE moment" highlights
- **Badge Impact**: Wordplay-focused badges increase peak multiplier to 1.4×; inconsistency badges lower it

**Why it matters:**
- A 6.5 base score × 1.3 multiplier = 8.45 peak segment
- If your consistency is low, your average might be 5.5 but your peak is 8.45 → flashy but inconsistent
- Judges notice peaks, so even a weak overall round can be memorable with one huge moment

### Chokes: Catastrophic Failures

A **choke** is a segment where you completely collapse—your score gets cut to **30% of normal**:

- **Base Chance**: 3%
- **Reduced by Resilience**: Subtract 2.5% per resilience point (so 8 Resilience = 3% - 20% = effectively can't choke)
- **Reduced by Prep**: Each writing or performance prep day subtracts 1%
- **No-Show Penalty**: Triples the choke chance if you didn't prep

**Example Choke Probability Calculation:**
- Base: 3%
- Your Resilience: 6 → subtract 6 × 2.5% = 15%
- Your Prep: 5 writing days + 2 performance days = 7 days → subtract 7%
- **Final Choke Probability: 3% - 15% - 7% = -19% → clamped to 0% (you can't choke)**

Versus a low-resilience, no-prep opponent:
- Base: 3%
- Their Resilience: 2 → subtract 2 × 2.5% = 5%
- Their Prep: 0 days → no reduction
- No-show penalty: Triple the chance → 3% × 3 = 9%
- **Final Choke Probability: 9% - 5% = 4%**

**Why it matters:**
- Choking creates narrative tension—even a strong battler can have an off moment
- High resilience with good prep makes you nearly choke-proof
- A choke doesn't end the battle, but it creates an opening for a comeback

### Momentum Shifts

Momentum is a **qualitative narrative element** calculated as the performance difference between battlers across a round:

```
Momentum Delta = Your Average Score - Opponent's Average Score
```

- **Positive momentum** (winning): Confidence boost, crowd energy
- **Negative momentum** (losing): Pressure increases, resilience becomes critical
- **Momentum swings** (winning a round after losing round 1): Dramatic comeback narratives

The momentum metric feeds into post-battle recaps and affects future battle offers (you get offered tougher opponents if you're on a winning streak).

---

## Round Summaries

After all segments in a round are scored, the game calculates three summary stats:

### Average Score
The mean of all segment scores in the round:
```
Average Score = Sum of Segment Scores / Number of Segments
```

**What it represents**: Your overall consistency that round. A 6.2 average means you were reliably solid; a 5.1 average means you struggled.

**Example:**
- Small Room (4 segments): 7.2, 6.8, 5.9, 6.4 → Average = 6.58
- Main Stage (6 segments): 7.1, 6.3, 5.8, 7.4, 6.2, 6.1 → Average = 6.48

### Peak Score
The highest individual segment score in the round:
```
Peak Score = Maximum Segment Score
```

**What it represents**: Your best moment—the highlight reel moment the crowd remembers. Even if your average is 5.5, a peak of 8.2 makes for a memorable moment.

**Example:**
- Small Room segments: 7.2, 6.8, 5.9, 6.4 → Peak = **7.2**
- Main Stage segments: 7.1, 6.3, 5.8, 7.4, 6.2, 6.1 → Peak = **7.4**

### Consistency Score
How evenly you performed across the round (0-10):
```
Consistency Score = 10 - Standard Deviation of Segment Scores
```

Standard deviation measures the spread of scores:
- Low SD (scores cluster together) → High Consistency Score
- High SD (scores all over the place) → Low Consistency Score

**Example:**
- Consistent battler: 6.8, 6.9, 6.7, 6.8 → SD ≈ 0.08 → Consistency = ~9.9
- Streaky battler: 8.1, 4.3, 7.9, 5.2 → SD ≈ 1.8 → Consistency = ~8.2

**Why it matters**:
- Judges favor consistent performances (you were solid all round)
- Inconsistent performances are risky (you might get one huge score but also drop low)
- Badges can modify consistency—some favor peaks over consistency (risky play)

### Crowd Reaction
A 0-100 score representing how the crowd reacted to your performance:
- Heavily influenced by your **Performance Power** (Stage Presence, Crowd Control, Delivery)
- Boosted in **Main Stage Arena** (bigger crowd, more energy)
- Reduced if you had a **choke** (crowd goes silent)

**Crowd Reaction Example:**
- Your Average Score: 7.0 / 10
- Your Performance Power: 6.5 / 10
- League Crowd Factor: 1.2 (Main Stage)
- Crowd Reaction = (7.0 / 10) × 50 + (6.5 / 10) × 50 × 1.2 = 35 + 39 = **74 / 100**

High crowd reaction matters for:
- Battle recaps emphasize it as a narrative point
- Future battle offers (high crowd = popularity = tougher opponents)
- Life events (building reputation through crowd love)

---

## Determining the Winner

### Round Winners

After calculating average and peak scores for both battlers in a round, the **round winner** is determined:

```
If Your Average Score > Opponent's Average Score
    → YOU WIN THE ROUND
Else If Your Average Score == Opponent's Average Score
    → Whoever has Higher Peak Score WINS (tiebreaker)
Else
    → OPPONENT WINS THE ROUND
```

Average score is the primary metric because it represents consistent performance across the round. Peak score only matters as a tiebreaker.

**Example Round Scoring:**
- You: Average 6.8, Peak 7.9
- Opponent: Average 6.3, Peak 8.1
- **Result: You win** (6.8 > 6.3, peak doesn't matter)

**Tiebreaker Example:**
- You: Average 6.5, Peak 8.1
- Opponent: Average 6.5, Peak 7.8
- **Result: You win** (6.5 = 6.5, but your peak 8.1 > 7.8)

### Battle Winners

After all 3 rounds:

```
If You Won 2+ Rounds
    → YOU WIN THE BATTLE
Else
    → OPPONENT WINS THE BATTLE
```

That's it. No judge bias, no scoring manipulation. Round count is everything.

---

## Variance and Unpredictability

### Segment Variance (±25%)

Each segment has **±25% random variance** added to the base score. This is intentional:

```
Variance Range = ±25% of Base Score
Variance Applied = (Random Value - 0.5) × 2 × 0.25 × Base Score
Final Score = Base Score × (1 + Variance)
```

**Why?**
- **Realistic**: You don't perform identically every segment; some feel better
- **Exciting**: Even a strong favorite can lose a round if luck isn't with them
- **Comeback potential**: Down 1-0? You can absolutely win round 2 if you stay focused

**Example:**
- Your base score: 6.5
- Variance range: -1.625 to +1.625
- Possible final scores: 4.875 to 8.125
- This ±25% window is modified by badges (consistency badges narrow it; chaotic badges widen it)

### Badge Variance Modifiers

Certain badges adjust the variance window:

- **Consistency Badges**: Reduce variance to ±20% (more predictable, less swingy)
- **Chaotic Badges**: Increase variance to ±30% (huge upside, big downside)
- **Control Badges**: Can further reduce variance

A high-consistency battler is reliable but less exciting. A chaotic battler is boom-or-bust.

---

## No-Show Penalties

If you accept a battle but don't prepare (no prep blocks recorded), you get **forfeited** automatically:

**Forfeit Penalties:**
- Battle marked as loss with `no_show_player = true`
- Rating loss: Standard ELO loss + extra **10-point penalty**
- All your attributes reduced to **60% effectiveness**
- Choke chance tripled (you're unprepared and panicked)
- Consistency heavily penalized

**Why not just auto-simulate with minimal prep?**
The game still simulates the battle (you experience the loss), but the penalties are severe enough to discourage ghosting. This is kinder than true forfeit (free win for opponent) but harsh enough that players should either prep or explicitly withdraw.

---

## Behind the Scenes: Configuration

The following values are tunable for balance (in `simulation.ts` CONFIG object):

| Parameter | Current Value | Purpose |
|-----------|---------------|---------|
| `PREP_EFFECT_MULTIPLIER` | 0.10 (10%) | How much each prep day improves stats |
| `CHOKE_BASE_PROBABILITY` | 0.03 (3%) | Base chance of a catastrophic failure |
| `CHOKE_RESILIENCE_FACTOR` | 0.025 (2.5%) | Resilience reduction per point |
| `CHOKE_PREP_REDUCTION` | 0.01 (1%) | Choke reduction per prep day |
| `NO_SHOW_PENALTY` | 0.6 (60%) | Attribute multiplier for unprepared battlers |
| `PEAK_PROBABILITY` | 0.15 (15%) | Base chance of a haymaker segment |
| `SEGMENT_VARIANCE` | 0.25 (±25%) | Random fluctuation range per segment |
| `RATING_K_FACTOR` | 32 | ELO rating change magnitude |

These are all designed to be **tuned during Phase 7 balancing** based on playtesting feedback.

---

## Example: A Complete Battle

**Setup:**
- You (Lyricism 7, Wordplay 6, Creativity 7, Stage Presence 5, Crowd Control 5, Delivery 5, Resilience 6)
- vs. AI Battler (similar stats but slightly lower writing)
- League: **Small Room Circuit** (writing-focused, 2-min rounds = 4 segments)
- Your Prep: 3 writing days, 2 rest days
- AI Prep: 1 writing day, 1 performance day

**Prep Effects:**
- Your attributes boost: Lyricism 7→8.1, Wordplay 6→6.6, Creativity 7→8.1; Resilience 6→6.6
- AI attributes boost less (lower prep)

**Round 1 Simulation:**
1. **Segment 1**: Your base 6.7 (writing-focused), variance hits +18%, haymaker triggers → Score 8.1
2. **Segment 2**: AI's base 6.2, variance -12%, no special events → Score 5.5
3. **Segment 3**: Your base 6.7, variance -8% → Score 6.2
4. **Segment 4**: AI's base 6.2, variance +20% → Score 7.4

**Round 1 Results:**
- You: Average 6.65, Peak 8.1, Consistency 8.2, Crowd 72
- AI: Average 6.35, Peak 7.4, Consistency 7.1, Crowd 68
- **You win Round 1** (6.65 > 6.35)

**Round 2 & 3:**
- Similar simulation for rounds 2 and 3
- Round 2 you win again (solid prep paid off) → **Battle Win 2-0**
- Battle ends here; round 3 is skipped in narrative

**Result:**
- **You win the battle**, rating goes up by ~16 points (ELO calculation based on opponent strength)
- Battle recap generated: "Dominated from start with superior writing"
- Crowd reaction feeds into your reputation

---

## Key Takeaways

1. **Prep is critical**: Going into a battle unprepared nearly guarantees a loss
2. **Attributes matter more than prep**: A 9-rated battler beats a 4-rated even without prep
3. **Variance exists**: Upsets are possible; nothing is predetermined
4. **Peaks can save you**: You don't need to be great all round; one huge moment helps
5. **Consistency is valuable**: Judges prefer steady performances over one spike
6. **Resilience prevents catastrophe**: High resilience nearly eliminates chokes
7. **Leagues are different**: Small Room favors writing; Main Stage favors performance
8. **Badges matter**: They modify effectiveness and create build variety
