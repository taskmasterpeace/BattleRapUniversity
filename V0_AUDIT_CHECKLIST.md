# V0 Implementation Audit Checklist

This checklist verifies that the frontend implementation matches our specs and that all pages connect properly. Go through each section and check the boxes as you verify.

---

## PART 1: PAGE FLOW VERIFICATION

The complete user journey should flow seamlessly. Check that each transition works.

### 1.1 Battle Offer Flow
```
/battle/offers → Accept → /battle/[id]/prep
```

- [ ] Battle offers page (`/battle/offers/page.tsx`) exists and displays offers
- [ ] Clicking "Accept" on an offer routes to prep page
- [ ] Declining an offer returns to offers list
- [ ] Accepted battles disappear from offers list

### 1.2 Prep to Mode Selection Flow
```
/battle/[id]/prep → "READY FOR BATTLE" → /battle/[id]/control
```

- [ ] Prep page has a "READY FOR BATTLE" or "LOCK PREP" button
- [ ] Button routes to `/battle/[id]/control` (mode selection)
- [ ] **CRITICAL FIX**: Currently "SAVE & RETURN" goes to dashboard - this should go to control page when prep is complete
- [ ] Prep page shows prep deadline countdown
- [ ] Cannot proceed to battle before prep lock date

### 1.3 Mode Selection Flow
```
/battle/[id]/control → "Locked In" → /battle/[id]/round/1/select
/battle/[id]/control → "Auto" → /battle/[id] (simulated results)
```

- [ ] Control page (`/battle/[id]/control/page.tsx`) shows two mode options
- [ ] "Locked In" mode routes to round content selection
- [ ] "Auto" mode simulates battle and routes to results
- [ ] Mode selection is saved to database

### 1.4 Round Content Selection Flow (Per Round)
```
/battle/[id]/round/[roundNum]/select → Submit → /battle/[id]/round/[roundNum]/results
```

- [ ] Round select page allows choosing content/delivery/performance types
- [ ] Validation: 3-4 content, 1-2 delivery, 1-2 performance
- [ ] Submit button routes to round results
- [ ] Opponent selection is generated/retrieved

### 1.5 Round Results to Next Round Flow
```
/battle/[id]/round/1/results → "Next Round" → /battle/[id]/round/2/select
/battle/[id]/round/3/results → "View Final Results" → /battle/[id]
```

- [ ] Round results page shows simulation outcome
- [ ] "Continue to Round X" button exists and works
- [ ] After round 3, routes to final battle results
- [ ] Running score/momentum is displayed

### 1.6 Final Results Flow
```
/battle/[id] → "Return to Dashboard" → /dashboard
```

- [ ] Battle results page shows complete breakdown
- [ ] Winner is clearly displayed
- [ ] Return to dashboard button works
- [ ] Battle appears in "Recent Battles" on dashboard

---

## PART 2: PAGE EXISTENCE CHECK

Verify all required pages exist:

### Battle System Pages

| Page | Path | File Exists? | Functional? |
|------|------|--------------|-------------|
| Battle Offers | `/battle/offers` | [ ] | [ ] |
| Prep Planner | `/battle/[id]/prep` | [ ] | [ ] |
| Mode Selection | `/battle/[id]/control` | [ ] | [ ] |
| Round 1 Select | `/battle/[id]/round/1/select` | [ ] | [ ] |
| Round 1 Results | `/battle/[id]/round/1/results` | [ ] | [ ] |
| Round 2 Select | `/battle/[id]/round/2/select` | [ ] | [ ] |
| Round 2 Results | `/battle/[id]/round/2/results` | [ ] | [ ] |
| Round 3 Select | `/battle/[id]/round/3/select` | [ ] | [ ] |
| Round 3 Results | `/battle/[id]/round/3/results` | [ ] | [ ] |
| Battle Results | `/battle/[id]` | [ ] | [ ] |
| Battle Promotion | `/battle/[id]/promotion` | [ ] | [ ] |

### Dashboard & Profile Pages

| Page | Path | File Exists? | Functional? |
|------|------|--------------|-------------|
| Dashboard | `/dashboard` | [ ] | [ ] |
| Onboarding | `/onboarding` | [ ] | [ ] |
| Login | `/login` | [ ] | [ ] |
| Media Hub | `/media` | [ ] | [ ] |
| Article Detail | `/media/[slug]` | [ ] | [ ] |

---

## PART 3: COMPONENT AUDIT

Check that all components exist and function correctly:

### Battle Components (in `components/battle/`)

| Component | File | Purpose | Exists? | Working? |
|-----------|------|---------|---------|----------|
| RoundContentSelector | `RoundContentSelector.tsx` | 3-column type selector | [ ] | [ ] |
| EffectivenessForecast | `EffectivenessForecast.tsx` | Shows matchup multipliers | [ ] | [ ] |
| PostBattleSummary | `PostBattleSummary.tsx` | Post-battle stats | [ ] | [ ] |
| RoundResultsBreakdown | `RoundResultsBreakdown.tsx` | Round-by-round analysis | [ ] | [ ] |
| CrowdReactionWindow | `CrowdReactionWindow.tsx` | Crowd reaction display | [ ] | [ ] |
| JudgeScorecard | `JudgeScorecard.tsx` | Judge scoring display | [ ] | [ ] |
| MatchupPreview | `MatchupPreview.tsx` | Pre-battle matchup info | [ ] | [ ] |
| BattleAnalysis | `BattleAnalysis.tsx` | Overall battle analysis | [ ] | [ ] |
| BattleViewsDisplay | `BattleViewsDisplay.tsx` | View count display | [ ] | [ ] |

### Dashboard/Battler Components (in `components/battler/`)

| Component | File | Purpose | Exists? | Working? |
|-----------|------|---------|---------|----------|
| DashboardClient | `DashboardClient.tsx` | Main dashboard UI | [ ] | [ ] |
| OnboardingWizard | `OnboardingWizard.tsx` | Character creation | [ ] | [ ] |
| BattlerCard | `BattlerCard.tsx` | Battler info display | [ ] | [ ] |
| AttributeDisplay | `AttributeDisplay.tsx` | Stats visualization | [ ] | [ ] |

---

## PART 4: API ENDPOINT VERIFICATION

Check that all API routes exist and work:

### Battle API Routes

| Endpoint | Method | Path | Purpose | Exists? | Returns Data? |
|----------|--------|------|---------|---------|---------------|
| Get Offers | GET | `/api/battles/offers` | List battle offers | [ ] | [ ] |
| Get Battle | GET | `/api/battles/[id]` | Get battle details | [ ] | [ ] |
| Accept Battle | POST | `/api/battles/[id]/accept` | Accept offer | [ ] | [ ] |
| Decline Battle | POST | `/api/battles/[id]/decline` | Decline offer | [ ] | [ ] |
| Get/Set Prep | GET/POST | `/api/battles/[id]/prep` | Prep blocks | [ ] | [ ] |
| Lock In Mode | POST | `/api/battles/[id]/lock-in` | Set battle mode | [ ] | [ ] |
| Round Content | GET/POST | `/api/battles/[id]/rounds/[roundNum]/content` | Round selections | [ ] | [ ] |
| Simulate Round | POST | `/api/battles/[id]/rounds/[roundNum]/simulate` | Run round sim | [ ] | [ ] |
| Get Round | GET | `/api/battles/[id]/rounds/[roundNum]` | Round data | [ ] | [ ] |

### Internal API Routes

| Endpoint | Method | Path | Purpose | Exists? | Working? |
|----------|--------|------|---------|---------|----------|
| Generate Offers | POST | `/api/internal/generate-battle-offers` | Create AI offers | [ ] | [ ] |
| Run Due Battles | POST | `/api/internal/run-due-battles` | Simulate ready battles | [ ] | [ ] |

---

## PART 5: PREP SYSTEM REQUIREMENTS

Per `ROUND_CRAFTING_AND_PREP_SYSTEM_V2.md`:

### Prep Page Must Have:

- [ ] Daily focus selection (Research, Writing, Rehearsal, Life, Rest)
- [ ] "PERFORMANCE" renamed to "REHEARSAL"
- [ ] Progress bars for each prep category
- [ ] Prep deadline countdown
- [ ] Segment content crafting section (NEW - needs implementation)
- [ ] Round organization section (NEW - needs implementation)
- [ ] "Ready for Battle" button that goes to control page

### Prep Focus Options:

| Focus | Description | Implemented? |
|-------|-------------|--------------|
| Research | Study opponent | [ ] |
| Writing | Craft content | [ ] |
| Rehearsal | Practice delivery | [ ] |
| Life | Personal matters | [ ] |
| Rest | Reduce stress | [ ] |

### Prep Progress Tracking:

- [ ] Research level tracked (Casual/Aggressive)
- [ ] Writing progress shown (X/Y segments)
- [ ] Rehearsal progress per round
- [ ] Dashboard shows prep status widget

---

## PART 6: ROUND CRAFTING REQUIREMENTS

Per `ROUND_CRAFTING_AND_PREP_SYSTEM_V2.md`:

### Content Selection (RoundContentSelector)

- [ ] Shows all 14 content types
- [ ] Shows all 7 delivery types
- [ ] Shows all 8 performance types
- [ ] Selection limits enforced (3-4 / 1-2 / 1-2)
- [ ] Category badges colored correctly (attack=red, technical=blue, etc.)
- [ ] Descriptions shown on hover/click

### Effectiveness Forecast (EffectivenessForecast)

- [ ] Shows content effectiveness multiplier
- [ ] Shows crowd preference multiplier
- [ ] Shows context modifier
- [ ] Shows final combined multiplier
- [ ] Lists strong/weak matchups
- [ ] Color coding: green (>1.2x), gray (0.9-1.2x), orange/red (<0.9x)

### Mode Selection (Control Page)

- [ ] "Locked In" option with description
- [ ] "Auto" option with description
- [ ] Clear visual distinction between modes
- [ ] Routes correctly based on selection

---

## PART 7: DATA FLOW VERIFICATION

### Content Types Data

- [ ] `lib/game/contentTypes.ts` exists with all types defined
- [ ] `getAllContentTypes()` returns 14 content types
- [ ] `getAllDeliveryTypes()` returns 7 delivery types
- [ ] `getAllPerformanceTypes()` returns 8 performance types

### Round Selection Data

- [ ] Content selections saved to database
- [ ] Opponent selections generated/stored
- [ ] Effectiveness calculated using `calculateEffectivenessForecast()`

### Battle State Flow

```
status: offered → accepted → locked → simulating → completed
```

- [ ] Battle status transitions correctly at each step
- [ ] `lock_prep_at` date enforced
- [ ] Winner set atomically with completion

---

## PART 8: CRITICAL ISSUES TO FIX

### High Priority

1. **Prep → Control Connection**
   - [ ] ISSUE: Prep page "SAVE & RETURN" goes to dashboard
   - [ ] FIX: Add "READY FOR BATTLE" button that goes to `/battle/[id]/control`

2. **PostBattleSummary Not Used**
   - [ ] ISSUE: Component exists but isn't rendered on results page
   - [ ] FIX: Add to `/battle/[id]/page.tsx`

3. **Light Theme Pages**
   - [ ] ISSUE: Some pages use `bg-white` instead of dark theme
   - [ ] FIX: Update `/battle/offers`, `/media`, `/media/[slug]` to use `bg-zinc-950`

### Medium Priority

4. **Segment-Based Content (V2)**
   - [ ] ISSUE: Current system is round-based, not segment-based
   - [ ] FIX: Add segment crafting to prep page per V2 spec

5. **Counter System**
   - [ ] ISSUE: No counter preparation system
   - [ ] FIX: Add counter slot to prep page (1 default, badges add more)

6. **Round Shifting**
   - [ ] ISSUE: Cannot reorganize rounds mid-battle
   - [ ] FIX: Add round shift option with penalty

### Lower Priority

7. **Dashboard Prep Widget**
   - [ ] Add prep progress overview to dashboard

8. **Badge Effects on Prep**
   - [ ] Implement badge modifiers for prep efficiency

---

## PART 9: STYLING CONSISTENCY CHECK

All pages should use dark theme. Check these values:

### Background Colors
- [ ] Main background: `bg-zinc-950` or `bg-[#18191c]`
- [ ] Card backgrounds: `bg-zinc-900` or `bg-[#2d2f35]`
- [ ] NO `bg-white`, `bg-gray-*` used anywhere

### Border Colors
- [ ] Borders use: `border-zinc-800` or `border-[#3a3d44]`
- [ ] Accent borders: `border-[#ff8c42]` (orange)

### Text Colors
- [ ] Primary text: `text-white` or `text-zinc-100`
- [ ] Secondary text: `text-zinc-400` or `text-zinc-500`
- [ ] Accent text: `text-[#ff8c42]` or `text-orange-500`

### Category Colors (Content Types)
- [ ] Attack: `bg-red-900/30 text-red-400`
- [ ] Technical: `bg-blue-900/30 text-blue-400`
- [ ] Entertainment: `bg-purple-900/30 text-purple-400`
- [ ] Adaptive: `bg-green-900/30 text-green-400`

---

## PART 10: TEST SCENARIOS

Run these manual tests to verify full functionality:

### Test 1: Complete Battle Flow (Auto Mode)
1. [ ] Go to `/battle/offers`
2. [ ] Accept a battle offer
3. [ ] Fill out prep calendar for a few days
4. [ ] Click ready/proceed to mode selection
5. [ ] Select "Auto" mode
6. [ ] Verify battle simulates and shows results
7. [ ] Return to dashboard
8. [ ] Verify battle appears in "Recent Battles"

### Test 2: Complete Battle Flow (Locked In Mode)
1. [ ] Accept a battle offer
2. [ ] Complete prep
3. [ ] Select "Locked In" mode
4. [ ] Select content for Round 1
5. [ ] Submit and view Round 1 results
6. [ ] Continue to Round 2, repeat
7. [ ] Continue to Round 3, repeat
8. [ ] View final battle results
9. [ ] Verify all 3 round scores shown

### Test 3: Effectiveness Forecast
1. [ ] Go to round content selection
2. [ ] Select some content types
3. [ ] Verify EffectivenessForecast component updates
4. [ ] Check multiplier colors make sense
5. [ ] Strong/weak lists populate correctly

### Test 4: Validation Enforcement
1. [ ] Try to proceed with 0 content types selected
2. [ ] Should be blocked
3. [ ] Select 5+ content types
4. [ ] Should be blocked at 4
5. [ ] Verify limits: 3-4 content, 1-2 delivery, 1-2 performance

---

## AUDIT COMPLETION SUMMARY

After completing this audit, fill in:

**Date Audited**: _______________

**Auditor**: _______________

### Pages
- Total Required: 15
- Existing: __/15
- Functional: __/15

### Components
- Total Required: 13
- Existing: __/13
- Functional: __/13

### API Routes
- Total Required: 11
- Existing: __/11
- Working: __/11

### Critical Issues Found
1. ________________________________
2. ________________________________
3. ________________________________

### Notes/Comments
_____________________________________________
_____________________________________________
_____________________________________________

---

## NEXT STEPS AFTER AUDIT

Based on audit results, prioritize fixes:

1. **First**: Fix page connections (prep → control flow)
2. **Second**: Fix styling inconsistencies (light theme pages)
3. **Third**: Implement missing components
4. **Fourth**: Implement V2 features (segment crafting, counters)

Refer to these spec documents for implementation details:
- `ROUND_CRAFTING_AND_PREP_SYSTEM_V2.md` - Complete prep/crafting system
- `ROUND_CRAFTING_FRONTEND_SPEC.md` - UI component specs
- `V0_FRONTEND_MASTER_CHECKLIST.md` - Full feature checklist
