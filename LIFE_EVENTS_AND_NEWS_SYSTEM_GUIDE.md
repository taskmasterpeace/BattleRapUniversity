# Life Events & News System Guide

## Executive Summary

**Life Events** and **News** are the storytelling engine of Battle Rap University. Together they:
- Create a living world where battles have consequences
- Give players narrative moments with meaningful choices
- Drive the media coverage that makes the game feel authentic
- Connect player actions to reputation, stress, and career arcs

**Current Status: 70% Built, 30% Integrated**

The pieces exist but aren't fully connected. This guide explains what works, what doesn't, and how to complete the system.

---

## How It Works (Architecture Overview)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BATTLE FLOW                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   PRE-BATTLE                    BATTLE                POST-BATTLE   │
│   ──────────                    ──────                ───────────   │
│                                                                     │
│   ┌──────────────┐         ┌──────────────┐     ┌────────────────┐ │
│   │ Prep Phase   │───────> │ Simulation   │────>│ Results Page   │ │
│   └──────────────┘         └──────────────┘     └────────────────┘ │
│          │                        │                     │           │
│          ▼                        ▼                     ▼           │
│   ┌──────────────┐         ┌──────────────┐     ┌────────────────┐ │
│   │ Pre-Battle   │         │ Segment-by-  │     │ Post-Battle    │ │
│   │ Life Events  │         │ Segment Sim  │     │ Life Events    │ │
│   │ (PASSIVE)    │         │              │     │ (CHOICE)       │ │
│   └──────────────┘         └──────────────┘     └────────────────┘ │
│          │                                              │           │
│          │              ┌──────────────────────────────┘           │
│          │              │                                           │
│          ▼              ▼                                           │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                    NEWS GENERATION                           │  │
│   │  - Battle recaps written by 8 blogger personalities         │  │
│   │  - Life events become public storylines                      │  │
│   │  - Rivalries tracked and narratively integrated              │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                │                                    │
│                                ▼                                    │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                    DASHBOARD                                 │  │
│   │  - Latest news articles                                      │  │
│   │  - Pending life events (player must resolve)                │  │
│   │  - Rivalry updates                                           │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Life Events System

### What Are Life Events?

Life events are **narrative moments** that happen to battlers based on their performance, behavior, and circumstances. They affect attributes, stress, and public perception.

### Three-Tier Event System

| Tier | Type | When | Player Action |
|------|------|------|---------------|
| **PASSIVE** | Auto-apply | Before battle | None - effects applied automatically |
| **TRIGGERED** | Auto-apply | After battle | None - effects applied automatically |
| **CHOICE** | Player decides | After battle | Pick from 2-3 options |

### Event Examples

**PASSIVE (Auto-apply before battle):**
```
BURNOUT
Trigger: 5+ battles without rest prep
Effect: -1 Resilience, +20 Stress, +0.03 choke chance
```

**TRIGGERED (Auto-apply after battle):**
```
DOMINANT_VICTORY
Trigger: 3-0 win with high crowd reaction
Effect: +1 Reputation, +10 Public Knowledge
```

**CHOICE (Player decides):**
```
RIVALRY_FORMING
Trigger: Lost to same opponent twice
Options:
  A) "Call them out publicly" → +2 Rivalry Intensity, +1 Stress
  B) "Focus on your craft" → +0.5 Lyricism, -1 Stress
  C) "Let it go" → -1 Reputation, -3 Stress
```

### Trigger Conditions

Events trigger based on JSON conditions evaluated against player state:

```json
{
  "trigger_type": "battle_result",
  "trigger_condition": {
    "result": "3-0",
    "outcome": "win",
    "min_public_knowledge": 30
  },
  "trigger_probability": 0.8
}
```

**Available Trigger Types:**
- `battle_result` - Based on win/loss and score
- `prep_pattern` - Based on consecutive prep focus choices
- `stress_threshold` - Based on stress level (0-100)
- `attribute` - Based on attribute values
- `random` - Random chance based on probability

### Effect Types

| Effect Category | Examples | Duration |
|-----------------|----------|----------|
| **Permanent Attributes** | +1 Reputation, -0.5 Lyricism | Forever |
| **Temporary Modifiers** | +10% choke chance, +5% prep bonus | Next battle only |
| **Stress Changes** | +20 stress, -10 stress | Cumulative |
| **Public Knowledge** | +15 fame, -10 fame | Cumulative |

---

## Part 2: News Generation System

### What Is News?

News articles are **AI-generated recaps** of battles and career events. They:
- Create the feeling of a living battle rap world
- Provide media coverage of player's career
- Build narratives around rivalries and storylines
- Give context to life events

### The 8 Bloggers

Each battle is covered by a **blogger with distinct personality**:

| Blogger | Personality | Covers |
|---------|-------------|--------|
| **Battle Eyez** | Drama hunter | Chokes, scandals, controversy |
| **Marijuana Piranha** | Street voice | High energy, crowd reactions |
| **Algorithm Institute** | Historian | High-level battles, legacy |
| **Small Room Report** | Underground specialist | Small room league battles |
| **The Main Stage Herald** | Big stage specialist | Main stage events, classics |
| **Underground Voice** | Indie advocate | Lower-rated battles, newcomers |
| **Coast to Coast Coverage** | Underdog champion | Upsets, unexpected wins |
| **The Battle Breakdown** | Technical analyst | Default, objective analysis |

### Article Generation Flow

1. **Battle Completes** → `createBattleRecapAndEvents()` called
2. **Build Summary** → Extract chokes, haymakers, crowd reactions
3. **Select Blogger** → Based on battle characteristics
4. **Generate Article** → LLM with blogger personality OR template fallback
5. **Create Life Events** → Based on battle outcome
6. **Update Reputation** → Winner/loser rep changes
7. **Track Rivalry** → Head-to-head records, grudge creation

### News on Dashboard

The dashboard should show:
- **Latest 5-10 articles** from the battle rap world
- **Filter by relevance** to player's league/opponents
- **Highlight player's own battles** prominently

---

## Part 3: Integration Status

### What's Working

| Feature | Status | Notes |
|---------|--------|-------|
| Battle result triggers | Works | Post-battle events fire correctly |
| Event creation in DB | Works | Events insert to `battler_life_events` |
| Choice resolution API | Works | `/api/life-events/[id]/resolve` |
| Dashboard widget | Works | Shows pending events count |
| Event detail page | Works | Full narrative display |
| News article generation | Works | Articles save to `news_articles` |
| Blogger selection | Works | Picks based on battle type |
| Reputation updates | Works | Rep changes after battles |

### What's Broken/Missing

| Feature | Status | Issue |
|---------|--------|-------|
| **Stress system** | NOT WIRED | Calculated but never applied |
| **Prep pattern tracking** | NOT WIRED | Table exists, never populated |
| **Battle modifiers** | NOT WIRED | Fetched but simulation ignores them |
| **Pre-battle events** | INCOMPLETE | No templates seeded for prep patterns |
| **Stress visualization** | MISSING | Player can't see stress level |
| **News on dashboard** | MISSING | Dashboard doesn't show news feed |
| **3-tier event templates** | MINIMAL | Only ~10 templates seeded |

---

## Part 4: Database Schema

### Core Tables

**`life_event_templates`** - Event definitions
```sql
- code: TEXT (e.g., 'DOMINANT_VICTORY')
- title: TEXT (display title)
- description: TEXT (narrative text)
- event_type: TEXT ('passive' | 'choice' | 'triggered')
- trigger_type: TEXT ('battle_result' | 'prep_pattern' | etc.)
- trigger_condition: JSONB (condition logic)
- trigger_probability: DECIMAL (0-1)
- passive_effects: JSONB (for auto-apply events)
- choice_a_text, choice_a_effects: JSONB (for choice events)
- choice_b_text, choice_b_effects: JSONB
- choice_c_text, choice_c_effects: JSONB
- effect_duration: TEXT ('immediate' | 'next_battle' | 'prep_cycle')
- severity: TEXT ('minor' | 'moderate' | 'major' | 'critical')
```

**`battler_life_events`** - Event instances
```sql
- battler_id: UUID
- template_code: TEXT
- battle_id: UUID (optional)
- status: TEXT ('pending' | 'resolved' | 'expired')
- chosen_option: TEXT ('a' | 'b' | 'c')
- effects_applied: JSONB
- active: BOOLEAN (for temporary effects)
- expires_at: TIMESTAMPTZ
```

**`news_articles`** - Generated articles
```sql
- slug: TEXT (URL slug)
- title: TEXT
- type: TEXT ('battle_recap' | 'life_event' | 'career_update')
- body_markdown: TEXT
- primary_battler_id: UUID
- secondary_battler_id: UUID
- battle_id: UUID
- meta_json: JSONB (decision type, blogger, etc.)
- published_at: TIMESTAMPTZ
```

---

## Part 5: Refinements Needed

### Priority 1: Wire Stress System

**Problem:** Stress accumulates conceptually but never actually changes.

**Fix:**
1. Call `calculateStressAccumulation()` in `run-due-battles/route.ts`
2. Call `calculateStressReduction()` for rest prep days
3. Actually update `battler_attributes.stress` field

```typescript
// In run-due-battles, after simulation:
const stressAccumulation = calculateStressAccumulation(prepPatternTracking);
const stressReduction = calculateStressReduction(restDaysCount);
const newStress = Math.max(0, Math.min(100, currentStress + stressAccumulation - stressReduction));
await supabase.from('battler_attributes').update({ stress: newStress }).eq('battler_id', playerId);
```

### Priority 2: Track Prep Patterns

**Problem:** `prep_pattern_tracking` table never gets updated.

**Fix:**
1. When prep is saved, update tracking table
2. Increment consecutive days for each focus type
3. Reset other counters when focus changes

```typescript
// In /api/battles/[id]/prep route:
await updatePrepPatternTracking(supabase, battlerId, prepFocus);
```

### Priority 3: Seed More Event Templates

**Problem:** Only ~10 basic templates exist. Need 50+ for full experience.

**Templates Needed:**

**PASSIVE Events (Pre-battle):**
- `BURNOUT` - 5+ battles without rest
- `OVERTRAINING_SYNDROME` - 10+ consecutive performance prep
- `WRITERS_BLOCK` - 10+ writing days in a row
- `PEAK_FORM` - Perfect prep balance (2+ of each type)
- `EXHAUSTION` - Stress > 80
- `IN_THE_ZONE` - Win streak 3+ with low stress

**TRIGGERED Events (Post-battle, auto-apply):**
- `VIRAL_MOMENT` - Haymaker with 90%+ crowd
- `CAREER_DEFINING_WIN` - Beat higher-rated opponent 3-0
- `REDEMPTION_ARC` - Win after 2+ losses
- `CROWD_FAVORITE` - 3 battles with 80%+ crowd
- `CLUTCH_PERFORMER` - Win after being down 0-1

**CHOICE Events (Post-battle, player decides):**
- `MEDIA_ATTENTION` - After big win, handle interview
- `RIVALRY_ESCALATION` - Opponent called you out
- `SPONSOR_OFFER` - Brand wants to sign you
- `FAMILY_EMERGENCY` - Personal life conflict
- `BEEF_OPPORTUNITY` - Start drama for clout

### Priority 4: Add News to Dashboard

**Problem:** Dashboard doesn't show news feed.

**Fix:**
1. Add `NewsSection` component to dashboard
2. Fetch latest articles from `/api/news`
3. Show top 5 relevant to player's league/opponents
4. Highlight player's own battle recaps

```tsx
// In DashboardClient.tsx:
<NewsSection
  articles={latestNews}
  playerBattlerId={activeBattler.id}
  playerLeagueId={activeBattler.primary_league_id}
/>
```

### Priority 5: Apply Battle Modifiers

**Problem:** Life event modifiers are fetched but ignored by simulation.

**Fix:**
1. In `simulation.ts`, call `getActiveModifiers(battlerId)`
2. Apply modifiers to simulation calculations
3. Use `applyModifiersToSimulation()` from `simulationIntegration.ts`

---

## Part 6: Event Template Schema

### Template for New Events

```json
{
  "code": "RIVALRY_FORMING",
  "title": "Rivalry Brewing",
  "description": "Your loss to {opponent} is the talk of the scene. People want to see a rematch.",
  "event_type": "choice",
  "trigger_type": "battle_result",
  "trigger_condition": {
    "outcome": "loss",
    "same_opponent_losses": 2
  },
  "trigger_probability": 0.9,
  "choice_a_text": "Call them out publicly",
  "choice_a_effects": {
    "reputation": 1,
    "stress": 10,
    "rivalry_intensity": 2
  },
  "choice_b_text": "Focus on your craft",
  "choice_b_effects": {
    "writing": { "lyricism": 0.5 },
    "stress": -5
  },
  "choice_c_text": "Let it go",
  "choice_c_effects": {
    "reputation": -1,
    "stress": -10
  },
  "effect_duration": "immediate",
  "severity": "moderate",
  "can_trigger_multiple_times": false,
  "cooldown_battles": 5
}
```

### Effect Schema Reference

```json
{
  // Personal attributes (0-10 scale)
  "reputation": 1.5,
  "financial_stability": 1,
  "family_bond": -1,
  "preparation": 0.5,

  // Writing attributes (0-10 scale)
  "writing": {
    "lyricism": 0.5,
    "wordplay": 0.3,
    "creativity": 0.5,
    "flow": 0.2
  },

  // Performance attributes (0-10 scale)
  "performance": {
    "stage_presence": 0.5,
    "crowd_control": 0.3,
    "delivery": 0.5
  },

  // Resilience (0-10 scale)
  "resilience": 1,

  // Hidden stats
  "stress": 15,              // 0-100
  "public_knowledge": 10,    // Fame score

  // Temporary modifiers (next battle only)
  "choke_chance_modifier": 0.03,
  "prep_efficiency_modifier": 1.1,
  "writing_power_modifier": 1.2,
  "performance_power_modifier": 0.9
}
```

---

## Part 7: Implementation Checklist

### Phase 1: Wire Missing Systems (2-3 hours)
- [ ] Wire stress accumulation in `run-due-battles`
- [ ] Wire stress reduction for rest prep
- [ ] Update `prep_pattern_tracking` from prep blocks
- [ ] Apply battle modifiers in simulation

### Phase 2: Seed Event Templates (1-2 hours)
- [ ] Create 10 PASSIVE event templates
- [ ] Create 15 TRIGGERED event templates
- [ ] Create 20 CHOICE event templates
- [ ] Test trigger conditions

### Phase 3: Dashboard News (1 hour)
- [ ] Add `NewsSection` component to dashboard
- [ ] Fetch and display latest articles
- [ ] Highlight player's battles
- [ ] Show pending life events prominently

### Phase 4: Stress Visualization (30 min)
- [ ] Add stress meter to battler stats
- [ ] Color coding (green/yellow/orange/red)
- [ ] Tooltip explaining stress effects

### Phase 5: Polish (1-2 hours)
- [ ] Test full flow end-to-end
- [ ] Verify events trigger correctly
- [ ] Confirm news generates after battles
- [ ] Check attribute changes apply

---

## Summary

The Life Events and News systems are the **narrative heart** of Battle Rap University. They transform raw simulation numbers into stories, rivalries, and career arcs.

**What works:** Basic triggering, event creation, choice resolution, news generation

**What's missing:** Stress wiring, prep tracking, battle modifiers, dashboard news, more templates

**The fix:**
1. Wire the disconnected systems (stress, prep, modifiers)
2. Seed 50+ event templates
3. Add news feed to dashboard
4. Add stress visualization

Once complete, every battle will feel like a chapter in an ongoing story.
