# LIFE EVENTS SYSTEM v2 — "Make It Sticky"

**Status**: Design spec — ready for implementation
**Author**: Game design, 2026-08-26 (rev 3 — critic round 1: trigger/copy honesty on VERDICT_SCORED_IT_CLEAN and VOICE_GONE, the storyline-beat library §8.2 promised, the `on_fire_effects` contract, and sim-modifier/trust units defined in `config.ts` terms)
**Supersedes**: the v1 template set in `supabase/migrations/006_seed_choice_based_life_event_templates.sql`
**Grounding**: `docs/design/research-letstalkbattlerap.md`, `research-battle-dynamics.md`, `research-reference-games.md`, plus the live code in `lib/game/lifeEvents.ts` and migrations `005`, `006`, `20251123070200`, `20251130063616`.

**The owner's verdict**: "Rock Bottom / Confidence Shaken — that's not it. They have to be STICKY." The pending list showed ROCK BOTTOM three times. This spec is the answer.

**Project laws honored throughout**: no generated bars/lyrics ever (describe moments, never quote them) · no purple anywhere · the winner does NOT get paid more — pay is a negotiated flat booking fee, winning pays off only in rep/rating/draw · players never write text — choices only.

**Map of the spec**: §0 autopsy · §1 categories · §2 stickiness rules + cast · §3 pacing + content-volume math · §4 art engine · §5 schema, trigger vocabulary, effects, on-fire contract, watchers, sim-modifier units · §6 the 25 anchor events · §7 the echo library + storyline beats (every payoff, fully written) · §8 storylines & rivalry heat · §9 presentation layer (components, routes, card anatomy, states) · §10 mobile · §11 rollout.

---

## 0. Autopsy: why v1 events bounce off

Before the fix, name the disease. Every v1 template fails the same five ways:

| v1 failure | Example | Why it's fatal |
|---|---|---|
| **No face** | "A sponsor wants to back you" — who? | FM/CK3/2K all prove events land through *people*. Anonymous system messages are furniture. |
| **No specifics** | "Time to make a serious change" | Abstractions can't be remembered. A $150-light envelope can. |
| **No history** | "You got destroyed 3-0" — by *whom*? | The player just LIVED that battle. Not naming the opponent tells them the game wasn't watching. |
| **No real dilemma** | "Embrace pressure" vs "take a break" — symmetric ±0.2 nudges | If both options are the same currency at the same magnitude, it's not a choice, it's a coin flip. |
| **Fires forever** | ROCK BOTTOM pending ×3 | `triggerLifeEventsForBattle()` in `lib/game/lifeEvents.ts` takes `matchingTemplates[0]` — first match, every battle, **never calling** `can_trigger_event()` / `has_pending_life_event()` even though migration `20251123070200` shipped those functions. The pacing layer exists in the DB and is dead code. |

**Implementation bug to fix on day one**: wire `lib/game/lifeEvents.ts` to the existing `can_trigger_event(template_code, battler_id, cooldown)` gate, replace first-match selection with the weighted draw in §3, and add the pending-event expiry rule. The DB is ready; the TypeScript never asked.

---

## 1. Category taxonomy — six domains

Six domains, each a *world* the battler lives in. Every template belongs to exactly one (crossovers pick a primary). Category drives the card's accent color, icon, backdrop pool, and the per-category pacing lane.

Base surface everywhere: `bg-zinc-950` page, `bg-zinc-900` card, `border-zinc-800`, headers `font-black uppercase tracking-tighter`. The category accent is a *trim*, not a flood: left border stripe (`border-l-4`), icon tint, choice-hover glow. **No purple, violet, indigo, lavender, or magenta anywhere — enforced at review.**

| Key | Display name | Icon concept (pixel-art, 32×32) | Accent | Art direction line |
|---|---|---|---|---|
| `family` | **KIN** | A kitchen table with two chairs, one pulled out | `amber-400` (borders/tints), `amber-500/20` fills | Warm interior light against the zinc dark — lamp glow, a kitchen table, porch at dusk. The one place the battler is not a battler. |
| `money` | **THE BAG** | A rubber-banded fold of bills, one band snapped | `emerald-500`, `emerald-500/20` | Cash-counting realism: envelopes, back offices, a day-job break room. Money is physical and always slightly short. |
| `streets` | **THE BLOCK** | A streetlight cone on wet pavement | `red-500`, `red-500/20` | Night exteriors, corners, parking lots after the venue empties. Tension in the framing — someone's always at the edge of the shot. |
| `industry` | **THE OFFICE** | A contract page with a signature line and a pen laid across it | `orange-500` (the house accent — the league IS the game) | League back rooms, folding tables with paperwork, a card lineup poster half-taped to a wall. Fluorescent, transactional. |
| `health` | **THE VESSEL** | A steaming mug beside a mic on a stand | `teal-400`, `teal-500/20` | Quiet and clinical-warm: a dim bedroom, a clinic waiting row, a mirror. The only domain that's allowed stillness. |
| `media` | **THE FEED** | A phone screen mid-scroll with a play button glowing | `zinc-300` "screen glow" (see sign-off box) | Screens-in-the-dark: phone glow on a face, a podcast desk with two mics, comment sections rendered as pixel text walls. |

> **⚠ OPEN ITEM — OWNER SIGN-OFF REQUIRED (accent trims).**
> The six category trims deliberately stretch the house zinc+orange single-accent discipline. That is defensible (CK3-style category coding is exactly what the trims buy), but it is a brand call, not a designer call. Two changes from rev 1:
> 1. **THE FEED's `sky-400` is dropped** — it drifted blue and read as a second brand color. Replacement: `zinc-300` used as a "screen glow" (icon tint, border stripe, hover) — it reads as phone-light, not as a palette entry.
> 2. **Until Robert signs off in this box, implementation ships orange-only trims for all six categories.** The per-category accents are already speced above and land behind a single token flip (`CATEGORY_ACCENTS_ENABLED`) — zero rework either way.
>
> Sign-off: ☐ approved as speced (5 accents + screen-glow) · ☐ orange-only forever · ☐ other: ______
> No purple anywhere regardless of the outcome.

**Migration note**: `life_event_templates.category` currently has CHECK `('career','personal','scandal','financial','relationship')` (migration `20251130063616`). v2 migration replaces the constraint with `('family','money','streets','industry','health','media')` and remaps existing rows (`career→industry`, `personal→family`, `scandal→media`, `financial→money`, `relationship→family`).

---

## 2. Stickiness rules — the checklist

**Every template must pass ALL seven hard rules, and score at least 4 of the 5 soft marks, before it ships.** Add this checklist as a comment block above every seed insert. **The rules apply to echo templates (§7) exactly as they apply to anchors** — the payoff cards are the ones players remember, so they get held to the bar hardest.

### Hard rules (pass/fail)

1. **It has a face.** The event comes *from someone* — a named recurring NPC (§2.1), a named opponent from the player's history, or a named media outlet. Zero anonymous "a sponsor / a platform / the league" phrasings. Sender name + portrait render on the card.
2. **Concrete specifics, zero abstractions.** Dollar amounts, place names, day counts, round numbers. "The envelope is $150 light" — never "financial trouble." "Your third round vs {opponent}" — never "your performance." Test: could a player retell this event to a friend as an anecdote? If it retells as a stat change, rewrite it.
3. **It calls back the player's actual history.** At least one interpolation token from the context object (§2.2): the opponent they just fought, the real scoreline, their streak, their league, their balance. The game must prove it was watching. (Echoes satisfy this by construction — they ARE the callback — but still carry at least one live token.)
4. **Real stakes, asymmetric currencies.** Choices trade *different* currencies (money vs family vs prep vs rep vs future offers), never the same stat at ±. At least one choice must genuinely hurt something the player cares about. Per the anti-FM rule: every negative situation ships with at least one costed lever — no "unhappy about something you can't fix."
5. **Culture-native voice.** Copy uses the glossary from the research briefs — *body, debatable, edged, stock, buzz, card, the lab, tape, road game, run that back, off the top, receipts, asking price* — and NEVER invents bars. Describe the moment and the room ("the delayed reaction when the scheme landed", "he walked you down into a room shaker"), never quote a line. Money copy always respects the law: flat negotiated fee, win or lose; wins raise *draw*, draw raises the *next* negotiation.
6. **Divergent outcomes.** No two choices may converge to the same world-state. Cheapest divergence: a different NPC remembers it, a different flag set, a different echo scheduled — and later copy occasionally proves it ("You kept the Papo thing quiet — he remembered.").
7. **Pacing-clean.** Rarity assigned, cooldown assigned, weight assigned. No `{"any": true}` triggers — every event earns its moment from state. (Echo templates are pacing-clean by construction: they live on the deterministic lane, fire at most once per anchor firing, and never enter the random draw.)

### Soft marks (need ≥4)

- [ ] An option is **gated** by badge / attribute / origin / NPC relationship and shown locked with its requirement ("🔒 Requires *Freestyle Genius*") — the CK3 `show_as_unavailable` pattern, marketing progression inside the event.
- [ ] At least one **hidden ripple**: an `echo` (§5 effects spec) the player discovers 1–4 battles later.
- [ ] The aftermath is **visible on the dashboard** (balance moved, badge progress ticked, storyline heat changed, an article published).
- [ ] Uses the **special/dangerous color language**: at most one gold-flagged rare-opportunity option or one red-flagged risky option per event.
- [ ] Feeds or spawns a **storyline** — a real `storylines` row (§8): rivalry heat with a named opponent, an NPC relationship arc, or a named angle that opponents can bring on stage. Not a card that lives and dies alone.

### 2.1 The recurring cast

Route the majority of events through **eight persistent named NPCs**. One okay event from a character with twenty battles of shared history beats a brilliant one-off. Each NPC has a portrait (3 expressions), a relationship score (−5..+5, stored in `npc_relationships` — schema in §5.3), and a memory line — recent events reference prior ones ("After you let him eat that $150…").

| NPC | Key | Role | Domain home | Voice |
|---|---|---|---|---|
| **Reggie "Two Phones" Banks** | `reggie` | Your manager. Takes 15%. Always mid-negotiation on the other phone. | money / industry | Fast, numbers-first, loyal but always eating. |
| **Junie** | `junie` | Your little brother. Wants in the culture worse than you did. | family | Eager, reckless, watching everything you do. |
| **Moms** | `moms` | Your mother. Has never seen you battle. Knows anyway. | family | Short sentences that land harder than haymakers. |
| **Tone** | `tone` | Childhood friend, still on the block. Your name travels back there with consequences. | streets | Quiet, watchful, "I'm just saying what I heard." |
| **Papo Reese** | `papo` | Underground promoter. Runs **The Cellar** — pays cash in rubber bands, occasionally light. | money / streets | Warm handshake, moving target math. |
| **DJ Verdict** | `dj_verdict` | Recap blogger, runs **The Verdict**. Has scored every battle you've had since Underground — and keeps receipts. | media | Round-math-first, stock-market vocabulary, no mercy. |
| **The league owner** *(slot)* | `league_owner` | Filled per current league tier from seed (e.g. "Big Curt", Small Room Circuit). Contracts, cards, footage, fines. | industry | Institutional. Everything is leverage. |
| **The mentor** *(slot)* | `mentor` | Origin-gated: **Quill** (Text Forums), **Livewire** (App Camera), **Old Head Sut** (Crew). | health / industry | The only one allowed to tell you the truth about your last round. |
| **Ms. Dulaney** *(minor)* | `dulaney` | Your day-job shift manager. Posts the schedule; tired of the "appointments." | money | Procedural, not unkind. Everything in writing. |

### 2.2 The interpolation context

Copy is written with tokens, resolved at trigger time from data the sim already produces (`details_json` in `lib/game/lifeEvents.ts` + joins):

```
{opponent}        last battle's opponent stage name
{result}          last scoreline as culture-speak: "3-0", "2-1", "the body", "a debatable 2-1"
{league}          current league name          {city}      current league's city
{fee}             last/next booking fee ($)    {balance}   battlers.current_balance
{streak}          current win streak           {next_opponent} accepted battle's opponent
{peak_moment}     descriptor from best segment ("the round-three room shaker")
{npc.*}           NPC names from the cast table (league owner / mentor resolved per player)
{rival}           storyline-beat lane only: the storyline subject's stage name
                  (resolved from the storylines row that fired the beat — §7 beats, §8.2)
{anchor.*}        echo lane only: fields captured when the source anchor resolved
                  ({anchor.opponent}, {anchor.choice_label}, {anchor.battle_number})
```

Rendering: simple `{token}` replacement server-side when the `battler_life_events` row is created; resolved copy stored in `details_json.rendered_body` so history reads correctly forever. For echoes, the anchor resolution snapshot is stored on the scheduled row's `details_json.anchor_context` at schedule time — echoes must read true even if the world moved on.

---

## 3. Pacing & dedupe rules

Tune these like the choke rates were tuned — all constants live in `lib/game/config.ts`.

```ts
// lib/game/config.ts — EVENT PACING (v2)
EVENT_FIRE_CHANCE = 0.33          // gate roll per completed battle → ~1 event per 3 battles
EVENT_MAX_PENDING = 1             // hard cap; enforced IN CODE via has_pending_life_event()
EVENT_PENDING_EXPIRY_BATTLES = 2  // unresolved after 2 battles → auto-resolve to default choice
EVENT_CATEGORY_COOLDOWN = 2       // no two events from same category within 2 battles
SEEN_TWICE_WEIGHT_MULT = 0.2      // template fired 2+ times this career → weight × 0.2
CAREER_YEAR_BATTLES = 20          // the action-based "year" — see §5.2 (year_end)
```

| Rarity | Base weight | Per-template cooldown | Career cap |
|---|---|---|---|
| `common` | 100 | 6 battles | — |
| `uncommon` | 50 | 8 battles | — |
| `rare` | 20 | 12 battles | — |
| `epic` | 7 | 20 battles | 2 |
| `legendary` | 2 | — | **1 per career** |

**Selection algorithm** (replaces `matchingTemplates[0]`):

1. Battle completes → roll `EVENT_FIRE_CHANCE`. Fail → no event. (Echo-lane events skip this roll — see below.)
2. If `has_pending_life_event(battler)` → no event. **One pending, ever.** (This alone kills "ROCK BOTTOM ×3".)
3. Filter templates: `lane='anchor'` only · trigger condition matches state · not on per-template cooldown (`is_event_on_cooldown`, cooldown from rarity) · category not fired within `EVENT_CATEGORY_COOLDOWN` · career caps not hit.
4. Weighted draw: `weight = rarity_base × relevance × seen_decay`. Relevance multipliers make the game feel like it's watching: low `family_bond` → family ×2; `balance < $200` → money ×2; `choked` last battle → health ×2; `streak ≥ 3` → industry/media ×1.5.
5. Create the instance (with `source_battle_id` = the battle that rolled it), call `record_event_trigger()`, render tokens, notify.

**Two lanes, RNG never owns the spine**:
- **Random lane**: the flavor pool above, gated by the 0.33 roll.
- **Deterministic lane**: echo events (§7), watcher payoffs (§5.4), and story beats (tier promotion, origin milestones, `year_end`) fire on schedule, bypass the roll, but still respect the single-pending cap — if the slot is occupied, they queue for the next battle.

**Post-battle order of operations** (one function, called from the sim completion path): `resolveExpiredEvents()` → `decayStorylines()` (§8) → `evaluateWatchers()` (§5.4) → `fireDeterministicLane()` → `rollRandomLane()`.

**Expiry**: a pending event unresolved after `EVENT_PENDING_EXPIRY_BATTLES` auto-resolves to its designated `default_choice` (always the least-disruptive option) and logs it. The world does not wait, and the inbox can never rot.

### 3.1 Content volume — the math against a 150–220-battle career

The pacing constants above are honest only if the pool can feed them. Do the arithmetic:

- Expected random-lane fires ≈ `0.33 × battles`: **~13 by battle 40 · ~30 by battle 90 · ~50 by battle 150 · ~73 by battle 220.**
- A 25-anchor pool cannot survive that. By fire ~30, every common and uncommon has fired twice → the whole pool is at ×0.2 seen-decay, rares/epics are cooldown- or cap-blocked, and step 3's filter starts returning empty sets. Result: **the sticky system goes silent somewhere around battle 40–60** — or worse, repeats anyway. The v1 disease with better handwriting.

**The fix is band-gating plus a hard coverage rule:**

- Every anchor carries a career band via `min_battles`/`max_battles`: **Rookie 1–25 · Contender 26–90 · Veteran 91–160 · Legacy 161+.** A band's templates can't be burned before the player gets there.
- **Coverage rule (CI-enforced): each band's eligible anchor count must be ≥ 3× that band's expected fires.** Expected fires per band: Rookie ~8, Contender ~21, Veteran ~23, Legacy ~20 → required anchors: **≥24 / ≥63 / ≥69 / ≥60**... at full maturity. That is the destination, not the ship gate — the interim targets below keep every *shipped* band covered.
- **Target pool sizes**: v2 ships **25 anchors + 21 echoes** (46 cards) — full coverage of Rookie and early Contender (through ~battle 45), which is exactly the window current playtesting lives in. Steady-state target: **100 anchors (~17 per category, spread across all four bands) + ~60 echoes.**
- **Authoring cadence**: v2.1 = +25 Contender-band anchors (+ their echoes) · v2.2 = +25 Veteran · v2.3 = +25 Legacy · maintenance +6 per quarter thereafter. Each patch is a seed migration; each template passes the §2 checklist in review.
- **Echoes are free volume**: they never enter the random pool, so they add play-facing cards without pool burn. At the §6/§7 echo rates (average ~0.6 chance across scheduled echoes, several at 1.0), each anchor fire yields ~0.5 echo cards → **effective event volume ≈ 1.5× anchor fires** for the same pool.
- **The debt is a number**: `scripts/audit-event-pool.ts` (sibling of the art auditor in §4.2) computes per-band eligible counts vs the 3× rule and prints red/green. It runs in CI next to the build. When a band goes red, that's the next content patch — not a surprise at battle 47.

---

## 4. Content engine — the asset registry

**Principle (from CK3 P11)**: never one illustration per event. Compose: **~10 backgrounds × 8 NPC portraits (3 expressions each) × 6 category icons** ≈ every event card looks distinct off ~40 assets. The repo already holds **1,632 sprites** under `public/sprites/` (`characters/` 921, `crowd/` 567, `leagues/` 152, `badges/` 120, `cities/` 85) — the engine's first job is *reuse*, its last resort is generation.

### 4.1 Registry table

```sql
create table event_art_registry (
  id          uuid primary key default gen_random_uuid(),
  asset_key   text unique not null,   -- 'bg.the_cellar', 'npc.reggie.worried', 'icon.money'
  kind        text not null check (kind in ('background','portrait','icon','prop')),
  file_path   text not null,          -- repo-relative: 'public/sprites/events/bg/the_cellar.png'
  source      text not null check (source in ('library','generated')),
  library_origin text,                -- when source='library': original sprite path reused
  style_ref   text,                   -- when generated: style-reference sheet used (art law)
  dimensions  text not null,          -- per docs/CANVAS_SIZES.md (the sizing authority)
  focal       text not null default '50% 50%',  -- CSS background-position focal point;
                                      -- drives the mobile crop (§10) so small screens
                                      -- keep the composition, not the center pixels
  tags        text[] default '{}',
  created_at  timestamptz default now()
);

alter table life_event_templates add column if not exists art jsonb default '{}'::jsonb;
-- art: { "background": "bg.the_cellar", "left_portrait": "npc.papo.neutral",
--        "right_portrait": null, "icon": "icon.money" }
```

### 4.2 Lookup flow (check first, generate last)

```
resolve(asset_key):
  1. REGISTRY HIT  → return file_path. Done. (The hot path, ~100% after warm-up.)
  2. LIBRARY SCAN  → search public/sprites/** by tags + NAMING_GUIDE.md conventions
                     (e.g. 'npc.tone.*' → characters/ sheets tagged street/male;
                      'bg.parking_lot' → cities/ or crowd/ backdrops).
                     Match → copy/crop to public/sprites/events/, register with
                     source='library', library_origin=<path>. Return.
  3. GENERATE      → PixelLab /generate-image-v2, ALWAYS passing style_image =
                     the existing crowd sheet style reference (house art law),
                     dimensions from docs/CANVAS_SIZES.md. Write file, register
                     with source='generated' + style_ref. Return.
  4. FALLBACK      → category icon on zinc-900 (never a broken image).
```

Tooling: `scripts/audit-event-art.ts` walks every `life_event_templates.art` reference, reports registry coverage, and emits the generation worklist — so art debt is a number, not a surprise. Generation is a batch/offline step; the game never calls PixelLab at runtime.

### 4.3 The v2 asset bill

Backgrounds (10): `bg.kitchen`, `bg.porch_dusk`, `bg.the_cellar`, `bg.back_office`, `bg.parking_lot`, `bg.block_corner`, `bg.league_office`, `bg.green_room`, `bg.bedroom_dim`, `bg.podcast_desk`. Portraits: 9 NPCs × `neutral/worried/heated` (Dulaney can ship with `neutral` only). Icons: 6 category marks from §1. Everything checked against the library first — the crowd and cities sets likely cover several backgrounds outright.

---

## 5. Schema & effects extensions

Keep the v1 shape (`code, title, description, trigger_type, trigger_condition, choice_a/b_text, choice_a/b_effects, category, severity, rarity, icon_emoji`) and add:

```sql
alter table life_event_templates
  add column if not exists choice_c_text text,
  add column if not exists choice_c_effects jsonb,
  add column if not exists default_choice text not null default 'a'
    check (default_choice in ('a','b','c')),
  add column if not exists sender text,             -- NPC key or media outlet
  add column if not exists cooldown_battles int,    -- overrides rarity default
  add column if not exists career_cap int,          -- null = unlimited
  add column if not exists lane text not null default 'anchor'
    check (lane in ('anchor','echo')),              -- echo rows NEVER enter the random draw
  add column if not exists variants jsonb;          -- echo lane: [{key, when, body, choices?}] — §7.0

alter table battler_life_events
  add column if not exists scheduled_for_battle_number int,  -- echo lane
  add column if not exists source_battle_id uuid references battles(id);
-- status gains 'scheduled' and 'expired':
--   check (status in ('pending','resolved','scheduled','expired'))
```

### 5.1 Effects JSON keys

Existing keys stay live (`reputation, public_knowledge, financial_stability, family_bond, resilience, lyricism, stage_presence, prep_bonus_writing, prep_bonus_performance, prep_bonus_all, prep_penalty`). v2 adds:

| Key | Shape | Meaning | Wiring |
|---|---|---|---|
| `cash` | int | Dollar delta to `battlers.current_balance` (the unified wallet) | new, day-one |
| `echo` | `{template_code, delay_battles, chance}` | Schedule a follow-up instance (`status='scheduled'`, fires via deterministic lane, anchor context snapshotted) | new, day-one |
| `npc` | `{"reggie": 1, "papo": -2}` | Relationship deltas on the recurring cast (clamped −5..+5, memory appended) — §5.3 | new, day-one |
| `league_trust` | int | Relationship with the current league (per battler × league, −5..+5) — bounds, decay, and the exact offer-quality formula in §5.5 | new — §5.5 |
| `next_battle` | `{crowd_bonus, stumble_chance_delta, opponent_angle_bonus}` | One-shot sim modifiers consumed by `simulation.ts` at the next battle — units, clamps, storage, and consumption in §5.5 | new — §5.5 |
| `fee_floor` | `{amount, applies_to: 'self'│'both'}` | Permanent raise to the negotiated booking-fee floor (`battlers.fee_floor_bonus`, §5.5); `'both'` also raises the anchor opponent's — heat pays both names, and the winner still doesn't see a dime more | new — §5.5 |
| `storyline` | `{kind, subject, delta, note}` | Create-or-heat a `storylines` row (§8); the beat is appended with the event code | new |
| `watcher` | `{watch_code, per_battle, window_battles, fires_template, on_lapse}` | Arm a silent multi-battle condition (§5.4) | new |

### 5.1.1 `on_fire_effects` — effects that land with the card, not the choice

E7's bounced check, E9's settlement money, E12's angle ammunition, E21's award-night payouts all happen whether or not the player has answered the card — the world moved first, the choices are the response. Rev 2 wrote these as italics with no schema home. Now they have one:

```sql
alter table life_event_templates
  add column if not exists on_fire_effects jsonb;  -- same §5.1 key vocabulary as choice effects
-- Variant override: variants[] entries (§7.0) may carry their own "on_fire_effects".
-- A variant's payload REPLACES the base payload wholesale when that variant is
-- selected — no merging, no partial inheritance. The base row's payload is the
-- fallback and must always be safe to apply on its own.
```

**Application order — canonical, no exceptions:**

1. **Instantiation** (either lane): select variant (echo lane) → snapshot anchor context → **apply `on_fire_effects`** (the selected variant's if present, else the base row's) → render tokens → row goes `pending` → notify. The applied payload is recorded in `details_json.on_fire_applied` — applied exactly once, ever, idempotent under retries.
2. **Resolution** (player choice OR `default_choice` on expiry): apply the chosen choice's effects ON TOP. Expiry applies ONLY the default choice's effects — on-fire effects already happened at instantiation and are never re-applied and never reverted. An expired STIFFED still lost the $400. The world does not wait for you to read the mail.
3. **Restrictions (CI-checked by `audit-event-pool.ts`)**: `echo` and `watcher` keys are ILLEGAL inside `on_fire_effects` — an unread card must never chain new futures; only choices schedule consequences. `storyline` IS allowed (the beat happened in the world, on camera, whether you answered or not).
4. **Presentation**: on-fire deltas render on the card itself as a "WHAT ALREADY HAPPENED" line above the choice stack (§9.4) — "−$400 · THE CHECK BOUNCED" — so the choices read as response, never cause. The same deltas appear in the history row's "WHAT IT CHANGED" list, marked distinctly from the choice's deltas.

### 5.2 Trigger vocabulary — the COMPLETE list the evaluator implements

**Contract**: `trigger_condition` is an object; all keys are AND-ed. **An unknown key causes the template to be SKIPPED (fail-closed) with a `console.warn` + telemetry count** — a typo must never make an event fire loosely. This table is exhaustive; §6 uses nothing outside it.

| Key | Type | Evaluated against |
|---|---|---|
| `min_battles` / `max_battles` | int | Career completed battles (also the band-gating mechanism, §3.1) |
| `outcome` | `'win'│'loss'` | Last completed battle, from this battler's perspective |
| `result` | `'3-0'│'2-1'` | Last battle's round scoreline from `battle_rounds`, **always written winner-first**. So "you got bodied" = `{"result":"3-0","outcome":"loss"}` (event 4) |
| `choked` | bool | Any choke flag on this battler's segments in the last battle |
| `win_streak` | int | Current consecutive wins ≥ value (from `rankings`) |
| `min_streak_loss` | int | Current consecutive losses ≥ value |
| `min_peak_score` | number | Last battle's `peak_score` ≥ value |
| `min_reputation` / `max_reputation` | number | `battler_attributes` personal → reputation (1–10 scale) |
| `min_public_knowledge` / `max_public_knowledge` | int | The 0–100 fame meter on the battler row |
| `min_family_bond` / `max_family_bond` | number | Personal attribute, 1–10 |
| `min_balance` / `max_balance` | int | `battlers.current_balance`, dollars |
| `has_next_battle` | bool | An accepted, not-yet-simulated battle exists |
| `min_full_prep_streak` | int | Consecutive completed battles, counting back from the most recent, each with ≥5 prep days logged in `prep_blocks`. "Living in the lab" as a queryable fact — the gate that lets grind-fiction events (VOICE_GONE) earn their moment instead of taxing every booking |
| `year_end` | bool | See below — the action-based calendar |
| `min_npc` / `max_npc` | `{npc_key: score}` | `npc_relationships.score` for the named NPC |

**`year_end` — defined, because this game has no clock-seasons.** The documented time system is action-based (Option A — no wall-clock calendar). A **career year = `CAREER_YEAR_BATTLES` (20) completed battles**. `year_end` evaluates true on the deterministic lane exactly when `battle_number % 20 === 0` (battles 20, 40, 60…). Year-end templates (event 25) fire from that lane, so "Award Season" lands on schedule for every player regardless of how fast they play. The old `season_end` key from rev 1 is **retired** — do not implement it.

### 5.3 `npc_relationships` — the schema behind the cast

Name-dropped in rev 1; here it is:

```sql
create table npc_relationships (
  id          uuid primary key default gen_random_uuid(),
  battler_id  uuid not null references battlers(id) on delete cascade,
  npc_key     text not null check (npc_key in
    ('reggie','junie','moms','tone','papo','dj_verdict','league_owner','mentor','dulaney')),
  score       int not null default 0 check (score between -5 and 5),
  memory      jsonb not null default '[]',
  -- memory: capped ring of 10 entries, newest first:
  --   [{"code":"LIGHT_ENVELOPE","choice":"b","battle_number":14}]
  updated_at  timestamptz not null default now(),
  unique (battler_id, npc_key)
);
```

Rows are created lazily on first `npc` delta. The `npc` effect clamps into −5..+5 and appends to `memory`. Memory serves three masters: hard-rule-6 callback copy ("After you let him eat that $150…"), the relationship pips on the card (§9.3), and `min_npc` gates ("🔒 Requires Reggie ≥ +3").

### 5.4 `event_watchers` — silent flags, made of tables

Event 18's "if you finish the next three battles 2-1 or better" needs real storage and a real evaluation pass. Generalized:

```sql
create table event_watchers (
  id               uuid primary key default gen_random_uuid(),
  battler_id       uuid not null references battlers(id) on delete cascade,
  source_event_id  uuid references battler_life_events(id),
  watch_code       text not null,          -- 'RANKED_LAST_RUN'
  per_battle       jsonb not null,         -- condition each battle must meet,
                                           -- written in the §5.2 vocabulary, e.g. {"outcome":"win"}
  window_battles   int not null,           -- how many consecutive battles are watched
  battles_watched  int not null default 0,
  fires_template   text not null,          -- echo code scheduled on success
  on_lapse         text,                   -- optional echo code on failure; null = die silent
  context          jsonb not null default '{}',  -- e.g. {"anchor_choice":"a"} → variant selection
  status           text not null default 'armed'
    check (status in ('armed','fired','lapsed')),
  created_at       timestamptz not null default now()
);
```

Evaluation (in `evaluateWatchers()`, §3 order-of-operations): after each completed battle, every `armed` watcher checks `per_battle` against that battle. Fail → `status='lapsed'` immediately (fire `on_lapse` if set). Pass → increment `battles_watched`; when it reaches `window_battles`, set `status='fired'` and schedule `fires_template` on the deterministic lane (next battle, single-pending cap respected), passing `context` through for variant selection. Watchers are invisible to the player until they pay off — that is the point.

### 5.5 Sim-modifier & trust units — defined like the choke constants were

Rev 2 named `crowd_bonus`, `opponent_angle_bonus`, and `league_trust` and never said what one point WAS. Every unit below is grounded in the live math in `lib/game/simulation.ts` and `lib/services/battleOffers.ts`, with clamps, storage, and consumption semantics — the same discipline the choke constants got, tunable in the same file.

```ts
// lib/game/config.ts — EVENT SIM MODIFIERS (v2)
EVENT_CROWD_BONUS_MIN: -10,           // next_battle.crowd_bonus: additive POINTS on the
EVENT_CROWD_BONUS_MAX: 10,            //   0-100 crowd_reaction, per round, pre-clamp
EVENT_STUMBLE_DELTA_MIN: -0.02,       // next_battle.stumble_chance_delta: per-SEGMENT
EVENT_STUMBLE_DELTA_MAX: 0.03,        //   probability, same currency as STUMBLE_BASE_PROBABILITY
EVENT_ANGLE_POINT_PEAK_CHANCE: 0.01,  // next_battle.opponent_angle_bonus: each point adds
                                      //   +1% absolute per-segment peak chance to the OPPONENT
EVENT_ANGLE_BONUS_MIN: -5,            // angle points write-clamp
EVENT_ANGLE_BONUS_MAX: 5,
EVENT_ANGLE_PEAK_CHANCE_FLOOR: 0.05,  // opponent's effective peak chance clamps to
EVENT_ANGLE_PEAK_CHANCE_CAP: 0.35,    //   [floor, cap] after all angle math
LEAGUE_TRUST_MIN: -5,                 // league_trust bounds (per battler × league)
LEAGUE_TRUST_MAX: 5,
LEAGUE_TRUST_DECAY_BATTLES: 5,        // one step toward 0 per 5 battles without a new delta
LEAGUE_TRUST_FEE_STEP: 0.03,          // ±3% negotiated fee per trust point (±15% at bounds)
LEAGUE_TRUST_MARQUEE_GATE: 3,         // trust ≥ +3 required for loyalty/marquee slots
LEAGUE_TRUST_OFFER_DROP: -3,          // trust ≤ −3 → one fewer offer per generation cycle
FEE_FLOOR_BONUS_CAP: 0.25,            // lifetime cap on battlers.fee_floor_bonus (+25%)
```

**`next_battle.crowd_bonus` — points, not a multiplier.** `crowd_reaction` is a 0–100 integer computed per round in `simulation.ts` (`(average_score/10)*50 + (performancePower/10)*50*league.base_crowd_factor`) that already takes additive point bonuses — `badgeEffects.crowdReactionBonus` and promotion's ±25 `crowdPerceptionPoints`. `crowd_bonus` joins that sum: added once per round (and to the per-segment crowd figure beside the badge bonus), BEFORE the existing final `Math.min(100, Math.max(0, …))` clamp. Effect values write-clamp to [−10, +10]; stacked `next_battle` effects SUM before clamping. Scale check: MOMS_FRONT_ROW's +3 is a slightly warmer room; a rivalry payoff's +8 is a room that arrived already loud.

**`next_battle.stumble_chance_delta` — per-segment probability, badge units.** Same currency as `STUMBLE_BASE_PROBABILITY` (0.042/segment). Applied in `simulateSegment` exactly where badge modifiers land (`stumbleProbability += …`), BEFORE the `STUMBLE_MINIMUM`/`STUMBLE_MAXIMUM` [0.002, 0.05] clamp — so VOICE_GONE's +0.02 takes a typical battler from ~4% to ~6% per segment: audible over a battle, not crippling. Write-clamp [−0.02, +0.03].

**`next_battle.opponent_angle_bonus` — points of opponent peak chance.** The sim's existing "angle" mechanism is the peak roll: `peakChance = researchDays > 0 ? PEAK_PROBABILITY : PEAK_PROBABILITY * 0.5`, then `finalScore *= 1.2 + badgeEffects.peakBonus`. One angle point = `EVENT_ANGLE_POINT_PEAK_CHANCE` (+0.01 absolute) added to the OPPONENT's per-segment `peakChance` in the player's next battle. Ammunition, not accuracy: he walks in with more haymaker attempts; the room decides if they land. E12's +3 takes a no-research opponent from 0.075 to 0.105 per segment — a ~40% jump in haymaker attempts, felt across 12–18 segments. Mitigation choices apply negative points; everything sums, then the effective chance clamps to [0.05, 0.35]. Points write-clamp [−5, +5].

**Storage & consumption — one-shot semantics.** Migration adds `battlers.next_battle_modifiers jsonb not null default '{}'::jsonb`. Effect application deep-merges by SUMMING numeric leaves, then write-clamps each key per the constants above. `run-due-battles` reads the column when simulating this battler's next battle, hands the values into the sim, and resets the column to `{}` in the same transaction — consumed exactly once by the next battle simulated for this battler, never carried to a second one.

**`league_trust` — bounded int, lazy row, decay, and the exact offer formula.**

```sql
create table league_trust (
  id                uuid primary key default gen_random_uuid(),
  battler_id        uuid not null references battlers(id) on delete cascade,
  league_id         uuid not null references leagues(id) on delete cascade,
  score             int not null default 0 check (score between -5 and 5),
  last_delta_battle int not null default 0,  -- career battle number of the last delta
  updated_at        timestamptz not null default now(),
  unique (battler_id, league_id)
);
```

- The `league_trust` effect applies to the battler's CURRENT league (`battlers.primary_league_id`), row created lazily like `npc_relationships`, clamped into [−5, +5], `last_delta_battle` stamped on every delta.
- **Decay**: in the `decayStorylines()` pass (§3 order of operations): when `battle_number − last_delta_battle ≥ LEAGUE_TRUST_DECAY_BATTLES`, move `score` one step toward 0 and re-stamp. Grudges and favors both fade; neither is permanent unless refreshed.
- **Offer quality — the exact hooks in `battleOffers.ts`:**
  1. **Offer count**: `generateOffersForPlayer` computes `offerCount` from financial stability (1–3 offers). After that: trust ≥ `LEAGUE_TRUST_MARQUEE_GATE` → +1 offer; trust ≤ `LEAGUE_TRUST_OFFER_DROP` → −1 offer, floored at 1. A frozen-out player still gets a lifeline — being iced completely is a storyline beat, never a silent default.
  2. **Marquee gating**: loyalty-slot bookings (LOYALTY_SLOT, REMEMBERED, rivalry payoff cards from §8.2) require trust ≥ +3 at fire time; below it the deterministic lane HOLDS them until trust recovers — they queue, they don't die.
  3. **Fee**: when the negotiated-fee field lands (money system), the formula is `fee = round(base_league_fee × (1 + LEAGUE_TRUST_FEE_STEP × trust + fee_floor_bonus))` — ±15% at the trust bounds. The fee is set at booking, for BOTH names, identical win or lose. Trust moves the NEGOTIATION, never the result: the flat-fee law is untouched by every constant in this section.

**`fee_floor` — the permanent raise.** Migration adds `battlers.fee_floor_bonus numeric not null default 0` (a fraction: 0.05 = +5% in the fee formula above). The `fee_floor` effect adds `amount` to it, capped lifetime at `FEE_FLOOR_BONUS_CAP` (+0.25). `applies_to: "both"` also raises the anchor opponent's row — this is how BOTY_NIGHT (E21) pays the L-taker the exact same day the winner gets paid. Classics raise both floors; nobody's floor rises for winning.

---

## 6. Twenty-five anchor events

Format per event: **CODE — Title** · category / rarity / sender · trigger → body → choices (`[GOLD]` = rare opportunity flag, `[RED]` = dangerous flag, `🔒` = gated) → echoes. All body copy ships with tokens; all money obeys the flat-fee law; no bars are ever quoted. **Every echo code referenced below is fully written in §7 — none of them are vibes.**

---

### KIN (family)

**1. JUNIE_WANTS_IN — "He Used Your Name"**
`family` / uncommon / Junie · trigger: `{"outcome":"win","min_battles":3}`
> Papo Reese calls you laughing. Junie showed up at The Cellar last night asking for a spot on the undercard — told the door he's "{opponent}'s problem next." He's sixteen. He's been writing in your old notebooks.
- **A. Put him on — under your wing.** `{"family_bond":0.6,"prep_penalty":0.1,"echo":{"template_code":"JUNIE_DEBUT","delay_battles":2,"chance":1.0}}`
- **B. Shut it down. Not this world, not yet.** `{"family_bond":-0.5,"resilience":0.1,"npc":{"junie":-2}}`
- **C. 🔒 [Respected Veteran badge] Get him into Quill's writing circle instead.** `{"family_bond":0.3,"npc":{"junie":1},"cash":-100}`
- *Echo → JUNIE_DEBUT (§7 E1).*

**2. MOMS_FRONT_ROW — "She Bought Her Own Ticket"**
`family` / rare / Moms · trigger: `{"has_next_battle":true,"min_public_knowledge":25}`
> Moms has never watched you battle. Not the tapes, not the clips. Tonight she texts you a screenshot: one ticket, {league}, next card. "I want to hear what you say when you think I'm not listening."
- **A. Get her moved to the front row.** `{"family_bond":0.6,"resilience":-0.2,"next_battle":{"crowd_bonus":3},"echo":{"template_code":"MOMS_VERDICT","delay_battles":1,"chance":1.0}}`
- **B. [RED] Tell her this room isn't for her.** `{"family_bond":-0.6,"resilience":0.2}`
- *Echo → MOMS_VERDICT (§7 E2).*

**3. FEE_ON_THE_TABLE — "The Rubber Band"**
`family` / common / Reggie · trigger: `{"max_balance":600,"min_battles":2}`
> Papo paid you {fee} in a rubber band, win or lose — that was the deal, that's the culture. Reggie takes his 15 and hands you the rest at the kitchen table. Moms' rent is short this month. Studio time with Livewire is $200 and books up fast.
- **A. Rent first. Family eats.** `{"cash":-250,"family_bond":0.5,"npc":{"moms":1}}`
- **B. Book the studio — the craft pays everyone eventually.** `{"cash":-200,"stage_presence":0.2,"family_bond":-0.3}`
- **C. Split it and tell nobody the math.** `{"cash":-300,"family_bond":0.2,"resilience":-0.1}`

**4. JUNIE_FIGHTS_FOR_YOU — "He Heard About the Body"**
`family` / uncommon / Tone · trigger: `{"result":"3-0","outcome":"loss"}`
> Tone calls before the recaps drop. Junie got into it at school — some kid kept playing the clip of you taking that 3-0 from {opponent}, running the choke chants. Junie swung first. He's suspended, not sorry.
- **A. Sit him down. Losses are tuition.** `{"family_bond":0.6,"resilience":0.2,"npc":{"junie":1}}`
- **B. [RED] Tell him you'd have swung too.** `{"family_bond":0.2,"reputation":0.1,"npc":{"junie":2},"echo":{"template_code":"BLOCK_TALK","delay_battles":3,"chance":0.4}}`
- *Echo → BLOCK_TALK (§7 E3).*

---

### THE BAG (money)

**5. LIGHT_ENVELOPE — "$150 Light"**
`money` / common / Papo Reese · trigger: `{"min_battles":2,"max_balance":1500}`
> The Cellar was packed — you saw the room. But when Papo hands over the envelope it's $150 light of the {fee} you agreed. "Door was soft, champ. I got you next card." He says it warm. He always says it warm.
- **A. [RED] Air it out publicly — name the number.** `{"reputation":0.2,"public_knowledge":8,"npc":{"papo":-3},"echo":{"template_code":"PAPO_FREEZE","delay_battles":2,"chance":0.6}}`
- **B. Eat it quiet. The relationship is the money.** `{"cash":-150,"npc":{"papo":2},"echo":{"template_code":"PAPO_MAKES_GOOD","delay_battles":3,"chance":0.7}}`
- **C. Send Reggie to talk numbers.** `{"cash":-75,"npc":{"reggie":1,"papo":-1}}`
- *Echoes → PAPO_FREEZE (§7 E4), PAPO_MAKES_GOOD (§7 E5).*

**6. RAISE_THE_PRICE — "Two Phones, One Number"**
`money` / uncommon / Reggie · trigger: `{"win_streak":2}`
> Reggie's on both phones. "Your last two showings moved your stock — {streak} straight, and the {peak_moment} clip is still circulating. Wins don't change the check, you know that. But draw changes the NEXT negotiation. I want to raise your asking price."
- **A. Raise it. Let them argue.** `{"npc":{"reggie":1},"league_trust":-1,"echo":{"template_code":"PRICE_STANDOFF","delay_battles":2,"chance":0.5}}`
- **B. Keep the price friendly — stack bookings instead.** `{"cash":150,"reputation":-0.1}`
- *Echo → PRICE_STANDOFF (§7 E6).*

**7. CASH_BEFORE_STAGE — "First-Time Promoter"**
`money` / uncommon / Reggie · trigger: `{"min_battles":4,"max_reputation":7}`
> A new promoter wants you for his first card in {city} — decent flat fee, {fee}-range. One problem: Tone heard the man's last venture ended with the headliner chasing him through a parking lot for half a check.
- **A. Demand cash before stage.** `{"reputation":0.1,"league_trust":-1,"npc":{"reggie":1}}`
- **B. [RED] Take it on trust — the fee's too good.** `{"echo":{"template_code":"STIFFED","delay_battles":1,"chance":0.4},"cash":400}`
- **C. Pass. Your name doesn't do maybes.** `{"reputation":0.1,"cash":0}`
- *Echo → STIFFED (§7 E7).*

**8. SHIFT_MANAGER — "The Friday Problem"**
`money` / common / Ms. Dulaney · trigger: `{"has_next_battle":true,"max_balance":900}`
> Ms. Dulaney posted the schedule. You're on Friday close — same night as the {league} card you're booked on. She's tired of the "appointments." This time it's the job or the stage, pick in writing.
- **A. Call out. Take the write-up.** `{"cash":-120,"resilience":0.1}`
- **B. Work the shift, prep in the break room.** `{"prep_penalty":0.2,"cash":120,"resilience":-0.1}`
- **C. [GOLD] Quit. All-in on the pen.** `{"cash":-400,"resilience":0.3,"reputation":0.2,"echo":{"template_code":"ALL_IN_CHECKPOINT","delay_battles":4,"chance":1.0}}`
- *Echo → ALL_IN_CHECKPOINT (§7 E8).*

**9. BACKEND_POINTS — "Points or the Guarantee"**
`money` / epic / league owner · trigger: `{"min_public_knowledge":55,"min_reputation":7}`
> {npc.league_owner} slides the paper across the desk. Biggest card of your career — and for the first time, a choice in the structure: your usual flat guarantee, or a smaller guarantee plus points on the app buys. "Winner doesn't get a dime more either way," he says. "But if the card sells, the points eat."
- **A. [GOLD] Take the points.** `{"cash":-300,"echo":{"template_code":"BACKEND_SETTLES","delay_battles":2,"chance":1.0}}`
- **B. Take the guarantee. Certainty is a skill.** `{"cash":500,"npc":{"reggie":1}}`
- *Echo → BACKEND_SETTLES (§7 E9).*

---

### THE BLOCK (streets)

**10. TONE_AT_THE_DOOR — "It Traveled"**
`streets` / uncommon / Tone · trigger: `{"outcome":"loss","min_battles":3}`
> Tone pulls up mid-prep-week, doesn't sit down. Somebody from the old block took your loss to {opponent} personal — talking like your L is the neighborhood's L, saying it loud in the wrong rooms. "I'm just saying what I heard. You want to come outside or you want to stay in the book?"
- **A. Step outside. Handle it face to face.** `{"reputation":0.2,"prep_penalty":0.1,"npc":{"tone":2},"echo":{"template_code":"BLOCK_TALK","delay_battles":2,"chance":0.3}}`
- **B. Stay in the book. The rematch is the answer.** `{"prep_bonus_writing":0.2,"npc":{"tone":-1},"family_bond":-0.1}`
- *Echo → BLOCK_TALK (§7 E3).*

**11. HOMETOWN_HEADLINE — "Do It for the City"**
`streets` / uncommon / Papo Reese · trigger: `{"min_reputation":6,"min_battles":5}`
> Papo wants you to headline The Cellar again — back home, home crowd, the room that raised you. The flat fee is small and you both know your number is bigger now. "Ain't about the bag this one time," he says. "They watched you come up."
- **A. Take it. Home crowd, home energy.** `{"cash":150,"reputation":0.3,"next_battle":{"crowd_bonus":5},"npc":{"papo":2}}`
- **B. [RED] Tell him your price went up.** `{"npc":{"papo":-2},"echo":{"template_code":"HOLLYWOOD_TALK","delay_battles":2,"chance":0.5}}`
- *Echo → HOLLYWOOD_TALK (§7 E10).*

**12. PARKING_LOT — "After the Card"**
`streets` / rare / Tone · trigger: `{"outcome":"win","min_public_knowledge":40}`
> The win over {opponent} was clean — {result}, no debate. The parking lot after wasn't. Two guys you didn't know tried you at the car; Tone's people were closer than they looked. Nothing happened. Everything almost did.
- **A. Keep it quiet. Move smarter.** `{"resilience":0.2,"npc":{"tone":1}}`
- **B. Post about it.** `{"public_knowledge":10,"reputation":-0.1}`
- **C. [RED] Roll with Tone's people from now on.** `{"npc":{"tone":2},"reputation":0.1,"echo":{"template_code":"ENTOURAGE_QUESTION","delay_battles":3,"chance":0.5}}`
- *Echo → ENTOURAGE_QUESTION (§7 E11).*

**13. OLD_PAPERWORK — "Receipts"**
`streets` / rare / Reggie · trigger: `{"min_public_knowledge":45,"min_battles":8}`
> Reggie calls with the flat voice he saves for real problems. Paperwork from an old situation — the one you don't talk about — is circulating in a group chat with two battlers in it. In this culture, receipts become rounds. If {next_opponent} has it, you'll hear it on stage.
- **A. Address it on camera first, on your terms.** `{"public_knowledge":8,"reputation":0.1,"resilience":-0.1}`
- **B. Lawyer letter. Say nothing.** `{"cash":-500,"echo":{"template_code":"RECEIPTS_ROUND","delay_battles":1,"chance":0.3}}`
- **C. [RED] Let them talk.** `{"resilience":0.1,"echo":{"template_code":"RECEIPTS_ROUND","delay_battles":1,"chance":0.7}}`
- *Echo → RECEIPTS_ROUND (§7 E12).*

---

### THE OFFICE (industry)

**14. FACEOFF_CLAUSE — "The Circus Is in the Contract"**
`industry` / common / league owner · trigger: `{"has_next_battle":true,"min_battles":4}`
> The booking for {next_opponent} came with a clause: filmed faceoff, two weeks out, posted on the league channel. You hate the circus. The circus sells the battle. {npc.league_owner} already sent the call time.
- **A. Show out — win the faceoff before the battle.** `{"public_knowledge":10,"resilience":-0.1,"echo":{"template_code":"HYPE_DIVIDEND","delay_battles":1,"chance":0.6}}`
- **B. Sit there stone-faced. Do your talking on stage.** `{"reputation":0.1,"public_knowledge":-4}`
- **C. [RED] Skip it. Eat the fine.** `{"cash":-200,"league_trust":-2,"prep_bonus_all":0.1}`
- *Echo → HYPE_DIVIDEND (§7 E13).*

**15. POACH_DM — "The Other League Is Calling"**
`industry` / rare / Reggie · trigger: `{"min_reputation":6,"min_public_knowledge":35}`
> A rival league slid into Reggie's DMs with numbers for a two-battle run — while you're still inked with {league}. Poaching is a lawyers' game and everybody's watching who flinches. Reggie: "We can eat off this either way. Pick the way."
- **A. Leak the offer — let the market bid.** `{"reputation":0.2,"league_trust":-2,"public_knowledge":8}`
- **B. Stay loyal, quietly. Collect the favor.** `{"league_trust":2,"echo":{"template_code":"LOYALTY_SLOT","delay_battles":2,"chance":0.7}}`
- **C. [RED] Take the meeting in secret.** `{"echo":{"template_code":"MEETING_LEAKS","delay_battles":2,"chance":0.5},"cash":0}`
- *Echoes → LOYALTY_SLOT (§7 E14), MEETING_LEAKS (§7 E15).*

**16. BUMPED_FROM_THE_CARD — "The Returning Legend"**
`industry` / uncommon / league owner · trigger: `{"has_next_battle":true,"min_battles":6}`
> Card change. A legend picked this event for his comeback and the main card got shuffled — you've been moved to the pre-show. Same flat fee, smaller room, earlier slot. {npc.league_owner}: "Business, not personal. Handle it right and I remember."
- **A. Handle it professional. Smoke the pre-show.** `{"league_trust":2,"reputation":0.1,"echo":{"template_code":"REMEMBERED","delay_battles":3,"chance":0.6}}`
- **B. Air it out publicly.** `{"public_knowledge":10,"league_trust":-2,"reputation":0.1}`
- **C. [RED] Pull off the card.** `{"cash":-300,"league_trust":-3,"resilience":0.2}`
- *Echo → REMEMBERED (§7 E16).*

**17. SHELF_FOOTAGE — "Where's the Tape?"**
`industry` / uncommon / DJ Verdict · trigger: `{"outcome":"win","min_battles":5}`
> Your {result} over {opponent} was months ago and the footage is still on the shelf. DJ Verdict's latest column asks the question out loud: "Best win of his run and the league's sitting on it. Buzz has a shelf life." Your clip section has gone quiet.
- **A. Publicly demand the drop.** `{"public_knowledge":8,"league_trust":-1}`
- **B. [RED] Let the crowd-cam footage 'find its way' online.** `{"public_knowledge":12,"reputation":-0.1,"league_trust":-2}`
- **C. Wait it out. Leverage compounds.** `{"resilience":0.1,"echo":{"template_code":"DELAYED_DROP","delay_battles":2,"chance":0.8}}`
- *Echo → DELAYED_DROP (§7 E17).*

**18. RANKED_LAST — "The Scouting Report"**
`industry` / uncommon / DJ Verdict · trigger: `{"max_battles":8,"max_reputation":5}`
> {league} announced its prospect class and the scouting report ranks you dead last. The write-up hands out nicknames — the QB1, the Dark Horse — and gives you two sentences and a shrug: "limited tape, unproven under bright lights."
- **A. Pin the ranking above your desk.** `{"prep_bonus_all":0.1,"resilience":0.2,"watcher":{"watch_code":"RANKED_LAST_RUN","per_battle":{"outcome":"win"},"window_battles":3,"fires_template":"SILENCE_THE_DOUBTERS","on_lapse":null}}`
- **B. Call the scout out on the timeline.** `{"public_knowledge":6,"reputation":-0.1,"npc":{"dj_verdict":-1},"watcher":{"watch_code":"RANKED_LAST_RUN","per_battle":{"outcome":"win"},"window_battles":3,"fires_template":"SILENCE_THE_DOUBTERS","on_lapse":null}}`
- *Both choices arm the `RANKED_LAST_RUN` watcher (§5.4) with `context.anchor_choice` recorded: win each of the next three battles and SILENCE_THE_DOUBTERS (§7 E18) fires, naming the choice you made here. Lose one and the watcher lapses silently — the doubters stay right, and the game never mentions it. That silence is also content.*

---

### THE VESSEL (health)

**19. VOICE_GONE — "Running Rounds Full-Out"**
`health` / common / mentor · trigger: `{"has_next_battle":true,"min_battles":4,"min_full_prep_streak":2}` *(hard rule 7: `has_next_battle` alone is one key from the banned `{"any":true}` — true nearly every battle, saved only by cooldowns. The `min_full_prep_streak` gate (§5.2) makes the fiction true before the card fires: this player has actually been living full-prep battle after battle. A voice doesn't break from having a booking; it breaks from the grind, and now the trigger proves the grind.)*
> You've been running rounds full-out every night and your voice is paying the bill — that scrape on the low notes isn't style. {npc.mentor} hears it on the phone in two words: "Shut up. Literally."
- **A. Rest protocol — tea, silence, marks only.** `{"resilience":0.2,"prep_penalty":0.1}`
- **B. [RED] Push through. The card is too big.** `{"next_battle":{"stumble_chance_delta":0.02},"prep_bonus_performance":0.1}`
- **C. See a vocal specialist.** `{"cash":-350,"resilience":0.1,"stage_presence":0.1}`

**20. THE_REPLAY — "You Keep Watching It"**
`health` / uncommon / mentor · trigger: `{"choked":true}`
> Three weeks since the choke against {opponent} and you still watch the clip before bed — the restart, the silence, the one camera flash. {npc.mentor} calls it what it is: "That's not studying film. That's picking a scab."
- **A. Talk to somebody. Actually.** `{"cash":-300,"resilience":0.4}`
- **B. Channel it — drill the round until it's armor.** `{"prep_bonus_performance":0.15,"resilience":-0.1}`
- **C. [RED] Act like it never happened.** `{"resilience":-0.3,"echo":{"template_code":"CHOKE_WHISPERS","delay_battles":2,"chance":0.5}}`
- *Echo → CHOKE_WHISPERS (§7 E19).*

**21. THE_TANK — "Homework"**
`health` / uncommon / mentor · trigger: `{"min_battles":10}`
> Five cards in a row and the notebook has started feeling like homework. Last session you wrote one scheme in two hours and hated it by midnight. {npc.mentor}: "Empty tank writes empty rounds. When did you last watch a battle for FUN?"
- **A. Take a card off. Let the tank fill.** `{"resilience":0.5,"public_knowledge":-5,"cash":-200}`
- **B. [RED] Keep booking. Momentum is oxygen.** `{"cash":300,"resilience":-0.3}`

---

### THE FEED (media)

**22. VERDICT_SCORED_IT_CLEAN — "0-3, No Debate"**
`media` / common / DJ Verdict · trigger: `{"result":"3-0","outcome":"loss"}` *(hard rule 3: the copy asserts a sweep, so the trigger must prove one — winner-first `"3-0"` + `outcome:"loss"` = you got scored clean. A 2-1 loss never sees this card; debatable losses have their own conversations.)*
> DJ Verdict's recap is up and he scored you clean — every round to {opponent}, "no debate, not even a dry-spot argument." Your mentions are a war between your fans crying robbery and his readers posting the round math. He ends the column with an open invite to come on the show.
- **A. Go on The Verdict. Face the math.** `{"public_knowledge":10,"reputation":0.2,"npc":{"dj_verdict":2}}`
- **B. Post the rebuttal thread.** `{"public_knowledge":5,"reputation":-0.1,"npc":{"dj_verdict":-1}}`
- **C. Silence. Let the next battle answer.** `{"resilience":0.2,"prep_bonus_all":0.05}`

**23. THE_CLIP — "Thirty Seconds Running"**
`media` / uncommon / Reggie · trigger: `{"outcome":"win","min_peak_score":8.0}`
> Thirty seconds of your third round vs {opponent} is running up numbers — the {peak_moment}, the delayed reaction, the whole front row out of their seats a beat late because they had to catch it first. Reggie: "The window is NOW. Press run or lab run, pick one."
- **A. Ride the wave — interviews, guest spots, the circuit.** `{"public_knowledge":15,"prep_penalty":0.1,"cash":200}`
- **B. Stay in the lab. Let the clip work alone.** `{"prep_bonus_all":0.1,"public_knowledge":5}`

**24. THE_WHISPER — "Who's Holding Your Pen?"**
`media` / legendary / Reggie · trigger: `{"win_streak":3,"min_public_knowledge":50}`
> It started with a burner account and it's growing legs: the claim that a known pen wrote your last two rounds. In this culture there is no worse word than ghostwriter — careers don't recover from it sticking. Reggie is already awake. "This is the one we don't sleep on."
- **A. [GOLD] Pull up on a live, unannounced, and go off the top until nobody can say it again.** `{"reputation":0.3,"public_knowledge":10,"resilience":-0.1}` *(🔒 shown-but-locked without Freestyle-capable badge — the CK3 pattern; locked players see what the badge would have bought.)*
- **B. Lawyer letter to the platform.** `{"cash":-600,"reputation":-0.2,"echo":{"template_code":"WHISPER_LINGERS","delay_battles":3,"chance":0.5}}`
- **C. [RED] Never dignify it.** `{"resilience":0.1,"echo":{"template_code":"WHISPER_LINGERS","delay_battles":3,"chance":0.7}}`
- *Echo → WHISPER_LINGERS (§7 E20). Choices B/C also open the `GHOSTWRITER_WHISPER` angle storyline (§8).*

**25. AWARD_SEASON — "Battle of the Year"**
`media` / epic / DJ Verdict · trigger: `{"year_end":true,"min_battles":8}` *(fires from the deterministic lane at battles 20/40/60… — see §5.2 `year_end`)*
> Year-end lists are out and your classic with {opponent} is on every Battle of the Year shortlist — and here's the thing about a BOTY: both names rise, even the one that took the L. DJ Verdict's ballot piece calls it "the one we'll still be arguing about in five years."
- **A. Campaign — do the retrospective interviews.** `{"public_knowledge":12,"reputation":0.1,"echo":{"template_code":"BOTY_NIGHT","delay_battles":2,"chance":0.5}}`
- **B. Stay humble. Let the battle speak.** `{"reputation":0.3,"echo":{"template_code":"BOTY_NIGHT","delay_battles":2,"chance":0.5}}`
- *Echo → BOTY_NIGHT (§7 E21): if the ballot lands your way, the ceremony beat — with a fee-floor raise for BOTH battlers. The culture pays participants of classics, not just winners.*

---

## 7. The echo library — every payoff, fully written

Rev 1 left the echoes as one-line italics. That was the whole stickiness engine shipping as a guess. **Every echo code referenced in §6 is specified here at full anchor quality** — same seven hard rules, same soft marks, real copy, real choices, real effects. These are the cards players screenshot; they do not get to be stubs.

### 7.0 Echo mechanics

- Echo templates are `life_event_templates` rows with `lane='echo'`, `trigger_type='echo'`, `trigger_condition={}`. They are **unreachable from the random draw** — only the `echo` effect, a watcher, or the deterministic lane can instantiate them. Rarity/cooldown/weight are moot (pacing-clean by construction); each fires at most once per anchor firing.
- **Variants**: some echoes must read differently depending on world-state at fire time or the anchor choice. The `variants` column holds `[{key, when, body, choices?}]`. The resolver walks the array; the first variant whose `when` matches (written in the §5.2 vocabulary, plus `anchor_choice`) wins. A variant may override `body` alone or `body` + the full choice set. The base row is the fallback and must always be playable.
- **Anchor context**: at schedule time, the resolver snapshots `{anchor.opponent, anchor.choice, anchor.choice_label, anchor.battle_number, anchor.fee}` into the scheduled row — echoes must read true even if the world moved on.
- **On-fire payloads**: echoes that move the world before the player answers (E7, E9, E12, E21) declare it in `on_fire_effects` — column, per-variant override, and canonical application order in §5.1.1. The choices are the response; the on-fire payload is the news.
- Every echo appends a beat to its storyline (§8) when it lands.

---

### KIN echoes

**E1. JUNIE_DEBUT — "First Walk to the Center"**
`family` / echo of JUNIE_WANTS_IN (A) / sender: Papo Reese · variants on `family_bond` at fire time
> *Base (family_bond ≥ 6):* Junie took his first battle at The Cellar last night — three rounds against a kid two years older, and he edged it 2-1 on the strength of a third round the room did not see coming. Papo sends you the crowd-cam clip with one line: "He walks like you. Talks like himself." DJ Verdict's blurb calls it "the bloodline showing early."
- **A. Front row next time, loud about it.** `{"family_bond":0.4,"npc":{"junie":2},"public_knowledge":3,"storyline":{"kind":"npc_arc","subject":"junie","delta":15,"note":"debut, backed loud"}}`
- **B. Stay in the back. Let the win be his alone.** `{"family_bond":0.2,"npc":{"junie":1},"resilience":0.1,"storyline":{"kind":"npc_arc","subject":"junie","delta":10,"note":"debut, gave him room"}}`
> *Variant LOW (`{"max_family_bond":5}`):* Junie took his first battle at The Cellar last night and it went how sixteen goes: a 3-0, frozen in the second round, the room merciful only because they knew whose brother he was. He hasn't texted you back. Papo: "He stayed for the whole card though. Watched every battle from the wall."
- **A. Pull up. Watch his tape with him, round by round.** `{"family_bond":0.5,"prep_penalty":0.1,"npc":{"junie":2},"storyline":{"kind":"npc_arc","subject":"junie","delta":15,"note":"debut loss, showed up"}}`
- **B. [RED] Tell him straight: he's not built for this.** `{"family_bond":-0.6,"npc":{"junie":-3},"resilience":0.1,"storyline":{"kind":"npc_arc","subject":"junie","delta":-20,"note":"debut loss, cut him down"}}`

**E2. MOMS_VERDICT — "One Text"**
`family` / echo of MOMS_FRONT_ROW (A), delay 1 / sender: Moms · variants on `choked` in the watched battle
> *Base (did not choke):* The morning after, one text from Moms. "Now I know why your walls were always covered in paper. Some of those people knew your name before I got to my seat. Dinner Sunday." You read it four times.
- **A. Go to dinner. Phone off.** `{"family_bond":0.5,"prep_penalty":0.05,"npc":{"moms":2}}`
- **B. Card week — rain check.** `{"family_bond":-0.2,"prep_bonus_all":0.05,"npc":{"moms":-1}}`
> *Variant CHOKED (`{"choked":true}`):* The morning after, one text from Moms. "You looked at me right before it happened. Don't ever do that again — look at THEM. Dinner Sunday anyway." Two sentences and an instruction. Both stick.
- **A. Go, and let her say it to your face.** `{"family_bond":0.5,"resilience":0.3,"npc":{"moms":2}}`
- **B. Duck it until after the rematch.** `{"family_bond":-0.3,"prep_bonus_all":0.1,"npc":{"moms":-1}}`

**E3. BLOCK_TALK — "Your Name, Traveling"**
`streets` / echo of JUNIE_FIGHTS_FOR_YOU (B) or TONE_AT_THE_DOOR (A) / sender: Tone
> Tone calls from outside the corner store. Your name is moving through the block again with weight on it — half of it pride, half of it expectation, all of it loud since {anchor.battle_number} battles back when you handled the {anchor.choice_label} thing the way you did. "Store's got your clip playing on the register phone. Old heads asking when you battling close to home. I'm just saying what I heard."
- **A. Pull up in person — shake hands, no cameras.** `{"reputation":0.1,"npc":{"tone":1},"public_knowledge":3,"storyline":{"kind":"npc_arc","subject":"tone","delta":10,"note":"came home quiet"}}`
- **B. [RED] Stay away and let the myth grow untended.** `{"public_knowledge":6,"npc":{"tone":-1},"storyline":{"kind":"angle","subject":"MAN_OF_THE_PEOPLE","delta":10,"note":"the ghost question opens"}}`

---

### THE BAG echoes

**E4. PAPO_FREEZE — "Doors That Get Named"**
`money` / echo of LIGHT_ENVELOPE (A), delay 2, chance 0.6 / sender: Reggie
> The Cellar announced its next two cards this week. You're on neither. Reggie made the call and got Papo's answer secondhand, through the door guy: "Tell him doors that get named get locked." The room that raised you is booking around you — over $150 you were right about.
- **A. Apologize in private. Keep it business.** `{"npc":{"papo":1},"reputation":-0.1,"storyline":{"kind":"npc_arc","subject":"papo","delta":10,"note":"made peace over the envelope"}}` *(clears the Cellar freeze — the booking lane reopens)*
- **B. Book the road instead — {city} isn't the only city.** `{"cash":100,"league_trust":1,"npc":{"papo":-1},"storyline":{"kind":"npc_arc","subject":"papo","delta":-10,"note":"left the Cellar behind"}}` *(the freeze holds; hometown events stay closed until the papo arc warms)*

**E5. PAPO_MAKES_GOOD — "Plus Interest"**
`money` / echo of LIGHT_ENVELOPE (B), delay 3, chance 0.7 / sender: Papo Reese
> Papo finds you before the doors open, presses an envelope into your hand and doesn't let go until you look at him. The $150 — plus fifty on top. "You ate it quiet. I don't forget quiet." Then the real payment: he wants you headlining The Cellar's anniversary card, flat fee negotiated ABOVE your usual number. Win or lose, same money — that's still the deal, that's still the culture.
- **A. Take the headline.** `{"cash":200,"npc":{"papo":2},"next_battle":{"crowd_bonus":3},"storyline":{"kind":"npc_arc","subject":"papo","delta":15,"note":"anniversary headliner"}}`
- **B. Take the envelope, pass the slot — bank the favor for a bigger night.** `{"cash":200,"league_trust":1,"npc":{"papo":1}}`

**E6. PRICE_STANDOFF — "Who Priced Who Out?"**
`money` / echo of RAISE_THE_PRICE (A), delay 2, chance 0.5 / sender: DJ Verdict
> The matchup the fans wanted is officially dead — talks collapsed over your new asking price, and The Verdict runs the autopsy: "Somebody in this negotiation believes the stock chart. The other one believes the old number. One of them is wrong." Your mentions are doing the math in public.
- **A. Go on record with your number — let them judge the whole picture.** `{"public_knowledge":6,"reputation":-0.1,"league_trust":-1}`
- **B. Never discuss money in public. Ever.** `{"reputation":0.1,"resilience":0.1}`
- **C. 🔒 [Reggie ≥ +3] Reggie leaks the OTHER side's lowball instead.** `{"reputation":0.2,"public_knowledge":4,"npc":{"reggie":1}}`

**E7. STIFFED — "The Check That Never Cleared"**
`money` / echo of CASH_BEFORE_STAGE (B), delay 1, chance 0.4 / sender: Reggie · `on_fire_effects: {"cash":-400}` (§5.1.1 — applied at landing, survives expiry: the anchor's $400 evaporates whether or not you ever open the card)
> The check bounced. The first-time promoter's phone is off, his page is deleted, and the venue says he settled the room in cash and left before your round ended. You performed for free in {city}, exactly like Tone said the last headliner did. Reggie, quietly furious: "Every dollar he owes is a decision now."
- **A. Reggie handles it — paperwork, small-claims energy, slow and legal.** `{"cash":150,"npc":{"reggie":1}}`
- **B. [RED] Tone knows where the man does business.** `{"cash":400,"npc":{"tone":2},"reputation":-0.2,"storyline":{"kind":"angle","subject":"MOVES_LIKE_THE_BLOCK","delta":15,"note":"collected the hard way"}}`
- **C. Charge it to the game — and tell the story on a podcast so the next battler checks first.** `{"public_knowledge":6,"resilience":0.1,"reputation":0.1}`

**E8. ALL_IN_CHECKPOINT — "The Math Sit-Down"**
`money` / echo of SHIFT_MANAGER (C), delay 4, chance 1.0 / sender: Reggie · variants on `balance` at fire time
> *Base (`{"min_balance":800}`):* Four battles since you quit on Ms. Dulaney's clipboard. Reggie spreads the paper on the kitchen table: bookings up, {balance} in the wallet, and no Friday closes eating your prep weeks. "The bet is working. Bets that work get pressed." DJ Verdict's column even mentioned the leap — "quit his job, then battled like it."
- **A. Press it — buy real studio hours with Livewire.** `{"cash":-300,"stage_presence":0.2}`
- **B. Bank it. Runway is armor.** `{"resilience":0.2,"npc":{"reggie":1}}`
> *Variant THIN (`{"max_balance":799}`):* Four battles since you quit, and the table math is quieter: {balance} left, two bookings that paid short of hopes, and rent doing what rent does. Reggie doesn't dress it up. "The bet's not lost. But it's live. What are we doing?"
- **A. Pick up quiet part-time shifts. Nobody has to know.** `{"cash":250,"prep_penalty":0.1}`
- **B. [RED] Stay all-in. Ride the next card with everything.** `{"resilience":-0.1,"reputation":0.1,"storyline":{"kind":"angle","subject":"ALL_IN_STORY","delta":10,"note":"doubled down broke"}}`

**E9. BACKEND_SETTLES — "The Comma"**
`money` / echo of BACKEND_POINTS (A), delay 2, chance 1.0 / sender: league owner · variants on `public_knowledge` at fire time
> *Base (`{"min_public_knowledge":70}`):* Settlement day. {npc.league_owner} slides the statement across the same desk. The app buys came in, and your points on them put a comma in places your guarantees never had one. He taps the total: "Told you. The winner didn't make a dime more than the loser — the CARD made it, and you owned a piece of the card. Your buzz did this, not your record."
- *Base `on_fire_effects`: `{"cash":900}` (§5.1.1 — the settlement clears whether you've opened the card or not; each variant below REPLACES this payload with its own)*
> *Variant EVEN (`{"min_public_knowledge":55,"max_public_knowledge":69}`):* The buys came in fine, not fireworks — the points land about even with the guarantee you gave up. "Lesson wasn't free," the owner says, "but it wasn't expensive either." — *variant `on_fire_effects`: `{"cash":350}`*
> *Variant UNDER (`{"max_public_knowledge":54}`):* The buys came in soft. The points pay out under the guarantee you passed on, and the statement doesn't apologize. "The bet pays your buzz," the owner shrugs. "Buzz was light." — *variant `on_fire_effects`: `{"cash":150}`*
- **A. Publicize the number — proof that draw pays.** `{"public_knowledge":5,"league_trust":-1}` *(all variants)*
- **B. Keep the number private. Bank the lesson.** `{"resilience":0.1,"npc":{"reggie":1}}` *(all variants)*

---

### THE BLOCK echoes

**E10. HOLLYWOOD_TALK — "They Gave You a Name"**
`streets` / echo of HOMETOWN_HEADLINE (B), delay 2, chance 0.5 / sender: Tone
> The block has a new name for you and it isn't the one on the flyers. "Hollywood." Kids at the store say it half-joking. The old heads don't say it joking at all. And DJ Verdict, who hears everything, asks it in print: "Does he still battle like he's hungry, or does he battle like he ate?"
- **A. Run a free workshop at the rec — bars-craft for the young ones, no cameras allowed.** `{"cash":-150,"reputation":0.2,"npc":{"tone":1},"storyline":{"kind":"npc_arc","subject":"tone","delta":10,"note":"answered Hollywood with work"}}`
- **B. [RED] Own it. Hollywood pays better than home.** `{"public_knowledge":5,"npc":{"tone":-2},"family_bond":-0.1,"storyline":{"kind":"angle","subject":"HOLLYWOOD_ANGLE","delta":15,"note":"leaned into the name — opponents heard"}}`

**E11. ENTOURAGE_QUESTION — "The Door List"**
`industry` / echo of PARKING_LOT (C), delay 3, chance 0.5 / sender: league owner
> Security flagged your door list at the last card — five names deep, two of them known on sight for reasons that have nothing to do with rap. {npc.league_owner} closes his office door. "My insurance man asked me a question I couldn't answer. Who exactly travels with you, and why?"
- **A. Trim the list. Two names, that's it.** `{"league_trust":2,"npc":{"tone":-1}}`
- **B. [RED] My people are non-negotiable.** `{"league_trust":-2,"npc":{"tone":2},"reputation":0.1,"storyline":{"kind":"angle","subject":"MOVES_LIKE_THE_BLOCK","delta":10,"note":"chose the block over the office"}}`
- **C. Put Tone on payroll — security, official, taxed.** `{"cash":-200,"npc":{"tone":2},"league_trust":1,"storyline":{"kind":"npc_arc","subject":"tone","delta":15,"note":"made it official"}}`

**E12. RECEIPTS_ROUND — "The Exhibits"**
`streets` / echo of OLD_PAPERWORK (B: chance 0.3 / C: chance 0.7), delay 1 — fires in the pre-battle window / sender: Reggie · `on_fire_effects: {"next_battle":{"opponent_angle_bonus":3}}` (§5.1.1 — +3 angle points per §5.5: his per-segment peak chance rises the moment the folder leaks, before you choose how to stand in it)
> It's out. {next_opponent} posted a ten-second teaser — no words, just a manila folder tapped twice against the camera. The comments already know what's in it. Reggie: "He's walking on that stage with printouts. The recap won't lead with schemes, it'll lead with exhibits. We've got tonight to decide how you stand in it."
- **A. Rewrite round three tonight — meet it head-on before he gets there.** `{"prep_penalty":0.1,"next_battle":{"opponent_angle_bonus":-2}}`
- **B. Change nothing. Never let them see you adjust.** `{"resilience":0.1}` *(the full angle bonus stands — and the recap says you didn't flinch)*
- **C. 🔒 [Old Head Sut mentor] Sut knows who leaked the chat — find out what ELSE is in it.** `{"cash":-100,"next_battle":{"opponent_angle_bonus":-1,"crowd_bonus":2}}`

---

### THE OFFICE echoes

**E13. HYPE_DIVIDEND — "The Clip Ran Numbers"**
`industry` / echo of FACEOFF_CLAUSE (A), delay 1, chance 0.6 / sender: Reggie
> The faceoff clip did exactly what the league prayed for — your walk-off stare at {anchor.opponent} is the thumbnail, the numbers tripled the league channel's usual, and Reggie's phones haven't stopped. "The floor just moved. Not because you WON anything — because they WATCHED. Draw pays. When do we reprice?"
- **A. Reprice now, before the battle — strike while they're chasing.** `{"cash":200,"league_trust":-1}`
- **B. Let the league bring the number first. Chasers pay more.** `{"cash":100,"league_trust":1,"npc":{"reggie":1}}`

**E14. LOYALTY_SLOT — "For the Ones Who Stayed"**
`industry` / echo of POACH_DM (B), delay 2, chance 0.7 / sender: league owner
> {npc.league_owner} calls you in and slides a card mock-up across the desk: the next marquee event, your name second from the top, against a name you've wanted for a while. Flat fee negotiated up from your usual — same money win or lose, like always. "Word got back that somebody stayed loyal when the DMs came around. This card is for the ones who stayed." The press release has a quote slot with your name on it.
- **A. Take the slot, give the quote.** `{"cash":150,"league_trust":1,"public_knowledge":8,"next_battle":{"crowd_bonus":2}}`
- **B. Take the slot, skip the quote — loyalty isn't content.** `{"league_trust":1,"reputation":0.1,"resilience":0.1}`

**E15. MEETING_LEAKS — "The Screenshot"**
`industry` / echo of POACH_DM (C), delay 2, chance 0.5 / sender: Reggie
> Somebody in that secret meeting had a camera roll. The screenshot — you, the rival league's table, a folder — is everywhere by noon, and {npc.league_owner}'s number is buzzing on Reggie's other phone. The Verdict is already drafting the correspondence-war piece. Reggie: "No good options, only priced ones. Pick."
- **A. Own it publicly — "I listen to every number. That's the job."** `{"reputation":0.1,"league_trust":-2,"public_knowledge":8}`
- **B. Blame the rival league's leak and burn THAT bridge to save this one.** `{"league_trust":1,"reputation":-0.2}`
- **C. [RED] Say nothing. Let both leagues sweat what you're worth.** `{"league_trust":-1,"public_knowledge":5,"resilience":0.1,"storyline":{"kind":"angle","subject":"FREE_AGENT_ENERGY","delta":15,"note":"let the leak breathe"}}`

**E16. REMEMBERED — "He Kept His Word"**
`industry` / echo of BUMPED_FROM_THE_CARD (A), delay 3, chance 0.6 / sender: league owner
> The announcement drops at noon: next main card, your name against a NAME — and the press release closes with the owner's line about "professionals who smoke pre-shows without complaint." He calls after. "Told you I remember. This is what remembering looks like."
- **A. Ask for the faceoff too — build the moment properly.** `{"public_knowledge":6,"league_trust":1}`
- **B. Accept quiet. Let the booking speak.** `{"league_trust":2,"reputation":0.1}`

**E17. DELAYED_DROP — "Stacked on the Big Weekend"**
`industry` / echo of SHELF_FOOTAGE (C), delay 2, chance 0.8 / sender: DJ Verdict
> The tape finally drops — and the league stacked it on their biggest card weekend, prime slot, full edit, your {anchor.opponent} win as the appetizer for the whole event. First-day numbers triple what a rushed midweek release would have pulled. The Verdict: "Patience is a position. He held it."
- **A. Run the victory-lap press while it's hot.** `{"public_knowledge":10,"prep_penalty":0.05,"cash":150}`
- **B. Repost once and go dark. Mystique compounds too.** `{"public_knowledge":6,"resilience":0.1}`

**E18. SILENCE_THE_DOUBTERS — "The Re-Rank"**
`industry` / watcher payoff of RANKED_LAST (via `RANKED_LAST_RUN`, §5.4) / sender: DJ Verdict · variants on `anchor_choice`
> *Base (`anchor_choice = "a"` — you pinned it):* Three battles, three wins, and the re-rank article is up. The scout ate every word: "We had him dead last. He went and made the list look like a dare." The kicker: somebody told The Verdict you kept the original ranking pinned above your desk the whole run — and the article closes on that image.
- **A. Post the old ranking next to the new one. No caption.** `{"public_knowledge":8,"reputation":0.1}`
- **B. Say nothing. Legends don't scrapbook.** `{"reputation":0.2,"resilience":0.1}`
- **C. 🔒 [DJ Verdict ≥ +2] Go on The Verdict for the told-you-so episode.** `{"public_knowledge":12,"npc":{"dj_verdict":1}}`
> *Variant CALLED_OUT (`anchor_choice = "b"`):* Three battles, three wins, and the scout himself writes the mea culpa — salty, thorough, and honest: "He called me out publicly when I ranked him last. I said the tape would decide. The tape decided." Same three choices; the culture knows you made him type it.

---

### THE VESSEL echoes

**E19. CHOKE_WHISPERS — "They Heard You Fold"**
`health` / echo of THE_REPLAY (C), delay 2, chance 0.5 / sender: mentor
> {next_opponent}'s camp is doing press, and there's a theme: lights, pressure, and people who fold under both. Nobody says your name. Everybody means your name. The faceoff moderator has the clip of the {anchor.opponent} choke queued — you can feel the question coming from a week away. {npc.mentor}: "You buried it instead of burying it. Now it's got a shovel."
- **A. Address the choke by name, once, on your terms — then never again.** `{"resilience":0.2,"public_knowledge":4}`
- **B. [RED] If the moderator plays it, walk out of the faceoff.** `{"public_knowledge":8,"reputation":-0.2,"next_battle":{"stumble_chance_delta":0.01}}`
- **C. Let {npc.mentor} do the pre-battle interview instead of you.** `{"npc":{"mentor":1},"resilience":0.1,"public_knowledge":-3}`

---

### THE FEED echoes

**E20. WHISPER_LINGERS — "The Angle Exists Now"**
`media` / echo of THE_WHISPER (B: chance 0.5 / C: chance 0.7), delay 3 / sender: Reggie
> The faceoff for {next_opponent} airs, and there it is — he doesn't accuse you, he just slides it in sideways: a pause, a smile, "however many pens it took." The room laughs the wrong kind of laugh. The ghostwriter angle is in the world now, permanent, a card any opponent can play. Reggie: "You can't delete it. You can only shrink it."
- **A. Put a camera in the lab — your process, on tape, start to finish.** *(The tape shows the work — the grind, the crossed-out pages, the hours. No bars audible; the game describes, never quotes.)* `{"public_knowledge":6,"reputation":0.1}`
- **B. [RED] Let the work answer on stage — but the angle rides into the battle with you.** `{"next_battle":{"opponent_angle_bonus":2},"resilience":0.1}`
- **C. 🔒 [Freestyle-capable badge] Off-the-top run on the league channel, unannounced, uncut.** `{"reputation":0.3,"public_knowledge":8,"storyline":{"kind":"angle","subject":"GHOSTWRITER_WHISPER","delta":-25,"note":"answered off the top"}}`

**E21. BOTY_NIGHT — "Both Names Rise"**
`media` / echo of AWARD_SEASON (A or B), delay 2, chance 0.5 / sender: DJ Verdict
> The ballots are counted and your classic with {anchor.opponent} takes Battle of the Year. The ceremony clip is you and the one who shared that stage, side by side, neither of you needing to say who won it — the culture already argued that to death and bought tickets to the argument. The real prize lands Monday: both camps' booking floors move UP. Not the winner's. Both. Classics pay their participants.
- *`on_fire_effects`: `{"cash":250,"reputation":0.2,"public_knowledge":8,"fee_floor":{"amount":0.05,"applies_to":"both"}}` (§5.1.1) — `applies_to:"both"` raises {anchor.opponent}'s `fee_floor_bonus` (§5.5) the exact same day. The flat-fee law in one image: the L-taker's check grew too.*
- **A. Share the moment — post the two-shot from the ceremony.** `{"npc":{"dj_verdict":1},"public_knowledge":4,"storyline":{"kind":"rivalry","subject":"{anchor.opponent}","delta":10,"note":"BOTY respect beat"}}`
- **B. Thank the culture, then call for the rematch on stage.** `{"reputation":0.1,"storyline":{"kind":"rivalry","subject":"{anchor.opponent}","delta":25,"note":"called the run-back at the podium"}}`

---

## 8. Storylines & rivalry heat — the wrestling-booker layer

Soft mark 5 promised events "feed or spawn a storyline." Rev 1 never built the thing they feed. This is it: a real entity with heat, decay, escalation beats, and a payoff battle — echoes are 1–4-battle ripples; storylines are the multi-arc spine they ripple INTO.

### 8.1 Schema

```sql
create table storylines (
  id               uuid primary key default gen_random_uuid(),
  battler_id       uuid not null references battlers(id) on delete cascade,
  kind             text not null check (kind in ('rivalry','npc_arc','angle')),
  subject_type     text not null check (subject_type in ('battler','npc','claim')),
  subject_key      text not null,   -- opponent battler_id · npc key · angle code ('GHOSTWRITER_WHISPER')
  title            text not null,   -- "You vs Scheme Architect" · "Junie's Road" · "The Ghostwriter Question"
  heat             int not null default 0 check (heat between 0 and 100),
  stage            text not null default 'simmering'
    check (stage in ('simmering','personal','certified','payoff_set','settled','cold')),
  beats            jsonb not null default '[]',
  -- append-only: [{"battle_number":14,"source":"LIGHT_ENVELOPE","delta":15,"note":"aired the envelope"}]
  payoff_battle_id uuid references battles(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (battler_id, kind, subject_key)
);
```

### 8.2 Heat mechanics

**Sources** (every one appends a beat — the arc is always auditable):
- The `storyline` effect key (§5.1) from event/echo choices: ±5..25.
- Rematch happens (same opponent, any result): +15, automatic.
- A news article (`newsGenerator.ts`) that names both parties of a rivalry: +10.
- A faceoff event involving the rivalry's subject: +10.

**Decay**: −4 heat per completed battle with no new beat. At 0 → stage `cold` (row kept forever; history is the product). Decay runs in `decayStorylines()` (§3 order of operations).

**Stages by heat**: 1–34 `simmering` → 35–69 `personal` → 70+ `certified`. Stage changes are surfaced on the dashboard (soft mark 3) and available to `newsGenerator.ts` as prompt context — the blogs write about what's heating.

**Escalation beats** (deterministic lane, one per stage transition, kind `rivalry` only): on reaching `personal`, a short faceoff-adjacent event fires (the subject says your name in an interview); on reaching `certified`, the league owner event fires ("The people are asking. What's your number for it?").

**The payoff battle**: when a `rivalry` hits `certified`, `generate-battle-offers` MUST produce the payoff offer within 3 battles: a marquee card against the subject, flat fee negotiated UP for **both** names (the law, again: heat sells tickets — the winner still does not earn a dime more), `next_battle.crowd_bonus` for both, recap article guaranteed, stage → `payoff_set` with `payoff_battle_id` linked. After it simulates: stage `settled`, heat resets to 25 — rivalries never fully die; one hot beat can jump a settled rivalry straight back to `personal`.

**NPC arcs** (`kind='npc_arc'`): heat = engagement, not conflict. At 70 the arc fires its milestone echo on the deterministic lane — Junie's arc matures toward his own career chain; Papo's arc at 70 unlocks the Cellar-partnership event; Tone's arc feeds the streets pool. NPC arcs don't book payoff battles; they book payoff *events*.

**Angles** (`kind='angle'`): a named claim living in the world (`GHOSTWRITER_WHISPER`, `HOLLYWOOD_ANGLE`, `MOVES_LIKE_THE_BLOCK`, `FREE_AGENT_ENERGY`, `ALL_IN_STORY`, `MAN_OF_THE_PEOPLE`). While an angle is above 35, AI opponents in the faceoff/recap layer may reference it, and `next_battle.opponent_angle_bonus` templates may key off it. Angles decay like everything else — stage dominance and counter-choices (E20-C) push them down. This is how "the angle now exists in the world permanently" becomes a mechanic instead of a sentence.

---

## 9. Presentation layer — the screens, named

A dev could previously build the database perfectly and still have to invent every pixel. No longer. This section is buildable as written. All classes are the house system: `bg-zinc-950` page, `bg-zinc-900` card, `border-zinc-800`, `rounded-[0.625rem]`, transitions 0.2s, headers `font-black uppercase tracking-tighter`. No purple anywhere.

### 9.1 Component inventory

```
components/events/
├── EventCard.tsx          — the scene card; one component, all surfaces render it
├── EventScene.tsx         — composed header: background + sender portrait + scrim
├── EventChoiceButton.tsx  — one choice row; owns GOLD / RED / locked renderings
├── EventInterstitial.tsx  — post-battle full-bleed wrapper around EventCard
├── EventInboxCard.tsx     — dashboard pending surface (collapsed EventCard + expiry line)
├── EventHistoryList.tsx   — resolved/expired archive, grouped by career year
└── EventBadge.tsx         — nav notification dot (orange) with pending count
```

### 9.2 API routes

- **`GET /api/events/pending`** — user client (RLS-scoped). Returns the single pending event (or null): rendered body from `details_json.rendered_body`, sender + portrait asset keys resolved via the art registry, choices with flags/locks, `source_battle_id`, and `battles_until_expiry`.
- **`POST /api/events/[id]/resolve`** — body `{"choice":"a"|"b"|"c"}`. Service role internally (writes `battlers`, `npc_relationships`, `storylines`, schedules echoes/watchers) after verifying the authed user owns the battler. Server-side validation: event exists · `status='pending'` · belongs to this battler · the choice exists · **gate requirements re-checked server-side — a locked choice POSTed by a modified client returns 403.** Response: `{applied_effects, visible_deltas}` — the delta list drives the aftermath toasts (§9.5).
- **`GET /api/events/history?cursor=`** — user client. Resolved + expired instances, newest first, paginated, each with the choice taken and its delta summary.

### 9.3 Where events surface — the priority ladder

1. **Post-battle interstitial** (the FM/CK3 moment): if the pending event's `source_battle_id` equals the battle just viewed, `app/battle/[id]/page.tsx` renders `EventInterstitial` AFTER the results and PostBattleSummary — a full-bleed `bg-zinc-950` takeover framed "THAT NIGHT…" (or "THE MORNING AFTER…" for media/industry senders). It is skippable — a ghost-style "READ LATER" button top-right — and skipping simply leaves the event pending in the inbox. Battle results are never hostage to the event.
2. **Dashboard inbox**: whenever a pending event exists, `DashboardClient.tsx` renders `EventInboxCard` pinned ABOVE the Recent Battles section. Collapsed form (§10 mobile uses the same): sender portrait 64px, sender name, event title, category rail, and the expiry line. Tap/click → expands in place to the full `EventCard`.
3. **Nav badge**: `EventBadge` renders an `bg-orange-500` dot + count on the dashboard nav item while anything is pending.

Never a modal ambush over unrelated pages. Events wait where the player looks; the expiry clock (§3) guarantees they never wait forever.

### 9.4 EventCard anatomy — top to bottom

1. **Category rail**: `border-l-4` in the category accent (or orange-only until the §1 sign-off) running the card's full height. Top row: category chip left (`text-xs uppercase tracking-wide` + 16px icon, accent-tinted `bg-{accent}/20`), rarity chip right (`common/uncommon` none · `rare` zinc outline · `epic` `border-amber-400 text-amber-400` outline · `legendary` `bg-amber-400 text-zinc-950` filled).
2. **Scene** (`EventScene`): a 21:9 strip, `h-40` desktop, background from the art registry with `image-rendering: pixelated`, positioned by the asset's `focal` value. Sender portrait 96px, bottom-left, overlapping the card body edge by 16px (the CK3 composition). A `bg-gradient-to-t from-zinc-950/90` scrim across the bottom third keeps the next zone legible.
3. **Sender row**: name `font-black uppercase tracking-tighter text-zinc-100`, role line beneath (`text-xs uppercase tracking-wide text-zinc-500` — "YOUR MANAGER · TAKES 15%"). Right-aligned: relationship pips — ten 6px squares mapping −5..+5, filled in the category accent for positive, `red-500` for negative, `zinc-700` empty. Pips tap → NPC memory sheet (their last 3 remembered events).
4. **Title**: `text-2xl font-black uppercase tracking-tighter text-zinc-100`.
5. **Body**: the rendered copy. `text-sm text-zinc-300 leading-relaxed`, max-width ~65ch. Tokens are pre-resolved server-side — the client never sees `{opponent}`.
6. **Choice stack**: ALWAYS one column, `space-y-2` (never side-by-side, any viewport — a single column preserves reading order and gives no option visual advantage). Each `EventChoiceButton`:
   - Base: `w-full text-left bg-zinc-900 border border-zinc-800 rounded-[0.625rem] p-4 hover:border-orange-500 transition` (hover border in category accent when trims are enabled). Label `text-sm font-bold uppercase tracking-wider text-zinc-100`. Below it an optional consequence hint `text-xs text-zinc-500 uppercase tracking-wide` naming CURRENCIES, never numbers — "COSTS CASH · FAMILY REMEMBERS". Mystery is allowed; lying is not.
   - **[GOLD]**: `border-amber-400/60`, chip "RARE OPPORTUNITY" (`bg-amber-500/20 text-amber-400 text-xs uppercase`), hover glow `shadow-amber-500/20`. At most one per event.
   - **[RED]**: `border-red-500/40`, chip "RISK" (`bg-red-500/20 text-red-500`), hover glow red. At most one per event.
   - **Locked** (CK3 `show_as_unavailable` — the whole point is being SEEN): fully rendered at `opacity-60`, lock icon (Lucide `lock`, 16px) before the label, requirement line in place of the hint — "REQUIRES FREESTYLE GENIUS" / "REQUIRES REGGIE +3" (`text-xs text-zinc-500`). Click → 0.2s shake animation + the requirement pulses. Never hidden, never clickable-through; §9.2 re-validates server-side regardless.
7. **Footer**: expiry line, `text-xs uppercase tracking-wide text-zinc-500`: "UNANSWERED AFTER {n} MORE BATTLES → '{default choice label}'". The world's patience is finite and the card says so.

### 9.5 States

| Status | Where | Rendering |
|---|---|---|
| `pending` | Interstitial / inbox | Full interactive card (§9.4). |
| `scheduled` | Nowhere | Internal only (echo lane). Never rendered. |
| `resolved` | History | Compressed row: category rail, 32px sender portrait, title, chosen choice label in `text-orange-500`, battle number. Expand → full body + a "WHAT IT CHANGED" delta list from the stored resolution. |
| `expired` | History | Same row + chip `EXPIRED — {DEFAULT} APPLIED` (`bg-zinc-800 text-zinc-400`), body at `opacity-60`. Letting the world decide for you should look like neglect. |

**History surface**: `EventHistoryList` on a dashboard tab (or `/events/history`), rows grouped under career-year headers ("YEAR 2 — BATTLES 21–40"). This is the autobiography; it must read well at battle 200.

**Aftermath visibility** (soft mark 3): on resolve, `visible_deltas` renders a toast stack bottom-right — "−$250 · RENT PAID", "FAMILY BOND ▲", "PAPO WILL REMEMBER THIS" — then the dashboard re-fetches so balance/attributes/storyline chips visibly move.

---

## 10. Mobile — 375px is a first-class citizen

Baseline **375×812** (test at 360×800 too). Everything in §9 is written mobile-first; this section is the deltas and the hard reqs. Playtest law applies: **the §11 UI milestone is not "done" until the full event flow — interstitial, inbox, resolve, history — has been driven in Playwright at 375×812.**

- **Scene crop**: the 21:9 `h-40` strip becomes `h-32` at `<md`. The background is positioned by the registry's `focal` field (§4.1) — per-asset focal points, so The Cellar crops to the stage light and the kitchen crops to the table, never a dumb center-crop. Sender portrait scales 96→72px, keeps the bottom-left overlap. Scrim strengthens to `from-zinc-950/95` (small screens = tighter text-over-art tolerances).
- **Type scale**: title `text-xl` (from `text-2xl`); body stays `text-sm` — never below 14px; line-length cap does the work.
- **Touch targets**: every `EventChoiceButton` is `min-h-[56px]` (house floor, above the 44px WCAG minimum) with `p-4`; gaps `space-y-2` (8px). Locked choices keep full height; requirement text wraps, never truncates — a player must always be able to read WHY it's locked.
- **Stacking**: choices are already a single column everywhere (§9.4), so nothing reflows — 3 choices + a locked one = four full-width rows, in authored order. **The default choice gets no placement advantage and is never pre-selected**; the footer labels it, placement doesn't.
- **Interstitial**: full-screen route-level takeover. Content scrolls naturally; the choice stack sits at the END of the scroll, in-flow — NOT sticky-pinned over the body. Reading before choosing is the design; a pinned button row invites blind taps. Bottom padding `pb-[env(safe-area-inset-bottom)]`; "READ LATER" stays fixed top-right (44px target).
- **No hover-dependent information**: consequence hints, flag chips, and lock requirements are always visible — hover glows are enhancement only. Relationship pips get a tap affordance (they open the NPC memory sheet as a bottom sheet on mobile).
- **Inbox card on mobile**: collapsed form only — 64px portrait row + title + expiry line, no scene strip (keeps the dashboard light on a phone). Expanding pushes content, never overlays it.
- **History**: rows `min-h-[44px]`, pagination control in thumb reach (bottom), year headers sticky.

---

## 11. Rollout order

1. **Wire the pacing gate** — make `lib/game/lifeEvents.ts` call `can_trigger_event()`, add the weighted draw, expiry, and `EVENT_*` constants to `config.ts`. (Kills the ROCK BOTTOM stack with zero new content.)
2. **Schema migration** — category remap, `choice_c`, `default_choice`, `sender`, `lane`, `variants`, `art`, echo columns, `source_battle_id`, `event_art_registry` (+`focal`), `npc_relationships` (§5.3), `event_watchers` (§5.4), `storylines` (§8.1).
3. **Seed the cast + 25 anchors + 21 echoes** (§6–§7), retiring all v1 `{"any": true}` templates. Every insert carries the §2 checklist comment block.
4. **Interpolation + echo lane + watchers + storyline decay** in the trigger path (§3 order of operations); `cash`, `next_battle`, `npc`, `storyline`, `watcher` effect wiring.
5. **Presentation layer** — §9 components + routes, then the §10 mobile pass. Definition of done: the full flow (post-battle interstitial → resolve → toasts → history; inbox path; expiry path) driven in Playwright at desktop AND 375×812.
6. **Art + pool audits** — `scripts/audit-event-art.ts`, `scripts/audit-event-pool.ts` (§3.1), and the asset bill from §4.3.
7. **Storyline payoffs** — wire `certified` rivalries into `generate-battle-offers` (§8.2) and stage changes into `newsGenerator.ts` context.
