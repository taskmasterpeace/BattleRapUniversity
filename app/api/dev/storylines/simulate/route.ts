import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import { createStorylineEngine, StorylineChapter, StorylineChoice, StorylineEnding } from "@/lib/game/storylineEngine"

interface SimulationPath {
  choices: { chapterId: string; choiceId: string; choiceLabel: string }[]
  ending: { id: string; type: string; title: string } | null
  effectsApplied: any[]
  totalPrepDaysLost: number
}

interface SimulationResult {
  templateCode: string
  templateName: string
  iterations: number
  paths: SimulationPath[]
  endingDistribution: Record<string, { count: number; percentage: number; type: string }>
  averagePrepDaysLost: number
  averageChaptersVisited: number
  uniquePaths: number
}

/**
 * POST /api/dev/storylines/simulate
 *
 * Run multiple simulations of a storyline template to analyze paths and outcomes
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { templateCode, iterations = 100, strategy = "random" } = body

    if (!templateCode) {
      return NextResponse.json(
        { error: "templateCode required" },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get the template
    const { data: template, error: templateError } = await supabase
      .from("storyline_templates")
      .select("*")
      .eq("code", templateCode)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    const chapters = template.chapters as StorylineChapter[]
    const endings = template.endings as StorylineEnding[]

    // Run simulations
    const paths: SimulationPath[] = []
    const endingCounts: Record<string, { count: number; type: string }> = {}

    // Initialize ending counts
    for (const ending of endings) {
      endingCounts[ending.id] = { count: 0, type: ending.type }
    }

    for (let i = 0; i < iterations; i++) {
      const path = simulatePath(chapters, endings, strategy)
      paths.push(path)

      if (path.ending) {
        if (!endingCounts[path.ending.id]) {
          endingCounts[path.ending.id] = { count: 0, type: path.ending.type }
        }
        endingCounts[path.ending.id].count++
      }
    }

    // Calculate ending distribution
    const endingDistribution: Record<string, { count: number; percentage: number; type: string }> = {}
    for (const [endingId, data] of Object.entries(endingCounts)) {
      const ending = endings.find(e => e.id === endingId)
      endingDistribution[endingId] = {
        count: data.count,
        percentage: Math.round((data.count / iterations) * 100),
        type: data.type
      }
    }

    // Calculate averages
    const avgPrepDaysLost = paths.reduce((sum, p) => sum + p.totalPrepDaysLost, 0) / iterations
    const avgChapters = paths.reduce((sum, p) => sum + p.choices.length, 0) / iterations

    // Count unique paths
    const pathStrings = paths.map(p => p.choices.map(c => c.choiceId).join("->"))
    const uniquePaths = new Set(pathStrings).size

    const result: SimulationResult = {
      templateCode: template.code,
      templateName: template.name,
      iterations,
      paths: paths.slice(0, 10), // Only return first 10 paths for inspection
      endingDistribution,
      averagePrepDaysLost: Math.round(avgPrepDaysLost * 10) / 10,
      averageChaptersVisited: Math.round(avgChapters * 10) / 10,
      uniquePaths
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error("Simulation error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function simulatePath(
  chapters: StorylineChapter[],
  endings: StorylineEnding[],
  strategy: string
): SimulationPath {
  const path: SimulationPath = {
    choices: [],
    ending: null,
    effectsApplied: [],
    totalPrepDaysLost: 0
  }

  // Start with first chapter
  let currentChapter = chapters.find(c => c.chapter_number === 1)
  if (!currentChapter) {
    currentChapter = chapters[0]
  }

  const maxIterations = 20 // Prevent infinite loops
  let iteration = 0

  while (currentChapter && iteration < maxIterations) {
    iteration++

    if (!currentChapter.choices || currentChapter.choices.length === 0) {
      break
    }

    // Add prep days cost
    if (currentChapter.prep_days_cost) {
      path.totalPrepDaysLost += currentChapter.prep_days_cost
    }

    // Select choice based on strategy
    const choice = selectChoice(currentChapter.choices, strategy)

    path.choices.push({
      chapterId: currentChapter.id,
      choiceId: choice.id,
      choiceLabel: choice.label
    })

    // Track effects
    if (choice.effects) {
      path.effectsApplied.push(...choice.effects)
    }

    // Follow the choice
    if (choice.leads_to.type === "ending") {
      const ending = endings.find(e => e.id === choice.leads_to.id)
      if (ending) {
        path.ending = {
          id: ending.id,
          type: ending.type,
          title: ending.title
        }
        // Add ending effects
        if (ending.effects) {
          path.effectsApplied.push(...ending.effects)
        }
      }
      break
    } else if (choice.leads_to.type === "chapter") {
      currentChapter = chapters.find(c => c.id === choice.leads_to.id)
    } else {
      break
    }
  }

  return path
}

function selectChoice(choices: StorylineChoice[], strategy: string): StorylineChoice {
  switch (strategy) {
    case "best":
      return choices.reduce((best, choice) => {
        const score = calculateEffectScore(choice.effects)
        const bestScore = calculateEffectScore(best.effects)
        return score > bestScore ? choice : best
      }, choices[0])

    case "worst":
      return choices.reduce((worst, choice) => {
        const score = calculateEffectScore(choice.effects)
        const worstScore = calculateEffectScore(worst.effects)
        return score < worstScore ? choice : worst
      }, choices[0])

    case "balanced":
      return choices.reduce((balanced, choice) => {
        const score = Math.abs(calculateEffectScore(choice.effects))
        const balancedScore = Math.abs(calculateEffectScore(balanced.effects))
        return score < balancedScore ? choice : balanced
      }, choices[0])

    case "random":
    default:
      const randomIndex = Math.floor(Math.random() * choices.length)
      return choices[randomIndex]
  }
}

function calculateEffectScore(effects: any[]): number {
  if (!effects || effects.length === 0) return 0

  let score = 0
  const positiveAttrs = ["reputation", "financial_stability", "family_bond", "resilience", "preparation"]
  const negativeAttrs = ["stress", "prep_days_lost"]

  for (const effect of effects) {
    for (const attr of positiveAttrs) {
      if (effect[attr] !== undefined) {
        score += effect[attr]
      }
    }
    for (const attr of negativeAttrs) {
      if (effect[attr] !== undefined) {
        score -= effect[attr]
      }
    }
  }

  return score
}
