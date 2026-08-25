'use client';

import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';
import { formatCurrency } from '@/lib/game/paymentCalculator';
import StatCard from '@/components/ui/StatCard';
import GamingButton from '@/components/ui/GamingButton';

type Transaction = {
  id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
  battle_id: string | null;
  metadata: any;
};

type Props = {
  battler: any;
  balance: number;
  lifetimeEarnings: number;
  winEarnings: number;
  lossEarnings: number;
  tournamentEarnings: number;
  transactions: Transaction[];
};

export default function FinancesClient({
  battler,
  balance,
  lifetimeEarnings,
  winEarnings,
  lossEarnings,
  tournamentEarnings,
  transactions,
}: Props) {
  const router = useRouter();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'battle_win_bonus':
        return 'trophy';
      case 'battle_base_pay':
        return 'cash';
      case 'tournament_prize':
        return 'medal';
      case 'life_event_gain':
        return 'arrow-up';
      case 'life_event_loss':
        return 'arrow-down';
      default:
        return 'cash';
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount >= 0 ? 'text-green-400' : 'text-red-400';
  };

  // Calculate earnings breakdown percentages for visualization
  const totalEarnings = winEarnings + lossEarnings + tournamentEarnings;
  const winPercentage = totalEarnings > 0 ? (winEarnings / totalEarnings) * 100 : 0;
  const lossPercentage = totalEarnings > 0 ? (lossEarnings / totalEarnings) * 100 : 0;
  const tournamentPercentage = totalEarnings > 0 ? (tournamentEarnings / totalEarnings) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] bg-[#2d2f35]">
        <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <GamingButton variant="secondary" size="sm" href="/dashboard">
              ← BACK
            </GamingButton>
            <h1 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42]">
              FINANCES
            </h1>
          </div>
          <div className="text-sm font-display font-display font-black uppercase text-zinc-400">{battler.stage_name}</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            label="CURRENT BALANCE"
            value={formatCurrency(balance)}
            icon={<Icon name="cash" size={18} />}
            subtext={balance >= 0 ? 'POSITIVE BALANCE' : 'NEGATIVE BALANCE'}
          />
          <StatCard
            label="LIFETIME EARNINGS"
            value={formatCurrency(lifetimeEarnings)}
            icon={<Icon name="trophy" size={18} />}
            subtext="TOTAL CAREER EARNINGS"
          />
          <StatCard
            label="BATTLE EARNINGS"
            value={formatCurrency(winEarnings + lossEarnings)}
            icon={<Icon name="mic" size={18} />}
            subtext="FROM BATTLES ONLY"
          />
        </div>

        {/* Earnings Breakdown with Visual Chart */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6 mb-12">
          <h2 className="text-lg font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-6">
            EARNINGS BREAKDOWN
          </h2>

          {/* Visual Bar Chart */}
          {totalEarnings > 0 ? (
            <div className="mb-8">
              <div className="h-16 flex overflow-hidden bg-[#18191c] border-2 border-[#3a3d44] shadow-lg">
                {winPercentage > 0 && (
                  <div
                    className="bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-sm font-display font-black text-white transition-all hover:brightness-110"
                    style={{ width: `${winPercentage}%` }}
                    title={`Win Bonuses: ${Math.round(winPercentage)}%`}
                  >
                    {winPercentage > 15 && (
                      <div className="text-center uppercase">
                        <div>{Math.round(winPercentage)}%</div>
                        <div className="text-xs opacity-75">WINS</div>
                      </div>
                    )}
                  </div>
                )}
                {lossPercentage > 0 && (
                  <div
                    className="bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-sm font-display font-black text-white transition-all hover:brightness-110"
                    style={{ width: `${lossPercentage}%` }}
                    title={`Base Pay: ${Math.round(lossPercentage)}%`}
                  >
                    {lossPercentage > 15 && (
                      <div className="text-center uppercase">
                        <div>{Math.round(lossPercentage)}%</div>
                        <div className="text-xs opacity-75">BASE</div>
                      </div>
                    )}
                  </div>
                )}
                {tournamentPercentage > 0 && (
                  <div
                    className="bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-sm font-display font-black text-white transition-all hover:brightness-110"
                    style={{ width: `${tournamentPercentage}%` }}
                    title={`Tournament Prizes: ${Math.round(tournamentPercentage)}%`}
                  >
                    {tournamentPercentage > 15 && (
                      <div className="text-center uppercase">
                        <div>{Math.round(tournamentPercentage)}%</div>
                        <div className="text-xs opacity-75">TOURNEY</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-3 text-xs text-zinc-500 font-display font-display font-black uppercase">
                <span>0%</span>
                <span className="text-[#ff8c42]">{formatCurrency(totalEarnings)} TOTAL</span>
                <span>100%</span>
              </div>
            </div>
          ) : (
            <div className="mb-8 text-center py-8 bg-[#18191c] border-2 border-[#3a3d44]">
              <p className="text-zinc-500 text-sm font-display font-display font-black uppercase">No earnings data yet</p>
              <p className="text-xs text-zinc-600 mt-2 font-display uppercase">Complete battles to see breakdown</p>
            </div>
          )}

          {/* Breakdown Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#18191c] border-2 border-[#3a3d44] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <p className="text-xs uppercase tracking-wider text-zinc-500 font-display font-bold">WIN BONUSES</p>
              </div>
              <p className="text-2xl font-display font-black text-green-400">{formatCurrency(winEarnings)}</p>
              <p className="text-xs text-zinc-500 mt-1 font-display uppercase">
                {totalEarnings > 0 ? `${Math.round(winPercentage)}% of total` : 'From victories'}
              </p>
            </div>
            <div className="bg-[#18191c] border-2 border-[#3a3d44] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-zinc-500"></div>
                <p className="text-xs uppercase tracking-wider text-zinc-500 font-display font-bold">BASE PAY</p>
              </div>
              <p className="text-2xl font-display font-black text-zinc-300">{formatCurrency(lossEarnings)}</p>
              <p className="text-xs text-zinc-500 mt-1 font-display uppercase">
                {totalEarnings > 0 ? `${Math.round(lossPercentage)}% of total` : 'Participation payouts'}
              </p>
            </div>
            <div className="bg-[#18191c] border-2 border-[#3a3d44] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <p className="text-xs uppercase tracking-wider text-zinc-500 font-display font-bold">TOURNAMENT PRIZES</p>
              </div>
              <p className="text-2xl font-display font-black text-yellow-400">{formatCurrency(tournamentEarnings)}</p>
              <p className="text-xs text-zinc-500 mt-1 font-display uppercase">
                {totalEarnings > 0 ? `${Math.round(tournamentPercentage)}% of total` : 'From tournaments'}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Recent Activity Summary */}
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
            <h3 className="text-sm font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-4">
              RECENT ACTIVITY
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase text-zinc-500 font-display font-bold">Total Transactions</span>
                <span className="text-lg font-display font-black text-zinc-100">{transactions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase text-zinc-500 font-display font-bold">Avg Transaction</span>
                <span className="text-lg font-display font-black text-zinc-100">
                  {transactions.length > 0
                    ? formatCurrency(
                        transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) /
                          transactions.length
                      )
                    : '$0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase text-zinc-500 font-display font-bold">Last Payout</span>
                <span className="text-lg font-display font-black text-zinc-100">
                  {transactions.length > 0 && transactions[0].amount >= 0
                    ? formatCurrency(transactions[0].amount)
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Spending Power */}
          <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
            <h3 className="text-sm font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-4">
              FINANCIAL STATUS
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase text-zinc-500 font-display font-bold">Balance Status</span>
                <span className={`text-lg font-display font-black ${balance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {balance > 0 ? 'POSITIVE' : balance < 0 ? 'NEGATIVE' : 'NEUTRAL'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase text-zinc-500 font-display font-bold">Earnings Growth</span>
                <span className="text-lg font-display font-black text-zinc-300">
                  {lifetimeEarnings > 0 ? 'GROWING' : 'STARTING'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase text-zinc-500 font-display font-bold">Win Rate Impact</span>
                <span className="text-lg font-display font-black text-amber-400">
                  {totalEarnings > 0 ? `${Math.round(winPercentage)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-display font-black uppercase tracking-tighter text-[#ff8c42]">
              TRANSACTION HISTORY
            </h2>
            <span className="text-xs text-zinc-500 font-display font-display font-black uppercase">
              SHOWING {Math.min(transactions.length, 50)} TRANSACTIONS
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="cash" size={36} className="text-zinc-600 mb-4" />
              <p className="text-zinc-500 font-display font-display font-black uppercase">No transactions yet</p>
              <p className="text-xs text-zinc-600 mt-2 font-display uppercase">Complete battles to start earning</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-start p-4 bg-[#18191c] border-2 border-[#3a3d44] hover:border-[#ff8c42]/50 transition"
                >
                  <div className="flex gap-4 items-start flex-1">
                    <div className="mt-1 text-[#ff8c42]"><Icon name={getTransactionIcon(transaction.transaction_type) as any} size={20} /></div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-sm uppercase tracking-wide">
                        {transaction.description || transaction.transaction_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 font-display uppercase">
                        {new Date(transaction.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {transaction.battle_id && (
                        <Link
                          href={`/battle/${transaction.battle_id}/results`}
                          className="text-xs text-[#ff8c42] hover:text-[#ff9d5c] mt-1 inline-block font-display font-display font-black uppercase"
                        >
                          VIEW BATTLE →
                        </Link>
                      )}
                      {transaction.metadata?.tier && (
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-[#2d2f35] border-2 border-[#3a3d44] px-2 py-1 uppercase font-display font-bold">
                            {transaction.metadata.tier} TIER
                          </span>
                          {transaction.metadata.league && (
                            <span className="text-xs bg-[#2d2f35] border-2 border-[#3a3d44] px-2 py-1 font-display font-display font-black uppercase">
                              {transaction.metadata.league}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-display font-black text-xl ${getTransactionColor(transaction.amount)}`}>
                      {transaction.amount >= 0 ? '+' : ''}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
