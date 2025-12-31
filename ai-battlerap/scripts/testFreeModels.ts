/**
 * Free Model Testing Script for OpenRouter
 *
 * Tests FREE models available on OpenRouter to minimize costs
 *
 * Models tested (all $0.00):
 * - DeepSeek R1 (reasoning model, good for complex tasks)
 * - Llama 3.3 70B (large model, high quality)
 * - Gemini 2.0 Flash Exp (Google, fast)
 * - DeepSeek R1 Distill Qwen 32B (distilled reasoning model)
 *
 * Compare against our current paid models:
 * - Qwen 2.5 7B ($0.000046/article)
 * - GPT-4o-mini ($0.000150/article)
 *
 * Usage: npx tsx scripts/testFreeModels.ts
 */

import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import { getBloggerPrompt } from '../lib/game/bloggerPrompts';
import type { BattleRecapSummary } from '../lib/services/newsGenerator';

// Load environment variables
loadEnv({ path: join(process.cwd(), '.env.local') });

// FREE MODELS TO TEST
const FREE_MODELS = [
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (Free)',
    provider: 'DeepSeek',
    cost_per_1k_tokens: 0,
    notes: 'Reasoning model, good for complex tasks',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B (Free)',
    provider: 'Meta',
    cost_per_1k_tokens: 0,
    notes: 'Large model, high quality output',
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (Free)',
    provider: 'Google',
    cost_per_1k_tokens: 0,
    notes: 'Fast, experimental model',
  },
  {
    id: 'deepseek/deepseek-r1-distill-qwen-32b:free',
    name: 'DeepSeek R1 Distill Qwen 32B (Free)',
    provider: 'DeepSeek',
    cost_per_1k_tokens: 0,
    notes: 'Distilled reasoning model, smaller but still capable',
  },
];

// PAID MODELS FOR COMPARISON
const PAID_MODELS = [
  {
    id: 'qwen/qwen-2.5-7b-instruct',
    name: 'Qwen 2.5 7B (Paid)',
    provider: 'Alibaba',
    cost_per_1k_tokens: 0.00004,
    notes: 'Current best value paid model',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o-mini (Paid)',
    provider: 'OpenAI',
    cost_per_1k_tokens: 0.00015,
    notes: 'Most polished paid model',
  },
];

// Bloggers to test (2 different styles)
const BLOGGERS_TO_TEST = [
  'battle_eyez', // Drama-focused
  'algorithm_institute', // Technical
];

// Test battle data (from tournament)
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
  modelConfig: (typeof FREE_MODELS)[0] | (typeof PAID_MODELS)[0],
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
      round_summaries: TEST_BATTLE.player.roundSummaries
        .map((r: any, i: number) => {
          const aiRound = TEST_BATTLE.ai.roundSummaries[i];
          return `Round ${r.roundNumber}: ${TEST_BATTLE.player.name} (avg: ${r.avgScore}, peak: ${r.peakScore}, crowd: ${r.crowdReaction}) vs ${TEST_BATTLE.ai.name} (avg: ${aiRound.avgScore}, peak: ${aiRound.peakScore}, crowd: ${aiRound.crowdReaction})`;
        })
        .join('\n'),
      player_badges: TEST_BATTLE.player.badges.join(', '),
      ai_badges: TEST_BATTLE.ai.badges.join(', '),
      league: TEST_BATTLE.leagueName || 'Main Stage Arena',
      context_type: TEST_BATTLE.contextType,
      prep_days: TEST_BATTLE.prepDays.toString(),
    });

    // Call API
    const { content, responseTime, tokensUsed } = await callOpenRouter(modelConfig.id, systemPrompt, userPrompt);

    // Analyze output
    const wordCount = content.split(/\s+/).length;
    const estimatedCost = (tokensUsed / 1000) * modelConfig.cost_per_1k_tokens;

    // Check for catchphrase
    const catchphrases: Record<string, string> = {
      battle_eyez: 'Let me put you on to what really happened',
      algorithm_institute: "Let's go to the scorecards",
    };
    const hasCatchphrase = content.toLowerCase().includes(catchphrases[bloggerKey]?.toLowerCase() || '');

    return {
      model: modelConfig.name,
      blogger: bloggerKey,
      article: content,
      wordCount,
      hasCatchphrase,
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
  console.log('FREE MODEL TESTING (OpenRouter)');
  console.log('========================================\n');

  console.log('Testing 100% FREE models vs our current paid models');
  console.log(`Battle: ${TEST_BATTLE.player.name} vs ${TEST_BATTLE.ai.name}`);
  console.log(`Result: ${TEST_BATTLE.winner} wins ${TEST_BATTLE.verdict}\n`);

  const results: TestResult[] = [];

  // Test FREE models
  console.log('\n========================================');
  console.log('TESTING FREE MODELS ($0.00)');
  console.log('========================================');

  for (const model of FREE_MODELS) {
    console.log(`\n${model.name} (${model.provider}) - ${model.notes}`);
    for (const blogger of BLOGGERS_TO_TEST) {
      const result = await testModelBloggerPair(model, blogger);
      results.push(result);

      if (result.error) {
        console.log(`    ❌ Failed: ${result.error}`);
      } else {
        console.log(
          `    ✅ ${result.wordCount} words, ${result.responseTime}ms, FREE, catchphrase: ${result.hasCatchphrase ? 'yes' : 'no'}`
        );
      }
    }
  }

  // Test PAID models for comparison
  console.log('\n========================================');
  console.log('TESTING PAID MODELS (for comparison)');
  console.log('========================================');

  for (const model of PAID_MODELS) {
    console.log(`\n${model.name} (${model.provider}) - ${model.notes}`);
    for (const blogger of BLOGGERS_TO_TEST) {
      const result = await testModelBloggerPair(model, blogger);
      results.push(result);

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
  console.log('COST COMPARISON REPORT');
  console.log('========================================\n');

  const allModels = [...FREE_MODELS, ...PAID_MODELS];

  for (const model of allModels) {
    const modelResults = results.filter(r => r.model === model.name && !r.error);
    if (modelResults.length === 0) {
      console.log(`${model.name}: ALL TESTS FAILED`);
      continue;
    }

    const avgWordCount = modelResults.reduce((sum, r) => sum + r.wordCount, 0) / modelResults.length;
    const avgResponseTime = modelResults.reduce((sum, r) => sum + r.responseTime, 0) / modelResults.length;
    const avgCost = modelResults.reduce((sum, r) => sum + r.estimatedCost, 0) / modelResults.length;
    const catchphraseRate = modelResults.filter(r => r.hasCatchphrase).length / modelResults.length;

    const isFree = model.cost_per_1k_tokens === 0;

    console.log(`${model.name} (${model.provider}) ${isFree ? '🆓 FREE' : '💰 PAID'}`);
    console.log(`  Avg Word Count: ${avgWordCount.toFixed(0)} words`);
    console.log(`  Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`  Cost per Article: ${isFree ? 'FREE ✨' : `$${avgCost.toFixed(6)}`}`);
    console.log(`  Catchphrase Usage: ${(catchphraseRate * 100).toFixed(0)}%`);
    console.log(`  Cost for 100 articles: ${isFree ? 'FREE ($0.00) 🎉' : `$${(avgCost * 100).toFixed(2)}`}`);
    console.log('');
  }

  // Print sample articles
  console.log('\n========================================');
  console.log('SAMPLE ARTICLES (battle_eyez blogger)');
  console.log('========================================\n');

  for (const model of [...FREE_MODELS, ...PAID_MODELS]) {
    const sampleResult = results.find(r => r.model === model.name && r.blogger === 'battle_eyez' && !r.error);
    if (!sampleResult) continue;

    const isFree = model.cost_per_1k_tokens === 0;

    console.log(`\n--- ${model.name} ${isFree ? '(FREE)' : '(PAID)'} ---`);
    console.log(sampleResult.article.substring(0, 500) + '...');
    console.log(
      `\n(${sampleResult.wordCount} words, ${sampleResult.responseTime}ms, ${isFree ? 'FREE' : `$${sampleResult.estimatedCost.toFixed(6)}`})`
    );
  }

  console.log('\n\n========================================');
  console.log('RECOMMENDATIONS');
  console.log('========================================\n');

  console.log('🆓 FREE MODEL FINDINGS:');
  console.log('If any of the free models produce acceptable quality, you can:');
  console.log('1. Use FREE models for all bloggers = $0.00 per 100 articles');
  console.log('2. Use FREE models for most bloggers, paid for 1-2 premium bloggers');
  console.log('3. Mix and match based on quality needs\n');

  console.log('💰 CURRENT COST (Qwen 2.5 7B for all):');
  console.log('$4.60 per 100 articles\n');

  console.log('📊 POTENTIAL SAVINGS:');
  console.log('Switching to 100% free models = Save $4.60 per 100 articles (100% savings)');
  console.log('Switching to 50% free, 50% paid = Save ~$2.30 per 100 articles (50% savings)\n');

  console.log('Review sample articles above and choose the best balance of:');
  console.log('- Quality (persona adherence, catchphrases, structure)');
  console.log('- Speed (response time)');
  console.log('- Cost (free vs paid)');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
