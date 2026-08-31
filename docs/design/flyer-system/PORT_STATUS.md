# The Visual Overhaul — Full Inventory & Port Status
*2026-08-31. The answer to "did we get everything?" — nothing built this sprint was lost; it lives in git on `master`. Two app trees exist: **`ai-battlerap/` = what production builds**; the repo-root app = where the overhaul was first built. Owner's order: move everything into `ai-battlerap/`.*

## Everything we built (the whole overhaul, not "just a flyer system")

| # | Piece | Where it lives | On PROD? |
|---|---|---|---|
| 1 | **Design language** (neutral charcoal, red/blue corners, gold, Anton/Rajdhani/Inter/Press Start 2P, portrait-fill law, city-crown law, integer-scale law) | `docs/design/flyer-system/DESIGN_LANGUAGE.md` + `.fs` CSS layer | ✅ CSS layer + fonts ported |
| 2 | **Character Sheet dossier** (big face, city crown, PROFILE 1/N strip, Fight Shape radar, graded matrix, plates) | both trees (`components/battler/character-sheet.tsx`) | ✅ LIVE on `/battler/[id]` |
| 3 | **Real-battler likeness pipeline** (photo → 112px candidates → set install) + portrait sets for **Tru Foe** & **Jesse Rican** | scripts + `public/sprites/characters/real/` in both trees | ✅ LIVE (faces + DB rows on prod) |
| 4 | **Multiple profiles** (sprite_set variants; profile pic + 3 flyer/battle variants — the convention the owner locked) | schema + career API + sheet strip | ✅ LIVE |
| 5 | **Portrait crop engine** (926 sprites measured; `portraitFillStyle` fill-the-frame framing) | `lib/sprite-crops.*` both trees | ✅ ported |
| 6 | **Dashboard Command Hero** (big portrait over city, name, chips, level/ELO/XP, next-battle mini-flyer) | root `components/dashboard/battler-hero.tsx` | ⏳ NEXT — porting now |
| 7 | **Battle Flyer engine** (OUTSIDE-5 headliner, silhouette variant, tale-of-the-tape, undercard rows) | root `components/battle/battle-flyer.tsx` | ⏳ queued — wires into battle/watch/matchup screens |
| 8 | **Badge art recovery** (120 medallions mapped from the sheets + 2 generated; `badgeArt()` source of truth) | root `lib/badge-art.ts` + `public/sprites/badges/` | ⏳ queued — NOTE: ai-battlerap already has its own badge_costs.icon_url art system; reconcile, don't duplicate |
| 9 | **Jesse Rican media persona** ("The Predictions King" blogger + fixed BloggerAvatar faces) | root `lib/bloggers.ts` | ⏳ queued — ai-battlerap newsroom personas are code-defined in its tree |
| 10 | **Create-A-Battler** (7-beat debut flow spec + `/create-battler` skill) | `CREATE_A_BATTLER.md` + `.claude/skills/create-battler/` | ✅ skill live (repo-wide) |
| 11 | **Multiplayer time model** (dual-clock: action prep + real deadline) | `docs/design/MULTIPLAYER_TIME_AND_BATTLES.md` | design doc (build later) |
| 12 | **Mockups/boards** (board.html, Codex dossier concept, all proof screenshots) | `docs/design/flyer-system/` | n/a (docs) |

## Port queue into `ai-battlerap/` (owner's order — everything moves)
1. ✅ **Dashboard Command Hero** — LIVE (commit 3728b45): BattlerHero on /dashboard, hometown city crown + backdrop, next-battle mini-flyer
2. ✅ **Battle screens in the new style** — LIVE (8ca7191): MatchupMasthead (red vs blue corners, gold VS seal / scoreline + verdict stamp, WINNER badge) on round select ("CALL YOUR SHOT"), ON DECK, THE TAPE, final battle page, spectator replay + tale of the tape; `battleFace()` uses sprite_set[1] battle-face variants
3. ✅ **Battle Flyer on Tonight's Card** — LIVE (c0f34b4): headliner bout runs the full event poster w/ undercard rows
4. ✅ **Badge art reconciliation** — RESOLVED, no wiring needed: ai-battlerap's badge_costs (76 badges) already 100% covered by its own verified icon_url mapping, all 76 files present on disk. The root tree's `badgeArt()` map is a DIFFERENT badge vocabulary (89 codes, only 14 shared) → it's the **art bank for future badge-set expansion** (root `public/sprites/badges/badge_*.png`, 120 medallions + generation recipe in BADGE_ART_AUDIT.md). When badges are added to badge_costs, pull art from the bank.
5. ✅ **Jesse blogger persona** — LIVE in both DBs: social_accounts row `@PredictionsKing` (kind=blogger, voice analyst_rankings, influence 61 / cred 72 / controversy 65) **linked to his battler row via battler_id** — true dual-lane; the newsroom engine now lets him claim story leads
6. ✅ **Roster/battlers list cards** — LIVE (8bf4e1e): all 112 battlers render as fighter cards (fill-frame portraits, Anton names, pixel ELO, tier edges)

## "All battlers appear in that style" — current truth
✅ Already true for **profiles**: `/battler/[id]` on prod renders EVERY battler (all 102) in the dossier style — data-driven, not per-battler work. Their portraits are the existing mixed-style sprites until each gets a real set; the **style-consistency fix at scale = the model-training plan** (30 battlers → train a LoRA on the house style; noted in the skill).

## The database situation (owner: "parallel database need to be organized")
- **Local** Supabase (Docker) = dev world (176 battlers, 19 leagues). **Prod** Supabase `eolzktjhbrazaypfwhrr` = the real world (102 battlers, 19 leagues). Schema mostly parity; drift bites in API code (3 fixed this sprint).
- Prod-only quirks: `avatar_url` UNIQUE; `sprite_set`/`style_tags` jsonb; **duplicate Tru Foe row** (9105aa05) still to merge.
- Recommendation (pending owner): one migrations source of truth in `ai-battlerap/supabase/`, applied local-first then prod via MCP; retire the root tree's parallel migration stack during consolidation.

## Deploy truths (never forget)
Production = Vercel project `battle-rap-university`, **root directory `ai-battlerap/`**, **branch `master`** (pushes to `main` = broken previews, env-scoping). Prod DB changes go through the Supabase MCP separately from code deploys.
