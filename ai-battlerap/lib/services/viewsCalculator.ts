/**
 * Views Calculation Service
 *
 * Calculates battle view counts based on multiple factors:
 * - Battler fan base (hardcore + casual)
 * - League subscriber base
 * - Opponent's fan base
 * - Viral discovery (performance quality, upsets, controversy)
 * - Scandal boost (drama multiplier)
 *
 * Based on real battle rap data from versetracker.com
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// View Tier Thresholds (Real Data)
// ============================================================================

export const VIEW_TIER_THRESHOLDS = {
  low: {
    min: 1_000,
    max: 20_000,
    avgReference: 12_925, // Tru Foe actual average
  },
  mid: {
    min: 50_000,
    max: 200_000,
    avgReference: 129_565, // Loso actual average
  },
  top: {
    min: 300_000,
    max: 800_000,
    avgReference: 577_539, // T-Top actual average
  },
  goat: {
    min: 600_000,
    max: Infinity,
    avgReference: 1_247_059, // Charlie Clips actual average
  },
} as const;

// ============================================================================
// Viral Triggers (Bonus Views)
// ============================================================================

export const VIRAL_TRIGGERS = {
  perfect_performance: 50_000, // 9.0+ avg, 9.5+ peak
  bodybag: 25_000, // 3-0 dominant win
  choke: 30_000, // Choking is viral content
  beef: 40_000, // Pre-existing beef
  rivalry: 35_000, // Ongoing rivalry
  tournament_final: 20_000, // Tournament championship
  comeback: 15_000, // Won after being down
  upset: 20_000, // Lower-rated battler wins
  gentleman_30: 10_000, // Classic close battle
} as const;

// ============================================================================
// Interfaces
// ============================================================================

export interface BattlerFanData {
  battler_id: string;
  total_fans: number;
  hardcore_fans: number;
  casual_fans: number;
  trending_score: number;
  avg_hype_multiplier: number;
}

export interface LeagueAudienceData {
  league_id: string;
  total_subscribers: number;
  active_subscribers: number;
  avg_views_per_battle: number;
  prestige_score: number;
}

export interface BattlePerformanceData {
  winner_battler_id: string;
  loser_battler_id: string;
  verdict: string;
  player_avg_score: number;
  player_peak_score: number;
  ai_avg_score: number;
  ai_peak_score: number;
  player_choked: boolean;
  ai_choked: boolean;
  tournament_id: string | null;
  is_final: boolean;
}

export interface ViewCalculationResult {
  total_views: number;
  from_fan_base: number;
  from_league_subscribers: number;
  from_opponent_fans: number;
  from_viral_discovery: number;
  from_scandal_boost: number;
  viral_multiplier: number;
  scandal_multiplier: number;
  quality_multiplier: number;
  view_tier: 'low' | 'mid' | 'top' | 'goat';
}

export interface FanGrowthResult {
  fans_gained: number;
  fans_lost: number;
  net_change: number;
  new_hardcore_fans: number;
  new_casual_fans: number;
  trending_score_change: number;
}

// ============================================================================
// View Calculation Functions
// ============================================================================

/**
 * Calculate total views for a battle
 */
export function calculateBattleViews(
  playerFans: BattlerFanData,
  opponentFans: BattlerFanData,
  leagueAudience: LeagueAudienceData,
  performance: BattlePerformanceData,
  scandalLevel: number = 0 // 0-10 scale
): ViewCalculationResult {
  // 1. FAN BASE VIEWS
  // Hardcore fans always watch (100% conversion)
  // Casual fans watch based on hype multiplier (affected by trending score)
  const playerHypeMultiplier = calculateHypeMultiplier(
    playerFans.avg_hype_multiplier,
    playerFans.trending_score
  );

  const fromFanBase =
    playerFans.hardcore_fans + Math.floor(playerFans.casual_fans * playerHypeMultiplier);

  // 2. LEAGUE SUBSCRIBER VIEWS
  // Big leagues bring their own audience (50% of avg views per battle)
  const fromLeagueSubscribers = Math.floor(leagueAudience.avg_views_per_battle * 0.5);

  // 3. OPPONENT FAN VIEWS
  // Opponent's fans tune in (30% of hardcore fans, 10% of casual)
  const fromOpponentFans = Math.floor(
    opponentFans.hardcore_fans * 0.3 + opponentFans.casual_fans * 0.1
  );

  // 4. VIRAL DISCOVERY VIEWS
  const viralBonus = calculateViralBonus(performance, playerFans, opponentFans);
  const fromViralDiscovery = viralBonus;

  // 5. SCANDAL BOOST
  // Drama/controversy multiplier (1.0x to 3.0x)
  const scandalMultiplier = 1 + Math.min(scandalLevel / 10, 1.0) * 2.0; // 1.0x to 3.0x
  const baseViews = fromFanBase + fromLeagueSubscribers + fromOpponentFans + fromViralDiscovery;
  const scandalBoostViews = Math.floor(baseViews * (scandalMultiplier - 1));
  const fromScandalBoost = scandalBoostViews;

  // 6. QUALITY MULTIPLIER
  const qualityMultiplier = calculateQualityMultiplier(performance);

  // 7. VIRAL MULTIPLIER (based on viral triggers)
  const viralMultiplier = 1 + viralBonus / Math.max(baseViews, 1000);

  // TOTAL VIEWS
  const totalViews = Math.floor(
    (baseViews + fromScandalBoost) * qualityMultiplier
  );

  // VIEW TIER CLASSIFICATION
  const viewTier = classifyViewTier(totalViews);

  return {
    total_views: totalViews,
    from_fan_base: fromFanBase,
    from_league_subscribers: fromLeagueSubscribers,
    from_opponent_fans: fromOpponentFans,
    from_viral_discovery: fromViralDiscovery,
    from_scandal_boost: fromScandalBoost,
    viral_multiplier: viralMultiplier,
    scandal_multiplier: scandalMultiplier,
    quality_multiplier: qualityMultiplier,
    view_tier: viewTier,
  };
}

/**
 * Calculate hype multiplier for casual fans
 * Higher trending score = more casual fans watch
 */
function calculateHypeMultiplier(
  baseMultiplier: number,
  trendingScore: number
): number {
  // Trending score 0-100, adds up to +0.4 to base multiplier
  const trendingBonus = (trendingScore / 100) * 0.4;
  return Math.min(1.0, baseMultiplier + trendingBonus);
}

/**
 * Calculate viral bonus views from battle performance
 */
function calculateViralBonus(
  performance: BattlePerformanceData,
  playerFans: BattlerFanData,
  opponentFans: BattlerFanData
): number {
  let viralBonus = 0;

  // PERFECT PERFORMANCE: 9.0+ avg, 9.5+ peak
  const isPerfect =
    performance.player_avg_score >= 9.0 && performance.player_peak_score >= 9.5;
  if (isPerfect) {
    viralBonus += VIRAL_TRIGGERS.perfect_performance;
  }

  // BODYBAG: 3-0 dominant win
  if (performance.verdict === 'bodybag') {
    viralBonus += VIRAL_TRIGGERS.bodybag;
  }

  // CHOKE: Choking is viral content
  if (performance.player_choked || performance.ai_choked) {
    viralBonus += VIRAL_TRIGGERS.choke;
  }

  // GENTLEMAN'S 30: Classic close battle
  if (performance.verdict === 'gentlemans_30') {
    viralBonus += VIRAL_TRIGGERS.gentleman_30;
  }

  // UPSET: Lower-rated battler wins (based on fan base as proxy for rating)
  const isUpset =
    performance.winner_battler_id === (performance as any).player_battler_id &&
    playerFans.total_fans < opponentFans.total_fans * 0.7;
  if (isUpset) {
    viralBonus += VIRAL_TRIGGERS.upset;
  }

  // TOURNAMENT FINAL
  if (performance.tournament_id && performance.is_final) {
    viralBonus += VIRAL_TRIGGERS.tournament_final;
  }

  return viralBonus;
}

/**
 * Calculate quality multiplier based on performance
 * High quality = more shares/rewatches (0.5x to 2.0x)
 */
function calculateQualityMultiplier(performance: BattlePerformanceData): number {
  // Base: 1.0x
  let multiplier = 1.0;

  // High average scores boost views (+0.3x per point above 7.0)
  const avgScore = (performance.player_avg_score + performance.ai_avg_score) / 2;
  if (avgScore >= 7.0) {
    multiplier += (avgScore - 7.0) * 0.15;
  }

  // Low average scores hurt views (-0.2x per point below 5.0)
  if (avgScore < 5.0) {
    multiplier -= (5.0 - avgScore) * 0.1;
  }

  // Clamp to 0.5x - 2.0x
  return Math.max(0.5, Math.min(2.0, multiplier));
}

/**
 * Classify view tier based on total views
 */
export function classifyViewTier(totalViews: number): 'low' | 'mid' | 'top' | 'goat' {
  if (totalViews >= VIEW_TIER_THRESHOLDS.goat.min) return 'goat';
  if (totalViews >= VIEW_TIER_THRESHOLDS.top.min) return 'top';
  if (totalViews >= VIEW_TIER_THRESHOLDS.mid.min) return 'mid';
  return 'low';
}

// ============================================================================
// Fan Growth Functions
// ============================================================================

/**
 * Calculate fan growth/churn after a battle
 */
export function calculateFanGrowth(
  currentFans: BattlerFanData,
  views: ViewCalculationResult,
  performance: BattlePerformanceData,
  battlerId: string
): FanGrowthResult {
  const isWinner = performance.winner_battler_id === battlerId;
  const isLoser = performance.loser_battler_id === battlerId;

  // BASE CONVERSION RATE: 2% of new viewers become fans
  const baseConversionRate = 0.02;

  // PERFORMANCE MODIFIERS
  let conversionModifier = 1.0;

  if (isWinner) {
    // Winners gain more fans
    conversionModifier += 0.5; // +50%

    // Dominant wins gain even more
    if (performance.verdict === 'bodybag') {
      conversionModifier += 0.5; // +100% total
    }
  }

  if (isLoser) {
    // Losers still gain fans if they performed well
    const loserAvg = isWinner ? performance.ai_avg_score : performance.player_avg_score;
    if (loserAvg >= 7.0) {
      conversionModifier += 0.2; // +20% for strong loss
    } else {
      conversionModifier -= 0.3; // -30% for poor loss
    }
  }

  // Chokes hurt fan growth significantly
  const didChoke = isWinner
    ? performance.player_choked
    : performance.ai_choked;
  if (didChoke) {
    conversionModifier -= 0.7; // -70% for choking
  }

  // CALCULATE NEW FANS
  const newViewers = Math.max(
    0,
    views.from_viral_discovery + views.from_opponent_fans
  );
  const totalNewFans = Math.floor(
    newViewers * baseConversionRate * Math.max(0.1, conversionModifier)
  );

  // FAN SEGMENTATION: 30% hardcore, 70% casual
  const newHardcoreFans = Math.floor(totalNewFans * 0.3);
  const newCasualFans = Math.floor(totalNewFans * 0.7);

  // FAN CHURN (losing fans)
  let fansLost = 0;

  if (isLoser) {
    // Lose 1-3% of casual fans on losses
    const churnRate = didChoke ? 0.03 : 0.01;
    fansLost = Math.floor(currentFans.casual_fans * churnRate);
  }

  // TRENDING SCORE CHANGE
  let trendingScoreChange = 0;

  if (views.view_tier === 'goat') {
    trendingScoreChange = +15; // Viral battle
  } else if (views.view_tier === 'top') {
    trendingScoreChange = +10;
  } else if (views.view_tier === 'mid') {
    trendingScoreChange = +5;
  }

  if (didChoke) {
    trendingScoreChange -= 20; // Chokes hurt momentum
  }

  // Clamp trending score to 0-100
  trendingScoreChange = Math.max(
    -currentFans.trending_score,
    Math.min(100 - currentFans.trending_score, trendingScoreChange)
  );

  return {
    fans_gained: totalNewFans,
    fans_lost: fansLost,
    net_change: totalNewFans - fansLost,
    new_hardcore_fans: newHardcoreFans,
    new_casual_fans: newCasualFans,
    trending_score_change: trendingScoreChange,
  };
}

// ============================================================================
// Database Integration Functions
// ============================================================================

/**
 * Calculate and save battle views to database
 */
export async function calculateAndSaveBattleViews(
  supabase: SupabaseClient,
  battleId: string,
  playerBattlerId: string,
  aiBattlerId: string,
  leagueId: string,
  performance: BattlePerformanceData,
  scandalLevel: number = 0
): Promise<ViewCalculationResult | null> {
  try {
    // 1. Fetch player fan data
    const { data: playerFans } = await supabase
      .from('battler_fans')
      .select('*')
      .eq('battler_id', playerBattlerId)
      .single();

    if (!playerFans) {
      console.error('Player fan data not found');
      return null;
    }

    // 2. Fetch opponent fan data
    const { data: opponentFans } = await supabase
      .from('battler_fans')
      .select('*')
      .eq('battler_id', aiBattlerId)
      .single();

    if (!opponentFans) {
      console.error('Opponent fan data not found');
      return null;
    }

    // 3. Fetch league audience data
    const { data: leagueAudience } = await supabase
      .from('league_audience')
      .select('*')
      .eq('league_id', leagueId)
      .single();

    if (!leagueAudience) {
      console.error('League audience data not found');
      return null;
    }

    // 4. Calculate views
    const viewResult = calculateBattleViews(
      playerFans,
      opponentFans,
      leagueAudience,
      performance,
      scandalLevel
    );

    // 5. Save to database
    await supabase.from('battle_views').insert({
      battle_id: battleId,
      total_views: viewResult.total_views,
      from_fan_base: viewResult.from_fan_base,
      from_league_subscribers: viewResult.from_league_subscribers,
      from_opponent_fans: viewResult.from_opponent_fans,
      from_viral_discovery: viewResult.from_viral_discovery,
      from_scandal_boost: viewResult.from_scandal_boost,
      viral_multiplier: viewResult.viral_multiplier,
      scandal_multiplier: viewResult.scandal_multiplier,
      quality_multiplier: viewResult.quality_multiplier,
      view_tier: viewResult.view_tier,
    });

    // 6. Update fan bases for both battlers
    await updateBattlerFans(supabase, playerBattlerId, playerFans, viewResult, performance);
    await updateBattlerFans(supabase, aiBattlerId, opponentFans, viewResult, performance);

    return viewResult;
  } catch (error) {
    console.error('Error calculating battle views:', error);
    return null;
  }
}

/**
 * Update battler fan data after a battle
 */
async function updateBattlerFans(
  supabase: SupabaseClient,
  battlerId: string,
  currentFans: BattlerFanData,
  views: ViewCalculationResult,
  performance: BattlePerformanceData
): Promise<void> {
  const fanGrowth = calculateFanGrowth(currentFans, views, performance, battlerId);

  const newTotalFans = currentFans.total_fans + fanGrowth.net_change;
  const newHardcoreFans = currentFans.hardcore_fans + fanGrowth.new_hardcore_fans;
  const newCasualFans = Math.max(
    0,
    currentFans.casual_fans + fanGrowth.new_casual_fans - fanGrowth.fans_lost
  );
  const newTrendingScore = Math.max(
    0,
    Math.min(100, currentFans.trending_score + fanGrowth.trending_score_change)
  );

  // Calculate new fan growth rate (rolling average)
  const newFanGrowthRate =
    ((currentFans as any).fan_growth_rate * 0.7 + (fanGrowth.net_change / currentFans.total_fans) * 100 * 0.3);

  await supabase
    .from('battler_fans')
    .update({
      total_fans: newTotalFans,
      hardcore_fans: newHardcoreFans,
      casual_fans: newCasualFans,
      trending_score: newTrendingScore,
      fan_growth_rate: newFanGrowthRate,
      updated_at: new Date().toISOString(),
    })
    .eq('battler_id', battlerId);
}
