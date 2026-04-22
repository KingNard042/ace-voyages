import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Calendar, Tag, ArrowLeft, MessageCircle } from 'lucide-react'
import { getBlogPostBySlug, getPublishedBlogPosts } from '@/lib/content'
import TipTapRenderer from '@/components/blog/TipTapRenderer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; bg: string; text: string }> = {
  'visa-tips':             { label: 'Visa Tips',             bg: '#EEF4FB', text: '#105fa3' },
  'travel-guides':         { label: 'Travel Guides',         bg: '#FEF3C7', text: '#92400E' },
  'destination-spotlight': { label: 'Destination Spotlight', bg: '#F0FDF4', text: '#166534' },
  'packing-tips':          { label: 'Packing Tips',          bg: '#FDF4FF', text: '#7E22CE' },
}

const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function readingTime(text: string | null): string {
  if (!text) return '1 min read'
  const words = text.trim().split(/\s+/).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

// ─── Static params for SSG ────────────────────────────────────────────────────

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return { title: 'Article Not Found | ACE Voyages' }

  return {
    title: `${post.title} | ACE Voyages`,
    description: post.excerpt ?? 'Travel tips and guides from ACE Voyages.',
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      images: post.hero_image_url
        ? [{ url: post.hero_image_url, width: 1200, height: 630, alt: post.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.hero_image_url ? [post.hero_image_url] : [],
    },
  }
}

// ─── Related Posts ────────────────────────────────────────────────────────────

async function getRelatedPosts(currentSlug: string, category: string | null) {
  const all = await getPublishedBlogPosts()
  return all
    .filter((p) => p.slug !== currentSlug)
    .filter((p) => !category || p.category === category)
    .slice(0, 3)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) notFound()

  const related = await getRelatedPosts(slug, post.category)
  const cat = post.category ? CATEGORY_META[post.category] : null
  const pubDate = post.published_at ?? post.created_at
  const rt = readingTime(post.body_text)

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative h-[60vh] min-h-[380px] max-h-[620px] overflow-hidden">
        <Image
          src={post.hero_image_url ?? FALLBACK_HERO}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Layered gradient for editorial depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a3a]/90 via-[#0c1a3a]/40 to-transparent" />

        {/* Content anchored to bottom */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Back link */}
            <Link
              href="/blog"
              className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <ArrowLeft size={12} />
              All Articles
            </Link>

            {/* Category */}
            {cat && (
              <div className="mb-3">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm"
                  style={{ backgroundColor: cat.bg, color: cat.text }}
                >
                  <Tag size={10} />
                  {cat.label}
                </span>
              </div>
            )}

            {/* Title */}
            <h1
              className="text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-[2.625rem] lg:leading-[1.2]"
              style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
            >
              {post.title}
            </h1>

            {/* Meta row */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {formatDate(pubDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {rt}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Article Body ──────────────────────────────────────────────────── */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">

            {/* Article content */}
            <article>
              {/* Excerpt / lede */}
              {post.excerpt && (
                <p
                  className="mb-10 text-[1.175rem] font-medium leading-relaxed text-[#4B5563] lg:text-[1.25rem]"
                  style={{ borderLeft: '4px solid #D4A017', paddingLeft: '1.25rem' }}
                >
                  {post.excerpt}
                </p>
              )}

              {/* TipTap content */}
              {post.body_json ? (
                <TipTapRenderer
                  content={post.body_json}
                  className="max-w-none"
                />
              ) : (
                <p className="text-[#9CA3AF] italic">No article content yet.</p>
              )}

              {/* Footer divider */}
              <hr className="my-12 h-px border-0 bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent" />

              {/* Tags row */}
              {cat && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-[#9CA3AF]">Filed under:</span>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ backgroundColor: cat.bg, color: cat.text }}
                  >
                    {cat.label}
                  </span>
                </div>
              )}

              {/* WhatsApp CTA */}
              <div
                className="mt-10 flex flex-col items-start gap-4 rounded-2xl p-7 sm:flex-row sm:items-center sm:justify-between"
                style={{ background: 'linear-gradient(135deg, #EEF4FB 0%, #e0ecf9 100%)' }}
              >
                <div>
                  <p
                    className="text-lg font-bold text-[#1A1A2E]"
                    style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                  >
                    Ready to make it happen?
                  </p>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Chat with our travel experts — we&apos;ll handle every detail.
                  </p>
                </div>
                <a
                  href="https://wa.me/2348061640504"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #1B4080 0%, #1B3A6B 100%)' }}
                >
                  <MessageCircle size={15} />
                  WhatsApp Us
                </a>
              </div>
            </article>

            {/* Sticky sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-8 space-y-6">
                {/* About ACE Voyages */}
                <div className="rounded-2xl bg-[#F8F9FA] p-6">
                  <h3
                    className="mb-3 text-base font-bold text-[#1A1A2E]"
                    style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                  >
                    ACE Voyages
                  </h3>
                  <p className="text-sm leading-relaxed text-[#6B7280]">
                    Nigeria&apos;s most trusted travel partner. Flights, visas, tours, and hotel
                    bookings — all from one team in Lekki, Lagos.
                  </p>
                  <a
                    href="https://wa.me/2348061640504"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#105fa3] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle size={14} />
                    Chat with Us
                  </a>
                </div>

                {/* Article meta */}
                <div className="rounded-2xl bg-[#F8F9FA] p-6 space-y-3">
                  <h3
                    className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF]"
                  >
                    Article Info
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-[#374151]">
                    <Calendar size={13} className="text-[#D4A017]" />
                    {formatDate(pubDate)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#374151]">
                    <Clock size={13} className="text-[#D4A017]" />
                    {rt}
                  </div>
                  {cat && (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ backgroundColor: cat.bg, color: cat.text }}
                    >
                      <Tag size={9} />
                      {cat.label}
                    </span>
                  )}
                </div>

                {/* Back to blog */}
                <Link
                  href="/blog"
                  className="flex items-center gap-2 text-sm font-medium text-[#105fa3] hover:underline underline-offset-2"
                >
                  <ArrowLeft size={13} />
                  All Articles
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Related Posts ─────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-[#F8F9FA] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-8 text-[10px] font-black uppercase tracking-[0.18em] text-[#9CA3AF]">
              You Might Also Like
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rel) => {
                const relCat = rel.category ? CATEGORY_META[rel.category] : null
                return (
                  <Link key={rel.post_id} href={`/blog/${rel.slug}`} className="group block">
                    <article className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(26,28,28,0.06)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(26,28,28,0.10)] hover:-translate-y-0.5">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={rel.hero_image_url ?? FALLBACK_HERO}
                          alt={rel.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {relCat && (
                          <span
                            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm"
                            style={{ backgroundColor: relCat.bg, color: relCat.text }}
                          >
                            {relCat.label}
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <h4
                          className="line-clamp-2 font-bold leading-snug text-[#1A1A2E] transition-colors group-hover:text-[#105fa3]"
                          style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                        >
                          {rel.title}
                        </h4>
                        {rel.excerpt && (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#6B7280]">
                            {rel.excerpt}
                          </p>
                        )}
                        <p className="mt-3 text-xs text-[#9CA3AF]">
                          {readingTime(rel.body_text)} · {formatDate(rel.published_at ?? rel.created_at)}
                        </p>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <WhatsAppButton />
    </>
  )
}
