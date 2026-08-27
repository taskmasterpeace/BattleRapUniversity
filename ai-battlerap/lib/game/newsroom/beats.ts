/**
 * The Newsroom — beats & blogger affinities.
 *
 * A "beat" is a lane of coverage. Every lead's subcategory maps to one or more
 * beats; every blogger has an affinity (0..1) for each beat. That affinity, times
 * their influence and history, decides who LANDS a story — and whether anyone
 * bites at all. This is what makes @TheSmokeReport chase beef while
 * @BankRollBattles chases the money.
 */

export type Beat =
  | 'moments'   // highlights: statement wins, streaks, close calls
  | 'breaking'  // hard news: callouts, robberies, arrests, first-to-report
  | 'smoke'     // drama: beef, ducking, exposed, disrespect, controversy
  | 'rankings'  // trajectory: streaks, slumps, ranking moves, milestones
  | 'money'     // the bag: come-ups, broke, stiffed, sponsorships
  | 'culture'   // the human story: family, crew, faith, grind, health
  | 'leagues';  // the industry: league moves, bookings, press

/** subcategory -> beats it belongs to (a story can live on more than one beat). */
export const SUBCATEGORY_BEATS: Record<string, Beat[]> = {
  // career
  statement_win: ['moments', 'rankings'],
  hot_streak: ['moments', 'rankings'],
  close_call: ['moments'],
  bad_night: ['moments', 'smoke'],
  slump: ['rankings'],
  league_move: ['leagues', 'breaking'],
  press: ['leagues', 'culture'],
  booking: ['leagues'],
  ranking_move: ['rankings'],
  milestone: ['rankings', 'culture'],
  // financial
  come_up: ['money'],
  broke: ['money', 'culture'],
  got_stiffed: ['money', 'breaking'],
  sponsorship: ['money', 'leagues'],
  robbery: ['money', 'smoke'],
  investment: ['money'],
  // scandal
  beef: ['smoke', 'breaking', 'moments'],
  robbed: ['smoke', 'breaking'],
  ducking: ['smoke'],
  exposed: ['smoke', 'breaking'],
  disrespect: ['smoke'],
  arrest: ['breaking', 'smoke'],
  controversy: ['smoke', 'breaking'],
  callout: ['breaking', 'smoke', 'moments'],
  // personal
  health: ['culture'],
  confidence: ['culture', 'moments'],
  mental: ['culture'],
  grind: ['culture'],
  vice: ['culture', 'smoke'],
  faith: ['culture'],
  // relationship
  family: ['culture'],
  crew: ['culture'],
  mentor: ['culture'],
  partner: ['culture'],
  betrayal: ['culture', 'smoke'],
  camp: ['culture'],
};

/**
 * Blogger beat affinities, keyed by handle. Handles that aren't listed fall back
 * to a voice_profile default so new accounts still behave sensibly.
 */
export const BLOGGER_BEATS: Record<string, Partial<Record<Beat, number>>> = {
  '@TheWireReport': { breaking: 1.0, moments: 0.6, rankings: 0.5, leagues: 0.6, smoke: 0.5 },
  '@TheSmokeReport': { smoke: 1.0, breaking: 0.8, moments: 0.3 },
  '@PunchlineWatch': { moments: 1.0, breaking: 0.4, rankings: 0.3 },
  '@BarsBreakdown': { moments: 0.85, rankings: 0.7 },
  '@StreetScribe': { culture: 1.0, moments: 0.5, smoke: 0.3 },
  '@LeaguesideJay': { leagues: 1.0, rankings: 0.6, breaking: 0.4 },
  '@BarometerBlog': { rankings: 1.0, moments: 0.4 },
  '@BankRollBattles': { money: 1.0, leagues: 0.4, breaking: 0.3 },
};

const VOICE_DEFAULT_BEATS: Record<string, Partial<Record<Beat, number>>> = {
  analyst_news: { breaking: 0.9, smoke: 0.6, moments: 0.5, rankings: 0.5, leagues: 0.5 },
  analyst_moments: { moments: 0.9, breaking: 0.4, culture: 0.4 },
  analyst_rankings: { rankings: 0.9, moments: 0.5 },
  analyst_measured: { leagues: 0.8, rankings: 0.6, money: 0.5 },
};

export function beatAffinity(
  handle: string,
  voiceProfile: string,
  subcategory: string | null | undefined
): number {
  const beats = SUBCATEGORY_BEATS[subcategory ?? ''] ?? [];
  if (beats.length === 0) return 0.15; // unknown beat: mild general interest
  const map = BLOGGER_BEATS[handle] ?? VOICE_DEFAULT_BEATS[voiceProfile] ?? {};
  // A blogger's fit for a multi-beat story = their best matching lane.
  let best = 0;
  for (const b of beats) best = Math.max(best, map[b] ?? 0);
  return best;
}

/** Human label for a lead's dominant beat (used in "developing" UI). */
export function primaryBeat(subcategory: string | null | undefined): Beat {
  const beats = SUBCATEGORY_BEATS[subcategory ?? ''] ?? ['breaking'];
  return beats[0];
}

export const BEAT_LABEL: Record<Beat, string> = {
  moments: 'THE MOMENTS',
  breaking: 'BREAKING',
  smoke: 'THE SMOKE',
  rankings: 'THE RANKINGS',
  money: 'THE BAG',
  culture: 'THE CULTURE',
  leagues: 'THE INDUSTRY',
};
