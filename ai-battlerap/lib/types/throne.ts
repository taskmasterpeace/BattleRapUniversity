/**
 * Throne System Types
 *
 * Types for the league throne system where top 3 battlers
 * per league hold throne positions with special perks.
 */

export interface ThronePosition {
  id: string;
  league_id: string;
  position: 1 | 2 | 3;
  battler_id: string | null;
  started_at: string;
  defense_count: number;
  // Enriched fields (joined from battlers table)
  battlerName?: string;
  battlerRating?: number;
}

export interface ThroneChallenge {
  id: string;
  league_id: string;
  challenger_battler_id: string;
  throne_holder_battler_id: string;
  target_position: 1 | 2 | 3;
  status: 'pending' | 'accepted' | 'forfeited' | 'completed';
  deadline: string;
  battle_id: string | null;
  result: 'challenger_won' | 'defender_won' | 'forfeited' | null;
  created_at: string;
  // Enriched fields
  challengerName?: string;
  holderName?: string;
  leagueName?: string;
}

export interface ThroneHistory {
  id: string;
  league_id: string;
  position: 1 | 2 | 3;
  battler_id: string;
  started_at: string;
  ended_at: string | null;
  defense_count: number;
  lost_to_battler_id: string | null;
  lost_battle_id: string | null;
  created_at: string;
}
