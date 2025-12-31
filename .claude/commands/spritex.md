# Sprite Extraction Tool (claude-spritex)

Extract individual sprites from sprite sheet images with background removal and normalization.

## Tool Location
`ai-battlerap/tools/claude-spritex/`

## Basic Usage

```bash
cd ai-battlerap/tools/claude-spritex
node dist/cli.js extract "<input_pattern>" -o "<output_dir>" [options]
```

## Common Commands

### Extract with chroma green background
```bash
node dist/cli.js extract "path/to/*.png" -o "./output" -t characters --chroma-green --tolerance 80 --trim-grid 10 --remove-dark-lines --prefix battler
```

### Extract with per-sheet folders (for debugging)
```bash
node dist/cli.js extract "path/to/*.png" -o "./output" -t characters --chroma-green --per-sheet --prefix sprite
```

### Analyze sheets to detect grid sizes
```bash
node dist/cli.js analyze "path/to/*.png" --output-config config.json
```

### Extract using config file (for sheets with different grid sizes)
```bash
node dist/cli.js extract "path/to/*.png" --config config.json -o "./output" -t characters --chroma-green
```

## Key Options

| Option | Description |
|--------|-------------|
| `-o, --output <dir>` | Output directory |
| `-t, --type <type>` | Asset type subfolder (e.g., "characters") |
| `-r, --rows <n>` | Number of rows in grid |
| `--cols <n>` | Number of columns in grid |
| `--chroma-green` | Use chroma key green (#00FF00) as background |
| `--tolerance <n>` | Color tolerance 0-255 (default: 15, use 80 for chroma green) |
| `--trim-grid <px>` | Trim pixels from cell edges to remove grid lines |
| `--remove-dark-lines` | Remove dark grid lines from sprites |
| `--per-sheet` | Organize output into folders by source sheet name |
| `--offset-x <px>` | X offset to shift grid starting position |
| `--target-size <px>` | Target canvas size (default: 512) |
| `--prefix <name>` | Filename prefix (default: "sprite") |
| `--config <file>` | Use per-sheet config file for grid settings |
| `--verbose` | Show detailed output |
| `--dry-run` | Preview without saving |

## Workflow for New Sprite Sheets

1. **Analyze sheets to detect grid sizes:**
   ```bash
   node dist/cli.js analyze "path/to/sheets/*.png" --output-config detected-config.json
   ```

2. **Review and adjust config if needed** (some sheets may need manual grid corrections)

3. **Extract with per-sheet folders to identify problems:**
   ```bash
   node dist/cli.js extract "path/to/sheets/*.png" --config detected-config.json -o "./test-output" --per-sheet --chroma-green --trim-grid 10
   ```

4. **Review results, identify problem sheets**

5. **Final extraction:**
   ```bash
   node dist/cli.js extract "path/to/sheets/*.png" --config detected-config.json -o "./sprites" -t characters --chroma-green --trim-grid 10 --remove-dark-lines --prefix battler
   ```

## Troubleshooting

### Sprites show two characters with dark line between them
- The source sheet has dark borders that misalign grid calculations
- Options:
  1. Re-export sheet without dark borders (just green background)
  2. Try larger `--trim-grid` value (40-60)
  3. Use `--offset-x` to shift grid alignment

### Green edges remaining on sprites
- Increase `--tolerance` (try 80-100)
- The `--remove-dark-lines` option helps clean edges

### Characters cut off
- Wrong grid size detected - check row/column count
- Use `--per-sheet` to see which sheets have issues
- Manually specify `-r` and `--cols` for problem sheets

## Manual Mode (for problem sheets)

For sheets where auto-extraction fails, use manual crop mode:

### Single crop from command line:
```bash
node dist/cli.js manual "path/to/sheet.png" -o "./output" \
  --crop "100,50,344,307" --crop "450,50,344,307" \
  --chroma-green --prefix battler
```

### Multiple crops from JSON file:
Create a `crops.json`:
```json
[
  {"x": 100, "y": 50, "width": 344, "height": 307, "name": "char_01"},
  {"x": 450, "y": 50, "width": 344, "height": 307, "name": "char_02"},
  {"x": 800, "y": 50, "width": 344, "height": 307}
]
```

Then run:
```bash
node dist/cli.js manual "path/to/sheet.png" -o "./output" \
  --crops crops.json --chroma-green -v
```

### Manual mode options:
| Option | Description |
|--------|-------------|
| `--crop "x,y,w,h"` | Single crop region (repeatable) |
| `--crops <file>` | JSON file with crop regions |
| `--chroma-green` | Use green background removal |
| `--tolerance <n>` | Color tolerance (default: 80) |
| `--target-size <px>` | Output size (default: 512) |
| `--prefix <name>` | Filename prefix |

### Cell dimensions reference:
- **Source cell size**: 344×307px (aspect ratio ~1.12:1)
- **Output size**: 512×512px (normalized, centered)

## Output Structure

Default:
```
output/
  characters/
    sprite_001.png
    sprite_002.png
    ...
```

With `--per-sheet`:
```
output/
  characters/
    sheet_name_1/
      sprite_001.png
      ...
    sheet_name_2/
      sprite_001.png
      ...
```
