# Call-Out Board UI Flow

## Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│ [🔊 Icon] CALL-OUT BOARD                    [+ Call Someone Out] │
│ Public challenges and callouts                                 │
├─────────────────────────────────────────────────────────────┤
│                                                                │
│ ⚠️ ALERT (if being targeted)                                  │
│ ┌───────────────────────────────────────────────────────┐    │
│ │ 🎯 2 CALL-OUTS TARGETING YOU                    [View] │    │
│ │ Respond or face reputation damage                      │    │
│ └───────────────────────────────────────────────────────┘    │
│                                                                │
├─────────────────────────────────────────────────────────────┤
│ FILTERS:                                                       │
│ [All Call-Outs] [🎯 Targeting Me (2)] [🔊 My Call-Outs]      │
│                                          [League: All ▼]      │
├─────────────────────────────────────────────────────────────┤
│                                                                │
│ CALL-OUT CARD (Targeting You)                                 │
│ ┌───────────────────────────────────────────────────────┐    │
│ │ 🎯 CHALLENGING YOU               [PENDING] ⏰ 36h left │    │
│ │ Dec 3, 2025                            👥 3 cosigns    │    │
│ ├───────────────────────────────────────────────────────┤    │
│ │ [Caller Avatar]  VS  [Your Avatar]                     │    │
│ │ Tech Wizard           Player Name                      │    │
│ │ Top Tier              Mid Tier                         │    │
│ ├───────────────────────────────────────────────────────┤    │
│ │ 💀 I'LL BODY YOU 3-0                                   │    │
│ │ League: Small Room Circuit                             │    │
│ ├───────────────────────────────────────────────────────┤    │
│ │ 💰 Stake: $1,000    👥 Cosigns: 3                     │    │
│ ├───────────────────────────────────────────────────────┤    │
│ │ [✓ Accept]  [💬 Counter]  [✗ Ignore]                  │    │
│ └───────────────────────────────────────────────────────┘    │
│                                                                │
│ CALL-OUT CARD (Regular)                                       │
│ ┌───────────────────────────────────────────────────────┐    │
│ │ 🔊 CALL-OUT                      [PENDING] ⏰ 18h left │    │
│ │ Dec 2, 2025                                            │    │
│ ├───────────────────────────────────────────────────────┤    │
│ │ [Caller]  VS  [Target]                                 │    │
│ ├───────────────────────────────────────────────────────┤    │
│ │ 📝 YOUR BARS ARE BASIC - PROVE ME WRONG              │    │
│ └───────────────────────────────────────────────────────┘    │
│                                                                │
│ INFO CARD                                                      │
│ ┌───────────────────────────────────────────────────────┐    │
│ │ 🔥 How Call-Outs Work                                  │    │
│ │ • Call out battlers publicly to challenge them         │    │
│ │ • Targets have 48 hours to respond                     │    │
│ │ • Crew members can cosign call-outs                    │    │
│ │ ⚠️ Warning: Ignoring earns "Ducking" badge            │    │
│ └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Create Call-Out Modal

```
┌─────────────────────────────────────────────────────────────┐
│ 🔊 CALL SOMEONE OUT                                      [X] │
├─────────────────────────────────────────────────────────────┤
│                                                                │
│ 🎯 SELECT TARGET                                              │
│ ┌───────────────────────────────────────────────────────┐    │
│ │ Choose a battler...                                ▼  │    │
│ │   Tech Wizard (Top Tier) - Rating: 1250               │    │
│ │   Smooth Criminal (Mid Tier) - Rating: 1150           │    │
│ └───────────────────────────────────────────────────────┘    │
│                                                                │
│ 🔊 CHOOSE YOUR CALL-OUT                                       │
│ ┌───────────────────────────────────────────────────────┐    │
│ │ 📝 YOUR BARS ARE BASIC - PROVE ME WRONG         [✓]   │    │
│ └───────────────────────────────────────────────────────┘    │
│ ┌───────────────────────────────────────────────────────┐    │
│ │ 🚫 YOU AIN'T READY FOR THIS LEAGUE              [ ]   │    │
│ └───────────────────────────────────────────────────────┘    │
│ ┌───────────────────────────────────────────────────────┐    │
│ │ 💀 I'LL BODY YOU 3-0                            [ ]   │    │
│ └───────────────────────────────────────────────────────┘    │
│ ┌───────────────────────────────────────────────────────┐    │
│ │ 🦆 STOP DUCKING AND BATTLE ME                   [ ]   │    │
│ └───────────────────────────────────────────────────────┘    │
│ ┌───────────────────────────────────────────────────────┐    │
│ │ 👑 THAT THRONE IS MINE                          [ ]   │    │
│ └───────────────────────────────────────────────────────┘    │
│                                                                │
│ 💰 OPTIONAL STAKE (increases pressure)                        │
│ ┌───────────────────────────────────────────────────────┐    │
│ │ $ 1000                                                 │    │
│ └───────────────────────────────────────────────────────┘    │
│ Adding a stake increases the intensity and payout             │
│                                                                │
│ PREVIEW                                                        │
│ ┌───────────────────────────────────────────────────────┐    │
│ │ 📝 YOUR BARS ARE BASIC - PROVE ME WRONG              │    │
│ │ 💰 Stake: $1,000                                       │    │
│ └───────────────────────────────────────────────────────┘    │
│                                                                │
│ ⏰ 48-HOUR DEADLINE                                           │
│ • Target has 48 hours to respond                              │
│ • Crew members can cosign your call-out                       │
│ • Warning: Ignoring earns "Ducking" badge                     │
│                                                                │
├─────────────────────────────────────────────────────────────┤
│ [Cancel]                          [🔊 ISSUE CALL-OUT]        │
└─────────────────────────────────────────────────────────────┘
```

## User Flow

### 1. Viewing Call-Outs
```
Dashboard → Call-Out Board → View all active call-outs
                           ↓
                   Filter by targeting/caller/league
```

### 2. Creating Call-Out
```
Call-Out Board → [+ Call Someone Out] → Select Target
                                       ↓
                                Choose Template
                                       ↓
                                Add Stake (optional)
                                       ↓
                                [Issue Call-Out]
                                       ↓
                        Call-out posted with 48h deadline
                                       ↓
                        Grudge intensity +15 recorded
```

### 3. Responding to Call-Out
```
Call-Out Board → Filter "Targeting Me" → View call-out
                                        ↓
                        Choose response:
                        ┌─────┬─────────┬─────────┐
                        │     │         │         │
                    [Accept] [Counter] [Ignore]
                        │     │         │
                        ↓     ↓         ↓
                Create   Set   Track ignore
                Battle   Terms  count
                        ↓
                Battle scheduled 7 days out
                Purse = stake × 2
```

## Color Key

- 🟠 Orange: Primary actions, call-out accents
- 🔴 Red: Targeting alerts, critical warnings
- 🟢 Green: Accept actions, stakes
- 🟡 Yellow: Counter actions, warnings
- ⚫ Dark: Backgrounds (zinc-950, zinc-900)
- ⚪ Light text: zinc-100, zinc-300

## Interaction States

### Call-Out Card States
1. **Pending** (targeting user)
   - Border: Orange
   - Shows action buttons
   - Countdown timer

2. **Pending** (not targeting)
   - Border: Gray
   - View-only

3. **Accepted**
   - Border: Green
   - Badge: "ACCEPTED"

4. **Countered**
   - Border: Yellow
   - Badge: "COUNTERED"

5. **Ignored**
   - Border: Gray (dimmed)
   - Badge: "IGNORED"

6. **Expired**
   - Border: Gray (dimmed)
   - Badge: "EXPIRED"

### Time Warnings
- **> 12 hours**: Normal (gray timer)
- **< 12 hours**: Warning (yellow/red timer)
- **Expired**: Gray out, show "EXPIRED"

## Responsive Behavior

### Desktop (lg+)
- 2-column layout for battler info
- Side-by-side action buttons
- Full width call-out cards

### Mobile (< lg)
- Stacked battler info
- Vertical action buttons
- Condensed spacing
