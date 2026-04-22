import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin/auth'
import { canAccess } from '@/lib/admin/access'
import BlogEditorClient from '@/components/admin/blog/BlogEditorClient'

export const metadata = { title: 'New Post — ACE Voyages Admin' }

export default async function BlogCreatePage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!canAccess(session.role, 'blog')) redirect('/admin/dashboard')

  return <BlogEditorClient initialPost={null} userRole={session.role} />
}
