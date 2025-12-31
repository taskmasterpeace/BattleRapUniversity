---
name: sprite-extraction
description: "Extract individual sprites from sprite sheet images. Use when splitting game tilesheets, extracting character portraits, processing sprite atlases, or organizing sprite collections for game development."
allowed-tools: Read, Glob, Grep, Bash
---

# Sprite Extraction

## Overview

This skill helps extract individual sprites from sprite sheet images using the `claude-spritex` CLI tool. It's designed for game asset preparation, particularly for extracting character portraits from grid-based sprite sheets.

## When to Use

- User wants to extract sprites from a sprite sheet
- User mentions "split sprites", "extract characters", "process tilesheet"
- User references the "raw images" folder
- User needs to prepare game assets from sprite sheets
- User wants to remove backgrounds from character images

## Tool Location

```
ai-battlerap/tools/claude-spritex/
```

## Setup (First Time)

```bash
cd ai-battlerap/tools/claude-spritex
npm install
npm run build
```

## Common Options

| Option | Default | Description |
|--------|---------|-------------|
| `-o, --output` | required | Output directory |
| `-t, --type` | characters | Asset type (characters/badges/venues) |
| `-r, --rows` | auto | Grid rows (auto-detect if not set) |
| `--cols` | auto | Grid columns (auto-detect if not set) |
| `--target-size` | 512 | Output sprite size (512x512) |
| `--tolerance` | 15 | Background color tolerance (use 80 for chroma green) |
| `--chroma-green` | false | Use chroma key green (#00FF00) as background |
| `--defringe` | false | Remove green fringe from sprite edges |
| `--per-sheet` | false | Organize output into folders by source sheet |
| `--prefix` | sprite | Filename prefix |
| `-v, --verbose` | false | Show detailed progress |

## Chroma Green Background Removal

For sprites with chroma key green (#00FF00) backgrounds:

```bash
node dist/cli.js extract "input.png" -o ./output --chroma-green --tolerance 80 --defringe
```

### The --defringe Option

When extracting sprites from green screen backgrounds, anti-aliased edge pixels often retain a green tint. The `--defringe` option removes this contamination:

- Detects edge pixels (adjacent to transparent areas)
- Removes pixels with strong green dominance (green > 20 over red/blue)
- Reduces green tint on remaining edge pixels
- Cleans up semi-transparent green artifacts

**Always use `--defringe` with `--chroma-green` for clean edges.**

### Post-Processing Already Extracted Sprites

If sprites were already extracted but have green fringe, defringe them with this script:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function removeGreenFringe(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const newData = Buffer.from(data);
  const getIdx = (x, y) => (y * width + x) * 4;
  const isTransparent = (x, y) =>
    x < 0 || x >= width || y < 0 || y >= height || newData[getIdx(x, y) + 3] === 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = getIdx(x, y);
      const r = newData[idx], g = newData[idx+1], b = newData[idx+2], a = newData[idx+3];
      if (a === 0) continue;
      let nearEdge = false;
      for (let dy = -1; dy <= 1 && !nearEdge; dy++)
        for (let dx = -1; dx <= 1 && !nearEdge; dx++)
          if ((dx || dy) && isTransparent(x+dx, y+dy)) nearEdge = true;
      const greenDom = g - Math.max(r, b);
      if (nearEdge) {
        if (greenDom > 20) newData[idx+3] = 0;
        else if (greenDom > 0) newData[idx+1] = Math.min(g, Math.max(r, b) + 10);
      } else if (greenDom > 60 && a < 250) newData[idx+3] = 0;
    }
  }
  await sharp(newData, { raw: { width, height, channels: 4 } }).png().toFile(outputPath);
}

// Batch process folder
async function defringeBatch(folderPath) {
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.png'));
  for (const file of files) {
    const p = path.join(folderPath, file);
    await removeGreenFringe(p, p);
    console.log('Defringed:', file);
  }
}

// Usage: defringeBatch('./sprites/crowd');
```

## Project-Specific Info

For Battle Rap University:
- Raw sprite sheets are in: `raw images/` folder (at project root)
- Output should go to: `ai-battlerap/public/sprites/`
- Asset counts: ~920 battlers, 120 badges, 152 leagues, 480 crowd sprites

## Example Workflow

1. Extract with auto-detection:
```bash
cd ai-battlerap/tools/claude-spritex
node dist/cli.js extract "../../raw\ images/image_file.png" \
  -o ../../public/sprites/characters \
  --type characters \
  --prefix battler \
  -v
```

2. Extract chroma green sprites with defringe:
```bash
node dist/cli.js extract "../../raw\ images/crowd/*.png" \
  -o ../../public/sprites/crowd \
  --chroma-green \
  --tolerance 80 \
  --defringe \
  --per-sheet \
  --prefix crowd
```

## Troubleshooting

### Green fringe around sprite edges
Add `--defringe` option when using `--chroma-green`. For already-extracted sprites, use the post-processing script above.

### Background not fully removed
Increase `--tolerance` (try 20-30 for gray backgrounds, 80 for chroma green).

### Embedded grid lines causing misalignment
Some sprite sheets have dark grid lines embedded in the image. May need custom extraction with detected grid line positions.
