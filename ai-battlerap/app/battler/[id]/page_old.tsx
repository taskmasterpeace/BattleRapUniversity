'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { GrudgeMeter, RematchDemandBar } from '@/components/grudge';

/**
 * Battler Career Page
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
          <div className="text-2xl font-bold text-[#ff8c42] mb-2">Loading Career Data...</div>
          <div className="text-zinc-400">Fetching battle history and rivalries</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#18191c] text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500 mb-2">Error</div>
          <div className="text-zinc-400">Failed to load career data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/20 border-b-2 border-[#3a3d44]">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-2">{data.battler.stageName}</h1>
              <div className="flex gap-4 text-zinc-400 mb-4">
                <span className="text-[#ff8c42] font-bold">{data.battler.rating} Rating</span>
                {data.battler.rank && <span>#{data.battler.rank} Ranked</span>}
                {data.battler.tier && <span>{data.battler.tier} Tier</span>}
              </div>
              <div className="text-sm text-zinc-500">
                Joined {formatDistanceToNow(new Date(data.battler.joinedAt), { addSuffix: true })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#ff8c42]">{data.careerStats.totalBattles}</div>
                <div className="text-xs text-zinc-400 uppercase">Battles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">{data.careerStats.winRate}%</div>
                <div className="text-xs text-zinc-400 uppercase">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">{data.careerStats.avgCrowdReaction}%</div>
                <div className="text-xs text-zinc-400 uppercase">Avg Crowd</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[#2d2f35] border-b-2 border-[#3a3d44] sticky top-0 z-10">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            {(['overview', 'battles', 'rivalries', 'media'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-display font-black uppercase text-sm transition-colors ${
                  activeTab === tab
                    ? 'bg-[#ff8c42] text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
              >
                {tab}
                {tab === 'rivalries' && data.rivalries.length > 0 && (
                  <span className="ml-2 bg-red-600 px-2 py-0.5 rounded-full text-xs">
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
        <h2 className="text-2xl font-bold mb-6 text-[#ff8c42]">Career Highlights</h2>
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
        <h2 className="text-2xl font-bold mb-4 text-[#ff8c42]">Active Rivalries</h2>
        {data.rivalries.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No active rivalries</p>
        ) : (
          <div className="space-y-3">
            {data.rivalries.slice(0, 3).map((rivalry) => (
              <div key={rivalry.relationshipId} className="bg-zinc-800 p-3 rounded border-2 border-[#3a3d44]">
                <div className="font-semibold text-orange-400 mb-1">{rivalry.opponentName}</div>
                <div className="text-xs text-zinc-400 mb-2">
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
        <h2 className="text-2xl font-bold mb-4 text-[#ff8c42]">Recent Battles</h2>
        <div className="space-y-2">
          {data.battleHistory.slice(0, 5).map((battle) => (
            <Link
              key={battle.battleId}
              href={`/battle/${battle.battleId}/viewer`}
              className="block bg-zinc-800 p-4 rounded hover:bg-zinc-700 transition-colors border-2 border-[#3a3d44]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`text-2xl font-bold ${
                      battle.result === 'W' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {battle.result}
                  </div>
                  <div>
                    <div className="font-semibold">vs {battle.opponentName}</div>
                    <div className="text-sm text-zinc-400">{battle.score}</div>
                  </div>
                </div>
                <div className="text-sm text-zinc-500">
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
        <p className="text-zinc-500 text-lg">No battles yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-zinc-800 border-b-2 border-[#3a3d44]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-display font-black uppercase text-zinc-400">Result</th>
            <th className="px-4 py-3 text-left text-xs font-display font-black uppercase text-zinc-400">Opponent</th>
            <th className="px-4 py-3 text-left text-xs font-display font-black uppercase text-zinc-400">Score</th>
            <th className="px-4 py-3 text-left text-xs font-display font-black uppercase text-zinc-400">My Crowd</th>
            <th className="px-4 py-3 text-left text-xs font-display font-black uppercase text-zinc-400">Opp Crowd</th>
            <th className="px-4 py-3 text-left text-xs font-display font-black uppercase text-zinc-400">Date</th>
            <th className="px-4 py-3 text-left text-xs font-display font-black uppercase text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {battles.map((battle) => (
            <tr key={battle.battleId} className="hover:bg-zinc-800/50 transition-colors">
              <td className="px-4 py-4">
                <span
                  className={`text-lg font-bold ${
                    battle.result === 'W' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {battle.result}
                </span>
              </td>
              <td className="px-4 py-4 font-semibold">{battle.opponentName}</td>
              <td className="px-4 py-4 text-orange-400">{battle.score}</td>
              <td className="px-4 py-4">{battle.myCrowdAvg}%</td>
              <td className="px-4 py-4">{battle.oppCrowdAvg}%</td>
              <td className="px-4 py-4 text-sm text-zinc-500">
                {formatDistanceToNow(new Date(battle.date), { addSuffix: true })}
              </td>
              <td className="px-4 py-4">
                <Link
                  href={`/battle/${battle.battleId}/viewer`}
                  className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm font-semibold"
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
        <h3 className="text-xl font-bold text-zinc-400 mb-2">No Active Rivalries</h3>
        <p className="text-zinc-500">Rivalries emerge from controversial decisions, upsets, and heated battles.</p>
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
        <p className="text-zinc-500 text-lg">No media mentions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mentions.map((mention) => (
        <Link
          key={mention.articleId}
          href={`/media/${mention.slug}`}
          className="block bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6 hover:border-orange-500 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-orange-400 hover:text-orange-300">
              {mention.title}
            </h3>
            {mention.isGrudgeArticle && (
              <span className="bg-red-600 px-2 py-1 rounded text-xs font-display font-black uppercase">
                Grudge Coverage
              </span>
            )}
          </div>
          <div className="flex gap-4 text-sm text-zinc-400">
            <span>By {mention.blogger}</span>
            <span>•</span>
            <span>{mention.type.replace('_', ' ')}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(mention.publishedAt), { addSuffix: true })}</span>
            {mention.isPrimaryFocus && (
              <>
                <span>•</span>
                <span className="text-[#ff8c42]">Primary Focus</span>
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
    <div className="bg-zinc-800 p-4 rounded border-2 border-[#3a3d44] text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-zinc-400 uppercase mt-1">{label}</div>
    </div>
  );
}

function RivalryCard({ rivalry, battlerId }: { rivalry: CareerData['rivalries'][0]; battlerId: string }) {
  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-orange-400 mb-1">{rivalry.opponentName}</h3>
          <div className="flex gap-4 text-sm text-zinc-400">
            <span className="uppercase font-semibold">{rivalry.status}</span>
            <span>•</span>
            <span>Started {formatDistanceToNow(new Date(rivalry.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
        {rivalry.headToHead && (
          <div className="text-right">
            <div className="text-sm text-zinc-400 mb-1">Head-to-Head</div>
            <div className="text-2xl font-bold text-[#ff8c42]">{rivalry.headToHead.myRecord}</div>
            <div className="text-xs text-zinc-500">{rivalry.headToHead.totalBattles} battle(s)</div>
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
      <div className="bg-zinc-800 p-4 rounded border-2 border-[#3a3d44]">
        <div className="text-xs uppercase font-semibold text-zinc-400 mb-2">Origin Story</div>
        <p className="text-sm text-zinc-300 leading-relaxed">{rivalry.originStory}</p>
      </div>
    </div>
  );
}
