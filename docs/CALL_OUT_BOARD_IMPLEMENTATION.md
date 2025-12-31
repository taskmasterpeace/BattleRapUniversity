# Call-Out Board Implementation

## Overview

The Call-Out Board is a public challenge system where battlers can call each other out with pre-written trash talk templates. This feature adds social pressure, rivalry building, and consequences for ignoring challenges.

## Files Created

### 1. Main Page
**`app/(dashboard)/call-outs/page.tsx`**
- Main call-out board interface
- Filters: All Call-Outs, Targeting Me, My Call-Outs
- League filter dropdown
- Alert banner when being targeted
- Empty states with CTAs
- Integrated with framer-motion animations

### 2. Components

**`components/call-outs/call-out-card.tsx`**
- Displays individual call-out
- Shows caller and target battler info
- Template message with emoji
- Cosign count display
- Time remaining countdown
- Status badges (pending/accepted/countered/ignored/expired)
- Action buttons (Accept/Counter/Ignore) for targeted call-outs
- Warning message when expiring soon

**`components/call-outs/create-call-out-modal.tsx`**
- Modal for creating new call-outs
- Target battler dropdown selector
- 5 pre-written template options:
  - 📝 "YOUR BARS ARE BASIC - PROVE ME WRONG"
  - 🚫 "YOU AIN'T READY FOR THIS LEAGUE"
  - 💀 "I'LL BODY YOU 3-0"
  - 🦆 "STOP DUCKING AND BATTLE ME"
  - 👑 "THAT THRONE IS MINE"
- Optional stake amount input
- Live preview of call-out
- 48-hour deadline info

### 3. API Routes

**`app/api/call-outs/route.ts`**
- **GET**: List call-outs with filters
  - Query params: `target`, `caller`, `league`, `status`
  - Returns transformed call-out data with battler info
- **POST**: Create new call-out
  - Validates inputs
  - Sets 48-hour deadline
  - Records grudge action via `record_grudge_action` function
  - Links to league

**`app/api/call-outs/[id]/respond/route.ts`**
- **POST**: Respond to call-out (accept/counter/ignore)
  - Verifies caller is target
  - Updates status
  - If accepted: Creates battle scheduled 7 days out
  - If ignored: Tracks ignore count (triggers "Ducking" badge at 3+)

**`app/api/battlers/route.ts`**
- **GET**: List all battlers for dropdown
  - Returns id, stageName, tier, avatar, rating
  - Limited to 50 battlers
  - Ordered alphabetically

## Design Language

### Colors
- Background: `bg-zinc-950`, `bg-zinc-900`
- Cards: `bg-zinc-900`, `bg-zinc-800`
- Borders: `border-zinc-800`, `border-zinc-700`
- Primary accent: `bg-orange-500`, `text-orange-400`
- Targeting alert: `border-red-500/50`, `bg-red-950/30`
- Success (accept): `bg-green-600`
- Warning (counter): `bg-yellow-600`

### Typography
- Headers: `font-display`, `font-black`, `uppercase`, `tracking-tighter`
- Body: `font-display`, `font-bold`, `uppercase`, `tracking-wide`
- Mono text: `font-mono` for numbers, ratings, timers

### Animations
- Page sections: Staggered fade-in with `framer-motion`
- Cards: Individual fade-in on load
- Modal: Scale + fade transition

## Key Features

### 1. Call-Out Templates
Five battle rap-themed templates with emojis for quick, authentic trash talk without user-generated text.

### 2. 48-Hour Deadline
All call-outs have a 48-hour response window. Expiring soon (< 12 hours) shows warning.

### 3. Cosign System
Crew members can cosign call-outs (tracked in `cosign_count`) to increase pressure.

### 4. Stakes
Optional stake amount increases battle payout if accepted (doubled as purse).

### 5. Response Options
- **Accept**: Creates battle, updates grudge
- **Counter**: Negotiation mechanic (placeholder)
- **Ignore**: Tracks count, triggers "Ducking" badge at 3+

### 6. Grudge Integration
Creating a call-out records a grudge action via the `record_grudge_action` function, increasing rivalry intensity by +15.

### 7. Battle Creation
Accepting a call-out automatically creates a battle:
- Status: `accepted`
- Scheduled: 7 days from acceptance
- Purse: Double the stake amount
- Links back to call-out via `battle_id`

## Database Integration

Uses existing tables from the social features migration:
- `call_outs`: Main call-out records
- `call_out_cosigns`: Crew cosign tracking
- `battler_relationships`: Grudge intensity tracking
- `battles`: Auto-created on acceptance

## Future Enhancements

1. **Counter Response Flow**: Allow target to counter with different terms (venue, stake, date)
2. **Cosign UI**: Add button for crew members to cosign
3. **Badge System**: Implement "Ducking" badge for ignoring 3+ call-outs
4. **Notifications**: Alert users when targeted or when deadline approaching
5. **Custom Messages**: Allow custom text instead of just templates
6. **Crew Call-Outs**: Crew-wide challenges
7. **Stake Escrow**: Hold stakes until battle completes
8. **Call-Out History**: View past call-outs and outcomes

## Testing

### Manual Testing Checklist
- [ ] Create call-out with each template
- [ ] Filter by "Targeting Me"
- [ ] Filter by "My Call-Outs"
- [ ] Filter by league
- [ ] Accept call-out (verify battle created)
- [ ] Counter call-out
- [ ] Ignore call-out (check ignore count)
- [ ] Verify 48-hour deadline countdown
- [ ] Test empty states
- [ ] Test with/without stakes
- [ ] Verify grudge action recorded

### API Testing
```bash
# List call-outs
GET /api/call-outs?target=me

# Create call-out
POST /api/call-outs
{
  "targetBattlerId": "uuid",
  "template": "bars_are_basic",
  "stakeAmount": 500
}

# Respond to call-out
POST /api/call-outs/{id}/respond
{
  "response": "accept"
}
```

## Navigation

Add link to sidebar/dashboard:
```tsx
<Link href="/call-outs">
  <Card>
    <Megaphone className="w-5 h-5 text-orange-500" />
    Call-Out Board
  </Card>
</Link>
```

## Notes

- Uses service role client to bypass RLS
- Targets "dev" user's battler via `is_player_controlled = true`
- All timestamps are ISO 8601 format
- Expired call-outs (past deadline, status still pending) are marked visually but not auto-updated
- Consider cron job to auto-expire old call-outs
