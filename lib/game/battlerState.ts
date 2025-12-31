/**
 * Battler Life State Management System
 *
 * Tracks persistent state for battlers including:
 * - Legal status (felonies, probation, pending charges)
 * - Family status (relationships, children, estrangement)
 * - Financial status (debt, tax issues, bankruptcy)
 * - Health status (injuries, rehab, chronic conditions)
 * - Street status (gang affiliation, heat level)
 * - Career status (label contracts, managers, secrets)
 */

import { SupabaseClient } from '@supabase/supabase-js'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface BattlerLifeState {
  id: string
  battler_id: string

  // Legal
  has_felony: boolean
  felony_type: string | null
  on_probation: boolean
  probation_ends_at: string | null
  has_pending_charges: boolean
  pending_charges: string[]
  passport_status: 'valid' | 'expired' | 'revoked' | 'none'
  can_travel_international: boolean

  // Family
  relationship_status: 'single' | 'dating' | 'engaged' | 'married' | 'divorced' | 'widowed' | 'complicated'
  partner_id: string | null
  partner_relationship_health: number
  has_children: boolean
  children_count: number
  custody_status: 'full' | 'shared' | 'none' | 'child_support_only' | null
  mother_alive: boolean
  father_alive: boolean
  family_estranged: boolean

  // Financial
  in_debt: boolean
  debt_amount: number
  debt_type: 'loan' | 'gambling' | 'taxes' | 'child_support' | 'loan_shark' | null
  has_tax_issues: boolean
  bankruptcy_filed: boolean

  // Health
  has_active_injury: boolean
  injury_type: string | null
  injury_severity: 'minor' | 'moderate' | 'severe' | null
  injury_heals_at: string | null
  in_rehab: boolean
  rehab_ends_at: string | null
  has_chronic_condition: boolean
  chronic_condition_type: string | null

  // Street/Crew
  gang_affiliated: boolean
  gang_name: string | null
  gang_rank: 'associate' | 'member' | 'og' | null
  has_street_enemies: boolean
  street_heat_level: number

  // Career
  signed_to_label: boolean
  label_name: string | null
  contract_battles_remaining: number | null
  contract_ends_at: string | null
  has_manager: boolean
  manager_id: string | null
  has_ghostwriting_secret: boolean
  league_banned_from: string[]

  // Meta
  created_at: string
  last_updated_at: string
  state_version: number
}

export interface BattlerNPC {
  id: string
  battler_id: string
  name: string
  nickname: string | null
  gender: 'male' | 'female' | 'nonbinary'
  relationship_type: NPCRelationshipType
  relationship_health: number
  introduced_in_storyline: string | null
  status: 'active' | 'deceased' | 'estranged' | 'incarcerated' | 'moved_away'
  status_changed_at: string | null
  status_reason: string | null
  personality_notes: string | null
  history_summary: string | null
  last_interaction: string | null
  created_at: string
  updated_at: string
}

export type NPCRelationshipType =
  // Family
  | 'mother' | 'father' | 'brother' | 'sister' | 'grandmother' | 'grandfather'
  | 'aunt' | 'uncle' | 'cousin' | 'child' | 'son' | 'daughter' | 'baby_mama' | 'baby_daddy'
  // Romantic
  | 'girlfriend' | 'boyfriend' | 'wife' | 'husband' | 'ex' | 'fling' | 'fiance'
  // Professional
  | 'manager' | 'lawyer' | 'accountant' | 'label_exec' | 'agent' | 'publicist'
  // Street
  | 'og' | 'crew_member' | 'plug' | 'enemy' | 'rival' | 'shooter'
  // Other
  | 'friend' | 'mentor' | 'protege' | 'roommate'

export interface ScheduledLifeEvent {
  id: string
  battler_id: string
  event_type: string
  scheduled_for: string
  source_storyline_id: string | null
  source_choice_id: string | null
  related_npc_id: string | null
  details: Record<string, any>
  triggered: boolean
  triggered_at: string | null
  resulting_storyline_code: string | null
  resulting_storyline_id: string | null
  priority: number
  can_be_cancelled: boolean
  cancelled: boolean
  cancelled_reason: string | null
  created_at: string
}

export interface StorylineCompletion {
  id: string
  battler_id: string
  storyline_code: string
  completed_at: string
  ending_id: string
  ending_type: 'positive' | 'negative' | 'neutral' | 'catastrophic'
  chapters_visited: number
  choices_made: { chapter_id: string; choice_id: string; timestamp: string }[]
  total_prep_days_lost: number
  unlocks_sequel: string | null
  blocks_storylines: string[]
  state_changes_applied: Record<string, any> | null
  npcs_introduced: string[]
}

export interface StateChangeEffect {
  // Legal changes
  add_felony?: { type: string }
  clear_felony?: boolean
  start_probation?: { ends_at: string }
  end_probation?: boolean
  add_pending_charge?: string
  clear_pending_charges?: boolean
  revoke_passport?: boolean
  restore_passport?: boolean

  // Family changes
  set_relationship_status?: BattlerLifeState['relationship_status']
  set_partner?: { npc_id: string; health?: number }
  clear_partner?: boolean
  adjust_partner_health?: number
  add_child?: boolean
  set_custody?: BattlerLifeState['custody_status']
  parent_died?: 'mother' | 'father'
  set_family_estranged?: boolean

  // Financial changes
  add_debt?: { amount: number; type: BattlerLifeState['debt_type'] }
  pay_debt?: number
  clear_debt?: boolean
  set_tax_issues?: boolean
  file_bankruptcy?: boolean

  // Health changes
  add_injury?: { type: string; severity: 'minor' | 'moderate' | 'severe'; heals_at: string }
  clear_injury?: boolean
  start_rehab?: { ends_at: string }
  end_rehab?: boolean
  add_chronic_condition?: string
  clear_chronic_condition?: boolean

  // Street changes
  join_gang?: { name: string; rank: 'associate' | 'member' | 'og' }
  leave_gang?: boolean
  set_gang_rank?: 'associate' | 'member' | 'og'
  add_street_enemy?: boolean
  adjust_heat_level?: number

  // Career changes
  sign_to_label?: { name: string; battles: number; ends_at?: string }
  leave_label?: boolean
  hire_manager?: { npc_id: string }
  fire_manager?: boolean
  expose_ghostwriting?: boolean
  ban_from_league?: string
  unban_from_league?: string
}

// =============================================================================
// NAME GENERATION
// =============================================================================

const NAME_POOLS = {
  female: [
    "Keisha", "Tanya", "Monique", "Jasmine", "Diamond", "Crystal",
    "Aaliyah", "Destiny", "Brianna", "Shaniqua", "Latoya", "Tamika",
    "Shonda", "Niesha", "Ebony", "Amber", "Ciara", "Tiffany",
    "Ashley", "Brittany", "Candace", "Deja", "Felicia", "Gina",
    "Maya", "Simone", "Alexis", "Chanel", "Whitney", "Raven"
  ],
  male: [
    "Marcus", "Darnell", "Tyrone", "Jamal", "DeShawn", "Terrell",
    "Antoine", "Maurice", "Rashad", "Lamar", "Darius", "Malik",
    "Jerome", "Dante", "Xavier", "Keith", "Rodney", "Clarence",
    "William", "Bernard", "Curtis", "Devon", "Eric", "Frank",
    "Andre", "Corey", "Travis", "Brandon", "Derrick", "Ray"
  ],
  street: [
    "Big Tony", "Lil Cease", "D-Block", "Ghost", "Smoke", "Ace",
    "King", "Duke", "Trigger", "Snake", "Blade", "Ice",
    "Money Mike", "Fat Pat", "Slim Charles", "T-Bone", "Capone",
    "Boogie", "Shug", "Pookie", "Ray Ray", "J-Rock"
  ],
  professional: [
    "David Chen", "Michael Ross", "Sarah Johnson", "Robert Williams",
    "Jennifer Martinez", "Christopher Lee", "Amanda Taylor", "James Brown",
    "Michelle Davis", "Kevin Thompson", "Lisa Rodriguez", "Brian Wilson"
  ],
  child_boy: [
    "Marcus Jr.", "Little D", "Jaylen", "Kaiden", "Aiden", "Jordan",
    "Isaiah", "Elijah", "Zion", "King", "Prince", "Messiah"
  ],
  child_girl: [
    "Princess", "Destiny", "Skye", "Nevaeh", "Genesis", "Serenity",
    "Harmony", "Melody", "Journey", "Dream", "Heaven", "Angel"
  ]
}

function getNamePool(relationshipType: NPCRelationshipType, gender: string): string[] {
  // Street relations use street names
  if (['og', 'crew_member', 'plug', 'enemy', 'rival', 'shooter'].includes(relationshipType)) {
    return NAME_POOLS.street
  }

  // Professional relations use professional names
  if (['manager', 'lawyer', 'accountant', 'label_exec', 'agent', 'publicist'].includes(relationshipType)) {
    return NAME_POOLS.professional
  }

  // Children use child names
  if (['child', 'son', 'daughter'].includes(relationshipType)) {
    return gender === 'male' ? NAME_POOLS.child_boy : NAME_POOLS.child_girl
  }

  // Default to gender-based names
  return gender === 'male' ? NAME_POOLS.male : NAME_POOLS.female
}

function inferGender(relationshipType: NPCRelationshipType): 'male' | 'female' {
  const maleTypes = ['father', 'brother', 'grandfather', 'uncle', 'son', 'baby_daddy',
                     'boyfriend', 'husband', 'og', 'crew_member', 'shooter']
  const femaleTypes = ['mother', 'sister', 'grandmother', 'aunt', 'daughter', 'baby_mama',
                       'girlfriend', 'wife']

  if (maleTypes.includes(relationshipType)) return 'male'
  if (femaleTypes.includes(relationshipType)) return 'female'

  // Random for neutral types
  return Math.random() > 0.5 ? 'male' : 'female'
}

function getNickname(relationshipType: NPCRelationshipType): string {
  const nicknames: Record<string, string> = {
    mother: "Your mother",
    father: "Your father",
    brother: "Your brother",
    sister: "Your sister",
    grandmother: "Your grandmother",
    grandfather: "Your grandfather",
    aunt: "Your aunt",
    uncle: "Your uncle",
    cousin: "Your cousin",
    child: "Your child",
    son: "Your son",
    daughter: "Your daughter",
    baby_mama: "Your baby mama",
    baby_daddy: "Your baby daddy",
    girlfriend: "Your girlfriend",
    boyfriend: "Your boyfriend",
    wife: "Your wife",
    husband: "Your husband",
    ex: "Your ex",
    fling: "Your fling",
    fiance: "Your fiance",
    manager: "Your manager",
    lawyer: "Your lawyer",
    accountant: "Your accountant",
    label_exec: "The label exec",
    agent: "Your agent",
    publicist: "Your publicist",
    og: "The OG",
    crew_member: "Your homie",
    plug: "Your plug",
    enemy: "Your enemy",
    rival: "Your rival",
    shooter: "Your shooter",
    friend: "Your friend",
    mentor: "Your mentor",
    protege: "Your protege",
    roommate: "Your roommate"
  }
  return nicknames[relationshipType] || relationshipType
}

// =============================================================================
// STATE MANAGEMENT FUNCTIONS
// =============================================================================

/**
 * Get the life state for a battler
 */
export async function getBattlerLifeState(
  supabase: SupabaseClient,
  battlerId: string
): Promise<BattlerLifeState | null> {
  const { data, error } = await supabase
    .from('battler_life_state')
    .select('*')
    .eq('battler_id', battlerId)
    .single()

  if (error) {
    console.error('Error fetching battler life state:', error)
    return null
  }

  return data as BattlerLifeState
}

/**
 * Update the life state for a battler
 */
export async function updateBattlerLifeState(
  supabase: SupabaseClient,
  battlerId: string,
  updates: Partial<BattlerLifeState>
): Promise<BattlerLifeState | null> {
  const { data, error } = await supabase
    .from('battler_life_state')
    .update(updates)
    .eq('battler_id', battlerId)
    .select()
    .single()

  if (error) {
    console.error('Error updating battler life state:', error)
    return null
  }

  return data as BattlerLifeState
}

/**
 * Apply state change effects from a storyline choice
 */
export async function applyStateChanges(
  supabase: SupabaseClient,
  battlerId: string,
  effects: StateChangeEffect
): Promise<{ success: boolean; changes: string[] }> {
  const changes: string[] = []
  const updates: Partial<BattlerLifeState> = {}

  // Get current state
  const currentState = await getBattlerLifeState(supabase, battlerId)
  if (!currentState) {
    return { success: false, changes: ['Failed to get current state'] }
  }

  // Legal changes
  if (effects.add_felony) {
    updates.has_felony = true
    updates.felony_type = effects.add_felony.type
    updates.can_travel_international = false
    changes.push(`Convicted of felony: ${effects.add_felony.type}`)
  }

  if (effects.clear_felony) {
    updates.has_felony = false
    updates.felony_type = null
    changes.push('Felony record cleared')
  }

  if (effects.start_probation) {
    updates.on_probation = true
    updates.probation_ends_at = effects.start_probation.ends_at
    changes.push(`On probation until ${effects.start_probation.ends_at}`)
  }

  if (effects.end_probation) {
    updates.on_probation = false
    updates.probation_ends_at = null
    changes.push('Probation ended')
  }

  if (effects.add_pending_charge) {
    const current = currentState.pending_charges || []
    updates.has_pending_charges = true
    updates.pending_charges = [...current, effects.add_pending_charge]
    changes.push(`Pending charge: ${effects.add_pending_charge}`)
  }

  if (effects.clear_pending_charges) {
    updates.has_pending_charges = false
    updates.pending_charges = []
    changes.push('Pending charges cleared')
  }

  if (effects.revoke_passport) {
    updates.passport_status = 'revoked'
    updates.can_travel_international = false
    changes.push('Passport revoked')
  }

  if (effects.restore_passport) {
    updates.passport_status = 'valid'
    updates.can_travel_international = !currentState.has_felony
    changes.push('Passport restored')
  }

  // Family changes
  if (effects.set_relationship_status) {
    updates.relationship_status = effects.set_relationship_status
    changes.push(`Relationship status: ${effects.set_relationship_status}`)
  }

  if (effects.set_partner) {
    updates.partner_id = effects.set_partner.npc_id
    if (effects.set_partner.health !== undefined) {
      updates.partner_relationship_health = effects.set_partner.health
    }
    changes.push('Partner set')
  }

  if (effects.clear_partner) {
    updates.partner_id = null
    updates.partner_relationship_health = 5
    changes.push('Partner cleared')
  }

  if (effects.adjust_partner_health !== undefined) {
    const newHealth = Math.max(0, Math.min(10,
      currentState.partner_relationship_health + effects.adjust_partner_health))
    updates.partner_relationship_health = newHealth
    changes.push(`Partner relationship health: ${newHealth}`)
  }

  if (effects.add_child) {
    updates.has_children = true
    updates.children_count = (currentState.children_count || 0) + 1
    changes.push(`New child (total: ${updates.children_count})`)
  }

  if (effects.set_custody) {
    updates.custody_status = effects.set_custody
    changes.push(`Custody status: ${effects.set_custody}`)
  }

  if (effects.parent_died) {
    if (effects.parent_died === 'mother') {
      updates.mother_alive = false
      changes.push('Mother passed away')
    } else {
      updates.father_alive = false
      changes.push('Father passed away')
    }
  }

  if (effects.set_family_estranged !== undefined) {
    updates.family_estranged = effects.set_family_estranged
    changes.push(effects.set_family_estranged ? 'Family estranged' : 'Family reconciled')
  }

  // Financial changes
  if (effects.add_debt) {
    updates.in_debt = true
    updates.debt_amount = (currentState.debt_amount || 0) + effects.add_debt.amount
    updates.debt_type = effects.add_debt.type
    changes.push(`Added debt: $${effects.add_debt.amount} (${effects.add_debt.type})`)
  }

  if (effects.pay_debt !== undefined) {
    const newAmount = Math.max(0, (currentState.debt_amount || 0) - effects.pay_debt)
    updates.debt_amount = newAmount
    updates.in_debt = newAmount > 0
    if (!updates.in_debt) {
      updates.debt_type = null
    }
    changes.push(`Paid debt: $${effects.pay_debt}`)
  }

  if (effects.clear_debt) {
    updates.in_debt = false
    updates.debt_amount = 0
    updates.debt_type = null
    changes.push('Debt cleared')
  }

  if (effects.set_tax_issues !== undefined) {
    updates.has_tax_issues = effects.set_tax_issues
    changes.push(effects.set_tax_issues ? 'Tax issues started' : 'Tax issues resolved')
  }

  if (effects.file_bankruptcy) {
    updates.bankruptcy_filed = true
    updates.in_debt = false
    updates.debt_amount = 0
    updates.debt_type = null
    changes.push('Filed for bankruptcy')
  }

  // Health changes
  if (effects.add_injury) {
    updates.has_active_injury = true
    updates.injury_type = effects.add_injury.type
    updates.injury_severity = effects.add_injury.severity
    updates.injury_heals_at = effects.add_injury.heals_at
    changes.push(`Injured: ${effects.add_injury.type} (${effects.add_injury.severity})`)
  }

  if (effects.clear_injury) {
    updates.has_active_injury = false
    updates.injury_type = null
    updates.injury_severity = null
    updates.injury_heals_at = null
    changes.push('Injury healed')
  }

  if (effects.start_rehab) {
    updates.in_rehab = true
    updates.rehab_ends_at = effects.start_rehab.ends_at
    changes.push(`Started rehab until ${effects.start_rehab.ends_at}`)
  }

  if (effects.end_rehab) {
    updates.in_rehab = false
    updates.rehab_ends_at = null
    changes.push('Completed rehab')
  }

  if (effects.add_chronic_condition) {
    updates.has_chronic_condition = true
    updates.chronic_condition_type = effects.add_chronic_condition
    changes.push(`Chronic condition: ${effects.add_chronic_condition}`)
  }

  if (effects.clear_chronic_condition) {
    updates.has_chronic_condition = false
    updates.chronic_condition_type = null
    changes.push('Chronic condition cleared')
  }

  // Street changes
  if (effects.join_gang) {
    updates.gang_affiliated = true
    updates.gang_name = effects.join_gang.name
    updates.gang_rank = effects.join_gang.rank
    changes.push(`Joined ${effects.join_gang.name} as ${effects.join_gang.rank}`)
  }

  if (effects.leave_gang) {
    updates.gang_affiliated = false
    updates.gang_name = null
    updates.gang_rank = null
    changes.push('Left gang')
  }

  if (effects.set_gang_rank) {
    updates.gang_rank = effects.set_gang_rank
    changes.push(`Gang rank: ${effects.set_gang_rank}`)
  }

  if (effects.add_street_enemy) {
    updates.has_street_enemies = true
    changes.push('Made a street enemy')
  }

  if (effects.adjust_heat_level !== undefined) {
    const newHeat = Math.max(0, Math.min(10,
      currentState.street_heat_level + effects.adjust_heat_level))
    updates.street_heat_level = newHeat
    changes.push(`Street heat level: ${newHeat}`)
  }

  // Career changes
  if (effects.sign_to_label) {
    updates.signed_to_label = true
    updates.label_name = effects.sign_to_label.name
    updates.contract_battles_remaining = effects.sign_to_label.battles
    if (effects.sign_to_label.ends_at) {
      updates.contract_ends_at = effects.sign_to_label.ends_at
    }
    changes.push(`Signed to ${effects.sign_to_label.name}`)
  }

  if (effects.leave_label) {
    updates.signed_to_label = false
    updates.label_name = null
    updates.contract_battles_remaining = null
    updates.contract_ends_at = null
    changes.push('Left label')
  }

  if (effects.hire_manager) {
    updates.has_manager = true
    updates.manager_id = effects.hire_manager.npc_id
    changes.push('Hired manager')
  }

  if (effects.fire_manager) {
    updates.has_manager = false
    updates.manager_id = null
    changes.push('Fired manager')
  }

  if (effects.expose_ghostwriting) {
    updates.has_ghostwriting_secret = false
    changes.push('Ghostwriting secret exposed')
  }

  if (effects.ban_from_league) {
    const current = currentState.league_banned_from || []
    updates.league_banned_from = [...current, effects.ban_from_league]
    changes.push(`Banned from ${effects.ban_from_league}`)
  }

  if (effects.unban_from_league) {
    const current = currentState.league_banned_from || []
    updates.league_banned_from = current.filter(l => l !== effects.unban_from_league)
    changes.push(`Unbanned from ${effects.unban_from_league}`)
  }

  // Apply updates if any
  if (Object.keys(updates).length > 0) {
    const result = await updateBattlerLifeState(supabase, battlerId, updates)
    return { success: result !== null, changes }
  }

  return { success: true, changes }
}

// =============================================================================
// NPC MANAGEMENT FUNCTIONS
// =============================================================================

/**
 * Get all NPCs for a battler
 */
export async function getBattlerNPCs(
  supabase: SupabaseClient,
  battlerId: string
): Promise<BattlerNPC[]> {
  const { data, error } = await supabase
    .from('battler_npcs')
    .select('*')
    .eq('battler_id', battlerId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching battler NPCs:', error)
    return []
  }

  return data as BattlerNPC[]
}

/**
 * Get a specific NPC by relationship type
 */
export async function getNPCByRelationship(
  supabase: SupabaseClient,
  battlerId: string,
  relationshipType: NPCRelationshipType
): Promise<BattlerNPC | null> {
  const { data, error } = await supabase
    .from('battler_npcs')
    .select('*')
    .eq('battler_id', battlerId)
    .eq('relationship_type', relationshipType)
    .eq('status', 'active')
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Error fetching NPC:', error)
  }

  return data as BattlerNPC | null
}

/**
 * Create or get an NPC for a storyline
 * If an NPC of this relationship type already exists, return it
 * Otherwise, generate a new one
 */
export async function getOrCreateNPC(
  supabase: SupabaseClient,
  battlerId: string,
  relationshipType: NPCRelationshipType,
  storylineCode: string,
  options?: {
    forceNew?: boolean
    gender?: 'male' | 'female'
    name?: string
  }
): Promise<BattlerNPC | null> {
  // Check if NPC already exists (unless forcing new)
  if (!options?.forceNew) {
    const existing = await getNPCByRelationship(supabase, battlerId, relationshipType)
    if (existing) return existing
  }

  // Generate new NPC
  const gender = options?.gender || inferGender(relationshipType)
  const namePool = getNamePool(relationshipType, gender)
  const name = options?.name || namePool[Math.floor(Math.random() * namePool.length)]
  const nickname = getNickname(relationshipType)

  const { data, error } = await supabase
    .from('battler_npcs')
    .insert({
      battler_id: battlerId,
      name,
      nickname,
      gender,
      relationship_type: relationshipType,
      introduced_in_storyline: storylineCode
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating NPC:', error)
    return null
  }

  return data as BattlerNPC
}

/**
 * Update an NPC
 */
export async function updateNPC(
  supabase: SupabaseClient,
  npcId: string,
  updates: Partial<BattlerNPC>
): Promise<BattlerNPC | null> {
  const { data, error } = await supabase
    .from('battler_npcs')
    .update(updates)
    .eq('id', npcId)
    .select()
    .single()

  if (error) {
    console.error('Error updating NPC:', error)
    return null
  }

  return data as BattlerNPC
}

/**
 * Change NPC status (e.g., deceased, estranged, incarcerated)
 */
export async function setNPCStatus(
  supabase: SupabaseClient,
  npcId: string,
  status: BattlerNPC['status'],
  reason?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('battler_npcs')
    .update({
      status,
      status_changed_at: new Date().toISOString(),
      status_reason: reason || null
    })
    .eq('id', npcId)

  if (error) {
    console.error('Error updating NPC status:', error)
    return false
  }

  return true
}

// =============================================================================
// SCHEDULED EVENT FUNCTIONS
// =============================================================================

/**
 * Schedule a life event for the future
 */
export async function scheduleLifeEvent(
  supabase: SupabaseClient,
  battlerId: string,
  eventType: string,
  scheduledFor: Date,
  options?: {
    sourceStorylineId?: string
    sourceChoiceId?: string
    relatedNpcId?: string
    details?: Record<string, any>
    priority?: number
    canBeCancelled?: boolean
  }
): Promise<ScheduledLifeEvent | null> {
  const { data, error } = await supabase
    .from('scheduled_life_events')
    .insert({
      battler_id: battlerId,
      event_type: eventType,
      scheduled_for: scheduledFor.toISOString(),
      source_storyline_id: options?.sourceStorylineId,
      source_choice_id: options?.sourceChoiceId,
      related_npc_id: options?.relatedNpcId,
      details: options?.details || {},
      priority: options?.priority || 5,
      can_be_cancelled: options?.canBeCancelled || false
    })
    .select()
    .single()

  if (error) {
    console.error('Error scheduling life event:', error)
    return null
  }

  return data as ScheduledLifeEvent
}

/**
 * Get all pending scheduled events for a battler
 */
export async function getPendingScheduledEvents(
  supabase: SupabaseClient,
  battlerId: string
): Promise<ScheduledLifeEvent[]> {
  const { data, error } = await supabase
    .from('scheduled_life_events')
    .select('*')
    .eq('battler_id', battlerId)
    .eq('triggered', false)
    .eq('cancelled', false)
    .order('scheduled_for', { ascending: true })

  if (error) {
    console.error('Error fetching scheduled events:', error)
    return []
  }

  return data as ScheduledLifeEvent[]
}

/**
 * Get due scheduled events (ready to trigger)
 */
export async function getDueScheduledEvents(
  supabase: SupabaseClient,
  battlerId: string
): Promise<ScheduledLifeEvent[]> {
  const { data, error } = await supabase
    .from('scheduled_life_events')
    .select('*')
    .eq('battler_id', battlerId)
    .eq('triggered', false)
    .eq('cancelled', false)
    .lte('scheduled_for', new Date().toISOString())
    .order('priority', { ascending: false })

  if (error) {
    console.error('Error fetching due events:', error)
    return []
  }

  return data as ScheduledLifeEvent[]
}

/**
 * Mark a scheduled event as triggered
 */
export async function triggerScheduledEvent(
  supabase: SupabaseClient,
  eventId: string,
  resultingStorylineCode?: string,
  resultingStorylineId?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('scheduled_life_events')
    .update({
      triggered: true,
      triggered_at: new Date().toISOString(),
      resulting_storyline_code: resultingStorylineCode,
      resulting_storyline_id: resultingStorylineId
    })
    .eq('id', eventId)

  if (error) {
    console.error('Error triggering scheduled event:', error)
    return false
  }

  return true
}

/**
 * Cancel a scheduled event
 */
export async function cancelScheduledEvent(
  supabase: SupabaseClient,
  eventId: string,
  reason?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('scheduled_life_events')
    .update({
      cancelled: true,
      cancelled_reason: reason
    })
    .eq('id', eventId)
    .eq('can_be_cancelled', true)

  if (error) {
    console.error('Error cancelling scheduled event:', error)
    return false
  }

  return true
}

// =============================================================================
// STORYLINE COMPLETION FUNCTIONS
// =============================================================================

/**
 * Record a storyline completion
 */
export async function recordStorylineCompletion(
  supabase: SupabaseClient,
  battlerId: string,
  storylineCode: string,
  endingId: string,
  endingType: StorylineCompletion['ending_type'],
  options?: {
    chaptersVisited?: number
    choicesMade?: { chapter_id: string; choice_id: string; timestamp: string }[]
    prepDaysLost?: number
    unlocksSequel?: string
    blocksStorylines?: string[]
    stateChanges?: Record<string, any>
    npcsIntroduced?: string[]
  }
): Promise<StorylineCompletion | null> {
  const { data, error } = await supabase
    .from('storyline_completions')
    .insert({
      battler_id: battlerId,
      storyline_code: storylineCode,
      completed_at: new Date().toISOString(),
      ending_id: endingId,
      ending_type: endingType,
      chapters_visited: options?.chaptersVisited || 1,
      choices_made: options?.choicesMade || [],
      total_prep_days_lost: options?.prepDaysLost || 0,
      unlocks_sequel: options?.unlocksSequel,
      blocks_storylines: options?.blocksStorylines || [],
      state_changes_applied: options?.stateChanges,
      npcs_introduced: options?.npcsIntroduced || []
    })
    .select()
    .single()

  if (error) {
    console.error('Error recording storyline completion:', error)
    return null
  }

  return data as StorylineCompletion
}

/**
 * Check if a battler has completed a storyline
 */
export async function hasCompletedStoryline(
  supabase: SupabaseClient,
  battlerId: string,
  storylineCode: string
): Promise<boolean> {
  const { data } = await supabase
    .from('storyline_completions')
    .select('id')
    .eq('battler_id', battlerId)
    .eq('storyline_code', storylineCode)
    .single()

  return data !== null
}

/**
 * Get all completed storylines for a battler
 */
export async function getCompletedStorylines(
  supabase: SupabaseClient,
  battlerId: string
): Promise<StorylineCompletion[]> {
  const { data, error } = await supabase
    .from('storyline_completions')
    .select('*')
    .eq('battler_id', battlerId)
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('Error fetching completed storylines:', error)
    return []
  }

  return data as StorylineCompletion[]
}

/**
 * Get blocked storylines for a battler
 */
export async function getBlockedStorylines(
  supabase: SupabaseClient,
  battlerId: string
): Promise<string[]> {
  const completions = await getCompletedStorylines(supabase, battlerId)

  const blocked = new Set<string>()

  // Add all completed storylines (can't repeat)
  completions.forEach(c => blocked.add(c.storyline_code))

  // Add explicitly blocked storylines
  completions.forEach(c => {
    c.blocks_storylines?.forEach(code => blocked.add(code))
  })

  return Array.from(blocked)
}

/**
 * Get available sequel storylines
 */
export async function getAvailableSequels(
  supabase: SupabaseClient,
  battlerId: string
): Promise<string[]> {
  const completions = await getCompletedStorylines(supabase, battlerId)
  const blocked = await getBlockedStorylines(supabase, battlerId)

  const sequels: string[] = []
  completions.forEach(c => {
    if (c.unlocks_sequel && !blocked.includes(c.unlocks_sequel)) {
      sequels.push(c.unlocks_sequel)
    }
  })

  return sequels
}

// =============================================================================
// AI-READABLE STATE SUMMARY
// =============================================================================

/**
 * Generate a human/AI-readable summary of a battler's life state
 */
export async function generateStateSummary(
  supabase: SupabaseClient,
  battlerId: string,
  battlerName: string
): Promise<string> {
  const state = await getBattlerLifeState(supabase, battlerId)
  const npcs = await getBattlerNPCs(supabase, battlerId)
  const scheduledEvents = await getPendingScheduledEvents(supabase, battlerId)

  if (!state) {
    return `${battlerName}'s life state is unknown.`
  }

  const lines: string[] = []
  lines.push(`=== ${battlerName.toUpperCase()}'S LIFE STATE ===\n`)

  // Legal
  if (state.has_felony || state.on_probation || state.has_pending_charges) {
    lines.push('LEGAL ISSUES:')
    if (state.has_felony) {
      lines.push(`- Has felony conviction (${state.felony_type}). Cannot book international battles.`)
    }
    if (state.on_probation) {
      lines.push(`- Currently on probation until ${state.probation_ends_at}`)
    }
    if (state.has_pending_charges) {
      lines.push(`- Pending charges: ${state.pending_charges.join(', ')}`)
    }
    if (!state.can_travel_international) {
      lines.push('- Cannot travel internationally')
    }
    lines.push('')
  }

  // Relationship
  lines.push('RELATIONSHIPS:')
  lines.push(`- Status: ${state.relationship_status}`)
  if (state.partner_id) {
    const partner = npcs.find(n => n.id === state.partner_id)
    if (partner) {
      lines.push(`- Partner: ${partner.name} (${partner.relationship_type})`)
      lines.push(`- Relationship health: ${state.partner_relationship_health}/10`)
    }
  }
  if (state.has_children) {
    lines.push(`- Has ${state.children_count} child(ren)`)
    if (state.custody_status) {
      lines.push(`- Custody: ${state.custody_status}`)
    }
  }
  if (!state.mother_alive || !state.father_alive) {
    const deceased = []
    if (!state.mother_alive) deceased.push('mother')
    if (!state.father_alive) deceased.push('father')
    lines.push(`- Deceased: ${deceased.join(', ')}`)
  }
  if (state.family_estranged) {
    lines.push('- Estranged from family')
  }
  lines.push('')

  // Financial
  if (state.in_debt || state.has_tax_issues || state.bankruptcy_filed) {
    lines.push('FINANCIAL ISSUES:')
    if (state.in_debt) {
      lines.push(`- In debt: $${state.debt_amount.toLocaleString()} (${state.debt_type})`)
    }
    if (state.has_tax_issues) {
      lines.push('- Has tax issues with IRS')
    }
    if (state.bankruptcy_filed) {
      lines.push('- Filed for bankruptcy')
    }
    lines.push('')
  }

  // Health
  if (state.has_active_injury || state.in_rehab || state.has_chronic_condition) {
    lines.push('HEALTH:')
    if (state.has_active_injury) {
      lines.push(`- Active injury: ${state.injury_type} (${state.injury_severity})`)
      lines.push(`- Heals: ${state.injury_heals_at}`)
    }
    if (state.in_rehab) {
      lines.push(`- In rehab until ${state.rehab_ends_at}`)
    }
    if (state.has_chronic_condition) {
      lines.push(`- Chronic condition: ${state.chronic_condition_type}`)
    }
    lines.push('')
  }

  // Street
  if (state.gang_affiliated || state.has_street_enemies || state.street_heat_level > 0) {
    lines.push('STREET STATUS:')
    if (state.gang_affiliated) {
      lines.push(`- Gang: ${state.gang_name} (${state.gang_rank})`)
    }
    if (state.has_street_enemies) {
      lines.push('- Has street enemies')
    }
    if (state.street_heat_level > 0) {
      lines.push(`- Heat level: ${state.street_heat_level}/10`)
    }
    lines.push('')
  }

  // Career
  if (state.signed_to_label || state.has_manager || state.has_ghostwriting_secret ||
      (state.league_banned_from && state.league_banned_from.length > 0)) {
    lines.push('CAREER:')
    if (state.signed_to_label) {
      lines.push(`- Signed to: ${state.label_name}`)
      if (state.contract_battles_remaining) {
        lines.push(`- Contract: ${state.contract_battles_remaining} battles remaining`)
      }
    }
    if (state.has_manager) {
      const manager = npcs.find(n => n.id === state.manager_id)
      if (manager) {
        lines.push(`- Manager: ${manager.name}`)
      }
    }
    if (state.has_ghostwriting_secret) {
      lines.push('- SECRET: Has ghostwritten for others')
    }
    if (state.league_banned_from && state.league_banned_from.length > 0) {
      lines.push(`- Banned from: ${state.league_banned_from.join(', ')}`)
    }
    lines.push('')
  }

  // Known People
  const activeNPCs = npcs.filter(n => n.status === 'active')
  if (activeNPCs.length > 0) {
    lines.push('KNOWN PEOPLE:')
    activeNPCs.forEach(npc => {
      lines.push(`- ${npc.nickname}: ${npc.name} (relationship: ${npc.relationship_health}/10)`)
    })
    lines.push('')
  }

  // Non-active NPCs
  const inactiveNPCs = npcs.filter(n => n.status !== 'active')
  if (inactiveNPCs.length > 0) {
    lines.push('PAST CONNECTIONS:')
    inactiveNPCs.forEach(npc => {
      lines.push(`- ${npc.name} (${npc.nickname}) - ${npc.status}${npc.status_reason ? `: ${npc.status_reason}` : ''}`)
    })
    lines.push('')
  }

  // Scheduled Events
  if (scheduledEvents.length > 0) {
    lines.push('UPCOMING EVENTS:')
    scheduledEvents.forEach(event => {
      const date = new Date(event.scheduled_for).toLocaleDateString()
      lines.push(`- ${event.event_type}: ${date}`)
      if (event.details && Object.keys(event.details).length > 0) {
        lines.push(`  Details: ${JSON.stringify(event.details)}`)
      }
    })
    lines.push('')
  }

  return lines.join('\n')
}

// =============================================================================
// GAMEPLAY EFFECT CHECKS
// =============================================================================

/**
 * Check if a battler can book an international battle
 */
export async function canBookInternational(
  supabase: SupabaseClient,
  battlerId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const state = await getBattlerLifeState(supabase, battlerId)

  if (!state) {
    return { allowed: true } // Default to allowed if no state
  }

  if (!state.can_travel_international) {
    if (state.has_felony) {
      return { allowed: false, reason: `Cannot travel internationally due to felony conviction (${state.felony_type})` }
    }
    if (state.passport_status === 'revoked') {
      return { allowed: false, reason: 'Passport has been revoked' }
    }
    if (state.passport_status === 'expired') {
      return { allowed: false, reason: 'Passport has expired' }
    }
    return { allowed: false, reason: 'Cannot travel internationally' }
  }

  if (state.on_probation) {
    return { allowed: false, reason: 'Cannot travel internationally while on probation' }
  }

  return { allowed: true }
}

/**
 * Check if a battler can perform (not injured, not in rehab)
 */
export async function canPerform(
  supabase: SupabaseClient,
  battlerId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const state = await getBattlerLifeState(supabase, battlerId)

  if (!state) {
    return { allowed: true }
  }

  if (state.in_rehab) {
    return { allowed: false, reason: `In rehab until ${state.rehab_ends_at}` }
  }

  if (state.has_active_injury && state.injury_severity === 'severe') {
    return { allowed: false, reason: `Severe injury (${state.injury_type}) prevents performing` }
  }

  return { allowed: true }
}

/**
 * Check if a battler is banned from a league
 */
export async function isBannedFromLeague(
  supabase: SupabaseClient,
  battlerId: string,
  leagueSlug: string
): Promise<boolean> {
  const state = await getBattlerLifeState(supabase, battlerId)

  if (!state || !state.league_banned_from) {
    return false
  }

  return state.league_banned_from.includes(leagueSlug)
}

/**
 * Get performance modifiers based on state
 */
export async function getStatePerformanceModifiers(
  supabase: SupabaseClient,
  battlerId: string
): Promise<{
  stressModifier: number
  prepModifier: number
  crowdModifier: number
  reasons: string[]
}> {
  const state = await getBattlerLifeState(supabase, battlerId)

  const modifiers = {
    stressModifier: 0,
    prepModifier: 0,
    crowdModifier: 0,
    reasons: [] as string[]
  }

  if (!state) return modifiers

  // Health impacts
  if (state.has_active_injury) {
    if (state.injury_severity === 'minor') {
      modifiers.prepModifier -= 0.1
      modifiers.reasons.push('Minor injury affecting prep')
    } else if (state.injury_severity === 'moderate') {
      modifiers.prepModifier -= 0.2
      modifiers.stressModifier += 10
      modifiers.reasons.push('Moderate injury affecting performance')
    }
  }

  // Relationship stress
  if (state.partner_relationship_health < 3) {
    modifiers.stressModifier += 15
    modifiers.reasons.push('Relationship problems causing stress')
  }

  // Financial stress
  if (state.in_debt && state.debt_amount > 10000) {
    modifiers.stressModifier += 10
    modifiers.reasons.push('Financial stress from debt')
  }

  // Street heat
  if (state.street_heat_level > 7) {
    modifiers.stressModifier += 20
    modifiers.reasons.push('High street heat causing anxiety')
  }

  // Family estrangement
  if (state.family_estranged) {
    modifiers.stressModifier += 5
    modifiers.reasons.push('Estranged from family')
  }

  // Gang affiliation can boost crowd
  if (state.gang_affiliated) {
    modifiers.crowdModifier += 0.05
    modifiers.reasons.push('Gang affiliation adds street cred')
  }

  return modifiers
}
