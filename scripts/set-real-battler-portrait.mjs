#!/usr/bin/env node
// Install likeness-pipeline candidates as a battler's official portrait set.
//
// Usage:
//   node scripts/set-real-battler-portrait.mjs <battler-id-or-stage-name> <primary.png> [alt2.png alt3.png ...] [--real-name "Name"]
//
// THE STANDARD (see docs/design/flyer-system/CREATE_A_BATTLER.md):
//   generate at 112x112 ("dark irises, visible pupils" in the prompt) →
//   upscale by an INTEGER factor only → pad transparently to the 512 roster canvas.
//
// Writes public/sprites/characters/real/<slug>[-N].png, registers each content box in
// lib/sprite-crops.json, sets avatar_url to the primary and sprite_set to the full
// variant list (multiple profiles = variety across game surfaces).

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const argv = process.argv.slice(2)
let realName
const rnIdx = argv.indexOf('--real-name')
if (rnIdx !== -1) {
  realName = argv[rnIdx + 1]
  argv.splice(rnIdx, 2)
}
const [battlerRef, ...candidates] = argv
if (!battlerRef || candidates.length === 0) {
  console.error('Usage: node scripts/set-real-battler-portrait.mjs <battler-id-or-stage-name> <primary.png> [alts...] [--real-name "Name"]')
  process.exit(1)
}

const env = fs.readFileSync('.env.local', 'utf8')
const URL_ = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim()
const KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim()
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

// find the battler
const isUuid = /^[0-9a-f-]{36}$/i.test(battlerRef)
const q = isUuid ? `id=eq.${battlerRef}` : `stage_name=ilike.${encodeURIComponent(battlerRef)}`
const rows = await (await fetch(`${URL_}/rest/v1/battlers?select=id,stage_name&${q}`, { headers: H })).json()
if (!rows.length) {
  console.error(`No battler matches "${battlerRef}"`)
  process.exit(1)
}
if (rows.length > 1) {
  console.error(`Ambiguous — matches: ${rows.map((r) => r.stage_name).join(', ')}`)
  process.exit(1)
}
const battler = rows[0]
const slug = battler.stage_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

const outDir = 'public/sprites/characters/real'
fs.mkdirSync(outDir, { recursive: true })
const cropMapPath = 'lib/sprite-crops.json'
const crops = JSON.parse(fs.readFileSync(cropMapPath, 'utf8'))

async function installOne(srcPath, suffix) {
  const outPath = path.posix.join(outDir, `${slug}${suffix}.png`)
  const srcMeta = await sharp(srcPath).metadata()
  // integer upscale only — non-integer nearest scaling wobbles pixel art
  const factor = Math.max(1, Math.floor(512 / Math.max(srcMeta.width, srcMeta.height)))
  const w = srcMeta.width * factor
  const h = srcMeta.height * factor
  await sharp(srcPath)
    .resize(w, h, { kernel: 'nearest' })
    .extend({
      top: Math.floor((512 - h) / 2),
      bottom: Math.ceil((512 - h) / 2),
      left: Math.floor((512 - w) / 2),
      right: Math.ceil((512 - w) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outPath)
  // register content box so portraitFillStyle frames it
  const meta = await sharp(outPath).metadata()
  const { info } = await sharp(outPath).trim({ threshold: 8 }).toBuffer({ resolveWithObject: true })
  const webPath = '/' + outPath.replace(/^public\//, '')
  crops[webPath] = {
    x: +((-(info.trimOffsetLeft || 0)) / meta.width).toFixed(4),
    y: +((-(info.trimOffsetTop || 0)) / meta.height).toFixed(4),
    w: +(info.width / meta.width).toFixed(4),
    h: +(info.height / meta.height).toFixed(4),
  }
  return webPath
}

const webPaths = []
for (let i = 0; i < candidates.length; i++) {
  const suffix = i === 0 ? '' : `-${i + 1}`
  webPaths.push(await installOne(candidates[i], suffix))
}
fs.writeFileSync(cropMapPath, JSON.stringify(crops))

const patch = {
  avatar_url: webPaths[0],
  sprite_set: webPaths,
  is_real: true,
  likeness_status: 'licensed',
}
if (realName) patch.real_name = realName
const res = await fetch(`${URL_}/rest/v1/battlers?id=eq.${battler.id}`, {
  method: 'PATCH',
  headers: { ...H, Prefer: 'return=representation' },
  body: JSON.stringify(patch),
})
if (!res.ok) {
  console.error('DB update failed:', await res.text())
  process.exit(1)
}
console.log(`✔ ${battler.stage_name} (${battler.id})`)
console.log(`  primary   ${webPaths[0]}`)
webPaths.slice(1).forEach((p, i) => console.log(`  variant ${i + 2} ${p}`))
console.log(`  flags     is_real=true, likeness_status=licensed${realName ? `, real_name=${realName}` : ''}`)
