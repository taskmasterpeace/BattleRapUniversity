/**
 * HOMETOWN CITY DATABASE — the battle-rap metros, deep (2026-09-01).
 *
 * What a player picks as their battler's HOMETOWN (identity + the seed for
 * recruiting), and the crowd-taste source the battle sim reads (see
 * docs/design/CORE_LOOP_AND_ERAS.md §2). Curated for the culture, not a generic
 * US-cities dump — real neighborhoods that actually produce battlers, and crowd
 * taste that reflects each scene.
 *
 * CROWD MECHANIC (design §2): audience disposition = landed-tag affinity −
 * away hostility, capped at ±8 crowd-reaction points. Applied to crowd reaction
 * ONLY — never the raw score, counter multiplier, or attribute roll. A home
 * battler simply avoids the outsider hostility; the Tape re-judge removes
 * hostility entirely (the "lost the room, won online" outcome).
 */

/** Crowd-taste tags — what a room rewards. Map to the sim's content/style. */
export type CrowdTag =
  | 'lyricism'     // technical, multis, dense rhyme
  | 'wordplay'     // clever manipulation, double entendres
  | 'schemes'      // extended metaphor, multi-bar setups
  | 'punchlines'   // hard-hitting knockout bars
  | 'personals'    // researched personal attacks, angles
  | 'comedy'       // jokes, crowd relief
  | 'street'       // authenticity, gun bars, lived experience
  | 'performance'  // stage command, energy, theatrics
  | 'aggression'   // intensity, in-your-face delivery
  | 'freestyle';   // rebuttals, off-the-top, reacting to the room

export interface HometownCity {
  id: string;
  name: string;
  state: string;               // US 2-letter, or country (CA, UK)
  region: 'East Coast' | 'West Coast' | 'South' | 'Midwest' | 'International';
  scene: string;               // one-line battle-rap identity
  neighborhoods: string[];     // real areas that produce battlers
  favored: [CrowdTag, CrowdTag]; // the two things this crowd rewards most
  cold: CrowdTag;              // what this crowd rides for the least
  hostility: number;           // 0-10, toughness on out-of-town battlers
}

export const HOMETOWN_CITIES: HometownCity[] = [
  // ============================ EAST COAST ============================
  {
    id: 'new-york-city', name: 'New York City', state: 'NY', region: 'East Coast',
    scene: 'The birthplace — technical, hostile, unforgiving. Bars are the law.',
    neighborhoods: ['Harlem', 'Brooklyn', 'The Bronx', 'Queens', 'Bed-Stuy', 'Brownsville', 'Mount Vernon', 'Yonkers', 'Staten Island', 'Far Rockaway'],
    favored: ['lyricism', 'personals'], cold: 'comedy', hostility: 9,
  },
  {
    id: 'newark-north-jersey', name: 'Newark / North Jersey', state: 'NJ', region: 'East Coast',
    scene: 'Bar-heavy and mean — right across the water from NY and out to prove it.',
    neighborhoods: ['Newark', 'East Orange', 'Irvington', 'Jersey City', 'Paterson', 'Plainfield', 'The Bricks', 'Trenton'],
    favored: ['punchlines', 'aggression'], cold: 'freestyle', hostility: 8,
  },
  {
    id: 'philadelphia', name: 'Philadelphia', state: 'PA', region: 'East Coast',
    scene: 'No filler tolerated — aggressive, punchline-obsessed, quick to boo.',
    neighborhoods: ['North Philly', 'West Philly', 'South Philly', 'Germantown', 'Kensington', 'Southwest Philly', 'Nicetown', 'Camden'],
    favored: ['punchlines', 'aggression'], cold: 'schemes', hostility: 9,
  },
  {
    id: 'baltimore', name: 'Baltimore', state: 'MD', region: 'East Coast',
    scene: 'Gritty and real — the street tax is high, respect is earned.',
    neighborhoods: ['West Baltimore', 'East Baltimore', 'Park Heights', 'Cherry Hill', 'Sandtown', 'Dundalk'],
    favored: ['street', 'aggression'], cold: 'comedy', hostility: 8,
  },
  {
    id: 'dmv', name: 'Washington DC (DMV)', state: 'DC', region: 'East Coast',
    scene: 'Dense, connected, mixed — angles and pen respected, region tested hard.',
    neighborhoods: ['Southeast DC', 'Northeast DC', 'PG County', 'Prince George’s', 'Landover', 'Baltimore Ave', 'Northern Virginia', 'Alexandria'],
    favored: ['personals', 'wordplay'], cold: 'comedy', hostility: 7,
  },
  {
    id: 'boston', name: 'Boston', state: 'MA', region: 'East Coast',
    scene: 'Slept-on and chip-on-shoulder — technical writers grinding for respect.',
    neighborhoods: ['Roxbury', 'Dorchester', 'Mattapan', 'Jamaica Plain', 'Brockton', 'Lynn'],
    favored: ['lyricism', 'schemes'], cold: 'performance', hostility: 6,
  },
  {
    id: 'pittsburgh', name: 'Pittsburgh', state: 'PA', region: 'East Coast',
    scene: 'Small scene, hard rooms — you battle to be heard past the city line.',
    neighborhoods: ['Homewood', 'Hill District', 'North Side', 'Wilkinsburg', 'McKeesport'],
    favored: ['punchlines', 'street'], cold: 'freestyle', hostility: 6,
  },
  {
    id: 'richmond-va', name: 'Richmond', state: 'VA', region: 'East Coast',
    scene: 'Southern edge on an East Coast pen — rising, hungry, personal.',
    neighborhoods: ['Southside', 'Church Hill', 'Highland Park', 'Jackson Ward', 'Petersburg'],
    favored: ['personals', 'street'], cold: 'schemes', hostility: 6,
  },

  // ============================== SOUTH ==============================
  {
    id: 'atlanta', name: 'Atlanta', state: 'GA', region: 'South',
    scene: 'Performance capital — energy, presence, and the crowd on their feet.',
    neighborhoods: ['Bankhead', 'Zone 6', 'Decatur', 'College Park', 'East Point', 'Bowen Homes', 'SWATS', 'Clayton County'],
    favored: ['performance', 'street'], cold: 'schemes', hostility: 6,
  },
  {
    id: 'miami', name: 'Miami', state: 'FL', region: 'South',
    scene: 'Loud, street, high-energy — the room wants heat and authenticity.',
    neighborhoods: ['Overtown', 'Liberty City', 'Miami Gardens', 'Opa-locka', 'Carol City', 'Little Haiti', 'Pork n Beans', 'Homestead'],
    favored: ['street', 'aggression'], cold: 'schemes', hostility: 7,
  },
  {
    id: 'new-orleans', name: 'New Orleans', state: 'LA', region: 'South',
    scene: 'Bounce energy meets bar culture — the room performs back at you.',
    neighborhoods: ['The Magnolia', 'Calliope', 'The 9th Ward', 'Uptown', 'Central City', 'Hollygrove'],
    favored: ['performance', 'street'], cold: 'lyricism', hostility: 6,
  },
  {
    id: 'memphis', name: 'Memphis', state: 'TN', region: 'South',
    scene: 'Dark, street, no games — the grimiest rooms in the South.',
    neighborhoods: ['Orange Mound', 'North Memphis', 'South Memphis', 'Frayser', 'Whitehaven', 'Binghampton'],
    favored: ['street', 'aggression'], cold: 'comedy', hostility: 8,
  },
  {
    id: 'houston', name: 'Houston', state: 'TX', region: 'South',
    scene: 'Ward pride and street tax — slow-cooked bars, real recognizes real.',
    neighborhoods: ['3rd Ward', '5th Ward', '4th Ward', 'South Park', 'Acres Homes', 'Sunnyside', 'Hiram Clarke', 'Missouri City'],
    favored: ['street', 'personals'], cold: 'freestyle', hostility: 7,
  },
  {
    id: 'dallas', name: 'Dallas', state: 'TX', region: 'South',
    scene: 'Rising Texas scene — aggressive with a growing pen.',
    neighborhoods: ['Oak Cliff', 'South Dallas', 'Pleasant Grove', 'West Dallas', 'Fort Worth', 'Arlington'],
    favored: ['aggression', 'street'], cold: 'schemes', hostility: 6,
  },
  {
    id: 'charlotte', name: 'Charlotte', state: 'NC', region: 'South',
    scene: 'Carolina hunger — a young scene fighting for the region’s attention.',
    neighborhoods: ['West Charlotte', 'North Charlotte', 'Beatties Ford', 'Grier Heights', 'Salisbury'],
    favored: ['punchlines', 'street'], cold: 'freestyle', hostility: 5,
  },

  // ============================= MIDWEST =============================
  {
    id: 'detroit', name: 'Detroit', state: 'MI', region: 'Midwest',
    scene: 'Wordplay and wit capital — clever, funny, and quietly savage.',
    neighborhoods: ['The Eastside', 'The Westside', '7 Mile', '8 Mile', 'Highland Park', 'Brightmoor', 'Dexter', 'Joy Road'],
    favored: ['wordplay', 'comedy'], cold: 'performance', hostility: 7,
  },
  {
    id: 'chicago', name: 'Chicago', state: 'IL', region: 'Midwest',
    scene: 'Cold and hard — drill energy, street authenticity, unforgiving rooms.',
    neighborhoods: ['South Side', 'West Side', 'Englewood', 'K-Town', 'Austin', 'Roseland', 'Chatham', 'The Wild Hundreds'],
    favored: ['street', 'aggression'], cold: 'comedy', hostility: 8,
  },
  {
    id: 'cleveland', name: 'Cleveland', state: 'OH', region: 'Midwest',
    scene: 'Underrated pen — technical writers in a hard, honest scene.',
    neighborhoods: ['East Cleveland', 'The Eastside', 'Hough', 'Glenville', 'Kinsman', 'Collinwood'],
    favored: ['lyricism', 'punchlines'], cold: 'performance', hostility: 6,
  },
  {
    id: 'st-louis', name: 'St. Louis', state: 'MO', region: 'Midwest',
    scene: 'Street-first Midwest — real stories, no shortcuts.',
    neighborhoods: ['North St. Louis', 'The Ville', 'Baden', 'Walnut Park', 'East St. Louis'],
    favored: ['street', 'personals'], cold: 'schemes', hostility: 7,
  },
  {
    id: 'milwaukee', name: 'Milwaukee', state: 'WI', region: 'Midwest',
    scene: 'Tough small scene — you earn every ounce of respect on the mic.',
    neighborhoods: ['North Side', 'Sherman Park', 'Metcalfe Park', 'Amani', 'Franklin Heights'],
    favored: ['aggression', 'street'], cold: 'comedy', hostility: 6,
  },
  {
    id: 'minneapolis', name: 'Minneapolis', state: 'MN', region: 'Midwest',
    scene: 'Artistic and creative — a scene that rewards a different angle.',
    neighborhoods: ['North Minneapolis', 'South Minneapolis', 'Frogtown', 'Rondo (St. Paul)', 'Brooklyn Park'],
    favored: ['wordplay', 'schemes'], cold: 'aggression', hostility: 5,
  },
  {
    id: 'indianapolis', name: 'Indianapolis', state: 'IN', region: 'Midwest',
    scene: 'Naptown grind — a quiet scene with a hard-nosed street core.',
    neighborhoods: ['Haughville', 'The Eastside', 'Naptown', 'Butler-Tarkington', 'Martindale'],
    favored: ['street', 'punchlines'], cold: 'freestyle', hostility: 6,
  },

  // ============================ WEST COAST ===========================
  {
    id: 'los-angeles', name: 'Los Angeles', state: 'CA', region: 'West Coast',
    scene: 'Style and swagger — the crowd wants a show, a moment, a wave.',
    neighborhoods: ['South Central', 'Compton', 'Inglewood', 'Watts', 'Long Beach', 'Crenshaw', 'The Jungles', 'Pomona'],
    favored: ['performance', 'street'], cold: 'schemes', hostility: 6,
  },
  {
    id: 'oakland-bay', name: 'Oakland / Bay Area', state: 'CA', region: 'West Coast',
    scene: 'Hyphy roots, sharp tongues — energy plus a slick, funny pen.',
    neighborhoods: ['East Oakland', 'West Oakland', 'Richmond', 'Vallejo', 'Hunters Point (SF)', 'The Fillmore', 'Deep East'],
    favored: ['performance', 'wordplay'], cold: 'schemes', hostility: 6,
  },
  {
    id: 'san-diego', name: 'San Diego', state: 'CA', region: 'West Coast',
    scene: 'Border-town grind — a slept-on scene with something to prove.',
    neighborhoods: ['Southeast San Diego', 'Logan Heights', 'Lincoln Park', 'Skyline', 'National City'],
    favored: ['street', 'performance'], cold: 'schemes', hostility: 6,
  },
  {
    id: 'las-vegas', name: 'Las Vegas', state: 'NV', region: 'West Coast',
    scene: 'Transplant city, show energy — perform or get swallowed by the room.',
    neighborhoods: ['The Westside', 'North Las Vegas', 'Naked City', 'Meadows Village'],
    favored: ['performance', 'aggression'], cold: 'lyricism', hostility: 6,
  },

  // ========================== INTERNATIONAL =========================
  {
    id: 'toronto', name: 'Toronto', state: 'CA', region: 'International',
    scene: 'KOTD’s home — technical, diverse, wordplay-driven, globally minded.',
    neighborhoods: ['Scarborough', 'Rexdale', 'Jane and Finch', 'Regent Park', 'Malvern', 'Etobicoke', 'North York'],
    favored: ['wordplay', 'schemes'], cold: 'street', hostility: 6,
  },
  {
    id: 'london', name: 'London', state: 'UK', region: 'International',
    scene: 'Don’t Flop country — witty, technical, and quick with a comeback.',
    neighborhoods: ['South London', 'East London', 'North London', 'Brixton', 'Peckham', 'Tottenham', 'Hackney', 'Croydon'],
    favored: ['wordplay', 'comedy'], cold: 'street', hostility: 6,
  },
];

/** Fast lookup by id. */
export const HOMETOWN_BY_ID: Record<string, HometownCity> = Object.fromEntries(
  HOMETOWN_CITIES.map((c) => [c.id, c])
);

/** Every (city, neighborhood) pair as a searchable option for the picker. */
export type HometownOption = {
  cityId: string;
  city: string;
  state: string;
  region: HometownCity['region'];
  neighborhood: string | null; // null = "just the city"
  /** what the player picks & we store, e.g. "Miami Gardens, Miami, FL" */
  label: string;
  /** lowercased haystack for search */
  search: string;
};

export const HOMETOWN_OPTIONS: HometownOption[] = HOMETOWN_CITIES.flatMap((c) => {
  const cityOpt: HometownOption = {
    cityId: c.id, city: c.name, state: c.state, region: c.region, neighborhood: null,
    label: `${c.name}, ${c.state}`,
    search: `${c.name} ${c.state} ${c.region}`.toLowerCase(),
  };
  const hoods: HometownOption[] = c.neighborhoods.map((n) => ({
    cityId: c.id, city: c.name, state: c.state, region: c.region, neighborhood: n,
    label: `${n}, ${c.name}, ${c.state}`,
    search: `${n} ${c.name} ${c.state}`.toLowerCase(),
  }));
  return [cityOpt, ...hoods];
});
