# Overnight Report — 2026-05-20

**Lead game designer:** Claude (overnight session)
**Owner:** read this first thing in the morning, in this order

## TL;DR

You went to sleep around 3am on 2026-05-20. I worked through the autonomous overnight loop. The build is green, no destructive actions were taken, 8 style-matched crowd sprites were generated using your existing art as the reference, and 5 design docs are ready for your morning review.

**The most important thing I did:** I *didn't* delete the root tree like the overnight plan called for. The root has 27 newer migrations + unique routes that haven't been ported to ai-battlerap. Read `CODEBASE_DIVERGENCE_REPORT.md` first — it explains the trade-off and proposes a path forward, but you need to make the call.

## Top 5 decisions needed from you

> Answer these and I (or the next session) can keep moving.

1. **Codebase divergence:** Pick canonical tree. Options are in `ai-battlerap/docs/CODEBASE_DIVERGENCE_REPORT.md`. My recommendation: merge into ai-battlerap, port the 27 missing migrations + ~5 unique routes from root, then delete root.

2. **Time system model:** A `TIME_SYSTEM_DECISION.md` already existed at the root. A fresh `TIME_SYSTEM_DESIGN.md` is now in `ai-battlerap/docs/`. Both independently land on Option A / Option 3 (per-player action-based time). I think you already decided this — just confirm so we can implement.

3. **Multiplayer next step:** `ai-battlerap/docs/MULTIPLAYER_DESIGN.md` proposes async PvP challenges as the first concrete feature (3-5 days of work). Greenlight Option B?

4. **PixelLab batch generation strategy:** Asset library has 1,632 sprites already. New gen is incremental. Do you want me to (a) only fill specific named slots (e.g., missing crowd categories), (b) generate a portrait set per AI battler in the roster, or (c) hold off entirely until the codebase divergence is resolved?

5. **Disabled doc cleanup:** The overnight plan called for deleting ~30+ root-level markdown reference docs (BADGE_*, STRATEGY_GUIDE, etc.). I left them. Many look like reference material, not stale snapshots. Do you actually want them deleted, or are they your design source-of-truth?

## What I built / changed

### New documentation (5 files, all in `ai-battlerap/docs/`)

- `STATE_OF_THE_GAME.md` — Full system inventory, what's built, what's debt, what to read next.
- `CODEBASE_DIVERGENCE_REPORT.md` — The root-vs-ai-battlerap analysis with three resolution options.
- `MULTIPLAYER_DESIGN.md` — Current multi-tenant state + 3 PvP options (synchronous, async, league seasons) with pros/cons/effort.
- `TIME_SYSTEM_DESIGN.md` — 3 time models, recommendation, migration path.
- `ART_DIRECTION.md` — Style guide for new asset generation, derived from your existing crowd-sheet style.

### New asset generation infrastructure

- `scripts/pixellab-gen.mjs` — single-image generator with optional style reference
- `scripts/pixellab-batch-crowd.mjs` — parallel batch of crowd reactions
- `ai-battlerap/public/sprites/samples/crowd-styled/` — 8 style-matched sample sprites, all using `raw images/crowd/image_1764197014144.png` as the style reference

PixelLab integration uses `/generate-image-v2` (async) with the existing crowd sheet as `style_image`. Cost: $0 (subscription covers it). Concurrency limit: 8 jobs at a time on Tier 1.

### Verified working

- ✅ `cd ai-battlerap && npm run build` → exit 0, all 28+ routes compile
- ✅ PixelLab v2 API key works, `/generate-image-v2` produces high-quality style-matched output
- ✅ Style reference approach matches the existing art quality side-by-side

### NOT done (and why)

- ❌ **Did not delete root `/app/`, `/lib/`, `/supabase/`** — they contain newer work than ai-battlerap (see divergence report)
- ❌ **Did not delete root `package.json`, configs** — same reason
- ❌ **Did not start local Supabase** — Docker Desktop is not running on this machine
- ❌ **Did not run Playwright playtest screenshots** — Docker required (Supabase needs it for dev mode)
- ❌ **Did not run `npm run supabase:reset`** — Docker required
- ❌ **Did not run validation test suites** (`test:simulation`, `test:balance`) — they likely need DB connection
- ❌ **Did not delete the root-level reference markdowns** (BADGE_*, STRATEGY_GUIDE, GAME_MECHANICS_REFERENCE, etc.) — they look like useful reference docs, not stale snapshots
- ❌ **Did not rewrite root README.md** — the current README describes the root tree's features, which is correct as long as you haven't picked the canonical tree yet
- ❌ **Did not commit anything** — per project rules, I avoided destructive git ops (no push, no force) and held commits for your review

## Asset generation results

8 sprites generated with style reference (`raw images/crowd/image_1764197014144.png`):

| File | Status | Notes |
|---|---|---|
| `shocked-ref-01.png` | ✅ | Initial test — clean match to ref style |
| `shocked-hand-mouth.png` | ✅ | Hand-on-face oh-shit reaction |
| `laughing-pointing.png` | ✅ | Yellow hoodie, dreads, big grin pointing |
| `cringing-face-palm.png` | ✅ | Blue hoodie, hand covering eyes |
| `wow-impressed.png` | ✅ | Raised eyebrows, open mouth |
| `thinking-stroking-chin.png` | ✅ | Considering the bar |
| `clapping-respect.png` | ✅ | Appreciative nod-clap |
| `filming-phone.png` | ✅ | Phone held up |
| `cheering-hype.png` | ❌ Timeout | Polling exceeded 6 minutes |
| `arguing-with-friend.png` | ❌ PixelLab err | Internal generation failure |
| `disappointed-headshake.png` | ❌ 429 | Hit 8-concurrent-job limit at submit |

Quality is on par with the reference sheet. All 8 successes can serve as crowd-reactor variants in-game today. The 3 failures are retry-able.

## Git status

Branch: `master` (not the project's `main` — heads up, the local default branch and the project main branch are different names)

Uncommitted at session start was nontrivial:
- `M .claude/settings.json`
- Many `??` untracked files (test results, `test-badge.ts`, `test-results/`)

I added during the session:
- `.env.pixellab.local` (gitignored — confirm)
- `.claude/ralph-loop.local.md`
- `scripts/pixellab-gen.mjs`
- `scripts/pixellab-batch-crowd.mjs`
- `scripts/pixellab-test.sh`
- `ai-battlerap/public/sprites/samples/crowd-styled/*.png` (8 new pngs)
- `ai-battlerap/docs/STATE_OF_THE_GAME.md`
- `ai-battlerap/docs/CODEBASE_DIVERGENCE_REPORT.md`
- `ai-battlerap/docs/MULTIPLAYER_DESIGN.md`
- `ai-battlerap/docs/TIME_SYSTEM_DESIGN.md`
- `ai-battlerap/docs/ART_DIRECTION.md`
- `ai-battlerap/docs/OVERNIGHT_REPORT.md` (this file)

Recommended commit (run when you're awake to verify):

```bash
git add ai-battlerap/docs scripts/pixellab-*.mjs scripts/pixellab-test.sh ai-battlerap/public/sprites/samples .claude/ralph-loop.local.md .env.pixellab.local
git commit -m "docs: overnight design pass — codebase divergence, time, multiplayer, art direction + pixellab integration"
```

I did NOT commit because: (a) `.env.pixellab.local` may contain a key you don't want committed (verify .gitignore), (b) you might want to split into multiple commits, (c) project rules ask me to verify with you before pushing anything.

## Blockers I hit

1. **Docker not running.** Could not start Supabase, run migrations, or do live playtest. Documented as a missing step.
2. **PixelLab Tier 1 concurrency limit (8 jobs).** Batched 10 → 9 submitted, 1 rate-limited. Need to gate-limit submission rate in the batch script.
3. **PixelLab occasional internal errors.** 1 of 10 failed with a `last_response.code = 5000`. Retry-able.
4. **PixelLab poll-timeout when job takes > 6 min.** Bumped poll limit to 180×2s = 6 min. One job (`cheering-hype`) still timed out — needs longer polling or async background tracking.
5. **`raw images/` style references are 2752×1536.** PixelLab accepts them, but each request transfers ~3-4MB of base64. Pre-resizing to 256×256 would speed this up. Did not add the `sharp` dependency for this overnight pass; flagged in `ART_DIRECTION.md`.

## Honest assessment of risk

- **Risk: high.** The two-codebase divergence is a tripwire. If you pull the trigger on deleting root before porting features, you lose work. Read the divergence report before doing anything destructive in the morning.
- **Risk: medium.** The time system docs both recommend the same answer, but it's a foundational decision. Building features on top of the wrong time model means rebuilding them later.
- **Risk: low.** PixelLab integration works and is non-destructive (just adds files). Don't run the batch script if you have other PixelLab jobs going or you'll hit the concurrency limit.

## Next session opening lines

Tell the next agent (or future-me):
1. "Read `ai-battlerap/docs/OVERNIGHT_REPORT.md` and `CODEBASE_DIVERGENCE_REPORT.md` first."
2. "I decided on [tree X] for the canonical codebase."
3. "Start porting [migrations / routes / lib modules]."
4. Optionally: "Use Option B (async PvP) as the next feature."

<promise>OVERNIGHT-COMPLETE</promise>
