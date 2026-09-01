# Sticky Reputation Labels

**Status:** design synthesized 2026-09-01 from a culture-research pass (~45 labels, sourced) + a Codex architecture pass. Implements the owner's ask: life-story labels, *some stickier than others*, grounded in research, triggered by life events or baked at generation. Builds on [reputation_system](../../lib/game/reputation.ts).

## The model

Reputation has **two layers** that merge into one panel:

- **CURRENT FORM** — live-derived labels, recomputed from recent stats every read (On A Run, Untouchable). Already shipped in `deriveReputation`.
- **ON YOUR RECORD** — *stored* sticky labels, pinned by events or baked at generation, that persist and decay on their own clock. This doc.

### Three stickiness tiers (battle-clocked — reads never decay a label)

| Tier | Default heat | Decay / completed battle | Reinforce | Removal |
|---|---|---|---|---|
| **PERMANENT** | 95 | −2 (floor 40) | +10 | Never off through play; only factual correction (e.g. allegation disproven) |
| **DURABLE** | 80 | −4 | +15 | Counter-evidence gate **and** heat ≤30 → retire at 19 |
| **FRESH** | 60 | −15 | +15 | Auto-retire below heat 20 |

Heat ≥20 = shown + mechanically active. **All modifiers scale by heat**: `effective = configured × heat/100`. Retired labels stay in career history and can reactivate.

**Rumor ≠ fact (Codex's key correction).** An allegation is not permanent system truth. A snitch/ghostwriter *rumor* pins FRESH; a receipt-backed but disputed claim is DURABLE; only corroborated/admitted misconduct promotes to PERMANENT. Repetition never promotes tier — only a stronger evidence receipt does.

**Asymmetry is the point (research).** Shade sticks harder than gas lifts. A choke brands faster than a body redeems — that's the decay rates doing their job.

## Generation-time labels (baked at creation)

Origin is permanent biography, but the *public shorthand* can be outgrown → origin labels are **DURABLE with zero modifiers** (the origin's attribute bonuses already exist; don't double-count).

| Source | Label | Tier / tone / heat | Off ramp |
|---|---|---|---|
| App Camera origin | INTERNET BATTLER | durable / neutral / 65 | 5 in-room battles, 3 clean w/ crowd ≥70 |
| Text Forums origin | PEN FIRST | durable / neutral / 60 | 5 in-room, 3 w/ performance ≥7 & crowd ≥70 |
| Crew origin | CIRCLE TESTED | durable / neutral / 65 | 8 pro non-crew battles (−6/ea) |
| Hometown | `[CITY] MADE` | permanent / neutral / 45 | never (one `hometown_made` key, city in source; reason varies by scene) |

The internet-vs-stage axis is load-bearing for THIS game (leagues span Text Wars/app → live stages). INTERNET BATTLER → proving-it-live is a real felt progression.

## Event → label pins

Not every life event makes a label — private family/health/money only do if they go **public**.

| Event | Pin |
|---|---|
| CHOKE_IN_BIG_BATTLE | CHOKER durable/shade — own it 85 / hide it 95 |
| CAREER_CRISIS (public) | WASHED durable/shade/84 |
| CONTROVERSIAL_LOSS | ROBBED fresh — speak out 70 / quiet 55; rematch retires it |
| RIVAL_CALLOUT | accept → ANSWERED THE CALL fresh/gas/60; ignore → DUCKING TALK fresh/shade/65; 3rd ignore → DUCKING durable/82 |
| FINANCIAL_CRISIS | only if the easy-check choice goes public → TAKING ANY CHECK fresh/shade/50 |
| INJURY_MINOR | battle through publicly → BATTLING HURT fresh/neutral/45 |
| MEDIA_INTERVIEW | accept → IN THE SPOTLIGHT fresh/neutral/55 |
| BODYBAG_HYPE | MOMENT MAKER fresh/gas — embrace 80 / low-key 65 |
| **NEW** SNITCH_ALLEGATION | rumor fresh/70 → receipt durable/92 → corroborated PERMANENT/100 |
| **NEW** GHOSTWRITER_ALLEGATION | rumor fresh/65 → receipt durable/85 → corroborated PERMANENT/95 |
| **NEW** DUCKING_PATTERN | 3 ignored callouts → DUCKING durable/82 |
| **NEW** WENT_MAINSTREAM | durable/neutral/75, retires ~14 unreinforced battles |
| **NEW** LEGAL_TROUBLE | LEGAL CLOUD durable/neutral/75; dismissal −40 & retire; conviction → PERMANENT/90 |

**The two worst scars:** corroborated snitch (100) and corroborated ghostwriting (95) — one kills street credibility, the other kills the claim you wrote your material.

## Storage — `battler_labels`

Relational ledger (NOT JSONB): atomic reinforcement, uniqueness, RLS, retirement history. Columns: `id, battler_id, key, tier, tone, pinned_at, source jsonb, heat, last_reinforced_at, processed_battle_count, evidence_count, qualifying_evidence_count, status, retired_at`. Unique `(battler_id, key)` — one lifetime row per label. Public SELECT RLS (reputation is observable); service-role writes only; each source receipt processed once (retries no-op). Display/effect/modifiers/decay/recovery live in the **pure registry**, never per-row.

## Merge rules (Codex)

One `Reputation.labels`, each carrying `provenance: live|stored|both` + tier. For an identical key: one chip, **stored wins** tier/pin/source/recovery, **live supplies the current reason**, effective heat = `max(stored, live)`, modifier applied once. Exclusive families collapse: `choker > sweated_one`, `washed > skidding`, `body_bag_collector > got_bodies`.

**Compute modifiers from ALL active dedup'd labels (heat-scaled) BEFORE slicing to the 6 shown** — otherwise gameplay depends on display order (a real bug in the current code).

**Live-label correction:** don't let all-time `lifeEventCodes` recreate event labels — those codes are *pinning receipts*, current form must use recent stats. Change live CHOKER from lifetime choked-rounds to a **rolling 5-battle window** so a retired CHOKER can't instantly respawn from old history.

**Balance guardrail:** the CHOKER label and the Known Choker badge must not both add choke probability — the **badge owns the sim penalty**; reputation drives crowd, offers, opponent prep.

## CHOKER recovery (the reference durable gate)

Pin durable at 90 (big-stage) / 85 (2 chokes in last 5). Recover: 5 straight battles with zero choked segments, ≥2 at incident tier-or-higher (or within 100 rating of the incident opponent). Each clean battle: normal −4 decay **plus −10 counter-evidence** (90→76→62→48→34→20). Gate met at the 5th → retire at 19. Another choke resets counters and sets heat `max(90, cur+20)`.

## Lifecycle (one flow)

1. A battle/event produces a unique **source receipt**.
2. Public facts pin now; choice/private events wait for resolution.
3. Pure reducer advances every existing label once for the new completed-battle count: **decay, then counter-evidence**.
4. Event mapping emits pin / reinforce / promote / no-op.
5. Server upserts the one `(battler_id, key)` row.
6. Career read loads active rows → into pure `deriveReputation`.
7. Live + stored merge, dedup, heat-scale, feed `reputationModifiers`.
8. Satisfied gate retires at 19; relapse reactivates the same row.

## Build order

1. ✅ Pure **registry** (`lib/game/labels/registry.ts`) + **lifecycle reducer** (`lib/game/labels/lifecycle.ts`) — generation assign, event map, decay/pin/recover. Unit-tested.
2. ✅ Merge stored+live in `deriveReputation`; two-band panel; mock.
3. `battler_labels` migration (written; apply when Supabase is back up).
4. **Wiring (needs DB live to playtest):** assign gen labels at creation; pin on life events; read stored in career API; move choke-probability fully to the badge.
