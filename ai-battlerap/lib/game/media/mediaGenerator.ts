/**
 * Media composer — builds TAGGED podcast + video items out of the modular topic
 * blocks in podcastTopics.ts.
 *
 * Owner steer (2026-09-01): don't build podcast CREATION yet — lock down the
 * modular, tagged content. Every item is tagged with WHO it's about (subject
 * battlers → drill-down + a "podcasts about you" view) and WHAT it's about (topic
 * tags → a central hub you can filter). Compose from topic blocks, never hardcode
 * a monolithic episode.
 *
 * PURE (no DB, no audio, no LLM, deterministic per battle). Verbiage only — the
 * real audio/script step consumes these later. No invented bars, ever.
 */

import { PODCAST_TOPICS, fillSlots, type PodcastTopic, type SlotName } from './podcastTopics';

export type MediaKind = 'podcast_episode' | 'video_card';
export type MainStory = 'upset' | 'dominant' | 'choke' | 'classic' | 'robbery' | 'standard';

/** WHO an item is about — battlerId powers "about you" filtering + profile drill-down. */
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
  /** TAGGED who + what. */
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

export interface BattleMediaContext {
  battleId: string;
  winnerId?: string | null;
  loserId?: string | null;
  winner: string;
  loser: string;
  score: string;
  mainStory: MainStory;
  city?: string | null;
  venue?: string | null;
  bigMoment?: boolean;
  /** Reputation label DISPLAYS for flavor, e.g. ["THE PAPERWORK","WASHED"]. */
  winnerLabels?: string[];
  loserLabels?: string[];
}

// ── fictional, culture-flavored outlets (never real people) ─────────────────

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
  standard: 'ranking_debate',
};

/** A reputation label on an involved battler adds a modular topic segment. */
const LABEL_TO_TOPIC: Record<string, string> = {
  'THE PAPERWORK': 'rep_snitch',
  'GHOSTWRITTEN': 'rep_ghostwriter',
  'WASHED': 'rep_washed',
  'DUCKING SMOKE': 'rep_ducking',
  'WENT MAINSTREAM': 'rep_mainstream',
  'VILLAIN': 'rep_villain',
};

// ── deterministic pick (no Math.random → stable per battle) ─────────────────

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0;
  return h;
}
function pick<T>(arr: T[], seed: string): T {
  return arr[hash(seed) % arr.length];
}

// ── composition ─────────────────────────────────────────────────────────────

/**
 * Compose a tagged episode from topic blocks. Reusable for battle recaps AND
 * future roundup / interview episodes — just hand it topics + subjects.
 */
export function composeEpisode(input: {
  seed: string;
  topicIds: string[];
  subjects: MediaSubject[];
  slots: Partial<Record<SlotName, string>>;
  where?: string;
}): PodcastEpisode {
  const topics = input.topicIds.map((id) => PODCAST_TOPICS[id]).filter(Boolean) as PodcastTopic[];
  const lead = topics.slice().sort((a, b) => b.weight - a.weight)[0];
  const pod = pick(PODCASTS, input.seed);
  const minutes = 32 + (hash(input.seed) % 28); // 32–59

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

/** The media a completed battle throws off: one podcast (composed) + one video. */
export function mediaFromBattle(ctx: BattleMediaContext): MediaItem[] {
  const slots: Partial<Record<SlotName, string>> = {
    winner: ctx.winner,
    loser: ctx.loser,
    score: ctx.score,
    city: ctx.city ?? undefined,
  };

  const subjects: MediaSubject[] = [
    { battlerId: ctx.winnerId ?? null, name: ctx.winner, role: 'winner' },
    { battlerId: ctx.loserId ?? null, name: ctx.loser, role: 'loser' },
  ];

  const battleTopic = STORY_TO_TOPIC[ctx.mainStory] ?? 'ranking_debate';
  const topicIds = [battleTopic];

  // Modular reputation angle: if an involved battler carries a mapped label, add
  // that topic block and point its {subject}/{rival} slots at the right people.
  const repHit = findRepTopic(ctx);
  if (repHit) {
    topicIds.push(repHit.topicId);
    slots.subject = repHit.subjectName;
    slots.rival = repHit.rivalName;
  }

  const where = ctx.venue ? ` — "${ctx.winner} vs ${ctx.loser}" ${ctx.venue}` : ctx.city ? ` in ${ctx.city}` : '';
  const podcast = composeEpisode({
    seed: ctx.battleId,
    topicIds,
    subjects,
    slots,
    where,
  });

  // Video: lead battle topic only, tighter.
  const vt = PODCAST_TOPICS[battleTopic];
  const vidSeconds = 300 + (hash(ctx.battleId + 'v') % 600);
  const views = 1 + (hash(ctx.battleId + 'views') % 80);
  const channel = pick(CHANNELS, ctx.battleId + 'c');
  const video: VideoCard = {
    kind: 'video_card',
    id: `vid-${ctx.battleId}`,
    channel,
    title: fillSlots(pick(vt.headlines, ctx.battleId + 'vh'), slots),
    durationLabel: mmss(vidSeconds),
    viewsLabel: `${views}K views`,
    subjects,
    topicTags: vt.tags,
    topicIds: [vt.id],
    thumbnailConcept: ctx.bigMoment ? 'the highlight moment, crowd reacting' : `${ctx.winner} mid-round`,
    blurb: fillSlots(pick(vt.takes, ctx.battleId + 'vb'), slots),
  };

  return [podcast, video];
}

function findRepTopic(ctx: BattleMediaContext): { topicId: string; subjectName: string; rivalName: string } | null {
  const check = (labels: string[] | undefined, name: string, other: string) => {
    for (const l of labels ?? []) {
      const topicId = LABEL_TO_TOPIC[l];
      if (topicId) return { topicId, subjectName: name, rivalName: other };
    }
    return null;
  };
  // Loser's scars lead the angle (more likely the story), then winner's.
  return check(ctx.loserLabels, ctx.loser, ctx.winner) ?? check(ctx.winnerLabels, ctx.winner, ctx.loser);
}

// ── helpers ─────────────────────────────────────────────────────────────────

function stamp(i: number, minutes: number, count: number): string {
  const m = Math.round((minutes / Math.max(1, count)) * i);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
function mmss(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
