# Edge Case Fixes Required

## Summary
This document lists **specific code changes** needed to fix edge case handling issues found during testing.

---

## Critical Fix #1: Replace `.single()` with `.maybeSingle()`

### Problem
The Supabase `.single()` method throws an error when no result is found, causing unhandled 500 errors instead of proper 404 responses.

### Solution
Use `.maybeSingle()` which returns `{ data: null, error: null }` when no result is found, allowing proper error handling.

---

### File 1: `app/api/battles/[id]/route.ts`

**Current Code (Lines 29-38):**
```typescript
const { data: battle } = await supabase
  .from('battles')
  .select(`
    *,
    league:leagues(*),
    player_battler:battler_player_id(id, stage_name, tier),
    ai_battler:battler_ai_id(id, stage_name, tier)
  `)
  .eq('id', id)
  .single();

if (!battle) {
  return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
}
```

**Fixed Code:**
```typescript
const { data: battle, error: battleError } = await supabase
  .from('battles')
  .select(`
    *,
    league:leagues(*),
    player_battler:battler_player_id(id, stage_name, tier),
    ai_battler:battler_ai_id(id, stage_name, tier)
  `)
  .eq('id', id)
  .maybeSingle();

if (battleError || !battle) {
  return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
}
```

---

### File 2: `app/api/battles/[id]/accept/route.ts`

**Current Code (Lines 30-35):**
```typescript
const { data: battler } = await supabase
  .from('battlers')
  .select('id')
  .eq('user_id', user.id)
  .eq('is_ai', false)
  .single();
```

**Fixed Code:**
```typescript
const { data: battler, error: battlerError } = await supabase
  .from('battlers')
  .select('id')
  .eq('user_id', user.id)
  .eq('is_ai', false)
  .maybeSingle();

if (battlerError || !battler) {
  return NextResponse.json({ error: 'No battler found' }, { status: 404 });
}
```

**Current Code (Lines 42-46):**
```typescript
const { data: battle } = await supabase
  .from('battles')
  .select('*')
  .eq('id', id)
  .single();
```

**Fixed Code:**
```typescript
const { data: battle, error: battleError } = await supabase
  .from('battles')
  .select('*')
  .eq('id', id)
  .maybeSingle();

if (battleError || !battle) {
  return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
}
```

---

### File 3: `app/api/battles/[id]/decline/route.ts`

**Current Code (Lines 17-22):**
```typescript
const { data: battler } = await supabase
  .from('battlers')
  .select('id')
  .eq('user_id', user.id)
  .eq('is_ai', false)
  .single();
```

**Fixed Code:**
```typescript
const { data: battler, error: battlerError } = await supabase
  .from('battlers')
  .select('id')
  .eq('user_id', user.id)
  .eq('is_ai', false)
  .maybeSingle();

if (battlerError || !battler) {
  return NextResponse.json({ error: 'No battler found' }, { status: 404 });
}
```

**Current Code (Lines 29-33):**
```typescript
const { data: battle } = await supabase
  .from('battles')
  .select('*')
  .eq('id', id)
  .single();
```

**Fixed Code:**
```typescript
const { data: battle, error: battleError } = await supabase
  .from('battles')
  .select('*')
  .eq('id', id)
  .maybeSingle();

if (battleError || !battle) {
  return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
}
```

**Current Code (Lines 63-67):**
```typescript
const { data: attributes } = await supabase
  .from('battler_attributes')
  .select('personal')
  .eq('battler_id', battler.id)
  .single();
```

**Fixed Code:**
```typescript
const { data: attributes } = await supabase
  .from('battler_attributes')
  .select('personal')
  .eq('battler_id', battler.id)
  .maybeSingle();
```

---

### File 4: `app/api/battles/[id]/prep/route.ts`

**Current Code (Lines 18-23):**
```typescript
const { data: battler } = await supabase
  .from('battlers')
  .select('id')
  .eq('user_id', user.id)
  .eq('is_ai', false)
  .single();
```

**Fixed Code:**
```typescript
const { data: battler, error: battlerError } = await supabase
  .from('battlers')
  .select('id')
  .eq('user_id', user.id)
  .eq('is_ai', false)
  .maybeSingle();

if (battlerError || !battler) {
  return NextResponse.json({ error: 'No battler found' }, { status: 404 });
}
```

**Current Code (Lines 30-38):**
```typescript
const { data: battle } = await supabase
  .from('battles')
  .select(`
    *,
    league:leagues(*),
    ai_battler:battler_ai_id(id, stage_name, tier)
  `)
  .eq('id', id)
  .single();
```

**Fixed Code:**
```typescript
const { data: battle, error: battleError } = await supabase
  .from('battles')
  .select(`
    *,
    league:leagues(*),
    ai_battler:battler_ai_id(id, stage_name, tier)
  `)
  .eq('id', id)
  .maybeSingle();

if (battleError || !battle) {
  return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
}
```

**Current Code (Lines 96-101 in POST handler):**
```typescript
const { data: battler } = await supabase
  .from('battlers')
  .select('id')
  .eq('user_id', user.id)
  .eq('is_ai', false)
  .single();
```

**Fixed Code:**
```typescript
const { data: battler, error: battlerError } = await supabase
  .from('battlers')
  .select('id')
  .eq('user_id', user.id)
  .eq('is_ai', false)
  .maybeSingle();

if (battlerError || !battler) {
  return NextResponse.json({ error: 'No battler found' }, { status: 404 });
}
```

**Current Code (Lines 108-112):**
```typescript
const { data: battle } = await supabase
  .from('battles')
  .select('*')
  .eq('id', id)
  .single();
```

**Fixed Code:**
```typescript
const { data: battle, error: battleError } = await supabase
  .from('battles')
  .select('*')
  .eq('id', id)
  .maybeSingle();

if (battleError || !battle) {
  return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
}
```

---

### File 5: `app/api/news/[slug]/route.ts`

**Current Code (Lines 21-37):**
```typescript
const { data: article, error } = await supabase
  .from('news_articles')
  .select(`
    id,
    slug,
    title,
    type,
    body_markdown,
    published_at,
    meta_json,
    primary_battler:battlers!primary_battler_id(id, stage_name, tier),
    secondary_battler:battlers!secondary_battler_id(id, stage_name, tier),
    league:leagues(id, name),
    battle:battles(id, scheduled_at, winner_battler_id)
  `)
  .eq('slug', slug)
  .single();
```

**Fixed Code:**
```typescript
const { data: article, error } = await supabase
  .from('news_articles')
  .select(`
    id,
    slug,
    title,
    type,
    body_markdown,
    published_at,
    meta_json,
    primary_battler:battlers!primary_battler_id(id, stage_name, tier),
    secondary_battler:battlers!secondary_battler_id(id, stage_name, tier),
    league:leagues(id, name),
    battle:battles(id, scheduled_at, winner_battler_id)
  `)
  .eq('slug', slug)
  .maybeSingle();
```

---

### File 6: `app/api/battler/create/route.ts`

**Current Code (Lines 127-131):**
```typescript
const { data: league } = await supabase
  .from('leagues')
  .select('id')
  .eq('id', primary_league_id)
  .single();
```

**Fixed Code:**
```typescript
const { data: league, error: leagueError } = await supabase
  .from('leagues')
  .select('id')
  .eq('id', primary_league_id)
  .maybeSingle();

if (leagueError || !league) {
  return NextResponse.json({ error: 'Invalid league ID' }, { status: 400 });
}
```

Note: This check already exists at line 133-135, but should check the error too.
Note: This check already exists at line 133-135, but should check the error too.

---

### File 7: `app/api/battler/me/route.ts`

**Current Code (Lines 26-30, 33-37, 40-44):**
```typescript
// Get attributes
const { data: attributes } = await supabase
  .from('battler_attributes')
  .select('*')
  .eq('battler_id', battler.id)
  .single();

// Get ranking
const { data: ranking } = await supabase
  .from('rankings')
  .select('*')
  .eq('battler_id', battler.id)
  .single();

// Get league info
const { data: league } = await supabase
  .from('leagues')
  .select('*')
  .eq('id', battler.primary_league_id)
  .single();
```

**Fixed Code:**
```typescript
// Get attributes
const { data: attributes } = await supabase
  .from('battler_attributes')
  .select('*')
  .eq('battler_id', battler.id)
  .maybeSingle();

// Get ranking
const { data: ranking } = await supabase
  .from('rankings')
  .select('*')
  .eq('battler_id', battler.id)
  .maybeSingle();

// Get league info
const { data: league } = await supabase
  .from('leagues')
  .select('*')
  .eq('id', battler.primary_league_id)
  .maybeSingle();
```

**Note:** These are internal data that should always exist if battler exists, but using `.maybeSingle()` prevents crashes if data is missing.

---

### File 8: `app/api/life-events/[id]/resolve/route.ts`

**Current Code (Lines 48-57):**
```typescript
const { data: event, error: fetchError } = await supabase
  .from('battler_life_events')
  .select(`
    *,
    template:life_event_templates!battler_life_events_template_code_fkey(*)
  `)
  .eq('id', eventId)
  .eq('battler_id', battler.id)
  .eq('status', 'pending')
  .single();
```

**Fixed Code:**
```typescript
const { data: event, error: fetchError } = await supabase
  .from('battler_life_events')
  .select(`
    *,
    template:life_event_templates!battler_life_events_template_code_fkey(*)
  `)
  .eq('id', eventId)
  .eq('battler_id', battler.id)
  .eq('status', 'pending')
  .maybeSingle();
```

---

## Critical Fix #2: Fix Internal API Error Handling

### File: `lib/db/server.ts`

**Current Code (Lines 39-47):**
```typescript
export function verifyInternalSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.INTERNAL_API_SECRET;

  if (!secret) {
    throw new Error('INTERNAL_API_SECRET not configured');
  }

  return authHeader === `Bearer ${secret}`;
}
```

**Fixed Code:**
```typescript
export function verifyInternalSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.INTERNAL_API_SECRET;

  if (!secret) {
    console.error('INTERNAL_API_SECRET not configured');
    return false; // Return false instead of throwing
  }

  return authHeader === `Bearer ${secret}`;
}
```

---

## Summary of Changes

### Files to Modify:
1. `app/api/battles/[id]/route.ts` - 1 `.single()` → `.maybeSingle()`
2. `app/api/battles/[id]/accept/route.ts` - 2 `.single()` → `.maybeSingle()`
3. `app/api/battles/[id]/decline/route.ts` - 3 `.single()` → `.maybeSingle()` 
4. `app/api/battles/[id]/prep/route.ts` - 4 `.single()` → `.maybeSingle()` (2 in GET, 2 in POST)
5. `app/api/news/[slug]/route.ts` - 1 `.single()` → `.maybeSingle()`
6. `app/api/battler/create/route.ts` - 1 `.single()` → `.maybeSingle()` (add error check)
7. `app/api/battler/me/route.ts` - 3 `.single()` → `.maybeSingle()`
8. `app/api/life-events/[id]/resolve/route.ts` - 1 `.single()` → `.maybeSingle()`
9. `lib/db/server.ts` - Fix `verifyInternalSecret` to return false instead of throwing

### Total Changes:
- **16 instances of `.single()` to replace with `.maybeSingle()`**
- **1 function to fix (verifyInternalSecret)**

### Expected Impact:
- ✅ No more 500 errors on invalid UUIDs
- ✅ Proper 404 responses when resources not found  
- ✅ Proper 401 responses for unauthorized internal API calls
- ✅ Better error handling and user experience

---

## Testing After Fixes

Run the test suite again after applying fixes:

```bash
cd ai-battlerap
node test-edge-cases.js
```

Expected results:
- All 500 errors should become proper 400/404/401 errors
- Error messages should be returned as JSON
- No crashes or unhandled exceptions
