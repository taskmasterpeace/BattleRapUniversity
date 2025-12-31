/**
 * A/B Testing Script for Blogger LLM Models
 *
 * Tests different models with the same battle data to compare:
 * - Output quality and style adherence
 * - Article length and structure
 * - Prompt following (catchphrases, decision-type handling)
 * - Cost efficiency
 *
 * Models tested:
 * - GPT-4o-mini (OpenAI - cheap, reliable)
 * - Llama 3.1 8B (Meta - open source, cheap)
 * - Qwen 2.5 7B (Alibaba - recommended cheap model)
 *
 * Usage: npx tsx scripts/testBloggerModels.ts
 */

import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import { getBloggerPrompt } from '../lib/game/bloggerPrompts';
import type { BattleRecapSummary } from '../lib/services/newsGenerator';

// Load environment variables
loadEnv({ path: join(process.cwd(), '.env.local') });

// Models to test (OpenRouter format)
const MODELS_TO_TEST = [
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o-mini',
    provider: 'OpenAI',
    cost_per_1k_tokens: 0.00015, // Input cost (approximate)
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B',
    provider: 'Meta',
    cost_per_1k_tokens: 0.00005, // Approximate
  },
  {
    id: 'qwen/qwen-2.5-7b-instruct',
    name: 'Qwen 2.5 7B',
    provider: 'Alibaba',
    cost_per_1k_tokens: 0.00004, // Approximate
  },
];

// Bloggers to test (different styles to see model variance)
const BLOGGERS_TO_TEST = [
  'battle_eyez', // Drama-focused, controversial
  'algorithm_institute', // Technical, analytical
  'coast_to_coast_coverage', // Cynical, underdog champion
];

// Test battle data (from tournament results)
const TEST_BATTLE: any = {
  player: {
    name: 'Tsunami Wave',
    tier: 'GOD',
    rating: 1870,
    badges: ['Stage Domination', 'Crowd Favorite', 'Believable Persona', 'Aggressive Battler', 'Known Choker'],
    roundsWon: 1,
    chokes: 0,
    haymakers: 0,
    avgScore: 11.9,
    peakScore: 15.1,
    consistencyScore: 6.1,
    crowdAverage: 98.0,
    roundSummaries: [
      {
        roundNumber: 1,
        avgScore: 12.0,
        peakScore: 15.6,
        consistencyScore: 6.4,
        crowdReaction: 100,
        choked: false,
        content: ['pop_culture_refs', 'comedy', 'punchlines'],
        delivery: ['speed_rapping'],
        performance: ['stage_presence'],
      },
      {
        roundNumber: 2,
        avgScore: 12.9,
        peakScore: 15.9,
        consistencyScore: 5.1,
        crowdReaction: 100,
        choked: false,
        content: ['comedy', 'pop_culture_refs', 'personals', 'rebuttals'],
        delivery: ['staccato'],
        performance: ['stage_presence', 'charismatic'],
      },
      {
        roundNumber: 3,
        avgScore: 10.8,
        peakScore: 13.7,
        consistencyScore: 5.9,
        crowdReaction: 94,
        choked: false,
        content: ['comedy', 'pop_culture_refs', 'wordplay'],
        delivery: ['conversational', 'smooth_flow'],
        performance: ['stage_presence', 'crowd_interaction'],
      },
    ],
  },
  ai: {
    name: 'The Comedian',
    tier: 'GOD',
    rating: 1852,
    badges: ['Comedy King\\Queen', 'Crowd Favorite', 'Freestyle Genius', 'Creativity Beast'],
    roundsWon: 2,
    chokes: 0,
    haymakers: 0,
    avgScore: 8.7,
    peakScore: 12.0,
    consistencyScore: 5.4,
    crowdAverage: 86.3,
    roundSummaries: [
      {
        roundNumber: 1,
        avgScore: 6.2,
        peakScore: 8.4,
        consistencyScore: 7.0,
        crowdReaction: 78,
        choked: false,
        content: ['freestyles', 'pop_culture_refs', 'comedy'],
        delivery: ['speed_rapping'],
        performance: ['charismatic'],
      },
      {
        roundNumber: 2,
        avgScore: 13.2,
        peakScore: 16.5,
        consistencyScore: 3.4,
        crowdReaction: 100,
        choked: false,
        content: ['freestyles', 'comedy', 'pop_culture_refs', 'personals'],
        delivery: ['staccato'],
        performance: ['charismatic', 'crowd_interaction'],
      },
      {
        roundNumber: 3,
        avgScore: 6.8,
        peakScore: 11.0,
        consistencyScore: 5.8,
        crowdReaction: 81,
        choked: false,
        content: ['freestyles', 'comedy', 'pop_culture_refs'],
        delivery: ['conversational', 'smooth_flow'],
        performance: ['crowd_interaction', 'charismatic'],
      },
    ],
  },
  winner: 'The Comedian',
  decision: 'edge',
  verdict: '2-1',
  isUpset: false,
  leagueName: 'Small Room Circuit',
  leagueStageType: 'small_room',
  contextType: 'in_building',
  prepDays: 14,
};

interface TestResult {
  model: string;
  blogger: string;
  article: string;
  wordCount: number;
  hasCatchphrase: boolean;
  hasStructuralSignature: boolean;
  decisionTypeHandled: boolean;
  responseTime: number;
  estimatedCost: number;
  error?: string;
}

/**
 * Call OpenRouter API with specific model
 */
async function callOpenRouter(
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ content: string; responseTime: number; tokensUsed: number }> {
  const startTime = Date.now();

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENWEBUI_API_KEY}`,
      'HTTP-Referer': 'https://battlerapuniversity.com',
      'X-Title': 'Battle Rap University',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const responseTime = Date.now() - startTime;

  return {
    content: data.choices[0]?.message?.content || '',
    responseTime,
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

/**
 * Test a single model + blogger combination
 */
async function testModelBloggerPair(
  modelConfig: (typeof MODELS_TO_TEST)[0],
  bloggerKey: string
): Promise<TestResult> {
  console.log(`  Testing ${modelConfig.name} with ${bloggerKey}...`);

  try {
    // Get blogger prompts
    const { systemPrompt, userPrompt } = getBloggerPrompt(bloggerKey, {
      decision_type: '2-1 edge',
      battler_a: TEST_BATTLE.player.name,
      battler_b: TEST_BATTLE.ai.name,
      winner: TEST_BATTLE.winner,
      verdict: TEST_BATTLE.verdict,
      league: TEST_BATTLE.leagueName || 'Main Stage Arena',
      round_summaries: TEST_BATTLE.player.roundSummaries.map((r: any, i: number) => {
        const aiRound = TEST_BATTLE.ai.roundSummaries[i];
        return `Round ${r.roundNumber}: ${TEST_BATTLE.player.name} (avg: ${r.avgScore}, peak: ${r.peakScore}, crowd: ${r.crowdReaction}) vs ${TEST_BATTLE.ai.name} (avg: ${aiRound.avgScore}, peak: ${aiRound.peakScore}, crowd: ${aiRound.crowdReaction})`;
      }).join('\n'),
      player_badges: TEST_BATTLE.player.badges.join(', '),
      ai_badges: TEST_BATTLE.ai.badges.join(', '),
      league_name: TEST_BATTLE.leagueName,
      context_type: TEST_BATTLE.contextType,
      prep_days: TEST_BATTLE.prepDays.toString(),
    });

    // Call API
    const { content, responseTime, tokensUsed } = await callOpenRouter(
      modelConfig.id,
      systemPrompt,
      userPrompt
    );

    // Analyze output
    const wordCount = content.split(/\s+/).length;
    const estimatedCost = (tokensUsed / 1000) * modelConfig.cost_per_1k_tokens;

    // Check for catchphrase (from blogger prompts)
    const catchphrases: Record<string, string> = {
      battle_eyez: 'Let me put you on to what really happened',
      algorithm_institute: "Let's go to the scorecards",
      coast_to_coast_coverage: 'Keep it a buck',
    };
    const hasCatchphrase = content.toLowerCase().includes(catchphrases[bloggerKey]?.toLowerCase() || '');

    // Check for decision-type handling (2-1 edge should be 400-450 words for most bloggers)
    const decisionTypeHandled = wordCount >= 350 && wordCount <= 550;

    return {
      model: modelConfig.name,
      blogger: bloggerKey,
      article: content,
      wordCount,
      hasCatchphrase,
      hasStructuralSignature: true, // Hard to automatically detect, manual review needed
      decisionTypeHandled,
      responseTime,
      estimatedCost,
    };
  } catch (error) {
    console.error(`    Error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      model: modelConfig.name,
      blogger: bloggerKey,
      article: '',
      wordCount: 0,
      hasCatchphrase: false,
      hasStructuralSignature: false,
      decisionTypeHandled: false,
      responseTime: 0,
      estimatedCost: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('========================================');
  console.log('Blogger Model A/B Testing');
  console.log('========================================\n');

  console.log(`Battle: ${TEST_BATTLE.player.name} vs ${TEST_BATTLE.ai.name}`);
  console.log(`Result: ${TEST_BATTLE.winner} wins ${TEST_BATTLE.verdict}\n`);

  const results: TestResult[] = [];

  // Test each model with each blogger
  for (const model of MODELS_TO_TEST) {
    console.log(`\nTesting ${model.name} (${model.provider})...`);
    for (const blogger of BLOGGERS_TO_TEST) {
      const result = await testModelBloggerPair(model, blogger);
      results.push(result);

      // Brief summary
      if (result.error) {
        console.log(`    ❌ Failed: ${result.error}`);
      } else {
        console.log(
          `    ✅ ${result.wordCount} words, ${result.responseTime}ms, $${result.estimatedCost.toFixed(6)}, catchphrase: ${result.hasCatchphrase ? 'yes' : 'no'}`
        );
      }
    }
  }

  // Generate comparison report
  console.log('\n========================================');
  console.log('COMPARISON REPORT');
  console.log('========================================\n');

  // Group by model
  for (const model of MODELS_TO_TEST) {
    const modelResults = results.filter(r => r.model === model.name && !r.error);
    if (modelResults.length === 0) {
      console.log(`${model.name}: ALL TESTS FAILED`);
      continue;
    }

    const avgWordCount = modelResults.reduce((sum, r) => sum + r.wordCount, 0) / modelResults.length;
    const avgResponseTime = modelResults.reduce((sum, r) => sum + r.responseTime, 0) / modelResults.length;
    const avgCost = modelResults.reduce((sum, r) => sum + r.estimatedCost, 0) / modelResults.length;
    const catchphraseRate = modelResults.filter(r => r.hasCatchphrase).length / modelResults.length;

    console.log(`${model.name} (${model.provider})`);
    console.log(`  Avg Word Count: ${avgWordCount.toFixed(0)} words`);
    console.log(`  Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`  Avg Cost per Article: $${avgCost.toFixed(6)}`);
    console.log(`  Catchphrase Usage: ${(catchphraseRate * 100).toFixed(0)}%`);
    console.log('');
  }

  // Print sample articles (first blogger only for brevity)
  console.log('\n========================================');
  console.log('SAMPLE ARTICLES (battle_eyez)');
  console.log('========================================\n');

  for (const model of MODELS_TO_TEST) {
    const sampleResult = results.find(r => r.model === model.name && r.blogger === 'battle_eyez' && !r.error);
    if (!sampleResult) continue;

    console.log(`\n--- ${model.name} ---`);
    console.log(sampleResult.article);
    console.log(`\n(${sampleResult.wordCount} words, ${sampleResult.responseTime}ms, $${sampleResult.estimatedCost.toFixed(6)})`);
  }

  console.log('\n\n========================================');
  console.log('RECOMMENDATIONS');
  console.log('========================================\n');

  console.log('Review the sample articles above and consider:');
  console.log('1. Style adherence - Does each model capture the blogger persona?');
  console.log('2. Catchphrase usage - Are recurring catchphrases included?');
  console.log('3. Decision-type handling - Is the article length appropriate for a 2-1 edge?');
  console.log('4. Cost efficiency - Balance quality vs cost per article');
  console.log('5. Response time - Faster models = better user experience');
  console.log('\nYou can assign different models to different bloggers in .env.local');
  console.log('Example:');
  console.log('  BLOGGER_BATTLE_EYEZ_MODEL=openai/gpt-4o-mini');
  console.log('  BLOGGER_ALGORITHM_INSTITUTE_MODEL=meta-llama/llama-3.1-8b-instruct');
  console.log('  BLOGGER_COAST_TO_COAST_COVERAGE_MODEL=qwen/qwen-2.5-7b-instruct\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
