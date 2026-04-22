import { redirect, notFound } from 'next/navigation'
import { getAdminSession } from '@/lib/admin/auth'
import { canAccess } from '@/lib/admin/access'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import BlogEditorClient from '@/components/admin/blog/BlogEditorClient'
import type { BlogPost } from '@/components/admin/blog/BlogEditorClient'

export const metadata = { title: 'Edit Post — ACE Voyages Admin' }

export default async function BlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!canAccess(session.role, 'blog')) redirect('/admin/dashboard')

  const { id } = await params
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select(
      'post_id, title, slug, excerpt, hero_image_url, body_json, category, is_published, is_featured',
    )
    .eq('post_id', id)
    .single()

  if (error || !data) notFound()

  const post: BlogPost = {
    post_id:       data.post_id,
    title:         data.title ?? '',
    slug:          data.slug ?? '',
    excerpt:       data.excerpt ?? '',
    hero_image_url: data.hero_image_url ?? '',
    body_json:     data.body_json as Record<string, unknown> | null,
    category:      data.category ?? '',
    is_published:  data.is_published ?? false,
    is_featured:   data.is_featured ?? false,
  }

  return <BlogEditorClient initialPost={post} userRole={session.role} />
}
