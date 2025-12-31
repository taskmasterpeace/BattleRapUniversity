# 📋 V0 - MASTER SCREEN SPECS CHECKLIST

**All UI screens that need detailed specifications**

---

## ✅ **COMPLETED SPECS**

1. ✅ **Live Battle Viewer** - Full spec with venue, crowd, battlers, UI overlay
2. ✅ **Character Creation / Onboarding** - 4-step wizard with attribute allocation
3. 🚧 **Battle Prep Calendar** - In progress (90% complete)

---

## 🔥 **PRIORITY 1: CORE GAMEPLAY** (Build These Next)

### **4. BATTLE RESULTS PAGE** ⭐⭐⭐
**Route**: `/battle/[id]`
**Purpose**: Post-battle breakdown with round scores, segments, winner

**Must Include**:
- Winner announcement banner
- Round-by-round breakdown (3 rounds)
- Segment timeline visualization (color-coded: green/yellow/red)
- Battle payout display ($1,900 Total)
- **PostBattleSummary component integration** ⚠️
  - Rating changes (+25 ELO)
  - Attribute improvements (+0.5 Writing, +0.2 Performance)
  - Badges earned (Master Wordsmith badge unlocked!)
  - Stress changes (45 → 58)
  - View count and fan growth
  - XP earned and level-up notification
- Media recap link (if article exists)
- "RETURN TO DASHBOARD" button

**Data Source**: `GET /api/battles/[id]`

**PostBattleSummary Props**:
```typescript
{
  isVictory: boolean,
  attributeChanges: AttributeChange[],
  badgesEarned: string[],
  stressChange: number,
  currentStress: number,
  ratingChange: number,
  viewData?: { total_views, view_tier },
  fanGrowth?: { fans_before, fans_after, fans_gained, trending_change },
  levelUpData?: { leveledUp, previousLevel, newLevel, skillPointsEarned, xpEarned }
}
```

---

### **5. BATTLE OFFERS PAGE** ⭐⭐⭐
**Route**: `/battle/offers`
**Purpose**: View available battles and accept/decline

**Must Include**:
- List of available offers (cards)
- Each offer card shows:
  - Opponent name + avatar + tier badge
  - ELO difference (1250 ↔ 1180, +50 vs You)
  - Potential payout ($2,100 with rivalry bonus)
  - League name + logo
  - Battle type badge ("🔥 GRUDGE MATCH" or "💰 Driver Offer" or "REGULAR MATCH")
  - Intensity meter (for rivalry battles: 85/100)
  - Rematch demand % (92% - Fans want this!)
- Accept / Decline buttons
- **VIEW RIVALRY HISTORY** button (opens modal)
- Filter options (All Offers / Grudge Matches / Driver Offers)
- Sort options (Highest Pay / Closest Rating / Most Anticipated)

**Rivalry History Modal**:
- Head-to-head record (3-2, You lead)
- Last 5 battles between opponents
- Grudge intensity timeline
- Narrative summary ("After your controversial 2-1 win...")

**Data Source**: `GET /api/battles/offers`

**Response**:
```typescript
{
  offers: [
    {
      battle_id,
      opponent: { id, stage_name, avatar_url, tier, elo },
      league: { name, short_code, logo_url },
      scheduled_at,
      lock_prep_at,
      base_payout,
      bonus_payout,
      total_payout,
      offer_type: 'regular' | 'grudge' | 'driver' | 'rematch',
      rivalry_data?: {
        intensity: 85,
        rematch_demand: 92,
        head_to_head: { wins: 3, losses: 2 },
        last_battle: { result: '2-1 Win (You)', date }
      }
    }
  ]
}
```

---

## 🎯 **PRIORITY 2: PLAYER HUB SCREENS**

### **6. DASHBOARD API ENHANCEMENT** ⭐⭐
**Route**: `/dashboard` (already built, needs correct data)
**Purpose**: Main hub with stats, next battle, rivalries, offers

**Required**: Detailed API contract specification (see V0_IMMEDIATE_ACTIONS.md #8)

---

### **7. BATTLER CAREER PAGE** ⭐⭐
**Route**: `/battler/[id]`
**Purpose**: 4-tab career profile view

**Tabs**:
1. **OVERVIEW** - Stats summary, archetype, style tags, recent performance trend
2. **BATTLES** - Full battle history with filters (wins/losses, league, date range)
3. **RIVALRIES** - All active rivalries with intensity meters, head-to-head records
4. **MEDIA** - All news articles mentioning this battler

**Overview Tab Shows**:
- Battler portrait (large) + banner background
- Career summary (Total Battles: 15, Win Rate: 73%)
- Current tier + progress bar
- ELO rating + rank in league (#12 of 47)
- Performance trend line graph (last 10 battles)
- Earned badges showcase (grid of badge icons)
- Archetype label ("Technical Writer")
- Style tags (Wordplay, Schemes, Rebuttals)

**Data Source**: `GET /api/battler/[id]/career`

---

### **8. BADGES COMPENDIUM** ⭐⭐
**Route**: `/badges`
**Purpose**: Browse all 97 badges with filters

**Must Include**:
- Filter by category (Content / Delivery / Performance / Reputation)
- Filter by tier (Bronze / Silver / Gold / Platinum)
- Filter by status (Earned / Locked)
- Grid layout of badge cards
- Each card shows:
  - Badge icon (64x64px)
  - Badge name
  - Tier (color-coded)
  - Status (✓ Earned or 🔒 Locked)
  - Hover: Description + unlock requirements
- Click badge → Opens detail modal with full description and effect

**Badge Detail Modal**:
- Large icon (128x128px)
- Full name and description
- Effect description ("Reduces choke chance by 3%")
- Unlock requirement ("Win 5 battles with high lyricism average")
- Progress bar (if applicable: 3/5 battles)

**Data Source**: `GET /api/badges`

**Response**:
```typescript
{
  badges: [
    {
      badge_code,
      badge_name,
      tier: 'bronze' | 'silver' | 'gold' | 'platinum',
      category: 'content' | 'delivery' | 'performance' | 'reputation',
      icon_url,
      description,
      effect_description,
      unlock_requirement,
      is_earned: boolean,
      earned_at?: string,
      progress?: { current: 3, required: 5 }
    }
  ]
}
```

---

## 💰 **PRIORITY 3: ECONOMY & PROGRESSION**

### **9. FINANCES PAGE** ⭐
**Route**: `/finances`
**Purpose**: Financial tracking with line graph

**Must Include**:
- Battler portrait at top (showing whose finances these are)
- Current Balance (large, prominent: **$12,450**)
- Lifetime Earnings ($45,230)
- Battle Earnings ($38,900)
- **LINE GRAPH** (using Recharts):
  - X-axis: Date (last 30 days or all-time)
  - Y-axis: Balance ($)
  - Shows running balance over time
  - Highlight spikes (battle payouts)
- Earnings breakdown (bar chart or pie chart):
  - Battle Base Pay: $28,000
  - Win Bonuses: $10,900
  - Tournament Prizes: $0
  - Life Events: +$500 / -$200
- Recent transactions list (last 20):
  - Date, Description, Amount (+$2,100)
  - Color-coded: Green for gains, Red for losses

**Data Source**: `GET /api/finances` (already built!)

**Response**:
```typescript
{
  battler: { id, name, avatar_url },
  currentBalance: 12450,
  lifetimeEarnings: 45230,
  battleEarnings: 38900,
  earningsOverTime: [    // FOR LINE GRAPH
    { date: '2025-11-15', balance: 5000, amount: 0, type: 'starting' },
    { date: '2025-11-20', balance: 7100, amount: 2100, type: 'battle_base_pay' },
    { date: '2025-11-22', balance: 7600, amount: 500, type: 'battle_win_bonus' },
    // ...
  ],
  breakdown: {
    battle_base_pay: 28000,
    battle_win_bonus: 10900,
    tournament_prize: 0,
    life_event_gain: 500,
    life_event_loss: -200
  },
  recentTransactions: [...]
}
```

**Recharts Example**:
```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={earningsOverTime}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="balance" stroke="#f97316" strokeWidth={2} />
  </LineChart>
</ResponsiveContainer>
```

---

### **10. TOURNAMENTS PAGE** ⭐
**Route**: `/tournaments`
**Purpose**: View and register for tournaments

**Must Include**:
- Tabs: Upcoming / Active / Completed
- Tournament cards showing:
  - Name + description
  - League logo
  - Prize pool ($5,000)
  - Participant count (12/16)
  - Registration deadline
  - Tier restriction (Low/Mid only)
  - Status badge (✅ REGISTERED or "REGISTER" button)
  - User's seed # (if registered: Seed #7)
- **Bracket visualization** (for Active/Completed):
  - Single-elimination bracket tree
  - Show matchups, winners, current round
- Winners showcase (for Completed):
  - 1st place: Portrait + prize amount
  - 2nd place: Portrait + prize amount

**Data Source**: `GET /api/tournaments` (already built!)

---

### **11. ROSTER PAGE** ⭐
**Route**: `/roster`
**Purpose**: Manage multiple battlers (V1: single battler, future-proofed)

**Must Include**:
- Grid of battler cards
- Each card shows:
  - Avatar (large)
  - Stage name
  - Tier badge
  - Win rate (73%)
  - Next battle info (if exists)
  - "VIEW CAREER" button → `/battler/[id]`
- Stats summary for each battler
- "CREATE NEW BATTLER" button (future feature)

**Data Source**: `GET /api/roster` (already built!)

---

## 📰 **PRIORITY 4: MEDIA & CONTENT**

### **12. MEDIA HUB** ⭐
**Route**: `/media`
**Purpose**: Browse news articles about battles and battlers

**Must Include**:
- Featured article (large card at top)
- Article grid (3-4 columns)
- Each article card:
  - Thumbnail image (800x450px, 16:9)
  - Title
  - Excerpt (1-2 sentences)
  - Published date
  - Blogger byline ("By TrapLobos")
  - Category tag (Battle Recap / Career Update / Scandal / Analysis)
- Filters:
  - All / Battle Recaps / Career Updates / Scandals / Analysis
  - Sort: Recent / Most Viewed / Trending
- Pagination or infinite scroll

**Data Source**: `GET /api/news-articles`

---

### **13. ARTICLE DETAIL PAGE** ⭐
**Route**: `/media/[slug]`
**Purpose**: Full article view

**Must Include**:
- Hero image (if exists)
- Article title (large, bold)
- **Blogger byline with avatar** ("By TrapLobos" + small avatar)
- Published date
- Category tag
- Full article body (Markdown rendered)
- Related articles sidebar (3-5 related posts)
- "BACK TO MEDIA HUB" button

**Blogger Byline Should Link**: `/media/blogger/[slug]` (blogger profile)

**Data Source**: `GET /api/news-articles/[slug]`

---

### **14. BLOGGER PROFILE PAGE** (NEW) 🆕
**Route**: `/media/blogger/[slug]`
**Purpose**: View all articles by a specific blogger

**Must Include**:
- Blogger header:
  - Avatar (if exists)
  - Name
  - Bio / Description
  - Style tag ("Aggressive Journalism" / "Balanced Analysis" / etc.)
  - Article count (23 articles)
- List of all articles by this blogger (chronological)
- Same card format as Media Hub

**Data Source**: `GET /api/bloggers/[slug]` (needs to be created)

**Bloggers**:
- TrapLobos (aggressive, controversial)
- ThirdPersonTay (analytical, balanced)
- DrakeFromState (dramatic, hype-focused)
- BattleRapChris (technical breakdowns)
- QueenzFlip (street perspective)

---

## 🔔 **PRIORITY 5: NOTIFICATIONS & EVENTS**

### **15. LIFE EVENTS HISTORY** (NEW) 🆕 ⭐⭐
**Route**: `/life-events/history`
**Purpose**: View all past life events

**Must Include**:
- Timeline layout (chronological)
- Each event card shows:
  - Icon (based on category: ❤️ relationship, 💰 financial, 🎤 career, 🏥 health, 🗣️ reputation)
  - Title
  - Description
  - Date triggered
  - Tier badge (Minor / Moderate / Major)
  - Status (✓ Resolved / ⏳ Pending / ❌ Expired)
  - Choice made (if applicable)
  - Stat effects applied
- Filter by:
  - All / Pending / Resolved / Expired
  - Category (Relationship / Financial / Career / Health / Reputation)
  - Tier (Minor / Moderate / Major)

**Data Source**: `GET /api/life-events`

---

### **16. LIFE EVENT DETAIL PAGE** (NEW) 🆕 ⭐⭐
**Route**: `/life-events/[id]`
**Purpose**: View single event and make choice (if required)

**Must Include**:
- Large event card:
  - Icon (large, 128px)
  - Title
  - Full description
  - Trigger reason ("Triggered after winning 3 battles in a row")
  - Date
  - Tier badge
- **If requires choice**:
  - List of 2-3 choices with radio buttons
  - Each choice shows:
    - Choice text
    - Stat effects preview (+Financial +5, -Family Bond -2)
  - "MAKE CHOICE" button
- **If already resolved**:
  - Show choice made
  - Show actual stat changes applied
- "BACK TO HISTORY" button

**Data Source**: `GET /api/life-events/[id]`

**Submit Choice**: `POST /api/life-events/[id]/resolve` with `{ choice_key: 'option_a' }`

---

### **17. NOTIFICATIONS PAGE** (NEW) 🆕
**Route**: `/notifications`
**Purpose**: Full list of all notifications

**Must Include**:
- Tab: Unread / All
- Notification list (chronological, newest first)
- Each notification:
  - Icon (based on type)
  - Title
  - Body text
  - Date
  - "Mark as Read" button (if unread)
  - Link to related content (battle results, life event, etc.)
- "Mark All as Read" button
- Empty state: "No notifications yet"

**Data Source**: `GET /api/notifications`

**Notification Types**:
- Battle Result ("Your battle vs Young Pattern is complete!")
- Battle Offer ("New battle offer available")
- Life Event ("A new life event has occurred")
- Badge Earned ("You earned the Master Wordsmith badge!")
- Level Up ("You reached Level 6!")
- Tournament Update ("Tournament bracket updated")

---

## 🛠️ **PRIORITY 6: DEV TOOLS**

### **18. DEV TOOLS PAGE**
**Route**: `/dev`
**Purpose**: Developer controls for testing

**Must Include**:
- Time manipulation:
  - Set virtual time (date picker)
  - Fast-forward X days
  - Reset to real time
- Battle controls:
  - Force simulate battle (by ID)
  - Generate battle offers
  - Auto-accept next offer
- Life event triggers:
  - Spawn random life event
  - Spawn specific event by code
- Database utils:
  - Reset player progress
  - View raw data (JSON viewer)
- Badge utils:
  - Grant badge by code
  - Remove badge

**Only show in dev mode** (check env variable)

---

## ✅ **SPEC COMPLETION CHECKLIST**

- [x] Live Battle Viewer
- [x] Character Creation / Onboarding
- [ ] Battle Prep Calendar (90% done)
- [ ] Battle Results (with PostBattleSummary)
- [ ] Battle Offers (with Rivalry Modal)
- [ ] Dashboard API Contract
- [ ] Battler Career (4-tab)
- [ ] Badges Compendium
- [ ] Finances (with line graph)
- [ ] Tournaments (with brackets)
- [ ] Roster
- [ ] Media Hub
- [ ] Article Detail
- [ ] Blogger Profile
- [ ] Life Events History
- [ ] Life Event Detail
- [ ] Notifications Page
- [ ] Dev Tools

**Total**: 18 screens, 3 complete, 15 remaining

---

## 📦 **NEXT STEPS**

1. ✅ Send V0 the gap analysis (V0_GAP_ANALYSIS_CRITICAL.md)
2. ✅ Send V0 immediate actions (V0_IMMEDIATE_ACTIONS.md)
3. ⏳ Create detailed specs for Priority 1 screens:
   - Battle Results
   - Battle Offers
4. ⏳ Create specs for Priority 2 screens
5. ⏳ Continue until all 18 specs complete

---

**Want me to create any of these specs now? Which should I prioritize?**
