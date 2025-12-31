import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/db/server'
import { createStorylineEngine } from '@/lib/game/storylineEngine'

/**
 * GET /api/storylines
 * Get all active storylines for the current battler
 */
export async function GET() {
  try {
    const supabase = createServerClient()

    // Get the player's battler
    const { data: playerBattler } = await supabase
      .from('battlers')
      .select('id')
      .eq('is_ai', false)
      .limit(1)
      .single()

    if (!playerBattler) {
      return NextResponse.json(
        { error: 'No player battler found' },
        { status: 404 }
      )
    }

    // Create storyline engine instance
    const engine = createStorylineEngine(supabase)

    // Get active storylines
    const storylines = await engine.getActiveStorylines(playerBattler.id)

    // For each active storyline, fetch the template data to get chapter/ending info
    const enrichedStorylines = await Promise.all(
      storylines.map(async (storyline) => {
        const { data: template } = await supabase
          .from('storyline_templates')
          .select('*')
          .eq('code', storyline.template_code)
          .single()

        if (!template) {
          return storyline
        }

        // Find current chapter details
        const chapters = template.chapters as any[]
        const currentChapter = chapters.find(
          (c: any) => c.id === storyline.current_chapter_id
        )

        return {
          ...storyline,
          template_name: template.name,
          template_description: template.description,
          category: template.category,
          current_chapter: currentChapter
            ? {
                id: currentChapter.id,
                title: currentChapter.title,
                description: currentChapter.description,
                urgency: currentChapter.urgency,
                deadline_hours: currentChapter.deadline_hours,
                prep_days_cost: currentChapter.prep_days_cost,
                choices: currentChapter.choices,
              }
            : null,
        }
      })
    )

    return NextResponse.json({
      success: true,
      storylines: enrichedStorylines,
    })
  } catch (error) {
    console.error('Error fetching active storylines:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch storylines',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
