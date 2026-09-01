/**
 * Sticky-label lifecycle — PURE reducer for the stored "on your record" layer.
 *
 * Flow (docs/design/STICKY_LABELS.md §6): an event/battle produces a pin → the
 * label is created or reinforced → it decays on the completed-battle clock →
 * it retires when its gate is met (or never, if permanent). No DB, no React —
 * a server adapter maps DB rows ↔ StoredLabel and persists the result.
 */

import {
  LABELS,
  ALLEGATION_STAGES,
  PERMANENT_FLOOR,
  RETIRE_AT,
  type LabelDef,
  type LabelTier,
  type EvidenceStage,
} from './registry';
import type { LabelTone } from '../reputation';

export interface StoredLabel {
  key: string;
  tier: LabelTier;
  tone: LabelTone;
  heat: number;
  /** Completed-battle count already applied (prevents double / read-triggered decay). */
  processedBattleCount: number;
  /** Recovery progress — clean battles since the last relapse. */
  evidenceCount: number;
  /** Recovery progress at the incident's stakes or higher. */
  qualifyingEvidenceCount: number;
  status: 'active' | 'retired';
  pinnedAt?: string;
  lastReinforcedAt?: string;
  source?: Record<string, unknown>;
}

export interface PinRequest {
  key: string;
  /** Override the registry default heat (own-it vs hide-it, allegation stage). */
  heat?: number;
  tier?: LabelTier;
  tone?: LabelTone;
  source?: Record<string, unknown>;
}

// ── create / reinforce ──────────────────────────────────────────────────────

export function newStoredLabel(pin: PinRequest, now?: string): StoredLabel | null {
  const def = LABELS[pin.key];
  if (!def) return null;
  return {
    key: pin.key,
    tier: pin.tier ?? def.tier,
    tone: pin.tone ?? def.tone,
    heat: clampHeat(pin.heat ?? def.defaultHeat),
    processedBattleCount: 0,
    evidenceCount: 0,
    qualifyingEvidenceCount: 0,
    status: 'active',
    pinnedAt: now,
    lastReinforcedAt: now,
    source: pin.source,
  };
}

/**
 * Upsert a pin into a collection (one row per key). A reinforcement bumps heat
 * and can PROMOTE tier (allegation rumor → receipt → corroborated) but never
 * demotes. Reactivates a retired row.
 */
export function pinOrReinforce(stored: StoredLabel[], pin: PinRequest, now?: string): StoredLabel[] {
  const def = LABELS[pin.key];
  if (!def) return stored;
  const idx = stored.findIndex((l) => l.key === pin.key);
  if (idx === -1) {
    const created = newStoredLabel(pin, now);
    return created ? [...stored, created] : stored;
  }
  const cur = stored[idx];
  const promotedTier = higherTier(cur.tier, pin.tier ?? cur.tier);
  // Reinforcement: to the greater of a bump or the pin's explicit (stage) heat.
  const bumped = Math.max(cur.heat + def.reinforce, pin.heat ?? 0);
  const next: StoredLabel = {
    ...cur,
    tier: promotedTier,
    tone: pin.tone ?? cur.tone,
    heat: clampHeat(bumped),
    status: 'active',
    lastReinforcedAt: now,
    // A relapse resets recovery progress.
    evidenceCount: 0,
    qualifyingEvidenceCount: 0,
    source: pin.source ?? cur.source,
  };
  const copy = stored.slice();
  copy[idx] = next;
  return copy;
}

// ── decay / recovery ────────────────────────────────────────────────────────

export interface AdvanceContext {
  /** Battles since last advance that had ZERO chokes (for CHOKER recovery). */
  cleanBattles?: number;
  /** Of those, how many were at the incident's stakes or higher. */
  cleanQualifying?: number;
}

/**
 * Advance every label to the current completed-battle count: decay first, then
 * counter-evidence, then retire if the gate is met. Pure — returns a new array.
 */
export function advanceLabels(
  stored: StoredLabel[],
  battlesCompleted: number,
  ctx: AdvanceContext = {},
): StoredLabel[] {
  return stored.map((label) => advanceOne(label, battlesCompleted, ctx));
}

function advanceOne(label: StoredLabel, battlesCompleted: number, ctx: AdvanceContext): StoredLabel {
  const def = LABELS[label.key];
  if (!def || label.status === 'retired') return label;
  const battles = battlesCompleted - label.processedBattleCount;
  if (battles <= 0) return label;

  let heat = label.heat + def.decayPerBattle * battles;
  let evidenceCount = label.evidenceCount;
  let qualifyingEvidenceCount = label.qualifyingEvidenceCount;

  // Counter-evidence: CHOKER's clean-battle recovery (the reference durable gate).
  if (label.key === 'choker') {
    const clean = Math.min(ctx.cleanBattles ?? 0, battles);
    evidenceCount += clean;
    qualifyingEvidenceCount += Math.min(ctx.cleanQualifying ?? 0, clean);
    heat += -10 * clean; // extra counter-evidence on top of decay
  }

  if (label.tier === 'permanent') {
    heat = Math.max(PERMANENT_FLOOR, heat);
  }
  heat = clampHeat(heat);

  const retired = shouldRetire({ ...label, heat, evidenceCount, qualifyingEvidenceCount }, def);

  return {
    ...label,
    heat,
    evidenceCount,
    qualifyingEvidenceCount,
    processedBattleCount: battlesCompleted,
    status: retired ? 'retired' : 'active',
  };
}

function shouldRetire(label: StoredLabel, def: LabelDef): boolean {
  if (label.tier === 'permanent') return false;
  if (label.tier === 'fresh') return label.heat < RETIRE_AT;
  // durable: needs the counter-evidence gate AND low heat.
  if (label.heat > RETIRE_AT) return false;
  if (label.key === 'choker') {
    return label.evidenceCount >= 5 && label.qualifyingEvidenceCount >= 2;
  }
  // Other durable labels retire once heat bleeds to the floor.
  return label.heat <= RETIRE_AT;
}

// ── generation ──────────────────────────────────────────────────────────────

export type OriginKey = 'text_forums' | 'app_camera' | 'crew' | string;

const ORIGIN_LABEL: Record<string, string> = {
  text_forums: 'pen_first',
  app_camera: 'internet_battler',
  crew: 'circle_tested',
};

const CITY_REASON: Record<string, string> = {
  technical: 'Came through a technical scene — pen-heavy by upbringing.',
  aggressive: 'Raised in a pressure-heavy scene — comes with aggression.',
  street: 'Came through a street-rooted scene — the co-sign is real.',
  diverse: 'Raised around mixed styles — a bit of everything.',
};

/** Labels baked at character creation from origin + hometown. */
export function assignGenerationLabels(input: {
  origin?: OriginKey | null;
  cityId?: string | null;
  cityName?: string | null;
  cityStyle?: string | null;
}): PinRequest[] {
  const pins: PinRequest[] = [];
  const originKey = input.origin ? ORIGIN_LABEL[input.origin] : undefined;
  if (originKey) pins.push({ key: originKey, source: { origin: input.origin } });
  if (input.cityId || input.cityName) {
    pins.push({
      key: 'hometown_made',
      source: {
        cityId: input.cityId ?? null,
        cityName: input.cityName ?? null,
        reason: input.cityStyle ? CITY_REASON[input.cityStyle] : undefined,
      },
    });
  }
  return pins;
}

// ── event → pin mapping ─────────────────────────────────────────────────────

export interface EventContext {
  /** Player choice on a choice-based event. */
  choice?: string;
  /** Allegation evidence level (rumor → receipt → corroborated). */
  evidenceStage?: EvidenceStage;
  /** Did the underlying event become PUBLIC? Private events don't pin. */
  isPublic?: boolean;
  /** For DUCKING_PATTERN: how many callouts ignored so far. */
  ignoreCount?: number;
  source?: Record<string, unknown>;
}

/**
 * Which sticky label a life event pins (or null — not every event makes a
 * reputation). Choice- and evidence-dependent per Codex's mapping.
 */
export function mapEventToPin(eventCode: string, ctx: EventContext = {}): PinRequest | null {
  const src = ctx.source ?? { event: eventCode };
  switch (eventCode) {
    case 'CHOKE_IN_BIG_BATTLE':
      return { key: 'choker', heat: ctx.choice === 'own' ? 85 : 95, source: src };
    case 'CAREER_CRISIS':
      return ctx.isPublic === false ? null : { key: 'washed', source: src };
    case 'CONTROVERSIAL_LOSS':
      return { key: 'robbed', heat: ctx.choice === 'quiet' ? 55 : 70, source: src };
    case 'RIVAL_CALLOUT':
      if (ctx.choice === 'accept') return { key: 'answered_the_call', source: src };
      if ((ctx.ignoreCount ?? 0) >= 3) return { key: 'ducking', source: src };
      return { key: 'ducking_talk', source: src };
    case 'DUCKING_PATTERN':
      return { key: 'ducking', source: src };
    case 'FINANCIAL_CRISIS':
      return ctx.isPublic ? { key: 'taking_any_check', source: src } : null;
    case 'INJURY_MINOR':
      return ctx.isPublic ? { key: 'battling_hurt', source: src } : null;
    case 'MEDIA_INTERVIEW':
      return ctx.choice === 'accept' ? { key: 'in_the_spotlight', source: src } : null;
    case 'BODYBAG_HYPE':
      return { key: 'moment_maker', heat: ctx.choice === 'low_key' ? 65 : 80, source: src };
    case 'WENT_MAINSTREAM':
      return { key: 'went_mainstream', source: src };
    case 'LEGAL_TROUBLE':
      return { key: 'legal_cloud', source: src };
    case 'LEGAL_CONVICTION':
      return { key: 'legal_cloud', tier: 'permanent', heat: 90, source: src };
    case 'STUDIO_GANGSTER_EXPOSED':
      return { key: 'studio_gangster', source: src };
    case 'SNITCH_ALLEGATION':
      return allegationPin('snitch', ctx.evidenceStage ?? 'rumor', src);
    case 'GHOSTWRITER_ALLEGATION':
      return allegationPin('ghostwriter', ctx.evidenceStage ?? 'rumor', src);
    // Private / no-reputation events:
    case 'FAMILY_WEDDING':
    case 'DOMINANT_VICTORY':
    case 'TRAINING_PARTNER':
    case 'VENUE_CHANGE':
      return null;
    default:
      return null;
  }
}

function allegationPin(key: string, stage: EvidenceStage, source: Record<string, unknown>): PinRequest {
  const s = ALLEGATION_STAGES[key][stage];
  return { key, tier: s.tier, tone: s.tone, heat: s.heat, source: { ...source, evidenceStage: stage } };
}

// ── helpers ─────────────────────────────────────────────────────────────────

const TIER_RANK: Record<LabelTier, number> = { fresh: 0, durable: 1, permanent: 2 };
function higherTier(a: LabelTier, b: LabelTier): LabelTier {
  return TIER_RANK[b] > TIER_RANK[a] ? b : a;
}
function clampHeat(h: number): number {
  return Math.max(0, Math.min(100, Math.round(h)));
}
