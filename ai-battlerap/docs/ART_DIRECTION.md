# Art Direction — Battle Rap University

**Date:** 2026-05-20
**Reference point:** Existing art assets in `raw images/` and `ai-battlerap/public/sprites/`
**Core rule:** New art must blend with existing art. Style continuity matters more than novelty.

## TL;DR for future-Claude and future-you

The game already has **1,632 sprite assets** in a coherent pixel-art style. New generations should:

1. **Always pass an existing sprite as `style_image`** to PixelLab's `/generate-image-v2` endpoint. Output without a style reference looks *similar* but not *identical* — you can tell the difference side-by-side.
2. **Use the same canvas size** (64×64 for bust portraits) and the same chroma-green background convention.
3. **Use diverse subject prompts** (urban hip-hop characters, varied skin tones, varied genders, varied ages) — the existing crowd sheet shows the range.

## Existing asset inventory

| Asset type | Source sheets | Sliced sprites | Location |
|---|---:|---:|---|
| Battlers (character portraits) | 25 | **920** | `ai-battlerap/public/sprites/characters/image_*/sprite_*.png` |
| Badges (perks/traits) | 3 | **120** | `ai-battlerap/public/sprites/badges/characters/image_*/` |
| League logos | 8 | **152** | `ai-battlerap/public/sprites/leagues/characters/image_*/` |
| Crowd reactions | 11 | **440** | `ai-battlerap/public/sprites/crowd/original/image_*/` |
| Crowd organized (by race) | — | 123 | `ai-battlerap/public/sprites/crowd/organized/{black,white,mixed}/` |
| Source PNGs (raw) | 11 + 25 | — | `raw images/crowd/`, `raw images/battlers/` |
| Backdrops, venues, life events, secrets, mockups | several | many | `raw images/{crowdbackdrop,venue,life,secrets,mockups}/` |

See `ai-battlerap/public/sprites/NAMING_GUIDE.md` for the badge/league name mapping.
See `ai-battlerap/public/sprites/CROWD_CATEGORIZATION.md` for crowd taxonomy.

## Visual style guide

### Crowd reactor portraits (the gold standard)

Reference file: `raw images/crowd/image_1764197014144.png` (and the 10 other sheets in that folder).

Each sheet is a **multi-character grid** of head-and-shoulders busts:
- **Canvas:** ~64×64 per character (sheets are 2752×1536, packing 45+ characters)
- **Background:** Bright lime-green chroma key (`#00FF40` ish) for clean alpha extraction later
- **Style:** Chunky pixel art, ~3-4 pixels per facial feature, single-color black outlines
- **Subjects:** Highly diverse — Black, white, Asian, Latino characters, varied genders, varied ages, varied hair (twists, fades, locs, curls, hijabs, baseball caps, durags, snapbacks)
- **Expressions:** Strong, readable reactions (shocked, hype, laughing, disappointed, thinking, filming, arguing)
- **Lighting:** Flat with single-source shading — no dramatic chiaroscuro
- **Detail level:** *Low-medium* — readable at thumbnail size, no over-rendered eye highlights or skin texture

### What NOT to generate

- ❌ Photorealistic or anime portraits
- ❌ Anything with smooth gradients (must be pixel-stepped)
- ❌ Faded/desaturated palettes
- ❌ Single-character "hero shot" art when the slot is a crowd reactor
- ❌ Transparent backgrounds (the chroma green is the chroma key — keep it)
- ❌ Characters who look like generic stock photos — keep them culturally specific to battle rap/hip-hop

### Battler portrait style

Same general approach as crowd reactors, but:
- More distinctive characters (each battler is a unique persona)
- More personality in expression (stoic, smug, intense, manic)
- More wardrobe variety (chains, hoodies, custom tees, hats)

## How to generate new art

### Quick command

```bash
node scripts/pixellab-gen.mjs \
  "<description with diverse subject + clear expression>" \
  <output-path.png> \
  64 64 \
  "raw images/crowd/image_1764197014144.png"
```

The 5th argument (style reference) is what makes the output match. **Always pass it.**

### Batch generation

```bash
node scripts/pixellab-batch-crowd.mjs
```

This generates 10 emotional reactions in parallel (PixelLab Tier 1 limit = 8 concurrent jobs, so 9th gets 429-rate-limited — just retry the failures).

### Prompt template

```
battle rap crowd member portrait, <expression detail>, urban hip-hop diversity,
vibrant colors, bright green chroma background, pixel art bust
```

Key prompt ingredients:
- **Always specify:** "pixel art", "bust" or "portrait", "chroma green background"
- **Be specific about expression:** Not just "happy" but "cheering hype, both arms up, mouth wide open yelling"
- **Encourage diversity:** "urban hip-hop diversity" tends to vary subjects across generations

### Endpoint and cost

- Endpoint: `POST https://api.pixellab.ai/v2/generate-image-v2`
- Body: `{ description, image_size: {width, height}, style_image: {image, size}, style_options: { color_palette, outline, detail, shading } }`
- Async only — returns `job_id`, poll `/background-jobs/{id}` until `status === 'completed'`
- Result: `last_response.images[0].base64`
- Cost: $0 per image on current subscription tier (verified — `usage.usd` returns `0.0`)
- Concurrency limit: 8 jobs in flight at once (Tier 1)

### Style options that worked

```js
style_options: {
  color_palette: true,  // Match the reference palette
  outline: true,        // Match outline weight
  detail: true,         // Match detail density
  shading: true,        // Match shading style
}
```

All four enabled = closest match to reference. Test with one off at a time if you want more creative variation.

## Slot inventory — what's missing vs. what exists

### Battlers
- **920 sliced battler sprites** already exist. Likely overkill for current AI roster.
- If you need a *named* battler portrait, pick from existing sprites first.
- New battlers can be generated using one existing battler as the style ref, prompted with personality cues.

### Crowd reactions
- **440 sliced reactions** exist; only 123 organized. Big backlog of usable art.
- Priority for new gen: any *specific* reaction the game UI calls out that isn't covered (e.g., "filming on phone", "arguing with friend") — but check `CROWD_CATEGORIZATION.md` first.

### Badges
- **120 badges sliced and named.** Covers all 97 in the badge system + extras.
- No new gen needed for V1.

### League logos
- **152 sliced league logos.** More than the game has leagues (current schema: ~20).
- No new gen needed.

### Backdrops, venues, life events
- Source PNGs exist in `raw images/`. Slicing/organization status unclear — needs an audit before generating new.

## When to NOT use PixelLab

- When an existing sprite already fits → use it. The library is huge.
- When the user needs photo-realistic ad creative → that's the ad-lab project, not this game.
- When the style needed is *not* pixel art → PixelLab is pixel-specific. Use a different service.

## Files I created in this overnight pass

- `scripts/pixellab-gen.mjs` — single-image generator with optional style ref
- `scripts/pixellab-batch-crowd.mjs` — batch of 10 crowd reactions
- `ai-battlerap/public/sprites/samples/crowd-styled/` — first batch of style-matched samples
- `.env.pixellab.local` — gitignored API key store

Note: PixelLab MCP server is also installed (`mcp__pixellab__*` tools available in some sessions). The HTTP scripts are kept because they work cross-session without MCP setup.

## Outstanding decisions

1. **Where should sliced sprites be canonical?** Currently in `ai-battlerap/public/sprites/`. If we go with root-tree-is-canonical (see CODEBASE_DIVERGENCE_REPORT.md), this whole directory needs to move.
2. **Should we generate full battler portrait sets** (poses: idle, talking, hype, sad) instead of one per battler? Cost is free on subscription; risk is generating thousands of unused frames.
3. **Should we move to `sharp` for image processing** (resizing reference to match `size` field exactly)? Currently we send full-resolution refs (2752×1536 source) which works but transfers ~3-4MB per request. Resizing to 256×256 first would be faster.
