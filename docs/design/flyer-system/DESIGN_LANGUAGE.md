# The Flyer System — Battle Rap University Design Language (v1, LOCKED 2026-08-30)

Battle-rap **event-poster DNA** applied to a game UI: big portraits, VS staging, red-corner vs
blue-corner energy, modular cards, rich stat visualization — on a **modern, mobile-safe, neutral-dark
skin with pixel-art accents**. Never a generic SaaS dashboard.

Reference mockup (source of truth): `docs/design/flyer-system/board.html`
Proof shots in this folder: `bru-neutral.png` (desktop), `bru-mobile.png`, `bru-r2-sheet.png`, `bru-longname-hero.png`.

---

## 1. Principles
- **Poster / VS layouts.** Matchups are the hero, not an afterthought. Two faces, a VS seal, corners.
- **Big portraits.** The battler's face is large and framed over their **city skyline** (battle rap's
  "everybody's from somewhere"). Never a tiny thumbnail.
- **One modular card engine, many arrangements** — headliner, silhouette, tale-of-the-tape, undercard row.
- **Always show names.**
- **Show the stats and what they DO** — attributes as gauges; badges list their real sim effects.
- **Authored, not templated.** Pixel accents, hard poster shadows, registration ticks, scanlines.

## 2. Palette (NO PURPLE — hues 270–320 are banned, absolute)
Neutral charcoal base (NOT brown — brown was rejected). Accents validated by the game's own badge art.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0F0F12` | page base (neutral charcoal, faint cool) |
| `--surface` | `#17181C` | cards |
| `--raised` | `#1F2024` | raised cards / chips |
| `--line` / `--line2` | `#2E2F35` / `#3E404A` | hairlines / stronger borders |
| `--ink` / `--mut` / `--mut2` | `#F4F4F6` / `#A6A8B0` / `#74767E` | text primary / muted / faint |
| `--brand` (orange) | `#F5731A` | brand highlight, active nav, primary CTA |
| `--red` (red corner) | `#E23A2E` | battler A / danger / "attack" content |
| `--blue` (blue corner) | `#2F7DD1` | battler B / info (hue ~250, never toward purple) |
| `--gold` | `#E7B23C` | premium, badge tiers, VS seal, headers |
| `--green` (live) | `#35C46B` | positive deltas, wins, "the room" |

**Tier colors (de-purpled):** God = gold, Top = **red** (was purple ❌), Mid = blue, Low = green, Rookie = zinc.
**Career tiers:** Legend = gold, Veteran = **orange** (was purple ❌), Established = blue, Rising = green.

## 3. Type system
| Role | Font | Notes |
|---|---|---|
| Display / poster names / big numbers | **Anton** (`--font-poster`) | uppercase, tight, line-height .86–.9 |
| Section headers / labels | **Rajdhani** 600–700 (`font-display`) | uppercase, wide tracking |
| Body / descriptions | **Inter** (`font-sans`) | dense reading |
| Pixel accent ONLY | **Press Start 2P** (`--font-pixel`) | VS glyph, ELO, stat numbers, tiny chips — never body |

**Name rule (important — names vary a lot):**
- Anton, fluid `clamp()`, **wraps to max 2 lines**, `overflow-wrap:anywhere` for long single tokens.
- Auto-shrink for long names (real component: fit-to-width; a per-battler **display option** is a future nicety).
- Always a dark shadow for legibility over art: `text-shadow:0 3px 12px rgba(0,0,0,.9),0 1px 2px rgba(0,0,0,.85)`.

## 4. Portrait system
- Source art = transparent-bg pixel busts at `public/sprites/characters/**/sprite_*.png` (+ `public/images/sprite-536.png`).
- **LAW: never let a global `img{max-width}` clamp a positioned portrait** — it squishes the face
  horizontally (the "stretched Tru Foe" bug). Portraits set `max-width:none`, size by height, `image-rendering:pixelated`, anchored bottom-center.
- **FILL LAW: portraits fill their frame with shoulders anchored to the bottom edge (character-select
  style) — NEVER floating mid-air.** Short frames (hero, next-battle faces) → width-based
  (`width:~120–150%; bottom:~-3%`). Tall frames (character sheet) → height-based (`height:~88%; bottom:-2%`).
  Per-battler polish via the existing `portrait.crop {scale,offsetX,offsetY}` field — roster audit is a filed task.
- Framed over the battler's **city skyline** (`public/sprites/cities/*.png`). City sprites have a baked-in
  name banner at the bottom — **crop it** with `transform:scale(~1.5); transform-origin:center ~28%`.
- **CITY = IDENTITY LAW: feature the city NAME as a bold Anton wordmark in the background** behind the
  portrait (not just the skyline). Origin matters mechanically — **home-city advantage is a real edge**, not
  just your home league — so surface it everywhere a battler is shown. Ghosted brand-orange, `rgba(245,115,26,~.38)`,
  BIG (`clamp(40px,4.8vw,74px)`), **anchored at the TOP of the frame so it peeks over the head** like a
  fight-poster masthead (`top:2%; align-items:flex-start`) — the portrait covers the middle, the name crowns it.
- **Silhouette variant** for unrevealed opponents / undercard: same img, `filter:brightness(0)`.

## 5. Components (the card engine)
- **Battler Command Hero** — big portrait + city backdrop | name + tier/league/**city** chips + Level + ELO + XP | inline **Next-Battle mini-flyer** (opp face + VS + date + prep %). Fills width; no dead space.
- **Battle Flyer** — variants: (a) **Headliner poster** (2 big faces, gold VS seal, red/blue diagonal split, undercard rows), (b) **Silhouette** (unannounced), (c) **Tale-of-the-tape** (faces + opposing attribute bars + records).
- **Undercard row** — small silhouette + `NAME vs NAME` + small silhouette.
- **Stat gauge** — label · track (`#0E0E12`) · fill (green ≥ high / orange mid / red low) · pixel value.
- **Badge card** — **large** medallion (≈92px), name, tier chip (bronze/silver/gold), effects list with green `+` / red `−` deltas. + a **NET EFFECT** summary tile.
- **Stat tile** — icon · pixel number · context/delta line · optional sparkline (Codex graft).
- **Prep donut**, **momentum sparkline trio (name the opponent — Codex graft)**, **The Scene feed** (BLOG/SCANDAL tags).

## 6. Motifs
Diagonal red/blue split behind matchups · faint halftone/crowd texture on heroes · **city-skyline backdrop** ·
**hard offset shadow** on poster/flyer elements (arcade edge) while data cards keep soft 10px radius ·
subtle **scanline** overlay on heroes only · **corner registration ticks** (`--brand`) on poster cards · gold **VS seal**.

## 7. Responsive
Mobile-first. Verified 390px ↔ 1320px. Hero → stacks (portrait, then info, then next-battle). Tiles 4→2.
Flyer reflows; undercard stays legible. Character sheet → portrait then stats. **Never** a horizontal body scroll.

## 8. Adopted from Codex's variant
Editorial section headlines ("YOUR CAREER. AT A GLANCE.") · stat tiles with "+X this month" deltas + sparklines ·
momentum rows that **name the opponent + score**. (Codex only finished the dashboard; we take its ideas onto our complete system.)

## 9. Shell
Real app uses a **left sidebar** shell (logo, Roster / Browse Leagues / Guide, Dev Tools, sign-out) — keep it; the Flyer System is the CONTENT language inside it.

## 10. Rollout order (playtest each in Playwright, desktop + mobile)
1. Foundation ✅ — fonts (Anton, Press Start 2P) + tokens + purple purge in `globals.css`/`layout.tsx`.
2. **Dashboard** — Command Hero (`components/dashboard/battler-card.tsx`) + stat tiles + `stats-grid` gauges.
3. **Character page** `/battler/[id]` — big portrait + all attributes + badges & effects (the sheet).
4. **Battle offers + flyer** `/battle/offers` — the poster/undercard engine.
5. Fan out: round/results, watch, recap, media, life-events, badges compendium, leagues, regions/venues, guide, dev.

Cross-refs: memory `overhaul_flyer_system`. Badge medallion art gaps tracked in the badge-icon-audit task.
