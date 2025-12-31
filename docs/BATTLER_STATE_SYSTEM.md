# Battler Life State System

## Overview

Every battler has a **Life State** - a persistent record of their current situation across multiple life domains. This state:

1. **Persists forever** - Choices have permanent consequences
2. **Affects gameplay** - Felony = no international battles
3. **Feeds storyline triggers** - State determines what stories can happen
4. **Is readable by AI** - LLMs can understand the battler's situation
5. **Tracks NPCs** - Named characters (family, partners, enemies) persist

---

## Database Schema

### Table: `battler_life_state`

```sql
CREATE TABLE battler_life_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID REFERENCES battlers(id) UNIQUE NOT NULL,

  -- LEGAL STATUS
  has_felony BOOLEAN DEFAULT false,
  felony_type TEXT,                          -- "assault", "drug possession", etc.
  on_probation BOOLEAN DEFAULT false,
  probation_ends_at TIMESTAMPTZ,
  has_pending_charges BOOLEAN DEFAULT false,
  pending_charges JSONB DEFAULT '[]',        -- ["assault", "tax evasion"]
  passport_status TEXT DEFAULT 'valid',      -- 'valid', 'expired', 'revoked', 'none'
  can_travel_international BOOLEAN DEFAULT true,

  -- FAMILY STATUS
  relationship_status TEXT DEFAULT 'single', -- 'single','dating','engaged','married','divorced','widowed'
  partner_id UUID,                           -- Reference to battler_npcs
  partner_relationship_health INTEGER DEFAULT 5, -- 0-10
  has_children BOOLEAN DEFAULT false,
  children_count INTEGER DEFAULT 0,
  custody_status TEXT,                       -- 'full', 'shared', 'none', 'child_support_only'
  mother_alive BOOLEAN DEFAULT true,
  father_alive BOOLEAN DEFAULT true,
  family_estranged BOOLEAN DEFAULT false,

  -- FINANCIAL STATUS
  in_debt BOOLEAN DEFAULT false,
  debt_amount INTEGER DEFAULT 0,
  debt_type TEXT,                            -- 'loan', 'gambling', 'taxes', 'child_support'
  has_tax_issues BOOLEAN DEFAULT false,
  bankruptcy_filed BOOLEAN DEFAULT false,

  -- HEALTH STATUS
  has_active_injury BOOLEAN DEFAULT false,
  injury_type TEXT,
  injury_severity TEXT,                      -- 'minor', 'moderate', 'severe'
  injury_heals_at TIMESTAMPTZ,
  in_rehab BOOLEAN DEFAULT false,
  has_chronic_condition BOOLEAN DEFAULT false,
  chronic_condition_type TEXT,

  -- STREET/CREW STATUS
  gang_affiliated BOOLEAN DEFAULT false,
  gang_name TEXT,
  gang_rank TEXT,                            -- 'associate', 'member', 'og'
  has_street_enemies BOOLEAN DEFAULT false,
  street_heat_level INTEGER DEFAULT 0,       -- 0-10, how much danger

  -- CAREER STATUS
  signed_to_label BOOLEAN DEFAULT false,
  label_name TEXT,
  contract_battles_remaining INTEGER,
  has_manager BOOLEAN DEFAULT false,
  manager_id UUID,                           -- Reference to battler_npcs
  has_ghostwriting_secret BOOLEAN DEFAULT false,

  -- META
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  state_version INTEGER DEFAULT 1
);
```

### Table: `battler_npcs` (Named Characters)

```sql
CREATE TABLE battler_npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID REFERENCES battlers(id) NOT NULL,

  -- Identity
  name TEXT NOT NULL,                        -- "Keisha", "Marcus", "Big Tony"
  nickname TEXT,                             -- "Your baby mama", "Your brother"
  gender TEXT NOT NULL,                      -- 'male', 'female', 'nonbinary'

  -- Relationship
  relationship_type TEXT NOT NULL,           -- see list below
  relationship_health INTEGER DEFAULT 5,     -- 0-10
  introduced_in_storyline TEXT,              -- storyline code that introduced them

  -- Status
  status TEXT DEFAULT 'active',              -- 'active', 'deceased', 'estranged', 'incarcerated'
  status_changed_at TIMESTAMPTZ,

  -- For AI context
  personality_notes TEXT,                    -- "Supportive but overbearing"
  history_summary TEXT,                      -- "Met at Summer Madness 2023, dated for 6 months"

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Relationship types:
-- Family: 'mother', 'father', 'brother', 'sister', 'grandmother', 'grandfather',
--         'aunt', 'uncle', 'cousin', 'child', 'baby_mama', 'baby_daddy'
-- Romantic: 'girlfriend', 'boyfriend', 'wife', 'husband', 'ex', 'fling'
-- Professional: 'manager', 'lawyer', 'accountant', 'label_exec', 'agent'
-- Street: 'og', 'crew_member', 'plug', 'enemy', 'rival'
-- Other: 'friend', 'mentor', 'protege'
```

### Table: `scheduled_life_events`

For timeline events (pregnancy = 8 months later, court date = 3 weeks, etc.)

```sql
CREATE TABLE scheduled_life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID REFERENCES battlers(id) NOT NULL,

  event_type TEXT NOT NULL,                  -- 'baby_birth', 'court_date', 'contract_expires'
  scheduled_for TIMESTAMPTZ NOT NULL,

  -- Context
  source_storyline_id UUID,                  -- Which storyline created this
  related_npc_id UUID REFERENCES battler_npcs(id),
  details JSONB NOT NULL,                    -- Event-specific data

  -- Status
  triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  resulting_storyline_id UUID,               -- The storyline this spawned

  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Table: `storyline_completions`

Track what storylines have been completed (so they can't repeat):

```sql
CREATE TABLE storyline_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID REFERENCES battlers(id) NOT NULL,
  storyline_code TEXT NOT NULL,

  completed_at TIMESTAMPTZ NOT NULL,
  ending_id TEXT NOT NULL,
  ending_type TEXT NOT NULL,                 -- 'positive', 'negative', 'neutral', 'catastrophic'

  -- Path tracking
  chapters_visited INTEGER NOT NULL,
  choices_made JSONB NOT NULL,               -- Full choice history
  total_prep_days_lost INTEGER DEFAULT 0,

  -- Sequel info
  unlocks_sequel TEXT,                       -- Code of sequel storyline now available
  blocks_storylines TEXT[],                  -- Codes of storylines now blocked

  -- State changes made
  state_changes_applied JSONB,               -- Record of what changed
  npcs_introduced UUID[],                    -- NPCs that were created

  UNIQUE(battler_id, storyline_code)         -- Can only complete each storyline once
);
```

---

## Gameplay Effects of State

### Legal State Effects

| State | Effect |
|-------|--------|
| `has_felony = true` | Cannot book international battles |
| `on_probation = true` | Random drug test events, curfew conflicts |
| `pending_charges = true` | Court date events interrupt prep |
| `passport_status = 'revoked'` | Cannot travel at all |

### Family State Effects

| State | Effect |
|-------|--------|
| `has_children = true` | Child-related events can trigger |
| `custody_status = 'shared'` | Custody schedule conflicts with battles |
| `partner_relationship_health < 3` | Breakup storyline can trigger |
| `family_estranged = true` | No family support events, but no family drama either |

### Financial State Effects

| State | Effect |
|-------|--------|
| `in_debt = true` | Debt collector storylines, lower earnings |
| `debt_type = 'gambling'` | Gambling addiction storylines available |
| `has_tax_issues = true` | IRS storylines, wage garnishment |
| `bankruptcy_filed = true` | Limited spending, reputation hit |

### Health State Effects

| State | Effect |
|-------|--------|
| `has_active_injury = true` | Performance penalties until healed |
| `injury_severity = 'severe'` | Must skip battles until healed |
| `in_rehab = true` | Cannot battle for duration |
| `has_chronic_condition = true` | Periodic flare-up events |

### Street State Effects

| State | Effect |
|-------|--------|
| `gang_affiliated = true` | Crew storylines available, rep bonuses in some cities |
| `street_heat_level > 7` | Safety events, can't perform in certain venues |
| `has_street_enemies = true` | Retaliation events possible |

### Career State Effects

| State | Effect |
|-------|--------|
| `signed_to_label = true` | Label storylines, can't sign elsewhere |
| `contract_battles_remaining = 0` | Contract negotiation storyline triggers |
| `has_ghostwriting_secret = true` | Exposure risk storylines |

---

## NPC Name Generation

When a storyline introduces a new character, we generate a name and persist it.

### Name Lists by Type

```typescript
const NAME_POOLS = {
  // Female names (common in battle rap community)
  female: [
    "Keisha", "Tanya", "Monique", "Jasmine", "Diamond", "Crystal",
    "Aaliyah", "Destiny", "Brianna", "Shaniqua", "Latoya", "Tamika",
    "Shonda", "Niesha", "Ebony", "Amber", "Ciara", "Tiffany",
    "Ashley", "Brittany", "Candace", "Deja", "Felicia", "Gina"
  ],

  // Male names
  male: [
    "Marcus", "Darnell", "Tyrone", "Jamal", "DeShawn", "Terrell",
    "Antoine", "Maurice", "Rashad", "Lamar", "Darius", "Malik",
    "Jerome", "Dante", "Xavier", "Keith", "Rodney", "Clarence",
    "William", "Bernard", "Curtis", "Devon", "Eric", "Frank"
  ],

  // Street names (for OGs, enemies)
  street: [
    "Big Tony", "Lil Cease", "D-Block", "Ghost", "Smoke", "Ace",
    "King", "Duke", "Trigger", "Snake", "Blade", "Ice",
    "Money Mike", "Fat Pat", "Slim Charles", "T-Bone"
  ],

  // Professional names (managers, lawyers)
  professional: [
    "David Chen", "Michael Ross", "Sarah Johnson", "Robert Williams",
    "Jennifer Martinez", "Christopher Lee", "Amanda Taylor", "James Brown"
  ]
}
```

### Name Assignment Logic

```typescript
async function assignNPCToStoryline(
  battlerId: string,
  relationshipType: string,
  storylineCode: string
): Promise<BattlerNPC> {

  // First check if this relationship already exists
  const existing = await getExistingNPC(battlerId, relationshipType)
  if (existing) return existing

  // Generate new NPC
  const gender = inferGender(relationshipType)
  const namePool = getNamePool(relationshipType, gender)
  const name = pickRandomName(namePool)

  const npc = await createNPC({
    battler_id: battlerId,
    name,
    gender,
    relationship_type: relationshipType,
    introduced_in_storyline: storylineCode
  })

  return npc
}
```

---

## Timeline Events (Pregnancy Example)

### Creating a Scheduled Event

When a pregnancy storyline reaches the "she's pregnant" chapter:

```typescript
// In the storyline effect handler
if (choice.creates_scheduled_event) {
  await createScheduledEvent({
    battler_id: battlerId,
    event_type: 'baby_birth',
    scheduled_for: addMonths(new Date(), 8), // 8 months from now
    source_storyline_id: storylineId,
    related_npc_id: partnerNpcId,
    details: {
      mother_name: partner.name,
      baby_gender: Math.random() > 0.5 ? 'boy' : 'girl',
      baby_name: null, // Generated at birth or player chooses
      pregnancy_healthy: true
    }
  })
}
```

### Checking for Due Events

Run this check regularly (after each battle, daily, etc.):

```typescript
async function checkScheduledEvents(battlerId: string) {
  const dueEvents = await supabase
    .from('scheduled_life_events')
    .select('*')
    .eq('battler_id', battlerId)
    .eq('triggered', false)
    .lte('scheduled_for', new Date().toISOString())

  for (const event of dueEvents) {
    // Trigger the appropriate storyline
    await triggerScheduledEventStoryline(battlerId, event)

    // Mark as triggered
    await supabase
      .from('scheduled_life_events')
      .update({ triggered: true, triggered_at: new Date() })
      .eq('id', event.id)
  }
}
```

### Battle Conflict Detection

Check if a scheduled event conflicts with an upcoming battle:

```typescript
async function checkEventBattleConflicts(battlerId: string, battleDate: Date) {
  // Find events within 2 weeks of battle
  const conflictWindow = {
    start: subDays(battleDate, 14),
    end: addDays(battleDate, 3)
  }

  const conflicts = await supabase
    .from('scheduled_life_events')
    .select('*')
    .eq('battler_id', battlerId)
    .eq('triggered', false)
    .gte('scheduled_for', conflictWindow.start)
    .lte('scheduled_for', conflictWindow.end)

  // For each conflict, potentially trigger a "conflict storyline"
  for (const conflict of conflicts) {
    if (conflict.event_type === 'baby_birth') {
      // Trigger "Baby vs Battle" decision storyline
      await triggerConflictStoryline(battlerId, 'BABY_VS_BATTLE', {
        battle_date: battleDate,
        event_date: conflict.scheduled_for,
        event_details: conflict.details
      })
    }
  }
}
```

---

## Image Specifications

### Recommended Aspect Ratios

| Use Case | Aspect Ratio | Dimensions | Notes |
|----------|--------------|------------|-------|
| **Main Event Image** | 16:9 | 1280x720 | Fits card layout on both mobile/desktop |
| **Choice Image** | 4:3 | 800x600 | Stacks well vertically on mobile |
| **Character Portrait** | 1:1 | 512x512 | For NPC faces |
| **Wide Banner** | 3:1 | 1200x400 | Chapter headers |
| **Mobile Full** | 9:16 | 720x1280 | Full-screen mobile moments |

### Image Naming Convention

```
storylines/{category}/{storyline_code}/{chapter_id}_{choice_id}.png

Examples:
storylines/romance/GIRLFRIEND_STORY/ch1_meet_her.png
storylines/romance/GIRLFRIEND_STORY/ch3_pregnant_reveal.png
storylines/romance/GIRLFRIEND_STORY/ch5_baby_vs_battle_choice_go.png
storylines/romance/GIRLFRIEND_STORY/ch5_baby_vs_battle_choice_battle.png
```

### Image Prompt Templates

For generating consistent images:

```
Base style: "Pixel art style, 16-bit aesthetic, urban hip-hop culture, dramatic lighting,
{scene description}, battle rap game screenshot"

Examples:
- "Pixel art style, young Black woman on phone looking worried, urban apartment background,
   dramatic lighting, battle rap game screenshot"

- "Pixel art style, hospital delivery room, new father holding baby, emotional moment,
   16-bit aesthetic, battle rap game screenshot"

- "Pixel art style, courthouse steps, man in suit looking stressed, lawyers nearby,
   urban setting, battle rap game screenshot"
```

---

## Storyline Sequels and Blocks

### Sequel System

```typescript
interface StorylineTemplate {
  code: string
  // ... other fields

  // Sequel configuration
  sequel_of?: string              // This is a sequel to another storyline
  requires_completion?: {
    storyline_code: string
    ending_types?: string[]       // Only if they got these endings
    min_days_since?: number       // Wait at least this many days
  }

  // What this storyline blocks/unlocks
  on_completion: {
    unlocks_sequels?: string[]    // These storylines become available
    blocks?: string[]             // These storylines are now blocked forever
    updates_state?: Partial<BattlerLifeState>  // State changes to apply
  }
}
```

### Example: Romance Storyline Chain

```
MEET_SOMEONE_NEW (base)
  ├── Ending: "Hit it off" → unlocks DATING_DRAMA
  └── Ending: "Not interested" → blocks all romance for 30 days

DATING_DRAMA (sequel to MEET_SOMEONE_NEW)
  ├── Ending: "Getting serious" → unlocks RELATIONSHIP_CROSSROADS
  ├── Ending: "Broke up" → unlocks REBOUND or EX_DRAMA
  └── Ending: "She cheated" → unlocks TRUST_ISSUES

RELATIONSHIP_CROSSROADS (sequel to DATING_DRAMA)
  ├── Ending: "Moved in together" → unlocks PREGNANCY_SCARE
  ├── Ending: "Keeping it casual" → storyline ends, can restart romance later
  └── Ending: "Proposed" → sets relationship_status='engaged', unlocks WEDDING_PLANNING

PREGNANCY_SCARE (sequel to RELATIONSHIP_CROSSROADS)
  ├── Ending: "False alarm" → storyline ends
  ├── Ending: "She's pregnant, keeping it" → schedules BABY_BIRTH in 8 months
  └── Ending: "She's pregnant, not keeping it" → unlocks AFTERMATH storyline

BABY_BIRTH (scheduled event, not sequel)
  ├── Ending: "Present for birth" → sets has_children=true, +family_bond
  ├── Ending: "Missed for battle" → sets has_children=true, -partner_relationship
  └── Ending: "Complications" → unlocks HEALTH_CRISIS for partner
```

---

## AI-Readable State Summary

For LLM context, generate a summary like this:

```typescript
function generateAIStateSummary(battler: Battler, state: BattlerLifeState, npcs: BattlerNPC[]): string {
  let summary = `${battler.name} is a ${state.tier} tier battler.\n\n`

  // Legal
  if (state.has_felony) {
    summary += `LEGAL: Has a felony (${state.felony_type}). Cannot book international battles.\n`
  }
  if (state.on_probation) {
    summary += `LEGAL: Currently on probation until ${state.probation_ends_at}.\n`
  }

  // Family
  summary += `RELATIONSHIP: ${state.relationship_status}`
  if (state.partner_id) {
    const partner = npcs.find(n => n.id === state.partner_id)
    summary += ` with ${partner?.name}. Relationship health: ${state.partner_relationship_health}/10.\n`
  }
  if (state.has_children) {
    summary += `Has ${state.children_count} child(ren). Custody: ${state.custody_status}.\n`
  }

  // Financial
  if (state.in_debt) {
    summary += `FINANCIAL: In debt ($${state.debt_amount}) from ${state.debt_type}.\n`
  }

  // Health
  if (state.has_active_injury) {
    summary += `HEALTH: Currently injured (${state.injury_type}, ${state.injury_severity}). Heals ${state.injury_heals_at}.\n`
  }

  // Street
  if (state.gang_affiliated) {
    summary += `STREET: Affiliated with ${state.gang_name} (${state.gang_rank}). Heat level: ${state.street_heat_level}/10.\n`
  }

  // NPCs
  summary += `\nKNOWN PEOPLE:\n`
  for (const npc of npcs) {
    summary += `- ${npc.nickname || npc.relationship_type}: ${npc.name} (${npc.status}, relationship: ${npc.relationship_health}/10)\n`
  }

  return summary
}
```

Example output:
```
WORDSMITH is an established tier battler.

LEGAL: Has a felony (assault). Cannot book international battles.
LEGAL: Currently on probation until 2025-06-15.

RELATIONSHIP: dating with Keisha. Relationship health: 6/10.
Has 1 child(ren). Custody: shared.

FINANCIAL: In debt ($15000) from gambling.

STREET: Affiliated with East Side (member). Heat level: 4/10.

KNOWN PEOPLE:
- Your girlfriend: Keisha (active, relationship: 6/10)
- Your baby mama: Tanya (estranged, relationship: 2/10)
- Your son: Marcus Jr. (active, relationship: 8/10)
- Your mother: Dorothy (active, relationship: 7/10)
- Your OG: Big Tony (active, relationship: 5/10)
```

---

## Storyline Content Database

Here's a comprehensive list of storylines organized by category:

### FAMILY (15 storylines)
1. **PARENT_ILLNESS** - Mother or father gets sick
2. **SIBLING_RIVALRY** - Brother/sister conflict
3. **FAMILY_REUNION** - Gathering goes wrong
4. **INHERITANCE_DISPUTE** - Money tears family apart
5. **FAMILY_LEGAL_TROUBLE** - Relative needs help with law
6. **ESTRANGED_PARENT** - Long-lost parent returns
7. **FAMILY_BUSINESS** - Asked to help failing business
8. **ELDERLY_CARE** - Must care for grandparent
9. **FAMILY_SECRET** - Someone exposes your past
10. **FAMILY_INTERVENTION** - They think you're changing
11. **PARENT_DEATH** - Losing a parent
12. **SIBLING_SUCCESS** - Brother/sister doing better than you
13. **FAMILY_MOVE** - Family moving away
14. **FAMILY_WEDDING** - Sibling getting married, drama ensues
15. **CHILDHOOD_FRIEND** - Old friend resurfaces with problems

### LEGAL (12 storylines)
1. **ASSAULT_CHARGES** - Fight at event
2. **WEAPON_POSSESSION** - Gun charge
3. **DRUG_CHARGES** - Possession or distribution
4. **TAX_PROBLEMS** - IRS comes calling
5. **CONTRACT_DISPUTE** - League/label contract issue
6. **DEFAMATION_LAWSUIT** - Opponent sues for bars
7. **CIVIL_SUIT** - Someone sues you
8. **CHILD_SUPPORT** - Baby mama takes you to court
9. **RESTRAINING_ORDER** - Drama leads to court order
10. **PROBATION_VIOLATION** - Slipping up while on paper
11. **WITNESS_SUBPOENA** - Called to testify
12. **IMMIGRATION_ISSUES** - Visa/passport problems

### FINANCIAL (10 storylines)
1. **GAMBLING_DEBT** - Owe the wrong people
2. **BAD_INVESTMENT** - Lost money on bad deal
3. **PONZI_VICTIM** - Scammed by scheme
4. **IDENTITY_THEFT** - Someone stole your info
5. **MANAGER_THEFT** - Manager stole from you
6. **TAX_AUDIT** - IRS deep dive
7. **BANKRUPTCY** - Considering filing
8. **CRYPTO_CRASH** - Lost it all on coins
9. **LOAN_SHARK** - Borrowed from wrong source
10. **FAILED_BUSINESS** - Side hustle collapsed

### ROMANCE (12 storylines)
1. **MEET_SOMEONE_NEW** - New relationship starts
2. **RELATIONSHIP_DRAMA** - Problems with current partner
3. **CHEATING_SCANDAL** - Infidelity exposed
4. **BABY_MAMA_DRAMA** - Ex causing problems
5. **PREGNANCY** - Partner is pregnant
6. **MARRIAGE_PROPOSAL** - Decision time
7. **DIVORCE** - Marriage ending
8. **CUSTODY_BATTLE** - Fighting for kids
9. **CAREER_CONFLICT** - Partner vs career
10. **LONG_DISTANCE** - Relationship strained by travel
11. **EX_RETURNS** - Old flame comes back
12. **REBOUND** - New relationship too fast

### HEALTH (10 storylines)
1. **PHYSICAL_INJURY** - Got hurt
2. **MENTAL_HEALTH** - Depression, anxiety
3. **BURNOUT** - Need a break
4. **ADDICTION** - Substance issues
5. **SURGERY_NEEDED** - Medical procedure required
6. **CHRONIC_DIAGNOSIS** - Long-term condition found
7. **RECOVERY_REHAB** - Going to treatment
8. **PANIC_ATTACKS** - Anxiety manifesting
9. **VOICE_ISSUES** - Throat problems
10. **ILLNESS** - Sick, can't perform

### STREET (10 storylines)
1. **POST_BATTLE_FIGHT** - Altercation after event
2. **JUMPED** - Got attacked
3. **RETALIATION_DECISION** - Do you get back?
4. **OLD_BEEF** - Past drama resurfaces
5. **WITNESS** - Saw something you shouldn't
6. **SNITCH_ACCUSATION** - Someone says you talked
7. **GANG_RECRUITMENT** - Pressure to join
8. **LEAVING_GANG** - Trying to get out
9. **SHOOTING_SCARE** - Violence too close
10. **HOME_INVASION** - Violated at home

### CREW (8 storylines)
1. **CREW_BEEF_SPILLOVER** - Crew drama affects you
2. **REP_REQUEST** - Asked to rep publicly
3. **CREW_MEMBER_TROUBLE** - Homie needs help
4. **CREW_POLITICS** - Internal drama
5. **LEAVING_CREW** - Want out
6. **CREW_VS_CREW** - Caught in the middle
7. **OG_FAVOR** - Elder wants something
8. **NEW_MEMBER_DRAMA** - Newcomer causing problems

### CAREER (12 storylines)
1. **LABEL_INTEREST** - Major label watching
2. **RECORD_DEAL** - Contract offered
3. **PODCAST_BEEF** - Media drama
4. **LEAGUE_DRAMA** - Problems with league
5. **BIG_OPPORTUNITY** - Major battle offered
6. **INTERNATIONAL_BOOKING** - Overseas opportunity
7. **MEDIA_APPEARANCE** - TV/movie chance
8. **BRAND_DEAL** - Sponsorship offer
9. **GHOSTWRITING** - Asked to write for someone
10. **RETIREMENT_PRESSURE** - Should you quit?
11. **MENTORSHIP** - Asked to help newcomer
12. **LEAGUE_BAN** - Banned from league

---

## Next Steps

1. **Create the database migrations** for the new tables
2. **Build state management functions** to update life state
3. **Create NPC generation system** with name pools
4. **Build scheduled event checker** that runs regularly
5. **Write 3-5 complete storylines** with all chapters and choices
6. **Set up image folder structure** and generate placeholder images
7. **Add state viewer to battler profile page** so players can see their situation

Want me to start implementing any of these?
