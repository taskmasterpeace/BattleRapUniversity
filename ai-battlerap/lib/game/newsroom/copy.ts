/**
 * Newsroom copy — what a blogger actually posts when they drop a story.
 *
 * Keyed by subcategory. Each entry has BREAKING lines (dropped hot, right after
 * it happened) and DEVELOPING lines (they sat on it, now framing it as a piece).
 * Placeholders: {subject} {other} {hint}. Described moments only — never a bar.
 */

type CopySet = { breaking: string[]; developing: string[] };

const GENERIC: CopySet = {
  breaking: [
    '{subject} is the story tonight. {hint}',
    'Word coming in on {subject}. {hint}',
  ],
  developing: [
    "Been sitting on this one. {subject}: {hint}. Here's why it matters.",
    'Nobody wanted to say it yet, so I will. {subject} — {hint}.',
  ],
};

export const NEWSROOM_COPY: Record<string, CopySet> = {
  statement_win: {
    breaking: [
      '{subject} just made a STATEMENT. That wasn’t a win, that was a message.',
      'Whole timeline stopped for {subject}. {hint}',
    ],
    developing: [
      'I’ve watched {subject}’s tape three times now. That performance is going to age well.',
      'Everybody moved on already but {subject}’s night deserves a real writeup. {hint}',
    ],
  },
  hot_streak: {
    breaking: [
      'That’s the run for {subject}. Nobody’s solved them yet.',
      '{subject} is on a HEATER. Who’s stopping this?',
    ],
    developing: [
      'Ran the numbers on {subject}’s streak. This isn’t luck anymore, it’s a problem for the division.',
      'Quietly, {subject} put together the best stretch nobody’s talking about. Until now.',
    ],
  },
  close_call: {
    breaking: ['{subject} escaped. {hint} That was closer than the scorecard says.'],
    developing: ['Rewatched the {subject} decision. The debate everybody wants to have, broken down.'],
  },
  bad_night: {
    breaking: ['Rough one for {subject}. {hint}', '{subject} got got. It happens to everybody once.'],
    developing: ['Not a funeral, but {subject} has questions to answer after that one. Let’s talk about it.'],
  },
  slump: {
    breaking: ['Three of the last outings gone wrong for {subject}. Something’s off.'],
    developing: ['I don’t think {subject} is washed. I think {subject} is lost. There’s a difference — here’s the case.'],
  },
  league_move: {
    breaking: ['{subject} is switching leagues. {hint}', 'BREAKING: {subject} on the move.'],
    developing: ['The {subject} move makes more sense than you think. Follow the money and the matchups.'],
  },
  press: {
    breaking: ['{subject} sat down with us. The quotes are already traveling.'],
    developing: ['Full {subject} sit-down. They said more than they meant to.'],
  },
  robbed: {
    breaking: ['{subject} got ROBBED. {hint} The room knew it, the cards didn’t.'],
    developing: ['The {subject} “robbery” everybody’s screaming about — here’s what the tape actually shows.'],
  },
  beef: {
    breaking: ['{subject} and {other} are NOT friends. {hint}', '{subject} just put {other} on notice.'],
    developing: ['This {subject} / {other} thing has been building for a while. Let me walk you through it.'],
  },
  ducking: {
    breaking: ['They’re saying {subject} is ducking. {hint}'],
    developing: ['Is {subject} protecting a record? Looked at who they’ve avoided. Judge for yourself.'],
  },
  exposed: {
    breaking: ['{subject} got exposed. {hint} This one’s spreading fast.'],
    developing: ['Sat on the {subject} situation until I could confirm it. Now I can. {hint}'],
  },
  disrespect: {
    breaking: ['{subject} said WHAT about {other}? The disrespect is crazy.'],
    developing: ['The {subject}–{other} disrespect isn’t random. There’s history. Here it is.'],
  },
  callout: {
    breaking: ['{subject} just called {other} OUT. Ball’s in {other}’s court.'],
    developing: ['{subject}’s callout of {other} is smarter than it looks. Breaking down the angle.'],
  },
  come_up: {
    breaking: ['{subject} is eating now. {hint}', 'The bag found {subject}. Deserved.'],
    developing: ['How {subject} turned buzz into a check — the come-up nobody saw coming.'],
  },
  broke: {
    breaking: ['Hearing {subject} is going through it financially. {hint}'],
    developing: ['The {subject} money situation is a cautionary tale for every battler taking flat fees. Real talk.'],
  },
  got_stiffed: {
    breaking: ['{subject} says a promoter STIFFED them. {hint}'],
    developing: ['Another battler, another stiffed bag. The {subject} case, and why it keeps happening.'],
  },
  sponsorship: {
    breaking: ['{subject} landed a sponsorship. The bag is getting bigger.'],
    developing: ['{subject}’s new deal is a sign of where the culture’s money is going.'],
  },
  health: {
    breaking: ['Word is {subject} is dealing with something. {hint} Sending strength.'],
    developing: ['{subject}’s been quiet for a reason. What we know, handled with care.'],
  },
  confidence: {
    breaking: ['{subject} looked shook out there. {hint} That’s a mental thing now.'],
    developing: ['The choke talk around {subject} is loud. Is it in their head? A real look.'],
  },
  grind: {
    breaking: ['{subject} living in the lab right now. It’s about to show.'],
    developing: ['Spent time on how {subject} actually prepares. The grind behind the bars.'],
  },
  family: {
    breaking: ['Big moment in {subject}’s personal life. {hint} Congratulations are in order.'],
    developing: ['{subject} the person, not the battler. The story behind the name.'],
  },
  crew: {
    breaking: ['Movement in {subject}’s camp. {hint}'],
    developing: ['Every great battler has a room behind them. Inside {subject}’s crew.'],
  },
  camp: {
    breaking: ['{subject} added to the camp. {hint}'],
    developing: ['The people around {subject} are quietly leveling them up. Here’s who.'],
  },
};

export function copyFor(subcategory: string | null | undefined): CopySet {
  return NEWSROOM_COPY[subcategory ?? ''] ?? GENERIC;
}

export function fillCopy(
  template: string,
  ctx: { subject: string; other?: string | null; hint?: string | null }
): string {
  return template
    .replaceAll('{subject}', ctx.subject)
    .replaceAll('{other}', ctx.other ?? 'the other guy')
    .replaceAll('{hint}', (ctx.hint ?? '').trim())
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\./g, '.')
    .trim();
}
