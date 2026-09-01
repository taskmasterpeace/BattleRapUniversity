'use client';

import { use, useState } from 'react';
import Icon from '@/components/ui/Icon';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { GrudgeMeter, RematchDemandBar } from '@/components/grudge';
import ChallengeButton from '@/components/battlers/ChallengeButton';
import { CharacterSheet } from '@/components/battler/character-sheet';
import { ReputationPanel } from '@/components/battler/ReputationPanel';
import type { Reputation } from '@/lib/game/reputation';

/**
 * Relative time for a COMPLETED battle. Battles finished early through the
 * interactive round flow keep a future scheduled_at, so the raw date would read
 * "in 14 days" for a battle that already has a final score. Clamp to now so a
 * finished battle never reads as upcoming — worst case is "less than a minute ago".
 */
function battleWhen(date: string): string {
  const t = Math.min(new Date(date).getTime(), Date.now());
  return formatDistanceToNow(new Date(t), { addSuffix: true });
}

/**
 * Battler Career Page - GAMING UI REDESIGN
 *
 * Route: /battler/[id]
 *
 * Displays comprehensive career stats, battle history, rivalries, and media mentions.
 * 4 Tabs:
 * - Overview: Hero section + career highlights
 * - Battles: Complete battle history table
 * - Rivalries: Active grudges with intensity meters
 * - Media: All media mentions
 */

interface CareerData {
  battler: {
    id: string;
    stageName: string;
    isPlayer: boolean;
    isOwn?: boolean;
    isReal?: boolean;
    bio?: string | null;
    avatarUrl?: string | null;
    portraits?: string[];
    region?: string | null;
    hometown?: {
      id?: string | null;
      name: string;
      state: string | null;
      background_url?: string | null;
      skyline_url?: string | null;
    } | null;
    accolades?: Array<{
      rank: number | null;
      title: string;
      scope: string;
      region: string | null;
      year: number | null;
      source: string | null;
    }>;
    joinedAt: string;
    rating: number;
    rank: number | null;
    tier: string | null;
    styleTags?: string[];
    balance?: number | null;
    lastLeague?: { name: string; logo_url: string | null } | null;
    attributes: {
      writing: any;
      performance: any;
      personal: any;
      resilience: number;
    };
  };
  careerStats: {
    totalBattles: number;
    wins: number;
    losses: number;
    winRate: number;
    avgCrowdReaction: number;
    totalRounds: number;
    roundsWon: number;
    roundWinRate: number;
    bodybags: number;
    perfectRecords: number;
    upsets: number;
    chokes: number;
    haymakers: number;
  };
  battleHistory: Array<{
    battleId: string;
    date: string;
    opponentId: string;
    opponentName: string;
    result: 'W' | 'L';
    score: string;
    myCrowdAvg: number;
    oppCrowdAvg: number;
    rounds: any[];
  }>;
  rivalries: Array<{
    relationshipId: string;
    opponentId: string;
    opponentName: string;
    intensity: number;
    rematchDemand: number;
    status: 'active' | 'dormant';
    originType: string;
    originStory: string;
    createdAt: string;
    headToHead: {
      totalBattles: number;
      myRecord: string;
      lastBattleDate: string | null;
      lastBattleWinner: string | null;
    } | null;
  }>;
  mediaMentions: Array<{
    articleId: string;
    slug: string;
    title: string;
    type: string;
    publishedAt: string;
    blogger: string;
    isPrimaryFocus: boolean;
    isGrudgeArticle: boolean;
  }>;
  wire?: {
    handle: string;
    display_name: string;
    influence: number;
    credibility: number;
  } | null;
  press?: Array<{
    blogger_name: string;
    total_articles: number;
    sentiment_positive: number;
    sentiment_negative: number;
    recent_narrative: string | null;
    last_covered_at: string;
  }>;
  developing?: Array<{
    sitReason: string;
    publishAfter: string;
    blogger: string;
    subcategory: string | null;
    hint: string;
  }>;
  reputation?: Reputation;
}

type TabType = 'overview' | 'battles' | 'rivalries' | 'media';

export default function BattlerCareerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data, isLoading, error } = useQuery<CareerData>({
    queryKey: ['battler-career', id],
    queryFn: async () => {
      const res = await fetch(`/api/battler/${id}/career`);
      if (!res.ok) throw new Error('Failed to fetch career data');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-display font-black text-[#ff8c42] mb-2 uppercase tracking-tighter">Loading Career Data...</div>
          <div className="text-zinc-400 uppercase tracking-wide text-sm">Fetching battle history and rivalries</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-display font-black text-red-500 mb-2 uppercase tracking-tighter">Error</div>
          <div className="text-zinc-400 uppercase tracking-wide text-sm">Failed to load career data</div>
        </div>
      </div>
    );
  }

  // Card-filler modules (Codex design collab, 2026-08-31): style DNA, form &
  // danger, signature moment, rivalry file — what a fan scouts first.
  const history = data.battleHistory;
  const form = history.slice(0, 5).map((b) => b.result);
  let bestPeak = 0;
  let sigBattle: (typeof history)[number] | null = null;
  for (const b of history) {
    for (const r of b.rounds as Array<{ peakScore?: number }>) {
      if ((r.peakScore ?? 0) > bestPeak) {
        bestPeak = r.peakScore ?? 0;
        sigBattle = b;
      }
    }
  }
  const haymakerRounds = history.reduce(
    (n, b) => n + (b.rounds as Array<{ peakScore?: number }>).filter((r) => (r.peakScore ?? 0) >= 8.5).length,
    0
  );
  const topRival = data.rivalries[0] ?? null;
  const hometownLine = data.battler.hometown
    ? `${data.battler.hometown.name}${data.battler.hometown.state ? `, ${data.battler.hometown.state}` : ''}`
    : data.battler.region ?? undefined;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#2d2f35] via-[#2d2f35] to-[#ff8c42]/20 border-b-2 border-[#3a3d44]">
        <div className="container mx-auto px-6 py-12">
          {/* Flyer System dossier masthead — big face over the origin city, graded stat matrix */}
          <CharacterSheet
            name={data.battler.stageName}
            portrait={data.battler.avatarUrl || '/sprites/characters/sprite_569.png'}
            portraits={data.battler.portraits || []}
            cityName={data.battler.hometown?.name}
            cityBackdrop={data.battler.hometown?.background_url || data.battler.hometown?.skyline_url || undefined}
            tierLabel={data.battler.tier ? `${data.battler.tier} TIER` : undefined}
            record={`${data.careerStats.wins}W · ${data.careerStats.losses}L`}
            elo={data.battler.rating}
            groups={[
              { title: 'Writing & Rapping', scale10: true, rows: [
                { label: 'Lyricism', value: Number(data.battler.attributes?.writing?.lyricism ?? 5) },
                { label: 'Wordplay', value: Number(data.battler.attributes?.writing?.wordplay ?? 5) },
                { label: 'Creativity', value: Number(data.battler.attributes?.writing?.creativity ?? 5) },
                { label: 'Flow', value: Number(data.battler.attributes?.writing?.flow ?? 5) },
              ]},
              { title: 'Performance', scale10: true, rows: [
                { label: 'Stage Presence', value: Number(data.battler.attributes?.performance?.stage_presence ?? 5) },
                { label: 'Crowd Control', value: Number(data.battler.attributes?.performance?.crowd_control ?? 5) },
                { label: 'Delivery', value: Number(data.battler.attributes?.performance?.delivery ?? 5) },
              ]},
              { title: 'Personal', scale10: true, rows: [
                { label: 'Financial Stab.', value: Number(data.battler.attributes?.personal?.financial_stability ?? 5) },
                { label: 'Reputation', value: Number(data.battler.attributes?.personal?.reputation ?? 5) },
                { label: 'Family Bond', value: Number(data.battler.attributes?.personal?.family_bond ?? 5) },
              ]},
              { title: 'Mental', scale10: true, rows: [
                { label: 'Resilience', value: Number(data.battler.attributes?.resilience ?? 5) },
              ]},
            ]}
            sideStats={[
              { k: 'Battles', v: String(data.careerStats.totalBattles), s: 'career total' },
              { k: 'Win Rate', v: `${data.careerStats.winRate}%`, s: `${data.careerStats.wins}W · ${data.careerStats.losses}L`, color: '#35C46B' },
              { k: 'Avg Crowd', v: `${data.careerStats.avgCrowdReaction}%`, s: 'room reaction' },
            ]}
            styleTags={data.battler.styleTags ?? []}
            homeLine={hometownLine}
            wireHandle={data.wire?.handle}
            bag={data.battler.balance ?? null}
            form={form}
            danger={
              data.careerStats.totalBattles > 0
                ? {
                    bodies: data.careerStats.bodybags,
                    roundWinRate: data.careerStats.roundWinRate,
                    bestPeak: bestPeak > 0 ? Math.round(bestPeak * 10) / 10 : null,
                    haymakers: haymakerRounds,
                  }
                : null
            }
            signature={
              bestPeak > 0 && sigBattle
                ? {
                    title: `CAREER HIGH · ${bestPeak.toFixed(1)} PEAK${bestPeak >= 8.5 ? ' — HAYMAKER' : ''}`,
                    detail: `VS ${sigBattle.opponentName} · ${sigBattle.result} ${sigBattle.score}`,
                  }
                : null
            }
            rival={
              topRival
                ? {
                    name: topRival.opponentName,
                    record: topRival.headToHead?.myRecord ?? null,
                    intensity: topRival.intensity,
                  }
                : null
            }
            league={
              data.battler.lastLeague
                ? {
                    name: data.battler.lastLeague.name,
                    crest: data.battler.lastLeague.logo_url ?? undefined,
                    subtitle: 'LAST FOUGHT HERE',
                  }
                : undefined
            }
            press={(data.press ?? []).map((p) => ({
              name: p.blogger_name,
              articles: p.total_articles,
              pos: p.sentiment_positive,
              neg: p.sentiment_negative,
              narrative: p.recent_narrative,
            }))}
            outings={history.slice(0, 4).map((b) => ({
              result: b.result,
              opponent: b.opponentName,
              opponentId: b.opponentId,
              score: b.score,
              battleId: b.battleId,
            }))}
          />
        </div>
      </div>

      {/* Tab Navigation — right under the masthead, no scroll hunt */}
      <div className="bg-[#2d2f35] border-b-2 border-[#3a3d44] sticky top-0 z-10">
        <div className="container mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {(['overview', 'battles', 'rivalries', 'media'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-display font-black uppercase text-sm tracking-tighter transition-all ${
                  activeTab === tab
                    ? 'bg-[#ff8c42] text-black border-b-4 border-[#ff8c42]'
                    : 'bg-[#2d2f35] text-zinc-400 hover:bg-[#3a3d44] hover:text-zinc-200 border-b-4 border-transparent'
                }`}
              >
                {tab}
                {tab === 'rivalries' && data.rivalries.length > 0 && (
                  <span className="ml-2 bg-red-600 px-2 py-0.5 rounded-full text-xs font-black">
                    {data.rivalries.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="mb-8 flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                {data.battler.isReal && (
                  <span className="px-3 py-1.5 bg-[#ff8c42] text-black font-mono text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_-4px_rgba(255,140,66,0.8)]">
                    VERIFIED BATTLER
                  </span>
                )}
              </div>
              <div className="flex gap-4 text-zinc-400 mb-2 flex-wrap">
                <span className="text-[#ff8c42] font-display font-black uppercase tracking-wider">{data.battler.rating} Rating</span>
                {data.battler.rank && <span className="font-display font-black uppercase tracking-wide">#{data.battler.rank} Ranked</span>}
                {data.battler.tier && <span className="font-display font-black uppercase tracking-wide">{data.battler.tier} Tier</span>}
                {data.battler.hometown && (
                  data.battler.hometown.id ? (
                    <Link
                      href={`/cities/${data.battler.hometown.id}`}
                      className="font-display font-black uppercase tracking-wide text-zinc-300 hover:text-[#ff8c42] transition-colors border-b border-dashed border-zinc-600 hover:border-[#ff8c42]"
                      title={`Visit the ${data.battler.hometown.name} scene`}
                    >
                      <Icon name="pin" size={12} className="mr-1 -mt-0.5" />{data.battler.hometown.name}{data.battler.hometown.state ? `, ${data.battler.hometown.state}` : ''}
                    </Link>
                  ) : (
                    <span className="font-display font-black uppercase tracking-wide">
                      <Icon name="pin" size={12} className="mr-1 -mt-0.5" />{data.battler.hometown.name}{data.battler.hometown.state ? `, ${data.battler.hometown.state}` : ''}
                    </span>
                  )
                )}
              </div>
              <div className="text-sm text-zinc-500 uppercase tracking-wide">
                {data.battler.isReal
                  ? 'Licensed likeness — real career, real legacy'
                  : `Joined ${formatDistanceToNow(new Date(data.battler.joinedAt), { addSuffix: true })}`}
              </div>
              {data.battler.bio && (
                <div className="mt-4 bg-[#17181C] border-l-4 border-[#ff8c42] p-5 max-w-3xl">
                  <p className="text-zinc-300 leading-relaxed italic">{data.battler.bio}</p>
                </div>
              )}
            </div>
            {data.battler.isPlayer && !data.battler.isOwn && (
              <div className="max-w-xs">
                <ChallengeButton
                  opponentBattlerId={data.battler.id}
                  stageName={data.battler.stageName}
                  size="lg"
                  label="CHALLENGE THIS PLAYER"
                />
                <p className="text-[12px] text-zinc-500 uppercase tracking-widest mt-2">
                  Challenge this player — async PvP, prep on your own time
                </p>
              </div>
            )}
            {data.battler.accolades && data.battler.accolades.length > 0 && (
              <div className="w-full">
                <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-4">
                  ACCOLADES
                </h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {data.battler.accolades.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-[#17181C] border-2 border-black px-4 py-3 shadow-[3px_3px_0_rgba(0,0,0,.4)]"
                    >
                      {a.rank ? (
                        <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#ff8c42]/15 border border-[#ff8c42]/50 text-[#ff8c42] font-display font-black text-sm">
                          {a.rank === 1 ? '1st' : a.rank === 2 ? '2nd' : a.rank === 3 ? '3rd' : `${a.rank}th`}
                        </span>
                      ) : (
                        <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-[#ff8c42]"><Icon name="medal" size={22} /></span>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-zinc-100 leading-snug">{a.title}</p>
                        <p className="font-mono text-[12px] uppercase tracking-widest text-zinc-500">
                          {[a.region, a.year, a.scope === 'real_world' ? 'REAL WORLD' : 'IN GAME'].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'battles' && <BattlesTab battles={data.battleHistory} />}
        {activeTab === 'rivalries' && <RivalriesTab rivalries={data.rivalries} battlerId={id} />}
        {activeTab === 'media' && <MediaTab mentions={data.mediaMentions} />}
      </div>
    </div>
  );
}

// =====================================================
// TAB COMPONENTS
// =====================================================

function OverviewTab({ data }: { data: CareerData }) {
  const stats = data.careerStats;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* REPUTATION — respect made concrete: labels, recognition map, resume names */}
      {data.reputation && <ReputationPanel reputation={data.reputation} />}

      {/* Career Highlights */}
      <div className="lg:col-span-2 bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter mb-6 text-[#ff8c42]">Career Highlights</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Battles" value={stats.totalBattles} />
          <StatCard label="Wins" value={stats.wins} color="text-green-500" />
          <StatCard label="Losses" value={stats.losses} color="text-red-500" />
          <StatCard label="Win Rate" value={`${stats.winRate}%`} color="text-[#ff8c42]" />
          <StatCard label="Bodybags" value={stats.bodybags} color="text-[#ff8c42]" />
          <StatCard label="Avg Crowd" value={`${stats.avgCrowdReaction}%`} />
          <StatCard label="Round Win %" value={`${stats.roundWinRate}%`} />
          <StatCard label="Total Rounds" value={stats.totalRounds} />
          <StatCard label="Rounds Won" value={stats.roundsWon} />
        </div>
      </div>

      {/* Active Rivalries Summary */}
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter mb-4 text-[#ff8c42]">Active Rivalries</h2>
        {data.rivalries.length === 0 ? (
          <p className="text-zinc-500 text-center py-8 uppercase tracking-wide text-sm">No smoke yet — rivalries start on the stage</p>
        ) : (
          <div className="space-y-3">
            {data.rivalries.slice(0, 3).map((rivalry) => (
              <div key={rivalry.relationshipId} className="bg-[#18191c] p-3 border-2 border-[#3a3d44]">
                <div className="font-display font-black text-[#ff8c42] mb-1 uppercase tracking-tight">{rivalry.opponentName}</div>
                <div className="text-xs text-zinc-400 mb-2 uppercase tracking-wide">
                  H2H: {rivalry.headToHead?.myRecord || 'N/A'}
                </div>
                <GrudgeMeter intensity={rivalry.intensity} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Public Life — Wire presence + how the press leans (owner ask 2026-08-27:
          "look at a battler's info and know if they have a social media") */}
      {(data.wire || (data.press && data.press.length > 0)) && (
        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* On The Wire */}
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
            <h2 className="text-2xl font-display font-black uppercase tracking-tighter mb-4 text-[#ff8c42]">On The Wire</h2>
            {data.wire ? (
              <Link href="/wire" className="block bg-[#18191c] border-2 border-[#3a3d44] hover:border-[#ff8c42]/60 p-4 transition group">
                <div className="font-display font-black text-lg text-zinc-100 uppercase tracking-tight group-hover:text-[#ff8c42] transition">
                  @{data.wire.handle.replace(/^@+/, '')}
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">{data.wire.display_name}</div>
                <div className="flex gap-4 font-mono text-[13px] uppercase tracking-wide">
                  <span className="text-zinc-400">INFLUENCE <b className="text-[#ff8c42]">{data.wire.influence}</b></span>
                  <span className="text-zinc-400">CRED <b className="text-zinc-200">{data.wire.credibility}</b></span>
                </div>
                <div className="mt-3 text-[12px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition">SEE THEIR DROPS ON THE WIRE →</div>
              </Link>
            ) : (
              <p className="text-zinc-500 text-center py-8 uppercase tracking-wide text-sm">No Wire account — off the grid</p>
            )}
          </div>

          {/* The Press */}
          <div className="lg:col-span-2 bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
            <h2 className="text-2xl font-display font-black uppercase tracking-tighter mb-1 text-[#ff8c42]">The Press</h2>
            <p className="text-[12px] font-mono text-zinc-500 uppercase tracking-widest mb-4">WHO COVERS THEM · AND HOW THEY LEAN</p>

            {/* Developing — stories the blogs are sitting on about this battler */}
            {data.developing && data.developing.length > 0 && (
              <div className="mb-4 bg-[#18191c] border-2 border-[#ff8c42]/30 p-3">
                <p className="text-[12px] font-mono text-[#ff8c42] uppercase tracking-widest mb-2">
                  📰 DEVELOPING · THE BLOGS ARE SITTING ON THIS
                </p>
                <div className="space-y-2">
                  {/* Dedup by the story itself — the blogs shouldn't be "sitting on"
                      the identical line under two different names. */}
                  {(() => {
                    const seen = new Set<string>();
                    return data.developing.filter((d) => {
                      const k = (d.hint ?? '').trim();
                      if (seen.has(k)) return false;
                      seen.add(k);
                      return true;
                    });
                  })().map((d, i) => {
                    const ms = new Date(d.publishAfter).getTime() - Date.now();
                    const drops = ms <= 0 ? 'any minute' : ms < 86_400_000 ? `~${Math.round(ms / 3_600_000)}h` : `~${Math.round(ms / 86_400_000)}d`;
                    return (
                      <div key={i} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-zinc-300 leading-snug">{d.hint}</p>
                          <p className="text-[12px] font-mono text-zinc-600 uppercase tracking-wide">
                            {d.blogger} · on the {(d.subcategory ?? 'story').replace(/_/g, ' ')}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-500 shrink-0 uppercase">drops {drops}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {data.press && data.press.length > 0 ? (
              <div className="space-y-2">
                {data.press.slice(0, 5).map((p) => {
                  const lean = p.sentiment_positive - p.sentiment_negative; // −100..100
                  const leanLabel = lean >= 25 ? 'RIDES FOR THEM' : lean <= -25 ? 'STAYS ON THEIR NECK' : 'CALLS IT STRAIGHT';
                  const leanColor = lean >= 25 ? 'text-green-400' : lean <= -25 ? 'text-red-400' : 'text-zinc-400';
                  return (
                    <div key={p.blogger_name} className="bg-[#18191c] border-2 border-[#3a3d44] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <span className="font-display font-black text-sm uppercase tracking-wide text-zinc-100">{p.blogger_name}</span>
                        <span className={`font-mono text-[12px] uppercase tracking-wider ${leanColor}`}>{leanLabel} · {p.total_articles} {p.total_articles === 1 ? 'STORY' : 'STORIES'}</span>
                      </div>
                      <div className="h-1.5 bg-[#2d2f35] flex overflow-hidden">
                        <div className="bg-green-500/70" style={{ width: `${p.sentiment_positive}%` }} />
                        <div className="bg-red-500/70 ml-auto" style={{ width: `${p.sentiment_negative}%` }} />
                      </div>
                      {p.recent_narrative && (
                        <p className="text-xs text-zinc-500 mt-1.5 line-clamp-1">&ldquo;{p.recent_narrative}&rdquo;</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-zinc-500 text-center py-8 uppercase tracking-wide text-sm">No coverage yet — the blogs haven&apos;t noticed</p>
            )}
          </div>
        </div>
      )}

      {/* Recent Battles */}
      <div className="lg:col-span-3 bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter mb-4 text-[#ff8c42]">Recent Battles</h2>
        {data.battleHistory.length === 0 && (
          <p className="text-zinc-500 text-center py-8 uppercase tracking-wide text-sm">
            No tape yet — the first battle is still on the books
          </p>
        )}
        <div className="space-y-2">
          {data.battleHistory.slice(0, 5).map((battle) => (
            <Link
              key={battle.battleId}
              href={`/watch/${battle.battleId}`}
              className="block bg-[#18191c] p-4 hover:bg-[#3a3d44] transition-colors border-2 border-[#3a3d44] hover:border-[#ff8c42]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`text-2xl font-display font-black ${
                      battle.result === 'W' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {battle.result}
                  </div>
                  <div>
                    <div className="font-display font-black uppercase tracking-wide">vs {battle.opponentName}</div>
                    <div className="text-sm text-zinc-400 uppercase tracking-wide">{battle.score}</div>
                  </div>
                </div>
                <div className="text-sm text-zinc-500 uppercase tracking-wide">
                  {battleWhen(battle.date)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function BattlesTab({ battles }: { battles: CareerData['battleHistory'] }) {
  if (battles.length === 0) {
    return (
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-12 text-center">
        <p className="text-xl font-display font-black uppercase tracking-tighter text-zinc-300 mb-2">No Tape Yet</p>
        <p className="text-zinc-500 uppercase tracking-wide text-sm">Every legend starts 0-0 — the first battle writes the record</p>
      </div>
    );
  }

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#18191c] border-b-2 border-[#3a3d44]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-display font-black uppercase tracking-tight text-zinc-400">Result</th>
            <th className="px-4 py-3 text-left text-xs font-display font-black uppercase tracking-tight text-zinc-400">Opponent</th>
            <th className="px-4 py-3 text-left text-xs font-display font-black uppercase tracking-tight text-zinc-400">Score</th>
            <th className="px-4 py-3 text-left text-xs font-display font-black uppercase tracking-tight text-zinc-400">My Crowd</th>
            <th className="px-4 py-3 text-left text-xs font-display font-black uppercase tracking-tight text-zinc-400">Opp Crowd</th>
            <th className="px-4 py-3 text-left text-xs font-display font-black uppercase tracking-tight text-zinc-400">Date</th>
            <th className="px-4 py-3 text-left text-xs font-display font-black uppercase tracking-tight text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-[#3a3d44]">
          {battles.map((battle) => (
            <tr key={battle.battleId} className="hover:bg-[#3a3d44] transition-colors">
              <td className="px-4 py-4">
                <span
                  className={`text-lg font-display font-black ${
                    battle.result === 'W' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {battle.result}
                </span>
              </td>
              <td className="px-4 py-4 font-display font-black uppercase tracking-wide">{battle.opponentName}</td>
              <td className="px-4 py-4 text-[#ff8c42] font-black uppercase tracking-wide">{battle.score}</td>
              <td className="px-4 py-4 font-bold">{battle.myCrowdAvg}%</td>
              <td className="px-4 py-4 font-bold">{battle.oppCrowdAvg}%</td>
              <td className="px-4 py-4 text-sm text-zinc-500 uppercase tracking-wide">
                {battleWhen(battle.date)}
              </td>
              <td className="px-4 py-4">
                <Link
                  href={`/watch/${battle.battleId}`}
                  className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm font-display font-black uppercase tracking-wide"
                >
                  View Battle →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RivalriesTab({ rivalries, battlerId }: { rivalries: CareerData['rivalries']; battlerId: string }) {
  if (rivalries.length === 0) {
    return (
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-12 text-center">
        <h3 className="text-xl font-display font-black uppercase tracking-tighter text-zinc-400 mb-2">No Active Rivalries</h3>
        <p className="text-zinc-500 uppercase tracking-wide text-sm">Rivalries emerge from controversial decisions, upsets, and heated battles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rivalries.map((rivalry) => (
        <RivalryCard key={rivalry.relationshipId} rivalry={rivalry} battlerId={battlerId} />
      ))}
    </div>
  );
}

function MediaTab({ mentions }: { mentions: CareerData['mediaMentions'] }) {
  if (mentions.length === 0) {
    return (
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-12 text-center">
        <p className="text-xl font-display font-black uppercase tracking-tighter text-zinc-300 mb-2">No Press Yet</p>
        <p className="text-zinc-500 uppercase tracking-wide text-sm">The blogs haven't caught on — give them a moment worth writing about</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mentions.map((mention) => (
        <Link
          key={mention.articleId}
          href={`/media/${mention.slug}`}
          className="block bg-[#2d2f35] border-2 border-[#3a3d44] p-6 hover:border-[#ff8c42] transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-display font-black uppercase tracking-tighter text-[#ff8c42] hover:text-[#ff9d5c]">
              {mention.title}
            </h3>
            {mention.isGrudgeArticle && (
              <span className="bg-red-600 px-2 py-1 text-xs font-black uppercase tracking-wide">
                Grudge Coverage
              </span>
            )}
          </div>
          <div className="flex gap-4 text-sm text-zinc-400 uppercase tracking-wide">
            <span>By {mention.blogger}</span>
            <span>•</span>
            <span>{mention.type.replace('_', ' ')}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(mention.publishedAt), { addSuffix: true })}</span>
            {mention.isPrimaryFocus && (
              <>
                <span>•</span>
                <span className="text-[#ff8c42] font-bold">Primary Focus</span>
              </>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

// =====================================================
// HELPER COMPONENTS
// =====================================================

function StatCard({ label, value, color = 'text-zinc-100' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-[#18191c] p-4 border-2 border-[#3a3d44] text-center">
      <div className={`text-2xl font-display font-black ${color}`}>{value}</div>
      <div className="text-xs text-zinc-400 uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}

function RivalryCard({ rivalry, battlerId }: { rivalry: CareerData['rivalries'][0]; battlerId: string }) {
  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-1">{rivalry.opponentName}</h3>
          <div className="flex gap-4 text-sm text-zinc-400 uppercase tracking-wide">
            <span className="font-bold">{rivalry.status}</span>
            <span>•</span>
            <span>Started {formatDistanceToNow(new Date(rivalry.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
        {rivalry.headToHead && (
          <div className="text-right">
            <div className="text-sm text-zinc-400 mb-1 uppercase tracking-wide">Head-to-Head</div>
            <div className="text-2xl font-display font-black text-[#ff8c42]">{rivalry.headToHead.myRecord}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide">{rivalry.headToHead.totalBattles} battle(s)</div>
          </div>
        )}
      </div>

      {/* Intensity & Rematch Demand */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <GrudgeMeter intensity={rivalry.intensity} />
        </div>
        <div>
          <RematchDemandBar demand={rivalry.rematchDemand} />
        </div>
      </div>

      {/* Origin Story */}
      <div className="bg-[#18191c] p-4 border-2 border-[#3a3d44]">
        <div className="text-xs uppercase font-bold tracking-wide text-zinc-400 mb-2">Origin Story</div>
        <p className="text-sm text-zinc-300 leading-relaxed">{rivalry.originStory}</p>
      </div>
    </div>
  );
}
