# Crowd Reaction System - Implementation Guide

## Overview

The Crowd Reaction System converts a 0-100 crowd score into a visual display of 3 crowd member reactions, showing realistic variety (not everyone agrees, but there's consensus). The system factors in league demographics to show appropriate crowd composition.

---

## System Components

### 1. Database Schema
**File**: `supabase/migrations/20251126000000_add_league_crowd_demographics.sql`

**What it does**:
- Adds `crowd_demographics` JSONB field to `leagues` table
- Sets default demographics: `{"black": 0.5, "white": 0.3, "mixed": 0.2}`
- Updates existing leagues with realistic values:
  - **Small Room Circuit**: 75% black, 10% white, 15% mixed
  - **Main Stage Arena**: 40% black, 40% white, 20% mixed

**To apply**:
```bash
cd ai-battlerap
npm run supabase:reset
# OR just run this migration if DB is already up
npx supabase migration up
```

---

### 2. Sprite Organization

**Files**:
- `public/sprites/CROWD_CATEGORIZATION.md` - Complete audit of all 444 sprites
- `public/sprites/rename-crowd.ps1` - PowerShell script to rename sprites

**Naming Convention**: `crowd_[demographic]_[reaction]_[variant].png`

**Examples**:
- `crowd_black_hype_001.png` - Black crowd member hyped up
- `crowd_white_record_002.png` - White crowd member recording
- `crowd_mixed_watch_001.png` - Mixed-race crowd member watching

**Current Status**:
- ✅ 50+ sprites already categorized in rename script
- ⚠️ ~390 sprites still need manual categorization
- ⚠️ Negative reactions (boo, cringe) need to be identified

**To rename sprites**:
```powershell
cd ai-battlerap\public\sprites
.\rename-crowd.ps1
```

---

### 3. Crowd Breakdown Algorithm

**File**: `lib/game/crowdReactions.ts`

**Key Functions**:

#### `getCrowdReactionBreakdown(score: number): CrowdBreakdown`
Converts 0-100 score to percentage breakdown:

| Score Range | Positive | Neutral | Negative | Example |
|-------------|----------|---------|----------|---------|
| 90-100 | 90% | 10% | 0% | Dominant performance |
| 80-89 | 75% | 20% | 5% | Great round |
| 70-79 | 60% | 30% | 10% | Solid performance |
| 60-69 | 40% | 40% | 20% | Mixed reaction |
| 50-59 | 20% | 50% | 30% | Lukewarm |
| 40-49 | 10% | 40% | 50% | Not impressed |
| 30-39 | 5% | 25% | 70% | Bad round |
| 20-29 | 0% | 20% | 80% | Getting booed |
| 0-19 | 0% | 10% | 90% | Disaster |

#### `selectCrowdReactions(crowdScore, leagueDemographics): CrowdReactionSprite[]`
Main function that:
1. Gets breakdown percentages from score
2. Picks 3 reaction types weighted by breakdown
3. Picks 3 demographics weighted by league crowd makeup
4. Returns array of 3 sprite objects with paths

**Example usage**:
```typescript
import { selectCrowdReactions } from '@/lib/game/crowdReactions';

const reactions = selectCrowdReactions(75, {
  black: 0.7,
  white: 0.2,
  mixed: 0.1
});

// Returns:
// [
//   { sprite: '/sprites/crowd/crowd_black_hype_001.png', reaction: 'hype', demographic: 'black', category: 'positive' },
//   { sprite: '/sprites/crowd/crowd_black_cheer_002.png', reaction: 'cheer', demographic: 'black', category: 'positive' },
//   { sprite: '/sprites/crowd/crowd_white_watch_001.png', reaction: 'watch', demographic: 'white', category: 'neutral' }
// ]
```

---

### 4. UI Component

**File**: `components/battle/CrowdReactionWindow.tsx`

**Main Component**: `<CrowdReactionWindow />`

**Props**:
- `crowdScore: number` - Required, 0-100 score
- `leagueDemographics?: LeagueDemographics` - Optional, league crowd makeup
- `title?: string` - Optional, defaults to "CROWD REACTION"
- `size?: 'small' | 'medium' | 'large'` - Optional, defaults to 'medium'

**Usage in Battle Viewer**:
```tsx
import CrowdReactionWindow from '@/components/battle/CrowdReactionWindow';

// In your battle viewer component
<CrowdReactionWindow
  crowdScore={segment.crowd_reaction}
  leagueDemographics={battle.league.crowd_demographics}
  title="SEGMENT REACTION"
  size="medium"
/>
```

**Compact Variant**: `<CompactCrowdReaction />`

For inline display:
```tsx
import { CompactCrowdReaction } from '@/components/battle/CrowdReactionWindow';

<CompactCrowdReaction crowdScore={round.crowd_reaction} />
// Displays: "Crowd: HYPED (85)"
```

---

## Integration Steps

### Step 1: Apply Database Migration

```bash
cd ai-battlerap
npx supabase migration up
```

**Verify**:
```sql
SELECT name, crowd_demographics FROM leagues;
```

Should show:
- Small Room Circuit: `{"black": 0.75, "white": 0.1, "mixed": 0.15}`
- Main Stage Arena: `{"black": 0.4, "white": 0.4, "mixed": 0.2}`

---

### Step 2: Rename Existing Sprites

**Option A: Use existing categorization (50+ sprites)**:
```powershell
cd ai-battlerap\public\sprites
.\rename-crowd.ps1
```

**Option B: Complete full audit first** (recommended):
1. Review all 444 sprites in `crowd/` subdirectories
2. Update `rename-crowd.ps1` with complete mappings
3. Run script to rename all at once

**Missing sprite categories to identify**:
- Negative reactions: boo, cringe, disappointed, unimpressed
- Special reactions: confused, erupt, pause (may need to generate new sprites)

---

### Step 3: Update API to Include Demographics

**File**: `app/api/battles/[id]/route.ts`

Add `crowd_demographics` to league query:

```typescript
const { data: battle } = await supabase
  .from('battles')
  .select(`
    *,
    league:leagues(
      name,
      round_length_minutes,
      crowd_demographics  // ← Add this
    ),
    ...
  `)
  .eq('id', id)
  .single();
```

---

### Step 4: Add Component to Battle Viewer

**File**: `app/battle/[id]/page.tsx`

**Option A: Show per-segment reactions** (recommended):

```tsx
import CrowdReactionWindow from '@/components/battle/CrowdReactionWindow';

// In the segment timeline section
{playerSegments.map((seg, idx) => (
  <div key={seg.id} className="...">
    {/* Existing segment score display */}
    <div className="text-2xl font-black">{seg.segment_score.toFixed(1)}</div>

    {/* NEW: Add crowd reaction window */}
    <CrowdReactionWindow
      crowdScore={seg.crowd_reaction || 50}
      leagueDemographics={battle.league.crowd_demographics}
      size="small"
      title={`SEGMENT ${idx + 1}`}
    />
  </div>
))}
```

**Option B: Show round-level reaction**:

```tsx
<CrowdReactionWindow
  crowdScore={playerRound.crowd_reaction}
  leagueDemographics={battle.league.crowd_demographics}
  title={`ROUND ${selectedRound} CROWD`}
  size="large"
/>
```

---

### Step 5: Test the System

**1. Create test battle**:
```bash
curl -X POST http://localhost:3000/api/internal/generate-battle-offers \
  -H "Authorization: Bearer local-dev-secret-123"
```

**2. Accept and prep battle** (via UI)

**3. Force simulate**:
```bash
curl -X POST "http://localhost:3000/api/internal/run-due-battles?battle_id=BATTLE_ID" \
  -H "Authorization: Bearer local-dev-secret-123"
```

**4. View battle results** → should see crowd reaction windows

**Expected behavior**:
- High-scoring segments (80+) show mostly positive reactions (hype, cheer)
- Mid-scoring segments (50-70) show mix of positive and neutral
- Low-scoring segments (<40) show mostly neutral and negative (if sprites exist)
- Demographics match league (Small Room = mostly black, Main Stage = balanced)
- 3 sprites displayed with slight overlap
- Missing sprites show emoji fallback (😃 😐 😒)

---

## Customization Options

### Adjust Breakdown Percentages

Edit `lib/game/crowdReactions.ts` → `getCrowdReactionBreakdown()` function to tune how scores map to reactions.

**Example**: Make crowd harsher (more negative reactions):
```typescript
if (clampedScore >= 70) {
  return { positive: 0.50, neutral: 0.35, negative: 0.15 };  // Was 60/30/10
}
```

### Add New Reaction Types

1. **Add sprites** for new reaction (e.g., "confused", "asleep")
2. **Update type definitions**:
   ```typescript
   export type NeutralReaction = 'watch' | 'record' | 'think' | 'talk' | 'listen' | 'confused';
   ```
3. **Add to reaction pool**:
   ```typescript
   const NEUTRAL_REACTIONS: NeutralReaction[] = [..., 'confused'];
   ```
4. **Update variant count map** in `getVariantCount()`

### Change Demographics

Update league demographics in database:
```sql
UPDATE leagues
SET crowd_demographics = '{"black": 0.6, "white": 0.3, "mixed": 0.1}'
WHERE name = 'Small Room Circuit';
```

Or add new demographic categories:
- Add to `Demographic` type
- Update `LeagueDemographics` interface
- Add sprites for new category
- Update selection logic

---

## Troubleshooting

### Issue: Sprites not loading (404 errors)

**Cause**: Sprites haven't been renamed yet or path is wrong

**Fix**:
1. Check browser console for exact path requested
2. Verify sprite exists: `public/sprites/crowd/crowd_black_hype_001.png`
3. Run rename script if needed
4. Component shows emoji fallback for missing sprites

### Issue: Same reactions every time

**Cause**: Random selection is working, but limited sprite variety

**Fix**:
1. Complete full sprite audit to categorize all 444 sprites
2. Ensure multiple variants exist for each reaction/demographic combo
3. Check `getVariantCount()` in `crowdReactions.ts` matches actual sprite inventory

### Issue: Wrong demographics showing

**Cause**: League demographics not set or not passed to component

**Fix**:
1. Verify migration applied: `SELECT crowd_demographics FROM leagues;`
2. Check API response includes `league.crowd_demographics`
3. Pass demographics to component: `leagueDemographics={battle.league.crowd_demographics}`

### Issue: All negative reactions missing

**Cause**: Negative reaction sprites not identified in audit yet

**Fix**:
1. Review remaining ~390 uncategorized sprites
2. Look for sprites showing: thumbs down, bored expressions, leaving, cringing
3. Add mappings to `rename-crowd.ps1`
4. Re-run rename script

---

## Next Steps

### Priority 1: Complete Sprite Audit
**Action**: Manually review all 444 crowd sprites and categorize each one

**Goal**: Identify at minimum:
- 10-15 variants each for: hype, cheer, watch, record
- 5-10 variants each for: think, talk, listen, laugh, stunned
- 5-10 variants each for: boo, cringe, unimpressed, disappointed (negative reactions)

**Deliverable**: Updated `rename-crowd.ps1` with complete mappings

### Priority 2: Generate Missing Sprites
**Action**: If negative reactions or special reactions are missing, generate new sprites

**Needed**:
- Negative reactions showing clear disapproval (boo, thumbs down, walking out)
- Special reactions for dramatic moments (confused, pause, erupt)

**Tool**: Use same sprite generator as before, ensure transparent backgrounds

### Priority 3: Balance Testing
**Action**: Run multiple battle simulations and observe crowd reactions

**Test cases**:
- Dominant win (90+ score) → should show 2-3 positive reactions
- Close battle (50-60 score) → should show mix
- Bad performance (20-30 score) → should show mostly negative
- Different leagues → should show different demographics

**Tune**: Adjust breakdown percentages if reactions don't feel realistic

### Priority 4: UI Polish
**Optional enhancements**:
- Add animated reactions (sprite sheets instead of static PNGs)
- Add sound effects for different reaction types
- Show reaction labels on hover
- Add "crowd energy meter" showing overall vibe
- Animate sprites entrance/exit between segments

---

## File Reference

**Created/Modified Files**:
1. `supabase/migrations/20251126000000_add_league_crowd_demographics.sql` - DB schema
2. `public/sprites/CROWD_CATEGORIZATION.md` - Sprite audit document
3. `public/sprites/rename-crowd.ps1` - Rename script
4. `lib/game/crowdReactions.ts` - Core logic (algorithm + sprite selection)
5. `components/battle/CrowdReactionWindow.tsx` - UI component
6. `CROWD_REACTION_IMPLEMENTATION.md` - This guide

**Files to Update**:
1. `app/api/battles/[id]/route.ts` - Include `crowd_demographics` in query
2. `app/battle/[id]/page.tsx` - Add `<CrowdReactionWindow />` component

---

## Questions?

**How does the score-to-reaction breakdown work?**
- Score → percentage breakdown → weighted random selection
- Example: Score 75 → 60% positive, 30% neutral, 10% negative
- Pick 3 reactions: might get [positive, positive, neutral] or [positive, neutral, neutral]
- Creates natural variety while respecting consensus

**Why 3 reactions?**
- Shows sample of crowd without overwhelming the UI
- Allows for dissenting opinions (2 people love it, 1 not impressed)
- Fits well visually with overlapped sprite layout

**Can I change the number of reactions shown?**
- Yes! Update `pick3Reactions()` and `pick3Demographics()` loops
- Also update component to handle N reactions instead of hardcoded 3

**What if I don't have sprites for a reaction/demographic combo?**
- Component shows emoji fallback (😃 😐 😒)
- `getVariantCount()` returns 0 for missing combos
- `pickVariant()` returns 1 as fallback (will 404 but component handles gracefully)

**Do I need to use this for every segment?**
- No! You can show:
  - Per-segment reactions (most detailed)
  - Per-round reactions (summary)
  - Overall battle reaction (high-level)
  - Or mix (show per-segment for selected round only)
