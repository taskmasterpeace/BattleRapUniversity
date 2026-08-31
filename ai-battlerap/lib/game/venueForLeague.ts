/**
 * League → venue resolution (2026-08-31). The venue system's tables (37
 * venue_types with modifiers) were seeded but never wired; this map gives
 * every league a signature ROOM now, with tier-level art fallbacks until
 * every venue type has its own sprite. Owner ask: "you could see where the
 * venue at — where they gonna be battling at."
 */

export type VenueInfo = {
  /** venue type slug (matches venue_types.slug) */
  slug: string;
  /** display name for the band — "THE BASEMENT", "SMALL BAR" … */
  name: string;
  tier: 'virtual' | 'small' | 'medium' | 'large';
};

/** Art actually generated so far, by venue-type slug. */
const VENUE_ART: Record<string, string> = {
  'home-studio': '/sprites/venues/home-studio.png',
  basement: '/sprites/venues/basement.png',
  barbershop: '/sprites/venues/barbershop.png',
  'small-bar': '/sprites/venues/small-bar.png',
  'boxing-gym': '/sprites/venues/boxing-gym.png',
  'grand-theater': '/sprites/venues/grand-theater.png',
};

/** Tier default when a venue type has no art of its own yet. */
const TIER_FALLBACK: Record<VenueInfo['tier'], string> = {
  virtual: VENUE_ART['home-studio'],
  small: VENUE_ART.basement,
  medium: VENUE_ART['small-bar'],
  large: VENUE_ART['grand-theater'],
};

/** Signature venue per league — flavor-matched to the league's identity. */
const LEAGUE_VENUES: Record<string, VenueInfo> = {
  'Text Wars': { slug: 'stream-platform', name: 'The Forum Boards', tier: 'virtual' },
  'The App': { slug: 'home-studio', name: 'The App — Home Studio', tier: 'virtual' },
  'I Do What I Want': { slug: 'basement', name: 'The Basement', tier: 'small' },
  'Street Cipher': { slug: 'barbershop', name: 'The Shop', tier: 'small' },
  'You Got Smoked': { slug: 'basement', name: 'The Smoke Room', tier: 'small' },
  'Gunbarz Assembly': { slug: 'boxing-gym', name: 'The Gym', tier: 'small' },
  'Get It Get It': { slug: 'barbershop', name: 'The Corner Shop', tier: 'small' },
  Slap: { slug: 'small-bar', name: 'The Slap House', tier: 'small' },
  'Milwaukee Massacre': { slug: 'basement', name: 'The Cellar', tier: 'small' },
  'Mic Masters Arena': { slug: 'small-bar', name: 'The Masters Room', tier: 'medium' },
  'Main Stage Arena': { slug: 'small-theater', name: 'The Main Stage', tier: 'medium' },
  'Flow Syndicate': { slug: 'small-bar', name: 'The Syndicate Bar', tier: 'medium' },
  'Small Room Circuit': { slug: 'small-bar', name: 'The Small Room', tier: 'small' },
  'Barz Supreme League': { slug: 'nightclub', name: 'Club Supreme', tier: 'medium' },
  'Spitfire Arena': { slug: 'boxing-arena', name: 'The Spitfire Ring', tier: 'large' },
  'Urban Warfare League': { slug: 'warehouse', name: 'The Warzone Warehouse', tier: 'medium' },
  'Block Buster Battles': { slug: 'nightclub', name: 'The Block House', tier: 'medium' },
  'Crown City Battle League': { slug: 'small-theater', name: 'The Crown Theater', tier: 'medium' },
  'Respect The Craft': { slug: 'grand-theater', name: 'The Craft Theater', tier: 'large' },
  'Stay Forever': { slug: 'concert-hall', name: 'Forever Hall', tier: 'large' },
  'Royal Wordsmiths': { slug: 'grand-theater', name: 'The Royal Theater', tier: 'large' },
};

const PRESTIGE_FALLBACK = (prestige: number): VenueInfo => {
  if (prestige <= 1) return { slug: 'home-studio', name: 'Home Studio', tier: 'virtual' };
  if (prestige <= 4) return { slug: 'basement', name: 'The Basement', tier: 'small' };
  if (prestige <= 7) return { slug: 'small-bar', name: 'The Club', tier: 'medium' };
  return { slug: 'grand-theater', name: 'The Grand Theater', tier: 'large' };
};

export function venueForLeagueName(
  leagueName: string | null | undefined,
  prestige = 3
): VenueInfo & { art: string } {
  const v = (leagueName && LEAGUE_VENUES[leagueName]) || PRESTIGE_FALLBACK(prestige);
  const art = VENUE_ART[v.slug] ?? TIER_FALLBACK[v.tier];
  return { ...v, art };
}
