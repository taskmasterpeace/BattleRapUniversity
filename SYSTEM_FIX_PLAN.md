# Battle Rap University - System Fix Plan

## Executive Summary

The life events and secrets systems are **both fully designed** but **completely disconnected**. This plan connects them and fixes all identified gaps.

---

## Phase 1: Life Events + Secrets Integration (PRIORITY)

### Goal
Enable life events to CREATE and EXPOSE secrets about battlers.

### 1.1 Extend Effect Types in StorylineEngine

**File**: `lib/game/storylineEngine.ts`

Add to the effect interface:

```typescript
interface V2Effect {
  // ... existing effects ...

  // NEW: Secret creation
  create_secret?: {
    secret_type: 'criminal_record' | 'financial_crisis' | 'relationship_drama' |
                 'family_scandal' | 'substance_use' | 'mental_health' |
                 'career_failure' | 'betrayal' | 'secret_identity'
    title: string
    description: string
    severity: 'minor' | 'moderate' | 'major'
    exposure_risk?: number  // 0.0-1.0, default 0.15
    battle_vulnerability?: {
      angle_bonus?: number      // Default 0.15
      crowd_reaction_penalty?: number  // Default -10
    }
  }

  // NEW: Secret exposure
  expose_secret?: {
    secret_id?: string           // Specific secret ID
    secret_type?: string         // OR find by type
    new_status: 'rumored' | 'exposed' | 'addressed'
    exposed_by?: 'life_event' | 'battle_angle' | 'social_media' | 'opponent_research'
  }

  // NEW: Modify existing secret
  modify_secret?: {
    secret_id?: string
    secret_type?: string
    exposure_risk_delta?: number  // +/- change to exposure risk
  }
}
```

### 1.2 Implement Secret Helper Methods

Add to `StorylineEngine` class:

```typescript
/**
 * Create a new secret for a battler
 */
private async createSecret(
  battlerId: string,
  secretData: V2Effect['create_secret']
): Promise<string | null> {
  if (!secretData) return null

  const { data, error } = await this.supabase
    .from('battler_secrets')
    .insert({
      battler_id: battlerId,
      secret_type: secretData.secret_type,
      title: secretData.title,
      description: secretData.description,
      severity: secretData.severity,
      status: 'private',
      exposure_risk: secretData.exposure_risk ?? 0.15,
      battle_vulnerability: secretData.battle_vulnerability ?? {
        angle_bonus: 0.15,
        crowd_reaction_penalty: -10
      }
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to create secret:', error)
    return null
  }

  return data.id
}

/**
 * Expose an existing secret (private -> rumored -> exposed)
 */
private async exposeSecret(
  battlerId: string,
  exposeData: V2Effect['expose_secret']
): Promise<boolean> {
  if (!exposeData) return false

  // Find the secret to expose
  let secretId = exposeData.secret_id

  if (!secretId && exposeData.secret_type) {
    const { data } = await this.supabase
      .from('battler_secrets')
      .select('id')
      .eq('battler_id', battlerId)
      .eq('secret_type', exposeData.secret_type)
      .in('status', ['private', 'rumored'])
      .limit(1)
      .single()

    secretId = data?.id
  }

  if (!secretId) return false

  const { error } = await this.supabase
    .from('battler_secrets')
    .update({
      status: exposeData.new_status,
      exposed_at: exposeData.new_status === 'exposed' ? new Date().toISOString() : null,
      exposed_by: exposeData.exposed_by || 'life_event'
    })
    .eq('id', secretId)

  return !error
}
```

### 1.3 Update applyEffects() to Handle Secrets

In the `applyEffects()` method, add:

```typescript
// Handle secret creation
if (effect.create_secret) {
  const secretId = await this.createSecret(battlerId, effect.create_secret)
  if (secretId) {
    appliedEffects.push({
      ...effect,
      _created_secret_id: secretId
    })
  }
}

// Handle secret exposure
if (effect.expose_secret) {
  const exposed = await this.exposeSecret(battlerId, effect.expose_secret)
  if (exposed) {
    appliedEffects.push(effect)
  }
}

// Handle secret modification
if (effect.modify_secret) {
  // Find and update the secret's exposure risk
  // ... implementation
}
```

### 1.4 Create Secret-Generating Life Event Templates

**Example templates to add** (seed migration):

```sql
-- Choke creates a secret about mental weakness
INSERT INTO life_event_templates (code, title, description, trigger_type, trigger_condition,
  choice_a_text, choice_a_effects, choice_b_text, choice_b_effects, category, severity)
VALUES (
  'CHOKE_CREATES_SECRET',
  'The Footage Is Out',
  'Someone uploaded your choke to social media. It''s getting views.',
  'battle_result',
  '{"choked": true, "was_high_profile": true}',
  'Get ahead of it - post your own reaction',
  '[{"type": "permanent", "reputation": -0.5, "create_secret": {"secret_type": "mental_health", "title": "Known Choker", "description": "Has a history of choking under pressure", "severity": "major", "exposure_risk": 0.30}}]',
  'Stay silent and hope it blows over',
  '[{"type": "permanent", "stress": 15, "create_secret": {"secret_type": "mental_health", "title": "Struggles Under Pressure", "description": "Privately dealing with performance anxiety", "severity": "moderate", "exposure_risk": 0.15}}]',
  'career',
  'major'
);

-- Financial crisis creates a secret
INSERT INTO life_event_templates (code, title, description, trigger_type, trigger_condition,
  choice_a_text, choice_a_effects, choice_b_text, choice_b_effects, category, severity)
VALUES (
  'FINANCIAL_CRISIS_SECRET',
  'Bills Piling Up',
  'You''re behind on rent. The stress is showing.',
  'attribute',
  '{"attribute": "financial_stability", "operator": "<=", "value": 3}',
  'Take a quick-money gig (may hurt reputation)',
  '[{"type": "permanent", "financial_stability": 1.5, "reputation": -0.5}]',
  'Keep it quiet and grind harder',
  '[{"type": "permanent", "stress": 20, "create_secret": {"secret_type": "financial_crisis", "title": "Struggling Financially", "description": "Can barely pay bills, under serious financial pressure", "severity": "moderate", "exposure_risk": 0.10}}]',
  'financial',
  'moderate'
);

-- Family drama creates exposable secret
INSERT INTO life_event_templates (code, title, description, trigger_type, trigger_condition,
  choice_a_text, choice_a_effects, choice_b_text, choice_b_effects, category, severity)
VALUES (
  'FAMILY_SCANDAL_EMERGES',
  'Family Business',
  'Someone from your past is talking to bloggers about your family.',
  'random',
  '{"probability": 0.05, "min_battles": 10}',
  'Get ahead of the story - control the narrative',
  '[{"type": "permanent", "reputation": -0.3, "expose_secret": {"secret_type": "family_scandal", "new_status": "addressed", "exposed_by": "life_event"}}]',
  'Deny everything',
  '[{"type": "permanent", "stress": 25, "modify_secret": {"secret_type": "family_scandal", "exposure_risk_delta": 0.20}}]',
  'family',
  'major'
);
```

### 1.5 Files to Modify

| File | Changes |
|------|---------|
| `lib/game/storylineEngine.ts` | Add secret effect types, helper methods, applyEffects logic |
| `lib/types.ts` | Add V2Effect secret types to interface |
| New migration file | Seed secret-creating templates |

---

## Phase 2: Research → Intel Pipeline

### Goal
When a battler researches an opponent, they can discover secrets.

### 2.1 Research Discovery Logic

**File**: `lib/game/researchEngine.ts` (new file)

```typescript
export async function performResearch(
  battleId: string,
  researcherBattlerId: string,
  targetBattlerId: string,
  researchDays: number,
  researchLevel: 'casual' | 'aggressive'
): Promise<ResearchResults> {
  const supabase = createServerClient()

  // Get target's secrets that could be discovered
  const { data: secrets } = await supabase
    .from('battler_secrets')
    .select('*')
    .eq('battler_id', targetBattlerId)
    .in('status', ['private', 'rumored'])

  // Calculate discovery chance based on:
  // - Research days (more = better)
  // - Research level (aggressive = 2x chance)
  // - Secret's exposure_risk
  // - Researcher's attributes (writing.creativity, personal.reputation)

  const discoveredSecrets: string[] = []
  const multiplier = researchLevel === 'aggressive' ? 2.0 : 1.0

  for (const secret of secrets || []) {
    const baseChance = secret.exposure_risk * multiplier * (researchDays / 5)
    const roll = Math.random()

    if (roll < baseChance) {
      discoveredSecrets.push(secret.id)

      // If discovered, increase its exposure risk slightly
      await supabase
        .from('battler_secrets')
        .update({
          exposure_risk: Math.min(1.0, secret.exposure_risk + 0.05),
          status: secret.status === 'private' ? 'rumored' : secret.status
        })
        .eq('id', secret.id)
    }
  }

  // Store in battle_intelligence
  await supabase
    .from('battle_intelligence')
    .upsert({
      battle_id: battleId,
      researcher_battler_id: researcherBattlerId,
      target_battler_id: targetBattlerId,
      secrets_discovered: discoveredSecrets,
      research_quality: Math.min(1.0, researchDays / 7),
      research_days: researchDays,
    })

  return {
    secretsDiscovered: discoveredSecrets,
    publicInfoFound: [], // TODO: Also discover public info
    researchQuality: Math.min(1.0, researchDays / 7)
  }
}
```

### 2.2 Hook Research into Prep Phase

**File**: `app/api/battles/[id]/prep/route.ts`

After prep blocks are saved, if any are 'research' type, trigger discovery:

```typescript
// After saving prep blocks
const researchDays = prepBlocks.filter(b => b.focus === 'research').length

if (researchDays > 0) {
  await performResearch(
    battleId,
    battlerId,
    opponentId,
    researchDays,
    researchDays >= 3 ? 'aggressive' : 'casual'
  )
}
```

### 2.3 Files to Create/Modify

| File | Action |
|------|--------|
| `lib/game/researchEngine.ts` | Create - discovery logic |
| `app/api/battles/[id]/prep/route.ts` | Modify - hook research |
| `app/api/battles/[id]/research/route.ts` | Modify - return discovered intel |

---

## Phase 3: Career Days Auto-Increment

### Goal
Career days should increment after each battle.

### 3.1 Add Career Days Update to Post-Battle Processing

**File**: `lib/game/postBattleProcessing.ts` (new or existing)

```typescript
export async function incrementCareerDays(
  battlerId: string,
  battleDate: Date
): Promise<void> {
  const supabase = createServerClient()

  // Get battler's current career data
  const { data: battler } = await supabase
    .from('battlers')
    .select('career_days, created_at')
    .eq('id', battlerId)
    .single()

  if (!battler) return

  // Calculate days since creation or last battle
  const createdAt = new Date(battler.created_at)
  const daysSinceCreation = Math.floor(
    (battleDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Update if this would increase career_days
  if (daysSinceCreation > battler.career_days) {
    await supabase
      .from('battlers')
      .update({ career_days: daysSinceCreation })
      .eq('id', battlerId)
  }
}
```

### 3.2 Hook into Battle Completion

**File**: `app/api/internal/run-due-battles/route.ts`

After battle simulation completes:

```typescript
// After simulation...
await incrementCareerDays(battle.battler_player_id, new Date())
```

---

## Phase 4: Fix Schema/Test Issues

### 4.1 Rankings Insert Issue

The rankings insert in `createTestBattler` might be silently failing due to RLS or constraint issues.

**Fix**: Check if `rankings` table requires specific columns or has constraints:

```typescript
// In testClient.ts - add error logging
const { data: ranking, error: rankingError } = await admin
  .from('rankings')
  .insert({
    battler_id: battler.id,
    rating: 1200,
    wins: 0,
    losses: 0,
    streak: 0,  // Note: column might be 'current_streak'
  })
  .select()
  .single()

if (rankingError) {
  console.error('Rankings insert failed:', rankingError)
}
```

### 4.2 Prep Blocks Query Issue

Prep blocks insert succeeds but query returns 0. Likely RLS issue.

**Fix**: Ensure the query uses service role client, not user client.

### 4.3 Life Events Schema Cache

Supabase schema cache is stale.

**Fix**: Restart Supabase or run:
```bash
npx supabase db reset
```

---

## Phase 5: Integration Testing

### 5.1 Add Secret-Specific Tests

**File**: `lib/testing/secretsTests.ts`

```typescript
async function testSecretCreation() {
  runner.suite('Secrets System')

  await runner.test('life event can create secret', async () => {
    // Trigger a life event that creates a secret
    // Verify secret exists in battler_secrets
  })

  await runner.test('research can discover secret', async () => {
    // Create a secret for opponent
    // Perform research
    // Verify secret appears in battle_intelligence
  })

  await runner.test('secret exposure changes status', async () => {
    // Create private secret
    // Trigger exposure
    // Verify status changed to exposed
  })
}
```

---

## Implementation Order

### Week 1: Phase 1 (Life Events + Secrets)
1. Add effect types to storylineEngine.ts
2. Implement createSecret() and exposeSecret() methods
3. Update applyEffects() to handle new effects
4. Create 5-10 secret-generating templates
5. Test manually

### Week 2: Phase 2 (Research Pipeline)
1. Create researchEngine.ts
2. Hook into prep phase
3. Test discovery mechanics
4. Verify battle_intelligence population

### Week 3: Phase 3 + 4 (Career Days + Fixes)
1. Add career days increment
2. Fix test schema issues
3. Run full test suite
4. Document any remaining gaps

### Week 4: Phase 5 (Testing + Polish)
1. Add comprehensive secret tests
2. End-to-end testing
3. Balance tuning (exposure rates, discovery chances)

---

## Quick Wins (Can Do Now)

1. **Fix rankings test** - Check actual column names
2. **Fix prep_blocks test** - Use service role for query
3. **Add career days increment** - Simple 10-line function
4. **Restart Supabase** - Clear schema cache

---

## Files Summary

| File | Status | Action |
|------|--------|--------|
| `lib/game/storylineEngine.ts` | Exists | Modify - add secret effects |
| `lib/game/researchEngine.ts` | New | Create - research logic |
| `lib/game/postBattleProcessing.ts` | New/Exists | Add career days increment |
| `lib/testing/secretsTests.ts` | New | Create - secret tests |
| `lib/testing/testClient.ts` | Exists | Fix schema issues |
| Migration: secrets templates | New | Seed secret-creating events |
