# V0 Handoff - Battle Rap University

**Date**: December 3, 2025

This is your master guide for frontend fixes and new features. Read this first, then work through the linked documents.

---

## QUICK STATUS

| Area | Status | Priority |
|------|--------|----------|
| Page Connections | BROKEN | CRITICAL |
| Battle Components | 60% Complete | HIGH |
| API Integration | Mock Data Only | MEDIUM |
| Styling | 90% Dark Theme | LOW |

---

## DOCUMENTS TO REVIEW

Read these in order:

### 1. V0_PRIORITY_FIXES.md
**What**: Critical bugs to fix NOW
- Prep page doesn't connect to mode selection
- Round flow navigation issues
- Complete navigation map

**Action**: Fix these first before building new features

### 2. V0_MISSING_COMPONENTS_SPEC.md
**What**: 6 components that need to be built
- JudgeScorecard
- CrowdReactionWindow
- MatchupPreview
- BattleAnalysis
- RoundResultsBreakdown
- BattleViewsDisplay

**Action**: Build after fixing navigation

### 3. V0_API_CONTRACT.md
**What**: API endpoints and data formats
- Request/response types for all APIs
- Mock data to use until backend ready
- Error handling patterns

**Action**: Reference when building components

### 4. V0_AUDIT_CHECKLIST.md
**What**: Full implementation checklist
- Page existence check
- Component audit
- API verification
- Test scenarios

**Action**: Use to verify your work

### 5. ROUND_CRAFTING_AND_PREP_SYSTEM_V2.md
**What**: Complete prep/round system redesign
- Segment-based content (not round-based)
- Research → Writing → Rehearsal flow
- Counter preparation system
- Badge effects on prep

**Action**: Reference for V2 features (after V1 working)

---

## IMMEDIATE PRIORITIES

### This Week: Fix Navigation

```
Current (BROKEN):
  Prep → Dashboard (dead end)

Target (WORKING):
  Prep → Mode Selection → Round 1 → Results → Round 2 → ... → Final Results → Dashboard
```

**Files to modify**:
1. `app/battle/[id]/prep/page.tsx` - Add "LOCK PREP & BATTLE" button
2. `app/battle/[id]/round/[roundNum]/results/page.tsx` - Fix "Next Round" routing
3. `app/battle/[id]/page.tsx` - Add "Return to Dashboard" button

### Next Week: Build Missing Components

Build in this order:
1. JudgeScorecard (needed for final results)
2. RoundResultsBreakdown (needed for round results)
3. CrowdReactionWindow (adds life to results)
4. MatchupPreview (pre-battle hype)
5. BattleAnalysis (post-battle insights)
6. BattleViewsDisplay (social proof)

### After That: V2 Features

- Segment-based content crafting in prep page
- Counter preparation slots
- Round shifting with penalty
- Dashboard prep progress widget

---

## FILE LOCATIONS

### Pages
```
app/
├── battle/
│   ├── offers/page.tsx           # Battle offers list
│   └── [id]/
│       ├── page.tsx              # Final battle results
│       ├── prep/page.tsx         # Prep calendar
│       ├── mode/page.tsx         # Mode selection (Locked In vs Auto)
│       ├── watch/page.tsx        # Battle replay
│       └── round/
│           └── [roundNum]/
│               ├── page.tsx      # Content selection
│               └── results/page.tsx  # Round results
├── dashboard/page.tsx            # Main dashboard
├── media/
│   ├── page.tsx                  # News hub
│   └── [slug]/page.tsx           # Article detail
└── onboarding/page.tsx           # Character creation
```

### Components
```
components/
├── battle/
│   ├── round-content-selector.tsx    # Content type picker
│   ├── effectiveness-forecast.tsx    # Matchup preview
│   ├── mode-selection-card.tsx       # Mode picker
│   ├── round-results-card.tsx        # Round summary
│   ├── battle-score-tracker.tsx      # Running score
│   ├── segment-timeline.tsx          # Segment vis
│   └── ... (add missing components here)
└── ui/
    └── ... (shared UI components)
```

---

## STYLING REFERENCE

Always use dark theme:

```tsx
// Backgrounds
bg-zinc-950      // Page background
bg-[#2d2f35]     // Card background
bg-[#18191c]     // Darker sections

// Borders
border-[#3a3d44] // Default border
border-[#ff8c42] // Accent/selected

// Text
text-white       // Primary text
text-zinc-400    // Secondary text
text-[#ff8c42]   // Accent text (orange)

// Status colors
text-green-500   // Success/winner
text-red-500     // Error/loser
text-orange-400  // Warning/attention

// Buttons
bg-[#ff8c42] hover:bg-[#ff9f5a] text-black  // Primary
bg-zinc-800 hover:bg-zinc-700 text-white    // Secondary
```

---

## TESTING YOUR CHANGES

After each fix, test this flow:

1. `/dashboard` - See next battle
2. `/battle/[id]/prep` - Fill prep calendar
3. Click "LOCK PREP & BATTLE"
4. `/battle/[id]/mode` - Select "Locked In"
5. `/battle/[id]/round/1` - Select content
6. Submit → `/battle/[id]/round/1/results`
7. "Next Round" → `/battle/[id]/round/2`
8. Repeat for rounds 2-3
9. Final → `/battle/[id]`
10. "Return to Dashboard" → `/dashboard`

If any step breaks, fix before continuing.

---

## QUESTIONS?

If you need clarification on:
- **Game mechanics**: Check `CLAUDE.md` or `ROUND_CRAFTING_AND_PREP_SYSTEM_V2.md`
- **API data**: Check `V0_API_CONTRACT.md`
- **Component design**: Check `V0_MISSING_COMPONENTS_SPEC.md`
- **Full feature list**: Check `V0_FRONTEND_MASTER_CHECKLIST.md`

---

## BACKEND STATUS

Backend (Claude) will implement:
- All API routes in `V0_API_CONTRACT.md`
- Battle simulation engine
- Prep progression calculations
- Badge effect calculations

Frontend (V0) should:
- Use mock data until APIs ready
- Build UI components
- Handle routing/navigation
- Implement form validation

---

Good luck! Start with `V0_PRIORITY_FIXES.md`.
