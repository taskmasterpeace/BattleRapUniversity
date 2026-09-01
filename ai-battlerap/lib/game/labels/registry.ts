/**
 * Sticky-label registry — the single source of truth for STORED reputation
 * labels (the "on your record" layer). Culture-grounded (research pass, sourced
 * in docs/design/STICKY_LABELS.md) with Codex's tier/heat/decay/modifier numbers.
 *
 * Live "current form" labels (On A Run, Untouchable, Body Bag Collector) are NOT
 * here — they stay computed in reputation.ts. This registry is only for labels
 * that PERSIST: baked at generation, or pinned by life events.
 *
 * Types are duplicated here as the source; reputation.ts re-uses LabelTone.
 */

import type { LabelTone } from '../reputation';

export type LabelTier = 'permanent' | 'durable' | 'fresh';
export type LabelTrigger = 'generation' | 'life_event' | 'performance';

/** Modifier vector at heat 100. Effective = configured × heat/100. */
export interface LabelModifiers {
  crowdDelta?: number;
  pressurePenalty?: number;
  offerAppeal?: number;
  opponentPrepBias?: number;
  rematchDemandBias?: number;
}

export interface LabelDef {
  key: string;
  label: string;
  tone: LabelTone;
  tier: LabelTier;
  trigger: LabelTrigger;
  /** Starting heat when first pinned (a pin may override, e.g. own-it vs hide-it). */
  defaultHeat: number;
  /** Heat lost per completed battle (negative). Usually the tier default. */
  decayPerBattle: number;
  /** Heat added on a valid reinforcement (cap 100). */
  reinforce: number;
  /** Why it stuck — shown on the chip. */
  reason: string;
  /** The teeth, in plain language. */
  effect: string;
  /** Gameplay vector at heat 100. */
  modifiers: LabelModifiers;
  /** How it comes off (human note). */
  recovery: string;
  /** The culture treats this as a reputation-ender. */
  worst?: boolean;
}

/** Per-tier decay defaults (Codex). */
export const TIER_DECAY: Record<LabelTier, number> = {
  permanent: -2,
  durable: -4,
  fresh: -15,
};

/** Heat floor a permanent label never decays below. */
export const PERMANENT_FLOOR = 40;
/** At/below this heat a label is retired (unless permanent). */
export const RETIRE_AT = 20;

const R = (
  key: string,
  label: string,
  tone: LabelTone,
  tier: LabelTier,
  trigger: LabelTrigger,
  defaultHeat: number,
  reason: string,
  effect: string,
  modifiers: LabelModifiers,
  recovery: string,
  worst = false,
): LabelDef => ({
  key,
  label,
  tone,
  tier,
  trigger,
  defaultHeat,
  decayPerBattle: TIER_DECAY[tier],
  reinforce: tier === 'permanent' ? 10 : 15,
  reason,
  effect,
  modifiers,
  recovery,
  worst,
});

export const LABELS: Record<string, LabelDef> = {
  // ── generation: who you are from the jump (durable identity, ZERO modifiers —
  //    origin attribute bonuses already exist, don't double-count) ──
  internet_battler: R(
    'internet_battler', 'INTERNET BATTLER', 'neutral', 'durable', 'generation', 65,
    'Built the buzz online — never proved it in a live room.',
    'You have to prove it live. The stage is the only test that shakes this.',
    {},
    '5 in-room battles, 3 of them clean with crowd ≥70.',
  ),
  pen_first: R(
    'pen_first', 'PEN FIRST', 'neutral', 'durable', 'generation', 60,
    'A pen-first battler — schemes and wordplay over theatrics.',
    'Bar-heads respect you; the crowd-first rooms want to see you perform it.',
    {},
    '5 in-room battles, 3 with strong performance (≥7) and crowd ≥70.',
  ),
  circle_tested: R(
    'circle_tested', 'CIRCLE TESTED', 'neutral', 'durable', 'generation', 65,
    'Came up through a crew — street-rooted, co-signed from day one.',
    'Your content lands as real. You still have to prove it outside the circle.',
    {},
    '8 professional battles outside the crew.',
  ),
  hometown_made: R(
    'hometown_made', 'CITY MADE', 'neutral', 'permanent', 'generation', 45,
    'Shaped by your city’s scene — it’s in your DNA.',
    'Core identity. The recognition map already carries your home advantage.',
    {},
    'Never — where you’re from doesn’t change.',
  ),

  // ── performance brands that PERSIST (the sticky "record" versions) ──
  choker: R(
    'choker', 'CHOKER', 'shade', 'durable', 'performance', 90,
    'Blanked when it counted — the clip lives forever.',
    'The crowd waits for you to crack and opponents press early. (The badge owns the actual choke risk.)',
    { crowdDelta: -5, offerAppeal: -0.1, opponentPrepBias: 0.3 },
    '5 straight battles with zero chokes, 2+ at the incident’s stakes.',
  ),
  washed: R(
    'washed', 'WASHED', 'shade', 'durable', 'performance', 84,
    'The blogs are writing the obituary — you lost a step.',
    'Weaker offers, colder rooms. You get booked as somebody else’s get-back.',
    { crowdDelta: -6, offerAppeal: -0.55 },
    '3 wins in 5 with no 0-3 loss, one at your old tier or higher.',
  ),

  // ── life events, durable ──
  ducking: R(
    'ducking', 'DUCKING SMOKE', 'shade', 'durable', 'life_event', 82,
    'Kept dodging a name people want to see you fight.',
    'Fans turn on you; grudge demand spikes. "Scared of the smoke" trails you.',
    { crowdDelta: -4, offerAppeal: -0.25, rematchDemandBias: 0.35 },
    'Sign and complete the named battle, or 2 equal/higher-risk battles in 5.',
  ),
  went_mainstream: R(
    'went_mainstream', 'WENT MAINSTREAM', 'neutral', 'durable', 'life_event', 75,
    'Blew up outside the leagues — validation to some, betrayal to purists.',
    'You draw and you’re bookable, but purists question if you’re still one of them.',
    { offerAppeal: 0.3, opponentPrepBias: 0.2 },
    'Fades on its own over ~14 battles if you keep showing up.',
  ),
  legal_cloud: R(
    'legal_cloud', 'LEGAL CLOUD', 'neutral', 'durable', 'life_event', 75,
    'A pending case hanging over everything you do.',
    'Books get shaky and the story follows you. A dismissal clears most of it.',
    { crowdDelta: -3, offerAppeal: -0.3, pressurePenalty: 0.008 },
    'Case dismissed (−40 heat, retires). A conviction makes it permanent.',
  ),
  studio_gangster: R(
    'studio_gangster', 'STUDIO GANGSTER', 'shade', 'durable', 'life_event', 78,
    'The tough persona the streets don’t co-sign — exposed as cap.',
    'Your hard content stops landing once the room reads the persona as fake.',
    { crowdDelta: -4, offerAppeal: -0.2, opponentPrepBias: 0.2 },
    'Only time and staying out of the "cap" conversation cools it.',
  ),

  // ── life events, permanent scars (the reputation-enders) ──
  snitch: R(
    'snitch', 'THE PAPERWORK', 'shade', 'permanent', 'life_event', 100,
    'Corroborated cooperation paperwork — the nuclear tag in this culture.',
    'Every opponent runs it forever. Crowds turn cold, the biggest names avoid you.',
    { crowdDelta: -8, offerAppeal: -0.45, opponentPrepBias: 0.3 },
    'Cannot be out-rapped. Only the paperwork being disproven touches it.',
    true,
  ),
  ghostwriter: R(
    'ghostwriter', 'GHOSTWRITTEN', 'shade', 'permanent', 'life_event', 95,
    'Corroborated that the bars aren’t yours — it invalidates the wins.',
    'For a battler billed on the pen, this attacks the whole claim. Coverage cuts against you.',
    { crowdDelta: -6, offerAppeal: -0.35, opponentPrepBias: 0.35 },
    'Cannot be out-rapped. Only being disproven touches it.',
    true,
  ),

  // ── life events, fresh (current cycle, decays fast) ──
  robbed: R(
    'robbed', 'ROBBED', 'neutral', 'fresh', 'life_event', 70,
    'Took an L the internet still argues about — won the crowd, lost the card.',
    'Sympathy buzz and loud rematch demand — louder than a clean win would get.',
    { crowdDelta: 5, rematchDemandBias: 0.5 },
    'Completing the rematch retires it immediately.',
  ),
  ducking_talk: R(
    'ducking_talk', 'DUCKING TALK', 'shade', 'fresh', 'life_event', 65,
    'Let a callout sit — the "he don’t want it" talk is starting.',
    'Early cowardice whispers. Answer it or it hardens into a real DUCKING brand.',
    { crowdDelta: -2, offerAppeal: -0.05 },
    'Answer the callout, or it fades — ignore three and it becomes DUCKING.',
  ),
  answered_the_call: R(
    'answered_the_call', 'ANSWERED THE CALL', 'gas', 'fresh', 'life_event', 60,
    'Somebody called you out and you said bet — no hesitation.',
    'The culture respects a battler who takes smoke. Buzz on the matchup.',
    { crowdDelta: 3, offerAppeal: 0.15 },
    'Fades as the battle passes into the record.',
  ),
  taking_any_check: R(
    'taking_any_check', 'TAKING ANY CHECK', 'shade', 'fresh', 'life_event', 50,
    'Money got tight and it showed — you’ll book anything for a bag.',
    'Reads as mercenary. Some see a pro; the culture side-eyes it.',
    { offerAppeal: 0.1, crowdDelta: -2 },
    'Fades quickly once you’re picking battles on merit again.',
  ),
  battling_hurt: R(
    'battling_hurt', 'BATTLING HURT', 'neutral', 'fresh', 'life_event', 45,
    'Pulled up banged up and battled anyway — respect for the heart.',
    'Fans respect the grit even if the performance dips.',
    { crowdDelta: 2 },
    'Fades as you heal up and keep working.',
  ),
  in_the_spotlight: R(
    'in_the_spotlight', 'IN THE SPOTLIGHT', 'neutral', 'fresh', 'life_event', 55,
    'The media came calling and you took the interview — eyes are on you.',
    'A buzz bump while the cycle is hot.',
    { offerAppeal: 0.1 },
    'Fades as the news cycle moves on.',
  ),
  moment_maker: R(
    'moment_maker', 'MOMENT MAKER', 'gas', 'fresh', 'life_event', 80,
    'Gave the culture a moment people still quote.',
    'Your name comes up in "best bars" talk; clips carry buzz between battles.',
    { crowdDelta: 6, offerAppeal: 0.25 },
    'Fades unless you keep dropping moments.',
  ),
};

/** Evidence stages for allegation labels — rumor never promotes to fact on its own. */
export type EvidenceStage = 'rumor' | 'receipt' | 'corroborated';

export interface AllegationStage {
  tier: LabelTier;
  tone: LabelTone;
  heat: number;
}

/** snitch/ghostwriter climb tiers ONLY with a stronger receipt (Codex). */
export const ALLEGATION_STAGES: Record<string, Record<EvidenceStage, AllegationStage>> = {
  snitch: {
    rumor: { tier: 'fresh', tone: 'shade', heat: 70 },
    receipt: { tier: 'durable', tone: 'shade', heat: 92 },
    corroborated: { tier: 'permanent', tone: 'shade', heat: 100 },
  },
  ghostwriter: {
    rumor: { tier: 'fresh', tone: 'shade', heat: 65 },
    receipt: { tier: 'durable', tone: 'shade', heat: 85 },
    corroborated: { tier: 'permanent', tone: 'shade', heat: 95 },
  },
};

export function labelDef(key: string): LabelDef | undefined {
  return LABELS[key];
}
