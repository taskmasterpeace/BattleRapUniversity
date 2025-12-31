"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertCircle,
  Heart,
  DollarSign,
  Activity,
  Shield,
  Briefcase,
  Users,
  Calendar,
  RefreshCw,
  Trash2,
  Plus,
  User,
  ChevronDown,
  ChevronRight,
  Copy
} from "lucide-react"

interface BattlerLifeState {
  id: string
  battler_id: string
  has_felony: boolean
  felony_type: string | null
  on_probation: boolean
  probation_ends_at: string | null
  has_pending_charges: boolean
  pending_charges: string[]
  passport_status: string
  can_travel_international: boolean
  relationship_status: string
  partner_id: string | null
  partner_relationship_health: number
  has_children: boolean
  children_count: number
  custody_status: string | null
  mother_alive: boolean
  father_alive: boolean
  family_estranged: boolean
  in_debt: boolean
  debt_amount: number
  debt_type: string | null
  has_tax_issues: boolean
  bankruptcy_filed: boolean
  has_active_injury: boolean
  injury_type: string | null
  injury_severity: string | null
  injury_heals_at: string | null
  in_rehab: boolean
  rehab_ends_at: string | null
  has_chronic_condition: boolean
  chronic_condition_type: string | null
  gang_affiliated: boolean
  gang_name: string | null
  gang_rank: string | null
  has_street_enemies: boolean
  street_heat_level: number
  signed_to_label: boolean
  label_name: string | null
  contract_battles_remaining: number | null
  contract_ends_at: string | null
  has_manager: boolean
  manager_id: string | null
  has_ghostwriting_secret: boolean
  league_banned_from: string[]
  state_version: number
}

interface BattlerNPC {
  id: string
  battler_id: string
  name: string
  nickname: string | null
  gender: string
  relationship_type: string
  relationship_health: number
  introduced_in_storyline: string | null
  status: string
  status_reason: string | null
  personality_notes: string | null
  history_summary: string | null
}

interface ScheduledEvent {
  id: string
  event_type: string
  scheduled_for: string
  details: Record<string, any>
  triggered: boolean
  priority: number
  can_be_cancelled: boolean
}

interface Battler {
  id: string
  stageName: string
  isActive?: boolean
}

export function BattlerStateTab() {
  const [battlers, setBattlers] = useState<Battler[]>([])
  const [selectedBattlerId, setSelectedBattlerId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [stateData, setStateData] = useState<{
    life_state: BattlerLifeState | null
    npcs: BattlerNPC[]
    storylines: {
      completed: any[]
      blocked: string[]
      available_sequels: string[]
    }
    capabilities: {
      can_book_international: { allowed: boolean; reason?: string }
      can_perform: { allowed: boolean; reason?: string }
    }
    performance_modifiers: {
      stressModifier: number
      prepModifier: number
      crowdModifier: number
      reasons: string[]
    }
  } | null>(null)
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([])
  const [aiSummary, setAiSummary] = useState<string>("")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    legal: true,
    family: true,
    financial: true,
    health: true,
    street: true,
    career: true,
    npcs: true,
    events: true
  })
  const [activityLog, setActivityLog] = useState<string[]>([])

  // Load battlers
  useEffect(() => {
    async function loadBattlers() {
      try {
        const res = await fetch('/api/roster')
        if (res.ok) {
          const data = await res.json()
          setBattlers(data.battlers || [])
          // Select active battler by default, or first one
          const active = data.battlers?.find((b: Battler) => b.isActive) || data.battlers?.[0]
          if (active) {
            setSelectedBattlerId(active.id)
          }
        }
      } catch (err) {
        console.error('Failed to load battlers:', err)
      }
    }
    loadBattlers()
  }, [])

  // Load state when battler changes
  useEffect(() => {
    if (selectedBattlerId) {
      loadState()
      loadScheduledEvents()
      loadAISummary()
    }
  }, [selectedBattlerId])

  const log = (message: string) => {
    setActivityLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 49)])
  }

  async function loadState() {
    if (!selectedBattlerId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/dev/state?battler_id=${selectedBattlerId}`)
      if (res.ok) {
        const data = await res.json()
        setStateData(data)
        log(`Loaded state for ${data.battler_name}`)
      }
    } catch (err) {
      log(`Error loading state: ${err}`)
    }
    setLoading(false)
  }

  async function loadScheduledEvents() {
    if (!selectedBattlerId) return
    try {
      const res = await fetch(`/api/dev/state/scheduled-events?battler_id=${selectedBattlerId}`)
      if (res.ok) {
        const data = await res.json()
        setScheduledEvents(data.pending_events || [])
      }
    } catch (err) {
      console.error('Failed to load scheduled events:', err)
    }
  }

  async function loadAISummary() {
    if (!selectedBattlerId) return
    try {
      const res = await fetch(`/api/dev/state?battler_id=${selectedBattlerId}&format=ai`)
      if (res.ok) {
        const data = await res.json()
        setAiSummary(data.summary || "")
      }
    } catch (err) {
      console.error('Failed to load AI summary:', err)
    }
  }

  async function resetState() {
    if (!selectedBattlerId) return
    if (!confirm("Reset all state data for this battler? This will delete NPCs, events, and storyline completions.")) {
      return
    }
    try {
      const res = await fetch(`/api/dev/state?battler_id=${selectedBattlerId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        log("State reset to defaults")
        loadState()
        loadScheduledEvents()
        loadAISummary()
      }
    } catch (err) {
      log(`Error resetting state: ${err}`)
    }
  }

  async function applyTestEffect(effectName: string, effects: any) {
    if (!selectedBattlerId) return
    try {
      const res = await fetch('/api/dev/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battler_id: selectedBattlerId,
          effects
        })
      })
      if (res.ok) {
        const data = await res.json()
        log(`Applied ${effectName}: ${data.changes_applied?.join(', ')}`)
        loadState()
        loadAISummary()
      }
    } catch (err) {
      log(`Error applying effect: ${err}`)
    }
  }

  async function createTestNPC(relationshipType: string) {
    if (!selectedBattlerId) return
    try {
      const res = await fetch('/api/dev/state/npcs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battler_id: selectedBattlerId,
          relationship_type: relationshipType,
          force_new: true
        })
      })
      if (res.ok) {
        const data = await res.json()
        log(`Created NPC: ${data.npc.name} (${data.npc.nickname})`)
        loadState()
        loadAISummary()
      }
    } catch (err) {
      log(`Error creating NPC: ${err}`)
    }
  }

  async function deleteNPC(npcId: string, name: string) {
    try {
      const res = await fetch(`/api/dev/state/npcs?npc_id=${npcId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        log(`Deleted NPC: ${name}`)
        loadState()
        loadAISummary()
      }
    } catch (err) {
      log(`Error deleting NPC: ${err}`)
    }
  }

  async function triggerEvent(eventId: string, eventType: string) {
    try {
      const res = await fetch('/api/dev/state/scheduled-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger',
          event_id: eventId
        })
      })
      if (res.ok) {
        log(`Triggered event: ${eventType}`)
        loadScheduledEvents()
      }
    } catch (err) {
      log(`Error triggering event: ${err}`)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const state = stateData?.life_state

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-black text-zinc-100">BATTLER STATE</h2>
          <p className="text-sm text-zinc-500">View and modify persistent life state</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedBattlerId} onValueChange={setSelectedBattlerId}>
            <SelectTrigger className="w-[200px] bg-zinc-800 border-zinc-700">
              <span className={selectedBattlerId ? "" : "text-zinc-500"}>
                {selectedBattlerId
                  ? (battlers.find(b => b.id === selectedBattlerId)?.stageName || "Select battler")
                  : "Select battler"}
              </span>
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {battlers.map(b => (
                <SelectItem key={b.id} value={b.id}>
                  {b.stageName} {b.isActive && "(Active)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={loadState}
            disabled={loading || !selectedBattlerId}
            className="border-zinc-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={resetState}
            disabled={!selectedBattlerId}
            className="border-red-700 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!state ? (
        <div className="text-center py-12 text-zinc-500">
          Select a battler to view state
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main State Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Capabilities */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-display text-zinc-300">CAPABILITIES</CardTitle>
              </CardHeader>
              <CardContent className="py-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Can Book International</span>
                  <span className={`text-sm font-bold ${stateData?.capabilities.can_book_international.allowed ? 'text-green-400' : 'text-red-400'}`}>
                    {stateData?.capabilities.can_book_international.allowed ? 'YES' : 'NO'}
                    {stateData?.capabilities.can_book_international.reason && (
                      <span className="text-zinc-500 font-normal ml-2">({stateData.capabilities.can_book_international.reason})</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Can Perform</span>
                  <span className={`text-sm font-bold ${stateData?.capabilities.can_perform.allowed ? 'text-green-400' : 'text-red-400'}`}>
                    {stateData?.capabilities.can_perform.allowed ? 'YES' : 'NO'}
                    {stateData?.capabilities.can_perform.reason && (
                      <span className="text-zinc-500 font-normal ml-2">({stateData.capabilities.can_perform.reason})</span>
                    )}
                  </span>
                </div>
                {stateData?.performance_modifiers.reasons.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-1">Performance Modifiers:</p>
                    {stateData.performance_modifiers.reasons.map((r, i) => (
                      <p key={i} className="text-xs text-amber-400">- {r}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legal Status */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader
                className="py-3 cursor-pointer flex flex-row items-center justify-between"
                onClick={() => toggleSection('legal')}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <CardTitle className="text-sm font-display text-zinc-300">LEGAL STATUS</CardTitle>
                </div>
                {expandedSections.legal ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
              </CardHeader>
              {expandedSections.legal && (
                <CardContent className="py-2 space-y-2">
                  <StateRow label="Has Felony" value={state.has_felony} type="boolean" detail={state.felony_type} />
                  <StateRow label="On Probation" value={state.on_probation} type="boolean" detail={state.probation_ends_at} />
                  <StateRow label="Pending Charges" value={state.has_pending_charges} type="boolean" detail={state.pending_charges?.join(', ')} />
                  <StateRow label="Passport Status" value={state.passport_status} />
                  <StateRow label="Can Travel Intl" value={state.can_travel_international} type="boolean" />

                  <div className="pt-2 border-t border-zinc-800 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="text-xs border-zinc-700"
                      onClick={() => applyTestEffect('Add Felony', { add_felony: { type: 'assault' } })}>
                      + Add Felony
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs border-zinc-700"
                      onClick={() => applyTestEffect('Start Probation', { start_probation: { ends_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() } })}>
                      + Start Probation
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs border-zinc-700"
                      onClick={() => applyTestEffect('Add Charge', { add_pending_charge: 'tax evasion' })}>
                      + Add Charge
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Family Status */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader
                className="py-3 cursor-pointer flex flex-row items-center justify-between"
                onClick={() => toggleSection('family')}
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <CardTitle className="text-sm font-display text-zinc-300">FAMILY STATUS</CardTitle>
                </div>
                {expandedSections.family ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
              </CardHeader>
              {expandedSections.family && (
                <CardContent className="py-2 space-y-2">
                  <StateRow label="Relationship Status" value={state.relationship_status} />
                  <StateRow label="Partner Health" value={`${state.partner_relationship_health}/10`} />
                  <StateRow label="Has Children" value={state.has_children} type="boolean" detail={state.has_children ? `${state.children_count} child(ren)` : undefined} />
                  <StateRow label="Custody Status" value={state.custody_status || 'N/A'} />
                  <StateRow label="Mother Alive" value={state.mother_alive} type="boolean" />
                  <StateRow label="Father Alive" value={state.father_alive} type="boolean" />
                  <StateRow label="Family Estranged" value={state.family_estranged} type="boolean" />

                  <div className="pt-2 border-t border-zinc-800 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="text-xs border-zinc-700"
                      onClick={() => applyTestEffect('Start Dating', { set_relationship_status: 'dating' })}>
                      Start Dating
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs border-zinc-700"
                      onClick={() => applyTestEffect('Add Child', { add_child: true })}>
                      + Add Child
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs border-zinc-700"
                      onClick={() => applyTestEffect('Mother Died', { parent_died: 'mother' })}>
                      Mother Died
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Financial Status */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader
                className="py-3 cursor-pointer flex flex-row items-center justify-between"
                onClick={() => toggleSection('financial')}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <CardTitle className="text-sm font-display text-zinc-300">FINANCIAL STATUS</CardTitle>
                </div>
                {expandedSections.financial ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
              </CardHeader>
              {expandedSections.financial && (
                <CardContent className="py-2 space-y-2">
                  <StateRow label="In Debt" value={state.in_debt} type="boolean" detail={state.in_debt ? `$${state.debt_amount.toLocaleString()} (${state.debt_type})` : undefined} />
                  <StateRow label="Has Tax Issues" value={state.has_tax_issues} type="boolean" />
                  <StateRow label="Bankruptcy Filed" value={state.bankruptcy_filed} type="boolean" />

                  <div className="pt-2 border-t border-zinc-800 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="text-xs border-zinc-700"
                      onClick={() => applyTestEffect('Add Debt', { add_debt: { amount: 15000, type: 'gambling' } })}>
                      + Add Gambling Debt
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs border-zinc-700"
                      onClick={() => applyTestEffect('Tax Issues', { set_tax_issues: true })}>
                      + Tax Issues
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Health Status */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader
                className="py-3 cursor-pointer flex flex-row items-center justify-between"
                onClick={() => toggleSection('health')}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <CardTitle className="text-sm font-display text-zinc-300">HEALTH STATUS</CardTitle>
                </div>
                {expandedSections.health ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
              </CardHeader>
              {expandedSections.health && (
                <CardContent className="py-2 space-y-2">
                  <StateRow label="Active Injury" value={state.has_active_injury} type="boolean" detail={state.has_active_injury ? `${state.injury_type} (${state.injury_severity})` : undefined} />
                  <StateRow label="In Rehab" value={state.in_rehab} type="boolean" detail={state.rehab_ends_at} />
                  <StateRow label="Chronic Condition" value={state.has_chronic_condition} type="boolean" detail={state.chronic_condition_type} />

                  <div className="pt-2 border-t border-zinc-800 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="text-xs border-zinc-700"
                      onClick={() => applyTestEffect('Add Injury', { add_injury: { type: 'knee injury', severity: 'moderate', heals_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() } })}>
                      + Add Injury
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs border-zinc-700"
                      onClick={() => applyTestEffect('Start Rehab', { start_rehab: { ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() } })}>
                      + Start Rehab
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Street Status */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader
                className="py-3 cursor-pointer flex flex-row items-center justify-between"
                onClick={() => toggleSection('street')}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-400" />
                  <CardTitle className="text-sm font-display text-zinc-300">STREET STATUS</CardTitle>
                </div>
                {expandedSections.street ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
              </CardHeader>
              {expandedSections.street && (
                <CardContent className="py-2 space-y-2">
                  <StateRow label="Gang Affiliated" value={state.gang_affiliated} type="boolean" detail={state.gang_affiliated ? `${state.gang_name} (${state.gang_rank})` : undefined} />
                  <StateRow label="Street Enemies" value={state.has_street_enemies} type="boolean" />
                  <StateRow label="Heat Level" value={`${state.street_heat_level}/10`} />

                  <div className="pt-2 border-t border-zinc-800 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="text-xs border-zinc-700"
                      onClick={() => applyTestEffect('Join Gang', { join_gang: { name: 'East Side', rank: 'member' } })}>
                      + Join Gang
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs border-zinc-700"
                      onClick={() => applyTestEffect('Add Enemy', { add_street_enemy: true })}>
                      + Add Enemy
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs border-zinc-700"
                      onClick={() => applyTestEffect('Add Heat', { adjust_heat_level: 3 })}>
                      + Add Heat
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Career Status */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader
                className="py-3 cursor-pointer flex flex-row items-center justify-between"
                onClick={() => toggleSection('career')}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <CardTitle className="text-sm font-display text-zinc-300">CAREER STATUS</CardTitle>
                </div>
                {expandedSections.career ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
              </CardHeader>
              {expandedSections.career && (
                <CardContent className="py-2 space-y-2">
                  <StateRow label="Signed to Label" value={state.signed_to_label} type="boolean" detail={state.signed_to_label ? `${state.label_name} (${state.contract_battles_remaining} battles left)` : undefined} />
                  <StateRow label="Has Manager" value={state.has_manager} type="boolean" />
                  <StateRow label="Ghostwriting Secret" value={state.has_ghostwriting_secret} type="boolean" />
                  <StateRow label="Banned From" value={state.league_banned_from?.length > 0 ? state.league_banned_from.join(', ') : 'None'} />

                  <div className="pt-2 border-t border-zinc-800 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="text-xs border-zinc-700"
                      onClick={() => applyTestEffect('Sign to Label', { sign_to_label: { name: 'Empire Records', battles: 5 } })}>
                      + Sign to Label
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs border-zinc-700"
                      onClick={() => applyTestEffect('Ban from League', { ban_from_league: 'url-league' })}>
                      + Ban from URL
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* NPCs */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader
                className="py-3 cursor-pointer flex flex-row items-center justify-between"
                onClick={() => toggleSection('npcs')}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <CardTitle className="text-sm font-display text-zinc-300">
                    NPCs ({stateData?.npcs.length || 0})
                  </CardTitle>
                </div>
                {expandedSections.npcs ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
              </CardHeader>
              {expandedSections.npcs && (
                <CardContent className="py-2 space-y-2">
                  {stateData?.npcs.map(npc => (
                    <div key={npc.id} className="flex items-center justify-between text-xs p-2 bg-zinc-800 rounded">
                      <div>
                        <p className="text-zinc-200 font-bold">{npc.name}</p>
                        <p className="text-zinc-500">{npc.nickname} ({npc.relationship_health}/10)</p>
                        <p className={`text-xs ${npc.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                          {npc.status}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => deleteNPC(npc.id, npc.name)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-zinc-800 flex flex-wrap gap-1">
                    {['girlfriend', 'mother', 'brother', 'baby_mama', 'manager', 'og', 'enemy'].map(type => (
                      <Button key={type} size="sm" variant="outline" className="text-[10px] border-zinc-700 h-6"
                        onClick={() => createTestNPC(type)}>
                        + {type}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Scheduled Events */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader
                className="py-3 cursor-pointer flex flex-row items-center justify-between"
                onClick={() => toggleSection('events')}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-yellow-400" />
                  <CardTitle className="text-sm font-display text-zinc-300">
                    SCHEDULED EVENTS ({scheduledEvents.length})
                  </CardTitle>
                </div>
                {expandedSections.events ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
              </CardHeader>
              {expandedSections.events && (
                <CardContent className="py-2 space-y-2">
                  {scheduledEvents.length === 0 ? (
                    <p className="text-xs text-zinc-500">No scheduled events</p>
                  ) : (
                    scheduledEvents.map(event => (
                      <div key={event.id} className="text-xs p-2 bg-zinc-800 rounded">
                        <div className="flex items-center justify-between">
                          <p className="text-zinc-200 font-bold">{event.event_type}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-orange-400 hover:text-orange-300 h-5 text-[10px]"
                            onClick={() => triggerEvent(event.id, event.event_type)}
                          >
                            Trigger
                          </Button>
                        </div>
                        <p className="text-zinc-500">{new Date(event.scheduled_for).toLocaleDateString()}</p>
                        <p className="text-zinc-600 text-[10px]">
                          {JSON.stringify(event.details).slice(0, 50)}...
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              )}
            </Card>

            {/* Storyline Info */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-display text-zinc-300">STORYLINES</CardTitle>
              </CardHeader>
              <CardContent className="py-2 space-y-2 text-xs">
                <div>
                  <p className="text-zinc-500">Completed:</p>
                  <p className="text-zinc-300">{stateData?.storylines.completed.length || 0}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Blocked:</p>
                  <p className="text-zinc-300">{stateData?.storylines.blocked.length || 0}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Available Sequels:</p>
                  <p className="text-green-400">{stateData?.storylines.available_sequels.join(', ') || 'None'}</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Summary */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-display text-zinc-300">AI SUMMARY</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6"
                  onClick={() => navigator.clipboard.writeText(aiSummary)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </CardHeader>
              <CardContent className="py-2">
                <pre className="text-[10px] text-zinc-400 whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto">
                  {aiSummary || "Loading..."}
                </pre>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-display text-zinc-300">ACTIVITY LOG</CardTitle>
              </CardHeader>
              <CardContent className="py-2 max-h-[200px] overflow-y-auto">
                {activityLog.length === 0 ? (
                  <p className="text-xs text-zinc-500">No activity yet</p>
                ) : (
                  activityLog.map((entry, i) => (
                    <p key={i} className="text-[10px] text-zinc-400 font-mono">{entry}</p>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function StateRow({
  label,
  value,
  type = 'text',
  detail
}: {
  label: string
  value: string | number | boolean | null | undefined
  type?: 'text' | 'boolean'
  detail?: string | null
}) {
  let displayValue: React.ReactNode = value?.toString() || 'N/A'
  let valueClass = 'text-zinc-300'

  if (type === 'boolean') {
    displayValue = value ? 'YES' : 'NO'
    valueClass = value ? 'text-red-400' : 'text-green-400'
  }

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-zinc-500">{label}</span>
      <div className="text-right">
        <span className={`font-bold ${valueClass}`}>{displayValue}</span>
        {detail && <span className="text-zinc-600 ml-2">({detail})</span>}
      </div>
    </div>
  )
}
