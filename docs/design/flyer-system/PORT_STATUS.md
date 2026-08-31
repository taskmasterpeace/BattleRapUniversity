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
1. **Dashboard Command Hero** ← in progress
2. **Battle screens in the new style** (owner: "I need to see how it is to be actually in a battle") — restyle `/watch/[battleId]` + battle results with fs layer + BattleFlyer + portrait sets
3. **Battle Flyer** onto matchup/card surfaces (`/matchup`, Tonight's Card)
4. **Badge art reconciliation** (merge `badgeArt()` map with badge_costs.icon_url — one source of truth)
5. **Jesse blogger persona** into ai-battlerap's newsroom roster
6. **Roster/battlers list cards** in the new style so *every* battler browses in the dossier language

## "All battlers appear in that style" — current truth
✅ Already true for **profiles**: `/battler/[id]` on prod renders EVERY battler (all 102) in the dossier style — data-driven, not per-battler work. Their portraits are the existing mixed-style sprites until each gets a real set; the **style-consistency fix at scale = the model-training plan** (30 battlers → train a LoRA on the house style; noted in the skill).

## The database situation (owner: "parallel database need to be organized")
- **Local** Supabase (Docker) = dev world (176 battlers, 19 leagues). **Prod** Supabase `eolzktjhbrazaypfwhrr` = the real world (102 battlers, 19 leagues). Schema mostly parity; drift bites in API code (3 fixed this sprint).
- Prod-only quirks: `avatar_url` UNIQUE; `sprite_set`/`style_tags` jsonb; **duplicate Tru Foe row** (9105aa05) still to merge.
- Recommendation (pending owner): one migrations source of truth in `ai-battlerap/supabase/`, applied local-first then prod via MCP; retire the root tree's parallel migration stack during consolidation.

## Deploy truths (never forget)
Production = Vercel project `battle-rap-university`, **root directory `ai-battlerap/`**, **branch `master`** (pushes to `main` = broken previews, env-scoping). Prod DB changes go through the Supabase MCP separately from code deploys.
