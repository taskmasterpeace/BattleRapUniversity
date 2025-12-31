/**
 * Edge Case Testing Script
 * Tests various error scenarios and boundary conditions
 */

const BASE_URL = 'http://localhost:3000';
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || 'dev-secret-key-change-in-production';

// Test utilities
async function testEndpoint(name, url, options = {}) {
  console.log(`\n========== ${name} ==========`);
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Response body:`, text.substring(0, 500)); // Show first 500 chars

    // Try to parse as JSON
    try {
      const data = JSON.parse(text);
      console.log(`Parsed JSON:`, JSON.stringify(data, null, 2));
      return { status: response.status, data, success: response.ok };
    } catch (jsonError) {
      console.log(`Could not parse as JSON`);
      return { status: response.status, text, success: response.ok };
    }
  } catch (error) {
    console.error(`Error:`, error.message);
    return { status: 'ERROR', error: error.message, success: false };
  }
}

async function runTests() {
  console.log('================================');
  console.log('EDGE CASE TESTING SUITE');
  console.log('================================');
  console.log('\nTesting without authentication and invalid scenarios...\n');

  // ========================================
  // 1. AUTHENTICATION TESTS
  // ========================================
  console.log('\n\n>>> AUTHENTICATION TESTS <<<\n');

  await testEndpoint(
    'Test 1.1: Access battle offers without auth',
    `${BASE_URL}/api/battles/offers`
  );

  await testEndpoint(
    'Test 1.2: Create battler without auth',
    `${BASE_URL}/api/battler/create`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage_name: 'Test Rapper',
        primary_league_id: 'fake-id',
        style_tags: ['wordplay'],
        allocated_attributes: {
          writing: { lyricism: 3, wordplay: 3, creativity: 3, flow: 3 },
          performance: { stage_presence: 2, crowd_control: 2, delivery: 2 },
          personal: { financial_stability: 2, reputation: 2, family_bond: 2 },
          resilience: 3
        }
      })
    }
  );

  await testEndpoint(
    'Test 1.3: Access non-existent battle without auth',
    `${BASE_URL}/api/battles/00000000-0000-0000-0000-000000000000`
  );

  // ========================================
  // 2. INVALID DATA TESTS
  // ========================================
  console.log('\n\n>>> INVALID DATA TESTS <<<\n');

  await testEndpoint(
    'Test 2.1: Create battler with invalid attributes (wrong total)',
    `${BASE_URL}/api/battler/create`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage_name: 'Test Rapper',
        primary_league_id: 'fake-id',
        style_tags: ['wordplay'],
        allocated_attributes: {
          writing: { lyricism: 10, wordplay: 10, creativity: 10, flow: 10 },
          performance: { stage_presence: 10, crowd_control: 10, delivery: 10 },
          personal: { financial_stability: 10, reputation: 10, family_bond: 10 },
          resilience: 10
        }
      })
    }
  );

  await testEndpoint(
    'Test 2.2: Create battler with attributes out of bounds (> 8)',
    `${BASE_URL}/api/battler/create`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage_name: 'Test Rapper',
        primary_league_id: 'fake-id',
        style_tags: ['wordplay'],
        allocated_attributes: {
          writing: { lyricism: 15, wordplay: 3, creativity: 3, flow: 3 },
          performance: { stage_presence: 1, crowd_control: 1, delivery: 1 },
          personal: { financial_stability: 1, reputation: 1, family_bond: 1 },
          resilience: 1
        }
      })
    }
  );

  await testEndpoint(
    'Test 2.3: Create battler with attributes < 1',
    `${BASE_URL}/api/battler/create`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage_name: 'Test Rapper',
        primary_league_id: 'fake-id',
        style_tags: ['wordplay'],
        allocated_attributes: {
          writing: { lyricism: 0, wordplay: 3, creativity: 3, flow: 3 },
          performance: { stage_presence: 3, crowd_control: 3, delivery: 3 },
          personal: { financial_stability: 3, reputation: 3, family_bond: 3 },
          resilience: 3
        }
      })
    }
  );

  await testEndpoint(
    'Test 2.4: Create battler with empty stage name',
    `${BASE_URL}/api/battler/create`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage_name: '',
        primary_league_id: 'fake-id',
        style_tags: ['wordplay'],
        allocated_attributes: {
          writing: { lyricism: 3, wordplay: 3, creativity: 3, flow: 3 },
          performance: { stage_presence: 2, crowd_control: 2, delivery: 2 },
          personal: { financial_stability: 2, reputation: 2, family_bond: 2 },
          resilience: 3
        }
      })
    }
  );

  await testEndpoint(
    'Test 2.5: Create battler with no style tags',
    `${BASE_URL}/api/battler/create`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage_name: 'Test Rapper',
        primary_league_id: 'fake-id',
        style_tags: [],
        allocated_attributes: {
          writing: { lyricism: 3, wordplay: 3, creativity: 3, flow: 3 },
          performance: { stage_presence: 2, crowd_control: 2, delivery: 2 },
          personal: { financial_stability: 2, reputation: 2, family_bond: 2 },
          resilience: 3
        }
      })
    }
  );

  await testEndpoint(
    'Test 2.6: Create battler with too many style tags (>3)',
    `${BASE_URL}/api/battler/create`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage_name: 'Test Rapper',
        primary_league_id: 'fake-id',
        style_tags: ['wordplay', 'lyricism', 'punchlines', 'performance'],
        allocated_attributes: {
          writing: { lyricism: 3, wordplay: 3, creativity: 3, flow: 3 },
          performance: { stage_presence: 2, crowd_control: 2, delivery: 2 },
          personal: { financial_stability: 2, reputation: 2, family_bond: 2 },
          resilience: 3
        }
      })
    }
  );

  // ========================================
  // 3. MALFORMED REQUEST TESTS
  // ========================================
  console.log('\n\n>>> MALFORMED REQUEST TESTS <<<\n');

  await testEndpoint(
    'Test 3.1: Invalid JSON payload',
    `${BASE_URL}/api/battler/create`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'this is not json'
    }
  );

  await testEndpoint(
    'Test 3.2: Missing required fields',
    `${BASE_URL}/api/battler/create`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage_name: 'Test Rapper'
      })
    }
  );

  await testEndpoint(
    'Test 3.3: Accept battle with invalid UUID',
    `${BASE_URL}/api/battles/not-a-uuid/accept`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }
  );

  await testEndpoint(
    'Test 3.4: Set prep with invalid day_index (0)',
    `${BASE_URL}/api/battles/00000000-0000-0000-0000-000000000000/prep`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day_index: 0,
        focus: 'writing'
      })
    }
  );

  await testEndpoint(
    'Test 3.5: Set prep with negative day_index',
    `${BASE_URL}/api/battles/00000000-0000-0000-0000-000000000000/prep`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day_index: -5,
        focus: 'writing'
      })
    }
  );

  await testEndpoint(
    'Test 3.6: Set prep with invalid focus type',
    `${BASE_URL}/api/battles/00000000-0000-0000-0000-000000000000/prep`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day_index: 1,
        focus: 'invalid_focus'
      })
    }
  );

  // ========================================
  // 4. NON-EXISTENT RESOURCE TESTS
  // ========================================
  console.log('\n\n>>> NON-EXISTENT RESOURCE TESTS <<<\n');

  await testEndpoint(
    'Test 4.1: Accept non-existent battle',
    `${BASE_URL}/api/battles/00000000-0000-0000-0000-000000000000/accept`,
    {
      method: 'POST'
    }
  );

  await testEndpoint(
    'Test 4.2: Get non-existent battle',
    `${BASE_URL}/api/battles/00000000-0000-0000-0000-000000000000`
  );

  await testEndpoint(
    'Test 4.3: Set prep for non-existent battle',
    `${BASE_URL}/api/battles/00000000-0000-0000-0000-000000000000/prep`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day_index: 1,
        focus: 'writing'
      })
    }
  );

  await testEndpoint(
    'Test 4.4: Get non-existent news article',
    `${BASE_URL}/api/news/fake-slug-that-does-not-exist`
  );

  // ========================================
  // 5. INTERNAL API SECURITY TESTS
  // ========================================
  console.log('\n\n>>> INTERNAL API SECURITY TESTS <<<\n');

  await testEndpoint(
    'Test 5.1: Call internal API without secret',
    `${BASE_URL}/api/internal/run-due-battles`,
    {
      method: 'POST'
    }
  );

  await testEndpoint(
    'Test 5.2: Call internal API with wrong secret',
    `${BASE_URL}/api/internal/run-due-battles`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer wrong-secret'
      }
    }
  );

  await testEndpoint(
    'Test 5.3: Call internal API to generate offers without secret',
    `${BASE_URL}/api/internal/generate-battle-offers`,
    {
      method: 'POST'
    }
  );

  // ========================================
  // 6. HTTP METHOD TESTS
  // ========================================
  console.log('\n\n>>> UNSUPPORTED HTTP METHOD TESTS <<<\n');

  await testEndpoint(
    'Test 6.1: DELETE on battler create endpoint',
    `${BASE_URL}/api/battler/create`,
    {
      method: 'DELETE'
    }
  );

  await testEndpoint(
    'Test 6.2: PUT on battle accept endpoint',
    `${BASE_URL}/api/battles/00000000-0000-0000-0000-000000000000/accept`,
    {
      method: 'PUT'
    }
  );

  await testEndpoint(
    'Test 6.3: PATCH on news endpoint',
    `${BASE_URL}/api/news`,
    {
      method: 'PATCH'
    }
  );

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n\n================================');
  console.log('TEST SUITE COMPLETED');
  console.log('================================');
  console.log('\nReview the results above to check:');
  console.log('- Are error messages clear and helpful?');
  console.log('- Are HTTP status codes correct?');
  console.log('- Are there any 500 errors that should be 400s?');
  console.log('- Are authentication checks working?');
  console.log('- Are validation checks comprehensive?');
  console.log('- Are internal APIs properly secured?');
}

// Run tests
runTests().catch(console.error);
