# Secrets & Intel System

The Secrets & Intel system allows players to research opponents before battles to discover damaging information that can be used as content during the battle. This system is inspired by real battle rap culture where fighters dig into opponents' pasts for angles and personals.

## Overview

- **14 Secret Types** covering everything from snitching to fake gangster claims
- **70 Storylines** (5 per secret type) with unique discovery text and media headlines
- **Progressive Discovery** - more research days = deeper secrets unlocked
- **Risk/Reward Mechanics** - unverified secrets have higher backfire chance
- **8 Mile Defense** - some secrets can be "owned" to reduce their damage

---

## Secret Types

### Critical Severity (Damage Level 5)

| Secret | Description | Research Days | Backfire Risk |
|--------|-------------|---------------|---------------|
| **Snitch** | Known to give up information to authorities | 5 days | 15% |
| **Ghostwriter** | Doesn't write their own bars | 7 days | 10% |
| **Fake Gangster** | Lying about street cred (Rick Ross style) | 5 days | 15% |
| **Stolen Bars** | Caught using someone else's material | 3 days | 5% |
| **Filed Charges** | Pressed charges after street beef | 5 days | 10% |

### High Severity (Damage Level 4)

| Secret | Description | Research Days | Backfire Risk |
|--------|-------------|---------------|---------------|
| **Addiction** | Actively struggling with addiction | 4 days | 40% |
| **Got Pressed** | Got beat up/punked and didn't respond | 3 days | 15% |

### Medium Severity (Damage Level 3)

| Secret | Description | Research Days | Backfire Risk |
|--------|-------------|---------------|---------------|
| **Substance Abuse** | Known issues with drugs/alcohol | 3 days | 30% |
| **Shady Dealings** | Questionable business/deals | 4 days | 20% |
| **Mental Health** | Depression, anxiety struggles | 6 days | 60% |
| **Baby Mama Drama** | Child support issues, family chaos | 2 days | 25% |

### Low Severity (Damage Level 2)

| Secret | Description | Research Days | Backfire Risk |
|--------|-------------|---------------|---------------|
| **Crew Beef** | Internal conflict with crew members | 2 days | 20% |
| **No Show** | History of ducking battles | 1 day | 10% |
| **Broke** | Financial troubles, debt | 3 days | 25% |

---

## Discovery Methods

Secrets can be discovered through multiple channels:

| Method | Description | Typical Secrets |
|--------|-------------|-----------------|
| **Research** | Player spends prep days researching | Most secrets |
| **Crew** | Crew member shares intel | Snitch, Crew Beef, Shady Dealings |
| **Blogger** | Media/blogger reveals information | Fake Gangster, Stolen Bars, Pressed |
| **Social Media** | Public posts, receipts surface | Baby Mama, Broke, Substance Abuse |
| **Life Event** | Triggered by in-game events | Addiction, Mental Health |
| **Battle** | Revealed during/after a battle | Any (opponent exposes) |

---

## Research Level System

Research level is determined by prep days spent on research:

| Level | Days Required | What You Unlock |
|-------|---------------|-----------------|
| **None** | 0 days | Generic angles only. Personals = credibility risk |
| **Casual** | 1-3 days | Basic info: city, crew, loss record, public beefs |
| **Aggressive** | 4+ days | Deep info: family, secrets, embarrassing moments (+20% personals effectiveness) |

### Progressive Discovery

As you spend more research days, deeper secrets become available:

```
Day 1:  No Show, Crew Beef
Day 2:  Baby Mama Drama
Day 3:  Broke, Substance Abuse, Stolen Bars, Got Pressed
Day 4:  Shady Dealings, Addiction
Day 5:  Snitch, Fake Gangster, Filed Charges
Day 6:  Mental Health
Day 7:  Ghostwriter
```

---

## Using Secrets in Battle

### Personals vs Angles

Secrets can be used two ways:

#### Personals (Quick Hits)
- Slot into a single segment
- Lower setup time
- Good for momentum
- **70% of full impact** (crowdBonus and moraleHit)
- Best for: Quick jabs, keeping opponent off-balance

#### Angles (Narrative Arc)
- Build across multiple segments
- Each setup segment adds +15% to final impact
- Higher risk but higher reward
- Best for: Devastating finishers (like Loaded Lux's father angle vs Calicoe)

**Example - Angle Setup:**
```
Segment 1: Hint at the secret (setup)
Segment 2: Add more details (setup)
Segment 3: Full reveal (payoff)

Impact = Base Impact x (1 + 0.15 x 2 setup segments) = 130% damage
```

---

## Battle Effects

Each secret has specific effects when used:

### Crowd Reaction
How the crowd responds to the revelation:
- **+35**: Fake Gangster exposure (crowd loves fraud reveals)
- **+30**: Ghostwriter, Filed Charges
- **+25**: Snitch, Got Pressed
- **+20**: No Show
- **-5**: Mental Health (crowd doesn't like this angle)

### Opponent Morale Hit
Psychological damage to opponent:
- **-40**: Fake Gangster (career-ending level)
- **-35**: Ghostwriter, Stolen Bars, Filed Charges
- **-30**: Snitch
- **-25**: Got Pressed
- **-20**: Addiction
- **-15**: Substance Abuse, Baby Mama Drama, Shady Dealings

### Attribute Effects
Permanent reputation damage if secret becomes public:
- **Reputation**: Most secrets affect this (-1 to -4)
- **Resilience**: Snitch, Addiction, Mental Health, Got Pressed
- **Financial**: Broke, Addiction, Baby Mama Drama
- **Family**: Substance Abuse, Addiction, Mental Health, Baby Mama Drama

---

## Backfire Mechanics

Using secrets carries risk, especially without proof.

### Base Backfire Risk
Each secret has a base backfire chance (5-60%) that triggers if:
- Delivery is weak
- Opponent has strong rebuttal prepared
- Crowd doesn't buy it

### Fabrication Backfire
Making up secrets without proof has MUCH higher risk:

| Secret | Normal Backfire | Fabrication Backfire |
|--------|-----------------|---------------------|
| Snitch | 15% | 40% |
| Fake Gangster | 15% | 55% |
| Ghostwriter | 10% | 50% |
| Baby Mama Drama | 25% | 40% |
| Got Pressed | 15% | 50% |
| Broke | 25% | 35% |

### Delivery Stat Reduction
Higher delivery stat reduces backfire chance:
```
Final Backfire % = Base Backfire - (Delivery Stat x 3)
Minimum: 5%
```

**Example**: Snitch with 15% base backfire, Delivery stat of 7:
```
15% - (7 x 3) = 15% - 21% = 5% (minimum)
```

---

## "Owning" Secrets (8 Mile Defense)

Some secrets can be "owned" - the battler pre-emptively addresses them to reduce damage. Inspired by the 8 Mile finale where Eminem exposes his own weaknesses before his opponent can use them.

### Ownable Secrets

| Secret | Damage Reduction | Strategy |
|--------|------------------|----------|
| Substance Abuse | 60% | "I struggled but I'm clean now" |
| Addiction | 70% | Addressing recovery openly |
| Crew Beef | 50% | Acknowledging internal issues |
| No Show | 40% | Explaining circumstances |
| Broke | 55% | "I came from nothing" angle |
| Mental Health | 80% | Owning mental health is powerful |
| Baby Mama Drama | 45% | Taking responsibility |

### Non-Ownable Secrets
These can't be pre-empted - the damage is unavoidable:
- Snitch (you can't "own" being a snitch)
- Ghostwriter (can't own not writing your bars)
- Fake Gangster (can't own being fake)
- Stolen Bars (can't own plagiarism)
- Shady Dealings
- Filed Charges
- Got Pressed (mostly)

---

## Storylines

Each secret has 5 unique storylines that provide context and flavor:

### Storyline Components

| Component | Description |
|-----------|-------------|
| **Title** | Name of the storyline ("The Paperwork", "The Recording") |
| **Description** | What happened |
| **Discovery Method** | How the player learns about it |
| **Discovery Text** | What the player reads when they discover it |
| **Media Headline** | What gets published if it goes public |
| **Severity Modifier** | Multiplier on base damage (-0.1x to +0.3x) |

### Example: Snitch Storylines

1. **The Paperwork** (+0.2x)
   - Court documents surface showing they testified in a federal case
   - "Your research uncovers court records. The paperwork is real."

2. **The Recording** (+0.3x)
   - Audio leaks of them giving info to police during interrogation
   - "A blogger drops an audio clip. You can hear them giving up names."

3. **The Setup** (0.0x)
   - Word on the street is they set up a deal that got their homie locked
   - "Someone from your crew knows someone who was there."

4. **The Plea Deal** (-0.1x)
   - Unusually light sentence for serious charges
   - "Armed robbery but walked with probation? They definitely talked."

5. **The Victim Statement** (+0.1x)
   - Person they snitched on goes public
   - "The person who got locked up just posted receipts on IG."

---

## Integration with Prep Phase

### Where Intel Appears

The Opponent Intel Panel appears in the **Content Crafting** section of the prep page, below the Research Level Indicator.

### UI Components

1. **Research Status Bar** - Shows current research level (none/casual/aggressive)
2. **Discovered Secrets Grid** - Clickable badges for each discovered secret
3. **Secret Detail Panel** - Shows full info when a secret is selected:
   - Damage level (skull icons)
   - Crowd reaction / Morale hit / Backfire risk
   - Proof status (verified/unverified)
   - Storyline title and discovery text
4. **Locked Secrets Preview** - Grayed out secrets that need more research
5. **Action Buttons** - "Use as Personal" / "Build as Angle"

### API Endpoints

**GET `/api/battles/[id]/intel`**
Returns discovered secrets for a battle based on research days.

Response:
```json
{
  "opponentId": "uuid",
  "opponentName": "Stage Name",
  "researchDays": 3,
  "researchLevel": "casual",
  "discoveredSecrets": [
    {
      "type": "no-show",
      "discoveredAt": "2024-01-15T...",
      "discoveryMethod": "research",
      "hasProof": true,
      "storylineId": "no-show-001",
      "storylineTitle": "The No-Call No-Show",
      "discoveryText": "..."
    }
  ],
  "availableSecrets": ["crew-beef"],
  "lockedSecrets": [
    { "type": "snitch", "daysNeeded": 5 }
  ]
}
```

**POST `/api/battles/[id]/intel`**
Manually trigger secret discovery (from blogger tip, crew info, etc.)

Request:
```json
{
  "secretType": "fake-gangster",
  "discoveryMethod": "blogger",
  "storylineId": "fake-gangster-002"
}
```

---

## File Locations

| File | Purpose |
|------|---------|
| `lib/data/secrets.ts` | Secret definitions, game mechanics, helper functions |
| `lib/data/secret-storylines.ts` | All 70 storylines |
| `components/ui/secret-badge.tsx` | SecretBadge and SecretBadgeRow components |
| `components/battle-prep/opponent-intel-panel.tsx` | Main intel UI for prep phase |
| `app/api/battles/[id]/intel/route.ts` | Intel API endpoint |
| `app/dev/secrets/page.tsx` | Dev testing page for secrets |
| `public/sprites/secrets/*.png` | Secret badge sprites |

---

## Dev Testing

Visit `/dev/secrets` to:
- View all 14 secret types
- Click any secret to see full details
- View all 5 storylines per secret
- Test badge row overflow display
- See stats: types, storylines, ownable, fabricatable counts

---

## Future Enhancements

1. **Database Storage** - Store discovered intel in `battle_intel` table
2. **Crew Intel Sharing** - Crew members can provide intel between battles
3. **Blogger Integration** - Bloggers can reveal secrets in news articles
4. **Counter-Intel** - Research your OWN secrets to prepare defenses
5. **Intel Trading** - Trade secrets with other battlers
6. **Fabrication System** - Full UI for making up secrets with risk display
7. **Media Fallout** - Secrets going viral after battles
