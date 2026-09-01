# Media System — Podcasts & Video (modular, tagged)

**Status:** design + placeholder layer, 2026-09-01. Owner steer: *"don't worry about the creation of the podcast yet — lock down the things that can happen, the verbiage, how it's written, so it can feed creation later. Everything modular. Tag what podcasts talk about → a central hub AND a 'podcasts about you' view; you can hear about other players."*

## The idea

A podcast/video is **not** a hardcoded episode. It's a **composition of modular TOPIC BLOCKS**, each tagged. That gives us a browsable, filterable media world today and a clean input for real audio/video generation later.

## The pieces

- **`lib/game/media/podcastTopics.ts`** — the taxonomy: every "thing that can happen" a podcast discusses (THE UPSET, THE CHOKE, THE PAPERWORK/snitch, THE PEN QUESTION/ghostwriter, THE WASHED TALK, THE DUCKING TALK, THE CROSSOVER, THE COMEBACK, THE VILLAIN, THE CALLOUT, THE RANKINGS, THE GATEKEEPER, THE STREAK, THE VET, THE ERA…). Each block carries:
  - **tags** — what it's ABOUT (filter/routing),
  - **slots** — who it's about (`{winner}`/`{loser}`/`{subject}`/`{rival}`/`{city}`/`{score}`),
  - **headlines[] + takes[]** — the verbiage variants (how it's written; fills slots; **never invents bars**),
  - **weight** — story size (drives the episode lead + duration).
  This file IS "the things that can happen." Add topics here to expand what the media world can say.
- **`lib/game/media/mediaGenerator.ts`** — the composer. `composeEpisode({topicIds, subjects, slots})` builds a TAGGED episode from blocks. `mediaFromBattle(ctx)` picks the battle's topic by story shape and **modularly adds a reputation block** when an involved battler carries a mapped label (e.g. loser is WASHED → a WASHED TALK segment gets composed in). Every item is tagged with:
  - **subjects** — `{battlerId, name, role}` → powers the "about you" view + profile drill-down,
  - **topicTags** — → powers the hub filters.

## The surfaces (design)

- **The Feed** — central hub: every podcast/video in the culture, filter by ALL / **★ ABOUT YOU** / any topic tag. As you play you hear about *other* battlers; click a subject → their profile.
- **On a battler's page** — "podcasts about them" = feed filtered to their `battlerId`.

Mock: `public/media-mock.html` (local, untracked — regenerate from `mediaFromBattle` over a set of battles).

## Deliberately deferred

- **Creation** (real audio/video, LLM scripts) — the topic verbiage is the *input* to that; not built yet.
- **Persistence + wiring** — a `media_items` rail (like `news_articles`) storing composed items with their subject/tag columns; generated in the post-battle pipeline; surfaced on The Feed + battler pages. Needs the DB up to build/playtest. The world already has podcast *narrative* in `lib/game/worldEvents/templates.ts` — media items are the watchable/listenable layer on top of that + the newsroom.

## Why modular

New topics, new verbiage, new tags all slot in without touching the composer or the hub. When real audio arrives, it consumes the same tagged blocks — no rebuild.
