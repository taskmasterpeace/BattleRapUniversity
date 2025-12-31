# Blogger Model A/B Testing Results

**Date**: November 28, 2025
**Test Script**: `scripts/testBloggerModels.ts`
**Models Tested**: GPT-4o-mini, Llama 3.1 8B, Qwen 2.5 7B
**Bloggers Tested**: Battle Eyez, Algorithm Institute, Coast to Coast Coverage

---

## Executive Summary

All three models successfully generated battle recap articles with appropriate blogger personas. Key findings:

- **Qwen 2.5 7B**: Best overall value (longest articles, cheapest, good structure)
- **GPT-4o-mini**: Most polished and reliable (but 3x more expensive)
- **Llama 3.1 8B**: Middle ground with faster response times

---

## Detailed Results

### GPT-4o-mini (OpenAI)
**Cost**: $0.000150 per article (~3x more than alternatives)
**Performance**:
- Avg word count: 392 words
- Avg response time: 12.2 seconds
- Catchphrase usage: 33%

**Strengths**:
- Most polished prose
- Good structure and flow
- Handles drama/backstage tension well
- Reliable prompt following

**Weaknesses**:
- Most expensive option
- Uses placeholder variables `{{league}}` instead of filling them in

**Sample Quality**: High - professional, engaging, good narrative flow

---

### Llama 3.1 8B (Meta)
**Cost**: $0.000049 per article (~67% cheaper than GPT-4o-mini)
**Performance**:
- Avg word count: 361 words (shortest)
- Avg response time: 11.7 seconds (fastest single response: 3.8s)
- Catchphrase usage: 33%

**Strengths**:
- Very cost effective
- Fast response times
- Decent catchphrase usage

**Weaknesses**:
- Shorter articles (may be too brief for some battle types)
- Uses placeholders `[{{league}}]` extensively
- Less detailed than other models

**Sample Quality**: Medium - functional but less engaging

---

### Qwen 2.5 7B (Alibaba)
**Cost**: $0.000046 per article (cheapest option)
**Performance**:
- Avg word count: 474 words (longest)
- Avg response time: 12.2 seconds
- Catchphrase usage: 33%

**Strengths**:
- Cheapest model
- Longest, most comprehensive articles
- Uses markdown headers (###) for better structure
- Good narrative detail and depth
- Strong catchphrase usage

**Weaknesses**:
- Slightly slower (but not significantly)
- Sometimes overly verbose

**Sample Quality**: High - comprehensive, well-structured, engaging

---

## Recommendations

### Option 1: Qwen 2.5 for All Bloggers (Best Value)
Use `qwen/qwen-2.5-7b-instruct` for all 8 bloggers. This provides:
- Lowest cost ($0.046 per article vs $0.150)
- Longest articles with good detail
- Excellent structure with markdown headers
- Good persona adherence

**Estimated cost for 100 articles**: $4.60

### Option 2: Mixed Strategy (Balanced)
Assign models based on blogger personality:

**Drama/Controversy Bloggers** (need depth and detail):
- `battle_eyez` → **Qwen 2.5 7B** (comprehensive drama coverage)
- `marijuana_piranha` → **Qwen 2.5 7B** (detailed fan voice)
- `coast_to_coast_coverage` → **Qwen 2.5 7B** (cynical depth)

**Technical/Analytical Bloggers** (need precision):
- `algorithm_institute` → **GPT-4o-mini** (polished technical writing)
- `the_battle_breakdown` → **GPT-4o-mini** (professional analysis)

**Quick Coverage Bloggers** (need speed):
- `small_room_report` → **Llama 3.1 8B** (fast, concise coverage)
- `underground_voice` → **Llama 3.1 8B** (raw, unpolished authentic)
- `the_main_stage_herald` → **Llama 3.1 8B** (promotional brevity)

**Estimated cost for 100 articles**: $6.80 (mixed)

### Option 3: GPT-4o-mini for All (Premium Quality)
Use `openai/gpt-4o-mini` for all bloggers if quality is paramount.

**Estimated cost for 100 articles**: $15.00

---

## Issues Detected

### Placeholder Variables
All three models sometimes leave placeholder variables like `{{league}}` or `[{{league}}]` in their output instead of filling them in with actual values. This needs to be addressed in the prompt template.

**Fix**: Update `getBloggerPrompt()` to pass actual league name instead of using placeholders in the user prompt.

### Catchphrase Consistency
Only 33% catchphrase usage across all models is lower than expected. The catchphrases should appear more consistently.

**Fix**: Make the catchphrase requirement more explicit in the system prompt. Consider adding it to the beginning of the user prompt as a reminder.

---

## Current Configuration (.env.local)

```env
BLOGGER_BATTLE_EYEZ_MODEL=openai/gpt-4o-mini
BLOGGER_MARIJUANA_PIRANHA_MODEL=meta-llama/llama-3.1-8b-instruct
BLOGGER_ALGORITHM_INSTITUTE_MODEL=qwen/qwen-2.5-7b-instruct
BLOGGER_SMALL_ROOM_REPORT_MODEL=openai/gpt-4o-mini
BLOGGER_THE_MAIN_STAGE_HERALD_MODEL=meta-llama/llama-3.1-8b-instruct
BLOGGER_UNDERGROUND_VOICE_MODEL=qwen/qwen-2.5-7b-instruct
BLOGGER_COAST_TO_COAST_COVERAGE_MODEL=openai/gpt-4o-mini
BLOGGER_THE_BATTLE_BREAKDOWN_MODEL=meta-llama/llama-3.1-8b-instruct
```

## Recommended Configuration (Option 1: Best Value)

```env
# Use Qwen 2.5 7B for all bloggers (best value)
BLOGGER_BATTLE_EYEZ_MODEL=qwen/qwen-2.5-7b-instruct
BLOGGER_MARIJUANA_PIRANHA_MODEL=qwen/qwen-2.5-7b-instruct
BLOGGER_ALGORITHM_INSTITUTE_MODEL=qwen/qwen-2.5-7b-instruct
BLOGGER_SMALL_ROOM_REPORT_MODEL=qwen/qwen-2.5-7b-instruct
BLOGGER_THE_MAIN_STAGE_HERALD_MODEL=qwen/qwen-2.5-7b-instruct
BLOGGER_UNDERGROUND_VOICE_MODEL=qwen/qwen-2.5-7b-instruct
BLOGGER_COAST_TO_COAST_COVERAGE_MODEL=qwen/qwen-2.5-7b-instruct
BLOGGER_THE_BATTLE_BREAKDOWN_MODEL=qwen/qwen-2.5-7b-instruct
```

## Recommended Configuration (Option 2: Mixed Strategy)

```env
# Drama/controversy bloggers (comprehensive coverage)
BLOGGER_BATTLE_EYEZ_MODEL=qwen/qwen-2.5-7b-instruct
BLOGGER_MARIJUANA_PIRANHA_MODEL=qwen/qwen-2.5-7b-instruct
BLOGGER_COAST_TO_COAST_COVERAGE_MODEL=qwen/qwen-2.5-7b-instruct

# Technical/analytical bloggers (polished writing)
BLOGGER_ALGORITHM_INSTITUTE_MODEL=openai/gpt-4o-mini
BLOGGER_THE_BATTLE_BREAKDOWN_MODEL=openai/gpt-4o-mini

# Quick coverage bloggers (speed and authenticity)
BLOGGER_SMALL_ROOM_REPORT_MODEL=meta-llama/llama-3.1-8b-instruct
BLOGGER_UNDERGROUND_VOICE_MODEL=meta-llama/llama-3.1-8b-instruct
BLOGGER_THE_MAIN_STAGE_HERALD_MODEL=meta-llama/llama-3.1-8b-instruct
```

---

## Next Steps

1. **Fix placeholder variable issue**: Update `newsGenerator.ts` to pass actual values instead of `{{variables}}`
2. **Improve catchphrase consistency**: Strengthen catchphrase requirements in prompts
3. **Choose configuration**: Select Option 1 (best value), Option 2 (balanced), or Option 3 (premium)
4. **Test with real battles**: Run the blogger system with actual tournament results
5. **Monitor quality**: Review generated articles for quality and persona adherence

---

## Test Data Used

**Battle**: Tsunami Wave vs The Comedian
**Result**: The Comedian wins 2-1
**Decision Type**: 2-1 edge
**League**: Small Room Circuit
**Context**: In Building

This battle was chosen because:
- 2-1 decision (most common outcome type)
- Close match (tests ability to capture nuance)
- High-profile battlers with interesting badges
- Good drama potential (Known Choker vs Comedy King)
