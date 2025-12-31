# Badge Integration - Quick Start Guide

## Overview

This guide shows you how to integrate the badge system into your Battle Rap University game in the correct order.

---

## Implementation Checklist

### Phase 1: Database Setup ✓

```bash
# Apply migrations
cd ai-battlerap
npm run supabase:reset

# This creates:
# - badge_definitions table
# - battler_badges table
# - badge_progression table
# - 20+ badge-specific life events
# - Badge management functions
```

**What you get:**
- 40+ badge definitions (positive and negative)
- Badge tracking per battler
- Badge-gated life event templates
- SQL functions for badge management

### Phase 2: Update Life Event Triggering Logic

**File:** `lib/game/lifeEvents.ts`

**Add badge checking to event evaluation:**

```typescript
import { determineBattlerArchetype } from './badgeSystem';

// In evaluateTriggerCondition function
function evaluateTriggerCondition(
  condition: any,
  outcome: any,
  playerContext: BattlerContext
): boolean {
  // ... existing checks ...

  // NEW: Check badge requirements
  if (condition.requires_badge) {
    const battlerBadges = await getBattlerBadges(playerContext.battlerId);
    if (!battlerBadges.includes(condition.requires_badge)) {
      return false;
    }
  }

  if (condition.requires_any_badge) {
    const battlerBadges = await getBattlerBadges(playerContext.battlerId);
    const hasAny = condition.requires_any_badge.some(
      badge => battlerBadges.includes(badge)
    );
    if (!hasAny) return false;
  }

  return true;
}

// Add helper function
async function getBattlerBadges(supabase: any, battlerId: string): Promise<string[]> {
  const { data } = await supabase
    .from('battler_badges')
    .select('badge_code')
    .eq('battler_id', battlerId)
    .is('removed_at', null);

  return data?.map(b => b.badge_code) || [];
}
```

### Phase 3: Update Life Event Resolution API

**File:** `app/api/life-events/[id]/resolve/route.ts`

**Add choice outcome calculation:**

```typescript
import { calculateChoiceOutcome, resolveChoiceOutcome, getEffectsForOutcome } from '@/lib/game/choiceOutcomeCalculator';
import { getBattlerBadges } from '@/lib/game/lifeEvents';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ... get event and battler ...

  const { choice } = await request.json();

  // Get battler badges
  const badges = await getBattlerBadges(supabase, battler.id);

  // Get battler ranking for streak info
  const { data: ranking } = await supabase
    .from('rankings')
    .select('*')
    .eq('battler_id', battler.id)
    .single();

  // Build context for choice calculation
  const context: ChoiceContext = {
    battlerId: battler.id,
    badges,
    attributes: battlerAttrs,
    currentStreak: ranking.streak,
    totalBattles: ranking.wins + ranking.losses,
    recentPerformance: determineRecentPerformance(ranking),
    eventCode: template.code,
    choiceType: determineChoiceType(template, choice) // You define this
  };

  // Get chosen effects
  const chosenEffects = choice === 'a'
    ? template.choice_a_effects
    : template.choice_b_effects;

  // Calculate outcome probability
  const probability = calculateChoiceOutcome(context, chosenEffects);

  // Resolve outcome
  const outcome = resolveChoiceOutcome(probability);

  // Get final effects based on outcome
  const finalEffects = getEffectsForOutcome(
    outcome,
    chosenEffects,
    probability.expectedEffects.effectMultiplier
  );

  // Apply effects
  await applyLifeEventEffects(supabase, battler.id, finalEffects);

  // Check for badge unlocks/removals
  const badgeUpdate = await checkBadgeProgression(supabase, battler.id);

  // Return result
  return NextResponse.json({
    message: 'Life event resolved',
    outcome,
    effects_applied: finalEffects,
    badges_earned: badgeUpdate.badgesEarned,
    badges_removed: badgeUpdate.badgesRemoved
  });
}
```

### Phase 4: Update Battle Simulation

**File:** `lib/game/simulation.ts`

**Add badge checking after battle:**

```typescript
import { updateBattlerBadges, type BadgeProgressionContext } from './badgeProgression';

// After battle completes and rankings updated
async function checkPostBattleBadges(
  supabase: any,
  battleId: string,
  playerBattlerId: string,
  battleResult: any
) {
  // Get battler's current state
  const badges = await getBattlerBadges(supabase, playerBattlerId);
  const { data: ranking } = await supabase
    .from('rankings')
    .select('*')
    .eq('battler_id', playerBattlerId)
    .single();

  const { data: attributes } = await supabase
    .from('battler_attributes')
    .select('*')
    .eq('battler_id', playerBattlerId)
    .single();

  // Get recent battle history
  const { data: recentBattles } = await supabase
    .from('battles')
    .select('*, battle_rounds(*)')
    .eq('battler_player_id', playerBattlerId)
    .eq('status', 'completed')
    .order('scheduled_at', { ascending: false })
    .limit(10);

  // Build progression context
  const context: BadgeProgressionContext = {
    battlerId: playerBattlerId,
    totalBattles: ranking.wins + ranking.losses,
    totalWins: ranking.wins,
    totalLosses: ranking.losses,
    currentStreak: ranking.streak,
    // ... calculate consecutive stats from recentBattles ...
    currentBadges: badges,
    attributes: attributes,
    recentLifeEventChoices: [], // Load from battler_life_events
    recentBattleResults: [] // Parse from recentBattles
  };

  // Check for badge changes
  const { badgesEarned, badgesRemoved } = updateBattlerBadges(
    context,
    battleResult
  );

  // Apply badge changes
  for (const badge of badgesEarned) {
    await supabase.rpc('award_badge', {
      p_battler_id: playerBattlerId,
      p_badge_code: badge.badgeCode,
      p_reason: badge.reason,
      p_battle_id: battleId
    });
  }

  for (const badgeCode of badgesRemoved) {
    await supabase.rpc('remove_badge', {
      p_battler_id: playerBattlerId,
      p_badge_code: badgeCode
    });
  }

  return { badgesEarned, badgesRemoved };
}

// Call in simulateBattle after rankings update
const badgeUpdate = await checkPostBattleBadges(
  supabase,
  battleId,
  battle.battler_player_id,
  {
    result: finalScore,
    isWin: winnerId === battle.battler_player_id,
    choked: playerChoked,
    peakScore: playerMaxSegment,
    averageScore: playerAvgScore,
    consistencyScore: playerConsistency,
    battleId
  }
);
```

### Phase 5: Add Badge Display UI

**Create:** `components/battler/BadgeDisplay.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

interface Badge {
  code: string;
  name: string;
  category: string;
  is_positive: boolean;
  earned_at: string;
}

export function BadgeDisplay({ battlerId }: { battlerId: string }) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [archetype, setArchetype] = useState<string>('');

  useEffect(() => {
    fetchBadges();
  }, [battlerId]);

  async function fetchBadges() {
    const res = await fetch(`/api/battler/${battlerId}/badges`);
    const data = await res.json();
    setBadges(data.badges);
    setArchetype(data.archetype);
  }

  return (
    <div className="badge-display">
      <h3>Archetype: {archetype}</h3>

      <div className="badges-grid">
        {badges.map(badge => (
          <div
            key={badge.code}
            className={`badge ${badge.is_positive ? 'positive' : 'negative'}`}
          >
            <div className="badge-name">{badge.name}</div>
            <div className="badge-category">{badge.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Create API endpoint:** `app/api/battler/[id]/badges/route.ts`

```typescript
import { createClient } from '@/lib/db/server';
import { determineBattlerArchetype } from '@/lib/game/badgeSystem';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const { data: badges } = await supabase
    .rpc('get_battler_badges', { p_battler_id: params.id });

  const badgeCodes = badges?.map(b => b.badge_code) || [];
  const archetype = determineBattlerArchetype(badgeCodes);

  return Response.json({
    badges,
    archetype,
    badge_count: badges?.length || 0
  });
}
```

### Phase 6: Add Choice Preview

**Create:** `components/lifeEvents/ChoicePreview.tsx`

```typescript
'use client';

import { useState } from 'react';
import { calculateChoiceOutcome, formatProbability } from '@/lib/game/choiceOutcomeCalculator';

export function ChoicePreview({
  eventId,
  choice,
  effects
}: {
  eventId: string;
  choice: 'a' | 'b';
  effects: Record<string, number>;
}) {
  const [preview, setPreview] = useState<any>(null);

  async function loadPreview() {
    const res = await fetch(`/api/life-events/${eventId}/preview`, {
      method: 'POST',
      body: JSON.stringify({ choice })
    });
    const data = await res.json();
    setPreview(data);
  }

  useEffect(() => {
    loadPreview();
  }, [choice]);

  if (!preview) return <div>Loading...</div>;

  return (
    <div className="choice-preview">
      <div className="probability">
        <div className="prob-bar win" style={{ width: `${preview.win_probability * 100}%` }}>
          {formatProbability(preview.win_probability)} Success
        </div>
        <div className="prob-bar neutral" style={{ width: `${preview.neutral_probability * 100}%` }}>
          {formatProbability(preview.neutral_probability)} Mixed
        </div>
        <div className="prob-bar loss" style={{ width: `${preview.loss_probability * 100}%` }}>
          {formatProbability(preview.loss_probability)} Backfire
        </div>
      </div>

      <div className="modifiers">
        {preview.modifiers.map((mod, i) => (
          <div key={i} className="modifier">
            {mod.description}: {mod.value > 0 ? '+' : ''}{Math.round(mod.value * 100)}%
          </div>
        ))}
      </div>

      <div className="expected-effects">
        <h4>Expected Effects:</h4>
        {Object.entries(preview.expected_effects).map(([key, value]) => (
          <div key={key}>
            {key}: {value > 0 ? '+' : ''}{value}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Testing Your Implementation

### 1. Verify Database Setup
```sql
-- Check badge definitions exist
SELECT COUNT(*) FROM badge_definitions;
-- Should return 40+

-- Check badge-specific events exist
SELECT COUNT(*) FROM life_event_templates
WHERE trigger_condition::text LIKE '%requires_badge%';
-- Should return 20+
```

### 2. Test Badge Earning
```typescript
// After a battle, check if badges were earned
const { data: badges } = await supabase
  .from('battler_badges')
  .select('*, badge_definitions(*)')
  .eq('battler_id', playerBattlerId)
  .order('earned_at', { ascending: false })
  .limit(5);

console.log('Recent badges:', badges);
```

### 3. Test Choice Calculation
```typescript
import { calculateChoiceOutcome } from '@/lib/game/choiceOutcomeCalculator';

const testContext = {
  battlerId: 'test',
  badges: ['STAGE_DOMINATION', 'CROWD_CONTROL_MASTER'],
  attributes: { /* ... */ },
  choiceType: 'risky',
  // ... other fields
};

const outcome = calculateChoiceOutcome(testContext, { reputation: 0.5 });
console.log('Win probability:', outcome.win);
console.log('Modifiers:', outcome.modifiers);
```

### 4. Run Integration Tests
```bash
npm test -- badgeIntegration.test.ts
```

---

## Common Issues & Solutions

### Issue: Events not triggering with required badges

**Solution:** Check that `required_badges` column exists and badge codes match exactly

```sql
-- Add column if missing
ALTER TABLE life_event_templates
ADD COLUMN IF NOT EXISTS required_badges jsonb DEFAULT '[]'::jsonb;

-- Check template structure
SELECT code, trigger_condition, required_badges
FROM life_event_templates
WHERE code = 'FREESTYLE_CYPHER_CHALLENGE';
```

### Issue: Badge not being awarded

**Solution:** Check badge_definitions has the badge code

```sql
-- Verify badge exists
SELECT * FROM badge_definitions WHERE code = 'DOMINANT_PERFORMER';

-- If missing, insert it
INSERT INTO badge_definitions (code, name, description, category, level, is_positive)
VALUES ('DOMINANT_PERFORMER', 'Dominant Performer', 'Known for crushing opponents', 'reputation', 'gold', true);
```

### Issue: Choice calculations returning NaN

**Solution:** Ensure all attributes are numeric and within 1-10 range

```typescript
// Validate attributes before calculation
function validateAttributes(attrs: any) {
  const validate = (obj: any) => {
    for (const key in obj) {
      const val = obj[key];
      if (typeof val === 'object') validate(val);
      else if (typeof val === 'number') {
        if (isNaN(val) || val < 1 || val > 10) {
          console.error(`Invalid attribute ${key}: ${val}`);
          obj[key] = 5; // Default to middle value
        }
      }
    }
  };
  validate(attrs);
}
```

---

## Performance Optimization

### Index Suggestions
```sql
-- Speed up badge lookups
CREATE INDEX IF NOT EXISTS idx_battler_badges_active
ON battler_badges(battler_id)
WHERE removed_at IS NULL;

-- Speed up event filtering
CREATE INDEX IF NOT EXISTS idx_life_events_trigger
ON life_event_templates USING GIN (trigger_condition);
```

### Caching Badge Data
```typescript
// Cache battler badges in memory for session
const badgeCache = new Map<string, string[]>();

async function getCachedBattlerBadges(battlerId: string): Promise<string[]> {
  if (badgeCache.has(battlerId)) {
    return badgeCache.get(battlerId)!;
  }

  const badges = await getBattlerBadges(supabase, battlerId);
  badgeCache.set(battlerId, badges);

  // Clear cache after 5 minutes
  setTimeout(() => badgeCache.delete(battlerId), 5 * 60 * 1000);

  return badges;
}
```

---

## Next Steps

1. **Apply migrations** to create badge tables
2. **Update life event triggering** to check badge requirements
3. **Integrate choice calculator** into event resolution API
4. **Add badge checking** to battle simulation
5. **Build badge display** UI component
6. **Add choice preview** to show probabilities
7. **Run tests** to verify everything works

Once complete, your game will have a fully functional badge system where badges genuinely define career paths and meaningful player choices!

---

## Quick Reference

**Key Functions:**
- `determineBattlerArchetype(badges)` - Get archetype from badges
- `calculateChoiceOutcome(context, effects)` - Get win/neutral/loss probabilities
- `updateBattlerBadges(context, battleResult)` - Check for badge unlocks
- `calculateEffectMultiplier(badges, eventCode)` - Get effect multiplier

**Key Tables:**
- `badge_definitions` - All available badges
- `battler_badges` - Badges earned by battlers
- `life_event_templates` - Badge-gated events

**Key Files:**
- `lib/game/badgeSystem.ts` - Core badge logic
- `lib/game/choiceOutcomeCalculator.ts` - Probability calculations
- `lib/game/badgeProgression.ts` - Unlock system
- `BADGE_INTEGRATION_SYSTEM.md` - Full documentation
