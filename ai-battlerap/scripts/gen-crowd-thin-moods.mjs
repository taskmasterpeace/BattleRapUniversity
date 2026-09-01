#!/usr/bin/env node
// Thicken the THIN crowd-reaction rows (owner note 2026-08-31: "we got two of
// the same"): laugh x3 / talk x2 / nod x3 / dismiss x3 / boo x3 were repeating
// on screen. Generates new 112x128 bodies on chroma green using the house
// crowd sheet as style reference; install + key + tag with
// install-crowd-thin-moods.mjs afterwards.
import fs from 'node:fs';
import path from 'node:path';

const API_KEY = process.env.PIXELLAB_API_KEY || '8a33c429-1ea4-489b-aa2d-0587bbfdd885';
const BASE = 'https://api.pixellab.ai/v2';
const STYLE_REF = path.resolve(import.meta.dirname, '../../raw images/crowd/image_1764197014144.png');
const MANIFEST = path.resolve(import.meta.dirname, '../.crowd-thin-jobs.json');

// mood + demo + gender are the tags crowd-family.json needs at install time.
// Owner requests baked in (2026-08-31): dreads, baseball caps (forward AND
// backwards), somebody holding a water bottle.
const WAVE = [
  { file: 'laugh_004', mood: 'laugh', demo: 'urban', gender: 'male', desc: 'Black man with long dreads doubled over laughing hard, one hand pointing at the stage, the other slapping his knee, big open grin' },
  { file: 'laugh_005', mood: 'laugh', demo: 'urban', gender: 'female', desc: 'Black woman cracking up, head thrown back cackling, hand flat on her chest, hoop earrings' },
  { file: 'laugh_006', mood: 'laugh', demo: 'non_urban', gender: 'male', desc: 'white man in flannel and a backwards baseball cap crying laughing, wiping a tear from his eye with one finger, shoulders shaking' },
  { file: 'laugh_007', mood: 'laugh', demo: 'foreign', gender: 'female', desc: 'woman in a football scarf laughing loud, bent slightly forward, hand over her mouth mid-burst' },
  { file: 'talk_003', mood: 'talk', demo: 'urban', gender: 'male', desc: 'two Black men turned toward each other mid-argument about the round, one with short dreads pointing at the stage, the other in a baseball cap waving him off' },
  { file: 'talk_004', mood: 'talk', demo: 'non_urban', gender: 'female', desc: 'two women side by side debating, one leaning to whisper loud in the other ear, the listener frowning skeptical' },
  { file: 'talk_005', mood: 'talk', demo: 'urban', gender: 'male', desc: 'Black man turned to his friend holding up two fingers making his case, friend holding a water bottle shaking his head no' },
  { file: 'nod_004', mood: 'nod', demo: 'urban', gender: 'male', desc: 'Black man with dreads tied up nodding hard with eyes closed, fist pressed to his mouth, feeling the bar land' },
  { file: 'nod_005', mood: 'nod', demo: 'urban', gender: 'female', desc: 'Black woman nodding slow with respect, one finger pointing up at the stage, impressed face' },
  { file: 'nod_006', mood: 'nod', demo: 'non_urban', gender: 'male', desc: 'older white man with gray beard and a forward baseball cap nodding deep, stroking his chin, connoisseur approval' },
  { file: 'dismiss_004', mood: 'dismiss', demo: 'urban', gender: 'male', desc: 'Black man in a backwards baseball cap waving one hand dismissively turning his face away, get-outta-here expression' },
  { file: 'dismiss_005', mood: 'dismiss', demo: 'non_urban', gender: 'female', desc: 'woman with arms half-raised pushing both palms out, nah gesture, unimpressed scowl' },
  { file: 'boo_004', mood: 'boo', demo: 'urban', gender: 'female', desc: 'Black woman booing loud with both hands cupped around her mouth, angry jeering face' },
  { file: 'boo_005', mood: 'boo', demo: 'non_urban', gender: 'male', desc: 'man in a baseball cap jeering with both thumbs pointed down, mouth open booing' },
  { file: 'oooh_007', mood: 'oooh', demo: 'urban', gender: 'male', desc: 'Black man with shoulder-length dreads, both hands on top of his head, mouth wide open in shock, the OOOH face' },
  { file: 'hype_017', mood: 'hype', demo: 'urban', gender: 'male', desc: 'Black man in a backwards baseball cap jumping with both fists up screaming in celebration' },
  { file: 'watch_010', mood: 'watch', demo: 'urban', gender: 'male', desc: 'Black man standing locked in watching, sipping from a plastic water bottle, judging face' },
  { file: 'watch_011', mood: 'watch', demo: 'urban', gender: 'female', desc: 'Black woman with long dreads arms crossed watching hard, one eyebrow raised, show-me face' },
];

function pngSize(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const styleBuf = fs.readFileSync(STYLE_REF);
const styleImage = {
  image: { type: 'base64', base64: styleBuf.toString('base64'), format: 'png' },
  size: pngSize(styleBuf),
};

async function submit(item) {
  const description = `battle rap crowd member, waist-up pixel art bust, ${item.desc}, streetwear, vibrant colors, hard black outlines, flat bright green chroma key background, no text`;
  const res = await fetch(`${BASE}/generate-image-v2`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description,
      image_size: { width: 112, height: 128 },
      style_image: styleImage,
      style_options: { color_palette: true, outline: true, detail: true, shading: true },
    }),
  });
  if (!res.ok) return { ...item, error: `HTTP ${res.status}: ${(await res.text()).slice(0, 160)}` };
  const data = await res.json();
  const jobId = data.job_id ?? data.id ?? data.background_job_id;
  return jobId ? { ...item, jobId } : { ...item, error: 'no job id' };
}

// The API allows 8 concurrent renders — submit in waves of 6 to stay clear.
const out = [];
for (let i = 0; i < WAVE.length; i += 6) {
  const chunk = WAVE.slice(i, i + 6);
  const results = await Promise.all(chunk.map(submit));
  out.push(...results);
  for (const r of results) console.log(r.jobId ? `submitted ${r.file} -> ${r.jobId}` : `FAIL ${r.file}: ${r.error}`);
  if (i + 6 < WAVE.length) await new Promise((r) => setTimeout(r, 20000));
}
fs.writeFileSync(MANIFEST, JSON.stringify(out, null, 2));
console.log(`manifest -> ${MANIFEST} (${out.filter((o) => o.jobId).length}/${WAVE.length} submitted)`);
