/**
 * World Event Templates
 *
 * A deep database of battle-rap world events that generate authentic media
 * coverage even when nobody is battling. Every template is written in the
 * voice of one of the 8 canonical bloggers (see lib/game/bloggerPrompts.ts)
 * and fills its slots from REAL database state — names, tiers, cities,
 * leagues, ratings, streaks — so every article is true-ish to the world.
 *
 * Design rules:
 *  - NO invented battle bars. Angles, energy, business and culture only.
 *  - 80-200 words of markdown per body.
 *  - Templates whose requirements aren't met are gracefully skipped.
 */

// ============================================================================
// Types
// ============================================================================

export type WorldEventCategory =
  | 'callouts'
  | 'beef'
  | 'league_business'
  | 'streets_culture'
  | 'career_arcs'
  | 'city_scenes'
  | 'rankings_reactions'
  | 'lifestyle';

/** Must stay within the news_articles type CHECK constraint. */
export type WorldArticleType =
  | 'scandal'
  | 'career_update'
  | 'league_update'
  | 'power_ranking'
  | 'culture';

export interface WorldBattler {
  id: string;
  name: string;
  tier: 'low' | 'mid' | 'top' | 'god';
  region: string | null;
  styleTags: string[];
  rating: number;
  wins: number;
  losses: number;
  streak: number;
  cityName: string | null;
  isReal: boolean;
}

export interface WorldLeague {
  id: string;
  name: string;
  shortCode: string;
  cityName: string | null;
}

export interface WorldCity {
  id: string;
  name: string;
  state: string | null;
  sceneSize: string;
  cultureStyle: string;
}

export interface WorldEventCtx {
  /** Primary battler — always present. */
  a: WorldBattler;
  /** Secondary battler — always present and distinct from `a`. */
  b: WorldBattler;
  /** Primary league (linked when template sets linkLeague). */
  league: WorldLeague;
  /** A second, distinct league (poaching/in-talks stories). */
  league2: WorldLeague;
  /** `a`'s home city when known, otherwise a random scene city. */
  city: WorldCity;
  /** A second, distinct city (regional rivalry stories). */
  city2: WorldCity;
  /** True when a/b have a real battler_relationships row. */
  hasRelationship: boolean;
  relationshipStory?: string;
  /** Head-to-head record between a and b, when one exists. */
  h2h?: { aWins: number; bWins: number };
  /** Flavor: months since the battler was last seen on a stage. */
  monthsIdle: number;
  pick: <T>(arr: T[]) => T;
  int: (min: number, max: number) => number;
}

export type BloggerKey =
  | 'battle_eyez'
  | 'marijuana_piranha'
  | 'algorithm_institute'
  | 'small_room_report'
  | 'the_main_stage_herald'
  | 'underground_voice'
  | 'coast_to_coast_coverage'
  | 'the_battle_breakdown';

export interface WorldEventTemplate {
  code: string;
  category: WorldEventCategory;
  /** Relative selection weight (default ~10). */
  weight: number;
  articleType: WorldArticleType;
  blogger: BloggerKey;
  /** Whether ctx.b should be saved as secondary_battler_id. */
  linkSecondary?: boolean;
  /** Whether ctx.league should be saved as league_id. */
  linkLeague?: boolean;
  /** Skip this template when requirements aren't met by the drawn ctx. */
  requires?: (ctx: WorldEventCtx) => boolean;
  headline: (ctx: WorldEventCtx) => string;
  body: (ctx: WorldEventCtx) => string;
}

// ============================================================================
// Voice helpers
// ============================================================================

export const BLOGGER_BYLINES: Record<BloggerKey, { penName: string; outlet: string }> = {
  battle_eyez: { penName: 'Battle Eyez', outlet: 'Battle Eyez Media' },
  marijuana_piranha: { penName: 'Marijuana Piranha', outlet: 'The Cipher' },
  algorithm_institute: { penName: 'Algorithm Institute', outlet: 'Algorithm Institute of Battle Rap' },
  small_room_report: { penName: 'Small Room Report', outlet: 'Small Room Report' },
  the_main_stage_herald: { penName: 'The Main Stage Herald', outlet: 'The Main Stage Herald' },
  underground_voice: { penName: 'Underground Voice', outlet: 'Underground Voice' },
  coast_to_coast_coverage: { penName: 'Coast to Coast Coverage', outlet: 'Coast to Coast Coverage' },
  the_battle_breakdown: { penName: 'The Battle Breakdown', outlet: 'The Battle Breakdown' },
};

const TIER_LABEL: Record<WorldBattler['tier'], string> = {
  low: 'up-and-comer',
  mid: 'mid-tier name',
  top: 'top-tier name',
  god: 'elite-tier name',
};

/** "the Detroit up-and-comer" / "the top-tier name" */
function who(b: WorldBattler): string {
  return b.cityName ? `the ${b.cityName} ${TIER_LABEL[b.tier]}` : `the ${TIER_LABEL[b.tier]}`;
}

/** "12-4" or '' when the ledger is empty. */
function rec(b: WorldBattler): string {
  return b.wins + b.losses > 0 ? `${b.wins}-${b.losses}` : '';
}

/** " (12-4)" or "". */
function recParen(b: WorldBattler): string {
  const r = rec(b);
  return r ? ` (${r})` : '';
}

/** First usable style tag, lowercased — falls back to a craft noun. */
function styleOf(b: WorldBattler, fallback = 'pen game'): string {
  const tag = b.styleTags.find((t) => typeof t === 'string' && t.length > 2 && !/test/i.test(t));
  if (!tag) return fallback;
  return tag.replace(/\\/g, '/').toLowerCase();
}

function home(b: WorldBattler): string {
  return b.cityName ?? b.region ?? 'the underground';
}

// ============================================================================
// CALLOUTS — saying names, crashing faceoffs, tiered disrespect
// ============================================================================

const CALLOUTS: WorldEventTemplate[] = [
  {
    code: 'CALLOUT_INTERVIEW_NAME_DROP',
    category: 'callouts',
    weight: 14,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    headline: ({ a, b }) => `${a.name} Says ${b.name}'s Name On Camera — And Doesn't Blink`,
    body: ({ a, b, pick }) =>
      `Let me put you on to what really happened. ${a.name} sat down for a routine check-in interview — career talk, nothing spicy — and then the host asked the question every host asks: *who do you want next?*\n\n` +
      `No pause. No "any of the top guys." ${a.name} said **${b.name}**. First and last name energy. ${pick([
        `Then he leaned back like the contract was already signed.`,
        `Then he repeated it slower, in case the clip needed a second run.`,
        `The host tried to move on. ${a.name} did not move on.`,
      ])}\n\n` +
      `Word on the street is this isn't random. ${who(b).charAt(0).toUpperCase() + who(b).slice(1)} has been ${b.streak > 0 ? `riding a streak and collecting attention` : `in everybody's mouth lately`}, and ${a.name} clearly feels some type of way about the order of operations. Sources tell me there's already quiet conversation about what it would take to make it happen.\n\n` +
      `${b.name} hasn't responded yet. The clock on that response is the story now — every hour of silence makes it louder.`,
  },
  {
    code: 'CALLOUT_FACEOFF_CRASH',
    category: 'callouts',
    weight: 10,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    linkLeague: true,
    headline: ({ a, b, league }) => `${a.name} Crashes the ${league.name} Faceoffs to Press ${b.name}`,
    body: ({ a, b, league, pick }) =>
      `Let me put you on to what really happened at the ${league.name} faceoffs. ${b.name} was at the table doing promo for his next matchup — standard staredown content — when ${a.name} walked into frame **uninvited**, pulled up a chair, and asked why his name keeps getting dodged.\n\n` +
      `Security didn't move because honestly, nobody knew if it was a work. It wasn't a work. ${pick([
        `${b.name} kept his composure and told him to "holla at the league like a professional."`,
        `${b.name} laughed it off on camera, but people in the room say his energy changed.`,
        `${b.name} stood up. They were chest to chest before staff got between them.`,
      ])}\n\n` +
      `The culture is talking about it because crashing a faceoff is the second-highest tier of disrespect there is — it says *your event is now my event.* The league hasn't commented, but you'd better believe somebody in the office is doing math on what this matchup would draw.\n\n` +
      `Careers have been made off less.`,
  },
  {
    code: 'CALLOUT_SOCIAL_POST',
    category: 'callouts',
    weight: 13,
    articleType: 'scandal',
    blogger: 'marijuana_piranha',
    linkSecondary: true,
    headline: ({ a, b }) => `${a.name} Posts "Anybody Can Get It" — Then Tags ${b.name}`,
    body: ({ a, b, pick }) =>
      `Keep it a buck — the "anybody can get it" post is usually nothing. Battlers post that when the fridge is empty and the calendar is emptier. But ${a.name} didn't stop at anybody. He tagged **${b.name}** directly, then turned the comments off like he said what he said.\n\n` +
      `That's not fishing. That's aiming.\n\n` +
      `${pick([
        `The streets been saying these two got unfinished energy from a room they were both in last year.`,
        `People who move in those circles say this been simmering offline for a minute.`,
        `Nobody saw this one coming, which honestly makes it better.`,
      ])} ${b.name} is ${b.streak >= 2 ? `hot right now — ${b.streak} straight — so the timing is chess, not checkers` : `the kind of name that makes a callout mean something`}.\n\n` +
      `Keep it a buck one more time: if ${b.name} leaves that tag on read, that's a response too. The room remembers who answered the door and who pretended they wasn't home.`,
  },
  {
    code: 'CALLOUT_PRICE_TAG',
    category: 'callouts',
    weight: 9,
    articleType: 'scandal',
    blogger: 'coast_to_coast_coverage',
    linkSecondary: true,
    headline: ({ a, b }) => `${a.name} Says He'll Battle ${b.name} For Free — Here's Why That's a Trap`,
    body: ({ a, b }) =>
      `Let me tell you what they won't — "I'll do it for free" is the loudest price in battle rap.\n\n` +
      `${a.name} went on record this week saying he'd battle ${b.name} for **zero dollars**, "just to prove a point." The fan pages ate it up. Real ones know what it actually is: a public invoice. By making it free, ${a.name} made it impossible for ${b.name} to hide behind negotiations. No "the bag wasn't right." No "the league couldn't make it work." Just yes or no, on the record.\n\n` +
      `And let's be honest about the stakes. ${a.name}${recParen(a)} needs this more than ${b.name}${recParen(b)} does — that's exactly why it's smart. If ${b.name} accepts, ${a.name} gets the biggest look of his run. If ${b.name} declines, ${a.name} gets to scream *dodge* forever, free of charge.\n\n` +
      `Heads I win, tails you ducked. The oldest trap in the culture, and it still works every single time.`,
  },
  {
    code: 'CALLOUT_TOP5_SNUB',
    category: 'callouts',
    weight: 10,
    articleType: 'scandal',
    blogger: 'coast_to_coast_coverage',
    linkSecondary: true,
    headline: ({ a, b }) => `${a.name} Left ${b.name} Off His Top 5 — "He Knows What It Is"`,
    body: ({ a, b, pick }) =>
      `Let me tell you what they won't — a top 5 list is never about the five names on it. It's about the one name missing.\n\n` +
      `${a.name} ran his list on a podcast this week. Five names, all defensible. Then the host did his job: *"No ${b.name}?"* And ${a.name} smiled and said, **"He knows what it is."**\n\n` +
      `That's four words doing the work of three rounds. ${b.name} is ${who(b)}${b.streak > 0 ? ` on a ${b.streak}-battle heater` : ''} — leaving him off isn't an oversight, it's a position statement. ${pick([
        `And the delivery was too smooth to be improvised. That answer was written.`,
        `You could hear the host trying not to laugh. He knew he had the clip.`,
        `The clip was trending within the hour, which was obviously the whole point.`,
      ])}\n\n` +
      `${b.name}'s camp says he "doesn't do list politics." Sure. But somewhere there's a notebook, and somewhere in that notebook ${a.name}'s name just got underlined twice.`,
  },
  {
    code: 'CALLOUT_RECAP_DISSECTION',
    category: 'callouts',
    weight: 9,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    headline: ({ a, b }) => `${a.name} Goes On a Recap Channel and Picks ${b.name}'s Last Performance Apart`,
    body: ({ a, b, pick }) =>
      `Let me put you on to what really happened. Recap channels invite battlers on to talk *their own* careers. ${a.name} had other plans. Twenty minutes into the stream he steered the whole conversation to ${b.name}'s most recent showing and started grading it like a disappointed professor.\n\n` +
      `"Round short." "Choppy in the back half." "The room carried him." Quote after quote, each one calibrated to travel. ${pick([
        `The recap host kept saying "that's your peer though" and ${a.name} kept saying "is he?"`,
        `At one point he offered to break down the footage bar-region by bar-region. The host declined. Barely.`,
        `He ended with "no disrespect," which in this culture means maximum disrespect.`,
      ])}\n\n` +
      `Sources tell me ${b.name} watched the stream live. No response yet — but battlers don't forget public film study done on their name. This is how slow-burn matchups get born: not with a shove at a faceoff, but with a man calmly explaining why you're beatable, on the record, with timestamps.`,
  },
  {
    code: 'CALLOUT_EVENT_PULLUP',
    category: 'callouts',
    weight: 9,
    articleType: 'scandal',
    blogger: 'marijuana_piranha',
    linkSecondary: true,
    linkLeague: true,
    headline: ({ a, b, league }) => `${a.name} Pulled Up to ${b.name}'s ${league.name} Card and Stood Front Row`,
    body: ({ a, b, league, pick }) =>
      `Keep it a buck — there's a hundred seats in a small room, and ${a.name} chose the one directly in ${b.name}'s eyeline. Front row at ${league.name}, arms folded, no entourage, no phone out. Just watching.\n\n` +
      `That's the oldest message in the culture and it don't need subtitles. You pull up to a man's card and post up like that, you're telling the whole room: *I'm checking the product before I buy.*\n\n` +
      `${pick([
        `${b.name} acknowledged him mid-set with a nod. Respect. But the energy in the building shifted and everybody felt it.`,
        `${b.name} performed like he didn't see him. He saw him. The whole room saw him see him.`,
        `After the card they spoke for maybe thirty seconds. Nobody heard it. Everybody filmed it.`,
      ])}\n\n` +
      `No words got exchanged on camera, no push, no announcement. Don't matter. The streets already booked this one in they head. Now it's on the leagues to catch up to what the room already knows.`,
  },
  {
    code: 'CALLOUT_DM_LEAK',
    category: 'callouts',
    weight: 8,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    headline: ({ a, b }) => `Leaked DMs Show ${a.name} Has Been Asking For ${b.name} For Months`,
    body: ({ a, b, int }) =>
      `Let me put you on to what really happened. Screenshots started circulating last night — DMs between ${a.name} and a league matchmaker, dated going back ${int(3, 8)} months. The repeated request, in writing, over and over: **${b.name}**.\n\n` +
      `"Make it make sense money-wise and I'm there." "Ask him again." "What's his hesitation?" That last one is the quote doing the damage, because it reframes everything. Publicly, these two have been polite. Privately, ${a.name} has been at the matchmaker's door like a bill collector.\n\n` +
      `Who leaked it? That's the real question. ${a.name}'s camp says he's "not embarrassed — the pursuit is the proof." Cynics say that's exactly what you'd say if you leaked it yourself to force ${b.name}'s hand in public. The culture is talking about both possibilities at full volume.\n\n` +
      `Either way, the wall between *wanting* a battle and *campaigning* for one just came down. ${b.name} now has to answer a question he was never officially asked.`,
  },
  {
    code: 'CALLOUT_CHAMPION_CALL',
    category: 'callouts',
    weight: 8,
    articleType: 'scandal',
    blogger: 'coast_to_coast_coverage',
    linkSecondary: true,
    requires: ({ a, b }) => (b.tier === 'top' || b.tier === 'god') && a.rating < b.rating,
    headline: ({ a, b }) => `${a.name} Calls Out ${b.name}: "Rankings Mean Smoke"`,
    body: ({ a, b }) =>
      `Let me tell you what they won't — the rating gap between ${a.name} (${a.rating}) and ${b.name} (${b.rating}) is exactly why this callout matters, and exactly why the leagues will pretend they didn't hear it.\n\n` +
      `${a.name} said it plain this week: "Rankings mean smoke. Put me in the room with him and watch the numbers change." Predictably, the gatekeepers laughed. *He hasn't earned that look. He needs three more wins. Know your tier.*\n\n` +
      `Funny how the tier system only gets enforced upward. When a big name wants an easy night against someone below him, suddenly tiers are flexible. When the kid from ${home(a)} wants to jump the line, suddenly it's sacred math.\n\n` +
      `Here's the truth nobody at the top wants printed: ${b.name} gains nothing from accepting and ${a.name} gains everything. That's not a reason to deny the battle. That's the exact energy that built this culture — somebody unranked, disrespected, and certain. Make the room decide.`,
  },
  {
    code: 'CALLOUT_VET_GATEKEEP',
    category: 'callouts',
    weight: 8,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    requires: ({ a, b }) => (a.tier === 'top' || a.tier === 'god') && (b.tier === 'low' || b.tier === 'mid'),
    headline: ({ a, b }) => `${a.name} Tells ${b.name} to "Earn the Name First" — And ${b.name} Answers in Hours`,
    body: ({ a, b, pick }) =>
      `Let me put you on to what really happened. ${b.name}'s name came up in ${a.name}'s interview — fan question, harmless — and the veteran swatted it: "Earn the name first. I don't battle auditions."\n\n` +
      `Old script. Usually the young battler posts a sad quote and life goes on. Not this time. ${b.name} responded **within hours**, on camera: ${pick([
        `"Funny — when he was my age he was calling out everybody. The audition line is for people scared of homework."`,
        `"He said earn it. I'm trying to earn it off HIM. That's the whole point, big dog."`,
        `"Respect to the vet. But vets get retired by exactly this conversation."`,
      ])}\n\n` +
      `And just like that, a dismissal became a storyline. The drama here is generational: ${a.name} represents the era where you waited your turn; ${b.name} represents the era where you take it on camera. Word on the street is the response clip is outperforming the original interview three to one.\n\n` +
      `Gatekeeping only works until the gate gets more views than the keeper.`,
  },
  {
    code: 'CALLOUT_CITY_DISS',
    category: 'callouts',
    weight: 8,
    articleType: 'scandal',
    blogger: 'underground_voice',
    linkSecondary: true,
    requires: ({ b }) => !!b.cityName,
    headline: ({ a, b }) => `${a.name} Says ${b.cityName}'s Whole Scene Is "Sweet" — ${b.name} Takes It Personal`,
    body: ({ a, b }) =>
      `The underground sees everything — including ${a.name} deciding to insult an entire city to get to one man.\n\n` +
      `On a stream this week, ${a.name} called the ${b.cityName} scene "sweet top to bottom" — soft rooms, friendly judges, manufactured reputations. He named no names, which meant he named everybody. And in ${b.cityName}, everybody knows who the face of the scene is right now: **${b.name}**.\n\n` +
      `${b.name} treated it accordingly. "You don't get to rent my city for promo," he posted. "Say MY name or keep ours out your mouth." The rest of the ${b.cityName} roster lined up behind him within the hour — vets, rookies, even battlers who don't get along. That's the thing outsiders never learn: a city diss is the one move that unites a scene instantly.\n\n` +
      `${a.name} wanted attention and got an army. Now there's a whole roster that considers him homework. The underground keeps receipts longer than the mainstream keeps interest.`,
  },
  {
    code: 'CALLOUT_REMATCH_DEMAND',
    category: 'callouts',
    weight: 8,
    articleType: 'scandal',
    blogger: 'the_battle_breakdown',
    linkSecondary: true,
    requires: ({ h2h }) => !!h2h && h2h.aWins + h2h.bWins > 0,
    headline: ({ a, b }) => `${a.name} Demands the ${b.name} Rematch: "Run It Back"`,
    body: ({ a, b, h2h }) =>
      `Let's go to the scorecards — because that's exactly where ${a.name} wants this conversation.\n\n` +
      `The head-to-head between ${a.name} and ${b.name} currently reads **${h2h!.aWins}-${h2h!.bWins}**, and ${a.name} has decided that ledger is incomplete. "Run it back," he said this week. "Different prep, different result. I know what I did wrong and he knows what he got away with."\n\n` +
      `Strip the emotion out and the rematch case is genuinely interesting. ${a.name} is rated ${a.rating} with ${a.streak >= 0 ? `momentum on his side` : `something to prove`}; ${b.name} sits at ${b.rating} and gains little from agreeing — the classic champion's dilemma. Risk-reward analysis says ${b.name} should decline. Box-office analysis says the first meeting left questions, and unresolved questions are what sell rooms out.\n\n` +
      `My scorecard on the negotiation itself: ${a.name} took round one by going public first. ${b.name}'s rebuttal round is pending. Judges — meaning all of us — are watching.`,
  },
  {
    code: 'CALLOUT_OPEN_CHALLENGE',
    category: 'callouts',
    weight: 9,
    articleType: 'scandal',
    blogger: 'marijuana_piranha',
    headline: ({ a }) => `${a.name} Posts an Open Challenge With a Deadline Attached — and a Threat to Post the Silence`,
    body: ({ a, pick, int }) =>
      `Keep it a buck — open challenges are usually soft. "Anybody, anywhere" with no date is just a man talking to his ceiling. ${a.name} did it different: open challenge, **${int(48, 96)}-hour deadline**, and a promise to post the names of everyone who let the clock run out.\n\n` +
      `That last part is the gasoline. He's not challenging people to battle — he's challenging them to *respond*, and silence goes on the scoreboard too.\n\n` +
      `${pick([
        `The replies got real quiet from exactly the names you'd expect. The streets noticed.`,
        `Two smaller names accepted in the first hour. The bigger fish are still "checking schedules."`,
        `One vet replied with a laughing emoji. ${a.name} screenshotted it and wrote "that's a no, for the record."`,
      ])}\n\n` +
      `Is it a stunt? Course it's a stunt. But it's a stunt with a clock on it, and the culture respects a deadline more than a diss. ${a.name}${recParen(a)} is betting his name on somebody calling. We'll know in ${int(2, 4)} days who really wants smoke and who just likes the smell of it.`,
  },
  {
    code: 'CALLOUT_INTERVIEW_DISMISS',
    category: 'callouts',
    weight: 10,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    headline: ({ a, b }) => `Asked About ${b.name}, ${a.name} Just Said "Who?" — The Lowest Tier of Disrespect`,
    body: ({ a, b }) =>
      `Let me put you on to what really happened, because the clip doesn't do the temperature justice.\n\n` +
      `Interviewer asks ${a.name} about a potential ${b.name} matchup. ${a.name} squints. Tilts his head. **"Who?"** The interviewer repeats the name. ${a.name}: "Nah, doesn't ring a bell. Next question."\n\n` +
      `Understand the taxonomy here. Saying a name is tier-one engagement. Trashing a name is tier-two — at least you watched the film. But *"who?"* is the basement of disrespect: it denies a battler the one currency this culture runs on, which is being known. ${a.name} knows exactly who ${b.name} is — ${who(b)}${b.streak > 0 ? ` currently on a ${b.streak}-battle run` : ''} — and that's precisely what makes the bit land.\n\n` +
      `Sources tell me ${b.name}'s circle is split on the response. Half say ignore it; you don't answer a man pretending you don't exist. The other half say the only cure for "who?" is making the question impossible to ask twice.`,
  },
  {
    code: 'CALLOUT_BODYBAG_PROMISE',
    category: 'callouts',
    weight: 8,
    articleType: 'scandal',
    blogger: 'the_main_stage_herald',
    linkSecondary: true,
    headline: ({ a, b }) => `${a.name} Promises a 30-0 If ${b.name} Signs: "I'll Make It Unwatchable"`,
    body: ({ a, b }) =>
      `On the biggest stage in battle rap — which is where ${a.name} insists this needs to happen — promises are currency, and he just wrote a big check.\n\n` +
      `"If ${b.name} signs the contract, I'm not trying to edge him out," ${a.name} announced this week. "I'm talking thirty to nothing. I'll make it unwatchable. They'll cut the camera feed out of mercy."\n\n` +
      `A 30-0 guarantee is the heaviest pre-fight collateral a battler can put up, because it doesn't just predict a win — it predicts a *demolition*, and anything less reads as a loss. ${b.name}${recParen(b)} now holds the rarest position in the sport: he can profit off another man's promise simply by surviving three rounds.\n\n` +
      `Stakes, spectacle, a villain monologue — this is main-event marketing whether the leagues planned it or not. The only thing missing is ink on paper. If this one gets made, the pressure walking into that room will belong entirely to the man who promised perfection.`,
  },
  {
    code: 'CALLOUT_THREE_NAMES',
    category: 'callouts',
    weight: 10,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    headline: ({ a, b }) => `${a.name} Named Three Names — ${b.name} Answered Within the Hour`,
    body: ({ a, b, pick }) =>
      `Let me put you on to what really happened. ${a.name} ended an interview with a hit list — three names he wants "before the year is out." Two of them did the standard thing: silence, let the team handle it, wait for the news cycle to die.\n\n` +
      `**${b.name} answered in under an hour.**\n\n` +
      `"${pick([
        `Third on the list? I should be first. But fine — pull up.`,
        `He said my name like I'm hard to find. I'm the easiest man in this culture to locate.`,
        `Don't put me in a group text. Make the call.`,
      ])}" he posted, and the speed told the whole story. The other two names had publicists. ${b.name} had a grievance.\n\n` +
      `Word on the street is the response caught ${a.name}'s camp off guard — sources tell me ${b.name} was supposed to be the *safe* name on the list, the one for padding. Instead he's the one holding the door open saying *after you.* Funny how callouts work: you fire three shots to see who shoots back, and now you owe the one who did.`,
  },
];

// ============================================================================
// BEEF / DRAMA — shoving, deleted tweets, entourages, deeper than rap
// ============================================================================

const BEEF: WorldEventTemplate[] = [
  {
    code: 'BEEF_FACEOFF_SHOVE',
    category: 'beef',
    weight: 10,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    linkLeague: true,
    headline: ({ a, b, league }) => `Shoving at the ${league.name} Faceoffs: ${a.name} and ${b.name} Had to Be Separated`,
    body: ({ a, b, league, pick }) =>
      `Let me put you on to what really happened at the ${league.name} faceoffs, because the official footage cuts away at exactly the wrong moment.\n\n` +
      `${a.name} and ${b.name} started the staredown professional. Then somebody said something off-mic — lip readers are still arguing about what — and ${a.name} closed the distance. Two hands to the chest. ${b.name} came back with a shove of his own and suddenly four staff members were earning their pay.\n\n` +
      `${pick([
        `The wild part? They were never scheduled to battle each other. They were promoting separate matchups.`,
        `Word backstage is this was the third time they'd been kept apart that day.`,
        `One camera caught ${b.name} mouthing "after the card." Nobody's confirmed what that meant. Everybody knows what that meant.`,
      ])}\n\n` +
      `The league put out the standard "we don't condone physical altercations" statement, which translated from press-release means *we are checking how much this matchup would gross.* Sources tell me the answer is: a lot. Shoves don't end battles in this culture. They schedule them.`,
  },
  {
    code: 'BEEF_DELETED_TWEETS',
    category: 'beef',
    weight: 12,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    headline: ({ a, b }) => `${a.name} Deleted the Tweets About ${b.name} — Too Late, the Screenshots Are Forever`,
    body: ({ a, b, int, pick }) =>
      `Let me put you on to what really happened between roughly 1 and 3 a.m. last night.\n\n` +
      `${a.name} posted ${int(3, 7)} tweets about ${b.name}. No name attached — just "certain battlers" who ${pick([
        `"got handed they spot,"`,
        `"hide behind they league,"`,
        `"do numbers in rooms they never had to earn,"`,
      ])} plus details specific enough that nobody needed a decoder ring. By sunrise, every one of them was deleted.\n\n` +
      `Deleted, but not gone. The screenshots were circulating before the last tweet came down, complete with timestamps. And here's the law of the timeline: a deleted diss hits **harder** than a posted one, because deletion is a confession. You don't erase what you meant casually.\n\n` +
      `${b.name} responded with one word — "noted." — and somehow that's the scariest part of the whole exchange. Sources tell me mutual friends already tried to set up a call and got declined. The culture is talking about this one in group chats, not comment sections. That's how you know it's real.`,
  },
  {
    code: 'BEEF_ENTOURAGE_INCIDENT',
    category: 'beef',
    weight: 7,
    articleType: 'scandal',
    blogger: 'marijuana_piranha',
    linkSecondary: true,
    headline: ({ a, b }) => `It Wasn't ${a.name} and ${b.name} Who Got Into It — It Was Their People`,
    body: ({ a, b, pick }) =>
      `Keep it a buck — half the beef in this culture never touches the battlers. It's the people *around* them keeping score.\n\n` +
      `Back hallway, after the card. ${a.name}'s circle and ${b.name}'s circle ended up in the same narrow space, and somebody's man said something about somebody's man. Pushing. Yelling. ${pick([
        `A camera tripod went down and that's the only casualty anybody can confirm.`,
        `Security cleared the hallway in about ninety seconds, which in hallway-time is a year.`,
        `Both battlers were on the other side of the building when it popped off. That detail matters.`,
      ])}\n\n` +
      `Now here's the part the drama channels won't say: ${a.name} and ${b.name} got no real issue with each other. But entourage smoke has a way of becoming battler smoke, because now every interaction between these camps carries last night in it. Pride is contagious and so is loyalty.\n\n` +
      `The room will be watching the next time these two are booked on the same card. Keep it a buck — so will I.`,
  },
  {
    code: 'BEEF_DEEPER_THAN_RAP',
    category: 'beef',
    weight: 8,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    headline: ({ a, b }) => `"It's Deeper Than Rap": The ${a.name}–${b.name} Situation Has History Nobody Was Telling Us`,
    body: ({ a, b, pick }) =>
      `Let me put you on to what really happened, because the timeline only knows the last chapter of this book.\n\n` +
      `When ${a.name} said "it's deeper than rap" about ${b.name} this week, the casuals took it for promo. It is not promo. People close to both camps tell me the history goes back **before either man had a name** — ${pick([
        `same circles, same open mics, and a falling out over money that never got resolved, just buried.`,
        `they came up in the same crew, and the way one of them left still gets discussed in past tense and low voices.`,
        `a mutual friend, a loyalty test, and two completely different memories of who failed it.`,
      ])}\n\n` +
      `That's why the small jabs land so heavy. When ${a.name} mentions "people who switch up," he's not writing material — he's quoting his own life. When ${b.name} says "some guys never grew up," same thing.\n\n` +
      `The culture loves to say battles settle things. Word on the street is both men know this one can't be settled in three rounds — which is exactly why everybody wants to see them try.`,
  },
  {
    code: 'BEEF_SNEAK_DISS_TRACK',
    category: 'beef',
    weight: 9,
    articleType: 'scandal',
    blogger: 'marijuana_piranha',
    linkSecondary: true,
    headline: ({ a, b }) => `${a.name} Dropped a Track and the Streets Swear the Third Verse Is About ${b.name}`,
    body: ({ a, b, pick }) =>
      `Keep it a buck — battlers releasing music is usually a skip. But ${a.name} put a track out this week and the third verse got the whole timeline doing forensics.\n\n` +
      `No name said. Never a name said. But the details — ${pick([
        `the bar about "switching cities when the pressure came" lines up a little too clean with ${b.name}'s move,`,
        `the line about a man "who needs three rounds and two excuses" got people pulling up old footage,`,
        `that reference to "shaking hands with snakes at faceoffs" matches exactly one public moment, and ${b.name} was in it,`,
      ])} and the streets did the math instantly.\n\n` +
      `${b.name} got asked about it and said "I don't listen to demos." Cold response. Maybe too cold — that's the kind of answer you rehearse.\n\n` +
      `Sneak dissing is a tax dodge: all the damage, none of the liability. Real ones know ${a.name} left the name off on purpose, because now ${b.name} has to claim the shot to answer it. That's chess. Petty, beautiful, battle-rap chess.`,
  },
  {
    code: 'BEEF_MIC_GRAB',
    category: 'beef',
    weight: 7,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    headline: ({ a, b }) => `${b.name} Grabbed the Mic During ${a.name}'s Set — The Room Lost It`,
    body: ({ a, b, pick }) =>
      `Let me put you on to what really happened, because "interruption" doesn't cover it.\n\n` +
      `${a.name} was mid-set — talking to the crowd between rounds, doing his usual — when ${b.name} stepped out of the crowd, took the mic, and said his piece. Not yelling from the back like a heckler. **Walked up and took the mic.**\n\n` +
      `${pick([
        `"You been telling people I duck you. Tell the room to my face." Dead silence, then the loudest reaction of the night.`,
        `He didn't even raise his voice. "Run the rumor back, I'm right here." Then he handed the mic back. Surgical.`,
        `${a.name}'s DJ killed the music. Wrong move — now the whole room could hear everything.`,
      ])}\n\n` +
      `Etiquette-wise it's a violation; you don't hijack a man's moment. But the culture's relationship with violations is complicated, because the footage is everywhere and everybody watching wants the same thing now. Sources tell me at least two leagues called both camps before noon the next day. An interruption that turns into a contract isn't an interruption. It's an audition.`,
  },
  {
    code: 'BEEF_CREW_SPLIT',
    category: 'beef',
    weight: 8,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    headline: ({ a, b }) => `${a.name} Left the Crew — and ${b.name} Has Things to Say About How`,
    body: ({ a, b, pick }) =>
      `Let me put you on to what really happened, because crew splits are never about the announcement. They're about the order people found out.\n\n` +
      `${a.name} confirmed this week he's moving solo — no more crew cards, no more group entrances. Standard career move. Except ${b.name}, who shared that crew banner with him for years, found out **the same way we did**: from the post.\n\n` +
      `"${pick([
        `No call. No text. Years in the trenches together and I'm learning from the timeline,`,
        `I helped write some of the rounds that built his name. A heads-up would've been free,`,
        `It's not the leaving. Everybody leaves. It's the leaving like we were strangers,`,
      ])}" ${b.name} said on stream, and you could hear it wasn't promo voice. That was the real one.\n\n` +
      `${a.name}'s side says the split had been discussed internally for months and ${b.name} "knows more than he's playing." Word on the street: there's a version of this where they battle, and it would be the most personal card either man has ever taken. Crew beef cuts different — the opponent helped build the weapon.`,
  },
  {
    code: 'BEEF_HOTEL_LOBBY',
    category: 'beef',
    weight: 6,
    articleType: 'scandal',
    blogger: 'marijuana_piranha',
    linkSecondary: true,
    headline: ({ a, b }) => `Hotel Lobby Footage: ${a.name} and ${b.name} Got Heated the Night Before the Card`,
    body: ({ a, b, pick }) =>
      `Keep it a buck — the hotel lobby is the most dangerous venue in battle rap. No stage, no time limit, no judges, and everybody's flight already paid for.\n\n` +
      `Night before the card, ${a.name} and ${b.name} ended up in the same lobby, and a shaky vertical video shows what diplomats would call *an exchange of views*. Fingers pointed. Voices up. ${pick([
        `Somebody's road manager played goalie for a solid two minutes.`,
        `A third battler tried to mediate and got told — by both sides — to mind his business.`,
        `The front desk worker's face in the background is the best part of the footage, no contest.`,
      ])} No hands thrown. Plenty thrown verbally.\n\n` +
      `What was it about? Depends whose camp you ask. ${a.name}'s people say old money business. ${b.name}'s people say a comment that crossed a line months ago and never got addressed.\n\n` +
      `Both men performed the next night like professionals. But the room felt it, the cameras caught the dead-eye dap they exchanged, and keep it a buck: this one's not finished.`,
  },
  {
    code: 'BEEF_PODCAST_RESPONSE',
    category: 'beef',
    weight: 10,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    headline: ({ a, b }) => `${a.name} Spent 40 Minutes on a Podcast Responding to ${b.name} — Line by Line`,
    body: ({ a, b, pick }) =>
      `Let me put you on to what really happened. ${b.name} talked slick for thirty seconds in an interview last week. ${a.name} just answered with **forty minutes**.\n\n` +
      `Full podcast appearance. Brought notes — actual paper — and went through ${b.name}'s comments like a lawyer at deposition. "He said this. Here's the date. Here's why it's false. Next quote."\n\n` +
      `${pick([
        `The host barely spoke. Didn't need to. The man came to deliver a closing argument.`,
        `Around minute 28 he pulled out a receipt — an old flyer — that genuinely changed the story. The clip of that moment is everywhere.`,
        `He stayed calm the entire time, which somehow made it more brutal than yelling ever could.`,
      ])}\n\n` +
      `Some of the culture says it's an overreaction — you don't give a thirty-second jab a feature-length response. The other half says that's exactly how you bury a narrative before it grows legs. Word on the street is ${b.name} watched it twice. He hasn't responded yet, and after forty minutes of timestamps, you can understand the hesitation.`,
  },
  {
    code: 'BEEF_OLD_FOOTAGE_FRIENDS',
    category: 'beef',
    weight: 7,
    articleType: 'scandal',
    blogger: 'algorithm_institute',
    linkSecondary: true,
    headline: ({ a, b }) => `Resurfaced Footage Shows ${a.name} and ${b.name} as Friends — So What Happened?`,
    body: ({ a, b, int }) =>
      `In the annals of battle rap history, the saddest archives are the friendly ones.\n\n` +
      `Footage resurfaced this week — roughly ${int(4, 9)} years old — showing ${a.name} and ${b.name} at a small-room event, laughing on camera, finishing each other's sentences, plotting on the future like co-conspirators. ${a.name} even predicts, on tape, that ${b.name} would "be a problem for everybody soon." He was right. Including, eventually, for him.\n\n` +
      `Contrast that with the present: these two haven't been photographed within fifty feet of each other in years, and their public references to one another have the careful temperature of a cold war. Neither has ever explained the break publicly.\n\n` +
      `The archival record offers only clues — a crew that dissolved, a card they were both removed from, a stretch where one rose while the other rebuilt. Battle rap has always run on proximity: the same closeness that builds chemistry builds grievances. The old footage doesn't answer what happened. It just proves something real was lost, which is precisely why the culture can't stop watching it.`,
  },
  {
    code: 'BEEF_BLOCKED',
    category: 'beef',
    weight: 8,
    articleType: 'scandal',
    blogger: 'coast_to_coast_coverage',
    linkSecondary: true,
    headline: ({ a, b }) => `${a.name} Blocked ${b.name} — Blocked, But Not Battled`,
    body: ({ a, b }) =>
      `Let me tell you what they won't: in this culture, the block button is a press release.\n\n` +
      `${b.name} posted the screenshot this week — "You have been blocked by ${a.name}" — with the caption "blocked but not battled." And honestly? That caption is undefeated. Because what exactly did ${a.name} accomplish here? ${b.name} can't see his posts anymore. Everyone else can see the cowardice.\n\n` +
      `Here's the timeline they'd rather you forget: ${b.name} has been asking for this matchup publicly, repeatedly, politely-then-impolitely. ${a.name}${recParen(a)} responded to none of it — no counter-offer, no price, no "never, and here's why." Just silence, then a block. The big-name playbook, chapter one: when you can't dismiss a challenger on merit, dismiss him on mute.\n\n` +
      `The fans see it. The recap channels see it. Somewhere a league matchmaker sees it too, and matchmakers love nothing more than a battle one man clearly doesn't want. The block is temporary. The receipts are forever.`,
  },
  {
    code: 'BEEF_FAMILY_LINE',
    category: 'beef',
    weight: 6,
    articleType: 'scandal',
    blogger: 'marijuana_piranha',
    linkSecondary: true,
    headline: ({ a, b }) => `${a.name} Mentioned ${b.name}'s Family in a Freestyle — Did He Cross the Line?`,
    body: ({ a, b }) =>
      `Keep it a buck — this culture has exactly one rule everybody claims to respect and nobody can define: *the line.*\n\n` +
      `${a.name} was doing a loose radio freestyle this week — jabs at a few names, all sport — until he reached for ${b.name} and touched family. Not graphic, not violent. A reference. But the room's energy changed instantly, the host's face did that thing, and the clip was getting chopped for quote-posts before the verse even finished.\n\n` +
      `${b.name}'s response was four words: **"He knows my number."** That's not a tweet. That's a summons.\n\n` +
      `Now the culture's doing its eternal debate. One side: family is off-limits outside an actual battle, period — context is everything and a radio booth ain't a stage. Other side: we cheer family angles in rounds every weekend, so the outrage is selective.\n\n` +
      `Both things can be true. What can't be undone is the line got touched, and ${b.name} heard it. Whatever happens next was authored this week.`,
  },
  {
    code: 'BEEF_REFUSED_DAP',
    category: 'beef',
    weight: 9,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    headline: ({ a, b }) => `${b.name} Left ${a.name}'s Hand Hanging — The Coldest Clip of the Month`,
    body: ({ a, b, pick }) =>
      `Let me put you on to what really happened, because four seconds of footage is doing a lot of storytelling.\n\n` +
      `End of the card. Battlers dapping up battlers, standard procedure. ${a.name} extends a hand to ${b.name} — and ${b.name} looks at it, looks at him, and **walks**. No words. The hand just hangs there in 4K.\n\n` +
      `${pick([
        `${a.name} played it off with a laugh. The laugh did not reach his eyes.`,
        `Somebody off camera says "ohhhh" and that one syllable is the whole culture's review.`,
        `${a.name} turned to his man and said something. Lip readers are on the case as we speak.`,
      ])}\n\n` +
      `A refused dap is the most efficient diss in battle rap — zero bars, maximum statement. It says *whatever you did, I haven't forgotten it, and I want witnesses.* The mystery is the *what*. Sources tell me it traces back to something said in private that found its way public, but both camps have gone radio silent.\n\n` +
      `Silence plus a hanging hand equals a matchup waiting on paperwork. Watch.`,
  },
  {
    code: 'BEEF_RELATIONSHIP_HISTORY',
    category: 'beef',
    weight: 12,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    requires: ({ hasRelationship }) => hasRelationship,
    headline: ({ a, b }) => `The ${a.name}–${b.name} Tension Is Real, and It's Getting Worse`,
    body: ({ a, b, relationshipStory, pick }) =>
      `Let me put you on to what really happened — and what's still happening — between ${a.name} and ${b.name}.\n\n` +
      `This isn't manufactured promo. People close to both camps confirm the issue is real: ${relationshipStory ?? 'a grievance that started in the rooms and followed them both home.'}\n\n` +
      `What's new this week is the temperature. ${pick([
        `${a.name} referenced the situation on stream without saying the name — and then said the name.`,
        `They were offered the same card and one camp said "not unless it's against each other."`,
        `Mutual associates have stopped trying to broker peace. That's the tell. Peacemakers quit when they know.`,
      ])}\n\n` +
      `The culture is talking about it because this is the rare beef with actual stakes on both sides — ${a.name} at ${a.rating}, ${b.name} at ${b.rating}, both with reputations that don't survive a loss to the other gracefully. That's what makes a grudge battle different from a booking: somebody leaves the room *changed*.\n\n` +
      `Sources tell me at least one league has quietly priced it. When it happens — and word is *when*, not *if* — it'll headline.`,
  },
  {
    code: 'BEEF_NEGOTIATION_COLLAPSE',
    category: 'beef',
    weight: 9,
    articleType: 'scandal',
    blogger: 'the_main_stage_herald',
    linkSecondary: true,
    linkLeague: true,
    headline: ({ a, b }) => `The ${a.name} vs ${b.name} Negotiations Collapsed — and Both Sides Are Blaming Each Other`,
    body: ({ a, b, league, pick }) =>
      `On the biggest stage in battle rap, the hardest battle is the one that happens before the contract.\n\n` +
      `${league.name} had ${a.name} vs ${b.name} at the one-yard line — date discussed, venue scouted, both camps engaged. As of this week, it's dead. And the autopsy depends entirely on who's holding the scalpel.\n\n` +
      `${a.name}'s side says ${pick([
        `${b.name}'s number "doubled overnight" once he realized how much heat the matchup had.`,
        `${b.name} added conditions late — round order, format, who walks out last. Champagne requests on a beer budget.`,
        `${b.name} went quiet for two weeks at the exact moment papers needed signing.`,
      ])} ${b.name}'s side says ${a.name} was "negotiating through interviews" and poisoning the table.\n\n` +
      `Here's what's certain: the fans lost. This was the card. The stakes were real — ${a.name} at ${a.rating}, ${b.name} at ${b.rating}, styles built to collide. Failed negotiations in this culture rarely stay failed, though. They marinate. The next time these two are in a room together, somebody's bringing this up on camera, and the price goes up again.`,
  },
  {
    code: 'BEEF_RECEIPTS_READ_BACK',
    category: 'beef',
    weight: 8,
    articleType: 'scandal',
    blogger: 'battle_eyez',
    linkSecondary: true,
    headline: ({ a, b }) => `An Interviewer Read ${a.name} His Own Old Quotes About ${b.name} — It Got Uncomfortable`,
    body: ({ a, b, int }) =>
      `Let me put you on to what really happened, because this is the most uncomfortable eleven minutes of interview footage you'll watch this month.\n\n` +
      `${a.name} came on the show to promote, smile, keep it light. The host had other plans — and a folder. "You said this about ${b.name} ${int(2, 5)} years ago. Do you stand on it?" Then he **read the quote in full.** Then another one. Then a third.\n\n` +
      `Watching ${a.name} renegotiate with his own past self in real time was genuinely fascinating. The old quotes were confident, dismissive, borderline disrespectful. The new answers were... lawyerly. "Context matters." "We were different people." "I respect his growth." Each hedge played worse than the original disrespect ever did.\n\n` +
      `The culture is talking about it because ${b.name} is no longer the man those quotes were aimed at — he's ${who(b)} now${b.streak > 0 ? `, on a run` : ''}, and the power balance has shifted. Word on the street is ${b.name} reposted the clip with no caption. He didn't need one. The receipts spoke fluently.`,
  },
];

// ============================================================================
// LEAGUE BUSINESS — cards, venues, pay disputes, poaching, format wars
// ============================================================================

const LEAGUE_BUSINESS: WorldEventTemplate[] = [
  {
    code: 'LEAGUE_CARD_ANNOUNCE',
    category: 'league_business',
    weight: 14,
    articleType: 'league_update',
    blogger: 'the_main_stage_herald',
    linkSecondary: true,
    linkLeague: true,
    headline: ({ a, b, league }) => `${league.name} Announces Its Next Card — ${a.name} vs ${b.name} on Top`,
    body: ({ a, b, league, pick }) =>
      `On the biggest stage in battle rap — or at least the biggest one ${league.cityName ?? 'the city'} has to offer — ${league.name} just put its next card on the books, and the headliner writes its own promo: **${a.name} vs ${b.name}**.\n\n` +
      `Stylistically this is a collision, not a matchup. ${a.name} brings ${styleOf(a)}${a.streak > 0 ? ` and a ${a.streak}-battle streak that has him performing with house money` : ` and something to prove`}; ${b.name} counters with ${styleOf(b, 'pressure and presence')}${rec(b) ? ` and a ${rec(b)} ledger` : ''}. ${pick([
        `The undercard is reportedly stacked with local risers, but let's be honest — everyone's buying the main event.`,
        `League sources say the faceoff alone nearly needed its own ticket.`,
        `Early demand has the building's capacity looking optimistic.`,
      ])}\n\n` +
      `The stakes are clean: win this and you're in the title conversation at ${league.name}; lose and you're giving a career-altering moment to the other man's highlight reel. Date and venue details are rolling out this week. Clear your calendar — cards like this are why the culture watches.`,
  },
  {
    code: 'LEAGUE_VENUE_UPGRADE',
    category: 'league_business',
    weight: 9,
    articleType: 'league_update',
    blogger: 'the_main_stage_herald',
    linkLeague: true,
    headline: ({ league }) => `${league.name} Moves Its Next Event to a Bigger Room After Ticket Demand Explodes`,
    body: ({ league, a, int, pick }) =>
      `On the biggest stage in battle rap, the best problem you can have is a room that's too small — and ${league.name} just had it.\n\n` +
      `The league confirmed this week that its upcoming event is **moving venues** after the original room ${pick([
        `sold through its allocation in under ${int(2, 6)} days`,
        `hit capacity before the full card was even announced`,
        `was, in the league's own words, "not built for what this card became"`,
      ])}. The new building roughly doubles the footprint and adds a proper stage — a real one, with the lighting rig and everything.\n\n` +
      `Credit where due: this is what happens when a league strings together strong cards back to back. The roster's buzzing too — battlers like ${a.name} have been vocal that ${league.cityName ?? 'the city'} deserved a bigger platform, and rooms this size are where reputations get made at scale. More seats means more pressure, and more pressure is the whole sport.\n\n` +
      `Original tickets transfer automatically. The wall in the back is gone; the moment just got bigger.`,
  },
  {
    code: 'LEAGUE_PAY_DISPUTE',
    category: 'league_business',
    weight: 8,
    articleType: 'league_update',
    blogger: 'coast_to_coast_coverage',
    linkLeague: true,
    headline: ({ a, league }) => `${a.name} Airs Out ${league.name} Over Pay: "Check Bounced Energy"`,
    body: ({ a, league, pick }) =>
      `Let me tell you what they won't — for every battle you watch, there's an invoice somebody's dodging.\n\n` +
      `${a.name} went public this week on ${league.name}: ${pick([
        `paid late twice, short once, and "the apology was longer than the transfer."`,
        `still waiting on a balance from a card that happened months ago.`,
        `"they had budget for the stage design but not for the people standing on it."`,
      ])} The league responded with the classic two-step: *there are two sides to every story* plus *we handle business privately.* Translation: he's mostly right and they know it.\n\n` +
      `Here's the structural rot nobody upstream wants to discuss: battlers are independent contractors in a sport with no union, no standard contract, and no escrow. Speaking up gets you labeled "difficult." Staying quiet gets you robbed politely. ${a.name}${recParen(a)} chose difficult, and good for him.\n\n` +
      `Watch what happens next, though. The same fans calling him brave today will call him ungrateful when the league books his replacement. The culture loves honesty right up until it costs a card.`,
  },
  {
    code: 'LEAGUE_POACHING',
    category: 'league_business',
    weight: 11,
    articleType: 'league_update',
    blogger: 'battle_eyez',
    linkLeague: true,
    headline: ({ a, league, league2 }) => `${league2.name} Is Trying to Poach ${a.name} From ${league.name} — And It's Getting Messy`,
    body: ({ a, league, league2, pick }) =>
      `Let me put you on to what really happened behind the scenes this week.\n\n` +
      `${a.name} has been a ${league.name} staple — their rooms built his rhythm, their cards carry his footage. So when word leaked that **${league2.name}** flew him out for "a conversation," the temperature in both offices changed immediately.\n\n` +
      `${pick([
        `Sources tell me the offer includes a multi-battle deal and a guaranteed main-stage slot — the exact thing ${league.name} has been slow-walking.`,
        `The kicker: ${league2.name} allegedly pitched him at a hotel two blocks from a ${league.name} event. Petty? Spectacularly.`,
        `${league.name}'s owner found out from a recap channel, not from ${a.name}. That detail is doing damage.`,
      ])}\n\n` +
      `League loyalty is the culture's favorite myth. The truth: leagues are platforms, battlers are the product, and the product goes where the checks clear. ${a.name} owes ${league.name} good performances, which he has delivered${rec(a) ? ` (${rec(a)} and counting)` : ''}. He does not owe them a career.\n\n` +
      `No paper signed yet. But word on the street is ${league.name} suddenly found room in the budget for a counter-offer. Funny how that works.`,
  },
  {
    code: 'LEAGUE_IN_TALKS',
    category: 'league_business',
    weight: 12,
    articleType: 'league_update',
    blogger: 'the_main_stage_herald',
    linkLeague: true,
    headline: ({ a, league }) => `Confirmed: ${league.name} Is In Talks With ${a.name}`,
    body: ({ a, league, pick }) =>
      `On the biggest stage in battle rap, the phrase "in talks" carries more drama than most battles — and ${league.name} just confirmed it applies to **${a.name}**.\n\n` +
      `The league's social account posted the eyes emoji over ${a.name}'s name; ${a.name} reposted it within minutes. In this economy of hints, that's practically a press conference.\n\n` +
      `Why it makes sense: ${league.name} has been hunting for ${pick([
        `a fresh headliner whose style their crowd hasn't seen live`,
        `exactly the kind of ${styleOf(a)} threat their roster currently lacks`,
        `a name that travels beyond ${league.cityName ?? 'their home market'}`,
      ])}, and ${a.name}${recParen(a)} is ${a.streak > 0 ? `arriving hot — winners of his last ${a.streak} — ` : `a proven room-mover `}at rating ${a.rating}.\n\n` +
      `The open questions are the usual three: money, matchup, and main-event billing. Debuts like this live or die on the first opponent — too soft and the signing looks like a photo op, too dangerous and you risk your new asset on night one. Stakes for everyone involved. That's exactly how the big stage likes it.`,
  },
  {
    code: 'LEAGUE_PROVING_GROUND',
    category: 'league_business',
    weight: 9,
    articleType: 'league_update',
    blogger: 'underground_voice',
    linkLeague: true,
    headline: ({ league }) => `${league.name} Opens a Proving-Ground Event for Unsigned Talent`,
    body: ({ league, a, int }) =>
      `The underground sees everything — and once a year, if we're lucky, a league decides to look too.\n\n` +
      `${league.name} announced a proving-ground event: **${int(8, 16)} unsigned battlers**, short rounds, no entry fee, winners guaranteed a slot on a real card. Submissions are open to anyone with footage and the nerve.\n\n` +
      `Let's be clear about why this matters. The pipeline from open mic to main stage is broken in most cities — talent rots in rooms nobody films while leagues recycle the same twelve names. Proving grounds fix that the honest way: in public, on merit, with stakes. ${a.name} came up through exactly this kind of door${a.cityName ? ` back in ${a.cityName}` : ''}, and look at him now — rated ${a.rating} and nobody's "unsigned" anything.\n\n` +
      `My advice to every battler reading this with a notebook full of rounds and no bookings: submit. The gatekeepers can't ignore what happens in their own building. The underground's been ready. Now there's a door — kick it.`,
  },
  {
    code: 'LEAGUE_STREAM_NUMBERS',
    category: 'league_business',
    weight: 9,
    articleType: 'league_update',
    blogger: 'the_battle_breakdown',
    linkLeague: true,
    headline: ({ league }) => `The Numbers Are In: ${league.name}'s Last Event Outperformed Expectations`,
    body: ({ league, a, b, int }) =>
      `Let's go to the scorecards — the business ones this time.\n\n` +
      `${league.name}'s latest event posted numbers that deserve analysis: roughly **${int(35, 90)}% above** their recent average on streams, with replay retention that suggests people watched whole battles, not just moments. For a league operating out of ${league.cityName ?? 'a mid-size market'}, that's a meaningful data point, not a fluke.\n\n` +
      `Breaking down the drivers: first, card construction — they front-loaded a genuine stylistic clash instead of saving everything for the main. Second, the faceoffs did real promotional work; the ${a.name} segment alone traveled well beyond the league's usual audience. Third — and leagues consistently undervalue this — the event started roughly on time.\n\n` +
      `The technical takeaway: quality cards compound. New viewers who arrived for one battle stay subscribed for the next card, which raises the floor for every battler on the roster, including names like ${b.name} who haven't headlined yet.\n\n` +
      `Final scorecard: a clear round for ${league.name}. Sustaining it is the harder fight.`,
  },
  {
    code: 'LEAGUE_NEW_CHAMBER',
    category: 'league_business',
    weight: 8,
    articleType: 'league_update',
    blogger: 'underground_voice',
    linkLeague: true,
    headline: ({ league }) => `${league.name} Is Adding a Second Chamber — A Real Lane for Developing Talent`,
    body: ({ league, a }) =>
      `The underground sees everything — and what it's seen for years is talented battlers stuck in the waiting room because every league has one stage and twelve slots.\n\n` +
      `${league.name} is doing something about it: a **second chamber**. Smaller room, earlier slots, shorter rounds — a development league inside the league. Perform there, build a tape, graduate to the main cards. The model is old, proven, and criminally underused.\n\n` +
      `Skeptics will call it a B-card. Let them. Some of the best battlers alive built their names in exactly these rooms, where the crowd stands close enough to read your notes and there's nowhere to hide a weak round. ${a.name} has said versions of this himself — the small room is where you find out who can actually rap.\n\n` +
      `What I'll be watching: whether ${league.name} actually promotes chamber footage or lets it die unfilmed. A second stage only matters if the cameras come too. Give the developing talent the same production, and in two years this chamber will have produced somebody the main stage can't ignore.`,
  },
  {
    code: 'LEAGUE_DOUBLE_BOOKING',
    category: 'league_business',
    weight: 7,
    articleType: 'league_update',
    blogger: 'battle_eyez',
    linkLeague: true,
    headline: ({ a, league, league2 }) => `${a.name} Is Booked on ${league.name} AND ${league2.name} — Same Night`,
    body: ({ a, league, league2, pick }) =>
      `Let me put you on to what really happened, because two flyers are circulating and they cannot both be right.\n\n` +
      `${league.name} announced ${a.name} for their upcoming card. Hours later, ${league2.name} announced ${a.name} for **theirs** — same date, different city. Either a man has figured out teleportation or somebody's contract reading needs work.\n\n` +
      `${pick([
        `Sources tell me ${a.name}'s side gave a "soft yes" to both, betting one card would move. Neither moved.`,
        `Word is one league announced early specifically to force the conflict public. Leagues play chess with each other's rosters constantly.`,
        `${a.name}'s manager is reportedly calling it a "calendar miscommunication," which is what you call it when you got caught.`,
      ])}\n\n` +
      `Whoever loses this tug-of-war eats more than embarrassment: a hole in a sold card is a refund conversation. And ${a.name} risks the one label that follows a battler longer than any loss — *unreliable*. Wins age well. Flake stories never do.\n\n` +
      `Both leagues say "it's being handled." One of those statements is about to be wrong.`,
  },
  {
    code: 'LEAGUE_EXCLUSIVE_SIGNING',
    category: 'league_business',
    weight: 10,
    articleType: 'league_update',
    blogger: 'the_main_stage_herald',
    linkLeague: true,
    headline: ({ a, league }) => `${a.name} Signs Exclusive With ${league.name} — A Statement Deal`,
    body: ({ a, league, int }) =>
      `On the biggest stage in battle rap, exclusivity is the ultimate flex — for both sides of the table.\n\n` +
      `${league.name} announced this week that **${a.name}** has signed an exclusive multi-battle deal: ${int(3, 6)} battles, league-controlled matchups, and what sources describe as "main-card money throughout." No more guest spots elsewhere. ${a.name} battles for one banner now.\n\n` +
      `For the league, it's a cornerstone purchase — ${a.name}${recParen(a)} at rating ${a.rating} gives every future card a center of gravity. For ${a.name}, it's security in a sport that runs on handshakes, plus the leverage of being a franchise face rather than a freelancer.\n\n` +
      `The risk cuts both ways, and that's what makes it compelling. If he runs the table, he renegotiates from a throne. If he drops two early, the league owns the rebuild and every recap channel gets a "was the deal a mistake?" episode.\n\n` +
      `Pressure, spectacle, consequences. This is how main events get manufactured — one signature at a time.`,
  },
  {
    code: 'LEAGUE_REPLACEMENT_HERO',
    category: 'league_business',
    weight: 9,
    articleType: 'league_update',
    blogger: 'the_main_stage_herald',
    linkSecondary: true,
    linkLeague: true,
    headline: ({ b, league }) => `Main Event Scratched — ${b.name} Steps Up on Six Days' Notice at ${league.name}`,
    body: ({ a, b, league, pick }) =>
      `On the biggest stage in battle rap, careers are made two ways: by years of grinding, or by one phone call answered at the right moment. ${b.name} just answered.\n\n` +
      `${league.name}'s main event collapsed this week — ${pick([
        `an injury in the headliner's camp`,
        `a travel issue nobody could solve in time`,
        `a contract standoff that finally broke the wrong way`,
      ])} — leaving ${a.name} without an opponent and the card without its anchor. Six days out, most names ducked the call. Short-notice battles are how reputations get totaled: no prep time, full expectations.\n\n` +
      `${b.name} took it anyway. "Send the contract," he reportedly said before hearing the number.\n\n` +
      `Understand what's at stake. If ${b.name} shows up half-ready and gets washed, the culture forgives it in a month — short notice is short notice. But if he *performs*? If he pushes ${a.name} — rated ${a.rating}, fully prepped — on six days? That's the kind of moment that gets replayed for years. Fortune favors whoever says yes.`,
  },
  {
    code: 'LEAGUE_EXPANSION_CITY',
    category: 'league_business',
    weight: 8,
    articleType: 'league_update',
    blogger: 'underground_voice',
    linkLeague: true,
    headline: ({ league, city2 }) => `${league.name} Is Expanding to ${city2.name} — The Scene There Earned It`,
    body: ({ league, city2, a }) =>
      `The underground sees everything — including which cities have been carrying weight without recognition. ${league.name} finally saw it too: they're expanding to **${city2.name}**.\n\n` +
      `First event is in the works now, and the league says the cards will lean local — ${city2.name} talent first, imports second. That's the right order, and frankly the only order that works. Cities can smell a carpetbagger league instantly: fly in, use the skyline for promo, book zero locals, leave. Those events get one polite crowd and no second chances.\n\n` +
      `${city2.name}'s scene has earned this the long way — ${city2.sceneSize === 'major' || city2.sceneSize === 'large' ? `it's one of the most active scenes in the country, with rooms running monthly and a deep bench of names ready for bigger lights` : `small rooms, consistent crowds, and a tight roster of battlers who've been sharpening each other for years with no industry attention`}.\n\n` +
      `Names like ${a.name} proved regional talent travels. Now the infrastructure is finally traveling back. More stages in more cities — that's how this culture actually grows, not another mega-card in the same three markets.`,
  },
  {
    code: 'LEAGUE_JUDGING_EXPERIMENT',
    category: 'league_business',
    weight: 8,
    articleType: 'league_update',
    blogger: 'the_battle_breakdown',
    linkLeague: true,
    headline: ({ league }) => `${league.name} Brings Back Judges — And the Purists Are Already Furious`,
    body: ({ league, int }) =>
      `Let's go to the scorecards — literally, because ${league.name} just announced their next event will have them. A ${int(3, 5)}-judge panel, round-by-round verdicts read in the room, decisions final.\n\n` +
      `The battle lines formed instantly. Purists say judging kills the culture's oral tradition — let the room react, let the debate live forever in comments and barbershops. The unresolved argument IS the product, they insist. Why would you settle the only conversation that keeps a battle alive for years?\n\n` +
      `The other side, where I admittedly live: accountability raises stakes. When nothing is on the line but vibes, prepared battlers and lazy battlers cash the same check. A verdict — flawed, human, arguable — forces consequences, and consequences force craft.\n\n` +
      `The technical questions are where this lives or dies: published criteria or gut feel? Writing weighted against performance how? Do judges see the crowd or sit isolated? ${league.name} hasn't said, and that silence is doing the purists' arguing for them.\n\n` +
      `My early scorecard: right idea, incomplete execution. Round two is theirs to win.`,
  },
  {
    code: 'LEAGUE_NO_SHOW_FALLOUT',
    category: 'league_business',
    weight: 8,
    articleType: 'league_update',
    blogger: 'coast_to_coast_coverage',
    linkLeague: true,
    headline: ({ a, league }) => `${league.name} Addresses the ${a.name} No-Show — With Receipts`,
    body: ({ a, league, pick }) =>
      `Let me tell you what they won't — no-shows are the culture's oldest tax, and the fans always pay it.\n\n` +
      `${a.name} missed his ${league.name} card. No advance word, no statement until the room was already full and the slot already dead. The league, to their rare credit, didn't do the usual quiet shuffle. They went public **with receipts**: ${pick([
        `the confirmed itinerary, the unanswered calls, the timestamp on his last "I'm locked in" text.`,
        `screenshots of the deposit clearing and the silence that followed.`,
        `a full timeline, hour by hour, ending with the crowd being told at doors.`,
      ])}\n\n` +
      `${a.name}'s response cited "circumstances beyond his control," which is the no-show national anthem. Maybe it's even true — life happens. But here's the asymmetry nobody fixes: when a battler flakes, the league refunds, the undercard scrambles, the fans eat travel costs. The battler eats a news cycle and gets rebooked in three months because his name still sells.\n\n` +
      `Until reliability costs more than it pays, this keeps happening. Watch — he'll headline somewhere by spring.`,
  },
  {
    code: 'LEAGUE_ANNIVERSARY',
    category: 'league_business',
    weight: 8,
    articleType: 'league_update',
    blogger: 'algorithm_institute',
    linkLeague: true,
    headline: ({ league, int }) => `${league.name} Turns ${int(5, 12)}: An Institution Nobody Believed In`,
    body: ({ league, a, pick }) =>
      `In the annals of battle rap history, league anniversaries deserve more ceremony than they get — because the graveyard of dead leagues is enormous, and survival is the rarest achievement in this business.\n\n` +
      `${league.name} celebrates another year this month. Consider what that actually means: years of venues booked on faith, battlers paid out of pocket during slow stretches, cards rebuilt overnight when headliners vanished. ${pick([
        `The league's early events drew crowds you could count from the stage. The footage survives, and it's humbling.`,
        `Their first card reportedly lost money. So did the second. The third broke even and they called it momentum.`,
        `There were at least two moments, by the owner's own admission, where the next event was nearly the last.`,
      ])}\n\n` +
      `The roster tells the institutional story best. Battlers like ${a.name} sharpened their craft in these rooms${league.cityName ? `, and ${league.cityName}'s scene is measurably stronger for the platform` : ''}. Leagues don't just host battles — they manufacture local history, one card at a time.\n\n` +
      `Most don't make it past year two. This one's still standing. The archive grows.`,
  },
  {
    code: 'LEAGUE_FORMAT_CHANGE',
    category: 'league_business',
    weight: 8,
    articleType: 'league_update',
    blogger: 'the_battle_breakdown',
    linkLeague: true,
    headline: ({ league }) => `${league.name} Changes Its Round Format — Here's Who It Helps and Who It Hurts`,
    body: ({ league }) =>
      `Let's go to the scorecards — because ${league.name} just changed what a scorecard even measures. The league announced a format shift for upcoming cards: longer rounds, fewer of them, with the stated goal of rewarding "complete writers over moment hunters."\n\n` +
      `Format is destiny in this sport, so let's break down the winners and losers.\n\n` +
      `**Helped:** stamina writers — battlers who build rounds like arguments, layering angles that pay off ninety seconds in. Longer rounds let a scheme breathe. Pen-first battlers who get edged by crowd-moment merchants should be celebrating.\n\n` +
      `**Hurt:** burst performers. The thirty-second-haymaker specialists who win rooms on two explosions per round now have more dead air to fill, and dead air is where reputations drown. Energy battlers will need third and fourth gears they've never shown.\n\n` +
      `**The wildcard:** crowd fatigue. Longer rounds in a hot room test the audience as much as the battlers, and a drained crowd flattens everyone's material.\n\n` +
      `Smart leagues tune formats like instruments. We'll hear at the next card whether this one's in key.`,
  },
];

// ============================================================================
// STREETS / CULTURE — viral clips, classics aging like wine, barbershop debates
// ============================================================================

const STREETS_CULTURE: WorldEventTemplate[] = [
  {
    code: 'CULTURE_VIRAL_CLIP',
    category: 'streets_culture',
    weight: 13,
    articleType: 'culture',
    blogger: 'marijuana_piranha',
    headline: ({ a }) => `A 15-Second Clip of ${a.name} Escaped the Culture — Now the Tourists Are Here`,
    body: ({ a, int, pick }) =>
      `Keep it a buck — every few months a clip jumps the fence, and this week it was ${a.name}'s turn. Fifteen seconds of him ${pick([
        `walking down a man mid-round, crowd already gone before the punch even lands`,
        `turning a heckler into material without breaking stride`,
        `hitting a rebuttal so clean the other man's own people reacted`,
      ])}, and now it's everywhere — meme pages, sports accounts, people who couldn't name three battlers reposting it with fire emojis.\n\n` +
      `${int(2, 9)} million views and climbing. The quote tweets are a safari: "why is he yelling," "is this scripted," "who won?" Bless their hearts.\n\n` +
      `Here's the real conversation though. Viral moments are loans, not gifts. The tourists pull up, watch one clip, maybe click one full battle — and if the product don't hold them, they're gone by Friday. The culture keeps what the culture converts.\n\n` +
      `For ${a.name}? This is house money. ${who(a).charAt(0).toUpperCase() + who(a).slice(1)} just became some kid's first battler. That's how all of us got here — one clip, then the rabbit hole.`,
  },
  {
    code: 'CULTURE_CLASSIC_RESURFACE',
    category: 'streets_culture',
    weight: 12,
    articleType: 'culture',
    blogger: 'algorithm_institute',
    headline: ({ a }) => `${a.name}'s Old Third Round Is Trending Again — It Aged Like Wine`,
    body: ({ a, int }) =>
      `In the annals of battle rap history, certain rounds refuse to stay archived. This week, the algorithm resurrected one: ${a.name}'s third round from a small-room card roughly ${int(3, 8)} years back, recirculating with the caption *"this aged like wine"* — and the caption is correct.\n\n` +
      `Context is everything. At the time, the round was received as merely good — the crowd was thin, the camera angle unflattering, and the card had a louder controversy that swallowed the coverage. But listen now, with modern ears: the angle construction was years ahead of its era. Predictions in that round about where the culture was heading have since come true, almost line for line. What read as reaching then reads as prophecy now.\n\n` +
      `This is the archive's quiet justice. Battles are judged twice — once by the room, once by history — and the second verdict is the one that lasts. ${a.name}, rated ${a.rating} today, has the rare distinction of a catalog that appreciates.\n\n` +
      `Study the old footage. The future keeps hiding in it.`,
  },
  {
    code: 'CULTURE_BARBERSHOP_DEBATE',
    category: 'streets_culture',
    weight: 12,
    articleType: 'culture',
    blogger: 'marijuana_piranha',
    linkSecondary: true,
    requires: ({ a, b }) => !!a.cityName && a.cityName === b.cityName,
    headline: ({ a, b, city }) => `The ${city.name} Barbershop Question: ${a.name} or ${b.name}?`,
    body: ({ a, b, city, pick }) =>
      `Keep it a buck — rankings are decided in barbershops long before any algorithm gets a vote. And right now, every shop in ${city.name} is running the same debate: **${a.name} or ${b.name}?**\n\n` +
      `A clip from one shop made the rounds this week — grown men pausing haircuts to argue. The ${a.name} side: ${pick([
        `"his pen is just heavier, you can't teach that."`,
        `"he wins the moments that matter. Big-room DNA."`,
        `"run the catalogs back to back. It's not close."`,
      ])} The ${b.name} side: ${pick([
        `"he never has a bad night. Floor wins championships."`,
        `"the other man's got highlights; THIS man's got rounds."`,
        `"put 'em in the same room and watch who the crowd leans to."`,
      ])}\n\n` +
      `One man with a half-finished fade said the only answer that matters: "Why we debating? Book it." Shop went quiet, then everybody started talking at once.\n\n` +
      `Same city, ${a.rating} versus ${b.rating} on the boards, zero rounds of evidence between them. The streets already wrote the contract. Somebody bring the paper.`,
  },
  {
    code: 'CULTURE_PODCAST_HOT_TAKE',
    category: 'streets_culture',
    weight: 11,
    articleType: 'culture',
    blogger: 'coast_to_coast_coverage',
    headline: ({ a }) => `A Podcast Called ${a.name} "Already Top Tier" — And the Gatekeepers Came Running`,
    body: ({ a, pick }) =>
      `Let me tell you what they won't — half this culture's discourse is just gatekeepers defending seating charts.\n\n` +
      `A podcast host said it plain this week: "${a.name} is already top tier. I said what I said." The clip traveled fast, and the responses arrived faster — vets posting hourglass emojis, purists drafting essays about "the process," list-keepers clutching their laminated rankings.\n\n` +
      `Now, is the take early? Maybe. ${a.name} is ${who(a)}${rec(a) ? ` with a ${rec(a)} record` : ''} and a rating of ${a.rating} — the resume's still printing. But watch *who* got mad and *how*. ${pick([
        `Nobody disputed the rounds. They disputed his "place in line." Different argument entirely.`,
        `The loudest objectors haven't taken a risky battle in years. Tier defense is their cardio.`,
        `One vet said "he hasn't beaten anybody" — said it while ducking him. You can't make this up.`,
      ])}\n\n` +
      `Tiers were supposed to describe reality, not ration it. Every time a hot take like this causes panic, it's because somebody knows the kid might be right — and proximity to the throne is the only thing they've got left to defend.`,
  },
  {
    code: 'CULTURE_RECAP_CIVIL_WAR',
    category: 'streets_culture',
    weight: 9,
    articleType: 'culture',
    blogger: 'the_battle_breakdown',
    linkSecondary: true,
    headline: ({ a, b }) => `The Recap Channels Are at War Over ${a.name} vs ${b.name} — and the Debate Is Better Than Most Battles`,
    body: ({ a, b }) =>
      `Let's go to the scorecards — except this week, nobody can agree what the scorecards say. A hypothetical ${a.name} vs ${b.name} matchup has split the recap ecosystem clean down the middle, and the crossfire is genuinely excellent analysis.\n\n` +
      `Channel one ran a 40-minute breakdown arguing ${a.name}'s ${styleOf(a)} neutralizes everything ${b.name} builds his rounds around. Channel two responded with film: side-by-side clips showing ${b.name} dismantling that exact archetype before. Channel three made a tier list. Channel three always makes a tier list.\n\n` +
      `The technical disagreement is real, though. ${a.name} at ${a.rating} and ${b.name} at ${b.rating} are close enough on paper that style matters more than resume — and they're stylistic opposites. One wins on accumulation, pressure across all three rounds. The other wins on detonation, two moments a round that erase everything between them. How you score that clash depends entirely on your scoring philosophy, which is why the channels can't converge.\n\n` +
      `Only one judge can settle it: a room. Somebody book the deliberation.`,
  },
  {
    code: 'CULTURE_RAPPER_COSIGN',
    category: 'streets_culture',
    weight: 9,
    articleType: 'culture',
    blogger: 'battle_eyez',
    headline: ({ a }) => `A Platinum Rapper Just Quoted ${a.name} On Main — The Cosign Heard Round the Culture`,
    body: ({ a, pick }) =>
      `Let me put you on to what really happened last night, because the culture's phone has not stopped buzzing.\n\n` +
      `A certified, platinum, arena-tour rapper — you know exactly the caliber — posted a clip of ${a.name} to his main account. Caption: ${pick([
        `"battle rap got the best writers in the genre and y'all sleep."`,
        `"this man been cold. somebody put him on a bigger stage."`,
        `three fire emojis and a follow. Sometimes that's the whole press release.`,
      ])}\n\n` +
      `Within an hour: ${a.name}'s mentions flooded, his old footage views spiked, and every league with a working checkbook remembered his number. That's what a mainstream cosign does — it doesn't change the product, it changes the *lighting*.\n\n` +
      `The culture's relationship with these moments is complicated, and it should be. Cosigns bring tourists, tourists bring money, money brings problems and platforms in equal measure. The vets remember names who chased the industry wave and washed out of both worlds.\n\n` +
      `Word on the street is ${a.name}'s handling it correctly: said thank you once, then went quiet. Let them come to you. The leverage only works if you don't spend it immediately.`,
  },
  {
    code: 'CULTURE_FREESTYLE_DEBATE',
    category: 'streets_culture',
    weight: 9,
    articleType: 'culture',
    blogger: 'marijuana_piranha',
    headline: ({ a }) => `${a.name}'s Radio Freestyle Restarted the Oldest Argument in the Culture`,
    body: ({ a, pick }) =>
      `Keep it a buck — every time a battler touches a radio freestyle, the same civil war reignites, and this week ${a.name} lit the match.\n\n` +
      `He pulled up to a morning show, got the instrumental, and went ${pick([
        `straight off the head — names in the room, the host's outfit, the weather. Reckless and alive.`,
        `with something suspiciously polished. Smooth, structured... and the streets immediately called written.`,
        `half and half — started written, then a phone fell in the studio and he flipped it instantly. That five seconds is the whole clip.`,
      ])}\n\n` +
      `Now the timeline's split into the eternal camps. Camp one: freestyle means OFF THE TOP, period — anything else is theater. Camp two: "freestyle" has meant "unreleased verse" since before half these purists were born; the word evolved, keep up.\n\n` +
      `Here's my dog-in-the-fight: battle rap fans should care about ONE thing — can you handle the unscripted moment? Rebuttals, crowd flips, recovery from a stumble. That's the freestyle that pays bills in our sport. ${a.name} showed flashes of exactly that, and that's why the clip matters more than the debate ever will.`,
  },
  {
    code: 'CULTURE_LOST_FOOTAGE',
    category: 'streets_culture',
    weight: 8,
    articleType: 'culture',
    blogger: 'algorithm_institute',
    headline: ({ a }) => `Lost Footage of an Early ${a.name} Battle Just Surfaced — The Archive Grows`,
    body: ({ a, int, pick }) =>
      `In the annals of battle rap history, nothing thrills an archivist like a recovered tape — and this week the culture got one. Footage long presumed lost, of ${a.name} battling roughly ${int(5, 10)} years ago, surfaced from ${pick([
        `a retired videographer's hard drive, uploaded with a one-line caption: "found this cleaning out files."`,
        `a fan's old phone backup, vertical and grainy and absolutely priceless.`,
        `the venue owner's archive, sitting unlabeled between soundcheck recordings.`,
      ])}\n\n` +
      `The historical value is immense. This is pre-polish ${a.name} — the hunger visible, the signature style only half-formed. You can watch, in real time, the exact tools that would later define him being test-fired in front of forty people: early versions of the ${styleOf(a)} approach, rough but unmistakable.\n\n` +
      `Career arcs are usually reconstructed from memory and exaggeration. Footage corrects the record. The man rated ${a.rating} today was once a kid talking himself into greatness in a room with one working speaker — and now that proof is permanent.\n\n` +
      `Preserve your tapes, videographers. The culture's history is sitting on dying hard drives.`,
  },
  {
    code: 'CULTURE_BAR_OF_THE_YEAR',
    category: 'streets_culture',
    weight: 9,
    articleType: 'culture',
    blogger: 'small_room_report',
    headline: ({ a }) => `The Bar of the Year Race Has a Frontrunner — and It Happened in a Room of 80 People`,
    body: ({ a }) =>
      `The small room doesn't lie — and this year's Bar of the Year conversation just got settled, prematurely, in a room that held maybe eighty heads.\n\n` +
      `No, I won't quote it. That's not what we do here, and frankly the bar deserves the pilgrimage: go find the footage of ${a.name}'s second round and experience the detonation with the room's audio intact. What I'll tell you is the architecture. A setup planted casually in round one — so casually the crowd filed it as filler. Then, a full round later, the callback: same phrase, inverted meaning, aimed at the exact insecurity the whole battle had been circling. The room needed three full seconds to process it. Then the ceiling came off.\n\n` +
      `That's pen game at its highest difficulty — a bar that requires its audience to have been *listening*. Big rooms reward volume; small rooms reward this.\n\n` +
      `${a.name}${recParen(a)} has quietly built a catalog of these. The awards-show crowd will catch up by December. The eighty people in that room already know what they saw.`,
  },
  {
    code: 'CULTURE_SCHEME_THREAD',
    category: 'streets_culture',
    weight: 8,
    articleType: 'culture',
    blogger: 'small_room_report',
    headline: ({ a }) => `A Viral Thread Broke Down ${a.name}'s Scheme Structure — and the Pen Nerds Are Feasting`,
    body: ({ a, int }) =>
      `The small room doesn't lie — and neither does the page. A writing-analysis account posted a ${int(12, 25)}-part thread this week dissecting how ${a.name} constructs schemes, and it's the best free education the culture has produced this year.\n\n` +
      `The thread maps his architecture: how he picks a concept with multiple entendre layers, seeds the vocabulary early so the room's ear is calibrated, then escalates through the scheme so each connection lands heavier than the last — saving the flip with the most personal sting for the exit. It even charts his misdirection habit: the deliberate "weak" line placed right before a haymaker, lowering the room's guard.\n\n` +
      `What makes this valuable isn't fan worship — it's craft documentation. Young writers screenshot threads like this and study them the way producers study drum patterns. ${a.name}'s ${styleOf(a)} approach just became a syllabus.\n\n` +
      `The man himself reposted it with one comment: "they only found half of it." Of course he did. The best writers always keep a trapdoor under the trapdoor.`,
  },
  {
    code: 'CULTURE_CROWD_ETIQUETTE',
    category: 'streets_culture',
    weight: 8,
    articleType: 'culture',
    blogger: 'underground_voice',
    headline: () => `Fans Rapping Along Mid-Round: Passion or Pollution? The Culture Is Arguing Again`,
    body: ({ a, pick }) =>
      `The underground sees everything — including the guy in the third row who decided he was part of the performance.\n\n` +
      `Footage from a weekend card kicked off the debate: a battler mid-round, building to his closer, while a pocket of the crowd ${pick([
        `rapped along to bars they'd somehow already memorized from the faceoffs`,
        `yelled adlibs over every setup, stepping on punchline after punchline`,
        `started side conversations loud enough to ride the room mic`,
      ])}. The round's momentum died in real time. You can watch it happen.\n\n` +
      `One side says crowds ARE the sport — battle rap without room energy is a podcast. Policing reactions kills the very thing that separates us from poetry slams. The other side, where most working battlers quietly live, says there's a difference between *reacting* and *participating*. The room is the jury, not the co-defendant.\n\n` +
      `${a.name} weighed in with the practical answer: "React as loud as you want — to what I SAID. Just don't say it with me." That's the line, and honestly, every small room in the country should laminate it by the door.`,
  },
  {
    code: 'CULTURE_DOCUMENTARY',
    category: 'streets_culture',
    weight: 7,
    articleType: 'culture',
    blogger: 'algorithm_institute',
    headline: ({ a }) => `An Indie Filmmaker Is Shooting a Documentary on ${a.name} and the Scene That Built Him`,
    body: ({ a, int }) =>
      `In the annals of battle rap history, the culture's stories have mostly been told by the culture — recaps, vlogs, oral tradition in comment sections. Outside lenses are rare. A serious one just arrived.\n\n` +
      `An independent filmmaker has been embedded for ${int(4, 10)} months shooting a feature documentary built around **${a.name}** — but sources close to production say the battler is the doorway, not the whole house. The film tracks the entire ecosystem: the venue owners floating events on credit cards, the videographers archiving history for free, the writers spending forty hours on a round that pays two hundred dollars.\n\n` +
      `${a.name} is reportedly giving uncomfortable access — prep sessions, the financial reality, the family conversations about whether this career is a career. That's the material that matters. The culture's surface is well-documented; its cost structure is not.\n\n` +
      `Done honestly, films like this become primary sources — the footage future historians cite. Done dishonestly, they become recruitment posters for tourists. The early word says honest. The archive is hopeful.`,
  },
  {
    code: 'CULTURE_OVERSEAS_REACTION',
    category: 'streets_culture',
    weight: 8,
    articleType: 'culture',
    blogger: 'underground_voice',
    headline: ({ a }) => `The Overseas Scenes Have Adopted ${a.name} — and the Reaction Videos Are Wild`,
    body: ({ a, pick }) =>
      `The underground sees everything — and the underground is global. This month's proof: ${a.name}'s footage has crossed the water, and the overseas reaction is its own entertainment economy now.\n\n` +
      `It started with one UK reaction channel running his recent rounds. Then the European battle forums picked him apart — in three languages. ${pick([
        `A London battler called his cadence "criminally American, and I mean that as the highest compliment."`,
        `One overseas channel did a frame-by-frame of his crowd control, narrated like a nature documentary.`,
        `An Australian league's owner tagged him publicly: "the flight is long, the room is loud. Offer's open."`,
      ])}\n\n` +
      `What's actually being celebrated is interesting: not the punchlines, which need cultural translation, but the *mechanics* — pacing, pocket, the way he resets a room after a quiet stretch. Craft is the universal language.\n\n` +
      `Cross-water respect matters more than the mainstream understands. The scenes that get studied internationally set the sport's direction. ${a.name} repping ${home(a)} on three continents' worth of screens, off pure footage and no marketing budget? That's the underground's distribution network working exactly as designed.`,
  },
  {
    code: 'CULTURE_JUDGING_PHILOSOPHY',
    category: 'streets_culture',
    weight: 8,
    articleType: 'culture',
    blogger: 'the_battle_breakdown',
    headline: () => `"Should Battles Even Be Judged?" — The Culture's Forever War Has Reignited`,
    body: ({ a, b }) =>
      `Let's go to the scorecards — assuming you believe scorecards should exist, which roughly half the culture currently does not.\n\n` +
      `The forever war reignited this week after a close card ended, as always, in dueling realities: one camp celebrating a clear win, the other demanding to know who, precisely, decided that. No judges, no verdict, no record. Just vibes and view counts.\n\n` +
      `The anti-judging case is genuinely strong: ambiguity is engagement. ${a.name} vs anybody debatable generates months of content; a gavel ends the conversation in one night. The culture's oral tradition — arguing rounds in comments, barbershops, group chats — IS the product's long tail.\n\n` +
      `But here's my counter, and I'm planting the flag: careers need ledgers. ${a.name} sits at ${a.rating}, ${b.name} at ${b.rating} — those numbers only mean something if outcomes get recorded somewhere beyond memory. "Wins" that exist only in your fanbase's heads aren't wins; they're marketing.\n\n` +
      `Judge the battles. Argue with the judges. Both halves of that sentence are the sport.`,
  },
  {
    code: 'CULTURE_PEN_VS_PERFORMANCE',
    category: 'streets_culture',
    weight: 9,
    articleType: 'culture',
    blogger: 'small_room_report',
    headline: ({ a }) => `${a.name}'s Latest Clip Reopened the Pen vs Performance Debate — Here's the Honest Answer`,
    body: ({ a, pick }) =>
      `The small room doesn't lie — but it does take sides, and this week the whole culture picked one. A clip of ${a.name} ${pick([
        `delivering a technically dense round to a nearly silent room`,
        `getting a massive reaction off material the pen purists called "basic"`,
        `out-writing an opponent who out-performed him, leaving the room genuinely split`,
      ])} reopened the oldest fault line we have: does the pen or the performance win battles?\n\n` +
      `The pen camp's case: bars are the artifact. Rooms are drunk, biased, and wrong all the time; the writing is what survives on film, and film is forever. The performance camp's case: this is a LIVE sport. A brilliant round nobody felt is a poem, and there's a different open mic for those.\n\n` +
      `The honest answer — unsatisfying, eternally true: writing is the ceiling, performance is the floor. The pen determines how good your night CAN be; the delivery determines how good it actually IS.\n\n` +
      `${a.name}, to his credit, lives near the intersection${rec(a) ? ` — the ${rec(a)} record says the formula works` : ''}. The debate rages on anyway. It always will. That's half the fun.`,
  },
  {
    code: 'CULTURE_MOUNT_RUSHMORE',
    category: 'streets_culture',
    weight: 9,
    articleType: 'culture',
    blogger: 'marijuana_piranha',
    requires: ({ a }) => !!a.cityName,
    headline: ({ city }) => `The ${city.name} Mount Rushmore Debate Is Tearing Group Chats Apart`,
    body: ({ a, city, pick }) =>
      `Keep it a buck — there is no faster way to ruin a group chat than four words: *${city.name} battle rap Rushmore.*\n\n` +
      `The debate flared up again this week and it's been beautiful chaos. Three faces, everybody mostly agrees. The fourth spot? War. ${pick([
        `The old heads want a pioneer who never got filmed properly — "you had to BE there" — and the youth are not having it.`,
        `Half the city says you can't put anybody active on a Rushmore. The other half says that's how legends get robbed twice.`,
        `Somebody nominated a battler who LEFT ${city.name} years ago, and the "he don't rep us no more" faction arrived within seconds.`,
      ])}\n\n` +
      `And then there's the ${a.name} question. ${who(a).charAt(0).toUpperCase() + who(a).slice(1)} at ${a.rating}${a.streak > 0 ? `, currently on a ${a.streak}-battle run,` : ''} — is he carving his face into the mountain in real time? The youth say yes, loudly. The vets say "let him finish the resume." Both sides got a point, which is why this argument never dies.\n\n` +
      `Mountains move slow. But keep it a buck — they DO move.`,
  },
];

// ============================================================================
// CAREER ARCS — comebacks, retirement rumors, hiatus questions, risers
// ============================================================================

const CAREER_ARCS: WorldEventTemplate[] = [
  {
    code: 'CAREER_COMEBACK_ANNOUNCE',
    category: 'career_arcs',
    weight: 11,
    articleType: 'career_update',
    blogger: 'algorithm_institute',
    headline: ({ a }) => `${a.name} Announces His Return: "The Pen Never Left"`,
    body: ({ a, monthsIdle }) =>
      `In the annals of battle rap history, comebacks divide into two species: the cash-grab lap and the genuine second act. ${a.name} just announced his return after ${monthsIdle} months away, and the early evidence points — cautiously — to the second.\n\n` +
      `The announcement itself was disciplined: no opponent named, no league confirmed, just a statement that he's been writing the entire time and "the pen never left." Historically, that restraint is a good sign. The cash-grab lap announces a blockbuster first; the second act announces *readiness* first.\n\n` +
      `The record he returns to defend: a ${a.rating} rating${rec(a) ? `, a ${rec(a)} career ledger` : ''}, and a reputation built on ${styleOf(a)}. The questions any returning battler must answer are unchanged since the beginning of this culture — is the timing still there? Does the material reflect the man he is now, or the man he was? And can he absorb a modern room's pace after time away?\n\n` +
      `History is patient but unsentimental. The footage will tell us which comeback species this is. The archive awaits its newest chapter.`,
  },
  {
    code: 'CAREER_RETIREMENT_RUMOR',
    category: 'career_arcs',
    weight: 9,
    articleType: 'career_update',
    blogger: 'battle_eyez',
    headline: ({ a }) => `Is ${a.name} Done? The Retirement Whispers Are Getting Loud`,
    body: ({ a, pick }) =>
      `Let me put you on to what really happened — or more accurately, what's quietly NOT happening.\n\n` +
      `${a.name} has ${pick([
        `turned down three offers in a row, per sources close to two different leagues. Not negotiated down. Turned down.`,
        `scrubbed every upcoming-battle mention from his socials and gone noticeably quiet.`,
        `told a fan at an event "I might be one and done from here," and the fan posted it, and the post is everywhere.`,
      ])}\n\n` +
      `Word on the street splits three ways. Camp one: he's done — the grind stopped making financial sense and he's too proud to monetize a farewell tour. Camp two: it's leverage — nothing raises a battler's price like the threat of scarcity, and ${a.name} at ${a.rating} knows his market. Camp three: he's just tired, and tired isn't retired.\n\n` +
      `Here's the detail I keep coming back to: people who are actually done don't go quiet. They say it once and mean it. The quiet ones are deciding — and sources tell me at least one league is trying very hard to influence the decision with a number.\n\n` +
      `Watch this space. I will be.`,
  },
  {
    code: 'CAREER_HIATUS_QUESTION',
    category: 'career_arcs',
    weight: 12,
    articleType: 'career_update',
    blogger: 'coast_to_coast_coverage',
    headline: ({ a, monthsIdle }) => `${a.name} Hasn't Battled in ${monthsIdle} Months — What Actually Happened?`,
    body: ({ a, monthsIdle, pick }) =>
      `Let me tell you what they won't — when a battler disappears, the culture invents a story, and the story is usually wrong.\n\n` +
      `${a.name} hasn't touched a stage in ${monthsIdle} months. The comment-section explanations write themselves: he's scared, he's washed, he fell off. Cute theories. Here's what actually happens to battlers in the gap, based on people who'd know:\n\n` +
      `${pick([
        `The offers got insulting. ${a.name} sits at ${a.rating} and leagues kept sliding him undercard money with main-event expectations. Sitting out IS the negotiation.`,
        `Life invoiced him. Family, work, the unglamorous stack of obligations this sport pretends its contractors don't have. No league pays for health insurance.`,
        `He's rebuilding the pen. The style that got him here stopped surprising rooms, and he knows it. Retooling in private beats experimenting in public.`,
      ])}\n\n` +
      `The dirty secret of hiatus discourse: absence only generates this much conversation when the talent is real. Nobody asks where the mediocre went.\n\n` +
      `${a.name}'s silence is louder than half the roster's bookings. When he's ready, the same fans calling him finished will be first in line. They always are.`,
  },
  {
    code: 'CAREER_MOST_IMPROVED',
    category: 'career_arcs',
    weight: 11,
    articleType: 'career_update',
    blogger: 'underground_voice',
    requires: ({ a }) => !!a.cityName && (a.tier === 'low' || a.tier === 'mid'),
    headline: ({ a, city }) => `The Most Improved Battler in ${city.name} Is ${a.name} — and It's Not Close`,
    body: ({ a, city, int }) =>
      `The underground sees everything — especially growth, which the mainstream only notices after it's finished happening.\n\n` +
      `Run ${a.name}'s footage from ${int(12, 24)} months ago next to his latest. It's barely the same battler. The old tape shows the usual young-battler tells: rushing the pocket, over-stacking punches with no connective tissue, panicking in silence. The new tape? Patience. Setups that breathe. A man who learned that the pause before the punch is part of the punch.\n\n` +
      `People around the ${city.name} scene point to the unglamorous explanation: he treated the gap between battles like a job. Writing daily, studying losses on film — his own and everyone else's — and taking small-room bookings other risers considered beneath them. Reps over reputation.\n\n` +
      `The boards are catching up: ${a.rating} and climbing${a.streak > 0 ? `, with a ${a.streak}-battle streak doing the talking` : ''}. The bigger rooms haven't called yet, but that's the usual lag between being good and being known for it.\n\n` +
      `Remember the name now and you get to say you were early. ${city.name} already knows.`,
  },
  {
    code: 'CAREER_TIER_RISE',
    category: 'career_arcs',
    weight: 10,
    articleType: 'career_update',
    blogger: 'the_battle_breakdown',
    requires: ({ a }) => a.tier === 'mid' || a.tier === 'top',
    headline: ({ a }) => `${a.name} Is Knocking on the Next Tier's Door — The Numbers Make the Case`,
    body: ({ a }) =>
      `Let's go to the scorecards — career edition. The question on the table: is ${a.name} ready for the next tier? The data says the door is already open.\n\n` +
      `**The resume:** ${rec(a) ? `a ${rec(a)} record` : 'a developing record'} with a ${a.rating} rating${a.streak > 0 ? ` and a live ${a.streak}-battle streak` : ''}. Ratings in this range historically precede a tier jump within the year — when the battler takes the right risks.\n\n` +
      `**The eye test:** the ${styleOf(a)} foundation has rounded out. Early-career ${a.name} won one way; current ${a.name} has answers for multiple styles, which is the actual tier gate. Tiers aren't about ceilings — plenty of low-tier battlers have elite ceilings. Tiers are about *floors*, and his floor has visibly risen.\n\n` +
      `**The missing line item:** a signature win. Every tier jump in this sport's history runs through one battle where the riser beats somebody the culture says he shouldn't. That matchup hasn't happened yet — partly scheduling, partly the next tier protecting its real estate.\n\n` +
      `Scorecard verdict: ready. Pending one judge — opportunity.`,
  },
  {
    code: 'CAREER_PEN_BACK',
    category: 'career_arcs',
    weight: 10,
    articleType: 'career_update',
    blogger: 'small_room_report',
    headline: ({ a }) => `"${a.name} Got His Pen Back" — The Quietest, Biggest Story in the Culture`,
    body: ({ a, pick }) =>
      `The small room doesn't lie — and for a stretch there, it was saying hard things about ${a.name}'s pen. The schemes had gotten predictable, the angles recycled, the rounds built from muscle memory instead of intent. Nobody enjoys writing that sentence about a real writer. So let me enjoy writing this one:\n\n` +
      `**He got it back.**\n\n` +
      `The evidence has been stacking quietly. ${pick([
        `Witnesses from a recent small-room set describe new material that had the back wall — the cynics' section — fully engaged.`,
        `A battler who shared a card with him recently put it simply: "whatever he was missing, he found it. I heard the third round. Tell everybody."`,
        `Two separate writers who've seen his recent pages used the same word independently: "scary."`,
      ])}\n\n` +
      `Pen droughts are the sport's least understood injury. They're not laziness — they're usually a writer outgrowing his own formula and flailing in the space between the old voice and the next one. The ones who push through come back *different*, not just restored.\n\n` +
      `${a.name} at ${a.rating} with a refreshed pen is a problem for everybody in his lane. The small room knew first. It always does.`,
  },
  {
    code: 'CAREER_PRESSURE_NEXT',
    category: 'career_arcs',
    weight: 9,
    articleType: 'career_update',
    blogger: 'the_main_stage_herald',
    headline: ({ a }) => `${a.name}'s Next Booking Is a Career Referendum — and He Knows It`,
    body: ({ a, pick }) =>
      `On the biggest stage in battle rap, every battler eventually faces the booking where the stakes stop being about the opponent. ${a.name} is there now.\n\n` +
      `The situation: ${pick([
        `momentum that needs converting. Buzz has a shelf life, and his is at peak freshness — the next performance either banks it or watches it expire.`,
        `a narrative that needs killing. One more flat showing and "inconsistent" stops being a take and becomes his label. Labels in this culture are load-bearing.`,
        `a window that won't stay open. The bigger rooms are watching RIGHT NOW — not next year. Main-stage attention is a moving spotlight, not a standing offer.`,
      ])}\n\n` +
      `At ${a.rating}${a.streak !== 0 ? `, ${a.streak > 0 ? `riding a ${a.streak}-battle streak` : 'coming off a skid'},` : ','} ${a.name} doesn't need a miracle — he needs a *statement*. The kind of round people clip without being asked. The kind of night that makes matchmakers stop saying "maybe" and start saying numbers.\n\n` +
      `Pressure is the price of mattering. Plenty of battlers never get a referendum night because nobody's voting on them. He earned this weight. Now lift it.`,
  },
  {
    code: 'CAREER_VET_CROSSROADS',
    category: 'career_arcs',
    weight: 9,
    articleType: 'career_update',
    blogger: 'algorithm_institute',
    requires: ({ a }) => a.tier === 'top' || a.tier === 'god',
    headline: ({ a }) => `${a.name} at the Crossroads: Legacy Mode or One More Run?`,
    body: ({ a, int }) =>
      `In the annals of battle rap history, the veteran's crossroads is the most repeated chapter — and the least understood by those who haven't reached it. ${a.name}, ${int(8, 15)} years deep with a ${a.rating} rating${rec(a) ? ` and a ${rec(a)} ledger` : ''}, has arrived at his.\n\n` +
      `The two roads are well-mapped. **Legacy mode:** curated bookings, only matchups that add a chapter — the protégé challenge, the styles clash, the long-demanded grudge. Fewer battles, heavier ones. Veterans who choose this road age into institutions. **One more run:** full volume, taking all comers, betting that experience still beats hunger. Gloriously, it sometimes works. Historically, it usually doesn't — the archive is honest about what volume does to aging pens.\n\n` +
      `What makes ${a.name}'s case compelling is that his ${styleOf(a)} foundation is the kind that ages well — craft-based tools decay slower than energy-based ones. He has more road left than most who reach this fork.\n\n` +
      `Whichever he chooses, the choosing itself is the story now. History is watching him decide how it will remember him.`,
  },
  {
    code: 'CAREER_NEW_ERA',
    category: 'career_arcs',
    weight: 9,
    articleType: 'career_update',
    blogger: 'small_room_report',
    headline: ({ a }) => `${a.name} Declares a "New Era" — Style Switch Incoming, and It's a Real Gamble`,
    body: ({ a, pick }) =>
      `The small room doesn't lie — and soon it'll be the first to rule on ${a.name}'s biggest career gamble: a declared style switch.\n\n` +
      `"New era," he announced this week. "The old version got me here. It won't get me there." Translated from battler: the ${styleOf(a)} approach that built his name${recParen(a)} is being rebuilt mid-career, in public.\n\n` +
      `Respect the danger of this. A battler's style is his fingerprint AND his armor — rooms know what they're getting, and that predictability is half of confidence. Switching means voluntarily becoming a rookie again at ${a.rating}, where the expectations are veteran-sized. ${pick([
        `The history is mixed: for every successful reinvention the culture celebrates, three battlers got caught between styles and never found either again.`,
        `Writers who've heard the new material describe it as "him, but with the safety off." Promising. Vague, but promising.`,
        `Notably, he's booking smaller rooms first — beta-testing the new voice where the stakes are honest and the feedback is immediate. That's craftsman thinking.`,
      ])}\n\n` +
      `Either the new era elevates him a tier, or it's an expensive detour back to what worked. The pen will testify. The room will judge.`,
  },
  {
    code: 'CAREER_SLUMP_WATCH',
    category: 'career_arcs',
    weight: 9,
    articleType: 'career_update',
    blogger: 'coast_to_coast_coverage',
    requires: ({ a }) => a.streak <= -2 || a.losses >= 2,
    headline: ({ a }) => `Everyone's Writing ${a.name}'s Obituary — Here's Why They're Early`,
    body: ({ a }) =>
      `Let me tell you what they won't — slumps are the only time this culture tells the truth about how it really feels, and right now it's ${a.name}'s turn in the chair.\n\n` +
      `The record shows ${rec(a) || 'a rough stretch'}${a.streak < 0 ? ` with ${Math.abs(a.streak)} straight in the loss column` : ''}, and the vultures are punctual: "exposed," "never was," "the room figured him out." The same accounts that rode the wave up are charging tolls on the way down.\n\n` +
      `Now here's the part the pile-on conveniently skips: LOOK at the schedule. He didn't slump against tune-ups — he took consecutive hard matchups while half his critics' favorites were farming safe bookings. There's a name for losing dangerous battles: it's called taking dangerous battles. The rating (${a.rating}) took the hit. The respect, among people who actually rap, did not.\n\n` +
      `Slumps end one of two ways: the battler breaks, or the battler recalibrates. Everything in ${a.name}'s history says recalibration. And when the bounce-back lands, watch the obituary writers delete their drafts and claim they believed the whole time.\n\n` +
      `They won't. I'm archiving everything.`,
  },
  {
    code: 'CAREER_BREAKOUT_YEAR',
    category: 'career_arcs',
    weight: 10,
    articleType: 'career_update',
    blogger: 'the_battle_breakdown',
    requires: ({ a }) => a.streak >= 2,
    headline: ({ a }) => `Quietly, ${a.name} Is Assembling a Breakout Year — The Data Doesn't Whisper`,
    body: ({ a }) =>
      `Let's go to the scorecards — because while the culture argues about louder names, ${a.name} has been stacking a season that demands analysis.\n\n` +
      `**The streak:** ${a.streak} consecutive wins, current. **The rating:** ${a.rating}, trending up. **The record:** ${rec(a) || 'building'}. Streaks of this length are rarer than fans think — sustaining one requires winning against varied styles, in varied rooms, while wearing the growing target that each win pins on your back. The pressure compounds with the wins.\n\n` +
      `What the film shows is more impressive than the numbers: the wins are *different kinds* of wins. Some on pen dominance, some on room control, at least one ground out ugly against a bad stylistic matchup — and ugly wins are the most predictive stat in this sport. Anyone can win their kind of battle. Breakout years are built on winning the other kind.\n\n` +
      `The technical forecast: streaks attract two things, bigger checks and streak-breakers. Every prepared killer in his lane is now studying his film for the honor of ending the run. That's the tax on excellence.\n\n` +
      `Scorecard says: pay attention now, or pretend you did later.`,
  },
  {
    code: 'CAREER_MENTOR_ROLE',
    category: 'career_arcs',
    weight: 8,
    articleType: 'career_update',
    blogger: 'algorithm_institute',
    linkSecondary: true,
    requires: ({ a, b }) => (a.tier === 'top' || a.tier === 'god') && (b.tier === 'low' || b.tier === 'mid'),
    headline: ({ a, b }) => `${a.name} Has Taken ${b.name} Under His Wing — The Lineage Continues`,
    body: ({ a, b }) =>
      `In the annals of battle rap history, the mentorship lineages matter more than the rankings — titles change hands yearly, but coaching trees shape decades.\n\n` +
      `A new branch grew this week: **${a.name}** has formally taken ${b.name} under his wing. Witnesses describe full prep-room access — the veteran walking the younger battler through round construction, angle selection, the dark arts of reading a room before you've said a word.\n\n` +
      `The pairing is historically sound. ${a.name}, rated ${a.rating} with ${rec(a) ? `a ${rec(a)} career` : 'years of rooms'} behind him, built his name on ${styleOf(a)} — exactly the foundation ${b.name}'s raw tools need. The student, for his part, brings what every aging great quietly misses: urgency in the building.\n\n` +
      `History says these arrangements cut both ways. Some protégés become the master's greatest legacy. Others, eventually, become his most painful booking — the culture has seen mentor-versus-student cards before, and they are always devastating theater.\n\n` +
      `Both outcomes honor the lineage, oddly enough. Knowledge transferred is never wasted. The archive notes the date.`,
  },
  {
    code: 'CAREER_FULL_TIME_LEAP',
    category: 'career_arcs',
    weight: 8,
    articleType: 'career_update',
    blogger: 'underground_voice',
    headline: ({ a }) => `${a.name} Quit the Day Job — All-In on Battle Rap`,
    body: ({ a }) =>
      `The underground sees everything — including the part of this sport nobody puts on flyers: almost everybody you watch on those stages clocks into a regular job Monday morning.\n\n` +
      `${a.name} just changed his Mondays. He announced this week he's left the day job to pursue battle rap **full-time** — writing, battling, content, all of it, on one income stream that historically pays late when it pays at all.\n\n` +
      `Let's not romanticize it: this is a terrifying bet. The culture celebrates all-in stories after they work and forgets them when they don't, and the ledger of battlers who leapt too early is long and unfilmed. At ${a.rating}${rec(a) ? ` with a ${rec(a)} record` : ''}, ${a.name} has real footing — but footing isn't a floor.\n\n` +
      `Here's what the leap actually buys, though, and why some make it work: time. Full-time battlers prep deeper, take short-notice bookings part-timers can't, and grind content between cards. The craft compounds when it gets your whole day.\n\n` +
      `The underground respects the bet because the underground knows the stakes. Now the work starts. All of it.`,
  },
  {
    code: 'CAREER_LEGACY_DEBATE',
    category: 'career_arcs',
    weight: 8,
    articleType: 'career_update',
    blogger: 'algorithm_institute',
    requires: ({ a }) => a.tier === 'top' || a.tier === 'god',
    headline: ({ a }) => `Where Does ${a.name} Rank All-Time in ${home(a)}? The Question Has No Safe Answer`,
    body: ({ a }) =>
      `In the annals of battle rap history, all-time rankings are where friendships go to be tested — and the ${a.name} question has reached that dangerous maturity.\n\n` +
      `The case for him is current and quantifiable: a ${a.rating} rating, ${rec(a) ? `a ${rec(a)} record, ` : ''}and a body of work in the ${styleOf(a)} tradition that working battlers openly study. ${home(a).charAt(0).toUpperCase() + home(a).slice(1)}'s younger generation already talks about him in legacy terms.\n\n` +
      `The case against is the historian's eternal caveat: era adjustment. The pioneers he's measured against battled before the infrastructure — no proper filming, no real purses, rooms assembled by word of mouth. Their footage undersells them structurally. Comparing eras through view counts is archival malpractice, and I say that as someone whose entire existence is the archive.\n\n` +
      `The honest verdict: ${a.name} belongs in the conversation, and the conversation itself is the honor. Most battlers' names stop being argued about the moment they stop booking. His is being argued about in the *permanent* tense.\n\n` +
      `That's how legacies sound while still under construction.`,
  },
  {
    code: 'CAREER_PROVE_IT_CALL',
    category: 'career_arcs',
    weight: 9,
    articleType: 'career_update',
    blogger: 'coast_to_coast_coverage',
    linkSecondary: true,
    headline: ({ a, b }) => `The Culture Wants ${a.name} to Take the ${b.name} Battle — No More Appetizers`,
    body: ({ a, b }) =>
      `Let me tell you what they won't — there's a difference between staying busy and staying tested, and ${a.name}'s recent schedule has been the first thing wearing the second thing's jacket.\n\n` +
      `The resume's fine. The rating (${a.rating}) is fine. ${rec(a) ? `The ${rec(a)} record is fine. ` : ''}Everything's *fine* — and carefully arranged. Winnable stylistic matchups, opponents a half-step down, rooms where his name carries the building before he says a word. Smart career management, his camp calls it. Risk allergy, the rest of us call it.\n\n` +
      `Meanwhile **${b.name}** is right there. Rated ${b.rating}, ${b.streak > 0 ? `on a run, ` : ''}stylistic kryptonite for everything ${a.name} does well — and conspicuously absent from every list of names ${a.name}'s team floats. Coincidence has a pattern now.\n\n` +
      `Nobody's saying duck. I'm saying the word exists, it's spelled D-U-C-K, and the longer this booking doesn't happen the more people learn to spell.\n\n` +
      `Take the battle. Win it and silence me forever — I'd genuinely enjoy that. Lose it and at least lose like somebody who came to find out.`,
  },
  {
    code: 'CAREER_FIRST_HEADLINE',
    category: 'career_arcs',
    weight: 9,
    articleType: 'career_update',
    blogger: 'the_main_stage_herald',
    linkLeague: true,
    headline: ({ a, league }) => `${a.name} Gets His First Main Event at ${league.name} — The Moment Every Battler Writes Toward`,
    body: ({ a, league }) =>
      `On the biggest stage in battle rap, there is exactly one first time — and ${a.name} just got his. ${league.name} confirmed it this week: he's headlining the next card. Top billing. His name biggest on the flyer.\n\n` +
      `Every battler will tell you about this moment because every battler has imagined it: years of opening slots, of performing for rooms still filing in, of watching the crowd save its energy for somebody else's name. The undercard is where you learn to rap. The main event is where you learn who you are.\n\n` +
      `He earned the slot the unglamorous way — ${rec(a) ? `a ${rec(a)} run` : 'a steady climb'} built on ${styleOf(a)}, a rating of ${a.rating}, and a habit of stealing shows from the middle of cards until the league ran out of reasons to keep him there.\n\n` +
      `Now the physics change. Headliners close the building — last impression, full room, zero excuses. Some battlers shrink when the slot finally arrives; the weight is real and the spotlight is honest. But the ones built for it? They've been rehearsing this night their whole career.\n\n` +
      `We find out which kind he is. That's the show.`,
  },
];

// ============================================================================
// CITY SCENES — heat checks, open-mic legends, regional rivalries
// ============================================================================

const CITY_SCENES: WorldEventTemplate[] = [
  {
    code: 'CITY_HEATING_UP',
    category: 'city_scenes',
    weight: 13,
    articleType: 'culture',
    blogger: 'underground_voice',
    requires: ({ a }) => !!a.cityName,
    headline: ({ city }) => `The ${city.name} Scene Is Heating Up — and This Time It's Different`,
    body: ({ a, city, pick }) =>
      `The underground sees everything — and what it's seeing in **${city.name}** right now is the early stage of something real.\n\n` +
      `Every city gets its "we're heating up" moment; most cool off by the next quarter. But the ${city.name} surge has structure under it: ${pick([
        `rooms are running monthly instead of whenever, and consistency is the whole difference between a scene and a rumor.`,
        `the local videographers got organized — battles are getting filmed properly and posted fast, which means the talent finally travels.`,
        `there's a genuine crop, not one savior. Saviors leave. Crops compound.`,
      ])}\n\n` +
      `The headliner of the moment is ${a.name} — ${TIER_LABEL[a.tier]} at ${a.rating}${a.streak > 0 ? `, riding a ${a.streak}-battle streak,` : ''} and the name outsiders ask about first. But scene health isn't measured at the top; it's measured at the open slots. ${city.name}'s undercards are competitive now. People are getting *better* because the room demands it.\n\n` +
      `${city.cultureStyle === 'technical' ? `The city's technical tradition is showing in the new class — pens first, gimmicks never.` : city.cultureStyle === 'aggressive' ? `And it carries the city's signature: pressure, aggression, rooms that feel like weather.` : city.cultureStyle === 'street' ? `It's street-certified too — the authenticity in those rooms can't be imported.` : `And the range is the strength — no two risers sound alike.`} Book a flight or get left behind the curve.`,
  },
  {
    code: 'CITY_OPEN_MIC_LEGEND',
    category: 'city_scenes',
    weight: 9,
    articleType: 'culture',
    blogger: 'underground_voice',
    requires: ({ a }) => !!a.cityName,
    headline: ({ city }) => `${city.name} Has an Open-Mic Legend Who Refuses to Sign — and the Stories Keep Growing`,
    body: ({ a, city, pick }) =>
      `The underground sees everything — including the ones who choose to stay underground.\n\n` +
      `Every scene has one, but ${city.name}'s is special: a battler with no league deal, no filmed catalog, no socials worth finding — and a local reputation that grows anyway, the old way, by word of mouth. ${pick([
        `Ask around the rooms and the stories stack: the night he ate a signed battler alive at an open, the rebuttals nobody can quote correctly because everyone was too busy reacting.`,
        `Three different ${city.name} battlers, interviewed separately, have called him "the most dangerous man in the city with no footage."`,
        `League scouts have pulled up twice. Both times he politely declined and then rapped like a man auditioning for nothing.`,
      ])}\n\n` +
      `Even ${a.name} — the city's certified name at ${a.rating} — gives it up when asked. "Y'all don't know," he said recently, laughing. "And he likes it that way."\n\n` +
      `The romantics say sign him before the prime's wasted. The purists say the mystery IS the art — some legends are local on purpose. The underground holds both truths at once, and keeps the man's name out of print. You'll have to pull up like everybody else.`,
  },
  {
    code: 'CITY_RIVALRY_BREWING',
    category: 'city_scenes',
    weight: 11,
    articleType: 'culture',
    blogger: 'marijuana_piranha',
    linkSecondary: true,
    requires: ({ a, b }) => !!a.cityName && !!b.cityName && a.cityName !== b.cityName,
    headline: ({ a, b }) => `${a.cityName} vs ${b.cityName}: A Regional War Is Brewing, and ${a.name} vs ${b.name} Is the Flashpoint`,
    body: ({ a, b, pick }) =>
      `Keep it a buck — city versus city is the oldest fuel this culture burns, and somebody just poured a fresh can on ${a.cityName} versus ${b.cityName}.\n\n` +
      `It started small, like it always does: ${pick([
        `a podcast clip of a ${a.cityName} battler saying ${b.cityName} rooms are "easy to impress." ${b.cityName} heard it. All of ${b.cityName}.`,
        `crowds talking spicy at a mixed card, then the comment sections took the baton and ran a marathon.`,
        `a recap channel ranked the two scenes back to back. Big mistake. Beautiful mistake.`,
      ])}\n\n` +
      `Now the avatars are locked in: **${a.name}** carrying ${a.cityName}'s flag at ${a.rating}, **${b.name}** holding ${b.cityName}'s at ${b.rating}. Neither man started this fire, but the streets have decided they finish it — that's how regional beef works. The city picks its soldier and the soldier finds out from the timeline.\n\n` +
      `Real talk: inter-city battles hit different. Home crowd energy, traveling support talking reckless, every bar about the opponent doubling as a bar about his whole area code. Some league's gonna print money on this. First one to send two contracts wins.`,
  },
  {
    code: 'CITY_PRODUCING_MONSTERS',
    category: 'city_scenes',
    weight: 10,
    articleType: 'culture',
    blogger: 'algorithm_institute',
    requires: ({ a }) => !!a.cityName,
    headline: ({ city }) => `Why ${city.name} Keeps Producing Monsters: A Structural Analysis`,
    body: ({ a, city }) =>
      `In the annals of battle rap history, certain cities function as factories — and ${city.name}'s production line deserves study, because the output is not an accident.\n\n` +
      `The structural ingredients, examined: **First, room density.** ${city.name} battlers can perform ${city.sceneSize === 'major' ? 'weekly' : 'monthly'} without travel, and reps are the rawest input in skill development. A battler from a one-room town gets twelve stage-nights a year; a ${city.name} battler triples that. **Second, the style crucible.** The city's ${city.cultureStyle === 'technical' ? 'technical tradition demands schemes and structure from day one — lazy pens get identified in the building, immediately' : city.cultureStyle === 'aggressive' ? 'aggressive tradition means every newcomer learns to perform under pressure, because the rooms attack hesitation like sharks' : city.cultureStyle === 'street' ? 'street tradition enforces an authenticity tax — manufactured personas get audited in real time by crowds who know better' : 'stylistic diversity means young battlers face every archetype early, building complete games instead of one trick'}. **Third, the lineage effect.** Each generation's standard becomes the next one's entry requirement.\n\n` +
      `The current flagship, ${a.name} — ${a.rating}-rated, ${styleOf(a)}-built — is the system working as designed. He won't be the last. The factory doesn't close.`,
  },
  {
    code: 'CITY_NEW_VENUE',
    category: 'city_scenes',
    weight: 9,
    articleType: 'culture',
    blogger: 'underground_voice',
    requires: ({ a }) => !!a.cityName,
    headline: ({ city }) => `${city.name}'s Scene Finally Has a Home — The New Room Changes Everything`,
    body: ({ a, city, pick }) =>
      `The underground sees everything — and the biggest story in ${city.name} this month isn't a battler. It's a building.\n\n` +
      `The scene finally has a permanent room: ${pick([
        `a converted warehouse space with the two things that actually matter — good sound and a back wall close enough to keep the energy compressed.`,
        `a venue whose owner actually comes from the culture, which means no more explaining to bar managers why the crowd yells.`,
        `modest capacity, perfect bones. Low ceiling, tight floor — rooms like this make average bars sound good and good bars sound biblical.`,
      ])}\n\n` +
      `People outside the culture never understand how much geography decides scenes. Nomad scenes — begging for venues, moving monthly, rebuilding their crowd every time — burn their energy on logistics. A home room compounds everything: regulars become a real crowd, the crowd develops taste, the taste raises the bar for everyone who touches the mic.\n\n` +
      `${a.name} is already booked for the opening card, which is the right call — christen the room with the city's best. Years from now, when ${city.name} battlers talk about where it turned around, they'll name this address. That's how scenes work. First the room, then the renaissance.`,
  },
  {
    code: 'CITY_STYLE_IDENTITY',
    category: 'city_scenes',
    weight: 9,
    articleType: 'culture',
    blogger: 'small_room_report',
    requires: ({ a }) => !!a.cityName,
    headline: ({ city }) => `The ${city.name} Sound: What Actually Makes the City's Style Its Own`,
    body: ({ a, city }) =>
      `The small room doesn't lie — and if you sit in enough ${city.name} rooms, the city's fingerprint becomes unmistakable. Let's document it properly.\n\n` +
      `${city.cultureStyle === 'technical' ? `${city.name} is a pen city, full stop. The crowds listen like editors — they catch the third layer of a scheme and they audibly resent being handed the first. Setups are allowed to breathe here; silence during a buildup isn't a dying round, it's a room doing the math with you. Visiting performers who mistake that patience for coldness get washed by the locals' standards, not their volume.` : city.cultureStyle === 'aggressive' ? `${city.name} runs on pressure. The local style is forward motion — battlers walk you down, the crowd rewards contact, and a defensive round is a losing round regardless of its pen. What outsiders miss is the discipline inside the aggression: the best ${city.name} battlers aren't yelling, they're *timing*. Controlled violence, not noise.` : city.cultureStyle === 'street' ? `${city.name}'s style is authenticity enforcement. The crowds run a live audit on every claim — bars have to be true-ish or the room turns. The local greats build rounds out of lived detail because invented ones get detected like counterfeit bills. It produces a specific kind of battler: limited theatrics, devastating credibility.` : `${city.name} refuses a single identity, and that IS the identity. Technical pens share cards with pressure performers and comedy stylists, so the local crowds have catholic taste — they'll reward anything done at a high level and forgive nothing done lazily. The city produces complete battlers because specialization doesn't survive there.`}\n\n` +
      `The current standard-bearer: ${a.name}, whose ${styleOf(a)} approach is the city thesis written in one career. Style is geography. The room raises you.`,
  },
  {
    code: 'CITY_GATEKEEPER',
    category: 'city_scenes',
    weight: 9,
    articleType: 'culture',
    blogger: 'underground_voice',
    requires: ({ a }) => !!a.cityName && (a.tier === 'mid' || a.tier === 'top' || a.tier === 'god'),
    headline: ({ a, city }) => `Every Newcomer in ${city.name} Has to Get Past One Man: ${a.name}`,
    body: ({ a, city }) =>
      `The underground sees everything — including the unwritten rule every ${city.name} newcomer learns within their first three rooms: *your name doesn't count until you've seen ${a.name}.*\n\n` +
      `Every healthy scene appoints one — not the city's biggest star, its **gatekeeper**. The veteran who takes all comers, who never ducks a debut, who treats every hungry newcomer like a real booking. ${a.name}${recParen(a)} has held ${city.name}'s post for years now, rated ${a.rating} and seemingly allergic to easy nights.\n\n` +
      `Understand the economics of the role: it's mostly downside. Beat a newcomer and you did your job; lose and you just funded somebody's whole career. Gatekeepers take that asymmetric bet over and over, and in exchange the scene gets the one thing it can't import — quality control. ${city.name} reputations are *certified* because everyone knows what the certification costs.\n\n` +
      `Ask the local risers about him and you get the same answer in different words: "He made me better by not letting me skip the line." Cities don't build statues for gatekeepers. They build battlers instead. That's the monument.`,
  },
  {
    code: 'CITY_SCENE_REPORT',
    category: 'city_scenes',
    weight: 10,
    articleType: 'culture',
    blogger: 'small_room_report',
    requires: ({ a }) => !!a.cityName,
    headline: ({ city }) => `${city.name} Scene Report: What's Really Happening in the Rooms`,
    body: ({ a, city, int, pick }) =>
      `The small room doesn't lie — so here's this month's ${city.name} dispatch, straight from the rooms the cameras skip.\n\n` +
      `**The headline:** ${a.name} remains the scene's center of gravity at ${a.rating}${a.streak > 0 ? `, with a ${a.streak}-battle run that has the locals talking title shots` : ''}. But the report worth filing is below him.\n\n` +
      `**The undercurrent:** ${pick([
        `the open-mic pipeline is the strongest it's been in years — ${int(3, 6)} unsigned names worth a scout's airfare, all sharpening against each other monthly.`,
        `a generational changeover is in progress. The vets who held the scene are easing back, and the kids are not waiting respectfully.`,
        `prep culture has noticeably improved. The days of off-the-couch performances are dying; even undercard battlers are showing up with structured rounds.`,
      ])}\n\n` +
      `**The concern:** ${pick([
        `footage. Too many strong nights live only in the memories of forty people. The scene needs a committed videographer more than it needs another battler.`,
        `venue stability — the main room's lease situation is murky, and nomad scenes lose momentum fast.`,
        `export drain. The bigger leagues keep cherry-picking the talent without investing a dollar back into the rooms that built it.`,
      ])}\n\n` +
      `Overall grade: ascending. The small rooms are where the future is currently rehearsing. Get there before the cameras do.`,
  },
  {
    code: 'CITY_TALENT_EXODUS',
    category: 'city_scenes',
    weight: 8,
    articleType: 'culture',
    blogger: 'coast_to_coast_coverage',
    requires: ({ a }) => !!a.cityName,
    headline: ({ city }) => `The Big Leagues Keep Strip-Mining ${city.name} — and Giving Nothing Back`,
    body: ({ a, city }) =>
      `Let me tell you what they won't — the major leagues treat cities like ${city.name} as free farm systems, and everybody's too booked to say it.\n\n` +
      `The pattern, run annually: ${city.name}'s rooms develop a battler from open-mic clay into a finished product. Years of local cards, local crowds, local videographers working for gas money. Then a big league swoops in with one contract, harvests the finished battler, and books him in three different time zones while the scene that built him gets... a shoutout in his first interview. Maybe.\n\n` +
      `${a.name} is the current case study — ${city.name}-built, ${a.rating}-rated, and now in every matchmaker's phone. Good for him, genuinely. He earned the call. The question nobody upstream answers: what did the scene that produced him earn? ${city.name}'s rooms get no development fee, no co-promotion, not even a streaming kickback on footage of battles THEY staged.\n\n` +
      `Other sports solved this — transfer fees, farm agreements, development compensation. Battle rap just calls extraction "exposure" and keeps the receipts in someone else's pocket.\n\n` +
      `The talent will keep coming. The invoice is still unpaid.`,
  },
  {
    code: 'CITY_CYPHER_NIGHT',
    category: 'city_scenes',
    weight: 9,
    articleType: 'culture',
    blogger: 'marijuana_piranha',
    requires: ({ a }) => !!a.cityName,
    headline: ({ city }) => `Last Night's ${city.name} Cypher Turned Into the Best Unbooked Card of the Year`,
    body: ({ a, city, pick }) =>
      `Keep it a buck — the best battle event in ${city.name} this year didn't have a flyer, a ticket link, or a league attached. It was a cypher that got out of hand in the best possible way.\n\n` +
      `Started normal: rotation rhymes, dap after every verse, everybody respectful. Then ${pick([
        `somebody's verse had a little too much aim on it, and the man it grazed decided to answer instead of nod.`,
        `two locals with quiet history ended up back to back in the rotation. The temperature did the rest.`,
        `${a.name} pulled up unannounced, and his presence alone raised everybody's stakes about three tiers.`,
      ])} Next thing you know the circle's tightened, phones are out, and grown men are calling people they know: *get down here NOW.*\n\n` +
      `No judges, no rounds, no winner on paper — and the room will be arguing about who took it for months anyway. That's the magic. Cyphers are battle rap with the business stripped out: just pens, pressure, and pride in a circle.\n\n` +
      `The footage is floating around in fragments. Find it. And keep it a buck — somebody at a league better be watching, because at least two of those matchups deserve contracts.`,
  },
  {
    code: 'CITY_NEXT_UP',
    category: 'city_scenes',
    weight: 11,
    articleType: 'culture',
    blogger: 'underground_voice',
    requires: ({ a }) => !!a.cityName && a.tier === 'low',
    headline: ({ a, city }) => `Next Up Out of ${city.name}: ${a.name} Is the Name to File Away`,
    body: ({ a, city, pick }) =>
      `The underground sees everything — and this month it's asking you to file away one name from ${city.name}: **${a.name}**.\n\n` +
      `The boards have him low-tier at ${a.rating}, which is exactly why this column exists. Ratings measure the past; rooms predict the future, and the rooms are unanimous. ${pick([
        `He's been taking unfavorable matchups on purpose — older, stronger, meaner opponents — and leaving with respect even in losses. That's a development plan, not a record.`,
        `Three separate ${city.name} regulars described the same thing: a kid who rewrites entire rounds between bookings because "good enough" visibly disgusts him.`,
        `His last small-room performance reportedly flipped a crowd that came specifically to see him lose. Hostile-room wins are the rarest currency there is.`,
      ])}\n\n` +
      `The style is still forming — equal parts ${styleOf(a)} and audacity — and rough edges are everywhere, which is correct. Polish at this stage usually means a low ceiling dressed up nice. What can't be taught is already present: the room watches him even when he's not rapping.\n\n` +
      `You'll hear this name from louder outlets in a year, presented as a discovery. Remember where you actually heard it. The underground was here first. It always is.`,
  },
  {
    code: 'CITY_OG_SPEAKS',
    category: 'city_scenes',
    weight: 8,
    articleType: 'culture',
    blogger: 'algorithm_institute',
    requires: ({ a }) => !!a.cityName,
    headline: ({ city }) => `A ${city.name} OG Breaks His Silence on the New Generation — and He's Not Bitter, He's Precise`,
    body: ({ a, city, int }) =>
      `In the annals of battle rap history, the elder interview is usually a genre piece: the OG laments, the youth dismiss, the cycle continues. What a ${city.name} pioneer delivered this week was something rarer — an honest audit.\n\n` +
      `The veteran — ${int(15, 25)} years deep, from the era before proper footage — sat for a long-form interview about the city's new class, and refused both available scripts. No "everything was better then." No empty cosigning either.\n\n` +
      `His assessment of today's scene, paraphrased with care: the new generation writes *better* than his ever did — more layered, more structured, raised on a global archive his era didn't have. But they perform too safe. "We had nothing to lose, so we risked everything every round. These kids got ratings to protect." He named ${a.name} as the exception — "that one performs like the consequences are real" — which, given the source, may be the heaviest cosign of ${a.name}'s career.\n\n` +
      `The interview matters because scene memory is infrastructure. Cities that lose their elders' testimony rebuild from zero every generation. ${city.name} just got its history professionally appraised. The archive thanks him.`,
  },
  {
    code: 'CITY_CROSSTOWN_CARD',
    category: 'city_scenes',
    weight: 9,
    articleType: 'culture',
    blogger: 'the_main_stage_herald',
    linkSecondary: true,
    requires: ({ a, b }) => !!a.cityName && a.cityName === b.cityName,
    headline: ({ a, b, city }) => `The All-${city.name} Card Rumor Is Real — and ${a.name} vs ${b.name} Would Headline`,
    body: ({ a, b, city }) =>
      `On the biggest stage in battle rap, the easiest sell has always been the hardest booking: a full hometown card. And the rumor burning through ${city.name} this week says somebody's finally trying — an all-city event, locals only, with **${a.name} vs ${b.name}** on top.\n\n` +
      `Understand why this matchup headlines itself. Two ${city.name} names — ${a.name} at ${a.rating}, ${b.name} at ${b.rating} — who came up through the same rooms, in front of the same regulars, without ever touching each other on a stage. The city has been running this hypothetical for years; every local card's crowd chants some version of it.\n\n` +
      `Same-city battles carry stakes no import matchup can match: the crowd knows BOTH men's histories, catches every local reference at full weight, and someone has to keep living in the loser's city afterward. There are no flights home from this one.\n\n` +
      `The obstacles are the usual: money, pride, and the quiet fear both camps deny. But cards like this become scene-defining nights when they land — the footage ${city.name} measures itself against for a decade.\n\n` +
      `Make it. The city already bought tickets in its head.`,
  },
  {
    code: 'CITY_SMALL_ROOM_GEM',
    category: 'city_scenes',
    weight: 9,
    articleType: 'culture',
    blogger: 'small_room_report',
    requires: ({ a }) => !!a.cityName,
    headline: ({ city }) => `The Best Card Series in ${city.name} Is Happening in a Room That Holds 60 People`,
    body: ({ a, city, pick }) =>
      `The small room doesn't lie — and ${city.name}'s best-kept secret is a room that holds maybe sixty people and has quietly out-curated every bigger stage in the region.\n\n` +
      `No league branding. No faceoff content. Just a monthly card series run by people who clearly study matchmaking like it's a craft, because it is. ${pick([
        `Every pairing is a styles question: pen versus pressure, vet versus riser, two approaches to the same archetype. Nobody gets booked to pad anybody.`,
        `The room enforces its own quality floor — sixty regulars with developed taste are scarier judges than any panel.`,
        `Battlers reportedly accept below their rate to get on, because the footage from this room travels with a stamp on it.`,
      ])}\n\n` +
      `That's the real story: a booking here has become ${city.name}'s informal certification. Even established names like ${a.name} treat the room with respect — small crowds with sharp ears are where reputations get audited, not inflated.\n\n` +
      `I won't print the address; the room's size IS its quality control, and the owners like it word-of-mouth. But if you're in ${city.name} and you know somebody who knows somebody — start asking. The best battles in the city are happening sixty witnesses at a time.`,
  },
  {
    code: 'CITY_HOMECOMING',
    category: 'city_scenes',
    weight: 9,
    articleType: 'culture',
    blogger: 'the_main_stage_herald',
    linkLeague: true,
    requires: ({ a }) => !!a.cityName,
    headline: ({ a, city }) => `${a.name} Is Coming Home: A ${city.name} Battle Years in the Making`,
    body: ({ a, city, int }) =>
      `On the biggest stage in battle rap, no spotlight hits harder than the hometown one — and ${a.name} is about to stand in it. After ${int(2, 6)} years of building his name in other cities' rooms, he's confirmed for a battle in **${city.name}**. Home.\n\n` +
      `Homecomings are the sport's richest theater because the stakes run in both directions. The crowd that watched him leave gets to judge what he became; he gets to perform for the only audience whose opinion predates his reputation. Every local reference lands at triple weight. Every familiar face in the room is a witness from before the rating, before the streak, before any of it.\n\n` +
      `And the pressure is real, not promotional. Hometown crowds are famously the hardest sell in battle rap — they don't cheer the name, they cheer the performance, and they consider themselves co-authors of his story. Coast through a round in ${city.name} and the room will let him know in real time.\n\n` +
      `${a.name} at ${a.rating}, in the city that built the foundation, with everything after proving it travels both ways. Some battles are bookings. This one's a chapter.`,
  },
  {
    code: 'CITY_SOUND_TRAVELS',
    category: 'city_scenes',
    weight: 8,
    articleType: 'culture',
    blogger: 'the_battle_breakdown',
    requires: ({ a }) => !!a.cityName,
    headline: ({ a, city }) => `Does the ${city.name} Style Travel? ${a.name} Is the Test Case`,
    body: ({ a, city }) =>
      `Let's go to the scorecards — on a question every regional scene eventually faces: does the hometown style work on the road?\n\n` +
      `${city.name}'s ${city.cultureStyle} tradition dominates its own rooms, but home-room dominance is a controlled experiment — the crowd is calibrated to the style, the references are local currency, and the energy loops are pre-built. The road strips all three variables. What's left is the test.\n\n` +
      `**The test case:** ${a.name}, the city's most road-booked export at ${a.rating}${rec(a) ? ` with a ${rec(a)} ledger` : ''}. The film from his away performances suggests three findings. One: the core mechanics travel — pacing, structure, and pressure are jurisdiction-free. Two: the local-reference layer does NOT travel, and the smart adjustment he's made is swapping geography-dependent material for universal angles without diluting the style's identity. Three: away crowds take a round longer to calibrate to an unfamiliar approach — which means road battlers from stylized cities effectively start every battle down half a round.\n\n` +
      `Scorecard verdict: the ${city.name} sound travels — with a customs fee. The great ones budget for it.`,
  },
];

// ============================================================================
// RANKINGS REACTIONS — streaks, top-5 fights, throne watch
// ============================================================================

const RANKINGS_REACTIONS: WorldEventTemplate[] = [
  {
    code: 'RANK_STREAK_WATCH',
    category: 'rankings_reactions',
    weight: 12,
    articleType: 'power_ranking',
    blogger: 'the_battle_breakdown',
    requires: ({ a }) => a.streak >= 2,
    headline: ({ a }) => `Streak Watch: ${a.name} Makes It ${a.streak} Straight — How Far Does This Run Go?`,
    body: ({ a }) =>
      `Let's go to the scorecards — because ${a.name}'s streak just hit **${a.streak} straight**, and streaks of this length stop being noise and start being signal.\n\n` +
      `The composition matters more than the count, so let's decompose. The run includes wins over multiple style archetypes — which rules out the "favorable matchmaking" explanation skeptics reach for first. The rating reflects it: ${a.rating} and climbing, with each win now worth less on paper and more in reputation, the classic profile of a battler outgrowing his bracket.\n\n` +
      `The actuarial reality of streaks: they end. Always. The relevant question is *how* — streaks die either to a superior opponent (honorable, expected) or to the streak itself, when the holder starts performing not-to-lose instead of to win. Film study says ${a.name} hasn't tightened up yet; his recent rounds show a man still taking writing risks, which is the single best predictor of streak longevity we have.\n\n` +
      `Every prepared killer in his lane is now studying his film for the honor of being the answer to a trivia question. That's the tax. Scorecard says: the run continues — for now.`,
  },
  {
    code: 'RANK_TOP5_DEBATE',
    category: 'rankings_reactions',
    weight: 11,
    articleType: 'power_ranking',
    blogger: 'coast_to_coast_coverage',
    requires: ({ a }) => a.tier === 'mid' || a.tier === 'top',
    headline: ({ a }) => `Is ${a.name} Top 5? Wrong Question. Ask Why You're Scared to Say Yes`,
    body: ({ a }) =>
      `Let me tell you what they won't — the "is ${a.name} top 5" debate isn't about ${a.name}. It's about who has to fall out of the picture to let him in, and whose feelings that hurts.\n\n` +
      `Run the actual case. Rating: ${a.rating}. ${rec(a) ? `Record: ${rec(a)}. ` : ''}${a.streak > 0 ? `Current form: ${a.streak} straight, which is more recent winning than half the consensus list has managed combined. ` : ''}Style: ${styleOf(a)} that's proven against multiple archetypes. That's a portfolio, not a hot take.\n\n` +
      `Now watch the counterarguments do their little dance. "He hasn't beaten a top-5 name" — because the top 5 won't book him, a catch-22 they built and maintain. "Longevity matters" — translation: seniority matters, the rankings as retirement plan. "The numbers don't capture intangibles" — said exclusively when the numbers favor the outsider.\n\n` +
      `Lists are supposed to be photographs of the present. The culture keeps treating them like pensions for the past. ${a.name}'s case will be obvious in a year, at which point everyone arguing against it today will claim they were early.\n\n` +
      `Screenshot this. I'll wait.`,
  },
  {
    code: 'RANK_GAP_FRAUD',
    category: 'rankings_reactions',
    weight: 9,
    articleType: 'power_ranking',
    blogger: 'coast_to_coast_coverage',
    linkSecondary: true,
    requires: ({ a, b }) => a.rating > b.rating + 80,
    headline: ({ a, b }) => `The ${a.rating - b.rating}-Point Gap Between ${a.name} and ${b.name} Is a Paper Fiction`,
    body: ({ a, b }) =>
      `Let me tell you what they won't — the boards say ${a.name} (${a.rating}) sits ${a.rating - b.rating} points above ${b.name} (${b.rating}), and the boards are telling a polite lie.\n\n` +
      `Ratings measure *résumés*, not battlers. And résumés in this sport are scheduling artifacts: who got the early-league bookings, who came up in filmed rooms versus dark ones, whose league inflates its events. ${a.name}'s number was built on opportunity density. ${b.name}'s was built in rooms the algorithm barely saw.\n\n` +
      `Watch the actual film and the gap collapses. ${b.name}'s recent rounds show ${styleOf(b)} that would trouble anyone in ${a.name}'s bracket — the pressure he applies doesn't care what anybody's rating is. People who've shared cards with both quietly say versions of the same thing: "the numbers got that one wrong."\n\n` +
      `There's one clean way to audit a paper gap, and both camps know what it is. The fact that the matchup keeps NOT happening — always for reasonable-sounding reasons, always conveniently — tells you who profits from the fiction staying printed.\n\n` +
      `Book the audit. Let the room recount the votes.`,
  },
  {
    code: 'RANK_THRONE_NOTICE',
    category: 'rankings_reactions',
    weight: 10,
    articleType: 'power_ranking',
    blogger: 'the_main_stage_herald',
    linkLeague: true,
    requires: ({ a }) => a.streak >= 1,
    headline: ({ a, league }) => `The ${league.name} Throne Is Officially on Notice — ${a.name} Is Coming`,
    body: ({ a, league }) =>
      `On the biggest stage in battle rap, thrones don't fall to announcements. They fall to *momentum* — and the momentum at ${league.name} right now has a name on it.\n\n` +
      `**${a.name}** has put together the kind of run that changes a league's internal weather: ${a.streak >= 2 ? `${a.streak} straight wins` : 'a statement victory'}, a ${a.rating} rating climbing the board, and — the tell that matters most — other contenders starting to mention him *unprompted*. When the roster talks about you in scouting terms, the matchmakers are already drawing brackets.\n\n` +
      `The path to any throne runs through three gates: the resume (building), the moment (pending — every challenger needs one career round that becomes evidence), and the booking itself, which is always the narrowest gate. Champions and their camps are historically creative about scheduling around incoming weather.\n\n` +
      `But leagues love nothing more than a throne with a storm on the horizon — it makes every interim card matter, every faceoff a prediction market. ${league.name} has that now.\n\n` +
      `Whoever holds the top spot should prep accordingly. Notice has been served. Spectacularly.`,
  },
  {
    code: 'RANK_NUMBERS_DIVE',
    category: 'rankings_reactions',
    weight: 9,
    articleType: 'power_ranking',
    blogger: 'the_battle_breakdown',
    linkSecondary: true,
    headline: ({ a, b }) => `By the Numbers: What the Ratings Board Is Actually Telling Us This Month`,
    body: ({ a, b }) =>
      `Let's go to the scorecards — the monthly deep-dive, where we read the board the way it deserves: as data with a story in it.\n\n` +
      `**Movement of the month:** ${a.name} at ${a.rating}${a.streak !== 0 ? ` (${a.streak > 0 ? `+${a.streak} streak` : `${Math.abs(a.streak)}-battle skid`})` : ''}. ${a.streak > 0 ? `The trajectory is the cleanest on the board — consistent gains without a single soft booking inflating the curve.` : `The number undersells him; ratings lag form by design, and the film says the correction is coming.`}\n\n` +
      `**The undervalued read:** ${b.name} at ${b.rating}. The board treats him as settled stock, but variance analysis disagrees — his performance floor has risen two straight quarters, and rising floors precede rating jumps the way smoke precedes fire. The market hasn't priced it yet.\n\n` +
      `**The structural note:** the middle of the board is compressing. The gap between ranks is the tightest it's been in recent memory, which means one good night moves a battler five spots and one bad night does the same in reverse. Compression eras produce chaos cards — and chaos cards produce the moments this sport lives on.\n\n` +
      `Scorecard summary: volatility ahead. Buy accordingly.`,
  },
  {
    code: 'RANK_OVERRATED_POLL',
    category: 'rankings_reactions',
    weight: 8,
    articleType: 'power_ranking',
    blogger: 'battle_eyez',
    headline: ({ a }) => `An Anonymous Battler Poll Named the "Most Overrated" — and ${a.name}'s Name Came Up`,
    body: ({ a, int, pick }) =>
      `Let me put you on to what really happened, because anonymous polls are where the culture says what it actually thinks.\n\n` +
      `A recap outlet polled ${int(20, 40)} active battlers — anonymity guaranteed — on the sport's spiciest question: *who's most overrated?* The results leaked this week, and ${a.name}'s name appeared more than once. Cue chaos.\n\n` +
      `Now, the forensics. ${pick([
        `Sources tell me at least two of the votes came from battlers who have unsuccessfully tried to book him. Overrated or unavailable? Different words.`,
        `The voters skew toward one region — and ${a.name} has a history of cooking that region's favorites. Grudge math is still math.`,
        `Notably, nobody who's actually shared a stage with him voted that way. The shade came exclusively from a distance.`,
      ])}\n\n` +
      `${a.name}'s response was characteristically efficient: "Anonymous is a funny way to spell scared." His rating (${a.rating}) didn't move. His booking requests reportedly did — upward, because nothing sells like resentment.\n\n` +
      `That's the secret of overrated polls: they're popularity contests run in reverse, and the winners usually turn out to be the ones everybody's tired of *losing to*. Word on the street says he's framing the article.`,
  },
  {
    code: 'RANK_SLEEPER_PICK',
    category: 'rankings_reactions',
    weight: 10,
    articleType: 'power_ranking',
    blogger: 'underground_voice',
    requires: ({ a }) => a.tier === 'low' || a.tier === 'mid',
    headline: ({ a }) => `The Sleeper Nobody Ranks: ${a.name} Is the Board's Biggest Blind Spot`,
    body: ({ a }) =>
      `The underground sees everything — including the names the ratings board files under "miscellaneous." Today's exhibit: **${a.name}**, sitting at ${a.rating} like that's a complete sentence.\n\n` +
      `Here's what the number doesn't know. Ratings reward *frequency* in filmed rooms, and ${a.name}'s best work has happened in exactly the wrong places for an algorithm: ${home(a)} rooms with one shaky camera, undercards posted three weeks late, performances that live in attendee testimony instead of view counts. The people who were THERE rank him a full tier above his number. The people who weren't quote the number.\n\n` +
      `The skill set is board-proof though: ${styleOf(a)} with genuine adaptability — film the man twice and you'll see two different solutions to two different problems. That's the profile that ambushes ranked names, because ranked names prep off footage, and his footage is an incomplete map.\n\n` +
      `Sleepers stop being sleepers one of two ways: a big-room booking, or a ranked opponent making the mistake of treating the number like a scouting report. Either way, the board corrects itself eventually.\n\n` +
      `The underground just files its reports early.`,
  },
  {
    code: 'RANK_P4P_FIGHT',
    category: 'rankings_reactions',
    weight: 8,
    articleType: 'power_ranking',
    blogger: 'the_battle_breakdown',
    linkSecondary: true,
    headline: ({ a, b }) => `The Pound-for-Pound Argument Tearing the Recap World Apart: ${a.name} vs ${b.name}`,
    body: ({ a, b }) =>
      `Let's go to the scorecards — for the methodology war currently consuming the recap ecosystem: in a pound-for-pound sense, who's better, ${a.name} or ${b.name}?\n\n` +
      `"Pound-for-pound" in battle rap means stripping context: ignore tier protection, room advantages, and league inflation — pure skill against pure skill. And these two are a genuine methodological dilemma.\n\n` +
      `**The ${a.name} case (${a.rating}):** higher peaks. His best rounds are the best rounds — detonation-grade material that ends arguments. P4P philosophies that weight ceiling take him comfortably. **The ${b.name} case (${b.rating}):** the floor. He has not had a genuinely bad night in recent memory, and never-loses-a-round-badly is a skill the highlight era systematically underrates.\n\n` +
      `The recap channels have split along exactly this axis — peaks versus floors, haymakers versus consistency — which is why the argument can't resolve. They're not disagreeing about the battlers; they're disagreeing about what *good* means.\n\n` +
      `My card: floors win careers, peaks win rooms. Take ${b.name} over a career, ${a.name} on any given night — and pray somebody books the night.`,
  },
  {
    code: 'RANK_GOD_TIER_GAP',
    category: 'rankings_reactions',
    weight: 8,
    articleType: 'power_ranking',
    blogger: 'algorithm_institute',
    requires: ({ a }) => a.tier === 'god' || a.tier === 'top',
    headline: ({ a }) => `What Actually Separates God Tier From Everyone Else — The ${a.name} Case Study`,
    body: ({ a }) =>
      `In the annals of battle rap history, "god tier" is the most invoked and least defined term we have. The culture knows it when it sees it — so let's use a current sighting, **${a.name}** (${a.rating}), to extract the actual criteria.\n\n` +
      `It is not punching power; the archive is full of devastating writers who never ascended. It is not consistency alone; reliable excellence describes the top tier, the rank below. Studying careers that made the final jump, three separators recur:\n\n` +
      `**Inevitability.** God-tier battlers win rounds *before performing them* — opponents visibly adjust their material, their pacing, their ambitions, just from the matchup. ${a.name}'s recent opponents have all shown the tell: prepping to survive instead of to win.\n\n` +
      `**Era authorship.** The tier below adapts to the meta. God tier IS the meta — their stylistic choices become next year's roster-wide homework. The ${styleOf(a)} renaissance currently visible across the boards traces directly to his catalog.\n\n` +
      `**Loss immunity.** Not unbeaten — *undiminished*. When a god-tier name drops a debatable, the culture debates the JUDGING. The status survives the scoreboard.\n\n` +
      `By these criteria, the case is live. History is grading in real time.`,
  },
  {
    code: 'RANK_FALLING_NAME',
    category: 'rankings_reactions',
    weight: 8,
    articleType: 'power_ranking',
    blogger: 'coast_to_coast_coverage',
    requires: ({ a }) => (a.tier === 'top' || a.tier === 'god') && a.streak <= 0,
    headline: ({ a }) => `Nobody Wants to Say It, So I Will: ${a.name} Is Slipping Out of the Conversation`,
    body: ({ a }) =>
      `Let me tell you what they won't — because they're all too invested in the nostalgia economy to file an honest report: **${a.name} is slipping**, and pretending otherwise insults everyone including him.\n\n` +
      `The evidence isn't one bad night; everyone gets those. It's the pattern. The rating's stalled at ${a.rating}${a.streak < 0 ? ` with the skid to match` : ` while the names below him climb`}. The bookings have quietly shifted from "who can test him" to "who makes him look right." And the recaps — listen closely — have started reviewing his *legacy* in the present tense, which is how this culture lowers a casket while smiling.\n\n` +
      `Here's the thing though: the slide isn't the scandal. Decline is the job's only guaranteed outcome. The scandal is the silence — the courtier media protecting access, the fans protecting their memories, everybody protecting everything except the standard.\n\n` +
      `The respectful move is the honest one: say it, and let him answer it. Because the great ones have a documented response to being written off, and it's the best content this sport produces.\n\n` +
      `Your move, champ. Prove the obituary premature. I'd love nothing more.`,
  },
  {
    code: 'RANK_ROOKIE_CLASS',
    category: 'rankings_reactions',
    weight: 9,
    articleType: 'power_ranking',
    blogger: 'underground_voice',
    requires: ({ a }) => a.tier === 'low',
    headline: ({ a }) => `The Rookie Rankings Just Dropped — and ${a.name} Leads the Class`,
    body: ({ a, int }) =>
      `The underground sees everything — and once a year, it files an official report. The rookie rankings dropped this week, and the top line reads: **${a.name}**, first in class.\n\n` +
      `The placement isn't charity. Among the ${int(8, 15)} debutants tracked this cycle, ${a.name} separated on the metric that actually predicts careers: degree of difficulty. While half the class farmed friendly rooms and softball matchups, he took ${home(a)} bookings against opponents specifically chosen to be problems. The rating (${a.rating}) is modest; the schedule behind it is not.\n\n` +
      `What the film shows: a ${styleOf(a)} foundation that's already structurally sound — rookies usually have one tool and a prayer, and he's visibly building a second and third in public. The errors are the right kind: ambition failures, not effort failures. Rounds that collapse from overreaching, never from coasting.\n\n` +
      `The historical caveat, because the underground keeps honest books: rookie crowns are predictions, not achievements, and the archive of year-one phenoms who plateaued is thick. The sophomore year — when rooms have your film and expectations have your name — is the real exam.\n\n` +
      `Class is in session. He's ahead of it. For now.`,
  },
  {
    code: 'RANK_ALGORITHM_WRONG',
    category: 'rankings_reactions',
    weight: 9,
    articleType: 'power_ranking',
    blogger: 'the_battle_breakdown',
    headline: ({ a }) => `The Fans Say the Algorithm Is Wrong About ${a.name} — Let's Actually Check`,
    body: ({ a }) =>
      `Let's go to the scorecards — because the loudest claim on the timeline this week is that the rating system "doesn't understand" ${a.name}, currently boarded at **${a.rating}**. Vibes versus math. Let's adjudicate properly.\n\n` +
      `**The fans' case:** the eye test. Watch any recent ${a.name} round and the number feels wrong — the room control, the ${styleOf(a)}, the moments that travel. Numbers don't clip well; he does.\n\n` +
      `**The algorithm's case:** ratings measure *outcomes against quality of opposition*, weighted by recency. They are deliberately deaf to virality, charisma, and how good a loss looked. That deafness is a feature — it's the only thing standing between rankings and a popularity contest.\n\n` +
      `**The audit:** both are right about different layers. The number accurately prices his *results*. The eye test accurately detects that his *performances* are outrunning those results — strength of schedule and a couple of coin-flip verdicts are suppressing the rating below the skill. That's not the algorithm failing; that's the algorithm waiting for evidence the eye already has.\n\n` +
      `Verdict: the number is honest and the fans are early. In this sport, both things are usually true at once. The board always pays its debts — eventually.`,
  },
];

// ============================================================================
// LIFESTYLE / FLAVOR — studio sightings, merch, charity, training camps
// ============================================================================

const LIFESTYLE: WorldEventTemplate[] = [
  {
    code: 'LIFE_STUDIO_SIGHTING',
    category: 'lifestyle',
    weight: 10,
    articleType: 'culture',
    blogger: 'battle_eyez',
    headline: ({ a }) => `${a.name} Spotted in the Studio With a Known Producer — Music Pivot or Just Flexing?`,
    body: ({ a, pick }) =>
      `Let me put you on to what really happened, because one blurry studio photo has the culture running three different investigations.\n\n` +
      `${a.name} was photographed this week in a real studio — not a bedroom setup, a *booked-rooms* studio — alongside a producer whose credits you'd recognize. ${pick([
        `No caption. Battlers only post no-caption studio flicks when they want exactly this conversation.`,
        `The session reportedly ran past 4 a.m., which is either album behavior or expensive hanging out.`,
        `A second photo surfaced from someone else's story before being deleted. The deletion, naturally, confirmed everything and nothing.`,
      ])}\n\n` +
      `The battle-rap-to-music pipeline has a complicated history, and the culture's anxiety is earned: for every battler who added music successfully, there are five who came back to the stage two years later asking for their old slot. The skills overlap less than fans assume — rooms reward density and presence; records reward space and restraint.\n\n` +
      `${a.name}'s camp says, predictably, "he's just creating." Sure. But sources tell me there's a project folder with a name on it. Whether it ever leaves the folder — that's the actual story. Developing, as we say.`,
  },
  {
    code: 'LIFE_MERCH_DROP',
    category: 'lifestyle',
    weight: 9,
    articleType: 'culture',
    blogger: 'the_main_stage_herald',
    headline: ({ a }) => `${a.name}'s Merch Drop Sold Out in Hours — The Brand Is Real`,
    body: ({ a, int, pick }) =>
      `On the biggest stage in battle rap, the scoreboard isn't only rounds anymore — and ${a.name} just posted numbers on the other one. His merch drop this week sold out in **under ${int(3, 12)} hours**.\n\n` +
      `The line itself was smart: ${pick([
        `a single catchphrase from his catalog across hoodies and tees — wearable quotables, which is the only merch formula that works in this culture.`,
        `clean designs referencing his most clipped moment, plus a limited piece numbered like fight memorabilia. Somebody on his team understands collectors.`,
        `nothing fancy — quality blanks, one iconic graphic, fair price. The restraint IS the flex.`,
      ])}\n\n` +
      `Why this matters beyond the bag: sell-through is the most honest fan metric that exists. Views are passive, comments are free, but merch is people *voting with rent money* — and the vote says ${a.name}'s audience isn't just watching, it's invested. Leagues read these numbers too; a battler who moves product moves tickets, and ticket-movers negotiate from thrones.\n\n` +
      `At ${a.rating} on the boards and selling out collections off the stage, ${a.name} is building the full machine. Restock pending. So is the leverage.`,
  },
  {
    code: 'LIFE_CHARITY_DRIVE',
    category: 'lifestyle',
    weight: 8,
    articleType: 'culture',
    blogger: 'underground_voice',
    headline: ({ a }) => `${a.name} Ran a Back-to-School Drive in ${home(a)} — No Cameras Until Someone Else Brought One`,
    body: ({ a, int, pick }) =>
      `The underground sees everything — including the things battlers do when they think nobody's filming.\n\n` +
      `${a.name} spent his Saturday running a back-to-school drive in ${home(a)}: backpacks, supplies, haircut vouchers, ${int(100, 400)} kids served. Here's the detail that makes it news: **he didn't announce it.** The footage that surfaced came from a parent's phone, posted with a caption thanking "the rapper from around here." His own pages stayed silent until people started asking.\n\n` +
      `${pick([
        `Locals say it's the third year running — the first two stayed completely off the timeline.`,
        `He reportedly covered the shortfall out of pocket when donations came up light. Quietly. Of course quietly.`,
        `When a recap channel reached out for comment, his answer was: "Talk about my next battle instead."`,
      ])}\n\n` +
      `The culture spends most of its oxygen on beef and bookings, and fair enough — that's the sport. But the battlers are *from somewhere*, and the somewheres remember different receipts than the algorithm does. In ${home(a)}, ${a.name}'s name carries weight no rating measures.\n\n` +
      `The underground notes it for the record. Then we let the man get back to work.`,
  },
  {
    code: 'LIFE_COURTSIDE',
    category: 'lifestyle',
    weight: 8,
    articleType: 'culture',
    blogger: 'battle_eyez',
    headline: ({ a }) => `${a.name} Spotted Courtside — and the Company He Kept Is the Real Story`,
    body: ({ a, pick }) =>
      `Let me put you on to what really happened at the arena this week, because the broadcast camera found ${a.name} sitting **courtside** — and the culture immediately started doing math.\n\n` +
      `Courtside isn't a seat, it's a statement; those tickets cost real money and they're photographed for free. But the seat is the footnote. The headline is who was *next to him*: ${pick([
        `a music-industry figure whose last three co-signs all turned into deals. Coincidence is for people who don't pay attention.`,
        `a league owner. A DIFFERENT league than the one ${a.name} battles for. Enjoy that detail; both offices certainly are.`,
        `two mainstream artists who spent the third quarter visibly more interested in his phone than the game.`,
      ])}\n\n` +
      `The clip went around at culture speed: battle fans proud to see one of ours in the expensive light, skeptics asking who paid, and everyone else zooming in on body language like forensic analysts.\n\n` +
      `What it means materially? Maybe nothing — sometimes a man just likes basketball. But battlers at ${a.rating} don't usually end up in those seats by accident, and word on the street says the conversation in section one was not about the game. Developing. Obviously.`,
  },
  {
    code: 'LIFE_TRAINING_CAMP',
    category: 'lifestyle',
    weight: 10,
    articleType: 'culture',
    blogger: 'the_main_stage_herald',
    headline: ({ a }) => `Training Camp Rumors: ${a.name} Has Gone Dark, and That Usually Means One Thing`,
    body: ({ a, int, pick }) =>
      `On the biggest stage in battle rap, silence is a tell. And ${a.name} has gone **completely dark** — no posts, no appearances, no comment — for ${int(3, 8)} weeks.\n\n` +
      `In this sport, that pattern has a name: training camp. The whispers paint the picture: ${pick([
        `a rented spot outside the city, a small circle of trusted writers, and phones in a basket at the door.`,
        `daily sessions with sparring partners imitating a specific opponent's style. You don't build a sparring camp around a hypothetical.`,
        `he's reportedly performing full rounds to empty rooms every night — building the muscle memory before the material ever meets a crowd.`,
      ])}\n\n` +
      `The question lighting up the group chats: camp for *what*? No booking has been announced. But battlers at ${a.rating} don't vanish for conditioning — they vanish for **occasions**. Something big enough to justify the monk mode is either signed quietly or close to it.\n\n` +
      `The history here is encouraging: ${a.name}'s best performances have all followed his quietest stretches. The man treats preparation like the main event, and the main events have treated him accordingly.\n\n` +
      `Whoever the camp is for: it's being built for you. Sleep well.`,
  },
  {
    code: 'LIFE_PODCAST_LAUNCH',
    category: 'lifestyle',
    weight: 9,
    articleType: 'culture',
    blogger: 'battle_eyez',
    headline: ({ a }) => `${a.name} Launched a Podcast — and Episode One Already Has the Culture Arguing`,
    body: ({ a, pick }) =>
      `Let me put you on to what really happened. ${a.name} joined the podcast economy this week — battler, mic, two cameras, the standard setup — and episode one made it immediately clear this won't be the usual "legendary guests and lukewarm takes" formula.\n\n` +
      `${pick([
        `He spent twenty minutes on what battlers actually get paid versus what fans assume, with numbers. NUMBERS. The culture's most protected secret, aired in episode one.`,
        `He told a faceoff story involving two names he didn't bleep. One of those names has already responded with "we'll talk about it in person." So episode two writes itself.`,
        `His ranking segment put a beloved vet outside the top ten, and his explanation was so calmly reasoned it made people angrier.`,
      ])}\n\n` +
      `The battler-podcast pipeline is crowded, but the successful ones share a trait: proximity to information the fans can't get elsewhere. ${a.name} has spent years in back rooms, negotiations, and prep sessions — the man is a walking archive of off-camera truth, and he's clearly decided to monetize the vault.\n\n` +
      `The risk: every honest episode is a future faceoff topic. The reward: relevance between bookings. Word on the street says episode two has a guest that'll break the culture's brain. We'll be watching. Everyone will.`,
  },
  {
    code: 'LIFE_ACTING_ROLE',
    category: 'lifestyle',
    weight: 7,
    articleType: 'culture',
    blogger: 'battle_eyez',
    headline: ({ a }) => `${a.name} Got Cast in a Film — Stage Presence Translates, Apparently`,
    body: ({ a, pick }) =>
      `Let me put you on to what really happened, because the casting news caught everybody off guard except the people who've watched ${a.name} perform.\n\n` +
      `An independent film confirmed this week that ${a.name} has been cast in a real role — ${pick([
        `not a cameo-as-himself, an actual character with a name and an arc.`,
        `reportedly after the director saw battle footage and said "that man's already acting, he just doesn't have a script."`,
        `beating out trained actors in the audition, per someone in the production.`,
      ])}\n\n` +
      `It tracks. Battle rap at the top level IS performance craft: persona construction, emotional control on cue, holding a hostile room with body language alone. The skills the stage builds — presence, projection, the ability to *deliver a line like it costs something* — are the same muscles a camera wants.\n\n` +
      `The culture's reaction splits the usual way. Half: pride — every battler who crosses into legitimate work raises the sport's ceiling. The other half: the side-eye — Hollywood detours have eaten battlers before, and the stage doesn't hold your spot.\n\n` +
      `${a.name}'s answer to that concern was clean: "The pen pays for all of it. I'm not going anywhere." Production starts soon. The premiere card — sorry, *premiere* — will be must-see either way.`,
  },
  {
    code: 'LIFE_FITNESS_ARC',
    category: 'lifestyle',
    weight: 8,
    articleType: 'culture',
    blogger: 'the_main_stage_herald',
    headline: ({ a }) => `${a.name}'s Transformation Has the Culture Talking — Discipline Travels`,
    body: ({ a, int, pick }) =>
      `On the biggest stage in battle rap, the body keeps the score too — and ${a.name} just posted receipts. The transformation photo went up this week: **${int(25, 60)} pounds** difference, a year apart, same man, visibly not the same man.\n\n` +
      `The culture's response was immediate and — refreshingly — almost entirely respect. ${pick([
        `Fellow battlers flooded the comments asking for the routine. He answered every one.`,
        `The caption was one line: "Hard to beat a man who keeps promises to himself." Instant quotable.`,
        `Even rivals dapped it up publicly. Some achievements transcend beef.`,
      ])}\n\n` +
      `And before anyone files this under vanity: stage stamina is a competitive stat. Three rounds in a hot room is *cardio* — breath control degrades before pen quality does, and the dying-round-three battler is a known archetype. Performers who fix their conditioning routinely add a visible gear to their delivery. The discipline compounds elsewhere too; people around him say the writing schedule got the same renovation as the training schedule.\n\n` +
      `${a.name} at ${a.rating} with a new engine and old motives — that's not a lifestyle story, that's a scouting report. Opponents, adjust accordingly.`,
  },
  {
    code: 'LIFE_BAR_TATTOO',
    category: 'lifestyle',
    weight: 7,
    articleType: 'culture',
    blogger: 'marijuana_piranha',
    headline: ({ a }) => `A Fan Got ${a.name}'s Bar Tattooed — The Highest Award This Culture Gives`,
    body: ({ a, pick }) =>
      `Keep it a buck — this culture got no trophies, no hall of fame building, no ring ceremony. What we got is this: a fan walked into a shop this week and got a ${a.name} bar **tattooed on his arm**. Permanent. Spelled correctly and everything.\n\n` +
      `The photo made the rounds and ${a.name}'s response was perfect: ${pick([
        `"I wrote that at 3am doubting myself. It's on a human being forever now. I'm done doubting."`,
        `he reposted it with no words. Some moments don't need a caption and he knew it.`,
        `"That's more pressure than any battle. Can't write mid bars when people WEARING the catalog."`,
      ])}\n\n` +
      `Think about what it actually means. People clip battles, quote battles, argue battles — that's appreciation. But putting a man's pen on your skin? That's testimony. That bar walked somebody through something real, and now it's part of their body's story. Mainstream artists get that energy all the time. Battlers earn it bar by bar in rooms with no pyro and no playlist placement.\n\n` +
      `Keep it a buck one more time: ratings move, streaks end, thrones change hands. Ink stays. ${a.name} just got the only award in this culture that can't be debated in the comments.`,
  },
  {
    code: 'LIFE_SNEAKER_RITUAL',
    category: 'lifestyle',
    weight: 7,
    articleType: 'culture',
    blogger: 'battle_eyez',
    headline: ({ a }) => `${a.name}'s Pre-Battle Ritual Got Exposed — and It's Weirder Than Anyone Guessed`,
    body: ({ a, pick }) =>
      `Let me put you on to what really happened, because a former cardmate just exposed ${a.name}'s pre-battle ritual on a stream, and the culture has been delightfully obsessed since.\n\n` +
      `The testimony: ${pick([
        `the man wears the SAME pair of beat-up sneakers to every battle — never cleaned, never replaced, allegedly older than his career. New shoes, he believes, mean new problems.`,
        `he eats the exact same meal before every booking, from whatever version of the same chain restaurant exists in that city. The order hasn't changed in years.`,
        `he writes his entire third round LAST, the night before, every time — superstition says a third round written early "goes stale in the chamber."`,
      ])}\n\n` +
      `When pressed about it, ${a.name} didn't deny a thing: "Y'all got therapists, I got routines. Scoreboard says they work." Hard to argue with ${a.rating}${rec(a) ? ` and ${rec(a)}` : ''}.\n\n` +
      `Athletes have ritual culture and nobody blinks — same socks, same warmup, same prayer. Battlers are athletes of a kind; the performance anxiety is real, the variance is brutal, and control is wherever you can manufacture it.\n\n` +
      `The best part: now every opponent knows the ritual. Expect bar references at his next faceoff. The culture wastes nothing.`,
  },
  {
    code: 'LIFE_LOCAL_BUSINESS',
    category: 'lifestyle',
    weight: 8,
    articleType: 'culture',
    blogger: 'underground_voice',
    requires: ({ a }) => !!a.cityName,
    headline: ({ a, city }) => `${a.name} Opened a Business in ${city.name} — Investing Where the Bars Came From`,
    body: ({ a, city, pick }) =>
      `The underground sees everything — and this week it saw something it doesn't see enough: a battler putting his money back into the zip code that raised him.\n\n` +
      `${a.name} cut the ribbon on ${pick([
        `a barbershop in ${city.name} — and yes, the battle rap debates inside are reportedly already legendary, with the owner occasionally stepping in as judge.`,
        `a studio space in ${city.name} offering rates the local kids can actually afford, with a free-hours program for anyone still in school.`,
        `a clothing storefront in ${city.name} stocking local brands alongside his own line — a physical address for a scene that's always been word-of-mouth.`,
      ])}\n\n` +
      `The economics of battle rap being what they are, every battler eventually faces the diversification question. Most answers point away from home — investments wherever the accountant says. ${a.name} pointed his at ${city.name}, and the difference matters: payroll for locals, a gathering spot for the scene, proof in brick form that the culture's money can stay in the culture's neighborhoods.\n\n` +
      `"The city bought my first tickets," he said at the opening. "This is the receipt."\n\n` +
      `At ${a.rating} on the boards and now invested on the block — that's a portfolio the underground can endorse without a single caveat.`,
  },
  {
    code: 'LIFE_GAMING_STREAM',
    category: 'lifestyle',
    weight: 8,
    articleType: 'culture',
    blogger: 'battle_eyez',
    linkSecondary: true,
    headline: ({ a, b }) => `${a.name} Was Mid-Gaming-Stream When ${b.name} Pulled Up in the Chat — It Got Spicy`,
    body: ({ a, b, pick }) =>
      `Let me put you on to what really happened on last night's stream, because battle rap's two favorite arenas — the stage and the chat — just collided beautifully.\n\n` +
      `${a.name} was deep in a casual gaming stream, guard fully down, when a username everyone recognized slid into the chat: **${b.name}**. The chat noticed before ${a.name} did, which made the moment even better — three hundred viewers watching him slowly register the name on screen.\n\n` +
      `${pick([
        `${b.name}'s opener: "you battle like you play." ${a.name} paused the game. PAUSED it. "Run it back when you got the heart to say that at a faceoff."`,
        `What followed was ten minutes of trash talk so sharp the clip outperformed both men's last battle footage.`,
        `${a.name} read the name, smiled, and said "donate first, disrespect second, them's the rules." ${b.name} actually donated. Then disrespected. Honestly? Honorable.`,
      ])}\n\n` +
      `It stayed (mostly) playful — but real ones know "playful" between two battlers with ratings of ${a.rating} and ${b.rating} is just a faceoff with extra steps. Sources tell me clips were screen-recorded by at least one league employee within the hour.\n\n` +
      `The streets want the booking. The chat wants the rematch. Same thing, really.`,
  },
  {
    code: 'LIFE_WRITING_PROCESS',
    category: 'lifestyle',
    weight: 9,
    articleType: 'culture',
    blogger: 'small_room_report',
    headline: ({ a }) => `Inside ${a.name}'s Writing Process — A Rare Look at How the Rounds Get Built`,
    body: ({ a, int, pick }) =>
      `The small room doesn't lie — and neither, it turns out, does the notebook. ${a.name} gave a long-form interview this week walking through his actual writing process, and for craft obsessives it's the document of the year.\n\n` +
      `The revelations: ${pick([
        `he writes ${int(6, 12)} versions of every round and performs them all alone, full volume, recording each — then picks the version that sounds best at minute three of an imaginary battle, "because that's when the room is tiredest and the writing has to carry."`,
        `every opponent gets a dossier first — interviews watched, old rounds catalogued, verbal habits mapped — before he writes a single bar. "You don't write AT a man. You write INTO him."`,
        `he keeps a "graveyard file" of bars too good for the wrong opponent — material that waits, sometimes years, for the name it was always meant for. The file is reportedly hundreds deep.`,
      ])}\n\n` +
      `What separates this from the usual process talk is the *labor* on display. The culture mythologizes natural talent because it makes better legend, but ${a.name}'s method is blue-collar: drafts, dossiers, rehearsal, revision. The ${a.rating} rating wasn't channeled from the ether. It was manufactured, deliberately, in unglamorous hours.\n\n` +
      `Young writers: screenshot the whole interview. That's the actual cheat code — there isn't one.`,
  },
  {
    code: 'LIFE_FAMILY_MOMENT',
    category: 'lifestyle',
    weight: 7,
    articleType: 'culture',
    blogger: 'underground_voice',
    headline: ({ a }) => `${a.name} Brought His Kid On Stage After the Card — the Clip the Culture Needed`,
    body: ({ a, pick }) =>
      `The underground sees everything — and sometimes what it sees is just... good. After the final battle of a weekend card, with the room still buzzing, ${a.name} brought his kid up on stage.\n\n` +
      `${pick([
        `The little one grabbed the mic, said "my daddy won," and the room — full of grown battle rap fans who'd spent three hours yelling about violence bars — completely melted.`,
        `He walked the kid through a tiny crowd wave, then whispered something that made them both laugh. The cameras caught it. The internet kept it.`,
        `The kid did a perfect impression of his dad's signature stage walk, and the room gave it a louder reaction than half the night's actual rounds.`,
      ])}\n\n` +
      `The clip traveled all week, and the comments told the real story — battlers, fans, even known rivals, all in agreement for once. Because the culture knows what it costs to do this job: the weekends away, the prep hours stolen from family time, the financial coin-flips. Every battler's family pays a tax the audience never sees.\n\n` +
      `${a.name} has spent years giving rooms his sharpest material. This week he gave the culture its softest moment, and honestly? It might outlast the bars. Some footage ages like wine. Some ages like family photos. Both are archives.`,
  },
  {
    code: 'LIFE_LAB_TOUR',
    category: 'lifestyle',
    weight: 8,
    articleType: 'culture',
    blogger: 'battle_eyez',
    headline: ({ a }) => `${a.name} Gave a Vlog Tour of "The Lab" — Where the Rounds Actually Get Written`,
    body: ({ a, pick }) =>
      `Let me put you on to what really happened in the most-watched vlog of the week: ${a.name} opened the door to **the lab** — the room where the rounds get built — and gave a full tour.\n\n` +
      `What the camera found: ${pick([
        `a wall covered in index cards — angles, schemes, opponent notes — arranged like a detective's case board. He blurred exactly one section of it. ONE. The speculation about that blur is its own news cycle now.`,
        `whiteboards mapping round structures like football plays, a shelf of notebooks dating back to his open-mic days, and a chair he refuses to replace because "every good round got written in it."`,
        `printed photos of every opponent he's ever faced, taped in chronological order. "I keep the history visible," he said. "Reminds me what the next man's planning for me."`,
      ])}\n\n` +
      `The culture eats these tours up for the same reason boxing fans love gym footage: it's the only honest look at the iceberg under the performance. The stage gets the three rounds; the lab gets the three hundred hours.\n\n` +
      `Best moment of the vlog: asked what he's working on right now, ${a.name} looked dead into the lens and said, "Somebody's name is on this wall who don't know it yet." Word on the street is several somebodies watched twice. Nervously.`,
  },
  {
    code: 'LIFE_CHAIN_PENDANT',
    category: 'lifestyle',
    weight: 7,
    articleType: 'culture',
    blogger: 'marijuana_piranha',
    headline: ({ a }) => `${a.name}'s New Chain Has the Whole Culture Zooming In — The Pendant Is a Statement`,
    body: ({ a, pick }) =>
      `Keep it a buck — jewelry in this culture is never just jewelry. It's a press release you wear. And ${a.name} pulled up to an event this week wearing a brand new piece that had every camera zooming.\n\n` +
      `The pendant: ${pick([
        `a diamond-flooded microphone snapped in half. Asked about it, he said "that's everybody after me." Cold. Unnecessary. Perfect.`,
        `his hometown's area code in heavy gold. No league logo, no crew sign — the city. "Everything I got came from them digits," he said, and the hometown timeline lit UP.`,
        `a tiny iced-out pen. A PEN. While everybody else wears their name, this man wore the weapon. The writers in the culture immediately crowned it the hardest piece of the year.`,
      ])}\n\n` +
      `The economics deserve a buck of honesty too: a piece like that announces the battling money is real. Fans argue endlessly about what battlers make; chains end arguments. You don't ice a pendant off exposure.\n\n` +
      `${a.name} at ${a.rating}, wearing the career around his neck — that's not flexing, that's an audited financial statement with carats. The culture zoomed in, read every word, and understood the assignment.`,
  },
];

// ============================================================================
// Registry
// ============================================================================

export const WORLD_EVENT_TEMPLATES: WorldEventTemplate[] = [
  ...CALLOUTS,
  ...BEEF,
  ...LEAGUE_BUSINESS,
  ...STREETS_CULTURE,
  ...CAREER_ARCS,
  ...CITY_SCENES,
  ...RANKINGS_REACTIONS,
  ...LIFESTYLE,
];

export function templateCountByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of WORLD_EVENT_TEMPLATES) {
    counts[t.category] = (counts[t.category] ?? 0) + 1;
  }
  return counts;
}
