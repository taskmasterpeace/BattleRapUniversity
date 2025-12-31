/**
 * Create Legendary Battler Profiles
 *
 * Creates AI battlers based on real battle rap legends with altered names.
 * These serve as placeholder opponents and testing data.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface LegendaryBattler {
  battle_rap_name: string;
  real_name: string;
  bio: string;
  archetype: string;
  primary_league: string;
  rating: number;
  attributes: {
    lyricism: number;
    wordplay: number;
    creativity: number;
    flow: number;
    stage_presence: number;
    crowd_control: number;
    delivery: number;
    resilience: number;
    financial_stability: number;
    reputation: number;
    family_bond: number;
    preparation: number;
  };
  style_tags: string[];
}

const legendaryBattlers: LegendaryBattler[] = [
  {
    battle_rap_name: 'Ron Gritty',
    real_name: 'Ronald Gritten',
    bio: 'The Punchline Assassin. Known for relentless gun bars and technical wordplay that leaves opponents shattered.',
    archetype: 'Punchline King',
    primary_league: 'Main Stage Arena',
    rating: 1850,
    attributes: {
      lyricism: 9,
      wordplay: 10,
      creativity: 8,
      flow: 7,
      stage_presence: 6,
      crowd_control: 7,
      delivery: 9,
      resilience: 8,
      financial_stability: 7,
      reputation: 9,
      family_bond: 6,
      preparation: 8,
    },
    style_tags: ['Punchline King', 'Technical', 'Gun Bars', 'Wordplay Wizard'],
  },
  {
    battle_rap_name: 'Coded Flux',
    real_name: 'Lucas Freeman',
    bio: 'The Architect. A lyrical mastermind who constructs intricate schemes and metaphors that transcend the battle.',
    archetype: 'Lyrical Mastermind',
    primary_league: 'Small Room Circuit',
    rating: 1900,
    attributes: {
      lyricism: 10,
      wordplay: 10,
      creativity: 10,
      flow: 8,
      stage_presence: 9,
      crowd_control: 8,
      delivery: 9,
      resilience: 7,
      financial_stability: 8,
      reputation: 10,
      family_bond: 7,
      preparation: 9,
    },
    style_tags: ['Lyrical Mastermind', 'Wordplay Wizard', 'Scheme Artist', 'Technical'],
  },
  {
    battle_rap_name: 'Hallow The Dawn',
    real_name: 'Donald Holloway',
    bio: 'The Versatile Veteran. Adapts to any opponent with surgical precision, combining humor, aggression, and raw skill.',
    archetype: 'All-Rounder',
    primary_league: 'Main Stage Arena',
    rating: 1875,
    attributes: {
      lyricism: 8,
      wordplay: 9,
      creativity: 9,
      flow: 9,
      stage_presence: 10,
      crowd_control: 10,
      delivery: 9,
      resilience: 9,
      financial_stability: 7,
      reputation: 9,
      family_bond: 6,
      preparation: 7,
    },
    style_tags: ['All-Rounder', 'Charismatic', 'Crowd Favorite', 'Freestyle King'],
  },
  {
    battle_rap_name: 'Ray Rock',
    real_name: 'Raymond Rockwell',
    bio: 'The Energy Machine. Brings unmatched stage presence and aggressive delivery that overwhelms opponents.',
    archetype: 'Performance Powerhouse',
    primary_league: 'Main Stage Arena',
    rating: 1825,
    attributes: {
      lyricism: 7,
      wordplay: 7,
      creativity: 7,
      flow: 8,
      stage_presence: 10,
      crowd_control: 10,
      delivery: 10,
      resilience: 9,
      financial_stability: 8,
      reputation: 9,
      family_bond: 7,
      preparation: 6,
    },
    style_tags: ['Performance Powerhouse', 'Aggressive', 'Crowd Favorite', 'Energy King'],
  },
  {
    battle_rap_name: 'Beachie Knotty',
    real_name: 'Gabriel Beach',
    bio: 'The Street Philosopher. Combines authentic storytelling with calculated angles that cut deep.',
    archetype: 'Storyteller',
    primary_league: 'Small Room Circuit',
    rating: 1840,
    attributes: {
      lyricism: 8,
      wordplay: 7,
      creativity: 8,
      flow: 9,
      stage_presence: 9,
      crowd_control: 9,
      delivery: 9,
      resilience: 8,
      financial_stability: 7,
      reputation: 9,
      family_bond: 8,
      preparation: 7,
    },
    style_tags: ['Storyteller', 'Authentic', 'Angle Master', 'Street Certified'],
  },
  {
    battle_rap_name: 'Verb Alliance',
    real_name: 'Vernon Alton',
    bio: 'The Rebuttal Specialist. Known for devastating rebuttals and the ability to flip any angle back on opponents.',
    archetype: 'Rebuttal King',
    primary_league: 'Main Stage Arena',
    rating: 1810,
    attributes: {
      lyricism: 8,
      wordplay: 8,
      creativity: 9,
      flow: 8,
      stage_presence: 8,
      crowd_control: 9,
      delivery: 8,
      resilience: 10,
      financial_stability: 6,
      reputation: 8,
      family_bond: 7,
      preparation: 9,
    },
    style_tags: ['Rebuttal King', 'Freestyle King', 'Charismatic', 'Authentic'],
  },
];

async function createLegendaryBattlers() {
  console.log('🎤 Creating Legendary Battlers...\n');

  // Get league IDs
  const { data: leagues } = await supabase
    .from('leagues')
    .select('id, name')
    .in('name', ['Small Room Circuit', 'Main Stage Arena']);

  if (!leagues || leagues.length === 0) {
    console.error('❌ No leagues found');
    return;
  }

  const leagueMap = new Map(leagues.map(l => [l.name, l.id]));

  for (const battler of legendaryBattlers) {
    console.log(`\n📝 Creating: ${battler.battle_rap_name} (${battler.archetype})`);

    const leagueId = leagueMap.get(battler.primary_league);
    if (!leagueId) {
      console.error(`  ❌ League not found: ${battler.primary_league}`);
      continue;
    }

    // Insert battler
    const { data: newBattler, error: battlerError } = await supabase
      .from('battlers')
      .insert({
        battle_rap_name: battler.battle_rap_name,
        real_name: battler.real_name,
        bio: battler.bio,
        primary_league_id: leagueId,
        is_ai: true,
        rating: battler.rating,
      })
      .select()
      .single();

    if (battlerError) {
      console.error(`  ❌ Failed to create battler:`, battlerError.message);
      continue;
    }

    console.log(`  ✅ Battler created: ${newBattler.id}`);

    // Insert attributes
    const { error: attrError } = await supabase
      .from('battler_attributes')
      .insert({
        battler_id: newBattler.id,
        writing: {
          lyricism: battler.attributes.lyricism,
          wordplay: battler.attributes.wordplay,
          creativity: battler.attributes.creativity,
          flow: battler.attributes.flow,
        },
        performance: {
          stage_presence: battler.attributes.stage_presence,
          crowd_control: battler.attributes.crowd_control,
          delivery: battler.attributes.delivery,
        },
        personal: {
          resilience: battler.attributes.resilience,
          financial_stability: battler.attributes.financial_stability,
          reputation: battler.attributes.reputation,
          family_bond: battler.attributes.family_bond,
          preparation: battler.attributes.preparation,
        },
      });

    if (attrError) {
      console.error(`  ❌ Failed to create attributes:`, attrError.message);
      continue;
    }

    console.log(`  ✅ Attributes created`);

    // Insert badges
    for (const tag of battler.style_tags) {
      const { error: badgeError } = await supabase
        .from('battler_badges')
        .insert({
          battler_id: newBattler.id,
          badge_name: tag,
          badge_type: 'style',
        });

      if (badgeError) {
        console.error(`  ⚠️  Failed to add badge "${tag}":`, badgeError.message);
      }
    }

    console.log(`  ✅ Badges added: ${battler.style_tags.join(', ')}`);

    // Display summary
    console.log(`\n  📊 ${battler.battle_rap_name} Profile:`);
    console.log(`     Rating: ${battler.rating}`);
    console.log(`     League: ${battler.primary_league}`);
    console.log(`     Writing: Lyr ${battler.attributes.lyricism} | Word ${battler.attributes.wordplay} | Cre ${battler.attributes.creativity} | Flow ${battler.attributes.flow}`);
    console.log(`     Performance: Stage ${battler.attributes.stage_presence} | Crowd ${battler.attributes.crowd_control} | Del ${battler.attributes.delivery}`);
    console.log(`     Style: ${battler.style_tags.join(', ')}`);
  }

  console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║           LEGENDARY BATTLERS CREATED ✅                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log(`\n  Total: ${legendaryBattlers.length} battlers`);
  console.log(`  Average Rating: ${Math.round(legendaryBattlers.reduce((sum, b) => sum + b.rating, 0) / legendaryBattlers.length)}`);
  console.log(`\n  Use these battlers as AI opponents for testing and gameplay!\n`);
}

createLegendaryBattlers().catch(console.error);
