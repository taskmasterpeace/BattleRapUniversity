'use client';
import Icon from '@/components/ui/Icon';

// THE BAG plates — same poster-plate family as /finances (Flyer System).
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

function MoneyPlate({
  label,
  value,
  sub,
  edge = '#3E404A',
  color = '#F4F4F6',
  hotLabel = false,
}: {
  label: string;
  value: string;
  sub: string;
  edge?: string;
  color?: string;
  hotLabel?: boolean;
}) {
  return (
    <div
      className="bg-[#101114] border-2 border-black p-5 shadow-[4px_4px_0_rgba(0,0,0,.45)]"
      style={{ borderTop: `3px solid ${edge}` }}
    >
      <p className={`font-mono text-[9px] uppercase tracking-[0.3em] mb-2 ${hotLabel ? 'text-[#E7B23C]' : 'text-zinc-500'}`}>
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 'clamp(16px,2.2vw,22px)',
          color,
          textShadow: '2px 2px 0 #000',
        }}
      >
        {value}
      </p>
      <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-600 mt-2">{sub}</p>
    </div>
  );
}

export default function EarningsWidget({ battler, leaguePayout }: Props) {
  const balance = Number(battler.current_balance ?? 0);
  const total = Number(battler.total_career_earnings ?? 0);
  const debt = Number(battler.debt_amount ?? 0);
  const nextPayout = Number(leaguePayout ?? 0);

  const netWorth = balance - debt;
  const netPositive = netWorth >= 0;

  return (
    <div className="fs mb-8">
      <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-4">
        <Icon name="cash" size={20} className="mr-2 -mt-1 inline-block" />EARNINGS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MoneyPlate
          label="◤ THE BAG"
          value={`$${fmt(balance)}`}
          sub="AVAILABLE CASH"
          edge="#E7B23C"
          color="#E7B23C"
          hotLabel
        />
        <MoneyPlate label="CAREER EARNINGS" value={`$${fmt(total)}`} sub="LIFETIME GROSS" />
        <MoneyPlate
          label="DEBT"
          value={`$${fmt(debt)}`}
          sub={debt > 0 ? 'OWED TO CREDITORS' : 'CLEAN BOOKS'}
          edge={debt > 0 ? '#E23A2E' : '#3E404A'}
          color={debt > 0 ? '#E23A2E' : '#A6A8B0'}
        />
        <MoneyPlate
          label="NEXT PAYOUT"
          value={`$${fmt(nextPayout)}`}
          sub="FLAT · PER LEAGUE BATTLE"
          edge="#35C46B"
          color="#35C46B"
        />
      </div>

      {/* Net Worth strip */}
      <div
        className="mt-4 bg-[#101114] border-2 border-black p-4 shadow-[4px_4px_0_rgba(0,0,0,.45)]"
        style={{ borderTop: `3px solid ${netPositive ? '#3E404A' : '#E23A2E'}` }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1.5">NET WORTH</p>
            <p
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 18,
                color: netPositive ? '#F4F4F6' : '#E23A2E',
                textShadow: '2px 2px 0 #000',
              }}
            >
              {netPositive ? '' : '-'}${fmt(Math.abs(netWorth))}
            </p>
          </div>
          <p className="font-mono text-[9px] text-zinc-500 text-right uppercase tracking-[0.2em] max-w-[14rem]">
            {netPositive
              ? "You can afford to take principled L's"
              : 'The streets call when bills do'}
          </p>
        </div>
      </div>
    </div>
  );
}
