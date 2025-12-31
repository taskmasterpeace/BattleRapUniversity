# DEV TOOLS SYSTEM - Implementation Plan
**Battle Rap University - Dev Mode**
**Date**: December 2, 2025

---

## 🎯 GOAL

Create a **dev tools panel** where you can:
1. See ALL battlers (AI and player battlers)
2. Edit battler details (name, tier, region, attributes)
3. Assign character sprites to battlers (from 880 available sprites)
4. Preview sprites with proper background handling (transparent PNGs)
5. Spawn badges, manipulate time, run test battles
6. Edit finances, stress, grudges

---

## 🖼️ SPRITE BACKGROUND HANDLING

### Problem
Character sprites have **transparent backgrounds** (PNG with alpha channel). When displayed, they need a background color or the sprite "floats" on whatever is behind it.

### Solution: Tier-Based Background Colors
Match the existing tier color system from `BattlerAvatar.tsx`:

```typescript
const TIER_COLORS = {
  god: {
    bg: 'bg-gradient-to-br from-red-500/20 to-orange-500/20',
    border: 'border-red-500/30',
    glow: 'shadow-red-500/20'
  },
  top: {
    bg: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/20'
  },
  mid: {
    bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20'
  },
  low: {
    bg: 'bg-gradient-to-br from-zinc-600/20 to-zinc-500/20',
    border: 'border-zinc-500/30',
    glow: 'shadow-zinc-500/20'
  }
}
```

### Implementation
```typescript
<div className={`sprite-container ${TIER_COLORS[tier].bg} ${TIER_COLORS[tier].border} ${TIER_COLORS[tier].glow}`}>
  <img src={spriteUrl} alt={name} className="sprite-image" />
</div>
```

**Result**: Sprite image on top of a subtle gradient background matching their tier

---

## 📋 DEV TOOLS DASHBOARD

### Layout
**URL**: `/dev` (already exists)

**Current State**: Basic dev page exists at `app/dev/page.tsx`

**Enhancement**: Add tabs for different dev tools:
```
┌─────────────────────────────────────────────────────────┐
│  🛠️ DEV TOOLS                                            │
├─────────────────────────────────────────────────────────┤
│  [Battler Manager] [Time Control] [Badge Spawner]       │
│  [Battle Simulator] [Finances] [Grudge Manager]         │
├─────────────────────────────────────────────────────────┤
│  Tab Content Area                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎭 TOOL 1: BATTLER MANAGER

### Goal
See all battlers, edit details, assign sprites

### UI Layout
```
┌─────────────────────────────────────────────────────────┐
│  BATTLER MANAGER                        [+ Create New]  │
├────────────────────┬────────────────────────────────────┤
│  BATTLER LIST      │  BATTLER EDITOR                    │
│                    │                                    │
│  🎤 The Comedian   │  ┌──────────────────────────────┐ │
│     (GOD tier)     │  │  SPRITE PREVIEW              │ │
│     No avatar      │  │                              │ │
│                    │  │  [Character Sprite Image]    │ │
│  🎤 Hollow Victory │  │  with tier-based background  │ │
│     (TOP tier)     │  │                              │ │
│     No avatar      │  └──────────────────────────────┘ │
│                    │                                    │
│  🎤 The Architect  │  Stage Name: [The Comedian____]   │
│     (GOD tier)     │  Tier: [god ▼]                    │
│     No avatar      │  Region: [East Coast ▼]          │
│                    │  League: [Small Room Circuit ▼]   │
│  [Load More...]    │                                    │
│                    │  ASSIGN SPRITE:                    │
│  Search: [___]     │  Current: None                     │
│  Filter: [All ▼]   │  [Browse Sprites...] [Random]     │
│                    │                                    │
│                    │  [Save Changes] [Cancel]          │
└────────────────────┴────────────────────────────────────┘
```

### Features

#### 1. Battler List (Left Panel)
- Display all battlers (AI + player)
- Show current sprite (or "No avatar")
- Filter by tier, league, has/no sprite
- Search by name
- Click to edit

#### 2. Battler Editor (Right Panel)
**Basic Info**:
- Stage name (text input)
- Tier (dropdown: god/top/mid/low)
- Region (dropdown: East Coast, West Coast, Midwest, South, Canada)
- Primary league (dropdown)

**Sprite Assignment**:
- Current sprite preview (with tier-based background)
- "Browse Sprites" → Opens sprite selector modal
- "Random" → Assigns random sprite from available pool
- "Clear" → Removes assigned sprite (back to initials)

**Attributes** (expandable section):
- Sliders for all 11 attributes (1-10)
- Writing: Lyricism, Wordplay, Creativity, Flow
- Performance: Stage Presence, Crowd Control, Delivery
- Personal: Financial Stability, Reputation, Family Bond, Resilience

**Badges** (expandable section):
- Currently assigned badges (chips)
- "Add Badge" → Opens badge selector
- "Remove" button per badge

**Actions**:
- "Save Changes" → Updates database
- "Delete Battler" (confirmation required)
- "Duplicate" → Creates copy with "_copy" suffix
- "Export JSON" → Downloads battler data

---

## 🖼️ SPRITE SELECTOR MODAL

### UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│  SELECT CHARACTER SPRITE                            [X]     │
├─────────────────────────────────────────────────────────────┤
│  Search: [_______________]  Filter: [All ▼]  [Sort: Number] │
├─────────────────────────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │ 001 │ │ 002 │ │ 003 │ │ 004 │ │ 005 │ │ 006 │           │
│  │ img │ │ img │ │ img │ │ img │ │ img │ │ img │           │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘           │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │ 007 │ │ 008 │ │ 009 │ │ 010 │ │ 011 │ │ 012 │           │
│  │ img │ │ img │ │ img │ │ img │ │ img │ │ img │           │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘           │
│                                                             │
│  [Page 1 of 147]  [< Prev] [Next >]                        │
│                                           [Select] [Cancel] │
└─────────────────────────────────────────────────────────────┘
```

### Features
- **Grid display**: 6 sprites per row, 4 rows visible = 24 per page
- **Sprite preview**: Shows sprite with tier-based background
- **Pagination**: 880 sprites / 24 per page = ~37 pages
- **Filter**:
  - All sprites
  - Unassigned only
  - Assigned to others (shows which battler)
- **Sort**:
  - By sprite number (001, 002, etc.)
  - By assignment status (unassigned first)
- **Hover**: Shows full-size preview
- **Click**: Selects sprite, highlights border
- **Double-click**: Selects and closes modal

### Implementation
**Component**: `components/dev/SpriteSelector.tsx`

```typescript
export function SpriteSelector({
  onSelect,
  currentSpriteUrl,
  tier
}: SpriteSelectorProps) {
  const [sprites, setSprites] = useState<SpriteData[]>([])
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const spritesPerPage = 24

  useEffect(() => {
    // Load sprite data (880 sprites)
    // Check which are assigned to battlers
    loadSpriteData()
  }, [filter])

  const handleSelect = (sprite: SpriteData) => {
    onSelect(sprite.url)
  }

  return (
    <Modal title="SELECT CHARACTER SPRITE">
      <div className="sprite-grid">
        {sprites.slice((page - 1) * spritesPerPage, page * spritesPerPage).map(sprite => (
          <div
            key={sprite.number}
            className={`sprite-card ${TIER_COLORS[tier].bg}`}
            onClick={() => handleSelect(sprite)}
          >
            <img src={sprite.url} alt={`Sprite ${sprite.number}`} />
            <div className="sprite-number">{sprite.number}</div>
            {sprite.assignedTo && (
              <div className="assigned-badge">
                Used by {sprite.assignedTo}
              </div>
            )}
          </div>
        ))}
      </div>

      <Pagination
        current={page}
        total={Math.ceil(sprites.length / spritesPerPage)}
        onChange={setPage}
      />
    </Modal>
  )
}
```

---

## 🎛️ TOOL 2: TIME CONTROL

### Goal
Manipulate virtual time for testing

### UI (from mockup)
```
┌─────────────────────────────────────────┐
│  TIME CONTROL                           │
├─────────────────────────────────────────┤
│  [Calendar: December 2025]              │
│                                         │
│  Current Date: 2025-11-27 14:30:00     │
│                                         │
│  [Advance 1 Day] [Advance 1 Week]      │
│  [Set Date...]                          │
│                                         │
│  Console:                               │
│  > Dev Mode: Time warped +1 day.       │
└─────────────────────────────────────────┘
```

### Features
- Display current virtual date
- "Advance 1 Day" → Triggers daily events, prep locks
- "Advance 1 Week" → Fast-forward through prep period
- "Set Date" → Jump to specific date
- Console log showing time-related events triggered

**Implementation**: Update `battlers.current_week` column

---

## 🎖️ TOOL 3: BADGE SPAWNER

### Goal
Grant/remove badges for testing

### UI (from mockup)
```
┌─────────────────────────────────────────┐
│  BADGE SPAWNER                          │
├─────────────────────────────────────────┤
│  [Badge Icons Grid: 21 badges visible] │
│  [✓ wordplay_wizard] [  freestyle_genius] │
│  [✓ creativity_beast] [  consistent_writer] │
│  ...                                    │
│                                         │
│  [Grant Selected Badges]               │
│  [Remove All Badges]                   │
│                                         │
│  Dev Mode: Granted "Master Wordsmith"  │
│  (Gold) badge to player.               │
└─────────────────────────────────────────┘
```

### Features
- Display all 120 badges in grid
- Click to toggle (checked = will grant)
- "Grant Selected" → Adds to player's badges
- "Remove All" → Clears all badges
- Console feedback

---

## 🥊 TOOL 4: BATTLE SIMULATOR

### Goal
Run test battles with custom settings

### UI (from mockup)
```
┌─────────────────────────────────────────┐
│  BATTLE SIMULATOR                       │
├─────────────────────────────────────────┤
│  [Visual battle stage with VS display]  │
│                                         │
│  Logs:                                  │
│  Round 1: Player 8.2, Opponent 7.5     │
│  Round 2: Player 8.6, Opponent 8.0     │
│                                         │
│  [Force Win] [Force Loss]              │
│  [Simulate Battle]                     │
└─────────────────────────────────────────┘
```

### Features
- Select player battler
- Select opponent (or random AI)
- "Simulate Battle" → Runs simulation immediately (ignores scheduled_at)
- "Force Win" → Player wins 2-1
- "Force Loss" → Player loses 1-2
- Logs show round-by-round results

**Implementation**: Call battle simulation API with dev overrides

---

## 💰 TOOL 5: FINANCES CONSOLE

### Goal
Adjust balance, grant/deduct money

### UI (from mockup)
```
┌─────────────────────────────────────────┐
│  FINANCES CONSOLE                       │
├─────────────────────────────────────────┤
│  Balance: $12,450                       │
│                                         │
│  [Set Balance: _______] [Update]       │
│  [Add Funds: _______]   [Add]          │
│  [Deduct Fee: _______]  [Deduct]       │
│                                         │
│  Transaction Log:                       │
│  Recent - Fake Earnings: $12,450       │
│  Recent - Fake Earnings: $12,450       │
│  Recent - Fake Expense: -$200          │
│                                         │
│  [Grant Win Bonus] [Deduct Fee]        │
└─────────────────────────────────────────┘
```

### Features
- Display current balance
- "Set Balance" → Directly set balance to specific amount
- "Add Funds" → Grant bonus money
- "Deduct Fee" → Remove money (simulate expenses)
- Transaction log shows recent changes
- "Grant Win Bonus" → Add $1,200 (typical win bonus)

**Implementation**: Update `battlers.current_balance` and `battler_financial_history`

---

## 😠 TOOL 6: GRUDGE MANAGER

### Goal
Create/adjust rivalries for testing

### UI (from mockup)
```
┌─────────────────────────────────────────┐
│  GRUDGE MANAGER                         │
├─────────────────────────────────────────┤
│  Active Rivalries:                      │
│  Young Pattern: ████████░░ 85/100       │
│  Young Pattern: ████░░░░░░ 45/100       │
│  ...                                    │
│                                         │
│  [Force Grudge Match Offer]            │
│  [Increase Intensity] [Resolve Grudge] │
└─────────────────────────────────────────┘
```

### Features
- List all active rivalries
- Show intensity bars (0-100)
- "Force Grudge Match Offer" → Creates offer immediately
- "Increase Intensity" → +20 intensity
- "Resolve Grudge" → Resets intensity to 0

**Implementation**: Update `battler_relationships` table, `grudge_intensity` column

---

## 🎨 TOOL 7: ATTRIBUTE EDITOR

### Goal
Directly edit battler attributes

### UI (from mockup)
```
┌─────────────────────────────────────────┐
│  ATTRIBUTE EDITOR                       │
├─────────────────────────────────────────┤
│  Lyricism:       8 ━━━━━━━━░░ (MID-TOP) │
│  Flow:           9 ━━━━━━━━━░ (MID-TOP) │
│  Stage Presence: 7 ━━━━━━━░░░ (MID-TOP) │
│  Breen:          8 ━━━━━━━━░░ (MID-TOP) │
│  Feelin:         9 ━━━━━━━━━░ (MID-TOP) │
│  ...                                    │
│                                         │
│  [Reed Now] [Save Attributes]          │
│  [Randomize Build]                     │
└─────────────────────────────────────────┘
```

### Features
- Sliders for all 11 attributes (1-10)
- Real-time tier indicator (LOW/MID/TOP/GOD based on value)
- "Save Attributes" → Updates database
- "Randomize Build" → Random 1-10 values
- "Reed Now" (typo in mockup? maybe "Read Now" or "Reset"?)

**Implementation**: Update `battler_attributes` table

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 0: Dev Tools Foundation
- [ ] Create `/dev` page tabs layout
- [ ] Add navigation between tools
- [ ] Set up dev-only authentication (check if user is admin)

### Phase 1: Battler Manager
- [ ] Build battler list component (left panel)
- [ ] Build battler editor component (right panel)
- [ ] Implement sprite preview with tier-based background
- [ ] Build sprite selector modal (grid, pagination, filtering)
- [ ] Add sprite assignment logic (update `avatar_url` in database)
- [ ] Add "Random" sprite assignment
- [ ] Test sprite preview rendering

### Phase 2: Additional Dev Tools
- [ ] Time Control panel
- [ ] Badge Spawner panel
- [ ] Battle Simulator panel
- [ ] Finances Console panel
- [ ] Grudge Manager panel
- [ ] Attribute Editor panel

### Phase 3: Integration
- [ ] Link dev tools from main nav (admin-only)
- [ ] Add keyboard shortcuts (Ctrl+Shift+D to open dev tools)
- [ ] Test all tools with real data

---

## 🚀 START WITH BATTLER MANAGER

This is the MOST IMPORTANT tool because:
1. Lets you assign sprites to battlers (fixes the `avatar_url: null` issue)
2. Lets you edit battler details (names, tiers, attributes)
3. Creates the sprite preview system with background handling
4. Once sprites are assigned, they'll show up throughout the app (dashboard, battle offers, results, etc.)

**Ready to build it?** I'll start with:
1. Battler Manager layout (list + editor)
2. Sprite Selector modal with pagination
3. Sprite preview with tier-based backgrounds
4. Save functionality to update database

Just say the word! 🎯
