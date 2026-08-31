# Gameplay Tour — Battle Rap University
*Captured live from a real playtest, 2026-08-31 (1600px, Playwright). The battle shown (Flow Tester vs Spotlight Sage, Small Room Circuit) was actually played through the interactive flow while capturing.*

| # | Shot | What it shows |
|---|---|---|
| 01 | dashboard-command-center | The command hero: portrait over your city, ELO/XP, next-battle mini-flyer |
| 02 | round-select-counterpick | CALL YOUR SHOT — corner masthead + the type-effectiveness counter-pick grid (2× / 0.5× vs their predicted content) |
| 03 | on-deck-lights-down | The lights-down beat: your locked cards, theirs stay hidden, PERFORM button |
| 04 | round2-the-tape-crowd | Round verdict masthead + THE ROOM (three-row crowd reacting at 44/51%) + The Read |
| 05 | round3-haymaker-lands | The comeback round — landed haymaker, "the room felt it" |
| 06 | final-verdict-sage-edges-it | Full battle page: poster-digit scoreline, verdict stamp, the internet reacting |
| 07 | battle-offer-fight-poster | Every offer is a fight poster — you vs them, the bag, grudge tags |
| 08 | tonights-card-headliner | The world's card: BattleFlyer headliner + undercard + league crest |
| 09 | battler-dossier-nia | The dossier: city crown, PROFILE 1/4, Fight Shape radar, graded matrix |
| 10 | roster-fighter-cards | All battlers as fighter cards (consistency wave visible) |
| 11 | the-wire-scene-talks | THE WIRE: faces on the feed, heat bars, the newsroom sitting on stories |
| 12 | power-rankings-podium | Power Rankings podium with fill-frame faces |
| 13 | calendar-fight-nights | Calendar + FIGHT NIGHTS rail (next bouts with faces) |
| 14 | replay-mixed-room-tape | Spectator replay: PACKED mixed-venue crowd (London room), ROOM vs TAPE panel |
| 15 | packed-room-multimaster | The packed room at watch-mode density — shoulders overlapping, frame-filling |

Refresh recipe: dev server (`ai-battlerap-dev`, port 3009) → dev quick login → Playwright `browser_take_screenshot` at 1600px, `fullPage` for long pages.
