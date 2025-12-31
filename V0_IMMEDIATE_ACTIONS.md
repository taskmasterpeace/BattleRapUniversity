# 🚨 V0 - IMMEDIATE ACTIONS REQUIRED

**Priority**: URGENT
**Date**: 2025-12-02

---

## 🔧 **CRITICAL FIXES NEEDED NOW**

### **1. ADD PREP CALENDAR TO NAVIGATION**

**Problem**: Dashboard Quick Nav is missing prep calendar link

**Solution**:
```tsx
// In Dashboard component, add to Quick Nav:
{nextBattle && (
  <Link
    href={`/battle/${nextBattle.id}/prep`}
    className="quick-nav-item"
  >
    📅 PREP CALENDAR
  </Link>
)}
```

**Only show if `nextBattle` exists** - otherwise no active battle to prep for.

---

### **2. FIX "PREP NOW" BUTTON ROUTING**

**Current**: Button may not have correct destination
**Required**: Must link to specific battle's prep page

```tsx
// In "NEXT BATTLE" card:
<Link href={`/battle/${nextBattle.id}/prep`}>
  <Button>PREP NOW</Button>
</Link>
```

**Make sure `nextBattle.id` is available from dashboard API.**

---

### **3. ADD "START BATTLE" BUTTON AFTER PREP LOCKED**

**Location**: `/battle/[id]/prep` page
**Condition**: Show only after prep is locked

```tsx
{prepStatus === 'locked' && battleDate <= now && (
  <Link href={`/battle/${battleId}/watch`}>
    <Button size="lg" className="w-full">
      ⚡ START BATTLE
    </Button>
  </Link>
)}
```

---

### **4. INTEGRATE POST-BATTLE SUMMARY COMPONENT**

**Location**: `/battle/[id]` (Battle Results page)
**Component**: Already exists at `components/battle/PostBattleSummary.tsx`

**Usage**:
```tsx
import PostBattleSummary from '@/components/battle/PostBattleSummary';

// In battle results page, after round breakdown:
{battle.status === 'completed' && postBattleSummary && (
  <PostBattleSummary
    isVictory={battle.winner_battler_id === playerBattler.id}
    attributeChanges={postBattleSummary.attributeChanges}
    badgesEarned={postBattleSummary.badgesEarned}
    stressChange={postBattleSummary.stressChange}
    currentStress={postBattleSummary.currentStress}
    ratingChange={postBattleSummary.ratingChange}
    viewData={postBattleSummary.viewData}
    fanGrowth={postBattleSummary.fanGrowth}
    levelUpData={postBattleSummary.levelUpData}
  />
)}
```

**⚠️ NOTE**: API doesn't return this data yet - mark as "TODO: Needs API enhancement"

---

## 🖼️ **IMAGE OPTIMIZATION REQUIRED**

### **5. USE NEXT.JS IMAGE COMPONENT**

**Problem**: Raw images are 5-7MB each (too large!)

**Solution**: Replace ALL `<img>` tags with Next.js `<Image>`:

```tsx
// ❌ BAD:
<img src={battler.avatar_url} alt={battler.stage_name} />

// ✅ GOOD:
import Image from 'next/image'

<Image
  src={battler.avatar_url || '/sprites/battlers/default-avatar.png'}
  alt={battler.stage_name}
  width={128}
  height={128}
  className="rounded-full object-cover"
  priority={false}  // Lazy load non-critical images
/>
```

---

### **6. IMAGE DIMENSION SPECIFICATIONS**

**Use these dimensions for each image type**:

| Image Type | Dimensions | Aspect Ratio | Usage |
|------------|------------|--------------|--------|
| **Battler Avatar** | 128x128px | 1:1 (Square) | Profile pics, cards |
| **Battler Banner** | 1200x300px | 4:1 (Wide) | Profile header |
| **Badge Icon** | 64x64px | 1:1 (Square) | Badge thumbnails |
| **Venue Background** | 1920x1080px | 16:9 (Landscape) | Battle viewer |
| **Crowd Sprite** | Varies (200-400px wide) | Varies | Battle viewer overlay |
| **League Logo** | 256x256px | 1:1 (Square) | League indicators |
| **Article Thumbnail** | 800x450px | 16:9 (Landscape) | Media hub cards |

**Example Usage**:
```tsx
{/* Battler Avatar */}
<Image
  src={battler.avatar_url}
  width={128}
  height={128}
  alt={battler.stage_name}
  className="rounded-full"
/>

{/* Venue Background */}
<Image
  src={`/sprites/cities/${cityName}-night.png`}
  width={1920}
  height={1080}
  alt="Venue"
  className="absolute inset-0 object-cover"
  priority={true}  // Critical image
/>

{/* Badge Icon */}
<Image
  src={badge.icon_url}
  width={64}
  height={64}
  alt={badge.name}
  className="inline-block"
/>
```

---

### **7. HANDLE MISSING IMAGES**

**Always provide fallback**:
```tsx
<Image
  src={battler.avatar_url || '/sprites/battlers/default-avatar.png'}
  width={128}
  height={128}
  alt={battler.stage_name}
  onError={(e) => {
    e.currentTarget.src = '/sprites/battlers/default-avatar.png';
  }}
/>
```

**Create default placeholders**:
- `/public/sprites/battlers/default-avatar.png` (128x128)
- `/public/sprites/badges/default-badge.png` (64x64)
- `/public/sprites/leagues/default-logo.png` (256x256)

---

## 📊 **DASHBOARD API DATA CONTRACT**

### **8. ENSURE DASHBOARD GETS COMPLETE DATA**

**API Endpoint**: `GET /api/dashboard`

**Required Response Structure**:
```typescript
{
  battler: {
    id: string,
    stage_name: string,
    avatar_url: string | null,
    banner_url: string | null,
    tier: string,
    region: string,
    archetype: string,
    style_tags: string[],
    league: { name, short_code, logo_url }
  },

  stats: {
    elo: number,
    total_battles: number,
    win_rate: number,  // 0-100
    current_streak: number,
    league_rank: number,
    league_total: number,
    tier_progress: {
      current: 'low' | 'mid' | 'top' | 'god',
      next: 'mid' | 'top' | 'god' | null,
      wins_needed: number
    }
  },

  attributes: {
    writing: { lyricism, wordplay, creativity, flow },
    performance: { stage_presence, crowd_control, delivery },
    personal: { financial_stability, reputation, family_bond, preparation },
    resilience: number
  },

  mental_state: {
    stress: number,  // 0-100
    choke_risk: number,  // 0-100
    status: 'focused' | 'stressed' | 'calm' | 'anxious'
  },

  nextBattle: {
    id: string,  // ⚠️ CRITICAL FOR ROUTING
    opponent: {
      id: string,
      stage_name: string,
      avatar_url: string | null,
      elo: number,
      tier: string
    },
    league: { name, short_code },
    scheduled_at: string,
    lock_prep_at: string,
    prep_status: 'not_started' | 'in_progress' | 'locked'
  } | null,

  activeRivalries: [
    {
      opponent: { id, stage_name, avatar_url },
      intensity: number,  // 0-100
      rematch_demand: number,  // 0-100
      head_to_head: { wins, losses },
      last_battle: { result: string, date: string }
    }
  ],

  battleOffersCount: number,

  recentBattles: [
    {
      id: string,
      opponent: { stage_name, avatar_url, elo },
      result: '2-1' | '2-0' | '0-2' | '1-2',
      date: string
    }
  ],

  recentHeadlines: [
    {
      title: string,
      slug: string,
      published_at: string,
      excerpt: string
    }
  ]
}
```

**If API doesn't return this yet**: Use mock data for now, mark fields as "TODO: Backend"

---

## 🎨 **DESIGN SYSTEM REMINDERS**

### **9. MAINTAIN DARK THEME CONSISTENCY**

**Colors**:
```css
--bg-primary: #0a0a0a;      /* bg-zinc-950 */
--bg-secondary: #18181b;    /* bg-zinc-900 */
--border: #27272a;          /* border-zinc-800 */
--text-primary: #f4f4f5;    /* text-zinc-100 */
--text-secondary: #a1a1aa;  /* text-zinc-400 */
--accent: #f97316;          /* bg-orange-500 */
```

**Typography**:
- Headers: `font-black uppercase tracking-tighter`
- Body: `font-bold uppercase tracking-wider`
- Small: `text-xs uppercase tracking-wide`

**Spacing**:
- Container: `max-w-5xl mx-auto px-6`
- Sections: `space-y-6` or `gap-6`

---

## ❌ **WHAT NOT TO DO**

1. ❌ **DON'T** use `<img>` tags - use Next.js `<Image>` component
2. ❌ **DON'T** hardcode image dimensions in CSS - specify in `<Image>` props
3. ❌ **DON'T** forget fallback images for null `avatar_url`
4. ❌ **DON'T** show "PREP" nav link when no battle exists
5. ❌ **DON'T** make "PREP NOW" button if `nextBattle` is null
6. ❌ **DON'T** use light theme colors anywhere
7. ❌ **DON'T** skip lazy loading for non-critical images

---

## ✅ **CHECKLIST BEFORE SENDING TO US**

- [ ] "PREP" link added to Quick Nav (conditional on `nextBattle`)
- [ ] "PREP NOW" button routes to `/battle/[id]/prep`
- [ ] "START BATTLE" button added after prep locked
- [ ] PostBattleSummary component imported (even if data not ready)
- [ ] ALL images using Next.js `<Image>` component
- [ ] Width/height specified for all images
- [ ] Fallback images for null URLs
- [ ] Dark theme consistent across all pages
- [ ] Dashboard displays all required data (or mock data)
- [ ] Loading states for API calls
- [ ] Error states for failed API calls

---

## 🚀 **SEND US WHEN READY**

After completing these fixes:
1. **Export complete codebase** (zip or GitHub repo link)
2. **Screenshot of each page** (especially dashboard, prep, battle results)
3. **List any blockers** or missing API data
4. **Confirm image optimization** is implemented

---

**Questions? Ask before proceeding.**
