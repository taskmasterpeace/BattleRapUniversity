/**
 * Simple Onboarding Test using Supabase Client
 *
 * This test creates a battler directly using the Supabase client,
 * bypassing the need for HTTP session management.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
const SUPABASE_SERVICE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const DEV_EMAIL = 'dev@test.com';
const DEV_PASSWORD = 'password123';

const TEST_BATTLER = {
  stage_name: 'Test Battler Alpha',
  region: 'NYC',
  style_tags: ['angles', 'wordplay', 'comedy'],
  allocated_attributes: {
    writing: {
      lyricism: 2,
      wordplay: 2,
      creativity: 2,
      flow: 2,
    },
    performance: {
      stage_presence: 2,
      crowd_control: 2,
      delivery: 2,
    },
    personal: {
      financial_stability: 3,
      reputation: 3,
      family_bond: 3,
    },
    resilience: 2, // Total: 8 + 6 + 9 + 2 = 25
  },
};

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}[${type.toUpperCase()}] ${message}${reset}`);
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('ONBOARDING TEST - Supabase Direct');
  console.log('='.repeat(60) + '\n');

  // Create client with anon key for auth
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Create service role client for admin operations
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Step 1: Authenticate
    log('Step 1: Authenticating...');
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
    });

    if (authError) {
      log('Sign in failed, trying to sign up...', 'warning');
      const { error: signUpError } = await supabase.auth.signUp({
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
      });

      if (signUpError) {
        throw new Error(`Sign up failed: ${signUpError.message}`);
      }

      // Sign in after signup
      ({ data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
      }));

      if (authError) {
        throw new Error(`Sign in after signup failed: ${authError.message}`);
      }
    }

    const userId = authData.user.id;
    log(`Authenticated as: ${authData.user.email} (${userId})`, 'success');

    // Step 2: Check for existing battler
    log('\nStep 2: Checking for existing battler...');
    const { data: existingBattlers } = await supabaseAdmin
      .from('battlers')
      .select('id, stage_name')
      .eq('user_id', userId)
      .eq('is_ai', false);

    if (existingBattlers && existingBattlers.length > 0) {
      log(`Found existing battler: "${existingBattlers[0].stage_name}"`, 'warning');
      log('Deleting existing battler for test...', 'warning');

      for (const battler of existingBattlers) {
        // Delete related data
        await supabaseAdmin.from('battler_attributes').delete().eq('battler_id', battler.id);
        await supabaseAdmin.from('rankings').delete().eq('battler_id', battler.id);
        await supabaseAdmin.from('battlers').delete().eq('id', battler.id);
      }

      log('Existing battler deleted', 'success');
    } else {
      log('No existing battler found', 'success');
    }

    // Step 3: Get league
    log('\nStep 3: Fetching leagues...');
    const { data: leagues, error: leagueError } = await supabaseAdmin
      .from('leagues')
      .select('*')
      .order('round_length_minutes');

    if (leagueError) {
      throw new Error(`Failed to fetch leagues: ${leagueError.message}`);
    }

    log(`Found ${leagues.length} leagues:`, 'success');
    leagues.forEach((league) => {
      log(`  - ${league.name} (${league.short_code}) - ${league.round_length_minutes}min rounds`);
    });

    const selectedLeague = leagues[0];
    log(`\nSelected: ${selectedLeague.name}`, 'success');

    // Step 4: Create battler
    log('\nStep 4: Creating battler...');
    log(`Stage Name: "${TEST_BATTLER.stage_name}"`);
    log(`Region: ${TEST_BATTLER.region}`);
    log(`Styles: ${TEST_BATTLER.style_tags.join(', ')}`);

    const { data: battler, error: battlerError } = await supabaseAdmin
      .from('battlers')
      .insert({
        user_id: userId,
        stage_name: TEST_BATTLER.stage_name,
        region: TEST_BATTLER.region,
        primary_league_id: selectedLeague.id,
        style_tags: TEST_BATTLER.style_tags,
        tier: 'low',
        is_ai: false,
      })
      .select()
      .single();

    if (battlerError) {
      throw new Error(`Failed to create battler: ${battlerError.message}`);
    }

    log(`Battler created! ID: ${battler.id}`, 'success');

    // Step 5: Create attributes
    log('\nStep 5: Creating attributes...');

    const attrs = TEST_BATTLER.allocated_attributes;
    log(`  Writing: L=${attrs.writing.lyricism} W=${attrs.writing.wordplay} C=${attrs.writing.creativity} F=${attrs.writing.flow}`);
    log(`  Performance: SP=${attrs.performance.stage_presence} CC=${attrs.performance.crowd_control} D=${attrs.performance.delivery}`);
    log(`  Personal: FS=${attrs.personal.financial_stability} R=${attrs.personal.reputation} FB=${attrs.personal.family_bond}`);
    log(`  Resilience: ${attrs.resilience}`);

    const { data: attributes, error: attrError } = await supabaseAdmin
      .from('battler_attributes')
      .insert({
        battler_id: battler.id,
        writing: attrs.writing,
        performance: attrs.performance,
        personal: {
          ...attrs.personal,
          preparation: 5, // Default baseline
        },
        resilience: attrs.resilience,
        public_knowledge: 10, // Default baseline
        xp: {},
      })
      .select()
      .single();

    if (attrError) {
      throw new Error(`Failed to create attributes: ${attrError.message}`);
    }

    log('Attributes created successfully!', 'success');

    // Step 6: Create ranking
    log('\nStep 6: Creating ranking entry...');
    const { data: ranking, error: rankError } = await supabaseAdmin
      .from('rankings')
      .insert({
        battler_id: battler.id,
        rating: 1200,
        wins: 0,
        losses: 0,
        streak: 0,
      })
      .select()
      .single();

    if (rankError) {
      throw new Error(`Failed to create ranking: ${rankError.message}`);
    }

    log(`Ranking created! Starting rating: ${ranking.rating}`, 'success');

    // Step 7: Verify everything
    log('\nStep 7: Verifying battler data...');
    const { data: verifyBattler, error: verifyError } = await supabaseAdmin
      .from('battlers')
      .select(`
        *,
        battler_attributes (*),
        rankings (*),
        leagues (*)
      `)
      .eq('id', battler.id)
      .single();

    if (verifyError) {
      throw new Error(`Verification failed: ${verifyError.message}`);
    }

    if (!verifyBattler) {
      throw new Error('Failed to verify battler');
    }

    log('\n' + '='.repeat(60));
    log('VERIFICATION RESULTS', 'success');
    log('='.repeat(60));
    log(`Stage Name: ${verifyBattler.stage_name}`);
    log(`Region: ${verifyBattler.region}`);
    log(`League: ${verifyBattler.leagues.name} (${verifyBattler.leagues.short_code})`);
    log(`Tier: ${verifyBattler.tier}`);
    log(`Style Tags: ${verifyBattler.style_tags.join(', ')}`);

    // Handle rankings - could be object or array
    const rankingData = Array.isArray(verifyBattler.rankings)
      ? verifyBattler.rankings[0]
      : verifyBattler.rankings;
    log(`Rating: ${rankingData?.rating || 'N/A'}`);
    log(`\nAttributes:`);

    // Handle attributes - could be object or array
    const savedAttrs = Array.isArray(verifyBattler.battler_attributes)
      ? verifyBattler.battler_attributes[0]
      : verifyBattler.battler_attributes;
    log(`  Writing:`);
    log(`    - Lyricism: ${savedAttrs.writing.lyricism}`);
    log(`    - Wordplay: ${savedAttrs.writing.wordplay}`);
    log(`    - Creativity: ${savedAttrs.writing.creativity}`);
    log(`    - Flow: ${savedAttrs.writing.flow}`);
    log(`  Performance:`);
    log(`    - Stage Presence: ${savedAttrs.performance.stage_presence}`);
    log(`    - Crowd Control: ${savedAttrs.performance.crowd_control}`);
    log(`    - Delivery: ${savedAttrs.performance.delivery}`);
    log(`  Personal:`);
    log(`    - Financial Stability: ${savedAttrs.personal.financial_stability}`);
    log(`    - Reputation: ${savedAttrs.personal.reputation}`);
    log(`    - Family Bond: ${savedAttrs.personal.family_bond}`);
    log(`    - Preparation: ${savedAttrs.personal.preparation} (default)`);
    log(`  Resilience: ${savedAttrs.resilience}`);
    log(`  Public Knowledge: ${savedAttrs.public_knowledge} (default)`);

    // Check attribute totals
    const writingTotal = Object.values(savedAttrs.writing).reduce((a, b) => a + b, 0);
    const performanceTotal = Object.values(savedAttrs.performance).reduce((a, b) => a + b, 0);
    const personalTotal = savedAttrs.personal.financial_stability +
                          savedAttrs.personal.reputation +
                          savedAttrs.personal.family_bond;
    const allocatedTotal = writingTotal + performanceTotal + personalTotal + savedAttrs.resilience;

    log(`\nAttribute Totals:`);
    log(`  Writing: ${writingTotal} / 14`);
    log(`  Performance: ${performanceTotal} / 8`);
    log(`  Personal (allocated): ${personalTotal} / 3`);
    log(`  Resilience: ${savedAttrs.resilience} / 1`);
    log(`  TOTAL ALLOCATED: ${allocatedTotal} / 25`);

    if (allocatedTotal === 25) {
      log('\n✓ Attribute allocation is correct!', 'success');
    } else {
      log(`\n✗ Attribute allocation is incorrect! Expected 25, got ${allocatedTotal}`, 'error');
    }

    log('\n' + '='.repeat(60));
    log('TEST PASSED - Battler created successfully!', 'success');
    log('='.repeat(60) + '\n');

    log(`\nYou can now visit http://localhost:3005/dashboard to see your battler!`);

  } catch (error) {
    log(`\nTest failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

main();
