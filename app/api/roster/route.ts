import { NextResponse } from "next/server"
import { mockBattler, mockBattleInfo } from "@/lib/data"

const mockRosterData = {
  battlers: [
    {
      id: mockBattler.id,
      stageName: mockBattler.stageName,
      tier: mockBattler.tier,
      styleTags: mockBattler.styleTags || ["Wordplay", "Schemes"],
      avatarUrl: "/rapper-pixel.jpg",
      bannerUrl: "/small-intimate-battle-rap-venue-purple-lighting.jpg",
      league: {
        name: "Small Room Circuit",
        logo_url: "/placeholder-logo.png",
      },
      attributes: mockBattler.stats,
      ranking: {
        rating: mockBattler.elo,
        wins: mockBattler.record?.wins || 11,
        losses: mockBattler.record?.losses || 4,
        streak: mockBattler.streak || 3,
      },
      stats: {
        totalBattles: 15,
        wins: 11,
        losses: 4,
        winRate: 73,
        streak: 3,
        rating: mockBattler.elo,
      },
      nextBattle: {
        opponent: mockBattleInfo.opponent.name,
        date: mockBattleInfo.battleDate,
        league: mockBattleInfo.league,
      },
      badges: [
        { id: "b1", name: "Master Wordsmith", icon_url: "/placeholder-logo.png", tier: "gold" },
        { id: "b2", name: "Punchline King", icon_url: "/placeholder-logo.png", tier: "gold" },
        { id: "b3", name: "Rising Star", icon_url: "/placeholder-logo.png", tier: "bronze" },
      ],
      isActive: true,
    },
    {
      id: "battler-002",
      stageName: "COLD BARS",
      tier: "LOW TIER",
      styleTags: ["Aggression", "Flow"],
      avatarUrl: "/rapper-portrait-pixel-art.jpg",
      bannerUrl: "/large-arena-battle-rap-stage-bright-lights-crowd.jpg",
      league: {
        name: "Small Room Circuit",
        logo_url: "/placeholder-logo.png",
      },
      attributes: {
        writing: { lyricism: 5, wordplay: 4, creativity: 5, flow: 6 },
        performance: { stagePresence: 6, crowdControl: 5, delivery: 7 },
        personal: { financial: 3, reputation: 4, family: 5, resilience: 5 },
      },
      ranking: {
        rating: 980,
        wins: 3,
        losses: 5,
        streak: -2,
      },
      stats: {
        totalBattles: 8,
        wins: 3,
        losses: 5,
        winRate: 38,
        streak: -2,
        rating: 980,
      },
      nextBattle: null,
      badges: [{ id: "b4", name: "Crowd Favorite", icon_url: "/placeholder-logo.png", tier: "bronze" }],
      isActive: false,
    },
  ],
}

export async function GET() {
  return NextResponse.json(mockRosterData)
}
