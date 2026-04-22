import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/admin/auth'
import { canAccess } from '@/lib/admin/access'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  Plus, FileText, Globe, Eye, Calendar, Tag,
  Star, Edit3, BookOpen,
} from 'lucide-react'

interface BlogPost {
  post_id: string
  title: string
  slug: string
  category: string | null
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  created_at: string
  hero_image_url: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  'visa-tips': 'Visa Tips',
  'travel-guides': 'Travel Guides',
  'destination-spotlight': 'Destination Spotlight',
  'packing-tips': 'Packing Tips',
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'visa-tips':              { bg: '#EEF4FB', text: '#105fa3' },
  'travel-guides':          { bg: '#FEF3C7', text: '#92400E' },
  'destination-spotlight':  { bg: '#F0FDF4', text: '#166534' },
  'packing-tips':           { bg: '#FDF4FF', text: '#7E22CE' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const metadata = { title: 'Blog — ACE Voyages Admin' }

export default async function BlogListPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!canAccess(session.role, 'blog')) redirect('/admin/dashboard')

  const supabase = createServerSupabaseClient()

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select(
      'post_id, title, slug, category, is_published, is_featured, published_at, created_at, hero_image_url',
    )
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) console.error('[blog list]', error.message)

  const rows = (posts ?? []) as BlogPost[]
  const total = rows.length
  const published = rows.filter((p) => p.is_published).length
  const drafts = total - published
  const featured = rows.filter((p) => p.is_featured).length

  const canPublish = session.role !== 'agent_admin'

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-[#1A1A2E]"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            Blog Studio
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Create and manage travel stories, visa guides, and destination spotlights.
          </p>
        </div>
        <Link
          href="/admin/blog/create"
          className="flex items-center gap-2 rounded-xl bg-[#105fa3] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus size={15} />
          New Post
        </Link>
      </div>

      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Posts',  value: total,     icon: BookOpen,  color: '#105fa3', bg: '#EEF4FB' },
          { label: 'Published',    value: published,  icon: Globe,     color: '#166534', bg: '#F0FDF4' },
          { label: 'Drafts',       value: drafts,     icon: FileText,  color: '#6B7280', bg: '#F3F4F6' },
          { label: 'Featured',     value: featured,   icon: Star,      color: '#D4A017', bg: '#FFFBEB' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl mb-3"
              style={{ backgroundColor: bg }}
            >
              <Icon size={16} style={{ color }} />
            </div>
            <p className="text-2xl font-bold text-[#1A1A2E]">{value}</p>
            <p className="mt-0.5 text-xs text-[#6B7280]">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Posts Table ─────────────────────────────────── */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F4F6]">
            <FileText size={24} className="text-[#9CA3AF]" />
          </div>
          <p className="font-semibold text-[#1A1A2E]">No posts yet</p>
          <p className="mt-1 text-sm text-[#6B7280]">
            Start creating your first travel story or guide.
          </p>
          <Link
            href="/admin/blog/create"
            className="mt-5 flex items-center gap-2 rounded-xl bg-[#105fa3] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F3F4F6]">
            <p className="text-sm font-semibold text-[#1A1A2E]">
              {total} post{total !== 1 ? 's' : ''}
            </p>
            <span className="text-xs text-[#9CA3AF]">
              {published} published · {drafts} draft{drafts !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F3F4F6]">
                  {['Post', 'Category', 'Status', 'Date', ''].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {rows.map((post) => {
                  const catStyle = post.category
                    ? (CATEGORY_COLORS[post.category] ?? { bg: '#F3F4F6', text: '#6B7280' })
                    : { bg: '#F3F4F6', text: '#6B7280' }

                  return (
                    <tr
                      key={post.post_id}
                      className="transition-colors hover:bg-[#F8F9FA] group"
                    >
                      {/* Post info */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex items-start gap-3">
                          {/* Thumbnail */}
                          <div className="shrink-0 h-10 w-14 rounded-lg overflow-hidden bg-[#F3F4F6]">
                            {post.hero_image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={post.hero_image_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <FileText size={14} className="text-[#D1D5DB]" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1A1A2E] line-clamp-1 group-hover:text-[#105fa3] transition-colors">
                              {post.title}
                            </p>
                            <p className="mt-0.5 text-xs text-[#9CA3AF] font-mono truncate max-w-[220px]">
                              /blog/{post.slug}
                            </p>
                            {post.is_featured && (
                              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#D4A017]">
                                <Star size={9} className="fill-current" />
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        {post.category ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
                          >
                            <Tag size={9} />
                            {CATEGORY_LABELS[post.category] ?? post.category}
                          </span>
                        ) : (
                          <span className="text-xs text-[#D1D5DB]">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            post.is_published
                              ? 'bg-[#D1FAE5] text-[#065F46]'
                              : 'bg-[#F3F4F6] text-[#6B7280]'
                          }`}
                        >
                          {post.is_published ? (
                            <><Eye size={9} /> Published</>
                          ) : (
                            <><FileText size={9} /> Draft</>
                          )}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                          <Calendar size={10} />
                          {post.is_published && post.published_at
                            ? formatDate(post.published_at)
                            : formatDate(post.created_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {post.is_published && (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#105fa3] transition-colors"
                              title="View live"
                            >
                              <Globe size={14} />
                            </Link>
                          )}
                          {(canPublish || session.role === 'agent_admin') && (
                            <Link
                              href={`/admin/blog/${post.post_id}`}
                              className="flex items-center gap-1.5 rounded-lg bg-[#EEF4FB] px-3 py-1.5 text-xs font-semibold text-[#105fa3] hover:bg-[#105fa3] hover:text-white transition-all"
                            >
                              <Edit3 size={11} />
                              Edit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
