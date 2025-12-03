import { NextResponse } from "next/server"
import { mockBattler, mockTransactions } from "@/lib/data"

export async function GET() {
  // Generate earnings over time data for line graph
  const earningsOverTime = [
    { date: "2025-11-01", balance: 8500, amount: 500, type: "base_pay" },
    { date: "2025-11-05", balance: 9700, amount: 1200, type: "battle_win" },
    { date: "2025-11-10", balance: 9200, amount: -500, type: "entry_fee" },
    { date: "2025-11-15", balance: 10400, amount: 1200, type: "battle_win" },
    { date: "2025-11-20", balance: 10900, amount: 500, type: "base_pay" },
    { date: "2025-11-25", balance: 11100, amount: 200, type: "performance_bonus" },
    { date: "2025-12-01", balance: 10600, amount: -500, type: "entry_fee" },
    { date: "2025-12-05", balance: 11800, amount: 1200, type: "battle_win" },
    { date: "2025-12-10", balance: 12050, amount: 250, type: "merch" },
    { date: "2025-12-15", balance: 12450, amount: 400, type: "performance_bonus" },
  ]

  const response = {
    battler: {
      id: mockBattler.id,
      name: mockBattler.stageName,
      avatar_url: "/rapper-pixel.jpg",
    },
    currentBalance: 12450,
    lifetimeEarnings: 34200,
    battleEarnings: 28500,
    earningsOverTime,
    breakdown: {
      winBonuses: 18000,
      basePay: 6500,
      tournamentPrizes: 8000,
      merch: 1200,
      other: 500,
    },
    recentTransactions: mockTransactions.slice(0, 10),
    tierAverages: {
      topTier: 85000,
      highTier: 45000,
      midTier: 22000,
      lowTier: 8000,
      rookie: 3000,
    },
  }

  return NextResponse.json(response)
}
