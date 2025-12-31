/**
 * Verdict System - Battle Rap Terminology & Demographic Voting
 *
 * Converts numerical scores into authentic battle rap verdicts:
 * - BODYBAG: Total domination (3-0, large margins)
 * - 30: Clear sweep (3-0, clear margins)
 * - GENTLEMAN'S 30: Competitive sweep (3-0, tight margins)
 * - EDGE: Close win (2-1, clear)
 * - DEBATABLE: Room split (2-1, razor thin)
 *
 * Each demographic type votes based on their preferences and
 * provides reasoning using the battlers' actual names.
 */

import { CrowdDemographic, CROWD_DEMOGRAPHICS, getLeagueDemographics } from './crowdDemographics';
import { DEMOGRAPHIC_QUOTES, getRandomQuote, QuoteBank } from './demographicQuotes';

// =====================================================
// VERDICT TYPES
// =====================================================

export type VerdictType = 'BODYBAG' | '30' | "GENTLEMAN'S 30" | 'EDGE' | 'DEBATABLE';

export type RoomReaction = 'unanimous' | 'consensus' | 'split' | 'controversial';

export interface RoundResult {
  roundNum: number;
  battler1Score: number;  // Composite score (avg + peak + crowd weighted)
  battler2Score: number;
  battler1Crowd: number;  // Crowd reaction 0-100
  battler2Crowd: number;
  margin: number;         // Winner's margin
  winner: 'battler1' | 'battler2';
}

export interface DemographicVote {
  demographic: CrowdDemographic;
  demographicName: string;
  percentage: number;          // % of room this demographic represents
  roundVotes: ('battler1' | 'battler2')[];  // Who they gave each round to
  overallWinner: 'battler1' | 'battler2';
  verdict: string;             // Their verdict (2-1, 3-0, etc.)
  confidence: number;          // 0-100 how confident they are
  reason: string;              // Why they voted this way (uses actual names)
  spriteReaction: string;      // Which sprite reaction to show
}

export interface BattleVerdict {
  // Official result
  winner: 'battler1' | 'battler2';
  verdict: VerdictType;
  score: string;               // "3-0" or "2-1"

  // Round breakdown
  rounds: RoundResult[];
  roundsWonBattler1: number;
  roundsWonBattler2: number;
  avgMargin: number;
  closestRound: number;

  // Demographic breakdown
  demographicVotes: DemographicVote[];
  consensusPercentage: number;  // % that agree with official winner
  roomReaction: RoomReaction;

  // For display
  battler1Name: string;
  battler2Name: string;
}

// =====================================================
// MARGIN THRESHOLDS
// =====================================================

const MARGIN_DOMINANT = 2.0;   // >2 points = dominated that round
const MARGIN_CLEAR = 1.0;      // 1-2 points = clearly won
const MARGIN_CLOSE = 0.5;      // 0.5-1 points = edged it
const MARGIN_RAZOR = 0.5;      // <0.5 points = could go either way

// Quote banks are now imported from demographicQuotes.ts
// This provides 200+ quotes per demographic category

// =====================================================
// SPRITE REACTION MAPPING
// =====================================================

function getSpriteReaction(demographic: CrowdDemographic, won: boolean, margin: number): string {
  if (won) {
    if (margin > MARGIN_DOMINANT) return 'hype';
    if (margin > MARGIN_CLEAR) return 'cheer';
    return 'watch';  // Close win - more reserved
  } else {
    if (margin > MARGIN_DOMINANT) return 'stunned';
    if (margin > MARGIN_CLEAR) return 'disappointed';
    return 'think';  // Close loss - contemplative
  }
}

// =====================================================
// VERDICT CALCULATION
// =====================================================

/**
 * Determine verdict type from round results
 */
function determineVerdict(
  roundsWon: number,
  avgMargin: number,
  closestRound: number
): VerdictType {
  if (roundsWon === 3) {
    if (avgMargin >= MARGIN_DOMINANT) return 'BODYBAG';
    if (avgMargin >= MARGIN_CLEAR) return '30';
    return "GENTLEMAN'S 30";
  } else {
    // 2-1
    if (closestRound < MARGIN_RAZOR) return 'DEBATABLE';
    return 'EDGE';
  }
}

/**
 * Get room reaction description
 */
function getRoomReaction(consensusPercentage: number): RoomReaction {
  if (consensusPercentage >= 90) return 'unanimous';
  if (consensusPercentage >= 70) return 'consensus';
  if (consensusPercentage >= 55) return 'split';
  return 'controversial';
}

/**
 * Pick a random quote using the expanded quote bank
 */
function pickQuote(
  demographic: CrowdDemographic,
  context: keyof QuoteBank,
  winnerName: string,
  loserName: string
): string {
  return getRandomQuote(demographic, context, winnerName, loserName);
}

/**
 * Calculate how a demographic votes on each round
 */
function calculateDemographicVote(
  demographic: CrowdDemographic,
  percentage: number,
  rounds: RoundResult[],
  battler1Name: string,
  battler2Name: string,
  battler1ContentTypes: string[],
  battler2ContentTypes: string[]
): DemographicVote {
  const demographicDef = CROWD_DEMOGRAPHICS[demographic];

  // Calculate adjusted scores for each round based on this demographic's preferences
  const roundVotes: ('battler1' | 'battler2')[] = [];
  let totalMargin = 0;

  for (const round of rounds) {
    // Apply demographic preference multipliers (simplified for now)
    // In full implementation, would factor in content types used
    let battler1Adjusted = round.battler1Score;
    let battler2Adjusted = round.battler2Score;

    // Small random variance to create disagreement between demographics
    const variance = (Math.random() - 0.5) * 0.4;
    battler1Adjusted += variance;
    battler2Adjusted -= variance;

    if (battler1Adjusted >= battler2Adjusted) {
      roundVotes.push('battler1');
      totalMargin += battler1Adjusted - battler2Adjusted;
    } else {
      roundVotes.push('battler2');
      totalMargin += battler2Adjusted - battler1Adjusted;
    }
  }

  // Count round wins for this demographic
  const battler1Wins = roundVotes.filter(v => v === 'battler1').length;
  const battler2Wins = roundVotes.filter(v => v === 'battler2').length;
  const overallWinner = battler1Wins >= battler2Wins ? 'battler1' : 'battler2';
  const verdict = `${Math.max(battler1Wins, battler2Wins)}-${Math.min(battler1Wins, battler2Wins)}`;

  // Confidence based on margin
  const avgMargin = totalMargin / rounds.length;
  const confidence = Math.min(100, Math.floor(50 + avgMargin * 20));

  // Pick appropriate quote
  const winnerName = overallWinner === 'battler1' ? battler1Name : battler2Name;
  const loserName = overallWinner === 'battler1' ? battler2Name : battler1Name;

  // Select quote context based on margin
  let quoteContext: keyof QuoteBank;
  if (avgMargin > MARGIN_DOMINANT) {
    quoteContext = 'dominant';
  } else if (avgMargin > MARGIN_CLOSE) {
    quoteContext = 'winBecause';
  } else {
    quoteContext = 'closeWin';
  }

  const reason = pickQuote(demographic, quoteContext, winnerName, loserName);
  const spriteReaction = getSpriteReaction(demographic, true, avgMargin);

  return {
    demographic,
    demographicName: demographicDef.name,
    percentage,
    roundVotes,
    overallWinner,
    verdict,
    confidence,
    reason,
    spriteReaction,
  };
}

// =====================================================
// MAIN VERDICT CALCULATION
// =====================================================

export interface CalculateVerdictInput {
  battler1Name: string;
  battler2Name: string;
  rounds: {
    roundNum: number;
    battler1Score: number;
    battler2Score: number;
    battler1Crowd: number;
    battler2Crowd: number;
  }[];
  leagueName: string;
  battler1ContentTypes?: string[];
  battler2ContentTypes?: string[];
}

/**
 * Calculate full battle verdict with demographic breakdown
 */
export function calculateBattleVerdict(input: CalculateVerdictInput): BattleVerdict {
  const {
    battler1Name,
    battler2Name,
    rounds: inputRounds,
    leagueName,
    battler1ContentTypes = [],
    battler2ContentTypes = [],
  } = input;

  // Process rounds
  const rounds: RoundResult[] = inputRounds.map(r => {
    const margin = Math.abs(r.battler1Score - r.battler2Score);
    return {
      roundNum: r.roundNum,
      battler1Score: r.battler1Score,
      battler2Score: r.battler2Score,
      battler1Crowd: r.battler1Crowd,
      battler2Crowd: r.battler2Crowd,
      margin,
      winner: r.battler1Score >= r.battler2Score ? 'battler1' : 'battler2',
    };
  });

  // Count wins
  const roundsWonBattler1 = rounds.filter(r => r.winner === 'battler1').length;
  const roundsWonBattler2 = rounds.filter(r => r.winner === 'battler2').length;
  const winner = roundsWonBattler1 >= roundsWonBattler2 ? 'battler1' : 'battler2';

  // Calculate margins
  const winnerRounds = rounds.filter(r => r.winner === winner);
  const avgMargin = winnerRounds.length > 0
    ? winnerRounds.reduce((sum, r) => sum + r.margin, 0) / winnerRounds.length
    : 0;
  const closestRound = Math.min(...rounds.map(r => r.margin));

  // Determine verdict
  const roundsWon = winner === 'battler1' ? roundsWonBattler1 : roundsWonBattler2;
  const verdict = determineVerdict(roundsWon, avgMargin, closestRound);
  const score = `${Math.max(roundsWonBattler1, roundsWonBattler2)}-${Math.min(roundsWonBattler1, roundsWonBattler2)}`;

  // Get league demographics
  const leagueDemographics = getLeagueDemographics(leagueName);
  const demographics = leagueDemographics?.demographics || [
    { demographic: 'purists' as CrowdDemographic, percentage: 20 },
    { demographic: 'street_fans' as CrowdDemographic, percentage: 20 },
    { demographic: 'comedy_fans' as CrowdDemographic, percentage: 20 },
    { demographic: 'aggression_fans' as CrowdDemographic, percentage: 20 },
    { demographic: 'performance_fans' as CrowdDemographic, percentage: 20 },
  ];

  // Calculate demographic votes
  const demographicVotes = demographics.map(d =>
    calculateDemographicVote(
      d.demographic,
      d.percentage,
      rounds,
      battler1Name,
      battler2Name,
      battler1ContentTypes,
      battler2ContentTypes
    )
  );

  // Calculate consensus
  const agreeingPercentage = demographicVotes
    .filter(v => v.overallWinner === winner)
    .reduce((sum, v) => sum + v.percentage, 0);
  const consensusPercentage = agreeingPercentage;
  const roomReaction = getRoomReaction(consensusPercentage);

  return {
    winner,
    verdict,
    score,
    rounds,
    roundsWonBattler1,
    roundsWonBattler2,
    avgMargin,
    closestRound,
    demographicVotes,
    consensusPercentage,
    roomReaction,
    battler1Name,
    battler2Name,
  };
}

// =====================================================
// EXPORTS
// =====================================================

export {
  MARGIN_DOMINANT,
  MARGIN_CLEAR,
  MARGIN_CLOSE,
  MARGIN_RAZOR,
};

// Re-export quote utilities from demographicQuotes
export { DEMOGRAPHIC_QUOTES, getRandomQuote, getMultipleQuotes } from './demographicQuotes';
