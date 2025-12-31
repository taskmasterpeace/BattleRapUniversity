# LLM Integration - Quick Start Guide

## 5-Minute Setup

### Step 1: Install Open Web UI (2 minutes)

```bash
docker run -d -p 8080:8080 --name open-webui ghcr.io/open-webui/open-webui:main
```

Wait for container to start, then open http://localhost:8080

### Step 2: Setup Open Web UI (1 minute)

1. Create an account (first user becomes admin)
2. Go to Settings → Models
3. Pull a model (e.g., `llama3.1:8b` for fast testing)
4. Go to Settings → Account → Generate API Key
5. Copy the API key

### Step 3: Configure Environment (1 minute)

```bash
# Copy example to .env.local
cp .env.example .env.local

# Edit .env.local
USE_REAL_LLM=true
OPENWEBUI_BASE_URL=http://localhost:8080
OPENWEBUI_API_KEY=your_api_key_here

# All bloggers default to llama3.1:8b (good for testing)
BLOGGER_BATTLE_EYEZ_MODEL=llama3.1:8b
BLOGGER_MARIJUANA_PIRANHA_MODEL=llama3.1:8b
BLOGGER_ALGORITHM_INSTITUTE_MODEL=llama3.1:8b
BLOGGER_THE_PURIST_MODEL=llama3.1:8b
BLOGGER_HYPE_MAN_MODEL=llama3.1:8b
BLOGGER_BALANCED_VETERAN_MODEL=llama3.1:8b
BLOGGER_PISSED_POET_MODEL=llama3.1:8b
BLOGGER_ELITE_SNOB_MODEL=llama3.1:8b
```

### Step 4: Test Connection (1 minute)

```bash
npm run test:llm
```

Expected output:
```
✓ Connected to Open Web UI successfully
✓ Article generated successfully!
```

### Step 5: Run Battle Simulation

```bash
npm run test:playtest
```

Check the generated articles in `test-results/playtest-articles-*.md`

## That's It!

You now have:
- ✅ LLM-powered blogger articles
- ✅ 8 distinct blogger personalities
- ✅ Automatic fallback to mock templates
- ✅ Intelligent blogger selection per battle

## Quick Troubleshooting

### Problem: "Open Web UI not reachable"
```bash
# Check if container is running
docker ps | grep open-webui

# If not running, start it
docker start open-webui
```

### Problem: "Model not available"
```bash
# Pull the model in Open Web UI
# Settings → Models → Pull "llama3.1:8b"
```

### Problem: "Invalid API key"
```bash
# Generate new key in Open Web UI
# Settings → Account → API Keys → Generate
```

## Switch Back to Mock Mode

```bash
# In .env.local
USE_REAL_LLM=false
```

No restart needed - system will automatically use mock templates.

## Advanced: Use Different Models

```bash
# In .env.local - example with diverse models
BLOGGER_BATTLE_EYEZ_MODEL=claude-opus
BLOGGER_MARIJUANA_PIRANHA_MODEL=mixtral:8x7b
BLOGGER_ALGORITHM_INSTITUTE_MODEL=gpt-4
BLOGGER_THE_PURIST_MODEL=llama3.1:70b
BLOGGER_HYPE_MAN_MODEL=llama3.1:8b
BLOGGER_BALANCED_VETERAN_MODEL=claude-sonnet-3.5
BLOGGER_PISSED_POET_MODEL=mixtral:8x7b
BLOGGER_ELITE_SNOB_MODEL=gpt-4
```

Note: External models (Claude, GPT-4) require API keys configured in Open Web UI.

## Documentation

- Full guide: `docs/LLM_INTEGRATION.md`
- Implementation details: `docs/LLM_INTEGRATION_SUMMARY.md`
- Code: `lib/services/llmIntegration.ts`

## Support Commands

```bash
# Test LLM connection
npm run test:llm

# Run playtest with LLM articles
npm run test:playtest

# Check Open Web UI logs
docker logs open-webui

# Restart Open Web UI
docker restart open-webui
```
