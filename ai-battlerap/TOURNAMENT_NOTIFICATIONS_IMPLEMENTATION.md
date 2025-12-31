# Tournament Notification Triggers Implementation

## Overview
Added 5 critical notification triggers to `lib/game/tournamentManager.ts` to ensure players receive updates about tournament progress.

## Changes Made

### 1. Helper Function Added (Line 11-20)
```typescript
function getRoundDisplayName(round: 'first_round' | 'quarterfinals' | 'semifinals' | 'finals'): string {
  const roundNames = {
    first_round: 'First Round',
    quarterfinals: 'Quarterfinals',
    semifinals: 'Semifinals',
    finals: 'Finals',
  };
  return roundNames[round];
}
```

### 2. Registration Success Notification (Line 193-200)
**Location**: `registerForTournament()` function, after successful participant creation
**Trigger**: When player successfully registers for tournament
```typescript
await supabase.rpc('create_notification', {
  p_battler_id: battlerId,
  p_type: 'tournament_update',
  p_title: 'Tournament Registration Confirmed',
  p_message: `You're registered for ${tournament.name}. Good luck!`,
  p_metadata: { tournament_id: tournamentId },
});
```

### 3. Seeding Complete Notification (Line 294-304)
**Location**: `generateTournamentBrackets()` function, inside seed assignment loop
**Trigger**: When brackets are generated and each player is seeded
```typescript
await supabase.rpc('create_notification', {
  p_battler_id: participants[i].battler_id,
  p_type: 'tournament_update',
  p_title: 'Brackets Released!',
  p_message: `You are seed #${i + 1} in ${tournament.name}. Check your first match.`,
  p_metadata: {
    tournament_id: tournamentId,
    seed_number: i + 1,
  },
});
```

### 4. Match Scheduled Notification (Line 479-496)
**Location**: `scheduleRoundBattles()` function, after creating each battle
**Trigger**: When tournament battles are scheduled for a round
```typescript
const roundName = getRoundDisplayName(round);
await Promise.all([
  supabase.rpc('create_notification', {
    p_battler_id: bracket.battler_1_id,
    p_type: 'tournament_update',
    p_title: 'Tournament Match Scheduled',
    p_message: `Your ${roundName} match is ready. Prepare for battle!`,
    p_metadata: { tournament_id: tournamentId, bracket_id: bracket.id },
  }),
  supabase.rpc('create_notification', {
    p_battler_id: bracket.battler_2_id,
    p_type: 'tournament_update',
    p_title: 'Tournament Match Scheduled',
    p_message: `Your ${roundName} match is ready. Prepare for battle!`,
    p_metadata: { tournament_id: tournamentId, bracket_id: bracket.id },
  }),
]);
```

### 5. Match Result Notification (Line 827-854)
**Location**: `updateBracketWithBattleResult()` function, after bracket is updated
**Trigger**: When a tournament battle completes and results are recorded
```typescript
const roundName = getRoundDisplayName(bracket.round);
const placementMap: Record<string, string> = {
  first_round: 'First Round',
  quarterfinals: 'Quarterfinalist',
  semifinals: 'Semifinalist',
  finals: 'Runner-Up',
};
const placement = placementMap[bracket.round];

await Promise.all([
  supabase.rpc('create_notification', {
    p_battler_id: winnerId,
    p_type: 'tournament_update',
    p_title: 'Tournament Victory!',
    p_message: `You won your ${roundName} match. Advancing to next round.`,
    p_metadata: { tournament_id: bracket.tournament_id, bracket_id: bracket.id },
  }),
  supabase.rpc('create_notification', {
    p_battler_id: loserId,
    p_type: 'tournament_update',
    p_title: 'Tournament Elimination',
    p_message: `You were eliminated in the ${roundName}. Final placement: ${placement}`,
    p_metadata: { tournament_id: bracket.tournament_id, placement },
  }),
]);
```

### 6. Tournament Complete Notification (Line 682-709)
**Location**: `completeTournament()` function, after prizes are distributed
**Trigger**: When tournament ends and champion is crowned
```typescript
if (tournament && runnerUpId) {
  const winnerPrize = tournament.prize_distribution.winner;
  const runnerUpPrize = tournament.prize_distribution.runner_up;

  await Promise.all([
    supabase.rpc('create_notification', {
      p_battler_id: winnerId,
      p_type: 'tournament_update',
      p_title: '🏆 TOURNAMENT CHAMPION!',
      p_message: `You won ${tournament.name}! Prize: $${winnerPrize.toLocaleString()}`,
      p_metadata: {
        tournament_id: tournamentId,
        prize_amount: winnerPrize,
      },
    }),
    supabase.rpc('create_notification', {
      p_battler_id: runnerUpId,
      p_type: 'tournament_update',
      p_title: 'Tournament Runner-Up',
      p_message: `You finished 2nd in ${tournament.name}! Prize: $${runnerUpPrize.toLocaleString()}`,
      p_metadata: {
        tournament_id: tournamentId,
        prize_amount: runnerUpPrize,
      },
    }),
  ]);
}
```

## Testing Checklist

### Manual Testing Steps
1. **Registration** (Easiest to test)
   - Navigate to tournaments page
   - Register for an open tournament
   - Check notification bell - should show "Tournament Registration Confirmed"

2. **Seeding Complete** (Requires tournament admin/cron)
   - Generate brackets for tournament with 8+ registrants
   - All participants should receive "Brackets Released!" notification with their seed number

3. **Match Scheduled** (Requires tournament admin/cron)
   - Schedule first round battles
   - Both battlers in each match should receive "Tournament Match Scheduled" notification

4. **Match Result** (Requires battle simulation)
   - Simulate a tournament battle
   - Winner receives "Tournament Victory!" notification
   - Loser receives "Tournament Elimination" notification with placement

5. **Tournament Complete** (Requires full tournament)
   - Complete all rounds of a tournament
   - Winner receives "🏆 TOURNAMENT CHAMPION!" with prize amount
   - Runner-up receives "Tournament Runner-Up" with prize amount

### Database Verification
Check notifications table after each action:
```sql
SELECT
  title,
  message,
  metadata,
  created_at
FROM notifications
WHERE battler_id = '<YOUR_BATTLER_ID>'
  AND type = 'tournament_update'
ORDER BY created_at DESC;
```

## Expected Behavior

### Notification Flow
1. Player registers → **Registration Confirmed** notification
2. Admin generates brackets → **Brackets Released** notification (with seed #)
3. Admin schedules matches → **Match Scheduled** notification (for each round)
4. Battle simulates → **Victory/Elimination** notification (based on result)
5. Tournament ends → **Champion/Runner-Up** notification (with prize)

### UI Integration
All notifications should:
- Appear in notification dropdown (bell icon)
- Show unread count badge
- Link to tournament page when clicked (using metadata.tournament_id)
- Mark as read when viewed
- Include contextual metadata for deep linking

## Files Modified
- `c:\git\battlerapuniversity\ai-battlerap\lib\game\tournamentManager.ts`

## Dependencies
- Notification system (migration: `20251130041000_add_notifications.sql`)
- `create_notification` RPC function (defined in notifications migration)
- Tournament system tables (tournaments, tournament_participants, tournament_brackets)

## Success Criteria
✅ Registration creates notification
✅ Seeding creates notification for each participant
✅ Match scheduling creates notification for both battlers
✅ Match results create notifications for winner and loser
✅ Tournament completion creates notifications for top 2
✅ Notifications appear in UI notification dropdown
✅ Clicking notification navigates to tournament page
✅ Metadata includes relevant tournament/bracket IDs

## Notes
- All notifications use `tournament_update` type for consistent filtering
- Metadata includes `tournament_id` for linking back to tournament detail page
- Prize amounts are formatted with `toLocaleString()` for readability
- Round names are human-readable (e.g., "First Round" not "first_round")
- Winner notifications are motivational, loser notifications are respectful
- Champion notification includes trophy emoji for emphasis
