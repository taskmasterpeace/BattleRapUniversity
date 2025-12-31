# Battle Rap Design System

This skill enforces the Algorithm Institute of BattleRap visual aesthetic based on mockups.

## Color Palette

### Background Colors
- `bg-slate-900` (#0F172A) - Primary background
- `bg-slate-800` (#1E293B) - Secondary background / cards
- `bg-slate-700` (#334155) - Tertiary / raised elements
- `border-slate-600` (#475569) - Borders

### Text Colors
- `text-slate-50` (#F8FAFC) - Primary text
- `text-slate-400` (#94A3B8) - Secondary text
- `text-slate-500` (#64748B) - Tertiary text

### Accent Colors
- **Primary Orange**: `bg-orange-500` (#F97316), `text-orange-500`
- **Golden Orange**: `#FFA500` (special highlights, badges)
- **Success**: `bg-emerald-500` (#10B981)
- **Danger**: `bg-red-500` (#EF4444)
- **Info**: `bg-blue-500` (#3B82F6)
- **Warning**: `bg-amber-500` (#F59E0B)

### Special Effects
- **Grudge Match Border**: `border-2 border-orange-500`
- **Intensity Meter**: Orange to red gradient
- **Badge Tiers**: Gold (#FFD700), Silver (#C0C0C0), Bronze (#CD7F32)

## Typography

### Font Families
- **Display**: `font-display` (Rajdhani) - Headers, important text
- **Body**: `font-sans` (Inter) - Body text
- **Mono**: `font-mono` (JetBrains Mono) - Technical data

### Text Styles
- **Headers**: `uppercase tracking-tight font-black text-slate-50`
- **Subheaders**: `uppercase tracking-wide font-bold text-slate-400`
- **Body**: `text-slate-400 font-medium`
- **Labels**: `text-xs uppercase tracking-wider text-slate-500`

### Font Weights
- `font-black` (900) - Major headers
- `font-bold` (700) - Standard headers, labels
- `font-semibold` (600) - Emphasis
- `font-medium` (500) - Body text

## Spacing System

### Container Spacing
- `max-w-5xl mx-auto px-6` - Standard page container
- `max-w-7xl mx-auto px-8` - Wide page container
- `p-6 md:p-8` - Card padding

### Gap Spacing
- `gap-4` (1rem) - Tight spacing
- `gap-6` (1.5rem) - Standard spacing
- `gap-8` (2rem) - Loose spacing

## Component Patterns

### Button Component
```tsx
// Primary (Orange)
<button className="bg-orange-500 hover:bg-orange-600 text-white uppercase tracking-wide font-bold px-6 py-3 rounded min-h-[44px] transition-colors">
  Accept
</button>

// Success (Green)
<button className="bg-emerald-500 hover:bg-emerald-600 text-white uppercase tracking-wide font-bold px-6 py-3 rounded min-h-[44px]">
  Confirm
</button>

// Danger (Red)
<button className="bg-red-500 hover:bg-red-600 text-white uppercase tracking-wide font-bold px-6 py-3 rounded min-h-[44px]">
  Decline
</button>

// Secondary (Ghost)
<button className="border border-slate-600 hover:bg-slate-800 text-slate-300 uppercase tracking-wide font-bold px-6 py-3 rounded min-h-[44px]">
  View Profile
</button>
```

### Card Component
```tsx
<div className="bg-slate-800 border border-slate-600 rounded-lg p-6 space-y-4">
  {/* Content */}
</div>
```

### Badge Sprite Display
```tsx
<div className="relative w-16 h-16">
  {/* Tier-based background circle */}
  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600" />
  {/* Badge sprite */}
  <Image src="/sprites/badges/gold/badge_001.png" className="relative z-10" />
</div>
```

### Character Portrait
```tsx
<div className="relative w-20 h-20">
  {/* Dark background circle */}
  <div className="absolute inset-0 rounded-full bg-slate-700" />
  {/* Character sprite */}
  <Image src="/sprites/characters/sprite_001.png" className="relative z-10" />
</div>
```

### Grudge Match Card
```tsx
<div className="bg-slate-800 border-2 border-orange-500 rounded-lg p-6">
  <div className="flex items-center gap-2 text-orange-500 font-black uppercase tracking-tight">
    🔥 Grudge Match
  </div>
  {/* Content */}
</div>
```

### Status Badge
```tsx
// Success
<span className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-3 py-1 rounded uppercase text-xs font-bold">
  In Progress
</span>

// Danger
<span className="bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded uppercase text-xs font-bold">
  Declined
</span>
```

## Layout Patterns

### Page Header
```tsx
<div className="border-b border-slate-700 pb-4 mb-8">
  <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-50">
    Battle Offers
  </h1>
</div>
```

### Two-Column Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">{/* Main content */}</div>
  <div>{/* Sidebar */}</div>
</div>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

## Responsive Breakpoints

- **Mobile**: < 768px (default styles)
- **Tablet**: `md:` ≥ 768px
- **Desktop**: `lg:` ≥ 1024px
- **Wide**: `xl:` ≥ 1280px

## Battle Rap Cultural Authenticity

### Language & Tone
- Use battle rap terminology: battlers (not "fighters"), rounds (not "matches"), bars, angles, rebuttals
- League names should reference real battle rap culture: Small Room Circuit, Main Stage Arena, etc.
- Blogger names should sound like battle rap media outlets

### Visual Elements
- Venue backgrounds should feel urban/underground or arena-based
- Character sprites should have diverse styles and poses
- Badge names should use battle rap slang

## When to Use This Skill

Apply this design system when:
- Creating any new UI component
- Refactoring existing components
- Building new pages
- Creating dev tools
- Enhancing existing features

## Anti-Patterns (Avoid These)

❌ Hardcoded hex colors: `#F97316`
✅ Use Tailwind classes: `bg-orange-500`

❌ Lowercase text in headers
✅ Always `uppercase` for headers

❌ Thin font weights (`font-normal`, `font-light`)
✅ Use `font-bold` or `font-black`

❌ Light theme colors (`bg-white`, `bg-gray-50`)
✅ Dark theme only (`bg-slate-900`, `bg-slate-800`)

❌ Emoji icons for badges
✅ Badge sprite images with tier-based backgrounds

❌ Generic button classes
✅ Reusable Button component with variants
