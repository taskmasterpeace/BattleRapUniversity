// Venue demographics for THE ROOM — shared between server pages and the
// client CrowdStrip. Different leagues pull different crowds (culture map:
// docs/design/culture/LEAGUE_CULTURES_AND_PPV.md).

export type Venue = 'urban' | 'mixed' | 'non_urban' | 'foreign';

/** Demographic draw weights per venue kind. */
export const VENUE_MIX: Record<Venue, Record<string, number>> = {
  urban: { urban: 0.85, non_urban: 0.1, foreign: 0.05 },
  mixed: { urban: 0.45, non_urban: 0.4, foreign: 0.15 },
  non_urban: { urban: 0.25, non_urban: 0.65, foreign: 0.1 },
  foreign: { urban: 0.15, non_urban: 0.15, foreign: 0.7 },
};

/** League name → room demographic (default urban). */
export function venueForLeague(leagueName?: string | null): Venue {
  const n = (leagueName || '').toLowerCase();
  if (n.includes('small room')) return 'mixed'; // London writers room
  if (n.includes('crown city') || n.includes('barz supreme')) return 'mixed'; // Toronto
  return 'urban';
}
