/**
 * Payment Calculator
 * Calculates battle payouts based on tier, league, and performance
 */

export interface PaymentFactors {
  tier: 'low' | 'mid' | 'top' | 'god';
  leagueType: 'Small Room Circuit' | 'Main Stage Arena';
  wonBattle: boolean;
  isTournament?: boolean;
}

/**
 * Base payout rates by tier
 *
 * Low tier: $750 - Entry level battlers
 * Mid tier: $3,000 - Established battlers
 * Top tier: $15,000 - Elite battlers
 * God tier: $70,000 - Legendary battlers
 */
const BASE_PAYOUTS = {
  low: 750,
  mid: 3000,
  top: 15000,
  god: 70000,
} as const;

/**
 * League multipliers
 *
 * Main Stage Arena: 1.5x payout (bigger venue, more prestige)
 * Small Room Circuit: 1.0x payout (base rate)
 */
const LEAGUE_MULTIPLIERS = {
  'Main Stage Arena': 1.5,
  'Small Room Circuit': 1.0,
} as const;

/**
 * Battle rap law: the winner does NOT get paid more.
 *
 * Pay is a negotiated flat booking fee — you get your bag win or lose.
 * Winning pays off in rating, reputation, and bigger FUTURE bookings,
 * never the current purse. (`wonBattle` stays on PaymentFactors for API
 * compatibility but has no effect on money.)
 */

/**
 * Calculate battle payout for a battler
 *
 * Formula:
 * basePayout = BASE_PAYOUTS[tier]
 * finalPayout = basePayout × LEAGUE_MULTIPLIERS[leagueType]
 *
 * Examples:
 * - Low tier, Small Room (win or lose): $750
 * - Mid tier, Main Stage (win or lose): $3,000 × 1.5 = $4,500
 * - God tier, Main Stage (win or lose): $70,000 × 1.5 = $105,000
 */
export function calculateBattlePayout(factors: PaymentFactors): number {
  const { tier, leagueType, isTournament } = factors;

  // Tournament payouts handled separately (prize pools)
  if (isTournament) {
    return 0; // No per-battle payout in tournaments
  }

  // Get base payout for tier
  const basePayout = BASE_PAYOUTS[tier];

  // Apply league multiplier — that's the whole formula. Flat rate, win or lose.
  const leagueMultiplier = LEAGUE_MULTIPLIERS[leagueType] || 1.0;
  return Math.round(basePayout * leagueMultiplier);
}

/**
 * Get payout breakdown for display
 *
 * Returns itemized breakdown showing how payout was calculated
 */
export function getPayoutBreakdown(factors: PaymentFactors) {
  const { tier, leagueType } = factors;

  const basePayout = BASE_PAYOUTS[tier];
  const leagueMultiplier = LEAGUE_MULTIPLIERS[leagueType] || 1.0;
  const leaguePayout = basePayout * leagueMultiplier;
  const finalPayout = calculateBattlePayout(factors);

  return {
    base: basePayout,
    leagueBonus: leaguePayout - basePayout,
    winBonus: 0, // flat rate — the winner doesn't get paid more
    total: finalPayout,
    breakdown: [
      { label: `${tier.toUpperCase()} Tier Base`, amount: basePayout },
      ...(leagueMultiplier > 1
        ? [{ label: 'Main Stage Bonus (+50%)', amount: leaguePayout - basePayout }]
        : []),
    ],
  };
}

/**
 * Determine tier from battler rating
 *
 * Low: 0-1399
 * Mid: 1400-1699
 * Top: 1700-1899
 * God: 1900+
 */
export function getTierFromRating(rating: number): 'low' | 'mid' | 'top' | 'god' {
  if (rating >= 1900) return 'god';
  if (rating >= 1700) return 'top';
  if (rating >= 1400) return 'mid';
  return 'low';
}

/**
 * Get expected payout range for a battler
 *
 * Returns min (loss in Small Room) and max (win in Main Stage) payouts
 */
export function getPayoutRange(tier: 'low' | 'mid' | 'top' | 'god') {
  const minPayout = calculateBattlePayout({
    tier,
    leagueType: 'Small Room Circuit',
    wonBattle: false,
  });

  const maxPayout = calculateBattlePayout({
    tier,
    leagueType: 'Main Stage Arena',
    wonBattle: true,
  });

  return { min: minPayout, max: maxPayout };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate annual earning potential
 *
 * Estimates potential annual earnings based on:
 * - Tier
 * - Win rate
 * - Battles per year
 */
export function calculateAnnualEarnings(
  tier: 'low' | 'mid' | 'top' | 'god',
  winRate: number = 0.5,
  battlesPerYear: number = 12
): number {
  // Assume 50/50 split between Small Room and Main Stage
  const avgWinPayout =
    (calculateBattlePayout({ tier, leagueType: 'Small Room Circuit', wonBattle: true }) +
      calculateBattlePayout({ tier, leagueType: 'Main Stage Arena', wonBattle: true })) /
    2;

  const avgLossPayout =
    (calculateBattlePayout({ tier, leagueType: 'Small Room Circuit', wonBattle: false }) +
      calculateBattlePayout({ tier, leagueType: 'Main Stage Arena', wonBattle: false })) /
    2;

  const avgPayout = avgWinPayout * winRate + avgLossPayout * (1 - winRate);

  return Math.round(avgPayout * battlesPerYear);
}
