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

## Iteration 4 — graded + fixed 2026-08-31 (late)
| Page | Grade | Notes |
|---|---|---|
| /cities | **A-** | pixel skylines per city, league chips — already in language, leave |
| /matchup | B → **A-** | corner slots get red/blue-edged fill-frame portraits; all 1000 roster buttons get fill-frame face chips (were floaty object-contain) |
| /wire | B+ → **A** | poster-font masthead + LIVE pulse; author tiles (REAL faces for accounts with battler_id via feed API join, kind-colored pixel monograms otherwise); target battler's face on the right of drops about them (drill-down); kind-colored left card edges + hard shadows; emoji verbs → Icon set with pixel-font counts; HEATING UP gets gold pixel ranks + red→orange heat bars; newsroom rail iconized |

## Not yet swept (next loop iterations)
/crew · /notifications · /life-events (recently overhauled — likely B+) · /onboarding (needs a fresh account to view) · /guide · /settings · /battle/[id]/promotion · /verified · article detail pages · prep day-calendar fs pass · /tournaments list poster treatment

## Loop recipe (each iteration)
1. Pick 2-3 ungraded or lowest-graded pages.
2. Screenshot desktop + 375px in the Browser pane (dev server port 3009; zoom 0.55 for full-page frames).
3. Grade against docs/design/flyer-system/DESIGN_LANGUAGE.md — portraits fill frames, Anton names, pixel accents, corner colors, drill-down law (every battler face/name links to their profile).
4. Restyle the worst using the shared kit: MatchupMasthead / BattleFlyer / CrowdStrip / BattlerHero / fighter-card pattern / .fs CSS layer.
5. `npm run build` in ai-battlerap → verify in Playwright → commit → push `feat/flyer-system:master` → update this ledger.

## Iteration 5 — 2026-08-31 day 2 (ONE METER + portrait fill + card fillers)
| Surface | Grade | Notes |
|---|---|---|
| ALL meters app-wide | → **unified** | StatGauge (dossier cell gauge) is THE meter: dashboard attrs, onboarding review/success, tale of the tape + battle StatRow + MatchupPreview (mirrored), PostBattleSummary, badge progress, stress/grudge/rematch (severity cells), fan split, crowd perception (green YOU vs red THEM). Deleted dead: StatBar, IntensityMeter, CareerStatsPanel. Replay avg+peak bars stay (different instrument). |
| portrait squares app-wide | → **fill-frame** | BattlerAvatar rebuilt square+fill; onboarding face grid/review/success/welcome; dashboard recent rows; landing tiles; MatchupResult corners (mic-emoji placeholder killed — no-mics law). |
| /battler/[id] card | A- → **A+** | Codex-collab modules: THE BAG plate, style tags + FIGHTING OUT OF + wire handle, RIVALRY FILE (hostility cells), FORM last-5 tiles + bodies/rounds/haymakers + CAREER HIGH ticket under the radar, league column = league plate + PRESS HEAT (RIDES/HATES lean + latest angle) + RECENT OUTINGS ledger (drill-down). Tabs moved under masthead; identity/bio/accolades folded into OVERVIEW; career chips fill radar rail. |

## Port/dev truth (2026-08-31)
- localhost:3000 now serves ai-battlerap (the ROOT tree's stale server was squatting it — killed). Next dev-lock: one server per dir; kill the PID in the "Another next dev server is already running" banner before rebinding.
- PixelLab likeness generation is now URL-based: reference_images accepts prod sprite URLs + style_image_url = /sprites/style-ref-house-96.png (deployed anchor). No more hand-carried base64.
