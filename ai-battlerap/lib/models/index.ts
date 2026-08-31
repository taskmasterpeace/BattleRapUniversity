// TypeScript interfaces mirroring database schema

export interface Profile {
  id: string;
  display_name: string;
  created_at: string;
}

export interface League {
  id: string;
  name: string;
  short_code: string;
  round_length_minutes: number;
  base_crowd_factor: number;
  writing_weight: number;
  performance_weight: number;
  booking_pace_days: number;
  description?: string;
  created_at: string;
}

export type BattlerTier = 'low' | 'mid' | 'top' | 'god';

export interface Battler {
  id: string;
  user_id: string | null;
  stage_name: string;
  region?: string;
  primary_league_id: string;
  style_tags: string[];
  tier: BattlerTier;
  is_ai: boolean;
  avatar_url?: string | null;
  banner_url?: string | null;
  /** male | female — set by worldgen/editor, matches the sprite */
  gender?: string | null;
  /** appearance lock + coding + persona facets (see roster editor) */
  identity?: Record<string, any> | null;
  current_balance?: number | null;
  total_career_earnings?: number | null;
  level?: number | null;
  total_xp?: number | null;
  sprite_set?: string[] | null;
  /** Daily battle slots (see lib/game/battleSlots.ts) */
  bonus_battle_slots?: number | null;
  slots_reset_at?: string | null;
  slots_used_today?: number | null;
  /** UniverCity: location identity (travel + recruiting) */
  current_city_id?: string | null;
  hometown_city_id?: string | null;
  /** Verified real battlers */
  is_real?: boolean | null;
  verified_user_id?: string | null;
  bio?: string | null;
  likeness_status?: 'licensed' | 'pending' | 'unofficial' | null;
  created_at: string;
}

export interface WritingStats {
  lyricism: number;
  wordplay: number;
  creativity: number;
}

export interface PerformanceStats {
  stage_presence: number;
  crowd_control: number;
  delivery: number;
}

export interface PersonalStats {
  financial_stability: number;
  reputation: number;
  family_bond: number;
  preparation: number;
}

export interface BattlerAttributes {
  battler_id: string;
  writing: WritingStats;
  performance: PerformanceStats;
  personal: PersonalStats;
  resilience: number;
  public_knowledge: number;
  xp: Record<string, number>;
  stress: number;
  balance: number;
  lifetime_earnings: number;
  updated_at: string;
}

export interface Ranking {
  battler_id: string;
  rating: number;
  wins: number;
  losses: number;
  streak: number;
}

export type BattleStatus =
  | 'offered'
  | 'accepted'
  | 'declined'
  | 'locked'
  | 'awaiting_lock_in_choice' // After prep lock, waiting for locked-in vs auto choice
  | 'awaiting_r1_content' // Waiting for round 1 content selection
  | 'r1_simulated' // Round 1 completed
  | 'awaiting_r2_content' // Waiting for round 2 content selection
  | 'r2_simulated' // Round 2 completed
  | 'awaiting_r3_content' // Waiting for round 3 content selection
  | 'r3_simulated' // Round 3 completed
  | 'simulated'
  | 'completed'
  | 'forfeit';

export type ScoringContext = 'in_building' | 'ppv' | 'on_cam';

export interface Battle {
  id: string;
  league_id: string;
  battler_player_id: string;
  battler_ai_id: string;
  scheduled_at: string;
  lock_prep_at: string;
  status: BattleStatus;
  winner_battler_id?: string;
  no_show_player: boolean;
  player_locked_in: boolean; // Player chose "Locked In" mode vs auto-simulation
  current_round_index?: number; // Current round being prepared/simulated (1-3)
  context: ScoringContext; // Scoring context: in_building, ppv, or on_cam
  created_at: string;
}

export type PrepFocus = 'research' | 'writing' | 'performance' | 'life' | 'rest';

export interface PrepBlock {
  id: string;
  battle_id: string;
  battler_id: string;
  day_index: number;
  focus: PrepFocus;
  auto_generated: boolean;
  created_at: string;
}

export interface BattleRound {
  id: string;
  battle_id: string;
  round_index: number;
  battler_id: string;
  average_score: number;
  peak_score: number;
  consistency_score: number;
  momentum_delta: number;
  crowd_reaction: number;
  choked: boolean;
  summary_text?: string;

  // Content system fields
  content_types?: string[];
  delivery_types?: string[];
  performance_types?: string[];
  effectiveness_multiplier?: number;
  crowd_preference_multiplier?: number;
  context_modifier?: number;
  final_multiplier?: number; // Combined effectiveness × crowd × context

  created_at: string;
}

export interface BattleSegment {
  id: string;
  battle_id: string;
  round_index: number;
  segment_index: number;
  battler_id: string;
  segment_score: number;
  event_flags: string[];
  created_at: string;
}

export interface RoundContentSelection {
  id: string;
  battle_id: string;
  battler_id: string;
  round_index: number; // 1-3
  content_types: string[]; // 3-4 selections
  delivery_types: string[]; // 1-2 selections
  performance_types: string[]; // 1-2 selections
  auto_selected: boolean; // AI auto-selected vs manual
  effectiveness_multiplier?: number;
  crowd_preference_multiplier?: number;
  context_modifier?: number;
  created_at: string;
  updated_at: string;
}

export type LifeEventTrigger = 'time' | 'attribute' | 'random' | 'battle_result';

export interface LifeEvent {
  id: string;
  battler_id: string;
  event_type: string;
  trigger_source: LifeEventTrigger;
  choice_made?: string;
  attribute_changes?: Record<string, number>;
  public: boolean;
  created_at: string;
}

export type NewsArticleType = 'battle_recap' | 'scandal' | 'career_update';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  type: NewsArticleType;
  primary_battler_id?: string;
  secondary_battler_id?: string;
  battle_id?: string;
  league_id?: string;
  body_markdown: string;
  meta_json: Record<string, any>;
  published_at: string;
}

// Computed types for application logic

export interface PrepProfile {
  researchDays: number;
  writingDays: number;
  performanceDays: number;
  lifeDays: number;
  restDays: number;
  /** Opponent persona facets uncovered by research — each one is an ANGLE. */
  angleFacets?: string[];
}

export interface ModifiedAttributes {
  writing: WritingStats;
  performance: PerformanceStats;
  personal: PersonalStats;
  resilience: number;
  /** Carried into the sim so stress/fame pressure actually fire (they read 0 when absent) */
  stress: number;
  public_knowledge: number;
}

export interface BattlerWithDetails extends Battler {
  attributes?: BattlerAttributes;
  ranking?: Ranking;
  league?: League;
}

export interface BattleWithDetails extends Battle {
  league?: League;
  /** The ROOM this battle was booked into (venues table) — a place, never a league brand. */
  venue?: {
    name: string;
    prestige_level?: number;
    venue_type?: { slug: string; tier: string; sprite_key?: string | null } | null;
  } | null;
  /** Special events go out on national TV (biggest room in the city). */
  tv_broadcast?: boolean;
  player_battler?: BattlerWithDetails;
  ai_battler?: BattlerWithDetails;
  rounds?: BattleRound[];
  segments?: BattleSegment[];
  prep_blocks?: PrepBlock[];
}
