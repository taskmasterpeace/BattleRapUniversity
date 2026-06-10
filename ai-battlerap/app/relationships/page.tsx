import { createServerSupabaseClient } from '@/lib/db/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'Relationships | Battle Rap University',
  description: 'View your battler relationships and rivalries',
};

type Relationship = {
  id: string;
  opponent: {
    id: string;
    stage_name: string;
    region: string | null;
    avatar_url: string | null;
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
  twitterBeefActive: boolean;
  startedAt: string;
  lastModifiedAt: string;
};

export default async function RelationshipsPage() {
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

  // Fetch ALL relationships (not just rivals+)
  const { data: relationships } = await supabase
    .from('battler_relationships')
    .select(`
      id,
      battler_a_id,
      battler_b_id,
      current_state,
      state_level,
      high_water_mark,
      intensity,
      crowd_perception_a,
      crowd_perception_b,
      authenticity_score_a,
      authenticity_score_b,
      is_ducking_a,
      is_ducking_b,
      twitter_beef_active,
      status,
      started_at,
      last_modified_at,
      battler_a:battlers!battler_a_id(
        id,
        stage_name,
        region,
        avatar_url
      ),
      battler_b:battlers!battler_b_id(
        id,
        stage_name,
        region,
        avatar_url
      )
    `)
    .or(`battler_a_id.eq.${battler.id},battler_b_id.eq.${battler.id}`)
    .eq('status', 'active')
    .order('state_level', { ascending: false })
    .order('intensity', { ascending: false });

  // Transform relationships
  const allRelationships: Relationship[] = (relationships || []).map((rel) => {
    const isPlayerA = rel.battler_a_id === battler.id;
    const opponent = (isPlayerA ? rel.battler_b : rel.battler_a) as any;

    return {
      id: rel.id,
      opponent: opponent,
      currentState: rel.current_state,
      stateLevel: rel.state_level,
      highWaterMark: rel.high_water_mark,
      intensity: rel.intensity,
      playerCrowdPerception: isPlayerA
        ? rel.crowd_perception_a
        : rel.crowd_perception_b,
      opponentCrowdPerception: isPlayerA
        ? rel.crowd_perception_b
        : rel.crowd_perception_a,
      playerAuthenticity: isPlayerA
        ? rel.authenticity_score_a
        : rel.authenticity_score_b,
      opponentAuthenticity: isPlayerA
        ? rel.authenticity_score_b
        : rel.authenticity_score_a,
      playerIsDucking: isPlayerA ? rel.is_ducking_a : rel.is_ducking_b,
      opponentIsDucking: isPlayerA ? rel.is_ducking_b : rel.is_ducking_a,
      twitterBeefActive: rel.twitter_beef_active,
      startedAt: rel.started_at,
      lastModifiedAt: rel.last_modified_at,
    };
  });

  // Categorize relationships
  const legendaryBeefs = allRelationships.filter((r) => r.currentState === 'legendary_beef');
  const atWar = allRelationships.filter((r) => r.currentState === 'at_war');
  const rivals = allRelationships.filter((r) => r.currentState === 'rivals');
  const tense = allRelationships.filter((r) => r.currentState === 'tense');
  const aware = allRelationships.filter((r) => r.currentState === 'aware');
  const unknown = allRelationships.filter((r) => r.currentState === 'unknown');

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

  const RelationshipCard = ({ rel }: { rel: Relationship }) => {
    const stateInfo = getStateInfo(rel.currentState);
    const crowdDiff = rel.playerCrowdPerception - rel.opponentCrowdPerception;
    const playerWinning = crowdDiff > 0;
    const isTied = Math.abs(crowdDiff) < 5;

    return (
      <Link
        href={`/relationship/${rel.opponent.id}`}
        className={`block border-2 border-[#3a3d44] hover:border-orange-500/50 hover:-translate-y-0.5 p-5 transition-all ${stateInfo.bgColor}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{stateInfo.emoji}</span>
            <div>
              <h3 className="text-xl font-black text-zinc-100">
                {rel.opponent.stage_name.toUpperCase()}
              </h3>
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

        {/* Crowd Perception */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">
              Crowd Perception
            </span>
            <span className={`text-xs font-bold ${
              isTied ? 'text-zinc-400' : playerWinning ? 'text-green-500' : 'text-red-500'
            }`}>
              {isTied ? 'TIED' : playerWinning ? `WINNING (+${crowdDiff})` : `LOSING (${crowdDiff})`}
            </span>
          </div>

          {/* Bars */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-zinc-600 mb-1">YOU</p>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600"
                  style={{ width: `${rel.playerCrowdPerception}%` }}
                />
              </div>
              <p className="text-xs text-green-500 font-bold mt-1">
                {rel.playerCrowdPerception}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 mb-1">THEM</p>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600"
                  style={{ width: `${rel.opponentCrowdPerception}%` }}
                />
              </div>
              <p className="text-xs text-red-500 font-bold mt-1">
                {rel.opponentCrowdPerception}
              </p>
            </div>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex gap-2 flex-wrap">
          {rel.twitterBeefActive && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border-2 border-blue-500/30 text-xs font-display font-black uppercase tracking-wide">
              🐦 TWITTER BEEF
            </span>
          )}
          {rel.playerIsDucking && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 border-2 border-red-500/30 text-xs font-display font-black uppercase tracking-wide">
              ⚠️ DUCKING
            </span>
          )}
          {rel.opponentIsDucking && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 border-2 border-green-500/30 text-xs font-display font-black uppercase tracking-wide">
              ✓ THEY'RE DUCKING
            </span>
          )}
          {rel.highWaterMark !== rel.currentState && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 border-2 border-purple-500/30 text-xs font-display font-black uppercase tracking-wide">
              PEAK: {getStateInfo(rel.highWaterMark).label}
            </span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] bg-[#101114]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link
            href="/dashboard"
            className="inline-block text-sm font-bold text-[#ff8c42] hover:text-[#ff9d5c] uppercase tracking-wider transition-colors mb-4"
          >
            ← Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tighter mb-2">
            YOUR RELATIONSHIPS
          </h1>
          <p className="text-zinc-400 text-sm uppercase tracking-wide">
            {allRelationships.length} {allRelationships.length === 1 ? 'RELATIONSHIP' : 'RELATIONSHIPS'} TRACKED
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* No Relationships */}
        {allRelationships.length === 0 && (
          <div className="bg-[#18191c] border-2 border-[#3a3d44] p-12 text-center">
            <p className="text-2xl font-display font-black uppercase tracking-tighter text-zinc-300 mb-3">
              NO BEEF YET — STAY DANGEROUS
            </p>
            <p className="text-zinc-500 text-sm uppercase tracking-wide mb-8">
              Every battle plants a storyline. Take an offer and give the blogs something to write about.
            </p>
            <Link
              href="/battle/offers"
              className="inline-block px-6 py-3 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_-4px_rgba(255,140,66,0.5)]"
            >
              VIEW BATTLE OFFERS
            </Link>
          </div>
        )}

        {/* Legendary Beefs */}
        {legendaryBeefs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-display font-black tracking-tighter mb-6 text-purple-500">
              👑 LEGENDARY BEEFS ({legendaryBeefs.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {legendaryBeefs.map((rel) => (
                <RelationshipCard key={rel.id} rel={rel} />
              ))}
            </div>
          </div>
        )}

        {/* At War */}
        {atWar.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-display font-black tracking-tighter mb-6 text-red-500">
              🔥 AT WAR ({atWar.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {atWar.map((rel) => (
                <RelationshipCard key={rel.id} rel={rel} />
              ))}
            </div>
          </div>
        )}

        {/* Rivals */}
        {rivals.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-display font-black tracking-tighter mb-6 text-yellow-500">
              ⚔️ RIVALS ({rivals.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rivals.map((rel) => (
                <RelationshipCard key={rel.id} rel={rel} />
              ))}
            </div>
          </div>
        )}

        {/* Tense */}
        {tense.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-display font-black tracking-tighter mb-6 text-[#ff8c42]">
              😤 TENSE RELATIONSHIPS ({tense.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tense.map((rel) => (
                <RelationshipCard key={rel.id} rel={rel} />
              ))}
            </div>
          </div>
        )}

        {/* Aware */}
        {aware.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-display font-black tracking-tighter mb-6 text-blue-500">
              👀 AWARE OF EACH OTHER ({aware.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aware.map((rel) => (
                <RelationshipCard key={rel.id} rel={rel} />
              ))}
            </div>
          </div>
        )}

        {/* Unknown */}
        {unknown.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-display font-black tracking-tighter mb-6 text-zinc-500">
              🤝 UNKNOWN ({unknown.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unknown.map((rel) => (
                <RelationshipCard key={rel.id} rel={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
