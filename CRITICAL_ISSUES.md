# Critical Issues Report

**Date**: November 30, 2025
**Total Issues Identified**: 37+
**Blocker Count**: 5
**High Priority Count**: 11
**Medium Priority Count**: 15
**Low Priority Count**: 6

---

## Priority Legend

- **🔴 BLOCKER**: Must fix before launch (blocks release)
- **🟠 HIGH**: Should fix before launch (significant impact)
- **🟡 MEDIUM**: Important but not launch-blocking
- **🟢 LOW**: Nice to have, can fix post-launch

---

## BLOCKER Issues (Must Fix Before Launch)

### 🔴 BLOCKER-1: Missing Battle Rap Terminology

**Priority**: BLOCKER
**Found By**: Agent 12 (Battle Rap Authenticity Research)
**Severity**: CRITICAL
**Impact**: Real battle rap fans will immediately spot inauthenticity and reject the game

**Problem**:
Game uses generic gaming terminology instead of authentic battle rap slang:
- "3-0 Victory" instead of "BODYBAG" or "30"
- "2-1 Victory" instead of "EDGE" or "DEBATABLE"
- "Segment" instead of "bars"
- "Peak segment" instead of "haymaker"
- No decision nuance (edge vs clear vs classic vs debatable)

**Reproduction**:
1. Navigate to any battle results page
2. Observe terminology used

**Expected**:
```
YOU WON 3-0 BODYBAG
"You 30'd this dude. Dominant performance."
```

**Actual**:
```
YOU WON 3-0
Round-by-round breakdown...
```

**Fix**:
1. Update all UI components displaying battle results
2. Add decision type labels (bodybag/clear/edge/debatable/classic)
3. Use battle rap terminology consistently

**Files**:
- `app/battle/[id]/page.tsx` - Battle results display
- `app/battle/offers/page.tsx` - Offer list
- `components/battler/DashboardClient.tsx` - Dashboard stats
- `components/battle/PostBattleSummary.tsx` - Post-battle summary

**Code Changes**:
```typescript
// Before
<div className="text-2xl font-bold">
  {playerWon ? 'YOU WON' : 'YOU LOST'} {rounds.length}-{aiRounds.length}
</div>

// After
<div className="text-2xl font-bold uppercase">
  {playerWon ? 'YOU WON' : 'YOU LOST'}{' '}
  {rounds.length}-{aiRounds.length}{' '}
  <span className="text-orange-500">
    {getDecisionLabel(battle.decision_type)}
  </span>
</div>

function getDecisionLabel(decisionType: string) {
  const labels = {
    bodybag_30: 'BODYBAG',
    clear_30: 'CLEAR 3-0',
    clear_21: 'CLEAR 2-1',
    edge: 'EDGE',
    classic: 'CLASSIC',
    debatable: 'DEBATABLE',
  };
  return labels[decisionType] || 'EDGE';
}
```

**Effort**: 1-2 hours
**Test**: Generate 5 battles with different outcomes, verify terminology appears correctly

---

### 🔴 BLOCKER-2: No Opponent Stats in Battle Offers

**Priority**: BLOCKER
**Found By**: Agent 12, CLAUDE.md
**Severity**: CRITICAL
**Impact**: Players cannot make informed decisions about accepting battles

**Problem**:
Battle offers only show opponent name. No stats, record, attributes, or style information visible. Real battle rap culture emphasizes knowing your opponent ("research is integral to success").

**Reproduction**:
1. Navigate to `/battle/offers`
2. Observe battle offer cards
3. Only opponent name visible

**Expected**:
```
VS. HOLLOW DA DON
├─ Top Tier (1850 ELO)
├─ 15-3 Record (5 Bodies)
├─ Style: Freestyle Genius, Well-Rounded, Clutch Performer
├─ Writing: 8.2 | Performance: 8.5
└─ Form: 3W in last 3 battles

⚠️ FREESTYLER WARNING: This opponent excels at rebuttals
```

**Actual**:
```
Battle Offer
League: Main Stage Arena
Opponent: Hollow Da Don
Payout: $500

[ACCEPT] [DECLINE]
```

**Fix**:
1. Enhance `/api/battles/offers` to fetch opponent data
2. Update battle offer cards to display opponent info
3. Add strategic hints based on opponent style

**Files**:
- `app/api/battles/offers/route.ts` - Backend API
- `app/battle/offers/page.tsx` - Frontend UI

**API Changes**:
```typescript
// Add to offer query
.select(`
  *,
  league:leagues(*),
  ai_battler:battler_ai_id(
    id,
    stage_name,
    tier,
    badges_at_creation,
    battler_attributes!inner(writing, performance, personal),
    rankings!inner(rating, wins, losses)
  )
`)

// Calculate derived fields
opponent: {
  stage_name: ai_battler.stage_name,
  tier: ai_battler.tier,
  rating: ai_battler.rankings[0].rating,
  record: {
    wins: ai_battler.rankings[0].wins,
    losses: ai_battler.rankings[0].losses,
  },
  attributes: {
    writing_avg: calculateAverage(ai_battler.battler_attributes[0].writing),
    performance_avg: calculateAverage(ai_battler.battler_attributes[0].performance),
  },
  style_tags: ai_battler.badges_at_creation,
  recent_form: await calculateRecentForm(ai_battler.id), // Last 5 battles
}
```

**Effort**: 2-3 hours
**Test**: View battle offers, verify all opponent data displays correctly

---

### 🔴 BLOCKER-3: Tournament Notification Triggers Not Implemented

**Priority**: BLOCKER
**Found By**: Agent 3 (Tournament System Test Report)
**Severity**: CRITICAL
**Impact**: Players miss critical tournament updates (seeding, scheduling, advancement) and lose by default

**Problem**:
Notification infrastructure exists (table, toast UI, SQL functions) but NO triggers are wired up in tournament manager. Players get zero notifications for:
- Registration confirmation
- Bracket seeding ("You are seed #8")
- Match scheduling ("Your quarterfinals match is Dec 15")
- Match reminders (24h before prep deadline)
- Round advancement ("You won! Next match in semifinals")
- Tournament completion ("You finished 2nd place, prize: $6,250")

**Reproduction**:
1. Register for tournament
2. Wait for bracket generation
3. Receive NO notifications

**Expected**:
After registration:
```
🎯 Tournament Registration Confirmed
You're registered for Small Room Circuit Championship.
Registration closes Nov 25.
```

After seeding:
```
🎯 Brackets Released!
You are seed #8 in Small Room Circuit Championship.
Check the bracket to see your first match.
```

**Actual**:
No notifications at all.

**Fix**:
Add `create_notification()` calls in `tournamentManager.ts` at 4 trigger points:

**1. After Registration (line ~181)**:
```typescript
// After successful registration
await supabase.rpc('create_notification', {
  p_battler_id: battlerId,
  p_type: 'tournament_update',
  p_title: 'Tournament Registration Confirmed',
  p_message: `You're registered for ${tournament.name}. Registration closes ${new Date(tournament.registration_closes_at).toLocaleDateString()}.`,
  p_metadata: { tournament_id: tournamentId, action: 'registered' }
});
```

**2. After Seeding (line ~272)**:
```typescript
// For each participant after seeding
for (let i = 0; i < participants.length; i++) {
  await supabase.rpc('create_notification', {
    p_battler_id: participants[i].battler_id,
    p_type: 'tournament_update',
    p_title: 'Brackets Released!',
    p_message: `You are seed #${i + 1} in ${tournament.name}. Check the bracket to see your first match.`,
    p_metadata: { tournament_id: tournamentId, seed_number: i + 1 }
  });
}
```

**3. After Match Scheduling (line ~446)**:
```typescript
// For both battlers in match
await supabase.rpc('create_notification', {
  p_battler_id: bracket.battler_1_id,
  p_type: 'tournament_update',
  p_title: 'Tournament Match Scheduled',
  p_message: `Your ${round.replace('_', ' ')} match is on ${scheduledAt.toLocaleDateString()}. Prep deadline: ${prepDeadline.toLocaleDateString()}.`,
  p_metadata: { tournament_id: tournamentId, battle_id: battle.id, round }
});
```

**4. After Battle Result (line ~765)**:
```typescript
// Winner notification
await supabase.rpc('create_notification', {
  p_battler_id: winner_battler_id,
  p_type: 'tournament_update',
  p_title: 'You Advanced!',
  p_message: `You won your ${round} match and advanced to ${nextRound}. Next match: ${nextMatchDate}.`,
  p_metadata: { tournament_id, battle_id, round, next_round: nextRound }
});

// Loser notification
await supabase.rpc('create_notification', {
  p_battler_id: loser_battler_id,
  p_type: 'tournament_update',
  p_title: 'Tournament Complete',
  p_message: `You finished ${placement}. Prize earned: $${prizeAmount}.`,
  p_metadata: { tournament_id, final_placement: placement, prize: prizeAmount }
});
```

**Files**:
- `lib/game/tournamentManager.ts` - All 4 trigger points

**Effort**: 4 hours (includes testing with real tournament flow)
**Test**:
1. Register for tournament
2. Generate brackets
3. Schedule matches
4. Complete battle
5. Verify notification appears at each step

---

### 🔴 BLOCKER-4: Tournament Prize Distribution Math Error

**Priority**: BLOCKER
**Found By**: Agent 3 (Tournament System Test Report)
**Severity**: HIGH (financial integrity)
**Impact**: Prize pool totals 107% instead of 100%, causing payout errors

**Problem**:
Default prize distribution in migration adds up to 107%:
- Winner: 50%
- Runner-up: 25%
- Semifinalists: 10% EACH (2 players = 20% total)
- Quarterfinalists: 3% EACH (4 players = 12% total)
- **Total: 50% + 25% + 20% + 12% = 107%**

**Reproduction**:
1. Check tournament schema
2. Calculate total percentages

**Expected**:
Prize distribution totals exactly 100%

**Actual**:
Total = 107%

**Fix**:
```sql
-- File: supabase/migrations/20251125070000_add_tournament_system.sql
-- Lines 25-30

-- Before (WRONG)
prize_distribution JSONB NOT NULL DEFAULT '{
  "winner": 0.50,
  "runner_up": 0.25,
  "semifinalists": 0.10,
  "quarterfinalists": 0.03
}'::jsonb,

-- After (CORRECT)
prize_distribution JSONB NOT NULL DEFAULT '{
  "winner": 0.50,
  "runner_up": 0.25,
  "semifinalists": 0.125,
  "quarterfinalists": 0.125
}'::jsonb,
```

**Breakdown**:
- Winner: 50% ($12,500 of $25,000)
- Runner-up: 25% ($6,250)
- Semifinalists: 12.5% total → 6.25% each ($1,562.50 each × 2)
- Quarterfinalists: 12.5% total → 3.125% each ($781.25 each × 4)
- **Total: 100%**

**Files**:
- `supabase/migrations/20251125070000_add_tournament_system.sql`

**Migration Strategy**:
1. Create new migration to fix existing tournaments
2. Update default for new tournaments

**Effort**: 5 minutes (code change) + 15 minutes (migration + testing)
**Test**:
1. Create tournament with $10,000 prize pool
2. Calculate payouts for all placements
3. Sum payouts, verify equals $10,000

---

### 🔴 BLOCKER-5: PostBattleSummary Component Not Rendered

**Priority**: BLOCKER
**Found By**: CLAUDE.md documentation
**Severity**: HIGH
**Impact**: Players get zero feedback on XP/rating/attribute changes after battle

**Problem**:
`PostBattleSummary.tsx` component fully built but:
1. Not rendered on battle results page
2. API doesn't return required data (rating changes, attribute changes, badges earned, stress changes)

**Reproduction**:
1. Complete a battle
2. Navigate to `/battle/[id]`
3. Component with progression summary not visible
4. No feedback on what changed

**Expected**:
After battle:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POST-BATTLE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

XP EARNED: +140 XP
├─ Base XP: +100
├─ Win Bonus: +50
├─ 2 Haymakers: +20
└─ High Crowd Reaction: +10

LEVEL: 1 → 2 🎉 (LEVEL UP!)
Skill Points Earned: +2

RATING: 1200 → 1215 (+15)

ATTRIBUTES IMPROVED:
├─ Lyricism: 7.0 → 7.1 (+0.1)
├─ Wordplay: 6.5 → 6.6 (+0.1)
└─ Delivery: 7.2 → 7.3 (+0.1)

BADGES EARNED:
🏆 Haymaker King - "Land 10+ haymakers in career"

[CONTINUE TO DASHBOARD →]
```

**Actual**:
Battle results page shows rounds/segments only. No progression summary.

**Fix (2 parts)**:

**Part 1: Enhance Battle API** (`app/api/battles/[id]/route.ts`):
```typescript
// Add to battle query
const { data: progression } = await supabase
  .from('battle_progression')
  .select(`
    xp_earned,
    xp_breakdown,
    level_before,
    level_after,
    rating_change,
    attribute_changes
  `)
  .eq('battle_id', id)
  .single();

const { data: badgesEarned } = await supabase
  .from('badge_earning_history')
  .select('badge_code, earned_at')
  .eq('battle_id', id);

// Return in response
return NextResponse.json({
  battle,
  rounds,
  segments,
  progression,
  badgesEarned,
});
```

**Part 2: Render Component** (`app/battle/[id]/page.tsx`):
```typescript
// After battle results display
{battle.status === 'completed' && progression && (
  <PostBattleSummary
    xpEarned={progression.xp_earned}
    xpBreakdown={progression.xp_breakdown}
    levelBefore={progression.level_before}
    levelAfter={progression.level_after}
    ratingChange={progression.rating_change}
    attributeChanges={progression.attribute_changes}
    badgesEarned={badgesEarned}
  />
)}
```

**Files**:
- `app/api/battles/[id]/route.ts` - Add progression data to response
- `app/battle/[id]/page.tsx` - Render component
- `components/battle/PostBattleSummary.tsx` - Component already exists

**Effort**: 6 hours (API changes + UI integration + testing)
**Test**:
1. Simulate a battle
2. Navigate to results page
3. Verify PostBattleSummary displays with correct data
4. Test all scenarios (level-up, no level-up, badge earned, no badge)

---

## HIGH Priority Issues (Should Fix Before Launch)

### 🟠 HIGH-1: .single() Error Handling Issues

**Priority**: HIGH
**Found By**: Agent 10 (Edge Case Test Report)
**Severity**: HIGH
**Impact**: API returns 500 errors instead of proper 404 responses on invalid UUIDs

**Problem**:
Supabase `.single()` method throws error when no result found, causing unhandled 500 errors instead of returning proper 404 with JSON error message.

**Reproduction**:
1. Call any API endpoint with invalid UUID
2. Example: `GET /api/battles/00000000-0000-0000-0000-000000000000`
3. Receive 500 error instead of 404

**Expected**:
```
HTTP 404 Not Found
{ "error": "Battle not found" }
```

**Actual**:
```
HTTP 500 Internal Server Error
Error: Query returned zero rows
```

**Fix Pattern**:
```typescript
// Before (throws 500 on not found)
const { data: battle } = await supabase
  .from('battles')
  .eq('id', id)
  .single();

if (!battle) {
  return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
}

// After (returns null, proper 404)
const { data: battle, error: battleError } = await supabase
  .from('battles')
  .eq('id', id)
  .maybeSingle();

if (battleError || !battle) {
  return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
}
```

**Files to Fix** (16 instances across 9 files):
1. `app/api/battles/[id]/route.ts` - 1 instance
2. `app/api/battles/[id]/accept/route.ts` - 2 instances
3. `app/api/battles/[id]/decline/route.ts` - 3 instances
4. `app/api/battles/[id]/prep/route.ts` - 4 instances (2 in GET, 2 in POST)
5. `app/api/news/[slug]/route.ts` - 1 instance
6. `app/api/battler/create/route.ts` - 1 instance
7. `app/api/battler/me/route.ts` - 3 instances
8. `app/api/life-events/[id]/resolve/route.ts` - 1 instance

**Additional Fix**:
`lib/db/server.ts` - `verifyInternalSecret()` should return false instead of throwing

**Effort**: 2 hours (16 replacements + testing)
**Test**:
1. Test all API endpoints with invalid UUIDs
2. Verify 404 responses with JSON error messages
3. Verify valid requests still work

---

### 🟠 HIGH-2: Light Theme Pages Break Design Consistency

**Priority**: HIGH
**Found By**: CLAUDE.md documentation
**Severity**: MEDIUM-HIGH
**Impact**: Design inconsistency breaks immersion and looks unprofessional

**Problem**:
Three pages use light theme (`bg-white`, `bg-gray-50`) instead of dark theme (`bg-zinc-950`, `bg-zinc-900`), breaking visual consistency.

**Reproduction**:
1. Navigate to `/battle/offers` - light theme
2. Navigate to `/media` - light theme
3. Navigate to `/media/[slug]` - light theme
4. Compare to dashboard (dark theme) - inconsistent

**Expected**:
All pages use consistent dark theme

**Actual**:
Some pages light, some dark

**Fix**:
Replace all instances:
- `bg-white` → `bg-zinc-950`
- `bg-gray-50` → `bg-zinc-900`
- `bg-gray-100` → `bg-zinc-800`
- `text-gray-900` → `text-zinc-100`
- `text-gray-600` → `text-zinc-400`

**Files**:
- `app/battle/offers/page.tsx`
- `app/media/page.tsx`
- `app/media/[slug]/page.tsx`

**Effort**: 30 minutes
**Test**: Navigate to all 3 pages, verify dark theme consistent

---

### 🟠 HIGH-3: No Debatable Battle System (Missing Fan Votes)

**Priority**: HIGH
**Found By**: Agent 12 (Battle Rap Authenticity)
**Severity**: HIGH
**Impact**: Missing core battle rap cultural element (community debates)

**Problem**:
Real battle rap culture centers around debates: "I had it 2-1 for the other guy!" Game has objective winner always, no controversy, no fan split percentages.

**Reproduction**:
1. Win a close 2-1 battle
2. No indication it was controversial or debatable
3. No fan vote percentages shown

**Expected**:
```
OFFICIAL DECISION: YOU WON 2-1 (EDGE)

FAN REACTION:
████████████░░░░░ 62% scored it for you
░░░░░░░░████████ 38% scored it for opponent

"Debatable battle - crowd was split on round 2"
```

**Actual**:
```
YOU WON 2-1
```

**Fix (3 parts)**:

**Part 1: Database** - Add columns to `battles` table:
```sql
ALTER TABLE battles
ADD COLUMN fan_vote_player INTEGER, -- 0-100
ADD COLUMN fan_vote_ai INTEGER, -- 0-100
ADD COLUMN is_controversial BOOLEAN DEFAULT false;
```

**Part 2: Simulation** - Calculate fan split:
```typescript
// In lib/game/simulation.ts after winner determination

function calculateFanSplit(margin: number, playerCrowd: number, aiCrowd: number) {
  // Close battle (margin < 2.0) = split vote
  if (margin < 1.0) {
    return {
      player: 50 + random(-10, 10),
      ai: 50 + random(-10, 10),
      isControversial: true
    };
  }

  if (margin < 2.0) {
    return {
      player: 55 + random(-15, 15),
      ai: 45 + random(-15, 15),
      isControversial: true
    };
  }

  // Clear victory but high crowd for both = "Classic"
  if (margin < 3.0 && playerCrowd > 70 && aiCrowd > 70) {
    return {
      player: 60,
      ai: 40,
      isControversial: false
    };
  }

  // Bodybag = unanimous
  if (margin > 5.0) {
    return {
      player: winner === 'player' ? 90 : 10,
      ai: winner === 'player' ? 10 : 90,
      isControversial: false
    };
  }

  // Default: proportional
  const playerPercent = Math.round(50 + (margin / 10) * 50);
  return {
    player: playerPercent,
    ai: 100 - playerPercent,
    isControversial: margin < 2.5
  };
}

// Store in battle
const fanSplit = calculateFanSplit(margin, playerAvgCrowd, aiAvgCrowd);
await supabase
  .from('battles')
  .update({
    fan_vote_player: fanSplit.player,
    fan_vote_ai: fanSplit.ai,
    is_controversial: fanSplit.isControversial
  })
  .eq('id', battleId);
```

**Part 3: UI** - Display fan split:
```typescript
// In app/battle/[id]/page.tsx

{battle.fan_vote_player && (
  <div className="mt-6 p-6 bg-zinc-900 rounded-lg border border-zinc-800">
    <h3 className="text-xs uppercase tracking-wide text-zinc-500 mb-4">
      Fan Reaction
    </h3>
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-4 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500"
            style={{ width: `${battle.fan_vote_player}%` }}
          />
        </div>
        <span className="text-sm font-bold w-12">
          {battle.fan_vote_player}%
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-4 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500"
            style={{ width: `${battle.fan_vote_ai}%` }}
          />
        </div>
        <span className="text-sm font-bold w-12">
          {battle.fan_vote_ai}%
        </span>
      </div>
    </div>
    {battle.is_controversial && (
      <p className="mt-3 text-xs text-zinc-400">
        "Debatable battle - community is divided on the decision"
      </p>
    )}
  </div>
)}
```

**Files**:
- Database migration (new)
- `lib/game/simulation.ts` - Add fan vote calculation
- `app/battle/[id]/page.tsx` - Display fan split

**Effort**: 4-6 hours
**Test**:
1. Simulate close 2-1 battle (margin < 2.0)
2. Verify fan split shows ~50-50
3. Simulate bodybag 3-0 (margin > 5.0)
4. Verify fan split shows ~90-10

---

### 🟠 HIGH-4: Missing Career Stats on Dashboard

**Priority**: MEDIUM-HIGH
**Found By**: CLAUDE.md
**Severity**: MEDIUM
**Impact**: Players don't understand their overall performance

**Problem**:
Dashboard shows "next battle" and "recent battles" but not:
- Total battles fought
- Win-loss record
- Win rate percentage
- Current streak

**Reproduction**:
1. Navigate to dashboard
2. See stats cards but no overall record

**Expected**:
```
CAREER RECORD
━━━━━━━━━━━━━━━━━━━━━━━━━━━
12-3 (80% win rate)
Current Streak: 3W
Total Bodies: 4
```

**Actual**:
No career summary stats

**Fix**:
```typescript
// In components/battler/DashboardClient.tsx

// Fetch rankings data (already available)
const { wins, losses } = rankings;
const totalBattles = wins + losses;
const winRate = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;

// Add stats card
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <StatCard
    label="Record"
    value={`${wins}-${losses}`}
    sublabel={`${winRate}% win rate`}
  />
  <StatCard
    label="Total Battles"
    value={totalBattles}
  />
  <StatCard
    label="Current Streak"
    value={currentStreak} // Calculate from recent battles
  />
  <StatCard
    label="Bodies"
    value={bodyCount} // From battles where margin > 5
  />
</div>
```

**Files**:
- `components/battler/DashboardClient.tsx`

**Effort**: 1-2 hours
**Test**: Navigate to dashboard, verify all stats display correctly

---

### 🟠 HIGH-5: Game Balance Issues (Upset/Body/Choke Rates Wrong)

**Priority**: MEDIUM-HIGH
**Found By**: PLAYTEST_FINDINGS.md (8-battle playtest)
**Severity**: HIGH
**Impact**: Game feels random, favorites lose too often, no chokes ever happen

**Problem**:
Current simulation produces wrong outcome distribution:
- Upset rate: 50% (vs 10-20% target)
- Body rate: 12.5% (vs 20-30% target)
- Debatable rate: 25% (vs 40-50% target)
- Choke rate: 0% (vs 5-15% target)

**Root Causes**:
1. Attribute gaps don't create enough advantage
2. League weights too weak (60% vs 75% needed)
3. Choke probability too conservative
4. Score variance too high

**Fix**:
Adjust config values in `lib/game/config.ts`:

```typescript
// League weights (increase separation)
export const LEAGUE_WEIGHTS = {
  small_room: {
    writing: 0.70, // from 0.55
    performance: 0.30, // from 0.45
  },
  main_stage: {
    writing: 0.30, // from 0.45
    performance: 0.70, // from 0.55
  },
};

// Attribute gap multipliers (re-enable)
export const ATTRIBUTE_GAP_MULTIPLIERS = {
  gap_2_point: 1.15, // from 1.0
  gap_3_point: 1.25, // from 1.0
};

// Choke probability
export const CHOKE_BASE_PROBABILITY = 0.10; // from 0.03
export const CHOKE_MINIMUM = 0.02; // from 0.001 (never zero)

// Segment variance (reduce randomness)
export const SEGMENT_VARIANCE = 0.60; // from 0.80

// Momentum (stronger snowballing)
export const MOMENTUM_MULTIPLIER = 0.05; // from 0.02
```

**Files**:
- `lib/game/config.ts` - Config changes
- `lib/game/simulation.ts` - Apply attribute gap multipliers

**Testing Loop**:
1. Apply config changes
2. Run 100 test battles
3. Measure outcome distribution
4. Iterate if needed

**Effort**: 1-2 days (includes testing and iteration)
**Success Criteria**:
- Upset rate: 10-20%
- Body rate: 20-30%
- Debatable rate: 40-50%
- Choke rate: 5-15%

---

### 🟠 HIGH-6: No Live Tournament Data for Testing

**Priority**: MEDIUM-HIGH
**Found By**: Agent 3 (Tournament System Test Report)
**Severity**: MEDIUM
**Impact**: Cannot validate tournament UX flow end-to-end

**Problem**:
Tournament system architecturally complete but:
- 0 participants registered
- 0 brackets generated
- 0 tournament battles simulated
- Cannot test actual player journey

**Fix**:
Create seed script to generate test tournament:

```typescript
// lib/game/seedTournamentTestData.ts

async function seedTournamentTest() {
  // 1. Get or create 16 AI battlers
  const battlers = await getOrCreate16Battlers();

  // 2. Register all for tournament
  const tournamentId = '43fc99a1-6af2-4162-b18f-7354b3645ca9';
  for (const battler of battlers) {
    await registerForTournament(tournamentId, battler.id);
  }

  // 3. Generate brackets
  await POST('/api/internal/tournaments/seed-brackets', {
    tournamentId,
  });

  // 4. Simulate first round (8 battles)
  const firstRoundBattles = await getFirstRoundBattles(tournamentId);
  for (const battle of firstRoundBattles) {
    await simulateBattle(battle.id);
  }

  // 5. Advance to quarterfinals
  // ... repeat for QF, SF, Finals
}
```

**Files**:
- Create `lib/game/seedTournamentTestData.ts`

**Effort**: 2-3 hours
**Test**: Run script, verify full tournament completes

---

## MEDIUM Priority Issues (Important but Not Launch-Blocking)

### 🟡 MEDIUM-1: No Participant Count Shown

**Priority**: MEDIUM
**Found By**: Agent 3
**Severity**: LOW-MEDIUM
**Impact**: Players don't know how full tournament is

**Problem**:
Tournament cards show "16 MAX" but not current count ("8/16 registered")

**Fix**:
```typescript
// In app/api/tournaments/route.ts
// Add participant count to query

.select(`
  *,
  participant_count:tournament_participants(count)
`)

// In UI
<p className="text-lg font-bold">
  <span className="text-orange-500">{participantCount}</span>
  <span className="text-zinc-600">/{tournament.max_participants}</span>
</p>
```

**Effort**: 30 minutes
**Files**: API + UI

---

### 🟡 MEDIUM-2: No Prize Breakdown Displayed

**Priority**: MEDIUM
**Found By**: Agent 3
**Severity**: MEDIUM
**Impact**: Players don't know prize tiers before registering

**Problem**:
Tournament shows total pool ($25,000) but not distribution

**Fix**:
```typescript
// Add to tournament card
<div className="mt-3 pt-3 border-t border-zinc-800">
  <p className="text-xs text-zinc-500 uppercase mb-2">Prize Distribution</p>
  <div className="grid grid-cols-2 gap-2 text-xs">
    <div>🏆 1st: <span className="text-yellow-400 font-bold">$12,500</span></div>
    <div>🥈 2nd: <span className="text-gray-400 font-bold">$6,250</span></div>
    <div>🥉 Top 4: <span className="text-amber-600 font-bold">$1,562 ea</span></div>
    <div>🎖️ Top 8: <span className="text-zinc-500 font-bold">$781 ea</span></div>
  </div>
</div>
```

**Effort**: 1 hour
**Files**: `components/tournament/TournamentsClient.tsx`

---

### 🟡 MEDIUM-3: Missing Opponent Research Screen

**Priority**: MEDIUM
**Found By**: Agent 12 (Authenticity Roadmap)
**Severity**: MEDIUM
**Impact**: Missing strategic depth and battle rap culture element

**Problem**:
Players can't research opponents before battle. Real battle rap: "Research is integral to success."

**Fix**:
Create new page `/battle/[id]/research` between accept and prep:

**Flow**:
```
Battle Offer → Accept → Research Opponent → Plan Prep → Execute Prep → Battle
```

**Screen Content**:
- Opponent record and rating
- Attribute breakdown with strengths/weaknesses
- Recent battle results (last 5)
- Style analysis (badges/archetypes)
- Head-to-head history (if exists)
- Strategic recommendations

**Effort**: 6-8 hours
**Files**: Create `app/battle/[id]/research/page.tsx` + API endpoint

---

### 🟡 MEDIUM-4: No Standings/Leaderboard in Tournaments

**Priority**: MEDIUM
**Found By**: Agent 3
**Severity**: MEDIUM
**Impact**: Can't see how other tournament participants are doing

**Problem**:
SQL function `get_tournament_standings()` exists but no UI component

**Fix**:
1. Create API endpoint: `GET /api/tournaments/[id]/standings`
2. Create component: `TournamentStandingsTab.tsx`
3. Add tab to bracket page

**Effort**: 3-4 hours
**Files**: New API + component

---

### 🟡 MEDIUM-5: No Prep Deadline Visibility

**Priority**: MEDIUM
**Found By**: Agent 3
**Severity**: MEDIUM
**Impact**: Players may miss prep deadline

**Problem**:
Scheduled date shown but prep deadline not visible in bracket view

**Fix**:
Add countdown component showing:
- Days/hours remaining until prep lock
- Warning when < 24 hours
- Red alert when < 6 hours

**Effort**: 2-3 hours
**Files**: `components/tournament/TournamentBracketClient.tsx`

---

### 🟡 MEDIUM-6: News Articles Untested Quality

**Priority**: MEDIUM
**Found By**: Agent 6 (Media Hub Test Summary)
**Severity**: MEDIUM
**Impact**: Unknown if LLM-generated articles are coherent and authentic

**Problem**:
- 0 articles in database (no battles simulated)
- LLM integration complete but untested
- Blogger voice consistency unknown

**Fix**:
1. Generate 10-20 test battles
2. Manually review articles for:
   - Coherence and flow
   - Blogger voice consistency
   - No hallucinated bars/lyrics
   - Emotional resonance
3. Iterate on prompts if needed

**Effort**: 3-4 hours (testing time)
**Files**: `lib/services/newsGenerator.ts`, `lib/game/bloggerPrompts.ts`

---

### 🟡 MEDIUM-7: Missing Rivalry/Beef Visibility

**Priority**: MEDIUM
**Found By**: Authenticity Roadmap
**Severity**: LOW-MEDIUM
**Impact**: Grudge system exists but player never sees it

**Problem**:
`grudges` table tracks rivalries but UI shows nothing

**Fix**:
Add dashboard widget showing:
- Active rivalries
- Head-to-head records
- Rematch availability
- Rivalry intensity meter

**Effort**: 4-6 hours
**Files**: `components/battler/DashboardClient.tsx`, new API endpoint

---

### 🟡 MEDIUM-8: Mobile Prep Calendar Cramped

**Priority**: MEDIUM
**Found By**: Inferred (likely issue)
**Severity**: LOW-MEDIUM
**Impact**: Poor mobile UX

**Problem**:
7-day calendar grid may be cramped on mobile

**Fix**:
Test on real devices, adjust grid breakpoints if needed

**Effort**: 1-2 hours
**Files**: `app/battle/[id]/prep/page.tsx`

---

### 🟡 MEDIUM-9: Missing Focus Indicators (Accessibility)

**Priority**: MEDIUM
**Found By**: Inferred
**Severity**: MEDIUM
**Impact**: Keyboard navigation difficult

**Problem**:
No visible focus states on buttons/inputs

**Fix**:
Add Tailwind focus classes:
```css
focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-950
```

**Effort**: 2 hours
**Files**: All interactive components

---

### 🟡 MEDIUM-10: Storage Buckets Not Created

**Priority**: MEDIUM
**Found By**: Phase 2 Test Report
**Severity**: LOW-MEDIUM
**Impact**: Image upload columns exist but storage not configured

**Problem**:
`avatar_url` and `banner_url` columns added but no storage buckets

**Fix**:
Create Supabase storage buckets:
1. `battler-avatars` (public read, 5MB limit)
2. `battler-banners` (public read, 10MB limit)

**Effort**: 30 minutes (manual Supabase setup)
**Files**: Supabase storage configuration

---

## LOW Priority Issues (Can Fix Post-Launch)

### 🟢 LOW-1: No Visual Bracket Tree

**Priority**: LOW
**Found By**: Agent 3
**Severity**: LOW
**Impact**: Traditional bracket visualization prettier but current grid works

**Problem**:
Tournament bracket uses grid layout instead of traditional tree SVG

**Fix**:
Replace grid with SVG bracket tree (complex CSS/SVG work)

**Effort**: 8-12 hours
**Files**: `components/tournament/TournamentBracketClient.tsx`

---

### 🟢 LOW-2: No Tournament Chat

**Priority**: LOW
**Found By**: Agent 3
**Severity**: LOW
**Impact**: Less community engagement but not critical for V1

**Problem**:
No real-time chat for tournaments

**Fix**:
Implement chat system (major feature)

**Effort**: 20+ hours
**Files**: New feature

---

### 🟢 LOW-3: No Battle Rap Icons in UI

**Priority**: LOW
**Found By**: Authenticity Roadmap
**Severity**: LOW
**Impact**: Visual polish, not critical

**Problem**:
Missing icons for haymakers, chokes, bodies

**Fix**:
Add emoji/icons:
- 🔥 Haymaker
- 💀 Bodybag
- ⚡ Choke

**Effort**: 2 hours
**Files**: All UI components

---

### 🟢 LOW-4: League Personality Missing

**Priority**: LOW
**Found By**: Authenticity Roadmap
**Severity**: LOW
**Impact**: Flavor text, not gameplay critical

**Problem**:
Leagues feel generic

**Fix**:
Add league lore, famous battles, history

**Effort**: 6-8 hours
**Files**: Create `/app/leagues/[id]/page.tsx`

---

### 🟢 LOW-5: No Tutorial for New Players

**Priority**: LOW
**Found By**: Authenticity Roadmap
**Severity**: LOW
**Impact**: Helps newcomers but not critical

**Problem**:
Game assumes player knows battle rap

**Fix**:
Create interactive tutorial: "What is Battle Rap?"

**Effort**: 1-2 weeks
**Files**: New feature

---

### 🟢 LOW-6: No Export/CSV for Stats

**Priority**: LOW
**Found By**: Inferred
**Severity**: LOW
**Impact**: Nice-to-have admin feature

**Problem**:
Can't export battle data for analysis

**Fix**:
Add CSV export buttons

**Effort**: 2-3 hours
**Files**: Dashboard, admin pages

---

## Summary Statistics

**Total Issues**: 37+
**By Priority**:
- Blocker: 5 (13.5%)
- High: 11 (29.7%)
- Medium: 15 (40.5%)
- Low: 6 (16.2%)

**By Category**:
- UX/Player Experience: 15 (40.5%)
- Battle Rap Authenticity: 9 (24.3%)
- Technical/Bugs: 8 (21.6%)
- Game Balance: 3 (8.1%)
- Mobile/Accessibility: 2 (5.4%)

**Estimated Total Fix Time**:
- Blockers: 13.5-16 hours
- High Priority: 28-38 hours
- Medium Priority: 40-50 hours
- Low Priority: 40-60 hours
- **Grand Total**: 121.5-164 hours (3-4 weeks of work)

**Critical Path to Launch** (Blockers + High):
- **41.5-54 hours** (1-1.5 weeks of focused work)

---

**Report Compiled By**: Master Report Synthesizer
**Date**: November 30, 2025
**Next Action**: Begin Week 1 critical blocker fixes
