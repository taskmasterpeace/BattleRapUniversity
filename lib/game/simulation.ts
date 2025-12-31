// Battle Rap University - V2 Simulation Engine
// Simplified simulation using prep segments and counters

import { SIMULATION_CONFIG as CONFIG } from './config'

interface BattlerAttributes {
  writing: {
    lyricism: number
    wordplay: number
    creativity: number
    flow?: number
  }
  performance: {
    stage_presence: number
    crowd_control: number
    delivery: number
  }
  resilience?: number
}

interface PrepSegment {
  id: string
  content_type: string
  delivery_type: string
  performance_type: string
  is_freestyle: boolean
  is_counter: boolean
  counter_target?: string
  is_rehearsed: boolean
  round_num: number | null
  position: number | null
}

interface PrepCounter {
  id: string
  segment_id: string
  anticipated_content: string
  was_triggered?: boolean
  was_effective?: boolean
}

interface RoundResult {
  round_index: number
  battler_id: string
  average_score: number
  peak_score: number
  consistency_score: number
  crowd_reaction: number
  choked: boolean
  won?: boolean
  final_momentum?: number
}

interface SegmentResult {
  round_index: number
  segment_index: number
  battler_id: string
  segment_score: number
  event_flags: string[]
  crowd_reaction: number
  momentum?: number
}

/**
 * Main simulation function - simulates a complete battle
 */
export async function simulateBattle(
  battleId: string,
  supabase: any
): Promise<{
  success: boolean
  winnerId?: string
  playerRounds?: RoundResult[]
  aiRounds?: RoundResult[]
  error?: string
}> {
  try {
    // 1. Load battle data
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select(`
        *,
        league:league_id(*)
      `)
      .eq('id', battleId)
      .single()

    if (battleError || !battle) {
      return { success: false, error: 'Battle not found' }
    }

    // Validate battle status
    const validStatuses = ['accepted', 'locked']
    if (battle.status === 'completed') {
      return { success: false, error: 'Battle already completed' }
    }
    if (!validStatuses.includes(battle.status)) {
      return { success: false, error: `Invalid battle status: ${battle.status}. Must be 'accepted' or 'locked'` }
    }

    // 2. Load both battlers' attributes
    const [playerAttrsRes, aiAttrsRes] = await Promise.all([
      supabase.from('battler_attributes').select('*').eq('battler_id', battle.battler_player_id).single(),
      supabase.from('battler_attributes').select('*').eq('battler_id', battle.battler_ai_id).single(),
    ])

    const playerAttrs: BattlerAttributes = playerAttrsRes.data || getDefaultAttributes()
    const aiAttrs: BattlerAttributes = aiAttrsRes.data || getDefaultAttributes()

    // 3. Load V2 prep segments for player
    const { data: playerSegments } = await supabase
      .from('prep_segments')
      .select('*')
      .eq('battle_id', battleId)
      .eq('battler_id', battle.battler_player_id)
      .order('round_num', { ascending: true })
      .order('position', { ascending: true })

    // 4. Load prep counters for player
    const { data: playerCounters } = await supabase
      .from('prep_counters')
      .select('*')
      .eq('battle_id', battleId)
      .eq('battler_id', battle.battler_player_id)

    // 5. Load prep blocks to calculate prep days
    const { data: prepBlocks } = await supabase
      .from('prep_blocks')
      .select('focus')
      .eq('battle_id', battleId)

    const prepProfile = buildPrepProfile(prepBlocks || [])

    // 6. Determine segments per round based on league
    const segmentsPerRound = battle.league?.round_length_minutes === 3 ? 6 : 4
    const roundCount = 3

    // 7. Simulate all rounds with momentum tracking
    const allPlayerRounds: RoundResult[] = []
    const allAiRounds: RoundResult[] = []
    const allSegments: SegmentResult[] = []

    // Track momentum between rounds (starts at neutral 50)
    let playerMomentum = CONFIG.MOMENTUM_STARTING
    let aiMomentum = CONFIG.MOMENTUM_STARTING

    for (let roundIndex = 1; roundIndex <= roundCount; roundIndex++) {
      // Get player segments assigned to this round
      const roundSegments = (playerSegments || []).filter(
        (s: PrepSegment) => s.round_num === roundIndex
      )

      // Simulate player round with carried momentum
      const playerRound = simulateRound(
        roundIndex,
        segmentsPerRound,
        battle.battler_player_id,
        playerAttrs,
        prepProfile,
        battle.league,
        roundSegments,
        playerCounters || [],
        playerMomentum
      )

      // Simulate AI round with carried momentum (using default profile, no V2 segments)
      const aiRound = simulateRound(
        roundIndex,
        segmentsPerRound,
        battle.battler_ai_id,
        aiAttrs,
        { researchDays: 3, writingDays: 3, performanceDays: 2, restDays: 1, lifeDays: 1 },
        battle.league,
        [], // AI has no V2 segments
        [],
        aiMomentum
      )

      // Update momentum for next round
      playerMomentum = playerRound.summary.final_momentum || CONFIG.MOMENTUM_STARTING
      aiMomentum = aiRound.summary.final_momentum || CONFIG.MOMENTUM_STARTING

      allPlayerRounds.push(playerRound.summary)
      allAiRounds.push(aiRound.summary)
      allSegments.push(...playerRound.segments, ...aiRound.segments)
    }

    // 8-9. Determine round winners and battle winner (best of 3)
    let playerRoundsWon = 0
    let aiRoundsWon = 0
    for (let i = 0; i < roundCount; i++) {
      const playerScore = calculateCompositeScore(allPlayerRounds[i])
      const aiScore = calculateCompositeScore(allAiRounds[i])

      // Calculate winner with tiebreaker
      if (playerScore > aiScore) {
        playerRoundsWon++
      } else if (aiScore > playerScore) {
        aiRoundsWon++
      } else {
        // Tie: use peak score as tiebreaker
        const playerPeak = allPlayerRounds[i].peak_score
        const aiPeak = allAiRounds[i].peak_score
        if (playerPeak > aiPeak) {
          playerRoundsWon++
        } else {
          aiRoundsWon++
        }
      }
    }

    const winnerId = playerRoundsWon > aiRoundsWon ? battle.battler_player_id : battle.battler_ai_id

    // 10. Calculate verdict
    const maxRoundsWon = Math.max(playerRoundsWon, aiRoundsWon)
    const verdict = maxRoundsWon === 3 ? '3-0' : '2-1'

    // 11. Update counter results
    await updateCounterResults(supabase, battleId, playerCounters || [], allAiRounds)

    // 12. Save battle results
    await saveBattleResults(
      supabase,
      battleId,
      winnerId,
      allPlayerRounds,
      allAiRounds,
      allSegments,
      battle,
      verdict
    )

    return {
      success: true,
      winnerId,
      playerRounds: allPlayerRounds,
      aiRounds: allAiRounds,
    }
  } catch (err) {
    console.error('Simulation error:', err)
    return { success: false, error: String(err) }
  }
}

function getDefaultAttributes(): BattlerAttributes {
  return {
    writing: { lyricism: 5, wordplay: 5, creativity: 5, flow: 5 },
    performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
    resilience: 5,
  }
}

function buildPrepProfile(prepBlocks: { focus: string }[]) {
  const profile = {
    researchDays: 0,
    writingDays: 0,
    performanceDays: 0,
    restDays: 0,
    lifeDays: 0,
  }

  for (const block of prepBlocks) {
    switch (block.focus) {
      case 'research': profile.researchDays++; break
      case 'writing': profile.writingDays++; break
      case 'performance': profile.performanceDays++; break
      case 'rest': profile.restDays++; break
      case 'life': profile.lifeDays++; break
    }
  }

  return profile
}

/**
 * Simulates a single round with battle format awareness
 *
 * Battle Format Handling:
 * - 'live' (default): Full performance weight, normal choke risk, live crowd reaction
 * - 'asynchronous' (Text Wars): 100% writing weight, 0% performance, no choke risk, voting-based scores
 * - 'recorded' (App Battles): 70% writing / 30% performance, reduced choke risk, video voting
 */
function simulateRound(
  roundIndex: number,
  segmentsPerRound: number,
  battlerId: string,
  attrs: BattlerAttributes,
  prepProfile: ReturnType<typeof buildPrepProfile>,
  league: any,
  v2Segments: PrepSegment[],
  counters: PrepCounter[],
  previousMomentum: number = CONFIG.MOMENTUM_STARTING
) {
  const segmentResults: SegmentResult[] = []
  const scores: number[] = []

  // Initialize momentum - apply decay from previous round toward neutral (50)
  let momentum = previousMomentum + (CONFIG.MOMENTUM_STARTING - previousMomentum) * CONFIG.MOMENTUM_ROUND_DECAY

  // Apply prep bonuses to attributes
  const writingBonus = prepProfile.writingDays * CONFIG.PREP_EFFECT_MULTIPLIER
  const perfBonus = prepProfile.performanceDays * CONFIG.PREP_EFFECT_MULTIPLIER

  const modifiedAttrs = {
    writing: {
      lyricism: Math.min(10, attrs.writing.lyricism + writingBonus),
      wordplay: Math.min(10, attrs.writing.wordplay + writingBonus),
      creativity: Math.min(10, attrs.writing.creativity + writingBonus),
    },
    performance: {
      stage_presence: Math.min(10, attrs.performance.stage_presence + perfBonus),
      crowd_control: Math.min(10, attrs.performance.crowd_control + perfBonus),
      delivery: Math.min(10, attrs.performance.delivery + perfBonus),
    },
    resilience: Math.min(10, (attrs.resilience || 5) + prepProfile.restDays * CONFIG.PREP_EFFECT_MULTIPLIER),
  }

  // Calculate base power with attribute advantage scaling
  const rawWritingPower = (modifiedAttrs.writing.lyricism + modifiedAttrs.writing.wordplay + modifiedAttrs.writing.creativity) / 3
  const rawPerformancePower = (modifiedAttrs.performance.stage_presence + modifiedAttrs.performance.crowd_control + modifiedAttrs.performance.delivery) / 3

  // Apply attribute advantage multiplier - higher attributes get amplified
  // This makes the gap between 3-tier and 8-tier battlers more pronounced
  const avgPower = (rawWritingPower + rawPerformancePower) / 2
  const advantageMultiplier = avgPower > 5
    ? 1 + (avgPower - 5) * (CONFIG.ATTRIBUTE_ADVANTAGE_MULTIPLIER - 1) / 5
    : 1 - (5 - avgPower) * (CONFIG.ATTRIBUTE_ADVANTAGE_MULTIPLIER - 1) / 5

  const writingPower = rawWritingPower * advantageMultiplier
  const performancePower = rawPerformancePower * advantageMultiplier

  // Calculate consistency (higher attributes = less variance)
  const consistencyBonus = Math.max(0, (avgPower - 7) * CONFIG.ATTRIBUTE_CONSISTENCY_BONUS)
  const effectiveVariance = CONFIG.SEGMENT_VARIANCE * (1 - consistencyBonus)

  // Determine battle format and adjust weights accordingly
  const battleFormat = league?.battle_format || 'live'
  let writingWeight = league?.writing_weight || 0.5
  let performanceWeight = league?.performance_weight || 0.5

  // Virtual league adjustments
  if (battleFormat === 'asynchronous') {
    // Text Wars: ONLY writing matters, no performance
    writingWeight = 1.0
    performanceWeight = 0.0
  } else if (battleFormat === 'recorded') {
    // App Battles: Writing still dominant, but delivery matters
    // Stage presence reduced (no live crowd), crowd control minimal
    writingWeight = 0.70
    performanceWeight = 0.30
  }

  // Simulate each segment
  for (let segmentIndex = 1; segmentIndex <= segmentsPerRound; segmentIndex++) {
    const events: string[] = []

    // Find matching V2 segment
    const v2Segment = v2Segments.find(s => s.position === segmentIndex)

    // Calculate base score
    let baseScore = writingPower * writingWeight + performancePower * performanceWeight

    // V2 segment bonuses
    if (v2Segment) {
      // Rehearsed bonus
      if (v2Segment.is_rehearsed) {
        baseScore *= 1.1
        events.push('rehearsed')
      }

      // Counter check
      if (v2Segment.is_counter && v2Segment.counter_target) {
        const counterTriggered = Math.random() < CONFIG.COUNTER_BASE_TRIGGER_CHANCE
        if (counterTriggered) {
          baseScore *= CONFIG.COUNTER_TRIGGERED_MULTIPLIER
          events.push('counter_triggered')
        } else {
          baseScore *= CONFIG.COUNTER_MISSED_MULTIPLIER
          events.push('counter_missed')
        }
      }

      // Freestyle risk/reward
      if (v2Segment.is_freestyle) {
        const freestyleRoll = Math.random()
        if (freestyleRoll > 0.7) {
          baseScore *= 1.3 // Big freestyle moment
          events.push('freestyle_fire')
        } else if (freestyleRoll < 0.2) {
          baseScore *= 0.7 // Freestyle struggle
          events.push('freestyle_struggle')
        }
      }
    }

    // Add variance (using effective variance based on consistency)
    const variance = (Math.random() - 0.5) * 2 * effectiveVariance
    let finalScore = baseScore * (1 + variance)

    // Peak check (haymaker)
    const isPeak = Math.random() < 0.15
    if (isPeak) {
      finalScore *= 1.25
      events.push('haymaker')

      // Comeback bonus: extra boost when momentum is low (underdog effect)
      if (momentum < CONFIG.MOMENTUM_COMEBACK_THRESHOLD) {
        finalScore *= CONFIG.MOMENTUM_COMEBACK_BONUS
        events.push('comeback')
      }

      // Momentum boost from haymaker
      momentum = Math.min(CONFIG.MOMENTUM_MAX, momentum + CONFIG.MOMENTUM_HAYMAKER_BONUS)
    }

    // Choke check (adjusted for battle format and momentum)
    const resilienceAboveAvg = Math.max(0, modifiedAttrs.resilience - 5)
    let chokeProb = CONFIG.CHOKE_BASE_PROBABILITY - (resilienceAboveAvg * CONFIG.CHOKE_RESILIENCE_FACTOR)

    // Momentum affects choke risk: low momentum = higher choke chance
    // Each point below 50 adds +0.3% choke risk
    if (momentum < CONFIG.MOMENTUM_STARTING) {
      chokeProb += (CONFIG.MOMENTUM_STARTING - momentum) * CONFIG.MOMENTUM_CHOKE_MODIFIER
    }

    chokeProb = Math.max(CONFIG.CHOKE_MINIMUM, Math.min(CONFIG.CHOKE_MAXIMUM, chokeProb))

    // Virtual league choke adjustments
    if (battleFormat === 'asynchronous') {
      // No choke risk in text battles (can edit before posting)
      chokeProb = 0
    } else if (battleFormat === 'recorded') {
      // Reduced choke risk in recorded battles (can re-record)
      chokeProb *= 0.3 // 70% reduction
    }

    if (Math.random() < chokeProb) {
      finalScore *= CONFIG.CHOKE_SCORE_MULTIPLIER
      events.push('choke')
      // Massive momentum loss on choke
      momentum = Math.max(CONFIG.MOMENTUM_MIN, momentum - CONFIG.MOMENTUM_CHOKE_PENALTY)
    }

    // Stumble check (only if not choked)
    if (!events.includes('choke')) {
      const stumbleProb = CONFIG.STUMBLE_BASE_PROBABILITY - (resilienceAboveAvg * 0.005)
      if (Math.random() < stumbleProb) {
        finalScore *= CONFIG.STUMBLE_SCORE_MULTIPLIER
        events.push('stumble')
        // Momentum loss on stumble (less than choke)
        momentum = Math.max(CONFIG.MOMENTUM_MIN, momentum - CONFIG.MOMENTUM_STUMBLE_PENALTY)
      }
    }

    // Clamp score
    finalScore = Math.max(CONFIG.SCORE_FLOOR, Math.min(CONFIG.SCORE_CEILING, finalScore))
    scores.push(finalScore)

    // Crowd reaction (adjusted for battle format and momentum)
    let crowdReaction: number
    if (battleFormat === 'asynchronous') {
      // Crowd reaction = voting scores (more predictable, based on quality)
      crowdReaction = Math.round((finalScore / 10) * 100)
    } else if (battleFormat === 'recorded') {
      // Voting on videos - still influenced by performance but less volatile
      crowdReaction = Math.round(
        (finalScore / 10) * 70 + (performancePower / 10) * 30 * (league?.base_crowd_factor || 1)
      )
    } else {
      // Live crowd - full performance factor with momentum boost
      let baseCrowd = (finalScore / 10) * 60 + (performancePower / 10) * 40 * (league?.base_crowd_factor || 1)

      // Momentum bonus: each point above 50 adds +0.4% crowd reaction
      if (momentum > CONFIG.MOMENTUM_STARTING) {
        baseCrowd += (momentum - CONFIG.MOMENTUM_STARTING) * CONFIG.MOMENTUM_CROWD_MODIFIER
      }

      crowdReaction = Math.round(baseCrowd)
    }

    // Update momentum based on segment performance
    // Good segments (7+) build momentum, poor segments (<5) lose momentum
    if (finalScore >= 7) {
      const gain = (finalScore - 6) * CONFIG.MOMENTUM_GAIN_MULTIPLIER
      momentum = Math.min(CONFIG.MOMENTUM_MAX, momentum + gain)
    } else if (finalScore < 5) {
      const loss = (5 - finalScore) * CONFIG.MOMENTUM_GAIN_MULTIPLIER
      momentum = Math.max(CONFIG.MOMENTUM_MIN, momentum - loss)
    }

    segmentResults.push({
      round_index: roundIndex,
      segment_index: segmentIndex,
      battler_id: battlerId,
      segment_score: Number(finalScore.toFixed(2)),
      event_flags: events,
      crowd_reaction: Math.min(100, Math.max(0, crowdReaction)),
      momentum: Math.round(momentum),
    })
  }

  // Handle edge case: no segments (shouldn't happen, but prevent division by zero)
  if (scores.length === 0) {
    return {
      summary: {
        round_index: roundIndex,
        battler_id: battlerId,
        average_score: 0,
        peak_score: 0,
        consistency_score: 0,
        crowd_reaction: 0,
        choked: false,
      },
      segments: [],
    }
  }

  // Calculate round summary
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const peakScore = Math.max(...scores)
  const stdDev = Math.sqrt(scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length)
  const consistencyScore = Math.max(0, Math.min(10, 10 - stdDev))
  const avgCrowd = segmentResults.reduce((sum, s) => sum + s.crowd_reaction, 0) / segmentResults.length

  // Get final momentum from last segment
  const finalMomentum = segmentResults.length > 0
    ? segmentResults[segmentResults.length - 1].momentum || CONFIG.MOMENTUM_STARTING
    : CONFIG.MOMENTUM_STARTING

  return {
    summary: {
      round_index: roundIndex,
      battler_id: battlerId,
      average_score: Number(avgScore.toFixed(2)),
      peak_score: Number(peakScore.toFixed(2)),
      consistency_score: Number(consistencyScore.toFixed(2)),
      crowd_reaction: Math.round(avgCrowd),
      choked: segmentResults.some(s => s.event_flags.includes('choke')),
      final_momentum: Math.round(finalMomentum),
    },
    segments: segmentResults,
  }
}

function calculateCompositeScore(round: RoundResult): number {
  const normalizedCrowd = (round.crowd_reaction / 100) * CONFIG.ROUND_JUDGING_CROWD_SCALE
  return (
    round.average_score * CONFIG.ROUND_JUDGING_AVERAGE_WEIGHT +
    round.peak_score * CONFIG.ROUND_JUDGING_PEAK_WEIGHT +
    normalizedCrowd * CONFIG.ROUND_JUDGING_CROWD_WEIGHT
  )
}

async function updateCounterResults(
  supabase: any,
  battleId: string,
  counters: PrepCounter[],
  aiRounds: RoundResult[]
) {
  // For each counter, determine if it was triggered based on AI content
  // In a more complex system, we'd track actual AI content
  // For now, use random with base trigger chance
  for (const counter of counters) {
    const triggered = Math.random() < CONFIG.COUNTER_BASE_TRIGGER_CHANCE
    const effective = triggered && Math.random() > 0.3 // 70% effective if triggered

    await supabase
      .from('prep_counters')
      .update({
        was_triggered: triggered,
        was_effective: effective,
      })
      .eq('id', counter.id)
  }
}

async function saveBattleResults(
  supabase: any,
  battleId: string,
  winnerId: string,
  playerRounds: RoundResult[],
  aiRounds: RoundResult[],
  segments: SegmentResult[],
  battle: any,
  verdict: string
) {
  // Fetch current rankings to calculate rating changes
  const { data: playerRanking } = await supabase
    .from('rankings')
    .select('*')
    .eq('battler_id', battle.battler_player_id)
    .single()

  const { data: aiRanking } = await supabase
    .from('rankings')
    .select('*')
    .eq('battler_id', battle.battler_ai_id)
    .single()

  // Calculate rating changes
  const playerWon = winnerId === battle.battler_player_id
  const playerOldRating = playerRanking?.rating || 1000
  const aiOldRating = aiRanking?.rating || 1000

  const playerNewRating = calculateNewRating(playerOldRating, aiOldRating, playerWon)
  const aiNewRating = calculateNewRating(aiOldRating, playerOldRating, !playerWon)

  const playerRatingChange = playerNewRating - playerOldRating
  const aiRatingChange = aiNewRating - aiOldRating

  // Format rounds data for RPC (PostgreSQL composite type)
  const formattedPlayerRounds = playerRounds.map(r => ({
    battle_id: battleId,
    battler_id: r.battler_id,
    round_index: r.round_index,
    average_score: r.average_score,
    peak_score: r.peak_score,
    consistency_score: r.consistency_score,
    crowd_reaction: r.crowd_reaction,
    choke: r.choked || false,
  }))

  const formattedAiRounds = aiRounds.map(r => ({
    battle_id: battleId,
    battler_id: r.battler_id,
    round_index: r.round_index,
    average_score: r.average_score,
    peak_score: r.peak_score,
    consistency_score: r.consistency_score,
    crowd_reaction: r.crowd_reaction,
    choke: r.choked || false,
  }))

  // Format segments data for RPC (PostgreSQL composite type)
  const formattedSegments = segments.map(s => ({
    battle_id: battleId,
    battler_id: s.battler_id,
    round_index: s.round_index,
    segment_index: s.segment_index,
    score: s.segment_score,  // ✓ Fix: use segment_score field
    choke: s.event_flags.includes('choke'),  // ✓ Fix: check event_flags array
    stumble: s.event_flags.includes('stumble'),  // ✓ Fix: check event_flags array
  }))

  // Call atomic RPC function to save all battle results
  // This ensures ALL operations succeed or ALL rollback
  const { data, error } = await supabase.rpc('save_battle_results', {
    p_battle_id: battleId,
    p_winner_id: winnerId,
    p_verdict: verdict,
    p_player_rounds: formattedPlayerRounds,
    p_ai_rounds: formattedAiRounds,
    p_segments: formattedSegments,
    p_player_rating_change: playerRatingChange,
    p_ai_rating_change: aiRatingChange,
  })

  if (error) {
    console.error('Failed to save battle results atomically:', error)
    throw new Error(`Battle results save failed: ${error.message}`)
  }

  return data
}

function calculateNewRating(playerRating: number, opponentRating: number, won: boolean): number {
  // Clamp rating difference to prevent overflow in exponentiation
  const ratingDiff = Math.max(-1000, Math.min(1000, opponentRating - playerRating))
  const expected = 1 / (1 + Math.pow(10, ratingDiff / 400))
  const actual = won ? 1 : 0
  const newRating = Math.round(playerRating + CONFIG.RATING_K_FACTOR * (actual - expected))
  // Cap rating to documented game range (1200-2500)
  return Math.max(0, Math.min(2500, newRating))
}
