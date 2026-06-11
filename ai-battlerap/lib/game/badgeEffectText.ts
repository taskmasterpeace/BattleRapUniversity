/**
 * Badge Effect Text — single source of truth for "what does this badge DO?"
 *
 * Badge codes live in two worlds:
 *  - snake_case codes stored on battlers.style_tags / badge_costs ('punchline_heavy')
 *  - Display-name keys in BADGE_REGISTRY ('Punchline King/Queen') that carry
 *    the actual mechanical effects used by the simulation.
 *
 * This module resolves either form to its mechanical definition and renders
 * human-readable effect lines ('-2% choke risk', '+10% rebuttal when going
 * second'). Badges with no mechanical effects fall back to their flavor role
 * so EVERY badge shows the player something concrete.
 *
 * Used by: BadgeTooltip, BadgeUnlockModal, BadgeShowcase, /badges page.
 */

import { BADGE_REGISTRY, type BadgeDefinition } from '@/lib/game/badges';
import { BADGE_DESCRIPTIONS } from '@/lib/game/badgeDescriptions';

// snake_case code → BADGE_REGISTRY display-name key, for codes whose
// title-cased form doesn't match a registry key 1:1.
const CODE_TO_REGISTRY_KEY: Record<string, string> = {
  // Onboarding style tags
  wordplay: 'Wordplay Wizard',
  storytelling: 'Storytelling',
  freestyle: 'Freestyle Genius',
  technical: 'Technical Writer',
  angles: 'Angle Master',
  comedy: 'Comedy',
  aggressive: 'Aggressive',
  // Earned badges (badgeEarning.ts codes)
  punchline_heavy: 'Punchline King/Queen',
  metaphor_magician: 'Metaphor Master',
  scheme_king: 'Scheme Specialist',
  pen_game_elite: 'Pen Game Elite',
  multisyllabic_master: 'Multisyllabic Master',
  stage_presence: 'Stage Domination',
  crowd_control: 'Crowd Favorite',
  crowd_favorite: 'Crowd Favorite',
  smooth_flow: 'Smooth Flow',
  speed_rapper: 'Speed Rapping',
  clutch_performer: 'Clutch Performer',
  choker: 'Known Choker',
  respected_veteran: 'Respected Veteran',
  consummate_professional: 'Consummate Professional',
  main_stage_specialist: 'Big Stage Performer',
  small_room_killer: 'Metaphor Master',
  prepared_battler: 'Prepared Battler',
  overprepared: 'Overprepared',
  consistent_performer: 'Consistent Writer',
  consistent_grinder: 'Consistent Grinder',
  technical_writer: 'Technical Writer',
  angle_master: 'Angle Master',
  storyteller: 'Storytelling',
  enhanced_storyteller: 'Enhanced Storyteller',
  fallen_star: 'Fallen Star',
  drama_starter: 'Drama Starter',
  controversial: 'Controversial',
  unreliable: 'Unreliable',
  unpredictable: 'Unorthodox',
  off_the_top: 'Freestyle Genius',
  believable_persona: 'Believable Persona',
  battle_of_the_night_winner: 'Battle of the Night Winner',
  personal_attack_specialist: 'Personal Attacks',
  animated: 'Theatrical',
  comedian: 'Comedian',
  braggadocious: 'Braggadocious',
  gritty: 'Gritty',
  political_commentary: 'Political Commentary',
  shock_value: 'Shock Value',
  mumbler: 'Mumbler',
  monotone_deliverer: 'Monotone Deliverer',
  poor_breath_control: 'Poor Breath Control',
  energy_drainer: 'Energy Drainer',
  stiff_body_language: 'Stiff Body Language',
  recycler: 'Recycler',
  biter: 'Biter',
  reach_god: 'Reach God/Goddess',
  one_trick_pony: 'One-Trick Pony',
  filler_abuser: 'Filler Abuser',
  outdated_referencer: 'Outdated Referencer',
  lazy_writer: 'Lazy Writer',
  predictable: 'Predictable Rhymer',
  redundant: 'Redundant',
  overcomplicated: 'Overcomplicated',
  cliche_abuser: 'Cliche Abuser',
  name_flip_dependent: 'Name Flip Dependent',
  clout_chaser: 'Clout Chaser',
  career_plateaued: 'Career Plateaued',
  disrespectful: 'Disrespectful',
  known_stealer: 'Known Stealer',
  health_issues: 'Health Issues',
  jail_risk: 'Jail Risk',
  substance_issues: 'Substance Issues',
  financial_struggles: 'Financial Struggles',
  bitter_veteran: 'Bitter Veteran',
  backstabber: 'Backstabber',
  washed: 'Washed',
  weak_chin: 'Weak Chin',
  culture_vulture: 'Culture Vulture',
  glory_days_living: 'Living in Glory Days',
  social_media_created: 'Clout Chaser',
};

const titleCase = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Resolve a badge code (snake_case or display name) to its mechanical definition. */
export function resolveBadgeDefinition(code: string): BadgeDefinition | null {
  if (BADGE_REGISTRY[code]) return BADGE_REGISTRY[code];
  const aliased = CODE_TO_REGISTRY_KEY[code];
  if (aliased && BADGE_REGISTRY[aliased]) return BADGE_REGISTRY[aliased];
  const titled = titleCase(code);
  if (BADGE_REGISTRY[titled]) return BADGE_REGISTRY[titled];
  return null;
}

const pct = (mult: number) => `${mult > 1 ? '+' : ''}${Math.round((mult - 1) * 100)}%`;
const signedPct = (v: number) => `${v > 0 ? '+' : ''}${Math.round(v * 100)}%`;

type LineRule = { weight: number; text: string };

/**
 * All mechanical effect lines for a badge code, most impactful first.
 * Empty array = badge has no simulation effects (pure flavor/reputation).
 */
export function getBadgeEffectLines(code: string): string[] {
  const def = resolveBadgeDefinition(code);
  if (!def) return [];

  const lines: LineRule[] = [];
  const add = (cond: boolean, weight: number, text: string) => {
    if (cond) lines.push({ weight, text });
  };

  // Special mechanics first — these are what players ask about
  add((def.chokeReduction ?? 0) > 0, Math.abs(def.chokeReduction!) * 100 + 10,
    `${signedPct(-def.chokeReduction!)} choke risk`);
  add((def.chokeIncrease ?? 0) > 0, Math.abs(def.chokeIncrease!) * 100 + 10,
    `${signedPct(def.chokeIncrease!)} choke risk`);
  add((def.stumbleReduction ?? 0) > 0, Math.abs(def.stumbleReduction!) * 100 + 6,
    `${signedPct(-def.stumbleReduction!)} stumble risk`);
  add((def.stumbleIncrease ?? 0) > 0, Math.abs(def.stumbleIncrease!) * 100 + 6,
    `${signedPct(def.stumbleIncrease!)} stumble risk`);
  add((def.rebuttalBonus ?? 0) !== 0, Math.abs(def.rebuttalBonus ?? 0) * 100 + 5,
    `${signedPct(def.rebuttalBonus!)} rebuttals when going second`);
  add((def.peakBonus ?? 0) !== 0, Math.abs(def.peakBonus ?? 0) * 100 + 4,
    `${signedPct(def.peakBonus!)} peak moments (haymakers)`);
  add((def.crowdReactionBonus ?? 0) !== 0, Math.abs(def.crowdReactionBonus ?? 0) + 3,
    `${(def.crowdReactionBonus ?? 0) > 0 ? '+' : ''}${def.crowdReactionBonus} crowd reaction`);

  // Attribute multipliers
  const mults: Array<[keyof BadgeDefinition, string]> = [
    ['lyricismMultiplier', 'lyricism'],
    ['wordplayMultiplier', 'wordplay'],
    ['creativityMultiplier', 'creativity'],
    ['stagePresenceMultiplier', 'stage presence'],
    ['crowdControlMultiplier', 'crowd control'],
    ['deliveryMultiplier', 'delivery'],
  ];
  for (const [key, label] of mults) {
    const v = def[key] as number | undefined;
    if (typeof v === 'number' && Math.abs(v - 1) >= 0.03) {
      lines.push({ weight: Math.abs(v - 1) * 100, text: `${pct(v)} ${label}` });
    }
  }

  // Prep efficiencies
  const preps: Array<[keyof BadgeDefinition, string]> = [
    ['writingPrepEfficiency', 'writing prep'],
    ['performancePrepEfficiency', 'performance prep'],
    ['researchPrepEfficiency', 'research prep'],
    ['restEfficiency', 'rest days'],
    ['lifePrepEfficiency', 'life prep'],
  ];
  for (const [key, label] of preps) {
    const v = def[key] as number | undefined;
    if (typeof v === 'number' && Math.abs(v - 1) >= 0.03) {
      lines.push({ weight: Math.abs(v - 1) * 90, text: `${pct(v)} ${label} efficiency` });
    }
  }

  // Consistency / variance
  add((def.consistencyBonus ?? 0) > 0, (def.consistencyBonus ?? 0) * 2,
    `+${def.consistencyBonus} consistency`);
  add((def.consistencyPenalty ?? 0) > 0, (def.consistencyPenalty ?? 0) * 2,
    `-${def.consistencyPenalty} consistency`);
  const variance = def.segmentVarianceMultiplier;
  if (typeof variance === 'number' && Math.abs(variance - 1) >= 0.05) {
    lines.push({
      weight: Math.abs(variance - 1) * 50,
      text: variance > 1
        ? `${pct(variance)} round-to-round swing (boom or bust)`
        : `${pct(variance)} round-to-round swing (steadier)`,
    });
  }

  // League / prep-pattern bonuses
  add((def.smallRoomBonus ?? 0) !== 0, Math.abs(def.smallRoomBonus ?? 0) * 80,
    `${signedPct(def.smallRoomBonus!)} in small rooms`);
  add((def.mainStageBonus ?? 0) !== 0, Math.abs(def.mainStageBonus ?? 0) * 80,
    `${signedPct(def.mainStageBonus!)} on main stages`);
  add(def.lowPrepBonus === true, 8, 'Thrives on minimal prep (≤3 days)');
  add(def.highPrepBonus === true, 8, 'Rewards heavy prep (8+ days)');
  add(def.balancedPrepBonus === true, 8, 'Rewards balanced prep across categories');

  return lines.sort((a, b) => b.weight - a.weight).map((l) => l.text);
}

/**
 * One compact line for chips/cards: top mechanical effects joined together,
 * or the badge's flavor role when it has no simulation effects.
 */
export function getBadgeEffectText(code: string, maxParts: number = 3): string {
  const lines = getBadgeEffectLines(code);
  if (lines.length > 0) return lines.slice(0, maxParts).join(' · ');

  // Flavor fallback — first listed effect from the compendium, else description
  const desc = BADGE_DESCRIPTIONS[code];
  if (desc?.effects?.length) return desc.effects[0];
  if (desc?.description) return desc.description;
  return 'Flavor badge — shapes your reputation and storylines';
}

/** True when the badge has real simulation effects (vs pure flavor). */
export function badgeHasMechanicalEffects(code: string): boolean {
  return getBadgeEffectLines(code).length > 0;
}
