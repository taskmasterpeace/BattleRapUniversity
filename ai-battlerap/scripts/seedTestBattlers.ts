/**
 * Seed specific test battlers for choke/stumble validation
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

interface SeedBattler {
  stage_name: string;
  tier: string;
  style_tags: string[];
  attributes: {
    writing: { lyricism: number; wordplay: number; creativity: number };
    performance: { stage_presence: number; crowd_control: number; delivery: number };
    personal: { financial_stability: number; reputation: number; family_bond: number; preparation: number };
    resilience: number;
  };
}

const SEED_BATTLERS: SeedBattler[] = [
  {
    stage_name: 'Nervous Wreck',
    tier: 'mid',
    style_tags: ['Known Choker'],
    attributes: {
      writing: { lyricism: 6, wordplay: 6, creativity: 6 },
      performance: { stage_presence: 6, crowd_control: 5, delivery: 6 },
      personal: { financial_stability: 4, reputation: 4, family_bond: 5, preparation: 5 },
      resilience: 3,  // Low resilience + Known Choker badge
    },
  },
  {
    stage_name: 'Pressure Diamond',
    tier: 'top',
    style_tags: ['Clutch Performer'],
    attributes: {
      writing: { lyricism: 7, wordplay: 7, creativity: 7 },
      performance: { stage_presence: 8, crowd_control: 8, delivery: 8 },
      personal: { financial_stability: 7, reputation: 7, family_bond: 7, preparation: 6 },
      resilience: 9,  // Very high resilience + Clutch Performer badge
    },
  },
  {
    stage_name: 'Mid Tier Mike',
    tier: 'mid',
    style_tags: ['wordplay'],
    attributes: {
      writing: { lyricism: 5, wordplay: 5, creativity: 5 },
      performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
      personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
      resilience: 5,  // Average everything
    },
  },
  {
    stage_name: 'Shaky Stevens',
    tier: 'low',
    style_tags: ['angles'],
    attributes: {
      writing: { lyricism: 4, wordplay: 4, creativity: 5 },
      performance: { stage_presence: 4, crowd_control: 4, delivery: 4 },
      personal: { financial_stability: 3, reputation: 3, family_bond: 4, preparation: 4 },
      resilience: 2,  // Very low resilience, no badge
    },
  },
  {
    stage_name: 'Rock Steady',
    tier: 'top',
    style_tags: ['aggressive', 'gun_bars'],
    attributes: {
      writing: { lyricism: 7, wordplay: 7, creativity: 6 },
      performance: { stage_presence: 8, crowd_control: 7, delivery: 8 },
      personal: { financial_stability: 7, reputation: 7, family_bond: 6, preparation: 6 },
      resilience: 9,  // Very high resilience, no badge
    },
  },
  {
    stage_name: 'Average Joe',
    tier: 'mid',
    style_tags: ['comedy'],
    attributes: {
      writing: { lyricism: 5, wordplay: 5, creativity: 6 },
      performance: { stage_presence: 5, crowd_control: 6, delivery: 5 },
      personal: { financial_stability: 5, reputation: 5, family_bond: 5, preparation: 5 },
      resilience: 4,  // Slightly below average resilience
    },
  },
];

async function seedTestBattlers() {
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

  console.log('Seeding test battlers for validation...\n');

  // Get Small Room Circuit league
  const { data: leagues } = await supabase.from('leagues').select('*');
  const smallRoom = leagues?.find((l) => l.short_code === 'SRC') || leagues?.[0];

  if (!smallRoom) {
    console.error('No league found!');
    return;
  }

  const createdBattlers = [];

  for (const seed of SEED_BATTLERS) {
    console.log(`Creating: ${seed.stage_name}...`);

    // Check if battler already exists
    const { data: existing } = await supabase
      .from('battlers')
      .select('id')
      .eq('stage_name', seed.stage_name)
      .maybeSingle();

    if (existing) {
      console.log(`  ⚠️  Already exists, skipping`);
      createdBattlers.push(existing.id);
      continue;
    }

    // Create battler
    const { data: battler, error: battlerError } = await supabase
      .from('battlers')
      .insert({
        stage_name: seed.stage_name,
        primary_league_id: smallRoom.id,
        is_ai: true,
        tier: seed.tier,
        style_tags: seed.style_tags,
      })
      .select()
      .single();

    if (battlerError || !battler) {
      console.error(`  ✗ Error creating battler:`, battlerError);
      continue;
    }

    // Create attributes
    const { error: attrsError } = await supabase
      .from('battler_attributes')
      .insert({
        battler_id: battler.id,
        writing: seed.attributes.writing,
        performance: seed.attributes.performance,
        personal: seed.attributes.personal,
        resilience: seed.attributes.resilience,
        public_knowledge: 50,
        xp: {},
      });

    if (attrsError) {
      console.error(`  ✗ Error creating attributes:`, attrsError);
      continue;
    }

    // Create ranking
    const { error: rankError } = await supabase
      .from('rankings')
      .insert({
        battler_id: battler.id,
        rating: 1200,
        wins: 0,
        losses: 0,
        streak: 0,
      });

    if (rankError) {
      console.error(`  ✗ Error creating ranking:`, rankError);
      continue;
    }

    console.log(`  ✓ Created (ID: ${battler.id})`);
    console.log(`    Resilience: ${seed.attributes.resilience}`);
    console.log(`    Badges: ${seed.style_tags.join(', ')}`);
    createdBattlers.push(battler.id);
  }

  console.log(`\n✓ Created ${createdBattlers.length} test battlers`);
  console.log('\nBattler IDs:');
  console.log(JSON.stringify(createdBattlers, null, 2));
}

seedTestBattlers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
