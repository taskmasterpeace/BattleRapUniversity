/**
 * Test LLM Integration
 *
 * Simple script to test the LLM integration with Open Web UI.
 * Run with: npx ts-node scripts/test-llm-integration.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { testLLMConnection, generateBloggerArticleWithLLM, getAvailableModels } from '../lib/services/llmIntegration';
import { getLLMConfig } from '../lib/services/llmConfig';
import { getBloggerPrompt } from '../lib/game/bloggerPrompts';

async function main() {
  console.log('='.repeat(80));
  console.log('BATTLE RAP UNIVERSITY - LLM INTEGRATION TEST');
  console.log('='.repeat(80));
  console.log();

  // 1. Check configuration
  console.log('1. Checking LLM Configuration...');
  const config = getLLMConfig();
  console.log(`   USE_REAL_LLM: ${config.useRealLLM}`);
  console.log(`   Base URL: ${config.baseUrl}`);
  console.log(`   Timeout: ${config.timeout}ms`);
  console.log(`   Retries: ${config.retries}`);
  console.log();

  if (!config.useRealLLM) {
    console.log('⚠️  USE_REAL_LLM is set to false. Skipping LLM tests.');
    console.log('   Set USE_REAL_LLM=true in .env.local to test real LLM integration.');
    return;
  }

  // 2. Test connection
  console.log('2. Testing Connection to Open Web UI...');
  const connectionTest = await testLLMConnection();
  if (connectionTest.success) {
    console.log(`   ✓ ${connectionTest.message}`);
  } else {
    console.log(`   ✗ ${connectionTest.message}`);
    console.log();
    console.log('⚠️  Cannot connect to Open Web UI. Make sure:');
    console.log('   1. Open Web UI is running');
    console.log('   2. OPENWEBUI_BASE_URL is correct in .env.local');
    console.log('   3. OPENWEBUI_API_KEY is valid');
    return;
  }
  console.log();

  // 3. List available models
  console.log('3. Fetching Available Models...');
  const models = await getAvailableModels();
  if (models.length > 0) {
    console.log(`   Found ${models.length} models:`);
    models.slice(0, 10).forEach(m => console.log(`     - ${m}`));
    if (models.length > 10) {
      console.log(`     ... and ${models.length - 10} more`);
    }
  } else {
    console.log('   ⚠️  Could not fetch models list (API may not support /v1/models endpoint)');
  }
  console.log();

  // 4. Test blogger article generation
  console.log('4. Testing Blogger Article Generation...');
  console.log('   Generating sample article with "battle_eyez" blogger...');

  const battleData = {
    battler_a: 'Lyric',
    battler_b: 'Blaze',
    winner: 'Lyric',
    verdict: '2-1',
    league: 'Small Room Circuit',
    round_summary: 'Round 1: Lyric won (8.5 avg, 9.2 peak, no choke)\nRound 2: Blaze won (8.7 avg, 8.9 peak, no choke)\nRound 3: Lyric won (8.3 avg, 8.1 peak, no choke)',
    notable_moments: 'Lyric in R1, Blaze in R2',
    crowd_reaction: 'Player: 72%, AI: 68%',
    drama_notes: 'No major drama',
  };

  const { systemPrompt, userPrompt } = getBloggerPrompt('battle_eyez', battleData);

  try {
    const startTime = Date.now();
    const response = await generateBloggerArticleWithLLM('battle_eyez', systemPrompt, userPrompt);
    const elapsed = Date.now() - startTime;

    console.log(`   ✓ Article generated successfully!`);
    console.log(`   Model: ${response.model}`);
    console.log(`   Tokens: ${response.tokensUsed}`);
    console.log(`   Latency: ${response.latencyMs}ms (total: ${elapsed}ms)`);
    console.log();
    console.log('   --- Generated Article Preview ---');
    console.log(response.content.substring(0, 500) + '...');
    console.log('   --- End Preview ---');
  } catch (error: any) {
    console.log(`   ✗ Failed to generate article: ${error.message}`);
    console.log();
    console.log('   This could be due to:');
    console.log('   - Model not available in Open Web UI');
    console.log('   - API timeout');
    console.log('   - Invalid API key');
  }

  console.log();
  console.log('='.repeat(80));
  console.log('TEST COMPLETE');
  console.log('='.repeat(80));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
