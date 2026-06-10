/**
 * Exhibition simulator — fantasy matchups between ANY two battlers.
 *
 * Reuses the real engine's segment math (simulateSegment / applyPrepModifiers)
 * but is 100% read-only: no rankings, payouts, progression, or news are
 * touched. This powers /matchup — the shareable "what happens when they
 * battle" feature.
 *
 * Both battlers get an identical balanced prep week, so the result reflects
 * attributes, badges, and the league's judging culture — a neutral-ground
 * dream match, the way fans argue about them.
 */
import {
  simulateSegment,
  applyPrepModifiers,
} from '@/lib/game/simulation';
import { calculateBadgeEffects } from '@/lib/game/badges';

type NeutralLeague = {
  name: string;
  writing_weight: number;
  performance_weight: number;
  base_crowd_factor: number;
  round_length_minutes: number;
};

const NEUTRAL_GROUND: NeutralLeague = {
  name: 'Neutral Ground',
  writing_weight: 0.5,
  performance_weight: 0.5,
  base_crowd_factor: 0.65,
  round_length_minutes: 2,
};

// Identical balanced prep for both sides — a fair fight.
const BALANCED_PREP = {
  researchDays: 2,
  writingDays: 2,
  performanceDays: 2,
  lifeDays: 0,
  restDays: 1,
};

export type ExhibitionRound = {
  roundIndex: number;
  a: { avg: number; peak: number; crowd: number; events: string[] };
  b: { avg: number; peak: number; crowd: number; events: string[] };
  winner: 'a' | 'b';
};

export type ExhibitionResult = {
  battlerA: { id: string; stageName: string; avatarUrl: string | null; tier: string | null; isReal: boolean };
  battlerB: { id: string; stageName: string; avatarUrl: string | null; tier: string | null; isReal: boolean };
  league: { name: string; writingWeight: number; performanceWeight: number };
  rounds: ExhibitionRound[];
  winnerId: string;
  verdict: '3-0' | '2-1';
  decision: string; // 'BODYBAG' | 'CLEAN SWEEP' | 'DEBATABLE' | 'CLEAR WIN'
  headline: string;
};

async function loadCombatant(supabase: any, battlerId: string) {
  const [{ data: battler }, { data: attrs }] = await Promise.all([
    supabase
      .from('battlers')
      .select('id, stage_name, tier, avatar_url, style_tags, is_real')
      .eq('id', battlerId)
      .single(),
    supabase.from('battler_attributes').select('*').eq('battler_id', battlerId).single(),
  ]);
  if (!battler || !attrs) throw new Error(`Battler ${battlerId} not found`);
  return { battler, attrs };
}

function roundAvg(scores: number[]) {
  return scores.reduce((s, x) => s + x, 0) / scores.length;
}

function makeHeadline(
  aName: string,
  bName: string,
  winnerName: string,
  loserName: string,
  verdict: '3-0' | '2-1',
  hadChoke: boolean,
  haymakers: number
): string {
  if (verdict === '3-0' && hadChoke) {
    return `${loserName.toUpperCase()} CHOKED AND IT GOT UGLY — ${winnerName.toUpperCase()} TAKES IT 3-0`;
  }
  if (verdict === '3-0') {
    const lines = [
      `NO DEBATE: ${winnerName.toUpperCase()} BODIES ${loserName.toUpperCase()} 3-0`,
      `${winnerName.toUpperCase()} LEFT NO DOUBT — CLEAN 3-0 OVER ${loserName.toUpperCase()}`,
      `IT WASN'T CLOSE: ${winnerName.toUpperCase()} 3-0`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  if (haymakers >= 3) {
    return `INSTANT CLASSIC: ${winnerName.toUpperCase()} EDGES ${loserName.toUpperCase()} 2-1 IN A SLUGFEST`;
  }
  const lines = [
    `THE 2-1 EVERYBODY WILL ARGUE ABOUT: ${winnerName.toUpperCase()} OVER ${loserName.toUpperCase()}`,
    `DEBATABLE! ${winnerName.toUpperCase()} TAKES ${loserName.toUpperCase()} 2-1 — RUN IT BACK?`,
    `${winnerName.toUpperCase()} SURVIVES ${loserName.toUpperCase()} 2-1 — THE COMMENTS WON'T AGREE`,
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

/**
 * Run a 3-round exhibition between two battlers. Read-only.
 * Pass a league row to fight under its judging culture, or omit for neutral ground.
 */
export async function runExhibition(
  supabase: any,
  battlerAId: string,
  battlerBId: string,
  league?: NeutralLeague | null
): Promise<ExhibitionResult> {
  const ground = league ?? NEUTRAL_GROUND;
  const [a, b] = await Promise.all([
    loadCombatant(supabase, battlerAId),
    loadCombatant(supabase, battlerBId),
  ]);

  const aBadges = calculateBadgeEffects(a.battler.style_tags || []);
  const bBadges = calculateBadgeEffects(b.battler.style_tags || []);

  const aMod = applyPrepModifiers(a.attrs, BALANCED_PREP, false, aBadges, ground as any);
  const bMod = applyPrepModifiers(b.attrs, BALANCED_PREP, false, bBadges, ground as any);

  // Opponent power baselines for the gap multiplier
  const power = (m: any) => ({
    writing: (m.writing.lyricism + m.writing.wordplay + m.writing.creativity) / 3,
    performance:
      (m.performance.stage_presence + m.performance.crowd_control + m.performance.delivery) / 3,
  });
  const aPower = power(aMod);
  const bPower = power(bMod);

  const segmentsPerRound = ground.round_length_minutes === 3 ? 6 : 4;
  const rounds: ExhibitionRound[] = [];
  let aRounds = 0;
  let bRounds = 0;
  let totalHaymakers = 0;
  let hadChoke = false;

  for (let r = 1; r <= 3; r++) {
    const aScores: number[] = [];
    const bScores: number[] = [];
    const aEvents: string[] = [];
    const bEvents: string[] = [];
    let aCrowd = 0;
    let bCrowd = 0;

    for (let s = 0; s < segmentsPerRound; s++) {
      const segA = simulateSegment(
        a.battler.id, aMod, BALANCED_PREP as any, ground as any,
        r, s, false, aBadges, bPower.writing, bPower.performance
      );
      const segB = simulateSegment(
        b.battler.id, bMod, BALANCED_PREP as any, ground as any,
        r, s, false, bBadges, aPower.writing, aPower.performance
      );
      aScores.push(segA.score);
      bScores.push(segB.score);
      aEvents.push(...segA.events);
      bEvents.push(...segB.events);
      aCrowd += segA.crowdReaction;
      bCrowd += segB.crowdReaction;
    }

    const aAvg = roundAvg(aScores);
    const bAvg = roundAvg(bScores);
    const winner = aAvg >= bAvg ? 'a' : 'b';
    if (winner === 'a') aRounds++;
    else bRounds++;

    totalHaymakers += aEvents.filter((e) => e === 'haymaker').length;
    totalHaymakers += bEvents.filter((e) => e === 'haymaker').length;
    if (aEvents.includes('choke') || bEvents.includes('choke')) hadChoke = true;

    rounds.push({
      roundIndex: r,
      a: {
        avg: Math.round(aAvg * 10) / 10,
        peak: Math.round(Math.max(...aScores) * 10) / 10,
        crowd: Math.round((aCrowd / segmentsPerRound) * 10),
        events: aEvents,
      },
      b: {
        avg: Math.round(bAvg * 10) / 10,
        peak: Math.round(Math.max(...bScores) * 10) / 10,
        crowd: Math.round((bCrowd / segmentsPerRound) * 10),
        events: bEvents,
      },
      winner,
    });
  }

  const aWon = aRounds > bRounds;
  const verdict: '3-0' | '2-1' = aRounds === 3 || bRounds === 3 ? '3-0' : '2-1';
  const winner = aWon ? a.battler : b.battler;
  const loser = aWon ? b.battler : a.battler;
  const decision =
    verdict === '3-0' ? (hadChoke ? 'CLEAN SWEEP' : 'BODYBAG') : totalHaymakers >= 3 ? 'CLASSIC' : 'DEBATABLE';

  return {
    battlerA: {
      id: a.battler.id,
      stageName: a.battler.stage_name,
      avatarUrl: a.battler.avatar_url,
      tier: a.battler.tier,
      isReal: !!a.battler.is_real,
    },
    battlerB: {
      id: b.battler.id,
      stageName: b.battler.stage_name,
      avatarUrl: b.battler.avatar_url,
      tier: b.battler.tier,
      isReal: !!b.battler.is_real,
    },
    league: {
      name: ground.name,
      writingWeight: ground.writing_weight,
      performanceWeight: ground.performance_weight,
    },
    rounds,
    winnerId: winner.id,
    verdict,
    decision,
    headline: makeHeadline(
      a.battler.stage_name,
      b.battler.stage_name,
      winner.stage_name,
      loser.stage_name,
      verdict,
      hadChoke,
      totalHaymakers
    ),
  };
}
