"use client"

import { useState, useCallback, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { NavHeader } from "@/components/ui/nav-header"
import { BattleInfoCard } from "@/components/battle-prep/battle-info-card"
import { FocusLegend } from "@/components/battle-prep/focus-legend"
import { PrepCalendar } from "@/components/battle-prep/prep-calendar"
import { PrepAssistant } from "@/components/battle-prep/prep-assistant"
import { TemplateModal } from "@/components/battle-prep/template-modal"
import { DayDetailPanel } from "@/components/battle-prep/day-detail-panel"
import { LockPrepModal } from "@/components/battle-prep/lock-prep-modal"
import { SegmentCreatorModal } from "@/components/battle-prep/segment-creator-modal"
import { ResearchLevelIndicator } from "@/components/battle-prep/research-level-indicator"
import { RoundOrganizer } from "@/components/battle-prep/round-organizer"
import { CounterSlotManager } from "@/components/battle-prep/counter-slot-manager"
import { mockBattleInfo, prepTemplates, defaultRecommendations, calculateImpactPreview } from "@/lib/data"
import type { FocusType, DayPlan, PrepTemplate, PrepSegment, PrepCounter, ResearchLevel } from "@/lib/types"
import { Lock, Loader2, Swords, ChevronDown, ChevronUp, Plus, FileText, Mic2 } from "lucide-react"

export default function BattlePrepPage() {
  const params = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [totalPrepDays, setTotalPrepDays] = useState(10)
  const [prepLocked, setPrepLocked] = useState(false)
  const [showLockModal, setShowLockModal] = useState(false)

  const [days, setDays] = useState<DayPlan[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  const [segments, setSegments] = useState<PrepSegment[]>([])
  const [counters, setCounters] = useState<PrepCounter[]>([])
  const [showSegmentCreator, setShowSegmentCreator] = useState(false)
  const [showCrafting, setShowCrafting] = useState(true)
  const [showCounters, setShowCounters] = useState(false)

  const roundCount = 3
  const roundLength = 2 // 2 minutes
  const segmentsPerRound = roundLength === 3 ? 6 : roundLength === 2 ? 4 : 3
  const totalSegmentsNeeded = segmentsPerRound * roundCount

  const researchDays = days.filter((d) => d.focus === "research").length
  const writingDays = days.filter((d) => d.focus === "writing").length
  const rehearsalDays = days.filter((d) => d.focus === "performance").length
  const restDays = days.filter((d) => d.focus === "rest").length

  const researchLevel: ResearchLevel = researchDays >= 3 ? "aggressive" : researchDays >= 1 ? "casual" : "none"

  const writtenSegments = segments.filter((s) => s.isWritten || s.isFreestyle).length
  const assignedSegments = segments.filter((s) => s.roundNum !== null).length
  const rehearsedRounds = [1, 2, 3].filter((round) => {
    const roundSegs = segments.filter((s) => s.roundNum === round)
    return roundSegs.length >= segmentsPerRound && roundSegs.every((s) => s.isRehearsed || s.isFreestyle)
  })

  useEffect(() => {
    async function fetchPrepData() {
      try {
        const res = await fetch(`/api/battles/${params.id}/prep`)
        if (res.ok) {
          const data = await res.json()
          setTotalPrepDays(data.totalPrepDays)
          setPrepLocked(data.isLocked)

          const initialDays: DayPlan[] = Array.from({ length: data.totalPrepDays }, (_, i) => {
            const prepBlock = data.prepBlocks.find((b: any) => b.day_index === i + 1)
            return {
              day: i + 1,
              focus: prepBlock?.focus || null,
              activities: [],
            }
          })
          setDays(initialDays)
        }
      } catch (error) {
        console.error("Failed to fetch prep data:", error)
        setDays(
          Array.from({ length: totalPrepDays }, (_, i) => ({
            day: i + 1,
            focus: null,
            activities: [],
          })),
        )
      } finally {
        setLoading(false)
      }
    }
    fetchPrepData()
  }, [params.id, totalPrepDays])

  const savePrepBlock = useCallback(
    async (dayIndex: number, focus: FocusType) => {
      setSaving(true)
      try {
        const res = await fetch(`/api/battles/${params.id}/prep`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day_index: dayIndex, focus }),
        })
        if (res.ok) {
          setSaveMessage("✓ Saved")
          setTimeout(() => setSaveMessage(null), 2000)
        }
      } catch (error) {
        console.error("Failed to save prep:", error)
        setSaveMessage("⚠ Save failed")
        setTimeout(() => setSaveMessage(null), 3000)
      } finally {
        setSaving(false)
      }
    },
    [params.id],
  )

  const handleFocusChange = useCallback(
    (day: number, focus: FocusType) => {
      if (prepLocked) return
      setDays((prev) => prev.map((d) => (d.day === day ? { ...d, focus } : d)))
      savePrepBlock(day, focus)
    },
    [prepLocked, savePrepBlock],
  )

  const handleDayClick = useCallback(
    (day: number) => {
      if (prepLocked) return
      setSelectedDay(day)
    },
    [prepLocked],
  )

  const handleDayFocusSelect = useCallback(
    (focus: FocusType) => {
      if (selectedDay && !prepLocked) {
        handleFocusChange(selectedDay, focus)
      }
    },
    [selectedDay, prepLocked, handleFocusChange],
  )

  const handleApplyTemplate = useCallback(
    (template: PrepTemplate) => {
      if (prepLocked) return
      setDays((prev) =>
        prev.map((d, i) => ({
          ...d,
          focus: template.plan[i] || null,
        })),
      )
      setShowTemplateModal(false)
      template.plan.forEach((focus, i) => {
        if (focus && i < totalPrepDays) {
          savePrepBlock(i + 1, focus)
        }
      })
    },
    [prepLocked, totalPrepDays, savePrepBlock],
  )

  const handleCopyLastBattle = useCallback(() => {
    if (prepLocked) return
    const lastBattlePlan: FocusType[] = [
      "writing",
      "writing",
      "rest",
      "performance",
      "writing",
      "performance",
      "rest",
      "writing",
      "rest",
      "writing",
    ]
    setDays((prev) => prev.map((d, i) => ({ ...d, focus: lastBattlePlan[i] || null })))
    lastBattlePlan.slice(0, totalPrepDays).forEach((focus, i) => {
      if (focus) savePrepBlock(i + 1, focus)
    })
  }, [prepLocked, totalPrepDays, savePrepBlock])

  const handleBalancedStrategy = useCallback(() => {
    if (prepLocked) return
    const balanced = prepTemplates.find((t) => t.id === "balanced")
    if (balanced) handleApplyTemplate(balanced)
  }, [handleApplyTemplate, prepLocked])

  const handleGrindStrategy = useCallback(() => {
    if (prepLocked) return
    const grind = prepTemplates.find((t) => t.id === "grind")
    if (grind) handleApplyTemplate(grind)
  }, [handleApplyTemplate, prepLocked])

  const handleLockPrep = useCallback(async () => {
    try {
      const res = await fetch(`/api/battles/${params.id}/lock-in`, {
        method: "POST",
      })
      if (res.ok) {
        setPrepLocked(true)
        setShowLockModal(false)
      }
    } catch (error) {
      console.error("Failed to lock prep:", error)
    }
  }, [params.id])

  const handleCreateSegment = (segmentData: Omit<PrepSegment, "id" | "createdAt" | "updatedAt">) => {
    const newSegment: PrepSegment = {
      ...segmentData,
      id: `seg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSegments([...segments, newSegment])
  }

  const handleAssignSegment = (segmentId: string, roundNum: number | null, position: number | null) => {
    setSegments(
      segments.map((s) => (s.id === segmentId ? { ...s, roundNum, position, updatedAt: new Date().toISOString() } : s)),
    )
  }

  const handleRemoveSegment = (segmentId: string) => {
    setSegments(segments.filter((s) => s.id !== segmentId))
    setCounters(counters.filter((c) => c.segmentId !== segmentId))
  }

  const handleAddCounter = (counter: Omit<PrepCounter, "id">) => {
    const newCounter: PrepCounter = {
      ...counter,
      id: `ctr-${Date.now()}`,
    }
    setCounters([...counters, newCounter])
  }

  const handleRemoveCounter = (counterId: string) => {
    setCounters(counters.filter((c) => c.id !== counterId))
  }

  const isCalendarComplete = days.length > 0 && days.every((d) => d.focus !== null)
  const canBattle = isCalendarComplete && assignedSegments >= totalSegmentsNeeded

  const impact = calculateImpactPreview(days)
  const selectedDayData = selectedDay ? days.find((d) => d.day === selectedDay) : null

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <NavHeader title="BATTLE PREP" backLabel="DASHBOARD" backHref="/dashboard" />

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {saveMessage && (
          <div className="fixed top-20 right-4 bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm text-green-500 font-mono z-50 animate-fade-in">
            {saveMessage}
          </div>
        )}

        {prepLocked && (
          <div className="mb-6 bg-green-900/20 border-2 border-green-600 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-green-500" />
              <div>
                <span className="text-green-500 font-display font-bold">PREP COMPLETE - LOCKED</span>
                <p className="text-sm text-zinc-400">Your prep plan is finalized. Ready to battle!</p>
              </div>
            </div>
            <Link
              href={`/battle/${params.id}/mode`}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 px-6 py-3 text-sm font-display font-bold text-white tracking-wide transition-colors"
            >
              <Swords className="w-5 h-5" />
              READY TO BATTLE
            </Link>
          </div>
        )}

        <div className="mb-6 bg-zinc-900 border-2 border-zinc-700 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-zinc-100">VS {mockBattleInfo.opponent.name}</h2>
              <p className="text-sm text-zinc-400">{mockBattleInfo.league}</p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl font-display font-bold text-orange-400">{roundCount}</div>
                <div className="text-xs text-zinc-500">ROUNDS</div>
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-orange-400">{roundLength}</div>
                <div className="text-xs text-zinc-500">MIN EACH</div>
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-orange-400">{totalSegmentsNeeded}</div>
                <div className="text-xs text-zinc-500">SEGMENTS</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400">Research</span>
                <span
                  className={
                    researchLevel === "aggressive"
                      ? "text-green-400"
                      : researchLevel === "casual"
                        ? "text-yellow-400"
                        : "text-red-400"
                  }
                >
                  {researchLevel.toUpperCase()}
                </span>
              </div>
              <div className="h-2 bg-zinc-800 border border-zinc-700">
                <div
                  className={`h-full ${researchLevel === "aggressive" ? "bg-green-500" : researchLevel === "casual" ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${researchLevel === "aggressive" ? 100 : researchLevel === "casual" ? 50 : 10}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-orange-400 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Writing
                </span>
                <span className="text-zinc-300">
                  {writtenSegments}/{totalSegmentsNeeded}
                </span>
              </div>
              <div className="h-2 bg-zinc-800 border border-zinc-700">
                <div
                  className={`h-full ${writtenSegments >= totalSegmentsNeeded ? "bg-green-500" : "bg-orange-500"}`}
                  style={{ width: `${Math.min((writtenSegments / totalSegmentsNeeded) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-purple-400 flex items-center gap-1">
                  <Mic2 className="w-3 h-3" /> Rehearsal
                </span>
                <span className="text-zinc-300">
                  {rehearsedRounds.length}/{roundCount} rounds
                </span>
              </div>
              <div className="h-2 bg-zinc-800 border border-zinc-700">
                <div
                  className={`h-full ${rehearsedRounds.length >= roundCount ? "bg-green-500" : "bg-purple-500"}`}
                  style={{ width: `${(rehearsedRounds.length / roundCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <BattleInfoCard battle={mockBattleInfo} />

            <PrepCalendar
              days={days}
              totalPrepDays={totalPrepDays}
              onDayClick={handleDayClick}
              selectedDay={selectedDay}
              isLocked={prepLocked}
            />

            <FocusLegend />

            {selectedDay && !prepLocked && (
              <DayDetailPanel
                day={selectedDay}
                currentFocus={selectedDayData?.focus || null}
                onFocusSelect={handleDayFocusSelect}
                onClose={() => setSelectedDay(null)}
                isLocked={prepLocked}
              />
            )}

            <div className="border-2 border-zinc-700">
              <button
                onClick={() => setShowCrafting(!showCrafting)}
                className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-display font-bold text-zinc-100">CONTENT CRAFTING</span>
                  <span
                    className={`text-sm font-mono ${assignedSegments >= totalSegmentsNeeded ? "text-green-400" : "text-orange-400"}`}
                  >
                    {assignedSegments}/{totalSegmentsNeeded} ready
                  </span>
                </div>
                {showCrafting ? (
                  <ChevronUp className="w-5 h-5 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                )}
              </button>

              {showCrafting && (
                <div className="p-4 space-y-4">
                  <ResearchLevelIndicator level={researchLevel} daysSpent={researchDays} />

                  <button
                    onClick={() => setShowSegmentCreator(true)}
                    className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-zinc-600 hover:border-orange-500 text-zinc-400 hover:text-orange-400 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-display font-bold">CREATE SEGMENT</span>
                    <span className="text-sm font-mono">
                      ({segments.length}/{totalSegmentsNeeded + 3} max)
                    </span>
                  </button>

                  <RoundOrganizer
                    segments={segments}
                    roundCount={roundCount}
                    segmentsPerRound={segmentsPerRound}
                    onAssignSegment={handleAssignSegment}
                    onRemoveSegment={handleRemoveSegment}
                  />
                </div>
              )}
            </div>

            <div className="border-2 border-zinc-700">
              <button
                onClick={() => setShowCounters(!showCounters)}
                className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-display font-bold text-zinc-100">COUNTER PREPARATION</span>
                  <span className="text-sm font-mono text-red-400">{counters.length}/1 slots</span>
                </div>
                {showCounters ? (
                  <ChevronUp className="w-5 h-5 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                )}
              </button>

              {showCounters && (
                <div className="p-4">
                  <CounterSlotManager
                    battleId={params.id as string}
                    segments={segments}
                    counters={counters}
                    maxCounterSlots={1}
                    onAddCounter={handleAddCounter}
                    onRemoveCounter={handleRemoveCounter}
                  />
                </div>
              )}
            </div>

            {!prepLocked && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard"
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 px-4 py-3 text-center text-sm font-display font-bold text-zinc-100 tracking-wide transition-colors"
                >
                  SAVE & RETURN
                </Link>
                <button
                  onClick={() => setShowLockModal(true)}
                  disabled={!isCalendarComplete}
                  className={`
                    flex-1 px-4 py-3 text-sm font-display font-bold tracking-wide transition-colors flex items-center justify-center gap-2
                    ${
                      isCalendarComplete
                        ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
                        : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                    }
                  `}
                >
                  <Lock className="w-4 h-4" />
                  LOCK PREP
                </button>
                <Link
                  href={`/battle/${params.id}/mode`}
                  className={`
                    flex-1 px-4 py-3 text-sm font-display font-bold tracking-wide transition-colors flex items-center justify-center gap-2
                    ${
                      canBattle
                        ? "bg-orange-600 hover:bg-orange-500 text-white"
                        : "bg-zinc-700 text-zinc-500 cursor-not-allowed pointer-events-none"
                    }
                  `}
                >
                  <Swords className="w-4 h-4" />
                  READY TO BATTLE
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-900 border-2 border-zinc-700 p-4 space-y-3">
              <h3 className="font-display font-bold text-zinc-100">PREP PROGRESS</h3>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-400">Research</span>
                  <span
                    className={
                      researchLevel === "aggressive"
                        ? "text-green-400"
                        : researchLevel === "casual"
                          ? "text-yellow-400"
                          : "text-red-400"
                    }
                  >
                    {researchLevel.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-400">Segments Written</span>
                  <span className="text-zinc-300">{writtenSegments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-400">Segments Assigned</span>
                  <span className={assignedSegments >= totalSegmentsNeeded ? "text-green-400" : "text-orange-400"}>
                    {assignedSegments}/{totalSegmentsNeeded}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-teal-400">Rest Days</span>
                  <span className="text-zinc-300">{restDays}</span>
                </div>
              </div>
            </div>

            <PrepAssistant
              recommendations={defaultRecommendations}
              impact={impact}
              onCopyLastBattle={handleCopyLastBattle}
              onBalancedStrategy={handleBalancedStrategy}
              onGrindStrategy={handleGrindStrategy}
            />

            {!prepLocked && (
              <button
                onClick={() => setShowTemplateModal(true)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 px-4 py-3 text-sm font-display font-bold text-zinc-100 tracking-wide transition-colors"
              >
                SELECT TEMPLATE...
              </button>
            )}

            {prepLocked && (
              <Link
                href={`/battle/${params.id}/mode`}
                className="block w-full bg-orange-600 hover:bg-orange-500 px-4 py-4 text-center text-sm font-display font-bold text-white tracking-wide transition-colors"
              >
                <Swords className="w-5 h-5 inline-block mr-2" />
                READY TO BATTLE
              </Link>
            )}
          </div>
        </div>
      </main>

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        templates={prepTemplates}
        onApply={handleApplyTemplate}
      />

      <LockPrepModal
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        onConfirm={handleLockPrep}
        predictedScore={impact.predictedScore}
        chokeRisk={impact.chokeRisk}
        restDays={restDays}
        stressLevel={impact.stressChange.to}
      />

      <SegmentCreatorModal
        isOpen={showSegmentCreator}
        onClose={() => setShowSegmentCreator(false)}
        onCreateSegment={handleCreateSegment}
        battleId={params.id as string}
        researchLevel={researchLevel}
        existingSegmentsCount={segments.length}
        maxSegments={totalSegmentsNeeded + 3}
      />
    </div>
  )
}
