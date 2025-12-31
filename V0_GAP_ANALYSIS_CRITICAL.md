# 🚨 V0 GAP ANALYSIS - CRITICAL MISSING PIECES

**Generated**: 2025-12-02
**Status**: URGENT - Navigation & Integration Issues Found

---

## ❌ **CRITICAL NAVIGATION ISSUES**

### **1. PREP CALENDAR NOT IN QUICK NAV**
**Problem**: Dashboard has Quick Nav with Guide, Badges, Finances, Tournaments, Media - but NO CALENDAR link

**Impact**: Users can't easily access prep calendar

**Fix Required**:
```tsx
// Dashboard Quick Nav should include:
<NavLink href="/battle/prep" icon="📅">PREP CALENDAR</NavLink>
```

**BUT WAIT**: Prep calendar is battle-specific (`/battle/[id]/prep`), so:
- Option A: Quick Nav shows "PREP" only if user has active battle
- Option B: Quick Nav goes to generic prep hub that lists active battles
- Option C: Remove from Quick Nav, rely on "PREP NOW" button in "NEXT BATTLE" card

**RECOMMENDED**: Option A - Show "PREP" link only when `nextBattle` exists, link to `/battle/[nextBattle.id]/prep`

---

### **2. "PREP NOW" BUTTON DESTINATION**
**Problem**: Dashboard shows "PREP NOW" button but V0 may not have wired it correctly

**Required Link**:
```tsx
<Link href={`/battle/${nextBattle.id}/prep`}>
  PREP NOW
</Link>
```

**API Data Needed**:
```typescript
// Dashboard API should return:
{
  nextBattle: {
    id: string,           // CRITICAL: Need this for routing
    opponent: {...},
    scheduled_at: string,
    lock_prep_at: string
  }
}
```

---

### **3. NAVIGATION FROM PREP TO BATTLE VIEWER**
**Problem**: After locking prep, user needs path to watch battle

**Flow**:
```
/battle/[id]/prep (LOCKED)
  → Button: "START BATTLE" or "WATCH BATTLE"
  → /battle/[id]/watch
```

**Condition**: Only show "START BATTLE" if:
- Prep is locked (`POST /api/battles/[id]/lock-in` completed)
- Battle date has passed (`scheduled_at <= now`)

---

## ❌ **MISSING UI COMPONENTS**

### **4. POST-BATTLE SUMMARY NOT INTEGRATED** ⭐⭐⭐
**Status**: Component EXISTS (`components/battle/PostBattleSummary.tsx`) but NOT USED

**Location**: Should appear on `/battle/[id]` (Battle Results page) after battle completes

**Data Required** (API Enhancement Needed):
```typescript
// GET /api/battles/[id] MUST return:
{
  battle: {...},
  rounds: [...],
  segments: [...],

  // ❌ MISSING - Need to add:
  postBattleSummary: {
    ratingChange: +25,
    attributeChanges: [
      { attribute: 'lyricism', category: 'writing', oldValue: 6.0, newValue: 6.5, change: +0.5 },
      // ...
    ],
    badgesEarned: ['master_wordsmith', 'haymaker_king'],
    stressChange: +13,
    currentStress: 58,
    viewData: {
      total_views: 15000,
      view_tier: 'mid'
    },
    fanGrowth: {
      fans_before: 250,
      fans_after: 387,
      fans_gained: 137,
      trending_change: +15
    },
    levelUpData: {
      leveledUp: true,
      previousLevel: 5,
      newLevel: 6,
      skillPointsEarned: 3,
      xpEarned: 450,
      xpBreakdown: {...}
    }
  }
}
```

**Action Required**:
1. Enhance `/api/battles/[id]` to fetch progression data
2. Integrate `<PostBattleSummary />` component in battle results page
3. Show as modal or section below round breakdown

---

### **5. LIFE EVENTS VIEWER** ⭐⭐
**Status**: Backend FULLY IMPLEMENTED, NO UI SPEC for V0

**Routes Exist**:
- `/life-events/[id]` - Detail page for single event
- `/life-events/history` - Full history list

**What's Missing**: V0 doesn't know how to build these pages

**Data Available**:
```typescript
// GET /api/life-events returns:
{
  events: [
    {
      id,
      template_code,
      event_tier, // 'minor' | 'moderate' | 'major'
      title,
      description,
      trigger_reason,
      status, // 'pending' | 'resolved' | 'expired'
      choice_made,
      requires_choice,
      created_at,
      template: {
        category, // 'relationship' | 'financial' | 'career' | 'health' | 'reputation'
        icon_name,
        primary_stat_effect,
        choices // if applicable
      }
    }
  ]
}
```

**UI Needed**:
- Life event notification card (when `status='pending'`)
- Choice dialog (if `requires_choice=true`)
- Life events history list
- Life event detail view

---

### **6. BLOGGER PROFILES / MEDIA PERSONALITY SYSTEM** ⭐
**Status**: Backend implemented (`bloggerMemory.ts`, blogger perspectives), NO UI

**What's Missing**:
- Blogger profile pages (`/media/blogger/[slug]`)
- Blogger card in article header (shows author, bias, style)
- Multiple bloggers with different voices/perspectives

**Backend Has**:
- 5+ blogger personas (TrapLobos, ThirdPersonTay, DrakeFromState, etc.)
- Blogger memory system (remembers past coverage)
- Bias system (pro-player, anti-player, neutral)

**Example Blogger Data**:
```typescript
{
  slug: 'trap-lobos',
  name: 'TrapLobos',
  style: 'aggressive_journalism',
  bias_tendency: 'controversial',
  signature_phrases: ['allegedly', 'sources say', 'the culture is watching'],
  articles_count: 23
}
```

**UI Needed**:
- Blogger byline in articles ("Written by TrapLobos")
- Blogger profile page with all their articles
- Blogger filter in Media Hub

---

### **7. NOTIFICATIONS DROPDOWN** ⭐
**Status**: Component EXISTS (`components/notifications/NotificationDropdown.tsx`), may not be in header

**Where It Should Be**: Top-right of every page (next to "Sign Out")

**Data Source**: `GET /api/notifications`

**Bell Icon**: Shows count of unread notifications

**Dropdown Content**:
- List of recent notifications (battle results, life events, offers)
- "Mark all as read" button
- Link to `/notifications` for full list

---

### **8. RIVALRY HISTORY MODAL** ⭐
**Status**: Backend has head-to-head tracking, V0 may have built modal but needs data

**Trigger**: Clicking "VIEW RIVALRY HISTORY" button in battle offers

**Data Source**: `GET /api/battles/rivalry/[battler1_id]/[battler2_id]`

**Should Show**:
- Head-to-head record (3-2, You lead)
- Last 5 battles between these two
- Grudge intensity meter (0-100)
- Rematch demand percentage
- Narrative text ("After your controversial 2-1 win...")

---

## ❌ **IMAGE OPTIMIZATION CRITICAL**

### **9. IMAGE SIZE PROBLEM** ⭐⭐⭐
**Problem**: Raw images are HUGE (5-7MB each)

**Examples**:
- Battler avatars: 5.8MB - 6.3MB PNG
- Badge icons: 6.2MB - 6.8MB PNG
- Crowd sprites: Unknown size

**Impact**:
- Slow page loads
- Excessive bandwidth
- Poor mobile experience

**V0 NEEDS TO KNOW**:
```tsx
// Image optimization pattern:
import Image from 'next/image'

<Image
  src={battler.avatar_url}
  alt={battler.stage_name}
  width={128}    // ⚠️ NEED TO SPECIFY
  height={128}   // ⚠️ NEED TO SPECIFY
  className="rounded-full"
  priority={false}  // Lazy load
/>
```

**Action Required**:
1. Tell V0 expected dimensions for each image type:
   - Battler avatar: 128x128px (square, portrait)
   - Badge icon: 64x64px (square)
   - Crowd sprite: Width varies, ~200-400px
   - Venue background: 1920x1080px (16:9, landscape)
   - Banner: 1200x300px (4:1, wide)

2. Tell V0 to use Next.js `<Image>` component for ALL sprites

3. Consider image compression before upload (or use Next.js image optimization)

---

## ❌ **MISSING SCREEN SPECS**

### **10. SCREENS WITH NO DETAILED SPEC YET**

**URGENT** (V0 needs these):
1. ✅ Dashboard - They built it, but needs audit
2. ❌ Battle Results (with PostBattleSummary integration)
3. ❌ Battle Offers (with rivalry modal)
4. ❌ Battler Career (4-tab layout)
5. ❌ Badges Compendium
6. ❌ Finances (with line graph)
7. ❌ Tournaments (with brackets)
8. ❌ Media Hub
9. ❌ Article Detail
10. ❌ Life Events History
11. ❌ Life Event Detail
12. ❌ Blogger Profile
13. ❌ Notifications Page
14. ❌ Dev Tools

**We've Only Spec'd**:
- ✅ Live Battle Viewer
- ✅ Character Creation / Onboarding
- 🚧 Battle Prep Calendar (in progress)

---

## ❌ **DATA CONTRACT ISSUES**

### **11. DASHBOARD API MISMATCH**
**Problem**: V0's dashboard shows data we may not be returning properly

**Dashboard Shows**:
- Active Rivalries (intensity %, rematch demand %, last battle result)
- Recent Battles (opponent, ELO, result)
- Recent Headlines (title, date)
- Next Battle (opponent, league, dates, "PREP NOW" button)
- Career Summary (total battles, win rate, streak, rank, tier progress)
- Mental State (stress, choke risk)
- Battle Offers count

**API Endpoint Needed**: `GET /api/dashboard`

**Should Return**:
```typescript
{
  battler: {
    id, stage_name, avatar_url, banner_url, tier, region,
    archetype, style_tags, league
  },
  stats: {
    elo: 1245,
    total_battles: 15,
    win_rate: 73,
    current_streak: 3,
    league_rank: 12,
    league_total: 47,
    tier_progress: {
      current: 'mid',
      next: 'top',
      wins_needed: 2
    }
  },
  attributes: { writing, performance, personal, resilience },
  mental_state: {
    stress: 45,
    choke_risk: 8,
    status: 'focused' // 'focused' | 'stressed' | 'calm' | 'anxious'
  },
  nextBattle: {
    id, // ⚠️ CRITICAL
    opponent: { id, stage_name, avatar_url, elo, tier },
    league: { name, short_code },
    scheduled_at,
    lock_prep_at,
    prep_status: 'not_started' | 'in_progress' | 'locked'
  },
  activeRivalries: [
    {
      opponent: { id, stage_name, avatar_url },
      intensity: 85,
      rematch_demand: 92,
      head_to_head: { wins: 2, losses: 1 },
      last_battle: { result: '2-1 Win (You)', date }
    }
  ],
  battleOffersCount: 3,
  recentBattles: [
    { opponent, elo, result: '2-1', date }
  ],
  recentHeadlines: [
    { title, slug, published_at, excerpt }
  ]
}
```

---

## ✅ **WHAT V0 HAS DONE RIGHT**

1. ✅ Dashboard layout looks fire
2. ✅ Active Rivalries section (nice!)
3. ✅ Next Battle card with prep status
4. ✅ Recent Battles history
5. ✅ Recent Headlines integration
6. ✅ Career summary stats
7. ✅ Mental state indicator
8. ✅ Quick Nav structure
9. ✅ Dark theme consistency
10. ✅ Typography following design system

---

## 🔥 **IMMEDIATE ACTION ITEMS FOR V0**

### **PRIORITY 1: NAVIGATION FIXES**
1. Add conditional "PREP" link to Quick Nav (only show if nextBattle exists)
2. Wire "PREP NOW" button to `/battle/[nextBattle.id]/prep`
3. Add "START BATTLE" button on locked prep page → `/battle/[id]/watch`

### **PRIORITY 2: INTEGRATE POST-BATTLE SUMMARY**
1. Enhance `/api/battles/[id]` to return `postBattleSummary` data
2. Import and render `<PostBattleSummary />` on battle results page
3. Show after round breakdown

### **PRIORITY 3: IMAGE OPTIMIZATION**
1. Use Next.js `<Image>` component for ALL images
2. Specify width/height for each image type
3. Enable lazy loading
4. Document expected dimensions

### **PRIORITY 4: LIFE EVENTS UI**
1. Create `/life-events/history` page (list view)
2. Create `/life-events/[id]` page (detail view)
3. Add notification badge for pending events
4. Build choice dialog modal

### **PRIORITY 5: BLOGGER SYSTEM**
1. Add blogger byline to articles
2. Create `/media/blogger/[slug]` profile page
3. Add blogger filter to Media Hub

---

## 📋 **NEXT SPEC DOCUMENTS NEEDED**

1. **Battle Results** (with PostBattleSummary integration)
2. **Battle Offers** (with rivalry modal)
3. **Dashboard API** (complete data contract)
4. **Life Events** (history + detail views)
5. **Blogger Profiles**
6. **Notifications Page**
7. **Battler Career** (4-tab layout)
8. **Badges Compendium**

---

**END OF GAP ANALYSIS**
