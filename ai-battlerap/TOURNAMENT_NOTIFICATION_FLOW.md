# Tournament Notification Flow

## Complete Tournament Lifecycle with Notifications

```
┌─────────────────────────────────────────────────────────────┐
│                    TOURNAMENT LIFECYCLE                     │
└─────────────────────────────────────────────────────────────┘

1. REGISTRATION PHASE
   ├── Player clicks "Register for Tournament"
   ├── POST /api/tournaments/[id]/register
   ├── registerForTournament() executes
   ├── Participant inserted into database
   └── 🔔 NOTIFICATION #1: "Tournament Registration Confirmed"
       ├── Title: "Tournament Registration Confirmed"
       ├── Message: "You're registered for [Tournament Name]. Good luck!"
       └── Metadata: { tournament_id }

2. SEEDING PHASE (Admin/Cron Action)
   ├── Admin clicks "Generate Brackets"
   ├── generateTournamentBrackets() executes
   ├── Participants seeded by rating (highest = #1 seed)
   └── 🔔 NOTIFICATION #2: "Brackets Released!" (x N participants)
       ├── Title: "Brackets Released!"
       ├── Message: "You are seed #[X] in [Tournament Name]. Check your first match."
       └── Metadata: { tournament_id, seed_number }

3. MATCH SCHEDULING (Admin/Cron Action)
   ├── System schedules round battles
   ├── scheduleRoundBattles('first_round') executes
   ├── Battle records created with scheduled_at dates
   └── 🔔 NOTIFICATION #3: "Tournament Match Scheduled" (x 2 per match)
       ├── Title: "Tournament Match Scheduled"
       ├── Message: "Your [Round Name] match is ready. Prepare for battle!"
       └── Metadata: { tournament_id, bracket_id }
       └── Recipients: Both battlers in each match

4. PREP PHASE
   ├── Players navigate to battle prep page
   ├── Players fill out prep calendar
   └── (No notifications during this phase)

5. BATTLE SIMULATION
   ├── Cron runs run-due-battles
   ├── Battle simulates with segment scoring
   ├── Winner determined
   ├── updateBracketWithBattleResult() executes
   └── 🔔 NOTIFICATION #4: Match Result (x 2 per match)
       ├── WINNER receives:
       │   ├── Title: "Tournament Victory!"
       │   ├── Message: "You won your [Round Name] match. Advancing to next round."
       │   └── Metadata: { tournament_id, bracket_id }
       └── LOSER receives:
           ├── Title: "Tournament Elimination"
           ├── Message: "You were eliminated in the [Round Name]. Final placement: [Placement]"
           └── Metadata: { tournament_id, placement }

6. ROUND ADVANCEMENT (Automatic)
   ├── advanceTournamentRound() checks if all matches complete
   ├── Creates brackets for next round
   ├── Schedules next round battles
   └── 🔔 NOTIFICATION #3 repeats for next round
       └── (Match Scheduled notifications for new round)

7. FINALS COMPLETION
   ├── Finals battle simulates
   ├── Winner determined
   ├── completeTournament() executes
   ├── Prizes distributed
   └── 🔔 NOTIFICATION #5: Tournament Complete (x 2)
       ├── WINNER receives:
       │   ├── Title: "🏆 TOURNAMENT CHAMPION!"
       │   ├── Message: "You won [Tournament Name]! Prize: $[Amount]"
       │   └── Metadata: { tournament_id, prize_amount }
       └── RUNNER-UP receives:
           ├── Title: "Tournament Runner-Up"
           ├── Message: "You finished 2nd in [Tournament Name]! Prize: $[Amount]"
           └── Metadata: { tournament_id, prize_amount }

8. ACHIEVEMENTS AWARDED
   ├── Tournament achievements calculated
   ├── Winner, Runner-Up, Upset achievements
   └── (Achievement notifications handled separately - not tournament_update type)
```

## Notification Count by Tournament Size

### 8-Player Tournament
```
Registration:       8 notifications  (1 per player)
Seeding:            8 notifications  (1 per player)
First Round:        8 notifications  (2 per match × 4 matches)
Match Results:      8 notifications  (2 per match × 4 matches)
Semifinals:         4 notifications  (2 per match × 2 matches)
Semi Results:       4 notifications  (2 per match × 2 matches)
Finals:             2 notifications  (2 per match × 1 match)
Finals Result:      2 notifications  (2 per match × 1 match)
Tournament End:     2 notifications  (winner + runner-up)
─────────────────────────────────────────────────────
TOTAL:             46 notifications
```

### 16-Player Tournament
```
Registration:      16 notifications  (1 per player)
Seeding:           16 notifications  (1 per player)
First Round:       16 notifications  (2 per match × 8 matches)
Match Results:     16 notifications  (2 per match × 8 matches)
Quarterfinals:      8 notifications  (2 per match × 4 matches)
Quarter Results:    8 notifications  (2 per match × 4 matches)
Semifinals:         4 notifications  (2 per match × 2 matches)
Semi Results:       4 notifications  (2 per match × 2 matches)
Finals:             2 notifications  (2 per match × 1 match)
Finals Result:      2 notifications  (2 per match × 1 match)
Tournament End:     2 notifications  (winner + runner-up)
─────────────────────────────────────────────────────
TOTAL:             94 notifications
```

## Notification Metadata Usage

### Linking in UI
```typescript
// When user clicks notification, navigate based on metadata:
if (notification.type === 'tournament_update') {
  router.push(`/tournaments/${notification.metadata.tournament_id}`);

  // Optional: scroll to specific section based on notification
  if (notification.metadata.bracket_id) {
    // Scroll to bracket view
  }
  if (notification.metadata.seed_number) {
    // Scroll to seeding chart
  }
}
```

### Filtering Notifications
```typescript
// Get all tournament notifications
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('battler_id', battlerId)
  .eq('type', 'tournament_update')
  .order('created_at', { ascending: false });

// Get notifications for specific tournament
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('battler_id', battlerId)
  .eq('type', 'tournament_update')
  .contains('metadata', { tournament_id: 'some-uuid' });
```

## Error Handling

All notification calls use non-blocking fire-and-forget:
```typescript
// Notifications don't block tournament operations
await supabase.rpc('create_notification', { ... });
// Even if notification fails, tournament continues

// If notification is critical, check result:
const { error } = await supabase.rpc('create_notification', { ... });
if (error) {
  console.error('Notification failed:', error);
  // Log but don't throw - tournament should continue
}
```

## Database Impact

### Storage
- Average notification: ~200 bytes
- 16-player tournament: 94 notifications = ~18.8 KB
- 100 tournaments: ~1.88 MB (negligible)

### Cleanup
- Old read notifications auto-deleted (keep last 100 per player)
- Implemented in: `cleanup_old_notifications()` function
- Recommended: Run weekly via cron

## Testing Scenarios

### Scenario 1: Happy Path (8-player tournament)
1. 8 players register → 8 notifications
2. Admin generates brackets → 8 notifications
3. Admin schedules first round → 8 notifications
4. 4 battles simulate → 8 notifications (4 winners, 4 losers)
5. Admin schedules semifinals → 4 notifications
6. 2 battles simulate → 4 notifications (2 winners, 2 losers)
7. Admin schedules finals → 2 notifications
8. Finals simulates → 2 notifications (1 winner, 1 loser)
9. Tournament completes → 2 notifications (champion, runner-up)

**Total: 46 notifications**

### Scenario 2: Player-Only Notifications
From single player's perspective:
1. Register → 1 notification
2. Brackets released → 1 notification
3. First match scheduled → 1 notification
4. Win first match → 1 notification
5. Semifinals scheduled → 1 notification
6. Win semifinals → 1 notification
7. Finals scheduled → 1 notification
8. Win finals → 2 notifications (victory + champion)

**Total: 9 notifications to win tournament**

### Scenario 3: Early Elimination
1. Register → 1 notification
2. Brackets released → 1 notification
3. First match scheduled → 1 notification
4. Lose first match → 1 notification (elimination)

**Total: 4 notifications for first-round exit**
