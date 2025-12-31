const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'
);

async function checkDatabase() {
  console.log('Checking database...\n');

  // Check battlers
  const { data: battlers, error } = await supabase
    .from('battlers')
    .select('id, stage_name, is_ai')
    .limit(10);

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log(`Found ${battlers.length} battlers:`);
  battlers.forEach(b => {
    console.log(`  - ${b.stage_name} (${b.is_ai ? 'AI' : 'Player'}) - ID: ${b.id}`);
  });

  // Check battles
  const { data: battles } = await supabase
    .from('battles')
    .select('id, status')
    .limit(5);

  console.log(`\nFound ${battles?.length || 0} battles`);

  // Check leagues
  const { data: leagues } = await supabase
    .from('leagues')
    .select('name, round_length_minutes');

  console.log(`\nLeagues:`);
  leagues?.forEach(l => {
    console.log(`  - ${l.name} (${l.round_length_minutes} min rounds)`);
  });
}

checkDatabase();
