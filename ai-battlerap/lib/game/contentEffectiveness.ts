/**
 * Content/Style System - Content Effectiveness Matrix
 *
 * Pokémon-style effectiveness system for content type matchups.
 * Based on real battle rap dynamics and validated with famous battles.
 *
 * Multipliers:
 * - Super Effective: 2.0x (your content dominates opponent's)
 * - Neutral: 1.0x (no advantage either way)
 * - Not Very Effective: 0.5x (your content struggles against opponent's)
 *
 * Research sources: Loaded Lux vs Calicoe, Lux vs Clips, Hollow Da Don, etc.
 */

import { ContentType, DeliveryType, PerformanceType } from './contentTypes';

// =====================================================
// EFFECTIVENESS TYPES
// =====================================================

export type EffectivenessMultiplier = 2.0 | 1.0 | 0.5;

export interface EffectivenessMatchup {
  yourContent: ContentType | DeliveryType | PerformanceType;
  vsOpponentContent: ContentType | DeliveryType | PerformanceType;
  multiplier: EffectivenessMultiplier;
  reasoning: string;
  realBattleExample?: string;
}

// =====================================================
// SUPER EFFECTIVE MATCHUPS (2.0x)
// =====================================================

const SUPER_EFFECTIVE_MATCHUPS: EffectivenessMatchup[] = [
  // =====================================================
  // PERSONALS Advantages (Attack)
  // =====================================================
  {
    yourContent: 'personals',
    vsOpponentContent: 'comedy',
    multiplier: 2.0,
    reasoning: 'Serious personal attacks make jokes look shallow and deflective',
    realBattleExample: 'Loaded Lux personal angles vs lighter opponents',
  },
  {
    yourContent: 'personals',
    vsOpponentContent: 'gun_bars',
    multiplier: 2.0,
    reasoning: 'Real researched information trumps generic threats',
    realBattleExample: 'Well-researched angles expose fake tough guys',
  },

  // =====================================================
  // WORDPLAY Advantages (Technical)
  // =====================================================
  {
    yourContent: 'wordplay',
    vsOpponentContent: 'gun_bars',
    multiplier: 2.0,
    reasoning: 'Technical skill dominates one-dimensional content',
    realBattleExample: 'Loaded Lux intricate schemes vs Calicoe street approach',
  },

  // =====================================================
  // SCHEMES Advantages (Technical)
  // =====================================================
  {
    yourContent: 'schemes',
    vsOpponentContent: 'shock_value',
    multiplier: 2.0,
    reasoning: 'Craftsmanship beats cheap provocations',
    realBattleExample: 'Complex setups making shocking content look lazy',
  },

  // =====================================================
  // PUNCHLINES Advantages (Attack)
  // =====================================================
  {
    yourContent: 'punchlines',
    vsOpponentContent: 'schemes',
    multiplier: 2.0,
    reasoning: 'Quick haymakers interrupt long setups before payoff',
    realBattleExample: 'Rum Nitty punches cutting through elaborate setups',
  },
  {
    yourContent: 'punchlines',
    vsOpponentContent: 'storytelling',
    multiplier: 2.0,
    reasoning: 'Crowd wants instant gratification over long narratives',
    realBattleExample: 'Punchline artists ending rounds before stories finish',
  },
  {
    yourContent: 'punchlines',
    vsOpponentContent: 'name_flips',
    multiplier: 2.0,
    reasoning: 'Substantive punches beat repetitive hooks',
    realBattleExample: 'Hard bars making name flips look one-dimensional',
  },

  // =====================================================
  // COMEDY Advantages (Entertainment)
  // =====================================================
  {
    yourContent: 'comedy',
    vsOpponentContent: 'wordplay',
    multiplier: 2.0,
    reasoning: 'Crowd laughs make technical bars feel boring and tryhard',
    realBattleExample: 'Charlie Clips crowd work vs technical opponents',
  },
  {
    yourContent: 'comedy',
    vsOpponentContent: 'schemes',
    multiplier: 2.0,
    reasoning: 'Entertainment value beats complexity for casual crowds',
    realBattleExample: 'Comedic battlers making "bar heavy" opponents look uptight',
  },
  {
    yourContent: 'comedy',
    vsOpponentContent: 'social_commentary',
    multiplier: 2.0,
    reasoning: 'Preachy political content gets mocked and loses crowd energy',
    realBattleExample: 'Political bars made boring by entertaining comedian',
  },

  // =====================================================
  // STORYTELLING Advantages (Technical)
  // =====================================================
  {
    yourContent: 'storytelling',
    vsOpponentContent: 'name_flips',
    multiplier: 2.0,
    reasoning: 'Narrative depth and substance beats repetitive hooks',
    realBattleExample: 'Immersive stories making name flips feel shallow',
  },

  // =====================================================
  // GUN BARS Advantages (Attack)
  // =====================================================
  {
    yourContent: 'gun_bars',
    vsOpponentContent: 'freestyles',
    multiplier: 2.0,
    reasoning: 'Aggressive pre-written content overwhelms improvisation',
    realBattleExample: 'Heavy gun bars dominating freestyle attempts',
  },
  {
    yourContent: 'gun_bars',
    vsOpponentContent: 'social_commentary',
    multiplier: 2.0,
    reasoning: 'Violence kills the mood for political discourse',
    realBattleExample: 'Aggressive threats making conscious bars feel soft',
  },

  // =====================================================
  // STREET TALK Advantages (Attack)
  // =====================================================
  {
    yourContent: 'street_talk',
    vsOpponentContent: 'gun_bars',
    multiplier: 2.0,
    reasoning: 'Authenticity exposes fake posturing and generic threats',
    realBattleExample: 'Tsu Surf lived experience vs performative aggression',
  },
  {
    yourContent: 'street_talk',
    vsOpponentContent: 'schemes',
    multiplier: 2.0,
    reasoning: 'Real street credibility makes fancy wordplay look soft and corny',
    realBattleExample: 'Street battlers exposing "backpack rappers" as soft',
  },

  // =====================================================
  // FREESTYLES Advantages (Adaptive)
  // =====================================================
  {
    yourContent: 'freestyles',
    vsOpponentContent: 'rebuttals',
    multiplier: 2.0,
    reasoning: 'On-spot adaptation beats pre-written responses',
    realBattleExample: 'Hollow Da Don improvisation shutting down prepared material',
  },
  {
    yourContent: 'freestyles',
    vsOpponentContent: 'schemes',
    multiplier: 2.0,
    reasoning: 'Spontaneous fire shows real talent that can\'t be written',
    realBattleExample: 'Freestyle moments making pre-written material look robotic',
  },

  // =====================================================
  // REBUTTALS Advantages (Adaptive)
  // =====================================================
  {
    yourContent: 'rebuttals',
    vsOpponentContent: 'personals',
    multiplier: 2.0,
    reasoning: 'Dismantling attacks makes opponent look unprepared',
    realBattleExample: 'Quick responses neutralizing researched angles',
  },
  {
    yourContent: 'rebuttals',
    vsOpponentContent: 'shock_value',
    multiplier: 2.0,
    reasoning: 'Turning controversial content back against opponent',
    realBattleExample: 'Flipping shock tactics to make opponent look desperate',
  },

  // =====================================================
  // POP CULTURE REFS Advantages (Entertainment)
  // =====================================================
  {
    yourContent: 'pop_culture_refs',
    vsOpponentContent: 'social_commentary',
    multiplier: 2.0,
    reasoning: 'Relatable content beats preachy material for most crowds',
    realBattleExample: 'Timely references getting bigger reactions than political bars',
  },
  {
    yourContent: 'pop_culture_refs',
    vsOpponentContent: 'storytelling',
    multiplier: 2.0,
    reasoning: 'Quick relevant punches beat slow narrative builds',
    realBattleExample: 'Pop culture one-liners cutting through long stories',
  },

  // =====================================================
  // DELIVERY TYPE MATCHUPS
  // =====================================================
  {
    yourContent: 'aggressive',
    vsOpponentContent: 'nonchalant',
    multiplier: 2.0,
    reasoning: 'Intense energy overwhelms cool demeanor',
    realBattleExample: 'High-energy performers dominating laid-back battlers',
  },
  {
    yourContent: 'speed_rapping',
    vsOpponentContent: 'conversational',
    multiplier: 2.0,
    reasoning: 'Technical speed buries casual delivery',
    realBattleExample: 'Rapid-fire flows overwhelming slow-paced opponents',
  },
  {
    yourContent: 'passionate',
    vsOpponentContent: 'nonchalant',
    multiplier: 2.0,
    reasoning: 'Conviction and emotion makes coolness look uninvested',
    realBattleExample: 'Emotional delivery exposing nonchalant as uncaring',
  },

  // =====================================================
  // PERFORMANCE TYPE MATCHUPS
  // =====================================================
  {
    yourContent: 'theatrical',
    vsOpponentContent: 'minimalist',
    multiplier: 2.0,
    reasoning: 'Dramatic showmanship buries subtle gestures',
    realBattleExample: 'Big stage presence overwhelming understated performers',
  },
  {
    yourContent: 'crowd_interaction',
    vsOpponentContent: 'minimalist',
    multiplier: 2.0,
    reasoning: 'Active crowd engagement beats passive presence',
    realBattleExample: 'Call-and-response making stoic performers look detached',
  },
  {
    yourContent: 'dynamic_range',
    vsOpponentContent: 'minimalist',
    multiplier: 2.0,
    reasoning: 'Volume variation dominates flat delivery',
    realBattleExample: 'Whisper-to-shout technique burying monotone performers',
  },
];

// =====================================================
// NOT VERY EFFECTIVE MATCHUPS (0.5x)
// =====================================================

const NOT_VERY_EFFECTIVE_MATCHUPS: EffectivenessMatchup[] = [
  // =====================================================
  // PERSONALS Weaknesses (Attack)
  // =====================================================
  {
    yourContent: 'personals',
    vsOpponentContent: 'rebuttals',
    multiplier: 0.5,
    reasoning: 'Prepared rebuttals can dismantle even well-researched attacks',
    realBattleExample: 'Researched angles neutralized by quick counter-punches',
  },

  // =====================================================
  // WORDPLAY Weaknesses (Technical)
  // =====================================================
  {
    yourContent: 'wordplay',
    vsOpponentContent: 'comedy',
    multiplier: 0.5,
    reasoning: 'Complex bars get laughed at instead of appreciated',
    realBattleExample: 'Technical battlers losing crowd to entertaining opponents',
  },

  // =====================================================
  // SCHEMES Weaknesses (Technical)
  // =====================================================
  {
    yourContent: 'schemes',
    vsOpponentContent: 'punchlines',
    multiplier: 0.5,
    reasoning: 'Setup-heavy content vulnerable to quick knockout blows',
    realBattleExample: 'Long setups interrupted by haymakers',
  },
  {
    yourContent: 'schemes',
    vsOpponentContent: 'comedy',
    multiplier: 0.5,
    reasoning: 'Entertainment beats complexity for casual crowds',
    realBattleExample: 'Complex schemes losing to crowd-pleasing comedy',
  },
  {
    yourContent: 'schemes',
    vsOpponentContent: 'street_talk',
    multiplier: 0.5,
    reasoning: 'Street credibility makes fancy schemes look soft and corny',
    realBattleExample: 'Technical rappers exposed as not real by street battlers',
  },
  {
    yourContent: 'schemes',
    vsOpponentContent: 'freestyles',
    multiplier: 0.5,
    reasoning: 'Pre-written complexity can\'t counter spontaneous adaptation',
    realBattleExample: 'Prepared material looking robotic vs fresh responses',
  },

  // =====================================================
  // COMEDY Weaknesses (Entertainment)
  // =====================================================
  {
    yourContent: 'comedy',
    vsOpponentContent: 'personals',
    multiplier: 0.5,
    reasoning: 'Jokes can\'t deflect real damage, looks defensive',
    realBattleExample: 'Comedic battlers struggling against serious personal attacks',
  },

  // =====================================================
  // STORYTELLING Weaknesses (Technical)
  // =====================================================
  {
    yourContent: 'storytelling',
    vsOpponentContent: 'punchlines',
    multiplier: 0.5,
    reasoning: 'Long narratives interrupted by haymakers',
    realBattleExample: 'Stories cut short by quotable punches',
  },
  {
    yourContent: 'storytelling',
    vsOpponentContent: 'pop_culture_refs',
    multiplier: 0.5,
    reasoning: 'Quick relevant punches beat slow narrative builds',
    realBattleExample: 'Stories losing momentum to timely one-liners',
  },

  // =====================================================
  // GUN BARS Weaknesses (Attack)
  // =====================================================
  {
    yourContent: 'gun_bars',
    vsOpponentContent: 'personals',
    multiplier: 0.5,
    reasoning: 'Generic threats demolished by researched personal information',
    realBattleExample: 'Boasting made to look foolish by researched angles',
  },
  {
    yourContent: 'gun_bars',
    vsOpponentContent: 'street_talk',
    multiplier: 0.5,
    reasoning: 'Generic threats lose to authentic lived experience',
    realBattleExample: 'Performed aggression vs real street credibility',
  },
  {
    yourContent: 'gun_bars',
    vsOpponentContent: 'wordplay',
    multiplier: 0.5,
    reasoning: 'One-dimensional content exposed by technical skill',
    realBattleExample: 'Gun bars looking basic against intricate wordplay',
  },

  // =====================================================
  // FREESTYLES Weaknesses (Adaptive)
  // =====================================================
  {
    yourContent: 'freestyles',
    vsOpponentContent: 'gun_bars',
    multiplier: 0.5,
    reasoning: 'Improvisation overwhelmed by aggressive pre-written content',
    realBattleExample: 'Freestyle attempts buried by heavy gun bars',
  },

  // =====================================================
  // REBUTTALS Weaknesses (Adaptive)
  // =====================================================
  {
    yourContent: 'rebuttals',
    vsOpponentContent: 'freestyles',
    multiplier: 0.5,
    reasoning: 'Pre-written rebuttals can\'t match spontaneous flow',
    realBattleExample: 'Prepared counters looking stale vs fresh improvisation',
  },

  // =====================================================
  // POP CULTURE REFS Weaknesses (Entertainment)
  // =====================================================
  {
    yourContent: 'pop_culture_refs',
    vsOpponentContent: 'wordplay',
    multiplier: 0.5,
    reasoning: 'Surface-level references lose to technical depth on replay',
    realBattleExample: 'Simple name-drops can\'t match linguistic complexity',
  },

  // =====================================================
  // NAME FLIPS Weaknesses (Entertainment)
  // =====================================================
  {
    yourContent: 'name_flips',
    vsOpponentContent: 'punchlines',
    multiplier: 0.5,
    reasoning: 'Repetitive hooks lose to substantive haymakers',
    realBattleExample: 'Name flip reliance exposed by hard punchers',
  },
  {
    yourContent: 'name_flips',
    vsOpponentContent: 'storytelling',
    multiplier: 0.5,
    reasoning: 'Shallow hooks can\'t match narrative depth',
    realBattleExample: 'Name flips feeling empty vs immersive stories',
  },

  // =====================================================
  // SHOCK VALUE Weaknesses (Attack)
  // =====================================================
  {
    yourContent: 'shock_value',
    vsOpponentContent: 'schemes',
    multiplier: 0.5,
    reasoning: 'Cheap provocations exposed as lacking substance',
    realBattleExample: 'Controversial content losing to crafted writing',
  },
  {
    yourContent: 'shock_value',
    vsOpponentContent: 'rebuttals',
    multiplier: 0.5,
    reasoning: 'Controversial content easily flipped back',
    realBattleExample: 'Shock tactics turned against the user',
  },

  // =====================================================
  // SOCIAL COMMENTARY Weaknesses (Technical)
  // =====================================================
  {
    yourContent: 'social_commentary',
    vsOpponentContent: 'personals',
    multiplier: 0.5,
    reasoning: 'Personal attacks cut through political messaging',
    realBattleExample: 'Conscious bars derailed by personal angles',
  },
  {
    yourContent: 'social_commentary',
    vsOpponentContent: 'comedy',
    multiplier: 0.5,
    reasoning: 'Preachy content gets mocked, loses crowd energy',
    realBattleExample: 'Political bars made boring by entertaining opponent',
  },
  {
    yourContent: 'social_commentary',
    vsOpponentContent: 'gun_bars',
    multiplier: 0.5,
    reasoning: 'Violence disrupts thoughtful discourse',
    realBattleExample: 'Aggressive threats drowning out conscious content',
  },
  {
    yourContent: 'social_commentary',
    vsOpponentContent: 'pop_culture_refs',
    multiplier: 0.5,
    reasoning: 'Relatable references beat heavy messages',
    realBattleExample: 'Political content losing to fun pop culture bars',
  },

  // =====================================================
  // DELIVERY TYPE MATCHUPS
  // =====================================================
  {
    yourContent: 'nonchalant',
    vsOpponentContent: 'aggressive',
    multiplier: 0.5,
    reasoning: 'Cool demeanor overwhelmed by intense energy',
    realBattleExample: 'Laid-back style losing crowd to high-energy opponent',
  },
  {
    yourContent: 'conversational',
    vsOpponentContent: 'speed_rapping',
    multiplier: 0.5,
    reasoning: 'Casual pace buried by technical speed',
    realBattleExample: 'Slow-paced delivery overwhelmed by rapid-fire flows',
  },
  {
    yourContent: 'nonchalant',
    vsOpponentContent: 'passionate',
    multiplier: 0.5,
    reasoning: 'Coolness looks uninvested vs conviction and emotion',
    realBattleExample: 'Nonchalant delivery seeming uncaring vs emotional battler',
  },

  // =====================================================
  // PERFORMANCE TYPE MATCHUPS
  // =====================================================
  {
    yourContent: 'minimalist',
    vsOpponentContent: 'theatrical',
    multiplier: 0.5,
    reasoning: 'Subtle gestures buried by dramatic showmanship',
    realBattleExample: 'Understated performers losing to big stage presence',
  },
  {
    yourContent: 'minimalist',
    vsOpponentContent: 'crowd_interaction',
    multiplier: 0.5,
    reasoning: 'Passive presence loses to active crowd engagement',
    realBattleExample: 'Stoic performers looking detached vs call-and-response',
  },
  {
    yourContent: 'minimalist',
    vsOpponentContent: 'dynamic_range',
    multiplier: 0.5,
    reasoning: 'Flat delivery dominated by volume variation',
    realBattleExample: 'Monotone performers buried by whisper-to-shout technique',
  },
];

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get effectiveness multiplier for your content vs opponent's content
 * Returns 2.0 (super effective), 1.0 (neutral), or 0.5 (not very effective)
 */
export function getEffectiveness(
  yourContent: ContentType | DeliveryType | PerformanceType,
  opponentContent: ContentType | DeliveryType | PerformanceType
): EffectivenessMultiplier {
  // Check super effective matchups
  const superEffective = SUPER_EFFECTIVE_MATCHUPS.find(
    m => m.yourContent === yourContent && m.vsOpponentContent === opponentContent
  );
  if (superEffective) return 2.0;

  // Check not very effective matchups
  const notVeryEffective = NOT_VERY_EFFECTIVE_MATCHUPS.find(
    m => m.yourContent === yourContent && m.vsOpponentContent === opponentContent
  );
  if (notVeryEffective) return 0.5;

  // Default: neutral
  return 1.0;
}

/**
 * Get detailed matchup information including reasoning
 */
export function getMatchupDetails(
  yourContent: ContentType | DeliveryType | PerformanceType,
  opponentContent: ContentType | DeliveryType | PerformanceType
): EffectivenessMatchup | null {
  // Check super effective
  let matchup = SUPER_EFFECTIVE_MATCHUPS.find(
    m => m.yourContent === yourContent && m.vsOpponentContent === opponentContent
  );
  if (matchup) return matchup;

  // Check not very effective
  matchup = NOT_VERY_EFFECTIVE_MATCHUPS.find(
    m => m.yourContent === yourContent && m.vsOpponentContent === opponentContent
  );
  if (matchup) return matchup;

  // Neutral (no specific matchup defined)
  return {
    yourContent,
    vsOpponentContent: opponentContent,
    multiplier: 1.0,
    reasoning: 'No specific advantage or disadvantage - comes down to execution',
  };
}

/**
 * Get all super effective matchups for a given content type
 * (what does this content beat?)
 */
export function getSuperEffectiveAgainst(
  yourContent: ContentType | DeliveryType | PerformanceType
): EffectivenessMatchup[] {
  return SUPER_EFFECTIVE_MATCHUPS.filter(m => m.yourContent === yourContent);
}

/**
 * Get all not very effective matchups for a given content type
 * (what does this content struggle against?)
 */
export function getNotVeryEffectiveAgainst(
  yourContent: ContentType | DeliveryType | PerformanceType
): EffectivenessMatchup[] {
  return NOT_VERY_EFFECTIVE_MATCHUPS.filter(m => m.yourContent === yourContent);
}

/**
 * Get a description of effectiveness (for UI display)
 */
export function getEffectivenessLabel(multiplier: EffectivenessMultiplier): string {
  if (multiplier === 2.0) return 'Super Effective';
  if (multiplier === 0.5) return 'Not Very Effective';
  return 'Neutral';
}

/**
 * Get color coding for effectiveness (for UI)
 */
export function getEffectivenessColor(multiplier: EffectivenessMultiplier): string {
  if (multiplier === 2.0) return 'text-green-500'; // Tailwind class
  if (multiplier === 0.5) return 'text-red-500';
  return 'text-zinc-400';
}

// =====================================================
// AGGREGATION TUNING (content effectiveness -> round multiplier)
// =====================================================
// NOTE: these constants live here rather than in lib/game/config.ts because
// this file's edit domain excludes config.ts. Good candidates to migrate into
// CONFIG later (e.g. CONFIG.CONTENT_EDGE_SPREAD).
//
// WHY THIS CHANGED: the OLD aggregation took the MEAN of every cross-pair of
// your ~6 picks vs their ~6 (~36 pairs). One genuine 2.0 counter among 36
// neutral-ish pairs moved the result only ~+3%, so a "hard counter" was almost
// invisible and content "barely mattered". The NEW model scores COVERAGE:
// what fraction of YOUR arsenal actually lands a counter, minus the fraction
// that walks into a hard counter. A real counter now produces a felt swing,
// and it stays bounded and clamped.
export const CONTENT_EDGE_SPREAD = 0.6; // swing away from 1.0 at full coverage
export const CONTENT_MULT_FLOOR = 0.55; // walked into everything they brought
export const CONTENT_MULT_CEIL = 1.6; // hard-countered everything they brought

/**
 * Content effectiveness multiplier for a full round of picks vs the opponent's.
 *
 * COVERAGE model (replaces the old full-cross-product mean): for each of YOUR
 * picks we ask two yes/no questions against their whole set —
 *   - does it LAND (super-effective 2.0 vs at least one of their picks)?
 *   - is it EXPOSED (countered 0.5 by at least one of their picks)?
 * A pick can be both (a wash). We then reward the FRACTION of your arsenal that
 * lands and penalize the FRACTION that's exposed. Because both terms are
 * fractions of your own picks they are naturally in [0,1], so the result is
 * inherently bounded before the explicit clamp.
 *
 * Feel (with the tuning above):
 *   - hard-counter their main style  -> ~1.30-1.55x
 *   - neutral / mirror mix           -> ~1.00x
 *   - walk into their counters       -> ~0.60-0.70x
 *
 * Signature is preserved so existing callers (simulation, the content API
 * route, forecasting) keep working — only the math inside changed.
 */
export function calculateAverageEffectiveness(
  yourContentTypes: (ContentType | DeliveryType | PerformanceType)[],
  opponentContentTypes: (ContentType | DeliveryType | PerformanceType)[]
): number {
  if (yourContentTypes.length === 0 || opponentContentTypes.length === 0) {
    return 1.0; // Neutral if no content
  }

  let landingPicks = 0; // your picks that beat at least one of their picks (2.0)
  let exposedPicks = 0; // your picks countered by at least one of their picks (0.5)

  for (const yourContent of yourContentTypes) {
    let lands = false;
    let exposed = false;
    for (const oppContent of opponentContentTypes) {
      const eff = getEffectiveness(yourContent, oppContent);
      if (eff === 2.0) lands = true;
      else if (eff === 0.5) exposed = true;
    }
    if (lands) landingPicks++;
    if (exposed) exposedPicks++;
  }

  const n = yourContentTypes.length;
  const offense = landingPicks / n; // 0..1 of your arsenal that lands a counter
  const defense = exposedPicks / n; // 0..1 of your arsenal that gets countered
  const edge = offense - defense; // -1..+1 net coverage edge

  const multiplier = 1.0 + edge * CONTENT_EDGE_SPREAD;
  return Math.max(CONTENT_MULT_FLOOR, Math.min(CONTENT_MULT_CEIL, multiplier));
}

/**
 * Get strategic advice for a matchup
 */
export function getStrategicAdvice(
  yourContent: ContentType | DeliveryType | PerformanceType,
  opponentContent: ContentType | DeliveryType | PerformanceType
): string {
  const effectiveness = getEffectiveness(yourContent, opponentContent);
  const matchup = getMatchupDetails(yourContent, opponentContent);

  if (effectiveness === 2.0) {
    return `✓ Strong choice! ${matchup?.reasoning || 'Your content has the advantage.'}`;
  } else if (effectiveness === 0.5) {
    return `⚠ Risky choice! ${matchup?.reasoning || 'Opponent\'s content counters yours.'}`;
  } else {
    return `→ Even matchup. ${matchup?.reasoning || 'Execution will decide the outcome.'}`;
  }
}

/**
 * Get all effectiveness matchups (for testing/debugging)
 */
export function getAllMatchups(): {
  superEffective: EffectivenessMatchup[];
  notVeryEffective: EffectivenessMatchup[];
} {
  return {
    superEffective: SUPER_EFFECTIVE_MATCHUPS,
    notVeryEffective: NOT_VERY_EFFECTIVE_MATCHUPS,
  };
}
