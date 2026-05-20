# Multiplayer Design — Current State + PvP Options

**Status:** Decision required from project owner.
**Date:** 2026-05-20

## Where we are right now

The game is **multi-tenant**, not multiplayer. Important distinction:

- ✅ **Multi-tenant means:** Many users have accounts. Each user owns their own battler. RLS enforces that you only see/edit your own data. You and another user can both be playing the game right now, and you don't see each other.
- ❌ **Multiplayer would mean:** Your battler can fight another player's battler. Or you appear in shared league standings. Or you can see another player's media articles. None of that exists today.

The database supports it. The code doesn't connect it.

### Evidence in code

- `battlers.user_id UUID REFERENCES auth.users(id)` — every battler belongs to either a user or nobody (AI = `user_id NULL`, `is_ai = true`)
- `battlers.is_ai BOOLEAN` — explicit flag for AI opponents
- `RLS policies on battlers, battler_attributes, prep_blocks, life_events` — scope queries to `auth.uid()`
- `rankings` table is **global** — all users share the same ranking pool, but AI battlers dominate the ranks

### What this means for you, the player

Right now, every player who signs up has the same experience: they fight the same 50+ AI battlers in the same leagues, accumulate the same possible badges, can reach the same tournaments. Two players sitting next to each other are running parallel single-player games on shared infrastructure.

## The three PvP options

### Option A — Synchronous live battles

**Two human players battle in real time. Both are "in" the battle viewer at the same time.**

**Flow:**
1. Player A challenges Player B via the existing offers UI (new flag: `is_pvp = true`)
2. Player B sees the offer with a "live battle requires both online" badge
3. Both players agree on a scheduled time
4. At showtime, both join a battle room. Each player makes content selections per round on their own device.
5. The simulation runs server-side after both submit. Results display simultaneously.

**Effort:** ~4-6 days
- Battle room websocket layer (Supabase Realtime works for this)
- Coordination state machine: waiting/locked-in/simulating/complete
- Lockout on disconnect (5-minute grace period)
- Anti-cheat: simulation runs on server with both inputs

**Pros:**
- Most exciting — feels like a real battle
- Maps onto streaming culture (would be the basis for a future "battle stream" feature)
- Existing in-battle decision system already supports per-round selections

**Cons:**
- Hardest to ship — websocket coordination + drop-out handling is fiddly
- Requires both players to be online simultaneously, which kills participation in early game when player base is small
- Time zone hostility — kills global play

**Use case fit:** End game, after asynchronous PvP is established and there's a player base of regulars.

### Option B — Asynchronous challenges ⭐ recommended first

**Player A challenges Player B. B accepts, picks their prep + content selections at their leisure. Sim runs when both have submitted.**

**Flow:**
1. Player A goes to "Challenge" UI, picks any other player from the discoverable roster
2. System creates `battles` row with both `user_id`s, `status = 'offered_pvp'`
3. Player B gets a notification (existing notifications system already there)
4. B accepts → both `status = 'accepted_pvp'` with own prep deadlines
5. Each player completes prep + content selections independently
6. When both `status = 'locked'`, server runs simulation, both get news article + result notification

**Effort:** ~3-5 days
- Notifications system already exists (migration 20251130041000)
- Battle scheduling system already exists
- New: player discovery UI ("who's online", "challenge by username")
- New: PvP-specific status states + transitions
- New: time-pressure forfeit (if a player doesn't lock in within 72 hours, they auto-forfeit)
- Minor: simulation uses each player's submitted content, no AI-fill

**Pros:**
- Lowest effort, highest reach
- Doesn't require simultaneous play (works across timezones)
- Builds on existing systems (offers, prep, sim, notifications)
- Natural fit for the "career sim" pacing — you challenge someone, then live your real life, come back to results

**Cons:**
- Less "live and electric" than synchronous
- Need to handle the "ghosting" problem (people accepting then never locking in)

**Use case fit:** **First PvP feature to ship.** This is what 95% of multiplayer career sims do (FM, Madden CFM, NBA 2K MyTeam Triple Threat Offline). It works.

### Option C — League seasons (shared standings + scheduled battles)

**Players join a league. Every Sunday at 8pm, the league simulates all scheduled battles for the week — including PvP and AI matches.**

**Flow:**
1. Players sign up for league season at start
2. Schedule generated: each player fights 5-8 opponents across the season (mix of other players + AI)
3. Players complete prep + content selections during the week
4. Simulation runs on the league's "sim day"
5. Standings update; playoff implications visible
6. Season ends with championship bracket

**Effort:** ~5-7 days
- Season state machine (registration → in-progress → playoff → complete)
- Auto-schedule generation (round-robin or balanced)
- Cron-based sim day (Vercel Cron / Supabase scheduled functions)
- Catch-up logic for players who didn't lock in by sim day
- Standings UI
- Playoff bracket

**Pros:**
- Most "career mode" feeling — you're part of a season, you have a record, you have playoffs
- Built-in pacing prevents grinding
- Async by design — no waiting on specific opponents
- Excellent stickiness (you log in once a week minimum to check your record)
- The `tournaments` table + `tournament_judges` (mig 20251129180000) are most of this already

**Cons:**
- Doesn't satisfy "I want to fight my friend right now" use cases
- Requires consistent player base per league for healthy seasons
- More UI surface area

**Use case fit:** Second PvP feature, after async challenges prove demand.

## Recommended sequence

1. **Phase 1 (next):** Ship Option B (async challenges). 3-5 days. Smallest blast radius, biggest unlock — players can interact for the first time.
2. **Phase 2 (after Phase 1 metrics):** Add Option C (league seasons). Builds on async challenges. The tournament system is already most of this.
3. **Phase 3 (only if synchronous demand emerges):** Add Option A as a premium "showcase battle" mode for streamers/influencers.

Don't try to build all three at once.

## What I would NOT do

- ❌ **Don't make the game realtime synchronous as the default.** It will kill the player count.
- ❌ **Don't merge player and AI battler tables differently.** The current `is_ai` flag is the right design — keep it. PvP just means *both* battlers in a battle have `is_ai = false`.
- ❌ **Don't put PvP behind a paywall in early days.** You need the activity to keep early players engaged.
- ❌ **Don't add public-Twitter-style social feed until you have battles to react to.** Order of operations: battles → reactions → social.

## Implementation notes for Option B

These are the things I would touch first if you say "ship async PvP":

1. **New migration:** `add_pvp_battle_status.sql` — add `'offered_pvp'`, `'accepted_pvp'`, `'awaiting_lockin'` to the battle status enum
2. **New table:** `pvp_invitations` (challenger_id, challenged_id, status, expires_at) — separate from `battles` so we don't pollute the main battles table with pre-acceptance state
3. **New route:** `app/challenge/page.tsx` — discover other players, send a challenge
4. **New route:** `app/challenge/[id]/accept/page.tsx` — accept/decline incoming challenges
5. **Modify `lib/game/simulation.ts`:** Add a path where both `playerContentSelections` and `opponentContentSelections` come from real users, no AI fill
6. **Modify `lib/services/battleOffers.ts`:** Don't generate offers vs. other humans (only AI offers go through this service)
7. **New cron:** `/api/internal/expire-pvp-invitations` — cancel invitations past their `expires_at`

If you greenlight Option B in the morning, this is the first 8-hour chunk of work.

## Open questions (need your decision)

1. **Should there be player discovery / "online now"?** Or only friend-challenges via shared invite codes?
2. **What happens to ELO when a player ghosts a PvP challenge?** Forfeit = full loss? Smaller penalty? No penalty?
3. **Does PvP affect career stats?** I.e., do PvP wins count toward "Wins" stat, badge progression, etc.? Or are they separate?
4. **Cross-league PvP?** Can a player in "Text Wars" challenge a player in "Royal Rhyme"? If so, whose league rules apply?
5. **Same-user-on-two-accounts prevention.** What's the anti-Smurf strategy?

Answer these in OVERNIGHT_REPORT.md's "decisions needed" section tomorrow and we can scope.
