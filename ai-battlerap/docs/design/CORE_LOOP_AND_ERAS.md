# Core Loop & The Era System

**Status:** design, co-developed with Codex 2026-09-01, refined by owner steer same day. Cherry-picked from a grand "persistent multiplayer historical league simulator" pitch, ruthlessly scoped to fit the game we actually have: a **single-battler career sim**. This is the spine we build toward.

---

## OWNER REFINEMENTS (2026-09-01) — read this first

Three corrections that reshape priority. **The story layer is the heart, not the battle math.**

### A. "Respect" is NOT a floating points bar — it's concrete REPUTATION you can see

The owner's objection to an abstract Scene-Respect currency is right. Kill the invisible number. Reputation is **observable, measurable things** built from the `game_events` log + Wire + newsroom:

- **Your record vs NAMES** — who you've beaten that people actually care about (not a win count; a list of names with weight).
- **A RECOGNITION MAP** — which scenes know you. Shown literally: *"Known in NYC · Buzzing in Newark · Unknown in Atlanta."* You can watch your name spread city by city.
- **LABELS pinned on you** — what the blogs/crowd call you (Real One, Choker, Duckin', Washed, Villain), true or not. They STICK and change how the world treats you.

The **era** doesn't invent a new currency — it changes **which of these the world weighs.** Neighborhood = local name + who-you-beat. DVD = whose tape circulates. Web = whose clips spread + comment sentiment. Platform = who actually draws. Same reputation signals, re-weighted by the culture. Measurable because every input is a concrete event, never a hand-wave.

### B. Prepare for VIDEO + PODCASTS now (placeholders), real media later

The Wire (Twitter) and newsroom (blogs) are text media. The world needs to feel like real battle-rap media, which means **more media TYPES on the same story pipeline**:

- **Podcasts** — shows that discuss your battles/beef. Structured *episodes* with real host names + takes now (text/script), audio later. "Listen to a podcast about the battle."
- **Video** — battle recap cards, callout clips, faceoff footage. **Rich placeholders now** (thumbnail art + structured description/host), real video later.

Architecture: a unified **media layer** — `type` = wire_post | blog | podcast_episode | video_card — so new media types slot into the existing newsroom engine and surfaces. Placeholders must be RICH (real host names, real takes, real thumbnails) so it reads as a living media world today and swaps in real audio/video later without a rebuild.

### C. The LIFE / LABELS / MANAGEMENT layer is the best part — enrich it

Owner: *"the life stories are low-key the best part of battle rap — what the blogs say, the labels that get stuck on people whether it's true or not… I want them to feel like they MANAGE a battler."* So this is a first-class system, not flavor:

- **Labels that stick** — events (a choke, a duck, a real-life crime, a classic) make the blogs/crowd pin a label on you. It PERSISTS and has teeth: changes offers, crowd hostility, the angles opponents research, sponsor interest. This is "respect made concrete" + the drama engine.
- **Life decisions = managing** — the existing life-event categories (crime, money, family, beef) get richer, more consequential choices whose fallout becomes STORY (blogs write it, labels stick, the recognition map moves). You manage a battler through a LIFE, not just a battle card.

**Everything below still holds** — the era spine, the crowd mechanic, the lean attributes — but read it through these three: reputation is concrete, the media world is rich (and video-ready), and the life/label story is the point.

---

## The north star

> **ELO answers "who won?" The era answers "what did that performance earn?"**

We do NOT turn this into a promoter/tycoon sim or a world simulator. The battle engine, prep, badges, venues, Wire, newsroom, life events, game-day clock — all stay. The **era layer sits on top and reinterprets the same battle receipt into a different currency.** That single idea gives us a career that spans decades of culture without rebuilding anything.

---

## 1. The era spine (the cherry on top)

Four eras. (Cut the speculative "player-made future" until multiplayer creates real history.)

Only the **current era's currency is active.** When the culture advances, the old currency **freezes into a Legacy score** — no four overlapping fame meters.

| Era | Active currency | What wins | What the room/receipts reward |
|---|---|---|---|
| **Neighborhood / Cipher** | **Scene Respect** | Beating local names, controlling hostile rooms, live crowd | Rehearsal + room-appropriate material. Reputation travels by word of mouth (the Wire = callouts + eyewitness arguments). |
| **Tape / DVD** | **Tape Heat** | A permanent, watchable performance | Complete rounds, clean delivery, consistency, a memorable peak. The Newsroom *reviews the footage after a delay.* You can lose 2–1 but out-earn the winner if your round is the one people remember. |
| **Web / YouTube** | **Replay Heat** | Shareable moments, rebuttals, style clashes, rewatchability | "The tape" internet re-judge becomes a *major* second verdict. The Wire spawns clips, reaction factions, "he got robbed" arguments. National offers follow Replay Heat, not hometown standing. |
| **Platform / App** | **Platform Pull** | Will people *subscribe / buy / show up* for YOUR matchup | Opponent quality, rivalry stakes, reliability, sustained interest > one isolated viral clip. Platform Pull gates exclusive cards + headliner access. |

**Same battle, different receipts.** Example — win 2–1 away, three clean rounds, one huge haymaker, low rivalry heat. On a 20-point era payout: ~12 Scene Respect / 9 Tape Heat / 16 Replay Heat / 7 Platform Pull. **The ELO result is identical in every era.** The layer only changes the reward + how the world reacts.

**Adoption, not date gates.** Each era transition is a global 0–100 **adoption meter** fed by `game_events`: completed cards nudge it, era-native breakthroughs (a viral-worthy tape, a classic) push harder, background AI cards give steady drift. At 100 the change unfolds over several game-days via Wire posts, Newsroom stories, new booking patterns, shifting venue importance. **The player can accelerate history but can't indefinitely stop it.** Old formats/small rooms stay available — they just stop *defining* the culture.

**No new clock actions.** Do NOT add PROMOTE / POST / DISTRIBUTE to the prep clock. Existing prep produces the performance; the era layer interprets the receipts afterward.

---

## 2. Cities + crowd attributes (building now)

Each city gets: **2 favored strategy tags, 1 cold tag, an outsider-hostility value (0-10)**, plus real neighborhoods and a one-line scene identity.

**One clean mechanic — applied to crowd reaction ONLY:**

> **Audience disposition = (landed-tag affinity) − (away hostility), capped at ±8 crowd-reaction points.**

- Applied ONCE, to crowd reaction only. **Never** touches the raw segment score, the counter multiplier, or the attribute roll.
- **Home battlers get no magic scoring bonus** — they just avoid the outsider-hostility penalty.
- Taste evaluates **WHAT LANDED**, not merely what you selected.
- **The Tape re-judge removes hostility** → the authentic "lost the room, won online" outcome falls out for free.

City data lives in `lib/data/hometownCities.ts` (the ~28 battle-rap metros, deep neighborhoods). This is also the **hometown picker** source (identity + future recruiting).

---

## 3. AI-vs-human leagues

An AI league is a **profile + a booking scheduler**, not an autonomous tycoon. Each needs only:
- Tier + rating range · cities/venues/formats · event cadence + purse band
- **Three booking weights: merit · current-era heat · grudge** → one derived **personality label** (purist favors merit, star-chaser favors heat, grudge-farmer favors storyline). Enough to make offers feel authored.

**The human seam (later, no core rewrite):** both AI and humans emit the *same immutable battle offer* (opponent, city, venue, format, date, purse, stakes). A human operator later just replaces the AI scheduler and picks from eligible matchups. **They never touch hidden rolls or resolution.**

Cut: budgets, staff, rosters, ticket pricing, market share, monopoly simulation.

---

## 4. Attributes — the lean set

**Add exactly ONE visible attribute: `Freestyle`** (live rebuttals/audibles deserve a specialization; Creativity/Flow/Resilience still feed the attempt).

Everything else from the big suggested list is triaged, NOT added as an allocatable stat:
- **Pen** = display-only composite (lyricism + wordplay + creativity + flow).
- **Angles** = research quality + matchup content bonus (already how it works).
- **Performance** = already stage presence + delivery + crowd control.
- **Comedy** = a content/style tag; effectiveness uses existing attrs + room taste.
- **Consistency** = derived from preparation + resilience + segment variance.
- **Stamina** = temporary long-round fatigue from rehearsal/rest/round length.
- **Composure** = Resilience, renamed.
- **Star Power** = Reputation + current-era currency.
- **Reliability / Professionalism** = **league-facing records** derived from accepted offers, cancellations, no-shows, completed prep — not allocatable.

**Personality traits** (Battle Addict, Villain, Mercenary, Culture Purist, Social-Media Machine…): hidden **decision weights for AI battlers**; for the PLAYER they become **earned public labels** based on real choices. Never secretly assign the player a personality.

---

## 5. The engaging loop

1. Choose between 2–3 **offers** — explicit opponent, room, era reward, narrative stakes.
2. Spend the **game-day clock**: research / write / rehearse / rest / life.
3. **Build three rounds** for that opponent and that city.
4. **Perform** — read the room, manage pressure, gamble on audibles.
5. **Receive** verdict + ELO + era currency + Tape judgment + badges + **one lasting consequence**.
6. The **Wire / Newsroom** turns that consequence into the next matchup.

**The "one more battle" hook:** *the next name just became gettable.* Every result unlocks exactly one tempting step-up, revenge battle, or dangerous callout that didn't exist before.

---

## 6. Build order (one dev + AI)

1. **Causal receipts.** Neighborhood era: every result awards **Scene Respect** and generates **one clearly related next offer.** Prove the player understands *why* that offer appeared.
2. **First historical transition.** Ship Neighborhood→DVD, the city crowd profiles (hostility + taste), and the three AI promoter personalities. Playtest whether players actually change matchup + prep choices after the shift.
3. **Complete the career spine.** Add Web + Platform reward logic, media presentation, frozen Legacy totals, overlapping older formats. Tune ONE satisfying 20–30-battle career before simulating a bigger world.
4. **Async cherry.** Let a human operate ONE constrained league through the existing offer pipeline. Only after that works do we even discuss "player-made future."

---

## GOLD to keep · TRAPS to cut

**GOLD (must be in):**
1. Adoption-driven eras that change what a performance *earns*.
2. Cities with recognizable crowd taste + outsider hostility.
3. AI promoter personalities expressed through matchmaking.

**TRAPS (genre-drift, cut):**
1. Three playable roles — especially league owner + city scene.
2. Monopolies, league economics, network-effect simulation.
3. The bloated attribute list + ever-more-layered winner formula.

---

## What we're building first (this session)

The **city database** (§2): ~28 battle-rap metros, deep neighborhoods, each with favored/cold tags + hostility. It's the hometown picker now, and the crowd-taste source the sim reads once §2's mechanic lands. Everything else follows the build order above.
