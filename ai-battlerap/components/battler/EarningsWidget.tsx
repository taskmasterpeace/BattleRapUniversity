'use client';
import Icon from '@/components/ui/Icon';

type Props = {
  battler: {
    current_balance?: number | null;
    total_career_earnings?: number | null;
    debt_amount?: number | null;
  };
  leaguePayout?: number | null;
};

const fmt = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 0 });

export default function EarningsWidget({ battler, leaguePayout }: Props) {
  const balance = Number(battler.current_balance ?? 0);
  const total = Number(battler.total_career_earnings ?? 0);
  const debt = Number(battler.debt_amount ?? 0);
  const nextPayout = Number(leaguePayout ?? 0);

  const netWorth = balance - debt;
  const netPositive = netWorth >= 0;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-4">
        <Icon name="cash" size={20} className="mr-2 -mt-1 inline-block" />EARNINGS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Balance */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-5">
          <div className="text-xs font-display font-black uppercase tracking-wider text-zinc-400 mb-2">
            CURRENT BALANCE
          </div>
          <div className="text-3xl font-display font-black text-[#ff8c42] leading-none">
            ${fmt(balance)}
          </div>
          <div className="text-xs text-zinc-500 mt-2 uppercase tracking-wide">
            Available cash
          </div>
        </div>

        {/* Total Career Earnings */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-5">
          <div className="text-xs font-display font-black uppercase tracking-wider text-zinc-400 mb-2">
            CAREER EARNINGS
          </div>
          <div className="text-3xl font-display font-black text-zinc-100 leading-none">
            ${fmt(total)}
          </div>
          <div className="text-xs text-zinc-500 mt-2 uppercase tracking-wide">
            Lifetime gross
          </div>
        </div>

        {/* Debt */}
        <div
          className={`bg-[#2d2f35] border-2 p-5 ${
            debt > 0 ? 'border-red-500/50' : 'border-[#3a3d44]'
          }`}
        >
          <div className="text-xs font-display font-black uppercase tracking-wider text-zinc-400 mb-2">
            DEBT
          </div>
          <div
            className={`text-3xl font-display font-black leading-none ${
              debt > 0 ? 'text-red-400' : 'text-zinc-300'
            }`}
          >
            ${fmt(debt)}
          </div>
          <div className="text-xs text-zinc-500 mt-2 uppercase tracking-wide">
            {debt > 0 ? 'Owed to creditors' : 'Clean books'}
          </div>
        </div>

        {/* Next Battle Payout */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-5">
          <div className="text-xs font-display font-black uppercase tracking-wider text-zinc-400 mb-2">
            NEXT PAYOUT
          </div>
          <div className="text-3xl font-display font-black text-green-400 leading-none">
            ${fmt(nextPayout)}
          </div>
          <div className="text-xs text-zinc-500 mt-2 uppercase tracking-wide">
            Per league battle
          </div>
        </div>
      </div>

      {/* Net Worth bar */}
      <div className="mt-4 bg-[#2d2f35] border-2 border-[#3a3d44] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-display font-black uppercase tracking-wider text-zinc-400 mb-1">
              NET WORTH
            </div>
            <div
              className={`text-2xl font-display font-black ${
                netPositive ? 'text-zinc-100' : 'text-red-400'
              }`}
            >
              {netPositive ? '' : '-'}${fmt(Math.abs(netWorth))}
            </div>
          </div>
          <div className="text-xs text-zinc-500 text-right uppercase tracking-wide max-w-[12rem]">
            {netPositive
              ? 'You can afford to take principled L\'s'
              : 'The streets call when bills do'}
          </div>
        </div>
      </div>
    </div>
  );
}
