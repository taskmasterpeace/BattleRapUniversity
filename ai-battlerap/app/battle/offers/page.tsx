'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatCard from '@/components/ui/StatCard';
import Icon from '@/components/ui/Icon';
import GamingButton from '@/components/ui/GamingButton';
import { toast } from '@/components/ui/Toast';
import MatchupMasthead, { battleFace } from '@/components/battle/MatchupMasthead';

type BattlerAttributes = {
  writing: {
    lyricism: number;
    wordplay: number;
    creativity: number;
    flow: number;
  };
  performance: {
    stage_presence: number;
    crowd_control: number;
    delivery: number;
  };
  resilience: number;
};

type BattleOffer = {
  id: string;
  scheduled_at: string;
  lock_prep_at: string;
  is_pvp?: boolean;
  league: {
    name: string;
    round_length_minutes: number;
    base_payout?: number | null;
  };
  ai_battler: {
    id: string;
    stage_name: string;
    tier: string;
    style_tags: string[];
    avatar_url: string | null;
    battler_attributes: BattlerAttributes;
  };
  grudge: {
    intensity: number;
    rematchDemand: number;
    status: 'active' | 'dormant';
    originStory: string;
    relationshipId: string;
  } | null;
  h2hRecord: {
    totalBattles: number;
    myWins: number;
    myLosses: number;
    lastBattleDate: string | null;
  } | null;
  opponentRanking: {
    rating: number;
    wins: number;
    losses: number;
  };
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
};

type Me = {
  id: string;
  stage_name: string;
  avatar_url: string | null;
  sprite_set: string[] | null;
  tier: string | null;
};

export default function BattleOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<BattleOffer[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/battles/offers');
      const data = await response.json();
      setOffers(data.offers || []);
      if (data.me) setMe(data.me);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleAccept = async (battleId: string) => {
    setActionLoading(battleId);
    try {
      const response = await fetch(`/api/battles/${battleId}/accept`, {
        method: 'POST',
      });

      if (response.ok) {
        router.push(`/battle/${battleId}/prep`);
      } else {
        const data = await response.json();
        toast(data.error || 'Failed to accept battle', 'error');
        setActionLoading(null);
      }
    } catch (error) {
      console.error('Error accepting battle:', error);
      toast('Failed to accept battle', 'error');
      setActionLoading(null);
    }
  };

  const handleDecline = async (battleId: string) => {
    if (!confirm('Are you sure you want to decline this battle? This may affect your reputation.')) {
      return;
    }

    setActionLoading(battleId);
    try {
      const response = await fetch(`/api/battles/${battleId}/decline`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchOffers();
      } else {
        const data = await response.json();
        toast(data.error || 'Failed to decline battle', 'error');
      }
    } catch (error) {
      console.error('Error declining battle:', error);
      toast('Failed to decline battle', 'error');
    }
    setActionLoading(null);
  };

  // Full class set (text + tinted bg + border) so the badge renders as a proper
  // colored chip. Previously this returned only a text-* class and the bg/border
  // were built by string-mangling it into `rgb(var(--yellow-40020)` — malformed
  // CSS that browsers silently dropped, so the tint never showed.
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'hard': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'extreme': return 'text-red-400 bg-red-500/20 border-red-500/50';
      default: return 'text-zinc-400 bg-zinc-800/50 border-zinc-600/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18191c] flex items-center justify-center">
        <div className="text-zinc-400 font-display font-display font-black uppercase tracking-wider">
          Loading battle offers...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18191c]">
      {/* Header */}
      <div className="bg-[#2d2f35] border-b-4 border-[#3a3d44]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/dashboard"
            className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm font-display font-display font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2 mb-4"
          >
            <span>←</span> BACK TO DASHBOARD
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter text-white">
            BATTLE OFFERS
          </h1>
          <p className="text-zinc-400 font-display font-display font-black uppercase tracking-wider text-sm mt-2">
            {offers.length} {offers.length === 1 ? 'OFFER' : 'OFFERS'} AVAILABLE
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {offers.length === 0 ? (
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-12 text-center">
            <Icon name="mic" size={48} className="text-zinc-600 mb-6" />
            <h2 className="text-2xl font-display font-black uppercase tracking-tighter mb-4 text-white">
              NO OFFERS AVAILABLE
            </h2>
            <p className="text-zinc-400 font-display font-display font-black uppercase tracking-wider text-sm mb-8">
              Check back later for new battle opportunities
            </p>
            <GamingButton href="/dashboard" variant="primary" size="lg">
              RETURN TO DASHBOARD
            </GamingButton>
          </div>
        ) : (
          <div className="space-y-6">
            {offers.map((offer) => {
              const isGrudgeMatch = offer.grudge && offer.grudge.intensity > 70;

              return (
                <div
                  key={offer.id}
                  className={`bg-[#2d2f35] border-2 p-6 transition-all ${
                    offer.is_pvp
                      ? 'border-[#ff8c42] shadow-[0_0_30px_rgba(255,140,66,0.25)]'
                      : isGrudgeMatch
                      ? 'border-[#ff8c42] shadow-[0_0_30px_rgba(255,140,66,0.3)]'
                      : 'border-[#3a3d44] hover:border-[#ff8c42]/30'
                  }`}
                >
                  {/* PvP Player Challenge Banner */}
                  {offer.is_pvp && (
                    <div className="mb-6 pb-6 border-b-2 border-[#ff8c42]/30">
                      <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-[#ff8c42] text-black font-display font-black uppercase tracking-wider text-sm">
                          PLAYER CHALLENGE
                        </div>
                        <p className="text-zinc-400 font-display font-black uppercase tracking-wider text-xs">
                          A real player called you out — accept, prep, and lock in
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Grudge Match Banner */}
                  {offer.grudge && (
                    <div className={`mb-6 pb-6 border-b-2 ${isGrudgeMatch ? 'border-[#ff8c42]/30' : 'border-[#3a3d44]'}`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`px-4 py-2 font-display font-black uppercase tracking-wider text-sm ${
                          isGrudgeMatch
                            ? 'bg-[#ff8c42] text-black animate-pulse'
                            : 'bg-red-500/20 text-red-400 border-2 border-red-500/30'
                        }`}>
                          {isGrudgeMatch ? 'GRUDGE MATCH' : 'RIVALRY'}
                        </div>
                        {offer.h2hRecord && (
                          <div className="text-zinc-400 font-display font-display font-black uppercase tracking-wider text-sm">
                            H2H RECORD:{' '}
                            <span className="text-[#ff8c42]">
                              {offer.h2hRecord.myWins ?? 0}-{offer.h2hRecord.myLosses ?? 0}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Intensity Meters */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs font-display font-display font-black uppercase tracking-wider text-zinc-500 mb-2">
                            GRUDGE INTENSITY
                          </div>
                          <div className="h-3 bg-[#18191c] border-2 border-[#3a3d44] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transition-all"
                              style={{ width: `${offer.grudge.intensity}%` }}
                            />
                          </div>
                          <div className="text-right text-sm font-display font-black text-[#ff8c42] mt-1">
                            {offer.grudge.intensity}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-display font-display font-black uppercase tracking-wider text-zinc-500 mb-2">
                            REMATCH DEMAND
                          </div>
                          <div className="h-3 bg-[#18191c] border-2 border-[#3a3d44] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#ff8c42] to-red-500 transition-all"
                              style={{ width: `${offer.grudge.rematchDemand}%` }}
                            />
                          </div>
                          <div className="text-right text-sm font-display font-black text-[#ff8c42] mt-1">
                            {offer.grudge.rematchDemand}%
                          </div>
                        </div>
                      </div>

                      {/* Origin Story */}
                      <div className={`p-4 border-2 ${
                        isGrudgeMatch
                          ? 'bg-[#ff8c42]/10 border-[#ff8c42]/30'
                          : 'bg-[#18191c] border-[#3a3d44]'
                      }`}>
                        <div className={`text-xs font-display font-black uppercase tracking-wider mb-2 ${
                          isGrudgeMatch ? 'text-[#ff8c42]' : 'text-red-400'
                        }`}>
                          ORIGIN STORY
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {offer.grudge.originStory}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Main Battle Info */}
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: the offer as a fight poster — you vs them */}
                    <div className="flex-1">
                      <div className="mb-6">
                        <MatchupMasthead
                          a={{
                            id: me?.id,
                            name: me?.stage_name || 'YOU',
                            portrait: me ? battleFace(me) : undefined,
                            tier: me?.tier,
                          }}
                          b={{
                            id: offer.ai_battler.id,
                            name: offer.ai_battler.stage_name,
                            portrait: battleFace(offer.ai_battler as any) ?? offer.ai_battler.avatar_url,
                            tier: offer.ai_battler.tier,
                          }}
                          subLine={`${offer.league.name.toUpperCase()}${offer.grudge ? ' · GRUDGE MATCH' : ''}`}
                        />
                        {/* Tags under the poster */}
                        <div className="flex flex-wrap gap-2 mt-4 justify-center">
                          <span className={`px-3 py-1 border-2 font-display font-black uppercase text-xs tracking-wider ${getDifficultyColor(offer.difficulty)}`}>
                            {offer.difficulty}
                          </span>
                          {offer.h2hRecord &&
                            (offer.h2hRecord.myWins ?? 0) + (offer.h2hRecord.myLosses ?? 0) > 0 &&
                            !offer.grudge && (
                              <span className="px-3 py-1 bg-[#18191c] text-zinc-300 border-2 border-[#3a3d44] font-display font-black uppercase text-xs tracking-wider">
                                H2H {offer.h2hRecord.myWins ?? 0}-{offer.h2hRecord.myLosses ?? 0}
                              </span>
                            )}
                          {offer.ai_battler.style_tags?.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-[#18191c] text-zinc-500 border-2 border-[#3a3d44] text-xs font-display font-black uppercase tracking-wider"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatCard
                          label="THE BAG"
                          value={offer.league?.base_payout ? `$${Number(offer.league.base_payout).toLocaleString()}` : '$750'}
                          icon={<Icon name="cash" size={18} />}
                          subtext="FLAT · WIN OR LOSE"
                          variant="highlight"
                        />
                        <StatCard
                          label="RATING"
                          value={offer.opponentRanking.rating}
                          icon={<Icon name="star" size={18} />}
                        />
                        <StatCard
                          label="WINS"
                          value={offer.opponentRanking.wins}
                          icon={<Icon name="trophy" size={18} />}
                        />
                        <StatCard
                          label="LOSSES"
                          value={offer.opponentRanking.losses}
                          icon={<Icon name="skull" size={18} />}
                        />
                      </div>

                      {/* Battle Details */}
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between py-2 border-b-2 border-[#3a3d44]">
                          <span className="text-xs font-display font-display font-black uppercase tracking-wider text-zinc-500">
                            SCHEDULED
                          </span>
                          <span className="text-sm font-display font-bold text-zinc-300">
                            {new Date(offer.scheduled_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b-2 border-[#3a3d44]">
                          <span className="text-xs font-display font-display font-black uppercase tracking-wider text-zinc-500">
                            PREP ENDS
                          </span>
                          <span className="text-sm font-display font-bold text-zinc-300">
                            {new Date(offer.lock_prep_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b-2 border-[#3a3d44]">
                          <span className="text-xs font-display font-display font-black uppercase tracking-wider text-zinc-500">
                            FORMAT
                          </span>
                          <span className="text-sm font-display font-bold text-zinc-300">
                            {offer.league.round_length_minutes}-MINUTE ROUNDS
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-col gap-3 lg:w-48">
                      <GamingButton
                        onClick={() => handleAccept(offer.id)}
                        disabled={actionLoading === offer.id}
                        variant={isGrudgeMatch ? 'primary' : 'primary'}
                        size="lg"
                        className="w-full"
                      >
                        {actionLoading === offer.id ? 'ACCEPTING...' : 'ACCEPT'}
                      </GamingButton>
                      <GamingButton
                        onClick={() => handleDecline(offer.id)}
                        disabled={actionLoading === offer.id}
                        variant="secondary"
                        size="lg"
                        className="w-full"
                      >
                        {actionLoading === offer.id ? 'DECLINING...' : 'DECLINE'}
                      </GamingButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
