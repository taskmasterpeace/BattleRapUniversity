# Grand Prix Quick Reference

## What Is It?
Auto-generated 8-person tournament when player completes 5 origin milestones. One-time event, serves as "graduation" from origin story.

## Files
- **Core**: `lib/game/grand-prix.ts`
- **API**: `app/api/internal/grand-prix/create/route.ts`
- **Test**: `scripts/test-grand-prix.ts`
- **Docs**: `lib/game/GRAND_PRIX_README.md`

## Key Functions

### `checkGrandPrixEligibility(battlerId, supabase)`
Returns `true` if player has `origin_completed = true`

### `hasCompletedGrandPrix(battlerId, supabase)`
Returns `true` if player already participated in a Grand Prix

### `getGrandPrixOpponents(playerId, supabase, count)`
Returns array of low-tier AI battlers (unfaced opponents prioritized)

### `createGrandPrix(playerId, supabase)`
Main function - creates tournament, registers participants, generates brackets
Returns: `{ success, tournament?, error?, message? }`

### `autoTriggerGrandPrix(battlerId, supabase)` ⭐
**Integration point** - call after milestone awards
Returns `null` if not ready, otherwise creates Grand Prix

## Integration (Required)

Add to milestone award logic:

```typescript
import { autoTriggerGrandPrix } from '@/lib/game/grand-prix';

async function awardMilestone(battlerId: string, milestoneKey: string) {
  // ... existing milestone logic ...

  // Check for Grand Prix trigger
  const gpResult = await autoTriggerGrandPrix(battlerId, supabase);

  if (gpResult?.success) {
    console.log(`🎊 Grand Prix created: ${gpResult.tournament.name}`);
  }
}
```

## Tournament Config

| Setting | Value |
|---------|-------|
| Participants | 8 (1 player + 7 AI) |
| Format | Single elimination |
| Tier | Low only (rating < 1400) |
| Prize Pool | $15,000 |
| Winner Prize | $7,500 (50%) |
| Prep Time | 21 days |
| Rounds | 3 (Quarters → Semis → Finals) |

## Testing

### Quick Test
```bash
npx tsx scripts/test-grand-prix.ts
```

### Manual API Test
```bash
# Check eligibility
curl "http://localhost:3000/api/internal/grand-prix/create?battler_id=PLAYER_ID"

# Create Grand Prix
curl -X POST http://localhost:3000/api/internal/grand-prix/create \
  -H "Content-Type: application/json" \
  -d '{"battler_id": "PLAYER_ID"}'
```

## Troubleshooting

**Grand Prix not creating?**
1. Check milestone count: `SELECT COUNT(*) FROM origin_milestones WHERE battler_id = 'X'` (need 5)
2. Check flag: `SELECT origin_completed FROM battlers WHERE id = 'X'` (need `true`)
3. Check history: `SELECT * FROM tournament_participants tp JOIN tournaments t ON t.id = tp.tournament_id WHERE tp.battler_id = 'X' AND t.metadata->>'grand_prix' = 'true'` (need 0 rows)

**Not enough opponents?**
Check: `SELECT COUNT(*) FROM battlers b JOIN rankings r ON r.battler_id = b.id WHERE b.is_ai = true AND b.tier = 'low' AND r.rating < 1400` (need >= 7)

## Database Queries

### Find Grand Prix tournaments
```sql
SELECT * FROM tournaments
WHERE metadata->>'grand_prix' = 'true';
```

### Check player participation
```sql
SELECT tp.*, t.name, t.status
FROM tournament_participants tp
JOIN tournaments t ON t.id = tp.tournament_id
WHERE tp.battler_id = 'PLAYER_ID'
  AND t.metadata->>'grand_prix' = 'true';
```

### Get tournament brackets
```sql
SELECT b.*,
  b1.stage_name as battler_1_name,
  b2.stage_name as battler_2_name
FROM tournament_brackets b
JOIN battlers b1 ON b1.id = b.battler_1_id
JOIN battlers b2 ON b2.id = b.battler_2_id
WHERE b.tournament_id = 'TOURNAMENT_ID'
ORDER BY b.round, b.match_number;
```

## Notification Types

All use `create_notification` RPC with `type: 'tournament_update'`:

1. **Creation**: "Grand Prix Tournament Created!"
2. **Brackets**: "Brackets Released!"
3. **Match Scheduled**: "Tournament Match Scheduled"
4. **Victory**: "Tournament Victory!"
5. **Elimination**: "Tournament Elimination"
6. **Champion**: "TOURNAMENT CHAMPION!"

## Design Notes

- **Why auto-generate?** Guarantees player doesn't miss this milestone event
- **Why one-time?** Prevents exploitation, makes it special
- **Why low-tier?** Fair matchmaking for emerging player
- **Why 8 participants?** 3 rounds = significant but achievable
- **Why 21 days?** Builds anticipation, allows celebration

## Next Steps After Implementation

1. Integrate `autoTriggerGrandPrix()` into milestone system
2. Test with real player progression
3. Monitor completion rates
4. Consider enhancements (special badges, media coverage)

---

**Full Documentation**: See `GRAND_PRIX_README.md` and `GRAND_PRIX_IMPLEMENTATION_SUMMARY.md`
