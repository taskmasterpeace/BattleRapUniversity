/**
 * Venue art + fallback resolution (2026-08-31). Venues are PLACES — real
 * rooms in cities (the venues table), booked per battle by venueBooking.ts.
 * This module only maps venue TIERS to the art that exists so far, and gives
 * legacy battles (booked before venue wiring) a neutral tier-sized fallback.
 * Owner law: a venue is a location, never a league brand.
 */

export type VenueTier = 'virtual' | 'small' | 'medium' | 'large';

export type VenueInfo = {
  slug: string;
  name: string;
  tier: VenueTier;
};

/** Art actually generated so far, by venue-type slug. */
export const VENUE_ART: Record<string, string> = {
  'home-studio': '/sprites/venues/home-studio.png',
  basement: '/sprites/venues/basement.png',
  barbershop: '/sprites/venues/barbershop.png',
  'small-bar': '/sprites/venues/small-bar.png',
  'boxing-gym': '/sprites/venues/boxing-gym.png',
  'grand-theater': '/sprites/venues/grand-theater.png',
};

/** Tier default art for venue types that don't have their own sprite yet. */
export function artForTier(tier: VenueTier | string): string {
  switch (tier) {
    case 'virtual':
      return VENUE_ART['home-studio'];
    case 'small':
      return VENUE_ART.basement;
    case 'medium':
      return VENUE_ART['small-bar'];
    case 'large':
      return VENUE_ART['grand-theater'];
    default:
      return VENUE_ART['small-bar'];
  }
}

/** Neutral tier-sized room for battles booked before venue wiring existed. */
function fallbackByPrestige(prestige: number): VenueInfo {
  if (prestige <= 1) return { slug: 'home-studio', name: 'Home Studio', tier: 'virtual' };
  if (prestige <= 4) return { slug: 'basement', name: 'The Basement', tier: 'small' };
  if (prestige <= 7) return { slug: 'small-bar', name: 'The Club', tier: 'medium' };
  return { slug: 'grand-theater', name: 'The Grand Theater', tier: 'large' };
}

/** Rough prestige guess per league name for legacy fallbacks only. */
const LEAGUE_PRESTIGE_HINT: Record<string, number> = {
  'Text Wars': 1,
  'The App': 1,
  'Respect The Craft': 8,
  'Stay Forever': 8,
  'Royal Wordsmiths': 10,
};

export function venueForLeagueName(
  leagueName: string | null | undefined,
  prestige?: number
): VenueInfo & { art: string } {
  const p = prestige ?? (leagueName ? LEAGUE_PRESTIGE_HINT[leagueName] ?? 4 : 4);
  const v = fallbackByPrestige(p);
  return { ...v, art: artForTier(v.tier) };
}
