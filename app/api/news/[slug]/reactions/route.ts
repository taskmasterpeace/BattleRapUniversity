import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// GET - Get reactions for an article and current user's reaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get current user from session
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabaseUser.auth.getUser()

    // Get article by slug
    const { data: article, error: articleError } = await supabaseAdmin
      .from('news_articles')
      .select('id, reaction_counts, blogger_id')
      .eq('slug', slug)
      .single()

    if (articleError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Get user's reaction if logged in
    let userReaction = null
    if (user) {
      const { data: reaction } = await supabaseAdmin
        .from('article_reactions')
        .select('reaction_type')
        .eq('article_id', article.id)
        .eq('user_id', user.id)
        .single()

      userReaction = reaction?.reaction_type || null
    }

    // Get blogger info if available
    let blogger = null
    if (article.blogger_id) {
      const { data: bloggerData } = await supabaseAdmin
        .from('bloggers')
        .select('name, handle, credibility_score')
        .eq('id', article.blogger_id)
        .single()

      blogger = bloggerData
    }

    return NextResponse.json({
      articleId: article.id,
      reactionCounts: article.reaction_counts || {
        facts: 0,
        cap: 0,
        fire: 0,
        mid: 0,
        debatable: 0
      },
      userReaction,
      blogger
    })
  } catch (error) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add or update a reaction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { reactionType } = body

    if (!reactionType || !['facts', 'cap', 'fire', 'mid', 'debatable'].includes(reactionType)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 })
    }

    // Get current user from session
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get article by slug
    const { data: article, error: articleError } = await supabaseAdmin
      .from('news_articles')
      .select('id')
      .eq('slug', slug)
      .single()

    if (articleError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Get user's battler (optional, for grudge tracking)
    const { data: battler } = await supabaseAdmin
      .from('battlers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    // Check for existing reaction
    const { data: existingReaction } = await supabaseAdmin
      .from('article_reactions')
      .select('id, reaction_type')
      .eq('article_id', article.id)
      .eq('user_id', user.id)
      .single()

    if (existingReaction) {
      // Delete old reaction first (trigger will update counts)
      await supabaseAdmin
        .from('article_reactions')
        .delete()
        .eq('id', existingReaction.id)
    }

    // Insert new reaction
    const { error: insertError } = await supabaseAdmin
      .from('article_reactions')
      .insert({
        article_id: article.id,
        user_id: user.id,
        battler_id: battler?.id || null,
        reaction_type: reactionType
      })

    if (insertError) {
      console.error('Error inserting reaction:', insertError)
      return NextResponse.json({ error: 'Failed to save reaction' }, { status: 500 })
    }

    // Get updated counts
    const { data: updatedArticle } = await supabaseAdmin
      .from('news_articles')
      .select('reaction_counts')
      .eq('id', article.id)
      .single()

    return NextResponse.json({
      success: true,
      reactionCounts: updatedArticle?.reaction_counts || {
        facts: 0,
        cap: 0,
        fire: 0,
        mid: 0,
        debatable: 0
      },
      userReaction: reactionType
    })
  } catch (error) {
    console.error('Error saving reaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove a reaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get current user from session
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get article by slug
    const { data: article, error: articleError } = await supabaseAdmin
      .from('news_articles')
      .select('id')
      .eq('slug', slug)
      .single()

    if (articleError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Delete reaction
    const { error: deleteError } = await supabaseAdmin
      .from('article_reactions')
      .delete()
      .eq('article_id', article.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting reaction:', deleteError)
      return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 })
    }

    // Get updated counts
    const { data: updatedArticle } = await supabaseAdmin
      .from('news_articles')
      .select('reaction_counts')
      .eq('id', article.id)
      .single()

    return NextResponse.json({
      success: true,
      reactionCounts: updatedArticle?.reaction_counts || {
        facts: 0,
        cap: 0,
        fire: 0,
        mid: 0,
        debatable: 0
      },
      userReaction: null
    })
  } catch (error) {
    console.error('Error removing reaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
