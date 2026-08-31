---
name: create-battler
description: Create a battler for Battle Rap University from a photo (real person, licensed likeness) or from a text description — runs the proven likeness pipeline (112px house-style candidates → owner picks → portrait SET installed → DB rows on local AND prod → verified live). Use when Robert says "make X a battler", "add this person to the game", drops a photo for conversion, or asks for new battler portraits. Also covers adding them as a media personality (blogger) and the model-training roadmap.
---

# Create A Battler — the production pipeline

Proven on Tru Foe + Jesse Rican (2026-08-31, both live on prod). Every law below was paid for.

## The laws (violate none)
1. **Density**: generate at **112×112** (roster's measured grid; 80px kills eyes, 128 reads too fine).
2. **Eyes**: prompt MUST include *"clear well-defined eyes with dark irises and visible pupils"*.
3. **Integer scaling only**: 112 → 448 (4×), transparent-pad to the 512 canvas. Non-integer nearest = wobble.
4. **Portrait SET, not portrait**: primary avatar + 3 variants → `battlers.sprite_set` (jsonb array, primary first). Primary = identity surfaces; variants = flyers, battle screens, feed moments, PROFILE 1/N strip.
5. **Likeness ethics**: real people only with the owner's say-so → `is_real=true, real_name, likeness_status='licensed'`.
6. **Files live in BOTH trees**: `public/sprites/characters/real/<slug>[-N].png` AND `ai-battlerap/public/sprites/characters/real/` (prod builds ai-battlerap/).
7. **Prod quirks**: `battlers.avatar_url` is UNIQUE (no two battlers share a file — dupes get different variants); `sprite_set`/`style_tags` are **jsonb** (`::jsonb` in SQL).

## Pipeline (photo → live)

### 1. Get the photo
Owner usually drops screenshots in `C:\Users\taskm\Downloads` (find by recency). Face-crop:
```js
sharp(src).resize(256,256,{fit:'cover',position:sharp.strategy.attention}).jpeg({quality:72})
```
Keep base64 ≤ ~8K chars or the PixelLab MCP argument gets truncated (192–256px, q60–72).

### 2. Generate candidates (PixelLab `create_image_pro`)
- `width/height: 112`, `no_background: true` → 4 candidates
- `reference_images`: `[{base64: <photo>, usage: "character likeness — match this exact person's face shape, eyes, hair, skin tone, and outfit"}]`
- `style_image_base64`: quantized roster bust (`sharp('public/images/sprite-536.png').resize(96,96).png({palette:true,colors:12})`)
- description: `"head-and-shoulders bust portrait of a battle rapper: <person specifics>, <signature clothing>, clear well-defined eyes with dark irises and visible pupils, transparent background"`
- No photo (fictional battler)? Same call, no reference_images — description carries identity.

### 3. Present at integer scale, owner picks
Build a numbered grid — **cells = 4× or 5× exactly** (448/560px). Owner picks the primary; keep all 4 as the set (order: pick first, then best-alt as "battle face").

### 4. Install (files + local DB)
```bash
node scripts/set-real-battler-portrait.mjs "<Stage Name or uuid>" <primary.png> <alt.png> <alt.png> <alt.png> [--real-name "Name"]
```
Handles: integer upscale + 512 pad → `public/sprites/characters/real/`, crop-map registration
(`lib/sprite-crops.json` — portraitFillStyle framing), `avatar_url` + `sprite_set` + likeness flags.
New battler with no row? `scripts/create-jesse-rican.mjs` is the template (city + league lookup,
battler + battler_attributes + rankings inserts, idempotent).
**Then copy the pngs into `ai-battlerap/public/sprites/characters/real/` too.**

### 5. Prod (separate database!)
Prod Supabase = project `eolzktjhbrazaypfwhrr` (use the supabase MCP `execute_sql`).
- Existing battler: UPDATE avatar_url/sprite_set(::jsonb)/is_real/real_name/likeness_status.
- New battler: INSERT battlers + battler_attributes + rankings (see create-jesse-rican.mjs SQL shape; jsonb attribute keys are snake_case: `stage_presence`, `financial_stability`…).
- Ship files: commit both trees → `git push origin <branch>:master` (**master, NOT main** — main previews always fail on missing env).

### 6. Verify live
`https://battle-rap-university.vercel.app/battler/<prod-uuid>` — dossier masthead with the city crown,
PROFILE 1/N strip, real face. Screenshot it for the owner.

## Dual-lane (media personality too)
Root tree: add to `lib/bloggers.ts` (`isActive: true`, `avatarId`, copy primary → `public/sprites/bloggers/blogger_<slug>.png`). The persona writes articles via the newsroom engine. (ai-battlerap's newsroom personas are code-defined in that tree — port entry there when its blogger roster is touched.)

## Roadmap note — train our own model (owner, 2026-08-31)
Once ~**30 battlers** exist with consistent 112px house-style sets, train a custom model (LoRA) on the
portrait library so likeness conversion stops depending on per-call style references: dataset =
`public/sprites/characters/real/*` + the roster sheets; train on cupcake (GX10) or PixelLab if they
ship fine-tuning. Until then: this pipeline IS the consistency mechanism (same style ref, same
density, same prompt skeleton every time).
