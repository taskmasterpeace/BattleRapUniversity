# Badge-Life Event Integration System

## Overview

The Badge-Life Event Integration System is the **core progression mechanic** in Battle Rap University. Badges are not cosmetic - they fundamentally define your career path, determine which events trigger, modify choice outcomes, and shape how events affect your battler.

This system makes every battle and every choice meaningful, creating emergent narratives where your play style directly impacts your story.

---

## Core Concept

**Badges Define Everything**

- **Which events can trigger** - Freestylers get cypher challenges, performers get stage opportunities
- **Choice outcome probabilities** - Performance battlers excel at risky public choices, technical writers at composed responses
- **Event effect magnitudes** - Writer's block devastates technical writers but barely affects freestylers
- **Badge progression** - Certain events unlock new badges, repeated patterns earn reputation badges

---

## System Architecture

### 1. Badge System (`lib/game/badgeSystem.ts`)

**Badge Categories:**
- `writing` - Lyricism, wordplay, schemes
- `performance` - Stage presence, crowd control, delivery
- `content` - Comedy, storytelling, angles
- `delivery` - Aggression, flow, tone
- `reputation` - Professional standing, fan perception

**Badge Levels:**
- `bronze` - Entry-level or negative badges
- `silver` - Skilled practitioners
- `gold` - Elite performers
- `platinum` - Legendary mastery

**Battler Archetypes:**

Based on badge combinations, battlers are classified into archetypes:

- **Technical Writer** - Scheme Specialist, Multisyllabic Master, Pen Game Elite
- **Performance Beast** - Stage Domination, Crowd Control Master, High Energy
- **Freestyler** - Freestyle Genius, Rebuttal King, Quick Thinker
- **Comedy Battler** - Comedy Specialist, Joke Master, Well-Timed Humor
- **Aggressive Battler** - Aggressive Delivery, Menacing Presence
- **Storyteller** - Storytelling Master, Narrative-Driven
- **Wordplay Specialist** - Wordplay Wizard, Double Entendre Expert
- **Crowd Favorite** - Strong fanbase, charismatic
- **Controversial** - Drama Starter, Shock Value
- **Balanced** - No dominant specialization

### 2. Choice Outcome Calculator (`lib/game/choiceOutcomeCalculator.ts`)

**Choice Types:**
- `composed` - Calculated, safe responses (60% base win rate)
- `risky` - High risk/reward plays (45% base win rate)
- `technical` - Requires skill/knowledge (55% base win rate)
- `improvised` - On-the-spot decisions (50% base win rate)
- `aggressive` - Confrontational approaches (45% base win rate)
- `humble` - Gracious, professional (65% base win rate)

**Probability Modifiers:**

Win probability is calculated from:

1. **Base Probability** - Determined by choice type
2. **Badge Modifiers** - +/- 30% based on relevant badges
3. **Archetype Modifiers** - +/- 25% based on battler archetype
4. **Attribute Modifiers** - +/- 15% based on relevant stats
5. **Streak Modifiers** - +/- 15% based on win/loss streak
6. **Normalization** - Probabilities adjusted to sum to 100%

**Example:**

```typescript
// Performance battler with stage badges
badges: ['STAGE_DOMINATION', 'CROWD_CONTROL_MASTER']
choiceType: 'risky'

Base: 45% win
+ Badge bonus: +20%
+ Archetype bonus: +15%
+ High stage presence: +8%
+ Hot streak: +5%
= 93% total → normalized to ~73% win, 17% neutral, 10% loss
```

### 3. Badge Progression System (`lib/game/badgeProgression.ts`)

**Badge Unlock Methods:**

**A) Battle Performance Unlocks**
- **Dominant Performer** - 3 consecutive 3-0 wins
- **Choker** - 2 consecutive chokes
- **Comeback King** - Win after 3+ loss streak
- **Peak Performer** - High peaks, low average (flashy but inconsistent)
- **Consistent Writer** - High consistency across rounds
- **Resilient Battler** - Never choked in 10+ battles

**B) Life Event Pattern Unlocks**
- **Drama Starter** - 3+ controversial/aggressive choices
- **Consummate Professional** - 5+ professional/humble choices
- **Humble Winner** - Declined spotlight after multiple wins

**C) Attribute Threshold Unlocks**
- **Pen Game Elite** - All writing stats 9+
- **Stage Domination** - All performance stats 9+
- **Respected Veteran** - Reputation 8+ with 20+ battles
- **Wordplay Wizard** - Wordplay 9+ with 10+ battles

**Badge Removal (Redemption):**

Negative badges can be removed through sustained good behavior:
- **Choker** removed after 5 no-choke battles
- **Drama Starter** removed after 5 drama-free events
- **Inconsistent Performer** removed after 5 consistent performances

---

## Badge-Specific Life Events

### Event Triggering Rules

Events can require specific badges to trigger:

```sql
-- Example: Freestyle Cypher Challenge
trigger_condition: {
  "outcome": "win",
  "requires_badge": "FREESTYLE_GENIUS"
}
```

**20+ Badge-Specific Events Created:**

#### Freestyler Events
- **24-Hour Freestyle Cypher** - Ultimate test of improvisation
- **Rebuttal Masterclass** - Teach workshop on quick thinking

#### Wordplay Specialist Events
- **Scheme Workshop Invite** - Collaborate with other technicians
- **Writer's Block Crisis** - Devastating for technical writers

#### Performance Battler Events
- **Stage Show Opportunity** - Open for major concert
- **Crowd Control Workshop** - Teach actors about commanding audiences
- **Venue Nightmare** - Broken sound system (thrive on raw performance)

#### Comedy Battler Events
- **Comedy Podcast Appearance** - Leverage humor outside battles
- **Joke Too Far** - Controversial joke backlash

#### Aggressive Battler Events
- **Backstage Confrontation** - Heated pre-battle argument
- **Intimidation Accusation** - Called out for bullying

#### Storyteller Events
- **Narrative Series Offer** - 3-battle story arc
- **Film Script Opportunity** - Write battle rap movie

#### Controversial/Drama Events
- **Twitter Beef Escalation** - Social media war gone viral
- **Leak Your Opponent** - Private info leaked to you

#### Crowd Favorite Events
- **Fan Meet and Greet** - Organize event for followers
- **Merchandise Deal** - Launch official merch

#### Veteran/Respected Events
- **Mentor Young Talent** - Take rookie under your wing
- **Hall of Fame Nomination** - Legendary status recognition

#### Negative Badge Events
- **Therapist Recommendation** - Performance anxiety treatment (for Chokers)
- **Ghostwriter Temptation** - Offered to write for you (for Lazy Writers)
- **Reputation Redemption** - Clear your name (for Drama Starters)

---

## Choice Outcome Examples

### Example 1: Performance Battler vs Risky Stage Opportunity

**Event:** "Open for Major Concert"
**Battler:** Stage Domination, Crowd Control Master, Charismatic
**Choice Type:** Risky

**Calculation:**
```
Base risky win rate: 45%
+ Stage badges: +20%
+ Performance archetype: +15%
+ High stage presence (9): +6%
+ Hot streak (3 wins): +5%
= 91% → Normalized: 72% win / 18% neutral / 10% loss
```

**Outcome:** HIGH success chance - performance battlers THRIVE here

### Example 2: Technical Writer vs Writer's Block

**Event:** "Creative Drought"
**Battler:** Pen Game Elite, Scheme Specialist
**Choice Type:** Composed

**Effect Multiplier:**
```
Base effects: creativity -0.3, wordplay -0.2
× Technical writer multiplier: 2.0
= Devastating: creativity -0.6, wordplay -0.4
```

**Outcome:** Even composed choices hurt badly - writer's block is BRUTAL for technical writers

### Example 3: Freestyler vs Improvised Challenge

**Event:** "24-Hour Freestyle Cypher"
**Battler:** Freestyle Genius, Rebuttal King, Creativity Beast
**Choice Type:** Improvised

**Calculation:**
```
Base improvised win rate: 50%
+ Freestyle badges: +25%
+ Freestyler archetype: +25%
+ High creativity (9): +5%
= 105% → Normalized: 78% win / 15% neutral / 7% loss
```

**Outcome:** EXCELLENT chance - this is what freestylers do

### Example 4: Choker vs Humble Decision

**Event:** "Hire Performance Coach"
**Battler:** Choker, Inconsistent Performer
**Choice Type:** Humble
**Current State:** Loss streak (-2), low resilience (3)

**Calculation:**
```
Base humble win rate: 65%
+ Choker penalty: -15%
+ Cold streak penalty: -8%
+ Low resilience: -5%
= 37% → Normalized: 40% win / 30% neutral / 30% loss
```

**Outcome:** Risky even with humble choice, but it's the right path to redemption

---

## Badge Effect Multiplier Examples

### Performance Battlers
- Voice/delivery issues: **1.5x** damage to stage_presence, delivery
- Venue changes: **0.7x** damage to resilience (less affected)

### Technical Writers
- Writer's block: **2.0x** damage to lyricism, wordplay, creativity
- Writing workshops: **1.3x** bonus to lyricism gains

### Freestylers
- Writer's block: **0.3x** damage (barely affected)
- Improvised challenges: **1.4x** bonus to creativity gains

### Drama Starters
- Controversy events: **1.5x** amplified reputation/public_knowledge effects

### Professionals
- Drama events: **0.6x** reduced reputation damage

---

## Implementation Flow

### During Battle Simulation

```typescript
// After battle completes
1. Calculate battle performance (peaks, averages, chokes)
2. Update rankings
3. Check for badge unlocks from battle performance
4. Trigger appropriate life events based on:
   - Battle result
   - Battler badges
   - Current attributes
5. Generate news article
6. Apply attribute progression
```

### During Life Event Resolution

```typescript
// When player makes choice
1. Load battler's current badges
2. Determine archetype
3. Calculate choice outcome probability
4. Resolve choice (win/neutral/loss)
5. Apply effect multipliers based on badges
6. Calculate final attribute changes
7. Check for new badge unlocks from choice pattern
8. Update battler attributes
9. Record event resolution for pattern tracking
```

---

## Database Schema

### Badge Definitions Table
```sql
badge_definitions (
  code TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  category TEXT,
  level TEXT,
  is_positive BOOLEAN
)
```

### Battler Badges Table
```sql
battler_badges (
  battler_id UUID,
  badge_code TEXT,
  earned_at TIMESTAMPTZ,
  battle_id UUID (optional),
  reason TEXT,
  removed_at TIMESTAMPTZ (for redemption)
)
```

### Life Event Templates
```sql
life_event_templates (
  code TEXT,
  title TEXT,
  description TEXT,
  trigger_condition JSONB, -- includes badge requirements
  required_badges JSONB,
  choice_a_effects JSONB,
  choice_b_effects JSONB
)
```

---

## Testing the System

### Test Scenarios Covered

1. **Archetype Detection**
   - Technical writer identified from scheme/pen badges
   - Performance beast from stage/crowd badges
   - Freestyler from freestyle/rebuttal badges

2. **Choice Calculations**
   - Performance battler advantage on risky choices (verified)
   - Technical writer advantage on composed choices (verified)
   - Freestyler advantage on improvised choices (verified)
   - Negative badges penalize appropriately (verified)

3. **Effect Multipliers**
   - Performance battlers hurt more by voice issues (1.5x+)
   - Technical writers devastated by writer's block (1.8x+)
   - Freestylers barely affected by writer's block (0.3x)

4. **Badge Unlocks**
   - Dominant Performer after 3x 3-0 wins (verified)
   - Choker after 2 consecutive chokes (verified)
   - Comeback King after win following 3+ loss streak (verified)
   - Drama Starter from 3+ controversial choices (verified)
   - Pen Game Elite from 9+ all writing stats (verified)

5. **Badge Redemption**
   - Choker removed after 5 no-choke battles (verified)

6. **Complete Integrations**
   - Performance battler in stage show: 73% win rate
   - Technical writer in writer's block: 2.0x damage multiplier
   - Freestyler in cypher: 78% win rate
   - Choker seeking therapy: redemption path despite 40% success

---

## Future Enhancements

### Phase 1 Additions
- **Badge synergies** - Certain badge combinations unlock special events
- **Badge conflicts** - Some badges are mutually exclusive
- **Badge tiers** - Bronze → Silver → Gold → Platinum progression

### Phase 2 Additions
- **League-specific badges** - Different badges for Small Room vs Main Stage
- **Rivalry badges** - Earned from repeated battles vs specific opponents
- **Era badges** - "Pioneer", "Legend", "GOAT" for long careers
- **Style evolution** - Transition from one archetype to another

### Phase 3 Additions
- **Badge abilities** - Active effects during battles (e.g., Freestyle Genius gets bonus rebuttal chance)
- **Badge prestige** - Retire and start new battler with legacy bonus
- **Badge trading** - Learn from mentors to acquire their expertise

---

## API Integration

### Get Battler Badges
```typescript
GET /api/battler/badges/:battlerId

Response: {
  badges: [
    { code: 'STAGE_DOMINATION', earned_at: '2024-01-15', category: 'performance' },
    { code: 'CROWD_FAVORITE', earned_at: '2024-02-01', category: 'reputation' }
  ],
  archetype: 'performance_beast',
  progress: [
    { badge: 'RESPECTED_VETERAN', progress: 0.65, next: '13/20 battles' }
  ]
}
```

### Calculate Choice Outcome (Preview)
```typescript
POST /api/life-events/:eventId/preview

Request: {
  choice: 'a'
}

Response: {
  win_probability: 0.73,
  neutral_probability: 0.17,
  loss_probability: 0.10,
  expected_effects: { reputation: 0.45, public_knowledge: 18.75 },
  modifiers: [
    { source: 'badges', value: 0.20, description: 'Stage performance badges' },
    { source: 'performance_beast', value: 0.15, description: 'Archetype bonus' }
  ]
}
```

### Resolve Life Event with Outcome
```typescript
POST /api/life-events/:eventId/resolve

Request: {
  choice: 'a'
}

Response: {
  outcome: 'win', // or 'neutral' or 'loss'
  effects_applied: { reputation: 0.6, public_knowledge: 25, financial_stability: 1.0 },
  badges_earned: ['CROWD_FAVORITE'],
  badges_removed: [],
  outcome_description: 'Success! The choice paid off.'
}
```

---

## Key Design Principles

### 1. Badges Are Career-Defining
Not cosmetic achievements - they fundamentally change your experience

### 2. Multiple Viable Paths
Every archetype can succeed, just in different ways

### 3. Risk/Reward Balance
High-risk choices can pay off huge for the right battler type

### 4. Redemption Is Possible
Negative badges can be removed through sustained good behavior

### 5. Emergent Narratives
Badge + event interactions create unique stories for each player

### 6. Meaningful Choices
Every decision matters because badges affect future events

---

## Summary

The Badge-Life Event Integration System transforms Battle Rap University from a simple attribute management game into a **dynamic career simulation** where:

✅ **Your play style determines your path** - Technical writers and freestylers have completely different experiences

✅ **Badges unlock unique content** - Events you'll never see without the right badges

✅ **Choices have weight** - Success isn't random - it's based on who you've become

✅ **Failure has consequences** - Negative badges hurt, but can be redeemed

✅ **Every career is unique** - No two battlers will have the same journey

**Badges don't just track what you've done - they define who you are and what happens next.**

---

## Files Reference

**Core Logic:**
- `lib/game/badgeSystem.ts` - Badge definitions, archetypes, modifiers
- `lib/game/choiceOutcomeCalculator.ts` - Probability calculations
- `lib/game/badgeProgression.ts` - Unlock and removal logic

**Database:**
- `supabase/migrations/007_badge_specific_life_events.sql` - Badge-gated events
- `supabase/migrations/008_badge_system.sql` - Badge tracking tables

**Tests:**
- `__tests__/badgeIntegration.test.ts` - Complete integration tests

**Documentation:**
- `BADGE_INTEGRATION_SYSTEM.md` - This file
