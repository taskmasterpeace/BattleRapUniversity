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
| /newsroom | **B+** | strong own identity (the Desk); consistent enough — leave |
| /leagues | **B** | tiered cards + crests fine (white boxes in dev = image-optimizer lag, not a bug) |
| /media | **D** | legacy article hub, empty in dev — decide: fold into /newsroom or restyle |

## Not yet swept (next loop iterations)
/finances · /calendar · /wire · /matchup · /leaderboard · /crew · /tournaments · /notifications · /life-events (recently overhauled — likely B+) · /onboarding · /guide · /settings · /battle/[id]/control · /battle/[id]/promotion

## Loop recipe (each iteration)
1. Pick 2-3 ungraded or lowest-graded pages.
2. Screenshot desktop + 375px in the Browser pane (dev server port 3009; zoom 0.55 for full-page frames).
3. Grade against docs/design/flyer-system/DESIGN_LANGUAGE.md — portraits fill frames, Anton names, pixel accents, corner colors, drill-down law (every battler face/name links to their profile).
4. Restyle the worst using the shared kit: MatchupMasthead / BattleFlyer / CrowdStrip / BattlerHero / fighter-card pattern / .fs CSS layer.
5. `npm run build` in ai-battlerap → verify in Playwright → commit → push `feat/flyer-system:master` → update this ledger.
