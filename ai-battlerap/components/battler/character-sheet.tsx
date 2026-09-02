"use client"

import { useState } from "react"
import { portraitFillStyle } from "@/lib/sprite-crops"
import { tierForCell, tierOf, TIER_META } from "@/components/ui/StatGauge"

export interface AttrRow {
  label: string
  value: number // 0–100, or 1–10 (scale10)
}

export interface AttrGroup {
  title: string
  scale10?: boolean
  rows: AttrRow[]
}

export interface BadgeEffect {
  label: string
  delta: string
  good: boolean
}

export interface BadgeInfo {
  name: string
  tier: "bronze" | "silver" | "gold"
  icon?: string
  emoji?: string
  effects: BadgeEffect[]
}

export interface NetEffect {
  label: string
  delta: string
  good: boolean
}

export interface LeagueInfo {
  name: string
  crest?: string
  subtitle?: string
}

export interface LineageEntry {
  crest?: string
  label?: string
}

export interface SideStat {
  k: string
  v: string
  s?: string
  /** left-edge accent, defaults to brand orange */
  color?: string
}

export interface RivalFile {
  name: string
  record: string | null
  intensity: number
}

export interface DangerLine {
  bodies: number
  roundWinRate: number
  bestPeak: number | null
  haymakers: number
}

export interface SignatureMoment {
  title: string
  detail: string
}

export interface PressRow {
  name: string
  articles: number
  pos: number
  neg: number
  narrative?: string | null
}

export interface Outing {
  result: string
  opponent: string
  opponentId?: string
  score: string
  battleId?: string
}

interface CharacterSheetProps {
  name: string
  portrait: string
  portraits?: string[] // multiple profiles — variant strip, click to swap
  cityName?: string
  cityBackdrop?: string
  tierLabel?: string
  record?: string
  elo?: number
  level?: number
  styleTags?: string[]
  league?: LeagueInfo
  lineage?: LineageEntry[]
  groups: AttrGroup[]
  badges?: BadgeInfo[]
  netEffects?: NetEffect[]
  /** extra chips under RANGE/FLOOR in the radar rail (career stats etc.) */
  sideStats?: SideStat[]
  /** "FIGHTING OUT OF ..." line under the style tags */
  homeLine?: string
  /** wire (social) handle, shown with the home line */
  wireHandle?: string
  /** walking-around money — renders as a THE BAG id plate */
  bag?: number | null
  /** last-5 results, most recent first ('W' | 'L') — FORM strip under the radar */
  form?: string[]
  /** danger line under the radar: bodies / round win rate / career-best peak */
  danger?: DangerLine | null
  /** career-high ticket under the radar */
  signature?: SignatureMoment | null
  /** top rivalry file plate in the left column */
  rival?: RivalFile | null
  /** which bloggers cover them and how they lean — fills the league column */
  press?: PressRow[]
  /** last few battles — always-available filler for the league column */
  outings?: Outing[]
}

type Grade = "S" | "A" | "B" | "C" | "D"

// grade code: S gold · A green · B blue · C yellow · D red (dossier legend)
function gradeOf(v10: number): Grade {
  if (v10 >= 8.5) return "S"
  if (v10 >= 7.5) return "A"
  if (v10 >= 6.5) return "B"
  if (v10 >= 5) return "C"
  return "D"
}

function to10(row: AttrRow, scale10?: boolean): number {
  return scale10 ? row.value : row.value / 10
}

function fmt10(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

/** Segmented gauge colored by TIER REGION (LOW/MID/TOP/GOD), pips at 3/6/9. */
function SegGauge({ v10 }: { v10: number; grade?: Grade }) {
  const filled = Math.round(Math.max(0, Math.min(10, v10)))
  return (
    <div className="fs-seg">
      {Array.from({ length: 10 }).map((_, i) => {
        const meta = TIER_META[tierForCell(i)]
        return (
          <i
            key={i}
            className={i === 2 || i === 5 || i === 8 ? "notch" : undefined}
            style={{ background: i < filled ? meta.cell : meta.faint }}
          />
        )
      })}
    </div>
  )
}

/** FIGHT SHAPE — six-axis radar giving the battler an instantly readable silhouette. */
function FightShape({ axes }: { axes: { label: string; v10: number }[] }) {
  const size = 190
  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - 26
  const pt = (i: number, r: number) => {
    const a = (Math.PI * 2 * i) / axes.length - Math.PI / 2
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  }
  const ring = (frac: number) =>
    axes.map((_, i) => pt(i, R * frac).join(",")).join(" ")
  const shape = axes.map((ax, i) => pt(i, (R * Math.max(0.08, ax.v10)) / 10).join(",")).join(" ")
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: 230, margin: "0 auto", display: "block" }}>
      {[1, 0.66, 0.33].map((f) => (
        <polygon key={f} points={ring(f)} fill="none" stroke="#2E2F35" strokeWidth="1" />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, R)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#2E2F35" strokeWidth="1" />
      })}
      <polygon points={shape} fill="rgba(245,115,26,.28)" stroke="#F5731A" strokeWidth="2" strokeLinejoin="round" />
      {axes.map((ax, i) => {
        const [x, y] = pt(i, (R * Math.max(0.08, ax.v10)) / 10)
        return <circle key={i} cx={x} cy={y} r="3" fill="#F5731A" stroke="#0F0F12" strokeWidth="1.5" />
      })}
      {axes.map((ax, i) => {
        const [x, y] = pt(i, R + 15)
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#A6A8B0"
            style={{ font: "700 7.5px Rajdhani, sans-serif", letterSpacing: ".08em", textTransform: "uppercase" }}
          >
            {ax.label.toUpperCase()} {fmt10(ax.v10)}
          </text>
        )
      })}
    </svg>
  )
}

const RADAR_PICKS = ["Lyricism", "Wordplay", "Flow", "Stage Presence", "Crowd Control", "Resilience"]

/**
 * Flyer System character sheet v2 (Codex collab) — dossier-grade identity masthead,
 * Fight Shape radar, graded notched attribute matrix, league lineage, badge jewels.
 * See docs/design/flyer-system/DESIGN_LANGUAGE.md
 */
export function CharacterSheet({
  name,
  portrait,
  portraits = [],
  cityName,
  cityBackdrop,
  tierLabel,
  record,
  elo,
  level,
  styleTags = [],
  league,
  lineage = [],
  groups,
  badges = [],
  netEffects = [],
  sideStats = [],
  homeLine,
  wireHandle,
  bag = null,
  form = [],
  danger = null,
  signature = null,
  rival = null,
  press = [],
  outings = [],
}: CharacterSheetProps) {
  const variants = portraits.length > 1 ? portraits : []
  const [activePortrait, setActivePortrait] = useState(0)
  const shownPortrait = variants.length > 0 ? variants[activePortrait] ?? variants[0] : portrait
  // radar axes + range/floor from all rows
  const all: { label: string; v10: number }[] = groups.flatMap((g) =>
    g.rows.map((r) => ({ label: r.label, v10: to10(r, g.scale10) })),
  )
  const axes = RADAR_PICKS.map((p) => all.find((a) => a.label.toLowerCase().startsWith(p.toLowerCase()))).filter(
    Boolean,
  ) as { label: string; v10: number }[]
  const best = all.reduce((m, a) => (a.v10 > m.v10 ? a : m), all[0])
  const worst = all.reduce((m, a) => (a.v10 < m.v10 ? a : m), all[0])

  return (
    <div className="fs fs-sheet">
      <div className="fs-bigport fs-ticks">
          <div className="fs-portwrap">
            {cityBackdrop && (
              <img
                className="fs-bg"
                src={cityBackdrop}
                alt=""
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = "none"
                }}
              />
            )}
            {cityName && <span className="fs-cityback">{cityName}</span>}
            <img className="fs-pf" src={shownPortrait} alt={name} style={portraitFillStyle(shownPortrait, { fit: "coverTop", targetW: 1.0 })} />
            {variants.length > 0 && (
              <div className="fs-variants">
                {variants.map((v, i) => (
                  <button
                    key={v}
                    className={`vt${i === activePortrait ? " on" : ""}`}
                    onClick={() => setActivePortrait(i)}
                    title={i === 0 ? "Primary" : `Profile ${i + 1}`}
                  >
                    <img src={v} alt="" style={portraitFillStyle(v, { fit: "coverTop", targetW: 1.0 })} />
                  </button>
                ))}
                <span className="lab">
                  {activePortrait + 1}/{variants.length}
                </span>
              </div>
            )}
          </div>
          <div className="fs-cap">
            <h2 className="nm">{name}</h2>
            <div className="fs-idplates">
              {tierLabel && (
                <span className="p">
                  <span className="k">Tier</span>
                  <span className="v">{tierLabel.replace(/\s*TIER\s*/i, "")}</span>
                </span>
              )}
              {record && (
                <span className="p">
                  <span className="k">Record</span>
                  <span className="v">{record}</span>
                </span>
              )}
              {elo != null && (
                <span className="p">
                  <span className="k">ELO</span>
                  <span className="v pix">{elo}</span>
                </span>
              )}
              {level != null && (
                <span className="p">
                  <span className="k">Level</span>
                  <span className="v">{String(level).padStart(2, "0")}</span>
                </span>
              )}
              {bag != null && (
                <span className="p">
                  <span className="k">The Bag</span>
                  <span className="v pix" style={{ color: "#E7B23C" }}>
                    ${bag.toLocaleString()}
                  </span>
                </span>
              )}
            </div>
            {styleTags.length > 0 && (
              <div className="fs-chips" style={{ marginTop: 10 }}>
                {styleTags.slice(0, 4).map((t) => (
                  <span className="fs-chip loc" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            {/* STYLE DNA — who they are, where they fight out of */}
            {(homeLine || wireHandle) && (
              <div style={{ marginTop: 10 }}>
                {homeLine && (
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                    FIGHTING OUT OF <span className="text-zinc-100 font-bold">{homeLine}</span>
                  </p>
                )}
                {wireHandle && (
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500 mt-1">
                    ON THE WIRE <span className="text-[#F5731A]">@{wireHandle.replace(/^@/, "")}</span>
                  </p>
                )}
              </div>
            )}
            {/* RIVALRY FILE — the beef a fan asks about first */}
            {rival && (
              <div
                className="mt-3 p-3 bg-[#101114] border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,.4)]"
                style={{ borderTop: "3px solid #E23A2E" }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                    Top Rival
                  </span>
                  {rival.record && (
                    <span style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "#F4F4F6" }}>
                      H2H {rival.record}
                    </span>
                  )}
                </div>
                <div
                  className="text-zinc-100 uppercase leading-none mt-1"
                  style={{ fontFamily: "var(--font-poster)", fontSize: 20, textShadow: "2px 2px 0 #000" }}
                >
                  {rival.name}
                </div>
                <div className="fs-seg" style={{ marginTop: 8 }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <i
                      key={i}
                      className={i === 2 || i === 5 || i === 8 ? "notch" : undefined}
                      style={
                        i < Math.round(Math.max(0, Math.min(100, rival.intensity)) / 10)
                          ? { background: "linear-gradient(180deg,#e86458,#a5281e)" }
                          : undefined
                      }
                    />
                  ))}
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600 mt-1">
                  HOSTILITY {rival.intensity}/100
                </p>
              </div>
            )}
        </div>
      </div>

      <div>
        <div className="fs-sheet2-top">
          <div className="fs-radarwrap">
            <div className="flex flex-col min-w-0">
              <div className="hd">
                Fight Shape <span className="sub">// SIGNATURE</span>
              </div>
              {axes.length >= 3 ? <FightShape axes={axes} /> : null}
              {/* FORM & DANGER — how dangerous they are right now */}
              {form.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 shrink-0">
                      Last {form.length}
                    </span>
                    <div className="flex gap-1.5">
                      {form.map((r, i) => (
                        <span
                          key={i}
                          className="w-6 h-6 grid place-items-center border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,.45)]"
                          style={{
                            fontFamily: "var(--font-poster)",
                            fontSize: 13,
                            color: "#0F0F12",
                            background:
                              r === "W"
                                ? "linear-gradient(180deg,#3fd67e,#1c7a3f)"
                                : "linear-gradient(180deg,#e86458,#a5281e)",
                            opacity: i === 0 ? 1 : 0.82,
                          }}
                          title={i === 0 ? "Most recent" : undefined}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {danger && (
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400 mt-2">
                  <span className="text-[#F5731A] font-bold">{danger.bodies}</span> {danger.bodies === 1 ? "BODY" : "BODIES"}
                  {" · "}
                  <span className="text-zinc-100 font-bold">{danger.roundWinRate}%</span> ROUNDS
                  {danger.haymakers > 0 && (
                    <>
                      {" · "}
                      <span className="text-[#E7B23C] font-bold">{danger.haymakers}</span> HAYMAKER{danger.haymakers === 1 ? "" : "S"}
                    </>
                  )}
                </p>
              )}
              {/* SIGNATURE MOMENT — the career-high ticket */}
              {signature && (
                <div
                  className="mt-2 px-3 py-2 bg-[#1c1409] border border-[#E7B23C]/40"
                  style={{ borderLeft: "3px solid #E7B23C" }}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#E7B23C]">
                    {signature.title}
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-300 mt-0.5">
                    {signature.detail}
                  </p>
                </div>
              )}
            </div>
            <div className="fs-radar-side">
              <div className="fs-statchip">
                <div className="k">Range</div>
                <div className="v">{fmt10(best?.v10 ?? 0)}</div>
                <div className="s">highest / {best?.label.toLowerCase()}</div>
              </div>
              <div className="fs-statchip" style={{ borderLeftColor: "var(--fs-red)" }}>
                <div className="k">Floor</div>
                <div className="v">{fmt10(worst?.v10 ?? 0)}</div>
                <div className="s">lowest / {worst?.label.toLowerCase()}</div>
              </div>
              {sideStats.map((st) => (
                <div className="fs-statchip" key={st.k} style={st.color ? { borderLeftColor: st.color } : undefined}>
                  <div className="k">{st.k}</div>
                  <div className="v">{st.v}</div>
                  {st.s && <div className="s">{st.s}</div>}
                </div>
              ))}
            </div>
          </div>

          {(league || press.length > 0 || outings.length > 0) && (
            <div className="flex flex-col gap-3 min-w-0">
              {league && (
                <div className="fs-league" style={{ flex: "0 0 auto" }}>
                  <div className="hd">
                    <span className="t">League Affiliation</span>
                    <span className="cur">CURRENT</span>
                  </div>
                  <div className="main">
                    {league.crest && (
                      <span className="crest">
                        <img
                          src={league.crest}
                          alt={league.name}
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).style.visibility = "hidden"
                          }}
                        />
                      </span>
                    )}
                    <div>
                      <div className="nm">{league.name}</div>
                      <div className="sub">{league.subtitle ?? "Current affiliation"}</div>
                    </div>
                  </div>
                  {lineage.length > 0 && (
                    <div className="lineage">
                      <span className="lab">Career lineage</span>
                      {lineage.map((l, i) => (
                        <span className="mini" key={i} title={l.label}>
                          {l.crest && <img src={l.crest} alt={l.label ?? ""} />}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* PRESS HEAT — how the blogs lean on this battler */}
              {press.length > 0 && (
                <div className="fs-league" style={{ flex: "1 1 auto" }}>
                  <div className="hd">
                    <span className="t">Press Heat</span>
                    <span className="cur">THE BLOGS</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {press.slice(0, 4).map((p) => {
                      const lean = p.pos - p.neg
                      return (
                        <div key={p.name} className="flex items-center gap-2 min-w-0">
                          <span
                            className="flex-1 min-w-0 truncate font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-300"
                            title={p.narrative ?? undefined}
                          >
                            {p.name}
                          </span>
                          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                            {p.articles} {p.articles === 1 ? "STORY" : "STORIES"}
                          </span>
                          <span
                            className="shrink-0 px-1.5 py-0.5 border border-black"
                            style={{
                              fontFamily: "var(--font-pixel)",
                              fontSize: 9,
                              color: "#0F0F12",
                              background: lean > 0 ? "#35C46B" : lean < 0 ? "#E23A2E" : "#9CA3AF",
                            }}
                          >
                            {lean > 0 ? "RIDES" : lean < 0 ? "HATES" : "NEUTRAL"}
                          </span>
                        </div>
                      )
                    })}
                    {press[0]?.narrative && (
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 mt-1 border-t border-[#2E2F35] pt-2">
                        LATEST ANGLE: <span className="text-zinc-300">{press[0].narrative}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
              {/* RECENT OUTINGS — last results, faces drill down */}
              {outings.length > 0 && (
                <div className="fs-league" style={{ flex: "0 0 auto" }}>
                  <div className="hd">
                    <span className="t">Recent Outings</span>
                    <span className="cur">THE LEDGER</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {outings.slice(0, press.length > 0 ? 3 : 4).map((o, i) => (
                      <div key={i} className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-5 h-5 shrink-0 grid place-items-center border border-black"
                          style={{
                            fontFamily: "var(--font-poster)",
                            fontSize: 13,
                            color: "#0F0F12",
                            background:
                              o.result === "W"
                                ? "linear-gradient(180deg,#3fd67e,#1c7a3f)"
                                : "linear-gradient(180deg,#e86458,#a5281e)",
                          }}
                        >
                          {o.result}
                        </span>
                        {o.opponentId ? (
                          <a
                            href={`/battler/${o.opponentId}`}
                            className="flex-1 min-w-0 truncate font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-300 hover:text-[#F5731A] transition-colors"
                          >
                            VS {o.opponent}
                          </a>
                        ) : (
                          <span className="flex-1 min-w-0 truncate font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-300">
                            VS {o.opponent}
                          </span>
                        )}
                        <span
                          className="shrink-0"
                          style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "#F4F4F6" }}
                        >
                          {o.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {groups.map((g, gi) => {
          const avg = g.rows.reduce((s, r) => s + to10(r, g.scale10), 0) / Math.max(1, g.rows.length)
          const gGrade = gradeOf(avg)
          return (
            <div className="fs-grp2" key={g.title}>
              <div className="hd">
                <span className="n">{String(gi + 1).padStart(2, "0")}</span>
                <span className="t">{g.title}</span>
                <span className="sp" />
                <span className={`fs-gseal ${gGrade}`}>{gGrade}</span>
              </div>
              {g.rows.map((row) => {
                const v10 = to10(row, g.scale10)
                const tier = tierOf(v10)
                return (
                  <div className="fs-attr2" key={row.label}>
                    <span className="l">{row.label}</span>
                    <SegGauge v10={v10} />
                    <span
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontWeight: 700,
                        fontSize: 11,
                        letterSpacing: ".06em",
                        textAlign: "center",
                        color: tier ? TIER_META[tier].color : "#5E606A",
                      }}
                    >
                      {tier ? TIER_META[tier].label : "—"}
                    </span>
                    <span className="v">{fmt10(v10)}</span>
                  </div>
                )
              })}
            </div>
          )
        })}

        {badges.length > 0 && (
          <>
            <h3 className="fs-gt" style={{ marginBottom: 12 }}>
              Badges &amp; Effects
            </h3>
            <div className="fs-bgrid">
              {badges.map((b) => (
                <div className={`fs-badge${b.tier === "gold" ? " gold" : ""}`} key={b.name}>
                  <div className="med">
                    {b.icon ? (
                      <img
                        src={b.icon}
                        alt={b.name}
                        onError={(e) => {
                          ;(e.currentTarget as HTMLImageElement).style.visibility = "hidden"
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 44,
                          background: "radial-gradient(circle at 50% 38%, #2C261F, #17181C 72%)",
                          border: "1px solid var(--fs-line2)",
                          borderRadius: 12,
                        }}
                      >
                        {b.emoji ?? "🏅"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="bn">{b.name}</h4>
                    <span className={`fs-tier ${b.tier}`}>{b.tier.toUpperCase()}</span>
                    <div className="fs-eff">
                      {b.effects.map((ef, i) => (
                        <span className={ef.good ? "up" : "dn"} key={i}>
                          <b>{ef.delta}</b>
                          {ef.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {netEffects.length > 0 && (
          <div className="fs-net">
            <p className="pt">◤ NET EFFECT ON {name.toUpperCase()}</p>
            <div className="row">
              {netEffects.map((n) => (
                <span className="m" key={n.label}>
                  {n.label}
                  <b className={n.good ? "p" : "n"}>{n.delta}</b>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
