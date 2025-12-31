# MCP-Powered Development Plan
**Battle Rap University - Next Steps**
**Date**: December 2, 2025
**Context**: All 5 MCP servers now connected, ready to accelerate development

---

## 🎯 THE BIG PICTURE: Where We Are

### What You Built (The Journey So Far)
You've built a **massive, complex battle rap simulation game** with:
- ✅ Full auth + onboarding (character creation)
- ✅ Battle offer system (AI generates offers)
- ✅ Prep planning calendar (daily focus selection)
- ✅ Battle simulation engine (segment-based, not bar-based)
- ✅ Battle results viewer with segment timeline
- ✅ Dashboard with stats, next battle, history
- ✅ Media/news generation (AI-written battle recaps)
- ✅ Life events system
- ✅ XP/Level progression (IMPLEMENTED!)
- ✅ Badge system backend (IMPLEMENTED!)
- ✅ Database with 56 tables
- ✅ 100+ character sprites extracted

### The Decision Point (Where We Were Stuck)
**The design docs said**: "Badge system NOT IMPLEMENTED, XP system NOT IMPLEMENTED"
**Reality discovered today**: They ARE implemented in database + backend code!

**The REAL gap**: These systems aren't **visible in the UI** yet.
- XP/levels are tracked but not displayed
- Badges are earned but not shown
- PostBattleSummary component exists but isn't used
- Player has no idea they're leveling up or earning badges

**This is why we needed MCP servers** - to:
1. **Investigate fast** (postgres queries vs slow API testing)
2. **Build UI components** (filesystem for rapid file ops)
3. **Test visually** (playwright to screenshot and validate)
4. **Remember context** (memory to track decisions across sessions)
5. **Reason deeply** (sequential-thinking for complex problems)

---

## 🛠️ How We'll Use Each MCP Server

### 1. **Postgres MCP** (Database Superpowers)
**What it does**: Query Supabase database directly, no API routes needed

**How we'll use it**:
```sql
-- Check if player has XP/badges right now
SELECT stage_name, level, total_xp, skill_points_available
FROM battlers WHERE user_id = '<your_user_id>';

-- See if battle_progression is recording XP
SELECT xp_earned, xp_breakdown, badges_earned
FROM battle_progression ORDER BY created_at DESC LIMIT 5;

-- Validate badge earning is working
SELECT battler_id, badges_at_creation FROM battlers LIMIT 5;
```

**Why it's game-changing**:
- Instant feedback (no "create API endpoint → test → debug" cycle)
- Can inspect data WHILE building UI
- Validate calculations match design docs
- Debug issues in seconds instead of minutes

---

### 2. **Filesystem MCP** (File Operations on Steroids)
**What it does**: Enhanced file operations, directory management

**How we'll use it**:
- Read multiple files at once (compare components side-by-side)
- Create batches of components (scaffold entire feature)
- Organize sprites (map 100+ character sprites to battlers)
- Search patterns across codebase (find all XP references)

**Why it's game-changing**:
- Faster than Read/Write tools (I can handle complex file trees)
- Can analyze entire directories at once
- Better for refactoring (move files, update imports)

---

### 3. **Playwright MCP** (Visual Testing Magic)
**What it does**: Browser automation - navigate, screenshot, interact

**How we'll use it**:
```javascript
// Navigate to dashboard
await page.goto('http://localhost:3000/dashboard');

// Take screenshot of current state
await page.screenshot({ path: 'dashboard-before.png' });

// Simulate battle, refresh, screenshot again
await page.screenshot({ path: 'dashboard-after.png' });
```

**Real examples**:
- **Before adding XP bar**: Screenshot dashboard
- **After adding XP bar**: Screenshot again → compare side-by-side
- **Test battle flow**: Click accept → prep → simulate → see XP gained
- **Validate UI consistency**: Check all pages use new fonts

**Why it's game-changing**:
- I can SEE what you see (validate UI changes visually)
- Catch layout bugs before you test manually
- Automated screenshot comparisons
- E2E testing without writing test scripts

---

### 4. **Memory MCP** (Persistent Context Across Conversations)
**What it does**: Knowledge graph that persists between sessions

**Status**: ✅ Already seeded with:
- Project overview (Battle Rap University)
- XP system status (IMPLEMENTED)
- Badge system status (IMPLEMENTED)
- Current implementation gap (UI missing)

**How we'll use it**:
- **Remember decisions**: "We decided to use Rajdhani font for headers"
- **Track implementation**: "XP bar added to dashboard on Dec 2"
- **Avoid rework**: "Don't redesign badge system, it already exists"
- **Maintain consistency**: "Always use service role client for internal APIs"

**Why it's game-changing**:
- New conversation? I already know the context
- You don't need to re-explain the project
- Decisions persist (no "wait, why did we choose that?" moments)

**Important**: Memory is LOCAL to your machine (stored in MCP server data folder)

---

### 5. **Sequential Thinking MCP** (Deep Reasoning for Complex Problems)
**What it does**: Enhanced multi-step reasoning with branching/revisions

**When we'll use it**:
- **Complex refactoring**: "How do we migrate badge storage without breaking existing data?"
- **Architecture decisions**: "Should badges be in battlers table or separate badge_earned table?"
- **Performance optimization**: "Why is dashboard loading slow?"
- **Debugging**: "Battle simulation runs but XP isn't saved - trace the flow"

**Why it's game-changing**:
- Better problem decomposition
- Can revise thinking mid-analysis
- Handles uncertainty (explores multiple approaches)
- Documents reasoning for future reference

---

## 🎯 THE PLAN: What We Build Now

### Phase 0: **Investigation** (TODAY - 30 minutes)
**Goal**: Verify what's actually working vs what's missing

**Tasks**:
1. ✅ Query database to see if XP/badges are being tracked (DONE - they are!)
2. Check if XP calculation runs after battle simulation
3. Check if badge earning logic is wired up
4. Screenshot current dashboard (baseline)
5. Run a test battle → check if `battle_progression` row created

**Tools**: Postgres MCP (queries), Playwright MCP (screenshots)

**Output**: "Implementation Status Report" - what works, what's missing

---

### Phase 1: **Make Progression VISIBLE** (Week 1 - 8-12 hours)
**Goal**: Player can SEE their XP, level, badges

#### Task 1.1: Add XP Bar to Dashboard
- **Component**: `<XPProgressBar level={5} currentXP={3200} nextLevelXP={5000} />`
- **Location**: `app/dashboard/page.tsx`
- **Data source**: Query `battlers` table (level, current_level_xp)
- **Design**: Orange progress bar, shows "Level 5 → 6 | 3,200 / 5,000 XP"

#### Task 1.2: Add Badge Display to Profile
- **Component**: `<BadgeGrid badges={['FREESTYLE_GENIUS', 'WORDPLAY_WIZARD']} />`
- **Location**: `app/dashboard/page.tsx` or new `/profile` page
- **Data source**: Query `battlers.badges_at_creation` + `battle_progression.badges_earned`
- **Design**: Badge icons (or text pills), tooltip shows badge description

#### Task 1.3: Wire Up PostBattleSummary Component
- **Problem**: Component exists (`components/battle/PostBattleSummary.tsx`) but NOT USED
- **Solution**: Render it on battle results page (`app/battle/[id]/page.tsx`)
- **Shows**:
  - XP earned breakdown (base + win + haymaker + etc.)
  - Badges earned (if any)
  - Attribute changes (from progression.ts)
  - Rating changes (ELO delta)
  - Level up notification (if leveled up)

**Tools**: Filesystem (create components), Postgres (test queries), Playwright (screenshot results)

---

### Phase 2: **Skill Point System** (Week 2 - 6-8 hours)
**Goal**: Player can SPEND skill points to boost attributes

#### Task 2.1: Skill Point Allocation UI
- **Component**: `<SkillPointAllocator available={4} spent={{lyricism: 2}} />`
- **Shows**: All 7 attributes with +/- buttons
- **Constraint**: Can't exceed MAX_SKILL_POINTS_PER_ATTRIBUTE (10 per attribute)
- **Effect**: Each point = +0.1 to attribute (hardcoded in xpLevels.ts)

#### Task 2.2: API Endpoint for Spending Points
- **Endpoint**: `POST /api/progression/spend-skill-points`
- **Body**: `{ attributeName: 'lyricism', points: 2 }`
- **Updates**:
  - `battlers.skill_points_available -= 2`
  - `battlers.skill_points_spent.lyricism += 2`
  - `battler_attributes.lyricism += 0.2`

#### Task 2.3: Notification When Points Available
- **Location**: Dashboard shows "⚡ 4 Skill Points Available!"
- **Action**: Click → opens skill point allocator modal

---

### Phase 3: **Badge Earning is VISIBLE** (Week 3 - 8-10 hours)
**Goal**: Player sees badge progress and unlock notifications

#### Task 3.1: Badge Progress Tracker
- **Component**: `<BadgeProgressCard badge="PUNCHLINE_KING" progress={6} target={10} />`
- **Shows**: "6/10 haymaker segments toward Punchline King"
- **Data**: Currently no `badge_progress` table - need to add or compute on-the-fly

#### Task 3.2: Badge Unlock Animation
- **Trigger**: When `battle_progression.badges_earned` has new badge
- **Effect**: Confetti + modal showing badge name, description, effects
- **Persist**: Mark as "seen" so it doesn't show again

#### Task 3.3: Badge Effects Tooltip
- **Location**: Hover over any badge
- **Shows**:
  - Badge description ("Master of complex wordplay")
  - Mechanical effects ("+40% wordplay, +20% creativity")
  - How earned ("Use wordplay in 15+ battles")

---

### Phase 4: **Polish & Testing** (Week 4 - 6-8 hours)
**Goal**: Everything feels smooth, no bugs

#### Task 4.1: Visual Consistency Pass
- Use Playwright to screenshot ALL pages
- Verify new fonts (Rajdhani) are applied everywhere
- Check dark theme consistency (bg-zinc-950, text-zinc-100)
- Fix any layout breaks

#### Task 4.2: Data Validation
- Run test battles and verify:
  - XP calculation matches design doc
  - Badge earning triggers correctly
  - Skill point math is accurate (each point = +0.1)
  - Level-up happens at correct XP thresholds

#### Task 4.3: Edge Cases
- What if player has 0 skill points? (hide allocator)
- What if player maxed out an attribute? (disable + button)
- What if battle has no haymakers? (XP breakdown shows 0)

---

## 📋 ANSWER TO YOUR QUESTION: "Where Were We?"

**The Big Decision Point**:
You asked me what I needed to get the game going. I said:
- "I need to see the database" → **Postgres MCP** (now have it!)
- "I need to test the UI visually" → **Playwright MCP** (now have it!)
- "I need to remember context" → **Memory MCP** (now have it!)

**The Disconnect**:
The design docs (BADGE_SYSTEM_REDESIGN_PROPOSAL.md, XP_LEVEL_SYSTEM_IMPLEMENTATION_PROPOSAL.md) were written as "here's what we SHOULD build" but a LOT of it was ALREADY built!

**Today's Discovery**:
- XP system: ✅ Database schema exists, ✅ Code exists (xpLevels.ts)
- Badge system: ✅ Partial DB schema, ✅ Code exists (badgeSystem.ts, badgeEarning.ts)
- **Missing**: UI components to SHOW this to the player

**The Path Forward**:
Stop designing, start CONNECTING. We have:
- Backend ✅ (simulation, XP calc, badge tracking)
- Database ✅ (56 tables, all relationships)
- What we need: **UI components** to surface progression to the player

---

## 🚀 NEXT SESSION: Where Do We Start?

### Option A: "Show Me Proof It Works" (Investigation)
**Time**: 30 minutes
**What**:
1. Query DB to see your battler's XP/badges
2. Run a test battle
3. Verify `battle_progression` row created with XP breakdown
4. Screenshot current dashboard

**Why start here**: Validate our assumptions before building UI

---

### Option B: "Make It Visible NOW" (Quick Win)
**Time**: 2 hours
**What**:
1. Add XP bar to dashboard (shows level + progress)
2. Add badge display (shows badges_at_creation)
3. Take screenshots (before/after)

**Why start here**: Immediate visual progress, motivating

---

### Option C: "Wire Up PostBattleSummary" (Highest Impact)
**Time**: 3 hours
**What**:
1. Update `/api/battles/[id]` to fetch XP/badge data
2. Render `<PostBattleSummary>` on battle results page
3. Test with a simulated battle

**Why start here**: This is the "aha!" moment - player sees XP earned after battle

---

## 🤔 Questions for YOU:

1. **Did you know XP/badges were already implemented?** Or did you think they were still in design phase?

2. **Have you ever SEEN the XP bar or badges in the UI?** Or has it always been "invisible backend tracking"?

3. **Do you want to start with investigation (Option A) or jump straight to building UI (Option B/C)?**

4. **What would be the most EXCITING thing to see first?**
   - XP bar on dashboard?
   - "You earned 250 XP!" after battle?
   - Badge unlock notification?
   - Skill point allocator?

5. **About the sprites**: You mentioned 100+ character sprites extracted. Do you want me to:
   - Map them to battlers NOW (create sprite mapping system)?
   - Use placeholders for now (just show initials)?
   - Extract UI sprites FIRST (VS icons, haymakers, etc.)?

6. **Old conversation context**: You said "I almost wanna find parts of the old conversation and paste it in here" - what specific decisions or context do you remember that I should know?

---

## 📝 Memory Server Clarification

**YES, it's local!** The memory MCP server stores data on YOUR machine, not in the cloud.

**Location**: Wherever the MCP server stores its data (usually in your user folder)

**Persistence**: Survives across:
- ✅ Closing/reopening Claude Code
- ✅ New conversations
- ✅ Computer restarts

**Does NOT persist across**:
- ❌ Different computers
- ❌ Uninstalling MCP server
- ❌ Clearing MCP data folder

**What I've stored so far**:
- Project overview (Battle Rap University)
- Tech stack details
- XP system implementation status
- Badge system implementation status
- Current gaps (UI missing)

**In future conversations**, I'll already know this context. You won't need to re-explain "what is Battle Rap University" or "what's the tech stack".

---

## 🎬 Ready When You Are!

Tell me:
1. **Which option** (A, B, or C)?
2. **Answer the 6 questions above** (or just the ones you feel like answering)
3. **Any concerns or priorities** I should know about?

Then we CODE! 🚀
