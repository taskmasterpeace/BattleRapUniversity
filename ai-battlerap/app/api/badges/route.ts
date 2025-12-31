import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/server';

/**
 * GET /api/badges
 * Returns all badge definitions with player progress
 *
 * Query params:
 *   - category: Filter by category (writing, performance, reputation, content, regional, tournament)
 *   - rarity: Filter by rarity (common, rare, epic, legendary)
 *   - status: Filter by status (all, earned, locked, in_progress)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');
    const status = searchParams.get('status');

    // Get current user and battler
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: battler } = await supabase
      .from('battlers')
      .select('id, style_tags')
      .eq('user_id', user.id)
      .single();

    const battlerId = battler?.id;
    const styleTags = battler?.style_tags || [];

    // Get all badge definitions
    let query = supabase
      .from('badge_definitions')
      .select('*')
      .order('category')
      .order('rarity');

    if (category) {
      query = query.eq('category', category);
    }
    if (rarity) {
      query = query.eq('rarity', rarity);
    }

    const { data: definitions, error: defError } = await query;

    if (defError) {
      console.error('Error fetching badge definitions:', defError);
      // Fall back to hardcoded badges if table doesn't exist yet
      return NextResponse.json({
        badges: getHardcodedBadges(styleTags),
        stats: {
          total: 97,
          earned: styleTags.length,
          in_progress: 0,
          locked: 97 - styleTags.length
        }
      });
    }

    // Get earned badges for this battler
    let earnedBadges: string[] = [];
    let badgeProgress: Record<string, { current: number; target: number; pct: number }> = {};

    if (battlerId) {
      // Get badges earned through gameplay
      const { data: earned } = await supabase
        .from('badge_earned')
        .select('badge_code, earned_at, earned_reason')
        .eq('battler_id', battlerId)
        .eq('is_active', true);

      if (earned) {
        earnedBadges = earned.map(e => e.badge_code);
      }

      // Get badge progress
      const { data: progress } = await supabase
        .from('badge_progress')
        .select('badge_code, current_value, target_value, progress_pct')
        .eq('battler_id', battlerId);

      if (progress) {
        progress.forEach(p => {
          badgeProgress[p.badge_code] = {
            current: p.current_value,
            target: p.target_value,
            pct: parseFloat(p.progress_pct) || 0
          };
        });
      }
    }

    // Combine style_tags with earned badges
    const allPlayerBadges = [...new Set([...styleTags, ...earnedBadges])];

    // Build response with player-specific data
    const badges = (definitions || []).map(def => {
      const isFromCreation = styleTags.includes(def.badge_code) || styleTags.includes(def.badge_name);
      const isEarned = earnedBadges.includes(def.badge_code);
      const progress = badgeProgress[def.badge_code];

      let badgeStatus: 'earned' | 'in_progress' | 'locked' = 'locked';
      if (isFromCreation || isEarned) {
        badgeStatus = 'earned';
      } else if (progress && progress.current > 0 && progress.current < progress.target) {
        badgeStatus = 'in_progress';
      }

      return {
        ...def,
        status: badgeStatus,
        source: isFromCreation ? 'creation' : isEarned ? 'earned' : null,
        progress: progress || null
      };
    });

    // Filter by status if requested
    let filteredBadges = badges;
    if (status && status !== 'all') {
      filteredBadges = badges.filter(b => b.status === status);
    }

    // Calculate stats
    const stats = {
      total: definitions?.length || 0,
      earned: badges.filter(b => b.status === 'earned').length,
      in_progress: badges.filter(b => b.status === 'in_progress').length,
      locked: badges.filter(b => b.status === 'locked').length,
      by_category: {} as Record<string, { total: number; earned: number }>,
      by_rarity: {} as Record<string, { total: number; earned: number }>
    };

    // Calculate category stats
    badges.forEach(b => {
      if (!stats.by_category[b.category]) {
        stats.by_category[b.category] = { total: 0, earned: 0 };
      }
      stats.by_category[b.category].total++;
      if (b.status === 'earned') {
        stats.by_category[b.category].earned++;
      }

      if (!stats.by_rarity[b.rarity]) {
        stats.by_rarity[b.rarity] = { total: 0, earned: 0 };
      }
      stats.by_rarity[b.rarity].total++;
      if (b.status === 'earned') {
        stats.by_rarity[b.rarity].earned++;
      }
    });

    return NextResponse.json({
      badges: filteredBadges,
      stats,
      player_badges: allPlayerBadges
    });

  } catch (error) {
    console.error('Error in badges API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Fallback hardcoded badges for when DB tables don't exist
 */
function getHardcodedBadges(playerBadges: string[]) {
  const allBadges = [
    // Writing - Positive
    { badge_code: 'punchline_king_queen', badge_name: 'Punchline King/Queen', category: 'writing', rarity: 'rare', icon: '👑', description: 'Your haymakers hit different', effect_text: '+15% peak score, +5 crowd reaction. Trade-off: -10% consistency.', is_negative: false },
    { badge_code: 'scheme_specialist', badge_name: 'Scheme Specialist', category: 'writing', rarity: 'epic', icon: '🧩', description: 'Complex rhyme patterns', effect_text: '+25% lyricism, +30% writing prep efficiency, +20% consistency.', is_negative: false },
    { badge_code: 'wordplay_wizard', badge_name: 'Wordplay Wizard', category: 'writing', rarity: 'rare', icon: '✨', description: 'Unmatched wordplay', effect_text: '+40% wordplay, +25% writing prep, +8 crowd reaction.', is_negative: false },
    { badge_code: 'freestyle_genius', badge_name: 'Freestyle Genius', category: 'writing', rarity: 'legendary', icon: '⚡', description: 'Thrive with minimal prep', effect_text: '+30% creativity, +20% peak, -25% choke. Low prep = bonus.', is_negative: false },
    { badge_code: 'pen_game_elite', badge_name: 'Pen Game Elite', category: 'writing', rarity: 'legendary', icon: '🏆', description: 'Writing mastery', effect_text: '+25% ALL writing attributes, +30% writing prep.', is_negative: false },
    { badge_code: 'technical_writer', badge_name: 'Technical Writer', category: 'writing', rarity: 'epic', icon: '🔬', description: 'Precision bars', effect_text: '+35% writing prep, +25% lyricism. Small Room: +5%.', is_negative: false },
    { badge_code: 'angle_master', badge_name: 'Angle Master', category: 'writing', rarity: 'epic', icon: '🎯', description: 'Personal attack specialist', effect_text: '+35% research prep, +20% peak, +20% creativity.', is_negative: false },

    // Writing - Negative
    { badge_code: 'choker', badge_name: 'Choker', category: 'performance', rarity: 'common', icon: '😰', description: 'Struggle under pressure', effect_text: '+2% choke per segment, -30% rest efficiency, -10 crowd reaction.', is_negative: true },
    { badge_code: 'known_choker', badge_name: 'Known Choker', category: 'performance', rarity: 'rare', icon: '😱', description: 'Everyone expects you to choke', effect_text: '+7% choke PER SEGMENT, -40% rest efficiency, -12 crowd reaction.', is_negative: true },
    { badge_code: 'lazy_writer', badge_name: 'Lazy Writer', category: 'writing', rarity: 'common', icon: '😴', description: 'Minimal effort', effect_text: '-40% writing prep, -20% all writing attributes.', is_negative: true },
    { badge_code: 'recycler', badge_name: 'Recycler', category: 'writing', rarity: 'common', icon: '♻️', description: 'Reuses material', effect_text: '-30% creativity, -20% writing prep, -10 crowd reaction.', is_negative: true },

    // Performance - Positive
    { badge_code: 'crowd_favorite', badge_name: 'Crowd Favorite', category: 'performance', rarity: 'rare', icon: '🌟', description: 'The crowd loves you', effect_text: '+15 crowd reaction, +30% crowd control. Main Stage: +8%.', is_negative: false },
    { badge_code: 'stage_domination', badge_name: 'Stage Domination', category: 'performance', rarity: 'legendary', icon: '👑', description: 'Command any stage', effect_text: '+35% stage presence, +25% crowd control, +30% performance prep.', is_negative: false },
    { badge_code: 'aggressive', badge_name: 'Aggressive', category: 'performance', rarity: 'rare', icon: '🔥', description: 'High energy', effect_text: '+25% delivery, +20% stage presence, +5 crowd reaction.', is_negative: false },
    { badge_code: 'charismatic', badge_name: 'Charismatic', category: 'performance', rarity: 'rare', icon: '✨', description: 'Natural charm', effect_text: '+35% crowd control, +20% stage presence, +10 crowd reaction.', is_negative: false },

    // Reputation - Positive
    { badge_code: 'respected_veteran', badge_name: 'Respected Veteran', category: 'reputation', rarity: 'epic', icon: '🎖️', description: 'Experience commands respect', effect_text: '+8 crowd reaction, -2% choke, +20% rest efficiency.', is_negative: false },
    { badge_code: 'consummate_professional', badge_name: 'Consummate Professional', category: 'reputation', rarity: 'legendary', icon: '💼', description: 'Ultimate professional', effect_text: '+15% ALL prep types, -4% choke, +20% consistency.', is_negative: false },
    { badge_code: 'clutch_performer', badge_name: 'Clutch Performer', category: 'reputation', rarity: 'epic', icon: '🎯', description: 'Deliver when it matters', effect_text: '-4% choke, +15% peak, +20% rest efficiency.', is_negative: false },
    { badge_code: 'believable_persona', badge_name: 'Believable Persona', category: 'reputation', rarity: 'rare', icon: '🎭', description: 'Authentic persona', effect_text: '+12 crowd reaction, +15% delivery, +15% research prep.', is_negative: false },

    // Regional
    { badge_code: 'nyc_native', badge_name: 'NYC Native', category: 'regional', rarity: 'rare', icon: '🗽', description: 'Born in the mecca', effect_text: '+10% lyricism, +5 crowd reaction in East Coast venues.', is_negative: false },
    { badge_code: 'la_native', badge_name: 'LA Native', category: 'regional', rarity: 'rare', icon: '🌴', description: 'West Coast swagger', effect_text: '+15% stage presence, +10% Main Stage bonus.', is_negative: false },
    { badge_code: 'detroit_made', badge_name: 'Detroit Made', category: 'regional', rarity: 'rare', icon: '🚗', description: 'Motor City warrior', effect_text: '+15% aggressive delivery, +10% resilience.', is_negative: false },
    { badge_code: 'underground_rep', badge_name: 'Underground Rep', category: 'regional', rarity: 'rare', icon: '🏚️', description: 'From the underground', effect_text: '+20% hunger bonus when underdog, +10% authenticity.', is_negative: false },

    // Content
    { badge_code: 'comedy', badge_name: 'Comedy', category: 'content', rarity: 'rare', icon: '😂', description: 'Humor-based style', effect_text: '+30% crowd control, +10 crowd reaction, +20% creativity.', is_negative: false },
    { badge_code: 'storytelling', badge_name: 'Storytelling', category: 'content', rarity: 'rare', icon: '📖', description: 'Narrative verses', effect_text: '+25% creativity, +20% lyricism, +20% consistency.', is_negative: false },
    { badge_code: 'gritty', badge_name: 'Gritty', category: 'content', rarity: 'rare', icon: '🏚️', description: 'Street-style', effect_text: '+20% delivery, +15% stage presence. Small Room: +8%.', is_negative: false },
    { badge_code: 'gun_bar_specialist', badge_name: 'Gun Bar Specialist', category: 'content', rarity: 'rare', icon: '🔫', description: 'Violent imagery', effect_text: '+5% Small Room, +8% peak, +20% variance.', is_negative: false },

    // Tournament
    { badge_code: 'tournament_veteran', badge_name: 'Tournament Veteran', category: 'tournament', rarity: 'epic', icon: '🏆', description: 'Tournament experience', effect_text: '-3% choke in tournaments, +5 crowd reaction, +8% consistency.', is_negative: false },
    { badge_code: 'cinderella_story', badge_name: 'Cinderella Story', category: 'tournament', rarity: 'legendary', icon: '👟', description: 'Underdog champion', effect_text: '+20% peak, +8 crowd reaction, +12% creativity, -2% choke.', is_negative: false },
  ];

  return allBadges.map(badge => ({
    ...badge,
    status: playerBadges.some(pb =>
      pb === badge.badge_code ||
      pb === badge.badge_name ||
      pb.toLowerCase().includes(badge.badge_name.toLowerCase().split(' ')[0])
    ) ? 'earned' : 'locked',
    source: playerBadges.includes(badge.badge_code) ? 'creation' : null,
    progress: null
  }));
}
