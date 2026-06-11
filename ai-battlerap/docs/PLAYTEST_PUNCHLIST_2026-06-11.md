# Livestream Playtest Punch List — 2026-06-11
Source: owner's live playtest. "Use that and improve the game."

## CRITICAL / SENSITIVE
- [ ] Remove real-battler references from accolades (Geechi Gotti, Ultimate Madness, Midnight Madness) — only Tru Foe may be referenced, nobody else "not yet"
- [ ] Rematches must be SPECIAL — remove "book immediate rematch" from post-loss life event choices (gate behind rivalry intensity)

## BATTLE EXPERIENCE (the core feel)
- [ ] Results page: too much scrolling on desktop — condense to fit better
- [ ] Layered crowd reactions: 3 crowd demographics (lyricism-heads / street-authenticity / casual+ladies "lyrical miracles" crowd) × 3 reaction levels (loved/ok/hated) visible per round — OLD CODE in root tree had this; check crowd_demographics on leagues/battles + CrowdReactionWindow
- [ ] During battle: show only RELEVANT attributes; full attribute sheet behind expandable menu
- [ ] Tale of the tape: my delivery vs their delivery (stat-vs-stat comparison) visible
- [ ] "Full breakdown" attributes display is bad ("no good") — redesign
- [ ] Post-battle: "what the internet is saying" — reactions section; battles shouldn't appear online instantly (delayed online release; views/buzz accumulate)
- [ ] Battle felt flat — prep needs to visibly matter in the battle presentation

## PREP EXPERIENCE
- [ ] "Saving..." blink on every prep selection — make optimistic/instant
- [ ] Prep page slow + a 404 fetch error (life-related) during prep
- [ ] Prep should feel strategic: show projected effect of each day choice

## BUGS
- [ ] Leagues: only Small Room Circuit + Main Stage Arena visible in some league lists; all-leagues view missing leagues (e.g. Spitfire Arena) — investigate which surface
- [ ] Calendar: clicking battles says "battle not found" (world battles link to player-only page — route to /watch/[id])
- [ ] Tournament bracket: only 1 registered participant — AI battlers must fill brackets
- [ ] Badge award bug: got Punchline Heavy badge despite losing 3-0 — check thresholds
- [ ] Media: every article says "20 hours ago" — spread published_at on world population
- [ ] Roster: avatars cropped (Harlem Shiner hair cut off) + portraits should fill their square bigger

## UX / POLISH
- [ ] Badge effects: only Freestyle Genius shows its effect — ALL badges must show what they do
- [ ] Battler profile: recap/origin text hard to read — bold key phrases; "Origin story" label confusing
- [ ] City on battler profile (e.g. "Chicago, IL") must be clickable → /cities/[id]
- [ ] Manager framing: dashboard should feel like managing a ROSTER (multiple battlers over time) — "you can't tell this is only Thug"
- [ ] Nav: roster/battles organization confusing — clearer IA
- [ ] Battler life dashboard: see where character is in life, history of life events
- [ ] Light mode option (theme toggle) — backlog
- [ ] Leagues: add third category (online leagues) + more stage types — backlog/design

