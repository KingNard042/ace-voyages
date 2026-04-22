import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen, Clock, Tag, FileText } from 'lucide-react'
import { getPublishedBlogPosts } from '@/lib/content'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import NewsletterForm from '@/components/ui/NewsletterForm'

export const metadata: Metadata = {
  title: 'Travel Journal | ACE Voyages',
  description:
    'Visa tips, destination guides, packing advice, and travel inspiration from the ACE Voyages team.',
  openGraph: {
    title: 'Travel Journal | ACE Voyages',
    description:
      'Visa tips, destination guides, packing advice, and travel inspiration from the ACE Voyages team.',
  },
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; bg: string; text: string }> = {
  'visa-tips':             { label: 'Visa Tips',             bg: '#EEF4FB', text: '#105fa3' },
  'travel-guides':         { label: 'Travel Guides',         bg: '#FEF3C7', text: '#92400E' },
  'destination-spotlight': { label: 'Destination Spotlight', bg: '#F0FDF4', text: '#166534' },
  'packing-tips':          { label: 'Packing Tips',          bg: '#FDF4FF', text: '#7E22CE' },
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'

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

// ─── Featured Post Card ───────────────────────────────────────────────────────

function FeaturedCard({ post }: { post: Awaited<ReturnType<typeof getPublishedBlogPosts>>[number] }) {
  const cat = post.category ? CATEGORY_META[post.category] : null
  const date = post.published_at ?? post.created_at

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="relative overflow-hidden rounded-3xl bg-white shadow-[0_4px_24px_rgba(26,28,28,0.08)] transition-shadow duration-500 hover:shadow-[0_16px_48px_rgba(26,28,28,0.13)] lg:grid lg:grid-cols-[1.1fr_1fr]">
        {/* Image */}
        <div className="relative min-h-[280px] overflow-hidden sm:min-h-[360px] lg:min-h-[480px]">
          <Image
            src={post.hero_image_url ?? FALLBACK_IMAGE}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 lg:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden" />

          {/* Mobile title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:hidden">
            {cat && (
              <span
                className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: cat.bg, color: cat.text }}
              >
                {cat.label}
              </span>
            )}
            <h2
              className="text-xl font-bold text-white leading-snug"
              style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
            >
              {post.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center gap-5 p-8 lg:p-12">
          {/* Featured label */}
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
            >
              ★ Featured Story
            </span>
          </div>

          {/* Category */}
          {cat && (
            <span
              className="hidden lg:inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: cat.bg, color: cat.text }}
            >
              <Tag size={10} />
              {cat.label}
            </span>
          )}

          {/* Title */}
          <h2
            className="hidden text-[1.75rem] font-bold leading-tight text-[#1A1A2E] transition-colors group-hover:text-[#105fa3] sm:text-[2rem] lg:block"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="line-clamp-3 text-base leading-relaxed text-[#6B7280]">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-[#9CA3AF]">
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {readingTime(post.body_text)}
            </span>
            <span>{formatDate(date)}</span>
          </div>

          {/* CTA */}
          <span
            className="group/cta mt-1 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-[#105fa3]"
          >
            Read Article
            <ArrowRight
              size={15}
              className="transition-transform duration-200 group-hover/cta:translate-x-1"
            />
          </span>
        </div>
      </article>
    </Link>
  )
}

// ─── Regular Post Card ────────────────────────────────────────────────────────

function PostCard({ post }: { post: Awaited<ReturnType<typeof getPublishedBlogPosts>>[number] }) {
  const cat = post.category ? CATEGORY_META[post.category] : null
  const date = post.published_at ?? post.created_at

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(26,28,28,0.06)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(26,28,28,0.11)] hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={post.hero_image_url ?? FALLBACK_IMAGE}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {cat && (
            <span
              className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm"
              style={{ backgroundColor: cat.bg, color: cat.text }}
            >
              {cat.label}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3
            className="line-clamp-2 text-[1.0625rem] font-bold leading-snug text-[#1A1A2E] transition-colors group-hover:text-[#105fa3]"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-[#6B7280]">
              {post.excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between pt-3 text-xs text-[#9CA3AF]">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {readingTime(post.body_text)}
            </span>
            <span>{formatDate(date)}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-24 text-center shadow-[0_2px_16px_rgba(26,28,28,0.06)]">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3F4F6]">
        <BookOpen size={28} className="text-[#9CA3AF]" />
      </div>
      <h2
        className="text-xl font-bold text-[#1A1A2E]"
        style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
      >
        Stories coming soon
      </h2>
      <p className="mt-2 max-w-sm text-sm text-[#6B7280]">
        Our team is working on travel guides, visa tips, and destination spotlights. Check back soon.
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPage() {
  const allPosts = await getPublishedBlogPosts()
  const featured = allPosts.find((p) => p.is_featured) ?? null
  const regular = allPosts.filter((p) => !p.is_featured || p !== featured)

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative flex min-h-[320px] items-center"
        style={{
          background: 'linear-gradient(135deg, #0c1a3a 0%, #1B3A6B 60%, #0d2247 100%)',
        }}
      >
        {/* Decorative texture dots */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <p
            className="text-2xl text-[#D4A017]"
            style={{ fontFamily: 'var(--font-satisfy, cursive)' }}
          >
            Stories &amp; Guides
          </p>
          <h1
            className="mt-3 max-w-2xl text-4xl font-bold text-white sm:text-5xl lg:text-[3.25rem] leading-tight"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            The ACE Voyages Journal
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/65 sm:text-lg leading-relaxed">
            Visa tips, destination spotlights, packing guides, and travel inspiration — straight
            from our team of travel experts.
          </p>

          {allPosts.length > 0 && (
            <div className="mt-6 flex items-center gap-3">
              <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
                <FileText size={13} />
                {allPosts.length} article{allPosts.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <section className="bg-[#F8F9FA] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">

          {allPosts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <div>
                  <p className="mb-6 text-[10px] font-black uppercase tracking-[0.18em] text-[#9CA3AF]">
                    Featured
                  </p>
                  <FeaturedCard post={featured} />
                </div>
              )}

              {/* Regular posts grid */}
              {regular.length > 0 && (
                <div>
                  {featured && (
                    <p className="mb-8 text-[10px] font-black uppercase tracking-[0.18em] text-[#9CA3AF]">
                      Latest Articles
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                    {regular.map((post) => (
                      <PostCard key={post.post_id} post={post} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Newsletter CTA */}
          <div
            className="overflow-hidden rounded-3xl px-8 py-12 text-center sm:px-16"
            style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0d2247 100%)' }}
          >
            <p
              className="text-xl text-[#D4A017]"
              style={{ fontFamily: 'var(--font-satisfy, cursive)' }}
            >
              Stay in the loop
            </p>
            <h2
              className="mt-2 text-2xl font-bold text-white sm:text-3xl"
              style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
            >
              Get travel tips in your inbox
            </h2>
            <p className="mt-3 text-sm text-white/60 max-w-md mx-auto">
              Join thousands of Nigerian travellers who get our best visa guides, deal alerts, and
              destination features every week.
            </p>
            <div className="mt-7 flex justify-center">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </>
  )
}
