# The Camp Pipeline — prep as battle rap actually works
*2026-08-31. Owner's vision (voice notes): "they do the research, some of them. They start writing the content… then they're supposed to memorize it, and then practice it. Those are the general phases." Phase 1 (SHIPPED): the prep page now teaches this pipeline — RESEARCH → WRITE (pen + memorize) → REHEARSE (practice), with REST/LIFE as the support lane, real mechanics under each phase. Phases 2–3 below are designed with concrete numbers for the owner to adjust before we wire them into the sim (each needs a validation pass).*

## What ships today (Phase 1)
- Prep page: CAMP PIPELINE strip — the three build phases with live day counts and true mechanical effects (from `lib/game/config.ts`), plus the owner's flow line: RESEARCH → WRITE → MEMORIZE → PRACTICE.
- Focus relabels: WRITING → **WRITE** ("pen + memorize — cuts choke risk", which is what it already does mechanically: `CHOKE_PREP_REDUCTION` keys off writing days), PERFORMANCE → **REHEARSE** ("cuts stumbles" — `STUMBLE_PREP_REDUCTION`).

## Phase 2 — content lanes: the no-research battler (NOT YET WIRED)
Culture grounding: Geechi Gotti famously pulls from his own life instead of opponent research (docs/design/culture/LEAGUE_CULTURES_AND_PPV.md §2). Proposal:

- New style tag **'Realness'** (display-name vocabulary, joins `roundContentSelection.ts`'s badge table):
  - Research days give this battler **0.25×** the normal angle/scouting benefit ("they don't study tape").
  - COMPENSATION: personals + street_talk content get a flat **+15% effectiveness** ("lived it"), and their choke risk from low research is **waived** (their material is their life — always memorized).
  - Their AI auto-select weights personals/street_talk 2.5× (mirror of 'Street').
- Sliders for the owner: research penalty ×0.25 / lived-it bonus +15% / auto-select 2.5×.

## Phase 3 — attributes drive content (NOT YET WIRED)
The audit found content selection reads ONLY badges + league — attributes never touch content. Proposal: each content/delivery/performance type gets ONE driving attribute; its effectiveness contribution scales **±10% max** around attribute 5:

`typeMultiplier *= 1 + (drivingAttr - 5) × 0.02`  (attr 10 → +10%, attr 1 → −8%)

| Content type | Driving attribute |
|---|---|
| punchlines, name_flips | wordplay |
| schemes, wordplay | lyricism |
| angles, storytelling, personals | creativity |
| rebuttals, freestyles | resilience (nerve to improvise) |
| gun_bars, street_talk, shock_value | delivery |
| comedy, pop_culture_refs | crowd_control |
| delivery types (aggressive/smooth/speed…) | delivery |
| performance types (charismatic/stage_presence…) | stage_presence |

±10% keeps league weights + badges primary while making builds FEEL different in the interactive game. Needs a validation pass on interactive outcomes before shipping (body/debatable rates).

## Phase 4 — memorize as its own bar (FUTURE, bigger lift)
Split WRITE into WRITE (content quality) and MEMORIZE (choke insurance) with a visible "IN THE POCKET %" meter on battle night: written-but-unmemorized rounds carry elevated choke odds; freestyle-lane battlers (Freestyle Genius badge) ignore the meter. This changes the choke model materially — design only, don't build until the owner signs the numbers.

## Owner dials to confirm
1. Realness lane: 0.25× research / +15% lived-it / waived research-choke — feel right?
2. Attribute→content coupling: ±10% cap (subtle) vs ±20% (build-defining)?
3. Memorize meter: worth the added player friction, or keep WRITE = pen+memorize fused?
