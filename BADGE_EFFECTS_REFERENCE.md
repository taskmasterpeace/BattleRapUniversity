# Badge Effects Reference

Total Badges: **116**

---

## Effect Definitions

Before reviewing badges, here's what each effect does in the game:

### Core Stats (Applied to Simulation)
| Effect | What It Does |
|--------|--------------|
| `lyricism` | Quality of word choice, vocabulary, schemes |
| `wordplay` | Punchlines, double meanings, clever bars |
| `creativity` | Unique angles, fresh approaches |
| `flow` | Rhythm, cadence, delivery timing |
| `stagePresence` | Physical presence, body language, command of space |
| `crowdControl` | Ability to manipulate crowd energy |
| `delivery` | Voice projection, aggression, emphasis |

### Battle Modifiers
| Effect | What It Does |
|--------|--------------|
| `consistency` | Reduces variance between segments. High = even performance. Low = wild swings. |
| `adaptability` | Rebuttals, flipping opponent's material, adjusting mid-battle |
| `resilience` | Recovery from stumbles, pressure handling. **Used to calculate choke threshold - higher resilience = lower comfort threshold needed** |
| `chokeRisk` | Direct modifier to choke probability (+/- percentage per segment) |
| `crowdReaction` | Bonus to crowd response after each segment |

### Career/Meta Effects
| Effect | What It Does |
|--------|--------------|
| `fanGrowth` | Increases fan gain after battles |
| `earningsBonus` | % bonus to battle payouts |
| `stressPerDay` | Stress accumulation during prep (positive = more stress) |
| `selfAwareness` | How accurately battler perceives their readiness level |

### Prep Effects (Applied During Prep Phase)
| Effect | What It Does |
|--------|--------------|
| `researchEfficiency` | % faster research phase |
| `writingEfficiency` | % faster writing phase |
| `rehearsalEfficiency` | % faster rehearsal/performance prep |
| `restEfficiency` | % more effective rest days |
| `segmentsPerDay` | How many segments can be written per day |
| `activitiesPerDay` | How many prep activities per day |
| `lowPrepBonus` | % bonus when prep days < threshold |
| `highPrepBonus` | % bonus when prep days > threshold |
| `canFreestyle` | Can mark segments as freestyle (no writing needed) |

---

## WRITING BADGES (20)

| Badge | Name | Rarity | Effects | Notes |
|-------|------|--------|---------|-------|
| `master_wordsmith` | MASTER WORDSMITH | legendary | wordplay: +15, creativity: +10 | |
| `punchline_king` | PUNCHLINE KING | legendary | wordplay: +15, crowdReaction: +10, creativity: +5 | |
| `bar_god` | BAR GOD | legendary | lyricism: +15, wordplay: +12, crowdReaction: +8 | |
| `technical_writer` | TECHNICAL WRITER | epic | lyricism: +12, wordplay: +8 | |
| `rebuttal_king` | REBUTTAL KING | epic | adaptability: +12, wordplay: +8 | |
| `multi_syllabic` | MULTI-SYLLABIC MASTER | epic | lyricism: +12, wordplay: +6 | |
| `haymaker_specialist` | HAYMAKER SPECIALIST | epic | wordplay: +10, crowdReaction: +12 | |
| `layered_writer` | LAYERED WRITER | epic | lyricism: +10, wordplay: +10 | |
| `flip_master` | FLIP MASTER | epic | adaptability: +15, wordplay: +5 | |
| `versatile_writer` | VERSATILE WRITER | epic | adaptability: +12, creativity: +8 | |
| `angle_assassin` | ANGLE ASSASSIN | rare | creativity: +10, wordplay: +5 | |
| `scheme_specialist` | SCHEME SPECIALIST | rare | lyricism: +10, creativity: +5 | |
| `metaphor_master` | METAPHOR MASTER | rare | creativity: +10, lyricism: +5 | |
| `storyteller` | STORYTELLER | rare | creativity: +8, crowdReaction: +7 | |
| `clever_writer` | CLEVER WRITER | rare | wordplay: +10, creativity: +5 | |
| `quotable` | QUOTABLE | rare | wordplay: +8, fanGrowth: +10 | |
| `pocket_checker` | POCKET CHECKER | rare | creativity: +10, crowdReaction: +8 | |
| `structure_savant` | STRUCTURE SAVANT | rare | flow: +10, lyricism: +5 | |
| `well_researched` | WELL RESEARCHED | common | lyricism: +5, wordplay: +5 | |
| `wordsmith` | WORDSMITH | common | lyricism: +7, wordplay: +3 | |

---

## PERFORMANCE BADGES (20)

| Badge | Name | Rarity | Effects | Notes |
|-------|------|--------|---------|-------|
| `ring_general` | RING GENERAL | legendary | crowdControl: +15, stagePresence: +10 | |
| `crowd_hyper` | CROWD HYPER | legendary | crowdControl: +15, crowdReaction: +15 | |
| `crowd_silencer` | CROWD SILENCER | legendary | wordplay: +10, crowdReaction: +15 | |
| `crowd_favorite` | CROWD FAVORITE | epic | crowdControl: +15, stagePresence: +5 | |
| `energy_master` | ENERGY MASTER | epic | delivery: +12, stagePresence: +8 | |
| `crowd_reader` | CROWD READER | epic | crowdControl: +12, adaptability: +8 | |
| `stage_veteran` | STAGE VETERAN | epic | stagePresence: +10, consistency: +10 | |
| `tempo_master` | TEMPO MASTER | epic | flow: +12, delivery: +8 | |
| `moment_maker` | MOMENT MAKER | epic | crowdReaction: +12, fanGrowth: +15 | |
| `showman` | SHOWMAN | rare | stagePresence: +12, delivery: +5 | |
| `vocal_presence` | VOCAL PRESENCE | rare | delivery: +10, crowdControl: +5 | |
| `aggressive_performer` | AGGRESSIVE PERFORMER | rare | delivery: +12, stagePresence: +5 | |
| `composed` | COMPOSED | rare | consistency: +10, chokeRisk: -15 | **Anti-choke badge** |
| `intimidator` | INTIMIDATOR | rare | stagePresence: +10, delivery: +7 | |
| `charismatic` | CHARISMATIC | rare | stagePresence: +10, fanGrowth: +8 | |
| `physical_performer` | PHYSICAL PERFORMER | rare | stagePresence: +10, delivery: +5 | |
| `voice_modulator` | VOICE MODULATOR | rare | delivery: +12 | |
| `animated` | ANIMATED | common | stagePresence: +8, crowdReaction: +5 | |
| `mic_control` | MIC CONTROL | common | delivery: +8 | |
| `camera_aware` | CAMERA AWARE | common | stagePresence: +5, delivery: +5 | |

---

## REPUTATION BADGES (15)

| Badge | Name | Rarity | Effects | Notes |
|-------|------|--------|---------|-------|
| `peoples_champ` | PEOPLE'S CHAMPION | legendary | fanGrowth: +25, crowdReaction: +15, earningsBonus: +20 | |
| `draw_power` | DRAW POWER | legendary | fanGrowth: +20, earningsBonus: +25 | |
| `street_legend` | STREET LEGEND | epic | fanGrowth: +10, earningsBonus: +15 | |
| `respected_veteran` | RESPECTED VETERAN | epic | consistency: +12, fanGrowth: +8 | |
| `fan_favorite` | FAN FAVORITE | epic | fanGrowth: +15, earningsBonus: +10 | |
| `gatekeeper` | GATEKEEPER | epic | consistency: +10, earningsBonus: +8 | |
| `viral_battler` | VIRAL BATTLER | epic | fanGrowth: +18, earningsBonus: +12 | |
| `headline_maker` | HEADLINE MAKER | epic | fanGrowth: +15, stressPerDay: +1 | |
| `main_stage_ready` | MAIN STAGE READY | rare | stagePresence: +8, consistency: +7 | |
| `hype_machine` | HYPE MACHINE | rare | fanGrowth: +20 | |
| `underdog` | UNDERDOG | rare | adaptability: +10, crowdReaction: +8 | |
| `controversial` | CONTROVERSIAL | rare | fanGrowth: +15, stressPerDay: +2 | |
| `consistent_performer` | CONSISTENT PERFORMER | rare | consistency: +15 | |
| `rising_star` | RISING STAR | common | fanGrowth: +15 | |
| `underrated` | UNDERRATED | common | adaptability: +8 | |

---

## CONTENT STYLE BADGES (15)

| Badge | Name | Rarity | Effects | Notes |
|-------|------|--------|---------|-------|
| `freestyle_artist` | FREESTYLE ARTIST | epic | adaptability: +15, wordplay: +5 | |
| `lyrical_purist` | LYRICAL PURIST | rare | lyricism: +12, wordplay: +8 | |
| `entertainer` | ENTERTAINER | rare | stagePresence: +10, crowdReaction: +10 | |
| `personals_specialist` | PERSONALS SPECIALIST | rare | creativity: +10, crowdReaction: +8, stressPerDay: +1 | |
| `gun_bar_specialist` | GUN BAR SPECIALIST | rare | wordplay: +10, creativity: +7 | |
| `comedy_battler` | COMEDY BATTLER | rare | creativity: +10, crowdReaction: +12 | |
| `shock_value` | SHOCK VALUE | rare | crowdReaction: +12, stressPerDay: +2 | |
| `poet` | POET | rare | lyricism: +10, creativity: +8 | |
| `conscious_battler` | CONSCIOUS BATTLER | rare | creativity: +8, lyricism: +7 | |
| `actor` | ACTOR | rare | stagePresence: +12, delivery: +5 | |
| `aggressive_style` | AGGRESSIVE STYLE | common | delivery: +8, stagePresence: +7 | |
| `sports_bars` | SPORTS BARS KING | common | wordplay: +7, creativity: +5 | |
| `pop_culture` | POP CULTURE MASTER | common | creativity: +7, crowdReaction: +8 | |
| `battle_rapper` | TRADITIONAL BATTLE RAPPER | common | consistency: +8 | |
| `street_battler` | STREET BATTLER | common | delivery: +8, stagePresence: +5 | |

---

## MILESTONE BADGES (10)

| Badge | Name | Rarity | Effects | Notes |
|-------|------|--------|---------|-------|
| `legend` | LEGEND | legendary | consistency: +15, chokeRisk: -15, earningsBonus: +10 | 100 battles |
| `veteran` | VETERAN | epic | consistency: +10, chokeRisk: -10 | 50 battles |
| `money_maker` | MONEY MAKER | epic | earningsBonus: +15 | $100K earned |
| `journeyman` | JOURNEYMAN | rare | consistency: +5 | 25 battles |
| `undefeated_streak` | UNDEFEATED | rare | consistency: +8, fanGrowth: +10 | 5+ win streak |
| `world_traveler` | WORLD TRAVELER | rare | adaptability: +10 | 10+ cities |
| `rookie` | ROOKIE | common | (none) | 5 battles |
| `first_win` | FIRST VICTORY | common | (none) | First win |
| `ten_wins` | TEN VICTORIES | common | consistency: +3 | 10 wins |
| `bounce_back` | BOUNCE BACK | common | resilience: +5 | Won after 3+ losses |

---

## CITY BADGES (5)

| Badge | Name | Rarity | Effects | Notes |
|-------|------|--------|---------|-------|
| `new_york_king` | NEW YORK KING | epic | fanGrowth: +15, earningsBonus: +10 | |
| `la_legend` | LA LEGEND | epic | fanGrowth: +15, earningsBonus: +10 | |
| `chicago_champion` | CHICAGO CHAMPION | epic | fanGrowth: +15, earningsBonus: +10 | |
| `atlanta_ace` | ATLANTA ACE | epic | fanGrowth: +15, earningsBonus: +10 | |
| `detroit_destroyer` | DETROIT DESTROYER | epic | fanGrowth: +15, earningsBonus: +10 | |

---

## REGION BADGES (5)

| Badge | Name | Rarity | Effects | Notes |
|-------|------|--------|---------|-------|
| `east_coast_elite` | EAST COAST ELITE | legendary | fanGrowth: +20, earningsBonus: +15 | |
| `west_coast_warrior` | WEST COAST WARRIOR | legendary | fanGrowth: +20, earningsBonus: +15 | |
| `midwest_monster` | MIDWEST MONSTER | legendary | fanGrowth: +20, earningsBonus: +15 | |
| `south_sovereign` | SOUTH SOVEREIGN | legendary | fanGrowth: +20, earningsBonus: +15 | |
| `national_threat` | NATIONAL THREAT | legendary | fanGrowth: +25, earningsBonus: +20, consistency: +10 | |

---

## SPECIAL ABILITY - PREP BADGES (13)

| Badge | Name | Rarity | Effects | Prep Effects | Notes |
|-------|------|--------|---------|--------------|-------|
| `freestyle_genius` | FREESTYLE GENIUS | legendary | adaptability: +20, wordplay: +10, chokeRisk: -25 | canFreestyle, research +20%, lowPrepBonus: +15% | |
| `double_shift` | DOUBLE SHIFT | legendary | stressPerDay: +2 | activitiesPerDay: 2 | |
| `preparation_monster` | PREPARATION MONSTER | legendary | lyricism: +10, consistency: +12 | highPrepBonus: +50% (10+ days) | |
| `battle_technician` | BATTLE TECHNICIAN | legendary | lyricism: +10, consistency: +10 | research +40%, writing +25% | |
| `consummate_professional` | CONSUMMATE PROFESSIONAL | legendary | consistency: +15, chokeRisk: -4 | ALL prep +15% | |
| `photographic_memory` | PHOTOGRAPHIC MEMORY | epic | consistency: +10, chokeRisk: -10 | research +25%, rehearsal +15% | |
| `quick_writer` | QUICK WRITER | epic | lyricism: +8, creativity: +5 | writing +40%, 2 segments/day | |
| `last_minute_larry` | LAST MINUTE LARRY | epic | adaptability: +15, chokeRisk: +5 | lowPrepBonus: +30% (<3 days) | |
| `angle_master` | ANGLE MASTER | epic | creativity: +12, wordplay: +8 | research +35% | |
| `time_management_expert` | TIME MANAGEMENT EXPERT | epic | consistency: +10, stressPerDay: -2 | research +20%, writing/rehearsal +15%, rest +10%, noMultiBattleStress | |
| `team_player` | TEAM PLAYER | rare | resilience: +5 | writing +20%, research +10% | |
| `consistent_grinder` | CONSISTENT GRINDER | rare | consistency: +15 | ALL prep +10% | |
| `multitasker` | MULTITASKER | rare | adaptability: +8, chokeRisk: -2 | ALL prep +10% | |

---

## SELF-AWARENESS & MEMORIZATION BADGES (6)

| Badge | Name | Rarity | Effects | Prep Effects | Notes |
|-------|------|--------|---------|--------------|-------|
| `clutch_performer` | CLUTCH PERFORMER | legendary | selfAwareness: +2, chokeRisk: -15, resilience: +10 | (none) | **Best anti-choke badge** |
| `self_aware` | SELF-AWARE | epic | selfAwareness: +3, chokeRisk: -5, consistency: +8 | (none) | |
| `bars_on_lock` | BARS ON LOCK | epic | consistency: +12, chokeRisk: -8 | rehearsalEfficiency: +15% | |
| `gunslinger` | GUNSLINGER | epic | adaptability: +15, chokeRisk: +5, selfAwareness: -1 | lowPrepBonus: +20% | Raw talent |
| `overconfident` | OVERCONFIDENT | common | selfAwareness: -3, chokeRisk: +10, stagePresence: +5 | (none) | **NEGATIVE** |
| `overthinking` | OVERTHINKING | common | selfAwareness: -2, consistency: +5, stressPerDay: +2 | (none) | **NEGATIVE** |

---

## NEGATIVE/REMOVABLE BADGES (10)

| Badge | Name | Rarity | Effects | Removal Condition | Notes |
|-------|------|--------|---------|-------------------|-------|
| `choker` | CHOKER | common | chokeRisk: +25, consistency: -10 | 3 battles without choking | **Major choke increase** |
| `overhyped` | OVERHYPED | rare | stressPerDay: +4, chokeRisk: +15 | Win 3 battles vs top opponents | |
| `ring_rust` | RING RUST | common | consistency: -15, stagePresence: -10 | Complete 2 battles | |
| `exposed` | EXPOSED | rare | consistency: -12, adaptability: -8 | Win 2 battles | |
| `slumping` | SLUMPING | common | consistency: -10, lyricism: -5 | Win 2 battles convincingly | |
| `burned_out` | BURNED OUT | rare | creativity: -10, consistency: -10, stressPerDay: +3 | Take 3 weeks off | |
| `predictable` | PREDICTABLE | common | creativity: -12, crowdReaction: -8 | Change prep focus 2 battles | |
| `beef_distracted` | BEEF DISTRACTED | common | consistency: -8, stressPerDay: +2 | Settle beef or win 2 battles | |
| `injured` | INJURED | rare | stagePresence: -10, delivery: -8, resilience: -5 | Rest 2 weeks | |
| `controversial_loss` | CONTROVERSIAL LOSS | common | stressPerDay: +3 | Win next battle clearly | |

---

## BADGES THAT AFFECT CHOKE RISK

| Badge | Choke Effect | Net Impact | Notes |
|-------|--------------|------------|-------|
| `freestyle_genius` | -25% | Major reduction | Can improvise if forgot |
| `clutch_performer` | -15% | Major reduction | Rises under pressure |
| `composed` | -15% | Major reduction | Never rattled |
| `legend` | -15% | Major reduction | Experience |
| `veteran` | -10% | Moderate reduction | 50+ battles |
| `photographic_memory` | -10% | Moderate reduction | Better retention |
| `bars_on_lock` | -8% | Moderate reduction | Material stays locked |
| `self_aware` | -5% | Minor reduction | Knows true readiness |
| `consummate_professional` | -4% | Minor reduction | Always prepared |
| `multitasker` | -2% | Minor reduction | Good balance |
| --- | --- | --- | --- |
| `choker` | +25% | **Major increase** | Recent history |
| `overhyped` | +15% | Major increase | Pressure |
| `overconfident` | +10% | Moderate increase | False confidence |
| `gunslinger` | +5% | Minor increase | High variance |
| `last_minute_larry` | +5% | Minor increase | Less prep |

---

## BADGES USING RESILIENCE

Resilience is used for:
1. **Comfort Threshold Calculation**: Higher resilience = lower memorization % needed to feel safe
2. **Choke Recovery**: Stumbles less likely to compound
3. **Pressure Handling**: Better performance in high-stakes situations

| Badge | Resilience Effect |
|-------|-------------------|
| `clutch_performer` | +10 |
| `team_player` | +5 |
| `bounce_back` | +5 |
| `injured` | -5 (negative) |

---

## BADGES USING CONSISTENCY

Consistency reduces score variance between segments. High consistency = even performance. Low = wild swings (high peak possible but also low valleys).

| Badge | Consistency Effect |
|-------|-------------------|
| `consistent_grinder` | +15 |
| `consummate_professional` | +15 |
| `consistent_performer` | +15 |
| `legend` | +15 |
| `bars_on_lock` | +12 |
| `respected_veteran` | +12 |
| `stage_veteran` | +10 |
| `veteran` | +10 |
| `national_threat` | +10 |
| `photographic_memory` | +10 |
| `battle_technician` | +10 |
| `time_management_expert` | +10 |
| `composed` | +10 |
| `gatekeeper` | +10 |
| `self_aware` | +8 |
| `undefeated_streak` | +8 |
| `battle_rapper` | +8 |
| `main_stage_ready` | +7 |
| `journeyman` | +5 |
| `overthinking` | +5 |
| `ten_wins` | +3 |
| --- | --- |
| `ring_rust` | -15 (negative) |
| `exposed` | -12 (negative) |
| `choker` | -10 (negative) |
| `burned_out` | -10 (negative) |
| `slumping` | -10 (negative) |
| `beef_distracted` | -8 (negative) |

---

## PREP EFFECT VALUE REVIEW

| Badge | Prep Effect | Value | Notes |
|-------|-------------|-------|-------|
| `preparation_monster` | highPrepBonus | +50% | Only with 10+ days |
| `quick_writer` | writingEfficiency | +40% | |
| `battle_technician` | researchEfficiency | +40% | |
| `angle_master` | researchEfficiency | +35% | |
| `last_minute_larry` | lowPrepBonus | +30% | Only with <3 days |
| `bars_on_lock` | rehearsalEfficiency | +15% | Reduced from 30% |
| `photographic_memory` | researchEfficiency | +25% | |
| `battle_technician` | writingEfficiency | +25% | |
| `gunslinger` | lowPrepBonus | +20% | |
| `freestyle_genius` | researchEfficiency | +20% | |
| `time_management_expert` | researchEfficiency | +20% | |
| `team_player` | writingEfficiency | +20% | |
| `consummate_professional` | ALL prep | +15% | |
| `photographic_memory` | rehearsalEfficiency | +15% | |
| `freestyle_genius` | lowPrepBonus | +15% | |
| `time_management_expert` | writing/rehearsal | +15% | |
| `consistent_grinder` | ALL prep | +10% | |
| `multitasker` | ALL prep | +10% | |
| `team_player` | researchEfficiency | +10% | |
| `time_management_expert` | restEfficiency | +10% | |

---

## User's Clarification on Game Mechanics

> "Rehearsing is helping with performance. Memorizing is helping with writing. And choking is because of writing. Not not memorizing it."

### Current System Review:

**WRITING days** should:
- Create/polish segment content (bars, schemes, wordplay)
- Improve lyricism/wordplay quality scores

**REHEARSAL days** should:
- Practice delivery/performance
- Build memorization (reduce choke risk)
- Improve stage presence/delivery scores

**CHOKING** happens when:
- Material isn't memorized well enough
- Under pressure, forgot bars
- Self-awareness affects how accurately you perceive readiness

The `rehearsalEfficiency` effect currently speeds up memorization/performance prep. If this feels too strong at +30%, consider reducing to +15-20%.
