/**
 * Extensive Battle Simulation Test Runner v2
 * Varies: Prep, Badges, Delivery Styles, Content Types, Crowd Demographics
 */

import {
  simulateMockRoundFull,
  PrepLevels,
  RoundSelections,
  ContentType,
  DeliveryType,
  PerformanceType,
  CONTENT_TYPES,
  DELIVERY_TYPES,
  PERFORMANCE_TYPES
} from '../round-crafting'

// ============================================
// CROWD DEMOGRAPHICS SYSTEM
// ============================================

interface CrowdDemographics {
  purists: number      // Appreciate bars, wordplay, schemes
  street_fans: number  // Gun bars, street talk, aggression
  comedy_fans: number  // Comedy, pop culture, name flips
  aggression_fans: number // Aggressive delivery, gun bars
  performance_fans: number // Stage presence, theatrics
}

const CROWD_PRESETS: Record<string, CrowdDemographics> = {
  small_room: { purists: 45, street_fans: 25, comedy_fans: 15, aggression_fans: 10, performance_fans: 5 },
  main_stage: { purists: 10, street_fans: 20, comedy_fans: 15, aggression_fans: 25, performance_fans: 30 },
  url_style: { purists: 15, street_fans: 35, comedy_fans: 10, aggression_fans: 30, performance_fans: 10 },
  kotd_style: { purists: 40, street_fans: 15, comedy_fans: 20, aggression_fans: 10, performance_fans: 15 },
}

// Content type to crowd segment mapping
const CONTENT_CROWD_AFFINITY: Record<ContentType, Partial<Record<keyof CrowdDemographics, number>>> = {
  personals: { street_fans: 1.1, aggression_fans: 1.05 },
  wordplay: { purists: 1.2, comedy_fans: 1.05 },
  schemes: { purists: 1.25 },
  punchlines: { purists: 1.1, aggression_fans: 1.1 },
  comedy: { comedy_fans: 1.3, performance_fans: 1.1 },
  storytelling: { purists: 1.15, performance_fans: 1.1 },
  gun_bars: { street_fans: 1.25, aggression_fans: 1.2 },
  street_talk: { street_fans: 1.3 },
  freestyles: { performance_fans: 1.15, purists: 1.05 },
  rebuttals: { purists: 1.1, performance_fans: 1.1 },
  pop_culture_refs: { comedy_fans: 1.2 },
  name_flips: { comedy_fans: 1.15, purists: 1.05 },
  shock_value: { aggression_fans: 1.15, street_fans: 1.1 },
  social_commentary: { purists: 1.2 },
}

// Delivery type modifiers
const DELIVERY_CROWD_AFFINITY: Record<DeliveryType, Partial<Record<keyof CrowdDemographics, number>>> = {
  aggressive: { aggression_fans: 1.2, street_fans: 1.1 },
  smooth_flow: { purists: 1.15, performance_fans: 1.1 },
  speed_rapping: { purists: 1.1, performance_fans: 1.15 },
  staccato: { aggression_fans: 1.1 },
  passionate: { performance_fans: 1.2 },
  nonchalant: { purists: 1.05, comedy_fans: 1.1 },
  conversational: { comedy_fans: 1.1 },
}

// Calculate crowd multiplier based on demographics
function calculateCrowdMultiplier(
  content: ContentType,
  delivery: DeliveryType,
  demographics: CrowdDemographics
): number {
  let multiplier = 1.0

  // Content affinity
  const contentAffinity = CONTENT_CROWD_AFFINITY[content] || {}
  for (const [segment, bonus] of Object.entries(contentAffinity)) {
    const segmentPct = demographics[segment as keyof CrowdDemographics] / 100
    multiplier += (bonus - 1) * segmentPct
  }

  // Delivery affinity
  const deliveryAffinity = DELIVERY_CROWD_AFFINITY[delivery] || {}
  for (const [segment, bonus] of Object.entries(deliveryAffinity)) {
    const segmentPct = demographics[segment as keyof CrowdDemographics] / 100
    multiplier += (bonus - 1) * segmentPct * 0.5 // Delivery has less impact than content
  }

  return multiplier
}

// ============================================
// BADGE SYSTEM
// ============================================

const ALL_BADGES = {
  // Positive performance badges
  clutch_performer: { chokeReduction: 0.04 },
  freestyle_genius: { chokeReduction: 0.05, stumbleReduction: 0.02 },
  big_stage_performer: { chokeReduction: 0.02, crowdBonus: 0.05 },
  resilient_battler: { chokeReduction: 0.03 },

  // Negative performance badges
  known_choker: { chokeIncrease: 0.08 },
  easily_rattled: { chokeIncrease: 0.05, stumbleIncrease: 0.03 },
  overhyped_newcomer: { chokeIncrease: 0.03 },

  // Content badges
  wordplay_specialist: { contentBonus: { wordplay: 0.15 } },
  gun_bar_king: { contentBonus: { gun_bars: 0.15 } },
  comedian: { contentBonus: { comedy: 0.2 } },
  storyteller: { contentBonus: { storytelling: 0.15 } },
  angle_expert: { contentBonus: { personals: 0.15 } },

  // Delivery badges
  speed_demon: { deliveryBonus: { speed_rapping: 0.15 }, stumbleIncrease: 0.02 },
  smooth_talker: { deliveryBonus: { smooth_flow: 0.15 }, stumbleReduction: 0.02 },

  // Style badges
  crowd_favorite: { crowdBonus: 0.1 },
  intimidator: { opponentDebuff: 0.05 },
}

// ============================================
// TEST INTERFACES
// ============================================

interface BattleStats {
  totalBattles: number
  playerWins: number
  opponentWins: number
  bodyBags: number
  debatable: number
  playerChokes: number
  playerStumbles: number
  opponentChokes: number
  opponentStumbles: number
  playerChokeRounds: number
  playerStumbleRounds: number
  totalRounds: number
  avgPlayerScore: number
  avgOpponentScore: number
}

interface TestProfile {
  name: string
  prep: PrepLevels
  badges: string[]
  preferredContent?: ContentType[]
  preferredDelivery?: DeliveryType[]
}

// ============================================
// RANDOM SELECTION HELPERS
// ============================================

function randomContent(): ContentType {
  return CONTENT_TYPES[Math.floor(Math.random() * CONTENT_TYPES.length)]
}

function randomDelivery(): DeliveryType {
  return DELIVERY_TYPES[Math.floor(Math.random() * DELIVERY_TYPES.length)]
}

function randomPerformance(): PerformanceType {
  return PERFORMANCE_TYPES[Math.floor(Math.random() * PERFORMANCE_TYPES.length)]
}

function createSelections(
  preferredContent?: ContentType[],
  preferredDelivery?: DeliveryType[]
): RoundSelections {
  // Use preferred content 70% of the time if specified
  const content = preferredContent && Math.random() < 0.7
    ? preferredContent[Math.floor(Math.random() * preferredContent.length)]
    : randomContent()

  const delivery = preferredDelivery && Math.random() < 0.7
    ? preferredDelivery[Math.floor(Math.random() * preferredDelivery.length)]
    : randomDelivery()

  return {
    contentTypes: [content],
    deliveryTypes: [delivery],
    performanceTypes: [randomPerformance()],
  }
}

// ============================================
// BATTLE SIMULATION
// ============================================

function runBattle(
  playerPrep: PrepLevels,
  opponentPrep: PrepLevels,
  playerBadges: string[] = [],
  opponentBadges: string[] = [],
  playerPreferredContent?: ContentType[],
  playerPreferredDelivery?: DeliveryType[],
  crowdPreset: string = 'main_stage'
): {
  winner: 'player' | 'opponent'
  score: string
  playerChoked: boolean
  playerStumbled: boolean
  opponentChoked: boolean
  opponentStumbled: boolean
  playerChokeCount: number
  playerStumbleCount: number
  playerAvgScore: number
  opponentAvgScore: number
} {
  let playerRoundsWon = 0
  let opponentRoundsWon = 0
  let playerChoked = false
  let playerStumbled = false
  let opponentChoked = false
  let opponentStumbled = false
  let playerChokeCount = 0
  let playerStumbleCount = 0
  let totalPlayerScore = 0
  let totalOpponentScore = 0

  const demographics = CROWD_PRESETS[crowdPreset]

  for (let round = 0; round < 3; round++) {
    const playerSelections = createSelections(playerPreferredContent, playerPreferredDelivery)
    const opponentSelections = createSelections()

    const result = simulateMockRoundFull(
      playerSelections,
      opponentSelections,
      {
        segmentsPerRound: 4,
        playerPrep,
        opponentPrep,
        playerBadges,
        opponentBadges,
      }
    )

    // Apply crowd multiplier
    const playerCrowdMult = calculateCrowdMultiplier(
      playerSelections.contentTypes[0],
      playerSelections.deliveryTypes[0],
      demographics
    )
    const opponentCrowdMult = calculateCrowdMultiplier(
      opponentSelections.contentTypes[0],
      opponentSelections.deliveryTypes[0],
      demographics
    )

    const adjustedPlayerScore = result.playerResult.averageScore * playerCrowdMult
    const adjustedOpponentScore = result.opponentResult.averageScore * opponentCrowdMult

    totalPlayerScore += adjustedPlayerScore
    totalOpponentScore += adjustedOpponentScore

    if (result.playerResult.choked) {
      playerChoked = true
      playerChokeCount++
    }
    if (result.playerResult.stumbled) {
      playerStumbled = true
      playerStumbleCount++
    }
    if (result.opponentResult.choked) opponentChoked = true
    if (result.opponentResult.stumbled) opponentStumbled = true

    // Determine round winner with crowd adjustment
    if (adjustedPlayerScore > adjustedOpponentScore + 0.2) {
      playerRoundsWon++
    } else if (adjustedOpponentScore > adjustedPlayerScore + 0.2) {
      opponentRoundsWon++
    } else {
      // Very close - slight edge to higher peak
      if (result.playerResult.peakScore > result.opponentResult.peakScore) {
        playerRoundsWon++
      } else {
        opponentRoundsWon++
      }
    }
  }

  return {
    winner: playerRoundsWon > opponentRoundsWon ? 'player' : 'opponent',
    score: `${playerRoundsWon}-${opponentRoundsWon}`,
    playerChoked,
    playerStumbled,
    opponentChoked,
    opponentStumbled,
    playerChokeCount,
    playerStumbleCount,
    playerAvgScore: totalPlayerScore / 3,
    opponentAvgScore: totalOpponentScore / 3,
  }
}

// ============================================
// TEST RUNNER
// ============================================

function runTestsForProfile(
  profile: TestProfile,
  battles: number = 50,
  crowdPreset: string = 'main_stage'
): BattleStats {
  const stats: BattleStats = {
    totalBattles: battles,
    playerWins: 0,
    opponentWins: 0,
    bodyBags: 0,
    debatable: 0,
    playerChokes: 0,
    playerStumbles: 0,
    opponentChokes: 0,
    opponentStumbles: 0,
    playerChokeRounds: 0,
    playerStumbleRounds: 0,
    totalRounds: battles * 3,
    avgPlayerScore: 0,
    avgOpponentScore: 0,
  }

  // Opponent has varied prep each battle
  let totalPlayerScoreSum = 0
  let totalOpponentScoreSum = 0

  for (let i = 0; i < battles; i++) {
    // Vary opponent prep between 3-7
    const opponentPrep: PrepLevels = {
      writing: 3 + Math.floor(Math.random() * 5),
      rehearsal: 3 + Math.floor(Math.random() * 5),
      research: 2 + Math.floor(Math.random() * 4)
    }

    const result = runBattle(
      profile.prep,
      opponentPrep,
      profile.badges,
      [],
      profile.preferredContent,
      profile.preferredDelivery,
      crowdPreset
    )

    if (result.winner === 'player') {
      stats.playerWins++
    } else {
      stats.opponentWins++
    }

    if (result.score === '3-0' || result.score === '0-3') stats.bodyBags++
    else stats.debatable++

    if (result.playerChoked) stats.playerChokes++
    if (result.playerStumbled) stats.playerStumbles++
    if (result.opponentChoked) stats.opponentChokes++
    if (result.opponentStumbled) stats.opponentStumbles++

    stats.playerChokeRounds += result.playerChokeCount
    stats.playerStumbleRounds += result.playerStumbleCount

    totalPlayerScoreSum += result.playerAvgScore
    totalOpponentScoreSum += result.opponentAvgScore
  }

  stats.avgPlayerScore = totalPlayerScoreSum / battles
  stats.avgOpponentScore = totalOpponentScoreSum / battles

  return stats
}

function pct(num: number, total: number): string {
  return `${((num / total) * 100).toFixed(1)}%`
}

// ============================================
// MAIN TEST RUNNER
// ============================================

export function runExtensiveTests(battlesPerProfile: number = 50): void {
  console.log('\n' + '='.repeat(80))
  console.log('EXTENSIVE BATTLE SIMULATION TEST v2')
  console.log('Varying: Prep, Badges, Content, Delivery, Crowd Demographics')
  console.log('='.repeat(80))
  console.log(`Running ${battlesPerProfile} battles per profile...\n`)

  const profiles: TestProfile[] = [
    // === PREP VARIATION ===
    {
      name: 'ZERO REHEARSAL',
      prep: { writing: 5, rehearsal: 0, research: 5 },
      badges: [],
    },
    {
      name: 'ZERO REHEARSAL + CHOKER',
      prep: { writing: 5, rehearsal: 0, research: 5 },
      badges: ['known_choker'],
    },
    {
      name: 'LOW REHEARSAL (1)',
      prep: { writing: 5, rehearsal: 1, research: 5 },
      badges: [],
    },
    {
      name: 'AVERAGE (5-5-5)',
      prep: { writing: 5, rehearsal: 5, research: 5 },
      badges: [],
    },
    {
      name: 'HIGH PREP (8-8-8)',
      prep: { writing: 8, rehearsal: 8, research: 8 },
      badges: [],
    },

    // === BADGE VARIATION ===
    {
      name: 'AVG + CLUTCH',
      prep: { writing: 5, rehearsal: 5, research: 5 },
      badges: ['clutch_performer'],
    },
    {
      name: 'AVG + CHOKER',
      prep: { writing: 5, rehearsal: 5, research: 5 },
      badges: ['known_choker'],
    },
    {
      name: 'AVG + FREESTYLE GENIUS',
      prep: { writing: 5, rehearsal: 5, research: 5 },
      badges: ['freestyle_genius'],
    },
    {
      name: 'ZERO + FREESTYLE GENIUS',
      prep: { writing: 5, rehearsal: 0, research: 5 },
      badges: ['freestyle_genius'],
    },

    // === CONTENT SPECIALISTS (with appropriate crowd) ===
    {
      name: 'GUN BAR SPECIALIST',
      prep: { writing: 6, rehearsal: 5, research: 4 },
      badges: ['gun_bar_king'],
      preferredContent: ['gun_bars', 'street_talk'],
      preferredDelivery: ['aggressive'],
    },
    {
      name: 'WORDPLAY SPECIALIST',
      prep: { writing: 7, rehearsal: 5, research: 3 },
      badges: ['wordplay_specialist'],
      preferredContent: ['wordplay', 'schemes', 'punchlines'],
      preferredDelivery: ['smooth_flow'],
    },
    {
      name: 'COMEDIAN',
      prep: { writing: 5, rehearsal: 6, research: 4 },
      badges: ['comedian', 'crowd_favorite'],
      preferredContent: ['comedy', 'pop_culture_refs'],
      preferredDelivery: ['conversational', 'nonchalant'],
    },

    // === DELIVERY VARIATION ===
    {
      name: 'SPEED RAPPER (risky)',
      prep: { writing: 5, rehearsal: 5, research: 5 },
      badges: ['speed_demon'],
      preferredDelivery: ['speed_rapping'],
    },
    {
      name: 'SMOOTH FLOW (safe)',
      prep: { writing: 5, rehearsal: 5, research: 5 },
      badges: ['smooth_talker'],
      preferredDelivery: ['smooth_flow'],
    },
  ]

  // Test with different crowd presets
  const crowdPresets = ['small_room', 'main_stage', 'url_style', 'kotd_style']

  console.log('\n' + '-'.repeat(80))
  console.log('SECTION 1: PREP & BADGE VARIATION (Main Stage Crowd)')
  console.log('-'.repeat(80))
  console.log('')
  console.log('Profile                      | Win%  | Choke% | Stumble% | AvgScore')
  console.log('-'.repeat(80))

  const mainStageResults: { profile: string; stats: BattleStats }[] = []

  for (const profile of profiles.slice(0, 9)) {
    const stats = runTestsForProfile(profile, battlesPerProfile, 'main_stage')
    mainStageResults.push({ profile: profile.name, stats })

    const line = [
      profile.name.padEnd(28),
      pct(stats.playerWins, stats.totalBattles).padStart(5),
      pct(stats.playerChokes, stats.totalBattles).padStart(7),
      pct(stats.playerStumbles, stats.totalBattles).padStart(9),
      stats.avgPlayerScore.toFixed(2).padStart(8),
    ].join(' | ')
    console.log(line)
  }

  console.log('\n' + '-'.repeat(80))
  console.log('SECTION 2: CONTENT SPECIALISTS (Varied Crowds)')
  console.log('-'.repeat(80))

  // Gun bar specialist across different crowds
  const gunBarProfile = profiles.find(p => p.name === 'GUN BAR SPECIALIST')!
  console.log('\nGUN BAR SPECIALIST across crowds:')
  console.log('Crowd         | Win%  | AvgScore')
  console.log('-'.repeat(40))
  for (const crowd of crowdPresets) {
    const stats = runTestsForProfile(gunBarProfile, battlesPerProfile, crowd)
    console.log(`${crowd.padEnd(13)} | ${pct(stats.playerWins, stats.totalBattles).padStart(5)} | ${stats.avgPlayerScore.toFixed(2).padStart(8)}`)
  }

  // Wordplay specialist across different crowds
  const wordplayProfile = profiles.find(p => p.name === 'WORDPLAY SPECIALIST')!
  console.log('\nWORDPLAY SPECIALIST across crowds:')
  console.log('Crowd         | Win%  | AvgScore')
  console.log('-'.repeat(40))
  for (const crowd of crowdPresets) {
    const stats = runTestsForProfile(wordplayProfile, battlesPerProfile, crowd)
    console.log(`${crowd.padEnd(13)} | ${pct(stats.playerWins, stats.totalBattles).padStart(5)} | ${stats.avgPlayerScore.toFixed(2).padStart(8)}`)
  }

  // Comedian across different crowds
  const comedianProfile = profiles.find(p => p.name === 'COMEDIAN')!
  console.log('\nCOMEDIAN across crowds:')
  console.log('Crowd         | Win%  | AvgScore')
  console.log('-'.repeat(40))
  for (const crowd of crowdPresets) {
    const stats = runTestsForProfile(comedianProfile, battlesPerProfile, crowd)
    console.log(`${crowd.padEnd(13)} | ${pct(stats.playerWins, stats.totalBattles).padStart(5)} | ${stats.avgPlayerScore.toFixed(2).padStart(8)}`)
  }

  console.log('\n' + '-'.repeat(80))
  console.log('SECTION 3: DELIVERY STYLE IMPACT')
  console.log('-'.repeat(80))

  const speedRapper = profiles.find(p => p.name === 'SPEED RAPPER (risky)')!
  const smoothFlow = profiles.find(p => p.name === 'SMOOTH FLOW (safe)')!

  console.log('\nStyle        | Win%  | Choke% | Stumble% | AvgScore')
  console.log('-'.repeat(60))

  const speedStats = runTestsForProfile(speedRapper, battlesPerProfile, 'main_stage')
  const smoothStats = runTestsForProfile(smoothFlow, battlesPerProfile, 'main_stage')

  console.log(`Speed Rapper | ${pct(speedStats.playerWins, speedStats.totalBattles).padStart(5)} | ${pct(speedStats.playerChokes, speedStats.totalBattles).padStart(6)} | ${pct(speedStats.playerStumbles, speedStats.totalBattles).padStart(8)} | ${speedStats.avgPlayerScore.toFixed(2).padStart(8)}`)
  console.log(`Smooth Flow  | ${pct(smoothStats.playerWins, smoothStats.totalBattles).padStart(5)} | ${pct(smoothStats.playerChokes, smoothStats.totalBattles).padStart(6)} | ${pct(smoothStats.playerStumbles, smoothStats.totalBattles).padStart(8)} | ${smoothStats.avgPlayerScore.toFixed(2).padStart(8)}`)

  console.log('\n' + '='.repeat(80))
  console.log('KEY INSIGHTS')
  console.log('='.repeat(80))

  const zeroRehearsal = mainStageResults.find(r => r.profile === 'ZERO REHEARSAL')
  const zeroChoker = mainStageResults.find(r => r.profile === 'ZERO REHEARSAL + CHOKER')
  const average = mainStageResults.find(r => r.profile === 'AVERAGE (5-5-5)')
  const avgChoker = mainStageResults.find(r => r.profile === 'AVG + CHOKER')
  const avgClutch = mainStageResults.find(r => r.profile === 'AVG + CLUTCH')
  const freestyleZero = mainStageResults.find(r => r.profile === 'ZERO + FREESTYLE GENIUS')

  console.log('\nChoke Rate Analysis:')
  if (zeroRehearsal) console.log(`  Zero Rehearsal:        ${pct(zeroRehearsal.stats.playerChokes, zeroRehearsal.stats.totalBattles)} battles, ${pct(zeroRehearsal.stats.playerChokeRounds, zeroRehearsal.stats.totalRounds)} rounds`)
  if (zeroChoker) console.log(`  Zero + Known Choker:   ${pct(zeroChoker.stats.playerChokes, zeroChoker.stats.totalBattles)} battles, ${pct(zeroChoker.stats.playerChokeRounds, zeroChoker.stats.totalRounds)} rounds`)
  if (average) console.log(`  Average Prep:          ${pct(average.stats.playerChokes, average.stats.totalBattles)} battles, ${pct(average.stats.playerChokeRounds, average.stats.totalRounds)} rounds`)
  if (avgChoker) console.log(`  Average + Choker:      ${pct(avgChoker.stats.playerChokes, avgChoker.stats.totalBattles)} battles, ${pct(avgChoker.stats.playerChokeRounds, avgChoker.stats.totalRounds)} rounds`)
  if (avgClutch) console.log(`  Average + Clutch:      ${pct(avgClutch.stats.playerChokes, avgClutch.stats.totalBattles)} battles, ${pct(avgClutch.stats.playerChokeRounds, avgClutch.stats.totalRounds)} rounds`)
  if (freestyleZero) console.log(`  Zero + Freestyle:      ${pct(freestyleZero.stats.playerChokes, freestyleZero.stats.totalBattles)} battles, ${pct(freestyleZero.stats.playerChokeRounds, freestyleZero.stats.totalRounds)} rounds`)

  console.log('\nStumble Rate Analysis:')
  if (zeroRehearsal) console.log(`  Zero Rehearsal:        ${pct(zeroRehearsal.stats.playerStumbles, zeroRehearsal.stats.totalBattles)} battles (${pct(zeroRehearsal.stats.playerStumbleRounds, zeroRehearsal.stats.totalRounds)} rounds)`)
  if (average) console.log(`  Average Prep:          ${pct(average.stats.playerStumbles, average.stats.totalBattles)} battles (${pct(average.stats.playerStumbleRounds, average.stats.totalRounds)} rounds)`)

  console.log('\n' + '='.repeat(80))
  console.log('TEST COMPLETE')
  console.log('='.repeat(80))
}

// Run if called directly
if (require.main === module) {
  const battles = parseInt(process.argv[2]) || 50
  runExtensiveTests(battles)
}
