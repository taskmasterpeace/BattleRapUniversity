import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/server';

/**
 * GET /api/finances
 * Returns financial data for the current user's battler
 * - Current balance
 * - Lifetime earnings
 * - Transaction history with timestamps (for line graph)
 * - Earnings breakdown
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's battler
    const { data: battler, error: battlerError } = await supabase
      .from('battlers')
      .select('id, stage_name, avatar_url')
      .eq('user_id', user.id)
      .single();

    if (battlerError || !battler) {
      return NextResponse.json(
        { error: 'No battler found for user' },
        { status: 404 }
      );
    }

    // Get battler attributes (balance and lifetime earnings)
    const { data: attributes, error: attrError } = await supabase
      .from('battler_attributes')
      .select('balance, lifetime_earnings')
      .eq('battler_id', battler.id)
      .single();

    if (attrError) {
      return NextResponse.json(
        { error: 'Failed to fetch battler attributes' },
        { status: 500 }
      );
    }

    // Get all transaction history ordered by date
    const { data: transactions, error: transError } = await supabase
      .from('battler_earnings')
      .select('*')
      .eq('battler_id', battler.id)
      .order('created_at', { ascending: true });

    if (transError) {
      return NextResponse.json(
        { error: 'Failed to fetch transaction history' },
        { status: 500 }
      );
    }

    // Calculate earnings over time for line graph
    let runningBalance = 5000; // Starting balance
    const earningsOverTime = transactions?.map((txn) => {
      runningBalance += parseFloat(txn.amount.toString());
      return {
        date: txn.created_at,
        balance: runningBalance,
        amount: parseFloat(txn.amount.toString()),
        type: txn.transaction_type,
      };
    }) || [];

    // Calculate earnings breakdown by type
    const breakdown = transactions?.reduce((acc: any, txn) => {
      const type = txn.transaction_type;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += parseFloat(txn.amount.toString());
      return acc;
    }, {}) || {};

    // Get recent transactions (last 20)
    const recentTransactions = (transactions || [])
      .slice(-20)
      .reverse()
      .map((txn) => ({
        id: txn.id,
        amount: parseFloat(txn.amount.toString()),
        type: txn.transaction_type,
        description: txn.description,
        date: txn.created_at,
        battle_id: txn.battle_id,
      }));

    // Get battle earnings specifically
    const { data: battles, error: battlesError } = await supabase
      .from('battles')
      .select('player_payout')
      .eq('battler_player_id', battler.id)
      .eq('status', 'completed');

    const totalBattleEarnings = battles?.reduce(
      (sum, b) => sum + parseFloat(b.player_payout?.toString() || '0'),
      0
    ) || 0;

    return NextResponse.json({
      battler: {
        id: battler.id,
        name: battler.stage_name,
        avatar_url: battler.avatar_url,
      },
      currentBalance: parseFloat(attributes?.balance?.toString() || '0'),
      lifetimeEarnings: parseFloat(
        attributes?.lifetime_earnings?.toString() || '0'
      ),
      battleEarnings: totalBattleEarnings,
      earningsOverTime,
      breakdown,
      recentTransactions,
    });
  } catch (error) {
    console.error('Error fetching finances:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
