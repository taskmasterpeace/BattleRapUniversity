# PREPARATION PHASE

## What is Prep?

The **Preparation Phase** is the heart of battle strategy—a 7-14 day window between accepting a battle offer and the scheduled battle date. This is where you transform your raw attributes into battle-ready performance. Unlike passive rating systems, prep is *active*: every single day you choose a focus, and those choices compound into measurable advantages (or disadvantages if you neglect prep).

Think of prep as the difference between showing up to a championship unprepared versus putting in weeks of focused work. A battler with identical base attributes can dominate or collapse depending on how they spent the week before battle.

### Key Mechanics
- **Prep days**: 7-14 days to plan (minimum ~7 until lock_prep_at, typically 10-14 for real planning window)
- **Daily choices**: Each day, pick ONE focus type (or auto-fill with rest/life if you skip)
- **Compounding gains**: Each prep day = +0.10 to relevant stats (before badge multipliers)
- **No changes after lock**: Once `lock_prep_at` passes, your plan is locked—no second-guessing
- **No-show penalty**: Miss prep deadlines? -30% to all combat attributes + higher choke risk
- **Badge synergy**: Your style tags make certain prep types more or less effective

---

## Daily Focus Options

Every prep day forces a strategic choice: what's your priority? The five focus types create different risk/reward profiles.

### 1. RESEARCH (Angle Study & Opponent Analysis)

**What you're doing**: Deep dive into angles, personas, potential rebuttals. You're studying your opponent's catalog, identifying weak points, and prepping counter-angles and scenarios.

**Attribute Gains**:
- **Creativity**: +0.05 per day (50% of base 0.10)
- **Lyricism**: +0.03 per day (30% of base 0.10)
- *Secondary effect*: Unlocks "angle bonus" in battle scoring

**Use When**:
- Your opponent has predictable patterns you can exploit
- You're a technical battler who thrives on preparation
- You want the mental edge of knowing what's coming

**Base Efficiency**: 1.0x (neutral baseline)
- **Boosted by**: Angle Master (+35%), Battle Technician (+40%), Personal Attacks (+30%), Pop Culture References (+20%), Freestyle Genius (+20%)
- **Hindered by**: Shallow Research (-50%)

**Example**: With **Angle Master badge** and 5 research days:
- Base boost: 5 × 0.10 × 1.0 = +0.50 to relevant stats
- With badge efficiency (+35%): 5 × 0.10 × 1.35 = +0.68 to creativity, +0.405 to lyricism
- Result: Creativity gains from 6.0 → 6.68, Lyricism from 5.0 → 5.405

---

### 2. WRITING (Bars, Schemes, Wordplay)

**What you're doing**: Grinding bars. Writing complex schemes, stacking punchlines, perfecting wordplay and multi-syllabic setups. This is pure pen game development.

**Attribute Gains**:
- **Lyricism**: +0.10 per day
- **Wordplay**: +0.10 per day
- **Creativity**: +0.10 per day
- *Secondary effect*: Higher consistency in bars/schemes (less "off" performances)

**Use When**:
- You're a technical writer or content specialist
- You want guaranteed, predictable improvements
- Your strength is pen game, not freestyle

**Base Efficiency**: 1.0x (neutral baseline)
- **Boosted by**: Technical Writer (+35%), Scheme Specialist (+30%), Multisyllabic Master (+25%), Pen Game Elite (+30%), Consistent Writer (+15%)
- **Hindered by**: Lazy Writer (-40%), Recycler (-20%)

**Example**: **Technical Writer badge** with 8 writing days during high-prep window:
- Base boost: 8 × 0.10 = +0.80 per attribute
- With badge efficiency (+35%): 8 × 0.10 × 1.35 = +1.08 per attribute
- Caps at 10, so: Lyricism 5.5 → 6.58, Wordplay 4.2 → 5.28, Creativity 5.0 → 6.08
- **PLUS High Prep Bonus** (8+ days + highPrepBonus badge): All attributes get ×1.12 multiplier = additional +12% across the board

**Visual Example Schedule** (Technical Writer with 10-day prep):
```
Mon - Writing
Tue - Writing
Wed - Writing
Thu - Writing
Fri - Writing
Sat - Writing
Sun - Research (angles)
Mon - Rest (resilience buffer)
Tue - Writing
Wed - Rest (recover before battle)
```
Result: 8 writing days → +1.08 per writing stat (with badge), 1 research day → +0.135 creativity bonus, plus 12% high-prep multiplier on everything.

---

### 3. PERFORMANCE (Delivery, Stage Presence, Crowd Work)

**What you're doing**: Vocal drills, delivery practice, crowd engagement training, stage choreography. You're training your body and presence, not your pen.

**Attribute Gains**:
- **Stage Presence**: +0.10 per day
- **Crowd Control**: +0.10 per day
- **Delivery**: +0.10 per day
- *Secondary effect*: Better crowd reaction during battle (crowd is more receptive)

**Use When**:
- You're a performance-heavy battler (crowd work is your game)
- The venue is Main Stage Arena (3-minute rounds favor stage presence)
- You're weak on pen but strong on personality

**Base Efficiency**: 1.0x (neutral baseline)
- **Boosted by**: Stage Domination (+30%), Theatrical (+25%), Smooth Flow (+20%), Charismatic (+15%), Impersonations (+20%)
- **Hindered by**: Monotone Deliverer (-20%), Awkward Stage Presence (-30%)

**Example**: **Stage Domination badge** with 7 performance days in Main Stage Arena:
- Base boost: 7 × 0.10 × 1.30 = +0.91 per attribute
- Stage Presence: 6.0 → 6.91
- Crowd Control: 5.5 → 6.41
- Delivery: 6.2 → 7.11
- **Bonus**: Main Stage Arena bonus (+10% from Stage Domination) applies to all attributes = extra +0.91 × 0.10 = +0.091 per attribute

---

### 4. REST (Recover Resilience, Reduce Mental Fatigue)

**What you're doing**: Sleep, meditation, avoiding burnout. You're building mental toughness and the ability to stay sharp under pressure.

**Attribute Gains**:
- **Resilience**: +0.10 per day
- *Critical effect*: Reduces choke probability (catastrophic failure chance)

**Use When**:
- Your resilience is low (4 or below)
- You have badges that increase choke chance (Aggressive, Speed Rapping, Choker, etc.)
- You want insurance against mental collapse mid-battle

**Base Efficiency**: 1.0x (neutral baseline)
- **Boosted by**: Resilient Battler (+25%), Respected Veteran (+20%), Clutch Performer (+20%)
- **Hindered by**: Choker (-30%), Known Choker (-40%), Unreliable (-20%)

**Example**: With **Clutch Performer badge** and low natural resilience (3.0):
- 3 rest days: 3 × 0.10 × 1.20 = +0.36
- Resilience: 3.0 → 3.36
- Additional benefit: -4% choke chance from Clutch Performer badge
- Result: More stable, less likely to catastrophically fail under pressure

### Critical: Rest vs. "Coasting"
There's a difference between *planning rest days* and *not preparing*:
- **Planned rest day**: Deliberately chose rest → +0.10 resilience, strategic choice
- **No-show/neglect**: Didn't fill prep calendar → -30% all attributes + choke risk

If you accept a battle but don't plan anything (0 prep days), the system auto-fills with minimal rest/life—this is a penalty, not a strategy.

---

### 5. LIFE (Personal Stability, Family/Financial Issues)

**What you're doing**: Dealing with personal life. Family drama, money problems, relationship issues, or positive life events. This isn't prep—it's living.

**Attribute Gains**:
- **Family Bond**: +0.10 per day
- **Financial Stability**: +0.05 per day (50% of base)
- *Secondary effect*: Can trigger random life events (both positive and negative)

**Use When**:
- You have low family bond or financial stability (affects morale)
- You want stability/grounding before a high-stakes battle
- You need to stay mentally balanced

**Base Efficiency**: 1.0x (neutral baseline)
- **Boosted by**: All badges affect this equally; no major boosters or hindrances

**Example**: Generic battler with 2 life days:
- Family Bond: 5.0 → 5.20
- Financial Stability: 4.5 → 4.55
- Not impactful for combat, but prevents negative life events from tanking morale

---

## How Prep Affects Battles: Concrete Examples

### Example 1: The Grinder (Technical Writer with Perfect Prep)

**Base Attributes**:
- Lyricism: 5, Wordplay: 4, Creativity: 5
- Stage Presence: 4, Crowd Control: 5, Delivery: 5
- Resilience: 6
- Badge: **Technical Writer** (writingPrepEfficiency +35%, highPrepBonus)

**Prep Plan** (10 days before battle):
```
Days 1-6: Writing
Day 7: Research
Days 8-10: Writing (2) + Rest (1)
```

**Calculation**:
- 8 writing days: 8 × 0.10 × 1.35 = +1.08 per writing attribute (capped at 10)
- 1 research day: 1 × 0.10 × 1.35 = +0.135 creativity, +0.081 lyricism
- 1 rest day: 1 × 0.10 = +0.10 resilience
- High prep bonus (8+ days + badge): All attributes ×1.12

**Final Stats After Prep**:
- Lyricism: (5 + 1.08 + 0.081) × 1.12 = 6.88
- Wordplay: (4 + 1.08) × 1.12 = 5.71
- Creativity: (5 + 1.08 + 0.135) × 1.12 = 6.96
- Stage Presence: 4 × 1.12 = 4.48 (unchanged except for league bonus, which is minimal for Technical Writer)
- Resilience: 6 + 0.10 = 6.10

**Battle Outcome**: Dominant in lyricism/wordplay categories. Expected to win 3-0 against AI opponent with lower writing stats.

---

### Example 2: The Freestyler (Freestyle Genius with Minimal Prep)

**Base Attributes**:
- Lyricism: 5, Wordplay: 6, Creativity: 7
- Stage Presence: 6, Crowd Control: 5, Delivery: 6
- Resilience: 5
- Badge: **Freestyle Genius** (lowPrepBonus, chokeReduction -25%, segmentVarianceMultiplier 1.5, consistencyPenalty 1.5)

**Prep Plan** (10 days, but minimal actual prep):
```
Days 1-3: Research (scenario prep, think on feet)
Days 4-10: Auto-filled with Rest/Life (system default for no-show)
```

**Calculation**:
- 3 research days: 3 × 0.10 × 1.2 (Freestyle Genius bonus) = +0.36 creativity
- 7 auto-fill rest: 7 × 0.10 = +0.70 resilience
- Low prep bonus (≤3 intentional days + badge): All attributes ×1.15

**Final Stats After Prep**:
- Lyricism: (5) × 1.15 = 5.75 (research doesn't boost lyricism as much)
- Wordplay: (6) × 1.15 = 6.90
- Creativity: (7 + 0.36) × 1.15 = 8.44
- Stage Presence: 6 × 1.15 = 6.90
- Resilience: 5 + 0.70 - 0.25 (Freestyle Genius chokeReduction) = 5.45

**Battle Outcome**:
- High variance performance (segmentVarianceMultiplier 1.5 = wild swings)
- Some segments brilliant (peak score high), others inconsistent
- 25% less likely to completely choke
- Perfect if opponent can't adapt; risky if they read the pattern

---

### Example 3: The Unprepared (No Strategic Prep)

**Base Attributes**:
- Lyricism: 6, Wordplay: 5, Creativity: 5
- Stage Presence: 5, Crowd Control: 5, Delivery: 6
- Resilience: 4
- Badge: Generic (neutral modifiers)

**Prep Plan**: Accepted battle, but didn't fill prep calendar (0 intentional days)

**System Auto-Fill**:
- Auto-generated rest/life (non-optimal)
- `no_show_player = true` flag
- NO_SHOW_PENALTY: ×0.70 to all combat attributes

**Calculation**:
- 0 prep days: +0.00 to all attributes
- No-show penalty: All combat attributes ×0.70

**Final Stats After "Prep"**:
- Lyricism: 6 × 0.70 = 4.20
- Wordplay: 5 × 0.70 = 3.50
- Creativity: 5 × 0.70 = 3.50
- Stage Presence: 5 × 0.70 = 3.50
- Crowd Control: 5 × 0.70 = 3.50
- Delivery: 6 × 0.70 = 4.20
- Resilience: 4 (unchanged, but higher choke chance)

**Battle Outcome**:
- Massive underperformance (effectively -30% across the board)
- Expected to lose 1-3 or 0-3 against equally-ranked opponent
- High probability of choke (catastrophic failure on one or more rounds)
- Reputation/rating hit will be brutal

---

### Example 4: The Balanced Technician (Battle Technician Badge)

**Base Attributes**:
- Lyricism: 6, Wordplay: 5, Creativity: 5
- Stage Presence: 5, Crowd Control: 5, Delivery: 5
- Resilience: 6
- Badge: **Battle Technician** (researchPrepEfficiency +40%, writingPrepEfficiency +25%, balancedPrepBonus)

**Prep Plan** (10 days, diverse focus):
```
Days 1-2: Research
Days 3-4: Writing
Days 5-6: Performance
Days 7-8: Rest
Days 9-10: Writing
```

**Calculation**:
- 2 research days: 2 × 0.10 × 1.40 = +0.28 creativity
- 3 writing days: 3 × 0.10 × 1.25 = +0.375 per writing attribute
- 2 performance days: 2 × 0.10 × 1.0 = +0.20 per performance attribute
- 2 rest days: 2 × 0.10 = +0.20 resilience
- Balanced prep bonus (3+ categories with 2+ days each, + badge): All attributes ×1.10

**Final Stats After Prep**:
- Lyricism: (6 + 0.375 + 0.084) × 1.10 = 7.10
- Wordplay: (5 + 0.375) × 1.10 = 5.91
- Creativity: (5 + 0.375 + 0.28) × 1.10 = 6.12
- Stage Presence: (5 + 0.20) × 1.10 = 5.72
- Crowd Control: (5 + 0.20) × 1.10 = 5.72
- Delivery: (5 + 0.20) × 1.10 = 5.72
- Resilience: 6 + 0.20 = 6.20

**Battle Outcome**: Well-rounded improvements across all categories. No weakness exploitable by opponent. Expected to win 2-1 or 3-0 depending on opponent's specialty.

---

## Prep Strategies by Archetype

### Writing-Heavy Strategy (The Scholar)

**Best For**: Technical Writer, Scheme Specialist, Pen Game Elite

**Sample 10-Day Schedule**:
```
Monday:    Writing
Tuesday:   Writing
Wednesday: Writing
Thursday:  Writing
Friday:    Writing
Saturday:  Research (study opponent angles)
Sunday:    Rest (recover)
Monday:    Writing
Tuesday:   Writing
Wednesday: Rest (final mental prep)
```

**Prep Breakdown**: 8 writing, 1 research, 2 rest days
**Expected Gains** (with +35% badge efficiency):
- Lyricism: +1.08 base
- Wordplay: +1.08 base
- Creativity: +1.08 + 0.135 research = +1.215 base
- Resilience: +0.20
- High prep bonus (8+ days): ×1.12 multiplier on all stats

**Why This Works**:
- Maximizes writing prep (your strength)
- Technical badges reward focused writing grinding
- Research day covers tactical/angle preparation
- Final rest day ensures you're mentally sharp, not burned out

**Risk**: Weak on performance/crowd work. If battle favors stage presence, you're at a disadvantage.

---

### Research-Heavy Strategy (The Scout)

**Best For**: Angle Master, Battle Technician, Personal Attacks

**Sample 10-Day Schedule**:
```
Monday:    Research
Tuesday:   Research
Wednesday: Research
Thursday:  Research
Friday:    Writing (quick pen refresh)
Saturday:  Rest
Sunday:    Research
Monday:    Research
Tuesday:   Research
Wednesday: Rest (final check)
```

**Prep Breakdown**: 7 research, 1 writing, 2 rest days
**Expected Gains** (with +35% badge efficiency):
- Creativity: +0.70 base
- Lyricism: +0.42 base
- Wordplay: +0.10 (1 writing day)
- Resilience: +0.20
- Research heavily fuels creativity (70% higher variance in angles)

**Why This Works**:
- Angle Master/Battle Technician badges reward research heavily (+35-40%)
- You're prepping counters, not just bars
- Psychological edge: You know what's coming
- Works in Small Room Circuit where angles/rebuttals are crucial

**Risk**: Your bars might be generic if you skip writing. Good for rebuttals, risky for initial rounds.

---

### Performance-Heavy Strategy (The Showman)

**Best For**: Stage Domination, Crowd Favorite, Theatrical

**Sample 10-Day Schedule**:
```
Monday:    Performance
Tuesday:   Performance
Wednesday: Performance
Thursday:  Performance
Friday:    Writing (1 bar refresh)
Saturday:  Performance
Sunday:    Rest
Monday:    Performance
Tuesday:   Performance
Wednesday: Rest (final stretch)
```

**Prep Breakdown**: 7 performance, 1 writing, 2 rest days
**Expected Gains** (with +30% badge efficiency):
- Stage Presence: +0.91 base
- Crowd Control: +0.91 base
- Delivery: +0.91 base
- Resilience: +0.20
- Main Stage Arena bonus: +10% more to all stats

**Why This Works**:
- Stage Domination/Crowd Favorite badges reward performance prep heavily (+30%)
- Main Stage Arena (3-minute rounds) plays to performance strength
- You're training crowd manipulation and stage control
- Expected crowd reaction boost carries you even if bars aren't perfect

**Risk**: Low writing means your content is weak. Opponent with strong pen will punish generic bars.

---

### Balanced Strategy (The Versatile)

**Best For**: Battle Technician, Rebuttal King/Queen, generic battlers

**Sample 10-Day Schedule**:
```
Monday:    Research
Tuesday:   Writing
Wednesday: Performance
Thursday:  Writing
Friday:    Rest
Saturday:  Research
Sunday:    Writing
Monday:    Performance
Tuesday:   Rest
Wednesday: Writing
```

**Prep Breakdown**: 2 research, 4 writing, 2 performance, 2 rest days
**Expected Gains** (generic, no badge bonus assumed):
- Lyricism: +0.40 (4 writing days)
- Wordplay: +0.40
- Creativity: +0.40 + 0.20 (2 research) = +0.60
- Stage Presence: +0.20
- Crowd Control: +0.20
- Delivery: +0.20
- Resilience: +0.20

**Why This Works**:
- No glaring weakness in any category
- You can respond to opponent's strategy
- Balanced prep bonus (if you have it): ×1.10 multiplier
- Flexibility: If battle environment favors writing, you prepared for it; if it favors performance, same

**Risk**: Jack of all trades, master of none. Opponent with focused specialty will outshine you in their domain.

---

### Freestyler Strategy (Minimal Intentional Prep)

**Best For**: Freestyle Genius, Rebuttal King/Queen

**Sample 10-Day Schedule**:
```
Monday:    Research (scenario mapping, think-on-feet drills)
Tuesday:   Research
Wednesday: Research
Thursday:  Rest
Friday:    Rest
Saturday:  Rest
Sunday:    Rest
Monday:    Rest
Tuesday:   Rest
Wednesday: Rest
```

**Prep Breakdown**: 3 research, 7 rest days
**Expected Gains** (with Freestyle Genius +20% research, +25% choke reduction):
- Creativity: +0.36 (3 × 0.10 × 1.2)
- Resilience: +0.70 - 0.25 (choke reduction) = +0.45 net
- Low prep bonus (≤3 days + badge): ×1.15 multiplier

**Why This Works**:
- Freestyle Genius thrives on minimal prep (+15% low-prep bonus)
- Research is the only "prep" you do (scenario mapping, not bar-writing)
- Rest buffers resilience and reduces choke (critical for freestylers)
- You stay sharp and adaptable, not locked into pre-written schemes
- segmentVarianceMultiplier 1.5 means wild highs and lows (risky, but rewarding if you're skilled)

**Risk**: High variance. Some rounds you'll be brilliant, others weak. Opponent with consistent preparation beats you if they out-prepare your natural skill.

---

## Prep Efficiency Badges

### How Badge Multipliers Work

Each badge modifies how effective prep is. There are **five prep efficiency stats**:

1. **writingPrepEfficiency**: How much writing days boost lyricism/wordplay/creativity
2. **performancePrepEfficiency**: How much performance days boost stage presence/crowd control/delivery
3. **researchPrepEfficiency**: How much research days boost creativity (and partial lyricism)
4. **restEfficiency**: How much rest days boost resilience
5. **lifePrepEfficiency**: How much life days boost family bond/financial stability

Each day of prep is calculated as:
```
Attribute Gain = Prep Days × 0.10 × Badge Efficiency Multiplier
```

### High Efficiency Badges (1.3-1.4x)

These badges make prep incredibly efficient. Fewer days yield bigger gains.

| Badge | Efficiency Boost | Best Use |
|-------|------------------|----------|
| **Technical Writer** | Writing +35% | 6-8 writing days = massive lyricism/wordplay gains |
| **Scheme Specialist** | Writing +30% | 5-7 writing days = high consistency + pen game |
| **Angle Master** | Research +35% | 5-7 research days = angles/rebuttals dominate |
| **Battle Technician** | Research +40%, Writing +25% | Balanced: 2-3 research + 3-4 writing |
| **Stage Domination** | Performance +30% | 6-8 performance days = stage control dominates |
| **Theatrical** | Performance +25% | Main Stage Arena specifically |
| **Pen Game Elite** | Writing +30% | Pure writing grind (5-7 days) |

### Medium Efficiency Badges (1.15-1.25x)

Standard badges that provide meaningful boosts without breaking prep.

| Badge | Efficiency Boost | Best Use |
|-------|------------------|----------|
| **Multisyllabic Master** | Writing +25% | Complex schemes, wordplay builds |
| **Consistent Writer** | Writing +15% | Maintains consistency even with modest prep |
| **Metaphor Master** | Writing +20% | Creative writing builds |
| **Wordplay Wizard** | Writing +25% | Wordplay-focused (already 1.4x multiplier) |
| **Freestyle Genius** | Research +20% | Research-focused scenario prep (not writing) |
| **Creativity Beast** | Research +30% | Research fuels creative angles |
| **Smooth Flow** | Performance +20% | Delivery/flow training |
| **Charismatic** | Performance +15% | Crowd work training |
| **Rebuttal King/Queen** | Performance +15% | Fast rebuttal training |

### Low Efficiency Badges (0.6-0.8x)

These badges have trouble with prep. Your prep is less effective—compensate with higher volume or different focus.

| Badge | Efficiency Hit | Workaround |
|-------|-----------------|-----------|
| **Lazy Writer** | Writing -40% (0.6x) | 10+ writing days needed for standard gains |
| **Underprepared** | Writing/Performance -30% (0.7x) | Compensate with research or rest |
| **Monotone Deliverer** | Performance -20% (0.8x) | Focus on writing; performance prep less valuable |
| **Overprepared** | Performance -15% (0.85x) | Avoid performance prep; focus on writing/research |

### Badge Synergies (Bonus Prep Efficiency)

Certain badges work together. For every synergy pair you have, prep efficiency increases by **5%**.

**Strong Synergy Pairs**:
- **Technical Writer + Scheme Specialist**: +5% writing efficiency
- **Technical Writer + Consistent Writer**: +5% writing efficiency
- **Angle Master + Personal Attacks**: +5% research efficiency
- **Battle Technician + Scheme Specialist**: +5% all prep efficiency
- **Freestyle Genius + Rebuttal King/Queen**: +5% research efficiency
- **Stage Domination + Theatrical**: +5% performance efficiency

### Badge Conflicts (Prep Efficiency Penalty)

Certain badges fight each other. For every conflict pair you have, prep efficiency decreases by **8%** and choke chance increases by **1%**.

**Major Conflicts**:
- **Freestyle Genius vs. Technical Writer**: -8% prep efficiency
- **Freestyle Genius vs. Scheme Specialist**: -8% prep efficiency
- **Aggressive vs. Smooth Flow**: -8% prep efficiency
- **Speed Rapping vs. Smooth Flow**: -8% prep efficiency

### Pattern Bonuses: High Prep vs. Low Prep

Certain badges reward specific prep patterns, giving **+12% or +15% to all stats** as a multiplier.

#### High Prep Bonus (+12%)
**Triggers**: 8+ total prep days AND badge has `highPrepBonus: true`

**Badges that trigger this**:
- Technical Writer
- Scheme Specialist
- Consistent Writer
- Pen Game Elite

**Example**: Technical Writer with 8 writing days
- Gains: 8 × 0.10 × 1.35 = +1.08 per writing stat
- Final multiplier: ×1.12 on all stats
- Result: Near-maximum attribute improvements

#### Low Prep Bonus (+15%)
**Triggers**: ≤3 total prep days AND badge has `lowPrepBonus: true`

**Badges that trigger this**:
- Freestyle Genius
- Rebuttal King/Queen

**Example**: Freestyle Genius with 3 research days
- Gains: 3 × 0.10 × 1.2 = +0.36 creativity
- Final multiplier: ×1.15 on all stats
- Result: Minimal prep, high returns—freestyler archetype

#### Balanced Prep Bonus (+10%)
**Triggers**: 3+ different prep categories with 2+ days each AND badge has `balancedPrepBonus: true`

**Badges that trigger this**:
- Battle Technician

**Example**: Battle Technician with 2 research, 3 writing, 2 performance, 2 rest
- Gains: Mixed across categories
- Final multiplier: ×1.10 on all stats
- Result: Versatile preparation rewarded

---

## The Cost of No Prep

### No-Show Penalties

If you accept a battle but don't strategically fill your prep calendar:

**What happens**:
1. System auto-fills with minimal rest/life (non-optimal)
2. `no_show_player = true` flag is set
3. **ALL combat attributes ×0.70 multiplier** (-30% across the board)
4. Choke probability increases significantly
5. Consistency score tanks (higher variance, more inconsistency)

**Impact on stats** (generic 5.0 attribute → after no-show penalty):
- Before: 5.0
- After: 5.0 × 0.70 = 3.50
- Equivalent to losing ~1.5 full attribute points

**Choke risk**: No-show battlers have dramatically higher choke chance. A normally-stable battler (resilience 6.0) might choke like someone with resilience 3.0.

### When No-Show Happens
- You accepted battle but had life happen
- You forgot to plan prep
- You actively ignored the prep calendar
- System detects `lock_prep_at` passed with no meaningful prep choices

### Recovery
There's no way to "make up" for no-show mid-battle. The penalty applies to the simulation. However, after the battle completes, you can prepare fully for your next battle.

---

## Advanced Prep Tactics

### Prep for Specific Opponents

Before accepting a battle, scout the opponent:

**If opponent has high writing (7+)**:
- Boost YOUR writing prep to compete
- OR boost research to find angles they don't expect
- Avoid performance-heavy prep (they'll likely outsmart you with better bars)

**If opponent has high performance (7+)**:
- Boost YOUR performance to match their crowd control
- OR boost writing so your bars are undeniable (crowd appreciates great content even if delivery is weaker)
- Research can help you identify their delivery patterns and exploit them

**If opponent has low resilience (4 or below)**:
- Use your prep to prep *yourself*, not counter them
- High resilience = you stay composed when they choke
- They might crumble under pressure mid-battle

### Prep Timing

**Early prep** (Days 1-5): Set foundation
- Use research to understand opponent
- Start writing days to build bar cushion
- Test performance delivery

**Mid prep** (Days 6-10): Specialize
- Double down on your strength
- Fill weaknesses if time allows
- Add rest to prevent burnout

**Late prep** (Days 11-14): Taper
- More rest than grind
- Mental prep for battle mindset
- Review key bars/angles

### No-Prep Gambles

Some battlers gamble on **intentionally minimal prep** (not no-show):

**Freestyler gamble**: 3 research days + 7 rest days
- Low prep bonus: ×1.15 all stats
- Bet: Adaptability + resilience beat preparation
- Risk: Opponent out-prepared you, your creativity is limited

**Risk-reward**: Only works if you have Freestyle Genius or Rebuttal King/Queen. Otherwise, you're just weak.

---

## Prep and League Differences

### Small Room Circuit (2-minute rounds, 4 segments)

**Ideal prep focus**:
- **Research** (angles matter more in shorter format)
- **Writing** (tight, clever schemes deliver better)
- **Avoid excessive performance prep** (less stage time to work crowd)

**Why**:
- Shorter rounds = fewer chances to shine
- Angles/rebuttals are critical for small-room victory
- Wordplay/lyricism matter more than crowd control

**Example prep for Small Room**:
```
Research: 4 days (angles/scenarios matter)
Writing:  4 days (tight schemes)
Rest:     2 days
```

### Main Stage Arena (3-minute rounds, 6 segments)

**Ideal prep focus**:
- **Performance** (more time = bigger stage presence payoff)
- **Writing** (you have time for complex bars)
- **Research** (opponent prep for long battle)

**Why**:
- Longer rounds = more time for crowd work
- Stage presence multiplier by badge = rewards performance investment
- Momentum matters more (performance consistency across 6 segments)

**Example prep for Main Stage**:
```
Performance: 5 days (build stage control)
Writing:     3 days (maintain pen game)
Rest:        2 days
```

---

## Summary: Prep Decision Matrix

Use this table to decide your prep strategy:

| Badge | Strength | Ideal Prep | Days | Bonus |
|-------|----------|-----------|------|-------|
| **Technical Writer** | Lyricism/Wordplay | 8 writing, 1 research, 1 rest | 10 | High Prep +12% |
| **Angle Master** | Creativity/Angles | 6 research, 2 writing, 2 rest | 10 | Research boost +35% |
| **Freestyle Genius** | Adaptability | 3 research, 7 rest | 10 | Low Prep +15% |
| **Stage Domination** | Performance | 7 performance, 2 writing, 1 rest | 10 | Performance boost +30% |
| **Battle Technician** | Balance | 2 research, 3 writing, 2 performance, 2 rest | 9 | Balanced +10% |
| **Generic** | None | Split 40% writing, 30% research, 20% performance, 10% rest | 10 | None |

---

## Prep Checklist

Before locking your prep plan:

- [ ] **Opponent scouted**: Know their badges and high stats
- [ ] **Strategy chosen**: Focused on your strength or countering theirs?
- [ ] **Daily plan filled**: 7-14 days with strategic focus (not auto-fill)
- [ ] **Synergies checked**: Do your badge choices reward your prep pattern?
- [ ] **Conflicts minimized**: Avoid badge conflicts if possible
- [ ] **Pattern bonus eligible**: High prep (8+), Low prep (≤3), or Balanced (3+ categories)?
- [ ] **Resilience buffered**: At least 1-2 rest days to avoid choke risk?
- [ ] **Lock confirmed**: Once `lock_prep_at` passes, NO CHANGES ALLOWED

---

## The Prep Phase in Your Game Strategy

**Prep is not mandatory busy-work**. It's the primary way you improve your attributes before battle. Unlike permanent attribute points (which are static), prep is dynamic, repeatable, and badge-dependent.

Think of it like this:
- **Base attributes** (set at character creation): Your natural talent
- **Prep improvements**: Your current form, effort, and training
- **Badge efficiency**: Your style's prep effectiveness

A battler with 5.0 lyricism who preps intensively with the right badges can hit 7.0+ temporarily. A battler with 8.0 lyricism who doesn't prep might drop to 5.6 (base only, no prep gains). Prep is the difference between showing up ready and showing up half-asleep.

**Strategic depth**: Different archetypes have different prep profiles. A Technical Writer grinds writing; a Freestyler grinds research and rest. This creates diverse gameplay where prep decisions matter as much as base attributes.

The 7-14 day prep window is your moment to transform potential into performance. Use it wisely.
