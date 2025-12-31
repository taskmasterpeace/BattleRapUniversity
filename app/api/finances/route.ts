import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get player's battler
    const { data: playerBattler, error: battlerError } = await supabase
      .from('battlers')
      .select('id, stage_name, avatar_url')
      .eq('is_ai', false)
      .limit(1)
      .single()

    if (battlerError || !playerBattler) {
      return NextResponse.json({ error: 'Player battler not found' }, { status: 404 })
    }

    // Get player's financial attributes
    const { data: attributes } = await supabase
      .from('battler_attributes')
      .select('balance, lifetime_earnings')
      .eq('battler_id', playerBattler.id)
      .single()

    // Get recent earnings transactions
    const { data: transactions } = await supabase
      .from('battler_earnings')
      .select('*')
      .eq('battler_id', playerBattler.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // Calculate earnings breakdown by type
    const { data: allTransactions } = await supabase
      .from('battler_earnings')
      .select('amount, transaction_type')
      .eq('battler_id', playerBattler.id)

    const breakdown = {
      winBonuses: 0,
      basePay: 0,
      tournamentPrizes: 0,
      lifeEventGains: 0,
      lifeEventLosses: 0,
    }

    allTransactions?.forEach(t => {
      if (t.transaction_type === 'battle_win_bonus') breakdown.winBonuses += Number(t.amount)
      else if (t.transaction_type === 'battle_base_pay') breakdown.basePay += Number(t.amount)
      else if (t.transaction_type === 'tournament_prize') breakdown.tournamentPrizes += Number(t.amount)
      else if (t.transaction_type === 'life_event_gain') breakdown.lifeEventGains += Number(t.amount)
      else if (t.transaction_type === 'life_event_loss') breakdown.lifeEventLosses += Math.abs(Number(t.amount))
    })

    // Generate earnings over time from transactions (last 10 with running balance)
    const earningsOverTime: { date: string; balance: number; amount: number; type: string }[] = []
    let runningBalance = Number(attributes?.balance) || 5000

    // Work backwards from most recent transaction
    const sortedTransactions = [...(transactions || [])].reverse()
    sortedTransactions.forEach(t => {
      earningsOverTime.push({
        date: new Date(t.created_at).toISOString().split('T')[0],
        balance: runningBalance,
        amount: Number(t.amount),
        type: t.transaction_type,
      })
      runningBalance -= Number(t.amount)
    })
    earningsOverTime.reverse() // Chronological order

    // Map transactions to expected format
    const recentTransactions = (transactions || []).map(t => ({
      id: t.id,
      date: new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      description: t.description || formatTransactionDescription(t.transaction_type),
      amount: Number(t.amount),
      type: mapTransactionType(t.transaction_type),
      balance: 0, // We'd need running balance calculation
    }))

    // Tier averages (static for now - could be calculated from all battlers)
    const tierAverages = {
      topTier: 85000,
      highTier: 45000,
      midTier: 22000,
      lowTier: 8000,
      rookie: 3000,
    }

    const response = {
      battler: {
        id: playerBattler.id,
        name: playerBattler.stage_name,
        avatar_url: playerBattler.avatar_url || "/rapper-pixel.jpg",
      },
      currentBalance: Number(attributes?.balance) || 5000,
      lifetimeEarnings: Number(attributes?.lifetime_earnings) || 0,
      battleEarnings: breakdown.winBonuses + breakdown.basePay,
      earningsOverTime,
      breakdown,
      recentTransactions,
      tierAverages,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('Finances route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function formatTransactionDescription(type: string): string {
  switch (type) {
    case 'battle_base_pay': return 'Battle Base Pay'
    case 'battle_win_bonus': return 'Win Bonus'
    case 'tournament_prize': return 'Tournament Prize'
    case 'life_event_gain': return 'Life Event Bonus'
    case 'life_event_loss': return 'Life Event Expense'
    default: return type
  }
}

function mapTransactionType(type: string): string {
  switch (type) {
    case 'battle_base_pay': return 'base_pay'
    case 'battle_win_bonus': return 'battle_win'
    case 'tournament_prize': return 'tournament'
    case 'life_event_gain': return 'bonus'
    case 'life_event_loss': return 'expense'
    default: return 'other'
  }
}
