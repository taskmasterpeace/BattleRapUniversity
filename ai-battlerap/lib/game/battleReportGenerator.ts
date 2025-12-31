/**
 * Battle Report Generator
 *
 * Generates comprehensive battle reports with:
 * - Battler profiles (attributes, badges, ratings)
 * - Badge effects breakdown
 * - Round summaries
 * - Content effectiveness analysis
 * - Context modifier impacts
 * - Key moments (haymakers, chokes, stumbles)
 * - Blogger articles
 */

import { BADGE_EFFECTS } from './badges';
import type { BattlerTier } from '@/lib/models';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface BattleReport {
  battleId: string;
  battler1: BattlerProfile;
  battler2: BattlerProfile;
  battleContext: BattleContext;
  roundSummaries: RoundSummary[];
  winner: string;
  loser: string;
  decision: '3-0' | '2-1';
  wasUpset: boolean;
  keyMoments: KeyMoment[];
  contentEffectiveness: ContentEffectivenessAnalysis;
  bloggerArticle?: string;
}

export interface BattlerProfile {
  id: string;
  name: string;
  tier: BattlerTier;
  rating: number;
  badges: string[];
  badgeEffects: string[]; // Human-readable badge effect descriptions
  attributes: {
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
    personal: {
      financial_stability: number;
      reputation: number;
      family_bond: number;
      preparation: number;
      believability?: number;
    };
    resilience: number;
  };
}

export interface BattleContext {
  league: string;
  leagueType: 'Small Room Circuit' | 'Main Stage Arena';
  context: 'In Building' | 'PPV' | 'On Cam';
  roundLength: '2min (4 segments)' | '3min (6 segments)';
}

export interface RoundSummary {
  roundNumber: number;
  battler1: {
    averageScore: number;
    peakScore: number;
    consistencyScore: number;
    crowdReaction: number;
    choked: boolean;
    contentTypes: string[];
    deliveryTypes: string[];
    performanceTypes: string[];
    effectivenessMultiplier: number;
  };
  battler2: {
    averageScore: number;
    peakScore: number;
    consistencyScore: number;
    crowdReaction: number;
    choked: boolean;
    contentTypes: string[];
    deliveryTypes: string[];
    performanceTypes: string[];
    effectivenessMultiplier: number;
  };
  winner: string;
  winnerName: string;
}

export interface KeyMoment {
  round: number;
  segment: number;
  battler: string;
  battlerName: string;
  momentType: 'haymaker' | 'choke' | 'stumble';
  score?: number;
}

export interface ContentEffectivenessAnalysis {
  battler1SuperEffective: string[]; // Content that was 2.0x effective
  battler1NotEffective: string[]; // Content that was 0.5x effective
  battler2SuperEffective: string[];
  battler2NotEffective: string[];
  contextModifiers: {
    battler1: string[];
    battler2: string[];
  };
}

/**
 * Generate comprehensive battle report
 */
export async function generateBattleReport(battleId: string, supabase: SupabaseClient): Promise<BattleReport | null> {

  try {
    // Load battle data
    const { data: battle } = await supabase
      .from('battles')
      .select(`
        *,
        league:leagues(id, name, short_code, round_length_minutes)
      `)
      .eq('id', battleId)
      .single();

    if (!battle) {
      console.error(`Battle ${battleId} not found`);
      return null;
    }

    // Load battler data
    const [battler1Data, battler2Data] = await Promise.all([
      loadBattlerProfile(battle.battler_player_id, supabase),
      loadBattlerProfile(battle.battler_ai_id, supabase),
    ]);

    if (!battler1Data || !battler2Data) {
      console.error('Failed to load battler profiles');
      return null;
    }

    // Load battle rounds
    const { data: rounds } = await supabase
      .from('battle_rounds')
      .select('*')
      .eq('battle_id', battleId)
      .order('round_index');

    if (!rounds || rounds.length === 0) {
      console.error('No rounds found for battle');
      return null;
    }

    // Load battle segments (for key moments)
    const { data: segments } = await supabase
      .from('battle_segments')
      .select('*')
      .eq('battle_id', battleId)
      .order('round_index')
      .order('segment_index');

    // Load blogger article
    const { data: article } = await supabase
      .from('news_articles')
      .select('body_markdown')
      .eq('battle_id', battleId)
      .eq('article_type', 'battle_recap')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Build battle context
    const battleContext: BattleContext = {
      league: battle.league.name,
      leagueType: battle.league.short_code === 'SRC' ? 'Small Room Circuit' : 'Main Stage Arena',
      context: battle.context === 'in_building' ? 'In Building' : battle.context === 'ppv' ? 'PPV' : 'On Cam',
      roundLength: battle.league.round_length_minutes === 2 ? '2min (4 segments)' : '3min (6 segments)',
    };

    // Build round summaries
    const roundSummaries: RoundSummary[] = [];
    for (const round of rounds) {
      const battler1Round = rounds.find(
        r => r.round_index === round.round_index && r.battler_id === battle.battler_player_id
      );
      const battler2Round = rounds.find(
        r => r.round_index === round.round_index && r.battler_id === battle.battler_ai_id
      );

      if (!battler1Round || !battler2Round) continue;

      // Determine winner
      const b1Score = battler1Round.average_score + battler1Round.peak_score;
      const b2Score = battler2Round.average_score + battler2Round.peak_score;
      const winnerId = b1Score > b2Score ? battle.battler_player_id : battle.battler_ai_id;
      const winnerName = winnerId === battle.battler_player_id ? battler1Data.name : battler2Data.name;

      roundSummaries.push({
        roundNumber: round.round_index,
        battler1: {
          averageScore: battler1Round.average_score,
          peakScore: battler1Round.peak_score,
          consistencyScore: battler1Round.consistency_score,
          crowdReaction: battler1Round.crowd_reaction,
          choked: battler1Round.choked,
          contentTypes: battler1Round.content_types || [],
          deliveryTypes: battler1Round.delivery_types || [],
          performanceTypes: battler1Round.performance_types || [],
          effectivenessMultiplier: battler1Round.final_multiplier || 1.0,
        },
        battler2: {
          averageScore: battler2Round.average_score,
          peakScore: battler2Round.peak_score,
          consistencyScore: battler2Round.consistency_score,
          crowdReaction: battler2Round.crowd_reaction,
          choked: battler2Round.choked,
          contentTypes: battler2Round.content_types || [],
          deliveryTypes: battler2Round.delivery_types || [],
          performanceTypes: battler2Round.performance_types || [],
          effectivenessMultiplier: battler2Round.final_multiplier || 1.0,
        },
        winner: winnerId,
        winnerName,
      });
    }

    // Determine decision
    const battler1Wins = roundSummaries.filter(r => r.winner === battle.battler_player_id).length;
    const battler2Wins = roundSummaries.filter(r => r.winner === battle.battler_ai_id).length;
    const decision: '3-0' | '2-1' = battler1Wins === 3 || battler2Wins === 3 ? '3-0' : '2-1';

    // Determine winner/loser
    const winnerId = battle.winner_battler_id!;
    const winner = winnerId === battle.battler_player_id ? battler1Data.name : battler2Data.name;
    const loser = winnerId === battle.battler_player_id ? battler2Data.name : battler1Data.name;

    // Check for upset (lower-rated battler won)
    const wasUpset =
      (winnerId === battle.battler_player_id && battler1Data.rating < battler2Data.rating) ||
      (winnerId === battle.battler_ai_id && battler2Data.rating < battler1Data.rating);

    // Extract key moments
    const keyMoments = extractKeyMoments(segments || [], battle.battler_player_id, battle.battler_ai_id, battler1Data.name, battler2Data.name);

    // Analyze content effectiveness
    const contentEffectiveness = analyzeContentEffectiveness(
      roundSummaries,
      battler1Data.name,
      battler2Data.name,
      battleContext.context
    );

    return {
      battleId,
      battler1: battler1Data,
      battler2: battler2Data,
      battleContext,
      roundSummaries,
      winner,
      loser,
      decision,
      wasUpset,
      keyMoments,
      contentEffectiveness,
      bloggerArticle: article?.body_markdown,
    };
  } catch (error) {
    console.error('Error generating battle report:', error);
    return null;
  }
}

/**
 * Load battler profile with all attributes and badges
 */
async function loadBattlerProfile(battlerId: string, supabase: SupabaseClient): Promise<BattlerProfile | null> {

  const { data: battler } = await supabase
    .from('battlers')
    .select('*')
    .eq('id', battlerId)
    .single();

  if (!battler) return null;

  const { data: attributes } = await supabase
    .from('battler_attributes')
    .select('*')
    .eq('battler_id', battlerId)
    .single();

  if (!attributes) return null;

  const { data: ranking } = await supabase
    .from('rankings')
    .select('rating')
    .eq('battler_id', battlerId)
    .single();

  // Generate badge effect descriptions
  const badgeEffects = generateBadgeEffectDescriptions(battler.style_tags || []);

  return {
    id: battler.id,
    name: battler.stage_name,
    tier: battler.tier,
    rating: ranking?.rating || 1500,
    badges: battler.style_tags || [],
    badgeEffects,
    attributes: {
      writing: attributes.writing,
      performance: attributes.performance,
      personal: attributes.personal,
      resilience: attributes.resilience,
    },
  };
}

/**
 * Generate human-readable badge effect descriptions
 */
function generateBadgeEffectDescriptions(badges: string[]): string[] {
  const descriptions: string[] = [];

  // Safety check: BADGE_EFFECTS might not be loaded
  if (!BADGE_EFFECTS || typeof BADGE_EFFECTS !== 'object') {
    return badges.map(b => `${b}: (Effects pending load)`);
  }

  for (const badge of badges) {
    const effects = BADGE_EFFECTS[badge as keyof typeof BADGE_EFFECTS];
    if (!effects) {
      // Badge exists but has no mechanical effects defined yet
      descriptions.push(`${badge}: (Badge assigned, effects not yet implemented)`);
      continue;
    }

    const parts: string[] = [];

    // Multipliers
    if (effects.lyricismMultiplier && effects.lyricismMultiplier !== 1.0) {
      parts.push(`Lyricism ${(effects.lyricismMultiplier * 100 - 100).toFixed(0)}%`);
    }
    if (effects.wordplayMultiplier && effects.wordplayMultiplier !== 1.0) {
      parts.push(`Wordplay ${(effects.wordplayMultiplier * 100 - 100).toFixed(0)}%`);
    }
    if (effects.creativityMultiplier && effects.creativityMultiplier !== 1.0) {
      parts.push(`Creativity ${(effects.creativityMultiplier * 100 - 100).toFixed(0)}%`);
    }
    if (effects.deliveryMultiplier && effects.deliveryMultiplier !== 1.0) {
      parts.push(`Delivery ${(effects.deliveryMultiplier * 100 - 100).toFixed(0)}%`);
    }
    if (effects.stagePresenceMultiplier && effects.stagePresenceMultiplier !== 1.0) {
      parts.push(`Stage Presence ${(effects.stagePresenceMultiplier * 100 - 100).toFixed(0)}%`);
    }
    if (effects.crowdControlMultiplier && effects.crowdControlMultiplier !== 1.0) {
      parts.push(`Crowd Control ${(effects.crowdControlMultiplier * 100 - 100).toFixed(0)}%`);
    }

    // Bonuses
    if (effects.peakBonus) {
      parts.push(`+${(effects.peakBonus * 100).toFixed(0)}% Peak Score`);
    }
    if (effects.crowdReactionBonus) {
      parts.push(`+${effects.crowdReactionBonus} Crowd Reaction`);
    }

    // Penalties
    if (effects.consistencyPenalty) {
      parts.push(`${(effects.consistencyPenalty * 100).toFixed(0)}% Consistency Penalty`);
    }
    if (effects.crowdReactionBonus && effects.crowdReactionBonus < 0) {
      parts.push(`${effects.crowdReactionBonus} Crowd Reaction`);
    }

    // Special effects
    if (effects.chokeReduction) {
      parts.push(`-${(effects.chokeReduction * 100).toFixed(0)}% Choke Chance`);
    }
    if (effects.lowPrepBonus) {
      parts.push(`Low Prep Bonus`);
    }

    if (parts.length > 0) {
      descriptions.push(`${badge}: ${parts.join(', ')}`);
    }
  }

  return descriptions;
}

/**
 * Extract key moments (haymakers, chokes, stumbles)
 */
function extractKeyMoments(
  segments: any[],
  battler1Id: string,
  battler2Id: string,
  battler1Name: string,
  battler2Name: string
): KeyMoment[] {
  const moments: KeyMoment[] = [];

  for (const segment of segments) {
    const battlerName = segment.battler_id === battler1Id ? battler1Name : battler2Name;

    // Haymaker: score >= 90
    if (segment.base_score >= 90) {
      moments.push({
        round: segment.round_index,
        segment: segment.segment_index,
        battler: segment.battler_id,
        battlerName,
        momentType: 'haymaker',
        score: segment.base_score,
      });
    }

    // Stumble: score < 30
    if (segment.base_score < 30 && !segment.choked) {
      moments.push({
        round: segment.round_index,
        segment: segment.segment_index,
        battler: segment.battler_id,
        battlerName,
        momentType: 'stumble',
        score: segment.base_score,
      });
    }

    // Choke
    if (segment.choked) {
      moments.push({
        round: segment.round_index,
        segment: segment.segment_index,
        battler: segment.battler_id,
        battlerName,
        momentType: 'choke',
      });
    }
  }

  return moments;
}

/**
 * Analyze content effectiveness
 */
function analyzeContentEffectiveness(
  roundSummaries: RoundSummary[],
  battler1Name: string,
  battler2Name: string,
  context: string
): ContentEffectivenessAnalysis {
  const b1SuperEffective: Set<string> = new Set();
  const b1NotEffective: Set<string> = new Set();
  const b2SuperEffective: Set<string> = new Set();
  const b2NotEffective: Set<string> = new Set();

  for (const round of roundSummaries) {
    // Battler 1
    if (round.battler1.effectivenessMultiplier >= 1.8) {
      round.battler1.contentTypes.forEach(c => b1SuperEffective.add(c));
      round.battler1.deliveryTypes.forEach(d => b1SuperEffective.add(d));
    }
    if (round.battler1.effectivenessMultiplier <= 0.7) {
      round.battler1.contentTypes.forEach(c => b1NotEffective.add(c));
      round.battler1.deliveryTypes.forEach(d => b1NotEffective.add(d));
    }

    // Battler 2
    if (round.battler2.effectivenessMultiplier >= 1.8) {
      round.battler2.contentTypes.forEach(c => b2SuperEffective.add(c));
      round.battler2.deliveryTypes.forEach(d => b2SuperEffective.add(d));
    }
    if (round.battler2.effectivenessMultiplier <= 0.7) {
      round.battler2.contentTypes.forEach(c => b2NotEffective.add(c));
      round.battler2.deliveryTypes.forEach(d => b2NotEffective.add(d));
    }
  }

  // Context modifiers (simplified - showing which context was used)
  const contextModifiers = {
    battler1: [`Context: ${context}`],
    battler2: [`Context: ${context}`],
  };

  return {
    battler1SuperEffective: Array.from(b1SuperEffective),
    battler1NotEffective: Array.from(b1NotEffective),
    battler2SuperEffective: Array.from(b2SuperEffective),
    battler2NotEffective: Array.from(b2NotEffective),
    contextModifiers,
  };
}

/**
 * Format battle report as markdown
 */
export function formatBattleReportAsMarkdown(report: BattleReport): string {
  const lines: string[] = [];

  lines.push(`# Battle Report: ${report.battler1.name} vs ${report.battler2.name}`);
  lines.push('');
  lines.push(`**Winner:** ${report.winner} (${report.decision})`);
  if (report.wasUpset) {
    lines.push(`**UPSET!** Lower-rated battler won!`);
  }
  lines.push('');

  // Battle Context
  lines.push(`## Battle Context`);
  lines.push(`- **League:** ${report.battleContext.league} (${report.battleContext.leagueType})`);
  lines.push(`- **Context:** ${report.battleContext.context}`);
  lines.push(`- **Round Length:** ${report.battleContext.roundLength}`);
  lines.push('');

  // Battler Profiles
  lines.push(`## ${report.battler1.name} Profile`);
  lines.push(`- **Tier:** ${report.battler1.tier.toUpperCase()}`);
  lines.push(`- **Rating:** ${report.battler1.rating}`);
  lines.push(`- **Badges:** ${report.battler1.badges.join(', ')}`);
  lines.push('');
  lines.push(`**Attributes:**`);
  lines.push(`- Writing: Lyricism ${report.battler1.attributes.writing.lyricism}, Wordplay ${report.battler1.attributes.writing.wordplay}, Creativity ${report.battler1.attributes.writing.creativity}, Flow ${report.battler1.attributes.writing.flow}`);
  lines.push(`- Performance: Stage ${report.battler1.attributes.performance.stage_presence}, Crowd ${report.battler1.attributes.performance.crowd_control}, Delivery ${report.battler1.attributes.performance.delivery}`);
  lines.push(`- Personal: Prep ${report.battler1.attributes.personal.preparation}, Reputation ${report.battler1.attributes.personal.reputation}${report.battler1.attributes.personal.believability ? `, Believability ${report.battler1.attributes.personal.believability}` : ''}`);
  lines.push(`- Resilience: ${report.battler1.attributes.resilience}`);
  lines.push('');
  if (report.battler1.badgeEffects.length > 0) {
    lines.push(`**Badge Effects:**`);
    report.battler1.badgeEffects.forEach(effect => lines.push(`- ${effect}`));
    lines.push('');
  }

  lines.push(`## ${report.battler2.name} Profile`);
  lines.push(`- **Tier:** ${report.battler2.tier.toUpperCase()}`);
  lines.push(`- **Rating:** ${report.battler2.rating}`);
  lines.push(`- **Badges:** ${report.battler2.badges.join(', ')}`);
  lines.push('');
  lines.push(`**Attributes:**`);
  lines.push(`- Writing: Lyricism ${report.battler2.attributes.writing.lyricism}, Wordplay ${report.battler2.attributes.writing.wordplay}, Creativity ${report.battler2.attributes.writing.creativity}, Flow ${report.battler2.attributes.writing.flow}`);
  lines.push(`- Performance: Stage ${report.battler2.attributes.performance.stage_presence}, Crowd ${report.battler2.attributes.performance.crowd_control}, Delivery ${report.battler2.attributes.performance.delivery}`);
  lines.push(`- Personal: Prep ${report.battler2.attributes.personal.preparation}, Reputation ${report.battler2.attributes.personal.reputation}${report.battler2.attributes.personal.believability ? `, Believability ${report.battler2.attributes.personal.believability}` : ''}`);
  lines.push(`- Resilience: ${report.battler2.attributes.resilience}`);
  lines.push('');
  if (report.battler2.badgeEffects.length > 0) {
    lines.push(`**Badge Effects:**`);
    report.battler2.badgeEffects.forEach(effect => lines.push(`- ${effect}`));
    lines.push('');
  }

  // Round Summaries
  lines.push(`## Round Summaries`);
  lines.push('');
  for (const round of report.roundSummaries) {
    lines.push(`### Round ${round.roundNumber} - Winner: ${round.winnerName}`);
    lines.push('');
    lines.push(`**${report.battler1.name}:**`);
    lines.push(`- Average: ${round.battler1.averageScore.toFixed(1)}, Peak: ${round.battler1.peakScore.toFixed(1)}, Consistency: ${round.battler1.consistencyScore.toFixed(1)}`);
    lines.push(`- Crowd Reaction: ${round.battler1.crowdReaction.toFixed(1)}`);
    lines.push(`- Choked: ${round.battler1.choked ? 'YES' : 'No'}`);
    lines.push(`- Content: ${round.battler1.contentTypes.join(', ')}`);
    lines.push(`- Delivery: ${round.battler1.deliveryTypes.join(', ')}`);
    lines.push(`- Performance: ${round.battler1.performanceTypes.join(', ')}`);
    lines.push(`- Effectiveness Multiplier: ${round.battler1.effectivenessMultiplier.toFixed(2)}x`);
    lines.push('');
    lines.push(`**${report.battler2.name}:**`);
    lines.push(`- Average: ${round.battler2.averageScore.toFixed(1)}, Peak: ${round.battler2.peakScore.toFixed(1)}, Consistency: ${round.battler2.consistencyScore.toFixed(1)}`);
    lines.push(`- Crowd Reaction: ${round.battler2.crowdReaction.toFixed(1)}`);
    lines.push(`- Choked: ${round.battler2.choked ? 'YES' : 'No'}`);
    lines.push(`- Content: ${round.battler2.contentTypes.join(', ')}`);
    lines.push(`- Delivery: ${round.battler2.deliveryTypes.join(', ')}`);
    lines.push(`- Performance: ${round.battler2.performanceTypes.join(', ')}`);
    lines.push(`- Effectiveness Multiplier: ${round.battler2.effectivenessMultiplier.toFixed(2)}x`);
    lines.push('');
  }

  // Content Effectiveness Analysis
  lines.push(`## Content Effectiveness Analysis`);
  lines.push('');
  lines.push(`**${report.battler1.name} - Super Effective (2.0x):** ${report.contentEffectiveness.battler1SuperEffective.length > 0 ? report.contentEffectiveness.battler1SuperEffective.join(', ') : 'None'}`);
  lines.push(`**${report.battler1.name} - Not Very Effective (0.5x):** ${report.contentEffectiveness.battler1NotEffective.length > 0 ? report.contentEffectiveness.battler1NotEffective.join(', ') : 'None'}`);
  lines.push('');
  lines.push(`**${report.battler2.name} - Super Effective (2.0x):** ${report.contentEffectiveness.battler2SuperEffective.length > 0 ? report.contentEffectiveness.battler2SuperEffective.join(', ') : 'None'}`);
  lines.push(`**${report.battler2.name} - Not Very Effective (0.5x):** ${report.contentEffectiveness.battler2NotEffective.length > 0 ? report.contentEffectiveness.battler2NotEffective.join(', ') : 'None'}`);
  lines.push('');

  // Key Moments
  if (report.keyMoments.length > 0) {
    lines.push(`## Key Moments`);
    lines.push('');
    for (const moment of report.keyMoments) {
      const emoji = moment.momentType === 'haymaker' ? '💥' : moment.momentType === 'choke' ? '😱' : '😬';
      const description = moment.momentType === 'haymaker'
        ? `HAYMAKER (${moment.score?.toFixed(0)})`
        : moment.momentType === 'choke'
        ? 'CHOKE'
        : `Stumble (${moment.score?.toFixed(0)})`;
      lines.push(`- ${emoji} R${moment.round} S${moment.segment}: ${moment.battlerName} - ${description}`);
    }
    lines.push('');
  }

  // Blogger Article
  if (report.bloggerArticle) {
    lines.push(`## Blogger Recap`);
    lines.push('');
    lines.push(report.bloggerArticle);
    lines.push('');
  }

  lines.push(`---`);
  lines.push('');

  return lines.join('\n');
}
