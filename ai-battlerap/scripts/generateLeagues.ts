/**
 * Generate new leagues with battle rap-themed names
 * Uses league sprites and city backgrounds
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface LeagueConfig {
  name: string;
  short_code: string;
  description: string;
  round_length_minutes: 2 | 3;
  writing_weight: number;
  performance_weight: number;
  base_crowd_factor: number;
  base_payout: number;
  prestige_level: number;
  logo_sprite: string;
  venues: string[];
  booking_pace_days: number;
  requires_deposit: boolean;
  deposit_percentage: number;
}

// Define league configurations
const LEAGUE_CONFIGS: LeagueConfig[] = [
  // Major Leagues (3-4)
  {
    name: "Champion's Circle Grand Prix",
    short_code: "CCGP",
    description: "Elite 3-minute rounds where champions are crowned. High-stakes performance battles with massive crowds.",
    round_length_minutes: 3,
    writing_weight: 0.35,
    performance_weight: 0.65,
    base_crowd_factor: 0.85,
    base_payout: 15000,
    prestige_level: 9,
    logo_sprite: "image_1764195526092",
    venues: [
      "/sprites/cities/west-coast/las-vegas-night.png",
      "/sprites/cities/east-coast/new-york-city-night.png",
      "/sprites/cities/south/atlanta-night.png",
      "/sprites/cities/midwest/chicago-night.png"
    ],
    booking_pace_days: 14,
    requires_deposit: true,
    deposit_percentage: 0.25
  },
  {
    name: "Royal Massacre",
    short_code: "RMSRC",
    description: "3-minute rounds of brutal battle rap. Performance-heavy with aggressive crowds demanding blood.",
    round_length_minutes: 3,
    writing_weight: 0.30,
    performance_weight: 0.70,
    base_crowd_factor: 0.80,
    base_payout: 12000,
    prestige_level: 8,
    logo_sprite: "image_1764195528394",
    venues: [
      "/sprites/cities/east-coast/new-york-city-dusk.png",
      "/sprites/cities/midwest/detroit-night.png",
      "/sprites/cities/south/houston-night.png",
      "/sprites/cities/west-coast/oakland-night.png"
    ],
    booking_pace_days: 14,
    requires_deposit: true,
    deposit_percentage: 0.30
  },
  {
    name: "Urban Warfare League",
    short_code: "UWL",
    description: "Street-style 3-minute battles. Raw, unfiltered performance with balanced writing and stage presence.",
    round_length_minutes: 3,
    writing_weight: 0.45,
    performance_weight: 0.55,
    base_crowd_factor: 0.75,
    base_payout: 10000,
    prestige_level: 8,
    logo_sprite: "image_1764195530615",
    venues: [
      "/sprites/cities/east-coast/baltimore-night.png",
      "/sprites/cities/midwest/chicago-dusk.png",
      "/sprites/cities/south/atlanta-dusk.png",
      "/sprites/cities/west-coast/los-angeles-night.png"
    ],
    booking_pace_days: 10,
    requires_deposit: true,
    deposit_percentage: 0.35
  },
  {
    name: "Apex Battle Arena",
    short_code: "APEX",
    description: "Premium 3-minute rounds showcasing the best battlers. High production value, elite competition.",
    round_length_minutes: 3,
    writing_weight: 0.40,
    performance_weight: 0.60,
    base_crowd_factor: 0.82,
    base_payout: 13000,
    prestige_level: 9,
    logo_sprite: "image_1764195532485",
    venues: [
      "/sprites/cities/west-coast/las-vegas-dusk.png",
      "/sprites/cities/east-coast/new-york-city-day.png",
      "/sprites/cities/south/dallas-dusk.png",
      "/sprites/cities/midwest/cleveland-dusk.png"
    ],
    booking_pace_days: 14,
    requires_deposit: true,
    deposit_percentage: 0.20
  },

  // Regional Leagues (4-5)
  {
    name: "East Coast Elites",
    short_code: "ECE",
    description: "Fast-paced 2-minute rounds showcasing technical lyricism. NYC, Baltimore, Boston - where bars matter most.",
    round_length_minutes: 2,
    writing_weight: 0.75,
    performance_weight: 0.25,
    base_crowd_factor: 0.50,
    base_payout: 5000,
    prestige_level: 6,
    logo_sprite: "image_1764195534646",
    venues: [
      "/sprites/cities/east-coast/new-york-city-night.png",
      "/sprites/cities/east-coast/baltimore-dusk.png",
      "/sprites/cities/east-coast/boston-dusk.png",
      "/sprites/cities/east-coast/new-jersey-night.png"
    ],
    booking_pace_days: 7,
    requires_deposit: true,
    deposit_percentage: 0.40
  },
  {
    name: "West Coast Warriors",
    short_code: "WCW",
    description: "3-minute rounds with West Coast flair. LA, Oakland, Vegas - performance and swagger reign supreme.",
    round_length_minutes: 3,
    writing_weight: 0.35,
    performance_weight: 0.65,
    base_crowd_factor: 0.72,
    base_payout: 7000,
    prestige_level: 7,
    logo_sprite: "image_1764195537197",
    venues: [
      "/sprites/cities/west-coast/los-angeles-dusk.png",
      "/sprites/cities/west-coast/oakland-dusk.png",
      "/sprites/cities/west-coast/las-vegas-day.png",
      "/sprites/cities/west-coast/las-vegas-alt-day.png"
    ],
    booking_pace_days: 10,
    requires_deposit: true,
    deposit_percentage: 0.35
  },
  {
    name: "Midwest Massacre",
    short_code: "MWM",
    description: "Gritty 3-minute battles from the heartland. Chicago, Detroit, Cleveland - blue collar bars and hard-hitting delivery.",
    round_length_minutes: 3,
    writing_weight: 0.50,
    performance_weight: 0.50,
    base_crowd_factor: 0.68,
    base_payout: 6000,
    prestige_level: 6,
    logo_sprite: "image_1764195933542",
    venues: [
      "/sprites/cities/midwest/chicago-night.png",
      "/sprites/cities/midwest/detroit-dusk.png",
      "/sprites/cities/midwest/cleveland-dusk.png",
      "/sprites/cities/midwest/kansas-city-night.png"
    ],
    booking_pace_days: 8,
    requires_deposit: true,
    deposit_percentage: 0.40
  },
  {
    name: "Southern Showdown",
    short_code: "SSHD",
    description: "3-minute Southern-style battles. Atlanta, Houston, Dallas - where storytelling meets aggressive delivery.",
    round_length_minutes: 3,
    writing_weight: 0.40,
    performance_weight: 0.60,
    base_crowd_factor: 0.70,
    base_payout: 6500,
    prestige_level: 7,
    logo_sprite: "image_1764195938152",
    venues: [
      "/sprites/cities/south/atlanta-night.png",
      "/sprites/cities/south/houston-dusk.png",
      "/sprites/cities/south/dallas-dusk.png",
      "/sprites/cities/south/charlotte-night.png"
    ],
    booking_pace_days: 9,
    requires_deposit: true,
    deposit_percentage: 0.35
  },
  {
    name: "International Circuit",
    short_code: "INTL",
    description: "Global 3-minute battles featuring diverse styles. Toronto to UK - where different cultures clash.",
    round_length_minutes: 3,
    writing_weight: 0.45,
    performance_weight: 0.55,
    base_crowd_factor: 0.65,
    base_payout: 8000,
    prestige_level: 7,
    logo_sprite: "image_1764195992423",
    venues: [
      "/sprites/cities/canada/toronto-night.png",
      "/sprites/cities/canada/montreal-night.png",
      "/sprites/cities/east-coast/new-york-city-night.png",
      "/sprites/cities/west-coast/los-angeles-night.png"
    ],
    booking_pace_days: 12,
    requires_deposit: true,
    deposit_percentage: 0.30
  },

  // Specialty Leagues (3-4)
  {
    name: "Freestyle Frenzy",
    short_code: "FSTYL",
    description: "2-minute improvised rounds. No prep allowed - pure off-the-dome battling. Resilience and quick thinking.",
    round_length_minutes: 2,
    writing_weight: 0.30,
    performance_weight: 0.70,
    base_crowd_factor: 0.75,
    base_payout: 4000,
    prestige_level: 6,
    logo_sprite: "image_1764196065055",
    venues: [
      "/sprites/cities/east-coast/new-york-city-day.png",
      "/sprites/cities/west-coast/oakland-day.png",
      "/sprites/cities/midwest/chicago-day.png",
      "/sprites/cities/south/atlanta-day.png"
    ],
    booking_pace_days: 5,
    requires_deposit: false,
    deposit_percentage: 0.00
  },
  {
    name: "Punchline Paradise",
    short_code: "PNCH",
    description: "2-minute rounds focused on pure bars. No filler, all killer. Lyricism and wordplay at their finest.",
    round_length_minutes: 2,
    writing_weight: 0.80,
    performance_weight: 0.20,
    base_crowd_factor: 0.45,
    base_payout: 4500,
    prestige_level: 7,
    logo_sprite: "image_1764196070252",
    venues: [
      "/sprites/cities/east-coast/new-york-city-dusk.png",
      "/sprites/cities/east-coast/baltimore-night.png",
      "/sprites/cities/midwest/detroit-day.png",
      "/sprites/cities/west-coast/los-angeles-dusk.png"
    ],
    booking_pace_days: 7,
    requires_deposit: true,
    deposit_percentage: 0.45
  },
  {
    name: "Storyteller's Summit",
    short_code: "STRY",
    description: "3-minute narrative-driven battles. Creativity and storytelling over punchlines. Artistic expression.",
    round_length_minutes: 3,
    writing_weight: 0.65,
    performance_weight: 0.35,
    base_crowd_factor: 0.55,
    base_payout: 5500,
    prestige_level: 6,
    logo_sprite: "image_1764196073117",
    venues: [
      "/sprites/cities/west-coast/las-vegas-alt-dusk.png",
      "/sprites/cities/east-coast/boston-dusk.png",
      "/sprites/cities/south/charlotte-dusk.png",
      "/sprites/cities/midwest/kansas-city-dusk.png"
    ],
    booking_pace_days: 10,
    requires_deposit: true,
    deposit_percentage: 0.40
  },
  {
    name: "Lyrical Warfare",
    short_code: "LYWAR",
    description: "3-minute technical battles. Complex rhyme schemes, multi-syllabic mastery, elite writing.",
    round_length_minutes: 3,
    writing_weight: 0.70,
    performance_weight: 0.30,
    base_crowd_factor: 0.50,
    base_payout: 6000,
    prestige_level: 8,
    logo_sprite: "image_1764196076327",
    venues: [
      "/sprites/cities/east-coast/new-jersey-dusk.png",
      "/sprites/cities/midwest/chicago-dusk.png",
      "/sprites/cities/west-coast/oakland-dusk.png",
      "/sprites/cities/south/houston-dusk.png"
    ],
    booking_pace_days: 10,
    requires_deposit: true,
    deposit_percentage: 0.40
  }
];

async function main() {
  console.log('=== LEAGUE GENERATION SCRIPT ===\n');

  // Check Supabase connection
  console.log('Checking database connection...');
  const { data: existingLeagues, error: queryError } = await supabase
    .from('leagues')
    .select('id, name, short_code')
    .order('name');

  if (queryError) {
    console.error('Error connecting to database:', queryError);
    process.exit(1);
  }

  console.log(`✓ Connected to database`);
  console.log(`✓ Found ${existingLeagues.length} existing leagues:`);
  existingLeagues.forEach(league => {
    console.log(`  - ${league.name} (${league.short_code})`);
  });
  console.log();

  // Check for sprite files
  const spritesDir = path.join(__dirname, '..', 'public', 'sprites', 'leagues');
  if (!fs.existsSync(spritesDir)) {
    console.error(`Error: Sprites directory not found at ${spritesDir}`);
    process.exit(1);
  }

  const availableSprites = fs.readdirSync(spritesDir);
  console.log(`✓ Found ${availableSprites.length} league sprite files\n`);

  // Prepare insert data
  console.log(`Preparing to insert ${LEAGUE_CONFIGS.length} new leagues...\n`);

  const insertData = LEAGUE_CONFIGS.map(config => ({
    name: config.name,
    short_code: config.short_code,
    description: config.description,
    round_length_minutes: config.round_length_minutes,
    writing_weight: config.writing_weight,
    performance_weight: config.performance_weight,
    base_crowd_factor: config.base_crowd_factor,
    base_payout: config.base_payout,
    prestige_level: config.prestige_level,
    logo_url: `/sprites/leagues/${config.logo_sprite}`,
    booking_pace_days: config.booking_pace_days,
    requires_deposit: config.requires_deposit,
    deposit_percentage: config.deposit_percentage,
    // Default values for other fields
    audience_favor_lyricism: 50,
    audience_favor_delivery: 50,
    audience_favor_storytelling: 50,
    audience_favor_crowd_engagement: 50,
    tolerance_unreliable: 2,
    blacklist_threshold: 3,
    crowd_demographics: {
      black: 0.60,
      mixed: 0.25,
      white: 0.15
    }
  }));

  // Insert leagues
  console.log('Inserting leagues into database...\n');
  const { data: insertedLeagues, error: insertError } = await supabase
    .from('leagues')
    .insert(insertData)
    .select('id, name, short_code, logo_url, round_length_minutes, writing_weight, performance_weight, base_crowd_factor, base_payout, prestige_level');

  if (insertError) {
    console.error('Error inserting leagues:', insertError);
    process.exit(1);
  }

  console.log(`✓ Successfully created ${insertedLeagues.length} new leagues!\n`);

  // Display results
  console.log('=== CREATED LEAGUES ===\n');

  // Group by category
  const majorLeagues = insertedLeagues.slice(0, 4);
  const regionalLeagues = insertedLeagues.slice(4, 9);
  const specialtyLeagues = insertedLeagues.slice(9);

  console.log('MAJOR LEAGUES:');
  majorLeagues.forEach((league, idx) => {
    const config = LEAGUE_CONFIGS[idx];
    console.log(`\n  ${league.name} (${league.short_code})`);
    console.log(`    Logo: ${league.logo_url}`);
    console.log(`    Rounds: ${league.round_length_minutes} minutes`);
    console.log(`    Balance: ${(league.writing_weight * 100).toFixed(0)}% writing / ${(league.performance_weight * 100).toFixed(0)}% performance`);
    console.log(`    Crowd Factor: ${league.base_crowd_factor}`);
    console.log(`    Payout: $${league.base_payout.toLocaleString()}`);
    console.log(`    Prestige: ${league.prestige_level}/10`);
    console.log(`    Venues: ${config.venues.length} locations`);
  });

  console.log('\n\nREGIONAL LEAGUES:');
  regionalLeagues.forEach((league, idx) => {
    const config = LEAGUE_CONFIGS[idx + 4];
    console.log(`\n  ${league.name} (${league.short_code})`);
    console.log(`    Logo: ${league.logo_url}`);
    console.log(`    Rounds: ${league.round_length_minutes} minutes`);
    console.log(`    Balance: ${(league.writing_weight * 100).toFixed(0)}% writing / ${(league.performance_weight * 100).toFixed(0)}% performance`);
    console.log(`    Crowd Factor: ${league.base_crowd_factor}`);
    console.log(`    Payout: $${league.base_payout.toLocaleString()}`);
    console.log(`    Prestige: ${league.prestige_level}/10`);
    console.log(`    Venues: ${config.venues.length} locations`);
  });

  console.log('\n\nSPECIALTY LEAGUES:');
  specialtyLeagues.forEach((league, idx) => {
    const config = LEAGUE_CONFIGS[idx + 9];
    console.log(`\n  ${league.name} (${league.short_code})`);
    console.log(`    Logo: ${league.logo_url}`);
    console.log(`    Rounds: ${league.round_length_minutes} minutes`);
    console.log(`    Balance: ${(league.writing_weight * 100).toFixed(0)}% writing / ${(league.performance_weight * 100).toFixed(0)}% performance`);
    console.log(`    Crowd Factor: ${league.base_crowd_factor}`);
    console.log(`    Payout: $${league.base_payout.toLocaleString()}`);
    console.log(`    Prestige: ${league.prestige_level}/10`);
    console.log(`    Venues: ${config.venues.length} locations`);
  });

  console.log('\n\n=== SUMMARY ===');
  console.log(`Total leagues created: ${insertedLeagues.length}`);
  console.log(`  Major leagues: ${majorLeagues.length}`);
  console.log(`  Regional leagues: ${regionalLeagues.length}`);
  console.log(`  Specialty leagues: ${specialtyLeagues.length}`);
  console.log('\n✓ League generation complete!\n');
}

// Run the script
main().catch(console.error);
