import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAuth() {
  console.log('\n📋 CHECKING AUTH & PROFILES...\n');

  // Check if dev user exists
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.log('❌ Error listing users:', authError);
    return;
  }

  console.log(`Found ${users?.length || 0} user(s):`);
  users?.forEach((user: any) => {
    console.log(`  • ${user.email} (${user.id})`);
  });

  // Check profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');

  if (profilesError) {
    console.log('\n❌ Error querying profiles:', profilesError);
  } else {
    console.log(`\nFound ${profiles?.length || 0} profile(s):`);
    profiles?.forEach((p: any) => {
      console.log(`  • User: ${p.user_id}`);
      console.log(`    Has battler: ${p.battler_id ? 'YES' : 'NO'}`);
      console.log(`    Onboarding complete: ${p.onboarding_completed ? 'YES' : 'NO'}`);
    });
  }

  // Check battlers
  const { data: battlers, error: battlersError } = await supabase
    .from('battlers')
    .select('*')
    .not('user_id', 'is', null);

  if (battlersError) {
    console.log('\n❌ Error querying player battlers:', battlersError);
  } else {
    console.log(`\nFound ${battlers?.length || 0} player battler(s):`);
    battlers?.forEach((b: any) => {
      console.log(`  • ${b.stage_name} (Level ${b.level}, ${b.total_xp} XP)`);
    });
  }
}

checkAuth().catch(console.error);
