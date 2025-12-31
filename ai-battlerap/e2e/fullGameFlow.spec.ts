/**
 * END-TO-END TEST: Full Game Flow
 *
 * Tests the complete game experience from start to finish:
 * 1. Create account & battler
 * 2. Accept battle offer
 * 3. Complete prep phase
 * 4. Locked In mode - select content for all rounds
 * 5. View results
 * 6. Check for life events
 * 7. Repeat for multiple battles to test event frequency
 */

import { test, expect } from '@playwright/test';

test.describe('Full Game Flow E2E', () => {
  test.setTimeout(300000); // 5 minutes for full flow

  let battlerId: string;
  let battleId: string;

  test('Complete Game Flow: Create → Battle → Events', async ({ page }) => {
    // ========================================
    // STEP 1: Create Account & Battler
    // ========================================
    console.log('\n🎯 STEP 1: Creating account and battler...');

    await page.goto('/');

    // Check if we need to create an account or if already logged in
    const isLoggedIn = await page.locator('text=Dashboard').isVisible().catch(() => false);

    if (!isLoggedIn) {
      // Sign up flow (if needed)
      await page.goto('/onboarding');

      // Fill battler creation form
      await page.fill('[name="battle_rap_name"]', `TestBattler${Date.now()}`);
      await page.fill('[name="real_name"]', 'E2E Test User');

      // Allocate attributes (example: balanced build)
      await page.fill('[name="lyricism"]', '7');
      await page.fill('[name="wordplay"]', '6');
      await page.fill('[name="creativity"]', '7');
      await page.fill('[name="flow"]', '6');
      await page.fill('[name="stage_presence"]', '6');
      await page.fill('[name="crowd_control"]', '6');
      await page.fill('[name="delivery"]', '7');
      await page.fill('[name="resilience"]', '5');

      // Select league
      await page.selectOption('[name="primary_league"]', 'Small Room Circuit');

      // Select style tags (example)
      await page.click('text=Wordplay Wizard');
      await page.click('text=Punchline King');
      await page.click('text=Technical');

      // Submit
      await page.click('button:has-text("Create Battler")');

      // Wait for redirect
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    }

    console.log('✅ Battler created/logged in');

    // ========================================
    // STEP 2: Accept Battle Offer
    // ========================================
    console.log('\n🎯 STEP 2: Accepting battle offer...');

    await page.goto('/battle/offers');

    // Wait for offers to load
    await page.waitForSelector('[data-testid="battle-offer"]', { timeout: 10000 });

    // Accept first available battle
    await page.click('[data-testid="battle-offer"] >> text=Accept');

    // Get battle ID from URL
    await page.waitForURL('**/battle/*');
    const url = page.url();
    battleId = url.split('/battle/')[1].split('/')[0];

    console.log(`✅ Battle accepted: ${battleId}`);

    // ========================================
    // STEP 3: Complete Prep Phase
    // ========================================
    console.log('\n🎯 STEP 3: Completing prep phase...');

    await page.goto(`/battle/${battleId}/prep`);

    // Select prep focus for each day (example: balanced approach)
    const prepDays = await page.locator('[data-testid="prep-day"]').count();

    for (let i = 0; i < prepDays; i++) {
      await page.locator('[data-testid="prep-day"]').nth(i).selectOption('writing');

      // Alternate between writing and performance
      if (i % 2 === 0) {
        await page.locator('[data-testid="prep-day"]').nth(i).selectOption('writing');
      } else {
        await page.locator('[data-testid="prep-day"]').nth(i).selectOption('performance');
      }
    }

    // Lock prep
    await page.click('button:has-text("Lock Prep")');
    await expect(page.locator('text=Prep locked')).toBeVisible({ timeout: 5000 });

    console.log('✅ Prep phase completed');

    // ========================================
    // STEP 4: Locked In Mode - Round 1
    // ========================================
    console.log('\n🎯 STEP 4: Entering Locked In mode...');

    await page.goto(`/battle/${battleId}/control`);

    // Select PPV context
    await page.selectOption('[name="context"]', 'ppv');

    // Click Locked In mode
    await page.click('button:has-text("Locked In Mode")');

    // Wait for Round 1 content selection
    await page.waitForURL(`**/battle/${battleId}/round/1/select`);

    console.log('✅ Locked In mode activated');

    // ========================================
    // STEP 5: Select Content - Round 1
    // ========================================
    console.log('\n🎯 STEP 5: Selecting content for Round 1...');

    // Select 3 content types
    await page.click('[data-content-type="wordplay"]');
    await page.click('[data-content-type="schemes"]');
    await page.click('[data-content-type="punchlines"]');

    // Select 1 delivery type
    await page.click('[data-delivery-type="smooth_flow"]');

    // Select 1 performance type
    await page.click('[data-performance-type="stage_presence"]');

    // Check effectiveness forecast is displayed
    await expect(page.locator('[data-testid="effectiveness-forecast"]')).toBeVisible();

    const multiplier = await page.locator('[data-testid="final-multiplier"]').textContent();
    console.log(`   Forecast Multiplier: ${multiplier}`);

    // Confirm selection
    await page.click('button:has-text("Confirm Selection")');

    console.log('✅ Round 1 content selected');

    // ========================================
    // STEP 6: Simulate Round 1
    // ========================================
    console.log('\n🎯 STEP 6: Simulating Round 1...');

    await page.click('button:has-text("Simulate Round")');

    // Wait for results
    await page.waitForURL(`**/battle/${battleId}/round/1/results`);

    // Check round winner
    const r1Winner = await page.locator('[data-testid="round-winner"]').textContent();
    console.log(`   Round 1 Winner: ${r1Winner}`);

    // Verify effectiveness multiplier shown
    await expect(page.locator('[data-testid="effectiveness-multiplier"]')).toBeVisible();

    console.log('✅ Round 1 completed');

    // ========================================
    // STEP 7: Select Content - Round 2
    // ========================================
    console.log('\n🎯 STEP 7: Selecting content for Round 2...');

    await page.click('button:has-text("Continue to Round 2")');
    await page.waitForURL(`**/battle/${battleId}/round/2/select`);

    // Select 4 content types (Round 2 gets 4)
    await page.click('[data-content-type="wordplay"]');
    await page.click('[data-content-type="schemes"]');
    await page.click('[data-content-type="personals"]');
    await page.click('[data-content-type="rebuttals"]');

    // Select 1 delivery type
    await page.click('[data-delivery-type="smooth_flow"]');

    // Select 2 performance types (Round 2 gets 2)
    await page.click('[data-performance-type="stage_presence"]');
    await page.click('[data-performance-type="strategic_pauses"]');

    await page.click('button:has-text("Confirm Selection")');
    await page.click('button:has-text("Simulate Round")');

    await page.waitForURL(`**/battle/${battleId}/round/2/results`);

    const r2Winner = await page.locator('[data-testid="round-winner"]').textContent();
    console.log(`   Round 2 Winner: ${r2Winner}`);

    console.log('✅ Round 2 completed');

    // ========================================
    // STEP 8: Select Content - Round 3
    // ========================================
    console.log('\n🎯 STEP 8: Selecting content for Round 3...');

    await page.click('button:has-text("Continue to Round 3")');
    await page.waitForURL(`**/battle/${battleId}/round/3/select`);

    // Select 3 content types
    await page.click('[data-content-type="wordplay"]');
    await page.click('[data-content-type="schemes"]');
    await page.click('[data-content-type="punchlines"]');

    // Select 2 delivery types (Round 3 gets 2)
    await page.click('[data-delivery-type="smooth_flow"]');
    await page.click('[data-delivery-type="passionate"]');

    // Select 2 performance types (Round 3 gets 2)
    await page.click('[data-performance-type="stage_presence"]');
    await page.click('[data-performance-type="charismatic"]');

    await page.click('button:has-text("Confirm Selection")');
    await page.click('button:has-text("Simulate Round")');

    await page.waitForURL(`**/battle/${battleId}/round/3/results`);

    const r3Winner = await page.locator('[data-testid="round-winner"]').textContent();
    console.log(`   Round 3 Winner: ${r3Winner}`);

    console.log('✅ Round 3 completed');

    // ========================================
    // STEP 9: View Final Results
    // ========================================
    console.log('\n🎯 STEP 9: Viewing final battle results...');

    await page.click('button:has-text("View Final Results")');
    await page.waitForURL(`**/battle/${battleId}`);

    // Check final winner
    const finalWinner = await page.locator('[data-testid="battle-winner"]').textContent();
    console.log(`   🏆 Battle Winner: ${finalWinner}`);

    // Verify all 3 rounds displayed
    await expect(page.locator('[data-testid="round-1-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="round-2-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="round-3-result"]')).toBeVisible();

    console.log('✅ Battle completed successfully');

    // ========================================
    // STEP 10: Check for Life Events
    // ========================================
    console.log('\n🎯 STEP 10: Checking for life events...');

    await page.goto('/dashboard');

    // Check if any events triggered
    const hasEvent = await page.locator('[data-testid="life-event-notification"]').isVisible().catch(() => false);

    if (hasEvent) {
      const eventTitle = await page.locator('[data-testid="life-event-title"]').textContent();
      console.log(`   🎲 Life Event Triggered: ${eventTitle}`);

      // Make a choice (select first option)
      await page.click('[data-testid="event-choice-0"]');
      await page.click('button:has-text("Confirm Choice")');

      console.log('   ✅ Event choice made');
    } else {
      console.log('   ℹ️  No life event this battle (expected ~20-30% chance)');
    }

    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                 E2E TEST COMPLETE ✅                          ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log(`\n   Battle ID: ${battleId}`);
    console.log(`   Round 1 Winner: ${r1Winner}`);
    console.log(`   Round 2 Winner: ${r2Winner}`);
    console.log(`   Round 3 Winner: ${r3Winner}`);
    console.log(`   Final Winner: ${finalWinner}`);
    console.log(`   Life Event: ${hasEvent ? 'Yes' : 'No'}\n`);
  });

  test('Auto Mode Flow', async ({ page }) => {
    console.log('\n🎯 Testing Auto Mode...');

    // Accept a battle
    await page.goto('/battle/offers');
    await page.click('[data-testid="battle-offer"] >> text=Accept');

    await page.waitForURL('**/battle/*');
    const url = page.url();
    const autoBattleId = url.split('/battle/')[1].split('/')[0];

    // Complete prep
    await page.goto(`/battle/${autoBattleId}/prep`);
    const prepDays = await page.locator('[data-testid="prep-day"]').count();
    for (let i = 0; i < prepDays; i++) {
      await page.locator('[data-testid="prep-day"]').nth(i).selectOption('rest');
    }
    await page.click('button:has-text("Lock Prep")');

    // Select Auto mode
    await page.goto(`/battle/${autoBattleId}/control`);
    await page.selectOption('[name="context"]', 'on_cam');
    await page.click('button:has-text("Auto Mode")');

    // Should auto-simulate and redirect to results
    await page.waitForURL(`**/battle/${autoBattleId}`);

    // Verify all rounds completed
    await expect(page.locator('[data-testid="round-1-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="round-2-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="round-3-result"]')).toBeVisible();

    // Verify auto-selected badge on content
    await expect(page.locator('text=Auto-selected')).toBeVisible();

    console.log('✅ Auto mode test complete');
  });
});
