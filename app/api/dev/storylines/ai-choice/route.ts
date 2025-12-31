import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import { createStorylineEngine, StorylineChapter, StorylineChoice } from "@/lib/game/storylineEngine"

/**
 * POST /api/dev/storylines/ai-choice
 *
 * Let AI make a choice in an active storyline
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { storylineId, chapterId, strategy = "random" } = body

    if (!storylineId || !chapterId) {
      return NextResponse.json(
        { error: "storylineId and chapterId required" },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const engine = createStorylineEngine(supabase)

    // Get the storyline with its template
    const { data: storyline, error: storylineError } = await supabase
      .from("active_storylines")
      .select(`
        *,
        storyline_templates (*)
      `)
      .eq("id", storylineId)
      .single()

    if (storylineError || !storyline) {
      return NextResponse.json({ error: "Storyline not found" }, { status: 404 })
    }

    const template = storyline.storyline_templates as any
    const chapters = template.chapters as StorylineChapter[]
    const chapter = chapters.find((c) => c.id === chapterId)

    if (!chapter || !chapter.choices || chapter.choices.length === 0) {
      return NextResponse.json({ error: "No choices available" }, { status: 400 })
    }

    // AI choice selection based on strategy
    let selectedChoice: StorylineChoice

    switch (strategy) {
      case "best":
        // Choose the option with most positive effects
        selectedChoice = chapter.choices.reduce((best, choice) => {
          const score = calculateEffectScore(choice.effects)
          const bestScore = calculateEffectScore(best.effects)
          return score > bestScore ? choice : best
        }, chapter.choices[0])
        break

      case "worst":
        // Choose the option with most negative effects
        selectedChoice = chapter.choices.reduce((worst, choice) => {
          const score = calculateEffectScore(choice.effects)
          const worstScore = calculateEffectScore(worst.effects)
          return score < worstScore ? choice : worst
        }, chapter.choices[0])
        break

      case "balanced":
        // Choose an option with moderate effects (closest to 0)
        selectedChoice = chapter.choices.reduce((balanced, choice) => {
          const score = Math.abs(calculateEffectScore(choice.effects))
          const balancedScore = Math.abs(calculateEffectScore(balanced.effects))
          return score < balancedScore ? choice : balanced
        }, chapter.choices[0])
        break

      case "random":
      default:
        // Random selection
        const randomIndex = Math.floor(Math.random() * chapter.choices.length)
        selectedChoice = chapter.choices[randomIndex]
        break
    }

    // Process the choice through the engine
    const result = await engine.processChoice(storylineId, chapterId, selectedChoice.id)

    return NextResponse.json({
      success: result.success,
      choiceId: selectedChoice.id,
      choiceLabel: selectedChoice.label,
      effectsApplied: result.effectsApplied,
      prepDaysLost: result.prepDaysLost,
      nextChapter: result.nextChapter ? {
        id: result.nextChapter.id,
        title: result.nextChapter.title,
      } : undefined,
      ending: result.ending ? {
        id: result.ending.id,
        type: result.ending.type,
        title: result.ending.title,
      } : undefined,
      error: result.error,
    })
  } catch (err) {
    console.error("AI choice error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
