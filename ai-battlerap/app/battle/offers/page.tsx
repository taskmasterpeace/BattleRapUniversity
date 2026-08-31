'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatCard from '@/components/ui/StatCard';
import Icon from '@/components/ui/Icon';
import GamingButton from '@/components/ui/GamingButton';
import { toast } from '@/components/ui/Toast';
import MatchupMasthead, { battleFace } from '@/components/battle/MatchupMasthead';
import { GrudgeMeter } from '@/components/grudge/GrudgeMeter';
import { RematchDemandBar } from '@/components/grudge/RematchDemandBar';
import { venueForLeagueName, artForTier } from '@/lib/game/venueForLeague';

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
    logo_url?: string | null;
    city?: {
      name: string;
      state: string | null;
      background_url: string | null;
      skyline_url: string | null;
    } | null;
  };
  venue?: {
    name: string;
    prestige_level: number;
    venue_type?: { slug: string; tier: string; sprite_key: string | null } | null;
  } | null;
  tv_broadcast?: boolean;
  ai_battler: {
    id: string;
    stage_name: string;
    tier: string;
    style_tags: string[];
    identity?: { coding?: string; facets?: string[] } | null;
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

              const city = offer.league.city;
              // The battle's BOOKED room (venues table) is the truth; the
              // tier-fallback resolver covers legacy offers with no booking.
              const fallback = venueForLeagueName(offer.league.name);
              const roomName = offer.venue?.name ?? fallback.name;
              const venueArt =
                offer.venue?.venue_type?.sprite_key ??
                (offer.venue?.venue_type?.tier
                  ? artForTier(offer.venue.venue_type.tier)
                  : fallback.art) ??
                city?.background_url ??
                null;
              const coding = offer.ai_battler.identity?.coding;
              const CODING_CHIP: Record<string, { label: string; color: string }> = {
                street: { label: 'STREET-CODED', color: '#E23A2E' },
                craft: { label: 'CRAFT-CODED', color: '#2F7DD1' },
                crossover: { label: 'CROSSOVER', color: '#E7B23C' },
                overseas: { label: 'OVERSEAS', color: '#35C46B' },
              };

              return (
                <div
                  key={offer.id}
                  className={`fs bg-[#101114] border-2 overflow-hidden shadow-[5px_5px_0_rgba(0,0,0,.5)] transition-all ${
                    offer.is_pvp
                      ? 'border-[#ff8c42]'
                      : isGrudgeMatch
                      ? 'border-[#ff8c42]'
                      : 'border-black hover:border-[#ff8c42]/40'
                  }`}
                >
                  {/* THE VENUE — where this one's going down (city skyline band) */}
                  <div
                    className="relative h-44 overflow-hidden border-b-2 border-black"
                    style={{ background: '#0B0C10' }}
                  >
                    {venueArt && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={venueArt}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ imageRendering: 'pixelated', objectPosition: 'center 30%' }}
                      />
                    )}
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(180deg, rgba(8,9,12,.15) 30%, rgba(8,9,12,.92) 100%)' }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex items-end justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        {offer.league.logo_url && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={offer.league.logo_url}
                            alt=""
                            className="w-16 h-16 shrink-0 object-contain [image-rendering:pixelated] drop-shadow-[0_3px_6px_rgba(0,0,0,.8)]"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#ff8c42]">
                            LIVE FROM {roomName.toUpperCase()}
                            {city ? ` · ${city.name.toUpperCase()}${city.state ? `, ${city.state}` : ''}` : ''}
                          </p>
                          <p
                            className="uppercase text-zinc-100 truncate leading-none mt-1"
                            style={{ fontFamily: 'var(--font-poster)', fontSize: 30, textShadow: '2px 2px 0 #000' }}
                          >
                            {offer.league.name}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        {offer.tv_broadcast && (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 mb-2 mr-2 bg-[#E23A2E] text-white font-display font-black uppercase tracking-wider text-sm border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,.5)]">
                            <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
                            NATIONAL TV
                          </span>
                        )}
                        {(isGrudgeMatch || offer.is_pvp) && (
                          <span className="inline-block px-3 py-1.5 mb-2 bg-[#ff8c42] text-black font-display font-black uppercase tracking-wider text-sm border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,.5)]">
                            {offer.is_pvp ? 'PLAYER CHALLENGE' : 'GRUDGE MATCH'}
                          </span>
                        )}
                        <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-zinc-300">
                          {new Date(offer.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' · '}
                          {offer.league.round_length_minutes}-MIN ROUNDS
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                  {/* PvP explainer — the band already wears the chip */}
                  {offer.is_pvp && (
                    <p className="mb-5 text-zinc-400 font-display font-black uppercase tracking-wider text-sm">
                      A real player called you out — accept, prep, and lock in
                    </p>
                  )}

                  {/* THE BEEF — history, heat, and how it started */}
                  {offer.grudge && (
                    <div
                      className="mb-6 p-5 bg-[#17181C] border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,.4)]"
                      style={{ borderLeft: '4px solid #E23A2E' }}
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                        <span className={`font-display font-black uppercase tracking-wider text-base ${isGrudgeMatch ? 'text-[#ff8c42]' : 'text-red-400'}`}>
                          {isGrudgeMatch ? '🔥 THE BEEF' : 'THE HISTORY'}
                        </span>
                        {offer.h2hRecord && (
                          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 12, color: '#F4F4F6' }}>
                            H2H {offer.h2hRecord.myWins ?? 0}-{offer.h2hRecord.myLosses ?? 0}
                          </span>
                        )}
                      </div>
                      <p className="text-base text-zinc-300 leading-relaxed mb-4">
                        {offer.grudge.originStory}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                          <div className="flex justify-between items-baseline mb-1.5">
                            <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-zinc-500">
                              GRUDGE INTENSITY
                            </span>
                            <span className="font-display font-black text-[#ff8c42]">{offer.grudge.intensity}%</span>
                          </div>
                          <GrudgeMeter intensity={offer.grudge.intensity} showLabel={false} />
                        </div>
                        <div>
                          <div className="flex justify-between items-baseline mb-1.5">
                            <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-zinc-500">
                              REMATCH DEMAND
                            </span>
                            <span className="font-display font-black text-[#2F7DD1]">{offer.grudge.rematchDemand}%</span>
                          </div>
                          <RematchDemandBar demand={offer.grudge.rematchDemand} showLabel={false} />
                        </div>
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
                          {coding && CODING_CHIP[coding] && (
                            <span
                              className="px-3 py-1 border-2 border-black font-display font-black uppercase text-xs tracking-wider text-black shadow-[2px_2px_0_rgba(0,0,0,.4)]"
                              style={{ background: CODING_CHIP[coding].color }}
                              title="Which room claims them — personality, not race"
                            >
                              {CODING_CHIP[coding].label}
                            </span>
                          )}
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

                      {/* When it goes down */}
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="bg-[#17181C] border border-black px-4 py-3" style={{ borderTop: '2px solid #F5731A' }}>
                          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500 mb-1">FIGHT NIGHT</div>
                          <div className="font-display font-black uppercase text-zinc-100">
                            {new Date(offer.scheduled_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="bg-[#17181C] border border-black px-4 py-3" style={{ borderTop: '2px solid #E7B23C' }}>
                          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500 mb-1">PREP LOCKS</div>
                          <div className="font-display font-black uppercase text-zinc-100">
                            {new Date(offer.lock_prep_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </div>
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
