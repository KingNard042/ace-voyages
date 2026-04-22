import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, logActivity } from '@/lib/admin/auth'
import { canAccess } from '@/lib/admin/access'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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

// GET — fetch single post
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  if (!canAccess(session.role, 'blog')) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

  const { id } = await params
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('post_id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  }

  return NextResponse.json({ post: data })
}

// PATCH — update existing post
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  if (!canAccess(session.role, 'blog')) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // Fetch current post for audit log
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('post_id, title, is_published')
    .eq('post_id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  }

  const { title, slug, excerpt, hero_image_url, body_json, category, is_published, is_featured } = body

  if (category && !VALID_CATEGORIES.has(category as string)) {
    return NextResponse.json({ error: 'Invalid category.' }, { status: 400 })
  }

  // Agents cannot publish
  const wantsPublish = is_published === true
  const canPublish = session.role !== 'agent_admin'
  const publish = wantsPublish && canPublish

  const bodyText = body_json
    ? extractPlainText(body_json as Record<string, unknown>)
    : undefined

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (title !== undefined) updates.title = (title as string).trim()
  if (slug !== undefined) updates.slug = (slug as string).trim()
  if (excerpt !== undefined) updates.excerpt = excerpt ? (excerpt as string).trim() : null
  if (hero_image_url !== undefined) updates.hero_image_url = hero_image_url || null
  if (body_json !== undefined) updates.body_json = body_json || null
  if (bodyText !== undefined) updates.body_text = bodyText || null
  if (category !== undefined) updates.category = category || null
  if (is_published !== undefined && canPublish) {
    updates.is_published = publish
    if (publish && !existing.is_published) {
      updates.published_at = new Date().toISOString()
    } else if (!publish) {
      updates.published_at = null
    }
  }
  if (is_featured !== undefined) updates.is_featured = is_featured === true

  const { error } = await supabase.from('blog_posts').update(updates).eq('post_id', id)

  if (error) {
    console.error('[PATCH /api/admin/blog/[id]]', error.message)
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A post with this slug already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update post.' }, { status: 500 })
  }

  const wasPublished = !existing.is_published && publish
  if (wasPublished) {
    void logActivity({
      adminId: session.userId,
      action: 'publish_blog_post',
      entityType: 'blog',
      entityId: id,
      metadata: { title: existing.title, admin_name: session.name },
    })
  }

  return NextResponse.json({ success: true })
}

// DELETE — remove post (super_admin / manager_admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  if (session.role === 'agent_admin') {
    return NextResponse.json({ error: 'Agents cannot delete posts.' }, { status: 403 })
  }

  const { id } = await params
  const supabase = createServerSupabaseClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('title')
    .eq('post_id', id)
    .single()

  const { error } = await supabase.from('blog_posts').delete().eq('post_id', id)

  if (error) {
    console.error('[DELETE /api/admin/blog/[id]]', error.message)
    return NextResponse.json({ error: 'Failed to delete post.' }, { status: 500 })
  }

  void logActivity({
    adminId: session.userId,
    action: 'delete_blog_post',
    entityType: 'blog',
    entityId: id,
    metadata: { title: post?.title, admin_name: session.name },
  })

  return NextResponse.json({ success: true })
}
