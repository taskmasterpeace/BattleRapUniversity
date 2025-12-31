/**
 * LLM Configuration
 *
 * Loads and validates LLM configuration from environment variables.
 * Supports different models per blogger for diverse writing styles.
 */

export interface LLMConfig {
  useRealLLM: boolean;
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retries: number;
  modelMappings: Record<string, string>;
}

/**
 * Load LLM configuration from environment variables
 */
export function getLLMConfig(): LLMConfig {
  const useRealLLM = process.env.USE_REAL_LLM === 'true';

  const config: LLMConfig = {
    useRealLLM,
    baseUrl: process.env.OPENWEBUI_BASE_URL || 'http://localhost:8080',
    apiKey: process.env.OPENWEBUI_API_KEY || '',
    timeout: parseInt(process.env.LLM_TIMEOUT_MS || '30000', 10),
    retries: parseInt(process.env.LLM_RETRIES || '3', 10),
    modelMappings: parseModelMappings(),
  };

  return config;
}

/**
 * Parse blogger model mappings from environment variables
 */
function parseModelMappings(): Record<string, string> {
  return {
    battle_eyez: process.env.BLOGGER_BATTLE_EYEZ_MODEL || 'llama3.1:8b',
    marijuana_piranha: process.env.BLOGGER_MARIJUANA_PIRANHA_MODEL || 'llama3.1:8b',
    algorithm_institute: process.env.BLOGGER_ALGORITHM_INSTITUTE_MODEL || 'llama3.1:8b',
    small_room_report: process.env.BLOGGER_SMALL_ROOM_REPORT_MODEL || 'llama3.1:8b',
    the_main_stage_herald: process.env.BLOGGER_THE_MAIN_STAGE_HERALD_MODEL || 'llama3.1:8b',
    underground_voice: process.env.BLOGGER_UNDERGROUND_VOICE_MODEL || 'llama3.1:8b',
    coast_to_coast_coverage: process.env.BLOGGER_COAST_TO_COAST_COVERAGE_MODEL || 'llama3.1:8b',
    the_battle_breakdown: process.env.BLOGGER_THE_BATTLE_BREAKDOWN_MODEL || 'llama3.1:8b',
  };
}

/**
 * Validate LLM configuration
 */
export function validateLLMConfig(config: LLMConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.useRealLLM) {
    if (!config.baseUrl) {
      errors.push('OPENWEBUI_BASE_URL is required when USE_REAL_LLM=true');
    }

    if (!config.apiKey) {
      errors.push('OPENWEBUI_API_KEY is required when USE_REAL_LLM=true');
    }

    if (config.timeout < 1000 || config.timeout > 120000) {
      errors.push('LLM_TIMEOUT_MS must be between 1000 and 120000');
    }

    if (config.retries < 0 || config.retries > 5) {
      errors.push('LLM_RETRIES must be between 0 and 5');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get model for a specific blogger
 */
export function getModelForBlogger(bloggerKey: string, config: LLMConfig): string {
  return config.modelMappings[bloggerKey] || 'llama3.1:8b';
}
