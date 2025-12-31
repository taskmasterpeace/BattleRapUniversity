import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyLeagueWeights() {
  console.log('Applying league weights balance fix...\n');

  try {
    // Update Small Room Circuit
    const { data: srcData, error: srcError } = await supabase
      .from('leagues')
      .update({
        writing_weight: 0.70,
        performance_weight: 0.30
      })
      .eq('short_code', 'SMALL_ROOM')
      .select();

    if (srcError) {
      console.error('Error updating Small Room Circuit:', srcError);
      process.exit(1);
    }
    console.log('✓ Updated Small Room Circuit (SMALL_ROOM): writing 0.70, performance 0.30');

    // Update Main Stage Arena
    const { data: msaData, error: msaError } = await supabase
      .from('leagues')
      .update({
        writing_weight: 0.30,
        performance_weight: 0.70
      })
      .eq('short_code', 'MAIN_STAGE')
      .select();

    if (msaError) {
      console.error('Error updating Main Stage Arena:', msaError);
      process.exit(1);
    }
    console.log('✓ Updated Main Stage Arena (MAIN_STAGE): writing 0.30, performance 0.70\n');

    // Verify changes
    const { data: leagues, error: verifyError } = await supabase
      .from('leagues')
      .select('name, short_code, writing_weight, performance_weight')
      .order('short_code');

    if (verifyError) {
      console.error('Error verifying changes:', verifyError);
      process.exit(1);
    }

    console.log('Current league weights:');
    leagues?.forEach(league => {
      console.log(`  ${league.short_code} (${league.name}): writing ${league.writing_weight}, performance ${league.performance_weight}`);
    });

    console.log('\n✓ Migration applied successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

applyLeagueWeights();
