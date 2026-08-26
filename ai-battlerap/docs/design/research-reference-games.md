# Reference Games: How the Best Management Sims Present Events & Decisions

**Purpose:** Pattern library for the Algorithm Institute of BattleRap event/decision system. This is the quality bar. Every pattern below is extracted from a shipped, proven game and mapped to our battle-rap career sim. Written 2026-08-26 from web research + design analysis.

**The one-sentence takeaway:** The games players remember treat an event as a *scene* (art + characters + stakes + a choice with teeth), not a *notification*. The games players tune out treat events as text rows with an OK button. Everything below is about staying on the right side of that line.

---

## 1. Football Manager — The Inbox as the Game's Heartbeat

### What they do

- **The inbox IS the game loop.** FM's core rhythm is: open inbox → read items → make decisions → advance time → new inbox items. News items arrive from named sources (club media officer, scouts, board, journalists) with sender identity, subject line, and a body that often embeds *actionable buttons directly in the message* (respond to press, offer contract, praise player).
- **FM26 replaced the flat inbox with the "Portal"** — a home screen combining messages, fixtures, calendar, and news. The layout is **tiles → cards**: every screen is composed of tiles (key snapshot of one piece of info); clicking a tile opens a card with full detail. Left side = streamlined message stream, right side = six customizable tiles. Navigation collapsed from a long sidebar to six top-level tabs (Portal, Squad, Recruitment, Match Day, Club, Career). Their stated design principles: **Efficiency, Familiarity, Predictability.**
- **Press conferences** are multi-question dialogues where each answer has a tone/gesture (calm, assertive, passionate, etc.). Answers ripple into player morale, board confidence, and rival relationships. Gestures replaced "tones" specifically to give more control over relationship-building.
- **Morale** is a per-player stat shown as a glanceable colored state (Superb → Abysmal) driven by playing time, results, promises kept/broken, contract status, and what you say publicly. Public praise/criticism of a player in a presser directly moves that player's morale.

### What works (steal this)

1. **Sender identity on every event.** A message from "your coach" hits differently than a system toast. Every event should come *from someone* — a league owner, a blogger, your crew mate, a rival.
2. **Actions embedded in the message.** No "go to another screen to respond." The offer/decision lives inside the inbox item.
3. **Public statements have private consequences.** Answering a blogger's question about a rival changes that rival's attitude AND your fans' perception. This is the single most transferable FM mechanic: battle rap is a *talking* culture — interviews, call-outs, and social posts should be FM press conferences.
4. **Tiles → cards for density.** Snapshot first, detail on demand. This is the mobile answer to dense management screens.

### What fails (avoid this)

1. **Repetition killed press conferences.** The #1 FM community complaint for a decade: the same 8 questions every week until players delegate pressers to the assistant. **Lesson: an event type that fires often MUST have a deep variant pool or a shrinking frequency.** If the player has seen it 3 times, it's furniture.
2. **Morale problems without tools.** Players hate "X is unhappy about something you can't fix." Every negative event needs at least one *plausible* response lever, even if it's costly.
3. **Interchangeable personalities.** FM conversations feel "fake" when every player responds identically. Personality must gate which responses work (see TEW attributes and CK3 traits below).

---

## 2. Crusader Kings 3 — The Gold Standard for Event Design

CK3 is the best-in-class model for *the event window itself*. Its structure is fully documented in Paradox's Dev Diary #30 and the CK3 modding wiki, and it is worth copying almost verbatim.

### Anatomy of a CK3 event window

```
┌─────────────────────────────────────┐
│  THEME ICON  ·  EVENT TITLE         │   ← theme = icon + background + lighting + ambient sound
│  [background art: throne room /     │
│   dungeon / market / tavern ...]    │
│  [left portrait]   [right portrait] │   ← 0–5 portraits, 2 fully animated
│                                     │      animation: idle/scheme/fear/flirtation (130+)
│  Body text: 2–4 sentences of        │
│  flavored situation description     │
│                                     │
│  ▸ Option A            (safe)       │   ← options gated by trigger, flavored by trait/skill
│  ▸ Option B            [Trait icon] │   ← "special" = yellow highlight
│  ▸ Option C            (dangerous)  │   ← "dangerous" = red highlight
└─────────────────────────────────────┘
```

Concrete parameters worth mirroring in our schema (names from the actual CK3 script API):

| CK3 concept | What it does | Our equivalent |
|---|---|---|
| `theme` | Bundles icon + background + lighting + ambient sound per event mood (50+ themes: intrigue, romance_scheme, mental_break...) | `event_theme`: e.g. `studio`, `green_room`, `parking_lot`, `group_chat`, `stage`, `crib`, `block` — each = 1 background + 1 icon + 1 color accent |
| `override_background` | 47 reusable backgrounds mixed freely with any theme | Small pool of reusable backdrop art; combinatorics do the work |
| `left_portrait` / `right_portrait` + `animation` | Characters IN the event, emoting | Battler/NPC sprite or portrait in the event card, with expression variant |
| `trigger` | Conditions for the event to be eligible at all | `conditions` on event templates |
| `cooldown = { years = 5 }` | Prevents rapid re-firing of the same event | Per-event cooldown in battles/weeks |
| `weight_multiplier` | Situational probability shaping in random pools | Weight modifiers per battler state |
| option `trigger` + `show_as_unavailable` | Options can be hidden OR shown-but-locked | Show locked options with the requirement ("Requires Reputation 6") — aspirational UI |
| option `trait` / `skill` flavor | Marks WHY you get this option ("[Arrogant]", "[Diplomacy]") | "[Wordplay Wizard]" / "[Hometown Hero]" prefixes on badge/attribute-gated options |
| `add_internal_flag = special / dangerous` | Yellow = rare opportunity, red = risky | Same two flags. Players learn the color language fast |
| `ai_chance` + `ai_value_modifier` | AI picks weighted by 9 personality values (boldness, greed, compassion...) | AI battlers resolve the *same* events using personality weights — the world lives without the player |
| `hidden_effect` | Consequences concealed from the tooltip | Hidden consequence layer (see below) |
| `trigger_event = { id = X delay = { months = 2 } }` | Delayed follow-up = event chains | Chain scheduling with delay ranges |
| on_action pulses (`random_yearly_playable_pulse`, `quarterly_playable_pulse`) | Random events fire from timed pulse pools, not constant spam | Our event scheduler = pulse pools keyed to game calendar |

### Visible + hidden consequences (the crucial CK3 trick)

Each option's tooltip shows the **guaranteed, mechanical** consequences (stress +10, gold −50, gain trait). But `hidden_effect` blocks conceal the *narrative* consequences — the rival who now hates you, the event chain you just started, the 20% chance of scandal. **The mix is the magic:** enough visible info to make the choice a real decision, enough hidden outcome to make the result a story. A choice with fully visible outcomes is a math problem; a choice with fully hidden outcomes is a slot machine. CK3 sits deliberately in between.

### Recurring named characters

CK2/CK3's most-loved content is recurring persistent characters woven through events over years: the court physician who keeps proposing insane treatments, secret chains like "The Bells of Santiago" (a courtier is secretly a serial killer, revealed across many events), the wandering storyteller. Community consensus: these beat one-off events by a mile, and players explicitly ask for MORE recurring characters. The character *accumulating history with you* is what makes an event chain feel like a storyline instead of content.

### Pacing & dedupe rules (how CK3 keeps events special)

1. **Pulse pools, not constant rolls.** Random events fire from `yearly`/`quarterly`/`five_year` pulses — a bounded budget of events per time unit.
2. **Cooldowns per event** (commonly 2–10 years) so no event repeats within memory.
3. **Weights shaped by situation** so the pool you draw from always feels relevant (imprisoned characters get dungeon events, schemers get intrigue events).
4. **Community-verified failure mode:** events *without* cooldowns and with simple triggers (e.g. some epidemic events) are the ones players complain fire too often. The system works exactly as well as its cooldown discipline.
5. **Guaranteed events are separate from random events.** Story-critical beats fire from deterministic on_actions (on_birth, on_death, on_war_won); flavor fires from random pools. Never let the RNG own your main storyline.

---

## 3. TEW (Total Extreme Wrestling) — Storylines, Heat, and Worker Personality

TEW is the closest genre-relative to a battle rap sim: a roster of performers with kayfabe personas, shows built from segments, crowd heat as the currency, and backstage morale as the simmering counter-game.

### What they do

- **Shows are segment lists: matches + angles.** An "angle" is any non-match segment (interview, brawl, video package, call-out). Each participant in an angle is **rated on a specific skill** (entertainment, menace, overness...) — you choose *what each person is there to do*, and the segment grade comes from those skills. The game explicitly does NOT simulate what happens in the angle — it's abstract, exactly like our no-user-generated-bars principle. **TEW proves abstract segments + good framing = engaging booking.**
- **Storylines** are named containers that link segments across shows. Each storyline carries a **heat rating** that rises when its segments perform well and decays when neglected. Advance booking promotes future big events.
- **Momentum per worker:** great matches/promos push momentum up; audience apathy decays it every show "until something interesting happens." Momentum multiplies popularity gain and perception.
- **Morale per worker,** moved by booking decisions: losing streaks, being left off big shows ("virtually everyone feels slighted if left off a Legendary event"), broken promises, backstage incidents. Morale feeds performance and incident probability.
- **Personality via attributes** (professional, difficult, wildcard...) gates which backstage events a worker generates and how they respond to yours.

### What works (steal this)

1. **Storylines as first-class named objects with a heat meter.** Our beefs/rivalries should be persistent entities (name, participants, heat 0–100, history log) — not implicit state. Fans of the sim can then *see* "Tru Foe vs Scheme Architect — Heat 78 — 3 chapters." Heat decays if you don't feed it; that decay is a pacing engine that *pulls* the player toward the next chapter.
2. **The neglect penalty.** TEW punishes ignoring a hot storyline. Our equivalent: a beef left cold generates a "fell off" media article and reputation drift. The world moves without you.
3. **Roster-wide jealousy events.** Every card you book makes someone unhappy. Every battle offer accepted is a battle someone else didn't get — crew mates and rivals should react.
4. **Momentum as a separate, visible meter from skill.** A technically great battler can be cold; a mediocre one can be hot. This is 100% true to real battle rap (bookings follow buzz, not just skill).

### What fails (avoid this)

1. **TEW's UI is legendarily dense/hostile** — walls of nested screens, 2000s-forum aesthetic. It survives on depth despite presentation. We take the systems, not the screens.
2. **Text-only events with no art or scene framing** make even dramatic backstage incidents (fights, walkouts) read like log lines. Same event + CK3-style presentation would land 10x harder.

---

## 4. NBA 2K MyCareer — Off-Court Life as Quests & Cutscenes

### What they do

- **Off-court life is framed as a quest log**: named quests with givers (agent, brand reps, family, journalists), objectives, and explicit rewards (VC, fans, badge progress). 2K22+ deliberately lets you *choose* between hooping and side paths (fashion, music) — the quest structure makes "life choices" legible.
- **Recurring cast:** an agent, a rival, a family member (2K27: cousin Cam, voiced by Vince Staples) who persist across the whole career and anchor cutscene decision moments. Decisions presented as binary/ternary dialogue picks in cutscenes ("sign with the flashy agency vs the loyal one").
- **Endorsements as a visible ladder:** shoe deals, magazine covers, billboards — unlocked by performance + fan count, each with a visible fan-count threshold. Progress toward the next endorsement is always displayed.
- **Press conferences and podcasts** after milestone games, with answers moving fan growth and teammate chemistry.

### What works (steal this)

1. **Reward transparency on life choices.** Every quest shows what you get. When we ask a player to spend a prep day on "life," it should show the concrete stake ("Repair Family Bond: +1 Family Bond, unlocks 'Grounded' resilience buff").
2. **The fan-count ladder.** A single always-visible number (fans/followers) that gates concrete unlocks (endorsements = our sponsorships/league invites). Players self-motivate toward visible thresholds.
3. **A tiny persistent cast beats a large rotating one.** One agent + one rival + one family anchor, kept for the WHOLE career, carrying every off-court beat.

### What fails (avoid this)

1. **Fake choices.** MyCareer stories are notorious for decisions that don't matter — the story converges regardless. Community threads openly mock this. If both options lead to the same state, don't present a choice.
2. **Forced linear story on repeat playthroughs** — unskippable, identical. Our origin paths (Text Forums / App Camera / Crew) must genuinely fork early-game event pools, or replay value dies.

---

## 5. The Pattern Library (transferable, concrete)

### P1. Event = Scene, not notification
An event has: **theme (background + icon + accent color) · 1–2 character portraits with expression · title · 2–4 sentences of situation · 2–4 options.** Minimum bar for anything narrative. Plain toasts are reserved for pure bookkeeping (auto-save, payment received).

### P2. The two-layer consequence rule (CK3)
Option tooltip shows **mechanical guarantees** (±attributes, money, stress). A `hidden` layer carries **narrative outcomes** (relationship shifts, chain starts, % risks). Every meaningful option needs at least one hidden ripple; every option needs at least one visible number. Never fully transparent, never fully opaque.

### P3. Gated options you can SEE (CK3 `show_as_unavailable`)
Show locked options greyed with their requirement: "🔒 Flip it into a freestyle — requires Freestyle Genius badge." This markets the progression system inside every event. Options unlocked BY a badge/attribute display the source: "[Crowd Favorite] Let the crowd answer for you."

### P4. The special/dangerous color language (CK3 internal flags)
Exactly two flags: **gold = rare opportunity**, **red = risky play**. Applied sparingly. Players learn it in one session and feel it forever.

### P5. Everything comes from someone (FM)
Every event names its source: a league owner, DJ Verdict (blogger), your crew mate, your mother, an opp. Sender identity + portrait. No anonymous system messages for anything with narrative weight.

### P6. Recurring named cast > event volume (CK3 + 2K)
Build 6–10 persistent named NPCs (a blogger who's followed you since Underground, a shady promoter, a childhood friend, one league owner per tier, your origin-path mentor) and route MOST events through them. An okay event from a character with 20 battles of shared history beats a brilliant one-off. Track per-NPC relationship score and reference past interactions in event text ("After what you said about him on The Trap Podcast...").

### P7. Storylines are first-class objects with heat (TEW)
`storylines` table: name, participants, heat (0–100), chapter log, status. Heat rises on battles/callouts/media within the storyline, **decays weekly when unfed**. Surfaced as a card: "YOU vs RAW PROPHET — Heat 71 — Chapter 3: The Rematch." Cold storylines generate "fell off" articles. Beef resolution (battle, squash, truce) is an event with the full P1 treatment.

### P8. Momentum ≠ skill (TEW)
Visible momentum/buzz meter per battler, separate from attributes. Wins, viral moments, and media wins push it; inactivity decays it. Momentum gates offer quality — this is authentic to real battle rap economics (buzz gets bookings).

### P9. Public words are game moves (FM press conferences)
Interviews/social-post events where each answer choice targets a person or group: praise/diss an opponent (moves THEIR attitude + the storyline heat), talk up your league (owner relationship), address fans (momentum). Same ripple model as FM pressers. **Cap the frequency and rotate deep variant pools** — the FM repetition failure is the #1 risk to this event type.

### P10. Stat changes shown as before→after deltas, at the moment of change
Never silently mutate a stat. Render `Lyricism 6.2 → 6.4 ▲` with color (green ▲ / red ▼), grouped in the event resolution or post-battle summary. CK3 puts deltas in option tooltips pre-choice; FM puts them in inbox items post-hoc; 2K animates the ticker. We need both moments: predicted delta on the option (visible layer), actual delta on the outcome screen. (Our `PostBattleSummary.tsx` is exactly this surface — wire it in.)

### P11. Art reuse via theme composition (CK3)
Do NOT make one illustration per event. Make: **~8–12 background scenes** (stage, green room, studio booth, block corner, crib, parking lot, group chat/phone frame, league office) × **portrait pool** (battlers + NPC cast, each with 2–3 expressions) × **~10 theme icons** (beef, money, family, media, league, health, crew, opportunity). Every event picks background + portraits + icon. 30 assets ≈ thousands of distinct-feeling event windows. Matches our existing 1,632-sprite pixel library and PixelLab pipeline perfectly.

### P12. Pacing: pulse budgets + cooldowns + priority lanes (CK3)
- **Budget:** cap narrative events per time unit (e.g. max 1 minor event per prep day, max 1 major event per battle cycle). Draw from weighted pools at fixed pulses — never roll every tick.
- **Cooldown per event template** (e.g. 5–10 battles) and **per event family** (no two "family" events within 3 battles).
- **Dedupe by seen-count:** after a template has fired twice for a career, its weight drops sharply or a variant pool swaps in.
- **Two lanes:** deterministic story beats (level-ups, tier promotions, origin milestones) fire from fixed triggers and are NEVER random; flavor events fire from the random pulse pools. RNG must not own the spine.
- **Relevance weighting:** pool weights shift with state (low Family Bond → family events weighted up; win streak → jealousy/callout events up). The draw should always feel like the game is watching you.

### P13. Every problem ships with a lever (anti-FM-morale)
No negative state without at least one costed response available (spend money, spend a prep day, burn a relationship, take the L publicly). "Unhappy for reasons you can't address" is the most-hated pattern in the genre.

### P14. Mobile density: tiles → cards → full screens (FM26)
- Home = a **Portal**: message/event stream on one axis, 4–6 snapshot tiles (next battle, momentum, storyline heat, wallet, fans).
- Every tile opens a card; every card can open a full screen. Three levels, never more.
- One-line collapsed event rows (icon + sender + title + unread state) expanding to the full P1 scene on tap.
- Top-tab navigation, ≤6 tabs. FM26's beta backlash warning: don't bury frequent actions behind extra taps — the *stream* handles frequency, tiles handle glanceability.

### P15. Choices must diverge (anti-2K)
If two options lead to the same world-state, delete one. Cheap divergence is fine (a different NPC remembers it, a different flag set) — but SOME state must differ, and later text should occasionally prove it ("You kept it quiet last time — respect.") Callbacks are the cheapest, highest-yield content in the genre.

---

## 6. What "sticky" means — the checklist

An event is memorable when it scores 4+ of these (drawn from all four games):

- [ ] It has a **face** (a portrait of someone the player knows)
- [ ] It **references player history** (a past battle, choice, or relationship)
- [ ] It offers a **real dilemma** (options trade off different currencies — money vs rep vs family vs prep time)
- [ ] At least one option is **gated by who your battler is** (badge/attribute/origin)
- [ ] The outcome has a **hidden ripple** the player discovers later
- [ ] It is **rare** (cooldown discipline made this the first or second time they've seen it)
- [ ] It changes something **visible on the dashboard** afterward

Generic events fail this list: no face, no history, symmetric options, instant fully-visible outcome, fires weekly.

---

## 7. Immediate implications for our build

1. **Event schema** should copy CK3's shape: `template_id, theme, portraits[], title, body, options[{text, visible_effects, hidden_effects, trigger, flag: special|dangerous, gate: badge|attribute|origin}], cooldown, weight_modifiers, chain{next_id, delay}` — plus TEW's `storyline_id` foreign key.
2. **Life events table already exists** — upgrade it from log-lines to P1 scenes using P11's composable art (backgrounds via PixelLab, portraits from existing sprite library).
3. **PostBattleSummary.tsx** is our P10 surface; wiring it in (already a known critical issue) is the single highest-leverage presentation fix.
4. **News system** (already generating recaps) becomes P5/P9 compliant by giving the AIOBR media 2–3 named recurring bloggers with distinct voices and per-player memory.
5. **Rivalries/beefs** should be promoted to a `storylines` table with heat + decay before we write more one-off beef events.
6. **Pacing constants** belong in `lib/game/config.ts` next to choke rates: `EVENT_PULSE_PER_PREP_DAY = 1 (30% chance)`, `MAJOR_EVENT_PER_BATTLE_CYCLE = 1`, `TEMPLATE_COOLDOWN_BATTLES = 6`, `FAMILY_COOLDOWN_BATTLES = 3`, `SEEN_TWICE_WEIGHT_MULT = 0.2` — tune like we tuned chokes.

---

## Sources

- [CK3 Dev Diary #30 — Event Scripting (Paradox Forums)](https://forum.paradoxplaza.com/forum/developer-diary/crusader-kings-3-dev-diary-30-event-scripting.1397140/)
- [CK3 Wiki — Event modding](https://ck3.paradoxwikis.com/Event_modding) (themes, portraits, options, cooldowns, on_action pulses, hidden_effect, trigger_event)
- [CK3 Wiki — Events](https://ck3.paradoxwikis.com/Events)
- [Paradox Forums — Event frequency is too high](https://forum.paradoxplaza.com/forum/threads/event-frequency-is-too-high.1629362/) (cooldown-discipline failure mode)
- [FM26's Reimagined User Interface (footballmanager.com)](https://www.footballmanager.com/fm26/features/fm26s-reimagined-user-interface) (Portal, tiles→cards, Efficiency/Familiarity/Predictability)
- [FM Scout — FM26 Reimagined UI](https://www.fmscout.com/a-fm26-reimagined-ui.html)
- [Football Manager — Interaction feature page](https://www.footballmanager.com/features/interaction) (gestures, press conferences)
- [FM 2024 Press Conferences & Media (Medium)](https://fccadoni.medium.com/football-manager-2024-press-conferences-media-ba4a0242ce23)
- [FM Projects — Football Manager's Morale System](https://fmprojects.substack.com/p/football-managers-morale-system) ("upset over a problem I can't solve" critique)
- [Thick Accent — FM26 beta UI backlash](https://www.thickaccent.com/2025/10/24/maze-of-screens-fm26-beta-sparks-backlash-over-controversial-new-ui/)
- [TEW 2020 Wiki — Angles](https://tew2020.fandom.com/wiki/Angles), [Workers](https://tew2020.fandom.com/wiki/Workers), [Booking And Running Shows](https://tew2020.fandom.com/wiki/Booking_And_Running_Shows)
- [Total Extreme Wrestling — Wikipedia](https://en.wikipedia.org/wiki/Total_Extreme_Wrestling) (momentum meter, storyline heat, advance booking)
- [NBA 2K25 MyCAREER Courtside Report](https://nba.2k.com/2k25/courtside-report/myplayer-and-mycareer/) (quests)
- [NBA 2K27 MyCAREER feature page](https://nba.2k.com/2k27/features/mycareer/) (recurring cast, off-court anchor character)
- [Operation Sports — MyCareer in Next-Gen NBA 2K22](https://www.operationsports.com/mycareer-in-next-gen-nba-2k22-puts-the-ball-in-your-court/) (quest-driven life choices)
- [Operation Sports Forums — How to Shake Up the Tired MyCareer Story](https://forums.operationsports.com/forums/forum/basketball/nba-2k-basketball/927326-how-to-shake-up-the-tired-mycareer-story-in-nba-2k23-and-beyond) (fake-choice critique)
