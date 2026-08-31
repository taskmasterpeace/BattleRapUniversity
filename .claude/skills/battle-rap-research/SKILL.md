---
name: battle-rap-research
description: Ground any battle rap game mechanic in the real culture BEFORE designing or building it. Use whenever Robert talks about battle rap mechanics, league differences, battler archetypes, prep/writing process, crowd dynamics, PPV/events, personas, or "how it really works" — research first, then bring him grounded options with numbers to react to. Also use when a feature touches culture (leagues, badges, content lanes, crowds, media) and no research has been done this session.
---

# Battle Rap Research — culture before code

Robert's law (2026-08-31): "we need a skill to always do research on this stuff when I talk about it." The game must feel authentic to people who KNOW battle rap. Never design a culture-touching mechanic from general knowledge.

## The loop
1. **Research first** — web search the real thing before proposing anything:
   - Leagues: URL, KOTD, Don't Flop, RBE, iBattle, QOTR, Chrome 23, Bullpen, UDubb, regional scenes. Their crowds, formats, what content lands or flops there.
   - Battlers: who exemplifies each lane (puncher, pen, performance, angles, personals, no-personals, gun bars, comedy, rebuttal/freestyle). Recent battles, classics, controversies.
   - Business: PPV vs in-room vs YouTube-later, purses, card structure, flyer conventions.
   - Fan discourse: how fans actually debate (room vs internet verdicts, "debatable", bodybag culture).
2. **Fan-out** when the topic is wide: spawn parallel research subagents per league/topic rather than one shallow pass.
3. **Map to mechanics** — translate findings into concrete game options: attributes, weights, matchup multipliers, event types. Every proposed number gets a cultural justification.
4. **Bring Robert choices, not essays** — present 2–4 grounded options WITH suggested percentages/weights for him to adjust ("URL crowd: personals ×1.5, schemes ×0.8 — feel right?"). He wants to react to numbers, not invent them.
5. **Write it down** — durable findings go in `docs/design/culture/` (create per-topic briefs); cite what's real vs invented for the game.

## Standing cultural laws (already settled — don't re-litigate)
- **Flat pay**: winner does NOT earn more than loser (league battle rap pays show money). Kill any win-bonus copy/logic.
- **No mics**: league battle rap is acapella — never put a microphone in battler art/copy (hosts only).
- **Haymaker-landed rule**: only badge a haymaker that WON its segment/round.
- **Everybody's from somewhere**: city/origin is core identity, surfaced big.
- Leagues are culturally mapped to real geography (NYC crown, Detroit pen, Toronto bars, UK writers, Bay gunbars, Philly hostility) — see the league seed migrations.

## Where knowledge lives
- `docs/design/culture/` — research briefs (create if missing)
- `CLAUDE.md` "Research Battle Rap Culture First" section — the root mandate
- Memory: culture_flat_pay, culture_no_mics, haymaker_landed_rule
