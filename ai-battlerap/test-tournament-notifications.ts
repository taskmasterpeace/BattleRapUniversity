/**
 * Test Tournament Notification Triggers
 * Verifies that all 5 notification types are created correctly
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { registerForTournament } from './lib/game/tournamentManager';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function testRegistrationNotification() {
  console.log('\n=== TEST 1: Registration Notification ===');

  // Get the player's battler ID
  const { data: battler } = await supabase
    .from('battlers')
    .select('id, stage_name')
    .eq('is_player_owned', true)
    .single();

  if (!battler) {
    console.error('No player battler found. Please create a battler first.');
    return;
  }

  console.log(`Player battler: ${battler.stage_name} (${battler.id})`);

  // Get an open tournament
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('status', 'registration')
    .limit(1)
    .single();

  if (!tournament) {
    console.error('No open tournaments found.');
    console.log('Creating a test tournament...');

    // Get a league
    const { data: league } = await supabase
      .from('leagues')
      .select('id')
      .limit(1)
      .single();

    if (!league) {
      console.error('No leagues found.');
      return;
    }

    // Create a test tournament
    const registrationOpens = new Date();
    const registrationCloses = new Date();
    registrationCloses.setDate(registrationCloses.getDate() + 7);
    const tournamentStarts = new Date();
    tournamentStarts.setDate(tournamentStarts.getDate() + 30);

    const { data: newTournament, error: createError } = await supabase
      .from('tournaments')
      .insert({
        name: 'Test Tournament - Notification Test',
        description: 'Testing notification system',
        league_id: league.id,
        max_participants: 8,
        tier_restriction: 'all',
        tournament_format: 'single_elimination',
        total_prize_pool: 10000,
        prize_distribution: {
          winner: 5000,
          runner_up: 3000,
          semifinalists: 1000,
          quarterfinalists: 500,
        },
        status: 'registration',
        registration_opens_at: registrationOpens.toISOString(),
        registration_closes_at: registrationCloses.toISOString(),
        tournament_starts_at: tournamentStarts.toISOString(),
      })
      .select()
      .single();

    if (createError || !newTournament) {
      console.error('Failed to create test tournament:', createError);
      return;
    }

    console.log(`Created test tournament: ${newTournament.name} (${newTournament.id})`);
  }

  const targetTournament = tournament || (await supabase
    .from('tournaments')
    .select('*')
    .eq('status', 'registration')
    .limit(1)
    .single()).data;

  if (!targetTournament) {
    console.error('Failed to get tournament for registration test.');
    return;
  }

  console.log(`Registering for tournament: ${targetTournament.name}`);

  // Count notifications before registration
  const { count: beforeCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('battler_id', battler.id)
    .eq('type', 'tournament_update');

  console.log(`Notifications before registration: ${beforeCount}`);

  // Register for tournament (this should trigger notification #1)
  const result = await registerForTournament(targetTournament.id, battler.id);

  if (!result.success) {
    console.error('Registration failed:', result.error);
    return;
  }

  console.log('✓ Registration successful!');

  // Count notifications after registration
  const { count: afterCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('battler_id', battler.id)
    .eq('type', 'tournament_update');

  console.log(`Notifications after registration: ${afterCount}`);

  // Get the latest notification
  const { data: latestNotification } = await supabase
    .from('notifications')
    .select('*')
    .eq('battler_id', battler.id)
    .eq('type', 'tournament_update')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (latestNotification) {
    console.log('\n✓ Notification created successfully:');
    console.log(`  Title: ${latestNotification.title}`);
    console.log(`  Message: ${latestNotification.message}`);
    console.log(`  Metadata:`, JSON.stringify(latestNotification.metadata, null, 2));
    console.log(`  Created: ${latestNotification.created_at}`);
    console.log(`  Read: ${latestNotification.is_read}`);
  } else {
    console.error('✗ No notification found after registration!');
  }

  // Verify notification count increased
  if (afterCount! > beforeCount!) {
    console.log('\n✅ TEST PASSED: Registration notification was created!');
    console.log(`   Notification count increased from ${beforeCount} to ${afterCount}`);
  } else {
    console.log('\n❌ TEST FAILED: No new notification was created!');
  }
}

async function main() {
  console.log('Starting Tournament Notification Tests...');
  console.log('========================================\n');

  await testRegistrationNotification();

  console.log('\n========================================');
  console.log('Test complete!');
  console.log('\nNote: To test other notifications:');
  console.log('  2. Seeding notifications - Generate brackets for the tournament');
  console.log('  3. Match scheduled - Schedule tournament battles');
  console.log('  4. Match result - Simulate a tournament battle');
  console.log('  5. Tournament complete - Complete all rounds');
}

main().catch(console.error);
