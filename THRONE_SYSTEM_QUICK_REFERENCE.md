# Throne System - Quick Reference Card

## Component Props

### ThroneDisplay
```tsx
<ThroneDisplay
  leagueId="uuid"
  leagueName="Small Room Circuit"
  thrones={[...]}           // ThronePosition[]
  playerBattlerId="uuid"
  playerRating={1350}       // For eligibility check
/>
```

### ThroneChallengeModal
```tsx
<ThroneChallengeModal
  isOpen={boolean}
  onClose={() => void}
  throne={...}              // ThronePosition
  leagueId="uuid"
  leagueName="Main Stage Arena"
  playerBattlerId="uuid"
/>
```

### ThroneChallengesWidget
```tsx
<ThroneChallengesWidget playerBattlerId="uuid" />
```

---

## API Endpoints

### GET /api/leagues/[id]/thrones
Fetch throne positions for a league.

**Response:**
```json
{
  "thrones": [
    {
      "id": "uuid",
      "league_id": "uuid",
      "position": 1,
      "battler_id": "uuid",
      "started_at": "2025-01-01T00:00:00Z",
      "defense_count": 3,
      "battlerName": "Tru Foe",
      "battlerRating": 1450
    }
  ]
}
```

---

### POST /api/thrones/challenge
Issue a throne challenge.

**Request:**
```json
{
  "leagueId": "uuid",
  "targetPosition": 1,
  "throneHolderBattlerId": "uuid",
  "challengerBattlerId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "challenge": { ... },
  "message": "Throne challenge issued successfully..."
}
```

---

### GET /api/thrones/challenges
Fetch user's pending challenges.

**Response:**
```json
{
  "incomingChallenges": [ ... ],  // User is throne holder
  "outgoingChallenges": [ ... ],  // User is challenger
  "totalPending": 2
}
```

---

### POST /api/admin/seed-thrones
Seed initial thrones (requires auth).

**Header:**
```
Authorization: Bearer <INTERNAL_API_SECRET>
```

**Query Params:**
- `leagueId` (optional): Seed specific league

**Examples:**
```bash
# Seed all leagues
curl -X POST http://localhost:3000/api/admin/seed-thrones \
  -H "Authorization: Bearer local-dev-secret-123"

# Seed specific league
curl -X POST "http://localhost:3000/api/admin/seed-thrones?leagueId=UUID" \
  -H "Authorization: Bearer local-dev-secret-123"
```

---

## Throne Positions

| Position | Title       | Icon | Media | Payout  | Special Perk          |
|----------|-------------|------|-------|---------|----------------------|
| #1       | King/Queen  | 👑   | +15%  | +20%    | Special badge        |
| #2       | Challenger  | ⚔️   | +10%  | +10%    | -                    |
| #3       | Gatekeeper  | 🛡️   | +5%   | Std     | Face rising stars    |

---

## Challenge Rules

- **Eligibility**: Within 100 ELO of throne holder
- **Deadline**: Throne holder has 48 hours to respond
- **Forfeit**: No response = throne forfeited to challenger
- **Frequency**: 1 challenge per user per league per day (rate limit)

---

## Defense Badges

| Badge       | Requirement       | Rarity    | Effects          |
|-------------|-------------------|-----------|------------------|
| Iron Throne | 3 defenses        | Rare      | +5 reputation    |
| Dynasty     | 5 defenses        | Legendary | +10 rep, +5% media |
| Dethroned   | Lost throne       | Common    | -3 reputation    |
| Throne Taker| Won challenge     | Rare      | +5 reputation    |

---

## Database Tables

### throne_positions
Current throne holders (3 per league).

```sql
id, league_id, position (1-3), battler_id, started_at, defense_count
UNIQUE (league_id, position)
```

### throne_challenges
Challenge records with deadlines.

```sql
id, league_id, challenger_battler_id, throne_holder_battler_id,
target_position (1-3), status, deadline, battle_id, result, created_at

status: 'pending' | 'accepted' | 'forfeited' | 'completed'
result: 'challenger_won' | 'defender_won' | 'forfeited'
```

### throne_history
Historical throne reigns.

```sql
id, league_id, position, battler_id, started_at, ended_at,
defense_count, lost_to_battler_id, lost_battle_id, created_at
```

---

## Utility Functions

### seedThronesForLeague
```typescript
import { seedThronesForLeague } from '@/lib/thrones/seedThrones';

const result = await seedThronesForLeague(supabase, leagueId);
// Returns: { success: boolean, thrones?: [...], error?: string }
```

### seedAllThrones
```typescript
import { seedAllThrones } from '@/lib/thrones/seedThrones';

const result = await seedAllThrones(supabase);
// Returns: { success: boolean, results: Record<string, SeedThronesResult> }
```

### updateThronesAfterBattle
```typescript
import { updateThronesAfterBattle } from '@/lib/thrones/seedThrones';

const result = await updateThronesAfterBattle(supabase, battleId);
// Returns: { success: boolean, dethroned?: boolean, error?: string }
```

---

## TypeScript Types

```typescript
import { ThronePosition, ThroneChallenge, ThroneHistory } from '@/lib/types/throne';

interface ThronePosition {
  id: string;
  league_id: string;
  position: 1 | 2 | 3;
  battler_id: string | null;
  started_at: string;
  defense_count: number;
  battlerName?: string;      // Enriched
  battlerRating?: number;    // Enriched
}

interface ThroneChallenge {
  id: string;
  league_id: string;
  challenger_battler_id: string;
  throne_holder_battler_id: string;
  target_position: 1 | 2 | 3;
  status: 'pending' | 'accepted' | 'forfeited' | 'completed';
  deadline: string;
  battle_id: string | null;
  result: 'challenger_won' | 'defender_won' | 'forfeited' | null;
  created_at: string;
  challengerName?: string;   // Enriched
  holderName?: string;       // Enriched
  leagueName?: string;       // Enriched
}
```

---

## Design Colors

```tsx
// Throne-specific colors
const THRONE_COLORS = {
  gold: {
    text: 'text-yellow-500',
    border: 'border-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  silver: {
    text: 'text-zinc-300',
    border: 'border-zinc-400',
    bg: 'bg-zinc-400/10',
  },
  bronze: {
    text: 'text-orange-700',
    border: 'border-orange-600',
    bg: 'bg-orange-600/10',
  },
};
```

---

## Common Patterns

### Fetch and Display Thrones
```tsx
// In server component
const response = await fetch(`/api/leagues/${leagueId}/thrones`);
const { thrones } = await response.json();

return <ThroneDisplay {...props} thrones={thrones} />;
```

### Issue Challenge
```tsx
// In client component
const handleChallenge = async (throne: ThronePosition) => {
  const response = await fetch('/api/thrones/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      leagueId,
      targetPosition: throne.position,
      throneHolderBattlerId: throne.battler_id,
      challengerBattlerId: playerBattlerId,
    }),
  });

  if (response.ok) {
    window.location.reload(); // Refresh to show new challenge
  }
};
```

### Update After Battle
```tsx
// In battle simulation endpoint
import { updateThronesAfterBattle } from '@/lib/thrones/seedThrones';

if (battle.is_throne_challenge) {
  const { success, dethroned } = await updateThronesAfterBattle(
    supabase,
    battle.id
  );

  if (dethroned) {
    // Generate media, award badges, send notifications
  }
}
```

---

## Error Codes

| Code | Error                              | Cause                                |
|------|------------------------------------|--------------------------------------|
| 400  | Missing required fields            | Invalid request body                 |
| 400  | Invalid throne position            | Position not 1, 2, or 3              |
| 400  | Rating difference too large        | ELO diff > 100                       |
| 400  | Not currently holding throne       | Target battler isn't on throne       |
| 400  | Pending challenge already exists   | Wait for current challenge           |
| 401  | Unauthorized                       | Not authenticated or invalid secret  |
| 403  | Challenger doesn't belong to user  | Battler ownership mismatch           |
| 404  | No battler found                   | User has no battler                  |
| 500  | Internal server error              | Database or server error             |

---

## Testing Checklist

- [ ] Seed thrones successfully
- [ ] Display shows all 3 positions
- [ ] Challenge button only for eligible (within 100 ELO)
- [ ] Modal shows correct throne info
- [ ] Challenge creates throne_challenge record
- [ ] Widget shows incoming/outgoing challenges
- [ ] Deadline countdown displays correctly
- [ ] Player's throne highlighted in green
- [ ] Vacant thrones show "VACANT"
- [ ] ELO validation works (100 allowed, 101 blocked)
- [ ] Cannot challenge own throne
- [ ] Cannot create duplicate challenges
- [ ] Battle completion updates thrones
- [ ] Defense count increments on successful defense
- [ ] Throne history records created

---

## File Locations

```
components/leagues/
  ├── throne-display.tsx
  ├── throne-challenge-modal.tsx
  ├── throne-challenges-widget.tsx
  └── README.md

app/api/
  ├── leagues/[id]/thrones/route.ts
  ├── thrones/
  │   ├── challenge/route.ts
  │   └── challenges/route.ts
  └── admin/seed-thrones/route.ts

lib/
  ├── types/throne.ts
  └── thrones/seedThrones.ts

app/leagues/[id]/thrones/page.tsx (example)
```

---

## Quick Debug Commands

```bash
# Check throne positions in DB
psql -c "SELECT * FROM throne_positions;"

# Check pending challenges
psql -c "SELECT * FROM throne_challenges WHERE status = 'pending';"

# Check throne history
psql -c "SELECT * FROM throne_history ORDER BY started_at DESC LIMIT 10;"

# Seed thrones
curl -X POST http://localhost:3000/api/admin/seed-thrones \
  -H "Authorization: Bearer local-dev-secret-123"

# Get thrones for league
curl http://localhost:3000/api/leagues/LEAGUE_UUID/thrones

# Get user's challenges
curl http://localhost:3000/api/thrones/challenges
```
