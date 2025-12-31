# 🎤 Battle Rap University - Social Features Proposal

## Overview

This document outlines social features that capture battle rap culture **without traditional chat systems**. All interactions are through structured actions, voting, and public challenges.

---

## 🔥 1. CREW SYSTEM

### Concept
Players form **crews** (3-5 members) that function as informal alliances. Crews help members but also create vulnerabilities.

### How It Works

**Formation:**
- Any player can create a crew (costs reputation or in-game currency)
- Crew has a **name** and **logo** (upload in dev tools)
- Invite other players to join (max 5 members)
- Crew tag shows next to battler name everywhere

**Benefits:**
| Benefit | Description |
|---------|-------------|
| 🤝 **Prep Assistance** | Crew members can "assist" each other's prep - adds +0.5 to one prep day |
| 🏷️ **Badge Sharing** | Can temporarily "borrow" a crew member's badge effect for one battle (once per week) |
| 📢 **Cosign Call-Outs** | When you call someone out, crew members can cosign (+10% grudge intensity) |
| 💪 **Crew Challenges** | Challenge rival crews to best-of-5 series |
| 📈 **Shared Reputation** | Crew average rating displayed, builds collective prestige |

**Vulnerabilities (The Angle):**
- Being in a crew is PERMANENT on your record
- Opponents can use "crew assistance" as an angle: *"You needed help to write those bars"*
- If crew member chokes, YOUR reputation takes -2 hit
- If you leave a crew, you get "Former Crew Member" badge - can be used as angle
- **Badge: "Crew Carried"** - Earned if you win while using borrowed badge (negative reputation)

### Database Tables
```sql
CREATE TABLE crews (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE crew_members (
  crew_id UUID REFERENCES crews(id),
  user_id UUID REFERENCES auth.users(id),
  battler_id UUID REFERENCES battlers(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  PRIMARY KEY (crew_id, user_id)
);

CREATE TABLE crew_assists (
  id UUID PRIMARY KEY,
  crew_id UUID REFERENCES crews(id),
  helper_battler_id UUID REFERENCES battlers(id),
  helped_battler_id UUID REFERENCES battlers(id),
  battle_id UUID REFERENCES battles(id),
  assist_type TEXT CHECK (assist_type IN ('prep', 'badge_borrow', 'cosign')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE crew_challenges (
  id UUID PRIMARY KEY,
  challenger_crew_id UUID REFERENCES crews(id),
  target_crew_id UUID REFERENCES crews(id),
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'in_progress', 'completed')),
  wins_challenger INT DEFAULT 0,
  wins_target INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### UI Location
- **Dashboard**: Crew panel showing members, recent activity
- **Sidebar**: Crew link when in a crew
- **Battler Profile**: Crew affiliation badge
- **Battle Results**: "Assisted by [Crew Member]" notation if used

---

## 🔥 2. GRUDGE ESCALATION ENGINE

### Concept
Extend existing `battler_relationships` into a player-facing interactive system where actions fuel rivalries.

### How It Works

**Post-Battle Actions:**
After any battle, players choose a reaction:

| Winner Options | Effect |
|---------------|--------|
| 🤝 "Good Battle" | Neutral, +5 respect |
| 😤 "Run It Back" | +20 grudge, demands rematch |
| 🔥 "That Was Easy" | +30 grudge, disrespectful |
| 💀 "Career Over" | +50 grudge, maximum disrespect |

| Loser Options | Effect |
|--------------|--------|
| 🤝 "You Got Me" | Neutral, +10 respect |
| 😤 "Rematch Now" | +20 grudge, demands rematch |
| 🙄 "You Got Lucky" | +25 grudge, dismissive |
| 🔥 "I Got Robbed" | +35 grudge, controversial |

**Grudge Benefits:**
- **50+ Intensity**: Battles pay +25% more
- **75+ Intensity**: Media writes rivalry articles automatically
- **90+ Intensity**: "Grudge Match" badge opportunity, +50% payout
- **100 Intensity**: LEGENDARY RIVALRY - permanent storyline, special media coverage

**Media Reactions Fuel Grudges:**
- React 🔥 to rival's loss article: +5 grudge
- React 🤡 to rival's win article: +10 grudge
- React 💀 to rival's choke article: +15 grudge

### Database Extensions
```sql
-- Extend existing battler_relationships
ALTER TABLE battler_relationships ADD COLUMN last_action TEXT;
ALTER TABLE battler_relationships ADD COLUMN action_history JSONB DEFAULT '[]';

CREATE TABLE grudge_actions (
  id UUID PRIMARY KEY,
  relationship_id UUID REFERENCES battler_relationships(id),
  actor_battler_id UUID REFERENCES battlers(id),
  action_type TEXT NOT NULL,
  intensity_change INT NOT NULL,
  context TEXT, -- 'post_battle', 'media_reaction', 'call_out'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 👑 3. THRONE CHALLENGES

### Concept
Top 3 battlers per league sit on bronze/silver/gold thrones. Creates aspirational ranking with mandatory defenses.

### How It Works

**Throne Positions:**
| Position | Title | Perks |
|----------|-------|-------|
| #1 | 👑 King/Queen | +15% media coverage, +20% payout, special badge |
| #2 | ⚔️ Challenger | +10% media coverage, +10% payout |
| #3 | 🛡️ Gatekeeper | +5% media coverage, first to face rising stars |

**Challenge Rules:**
- Must be within **100 ELO** of throne holder to challenge
- Throne holder **MUST ACCEPT** within 48 hours or forfeit throne
- Winner takes/keeps throne
- Dethronement generates massive media coverage

**Throne Defense Streak:**
- 3 successful defenses: "Iron Throne" badge
- 5 successful defenses: "Dynasty" badge
- Lose after long reign: "Dethroned" badge (can be used as angle)

### Database Tables
```sql
CREATE TABLE throne_history (
  id UUID PRIMARY KEY,
  league_id UUID REFERENCES leagues(id),
  position INT CHECK (position IN (1, 2, 3)),
  battler_id UUID REFERENCES battlers(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  defense_count INT DEFAULT 0,
  lost_to_battler_id UUID REFERENCES battlers(id)
);

CREATE TABLE throne_challenges (
  id UUID PRIMARY KEY,
  league_id UUID REFERENCES leagues(id),
  challenger_battler_id UUID REFERENCES battlers(id),
  throne_holder_battler_id UUID REFERENCES battlers(id),
  target_position INT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'forfeited', 'completed')),
  deadline TIMESTAMPTZ,
  battle_id UUID REFERENCES battles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### UI Location
- **League Page**: Throne visualization at top
- **Rankings**: Crown icons next to throne holders
- **Dashboard**: "Challenge for Throne" button when eligible

---

## 📰 4. MEDIA REACTIONS

### Concept
Transform news articles from read-only to interactive. Players vote on accuracy, react with emojis, influence blogger reputation.

### How It Works

**Reaction Options:**
| Emoji | Meaning | Effect |
|-------|---------|--------|
| 👏 FACTS | Agree with take | Blogger credibility +1 |
| 🤡 CAP | Disagree, inaccurate | Blogger credibility -2 |
| 🔥 FIRE | Entertaining | Article trending +1 |
| 😴 MID | Boring | Article visibility -1 |
| ⚖️ DEBATABLE | Controversial | Starts discussion |

**Blogger Evolution:**
- High 👏 rate: "Trusted Source" badge
- High 🤡 rate: "Clickbait" badge, fewer article slots
- Trending articles featured on homepage
- Players can follow specific bloggers

**Social Dynamics:**
- See who reacted to articles
- "Hot Takes" section for controversial articles
- Weekly "Best Article" based on reactions

### Database Tables
```sql
CREATE TABLE article_reactions (
  id UUID PRIMARY KEY,
  article_id UUID REFERENCES news_articles(id),
  user_id UUID REFERENCES auth.users(id),
  reaction_type TEXT CHECK (reaction_type IN ('facts', 'cap', 'fire', 'mid', 'debatable')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (article_id, user_id)
);

-- Extend bloggers table
ALTER TABLE bloggers ADD COLUMN credibility_score INT DEFAULT 50;
ALTER TABLE bloggers ADD COLUMN facts_count INT DEFAULT 0;
ALTER TABLE bloggers ADD COLUMN cap_count INT DEFAULT 0;

-- Extend news_articles
ALTER TABLE news_articles ADD COLUMN reaction_counts JSONB DEFAULT '{}';
ALTER TABLE news_articles ADD COLUMN is_trending BOOLEAN DEFAULT false;
```

---

## 📢 5. CALL-OUT BOARD (Bonus Feature)

### Concept
Public challenge board where players call out other players with pre-written trash talk.

### Templates
```
🎤 "YOUR BARS ARE BASIC - PROVE ME WRONG"
🔥 "YOU AIN'T READY FOR THIS LEAGUE"
💀 "I'LL BODY YOU 3-0"
⚔️ "STOP DUCKING AND BATTLE ME"
👑 "THAT THRONE IS MINE"
```

### Response Options
- **ACCEPT**: Lock in battle with stakes
- **COUNTER**: Raise stakes or change venue
- **IGNORE**: Reputation damage, "Ducking" badge if repeated

---

## Implementation Priority

### Phase 1: Quick Wins (1-2 weeks)
1. ✅ Media Reactions - uses existing `news_articles`
2. ✅ Grudge Escalation - extends `battler_relationships`
3. ✅ Throne Challenges - uses existing `rankings`

### Phase 2: Medium Effort (2-3 weeks)
4. 📢 Call-Out Board - new table, simple UI
5. 👥 Crew System - new tables, dashboard integration

### Phase 3: Polish
6. Notifications for all social actions
7. Activity feed showing social interactions
8. Weekly leaderboards for predictions/reactions

---

## UI Design Notes

**Must Follow Existing Design Language:**
- Dark theme: `bg-zinc-950`, `bg-zinc-900`
- Borders: `border-zinc-800`, `border-zinc-700`
- Accent: `bg-orange-500`, `text-orange-400`
- Font: `font-display`, uppercase headers
- Cards: Same style as existing battler cards

**New Components Needed:**
- `CrewPanel` - Dashboard widget
- `GrudgeBar` - Visual intensity meter
- `ThroneVisualization` - 3 throne positions
- `ReactionBar` - Emoji reaction buttons
- `CallOutCard` - Challenge display

---

## Why These Features Work for Battle Rap

✅ **No chat spam** - all structured actions
✅ **Cultural authenticity** - crews, call-outs, grudges are real battle rap
✅ **Competitive** - thrones, crews create multiple competition layers
✅ **Story-driven** - grudges and media create emergent narratives
✅ **Vulnerability balance** - crews help but create angles against you
