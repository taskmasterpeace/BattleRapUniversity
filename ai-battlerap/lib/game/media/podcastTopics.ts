/**
 * Podcast topic taxonomy — MODULAR, TAGGED, CONTEXT-RICH content blocks.
 *
 * Owner steer (2026-09-01): the blocks gotta be richer than winner+loser — know
 * the battler, the history, where they're from, the past results between them.
 * Intelligently organized.
 *
 * So each block now has:
 *   - role: 'lead' (the main story) | 'context' (history/origin/arc/rep) | 'close',
 *   - condition?: when it's relevant (h2h, streak, scene clash…),
 *   - verbiage that draws on the full dossier (home, record, arc, series, scene).
 *
 * The composer (mediaGenerator.ts) reads the dossier + head-to-head, selects the
 * blocks that fit the ACTUAL story, and orders them lead → context → close.
 *
 * PURE data. No invented bars — performance, momentum, angles, crowd, narrative.
 */

import type { BattleMediaContext, SlotName } from './types';

export type PodcastCategory = 'battle' | 'reputation' | 'beef' | 'career' | 'culture';
export type TopicRole = 'lead' | 'context' | 'close';

export interface PodcastTopic {
  id: string;
  label: string;
  category: PodcastCategory;
  role: TopicRole;
  tags: string[];
  slots: SlotName[];
  /** Episode-title fragments (lead blocks). {slot} placeholders. */
  headlines: string[];
  segmentTopic: string;
  /** Commentary variants. {slot} placeholders. NEVER invent bars. */
  takes: string[];
  /** Story size 1–5. */
  weight: number;
  /** When this block is relevant. Omitted = always eligible (leads/close). */
  condition?: (ctx: BattleMediaContext) => boolean;
}

export const PODCAST_TOPICS: Record<string, PodcastTopic> = {
  // ══ LEAD blocks — the main story (one per episode, by mainStory) ══
  battle_upset: {
    id: 'battle_upset', label: 'THE UPSET', category: 'battle', role: 'lead',
    tags: ['upset', 'underdog', 'battle'], slots: ['winner', 'loser', 'winnerHome', 'winnerRecord', 'score'],
    headlines: ['HOW DID NOBODY SEE {winner} COMING?', '{winner} SHOCKS {loser} — THE BREAKDOWN'],
    segmentTopic: 'THE UPSET',
    takes: [
      'Out of {winnerHome} at {winnerRecord}, {winner} was supposed to be a stepping stone. He walked into {loser}’s night and took it over.',
      '{winner} controlled the pace from the jump and never gave it back — you felt the room flip.',
      'This is the one that changes {winner}’s whole trajectory. The names that were untouchable are gettable now.',
    ],
    weight: 4,
  },
  battle_body: {
    id: 'battle_body', label: 'THE BODY', category: 'battle', role: 'lead',
    tags: ['body', 'dominant', 'performance', 'battle'], slots: ['winner', 'loser', 'winnerRecord', 'score'],
    headlines: ['WAS THAT A BODY? {winner} vs {loser}', '{winner} BODIES {loser} — {score}, NO DEBATE'],
    segmentTopic: 'THE DAMAGE',
    takes: [
      '{winner} took every round and the room knew it by the second one — {winnerRecord} and looking the part.',
      '{loser} never adjusted. Same energy round three as round one.',
      'A showing like this forces the gatekeepers to move {winner} up. Period.',
    ],
    weight: 4,
  },
  battle_choke: {
    id: 'battle_choke', label: 'THE CHOKE', category: 'battle', role: 'lead',
    tags: ['choke', 'shade', 'performance', 'battle'], slots: ['loser', 'winner', 'loserHome'],
    headlines: ['THE CHOKE HEARD ROUND THE ROOM — {loser} BLANKS', '{loser} CHOKED vs {winner} — WHAT HAPPENED?'],
    segmentTopic: 'THE MOMENT',
    takes: [
      'You could hear the room turn. {loser} lost the words and never got the round back.',
      'That clip is going to follow {loser} from {loserHome} to every room he steps in after this.',
      'He can come back from it — but only with a clean showing on a big stage. The pressure’s on now.',
    ],
    weight: 5,
  },
  battle_classic: {
    id: 'battle_classic', label: 'THE CLASSIC', category: 'battle', role: 'lead',
    tags: ['classic', 'elite', 'battle'], slots: ['winner', 'loser', 'score'],
    headlines: ['INSTANT CLASSIC: {winner} vs {loser}', '{winner} vs {loser} — INSTANT CLASSIC ({score})'],
    segmentTopic: 'ROUND BY ROUND',
    takes: [
      'Neither one flinched. Every round was a coin flip and the crowd was up the whole way.',
      '{score} feels right, but you could argue it either way — that’s what makes it a classic.',
      'This is the kind of battle that defines an era. Both leave with more than they came in with.',
    ],
    weight: 5,
  },
  battle_robbery: {
    id: 'battle_robbery', label: 'THE ROBBERY', category: 'battle', role: 'lead',
    tags: ['robbery', 'controversy', 'rematch', 'battle'], slots: ['winner', 'loser'],
    headlines: ['DID {loser} GET ROBBED? THE {winner} DECISION', '{loser} ROBBED?! THE DECISION EVERYONE’S MAD ABOUT'],
    segmentTopic: 'THE CONTROVERSY',
    takes: [
      'Half the room had {loser}. The decision went to {winner} and the comments are on fire.',
      'Watching it back, it’s closer than the yelling suggests — but the argument is real.',
      'You can’t leave it here. This needs a run-back, and the demand just tripled.',
    ],
    weight: 4,
  },
  battle_recap: {
    id: 'battle_recap', label: 'THE RECAP', category: 'battle', role: 'lead',
    tags: ['battle'], slots: ['winner', 'loser', 'winnerRecord', 'score'],
    headlines: ['{winner} def. {loser} — {score} RECAP', 'THE {winner} vs {loser} BREAKDOWN'],
    segmentTopic: 'THE WORK',
    takes: [
      '{winner} did what he was supposed to and took the {score} — {winnerRecord} now.',
      'Solid night for the card. The crowd was into it the whole way.',
      'Both of these names have real matchups waiting after this.',
    ],
    weight: 2,
  },

  // ══ CONTEXT blocks — history, origin, arc (condition-selected) ══
  the_history: {
    id: 'the_history', label: 'THE HISTORY', category: 'career', role: 'context',
    tags: ['history', 'rivalry', 'rematch'], slots: ['winner', 'loser', 'h2h', 'lastMeeting'],
    headlines: [], segmentTopic: 'THE HISTORY',
    takes: [
      'These two got history. {h2h}. {lastMeeting}.',
      'You can’t talk about tonight without the backstory — {h2h}, and it’s been building the whole time.',
    ],
    weight: 4,
    condition: (c) => !!c.headToHead && c.headToHead.total >= 2,
  },
  the_getback: {
    id: 'the_getback', label: 'THE GET-BACK', category: 'career', role: 'context',
    tags: ['revenge', 'rivalry', 'redemption'], slots: ['winner', 'loser', 'lastMeeting'],
    headlines: [], segmentTopic: 'THE GET-BACK',
    takes: [
      'This one was personal. {lastMeeting} — and {winner} spent the whole camp on it. Tonight he got it back.',
      '{winner} owed {loser} one and everybody knew it. Revenge served, live in the room.',
    ],
    weight: 5,
    condition: (c) => !!c.headToHead?.isRevenge,
  },
  style_clash: {
    id: 'style_clash', label: 'THE STYLE CLASH', category: 'culture', role: 'context',
    tags: ['style', 'scene', 'culture'], slots: ['winner', 'loser', 'winnerScene', 'loserScene', 'winnerHome', 'loserHome'],
    headlines: [], segmentTopic: 'THE STYLE CLASH',
    takes: [
      'Two different worlds in one room — {winner}’s {winnerScene} approach out of {winnerHome} against {loser}’s {loserScene} lane. That contrast is the whole show.',
      'You could feel the scenes clashing. {winnerHome} vs {loserHome}, two different ways to win a round.',
    ],
    weight: 3,
    condition: (c) => !!c.winner.scene && !!c.loser.scene && c.winner.scene !== c.loser.scene,
  },
  the_run: {
    id: 'the_run', label: 'THE RUN', category: 'career', role: 'context',
    tags: ['streak', 'arc', 'career'], slots: ['winner', 'winnerArc', 'winnerRecord'],
    headlines: [], segmentTopic: 'THE RUN',
    takes: [
      '{winner} is {winnerRecord} and {winnerArc}. This isn’t a fluke — it’s a run.',
      'Where {winner}’s career is right now, {winnerArc}, this win means more than the number.',
    ],
    weight: 3,
    condition: (c) => Math.abs(c.winner.streak ?? 0) >= 3,
  },
  the_slide: {
    id: 'the_slide', label: 'THE SLIDE', category: 'career', role: 'context',
    tags: ['decline', 'arc', 'career'], slots: ['loser', 'loserArc', 'loserRecord'],
    headlines: [], segmentTopic: 'THE SLIDE',
    takes: [
      '{loser} is {loserRecord} and {loserArc}. Nights like this are how careers quietly turn.',
      'The concerning part for {loser} — {loserArc}. The window doesn’t stay open forever.',
    ],
    weight: 3,
    condition: (c) => (c.loser.streak ?? 0) <= -3,
  },
  résumé_check: {
    id: 'résumé_check', label: 'THE RÉSUMÉ', category: 'career', role: 'context',
    tags: ['résumé', 'rankings', 'career'], slots: ['winner', 'winnerRecord'],
    headlines: [], segmentTopic: 'THE RÉSUMÉ',
    takes: [
      'Add it to the file — {winner} at {winnerRecord} with a real name on the board now.',
      'The résumé is starting to talk for {winner}. The rankings people have to respond.',
    ],
    weight: 2,
    condition: (c) => !!c.winner.notableWinName,
  },

  // ══ CONTEXT blocks — reputation (composer picks the primary scar) ══
  rep_snitch: {
    id: 'rep_snitch', label: 'THE PAPERWORK', category: 'reputation', role: 'context',
    tags: ['snitch', 'credibility', 'scandal', 'reputation'], slots: ['subject', 'subjectHome'],
    headlines: ['THE {subject} PAPERWORK — CAN THE CULTURE MOVE PAST IT?'], segmentTopic: 'THE ELEPHANT IN THE ROOM',
    takes: [
      'You can’t talk about {subject} without the paperwork. It colors every crowd he stands in front of.',
      'In a street-rooted culture, this is the one thing you don’t out-rap. Out of {subjectHome} or anywhere — it just sits there.',
    ],
    weight: 5,
  },
  rep_ghostwriter: {
    id: 'rep_ghostwriter', label: 'THE PEN QUESTION', category: 'reputation', role: 'context',
    tags: ['ghostwriter', 'credibility', 'scandal', 'reputation'], slots: ['subject'],
    headlines: ['DOES {subject} WRITE HIS OWN BARS?'], segmentTopic: 'THE PEN QUESTION',
    takes: [
      'For a battler billed on the pen, this accusation undoes the whole résumé — win or lose.',
      'Every result gets an asterisk in some eyes now. {subject} can’t fully shake it.',
    ],
    weight: 4,
  },
  rep_washed: {
    id: 'rep_washed', label: 'THE WASHED TALK', category: 'reputation', role: 'context',
    tags: ['washed', 'decline', 'reputation'], slots: ['subject', 'subjectRecord'],
    headlines: ['IS {subject} WASHED?'], segmentTopic: 'THE WASHED TALK',
    takes: [
      'People wrote {subject} off, and at {subjectRecord} the last few showings didn’t help the case.',
      'One more flat night and the "washed" label locks in on {subject} for good.',
    ],
    weight: 3,
  },
  rep_ducking: {
    id: 'rep_ducking', label: 'THE DUCKING TALK', category: 'reputation', role: 'context',
    tags: ['ducking', 'cowardice', 'reputation'], slots: ['subject', 'rival'],
    headlines: ['IS {subject} DUCKING {rival}?'], segmentTopic: 'HE DON’T WANT IT?',
    takes: [
      '{subject} has had every chance to sign {rival} and hasn’t. The talk keeps getting louder.',
      'One signature kills this narrative. Until then the "scared of the smoke" label rides with {subject}.',
    ],
    weight: 3,
  },
  rep_mainstream: {
    id: 'rep_mainstream', label: 'THE CROSSOVER', category: 'reputation', role: 'context',
    tags: ['mainstream', 'crossover', 'reputation', 'culture'], slots: ['subject'],
    headlines: ['{subject} WENT MAINSTREAM — DID THE CULTURE LOSE HIM?'], segmentTopic: 'THE CROSSOVER QUESTION',
    takes: [
      '{subject} blew up outside the leagues — validation to some, betrayal to the purists.',
      'Coming back and still doing this at a high level buys {subject} back a lot of respect.',
    ],
    weight: 3,
  },
  rep_villain: {
    id: 'rep_villain', label: 'THE VILLAIN', category: 'reputation', role: 'context',
    tags: ['villain', 'heel', 'disrespect', 'reputation'], slots: ['subject'],
    headlines: ['{subject} IS THE VILLAIN THE CULTURE NEEDS'], segmentTopic: 'THE HEEL',
    takes: [
      '{subject} figured out being hated sells tickets — and he leans all the way in.',
      'It’s pro wrestling. The disrespect is the draw, and the crowd eats it up while they boo {subject}.',
    ],
    weight: 3,
  },

  // ══ CLOSE block ══
  whats_next: {
    id: 'whats_next', label: 'WHAT’S NEXT', category: 'career', role: 'close',
    tags: ['next', 'career'], slots: ['winner', 'loser'],
    headlines: [], segmentTopic: 'WHAT’S NEXT',
    takes: [
      'So where do they go? {winner} has options now; {loser} has to answer.',
      'The wheel keeps turning — this result just reshuffled the whole board around both of them.',
    ],
    weight: 1,
  },
};

/** Which reputation-label DISPLAY maps to which rep block (priority order). */
export const LABEL_TO_TOPIC: Array<[string, string]> = [
  ['THE PAPERWORK', 'rep_snitch'],
  ['GHOSTWRITTEN', 'rep_ghostwriter'],
  ['DUCKING SMOKE', 'rep_ducking'],
  ['WASHED', 'rep_washed'],
  ['WENT MAINSTREAM', 'rep_mainstream'],
  ['VILLAIN', 'rep_villain'],
];

export const ALL_TOPIC_TAGS: string[] = Array.from(
  new Set(Object.values(PODCAST_TOPICS).flatMap((t) => t.tags))
).sort();

export function fillSlots(template: string, subjects: Partial<Record<SlotName, string>>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => subjects[k as SlotName] ?? `{${k}}`);
}
