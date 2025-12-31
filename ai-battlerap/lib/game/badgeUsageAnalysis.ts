/**
 * Badge Usage Analysis
 *
 * This script analyzes which badges from badges.ts are actually being used in the game.
 * It categorizes badges as:
 * - USED: Actively used in database, code, or tests
 * - UNUSED: Defined but never referenced
 * - PARTIALLY IMPLEMENTED: Defined but mechanical effects not fully utilized
 */

import { BADGE_REGISTRY } from './badges';

// All badges defined in BADGE_REGISTRY
const ALL_DEFINED_BADGES = Object.keys(BADGE_REGISTRY);

// ============================================================================
// MANUALLY IDENTIFIED USAGE (from code inspection)
// ============================================================================

// Badges referenced in database seed files
const SEED_DATA_BADGES = [
  'Technical Writer',
  'Freestyle Genius',
  'Angle Master',
  'Punchline King/Queen',
  'Stage Domination',
  'Crowd Favorite',
  'Comedy',
  'Aggressive',
  'Scheme Specialist',
  'Wordplay Wizard',
  'Smooth Flow',
  'Charismatic',
  'Known Choker',
  'Clutch Performer',
  'Choker',
  'Respected Veteran',
  'Consummate Professional',
  'Battle Technician',
  'Enhanced Storyteller',
  'Storytelling',
  'Multisyllabic Master',
  'Pen Game Elite',
  'Creativity Beast',
  'Rebuttal King/Queen',
  'Consistent Writer',
  'Big Stage Performer',
  'Theatrical',
  'Unorthodox',
  'Speed Rapping',
];

// Badges used in test files
const TEST_FILE_BADGES = [
  'Known Choker',
  'Clutch Performer',
  'Freestyle Genius',
  'Technical Writer',
  'Scheme Specialist',
  'Stage Domination',
  'Crowd Favorite',
  'Comedy',
  'Punchline King/Queen',
  'Inconsistent Performer',
  'Consummate Professional',
  'Battle Technician',
  'Charismatic',
  'Financial Struggles',
  'Substance Issues',
  'Angle Master',
];

// Badges mentioned in onboarding/character creation
const ONBOARDING_BADGES: string[] = [
  // NOTE: Onboarding uses simplified tags like 'comedy', 'freestyle', 'wordplay'
  // These map to actual badges but use different naming
  // The actual style_tags in onboarding are:
  // 'angles', 'comedy', 'storytelling', 'gun_bars', 'wordplay', 'freestyle'
];

// Badges with special mechanical effects in simulation.ts
const SIMULATION_MECHANIC_BADGES = [
  'Known Choker',         // chokeIncrease
  'Clutch Performer',     // chokeReduction
  'Freestyle Genius',     // lowPrepBonus, stumbleReduction, rebuttalBonus
  'Respected Veteran',    // chokeReduction
  'Choker',              // chokeIncrease
  'Substance Issues',     // stumbleIncrease
  'Financial Struggles',  // (affects choke via personal.financial_stability)
  'Resilient Battler',    // chokeReduction
  // All badges with prep efficiency modifiers
  'Technical Writer',
  'Angle Master',
  'Scheme Specialist',
  'Comedy',
  'Comedian',
  'Theatrical',
  'Stage Domination',
  // All badges with attribute multipliers
  'Wordplay Wizard',
  'Punchline King/Queen',
  'Metaphor Master',
  'Creativity Beast',
  'Crowd Favorite',
  'Charismatic',
  'Smooth Flow',
  'Aggressive',
  'Enhanced Storyteller',
  'Storytelling',
  'Pen Game Elite',
  'Multisyllabic Master',
];

// Badges defined in badge synergies/conflicts
const SYNERGY_CONFLICT_BADGES = Object.keys(BADGE_REGISTRY).filter(badge => {
  const { BADGE_SYNERGIES, BADGE_CONFLICTS } = require('./badges');
  return BADGE_SYNERGIES[badge] || BADGE_CONFLICTS[badge];
});

// ============================================================================
// ANALYSIS
// ============================================================================

interface BadgeUsageInfo {
  badge: string;
  inSeedData: boolean;
  inTests: boolean;
  inOnboarding: boolean;
  hasSimulationMechanics: boolean;
  hasSynergiesOrConflicts: boolean;
  isUsed: boolean;
  usageLocations: string[];
}

function analyzeBadgeUsage(): BadgeUsageInfo[] {
  return ALL_DEFINED_BADGES.map(badge => {
    const inSeedData = SEED_DATA_BADGES.includes(badge);
    const inTests = TEST_FILE_BADGES.includes(badge);
    const inOnboarding = ONBOARDING_BADGES.includes(badge);
    const hasSimulationMechanics = SIMULATION_MECHANIC_BADGES.includes(badge);
    const hasSynergiesOrConflicts = SYNERGY_CONFLICT_BADGES.includes(badge);

    const usageLocations: string[] = [];
    if (inSeedData) usageLocations.push('Database Seed');
    if (inTests) usageLocations.push('Test Files');
    if (inOnboarding) usageLocations.push('Onboarding');
    if (hasSimulationMechanics) usageLocations.push('Simulation Mechanics');
    if (hasSynergiesOrConflicts) usageLocations.push('Synergies/Conflicts');

    const isUsed = usageLocations.length > 0;

    return {
      badge,
      inSeedData,
      inTests,
      inOnboarding,
      hasSimulationMechanics,
      hasSynergiesOrConflicts,
      isUsed,
      usageLocations,
    };
  });
}

function printBadgeUsageReport(): void {
  console.log('='.repeat(80));
  console.log('BADGE USAGE ANALYSIS REPORT');
  console.log('='.repeat(80));
  console.log();

  const analysis = analyzeBadgeUsage();
  const used = analysis.filter(b => b.isUsed);
  const unused = analysis.filter(b => !b.isUsed);

  console.log(`Total Badges Defined: ${ALL_DEFINED_BADGES.length}`);
  console.log(`Used Badges: ${used.length} (${((used.length / ALL_DEFINED_BADGES.length) * 100).toFixed(1)}%)`);
  console.log(`Unused Badges: ${unused.length} (${((unused.length / ALL_DEFINED_BADGES.length) * 100).toFixed(1)}%)`);
  console.log();

  // Usage breakdown
  console.log('USAGE BREAKDOWN:');
  console.log('-'.repeat(80));
  console.log(`In Database Seed: ${analysis.filter(b => b.inSeedData).length}`);
  console.log(`In Test Files: ${analysis.filter(b => b.inTests).length}`);
  console.log(`In Onboarding: ${analysis.filter(b => b.inOnboarding).length}`);
  console.log(`Has Simulation Mechanics: ${analysis.filter(b => b.hasSimulationMechanics).length}`);
  console.log(`Has Synergies/Conflicts: ${analysis.filter(b => b.hasSynergiesOrConflicts).length}`);
  console.log('-'.repeat(80));
  console.log();

  // Category analysis
  console.log('CATEGORY ANALYSIS:');
  console.log('-'.repeat(80));

  const categories = {
    'Writing (Positive)': [
      'Punchline King/Queen', 'Scheme Specialist', 'Metaphor Master', 'Wordplay Wizard',
      'Freestyle Genius', 'Creativity Beast', 'Consistent Writer', 'Technical Writer',
      'Angle Master', 'Rebuttal King/Queen', 'Multisyllabic Master', 'Pen Game Elite'
    ],
    'Writing (Negative)': [
      'Recycler', 'Biter', 'Reach God/Goddess', 'One-Trick Pony', 'Filler Abuser',
      'Outdated Referencer', 'Lazy Writer', 'Predictable Rhymer', 'Weak Punchline Setups',
      'Shallow Research', 'Redundant', 'Overcomplicated', 'Cliche Abuser', 'Name Flip Dependent'
    ],
    'Performance (Positive)': [
      'Crowd Favorite', 'Stage Domination', 'Smooth Flow', 'Aggressive', 'Charismatic',
      'Theatrical', 'Speed Rapping', 'Unorthodox'
    ],
    'Performance (Negative)': [
      'Choker', 'Mumbler', 'Monotone Deliverer', 'Poor Breath Control', 'Energy Drainer',
      'Inconsistent Performer', 'Crowd Killer', 'Awkward Stage Presence', 'Off-Beat Performer',
      'Overprepared', 'Underprepared', 'Stiff Body Language'
    ],
    'Reputation (Positive)': [
      'Respected Veteran', 'Consummate Professional', 'Resilient Battler', 'Big Stage Performer',
      'Clutch Performer', 'Battle Technician', 'Consistent Grinder', 'Believable Persona',
      'Battle of the Night Winner'
    ],
    'Reputation (Negative)': [
      'Known Choker', 'Sore Loser', 'Drama Starter', 'Controversial', 'Unreliable',
      'Fallen Star', 'Career Plateaued', 'Disrespectful', 'Known Stealer', 'Health Issues',
      'Jail Risk', 'Substance Issues', 'Financial Struggles', 'Bitter Veteran',
      'Backstabber', 'Washed', 'Weak Chin', 'Culture Vulture', 'Living in Glory Days'
    ],
    'Content Style': [
      'Comedy', 'Comedian', 'Braggadocious', 'Gritty', 'Political Commentary', 'Shock Value',
      'Enhanced Storyteller', 'Storytelling', 'Personal Attacks', 'Pop Culture References',
      'Impersonations'
    ],
    'Multi-tasking': [
      'Multitasker', 'Workaholic', 'Focused Specialist', 'Time Management Expert', 'Burnout Risk'
    ],
    'Tournament': [
      'Tournament Veteran', 'Tournament Choker', 'Big Stage Specialist', 'Cinderella Story',
      'Tournament Grinder', 'Glass Cannon (Tournament)'
    ],
    'Tru Foe Additions': [
      'Stiff Body Language', 'Consistent Grinder', 'Believable Persona', 'Battle of the Night Winner'
    ],
  };

  for (const [category, badges] of Object.entries(categories)) {
    const categoryUsed = badges.filter(b => used.some(u => u.badge === b)).length;
    const categoryTotal = badges.length;
    const percentage = ((categoryUsed / categoryTotal) * 100).toFixed(1);
    console.log(`${category.padEnd(30)} | ${categoryUsed}/${categoryTotal} (${percentage}%)`);
  }
  console.log('-'.repeat(80));
  console.log();

  // Unused badges list
  console.log('UNUSED BADGES:');
  console.log('='.repeat(80));
  if (unused.length === 0) {
    console.log('All badges are being used! ');
  } else {
    unused.forEach((badge, idx) => {
      console.log(`${idx + 1}. ${badge.badge}`);
    });
  }
  console.log('='.repeat(80));
  console.log();

  // Used badges with usage locations
  console.log('USED BADGES (with locations):');
  console.log('='.repeat(80));
  used.forEach((badge, idx) => {
    console.log(`${idx + 1}. ${badge.badge}`);
    console.log(`   Locations: ${badge.usageLocations.join(', ')}`);
  });
  console.log('='.repeat(80));
  console.log();

  // Recommendations
  console.log('RECOMMENDATIONS:');
  console.log('='.repeat(80));

  // Find badges with definitions but no simulation mechanics
  const definedButNoMechanics = used.filter(b => !b.hasSimulationMechanics && (b.inSeedData || b.inTests));
  if (definedButNoMechanics.length > 0) {
    console.log('\nBadges used in DB/tests but lacking simulation mechanics:');
    definedButNoMechanics.forEach(b => {
      console.log(`  - ${b.badge} (${b.usageLocations.join(', ')})`);
    });
    console.log('  ACTION: Verify these badges have proper mechanical effects in BADGE_REGISTRY');
  }

  // Find badges that should be added to seed data
  const mechanicsButNotSeeded = used.filter(b => b.hasSimulationMechanics && !b.inSeedData && !b.inTests);
  if (mechanicsButNotSeeded.length > 0) {
    console.log('\nBadges with mechanics but not used in seed data or tests:');
    mechanicsButNotSeeded.forEach(b => {
      console.log(`  - ${b.badge}`);
    });
    console.log('  ACTION: Consider adding these to seed data for testing');
  }

  // Suggest removal candidates
  if (unused.length > 0) {
    console.log('\nUnused badges (consider for removal or implementation):');
    console.log(`  Total: ${unused.length} badges`);
    console.log('  ACTION: Either implement these badges or remove them to reduce complexity');
  }

  console.log('='.repeat(80));
  console.log();

  // Export for further analysis
  console.log('DETAILED DATA (JSON):');
  console.log('='.repeat(80));
  console.log(JSON.stringify({
    summary: {
      totalBadges: ALL_DEFINED_BADGES.length,
      usedBadges: used.length,
      unusedBadges: unused.length,
      usagePercentage: ((used.length / ALL_DEFINED_BADGES.length) * 100).toFixed(1) + '%',
    },
    used: used.map(b => ({ badge: b.badge, locations: b.usageLocations })),
    unused: unused.map(b => b.badge),
  }, null, 2));
  console.log('='.repeat(80));
}

// Run if called directly
if (require.main === module) {
  printBadgeUsageReport();
  process.exit(0);
}

export { analyzeBadgeUsage, printBadgeUsageReport };
