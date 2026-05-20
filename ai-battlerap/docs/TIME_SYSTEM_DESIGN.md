# Time System Design — Decision Required

**Status:** ⚠️ The game has a partial time implementation. You need to pick a model before the next feature lands.

> **Note:** An earlier `TIME_SYSTEM_DECISION.md` exists at the repo root with a strikingly similar conclusion (Option A: action-based with weekend bonuses). This doc was written without having read that one first. **Both docs land on the same answer** (action-based / session-based / per-player game day). Treat them as independent confirmation, not duplicate proposals. The earlier doc additionally surfaces:
> - 4 numbered questions (time model, prep length, life-event deadline type, weekend bonus)
> - "Immediate blockers" list — dev trigger 500 error, dashboard integration, post-battle storyline trigger, player choice endpoint
> - A 5-step rollout plan
>
> If you greenlight Option 3 here, also resolve those 4 questions from the root doc.

## Current state of time in the codebase

### What exists

1. **Real-time timestamps everywhere.** `battles.scheduled_at` is an actual ISO timestamp. Prep blocks have dates. News articles have `published_at`. Life events fire on real dates.

2. **Dev-mode time manipulation** (`ai-battlerap/lib/dev/timeManipulation.ts`):
   - `getVirtualNow()` returns real time *unless* `DEV_MODE=true` and `NODE_ENV=development`
   - `advanceTime(days)` adds milliseconds to an in-memory offset (resets on server restart)
   - Used by `/api/internal/run-due-battles` to allow simulating future battles "now"

3. **Battle offer scheduling** (`lib/services/battleOffers.ts`): offers are scheduled `scheduled_at` days in the future from real now.

4. **Career days system** (root tree only — migration `20251210100000_add_career_days_system.sql`). I haven't read its internals deeply but the name suggests a game-day counter separate from real time. **This contradicts the real-time approach in ai-battlerap.** Same project, two time models in two trees — needs reconciling.

5. **Time/economy/cities** (mig 20251125030000) — adds city-based economy, presumably with time-based revenue. Couples economy to whatever time model wins.

### What's broken or ambiguous

- Real-time scheduling means a player has to wait days between offered battle and battle day. There's a dev bypass but no production model for "speeding up time" or "playing a session".
- Career days suggest you live multiple game-days per real-time-day, but the implementation isn't connected to ai-battlerap.
- Players coming back after a 5-month gap (like you just did) see "scheduled_at" timestamps from December — battles are "missed".
- Multi-tenant + real time = players in different timezones experience different game states at the "same time."

## The three time models

### Option 1 — Real-world clock (current default)

**"Game time = real time. A battle scheduled for Tuesday at 8pm happens Tuesday at 8pm."**

**Pros:**
- Simplest mental model
- News articles have real publish dates that feel current
- Multiplayer scheduling is intuitive ("let's battle Friday")
- Already mostly built

**Cons:**
- Slow career progression — you'd play 1 battle a week if you want a "career feel" between battles
- Players who can't log in regularly fall behind
- Doesn't fit a single-session play style
- "I want to grind through 10 battles tonight" is impossible without dev bypass

**Best for:** A casual companion-app style game where you check in daily for 10 minutes and the game is structured around your real schedule.

---

### Option 2 — Accelerated tick (real hour = N game days)

**"1 real hour = 1 game day. A battle scheduled '7 days from now' happens in 7 real hours."**

**Pros:**
- Players can play a full career in a few real-time weeks
- Single-session play possible (an evening = a week of career)
- Day-night cycle in game maps roughly to "morning session, evening session" in real life
- Career days system from root tree makes most sense here

**Cons:**
- Needs background workers to advance state when no one's online (or accept that the world "pauses")
- Scheduling is harder to communicate ("your battle happens at 11pm tonight, real time")
- Notifications fire at weird hours unless capped

**Best for:** A career sim where you want to feel progression over weeks, not years.

---

### Option 3 — Session-based time (player-driven advancement)

**"Game time only moves when the player advances it. Game day 1 → 2 happens when you click 'next day' or simulate a battle."**

**Pros:**
- Players can play at their own pace
- "Catch up after 5 months away" works — you just resume at the day you left
- Single-session "play 10 battles in a row" works naturally
- Each player has independent time — no global clock
- Closest to Football Manager, Madden CFM, NBA 2K MyGM models

**Cons:**
- Multiplayer is harder — async PvP needs both players to "be on the same day" or accept time drift
- Shared media (news articles) gets weird — Player A's "today" might be Player B's "two weeks ago"
- League seasons need a global "season day" that progresses by majority vote / scheduled tick

**Best for:** Career sim where the player is the protagonist and the world bends to their pace. **Most natural fit for the existing UI flow** (you accept an offer → you prep → you battle → repeat).

## My strong recommendation: Option 3 (session-based) with multi-tenant nuance

Most concretely:

- **Per-player game day counter.** Each player has their own `game_day` integer. Time progresses when they sim a battle, complete a prep cycle, or explicitly advance.
- **Battles have `game_day_scheduled`, not `scheduled_at` real timestamp.** You can battle on game day 47 whenever your real time gets you there.
- **AI events fire on player's game day.** Life events, badge unlocks, ranking shifts.
- **PvP coordination layer.** When player A challenges player B:
  - Battle is scheduled at "game day N of whoever clicks 'simulate' last"
  - Both players' game_day advances by the battle's duration
  - This is a small bit of coordination but doesn't require synchronizing whole worlds
- **Leagues + tournaments use season-day, which IS a global clock.** A league season is "all participants must reach season-day 90 within 30 real-time days, or auto-forfeit unfinished battles."
- **Media articles are scoped per-player by default**, with optional global feed for league-wide stories (which use season-day).

This preserves the current UI (still see "scheduled for game day 12") while enabling true single-session play AND eventual PvP without ripping out timestamp infrastructure.

### Migration path

1. Add `game_day INTEGER NOT NULL DEFAULT 1` to `battlers`
2. Add `game_day_scheduled INTEGER` to `battles` alongside existing `scheduled_at`
3. Update battle offer generation to use `game_day_scheduled`
4. Update prep calendar to show "game day X" alongside (or instead of) real dates
5. Add "advance time" button to dashboard
6. Phase out real `scheduled_at` over a few releases; keep it for notification purposes only

### Cost estimate

- ~3-4 days for the migration + UI + simulation runner updates
- Compatible with the career_days work already done in the root tree (probably can be merged)
- Compatible with the dev-mode `advanceTime()` (just becomes the player-visible mechanism)

## What I would do tomorrow if you greenlight Option 3

1. Read `supabase/migrations/20251210100000_add_career_days_system.sql` in root (I haven't yet) to see if it's compatible
2. Confirm if career_days is per-player or global
3. If per-player and compatible → port the migration to ai-battlerap, then wire it through the simulation flow
4. If global → write a new migration with the per-player model, document why career_days was abandoned
5. Smoke test: complete a full battle flow with game_day advancing

## What needs your decision

1. **Pick a model (1, 2, or 3).**
2. **If 3 (session-based):** Do you want the league/tournament global clock or pure per-player time everywhere?
3. **PvP timing:** When two players battle, whose game_day "wins"? My recommendation: the slower player's, so neither gets a competitive advantage from playing more.
4. **Real-world time references:** Should AI-generated news articles use real dates ("posted Tuesday at 8pm") or game dates ("Day 47 of the season")?

Don't try to answer all four right now. Just pick the model and we can scope the rest.
