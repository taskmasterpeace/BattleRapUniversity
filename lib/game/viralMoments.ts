/**
 * Viral Moments System
 *
 * Handles:
 * - Detecting when moments go viral
 * - Triggering storylines based on viral content
 * - Updating reputation and beef
 * - Generating social media reactions
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Viral moment types
export type ViralMomentType =
  | 'haymaker_reaction'    // Crowd went crazy for a bar
  | 'devastating_body'     // 3-0 with high scores
  | 'epic_choke'           // Embarrassing choke
  | 'comeback_story'       // Came from behind to win
  | 'crowd_control'        // Dominated the room
  | 'controversy'          // Debatable result caused drama
  | 'upset'                // Lower-rated battler won

export interface ViralMoment {
  type: ViralMomentType
  description: string
  viralScore: number // 0-100, determines how viral it goes
  reputationChange: number
  beefIncrease: number
  newsworthy: boolean
}

/**
 * Check if a battle produced viral moments
 */
export async function checkForViralMoments(
  battleId: string,
  playerId: string,
  opponentId: string
): Promise<ViralMoment[]> {
  const viralMoments: ViralMoment[] = []

  // Fetch battle data
  const { data: battle } = await supabase
    .from('battles')
    .select(`
      *,
      battle_rounds(*),
      battle_segments(*)
    `)
    .eq('id', battleId)
    .single()

  if (!battle) return viralMoments

  // Fetch battler names
  const { data: playerData } = await supabase
    .from('battlers')
    .select('stage_name')
    .eq('id', playerId)
    .single()

  const { data: opponentData } = await supabase
    .from('battlers')
    .select('stage_name')
    .eq('id', opponentId)
    .single()

  const playerName = playerData?.stage_name || 'Player'
  const opponentName = opponentData?.stage_name || 'Opponent'

  const playerWon = battle.winner_battler_id === playerId
  const playerRounds = battle.battle_rounds?.filter((r: any) => r.battler_id === playerId) || []
  const opponentRounds = battle.battle_rounds?.filter((r: any) => r.battler_id === opponentId) || []
  const playerSegments = battle.battle_segments?.filter((s: any) => s.battler_id === playerId) || []

  // Calculate metrics
  const playerRoundWins = playerRounds.filter((r: any) =>
    r.average_score > (opponentRounds.find((or: any) => or.round_index === r.round_index)?.average_score || 0)
  ).length
  const opponentRoundWins = opponentRounds.filter((r: any) =>
    r.average_score > (playerRounds.find((pr: any) => pr.round_index === r.round_index)?.average_score || 0)
  ).length

  const haymakers = playerSegments.filter((s: any) => s.segment_score >= 8.5)
  const chokes = playerSegments.filter((s: any) => s.choked)
  const avgCrowd = playerRounds.reduce((sum: number, r: any) => sum + (r.crowd_reaction || 0), 0) / Math.max(playerRounds.length, 1)
  const peakScore = Math.max(...playerRounds.map((r: any) => r.peak_score || 0), 0)

  // Check for viral moment conditions

  // 1. Haymaker Reaction - Multiple haymakers with high crowd reaction
  if (haymakers.length >= 2 && avgCrowd >= 80) {
    viralMoments.push({
      type: 'haymaker_reaction',
      description: `${playerName}'s bars are going viral! Multiple haymakers had the crowd losing their minds.`,
      viralScore: Math.min(100, 60 + haymakers.length * 10 + (avgCrowd - 80)),
      reputationChange: 5 + haymakers.length,
      beefIncrease: 5,
      newsworthy: true,
    })
  }

  // 2. Devastating Body - 3-0 with high scores
  if (playerWon && playerRoundWins === 3 && peakScore >= 8.5) {
    viralMoments.push({
      type: 'devastating_body',
      description: `${playerName} just gave ${opponentName} the BODY of the year! 3-0 with no debate.`,
      viralScore: Math.min(100, 70 + (peakScore - 8) * 10),
      reputationChange: 10,
      beefIncrease: 20, // Bodies create beef
      newsworthy: true,
    })
  }

  // 3. Epic Choke - Choked during battle
  if (chokes.length > 0) {
    viralMoments.push({
      type: 'epic_choke',
      description: `${playerName} choked on stage! The clip is spreading fast on social media.`,
      viralScore: Math.min(100, 50 + chokes.length * 20),
      reputationChange: -10 - chokes.length * 3,
      beefIncrease: 15,
      newsworthy: true,
    })
  }

  // 4. Comeback Story - Won after losing early rounds
  if (playerWon && playerRoundWins === 2 && opponentRoundWins >= 1) {
    const firstRoundScore = playerRounds.find((r: any) => r.round_index === 1)?.average_score || 0
    const opponentFirstRound = opponentRounds.find((r: any) => r.round_index === 1)?.average_score || 0

    if (firstRoundScore < opponentFirstRound) {
      viralMoments.push({
        type: 'comeback_story',
        description: `${playerName} pulled off the COMEBACK! Down early but came back to take it 2-1.`,
        viralScore: 65,
        reputationChange: 8,
        beefIncrease: 10,
        newsworthy: true,
      })
    }
  }

  // 5. Crowd Control - Dominated crowd reactions
  if (avgCrowd >= 90) {
    viralMoments.push({
      type: 'crowd_control',
      description: `${playerName} had the crowd in the palm of their hand. The room was going CRAZY.`,
      viralScore: Math.min(100, 50 + avgCrowd - 50),
      reputationChange: 6,
      beefIncrease: 0,
      newsworthy: avgCrowd >= 95,
    })
  }

  // 6. Controversy - Close battle with potential for debate
  if (Math.abs(playerRoundWins - opponentRoundWins) <= 1) {
    const totalPlayerScore = playerRounds.reduce((sum: number, r: any) => sum + (r.average_score || 0), 0)
    const totalOpponentScore = opponentRounds.reduce((sum: number, r: any) => sum + (r.average_score || 0), 0)
    const scoreDiff = Math.abs(totalPlayerScore - totalOpponentScore)

    if (scoreDiff < 1.5) {
      viralMoments.push({
        type: 'controversy',
        description: `The ${playerName} vs ${opponentName} battle is DEBATABLE. Fans are split on who won.`,
        viralScore: 55,
        reputationChange: 0, // Controversy doesn't help or hurt rep
        beefIncrease: 25, // But it definitely increases beef
        newsworthy: true,
      })
    }
  }

  // 7. Upset - Lower-rated battler won
  // Would need to fetch ratings to check this properly

  return viralMoments
}

/**
 * Apply viral moment effects
 */
export async function applyViralMomentEffects(
  battleId: string,
  playerId: string,
  opponentId: string,
  viralMoments: ViralMoment[]
): Promise<void> {
  if (viralMoments.length === 0) return

  // Calculate total effects
  const totalRepChange = viralMoments.reduce((sum, m) => sum + m.reputationChange, 0)
  const totalBeefIncrease = viralMoments.reduce((sum, m) => sum + m.beefIncrease, 0)
  const maxViralScore = Math.max(...viralMoments.map(m => m.viralScore))

  // Update player reputation
  if (totalRepChange !== 0) {
    const { data: currentAttrs } = await supabase
      .from('battler_attributes')
      .select('personal')
      .eq('battler_id', playerId)
      .single()

    if (currentAttrs) {
      const personal = currentAttrs.personal as any || {}
      const newRep = Math.max(0, Math.min(10, (personal.reputation || 5) + totalRepChange / 10))

      await supabase
        .from('battler_attributes')
        .update({
          personal: { ...personal, reputation: newRep }
        })
        .eq('battler_id', playerId)
    }
  }

  // Update beef between battlers
  if (totalBeefIncrease > 0) {
    const [orderedA, orderedB] = [playerId, opponentId].sort()

    const { data: existingBeef } = await supabase
      .from('battler_relationships')
      .select('id, intensity, rematch_demand')
      .eq('battler_a_id', orderedA)
      .eq('battler_b_id', orderedB)
      .maybeSingle()

    if (existingBeef) {
      const newIntensity = Math.min(100, existingBeef.intensity + totalBeefIncrease)
      const newRematchDemand = Math.min(100, existingBeef.rematch_demand + Math.floor(totalBeefIncrease / 2))

      await supabase
        .from('battler_relationships')
        .update({
          intensity: newIntensity,
          rematch_demand: newRematchDemand,
          status: 'active',
        })
        .eq('id', existingBeef.id)
    } else {
      // Get battler names for origin story
      const { data: player } = await supabase
        .from('battlers')
        .select('stage_name')
        .eq('id', playerId)
        .single()

      const { data: opponent } = await supabase
        .from('battlers')
        .select('stage_name')
        .eq('id', opponentId)
        .single()

      const viralDescription = viralMoments[0]?.description || 'Their battle created tension'

      await supabase
        .from('battler_relationships')
        .insert({
          battler_a_id: orderedA,
          battler_b_id: orderedB,
          intensity: totalBeefIncrease,
          rematch_demand: Math.floor(totalBeefIncrease / 2),
          status: 'active',
          origin_type: 'battle',
          origin_story: viralDescription,
          origin_battle_id: battleId,
        })
    }
  }

  // Create news articles for newsworthy moments
  const newsworthyMoments = viralMoments.filter(m => m.newsworthy)
  if (newsworthyMoments.length > 0) {
    const topMoment = newsworthyMoments.sort((a, b) => b.viralScore - a.viralScore)[0]

    // Record viral moment metadata in battle
    await supabase
      .from('battles')
      .update({
        meta_json: {
          viral_moments: viralMoments.map(m => ({
            type: m.type,
            description: m.description,
            viral_score: m.viralScore,
          })),
        },
      })
      .eq('id', battleId)
  }
}

/**
 * Check if beef should trigger a grudge match offer
 */
export async function checkForGrudgeMatchOffer(
  battlerAId: string,
  battlerBId: string
): Promise<boolean> {
  const [orderedA, orderedB] = [battlerAId, battlerBId].sort()

  const { data: relationship } = await supabase
    .from('battler_relationships')
    .select('intensity, rematch_demand, status')
    .eq('battler_a_id', orderedA)
    .eq('battler_b_id', orderedB)
    .maybeSingle()

  if (!relationship) return false

  // Trigger grudge match if:
  // - Intensity >= 60 OR
  // - Rematch demand >= 70
  return relationship.intensity >= 60 || relationship.rematch_demand >= 70
}

/**
 * Create a grudge match battle offer
 */
export async function createGrudgeMatchOffer(
  challengerId: string,
  targetId: string,
  leagueId: string
): Promise<string | null> {
  // Get battler names
  const { data: challenger } = await supabase
    .from('battlers')
    .select('stage_name')
    .eq('id', challengerId)
    .single()

  const { data: target } = await supabase
    .from('battlers')
    .select('stage_name')
    .eq('id', targetId)
    .single()

  // Get beef data
  const [orderedA, orderedB] = [challengerId, targetId].sort()
  const { data: relationship } = await supabase
    .from('battler_relationships')
    .select('intensity, origin_story')
    .eq('battler_a_id', orderedA)
    .eq('battler_b_id', orderedB)
    .maybeSingle()

  // Schedule battle 7 days from now
  const scheduledAt = new Date()
  scheduledAt.setDate(scheduledAt.getDate() + 7)

  const { data: battle, error } = await supabase
    .from('battles')
    .insert({
      player_battler_id: challengerId,
      opponent_battler_id: targetId,
      league_id: leagueId,
      status: 'offered',
      scheduled_at: scheduledAt.toISOString(),
      is_grudge_match: true,
      stakes_multiplier: 1.5, // Grudge matches have 50% bonus stakes
      meta_json: {
        offer_type: 'grudge_match',
        beef_intensity: relationship?.intensity || 50,
        offer_reason: `The fans are demanding ${challenger?.stage_name || 'you'} vs ${target?.stage_name || 'them'} again!`,
      },
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating grudge match:', error)
    return null
  }

  return battle?.id || null
}
