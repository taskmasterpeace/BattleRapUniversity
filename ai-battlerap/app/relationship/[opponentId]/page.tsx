import { createServerSupabaseClient } from '@/lib/db/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'Relationship Detail | Battle Rap University',
};

type Props = {
  params: Promise<{
    opponentId: string;
  }>;
};

export default async function RelationshipDetailPage({ params }: Props) {
  const { opponentId } = await params;
  const supabase = await createServerSupabaseClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's battler
  const { data: battler } = await supabase
    .from('battlers')
    .select('id, stage_name')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();

  if (!battler) {
    redirect('/onboarding');
  }

  // Get opponent info
  const { data: opponent } = await supabase
    .from('battlers')
    .select('id, stage_name, region, avatar_url, banner_url')
    .eq('id', opponentId)
    .single();

  if (!opponent) {
    redirect('/relationships');
  }

  // Get relationship
  const { data: relationship } = await supabase
    .from('battler_relationships')
    .select('*')
    .or(`and(battler_a_id.eq.${battler.id},battler_b_id.eq.${opponentId}),and(battler_a_id.eq.${opponentId},battler_b_id.eq.${battler.id})`)
    .eq('status', 'active')
    .single();

  // If no relationship exists yet, show minimal view
  if (!relationship) {
    return (
      <div className="min-h-screen bg-[#18191c] text-zinc-100">
        <div className="border-b-2 border-[#3a3d44] bg-[#2d2f35]/50">
          <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-xl font-bold tracking-tight hover:text-[#ff8c42] transition">
                BATTLE RAP UNIVERSITY
              </Link>
              <span className="text-zinc-700">|</span>
              <span className="text-sm text-zinc-500 uppercase tracking-wider">Relationship</span>
            </div>
            <Link
              href="/relationships"
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition uppercase tracking-wider"
            >
              ← BACK
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-12 text-center">
            <h1 className="text-3xl font-black mb-4">
              NO RELATIONSHIP WITH {opponent.stage_name.toUpperCase()}
            </h1>
            <p className="text-zinc-500 mb-6">
              You haven't battled or interacted with this battler yet.
            </p>
            <Link
              href="/relationships"
              className="inline-block px-6 py-3 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider rounded transition"
            >
              VIEW ALL RELATIONSHIPS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine perspective
  const isPlayerA = relationship.battler_a_id === battler.id;

  // Extract relationship data from player's perspective
  const relData = {
    id: relationship.id,
    currentState: relationship.current_state,
    stateLevel: relationship.state_level,
    highWaterMark: relationship.high_water_mark,
    intensity: relationship.intensity,
    playerCrowdPerception: isPlayerA
      ? relationship.crowd_perception_a
      : relationship.crowd_perception_b,
    opponentCrowdPerception: isPlayerA
      ? relationship.crowd_perception_b
      : relationship.crowd_perception_a,
    playerAuthenticity: isPlayerA
      ? relationship.authenticity_score_a
      : relationship.authenticity_score_b,
    opponentAuthenticity: isPlayerA
      ? relationship.authenticity_score_b
      : relationship.authenticity_score_a,
    playerIsDucking: isPlayerA
      ? relationship.is_ducking_a
      : relationship.is_ducking_b,
    opponentIsDucking: isPlayerA
      ? relationship.is_ducking_b
      : relationship.is_ducking_a,
    playerOffersIgnored: isPlayerA
      ? relationship.consecutive_offers_ignored_by_a
      : relationship.consecutive_offers_ignored_by_b,
    opponentOffersIgnored: isPlayerA
      ? relationship.consecutive_offers_ignored_by_b
      : relationship.consecutive_offers_ignored_by_a,
    twitterBeefActive: relationship.twitter_beef_active,
    twitterBeefStartedAt: relationship.twitter_beef_started_at,
    startedAt: relationship.started_at,
    lastModifiedAt: relationship.last_modified_at,
    originType: relationship.origin_type,
    originStory: relationship.origin_story,
  };

  // Get battle history between these two battlers
  const { data: battles } = await supabase
    .from('battles')
    .select(`
      id,
      scheduled_at,
      status,
      verdict,
      winner_battler_id,
      league:leagues!league_id(name)
    `)
    .or(`and(battler_player_id.eq.${battler.id},battler_ai_id.eq.${opponentId}),and(battler_player_id.eq.${opponentId},battler_ai_id.eq.${battler.id})`)
    .in('status', ['completed', 'accepted', 'locked'])
    .order('scheduled_at', { ascending: false })
    .limit(10);

  // Get promotion events related to this relationship
  // (Events where target_battler_id is the opponent)
  const { data: promotionEvents } = await supabase
    .from('promotion_events')
    .select(`
      id,
      event_type,
      title,
      description,
      key_quote,
      crowd_perception_delta,
      authenticity_damage,
      media_coverage,
      occurred_at,
      days_before_battle,
      battler_id,
      target_battler_id,
      battle_id
    `)
    .or(`and(battler_id.eq.${battler.id},target_battler_id.eq.${opponentId}),and(battler_id.eq.${opponentId},target_battler_id.eq.${battler.id})`)
    .order('occurred_at', { ascending: false })
    .limit(20);

  // State label mapping
  const getStateInfo = (state: string): { label: string; emoji: string; color: string; bgColor: string } => {
    switch (state) {
      case 'legendary_beef':
        return { label: 'LEGENDARY BEEF', emoji: '👑', color: 'text-purple-500', bgColor: 'bg-purple-500/10' };
      case 'at_war':
        return { label: 'AT WAR', emoji: '🔥', color: 'text-red-500', bgColor: 'bg-red-500/10' };
      case 'rivals':
        return { label: 'RIVALS', emoji: '⚔️', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' };
      case 'tense':
        return { label: 'TENSE', emoji: '😤', color: 'text-[#ff8c42]', bgColor: 'bg-[#ff8c42]/10' };
      case 'aware':
        return { label: 'AWARE', emoji: '👀', color: 'text-blue-500', bgColor: 'bg-blue-500/10' };
      default:
        return { label: 'UNKNOWN', emoji: '🤝', color: 'text-zinc-500', bgColor: 'bg-zinc-800' };
    }
  };

  const stateInfo = getStateInfo(relData.currentState);
  const crowdDiff = relData.playerCrowdPerception - relData.opponentCrowdPerception;
  const playerWinning = crowdDiff > 0;
  const isTied = Math.abs(crowdDiff) < 5;

  // Battle record
  const completedBattles = battles?.filter((b) => b.status === 'completed') || [];
  const playerWins = completedBattles.filter((b) => b.winner_battler_id === battler.id).length;
  const opponentWins = completedBattles.filter((b) => b.winner_battler_id === opponentId).length;

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] bg-[#2d2f35]/50">
        <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight hover:text-[#ff8c42] transition">
              BATTLE RAP UNIVERSITY
            </Link>
            <span className="text-zinc-700">|</span>
            <span className="text-sm text-zinc-500 uppercase tracking-wider">Relationship Detail</span>
          </div>
          <Link
            href="/relationships"
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition uppercase tracking-wider"
          >
            ← BACK
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Relationship Header */}
        <div className={`mb-12 rounded-lg border-2 border-[#3a3d44] p-8 ${stateInfo.bgColor}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{stateInfo.emoji}</span>
              <div>
                <h1 className="text-4xl font-display font-black tracking-tighter mb-2">
                  {opponent.stage_name.toUpperCase()}
                </h1>
                {opponent.region && (
                  <p className="text-sm text-zinc-500 uppercase tracking-wide">
                    {opponent.region}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`text-lg font-black uppercase tracking-wider ${stateInfo.color}`}>
                {stateInfo.label}
              </span>
              <p className="text-xs text-zinc-600 mt-1">
                INTENSITY: {relData.intensity}/100
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Battle Record */}
            <div className="bg-[#18191c] border-2 border-[#3a3d44] rounded p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                Battle Record
              </p>
              <p className="text-2xl font-black">
                <span className="text-green-500">{playerWins}</span>
                <span className="text-zinc-600"> - </span>
                <span className="text-red-500">{opponentWins}</span>
              </p>
            </div>

            {/* Crowd Perception */}
            <div className="bg-[#18191c] border-2 border-[#3a3d44] rounded p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                Crowd Perception
              </p>
              <p className={`text-2xl font-black ${
                isTied ? 'text-zinc-400' : playerWinning ? 'text-green-500' : 'text-red-500'
              }`}>
                {isTied ? 'TIED' : playerWinning ? `+${crowdDiff}` : `${crowdDiff}`}
              </p>
            </div>

            {/* Authenticity */}
            <div className="bg-[#18191c] border-2 border-[#3a3d44] rounded p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                Your Authenticity
              </p>
              <p className={`text-2xl font-black ${
                relData.playerAuthenticity >= 80 ? 'text-green-500' :
                relData.playerAuthenticity >= 50 ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {relData.playerAuthenticity}/100
              </p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex gap-2 flex-wrap mt-6">
            {relData.twitterBeefActive && (
              <span className="px-3 py-2 bg-blue-500/20 text-blue-400 border-2 border-blue-500/30 text-xs font-display font-black uppercase tracking-wide rounded">
                🐦 TWITTER BEEF ACTIVE
              </span>
            )}
            {relData.playerIsDucking && (
              <span className="px-3 py-2 bg-red-500/20 text-red-400 border-2 border-red-500/30 text-xs font-display font-black uppercase tracking-wide rounded">
                ⚠️ DUCKING ({relData.playerOffersIgnored} OFFERS IGNORED)
              </span>
            )}
            {relData.opponentIsDucking && (
              <span className="px-3 py-2 bg-green-500/20 text-green-400 border-2 border-green-500/30 text-xs font-display font-black uppercase tracking-wide rounded">
                ✓ THEY'RE DUCKING ({relData.opponentOffersIgnored} OFFERS IGNORED)
              </span>
            )}
            {relData.highWaterMark !== relData.currentState && (
              <span className="px-3 py-2 bg-purple-500/20 text-purple-400 border-2 border-purple-500/30 text-xs font-display font-black uppercase tracking-wide rounded">
                PEAK: {getStateInfo(relData.highWaterMark).label}
              </span>
            )}
          </div>
        </div>

        {/* Crowd Perception Breakdown */}
        <div className="mb-12 bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
          <h2 className="text-lg font-black uppercase tracking-wider mb-6 text-[#ff8c42]">
            📊 CROWD PERCEPTION BATTLE
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-400 uppercase tracking-wide">
                  {battler.stage_name} (YOU)
                </span>
                <span className="text-sm font-bold text-green-500">
                  {relData.playerCrowdPerception}/100
                </span>
              </div>
              <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600"
                  style={{ width: `${relData.playerCrowdPerception}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-400 uppercase tracking-wide">
                  {opponent.stage_name}
                </span>
                <span className="text-sm font-bold text-red-500">
                  {relData.opponentCrowdPerception}/100
                </span>
              </div>
              <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600"
                  style={{ width: `${relData.opponentCrowdPerception}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Battle History */}
        {completedBattles.length > 0 && (
          <div className="mb-12 bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
            <h2 className="text-lg font-black uppercase tracking-wider mb-6 text-[#ff8c42]">
              ⚔️ BATTLE HISTORY ({completedBattles.length})
            </h2>
            <div className="space-y-3">
              {completedBattles.map((battle) => {
                const won = battle.winner_battler_id === battler.id;
                return (
                  <Link
                    key={battle.id}
                    href={`/battle/${battle.id}`}
                    className="block p-4 bg-[#18191c] border-2 border-[#3a3d44] hover:border-orange-500/50 transition rounded"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`px-3 py-1 text-xs font-display font-black uppercase ${
                            won
                              ? 'bg-green-500/20 text-green-500 border-2 border-green-500/30'
                              : 'bg-red-500/20 text-red-500 border-2 border-red-500/30'
                          }`}>
                            {won ? 'VICTORY' : 'LOSS'} {battle.verdict}
                          </span>
                          <span className="text-xs text-zinc-600 uppercase">
                            {(battle.league as any)?.name}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400">
                          {new Date(battle.scheduled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-xs text-[#ff8c42] uppercase font-bold">
                        VIEW →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Promotion Events Timeline */}
        {promotionEvents && promotionEvents.length > 0 && (
          <div className="mb-12 bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
            <h2 className="text-lg font-black uppercase tracking-wider mb-6 text-[#ff8c42]">
              📰 PROMOTION TIMELINE ({promotionEvents.length})
            </h2>
            <div className="space-y-4">
              {promotionEvents.map((event) => {
                const isPlayerEvent = event.battler_id === battler.id;
                return (
                  <div
                    key={event.id}
                    className={`p-4 border-2 rounded ${
                      isPlayerEvent
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className={`text-xs font-display font-black uppercase tracking-wide ${
                          isPlayerEvent ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {isPlayerEvent ? 'YOU' : opponent.stage_name}
                        </span>
                        <span className="text-xs text-zinc-600 ml-2">
                          {event.event_type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-600">
                        {new Date(event.occurred_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100 mb-1">
                      {event.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mb-2">
                      {event.description}
                    </p>
                    {event.key_quote && (
                      <p className="text-xs text-zinc-400 italic border-l-2 border-orange-500 pl-3">
                        "{event.key_quote}"
                      </p>
                    )}
                    <div className="flex gap-3 mt-3 text-xs">
                      {event.crowd_perception_delta !== 0 && (
                        <span className={`${
                          event.crowd_perception_delta > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          Crowd: {event.crowd_perception_delta > 0 ? '+' : ''}{event.crowd_perception_delta}
                        </span>
                      )}
                      {event.authenticity_damage > 0 && (
                        <span className="text-[#ff8c42]">
                          Authenticity Damage: -{event.authenticity_damage}
                        </span>
                      )}
                      {event.media_coverage > 0 && (
                        <span className="text-blue-500">
                          Media: {event.media_coverage}/10
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Origin Story */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
          <h2 className="text-lg font-black uppercase tracking-wider mb-4 text-[#ff8c42]">
            📖 ORIGIN STORY
          </h2>
          <p className="text-sm text-zinc-400 mb-2">
            <span className="text-zinc-600 uppercase tracking-wide">Started:</span>{' '}
            {new Date(relData.startedAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-zinc-400 mb-2">
            <span className="text-zinc-600 uppercase tracking-wide">Origin:</span>{' '}
            {relData.originType?.replace(/_/g, ' ').toUpperCase()}
          </p>
          {relData.originStory && (
            <p className="text-sm text-zinc-300 italic">
              "{relData.originStory}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
