import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"

/**
 * GET /api/dev/storylines/templates
 *
 * Get all storyline templates
 */
export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: templates, error } = await supabase
      .from("storyline_templates")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching templates:", error)
      return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
    }

    return NextResponse.json({ templates: templates || [] })
  } catch (err) {
    console.error("Templates fetch error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/dev/storylines/templates
 *
 * Create a new storyline template
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, name, description, category, min_chapters, max_chapters, trigger_config, chapters, endings } = body

    if (!code || !name || !category || !chapters || !endings) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: template, error } = await supabase
      .from("storyline_templates")
      .insert({
        code,
        name,
        description,
        category,
        min_chapters: min_chapters || 2,
        max_chapters: max_chapters || 5,
        trigger_config: trigger_config || {},
        chapters,
        endings,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating template:", error)
      return NextResponse.json({ error: error.message || "Failed to create template" }, { status: 500 })
    }

    return NextResponse.json({ success: true, template })
  } catch (err) {
    console.error("Create template error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * PUT /api/dev/storylines/templates
 *
 * Update a storyline template by ID
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, code, name, description, category, min_chapters, max_chapters, trigger_config, chapters, endings, is_active } = body

    if (!id) {
      return NextResponse.json({ error: "Template ID required" }, { status: 400 })
    }

    const supabase = createServerClient()

    const updateData: Record<string, unknown> = {}
    if (code !== undefined) updateData.code = code
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (min_chapters !== undefined) updateData.min_chapters = min_chapters
    if (max_chapters !== undefined) updateData.max_chapters = max_chapters
    if (trigger_config !== undefined) updateData.trigger_config = trigger_config
    if (chapters !== undefined) updateData.chapters = chapters
    if (endings !== undefined) updateData.endings = endings
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: template, error } = await supabase
      .from("storyline_templates")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating template:", error)
      return NextResponse.json({ error: error.message || "Failed to update template" }, { status: 500 })
    }

    return NextResponse.json({ success: true, template })
  } catch (err) {
    console.error("Update template error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/dev/storylines/templates
 *
 * Delete a storyline template by ID (passed as query param)
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Template ID required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if template is being used by active storylines
    const { data: activeUses } = await supabase
      .from("active_storylines")
      .select("id")
      .eq("template_code", id)
      .eq("status", "active")
      .limit(1)

    if (activeUses && activeUses.length > 0) {
      return NextResponse.json({
        error: "Cannot delete template that is in use by active storylines"
      }, { status: 400 })
    }

    const { error } = await supabase
      .from("storyline_templates")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting template:", error)
      return NextResponse.json({ error: error.message || "Failed to delete template" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete template error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
