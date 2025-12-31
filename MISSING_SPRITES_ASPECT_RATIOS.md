# Missing Sprites - AI Generation Guide (Aspect Ratios)

**Available Aspect Ratios**: 21:9, 1:1, 16:9, 9:16
**Focus**: Use ONLY these ratios for generation - resize to exact pixels later

---

## 📋 COMPLETE SPRITE LIST - 19 SPRITES TOTAL

### CRITICAL - Must Have (13 sprites)
1. Round Indicators (3) - 21:9 - "ROUND 1", "ROUND 2", "ROUND 3"
2. Segment Progress Bars (2) - 21:9 - 4-segment and 6-segment bars
3. VS Graphic (1) - 1:1 - "VS" between battlers
4. Score Frames (2) - 16:9 - Player (orange) and Opponent (red)
5. Haymaker Explosions (3) - 1:1 - Comic book burst effects
6. Choke Warning (1) - 21:9 - "CHOKE!" red banner
7. Stumble Indicator (1) - 21:9 - "???" confusion banner

### HIGH PRIORITY - Strong Impact (3 sprites)
8. Crowd Reaction Bursts (3) - 16:9 - Energy glows (positive/negative/neutral)

### OPTIONAL - Polish (3 sprites)
9. Victory/Defeat Banners (2) - 21:9 - End of battle results
10. Loading Spinner (1) - 1:1 - Buffering indicator

### ❌ NOT NEEDED (Removed)
- ~~Stage Platforms~~ - We have crowd sprites already
- ~~Fog Effects~~ - Not needed

---

## 🎯 CRITICAL - Battle UI Elements (Phase 1)

### 1. Round Indicators (3 sprites)
**Purpose**: "ROUND 1", "ROUND 2", "ROUND 3" banners

**Aspect Ratio**: **21:9** (ultra-wide banner)
**Style**: Bold, gritty battle rap text, orange/black theme
**Format**: PNG, transparent background

**Midjourney Prompts:**
```
"ROUND 1" bold graffiti text banner, battle rap style, gritty urban aesthetic, orange and black color scheme, transparent background, high contrast, street art inspired --ar 21:9 --v 6

"ROUND 2" bold graffiti text banner, battle rap style, gritty urban aesthetic, orange and black color scheme, transparent background, high contrast, street art inspired --ar 21:9 --v 6

"ROUND 3" bold graffiti text banner, battle rap style, gritty urban aesthetic, orange and black color scheme, transparent background, high contrast, street art inspired --ar 21:9 --v 6
```

**File Naming**: `round-indicator-1.png`, `round-indicator-2.png`, `round-indicator-3.png`

---

### 2. Segment Progress Bar Backgrounds (2 sprites)
**Purpose**: Visual containers for 4-segment and 6-segment progress tracking

**Aspect Ratio**: **21:9** (ultra-wide horizontal bar)
**Style**: Segmented industrial bar with dividers, metallic/tech look
**Format**: PNG, transparent background

**Midjourney Prompts:**
```
Industrial progress bar divided into 4 equal segments, metallic texture, orange accents, vertical divider lines between segments, battle rap aesthetic, transparent background, tech UI design --ar 21:9 --v 6

Industrial progress bar divided into 6 equal segments, metallic texture, orange accents, vertical divider lines between segments, battle rap aesthetic, transparent background, tech UI design --ar 21:9 --v 6
```

**File Naming**: `segment-bar-4.png`, `segment-bar-6.png`

---

### 3. Versus Graphic (1 sprite)
**Purpose**: "VS" between battler profiles

**Aspect Ratio**: **1:1** (square)
**Style**: Bold "VS" text, explosive/aggressive, high impact
**Format**: PNG, transparent background

**Midjourney Prompt:**
```
Bold "VS" battle graphic, explosive impact design, orange and black colors, battle rap aesthetic, aggressive typography, transparent background, high contrast, street style --ar 1:1 --v 6
```

**File Naming**: `vs-graphic.png`

---

### 4. Score Display Frames (2 sprites)
**Purpose**: Decorative frames around battler scores

**Aspect Ratio**: **16:9** (wide horizontal rectangle)
**Style**: Industrial border with battle rap flair
**Format**: PNG, transparent background
**Variants**: Player (orange), Opponent (red)

**Midjourney Prompts:**
```
Decorative score frame border with orange accents, industrial metallic style, battle rap aesthetic, gritty urban design, transparent background, empty center for text overlay --ar 16:9 --v 6

Decorative score frame border with red accents, industrial metallic style, battle rap aesthetic, gritty urban design, transparent background, empty center for text overlay --ar 16:9 --v 6
```

**File Naming**: `score-frame-player.png`, `score-frame-opponent.png`

---

## ⚡ HIGH PRIORITY - Special Effects (Phase 2)

### 5. Haymaker Explosions (3 variants)
**Purpose**: Visual burst when segment score ≥ 8.5

**Aspect Ratio**: **1:1** (square, centered on battler)
**Style**: Comic book explosion, orange/yellow/white
**Format**: PNG, transparent background

**Midjourney Prompts:**
```
Comic book style explosion burst, orange yellow white colors, radiating impact lines, star pattern, transparent background, high energy, dynamic action effect --ar 1:1 --v 6

Comic book POW burst with explosive impact, orange flames effect, radiating energy lines, street art style, transparent background, high contrast --ar 1:1 --v 6

Comic book boom explosion effect, orange and yellow fire burst, radiating shock waves, aggressive impact design, transparent background, battle aesthetic --ar 1:1 --v 6
```

**File Naming**: `haymaker-explosion-1.png`, `haymaker-explosion-2.png`, `haymaker-explosion-3.png`

---

### 6. Choke Warning (1 sprite)
**Purpose**: Visual indicator when battler chokes

**Aspect Ratio**: **21:9** (ultra-wide banner)
**Style**: Red/black warning, caution aesthetic
**Format**: PNG, transparent background

**Midjourney Prompt:**
```
"CHOKE!" warning banner in bold red letters, caution tape style, hazard warning aesthetic, black and red color scheme, battle rap style, gritty urban look, transparent background --ar 21:9 --v 6
```

**File Naming**: `choke-warning.png`

---

### 7. Stumble Indicator (1 sprite)
**Purpose**: Confusion symbol when battler stumbles

**Aspect Ratio**: **21:9** (ultra-wide banner)
**Style**: Yellow/orange, less aggressive than choke
**Format**: PNG, transparent background

**Midjourney Prompt:**
```
Question marks "???" confusion indicator, orange and yellow colors, comic book style, less aggressive warning, battle rap aesthetic, transparent background --ar 21:9 --v 6
```

**File Naming**: `stumble-indicator.png`

---

### 8. Crowd Reaction Bursts (3 variants)
**Purpose**: Energy glow overlaid on crowd during strong reactions

**Aspect Ratio**: **16:9** (wide horizontal, covers crowd area)
**Style**: Energy wave/aura effect, low opacity
**Format**: PNG, transparent background, 30-40% opacity
**Variants**: Positive (orange), Negative (red), Neutral (white)

**Midjourney Prompts:**
```
Energy wave burst effect in glowing orange, radial light pattern, transparent background with low opacity, positive excitement vibe, soft glow aura --ar 16:9 --v 6

Energy wave burst effect in glowing red, radial light pattern, transparent background with low opacity, negative booing vibe, intense red glow --ar 16:9 --v 6

Energy wave burst effect in glowing white gray, radial light pattern, transparent background with low opacity, neutral anticipation vibe, subtle glow --ar 16:9 --v 6
```

**File Naming**: `crowd-burst-positive.png`, `crowd-burst-negative.png`, `crowd-burst-neutral.png`

---

## 🎨 OPTIONAL - Polish (Phase 3)

### 9. Victory/Defeat Banners (2 sprites)
**Purpose**: End-of-battle result display

**Aspect Ratio**: **21:9** (ultra-wide banner)
**Style**: Bold championship aesthetic
**Format**: PNG, transparent background

**Midjourney Prompts:**
```
"VICTORY!" championship banner in bold gold letters, trophy belt aesthetic, triumphant celebratory style, transparent background, battle rap theme --ar 21:9 --v 6

"DEFEAT" banner in red letters, somber respectful style, battle lost aesthetic, transparent background, battle rap theme, clear messaging --ar 21:9 --v 6
```

**File Naming**: `victory-banner.png`, `defeat-banner.png`

---

### 10. Loading Spinner (1 sprite)
**Purpose**: Loading/buffering indicator

**Aspect Ratio**: **1:1** (square)
**Style**: Simple orange spinner icon
**Format**: PNG or animated PNG

**Midjourney Prompt:**
```
Simple loading spinner icon in orange, circular design with gap, modern minimal style, transparent background, battle rap theme, clean design --ar 1:1 --v 6
```

**File Naming**: `loading-spinner.png`

---

## Quick Reference - Aspect Ratios Summary

**Available Ratios**: 21:9 (ultra-wide), 1:1 (square), 16:9 (wide), 9:16 (vertical portrait)

| Sprite Type | Aspect Ratio | Use Case | Priority |
|-------------|--------------|----------|----------|
| Round Indicators (3) | **21:9** | Ultra-wide banners | CRITICAL |
| Segment Bars (2) | **21:9** | Ultra-wide progress bars | CRITICAL |
| VS Graphic (1) | **1:1** | Square icon | CRITICAL |
| Score Frames (2) | **16:9** | Wide horizontal frames | CRITICAL |
| Haymaker Explosions (3) | **1:1** | Square centered effects | CRITICAL |
| Choke Warning (1) | **21:9** | Ultra-wide warning banner | CRITICAL |
| Stumble Indicator (1) | **21:9** | Ultra-wide warning banner | CRITICAL |
| Crowd Bursts (3) | **16:9** | Wide horizontal overlays | HIGH |
| Victory/Defeat (2) | **21:9** | Ultra-wide banners | OPTIONAL |
| Loading Spinner (1) | **1:1** | Square icon | OPTIONAL |

**Total**: 19 sprites (13 critical, 3 high priority, 3 optional)

---

## Midjourney-Specific Tips

### Using Aspect Ratios (ONLY THESE 4)
```
--ar 21:9    (ultra-wide - for banners, bars, platforms)
--ar 1:1     (square - for icons, effects, VS graphic)
--ar 16:9    (wide - for frames, bursts, fog)
--ar 9:16    (vertical portrait - reserved for future use)
```

### Quality Settings
```
--v 6        (latest version, best quality)
--q 2        (double quality, slower but better)
--style raw  (less stylized, more literal)
```

### Useful Parameters
```
--no text artifacts, watermark, signature    (remove unwanted text)
--no background                              (ensure transparency)
```

---

## DALL-E 3 Prompts (Alternative)

If using DALL-E instead of Midjourney, add these to each prompt:

**Prefix**: "Vector graphic, clean design,"
**Suffix**: ", transparent background, high contrast, professional icon design"

**Example DALL-E Prompt**:
```
Vector graphic, clean design, bold "ROUND 1" battle rap style text banner, gritty urban aesthetic, orange and black color scheme, high contrast, street art inspired, transparent background, professional icon design, aspect ratio 16:3
```

---

## Stable Diffusion Prompts (Alternative)

If using Stable Diffusion, use these settings:

**Model**: SDXL or SD 1.5 with ControlNet
**LoRA**: Add "transparent background" LoRA if available

**Positive Prompt Template**:
```
(transparent background:1.4), (PNG alpha channel:1.3), [YOUR SPRITE DESCRIPTION], professional icon design, high contrast, battle rap aesthetic, orange and black theme, gritty urban style, 8k, highly detailed
```

**Negative Prompt**:
```
text artifacts, watermark, signature, low quality, blurry, jpeg artifacts, compression, solid background, white background
```

---

## Post-Generation Workflow

1. **Generate** at aspect ratio (Midjourney/DALL-E/SD)
2. **Remove background** if not transparent (use remove.bg or Photoshop)
3. **Resize** to target dimensions:
   - Critical UI: 512px or 1024px for one dimension
   - Effects: Match character sprite size (512x512)
   - Backgrounds: Match screen size or larger
4. **Optimize** file size (TinyPNG, ImageOptim)
5. **Test** in-game to verify layering and opacity
6. **Adjust** colors/contrast if needed

---

## Batch Generation Order

### Phase 1: Core UI (8 sprites) - START HERE
- [ ] 3x Round Indicators (21:9)
- [ ] 2x Segment Bars (21:9)
- [ ] 1x VS Graphic (1:1)
- [ ] 2x Score Frames (16:9)

### Phase 2: Effects (8 sprites) - CRITICAL FOR IMPACT
- [ ] 3x Haymaker Explosions (1:1)
- [ ] 1x Choke Warning (21:9)
- [ ] 1x Stumble Indicator (21:9)
- [ ] 3x Crowd Bursts (16:9)

### Phase 3: Polish (3 sprites) - OPTIONAL
- [ ] 2x Victory/Defeat Banners (21:9)
- [ ] 1x Loading Spinner (1:1)

**Total: 19 sprites** (16 critical, 3 optional)

---

## Example Generation Session (Midjourney)

**Session 1: Round Indicators**
```
/imagine "ROUND 1" bold graffiti text banner, battle rap style, gritty urban aesthetic, orange and black color scheme, transparent background, high contrast, street art inspired --ar 21:9 --v 6 --q 2

/imagine "ROUND 2" bold graffiti text banner, battle rap style, gritty urban aesthetic, orange and black color scheme, transparent background, high contrast, street art inspired --ar 21:9 --v 6 --q 2

/imagine "ROUND 3" bold graffiti text banner, battle rap style, gritty urban aesthetic, orange and black color scheme, transparent background, high contrast, street art inspired --ar 21:9 --v 6 --q 2
```

**Session 2: Haymakers**
```
/imagine Comic book style explosion burst, orange yellow white colors, radiating impact lines, star pattern, transparent background, high energy, dynamic action effect --ar 1:1 --v 6 --q 2

/imagine Comic book POW burst with explosive impact, orange flames effect, radiating energy lines, street art style, transparent background, high contrast --ar 1:1 --v 6 --q 2

/imagine Comic book boom explosion effect, orange and yellow fire burst, radiating shock waves, aggressive impact design, transparent background, battle aesthetic --ar 1:1 --v 6 --q 2
```

---

## Folder Structure

Create these folders before generating:

```
public/sprites/
├── ui/
│   ├── round-indicators/      (3 sprites - 21:9)
│   ├── segment-bars/           (2 sprites - 21:9)
│   ├── versus/                 (1 sprite - 1:1)
│   ├── score-frames/           (2 sprites - 16:9)
│   ├── result-banners/         (2 sprites - 21:9 - optional)
│   └── loading/                (1 sprite - 1:1 - optional)
└── effects/
    ├── haymaker/               (3 sprites - 1:1)
    ├── choke/                  (1 sprite - 21:9)
    ├── stumble/                (1 sprite - 21:9)
    └── crowd-burst/            (3 sprites - 16:9)
```

---

## Summary

**Total Sprites Needed**: **19 sprites**

**Breakdown by Priority:**
- **13 CRITICAL** (Phase 1 + Phase 2 core) - Must have for battles to work
- **3 HIGH PRIORITY** (Crowd bursts) - Strong visual impact
- **3 OPTIONAL** (Victory/defeat banners, loading spinner) - Nice-to-have polish

**Breakdown by Aspect Ratio:**
- **21:9 (ultra-wide)**: 9 sprites (round indicators, segment bars, choke, stumble, victory/defeat)
- **1:1 (square)**: 5 sprites (VS graphic, haymaker explosions, loading spinner)
- **16:9 (wide)**: 5 sprites (score frames, crowd bursts)
- **9:16 (vertical)**: 0 sprites (reserved for future use)

**What We Already Have:**
- ✅ 920 character sprites (512x512)
- ✅ 120 badge sprites (512x512)
- ✅ 136+ crowd reaction sprites (~291x286, organized by reaction type)
- ✅ 152 league logos (512x512)
- ✅ 84 city backgrounds (396x336)
- **16 Critical + High Priority** (Phase 1 + 2)
- **15 Medium Priority** (Phase 3)
- **3 Low Priority** (Phase 4 - optional)

**Focus on Aspect Ratios**:
- Very Wide Banners: 16:3, 10:3, 15:2
- Wide Elements: 5:2, 3:2, 2:1, 3:1
- Square: 1:1
- Vertical: 1:2

**Resize After Generation**: Target 512px-1024px for UI, 800px-1500px for backgrounds
**Always**: Transparent background (RGBA PNG)
**Style**: Orange/black theme, gritty urban battle rap aesthetic
