import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin/auth'
import { canAccess } from '@/lib/admin/access'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logActivity } from '@/lib/admin/auth'

const VALID_CATEGORIES = new Set([
  'visa-tips',
  'travel-guides',
  'destination-spotlight',
  'packing-tips',
])

function extractPlainText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as Record<string, unknown>
  if (n.type === 'text') return (n.text as string) ?? ''
  if (Array.isArray(n.content)) {
    return n.content
      .map((child) => extractPlainText(child))
      .join(n.type === 'paragraph' || n.type === 'heading' ? '\n' : ' ')
  }
  return ''
}

// GET — list all posts (most recent first)
export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  if (!canAccess(session.role, 'blog')) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('post_id, title, slug, category, is_published, is_featured, published_at, created_at, hero_image_url')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('[GET /api/admin/blog]', error.message)
    return NextResponse.json({ error: 'Failed to load posts.' }, { status: 500 })
  }

  return NextResponse.json({ posts: data ?? [] })
}

// POST — create new draft post
export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  if (!canAccess(session.role, 'blog')) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { title, slug, excerpt, hero_image_url, body_json, category, is_published, is_featured } = body

  // Validate required
  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
  }
  if (!slug || typeof slug !== 'string' || !slug.trim()) {
    return NextResponse.json({ error: 'Slug is required.' }, { status: 400 })
  }
  if (category && !VALID_CATEGORIES.has(category as string)) {
    return NextResponse.json({ error: 'Invalid category.' }, { status: 400 })
  }

  // Agents cannot publish
  const publish = is_published === true && session.role !== 'agent_admin'

  // Extract plain text from TipTap JSON for full-text search
  const bodyText = body_json
    ? extractPlainText(body_json as Record<string, unknown>)
    : null

  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: (title as string).trim(),
      slug: (slug as string).trim(),
      excerpt: excerpt ? (excerpt as string).trim() : null,
      hero_image_url: hero_image_url || null,
      body_json: body_json || null,
      body_text: bodyText || null,
      category: category || null,
      is_published: publish,
      is_featured: is_featured === true,
      published_at: publish ? new Date().toISOString() : null,
    })
    .select('post_id')
    .single()

  if (error) {
    console.error('[POST /api/admin/blog]', error.message)
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A post with this slug already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create post.' }, { status: 500 })
  }

  void logActivity({
    adminId: session.userId,
    action: publish ? 'publish_blog_post' : 'create_blog_draft',
    entityType: 'blog',
    entityId: data.post_id,
    metadata: { title, slug, admin_name: session.name },
  })

  return NextResponse.json({ post_id: data.post_id }, { status: 201 })
}
