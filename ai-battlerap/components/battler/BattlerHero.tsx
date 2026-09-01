'use client';

import Link from 'next/link';
import { portraitFillStyle } from '@/lib/sprite-crops';

interface NextBattleLite {
  opponentId?: string;
  opponentName?: string;
  opponentAvatar?: string | null;
  league?: string;
  dateLabel?: string;
  prepPct?: number;
}

interface BattlerHeroProps {
  name: string;
  portrait: string;
  cityName?: string;
  cityBackdrop?: string;
  league?: string;
  tierLabel?: string;
  region?: string | null;
  level?: number;
  levelLabel?: string;
  elo?: number;
  xp?: { current: number; needed: number };
  rosterSlots?: string;
  nextBattle?: NextBattleLite | null;
}

/**
 * Flyer System command-center hero (see docs/design/flyer-system/DESIGN_LANGUAGE.md).
 * Big portrait over the origin city with the city NAME crowning the frame,
 * identity chips, level + pixel ELO + XP, and a matchup-forward next-battle mini-flyer.
 */
export default function BattlerHero({
  name,
  portrait,
  cityName,
  cityBackdrop,
  league,
  tierLabel,
  region,
  level = 1,
  levelLabel = 'ROOKIE',
  elo,
  xp,
  rosterSlots = '1 / 3 ROSTER SLOTS',
  nextBattle,
}: BattlerHeroProps) {
  const xpCur = xp?.current ?? 0;
  const xpNeed = Math.max(1, xp?.needed ?? 1000);
  const xpPct = Math.min(100, Math.round((xpCur / xpNeed) * 100));

  return (
    <div className="fs fs-hero fs-ticks mb-8">
      <div className="fs-port">
        {cityBackdrop && (
          <img
            className="fs-bg"
            src={cityBackdrop}
            alt=""
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        {cityName && <span className="fs-cityback">{cityName}</span>}
        <img className="fs-fg" src={portrait} alt={name} style={portraitFillStyle(portrait, { targetH: 0.86 })} />
      </div>

      <div className="fs-mid">
        <div className="fs-status">
          <i />
          ACTIVE BATTLER · {rosterSlots}
        </div>
        <h1 className="fs-name">{name}</h1>
        <div className="fs-chips">
          {league && <span className="fs-chip tier">{league}</span>}
          {tierLabel && <span className="fs-chip">{tierLabel}</span>}
          {cityName && <span className="fs-chip city">{cityName}</span>}
          {/* region often mirrors the home city for city-born battlers — one chip is enough */}
          {region && region.toLowerCase() !== (cityName ?? '').toLowerCase() && (
            <span className="fs-chip loc">{region}</span>
          )}
        </div>
        <span className="fs-lvl">
          <span className="r">{levelLabel}</span>
          <b>LEVEL {level}</b>
        </span>
        <div className="fs-elowrap">
          <div className="row">
            <div className="fs-elo">
              {elo ?? '—'}
              <small>ELO RATING</small>
            </div>
            <div style={{ flex: 1 }}>
              <div className="fs-xp">
                <i style={{ width: `${xpPct}%` }} />
                <b>
                  {xpCur.toLocaleString()} / {xpNeed.toLocaleString()} XP
                </b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {nextBattle ? (
        <div className="fs-nextb">
          <span className="lab">◤ NEXT BATTLE</span>
          <div className="vsrow">
            <span className="f r">
              <img src={portrait} alt="" style={portraitFillStyle(portrait, { targetH: 1.08 })} />
            </span>
            <span className="vs">VS</span>
            {nextBattle.opponentId ? (
              <Link href={`/battler/${nextBattle.opponentId}`} className="f b hover:opacity-85 transition-opacity" title={`${nextBattle.opponentName} — profile`}>
                {nextBattle.opponentAvatar && (
                  <img src={nextBattle.opponentAvatar} alt="" style={portraitFillStyle(nextBattle.opponentAvatar, { targetH: 1.08 })} />
                )}
              </Link>
            ) : (
              <span className="f b">
                {nextBattle.opponentAvatar && (
                  <img src={nextBattle.opponentAvatar} alt="" style={portraitFillStyle(nextBattle.opponentAvatar, { targetH: 1.08 })} />
                )}
              </span>
            )}
          </div>
          <div className="opp">
            {nextBattle.opponentId ? (
              <Link href={`/battler/${nextBattle.opponentId}`} className="hover:text-[#E7B23C] transition-colors">
                vs {nextBattle.opponentName || 'TBA'}
              </Link>
            ) : (
              <>vs {nextBattle.opponentName || 'TBA'}</>
            )}
          </div>
          <div className="meta">{[nextBattle.league, nextBattle.dateLabel].filter(Boolean).join(' · ')}</div>
          <div className="prep">
            <div className="t">
              <span>PREP PROGRESS</span>
              <span>{nextBattle.prepPct ?? 0}%</span>
            </div>
            <div className="fs-bar">
              <i style={{ width: `${nextBattle.prepPct ?? 0}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="fs-nextb" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <span className="lab" style={{ color: 'var(--fs-mut)' }}>
            ◤ NO BATTLE BOOKED
          </span>
          <div className="opp" style={{ marginTop: 10 }}>
            Check Offers
          </div>
        </div>
      )}
    </div>
  );
}
