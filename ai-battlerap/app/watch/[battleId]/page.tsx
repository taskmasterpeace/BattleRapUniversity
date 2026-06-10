import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SpectatorReplay, { type ReplayRound, type SpectatorSide } from '@/components/watch/SpectatorReplay';
import TaleOfTheTape from '@/components/watch/TaleOfTheTape';
import JudgeScorecard from '@/components/battle/JudgeScorecard';

/**
 * Public spectator view — viewer-neutral (no "YOU"). Anybody can watch any
 * battle in the UniverCity: completed battles replay round-by-round with
 * the verdict stamp; upcoming battles show the tale of the tape.
 */

export const dynamic = 'force-dynamic';

const HAYMAKER_PEAK = 8.5;

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const battlerJoin = 'id, stage_name, avatar_url, tier, is_real';

async function loadBattle(supabase: ReturnType<typeof serviceClient>, battleId: string) {
  const { data } = await supabase
    .from('battles')
    .select(
      `id, status, scheduled_at, verdict, decision_type, winner_battler_id, league_id,
       league:leagues(id, name, writing_weight, performance_weight),
       a:battlers!battles_battler_player_id_fkey(${battlerJoin}),
       b:battlers!battles_battler_ai_id_fkey(${battlerJoin})`
    )
    .eq('id', battleId)
    .single();
  return data as any;
}

function decisionLabel(verdict: string | null, decisionType: string | null): string {
  const map: Record<string, string> = {
    bodybag: 'BODYBAG',
    clean_sweep: 'CLEAN SWEEP',
    gentlemans_30: "GENTLEMAN'S 3-0",
    classic: 'CLASSIC',
    edge: 'EDGE',
  };
  const label = decisionType ? map[decisionType] ?? decisionType.toUpperCase() : verdict === '3-0' ? 'BODYBAG' : 'DEBATABLE';
  return verdict ? `${verdict} ${label}` : label;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ battleId: string }>;
}): Promise<Metadata> {
  const { battleId } = await params;
  const battle = await loadBattle(serviceClient(), battleId);
  if (!battle || !battle.a || !battle.b) {
    return { title: 'Battle — Battle Rap University' };
  }
  const matchup = `${battle.a.stage_name} vs ${battle.b.stage_name}`;
  if (battle.status === 'completed' && battle.verdict) {
    const winner = battle.winner_battler_id === battle.a.id ? battle.a.stage_name : battle.b.stage_name;
    return {
      title: `${matchup} — ${decisionLabel(battle.verdict, battle.decision_type)}`,
      description: `${winner} takes it ${battle.verdict} at ${battle.league?.name ?? 'the UniverCity'}. Watch the full round-by-round breakdown.`,
    };
  }
  return {
    title: `${matchup} — Tale of the Tape`,
    description: `${matchup} goes down at ${battle.league?.name ?? 'the UniverCity'}. Records, attributes and the pre-fight breakdown.`,
  };
}

export default async function SpectatorPage({
  params,
}: {
  params: Promise<{ battleId: string }>;
}) {
  const { battleId } = await params;
  const supabase = serviceClient();

  const battle = await loadBattle(supabase, battleId);
  if (!battle || !battle.a || !battle.b) notFound();

  const sideA: SpectatorSide = {
    id: battle.a.id,
    name: battle.a.stage_name,
    avatarUrl: battle.a.avatar_url,
    tier: battle.a.tier,
    isReal: battle.a.is_real,
  };
  const sideB: SpectatorSide = {
    id: battle.b.id,
    name: battle.b.stage_name,
    avatarUrl: battle.b.avatar_url,
    tier: battle.b.tier,
    isReal: battle.b.is_real,
  };

  // ── PRE-FIGHT: tale of the tape ──────────────────────────────────────
  if (battle.status !== 'completed' || !battle.verdict) {
    const [{ data: attrs }, { data: ranks }] = await Promise.all([
      supabase
        .from('battler_attributes')
        .select('battler_id, writing, performance, resilience')
        .in('battler_id', [sideA.id, sideB.id]),
      supabase
        .from('rankings')
        .select('battler_id, rating, wins, losses, streak')
        .in('battler_id', [sideA.id, sideB.id]),
    ]);

    const attrOf = new Map((attrs || []).map((r: any) => [r.battler_id, r]));
    const rankOf = new Map((ranks || []).map((r: any) => [r.battler_id, r]));

    return (
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
        <TaleOfTheTape
          a={sideA}
          b={sideB}
          attrsA={attrOf.get(sideA.id) ?? null}
          attrsB={attrOf.get(sideB.id) ?? null}
          rankA={rankOf.get(sideA.id) ?? null}
          rankB={rankOf.get(sideB.id) ?? null}
          leagueName={battle.league?.name ?? 'UNKNOWN LEAGUE'}
          scheduledAt={battle.scheduled_at}
        />
      </div>
    );
  }

  // ── COMPLETED: round-by-round replay ─────────────────────────────────
  const [{ data: rounds }, { data: judgeScores }, { data: article }] = await Promise.all([
    supabase
      .from('battle_rounds')
      .select('round_index, battler_id, average_score, peak_score, crowd_reaction, choked, summary_text')
      .eq('battle_id', battleId)
      .order('round_index', { ascending: true }),
    supabase
      .from('battle_judge_scores')
      .select('judge_id, judge_name, battler_id, rounds_won, overall_composite_average, winner, round_evaluations')
      .eq('battle_id', battleId),
    supabase
      .from('news_articles')
      .select('slug, title')
      .eq('battle_id', battleId)
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const byRound = new Map<number, { a?: any; b?: any }>();
  for (const r of rounds || []) {
    const entry = byRound.get(r.round_index) ?? {};
    if (r.battler_id === sideA.id) entry.a = r;
    else if (r.battler_id === sideB.id) entry.b = r;
    byRound.set(r.round_index, entry);
  }

  const replayRounds: ReplayRound[] = Array.from(byRound.entries())
    .filter(([, e]) => e.a && e.b)
    .sort(([x], [y]) => x - y)
    .map(([roundIndex, e]) => ({
      roundIndex,
      a: {
        avg: Math.round(Number(e.a.average_score) * 10) / 10,
        peak: Math.round(Number(e.a.peak_score) * 10) / 10,
        crowd: e.a.crowd_reaction,
        choke: !!e.a.choked,
        haymaker: Number(e.a.peak_score) >= HAYMAKER_PEAK,
      },
      b: {
        avg: Math.round(Number(e.b.average_score) * 10) / 10,
        peak: Math.round(Number(e.b.peak_score) * 10) / 10,
        crowd: e.b.crowd_reaction,
        choke: !!e.b.choked,
        haymaker: Number(e.b.peak_score) >= HAYMAKER_PEAK,
      },
      winner: Number(e.a.average_score) >= Number(e.b.average_score) ? ('a' as const) : ('b' as const),
    }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
        <div className="text-center mb-8">
          <Link
            href="/watch"
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff8c42] hover:text-[#ff9d5c]"
          >
            ← TONIGHT&apos;S CARD
          </Link>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-zinc-500 mt-4">
            {battle.league?.name ?? 'UNKNOWN LEAGUE'}
            {battle.league?.writing_weight != null && (
              <>
                {' '}· {Math.round(Number(battle.league.writing_weight) * 100)}% PEN /{' '}
                {Math.round(Number(battle.league.performance_weight) * 100)}% PERFORMANCE
              </>
            )}
          </p>
        </div>

        <SpectatorReplay
          a={sideA}
          b={sideB}
          rounds={replayRounds}
          winnerId={battle.winner_battler_id}
          decision={decisionLabel(battle.verdict, battle.decision_type)}
        />

        {judgeScores && judgeScores.length > 0 && (
          <div className="mt-8">
            <JudgeScorecard
              judgeScores={judgeScores as any}
              playerBattlerId={sideA.id}
              opponentBattlerId={sideB.id}
              playerName={sideA.name}
              opponentName={sideB.name}
            />
          </div>
        )}

        {article && (
          <Link
            href={`/media/${article.slug}`}
            className="mt-8 block bg-[#18191c] border-l-4 border-[#ff8c42] p-5 hover:bg-[#1d1e22] transition-colors"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#ff8c42] mb-2">
              📰 READ THE WRITE-UP
            </p>
            <h2 className="font-display text-lg md:text-2xl font-black uppercase tracking-tight text-zinc-100">
              {article.title}
            </h2>
          </Link>
        )}

        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link
            href={`/battler/${sideA.id}`}
            className="text-center py-3 border-2 border-[#3a3d44] hover:border-[#ff8c42] font-display font-black text-xs uppercase tracking-wider text-zinc-200 transition-colors"
          >
            {sideA.name} — PROFILE
          </Link>
          <Link
            href={`/battler/${sideB.id}`}
            className="text-center py-3 border-2 border-[#3a3d44] hover:border-[#ff8c42] font-display font-black text-xs uppercase tracking-wider text-zinc-200 transition-colors"
          >
            {sideB.name} — PROFILE
          </Link>
        </div>

        <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 mt-10">
          SIMULATED ON THE BATTLE RAP UNIVERSITY ENGINE —{' '}
          <Link href="/watch" className="text-[#ff8c42] hover:underline">
            BACK TO THE CARD
          </Link>
        </p>
      </div>
    </div>
  );
}
