/**
 * LLM Integration Service
 *
 * Connects Battle Rap University's blogger system to Open Web UI.
 * Supports multiple models per blogger with retry logic and rate limiting.
 */

import { getLLMConfig, getModelForBlogger, validateLLMConfig, type LLMConfig } from './llmConfig';

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  tokensUsed: number;
  latencyMs: number;
  error?: string;
}

/**
 * Rate limiter to prevent overwhelming the API
 */
class RateLimiter {
  private lastRequestTime: number = 0;
  private minDelay: number;

  constructor(minDelayMs: number = 1000) {
    this.minDelay = minDelayMs;
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minDelay) {
      const waitTime = this.minDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter(1000);

/**
 * Call LLM API (single request, no retry)
 */
async function callLLM(
  request: LLMRequest,
  config: LLMConfig,
  bloggerKey?: string
): Promise<LLMResponse> {
  const startTime = Date.now();

  // Determine model to use
  const model = request.model || (bloggerKey ? getModelForBlogger(bloggerKey, config) : 'llama3.1:8b');

  // Build OpenAI-compatible request
  const requestBody = {
    model,
    messages: [
      { role: 'system', content: request.systemPrompt },
      { role: 'user', content: request.userPrompt },
    ],
    temperature: request.temperature ?? 0.8,
    max_tokens: request.maxTokens ?? 600,
  };

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`LLM API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // Extract response
    const content = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;
    const latencyMs = Date.now() - startTime;

    return {
      content,
      model,
      tokensUsed,
      latencyMs,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;

    if (error.name === 'AbortError') {
      throw new Error(`LLM request timeout after ${config.timeout}ms`);
    }

    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      throw new Error('Open Web UI not reachable - is it running?');
    }

    throw new Error(`LLM API call failed: ${error.message}`);
  }
}

/**
 * Call LLM with exponential backoff retry logic
 */
export async function callLLMWithRetry(
  request: LLMRequest,
  bloggerKey?: string
): Promise<LLMResponse> {
  const config = getLLMConfig();

  // Validate config if using real LLM
  if (config.useRealLLM) {
    const validation = validateLLMConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid LLM config: ${validation.errors.join(', ')}`);
    }
  }

  let lastError: Error | null = null;
  const maxRetries = config.retries;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Rate limiting
      await rateLimiter.waitIfNeeded();

      // Attempt API call
      const response = await callLLM(request, config, bloggerKey);

      // Log success
      if (attempt > 0) {
        console.log(`[LLM] Success on retry ${attempt} for blogger ${bloggerKey || 'unknown'}`);
      }

      return response;
    } catch (error: any) {
      lastError = error;

      // Don't retry on validation or config errors
      if (error.message.includes('Invalid LLM config')) {
        throw error;
      }

      // Check if we should retry
      const shouldRetry = attempt < maxRetries && isRetryableError(error);

      if (!shouldRetry) {
        break;
      }

      // Exponential backoff
      const backoffMs = Math.min(1000 * Math.pow(2, attempt), 8000);
      console.warn(`[LLM] Attempt ${attempt + 1} failed for blogger ${bloggerKey || 'unknown'}: ${error.message}. Retrying in ${backoffMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // All retries exhausted
  throw new Error(`LLM API failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Determine if error is retryable
 */
function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Retry on timeouts
  if (message.includes('timeout')) {
    return true;
  }

  // Retry on connection errors
  if (message.includes('econnrefused') || message.includes('fetch failed')) {
    return true;
  }

  // Retry on 5xx server errors
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return true;
  }

  // Retry on rate limits
  if (message.includes('429') || message.includes('rate limit')) {
    return true;
  }

  // Don't retry on 4xx client errors (except 429)
  if (message.includes('400') || message.includes('401') || message.includes('404')) {
    return false;
  }

  // Default: retry
  return true;
}

/**
 * Generate blogger article using LLM
 */
export async function generateBloggerArticleWithLLM(
  bloggerKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ content: string; model: string; tokensUsed: number; latencyMs: number }> {
  const config = getLLMConfig();

  // Check if real LLM is enabled
  if (!config.useRealLLM) {
    throw new Error('Real LLM is disabled. Set USE_REAL_LLM=true in .env.local');
  }

  // Call LLM with retry
  const response = await callLLMWithRetry(
    {
      systemPrompt,
      userPrompt,
      temperature: 0.8, // Higher temperature for creative writing
      maxTokens: 600,   // Enough for 300-500 word articles
    },
    bloggerKey
  );

  return response;
}

/**
 * Test LLM connection (for debugging)
 */
export async function testLLMConnection(): Promise<{ success: boolean; message: string; model?: string }> {
  const config = getLLMConfig();

  if (!config.useRealLLM) {
    return {
      success: false,
      message: 'Real LLM is disabled. Set USE_REAL_LLM=true in .env.local',
    };
  }

  try {
    const response = await callLLM(
      {
        systemPrompt: 'You are a helpful assistant.',
        userPrompt: 'Say "Connection successful" and nothing else.',
        temperature: 0.1,
        maxTokens: 50,
        model: 'llama3.1:8b',
      },
      config
    );

    return {
      success: true,
      message: `Connected to Open Web UI successfully. Model: ${response.model}`,
      model: response.model,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Connection failed: ${error.message}`,
    };
  }
}

/**
 * Get available models from Open Web UI (if API supports it)
 */
export async function getAvailableModels(): Promise<string[]> {
  const config = getLLMConfig();

  if (!config.useRealLLM) {
    return [];
  }

  try {
    const response = await fetch(`${config.baseUrl}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    const models = data.data?.map((m: any) => m.id) || [];
    return models;
  } catch (error: any) {
    console.warn(`[LLM] Failed to fetch available models: ${error.message}`);
    return [];
  }
}
