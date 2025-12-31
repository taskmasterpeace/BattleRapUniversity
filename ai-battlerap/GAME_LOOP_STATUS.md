# Game Loop Implementation Status

**Date**: November 22, 2024
**Status**: Checking against requirements

---

## Task 1: Lock 2-League Config ✅ COMPLETE

**Requirement**: Define two leagues with specific weights

**Status**: ✅ DONE

**Evidence**:
- File: `supabase/migrations/002_seed_data.sql:7-28`
- Small Room: `round_length=2, writing_weight=0.6, performance_weight=0.4, crowd_factor=0.4` ✓
- Main Stage: `round_length=3, writing_weight=0.4, performance_weight=0.6, crowd_factor=0.7` ✓
- Weights used in simulation: `lib/game/simulation.ts:373-374` ✓

---

## Task 2: Booking Logic ⚠️ NEEDS MINOR FIX

**Requirement**:
- For each player battler
- If no battles in `accepted` or `offered`
- **With 50% probability**, create offer
- Opponent = AI with similar rating
- scheduled_at = now + 7-14 days
- lock_prep_at = scheduled_at - 1 day
- status = 'offered'

**Current Status**:
- ✅ Checks for existing offers/accepted battles
- ✅ Finds AI opponent with similar rating (±200)
- ✅ Schedules 7-14 days ahead
- ✅ Sets lock_prep_at correctly
- ❌ **MISSING**: 50% probability check

**Fix Needed**:
```typescript
// Line 37 in generate-battle-offers/route.ts
// After checking for existing offers, add:
const shouldCreateOffer = Math.random() < 0.5;
if (!shouldCreateOffer) {
  continue;
}
```

**Accept/Decline**:
- ✅ `POST /api/battles/[id]/accept` implemented
- ✅ `POST /api/battles/[id]/decline` implemented
- ✅ Both check ownership
- ✅ Both enforce `status === 'offered'`
- ✅ Decline applies reputation penalty

---

## Task 3: Prep Calendar UI ✅ COMPLETE

**Requirement**:
- `/battles/[id]/prep` page
- Show opponent, league, scheduled date
- Days remaining until lock
- Horizontal list of prep days
- Click day to pick focus
- Disable after lock
- Show summary chart

**Status**: ✅ DONE

**Evidence**: `app/battle/[id]/prep/page.tsx`

**Features Verified**:
- ✅ Shows opponent name, league, scheduled date (lines 158-174)
- ✅ Shows days remaining (line 152)
- ✅ Horizontal grid of prep days (lines 179-221)
- ✅ Click to pick focus (5 options: research, writing, performance, life, rest)
- ✅ Disables after lock_prep_at (line 104: `isLocked`)
- ✅ Shows summary (lines 229-263: counts per focus)
- ✅ Highlights today (line 207: conditional styling)

---

## Task 4: Battle Viewer ⚠️ NEEDS ENHANCEMENT

**Requirement**:
- `/battles/[id]` viewer page
- Winner, league, date at top
- For each round: segmented timeline
  - Each segment as block with height = score
  - Color left/right = who won segment
  - Show average_score, peak_score, consistency_score, crowd_reaction, choked
- Commentary panel using summary_text
- No-show tag if applicable

**Current Status**:
- ✅ Winner, league, date shown (lines 102-124)
- ✅ Round selector (lines 126-149)
- ✅ Shows stats: average, peak, consistency, crowd, choke (lines 158-207)
- ⚠️ **MISSING**: Visual timeline with blocks (currently just lists stats)
- ⚠️ **MISSING**: Commentary panel
- ✅ No-show warning (lines 117-122)

**What's Missing**:
The current viewer shows stats in text form. Needs a visual component like:

```tsx
<div className="flex gap-1">
  {segmentsForRound.map((seg) => (
    <div
      key={seg.id}
      className="relative"
      style={{
        height: `${(seg.segment_score / 10) * 100}px`,
        width: '40px',
        backgroundColor: seg.event_flags.includes('choke') ? 'red' :
                        seg.event_flags.includes('haymaker') ? 'yellow' :
                        seg.battler_id === playerBattler.id ? 'blue' : 'gray'
      }}
    >
      <span className="text-xs">{seg.segment_score.toFixed(1)}</span>
    </div>
  ))}
</div>
```

---

## Task 5: Media/Blog Feed ✅ COMPLETE

**Requirement**:
- `news_articles` table
- `createBattleRecapArticle()` function
- Hook into simulation
- `/media` listing page
- `/media/[slug]` article page

**Status**: ✅ DONE (Phase 6)

**Evidence**:
- ✅ Table: `supabase/migrations/003_news_and_life_events.sql`
- ✅ Function: `lib/services/newsGenerator.ts`
- ✅ Hooked: `lib/game/simulation.ts:515-521`
- ✅ Listing: `app/media/page.tsx`
- ✅ Article page: `app/media/[slug]/page.tsx`
- ✅ Uses react-markdown for rendering

---

## Summary

| Task | Status | Action Needed |
|------|--------|---------------|
| 1. League Config | ✅ COMPLETE | None |
| 2. Booking Logic | ⚠️ NEARLY DONE | Add 50% probability |
| 3. Prep Calendar UI | ✅ COMPLETE | None |
| 4. Battle Viewer | ⚠️ BASIC | Add visual timeline |
| 5. Media Feed | ✅ COMPLETE | None |

---

## What Makes the Game Loop Compelling?

**Currently Working**:
1. ✅ Player gets realistic battle offers (rating-matched)
2. ✅ Player preps with strategic choices
3. ✅ Simulation reflects prep choices in outcomes
4. ✅ Media coverage creates narrative
5. ✅ Ratings evolve over time

**Needs Polish**:
1. ⚠️ Battle viewer should be MORE VISUAL (timeline blocks)
2. ⚠️ Booking needs 50% probability (not guaranteed offers)

---

## Priority Fixes

### High Priority
1. **Add 50% probability to booking** (5 minutes)
2. **Add visual timeline to battle viewer** (30 minutes)

### Optional
- Add commentary panel to battle viewer
- Add battle history page
- Add league standings

---

**Next Action**: Implement the two high-priority fixes.
