/**
 * THE TAPE — the internet's verdict, judged when the battle drops online.
 *
 * Battle rap has two audiences (culture research, docs/design/culture/
 * LEAGUE_CULTURES_AND_PPV.md): the ROOM reacts live (performance, energy,
 * home-crowd bias — the crowd term in round judging) and the TAPE gets
 * rewound (pens read better on tape; the internet can't feel the room).
 * They regularly diverge — that divergence IS "debatable" culture.
 *
 * Tape judging re-weighs the same round data with NO crowd term:
 *   tapeComposite = average × TAPE_AVG_WEIGHT + peak × TAPE_PEAK_WEIGHT
 * Peak weighs heavier than in the room (0.45 vs 0.35) because replayable
 * moments get clipped, quoted, and argued about.
 */
import { SIMULATION_CONFIG as CONFIG } from './config';

export type TapeRound = {
  round_index: number;
  battler_id: string;
  average_score: number;
  peak_score: number;
};

export type TapeResult = {
  tapeWinnerId: string;
  tapeVerdict: '3-0' | '2-1';
  tapeRoundsA: number;
  tapeRoundsB: number;
};

export function computeTapeVerdict(
  rounds: TapeRound[],
  battlerAId: string,
  battlerBId: string
): TapeResult | null {
  const avgW = CONFIG.TAPE_JUDGING_AVERAGE_WEIGHT ?? 0.55;
  const peakW = CONFIG.TAPE_JUDGING_PEAK_WEIGHT ?? 0.45;

  let aWins = 0;
  let bWins = 0;
  for (let i = 1; i <= 3; i++) {
    const a = rounds.find((r) => r.round_index === i && r.battler_id === battlerAId);
    const b = rounds.find((r) => r.round_index === i && r.battler_id === battlerBId);
    if (!a || !b) return null;
    const aScore = Number(a.average_score) * avgW + Number(a.peak_score) * peakW;
    const bScore = Number(b.average_score) * avgW + Number(b.peak_score) * peakW;
    if (aScore >= bScore) aWins++;
    else bWins++;
  }

  const aTakesIt = aWins > bWins;
  return {
    tapeWinnerId: aTakesIt ? battlerAId : battlerBId,
    tapeVerdict: Math.max(aWins, bWins) === 3 ? '3-0' : '2-1',
    tapeRoundsA: aWins,
    tapeRoundsB: bWins,
  };
}
