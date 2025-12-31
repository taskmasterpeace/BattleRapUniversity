import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBattlers() {
  console.log('\n📋 CHECKING BATTLERS TABLE...\n');

  const { data: battlers, error } = await supabase
    .from('battlers')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Error querying battlers:', error);
  } else {
    console.log('✅ Battlers table exists');
    if (battlers && battlers.length > 0) {
      console.log('\nColumns available:');
      console.log(Object.keys(battlers[0]));
      console.log('\nSample battler:');
      console.log(battlers[0]);
    }
  }
}

checkBattlers().catch(console.error);
