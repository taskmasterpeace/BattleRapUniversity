# Notification System Quick Start Guide

## For Developers: How to Create Notifications

### 1. Import the Service
```typescript
import { notifyBattleOffer, notifyBattleComplete, notifyLifeEvent } from '@/lib/services/notificationService';
```

### 2. Create a Notification

#### Battle Offer
```typescript
await notifyBattleOffer(
  supabase,
  battlerId,      // Player's battler ID
  battleId,       // Battle ID
  opponentName,   // Opponent's name
  leagueName      // League name
);
```

#### Battle Complete
```typescript
await notifyBattleComplete(
  supabase,
  battlerId,      // Player's battler ID
  battleId,       // Battle ID
  opponentName,   // Opponent's name
  won,            // true if player won
  verdict         // "2-1 Victory", "3-0 Loss", etc.
);
```

#### Life Event
```typescript
await notifyLifeEvent(
  supabase,
  battlerId,         // Player's battler ID
  eventId,           // Life event ID
  eventTitle,        // Event title
  eventDescription   // Event description
);
```

#### Badge Earned
```typescript
await notifyBadgeEarned(
  supabase,
  battlerId,         // Player's battler ID
  ['Wordsmith', 'Punchline King']  // Array of badge names
);
```

#### Level Up
```typescript
await notifyLevelUp(
  supabase,
  battlerId,         // Player's battler ID
  newLevel,          // New level number
  skillPointsEarned  // Skill points gained
);
```

#### Tournament Update
```typescript
await notifyTournamentUpdate(
  supabase,
  battlerId,         // Player's battler ID
  tournamentId,      // Tournament ID
  tournamentName,    // Tournament name
  'bracket_ready'    // Type: bracket_ready, match_scheduled, round_complete, champion, eliminated
);
```

#### Custom System Message
```typescript
await notifySystemMessage(
  supabase,
  battlerId,         // Player's battler ID
  'Maintenance',     // Title
  'The game will be offline for 1 hour starting at midnight.',  // Message
  { duration: '1h' } // Optional metadata
);
```

---

## For Frontend: Displaying Notifications

### Show Dropdown (Already Integrated)
The `NotificationDropdown` component is already in the dashboard header. No additional work needed.

### Show Toast Notification
```typescript
// In any client component
if (typeof window !== 'undefined' && window.addNotificationToast) {
  window.addNotificationToast({
    id: 'unique-id',
    type: 'battle_complete',
    title: 'Victory!',
    message: 'You defeated Tru Foe 2-1',
    metadata: { battleId: 'xxx', won: true },
    is_read: false,
    created_at: new Date().toISOString(),
    battler_id: 'xxx',
    read_at: null
  });
}
```

### Link to Notifications Page
```typescript
<Link href="/notifications">View All Notifications</Link>
```

---

## Testing the System

### 1. Run Migration
```bash
cd ai-battlerap
npx supabase db reset  # Resets local DB and runs all migrations
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Generate Test Notifications

#### Create Battle Offers (triggers notifications)
```bash
curl -X POST http://localhost:3000/api/internal/generate-battle-offers \
  -H "Authorization: Bearer local-dev-secret-123"
```

#### Simulate Battle (triggers completion notification)
1. Accept a battle offer
2. Fill out prep calendar
3. Click "SIMULATE NOW (DEV)" button on dashboard
4. Check notifications after simulation completes

#### Trigger Life Event
1. Win 3 battles in a row
2. Or choke in a battle
3. Check notifications after battle completes

### 4. Check Notifications
1. **Bell Icon**: Visit `/dashboard` and check the bell icon in header
2. **Dropdown**: Click bell to see recent notifications
3. **Full Page**: Visit `/notifications` to see all notifications
4. **Mark as Read**: Click a notification to mark it as read
5. **Unread Count**: Verify count decreases when marked read

---

## API Usage

### Fetch Notifications
```typescript
const response = await fetch('/api/notifications?limit=10&unreadOnly=true');
const data = await response.json();
console.log(data.notifications); // Array of notifications
console.log(data.unreadCount);   // Number of unread
```

### Mark One as Read
```typescript
await fetch('/api/notifications/mark-read', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ notificationId: 'xxx' })
});
```

### Mark All as Read
```typescript
await fetch('/api/notifications/mark-all-read', {
  method: 'POST'
});
```

---

## Common Patterns

### Pattern 1: Notify After Database Insert
```typescript
// After creating a record
const { data: newRecord, error } = await supabase
  .from('some_table')
  .insert({ ... })
  .select('id')
  .single();

if (!error && newRecord) {
  // Create notification
  await notifySystemMessage(
    supabase,
    battlerId,
    'New Record Created',
    'Your record has been created successfully',
    { recordId: newRecord.id }
  );
}
```

### Pattern 2: Conditional Notifications
```typescript
// Only notify if condition met
if (playerRating > 2000) {
  await notifySystemMessage(
    supabase,
    battlerId,
    'Elite Status',
    'Congratulations! You\'ve reached Elite tier (2000+ rating)',
    { newRating: playerRating }
  );
}
```

### Pattern 3: Batch Notifications
```typescript
// Notify multiple players
const playerIds = ['id1', 'id2', 'id3'];
for (const playerId of playerIds) {
  await notifyTournamentUpdate(
    supabase,
    playerId,
    tournamentId,
    'Summer Championship',
    'bracket_ready'
  );
}
```

---

## Notification Types Reference

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `battle_offer` | 🥊 | Orange | New battle offer received |
| `battle_complete` | 🏆 | Green/Red | Battle finished (win/loss) |
| `life_event` | 📰 | Yellow | Life event triggered |
| `badge_earned` | 🏅 | Purple | New badges unlocked |
| `level_up` | ⬆️ | Gold | Level progression |
| `tournament_update` | 🎯 | Blue | Tournament events |
| `system_message` | 📢 | Gray | Admin announcements |

---

## Troubleshooting

### Notifications Not Appearing
1. Check if migration ran: `SELECT COUNT(*) FROM notifications;`
2. Check if RLS allows access: Verify user is logged in
3. Check browser console for API errors
4. Verify battler_id is correct

### Unread Count Incorrect
1. Refresh page (auto-refresh every 30s)
2. Check database: `SELECT COUNT(*) FROM notifications WHERE battler_id = 'xxx' AND is_read = false;`
3. Clear browser cache

### Links Not Working
1. Verify metadata contains correct IDs
2. Check `getNotificationLink()` function in components
3. Ensure target pages exist

### Performance Issues
1. Check if too many old notifications: Run cleanup function
2. Verify indexes exist: `\d notifications` in psql
3. Limit query results with `limit` parameter

---

## Best Practices

### DO ✅
- Always wrap notification calls in try-catch
- Use descriptive titles and messages
- Include relevant metadata for deep linking
- Test notification creation after code changes
- Clean up old notifications periodically

### DON'T ❌
- Don't create duplicate notifications for same event
- Don't block main operations if notification fails
- Don't store large data in metadata (use IDs instead)
- Don't create notifications for AI battlers
- Don't forget to handle errors gracefully

---

## Quick Command Reference

```bash
# Reset database (local dev)
npm run supabase:reset

# Check migration status
npx supabase migration list

# View notifications table
npx supabase db psql -c "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;"

# Count unread notifications
npx supabase db psql -c "SELECT COUNT(*) FROM notifications WHERE is_read = false;"

# Manual cleanup
npx supabase db psql -c "SELECT cleanup_old_notifications();"
```

---

## Support

For questions or issues:
1. Check `NOTIFICATION_SYSTEM_IMPLEMENTATION.md` for detailed docs
2. Review code comments in `lib/services/notificationService.ts`
3. Inspect browser Network tab for API errors
4. Check Supabase logs for database errors
