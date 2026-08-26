# BATTLE NIGHT EXPERIENCE v2.2 — Design Spec

**Status**: Design-complete, build-ready. Written 2026-08-26. **v2.1 same day**: critic-pass revision — illustrated scenes (portraits/flags/stage states), the full template pool shipped as a reviewed contract (Appendix A), cross-battle career continuity, sound + posture timer promoted to P1, `LaneReaction` and OFF-THE-TOP EV formally defined. **v2.2 same day**: round-1 harsh-critic fixes — the template pool now honors its own coverage rule (`any` cells shipped for `closer`, `stumble`, `rebuttal`); the haymaker mid-band (crowd 55-69) gets its own beat + templates (`haymaker`, §4.1/A.4) instead of falling through to `building`; `SceneState` (§4.0.5) and `PostureEffects` (§3.3) are typed contracts grounded line-by-line in `simulateSegment`; the 15s posture timer gains a first-battle grace (§3.2.1); every scene state ships a wireframe comp + named real-world reference frame (§4.0.6).
**Owner verdict on v1**: "This is not it, bro." The round results and final screens read as static stat dashboards, not a battle. And: **"Some battlers can rebuttal — they do things DURING rounds."**
**Grounded in**: `docs/design/research-battle-dynamics.md`, `research-reference-games.md`, `research-letstalkbattlerap.md`, and the shipped code in `app/battle/[id]/*`, `lib/game/simulation.ts`, `lib/game/singleRoundSimulation.ts`.

---

## 0. Laws (non-negotiable, restated for every implementer)

1. **NO generated bars/lyrics anywhere.** We describe moments, schemes, angles, and crowd reactions. We never quote a line. (The research source, letstalkbattlerap.com, never quotes full bars in recaps either — this is the culture's own recap voice.) Every template that ships must pass the lint test in §7.7 — the rule is enforced in CI, not in a comment.
2. **NO purple.** No violet/indigo/lavender/magenta in any component, chart, flash, gradient, or scene state. The choke scene's "cold" tone is steel-slate (`#1a2530` family), never anything in the 270-320 hue band.
3. **The winner does NOT get paid more.** Pay is the negotiated flat booking fee, settled before the battle. Winning pays in rep, rating, fans, and bigger future bookings — the results screen must present it exactly that way.
4. **Players never write text.** Every choice is a selection (posture, content, timing) — attribute/choice-based sim.
5. **Dark battle-surface theme.** Use the shipped battle tokens (see §6). Headers `font-display font-black uppercase tracking-tighter`.
6. **Everybody's from somewhere, and everybody has a face.** Any battle-night surface that presents a battler (MomentCard, PosturePicker, Round Cards, FinalScorecard) renders their **portrait** (`battlers.avatar_url` — 100% seeded coverage, 920/920) and their **origin flag** worked into the plate background — a real flag (vendored Twemoji Country Flags font or SVG rects), **never** regional-indicator letter-pair fallback, never omitted. See §4.0.

---

## 1. What's wrong with v1 (file-by-file diagnosis)

| Surface | File | Problem |
|---|---|---|
| Round results | `app/battle/[id]/round/[roundNum]/results/page.tsx` + `components/battle/RoundResultsBreakdown.tsx` | A winner banner and four stat panels appear **instantly**. The round never *happens* — no reveal, no pacing, no crowd. Off-system styling (`rounded-lg`, `bg-orange-600`, sentence case, green/red winner banner) predates the design system. Content effectiveness panels dump raw multipliers (`1.23x`) at the player. |
| Round loop | `select/page.tsx` → `simulate` → `results` | Both battlers' rounds simulate **simultaneously** and reveal together. There is no turn order, so there is nothing to react to — the defining live skill of battle rap (the rebuttal) is structurally impossible. |
| Interactive sim | `lib/game/singleRoundSimulation.ts` | Computes `momentum_delta` per round but **never carries momentum between rounds** — the auto path (`simulateBattle`) does (`CONFIG.MOMENTUM_*` loop, simulation.ts:171-267). Career parity gap. |
| Final results | `app/battle/[id]/page.tsx` | The score is in the header, then the page becomes an archive: round tabs, tale of the tape, expandables. No "who won the internet" verdict, no moment-first storytelling, no fan split — but *"the debate IS the product"* (research §2). |
| THE INTERNET | `components/battle/TheInternet.tsx` | Takes are built from a candidate pool + seeded pick with **no result-consistency contract** — filler like "I had it closer" can render under a 3-0 bodybag; glaze takes can attach to the wrong battler. Hearts previously rendered negative (signed-shift bug; the unsigned fix at line 134 must be kept + guarded + tested). |
| Continuity | `battles` + `head_to_head_records` + `battler_relationships` (migration 20251127000000) | The DB **already stores** series records, rivalry intensity, and rematch demand — and battle night reads none of it. Every take, moment, and template is single-battle scoped: no rematch awareness, no "he's choked against this guy before", no streak talk. The night is dramatic but the career isn't. |
| Data | `battle_segments` / `battle_rounds` | **All the data needed for a dramatic reveal already exists and is unused**: per-segment `segment_score`, `event_flags` (haymaker/choke/stumble), `crowd_reaction` (migration 20251124140000), `primary_content_type` / `delivery_type` / `performance_type` (migration 20251129170000). |

---

## 2. The new battle-night loop (state machine)

### 2.1 Turn order — the missing spine

Real battles have a turn order and it is contested infrastructure ("the Turn Order Effect", research-letstalkbattlerap §5). The badge system already models it: `Freestyle Genius.rebuttalBonus: +10% when going second` (`lib/game/badges.ts:137`). We make it real:

- At lock-in (`/api/battles/[id]/lock-in`), a **seeded coin flip** sets `battles.first_turn_battler_id`. That battler performs first **every round** (authentic: order is set before the battle, not per round).
- Going **second** = you heard their round before yours = **rebuttal window exists**. Going first = you set the tone but can't flip anything.
- Surface it on the control screen ("YOU'RE UP FIRST" / "THEY OPEN — YOU GET THE LAST WORD") so the flip is a felt event. Under it, one **career line** from `CareerContext` (§5.6) when this isn't a first meeting: `THIRD MEETING — SERIES 1-1` / `HE'S 2-0 ON YOU`.

### 2.2 Per-round flow (interactive "LOCKED IN" mode)

Round N, player goes SECOND (the richer path):

```
awaiting_rN_content        player picks content (existing select page)
        │  POST /rounds/N/content
        ▼
rN_first_half              AI half simulated + persisted (rounds+segments for AI only)
        │  auto (server simulates on content POST)
        ▼
   [WATCH: opponent's MOMENT FEED plays]        ← §4
        ▼
rN_awaiting_response       player picks RESPONSE POSTURE (15s soft timer)   ← §3
        │  POST /rounds/N/posture
        ▼
rN_simulated               player half simulated WITH posture modifiers
        ▼
   [WATCH: your MOMENT FEED plays]
        ▼
   [ROUND CARDS: head-to-head verdict for round N]   (reworked results page)
        ▼
awaiting_r(N+1)_content    … or finalize after R3 (existing finalizeInteractiveBattle)
```

Player goes FIRST: posture is picked **with** content (rebuttal option locked with reason — "YOU'RE UP FIRST — NOTHING TO FLIP YET"), player half simulates and reveals, then AI half (AI picks its posture from §3.6) simulates and reveals, then round cards.

**AUTO mode** is untouched in flow but gains parity: `simulateBattle` calls the same posture auto-picker for both battlers (§3.6) so auto battles produce the same event vocabulary (`rebuttal_landed`, `off_top`) and the results screens read identically.

New `battles.status` values: `rN_first_half`, `rN_awaiting_response` (N=1..3). Existing `awaiting_rN_content` and `rN_simulated` keep their meanings — dashboards that filter on them do not break.

---

## 3. MID-ROUND / REACTIVE PLAY — the Response Posture system

This is the owner's core note. The moment you've just watched the opponent's half is the authentic reactive beat: real battlers fire rebuttals **at the top of a round** answering what the opponent just said (research §1 — A. Ward's "Glock 40" rebuttal was Moment of the Year over thousands of written bars).

### 3.1 The three postures

Presented CK3-style: 2-4 options, gated options **shown locked with their requirement** (pattern P3), gold flag = rare opportunity, red flag = risky (pattern P4).

| Posture | Flavor copy (describe, never quote) | Flag | Gate |
|---|---|---|---|
| **STICK TO THE SCRIPT** | "Trust the pen. Deliver what you wrote the way you rehearsed it." | none (safe) | always available |
| **GO REBUTTAL-HEAVY** | "Open by flipping what they just did — their choke, their angle, their energy — before your written material." | RED (risky) — turns GOLD (opportunity) when the opponent's half contained a choke | going second AND (`researchDays ≥ 1` OR `'rebuttals'` in this round's content types OR badge `Rebuttal King/Queen`) |
| **GO OFF THE TOP** | "Scrap the script. Freestyle the round off the room's energy." | RED (dangerous), always | badge `Freestyle Genius` OR `creativity ≥ 7` |

Locked examples render greyed: `🔒 GO REBUTTAL-HEAVY — needs 1+ research day, Rebuttals in your round, or Rebuttal King/Queen`. This markets the prep and badge systems inside the battle itself.

### 3.2 Where the choice slots (exact)

- **Going second**: full-screen `PosturePicker` between the opponent's moment feed and your half's simulation (status `rN_awaiting_response`). One choice, under a **15-second soft timer** (§3.2.1) — the reactive beat must *feel* reactive.
- **Going first**: compact `PosturePicker` embedded at the top of the select page (SCRIPT / OFF THE TOP only). **No timer** — nothing live to react to.
- **AUTO mode**: `pickAiPosture()` (§3.6) chooses for the player from badges/situation, exactly like the AI.

**Scene, not menu (law 6).** The full-screen picker renders **on top of the residue of the opponent's half**: the scene stack (§4.0) stays mounted in its final state — if they choked, you choose over the blackout/phones-out room; if they landed a room-shaker, you choose over the surge afterglow. The header is the opponent's `BattlerPlate` (portrait + flag) with their half's #1 moment headline; your own plate sits beside the posture cards. The picker is the moment you're standing in, not a dialog over black.

#### 3.2.1 The soft timer — **P1, ships with the posture system** (promoted from P2)

Without time pressure the "think live" fantasy is a menu you can study indefinitely. The 15s soft timer is the cheapest possible way to make the reactive beat feel reactive:

- **15 seconds**, counted client-side, starting when the picker becomes interactive (after the opponent feed's last beat settles, never mid-animation).
- **First-exposure grace — battle one is untimed.** FM never clocks your first team talk; CK3 never times your first council decision — a new mechanic gets one free read before the clock starts costing you. On the player's **first locked-in battle** the picker runs **untimed**: no bar, no countdown, no auto-default, and a one-line explainer sits in the timer's slot — `NO CLOCK TONIGHT — FIRST WALK. NEXT BATTLE, YOU GET 15 SECONDS.` (`text-[10px] font-mono uppercase tracking-widest text-zinc-500`). The grace applies to the **whole first battle** (all three rounds — one battle = one free read of the whole loop), and the timer is live with no further tutorializing from the player's second locked-in battle on. **Detection is server-derived**: zero prior `completed` locked-in battles for this battler — the battle payload already carries what's needed to count them; mirror the seen-state in `localStorage['bn_timer_seen']` purely to avoid a flash of timer chrome on slow loads, but the server count is the truth (a new device never re-grants the grace). The accessibility toggle (below) is independent and permanent player choice; the grace is the system's own manners, spent once.
- **Visual**: a draining bar directly under the posture cards — `#ff8c42`, shifting to `red-500` over the final 3s — plus a `font-mono tabular-nums` countdown. No tick sound (audio budget is 3 stingers, §4.0.4).
- **Expiry** → auto-select **STICK TO THE SCRIPT**; the round cards later show a `PLAYED IT SAFE — TIMER` receipt chip instead of the normal posture receipt. Client POSTs `{ posture: 'script', autoDefaulted: true }`; server stores `posture_auto` (§7.3) so the receipt and THE INTERNET can reference hesitation honestly.
- **Soft means soft**: no server-side enforcement, timer pauses on `document.hidden` (phone call ≠ punishment), and an accessibility setting (`battle night: posture timer OFF`) disables it entirely — with the timer off there is no auto-default.
- `prefers-reduced-motion`: bar still drains (opacity change, no pulse animation).

### 3.3 Simulation math — in `simulation.ts` terms

All constants go in `SIMULATION_CONFIG` (`lib/game/config.ts`), tuned like chokes were (Tru Foe method). Proposed starting values:

```ts
// === RESPONSE POSTURES (Battle Night v2) ===
POSTURE_REBUTTAL_WINDOW_SEGMENTS: 2,      // rebuttal affects segments 1-2
POSTURE_REBUTTAL_BASE_DIFFICULTY: 6.0,    // roll target
POSTURE_REBUTTAL_RESEARCH_WEIGHT: 0.5,    // + per research prep day
POSTURE_REBUTTAL_MATERIAL_CHOKE: 2.0,     // opp choked their half = free material
POSTURE_REBUTTAL_MATERIAL_COLD: 1.0,      // opp crowd_reaction <= 40 = gettable room
POSTURE_REBUTTAL_MATERIAL_CHASING: -1.0,  // opp landed a haymaker = crowd is theirs
POSTURE_REBUTTAL_MATERIAL_FAMILIAR: 0.5,  // rematch — you know his patterns (§5.6)
POSTURE_REBUTTAL_SUCCESS_SCORE_MULT: 1.25,// segments 1-2 on success
POSTURE_REBUTTAL_FAIL_SCORE_MULT: 0.85,   // segment 1 on failure
POSTURE_REBUTTAL_SUCCESS_CROWD_BONUS: 20, // + segment crowd_reaction (window)
POSTURE_REBUTTAL_MOMENTUM_BONUS: 0.5,     // immediate momentum on land

POSTURE_OFFTOP_VARIANCE_MULT: 1.5,        // × SEGMENT_VARIANCE, whole round
POSTURE_OFFTOP_PEAK_BONUS: 0.10,          // + PEAK_PROBABILITY
POSTURE_OFFTOP_STUMBLE_MULT: 2.0,         // × stumbleProbability
POSTURE_OFFTOP_CHOKE_MULT: 0.5,           // × chokeProbability (no memory to lose)
POSTURE_OFFTOP_HAYMAKER_CROWD_BONUS: 25,  // replaces the standard +15 (crowd respects off-the-top)
POSTURE_OFFTOP_CREATIVITY_GATE: 7,
```

**Plumbing**: `simulateSegment(...)` gains one param, `posture: PostureEffects` (a small resolved struct — never the raw string — computed once per half-round by `lib/game/postures.ts`). `simulateSingleRound` splits into `simulateHalfRound(battlerId, posture, opponentRevealedHalf?)` (§5.2).

#### `PostureEffects` — the typed contract (grounded in `simulateSegment`, simulation.ts:1136-1344)

This is the shape `simulateSegment` actually receives. Every field names the exact line in the shipped code where it applies — the sim never sees the posture string, only this resolved struct:

```ts
// lib/game/postures.ts  (types re-exported from lib/models.ts)
export type Posture = 'script' | 'rebuttal' | 'off_the_top';

export interface PostureEffects {
  posture: Posture;
  rebuttalOutcome: 'landed' | 'missed' | null;  // resolved by the §3.3 roll BEFORE segment sim; null unless posture === 'rebuttal'

  // -- window effects: apply to segments 1..windowSegments only --
  windowSegments: number;        // landed: POSTURE_REBUTTAL_WINDOW_SEGMENTS (2) · missed: 1 · otherwise 0
  windowScoreMult: number;       // × finalScore inside the window, after the SCORE_FLOOR/CEILING clamp input (simulation.ts:1324)
  windowCrowdBonus: number;      // + segmentCrowdReaction pre-clamp — the 0-100 clamp at simulation.ts:1341 still applies
  windowEventFlag: 'rebuttal_landed' | 'rebuttal_missed' | null;  // pushed into `events` on segment 1 only

  // -- whole-round effects: apply to every segment of this half-round --
  varianceMult: number;          // adjustedVariance = SEGMENT_VARIANCE × badgeEffects.segmentVarianceMultiplier × this (simulation.ts:1178)
  peakChanceBonus: number;       // + peakChance AFTER the research-days halving (simulation.ts:1183), before the roll
  stumbleProbMult: number;       // × stumbleProbability immediately BEFORE the STUMBLE_MINIMUM/MAXIMUM clamp (simulation.ts:1219)
  chokeProbMult: number;         // × chokeProbability immediately BEFORE the effectiveMinimum/CHOKE_MAXIMUM clamp (simulation.ts:1313)
  skipWritingPrepChokeReduction: boolean;  // off_top: skip the prep.writingDays × CHOKE_PREP_REDUCTION term (simulation.ts:1260)
  haymakerCrowdBonus: number;    // REPLACES the hardcoded +15 haymaker crowd bonus (simulation.ts:1334) — script passes 15
  contentMultOverride: null | { scope: 'round' | 'window'; value: 1.0 };
      // off_top → { scope:'round' }: the round's content finalMultiplier (calculateRoundSummary, simulation.ts:1363) becomes 1.0
      // missed rebuttal → { scope:'window' }: finalMultiplier blended toward 1.0 weighted by windowSegments / segmentCount
  roundEventFlag: 'off_top' | null;  // pushed into `events` on EVERY segment of the half-round
  momentumBonus: number;         // added to the half-round momentum result (§3.5); landed rebuttal: POSTURE_REBUTTAL_MOMENTUM_BONUS
}
```

**Resolved literals** — what `lib/game/postures.ts` returns for each case. This table IS the normative reading of the prose above and below; if they ever disagree, this table wins:

| Field | SCRIPT (identity) | REBUTTAL landed | REBUTTAL missed | OFF THE TOP |
|---|---|---|---|---|
| `windowSegments` | 0 | 2 | 1 | 0 |
| `windowScoreMult` | 1.0 | 1.25 | 0.85 | 1.0 |
| `windowCrowdBonus` | 0 | +20 | 0 | 0 |
| `windowEventFlag` | — | `rebuttal_landed` | `rebuttal_missed` | — |
| `varianceMult` | 1.0 | 1.0 | 1.0 | 1.5 |
| `peakChanceBonus` | 0 | 0 | 0 | +0.10 |
| `stumbleProbMult` | 1.0 | 1.0 | 1.0 | 2.0 |
| `chokeProbMult` | 1.0 | 1.0 | 1.0 | 0.5 |
| `skipWritingPrepChokeReduction` | false | false | false | true |
| `haymakerCrowdBonus` | 15 | 15 | 15 | 25 |
| `contentMultOverride` | null | null | `{window, 1.0}` | `{round, 1.0}` |
| `roundEventFlag` | — | — | — | `off_top` |
| `momentumBonus` | 0 | +0.5 | 0 | 0 |

`SCRIPT` is exported as the `IDENTITY_POSTURE_EFFECTS` const — every existing `simulateSegment` caller and validation script either passes it or omits the param and receives it as the default, and stays green (§7.2).

**STICK TO THE SCRIPT** — identity `PostureEffects` (`IDENTITY_POSTURE_EFFECTS` above); zero behavior change. The baseline every other posture is balanced against.

**GO REBUTTAL-HEAVY** — one roll per round, resolved *before* segment simulation:

```
rebuttalPower = (creativity + crowd_control) / 2
              + researchDays × POSTURE_REBUTTAL_RESEARCH_WEIGHT
              + badgeEffects.rebuttalBonus × 10          // Freestyle Genius 0.10 → +1.0
              + materialBonus                             // from opponent's revealed half:
                                                          //   choked → +2.0 · cold room → +1.0
                                                          //   they haymakered → −1.0
                                                          //   rematch (career context) → +0.5
landed = rebuttalPower + uniform(−1.5, +1.5) ≥ POSTURE_REBUTTAL_BASE_DIFFICULTY
```

- **Landed**: segments 1..2 `score × 1.25`, `crowd_reaction + 20` (pre-clamp), `event_flags += 'rebuttal_landed'` on segment 1; the half-round's momentum result gets `+POSTURE_REBUTTAL_MOMENTUM_BONUS` (§3.5).
- **Missed**: segment 1 `score × 0.85`, `event_flags += 'rebuttal_missed'`; and for the whole window the content `finalMultiplier` is replaced with `1.0` — you abandoned your prepped, matchup-tuned material and the improv didn't connect.
- Either way segments 3+ run normally (your written material takes over).

Balance intent: with the gate satisfied (say 2 research days, creativity 6, crowd_control 6, no badge, neutral material) power = 7.0 vs difficulty 6.0 → lands ~83%; with **no** research and average stats it's ~50/50 — the gate plus the odds make research prep the rebuttal currency, exactly as the research brief says angles/rebuttals should work. Target after tuning: **55-70% land rate for gated builds** (validate, §7.7).

**GO OFF THE TOP** — whole-round modifiers, applied inside `simulateSegment`:

- `adjustedVariance = SEGMENT_VARIANCE × badgeEffects.segmentVarianceMultiplier × POSTURE_OFFTOP_VARIANCE_MULT`
- `peakChance += POSTURE_OFFTOP_PEAK_BONUS`
- `stumbleProbability × POSTURE_OFFTOP_STUMBLE_MULT` (caps still apply)
- `chokeProbability × POSTURE_OFFTOP_CHOKE_MULT` — you can't blank on lines you never wrote; the failure mode shifts to stumbles, which is culturally right
- haymaker segments get `+POSTURE_OFFTOP_HAYMAKER_CROWD_BONUS` crowd instead of the standard `+15` (simulation.ts:1334)
- content `finalMultiplier` → `1.0` for the round (your prepped matchup edge doesn't apply to improv), **but** writing-prep-based choke reduction is also skipped — freestylers with `lowPrepBonus` badges lose nothing they had
- every segment gets `event_flags += 'off_top'` (feeds presentation + badges later)

**EV targets (numeric — these are validation gates, not vibes; see §7.7):**
- A **prepared non-freestyler** (creativity ≥ 7 gate met, 3+ writing prep days, no `Freestyle Genius`): OFF_TOP round-win rate **3-8 points below** their own SCRIPT baseline.
- A **`Freestyle Genius` walking in cold** (0 prep days): OFF_TOP round-win rate **2-6 points above** their own SCRIPT-cold baseline.
- OFF_TOP rounds produce a haymaker segment at **1.5-2.0×** the SCRIPT rate for the same archetype (the ceiling is the sales pitch; the floor pays for it).

High ceiling (peak-heavy rounds win under `ROUND_JUDGING_PEAK_WEIGHT: 0.35`), low floor.

### 3.4 What the player sees before choosing (two-layer consequence rule, pattern P2)

Each posture card shows **mechanical guarantees** ("Rebuttal window: segments 1-2 · Land: +25% score, big crowd swing · Miss: flat opening, prepped-content bonus lost") and *hints* the hidden layer ("The room remembers who can think live"). Never show the roll math or the exact probability — decision, not spreadsheet.

### 3.5 Momentum parity fix (required, ships with this feature)

`simulateHalfRound` reads the previous round's `battle_rounds` rows (both battlers, `round_index = N-1`, `won` + `average_score` are persisted) and applies the identical `MOMENTUM_DECISIVE_WIN` / `MOMENTUM_CLEAR_WIN` / `MOMENTUM_MULTIPLIER` attribute boost the auto path applies (simulation.ts:171-267). Rebuttal-landed adds `POSTURE_REBUTTAL_MOMENTUM_BONUS` to that carry. This closes the existing interactive/auto divergence and makes the posture swing *felt* in round N+1.

### 3.6 AI (and AUTO-mode) posture selection — `pickAiPosture()`

Deterministic personality + situation, seeded by `fnv1a(battleId + battlerId + round)` (world lives without the player, pattern from CK3 `ai_chance`):

1. Gates first (same gates as the player — AI cheating here would be felt immediately).
2. Weights: base SCRIPT 70 / REBUTTAL 20 / OFF_TOP 10. `Rebuttal King/Queen` → REBUTTAL +30. `Freestyle Genius` → OFF_TOP +25. Down a round after R1 → REBUTTAL +15, OFF_TOP +10 (desperation is authentic). Opponent choked their half → REBUTTAL +25. Opponent has choked against them **in a previous battle** (`CareerContext.opponentChokedVsPlayerBefore`, mirrored for AI) → REBUTTAL +10 (they came in planning to poke the scar). `Overprepared`/`Technical Writer` (conflicts list, badges.ts:938-944) → REBUTTAL −15, OFF_TOP −25.
3. Seeded weighted pick.

### 3.7 P2 (deferred, spec'd for the record): the mid-half audible

True mid-round interruption *inside your own half*: simulate segments 1..⌈k/2⌉, and if `opponentSameSegmentScore − yourScore ≥ 2.5` or you stumbled twice, return HTTP 200 `{ paused: true, at: segmentIndex, state: <opaque token> }`; client offers one audible (PUSH THE PACE / SLOW IT DOWN / GO AT THE CROWD); second call `POST /rounds/N/simulate { resumeToken, audible }` finishes the half with a small modifier set. Requires making `simulateHalfRound` resumable (pass in prior segment array + RNG continuation). **Do not build until §3.1-3.6 has playtest data** — posture-at-the-top already delivers the reactive fantasy at a fraction of the state complexity.

---

## 4. ROUND PRESENTATION — the Moment Feed

Replace the instant stat dump with a **beat-by-beat reveal built entirely from data that already exists per segment**: `segment_score`, `event_flags`, `crowd_reaction`, `primary_content_type`, `secondary_content_type`, `delivery_type`, `performance_type`, `content_effectiveness`. Event = scene, not notification (pattern P1) — and CK3's bar is **illustrated** events. A notification with great copy is still a notification; every beat here renders a *place* (stage, crowd, performer) in a *state*, not a card over black.

### 4.0 The scene stack — the feed is a room, not a card

`RoundMomentFeed` composites four layers, all CSS/inline-SVG, no canvas, no libs:

1. **Backdrop** — the stage itself: a layered CSS gradient scene (floor line, back wall, light cone) with named states (§4.0.2).
2. **Crowd row** — an inline-SVG silhouette strip (heads/shoulders, two arm poses) across the bottom third, in front of the backdrop, behind the card. If a matching sheet exists in the shipped sprite library (1,632 assets — check `public/sprites/` for crowd sheets before drawing new SVG), use it; otherwise the inline SVG ships. States in §4.0.2.
3. **Performer plate** — `components/battle/BattlerPlate.tsx` (§4.0.1): portrait + origin flag + name. The performing battler's plate is always on stage.
4. **Lighting** — flashes, desaturation, vignette, shake. This is the *garnish* layer; it never carries a beat alone (the v2.0 mistake this revision kills).

#### 4.0.1 `BattlerPlate` — portrait + flag, mandated (law 6)

- **Portrait**: `battlers.avatar_url` (seeded at 100% — 920/920; player backfill migration 20260521030000). Render at 96px (feed) / 72px (scorecard) / 56px (picker cards, round cards) in a square plate with the battle-surface border (`border-2 border-[#3a3d44]`, no rounding). **Never an empty square**: if the URL 404s at runtime, fall back to a generated initials medallion on the flag backdrop — but a missing avatar is a data bug to fix, not a state to design around.
- **Flag as backdrop**: the battler's origin flag rendered *behind/under* the portrait as a watermark plate — ~35% opacity, slight desaturation so the portrait reads first, bleeding to the plate edges. Not a tiny inline glyph next to the name; the flag IS the plate's background.
- **Origin data**: new `battlers.home_city_id → cities(id)` (§7.3); `cities.country` already exists. `lib/game/flags.ts` maps country name → ISO code → flag. Render real flags: vendor the `Twemoji Country Flags` webfont (`.flag-emoji` class, same approach as War World) or inline SVG flag rects. **Never** bare regional-indicator letters ("US", "MX"). Fallback chain: home city's country → primary league's city's country → the seed default (USA). It can never render empty.
- **Name strip**: `font-display font-black uppercase tracking-tighter` under the portrait; posture chip (`SCRIPT` / `REBUTTAL` / `OFF THE TOP`) below it during the feed.
- Plate visual states (driven by the active Moment): `lit` (default) · `dimmed` (choke: 60% desaturate, scale 0.96) · `pressed` (stumble: 1-frame dip) · `looming` (room_shaker: scale 1.06 + `#ff8c42` glow).

`BattlerPlate` is shared by: RoundMomentFeed, PosturePicker (both plates — see §3.2), Round Cards header, FinalScorecard, ViralClipCard (clip owner).

#### 4.0.2 Per-kind scene treatment (the illustrated-event table)

Every Moment kind sets ALL four layers. "Desaturate + flash" alone is banned.

| Kind | Backdrop state | Crowd row state | Performer plate | Lighting | Stinger (§4.0.4) |
|---|---|---|---|---|---|
| `opener` | `spotlight` — warm cone snaps on from dark | `settling` — silhouettes drop to still | `lit` | quick fade-up from black | — |
| `building` | `spotlight` | `nodding` — subtle 2px bob loop | `lit` | none | — |
| `heater` | `heat` — cone widens, warm wash +10% brightness | `nodding` (leading lane's third bobs deeper) | `lit` | none | — |
| `haymaker` | `heat` — cone flares amber for 300ms, then holds warm | `up` — leading third arms-up, the rest deep-nod (no forward surge) | `lit` + brief `#ff8c42` edge glow | single `#ff8c42` flash at 25%, 200ms; **no rewind** — it landed clean, the room went, the building didn't | **pop** |
| `room_shaker` | `surge` — backdrop flares amber, cone blows out | `up` — arms-up pose swap, front row translates 6px toward stage | `looming` | 2-frame white→`#ff8c42` overlay 40%, 300ms; **rewind sub-beat**: whole scene rewinds 400ms and replays with `RUN THAT BACK` stamp | **pop** |
| `delayed_pop` | `spotlight` → 900ms dim → `surge` | `flat` for 900ms → `up` | `lit` → `looming` on the pop | dim-then-flash; the silence is the effect | **dead-room** (900ms) then **pop** |
| `rebuttal` (landed) | `surge` variant with the **momentum arrow flipping** across the back wall | `up`, both side thirds | `looming` | orange flash, arrow animation | **pop** |
| `rebuttal_missed` | `spotlight` dims 15% | `flat` — bob stops dead | `pressed` | none (the stillness reads) | **groan** |
| `stumble` | `spotlight` flickers once | `flat`, one silhouette turns to its neighbor | `pressed` | single 4px horizontal jolt | **groan** |
| `choke` | `blackout` — cone collapses, back wall goes steel-slate `#1a2530`, scattered white pinpoints fade in (**the phones come out**) | `turned` — silhouettes rotate half-away, phone-arm pose | `dimmed` | 60% desaturate + slow 4px shake, 4.5s hold; optional CHOKE-chant caption | **dead-room** |
| `dry_spot` | `spotlight` narrows, edges go dark | `turned` (half the row), phone pinpoints at 30% | `lit` at 85% | none | **dead-room** (low volume) |
| `closer` (strong) | `heat` holding | `up` holding through the fade | `lit` | slow fade to black on the last beat | — |
| `closer` (quiet) | `spotlight` fading early | `settling` | `lit` at 90% | fade to black, 200ms earlier than the copy | — |

All state transitions are CSS keyframes (translate/opacity/scale/filter), 0.2-0.4s. `prefers-reduced-motion`: scene states still apply as **static** compositions (blackout choke frame, arms-up shaker frame) — reduced motion means no animation, not no scene.

#### 4.0.3 Colors in the scene (law 2 reminder)

Warm states live in the `#ff8c42`/amber family. Cold states (choke, dry_spot) live in steel-slate (`#1a2530`, `#232d38`) — **blue-gray, never violet**. Phone pinpoints are white. No gradient may pass through the 270-320 hue band.

#### 4.0.4 Sound — three stingers, **P1, load-bearing** (promoted from P2)

The entire drama engine is crowd reaction; a silent crowd is half a crowd. The minimal pass is exactly **three stingers**, mapped in the table above:

| File | Sound | ≤ |
|---|---|---|
| `public/audio/battle/pop.mp3` | crowd pop/roar swell | 2.0s, 60KB |
| `public/audio/battle/groan.mp3` | low groan + murmur | 1.5s, 45KB |
| `public/audio/battle/dead-room.mp3` | murmur bed, a cough, chair creak | 2.5s, 60KB |

- `lib/audio/stingers.ts`: preload all three on feed mount (the player already tapped to reach the feed — autoplay gesture requirement is satisfied), play at 0.5 volume, one at a time (new stinger cuts the previous).
- **Mute toggle** on the feed chrome (speaker icon, 44px), persisted `localStorage['bn_muted']`, default **on** (sound plays). Muted state is global across battle night.
- `delayed_pop` is the showcase: dead-room for the 900ms silence, pop on the flip — the sound design IS the joke landing.
- No music, no voice, no per-content-type variants in P1. Produce the three files with the existing ad-lab audio pipeline; they are checked into the repo, not fetched.

#### 4.0.5 `SceneState` — the typed contract

Every `Moment` carries a **resolved** `SceneState` (§4.1). `deriveMoments` resolves it from the §4.0.2 table once, at derivation time — components render what they're handed and never re-derive scene from kind:

```ts
// lib/game/momentFeed.ts  (types re-exported from lib/models.ts)
export type BackdropState = 'dark' | 'spotlight' | 'heat' | 'surge' | 'blackout';
export type CrowdState    = 'settling' | 'nodding' | 'up' | 'flat' | 'turned';   // §4.0.2 crowd-row column
export type PlateState    = 'lit' | 'dimmed' | 'pressed' | 'looming';            // §4.0.1 plate states
export type StingerId     = 'pop' | 'groan' | 'dead_room';                       // §4.0.4

export interface ScenePhase {
  backdrop: BackdropState;
  backdropIntensity: number;     // 0-1 within the state: cone width/brightness (heater widens, dry_spot narrows)
  crowd: CrowdState;
  crowdEmphasis: 'all' | 'front_row' | 'leading_third' | 'side_thirds' | 'half_row';
  phoneLevel: 0 | 0.3 | 1;       // phone-pinpoint density (dry_spot: 0.3 · choke: 1 · everything else: 0)
  plate: PlateState;
  lighting: {
    flash?: { color: 'white_to_accent' | 'accent'; opacity: number; durationMs: number };  // accent = #ff8c42; never violet (law 2)
    desaturate?: number;         // 0-1 (choke: 0.6)
    shakePx?: number;            // sustained slow shake (choke: 4)
    joltPx?: number;             // one-frame horizontal jolt (stumble: 4)
    flicker?: boolean;           // single backdrop flicker (stumble)
    fade?: 'in' | 'out';         // opener fade-up / closer fade-out
  };
}

export interface SceneState {
  phases: [ScenePhase] | [ScenePhase, ScenePhase];  // exactly one kind is two-phase: delayed_pop (spotlight → surge)
  phase2AtMs?: number;           // when phase 2 replaces phase 1 (delayed_pop: 900)
  stinger: StingerId | null;     // fired at stingerAtMs; for subBeat 'delayed_pop' the feed player ALSO fires 'pop' at phase2AtMs
  stingerAtMs: number;
  holdMs: number;                // === Moment.durationMs (single source: the Moment)
  reducedMotionPhase: 0 | 1;     // which phase renders as the static comp under prefers-reduced-motion (§4.0.2)
}
```

**Worked resolutions** (the §4.0.2 table rows made concrete — these three are the unit-test fixtures):

- `room_shaker` → `{ phases: [{ backdrop:'surge', backdropIntensity:1, crowd:'up', crowdEmphasis:'front_row', phoneLevel:0, plate:'looming', lighting:{ flash:{ color:'white_to_accent', opacity:0.4, durationMs:300 } } }], stinger:'pop', stingerAtMs:0, holdMs:3600, reducedMotionPhase:0 }` — plus `Moment.subBeat:'rewind'` (the 0.8s replay lives on the Moment, not the scene).
- `choke` → `{ phases: [{ backdrop:'blackout', backdropIntensity:0.2, crowd:'turned', crowdEmphasis:'all', phoneLevel:1, plate:'dimmed', lighting:{ desaturate:0.6, shakePx:4 } }], stinger:'dead_room', stingerAtMs:0, holdMs:4500, reducedMotionPhase:0 }`.
- `delayed_pop` → `{ phases: [ { backdrop:'spotlight', backdropIntensity:0.7, crowd:'flat', crowdEmphasis:'all', phoneLevel:0, plate:'lit', lighting:{} }, { backdrop:'surge', backdropIntensity:1, crowd:'up', crowdEmphasis:'all', phoneLevel:0, plate:'looming', lighting:{ flash:{ color:'accent', opacity:0.35, durationMs:250 } } } ], phase2AtMs:900, stinger:'dead_room', stingerAtMs:0, holdMs:3900, reducedMotionPhase:1 }` — the silence is phase 1; the reduced-motion static frame is the payoff, not the wait.

#### 4.0.6 Reference frames — wireframes + named targets (verify against these)

A spec can't ship image files, so every backdrop state gets an ASCII comp (layout truth) plus a **named real-world reference frame** a dev can pull up side-by-side (lighting/mood truth). "Looks like the comp, feels like the reference" is the acceptance test.

**Master frame — `spotlight`** (the default performing state; every other state is a delta from this).
Named target: **Punch-Out!! (Wii) fighter-introduction cone** — one warm key light on the performer, everything outside the cone falls to near-black. The MomentCard chrome sits like an **NBA2K replay lower-third**: informational, floating, never modal.

```
┌────────────────────────────────────────────────────────┐
│ ▛▀▀▀▜ NAME              back wall #18191c    [⏭] [🔊]  │ ← BattlerPlate 96px (flag
│ ▌ ◉ ▐ SCRIPT                                           │   watermark under portrait)
│ ▙▄▄▄▟                     ╲        ╱                   │   + chrome top-right
│                            ╲      ╱   ← warm cone,     │
│                             ╲    ╱      #ff8c42 @ ~12% │
│              ┌───────────────────────────┐             │
│              │ HEADLINE IN DISPLAY FONT  │             │ ← MomentCard, lower-middle
│              │ two-line body · TYPE CHIP │             │   (NBA2K lower-third feel)
│              └───────────────────────────┘             │
│    ▄█▄  ▄▟▄  ▄█▄  ▄▟▄  ▄█▄  ▄▟▄  ▄█▄  ▄▟▄  ▄█▄         │ ← crowd row, 28% height
│ CROWD ██████████░░░░░░   😐 🙂 😐         ● ● ○ ○ ○ ○   │ ← crowd bar · lane faces
└────────────────────────────────────────────────────────┘   · segment dots
```

**`heat`** — delta from spotlight. Named target: **Fight Night Champion ring-wide** — same composition, warm wash up ~10%, cone visibly wider; nothing moves except brightness and bob depth.

```
┌────────────────────────────────────────────────────────┐
│ ░░░░░ warm wash creeps up the back wall ░░░░░          │
│              ╲                    ╱   ← cone ~2× wide  │
│   ▄█▄▄█▄▄█▄   ▄▆▄▄▆▄▄▆▄   ▄▆▄▄▆▄▄▆▄                    │ ← leading third bobs
└────────────────────────────────────────────────────────┘   deepest (nodding+)
```

**`surge`** — the eruption (room_shaker, landed rebuttal, delayed_pop phase 2; the `haymaker` kind uses `heat` + a single small flash instead — a pop, not a blowout). Named target: **a UFC broadcast KO cut** — strobe pop with the crowd's arms up in the same frame; the `RUN THAT BACK` stamp sits like an **NBA2K replay lower-third**.

```
┌────────────────────────────────────────────────────────┐
│ █████ amber flare blows the back wall out █████        │ ← 2-frame white→#ff8c42
│    ╲╲╲   cone edges lost in the bloom   ╱╱╱            │   overlay @ 40%, 300ms
│  ╲█╱  ╲█╱  ╲█╱  ╲█╱  ╲█╱  ╲█╱  ╲█╱  ╲█╱                │ ← arms UP, front row
│            ┌──────────────────┐                        │   +6px toward stage
│            │ ⟲ RUN THAT BACK  │  ← stamp, lower-third  │
│            └──────────────────┘                        │
└────────────────────────────────────────────────────────┘
```

**`blackout`** — the choke room. Named targets: **CK3 event window at 60% scrim** for the dim discipline (the world visibly persists behind the moment), plus **any arena wide-shot phone-light sea** (house lights down, crowd filming) for the pinpoints. Steel-slate `#1a2530`, never violet (law 2).

```
┌────────────────────────────────────────────────────────┐
│ back wall drops to steel-slate #1a2530                 │
│     ·      ·    ·       ·     ·      ·                 │ ← white phone pinpoints
│        cone collapsed to a sliver on the plate         │   fade in over 800ms
│  ▄▙▖  ▗▟▄  ▄▙▖  ▗▟▄  ▄▙▖  ▗▟▄  ▄▙▖  ▗▟▄                │ ← silhouettes half-turned,
│        [plate: 60% desaturated, scale 0.96]            │   phone-arm pose
└────────────────────────────────────────────────────────┘
```

**Crowd-row pose vocabulary** — all five `CrowdState`s in one strip. Named target: **Super Punch-Out!! crowd rows** — two-pose head/shoulder silhouettes that read personality from posture alone, no faces needed.

```
 settling      nodding        up          flat         turned
   ▄█▄          ▄█▄          ╲█╱          ▄█▄          ▄▙▖
   ▐█▌          ▐█▌↕         ▐█▌          ▐█▌          ▐█▌·
 (drop to     (2px bob    (arms up,     (dead        (half away,
  still)       loop)       +6px fwd)     still)       filming)
```

**Plate states** (`lit` / `dimmed` / `pressed` / `looming`) are border + filter + scale deltas on the same `BattlerPlate` — no separate art. Named target: **Street Fighter 6's health-bar portrait wince** — the plate is the face of the beat, reacting without cutting away.

### 4.1 Derivation — `lib/game/momentFeed.ts` (pure, deterministic, testable)

```ts
deriveMoments(input: {
  battleId: string; battlerId: string; battlerName: string;
  segments: BattleSegment[];        // this battler, this round, ordered
  round: BattleRound;               // this battler's round row
  posture: 'script' | 'rebuttal' | 'off_the_top';
  opponentSegments?: BattleSegment[]; // same round, for swing detection
  career?: CareerContext;           // §5.6 — gates the career template cells
}): Moment[]
```

```ts
interface Moment {
  kind: MomentKind;                 // table below
  segmentIndex: number;
  intensity: 0 | 1 | 2 | 3;
  headline: string;                 // from the template pool (Appendix A)
  body: string;
  templateId: string;               // e.g. 'room_shaker.street.2' — audit trail, test hook
  scene: SceneState;                // typed contract §4.0.5, resolved from the §4.0.2 table at derivation time
  crowd: LaneReaction[];            // exactly 3, one per lane — defined below
  durationMs: number;
  subBeat?: 'rewind' | 'chant' | 'delayed_pop';
}
```

#### `LaneReaction` — formal definition (previously referenced, never defined)

```ts
export type LaneId = 'pen_heads' | 'the_ladies' | 'the_block';

export type LaneLevel = 0 | 1 | 2 | 3 | 4;
// 0 ICED        — arms crossed, half turned away
// 1 UNMOVED     — flat, watching, unconvinced
// 2 NODDING     — head-nod, mild approval
// 3 OHHH        — reacting out loud, leaning in
// 4 ON THE STAGE — up, spilling forward, lost it

export interface LaneReaction {
  lane: LaneId;
  level: LaneLevel;
  delta: -2 | -1 | 0 | 1 | 2;   // vs previous segment — drives the face transition animation
  leading: boolean;              // the lane most aligned to this segment's content type
}
```

**Lane-face states**: each `LaneLevel` maps to exactly one face frame per lane (5 frames × 3 lanes; sprite if the library has them, else emoji: 🧊 😐 🙂 😮 🔥). Transitions animate by `delta`: positive = bounce up through intermediate frame (150ms), negative = slump (250ms, slower — losing a room is heavier than winning it), 0 = hold. The three faces sit in the feed's bottom chrome and are the crowd-as-character heartbeat between beats.

**Derivation** (`deriveSegmentLaneReactions()` in `lib/game/crowdLanes.ts`, same seeding as the round-level lanes): base level from segment `crowd_reaction` bands — `0-19→0, 20-39→1, 40-64→2, 65-84→3, 85-100→4` — then content-affinity shift: the leading lane (schemes/wordplay/punchlines → pen_heads; gun_bars/street_talk/shock_value → the_block; charismatic/theatrical performance → the_ladies) gets +1 when `segment_score ≥ 7`, misaligned lanes get −1 when `segment_score < 5`, clamp 0-4, existing seeded jitter (±1, 15% chance) on non-leading lanes only. Chokes force all three lanes to ≤1 (nobody's lane survives a choke).

**Kind mapping (priority order per segment):**

| Rule (from real fields) | Kind | Presentation beat (scene per §4.0.2) |
|---|---|---|
| `event_flags` has `choke` | `choke` | Dead-room scene, 4.5s hold; optional CHOKE-chant sub-beat (crowd speech is reaction, not bars — allowed) |
| `rebuttal_landed` | `rebuttal` | Crowd-swing scene, momentum arrow flips |
| `rebuttal_missed` | `rebuttal_missed` | Flat scene — the room doesn't go with him |
| `haymaker` AND `crowd_reaction ≥ 70` | `room_shaker` | Surge scene + **rewind sub-beat** with `RUN THAT BACK` stamp (research §1: crowds literally ask to run bars back) |
| `haymaker` AND `55 ≤ crowd_reaction < 70` | `haymaker` | **The clean connect** — standard haymaker beat: heat flare + **pop** stinger, no rewind (Appendix A.4). It landed flush and the room went; it just didn't take the building with it — the culture's "chain punching" connect, not the moment of the night |
| `haymaker` AND `crowd_reaction < 55` | `delayed_pop` | Silence-then-surge scene — a *documented* sign of smart writing (letstalkbattlerap §2) |
| `stumble` | `stumble` | Groan beat; body text keyed to the NEXT segment's score: recovered (next ≥ 6) vs rattled; a final-segment stumble (no next segment) uses the `stumble × any` cell |
| no flag, score ≥ 8.5 | `heater` | Heat scene, leading lane's crowd third bobs deepest |
| no flag, score ≤ 3.5 | `dry_spot` | Phones-at-30% scene |
| segmentIndex = 1 (none above) | `opener` | Spotlight-snap scene, copy keyed to `delivery_type` group; **rematch cell** when `career.isRematch` (Appendix A.8) |
| last segment (none above) | `closer` | Strong/quiet variant by score band |
| default | `building` | Short connective beat, 2.2s |

**The three crowd bands partition every haymaker** (`≥70` / `55-69` / `<55`) — no `haymaker` flag may ever fall through to `building`. The game's signature moment rendered as a 2.2s connective beat is a bug, and the partition is test-enforced (§7.7).

### 4.2 Copy templates — the no-bars guarantee, shipped as a contract

**The pool is not four example lines — it is the whole matrix, reviewed, in Appendix A**, checked in as `lib/game/momentTemplates.ts` (a typed, JSON-shaped const — data, not code). Template authoring is the single biggest authenticity risk in this spec: one fake-sounding line poisons the feed for real fans. The implementer copies Appendix A verbatim; **new or changed lines go through design review**, and the lint rules below run as a unit test (§7.7), not a comment.

**Structure**:

```ts
// lib/game/momentTemplates.ts
export const CONTENT_GROUPS = {
  pen:      ['wordplay', 'schemes', 'punchlines', 'pop_culture_refs'],
  street:   ['gun_bars', 'street_talk', 'shock_value'],
  personal: ['personals', 'name_flips', 'rebuttals'],
  story:    ['storytelling', 'social_commentary'],
  showman:  ['comedy', 'freestyles'],
} as const;                        // covers all 14 real CONTENT_TYPES ids — test-enforced

export const DELIVERY_GROUPS = {   // opener cells key on delivery, not content
  pressure: ['aggressive', 'staccato'],
  cool:     ['nonchalant', 'conversational', 'smooth_flow'],
  speed:    ['speed_rapping'],
  heart:    ['passionate'],
} as const;

export const TEMPLATES: Record<MomentKind, Record<string, string[]>> = { /* Appendix A */ };
```

- Seeded pick via the existing `fnv1a(battleId + battlerId + segmentIndex)` (same determinism pattern as `TheInternet` — a battle always replays identically). Group cell first; `any` cell is the fallback when the group cell is missing or (10% seeded) for variety. Situation-keyed kinds (`closer × strong/quiet`, `stumble × recovered/rattled`, `rebuttal × vs_choke/cold_room`) resolve their key first and fall back to `any` the same way — a missing or inapplicable key (e.g. a final-segment stumble with no next segment to grade) is not an error, it's the `any` path.
- Placeholders: `{name}`, `{opponent}`, `{round}` only.
- Career-gated cells (Appendix A.8) are only eligible when the corresponding `CareerContext` predicate is true.

**Lint rules — enforced in `momentTemplates.lint.test.ts` (every rule is mechanical):**

1. **No quoted performance.** No `"` or curly quotes anywhere in a template, except strings on the chant whitelist: `RUN THAT BACK`, `CHOKE`, `OHHH`, `TIME` (quoted crowd *reactions* are allowed; quoted *bars* are not).
2. **Third person only.** No template contains the tokens `I `, `I'm`, `my ` at clause start, or begins with `I` — the voice is the room's, never the battler's.
3. **No rhyming copy.** No template's final two clause-ending words may share their last 3 characters (cheap but effective tripwire; anything it flags gets a human read).
4. **Placeholders** ⊆ `{name}, {opponent}, {round}`; no orphan braces.
5. **Coverage & fallback**: every kind in the kind table — **including the situation-keyed kinds `closer`, `stumble`, and `rebuttal`, and the mid-band `haymaker`** — has an `any` cell with ≥4 variants. `any` is the guaranteed fallback for every kind (for `rebuttal`, the `any` cell IS the neutral-material cell — no choke, no cold room, career gate closed — serving as both key and fallback). Every hot cell listed in Appendix A has ≥4 variants (≥3 for career-gated cells); `CONTENT_GROUPS` values exactly partition the 14 CONTENT_TYPES ids; `DELIVERY_GROUPS` partition the 7 delivery ids. This rule must pass against Appendix A **as shipped** — the contract may never fail its own CI on day one.
6. **Length** 40-180 chars — long enough to be a scene, short enough for two lines at `text-2xl` on 375px.
7. **Determinism**: same seed inputs → same `templateId`, for 1,000 seeds.

### 4.3 The component — `components/battle/RoundMomentFeed.tsx`

Full-viewport takeover (like `LiveBattleViewer`, which stays for full-battle replay; the feed is the *first-run* experience).

- **Layout**: performer `BattlerPlate` (portrait + flag) + round pip top-left; the scene stack (§4.0) fills the viewport; center stage = `MomentCard` (headline in display font, 2-line body, content-type chip) floating over the scene's lower-middle; bottom chrome = animated crowd bar (`crowd_reaction` fill, `#ff8c42`) + three lane faces + mute toggle; segment dots progress rail.
- **Pacing**: auto-advance per `durationMs` (building 2.2s · heater/opener/closer 3.0s · haymaker 3.2s · room_shaker 3.6s + 0.8s rewind · delayed_pop 3.9s · choke 4.5s). **Tap/click = advance now. Hold or `SKIP ⏭` = jump to cards.** Feed is sugar, never a cage. Skipping also silences any playing stinger.
- **Motion**: CSS keyframes only (translate/opacity/scale/filter). `prefers-reduced-motion`: render all moments as an instant vertical list of MomentCards, each with its **static** scene frame as the card backdrop (§4.0.2).
- **Sequential truth**: opponent-first reveal means when your feed plays, each beat can show a tiny corner delta vs their same-index segment ("you're up 1.2 on this stretch") — momentum as live drama, from data already in hand.

### 4.4 Round cards (reworked `round/[roundNum]/results/page.tsx`)

After both feeds: a **judge-card moment**, not a dashboard. Restyled to system tokens (kill `rounded-lg`, `bg-orange-600`, sentence case):

1. `ROUND N — {NAME} TAKES IT` strip — winner's `BattlerPlate` leading (uses persisted `won` when present — keep the existing composite-consistent fallback in `determineWinner()`).
2. The round's #1 moment (highest-intensity Moment card, static, with its scene frame as backdrop).
3. Compact head-to-head: the existing `StatRow` AVG / PEAK / CROWD mirror-bars from `app/battle/[id]/page.tsx` (lift into `components/battle/StatRowCompare.tsx` and share) + choke/rebuttal chips, both battlers' 56px plates flanking.
4. Posture receipt: "You went REBUTTAL-HEAVY — it LANDED" with the visible deltas (P10: before→after at the moment of change). If `posture_auto`: `PLAYED IT SAFE — TIMER`.
5. `NEXT ROUND →` primary CTA. Everything deeper (segment lanes, multipliers) lives in one collapsed `THE NERD CARD` expandable — the current `RoundResultsBreakdown` content compressed, restyled, demoted.

---

## 5. FINAL RESULTS — scorecard first, debate surfaced, internet fixed

### 5.1 New hierarchy for `app/battle/[id]/page.tsx` (completed battles)

1. **FINAL SCORECARD** (`components/battle/FinalScorecard.tsx`) — the only thing above the fold
2. **THE MOMENTS** — viral clip callout + top-3 moment cards
3. **THE INTERNET** — fan split + takes + recap link (existing component, upgraded)
4. **THE ROUNDS** — existing round tabs + breakdown + crowd strip (demoted)
5. **YOUR NIGHT** — progression expandable (PostBattleSummary, exists) + booking-fee line
6. **THE TAPE / ANALYSIS** — LiveBattleViewer button, TaleOfTheTape, BattleAnalysis, JudgeScorecard (tournament) — all in expandables

### 5.2 FINAL SCORECARD

- Both `BattlerPlate`s (72px portraits over flag watermarks) + names, giant `2 — 1`, round pips (`R1 ✓ R2 ✗ R3 ✓`, each pip tappable → scrolls to that round).
- **Decision-type label** — already computed and persisted (`battles.decision_type`): `BODYBAG` / `CLEAN SWEEP` / `GENTLEMAN'S 30` / `CLASSIC` / `EDGE` — rendered as the headline stamp with one line of flavor ("Both left with their stock up — a classic" for `classic`, per the culture's real usage).
- **Career strip** (when `career.isRematch`): `SERIES: YOU 2 — 1 THEM` mono line under the stamp; a streak chip when a streak ≥3 was extended or snapped tonight (`W4` / `W3 SNAPPED`).
- **Money truth**: one mono line — `BOOKING FEE: $X — NEGOTIATED FLAT. WIN OR LOSE.` The win's value shows next to it as rep/rating/fans deltas (from `progression`), never as a pay bump.

### 5.3 The fan split — "THE STREETS DECIDE" (`lib/game/fanVerdict.ts`)

Most real battles are unjudged; the fan verdict distribution IS the product (research §2). Deterministic, derived from persisted round data only:

```ts
buildBattleFacts(battle, rounds, segments, views, career): BattleFacts
// → { winnerShare, band, perRoundLeans[], viralClip?, chokes[], haymakers[],
//     verdict, decisionType, career: CareerContext }        // career: §5.6
```

- Per round, recompute the composite both sims already use: `avg × ROUND_JUDGING_AVERAGE_WEIGHT + peak × ROUND_JUDGING_PEAK_WEIGHT + (crowd/100 × ROUND_JUDGING_CROWD_SCALE) × ROUND_JUDGING_CROWD_WEIGHT` (config.ts:389-423 — one shared function, exported, so UI and sim can never disagree).
- `leanᵢ = clamp(|compositeA − compositeB| / 4, 0.04, 0.45)`; a choked round forces `leanᵢ ≥ 0.35` toward the opponent (material quality does not override a choke — documented fan behavior).
- `winnerShare = clamp(50 + Σ signᵢ·leanᵢ·100 / 3, 51, 97)` + seeded jitter ±2 (`fnv1a(battleId)`).
- Bands: 51-57 **DEAD EVEN — RUN IT BACK** · 58-67 **DEBATABLE** · 68-79 **CLEAR** · 80-89 **ONE-SIDED** · 90+ **NO DEBATE**.
- Render `FanSplitBar`: split bar (`#ff8c42` vs zinc-600), two percentages, band stamp, one debate line ("64% got {winner} — the other third are loud about it").
- Tournament battles additionally compare the judges' decision (existing `JudgeScorecard` data) to `winnerShare`; divergence ≥ 25 points renders a `ROBBERY?` chip and hands the news generator a robbery angle (hook for the media layer; article template is out of scope here).
- **Rivalry heat does not bend the verdict** (that would fake data) — it raises the *noise*: see §5.6.

### 5.4 THE INTERNET — the consistency contract

`TheInternet.tsx` stops free-building takes and consumes `BattleFacts`. Rules, enforced in `buildTakes`:

1. **Hearts are non-negative, always.** Keep the unsigned-shift fix (line 134) and wrap it: `heat: Math.max(0, …)`. Add the unit test (§7.7).
2. **Every take must cite a fact.** Each candidate is generated *from* a `BattleFacts` field (a specific round, choke, clip, split — or a `CareerContext` field). Zero free-floating candidates.
3. **Band gates**: "RUN IT BACK" / "I had it closer" / both-sides takes only when band ≤ DEBATABLE (share ≤ 75). "no debate. smoked." takes only when band ≥ ONE-SIDED. Loser-glaze ("{loser} is HIM") only if the loser owns the viral clip or won a round with crowd ≥ 70 — the existing haymaker crowd-gate (lines 84-90) generalizes into this.
4. **Choke takes** name the actual choked battler + round (already correct — keep).
5. The split number itself appears in at least one take ("timeline poll says {share}% — feels about right" / "…that poll is a robbery") so the scorecard and the timeline visibly argue about the *same* numbers.
6. **Career takes** (new, gated on `CareerContext`, pool in Appendix A.9): series-score takes when `isRematch`; streak takes when a streak ≥3 was extended or snapped; "he choked against him AGAIN" only when tonight's choker has `chokedVsOpponentBefore`; trilogy-demand takes only when `isRematch` AND band ≤ DEBATABLE. When rivalry `intensity ≥ 60`, render **+2 extra takes** and prefer the hotter variants — a rivalry night is louder, not different in verdict.

### 5.5 Viral clip callout — `components/battle/ViralClipCard.tsx`

If any segment has `segment_score ≥ 8.5` AND `haymaker` (the moment clips get cut from, research §5 — careers are built on 30-second clips):

- Card at the top of THE MOMENTS: `▶ THE CLIP` stamp, moment copy from `momentFeed` templates (same seed → same words as the feed showed), clip owner's `BattlerPlate` + round/segment, clip views = `round(battleViews.total_views × (0.35 + seeded 0..0.25))`, hearts derived non-negative from the same seed.
- If the clip owner **lost**, add the culture line: "the L, but the clip is his" — losing while owning the moment raises stock (research: career-high-in-a-loss archetype).
- No qualifying segment → section renders nothing (rarity keeps it meaningful).

### 5.6 Cross-battle continuity — `CareerContext` (`lib/game/careerContext.ts`)

The wrestling-booker bar is **storyline memory**, and the DB already keeps it: `head_to_head_records` (per-pair wins, last battle winner/score, `battle_ids[]`), `battler_relationships` (rivalry `intensity`, `rematch_demand`, `origin_story`), `rankings.streak` — all shipped in migration 20251127000000 and currently invisible on battle night. This section wires them in. **Pure function over fetched rows; no new tables.**

```ts
buildCareerContext(input: {
  playerId: string; opponentId: string;
  h2h?: HeadToHeadRecord;              // head_to_head_records row for the pair
  relationship?: BattlerRelationship;  // battler_relationships row (rivalry), status='active'
  playerRanking: Ranking; opponentRanking: Ranking;   // rankings rows (streak)
  priorMeetings: PriorMeeting[];       // derived: h2h.battle_ids → battles + battle_rounds
                                       //   { battleId, winnerId, score, chokedBattlerIds[], clipOwnerId? }
}): CareerContext

interface CareerContext {
  isRematch: boolean;
  meetingNumber: number;                       // 1 = first meeting
  seriesScore: { player: number; opponent: number };   // h2h battler_a/b_wins, oriented
  lastMeeting?: { winnerId: string; score: string;     // h2h.last_battle_* fields
                  chokedBattlerIds: string[]; clipOwnerId?: string };
  playerStreak: number; opponentStreak: number;        // rankings.streak (negative = L streak)
  playerChokedVsOpponentBefore: boolean;
  opponentChokedVsPlayerBefore: boolean;
  rivalry?: { intensity: number; rematchDemand: number; originStory: string };
}
```

**Consumers (all read-only presentation except the two marked ⚙):**

1. **`BattleFacts.career`** — fetched once in `GET /api/battles/[id]`, flows everywhere BattleFacts already flows.
2. **Template gating** (Appendix A.8): rematch opener cell (round 1, `isRematch`); choke-shadow cell (tonight's choke kind when that battler `chokedVsOpponentBefore` — "the room remembers the last one"); rebuttal cross-battle callback cell (landed + `isRematch`, 25% seeded chance).
3. **THE INTERNET** career takes (§5.4 rule 6, pool A.9).
4. **FinalScorecard** career strip (§5.2).
5. **Control page** career line (§2.1).
6. ⚙ **Rebuttal material bonus**: `POSTURE_REBUTTAL_MATERIAL_FAMILIAR: +0.5` when `isRematch` (§3.3) — you've stood across from him before; you know his patterns. P1.
7. ⚙ **AI posture weight**: opponent-choked-in-a-prior-meeting → REBUTTAL +10 (§3.6). P1.
8. **Write-back hook** (deferred, spec'd): a `DEAD EVEN` band on a rematch bumps the pair's `rematch_demand` +15 via the existing relationship update path — the night feeds the storyline system that fed it. Ship behind a flag; the relationship system owns the write.

**First meeting** (`meetingNumber = 1`): every consumer renders nothing / gates closed. The night must be complete without history — history is seasoning, never a dependency.

---

## 6. Mobile controls & layout (whole flow)

Battle night is a phone-in-hand experience. FM26 tiles→cards discipline (pattern P14): stream for frequency, cards for depth, never 3+ levels.

- **Breakpoint rule**: every battle-night surface is single-column below `md`. The final page's `lg:grid-cols-5` split stays desktop-only.
- **Sticky bottom action bar** (all battle-night pages): `fixed bottom-0 inset-x-0 h-14 pb-[env(safe-area-inset-bottom)] bg-[#101114] border-t-2 border-[#3a3d44]`, one primary CTA (LOCK THE ROUND / CHOOSE RESPONSE / NEXT ROUND / SEE THE CARDS) `bg-[#ff8c42] text-black`. The current select page buries its confirm at the bottom of a long scroll — this fixes it.
- **PosturePicker on mobile** = bottom sheet over the residual scene: three stacked full-width cards (min-height 72px, whole card tappable), locked cards greyed with the requirement line, timer bar pinned above the cards, opponent's plate at 56px in the sheet header, drag-down or SCRIPT default to dismiss.
- **Moment feed** = full-viewport (`100dvh`), tap anywhere advances, `SKIP ⏭` fixed top-right (44×44px), mute toggle beside it, performer plate 72px top-left, lane faces bottom row at 40px, headline ≤ `text-2xl` so 2 lines fit above the crowd bar on a 375px screen. Scene layers scale with viewport — the crowd row is a fixed 28% of height.
- **Scorecard**: score `text-6xl`, plates 72px, round pips 44px touch targets, FanSplitBar full-width `h-8`.
- **Round tabs / sections** → horizontally scrollable pill row (`overflow-x-auto`, `snap-x`), never wrap.
- **Tap targets ≥ 44px everywhere**; micro-labels stay `text-[10px] font-mono` but are never the tap target themselves.
- **Content selector** (existing `RoundContentSelector`): chips → 2-column grid on mobile, selection counters sticky under the header.

---

## 7. Build manifest

### 7.1 New files

| Path | What it is |
|---|---|
| `lib/game/postures.ts` | `PostureEffects` type, gates (`getAvailablePostures`), `resolveRebuttalRoll`, `pickAiPosture` — pure, seeded, unit-testable |
| `lib/game/momentFeed.ts` | `deriveMoments`, `Moment` + `SceneState`/`ScenePhase` types (§4.0.5), seeded template pick, scene resolution — pure |
| `lib/game/momentTemplates.ts` | **The template pool — Appendix A verbatim** (typed JSON-shaped const, `CONTENT_GROUPS`, `DELIVERY_GROUPS`, `TEMPLATES`, chant whitelist). Data, not code; changes require design review |
| `lib/game/momentTemplates.lint.test.ts` | The 7 lint rules from §4.2, run in CI |
| `lib/game/fanVerdict.ts` | `buildBattleFacts`, shared `roundComposite()`, split bands — pure |
| `lib/game/careerContext.ts` | `buildCareerContext` over `head_to_head_records` / `battler_relationships` / `rankings` rows — pure (§5.6) |
| `lib/game/flags.ts` | country name → ISO code → flag rendering helper (Twemoji Country Flags class / SVG rects), fallback chain (§4.0.1) |
| `lib/audio/stingers.ts` | preload + play + mute persistence for the three stingers (§4.0.4) |
| `public/audio/battle/pop.mp3` · `groan.mp3` · `dead-room.mp3` | The three stingers, produced once, checked in |
| `components/battle/BattlerPlate.tsx` | Portrait + flag-watermark plate + name + posture chip + visual states (§4.0.1) — shared by feed, picker, cards, scorecard, clip |
| `components/battle/PosturePicker.tsx` | Full-screen-over-scene (desktop) / bottom-sheet (mobile) posture choice, CK3 gating + flags, 15s soft timer |
| `components/battle/RoundMomentFeed.tsx` | The beat-by-beat reveal player: scene stack + MomentCard + lane faces + stingers |
| `components/battle/MomentCard.tsx` | One beat card (shared: feed, round cards, THE MOMENTS, viral clip) |
| `components/battle/FinalScorecard.tsx` | Plates, score, pips, decision stamp, career strip, flat-fee line |
| `components/battle/FanSplitBar.tsx` | The streets-decide split bar + band stamp |
| `components/battle/ViralClipCard.tsx` | THE CLIP callout |
| `components/battle/StatRowCompare.tsx` | The mirrored AVG/PEAK/CROWD row, lifted out of `app/battle/[id]/page.tsx` |
| `app/battle/[id]/round/[roundNum]/live/page.tsx` | Orchestrates: opponent feed → posture → your feed → routes to round cards. Reads `battles.status` to resume anywhere |
| `app/api/battles/[id]/rounds/[roundNum]/posture/route.ts` | POST `{ posture, autoDefaulted? }` → validates gate server-side, stores it, simulates the player half, sets `rN_simulated` |
| `supabase/migrations/20260826120000_battle_night_v2.sql` | See §7.3 |
| `lib/game/postureValidation.ts` | Balance harness in the `comprehensiveSystemValidation.ts` mold |

### 7.2 Modified files

| Path | Change |
|---|---|
| `lib/game/config.ts` | Add the `POSTURE_*` block (§3.3, incl. `POSTURE_REBUTTAL_MATERIAL_FAMILIAR`) + `FAN_SPLIT_JITTER: 2` |
| `lib/game/singleRoundSimulation.ts` | Split into `simulateHalfRound(battlerId, posture, opponentRevealedHalf?)`; add momentum carry from persisted round N−1 rows (§3.5); accept `PostureEffects` through to `simulateSegment` |
| `lib/game/simulation.ts` | `simulateSegment` signature gains `posture: PostureEffects` (identity default keeps every existing caller + validation script green); auto path calls `pickAiPosture` for both battlers so AUTO battles emit the same flags |
| `app/api/battles/[id]/rounds/[roundNum]/simulate/route.ts` | Becomes the **first-half** trigger (simulates the first-turn battler only, status → `rN_first_half`/`rN_awaiting_response`); second half moves to the posture route. Keep a `?full=1` legacy escape hatch for dev tooling |
| `app/api/battles/[id]/lock-in/route.ts` | Seeded coin flip → `battles.first_turn_battler_id`; return it so the control page can announce turn order |
| `app/api/battles/[id]/route.ts` | Include `first_turn_battler_id`, postures, `posture_outcome`, `posture_auto`, and the **career rows** (pair's `head_to_head_records` + active `battler_relationships` + both `rankings`) in the battle payload — everything else the new screens need (rounds, segments, views, progression) is already returned |
| `app/battle/[id]/control/page.tsx` | Announce the coin flip result + career line under the matchup strip |
| `app/battle/[id]/round/[roundNum]/select/page.tsx` | Route to `/live` after content lock; embed compact PosturePicker when player goes first; restyle stray sentence-case bits |
| `app/battle/[id]/round/[roundNum]/results/page.tsx` | Rebuild as Round Cards (§4.4); redirect to `/live` when the round isn't fully revealed yet |
| `app/battle/[id]/page.tsx` | Reorder to §5.1; mount FinalScorecard, ViralClipCard; pass `BattleFacts` (incl. `career`) to TheInternet; demote current round grid |
| `components/battle/TheInternet.tsx` | Consume `BattleFacts`; consistency contract incl. career takes (§5.4); `Math.max(0, heat)` guard |
| `components/battle/RoundResultsBreakdown.tsx` | Compress + restyle to system tokens; lives inside THE NERD CARD expandable |
| `lib/game/crowdLanes.ts` | Add `deriveSegmentLaneReactions` returning `LaneReaction[]` (§4.1) |
| `components/battler/OnboardingWizard.tsx` | Home-city pick step (feeds `battlers.home_city_id`; defaults from primary league's city) |
| `lib/models.ts` (or the shipped models module) | `Posture`, `PostureEffects`, `Moment`, `LaneReaction`, `SceneState`, `BattleFacts`, `CareerContext`, new status strings, new columns |

### 7.3 Migration (sketch)

```sql
-- 20260826120000_battle_night_v2.sql
ALTER TABLE battles
  ADD COLUMN IF NOT EXISTS first_turn_battler_id UUID REFERENCES battlers(id);

ALTER TABLE round_content_selections
  ADD COLUMN IF NOT EXISTS posture TEXT NOT NULL DEFAULT 'script'
    CHECK (posture IN ('script','rebuttal','off_the_top')),
  ADD COLUMN IF NOT EXISTS posture_outcome TEXT
    CHECK (posture_outcome IN ('landed','missed')),   -- NULL for script/off_the_top
  ADD COLUMN IF NOT EXISTS posture_auto BOOLEAN NOT NULL DEFAULT FALSE;  -- timer default (§3.2.1)

-- Origin (law 6): everybody's from somewhere
ALTER TABLE battlers
  ADD COLUMN IF NOT EXISTS home_city_id UUID REFERENCES cities(id);
-- Backfill AI battlers deterministically (fnv1a-style hash of id % seeded city count);
-- players pick at onboarding, default = primary league's city_id.
-- cities.country already exists (migration 20251125030000) → flag via lib/game/flags.ts.

-- battles.status is TEXT (or widen the CHECK if one exists) to admit:
--   rN_first_half, rN_awaiting_response  (N = 1..3)
-- battle_segments.event_flags is JSONB — new flags need no DDL:
--   'rebuttal_landed' | 'rebuttal_missed' | 'off_top'
-- Career context needs NO DDL: head_to_head_records, battler_relationships,
-- rankings.streak all exist (migration 20251127000000 / 002_seed_data).
```

**No new tables.** Every screen in this spec is fed by `battles`, `battle_rounds`, `battle_segments`, `round_content_selections`, `battle_views`, `head_to_head_records`, `battler_relationships`, `rankings`, `cities`, and the existing progression payload.

### 7.4 Data each screen needs (all served by `GET /api/battles/[id]` + round endpoints after §7.2)

| Screen | Reads |
|---|---|
| PosturePicker | opponent's revealed round + segments (choke/haymaker/crowd for material bonus display), player prep blocks (research days), player `style_tags`, attributes (creativity gate), `first_turn_battler_id`, both battlers' `avatar_url` + home city country, `career.isRematch` |
| RoundMomentFeed | that battler's `battle_segments` rows (score, flags, crowd, content/delivery/performance types) + round row + posture + `avatar_url`/flag + `career` (template gates) |
| Round Cards | both round rows (`won`, avg/peak/crowd, choked) + both segment sets + posture/outcome/`posture_auto` + both plates |
| FinalScorecard | `battles.verdict`, `decision_type`, `winner_battler_id`, round rows, `player_payout` (flat fee), progression deltas, both plates, `career` (series strip, streak chips) |
| FanSplitBar / TheInternet / ViralClipCard | `BattleFacts` (derived from rounds + segments + views + `career`) |
| Control page | coin flip + `career` one-liner |

### 7.5 Tailwind / design-system guidance

- **Tokens (the shipped battle-surface set — match the existing pages, do not fork):** page `bg-[#18191c]` · panel `bg-[#101114]` or `bg-[#2d2f35]` · border `border-2 border-[#3a3d44]` (square corners on battle surfaces — no `rounded-lg`) · accent `#ff8c42` (hover `#ff9d5c`, on-accent text `text-black`) · success `green-500` at `/20 bg` `/50 border` · danger `red-500` same recipe · haymaker `amber-500` · choke `red-500` chips, steel-slate `#1a2530` scene (keep the shipped segment-legend language).
- **Type**: headers `font-display font-black uppercase tracking-tighter`; micro-labels `text-[10px] font-mono uppercase tracking-widest text-zinc-500`; scores `font-display font-black tabular-nums`.
- **Motion**: 0.2s transitions; feed keyframes per §4.0.2/§4.3; every clickable has a hover state; `prefers-reduced-motion` honored in the feed, flashes, timer, and scene states (static frames, §4.0.2).
- **NO purple in any state, flash, gradient, scene, or chart.** Viral/goat tiers stay amber. The `mid` view-tier chip in TheInternet currently uses `blue-400` — leave blue alone but never "upgrade" it toward violet. Scene cold states are steel-slate, never violet-adjacent.
- **Flags**: vendor `Twemoji Country Flags` webfont (the War World approach — see its `public/fonts/fonts.css`) or ship SVG flag rects; add the `.flag-emoji` class; test on Windows/Chromium where regional-indicator emoji render as bare letters.

### 7.6 Rollout phases

- **P0 — Presentation only (no sim changes, ships alone)**: `momentFeed.ts` + `momentTemplates.ts` + lint test, `fanVerdict.ts`, `careerContext.ts` (read-only consumers: templates, takes, scorecard strip, control line), `flags.ts` + `BattlerPlate` + home-city migration/backfill, RoundMomentFeed with the full scene stack (played from already-simulated data), Round Cards restyle, FinalScorecard + FanSplitBar + ViralClipCard, TheInternet contract incl. career takes. Auto-mode battles get the full new experience immediately.
- **P1 — Reactive play + the felt layer**: turn order, half-round split, PosturePicker **with the 15s soft timer incl. the first-battle grace** (§3.2.1), posture math incl. the rematch material bonus, AI postures incl. the career weight, momentum parity, posture migration columns, **the three stingers** (§4.0.4). Sound and timer are load-bearing for the reactive fantasy — they ship with it, not after it; the grace ships with the timer, not after it.
- **P2 — Deferred**: mid-half audible (§3.7), rivalry `rematch_demand` write-back (§5.6.8), richer audio (per-content-type reactions, music), lane-face sprite upgrade if the library lacks frames.

### 7.7 Validation & QA gates

- `lib/game/postureValidation.ts` (run `npx tsx … 200`):
  - SCRIPT is baseline.
  - Gated REBUTTAL lands **55-70%**.
  - **OFF_TOP numeric gates (§3.3)**: prepared non-freestyler (creativity ≥ 7, 3+ writing days, no badge) round-win rate **3-8 points below** own SCRIPT baseline; `Freestyle Genius` cold (0 prep days) **2-6 points above** own SCRIPT-cold baseline; OFF_TOP haymaker-segment rate **1.5-2.0×** SCRIPT's for the same archetype.
  - Overall choke ~7% / Known Choker ~45% / stumble ~40% targets **unchanged** (posture defaults must not move the tuned numbers).
- **Template lint test** (`momentTemplates.lint.test.ts`, §4.2): all 7 rules — chant whitelist, third-person, rhyme tripwire, placeholder set, coverage counts (**every** kind has an `any` cell ≥4 — explicitly including `closer`, `stumble`, `rebuttal`, and `haymaker`; groups partition the real content/delivery ids), length bounds, seed determinism ×1,000. This test must be green against Appendix A verbatim before any new copy is authored.
- Unit tests: `momentFeed` (choke→choke scene, **haymaker crowd bands partition: crowd 72→`room_shaker`, 60→`haymaker`, 50→`delayed_pop`, and no segment with a `haymaker` flag ever derives `building`**, final-segment stumble→`stumble × any` cell, determinism by seed, career cells closed when `meetingNumber = 1`), `crowdLanes` (`LaneReaction` bands, choke forces all lanes ≤1, leading-lane shift), `fanVerdict` (bodybag ≥ 88 share; choked round forces lean; jitter bounded), `careerContext` (first meeting → all-gates-closed; series orientation correct for both a/b column orders; prior-choke detection from fixture rounds), `TheInternet` (hearts ≥ 0 for 1,000 seeds; no RUN-IT-BACK take when band ≥ ONE-SIDED; no loser-glaze without clip/round justification; no career take on a first meeting).
- **Playtest in Playwright before calling anything fixed** (house rule): full locked-in battle on desktop + 375px mobile — feed skippable, scene states render per kind (choke = blackout + phones, shaker = surge + arms up, mid-band haymaker = heat flare + pop with **no** rewind stamp — screenshot assertions, verified against the §4.0.6 comps), portraits + real flags on every plate (no letter-pair fallback), posture gate rows render locked states, **first locked-in battle shows the NO CLOCK explainer and never auto-defaults; on a second-battle fixture the timer drains and defaults to SCRIPT with the receipt chip**, stingers fire (and mute persists), scorecard first paint above the fold, internet takes match the scorecard on 5 consecutive simulated battles, and a seeded rematch fixture shows the series strip + a career take.

---

## 8. Why this is the right shape (one paragraph)

Every drama beat in this spec is a *reveal* of data the sim already writes — segments, flags, crowd, content types, and now the series/rivalry rows the DB has been keeping in silence — so the battle finally *happens* instead of being filed, at near-zero new-balance risk (P0 touches no math). The presentation is illustrated, not notified: a stage with states, a crowd with poses, a performer with a face and a flag. The one mechanical addition, the response posture, is the exact thing the owner asked for and the exact thing the culture celebrates (the rebuttal, the off-the-top save), implemented as a single gated, *timed* choice at the authentic moment — the top of your round, after you watched theirs — with its math expressed entirely in existing `simulateSegment` terms, its EV targets numeric, and its feel carried by three checked-in stingers. The finale then sells what battle rap actually sells: a scorecard, a debate, a clip — and a story that remembers the last chapter.

---

## Appendix A — The template pool (ships verbatim as `lib/game/momentTemplates.ts`)

**This appendix IS the contract.** The implementer transcribes it; the lint test (§4.2/§7.7) enforces its rules; new lines go through design review. Voice rules: third person, present tense, the room's perspective; culture glossary only (scheme, flip, angle, walk-down, pen heads, gear shift, name flip, haymaker, the block section); **never** quoted bars, never rhyming copy, never the battler's own voice. Placeholders: `{name}` (the performer — most templates omit it; "he" reads better mid-feed), `{opponent}`, `{round}`.

Cell key: `kind × group`. Groups: `pen` / `street` / `personal` / `story` / `showman` (content, §4.2) · `pressure` / `cool` / `speed` / `heart` (delivery, openers only) · `any` (fallback, **every kind has one — lint rule 5, no exceptions**). Situation-keyed kinds additionally key on the moment itself — `closer × strong/quiet`, `stumble × recovered/rattled`, `rebuttal × vs_choke/cold_room` — and still ship `any` as the guaranteed fallback: for `rebuttal`, `any` IS the neutral-material cell (no choke, no cold room, career gate closed); a final-segment stumble (no next segment to grade) resolves to `stumble × any`.

### A.1 `opener` (keyed to delivery group)

**opener × pressure** (aggressive, staccato)
1. No warm-up — he's in {opponent}'s space by the second bar, setting the round's temperature to hostile.
2. He opens in punches — short bars, hard stops, the tone set like a jab.
3. The first thirty comes out the gate snarling — the block section signs on immediately.
4. He starts at the volume most rounds end at — the question is whether the room can live there for three minutes.

**opener × cool** (nonchalant, conversational, smooth_flow)
1. No hype, no pacing — he opens conversational, like he's already won.
2. He strolls the pocket, smooth over everything — the round arrives like it was never in doubt.
3. Low, level, unhurried — the confidence is the intimidation.
4. He talks to the room, not at it — easy cadence, and the crowd settles in like it's storytime.

**opener × speed** (speed_rapping)
1. He opens at full sprint — syllables stacking faster than the room can clap.
2. The first ten seconds are a blur of rhyme — the crowd pops for the athletics before the content even registers.
3. Machine-gun cadence out the gate — pen heads lean in to catch what the speed is hiding.
4. He front-loads the fast flow like a dare: keep up or just enjoy it.

**opener × heart** (passionate)
1. He opens with his chest — voice cracking at the edges, and the room quiets to make space for it.
2. The first bar out, you can tell this round is personal to him — the passion buys attention the pen will have to keep.
3. He performs the opener like the round owes him something — conviction first, craft close behind.
4. The emotion is turned all the way up from bar one — risky, riveting.

**opener × any**
1. He plants his flag in the first thirty — this is the tone, take it or argue with it.
2. Steady opener — no fireworks, just a foundation the round can build on.
3. He tests the room's energy with the first bars, listening as much as performing.
4. The round opens clean — both corners quiet, everything still to play for.

### A.2 `heater` (score ≥ 8.5, no flag)

**heater × pen**
1. He stacks multis three layers deep — the pen heads catch the second layer before the third one lands.
2. A scheme starts small and keeps growing — by the fourth flip the front row is doing the math out loud.
3. He slows down to let a punchline breathe, then stacks two more on top before the room recovers.
4. Every setup is a trap — the section that saw the flip coming got caught anyway.

**heater × street**
1. He walks {opponent} down mid-scheme — close enough to touch, calm enough to scare the front row.
2. The street talk gets specific — details, not decoration — and the block section is standing before the segment ends.
3. Every bar lands like a warning — {opponent} keeps his face straight, but the room is watching his reaction now, not the bars.
4. He turns the aggression up a gear without rushing a syllable — controlled menace, the hardest kind.

**heater × personal**
1. The angle gets uncomfortably specific — the room realizes he did his homework, and {opponent}'s poker face starts costing him effort.
2. He picks at something real — the crowd's reaction has that lower register it saves for personals that land.
3. Every name flip drags a piece of {opponent}'s history into the bar — receipts, not jokes.
4. He narrates {opponent}'s career back to him with a slant only an enemy could write.

**heater × story**
1. He builds the story block by block — the room leans in without being asked.
2. The narrative turns halfway through the segment and takes the crowd with it — you can hear the shift.
3. He makes the room live inside the scene — nobody checks a phone for the whole thirty.
4. Commentary with teeth — heads nod slow, the way rooms do when it's true.

**heater × showman**
1. He turns the segment into a show — voices, timing, the whole theater — and the ladies' section carries the noise.
2. The joke lands and he rides the laugh, mugging at {opponent} until the room laughs twice at the same bar.
3. He freestyles a stretch off the front row's energy — the room can tell it's live and loves him for it.
4. Every punchline has choreography — the crowd starts reacting to the setups alone.

**heater × any**
1. He hits a gear the round hasn't seen yet — the room's volume climbs with him.
2. A clean thirty — no wasted bars, the crowd louder at the end than the start.
3. He strings three straight connects — the room stops grading and starts reacting.
4. The energy jumps a level and the section by the stage jumps with it.

### A.3 `room_shaker` (haymaker + crowd ≥ 70)

**room_shaker × pen**
1. The scheme he's been feeding all segment pays off at once — the whole room does the math at the same instant and erupts.
2. He flips {opponent}'s name into the punchline of the sequence — pen heads are out of their seats.
3. A quotable lands so clean the front row repeats it back at him — the round stops until they settle.
4. He tops a punchline with a bigger one before the first pop dies — the room never gets its breath back.

**room_shaker × street**
1. He walks {opponent} down on the last bar of the sequence — the block section is ON THE STAGE.
2. The haymaker lands mid-walk-down — security takes one step forward and the crowd takes two.
3. He punctuates the sequence right in {opponent}'s face — the room roars, half hype, half checking whether it's still a battle.
4. The pressure builds bar over bar and detonates on the last line — phones up, section spilling forward.

**room_shaker × personal**
1. The personal lands so deep the room goes up and then quiet — like they're checking if he was allowed to say that.
2. He flips {opponent}'s name one final way nobody in the building saw coming — instant rewind material.
3. The angle he's been threading all round snaps shut — {opponent}'s corner is already arguing with the crowd.
4. He says the thing everybody whispered and nobody dared — the pop is half shock, half respect.

**room_shaker × story**
1. The story's last line reframes everything he said for two segments — the room gasps before it pops.
2. He lands the moral of the story on {opponent} — the crowd erupts at the flip from tale to takedown.
3. The scene he painted collapses into one line — the whole room catches the twist at the same instant.
4. He closes the story into dead silence — then the silence breaks all at once.

**room_shaker × showman**
1. He acts the haymaker out — the impression so on the nose that {opponent} breaks and laughs at his own funeral.
2. Half the bar is delivery — he freezes mid-gesture and lets the crowd finish the pop for him.
3. The joke lands, then the callback to it lands harder — the room is his for the rest of the round.
4. He pulls the front row into the moment — crowd work so smooth it feels scripted, except nobody scripts a pop like that.

**room_shaker × any**
1. HAYMAKER. The room goes up as one — the bar everybody will argue about tonight.
2. The whole building reacts before he even finishes the line — pop first, comprehension second.
3. That's the moment — phones up, section on its feet, {opponent} wearing the face you wear when it's real.
4. The pop is so loud he has to stand in it and wait — there's no performing over that.

### A.4 `haymaker` (haymaker + crowd 55-69 — the clean connect)

The mid-band haymaker: it landed flush and drew a real pop, but the building didn't come apart. This is the culture's bread-and-butter connect — the "chain punching" shot that wins rounds without trending — and it must never read as filler.

**haymaker × pen**
1. The punchline connects flush — a real pop, and the pen heads log it for the recap thread.
2. He caps the scheme with a clean flip — the room goes, quick and honest, and he's already building the next one.
3. A layered setup pays off right on time — a solid connect, the kind that wins rounds without ever trending.
4. The multi lands square — the front row pops, the back rows nod, everybody in the building heard it.

**haymaker × street**
1. The pressure bar connects — the block section barks back at him, quick and loud.
2. He lands one flush mid-walk-down — a jolt through the room, then straight back to work.
3. A hard connect off the aggression — {opponent} takes it standing, but the room clocked the hit.
4. One clean shot, no follow-up needed — the section by the stage answers it in one voice.

**haymaker × personal**
1. The angle connects — a sharp pop with a murmur underneath it, the room filing the receipt.
2. He lands the name flip clean — {opponent} smirks it off, but the pop already happened.
3. A personal that hits square — a quick roar, then the lean-in, the room wanting the next one.
4. The homework shows on one line — a clean connect, and {opponent}'s corner heard it too.

**haymaker × story**
1. A detail in the story lands harder than it should — the room pops mid-narrative and lets him keep going.
2. The scene turns and connects — a real reaction, and he rides it straight back into the telling.
3. One line of the commentary bites down — the pop is short, the slow nods after it are long.
4. The story throws a punch without breaking stride — the room answers and settles back in for the rest.

**haymaker × showman**
1. The bit lands flush — a laugh-pop, loud and immediate, and he milks exactly one beat of it.
2. He times the punchline to the room's breath — a clean connect, the ladies' section leading the noise.
3. A gag connects square — the room laughs first and respects the writing second.
4. Crowd work turns into a punch mid-act — the section he was playing to pays him back at full volume.

**haymaker × any**
1. A clean connect — the room goes up, quick and real, and the round keeps its shape.
2. The haymaker lands flush — a solid pop, no rewind needed, and the pressure shifts to {opponent} to answer it.
3. One lands — the crowd answers in one voice and hangs there, waiting on the follow-up.
4. The chain punching pays off — the biggest one connects and the room's floor rises a level.

### A.5 `delayed_pop` (haymaker + crowd < 55 — the layered-writing beat)

**delayed_pop × pen**
1. The bar goes over the room's head… two seconds of quiet… then the pen heads catch it and the pop rolls from the back wall forward.
2. Silence. Somebody in the front row explains it to his man — then the whole section goes.
3. It reads like filler until the room unpacks the double meaning — the late pop lands heavier than a clean one.
4. He doesn't wait for it — he's two bars ahead by the time the room finally catches what he did.

**delayed_pop × personal**
1. The name flip is too clean — the room needs a beat to catch which name he just flipped, then it goes.
2. The angle lands on a delay — first the polite pop, then the murmur of the crowd re-litigating {opponent}'s history in real time.
3. He drops the reference dry, no signpost — the section that knows {opponent}'s story detonates late and loud.
4. Two seconds of nothing, then somebody yells, and the whole room finally sees the setup he planted a segment ago.

**delayed_pop × story**
1. The story seems to wander — then the last detail clicks into the first one and the room pops on the delay.
2. It takes a beat for the room to realize the story was about {opponent} the whole time — then it goes.
3. The commentary lands soft, sits for a second, and detonates when the room catches the second meaning.
4. He trusts the room to catch up — the pop arrives late and rolls long.

**delayed_pop × any**
1. It takes the room a second to unpack it… then it lands, and it lands heavier for the wait.
2. Quiet — the kind that means the room is thinking — then the pop breaks somewhere in the back and spreads.
3. The layered one. Half the room claps polite; the other half explodes two beats late when they catch it.
4. No reaction… no reaction… then the roar. The delay was the room doing the reading.

### A.6 Event kinds

**choke × any**
1. He loses the thread — stops, restarts from the top. You can hear the phones come out.
2. The line dies in his mouth. He circles, reaches, gets nothing — the room's patience runs out one section at a time.
3. Blank. He mouths the start of the bar twice, asks the round back with his hands — the room isn't giving it back.
4. He stalls, walks a slow circle, stares at the floor for the words — somebody in the back starts the "CHOKE" chant.
5. The scheme collapses mid-flip and takes the next bar down with it — {opponent}'s corner is cackling.
6. Dead air. Thirty people film it, nobody helps him — the clip is already cut.

**choke × career** — gated: this battler has `chokedVsOpponentBefore` (§5.6)
1. Not again. Same wall, same opponent — the room remembers the last one before he even fully stops.
2. He freezes, and the building says it with one breath: he has done this against {opponent} before.
3. {opponent} doesn't even celebrate — he's seen this film. He just watches it happen again.

**stumble × recovered** (next segment ≥ 6)
1. He fumbles a line, pats the air, re-runs the bar — and lands it the second time hard enough to erase the first.
2. A syllable trips him — he turns the stumble into a shrug and the room lets it slide.
3. A half-second slip, a clean recovery — only the pen heads clocked it.
4. He loses the pocket for a beat, finds it, and finishes the sequence like the slip was pacing.

**stumble × rattled** (next segment < 6)
1. He trips over the flip and rushes the next two bars trying to outrun it — the room can smell the nerves.
2. The stumble knocks his timing loose — punchlines landing a half-beat early, pops coming back a half-size small.
3. He slips, hears the murmur, and starts performing at the murmur instead of the room.
4. One fumble and the confidence leaks — the volume is still up but the conviction isn't.

**stumble × any** — fallback (incl. a final-segment stumble, where there is no next segment to grade)
1. A line comes loose — half a beat of scramble before he finds the rail again.
2. The flip snags on the way out — the room hears it, holds its verdict, and lets the round continue.
3. He clips a syllable and pushes through — a small crack, the cost still being counted.
4. A wobble mid-sequence — nothing fatal, but the pen heads all clocked the exact bar it happened on.

**rebuttal × vs_choke** — opponent's half contained a choke
1. He opens ON the choke — recreates the freeze, hands and all — and lets the room finish the job.
2. The first thing out of his mouth flips the choke {opponent} just had — the crowd is up before his written even starts.
3. He hands the dead air right back to {opponent} with a stopwatch pantomime — cruelty, timed perfectly.
4. The choke was the setup; his opener is the punchline. The room knows a live flip when it hears one.

**rebuttal × cold_room** — opponent's half crowd ≤ 40
1. He names the exact energy {opponent} left in the room — flat — and offers himself as the fix. The room takes the deal.
2. He opens by measuring the silence {opponent} just earned — the crowd laughs at the last round and turns to face this one.
3. A live flip of a dead room — he pulls the crowd's own boredom into the opener and wakes the building up with it.
4. He walks out already dismissing the round they just sat through — and the room, relieved, rides with him.

**rebuttal × any** — the neutral-material cell doubles as the guaranteed fallback (no choke, no cold room, career gate closed)
1. He flips what {opponent} just said back on him — the room checks that it heard right, then goes up. That's a live one.
2. The opener answers the last round idea for idea — proof he was listening, and crowds pay for proof.
3. He takes {opponent}'s best moment from the previous half and reframes it as a setup for his own — daylight robbery, live.
4. Off the top, on topic, on target — the pen heads exchange the look: he did that HERE.

**rebuttal × career** — gated: `isRematch` (25% seeded swap-in on a landed rebuttal)
1. He flips a moment from the LAST time they battled — the section that remembers it erupts; everyone else asks what they missed.
2. A callback across battles — he answers something {opponent} did months ago, and the building loses it at the long game.
3. He picks up an argument from their first meeting like no time passed — the rivalry is the material now.

**rebuttal_missed × any**
1. He reaches for the flip… the room doesn't go with him. A flat opening, and now the written has to dig him out.
2. The rebuttal comes out half-formed — the crowd claps out of courtesy and he hears the difference.
3. He tries to flip the last round and fumbles the handle — {opponent}'s corner smirks; the room stays neutral.
4. The improv doesn't connect — he bails to the written two bars early, and the seam shows.

### A.7 Texture kinds

**dry_spot × any**
1. A stretch of filler — the section checks their phones.
2. Connective bars, nothing landing — the room's murmur climbs over his volume.
3. He's saying words and the room is waiting for bars — polite nods, dead eyes.
4. Thirty seconds of setup with no payoff in sight — even the pen heads glaze.
5. The round flatlines — conversations start in the back, the worst sound in battle rap.

**closer × strong** (last segment, score ≥ 6)
1. He drives the ending home — the last bar timed to the crowd's peak, mic-drop energy without the mic drop.
2. The final sequence lands stacked — he walks off mid-roar and lets the round end on the room's voice.
3. He saved a haymaker for the exit — the last thing anyone will remember about the round, and he knows it.
4. A big finish — the closer snaps the round shut, and the section takes ten seconds to sit back down.

**closer × quiet** (last segment, score < 6)
1. He lets the round end quietly — the last bars land soft and the room fills the gap with murmur.
2. The ending arrives instead of landing — no exclamation point, and the round drifts to the judges unclaimed.
3. He closes on connective tissue — the strongest material already spent, the finish coasts.
4. A flat final ten — the room claps the effort, not the moment.

**closer × any** — fallback (the strong/quiet key always resolves in practice; this cell exists so the contract can never come up empty)
1. The round runs out of road — he plants the last bar and hands the verdict to the room.
2. The final thirty ends the argument or leaves it open — either way, he finishes on his own terms.
3. The last sequence closes the loop on the opener — a shaped round, whatever the scoring says.
4. He brings it home steady — no theatrics, just the round's whole case restated one final time.

**building × any**
1. He works the middle of the round — laying track, moving the crowd a row at a time.
2. Setups in progress — the pen heads can see a payoff coming and they're waiting on it.
3. Steady bars, steady room — nothing viral, nothing wasted.
4. He shifts gears between sequences — housekeeping bars, keeping the round's engine warm.
5. The round breathes — he lets the last pop settle before he builds the next one.
6. A workmanlike thirty — the kind of stretch that wins rounds and never makes the recap.

### A.8 Career-gated feed cells (summary)

| Cell | Gate (`CareerContext`) | Where |
|---|---|---|
| `opener × rematch` | `isRematch`, round 1, either battler | swaps in for the delivery-group opener, 100% |
| `choke × career` | tonight's choker has `chokedVsOpponentBefore` | swaps in for `choke × any`, 100% |
| `rebuttal × career` | `isRematch` + rebuttal landed | 25% seeded swap-in |

**opener × rematch**
1. He opens by picking up where the last battle left off — the rematch is a sequel, and his delivery says so.
2. The first bars aim straight at the history — the building came for a rematch and he feeds it immediately.
3. He walks out carrying the last battle with him — the grudge is the opener.
4. The round starts mid-argument — because for these two, it never actually stopped.

### A.9 Career-gated INTERNET take pool (consumed by `TheInternet`, §5.4 rule 6)

Placeholders here additionally allow `{n}` (streak length), `{a}`/`{b}` (series score), `{share}`. Same lint rules apply.

**series** — gated `isRematch`
1. series is {a}-{b} now. run the trilogy.
2. {name} owns him. {a}-{b} and it's not really close.
3. the rematch answered NOTHING. {a}-{b} and both sides still arguing.
4. books close on this one at {a}-{b}… unless the demand says otherwise.

**streak** — gated |streak| ≥ 3 extended or snapped tonight
1. that's {n} straight for {name} — at some point it's not luck, it's a run.
2. the streak ends at {n}. and of course it's {opponent} who ended it.
3. {n} in a row. put respect on the run.
4. somebody had to snap it — {n} straight was getting disrespectful.

**choke-pattern** — gated tonight's choker `chokedVsOpponentBefore`
1. he choked against {opponent} AGAIN?? that's not a moment, that's a pattern.
2. second time freezing against the same man. it's mental at this point.
3. {opponent} lives in his head rent free — same freeze, different night.

**trilogy-demand** — gated `isRematch` AND band ≤ DEBATABLE
1. {share}% on a REMATCH? you already know part three is getting booked.
2. two battles, zero answers. the culture demands the trilogy.
3. run it back one more time and nobody gets to complain after.
