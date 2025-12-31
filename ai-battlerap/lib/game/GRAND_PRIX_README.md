# Grand Prix Auto-Tournament System

## Overview

The **Grand Prix** is an automatically-generated 8-person tournament that triggers when a player completes their origin story (5 milestones). This serves as the player's "breakthrough moment" - winning proves they're ready to move beyond their origin path and enter the real competitive scene.

## How It Works

### Trigger Condition
- Player achieves **5 origin milestones** (any origin type: text_forums, app_camera, crew)
- `origin_completed` flag is automatically set to `true`
- Grand Prix auto-generates **once per player** (cannot participate twice)

### Tournament Structure
- **Format**: Single elimination, 8 participants
- **Participants**: 1 player + 7 low-tier AI battlers (rating < 1400)
- **Prize Pool**: $15,000
  - Winner: $7,500 (50%)
  - Runner-up: $3,750 (25%)
  - Semifinalists: $1,875 each (12.5%)
- **Prep Time**: 21 days for first round
- **Tier Restriction**: Low tier only

### Opponent Selection
The system selects 7 AI opponents using this logic:
1. **Prioritize unfaced opponents**: Battlers the player hasn't battled yet
2. **Low-tier only**: Rating < 1400
3. **Strength-based**: Strongest low-tier opponents first (creates challenge)
4. **Fallback**: If not enough unfaced opponents, use any low-tier AI

## Implementation Files

### Core Logic
- **`lib/game/grand-prix.ts`** - Main implementation
  - `checkGrandPrixEligibility()` - Verify player has completed origin
  - `hasCompletedGrandPrix()` - Check if already participated
  - `getGrandPrixOpponents()` - Select 7 AI battlers
  - `createGrandPrix()` - Generate tournament, auto-register all participants
  - `autoTriggerGrandPrix()` - Auto-trigger after milestone completion

### API Endpoints
- **`app/api/internal/grand-prix/create/route.ts`**
  - `POST` - Manually create Grand Prix (testing/admin)
  - `GET` - Check eligibility status

### Testing
- **`scripts/test-grand-prix.ts`** - Comprehensive test suite
  - Tests eligibility checking
  - Tests opponent selection
  - Tests tournament creation
  - Tests bracket generation
  - Tests auto-trigger logic

## Integration Points

### 1. Origin Milestone System
The Grand Prix integrates with the origin system via:

```typescript
// After awarding a milestone
import { autoTriggerGrandPrix } from '@/lib/game/grand-prix';

// Check if player just completed origin story
const result = await autoTriggerGrandPrix(battlerId, supabase);

if (result?.success) {
  // Grand Prix created!
  console.log(`Created Grand Prix: ${result.tournament.name}`);
}
```

**Integration Location**: Add to milestone award logic (e.g., after battle completion, life events, etc.)

### 2. Notification System
Player receives notification when:
- Grand Prix is created
- Tournament brackets are generated
- Matches are scheduled
- Match results occur

All notifications use existing `create_notification` RPC.

### 3. Tournament Manager
Grand Prix uses existing tournament infrastructure:
- `generateTournamentBrackets()` - Creates 8-person bracket
- `scheduleRoundBattles()` - Schedules first round battles
- `advanceTournamentRound()` - Advances after each round
- All standard tournament features (prep tracking, results, prizes)

## Database Schema

### New Metadata Fields
Grand Prix tournaments are marked with metadata:
```json
{
  "grand_prix": true,
  "player_id": "uuid-of-player",
  "origin_type": "text_forums|app_camera|crew",
  "auto_generated": true
}
```

### Checking Participation
```sql
SELECT * FROM tournament_participants tp
JOIN tournaments t ON t.id = tp.tournament_id
WHERE tp.battler_id = 'player-id'
  AND t.metadata->>'grand_prix' = 'true';
```

## Testing Guide

### Run Test Suite
```bash
cd ai-battlerap
npx tsx scripts/test-grand-prix.ts
```

### Manual Testing Steps
1. Create test player or use existing player
2. Award 5 origin milestones:
   ```sql
   INSERT INTO origin_milestones (battler_id, milestone_key)
   VALUES
     ('player-id', 'text_forums_first_post'),
     ('player-id', 'text_forums_viral_moment'),
     ('player-id', 'text_forums_first_win'),
     ('player-id', 'text_forums_10_battles'),
     ('player-id', 'text_forums_rivalry_formed');

   SELECT check_origin_completion('player-id');
   ```

3. Manually trigger Grand Prix:
   ```bash
   curl -X POST http://localhost:3000/api/internal/grand-prix/create \
     -H "Content-Type: application/json" \
     -d '{"battler_id": "player-id"}'
   ```

4. Check tournament created:
   ```sql
   SELECT * FROM tournaments
   WHERE metadata->>'grand_prix' = 'true'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

### Check Eligibility (API)
```bash
curl http://localhost:3000/api/internal/grand-prix/create?battler_id=PLAYER_ID
```

Response:
```json
{
  "success": true,
  "eligibility": {
    "is_eligible": true,
    "has_participated": false,
    "can_create": true,
    "milestone_count": 5,
    "required_milestones": 5
  }
}
```

## User Experience Flow

### 1. Player Progression
```
Origin Story Start
  ↓
Complete Milestones (1/5)
  ↓
Complete Milestones (2/5)
  ↓
...
  ↓
Complete 5th Milestone
  ↓
🎊 GRAND PRIX AUTO-GENERATED 🎊
  ↓
Notification: "Your Grand Prix tournament is ready!"
  ↓
View Tournament Page
  ↓
Prepare for 3 weeks
  ↓
First Round Battles
  ↓
Win and advance OR lose and eliminate
  ↓
(If win all) GRAND PRIX CHAMPION 🏆
```

### 2. Notification Messages
- **Creation**: "🏆 Grand Prix Tournament Created! You've completed your origin story! Your Grand Prix tournament starts in 21 days. Win to prove yourself!"
- **Brackets Released**: "Brackets Released! You are seed #X in [Tournament Name]. Check your first match."
- **Match Scheduled**: "Tournament Match Scheduled: Your First Round match is ready. Prepare for battle!"
- **Victory**: "Tournament Victory! You won your First Round match. Advancing to next round."
- **Champion**: "🏆 TOURNAMENT CHAMPION! You won [Tournament Name]! Prize: $7,500"

## Design Philosophy

### Why 8 Battlers?
- Small enough to complete quickly (3 rounds)
- Large enough to feel significant (quarterfinals → semifinals → finals)
- Matches real tournament formats (Ultimate Madness style)

### Why Low-Tier Only?
- Player is still emerging talent at origin completion
- Ensures winnable tournament (confidence boost)
- Graduating to mid/high tier happens AFTER Grand Prix win

### Why Auto-Generate?
- Reduces decision paralysis (player doesn't have to "find" the tournament)
- Creates narrative momentum (immediate reward for origin completion)
- Guarantees fair matchmaking (all low-tier, including player)

### Why One-Time Only?
- Makes it special/memorable
- Prevents grinding for prize money
- Serves specific narrative purpose (origin → competitive transition)

## Future Enhancements

### Potential Features
1. **Origin-Specific Rewards**
   - Text Forums: Writing-focused badge
   - App Camera: Performance-focused badge
   - Crew: Social/team badge

2. **Grand Prix Tracking**
   - Special achievement for winning
   - Career stats: "Grand Prix Champion" title
   - Unlocks higher-tier tournaments

3. **Difficulty Scaling**
   - If player already has high rating, upgrade opponents to mid-tier
   - Dynamic prize pool based on player rating

4. **Special Commentary**
   - AI-generated articles about Grand Prix results
   - Blogger reactions to player's performance

## Troubleshooting

### Grand Prix Not Creating
1. **Check origin_completed flag**:
   ```sql
   SELECT origin_completed FROM battlers WHERE id = 'player-id';
   ```

2. **Check milestone count**:
   ```sql
   SELECT COUNT(*) FROM origin_milestones WHERE battler_id = 'player-id';
   ```

3. **Check for existing Grand Prix**:
   ```sql
   SELECT * FROM tournament_participants tp
   JOIN tournaments t ON t.id = tp.tournament_id
   WHERE tp.battler_id = 'player-id'
     AND t.metadata->>'grand_prix' = 'true';
   ```

### Not Enough Opponents
- **Issue**: Less than 7 low-tier AI battlers in database
- **Solution**: Run battler seed migration or create more AI battlers
- **Check**:
  ```sql
  SELECT COUNT(*) FROM battlers b
  JOIN rankings r ON r.battler_id = b.id
  WHERE b.is_ai = true
    AND b.tier = 'low'
    AND r.rating < 1400;
  ```

### Brackets Not Generating
- **Issue**: Bracket generation expects exactly 4, 8, or 16 participants
- **Solution**: Verify 8 participants were registered
- **Check**:
  ```sql
  SELECT COUNT(*) FROM tournament_participants
  WHERE tournament_id = 'tournament-id';
  ```

## Code Examples

### Check if Player Qualifies
```typescript
import { checkGrandPrixEligibility } from '@/lib/game/grand-prix';

const canEnterGrandPrix = await checkGrandPrixEligibility(battlerId, supabase);
```

### Auto-Trigger After Milestone
```typescript
import { autoTriggerGrandPrix } from '@/lib/game/grand-prix';

// After awarding milestone
const gpResult = await autoTriggerGrandPrix(battlerId, supabase);

if (gpResult?.success) {
  // Show celebration UI
  console.log(`🎉 Grand Prix created: ${gpResult.tournament.name}`);
}
```

### Manual Creation (Admin/Testing)
```typescript
import { createGrandPrix } from '@/lib/game/grand-prix';

const result = await createGrandPrix(battlerId, supabase);

if (result.success) {
  console.log(result.message);
  console.log(`Tournament ID: ${result.tournament.id}`);
}
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     ORIGIN SYSTEM                           │
│  Player achieves 5 milestones → origin_completed = true     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 AUTO-TRIGGER CHECK                          │
│  autoTriggerGrandPrix(battlerId, supabase)                 │
│  - Checks milestone count (must be exactly 5)              │
│  - Checks origin_completed flag                            │
│  - Checks hasCompletedGrandPrix() (one-time only)         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               GRAND PRIX CREATION                           │
│  createGrandPrix(battlerId, supabase)                      │
│  1. Get player info (league, origin type, rating)          │
│  2. Select 7 low-tier AI opponents                         │
│  3. Create tournament record (metadata.grand_prix = true)  │
│  4. Auto-register player + 7 AI battlers                   │
│  5. Generate brackets (8-person single elimination)        │
│  6. Schedule first round battles (21 days prep)            │
│  7. Send notification to player                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              STANDARD TOURNAMENT FLOW                       │
│  - Uses existing tournamentManager.ts                      │
│  - Player preps for battles                                │
│  - Battles simulate on schedule                            │
│  - Rounds advance automatically                            │
│  - Winner crowned, prizes distributed                      │
└─────────────────────────────────────────────────────────────┘
```

## Support

For issues or questions about the Grand Prix system:
1. Check this README
2. Review test suite: `scripts/test-grand-prix.ts`
3. Examine implementation: `lib/game/grand-prix.ts`
4. Check integration: `tournamentManager.ts`
