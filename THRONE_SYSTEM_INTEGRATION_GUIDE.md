# Throne System - Integration Guide

Complete implementation guide for the Battle Rap University Throne System.

## Overview

The Throne System allows the top 3 battlers in each league to hold special "throne" positions with perks. Players can challenge throne holders within 100 ELO, who must respond within 48 hours or forfeit.

## Files Created

### Components
- `components/leagues/throne-display.tsx` - Visual throne display (3 positions)
- `components/leagues/throne-challenge-modal.tsx` - Challenge issuance modal
- `components/leagues/throne-challenges-widget.tsx` - Dashboard widget for pending challenges

### API Routes
- `app/api/leagues/[id]/thrones/route.ts` - GET throne positions for league
- `app/api/thrones/challenge/route.ts` - POST to issue throne challenge
- `app/api/thrones/challenges/route.ts` - GET user's pending challenges
- `app/api/admin/seed-thrones/route.ts` - POST to seed initial thrones

### Types & Utilities
- `lib/types/throne.ts` - TypeScript types for throne system
- `lib/thrones/seedThrones.ts` - Throne seeding and update utilities

### Example Pages
- `app/leagues/[id]/thrones/page.tsx` - Complete throne system page example

### Documentation
- `components/leagues/README.md` - Component usage guide

## Database Tables (Already Exist)

The throne system uses these tables from the `20251203200000_add_social_features.sql` migration:

```sql
throne_positions      -- Current throne holders (3 per league)
throne_history        -- Historical throne reigns
throne_challenges     -- Challenge records with 48h deadline
```

## Quick Start

### 1. Seed Initial Thrones

First, populate thrones with top 3 battlers per league:

```bash
curl -X POST http://localhost:3000/api/admin/seed-thrones \
  -H "Authorization: Bearer local-dev-secret-123"
```

Or for a specific league:

```bash
curl -X POST "http://localhost:3000/api/admin/seed-thrones?leagueId=LEAGUE_UUID" \
  -H "Authorization: Bearer local-dev-secret-123"
```

### 2. Add Throne Page to Navigation

Add link to your navigation:

```tsx
<a href={`/leagues/${leagueId}/thrones`}>
  THRONES 👑
</a>
```

### 3. Add Challenges Widget to Dashboard

In `components/battler/DashboardClient.tsx`:

```tsx
import ThroneChallengesWidget from '@/components/leagues/throne-challenges-widget';

// In render:
<ThroneChallengesWidget playerBattlerId={battler.id} />
```

### 4. Integrate with Battle System

When a throne challenge battle completes, update thrones:

In `app/api/internal/run-due-battles/route.ts` (or wherever battles complete):

```tsx
import { updateThronesAfterBattle } from '@/lib/thrones/seedThrones';

// After battle simulation completes:
const { dethroned } = await updateThronesAfterBattle(supabase, battleId);

if (dethroned) {
  // Generate special media coverage for dethronement
  // Award "Dethroned" badge to former holder
  // Award throne-specific badge to new holder
}
```

## Feature Checklist

### Core Features (Implemented)
- [x] Throne position display (3 thrones per league)
- [x] Challenge eligibility check (within 100 ELO)
- [x] Challenge issuance with 48h deadline
- [x] Pending challenges widget
- [x] Throne holder info (name, rating, defenses)
- [x] Throne perks display (+media, +payout)
- [x] Player's own thrones highlighted
- [x] Vacant throne handling
- [x] Seeding utility for initial thrones
- [x] Battle integration utility

### Future Enhancements (Not Implemented)
- [ ] Accept/Decline challenge UI
- [ ] Auto-forfeit after 48h deadline
- [ ] Auto-accept for AI throne holders
- [ ] Throne defense badges (Iron Throne, Dynasty)
- [ ] Throne-specific media articles
- [ ] Throne history viewer
- [ ] Notification system for challenges
- [ ] Challenge counter-offers

## API Usage Examples

### Fetch Throne Positions

```typescript
const response = await fetch(`/api/leagues/${leagueId}/thrones`);
const { thrones } = await response.json();

// thrones = [
//   { position: 1, battler_id: "...", battlerName: "...", defense_count: 3 },
//   { position: 2, battler_id: "...", battlerName: "...", defense_count: 1 },
//   { position: 3, battler_id: null }  // Vacant
// ]
```

### Issue Challenge

```typescript
const response = await fetch('/api/thrones/challenge', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    leagueId: 'league-uuid',
    targetPosition: 1,
    throneHolderBattlerId: 'holder-uuid',
    challengerBattlerId: 'player-uuid',
  }),
});

const { success, challenge } = await response.json();
```

### Fetch Pending Challenges

```typescript
const response = await fetch('/api/thrones/challenges');
const { incomingChallenges, outgoingChallenges, totalPending } = await response.json();

// incomingChallenges = challenges where user is throne holder (must respond)
// outgoingChallenges = challenges where user is challenger (waiting)
```

## Component Integration

### Basic Throne Display

```tsx
import ThroneDisplay from '@/components/leagues/throne-display';

export default function LeaguePage() {
  const { thrones, playerBattlerId, playerRating, league } = await fetchData();

  return (
    <ThroneDisplay
      leagueId={league.id}
      leagueName={league.name}
      thrones={thrones}
      playerBattlerId={playerBattlerId}
      playerRating={playerRating}
    />
  );
}
```

### Dashboard Widget

```tsx
import ThroneChallengesWidget from '@/components/leagues/throne-challenges-widget';

<ThroneChallengesWidget playerBattlerId={battler.id} />
```

## Battle System Integration

### 1. Mark Throne Challenge Battles

When creating a battle from an accepted throne challenge:

```sql
-- Add flag to battles table (migration needed)
ALTER TABLE battles ADD COLUMN is_throne_challenge BOOLEAN DEFAULT false;
ALTER TABLE battles ADD COLUMN throne_challenge_id UUID REFERENCES throne_challenges(id);

-- When creating battle:
INSERT INTO battles (
  ...,
  is_throne_challenge,
  throne_challenge_id
) VALUES (
  ...,
  true,
  'challenge-uuid'
);
```

### 2. Update Thrones After Battle

```typescript
import { updateThronesAfterBattle } from '@/lib/thrones/seedThrones';

// In battle completion logic:
if (battle.is_throne_challenge) {
  const { success, dethroned } = await updateThronesAfterBattle(
    supabase,
    battle.id
  );

  if (dethroned) {
    // Trigger special events:
    // 1. Media article about dethronement
    // 2. Badge awards
    // 3. Relationship intensity boost
    // 4. Notification to both battlers
  }
}
```

### 3. Auto-Forfeit Expired Challenges (Cron Job)

Create new API route `/api/internal/check-throne-deadlines`:

```typescript
export async function POST(request: Request) {
  // Verify internal secret
  if (!verifyInternalSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  // Find expired challenges
  const { data: expiredChallenges } = await supabase
    .from('throne_challenges')
    .select('*')
    .eq('status', 'pending')
    .lt('deadline', new Date().toISOString());

  for (const challenge of expiredChallenges || []) {
    // Forfeit throne to challenger
    await supabase
      .from('throne_positions')
      .update({
        battler_id: challenge.challenger_battler_id,
        started_at: new Date().toISOString(),
        defense_count: 0,
      })
      .eq('league_id', challenge.league_id)
      .eq('position', challenge.target_position);

    // Update challenge status
    await supabase
      .from('throne_challenges')
      .update({
        status: 'forfeited',
        result: 'challenger_won',
      })
      .eq('id', challenge.id);

    // Create throne_history records
    // Generate media coverage
    // Send notifications
  }

  return NextResponse.json({ processed: expiredChallenges?.length || 0 });
}
```

Add to Vercel cron config:

```json
{
  "crons": [
    {
      "path": "/api/internal/check-throne-deadlines",
      "schedule": "0 * * * *"
    }
  ]
}
```

## Badge Integration

### Throne-Related Badges

Add to `lib/game/badges.ts`:

```typescript
{
  id: 'iron_throne',
  name: 'Iron Throne',
  description: 'Defended a throne position 3 times',
  category: 'throne',
  rarity: 'rare',
  effects: { reputation: 5 },
},
{
  id: 'dynasty',
  name: 'Dynasty',
  description: 'Defended a throne position 5 times',
  category: 'throne',
  rarity: 'legendary',
  effects: { reputation: 10, mediaBonus: 0.05 },
},
{
  id: 'dethroned',
  name: 'Dethroned',
  description: 'Lost a throne position in battle',
  category: 'throne',
  rarity: 'common',
  effects: { reputation: -3 },
},
{
  id: 'throne_taker',
  name: 'Throne Taker',
  description: 'Won a throne challenge',
  category: 'throne',
  rarity: 'rare',
  effects: { reputation: 5 },
},
```

Award badges in `updateThronesAfterBattle`:

```typescript
if (dethroned) {
  // Award "Throne Taker" to challenger
  await awardBadge(supabase, challenge.challenger_battler_id, 'throne_taker');

  // Award "Dethroned" to former holder
  await awardBadge(supabase, challenge.throne_holder_battler_id, 'dethroned');
}

// Check for defense streak badges
const { data: position } = await supabase
  .from('throne_positions')
  .select('defense_count')
  .eq('battler_id', winnerId)
  .single();

if (position.defense_count === 3) {
  await awardBadge(supabase, winnerId, 'iron_throne');
} else if (position.defense_count === 5) {
  await awardBadge(supabase, winnerId, 'dynasty');
}
```

## Media Integration

### Throne Challenge Articles

Generate special articles for throne events:

```typescript
import { generateBattleRecap } from '@/lib/services/newsGenerator';

// After throne battle completes:
const prompt = dethroned
  ? `Write a dramatic article about ${challengerName} dethroning ${holderName}
     as the ${throneTitle} of ${leagueName}. They held the throne for
     ${defense_count} defenses. This is a MAJOR upset in the scene.`
  : `Write an article about ${holderName} successfully defending their
     ${throneTitle} throne in ${leagueName} against ${challengerName}.
     This is their ${defense_count + 1}th successful defense.`;

await generateBattleRecap(supabase, battleId, prompt);
```

## Notification Integration

### Notify Throne Holder of Challenge

When challenge is issued:

```typescript
// In POST /api/thrones/challenge after creating challenge:
await supabase.from('notifications').insert({
  user_id: throneHolderUserId,
  type: 'throne_challenge',
  title: 'Throne Challenge!',
  message: `${challengerName} has challenged your ${throneTitle} position! You have 48 hours to respond.`,
  link: `/thrones/challenges/${challenge.id}`,
  created_at: new Date().toISOString(),
});
```

## Testing

### Manual Testing Steps

1. **Seed Thrones**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/seed-thrones \
     -H "Authorization: Bearer local-dev-secret-123"
   ```

2. **Navigate to League Thrones Page**:
   ```
   http://localhost:3000/leagues/LEAGUE_UUID/thrones
   ```

3. **Issue a Challenge**:
   - Find a throne within 100 ELO
   - Click "CHALLENGE" button
   - Verify modal shows correct info
   - Submit challenge
   - Verify challenge appears in widget

4. **Check Pending Challenges**:
   ```bash
   curl http://localhost:3000/api/thrones/challenges
   ```

5. **Simulate Throne Battle**:
   - Accept the challenge (manual DB update for now)
   - Create battle linked to challenge
   - Run battle simulation
   - Verify thrones update correctly

### Edge Cases to Test

- [ ] Challenge with exactly 100 ELO difference (should allow)
- [ ] Challenge with 101 ELO difference (should block)
- [ ] Multiple challenges to same throne (second should fail)
- [ ] Challenging own throne (should block)
- [ ] Vacant throne challenge (should fail)
- [ ] Deadline expiration (should auto-forfeit)
- [ ] Defense count increment on successful defense
- [ ] Throne history recording on dethronement

## Performance Considerations

### Database Indexes

Ensure these indexes exist (already in migration):

```sql
CREATE INDEX idx_throne_positions_league ON throne_positions(league_id);
CREATE INDEX idx_throne_positions_battler ON throne_positions(battler_id);
CREATE INDEX idx_throne_challenges_league ON throne_challenges(league_id);
CREATE INDEX idx_throne_challenges_status ON throne_challenges(status);
CREATE INDEX idx_throne_history_battler ON throne_history(battler_id);
```

### Caching Strategy

For high-traffic leagues, consider caching throne positions:

```typescript
// Redis cache example
const cacheKey = `thrones:${leagueId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const thrones = await fetchThronesFromDB(leagueId);
await redis.setex(cacheKey, 300, JSON.stringify(thrones)); // 5 min TTL

return thrones;
```

## Security Considerations

1. **Challenge Validation**: Always verify ELO difference server-side
2. **User Ownership**: Verify challenger belongs to authenticated user
3. **Rate Limiting**: Prevent spam challenges (max 1 per user per league per day)
4. **Deadline Enforcement**: Auto-forfeit expired challenges via cron

## Next Steps

1. **Implement Accept/Decline UI**:
   - Create modal for throne holders to respond to challenges
   - Add "ACCEPT" / "DECLINE" buttons in challenges widget

2. **Add AI Auto-Accept**:
   - Detect when throne holder is AI
   - Auto-accept challenges within 1 hour
   - Schedule battle immediately

3. **Build Throne History Page**:
   - Show all past throne reigns
   - Display defense streaks
   - Show dethronement battles

4. **Enhance Media Coverage**:
   - Special templates for throne battles
   - Highlight defense streaks
   - Track "longest reign" records

5. **Add Throne Stats to Rankings**:
   - Show throne emoji next to throne holders in rankings
   - Display "Current Throne Holder" badge
   - Track total days on throne

## Support

For issues or questions:
1. Check `components/leagues/README.md` for component usage
2. Review API route comments for endpoint details
3. Verify database schema in migration file
4. Test with example page at `app/leagues/[id]/thrones/page.tsx`
