# Crowd Sprite Categorization

**Total Sprites**: 444 crowd sprites (crowd_001 to crowd_478 with gaps)
**Audit Date**: 2025-11-26
**Status**: Initial categorization from sample audit (50+ sprites reviewed)

## Categorization System

**Format**: `crowd_[demographic]_[reaction]_[variant].png`

**Demographics**: black, white, mixed
**Reactions**: See breakdown below

---

## POSITIVE REACTIONS

### HYPE (arms up, excited, screaming)
**Description**: Extreme excitement, both arms raised, mouth open, high energy

**Black:**
- crowd_001.png → crowd_black_hype_001.png
- crowd_005.png → crowd_black_hype_002.png
- crowd_015.png → crowd_black_hype_003.png
- crowd_025.png → crowd_black_hype_004.png
- crowd_050.png → crowd_black_hype_005.png
- crowd_160.png → crowd_black_hype_006.png
- crowd_250.png → crowd_black_hype_007.png
- crowd_300.png → crowd_black_hype_008.png
- crowd_380.png → crowd_black_hype_009.png
- crowd_390.png → crowd_black_hype_010.png

**White:**
- crowd_430.png → crowd_white_hype_001.png (blonde woman, arms together)

**Mixed:**
- crowd_410.png → crowd_mixed_hype_001.png (Latino man, fists up, green jacket)
- crowd_440.png → crowd_mixed_hype_002.png (Black man in vest, fists clenched)

### CHEER (clapping, smiling, positive energy)
**Description**: Clapping, happy expression, approving

**Black:**
- crowd_020.png → crowd_black_cheer_001.png
- crowd_200.png → crowd_black_cheer_002.png
- crowd_360.png → crowd_black_cheer_003.png
- crowd_475.png → crowd_black_cheer_004.png (clapping, suit, sparkles)

### LAUGH (laughing, comedy appreciation)
**Description**: Cracking up, laughing at clever bars

**Black:**
- crowd_065.png → crowd_black_laugh_001.png (afro, pointing, animated)

### STUNNED (shocked, "oh shit" face, mind blown)
**Description**: Jaw dropped, hands to face, surprised

**Black:**
- crowd_450.png → crowd_black_stunned_001.png (hands up, shocked)
- crowd_470.png → crowd_black_stunned_002.png (shocked expression)

**White:**
- crowd_002.png → crowd_white_stunned_001.png (hands to face, shocked)

**Mixed:**
- crowd_003.png → crowd_mixed_stunned_001.png (Black woman, hands to face)

---

## NEUTRAL REACTIONS

### WATCH (arms crossed, neutral, judging)
**Description**: Arms crossed, waiting, evaluating, stone-faced

**Black:**
- crowd_105.png → crowd_black_watch_001.png
- crowd_110.png → crowd_black_watch_002.png
- crowd_115.png → crowd_black_watch_003.png
- crowd_140.png → crowd_black_watch_004.png
- crowd_150.png → crowd_black_watch_005.png
- crowd_155.png → crowd_black_watch_006.png
- crowd_240.png → crowd_black_watch_007.png
- crowd_260.png → crowd_black_watch_008.png
- crowd_370.png → crowd_black_watch_009.png
- crowd_420.png → crowd_black_watch_010.png (red hoodie, arms crossed)

### RECORD (holding phone, recording)
**Description**: Phone out, recording the moment, documenting

**Black:**
- crowd_190.png → crowd_black_record_001.png

**White:**
- crowd_010.png → crowd_white_record_001.png
- crowd_100.png → crowd_white_record_002.png
- crowd_145.png → crowd_white_record_003.png
- crowd_280.png → crowd_white_record_004.png

### THINK (hand on chin/face, considering)
**Description**: Thoughtful, hand on face, processing what they heard

**Black:**
- crowd_035.png → crowd_black_think_001.png (hand on face, mic gesture)
- crowd_055.png → crowd_black_think_002.png (hand on chin)
- crowd_095.png → crowd_black_think_003.png (hand on face, sweat drops)
- crowd_390.png → crowd_black_think_004.png (hand on chin, maroon shirt)

**Mixed:**
- crowd_260.png → crowd_mixed_think_001.png (Latino man, hand on face)

### TALK (leaning to neighbor, discussing)
**Description**: Mid-conversation, talking to neighbor about what just happened

**Mixed:**
- crowd_030.png → crowd_mixed_talk_001.png (mixed-race woman on phone)

### LISTEN (neutral, attentive, focused)
**Description**: Neutral face, paying attention but not reacting yet

**Mixed:**
- crowd_290.png → crowd_mixed_listen_001.png (mixed-race woman, animated gesture)
- crowd_310.png → crowd_mixed_listen_002.png (Black woman in purple, pointing)

---

## NEGATIVE REACTIONS

### Status: NEED TO IDENTIFY
**Expected reactions**: boo, cringe, disappointed, unimpressed, bored, leave

**Action needed**: Continue audit to find negative reaction sprites in remaining 394 sprites

---

## SPECIAL REACTIONS

### PAUSE (crowd went silent)
**Description**: Moment after a devastating bar, silence before reaction

**Status**: May need to generate new sprites

### ERUPT (entire crowd exploding)
**Description**: Chaos, everyone reacting at once

**Status**: May need to generate new sprites

### CONFUSED (didn't catch it)
**Description**: Confused face, "what did he say?"

**Status**: May need to generate new sprites

---

## Demographic Breakdown (from sample)

**Black**: ~70% of sampled sprites
**White**: ~15% of sampled sprites
**Mixed/Latino/Other**: ~15% of sampled sprites

This aligns well with battle rap demographics for different leagues.

---

## Next Steps

1. **Complete full audit** of remaining 394 sprites
2. **Identify negative reactions** (critical for low crowd scores)
3. **Determine if special reactions exist** or need to be generated
4. **Create rename script** to apply new naming convention
5. **Execute batch rename** of all categorized sprites

---

## Notes

- Most sprites have transparent backgrounds ✅
- Sprites can be overlapped to create crowd composition ✅
- Quality is consistent across all batches ✅
- Some batches have gaps in numbering (sprite sheet generation artifacts)
