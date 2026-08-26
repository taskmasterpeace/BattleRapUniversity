# Canvas Sizes — Source of Truth

**Last updated:** 2026-05-20
**Authority:** This file. If anything else disagrees, this wins.

All new art **must** be generated at these exact dimensions. All existing art must be re-canvased to these dimensions.

## The table

| Asset type | Pixel size | Aspect | Transparent BG? | Style reference (from `raw images/`) |
|---|---|---|---|---|
| Battlers (character portraits) | **512×512** | 1:1 | YES | `battlers/image_1764146494580.png` |
| Badges | **512×512** | 1:1 | YES | `badges/image_1764193675435.png` |
| League logos | **512×512** | 1:1 | YES | `leagues/image_1764195526092.png` |
| Crowd reaction tiles | **256×256** | 1:1 | YES | `crowd/image_1764197014144.png` |
| City / venue backgrounds | **640×360** | 16:9 | NO | `venue/image_1764378969538.png` |
| Stage backdrops (battle stage) | **1280×720** | 16:9 | NO | `venue/image_1764378969538.png` |

## EVENT_ART (life events v2 — per `docs/design/LIFE_EVENTS_UI.md` §1.2)

Supersedes the old "Life event scenes 640×360" row. Two crops per subject:

| Asset type | Pixel size | Aspect | Notes |
|---|---|---|---|
| Event header (pop-up / decision-screen banner) | **640×256** (displayed at 1280×512) | 2.5:1 | **Safe zone: center 60%** — mobile crops via the registry `focal` column, so composition must survive a ~375×160 center-weighted crop. NO readable text ever (art can never smuggle bars). Style ref: `life/image_1765436470688.png` |
| Event thumb (inbox/list + interstitial chip) | **512×512** | 1:1 | Center-crop of the header's focal subject or its own composition. Same style ref |
| Event header, critical variant | **640×256** (displayed at 1280×512) | 2.5:1 | Same scene, harder grade (darker, red-shifted rim light, one destabilizing detail) |

**Generation cap (verified 2026-08-26):** PixelLab `/generate-image-v2` rejects width > **792px** (HTTP 422). Headers therefore GENERATE at 640×256 and DISPLAY at 2× via CSS `image-rendering: pixelated` — lossless for pixel art, smaller files, chunkier (better) pixels. Never upscale with smoothing.

**Cost law:** PixelLab `/generate-image-v2` with style reference = **$0 marginal on subscription** (well under the 1¢/image budget). Batch/offline only — the game never generates at runtime. Full asset bill + per-template launch set (12 templates × thumb+header) in `LIFE_EVENTS_UI.md` §1.2.1.

## Rules

1. **Always pass a style reference** to PixelLab's `/generate-image-v2` (5th arg in `pixellab-gen.mjs`). Without it, the output drifts off-style.
2. **Transparent backgrounds**: pass `no_background: true` to PixelLab. Skips chroma-green removal entirely. Confirmed working as of 2026-05-20.
3. **Never** generate at a non-listed size and hope it works. If a new asset type is needed, add a row here first.
4. **Standardize before regenerating.** Most existing assets just need re-canvas/padding, not a fresh PixelLab pass. Save your $0-per-image and your time.

## Quick CLI

```bash
node scripts/pixellab-gen.mjs \
  "<description>" \
  <output-path.png> \
  <width> <height> \
  "<path/to/style/reference.png>"
```

## Where assets live

- Sliced/finished: `ai-battlerap/public/sprites/{characters,badges,leagues,cities,crowd}/`
- Raw source sheets: `raw images/{battlers,badges,leagues,crowd,venue,life,...}/`
- Backup snapshot (2026-05-20): `D:/asset-backups/battlerapuniversity-2026-05-20/`

## Companion docs

- `ASSET_STANDARDS.md` — full PixelLab API cheat sheet (endpoints, body schemas, MCP info)
- `ART_DIRECTION.md` — visual style guide (palette, outline, detail level)
