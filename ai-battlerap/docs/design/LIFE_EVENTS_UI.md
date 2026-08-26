# LIFE EVENTS UI v2.1 — Design Spec

**Status:** Build-ready spec · 2026-08-26 · rev 2.1 (critic pass applied)
**Owner verdicts driving this redesign:**
1. List screen is "very unattractive" — a wall of identical gray cards.
2. Decision screen's effects list is good, BUT attributes (financial stability etc.) need VISUAL meters showing current → projected value per choice.
3. The tiny category emoji chip is meaningless ("that collar shot, I don't know what that is") — replace with real per-category art.

**Critic fixes folded into this revision:**
- The payoff no longer dies on a redirect — an on-screen **aftermath beat** (§3.8) replaces the dashboard-toast exit.
- Per-template art is now **launch content**, not an empty registry (§1.2.1) — plus a critical-severity variant per category.
- Major/critical resolutions **echo into the media hub** as real `news_articles` (§3.9).
- A one-page **copy voice guide** (§7) governs template text, with an audit task on existing seeds; the "career is on pause" honesty bug is fixed (§2.3).
- Build nits closed: compilable `CATEGORY_STYLES` type (§5.1), `firstSentence()` defined (§5.6), named meter keyframes + stagger (§5.7), canonical token mapping declared once (§0.5).
- List screen gets **alive-ness**: new-since-last-visit treatment, stakes preview on critical rows, count-badge parity with the dashboard widget (§2.5).

**Quality bar:** CK3 event window (see `research-reference-games.md` §2). An event is a *scene* — art, stakes, a choice with teeth, and an on-screen consequence — never a notification row, and never a toast.

**Project laws honored throughout:** no generated bars/lyrics · no purple anywhere · winner is not paid more (no money framing on outcomes beyond flat effects) · players never type text · house dark theme.

---

## 0. Diagnosis of Current Screens

### `app/life-events/page.tsx` (list)
- Every pending event renders as the same `bg-[#2d2f35]` card: title + date + description + orange button. No category signal, no art, no severity, no grouping. This is exactly the "text rows with an OK button" failure mode called out in the reference-games brief (§P1).
- Date is a raw `toLocaleDateString()` afterthought in `text-zinc-600`.
- Empty state is a lone 🧘 emoji — okay copy, weak visual.

### `components/battler/LifeEventResolutionClient.tsx` (decision)
- Effects render as **text strings** (`+1 Reputation`) — correct data, zero visual weight. The player cannot see *where* Financial Stability sits now or where it lands after the choice.
- Category chip is a small emoji (💼/🏠/📰/💰/❤️) — the "collar shot" the owner cannot read. Emojis are hereby banned as category identity; real art only.
- **LAW VIOLATION:** the `relationship` category maps to `purple-500` (`EVENT_CATEGORIES.relationship` in `LifeEventResolutionClient.tsx` lines 43–49). Must be replaced in this work (new palette below). (`components/ui/StatBar.tsx` also ships a `purple` color option — flag for a follow-up sweep; not required here.)
- Choices are labeled "Choice A / Choice B" — dead labels. The choice *text* is the identity; lead with it.
- **The climax is a toast.** On success the client redirects to `/dashboard?event_resolved=…` and the dashboard shows a toast. The most consequential moment in the loop — "what did my call actually do?" — happens off-screen. CK3 never leaves the event window for the payoff; neither do we (§3.8).

### Data reality (what already exists — minimal schema work for v2.1)
`life_event_templates` already has: `category` (`career|personal|scandal|financial|relationship`), `severity` (`minor|moderate|major|critical`), `rarity` (`common|uncommon|rare|epic|legendary`), `icon_emoji` (deprecated by this spec), `choice_a_text/effects`, `choice_b_text/effects`, `trigger_type`, `trigger_probability` (added in `20251123070000_reduce_event_trigger_rates.sql`).
`battler_life_events` has: `status`, `triggered_at`, `battle_id`, `details_json` (battle_result, outcome, choked, win_streak).
`battler_attributes` has: `writing{lyricism,wordplay,creativity,flow}`, `performance{stage_presence,crowd_control,delivery}`, `personal{financial_stability,reputation,family_bond,preparation}`, `resilience`, `public_knowledge` — all the "current value" data the meters need.
**The resolve route already returns the aftermath data.** `app/api/life-events/[id]/resolve/route.ts` lines 133–179 build and return `outcome.attributeChanges` as `Record<key, { before, after, change }>` plus `effects`, `eventTitle`, `category`. The aftermath beat (§3.8) consumes this response as-is — no API change needed for actual-value animation.
**The media layer already exists.** `news_articles` (migration `003_news_and_life_events.sql`) has a `type` check that already includes `'scandal'` and `'career_update'`, and `lib/services/newsGenerator.ts` already has the blogger-memory pipeline (`selectBloggerForStory`, `recordBloggerCoverage`, article insert at line 473). §3.9 wires life events into it.

---

## 0.5 Canonical Theme Tokens (declare once, stop forking the theme)

The in-game shell shipped with a hex palette that visually matches — but does not literally reuse — the CLAUDE.md zinc/orange Tailwind tokens. **This table is the single source of truth for the mapping.** Specs and components for in-game screens use the hex column (it matches every shipped screen); the Tailwind column documents the design-system role so the next spec doesn't fork the theme again.

| Role | In-game hex (canonical for game screens) | CLAUDE.md token equivalent |
|---|---|---|
| Page background | `#18191c` | `bg-zinc-950` |
| Card / panel | `#2d2f35` | `bg-zinc-900` |
| Border / track | `#3a3d44` | `border-zinc-800` |
| Accent | `#ff8c42` (hover `#ff9d5c`) | `orange-500` / `orange-400` |
| Text primary / secondary | `text-zinc-100` / `text-zinc-400`–`500` | same (text tokens are used literally) |

Rule: never mix the two systems in one component — a game-screen component uses `bg-[#2d2f35] border-[#3a3d44]` shells with zinc *text* classes, exactly as every shipped screen does. Any future spec that needs these values references this section instead of restating hex codes.

---

## 1. Category System (color + art, replaces the emoji chip)

### 1.1 Category palette — static class map, NO purple

Define once in `lib/content/eventArt.ts` (§5.1) and consume everywhere. Tailwind JIT requires **static full class strings** — never interpolate color names.

| Category | Accent | Tailwind classes (edge / text / tint bg / border) | Vibe |
|---|---|---|---|
| `career` | House orange `#ff8c42` | `bg-[#ff8c42]` / `text-[#ff8c42]` / `bg-[#ff8c42]/10` / `border-[#ff8c42]/40` | The grind, bookings, league politics |
| `financial` | Emerald | `bg-emerald-500` / `text-emerald-400` / `bg-emerald-500/10` / `border-emerald-500/40` | Money, deals, sponsorships |
| `scandal` | Red | `bg-red-500` / `text-red-400` / `bg-red-500/10` / `border-red-500/40` | Exposure, beef, controversy |
| `personal` | Sky | `bg-sky-500` / `text-sky-400` / `bg-sky-500/10` / `border-sky-500/40` | Health, mental, the lab, self |
| `relationship` | Rose | `bg-rose-400` / `text-rose-400` / `bg-rose-400/10` / `border-rose-400/40` | Family, crew, partners |

Rose (`#fb7185`, hue ≈355) replaces the banned purple for `relationship` — it is red-family, not magenta/violet, and stays visually separated from scandal's harder `red-500` because relationship surfaces always pair rose with the softer `/10` tint and never use the danger treatments (§1.3).

### 1.2 Per-category art (the content-engine registry)

Real pixel art, same pipeline as the 1,632 existing sprites (PixelLab, **always pass the existing crowd sheet as style reference**; dimensions get a new `EVENT_ART` section in `docs/CANVAS_SIZES.md` — that doc is the sizing authority).

Two crops per category, a critical-severity variant per category, plus per-template overrides:

```
public/sprites/events/
  career-thumb.png        512×512   (list thumbnail crop)
  career-header.png       1280×512  (decision-screen banner, safe zone: center 60%)
  career-header-critical.png        (same scene, harder grade — §1.2.2)
  financial-thumb.png     financial-header.png     financial-header-critical.png
  scandal-thumb.png       scandal-header.png       scandal-header-critical.png
  personal-thumb.png      personal-header.png      personal-header-critical.png
  relationship-thumb.png  relationship-header.png  relationship-header-critical.png
  quiet.png               512×512   (empty state, §2.4)
  templates/              (per-template art, keyed by template code — §1.2.1)
    CHOKE_EVENT-thumb.png
    CHOKE_EVENT-header.png
    ...
```

Art direction per category (scene subjects, not symbols — this is what kills the "collar shot" problem):
- **career** — a stage-side hallway: flyers on the wall, a camera rig case (every battle is filmed), venue door light spilling in.
- **financial** — a fanned booking envelope on a folding table, contract pages, a chain half out of a box.
- **scandal** — phone screens lighting a dark room, blog headline glow, pointing silhouettes.
- **personal** — the lab: desk lamp, notebook stack, energy-drink cans, dawn out the window.
- **relationship** — a stoop / kitchen table scene, two figures mid-conversation, warm interior light.

Registry resolution order (implemented in `lib/content/eventArt.ts`): **template-specific art → critical variant (if `severity === 'critical'`) → category art → nothing renders emoji, ever.** `icon_emoji` in the DB is dead; do not read it.

#### 1.2.1 Launch art set — per-template art is DAY-ONE CONTENT, not an empty map

Category fallback alone means the third scandal of a career shows the exact same phone-glow scene as the first two — the CK3 comparison collapses on repetition. The `TEMPLATE_ART` registry therefore ships **populated at launch** for the 12 most frequently hit templates. The seeded roster (`006_seed_choice_based_life_event_templates.sql`) is 16 templates; battle-outcome triggers fire most often (`trigger_probability` 0.10–0.25 per qualifying battle, and every battle qualifies for one of the outcome templates), so the launch set is:

| Priority | Template code | Scene brief (distinct from its category fallback) |
|---|---|---|
| 1 | `CHOKE_EVENT` | battler frozen alone in the hot spotlight, head bowed, hand to his face, crowd silhouettes turned away — NO microphone (league battle rap is acapella; nobody holds a mic but the host) |
| 2 | `CLOSE_VICTORY` | split crowd — half hands up, half arms crossed, judges' table lit |
| 3 | `NARROW_LOSS` | backstage mirror, towel over shoulders, scorecard on the counter |
| 4 | `DOMINANT_VICTORY` | crowd surge toward the stage, phones up, opponent walking off frame |
| 5 | `BODYBAG_HYPE` | blog headline collage glow, replay clip frozen on a screen |
| 6 | `RIVAL_CALLOUT` | phone held up mid-video, name-drop caption visible as shapes (no readable bars) |
| 7 | `MEDIA_INTERVIEW` | podcast table, two mics, ring light, host mid-lean |
| 8 | `FINANCIAL_CRISIS` | stacked envelopes, calculator, booking-fee page face down |
| 9 | `CHOKE_IN_BIG_BATTLE` | premier-stage rig from behind the curtain, dropped cue cards |
| 10 | `CAREER_CRISIS` | empty venue after teardown, one work light, folded chairs |
| 11 | `FAMILY_WEDDING` | dressed-up hallway moment, garment bag, phone buzzing with the booking |
| 12 | `BAD_LOSS` | rain outside a venue's back door, flyer with the player's name half-torn |

Rules:
- Each brief must read as its **moment**, not its category — a player who has seen the category fallback should instantly register "this is different art."
- No readable text in any art (headlines/captions are shape-and-glow only) — art can never smuggle in bars or fake slang.
- Remaining 4 seeded templates (`CONTROVERSIAL_LOSS`, `INJURY_MINOR`, `TRAINING_PARTNER`, `VENUE_CHANGE`) fall back to category art at launch; add them in the first content patch. Every NEW template authored after this spec ships with its own art — no template lands in the DB without a `TEMPLATE_ART` entry or an explicit fallback sign-off.
- Thumb + header per template (24 assets), generated in the same PixelLab batch as the category set. This is content, not code — it does not block the component workstream (§5.5).

#### 1.2.2 Critical-severity art variants

Critical events must *look* critical before a word is read. Each category gets one `-header-critical` variant: **same scene, harder grade** — darker sky/room, red-shifted rim light, one destabilizing detail (career: the venue door shut; scandal: many more phone screens; financial: the table cleared; personal: the lamp off, screen glow only; relationship: one figure walking out of frame). Resolution order in `getEventArt` (§5.1) prefers template art over the critical variant — a template-specific scene already carries its own weight.

### 1.3 Severity + rarity treatments (the "not identical" engine)

| Signal | Treatment |
|---|---|
| `minor` | Base card. Severity tag `text-zinc-500`. |
| `moderate` | Severity tag `text-yellow-500`. |
| `major` | Severity tag `text-[#ff8c42]`; card edge bar widens 2px→3px. |
| `critical` | Severity tag `text-red-500`; card gets `ring-1 ring-red-500/40` + slow pulse on the edge bar (`animate-pulse` on the edge div only, not the card); header art uses the critical variant (§1.2.2); stakes preview line renders (§2.5.2). Sorted to top. |
| `rarity: epic/legendary` | Gold frame accent: `border-yellow-500/50` on the thumbnail + small `RARE MOMENT` plate in `text-yellow-500`. This is the CK3 "special = gold" language (P4). Applied sparingly by data, never by default. |

Danger/red and special/gold are the only two "flag" colors — players learn the language in one session.

---

## 2. List Screen Redesign — `app/life-events/page.tsx`

### 2.1 Layout (desktop ≥768px)

```
┌──────────────────────────────────────────────────────────────┐
│ ← DASHBOARD                                    VIEW HISTORY →│
│ LIFE EVENTS                                                  │
│ 3 DECISIONS WAITING · NOBODY MAKES THESE CALLS BUT YOU       │
├──────────────────────────────────────────────────────────────┤
│ ▌DECIDE NOW (2)                                              │  ← section header, only if any major/critical
│ ┌─┬────────┬─────────────────────────────────────────┬────┐ │
│ │█│ [ART]  │ ● NEW  SCANDAL · CRITICAL    2 DAYS AGO │  → │ │
│ │█│ 96×96  │ BLOG POST GOES VIRAL                    │    │ │
│ │█│ thumb  │ A blogger clipped your green-room…      │    │ │
│ │█│        │ ⚠ REPUTATION · PUBLIC KNOWLEDGE ON THE LINE│  │ │  ← stakes preview, critical only
│ │█│        │ ⚑ after battle vs RAW PROPHET           │    │ │
│ └─┴────────┴─────────────────────────────────────────┴────┘ │
│ ▌WHEN YOU'RE READY (1)                                       │  ← moderate/minor
│ ┌─┬────────┬─────────────────────────────────────────┬────┐ │
│ │█│ [ART]  │ FINANCIAL · MODERATE           TODAY    │  → │ │
│ ...                                                          │
└──────────────────────────────────────────────────────────────┘
```

Anatomy of a row (`EventListRow`):
1. **Category edge bar** — full-height 3px div, category accent color. First thing the eye reads; five categories = five instantly different cards.
2. **Art thumbnail** — 96×96 (`w-24 h-24`), `object-cover`, from the registry (§1.2). Thumbnail sits on `bg-[#18191c]` with `border-2 border-[#3a3d44]`; epic/legendary swaps to gold border.
3. **Meta line** — optional `● NEW` tick (§2.5.1), then `CATEGORY · SEVERITY` in category text color + severity color, `text-[11px] font-display font-black uppercase tracking-wider`; relative date right-aligned (§2.2).
4. **Title** — `text-lg md:text-xl font-display font-black uppercase tracking-tight text-zinc-100`.
5. **Hook line** — `firstSentence(template.description)` (§5.6), `text-sm text-zinc-400`, `line-clamp-1` (`line-clamp-2` on mobile). Never the full paragraph — the decision screen owns the copy.
6. **Stakes preview** (critical only) — §2.5.2.
7. **Context flag** (conditional) — if `event.battle_id`: `⚑ AFTER BATTLE VS {STAGE_NAME}` in `text-xs text-zinc-500 uppercase tracking-wide`. If `details_json.choked`: append `· CHOKED` in `text-red-400`.
8. **Chevron / CTA** — whole row is the link (`<Link>` wraps the card); right-aligned `→` in category color, `min-h-[44px]` guaranteed. No separate "MAKE DECISION" button — the row IS the button (kills the identical-orange-button repetition).

Row shell: `bg-[#2d2f35] border-2 border-[#3a3d44] hover:border-{category}/50 transition group` + `group-hover:translate-x-0.5` on the chevron. Rows stack with `space-y-3`.

**History rows** (resolved list / VIEW HISTORY): same anatomy minus stakes preview, plus the world-echo link when one exists (§3.9): `THE BLOGS PICKED THIS UP →` in `text-xs text-[#ff8c42] uppercase tracking-wide`, linking to `/media/{slug}`.

### 2.2 Urgency / date treatment
- Relative time, uppercase, right-aligned in the meta line: `TODAY`, `YESTERDAY`, `{n} DAYS AGO` (use virtual time via existing `lib/dev/timeManipulation` helpers when computing "now").
- ≥5 days old and unresolved: date turns `text-yellow-500` with prefix `WAITING {n} DAYS` — the world moves without you (TEW neglect principle) without inventing a hard expiry the backend doesn't have.
- Critical events additionally pulse (§1.3) regardless of age.

### 2.3 Grouping + honest header copy
Two fixed sections, in order — no tabs, no filters at this event volume:
1. **DECIDE NOW** — `severity in (critical, major)`, critical first, then by `triggered_at` ascending (oldest debt first).
2. **WHEN YOU'RE READY** — `moderate, minor`, newest first.

Section headers: `▌` category-neutral orange tick (`border-l-4 border-[#ff8c42] pl-3`) + `text-sm font-display font-black uppercase tracking-wider text-zinc-300` + count in `text-zinc-500`. A section with zero events does not render. If ALL events are one section, still show that one header (it explains the sort).

Header sub-line replaces the current plain count: `“{n} DECISIONS WAITING · NOBODY MAKES THESE CALLS BUT YOU”` — `text-sm text-zinc-400 font-display font-bold uppercase tracking-wide`.

**Honesty rule (was a bug in rev 2.0):** the previous draft said "YOUR CAREER IS ON PAUSE UNTIL YOU ANSWER" — a lie: the backend has no gate, no expiry, and battles keep flowing whether events are answered or not. Copy must never claim mechanics that don't exist. The pressure language we're allowed: ownership ("nobody makes these calls but you"), age ("WAITING {n} DAYS", §2.2), and severity (DECIDE NOW section name). If a real career-pause gate is ever built, it ships with its own spec; until then any copy implying a gate is a review-blocking defect.

### 2.4 Empty state
Replace the 🧘 emoji with art: a dedicated `quiet.png` (512×512, same pipeline — the lab at night, open rhyme book on the desk, empty chair) rendered at `w-32 h-32 mx-auto opacity-80`.
- Headline (keep): `ALL QUIET OUTSIDE THE BOOTH`
- Body (keep): `No pending life events — battles, win streaks, and chokes can trigger new ones.`
- Two CTAs side by side: `SEE RESOLVED EVENTS` (ghost, existing style) + `BACK TO DASHBOARD` (ghost). Shell unchanged: `bg-[#2d2f35] border-2 border-[#3a3d44] p-10 md:p-16 text-center`.

### 2.5 Alive-ness (the list must not read as a static queue)

#### 2.5.1 New-since-last-visit
- Client-side, zero schema: on list mount, read `localStorage['bru:life-events:last-seen']` (ISO string; compare against `triggered_at`; use virtual "now" when writing). Rows with `triggered_at > lastSeen` render a `● NEW` tick at the head of the meta line — 6px orange dot + `NEW` in `text-[11px] text-[#ff8c42] font-display font-black tracking-wider`.
- Write the new last-seen value on unmount/`visibilitychange` (not on mount — the player should see the NEW ticks for the whole visit).
- Implementation: the list page stays a server component; each row gets `data-triggered-at`, and a small client component `NewSinceVisit` (wraps the rows' container) applies the tick. First-ever visit (no key): no ticks (everything being NEW is the same as nothing being NEW).

#### 2.5.2 Stakes preview (critical rows only)
One line under the hook: `⚠ {LABELS} ON THE LINE` — `text-xs text-red-400 font-display font-black uppercase tracking-wider`.
- Derivation: union of effect keys across `choice_a_effects` + `choice_b_effects`, filtered through `VISIBLE_EFFECT_KEYS` (§5.2), mapped to labels, deduped, max 3 (then `+ MORE`). Example: `⚠ REPUTATION · PUBLIC KNOWLEDGE ON THE LINE`.
- **No hidden-layer leak by construction:** the whitelist filter means `controversy_risk`/echo/unknown keys can never appear here; no values, no directions — only *which* visible dials are in play. Critical-only keeps the treatment scarce (red stays a flag color, §1.3).

#### 2.5.3 Count parity with the dashboard widget
- The list header count, the DECIDE NOW/WHEN YOU'RE READY section counts, and the `PendingLifeEventsWidget` badge on the dashboard must all derive from the same definition: `battler_life_events` where `status = 'pending'` for the player's battler. No divergent filters, ever — a widget saying 3 and a list showing 2 kills trust in the inbox.
- Widget upgrade (small, in-scope): badge turns red when any pending event is `critical` (same signal as the list's DECIDE NOW section); otherwise house orange. Follow-up (out of scope): reuse `EventListRow` inside the widget.

---

## 3. Decision Screen Redesign — `app/life-events/[id]/page.tsx` + new client

### 3.1 Structure (desktop)

```
┌──────────────────────────────────────────────────────────────┐
│ [CATEGORY HEADER ART 1280×512, h-48 md:h-64, object-cover]   │
│ [gradient scrim: from-transparent to-[#18191c]]              │
│ [category edge: 4px bottom bar in accent color]              │
│   ┌ CATEGORY PLATE ┐ ┌ SEVERITY PLATE ┐ ┌ RARE MOMENT? ┐    │  ← bottom-left, over scrim
│   EVENT TITLE (font-display font-black tracking-tighter,     │
│                text-3xl md:text-5xl, on the scrim)           │
├──────────────────────────────────────────────────────────────┤
│ ⚑ TRIGGERED AFTER BATTLE VS RAW PROPHET · L 1-2 · CHOKED     │  ← context strip (conditional)
│                                                              │
│ Event copy — template.description, text-lg text-zinc-300,    │
│ leading-relaxed, max-w-2xl. THE SCENE. No effects here.      │
│                                                              │
│ MAKE YOUR CALL ──────────────────────────────                │
│ ┌───────────────────────────┐ ┌───────────────────────────┐  │
│ │ CHOICE CARD A             │ │ CHOICE CARD B             │  │
│ │ “Own it on the podcast”   │ │ “Let the lawyers talk”    │  │  ← choice_x_text IS the heading
│ │ ─────────────────────────  │ │                           │  │
│ │ REPUTATION        6 → 7 ▲ │ │ REPUTATION       6 → 5 ▼  │  │
│ │ ██████▮▯▯▯  (meter)       │ │ █████▮▯▯▯▯                │  │
│ │ FINANCIAL STAB.   4 → 3 ▼ │ │ FINANCIAL STAB.  4 → 6 ▲  │  │
│ │ ███▮▯▯▯▯▯▯                │ │ ████▮▮▯▯▯▯                │  │
│ │ [+10% PUBLIC KNOWLEDGE]   │ │ [+1 WRITING PREP · NEXT]  │  │  ← non-meter chips
│ └───────────────────────────┘ └───────────────────────────┘  │
│                                                              │
│            [ CONFIRM: “OWN IT ON THE PODCAST” ]              │  ← confirm echoes the choice text
│   This call is final. It shapes your attributes and what     │
│   comes next.                                                │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Header art (`EventArtHeader`)
- `relative h-48 md:h-64 overflow-hidden border-b-4` with category border color.
- `<img>` from registry (template art if present, else critical variant if `severity === 'critical'`, else category header art), `absolute inset-0 w-full h-full object-cover`, pixel art gets `style={{ imageRendering: 'pixelated' }}`.
- Scrim: `absolute inset-0 bg-gradient-to-t from-[#18191c] via-[#18191c]/40 to-transparent`.
- Plates row + title live in `absolute bottom-0 left-0 right-0 p-4 md:p-6 max-w-4xl mx-auto`.
- **Plates** (`EventCategoryPlate`): rectangle, not chip — `px-3 py-1 border-2 text-xs font-display font-black uppercase tracking-wider` in category tint/border/text classes. Severity plate same shape, `bg-[#18191c]/80` + severity text color. NO emoji anywhere on this screen.
- Keep the existing top nav bar above the art (BATTLE RAP UNIVERSITY | Life Event · Back to Dashboard) unchanged.

### 3.3 Context strip
Only when data exists (`event.battle` or `details_json` keys): one horizontal strip `bg-[#2d2f35] border-2 border-[#3a3d44] px-4 py-3 flex flex-wrap gap-x-6 gap-y-1`, items as `LABEL: value` pairs (existing Event Context grid content, condensed to one line). `CHOKED` in `text-red-400`; `WIN`/streaks in `text-green-400`.

### 3.4 Choice cards (`ChoiceCard`) — the core fix
- Grid `grid-cols-1 md:grid-cols-2 gap-4 md:gap-6`. Renders N cards from a `choices[]` array (future-proofs choice C; resolve API currently accepts only `a|b` — a third choice needs a one-line API change, flagged out of scope).
- **Heading = the choice text itself** — `text-base md:text-lg font-display font-black uppercase tracking-wide text-zinc-100`. Kill "Choice A/Choice B" labels entirely. A tiny `A`/`B` keycap (`w-6 h-6 border-2 border-[#3a3d44] text-xs grid place-items-center text-zinc-500`) sits top-right for reference and keyboard affordance.
- Selection: `border-2` swaps `border-[#3a3d44]` → `border-[#ff8c42]` + `bg-[#ff8c42]/10` + orange keycap. No `scale-105` jump (it causes layout shimmer with meters); use `shadow-lg shadow-[#ff8c42]/10` instead. Whole card clickable, `cursor-pointer`, `role="radio"` + `aria-checked`.
- **Dangerous flag** (CK3 P4): if a template marks a choice dangerous (future `choice_x_flags` field; until then, derived: any single visible delta ≤ −2), the keycap and heading underline go `red-500` and a `RISKY PLAY` micro-tag renders under the heading. Gold `RARE PLAY` reserved for data-flagged special options later — do not derive gold.

### 3.5 Attribute meters (`AttributeDeltaMeter`) — current → projected
One meter per **1–10-scale attribute** the choice touches. This is the owner's headline request.

Anatomy (one meter, ~44px tall):
```
FINANCIAL STABILITY                    4 → 6 ▲+2
[██][██][██][░g][░g][▯][▯][▯][▯][▯]
```
- **Label:** `text-[11px] font-display font-black uppercase tracking-wider text-zinc-400`.
- **Numbers:** right-aligned `text-xs font-mono font-bold`: current in `text-zinc-300`, arrow `→` in `text-zinc-600`, projected + `▲/▼±n` in `text-green-400` (gain) or `text-red-400` (loss). Unchanged attributes are never rendered.
- **Track:** 10 fixed segments (`flex gap-0.5`, each `h-2.5 flex-1`), hard edges (`rounded-none` — house brutalist read), on `bg-[#18191c]`:
  - Retained value (min(current, projected)): `bg-zinc-500`.
  - **Gain segments** (current < i ≤ projected): `bg-green-500`, animated in with `meterSegIn` + per-segment stagger (§5.7) — the meter visibly *grows* to the projection.
  - **Loss segments** (projected < i ≤ current): `bg-red-500/70` + diagonal hatch (repeating-linear-gradient inline style) — reads as "this is what you'd burn".
  - Empty: `bg-[#3a3d44]`.
- Projection math: `projected = clamp(round((current + delta) * 10) / 10, 1, 10)`; segment i is "filled" when `value ≥ i - 0.5` (handles fractional attributes from battle progression). Numbers display one decimal only when fractional.
- `public_knowledge` (0–100 scale) uses the same component with `max=100`, rendered as a continuous bar (no segments, `meterFill` animation §5.7) and `%` suffix.

Effects that are NOT persistent 1–10 attributes render as **chips** (`EffectChip`), not meters: `+1 WRITING PREP · NEXT BATTLE`, `−1 PREP · NEXT BATTLE`. Chip: `px-2 py-1 bg-[#18191c] border border-[#3a3d44] text-[11px] font-mono uppercase`, green/red text by sign, with a `NEXT BATTLE` suffix in `text-zinc-500` so temporary vs permanent is legible at a glance.

### 3.6 Hidden layer — echo risk stays hidden
Per the two-layer consequence rule (research §P2): the visible layer is the mechanical deltas above; the **echo layer never renders**. Implementation: render ONLY keys in the `VISIBLE_EFFECT_KEYS` whitelist (§5.2). `controversy_risk`, any `echo*` key, chain/follow-up data, and any future unknown key are silently skipped — never listed, never hinted, no "???" placeholder (a placeholder converts a story into a slot machine tell). The only sanctioned whisper is the static confirm-line copy: *"…and what comes next."*

### 3.7 Confirm flow (revised — no redirect)
1. No selection: confirm button disabled-styled (`bg-zinc-800 text-zinc-600`), click triggers the existing shake animation (keep it).
2. Selection made: button goes orange and **echoes the choice**: `CONFIRM: "{first 32 chars of choice text}"` — prevents wrong-card confirmations. `px-8 md:px-12 py-4 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider`.
3. Sub-line under button (replaces the old boxed Warning block): `THIS CALL IS FINAL. IT SHAPES YOUR ATTRIBUTES AND WHAT COMES NEXT.` — `text-xs text-zinc-500 uppercase tracking-wide text-center mt-3`.
4. Resolving: button text `LOCKING IT IN…`, all cards `pointer-events-none opacity-60`.
5. Success: **stay on the page and play the aftermath beat (§3.8).** The `/dashboard?event_resolved=…` redirect + toast path is DELETED for success (keep the existing error-toast path for failures). The dashboard toast consumer can remain for other producers; this screen stops feeding it.

### 3.8 Aftermath beat (`AftermathPanel`) — the payoff happens HERE

The climax of a life event is *seeing what your call did*. CK3 never punts you to a menu for that; neither do we. The resolve response already carries everything needed (route lines 168–179): `outcome.attributeChanges` (`{ before, after, change }` per key), `effects`, `eventTitle`, `category`. State machine in `LifeEventResolutionClient`: `choosing → resolving → aftermath`.

Sequence on `resolving → aftermath` (total ≈ 2.2s of motion, all skippable by scroll/tap, all `motion-reduce`-safe):

1. **The un-chosen card exits** (0ms): fades to `opacity-30 grayscale` and collapses its meters (`max-h` transition, 240ms). It stays visible but visually dead — the road not taken is part of the story.
2. **The chosen card locks in** (0ms): keeps its orange selected border, keycap swaps to a `✓` glyph, heading gets a `YOUR CALL` micro-tag in `text-[#ff8c42]`. `animate-stamp-in` (existing house keyframe) on the tag.
3. **Meters animate projected → ACTUAL** (300ms): each meter in the chosen card re-renders from `outcome.attributeChanges[key].before → .after` (server truth, not client projection). Segments that survived confirm go solid; any divergence from the projection (clamps at 1/10, fractional rounding) is *visible as motion* — the bar settles where reality landed. Numbers flip to `{before} → {after}` with the arrow in `text-zinc-100`. Stagger per meter: 120ms (§5.7).
4. **Outcome copy renders** (900ms): a new block under the cards, `border-l-4` in category color, `p-4 bg-[#2d2f35]`:
   - Headline: `THE DUST SETTLES` — `text-sm font-display font-black uppercase tracking-wider text-zinc-300`.
   - Body: outcome copy for the chosen option. Source: `choice_x_outcome_text` when the template has it (additive column, §5.4); fallback: a generated-free composition — `“You {choice text, lowercased}.”` + one templated consequence line per changed attribute from a fixed copy table (e.g. reputation up: `“The blogs noticed. Your name carries more weight.”` / financial down: `“The account took the hit.”`) — written per the voice guide (§7), stored in `lib/content/eventOutcomeCopy.ts`, never LLM-generated at runtime, never bars.
   - World echo line, when §3.9 spawned an article: `THE BLOGS PICKED THIS UP →` linking to `/media/{slug}`, `text-[#ff8c42]`.
5. **Exit** (1400ms): confirm bar is replaced by a single `BACK TO THE GRIND →` button (same orange treatment) → `router.push('/dashboard')`. No toast, no query param. Secondary ghost link beneath: `SEE ALL EVENTS` → `/life-events`.

Rules:
- The aftermath is **one screen, no navigation** — the header art, title, and context strip stay put; only the lower half transforms. This is the frame players screenshot.
- If the resolve call fails, never enter aftermath — existing error toast + return to `choosing`.
- Back-navigation to an already-resolved event renders the aftermath state statically (no animation replay): resolved events reconstruct meters from `details_json`/history data where available, else show the outcome copy alone.

### 3.9 World echo — major/critical events hit the media hub

A viral-blog-post scandal that never produces an actual blog article is a synergy sitting on the table: the game already HAS `news_articles`, a media hub (`app/media/`), and a blogger-memory pipeline in `lib/services/newsGenerator.ts` (blogger selection, coverage memory, sentiment — see `createRecapArticle`, insert at line 473).

**Hook (server-side, in the resolve route):**
- Condition: `template.severity in ('major','critical')` — minor/moderate events stay street-level (scarcity keeps the echo meaningful).
- Action: after effects apply, call a new `createLifeEventArticle(supabase, { battlerId, event, template, choice, attributeChanges })` in `newsGenerator.ts`:
  - `type`: `'scandal'` for scandal-category events, else `'career_update'` — both already pass the `news_articles.type` check constraint (migration 003 lines 12–15). No constraint change.
  - Reuses `selectBloggerForStory` (story types extended with `'life_event'`) and `recordBloggerCoverage` so bloggers build history with the battler across battles AND life moments.
  - Content prompt mirrors the recap prompt discipline: write ABOUT the moment and the battler's response to it — the choice made, the temperature of the scene, what it means for bookings and standing. **Never invent bars, never quote the battler beyond the choice framing, no money-outcome framing.** Voice guide (§7) is part of the prompt.
  - Failure-tolerant: article generation is wrapped in try/catch and never blocks or fails the resolve response (same fire-and-forget posture as battle recaps).
- Link storage: additive column `battler_life_events.news_article_id uuid references news_articles(id)` (§5.4). The resolve response gains one optional field: `outcome.article: { slug, title } | null`.

**Surfaces:**
- Aftermath beat: `THE BLOGS PICKED THIS UP →` line (§3.8 step 4).
- History list rows: same line, persistent (§2.1).
- Media hub: articles appear organically in the existing list — no media-hub changes needed.

---

## 4. Mobile Layout (≤768px — the game must play great on phone)

### List
- Row goes two-line: edge bar + `w-16 h-16` thumbnail; meta line above title; hook `line-clamp-2`; stakes preview + context flag wrap below. Padding `p-3`. Entire row remains one tap target ≥64px tall.
- Header: title `text-3xl`, sub-line wraps; `VIEW HISTORY →` stays top-right (it already stacks via existing flex-col).
- Section headers sticky: `sticky top-0 z-10 bg-[#18191c]/95 backdrop-blur-sm py-2`.

### Decision
- Header art `h-40`; title `text-2xl`; plates shrink to `text-[10px] px-2`.
- Context strip becomes 2-col grid instead of one line.
- Choice cards stack vertically (`grid-cols-1`), full-width meters.
- **Sticky confirm bar**: on mobile the confirm button + final-call line live in `fixed bottom-0 inset-x-0 bg-[#18191c]/95 backdrop-blur border-t-2 border-[#3a3d44] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]`; content column gets `pb-32` so nothing hides behind it. Button full-width, `min-h-[52px]`. On `md:`+ the bar reverts to static in-flow centered.
- **Aftermath on mobile**: on entering aftermath, auto-scroll the chosen card to viewport top (`scrollIntoView({ block: 'start', behavior: 'smooth' })`, instant under `prefers-reduced-motion`); the sticky bar swaps to `BACK TO THE GRIND →`. The un-chosen card's collapse matters most here — it removes a full screen of dead scroll.
- All interactive targets ≥44px (house rule already present in list header links).
- Animations: keep entrance fades but honor `motion-reduce:animate-none` on every animated class (also applies to the critical pulse, meter fill, and every aftermath step — under reduced motion the aftermath renders instantly in its final state).

---

## 5. Build Plan — files, components, data contracts

### 5.0 Component tree

```
app/life-events/page.tsx                     (MODIFY — server, fetch + group)
└─ components/life-events/NewSinceVisit.tsx       (NEW, client — §2.5.1 wrapper)
   └─ components/life-events/EventListRow.tsx     (NEW, server-safe)
      ├─ components/life-events/EventArtThumb.tsx    (NEW)
      └─ components/life-events/EventCategoryPlate.tsx (NEW, shared)
└─ components/life-events/EventsEmptyState.tsx    (NEW)

app/life-events/[id]/page.tsx                (MODIFY — also fetch battler_attributes)
└─ components/battler/LifeEventResolutionClient.tsx (REWRITE — state machine: choosing→resolving→aftermath)
   ├─ components/life-events/EventArtHeader.tsx   (NEW)
   │  └─ EventCategoryPlate
   ├─ components/life-events/EventContextStrip.tsx (NEW)
   ├─ components/life-events/ChoiceCard.tsx       (NEW, client)
   │  ├─ components/life-events/AttributeDeltaMeter.tsx (NEW — also animates aftermath actuals)
   │  └─ components/life-events/EffectChip.tsx    (NEW)
   ├─ components/life-events/AftermathPanel.tsx   (NEW, client — §3.8 outcome copy + echo link + exit)
   └─ components/life-events/ConfirmBar.tsx       (NEW, client — sticky-on-mobile; swaps to exit CTA in aftermath)

lib/content/eventArt.ts                      (NEW — registry, SHIPS POPULATED per §1.2.1)
lib/content/eventEffects.ts                  (NEW — §5.2 whitelist + chip map)
lib/content/eventOutcomeCopy.ts              (NEW — §3.8 fallback consequence lines, voice-guide governed)
lib/services/newsGenerator.ts                (MODIFY — add createLifeEventArticle, §3.9)
app/api/life-events/[id]/resolve/route.ts    (MODIFY — §3.9 hook + optional outcome.article field; attributeChanges return stays as-is)
public/sprites/events/*                      (NEW ART — §1.2: 5×thumb + 5×header + 5×critical + quiet + 12 template pairs; sizes into docs/CANVAS_SIZES.md)
```
`PendingLifeEventsWidget` gets the §2.5.3 badge-parity touch (count source + critical-red). Follow-up (not this build): reuse `EventListRow` inside it.

### 5.1 `lib/content/eventArt.ts` (registry — compilable as written)

```ts
export type LifeEventCategory = 'career' | 'personal' | 'scandal' | 'financial' | 'relationship';
export type LifeEventSeverity = 'minor' | 'moderate' | 'major' | 'critical';

export interface CategoryStyle {
  label: string;        // 'SCANDAL'
  edge: string;         // 'bg-red-500'          (static strings — Tailwind JIT)
  text: string;         // 'text-red-400'
  tint: string;         // 'bg-red-500/10'
  border: string;       // 'border-red-500/40'
  hoverBorder: string;  // 'hover:border-red-500/50'
}

export const CATEGORY_STYLES: Record<LifeEventCategory, CategoryStyle> = {
  career:       { label: 'CAREER',       edge: 'bg-[#ff8c42]',   text: 'text-[#ff8c42]',   tint: 'bg-[#ff8c42]/10',   border: 'border-[#ff8c42]/40',   hoverBorder: 'hover:border-[#ff8c42]/50' },
  financial:    { label: 'FINANCIAL',    edge: 'bg-emerald-500', text: 'text-emerald-400', tint: 'bg-emerald-500/10', border: 'border-emerald-500/40', hoverBorder: 'hover:border-emerald-500/50' },
  scandal:      { label: 'SCANDAL',      edge: 'bg-red-500',     text: 'text-red-400',     tint: 'bg-red-500/10',     border: 'border-red-500/40',     hoverBorder: 'hover:border-red-500/50' },
  personal:     { label: 'PERSONAL',     edge: 'bg-sky-500',     text: 'text-sky-400',     tint: 'bg-sky-500/10',     border: 'border-sky-500/40',     hoverBorder: 'hover:border-sky-500/50' },
  relationship: { label: 'RELATIONSHIP', edge: 'bg-rose-400',    text: 'text-rose-400',    tint: 'bg-rose-400/10',    border: 'border-rose-400/40',    hoverBorder: 'hover:border-rose-400/50' },
};

// Registry: template code → art override. SHIPS POPULATED (§1.2.1) — the 12
// launch templates land here in the same PR as the assets. A new template
// without an entry requires explicit fallback sign-off in review.
const TEMPLATE_ART: Record<string, { thumb?: string; header?: string }> = {
  CHOKE_EVENT:        { thumb: '/sprites/events/templates/CHOKE_EVENT-thumb.png',        header: '/sprites/events/templates/CHOKE_EVENT-header.png' },
  CLOSE_VICTORY:      { thumb: '/sprites/events/templates/CLOSE_VICTORY-thumb.png',      header: '/sprites/events/templates/CLOSE_VICTORY-header.png' },
  // …all 12 launch entries per the §1.2.1 table
};

export function getEventArt(
  templateCode: string,
  category: LifeEventCategory,
  severity: LifeEventSeverity,
): { thumb: string; header: string } {
  const o = TEMPLATE_ART[templateCode] ?? {};
  const criticalHeader = severity === 'critical'
    ? `/sprites/events/${category}-header-critical.png`
    : undefined;
  return {
    thumb:  o.thumb  ?? `/sprites/events/${category}-thumb.png`,
    header: o.header ?? criticalHeader ?? `/sprites/events/${category}-header.png`,
  };
}
```
Resolution order: template art → critical variant → category art. Never emoji.

### 5.2 Effects → display mapping (single source of truth, `lib/content/eventEffects.ts`)

```ts
export const VISIBLE_EFFECT_KEYS = {
  // 1–10 attribute meters (key → { label, path in battler_attributes })
  reputation:          { label: 'REPUTATION',       path: 'personal.reputation' },
  financial_stability: { label: 'FINANCIAL STABILITY', path: 'personal.financial_stability' },
  family_bond:         { label: 'FAMILY BOND',      path: 'personal.family_bond' },
  resilience:          { label: 'RESILIENCE',       path: 'resilience' },
  lyricism:            { label: 'LYRICISM',         path: 'writing.lyricism' },
  wordplay:            { label: 'WORDPLAY',         path: 'writing.wordplay' },
  creativity:          { label: 'CREATIVITY',       path: 'writing.creativity' },
  flow:                { label: 'FLOW',             path: 'writing.flow' },
  stage_presence:      { label: 'STAGE PRESENCE',   path: 'performance.stage_presence' },
  crowd_control:       { label: 'CROWD CONTROL',    path: 'performance.crowd_control' },
  delivery:            { label: 'DELIVERY',         path: 'performance.delivery' },
  // 0–100 meter
  public_knowledge:    { label: 'PUBLIC KNOWLEDGE', path: 'public_knowledge', max: 100 },
} as const;

export const CHIP_EFFECT_KEYS = {
  prep_bonus_writing:     'WRITING PREP · NEXT BATTLE',
  prep_bonus_performance: 'PERFORMANCE PREP · NEXT BATTLE',
  prep_penalty:           'PREP · NEXT BATTLE',
} as const;
// EVERYTHING ELSE (controversy_risk, echo*, stress until it gets a surface,
// unknown future keys) renders NOTHING. Whitelist, not blacklist.
```
This mirrors exactly the nesting `app/api/life-events/[id]/resolve/route.ts` already uses (lines 143–158) — keep the two in lockstep; ideally refactor the route to import these paths (optional, low-risk win). The §2.5.2 stakes preview and §3.8 aftermath meters both consume this same map — one whitelist, three surfaces.

### 5.3 Exact data each component needs

**`app/life-events/page.tsx`** (already fetches events+template): needs no new queries beyond the battles join. Derives per row:
```ts
{ id, title: template.title, hook: firstSentence(template.description),
  category, severity, rarity, triggeredAt, // → relative label + waiting-days + NEW tick (client)
  stakes: severity === 'critical' ? visibleEffectLabels(template) : null, // §2.5.2
  battleContext: event.battle_id ? { opponent?: string } : null,
  choked: !!event.details_json?.choked,
  articleSlug: /* history rows only, via news_article_id join */ null }
```
Note: the list query today doesn't join `battles` — add the same `battle:battles(ai_battler:battler_ai_id(stage_name))` join the detail page uses so the `⚑ AFTER BATTLE VS X` flag can render. History query additionally joins `news_articles(slug, title)` via `news_article_id`.

**`app/life-events/[id]/page.tsx`** — ADD one query and pass through:
```ts
const { data: attributes } = await supabase
  .from('battler_attributes').select('*')
  .eq('battler_id', battler.id).single();
<LifeEventResolutionClient event={event} battler={battler} attributes={attributes} />
```

**`ChoiceCard`** props:
```ts
{ keycap: 'A' | 'B'; text: string;            // template.choice_x_text
  selected: boolean; onSelect(): void; disabled: boolean;
  phase: 'choosing' | 'resolving' | 'aftermath';
  aftermath?: { chosen: boolean;               // drives §3.8 lock-in vs fade-out
    actuals: Record<string, { before: number; after: number; change: number }> };
  meters: Array<{ label: string; current: number; projected: number; max: 10 | 100 }>;
  chips:  Array<{ label: string; value: number; transient: true }>;
  dangerous: boolean }                          // derived per §3.4
```
`meters`/`chips` are computed in the client from `template.choice_x_effects` × `attributes` via §5.2 (defaults: missing attribute value → 5, matching the resolve route's fallbacks; `public_knowledge` → 0). In `aftermath` phase the chosen card's meters re-target to `aftermath.actuals[key].after`.

**`AttributeDeltaMeter`** props: `{ label, current, projected, max, actual?: number }` — when `actual` arrives (aftermath) the meter animates projected → actual; everything else derived.

**`AftermathPanel`** props: `{ category, outcome: ResolveResponse['outcome'], choiceText: string, article: { slug: string; title: string } | null, onExit(): void }`.

**`EventArtHeader`** props: `{ title, category, severity, rarity, art: { header } }`.

**`ConfirmBar`** props: `{ phase, selectedLabel: string | null; resolving: boolean; shake: boolean; onConfirm(): void; onExit(): void }` — renders CONFIRM in `choosing/resolving`, `BACK TO THE GRIND →` in `aftermath`.

### 5.4 Migration/data tasks
One additive migration (`add_life_event_ui_v2_columns`):
- `ALTER TABLE battler_life_events ADD COLUMN IF NOT EXISTS news_article_id uuid REFERENCES news_articles(id);` — §3.9 echo link.
- `ALTER TABLE life_event_templates ADD COLUMN IF NOT EXISTS choice_a_outcome_text text, ADD COLUMN IF NOT EXISTS choice_b_outcome_text text;` — §3.8 authored aftermath copy (fallback composition covers templates without it).
- Optional (recommended, additive): `ALTER TABLE life_event_templates ADD COLUMN choice_a_flags jsonb, ADD COLUMN choice_b_flags jsonb;` to carry `{"dangerous": true}` / `{"special": true}` authored flags — the UI already reads the derived fallback until then.
- Data task (not schema): the §7.2 template copy audit ships as an UPDATE migration on existing seed rows where the audit demands changes.

### 5.5 Order of work
1. `lib/content/eventArt.ts` + `eventEffects.ts` + `eventOutcomeCopy.ts` (pure data, unblocks everything).
2. Migration §5.4. Template copy audit (§7.2) — copy edits land as data updates.
3. Generate art via PixelLab with crowd-sheet style ref: 5 thumbs + 5 headers + 5 critical variants + `quiet.png` + 12 template pairs (40 assets total); register sizes in `docs/CANVAS_SIZES.md`. Runs in parallel with 4–6 (registry paths are known up front).
4. `AttributeDeltaMeter` + `EffectChip` + `ChoiceCard` (the owner's headline ask) → rewrite `LifeEventResolutionClient` around them + `EventArtHeader`/`EventContextStrip`/`ConfirmBar` + the `choosing→resolving→aftermath` state machine + `AftermathPanel`. **Removes the purple `relationship` mapping — law fix ships here. Removes the success redirect — the aftermath beat ships here.**
5. §3.9 world echo: `createLifeEventArticle` in `newsGenerator.ts` + resolve-route hook + `outcome.article` response field.
6. `NewSinceVisit`/`EventListRow`/`EventArtThumb`/`EventCategoryPlate`/`EventsEmptyState` → rewrite `app/life-events/page.tsx` (add the battles join, stakes preview, count parity incl. widget badge).
7. Playtest in Playwright (house rule) at 375×812 and 1280×800: list with 0 / 1 / mixed-severity events incl. NEW ticks + stakes line; decision select→confirm→**aftermath beat plays on-screen (no redirect)**→BACK TO THE GRIND lands on dashboard; aftermath meters settle at the route's `attributeChanges.after` values; major/critical resolve produces a media-hub article and the echo link opens it; widget badge count === list count; no purple pixel anywhere.

### 5.6 `firstSentence()` — defined (used by list hook line, §2.1)

```ts
// lib/content/eventEffects.ts (or a small text util)
const ABBREVIATIONS = /\b(vs|mr|mrs|ms|dr|st|jr|sr|feat|ft)\.$/i;

export function firstSentence(text: string, maxLen = 110): string {
  const clean = text.trim();
  // Walk sentence-boundary candidates: . ! ? followed by whitespace + capital/quote.
  const re = /[.!?](?=\s+["“A-Z])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean)) !== null) {
    const end = m.index + 1;
    const head = clean.slice(0, end);
    if (head.endsWith('...') || head.endsWith('…')) continue;      // ellipsis ≠ boundary
    if (ABBREVIATIONS.test(head)) continue;                         // "vs." etc. ≠ boundary
    return head.length <= maxLen ? head : head.slice(0, maxLen - 1).trimEnd() + '…';
  }
  // No boundary found: hard cap.
  return clean.length <= maxLen ? clean : clean.slice(0, maxLen - 1).trimEnd() + '…';
}
```
Rules encoded: an ellipsis (`...` or `…`) never terminates the hook; listed abbreviations never terminate; output is capped at 110 chars with a trailing `…` so the row never double-wraps on desktop.

### 5.7 Named keyframes + stagger (meters and aftermath)

Add to `app/globals.css` alongside the existing house set (`barFill`, `stampIn`, `chipPop` already live there — reuse, don't duplicate):

```css
/* Segmented meter: each gain/loss segment pops in, left to right */
@keyframes meterSegIn {
  from { transform: scaleY(0.2); opacity: 0; }
  to   { transform: scaleY(1);   opacity: 1; }
}
.animate-meter-seg {
  animation: meterSegIn 220ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--seg-i) * 45ms); /* set style={{ '--seg-i': i }} per segment */
}

/* Continuous bar (public_knowledge) + aftermath re-target: scaleX from origin-left */
@keyframes meterFill {
  from { transform: scaleX(var(--from-scale, 0)); }
  to   { transform: scaleX(var(--to-scale, 1)); }
}
.animate-meter-fill {
  transform-origin: left center;
  animation: meterFill 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
```
- Mount (choosing): gain/loss segments use `.animate-meter-seg` with `--seg-i` = index among *changed* segments only (so the stagger reads as growth from the current value, not a full-bar rebuild).
- Aftermath: per-meter stagger of 120ms via container-level `animation-delay`; the chosen card's meters re-run `meterFill`/`meterSegIn` targeting `actual`. Aftermath copy block uses existing `animate-stamp-in`; chips use existing `animate-chip-pop`.
- Both new classes are covered by the existing global `prefers-reduced-motion` kill switch in `globals.css` (`animation: none !important`) — verify the selector catches them in playtest.

---

## 6. Acceptance Checklist

- [ ] Five pending events of five categories are visually distinct at a glance (edge color + art) — the "identical card wall" is dead.
- [ ] The 12 launch templates (§1.2.1) each show their OWN art on list + decision screens; a critical event without template art shows the critical variant, not the base category scene.
- [ ] No emoji used as category identity anywhere on either screen; `icon_emoji` unread.
- [ ] Every touched 1–10 attribute renders as a labeled segmented meter with current → projected fill (green gain / red hatched loss) on BOTH choices before selection.
- [ ] **Confirm does NOT redirect.** The aftermath beat plays on the same screen: un-chosen card fades, chosen card locks in, meters animate to the route's `attributeChanges.after` values, outcome copy renders, `BACK TO THE GRIND →` exits. Under `prefers-reduced-motion` the aftermath renders instantly in final state.
- [ ] Resolving a major/critical event creates a `news_articles` row (type `scandal`/`career_update`), and the aftermath + history rows show `THE BLOGS PICKED THIS UP →` linking to the live article. Article generation failure never breaks the resolve.
- [ ] `controversy_risk`/echo/unknown effect keys render nothing — no hint, no placeholder — on meters, chips, AND the stakes preview.
- [ ] `relationship` category renders rose, not purple; zero violet/indigo/lavender/magenta on either screen.
- [ ] No money-outcome framing beyond flat effect values; no bars/lyrics quoted in any copy, art, or generated article.
- [ ] No copy anywhere claims a mechanic that doesn't exist (career pause, expiry, deadlines) — §2.3 honesty rule.
- [ ] Template copy audit (§7.2) complete; new/changed template text passes the §7 voice checklist.
- [ ] NEW ticks appear only for events triggered since last visit; last-seen updates on leave, not on load.
- [ ] Critical rows show the stakes preview derived ONLY from whitelisted keys, labels only (no values/directions).
- [ ] Dashboard widget badge count === list pending count in the same session; badge goes red iff a critical event is pending.
- [ ] Mobile: sticky confirm bar with safe-area inset; all tap targets ≥44px; meters full-width; aftermath auto-scrolls to the chosen card; `motion-reduce` honored.
- [ ] Confirm button echoes the selected choice's text.
- [ ] Empty state uses art, keeps house copy.

---

## 7. Copy Voice Guide — template + outcome + article text (one page)

Chrome copy in this spec ("the lab", "MAKE YOUR CALL", "BACK TO THE GRIND") reads native. But the authenticity of the whole system lives in the **template copy in the DB** — event descriptions, choice texts, outcome lines, and generated articles. This guide governs all of it.

### 7.1 The register: blog-era battle rap media

Write like the mid-2010s battle rap blogs and forums wrote — insiders talking to insiders. Declarative, dry, a little wry. The narrator has seen careers rise and crater and is not impressed easily.

**DO:**
- Second person, present tense for event descriptions: *"A blogger clipped thirty seconds of your green-room conversation. It does not sound good out of context."*
- Concrete scene detail over adjectives: the venue, the timestamp, who texted first, what the comment section is doing.
- The economy of the culture, stated plainly: bookings, flat fees, card placement, who calls you back. (Never outcome-pay framing — the fee was negotiated before the battle; winning changes your *stock*, not that check.)
- Stakes as social physics: rooms you get invited into, names that stop answering, how long a clip stays pinned.
- Choice text as something a person would actually decide: *"Own it on the podcast." "Let the lawyers talk." "Take the short-money booking anyway."*

**DON'T:**
- **No invented bars, punchlines, or quoted rhymes — ever.** Describe that a moment landed; never write the moment's words. This includes "sounds like" paraphrases of bars.
- No champion-speak clichés: "rise to the occasion", "prove the doubters wrong", "leave it all on the stage", "your legacy awaits".
- No fake slang and no slang the writer can't date: if you wouldn't see it under a battle recap from a real blog, it doesn't ship. When in doubt, plain English — plain reads more credible than forced.
- No system-speak leaking into fiction: never "your Reputation attribute", never "+2", never "this will trigger". Mechanics live in the meters; prose lives in the world.
- No melodrama in outcome copy. The dust-settles lines are terse: *"The blogs noticed. Your name carries more weight."* — one observation, one implication, out.
- No promises the sim doesn't keep (§2.3 honesty rule applies to template copy too — no "this is your last chance" unless the template genuinely never re-triggers).

### 7.2 Audit task (ships with this build)

Pass over every seeded template (`004_seed_life_event_templates.sql`, `006_seed_choice_based_life_event_templates.sql`, and later template migrations) against the DON'T list above. Findings land as a data-update migration (§5.4). Known checks: any quoted or paraphrased bar content (auto-fail), champion-speak in titles/descriptions, choice texts that are labels rather than decisions ("Accept" → what are you accepting, in the world's words?), any deadline/pause language. New templates: the §7 checklist is part of template review; a template PR that fails any DON'T does not merge.

### 7.3 Generated articles (§3.9)

The `createLifeEventArticle` prompt embeds §7.1 verbatim as system guidance, plus: articles are written by the selected blogger persona in *their* established voice (the blogger-memory system already tracks sentiment history — lean on it), 150–300 words, headline in the blog's own style, and the same hard bans (no bars, no outcome-pay framing, no invented quotes from the battler beyond characterizing the choice made).
