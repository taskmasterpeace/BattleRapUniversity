# Crews & Factions — Design Document
*2026-08-31 · status: DESIGN (owner-directed: "fully develop and polish the crews document"). Nothing here is built yet except the support-staff system noted below.*

## Why crews (the culture)

Battle rap runs on collectives. Dot Mobb, NWX, Cave Gang — a crew is a name you rep, a co-sign that gets you booked, backup on stage when a bump turns into something, and a storyline machine (crew vs crew is how entire eras of the culture get narrated). Fans don't just pick favorite battlers; they pick sides. 2-on-2 battles (URL's *Double Impact* events) are their own format with their own legends.

A crew answers three player questions the game currently can't:
1. **Who rides with me?** (identity + belonging)
2. **Who's beefing with US?** (conflict at a scale bigger than one rivalry)
3. **What do I unlock by being down?** (bookings, prep help, protection, 2v2s)

## What the game already has (don't confuse the two)

`crew_members` today = **support staff**: your battler recruits helpers with a `specialty` (writing/performance/research) who quietly buff prep. That's an *entourage*, not a crew. It stays, but gets renamed in UI to **"YOUR CAMP"** so the word *crew* is freed up for factions.

## The faction model

### A crew is
- **A named collective** with its own page, crest, motto, home city, and coding lean (a crew can be street-coded even if one member is craft).
- **3–6 battlers** (AI, player, or mixed). One **captain**.
- **A reputation ledger** separate from members' individual reps: crew rep rises on member wins, memorable moments (haymakers, bodybags), and won crew battles; falls on chokes, no-shows, and swings.
- **A side people take.** Fans and bloggers are pro- or anti- a crew; The Wire tracks crew heat like it tracks battler heat.

### Joining, forming, leaving
| Action | How | Cost / gate |
|---|---|---|
| Get recruited | A crew whose coding matches yours invites you after a strong performance (win with a haymaker, or beat a member cleanly and impress them) | Accept/decline — declining a street crew's invite can start heat |
| Form your own | Player unlocks at Level ~8 / 10 battles | Name, crest (generated via the badge-art pipeline), motto, invite 2+ AI battlers whose coding/city fit |
| Leave / get put out | Player choice, or crew votes you out after chokes/no-shows tank crew rep | Leaving on bad terms = instant grudges with ex-crew members |

### What being in a crew does (mechanics)
1. **Booking gravity** — offers skew toward cards your crew is on; crew-vs-crew cards pay a purse bonus (event heat).
2. **Camp sharing** — one prep day per battle can be delegated to a crewmate whose specialty covers it (the support-staff system plugs in here).
3. **Pressure backup** — in-room pressure moves (bump/talk-over) against a crew member raise the CREW's heat with the aggressor's crew; a swing against a crew member triggers a crew-wide grudge, not a personal one.
4. **2v2 format** — see below.
5. **Crew storylines** — the newsroom gets crew-level leads: recruitment rumors, internal tension after a member chokes on a crew card, captain disputes, breakup articles. The Wire renders crew tags on posts.

### Crew reputation (the ledger)
```
crew_rep (0–100), starts 40
+3 member win · +5 win on a crew-vs-crew card · +2 member haymaker landed
-4 member choke on a crew card · -6 member no-show · -12 member swings
Decay: −1/week idle (crews must stay active to stay feared)
```
Tiers: UNPROVEN (<30) · RESPECTED (30–59) · FEARED (60–84) · DYNASTY (85+). Tier gates 2v2 invites to bigger leagues and shows as the crest's frame color.

### 2v2 battles (Double Impact format)
- Two battlers per side, **shared rounds**: each round, both teammates' sims run and blend 60/40 (stronger performance carries), with a **chemistry multiplier** from shared crew tenure (battles fought together on the same cards: ×1.0 at 0, up to ×1.12 at 5+).
- Choke rules get scarier: a partner choking drags the blended score hard — the culture's 2v2 horror story.
- Verdict is per-round like 1v1; crew rep swing is double a solo battle.
- Booking: crew-vs-crew offers appear when two crews' heat crosses a threshold (mirrors the grudge system, at crew scale).

### Crew beef (the storyline engine)
A crew-vs-crew relationship row mirrors `battler_relationships`: intensity 0–100, origin story, state ladder (AWARE → TENSE → AT WAR → LEGENDARY BEEF). Feeds:
- Wire posts tagged with both crests, heat bars per crew.
- Blogger leads ("Is [crew] ducking [crew]?", power rankings of crews).
- Offer generation: members of warring crews get matched up more often, with grudge purses.

## Schema sketch (when built)
```sql
crews (id, name, crest_url, motto, home_city_id, coding, captain_battler_id, rep int default 40, created_at)
crew_rosters (id, crew_id, battler_id, role text default 'member', joined_at, left_at, left_on_bad_terms bool)
crew_relationships (id, crew_a_id, crew_b_id, intensity, state, origin_story, created_at)
battles += (is_tag_team bool, battler_player2_id, battler_ai2_id)   -- 2v2 lane
-- existing crew_members table renamed in UI to "camp" (support staff), schema untouched
```

## Starter crews (seed the world; owner-editable in /admin later)
Grounded in the CLAUDE.md trio, upgraded to factions with coding + cities:
| Crew | Coding | Home | Identity | Founding members (from the live roster) |
|---|---|---|---|---|
| **Street Prophets** | street | Newark | truth-teller reality rap, believability kings | Newark Aggro (capt), Concrete Truth, Glock Talk |
| **Bar Scientists** | craft | Boston | schemes, setups, backpack royalty | Boston Scheme King (capt), The Architect, Lake Effect |
| **Gutter Kings** | street | Detroit | raw aggression, pressure-first | Midwest Menace (capt), Brew City Beast, Iron Clip |
| **The Circuit Breakers** | crossover | Atlanta | performance-first crowd killers | Showtime Holla (capt), Freestyle Dynasty, Peach Fire |
| **Overseas Order** | overseas | Toronto | international technicians | Crown Holder (capt), Scheme Genius, Punchline Professor |

## Build phases
1. **P1 — Factions exist**: tables, seed 5 crews, crew page (crest, roster, rep gauge in the house cell meter, recent results), crest generation, roster/dossier crew tags. *~1 session.*
2. **P2 — Rep + beef**: rep ledger hooks in both battle finalizers, crew_relationships + Wire/news integration, invitation flow for the player. *~1 session.*
3. **P3 — 2v2**: tag-team battles end-to-end (offer → shared prep → blended sim → verdict), Double Impact event cards. *~1–2 sessions.*
4. **P4 — Politics**: captain votes, put-outs, breakup storylines, crew tournaments.

## Open questions for the owner
1. Can a player battler ever CAPTAIN AI battlers, or is captain always earned later (P4)?
2. Should leaving a crew be punished with a rating hit, or only story heat (grudges/press)?
3. 2v2 purse: flat-pay law says winners don't out-earn losers — same for crew battles? (Recommended: yes, flat per battler, crew rep is the real prize.)
4. Max one crew per battler forever, or allow defections with history tracked?
