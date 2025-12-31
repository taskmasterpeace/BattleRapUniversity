import { getPlayerBattler } from '@/lib/game/getPlayerBattler';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/db/server';
import FinancesClient from '@/components/battler/FinancesClient';

export default async function FinancesPage() {
  const { user, battler } = await getPlayerBattler();

  if (!user) {
    redirect('/login');
  }

  if (!battler) {
    redirect('/onboarding');
  }

  const supabase = await createServerSupabaseClient();

  // Get transaction history from battler_earnings table
  const { data: transactions } = await supabase
    .from('battler_earnings')
    .select('*')
    .eq('battler_id', battler.id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Get battle earnings summary (wins vs losses)
  const { data: battleEarnings } = await supabase
    .from('battler_earnings')
    .select('amount, transaction_type')
    .eq('battler_id', battler.id)
    .in('transaction_type', ['battle_base_pay', 'battle_win_bonus']);

  // Calculate summary stats from battlers table
  const balance = battler.current_balance || 0;
  const lifetimeEarnings = battler.total_career_earnings || 0;

  const winEarnings = battleEarnings
    ?.filter((e) => e.transaction_type === 'battle_win_bonus')
    .reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0) || 0;

  const lossEarnings = battleEarnings
    ?.filter((e) => e.transaction_type === 'battle_base_pay')
    .reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0) || 0;

  const tournamentEarnings = transactions
    ?.filter((t) => t.transaction_type === 'tournament_prize')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;

  return (
    <FinancesClient
      battler={battler}
      balance={balance}
      lifetimeEarnings={lifetimeEarnings}
      winEarnings={winEarnings}
      lossEarnings={lossEarnings}
      tournamentEarnings={tournamentEarnings}
      transactions={transactions || []}
    />
  );
}
