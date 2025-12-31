"use client"

import { useState, useEffect } from "react"
import {
  BookOpen,
  Play,
  Pause,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Zap,
  CheckCircle,
  Clock,
  AlertTriangle,
  Bot,
  Target,
  BarChart3,
  Trash2,
  Plus,
  Edit,
  Save,
  X,
  Copy,
} from "lucide-react"

interface StorylineTemplate {
  id: string
  code: string
  name: string
  description: string
  category: string
  min_chapters: number
  max_chapters: number
  trigger_config: any
  chapters: any[]
  endings: any[]
  is_active: boolean
}

interface ActiveStoryline {
  id: string
  battler_id: string
  template_code: string
  current_chapter_id: string
  status: string
  choices_made: any[]
  ending_id?: string
  ending_type?: string
  started_at: string
  ended_at?: string
  total_prep_days_lost: number
  storyline_templates?: StorylineTemplate
}

interface SimulationResult {
  storylineCode: string
  path: { chapterId: string; choiceId: string; choiceLabel: string }[]
  endingId: string
  endingType: string
  endingTitle: string
  totalEffects: Record<string, number>
  prepDaysLost: number
}

export function StorylinesTab() {
  const [templates, setTemplates] = useState<StorylineTemplate[]>([])
  const [activeStorylines, setActiveStorylines] = useState<ActiveStoryline[]>([])
  const [completedStorylines, setCompletedStorylines] = useState<ActiveStoryline[]>([])
  const [battlers, setBattlers] = useState<{ id: string; name: string }[]>([])
  const [selectedBattler, setSelectedBattler] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)
  const [expandedStoryline, setExpandedStoryline] = useState<string | null>(null)

  // Simulation state
  const [simulating, setSimulating] = useState(false)
  const [simResults, setSimResults] = useState<SimulationResult[]>([])
  const [simIterations, setSimIterations] = useState(100)
  const [selectedTemplateForSim, setSelectedTemplateForSim] = useState<string>("")

  // Template editing state
  const [editingTemplate, setEditingTemplate] = useState<StorylineTemplate | null>(null)
  const [editJson, setEditJson] = useState<string>("")
  const [jsonError, setJsonError] = useState<string>("")
  const [saving, setSaving] = useState(false)

  // Logs
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 99)])
  }

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedBattler) {
      fetchStorylines()
    }
  }, [selectedBattler])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch templates
      const templatesRes = await fetch("/api/dev/storylines/templates")
      if (templatesRes.ok) {
        const data = await templatesRes.json()
        setTemplates(data.templates || [])
      }

      // Fetch battlers
      const battlersRes = await fetch("/api/dev/battlers")
      if (battlersRes.ok) {
        const data = await battlersRes.json()
        setBattlers(data.battlers || [])
        if (data.battlers?.length > 0 && !selectedBattler) {
          setSelectedBattler(data.battlers[0].id)
        }
      }
    } catch (error) {
      addLog(`Error fetching data: ${error}`)
    }
    setLoading(false)
  }

  const fetchStorylines = async () => {
    if (!selectedBattler) return

    try {
      const res = await fetch(`/api/dev/storylines?battlerId=${selectedBattler}`)
      if (res.ok) {
        const data = await res.json()
        setActiveStorylines(data.active || [])
        setCompletedStorylines(data.completed || [])
      }
    } catch (error) {
      addLog(`Error fetching storylines: ${error}`)
    }
  }

  const triggerStoryline = async (templateCode: string) => {
    if (!selectedBattler) {
      addLog("No battler selected")
      return
    }

    addLog(`Triggering storyline: ${templateCode}`)
    try {
      const res = await fetch("/api/dev/storylines/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          battlerId: selectedBattler,
          templateCode,
        }),
      })

      const data = await res.json()
      if (data.success) {
        addLog(`  -> Started storyline: ${data.storylineId}`)
        fetchStorylines()
      } else {
        addLog(`  -> Failed: ${data.error}`)
      }
    } catch (error) {
      addLog(`  -> Error: ${error}`)
    }
  }

  const makeAIChoice = async (storylineId: string, chapterId: string) => {
    addLog(`AI making choice for storyline ${storylineId.slice(0, 8)}...`)

    try {
      const res = await fetch("/api/dev/storylines/ai-choice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storylineId,
          chapterId,
          strategy: "random", // Can be: random, best, worst, balanced
        }),
      })

      const data = await res.json()
      if (data.success) {
        addLog(`  -> AI chose: ${data.choiceLabel}`)
        addLog(`  -> Effects: ${JSON.stringify(data.effectsApplied)}`)
        if (data.ending) {
          addLog(`  -> Storyline ended: ${data.ending.title} (${data.ending.type})`)
        } else if (data.nextChapter) {
          addLog(`  -> Next chapter: ${data.nextChapter.title}`)
        }
        fetchStorylines()
      } else {
        addLog(`  -> Failed: ${data.error}`)
      }
    } catch (error) {
      addLog(`  -> Error: ${error}`)
    }
  }

  const runSimulation = async () => {
    if (!selectedTemplateForSim) {
      addLog("Select a template to simulate")
      return
    }

    setSimulating(true)
    setSimResults([])
    addLog(`Starting simulation: ${simIterations} iterations of ${selectedTemplateForSim}`)

    try {
      const res = await fetch("/api/dev/storylines/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateCode: selectedTemplateForSim,
          iterations: simIterations,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSimResults(data.results)
        addLog(`Simulation complete: ${data.results.length} paths explored`)

        // Log summary
        const endingCounts: Record<string, number> = {}
        for (const result of data.results) {
          endingCounts[result.endingType] = (endingCounts[result.endingType] || 0) + 1
        }
        addLog(`Ending distribution: ${JSON.stringify(endingCounts)}`)
      } else {
        addLog(`Simulation failed: ${data.error}`)
      }
    } catch (error) {
      addLog(`Simulation error: ${error}`)
    }

    setSimulating(false)
  }

  const deleteStoryline = async (storylineId: string) => {
    addLog(`Deleting storyline ${storylineId.slice(0, 8)}...`)
    try {
      const res = await fetch(`/api/dev/storylines/${storylineId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        addLog("  -> Deleted successfully")
        fetchStorylines()
      } else {
        addLog("  -> Delete failed")
      }
    } catch (error) {
      addLog(`  -> Error: ${error}`)
    }
  }

  const startEditingTemplate = (template: StorylineTemplate) => {
    const templateJson = {
      code: template.code,
      name: template.name,
      description: template.description,
      category: template.category,
      min_chapters: template.min_chapters,
      max_chapters: template.max_chapters,
      trigger: template.trigger_config,
      chapters: template.chapters,
      endings: template.endings,
    }
    setEditJson(JSON.stringify(templateJson, null, 2))
    setEditingTemplate(template)
    setJsonError("")
  }

  const cancelEditing = () => {
    setEditingTemplate(null)
    setEditJson("")
    setJsonError("")
  }

  const validateAndSaveTemplate = async () => {
    if (!editingTemplate) return

    // Validate JSON
    let parsed
    try {
      parsed = JSON.parse(editJson)
    } catch (e) {
      setJsonError("Invalid JSON syntax")
      return
    }

    // Basic validation
    if (!parsed.code || !parsed.name || !parsed.category) {
      setJsonError("Missing required fields: code, name, category")
      return
    }

    if (!parsed.chapters || !Array.isArray(parsed.chapters) || parsed.chapters.length === 0) {
      setJsonError("Chapters must be a non-empty array")
      return
    }

    if (!parsed.endings || !Array.isArray(parsed.endings) || parsed.endings.length === 0) {
      setJsonError("Endings must be a non-empty array")
      return
    }

    setJsonError("")
    setSaving(true)
    addLog(`Saving template: ${editingTemplate.code}...`)

    try {
      const res = await fetch("/api/dev/storylines/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTemplate.id,
          code: parsed.code,
          name: parsed.name,
          description: parsed.description || "",
          category: parsed.category,
          min_chapters: parsed.min_chapters || 2,
          max_chapters: parsed.max_chapters || 5,
          trigger_config: parsed.trigger || {},
          chapters: parsed.chapters,
          endings: parsed.endings,
        }),
      })

      const data = await res.json()
      if (data.success) {
        addLog("  -> Saved successfully")
        setEditingTemplate(null)
        setEditJson("")
        fetchData()
      } else {
        addLog(`  -> Failed: ${data.error}`)
        setJsonError(data.error || "Failed to save")
      }
    } catch (error) {
      addLog(`  -> Error: ${error}`)
      setJsonError("Network error")
    }

    setSaving(false)
  }

  const deleteTemplate = async (template: StorylineTemplate) => {
    if (!confirm(`Delete template "${template.name}"? This cannot be undone.`)) {
      return
    }

    addLog(`Deleting template: ${template.code}...`)
    try {
      const res = await fetch(`/api/dev/storylines/templates?id=${template.id}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (data.success) {
        addLog("  -> Deleted successfully")
        fetchData()
      } else {
        addLog(`  -> Failed: ${data.error}`)
      }
    } catch (error) {
      addLog(`  -> Error: ${error}`)
    }
  }

  const duplicateTemplate = (template: StorylineTemplate) => {
    const templateJson = {
      code: `${template.code}_COPY`,
      name: `${template.name} (Copy)`,
      description: template.description,
      category: template.category,
      min_chapters: template.min_chapters,
      max_chapters: template.max_chapters,
      trigger: template.trigger_config,
      chapters: template.chapters,
      endings: template.endings,
    }
    setEditJson(JSON.stringify(templateJson, null, 2))
    setEditingTemplate({ ...template, id: "", code: `${template.code}_COPY` })
    setJsonError("")
    addLog(`Creating copy of: ${template.code}`)
  }

  const createNewTemplate = async () => {
    if (!editingTemplate || editingTemplate.id !== "") return

    // Validate JSON
    let parsed
    try {
      parsed = JSON.parse(editJson)
    } catch (e) {
      setJsonError("Invalid JSON syntax")
      return
    }

    if (!parsed.code || !parsed.name || !parsed.category || !parsed.chapters || !parsed.endings) {
      setJsonError("Missing required fields")
      return
    }

    setJsonError("")
    setSaving(true)
    addLog(`Creating new template: ${parsed.code}...`)

    try {
      const res = await fetch("/api/dev/storylines/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: parsed.code,
          name: parsed.name,
          description: parsed.description || "",
          category: parsed.category,
          min_chapters: parsed.min_chapters || 2,
          max_chapters: parsed.max_chapters || 5,
          trigger_config: parsed.trigger || {},
          chapters: parsed.chapters,
          endings: parsed.endings,
        }),
      })

      const data = await res.json()
      if (data.success) {
        addLog("  -> Created successfully")
        setEditingTemplate(null)
        setEditJson("")
        fetchData()
      } else {
        addLog(`  -> Failed: ${data.error}`)
        setJsonError(data.error || "Failed to create")
      }
    } catch (error) {
      addLog(`  -> Error: ${error}`)
      setJsonError("Network error")
    }

    setSaving(false)
  }

  const categoryColors: Record<string, string> = {
    family: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    legal: "text-amber-400 bg-amber-500/20 border-amber-500/30",
    financial: "text-green-400 bg-green-500/20 border-green-500/30",
    rivalry: "text-red-400 bg-red-500/20 border-red-500/30",
    health: "text-pink-400 bg-pink-500/20 border-pink-500/30",
    career: "text-purple-400 bg-purple-500/20 border-purple-500/30",
    street: "text-orange-400 bg-orange-500/20 border-orange-500/30",
    crew: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30",
    romance: "text-rose-400 bg-rose-500/20 border-rose-500/30",
  }

  if (loading) {
    return (
      <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 w-48" />
          <div className="h-32 bg-zinc-800" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> STORYLINE MANAGEMENT
          </h2>
          <button
            onClick={fetchData}
            className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {/* Battler selector */}
        <div className="flex items-center gap-4 mb-4">
          <label className="text-xs text-zinc-400">Select Battler:</label>
          <select
            value={selectedBattler}
            onChange={(e) => setSelectedBattler(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-zinc-100 text-sm"
          >
            {battlers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-zinc-800 border border-zinc-700 p-3">
            <div className="text-xs text-zinc-500 mb-1">Templates</div>
            <div className="text-2xl font-bold text-zinc-100">{templates.length}</div>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 p-3">
            <div className="text-xs text-zinc-500 mb-1">Active</div>
            <div className="text-2xl font-bold text-green-400">{activeStorylines.length}</div>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 p-3">
            <div className="text-xs text-zinc-500 mb-1">Completed</div>
            <div className="text-2xl font-bold text-blue-400">{completedStorylines.length}</div>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 p-3">
            <div className="text-xs text-zinc-500 mb-1">Pending Choices</div>
            <div className="text-2xl font-bold text-yellow-400">
              {activeStorylines.filter((s) => s.status === "active").length}
            </div>
          </div>
        </div>
      </div>

      {/* Template Editor Modal */}
      {editingTemplate && (
        <div className="bg-zinc-900 border-2 border-orange-500 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-display font-bold text-orange-500 flex items-center gap-2">
              <Edit className="w-4 h-4" />
              {editingTemplate.id ? `EDITING: ${editingTemplate.code}` : "CREATE NEW TEMPLATE"}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={cancelEditing}
                className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Cancel
              </button>
              <button
                onClick={editingTemplate.id ? validateAndSaveTemplate : createNewTemplate}
                disabled={saving}
                className="px-3 py-1 bg-green-500 text-white text-xs flex items-center gap-1 disabled:opacity-50"
              >
                <Save className="w-3 h-3" /> {saving ? "Saving..." : editingTemplate.id ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>

          {jsonError && (
            <div className="mb-3 p-2 bg-red-500/20 border border-red-500/50 text-red-400 text-xs">
              {jsonError}
            </div>
          )}

          <div className="text-xs text-zinc-500 mb-2">
            Edit the storyline JSON below. Ensure valid JSON format with code, name, category, chapters[], and endings[].
          </div>

          <textarea
            value={editJson}
            onChange={(e) => {
              setEditJson(e.target.value)
              setJsonError("")
            }}
            className="w-full h-96 bg-zinc-950 border border-zinc-700 p-3 font-mono text-xs text-zinc-300 resize-y"
            spellCheck={false}
          />

          <div className="mt-2 text-xs text-zinc-600">
            Tip: The editor accepts JSON format matching the storyline schema. See developer docs for field reference.
          </div>
        </div>
      )}

      {/* Templates */}
      <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
        <h3 className="text-sm font-display font-bold text-zinc-300 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" /> STORYLINE TEMPLATES
        </h3>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {templates.map((template) => (
            <div key={template.id} className="bg-zinc-800 border border-zinc-700">
              <div
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-zinc-750"
                onClick={() =>
                  setExpandedTemplate(expandedTemplate === template.code ? null : template.code)
                }
              >
                <div className="flex items-center gap-3">
                  {expandedTemplate === template.code ? (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  )}
                  <span
                    className={`px-2 py-0.5 text-xs border ${categoryColors[template.category] || "text-zinc-400 bg-zinc-500/20"}`}
                  >
                    {template.category}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-zinc-100">{template.name}</div>
                    <div className="text-xs text-zinc-500">{template.code}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">
                    {template.min_chapters}-{template.max_chapters} chapters
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      startEditingTemplate(template)
                    }}
                    className="px-2 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-xs flex items-center gap-1"
                    title="Edit template"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateTemplate(template)
                    }}
                    className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 text-purple-400 text-xs flex items-center gap-1"
                    title="Duplicate template"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteTemplate(template)
                    }}
                    className="px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 text-xs flex items-center gap-1"
                    title="Delete template"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      triggerStoryline(template.code)
                    }}
                    className="px-2 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Trigger
                  </button>
                </div>
              </div>

              {expandedTemplate === template.code && (
                <div className="border-t border-zinc-700 p-3 bg-zinc-850">
                  <p className="text-sm text-zinc-400 mb-3">{template.description}</p>

                  {/* Trigger conditions */}
                  <div className="mb-3">
                    <div className="text-xs text-zinc-500 mb-1">Trigger Conditions:</div>
                    <pre className="text-xs bg-zinc-900 p-2 overflow-x-auto text-zinc-400">
                      {JSON.stringify(template.trigger_config, null, 2)}
                    </pre>
                  </div>

                  {/* Chapters preview */}
                  <div className="mb-3">
                    <div className="text-xs text-zinc-500 mb-1">
                      Chapters ({template.chapters.length}):
                    </div>
                    <div className="space-y-1">
                      {template.chapters.map((ch: any, i: number) => (
                        <div
                          key={ch.id}
                          className="text-xs flex items-center gap-2 text-zinc-400"
                        >
                          <span className="text-zinc-600">{i + 1}.</span>
                          <span className="text-zinc-300">{ch.title}</span>
                          <span className="text-zinc-600">
                            ({ch.choices?.length || 0} choices)
                          </span>
                          {ch.prep_days_cost > 0 && (
                            <span className="text-orange-400">-{ch.prep_days_cost} prep days</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Endings preview */}
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">
                      Endings ({template.endings.length}):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.endings.map((ending: any) => (
                        <span
                          key={ending.id}
                          className={`px-2 py-0.5 text-xs border ${
                            ending.type === "positive"
                              ? "text-green-400 bg-green-500/20 border-green-500/30"
                              : ending.type === "negative"
                                ? "text-red-400 bg-red-500/20 border-red-500/30"
                                : ending.type === "catastrophic"
                                  ? "text-red-600 bg-red-600/20 border-red-600/30"
                                  : "text-zinc-400 bg-zinc-500/20 border-zinc-500/30"
                          }`}
                        >
                          {ending.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Storylines */}
      <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
        <h3 className="text-sm font-display font-bold text-zinc-300 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-green-400" /> ACTIVE STORYLINES
        </h3>

        {activeStorylines.length === 0 ? (
          <p className="text-sm text-zinc-500">No active storylines for this battler</p>
        ) : (
          <div className="space-y-2">
            {activeStorylines.map((storyline) => {
              const template = templates.find((t) => t.code === storyline.template_code)
              const currentChapter = template?.chapters.find(
                (ch: any) => ch.id === storyline.current_chapter_id
              )

              return (
                <div key={storyline.id} className="bg-zinc-800 border border-zinc-700">
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedStoryline(
                        expandedStoryline === storyline.id ? null : storyline.id
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      {expandedStoryline === storyline.id ? (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs border ${categoryColors[template?.category || ""] || "text-zinc-400"}`}
                      >
                        {template?.category}
                      </span>
                      <div>
                        <div className="font-bold text-sm text-zinc-100">
                          {template?.name || storyline.template_code}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Chapter: {currentChapter?.title || storyline.current_chapter_id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {storyline.choices_made.length > 0 && (
                        <span className="text-xs text-zinc-500">
                          {storyline.choices_made.length} choices made
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          makeAIChoice(storyline.id, storyline.current_chapter_id)
                        }}
                        className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 text-purple-400 text-xs flex items-center gap-1"
                      >
                        <Bot className="w-3 h-3" /> AI Choose
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteStoryline(storyline.id)
                        }}
                        className="px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {expandedStoryline === storyline.id && currentChapter && (
                    <div className="border-t border-zinc-700 p-3 bg-zinc-850">
                      <p className="text-sm text-zinc-400 mb-3">{currentChapter.description}</p>

                      {/* Choices */}
                      <div className="text-xs text-zinc-500 mb-2">Available Choices:</div>
                      <div className="space-y-2">
                        {currentChapter.choices?.map((choice: any) => (
                          <div
                            key={choice.id}
                            className="flex items-center justify-between p-2 bg-zinc-900 border border-zinc-700"
                          >
                            <div>
                              <div className="text-sm font-bold text-zinc-200">{choice.label}</div>
                              <div className="text-xs text-zinc-500">{choice.description}</div>
                              {choice.effects?.length > 0 && (
                                <div className="text-xs text-zinc-600 mt-1">
                                  Effects:{" "}
                                  {choice.effects
                                    .map((e: any) => {
                                      const keys = Object.keys(e).filter(
                                        (k) => k !== "type" && k !== "duration_days"
                                      )
                                      return keys.map((k) => `${k}: ${e[k] > 0 ? "+" : ""}${e[k]}`).join(", ")
                                    })
                                    .join("; ")}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-zinc-600">
                              → {choice.leads_to.type}: {choice.leads_to.id}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Path taken */}
                      {storyline.choices_made.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-zinc-500 mb-1">Path Taken:</div>
                          <div className="flex flex-wrap gap-1">
                            {storyline.choices_made.map((cm: any, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 text-xs bg-zinc-700 text-zinc-300"
                              >
                                {cm.choice_id}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Completed Storylines */}
      <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
        <h3 className="text-sm font-display font-bold text-zinc-300 mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-blue-400" /> COMPLETED STORYLINES
        </h3>

        {completedStorylines.length === 0 ? (
          <p className="text-sm text-zinc-500">No completed storylines</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {completedStorylines.map((storyline) => {
              const template = templates.find((t) => t.code === storyline.template_code)
              const ending = template?.endings.find((e: any) => e.id === storyline.ending_id)

              return (
                <div
                  key={storyline.id}
                  className="p-3 bg-zinc-800 border border-zinc-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 text-xs border ${categoryColors[template?.category || ""]}`}
                    >
                      {template?.category}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-zinc-100">{template?.name}</div>
                      <div className="text-xs text-zinc-500">
                        {storyline.choices_made.length} choices → {ending?.title || storyline.ending_id}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs border ${
                        storyline.ending_type === "positive"
                          ? "text-green-400 bg-green-500/20 border-green-500/30"
                          : storyline.ending_type === "negative"
                            ? "text-red-400 bg-red-500/20 border-red-500/30"
                            : storyline.ending_type === "catastrophic"
                              ? "text-red-600 bg-red-600/20 border-red-600/30"
                              : "text-zinc-400 bg-zinc-500/20"
                      }`}
                    >
                      {storyline.ending_type}
                    </span>
                    {storyline.total_prep_days_lost > 0 && (
                      <span className="text-xs text-orange-400">
                        -{storyline.total_prep_days_lost} prep
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* AI Simulation */}
      <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
        <h3 className="text-sm font-display font-bold text-zinc-300 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400" /> AI STORYLINE SIMULATION
        </h3>

        <div className="flex items-center gap-4 mb-4">
          <select
            value={selectedTemplateForSim}
            onChange={(e) => setSelectedTemplateForSim(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-zinc-100 text-sm flex-1"
          >
            <option value="">Select template to simulate...</option>
            {templates.map((t) => (
              <option key={t.code} value={t.code}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>

          <input
            type="number"
            value={simIterations}
            onChange={(e) => setSimIterations(Number(e.target.value))}
            min={10}
            max={1000}
            className="w-24 bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-zinc-100 text-sm"
          />

          <button
            onClick={runSimulation}
            disabled={simulating || !selectedTemplateForSim}
            className="px-4 py-1.5 bg-purple-500 text-white text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {simulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Simulating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Run Simulation
              </>
            )}
          </button>
        </div>

        {simResults.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs text-zinc-500">
              Simulated {simResults.length} paths through storyline
            </div>

            {/* Ending distribution */}
            <div className="grid grid-cols-4 gap-2">
              {["positive", "neutral", "negative", "catastrophic"].map((type) => {
                const count = simResults.filter((r) => r.endingType === type).length
                const pct = ((count / simResults.length) * 100).toFixed(1)
                return (
                  <div key={type} className="bg-zinc-800 border border-zinc-700 p-2 text-center">
                    <div
                      className={`text-lg font-bold ${
                        type === "positive"
                          ? "text-green-400"
                          : type === "negative"
                            ? "text-red-400"
                            : type === "catastrophic"
                              ? "text-red-600"
                              : "text-zinc-400"
                      }`}
                    >
                      {pct}%
                    </div>
                    <div className="text-xs text-zinc-500 capitalize">{type}</div>
                    <div className="text-xs text-zinc-600">({count})</div>
                  </div>
                )
              })}
            </div>

            {/* Unique paths */}
            <div className="text-xs text-zinc-500">
              Unique paths found:{" "}
              {new Set(simResults.map((r) => r.path.map((p) => p.choiceId).join("->"))).size}
            </div>

            {/* Sample paths */}
            <div className="max-h-48 overflow-y-auto space-y-1">
              {simResults.slice(0, 10).map((result, i) => (
                <div
                  key={i}
                  className="text-xs p-2 bg-zinc-800 border border-zinc-700 flex items-center gap-2"
                >
                  <span className="text-zinc-600">{i + 1}.</span>
                  <span className="text-zinc-400">
                    {result.path.map((p) => p.choiceLabel).join(" → ")}
                  </span>
                  <span className="text-zinc-600">→</span>
                  <span
                    className={
                      result.endingType === "positive"
                        ? "text-green-400"
                        : result.endingType === "negative"
                          ? "text-red-400"
                          : "text-zinc-400"
                    }
                  >
                    {result.endingTitle}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Logs */}
      <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-display font-bold text-zinc-300">Activity Log</h3>
          <button
            onClick={() => setLogs([])}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Clear
          </button>
        </div>
        <div className="max-h-32 overflow-y-auto bg-zinc-950 border border-zinc-800 p-2">
          {logs.length === 0 ? (
            <p className="text-xs text-zinc-600">No activity yet</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-xs text-zinc-400 font-mono">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
