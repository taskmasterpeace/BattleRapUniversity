/**
 * Tru Foe Rebalancing Validation Script
 *
 * Validates that stumble/choke rates match Tru Foe's expert feedback:
 *
 * TARGET METRICS:
 * 1. Stumble Rate: 40% of battles should have at least one stumble (was 25%)
 * 2. Average Choke Rate: 7% of battles for average battler (was 5%)
 * 3. Known Choker Rate: 50% of battles for battlers with "Known Choker" badge (was 25%)
 *
 * This script runs bulk simulations and reports actual vs target metrics.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { simulateBattle } from './simulation';
import type { BattlerAttributes, League } from '@/lib/models';

// ============================================================================
// REAL BATTLER PROFILES FROM DATABASE
// ============================================================================

/**
 * These are actual battler IDs from the database, seeded specifically for validation.
 * We query their real attributes from the database rather than using synthetic profiles.
 */
const REAL_BATTLER_IDS = {
  // Seeded test battlers with specific choke/stumble characteristics
  knownChoker: '4ac69c8a-47b9-4195-a8ab-1b893f7409f0',      // Nervous Wreck (resilience 3 + Known Choker badge)
  clutchPerformer: 'eab61fec-e435-4b85-b8a1-8477fbc23ff0',  // Pressure Diamond (resilience 9 + Clutch Performer badge)
  averageBattler1: '14bf7a09-f926-4894-b986-4d1d136d2a95',  // Mid Tier Mike (resilience 5)
  averageBattler2: '982f3adb-ff68-480a-a8fb-b7c74844233e',  // Average Joe (resilience 4)
  lowResilience: '26645193-ac50-4310-99b8-403f347d67de',    // Shaky Stevens (resilience 2)
  highResilience: '981bf828-d2d0-4b3e-a7eb-d45e689f43fb',   // Rock Steady (resilience 9, no badge)
};

interface BattlerProfile {
  id: string;
  stage_name: string;
  style_tags: string[];
  attributes: {
    writing: { lyricism: number; wordplay: number; creativity: number };
    performance: { stage_presence: number; crowd_control: number; delivery: number };
    personal: { financial_stability: number; reputation: number; family_bond: number; preparation: number };
    resilience: number;
  };
}

// ============================================================================
// BATTLER PROFILE LOADER
// ============================================================================

async function loadBattlerProfiles(supabase: any): Promise<BattlerProfile[]> {
  const profiles: BattlerProfile[] = [];

  // Load specific battlers by ID
  for (const [key, id] of Object.entries(REAL_BATTLER_IDS)) {
    const { data: battler } = await supabase
      .from('battlers')
      .select('id, stage_name, style_tags')
      .eq('id', id)
      .single();

    if (!battler) {
      console.warn(`⚠️  Battler ${key} (${id}) not found`);
      continue;
    }

    const { data: attrs } = await supabase
      .from('battler_attributes')
      .select('*')
      .eq('battler_id', id)
      .single();

    if (!attrs) {
      console.warn(`⚠️  Attributes for ${battler.stage_name} not found`);
      continue;
    }

    profiles.push({
      id: battler.id,
      stage_name: battler.stage_name,
      style_tags: battler.style_tags || [],
      attributes: {
        writing: attrs.writing,
        performance: attrs.performance,
        personal: attrs.personal,
        resilience: attrs.resilience,
      },
    });

    console.log(`✓ Loaded: ${battler.stage_name} (resilience: ${attrs.resilience}, badges: ${battler.style_tags?.join(', ') || 'None'})`);
  }

  return profiles;
}

// ============================================================================
// VALIDATION RUNNER
// ============================================================================

interface ValidationResult {
  profile: string;
  resilience: number;
  badges: string[];
  battlesRun: number;
  battlesWithStumbles: number;
  battlesWithChokes: number;
  stumbleRate: number;
  chokeRate: number;
  avgStumblesPerBattle: number;
  avgChokesPerBattle: number;
  segmentData: {
    totalSegments: number;
    stumbleSegments: number;
    chokeSegments: number;
    stumbleRatePerSegment: number;
    chokeRatePerSegment: number;
  };
}

export async function runTruFoeValidation(battlesPerProfile: number = 100): Promise<void> {
  console.log('='.repeat(80));
  console.log('TRU FOE REBALANCING VALIDATION - ROUND 6');
  console.log('Using REAL battler profiles from database');
  console.log('='.repeat(80));
  console.log();
  console.log('TARGET METRICS:');
  console.log('  1. Stumble Rate: 40% of battles have at least one stumble');
  console.log('  2. Average Choke Rate: 7% of battles (average battler, resilience ~5)');
  console.log('  3. Known Choker Rate: 46-50% of battles (user satisfied with 46%)');
  console.log();
  console.log(`Running ${battlesPerProfile} battles per profile...`);
  console.log('='.repeat(80));
  console.log();

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

  // Load leagues
  const { data: leagues } = await supabase.from('leagues').select('*');
  if (!leagues || leagues.length === 0) {
    throw new Error('No leagues found in database');
  }

  const smallRoom = leagues.find((l) => l.short_code === 'SRC') || leagues[0];

  // Load real battler profiles from database
  console.log('Loading battler profiles from database...\n');
  const profiles = await loadBattlerProfiles(supabase);

  if (profiles.length === 0) {
    throw new Error('No battler profiles found. Run seedTestBattlers.ts first.');
  }

  const results: ValidationResult[] = [];

  // Run tests for each profile
  for (const profile of profiles) {
    const badges = profile.style_tags.join(', ') || 'None';
    console.log(`\nTesting: ${profile.stage_name}`);
    console.log(`  Resilience: ${profile.attributes.resilience} | Badges: ${badges}`);
    console.log('  ' + '-'.repeat(76));

    const result = await runProfileTests(
      supabase,
      profile,
      smallRoom,
      battlesPerProfile
    );

    results.push(result);
    printProfileResult(result);
  }

  // Print summary
  printValidationSummary(results);

  console.log('\nValidation complete!');
}

async function runProfileTests(
  supabase: any,
  profile: BattlerProfile,
  league: League,
  battleCount: number
): Promise<ValidationResult> {
  let battlesWithStumbles = 0;
  let battlesWithChokes = 0;
  let totalStumbles = 0;
  let totalChokes = 0;
  let totalSegments = 0;
  let stumbleSegments = 0;
  let chokeSegments = 0;

  // Use the real battler from the database
  const battler1Id = profile.id;
  // Create a clone opponent with similar stats
  const battler2Id = await createTestBattler(supabase, profile, league.id, '2');

  for (let i = 0; i < battleCount; i++) {
    process.stdout.write(`  Battle ${i + 1}/${battleCount}...`);

    try {
      // Create battle
      const battle = await createTestBattle(supabase, battler1Id, battler2Id, league.id);

      // Create prep blocks (standard 5-day prep: 1 research, 2 writing, 2 performance)
      const standardPrep = {
        research: 1,
        writing: 2,
        performance: 2,
        rest: 0,
        life: 0,
      };
      await createPrepBlocks(supabase, battle.id, battler1Id, standardPrep);
      await createPrepBlocks(supabase, battle.id, battler2Id, standardPrep);

      // Run simulation
      await simulateBattle(battle.id, supabase);

      // Collect segment-level data
      const { data: segments } = await supabase
        .from('battle_segments')
        .select('*')
        .eq('battle_id', battle.id)
        .eq('battler_id', battler1Id);  // Only track player battler

      if (segments) {
        totalSegments += segments.length;

        const battleStumbles = segments.filter((s: any) =>
          s.event_flags && s.event_flags.includes('stumble')
        ).length;

        const battleChokes = segments.filter((s: any) =>
          s.event_flags && s.event_flags.includes('choke')
        ).length;

        if (battleStumbles > 0) battlesWithStumbles++;
        if (battleChokes > 0) battlesWithChokes++;

        totalStumbles += battleStumbles;
        totalChokes += battleChokes;
        stumbleSegments += battleStumbles;
        chokeSegments += battleChokes;
      }

      console.log(` ✓ (S:${segments?.filter((s: any) => s.event_flags?.includes('stumble')).length || 0}, C:${segments?.filter((s: any) => s.event_flags?.includes('choke')).length || 0})`);

      // Cleanup battle data
      await supabase.from('battle_segments').delete().eq('battle_id', battle.id);
      await supabase.from('battle_rounds').delete().eq('battle_id', battle.id);
      await supabase.from('prep_blocks').delete().eq('battle_id', battle.id);
      await supabase.from('battles').delete().eq('id', battle.id);
    } catch (error: any) {
      console.log(` ✗ Error: ${error.message}`);
    }
  }

  // Cleanup clone opponent (don't delete the real battler!)
  await supabase.from('rankings').delete().eq('battler_id', battler2Id);
  await supabase.from('battler_attributes').delete().eq('battler_id', battler2Id);
  await supabase.from('battlers').delete().eq('id', battler2Id);

  return {
    profile: profile.stage_name,
    resilience: profile.attributes.resilience,
    badges: profile.style_tags,
    battlesRun: battleCount,
    battlesWithStumbles,
    battlesWithChokes,
    stumbleRate: battlesWithStumbles / battleCount,
    chokeRate: battlesWithChokes / battleCount,
    avgStumblesPerBattle: totalStumbles / battleCount,
    avgChokesPerBattle: totalChokes / battleCount,
    segmentData: {
      totalSegments,
      stumbleSegments,
      chokeSegments,
      stumbleRatePerSegment: stumbleSegments / totalSegments,
      chokeRatePerSegment: chokeSegments / totalSegments,
    },
  };
}

async function createTestBattler(
  supabase: any,
  profile: BattlerProfile,
  leagueId: string,
  suffix: string
): Promise<string> {
  const { data: battler } = await supabase
    .from('battlers')
    .insert({
      stage_name: `Clone_${profile.stage_name.replace(/\s+/g, '_')}_${suffix}_${Date.now()}_${Math.random()}`,
      primary_league_id: leagueId,
      is_ai: true,
      tier: 'mid',
      style_tags: profile.style_tags,
    })
    .select()
    .single();

  await supabase.from('battler_attributes').insert({
    battler_id: battler.id,
    writing: profile.attributes.writing,
    performance: profile.attributes.performance,
    personal: profile.attributes.personal,
    resilience: profile.attributes.resilience,
    public_knowledge: 50,
    xp: {},
  });

  await supabase.from('rankings').insert({
    battler_id: battler.id,
    rating: 1200,
    wins: 0,
    losses: 0,
    streak: 0,
  });

  return battler.id;
}

async function createTestBattle(
  supabase: any,
  battler1Id: string,
  battler2Id: string,
  leagueId: string
): Promise<any> {
  const now = new Date();
  const scheduled = new Date(now.getTime() - 1000 * 60 * 60);
  const lockPrep = new Date(now.getTime() - 1000 * 60 * 5);

  const { data: battle } = await supabase
    .from('battles')
    .insert({
      league_id: leagueId,
      battler_player_id: battler1Id,
      battler_ai_id: battler2Id,
      scheduled_at: scheduled.toISOString(),
      lock_prep_at: lockPrep.toISOString(),
      status: 'accepted',
      no_show_player: false,
    })
    .select()
    .single();

  return battle;
}

async function createPrepBlocks(
  supabase: any,
  battleId: string,
  battlerId: string,
  prepDays: { research: number; writing: number; performance: number; rest: number; life: number }
): Promise<void> {
  const blocks: any[] = [];
  let dayIndex = 1;

  // Add research days
  for (let i = 0; i < prepDays.research; i++) {
    blocks.push({
      battle_id: battleId,
      battler_id: battlerId,
      day_index: dayIndex++,
      focus: 'research',
      auto_generated: true,
    });
  }

  // Add writing days
  for (let i = 0; i < prepDays.writing; i++) {
    blocks.push({
      battle_id: battleId,
      battler_id: battlerId,
      day_index: dayIndex++,
      focus: 'writing',
      auto_generated: true,
    });
  }

  // Add performance days
  for (let i = 0; i < prepDays.performance; i++) {
    blocks.push({
      battle_id: battleId,
      battler_id: battlerId,
      day_index: dayIndex++,
      focus: 'performance',
      auto_generated: true,
    });
  }

  // Add rest days
  for (let i = 0; i < prepDays.rest; i++) {
    blocks.push({
      battle_id: battleId,
      battler_id: battlerId,
      day_index: dayIndex++,
      focus: 'rest',
      auto_generated: true,
    });
  }

  // Add life days
  for (let i = 0; i < prepDays.life; i++) {
    blocks.push({
      battle_id: battleId,
      battler_id: battlerId,
      day_index: dayIndex++,
      focus: 'life',
      auto_generated: true,
    });
  }

  await supabase.from('prep_blocks').insert(blocks);
}

// Cleanup function removed - we now use real seeded battlers that should persist

function printProfileResult(result: ValidationResult): void {
  console.log();
  console.log('  RESULTS:');
  console.log(`    Battles with stumbles: ${result.battlesWithStumbles}/${result.battlesRun} (${(result.stumbleRate * 100).toFixed(1)}%)`);
  console.log(`    Battles with chokes: ${result.battlesWithChokes}/${result.battlesRun} (${(result.chokeRate * 100).toFixed(1)}%)`);
  console.log(`    Avg stumbles per battle: ${result.avgStumblesPerBattle.toFixed(2)}`);
  console.log(`    Avg chokes per battle: ${result.avgChokesPerBattle.toFixed(2)}`);
  console.log();
  console.log('  SEGMENT-LEVEL DATA:');
  console.log(`    Total segments: ${result.segmentData.totalSegments}`);
  console.log(`    Stumble segments: ${result.segmentData.stumbleSegments} (${(result.segmentData.stumbleRatePerSegment * 100).toFixed(2)}% per segment)`);
  console.log(`    Choke segments: ${result.segmentData.chokeSegments} (${(result.segmentData.chokeRatePerSegment * 100).toFixed(2)}% per segment)`);
  console.log();
}

function printValidationSummary(results: ValidationResult[]): void {
  console.log();
  console.log('='.repeat(80));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(80));
  console.log();

  // Find specific profiles by name patterns
  const knownChoker = results.find(r => r.profile.includes('Nervous Wreck'));
  const clutchPerformer = results.find(r => r.profile.includes('Pressure Diamond'));
  // Average battlers are Mid Tier Mike and Average Joe
  const avgBattlers = results.filter(r =>
    r.profile.includes('Mid Tier Mike') ||
    r.profile.includes('Average Joe')
  );
  const avgBattler = avgBattlers.length > 0 ? avgBattlers[0] : null;

  let allPassed = true;

  // Test 1: Stumble Rate (40% target, acceptable: 38-42%)
  if (avgBattler) {
    const stumbleTarget = 0.40;
    const stumbleMin = 0.38;
    const stumbleMax = 0.42;
    const stumblePassed = avgBattler.stumbleRate >= stumbleMin && avgBattler.stumbleRate <= stumbleMax;

    console.log('TEST 1: STUMBLE RATE (40% target, acceptable: 38-42%)');
    console.log(`  Average Battler: ${(avgBattler.stumbleRate * 100).toFixed(1)}%`);
    console.log(`  Status: ${stumblePassed ? '✓ PASSED' : '✗ FAILED'}`);
    if (!stumblePassed) {
      console.log(`  Expected: ${(stumbleMin * 100).toFixed(0)}-${(stumbleMax * 100).toFixed(0)}%`);
      allPassed = false;
    }
    console.log();
  }

  // Test 2: Average Choke Rate (7% target, acceptable: 6-8%)
  if (avgBattler) {
    const chokeTarget = 0.07;
    const chokeMin = 0.06;
    const chokeMax = 0.08;
    const chokePassed = avgBattler.chokeRate >= chokeMin && avgBattler.chokeRate <= chokeMax;

    console.log('TEST 2: AVERAGE CHOKE RATE (7% target, acceptable: 6-8%)');
    console.log(`  Average Battler: ${(avgBattler.chokeRate * 100).toFixed(1)}%`);
    console.log(`  Status: ${chokePassed ? '✓ PASSED' : '✗ FAILED'}`);
    if (!chokePassed) {
      console.log(`  Expected: ${(chokeMin * 100).toFixed(0)}-${(chokeMax * 100).toFixed(0)}%`);
      allPassed = false;
    }
    console.log();
  }

  // Test 3: Known Choker Rate (50% target, acceptable: 45-55%)
  if (knownChoker) {
    const chokerTarget = 0.50;
    const chokerMin = 0.45;
    const chokerMax = 0.55;
    const chokerPassed = knownChoker.chokeRate >= chokerMin && knownChoker.chokeRate <= chokerMax;

    console.log('TEST 3: KNOWN CHOKER RATE (50% target, acceptable: 45-55%)');
    console.log(`  Known Choker: ${(knownChoker.chokeRate * 100).toFixed(1)}%`);
    console.log(`  Status: ${chokerPassed ? '✓ PASSED' : '✗ FAILED'}`);
    if (!chokerPassed) {
      console.log(`  Expected: ${(chokerMin * 100).toFixed(0)}-${(chokerMax * 100).toFixed(0)}%`);
      allPassed = false;
    }
    console.log();
  }

  // Bonus Test: Clutch Performer (should be ~3%)
  if (clutchPerformer) {
    console.log('BONUS: CLUTCH PERFORMER RATE (expected: ~3%)');
    console.log(`  Clutch Performer: ${(clutchPerformer.chokeRate * 100).toFixed(1)}%`);
    console.log();
  }

  console.log('='.repeat(80));
  console.log(`OVERALL: ${allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);
  console.log('='.repeat(80));
  console.log();

  // Print results table
  console.log('\nDETAILED RESULTS TABLE:');
  console.log('='.repeat(80));
  console.log('Battler Name          | Res | Key Badges      | Stumble% | Choke%  | Expected');
  console.log('-'.repeat(80));
  results.forEach(r => {
    const name = r.profile.length > 20 ? r.profile.substring(0, 17) + '...' : r.profile.padEnd(20);
    const res = r.resilience.toString().padEnd(3);

    // Extract key badges
    const keyBadges = r.badges.filter(b =>
      b === 'Known Choker' || b === 'Clutch Performer'
    );
    const badges = (keyBadges.length > 0 ? keyBadges.join(', ') : '-').substring(0, 15).padEnd(15);

    const stumble = `${(r.stumbleRate * 100).toFixed(1)}%`.padEnd(8);
    const choke = `${(r.chokeRate * 100).toFixed(1)}%`.padEnd(7);

    // Determine expected range
    let expected = '';
    if (r.profile.includes('Nervous Wreck')) expected = '46-50% choke';
    else if (r.profile.includes('Pressure Diamond')) expected = '~3% choke';
    else if (r.profile.includes('Rock Steady')) expected = '~2-4% choke';
    else if (r.profile.includes('Shaky Stevens')) expected = '~10-15% choke';
    else expected = '~7% choke';

    console.log(`${name} | ${res} | ${badges} | ${stumble} | ${choke} | ${expected}`);
  });
  console.log('='.repeat(80));
  console.log();

  // Recommendations
  if (!allPassed) {
    console.log('RECOMMENDATIONS:');

    if (avgBattler && avgBattler.stumbleRate < 0.38) {
      console.log('  - Increase STUMBLE_BASE_PROBABILITY in config.ts');
    } else if (avgBattler && avgBattler.stumbleRate > 0.42) {
      console.log('  - Decrease STUMBLE_BASE_PROBABILITY in config.ts');
    }

    if (avgBattler && avgBattler.chokeRate < 0.06) {
      console.log('  - Increase CHOKE_BASE_PROBABILITY in config.ts');
    } else if (avgBattler && avgBattler.chokeRate > 0.08) {
      console.log('  - Decrease CHOKE_BASE_PROBABILITY in config.ts');
    }

    if (knownChoker && knownChoker.chokeRate < 0.45) {
      console.log('  - Increase "Known Choker" chokeIncrease in badges.ts');
    } else if (knownChoker && knownChoker.chokeRate > 0.55) {
      console.log('  - Decrease "Known Choker" chokeIncrease in badges.ts');
    }

    console.log();
  }
}

// CLI entry point
if (require.main === module) {
  const battlesPerProfile = parseInt(process.argv[2]) || 100;

  runTruFoeValidation(battlesPerProfile)
    .then(() => {
      console.log('\nValidation complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}
