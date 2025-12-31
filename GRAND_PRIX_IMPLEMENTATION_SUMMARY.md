# Grand Prix Auto-Tournament Implementation Summary

## Executive Summary

The **Grand Prix** is an automatically-generated 8-person tournament that serves as the player's "graduation ceremony" from their origin story. When a player completes 5 origin milestones, the system:

1. Auto-generates a tournament with 7 low-tier AI opponents
2. Auto-registers all participants
3. Generates brackets using standard seeding
4. Schedules first round battles with 21 days of prep time
5. Notifies the player of their achievement

**Key Feature**: This is a **one-time event** per player - they can only participate in one Grand Prix tournament during their career.

---

## Files Created

### 1. Core Implementation
**Location**: `ai-battlerap/lib/game/grand-prix.ts`

**Exports**:
- `checkGrandPrixEligibility(battlerId, supabase)` - Check if player completed origin
- `hasCompletedGrandPrix(battlerId, supabase)` - Check if already participated
- `getGrandPrixOpponents(playerId, supabase, count)` - Select AI opponents
- `createGrandPrix(playerId, supabase)` - Main creation function
- `autoTriggerGrandPrix(battlerId, supabase)` - Auto-trigger after milestone

**Key Logic**:
```typescript
// Tournament creation flow
1. Validate eligibility (origin_completed = true)
2. Check not already participated (one-time only)
3. Get player info (league, origin type, rating)
4. Select 7 low-tier AI opponents (rating < 1400, unfaced first)
5. Create tournament record with grand_prix metadata
6. Auto-register player + 7 AI battlers
7. Generate 8-person brackets
8. Schedule first round (21 days prep)
9. Send notification
```

### 2. API Endpoint
**Location**: `ai-battlerap/app/api/internal/grand-prix/create/route.ts`

**Endpoints**:
- `POST /api/internal/grand-prix/create` - Manually create Grand Prix
  - Body: `{ "battler_id": "uuid" }`
  - Returns: `{ success, message, tournament }`

- `GET /api/internal/grand-prix/create?battler_id=uuid` - Check eligibility
  - Returns: `{ success, eligibility: { is_eligible, has_participated, can_create, milestone_count } }`

### 3. Test Suite
**Location**: `ai-battlerap/scripts/test-grand-prix.ts`

**Tests**:
1. Eligibility checking
2. Opponent selection (7 low-tier AI battlers)
3. Participation history (one-time verification)
4. Grand Prix creation (full flow)
5. Auto-trigger system
6. Bracket generation verification

**Usage**:
```bash
cd ai-battlerap
npx tsx scripts/test-grand-prix.ts
```

### 4. Documentation
**Location**: `ai-battlerap/lib/game/GRAND_PRIX_README.md`

**Contents**:
- System overview
- Integration guide
- Testing instructions
- Troubleshooting
- Architecture diagrams
- Code examples

---

## Integration Requirements

### Required: Hook into Milestone System

The Grand Prix needs to be triggered after a milestone is awarded. Add this to your milestone award logic:

```typescript
// Example: After awarding a milestone
import { autoTriggerGrandPrix } from '@/lib/game/grand-prix';

async function awardMilestone(battlerId: string, milestoneKey: string) {
  // ... existing milestone award logic ...

  // Check if this triggers Grand Prix
  const gpResult = await autoTriggerGrandPrix(battlerId, supabase);

  if (gpResult?.success) {
    console.log(`🎊 Grand Prix created: ${gpResult.tournament.name}`);
    // Optional: Add additional celebration UI/notification
  }
}
```

**Where to add**:
- After battle completion (if milestones are awarded post-battle)
- In life event handlers (if milestones come from events)
- Any other milestone award points

### Database Requirements

The system uses existing tables:
- ✅ `tournaments` - Stores tournament record
- ✅ `tournament_participants` - Stores player + AI registrations
- ✅ `tournament_brackets` - Stores bracket matchups
- ✅ `origin_milestones` - Checks milestone count
- ✅ `battlers` - Checks origin_completed flag
- ✅ `rankings` - Gets battler ratings

**No new migrations needed** - uses existing tournament infrastructure.

### Metadata Schema

Grand Prix tournaments are marked with:
```json
{
  "grand_prix": true,
  "player_id": "uuid-of-player",
  "origin_type": "text_forums|app_camera|crew",
  "auto_generated": true
}
```

Query example:
```sql
SELECT * FROM tournaments
WHERE metadata->>'grand_prix' = 'true';
```

---

## Tournament Structure

### Format
- **Type**: Single elimination
- **Participants**: 8 (1 player + 7 AI)
- **Rounds**: 3 (Quarterfinals → Semifinals → Finals)
- **Tier**: Low tier only (rating < 1400)

### Prize Pool ($15,000)
| Placement    | Prize   | Percentage |
|--------------|---------|------------|
| Winner       | $7,500  | 50%        |
| Runner-up    | $3,750  | 25%        |
| Semifinalists| $1,875  | 12.5% each |
| Quarterfinalists| $0   | 0%         |

### Timing
- **First Round Prep**: 21 days
- **Subsequent Rounds**: 14 days (standard tournament timing)

### Opponent Selection Strategy
1. **Prioritize unfaced opponents**: Battlers player hasn't fought
2. **Low-tier only**: Rating < 1400
3. **Strength-based**: Select strongest low-tier opponents (challenge)
4. **Fallback**: If insufficient unfaced, use any low-tier AI

---

## User Experience Flow

```
Player Journey:
══════════════

1. Choose origin path (text_forums/app_camera/crew)
   ↓
2. Complete milestone 1 → "First Post" / "First Video" / "Crew Formed"
   ↓
3. Complete milestone 2 → "Viral Moment" / "10k Views" / "First Recruit"
   ↓
4. Complete milestone 3 → "First Win" / "First Win" / "Crew Battle"
   ↓
5. Complete milestone 4 → "10 Battles" / "Viral Video" / "5 Members"
   ↓
6. Complete milestone 5 → "Rivalry Formed" / "100k Views" / "Crew Victory"
   ↓
7. 🎊 GRAND PRIX AUTO-GENERATED 🎊
   ↓
   Notification: "You've completed your origin story!
                  Your Grand Prix tournament starts in 21 days."
   ↓
8. View Tournament Page → See 8-person bracket
   ↓
9. Prepare for 21 days → Daily prep choices
   ↓
10. First Round Battle (Quarterfinals)
    ↓
11a. WIN → Advance to Semifinals
    ↓
12a. WIN → Advance to Finals
    ↓
13a. WIN → 🏆 GRAND PRIX CHAMPION ($7,500)

11b. LOSE → Eliminated (Quarterfinalist - $0)
12b. LOSE → Eliminated (Semifinalist - $1,875)
13b. LOSE → Runner-up ($3,750)
```

---

## Testing Guide

### Quick Test (Automated)
```bash
cd ai-battlerap
npx tsx scripts/test-grand-prix.ts
```

This runs all 6 tests:
1. ✓ Eligibility check
2. ✓ Opponent selection
3. ✓ Participation history
4. ✓ Tournament creation
5. ✓ Auto-trigger
6. ✓ Bracket generation

### Manual Test (API)

**Step 1: Check eligibility**
```bash
curl "http://localhost:3000/api/internal/grand-prix/create?battler_id=PLAYER_ID"
```

**Step 2: Award 5 milestones**
```sql
-- Replace PLAYER_ID with actual UUID
INSERT INTO origin_milestones (battler_id, milestone_key)
VALUES
  ('PLAYER_ID', 'text_forums_first_post'),
  ('PLAYER_ID', 'text_forums_viral_moment'),
  ('PLAYER_ID', 'text_forums_first_win'),
  ('PLAYER_ID', 'text_forums_10_battles'),
  ('PLAYER_ID', 'text_forums_rivalry_formed');

-- Trigger completion check
SELECT check_origin_completion('PLAYER_ID');
```

**Step 3: Create Grand Prix**
```bash
curl -X POST http://localhost:3000/api/internal/grand-prix/create \
  -H "Content-Type: application/json" \
  -d '{"battler_id": "PLAYER_ID"}'
```

**Step 4: Verify**
```sql
-- Check tournament created
SELECT * FROM tournaments
WHERE metadata->>'grand_prix' = 'true'
ORDER BY created_at DESC
LIMIT 1;

-- Check participants
SELECT tp.*, b.stage_name, tp.seed_number
FROM tournament_participants tp
JOIN battlers b ON b.id = tp.battler_id
WHERE tp.tournament_id = 'TOURNAMENT_ID'
ORDER BY tp.seed_number;
```

---

## Design Decisions

### Why Auto-Generate?
**Problem**: Players might not discover/enter tournaments naturally
**Solution**: Auto-generate creates guaranteed "graduation moment"
**Benefit**: Clear narrative progression, no missed opportunities

### Why One-Time Only?
**Problem**: Could be exploited for repeated low-risk prize money
**Solution**: Restrict to single participation per player
**Benefit**: Makes event special, serves specific story purpose

### Why Low-Tier Only?
**Problem**: Mixed tiers would be unfair/unbalanced for emerging player
**Solution**: All participants must be low-tier (including player)
**Benefit**: Fair matchmaking, winnable tournament, confidence boost

### Why 8 Participants?
**Problem**: 16 would take too long, 4 feels too small
**Solution**: 8 participants = 3 rounds (optimal balance)
**Benefit**: Significant but achievable, matches real tournament formats

### Why 21 Days Prep?
**Problem**: 7 days not enough for origin story completion celebration
**Solution**: 3 weeks gives time to appreciate achievement
**Benefit**: Builds anticipation, allows proper preparation

---

## Notification Flow

### 1. Grand Prix Creation
```
Title: "🏆 Grand Prix Tournament Created!"
Message: "You've completed your origin story! Your Grand Prix
          tournament starts in 21 days. Win to prove yourself!"
Type: tournament_update
Metadata: { tournament_id, grand_prix: true }
```

### 2. Brackets Released
```
Title: "Brackets Released!"
Message: "You are seed #X in [Player]'s Grand Prix. Check your first match."
Type: tournament_update
Metadata: { tournament_id, seed_number }
```

### 3. Match Scheduled
```
Title: "Tournament Match Scheduled"
Message: "Your Quarterfinals match is ready. Prepare for battle!"
Type: tournament_update
Metadata: { tournament_id, bracket_id }
```

### 4. Match Result (Win)
```
Title: "Tournament Victory!"
Message: "You won your Quarterfinals match. Advancing to next round."
Type: tournament_update
Metadata: { tournament_id, bracket_id }
```

### 5. Match Result (Loss)
```
Title: "Tournament Elimination"
Message: "You were eliminated in the Quarterfinals. Final placement: Quarterfinalist"
Type: tournament_update
Metadata: { tournament_id, placement }
```

### 6. Championship
```
Title: "🏆 TOURNAMENT CHAMPION!"
Message: "You won [Player]'s Grand Prix! Prize: $7,500"
Type: tournament_update
Metadata: { tournament_id, prize_amount: 7500 }
```

---

## Troubleshooting

### Issue: Grand Prix Not Creating

**Symptoms**: `autoTriggerGrandPrix()` returns `null`

**Checks**:
1. Milestone count:
   ```sql
   SELECT COUNT(*) FROM origin_milestones WHERE battler_id = 'PLAYER_ID';
   -- Expected: 5
   ```

2. Origin completed flag:
   ```sql
   SELECT origin_completed FROM battlers WHERE id = 'PLAYER_ID';
   -- Expected: true
   ```

3. Already participated:
   ```sql
   SELECT * FROM tournament_participants tp
   JOIN tournaments t ON t.id = tp.tournament_id
   WHERE tp.battler_id = 'PLAYER_ID'
     AND t.metadata->>'grand_prix' = 'true';
   -- Expected: 0 rows
   ```

### Issue: Not Enough Opponents

**Symptoms**: `createGrandPrix()` returns error "Not enough AI battlers"

**Check**:
```sql
SELECT COUNT(*) FROM battlers b
JOIN rankings r ON r.battler_id = b.id
WHERE b.is_ai = true
  AND b.tier = 'low'
  AND r.rating < 1400;
-- Expected: >= 7
```

**Solution**: Run battler seed migration or create more AI battlers

### Issue: Brackets Not Generating

**Symptoms**: Tournament created but no brackets

**Check**:
```sql
SELECT COUNT(*) FROM tournament_participants
WHERE tournament_id = 'TOURNAMENT_ID';
-- Expected: 8
```

**Solution**: Verify exactly 8 participants registered. Bracket generation requires power-of-2 counts (4, 8, 16).

---

## Future Enhancements

### Potential Features (Not Implemented)

1. **Origin-Specific Rewards**
   - Text Forums: "Forum Legend" badge
   - App Camera: "Viral Star" badge
   - Crew: "Crew Captain" badge

2. **Grand Prix Champion Badge**
   - Unlock special badge for winning
   - Display on profile: "Grand Prix Champion 2024"
   - Unlock higher-tier tournaments

3. **Difficulty Scaling**
   - If player rating > 1400, upgrade opponents to mid-tier
   - Dynamic prize pool based on player rating
   - Harder tournament for stronger players

4. **Media Coverage**
   - AI-generated articles about Grand Prix
   - Blogger reactions to results
   - Special "origin story complete" news post

5. **Multiple Grand Prix Types**
   - Regional Grand Prix (city-based)
   - League Grand Prix (league-specific)
   - Style Grand Prix (writing vs performance)

---

## Code Reference

### Check Eligibility
```typescript
import { checkGrandPrixEligibility } from '@/lib/game/grand-prix';

const isEligible = await checkGrandPrixEligibility(battlerId, supabase);
// Returns: boolean (true if origin_completed = true)
```

### Check Participation
```typescript
import { hasCompletedGrandPrix } from '@/lib/game/grand-prix';

const hasParticipated = await hasCompletedGrandPrix(battlerId, supabase);
// Returns: boolean (true if already participated)
```

### Get Opponents
```typescript
import { getGrandPrixOpponents } from '@/lib/game/grand-prix';

const opponents = await getGrandPrixOpponents(playerId, supabase, 7);
// Returns: Battler[] (7 low-tier AI battlers)
```

### Create Grand Prix
```typescript
import { createGrandPrix } from '@/lib/game/grand-prix';

const result = await createGrandPrix(playerId, supabase);

if (result.success) {
  console.log(result.message);
  console.log(`Tournament: ${result.tournament.name}`);
  console.log(`ID: ${result.tournament.id}`);
} else {
  console.error(result.error);
}
```

### Auto-Trigger (Integration Point)
```typescript
import { autoTriggerGrandPrix } from '@/lib/game/grand-prix';

// After awarding milestone
const gpResult = await autoTriggerGrandPrix(battlerId, supabase);

if (gpResult?.success) {
  // Grand Prix created!
  // Show celebration UI, redirect to tournament page, etc.
}
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    ORIGIN SYSTEM                         │
│  - Player completes 5 milestones                        │
│  - origin_completed flag set to true                    │
│  - Trigger: check_origin_completion()                   │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                 INTEGRATION POINT                        │
│  autoTriggerGrandPrix(battlerId, supabase)              │
│  - Called after milestone award                         │
│  - Checks: exactly 5 milestones + origin_completed     │
│  - Checks: no previous Grand Prix participation        │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│              GRAND PRIX CREATION                         │
│  createGrandPrix(battlerId, supabase)                   │
│  1. Validate eligibility                                │
│  2. Select 7 AI opponents (low-tier, unfaced first)    │
│  3. Create tournament record                            │
│  4. Auto-register 8 participants                        │
│  5. Generate brackets (seeded by rating)               │
│  6. Schedule first round (21 days)                     │
│  7. Send notifications                                  │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│           EXISTING TOURNAMENT SYSTEM                     │
│  - Uses tournamentManager.ts                            │
│  - Standard prep/battle/results flow                    │
│  - Auto-advances rounds                                 │
│  - Distributes prizes on completion                     │
└──────────────────────────────────────────────────────────┘
```

---

## Summary

The Grand Prix auto-tournament system provides a seamless, automated "graduation ceremony" for players completing their origin story. By integrating with existing tournament infrastructure and requiring minimal new code, it creates a memorable milestone while maintaining system simplicity.

**Key Achievements**:
- ✅ Fully automated tournament generation
- ✅ One-time special event per player
- ✅ Fair matchmaking (all low-tier)
- ✅ Integrated with existing tournament system
- ✅ Comprehensive testing suite
- ✅ Clear integration points
- ✅ No new database migrations required

**Next Steps**:
1. Integrate `autoTriggerGrandPrix()` into milestone award logic
2. Test with real player progression
3. Monitor tournament completion rates
4. Consider future enhancements (badges, media coverage, etc.)
