import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('\n📋 CHECKING DATABASE TABLES...\n');

  // Check specific Phase 2 tables
  const phase2Tables = [
    'notifications',
    'tournaments',
    'tournament_participants',
    'tournament_brackets',
    'xp_history',
    'battle_progression',
    'tournament_judges',
    'fan_views',
    'battle_verdict_tracking',
    'segment_content_tracking'
  ];

  console.log('Checking Phase 2 tables:');
  for (const tableName of phase2Tables) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ ${tableName}: NOT FOUND or ERROR - ${error.message}`);
    } else {
      console.log(`✅ ${tableName}: EXISTS`);
    }
  }

  // Check battlers table for new columns
  console.log('\n📋 CHECKING BATTLERS TABLE COLUMNS...\n');
  const { data: battlers, error: battlersError } = await supabase
    .from('battlers')
    .select('id, stage_name, avatar_url, banner_url, level, total_xp, skill_points_available')
    .limit(1);

  if (battlersError) {
    console.log('❌ Battler columns error:', battlersError.message);
  } else {
    console.log('✅ avatar_url/banner_url columns: EXISTS');
    console.log('✅ level/total_xp/skill_points columns: EXISTS');
    if (battlers && battlers.length > 0) {
      console.log('Sample:', battlers[0]);
    }
  }

  // Check xp_history data
  console.log('\n📋 CHECKING XP HISTORY...\n');
  const { data: xpData, error: xpError } = await supabase
    .from('xp_history')
    .select('*')
    .limit(5);

  if (xpError) {
    console.log('❌ XP history error:', xpError.message);
  } else {
    console.log(`✅ XP history found: ${xpData?.length || 0} records`);
  }

  // Check tournaments
  console.log('\n📋 CHECKING TOURNAMENTS...\n');
  const { data: tournaments, error: tournamentsError } = await supabase
    .from('tournaments')
    .select('*')
    .limit(5);

  if (tournamentsError) {
    console.log('❌ Tournament data error:', tournamentsError.message);
  } else {
    console.log(`✅ Tournaments found: ${tournaments?.length || 0} records`);
    if (tournaments && tournaments.length > 0) {
      tournaments.forEach((t: any) => {
        console.log(`  - ${t.name} (${t.status})`);
      });
    }
  }

  // Check battle_progression table (XP tracking)
  console.log('\n📋 CHECKING BATTLE PROGRESSION...\n');
  const { data: progression, error: progressionError } = await supabase
    .from('battle_progression')
    .select('*')
    .limit(1);

  if (progressionError) {
    console.log('❌ battle_progression: ERROR -', progressionError.message);
  } else {
    console.log('✅ battle_progression: EXISTS');
    if (progression && progression.length > 0) {
      console.log('Sample:', progression[0]);
    }
  }

  // Check notifications
  console.log('\n📋 CHECKING NOTIFICATIONS...\n');
  const { data: notifications, error: notificationsError } = await supabase
    .from('notifications')
    .select('*')
    .limit(1);

  if (notificationsError) {
    console.log('❌ notifications: ERROR -', notificationsError.message);
  } else {
    console.log('✅ notifications: EXISTS');
  }

  console.log('\n✅ TABLE CHECK COMPLETE\n');
}

checkTables().catch(console.error);
