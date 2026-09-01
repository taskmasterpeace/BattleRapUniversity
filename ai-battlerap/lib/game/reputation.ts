/**
 * Reputation engine — "respect made concrete."
 *
 * Owner steer (2026-09-01): kill the abstract Scene-Respect points bar.
 * Reputation is OBSERVABLE stuff a fan can see, derived from real career events:
 *
 *   1. LABELS that stick — what the blogs/crowd call you (Body Bag Collector,
 *      Choker, Washed, Problem, Robbed). True or not, they pin and they carry.
 *   2. A RECOGNITION MAP — which scenes actually know your name
 *      ("Known in NYC · Buzzing in Newark · Unknown in Atlanta").
 *   3. SIGNATURE WINS — the names on your resume that people care about.
 *
 * This module is PURE (no DB, no React) so it can be unit-tested / Monte-Carlo'd
 * and reused by the career API, the dashboard, and future media generators.
 *
 * See docs/design/CORE_LOOP_AND_ERAS.md → "Owner refinements".
 */

export type LabelTone = 'gas' | 'shade' | 'neutral';

export interface RepLabel {
  key: string;
  /** What shows on the chip, e.g. "BODY BAG COLLECTOR". */
  label: string;
  tone: LabelTone;
  /** Why it stuck — the receipt. "3 bodies on the resume." */
  reason: string;
  /** 0-100. How loud this label is right now — drives sort + prominence. */
  heat: number;
  /** Human-readable teeth: how the world treats you for it. */
  effect?: string;
}

export type RecognitionLevel = 'unknown' | 'heard' | 'buzzing' | 'known' | 'respected';

export interface RecognitionEntry {
  cityId: string | null;
  city: string;
  state?: string | null;
  region?: string | null;
  level: RecognitionLevel;
  /** 0-100 raw recognition. */
  score: number;
  battles: number;
  wins: number;
  home: boolean;
}

export interface SignatureWin {
  opponentId: string;
  opponentName: string;
  score: string;
  /** Opponent rating — how much the name is worth. */
  weight: number;
  tier?: string | null;
  /** 3-0 over a rated name. */
  bodied: boolean;
}

export interface RepBattle {
  opponentId: string;
  opponentName: string;
  result: 'W' | 'L';
  /** "2-1" from the battler's POV. */
  score: string;
  /** How many of MY rounds I choked in this battle. */
  chokedRounds: number;
  bestPeak: number;
  cityId: string | null;
  city: string | null;
  state?: string | null;
  region?: string | null;
  opponentRating?: number;
  opponentTier?: string | null;
  date: string;
}

export interface ReputationInput {
  rating: number;
  tier?: string | null;
  wins: number;
  losses: number;
  streak: number;
  battles: RepBattle[];
  /** life_events template_code[] this battler has collected. */
  lifeEventCodes: string[];
  /** Press sentiment rows (blogger_memory). */
  press?: Array<{ pos: number; neg: number }>;
  /** Career average crowd reaction 0-100 (drives Crowd Killer). */
  avgCrowd?: number;
  homeCityId?: string | null;
  homeCity?: string | null;
  homeState?: string | null;
  homeRegion?: string | null;
  styleTags?: string[];
}

export interface Reputation {
  /** One-line "word on you" for headers. */
  summary: string;
  labels: RepLabel[];
  recognition: RecognitionEntry[];
  signatureWins: SignatureWin[];
  /** Quick totals the UI leans on. */
  meta: {
    totalBattles: number;
    bodies: number;
    chokes: number;
    scenesKnown: number;
  };
}

// ── recognition scoring ─────────────────────────────────────────────────────

const REC = {
  HOME_BASE: 62, // they know you where you're from (reads KNOWN before you spit)
  PER_BATTLE: 13, // showing up in a room gets you known
  WIN_BONUS: 11,
  BODY_BONUS: 9, // a 3-0 in someone's city travels
  LOSS_EXPOSURE: 6, // even an L put your name in the building
  MIN_SHOWN: 15, // below this you're a stranger there — don't list it
} as const;

export function recognitionLevel(score: number): RecognitionLevel {
  if (score >= 85) return 'respected';
  if (score >= 60) return 'known';
  if (score >= 35) return 'buzzing';
  if (score >= REC.MIN_SHOWN) return 'heard';
  return 'unknown';
}

// Awareness, not esteem — the map says how well a scene knows your NAME.
// (A washed vet is still a known name; the respect lives in the labels.)
export const RECOGNITION_META: Record<RecognitionLevel, { word: string; blurb: string }> = {
  respected: { word: 'A STAPLE', blurb: 'a fixture of this scene — everybody knows you here' },
  known: { word: 'KNOWN', blurb: 'the scene knows exactly who you are' },
  buzzing: { word: 'BUZZING', blurb: 'your name is starting to travel here' },
  heard: { word: 'HEARD OF', blurb: 'a few heads have caught wind' },
  unknown: { word: 'UNKNOWN', blurb: 'a total stranger in this city' },
};

function buildRecognition(input: ReputationInput): RecognitionEntry[] {
  const map = new Map<string, RecognitionEntry>();

  const keyOf = (cityId: string | null, name: string) => cityId ?? `name:${name.toLowerCase()}`;

  // Home turf: you're known where you're from before you throw a bar.
  if (input.homeCity) {
    const k = keyOf(input.homeCityId ?? null, input.homeCity);
    map.set(k, {
      cityId: input.homeCityId ?? null,
      city: input.homeCity,
      state: input.homeState ?? null,
      region: input.homeRegion ?? null,
      level: 'known',
      score: REC.HOME_BASE,
      battles: 0,
      wins: 0,
      home: true,
    });
  }

  for (const b of input.battles) {
    if (!b.city) continue; // no venue city on record — counts as buzz, not a place
    const k = keyOf(b.cityId, b.city);
    const cur =
      map.get(k) ??
      ({
        cityId: b.cityId,
        city: b.city,
        state: b.state ?? null,
        region: b.region ?? null,
        level: 'unknown',
        score: 0,
        battles: 0,
        wins: 0,
        home: false,
      } as RecognitionEntry);

    cur.battles += 1;
    let gain = REC.PER_BATTLE;
    if (b.result === 'W') {
      cur.wins += 1;
      gain += REC.WIN_BONUS;
      if (b.score === '3-0') gain += REC.BODY_BONUS;
    } else {
      gain = REC.LOSS_EXPOSURE;
    }
    cur.score = Math.min(100, cur.score + gain);
    map.set(k, cur);
  }

  return Array.from(map.values())
    .map((e) => ({ ...e, level: recognitionLevel(e.score) }))
    .filter((e) => e.home || e.score >= REC.MIN_SHOWN)
    .sort((a, b) => Number(b.home) - Number(a.home) || b.score - a.score);
}

// ── signature wins ──────────────────────────────────────────────────────────

function buildSignatureWins(input: ReputationInput): SignatureWin[] {
  const wins = input.battles.filter((b) => b.result === 'W');
  // A "name on your resume" scales with who YOU are: floor sits ~200 below your
  // rating but never counts a scrub. Beating a top/god name always makes the cut.
  const floor = Math.max(1100, input.rating - 200);
  const isBigName = (b: RepBattle) =>
    (b.opponentRating ?? 0) >= floor ||
    b.opponentTier === 'top' ||
    b.opponentTier === 'god';

  return wins
    .filter(isBigName)
    .map((b) => ({
      opponentId: b.opponentId,
      opponentName: b.opponentName,
      score: b.score,
      weight: b.opponentRating ?? 1000,
      tier: b.opponentTier ?? null,
      bodied: b.score === '3-0',
    }))
    .sort((a, b) => b.weight - a.weight || Number(b.bodied) - Number(a.bodied))
    .slice(0, 5);
}

// ── labels ──────────────────────────────────────────────────────────────────

function buildLabels(input: ReputationInput): RepLabel[] {
  const out: RepLabel[] = [];
  const push = (l: RepLabel) => out.push(l);

  const total = input.battles.length;
  const wins = input.wins;
  const losses = input.losses;
  const winRate = total > 0 ? wins / total : 0;
  const bodies = input.battles.filter((b) => b.result === 'W' && b.score === '3-0').length;
  const chokes = input.battles.reduce((n, b) => n + b.chokedRounds, 0);
  const bestPeak = input.battles.reduce((m, b) => Math.max(m, b.bestPeak), 0);
  const codes = new Set(input.lifeEventCodes);
  const has = (c: string) => codes.has(c);

  // No tape yet — the honest blank slate.
  if (total === 0) {
    push({
      key: 'unwritten',
      label: 'UNWRITTEN',
      tone: 'neutral',
      reason: 'No tape, no reputation yet — the pen is still blank.',
      heat: 20,
      effect: 'Nobody has a read on you. Your first battle writes the first line.',
    });
  }

  // ── career shape ──
  if (total >= 3 && losses === 0) {
    push({
      key: 'untouchable',
      label: 'UNTOUCHABLE',
      tone: 'gas',
      reason: `${wins}-0 — nobody's got a W on you yet.`,
      heat: 96,
      effect: 'A target on your back. Everyone wants to be the first to hand you an L.',
    });
  } else if (input.streak >= 3) {
    push({
      key: 'on_a_run',
      label: 'ON A RUN',
      tone: 'gas',
      reason: `${input.streak} straight — the momentum is real.`,
      heat: 78,
      effect: 'Promoters chase a hot hand. Bigger names start answering your callouts.',
    });
  }

  if (total >= 6 && winRate >= 0.7) {
    push({
      key: 'problem',
      label: 'A PROBLEM',
      tone: 'gas',
      reason: `${wins}-${losses} — a genuine problem for anybody booked across from you.`,
      heat: 82,
      effect: 'Opponents prep harder and longer. Some quietly avoid the matchup.',
    });
  }

  // Skidding / washed — the culture is brutal about decline.
  if (input.streak <= -3 || has('CAREER_CRISIS')) {
    const washed = has('CAREER_CRISIS') && losses > wins;
    push({
      key: washed ? 'washed' : 'skidding',
      label: washed ? 'WASHED' : 'SKIDDING',
      tone: 'shade',
      reason: washed
        ? 'The blogs are writing the obituary — career crisis, more L’s than W’s.'
        : `${Math.abs(input.streak)} straight losses — the shine is coming off.`,
      heat: washed ? 84 : 66,
      effect: 'Weaker offers, colder rooms. You get booked as somebody else’s get-back.',
    });
  }

  // ── bodies ──
  if (bodies >= 3) {
    push({
      key: 'body_bag_collector',
      label: 'BODY BAG COLLECTOR',
      tone: 'gas',
      reason: `${bodies} clean 3-0 bodies on the resume.`,
      heat: 88,
      effect: 'Crowds show up expecting a body. The pressure to deliver rides with you.',
    });
  } else if (bodies >= 1) {
    push({
      key: 'got_bodies',
      label: 'GOT BODIES',
      tone: 'gas',
      reason: `${bodies} body${bodies > 1 ? '' : ''} on tape — you’ve swept a room.`,
      heat: 58,
      effect: 'People know you can end somebody. Underdogs think twice.',
    });
  }

  // ── record shape: who, where, and how you win ──
  const upsetWins = input.battles.filter(
    (b) => b.result === 'W' && (b.opponentRating ?? 0) >= input.rating + 55
  ).length;
  if (upsetWins >= 2) {
    push({
      key: 'upset_king',
      label: 'UPSET KING',
      tone: 'gas',
      reason: `${upsetWins} wins over names rated above you — you make favorites sweat.`,
      heat: 80,
      effect: 'Nobody books you as a safe win. Ranked battlers treat you as live.',
    });
  }

  const awayWins = input.battles.filter(
    (b) => b.result === 'W' && b.cityId && input.homeCityId && b.cityId !== input.homeCityId
  ).length;
  if (awayWins >= 3) {
    push({
      key: 'road_warrior',
      label: 'ROAD WARRIOR',
      tone: 'gas',
      reason: `${awayWins} wins in rooms that weren't yours — hostile crowds don't shake you.`,
      heat: 68,
      effect: 'You travel well. Leagues in other cities want you on their cards.',
    });
  }

  const homeWins = input.battles.filter(
    (b) => b.result === 'W' && b.cityId && b.cityId === input.homeCityId
  ).length;
  const homeLosses = input.battles.filter(
    (b) => b.result === 'L' && b.cityId && b.cityId === input.homeCityId
  ).length;
  if (homeWins >= 3 && homeWins > homeLosses * 2) {
    push({
      key: 'hometown_hero',
      label: 'HOMETOWN HERO',
      tone: 'gas',
      reason: `${homeWins}-${homeLosses} on home turf — your city rides for you hard.`,
      heat: 62,
      effect: 'A guaranteed hot crowd at home. Opponents dread the away trip to your city.',
    });
  }

  // Gatekeeper: a seasoned name who keeps stopping the come-up.
  const provenWins = input.battles.filter(
    (b) => b.result === 'W' && (b.opponentRating ?? 0) < input.rating - 40
  ).length;
  if (total >= 8 && provenWins >= 4 && winRate >= 0.55) {
    push({
      key: 'gatekeeper',
      label: 'GATEKEEPER',
      tone: 'neutral',
      reason: 'The test every up-and-comer has to pass — you stop the hype trains.',
      heat: 56,
      effect: 'Rookies get booked against you to prove themselves. Beating you makes careers.',
    });
  }

  if (total >= 3 && (input.avgCrowd ?? 0) >= 78) {
    push({
      key: 'crowd_killer',
      label: 'CROWD KILLER',
      tone: 'gas',
      reason: `${Math.round(input.avgCrowd ?? 0)}% average crowd — you turn rooms up every time out.`,
      heat: 64,
      effect: 'Promoters want you for the energy alone. The crowd is in your corner early.',
    });
  }

  // ── chokes — a credibility killer in this culture ──
  if (chokes >= 2 || has('CHOKE_IN_BIG_BATTLE')) {
    push({
      key: 'choker',
      label: 'CHOKER',
      tone: 'shade',
      reason: has('CHOKE_IN_BIG_BATTLE')
        ? 'Blanked on the big stage — the clip lives forever.'
        : `Choked in ${chokes} rounds — the room remembers.`,
      heat: 90,
      effect: 'Opponents bet on your nerves and press early. The crowd waits for you to crack.',
    });
  } else if (chokes === 1 || has('CHOKE_EVENT')) {
    push({
      key: 'sweated_one',
      label: 'SWEATED ONE',
      tone: 'shade',
      reason: 'Lost the words once — a stumble the blogs clipped.',
      heat: 44,
      effect: 'A small question mark on your composure. Shake it with a clean showing.',
    });
  }

  // ── moments ──
  if (bestPeak >= 9 || has('BODYBAG_HYPE')) {
    push({
      key: 'moment_maker',
      label: 'MOMENT MAKER',
      tone: 'gas',
      reason: bestPeak >= 9 ? `Dropped a ${bestPeak.toFixed(1)} peak — a certified moment.` : 'Gave the culture a moment people still quote.',
      heat: 74,
      effect: 'Your name comes up in "best bars" talk. Clips carry your buzz between battles.',
    });
  }

  // ── robbed (the culture respects a good L) ──
  if (has('CONTROVERSIAL_LOSS')) {
    push({
      key: 'robbed',
      label: 'ROBBED',
      tone: 'neutral',
      reason: 'Took an L the internet still argues about — you won the crowd, lost the card.',
      heat: 60,
      effect: 'Sympathy buzz. Fans demand the rematch louder than a clean win would.',
    });
  }

  // ── beef ──
  if (has('RIVAL_CALLOUT')) {
    push({
      key: 'starts_smoke',
      label: 'STARTS SMOKE',
      tone: 'neutral',
      reason: 'Out here calling names out — you keep a beef simmering.',
      heat: 52,
      effect: 'Grudge matches sell. The angle writes itself, but so do the enemies.',
    });
  }

  // ── press narrative ──
  if (input.press && input.press.length > 0) {
    const pos = input.press.reduce((s, p) => s + p.pos, 0);
    const neg = input.press.reduce((s, p) => s + p.neg, 0);
    if (neg - pos >= 40) {
      push({
        key: 'blog_villain',
        label: 'BLOG VILLAIN',
        tone: 'shade',
        reason: 'The press stays on your neck — you’re the story they love to hate.',
        heat: 70,
        effect: 'Coverage cuts against you. Bad angles stick easier, good ones get buried.',
      });
    } else if (pos - neg >= 40) {
      push({
        key: 'blog_darling',
        label: 'BLOG DARLING',
        tone: 'gas',
        reason: 'The blogs ride for you — favorable coverage follows you around.',
        heat: 62,
        effect: 'The press gives you the benefit of the doubt. Buzz builds itself.',
      });
    }
  }

  // ── style identity (from CODING / style tags) — neutral, always-on flavor ──
  const styleLabel = styleIdentity(input.styleTags ?? []);
  if (styleLabel && out.filter((l) => l.tone === 'neutral').length < 2) push(styleLabel);

  // ── rookie fallback when nothing louder stuck ──
  if (total > 0 && total <= 3 && out.every((l) => l.heat < 60)) {
    push({
      key: 'fresh_face',
      label: 'FRESH FACE',
      tone: 'neutral',
      reason: `${total} on tape — too early to have a real read on you.`,
      heat: 30,
      effect: 'Nobody’s scouted you yet. Surprise is on your side — for now.',
    });
  }

  return out.sort((a, b) => b.heat - a.heat).slice(0, 6);
}

function styleIdentity(tags: string[]): RepLabel | null {
  const t = tags.map((s) => s.toLowerCase());
  const hit = (...keys: string[]) => keys.some((k) => t.some((tag) => tag.includes(k)));
  if (hit('punch', 'haymaker')) return mk('PUNCHER', 'Lives for the haymaker — one line to shut the room down.');
  if (hit('lyric', 'bar', 'wordplay', 'scheme', 'technical')) return mk('LYRICIST', 'A pen-first battler — schemes and wordplay over theatrics.');
  if (hit('perform', 'stage', 'crowd', 'charisma')) return mk('PERFORMER', 'Runs on stage presence — controls the room with energy.');
  if (hit('aggress', 'street', 'grime', 'raw')) return mk('AGGRESSOR', 'Comes with pressure — aggression and intimidation first.');
  if (hit('story', 'angle', 'comedy')) return mk('ANGLE MASTER', 'Wins on angles and story — gets in your head, not just your face.');
  return null;

  function mk(label: string, reason: string): RepLabel {
    return { key: `style_${label.toLowerCase().replace(/\s+/g, '_')}`, label, tone: 'neutral', reason, heat: 34 };
  }
}

// ── summary ─────────────────────────────────────────────────────────────────

function buildSummary(input: ReputationInput, labels: RepLabel[], rec: RecognitionEntry[]): string {
  if (input.battles.length === 0) {
    return 'Unwritten — no tape, no reputation yet. Go take a name.';
  }
  const hot = labels.find((l) => l.heat >= 55);
  const record = `${input.wins}-${input.losses}`;
  const topScene = rec.find((r) => r.level === 'respected' || r.level === 'known');
  const reach = rec.filter((r) => r.score >= REC.MIN_SHOWN).length;

  const parts: string[] = [];
  if (hot) parts.push(hot.label);
  parts.push(record);
  if (topScene) {
    parts.push(`${RECOGNITION_META[topScene.level].word.toLowerCase()} in ${topScene.city}`);
  } else if (reach > 0) {
    parts.push(`name moving in ${reach} scene${reach > 1 ? 's' : ''}`);
  } else {
    parts.push('still a local name');
  }
  return parts.join(' · ');
}

// ── public entry ────────────────────────────────────────────────────────────

// ── teeth ───────────────────────────────────────────────────────────────────
//
// Labels aren't just flavor — they change how the world treats you. This turns a
// battler's live labels into gameplay deltas the sim and the offer generator
// consume. (Wiring points: crowdDelta → crowd_reaction; pressurePenalty → choke
// chance; offerAppeal → who's willing to book you; opponentPrepBias → how hard
// the AI preps against you; rematchDemandBias → grudge/rematch pull.)

export interface ReputationModifiers {
  /** Added to crowd reaction, roughly -12..+12. */
  crowdDelta: number;
  /** Added to per-segment choke chance from nerves/target-on-back, 0..~0.05. */
  pressurePenalty: number;
  /** How attractive you are to book, -1..+1 (bigger names, better cards). */
  offerAppeal: number;
  /** How much harder opponents prep for you, 0..1. */
  opponentPrepBias: number;
  /** Fan pull for grudges/rematches, 0..1. */
  rematchDemandBias: number;
  /** Which labels drove the numbers — for tooltips / "why". */
  notes: string[];
}

const MOD_RULES: Record<
  string,
  Partial<Omit<ReputationModifiers, 'notes'>> & { note?: string }
> = {
  untouchable: { offerAppeal: 0.5, opponentPrepBias: 0.35, pressurePenalty: 0.015, note: 'target on your back' },
  problem: { offerAppeal: 0.35, opponentPrepBias: 0.3, note: 'they prep for you' },
  on_a_run: { offerAppeal: 0.3, crowdDelta: 3, note: 'hot hand' },
  upset_king: { offerAppeal: 0.3, opponentPrepBias: 0.25, note: 'live underdog' },
  body_bag_collector: { crowdDelta: 6, offerAppeal: 0.3, opponentPrepBias: 0.2, note: 'they expect a body' },
  got_bodies: { crowdDelta: 3, offerAppeal: 0.12, note: 'proven finisher' },
  moment_maker: { crowdDelta: 6, offerAppeal: 0.25, note: 'clip machine' },
  crowd_killer: { crowdDelta: 8, offerAppeal: 0.2, note: 'brings the energy' },
  hometown_hero: { crowdDelta: 4, note: 'home crowd rides' },
  road_warrior: { offerAppeal: 0.22, crowdDelta: 2, note: 'travels well' },
  gatekeeper: { opponentPrepBias: 0.3, offerAppeal: 0.1, note: 'the test to pass' },
  blog_darling: { crowdDelta: 4, offerAppeal: 0.2, note: 'press rides for you' },
  robbed: { crowdDelta: 5, rematchDemandBias: 0.5, note: 'sympathy + rematch heat' },
  starts_smoke: { rematchDemandBias: 0.45, offerAppeal: 0.18, note: 'grudges sell' },
  choker: { pressurePenalty: 0.045, opponentPrepBias: 0.3, crowdDelta: -4, note: 'they press your nerves' },
  sweated_one: { pressurePenalty: 0.015, note: 'small composure question' },
  washed: { offerAppeal: -0.55, crowdDelta: -6, note: 'booked as a get-back' },
  skidding: { offerAppeal: -0.3, crowdDelta: -3, note: 'cold streak' },
  blog_villain: { opponentPrepBias: 0.2, crowdDelta: -5, offerAppeal: -0.1, rematchDemandBias: 0.2, note: 'the story they hate' },
};

export function reputationModifiers(rep: Reputation): ReputationModifiers {
  const acc: ReputationModifiers = {
    crowdDelta: 0,
    pressurePenalty: 0,
    offerAppeal: 0,
    opponentPrepBias: 0,
    rematchDemandBias: 0,
    notes: [],
  };
  for (const label of rep.labels) {
    const rule = MOD_RULES[label.key];
    if (!rule) continue;
    acc.crowdDelta += rule.crowdDelta ?? 0;
    acc.pressurePenalty += rule.pressurePenalty ?? 0;
    acc.offerAppeal += rule.offerAppeal ?? 0;
    acc.opponentPrepBias += rule.opponentPrepBias ?? 0;
    acc.rematchDemandBias += rule.rematchDemandBias ?? 0;
    if (rule.note) acc.notes.push(`${label.label}: ${rule.note}`);
  }
  // Clamp to sane ranges so a stacked resume can't run away.
  acc.crowdDelta = clamp(acc.crowdDelta, -12, 12);
  acc.pressurePenalty = clamp(acc.pressurePenalty, 0, 0.05);
  acc.offerAppeal = clamp(acc.offerAppeal, -1, 1);
  acc.opponentPrepBias = clamp(acc.opponentPrepBias, 0, 1);
  acc.rematchDemandBias = clamp(acc.rematchDemandBias, 0, 1);
  return acc;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function deriveReputation(input: ReputationInput): Reputation {
  const labels = buildLabels(input);
  const recognition = buildRecognition(input);
  const signatureWins = buildSignatureWins(input);
  const summary = buildSummary(input, labels, recognition);

  return {
    summary,
    labels,
    recognition,
    signatureWins,
    meta: {
      totalBattles: input.battles.length,
      bodies: input.battles.filter((b) => b.result === 'W' && b.score === '3-0').length,
      chokes: input.battles.reduce((n, b) => n + b.chokedRounds, 0),
      scenesKnown: recognition.filter((r) => r.level === 'known' || r.level === 'respected').length,
    },
  };
}
