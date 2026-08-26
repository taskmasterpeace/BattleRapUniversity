# THE WIRE — In-World Social Network (Authoritative Spec)

> Owner brief, 2026-08-26 (Robert, verbatim intent). Battle rap LIVES online. The game is
> multiplayer AND single player, and at the end of the day it's a **storytelling machine** —
> an ecosystem where certain people's stories bubble up to the top. This network is one of
> the game's best interfaces: the familiar social-feed rhythm, with an ORIGINAL name, visual
> identity, and interaction language. Imitate the *social-feed pattern*, never X/Twitter
> branding, logos, or trade dress.

**Working name:** `The Wire` (candidates the owner floated: The Wire, CrowdTalk, BarFeed,
The Timeline, VerseWire, Cypher, StageTalk, BattleNet — brand lives in one config constant,
trivially renameable). In-world verbs (never "tweet/retweet/like"):

| Familiar action | In-world term |
|---|---|
| Post | **Drop** |
| Repost | **Boost** |
| Like | **Props** |
| Quote-post | **Flip** |
| Trending | **Heating Up** |
| Verified | **Stamped** / League-certified |
| Hashtag | **Crowd tag** |

## The core replacement

Never a popup saying "Your artist's popularity increased by 8." Instead:

> **@BarRoomTalk:** "Kilo's third round is going crazy right now. Is that a contender for
> performance of the year?" — 4,892 boosts · 18,401 props
>
> **@RhymeHunter:** "He had two weeks to prep and still came light. Stop making excuses."

Stat changes become culture and story.

## Feed types

| Feed | Shows | Why |
|---|---|---|
| **For You** | Viral drops, debates, jokes, rankings, clips, fan reactions | The scene feels alive |
| **Following** | Your battlers, allies, leagues, promoters, media contacts | Monitor your network |
| **Stable HQ** | Private team drops, group-chat arguments, support, requests | Roster chemistry visible |
| **League Wire** | Official bookings, brackets, contract news, announcements | Functional management info |
| **Rumor Mill** | Unverified rumors, leaks, anonymous drops, drama | Uncertainty and intrigue |
| **Battle Night Live** | Live event timeline updating between rounds/moments | Big battles feel like cultural events |
| **Scouting Feed** | Underground clips, local buzz, rising unsigned talent | Social media as a recruitment tool |

## Dynamic post engine (templates FIRST, AI later)

```
Simulation event occurs
  → World reacts differently by relationship and role
  → Post templates selected
  → Variables filled from game state
  → (Later) optional LLM flavor for MAJOR events only, strict JSON + facts-allowed list
  → Posts appear OVER TIME, gain engagement, create new consequences
```

Layered system:
1. **Structured facts** — the truth the game knows (event type, subjects, scores, stakes).
2. **Post templates** — variable-filled lines per event type.
3. **Voice profiles** — every account type writes differently: league account (polished,
   promotional) · hardcore fan (emotional, slang, biased) · analyst (measured,
   score-oriented) · rival (provocative, self-serving) · meme page (short, exaggerated) ·
   battler (ego, loyalty, mood) · manager (professional/defensive/manipulative).
4. **Optional AI flavor** — later; strict structured inputs, JSON out, `factsAllowed` +
   `forbidden` lists (no real-person references, no threats/slurs, no claims outside facts,
   never expose hidden sim data). NO generated rap bars ever.

One structured event fans out by role: league posts the official result; a fan cries
robbery; the rival gloats; a teammate defends; a blogger questions the judging; a meme page
jokes; a sponsor quietly pulls back; a scout sees the high crowd score and sends an offer.
**Game state drives WHAT was said; templates/voices decide HOW.**

## Accounts are agents, not text dispensers

```ts
type SocialAccount = {
  id: string;
  type: 'battler' | 'fan' | 'league' | 'blogger' | 'promoter' | 'meme_page';
  follows: string[];
  influence: number;
  credibility: number;
  controversyTolerance: number;
  favoriteStyles: string[];
  alliances: string[];
  rivals: string[];
  postingFrequency: number;
  voiceProfile: string;
};
```

Every account has incentives (blogger wants attention+credibility; league wants ticket
sales+brand safety; fan wants their favorite to win; rival wants to undermine you).
**Information spread:** involved accounts post first → close followers/rivals react →
high-influence drops get boosts/flips → the feed forms a NARRATIVE ("robbery," "breakout,"
"choke," "ducking," "legendary") → the narrative modifies demand, reputation, opportunities.

## Feed reactions ARE gameplay

| Social outcome | Gameplay effect |
|---|---|
| Clip goes viral | Follower growth, ticket demand, sponsor interest, bigger bookings |
| "Robbed" narrative | Rematch demand, sympathy popularity, judge/league trust tension |
| Rival calls you out | Battle opportunity, stress, rivalry growth, response decision |
| Reckless drop by your battler | Engagement up, league trust down, sponsor risk |
| Teammate defends you | Loyalty rises, crew identity forms |
| Blogger publishes a rumor | Contract leverage, morale hit, image shift, investigation event |
| Consistently ducking strong opponents | "Protected" rep — easier record, hardcore-respect penalty |
| Manager handles drama well | Negotiation leverage + player trust |

Ties directly into the life-event system: every major choice can create a public narrative,
and the public narrative can become a future cause (decision echoes).

## Battle Night Live (between rounds)

> **@CapitalClash:** Round 1 complete. Scorecards locked until the final decision.
> **@PunchlineWatch:** Kilo just flipped the contract issue into an angle. That was nasty.
> **@NovaTheGreat:** Y'all are cheering setups. Wait until my second.
> **Heating Up: #KiloVsNova**

Afterward the feed becomes the fallout: debates, clips, rankings, callouts, memes, rematch
demand, opportunities.

## MVP (build this BEFORE any online/shared network)

- A scrollable fictional feed (dark zinc/orange design system, NO purple).
- **20–30 seeded accounts** with distinct voices (fans, bloggers, meme pages, league
  officials, promoters, plus AI battlers as posters).
- Posts triggered by the REAL event engine (battle completions, rankings moves, life-event
  leaks, beef changes) — not random.
- Props/boosts/replies as simulated engagement numbers (deterministic, never negative).
- **Heating Up** (trending) computed from post volume × influence × recency.
- Three player actions: make a manager drop · reply to a callout · ignore a controversy —
  each with reputation/loyalty/hype/booking-demand effects.
- Gameplay effects wired to reputation, loyalty, hype, booking demand.

Then: multiplayer shared universe where player stables, leagues, events, and public
narratives genuinely interact (design through the multiplayer lens from day one — account
rows and post rows must not assume a single player).

## Technical notes

- Stack: existing repo (Next.js 15 + TS + Tailwind + Supabase). Feed state via server
  components + client islands; realtime later via Supabase Realtime.
- Storage: `social_accounts`, `wire_posts` (+ engagement columns), `wire_player_actions`;
  trending computed on read or via the daily tick. Reuse the world-events template
  machinery and `TheInternet.tsx` voice/take patterns as the seed of the post engine.
- Sub-daily freshness comes from reactive hooks on sim events (crons are daily on Hobby).
- Open-source Twitter-clone repos may be used as LAYOUT inspiration only, license
  permitting; no X trade dress.

## Guardrails (project laws)

- NO generated bars/lyrics — describe moments and reactions only.
- NO purple anywhere. Zinc/orange system.
- Winner doesn't get paid more — economics posts must respect flat booking fees.
- Templates first; LLM later, majors only, strict facts-allowed JSON.
- Everything multiplayer-shaped from the first migration.
