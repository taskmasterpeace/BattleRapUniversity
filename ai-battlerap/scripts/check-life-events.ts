import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkLifeEvents() {
  console.log('\n📋 LIFE EVENT TEMPLATES\n');

  const { data, error } = await supabase
    .from('life_event_templates')
    .select('*');

  if (error) {
    console.log('❌ Error:', error);
    return;
  }

  console.log(`Total templates: ${data?.length || 0}`);

  if (data && data.length > 0) {
    console.log('\nSample template:');
    console.log('Columns:', Object.keys(data[0]));
    console.log('\nFirst template:');
    console.log(data[0]);

    // Check for choice-based
    const choiceBased = data.filter((t: any) =>
      t.choice_a_text && t.choice_b_text
    );
    console.log(`\nChoice-based templates: ${choiceBased.length}`);
    if (choiceBased.length > 0) {
      console.log('Example:');
      console.log(`  ${choiceBased[0].title}`);
      console.log(`  A: ${choiceBased[0].choice_a_text}`);
      console.log(`  B: ${choiceBased[0].choice_b_text}`);
    }
  }
}

checkLifeEvents().catch(console.error);
