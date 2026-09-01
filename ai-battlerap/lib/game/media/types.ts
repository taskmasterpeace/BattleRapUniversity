/**
 * Media context types — the RICH battler dossier the media system reasons over.
 *
 * Owner steer (2026-09-01): "the block gotta be richer than one winner + one
 * loser. We gotta know the battler — the history, where they're from, if they
 * won or lost against somebody in the past. Intelligently organized."
 *
 * So the composer doesn't just get two names — it gets a dossier per battler
 * (origin, record, arc, labels, notable wins) plus the head-to-head history, and
 * builds an episode that reflects the ACTUAL story (rematch, revenge, origin
 * clash, ranking stakes), not just "A beat B".
 */

export type MainStory = 'upset' | 'dominant' | 'choke' | 'classic' | 'robbery' | 'standard';

/** Every subject slot the verbiage can reference. */
export type SlotName =
  | 'winner' | 'loser' | 'subject' | 'rival'
  | 'winnerHome' | 'loserHome' | 'subjectHome' | 'rivalHome'
  | 'winnerScene' | 'loserScene' | 'subjectScene'
  | 'winnerRecord' | 'loserRecord' | 'subjectRecord'
  | 'winnerArc' | 'loserArc'
  | 'h2h' | 'lastMeeting'
  | 'city' | 'venue' | 'score';

/** A battler as the media knows them. */
export interface MediaBattler {
  battlerId?: string | null;
  name: string;
  role?: 'winner' | 'loser' | 'subject' | 'rival';
  /** Where they're from. */
  hometownCity?: string | null;
  /** Scene flavor: technical | aggressive | street | diverse. */
  scene?: string | null;
  wins?: number;
  losses?: number;
  tier?: string | null;
  /** Win/loss streak (+ hot, − cold). */
  streak?: number;
  /** Reputation label displays, e.g. ["THE PAPERWORK","WASHED"]. */
  labels?: string[];
  /** A name they beat that carries weight (for résumé flavor). */
  notableWinName?: string | null;
}

/** Lifetime series between the two, from the WINNER's point of view. */
export interface HeadToHead {
  /** Winner's wins in the series (this battle included). */
  winnerWins: number;
  /** Loser's wins in the series. */
  loserWins: number;
  total: number;
  isRematch: boolean;
  /** The winner had LOST the previous meeting — tonight was get-back. */
  isRevenge: boolean;
  lastWinnerName?: string | null;
  lastCity?: string | null;
}

export interface BattleMediaContext {
  battleId: string;
  winner: MediaBattler;
  loser: MediaBattler;
  score: string;
  mainStory: MainStory;
  city?: string | null;
  venue?: string | null;
  bigMoment?: boolean;
  headToHead?: HeadToHead | null;
}
