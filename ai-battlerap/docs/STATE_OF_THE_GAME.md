# State of the Game — Battle Rap University

**As of 2026-05-20.** Read this first thing tomorrow morning.

## What kind of game is this, actually?

**Genre:** Multi-tenant battle rap career simulation.

- **Not single-player** — the database has `auth.users` + `battlers.user_id` + RLS policies. Many users can sign up, each owns their own battler. They all fight a shared roster of AI opponents.
- **Not PvP yet** — no human-vs-human battles exist in the code. The architecture *supports* PvP (battlers can be non-AI, RLS distinguishes ownership), but no flow connects two human battlers to a battle. See `MULTIPLAYER_DESIGN.md` for the path.
- **Not MMORPG** — there's no shared world, no real-time anything, no PvP combat. Each player progresses in parallel through the same AI roster, with shared rankings and shared media articles.

**Closest analogues:** Football Manager (career sim, statistical battles) crossed with WWE 2K career mode (multi-tenant rosters with rivalries) plus a battle-rap-specific media layer (AI-generated blog recaps, ELO rankings, badge progression).

## Architecture at a glance

```
┌──────────────────────────────────────────────────────┐
│  ai-battlerap/  ← canonical app (Next 16, React 19)  │
│                                                       │
│  app/                  → Next App Router routes      │
│   ├ onboarding/        → battler creation wizard     │
│   ├ dashboard/         → player home                 │
│   ├ battle/[id]/       → battle flow                 │
│   │   ├ prep/          → 7-day prep calendar         │
│   │   ├ round/[n]/     → in-battle decisions         │
│   │   └ control/       → live battle viewer          │
│   ├ tournaments/       → league tournaments          │
│   ├ leagues/[id]/      → league throne system        │
│   ├ relationship/      → rivalry/grudge UI           │
│   ├ life-events/       → personal event resolution   │
│   ├ media/             → AI-generated articles       │
│   ├ finances/          → bookings, payouts           │
│   ├ notifications/     → player alerts               │
│   └ api/               → Next API routes             │
│                                                       │
│  lib/                  → game engine + services      │
│   ├ game/              → simulation, progression,    │
│   │                      config, badges (97 defined) │
│   ├ services/          → battle offers, news gen     │
│   ├ models/            → typed model wrappers        │
│   ├ thrones/           → league throne logic         │
│   ├ hooks/             → React data hooks            │
│   └ dev/               → time manipulation, dev mode │
│                                                       │
│  supabase/             → 52 migrations, 1 seed       │
└──────────────────────────────────────────────────────┘
```

## Core systems status

| System | Status | Notes |
|---|---|---|
| Auth + RLS | ✅ Built | Auto-login `dev@test.com` in dev mode |
| Onboarding | ✅ Built | Attribute allocation, origin, primary league, style tags |
| Battle offers | ✅ Built | AI generates offers via `/api/internal/generate-battle-offers` |
| Prep calendar (7 day) | ✅ Built | Daily focus: research/writing/performance/life/rest |
| Battle simulation | ✅ Built | Segment-based; produces avg/peak/consistency/crowd-reaction |
| In-battle decisions | ✅ Built | `round/[n]/select` flow for content choices per round |
| Round content selections | ✅ Built | Player picks badges/angles per round |
| Choke/stumble system | ✅ Tuned | 7% avg choke, 46% known-choker, 40% stumble rates (validated) |
| Attribute progression | ✅ Built | `lib/game/progression.ts` — auto-runs after each battle |
| Badge system | ⚠️ Half | 97 badges defined; earning logic designed (see proposal docs); UI partial |
| XP/Level system | ⚠️ Designed | Spec in `XP_AND_LEVEL_SYSTEM_DESIGN.md`, not implemented |
| Life events | ✅ Built | Triggers + templates wired; choice-based events |
| Stress stat | ✅ Built | Migration 007 |
| Rivalries / grudges | ✅ Built | Migration 20251127, relationship state machine |
| Tournament system | ✅ Built | Single tournament seeded, judges + stats |
| Tournament fans / fan views | ✅ Built | Mig 20251129190000 |
| News generation | ✅ Built | LLM recaps stored in `news_articles` |
| Leagues + thrones | ✅ Built | Multi-tier league progression with throne battles |
| Notifications | ✅ Built (table) | UI page exists, flow unclear |
| Finances / payments | ✅ Built | Migration 20251125060000 |
| Time/economy/cities | ✅ Built | Migration 20251125030000 |
| Time system (gameplay) | ⚠️ Ambiguous | See `TIME_SYSTEM_DESIGN.md` — needs you to pick |
| PvP / human-vs-human | ❌ Not built | See `MULTIPLAYER_DESIGN.md` for options |
| Asset library | ✅ 1632 sprites | See `ART_DIRECTION.md` |

## Attribute system

**1-10 scale**, grouped into:

- **Writing:** Lyricism, Wordplay, Creativity, Flow
- **Performance:** Stage Presence, Crowd Control, Delivery
- **Personal:** Financial Stability, Reputation, Family Bond, Preparation
- **Defense:** Resilience (choke avoidance), Believability (mig 20251128140000)

Progression tiers: Low (1-3), Mid (4-6), Top (7-9), God (10).

## Battle simulation contract

**Input:** 2 battler records + league config + prep blocks + content selections per round.

**Output:** per-segment scores → per-round summaries (avg/peak/consistency/crowd reaction) → battle verdict (best 2 of 3).

**Key flag:** `choke` boolean per segment. Triggered probabilistically based on resilience + prep + badge effects. Choking = 85% score penalty for that segment (effectively un-winnable round).

**Stumble** is a softer version: 15% penalty, more frequent, doesn't necessarily lose the round.

**Critical constants** (DO NOT modify without re-validation):
```
CHOKE_BASE_PROBABILITY   = 0.015
CHOKE_MINIMUM            = 0.007
CHOKE_SCORE_MULTIPLIER   = 0.15
STUMBLE_BASE_PROBABILITY = 0.050
STUMBLE_SCORE_MULTIPLIER = 0.85
PREP_EFFECT_MULTIPLIER   = 0.25
```

## Known issues / debt

1. **Two parallel codebases.** See `CODEBASE_DIVERGENCE_REPORT.md`. Root has 27 newer migrations + 5 unique routes. Pick canonical tree.
2. **PostBattleSummary component unused** (per CLAUDE.md) — built but not wired into battle results page.
3. **Some pages still light-themed** — `app/battle/offers/page.tsx`, `app/media/page.tsx`, `app/media/[slug]/page.tsx` use `bg-white` instead of the dark theme.
4. **No opponent stats in offers** — accept without scouting.
5. **Time model ambiguous** — see `TIME_SYSTEM_DESIGN.md`.
6. **Docker required for local dev** — Supabase doesn't start without Docker Desktop running. Documented at top of `LOCAL_SETUP.md` (or similar).

## What I would build next, if you asked

In order of "ship most value per day":

1. **Resolve codebase divergence** (1-2 days). You can't iterate confidently on two trees.
2. **Pick a time model** (decision + 1 day to implement). Currently everything is loosely tied to real time with dev-mode fast-forward — fine for offline play, broken for multi-tenant.
3. **PostBattleSummary wire-up** (1 day). High-impact UX with code already written.
4. **Asynchronous PvP challenges** (3-5 days). Simplest path to "real" multiplayer — see `MULTIPLAYER_DESIGN.md` Option B.
5. **Badge earning hook** (2 days). Spec is in `BADGE_SYSTEM_REDESIGN_PROPOSAL.md`. The 120 badge sprites are already there.

## Files I'd point a new contributor to

| Question | File |
|---|---|
| How does the game balance work? | `ai-battlerap/lib/game/config.ts` |
| What's a badge effect? | `ai-battlerap/lib/game/badges.ts` |
| How does battle simulation calculate scores? | `ai-battlerap/lib/game/simulation.ts` |
| How does attribute progression work? | `ai-battlerap/lib/game/progression.ts` |
| How is dev-mode time controlled? | `ai-battlerap/lib/dev/timeManipulation.ts` |
| How is the AI roster generated? | `ai-battlerap/supabase/migrations/20251128120000_replace_with_realistic_battlers.sql` |
| What's the badge taxonomy? | `Attributes Badges.txt` (root), `ai-battlerap/public/sprites/NAMING_GUIDE.md` |
| How are battle offers generated? | `ai-battlerap/lib/services/battleOffers.ts` |
| What are the validation tests? | `ai-battlerap/lib/game/comprehensiveSystemValidation.ts` |
