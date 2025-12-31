/**
 * Phase 2 Feature Testing Script
 *
 * Tests all Phase 2 features:
 * 1. XP & Level system (battle progression)
 * 2. Tournament system
 * 3. Notifications
 * 4. Life event resolution
 * 5. Badge earning
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function log(section: string, message: string, status: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const symbols = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
  console.log(`${symbols[status]} [${section}] ${message}`);
}

async function createTestBattler() {
  log('Setup', 'Creating test battler...');

  const testEmail = `test${Date.now()}@battlerap.com`;

  // Create test user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'test123',
    email_confirm: true
  });

  if (authError) {
    log('Setup', `Failed to create user: ${authError.message}`, 'error');
    return null;
  }

  const userId = authData.user.id;
  log('Setup', `Created user: ${userId}`, 'success');

  // Get a league
  const { data: leagues } = await supabase
    .from('leagues')
    .select('id')
    .limit(1)
    .single();

  if (!leagues) {
    log('Setup', 'No leagues found', 'error');
    return null;
  }

  // Create battler
  const { data: battler, error: battlerError } = await supabase
    .from('battlers')
    .insert({
      user_id: userId,
      stage_name: 'Test Battler',
      region: 'Test City',
      primary_league_id: leagues.id,
      style_tags: ['wordplay', 'comedy'],
      is_ai: false,
      tier: 'low',
      level: 1,
      total_xp: 0,
      current_level_xp: 0,
      skill_points_available: 0
    })
    .select()
    .single();

  if (battlerError) {
    log('Setup', `Failed to create battler: ${battlerError.message}`, 'error');
    return null;
  }

  // Create battler attributes
  const { error: attrError } = await supabase
    .from('battler_attributes')
    .insert({
      battler_id: battler.id,
      writing: { lyricism: 5, wordplay: 6, creativity: 5, flow: 5 },
      performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
      personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5, believability: 5 },
      resilience: 5
    });

  if (attrError) {
    log('Setup', `Failed to create attributes: ${attrError.message}`, 'error');
    return null;
  }

  // Create profile
  await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      battler_id: battler.id,
      onboarding_completed: true
    });

  // Initialize battler_fans
  await supabase
    .from('battler_fans')
    .insert({
      battler_id: battler.id,
      total_fans: 100,
      hardcore_fans: 20,
      casual_fans: 80
    });

  log('Setup', `Created battler: ${battler.stage_name} (${battler.id})`, 'success');
  return battler;
}

async function testBattleSimulationWithXP(battlerId: string) {
  log('XP System', 'Testing battle simulation with XP earning...');

  // Get an AI opponent
  const { data: opponent } = await supabase
    .from('battlers')
    .select('id')
    .eq('is_ai', true)
    .limit(1)
    .single();

  if (!opponent) {
    log('XP System', 'No AI opponents found', 'error');
    return false;
  }

  // Get league
  const { data: battler } = await supabase
    .from('battlers')
    .select('primary_league_id')
    .eq('id', battlerId)
    .single();

  // Create a battle (lock_prep_at should be before scheduled_at)
  const now = new Date();
  const scheduled = new Date(now.getTime() - 1000); // 1 second ago
  const lockPrep = new Date(now.getTime() - 2000); // 2 seconds ago

  const { data: battle, error: battleError } = await supabase
    .from('battles')
    .insert({
      battler_player_id: battlerId,
      battler_ai_id: opponent.id,
      league_id: battler?.primary_league_id,
      scheduled_at: scheduled.toISOString(),
      lock_prep_at: lockPrep.toISOString(),
      status: 'accepted'
    })
    .select()
    .single();

  if (battleError) {
    log('XP System', `Failed to create battle: ${battleError.message}`, 'error');
    return false;
  }

  log('XP System', `Created battle: ${battle.id}`, 'success');

  // Simulate the battle via API
  const response = await fetch(`http://localhost:3000/api/internal/run-due-battles?battle_id=${battle.id}`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer local-dev-secret-123'
    }
  });

  if (!response.ok) {
    log('XP System', `Failed to simulate battle: ${response.statusText}`, 'error');
    return false;
  }

  const result = await response.json();
  log('XP System', `Battle simulated: ${result.battlesSimulated} battle(s)`, 'success');

  // Check if XP was earned
  const { data: xpHistory } = await supabase
    .from('xp_history')
    .select('*')
    .eq('battler_id', battlerId)
    .eq('battle_id', battle.id);

  if (xpHistory && xpHistory.length > 0) {
    log('XP System', `XP earned: ${xpHistory.reduce((sum, x) => sum + x.xp_earned, 0)} XP`, 'success');
  } else {
    log('XP System', 'No XP records found', 'warn');
  }

  // Check battle_progression
  const { data: progression } = await supabase
    .from('battle_progression')
    .select('*')
    .eq('battle_id', battle.id)
    .eq('battler_id', battlerId)
    .single();

  if (progression) {
    log('XP System', `Progression recorded:`, 'success');
    log('XP System', `  XP earned: ${progression.xp_earned || 0}`, 'info');
    log('XP System', `  Level: ${progression.level_before} → ${progression.level_after}`, 'info');
    if (progression.skill_points_earned > 0) {
      log('XP System', `  Skill points earned: ${progression.skill_points_earned}`, 'success');
    }
  } else {
    log('XP System', 'No battle progression record found', 'warn');
  }

  return true;
}

async function testTournamentSystem() {
  log('Tournaments', 'Testing tournament system...');

  // Check existing tournament
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('status', 'registration')
    .limit(1)
    .single();

  if (!tournament) {
    log('Tournaments', 'No registration-open tournaments found', 'warn');
    return false;
  }

  log('Tournaments', `Found tournament: ${tournament.name}`, 'success');
  log('Tournaments', `  Status: ${tournament.status}`, 'info');
  log('Tournaments', `  Max participants: ${tournament.max_participants}`, 'info');

  // Count participants
  const { data: participants, count } = await supabase
    .from('tournament_participants')
    .select('*', { count: 'exact' })
    .eq('tournament_id', tournament.id);

  log('Tournaments', `  Current participants: ${count || 0}`, 'info');

  return true;
}

async function testNotifications(battlerId: string) {
  log('Notifications', 'Testing notification system...');

  // Create a test notification
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      battler_id: battlerId,
      type: 'battle_offer',
      title: 'Test Notification',
      message: 'This is a test notification',
      metadata: { test: true }
    })
    .select()
    .single();

  if (error) {
    log('Notifications', `Failed to create notification: ${error.message}`, 'error');
    return false;
  }

  log('Notifications', `Created notification: ${notification.id}`, 'success');

  // Mark as read
  const { error: updateError } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notification.id);

  if (updateError) {
    log('Notifications', `Failed to mark as read: ${updateError.message}`, 'error');
    return false;
  }

  log('Notifications', 'Successfully marked notification as read', 'success');
  return true;
}

async function testLifeEvents(battlerId: string) {
  log('Life Events', 'Testing life event system...');

  // Get a life event template
  const { data: template } = await supabase
    .from('life_event_templates')
    .select('*')
    .eq('is_choice_based', true)
    .limit(1)
    .single();

  if (!template) {
    log('Life Events', 'No choice-based life event templates found', 'warn');
    return false;
  }

  log('Life Events', `Found template: ${template.title}`, 'success');

  // Create a life event
  const { data: lifeEvent, error } = await supabase
    .from('life_events')
    .insert({
      battler_id: battlerId,
      template_id: template.id,
      event_type: template.event_type,
      title: template.title,
      description: template.description,
      status: 'pending',
      triggered_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    log('Life Events', `Failed to create life event: ${error.message}`, 'error');
    return false;
  }

  log('Life Events', `Created life event: ${lifeEvent.id}`, 'success');

  // Check if it has choices
  const { data: choices } = await supabase
    .from('life_event_choices')
    .select('*')
    .eq('template_id', template.id);

  if (choices && choices.length > 0) {
    log('Life Events', `  Choices available: ${choices.length}`, 'success');

    // Resolve with first choice
    const firstChoice = choices[0];
    const { error: resolveError } = await supabase
      .from('life_events')
      .update({
        status: 'resolved',
        chosen_option_id: firstChoice.id,
        resolved_at: new Date().toISOString()
      })
      .eq('id', lifeEvent.id);

    if (resolveError) {
      log('Life Events', `Failed to resolve event: ${resolveError.message}`, 'error');
      return false;
    }

    log('Life Events', `Resolved event with choice: ${firstChoice.label}`, 'success');
  }

  return true;
}

async function testBadgeSystem(battlerId: string) {
  log('Badges', 'Testing badge system...');

  // Check battler's initial badges
  const { data: battler } = await supabase
    .from('battlers')
    .select('style_tags, badges_at_creation')
    .eq('id', battlerId)
    .single();

  if (battler) {
    log('Badges', `Style tags: ${battler.style_tags?.join(', ') || 'none'}`, 'info');
    log('Badges', `Badges at creation: ${battler.badges_at_creation?.length || 0}`, 'info');
  }

  // Note: Badge earning logic would be triggered by battle simulation
  log('Badges', 'Badge earning is integrated with battle simulation', 'info');

  return true;
}

async function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║               PHASE 2 FEATURE TESTING                         ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // Setup
  const battler = await createTestBattler();
  if (!battler) {
    console.log('\n❌ Setup failed. Aborting tests.\n');
    return;
  }

  console.log('\n─────────────────────────────────────────────────────────────\n');

  // Test features
  await testBattleSimulationWithXP(battler.id);
  console.log('\n─────────────────────────────────────────────────────────────\n');

  await testNotifications(battler.id);
  console.log('\n─────────────────────────────────────────────────────────────\n');

  await testTournamentSystem();
  console.log('\n─────────────────────────────────────────────────────────────\n');

  await testLifeEvents(battler.id);
  console.log('\n─────────────────────────────────────────────────────────────\n');

  await testBadgeSystem(battler.id);

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                    TESTING COMPLETE                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
}

runAllTests().catch(console.error);
