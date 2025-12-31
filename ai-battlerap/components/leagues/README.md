# Throne System Components

The Throne System allows the top 3 battlers in each league to hold special "throne" positions with perks and prestige. Players can challenge throne holders, who must respond within 48 hours or forfeit their position.

## Components

### 1. `throne-display.tsx`

Visual display of the top 3 throne positions for a league.

**Props:**
```typescript
{
  leagueId: string;           // UUID of the league
  leagueName: string;         // Display name of the league
  thrones: ThronePosition[];  // Array of throne positions (1, 2, 3)
  playerBattlerId: string;    // UUID of current player's battler
  playerRating: number;       // Player's ELO rating for challenge eligibility
}
```

**Features:**
- Displays all 3 throne positions with icons:
  - #1 King/Queen: 👑 (Gold)
  - #2 Challenger: ⚔️ (Silver)
  - #3 Gatekeeper: 🛡️ (Bronze)
- Shows current holder, defense count, and perks
- "Challenge" button appears if player is eligible (within 100 ELO)
- Highlights player's own thrones in green
- Displays throne rules in footer

**Usage:**
```tsx
import ThroneDisplay from '@/components/leagues/throne-display';

<ThroneDisplay
  leagueId="league-uuid"
  leagueName="Small Room Circuit"
  thrones={thronePositions}
  playerBattlerId="player-battler-uuid"
  playerRating={1350}
/>
```

---

### 2. `throne-challenge-modal.tsx`

Modal for issuing a throne challenge.

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  throne: ThronePosition;     // Target throne to challenge
  leagueId: string;
  leagueName: string;
  playerBattlerId: string;
}
```

**Features:**
- Displays target throne info (position, holder, defenses)
- Shows 48-hour deadline warning
- Displays stakes and payout bonuses
- Validates before submitting challenge
- Auto-refreshes page on success

**Usage:**
```tsx
import ThroneChallengeModal from '@/components/leagues/throne-challenge-modal';

const [selectedThrone, setSelectedThrone] = useState<ThronePosition | null>(null);

<ThroneChallengeModal
  isOpen={!!selectedThrone}
  onClose={() => setSelectedThrone(null)}
  throne={selectedThrone}
  leagueId="league-uuid"
  leagueName="Main Stage Arena"
  playerBattlerId="player-battler-uuid"
/>
```

---

### 3. `throne-challenges-widget.tsx`

Dashboard widget showing pending throne challenges.

**Props:**
```typescript
{
  playerBattlerId: string;
}
```

**Features:**
- Fetches incoming challenges (user is throne holder)
- Fetches outgoing challenges (user is challenger)
- Shows deadline countdown with color coding:
  - Red: < 12 hours
  - Orange: 12-24 hours
  - Gray: > 24 hours
- "RESPOND" button for incoming challenges
- Hides automatically if no challenges

**Usage:**
```tsx
import ThroneChallengesWidget from '@/components/leagues/throne-challenges-widget';

<ThroneChallengesWidget playerBattlerId="player-battler-uuid" />
```

---

## API Routes

### `GET /api/leagues/[id]/thrones`

Fetches throne positions for a league.

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

### `POST /api/thrones/challenge`

Issues a throne challenge.

**Request Body:**
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
  "challenge": { /* throne_challenge record */ },
  "message": "Throne challenge issued successfully..."
}
```

**Validation:**
- Challenger must belong to authenticated user
- ELO difference must be ≤ 100
- Target must actually hold the throne
- No existing pending challenge for that position

---

### `GET /api/thrones/challenges`

Fetches pending challenges for authenticated user.

**Response:**
```json
{
  "incomingChallenges": [ /* challenges where user is throne holder */ ],
  "outgoingChallenges": [ /* challenges where user is challenger */ ],
  "totalPending": 2
}
```

---

## Throne Rules

### Challenge Eligibility
- Must be within **100 ELO** of throne holder
- Cannot challenge your own throne
- Only one pending challenge per throne position at a time

### Throne Holder Requirements
- MUST respond to challenges within **48 hours**
- Failure to respond = **forfeit throne**
- Can decline challenges (lose throne)
- Can accept challenges (schedule battle)

### Throne Perks

| Position | Title       | Media Coverage | Battle Payout | Special Perk          |
|----------|-------------|----------------|---------------|-----------------------|
| #1       | King/Queen  | +15%           | +20%          | Special badge         |
| #2       | Challenger  | +10%           | +10%          | -                     |
| #3       | Gatekeeper  | +5%            | Standard      | Face rising stars     |

### Defense Streaks
- **3 defenses**: "Iron Throne" badge
- **5 defenses**: "Dynasty" badge
- **Dethronement**: "Dethroned" badge (can be used as angle)

---

## Database Schema

### `throne_positions`
```sql
CREATE TABLE throne_positions (
  id UUID PRIMARY KEY,
  league_id UUID REFERENCES leagues(id),
  position INT CHECK (position IN (1, 2, 3)),
  battler_id UUID REFERENCES battlers(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  defense_count INT DEFAULT 0,
  UNIQUE (league_id, position)
);
```

### `throne_challenges`
```sql
CREATE TABLE throne_challenges (
  id UUID PRIMARY KEY,
  league_id UUID REFERENCES leagues(id),
  challenger_battler_id UUID REFERENCES battlers(id),
  throne_holder_battler_id UUID REFERENCES battlers(id),
  target_position INT CHECK (target_position IN (1, 2, 3)),
  status TEXT CHECK (status IN ('pending', 'accepted', 'forfeited', 'completed')),
  deadline TIMESTAMPTZ NOT NULL,
  battle_id UUID REFERENCES battles(id),
  result TEXT CHECK (result IN ('challenger_won', 'defender_won', 'forfeited')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `throne_history`
```sql
CREATE TABLE throne_history (
  id UUID PRIMARY KEY,
  league_id UUID REFERENCES leagues(id),
  position INT CHECK (position IN (1, 2, 3)),
  battler_id UUID REFERENCES battlers(id),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  defense_count INT DEFAULT 0,
  lost_to_battler_id UUID REFERENCES battlers(id),
  lost_battle_id UUID REFERENCES battles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Example Page Implementation

See `app/leagues/[id]/thrones/page.tsx` for a complete server component example that:
1. Authenticates user
2. Fetches league and battler data
3. Gets player rating for eligibility
4. Fetches throne positions via API
5. Renders throne display + challenges widget

---

## Design System

All components follow the Battle Rap University dark theme:

### Colors
- **Background**: `bg-zinc-950`, `bg-zinc-900`
- **Borders**: `border-zinc-800`, `border-zinc-700`
- **Gold (#1)**: `text-yellow-500`, `border-yellow-500`
- **Silver (#2)**: `text-zinc-300`, `border-zinc-400`
- **Bronze (#3)**: `text-orange-700`, `border-orange-600`
- **Accent**: `bg-orange-500`, `text-orange-400`

### Typography
- **Headers**: `font-black`, `uppercase`, `tracking-tighter`
- **Body**: `font-bold`, `uppercase`, `tracking-wide`
- **Small text**: `text-xs`, `uppercase`, `tracking-wide`

### Layout
- Uses `BrutalistCard` for consistent styling
- Grid layout for throne positions (3 columns on desktop)
- Responsive design (stacks on mobile)

---

## Future Enhancements

### Planned Features
1. **Notifications**: Alert throne holders of challenges
2. **Auto-Accept**: AI throne holders auto-accept challenges
3. **Accept/Decline UI**: Interface for responding to challenges
4. **Throne History**: View past throne reigns
5. **Badge System**: Unlock throne-related badges
6. **Media Coverage**: Auto-generate articles for throne battles

### Battle Integration
When a throne challenge is accepted:
1. Create battle record with special "throne_challenge" flag
2. Link battle to throne_challenge record
3. On battle completion:
   - Update throne_positions if challenger won
   - Move loser's throne_history to ended_at
   - Increment winner's defense_count if defender won
   - Generate throne-specific media coverage

---

## Testing

### Manual Testing Checklist
- [ ] Throne positions display correctly
- [ ] Challenge button only shows when eligible (within 100 ELO)
- [ ] Challenge modal shows correct info
- [ ] Challenge submission creates throne_challenge record
- [ ] Challenges widget shows incoming/outgoing challenges
- [ ] Deadline countdown updates correctly
- [ ] Player's own thrones highlighted in green
- [ ] Vacant thrones show "VACANT" state

### Edge Cases
- [ ] Player rating exactly 100 ELO difference (should allow)
- [ ] Player rating 101 ELO difference (should block)
- [ ] Multiple challenges to same throne (should block)
- [ ] Challenging own throne (should block)
- [ ] Expired deadlines (should show "EXPIRED")
- [ ] Vacant throne positions (should handle gracefully)

---

## Troubleshooting

### Common Issues

**"Out of Range" button shows incorrectly**
- Check player rating calculation
- Verify throne holder rating is enriched

**Challenges not appearing in widget**
- Verify battler_id matches authenticated user
- Check throne_challenges table has correct battler IDs
- Ensure API route filters by both challenger and holder

**Modal won't submit**
- Check network tab for API errors
- Verify SUPABASE_SERVICE_ROLE_KEY is set
- Check console for validation errors

**Throne positions empty**
- Throne positions must be manually seeded or auto-created
- If empty, API returns placeholder positions
- Check that league_id exists in leagues table
