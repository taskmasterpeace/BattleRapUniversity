# Known Issues & Limitations

**Battle Rap University - v1.0**
**Last Updated**: November 30, 2025

---

## Overview

This document tracks all known issues, limitations, and technical debt in Battle Rap University. Items are categorized by severity and prioritized for post-launch fixes.

---

## CRITICAL ISSUES

**Definition**: Issues that could cause data loss, security breaches, or complete feature failure.

### None Currently

All critical blockers have been resolved. The application is in a launchable state.

---

## HIGH PRIORITY ISSUES

**Definition**: Issues that significantly impact user experience but have workarounds or partial functionality.

### 1. Badge Earning Logic Incomplete

**Status**: DESIGNED, NOT IMPLEMENTED
**Impact**: Medium

**Description**:
- Badge definitions exist (105 badges in `lib/game/badges.ts`)
- Users can SELECT 3 style tags at battler creation
- Performance-based badge earning NOT implemented

**Current Behavior**:
- Users keep their initial 3 badges forever
- No new badges earned via battles, career milestones, or life events

**Designed System** (not implemented):
- Performance badges: Earn by hitting thresholds (e.g., "Haymaker King" for 5+ peak scores >8.5)
- Playstyle badges: Earn by consistent focus (e.g., "Pen Game" for 80% writing prep)
- Career badges: Earn by achievements (e.g., "Undefeated" for 10-0 record)
- Reputation badges: Earn/lose via behavior (e.g., "Choker" after 3 chokes)

**Workaround**:
- Users play with initial badges
- Badge effects still apply to simulation

**Fix Plan** (Post-Launch):
1. Implement badge tracking after each battle
2. Add badge unlock notifications
3. Create badge progression UI
4. ETA: 1-2 weeks

**Reference**: `BADGE_SYSTEM_REDESIGN_PROPOSAL.md`

---

### 2. Level-Up Rewards Not Implemented

**Status**: PARTIALLY IMPLEMENTED
**Impact**: Medium

**Description**:
- XP system WORKS (users gain XP after battles)
- Level progression WORKS (users level up correctly)
- Skill point rewards WORK (users get skill points per level)
- Level-up CEREMONY not implemented (no visual feedback)
- Unlocks tied to levels NOT implemented

**Current Behavior**:
- Users see XP bar fill on dashboard
- Level increases silently
- Skill points added to total
- No notification or celebration

**Designed System** (not implemented):
- Splash screen on level up
- Confetti animation
- "YOU REACHED LEVEL 5" announcement
- Unlocks: New leagues, tournaments, features at specific levels

**Workaround**:
- Users see level number increase
- Skill points accumulate in background

**Fix Plan** (Post-Launch):
1. Add level-up modal component
2. Trigger on level change
3. Show rewards earned
4. Add animation/celebration
5. ETA: 3-5 days

**Reference**: `XP_AND_LEVEL_SYSTEM_DESIGN.md`

---

### 3. Life Event Consequence Tuning Needed

**Status**: IMPLEMENTED, NEEDS BALANCING
**Impact**: Medium

**Description**:
- Life events trigger correctly (72 trigger points implemented)
- Users make choices (3 options per event)
- Consequences apply to attributes
- Magnitude of changes MAY be too small or too large (needs playtesting data)

**Current Behavior**:
- Events fire after battles (win streaks, chokes, close calls, etc.)
- Users see choices: Accept, Decline, Compromise
- Attributes change (e.g., +0.3 creativity, -0.2 financial stability)
- Impact on gameplay unclear without more data

**Example Issue**:
- "Record Label Offer" gives +0.5 reputation
- Is this enough to feel meaningful?
- Is it too much and breaks progression?

**Workaround**:
- Events still provide narrative engagement
- Players experience story even if numbers need tuning

**Fix Plan** (Post-Launch):
1. Collect 100+ event resolutions
2. Analyze attribute change distributions
3. Tune multipliers in `lib/game/lifeEvents.ts`
4. A/B test adjustments
5. ETA: 2-3 weeks (requires real user data)

**Reference**: `lib/game/lifeEvents.ts` lines 450-520

---

## MEDIUM PRIORITY ISSUES

**Definition**: Issues that impact polish or secondary features but don't block core gameplay.

### 4. Sprite Attachment System Not Implemented

**Status**: DESIGNED, NOT IMPLEMENTED
**Impact**: Low-Medium

**Description**:
- Users can upload custom profile images (works)
- "Sprite database" for pre-made battler avatars NOT implemented
- Designed system: 50+ pre-made sprites, drag-and-drop attachment

**Current Behavior**:
- Users upload their own image via file picker
- No gallery of pre-made options

**Workaround**:
- Manual upload works fine
- Users can use any image

**Fix Plan** (Post-Launch):
1. Create sprite asset pack (design work)
2. Implement sprite gallery UI
3. Add sprite selection to onboarding
4. ETA: 1-2 weeks (depends on asset creation)

---

### 5. Tournament Notifications Incomplete

**Status**: PARTIALLY IMPLEMENTED
**Impact**: Low-Medium

**Description**:
- Tournament registration works
- Tournament battles simulate
- Notifications for tournament START work
- Notifications for MATCH RESULTS incomplete

**Current Behavior**:
- Users get notified when tournament begins
- Users must manually check /tournaments/[id] for match results
- No push notification when their match completes

**Workaround**:
- Users check tournament page regularly

**Fix Plan** (Post-Launch):
1. Add notification trigger after tournament battle simulation
2. Link notification to match results page
3. ETA: 2-3 days

**Reference**: `app/api/internal/run-due-battles/route.ts` line 320

---

### 6. Opponent Info Not Shown in Battle Offers

**Status**: NOT IMPLEMENTED
**Impact**: Low

**Description**:
- Battle offers show opponent name and league
- Opponent's attributes, rating, record NOT shown
- Users accept battles "blind"

**Current Behavior**:
- Offer card shows:
  - Opponent name
  - League
  - Scheduled date
  - Purse (money)
- Does NOT show:
  - Opponent rating
  - Opponent win/loss record
  - Opponent attributes

**Designed Enhancement**:
- Expandable opponent card
- Shows opponent stats
- Helps users make informed decisions

**Workaround**:
- Users accept offers based on purse/league

**Fix Plan** (Post-Launch):
1. Enhance `/api/battles/offers` to fetch opponent data
2. Add collapsible section to offer card
3. Display opponent stats
4. ETA: 2-3 days

---

### 7. Career Stats Not Prominent

**Status**: IMPLEMENTED, UX IMPROVEMENT NEEDED
**Impact**: Low

**Description**:
- Career stats exist in database (`rankings` table)
- Dashboard shows current rating
- Total battles, win rate, streak NOT prominently displayed

**Current Behavior**:
- Users see rating number
- Recent battles shown in list
- No "Career Stats" card

**Designed Enhancement**:
- Stats card on dashboard:
  - Total battles
  - Win/Loss record
  - Current streak
  - Best streak
  - Total earnings

**Workaround**:
- Users can infer stats from battle history

**Fix Plan** (Post-Launch):
1. Add stats card to `DashboardClient.tsx`
2. Query rankings table
3. Calculate totals
4. ETA: 1 day

---

## LOW PRIORITY ISSUES

**Definition**: Minor polish issues, "nice to have" features, or optimization opportunities.

### 8. Loading States Could Be More Engaging

**Status**: FUNCTIONAL, COULD IMPROVE
**Impact**: Low

**Description**:
- Loading spinners present on all pages
- Generic orange spinner used everywhere
- Could be more thematic (e.g., microphone icon, battle rap quotes)

**Fix Plan** (Post-Launch):
1. Design custom loader component
2. Add battle rap themed animations
3. Replace generic spinners
4. ETA: 2-3 days

---

### 9. Error Messages Generic

**Status**: FUNCTIONAL, COULD IMPROVE
**Impact**: Low

**Description**:
- Errors caught and displayed
- Messages often generic: "An error occurred"
- Could be more helpful: "Battle not found. It may have been deleted."

**Fix Plan** (Post-Launch):
1. Audit all error handling
2. Write user-friendly error messages
3. Add context to errors
4. ETA: 3-5 days

---

### 10. No Undo for Life Event Choices

**Status**: BY DESIGN
**Impact**: Low

**Description**:
- Life event choices are permanent
- No way to undo after confirming
- Users may accidentally click wrong choice

**Current Behavior**:
- Confirmation dialog: "Are you sure?"
- After confirming, consequences applied
- No rollback

**Potential Enhancement**:
- 5-minute undo window
- "Undo Last Choice" button

**Fix Plan** (Post-Launch, if requested):
1. Store event resolution with timestamp
2. Allow undo within 5 minutes
3. Reverse attribute changes
4. ETA: 2-3 days

**Note**: May not implement - permanence adds weight to choices

---

### 11. Mobile Menu Animation Janky

**Status**: FUNCTIONAL, COULD IMPROVE
**Impact**: Low

**Description**:
- Mobile hamburger menu works
- Slide-out animation sometimes stutters on slow devices
- Not broken, just not smooth

**Fix Plan** (Post-Launch):
1. Add CSS will-change hint
2. Use GPU-accelerated transforms
3. Test on low-end Android
4. ETA: 1 day

---

### 12. Accessibility (A11y) Not Audited

**Status**: BASIC SUPPORT
**Impact**: Low (but important for inclusivity)

**Description**:
- Semantic HTML used
- No skip links
- No screen reader testing
- Color contrast OK but not verified

**Fix Plan** (Post-Launch):
1. Run Lighthouse accessibility audit
2. Add ARIA labels
3. Add skip navigation links
4. Test with screen reader
5. Verify WCAG 2.1 AA compliance
6. ETA: 5-7 days

---

## TECHNICAL DEBT

### 13. Some Components Use `any` Type

**Status**: LOW PRIORITY REFACTOR
**Impact**: None (functionality works)

**Description**:
- Component props sometimes typed as `any`
- Should use proper interfaces

**Files**:
- `components/battler/OnboardingWizard.tsx`
- `components/battle/RoundContentModal.tsx`

**Fix Plan** (Post-Launch):
1. Define proper TypeScript interfaces
2. Replace `any` with specific types
3. ETA: 2-3 days

---

### 14. API Error Handling Inconsistent

**Status**: FUNCTIONAL, COULD BE STANDARDIZED
**Impact**: None (errors handled)

**Description**:
- Some APIs return `{ error: string }`
- Some return `{ message: string }`
- Some return `{ success: false, error: string }`
- Should standardize response format

**Fix Plan** (Post-Launch):
1. Define standard error response interface
2. Create error utility functions
3. Refactor all API routes
4. ETA: 3-5 days

---

### 15. Database Queries Could Use Views

**Status**: OPTIMIZATION OPPORTUNITY
**Impact**: None (performance OK)

**Description**:
- Dashboard makes 8 parallel queries
- Could use Postgres views for complex joins
- Would reduce API code complexity

**Fix Plan** (Post-Launch, if performance becomes issue):
1. Create database views for common queries
2. Refactor API routes to use views
3. Benchmark performance improvement
4. ETA: 5-7 days

---

## LIMITATIONS BY DESIGN

**These are intentional for V1 and will NOT be "fixed":**

### L1. No Human vs Human Battles

**Reason**: V1 is single-player AI opponent game
**Future**: May add in V2 if demand exists

### L2. One Battler Per Account

**Reason**: Simplifies onboarding and progression
**Future**: May add "stable management" in V2

### L3. No Voice Acting / Audio

**Reason**: Text-based simulation by design
**Future**: May add sound effects, not voice lines

### L4. No User-Generated Lyrics

**Reason**: Fundamental design principle - simulation, not creative writing
**Future**: Will NOT change (core philosophy)

### L5. Segment-Based, Not Bar-Based

**Reason**: Avoids generating actual bars, keeps it abstract
**Future**: Will NOT change (core philosophy)

---

## MONITORING PRIORITIES POST-LAUNCH

**Watch for these issues in production:**

### M1. Choke Rate Distribution

**What to monitor**:
- Average choke rate per battle
- Known Choker badge choke rate
- Clutch Performer badge choke rate

**Expected**:
- Average: 7% of battles have at least one choke
- Known Choker: 45% of battles
- Clutch: 3% of battles

**Alert if**:
- Average >15% or <3%
- Known Choker <30% or >60%

**Fix**: Tune `CHOKE_BASE_PROBABILITY` in `lib/game/config.ts`

---

### M2. Battle Outcome Distribution

**What to monitor**:
- % of 3-0 bodies
- % of 2-1 debatables
- % of upsets (lower-rated wins)

**Expected**:
- Bodies: 20-30%
- Debatables: 40-50%
- Upsets: 15-25%

**Alert if**:
- Bodies >50% (too predictable)
- Upsets <5% (prep doesn't matter)

**Fix**: Tune league weights in `lib/game/config.ts`

---

### M3. Life Event Trigger Frequency

**What to monitor**:
- % of battles that trigger life events
- Distribution across event types

**Expected**:
- 30-40% of battles trigger event

**Alert if**:
- <10% (too rare, users miss feature)
- >60% (too spammy, users annoyed)

**Fix**: Tune trigger thresholds in `lib/game/lifeEvents.ts`

---

### M4. User Retention Metrics

**What to monitor**:
- Day 1 retention
- Day 7 retention
- Battles per user

**Expected**:
- D1: 40%+
- D7: 20%+
- Avg battles per user: 5+

**Alert if**:
- D1 <20%
- Users completing <2 battles

**Fix**: Investigate UX friction, offer pacing, tutorial

---

## REPORTING ISSUES

### For Developers

1. Check this document first
2. Search GitHub issues
3. If new, create issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/device
   - Screenshots/logs

### For Users

1. Check FAQ/help center (when created)
2. Report via in-app feedback (when implemented)
3. Email support (when set up)

---

## CHANGELOG

**v1.0** (Nov 30, 2025)
- Initial release
- 15 known issues documented
- 5 limitations noted
- 4 monitoring priorities established

---

**Next Review**: 7 days post-launch
**Responsible**: Development team
