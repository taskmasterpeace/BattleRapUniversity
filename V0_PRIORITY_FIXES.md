# V0 Priority Fixes - Battle Rap University

These are the critical fixes needed to connect the frontend pages properly. Complete these in order.

---

## FIX #1: Prep Page → Mode Selection Connection (CRITICAL)

**Problem**: The prep page's "SAVE & RETURN" button goes back to dashboard. It should go to mode selection when prep is complete.

**File**: `app/battle/[id]/prep/page.tsx`

**Current Behavior**:
```
Prep Page → "SAVE & RETURN" → /dashboard
```

**Required Behavior**:
```
Prep Page → "LOCK PREP & CONTINUE" → /battle/[id]/mode
```

**Changes Needed**:

1. Add a NEW button "LOCK PREP & CONTINUE TO BATTLE" that:
   - Only appears when prep deadline has passed OR player clicks early
   - Routes to `/battle/[id]/mode`
   - Calls API to lock prep (prevent further changes)

2. Keep existing "SAVE & RETURN" for players who want to save progress and come back later

**Button Mockup**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [SAVE & RETURN TO DASHBOARD]     [LOCK PREP & BATTLE →]   │
│       (secondary button)              (primary button)      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Primary Button Styling**:
```tsx
<button
  className="bg-[#ff8c42] hover:bg-[#ff9f5a] text-black font-bold px-6 py-3 rounded-lg"
  onClick={() => router.push(`/battle/${battleId}/mode`)}
>
  LOCK PREP & BATTLE →
</button>
```

---

## FIX #2: Mode Page → Round Page Connection

**Problem**: After selecting "Locked In" mode, player should go to round 1 content selection.

**File**: `app/battle/[id]/mode/page.tsx`

**Verify This Flow Works**:
```
Mode Page → "Locked In" → /battle/[id]/round/1
Mode Page → "Auto" → /battle/[id] (with auto-simulation)
```

**Check**: Make sure the `handleLockIn` function routes to `/battle/${battleId}/round/1`

---

## FIX #3: Round Page → Results → Next Round Connection

**Problem**: Need to verify the full round loop works.

**Files**:
- `app/battle/[id]/round/[roundNum]/page.tsx`
- `app/battle/[id]/round/[roundNum]/results/page.tsx`

**Required Flow**:
```
/battle/[id]/round/1 → Submit → /battle/[id]/round/1/results
/battle/[id]/round/1/results → "Next Round" → /battle/[id]/round/2
/battle/[id]/round/2 → Submit → /battle/[id]/round/2/results
/battle/[id]/round/2/results → "Next Round" → /battle/[id]/round/3
/battle/[id]/round/3 → Submit → /battle/[id]/round/3/results
/battle/[id]/round/3/results → "View Final Results" → /battle/[id]
```

**On Results Page, Add Conditional Button**:
```tsx
{roundNum < 3 ? (
  <button onClick={() => router.push(`/battle/${battleId}/round/${roundNum + 1}`)}>
    Continue to Round {roundNum + 1} →
  </button>
) : (
  <button onClick={() => router.push(`/battle/${battleId}`)}>
    View Final Battle Results →
  </button>
)}
```

---

## FIX #4: Battle Results → Dashboard Connection

**File**: `app/battle/[id]/page.tsx`

**Required**: Add "Return to Dashboard" button at bottom of results page

```tsx
<button
  className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg"
  onClick={() => router.push('/dashboard')}
>
  Return to Dashboard
</button>
```

---

## FIX #5: Light Theme Cleanup

**Files with `bg-gray-*` that should be `bg-zinc-*`**:

1. `app/regions/[id]/page.tsx` - Change `bg-gray-400` to `bg-zinc-400`
2. `app/regions/page.tsx` - Change `bg-gray-400` to `bg-zinc-400`

**Note**: `app/login/page.tsx` and `app/page.tsx` can keep `bg-white` for input fields - that's intentional.

---

## VERIFICATION CHECKLIST

After making fixes, test this complete flow:

1. [ ] Go to `/dashboard`
2. [ ] Click on a battle offer or "Next Battle"
3. [ ] Should arrive at `/battle/[id]/prep`
4. [ ] Fill out some prep days
5. [ ] Click "LOCK PREP & BATTLE"
6. [ ] Should arrive at `/battle/[id]/mode`
7. [ ] Select "Locked In"
8. [ ] Should arrive at `/battle/[id]/round/1`
9. [ ] Select content types (3-4 content, 1-2 delivery, 1-2 performance)
10. [ ] Submit round
11. [ ] Should arrive at `/battle/[id]/round/1/results`
12. [ ] Click "Continue to Round 2"
13. [ ] Repeat for rounds 2 and 3
14. [ ] After round 3 results, click "View Final Results"
15. [ ] Should arrive at `/battle/[id]` showing complete battle
16. [ ] Click "Return to Dashboard"
17. [ ] Should arrive at `/dashboard`
18. [ ] Battle should appear in "Recent Battles" section

---

## COMPLETE NAVIGATION MAP

```
                    ┌──────────────┐
                    │  /dashboard  │
                    └──────┬───────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  /battle/offers     │
                │  (accept battle)    │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  /battle/[id]/prep  │◄────────┐
                │  (prep calendar)    │         │
                └──────────┬──────────┘         │
                           │                    │
              ┌────────────┴────────────┐       │
              ▼                         ▼       │
    [SAVE & RETURN]            [LOCK & BATTLE]  │
         │                              │       │
         ▼                              ▼       │
    /dashboard                  ┌───────────────┴───┐
                                │ /battle/[id]/mode │
                                └─────────┬─────────┘
                                          │
                           ┌──────────────┴──────────────┐
                           ▼                             ▼
                       [AUTO]                      [LOCKED IN]
                           │                             │
                           ▼                             ▼
                    /battle/[id]              /battle/[id]/round/1
                    (auto results)                       │
                                                         ▼
                                              /battle/[id]/round/1/results
                                                         │
                                                         ▼
                                              /battle/[id]/round/2
                                                         │
                                                         ▼
                                              /battle/[id]/round/2/results
                                                         │
                                                         ▼
                                              /battle/[id]/round/3
                                                         │
                                                         ▼
                                              /battle/[id]/round/3/results
                                                         │
                                                         ▼
                                              /battle/[id] (final results)
                                                         │
                                                         ▼
                                                   /dashboard
```
