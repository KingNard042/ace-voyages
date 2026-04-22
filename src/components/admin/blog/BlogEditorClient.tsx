'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Globe, Eye, EyeOff, Save, Upload, X,
  CheckCircle2, Clock, AlertCircle, Star, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import type { AdminRole } from '@/lib/admin/access'

const TipTapEditor = dynamic(() => import('./TipTapEditor'), { ssr: false, loading: () => <EditorSkeleton /> })

function EditorSkeleton() {
  return (
    <div className="rounded-2xl bg-white px-10 py-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)] min-h-[500px] animate-pulse">
      <div className="h-5 bg-[#F3F4F6] rounded w-3/4 mb-4" />
      <div className="h-4 bg-[#F3F4F6] rounded w-full mb-2" />
      <div className="h-4 bg-[#F3F4F6] rounded w-5/6 mb-2" />
      <div className="h-4 bg-[#F3F4F6] rounded w-4/5 mb-2" />
    </div>
  )
}

const CATEGORIES = [
  { value: '', label: 'Select category…' },
  { value: 'visa-tips', label: 'Visa Tips' },
  { value: 'travel-guides', label: 'Travel Guides' },
  { value: 'destination-spotlight', label: 'Destination Spotlight' },
  { value: 'packing-tips', label: 'Packing Tips' },
]

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface BlogPost {
  post_id: string
  title: string
  slug: string
  excerpt: string | null
  hero_image_url: string | null
  body_json: Record<string, unknown> | null
  category: string | null
  is_published: boolean
  is_featured: boolean
}

interface Props {
  initialPost?: BlogPost | null
  userRole: AdminRole
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── SEO Preview ──────────────────────────────────────────────────────────────
function SeoPreview({ title, slug, excerpt }: { title: string; slug: string; excerpt: string }) {
  const displayTitle = title.slice(0, 60) || 'Your Post Title'
  const displayExcerpt = excerpt.slice(0, 160) || 'Your post excerpt will appear here. Write a compelling summary to improve your click-through rate.'
  const displayUrl = `acevoyages.net/blog/${slug || 'your-post-slug'}`

  return (
    <div className="rounded-xl bg-[#F9FAFB] p-4 space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] mb-3">Google Preview</p>
      <div className="flex items-center gap-1.5 mb-0.5">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#105fa3]">
          <span className="text-[8px] font-bold text-white">A</span>
        </div>
        <div>
          <p className="text-[11px] text-[#1A1A2E] font-medium leading-none">ACE Voyages</p>
          <p className="text-[10px] text-[#22C55E] leading-none mt-0.5 truncate max-w-[240px]">{displayUrl}</p>
        </div>
      </div>
      <p
        className={cn(
          'text-[15px] leading-snug',
          title ? 'text-[#1a0dab]' : 'text-[#9CA3AF]',
        )}
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {displayTitle}{title.length > 60 && <span className="text-[#9CA3AF]">…</span>}
        {title && ' | ACE Voyages'}
      </p>
      <p
        className="text-[13px] text-[#4D5156] leading-snug"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {displayExcerpt}{excerpt.length > 160 && '…'}
      </p>
    </div>
  )
}

// ── Image Upload ─────────────────────────────────────────────────────────────
function HeroImageUpload({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')

  async function handleFile(file: File) {
    setErr('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      onChange(url)
    } catch {
      setErr('Upload failed. Try pasting a URL below.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group rounded-xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Hero" className="w-full h-28 object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={10} />
          </button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center rounded-xl bg-[#F3F4F6] py-5 gap-2 cursor-pointer hover:bg-[#EEF4FB] transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        >
          {uploading ? (
            <Loader2 size={18} className="text-[#105fa3] animate-spin" />
          ) : (
            <>
              <Upload size={18} className="text-[#9CA3AF]" />
              <span className="text-xs text-[#9CA3AF]">Drop image or click to upload</span>
            </>
          )}
        </div>
      )}

      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://res.cloudinary.com/…"
        className="w-full rounded-lg bg-[#F3F4F6] px-3 py-2 text-xs text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#105fa3]/20"
      />
      {err && <p className="text-xs text-[#EF4444]">{err}</p>}
    </div>
  )
}

// ── Save Status Indicator ─────────────────────────────────────────────────────
function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  return (
    <span
      className={cn(
        'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all',
        status === 'saving' && 'bg-[#FEF3C7] text-[#92400E]',
        status === 'saved' && 'bg-[#D1FAE5] text-[#065F46]',
        status === 'error' && 'bg-[#FEE2E2] text-[#991B1B]',
      )}
    >
      {status === 'saving' && <Loader2 size={11} className="animate-spin" />}
      {status === 'saved' && <CheckCircle2 size={11} />}
      {status === 'error' && <AlertCircle size={11} />}
      {status === 'saving' ? 'Saving…' : status === 'saved' ? 'All changes saved' : 'Save failed'}
    </span>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BlogEditorClient({ initialPost, userRole }: Props) {
  const router = useRouter()
  const postIdRef = useRef<string | null>(initialPost?.post_id ?? null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const canPublish = userRole !== 'agent_admin'

  const [form, setForm] = useState({
    title: initialPost?.title ?? '',
    slug: initialPost?.slug ?? '',
    excerpt: initialPost?.excerpt ?? '',
    hero_image_url: initialPost?.hero_image_url ?? '',
    category: initialPost?.category ?? '',
    is_published: initialPost?.is_published ?? false,
    is_featured: initialPost?.is_featured ?? false,
  })
  const [bodyJson, setBodyJson] = useState<Record<string, unknown> | null>(
    initialPost?.body_json ?? null,
  )
  const [slugEdited, setSlugEdited] = useState(!!initialPost?.slug)

  // Auto-generate slug from title (only if user hasn't manually edited it)
  useEffect(() => {
    if (!slugEdited && form.title) {
      setForm((f) => ({ ...f, slug: generateSlug(form.title) }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title])

  // ── Core save logic ─────────────────────────────────────────────────────────
  const save = useCallback(
    async (payload: typeof form & { body_json: typeof bodyJson }, forcePublish?: boolean) => {
      setSaveStatus('saving')
      try {
        const body = {
          title: payload.title || 'Untitled',
          slug: payload.slug || generateSlug(payload.title || 'untitled'),
          excerpt: payload.excerpt || null,
          hero_image_url: payload.hero_image_url || null,
          body_json: payload.body_json || null,
          category: payload.category || null,
          is_published: forcePublish !== undefined ? forcePublish : payload.is_published,
          is_featured: payload.is_featured,
        }

        if (!postIdRef.current) {
          // Create new post
          const res = await fetch('/api/admin/blog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error ?? 'Failed to create post')
          }
          const { post_id } = await res.json()
          postIdRef.current = post_id
          // Update URL without full navigation to preserve editor state
          window.history.replaceState({}, '', `/admin/blog/${post_id}`)
        } else {
          // Update existing
          const res = await fetch(`/api/admin/blog/${postIdRef.current}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error ?? 'Failed to save post')
          }
        }

        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } catch (err) {
        console.error('[BlogEditorClient save]', err)
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 4000)
      }
    },
    [],
  )

  // Debounced auto-save — fires 1500ms after last change
  const triggerAutoSave = useCallback(
    (latestForm: typeof form, latestBody: typeof bodyJson) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        save({ ...latestForm, body_json: latestBody })
      }, 1500)
    },
    [save],
  )

  function updateForm(key: keyof typeof form, value: string | boolean) {
    const next = { ...form, [key]: value }
    setForm(next)
    triggerAutoSave(next, bodyJson)
  }

  function handleBodyChange(json: Record<string, unknown>) {
    setBodyJson(json)
    triggerAutoSave(form, json)
  }

  // ── Publish / Unpublish ─────────────────────────────────────────────────────
  async function togglePublish() {
    if (!canPublish) return
    const next = !form.is_published
    const nextForm = { ...form, is_published: next }
    setForm(nextForm)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    await save({ ...nextForm, body_json: bodyJson }, next)
  }

  // ── Manual save ─────────────────────────────────────────────────────────────
  async function handleManualSave() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    await save({ ...form, body_json: bodyJson })
  }

  const categoryLabel = CATEGORIES.find((c) => c.value === form.category)?.label ?? 'Uncategorised'

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-[#9CA3AF]">
            <Link href="/admin/blog" className="hover:text-[#105fa3] transition-colors">
              Blog
            </Link>
            {' › '}
            <span className="text-[#374151]">
              {initialPost ? 'Edit Post' : 'New Post'}
            </span>
          </p>
          <h1
            className="mt-1 text-2xl font-bold text-[#1A1A2E]"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            {initialPost ? 'Edit Post' : 'New Blog Post'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <SaveIndicator status={saveStatus} />

          <button
            type="button"
            onClick={handleManualSave}
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
          >
            <Save size={14} />
            Save Draft
          </button>

          {canPublish && (
            <button
              type="button"
              onClick={togglePublish}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                form.is_published
                  ? 'bg-[#F3F4F6] text-[#374151] hover:bg-[#EEF4FB] hover:text-[#105fa3]'
                  : 'bg-[#105fa3] text-white hover:opacity-90',
              )}
            >
              {form.is_published ? (
                <><EyeOff size={14} /> Unpublish</>
              ) : (
                <><Globe size={14} /> Publish</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Split-Pane Layout ────────────────────────────── */}
      <div className="flex gap-6 items-start">

        {/* ── LEFT: Editor ──────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Title input — large, Notion-style */}
          <div className="rounded-2xl bg-white px-8 py-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
              placeholder="Post title…"
              className="w-full text-3xl font-bold text-[#1A1A2E] placeholder-[#D1D5DB] outline-none bg-transparent"
              style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
            />
          </div>

          {/* TipTap Editor */}
          <TipTapEditor
            initialContent={bodyJson ?? undefined}
            onChange={handleBodyChange}
            placeholder="Begin writing your story…"
          />
        </div>

        {/* ── RIGHT: Metadata Sidebar ───────────────────── */}
        <aside className="w-80 shrink-0 sticky top-6 flex flex-col gap-4 max-h-[calc(100vh-8rem)] overflow-y-auto">

          {/* Status card */}
          <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF]">Status</p>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  form.is_published
                    ? 'bg-[#D1FAE5] text-[#065F46]'
                    : 'bg-[#F3F4F6] text-[#6B7280]',
                )}
              >
                {form.is_published ? 'Published' : 'Draft'}
              </span>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#374151] mb-1.5">
                URL Slug
              </label>
              <div className="flex items-center gap-1 rounded-lg bg-[#F3F4F6] px-3 py-2">
                <span className="text-xs text-[#9CA3AF] whitespace-nowrap">/blog/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugEdited(true)
                    updateForm('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                  }}
                  placeholder="post-slug"
                  className="flex-1 min-w-0 bg-transparent text-xs text-[#1A1A2E] placeholder-[#9CA3AF] outline-none"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#374151] mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => updateForm('category', e.target.value)}
                className="w-full rounded-lg bg-[#F3F4F6] px-3 py-2 text-sm text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#105fa3]/20 appearance-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Featured toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star size={13} className={form.is_featured ? 'fill-[#D4A017] text-[#D4A017]' : 'text-[#9CA3AF]'} />
                <span className="text-sm font-medium text-[#374151]">Featured post</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.is_featured}
                onClick={() => updateForm('is_featured', !form.is_featured)}
                className={cn(
                  'relative h-5 w-9 rounded-full transition-colors',
                  form.is_featured ? 'bg-[#D4A017]' : 'bg-[#D1D5DB]',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                    form.is_featured ? 'translate-x-4' : 'translate-x-0',
                  )}
                />
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF]">Hero Image</p>
            <HeroImageUpload
              value={form.hero_image_url}
              onChange={(url) => updateForm('hero_image_url', url)}
            />
          </div>

          {/* Excerpt + SEO Preview */}
          <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF]">Excerpt / Meta</p>
                <span className={cn('text-[10px] font-medium', form.excerpt.length > 160 ? 'text-[#EF4444]' : 'text-[#9CA3AF]')}>
                  {form.excerpt.length}/160
                </span>
              </div>
              <textarea
                value={form.excerpt}
                onChange={(e) => updateForm('excerpt', e.target.value.slice(0, 160))}
                placeholder="A compelling one-sentence summary that appears in Google results…"
                rows={3}
                className="w-full rounded-lg bg-[#F3F4F6] px-3 py-2.5 text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#105fa3]/20 resize-none leading-relaxed"
              />
            </div>

            <SeoPreview title={form.title} slug={form.slug} excerpt={form.excerpt} />
          </div>

          {/* Quick metadata summary */}
          <div className="rounded-2xl bg-[#F8F9FA] px-4 py-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <Clock size={11} />
              <span>
                {initialPost
                  ? 'Last auto-saved just now'
                  : 'Auto-saves on every change'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <Eye size={11} />
              <span>
                Category:{' '}
                <span className="font-medium text-[#374151]">{categoryLabel}</span>
              </span>
            </div>
            {form.is_published && (
              <Link
                href={`/blog/${form.slug}`}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 text-xs text-[#105fa3] hover:underline"
              >
                <Globe size={11} />
                View live post
              </Link>
            )}
          </div>

          {/* Back link */}
          <Link
            href="/admin/blog"
            className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-[#374151] transition-colors"
          >
            <ChevronLeft size={12} />
            Back to all posts
          </Link>
        </aside>
      </div>
    </div>
  )
}
