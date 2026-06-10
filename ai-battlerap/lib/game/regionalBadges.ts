/**
 * Regional badge derivation — shared by the create API (which awards it) and
 * the onboarding review step (which previews it), so players SEE the badges
 * they'll automatically start with before they commit.
 */
export function getRegionalBadge(region: string | null): string {
  if (!region) return 'Underground Rep';

  const cityLower = region.toLowerCase().trim();

  if (
    cityLower.includes('new york') || cityLower.includes('brooklyn') ||
    cityLower.includes('bronx') || cityLower.includes('queens') ||
    cityLower.includes('harlem') || cityLower.includes('manhattan') ||
    cityLower.includes('nyc')
  ) return 'NYC Native';

  if (cityLower.includes('philadelphia') || cityLower.includes('philly')) return 'Philly Rep';
  if (cityLower.includes('detroit')) return 'Detroit Made';
  if (cityLower.includes('chicago')) return 'Chicago Bred';

  if (
    cityLower.includes('los angeles') || cityLower.includes('compton') ||
    cityLower.includes('long beach') || cityLower.includes('inglewood') ||
    cityLower.includes('la,') || cityLower === 'la'
  ) return 'LA Native';

  if (
    cityLower.includes('san francisco') || cityLower.includes('oakland') ||
    cityLower.includes('bay area') || cityLower.includes('san jose')
  ) return 'Bay Area Rep';

  if (cityLower.includes('atlanta') || cityLower.includes('atl')) return 'ATL Rep';
  if (cityLower.includes('houston')) return 'Houston Made';

  if (
    cityLower.includes('washington') || cityLower.includes('baltimore') ||
    cityLower.includes('dc') || cityLower.includes('dmv') ||
    cityLower.includes('maryland') || cityLower.includes('virginia')
  ) return 'DMV Native';

  if (cityLower.includes('miami') || cityLower.includes('305')) return 'Miami Heat';
  if (cityLower.includes('toronto')) return 'Toronto Rep';

  if (
    cityLower.includes('london') || cityLower.includes('uk') ||
    cityLower.includes('england') || cityLower.includes('britain') ||
    cityLower.includes('manchester') || cityLower.includes('birmingham')
  ) return 'UK Native';

  return 'Underground Rep';
}
