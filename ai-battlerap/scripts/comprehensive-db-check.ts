import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TableCheckResult {
  name: string;
  exists: boolean;
  recordCount?: number;
  error?: string;
}

async function checkTable(tableName: string): Promise<TableCheckResult> {
  const { data, error, count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (error) {
    return { name: tableName, exists: false, error: error.message };
  }

  return { name: tableName, exists: true, recordCount: count || 0 };
}

async function comprehensiveCheck() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         PHASE 2 DATABASE MIGRATION VERIFICATION               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // Core Phase 2 tables
  const phase2Tables = {
    'XP & Level System': [
      'xp_history',
      'battle_progression'
    ],
    'Tournament System': [
      'tournaments',
      'tournament_participants',
      'tournament_brackets',
      'battle_judge_scores'
    ],
    'Notifications': [
      'notifications'
    ],
    'Fan & Views System': [
      'battler_fans',
      'battle_views',
      'league_audience',
      'view_history'
    ],
    'Battle Tracking': [
      'battle_verdicts',
      'segment_content_selections',
      'round_content_selections'
    ],
    'Life Events': [
      'life_event_choices',
      'life_event_metadata'
    ]
  };

  let totalTables = 0;
  let existingTables = 0;

  for (const [category, tables] of Object.entries(phase2Tables)) {
    console.log(`\n📋 ${category}`);
    console.log('─'.repeat(60));

    for (const tableName of tables) {
      totalTables++;
      const result = await checkTable(tableName);

      if (result.exists) {
        existingTables++;
        console.log(`✅ ${tableName.padEnd(35)} (${result.recordCount} records)`);
      } else {
        console.log(`❌ ${tableName.padEnd(35)} MISSING`);
      }
    }
  }

  // Check battlers table for new columns
  console.log('\n\n📋 Battlers Table - New Columns');
  console.log('─'.repeat(60));

  const { data: battler, error: battlerError } = await supabase
    .from('battlers')
    .select('*')
    .limit(1)
    .single();

  if (battlerError) {
    console.log('❌ Error querying battlers table:', battlerError.message);
  } else if (battler) {
    const newColumns = {
      'XP System': ['level', 'total_xp', 'current_level_xp', 'skill_points_available', 'skill_points_spent'],
      'Image System': ['avatar_url', 'banner_url'],
      'Payment System': ['current_balance', 'total_career_earnings', 'debt_amount']
    };

    for (const [feature, columns] of Object.entries(newColumns)) {
      console.log(`\n  ${feature}:`);
      for (const col of columns) {
        if (col in battler) {
          console.log(`    ✅ ${col}`);
        } else {
          console.log(`    ❌ ${col} MISSING`);
        }
      }
    }
  }

  // Check tournament data
  console.log('\n\n📋 Tournament Data Check');
  console.log('─'.repeat(60));

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*');

  if (tournaments && tournaments.length > 0) {
    console.log(`✅ Found ${tournaments.length} tournament(s)`);
    tournaments.forEach((t: any) => {
      console.log(`   • ${t.name}`);
      console.log(`     Status: ${t.status}`);
      console.log(`     Rounds: ${t.total_rounds}`);
      console.log(`     Max participants: ${t.max_participants}`);
    });
  } else {
    console.log('⚠️  No tournaments found');
  }

  // Summary
  console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                        SUMMARY                                ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const successRate = ((existingTables / totalTables) * 100).toFixed(1);
  console.log(`Tables Created: ${existingTables}/${totalTables} (${successRate}%)`);

  if (existingTables === totalTables) {
    console.log('\n✅ ALL PHASE 2 TABLES SUCCESSFULLY CREATED!\n');
  } else {
    console.log(`\n⚠️  ${totalTables - existingTables} tables missing. Check migration logs.\n`);
  }
}

comprehensiveCheck().catch(console.error);
