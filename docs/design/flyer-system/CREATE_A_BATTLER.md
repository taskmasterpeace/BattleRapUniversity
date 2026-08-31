# CREATE-A-BATTLER — The Creative Process (spec v1, 2026-08-30)

The battler-creation experience is a **debut story**, not a settings form. Seven beats, each one a
Flyer System surface, ending in a shareable debut flyer. Designed with Codex (sheet v2 dossier) and
proven with a working photo→pixel pipeline (see `pipeline-strip.png` in this folder).

---

## The seven beats

**1. THE FACE — likeness in.**
Player uploads a photo (or skips to archetype portraits). We run the Likeness Pipeline (below) and
present **four house-style candidates** on a character-select rail (same grid language as
`/roster/sign`). Pick one → it becomes `battlers.avatar_url`. Photo consent + `likeness_status`
recorded ('none' | 'pending' | 'verified' for real battlers).

**2. THE NAME — the plate.**
Type the stage name; it renders LIVE in fat Anton on the nameplate over the chosen portrait
(the exact hero treatment — wraps to 2 lines, dark shadow). Optional `real_name` for verified-likeness battlers.

**3. THE CITY — everybody's from somewhere.**
Pick the hometown from the cities table (16 pixel skylines exist). The backdrop + the big ghosted
city wordmark snap in behind the portrait as you browse — origin is identity AND mechanics
(home-city advantage). Sets `hometown_city_id` (+`current_city_id`).

**4. THE ORIGIN — how you came up.**
Existing origin system (Text Forums / App Camera / Crew) presented as three story cards with
attribute deltas shown as green/red chips (the badge-effect language).

**5. THE SHAPE — allocate the fight.**
Attribute allocation rendered as the **Fight Shape radar morphing live** while points go into the
graded gauges (grade letters + category seals react in real time). The player literally sculpts
their silhouette. Uses the standard 1–10 allocation rules.

**6. THE STYLE — tags & league.**
Style tags as plates; starting league picked from underground tier — league **crest** (sprites
`league_089–096`, `lib/league-crests.ts`) slots into the LEAGUE AFFILIATION plate.

**7. THE DEBUT — the reveal.**
Everything composes into (a) the full **Character Sheet v2 dossier** and (b) a **"WHO'S NEXT?"
silhouette flyer that flips to the debut headliner flyer** with their name — the announcement
moment. CTA: "ENTER THE CIRCUIT". (Flyer engine: `components/battle/battle-flyer.tsx`.)

---

## The Likeness Pipeline — THE STANDARD (v3, owner-approved "I LOVE these")

Input: one head-and-shoulders photo. Output: a transparent-bg house-style **portrait set**.

1. **Prep** — face-crop via sharp `position: attention`, ≤256px JPEG q60–72 (keep base64 ≤~8K chars).
2. **(Preview) Faithful pass** — PixelLab `image_to_pixelart` `faithful=true, init_image_strength≈200` → instant "you, in pixels".
3. **House-style pass** — PixelLab `create_image_pro`:
   - **size 112×112** — the measured house density (roster grid elbow ≈96–128; 80px kills the eyes, 128 reads fine-grained)
   - `description` MUST include **"clear well-defined eyes with dark irises and visible pupils"** + "transparent background"
   - `reference_images=[{photo, usage:"character likeness — match this exact person's …"}]`
   - `style_image` = quantized roster bust (≤96px, ≤12 colors)
   - → 4 candidates (~2–5 min, $0 on subscription)
4. **Display/scale law** — pixel art scales by **INTEGER factors only** (112 → 448 @4×; pad transparently to the 512 canvas). Non-integer nearest = wobble.
5. **Install the SET** — `node scripts/set-real-battler-portrait.mjs <battler> <primary.png> [alts...]`:
   writes `public/sprites/characters/real/<slug>[-N].png`, registers crop boxes, sets `avatar_url`
   (primary) + **`sprite_set` (all variants)**.

### Multiple profiles (variety)
Every battler can carry a **portrait set** (`battlers.sprite_set`), not one face: primary for identity
surfaces, alternates for variety — battle screens, flyers, feed moments. The Character Sheet shows a
clickable **PROFILE 1/N** variant strip. First real set: Tru Foe ×4 (1 = primary, 3 = battle face).

Gotchas already paid for: MCP truncates big base64 args → keep payloads small (photo ≤256px q70,
style image ≤96px palette-quantized) or call the HTTP API from a script (`scripts/pixellab-gen.mjs`
pattern, `/generate-image-v2`). PixelLab cannot read localhost URLs — inline base64 only.
Proof artifacts in this folder: `pipeline-source-photo.jpg` → `pipeline-faithful-128.png` →
`pipeline-housestyle-{0..3}.png`, composite `pipeline-strip.png`.

## Real-battler (verified likeness) lane
Same pipeline, plus: `is_real=true`, `real_name`, `likeness_status='verified'` after consent.
This is the Tru Foe lane — real battlers enter the game with their own face, done respectfully.

**PROVEN ON REAL PEOPLE (2026-08-30):** ran the pipeline on actual photos —
- **Tru Foe** (video frame, black beanie/beard/puffer): 4 on-model house-style candidates → `trufoe-strip.png`, candidates `trufoe-housestyle-{0..3}.png`
- **Jesse Rican** (RapGrid frame, red polo): `jesserican-strip.png`, candidates `jesserican-housestyle-{0..3}.png`
Recipe notes that mattered: sharp `position: attention` auto-crops the face reliably from a video frame;
keep the likeness JPEG ≤ ~8K base64 chars (192-256px, q60-72) or the MCP argument gets truncated.

## Build order (when we implement)
1. API: `POST /api/battler/likeness` (upload → runs passes 2–3, returns preview + 4 candidates).
2. Rebuild `/onboarding` as the seven beats (reuses BattlerHero/CharacterSheet/BattleFlyer/crest helpers).
3. Debut flyer share-image export (canvas render of the headliner flyer).
