/**
 * Blogger Narrative System
 *
 * Translates raw battle data into skill-based narratives.
 * Bloggers interpret performances through their unique lens - NO raw scores shown.
 *
 * Each blogger has their own vocabulary and interpretation style.
 */

import type { Blogger } from '../bloggers'

// ============================================
// SKILL ASSESSMENT TYPES
// ============================================

export interface SkillNarrative {
  // Overall performance descriptions
  overallPerformance: string
  roundControl: string

  // Specific skill observations
  writingAssessment: string
  deliveryAssessment: string
  crowdConnection: string

  // Key moments (translated from haymakers/chokes)
  momentumShifts: string[]
  criticalMoments: string[]

  // Comparison narrative (how they matched up)
  matchupAnalysis: string

  // Closing take
  verdict: string
}

// ============================================
// PERFORMANCE TIER THRESHOLDS
// ============================================

type PerformanceTier = 'legendary' | 'elite' | 'solid' | 'average' | 'weak' | 'terrible'

function getPerformanceTier(crowdAverage: number): PerformanceTier {
  if (crowdAverage >= 90) return 'legendary'
  if (crowdAverage >= 75) return 'elite'
  if (crowdAverage >= 60) return 'solid'
  if (crowdAverage >= 45) return 'average'
  if (crowdAverage >= 30) return 'weak'
  return 'terrible'
}

// ============================================
// BLOGGER-SPECIFIC VOCABULARY
// ============================================

interface BloggerVocabulary {
  // Performance descriptors by tier
  performanceTiers: Record<PerformanceTier, string[]>

  // Haymaker descriptions
  haymakerDescriptions: string[]

  // Choke descriptions
  chokeDescriptions: string[]

  // Stumble descriptions
  stumbleDescriptions: string[]

  // Crowd reaction phrases
  crowdPhrases: {
    hot: string[]
    warm: string[]
    cold: string[]
  }

  // Victory types
  victoryDescriptions: {
    dominant: string[]
    clear: string[]
    close: string[]
    upset: string[]
  }

  // Loss types
  lossDescriptions: {
    bodybag: string[]
    clear: string[]
    close: string[]
  }
}

// Marijuana Piranha - Raw, unfiltered, street vernacular
const MARIJUANA_PIRANHA_VOCAB: BloggerVocabulary = {
  performanceTiers: {
    legendary: [
      'went absolutely crazy',
      'was on some different shit',
      'bodied the whole building',
      'had the venue going insane',
    ],
    elite: [
      'came correct',
      'showed up ready',
      'put on a show',
      'was cooking',
    ],
    solid: [
      'held it down',
      'did what needed to be done',
      'showed up',
      'handled business',
    ],
    average: [
      'was just okay out there',
      'didn\'t really impress',
      'was mid',
      'nothing special',
    ],
    weak: [
      'looked uncomfortable',
      'wasn\'t ready for this',
      'got exposed',
      'didn\'t belong up there',
    ],
    terrible: [
      'got embarrassed',
      'should hang it up',
      'got sent home in a body bag',
      'career might be over',
    ],
  },
  haymakerDescriptions: [
    'had the crowd going crazy',
    'said something that shook the room',
    'dropped a bar that\'s gonna be replayed for years',
    'landed something vicious',
    'had people losing their minds',
  ],
  chokeDescriptions: [
    'completely froze up',
    'forgot their bars',
    'had a rough moment that cost them',
    'stumbled bad - couldn\'t recover',
    'went blank at the worst time',
  ],
  stumbleDescriptions: [
    'tripped up a little',
    'had a hiccup but kept pushing',
    'lost their flow for a second',
    'got a little shaky',
  ],
  crowdPhrases: {
    hot: [
      'the crowd was going crazy',
      'the building was shaking',
      'people were losing their minds',
    ],
    warm: [
      'the crowd was with it',
      'people were feeling it',
      'got some love from the room',
    ],
    cold: [
      'the crowd wasn\'t buying it',
      'people were quiet',
      'nobody was feeling that',
    ],
  },
  victoryDescriptions: {
    dominant: [
      'absolutely cooked them',
      '30\'d that man',
      'sent them home in a bag',
    ],
    clear: [
      'took it clearly',
      'won that battle',
      'got the W',
    ],
    close: [
      'edged that one out',
      'got the debatable but I saw it their way',
      'just barely got it',
    ],
    upset: [
      'shocked everybody',
      'pulled off the upset of the year',
      'proved all the doubters wrong',
    ],
  },
  lossDescriptions: {
    bodybag: [
      'got absolutely destroyed',
      'got 30\'d badly',
      'needs to rethink everything',
    ],
    clear: [
      'took the L',
      'lost that battle',
      'came up short',
    ],
    close: [
      'got edged in a debatable',
      'could argue they won but didn\'t get the nod',
      'was right there but didn\'t get it',
    ],
  },
}

// Algorithm Institute - Data-driven but no numbers, analytical language
const ALGORITHM_INSTITUTE_VOCAB: BloggerVocabulary = {
  performanceTiers: {
    legendary: [
      'delivered a historically significant performance',
      'executed at the highest possible level',
      'demonstrated exceptional mastery across all categories',
      'performed at career-defining levels',
    ],
    elite: [
      'showed strong execution throughout',
      'demonstrated high-level proficiency',
      'performed above expected benchmarks',
      'displayed consistent excellence',
    ],
    solid: [
      'met standard performance expectations',
      'demonstrated competent execution',
      'performed adequately across metrics',
      'showed acceptable proficiency',
    ],
    average: [
      'fell within the middle range of performance',
      'showed inconsistent execution',
      'demonstrated moderate proficiency',
      'performed unremarkably',
    ],
    weak: [
      'underperformed relative to capability',
      'showed significant gaps in execution',
      'failed to meet baseline expectations',
      'demonstrated concerning deficiencies',
    ],
    terrible: [
      'performed well below acceptable thresholds',
      'showed catastrophic execution failures',
      'demonstrated complete system breakdown',
      'failed across all measured categories',
    ],
  },
  haymakerDescriptions: [
    'achieved a peak-performance moment',
    'landed high-impact material',
    'demonstrated exceptional execution in key segments',
    'created a significant momentum shift',
    'delivered premium-tier content',
  ],
  chokeDescriptions: [
    'experienced a critical execution failure',
    'suffered a memory-related incident',
    'had a system breakdown during performance',
    'showed concerning preparation gaps',
    'failed to execute prepared material',
  ],
  stumbleDescriptions: [
    'had a minor execution variance',
    'showed slight deviation from optimal flow',
    'experienced a brief performance dip',
    'demonstrated momentary inconsistency',
  ],
  crowdPhrases: {
    hot: [
      'generated exceptional crowd engagement',
      'achieved maximum audience response',
      'demonstrated elite crowd control',
    ],
    warm: [
      'maintained positive crowd engagement',
      'achieved satisfactory audience response',
      'showed effective crowd connection',
    ],
    cold: [
      'failed to generate meaningful engagement',
      'received minimal audience response',
      'showed poor crowd connection metrics',
    ],
  },
  victoryDescriptions: {
    dominant: [
      'achieved a decisive victory across all rounds',
      'demonstrated clear superiority throughout',
      'won convincingly with no contested rounds',
    ],
    clear: [
      'secured the victory with a comfortable margin',
      'won with clear round separation',
      'achieved a definitive result',
    ],
    close: [
      'edged out the victory in a contested battle',
      'secured a narrow decision',
      'won in what could be considered debatable',
    ],
    upset: [
      'achieved an unexpected victory against higher-ranked opposition',
      'outperformed their projected ceiling',
      'delivered a result that defied predictions',
    ],
  },
  lossDescriptions: {
    bodybag: [
      'suffered a comprehensive defeat',
      'was outperformed across all categories',
      'experienced a career-damaging loss',
    ],
    clear: [
      'was defeated decisively',
      'lost with clear separation',
      'failed to secure rounds',
    ],
    close: [
      'fell short in a contested decision',
      'lost in a battle that could have gone either way',
      'was edged out in competitive rounds',
    ],
  },
}

// The Battle Breakdown - Strategic analysis, tactical language
const BATTLE_BREAKDOWN_VOCAB: BloggerVocabulary = {
  performanceTiers: {
    legendary: [
      'executed their gameplan flawlessly',
      'showcased elite preparation and adaptation',
      'demonstrated mastery of both offense and defense',
      'put on a clinic',
    ],
    elite: [
      'came in well-prepared and showed it',
      'had a strong strategic approach',
      'controlled the pace effectively',
      'showed excellent battle IQ',
    ],
    solid: [
      'had a workable gameplan',
      'made decent adjustments',
      'showed competent strategy',
      'did what they came to do',
    ],
    average: [
      'lacked a clear strategic direction',
      'seemed unprepared for the matchup',
      'didn\'t adapt well to what was happening',
      'could have used better preparation',
    ],
    weak: [
      'came in with the wrong approach',
      'was outstrategized from the start',
      'showed poor preparation',
      'didn\'t understand the assignment',
    ],
    terrible: [
      'was completely outclassed strategically',
      'had no answer for anything thrown at them',
      'showed no sign of preparation',
      'was broken down mentally',
    ],
  },
  haymakerDescriptions: [
    'landed a perfectly timed strike',
    'found the opening and exploited it',
    'executed a devastating counter',
    'delivered a momentum-shifting blow',
    'broke through their opponent\'s defense',
  ],
  chokeDescriptions: [
    'had a critical failure under pressure',
    'crumbled when it mattered most',
    'couldn\'t execute their prepared material',
    'lost composure at a key moment',
    'fell apart mentally',
  ],
  stumbleDescriptions: [
    'lost rhythm briefly',
    'had a minor slip but recovered',
    'showed a moment of uncertainty',
    'briefly lost their footing',
  ],
  crowdPhrases: {
    hot: [
      'had the crowd completely on their side',
      'controlled the room\'s energy masterfully',
      'turned the audience into their weapon',
    ],
    warm: [
      'maintained crowd support',
      'kept the energy working for them',
      'had decent crowd engagement',
    ],
    cold: [
      'lost the crowd\'s interest',
      'couldn\'t get the room behind them',
      'let the energy work against them',
    ],
  },
  victoryDescriptions: {
    dominant: [
      'broke their opponent down completely',
      'won every exchange decisively',
      'left no doubt about the outcome',
    ],
    clear: [
      'took the battle with solid execution',
      'won on technical merit and strategy',
      'secured the win through better preparation',
    ],
    close: [
      'edged it out in the key moments',
      'made the crucial adjustments late',
      'won the battles within the battle',
    ],
    upset: [
      'came in with the perfect gameplan',
      'exposed their opponent\'s weaknesses',
      'outprepared and outexecuted the favorite',
    ],
  },
  lossDescriptions: {
    bodybag: [
      'was completely dismantled',
      'had no answers at any point',
      'was exposed on every level',
    ],
    clear: [
      'was outworked and outprepared',
      'lost the strategic battle',
      'couldn\'t execute against superior opposition',
    ],
    close: [
      'lost the key moments',
      'came up just short in execution',
      'made small mistakes that added up',
    ],
  },
}

// ============================================
// VOCABULARY LOOKUP
// ============================================

function getBloggerVocabulary(bloggerId: string): BloggerVocabulary {
  switch (bloggerId) {
    case 'marijuana-piranha':
    case 'marijuana_piranha':
      return MARIJUANA_PIRANHA_VOCAB
    case 'algorithm-institute':
    case 'algorithm_institute':
      return ALGORITHM_INSTITUTE_VOCAB
    case 'battle-breakdown':
    case 'battle_breakdown':
    case 'the-battle-breakdown':
    case 'the_battle_breakdown':
      return BATTLE_BREAKDOWN_VOCAB
    default:
      // Default to Battle Breakdown style
      return BATTLE_BREAKDOWN_VOCAB
  }
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ============================================
// NARRATIVE GENERATION
// ============================================

export interface BattlePerformanceData {
  battlerName: string
  crowdAverage: number // 0-100
  haymakers: number
  chokes: number
  stumbles: number
  roundsWon: number
  contentTypes?: string[]
  deliveryTypes?: string[]
  isWinner: boolean
}

export interface BattleNarrativeInput {
  bloggerId: string
  winner: BattlePerformanceData
  loser: BattlePerformanceData
  decision: 'bodybag_30' | 'clear_30' | 'clear_21' | 'edge' | 'classic' | 'comeback'
  isUpset: boolean
  leagueName: string
}

/**
 * Generate a complete narrative without any numerical scores
 */
export function generateBattleNarrative(input: BattleNarrativeInput): SkillNarrative {
  const vocab = getBloggerVocabulary(input.bloggerId)

  const winnerTier = getPerformanceTier(input.winner.crowdAverage)
  const loserTier = getPerformanceTier(input.loser.crowdAverage)

  // Build overall performance descriptions
  const overallPerformance = buildOverallPerformance(vocab, input.winner, input.loser, winnerTier, loserTier)
  const roundControl = buildRoundControl(vocab, input.winner, input.loser, input.decision)

  // Build skill assessments
  const writingAssessment = buildWritingAssessment(vocab, input.winner, input.loser)
  const deliveryAssessment = buildDeliveryAssessment(vocab, input.winner, input.loser)
  const crowdConnection = buildCrowdConnection(vocab, input.winner, input.loser, winnerTier, loserTier)

  // Build moments
  const momentumShifts = buildMomentumShifts(vocab, input.winner, input.loser)
  const criticalMoments = buildCriticalMoments(vocab, input.winner, input.loser)

  // Build matchup analysis
  const matchupAnalysis = buildMatchupAnalysis(vocab, input.winner, input.loser, input.decision, input.isUpset)

  // Build verdict
  const verdict = buildVerdict(vocab, input.winner, input.loser, input.decision, input.isUpset)

  return {
    overallPerformance,
    roundControl,
    writingAssessment,
    deliveryAssessment,
    crowdConnection,
    momentumShifts,
    criticalMoments,
    matchupAnalysis,
    verdict,
  }
}

function buildOverallPerformance(
  vocab: BloggerVocabulary,
  winner: BattlePerformanceData,
  loser: BattlePerformanceData,
  winnerTier: PerformanceTier,
  loserTier: PerformanceTier,
): string {
  const winnerDesc = randomPick(vocab.performanceTiers[winnerTier])
  const loserDesc = randomPick(vocab.performanceTiers[loserTier])

  return `${winner.battlerName} ${winnerDesc}, while ${loser.battlerName} ${loserDesc}.`
}

function buildRoundControl(
  vocab: BloggerVocabulary,
  winner: BattlePerformanceData,
  loser: BattlePerformanceData,
  decision: string,
): string {
  if (decision === 'bodybag_30' || decision === 'clear_30') {
    return `${winner.battlerName} controlled all three rounds from start to finish.`
  } else if (decision === 'comeback') {
    return `${winner.battlerName} lost the first but rallied back to take the last two.`
  } else if (decision === 'classic') {
    return `Both battlers traded rounds in an extremely competitive back-and-forth.`
  } else if (decision === 'edge') {
    return `The rounds were contested, with ${winner.battlerName} just edging out the decision.`
  }
  return `${winner.battlerName} took the majority of rounds in a clear decision.`
}

function buildWritingAssessment(
  vocab: BloggerVocabulary,
  winner: BattlePerformanceData,
  loser: BattlePerformanceData,
): string {
  const winnerContent = winner.contentTypes || []
  const loserContent = loser.contentTypes || []

  // Describe writing style without scores
  const winnerFocus = winnerContent.length > 0
    ? `focused on ${formatContentTypes(winnerContent.slice(0, 2))}`
    : 'showed their typical approach'

  const loserFocus = loserContent.length > 0
    ? `relied on ${formatContentTypes(loserContent.slice(0, 2))}`
    : 'stuck with what they know'

  return `${winner.battlerName} ${winnerFocus}, while ${loser.battlerName} ${loserFocus}.`
}

function formatContentTypes(types: string[]): string {
  return types.map(t => t.replace(/_/g, ' ')).join(' and ')
}

function buildDeliveryAssessment(
  vocab: BloggerVocabulary,
  winner: BattlePerformanceData,
  loser: BattlePerformanceData,
): string {
  const winnerDelivery = winner.deliveryTypes?.[0] || 'standard'
  const loserDelivery = loser.deliveryTypes?.[0] || 'standard'

  const deliveryDescriptions: Record<string, string> = {
    aggressive: 'came with aggression and intensity',
    smooth_flow: 'maintained a smooth, effortless flow',
    speed_rapping: 'showcased their speed and precision',
    staccato: 'used sharp, punctuated delivery',
    passionate: 'brought emotional intensity',
    nonchalant: 'stayed cool and unbothered',
    conversational: 'kept it conversational and relatable',
    standard: 'delivered their material effectively',
  }

  const winnerDesc = deliveryDescriptions[winnerDelivery] || deliveryDescriptions.standard
  const loserDesc = deliveryDescriptions[loserDelivery] || deliveryDescriptions.standard

  return `${winner.battlerName} ${winnerDesc}. ${loser.battlerName} ${loserDesc}.`
}

function buildCrowdConnection(
  vocab: BloggerVocabulary,
  winner: BattlePerformanceData,
  loser: BattlePerformanceData,
  winnerTier: PerformanceTier,
  loserTier: PerformanceTier,
): string {
  const winnerCrowdLevel = winnerTier === 'legendary' || winnerTier === 'elite' ? 'hot' : winnerTier === 'solid' || winnerTier === 'average' ? 'warm' : 'cold'
  const loserCrowdLevel = loserTier === 'legendary' || loserTier === 'elite' ? 'hot' : loserTier === 'solid' || loserTier === 'average' ? 'warm' : 'cold'

  const winnerCrowdPhrase = randomPick(vocab.crowdPhrases[winnerCrowdLevel])
  const loserCrowdPhrase = randomPick(vocab.crowdPhrases[loserCrowdLevel])

  if (winnerCrowdLevel === loserCrowdLevel) {
    if (winnerCrowdLevel === 'hot') {
      return `Both battlers had the crowd engaged throughout - this was a fun one for the audience.`
    } else if (winnerCrowdLevel === 'cold') {
      return `Neither battler really got the crowd going like they needed to.`
    }
    return `The crowd was evenly split, reacting to both throughout the battle.`
  }

  return `For ${winner.battlerName}, ${winnerCrowdPhrase}. For ${loser.battlerName}, ${loserCrowdPhrase}.`
}

function buildMomentumShifts(
  vocab: BloggerVocabulary,
  winner: BattlePerformanceData,
  loser: BattlePerformanceData,
): string[] {
  const shifts: string[] = []

  // Winner haymakers
  if (winner.haymakers > 0) {
    if (winner.haymakers >= 3) {
      shifts.push(`${winner.battlerName} ${randomPick(vocab.haymakerDescriptions)} multiple times throughout the battle.`)
    } else if (winner.haymakers === 2) {
      shifts.push(`${winner.battlerName} ${randomPick(vocab.haymakerDescriptions)} on two separate occasions.`)
    } else {
      shifts.push(`${winner.battlerName} ${randomPick(vocab.haymakerDescriptions)} at a crucial moment.`)
    }
  }

  // Loser haymakers (if any - shows they fought back)
  if (loser.haymakers > 0) {
    if (loser.haymakers >= 2) {
      shifts.push(`${loser.battlerName} had their moments too, ${randomPick(vocab.haymakerDescriptions).toLowerCase()}.`)
    } else {
      shifts.push(`${loser.battlerName} ${randomPick(vocab.haymakerDescriptions)} but it wasn't enough.`)
    }
  }

  return shifts
}

function buildCriticalMoments(
  vocab: BloggerVocabulary,
  winner: BattlePerformanceData,
  loser: BattlePerformanceData,
): string[] {
  const moments: string[] = []

  // Chokes are major critical moments
  if (loser.chokes > 0) {
    moments.push(`${loser.battlerName} ${randomPick(vocab.chokeDescriptions)} - a critical moment that likely cost them the battle.`)
  }

  if (winner.chokes > 0) {
    moments.push(`Even ${winner.battlerName} ${randomPick(vocab.chokeDescriptions)}, but they recovered.`)
  }

  // Stumbles are minor but notable
  if (loser.stumbles > 0 && loser.chokes === 0) {
    moments.push(`${loser.battlerName} ${randomPick(vocab.stumbleDescriptions)}.`)
  }

  if (winner.stumbles > 0) {
    moments.push(`${winner.battlerName} ${randomPick(vocab.stumbleDescriptions)} but kept pushing forward.`)
  }

  return moments
}

function buildMatchupAnalysis(
  vocab: BloggerVocabulary,
  winner: BattlePerformanceData,
  loser: BattlePerformanceData,
  decision: string,
  isUpset: boolean,
): string {
  if (isUpset) {
    return `This was a major upset. ${winner.battlerName} ${randomPick(vocab.victoryDescriptions.upset)}. Nobody saw this coming.`
  }

  if (decision === 'bodybag_30') {
    return `This was a mismatch from the start. ${winner.battlerName} ${randomPick(vocab.victoryDescriptions.dominant)} while ${loser.battlerName} ${randomPick(vocab.lossDescriptions.bodybag)}.`
  }

  if (decision === 'classic') {
    return `This was a classic battle that showcased both competitors at their best. The kind of battle that reminds you why you love this culture.`
  }

  if (decision === 'edge') {
    return `This was a competitive battle that could have gone either way. ${winner.battlerName} ${randomPick(vocab.victoryDescriptions.close)}, but ${loser.battlerName} ${randomPick(vocab.lossDescriptions.close)}.`
  }

  return `${winner.battlerName} ${randomPick(vocab.victoryDescriptions.clear)}. ${loser.battlerName} ${randomPick(vocab.lossDescriptions.clear)}.`
}

function buildVerdict(
  vocab: BloggerVocabulary,
  winner: BattlePerformanceData,
  loser: BattlePerformanceData,
  decision: string,
  isUpset: boolean,
): string {
  const verdictScore = `${winner.roundsWon}-${3 - winner.roundsWon}`

  if (decision === 'bodybag_30') {
    return `${winner.battlerName} takes this in dominant fashion. Clear ${verdictScore}.`
  }

  if (decision === 'classic') {
    return `${winner.battlerName} gets the nod in what was an instant classic. ${verdictScore}, but both battlers elevated their stock today.`
  }

  if (decision === 'edge') {
    return `${winner.battlerName} edges it ${verdictScore}. Debatable, but they did enough.`
  }

  if (decision === 'comeback') {
    return `${winner.battlerName} with the comeback victory, ${verdictScore}. Down early but finished strong.`
  }

  if (isUpset) {
    return `${winner.battlerName} with the upset of the night. ${verdictScore}. The culture just witnessed something.`
  }

  return `${winner.battlerName} takes it ${verdictScore}. Clean work.`
}

// ============================================
// FULL ARTICLE GENERATION (NO SCORES)
// ============================================

/**
 * Generate a complete article body using skill narratives only
 */
export function generateNarrativeArticleBody(input: BattleNarrativeInput): string {
  const narrative = generateBattleNarrative(input)

  let body = `# ${input.winner.battlerName} vs ${input.loser.battlerName} – ${input.leagueName}\n\n`

  // Opening paragraph - overall performance
  body += `${narrative.overallPerformance}\n\n`

  // Round control
  body += `${narrative.roundControl}\n\n`

  // The Battle section
  body += `## The Battle\n\n`
  body += `${narrative.writingAssessment}\n\n`
  body += `${narrative.deliveryAssessment}\n\n`
  body += `${narrative.crowdConnection}\n\n`

  // Key Moments section
  if (narrative.momentumShifts.length > 0 || narrative.criticalMoments.length > 0) {
    body += `## Key Moments\n\n`

    for (const shift of narrative.momentumShifts) {
      body += `${shift}\n\n`
    }

    for (const moment of narrative.criticalMoments) {
      body += `${moment}\n\n`
    }
  }

  // Analysis section
  body += `## Analysis\n\n`
  body += `${narrative.matchupAnalysis}\n\n`

  // Verdict
  body += `## Verdict\n\n`
  body += `${narrative.verdict}\n\n`

  body += `---\n\n`
  body += `*Battle recap by ${getBloggerDisplayName(input.bloggerId)}*`

  return body
}

function getBloggerDisplayName(bloggerId: string): string {
  const names: Record<string, string> = {
    'marijuana-piranha': 'Marijuana Piranha',
    'marijuana_piranha': 'Marijuana Piranha',
    'algorithm-institute': 'Algorithm Institute',
    'algorithm_institute': 'Algorithm Institute',
    'battle-breakdown': 'The Battle Breakdown',
    'battle_breakdown': 'The Battle Breakdown',
    'the-battle-breakdown': 'The Battle Breakdown',
    'the_battle_breakdown': 'The Battle Breakdown',
  }
  return names[bloggerId] || 'Battle Rap Media'
}
