'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { GrudgeMeter, RematchDemandBar } from '@/components/grudge';

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
    joinedAt: string;
    rating: number;
    rank: number | null;
    tier: string | null;
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
      <div className="min-h-screen bg-[#18191c] text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-display font-black text-[#ff8c42] mb-2 uppercase tracking-tighter">Loading Career Data...</div>
          <div className="text-zinc-400 uppercase tracking-wide text-sm">Fetching battle history and rivalries</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#18191c] text-zinc-100 flex items-center justify-between">
        <div className="text-center">
          <div className="text-2xl font-display font-black text-red-500 mb-2 uppercase tracking-tighter">Error</div>
          <div className="text-zinc-400 uppercase tracking-wide text-sm">Failed to load career data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#2d2f35] via-[#2d2f35] to-[#ff8c42]/20 border-b-2-2 border-[#3a3d44]">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-display font-black uppercase tracking-tighter mb-2">{data.battler.stageName}</h1>
              <div className="flex gap-4 text-zinc-400 mb-4">
                <span className="text-[#ff8c42] font-display font-black uppercase tracking-wider">{data.battler.rating} Rating</span>
                {data.battler.rank && <span className="font-display font-black uppercase tracking-wide">#{data.battler.rank} Ranked</span>}
                {data.battler.tier && <span className="font-display font-black uppercase tracking-wide">{data.battler.tier} Tier</span>}
              </div>
              <div className="text-sm text-zinc-500 uppercase tracking-wide">
                Joined {formatDistanceToNow(new Date(data.battler.joinedAt), { addSuffix: true })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-center bg-[#2d2f35] border-2 border-[#3a3d44] rounded px-6 py-4">
                <div className="text-3xl font-display font-black text-[#ff8c42]">{data.careerStats.totalBattles}</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mt-1">Battles</div>
              </div>
              <div className="text-center bg-[#2d2f35] border-2 border-[#3a3d44] rounded px-6 py-4">
                <div className="text-3xl font-display font-black text-green-500">{data.careerStats.winRate}%</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mt-1">Win Rate</div>
              </div>
              <div className="text-center bg-[#2d2f35] border-2 border-[#3a3d44] rounded px-6 py-4">
                <div className="text-3xl font-display font-black text-blue-500">{data.careerStats.avgCrowdReaction}%</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mt-1">Avg Crowd</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[#2d2f35] border-b-2-2 border-[#3a3d44] sticky top-0 z-10">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            {(['overview', 'battles', 'rivalries', 'media'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-display font-black uppercase text-sm tracking-tighter transition-all ${
                  activeTab === tab
                    ? 'bg-[#ff8c42] text-black border-b-2-4 border-[#ff8c42]'
                    : 'bg-[#2d2f35] text-zinc-400 hover:bg-[#3a3d44] hover:text-zinc-200 border-b-2-4 border-transparent'
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
      {/* Career Highlights */}
      <div className="lg:col-span-2 bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter mb-6 text-[#ff8c42]">Career Highlights</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Battles" value={stats.totalBattles} />
          <StatCard label="Wins" value={stats.wins} color="text-green-500" />
          <StatCard label="Losses" value={stats.losses} color="text-red-500" />
          <StatCard label="Win Rate" value={`${stats.winRate}%`} color="text-blue-500" />
          <StatCard label="Bodybags" value={stats.bodybags} color="text-[#ff8c42]" />
          <StatCard label="Avg Crowd" value={`${stats.avgCrowdReaction}%`} />
          <StatCard label="Round Win %" value={`${stats.roundWinRate}%`} />
          <StatCard label="Total Rounds" value={stats.totalRounds} />
          <StatCard label="Rounds Won" value={stats.roundsWon} />
        </div>
      </div>

      {/* Active Rivalries Summary */}
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter mb-4 text-[#ff8c42]">Active Rivalries</h2>
        {data.rivalries.length === 0 ? (
          <p className="text-zinc-500 text-center py-8 uppercase tracking-wide text-sm">No active rivalries</p>
        ) : (
          <div className="space-y-3">
            {data.rivalries.slice(0, 3).map((rivalry) => (
              <div key={rivalry.relationshipId} className="bg-[#18191c] p-3 rounded border-2 border-[#3a3d44]">
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

      {/* Recent Battles */}
      <div className="lg:col-span-3 bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter mb-4 text-[#ff8c42]">Recent Battles</h2>
        <div className="space-y-2">
          {data.battleHistory.slice(0, 5).map((battle) => (
            <Link
              key={battle.battleId}
              href={`/battle/${battle.battleId}/viewer`}
              className="block bg-[#18191c] p-4 rounded hover:bg-[#3a3d44] transition-colors border-2 border-[#3a3d44] hover:border-[#ff8c42]"
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
                  {formatDistanceToNow(new Date(battle.date), { addSuffix: true })}
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
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-12 text-center">
        <p className="text-zinc-500 text-lg uppercase tracking-wide">No battles yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#18191c] border-b-2-2 border-[#3a3d44]">
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
                {formatDistanceToNow(new Date(battle.date), { addSuffix: true })}
              </td>
              <td className="px-4 py-4">
                <Link
                  href={`/battle/${battle.battleId}/viewer`}
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
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-12 text-center">
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
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-12 text-center">
        <p className="text-zinc-500 text-lg uppercase tracking-wide">No media mentions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mentions.map((mention) => (
        <Link
          key={mention.articleId}
          href={`/media/${mention.slug}`}
          className="block bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6 hover:border-[#ff8c42] transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-display font-black uppercase tracking-tighter text-[#ff8c42] hover:text-[#ff9d5c]">
              {mention.title}
            </h3>
            {mention.isGrudgeArticle && (
              <span className="bg-red-600 px-2 py-1 rounded text-xs font-black uppercase tracking-wide">
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
    <div className="bg-[#18191c] p-4 rounded border-2 border-[#3a3d44] text-center">
      <div className={`text-2xl font-display font-black ${color}`}>{value}</div>
      <div className="text-xs text-zinc-400 uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}

function RivalryCard({ rivalry, battlerId }: { rivalry: CareerData['rivalries'][0]; battlerId: string }) {
  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
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
      <div className="bg-[#18191c] p-4 rounded border-2 border-[#3a3d44]">
        <div className="text-xs uppercase font-bold tracking-wide text-zinc-400 mb-2">Origin Story</div>
        <p className="text-sm text-zinc-300 leading-relaxed">{rivalry.originStory}</p>
      </div>
    </div>
  );
}
