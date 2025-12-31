# Life Events System - Implementation Guide

## Overview

The life events system adds dynamic, choice-based narrative moments to the Battle Rap University game. Events are triggered after battles based on specific conditions (wins, losses, chokes, streaks, etc.) and present players with meaningful choices that affect their battler's attributes.

## System Architecture

### Database Tables

#### `life_event_templates`
Defines reusable event templates with trigger conditions and choices.

**Schema:**
```sql
- id: UUID (primary key)
- code: TEXT (unique identifier, e.g., 'DOMINANT_VICTORY')
- title: TEXT (event title shown to player)
- description: TEXT (event description/narrative)
- trigger_type: TEXT ('battle_result', 'time', 'attribute', 'random')
- trigger_condition: JSONB (conditions for triggering)
- choice_a_text: TEXT (first choice text)
- choice_a_effects: JSONB (effects of choice A)
- choice_b_text: TEXT (optional second choice)
- choice_b_effects: JSONB (optional effects of choice B)
```

#### `battler_life_events`
Stores instances of events that have been triggered for specific battlers.

**Schema:**
```sql
- id: UUID (primary key)
- battler_id: UUID (references battlers)
- template_code: TEXT (references life_event_templates.code)
- battle_id: UUID (optional, if triggered by battle)
- status: TEXT ('pending' | 'resolved')
- chosen_option: TEXT ('a' | 'b', null until resolved)
- triggered_at: TIMESTAMPTZ
- resolved_at: TIMESTAMPTZ (null until resolved)
- details_json: JSONB (metadata about the trigger)
```

## Trigger Conditions

Events are triggered based on JSON conditions. The system supports:

### Battle Result Conditions

- `{"result": "3-0", "outcome": "win"}` - Dominant victory
- `{"result": "2-1", "outcome": "loss"}` - Narrow loss
- `{"choked": true}` - Player choked during battle
- `{"win_streak": 3}` - Player has 3+ win streak
- `{"close_crowd_reaction": true}` - Crowd reaction was close
- `{"any": true}` - Always triggers (for random personal events)

### Attribute Thresholds

- `{"min_public_knowledge": 40}` - Public knowledge >= 40
- `{"max_financial_stability": 3}` - Financial stability <= 3
- `{"min_reputation": 7}` - Reputation >= 7

### Multiple Conditions

Conditions are combined with AND logic:
```json
{
  "choked": true,
  "min_public_knowledge": 40
}
```
This triggers only if player choked AND has public knowledge >= 40.

## Event Effects

Effects modify battler attributes when a choice is made.

### Supported Effects

**Personal Attributes:**
- `reputation`: +/- change to reputation (1-10 scale)
- `financial_stability`: +/- change to financial stability
- `family_bond`: +/- change to family bond

**Performance Attributes:**
- `stage_presence`: +/- change to stage presence
- `resilience`: +/- change to resilience

**Writing Attributes:**
- `lyricism`: +/- change to lyricism

**Other:**
- `public_knowledge`: +/- change to public knowledge (0-100 scale)
- `prep_bonus_writing`: Bonus to writing prep (future implementation)
- `prep_penalty`: Penalty to all prep (future implementation)

### Example Effects

```json
{
  "reputation": 0.5,
  "public_knowledge": 10,
  "financial_stability": 1.0
}
```

This adds 0.5 to reputation, 10 to public knowledge, and 1.0 to financial stability.

## Event Templates

### Currently Seeded Events

1. **DOMINANT_VICTORY** (3-0 win)
   - Choice A: Accept tougher challenges (+reputation, +public_knowledge)
   - Choice B: Stay at current level (-reputation)

2. **WIN_STREAK_3** (3 wins in a row)
   - Choice A: Sign sponsor deal (+financial_stability, +reputation)
   - Choice B: Stay independent (+reputation, +resilience)

3. **NARROW_LOSS** (2-1 loss)
   - Choice A: Extra writing prep next battle (+prep_bonus, -resilience)
   - Choice B: Take mental break (+resilience, -financial_stability)

4. **CHOKE_EVENT** (choked in battle)
   - Choice A: Hire performance coach (-financial_stability, +resilience, +stage_presence)
   - Choice B: Push through alone (-resilience, -reputation)

5. **BAD_LOSS** (3-0 loss)
   - Choice A: Take a break (+resilience, -reputation, -financial_stability)
   - Choice B: Book immediate rematch (-resilience, +reputation)

6. **FAMILY_WEDDING** (random personal event)
   - Choice A: Attend wedding (+family_bond, -prep_penalty)
   - Choice B: Skip for battle (-family_bond, +prep_bonus)

...and 12 more events (see migration 006 for full list)

## Integration Points

### Battle Simulation Flow

Life events are triggered automatically after battle simulation:

1. Battle completes
2. Rankings updated
3. **Life events triggered** ← NEW
4. News article generated
5. Attribute progression applied

### Triggering Logic (`lib/game/lifeEvents.ts`)

```typescript
// Called from simulation.ts after battle completes
await triggerLifeEventsForBattle(
  supabase,
  battleResult,
  playerContext,
  aiContext
);
```

The function:
1. Queries all `battle_result` type templates
2. Evaluates trigger conditions against battle outcome
3. Creates one pending `battler_life_events` record (only triggers one event per battle)

### Applying Effects

When a player resolves an event:

```typescript
// Called from API when player makes choice
await applyLifeEventEffects(supabase, battlerId, effects);
```

This updates `battler_attributes` with the chosen effects.

## API Endpoints

### GET `/api/life-events`

Fetch pending life events for authenticated player.

**Response:**
```json
{
  "events": [
    {
      "id": "...",
      "battler_id": "...",
      "template_code": "DOMINANT_VICTORY",
      "status": "pending",
      "triggered_at": "2024-01-15T10:30:00Z",
      "template": {
        "title": "League Recognition",
        "description": "Your 3-0 bodybag has the league talking...",
        "choice_a_text": "Accept the challenge",
        "choice_a_effects": {...},
        "choice_b_text": "Stay at current level",
        "choice_b_effects": {...}
      }
    }
  ]
}
```

### POST `/api/life-events/[id]/resolve`

Resolve a pending event by making a choice.

**Request Body:**
```json
{
  "choice": "a"  // or "b"
}
```

**Response:**
```json
{
  "message": "Life event resolved successfully",
  "choice": "a",
  "effects": {
    "reputation": 0.5,
    "public_knowledge": 10
  }
}
```

## UI Implementation (Future)

A complete UI would include:

### Life Events Page (`/life-events`)

- List of pending events
- For each event:
  - Title and description
  - Two choice buttons (A and B)
  - Preview of effects for each choice
- After choosing:
  - Show applied effects
  - Update battler attributes in real-time

### Dashboard Integration

- Badge/notification icon when pending events exist
- Quick link to life events page

### Battle Results Integration

- After viewing battle results, show triggered event (if any)
- Allow immediate resolution

## Testing the System

### 1. Apply Migrations

```bash
cd ai-battlerap
npm run supabase:reset
```

This will:
- Drop old life event tables
- Create new choice-based tables
- Seed 18 event templates

### 2. Simulate a Battle

Use dev mode to force a battle simulation:

```bash
curl -X POST "http://localhost:3000/api/internal/run-due-battles?battle_id=BATTLE_ID" \
  -H "Authorization: Bearer local-dev-secret-123"
```

### 3. Check for Triggered Events

Query the database or use the API:

```bash
curl http://localhost:3000/api/life-events
```

### 4. Resolve an Event

```bash
curl -X POST "http://localhost:3000/api/life-events/EVENT_ID/resolve" \
  -H "Content-Type: application/json" \
  -d '{"choice": "a"}'
```

### 5. Verify Attribute Changes

Check `battler_attributes` table to see updated values.

## Adding New Events

To add new life event templates:

1. Create a new migration file or add to existing seed file
2. Define the template:

```sql
INSERT INTO life_event_templates (
  code,
  title,
  description,
  trigger_type,
  trigger_condition,
  choice_a_text,
  choice_a_effects,
  choice_b_text,
  choice_b_effects
) VALUES (
  'YOUR_EVENT_CODE',
  'Event Title',
  'Event description shown to player...',
  'battle_result',
  '{"result": "2-1", "outcome": "win"}'::jsonb,
  'First choice text',
  '{"reputation": 0.3}'::jsonb,
  'Second choice text',
  '{"reputation": -0.1, "resilience": 0.2}'::jsonb
);
```

3. Apply the migration:

```bash
npx supabase migration new add_new_life_event
npm run supabase:reset
```

## Future Enhancements

### Time-Based Events
- Events triggered by time passing (e.g., "It's been 30 days since your last battle")
- Requires cron job to check time-based triggers

### Attribute-Based Events
- Events triggered when attributes cross thresholds
- E.g., "Your reputation has fallen below 3"

### Random Events
- Random chance events unrelated to battles
- Add variety and unpredictability

### Prep Bonuses/Penalties
- Currently defined but not applied
- Need integration with prep system to:
  - Store active bonuses on battler
  - Apply them during next battle prep phase
  - Clear after battle

### Event Chains
- Events that unlock other events
- Multi-step event sequences
- E.g., accepting a sponsorship unlocks sponsor-related events

### Event History
- UI to view resolved events
- Timeline of major life moments
- Career narrative visualization

## File Reference

**Migrations:**
- `supabase/migrations/005_add_choice_based_life_events.sql` - Table definitions
- `supabase/migrations/006_seed_choice_based_life_event_templates.sql` - Event templates

**Core Logic:**
- `lib/game/lifeEvents.ts` - Triggering and effect application logic
- `lib/game/simulation.ts` - Integration with battle simulation

**API Routes:**
- `app/api/life-events/route.ts` - GET pending events
- `app/api/life-events/[id]/resolve/route.ts` - POST resolve event

## Troubleshooting

### Events Not Triggering

1. Check that migrations are applied: `npm run supabase:reset`
2. Verify templates exist: `SELECT * FROM life_event_templates;`
3. Check battle outcome matches trigger conditions
4. Look for errors in server logs during simulation

### Effects Not Applying

1. Verify event was marked as resolved
2. Check `battler_attributes` table for updates
3. Look for errors in API response when resolving
4. Ensure effects JSON is valid

### Multiple Events Triggered

- By design, only one event triggers per battle
- First matching template (by insertion order) is used
- To change priority, reorder seeds or add priority column

## Summary

The life events system is now fully functional for V1:

✅ Database tables created
✅ 18 event templates seeded
✅ Triggering logic implemented
✅ Integration with battle simulation complete
✅ API endpoints for querying and resolving events
✅ Effect application working

**Next Steps:**
- Build UI for viewing and resolving events
- Add prep bonus/penalty application
- Test with real battles and verify balance
