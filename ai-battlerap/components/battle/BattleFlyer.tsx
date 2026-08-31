"use client"

import { portraitFillStyle } from "@/lib/sprite-crops"

export interface FlyerFighter {
  name: string
  portrait?: string
  silhouette?: boolean // unrevealed opponent — render blacked-out
  cornerTag?: string // e.g. "RED CORNER"
}

export interface UndercardBout {
  a: string
  b: string
  aPortrait?: string
  bPortrait?: string
}

interface BattleFlyerProps {
  eventTitle: string
  leagueLine?: string // pixel strapline above the title
  a: FlyerFighter
  b: FlyerFighter
  undercard?: UndercardBout[]
  footerLine?: string // "FRI · DEC 5 · 8PM | THE ANNEX, ATLANTA | PPV + TICKETS"
  sponsorLine?: string
  mono?: boolean // muted split for unannounced cards
}

function FighterCol({ f, tag }: { f: FlyerFighter; tag: string }) {
  const src = f.portrait || "/sprites/characters/image_1764146672519/sprite_569.png"
  return (
    <div className={`fs-fighter${f.silhouette ? " sil" : ""}`}>
      <div className="frame">
        <img src={src} alt={f.silhouette ? "???" : f.name} style={portraitFillStyle(src, { targetH: 0.98 })} />
      </div>
      <p className="nm">{f.silhouette ? "???" : f.name}</p>
      <div className="tag">{f.cornerTag ?? tag}</div>
    </div>
  )
}

/**
 * Flyer System battle poster — headliner faces + gold VS seal over a red/blue split,
 * optional undercard rows (names always shown) and event footer.
 * Silhouette fighters for unrevealed matchups; `mono` mutes the whole card.
 * See docs/design/flyer-system/DESIGN_LANGUAGE.md
 */
export function BattleFlyer({
  eventTitle,
  leagueLine,
  a,
  b,
  undercard = [],
  footerLine,
  sponsorLine,
  mono = false,
}: BattleFlyerProps) {
  return (
    <div className="fs fs-flyer">
      <div className={`split${mono ? " mono" : ""}`} />
      <div className="veil" />
      <div className="in">
        {leagueLine && <div className="league">◈ {leagueLine} ◈</div>}
        <h2 className="title">{eventTitle}</h2>
        <div className="fs-matchup">
          <FighterCol f={a} tag="RED CORNER" />
          <div className="fs-vsseal">VS</div>
          <FighterCol f={b} tag="BLUE CORNER" />
        </div>
        {undercard.length > 0 && (
          <div className="fs-under">
            {undercard.map((u, i) => (
              <div className="fs-urow" key={i}>
                <span className="sil">
                  {u.aPortrait && <img src={u.aPortrait} alt="" style={portraitFillStyle(u.aPortrait, { targetH: 1.3 })} />}
                </span>
                <span className="mm">
                  {u.a} <em>VS</em> {u.b}
                </span>
                <span className="sil">
                  {u.bPortrait && <img src={u.bPortrait} alt="" style={portraitFillStyle(u.bPortrait, { targetH: 1.3 })} />}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {(footerLine || sponsorLine) && (
        <div className="foot">
          {footerLine && <div className="d">{footerLine}</div>}
          {sponsorLine && <div className="sp">{sponsorLine}</div>}
        </div>
      )}
    </div>
  )
}

export interface TapeStat {
  label: string
  a: number // 0–100
  b: number
}

interface TaleOfTheTapeProps {
  a: { name: string; portrait?: string; record?: string; cityBackdrop?: string }
  b: { name: string; portrait?: string; record?: string; cityBackdrop?: string }
  stats: TapeStat[]
}

/** Tale-of-the-tape matchup card — corner-framed faces + opposing red/blue attribute bars. */
export function TaleOfTheTape({ a, b, stats }: TaleOfTheTapeProps) {
  const aSrc = a.portrait || "/sprites/characters/image_1764146672519/sprite_571.png"
  const bSrc = b.portrait || "/sprites/characters/image_1764146658637/sprite_655.png"
  return (
    <div className="fs fs-flyer" style={{ borderColor: "var(--fs-line)", boxShadow: "0 12px 30px rgba(0,0,0,.4)" }}>
      <div className="fs-tott">
        <h3 className="hd">◆ Tale of the Tape ◆</h3>
        <div className="top">
          <div className="ff r">
            <div className="frame">
              {a.cityBackdrop && <img className="cbg" src={a.cityBackdrop} alt="" />}
              <img src={aSrc} alt={a.name} style={portraitFillStyle(aSrc, { targetH: 1.0 })} />
            </div>
            <p className="nm">{a.name}</p>
            {a.record && <div className="rec">{a.record}</div>}
          </div>
          <div className="tvs">VS</div>
          <div className="ff b">
            <div className="frame">
              {b.cityBackdrop && <img className="cbg" src={b.cityBackdrop} alt="" />}
              <img src={bSrc} alt={b.name} style={portraitFillStyle(bSrc, { targetH: 1.0 })} />
            </div>
            <p className="nm">{b.name}</p>
            {b.record && <div className="rec">{b.record}</div>}
          </div>
        </div>
        <div className="fs-cmp">
          {stats.map((s) => (
            <div className="cr" key={s.label}>
              <div className="mb l">
                <i style={{ width: `${Math.min(100, s.a)}%` }} />
              </div>
              <div className="lab">{s.label}</div>
              <div className="mb r">
                <i style={{ width: `${Math.min(100, s.b)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
