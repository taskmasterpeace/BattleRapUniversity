# Round Crafting & Preparation System V2

**Purpose**: Complete redesign of the battle preparation and round crafting system to match real battle rap preparation
**Status**: SPEC DOCUMENT FOR V0
**Last Updated**: December 2025

---

## Table of Contents

1. [Real Battle Rap Research](#real-battle-rap-research)
2. [System Overview](#system-overview)
3. [Complete Game Flow](#complete-game-flow)
4. [Prep Phase Details](#prep-phase-details)
5. [Round Crafting Details](#round-crafting-details)
6. [Badge Interactions](#badge-interactions)
7. [Prep Time Scaling](#prep-time-scaling)
8. [Mid-Battle Adjustments](#mid-battle-adjustments)
9. [UI Requirements](#ui-requirements)

---

## Real Battle Rap Research

### How Long Do Battlers Actually Prepare?

**Major Events (Summer Madness, NOME, etc.)**
- **Tsu Surf** said he had "three months preparation time" for Summer Madness 4 vs Hitman Holla
- Surf noted: "This is too much time. I've never had this much time for a battle in God knows how long."
- Elite battlers like **Hollow Da Don** use "months of preparation mixed with improvised lines"

**Standard Events**
- Typical URL/KOTD battles: 4-8 weeks notice
- Small room battles: 2-4 weeks notice
- Last-minute replacements: Days to 1 week

**The Preparation Process (from research)**
1. **Research** - Watch opponent's past battles, learn strengths/weaknesses, dig into personal life
2. **Writing** - Craft bars, schemes, angles, punchlines tailored to opponent
3. **Rehearsal** - Practice delivery, memorize material, work on timing
4. **Rest** - Mental preparation, avoid burnout

**Key Insight**: "In written battles, rappers have time to prepare, crafting intricate verses packed with layered wordplay, different rhyme schemes, and tailor-made disses."

**Sources**:
- [Battle Rap Wikipedia](https://en.wikipedia.org/wiki/Battle_rap)
- [Music Industry How To - Battle Rap Guide](https://www.musicindustryhowto.com/how-to-battle-rap-for-beginners-ultimate-guide-to-getting-good-winning/)
- [HipHopDX - Battle Rap Viewer's Guide](https://hiphopdx.com/editorials/id.2142/title.your-introduction-to-battle-rap-a-new-viewers-guide)
- [Loaded Lux Interview - HipHopDX](https://hiphopdx.com/interviews/id.2107/title.loaded-lux-draws-parallels-between-battle-rap-fatherhood-cinema)

---

## System Overview

### Core Concepts

**Content is SEGMENT-BASED, not round-based**
- Each segment = 30 seconds of material
- 2-minute rounds = 4 segments
- 3-minute rounds = 6 segments
- You craft individual segments, then organize them into rounds

**Dependencies Matter**
- Can't REHEARSE content until it's WRITTEN
- Can't write PERSONALS without RESEARCH (or you make stuff up = credibility hit)
- Can FREESTYLE segments without writing (if you have the badge/skills)

**Round Organization is Strategic**
- Where you put your best stuff matters
- Battles are judged ROUND-BY-ROUND
- Winning Round 1 with a 9.5 but losing Round 2 with a 6.0 means you lost that round
- Players organize segments into Round 1, Round 2, Round 3

### Two Approaches to Content

**1. Written Content**
- Research opponent → Write bars → Rehearse → Perform
- Higher floor (consistent quality)
- Requires more prep time
- Stronger personals if researched

**2. Freestyle Content**
- Mark segment as "freestyle" instead of writing it
- Lower prep time needed
- Higher variance (could be amazing or terrible)
- Requires Freestyle badges to do well
- Good for rebuttals and reactions

---

## Complete Game Flow

```
PHASE 1: ACCEPT BATTLE
├── See opponent info
├── See venue/league
├── See prep days available
└── Accept or decline

PHASE 2: PREPARATION (Daily Focus Selection)
├── Day 1: Choose focus (Research/Write/Rehearse/Life/Rest)
├── Day 2: Choose focus...
├── ...
├── Day N: Choose focus...
└── Prep locks at lock_prep_at

PHASE 3: CONTENT CRAFTING (During or after prep)
├── Create segments (content type + delivery + performance)
├── Assign segments to rounds
├── Choose which segments to freestyle vs write
└── Organize round order for maximum impact

PHASE 4: MODE SELECTION
├── "Locked In" - Strategic round-by-round play
└── "Auto" - Quick simulation

PHASE 5: BATTLE (if Locked In)
├── Round 1: See matchup → Watch simulation → See results
├── (Optional) Shift rounds based on opponent performance
├── Round 2: Same
├── (Optional) Call audibles (freestyle/rebuttal)
├── Round 3: Same
└── Final results

PHASE 6: RESULTS
├── Winner declared
├── Rating changes
├── Attribute progression
├── Life events triggered
└── Media coverage
```

---

## Prep Phase Details

### Daily Focus Options

| Focus | Display Name | Icon | What It Does |
|-------|--------------|------|--------------|
| `research` | RESEARCH | 🔬 | Study opponent, find angles, dig up info |
| `writing` | WRITING | 📝 | Write bars, schemes, punchlines |
| `performance` | REHEARSE | 🎤 | Practice delivery, memorize material |
| `life` | LIFE | 🏠 | Handle personal stuff, reduce stress |
| `rest` | REST | 😴 | Recover, mental prep, avoid burnout |

### Focus Dependencies

```
RESEARCH enables better WRITING
  └── Without research: Generic angles only, credibility risk
  └── With casual research: Basic opponent info
  └── With aggressive research: Deep personals, family, secrets

WRITING enables REHEARSAL
  └── Can't rehearse a round until that round's content is written
  └── OR: Mark segments as "freestyle" (no writing needed, no rehearsal needed)

REHEARSAL improves PERFORMANCE
  └── Memorization, delivery, timing
  └── Reduces choke chance
  └── Can rehearse specific rounds
```

### Research Levels

| Level | Days Required | What You Get |
|-------|---------------|--------------|
| **None** | 0 | Generic angles only. Making up personals hurts credibility. |
| **Casual** | 1-2 | Basic info: city, crew, loss record, public beefs |
| **Aggressive** | 3+ | Deep info: family, secrets, embarrassing moments, weak performances |

**Credibility Risk**: If you write personals without research and they're wrong/made up, opponent can call you out and crowd turns on you.

### Writing Segments

Each segment you write has:
- **Content Type** (1): What you're saying (Personals, Wordplay, Gun Bars, etc.)
- **Delivery Type** (1): How you're saying it (Aggressive, Smooth, etc.)
- **Performance Type** (1): How you're moving (Theatrical, Charismatic, etc.)

**Segment Requirements per Round**:
- Minimum: 3 segments written OR marked as freestyle
- Maximum: Round length (4 for 2-min, 6 for 3-min)
- Can OVERWRITE: Create extra segments as backup/counters

### Counters & Rebuttals

Players can write **counter segments** - material prepared for something they anticipate opponent will say.

**Counter Rules**:
- Mark a segment as a "counter" for anticipated content
- If opponent says what you anticipated → Counter lands HARD (1.5x effectiveness)
- If opponent DOESN'T say it → Using the counter looks foolish (0.5x effectiveness, credibility hit)
- Rebuttals are different - they're on-the-spot reactions (require Freestyle/Rebuttal badges)

---

## Round Crafting Details

### Segment Organization

Players organize their written segments into rounds:

```
ROUND 1 (4 segments for 2-min round):
├── Segment 1: Wordplay + Aggressive + Theatrical
├── Segment 2: Personals + Aggressive + Stage Presence
├── Segment 3: Schemes + Smooth + Charismatic
└── Segment 4: Punchlines + Aggressive + Theatrical [PEAK PLACEMENT]

ROUND 2:
├── Segment 1: Gun Bars + Aggressive + Stage Presence
├── ... etc

ROUND 3:
├── ... etc
```

### Round Organization Strategy

**Where to put your best stuff?**

| Strategy | Description | Risk/Reward |
|----------|-------------|-------------|
| **Front Load** | Best stuff in Round 1 | Win early, set tone. Risk: fade in later rounds |
| **Save the Best** | Best stuff in Round 3 | Strong finish, lasting impression. Risk: lose early rounds |
| **Balanced** | Spread evenly | Consistent. Risk: no standout moment |
| **Adaptive** | Adjust during battle | React to opponent. Requires Freestyle/Rebuttal badges |

### Content Type Reference (14 types)

| Type | Category | Best Against | Weak Against |
|------|----------|--------------|--------------|
| Personals | Attack | Comedy, Gun Bars | Rebuttals |
| Wordplay | Technical | Gun Bars | Comedy |
| Schemes | Technical | Shock Value | Freestyles |
| Punchlines | Attack | - | - |
| Comedy | Entertainment | Wordplay, Schemes | Personals |
| Storytelling | Technical | - | - |
| Gun Bars | Attack | - | Street Talk, Personals |
| Street Talk | Attack | Gun Bars | Wordplay |
| Freestyles | Adaptive | Rebuttals | Schemes |
| Rebuttals | Adaptive | Personals | Freestyles |
| Pop Culture Refs | Entertainment | - | Wordplay |
| Name Flips | Entertainment | - | - |
| Shock Value | Attack | - | Schemes |
| Social Commentary | Technical | - | - |

---

## Badge Interactions

### Badges That Affect Prep

| Badge | Effect on Prep |
|-------|----------------|
| **Freestyle Genius** | Can freestyle segments without writing. +20% research prep efficiency. Low prep bonus. -25% choke chance. |
| **Technical Writer** | +35% writing prep efficiency. Requires high prep for bonus. |
| **Pen Game Elite** | +30% writing prep efficiency. +25% lyricism/creativity/wordplay. |
| **Angle Master** | +35% research prep efficiency. Great at finding angles. |
| **Battle Technician** | +40% research, +25% writing. Balanced prep bonus. |
| **Rebuttal King/Queen** | Low prep bonus. Good at thinking on feet. +15% when going second. |
| **Multitasker** | +10% all prep types. -2% choke. Good at juggling. |
| **Time Management Expert** | +20% research, +15% writing/performance, +10% rest. No stress from multiple battles. |
| **Consummate Professional** | +15% ALL prep types. -4% choke. Very reliable. |
| **Consistent Grinder** | +10% all prep types. +15% consistency. |

### Badges That Affect Mid-Battle

| Badge | Mid-Battle Effect |
|-------|-------------------|
| **Freestyle Genius** | Can call audible to freestyle a segment. +20% peak bonus. |
| **Rebuttal King/Queen** | Can attempt on-the-spot rebuttal. -2% choke. |
| **Clutch Performer** | -4% choke in crucial moments. +15% peak bonus. |
| **Big Stage Performer** | +12% in Main Stage Arena. -2% choke. |

### Suggested New Badges for Prep

| Badge Name | Effect |
|------------|--------|
| **Photographic Memory** | -25% research time needed. Memorization bonus. |
| **Quick Writer** | +40% writing speed. Can write 2 segments per writing day. |
| **Double Shift** | Can do TWO prep activities in one day. |
| **Team Player** | +20% writing speed when on a team. |
| **Last Minute Larry** | Low prep bonus. +30% effectiveness with <3 prep days. |
| **Preparation Monster** | +50% effectiveness with 10+ prep days. High prep bonus. |

---

## Prep Time Scaling

### Base Formula

**Prep days needed = (Segments per round × 3 rounds) × Base multiplier**

| Round Length | Segments/Round | Total Segments | Base Prep Days |
|--------------|----------------|----------------|----------------|
| 90 seconds | 3 | 9 | 7-10 days |
| 2 minutes | 4 | 12 | 10-14 days |
| 3 minutes | 6 | 18 | 14-21 days |

### Real-World Reference

Based on research:
- Major events (Summer Madness): 1-3 months prep
- Standard URL battles: 4-8 weeks
- Small room: 2-4 weeks

### Game Scaling (Compressed)

For gameplay purposes, compress real time:
- **1 real week = 1 game day** (rough approximation)
- 3-minute rounds (Summer Madness tier) = ~21 game prep days
- 2-minute rounds (standard) = ~14 game prep days
- 90-second rounds (small room) = ~7-10 game prep days

### Badge Modifiers

Badges can reduce prep time needed:
- **Freestyle Genius**: -30% writing days needed (freestyle fills gaps)
- **Quick Writer**: -25% writing days needed
- **Photographic Memory**: -25% research days needed
- **Time Management Expert**: -15% all prep days

---

## Mid-Battle Adjustments

### Round Shifting

After seeing opponent's round, player can shift their remaining rounds:

**Requirements**: Must have at least 1 more round to go

**How it works**:
1. Opponent does Round 1 (weak performance)
2. Player sees result: "Opponent had a weak Round 1"
3. Player can choose: "Move your weakest round to Round 2?"
4. This lets player save their best stuff for later

**Limitations**:
- Can only shift UNPLAYED rounds
- Cannot change content of a round, only its position
- May cause slight confusion penalty (-5% consistency) if shifting

### Calling Audibles

**Requirements**: Freestyle Genius or Rebuttal King/Queen badge

**Options during battle**:
1. **Freestyle a segment**: Replace a written segment with freestyle
   - Higher variance
   - Can react to something opponent just said
   - Requires Freestyle badge

2. **Attempt rebuttal**: React to opponent's specific bar
   - High risk/reward
   - If it lands: Huge crowd reaction
   - If it misses: Awkward pause, momentum loss
   - Requires Rebuttal badge

---

## UI Requirements

### Prep Page Updates

**Current**: Daily focus dropdown (Research/Writing/Performance/Life/Rest)

**New additions**:
1. Rename "PERFORMANCE" to "REHEARSE"
2. Show goal tracker: "X segments written / Y needed"
3. Show research level: "Research: Casual" or "Research: Aggressive"
4. Show which rounds are ready to rehearse
5. Add "READY TO BATTLE" button → goes to Mode Selection

### Content Crafting Screen (NEW)

**Location**: Accessible during prep phase or after prep locks

**Features**:
1. **Segment Creator**: Select content/delivery/performance type
2. **Segment List**: All segments you've written
3. **Round Organizer**: Drag segments into Round 1/2/3
4. **Freestyle Toggle**: Mark segment as "will freestyle this"
5. **Counter Toggle**: Mark segment as counter for anticipated content
6. **Effectiveness Preview**: Show matchup forecast per round

```
┌─────────────────────────────────────────────────────────────┐
│ ROUND ORGANIZATION                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ROUND 1           ROUND 2           ROUND 3               │
│  ┌─────────┐       ┌─────────┐       ┌─────────┐           │
│  │ Wordplay│       │ Gun Bars│       │ Personals│          │
│  │ Schemes │       │ Street  │       │ Punchline│          │
│  │ Punch   │       │ Freestyle│      │ Comedy   │          │
│  │ Comedy  │       │ Rebuttal│       │ Schemes  │          │
│  └─────────┘       └─────────┘       └─────────┘           │
│                                                             │
│  [+ Add Segment]                                            │
│                                                             │
│  BACKUP/COUNTERS (not assigned):                           │
│  • [Counter: If they mention X...]                         │
│  • [Extra punchline segment]                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Mode Selection Screen

**Location**: `/battle/[id]/control` or `/battle/[id]/mode`

**When shown**: After prep phase complete

**Current**: Already built (Locked In vs Auto)

**Connection needed**: Prep page "READY TO BATTLE" button should link here

### Battle Screen (Locked In Mode)

**Per round**:
1. Show your round's content lineup
2. Show effectiveness forecast
3. "Execute Round" button
4. Watch simulation
5. See results
6. (If badges allow) Option to shift next round or call audible
7. "Continue to Round X" or "View Final Results"

---

## Summary of Changes Needed

### For V0 to Implement:

1. **Prep Page** (`/battle/[id]/prep`)
   - Rename "PERFORMANCE" to "REHEARSE"
   - Add segment tracker ("X/Y segments written")
   - Add research level indicator
   - Add "READY TO BATTLE" button → `/battle/[id]/control`

2. **Content Crafting Page** (NEW: `/battle/[id]/craft`)
   - Segment creator
   - Round organizer (drag & drop)
   - Freestyle toggle
   - Counter segment support

3. **Mode Selection Page** (`/battle/[id]/control`)
   - Already built, just needs connection from prep page

4. **Round Crafting Pages** (`/battle/[id]/round/X/select`)
   - Already built
   - May need updates for freestyle/counter segments

5. **Battle Flow**
   - Add round shifting option (if badge allows)
   - Add audible option (if Freestyle/Rebuttal badge)

6. **New Badges**
   - Photographic Memory
   - Quick Writer
   - Double Shift
   - Team Player
   - Last Minute Larry
   - Preparation Monster

---

## Confirmed Decisions

1. **Content crafting location**: INSIDE the prep page (not separate)
   - Must show round count and round length
   - Display segments needed per round

2. **Round shifting penalty**: YES
   - Penalty if you shift after rehearsing
   - Need to figure out exact penalty (consistency hit? memorization penalty?)

3. **Counter limit**: 1 counter by default
   - Badges can add more counter slots

4. **Team membership**: It's a BADGE (not separate system)
   - Badge name suggestion: "Team Player" or "Crew Deep"

5. **Mid-battle adjustments**: NO "audibles"
   - User doesn't like the "calling an audible" terminology
   - Consider renaming to "pivot" or "adapt" or just remove real-time changes
   - Focus on the PREP and ORGANIZATION, not in-battle changes

---

## League Integration

### Prep Time by League Tier

Leagues should define their default prep windows:

| League Tier | Prep Window | Game Days | Real-World Equivalent |
|-------------|-------------|-----------|----------------------|
| **God Tier** (Summer Madness, NOME) | 21-28 days | 21-28 | 1-3 months |
| **Top Tier** (Standard URL/KOTD) | 14-21 days | 14-21 | 4-8 weeks |
| **Mid Tier** (Volume events) | 10-14 days | 10-14 | 2-4 weeks |
| **Small Room** | 7-10 days | 7-10 | 1-3 weeks |
| **PG/Amateur** | 5-7 days | 5-7 | 1-2 weeks |

### League Database Fields

Add to `leagues` table:
```sql
min_prep_days INTEGER DEFAULT 7,
max_prep_days INTEGER DEFAULT 14,
default_prep_days INTEGER DEFAULT 10
```

---

## Dashboard Integration

### Prep Progress Widget

Show on dashboard when player has active battle prep:

```
┌─ BATTLE PREP PROGRESS ──────────────────────────────────────┐
│                                                             │
│  VS GOTTI GEECHI • Main Stage Arena                        │
│  Battle in: 12 DAYS                                         │
│                                                             │
│  RESEARCH    ████████░░░░░░░░  50% (Casual level)          │
│  WRITING     ██████████████░░  85% (10/12 segments)        │
│  REHEARSAL   ████░░░░░░░░░░░░  25% (Round 1 only)          │
│                                                             │
│  ROUNDS READY:                                              │
│  [✓ R1] [◐ R2] [○ R3]                                      │
│                                                             │
│  [CONTINUE PREP →]                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Progress Metrics

Track and display:
- **Research level**: None / Casual / Aggressive
- **Writing progress**: X/Y segments written
- **Rehearsal progress**: Which rounds rehearsed
- **Days remaining**: Until lock_prep_at
- **Round readiness**: Visual per-round status

---

## Updated Prep Page Requirements

### Header Section
Show prominently:
- Opponent name + sprite
- League name
- **Round count**: "3 ROUNDS"
- **Round length**: "3 MINUTES EACH"
- **Segments needed**: "18 TOTAL SEGMENTS (6 per round)"
- Days until battle
- Days until prep locks

### Prep Calendar (existing)
- Daily focus selection
- Research/Write/Rehearse/Life/Rest

### Content Crafting Section (NEW - integrated)
- Segment creator
- Round organizer
- Shows: "Round 1: 4/6 segments" etc.
- Freestyle toggle per segment
- Counter slot (1 by default)

### Ready Button
- "READY TO BATTLE" → goes to mode selection
- Only enabled when minimum content crafted

---

**End of Spec**
