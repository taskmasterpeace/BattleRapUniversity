# Authenticated Edge Case Tests Needed

## Overview
The automated test suite (`test-edge-cases.js`) covers unauthenticated scenarios. This document outlines edge cases that require authenticated testing.

---

## Test Setup Required

### Prerequisites
1. Create test user account via Supabase auth
2. Create test battler via `/api/battler/create`
3. Get auth token for requests
4. Use Supabase local instance or dedicated test database

### Test User Setup Script
```javascript
// Create test user and battler
const authResponse = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'test123456'
});

const { data: { session } } = authResponse;
const authToken = session.access_token;

// Create battler
await fetch('http://localhost:3000/api/battler/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `sb-access-token=${authToken}`
  },
  body: JSON.stringify({
    stage_name: 'Test Battler',
    region: 'Test City',
    primary_league_id: '<league_id>',
    style_tags: ['wordplay', 'punchlines'],
    allocated_attributes: {
      writing: { lyricism: 3, wordplay: 3, creativity: 3, flow: 3 },
      performance: { stage_presence: 2, crowd_control: 2, delivery: 2 },
      personal: { financial_stability: 2, reputation: 2, family_bond: 2 },
      resilience: 3
    }
  })
});
```

---

## Category 1: Battler Creation Validation

### Test 1.1: Attribute Boundaries
**Goal:** Verify validation of attribute min/max values

```javascript
// Test: All attributes at minimum (1)
{
  allocated_attributes: {
    writing: { lyricism: 1, wordplay: 1, creativity: 1, flow: 1 },
    performance: { stage_presence: 1, crowd_control: 1, delivery: 1 },
    personal: { financial_stability: 1, reputation: 1, family_bond: 1 },
    resilience: 15 // Total = 25
  }
}
// Expected: 400 - resilience > 8

// Test: All attributes at maximum (8)
{
  allocated_attributes: {
    writing: { lyricism: 8, wordplay: 8, creativity: 8, flow: 1 },
    performance: { stage_presence: 1, crowd_control: 1, delivery: 1 },
    personal: { financial_stability: 1, reputation: 1, family_bond: 1 },
    resilience: 1 // Total = 35
  }
}
// Expected: 400 - total != 25

// Test: Exactly 25 points, all within bounds
{
  allocated_attributes: {
    writing: { lyricism: 2, wordplay: 2, creativity: 2, flow: 2 },
    performance: { stage_presence: 3, crowd_control: 3, delivery: 3 },
    personal: { financial_stability: 3, reputation: 3, family_bond: 2 },
    resilience: 2 // Total = 25
  }
}
// Expected: 200 - Success
```

### Test 1.2: Invalid Attribute Totals
```javascript
// Test: Total < 25
{
  allocated_attributes: {
    writing: { lyricism: 1, wordplay: 1, creativity: 1, flow: 1 },
    performance: { stage_presence: 1, crowd_control: 1, delivery: 1 },
    personal: { financial_stability: 1, reputation: 1, family_bond: 1 },
    resilience: 1 // Total = 11
  }
}
// Expected: 400 - "Must total 25 points"

// Test: Total > 25
{
  allocated_attributes: {
    writing: { lyricism: 5, wordplay: 5, creativity: 5, flow: 5 },
    performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
    personal: { financial_stability: 5, reputation: 5, family_bond: 5 },
    resilience: 5 // Total = 55
  }
}
// Expected: 400 - "Must total 25 points"
```

### Test 1.3: Duplicate Battler Creation
```javascript
// Prerequisite: User already has a battler
// Test: Try to create second battler
await fetch('/api/battler/create', {
  method: 'POST',
  headers: { /* auth headers */ },
  body: JSON.stringify({ /* valid battler data */ })
});
// Expected: 400 - "User already has a battler"
```

### Test 1.4: Invalid League ID
```javascript
{
  stage_name: 'Test',
  primary_league_id: '00000000-0000-0000-0000-000000000000', // Non-existent
  style_tags: ['wordplay'],
  allocated_attributes: { /* valid */ }
}
// Expected: 400 - "Invalid league ID"
```

---

## Category 2: Battle Acceptance Edge Cases

### Test 2.1: Accept Already Accepted Battle
```javascript
// Prerequisite: Battle already accepted
// Test: Try to accept same battle again
await fetch('/api/battles/{id}/accept', {
  method: 'POST',
  headers: { /* auth */ }
});
// Expected: 400 - "Battle is not in offered status"
```

### Test 2.2: Accept Multiple Battles Simultaneously
```javascript
// Prerequisite: Battle1 already accepted
// Test: Try to accept Battle2
await fetch('/api/battles/{battle2_id}/accept', {
  method: 'POST',
  headers: { /* auth */ }
});
// Expected: 400 - "You already have an active battle"
```

### Test 2.3: Accept Expired Battle
```javascript
// Prerequisite: Battle with lock_prep_at in the past
// Or use dev time manipulation to advance time
await fetch('/api/battles/{expired_battle_id}/accept', {
  method: 'POST',
  headers: { /* auth */ }
});
// Expected: 400 - "This battle offer has expired"
```

### Test 2.4: Accept Someone Else's Battle
```javascript
// Prerequisite: Battle offered to different user
// Test: User A tries to accept User B's battle
await fetch('/api/battles/{user_b_battle_id}/accept', {
  method: 'POST',
  headers: { /* User A auth */ }
});
// Expected: 403 - "Not your battle"
```

---

## Category 3: Prep Modification Edge Cases

### Test 3.1: Modify Prep After Lock
```javascript
// Prerequisite: Battle with lock_prep_at in the past
// Or advance dev time past deadline
await fetch('/api/battles/{id}/prep', {
  method: 'POST',
  headers: { /* auth */ },
  body: JSON.stringify({
    day_index: 1,
    focus: 'writing'
  })
});
// Expected: 400 - "Prep is locked"
```

### Test 3.2: Set Prep for Non-Accepted Battle
```javascript
// Prerequisite: Battle in 'offered' status (not accepted)
await fetch('/api/battles/{offered_battle_id}/prep', {
  method: 'POST',
  headers: { /* auth */ },
  body: JSON.stringify({
    day_index: 1,
    focus: 'writing'
  })
});
// Expected: Should work (user can prep before accepting)
// OR: 400 if business logic requires acceptance first
```

### Test 3.3: Day Index Out of Range
```javascript
// Prerequisite: Battle with 7 prep days
await fetch('/api/battles/{id}/prep', {
  method: 'POST',
  headers: { /* auth */ },
  body: JSON.stringify({
    day_index: 99, // Beyond totalPrepDays
    focus: 'writing'
  })
});
// Expected: 400 - "Invalid day_index"
```

### Test 3.4: Overwrite Existing Prep
```javascript
// Prerequisite: day_index 1 already set to 'research'
// Test: Change day 1 to 'writing'
await fetch('/api/battles/{id}/prep', {
  method: 'POST',
  headers: { /* auth */ },
  body: JSON.stringify({
    day_index: 1,
    focus: 'writing'
  })
});
// Expected: 200 - Successfully updated (upsert logic)
```

---

## Category 4: Battle Viewing Authorization

### Test 4.1: View Someone Else's Battle
```javascript
// Prerequisite: Battle belongs to User B
// Test: User A tries to view
await fetch('/api/battles/{user_b_battle_id}', {
  headers: { /* User A auth */ }
});
// Expected: 403 - "Not your battle"
```

### Test 4.2: View Battle Details at Different Statuses
```javascript
// Test viewing battle in each status:
// - offered (before acceptance)
// - accepted (during prep)
// - locked (prep locked, battle pending)
// - simulated (battle completed)

// Expected: 200 for all statuses (owner can always view)
```

---

## Category 5: Life Event Resolution

### Test 5.1: Resolve Non-Existent Life Event
```javascript
await fetch('/api/life-events/00000000-0000-0000-0000-000000000000/resolve', {
  method: 'POST',
  headers: { /* auth */ },
  body: JSON.stringify({ choice: 'a' })
});
// Expected: 404 - "Life event not found"
```

### Test 5.2: Resolve Already Resolved Event
```javascript
// Prerequisite: Event already resolved
await fetch('/api/life-events/{resolved_event_id}/resolve', {
  method: 'POST',
  headers: { /* auth */ },
  body: JSON.stringify({ choice: 'a' })
});
// Expected: 404 - "Life event not found or already resolved"
```

### Test 5.3: Invalid Choice Value
```javascript
await fetch('/api/life-events/{event_id}/resolve', {
  method: 'POST',
  headers: { /* auth */ },
  body: JSON.stringify({ choice: 'z' }) // Not 'a' or 'b'
});
// Expected: 400 - "Invalid choice. Must be 'a' or 'b'"
```

### Test 5.4: Resolve Someone Else's Life Event
```javascript
// Prerequisite: Event belongs to User B
// Test: User A tries to resolve
await fetch('/api/life-events/{user_b_event_id}/resolve', {
  method: 'POST',
  headers: { /* User A auth */ },
  body: JSON.stringify({ choice: 'a' })
});
// Expected: 404 - Query filters by battler_id (RLS protection)
```

---

## Category 6: Race Conditions

### Test 6.1: Concurrent Prep Updates
```javascript
// Send two requests for same day simultaneously
await Promise.all([
  fetch('/api/battles/{id}/prep', {
    method: 'POST',
    body: JSON.stringify({ day_index: 1, focus: 'research' })
  }),
  fetch('/api/battles/{id}/prep', {
    method: 'POST',
    body: JSON.stringify({ day_index: 1, focus: 'writing' })
  })
]);
// Expected: Both succeed, last one wins (upsert handles this)
```

### Test 6.2: Concurrent Battle Acceptance
```javascript
// Send two acceptance requests simultaneously
await Promise.all([
  fetch('/api/battles/{battle1_id}/accept', { method: 'POST' }),
  fetch('/api/battles/{battle2_id}/accept', { method: 'POST' })
]);
// Expected: One succeeds, one fails with "already have active battle"
// (DB transaction should handle this)
```

---

## Category 7: Boundary Conditions

### Test 7.1: Minimum Prep Days (1 day)
```javascript
// Create battle with lock_prep_at = created_at + 1 day
// Verify totalPrepDays = 1
// Set prep for day 1: Expected 200
// Set prep for day 2: Expected 400
```

### Test 7.2: Maximum Prep Days
```javascript
// Create battle with lock_prep_at far in future (e.g., 30 days)
// Verify totalPrepDays = 30
// Set prep for day 30: Expected 200
// Set prep for day 31: Expected 400
```

### Test 7.3: Zero Prep (No-Show Scenario)
```javascript
// Prerequisite: Accept battle, don't set any prep
// Advance time past scheduled_at
// Trigger simulation via /api/internal/run-due-battles
// Verify:
// - Auto-generated prep blocks created
// - Battle marked with no_show_player: true
// - Battle still simulated (not forfeited)
```

---

## Category 8: Data Consistency

### Test 8.1: Missing Related Data
```javascript
// Test scenarios where expected related data is missing:

// 1. Battler without attributes
// (Should never happen, but test GET /api/battler/me handling)

// 2. Battler without ranking
// (Should never happen, but test graceful degradation)

// 3. Battle with invalid league_id reference
// (Should be prevented by FK constraint)
```

### Test 8.2: Rollback on Partial Failure
```javascript
// Test battler creation rollback:
// Force attribute creation to fail
// Verify battler record is also rolled back
// (Code already has this logic - verify it works)
```

---

## Test Execution Checklist

### Setup
- [ ] Local Supabase instance running
- [ ] Dev mode enabled (for time manipulation)
- [ ] Test user created
- [ ] Test battler created
- [ ] Auth token obtained

### Category 1: Battler Creation
- [ ] Test 1.1: Attribute boundaries
- [ ] Test 1.2: Invalid totals
- [ ] Test 1.3: Duplicate battler
- [ ] Test 1.4: Invalid league

### Category 2: Battle Acceptance
- [ ] Test 2.1: Accept already accepted
- [ ] Test 2.2: Accept multiple battles
- [ ] Test 2.3: Accept expired battle
- [ ] Test 2.4: Accept wrong battle

### Category 3: Prep Modification
- [ ] Test 3.1: Modify after lock
- [ ] Test 3.2: Set prep non-accepted
- [ ] Test 3.3: Day index out of range
- [ ] Test 3.4: Overwrite prep

### Category 4: Battle Viewing
- [ ] Test 4.1: View wrong battle
- [ ] Test 4.2: View different statuses

### Category 5: Life Events
- [ ] Test 5.1: Resolve non-existent
- [ ] Test 5.2: Resolve already resolved
- [ ] Test 5.3: Invalid choice
- [ ] Test 5.4: Resolve wrong event

### Category 6: Race Conditions
- [ ] Test 6.1: Concurrent prep
- [ ] Test 6.2: Concurrent acceptance

### Category 7: Boundaries
- [ ] Test 7.1: Min prep days
- [ ] Test 7.2: Max prep days
- [ ] Test 7.3: Zero prep (no-show)

### Category 8: Data Consistency
- [ ] Test 8.1: Missing related data
- [ ] Test 8.2: Rollback on failure

---

## Automated Test Script Template

```javascript
// authenticated-tests.js

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let battlerId = '';
let battleId = '';

async function setup() {
  // Create test user
  // Create test battler
  // Get auth token
  // Create test battle
}

async function teardown() {
  // Clean up test data
}

async function testAttributeBoundaries() {
  // Test 1.1 implementation
}

async function testDuplicateBattler() {
  // Test 1.3 implementation
}

// ... more test functions

async function runAll() {
  await setup();

  try {
    await testAttributeBoundaries();
    await testDuplicateBattler();
    // ... more tests
  } finally {
    await teardown();
  }
}

runAll().catch(console.error);
```

---

## Expected Results Summary

After all tests pass:
- ✅ All validation errors return 400 with clear messages
- ✅ All auth failures return 401
- ✅ All authorization failures return 403
- ✅ All missing resources return 404
- ✅ All success cases return 200 with correct data
- ✅ No 500 errors on any edge case
- ✅ Race conditions handled gracefully
- ✅ Data consistency maintained
