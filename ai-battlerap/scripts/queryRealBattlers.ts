/**
 * Query real battler profiles from the database for validation testing
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

async function queryRealBattlers() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  console.log('Querying real battler profiles...\n');

  // First check if we have any battler_attributes at all
  const { data: allAttrs, error: attrsError } = await supabase
    .from('battler_attributes')
    .select('battler_id')
    .limit(5);

  console.log('Checking for battler_attributes...');
  console.log(`Found ${allAttrs?.length || 0} battler_attributes records`);
  console.log();

  // Get battlers WITHOUT joining attributes first
  const { data: allBattlers, error: battlersError } = await supabase
    .from('battlers')
    .select('id, stage_name, tier, style_tags, is_ai')
    .eq('is_ai', true)
    .order('created_at', { ascending: true })
    .limit(30);

  if (battlersError) {
    console.error('Error querying battlers:', battlersError);
    return;
  }

  console.log(`Found ${allBattlers?.length || 0} AI battlers\n`);

  // Now get attributes for each battler
  const battlersWithAttrs = [];

  for (const battler of allBattlers || []) {
    const { data: attrs } = await supabase
      .from('battler_attributes')
      .select('*')
      .eq('battler_id', battler.id)
      .single();

    if (attrs) {
      battlersWithAttrs.push({
        ...battler,
        attributes: attrs,
      });
    }
  }

  console.log(`Battlers with attributes: ${battlersWithAttrs.length}\n`);

  if (battlersWithAttrs.length === 0) {
    console.log('❌ No battlers with attributes found.');
    console.log('The database needs to be seeded with battler profiles.');
    console.log('\nWould you like me to:');
    console.log('1. Create seed battlers for testing, or');
    console.log('2. Use the validation script with synthetic test profiles?');
    return;
  }

  console.log('='.repeat(80));
  console.log('BATTLERS WITH ATTRIBUTES:');
  console.log('='.repeat(80));
  console.log();

  // Display battlers with key info
  battlersWithAttrs.forEach((battler, idx) => {
    const attrs = battler.attributes;
    const hasKnownChoker = battler.style_tags?.includes('Known Choker');
    const hasClutchPerformer = battler.style_tags?.includes('Clutch Performer');

    console.log(`${idx + 1}. ${battler.stage_name}`);
    console.log(`   ID: ${battler.id}`);
    console.log(`   Tier: ${battler.tier}`);
    console.log(`   Resilience: ${attrs.resilience}`);
    console.log(`   Badges: ${battler.style_tags?.length > 0 ? battler.style_tags.join(', ') : 'None'}`);
    if (hasKnownChoker) console.log('   ⚠️  HAS "Known Choker" BADGE');
    if (hasClutchPerformer) console.log('   ⭐ HAS "Clutch Performer" BADGE');
    console.log(`   Writing: L${attrs.writing.lyricism} W${attrs.writing.wordplay} C${attrs.writing.creativity}`);
    console.log(`   Performance: S${attrs.performance.stage_presence} C${attrs.performance.crowd_control} D${attrs.performance.delivery}`);
    console.log(`   Personal: F${attrs.personal.financial_stability} R${attrs.personal.reputation} F${attrs.personal.family_bond} P${attrs.personal.preparation}`);
    console.log();
  });

  // Find diverse profiles for testing
  console.log('\n' + '='.repeat(80));
  console.log('RECOMMENDED BATTLERS FOR VALIDATION TESTING:');
  console.log('='.repeat(80));
  console.log();

  // Find a Known Choker
  const knownChoker = battlersWithAttrs.find(b => b.style_tags?.includes('Known Choker'));
  if (knownChoker) {
    const attrs = knownChoker.attributes;
    console.log(`1. Known Choker: ${knownChoker.stage_name}`);
    console.log(`   ID: ${knownChoker.id}`);
    console.log(`   Resilience: ${attrs?.resilience}`);
    console.log(`   Expected choke rate: ~46-50%`);
    console.log();
  } else {
    console.log('❌ No "Known Choker" battler found');
    console.log();
  }

  // Find a Clutch Performer
  const clutchPerformer = battlersWithAttrs.find(b => b.style_tags?.includes('Clutch Performer'));
  if (clutchPerformer) {
    const attrs = clutchPerformer.attributes;
    console.log(`2. Clutch Performer: ${clutchPerformer.stage_name}`);
    console.log(`   ID: ${clutchPerformer.id}`);
    console.log(`   Resilience: ${attrs?.resilience}`);
    console.log(`   Expected choke rate: ~3%`);
    console.log();
  } else {
    console.log('❌ No "Clutch Performer" battler found');
    console.log();
  }

  // Find average resilience battlers (no special badges)
  const averageBattlers = battlersWithAttrs.filter(b => {
    const attrs = b.attributes;
    return attrs &&
           attrs.resilience >= 4 &&
           attrs.resilience <= 6 &&
           !b.style_tags?.includes('Known Choker') &&
           !b.style_tags?.includes('Clutch Performer');
  }).slice(0, 3);

  if (averageBattlers.length > 0) {
    console.log('3-5. Average Battlers (Resilience 4-6, no special badges):');
    averageBattlers.forEach((battler, idx) => {
      const attrs = battler.attributes;
      console.log(`   ${idx + 3}. ${battler.stage_name} (ID: ${battler.id})`);
      console.log(`      Resilience: ${attrs?.resilience}`);
      console.log(`      Expected choke rate: ~7%`);
    });
    console.log();
  } else {
    console.log('❌ No average battlers found');
    console.log();
  }

  // Find low resilience battler
  const lowResilience = battlersWithAttrs.filter(b => {
    const attrs = b.attributes;
    return attrs && attrs.resilience <= 3;
  })[0];

  if (lowResilience) {
    const attrs = lowResilience.attributes;
    console.log(`6. Low Resilience: ${lowResilience.stage_name}`);
    console.log(`   ID: ${lowResilience.id}`);
    console.log(`   Resilience: ${attrs?.resilience}`);
    console.log(`   Expected choke rate: ~10-15%`);
    console.log();
  } else {
    console.log('❌ No low resilience battler found');
    console.log();
  }

  // Find high resilience battler
  const highResilience = battlersWithAttrs.filter(b => {
    const attrs = b.attributes;
    return attrs && attrs.resilience >= 8 && !b.style_tags?.includes('Clutch Performer');
  })[0];

  if (highResilience) {
    const attrs = highResilience.attributes;
    console.log(`7. High Resilience: ${highResilience.stage_name}`);
    console.log(`   ID: ${highResilience.id}`);
    console.log(`   Resilience: ${attrs?.resilience}`);
    console.log(`   Expected choke rate: ~2-4%`);
    console.log();
  }

  console.log('='.repeat(80));

  // Export IDs for validation script
  const selectedBattlers = [
    knownChoker,
    clutchPerformer,
    ...averageBattlers,
    lowResilience,
    highResilience,
  ].filter(Boolean);

  if (selectedBattlers.length > 0) {
    console.log('\nBATTLER IDs FOR VALIDATION SCRIPT:');
    console.log(JSON.stringify(selectedBattlers.map(b => b!.id), null, 2));
  }
}

queryRealBattlers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
