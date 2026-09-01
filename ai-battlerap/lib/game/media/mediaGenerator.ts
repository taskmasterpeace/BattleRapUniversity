/**
 * Media composer — builds TAGGED, CONTEXT-RICH podcast + video items from the
 * modular topic blocks in podcastTopics.ts.
 *
 * Intelligence (owner steer): it doesn't just get two names. It reads the battler
 * dossiers + head-to-head and builds an episode that reflects the ACTUAL story —
 * a revenge get-back, a scene clash, a hot run, a scar that colors the room — then
 * orders it lead → context → close. Verbiage draws on origin, record, arc, series.
 *
 * PURE + deterministic per battle. No DB, no audio, no invented bars.
 */

import { PODCAST_TOPICS, LABEL_TO_TOPIC, fillSlots, type PodcastTopic } from './podcastTopics';
import type { BattleMediaContext, MediaBattler, MainStory, SlotName } from './types';

export type { BattleMediaContext, MediaBattler, HeadToHead, MainStory } from './types';
export { ALL_TOPIC_TAGS } from './podcastTopics';

export type MediaKind = 'podcast_episode' | 'video_card';

/** WHO an item is about — battlerId powers "about you" + profile drill-down. */
export interface MediaSubject {
  battlerId?: string | null;
  name: string;
  role: 'winner' | 'loser' | 'subject' | 'rival';
}

export interface PodcastSegment {
  topicId: string;
  time: string;
  topic: string;
  take: string;
}

export interface PodcastEpisode {
  kind: 'podcast_episode';
  id: string;
  show: string;
  host: string;
  title: string;
  durationLabel: string;
  subjects: MediaSubject[];
  topicTags: string[];
  topicIds: string[];
  segments: PodcastSegment[];
  thumbnailConcept: string;
}

export interface VideoCard {
  kind: 'video_card';
  id: string;
  channel: string;
  title: string;
  durationLabel: string;
  viewsLabel: string;
  subjects: MediaSubject[];
  topicTags: string[];
  topicIds: string[];
  thumbnailConcept: string;
  blurb: string;
}

export type MediaItem = PodcastEpisode | VideoCard;

const PODCASTS = [
  { show: 'THE BAR EXAM', host: '@barexampod' },
  { show: 'PULL UP LATE', host: '@pulluplate' },
  { show: 'CHAMPION SOUND', host: '@champsoundshow' },
  { show: 'THE ROUND TABLE', host: '@roundtablebars' },
  { show: 'NO HOOK RADIO', host: '@nohookradio' },
];
const CHANNELS = ['ROOM FOOTAGE', 'THE ANGLE', 'BODYBAG TV', 'FRONT ROW', 'THE RECAP'];

const STORY_TO_TOPIC: Record<MainStory, string> = {
  upset: 'battle_upset',
  dominant: 'battle_body',
  choke: 'battle_choke',
  classic: 'battle_classic',
  robbery: 'battle_robbery',
  standard: 'battle_recap',
};

// ── deterministic pick ──────────────────────────────────────────────────────

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0;
  return h;
}
function pick<T>(arr: T[], seed: string): T {
  return arr[hash(seed) % arr.length];
}

// ── dossier → slot strings ──────────────────────────────────────────────────

const SCENE_WORD: Record<string, string> = {
  technical: 'technical', aggressive: 'aggressive', street: 'street', diverse: 'versatile',
};

function sceneWord(s?: string | null): string {
  return (s && SCENE_WORD[s]) || 'all-around';
}
function homeStr(bt: MediaBattler): string {
  return bt.hometownCity || 'parts unknown';
}
function recordStr(bt: MediaBattler): string {
  return bt.wins != null && bt.losses != null ? `${bt.wins}-${bt.losses}` : 'on the come-up';
}
function arcPhrase(bt: MediaBattler): string {
  const s = bt.streak ?? 0;
  if (s >= 3) return `riding a ${s}-fight run`;
  if (s <= -3) return `trying to stop a ${Math.abs(s)}-fight slide`;
  if (s > 0) return 'building momentum';
  if (s < 0) return 'looking to bounce back';
  return 'right in the mix';
}
function h2hPhrase(ctx: BattleMediaContext): string {
  const h = ctx.headToHead;
  if (!h || h.total <= 1) return 'this was their first real meeting';
  if (h.winnerWins === h.loserWins) return `they’re dead even now at ${h.winnerWins}-${h.loserWins}`;
  const leader = h.winnerWins > h.loserWins ? ctx.winner.name : ctx.loser.name;
  const hi = Math.max(h.winnerWins, h.loserWins);
  const lo = Math.min(h.winnerWins, h.loserWins);
  return `${leader} leads the series ${hi}-${lo}`;
}
function lastMeetingPhrase(ctx: BattleMediaContext): string {
  const h = ctx.headToHead;
  if (!h || !h.lastWinnerName) return 'and this was the first chapter';
  const where = h.lastCity ? ` in ${h.lastCity}` : '';
  return `${h.lastWinnerName} took the last one${where}`;
}

function deriveSlots(ctx: BattleMediaContext, subject: MediaBattler, rival: MediaBattler): Partial<Record<SlotName, string>> {
  return {
    winner: ctx.winner.name,
    loser: ctx.loser.name,
    subject: subject.name,
    rival: rival.name,
    winnerHome: homeStr(ctx.winner),
    loserHome: homeStr(ctx.loser),
    subjectHome: homeStr(subject),
    rivalHome: homeStr(rival),
    winnerScene: sceneWord(ctx.winner.scene),
    loserScene: sceneWord(ctx.loser.scene),
    subjectScene: sceneWord(subject.scene),
    winnerRecord: recordStr(ctx.winner),
    loserRecord: recordStr(ctx.loser),
    subjectRecord: recordStr(subject),
    winnerArc: arcPhrase(ctx.winner),
    loserArc: arcPhrase(ctx.loser),
    h2h: h2hPhrase(ctx),
    lastMeeting: lastMeetingPhrase(ctx),
    city: ctx.city ?? '',
    venue: ctx.venue ?? '',
    score: ctx.score,
  };
}

// ── intelligent block selection ─────────────────────────────────────────────

/** Which battler's scar drives the episode's rep angle (priority order). */
function pickPrimaryRep(ctx: BattleMediaContext): { topicId: string; subject: MediaBattler } | null {
  for (const [label, topicId] of LABEL_TO_TOPIC) {
    if ((ctx.loser.labels ?? []).includes(label)) return { topicId, subject: ctx.loser };
    if ((ctx.winner.labels ?? []).includes(label)) return { topicId, subject: ctx.winner };
  }
  return null;
}

/** Pick the ordered topic-block ids that tell this battle's story. */
function selectTopicIds(ctx: BattleMediaContext, primaryRepId: string | null): string[] {
  const lead = STORY_TO_TOPIC[ctx.mainStory] ?? 'battle_recap';
  const context: string[] = [];

  // Condition-selected context blocks, strongest story first.
  const eligible = Object.values(PODCAST_TOPICS)
    .filter((t) => t.role === 'context' && t.condition && t.condition(ctx))
    .sort((a, b) => b.weight - a.weight)
    .map((t) => t.id);

  // Revenge is the sharper telling of history — don't run both.
  const hasGetback = eligible.includes('the_getback');
  for (const id of eligible) {
    if (hasGetback && id === 'the_history') continue;
    context.push(id);
  }
  if (primaryRepId) context.unshift(primaryRepId); // the scar leads the context

  // lead + up to 3 context + close
  return [lead, ...context.slice(0, 3), 'whats_next'];
}

// ── composition ─────────────────────────────────────────────────────────────

export function composeEpisode(input: {
  seed: string;
  topicIds: string[];
  subjects: MediaSubject[];
  slots: Partial<Record<SlotName, string>>;
  where?: string;
}): PodcastEpisode {
  const topics = input.topicIds.map((id) => PODCAST_TOPICS[id]).filter(Boolean) as PodcastTopic[];
  const lead = topics.find((t) => t.role === 'lead') ?? topics.slice().sort((a, b) => b.weight - a.weight)[0];
  const pod = pick(PODCASTS, input.seed);
  const minutes = 32 + (hash(input.seed) % 28);

  const segments: PodcastSegment[] = topics.map((t, i) => ({
    topicId: t.id,
    time: stamp(i, minutes, topics.length),
    topic: t.segmentTopic,
    take: fillSlots(pick(t.takes, input.seed + t.id), input.slots),
  }));

  return {
    kind: 'podcast_episode',
    id: `pod-${input.seed}`,
    show: pod.show,
    host: pod.host,
    title: fillSlots(pick(lead.headlines, input.seed + 'h'), input.slots),
    durationLabel: `${minutes} MIN`,
    subjects: input.subjects,
    topicTags: Array.from(new Set(topics.flatMap((t) => t.tags))),
    topicIds: topics.map((t) => t.id),
    segments,
    thumbnailConcept: `${pod.show} set, two mics${input.where ?? ''}`,
  };
}

/** The media a completed battle throws off: one composed podcast + one video. */
export function mediaFromBattle(ctx: BattleMediaContext): MediaItem[] {
  const rep = pickPrimaryRep(ctx);
  const subjectBattler = rep ? rep.subject : ctx.winner;
  const rivalBattler = subjectBattler === ctx.winner ? ctx.loser : ctx.winner;

  const slots = deriveSlots(ctx, subjectBattler, rivalBattler);
  const topicIds = selectTopicIds(ctx, rep?.topicId ?? null);

  const subjects: MediaSubject[] = [
    { battlerId: ctx.winner.battlerId ?? null, name: ctx.winner.name, role: 'winner' },
    { battlerId: ctx.loser.battlerId ?? null, name: ctx.loser.name, role: 'loser' },
  ];

  const where = ctx.venue ? ` — "${ctx.winner.name} vs ${ctx.loser.name}" ${ctx.venue}` : ctx.city ? ` in ${ctx.city}` : '';
  const podcast = composeEpisode({ seed: ctx.battleId, topicIds, subjects, slots, where });

  const leadTopic = PODCAST_TOPICS[STORY_TO_TOPIC[ctx.mainStory] ?? 'battle_recap'];
  const vidSeconds = 300 + (hash(ctx.battleId + 'v') % 600);
  const views = 1 + (hash(ctx.battleId + 'views') % 80);
  const video: VideoCard = {
    kind: 'video_card',
    id: `vid-${ctx.battleId}`,
    channel: pick(CHANNELS, ctx.battleId + 'c'),
    title: fillSlots(pick(leadTopic.headlines, ctx.battleId + 'vh'), slots),
    durationLabel: mmss(vidSeconds),
    viewsLabel: `${views}K views`,
    subjects,
    topicTags: leadTopic.tags,
    topicIds: [leadTopic.id],
    thumbnailConcept: ctx.bigMoment ? 'the highlight moment, crowd reacting' : `${ctx.winner.name} mid-round`,
    blurb: fillSlots(pick(leadTopic.takes, ctx.battleId + 'vb'), slots),
  };

  return [podcast, video];
}

// ── helpers ─────────────────────────────────────────────────────────────────

function stamp(i: number, minutes: number, count: number): string {
  const m = Math.round((minutes / Math.max(1, count)) * i);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
function mmss(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
