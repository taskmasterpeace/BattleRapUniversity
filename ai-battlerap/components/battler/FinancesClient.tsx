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

  // Calculate earnings breakdown percentages for visualization. Battle pay is
  // FLAT — win or lose you get the same purse — so it's a single "battle purse"
  // category, never a win-vs-base split (which would imply winning pays more).
  const battleEarnings = winEarnings + lossEarnings;
  const totalEarnings = battleEarnings + tournamentEarnings;
  const battlePercentage = totalEarnings > 0 ? (battleEarnings / totalEarnings) * 100 : 0;
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
        {/* THE BAG — poster plates, pixel-font money (Flyer System) */}
        <div className="fs grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            {
              lab: '◤ THE BAG', val: formatCurrency(balance),
              sub: balance >= 0 ? 'CASH ON HAND' : 'IN THE HOLE',
              hot: true, neg: balance < 0,
            },
            { lab: 'LIFETIME EARNINGS', val: formatCurrency(lifetimeEarnings), sub: 'CAREER TOTAL', hot: false, neg: false },
            { lab: 'BATTLE PURSES', val: formatCurrency(battleEarnings), sub: 'FLAT PAY · WIN OR LOSE', hot: false, neg: false },
          ].map((p) => (
            <div
              key={p.lab}
              className="bg-[#101114] border-2 border-black p-5 shadow-[4px_4px_0_rgba(0,0,0,.45)]"
              style={{ borderTop: `3px solid ${p.hot ? '#E7B23C' : '#3E404A'}` }}
            >
              <p className={`font-mono text-[11px] uppercase tracking-[0.3em] mb-2 ${p.hot ? 'text-[#E7B23C]' : 'text-zinc-500'}`}>
                {p.lab}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 'clamp(18px,2.6vw,26px)',
                  color: p.neg ? '#E23A2E' : p.hot ? '#E7B23C' : '#F4F4F6',
                  textShadow: '2px 2px 0 #000',
                }}
              >
                {p.val}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600 mt-2">{p.sub}</p>
            </div>
          ))}
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
                {battlePercentage > 0 && (
                  <div
                    className="bg-gradient-to-br from-[#ff8c42] to-orange-600 flex items-center justify-center text-sm font-display font-black text-black transition-all hover:brightness-110"
                    style={{ width: `${battlePercentage}%` }}
                    title={`Battle Purses: ${Math.round(battlePercentage)}%`}
                  >
                    {battlePercentage > 15 && (
                      <div className="text-center uppercase">
                        <div>{Math.round(battlePercentage)}%</div>
                        <div className="text-xs opacity-75">BATTLES</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#18191c] border-2 border-[#3a3d44] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-[#ff8c42]"></div>
                <p className="text-xs uppercase tracking-wider text-zinc-500 font-display font-bold">BATTLE PURSES</p>
              </div>
              <p className="text-2xl font-display font-black text-[#ff8c42]">{formatCurrency(battleEarnings)}</p>
              <p className="text-xs text-zinc-500 mt-1 font-display uppercase">
                {totalEarnings > 0 ? `${Math.round(battlePercentage)}% of total` : 'Flat pay — win or lose'}
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
                <span className="text-xs uppercase text-zinc-500 font-display font-bold">Tournament Share</span>
                <span className="text-lg font-display font-black text-amber-400">
                  {totalEarnings > 0 ? `${Math.round(tournamentPercentage)}%` : 'N/A'}
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
                      {/* Render tier and league independently — some earnings records
                          carry a league but no tier, and gating the whole block on
                          tier hid the league tag too, so those rows showed nothing. */}
                      {(transaction.metadata?.tier || transaction.metadata?.league) && (
                        <div className="flex gap-2 mt-2">
                          {transaction.metadata?.tier && (
                            <span className="text-xs bg-[#2d2f35] border-2 border-[#3a3d44] px-2 py-1 uppercase font-display font-bold">
                              {transaction.metadata.tier} TIER
                            </span>
                          )}
                          {transaction.metadata?.league && (
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
