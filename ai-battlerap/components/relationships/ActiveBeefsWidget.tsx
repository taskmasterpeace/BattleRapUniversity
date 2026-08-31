'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SegGauge } from '@/components/ui/StatGauge';

type Relationship = {
  id: string;
  opponent: {
    id: string;
    stage_name: string;
    region: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    sprite: string | null;
  };
  currentState: string;
  stateLevel: number;
  highWaterMark: string;
  intensity: number;
  playerCrowdPerception: number;
  opponentCrowdPerception: number;
  playerAuthenticity: number;
  opponentAuthenticity: number;
  playerIsDucking: boolean;
  opponentIsDucking: boolean;
  playerOffersIgnored: number;
  opponentOffersIgnored: number;
  twitterBeefActive: boolean;
  twitterBeefStartedAt: string | null;
  startedAt: string;
  lastModifiedAt: string;
};

type Props = {
  battlerId?: string; // Optional - for real-time updates
};

export default function ActiveBeefsWidget({ battlerId }: Props) {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelationships();
  }, [battlerId]);

  const fetchRelationships = async () => {
    try {
      const response = await fetch('/api/battler/relationships');
      const data = await response.json();

      if (response.ok) {
        setRelationships(data.relationships || []);
      } else {
        console.error('Failed to fetch relationships:', data.error);
      }
    } catch (error) {
      console.error('Error fetching relationships:', error);
    } finally {
      setLoading(false);
    }
  };

  // State label mapping
  const getStateLabel = (state: string): { label: string; emoji: string; color: string } => {
    switch (state) {
      case 'rivals':
        return { label: 'RIVALS', emoji: '⚔️', color: 'text-yellow-500' };
      case 'at_war':
        return { label: 'AT WAR', emoji: '🔥', color: 'text-red-500' };
      case 'legendary_beef':
        return { label: 'LEGENDARY BEEF', emoji: '👑', color: 'text-amber-400' };
      case 'tense':
        return { label: 'TENSE', emoji: '😤', color: 'text-[#ff8c42]' };
      default:
        return { label: state.toUpperCase(), emoji: '🤝', color: 'text-zinc-500' };
    }
  };

  // Calculate crowd perception difference
  const getCrowdPerceptionDifference = (playerPercep: number, opponentPercep: number) => {
    return playerPercep - opponentPercep;
  };

  if (loading) {
    return (
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4 font-bold">
          🔥 ACTIVE BEEFS
        </h3>
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (relationships.length === 0) {
    return (
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4 font-bold">
          🔥 ACTIVE BEEFS
        </h3>
        <p className="text-zinc-500 text-sm">
          No active rivalries yet. Battle more opponents to develop storylines.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
          🔥 ACTIVE BEEFS ({relationships.length})
        </h3>
        <Link
          href="/relationships"
          className="text-xs text-[#ff8c42] hover:text-[#ff9d5c] uppercase tracking-wider font-bold"
        >
          VIEW ALL →
        </Link>
      </div>

      <div className="space-y-4">
        {relationships.map((rel) => {
          const stateInfo = getStateLabel(rel.currentState);
          const crowdDiff = getCrowdPerceptionDifference(
            rel.playerCrowdPerception,
            rel.opponentCrowdPerception
          );
          const playerWinningCrowd = crowdDiff > 0;
          const isTied = Math.abs(crowdDiff) < 5;

          return (
            <Link
              key={rel.id}
              href={`/relationship/${rel.opponent.id}`}
              className="block bg-[#18191c] border-2 border-[#3a3d44] hover:border-[#ff8c42]/50 rounded-lg p-4 transition"
            >
              {/* Header: Opponent & State */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{stateInfo.emoji}</span>
                  <div>
                    <p className="text-lg font-black text-zinc-100">
                      {rel.opponent.stage_name.toUpperCase()}
                    </p>
                    {rel.opponent.region && (
                      <p className="text-xs text-zinc-600 uppercase tracking-wide">
                        {rel.opponent.region}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-black uppercase tracking-wider ${stateInfo.color}`}>
                    {stateInfo.label}
                  </span>
                  <p className="text-xs text-zinc-600 mt-1">
                    INTENSITY: {rel.intensity}/100
                  </p>
                </div>
              </div>

              {/* Crowd Perception Battle */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-zinc-500 uppercase tracking-wide">
                    Crowd Perception
                  </span>
                  <span className={`text-xs font-bold ${
                    isTied ? 'text-zinc-400' : playerWinningCrowd ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isTied ? 'TIED' : playerWinningCrowd ? 'WINNING' : 'LOSING'}
                    {!isTied && ` (${Math.abs(crowdDiff)})`}
                  </span>
                </div>

                {/* Dual Perception Gauges */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600 w-12">YOU</span>
                    <div className="fs flex-1 min-w-0">
                      <SegGauge v10={rel.playerCrowdPerception / 10} grade="A" />
                    </div>
                    <span className="text-xs font-bold text-green-500 w-8 text-right">
                      {rel.playerCrowdPerception}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600 w-12">THEM</span>
                    <div className="fs flex-1 min-w-0">
                      <SegGauge v10={rel.opponentCrowdPerception / 10} grade="D" />
                    </div>
                    <span className="text-xs font-bold text-red-500 w-8 text-right">
                      {rel.opponentCrowdPerception}
                    </span>
                  </div>
                </div>
              </div>

              {/* Authenticity Scores */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-zinc-600 uppercase tracking-wide mb-1">
                    Your Authenticity
                  </p>
                  <p className={`text-sm font-bold ${
                    rel.playerAuthenticity >= 80 ? 'text-green-500' :
                    rel.playerAuthenticity >= 50 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {rel.playerAuthenticity}/100
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 uppercase tracking-wide mb-1">
                    Their Authenticity
                  </p>
                  <p className={`text-sm font-bold ${
                    rel.opponentAuthenticity >= 80 ? 'text-red-500' :
                    rel.opponentAuthenticity >= 50 ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {rel.opponentAuthenticity}/100
                  </p>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex gap-2 flex-wrap">
                {rel.twitterBeefActive && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border-2 border-blue-500/30 text-xs font-display font-black uppercase tracking-wide rounded">
                    🐦 TWITTER BEEF
                  </span>
                )}
                {rel.playerIsDucking && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 border-2 border-red-500/30 text-xs font-display font-black uppercase tracking-wide rounded">
                    ⚠️ DUCKING ({rel.playerOffersIgnored} IGNORED)
                  </span>
                )}
                {rel.opponentIsDucking && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 border-2 border-green-500/30 text-xs font-display font-black uppercase tracking-wide rounded">
                    ✓ THEY'RE DUCKING
                  </span>
                )}
                {rel.highWaterMark !== rel.currentState && (
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 border-2 border-amber-500/30 text-xs font-display font-black uppercase tracking-wide rounded">
                    PEAK: {getStateLabel(rel.highWaterMark).label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
