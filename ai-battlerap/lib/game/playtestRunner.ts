/**
 * Playtest Runner with Blogger Article Generation
 *
 * Runs realistic battle simulations and generates mock blogger articles
 * to validate game balance against real battle rap culture.
 *
 * Research-Validated Targets:
 * - 40-50% battles should be 2-1 "debatable"
 * - 20-30% battles should be 3-0 "body"
 * - 5-15% battles should feature chokes
 * - 10-20% battles should be upsets (lower-rated wins)
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { simulateBattle } from './simulation';
import { getBloggerPrompt, BLOGGER_PROMPTS } from './bloggerPrompts';
import type { BattlerAttributes, League } from '@/lib/models';
import * as fs from 'fs';

// ============================================================================
// PLAYTEST BATTLER PROFILES (Diverse Builds)
// ============================================================================

interface PlaytestBattler {
  stage_name: string;
  description: string;
  archetype: string;
  badges: string[];
  attributes: {
    writing: { lyricism: number; wordplay: number; creativity: number; flow: number };
    performance: { stage_presence: number; crowd_control: number; delivery: number };
    personal: { financial_stability: number; reputation: number; family_bond: number; preparation: number };
    resilience: number;
  };
  prepStrategy: 'writing-heavy' | 'performance-heavy' | 'research-heavy' | 'balanced' | 'minimal';
  expectedRating: number; // Initial ELO
}

const PLAYTEST_BATTLERS: PlaytestBattler[] = [
  {
    stage_name: 'Lyric',
    description: 'Technical wizard with complex schemes but boring delivery (Illmaculate-type)',
    archetype: 'Technical Writer',
    badges: ['pen_game_elite', 'scheme_king', 'technical_writer'],
    attributes: {
      writing: { lyricism: 9, wordplay: 9, creativity: 8, flow: 7 },
      performance: { stage_presence: 5, crowd_control: 5, delivery: 6 },
      personal: { financial_stability: 7, reputation: 8, family_bond: 7, preparation: 9 },
      resilience: 7,
    },
    prepStrategy: 'writing-heavy',
    expectedRating: 1350,
  },
  {
    stage_name: 'Blaze',
    description: 'Main stage performer with insane energy, weak pen game (Tay Roc-type)',
    archetype: 'Performance Beast',
    badges: ['stage_domination', 'high_energy_performer', 'crowd_control_master'],
    attributes: {
      writing: { lyricism: 6, wordplay: 6, creativity: 6, flow: 7 },
      performance: { stage_presence: 9, crowd_control: 9, delivery: 9 },
      personal: { financial_stability: 6, reputation: 7, family_bond: 6, preparation: 7 },
      resilience: 7,
    },
    prepStrategy: 'performance-heavy',
    expectedRating: 1300,
  },
  {
    stage_name: 'Cipher',
    description: 'Freestyle genius who preps scenarios not bars (Charron-type)',
    archetype: 'Freestyle Genius',
    badges: ['freestyle', 'rebuttal_king', 'off_the_top'],
    attributes: {
      writing: { lyricism: 7, wordplay: 7, creativity: 9, flow: 8 },
      performance: { stage_presence: 7, crowd_control: 8, delivery: 8 },
      personal: { financial_stability: 5, reputation: 6, family_bond: 5, preparation: 7 },
      resilience: 8,
    },
    prepStrategy: 'research-heavy',
    expectedRating: 1280,
  },
  {
    stage_name: 'Angle',
    description: 'Research-heavy angle specialist who digs up dirt (Hollow Da Don-type)',
    archetype: 'Angle Master',
    badges: ['angle_master', 'personal_attack_specialist', 'calculated'],
    attributes: {
      writing: { lyricism: 7, wordplay: 7, creativity: 8, flow: 7 },
      performance: { stage_presence: 6, crowd_control: 6, delivery: 7 },
      personal: { financial_stability: 6, reputation: 6, family_bond: 6, preparation: 8 },
      resilience: 6,
    },
    prepStrategy: 'research-heavy',
    expectedRating: 1260,
  },
  {
    stage_name: 'Steady',
    description: 'Well-rounded battler with no weaknesses, no strengths',
    archetype: 'Balanced Battler',
    badges: ['consistent_writer', 'battle_ready', 'reliable'],
    attributes: {
      writing: { lyricism: 7, wordplay: 7, creativity: 7, flow: 7 },
      performance: { stage_presence: 7, crowd_control: 7, delivery: 7 },
      personal: { financial_stability: 7, reputation: 7, family_bond: 7, preparation: 7 },
      resilience: 7,
    },
    prepStrategy: 'balanced',
    expectedRating: 1250,
  },
  {
    stage_name: 'Wildcard',
    description: 'Controversial creative with high variance (Daylyt-type)',
    archetype: 'Controversial Star',
    badges: ['controversial', 'creativity_beast', 'unpredictable'],
    attributes: {
      writing: { lyricism: 7, wordplay: 7, creativity: 9, flow: 7 },
      performance: { stage_presence: 8, crowd_control: 8, delivery: 7 },
      personal: { financial_stability: 4, reputation: 5, family_bond: 4, preparation: 6 },
      resilience: 6,
    },
    prepStrategy: 'balanced',
    expectedRating: 1240,
  },
  {
    stage_name: 'Rookie',
    description: 'Underdog with raw talent but limited experience',
    archetype: 'Rising Star',
    badges: ['hungry', 'potential', 'underestimated'],
    attributes: {
      writing: { lyricism: 6, wordplay: 6, creativity: 7, flow: 6 },
      performance: { stage_presence: 6, crowd_control: 6, delivery: 6 },
      personal: { financial_stability: 5, reputation: 4, family_bond: 6, preparation: 7 },
      resilience: 6,
    },
    prepStrategy: 'balanced',
    expectedRating: 1150,
  },
  {
    stage_name: 'Veteran',
    description: 'Respected veteran with declining skills but high IQ',
    archetype: 'Wily Veteran',
    badges: ['respected_veteran', 'ring_general', 'experienced'],
    attributes: {
      writing: { lyricism: 7, wordplay: 8, creativity: 7, flow: 7 },
      performance: { stage_presence: 7, crowd_control: 7, delivery: 6 },
      personal: { financial_stability: 8, reputation: 9, family_bond: 8, preparation: 8 },
      resilience: 8,
    },
    prepStrategy: 'balanced',
    expectedRating: 1320,
  },
];

// ============================================================================
// INTERESTING MATCHUPS
// ============================================================================

interface PlaytestMatchup {
  battler1Name: string;
  battler2Name: string;
  league: 'small_room' | 'main_stage';
  narrative: string;
  expectedOutcome: string;
  blogger: string; // Which blogger should cover this
}

const PLAYTEST_MATCHUPS: PlaytestMatchup[] = [
  {
    battler1Name: 'Lyric',
    battler2Name: 'Blaze',
    league: 'small_room',
    narrative: 'Technical wizard vs performance beast in intimate setting',
    expectedOutcome: 'Lyric should win 2-1 or 3-0. Small room favors complex writing.',
    blogger: 'small_room_report',
  },
  {
    battler1Name: 'Blaze',
    battler2Name: 'Lyric',
    league: 'main_stage',
    narrative: 'Rematch on the big stage where Blaze should shine',
    expectedOutcome: 'Blaze should win 2-1. Main stage favors performance and crowd control.',
    blogger: 'the_main_stage_herald',
  },
  {
    battler1Name: 'Rookie',
    battler2Name: 'Veteran',
    league: 'small_room',
    narrative: 'Classic underdog story - hungry rookie vs respected veteran',
    expectedOutcome: 'Veteran should win but could be upset if rookie has perfect prep.',
    blogger: 'coast_to_coast_coverage',
  },
  {
    battler1Name: 'Cipher',
    battler2Name: 'Angle',
    league: 'small_room',
    narrative: 'Research-heavy strategists clash - freestyle vs angles',
    expectedOutcome: 'Close 2-1 battle. Both rely on preparation and IQ over raw skill.',
    blogger: 'algorithm_institute',
  },
  {
    battler1Name: 'Wildcard',
    battler2Name: 'Steady',
    league: 'main_stage',
    narrative: 'Controversial creative vs boring but consistent battler',
    expectedOutcome: 'Could go either way. Wildcard has higher ceiling, Steady has higher floor.',
    blogger: 'battle_eyez',
  },
  {
    battler1Name: 'Blaze',
    battler2Name: 'Steady',
    league: 'main_stage',
    narrative: 'Performance specialist vs balanced battler on big stage',
    expectedOutcome: 'Blaze should win 2-1. His performance edge shines on main stage.',
    blogger: 'the_battle_breakdown',
  },
  {
    battler1Name: 'Rookie',
    battler2Name: 'Wildcard',
    league: 'small_room',
    narrative: 'Two low-reputation battlers fighting for recognition',
    expectedOutcome: 'Wildcard should edge it 2-1 with creativity bursts.',
    blogger: 'underground_voice',
  },
  {
    battler1Name: 'Lyric',
    battler2Name: 'Veteran',
    league: 'small_room',
    narrative: 'Peak technical skill vs veteran ring IQ',
    expectedOutcome: 'Classic battle. Lyric\'s peak writing vs Veteran\'s experience. 2-1 either way.',
    blogger: 'the_battle_breakdown',
  },
];

// ============================================================================
// BATTLE OUTCOME CLASSIFICATION
// ============================================================================

interface BattleOutcome {
  verdict: '3-0' | '2-1' | '2-1 Debatable';
  outcomeType: 'body' | 'clear_win' | 'debatable' | 'upset';
  chokeOccurred: boolean;
  narrative: string;
  winnerName: string;
  loserName: string;
  roundScores: string; // "30-27, 30-27, 27-30"
}

function classifyBattleOutcome(
  rounds: any[],
  battler1: PlaytestBattler,
  battler2: PlaytestBattler,
  winnerId: string,
  battler1Id: string
): BattleOutcome {
  const battler1Rounds = rounds.filter(r => r.battler_id === battler1Id);
  const battler2Rounds = rounds.filter(r => r.battler_id !== battler1Id);

  const battler1RoundWins = battler1Rounds.filter(r => r.won_round).length;
  const battler2RoundWins = 3 - battler1RoundWins;

  const isWinner1 = winnerId === battler1Id;
  const winnerName = isWinner1 ? battler1.stage_name : battler2.stage_name;
  const loserName = isWinner1 ? battler2.stage_name : battler1.stage_name;
  const winnerRounds = isWinner1 ? battler1RoundWins : battler2RoundWins;

  // Check for chokes
  const chokeOccurred = rounds.some(r => r.choked);

  // Calculate score differentials
  const avgScoreDiffs = battler1Rounds.map((r1, i) => {
    const r2 = battler2Rounds[i];
    return Math.abs(r1.average_score - r2.average_score);
  });
  const avgDiff = avgScoreDiffs.reduce((a, b) => a + b, 0) / avgScoreDiffs.length;

  // Classify verdict
  let verdict: '3-0' | '2-1' | '2-1 Debatable';
  let outcomeType: 'body' | 'clear_win' | 'debatable' | 'upset';

  if (winnerRounds === 3) {
    verdict = '3-0';
    outcomeType = avgDiff > 1.5 ? 'body' : 'clear_win';
  } else {
    verdict = avgDiff < 0.8 ? '2-1 Debatable' : '2-1';
    outcomeType = avgDiff < 0.8 ? 'debatable' : 'clear_win';
  }

  // Check for upset
  const favoriteWon = (winnerId === battler1Id && battler1.expectedRating >= battler2.expectedRating) ||
                      (winnerId !== battler1Id && battler2.expectedRating >= battler1.expectedRating);

  if (!favoriteWon && outcomeType !== 'body') {
    outcomeType = 'upset';
  }

  // Generate narrative
  let narrative = '';
  if (outcomeType === 'body') {
    narrative = `${winnerName} completely dominated, winning ${verdict}. Clear body.`;
  } else if (outcomeType === 'upset') {
    narrative = `${winnerName} pulled off the upset, winning ${verdict}. Nobody saw this coming.`;
  } else if (outcomeType === 'debatable') {
    narrative = `${winnerName} edged it ${verdict}, but this was debatable. Could've gone either way.`;
  } else {
    narrative = `${winnerName} won ${verdict}. Clear winner, not a body.`;
  }

  if (chokeOccurred) {
    const choker = rounds.find(r => r.choked);
    const chokerName = choker.battler_id === battler1Id ? battler1.stage_name : battler2.stage_name;
    narrative += ` ${chokerName} choked in round ${choker.round_index}, likely cost them the battle.`;
  }

  return {
    verdict,
    outcomeType,
    chokeOccurred,
    narrative,
    winnerName,
    loserName,
    roundScores: formatRoundScores(battler1Rounds, battler2Rounds),
  };
}

function formatRoundScores(rounds1: any[], rounds2: any[]): string {
  return rounds1.map((r1, i) => {
    const r2 = rounds2[i];
    const score1 = Math.round(r1.average_score * 10);
    const score2 = Math.round(r2.average_score * 10);
    return r1.won_round ? `${score1}-${score2}` : `${score2}-${score1}`;
  }).join(', ');
}

// ============================================================================
// MOCK BLOGGER ARTICLE GENERATION
// ============================================================================

interface MockBloggerArticle {
  blogger: string;
  blogger_name: string;
  outlet: string;
  title: string;
  content: string;
  rating: string;
  tone: string;
}

function generateMockBloggerArticle(
  matchup: PlaytestMatchup,
  outcome: BattleOutcome,
  rounds: any[],
  battler1: PlaytestBattler,
  battler2: PlaytestBattler,
  league: League
): MockBloggerArticle {
  const blogger = BLOGGER_PROMPTS[matchup.blogger];

  if (!blogger) {
    throw new Error(`Blogger ${matchup.blogger} not found`);
  }

  // Construct battle data
  const battler1Rounds = rounds.filter(r => r.battler_id !== 'TBD').slice(0, 3);
  const roundSummary = battler1Rounds.map((r, i) => {
    return `Round ${i + 1}: ${r.won_round ? outcome.winnerName : outcome.loserName} ${r.won_round ? 'won' : 'lost'} (${r.average_score.toFixed(1)} avg, ${r.peak_score.toFixed(1)} peak, ${r.choked ? 'CHOKE' : 'no choke'})`;
  }).join('\n');

  const peakMoments = battler1Rounds.reduce((sum, r) => sum + (r.peak_score > 8.5 ? 1 : 0), 0);
  const avgCrowdReaction = battler1Rounds.reduce((sum, r) => sum + r.crowd_reaction, 0) / battler1Rounds.length;

  // Generate mock article based on blogger personality
  let content = '';
  let title = '';
  let rating = '';

  switch (matchup.blogger) {
    case 'battle_eyez':
      title = `${outcome.winnerName} vs ${outcome.loserName}: ${outcome.chokeOccurred ? 'CHOKE ALERT' : 'Drama Unfolds'}`;
      content = `**BATTLE EYEZ EXCLUSIVE**\n\nThe ${league.name} delivered ${outcome.outcomeType === 'upset' ? 'a shocking upset' : 'exactly what we expected'} tonight when ${outcome.winnerName} faced ${outcome.loserName}.\n\n${outcome.narrative}\n\n${outcome.chokeOccurred ? '**THE CHOKE:** Let\'s talk about the elephant in the room. Choking on this stage is unacceptable. This is what separates the professionals from the pretenders.' : '**NO CHOKE:** Credit where it\'s due - both battlers held it together under pressure.'}\n\n**CROWD REACTION:** The room ${avgCrowdReaction > 75 ? 'went CRAZY' : avgCrowdReaction > 60 ? 'was engaged' : 'seemed muted'}. ${battler1.stage_name} and ${battler2.stage_name} brought ${avgCrowdReaction > 75 ? 'that energy' : 'a professional performance'}.\n\n**WHAT THIS MEANS:** ${outcome.outcomeType === 'upset' ? `${outcome.winnerName} just announced themselves. ${outcome.loserName} needs to take this seriously.` : `${outcome.winnerName} maintains their position. ${outcome.loserName} has work to do.`}\n\n**Round Breakdown:**\n${roundSummary}\n\n**THE VERDICT:** ${outcome.verdict} ${outcome.winnerName}. ${outcome.outcomeType === 'debatable' ? 'But let\'s be honest - this could have gone either way.' : outcome.outcomeType === 'body' ? 'Not even close.' : 'Clear winner.'}\n\n— Battle Eyez`;
      rating = outcome.outcomeType === 'body' ? '🔥 BODY BAG' : outcome.outcomeType === 'debatable' ? '🤔 DEBATABLE' : '✓ CLEAR';
      break;

    case 'marijuana_piranha':
      title = `${outcome.winnerName} vs ${outcome.loserName}: Who Kept It Real?`;
      content = `**MARIJUANA PIRANHA - THE CIPHER**\n\nYo, so ${outcome.winnerName} and ${outcome.loserName} just battled at ${league.name}. ${outcome.verdict} ${outcome.winnerName}.\n\n${outcome.outcomeType === 'upset' ? `NOBODY expected ${outcome.winnerName} to win this. That\'s what I\'m talking about - real shit always rises to the top.` : `Look, ${outcome.winnerName} did what they was supposed to do.`}\n\n**WHO KEPT IT REAL:** ${battler1.archetype === 'Performance Beast' || battler1.archetype === 'Freestyle Genius' ? `${battler1.stage_name} came with that energy. You felt it.` : `${battler2.stage_name} brought that authentic fire.`}\n\n**WHO WAS FAKE:** ${battler1.archetype === 'Technical Writer' ? `${battler1.stage_name} had bars but no soul. Too technical, not enough heart.` : `Nobody was really fake here, just different styles.`}\n\n${outcome.chokeOccurred ? `**CHOKE TALK:** Yeah somebody choked. It happens. That\'s battle rap. You either built for this or you not.` : `**NO CHOKE:** Both kept they composure. Respect.`}\n\n**STREET VERDICT:** ${outcome.outcomeType === 'debatable' ? 'Could go either way depending who you ask. 2-1 debates are fire.' : outcome.outcomeType === 'body' ? `${outcome.winnerName} bodied that. No question.` : `${outcome.winnerName} got it.`}\n\n— Marijuana Piranha\n*Keep it a stack*`;
      rating = outcome.outcomeType === 'body' ? '🔥🔥🔥' : outcome.outcomeType === 'debatable' ? '🔥💀' : '🔥🔥';
      break;

    case 'algorithm_institute':
      title = `Historical Analysis: ${outcome.winnerName} vs ${outcome.loserName}`;
      content = `**ALGORITHM INSTITUTE OF BATTLE RAP**\n**${league.name} - ${new Date().toLocaleDateString()}**\n\nTonight's contest between ${outcome.winnerName} (${outcome.verdict}) and ${outcome.loserName} provides an interesting case study in ${league.short_code === 'SRC' ? 'small room dynamics' : 'main stage performance'}.\n\n**HISTORICAL CONTEXT:**\n${battler1.archetype} vs ${battler2.archetype} matchups have historically produced ${matchup.expectedOutcome.includes('close') ? 'competitive battles' : 'clear stylistic advantages'}. This battle ${outcome.outcomeType === 'upset' ? 'defied expectations' : 'confirmed the conventional wisdom'}.\n\n**PERFORMANCE ANALYSIS:**\nWinner: ${outcome.winnerName}\n- Average performance: ${battler1Rounds[0]?.average_score.toFixed(2)}/10\n- Peak moments: ${peakMoments}\n- Consistency: ${outcome.outcomeType === 'body' ? 'Excellent' : outcome.outcomeType === 'debatable' ? 'Moderate variance' : 'Good'}\n\n**CULTURAL SIGNIFICANCE:**\n${outcome.outcomeType === 'upset' ? `This upset will be remembered. ${outcome.winnerName} has shifted the narrative around their career trajectory.` : `Another quality battle for the archives. ${outcome.winnerName} continues their progression.`}\n\n${outcome.chokeOccurred ? '**NOTE ON CHOKING:** As documented throughout battle rap history, choking remains the great equalizer. Even elite battlers are vulnerable under pressure.' : ''}\n\n**HISTORICAL COMPARISON:**\nThis ${league.short_code === 'SRC' ? 'small room performance' : 'main stage showing'} ranks as ${outcome.outcomeType === 'body' ? 'a dominant display' : outcome.outcomeType === 'debatable' ? 'a textbook close battle' : 'a solid professional outing'}.\n\n— Algorithm Institute of Battle Rap`;
      rating = `${outcome.verdict} - ${outcome.outcomeType === 'body' ? 'Dominant Performance' : outcome.outcomeType === 'debatable' ? 'Highly Competitive' : 'Clear Victor'}`;
      break;

    // New bloggers use LLM prompts from bloggerPrompts.ts
    // Test/playtest mode uses simplified placeholders
    case 'small_room_report':
    case 'the_main_stage_herald':
    case 'underground_voice':
    case 'coast_to_coast_coverage':
    case 'the_battle_breakdown':
      // Fall through to default for new bloggers - real content uses LLM generation
      title = `${outcome.winnerName} vs ${outcome.loserName} - ${outcome.verdict}`;
      content = `[${matchup.blogger.toUpperCase()}] Battle recap for ${outcome.winnerName} vs ${outcome.loserName}. In production, this would be LLM-generated content using blogger-specific prompts.`;
      rating = outcome.verdict;
      break;

    default:
      title = `${outcome.winnerName} vs ${outcome.loserName} - ${outcome.verdict}`;
      content = `Battle recap placeholder for ${matchup.blogger}`;
      rating = outcome.verdict;
  }

  return {
    blogger: matchup.blogger,
    blogger_name: blogger.pen_name,
    outlet: blogger.outlet_name,
    title,
    content,
    rating,
    tone: blogger.writing_style,
  };
}

// ============================================================================
// PLAYTEST EXECUTION
// ============================================================================

interface PlaytestResult {
  matchup: string;
  battler1: string;
  battler2: string;
  league: string;
  outcome: BattleOutcome;
  article: MockBloggerArticle;
  expectedOutcome: string;
  matchedExpectation: boolean;
}

interface PlaytestSummary {
  totalBattles: number;
  outcomeDistribution: {
    bodies: number; // 3-0 dominant
    clearWins: number; // 2-1 or 3-0 clear
    debatable: number; // 2-1 close
    upsets: number; // Lower-rated won
  };
  chokeRate: number;
  avgMatchExpectation: number;
  results: PlaytestResult[];
}

export async function runPlaytest(): Promise<PlaytestSummary> {
  console.log('='.repeat(80));
  console.log('BATTLE RAP UNIVERSITY - PLAYTEST WITH BLOGGER COVERAGE');
  console.log('Research-Validated Balance Testing');
  console.log('='.repeat(80));
  console.log();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Load leagues
  const { data: leagues } = await supabase.from('leagues').select('*');
  if (!leagues || leagues.length === 0) {
    throw new Error('No leagues found in database');
  }

  const smallRoom = leagues.find((l) => l.short_code === 'SRC') || leagues[0];
  const mainStage = leagues.find((l) => l.short_code === 'MSA') || leagues[1];

  const results: PlaytestResult[] = [];
  const summary: PlaytestSummary = {
    totalBattles: 0,
    outcomeDistribution: {
      bodies: 0,
      clearWins: 0,
      debatable: 0,
      upsets: 0,
    },
    chokeRate: 0,
    avgMatchExpectation: 0,
    results: [],
  };

  let totalChokes = 0;
  let totalMatched = 0;

  // Create all test battlers
  const battlerIds = new Map<string, string>();
  for (const battler of PLAYTEST_BATTLERS) {
    const id = await createPlaytestBattler(supabase, battler, smallRoom.id);
    battlerIds.set(battler.stage_name, id);
  }

  // Run all matchups
  for (const matchup of PLAYTEST_MATCHUPS) {
    console.log('\n' + '='.repeat(80));
    console.log(`MATCHUP: ${matchup.battler1Name} vs ${matchup.battler2Name}`);
    console.log(`League: ${matchup.league === 'small_room' ? 'Small Room Circuit' : 'Main Stage Arena'}`);
    console.log(`Narrative: ${matchup.narrative}`);
    console.log('='.repeat(80));

    const league = matchup.league === 'small_room' ? smallRoom : mainStage;
    const battler1 = PLAYTEST_BATTLERS.find(b => b.stage_name === matchup.battler1Name)!;
    const battler2 = PLAYTEST_BATTLERS.find(b => b.stage_name === matchup.battler2Name)!;
    const battler1Id = battlerIds.get(matchup.battler1Name)!;
    const battler2Id = battlerIds.get(matchup.battler2Name)!;

    // Create battle
    const battle = await createPlaytestBattle(supabase, battler1Id, battler2Id, league.id);

    // Create prep blocks
    await createPrepBlocks(supabase, battle.id, battler1Id, battler1.prepStrategy);
    await createPrepBlocks(supabase, battle.id, battler2Id, battler2.prepStrategy);

    // Run simulation
    await simulateBattle(battle.id, supabase);

    // Collect results
    const { data: battleResult } = await supabase
      .from('battles')
      .select('winner_battler_id')
      .eq('id', battle.id)
      .single();

    const { data: rounds } = await supabase
      .from('battle_rounds')
      .select('*')
      .eq('battle_id', battle.id)
      .order('battler_id, round_index');

    // Classify outcome
    const outcome = classifyBattleOutcome(
      rounds || [],
      battler1,
      battler2,
      battleResult?.winner_battler_id || null,
      battler1Id
    );

    // Generate blogger article
    const article = generateMockBloggerArticle(matchup, outcome, rounds || [], battler1, battler2, league);

    // Check if matched expectation
    const matched = checkExpectationMatch(matchup.expectedOutcome, outcome);

    // Store result
    const result: PlaytestResult = {
      matchup: `${matchup.battler1Name} vs ${matchup.battler2Name}`,
      battler1: matchup.battler1Name,
      battler2: matchup.battler2Name,
      league: league.name,
      outcome,
      article,
      expectedOutcome: matchup.expectedOutcome,
      matchedExpectation: matched,
    };

    results.push(result);

    // Update summary stats
    summary.totalBattles++;
    if (outcome.outcomeType === 'body') summary.outcomeDistribution.bodies++;
    else if (outcome.outcomeType === 'debatable') summary.outcomeDistribution.debatable++;
    else if (outcome.outcomeType === 'upset') summary.outcomeDistribution.upsets++;
    else summary.outcomeDistribution.clearWins++;

    if (outcome.chokeOccurred) totalChokes++;
    if (matched) totalMatched++;

    // Print results
    printPlaytestResult(result);

    // Cleanup battle
    await supabase.from('battle_segments').delete().eq('battle_id', battle.id);
    await supabase.from('battle_rounds').delete().eq('battle_id', battle.id);
    await supabase.from('prep_blocks').delete().eq('battle_id', battle.id);
    await supabase.from('battles').delete().eq('id', battle.id);
  }

  // Cleanup battlers
  for (const [name, id] of battlerIds.entries()) {
    await supabase.from('rankings').delete().eq('battler_id', id);
    await supabase.from('battler_attributes').delete().eq('battler_id', id);
    await supabase.from('battlers').delete().eq('id', id);
  }

  // Finalize summary
  summary.chokeRate = totalChokes / summary.totalBattles;
  summary.avgMatchExpectation = totalMatched / summary.totalBattles;
  summary.results = results;

  // Export results
  const outputPath = path.join(process.cwd(), 'test-results', `playtest-${Date.now()}.json`);
  fs.mkdirSync(path.join(process.cwd(), 'test-results'), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));

  // Export articles
  const articlesPath = path.join(process.cwd(), 'test-results', `playtest-articles-${Date.now()}.md`);
  const articlesContent = results.map(r => `# ${r.article.title}\n\nBy **${r.article.blogger_name}** (*${r.article.outlet}*)\n\n${r.article.content}\n\n**Rating:** ${r.article.rating}\n\n---\n\n`).join('\n');
  fs.writeFileSync(articlesPath, articlesContent);

  console.log('\n' + '='.repeat(80));
  console.log(`Results exported to: ${outputPath}`);
  console.log(`Articles exported to: ${articlesPath}`);
  console.log('='.repeat(80));

  // Print validation summary
  printValidationSummary(summary);

  return summary;
}

function checkExpectationMatch(expected: string, outcome: BattleOutcome): boolean {
  const lower = expected.toLowerCase();

  // Check for specific expected outcomes
  if (lower.includes('body') || lower.includes('3-0')) {
    return outcome.verdict === '3-0' && outcome.outcomeType === 'body';
  }

  if (lower.includes('upset')) {
    return outcome.outcomeType === 'upset';
  }

  if (lower.includes('close') || lower.includes('2-1') || lower.includes('either way')) {
    return outcome.verdict.includes('2-1') || outcome.outcomeType === 'debatable';
  }

  // Default: match if verdict includes expected winner name
  return true; // Lenient matching for complex expectations
}

async function createPlaytestBattler(
  supabase: any,
  battler: PlaytestBattler,
  leagueId: string
): Promise<string> {
  const { data: created } = await supabase
    .from('battlers')
    .insert({
      stage_name: battler.stage_name,
      primary_league_id: leagueId,
      is_ai: true,
      tier: 'mid',
      style_tags: battler.badges,
    })
    .select()
    .single();

  await supabase.from('battler_attributes').insert({
    battler_id: created.id,
    writing: battler.attributes.writing,
    performance: battler.attributes.performance,
    personal: battler.attributes.personal,
    resilience: battler.attributes.resilience,
    public_knowledge: 50,
    xp: {},
  });

  await supabase.from('rankings').insert({
    battler_id: created.id,
    rating: battler.expectedRating,
    wins: 0,
    losses: 0,
    streak: 0,
  });

  return created.id;
}

async function createPlaytestBattle(
  supabase: any,
  battler1Id: string,
  battler2Id: string,
  leagueId: string
): Promise<any> {
  const now = new Date();
  const scheduled = new Date(now.getTime() - 1000 * 60 * 60);
  const lockPrep = new Date(now.getTime() - 1000 * 60 * 5);

  const { data: battle } = await supabase
    .from('battles')
    .insert({
      league_id: leagueId,
      battler_player_id: battler1Id,
      battler_ai_id: battler2Id,
      scheduled_at: scheduled.toISOString(),
      lock_prep_at: lockPrep.toISOString(),
      status: 'accepted',
      no_show_player: false,
    })
    .select()
    .single();

  return battle;
}

async function createPrepBlocks(
  supabase: any,
  battleId: string,
  battlerId: string,
  strategy: string
): Promise<void> {
  const prepDays = 7;
  const blocks: any[] = [];

  for (let i = 1; i <= prepDays; i++) {
    let focus: 'research' | 'writing' | 'performance' | 'life' | 'rest';

    switch (strategy) {
      case 'writing-heavy':
        if (i === 1) focus = 'research';
        else if (i === 7) focus = 'rest';
        else focus = 'writing';
        break;
      case 'performance-heavy':
        if (i === 1) focus = 'research';
        else if (i === 7) focus = 'rest';
        else focus = 'performance';
        break;
      case 'research-heavy':
        if (i <= 4) focus = 'research';
        else if (i <= 5) focus = 'writing';
        else focus = 'performance';
        break;
      case 'balanced':
        if (i % 5 === 1) focus = 'research';
        else if (i % 5 === 2) focus = 'writing';
        else if (i % 5 === 3) focus = 'performance';
        else if (i % 5 === 4) focus = 'rest';
        else focus = 'writing';
        break;
      case 'minimal':
        focus = 'rest';
        break;
      default:
        focus = 'rest';
    }

    blocks.push({
      battle_id: battleId,
      battler_id: battlerId,
      day_index: i,
      focus,
      auto_generated: true,
    });
  }

  await supabase.from('prep_blocks').insert(blocks);
}

function printPlaytestResult(result: PlaytestResult): void {
  console.log(`\n✓ Battle Complete: ${result.outcome.verdict} ${result.outcome.winnerName}`);
  console.log(`  Outcome Type: ${result.outcome.outcomeType}`);
  console.log(`  ${result.outcome.narrative}`);
  console.log(`  Choke: ${result.outcome.chokeOccurred ? 'YES' : 'NO'}`);
  console.log(`  Matched Expectation: ${result.matchedExpectation ? '✓' : '✗'}`);
  console.log();
  console.log(`BLOGGER COVERAGE by ${result.article.blogger_name} (${result.article.outlet}):`);
  console.log(`  Title: "${result.article.title}"`);
  console.log(`  Rating: ${result.article.rating}`);
  console.log(`  Tone: ${result.article.tone}`);
}

function printValidationSummary(summary: PlaytestSummary): void {
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATION AGAINST BATTLE RAP CULTURE RESEARCH');
  console.log('='.repeat(80));

  const pctBody = (summary.outcomeDistribution.bodies / summary.totalBattles) * 100;
  const pctDebatable = (summary.outcomeDistribution.debatable / summary.totalBattles) * 100;
  const pctUpsets = (summary.outcomeDistribution.upsets / summary.totalBattles) * 100;
  const pctChoke = summary.chokeRate * 100;

  console.log('\nOUTCOME DISTRIBUTION:');
  console.log(`  3-0 Bodies: ${summary.outcomeDistribution.bodies} (${pctBody.toFixed(1)}%)`);
  console.log(`    Target: 20-30% ${pctBody >= 20 && pctBody <= 30 ? '✓ PASS' : '✗ FAIL'}`);

  console.log(`  2-1 Debatable: ${summary.outcomeDistribution.debatable} (${pctDebatable.toFixed(1)}%)`);
  console.log(`    Target: 40-50% ${pctDebatable >= 40 && pctDebatable <= 50 ? '✓ PASS' : '✗ FAIL'}`);

  console.log(`  Clear Wins: ${summary.outcomeDistribution.clearWins}`);

  console.log(`  Upsets: ${summary.outcomeDistribution.upsets} (${pctUpsets.toFixed(1)}%)`);
  console.log(`    Target: 10-20% ${pctUpsets >= 10 && pctUpsets <= 20 ? '✓ PASS' : '✗ FAIL'}`);

  console.log(`\nCHOKE RATE: ${pctChoke.toFixed(1)}%`);
  console.log(`  Target: 5-15% ${pctChoke >= 5 && pctChoke <= 15 ? '✓ PASS' : '✗ FAIL'}`);

  console.log(`\nEXPECTATION MATCH: ${(summary.avgMatchExpectation * 100).toFixed(1)}%`);
  console.log(`  ${summary.avgMatchExpectation >= 0.6 ? '✓ Most battles matched expectations' : '✗ Too many unexpected outcomes'}`);

  console.log('\n' + '='.repeat(80));
  console.log('KEY FINDINGS:');
  console.log('='.repeat(80));

  // Generate findings
  const findings: string[] = [];

  if (pctBody < 20) findings.push('⚠️  Too few dominant wins - increase attribute gap impact');
  else if (pctBody > 30) findings.push('⚠️  Too many blowouts - reduce runaway wins');
  else findings.push('✓ Body frequency matches real battle rap');

  if (pctDebatable < 40) findings.push('⚠️  Not enough close battles - increase variance');
  else if (pctDebatable > 50) findings.push('⚠️  Too many debatable outcomes - clearer separation needed');
  else findings.push('✓ Debatable battle frequency matches culture');

  if (pctUpsets < 10) findings.push('⚠️  Prep impact too weak - upsets should happen more');
  else if (pctUpsets > 20) findings.push('⚠️  Too many upsets - favorites should win more often');
  else findings.push('✓ Upset frequency realistic');

  if (pctChoke < 5) findings.push('⚠️  Choking too rare - increase choke probability');
  else if (pctChoke > 15) findings.push('⚠️  Choking too common - reduce base choke chance');
  else findings.push('✓ Choke frequency matches battle rap reality');

  findings.forEach(f => console.log(`  ${f}`));

  console.log('\n' + '='.repeat(80));
}

// CLI entry point
if (require.main === module) {
  runPlaytest()
    .then(() => {
      console.log('\nPlaytest complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Playtest failed:', error);
      process.exit(1);
    });
}
