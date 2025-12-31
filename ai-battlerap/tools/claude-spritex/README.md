# claude-spritex

A CLI tool for extracting individual sprites from sprite sheet images.

## Features

- **Grid Detection**: Auto-detect or manually specify grid dimensions
- **Background Removal**: Remove white/colored backgrounds with flood-fill and tolerance
- **Content Trimming**: Trim transparent edges without cutting content
- **Canvas Normalization**: Center sprites on consistent canvas size (512x512)
- **Metadata Generation**: JSON metadata with extraction info
- **Batch Processing**: Process multiple sprite sheets at once

## Installation

```bash
cd tools/claude-spritex
npm install
npm run build
```

## Usage

### Basic Extraction

```bash
# Extract sprites from a single file
npx spritex extract "input.png" -o ./output

# With verbose output
npx spritex extract "input.png" -o ./output -v
```

### With Options

```bash
npx spritex extract "input.png" \
  --output ./public/sprites/characters \
  --type characters \
  --rows 4 \
  --cols 8 \
  --target-size 512 \
  --tolerance 15 \
  --prefix battler
```

### Batch Processing

```bash
# Process all PNG files in a folder
npx spritex extract "raw images/*.png" -o ./output --type characters
```

### Get Info About a Sprite Sheet

```bash
npx spritex info "input.png"
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `-o, --output` | required | Output directory |
| `-t, --type` | characters | Asset type (characters/badges/venues/custom) |
| `-c, --category` | - | Category subfolder |
| `-r, --rows` | auto | Number of rows in grid |
| `--cols` | auto | Number of columns in grid |
| `--bg-color` | #FFFFFF | Background color to remove (hex) |
| `--tolerance` | 15 | Color tolerance (0-255) |
| `--target-size` | 512 | Output canvas size in pixels |
| `--padding` | 20 | Padding around sprite content |
| `--prefix` | sprite | Filename prefix |
| `--start-index` | 1 | Starting index for filenames |
| `--no-metadata` | false | Skip metadata.json generation |
| `--dry-run` | false | Preview without saving |
| `-v, --verbose` | false | Verbose output |

## Output Structure

```
output/
├── characters/
│   ├── battler_001.png
│   ├── battler_002.png
│   ├── ...
│   └── metadata.json
└── master_metadata.json
```

## Metadata Format

### Per-extraction metadata (`metadata.json`)

```json
{
  "version": "1.0.0",
  "extractedAt": "2025-11-25T...",
  "source": {
    "filename": "input.png",
    "dimensions": { "width": 1024, "height": 512 },
    "grid": { "rows": 4, "columns": 8, "cellWidth": 128, "cellHeight": 128 }
  },
  "settings": {
    "backgroundColor": "#FFFFFF",
    "tolerance": 15,
    "targetSize": 512,
    "padding": 20
  },
  "sprites": [
    {
      "filename": "battler_001.png",
      "index": 1,
      "gridPosition": { "row": 0, "column": 0 },
      "contentBounds": { "top": 10, "left": 15, "width": 100, "height": 120 }
    }
  ],
  "stats": {
    "totalCells": 32,
    "successfulExtractions": 30,
    "emptySlots": 2,
    "processingTimeMs": 1500
  }
}
```

## Programmatic Usage

```typescript
import { SpriteExtractor, createDefaultOptions } from 'claude-spritex';

const options = createDefaultOptions('input.png', './output');
options.rows = 4;
options.columns = 8;
options.targetSize = 512;

const extractor = new SpriteExtractor(options);
const result = await extractor.extract();

if (result.success) {
  console.log(`Extracted ${result.metadata?.stats.successfulExtractions} sprites`);
}
```

## Pipeline

```
Input PNG
    │
    ▼
┌─────────────────┐
│  Grid Detector  │ → Detect/validate grid dimensions
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Sprite Slicer  │ → Extract each cell
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Background Rem. │ → White → Transparent
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Content Trimmer │ → Remove excess whitespace
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Canvas Normal.  │ → Center on 512x512
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Output Organizer│ → Save + metadata
└─────────────────┘
```

## Requirements

- Node.js 18+
- Windows/macOS/Linux

## License

MIT
