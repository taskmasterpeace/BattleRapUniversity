/**
 * Portrait framing audit + crop-map generator for the Flyer System.
 *
 * The pixel bust sprites have inconsistent transparent padding, so under a naive
 * bottom-anchored fill some portraits float. This measures each sprite's real
 * content bounding box (non-transparent pixels) and emits a map the portrait
 * component consumes to FILL the frame consistently (shoulders to the bottom).
 *
 * Output:
 *   - lib/sprite-crops.json  → { [webPath]: { x, y, w, h } }  (content box as 0..1 fractions)
 *   - console audit          → floaters / unusable sprites / stats
 *
 * Run: npx tsx scripts/audit-portrait-crops.ts [limit]
 */
import sharp from "sharp"
import fs from "fs"
import path from "path"

const ROOT = process.cwd()
const SCAN_DIRS = ["public/sprites/characters", "public/images"]
const SPRITE_RE = /sprite[-_]\d+\.png$/i
const LIMIT = process.argv[2] ? parseInt(process.argv[2], 10) : Infinity

type Box = { x: number; y: number; w: number; h: number }
type Row = {
  webPath: string
  box: Box | null
  bottomGap: number
  topGap: number
  fillH: number
  fillW: number
  bad: boolean
  reason?: string
}

function walk(rel: string, acc: string[] = []): string[] {
  const full = path.join(ROOT, rel)
  if (!fs.existsSync(full)) return acc
  for (const e of fs.readdirSync(full, { withFileTypes: true })) {
    const child = path.posix.join(rel, e.name)
    if (e.isDirectory()) walk(child, acc)
    else if (SPRITE_RE.test(e.name)) acc.push(child)
  }
  return acc
}

const toWebPath = (rel: string) => "/" + rel.replace(/^public\//, "")

async function analyze(rel: string): Promise<Row> {
  const abs = path.join(ROOT, rel)
  const webPath = toWebPath(rel)
  try {
    const meta = await sharp(abs).metadata()
    const W = meta.width || 512
    const H = meta.height || 512
    const { info } = await sharp(abs).trim({ threshold: 8 }).toBuffer({ resolveWithObject: true })
    const left = -(info.trimOffsetLeft || 0)
    const top = -(info.trimOffsetTop || 0)
    const cw = info.width
    const ch = info.height
    const box: Box = { x: +(left / W).toFixed(4), y: +(top / H).toFixed(4), w: +(cw / W).toFixed(4), h: +(ch / H).toFixed(4) }
    const bottomGap = +(1 - (box.y + box.h)).toFixed(4)
    const topGap = +box.y.toFixed(4)
    // "bad" = content too small (mostly whitespace) or absurd aspect
    const bad = box.h < 0.42 || box.w < 0.3
    return {
      webPath,
      box,
      bottomGap,
      topGap,
      fillH: box.h,
      fillW: box.w,
      bad,
      reason: bad ? "content too small / whitespace" : undefined,
    }
  } catch (e) {
    return { webPath, box: null, bottomGap: 0, topGap: 0, fillH: 0, fillW: 0, bad: true, reason: "fully transparent / unreadable" }
  }
}

async function main() {
  const files = SCAN_DIRS.flatMap((d) => walk(d)).slice(0, LIMIT)
  console.log(`Scanning ${files.length} sprite files...`)

  const rows: Row[] = []
  let done = 0
  for (const f of files) {
    rows.push(await analyze(f))
    if (++done % 200 === 0) console.log(`  ...${done}/${files.length}`)
  }

  // Build map
  const map: Record<string, Box> = {}
  for (const r of rows) if (r.box) map[r.webPath] = r.box
  fs.writeFileSync(path.join(ROOT, "lib/sprite-crops.json"), JSON.stringify(map, null, 0))

  // Audit
  const usable = rows.filter((r) => r.box && !r.bad)
  const floaters = usable.filter((r) => r.bottomGap > 0.06).sort((a, b) => b.bottomGap - a.bottomGap)
  const badOnes = rows.filter((r) => r.bad)
  const avgFillH = usable.reduce((s, r) => s + r.fillH, 0) / (usable.length || 1)
  const avgBottomGap = usable.reduce((s, r) => s + r.bottomGap, 0) / (usable.length || 1)

  console.log("\n===== PORTRAIT FRAMING AUDIT =====")
  console.log(`Total sprites          : ${rows.length}`)
  console.log(`Usable                 : ${usable.length}`)
  console.log(`Unusable (regen needed): ${badOnes.length}`)
  console.log(`Floaters (bottomGap>6%): ${floaters.length}  (these need the crop map to not float)`)
  console.log(`Avg content height     : ${(avgFillH * 100).toFixed(1)}% of canvas`)
  console.log(`Avg bottom gap         : ${(avgBottomGap * 100).toFixed(1)}% of canvas`)
  console.log(`\nWorst 12 floaters:`)
  for (const r of floaters.slice(0, 12)) console.log(`  ${(r.bottomGap * 100).toFixed(1).padStart(5)}% gap  ${r.webPath}`)
  console.log(`\nUnusable sprites (first 12):`)
  for (const r of badOnes.slice(0, 12)) console.log(`  ${r.reason?.padEnd(28)}  ${r.webPath}`)
  console.log(`\nWrote lib/sprite-crops.json (${Object.keys(map).length} entries).`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
