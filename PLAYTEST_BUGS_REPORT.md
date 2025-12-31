# Playtest Bug Report - December 2025

## Summary

Tested both **Locked In (manual)** and **Auto Mode** battle flows. The UI flow is mostly functional but the core simulation is not connected to the database, resulting in empty/incorrect results.

---

## CRITICAL BUGS

### 1. Battle Simulation Not Running
**Severity:** CRITICAL
**Location:** Both battle modes

**Issue:** Neither Locked In nor Auto Mode actually runs the real battle simulation engine. When battles complete, all stats show as 0.0.

**Evidence:**
- Average Score: 0.0
- Peak Score: 0.0
- Crowd Reaction: 0%
- Segment Timeline: Empty

**Expected:** The simulation engine in `lib/game/simulation.ts` should be called and results persisted to database.

---

### 2. Score Tracker Shows Wrong Values
**Severity:** HIGH
**Location:** Round crafting pages, results pages

**Issue:** The score tracker between rounds shows random/incorrect values:
- Round 1 showed "1-1" after winning Round 1 (should be 1-0)
- Round 2 showed "3-0" after Round 2 (impossible - only 2 rounds done)
- Round 3 showed "0-0" at start (ignoring previous rounds)
- Final showed "2-2" with both "Victory!" and "Defeat" text

**Cause:** Score is calculated randomly using `Math.floor(Math.random() * (roundNum + 1))` instead of tracking actual round wins.

**Files:**
- `app/battle/[id]/round/[roundNum]/results/page.tsx` (lines 70-72)

---

### 3. Content Selection Buttons Empty
**Severity:** MEDIUM
**Location:** Round crafting page (`/battle/[id]/round/[roundNum]/page.tsx`)

**Issue:** The content type, delivery style, and performance energy buttons show only checkmarks but no text labels.

**Cause:** The items array passed to ContentCategorySection doesn't have the correct `name` property, or it's using IDs instead of display names.

**Screenshot Description:**
- 14 content buttons - all empty (just checkmark icons)
- 7 delivery buttons - all empty
- 8 performance buttons - all empty

---

### 4. Judge Scorecard Shows "0-0"
**Severity:** HIGH
**Location:** Battle results page (`/battle/[id]/page.tsx`)

**Issue:** Judge scorecard always shows "FINAL: 0-0" regardless of battle outcome.

**Cause:** No round data is persisted during battle, so the final tally can't be calculated.

---

### 5. Round Data Not Persisted (Locked In Mode)
**Severity:** CRITICAL
**Location:** Locked In battle mode

**Issue:** Round-by-round content selections and simulated results are not saved to the database. Each round generates mock results client-side only.

**Expected Flow:**
1. Player selects content for round
2. Round is simulated via API
3. Results saved to `battle_rounds` and `battle_segments` tables
4. Next round uses cumulative data

**Actual Flow:**
1. Player selects content for round
2. `simulateMockRound()` runs client-side only
3. Results shown but not persisted
4. Final results page has no data

---

## MEDIUM BUGS

### 6. Opponent Name Not Loading Initially
**Severity:** LOW
**Location:** Mode selection page

**Issue:** Shows "vs OPPONENT" initially before loading the real name.

---

### 7. Winner Determination Inconsistent
**Severity:** MEDIUM
**Location:** Round results page

**Issue:** Round 3 showed "Round 3 Lost" even when player scored 7.1 vs opponent 6.9, but also displayed "Debatable Round". The winner field doesn't match the visual presentation.

---

### 8. 404 Errors for Sprites
**Severity:** LOW
**Location:** Battle results page

**Issue:** Console shows multiple 404 errors for missing sprite images:
- Battler character sprites
- Other assets

---

## UI/UX ISSUES

### 9. Score Tracker Shows Both Victory and Defeat
**Location:** Round 3 results page

**Issue:** When viewing Round 3 results, both "Victory!" and "Defeat" text appear simultaneously.

---

### 10. Redundant "TIER TIER" Display
**Location:** Battle results page

**Issue:** Shows "LOW TIER TIER" and "MID TIER TIER" (word TIER duplicated).

---

## FIXED DURING TESTING

### Fixed: ContentCategorySection Props Mismatch
- Component expected `category`, `minSelections`, `maxSelections`
- Page passed `title`, `items`, `selected`, `onSelect`
- **FIXED:** Rewrote component to match page's expected interface

### Fixed: BattleScoreTracker Props Mismatch
- Component expected `rounds` array
- Page passed `playerScore`, `opponentScore`, `currentRound`, `totalRounds`
- **FIXED:** Rewrote component to accept correct props

### Fixed: RoundResultsCard Props Mismatch
- Component expected `playerResult: RoundResult` with averageScore, peakScore
- Page passed `playerScore`, `opponentScore` as numbers
- **FIXED:** Rewrote component to accept correct props

### Fixed: RoundResultsBreakdown Props Mismatch
- Component expected segment-based data
- Page passed category-based data
- **FIXED:** Rewrote component to accept correct props

### Fixed: Key Prop Warning
- ContentCategorySection had `key` prop on wrong line
- **FIXED:** Moved key to button element directly

---

## WHAT WORKS

1. **Battle Offer Generation** - Works via `/api/internal/generate-battle-offers`
2. **Battle Acceptance** - Works, navigates to prep page
3. **Prep Templates** - Balanced Strategy applies correctly
4. **Mode Selection** - Both Locked In and Auto Mode selectable
5. **Quick Presets** - Tech Heavy, Street Mode, etc. work
6. **Round Navigation** - Can navigate through all 3 rounds
7. **Component Rendering** - After fixes, all components render
8. **Crowd Reaction Window** - Displays correctly
9. **Performance Breakdown** - Shows category comparisons
10. **Segment Timeline** - Visual display works (when data exists)

---

## ROOT CAUSE ANALYSIS

The primary issue is **architectural disconnection**:

1. **Two separate systems exist:**
   - Frontend mock simulation (`lib/round-crafting.ts` → `simulateMockRound()`)
   - Backend real simulation (`lib/game/simulation.ts`)

2. **No API integration:**
   - Locked In mode calls `simulateMockRound()` client-side
   - Auto Mode goes directly to results page without calling simulation API
   - Neither mode calls `/api/battles/[id]/rounds/[roundNum]/simulate`

3. **Database not updated:**
   - `battle_rounds` table stays empty
   - `battle_segments` table stays empty
   - Battle `status` may not update to `completed`

---

## RECOMMENDED FIXES (Priority Order)

### P0 - Critical
1. **Integrate simulation API with battle modes**
   - Locked In: Call API after each round lock-in
   - Auto Mode: Call API to simulate all 3 rounds at once
   - Persist results to database

2. **Fix score tracking**
   - Store round winners in state/database
   - Calculate cumulative score correctly

### P1 - High
3. **Fix content button labels**
   - Pass display names to ContentCategorySection items

4. **Fix final results data**
   - Query actual round data from database
   - Calculate winner from stored rounds

### P2 - Medium
5. **Fix sprite 404s**
   - Ensure all sprite paths are correct

6. **Fix "TIER TIER" duplication**
   - Remove redundant text

---

## FILES THAT NEED WORK

| File | Issue |
|------|-------|
| `app/battle/[id]/round/[roundNum]/page.tsx` | Connect to simulation API |
| `app/battle/[id]/round/[roundNum]/results/page.tsx` | Fix score tracking |
| `app/battle/[id]/mode/page.tsx` | Auto mode should call simulation |
| `app/battle/[id]/page.tsx` | Load real round data |
| `lib/round-crafting.ts` | Content type items need names |
| `components/battle/content-category-section.tsx` | Display item names |

---

## TEST COVERAGE NEEDED

1. Integration test: Full Locked In battle flow with database verification
2. Integration test: Full Auto Mode flow with database verification
3. Unit test: Score tracking across rounds
4. Unit test: Content selection persistence

---

*Report generated during manual playtest session*
