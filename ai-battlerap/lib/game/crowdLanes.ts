/**
 * Crowd Demographic Lanes — per-round audience reaction derivation
 *
 * The crowd is not a monolith. Three fan demographics watch every battle
 * (per the original design: the "lyrical miracles" crowd, the ladies, and
 * the core urban battle rap audience) and each lane reacts to a round with
 * one of three levels: LOVED IT / MIXED / COLD.
 *
 * ── DETERMINISTIC MAPPING (no Math.random — same battle always renders the same) ──
 *
 *   laneScore = round.crowd_reaction                       // 0-100 base from the sim
 *             + tagAffinity(battler.style_tags, lane)      // +6 per matching style tag (cap +12),
 *                                                          //   -6 per clashing tag (cap -12)
 *             + leagueLean(lane, writing/performance wt)   // pen heads over-index in writing
 *                                                          //   leagues, ladies in performance
 *                                                          //   leagues: (weight - 0.5) * 30
 *             + (round.peak_score >= 8.5 ? +8 : 0)         // a haymaker moves EVERYBODY
 *             - (round.choked ? 35 : 0)                    // nobody forgives a choke
 *             + jitter(battleId, round, lane, battler)     // hash-derived [-5..+5] personal taste
 *
 *   reaction:  laneScore >= 70 → 'loved' (🔥)
 *              laneScore >= 45 → 'mixed' (😐)
 *              otherwise       → 'cold'  (🧊)
 *
 * Sprite face per lane is also deterministic: the race of the crowd member is
 * drawn from the league's crowd_demographics weights via the same hash, and
 * the sprite variant is picked from a VERIFIED on-disk inventory (with
 * fallback to the black set, which is the only complete one).
 */

export type CrowdLaneId = 'pen_heads' | 'the_ladies' | 'the_block';
export type LaneReaction = 'loved' | 'mixed' | 'cold';

export interface CrowdLaneDef {
  id: CrowdLaneId;
  name: string;
  blurb: string;
  /** lowercase keywords matched against battler style_tags (substring match) */
  likes: string[];
  clashes: string[];
  /** which league weight this lane keys off: writing | performance | none */
  lean: 'writing' | 'performance' | 'none';
}

export const CROWD_LANES: CrowdLaneDef[] = [
  {
    id: 'pen_heads',
    name: 'PEN HEADS',
    blurb: 'Lyrical miracles crowd — schemes, wordplay, technical writing',
    likes: [
      'pen', 'wordplay', 'scheme', 'technical', 'lyric', 'metaphor',
      'multisyllab', 'punchline', 'writer', 'creativ',
    ],
    clashes: ['lazy writer', 'one-trick'],
    lean: 'writing',
  },
  {
    id: 'the_ladies',
    name: 'THE LADIES',
    blurb: 'Charisma, delivery, stage command — the show matters',
    likes: [
      'charisma', 'charm', 'stage domination', 'crowd favorite', 'delivery',
      'smooth', 'persona', 'energy', 'performer', 'showtime',
    ],
    clashes: ['stage fright', 'weak stage'],
    lean: 'performance',
  },
  {
    id: 'the_block',
    name: 'THE BLOCK',
    blurb: 'Core battle rap audience — authenticity, aggression, street talk',
    likes: [
      'gun bar', 'aggressive', 'street', 'battle tested', 'veteran',
      'authentic', 'raw', 'grime', 'hood', 'brawler',
    ],
    clashes: ['overcomplicated'],
    lean: 'none',
  },
];

// ── Deterministic hashing ────────────────────────────────────────────────

/** FNV-1a 32-bit — stable across renders and sessions */
export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** hash → [0, 1) */
function hash01(str: string): number {
  return fnv1a(str) / 0x100000000;
}

// ── Lane score derivation ────────────────────────────────────────────────

export interface LaneScoreInput {
  battleId: string;
  roundIndex: number;
  battlerId: string;
  crowdReaction: number; // 0-100
  peakScore: number;
  choked: boolean;
  styleTags: string[];
  writingWeight: number;
  performanceWeight: number;
}

export interface LaneResult {
  lane: CrowdLaneDef;
  score: number;
  reaction: LaneReaction;
  /** verified sprite path for this lane's representative crowd member */
  sprite: string;
}

function tagAffinity(styleTags: string[], lane: CrowdLaneDef): number {
  const tags = styleTags.map((t) => String(t).toLowerCase());
  let bonus = 0;
  let malus = 0;
  for (const keyword of lane.likes) {
    if (tags.some((t) => t.includes(keyword))) bonus += 6;
  }
  for (const keyword of lane.clashes) {
    if (tags.some((t) => t.includes(keyword))) malus += 6;
  }
  return Math.min(bonus, 12) - Math.min(malus, 12);
}

function leagueLean(lane: CrowdLaneDef, writingWeight: number, performanceWeight: number): number {
  if (lane.lean === 'writing') return (writingWeight - 0.5) * 30;
  if (lane.lean === 'performance') return (performanceWeight - 0.5) * 30;
  return 0;
}

export function reactionFromScore(score: number): LaneReaction {
  if (score >= 70) return 'loved';
  if (score >= 45) return 'mixed';
  return 'cold';
}

export const REACTION_DISPLAY: Record<LaneReaction, { emoji: string; label: string; tone: string }> = {
  loved: { emoji: '🔥', label: 'LOVED IT', tone: 'text-[#ff8c42]' },
  mixed: { emoji: '😐', label: 'MIXED', tone: 'text-zinc-400' },
  cold: { emoji: '🧊', label: 'COLD', tone: 'text-sky-400' },
};

// ── Sprite inventory (verified against /public/sprites/crowd/organized) ──

type SpriteRace = 'black' | 'white' | 'mixed';

const SPRITE_FILES: Record<SpriteRace, Partial<Record<string, number[]>>> = {
  black: {
    hype: [1, 2, 3, 5, 6, 13, 14, 17, 22],
    cheer: [1, 2, 6, 9, 10, 13, 14, 15, 19, 25, 26, 32],
    stunned: [1, 3, 4, 5, 7, 8, 9, 10, 12, 15, 16, 21, 31, 33],
    watch: [1, 2, 3, 4, 7, 8, 15, 21],
    think: [1, 2, 5, 7, 14, 18, 20],
    boo: [1, 2, 3, 7, 9],
    unimpressed: [1, 2, 4, 6, 11],
    cringe: [1, 4, 5, 9],
    disappointed: [1, 2, 4],
  },
  white: {
    hype: [3, 4, 5, 6],
    cheer: [1, 2, 3, 7],
    stunned: [1, 2, 4, 8],
    watch: [5, 8, 13],
    think: [2, 3],
    cringe: [1, 2, 3],
  },
  mixed: {
    hype: [3, 5],
    cheer: [1, 4],
    watch: [1, 3, 6, 8, 9, 11, 12, 13, 18],
    think: [1, 2],
  },
};

const REACTION_SPRITE_POOLS: Record<LaneReaction, string[]> = {
  loved: ['hype', 'cheer', 'stunned'],
  mixed: ['watch', 'think'],
  cold: ['boo', 'unimpressed', 'cringe', 'disappointed'],
};

export interface LeagueRaceDemographics {
  black: number;
  white: number;
  mixed: number;
}

function pickRace(seed: string, demo: LeagueRaceDemographics): SpriteRace {
  const r = hash01(seed + '|race');
  const total = (demo.black || 0) + (demo.white || 0) + (demo.mixed || 0) || 1;
  const black = (demo.black || 0) / total;
  const white = (demo.white || 0) / total;
  if (r < black) return 'black';
  if (r < black + white) return 'white';
  return 'mixed';
}

function pickSprite(seed: string, race: SpriteRace, reaction: LaneReaction): string {
  const pools = REACTION_SPRITE_POOLS[reaction];
  // collect (race, reaction, variant) candidates; fall back to black inventory
  // when this race has no sprites for the reaction category (e.g. mixed has no
  // negative sprites on disk)
  let candidates: Array<{ race: SpriteRace; kind: string; variant: number }> = [];
  for (const kind of pools) {
    const variants = SPRITE_FILES[race][kind];
    if (variants?.length) {
      candidates.push(...variants.map((v) => ({ race, kind, variant: v })));
    }
  }
  if (candidates.length === 0) {
    for (const kind of pools) {
      const variants = SPRITE_FILES.black[kind];
      if (variants?.length) {
        candidates.push(...variants.map((v) => ({ race: 'black' as SpriteRace, kind, variant: v })));
      }
    }
  }
  const pick = candidates[fnv1a(seed + '|sprite') % candidates.length];
  const num = String(pick.variant).padStart(3, '0');
  return `/sprites/crowd/organized/${pick.race}/${pick.kind}_${num}.png`;
}

// ── Main entry ───────────────────────────────────────────────────────────

export function deriveLaneReactions(
  input: LaneScoreInput,
  raceDemographics: LeagueRaceDemographics = { black: 0.5, white: 0.3, mixed: 0.2 }
): LaneResult[] {
  return CROWD_LANES.map((lane) => {
    const jitterSeed = `${input.battleId}|${input.roundIndex}|${lane.id}|${input.battlerId}`;
    const jitter = Math.floor(hash01(jitterSeed) * 11) - 5; // [-5..+5]

    const score =
      input.crowdReaction +
      tagAffinity(input.styleTags, lane) +
      leagueLean(lane, input.writingWeight, input.performanceWeight) +
      (input.peakScore >= 8.5 ? 8 : 0) -
      (input.choked ? 35 : 0) +
      jitter;

    const clamped = Math.max(0, Math.min(100, Math.round(score)));
    const reaction = reactionFromScore(clamped);

    return {
      lane,
      score: clamped,
      reaction,
      sprite: pickSprite(jitterSeed, pickRace(jitterSeed, raceDemographics), reaction),
    };
  });
}
