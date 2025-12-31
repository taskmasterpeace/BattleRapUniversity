import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const battlerId = searchParams.get('battlerId')

    if (!battlerId) {
      return NextResponse.json({ error: 'battlerId required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get active storylines with template data
    const { data: storylines, error } = await supabase
      .from('active_storylines')
      .select(`
        id,
        template_code,
        current_chapter_id,
        status,
        choices_made,
        started_at,
        next_chapter_available_at,
        next_chapter_deadline,
        total_prep_days_lost,
        storyline_templates (
          code,
          name,
          description,
          category,
          min_chapters,
          max_chapters,
          chapters,
          endings
        )
      `)
      .eq('battler_id', battlerId)
      .eq('status', 'active')
      .order('started_at', { ascending: false })

    if (error) {
      console.error('Error fetching storylines:', error)
      return NextResponse.json({ error: 'Failed to fetch storylines' }, { status: 500 })
    }

    return NextResponse.json({ storylines: storylines || [] })
  } catch (err) {
    console.error('Storylines API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
