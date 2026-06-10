import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/battles/[id]/scouting
 *
 * Scouting Report — research prep days unlock tiered intel about the opponent.
 * All intel is computed from real game data (rankings, battles, battle_rounds,
 * badge_costs), never invented.
 *
 *   0 research days → tier 0: locked, teaser only
 *   1 research day  → tier 1: record, ELO, tier, style tags
 *   2 research days → tier 2: + last 3 battle results, avg crowd reaction
 *   3+ research days→ tier 3: + weaknesses (choke history, peak-vs-consistency
 *                      read, badge list with negative badges flagged) + insights
 */

type RecentBattle = {
  id: string;
  vs: string;
  won: boolean;
  verdict: string | null;
  date: string;
};

type ScoutedBadge = {
  code: string;
  name: string;
  negative: boolean;
  description: string | null;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // The requesting user's battler
  const { data: battler } = await supabase
    .from('battlers')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();

  if (!battler) {
    return NextResponse.json({ error: 'No battler found' }, { status: 404 });
  }

  // The battle — must belong to this player
  const { data: battle } = await supabase
    .from('battles')
    .select('id, battler_player_id, battler_ai_id')
    .eq('id', id)
    .single();

  if (!battle) {
    return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
  }
  if (battle.battler_player_id !== battler.id) {
    return NextResponse.json({ error: 'Not your battle' }, { status: 403 });
  }

  const opponentId = battle.battler_ai_id;

  // Research days the player has banked for this battle
  const { count: researchCount } = await supabase
    .from('prep_blocks')
    .select('id', { count: 'exact', head: true })
    .eq('battle_id', id)
    .eq('battler_id', battler.id)
    .eq('focus', 'research');

  const researchDays = researchCount ?? 0;
  const tier = Math.min(3, researchDays);

  // Opponent identity is always visible (it's on the battle card already)
  const { data: opponentRow } = await supabase
    .from('battlers')
    .select('id, stage_name, tier, style_tags, avatar_url')
    .eq('id', opponentId)
    .single();

  const base = {
    researchDays,
    tier,
    opponent: opponentRow
      ? { id: opponentRow.id, stage_name: opponentRow.stage_name }
      : null,
  };

  if (tier === 0) {
    return NextResponse.json({
      ...base,
      teaser: opponentRow
        ? `Word on the street is ${opponentRow.stage_name} has tape out there. Spend a RESEARCH day to start digging.`
        : 'Spend a RESEARCH day to start digging.',
      tier1: null,
      tier2: null,
      tier3: null,
    });
  }

  // ---------------------------------------------------------------- TIER 1
  const { data: ranking } = await supabase
    .from('rankings')
    .select('rating, wins, losses, streak')
    .eq('battler_id', opponentId)
    .single();

  const tier1 = {
    record: {
      wins: ranking?.wins ?? 0,
      losses: ranking?.losses ?? 0,
      rating: ranking?.rating ?? 1200,
      streak: ranking?.streak ?? 0,
    },
    tier: opponentRow?.tier ?? 'low',
    styleTags: (opponentRow?.style_tags as string[]) ?? [],
  };

  if (tier === 1) {
    return NextResponse.json({ ...base, tier1, tier2: null, tier3: null });
  }

  // ---------------------------------------------------------------- TIER 2
  // Last 3 completed battles the opponent fought (either side of the card)
  const { data: oppBattles } = await supabase
    .from('battles')
    .select(
      `id, verdict, winner_battler_id, scheduled_at, battler_player_id, battler_ai_id,
       player_side:battler_player_id(stage_name),
       ai_side:battler_ai_id(stage_name)`
    )
    .or(`battler_player_id.eq.${opponentId},battler_ai_id.eq.${opponentId}`)
    .eq('status', 'completed')
    .order('scheduled_at', { ascending: false })
    .limit(3);

  const recentBattles: RecentBattle[] = (oppBattles || []).map((b: any) => {
    const oppWasPlayerSide = b.battler_player_id === opponentId;
    const otherName = oppWasPlayerSide
      ? b.ai_side?.stage_name ?? 'UNKNOWN'
      : b.player_side?.stage_name ?? 'UNKNOWN';
    return {
      id: b.id,
      vs: otherName,
      won: b.winner_battler_id === opponentId,
      verdict: b.verdict ?? null,
      date: b.scheduled_at,
    };
  });

  // All of the opponent's round-level tape
  const { data: oppRounds } = await supabase
    .from('battle_rounds')
    .select('average_score, peak_score, consistency_score, crowd_reaction, choked')
    .eq('battler_id', opponentId);

  const rounds = oppRounds || [];
  const totalRounds = rounds.length;
  const avg = (xs: number[]) =>
    xs.length > 0 ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;

  const avgCrowdReaction =
    totalRounds > 0 ? Math.round(avg(rounds.map((r: any) => r.crowd_reaction))) : null;

  const tier2 = {
    recentBattles,
    avgCrowdReaction,
    roundsScouted: totalRounds,
  };

  if (tier === 2) {
    return NextResponse.json({ ...base, tier1, tier2, tier3: null });
  }

  // ---------------------------------------------------------------- TIER 3
  const chokedRounds = rounds.filter((r: any) => r.choked).length;
  const chokeRate =
    totalRounds > 0 ? Math.round((chokedRounds / totalRounds) * 100) : null;

  const avgPeak = totalRounds > 0 ? avg(rounds.map((r: any) => r.peak_score)) : null;
  const avgConsistency =
    totalRounds > 0 ? avg(rounds.map((r: any) => r.consistency_score)) : null;

  // Performance profile read
  let profileLabel: string | null = null;
  if (avgPeak !== null && avgConsistency !== null) {
    const gap = avgPeak - avgConsistency;
    if (gap >= 2.5) profileLabel = 'FLASHY BUT INCONSISTENT';
    else if (avgPeak >= 7.5) profileLabel = 'PEAK PERFORMER';
    else profileLabel = 'STEADY GRINDER';
  }

  // Badge list with display names + negative flags (from badge_costs).
  // style_tags may hold badge codes ('choker') or display names ('Known Choker'),
  // so match against both.
  const styleTags = (opponentRow?.style_tags as string[]) ?? [];
  let badges: ScoutedBadge[] = [];
  if (styleTags.length > 0) {
    const { data: badgeRows } = await supabase
      .from('badge_costs')
      .select('badge_code, badge_name, is_negative, description');

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const lookup = new Map<string, any>();
    for (const b of badgeRows || []) {
      lookup.set(normalize(b.badge_code), b);
      lookup.set(normalize(b.badge_name), b);
    }

    badges = styleTags.map((tag) => {
      const row = lookup.get(normalize(tag));
      return {
        code: row?.badge_code ?? tag,
        name: row?.badge_name ?? tag.replace(/_/g, ' '),
        negative: row?.is_negative ?? false,
        description: row?.description ?? null,
      };
    });
  }

  // Actionable insights, written from the numbers
  const insights: string[] = [];
  const oppName = opponentRow?.stage_name ?? 'This opponent';

  if (chokeRate !== null) {
    if (chokeRate >= 15) {
      insights.push(
        `CHOKE RATE: ${chokeRate}% — pressure him early, he folds when the heat is on`
      );
    } else if (chokeRate >= 5) {
      insights.push(
        `CHOKE RATE: ${chokeRate}% — cracks under pressure occasionally, stay aggressive`
      );
    } else {
      insights.push(
        `CHOKE RATE: ${chokeRate}% — ice cold under pressure, don't bank on a meltdown`
      );
    }
  }

  if (avgCrowdReaction !== null) {
    if (avgCrowdReaction >= 75) {
      insights.push(
        `AVG CROWD ${avgCrowdReaction}% — the room loves him, take the crowd early or drown in it`
      );
    } else if (avgCrowdReaction < 60) {
      insights.push(
        `AVG CROWD ${avgCrowdReaction}% — crowd work won't save him, out-perform and the room is yours`
      );
    } else {
      insights.push(
        `AVG CROWD ${avgCrowdReaction}% — solid but not untouchable with the room`
      );
    }
  }

  if (profileLabel === 'FLASHY BUT INCONSISTENT' && avgPeak !== null) {
    insights.push(
      `Haymakers land around ${avgPeak.toFixed(1)} but the filler dips — survive his moments and grind him out`
    );
  } else if (profileLabel === 'STEADY GRINDER') {
    insights.push(
      `No huge spikes in the tape — he wins on consistency, so bring a haymaker he can't answer`
    );
  } else if (profileLabel === 'PEAK PERFORMER' && avgPeak !== null) {
    insights.push(
      `Peaks at ${avgPeak.toFixed(1)} AND stays consistent — full prep or get washed`
    );
  }

  const negativeBadges = badges.filter((b) => b.negative);
  for (const nb of negativeBadges) {
    insights.push(`EXPLOIT: ${nb.name.toUpperCase()} — ${nb.description ?? 'a known weakness in his game'}`);
  }

  if (totalRounds === 0) {
    insights.push(`No tape on ${oppName} yet — a debut means nerves, press him from the opening bar`);
  }

  const tier3 = {
    chokeRate,
    chokedRounds,
    totalRounds,
    avgPeak: avgPeak !== null ? Number(avgPeak.toFixed(1)) : null,
    avgConsistency: avgConsistency !== null ? Number(avgConsistency.toFixed(1)) : null,
    profileLabel,
    badges,
    insights,
  };

  return NextResponse.json({ ...base, tier1, tier2, tier3 });
}
