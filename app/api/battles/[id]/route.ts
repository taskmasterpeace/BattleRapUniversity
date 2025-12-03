import { NextResponse } from "next/server"
import { mockBattler } from "@/lib/data"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const mockBattleData = {
    battle: {
      id,
      scheduled_at: "2025-12-15T20:00:00Z", // 8 PM = night
      status: "completed",
      league: {
        name: "SMALL ROOM CIRCUIT",
        short_code: "SRC",
        city_id: "new-york",
        logo_url: "/battle-rap-league-logo.jpg",
      },
      player_battler: {
        id: mockBattler.id,
        stage_name: mockBattler.stageName,
        tier: mockBattler.tier,
        avatar_url: "/rapper-pixel.jpg",
        sprite_set: "default",
      },
      ai_battler: {
        id: "opp-1",
        stage_name: "YOUNG PATTERN",
        tier: "MID TIER",
        avatar_url: "/rapper-portrait-pixel-art.jpg",
        sprite_set: "default",
      },
      winner_battler_id: mockBattler.id,
      is_grudge_match: true,
      grudge_intensity: 82,
    },
    rounds: [
      // Round 1 - Player
      {
        round_index: 1,
        battler_id: mockBattler.id,
        average_score: 7.6,
        peak_score: 8.5,
        consistency_score: 7.2,
        crowd_reaction: 75,
        choked: false,
        momentum_delta: 0.5,
      },
      // Round 1 - AI
      {
        round_index: 1,
        battler_id: "opp-1",
        average_score: 6.8,
        peak_score: 7.8,
        consistency_score: 6.5,
        crowd_reaction: 45,
        choked: true,
        momentum_delta: -0.3,
      },
      // Round 2 - Player
      {
        round_index: 2,
        battler_id: mockBattler.id,
        average_score: 7.4,
        peak_score: 7.5,
        consistency_score: 7.3,
        crowd_reaction: 60,
        choked: false,
        momentum_delta: -0.1,
      },
      // Round 2 - AI
      {
        round_index: 2,
        battler_id: "opp-1",
        average_score: 8.1,
        peak_score: 9.0,
        consistency_score: 7.8,
        crowd_reaction: 85,
        choked: false,
        momentum_delta: 0.6,
      },
      // Round 3 - Player
      {
        round_index: 3,
        battler_id: mockBattler.id,
        average_score: 8.6,
        peak_score: 9.2,
        consistency_score: 8.4,
        crowd_reaction: 92,
        choked: false,
        momentum_delta: 0.8,
      },
      // Round 3 - AI
      {
        round_index: 3,
        battler_id: "opp-1",
        average_score: 7.2,
        peak_score: 7.5,
        consistency_score: 7.0,
        crowd_reaction: 50,
        choked: false,
        momentum_delta: -0.2,
      },
    ],
    segments: [
      // Round 1 segments
      { round_index: 1, segment_index: 1, battler_id: mockBattler.id, segment_score: 7.2, event_flags: [] },
      { round_index: 1, segment_index: 2, battler_id: "opp-1", segment_score: 7.5, event_flags: [] },
      { round_index: 1, segment_index: 3, battler_id: mockBattler.id, segment_score: 8.5, event_flags: ["haymaker"] },
      { round_index: 1, segment_index: 4, battler_id: "opp-1", segment_score: 7.8, event_flags: [] },
      { round_index: 1, segment_index: 5, battler_id: mockBattler.id, segment_score: 7.0, event_flags: [] },
      { round_index: 1, segment_index: 6, battler_id: "opp-1", segment_score: 5.2, event_flags: ["choke"] },
      // Round 2 segments
      { round_index: 2, segment_index: 1, battler_id: "opp-1", segment_score: 7.8, event_flags: [] },
      { round_index: 2, segment_index: 2, battler_id: mockBattler.id, segment_score: 7.2, event_flags: [] },
      { round_index: 2, segment_index: 3, battler_id: "opp-1", segment_score: 9.0, event_flags: ["haymaker"] },
      { round_index: 2, segment_index: 4, battler_id: mockBattler.id, segment_score: 7.5, event_flags: [] },
      { round_index: 2, segment_index: 5, battler_id: "opp-1", segment_score: 7.6, event_flags: [] },
      { round_index: 2, segment_index: 6, battler_id: mockBattler.id, segment_score: 7.4, event_flags: [] },
      // Round 3 segments
      { round_index: 3, segment_index: 1, battler_id: mockBattler.id, segment_score: 7.8, event_flags: [] },
      { round_index: 3, segment_index: 2, battler_id: "opp-1", segment_score: 7.2, event_flags: [] },
      { round_index: 3, segment_index: 3, battler_id: mockBattler.id, segment_score: 9.2, event_flags: ["haymaker"] },
      { round_index: 3, segment_index: 4, battler_id: "opp-1", segment_score: 7.5, event_flags: [] },
      { round_index: 3, segment_index: 5, battler_id: mockBattler.id, segment_score: 8.8, event_flags: ["haymaker"] },
      { round_index: 3, segment_index: 6, battler_id: "opp-1", segment_score: 7.0, event_flags: [] },
    ],
    // Additional data for results page
    earnings: {
      basePay: 500,
      winBonus: 1200,
      performanceBonus: 200,
      rivalryBonus: 400,
      total: 2300,
    },
    rating_change: 25,
  }

  return NextResponse.json(mockBattleData)
}
