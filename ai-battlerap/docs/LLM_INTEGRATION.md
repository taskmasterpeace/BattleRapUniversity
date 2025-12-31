# LLM Integration Guide

## Overview

Battle Rap University uses LLM-powered bloggers to generate realistic battle recap articles. Each of the 8 blogger personalities can use different LLM models via Open Web UI, creating diverse writing styles and perspectives.

## Architecture

### Components

1. **llmConfig.ts** - Configuration management
   - Loads settings from environment variables
   - Validates configuration
   - Maps blogger keys to model names

2. **llmIntegration.ts** - API client
   - OpenAI-compatible API calls to Open Web UI
   - Retry logic with exponential backoff (3 retries max)
   - Rate limiting (1 second between requests)
   - Graceful error handling and fallbacks
   - Timeout handling (30 seconds default)

3. **newsGenerator.ts** - Integration point
   - Modified to call LLM for article generation
   - Automatically selects appropriate blogger based on battle characteristics
   - Falls back to mock templates on LLM failure
   - Maintains backward compatibility with mock mode

### Blogger Selection Logic

The system automatically selects which blogger covers each battle:

- **Upsets** → Pissed Poet (underdog champion)
- **Chokes/Drama** → Battle Eyez (scandal hunter)
- **Classics** → Hype Man (enthusiastic fan)
- **Small room battles** → The Purist (technical critic)
- **Main stage battles** → Marijuana Piranha (street voice)
- **High-rated battlers** → Algorithm Institute (historian)
- **Elite matchups** → Elite Snob (dismissive critic)
- **Everything else** → Balanced Veteran (fair analyst)

## Setup

### 1. Install Open Web UI

```bash
# Using Docker
docker run -d -p 8080:8080 --name open-webui ghcr.io/open-webui/open-webui:main

# Or follow official instructions at https://docs.openwebui.com/
```

### 2. Add Models to Open Web UI

1. Open http://localhost:8080
2. Go to Settings → Models
3. Pull models you want to use:
   - `llama3.1:8b` (fast, good quality)
   - `llama3.1:70b` (slower, higher quality)
   - `mixtral:8x7b` (good for creative writing)
   - Or connect to external APIs (Claude, GPT-4, etc.)

### 3. Get API Key

1. In Open Web UI, go to Settings → Account
2. Generate an API key
3. Copy the key

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Enable real LLM (set to false to use mock generation)
USE_REAL_LLM=true

# Open Web UI connection
OPENWEBUI_BASE_URL=http://localhost:8080
OPENWEBUI_API_KEY=your_api_key_here

# LLM settings
LLM_TIMEOUT_MS=30000
LLM_RETRIES=3

# Model assignments per blogger
BLOGGER_BATTLE_EYEZ_MODEL=llama3.1:8b
BLOGGER_MARIJUANA_PIRANHA_MODEL=mixtral:8x7b
BLOGGER_ALGORITHM_INSTITUTE_MODEL=llama3.1:70b
BLOGGER_THE_PURIST_MODEL=llama3.1:8b
BLOGGER_HYPE_MAN_MODEL=llama3.1:8b
BLOGGER_BALANCED_VETERAN_MODEL=llama3.1:70b
BLOGGER_PISSED_POET_MODEL=mixtral:8x7b
BLOGGER_ELITE_SNOB_MODEL=llama3.1:70b
```

### 5. Test Integration

```bash
npm run test:llm
# or
npx ts-node scripts/test-llm-integration.ts
```

## Usage

### Mock Mode (Default)

When `USE_REAL_LLM=false`, the system uses template-based article generation:

```typescript
// In .env.local
USE_REAL_LLM=false
```

- No external API calls
- Fast and reliable
- Uses predefined templates
- Good for development/testing

### Real LLM Mode

When `USE_REAL_LLM=true`, the system calls Open Web UI:

```typescript
// In .env.local
USE_REAL_LLM=true
OPENWEBUI_BASE_URL=http://localhost:8080
OPENWEBUI_API_KEY=your_api_key
```

- Generates unique, creative articles
- Uses different models per blogger
- Automatically falls back to mock on failure
- Rate-limited to avoid overwhelming API

### Programmatic Usage

```typescript
import { generateBloggerArticleWithLLM } from '@/lib/services/llmIntegration';
import { getBloggerPrompt } from '@/lib/game/bloggerPrompts';

// Get blogger prompt
const { systemPrompt, userPrompt } = getBloggerPrompt('battle_eyez', {
  battler_a: 'Lyric',
  battler_b: 'Blaze',
  winner: 'Lyric',
  verdict: '2-1',
  league: 'Small Room Circuit',
  round_summary: '...',
  // ... other battle data
});

// Generate article
const response = await generateBloggerArticleWithLLM(
  'battle_eyez',
  systemPrompt,
  userPrompt
);

console.log(response.content); // Generated article
console.log(response.tokensUsed); // Token count
console.log(response.latencyMs); // Response time
```

## Error Handling

The system is designed to be resilient:

### Automatic Fallback

If LLM generation fails, the system automatically falls back to mock generation:

```
[NewsGen] LLM generation failed: Open Web UI not reachable. Falling back to mock generation.
```

### Retry Logic

Transient errors are automatically retried with exponential backoff:

- **Timeout errors**: Retry up to 3 times
- **Connection errors**: Retry with increasing delays
- **5xx server errors**: Retry
- **Rate limits**: Wait and retry
- **4xx client errors**: No retry (except 429)

### Rate Limiting

Requests are rate-limited to 1 per second to avoid overwhelming the API.

## Troubleshooting

### "Open Web UI not reachable"

**Problem**: Cannot connect to Open Web UI

**Solutions**:
1. Check if Open Web UI is running: `docker ps`
2. Verify `OPENWEBUI_BASE_URL` in `.env.local`
3. Test connection: `curl http://localhost:8080/v1/models`

### "Model not available"

**Problem**: Requested model doesn't exist in Open Web UI

**Solutions**:
1. Check available models in Open Web UI UI
2. Pull the model: Settings → Models → Pull
3. Use a different model in `.env.local`
4. Set fallback model: `llama3.1:8b`

### "LLM request timeout"

**Problem**: Request took longer than `LLM_TIMEOUT_MS`

**Solutions**:
1. Increase timeout in `.env.local`: `LLM_TIMEOUT_MS=60000`
2. Use a faster model (e.g., `llama3.1:8b` instead of `70b`)
3. Check Open Web UI performance

### "Invalid API key"

**Problem**: API key is incorrect or missing

**Solutions**:
1. Generate new API key in Open Web UI
2. Update `OPENWEBUI_API_KEY` in `.env.local`
3. Ensure no extra spaces in the key

### Articles still using templates

**Problem**: Real LLM mode not activating

**Solutions**:
1. Check `USE_REAL_LLM=true` in `.env.local`
2. Restart Next.js server after changing env vars
3. Check console logs for "[NewsGen] Using mock article generation"

## Performance Considerations

### Token Usage

Each article generation uses approximately:
- **Input tokens**: 200-400 (system + user prompt)
- **Output tokens**: 300-500 (article length)
- **Total**: ~500-900 tokens per article

### Latency

Typical generation times:
- **llama3.1:8b**: 2-5 seconds
- **llama3.1:70b**: 10-20 seconds
- **mixtral:8x7b**: 5-10 seconds
- **External APIs** (Claude, GPT-4): 3-8 seconds

### Rate Limits

- Built-in: 1 request per second
- Configurable via `RateLimiter` class
- External APIs may have their own limits

## Model Recommendations

### For Development

```env
# Fast and cheap - all bloggers use llama3.1:8b
BLOGGER_BATTLE_EYEZ_MODEL=llama3.1:8b
BLOGGER_MARIJUANA_PIRANHA_MODEL=llama3.1:8b
# ... etc
```

### For Production Quality

```env
# High-quality models for diverse voices
BLOGGER_BATTLE_EYEZ_MODEL=claude-opus        # Drama/investigation
BLOGGER_MARIJUANA_PIRANHA_MODEL=mixtral-8x7b # Street voice
BLOGGER_ALGORITHM_INSTITUTE_MODEL=gpt-4      # Historical analysis
BLOGGER_THE_PURIST_MODEL=claude-sonnet-3.5   # Technical critique
BLOGGER_HYPE_MAN_MODEL=llama3.1:70b          # Enthusiastic
BLOGGER_BALANCED_VETERAN_MODEL=claude-sonnet-3.5  # Balanced
BLOGGER_PISSED_POET_MODEL=mixtral-8x7b       # Cynical edge
BLOGGER_ELITE_SNOB_MODEL=gpt-4               # Dismissive critique
```

### For Budget-Conscious

```env
# Mix of fast and quality
BLOGGER_BATTLE_EYEZ_MODEL=llama3.1:8b
BLOGGER_MARIJUANA_PIRANHA_MODEL=llama3.1:8b
BLOGGER_ALGORITHM_INSTITUTE_MODEL=llama3.1:70b  # Only heavy for historian
BLOGGER_THE_PURIST_MODEL=llama3.1:8b
BLOGGER_HYPE_MAN_MODEL=llama3.1:8b
BLOGGER_BALANCED_VETERAN_MODEL=llama3.1:70b     # Only heavy for balanced
BLOGGER_PISSED_POET_MODEL=llama3.1:8b
BLOGGER_ELITE_SNOB_MODEL=llama3.1:8b
```

## API Compatibility

The integration uses OpenAI-compatible API format, which means it works with:

- ✅ Open Web UI (primary target)
- ✅ Ollama (with Open Web UI wrapper)
- ✅ Any OpenAI-compatible endpoint
- ✅ LiteLLM proxy
- ✅ LocalAI

Just change `OPENWEBUI_BASE_URL` to point to your endpoint.

## Future Enhancements

Potential improvements:

1. **Streaming responses** - Real-time article generation
2. **Multiple articles per battle** - Different bloggers cover same battle
3. **Article quality scoring** - Regenerate if quality is low
4. **A/B testing** - Compare LLM vs mock articles
5. **Custom fine-tuned models** - Train models on battle rap corpus
6. **Dynamic model selection** - Choose model based on battle importance

## Support

For issues or questions:
1. Check console logs for error messages
2. Test with `npm run test:llm`
3. Verify Open Web UI is accessible
4. Review this guide's troubleshooting section
