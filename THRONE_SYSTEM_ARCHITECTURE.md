# Throne System - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         THRONE SYSTEM                               │
│                    Battle Rap University                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  LEAGUE THRONES PAGE                                       │   │
│  │  /leagues/[id]/thrones                                     │   │
│  │                                                            │   │
│  │  ┌──────────────────────────────────────────────────┐     │   │
│  │  │  ThroneChallengesWidget                          │     │   │
│  │  │  • Shows incoming challenges (RESPOND)           │     │   │
│  │  │  • Shows outgoing challenges (WAITING)           │     │   │
│  │  │  • Deadline countdown (48h)                      │     │   │
│  │  └──────────────────────────────────────────────────┘     │   │
│  │                                                            │   │
│  │  ┌──────────────────────────────────────────────────┐     │   │
│  │  │  ThroneDisplay                                   │     │   │
│  │  │                                                  │     │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │     │   │
│  │  │  │    👑    │  │    ⚔️    │  │    🛡️    │      │     │   │
│  │  │  │  #1 KING │  │#2 CHALL. │  │#3 GATE.  │      │     │   │
│  │  │  │          │  │          │  │          │      │     │   │
│  │  │  │ Tru Foe  │  │  Murda   │  │ Calicoe  │      │     │   │
│  │  │  │ 1450 ELO │  │ 1380 ELO │  │ 1320 ELO │      │     │   │
│  │  │  │ 3 DEF.   │  │ 1 DEF.   │  │ 0 DEF.   │      │     │   │
│  │  │  │          │  │          │  │          │      │     │   │
│  │  │  │[CHALLENGE│  │[CHALLENGE│  │[CHALLENGE│      │     │   │
│  │  │  │  BUTTON] │  │  BUTTON] │  │  BUTTON] │      │     │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘      │     │   │
│  │  │                                                  │     │   │
│  │  └──────────────────────────────────────────────────┘     │   │
│  │                                                            │   │
│  │  ┌──────────────────────────────────────────────────┐     │   │
│  │  │  ThroneChallengeModal (when button clicked)     │     │   │
│  │  │  • Target throne info                           │     │   │
│  │  │  • 48-hour deadline warning                     │     │   │
│  │  │  • Stakes & payout display                      │     │   │
│  │  │  • [ISSUE CHALLENGE] button                     │     │   │
│  │  └──────────────────────────────────────────────────┘     │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  DASHBOARD                                                 │   │
│  │  /dashboard                                                │   │
│  │                                                            │   │
│  │  ┌──────────────────────────────────────────────────┐     │   │
│  │  │  ThroneChallengesWidget                          │     │   │
│  │  │  (shows pending challenges)                      │     │   │
│  │  └──────────────────────────────────────────────────┘     │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API LAYER                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  GET /api/leagues/[id]/thrones                                     │
│  ├─ Fetch throne positions for league                             │
│  ├─ Enrich with battler names & ratings                           │
│  └─ Return: { thrones: [...] }                                    │
│                                                                     │
│  POST /api/thrones/challenge                                       │
│  ├─ Validate ELO difference (≤100)                                │
│  ├─ Check throne holder status                                    │
│  ├─ Create throne_challenge (48h deadline)                        │
│  └─ Return: { success, challenge }                                │
│                                                                     │
│  GET /api/thrones/challenges                                       │
│  ├─ Fetch incoming challenges (user is holder)                    │
│  ├─ Fetch outgoing challenges (user is challenger)                │
│  ├─ Enrich with names & league info                               │
│  └─ Return: { incomingChallenges, outgoingChallenges }            │
│                                                                     │
│  POST /api/admin/seed-thrones                                      │
│  ├─ Requires internal API secret                                  │
│  ├─ Find top 3 battlers by rating                                 │
│  ├─ Create throne_positions records                               │
│  └─ Return: { success, thrones }                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        UTILITY LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  lib/thrones/seedThrones.ts                                        │
│  ├─ seedThronesForLeague(supabase, leagueId)                      │
│  ├─ seedAllThrones(supabase)                                       │
│  └─ updateThronesAfterBattle(supabase, battleId)                  │
│                                                                     │
│  lib/types/throne.ts                                               │
│  ├─ ThronePosition                                                 │
│  ├─ ThroneChallenge                                                │
│  └─ ThroneHistory                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  throne_positions                                                   │
│  ├─ id, league_id, position (1-3), battler_id                     │
│  ├─ started_at, defense_count                                      │
│  └─ UNIQUE (league_id, position)                                  │
│                                                                     │
│  throne_challenges                                                  │
│  ├─ id, league_id, challenger_battler_id                          │
│  ├─ throne_holder_battler_id, target_position                     │
│  ├─ status, deadline, battle_id, result                           │
│  └─ created_at                                                     │
│                                                                     │
│  throne_history                                                     │
│  ├─ id, league_id, position, battler_id                           │
│  ├─ started_at, ended_at, defense_count                           │
│  ├─ lost_to_battler_id, lost_battle_id                            │
│  └─ created_at                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
app/leagues/[id]/thrones/page.tsx (Server Component)
│
├─ ThroneChallengesWidget (Client Component)
│  └─ Fetches: GET /api/thrones/challenges
│
├─ ThroneDisplay (Client Component)
│  ├─ Props: thrones[], playerBattlerId, playerRating
│  │
│  └─ ThroneChallengeModal (Client Component)
│     └─ Calls: POST /api/thrones/challenge
│
└─ Back button
```

---

## Data Flow: Challenge Issuance

```
┌──────────────┐
│   Player     │
│  clicks      │
│ "CHALLENGE"  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ ThroneDisplay        │
│ • Check ELO (≤100)   │
│ • Open modal         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ ThroneChallengeModal     │
│ • Show throne info       │
│ • Show 48h warning       │
│ • Player confirms        │
└──────┬───────────────────┘
       │
       ▼ POST /api/thrones/challenge
       │
┌──────────────────────────────────┐
│ API Route                        │
│ 1. Verify authentication         │
│ 2. Validate ELO difference       │
│ 3. Check throne holder status    │
│ 4. Prevent duplicate challenges  │
│ 5. Create throne_challenge       │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Database                         │
│ INSERT INTO throne_challenges    │
│   deadline = NOW() + 48 hours    │
│   status = 'pending'             │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Response                         │
│ { success: true, challenge }     │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Modal closes                     │
│ Page refreshes                   │
│ Challenge appears in widget      │
└──────────────────────────────────┘
```

---

## Data Flow: Battle Completion

```
┌──────────────────────────┐
│ Battle Simulation        │
│ Throne challenge battle  │
│ completes                │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ updateThronesAfterBattle(battleId)       │
│ 1. Find throne_challenge by battle_id   │
│ 2. Get battle winner                     │
│ 3. Determine outcome                     │
└──────┬───────────────────────────────────┘
       │
       ├─ CHALLENGER WON? ──────────────────────┐
       │                                        │
       ▼                                        ▼
┌────────────────────────────┐    ┌───────────────────────────┐
│ DETHRONEMENT               │    │ SUCCESSFUL DEFENSE        │
│                            │    │                           │
│ 1. End throne_history      │    │ 1. Increment defense_count│
│    (set ended_at)          │    │    in throne_positions    │
│                            │    │                           │
│ 2. Update throne_positions │    │ 2. Increment defense_count│
│    (new battler_id)        │    │    in throne_history      │
│                            │    │                           │
│ 3. Create new              │    │ 3. Update challenge       │
│    throne_history          │    │    result='defender_won'  │
│                            │    │                           │
│ 4. Update challenge        │    │ 4. Check for badges       │
│    result='challenger_won' │    │    (3 def = Iron Throne)  │
│                            │    │    (5 def = Dynasty)      │
│ 5. Award badges:           │    │                           │
│    • Throne Taker          │    └───────────────────────────┘
│    • Dethroned (loser)     │
│                            │
│ 6. Generate media coverage │
│    (special article)       │
│                            │
└────────────────────────────┘
```

---

## Eligibility Check Flow

```
┌─────────────────────┐
│ Player views        │
│ ThroneDisplay       │
└─────────┬───────────┘
          │
          ▼
    ┌─────────────────────────┐
    │ For each throne:        │
    └─────────┬───────────────┘
              │
              ▼
    ┌─────────────────────────────┐
    │ Is throne vacant?           │
    │ (battler_id === null)       │
    └─────┬───────────────────┬───┘
          │                   │
          ▼ YES               ▼ NO
    ┌─────────────┐     ┌─────────────────────┐
    │ Show        │     │ Is player on        │
    │ "VACANT"    │     │ this throne?        │
    └─────────────┘     └──────┬──────────┬───┘
                               │          │
                               ▼ YES      ▼ NO
                        ┌─────────────┐  ┌────────────────────┐
                        │ Highlight   │  │ Check ELO diff     │
                        │ in GREEN    │  │ Math.abs(          │
                        │ "YOU HOLD"  │  │   playerRating -   │
                        └─────────────┘  │   throneRating)    │
                                         └──────┬─────────┬───┘
                                                │         │
                                                ▼ ≤100    ▼ >100
                                         ┌─────────────┐  ┌──────────┐
                                         │ Show        │  │ Show     │
                                         │ "CHALLENGE" │  │ "OUT OF  │
                                         │ button      │  │ RANGE"   │
                                         └─────────────┘  └──────────┘
```

---

## State Management

### Client State (React)
```typescript
// ThroneDisplay
const [selectedThrone, setSelectedThrone] = useState<ThronePosition | null>(null);

// ThroneChallengesWidget
const [incomingChallenges, setIncomingChallenges] = useState<ThroneChallenge[]>([]);
const [outgoingChallenges, setOutgoingChallenges] = useState<ThroneChallenge[]>([]);
const [loading, setLoading] = useState(true);

// ThroneChallengeModal
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Server State (Database)
```sql
-- Current throne holders
SELECT * FROM throne_positions WHERE league_id = ?;

-- Pending challenges
SELECT * FROM throne_challenges
WHERE status IN ('pending', 'accepted')
  AND (challenger_battler_id = ? OR throne_holder_battler_id = ?);

-- Throne history
SELECT * FROM throne_history
WHERE battler_id = ?
  AND ended_at IS NULL;
```

---

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. AUTHENTICATION                                          │
│     ├─ All API routes require auth.uid()                   │
│     └─ Service role used for system operations             │
│                                                             │
│  2. AUTHORIZATION                                           │
│     ├─ Verify battler belongs to user                      │
│     ├─ Only throne holder can accept/decline               │
│     └─ Only challenger can withdraw                        │
│                                                             │
│  3. VALIDATION                                              │
│     ├─ ELO difference ≤ 100 (server-side)                  │
│     ├─ Target battler holds throne (DB check)              │
│     ├─ No duplicate pending challenges (UNIQUE)            │
│     └─ Position must be 1, 2, or 3                         │
│                                                             │
│  4. RATE LIMITING (Future)                                  │
│     ├─ Max 1 challenge per user per league per day         │
│     └─ Max 3 pending challenges per user                   │
│                                                             │
│  5. DEADLINE ENFORCEMENT                                    │
│     ├─ Cron job checks expired challenges                  │
│     └─ Auto-forfeit after 48 hours                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Integration Points

```
┌──────────────────────────────────────────────────────────────┐
│              THRONE SYSTEM INTEGRATIONS                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │ BATTLE SYSTEM                                  │         │
│  ├────────────────────────────────────────────────┤         │
│  │ • Mark throne challenge battles                │         │
│  │ • Link battle to throne_challenge              │         │
│  │ • Call updateThronesAfterBattle()              │         │
│  │ • Award defense badges                         │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │ BADGE SYSTEM                                   │         │
│  ├────────────────────────────────────────────────┤         │
│  │ • Iron Throne (3 defenses)                     │         │
│  │ • Dynasty (5 defenses)                         │         │
│  │ • Dethroned (lost throne)                      │         │
│  │ • Throne Taker (won challenge)                 │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │ MEDIA SYSTEM                                   │         │
│  ├────────────────────────────────────────────────┤         │
│  │ • Special articles for dethronements           │         │
│  │ • Defense streak coverage (3rd, 5th)           │         │
│  │ • Throne forfeit news                          │         │
│  │ • Template: "throne_dethronement"              │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │ NOTIFICATION SYSTEM (Future)                   │         │
│  ├────────────────────────────────────────────────┤         │
│  │ • Challenge issued notification                │         │
│  │ • Challenge accepted notification              │         │
│  │ • Deadline reminder (12h left)                 │         │
│  │ • Dethronement alert                           │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │ DASHBOARD                                      │         │
│  ├────────────────────────────────────────────────┤         │
│  │ • ThroneChallengesWidget                       │         │
│  │ • Throne stats (days held, defenses)           │         │
│  │ • Link to league thrones page                  │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │ RANKINGS                                       │         │
│  ├────────────────────────────────────────────────┤         │
│  │ • Crown emoji next to throne holders           │         │
│  │ • "Current King/Queen" badge                   │         │
│  │ • Filter by throne holders only                │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Future Architecture Extensions

```
┌──────────────────────────────────────────────────────────────┐
│                  FUTURE FEATURES                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ACCEPT/DECLINE SYSTEM                                       │
│  ├─ ThroneChallengeResponseModal component                  │
│  ├─ POST /api/thrones/challenges/[id]/accept                │
│  ├─ POST /api/thrones/challenges/[id]/decline               │
│  └─ Battle scheduling on accept                             │
│                                                              │
│  AUTO-FORFEIT CRON                                           │
│  ├─ POST /api/internal/check-throne-deadlines               │
│  ├─ Runs hourly (Vercel cron)                               │
│  ├─ Finds expired challenges                                │
│  └─ Auto-forfeit + transfer throne                          │
│                                                              │
│  AI AUTO-ACCEPT                                              │
│  ├─ Detect AI throne holders                                │
│  ├─ Auto-accept within 1 hour                               │
│  └─ Schedule battle immediately                             │
│                                                              │
│  THRONE HISTORY PAGE                                         │
│  ├─ /leagues/[id]/thrones/history                           │
│  ├─ Timeline view of past reigns                            │
│  ├─ Defense streak leaderboard                              │
│  └─ "Longest reign" records                                 │
│                                                              │
│  RATE LIMITING                                               │
│  ├─ Redis cache for challenge counts                        │
│  ├─ Max 1 challenge per user per league per day             │
│  └─ Max 3 pending challenges per user                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Performance Optimization

```
┌──────────────────────────────────────────────────────────────┐
│                  OPTIMIZATION STRATEGY                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  DATABASE INDEXES (✓ Already Created)                       │
│  ├─ idx_throne_positions_league                             │
│  ├─ idx_throne_positions_battler                            │
│  ├─ idx_throne_challenges_league                            │
│  ├─ idx_throne_challenges_status                            │
│  └─ idx_throne_history_battler                              │
│                                                              │
│  CACHING (Future)                                            │
│  ├─ Redis: throne positions (5 min TTL)                     │
│  ├─ Redis: challenge counts (1 min TTL)                     │
│  └─ Invalidate on challenge/battle completion               │
│                                                              │
│  BATCH QUERIES                                               │
│  ├─ Fetch all 3 thrones in single query                     │
│  ├─ Batch fetch battler names & ratings                     │
│  └─ Use lookup maps for O(1) access                         │
│                                                              │
│  CLIENT-SIDE                                                 │
│  ├─ Debounce deadline countdown (1 min)                     │
│  ├─ Lazy load challenge modal                               │
│  └─ Memoize throne display calculations                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌─────────────────────┐
│ User Action         │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────────────┐
│ API Request                  │
│ (POST /api/thrones/challenge)│
└──────┬───────────────────────┘
       │
       ▼
    Try {
       │
       ▼
  ┌───────────────────────────┐
  │ Validation                │
  ├───────────────────────────┤
  │ • Auth check              │
  │ • ELO difference          │
  │ • Throne holder status    │
  │ • Duplicate check         │
  └───────┬───────────────────┘
          │
          ├─ PASS ──────────────────┐
          │                          │
          ▼ FAIL                     ▼
    ┌─────────────────┐      ┌─────────────────┐
    │ Return 400      │      │ Create challenge│
    │ { error: ... }  │      │ Return 200      │
    └─────────────────┘      │ { success: ... }│
                             └─────────────────┘
    }
    Catch {
       │
       ▼
  ┌───────────────────────────┐
  │ Console.error()           │
  │ Return 500                │
  │ { error: "Internal..." }  │
  └───────────────────────────┘
    }
       │
       ▼
┌──────────────────────────────┐
│ Client Receives Response     │
├──────────────────────────────┤
│ if (!response.ok) {          │
│   setError(data.error);      │
│ } else {                     │
│   alert('Success!');         │
│   window.location.reload();  │
│ }                            │
└──────────────────────────────┘
```

---

## Testing Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                    TESTING LAYERS                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  UNIT TESTS                                                  │
│  ├─ eligibilityCheck() logic                                │
│  ├─ deadline calculation                                    │
│  └─ type validation                                         │
│                                                              │
│  INTEGRATION TESTS                                           │
│  ├─ API route validation                                    │
│  ├─ Database operations                                     │
│  └─ updateThronesAfterBattle()                              │
│                                                              │
│  E2E TESTS                                                   │
│  ├─ Challenge flow (issue → accept → battle → update)      │
│  ├─ Forfeit flow (issue → wait 48h → auto-forfeit)         │
│  └─ Defense streak (3 wins → badge)                        │
│                                                              │
│  MANUAL TESTS                                                │
│  ├─ Visual regression (throne display)                      │
│  ├─ Modal interactions                                      │
│  └─ Deadline countdown accuracy                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

This architecture provides a complete, scalable foundation for the Throne System in Battle Rap University.
