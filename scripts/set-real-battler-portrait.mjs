#!/usr/bin/env node
// Install a chosen likeness-pipeline candidate as a battler's real in-game portrait.
//
// Usage:
//   node scripts/set-real-battler-portrait.mjs <candidate.png> <battler-id-or-stage-name> [real-name]
//
// Steps: upscale candidate (nearest) to the 512px roster convention, save to
// public/sprites/characters/real/<slug>.png, register its content box in
// lib/sprite-crops.json (so portraitFillStyle frames it), and point the
// battler's avatar_url at it (also flags is_real + likeness fields).

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const [, , candidatePath, battlerRef, realName] = process.argv
if (!candidatePath || !battlerRef) {
  console.error('Usage: node scripts/set-real-battler-portrait.mjs <candidate.png> <battler-id-or-stage-name> [real-name]')
  process.exit(1)
}

const env = fs.readFileSync('.env.local', 'utf8')
const URL_ = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim()
const KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim()
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

// 1. find the battler
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

// 2. upscale nearest by an INTEGER factor (non-integer scaling wobbles pixel art),
//    then pad with transparency to the 512px roster canvas
const outDir = 'public/sprites/characters/real'
fs.mkdirSync(outDir, { recursive: true })
const outPath = path.posix.join(outDir, `${slug}.png`)
const srcMeta = await sharp(candidatePath).metadata()
const factor = Math.max(1, Math.floor(512 / Math.max(srcMeta.width, srcMeta.height)))
const scaled = { w: srcMeta.width * factor, h: srcMeta.height * factor }
await sharp(candidatePath)
  .resize(scaled.w, scaled.h, { kernel: 'nearest' })
  .extend({
    top: Math.floor((512 - scaled.h) / 2),
    bottom: Math.ceil((512 - scaled.h) / 2),
    left: Math.floor((512 - scaled.w) / 2),
    right: Math.ceil((512 - scaled.w) / 2),
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(outPath)

// 3. register content box in the crop map (measure non-transparent bounds)
const meta = await sharp(outPath).metadata()
const { info } = await sharp(outPath).trim({ threshold: 8 }).toBuffer({ resolveWithObject: true })
const box = {
  x: +((-(info.trimOffsetLeft || 0)) / meta.width).toFixed(4),
  y: +((-(info.trimOffsetTop || 0)) / meta.height).toFixed(4),
  w: +(info.width / meta.width).toFixed(4),
  h: +(info.height / meta.height).toFixed(4),
}
const webPath = '/' + outPath.replace(/^public\//, '')
const cropMapPath = 'lib/sprite-crops.json'
const crops = JSON.parse(fs.readFileSync(cropMapPath, 'utf8'))
crops[webPath] = box
fs.writeFileSync(cropMapPath, JSON.stringify(crops))

// 4. point the battler at it
const patch = { avatar_url: webPath, is_real: true, likeness_status: 'licensed' }
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
console.log(`  portrait  ${webPath} (512px nearest from ${candidatePath})`)
console.log(`  crop box  ${JSON.stringify(box)}`)
console.log(`  flags     is_real=true, likeness_status=licensed${realName ? `, real_name=${realName}` : ''}`)
