/**
 * HOW TO PREP — a Battle Rap University film.
 * Six scenes, game-native visual language: #0a0a0a stage, #ff8c42 accent,
 * Bebas display type, pixel sprites, verdict stamps, scanlines, grain.
 */
import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Img,
} from 'remotion';
import { loadFont as loadBebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

const { fontFamily: BEBAS } = loadBebas();
const { fontFamily: MONO } = loadMono();

export const FPS = 30;
const S = (sec: number) => Math.round(sec * FPS);

// Scene boundaries (seconds)
const SCENES = {
  title: { from: 0, dur: 3.4 },
  offer: { from: 3.4, dur: 5.6 },
  week: { from: 9.0, dur: 9.0 },
  scout: { from: 18.0, dur: 7.0 },
  risk: { from: 25.0, dur: 5.4 },
  battle: { from: 30.4, dur: 6.6 },
};
export const PREP_FILM_DURATION = S(37);

const ORANGE = '#ff8c42';
const BG = '#0a0a0a';
const CARD = '#18191c';
const BORDER = '#3a3d44';

// ── shared chrome ───────────────────────────────────────────────────────────
const Scanlines: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage:
        'repeating-linear-gradient(to bottom, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 2px, transparent 2px, transparent 6px)',
      pointerEvents: 'none',
    }}
  />
);

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: 0.05,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${frame % 10}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  );
};

const Kicker: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 26,
      letterSpacing: '0.45em',
      textTransform: 'uppercase',
      color: ORANGE,
      ...style,
    }}
  >
    {children}
  </div>
);

const useIn = (delayFrames = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delayFrames, fps, config: { damping } });
};

// ── Scene 1: TITLE ──────────────────────────────────────────────────────────
const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const a = useIn(2);
  const b = useIn(12);
  const flicker = interpolate(frame % 30, [0, 15, 30], [1, 0.92, 1]);
  return (
    <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
      <Img
        src={staticFile('skyline.png')}
        style={{
          position: 'absolute',
          width: '110%',
          bottom: 0,
          opacity: 0.18,
          imageRendering: 'pixelated',
        }}
      />
      <Kicker style={{ opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
        ◆ A BATTLE RAP UNIVERSITY FILM ◆
      </Kicker>
      <div
        style={{
          fontFamily: BEBAS,
          fontSize: 280,
          lineHeight: 0.85,
          color: 'white',
          opacity: b * flicker,
          transform: `scale(${0.9 + b * 0.1})`,
          textShadow: `0 0 80px rgba(255,140,66,0.45)`,
        }}
      >
        HOW TO <span style={{ color: ORANGE }}>PREP</span>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 24,
          letterSpacing: '0.35em',
          color: '#71717a',
          marginTop: 30,
          opacity: b,
        }}
      >
        BECAUSE TALK IS CHEAP
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: THE OFFER ──────────────────────────────────────────────────────
const OfferScene: React.FC = () => {
  const card = useIn(4, 16);
  const stamp = useIn(96, 10);
  return (
    <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
      <Kicker style={{ position: 'absolute', top: 110 }}>STEP 1 — THE CALLOUT FINDS YOU</Kicker>
      <div
        style={{
          width: 980,
          background: CARD,
          border: `5px solid ${ORANGE}`,
          padding: 70,
          opacity: card,
          transform: `translateY(${(1 - card) * 140}px)`,
          boxShadow: '0 0 120px rgba(255,140,66,0.35)',
          position: 'relative',
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '0.3em', color: ORANGE, marginBottom: 24 }}>
          📬 NEW BATTLE OFFER — CROWN CITY BATTLE LEAGUE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
          <Img src={staticFile('battler-a.png')} style={{ width: 190, height: 190, imageRendering: 'pixelated', objectFit: 'contain' }} />
          <div style={{ fontFamily: BEBAS, fontSize: 120, color: ORANGE }}>VS</div>
          <Img src={staticFile('battler-b.png')} style={{ width: 190, height: 190, imageRendering: 'pixelated', objectFit: 'contain' }} />
          <div style={{ marginLeft: 30 }}>
            <div style={{ fontFamily: BEBAS, fontSize: 92, color: 'white', lineHeight: 0.9 }}>TRU FOE</div>
            <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: '0.25em', color: '#a1a1aa' }}>
              TOP TIER · ✓ VERIFIED · $1,800
            </div>
          </div>
        </div>
        {/* ACCEPT stamp */}
        <div
          style={{
            position: 'absolute',
            right: 50,
            bottom: -40,
            border: `8px solid #22c55e`,
            color: '#22c55e',
            fontFamily: BEBAS,
            fontSize: 96,
            padding: '4px 44px',
            transform: `rotate(-9deg) scale(${interpolate(stamp, [0, 1], [2.6, 1])})`,
            opacity: stamp,
            background: BG,
          }}
        >
          ACCEPTED ✓
        </div>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: '0.2em', color: '#71717a', marginTop: 80, opacity: stamp }}>
        CONGRATULATIONS. YOU NOW HAVE A PROBLEM WITH A DEADLINE.
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: PREP WEEK ──────────────────────────────────────────────────────
const WEEK = [
  { day: 'MON', icon: '🔍', label: 'RESEARCH', color: '#a855f7', tip: 'UNLOCK THEIR WEAKNESSES' },
  { day: 'TUE', icon: '✍️', label: 'WRITE', color: '#3b82f6', tip: 'SHARPEN THE PEN' },
  { day: 'WED', icon: '✍️', label: 'WRITE', color: '#3b82f6', tip: 'STACK THE HAYMAKERS' },
  { day: 'THU', icon: '🎤', label: 'PERFORM', color: '#22c55e', tip: 'REHEARSE THE DELIVERY' },
  { day: 'FRI', icon: '✍️', label: 'WRITE', color: '#3b82f6', tip: 'THIRD-ROUND MATERIAL' },
  { day: 'SAT', icon: '🎤', label: 'PERFORM', color: '#22c55e', tip: 'OWN THE STAGE' },
  { day: 'SUN', icon: '😴', label: 'REST', color: '#71717a', tip: 'PROTECT THE NERVES' },
];

const WeekScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const perDay = 28; // frames between day reveals
  const activeIdx = Math.min(WEEK.length - 1, Math.floor((frame - 14) / perDay));
  return (
    <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
      <Kicker style={{ position: 'absolute', top: 110 }}>STEP 2 — EVERY DAY IS A CHOICE</Kicker>
      <div style={{ display: 'flex', gap: 26 }}>
        {WEEK.map((d, i) => {
          const pop = spring({ frame: frame - 14 - i * perDay, fps, config: { damping: 11 } });
          return (
            <div
              key={d.day}
              style={{
                width: 200,
                background: CARD,
                border: `4px solid ${pop > 0.02 ? d.color : BORDER}`,
                padding: '34px 0',
                textAlign: 'center',
                opacity: 0.25 + pop * 0.75,
                transform: `translateY(${(1 - pop) * 60}px) scale(${0.85 + pop * 0.15})`,
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 22, color: '#71717a', letterSpacing: '0.2em' }}>{d.day}</div>
              <div style={{ fontSize: 72, margin: '18px 0' }}>{d.icon}</div>
              <div style={{ fontFamily: BEBAS, fontSize: 40, color: pop > 0.02 ? d.color : '#3f3f46' }}>{d.label}</div>
            </div>
          );
        })}
      </div>
      {/* rotating tip line */}
      {activeIdx >= 0 && (
        <div
          key={activeIdx}
          style={{
            marginTop: 70,
            fontFamily: BEBAS,
            fontSize: 76,
            color: WEEK[activeIdx].color,
            opacity: interpolate((frame - 14) % perDay, [0, 6, perDay - 4, perDay], [0, 1, 1, 0.6]),
          }}
        >
          {WEEK[activeIdx].icon} {WEEK[activeIdx].label} = {WEEK[activeIdx].tip}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── Scene 4: SCOUTING ───────────────────────────────────────────────────────
const SCOUT_ROWS = [
  { tier: 'TIER 1', text: 'RECORD 12W-3L · ELO 1820 · GUN BAR SPECIALIST', delay: 18 },
  { tier: 'TIER 2', text: 'LAST 3: W · W · W — AVG CROWD 88%', delay: 58 },
  { tier: 'TIER 3', text: 'CHOKE RATE 17% — PRESSURE HIM EARLY, HE FOLDS', delay: 98 },
];

const ScoutScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
      <Kicker style={{ position: 'absolute', top: 110 }}>STEP 3 — RESEARCH DAYS UNLOCK INTEL</Kicker>
      <div style={{ width: 1240, background: CARD, border: `4px solid ${BORDER}`, padding: 60 }}>
        <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: '0.3em', color: ORANGE, marginBottom: 40 }}>
          🔍 SCOUTING REPORT — TRU FOE
        </div>
        {SCOUT_ROWS.map((r) => {
          const reveal = spring({ frame: frame - r.delay, fps, config: { damping: 13 } });
          const locked = reveal < 0.05;
          return (
            <div
              key={r.tier}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 34,
                padding: '26px 30px',
                borderBottom: `2px solid ${BORDER}`,
                opacity: 0.35 + reveal * 0.65,
              }}
            >
              <div style={{ fontFamily: BEBAS, fontSize: 44, color: locked ? '#52525b' : ORANGE, width: 150 }}>
                {locked ? '🔒' : '📂'} {r.tier}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 32,
                  letterSpacing: '0.06em',
                  color: locked ? '#3f3f46' : 'white',
                  transform: `translateX(${(1 - reveal) * 50}px)`,
                }}
              >
                {locked ? '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓' : r.text}
              </div>
            </div>
          );
        })}
        <div
          style={{
            marginTop: 40,
            fontFamily: BEBAS,
            fontSize: 56,
            color: '#ef4444',
            opacity: spring({ frame: frame - 145, fps, config: { damping: 12 } }),
          }}
        >
          ► FILM STUDY LITERALLY WRITES YOUR BEST BAR.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: CHOKE RISK ─────────────────────────────────────────────────────
const RiskScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pct = interpolate(frame, [16, 110], [38, 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bonus = useIn(120, 10);
  return (
    <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
      <Kicker style={{ position: 'absolute', top: 110 }}>STEP 4 — PREP BUYS DOWN THE CHOKE</Kicker>
      <div style={{ fontFamily: BEBAS, fontSize: 90, color: 'white', marginBottom: 30 }}>
        CHOKE RISK
      </div>
      <div style={{ width: 1100, height: 90, background: CARD, border: `4px solid ${BORDER}`, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${pct * 2.4}%`,
            background: pct > 20 ? '#ef4444' : pct > 9 ? ORANGE : '#22c55e',
            transition: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: BEBAS,
            fontSize: 60,
            color: 'white',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          {pct.toFixed(0)}%
        </div>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: '0.15em', color: '#a1a1aa', marginTop: 36 }}>
        NO PREP = FREEZE ON STAGE WITH THE WHOLE ROOM WATCHING
      </div>
      <div
        style={{
          marginTop: 50,
          border: `6px solid ${ORANGE}`,
          padding: '16px 60px',
          fontFamily: BEBAS,
          fontSize: 72,
          color: ORANGE,
          transform: `rotate(-4deg) scale(${interpolate(bonus, [0, 1], [2.2, 1])})`,
          opacity: bonus,
          background: BG,
        }}
      >
        FULL PREP = +1 BONUS BATTLE SLOT
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 6: BATTLE TIME ────────────────────────────────────────────────────
const BattleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const btn = useIn(6, 12);
  const verdict = useIn(74, 9);
  const cta = useIn(130);
  const pulse = 1 + Math.sin(frame / 6) * 0.025;
  return (
    <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
      <Img
        src={staticFile('skyline.png')}
        style={{ position: 'absolute', width: '110%', bottom: 0, opacity: 0.14, imageRendering: 'pixelated' }}
      />
      <div
        style={{
          background: ORANGE,
          color: 'black',
          fontFamily: BEBAS,
          fontSize: 100,
          padding: '26px 110px',
          opacity: btn,
          transform: `scale(${btn * pulse})`,
          boxShadow: '0 0 140px rgba(255,140,66,0.55)',
        }}
      >
        🎤 BATTLE TIME — TAKE THE STAGE
      </div>
      <div
        style={{
          marginTop: 80,
          border: `10px solid ${ORANGE}`,
          color: ORANGE,
          fontFamily: BEBAS,
          fontSize: 150,
          padding: '10px 80px',
          background: BG,
          transform: `rotate(-7deg) scale(${interpolate(verdict, [0, 1], [3, 1])})`,
          opacity: verdict,
          textShadow: '0 0 60px rgba(255,140,66,0.5)',
        }}
      >
        3-0 · BODYBAG
      </div>
      <div style={{ position: 'absolute', bottom: 90, textAlign: 'center', opacity: cta }}>
        <div style={{ fontFamily: BEBAS, fontSize: 64, color: 'white', letterSpacing: '0.04em' }}>
          BATTLE RAP <span style={{ color: ORANGE }}>UNIVERSITY</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: '0.35em', color: '#a1a1aa', marginTop: 10 }}>
          ENTER THE CIRCUIT — FREE PUBLIC BETA
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── film ────────────────────────────────────────────────────────────────────
export const PrepFilm: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <Sequence from={S(SCENES.title.from)} durationInFrames={S(SCENES.title.dur)}>
      <TitleScene />
    </Sequence>
    <Sequence from={S(SCENES.offer.from)} durationInFrames={S(SCENES.offer.dur)}>
      <OfferScene />
    </Sequence>
    <Sequence from={S(SCENES.week.from)} durationInFrames={S(SCENES.week.dur)}>
      <WeekScene />
    </Sequence>
    <Sequence from={S(SCENES.scout.from)} durationInFrames={S(SCENES.scout.dur)}>
      <ScoutScene />
    </Sequence>
    <Sequence from={S(SCENES.risk.from)} durationInFrames={S(SCENES.risk.dur)}>
      <RiskScene />
    </Sequence>
    <Sequence from={S(SCENES.battle.from)} durationInFrames={S(SCENES.battle.dur)}>
      <BattleScene />
    </Sequence>
    <Scanlines />
    <Grain />
  </AbsoluteFill>
);
