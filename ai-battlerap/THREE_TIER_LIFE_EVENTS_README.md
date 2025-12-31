# Three-Tier Life Event System

## Overview

The three-tier life event system adds **mechanical depth** to the battle rap game by creating meaningful consequences from player behavior, forcing strategic decisions, and responding to performance outcomes.

### Design Philosophy

**Events MATTER mechanically** - They're not just story flavor. Every event has concrete mechanical effects:
- Attribute changes (permanent or temporary)
- Modifiers to battle calculations (choke chance, writing power, etc.)
- Stress accumulation/reduction
- Reputation and public knowledge shifts

**Events create strategic tension** - Players must balance:
- Prep intensity vs burnout
- Grinding battles vs managing stress
- Short-term gains vs long-term sustainability
- Personal life vs battle career

---

## The Three Event Types

### 1. PASSIVE - "This just happened to you"

**Characteristics**:
- Triggered automatically by behavior thresholds
- No player input required
- Immediate consequences
- Examples: Burnout, stress overload, material leaks

**Trigger Sources**:
- `prep_pattern` - Consecutive days of same prep type
- `stress_threshold` - Stress levels crossing thresholds (50, 70, 90)
- `attribute` - Attribute values in certain ranges
- `random` - Random chance events

**Template Count**: 20 events

**Example Event**: `PASSIVE_WRITING_BURNOUT`
```json
{
  "code": "PASSIVE_WRITING_BURNOUT",
  "title": "Mental Fatigue",
  "description": "Five straight days grinding on writing has fried your brain...",
  "event_type": "passive",
  "trigger_type": "prep_pattern",
  "trigger_condition": {"consecutive_writing_days": 5},
  "trigger_probability": 0.7,
  "passive_effects": {
    "stress": 15,
    "writing_power_modifier": -0.15,
    "creativity": -1
  },
  "effect_duration": "next_battle"
}
```

**Mechanical Impact**:
- Stress +15 (cumulative, permanent until reduced)
- Writing power -15% (temporary, next battle only)
- Creativity -1 (permanent attribute reduction)

### 2. CHOICE - "You choose how to respond"

**Characteristics**:
- Player makes a decision (A, B, or C)
- Rock-paper-scissors outcomes based on battler type
- Creates "pending" event requiring resolution
- Different effects per choice

**Battler Types**:
- **Writer**: High writing attributes > performance
- **Performer**: High performance attributes > writing
- **Balanced**: Similar writing and performance

**Winning Choices**:
- Each template defines which choice is best for each type
- Writers might prefer calculated responses
- Performers might prefer bold/aggressive choices
- Balanced battlers split the difference

**Template Count**: 20 events

**Example Event**: `CHOICE_PODCAST_INVITE`
```json
{
  "code": "CHOICE_PODCAST_INVITE",
  "title": "Podcast Interview Offer",
  "description": "Popular battle rap podcast wants you on...",
  "event_type": "choice",
  "trigger_type": "attribute",
  "trigger_condition": {"reputation_min": 5},
  "trigger_probability": 0.3,

  "choice_a_text": "Accept - be yourself, speak freely",
  "choice_a_effects": {
    "public_knowledge": 15,
    "reputation": 2,
    "stress": 10,
    "controversy_risk": 0.3
  },

  "choice_b_text": "Accept - play it safe, give PR answers",
  "choice_b_effects": {
    "public_knowledge": 10,
    "reputation": -1,
    "resilience": 1
  },

  "choice_c_text": "Decline - stay mysterious",
  "choice_c_effects": {
    "reputation": 1,
    "public_knowledge": -5
  },

  "winning_choice_for_writers": "b",
  "winning_choice_for_performers": "a",
  "winning_choice_for_balanced": "b"
}
```

**Mechanical Impact**:
- Choice A (Performers thrive): High public knowledge gain, reputation boost, but stress increase
- Choice B (Writers/Balanced prefer): Moderate gains, safe, builds resilience
- Choice C (Nobody's best): Small gains, negative public knowledge

### 3. TRIGGERED - "You caused this by performance"

**Characteristics**:
- Automatic response to battle stats/outcomes
- Direct consequence of performance
- Creates narrative moments
- Examples: Bodybag buzz, choke redemption, upset victory

**Trigger Sources**:
- Specific battle results (3-0, 2-1, etc.)
- Performance stats (crowd reaction, peak scores)
- Win/loss streaks
- Choke events
- Rating differentials

**Template Count**: 20 events

**Example Event**: `TRIGGERED_BODYBAG_BUZZ`
```json
{
  "code": "TRIGGERED_BODYBAG_BUZZ",
  "title": "Bodybag Viral Moment",
  "description": "That 3-0 was BRUTAL. Social media is going crazy...",
  "event_type": "triggered",
  "trigger_type": "battle_result",
  "trigger_condition": {
    "result": "3-0",
    "outcome": "win",
    "avg_crowd_reaction_min": 75
  },
  "trigger_probability": 0.8,
  "passive_effects": {
    "reputation": 2,
    "public_knowledge": 25,
    "confidence_boost": 0.2
  },
  "effect_duration": "next_battle"
}
```

**Mechanical Impact**:
- Reputation +2 (permanent)
- Public knowledge +25 (permanent)
- Confidence boost +20% (temporary, next battle only)

---

## Stress System

### The Hidden Stat

Stress is a **hidden stat** (0-100) that players cannot directly see but that has major mechanical consequences.

### Stress Accumulation

**Sources**:
1. **Back-to-back battles without rest**
   - 2 battles: +8 stress
   - 3+ battles: +15 stress

2. **High prep intensity**
   - 5+ consecutive writing days: +15 stress (burnout event)
   - 5+ consecutive performance days: +15 stress (voice strain event)

3. **Life event outcomes**
   - Various events add/subtract stress

4. **Recent chokes**
   - 1 choke in last 3 battles: +10 stress
   - 2+ chokes: +20 stress

### Stress Reduction

**Sources**:
1. **Rest prep days**: -5 stress per rest day
2. **Winning**: -10 stress (moral boost)
3. **Certain life event choices**: Variable reduction

### Stress Impact on Gameplay

**Choke Probability**:
```typescript
function calculateStressChokeImpact(stress: number): number {
  if (stress >= 80) return 0.25;  // +25% choke chance
  if (stress >= 60) return 0.15;  // +15% choke chance
  if (stress >= 40) return 0.08;  // +8% choke chance
  if (stress >= 20) return 0.03;  // +3% choke chance
  return 0;
}
```

**Prep Efficiency**:
- High stress reduces prep effectiveness
- Modifiers applied during simulation

**Event Triggers**:
- `stress >= 50`: PASSIVE_MODERATE_STRESS event eligible
- `stress >= 70`: PASSIVE_HIGH_STRESS event eligible

### Strategic Implications

Players must **manage stress** by:
- Including rest days in prep schedule
- Not grinding back-to-back battles
- Making smart life event choices
- Balancing prep intensity

**Tradeoff**: Rest days reduce stress but sacrifice prep gains.

---

## Effect Duration System

### Immediate (Permanent)

**Description**: Permanent attribute changes
**Duration**: Forever
**Examples**:
- Reputation changes
- Attribute improvements/reductions
- Public knowledge shifts

**Use Case**: Long-term consequences of decisions

### Next Battle (Temporary)

**Description**: Buffs/debuffs that last until next battle
**Duration**: Until next battle completes
**Examples**:
- Writing power modifiers
- Choke chance modifiers
- Confidence boosts

**Implementation**:
- Stored in `battler_life_events` with `active = true`
- Applied during battle simulation
- Expired after battle via `expireTemporaryEffects()`

**Use Case**: Short-term consequences of recent events

### Prep Cycle (Prep Window Only)

**Description**: Effects for current prep window only
**Duration**: Until prep locks
**Examples**:
- Prep bonuses/penalties
- Efficiency modifiers

**Implementation**:
- Active during prep phase
- Expired when prep locks

**Use Case**: Immediate prep impact from events

### Cumulative (Ongoing)

**Description**: Effects that stack/accumulate over time
**Duration**: Until explicitly reduced
**Examples**:
- Stress accumulation
- Momentum modifiers

**Implementation**:
- Direct attribute updates
- Tracked in `battler_attributes`

**Use Case**: Long-term behavioral consequences

---

## Integration with Battle Flow

### Pre-Battle Phase

**When**: Before battle simulation starts
**What Happens**:
1. Fetch battler context (attributes, prep patterns, stress)
2. Calculate stress accumulation from behavior
3. Evaluate passive event triggers
4. Evaluate choice event triggers
5. Apply immediate effects

**Code**:
```typescript
await preBattleLifeEventCheck(supabase, battleId, playerBattlerId);
```

### During Battle (Simulation)

**When**: During battle simulation calculations
**What Happens**:
1. Fetch active modifiers from life events
2. Apply modifiers to base stats
3. Calculate modified writing/performance power
4. Adjust choke probability
5. Run simulation with modified values

**Code**:
```typescript
const modifiers = await getBattleModifiers(supabase, battlerId);
const modifiedStats = applyModifiersToSimulation(baseStats, modifiers, prepProfile);
```

**Example Modifiers**:
```json
{
  "writing_power_modifier": -0.15,      // -15% writing power
  "choke_chance_modifier": 0.2,         // +20% choke chance
  "confidence_boost": 0.15,             // +15% overall boost
  "prep_bonus_writing": 0.1,            // +10% if writing days > 0
  "consistency_penalty": 0.05           // +5% variance
}
```

### Post-Battle Phase

**When**: After battle simulation completes
**What Happens**:
1. Fetch battle result data (winner, scores, chokes, etc.)
2. Update prep patterns (chokes, streaks)
3. Evaluate triggered event templates
4. Apply triggered event effects
5. Expire temporary effects
6. Calculate stress reduction from rest

**Code**:
```typescript
await postBattleLifeEventCheck(supabase, battleId, playerBattlerId, battleResult);
```

---

## Database Schema

### Tables

#### `life_event_templates`
Stores event definitions (60 total: 20 passive, 20 choice, 20 triggered)

**Key Fields**:
- `code`: Unique identifier (e.g., "PASSIVE_WRITING_BURNOUT")
- `event_type`: passive | choice | triggered
- `trigger_type`: prep_pattern | stress_threshold | battle_result | etc.
- `trigger_condition`: JSONB conditions for firing
- `trigger_probability`: 0.0 - 1.0
- `passive_effects`: JSONB effects (for passive/triggered)
- `choice_a/b/c_text`: Choice options (for choice events)
- `choice_a/b/c_effects`: JSONB effects per choice
- `winning_choice_for_writers/performers/balanced`: Rock-paper-scissors mapping
- `effect_duration`: immediate | next_battle | prep_cycle | cumulative

#### `battler_life_events`
Stores event instances for battlers

**Key Fields**:
- `battler_id`: Who this event happened to
- `template_code`: Which event template
- `event_type`: Denormalized for quick filtering
- `status`: pending | resolved | expired
- `chosen_option`: a | b | c (for choice events)
- `effects_applied`: JSONB actual effects
- `active`: Whether temporary effect is still active
- `expires_at`: When temporary effect expires
- `details_json`: Battle context, outcome info

#### `prep_pattern_tracking`
Tracks prep behavior for triggering events

**Key Fields**:
- `consecutive_writing_days`: Streak counter
- `consecutive_performance_days`: Streak counter
- `consecutive_research_days`: Streak counter
- `total_writing_days`: All-time counter
- `battles_without_rest`: Back-to-back battle counter
- `recent_chokes`: Last 3 battles (capped at 3)

#### `battler_attributes` (Extended)
Added `stress` field:
- `stress`: numeric (0-100), hidden stat

### Indexes

**Performance Optimization**:
- `idx_life_event_templates_trigger_type` - Fast filtering by trigger type
- `idx_battler_life_events_active` - Fast lookup of active effects
- `idx_battler_life_events_status` - Fast pending choice queries
- `idx_prep_pattern_tracking_consecutive` - Fast pattern matching

---

## API Integration

### Frontend API Endpoints

#### `GET /api/life-events`
Get all life events for current battler

**Response**:
```json
{
  "pending": [
    {
      "id": "event-123",
      "code": "CHOICE_PODCAST_INVITE",
      "title": "Podcast Interview Offer",
      "description": "...",
      "choices": [
        {"option": "a", "text": "Accept - be yourself", "effects": {...}},
        {"option": "b", "text": "Accept - play it safe", "effects": {...}},
        {"option": "c", "text": "Decline", "effects": {...}}
      ],
      "triggered_at": "2025-01-15T10:00:00Z"
    }
  ],
  "recent": [
    {
      "id": "event-122",
      "code": "TRIGGERED_BODYBAG_BUZZ",
      "title": "Bodybag Viral Moment",
      "resolved_at": "2025-01-14T20:00:00Z",
      "effects_applied": {...}
    }
  ]
}
```

#### `POST /api/life-events/:id/resolve`
Resolve a choice event

**Request**:
```json
{
  "chosen_option": "a"
}
```

**Response**:
```json
{
  "success": true,
  "effects_applied": {
    "public_knowledge": 15,
    "reputation": 2,
    "stress": 10
  }
}
```

### Backend Simulation Integration

**In `simulation.ts`**:
```typescript
// PRE-BATTLE
await preBattleLifeEventCheck(supabase, battleId, playerBattlerId);

// DURING BATTLE
const modifiers = await getBattleModifiers(supabase, playerBattlerId);
const stressChokeImpact = calculateStressChokeImpact(playerAttributes.stress);
const totalChokeChance = baseChokeChance + stressChokeImpact + (modifiers.choke_chance_modifier || 0);

const modifiedStats = applyModifiersToSimulation(
  baseStats,
  modifiers,
  prepProfile
);

// POST-BATTLE
await postBattleLifeEventCheck(supabase, battleId, playerBattlerId, {
  battleId,
  winnerId,
  playerBattlerId,
  result: "3-0",
  playerRoundsWon: 3,
  aiRoundsWon: 0,
  playerChoked: false,
  playerAvgCrowdReaction: 82,
  playerPeakScore: 9.2,
  playerConsistencyScore: 0.88,
  // ... other fields
});
```

---

## Event Templates Summary

### Passive Events (20)

1. `PASSIVE_WRITING_BURNOUT` - 5 consecutive writing days
2. `PASSIVE_PERFORMANCE_STRAIN` - 5 consecutive performance days
3. `PASSIVE_RESEARCH_PARALYSIS` - 6 consecutive research days
4. `PASSIVE_NO_REST_CRASH` - 3 battles without rest
5. `PASSIVE_HIGH_STRESS` - Stress >= 70
6. `PASSIVE_MODERATE_STRESS` - Stress 50-69
7. `PASSIVE_MATERIAL_LEAKED` - 15+ total writing days
8. `PASSIVE_SPARRING_LEAK` - 12+ total performance days
9. `PASSIVE_RELATIONSHIP_DRAMA` - Random personal life event
10. `PASSIVE_DAY_JOB_FIRED` - 4 battles without rest
11. `PASSIVE_INJURY_MINOR` - 7 consecutive performance days
12. `PASSIVE_BLACKLISTED_MINOR` - Low reputation + declined battles
13. `PASSIVE_BEEF_STARTED` - Dominant win random chance
14. `PASSIVE_CHOKE_TRAUMA` - 1 recent choke
15. `PASSIVE_CHRONIC_CHOKER` - 2 recent chokes
16. `PASSIVE_BROKE` - Financial stability <= 2
17. `PASSIVE_UNEXPECTED_EXPENSE` - Random financial hit
18. `PASSIVE_SICK` - Random illness during prep
19. `PASSIVE_INSOMNIA` - Stress >= 60
20. `PASSIVE_IMBALANCED_PREP` - Prep ratio > 0.8 (one-dimensional)

### Choice Events (20)

1. `CHOICE_PODCAST_INVITE` - Media interview opportunity
2. `CHOICE_BATTLE_RAP_VLOG` - Documentary cameras
3. `CHOICE_TWITTER_BEEF` - Social media drama
4. `CHOICE_FACE_TO_FACE` - Backstage confrontation
5. `CHOICE_SPONSOR_OFFER` - Brand deal
6. `CHOICE_EASY_MONEY_BATTLE` - Low-tier payday
7. `CHOICE_TRAINING_CAMP` - Intensive training offer
8. `CHOICE_NEW_WRITING_PARTNER` - Collaboration
9. `CHOICE_RELATIONSHIP_ULTIMATUM` - Partner vs battle rap
10. `CHOICE_FAMILY_EMERGENCY` - Family needs you
11. `CHOICE_BIGGER_LEAGUE` - Major league offer
12. `CHOICE_MAIN_EVENT` - Headline battle
13. `CHOICE_GRUDGE_MATCH` - Rematch callout
14. `CHOICE_STYLES_CLASH` - Style mismatch battle
15. `CHOICE_AFTER_CHOKE` - Post-choke response
16. `CHOICE_LOSING_STREAK` - 3 straight losses
17. `CHOICE_AFTER_PARTY_SCENE` - Party culture
18. `CHOICE_BURNOUT_WARNING` - Feeling burned out
19. `CHOICE_THERAPY_OPTION` - Mental health support
20. (Reserved for expansion)

### Triggered Events (20)

1. `TRIGGERED_BODYBAG_BUZZ` - Viral 3-0 win
2. `TRIGGERED_PERFECT_EXECUTION` - Flawless performance
3. `TRIGGERED_UPSET_VICTORY` - Beat higher-rated opponent
4. `TRIGGERED_MOMENTUM_SHIFT` - 4 win streak
5. `TRIGGERED_HAYMAKER_MOMENT` - Career-defining bar
6. `TRIGGERED_CROWD_FAVORITE` - High crowd reaction
7. `TRIGGERED_MASTER_CLASS` - Veteran recognition
8. `TRIGGERED_CLOSE_LOSS_RESPECT` - Moral victory
9. `TRIGGERED_BAD_LOSS_BACKLASH` - Public criticism
10. `TRIGGERED_EXPOSED_WEAKNESS` - Style exploited
11. `TRIGGERED_PUBLIC_CHOKE` - High-profile choke
12. `TRIGGERED_CHOKE_REDEMPTION` - Bounce back after choke
13. `TRIGGERED_SECOND_CHOKE` - Pattern emerging
14. `TRIGGERED_BREAKOUT_STAR` - 5 streak + high PK
15. `TRIGGERED_LEGEND_STATUS` - 8 streak + elite stats
16. `TRIGGERED_CONTROVERSY_VIRAL` - Scandal
17. `TRIGGERED_LEAGUE_INTEREST` - Scouted by major leagues
18. `TRIGGERED_MAIN_EVENT_EARNED` - Headliner status
19. `TRIGGERED_PAY_RAISE` - Market value increased
20. `TRIGGERED_SPONSOR_INTEREST` - Brand deals incoming

---

## Configuration and Tuning

### Probabilities

All events have `trigger_probability` (0.0 - 1.0) that can be tuned:
- Passive events: Generally 0.6 - 0.9 (high when conditions met)
- Choice events: Generally 0.2 - 0.5 (moderate random triggers)
- Triggered events: Generally 0.5 - 1.0 (high when specific outcomes)

### Stress Thresholds

Configurable stress impact breakpoints:
```typescript
const STRESS_THRESHOLDS = {
  LOW: 20,      // +3% choke chance
  MODERATE: 40, // +8% choke chance
  HIGH: 60,     // +15% choke chance
  CRITICAL: 80  // +25% choke chance
};
```

### Effect Magnitudes

All effects can be tuned in templates:
- Attribute changes: -3 to +3 (clamped 1-10)
- Modifiers: -0.3 to +0.3 (-30% to +30%)
- Stress changes: -40 to +40
- Public knowledge: -20 to +30
- Reputation: -3 to +3

---

## Testing

See `LIFE_EVENTS_THREE_TIER_TESTING.md` for comprehensive test scenarios covering:
- Passive event triggering
- Choice event resolution
- Triggered event firing
- Stress accumulation and impact
- Full battle flow integration
- Effect application and expiration

---

## Future Enhancements

### Potential Additions

1. **Time-based events** - Events triggered by calendar (holidays, anniversaries)
2. **Combo events** - Special events when multiple conditions met
3. **Event chains** - One event leads to follow-up events
4. **Battler relationships** - Events based on history with specific opponents
5. **League reputation** - Different standing with different leagues
6. **Media system** - Events generate news articles automatically
7. **Sponsor system** - Track sponsor relationships and contracts

### Balancing Considerations

- Monitor event frequency (too many = overwhelming, too few = irrelevant)
- Track effect magnitudes (too strong = overpowered, too weak = meaningless)
- Measure stress system impact on gameplay
- Gather data on choice event selections
- Analyze triggered event distribution

---

## Implementation Checklist

- [x] Migration: Add stress stat to battler_attributes
- [x] Migration: Create three-tier life event schema
- [x] Migration: Seed 20 passive events
- [x] Migration: Seed 20 choice events
- [x] Migration: Seed 20 triggered events
- [x] Migration: Add helper SQL functions
- [x] Code: Trigger evaluation system (lifeEventTriggers.ts)
- [x] Code: Effects application system (lifeEventEffects.ts)
- [x] Code: Simulation integration (simulationIntegration.ts)
- [ ] API: GET /api/life-events endpoint
- [ ] API: POST /api/life-events/:id/resolve endpoint
- [ ] Integration: Pre-battle check in simulation flow
- [ ] Integration: During-battle modifiers in simulation
- [ ] Integration: Post-battle triggers in simulation
- [ ] Frontend: Pending choice events UI
- [ ] Frontend: Event history viewer
- [ ] Frontend: Stress indicator (optional - could remain hidden)
- [ ] Testing: All scenarios from testing guide
- [ ] Balancing: Tune probabilities and effect magnitudes

---

## Summary

The three-tier life event system creates **meaningful mechanical consequences** from player behavior:

1. **PASSIVE** events punish or reward based on patterns (burnout, stress)
2. **CHOICE** events force strategic decisions with different outcomes per battler type
3. **TRIGGERED** events respond to performance, creating narrative moments

Combined with the **stress system**, this creates a deep layer of **strategic management** beyond just preparing for battles - players must:
- Balance prep intensity with rest
- Manage stress to avoid choking
- Make smart life event choices
- React to performance outcomes

**Every event has teeth** - mechanical impact that affects battles, not just story flavor.
