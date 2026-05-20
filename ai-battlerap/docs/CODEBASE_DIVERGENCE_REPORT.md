# Codebase Divergence Report

**Status:** ⚠️ DECISION REQUIRED FROM USER
**Date:** 2026-05-20
**Audience:** Project owner (read this first thing in the morning)

## TL;DR

The repo has **two parallel app trees** that both contain real, recent work. The earlier overnight plan called for deleting the root `/app/`, `/lib/`, `/supabase/` as a "v0 prototype" — **that would have destroyed ~27 newer migrations and several unique features** (career, regions, venues, blogger pages, atomic battle results, origin system, storyline chains, etc.).

**I stopped before deleting.** I need you to pick a canonical tree.

## What I found

### Two trees, same git ancestry

Both `D:\git\battlerapuniversity\` (root) and `D:\git\battlerapuniversity\ai-battlerap\` were last touched in commit `54a606b` (Ralph loop implementation) — meaning they have a *shared history*, not a "prototype vs real" split. They diverged organically over several feature commits.

### Migration divergence

| Tree | Migration count | Latest migration |
|------|------:|------|
| `supabase/migrations/` (root) | **79** | `20251224000003_fix_battle_progression_unique.sql` |
| `ai-battlerap/supabase/migrations/` | **52** | `20251212000000_fix_prize_distribution.sql` |

**Shared:** First 52 migrations (001 → 20251212000000) are byte-identical (or near it).

**Only in root** (27 migrations — all dated Dec 2025, after ai-battlerap stopped getting updates):

- `20251201100000_fix_news_article_types`
- `20251203100000_add_user_roles`
- `20251203200000_add_social_features`
- `20251204100000_add_battler_regions`
- `20251204110000_add_battler_city_id_and_regions`
- `20251204200000_add_league_booking_system`
- `20251205200000_assign_real_badges`
- `20251207000000_add_origin_system` ⭐ (referenced in CLAUDE.md as a core game concept)
- `20251207152934_seed_starter_crews`
- `20251207200000_league_financial_system_overhaul`
- `20251208000000_add_storyline_chains`
- `20251208010000_seed_storyline_templates`
- `20251209000000_add_battler_state_system`
- `20251210000000_fix_storyline_template_code`
- `20251210100000_add_career_days_system` ⭐
- `20251210110000_seed_career_exposed_storyline`
- `20251211000000_seed_secret_generating_templates`
- `20251211100000_rename_battlers_tougher_names`
- `20251211100000_add_manager_history_system`
- `20251211120000_add_portrait_columns`
- `20251211130000_add_missing_prep_tables`
- `20251212000001_add_battler_demographics`
- `20251212000002_seed_female_battlers`
- `20251224000000_add_battle_progression_rls`
- `20251224000001_atomic_battle_results`
- `20251224000002_atomic_counter_operations`
- `20251224000003_fix_battle_progression_unique`

**Only in ai-battlerap:** none. (ai-battlerap is a strict subset.)

### App route divergence

| Route | Only in root | Only in ai-battlerap |
|---|---|---|
| `/(dashboard)/` route group | ✓ | |
| `/blogger/[id]` | ✓ | |
| `/career/history` | ✓ | |
| `/regions/[id]` | ✓ | |
| `/venues/[id]` | ✓ | |
| `/dashboard` (flat) | | ✓ |
| `/finances` | | ✓ |
| `/notifications` | | ✓ |
| `/relationship`, `/relationships` | | ✓ |
| `/settings` | | ✓ |

### Lib divergence

| Path | Only in root | Only in ai-battlerap |
|---|---|---|
| `lib/all-badges.ts` | ✓ | |
| `lib/animations.tsx` | ✓ | |
| `lib/api-client.ts`, `lib/api-types.ts` | ✓ | |
| `lib/battle-flyers.ts` | ✓ | |
| `lib/bloggers.ts` | ✓ | |
| `lib/cities.ts`, `lib/city-backdrops.ts` | ✓ | |
| `lib/sprite-system.ts` | ✓ | |
| `lib/storyline-images.ts` | ✓ | |
| `lib/round-crafting.ts` | ✓ | |
| `lib/testing/` | ✓ | |
| `lib/hooks/`, `lib/models/`, `lib/services/`, `lib/thrones/`, `lib/types/` | | ✓ |

### Package divergence

| | Root (`my-v0-project`) | ai-battlerap |
|---|---|---|
| Framework | Next 15 + Radix-heavy v0.dev stack | Next 16 + lean stack |
| State libs | Many Radix primitives | `@tanstack/react-query` |
| Test runner | Custom `scripts/run-tests.ts` | Jest + Playwright + tsx runners |
| Supabase scripts | None at root | Full `supabase:start/stop/reset` flow |
| AI/LLM | Not at root | LLM integration scripts (`test:llm`) |

## How this happened (my best read)

Looking at the migration timeline, here's what likely happened:

1. **Phase A:** `ai-battlerap/` was built first as the "proper" Next 16 app with full Supabase setup.
2. **Phase B (mid Dec 2025):** You exported a v0.dev snapshot to the root (`my-v0-project`) to iterate on UI faster.
3. **Phase C (late Dec 2025):** Significant *new* features (origin system, career days, regions, venues, blogger, atomic battles, storyline chains) were built only in the root tree.
4. **Phase D (~5 months gap):** Project went dormant.
5. **Phase E (now, 2026-05-20):** You came back and CLAUDE.md still describes the ai-battlerap-centric architecture, but root has the freshest features.

CLAUDE.md confirms (B): *"Origin System: Three origin paths that shape your starting attributes..."* — but `lib/game/` referenced in CLAUDE.md only exists fully in **ai-battlerap**, while origin migrations exist only in **root**. The docs and code drifted apart.

## Decision matrix

You must pick **one** of these. I will not pick for you because it's destructive either way.

### Option 1: ai-battlerap is canonical, port root features in

**Effort:** Medium-High. ~27 migrations to port + ~5 routes + several lib modules.
**Pros:**
- Cleaner, modern stack (Next 16, React 19, Tailwind 4, Jest, Playwright)
- LLM integration scaffolding already there
- Better tested (validation runners, test:simulation, test:balance)
- Matches what CLAUDE.md says is the active codebase
**Cons:**
- Real porting work. Some migrations reference tables that may not exist in ai-battlerap exactly.
- Risk of bugs during port.
- v0.dev UI components in root get dropped — would need rebuilding in Tailwind 4 without Radix.

**Recommended if:** You want to ship a polished V1. The ai-battlerap architecture is more maintainable.

### Option 2: Root is canonical, retire ai-battlerap

**Effort:** Low-Medium. Move root's `app/`, `lib/`, `supabase/` to be the only tree; archive ai-battlerap.
**Pros:**
- Newest features (origin, career, storyline) already wired up
- Less migration work
- v0.dev UI is already styled
**Cons:**
- v0.dev-style code (lots of generated Radix primitives) is harder to maintain
- Loses Playwright/Jest setup
- Loses LLM integration scripts
- Next 15 vs ai-battlerap's Next 16 (minor downgrade)
- Loses the cleaner `lib/hooks`, `lib/models`, `lib/services` separation
- CLAUDE.md would need rewriting

**Recommended if:** You want to demo working features tomorrow and don't care about test infra.

### Option 3: Merge — best of both, in ai-battlerap

**Effort:** High. Bring root migrations + features into ai-battlerap, drop root v0 UI.
**Pros:**
- One canonical tree going forward
- Keep ai-battlerap's testing/LLM/clean architecture
- Keep root's feature set
**Cons:**
- Most expensive option
- Migration ordering needs careful review (some root migrations may conflict with ai-battlerap's later state)

**Recommended if:** You're willing to spend ~1-2 days on consolidation before any new feature work.

## My recommendation

**Option 3 (merge into ai-battlerap)** is the right long-term call. ai-battlerap has the better foundation for shipping. The root tree's value is in its migrations and feature designs, not its code itself (v0.dev code is replaceable; migrations encode game design decisions).

A pragmatic path:
1. **Day 1 (next session):** Port root migrations 27 missing ones into `ai-battlerap/supabase/migrations/`. Verify `supabase:reset` runs clean.
2. **Day 2:** Port the unique routes (career history, regions, venues, blogger) — rebuild UI in ai-battlerap's Tailwind 4 style, but reuse data models.
3. **Day 3:** Delete root `/app/`, `/lib/`, `/supabase/`, `package.json`, etc. — only after migration is complete and you've smoke-tested.
4. **Day 4:** Update root CLAUDE.md to reflect ai-battlerap as the sole app.

**Do NOT delete root until you've actively decided which path.**

## What I did NOT do

- ❌ Did **not** delete root `/app/`, `/lib/`, `/supabase/` (the earlier overnight plan called for this — would have destroyed your newer work)
- ❌ Did **not** delete root `package.json`, `next.config.mjs`, `tsconfig.json` (same reason)
- ❌ Did **not** delete `raw images/` (these are the style references for asset generation — see ART_DIRECTION.md)
- ❌ Did **not** delete the original `.txt` design docs at root (CLAUDE.md says keep them)

## What I DID safely delete

(See OVERNIGHT_REPORT.md for the count and categories.)

- Stale markdown snapshots at root (V0_*.md, *_REPORT.md, *_COMPLETE.md, etc.) — these were status snapshots, not source of truth.

Source of truth always = the code + migrations.
