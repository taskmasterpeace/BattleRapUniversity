import { NextResponse } from "next/server"

const mockTournamentsData = {
  all: [
    {
      id: "t-001",
      name: "CHAMPION'S CIRCLE GRAND PRIX",
      description: "The most prestigious tournament in battle rap",
      league: {
        name: "Champion's Circle",
        short_code: "CC",
        logo_url: "/placeholder-logo.png",
      },
      max_participants: 16,
      total_prize_pool: 50000,
      entry_fee: 2000,
      status: "open",
      dates: "DEC 15 - JAN 10",
      format: "Single Elimination",
      rules: "2-Min Rounds, 3 Rounds",
      participantCount: 12,
      isUserRegistered: false,
      userSeed: null,
      recentWinners: [
        { name: "VERBAL ASSASSIN", avatar: "/rapper-portrait-pixel-art.jpg" },
        { name: "LYRIC MASTER", avatar: "/rapper-pixel.jpg" },
      ],
    },
    {
      id: "t-002",
      name: "SMALL ROOM CIRCUIT SHOWDOWN",
      description: "Proving grounds for rising talent",
      league: {
        name: "Small Room Circuit",
        short_code: "SRC",
        logo_url: "/placeholder-logo.png",
      },
      max_participants: 8,
      total_prize_pool: 5000,
      entry_fee: 500,
      status: "upcoming",
      dates: "Starts DEC 15",
      format: "Single Elimination",
      rules: "2-Min Rounds, 3 Rounds",
      participantCount: 6,
      isUserRegistered: true,
      userSeed: 3,
      recentWinners: [],
    },
    {
      id: "t-003",
      name: "EAST COAST INVITATIONAL",
      description: "Regional championship for East Coast battlers",
      league: {
        name: "East Coast League",
        short_code: "ECL",
        logo_url: "/placeholder-logo.png",
      },
      max_participants: 32,
      total_prize_pool: 25000,
      entry_fee: 1000,
      status: "in_progress",
      dates: "DEC 1 - DEC 20",
      format: "Double Elimination",
      rules: "3-Min Rounds, 3 Rounds",
      participantCount: 32,
      isUserRegistered: true,
      userSeed: 7,
      currentRound: "Quarterfinals",
      recentWinners: [{ name: "STREET POET", avatar: "/rapper-portrait-pixel-art.jpg" }],
    },
    {
      id: "t-004",
      name: "ROYAL MASSACRE 2024",
      description: "Annual championship event",
      league: {
        name: "Royal League",
        short_code: "RL",
        logo_url: "/placeholder-logo.png",
      },
      max_participants: 16,
      total_prize_pool: 75000,
      entry_fee: 3000,
      status: "completed",
      dates: "NOV 1 - NOV 30",
      format: "Single Elimination",
      rules: "2-Min Rounds, 3 Rounds",
      participantCount: 16,
      isUserRegistered: true,
      userSeed: 5,
      userPlacement: "Quarterfinalist",
      winner: { name: "SCHEME LORD", avatar: "/rapper-pixel.jpg" },
      recentWinners: [{ name: "SCHEME LORD", avatar: "/rapper-pixel.jpg" }],
    },
  ],
  upcoming: [] as any[],
  active: [] as any[],
  completed: [] as any[],
}

// Categorize tournaments
mockTournamentsData.upcoming = mockTournamentsData.all.filter((t) => t.status === "open" || t.status === "upcoming")
mockTournamentsData.active = mockTournamentsData.all.filter((t) => t.status === "in_progress")
mockTournamentsData.completed = mockTournamentsData.all.filter((t) => t.status === "completed")

export async function GET() {
  return NextResponse.json(mockTournamentsData)
}
