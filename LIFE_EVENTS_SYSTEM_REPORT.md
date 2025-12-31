# LIFE EVENTS SYSTEM - COMPREHENSIVE REPORT

**Generated**: 2025-12-07
**Purpose**: Complete analysis of the Life Events system - "the heart of battle rap"

---

## EXECUTIVE SUMMARY

The Life Events system is **partially implemented** with a strong foundation but **missing key activation points and scandal mechanics** that would make it "the heart of battle rap."

**Current State**: 7/10 - Solid architecture, underutilized
**What Works**: Database schema, event templates, choice resolution, integration hooks
**What's Missing**: Active triggering, scandal system, relationship/rivalry integration, more frequent events

---

## 1. DATABASE SCHEMA

### Core Tables (Implemented ✅)

#### `life_event_templates`
The blueprint for all events. Defines triggers and effects.

**Key Fields**:
- `code` - Unique identifier (e.g., "DOMINANT_VICTORY")
- `title` - Display name
- `description` - Narrative text shown to player
- `trigger_type` - When it fires: `battle_result`, `prep_pattern`, `stress_threshold`, `attribute`, `random`
- `trigger_condition` - JSON criteria (e.g., `{"result": "3-0", "outcome": "win"}`)
- `trigger_probability` - 0.0 to 1.0 (chance to fire when conditions met)
- `event_type` - `passive` | `choice` | `triggered`
- `choice_a_text`, `choice_a_effects` - Option A for player
- `choice_b_text`, `choice_b_effects` - Option B
- `choice_c_text`, `choice_c_effects` - Option C (some events have 3 choices)
- `effect_duration` - `immediate` | `next_battle` | `prep_cycle` | `permanent`
- `cooldown_battles` - How many battles before event can trigger again
- `can_trigger_multiple_times` - Boolean flag

**Current Template Count**: **20 templates** seeded (from migration 006)

#### `battler_life_events`
Event instances - records of events that happened to a battler.

**Key Fields**:
- `battler_id` - Who this event affects
- `template_code` - Links to template
- `battle_id` - Which battle triggered it (if applicable)
- `status` - `pending` (awaiting player choice) | `resolved` (completed)
- `chosen_option` - `'a'` | `'b'` | `'c'` (null if passive event)
- `triggered_at` - When it happened
- `resolved_at` - When player made choice
- `details_json` - Extra context (battle result, streak, etc.)
- `effects_applied` - Copy of effects for historical record
- `active` - Boolean (for temporary effects still in play)
- `expires_at` - When temporary effect ends

**RLS**: Players can only see their own events

#### `prep_pattern_tracking` (For Advanced Events)
Tracks player behavior to trigger burnout/pattern events.

**Key Fields**:
- `consecutive_writing_days` - Streak count
- `consecutive_performance_days`
- `consecutive_research_days`
- `consecutive_rest_days`
- `total_writing_days` - Lifetime count
- `battles_without_rest` - Overwork counter
- `recent_chokes` - Choke count in last 5 battles
- `last_prep_focus` - What they did last

**Note**: Table created but **NOT actively updated** - needs integration

### Secret & Scandal Tables (Implemented but Dormant ⚠️)

#### `battler_secrets`
Private information that can be exposed.

**Key Fields**:
- `secret_type` - `criminal_record`, `financial_crisis`, `relationship_drama`, `family_scandal`, `substance_use`, `mental_health`, `career_failure`, `betrayal`, `secret_identity`
- `title`, `description` - What the secret is
- `severity` - `minor` | `moderate` | `major`
- `status` - `private` (only battler knows) | `rumored` (suspected) | `exposed` (public) | `addressed` (acknowledged)
- `exposure_risk` - 0.0 to 1.0 (chance of leaking)
- `exposed_by` - How it came out: `'life_event'`, `'battle_angle'`, `'social_media'`, `'opponent_research'`
- `battle_vulnerability` - JSON with angle bonuses for opponents

**Status**: Schema exists, **NO secrets seeded, NO generation logic**

#### `battler_public_info`
Public facts about battlers (viral moments, career milestones).

**Key Fields**:
- `info_type` - `battle_record`, `viral_moment`, `public_beef`, `career_milestone`, `media_appearance`, etc.
- `impact` - `positive` | `neutral` | `negative`
- `public_knowledge_value` - 0-100 (how widely known)
- `battle_effects` - JSON modifiers for battles

**Status**: Schema exists, **NO entries, NO generation logic**

#### `battle_intelligence`
Research discoveries during prep (what opponent found out).

**Key Fields**:
- `researcher_battler_id` - Who did research
- `target_battler_id` - Who was researched
- `secrets_discovered` - Array of secret IDs found
- `public_info_found` - Array of public info IDs found
- `research_quality` - 0.0 to 1.0 effectiveness
- `research_days` - How many prep days spent

**Status**: Schema exists, **NOT integrated with prep system**

### Event Engine Tables (Advanced Scandal System - Migration 20251125020000)

#### `event_definitions`
Alternative template system modeling real battle rap scandals (Math Hoffa punch, Twork choking, Geechi deposit theft, etc.).

**Contains 12 major scandal templates**:
1. Math Hoffa Punch (Violence → 3-year ban)
2. Twork Choking Pattern (6 years → redemption)
3. Geechi Deposit Theft (Financial scandal)
4. Chess Health Issues (Gets sick during battles)
5. Tsu Surf Jail Time (Years duration)
6. Daylyt SquatterGate (Controversy → Fame)
7. Substance Abuse Crisis
8. Financial Bankruptcy
9. Major Beef/Rivalry
10. Family Emergency
11. Redemption Battle Offer
12. Veteran Co-Sign

**Status**: Templates seeded, **NOT actively triggering** - parallel system to main life events

#### `active_events`, `event_history`, `karmic_debt`, `scandals`, `jail_events`
Support tables for branching storylines with long-term consequences.

**Status**: Schema ready, **NO active usage**

---

## 2. EVENT TEMPLATES

### Current Templates (20 from migration 006)

All are **battle_result triggered** events:

#### Dominant Victory Events (3-0 wins)
1. **DOMINANT_VICTORY** - "League Recognition"
   - Trigger: 3-0 win
   - Choice A: Accept challenge (+reputation, +public_knowledge)
   - Choice B: Stay at current level (-reputation penalty)

2. **BODYBAG_HYPE** - "Viral Moment"
   - Trigger: 3-0 win + min 30 public knowledge
   - Choice A: Take spotlight (+public_knowledge, +financial)
   - Choice B: Keep low-key (+resilience)

#### Win Streak Events
3. **WIN_STREAK_3** - "Momentum Building"
   - Trigger: 3 wins in a row
   - Choice A: Sign sponsor deal (+financial, +public_knowledge)
   - Choice B: Stay independent (+reputation, +resilience)

4. **WIN_STREAK_5** - "Unstoppable Force"
   - Trigger: 5 wins in a row
   - Choice A: Embrace pressure (+reputation, +public_knowledge, -resilience)
   - Choice B: Take mental break (+resilience, -reputation)

#### Close Win Events (2-1 wins)
5. **CLOSE_VICTORY** - "Controversial Decision"
   - Trigger: 2-1 win
   - Choice A: Defend performance (+public_knowledge)
   - Choice B: Ignore noise (+resilience)

#### Loss Events (2-1 losses)
6. **NARROW_LOSS** - "Self-Doubt Creeping"
   - Trigger: 2-1 loss
   - Choice A: Extra writing prep (+prep bonus, -resilience)
   - Choice B: Mental break (+resilience, -financial)

7. **CONTROVERSIAL_LOSS** - "Robbery Allegations"
   - Trigger: 2-1 loss + close crowd reaction
   - Choice A: Call for rematch (+reputation, +public_knowledge, -resilience)
   - Choice B: Move on quietly (+resilience, -reputation)

#### Choke Events
8. **CHOKE_EVENT** - "Confidence Shaken"
   - Trigger: Choked in battle
   - Choice A: Hire performance coach (-financial, +resilience, +stage_presence)
   - Choice B: Push through alone (-resilience, -reputation)

9. **CHOKE_IN_BIG_BATTLE** - "Public Humiliation"
   - Trigger: Choked + min 40 public knowledge
   - Choice A: Own it and laugh (+public_knowledge, +resilience)
   - Choice B: Go into hiding (-resilience, -public_knowledge, -reputation)

#### Dominant Loss Events (0-3 losses)
10. **BAD_LOSS** - "Rock Bottom"
    - Trigger: 0-3 loss
    - Choice A: Take break (+resilience, -reputation, -financial)
    - Choice B: Book immediate rematch (-resilience, +reputation, +prep bonus)

11. **CAREER_CRISIS** - "Is This Worth It?"
    - Trigger: 0-3 loss + max 3 financial stability
    - Choice A: Find day job (+financial, +resilience, prep penalty)
    - Choice B: Go all-in on battle rap (-financial, +resilience, +reputation)

#### Personal Events (Trigger on ANY battle result)
12. **FAMILY_WEDDING** - "Family Wedding Invitation"
    - Trigger: Any result
    - Choice A: Attend wedding (+family_bond, prep penalty, -financial)
    - Choice B: Skip, focus on battle (-family_bond, +prep bonus, -resilience)

13. **FINANCIAL_CRISIS** - "Bills Piling Up"
    - Trigger: Max 3 financial stability
    - Choice A: Take easy battle (+financial, -reputation, -public_knowledge)
    - Choice B: Grind it out (-financial, +resilience)

14. **MEDIA_INTERVIEW** - "Media Spotlight"
    - Trigger: Min 7 reputation
    - Choice A: Do interview (+public_knowledge, +reputation)
    - Choice B: Decline, stay mysterious (-reputation, +resilience)

15. **INJURY_MINOR** - "Minor Voice Strain"
    - Trigger: Any result
    - Choice A: Rest and recover (+resilience, prep penalty)
    - Choice B: Battle through it (-resilience, +prep bonus performance)

16. **RIVAL_CALLOUT** - "Public Callout"
    - Trigger: Win
    - Choice A: Accept callout (+reputation, +public_knowledge)
    - Choice B: Ignore it (-reputation, +resilience)

17. **TRAINING_PARTNER** - "Training Partner Offer"
    - Trigger: Any result
    - Choice A: Accept training (-financial, +lyricism, +stage_presence, +resilience)
    - Choice B: Keep solo (+resilience)

18. **VENUE_CHANGE** - "Last-Minute Venue Change"
    - Trigger: Any result
    - Choice A: Embrace opportunity (+public_knowledge, -resilience, +reputation)
    - Choice B: Request smaller venue (+resilience, -reputation)

### Template Analysis

**Strengths**:
- Good variety of triggers (wins, losses, streaks, chokes, personal)
- Meaningful choices with tradeoffs
- Effects balance attributes, reputation, finances
- Cooldowns prevent spam (most have no cooldown set, defaults to 5 battles)

**Weaknesses**:
- All 20 are `battle_result` triggered - **NO prep pattern events, NO stress threshold events, NO random events**
- Trigger probabilities not set (defaults to 1.0 = always fire if conditions met)
- Missing: Scandal escalation, beef creation, secret exposure, relationship events
- No multi-stage events (choice A leads to follow-up event)
- No karmic debt system active

---

## 3. EVENT TRIGGERING LOGIC

### How Events Get Triggered

#### Post-Battle Trigger (IMPLEMENTED ✅)
**File**: `lib/game/lifeEvents.ts` → `triggerLifeEventsForBattle()`

**Called from**: `lib/game/simulation.ts` line 1590 (after battle completes)

**Process**:
1. Fetch all `battle_result` templates
2. Calculate outcome context:
   - Result string ("3-0", "2-1", etc.)
   - Win/loss outcome
   - Choke flags
   - Win streak calculation
   - Crowd reaction comparison
   - Public knowledge, reputation, financial stability
3. Filter templates where trigger conditions match
4. **Pick first match only** (no multi-event triggers)
5. Insert into `battler_life_events` with status `pending`
6. Create notification for player

**Key Function**: `evaluateTriggerCondition()`

**Supported Conditions**:
- `any: true` - Always matches
- `result: "3-0"` - Specific score
- `outcome: "win"` or `"loss"` - Winner check
- `choked: true` - Choke flag
- `win_streak: 3` - Minimum streak
- `close_crowd_reaction: true` - Crowd difference < 10
- `min_public_knowledge`, `max_public_knowledge`
- `min_reputation`, `max_reputation`
- `min_financial_stability`, `max_financial_stability`

**Limitation**: Only checks **one event per battle** - if multiple events match, only first is triggered

#### Pre-Battle Trigger (SKELETON ONLY ⚠️)
**File**: `lib/game/lifeEventTriggers.ts` → `evaluatePreBattleEvents()`

**Status**: Function exists but **NOT CALLED ANYWHERE**

**Would Check**:
- Prep pattern events (consecutive writing days, burnout, etc.)
- Stress threshold events (stress > 70, etc.)
- Attribute threshold events (reputation too low, etc.)
- Random events

**Missing Integration**: No hook in battle simulation or prep system

#### Effect Duration System (PARTIALLY IMPLEMENTED ⚠️)

**Effect Types**:
1. **immediate** - Permanent attribute changes (applied immediately)
2. **next_battle** - Temporary until next battle (stored, not expired)
3. **prep_cycle** - Temporary for this prep window (stored, not expired)
4. **permanent** - Ongoing (not implemented)

**Functions Exist**:
- `applyLifeEventEffects()` - Apply attribute changes ✅
- `getActiveModifiers()` - Fetch active temporary effects ✅
- `expireTemporaryEffects()` - Expire after battle ⚠️ (exists but NOT CALLED)
- `expirePrepCycleEffects()` - Expire after prep ⚠️ (exists but NOT CALLED)

**Problem**: Temporary effects are stored but **never expired**, so they pile up forever

---

## 4. WHAT'S BUILT VS WHAT'S MISSING

### ✅ Fully Implemented

1. **Database Schema**
   - All tables created and migrated
   - RLS policies in place
   - Indexes for performance

2. **Event Templates**
   - 20 battle-result templates seeded
   - 12 major scandal templates seeded (separate system)
   - Choice structure defined

3. **Choice Resolution**
   - API endpoint: `POST /api/life-events/[id]/resolve`
   - Applies effects based on player choice
   - Marks event as resolved
   - Returns before/after attribute changes

4. **Post-Battle Triggering**
   - Integrated into battle simulation
   - Condition evaluation working
   - Notification creation

5. **Effect Application**
   - Permanent attribute changes work
   - Public knowledge updates work
   - Nested attribute handling (writing.lyricism, personal.reputation)

### ⚠️ Partially Implemented

1. **Prep Pattern Tracking**
   - Table exists
   - Trigger functions defined in SQL
   - **NOT actively updated during prep**

2. **Temporary Effect System**
   - Effects stored with duration metadata
   - `getActiveModifiers()` function exists
   - **Never expired** - no cleanup

3. **Stress System**
   - `stress` field added to `battler_attributes`
   - Calculation functions exist
   - **NOT accumulated or reduced** - always 0

4. **Pacing Limits**
   - Cooldown tracking in `life_event_templates.last_triggered_for_battler`
   - Helper functions: `can_trigger_event()`, `is_event_on_cooldown()`
   - **NOT enforced** in trigger logic

5. **Three-Tier Event Types**
   - Schema supports passive/choice/triggered
   - Only **choice events** fully working
   - Passive and triggered treated same as choice currently

### ❌ Not Implemented

1. **Pre-Battle Event Triggering**
   - Function skeleton exists
   - No integration with game loop
   - Passive events never fire

2. **Prep Pattern Events**
   - Templates exist in separate migration (008, 009, 010)
   - **NOT seeded into current database**
   - Tracking not active

3. **Stress Threshold Events**
   - Designed but not seeded
   - Stress never accumulates

4. **Random Events**
   - System supports it
   - No templates defined

5. **Secret/Scandal System**
   - Full schema exists
   - **ZERO secrets created**
   - No generation logic
   - No exposure mechanics
   - No battle angle integration

6. **Research System**
   - `battle_intelligence` table exists
   - Not connected to prep `research` focus
   - No secret discovery logic

7. **Scandal Escalation**
   - `event_engine` tables seeded with 12 major scandals
   - **Parallel system never activated**
   - No trigger logic
   - No karmic debt processing

8. **Relationship/Rivalry Events**
   - No rival creation from events
   - No ally system
   - Beef events defined but don't create grudge matches

9. **Multi-Stage Events**
   - No "choice A leads to event B later" system
   - Karmic debt table exists but unused

10. **League Bans/Restrictions**
    - Effects reference league bans
    - No enforcement in battle offer generation

11. **Badge Earning from Events**
    - Events can reference badge changes
    - Not connected to badge system

12. **Active Modifier Application**
    - `getActiveModifiers()` exists
    - **NOT called during battle simulation**
    - Temporary effects don't affect battles

---

## 5. SCANDALS & STORIES

### The Vision (From LIFE_EVENTS_V2_DEEP_SPEC.md)

Life events should create:
- **Consequences** - Choices matter long-term
- **Drama** - Public beefs, scandals, controversies
- **Story** - Career arcs, redemption narratives
- **Information warfare** - Secrets as battle ammunition

### Current Reality

**Scandal System**: Fully designed, ZERO activation

**What Exists**:
- 12 real-world scandal templates (Math Hoffa, Twork, Geechi, etc.)
- Secrets table with 9 types
- Public info tracking
- Exposure risk mechanics
- Battle angle vulnerability
- Karmic debt (consequences)
- Jail time system
- Redemption arcs

**What's Missing**:
- **NO secrets generated** for any battler
- **NO scandal triggers**
- **NO research integration** - prep focus "research" does nothing with secrets
- **NO battle angle mechanics** - knowing opponent's secret doesn't help
- **NO exposure events** - secrets never leak
- **NO consequence chains** - karmic debt never processes

### Secret System Potential

**How It Should Work** (Designed but not implemented):

1. **Secret Generation**
   - Battlers created with 1-3 random secrets
   - Based on background, badges, attributes
   - E.g., "Known Choker" badge → `career_failure` secret "Choked 6 times in 2023"

2. **Exposure Risk**
   - Base risk per secret (0.0 to 1.0)
   - Increases with public knowledge (more scrutiny)
   - Increases with high reputation (bigger target)
   - Threshold events: "50% chance to leak at public knowledge > 60"

3. **Research Discovery**
   - Prep focus "research" → roll to discover opponent secrets
   - Quality based on days spent + attributes
   - Discovered secrets stored in `battle_intelligence`

4. **Battle Angle Bonus**
   - Knowing secret → angle bonus in simulation
   - Secret type affects bonus magnitude
   - `major` severity → +20% writing effectiveness
   - `exposed` secret → lower bonus (already public)

5. **Exposure Events**
   - Life event: "Your [secret_type] was exposed by [source]"
   - Choices: Address it, deny it, double down
   - Consequences: Reputation hit, badge changes, league bans

6. **Karmic Debt**
   - Choice A in Event X → flag for Event Y later
   - E.g., "Stole deposit" → "League blacklist" 10 battles later
   - Probability-based (15% chance per battle after cooldown)

### Public Knowledge System

**Implemented**: `battler_attributes.public_knowledge` (0-100)

**Increases From**:
- Life event choices (+5 to +20)
- Battle outcomes (wins, especially upsets)
- Viral moments
- Media appearances

**Should Affect** (Not implemented):
- Secret exposure risk (higher = more leaks)
- Event trigger rates (famous = more events)
- Battle offer quality (recognition)
- Crowd reaction baseline

**Currently Used For**: Event trigger conditions only

---

## 6. TRIGGER FREQUENCY ANALYSIS

### Current Frequency: **TOO LOW**

**Problem**: Only 1 event per battle, only post-battle, only battle_result type

**Math**:
- Player battles every ~7-14 days
- 1 event per battle maximum
- If 20 templates, each fires ~1/20 battles (if conditions met)
- **Result**: 1 event every 1-2 battles, all reactionary

**User Expectation**: "A lot of stuff going on between battles"

### Desired Frequency: **MUCH HIGHER**

**Target**: 2-3 events per week

**How to Achieve**:
1. **Pre-battle events** (prep phase)
   - Trigger during prep calendar UI
   - Passive burnout events (5 writing days → fatigue)
   - Random personal events
   - Financial pressures
   - **Adds 1-2 events per battle cycle**

2. **Post-battle events** (current)
   - Keep existing system
   - Add multi-event triggers (2-3 events from big battles)
   - **Current 1 event per battle**

3. **Time-based events** (between battles)
   - Sponsor offers
   - Media requests
   - Relationship drama
   - **Adds 1-2 random events between battles**

4. **Scandal events** (rare but impactful)
   - Secret exposures
   - Beef escalations
   - Career crises
   - **Adds 1 event every 5-10 battles**

**Total Target**: ~3-5 events per battle cycle

### Pacing Limits (Implemented but Not Enforced)

**Max 1 Pending Event Rule**:
- Function: `has_pending_life_event()`
- Prevents spam
- **Should be enforced** before triggering new events

**Cooldown System**:
- Table: `life_event_templates.last_triggered_for_battler` (JSONB)
- Function: `is_event_on_cooldown()`
- Default: 5 battles between same event
- **Currently ignored** in trigger logic

---

## 7. INTEGRATION POINTS

### Where Life Events Touch Other Systems

#### ✅ **Battle Simulation**
- `lib/game/simulation.ts` line 1590
- Calls `triggerLifeEventsForBattle()` after rounds complete
- Working integration

#### ⚠️ **Prep System** (Should integrate, doesn't)
- Prep blocks stored in `prep_blocks` table
- Life events should:
  - Track consecutive prep patterns → trigger burnout
  - Apply prep bonuses/penalties from active events
  - Block prep if "injured" or "suspended"
- **Current**: No connection

#### ❌ **Battle Offers** (Not integrated)
- Life events should:
  - Create special grudge matches from beef events
  - Block offers if league banned
  - Create redemption battle offers
- **Current**: No connection

#### ❌ **Badge System** (Not integrated)
- Life events should:
  - Award badges ("Controversial Figure", "Comeback Kid")
  - Remove badges ("Clean Image" after scandal)
  - Badge effects should modify event probabilities
- **Current**: No connection

#### ❌ **News/Media System** (Not integrated)
- Life events should:
  - Generate news articles about scandals
  - Create storylines for bloggers
  - Track "media coverage" stat
- **Current**: No connection

#### ❌ **Rankings/Reputation** (Partially integrated)
- Life events affect `reputation` attribute ✅
- Should affect:
  - ELO rating changes
  - Battle offer quality
  - Fan reactions
- **Current**: Attribute changes only

#### ❌ **Notifications** (Partially integrated)
- Notification created when event triggers ✅
- Should also notify:
  - When temporary effect expires
  - When scandal escalates
  - When secret is at risk
- **Current**: Trigger only

---

## 8. SAMPLE EVENT FLOW (IDEAL STATE)

### Example: "The Choker's Redemption Arc"

**Week 1: Battle**
- Player chokes in 2-1 loss
- Post-battle trigger: `CHOKE_EVENT` fires
- Choice presented: "Hire coach" vs "Push through"
- Player chooses: "Hire coach"
- Effects: -$500 financial, +1 resilience, +0.5 stage presence (next 3 battles)

**Week 2: Prep Phase**
- Passive event triggers: `PASSIVE_STRESS_MODERATE` (stress at 55 from choke)
- Auto-applied: +10% choke chance next battle, -5% prep efficiency
- Player sees notification: "You're feeling anxious about choking again"

**Week 3: Battle**
- Temporary effect active: +0.5 stage presence from coach
- Stress modifier active: +10% choke chance
- Battle result: Narrow 2-1 win, didn't choke
- Post-battle trigger: `TRIGGERED_REDEMPTION_NARRATIVE` fires
- Auto-applied: +15 public knowledge, +1 reputation, stress -20
- News article generated: "From Choker to Clutch: [Name]'s Redemption"

**Week 5: Random Event**
- Time-based trigger: `CHOICE_PODCAST_INVITE` fires
- Player chooses: "Accept, speak freely"
- Effects: +20 public knowledge, +2 reputation, +15 stress

**Week 6: Scandal**
- Public knowledge now 65 (was 30)
- Secret exposure check: Old secret "Failed in local battles before going pro"
- Exposure risk: 0.3 base + 0.15 (high public knowledge) = 45% → ROLLED 32 → EXPOSED
- Event: `SCANDAL_PAST_EXPOSED` fires
- Choice: "Own it" vs "Deny it" vs "Make excuses"
- Player chooses: "Own it, show growth"
- Effects: +1 reputation, +10 public knowledge, badge earned: "Self-Made"

**Result**: 6 events over 6 weeks, meaningful narrative arc, mechanical consequences

### Current Reality

**Week 1: Battle**
- Player chokes in 2-1 loss
- Post-battle trigger: `CHOKE_EVENT` fires ✅
- Choice presented ✅
- Player chooses: "Hire coach" ✅
- Effects: Attribute changes apply ✅

**Week 2-6**: **NOTHING HAPPENS**

- Prep patterns not tracked ❌
- Stress never accumulates ❌
- Random events never fire ❌
- Secrets never exposed ❌
- Temporary effects never expire (or apply to battles) ❌

**Result**: 1 event, no arc, minimal impact

---

## 9. RECOMMENDATIONS

### Priority 1: ACTIVATE THE SYSTEM (Quick Wins)

1. **Enforce Multi-Event Triggers**
   - Change line in `triggerLifeEventsForBattle()`:
   ```typescript
   // OLD: if (matchingTemplates.length > 0) { const selectedTemplate = matchingTemplates[0]; ... }
   // NEW: Trigger ALL matching templates (or first 2-3)
   ```

2. **Set Probabilities**
   - Most templates have no probability set (defaults to 1.0)
   - Recommended:
     - Common events (narrow loss, close win): 0.5-0.7
     - Uncommon events (win streak 5): 0.3-0.5
     - Rare events (choke in big battle): 0.6-0.8 (impactful but conditional)

3. **Enforce Pacing Limits**
   - Add `has_pending_life_event()` check before triggering
   - Add `can_trigger_event()` check with cooldowns

4. **Expire Temporary Effects**
   - Call `expireTemporaryEffects()` after battle simulation
   - Call `expirePrepCycleEffects()` when prep locks

5. **Apply Active Modifiers**
   - Call `getActiveModifiers()` in battle simulation
   - Apply modifiers to choke chance, writing power, etc.

### Priority 2: ADD PRE-BATTLE EVENTS (Medium Effort)

1. **Integrate `evaluatePreBattleEvents()`**
   - Call when prep phase starts
   - Pass battler context with attributes, stress, prep patterns

2. **Activate Prep Pattern Tracking**
   - Update `prep_pattern_tracking` when prep blocks saved
   - Increment consecutive counters
   - Track `battles_without_rest`

3. **Seed Prep Pattern Templates**
   - Use templates from migrations 008-010 (if they exist)
   - Or create new:
     - Burnout events (5+ consecutive writing days)
     - Overwork events (3+ battles without rest)
     - Prep imbalance events (80% writing, no performance)

4. **Implement Stress Accumulation**
   - Calculate after each battle (based on prep patterns, chokes)
   - Apply stress reduction on rest days
   - Trigger stress threshold events at 50, 70, 90

### Priority 3: SCANDAL SYSTEM (High Impact)

1. **Generate Initial Secrets**
   - Create script to generate 1-3 secrets per battler
   - Based on badges, attributes, background
   - Seed into `battler_secrets` table

2. **Research Integration**
   - When prep focus = "research", roll for discovery
   - Quality = days spent × (creativity + lyricism) / 20
   - Store in `battle_intelligence`

3. **Exposure Mechanics**
   - Calculate exposure risk after each battle
   - Roll for each secret with risk > threshold
   - Trigger exposure event on success

4. **Battle Angle Integration**
   - In simulation, check `battle_intelligence` for discovered secrets
   - Apply angle bonus to writing effectiveness
   - Scale with secret severity

5. **Activate Scandal Templates**
   - Integrate `event_engine` tables with main system
   - Trigger major scandals based on conditions
   - Process karmic debt after each battle

### Priority 4: TIME-BASED EVENTS (Adds "Stuff Between Battles")

1. **Random Event System**
   - Create 10-15 random event templates:
     - Sponsor offers
     - Media requests
     - Personal drama
     - Injury/illness
   - Trigger probability: 10-20% per day between battles

2. **Event Scheduling**
   - Add `scheduled_at` field to events
   - Generate random events during sim run
   - Player sees them on dashboard: "1 pending event"

3. **Weekly Event Budget**
   - Limit: 2-3 random events per week
   - Prevents spam
   - Creates rhythm

### Priority 5: NARRATIVE DEPTH (Polish)

1. **Multi-Stage Events**
   - Add `follows_event_code` field to templates
   - Example: "Steal deposit" → "League blacklist" 10 battles later
   - Use `karmic_debt` table

2. **Badge Integration**
   - Award badges from events: "Controversial Figure", "Comeback Kid"
   - Remove badges: "Clean Image" after scandal
   - Use earned badges in event conditions

3. **Rivalry/Relationship System**
   - Create rivals from beef events
   - Generate grudge matches automatically
   - Track ally/enemy relationships

4. **Media Coverage**
   - Generate news articles from major events
   - Scandals → "Breaking News" articles
   - Redemptions → "Comeback Story" features

5. **Visual Feedback**
   - Event severity icons (🔥 for scandals)
   - Countdown timers for temporary effects
   - "Active Effects" panel in battle UI

---

## 10. TECHNICAL DEBT

### Issues to Fix

1. **Dual Template Systems**
   - `life_event_templates` (main, 20 events)
   - `event_definitions` (scandal engine, 12 events)
   - **Should merge or clarify separation**

2. **Unused Tables**
   - `battler_secrets`: 0 rows
   - `battler_public_info`: 0 rows
   - `battle_intelligence`: 0 rows
   - `active_events`, `scandals`, `jail_events`: 0 rows
   - **Either remove or activate**

3. **Incomplete Stress System**
   - Field exists, never changes
   - Calculation functions unused
   - **Fully implement or remove**

4. **Prep Pattern Tracking**
   - Table exists, triggers defined
   - Never updated
   - **Integrate with prep save logic**

5. **Temporary Effect Expiration**
   - Effects stored with duration
   - Never expire
   - **Add cleanup after battle/prep**

6. **Trigger Probability**
   - Most templates default to 1.0
   - Leads to event spam
   - **Set realistic values (0.3-0.7)**

7. **Cooldown Enforcement**
   - Functions exist, not called
   - Same event can fire every battle
   - **Add to trigger logic**

8. **Active Modifier Application**
   - `getActiveModifiers()` exists
   - Never called in simulation
   - **Integrate into battle calculations**

---

## 11. QUICK START IMPLEMENTATION GUIDE

### Week 1: Make Existing Events Work Better

```typescript
// File: lib/game/lifeEvents.ts

// 1. Allow multiple events per battle (change matchingTemplates loop)
for (const template of matchingTemplates.slice(0, 2)) { // First 2 matches
  // ... trigger logic
}

// 2. Add cooldown check
if (!(await canTriggerEvent(supabase, template.code, battlerId))) {
  continue;
}

// 3. Check pending event limit
const { data: pending } = await supabase
  .from('battler_life_events')
  .select('id')
  .eq('battler_id', battlerId)
  .eq('status', 'pending');

if (pending && pending.length >= 1) {
  console.log('Already has pending event, skipping');
  return;
}
```

```typescript
// File: lib/game/simulation.ts (after battle completes)

// 4. Expire temporary effects
import { expireTemporaryEffects } from '@/lib/game/lifeEventEffects';
await expireTemporaryEffects(supabase, playerBattlerId, battleId);
```

### Week 2: Add Stress System

```sql
-- Migration: Update stress after each battle
CREATE OR REPLACE FUNCTION calculate_battle_stress(
  p_battler_id UUID,
  p_choked BOOLEAN,
  p_battles_without_rest INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_stress_gain INTEGER := 0;
BEGIN
  -- Choke trauma
  IF p_choked THEN
    v_stress_gain := v_stress_gain + 20;
  END IF;

  -- Overwork
  IF p_battles_without_rest >= 3 THEN
    v_stress_gain := v_stress_gain + 25;
  ELSIF p_battles_without_rest >= 2 THEN
    v_stress_gain := v_stress_gain + 15;
  END IF;

  RETURN v_stress_gain;
END;
$$ LANGUAGE plpgsql;
```

```typescript
// File: lib/game/simulation.ts (after battle)

const stressGain = await supabase.rpc('calculate_battle_stress', {
  p_battler_id: playerBattlerId,
  p_choked: playerChoked,
  p_battles_without_rest: prepPatterns.battles_without_rest || 0
});

await supabase
  .from('battler_attributes')
  .update({
    stress: Math.min(100, currentStress + stressGain)
  })
  .eq('battler_id', playerBattlerId);
```

### Week 3: Seed Initial Secrets

```typescript
// Script: lib/scripts/seedSecrets.ts

async function seedSecretsForBattler(supabase: any, battlerId: string) {
  const { data: battler } = await supabase
    .from('battlers')
    .select('*, style_tags')
    .eq('id', battlerId)
    .single();

  const secrets = [];

  // Badge-based secrets
  if (battler.style_tags?.includes('choker')) {
    secrets.push({
      battler_id: battlerId,
      secret_type: 'career_failure',
      title: 'Known for Choking',
      description: 'Has choked in multiple high-profile battles',
      severity: 'moderate',
      exposure_risk: 0.3,
    });
  }

  // Random personal secret (20% chance)
  if (Math.random() < 0.2) {
    secrets.push({
      battler_id: battlerId,
      secret_type: 'financial_crisis',
      title: 'Struggling Financially',
      description: 'Behind on rent, taking battles for quick cash',
      severity: 'minor',
      exposure_risk: 0.15,
    });
  }

  await supabase.from('battler_secrets').insert(secrets);
}
```

### Week 4: Pre-Battle Event Integration

```typescript
// File: app/battle/[id]/prep/page.tsx (or prep API)

// When prep phase starts, trigger events
import { evaluatePreBattleEvents } from '@/lib/game/lifeEventTriggers';

const { battler } = await getPlayerBattler();
const context = await fetchBattlerContext(supabase, battler.id);

await evaluatePreBattleEvents(supabase, battleId, context);
```

---

## 12. CONCLUSION

### Summary

The Life Events system has:
- **Excellent foundation** (schema, templates, resolution API)
- **Partial integration** (post-battle triggers work)
- **Massive untapped potential** (scandal system, secrets, prep events, stress)

**Current bottleneck**: Not enough events firing, no "stuff between battles"

**Biggest wins**:
1. Activate prep pattern events → 2x event frequency
2. Implement scandal/secret system → narrative depth
3. Multi-event triggers → richer battles
4. Stress accumulation → mechanical tension

**Effort vs Impact**:
- Low effort, high impact: Multi-event triggers, pacing enforcement
- Medium effort, high impact: Stress system, prep events
- High effort, high impact: Scandal system, research integration

### Roadmap

**Phase 1 (1-2 weeks)**: Make existing events better
- Multi-event triggers
- Pacing limits
- Temporary effect expiration
- Active modifier application

**Phase 2 (2-3 weeks)**: Add pre-battle events
- Prep pattern tracking
- Stress system
- Burnout events

**Phase 3 (3-4 weeks)**: Scandal system
- Seed secrets
- Research integration
- Exposure mechanics
- Battle angle bonuses

**Phase 4 (2-3 weeks)**: Narrative depth
- Multi-stage events
- Badge integration
- Rivalry creation
- Media coverage

**Total Time**: 8-12 weeks to "heart of battle rap" status

---

**End of Report**

Generated by Claude Code analyzing C:\git\battlerapuniversity
Date: 2025-12-07
