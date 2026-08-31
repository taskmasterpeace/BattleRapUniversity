# The Style Loop — page-by-page grade ledger
*Self-improving loop (owner /goal 2026-08-31): screenshot → grade against the Flyer System → fix the blandest → re-grade. This ledger persists the loop across sessions. Grade meanings: A = fully in the design language · B = dark + coherent but not flyer-ized · C = functional but bland · D = broken/legacy.*

## Graded 2026-08-31 (all verified in Playwright on the dev server)
| Page | Grade | Notes |
|---|---|---|
| /dashboard | **A** | BattlerHero command center (city crown, ELO/XP, next-battle mini-flyer) |
| /battler/[id] | **A** | CharacterSheet dossier (radar, grades, PROFILE 1/N) |
| /battlers roster | **A** | fighter cards, fill-frame portraits, pixel ELO |
| /watch (Tonight's Card) | **A** | BattleFlyer headliner + undercard faces + league crest + league banner |
| /watch/[battleId] | **A** | corner masthead, ROOM vs TAPE panel, per-round crowd strips |
| round select | **A** | CALL YOUR SHOT masthead |
| round results | **A** | ON DECK + THE TAPE mastheads + THE ROOM crowd strip |
| /battle/[id] final | **A** | masthead w/ poster digits + verdict stamp |
| /battle/offers | **A** | every offer is a fight poster (2026-08-31) |
| /battle/[id]/prep | **B+** | CAMP pipeline strip added; the day-calendar itself still pre-flyer |
| /newsroom | **B+** | strong own identity (the Desk); @PredictionsKing on the roster — leave |
| /leagues | **B** | tiered cards + crests fine (white boxes in dev = image-optimizer lag, not a bug) |
| /media | **D** | legacy article hub, empty in dev — decide: fold into /newsroom or restyle |

## Iteration 2 — graded + fixed 2026-08-31 (late)
| Page | Grade | Notes |
|---|---|---|
| /calendar | C → **A-** | FIGHT NIGHTS rail: next 14 days of bouts as face-chip matchup rows (red/blue edges, gold pixel VS, ★ mine), TONIGHT'S CARD footer link; rail has its own query, not month-bounded |
| /leaderboard | A- → **A** | podium + list avatars were floaty bg-cover crops → fill-frame portraitFillStyle, gradient plates |
| /finances | B → **A-** | THE BAG poster plates: gold pixel-font money, gold top edge, hard shadows, "FLAT PAY · WIN OR LOSE" law in subtext |
| /battle/[id]/control | B → **A** | BATTLE NIGHT opens on the MatchupMasthead (corners + VS seal + league/format), camp readout in gold pixel digits w/ WRITE/REHEARSE labels |
| /wire | **B+** | feed + HEATING UP + newsroom ticker — own identity, leave |
| /matchup | **B** | corner slots + VS present; picker is text-only buttons — faces in the picker = next pass |

## Iteration 3 — graded + fixed 2026-08-31 (late)
| Page | Grade | Notes |
|---|---|---|
| /badges | B+ → **A-** | compendium already shows every badge + full effects; medallions bumped to new xl size (160px) per owner's "badge logos bigger" |
| /tournaments/[id] | C+ → **B+** | bracket + participants rows get corner-edged FaceChips, names drill to profiles (drill-down law); winner highlight kept green |
| /tournaments | **C+** | list page sparse — one text card; needs a championship-poster treatment when tournaments matter more |

## Not yet swept (next loop iterations)
/crew · /notifications · /life-events (recently overhauled — likely B+) · /onboarding · /guide · /settings · /battle/[id]/promotion · /cities · /verified · article detail pages · /matchup picker faces · prep day-calendar fs pass

## Loop recipe (each iteration)
1. Pick 2-3 ungraded or lowest-graded pages.
2. Screenshot desktop + 375px in the Browser pane (dev server port 3009; zoom 0.55 for full-page frames).
3. Grade against docs/design/flyer-system/DESIGN_LANGUAGE.md — portraits fill frames, Anton names, pixel accents, corner colors, drill-down law (every battler face/name links to their profile).
4. Restyle the worst using the shared kit: MatchupMasthead / BattleFlyer / CrowdStrip / BattlerHero / fighter-card pattern / .fs CSS layer.
5. `npm run build` in ai-battlerap → verify in Playwright → commit → push `feat/flyer-system:master` → update this ledger.
