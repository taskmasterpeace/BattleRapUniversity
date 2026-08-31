# Multiplayer: How Time & Battles Work
*Design direction — 2026-08-31. Builds on TIME_SYSTEM_DECISION.md (owner call: Option A, action-based, with weekend enhancement). Explain-and-suggest doc; nothing here is implemented yet beyond what's marked.*

## The one-sentence answer
**Players never wait real days doing nothing.** Time in a battler's career is **action-based** (a "prep day" is a choice you spend, not a calendar day that has to pass) — while the **shared world** (events, seasons, rankings, media) runs on the real calendar. A battle between two humans fires when **both lock prep** or when a **real-time deadline** hits, whichever comes first.

## Two clocks, cleanly separated

### 1. Your career clock (action-based — Option A)
- Career days advance only when you DO things: prep slots, life-event choices, battles.
- A full prep phase (10–14 slots) can be played in one sitting or across a week of coffee breaks.
- Idle ≠ falling behind. A daily player and a weekend player both get complete careers.
- Life-event deadlines are **duration-from-trigger** ("72h from when it hit you"), not calendar dates.

### 2. The world clock (real calendar — shared by everyone)
- **Card Nights** (Fri–Sun): scheduled event cards that sim at showtime, spectators welcome.
- **Seasons**: 3-month circuits — season rankings, soft ELO reset, championship bracket.
- **The Wire / newsroom**: articles, predictions, beef-tracking on a real cadence, so the world feels alive even when you're not battling.

Career-day counts never need to sync between players — Player A on career day 300 can battle Player B on day 12. **ELO lives above the timelines** (your doc's key insight; keep it law).

## What actually happens when two humans battle (async PvP — the core loop)

```
1. BOOKING     Call-out or matchmaking offer → both accept.
               Battle row created: status 'accepted', a REAL deadline stamped
               (deadline_at = accept + 48h default; league-tuned: small room 24h,
               main stage 72h) and prep_slots per side (league-tuned 10–14).

2. PREP        Both sides spend prep slots WHENEVER they want — 2am, lunch break,
   (async,     one sitting. Blind by default: you can't see their allocation.
    blind)     (Research prep can reveal a partial scout — that's gameplay.)
               Either side can hit LOCK IN early.

3. FIRE        The sim runs at the FIRST of:
               • both players locked  → fires immediately (could be 20 minutes
                 after booking if both are online and eager)
               • deadline_at reached  → auto-lock both with whatever prep exists
                 (the existing no-show/minimal-prep penalty rules apply — ghosting
                 punishes the ghost, never blocks the opponent)

4. THE DROP    Results land as an EVENT for both: push/notification, recap article
               in a blogger's voice, The Wire reacts, rivalry/grudge updates,
               watch-the-tape replay available forever. Neither player ever needed
               to be online at the same time.
```

**Worst-case wait = the deadline you agreed to when booking (24–72h), and it's full of things to do** — prep, hype articles, predictions, other battles. Typical wait between two active players: hours, not days.

### Why not live/synchronous battles?
- The sim is stat-based — there's no mid-battle input to synchronize.
- Timezones + mobile sessions make "both online now" the enemy of a global player pool (your own no-chat / clean-experience instinct too).
- The *feeling* of live events comes from the world clock instead (Card Nights below), where being online together is a bonus, never a requirement.

## Suggestions (ranked, with what already exists in code)

1. **Dual-clock battles (the recommendation above).** Add `deadline_at` + `locked_by_player/opponent` to battles; auto-lock job at deadline. *Already built:* prep blocks, `lock_prep_at`, no-show penalties, the whole sim.
2. **Battle slots per real day.** N battles bookable per real day (e.g. 3) + earnable bonus slots. Stops career-speedrunning, creates a daily comeback loop, keeps ELO seasons meaningful. *Already built:* `battlers.slots_used_today`, `slots_reset_at`, `bonus_battle_slots` columns are sitting in the schema unused.
3. **Card Nights (your weekend idea, as opt-in not gate).** Book your battle onto Friday's card → it sims live in sequence at showtime with a spectator room, blogger predictions before (Jesse Rican calling cards he might also be ON), reactions feed after. 2x clout/rep for card battles. Miss showtime? Results are waiting. *Already built:* flyer system for the card art, bloggers for predictions, The Wire brief for reactions-as-gameplay.
4. **Seasons.** 3-month circuits on the world clock: season leaderboard per league + city, soft ELO reset, finale bracket on a Card Night. *Already built:* rankings, tournaments/bracket page.
5. **Matchmaking + call-outs.** Matchmaking = ELO-band offers from the global human pool (career-day agnostic). Call-outs = direct challenge with accept/decline; declines after N cost a little rep ("ducking" is a real battle-rap storyline — let the media write about it). *Already built:* call-outs page, offer generation, rivalry/grudge system.
6. **Spectating & co-presence without chat.** Watch any completed battle; react on The Wire with template reactions (no free chat = no moderation nightmare). Follow battlers; their results hit your feed.

## Phasing (each phase shippable alone)
- **V1.5 — Shared world** *(mostly exists)*: all players in one universe — shared leagues, city scenes, rankings, media; battles still vs AI. Multiplayer = competing on the same leaderboards and being written about in the same press.
- **V2 — Async PvP**: the dual-clock loop above (booking → blind prep → first-of lock/deadline → drop). This is the real "multiplayer battle" ship.
- **V2.5 — Card Nights + spectating + predictions.**
- **V3 — Seasons + championships.**

## Open knobs (defaults proposed, owner to confirm)
| Knob | Default | Notes |
|---|---|---|
| PvP deadline | 48h (24h small room / 72h main stage) | agreed at booking, shown on the flyer |
| Prep slots | league-tuned 10–14 | matches existing prep design |
| Daily battle slots | 3 + bonus | wires the existing columns |
| Weekend bonus | 2x clout on Card Night battles only | keeps weekdays fully playable |
| Scouting | research prep reveals opponent's top prep category only | blind-but-scoutable |
