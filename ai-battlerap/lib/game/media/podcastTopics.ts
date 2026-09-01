/**
 * Podcast topic taxonomy — the MODULAR, TAGGED content blocks.
 *
 * Owner steer (2026-09-01): "don't worry about the creation of the podcast yet —
 * lock down the things that can happen, the verbiage, how it's written, so it can
 * feed creation later. Everything has to be modular. Tag what podcasts are talking
 * about, so there's a central hub AND a 'podcasts about you' view, and you can
 * hear about other players."
 *
 * So a podcast is NOT a hardcoded episode. It's a composition of these TOPIC
 * BLOCKS. Each block:
 *   - is TAGGED (what it's about) → powers filtering + the "about you" view,
 *   - names its SUBJECT SLOTS (who it's about) → powers subject tagging + drill-down,
 *   - carries VERBIAGE variants (how it's written) → fills with battlers/context,
 *     and later feeds real audio/script generation.
 *
 * PURE data + fill helpers. No DB, no audio, no invented bars — talk performance,
 * momentum, angles, crowd, narrative, like real battle-rap media.
 */

export type PodcastCategory = 'battle' | 'reputation' | 'beef' | 'career' | 'culture';

/** Subjects a block can reference; the composer fills these from context. */
export type SlotName = 'winner' | 'loser' | 'subject' | 'rival' | 'city' | 'score';

export interface PodcastTopic {
  id: string;
  /** Human label, e.g. "THE CHOKE". */
  label: string;
  category: PodcastCategory;
  /** What it's ABOUT — the filter/routing tags. */
  tags: string[];
  /** Which subject slots the verbiage needs. */
  slots: SlotName[];
  /** Episode-title fragments (pick one). Use {slot} placeholders. */
  headlines: string[];
  /** Segment topic label shown next to the take. */
  segmentTopic: string;
  /** Commentary variants (pick one). {slot} placeholders. NEVER invent bars. */
  takes: string[];
  /** Story size 1–5 — drives whether it can lead an episode + duration. */
  weight: number;
}

/**
 * THE TAXONOMY — every "thing that can happen" a podcast talks about.
 * Add here to expand what the media world can say; the composer + hub pick these
 * up automatically. Keep verbiage modular and slot-filled.
 */
export const PODCAST_TOPICS: Record<string, PodcastTopic> = {
  // ── BATTLE outcomes ──
  battle_upset: {
    id: 'battle_upset', label: 'THE UPSET', category: 'battle',
    tags: ['upset', 'underdog', 'battle'], slots: ['winner', 'loser', 'score'],
    headlines: ['HOW DID NOBODY SEE {winner} COMING?', '{winner} SHOCKS {loser} — THE BREAKDOWN', 'THE {winner} UPSET NOBODY PREDICTED'],
    segmentTopic: 'THE UPSET',
    takes: [
      'Everybody walked in expecting {loser} to handle this. The room said different.',
      '{winner} controlled the pace from the jump and never gave it back — you felt the crowd flip.',
      'This is the one that changes {winner}’s whole trajectory. The gettable names just got longer.',
    ],
    weight: 4,
  },
  battle_body: {
    id: 'battle_body', label: 'THE BODY', category: 'battle',
    tags: ['body', 'dominant', 'performance', 'battle'], slots: ['winner', 'loser', 'score'],
    headlines: ['WAS THAT A BODY? {winner} vs {loser}', '{winner} BODIES {loser} — {score}, NO DEBATE'],
    segmentTopic: 'THE DAMAGE',
    takes: [
      '{winner} took every round and the room knew it by the second one.',
      '{loser} never adjusted — same energy round three as round one.',
      'A showing like this forces the gatekeepers to move {winner} up. Period.',
    ],
    weight: 4,
  },
  battle_choke: {
    id: 'battle_choke', label: 'THE CHOKE', category: 'battle',
    tags: ['choke', 'shade', 'performance', 'battle'], slots: ['loser', 'winner'],
    headlines: ['THE CHOKE HEARD ROUND THE ROOM — {loser} BLANKS', '{loser} CHOKED vs {winner} — WHAT HAPPENED?'],
    segmentTopic: 'THE MOMENT',
    takes: [
      'You could hear the room turn. {loser} lost the words and never got the round back.',
      'That clip is going to follow {loser}. The choker talk starts tonight.',
      'He can come back from it — but only with a clean showing on a big stage. The pressure’s on now.',
    ],
    weight: 5,
  },
  battle_classic: {
    id: 'battle_classic', label: 'THE CLASSIC', category: 'battle',
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
    id: 'battle_robbery', label: 'THE ROBBERY', category: 'battle',
    tags: ['robbery', 'controversy', 'rematch', 'battle'], slots: ['winner', 'loser'],
    headlines: ['DID {loser} GET ROBBED? THE {winner} DECISION', '{loser} ROBBED?! THE DECISION EVERYONE’S MAD ABOUT'],
    segmentTopic: 'THE CONTROVERSY',
    takes: [
      'Half the room had {loser}. The decision went the other way and the comments are on fire.',
      'Watching it back, it’s closer than the yelling suggests — but the argument is real.',
      'You can’t leave it here. This needs a run-back, and the demand just tripled.',
    ],
    weight: 4,
  },

  // ── REPUTATION / scandal ──
  rep_snitch: {
    id: 'rep_snitch', label: 'THE PAPERWORK', category: 'reputation',
    tags: ['snitch', 'credibility', 'scandal', 'reputation'], slots: ['subject'],
    headlines: ['THE {subject} PAPERWORK — CAN THE CULTURE MOVE PAST IT?', '{subject} AND THE ELEPHANT IN EVERY ROOM'],
    segmentTopic: 'THE ELEPHANT IN THE ROOM',
    takes: [
      'You can’t talk about {subject} without talking about the paperwork. It colors every crowd he’s in front of.',
      'It doesn’t matter how the bars land — this is the first thing every opponent reaches for.',
      'In a street-rooted culture, this is the one thing you don’t out-rap. It just sits there.',
    ],
    weight: 5,
  },
  rep_ghostwriter: {
    id: 'rep_ghostwriter', label: 'THE PEN QUESTION', category: 'reputation',
    tags: ['ghostwriter', 'credibility', 'scandal', 'reputation'], slots: ['subject'],
    headlines: ['DOES {subject} WRITE HIS OWN BARS? THE GHOSTWRITING TALK', 'THE {subject} PEN QUESTION WON’T GO AWAY'],
    segmentTopic: 'THE PEN QUESTION',
    takes: [
      'For a battler billed on the pen, this is the one accusation that undoes the whole résumé.',
      'Every win gets an asterisk in some people’s eyes now — fair or not.',
      'He can spend the next five years proving it and some folks still won’t let it go.',
    ],
    weight: 4,
  },
  rep_washed: {
    id: 'rep_washed', label: 'THE WASHED TALK', category: 'reputation',
    tags: ['washed', 'decline', 'reputation'], slots: ['subject'],
    headlines: ['IS {subject} WASHED? THE HONEST CONVERSATION', 'WHAT’S LEFT FOR {subject}?'],
    segmentTopic: 'THE WASHED TALK',
    takes: [
      'People wrote {subject} off, and the last few showings didn’t help the case.',
      'There’s a version of this where he flips it — but the clock is loud right now.',
      'One more flat night and the "washed" label locks in for good.',
    ],
    weight: 3,
  },
  rep_ducking: {
    id: 'rep_ducking', label: 'THE DUCKING TALK', category: 'reputation',
    tags: ['ducking', 'cowardice', 'reputation', 'beef'], slots: ['subject', 'rival'],
    headlines: ['IS {subject} DUCKING {rival}?', 'THE {subject} DUCKING TALK — SIGN THE CONTRACT'],
    segmentTopic: 'HE DON’T WANT IT?',
    takes: [
      'The talk keeps getting louder — {subject} has had every chance to sign {rival} and hasn’t.',
      'At some point the excuses stop working and the "scared of the smoke" label sticks.',
      'One signature kills this whole narrative. Until then, the fans are going to run it.',
    ],
    weight: 3,
  },
  rep_mainstream: {
    id: 'rep_mainstream', label: 'THE CROSSOVER', category: 'reputation',
    tags: ['mainstream', 'crossover', 'reputation', 'culture'], slots: ['subject'],
    headlines: ['{subject} WENT MAINSTREAM — DID THE CULTURE LOSE HIM?', 'THE {subject} CROSSOVER QUESTION'],
    segmentTopic: 'THE CROSSOVER QUESTION',
    takes: [
      '{subject} blew up outside the leagues — validation to some, betrayal to the purists.',
      'Coming back and still doing this at a high level buys back a lot of respect.',
      'The question is whether he still needs this, or he’s just visiting.',
    ],
    weight: 3,
  },
  rep_comeback: {
    id: 'rep_comeback', label: 'THE COMEBACK', category: 'reputation',
    tags: ['comeback', 'redemption', 'reputation'], slots: ['subject'],
    headlines: ['THE {subject} COMEBACK IS REAL', '{subject} SILENCED THE DOUBTERS'],
    segmentTopic: 'THE REDEMPTION',
    takes: [
      'Everybody had the obituary written. {subject} showed up and tore it up.',
      'This is what the culture loves — the fall and the climb back. He earned this one.',
      'The tag he was carrying is peeling off with every clean showing.',
    ],
    weight: 4,
  },
  rep_villain: {
    id: 'rep_villain', label: 'THE VILLAIN', category: 'reputation',
    tags: ['villain', 'heel', 'disrespect', 'reputation'], slots: ['subject'],
    headlines: ['{subject} IS THE VILLAIN THE CULTURE NEEDS', 'NOBODY PLAYS THE BAD GUY LIKE {subject}'],
    segmentTopic: 'THE HEEL',
    takes: [
      '{subject} figured out that being hated sells tickets — and he leans all the way in.',
      'It’s pro wrestling. The disrespect is the draw, and the crowd eats it up while they boo.',
      'You need a villain for the heroes to chase. Right now that’s him.',
    ],
    weight: 3,
  },
  rep_newcomer: {
    id: 'rep_newcomer', label: 'THE NEXT UP', category: 'reputation',
    tags: ['newcomer', 'hype', 'prospect', 'reputation', 'career'], slots: ['subject'],
    headlines: ['IS {subject} THE NEXT UP?', 'REMEMBER THE NAME: {subject}'],
    segmentTopic: 'THE PROSPECT',
    takes: [
      'The buzz on {subject} is real — now comes the part where he has to convert it.',
      'Every era has a prospect everybody argues about. This one’s ours right now.',
      'Hype is a loan. He’s got to pay it back on a big stage before we crown anything.',
    ],
    weight: 3,
  },

  // ── BEEF ──
  beef_callout: {
    id: 'beef_callout', label: 'THE CALLOUT', category: 'beef',
    tags: ['beef', 'callout'], slots: ['subject', 'rival'],
    headlines: ['{subject} CALLED OUT {rival} — IS IT REAL?', 'THE {subject} vs {rival} SMOKE IS BREWING'],
    segmentTopic: 'THE CALLOUT',
    takes: [
      '{subject} said the name. Now the ball’s in {rival}’s court and everybody’s watching.',
      'This is the matchup the culture actually wants. Somebody make it happen.',
      'Talk is cheap until there’s a contract — but the tension is real.',
    ],
    weight: 3,
  },
  beef_response: {
    id: 'beef_response', label: 'THE RESPONSE', category: 'beef',
    tags: ['beef', 'response'], slots: ['subject', 'rival'],
    headlines: ['{subject} RESPONDED TO {rival} — LINE FOR LINE', 'THE {subject} CLAPBACK AT {rival}'],
    segmentTopic: 'THE RESPONSE',
    takes: [
      '{subject} didn’t let it sit — came right back at {rival} and the internet lit up.',
      'Now it’s a real back-and-forth, and a back-and-forth means a battle is coming.',
      'The energy is genuine. This isn’t a work — these two actually want it.',
    ],
    weight: 3,
  },

  // ── CAREER / rankings ──
  ranking_debate: {
    id: 'ranking_debate', label: 'THE RANKINGS', category: 'career',
    tags: ['rankings', 'top5', 'career'], slots: ['subject'],
    headlines: ['IS {subject} TOP 5? THE RANKINGS DEBATE', 'WHERE DOES {subject} SIT NOW?'],
    segmentTopic: 'THE RANKINGS',
    takes: [
      'The list-keepers are arguing about {subject} again — and that argument is itself a status.',
      'Résumé says one thing, the eye test says another. That’s where the debate lives.',
      'Beat one more name people respect and this stops being a debate.',
    ],
    weight: 2,
  },
  gatekeeper_test: {
    id: 'gatekeeper_test', label: 'THE GATEKEEPER', category: 'career',
    tags: ['gatekeeper', 'comeup', 'career'], slots: ['winner', 'loser'],
    headlines: ['{loser} WAS THE GATEKEEPER — {winner} GOT THROUGH', 'THE {winner} COME-UP: PAST THE GATEKEEPER'],
    segmentTopic: 'THE COME-UP',
    takes: [
      '{loser} is the test everybody has to pass. {winner} passed it.',
      'This is how you announce yourself — you go through the established name, not around him.',
      'The come-up is real now. The question is who’s next.',
    ],
    weight: 3,
  },
  undefeated_watch: {
    id: 'undefeated_watch', label: 'THE STREAK', category: 'career',
    tags: ['undefeated', 'streak', 'career'], slots: ['subject'],
    headlines: ['{subject} IS STILL UNDEFEATED — WHO ENDS IT?', 'THE {subject} STREAK IS A BOUNTY NOW'],
    segmentTopic: 'THE STREAK',
    takes: [
      'That 0 in the loss column is a target. Everybody wants to be the one who hands it to him.',
      'The longer it goes, the more the mystique — and the more the pressure.',
      'One slip and the whole narrative flips. That’s the price of the streak.',
    ],
    weight: 3,
  },
  veteran_respect: {
    id: 'veteran_respect', label: 'THE VET', category: 'career',
    tags: ['veteran', 'legacy', 'og', 'career'], slots: ['subject'],
    headlines: ['{subject}: DO WE GIVE HIM HIS FLOWERS?', 'THE {subject} LEGACY CONVERSATION'],
    segmentTopic: 'THE LEGACY',
    takes: [
      'Whatever he’s got left, {subject} put in work that a lot of these new names are living off.',
      'Respect the pedigree — the pioneers don’t always get the credit while they’re still active.',
      'The legacy is set. Everything now is just adding to it.',
    ],
    weight: 2,
  },

  // ── CULTURE ──
  era_shift: {
    id: 'era_shift', label: 'THE ERA', category: 'culture',
    tags: ['era', 'culture'], slots: [],
    headlines: ['THE CULTURE IS SHIFTING — WHERE ARE WE HEADED?', 'IS THIS A NEW ERA OF BATTLE RAP?'],
    segmentTopic: 'THE ERA',
    takes: [
      'The way people find battles, the way they judge them — it’s all moving. You can feel it.',
      'Every era has its style. The question is whose style defines this one.',
      'What travels now isn’t what traveled five years ago. Adapt or get left.',
    ],
    weight: 2,
  },
};

/** All distinct tags across the taxonomy (for hub filters). */
export const ALL_TOPIC_TAGS: string[] = Array.from(
  new Set(Object.values(PODCAST_TOPICS).flatMap((t) => t.tags))
).sort();

/** Fill {slot} placeholders in a template string. */
export function fillSlots(template: string, subjects: Partial<Record<SlotName, string>>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => subjects[k as SlotName] ?? `{${k}}`);
}
