# Gaming UI Redesign Plan - Algorithm Institute of BattleRap

## Current Status
- ✅ Landing page - Gaming aesthetic with tech borders
- ✅ Onboarding flow - Matching mockups (league/attributes/styles)
- ❌ Dashboard - Plain layout, no sprites
- ❌ Battle pages - Inconsistent styling
- ❌ All other pages - Need gaming UI

## Design System Specification

### Color Palette
```
Primary Background: #18191c (darkest)
Secondary Background: #24262b, #2d2f35
Card Background: #2d2f35
Border Default: #3a3d44, #zinc-700
Border Hover: #zinc-600
Accent Orange: #ff8c42 (primary CTA)
Accent Orange Hover: #ff9d5c
Text Primary: #ffffff, text-zinc-100
Text Secondary: #zinc-400, #zinc-500
Text Tertiary: #zinc-600

Success: #22c55e (green-500)
Error: #ef4444 (red-500)
Warning: #f59e0b (amber-500)
Info: #3b82f6 (blue-500)
```

### Typography
```css
Headers: font-display font-black uppercase tracking-tight
Body: font-sans font-bold uppercase tracking-wide
Small Text: text-xs uppercase tracking-wide
Accent Numbers: font-display font-black text-[#ff8c42]
```

### Component Patterns

**Cards/Panels**:
```tsx
className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6"
```

**Primary Buttons**:
```tsx
className="bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider px-6 py-3 transition shadow-[0_0_20px_rgba(255,140,66,0.5)]"
```

**Secondary Buttons**:
```tsx
className="border-2 border-zinc-700 hover:border-zinc-600 text-white font-display font-black uppercase tracking-wider px-6 py-3 transition"
```

**Stats Display**:
```tsx
<div className="flex items-center gap-2">
  <span className="text-xs text-zinc-500 font-bold uppercase">Label:</span>
  <span className="text-xl font-display font-black text-[#ff8c42]">{value}</span>
</div>
```

**Progress Bars**:
```tsx
<div className="h-3 bg-[#18191c] border border-[#3a3d44]">
  <div className="h-full bg-gradient-to-r from-[#ff8c42] to-[#ff9d5c] transition-all" style={{width: `${percent}%`}} />
</div>
```

### Sprite System
- Character sprites: 96x96px pixel art
- Location: `/public/sprites/characters/`
- Render with `image-rendering: pixelated`
- Display in cards, battle results, vs screens

### Layout Patterns

**Page Container**:
```tsx
<div className="min-h-screen bg-[#18191c] text-zinc-100">
  <div className="max-w-7xl mx-auto px-6 py-8">
    {/* Content */}
  </div>
</div>
```

**Section Header**:
```tsx
<div className="mb-6">
  <h2 className="text-3xl font-display font-black uppercase tracking-tight text-white">Section Title</h2>
  <p className="text-sm text-zinc-500 uppercase tracking-wide">Subtitle</p>
</div>
```

**Grid Layouts**:
- 2-column for main content splits
- 3-column for attributes/stats
- Cards should use `gap-4` or `gap-6`

### Animation/Effects
- Hover glow on orange elements: `shadow-[0_0_20px_rgba(255,140,66,0.5)]`
- Border transitions: `transition-all duration-200`
- Scale on hover for CTAs: `hover:scale-105 transform`

---

## Implementation Roadmap

### Phase 1: Core Pages (Week 1) - HIGHEST PRIORITY
These pages are used most frequently and need redesign ASAP:

#### 1.1 Dashboard (`app/dashboard/page.tsx`)
**Current Issues**:
- No character sprites
- Plain card layouts
- Inconsistent spacing
- Missing gaming UI elements

**Redesign Plan**:
- [ ] Add large battler sprite at top (96x96 or 128x128)
- [ ] Stats cards with orange accents and borders
- [ ] "NEXT BATTLE" section with countdown timer
- [ ] Recent battles list with W/L indicators
- [ ] XP/Level progress bar
- [ ] Badge showcase section
- [ ] Match mockup: Financial dashboard panels with stats

**Components to Create**:
- `BattlerCard` - Display sprite, name, stats
- `StatCard` - Metric display with icon
- `BattleCountdown` - Timer to next battle
- `BadgeDisplay` - Earned badges grid

#### 1.2 Battle Offers (`app/battle/offers/page.tsx`)
**Current Issues**:
- Light theme (white background!)
- No opponent sprites
- Generic card design

**Redesign Plan**:
- [ ] Dark gaming background
- [ ] Opponent sprite preview in each offer
- [ ] VS matchup display (your sprite vs theirs)
- [ ] Orange "ACCEPT" buttons
- [ ] League/venue info with icons
- [ ] Payout/prize display prominently

#### 1.3 Battle Prep (`app/battle/[id]/prep/page.tsx`)
**Current Issues**:
- Calendar layout needs gaming aesthetic
- No visual feedback
- Missing prep type icons

**Redesign Plan**:
- [ ] Gaming-style calendar with date boxes
- [ ] Icons for prep types (📝 writing, 🎤 performance, 🔬 research)
- [ ] Daily focus selection with orange highlights
- [ ] Opponent info panel with sprite
- [ ] Countdown to battle
- [ ] Prep quality indicators

#### 1.4 Battle Results (`app/battle/[id]/page.tsx`)
**Current Issues**:
- Generic results display
- No sprites in matchup
- Missing momentum visualization

**Redesign Plan**:
- [ ] VS screen with both battler sprites
- [ ] Round-by-round breakdown with scoring
- [ ] Winner highlight with effects
- [ ] Segment timeline with peaks
- [ ] Choke/stumble indicators
- [ ] Post-battle stats: attribute gains, XP earned
- [ ] Match mockup: Tournament bracket visuals

### Phase 2: Profile & Media (Week 2)

#### 2.1 Battler Profile (`app/battler/[id]/page.tsx`)
- [ ] Large sprite display
- [ ] Career stats in gaming cards
- [ ] Recent battles history
- [ ] Badge collection grid
- [ ] Attribute radar chart or bars
- [ ] Style tags display

#### 2.2 Media Hub (`app/media/page.tsx`)
**Current Issues**:
- Light theme!
- Generic blog layout

**Redesign Plan**:
- [ ] Dark gaming background
- [ ] Article cards with thumbnails
- [ ] Category filters as gaming buttons
- [ ] Featured story banner
- [ ] Match mockup: Media hub design

#### 2.3 Finances (`app/finances/page.tsx`)
**Current Issues**:
- Needs consistent gaming UI

**Redesign Plan**:
- [ ] Balance display with orange highlight
- [ ] Transaction history as gaming log
- [ ] Earnings graph with tech styling
- [ ] Match mockup: Financial dashboard

### Phase 3: Secondary Features (Week 3)

#### 3.1 Life Events
- [ ] Event cards with icons
- [ ] Timeline visualization
- [ ] Impact indicators (+ / -)

#### 3.2 Relationships
- [ ] Opponent cards with sprites
- [ ] Rivalry indicators
- [ ] Battle history vs each opponent

#### 3.3 Notifications
- [ ] Toast-style gaming notifications
- [ ] Icon-based categories
- [ ] Unread highlights

### Phase 4: Advanced Features (Week 4)

#### 4.1 Tournaments
- [ ] Bracket visualization
- [ ] Tournament cards
- [ ] Prize pool display

#### 4.2 Badges
- [ ] Badge grid with rarity indicators
- [ ] Unlock requirements
- [ ] Progress tracking

#### 4.3 Settings
- [ ] Gaming-style form inputs
- [ ] Toggle switches with orange accent
- [ ] Profile editing

---

## Sprite System Implementation

### Sprite Structure
```
/public/sprites/
  characters/
    image_1764147239421/
      sprite_001.png
      sprite_002.png
      ...
      sprite_210.png
```

### Usage Pattern
```tsx
import Image from 'next/image';

<div className="w-24 h-24 border-2 border-[#3a3d44] bg-[#2d2f35] overflow-hidden">
  <Image
    src={`/sprites/characters/image_1764147239421/sprite_${spriteId.toString().padStart(3, '0')}.png`}
    alt="Battler sprite"
    width={96}
    height={96}
    className="pixelated"
    onError={(e) => {
      // Fallback to placeholder
      e.currentTarget.src = 'data:image/svg+xml,...';
    }}
  />
</div>
```

### CSS Class
```css
.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

---

## Component Library to Create

Create reusable components in `/components/ui/`:

1. **BattlerSprite.tsx** - Character sprite with fallback
2. **StatCard.tsx** - Metric display card
3. **GamingButton.tsx** - Primary/secondary button variants
4. **ProgressBar.tsx** - Animated progress bar
5. **BadgeIcon.tsx** - Badge display with tooltip
6. **VSMatchup.tsx** - Two sprites facing off
7. **GameHeader.tsx** - Section header with consistent styling
8. **StatBar.tsx** - Attribute/stat bar with LOW/MID/TOP markers
9. **CountdownTimer.tsx** - Battle countdown
10. **WinLossIndicator.tsx** - W/L badge

---

## Quick Wins (Do These First)

1. **Create global CSS for pixelated sprites** (5 min)
2. **Create BattlerSprite component** (15 min)
3. **Create StatCard component** (20 min)
4. **Redesign Dashboard** (2 hours) - BIG IMPACT
5. **Fix light theme on Battle Offers + Media** (30 min) - EASY FIX

---

## Testing Checklist

For each redesigned page, verify:
- [ ] Dark background (#18191c)
- [ ] Orange accents (#ff8c42) on CTAs
- [ ] Consistent borders (#3a3d44)
- [ ] Font-display for headers
- [ ] Uppercase text throughout
- [ ] Hover states working
- [ ] Sprites loading (with fallback)
- [ ] Responsive layout
- [ ] No light theme leaking through

---

## Dependencies

### Existing
- ✅ Next.js 15
- ✅ React
- ✅ TailwindCSS
- ✅ Sprites uploaded to /public/

### To Add
- Consider framer-motion for animations (optional)
- Consider recharts for stats visualization (optional)

---

## Next Steps

1. **TODAY**: Create reusable UI components (BattlerSprite, StatCard, GamingButton)
2. **TODAY**: Redesign Dashboard with sprites
3. **TOMORROW**: Fix Battle Offers + Battle Results pages
4. **THIS WEEK**: Complete Phase 1 (core pages)

---

**Priority Order**:
1. Dashboard (most visible)
2. Battle Offers (user entry point)
3. Battle Results (show off work)
4. Battle Prep (important UX)
5. Everything else

**Goal**: Consistent gaming UI across ALL pages matching the mockups.
