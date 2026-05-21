# Asset Standards & PixelLab Cheat Sheet

**Date:** 2026-05-20
**Backup of current assets:** `D:/asset-backups/battlerapuniversity-2026-05-20/` (1.05 GB, 1,860 sprites + 209 source files)

> **Canvas sizes have moved.** The source of truth for asset dimensions is now [`CANVAS_SIZES.md`](./CANVAS_SIZES.md). This file remains the reference for PixelLab API usage, body schemas, endpoints, and scripts. If the table below disagrees with `CANVAS_SIZES.md`, **`CANVAS_SIZES.md` wins**.

## Recommended canvas sizes (see CANVAS_SIZES.md for authoritative values)

| Asset type | Recommended size | Aspect | Why |
|---|---|---|---|
| **Battlers / character portraits** | 512×512 | 1:1 | Already the standard, 920 files match |
| **Badges** | 512×512 | 1:1 | Already the standard, 120 files match |
| **League logos** | 512×512 | 1:1 | Already the standard, 152 files match |
| **City / venue backgrounds** | **640×360** | 16:9 | Raw venue source is 3168×1344 (2.36 — cinematic). 16:9 keeps it close, matches modern card layouts, and lets us reuse for hero banners |
| **Crowd reaction tiles** | **256×256** | 1:1 | They stack horizontally with overlap — square stacking is clean. Variable aspects look broken |
| **Stage backdrops (battle stage)** | **1280×720** | 16:9 | Hero backgrounds for live battle viewer / battle pages |
| **Life event scenes** | **640×480** or **640×360** | 4:3 or 16:9 | Pick based on if you want comic-panel feel (4:3) or cinematic (16:9) |

**Transparent background**: Crowd, badges, character portraits, life-event characters → YES. Backgrounds (cities, stage) → NO (they ARE the background).

## PixelLab API — what you can actually do

### Endpoint cheat sheet (REST, base `https://api.pixellab.ai/v2`)

| Endpoint | Purpose | Size limits | Notes |
|---|---|---|---|
| `/generate-image-v2` | Single image with optional style ref | 16–792 × 16–688 | **Main workhorse** |
| `/generate-with-style-v2` | Style match using 1–4 reference images (Pro) | 16–512 × 16–512 | Better consistency, multi-ref blending |
| `/create-image-pixflux` | No style ref, fast | 16–400 × 16–400 | Quicker but less consistent |
| `/edit-image`, `/edit-images-v2` | Modify existing image | — | Batch up to 16 |
| `/inpaint-v3` | Mask-based fill (context-aware) | — | Fix small areas without regen |
| `/remove-background` | Strip background from existing PNG | up to 400×400 | Clean old chroma-green sprites in bulk |
| `/resize` | Intelligent pixel-art upscale | 16–200 in/out | Preserves pixel grid |
| `/rotate`, `/generate-8-rotations-v3` | Pose / direction variations | — | For character sheets |
| `/animate-with-text` (v2/v3) | Generate animation frames | 32–256 | If you need walk/idle cycles later |
| `/interpolation-v2` | Tween between two keyframes | — | For smooth animation |
| `/objects` + `/select-frames` | Generate-then-review object workflow | — | Picks best frame from batch |
| `/background-jobs/{id}` | Poll async result | — | Returns `last_response.images[0].base64` |
| `/balance` | Account credit check | — | Free on subscription |

### Body schema for `/generate-image-v2`

```json
{
  "description": "battle rap crowd member portrait, cheering hype with both arms up, urban hip-hop diversity, pixel art bust",
  "image_size": { "width": 256, "height": 256 },
  "no_background": true,                              // ← NEW: skip chroma green entirely
  "style_image": {
    "image": { "type": "base64", "base64": "...", "format": "png" },
    "size": { "width": 2752, "height": 1536 }
  },
  "style_options": {
    "color_palette": true,
    "outline": true,
    "detail": true,
    "shading": true
  }
}
```

### Body schema for `/generate-with-style-v2` (multi-reference, Pro)

```json
{
  "description": "...",
  "image_size": { "width": 256, "height": 256 },
  "no_background": true,
  "style_images": [
    { "image": { "type": "base64", "base64": "...", "format": "png" }, "size": { "width": W, "height": H } },
    { "image": { "type": "base64", "base64": "...", "format": "png" }, "size": { "width": W, "height": H } }
  ],
  "style_description": "consistent chunky pixel art, single black outline, vibrant hip-hop palette"
}
```

Pass 2–4 style images for best consistency. Mix angle/expression/lighting variants of the same style to nail the look.

### Key flags

- **`no_background: true`** — output is transparent PNG. Use for crowd, characters, badges, life-event sprites. **Skips the entire chroma-green removal pipeline.**
- **`style_options`** — turn all four ON (`color_palette`, `outline`, `detail`, `shading`) to closely match a single reference. Turn one OFF for more creative variation.
- **`style_description`** — optional text describing the visual style. Use when style references alone aren't enough.

## Reference images — what to pass

The single most important rule: **use existing sprites as style references for new generations**. Without it, output drifts off-style after a few generations.

Best references by asset type (paths from project root):

| Generating | Style reference candidates |
|---|---|
| New crowd reaction | `raw images/crowd/image_1764197014144.png` (the canonical full sheet) |
| New battler portrait | `raw images/battlers/image_1764146494580.png` or any sheet with the look you want |
| New badge | `raw images/badges/image_1764193675435.png` |
| New league logo | `raw images/leagues/image_1764195526092.png` |
| New venue/city | `raw images/venue/image_1764378969538.png` (3168×1344 cinematic) |
| New life event scene | `raw images/life/image_1765436470688.png` |

Using `/generate-with-style-v2`, pass 2–4 of these instead of just 1.

## Current scripts (working)

- `scripts/pixellab-gen.mjs` — single-image generator with optional style ref
- `scripts/pixellab-batch-crowd.mjs` — parallel batch of 10 crowd reactions

### Quick CLI command

```bash
node scripts/pixellab-gen.mjs \
  "battle rap crowd member, shocked oh-shit reaction, hand to mouth, pixel art bust" \
  ai-battlerap/public/sprites/crowd/new/shocked-001.png \
  256 256 \
  "raw images/crowd/image_1764197014144.png"
```

The 5th arg (style ref) is mandatory for style continuity — never skip it.

## Re-canvas script (for existing assets)

To bring existing **cities** to a uniform 640×360 16:9:

```bash
node scripts/standardize-cities.mjs  # script not yet written
```

This should: load each PNG, scale to fit 640×360, pad with `object-cover` semantics (crop excess), save back. Use `sharp` (already in deps).

To bring existing **crowd** to a uniform 256×256 square:

```bash
node scripts/standardize-crowd.mjs   # script not yet written
```

Pad to square with transparent background.

These two scripts haven't been written yet. Write them before regenerating from scratch — most of what you have is usable, just needs canvas normalization.

## MCP server (optional)

PixelLab also offers an MCP server at `https://api.pixellab.ai/mcp/docs`. Exposes higher-level tools like `create_character` (with 4/8 direction variations), `create_topdown_tileset`, `animate_character`, etc. **Does NOT expose raw `/generate-image-v2`** — use direct REST for arbitrary sprites. Useful if you want pose/rotation sets for battler animations later.

## Cost

$0 per image on current subscription tier (verified via response `usage.usd: 0.0`). Concurrency limit: **8 parallel jobs**. Above that returns HTTP 429 — just retry.

## When NOT to use PixelLab

- Photoreal renders → ad-lab project, not this game
- Smooth gradients → PixelLab is pixel-step only
- Final touch-ups → use Photoshop / sharp / hand edit
