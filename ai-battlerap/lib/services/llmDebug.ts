/**
 * LLM Integration Debug Utilities
 *
 * Helper functions for debugging and monitoring LLM integration
 */

import { getLLMConfig, validateLLMConfig } from './llmConfig';
import { testLLMConnection, getAvailableModels } from './llmIntegration';

/**
 * Print LLM configuration status
 */
export function printLLMStatus(): void {
  const config = getLLMConfig();
  const validation = validateLLMConfig(config);

  console.log('\n=== LLM INTEGRATION STATUS ===\n');

  console.log('Configuration:');
  console.log(`  USE_REAL_LLM: ${config.useRealLLM}`);
  console.log(`  Base URL: ${config.baseUrl}`);
  console.log(`  API Key: ${config.apiKey ? '***' + config.apiKey.slice(-4) : 'NOT SET'}`);
  console.log(`  Timeout: ${config.timeout}ms`);
  console.log(`  Retries: ${config.retries}`);

  console.log('\nValidation:');
  if (validation.valid) {
    console.log('  ✓ Configuration is valid');
  } else {
    console.log('  ✗ Configuration has errors:');
    validation.errors.forEach(err => console.log(`    - ${err}`));
  }

  console.log('\nBlogger Model Mappings:');
  Object.entries(config.modelMappings).forEach(([blogger, model]) => {
    console.log(`  ${blogger}: ${model}`);
  });

  console.log('\n==============================\n');
}

/**
 * Test LLM integration and print detailed diagnostics
 */
export async function runLLMDiagnostics(): Promise<void> {
  console.log('\n=== LLM DIAGNOSTICS ===\n');

  const config = getLLMConfig();

  // Check if enabled
  if (!config.useRealLLM) {
    console.log('❌ LLM integration is DISABLED');
    console.log('   Set USE_REAL_LLM=true in .env.local to enable\n');
    return;
  }

  console.log('✓ LLM integration is ENABLED\n');

  // Test connection
  console.log('Testing connection...');
  const connectionTest = await testLLMConnection();

  if (connectionTest.success) {
    console.log(`✓ Connection successful`);
    console.log(`  Model: ${connectionTest.model}`);
  } else {
    console.log(`❌ Connection failed`);
    console.log(`  Error: ${connectionTest.message}`);
    console.log('\nTroubleshooting:');
    console.log('  1. Check if Open Web UI is running: docker ps');
    console.log('  2. Verify OPENWEBUI_BASE_URL is correct');
    console.log('  3. Ensure OPENWEBUI_API_KEY is valid');
    console.log('  4. Try accessing the URL in a browser\n');
    return;
  }

  // List available models
  console.log('\nFetching available models...');
  const models = await getAvailableModels();

  if (models.length > 0) {
    console.log(`✓ Found ${models.length} models:`);
    models.forEach(m => console.log(`  - ${m}`));
  } else {
    console.log('⚠️  Could not fetch models (API may not support /v1/models)');
  }

  // Check if configured models are available
  console.log('\nValidating configured models...');
  const modelMappings = config.modelMappings;
  const unavailableModels: string[] = [];

  for (const [blogger, model] of Object.entries(modelMappings)) {
    if (models.length > 0 && !models.includes(model)) {
      unavailableModels.push(`${blogger}: ${model}`);
    }
  }

  if (unavailableModels.length > 0) {
    console.log('⚠️  Some configured models may not be available:');
    unavailableModels.forEach(m => console.log(`  - ${m}`));
    console.log('\nNote: This check only works if /v1/models endpoint is supported');
  } else if (models.length > 0) {
    console.log('✓ All configured models appear to be available');
  } else {
    console.log('⚠️  Cannot validate - model list not available');
  }

  console.log('\n======================\n');
}

/**
 * Get blogger model mapping table as string
 */
export function getBloggerModelTable(): string {
  const config = getLLMConfig();
  const bloggers = [
    { key: 'battle_eyez', name: 'Battle Eyez' },
    { key: 'marijuana_piranha', name: 'Marijuana Piranha' },
    { key: 'algorithm_institute', name: 'Algorithm Institute' },
    { key: 'small_room_report', name: 'Small Room Report' },
    { key: 'the_main_stage_herald', name: 'The Main Stage Herald' },
    { key: 'underground_voice', name: 'Underground Voice' },
    { key: 'coast_to_coast_coverage', name: 'Coast to Coast Coverage' },
    { key: 'the_battle_breakdown', name: 'The Battle Breakdown' },
  ];

  let table = '\n╔════════════════════════╦════════════════════════════════╗\n';
  table += '║ Blogger                ║ Model                          ║\n';
  table += '╠════════════════════════╬════════════════════════════════╣\n';

  bloggers.forEach(({ key, name }) => {
    const model = config.modelMappings[key] || 'llama3.1:8b';
    const paddedName = name.padEnd(22);
    const paddedModel = model.padEnd(30);
    table += `║ ${paddedName} ║ ${paddedModel} ║\n`;
  });

  table += '╚════════════════════════╩════════════════════════════════╝\n';

  return table;
}

/**
 * Monitor LLM request performance
 */
export class LLMPerformanceMonitor {
  private requests: Array<{
    blogger: string;
    model: string;
    tokensUsed: number;
    latencyMs: number;
    timestamp: number;
    success: boolean;
  }> = [];

  recordRequest(
    blogger: string,
    model: string,
    tokensUsed: number,
    latencyMs: number,
    success: boolean
  ) {
    this.requests.push({
      blogger,
      model,
      tokensUsed,
      latencyMs,
      timestamp: Date.now(),
      success,
    });
  }

  getStats() {
    const total = this.requests.length;
    const successful = this.requests.filter(r => r.success).length;
    const failed = total - successful;

    const successfulRequests = this.requests.filter(r => r.success);
    const avgLatency = successfulRequests.reduce((sum, r) => sum + r.latencyMs, 0) / (successfulRequests.length || 1);
    const avgTokens = successfulRequests.reduce((sum, r) => sum + r.tokensUsed, 0) / (successfulRequests.length || 1);

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgLatency: Math.round(avgLatency),
      avgTokens: Math.round(avgTokens),
      totalTokens: successfulRequests.reduce((sum, r) => sum + r.tokensUsed, 0),
    };
  }

  printStats() {
    const stats = this.getStats();

    console.log('\n=== LLM PERFORMANCE STATS ===\n');
    console.log(`Total Requests: ${stats.total}`);
    console.log(`Successful: ${stats.successful}`);
    console.log(`Failed: ${stats.failed}`);
    console.log(`Success Rate: ${stats.successRate.toFixed(1)}%`);
    console.log(`Average Latency: ${stats.avgLatency}ms`);
    console.log(`Average Tokens: ${stats.avgTokens}`);
    console.log(`Total Tokens: ${stats.totalTokens}`);
    console.log('\n============================\n');
  }

  clear() {
    this.requests = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new LLMPerformanceMonitor();
