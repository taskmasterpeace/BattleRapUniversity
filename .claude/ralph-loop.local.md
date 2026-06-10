---
active: false
iteration: 1
max_iterations: 50
completion_promise: "OVERNIGHT-COMPLETE"
started_at: 2026-05-20
completed_at: 2026-05-20
completion_signal_emitted: true
---

# Ralph Loop: Battle Rap University Overnight Evaluation

You are acting as **lead game designer** for the Battle Rap University project at `D:/git/battlerapuniversity`.

The user went to sleep. They want a clean baseline, working game, and design decisions teed up for tomorrow morning. You have full autonomy within the rules below.

## Key Facts (carried forward across iterations)

- **Active codebase**: `D:/git/battlerapuniversity/ai-battlerap/` (NOT root)
- **Root `/app/`, `/components/`, `/lib/`, `/styles/`, `/contexts/`, `/scripts/`, `/tools/`, `/supabase/`** = v0.dev prototype (delete, NOT the same as ai-battlerap/)
- **The game IS multi-tenant** (database has user_id + RLS) — many users sign in, each has own battler, all fight shared AI roster. NOT PvP yet.
- **Time system** exists but model is unclear — design doc needed, do NOT pick a model
- **Game balance** was recently tuned (Tru Foe validation, 7% choke rate). DO NOT modify `lib/game/config.ts` or `lib/game/badges.ts` balance values.

## Phases (check file state each iteration to determine where you are)

### Phase 1: Cleanup
- [ ] Delete v0 prototype: root `/app/`, `/components/`, `/lib/`, `/styles/`, `/contexts/`, `/scripts/`, `/tools/`, `/supabase/`, `/public/`, root `package.json` + `next.config.mjs` + `tsconfig.json` + `tailwind.config.*` + `postcss.config.*` + `components.json` + `node_modules/` + `pnpm-lock.yaml` + `package-lock.json`
- [ ] Delete root-level V0_*.md, V2_*.md, *_SPEC.md, *_PROPOSAL.md, *_REPORT.md, *_COMPLETE.md, *_SUMMARY.md, *_CHECKLIST.md, *_HANDOFF*.md, BLOCKER_*.md, BUG_*.md, CRITICAL_*.md, PHASE_*.md, EDGE_CASE_*.md, OVERNIGHT_*.md, TEST_*.md, IMPLEMENTATION_*.md (except CLAUDE.md, README.md, files in KEEP list below)
- [ ] Delete root `test-results/`, root `test-badge.ts`, root `font-comparison.html`, root `claude-resume.bat`, root `proxy.ts`, root `raw images/`
- [ ] Delete inside ai-battlerap/: `test-results/` (40+ stale JSONs), all root-level *_REPORT.md, *_COMPLETE.md, *_SUMMARY.md, *_CHECKLIST.md, PHASE_*.md, BLOCKER_*.md, BUG_*.md, screenshot-*.png, dev.log, dev-server.log, *.sh helper scripts, test-*.sql files
- [ ] **KEEP** at root: CLAUDE.md, README.md (rewrite), Attributes Badges.txt, Game Doc Skeliton.txt, Doc1.txt, Doc2.txt, New Text Document.txt, Instruxctions.txt, .claude/, .git/, .gitignore, ai-battlerap/
- [ ] **KEEP** in ai-battlerap/: README.md, QUICKSTART.md, LOCAL_SETUP.md, GAMEPLAY_GUIDE.md, KNOWN_ISSUES.md, BATTLER_STRATEGY_GUIDE.md, PROGRESSION_SYSTEM.md, package.json, all source dirs (app/, lib/, components/, supabase/migrations/, tests/, e2e/, public/, scripts/)
- [ ] Move/consolidate: scattered docs at ai-battlerap root → `ai-battlerap/docs/legacy/` (if you don't want to delete them outright)
- [ ] Commit: `chore: remove v0 prototype and stale documentation snapshots`

**Verify**: `D:/git/battlerapuniversity/app` does not exist; `git status` is clean.

### Phase 2: Get it running
- [ ] Verify Docker Desktop is running (`docker ps` or `docker info`); if not, document in OVERNIGHT_REPORT.md and skip to Phase 4
- [ ] `cd ai-battlerap && npm install`
- [ ] `npm run supabase:start` then `npm run supabase:reset`
- [ ] `npm run build` — capture errors
- [ ] `npm run dev` in background
- [ ] Use Playwright to navigate /onboarding, /dashboard, /battle/offers, /media, /leagues, /tournaments, /badges, /life-events, /finances, /notifications — screenshots to `ai-battlerap/docs/screenshots/`
- [ ] Document broken pages, 500s, missing routes in `ai-battlerap/docs/PLAYTEST_FINDINGS.md`

**Verify**: `ai-battlerap/docs/PLAYTEST_FINDINGS.md` exists with at least 5 screenshot references.

### Phase 3: Fix what's broken
- [ ] Fix any build errors found in Phase 2
- [ ] Fix lint errors (`npm run lint -- --fix` if available)
- [ ] Fix obvious bugs from `ai-battlerap/KNOWN_ISSUES.md` where root cause is clear (skip ambiguous ones)
- [ ] Run test suites: `npm run test:simulation`, `npm run test:balance`, `npm run test:comprehensive-choke`
- [ ] Commit each fix as separate conventional commit

**Verify**: `npm run build` exits 0.

### Phase 4: Design docs for tomorrow
- [ ] `ai-battlerap/docs/STATE_OF_THE_GAME.md` — definitive doc: genre, multi-tenant architecture, attribute system, leagues, badges (97), life events, simulation engine, AI roster, what works, what's stubbed
- [ ] `ai-battlerap/docs/MULTIPLAYER_DESIGN.md` — current multi-tenant state explained + 3 PvP options (sync battles, async challenges, league seasons) with pros/cons/effort estimate for each — user picks tomorrow
- [ ] `ai-battlerap/docs/TIME_SYSTEM_DESIGN.md` — analyze `lib/dev/timeManipulation.ts` + `lib/services/battleOffers.ts` + battle `scheduled_at` usage; present 3 options: real-time clock, accelerated tick (e.g., 1 real hour = 1 game day), session-based — user picks tomorrow
- [ ] Rewrite root `README.md` — short, points to ai-battlerap as the app, reflects multi-tenant career sim genre
- [ ] Commit docs

**Verify**: all 3 new design docs exist; root README.md is < 100 lines and accurate.

### Phase 5 (CONDITIONAL): Asset generation
- IF `D:/git/battlerapuniversity/.env.local.assets` exists:
  - Read service + API key
  - Generate 5 sample battler portraits per archetype (Street, Technical, Aggressive, Comedic, Storyteller)
  - Save to `ai-battlerap/public/sprites/samples/{archetype}/`
  - Write `ai-battlerap/docs/ASSET_SAMPLES.md` with index for user review
- ELSE: write `ai-battlerap/docs/PHASE_5_ASSET_GENERATION_READY.md` — plan, prompt templates, service options (ad-lab reuse path, OpenAI, Gemini imagegen via installed skill), budget tiers

### Completion criteria
- All 4 phases verifiable via file checks
- `ai-battlerap/docs/OVERNIGHT_REPORT.md` written with:
  - What was deleted (count + categories)
  - Build/test results
  - Screenshots index
  - Bugs fixed (commit refs)
  - Decisions needed from user (numbered, top 5 only)
  - Blockers encountered
- Output: `<promise>OVERNIGHT-COMPLETE</promise>`

## Hard Rules
1. DO NOT `git push` to remote
2. DO NOT modify `lib/game/config.ts` or `lib/game/badges.ts` balance constants
3. DO NOT build PvP system or pick time model — document choices, user picks
4. DO NOT delete CLAUDE.md, ai-battlerap/CLAUDE.md if present, original `.txt` design docs at root
5. Use conventional commits, NO "Co-Authored-By" lines (per global CLAUDE.md)
6. After 3 stuck iterations on same blocker → document it, move on
7. Check `D:/git/battlerapuniversity/.env.local.assets` each iteration (user may drop API key during the night)

## Continuation Strategy
- Use `ScheduleWakeup` at end of each context-heavy iteration to continue
- Each wake-up: check phase state via file/git, resume next uncompleted item
- Stop only on `<promise>OVERNIGHT-COMPLETE</promise>` or iteration cap
