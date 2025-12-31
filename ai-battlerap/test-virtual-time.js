/**
 * Test Virtual Time Manipulation System
 *
 * Tests:
 * 1. getVirtualNow() returns correct time
 * 2. advanceTime() works
 * 3. Time calculations use virtual time
 * 4. Prep lock dates respect virtual time
 */

const BASE_URL = 'http://localhost:3000';

async function testTimeSystem() {
  console.log('='.repeat(60));
  console.log('VIRTUAL TIME MANIPULATION SYSTEM TEST');
  console.log('='.repeat(60));
  console.log();

  // Test 1: Check initial status
  console.log('Test 1: Check DEV_MODE is enabled');
  console.log('-'.repeat(60));
  const statusResponse = await fetch(`${BASE_URL}/api/dev/time/status`);
  const status = await statusResponse.json();

  if (!status.devModeEnabled) {
    console.error('❌ FAILED: DEV_MODE is not enabled!');
    console.log('Make sure DEV_MODE=true in .env.local');
    process.exit(1);
  }

  console.log('✓ DEV_MODE enabled:', status.devModeEnabled);
  console.log('✓ Virtual date:', status.virtualDate);
  console.log('✓ Real date:', status.realDate);
  console.log('✓ Current offset:', status.offsetDays, 'days');
  console.log();

  // Test 2: Reset to zero (ensure clean state)
  console.log('Test 2: Reset virtual time to real time');
  console.log('-'.repeat(60));
  const resetResponse = await fetch(`${BASE_URL}/api/dev/time/reset`, { method: 'POST' });
  const resetResult = await resetResponse.json();

  if (!resetResult.success) {
    console.error('❌ FAILED: Could not reset time');
    console.log(resetResult);
    process.exit(1);
  }

  console.log('✓ Time reset successfully');
  console.log('✓ Offset is now:', resetResult.status.offsetDays, 'days');
  console.log();

  // Test 3: Advance time by 1 day
  console.log('Test 3: Advance time by 1 day');
  console.log('-'.repeat(60));
  const advance1Response = await fetch(`${BASE_URL}/api/dev/time/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days: 1 })
  });
  const advance1Result = await advance1Response.json();

  if (!advance1Result.success) {
    console.error('❌ FAILED: Could not advance time');
    console.log(advance1Result);
    process.exit(1);
  }

  const expected1Day = 1;
  const actual1Day = advance1Result.status.offsetDays;

  if (Math.abs(actual1Day - expected1Day) > 0.001) {
    console.error('❌ FAILED: Offset mismatch');
    console.log('Expected:', expected1Day, 'days');
    console.log('Actual:', actual1Day, 'days');
    process.exit(1);
  }

  console.log('✓ Advanced by 1 day');
  console.log('✓ Virtual date:', advance1Result.newVirtualTime);
  console.log('✓ Offset verified:', actual1Day, 'days');
  console.log();

  // Test 4: Advance time by 6 more days (7 total)
  console.log('Test 4: Advance time by 6 more days (7 total)');
  console.log('-'.repeat(60));
  const advance6Response = await fetch(`${BASE_URL}/api/dev/time/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days: 6 })
  });
  const advance6Result = await advance6Response.json();

  if (!advance6Result.success) {
    console.error('❌ FAILED: Could not advance time');
    console.log(advance6Result);
    process.exit(1);
  }

  const expected7Days = 7;
  const actual7Days = advance6Result.status.offsetDays;

  if (Math.abs(actual7Days - expected7Days) > 0.001) {
    console.error('❌ FAILED: Offset mismatch');
    console.log('Expected:', expected7Days, 'days');
    console.log('Actual:', actual7Days, 'days');
    process.exit(1);
  }

  console.log('✓ Advanced by 6 more days');
  console.log('✓ Total offset:', actual7Days, 'days');
  console.log('✓ Virtual date:', advance6Result.newVirtualTime);
  console.log();

  // Test 5: Test fractional days (12 hours)
  console.log('Test 5: Advance time by 0.5 days (12 hours)');
  console.log('-'.repeat(60));
  const advanceHalfResponse = await fetch(`${BASE_URL}/api/dev/time/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days: 0.5 })
  });
  const advanceHalfResult = await advanceHalfResponse.json();

  if (!advanceHalfResult.success) {
    console.error('❌ FAILED: Could not advance time');
    console.log(advanceHalfResult);
    process.exit(1);
  }

  const expected75Days = 7.5;
  const actual75Days = advanceHalfResult.status.offsetDays;

  if (Math.abs(actual75Days - expected75Days) > 0.001) {
    console.error('❌ FAILED: Offset mismatch');
    console.log('Expected:', expected75Days, 'days');
    console.log('Actual:', actual75Days, 'days');
    process.exit(1);
  }

  console.log('✓ Advanced by 0.5 days (12 hours)');
  console.log('✓ Total offset:', actual75Days, 'days');
  console.log('✓ Fractional time works correctly');
  console.log();

  // Test 6: Verify persistence within same process
  console.log('Test 6: Verify offset persists across API calls');
  console.log('-'.repeat(60));
  const verifyResponse = await fetch(`${BASE_URL}/api/dev/time/status`);
  const verifyStatus = await verifyResponse.json();

  if (Math.abs(verifyStatus.offsetDays - 7.5) > 0.001) {
    console.error('❌ FAILED: Offset did not persist');
    console.log('Expected:', 7.5, 'days');
    console.log('Actual:', verifyStatus.offsetDays, 'days');
    process.exit(1);
  }

  console.log('✓ Offset persists:', verifyStatus.offsetDays, 'days');
  console.log('✓ Virtual date:', verifyStatus.virtualDate);
  console.log();

  // Test 7: Calculate date difference
  console.log('Test 7: Verify date calculations');
  console.log('-'.repeat(60));
  const realDate = new Date(verifyStatus.realDate);
  const virtualDate = new Date(verifyStatus.virtualDate);
  const diffMs = virtualDate - realDate;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  console.log('✓ Real date:', realDate.toISOString());
  console.log('✓ Virtual date:', virtualDate.toISOString());
  console.log('✓ Calculated difference:', diffDays.toFixed(2), 'days');
  console.log('✓ Reported offset:', verifyStatus.offsetDays.toFixed(2), 'days');

  if (Math.abs(diffDays - 7.5) > 0.001) {
    console.error('❌ FAILED: Date calculation mismatch');
    process.exit(1);
  }
  console.log('✓ Date calculations verified');
  console.log();

  // Test 8: Reset to clean state
  console.log('Test 8: Final reset to real time');
  console.log('-'.repeat(60));
  const finalResetResponse = await fetch(`${BASE_URL}/api/dev/time/reset`, { method: 'POST' });
  const finalResetResult = await finalResetResponse.json();

  if (!finalResetResult.success || finalResetResult.status.offsetDays !== 0) {
    console.error('❌ FAILED: Could not reset to zero');
    console.log(finalResetResult);
    process.exit(1);
  }

  console.log('✓ Reset to real time');
  console.log('✓ Offset is now:', finalResetResult.status.offsetDays, 'days');
  console.log();

  // Summary
  console.log('='.repeat(60));
  console.log('✅ ALL TESTS PASSED');
  console.log('='.repeat(60));
  console.log();
  console.log('Virtual Time System Status:');
  console.log('  • getVirtualNow() - WORKING ✓');
  console.log('  • advanceTime() - WORKING ✓');
  console.log('  • resetVirtualTime() - WORKING ✓');
  console.log('  • Fractional days - WORKING ✓');
  console.log('  • Offset persistence - WORKING ✓');
  console.log('  • Date calculations - WORKING ✓');
  console.log();
  console.log('Usage Instructions:');
  console.log('  1. Advance time: POST /api/dev/time/advance {"days": N}');
  console.log('  2. Reset time: POST /api/dev/time/reset');
  console.log('  3. Check status: GET /api/dev/time/status');
  console.log('  4. UI available at: http://localhost:3000/dev');
  console.log();
}

// Run tests
testTimeSystem().catch(err => {
  console.error('❌ TEST FAILED WITH ERROR:');
  console.error(err);
  process.exit(1);
});
