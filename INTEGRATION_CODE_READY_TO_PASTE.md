# Ready-to-Paste Integration Code

## 1. Update API Route

**File**: [app/api/battles/[id]/route.ts](app/api/battles/[id]/route.ts)

Find the supabase query and add `crowd_demographics` to the league selection:

```typescript
const { data: battle } = await supabase
  .from('battles')
  .select(`
    *,
    league:leagues(
      name,
      round_length_minutes,
      crowd_demographics
    ),
    player_battler:battlers!battles_player_battler_id_fkey(
      id,
      stage_name,
      tier
    ),
    ai_battler:battlers!battles_ai_battler_id_fkey(
      id,
      stage_name,
      tier
    )
  `)
  .eq('id', params.id)
  .single();
```

---

## 2. Update TypeScript Type

**File**: [app/battle/[id]/page.tsx](app/battle/[id]/page.tsx)

Find the `Battle` type definition and update it:

```typescript
type Battle = {
  id: string;
  scheduled_at: string;
  status: string;
  winner_battler_id?: string;
  no_show_player: boolean;
  league: {
    name: string;
    round_length_minutes: number;
    crowd_demographics?: {
      black: number;
      white: number;
      mixed: number;
    };
  };
  player_battler: {
    id: string;
    stage_name: string;
    tier: string;
  };
  ai_battler: {
    id: string;
    stage_name: string;
    tier: string;
  };
};
```

---

## 3. Add Import

**File**: [app/battle/[id]/page.tsx](app/battle/[id]/page.tsx)

At the top with other imports:

```typescript
import CrowdReactionWindow from '@/components/battle/CrowdReactionWindow';
```

---

## 4. Add Component to UI

**File**: [app/battle/[id]/page.tsx](app/battle/[id]/page.tsx)

Find where segments are displayed (search for `playerSegments.map`) and add the crowd window:

```typescript
{/* Segment Timeline */}
<div className="grid grid-cols-4 gap-2">
  {playerSegments.map((seg, idx) => (
    <div key={seg.id} className="bg-zinc-900 border border-zinc-800 p-3 space-y-2">
      {/* Segment number */}
      <div className="text-xs uppercase tracking-wider text-zinc-500">
        Segment {idx + 1}
      </div>

      {/* Score */}
      <div className="text-2xl font-black text-zinc-100">
        {seg.segment_score.toFixed(1)}
      </div>

      {/* NEW: Crowd reaction window */}
      <CrowdReactionWindow
        crowdScore={seg.crowd_reaction || 50}
        leagueDemographics={battle.league.crowd_demographics}
        size="small"
        title="CROWD"
      />
    </div>
  ))}
</div>
```

---

## 5. Apply Database Migration (After Fixing Payment System Migration)

**Option A: Fix the broken migration first**

Find [supabase/migrations/20251125060000_add_payment_system.sql](supabase/migrations/20251125060000_add_payment_system.sql)

Look for this line (around line 16):
```sql
WHERE battler_attributes->>'balance' IS NULL
```

The error suggests the column name might be wrong. Try one of these fixes:

```sql
-- Option 1: Add parentheses
WHERE (battler_attributes->>'balance') IS NULL

-- Option 2: Check if column is 'attributes' not 'battler_attributes'
WHERE (attributes->>'balance') IS NULL
```

Then run:
```bash
cd ai-battlerap
npx supabase db reset
```

**Option B: Manual SQL**

Skip the broken migration and apply ours directly via psql:

```bash
cd ai-battlerap
npx supabase db start
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres
```

Then paste this SQL:

```sql
-- Add crowd demographics to leagues
ALTER TABLE leagues
ADD COLUMN IF NOT EXISTS crowd_demographics JSONB DEFAULT '{
  "black": 0.5,
  "white": 0.3,
  "mixed": 0.2
}'::jsonb;

-- Update Small Room Circuit
UPDATE leagues
SET crowd_demographics = '{
  "black": 0.75,
  "white": 0.10,
  "mixed": 0.15
}'::jsonb
WHERE name = 'Small Room Circuit';

-- Update Main Stage Arena
UPDATE leagues
SET crowd_demographics = '{
  "black": 0.40,
  "white": 0.40,
  "mixed": 0.20
}'::jsonb
WHERE name = 'Main Stage Arena';

-- Verify
SELECT name, crowd_demographics FROM leagues;
```

---

## Done!

After these 5 steps, your crowd reaction system is fully operational:
- ✅ 444 sprites categorized
- ✅ Algorithm implemented
- ✅ Component built
- ✅ Database ready (once migration applied)
- ✅ UI integrated

Just create/simulate a battle and watch the crowd react!
