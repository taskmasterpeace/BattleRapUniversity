# Missing Sprites & AI Generation Prompts

**Analysis Date**: 2025-12-01
**Purpose**: Identify assets needed for battle visualization system

---

## Current Inventory ✅

| Asset Type | Count | Dimensions | Status |
|------------|-------|------------|--------|
| Battler Characters | 920 | 512x512 | ✅ Complete |
| Badges | 120 | 512x512 | ✅ Complete |
| Crowd Reactions | 136+ | ~291x286 | ✅ Organized by reaction |
| League Logos | 152 | 512x512 | ✅ Complete |
| City Backgrounds | 84 | 396x336 | ✅ 32 cities, 3 time variants |

---

## Missing Sprites for Battle Visualization

### 🎯 CRITICAL - Battle UI Elements

These are ESSENTIAL for the battle screen to function:

#### 1. **Round Indicators** (3 sprites needed)
**Purpose**: Visual banner showing "ROUND 1", "ROUND 2", "ROUND 3"

**Specifications:**
- **Dimensions**: 800 x 150 pixels (wide banner)
- **Format**: PNG with transparent background (RGBA)
- **Style**: Bold, gritty, battle rap aesthetic
- **Text**: "ROUND 1", "ROUND 2", "ROUND 3" (three separate files)
- **Colors**: Orange/black theme matching existing UI

**AI Generation Prompts:**

```
Prompt 1 (ROUND 1):
"Create a bold battle rap style graphic banner with the text 'ROUND 1' in a gritty, aggressive font. Dark background with orange accents. Transparent PNG. Urban street style, graffiti-inspired, high contrast. 800x150 pixels, transparent background."

Prompt 2 (ROUND 2):
"Create a bold battle rap style graphic banner with the text 'ROUND 2' in a gritty, aggressive font. Dark background with orange accents. Transparent PNG. Urban street style, graffiti-inspired, high contrast. 800x150 pixels, transparent background."

Prompt 3 (ROUND 3):
"Create a bold battle rap style graphic banner with the text 'ROUND 3' in a gritty, aggressive font. Dark background with orange accents. Transparent PNG. Urban street style, graffiti-inspired, high contrast. 800x150 pixels, transparent background."
```

**File Naming:**
- `round-indicator-1.png`
- `round-indicator-2.png`
- `round-indicator-3.png`

**Location**: `public/sprites/ui/round-indicators/`

---

#### 2. **Segment Progress Bar Background** (2 sprites needed)
**Purpose**: Visual container for 4-segment (Small Room) and 6-segment (Main Stage) progress bars

**Specifications:**
- **Dimensions**: 600 x 80 pixels (horizontal bar)
- **Format**: PNG with transparent background
- **Variants**: 4-segment (Small Room), 6-segment (Main Stage)
- **Style**: Segmented bar with dividers, industrial/metal look

**AI Generation Prompts:**

```
Prompt 1 (4-segment):
"Create a horizontal progress bar frame divided into 4 equal segments. Industrial metallic style with orange accents. Each segment separated by a vertical divider line. Transparent background PNG. 600x80 pixels. Battle rap aesthetic, gritty urban style."

Prompt 2 (6-segment):
"Create a horizontal progress bar frame divided into 6 equal segments. Industrial metallic style with orange accents. Each segment separated by a vertical divider line. Transparent background PNG. 600x80 pixels. Battle rap aesthetic, gritty urban style."
```

**File Naming:**
- `segment-bar-4.png` (Small Room Circuit)
- `segment-bar-6.png` (Main Stage Arena)

**Location**: `public/sprites/ui/segment-bars/`

---

#### 3. **Versus Screen Graphic** (1 sprite needed)
**Purpose**: "VS" graphic displayed between battler profiles before battle starts

**Specifications:**
- **Dimensions**: 300 x 300 pixels (square)
- **Format**: PNG with transparent background
- **Style**: Bold "VS" text, explosive/aggressive

**AI Generation Prompt:**

```
"Create a bold 'VS' battle graphic in orange and black. Explosive, aggressive style with impact lines radiating from center. Transparent background PNG. Battle rap aesthetic, street style, high contrast. 300x300 pixels."
```

**File Naming**: `vs-graphic.png`

**Location**: `public/sprites/ui/versus/`

---

#### 4. **Score Display Frames** (2 sprites needed)
**Purpose**: Decorative frames around battler scores during rounds

**Specifications:**
- **Dimensions**: 250 x 120 pixels (horizontal rectangle)
- **Format**: PNG with transparent background
- **Variants**: Player frame (orange accent), Opponent frame (red accent)
- **Style**: Industrial/metal border with battle rap flair

**AI Generation Prompts:**

```
Prompt 1 (Player Frame - Orange):
"Create a decorative score frame border with orange accents. Industrial metallic style, battle rap aesthetic. Transparent background PNG. Frame should have gritty urban look. 250x120 pixels."

Prompt 2 (Opponent Frame - Red):
"Create a decorative score frame border with red accents. Industrial metallic style, battle rap aesthetic. Transparent background PNG. Frame should have gritty urban look. 250x120 pixels."
```

**File Naming:**
- `score-frame-player.png`
- `score-frame-opponent.png`

**Location**: `public/sprites/ui/score-frames/`

---

### ⚡ HIGH PRIORITY - Special Effects

These enhance the visual impact of key moments:

#### 5. **Haymaker Explosion** (3 variants)
**Purpose**: Visual effect when a battler lands a segment with score ≥ 8.5

**Specifications:**
- **Dimensions**: 512 x 512 pixels (square, centered on battler)
- **Format**: PNG with transparent background
- **Variants**: 3 different explosion styles (for variety)
- **Style**: Comic book style impact, orange/yellow/white colors

**AI Generation Prompts:**

```
Prompt 1 (Explosion Style 1):
"Create a comic book style explosion effect in orange, yellow, and white. Impact lines radiating outward, star burst pattern. Transparent background PNG. Dynamic, aggressive, high energy. 512x512 pixels."

Prompt 2 (Explosion Style 2):
"Create a comic book style impact burst with the word 'HAYMAKER!' in bold graffiti font. Orange and yellow explosion effect. Transparent background PNG. Street art style, high contrast. 512x512 pixels."

Prompt 3 (Explosion Style 3):
"Create a comic book pow/boom style effect in orange flames. Radiating energy lines, explosive impact. Transparent background PNG. Battle rap aesthetic, high energy. 512x512 pixels."
```

**File Naming:**
- `haymaker-explosion-1.png`
- `haymaker-explosion-2.png`
- `haymaker-explosion-3.png`

**Location**: `public/sprites/effects/haymaker/`

---

#### 6. **Choke Warning** (1 sprite)
**Purpose**: Visual indicator when a battler chokes during a segment

**Specifications:**
- **Dimensions**: 400 x 200 pixels (wide banner)
- **Format**: PNG with transparent background
- **Style**: Red/black, warning/caution aesthetic
- **Text**: "CHOKE!" or hazard symbol

**AI Generation Prompt:**

```
"Create a warning banner with the text 'CHOKE!' in bold red letters. Caution tape style, hazard warning aesthetic. Black background with red accents. Transparent PNG. Battle rap style, gritty urban look. 400x200 pixels."
```

**File Naming**: `choke-warning.png`

**Location**: `public/sprites/effects/choke/`

---

#### 7. **Stumble Indicator** (1 sprite)
**Purpose**: Subtle visual when battler stumbles (less severe than choke)

**Specifications:**
- **Dimensions**: 300 x 150 pixels
- **Format**: PNG with transparent background
- **Style**: Yellow/orange warning, less aggressive than choke
- **Text**: "STUMBLE" or "???" (confusion symbol)

**AI Generation Prompt:**

```
"Create a stumble/confusion indicator with question marks '???' in orange and yellow. Comic style, less aggressive than a warning. Transparent background PNG. Battle rap aesthetic. 300x150 pixels."
```

**File Naming**: `stumble-indicator.png`

**Location**: `public/sprites/effects/stumble/`

---

#### 8. **Crowd Reaction Burst** (3 variants)
**Purpose**: Visual effect overlaid on crowd when they react strongly

**Specifications:**
- **Dimensions**: 600 x 400 pixels (wide, covers crowd area)
- **Format**: PNG with transparent background, low opacity
- **Variants**: Positive (orange glow), Negative (red glow), Neutral (white/gray)
- **Style**: Energy wave, aura effect

**AI Generation Prompts:**

```
Prompt 1 (Positive Burst - Orange):
"Create an energy wave effect in glowing orange. Radial burst pattern, transparent PNG with low opacity. Positive energy, excitement vibe. 600x400 pixels."

Prompt 2 (Negative Burst - Red):
"Create an energy wave effect in glowing red. Radial burst pattern, transparent PNG with low opacity. Negative energy, booing vibe. 600x400 pixels."

Prompt 3 (Neutral Burst - White):
"Create an energy wave effect in glowing white/gray. Radial burst pattern, transparent PNG with low opacity. Neutral energy, anticipation vibe. 600x400 pixels."
```

**File Naming:**
- `crowd-burst-positive.png`
- `crowd-burst-negative.png`
- `crowd-burst-neutral.png`

**Location**: `public/sprites/effects/crowd-burst/`

---

### 🎭 MEDIUM PRIORITY - Battle Stage Elements

These create the "scene" where the battle takes place:

#### 9. **Battle Stage Platform** (2 variants)
**Purpose**: The stage/platform where battlers "stand" (foreground element)

**Specifications:**
- **Dimensions**: 1200 x 400 pixels (wide, lower portion of screen)
- **Format**: PNG with transparent background
- **Variants**: Small Room (intimate, simple), Main Stage (large, theatrical)
- **Style**: Stage floor with depth, visible edge/platform

**AI Generation Prompts:**

```
Prompt 1 (Small Room Stage):
"Create a simple battle rap stage platform viewed from front. Wooden floor, industrial look, intimate setting. Transparent background PNG. Lower portion of stage, show floor depth. 1200x400 pixels. Dark, gritty aesthetic."

Prompt 2 (Main Stage):
"Create a large theatrical battle rap stage platform viewed from front. Professional arena stage, spotlights visible. Transparent background PNG. Lower portion of stage, show floor depth. 1200x400 pixels. Dramatic lighting, big event feel."
```

**File Naming:**
- `stage-small-room.png`
- `stage-main-stage.png`

**Location**: `public/sprites/stage/platforms/`

---

#### 10. **Microphone Sprites** (4 variants)
**Purpose**: Mic held by battler or mic stand on stage

**Specifications:**
- **Dimensions**: 150 x 300 pixels (vertical, handheld mic)
- **Format**: PNG with transparent background
- **Variants**:
  - Handheld mic (left angle)
  - Handheld mic (right angle)
  - Mic stand (left side)
  - Mic stand (right side)
- **Style**: Realistic mic, classic battle rap mic (wired)

**AI Generation Prompts:**

```
Prompt 1 (Handheld Left):
"Create a wired microphone tilted at 45-degree angle to the left. Classic battle rap microphone, black body, silver mesh top. Transparent background PNG. Realistic style. 150x300 pixels."

Prompt 2 (Handheld Right):
"Create a wired microphone tilted at 45-degree angle to the right. Classic battle rap microphone, black body, silver mesh top. Transparent background PNG. Realistic style. 150x300 pixels."

Prompt 3 (Mic Stand Left):
"Create a microphone stand positioned on left side of stage. Classic battle rap setup, wired mic on boom stand. Transparent background PNG. Realistic style. 150x300 pixels."

Prompt 4 (Mic Stand Right):
"Create a microphone stand positioned on right side of stage. Classic battle rap setup, wired mic on boom stand. Transparent background PNG. Realistic style. 150x300 pixels."
```

**File Naming:**
- `mic-handheld-left.png`
- `mic-handheld-right.png`
- `mic-stand-left.png`
- `mic-stand-right.png`

**Location**: `public/sprites/stage/microphones/`

---

#### 11. **Stage Lighting Effects** (6 sprites)
**Purpose**: Spotlight and colored lighting overlays on stage

**Specifications:**
- **Dimensions**: 800 x 800 pixels (circular gradient, covers battler area)
- **Format**: PNG with transparent background, low opacity (~30%)
- **Variants**:
  - White spotlight (neutral)
  - Orange spotlight (player side)
  - Red spotlight (opponent side)
  - Blue spotlight (cold/tense moments)
  - Green spotlight (hype/energy)
  - Purple spotlight (dramatic)
- **Style**: Radial gradient, soft edge

**AI Generation Prompts:**

```
Prompt Template (repeat for each color):
"Create a circular spotlight effect in [COLOR]. Radial gradient from bright center to transparent edges. PNG with transparency. Subtle, realistic stage lighting. 800x800 pixels. Low opacity, meant to overlay on stage."

Colors: white, orange, red, blue, green, purple
```

**File Naming:**
- `spotlight-white.png`
- `spotlight-orange.png`
- `spotlight-red.png`
- `spotlight-blue.png`
- `spotlight-green.png`
- `spotlight-purple.png`

**Location**: `public/sprites/stage/lighting/`

---

#### 12. **Smoke/Haze Effect** (3 sprites)
**Purpose**: Atmospheric smoke/haze on stage for dramatic effect

**Specifications:**
- **Dimensions**: 1200 x 600 pixels (wide, covers lower stage area)
- **Format**: PNG with transparent background, low opacity (~20%)
- **Variants**: Light haze, Medium smoke, Heavy fog
- **Style**: Realistic smoke, drifting effect

**AI Generation Prompts:**

```
Prompt 1 (Light Haze):
"Create a subtle stage fog effect. Light haze drifting across stage floor. Transparent PNG with low opacity. Realistic smoke/fog. 1200x600 pixels. Atmospheric, subtle."

Prompt 2 (Medium Smoke):
"Create a medium stage smoke effect. Visible fog drifting across stage floor. Transparent PNG with low opacity. Realistic smoke/fog. 1200x600 pixels. Atmospheric, moderate density."

Prompt 3 (Heavy Fog):
"Create a heavy stage fog effect. Dense fog covering stage floor. Transparent PNG with low opacity. Realistic smoke/fog. 1200x600 pixels. Atmospheric, dramatic."
```

**File Naming:**
- `fog-light.png`
- `fog-medium.png`
- `fog-heavy.png`

**Location**: `public/sprites/stage/atmosphere/`

---

### 🎨 LOW PRIORITY - Polish & Enhancement

These are nice-to-have but not essential for V1:

#### 13. **Transition Wipes** (5 sprites)
**Purpose**: Animated transitions between rounds or scenes

**Specifications:**
- **Dimensions**: 1920 x 1080 pixels (fullscreen)
- **Format**: PNG sequence (3-5 frames per animation)
- **Variants**:
  - Horizontal wipe (left to right)
  - Vertical wipe (top to bottom)
  - Diagonal wipe
  - Circle expand
  - Fade overlay
- **Style**: Orange/black theme

**Note**: Could be CSS animations instead of sprites. Defer until needed.

---

#### 14. **Victory/Defeat Banners** (2 sprites)
**Purpose**: End-of-battle result display

**Specifications:**
- **Dimensions**: 1000 x 300 pixels (wide banner)
- **Format**: PNG with transparent background
- **Variants**: "VICTORY!" (orange/gold), "DEFEAT" (red/black)
- **Style**: Bold, dramatic, championship belt aesthetic

**AI Generation Prompts:**

```
Prompt 1 (Victory):
"Create a championship victory banner with the word 'VICTORY!' in bold gold letters. Trophy/belt aesthetic, triumphant style. Transparent background PNG. Battle rap theme, celebratory. 1000x300 pixels."

Prompt 2 (Defeat):
"Create a defeat banner with the word 'DEFEAT' in red letters. Somber style, battle lost aesthetic. Transparent background PNG. Battle rap theme, respectful but clear. 1000x300 pixels."
```

**File Naming:**
- `victory-banner.png`
- `defeat-banner.png`

**Location**: `public/sprites/ui/result-banners/`

---

#### 15. **Loading/Buffering Indicator** (1 sprite or animation)
**Purpose**: Show when battle is simulating or loading

**Specifications:**
- **Dimensions**: 200 x 200 pixels (square)
- **Format**: PNG or animated GIF/APNG
- **Style**: Spinning mic icon or orange loading spinner
- **Animation**: Rotate 360° continuously

**AI Generation Prompt:**

```
"Create a simple loading spinner icon in orange. Circular design with gap, modern minimal style. Transparent background PNG. Battle rap theme, clean design. 200x200 pixels."
```

**File Naming**: `loading-spinner.png`

**Location**: `public/sprites/ui/loading/`

---

## Summary of Missing Sprites

### By Priority:

**CRITICAL (Must-Have for V1):**
- ✅ Round Indicators (3)
- ✅ Segment Progress Bars (2)
- ✅ Versus Graphic (1)
- ✅ Score Display Frames (2)
- **Total: 8 sprites**

**HIGH PRIORITY (Strong Visual Impact):**
- ✅ Haymaker Explosion (3)
- ✅ Choke Warning (1)
- ✅ Stumble Indicator (1)
- ✅ Crowd Reaction Burst (3)
- **Total: 8 sprites**

**MEDIUM PRIORITY (Scene Building):**
- ✅ Battle Stage Platform (2)
- ✅ Microphone Sprites (4)
- ✅ Stage Lighting (6)
- ✅ Smoke/Haze (3)
- **Total: 15 sprites**

**LOW PRIORITY (Polish):**
- Transition Wipes (deferred - use CSS)
- Victory/Defeat Banners (2)
- Loading Spinner (1)
- **Total: 3 sprites (optional)**

---

## Total Missing Sprites: **34 sprites needed**

### Breakdown:
- **16 CRITICAL + HIGH** (must-have for functional battle visualization)
- **15 MEDIUM** (strongly recommended for immersive experience)
- **3 LOW** (nice-to-have polish)

---

## Quick Generation Checklist

### Phase 1 - Core UI (Start Here)
- [ ] round-indicator-1.png
- [ ] round-indicator-2.png
- [ ] round-indicator-3.png
- [ ] segment-bar-4.png
- [ ] segment-bar-6.png
- [ ] vs-graphic.png
- [ ] score-frame-player.png
- [ ] score-frame-opponent.png

### Phase 2 - Special Effects
- [ ] haymaker-explosion-1.png
- [ ] haymaker-explosion-2.png
- [ ] haymaker-explosion-3.png
- [ ] choke-warning.png
- [ ] stumble-indicator.png
- [ ] crowd-burst-positive.png
- [ ] crowd-burst-negative.png
- [ ] crowd-burst-neutral.png

### Phase 3 - Stage Elements
- [ ] stage-small-room.png
- [ ] stage-main-stage.png
- [ ] mic-handheld-left.png
- [ ] mic-handheld-right.png
- [ ] mic-stand-left.png
- [ ] mic-stand-right.png
- [ ] spotlight-white.png
- [ ] spotlight-orange.png
- [ ] spotlight-red.png
- [ ] spotlight-blue.png
- [ ] spotlight-green.png
- [ ] spotlight-purple.png
- [ ] fog-light.png
- [ ] fog-medium.png
- [ ] fog-heavy.png

### Phase 4 - Polish (Optional)
- [ ] victory-banner.png
- [ ] defeat-banner.png
- [ ] loading-spinner.png

---

## Folder Structure to Create

```
public/sprites/
├── ui/
│   ├── round-indicators/
│   ├── segment-bars/
│   ├── versus/
│   ├── score-frames/
│   ├── result-banners/
│   └── loading/
├── effects/
│   ├── haymaker/
│   ├── choke/
│   ├── stumble/
│   └── crowd-burst/
└── stage/
    ├── platforms/
    ├── microphones/
    ├── lighting/
    └── atmosphere/
```

---

## Notes

**Style Consistency:**
- All sprites should match existing dark theme (zinc-950, zinc-900)
- Orange (#f97316) as primary accent color
- Red for negative/warning elements
- High contrast for visibility
- Gritty, urban, street battle rap aesthetic
- Transparent backgrounds (RGBA PNG) for layering

**File Format:**
- All files: PNG format with RGBA (transparency support)
- Optimize file size after generation (use tools like TinyPNG)
- Verify dimensions match specifications exactly

**Testing:**
- Generate 1-2 sprites from each category first
- Test in battle visualization prototype
- Verify sizing, opacity, and layering work correctly
- Batch generate remaining sprites once style is confirmed

---

## AI Generation Tips

**For Midjourney/DALL-E:**
1. Always specify "transparent background PNG" in prompt
2. Add "high contrast" for UI elements
3. Specify exact dimensions
4. Use "--ar [ratio]" flag in Midjourney for aspect ratio control
5. Add "battle rap aesthetic, urban street style" for consistency

**For Stable Diffusion:**
1. Use "transparent background, alpha channel, PNG" in prompt
2. Add "professional icon design" for UI elements
3. Use ControlNet for exact positioning/dimensions
4. Add negative prompts: "text artifacts, watermark, signature"

**Post-Processing:**
1. Remove background if not transparent (use remove.bg or Photoshop)
2. Resize to exact dimensions in specs
3. Optimize file size (compress PNG)
4. Verify transparency works correctly

---

## Next Steps

1. ✅ Share this document with asset generation team/tools
2. Start with **Phase 1 (Core UI)** - 8 sprites
3. Test in battle visualization prototype
4. Generate **Phase 2 (Effects)** - 8 sprites
5. Build battle screen with Phase 1 + 2 assets
6. Generate **Phase 3 (Stage)** - 15 sprites
7. Polish and optimize
8. **Phase 4** only if time/budget allows
