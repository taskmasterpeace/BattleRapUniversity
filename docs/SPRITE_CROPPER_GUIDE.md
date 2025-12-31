# Sprite Cropper Tool Guide

A browser-based tool for extracting icons from sprite sheets with automatic background removal.

**Location:** `tools/sprite-cropper.html`

---

## Quick Start

1. Open the tool in Chrome or Edge (File System API works best in these browsers)
2. Load a sprite sheet image
3. Choose Grid or Manual mode
4. Adjust background color and tolerance
5. Click Extract
6. Save individual icons or Download All

---

## Features

### Two Extraction Modes

#### Grid Mode
Best for sprite sheets with uniform grid layouts.

| Control | Description |
|---------|-------------|
| **Preset** | Quick grid sizes: 1x1, 2x2, 3x3, 4x4, 16x16 |
| **Rows/Cols** | Custom grid dimensions |
| **Top Skip** | Pixels to skip from top (for headers/titles) |
| **Side Skip** | Pixels to skip from left/right edges |
| **Label Cut** | Pixels to remove from bottom of each cell (for text labels) |

#### Manual Mode
Best for irregular layouts or specific icon selection.

| Control | Description |
|---------|-------------|
| **Aspect Ratio** | Lock to 1:1, 16:9, 4:3, etc. or Free |
| **Output Size** | Scale output to 32px, 64px, 128px, 256px, 512px, or Original |
| **Clear All** | Remove all selection boxes |

**Manual Mode Actions:**
- **Draw:** Click and drag to create selection boxes
- **Move:** Click and drag existing boxes to reposition
- **Resize:** Drag corner handles to resize (respects aspect ratio lock)
- **Delete:** Click the X button on any selection

---

### Background Removal

The tool uses a flood-fill algorithm that removes background colors starting from the edges of each extracted region.

| Control | Description |
|---------|-------------|
| **BG Color** | Primary background color to remove |
| **Tolerance** | How similar a color must be to match (0-150) |

**Color Sampling:**
- **Left-click on image:** Sample that color as the background color
- **Right-click on image:** Add color to exclusion list (won't be removed)
- **Swatches:** Auto-sampled colors from image corners. Left-click to set as BG, right-click to exclude.

**Live Preview:** Semi-transparent overlay shows which pixels will be removed.

---

### Color Exclusion System

Sometimes the background color is similar to colors in your icon. Use exclusions to protect those colors:

1. **Right-click** on any color in the image you want to KEEP
2. The color appears in the "Keep" section with a checkmark
3. That color (within tolerance) will NOT be removed even if it matches background
4. Click an excluded color to remove the exclusion

---

### Save Options

| Control | Description |
|---------|-------------|
| **Prefix** | Text prepended to all filenames (e.g., "secret_") |
| **Save To** | Choose a folder for saving (uses Downloads if not set) |

**Saving:**
- **Individual Save:** Click "Save" under any extracted icon
- **Download All:** Save all extracted icons at once
- **Rename:** Edit the filename in each icon card before saving

---

## Browser Requirements

- **Chrome/Edge:** Full support including directory picker
- **Firefox:** Works but Save To directory picker not supported (uses Downloads)
- **Safari:** Partial support

**For best results:** Serve the file via a local server:
```bash
cd C:\git\battlerapuniversity\tools
npx serve .
```
Then open `http://localhost:3000/sprite-cropper.html`

---

## Workflow Examples

### Example 1: Life Event Icons (Grid)

1. Load `raw images/life/image_xxx.png`
2. Set Mode: **Grid**
3. Set Preset: **3x3**
4. Adjust **Top Skip**: ~80px (skip the header)
5. Adjust **Label Cut**: ~40px (remove text labels)
6. Click on the dark blue background to sample BG color
7. Set **Tolerance**: ~45
8. Click **Extract**
9. Rename icons to descriptive names
10. Click **Download All**

### Example 2: Single Icon (Manual)

1. Load your sprite sheet
2. Set Mode: **Manual**
3. Set **Aspect Ratio**: 1:1
4. Set **Output Size**: 128px
5. Draw a box around the icon you want
6. Adjust position by dragging, resize with corner handles
7. Click **Extract**
8. Click **Save** on the icon

### Example 3: Multiple Varied Icons (Manual)

1. Load sprite sheet
2. Set Mode: **Manual**
3. Draw boxes around each icon you need
4. Each box can be moved/resized independently
5. Click **Extract** to process all at once
6. Rename each icon
7. Click **Download All**

---

## Tips

1. **Start with higher tolerance** (~50-60), then reduce if too much is being removed
2. **Use exclusions** for icons with colors similar to background
3. **Check the preview** - semi-transparent areas will become transparent
4. **Grid mode auto-calculates** cell sizes from your rows/cols settings
5. **Manual mode selections persist** until you clear them
6. **Zoom your browser** for more precise manual selections on small icons

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Background not removing | Increase tolerance or sample the exact background color |
| Too much being removed | Decrease tolerance or exclude similar colors |
| Selection box too small | Must be at least 10x10 pixels |
| Can't select directory | Use Chrome/Edge, or serve via local server |
| Icons have jagged edges | Background color might be anti-aliased - try higher tolerance |
| Wrong aspect ratio | Make sure correct ratio is selected BEFORE drawing |
