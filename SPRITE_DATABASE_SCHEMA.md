# Sprite Database Schema Analysis & Implementation

## Current Database State

**Schema Version**: 44 migrations (as of 2025-11-30)
**Primary Database**: PostgreSQL via Supabase
**Current Image Support**: Partial (battlers only)

### Existing Image Columns

#### Battlers Table (Partially Implemented)
```sql
-- From migration 20251130051000_add_battler_images.sql
ALTER TABLE battlers ADD COLUMN avatar_url TEXT;
ALTER TABLE battlers ADD COLUMN banner_url TEXT;
```

**Status**: Columns exist but not populated

**Current Coverage**: 0/920 battler sprites attached

---

## Asset Inventory

### Sprite File Breakdown (1,856 total)

| Category | Count | Location | Current DB Support |
|----------|-------|----------|-------------------|
| **Characters** | 920 | `public/sprites/characters/` (23 subdirs) | ✅ Schema ready, needs data |
| **Badges** | 120 | `public/sprites/badges/` (3 subdirs) | ❌ No schema |
| **Leagues** | 152 | `public/sprites/leagues/` (8 subdirs) | ❌ No schema |
| **Crowd** | 580 | `public/sprites/crowd/` (10 subdirs) | ❌ No schema |
| **Cities** | 84 | `public/sprites/cities/` (6 subdirs) | ❌ No schema |
| **TOTAL** | **1,856** | — | **Only 920 schema ready** |

---

## Table-by-Table Schema Analysis

### 1. BATTLERS TABLE (Existing)

**File**: `supabase/migrations/001_initial_schema.sql`

**Current Columns**:
```sql
CREATE TABLE battlers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  stage_name TEXT NOT NULL,
  region TEXT,
  primary_league_id UUID REFERENCES leagues(id),
  style_tags JSONB,
  tier TEXT,
  is_ai BOOLEAN,
  created_at TIMESTAMPTZ,

  -- Added in 20251130051000_add_battler_images.sql
  avatar_url TEXT,        -- ✅ Exists (920 character sprites)
  banner_url TEXT         -- ✅ Exists (not needed for sprites)
);
```

**Sprite Mapping**:
- `avatar_url`: `/sprites/characters/[character_subdirectory]/[character_name].png`
- Example: Battler "Tru Foe" → `/sprites/characters/image_1764146494580/tru_foe.png`

**Data Integrity**: No constraint that `avatar_url` must be populated. Should add:
```sql
-- NOTE: constraint commented because avatars aren't mandatory yet
-- ALTER TABLE battlers ADD CONSTRAINT battler_avatar_required
--   CHECK (avatar_url IS NOT NULL);
```

---

### 2. LEAGUES TABLE (Existing)

**File**: `supabase/migrations/001_initial_schema.sql`

**Current Columns**:
```sql
CREATE TABLE leagues (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  round_length_minutes INT,
  base_crowd_factor NUMERIC,
  writing_weight NUMERIC,
  performance_weight NUMERIC,
  booking_pace_days INT,
  description TEXT,
  created_at TIMESTAMPTZ,

  -- Added in 20251125030000_add_time_economy_cities.sql
  city_id UUID REFERENCES cities(id),
  requires_deposit BOOLEAN,
  deposit_percentage DECIMAL,
  tolerance_unreliable INTEGER,
  blacklist_threshold INTEGER

  -- MISSING: logo_url, icon_url, banner_url
);
```

**Required Additions**:
```sql
-- New columns for league sprite attachments
ALTER TABLE leagues
  ADD COLUMN IF NOT EXISTS logo_url TEXT COMMENT 'League logo (152 sprites available)',
  ADD COLUMN IF NOT EXISTS icon_url TEXT COMMENT 'Small league icon for UI',
  ADD COLUMN IF NOT EXISTS banner_url TEXT COMMENT 'League banner/background';
```

**Sprite Mapping**:
- `logo_url`: `/sprites/leagues/[league_subdirectory]/[league_name].png`
- Example: "Algorithm Institute" league → `/sprites/leagues/image_1764195526092/algorithm_institute.png`

**Note**: 152 league sprites exist across 8 subdirectories

---

### 3. CITIES TABLE (Existing)

**File**: `supabase/migrations/20251125030000_add_time_economy_cities.sql`

**Current Columns**:
```sql
CREATE TABLE cities (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  state TEXT,
  country TEXT DEFAULT 'USA',
  scene_size TEXT CHECK (scene_size IN ('small', 'medium', 'large', 'major')),
  culture_style TEXT CHECK (culture_style IN ('technical', 'aggressive', 'diverse', 'street')),
  created_at TIMESTAMPTZ

  -- MISSING: background_url, flag_url, skyline_url
);
```

**Required Additions**:
```sql
-- New columns for city sprite attachments
ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS background_url TEXT COMMENT 'City background image (84 sprites available)',
  ADD COLUMN IF NOT EXISTS skyline_url TEXT COMMENT 'City skyline variant',
  ADD COLUMN IF NOT EXISTS flag_url TEXT COMMENT 'City/state flag icon';
```

**Sprite Mapping**:
- `background_url`: `/sprites/cities/[region_subdirectory]/[city_name].png`
- Directory structure: `east-coast/`, `west-coast/`, `midwest/`, `south/`, `canada/`
- Example: NYC → `/sprites/cities/east-coast/new_york_city.png`

**Note**: 84 city sprites across 6 regional subdirectories

---

### 4. BADGE_COSTS TABLE (Existing - NEW TABLE)

**File**: `supabase/migrations/20251125010000_add_badge_point_buy_tables.sql`

**Current Columns**:
```sql
CREATE TABLE badge_costs (
  id UUID PRIMARY KEY,
  badge_code TEXT NOT NULL UNIQUE,
  badge_name TEXT NOT NULL,
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold')),
  category TEXT CHECK (category IN ('writing', 'performance', 'content', 'delivery', 'reputation_positive', 'reputation_negative')),
  point_cost INTEGER,
  is_negative BOOLEAN,
  available_at_creation BOOLEAN,
  description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ

  -- MISSING: icon_url
);
```

**Required Additions**:
```sql
-- Add badge sprite attachment
ALTER TABLE badge_costs
  ADD COLUMN IF NOT EXISTS icon_url TEXT COMMENT 'Badge icon image (120 sprites available)';
```

**Sprite Mapping**:
- `icon_url`: `/sprites/badges/[badge_subdirectory]/badge_[number].png`
- Naming: `badge_001.png` through `badge_120.png` (organized by category)
- Example: "Wordplay Wizard" badge → `/sprites/badges/image_1764193677602/badge_041.png`

**Badge Organization**:
- `image_1764193675435/`: Negative badges (badge_081-120) - 40 sprites
- `image_1764193677602/`: Positive badges (badge_041-080) - 40 sprites
- `image_1764193680087/`: Content badges (badge_001-040) - 40 sprites

**Note**: 120 badge sprites across 3 subdirectories

---

### 5. CROWD REACTIONS - NEW TABLE REQUIRED

**File**: To be created in new migration

**Proposed Table**:
```sql
CREATE TABLE crowd_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  reaction_code TEXT NOT NULL UNIQUE,
  reaction_name TEXT NOT NULL,
  demographic TEXT NOT NULL CHECK (demographic IN ('black', 'white', 'mixed', 'any')),
  reaction_type TEXT NOT NULL CHECK (reaction_type IN (
    'hype', 'cheer', 'laugh', 'stunned', 'watch', 'record', 'think', 'talk', 'listen',
    'boo', 'cringe', 'disappointed', 'unimpressed', 'bored', 'leave', 'confused', 'pause', 'erupt'
  )),

  -- Sprite attachment
  sprite_url TEXT NOT NULL,
  variant_number INT DEFAULT 1,

  -- Categorization
  emotional_polarity TEXT NOT NULL CHECK (emotional_polarity IN ('positive', 'neutral', 'negative')),
  intensity_level INT CHECK (intensity_level BETWEEN 1 AND 5),

  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one sprite per demographic + reaction combo
CREATE UNIQUE INDEX idx_crowd_reaction_unique
  ON crowd_reactions(demographic, reaction_type, variant_number);
```

**Sprite Mapping**:
- `sprite_url`: `/sprites/crowd/[reaction_category]/crowd_[demographic]_[reaction]_[number].png`
- Current naming convention (from CROWD_CATEGORIZATION.md):
  - `crowd_black_hype_001.png`
  - `crowd_white_record_002.png`
  - `crowd_mixed_laugh_001.png`

**Coverage**: 580 crowd sprites available, organized by demographic (Black 70%, White 15%, Mixed 15%)

**Data Integrity Note**: Crowd reactions aren't critical to core gameplay, but needed for media/visual storytelling.

---

## Complete Schema Migration Plan

### Phase 1: Add Image Columns (IMMEDIATE)

New migration file: `20251201000000_add_sprite_image_columns.sql`

```sql
-- ============================================================================
-- Add Sprite Image Columns to All Tables
-- ============================================================================

-- Leagues: Add logo and icon
ALTER TABLE leagues
  ADD COLUMN IF NOT EXISTS logo_url TEXT COMMENT 'League logo image sprite',
  ADD COLUMN IF NOT EXISTS icon_url TEXT COMMENT 'League icon for UI elements';

-- Cities: Add background and skyline
ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS background_url TEXT COMMENT 'City background image sprite',
  ADD COLUMN IF NOT EXISTS skyline_url TEXT COMMENT 'City skyline variant sprite';

-- Badge Costs: Add icon
ALTER TABLE badge_costs
  ADD COLUMN IF NOT EXISTS icon_url TEXT COMMENT 'Badge icon image sprite';

-- Create crowd reactions table
CREATE TABLE IF NOT EXISTS crowd_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reaction_code TEXT NOT NULL UNIQUE,
  reaction_name TEXT NOT NULL,
  demographic TEXT NOT NULL CHECK (demographic IN ('black', 'white', 'mixed', 'any')),
  reaction_type TEXT NOT NULL CHECK (reaction_type IN (
    'hype', 'cheer', 'laugh', 'stunned', 'watch', 'record', 'think', 'talk', 'listen',
    'boo', 'cringe', 'disappointed', 'unimpressed', 'bored', 'leave', 'confused', 'pause', 'erupt'
  )),
  sprite_url TEXT NOT NULL,
  variant_number INT DEFAULT 1,
  emotional_polarity TEXT NOT NULL CHECK (emotional_polarity IN ('positive', 'neutral', 'negative')),
  intensity_level INT CHECK (intensity_level BETWEEN 1 AND 5),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(demographic, reaction_type, variant_number)
);

CREATE INDEX idx_crowd_reactions_type ON crowd_reactions(reaction_type);
CREATE INDEX idx_crowd_reactions_demographic ON crowd_reactions(demographic);
CREATE INDEX idx_crowd_reactions_polarity ON crowd_reactions(emotional_polarity);
```

---

### Phase 2: RLS Policy Updates

Add policies to allow public read access to image URLs:

```sql
-- Leagues: Ensure image URLs are readable
-- (Already covered by existing policy "Anyone can read leagues")

-- Cities: Ensure image URLs are readable
-- (Already covered by existing policy - no RLS currently)

-- Badge Costs: Ensure image URLs are readable
-- (Not currently RLS protected - can add if needed)

-- Crowd Reactions: Public read access
ALTER TABLE crowd_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read crowd reactions" ON crowd_reactions
  FOR SELECT USING (TRUE);
```

---

## Storage Strategy Recommendation

### Option A: Static Public URLs (RECOMMENDED FOR V1)

**Approach**: Serve sprites from `/sprites/` directory in Next.js public folder

**Advantages**:
- Zero database overhead
- Maximum performance (CDN-cacheable)
- Works immediately with existing setup
- No upload/sync complexity

**Disadvantages**:
- No access control
- Harder to track which sprites are used
- Bulk rename requires file system changes

**Implementation**:
```sql
-- Battler avatar
UPDATE battlers SET avatar_url = '/sprites/characters/image_1764146494580/tru_foe.png'
WHERE stage_name = 'Tru Foe';

-- League logo
UPDATE leagues SET logo_url = '/sprites/leagues/image_1764195526092/algorithm_institute.png'
WHERE short_code = 'ALGORITHM_INSTITUTE';

-- Badge icon
UPDATE badge_costs SET icon_url = '/sprites/badges/image_1764193677602/badge_041.png'
WHERE badge_code = 'wordplay_wizard';

-- City background
UPDATE cities SET background_url = '/sprites/cities/east-coast/new_york_city.png'
WHERE name = 'New York City';

-- Crowd reaction
INSERT INTO crowd_reactions (reaction_code, reaction_name, demographic, reaction_type, sprite_url, emotional_polarity, intensity_level)
VALUES ('black_hype_001', 'Black Hype #1', 'black', 'hype', '/sprites/crowd/hype/crowd_black_hype_001.png', 'positive', 5);
```

---

### Option B: Supabase Storage Buckets (RECOMMENDED FOR V2+)

**Approach**: Upload sprites to Supabase Storage CDN

**Advantages**:
- Built-in access control
- Automatic CDN delivery
- Usage analytics
- Organized by category

**Setup** (not implemented in V1):
```sql
-- Create storage buckets (requires Supabase CLI)
-- supabase storage create-bucket sprites --public
-- supabase storage create-bucket sprites/characters --public
-- supabase storage create-bucket sprites/badges --public
-- etc.

-- RLS policy for public read
CREATE POLICY "Public sprite access" ON storage.objects
  FOR SELECT USING (bucket_id = 'sprites');

-- URL format
-- https://[SUPABASE_URL]/storage/v1/object/public/sprites/characters/tru_foe.png
```

---

## Data Integrity Rules

### Constraints to Add

**1. Battler Image Integrity**
```sql
-- Each AI battler SHOULD have an avatar (not enforced in V1)
-- Check: SELECT * FROM battlers WHERE is_ai = TRUE AND avatar_url IS NULL;
```

**2. League Image Integrity**
```sql
-- All leagues SHOULD have logos
-- Check: SELECT * FROM leagues WHERE logo_url IS NULL;
```

**3. Badge Image Integrity**
```sql
-- All badge_costs SHOULD have icons
-- Check: SELECT * FROM badge_costs WHERE icon_url IS NULL;
```

**4. City Image Integrity**
```sql
-- Major cities SHOULD have backgrounds
-- Check: SELECT * FROM cities WHERE scene_size IN ('major', 'large') AND background_url IS NULL;
```

---

## File Organization Reference

### Battler Sprites (920 files)
- Location: `public/sprites/characters/` (23 subdirectories)
- Format: `image_[timestamp]/[battler_name].png`
- Mapping: Stage name → file name (case-sensitive, lowercase with underscores)

### Badge Sprites (120 files)
- Location: `public/sprites/badges/` (3 subdirectories)
- Format: `image_[timestamp]/badge_[001-120].png`
- Mapping: badge_code → badge number (1-120)
  - badge_001-040: Content badges
  - badge_041-080: Positive badges
  - badge_081-120: Negative badges

### League Sprites (152 files)
- Location: `public/sprites/leagues/` (8 subdirectories)
- Format: `image_[timestamp]/league_[097-152].png`
- Mapping: League name → file name

### Crowd Sprites (580 files)
- Location: `public/sprites/crowd/` (10 subdirectories)
- Format: `image_[timestamp]/crowd_[number].png`
- Needs renaming to: `crowd_[demographic]_[reaction_type]_[variant].png`

### City Sprites (84 files)
- Location: `public/sprites/cities/` (6 regional subdirectories)
- Regional dirs: `east-coast/`, `west-coast/`, `midwest/`, `south/`, `canada/`
- Format: Descriptive image names (ready to map)

---

## Next Steps

1. **Apply Phase 1 migration** to add all image columns
2. **Run bulk attachment script** to populate image URLs
3. **Validate coverage** with verification queries
4. **Update API responses** to include image URLs in battler/league/badge endpoints
5. **Frontend integration** (separate task) to display images from URLs

---

## Verification Queries

```sql
-- Count populated battler avatars
SELECT COUNT(*) as populated,
       COUNT(*) * 100.0 / (SELECT COUNT(*) FROM battlers) as percentage
FROM battlers WHERE avatar_url IS NOT NULL;

-- Find battlers without avatars
SELECT id, stage_name FROM battlers WHERE avatar_url IS NULL LIMIT 10;

-- Count populated league logos
SELECT COUNT(*) FROM leagues WHERE logo_url IS NOT NULL;

-- Count populated badge icons
SELECT COUNT(*) FROM badge_costs WHERE icon_url IS NOT NULL;

-- Count crowd reactions
SELECT COUNT(*) FROM crowd_reactions GROUP BY reaction_type;
```

---

## Summary

**Current State**: Battlers table has image columns but they're unpopulated. No other tables have image support.

**Deliverable**: Complete schema ready for Phase 1 migration + bulk data attachment via SQL script.

**V1 Scope**: Static public URLs serve 1,632 sprites across 4 main categories (battlers, leagues, badges, cities).

**Future Work**: Crowd reactions table and sprite attachment (580 additional sprites).

**Critical Path**: Migration → Data Bulk Update → API Changes → Frontend Display
