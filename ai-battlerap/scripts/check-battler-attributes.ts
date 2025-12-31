import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBattlerAttributes() {
  console.log('\n📋 CHECKING BATTLER_ATTRIBUTES TABLE...\n');

  const { data, error } = await supabase
    .from('battler_attributes')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('✅ Table exists');
    console.log('\nColumns:');
    console.log(Object.keys(data[0]));
    console.log('\nSample record:');
    console.log(data[0]);
  } else {
    console.log('⚠️  Table exists but is empty');
  }
}

checkBattlerAttributes().catch(console.error);
