# Attribute Usage Audit — what every stat ACTUALLY does
*2026-08-31, audited against `ai-battlerap/` (the production tree). Owner asked: "I wanna know what all of those stats are being used for." Answer below, plus the broken channels the audit uncovered.*

## The engine in one line
`baseScore = avg(lyricism, wordplay, creativity) × league.writing_weight + avg(stage_presence, crowd_control, delivery) × league.performance_weight` (`lib/game/simulation.ts:1161-1172`). League weights run 0.32–0.68, so ONE writing point is worth ~2.1× more in a pen league (Small Room Circuit, Respect The Craft @ 0.68) than a performance league (Main Stage @ 0.32).

## Per-attribute verdicts

| Attribute | Verdict | What it actually does |
|---|---|---|
| **Lyricism** | USED (top tier) | 1/3 of writing power in base score; writing-prep target; research spillover ×0.3; progression + badge unlocks (≥9.0); promotion angle_teaser weight |
| **Wordplay** | USED (top tier) | 1/3 of writing power; half haymaker progression bonus; badge unlock ≥7.5; twitter_callout promotion |
| **Creativity** | USED (top tier) | 1/3 of writing power; the BIGGEST prep multiplier (writing boost + research spillover ×0.5); full haymaker progression bonus |
| **Stage Presence** | USED | 1/3 of performance power; double-dips into crowd reaction (but see Broken #3); interview promotion |
| **Crowd Control** | USED | 1/3 of performance power; stumble RECOVERY: avg(delivery, crowd_control) ≥8 softens a stumble from −15% to −10% |
| **Delivery** | USED | 1/3 of performance power; reduces stumble chance (tiny: delivery 10 ⇒ 4.2%→3.8%/segment); half of recovery skill |
| **Flow** | **DEAD** | Removed from the schema (`simulation.ts:1209` comment). Several readers still reference it and get undefined — incl. `timeEconomy.ts:321` where it NaNs a talent score (module has no importers anyway) |
| **Resilience** | USED (choke only) | Choke probability only — and it's nearly BINARY: below ~4.75 you're at 1.4%/segment; from ~4.75→7 it does NOTHING (floor-capped at 0.8%); above 7 each point buys only −0.1%. Raised by rest days, no-choke progression (+0.05/battle), skill points, city bonus, life events |
| **Financial Stability** | USED | (a) choke penalty ONLY when broke AND unprepped (fs<4 && prep<5: up to +0.9%/segment ≈ +65% chokes); (b) OFFER COUNT — ≤3 gets 2-3 offers, ≥7 gets 1 (desperation books more); (c) stress +5/point below 4; (d) life-event gating |
| **Reputation** | USED (never in battle) | Matchmaking difficulty: target opponent rating = yours + (rep−5)×50 — a ±250 ELO swing, its biggest effect. Promotion bonus (rep−5)×2. Life-event gating. EXPLICITLY REMOVED from choke (commented out `simulation.ts:1286-1294`) |
| **Family Bond** | USED (weak in combat) | effectiveResilience = resilience + family_bond/10 (near-zero after the floor); ≥7 ⇒ 2× stress decay; ≥8 blocks family_drama/crisis events; ≥7 enables family_support after a loss |
| **Preparation** | USED but PLAYER-INERT | Real multiplier: every prep day's effect × (1 + preparation/20) — prep 10 = +50% per day vs +25% base. BUT it's hardcoded to 5 at creation, absent from point-buy, not a skill-point target, never touched by progression. Only life events move it. A live mechanic no player can invest in |

## Status update — 2026-08-31 rewire (owner-approved)
Broken channels #1 and #2 below are FIXED: `ModifiedAttributes` now carries `stress` + `public_knowledge` into both sims (career `simulation.ts` AND interactive `singleRoundSimulation.ts`, which never had the terms at all). `CHOKE_STRESS_MULTIPLIER` tempered 0.10 → 0.06 so max-stress stays below the Known Choker badge; new `STRESS_REST_RELIEF: 6` makes rest days shave battle-night stress. Channel #3 (crowd) fixed: `ROUND_JUDGING_CROWD_SCALE` 0.15 → 6 (full 10 destabilized choke calibration via the momentum→resilience coupling). Re-validated at 60 battles/profile: Known Choker 46.7% (target 46) ✓, Average 8.3% (~7) ✓, Clutch 3.3% (3) ✓, stumble avg 39.2% (~40) ✓, badge separation 38.3% ✓. NOTE: several suite profiles (Substance Issues expected 20%, actual ~45-57%) failed BEFORE the rewire too — their expectations are stale vs evolved badge constants; the suite needs an expectations refresh, tracked separately. Since every battler's stress is currently 0, live-world balance is unchanged until stress actually accumulates.

## Broken channels found (present but severed)

1. **Stress never reaches the battle sim.** `stressManagement.ts` computes and persists stress correctly, but the sim reads `(attrs as any).stress || 0` off a `ModifiedAttributes` object that only carries writing/performance/personal/resilience → always 0. `CHOKE_STRESS_MULTIPLIER` and `STUMBLE_STRESS_MULTIPLIER` never fire. **The whole stress system has zero battle effect** — and with it the stress-mediated halves of financial_stability, preparation, and family_bond. (Fixing this changes the validated 7% choke tuning — a rebalance decision, not a patch.)
2. **`public_knowledge` same bug** → the fame-pressure choke block is unreachable.
3. **Crowd reaction is numerically negligible in verdicts**: round composite = avg×0.40 + peak×0.35 + (crowd/100×0.15)×0.25 — a PERFECT 100 crowd adds ~0.04 against an avg term of ~2.8 (<1%). This guts the performance double-dip, `base_crowd_factor` league feel, AND the promotion crowd-perception bonus. (Owner's crowd-visualization direction is the moment to rebalance this.)
4. **Dead modules** (no importers): `timeEconomy.ts`, `eventEngine.ts`, `badgeProgression.ts`; `choiceOutcomeCalculator.ts` (the richest attribute-modifier table in the repo) is only imported by a test.
5. **Dead config**: `CHOKE_REPUTATION_*`, `CHOKE_TOURNAMENT_*`, `CHOKE_LOSING_STREAK_MULTIPLIER`, `CHOKE_OPPONENT_INTIMIDATION_*` — all unreferenced ("Phase 2" TODOs).

## The other big finding: content selection ignores attributes entirely
The interactive round system (contentTypes/deliveryTypes/performanceTypes) keys ONLY off `style_tags` (badges) + league name, then applies as a post-hoc multiplier on already-computed scores. Attributes and content never interact. Also a naming trap: content-type ids `'wordplay'`/`'stage_presence'` are a separate namespace from the attributes with the same names.

## Where this points (owner's vision, 2026-08-31 voice notes)
- Prep phases should be: research → organize/choose content → WRITE → MEMORIZE → practice — with some battlers (Geechi Gotti lane) skipping research entirely and drawing from their own life.
- Attributes should shape WHICH content a battler can wield well (they currently don't — see above).
- Crowd should be the per-round feedback surface (overlapping-sprite crowd visualization) and should matter more than <1%.
- Room verdict vs tape/online verdict should diverge (PPV = both audiences at once). See `docs/design/culture/LEAGUE_CULTURES_AND_PPV.md`.
