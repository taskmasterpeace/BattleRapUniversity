# VENUE SYSTEM V0 - COMPREHENSIVE SPECIFICATION

## 1. SYSTEM OVERVIEW

The Venue System is a newly implemented database layer (migration: `20251202110000_add_venue_crowd_system.sql`) that manages battle venues, crowd dynamics, and venue-specific modifiers.

### Key Concepts
- **Venues** are specific physical locations (e.g., "The Bunker in NYC")
- **Venue Types** are categories with consistent mechanics (e.g., "Garage," "Boxing Arena")
- **Tiers** represent scale: Virtual → Small → Medium → Large
- **Crowds** are calculated based on venue, battler ratings, match type, and tournament status
- **Modifiers** affect writing/performance attributes and crowd intensity

---

## 2. VENUE TYPE CATALOG

### 2.1 Virtual Tier (Online/Stream)
**Characteristics**: 0% payout baseline, 0.70-0.80 crowd intensity, "online" ambient sound

| Name | Base Cap | Max Cap | Writing | Performance | Crowd Intensity | Payout | Vibe |
|------|----------|---------|---------|-------------|-----------------|--------|------|
| Home Studio | 100 | 500 | 1.00x | 0.90x | 0.70 | 0.50x | Intimate streaming vibes. Chat is the crowd. |
| Podcast Studio | 200 | 1000 | 1.00x | 0.95x | 0.75 | 0.60x | Interview setting. Lower pressure, focused energy. |
| Stream Platform | 500 | 10000 | 1.00x | 0.95x | 0.80 | 0.70x | Big stream energy. Chat going crazy. |

---

### 2.2 Small Tier (Underground/Intimate)
**Characteristics**: 0.20-0.45x payout, 0.85-1.25 crowd intensity

| Name | Base Cap | Max Cap | Writing | Performance | Crowd Intensity | Payout | Vibe |
|------|----------|---------|---------|-------------|-----------------|--------|------|
| Garage | 20 | 50 | 1.15x | 0.90x | 1.10 | 0.30x | Raw underground energy. Every bar lands. |
| Basement | 30 | 75 | 1.15x | 0.85x | 1.15 | 0.35x | True underground. Bars echo off the walls. |
| Barbershop | 15 | 40 | 1.10x | 0.90x | 1.20 | 0.25x | Neighborhood energy. Everyone knows everyone. |
| Alley | 25 | 60 | 1.10x | 0.85x | 1.25 | 0.20x | Raw street energy. Guerrilla battle vibes. |
| Small Bar | 40 | 80 | 1.10x | 0.95x | 1.10 | 0.40x | Drinks flowing. Intimate club energy. |
| Art Gallery | 30 | 60 | 1.15x | 0.90x | 0.90 | 0.45x | Artsy crowd. They appreciate the craft. |
| Boxing Gym | 40 | 80 | 1.05x | 1.05x | 1.20 | 0.35x | Gritty fighter energy. Competitive vibes. |
| Coffee Shop | 20 | 40 | 1.10x | 0.85x | 0.85 | 0.25x | Low-key cipher vibes. Open mic energy. |
| Record Store | 25 | 50 | 1.15x | 0.90x | 1.00 | 0.30x | Hip-hop heads. They know the culture. |
| Subway Station | 50 | 100 | 1.05x | 0.80x | 1.15 | 0.20x | Random crowd. Trains interrupting. Chaos energy. |

**Key Insight**: Writing boost (1.05-1.15x) but performance penalties (0.80-0.95x). Crowd intensity high (1.10-1.25) because intimate crowds react directly to bars.

---

### 2.3 Medium Tier (Local/Regional)
**Characteristics**: 0.55-1.00x payout, 0.90-1.20 crowd intensity

| Name | Base Cap | Max Cap | Writing | Performance | Crowd Intensity | Payout | Vibe |
|------|----------|---------|---------|-------------|-----------------|--------|------|
| Community Center | 100 | 300 | 1.05x | 1.05x | 1.00 | 0.70x | Neighborhood support. Local pride on display. |
| Small Theater | 150 | 400 | 1.10x | 1.10x | 1.05 | 0.90x | Semi-professional setting. Red curtain energy. |
| Gymnasium | 200 | 500 | 1.00x | 1.10x | 1.10 | 0.65x | School assembly vibes. Bleacher crowd. |
| Nightclub | 150 | 400 | 0.95x | 1.15x | 1.20 | 0.85x | Party atmosphere. Crowd is hype. |
| Outdoor Park | 200 | 600 | 1.00x | 1.05x | 1.00 | 0.55x | Festival vibes. Open air energy. |
| Restaurant Bar | 100 | 250 | 1.05x | 1.05x | 0.95 | 0.75x | Dinner crowd energy. More refined. |
| Church Hall | 150 | 350 | 1.10x | 1.00x | 0.90 | 0.60x | Respectful crowd. Focused listening. |
| Comedy Club | 120 | 280 | 1.00x | 1.15x | 1.15 | 0.80x | Entertainment crowd. They want to laugh. |
| Rooftop | 80 | 200 | 1.05x | 1.10x | 1.05 | 1.00x | Exclusive skyline views. VIP energy. |
| Warehouse | 250 | 600 | 1.05x | 1.05x | 1.15 | 0.70x | Underground but bigger. Echo chamber. |
| Amphitheater | 300 | 800 | 1.05x | 1.15x | 1.10 | 0.90x | Greek theater energy. Natural acoustics. |
| Barn | 150 | 350 | 1.05x | 1.00x | 1.10 | 0.55x | Country vibes. Different energy entirely. |

---

### 2.4 Large Tier (Main Stage/Major)
**Characteristics**: 1.80-3.50x payout, 1.00-1.35 crowd intensity

| Name | Base Cap | Max Cap | Writing | Performance | Crowd Intensity | Payout | Vibe |
|------|----------|---------|---------|-------------|-----------------|--------|------|
| Grand Theater | 800 | 2000 | 1.00x | 1.20x | 1.15 | 2.00x | Prestigious venue. History on these walls. |
| Boxing Arena | 1000 | 3000 | 0.95x | 1.25x | 1.30 | 2.50x | Fight night energy. Blood sport vibes. |
| Basketball Arena | 2000 | 5000 | 0.90x | 1.30x | 1.25 | 3.00x | Stadium energy. Sports crowd hype. |
| Concert Hall | 1500 | 4000 | 0.95x | 1.25x | 1.20 | 2.50x | Industry venue. Major label energy. |
| Convention Center | 1000 | 3000 | 1.00x | 1.15x | 1.10 | 1.80x | Corporate event vibes. Big screens everywhere. |
| Container Venue | 500 | 1500 | 1.05x | 1.20x | 1.35 | 2.00x | URL energy. Packed crowd. Intimate but major. |
| VIP Nightclub | 400 | 1000 | 0.95x | 1.25x | 1.25 | 2.20x | Money in the building. VIP everything. |
| Ballroom | 600 | 1500 | 1.05x | 1.15x | 1.00 | 1.90x | High society venue. Chandeliers and class. |
| Festival Stage | 2000 | 10000 | 0.85x | 1.35x | 1.30 | 3.50x | Festival main stage. Maximum exposure. |
| Modern Atrium | 800 | 2000 | 1.00x | 1.15x | 1.05 | 2.00x | Tech money venue. Modern architecture. |
| Outdoor Arena | 3000 | 8000 | 0.85x | 1.30x | 1.25 | 3.00x | Under the stars. Epic battles only. |
| Historic Venue | 1000 | 2500 | 1.05x | 1.20x | 1.20 | 2.50x | Legends battled here. History on these walls. |

**Key Insight**: Performance boost (1.15-1.35x), sometimes writing penalty (0.85-0.95x). Huge crowds make crowd reaction significant in round judging.

---

## 3. VENUE ASSIGNMENT LOGIC

### Rating-Based Venue Tier Assignment
```
Average Rating | Assigned Tier
< 1000        | Small
1000-1200     | Small
1200-1400     | Medium
1400-1600     | Medium
1600-1800     | Large
≥ 1800        | Large
```

---

## 4. CROWD SIZE CALCULATION

### Formula
```
crowd_size = base_capacity × rating_multiplier × grudge_multiplier × tournament_multiplier
```

Where:
- **rating_multiplier**: `0.5 + (avg_rating / 2000)` → ranges 0.5x to 1.5x
- **grudge_multiplier**: 1.3x if grudge match, else 1.0x
- **tournament_multiplier**: 1.5x if tournament, else 1.0x
- **Final Constraint**: `crowd_size ≤ venue.max_capacity`

---

## 5. VENUE MODIFIER EFFECTS

### Writing & Performance Modifiers
These directly multiply segment scores in battle simulation:
- **Basement (1.15x writing)**: Intimate crowd appreciates lyrical bars → +15% writing scoring
- **Basketball Arena (0.90x writing, 1.30x performance)**: Massive crowd values presence → -10% writing, +30% performance

### Crowd Intensity Modifier
Affects crowd_reaction score (0-100 scale):
- **Alley (1.25x)**: Street crowd is very reactive → crowds 20-25% more energized
- **Church Hall (0.90x)**: Respectful crowd is reserved → crowds 10% less reactive
- **Container Venue (1.35x)**: Packed underground energy → maximum reactivity

---

## 6. SPRITE MAPPING

### Location
`C:\git\battlerapuniversity\raw images\venue\`

### Format
11 PNG files, each containing a 4×4 grid (44 total sprite variants)

### Sprite-to-Venue Mapping Examples

| Venue Type | Sprite Reference |
|-----------|------------------|
| basement | File 1, Row 2, Col 1 (graffiti basement) |
| garage | File 1, Row 1, Col 4 |
| warehouse | File 1, Row 1, Col 2 |
| boxing-arena | File 2, Row 1, Col 2 |
| ballroom | File 2, Row 1, Col 4 |
| container-venue | File 4, Row 1, Col 1 |
| festival-stage | File 4, Row 4, Col 3 |

---

## 7. UI COMPONENTS

### Venue Display Card
```
┌─────────────────────────────────────┐
│ VENUE NAME                          │
│ [Sprite Image 400x300]              │
│                                     │
│ TIER BADGE: Small | Medium | Large │
│ Capacity: 50-100 people             │
│ Crowd Energy: ▓▓▓▓░ (80%)           │
│                                     │
│ MODIFIER BREAKDOWN:                 │
│ Writing:      1.10x ↑              │
│ Performance:  0.90x ↓              │
│ Crowd React:  1.15x HIGH           │
│                                     │
│ VIBE: "Raw street energy..."       │
│ [Prestige Level: ⭐⭐⭐]             │
└─────────────────────────────────────┘
```

### Tier Color Coding
```css
/* Virtual Tier */
.tier-virtual { background: gradient-to-r from-blue-900 to-purple-900; }
.badge-virtual { @apply bg-blue-500/20 text-blue-400 border-blue-500/30; }

/* Small Tier */
.tier-small { background: gradient-to-r from-amber-900 to-orange-900; }
.badge-small { @apply bg-orange-500/20 text-orange-400 border-orange-500/30; }

/* Medium Tier */
.tier-medium { background: gradient-to-r from-red-900 to-orange-900; }
.badge-medium { @apply bg-red-500/20 text-red-400 border-red-500/30; }

/* Large Tier */
.tier-large { background: gradient-to-r from-yellow-900 to-amber-900; }
.badge-large { @apply bg-yellow-500/20 text-yellow-300 border-yellow-500/30; }
```

### Modifier Indicators
```
Crowd Intensity:
  0.70-0.90: ◐ (low)     → gray
  0.91-1.10: ● (medium)  → orange
  1.11-1.35: ◉ (high)    → red

Writing/Performance Modifier:
  < 1.00: ↓ negative     → red
  = 1.00: → neutral      → gray
  > 1.00: ↑ positive     → green
```

### Prestige Stars
```
⭐     (Level 1) - Underground
⭐⭐    (Level 2) - Local recognition
⭐⭐⭐   (Level 3) - Regional prestige
⭐⭐⭐⭐  (Level 4) - National stage
⭐⭐⭐⭐⭐ (Level 5) - Legendary
```

---

## 8. API INTEGRATION

### Battle Offers Page
Include venue data in each offer:
```typescript
{
  id: string;
  opponent: Battler;
  venue: {
    name: string;
    tier: 'virtual' | 'small' | 'medium' | 'large';
    sprite_key: string;
    base_capacity: number;
    max_capacity: number;
    writing_modifier: number;
    performance_modifier: number;
    crowd_intensity: number;
    vibe_description: string;
    prestige_level: number;
  };
  projected_crowd: number;
}
```

### Battle Results Page
Show venue info in header and crowd progression:
```typescript
{
  battle: Battle;
  venue: VenueType;
  crowd_start: number;
  crowd_final: number;
  crowd_momentum: 'player' | 'opponent' | 'even';
}
```

---

## 9. DATABASE FUNCTIONS

Already implemented in migration:

- `calculate_crowd_size(venue_id, rating_a, rating_b, is_grudge, tournament_id)` → INTEGER
- `get_venue_modifiers(venue_id)` → {writing_mod, performance_mod, crowd_intensity}
- `assign_battle_venue(avg_rating, league_id, city_id)` → UUID

---

## 10. IMPLEMENTATION CHECKLIST

- [x] Migration applied
- [x] 37 venue types seeded
- [ ] Venue sprites organized into `/public/sprites/venues/`
- [ ] Venue assigned when battle offer created
- [ ] Crowd calculated when battle offer created
- [ ] Venue modifiers applied in simulation
- [ ] Venue card component built
- [ ] Battle offers show venue info
- [ ] Battle results show venue/crowd info
- [ ] Dashboard "Next Battle" shows venue
- [ ] Prep page shows venue-specific tips
