'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, Upload, Search, X, ExternalLink,
  Rocket, Check, Star, Users, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FormState, FormUpdater } from './types'

interface Props {
  form: FormState
  update: FormUpdater
  step: number
  onPublish: () => void
  onBack: () => void
  isPending: boolean
}

function formatNaira(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n.toLocaleString()}`
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  culture:   'linear-gradient(135deg, #4A148C 0%, #7B1FA2 50%, #9C27B0 100%)',
  adventure: 'linear-gradient(135deg, #BF360C 0%, #E64A19 50%, #FF7043 100%)',
  romance:   'linear-gradient(135deg, #880E4F 0%, #C2185B 50%, #E91E63 100%)',
  business:  'linear-gradient(135deg, #1A237E 0%, #283593 50%, #3949AB 100%)',
  safari:    'linear-gradient(135deg, #2D5A27 0%, #4A7C59 50%, #D4A017 100%)',
  default:   'linear-gradient(135deg, #105fa3 0%, #1976D2 50%, #42A5F5 100%)',
}

function getGradient(category: string) {
  return CATEGORY_GRADIENTS[category] ?? CATEGORY_GRADIENTS.default
}

function LivePreview({ form }: { form: FormState }) {
  const badge = form.duration_days
    ? `${form.duration_days} DAYS ${(form.category || 'tour').toUpperCase()}`
    : 'TOUR PREVIEW'

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
      {/* Preview image */}
      <div className="relative h-40">
        {form.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.hero_image_url}
            alt="Preview"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: getGradient(form.category) }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 rounded-full bg-[#D4A017] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
          {badge}
        </span>
        <div className="absolute bottom-3 left-3 right-3">
          <h3
            className="text-sm font-bold text-white leading-tight line-clamp-2"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            {form.title || 'Your Tour Title'}
          </h3>
        </div>
      </div>

      {/* Preview details */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-[10px] text-[#9CA3AF]">Starting from</p>
          <p className="text-lg font-bold text-[#1A1A2E]">
            {form.price_naira > 0 ? formatNaira(form.price_naira) : '₦—'}{' '}
            <span className="text-xs font-normal text-[#9CA3AF]">/pp</span>
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={11} className="fill-[#D4A017] text-[#D4A017]" />
            <span className="text-xs font-semibold text-[#374151]">4.9</span>
            <span className="text-xs text-[#9CA3AF]">(124)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1">
            <Users size={11} />
            {form.max_guests} Max
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {form.duration_days}d / {form.duration_nights}n
          </span>
        </div>

        {form.short_description && (
          <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2">
            {form.short_description}
          </p>
        )}

        <button
          type="button"
          className="w-full rounded-xl border border-[#E5E7EB] py-2 text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
        >
          Book This Voyage
        </button>
      </div>
    </div>
  )
}

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  if (!cloudName || !uploadPreset) {
    throw new Error('Image uploads not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.local')
  }
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', uploadPreset)
  fd.append('folder', 'ace-voyages/tours')
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: fd,
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.secure_url as string
}

export default function Step3Media({ form, update, onPublish, onBack, isPending }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [keyword, setKeyword] = useState('')

  const photoCount = form.gallery_urls.length

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadError('')
    setUploading(true)

    // Track URLs locally to avoid stale-closure issues across sequential uploads
    let currentUrls = [...form.gallery_urls]
    let currentHero = form.hero_image_url

    for (const file of Array.from(files)) {
      try {
        const url = await uploadToCloudinary(file)
        currentUrls = [...currentUrls, url]
        update('gallery_urls', currentUrls)
        if (!currentHero) {
          currentHero = url
          update('hero_image_url', url)
        }
      } catch (e: unknown) {
        setUploadError(e instanceof Error ? e.message : 'Upload failed')
        break
      }
    }

    setUploading(false)
  }

  function removeImage(url: string) {
    const next = form.gallery_urls.filter((u) => u !== url)
    update('gallery_urls', next)
    if (form.hero_image_url === url) {
      update('hero_image_url', next[0] ?? '')
    }
  }

  function addKeyword() {
    const kw = keyword.trim()
    if (!kw || form.highlights.includes(kw)) return
    update('highlights', [...form.highlights, kw])
    setKeyword('')
  }

  function removeKeyword(kw: string) {
    update('highlights', form.highlights.filter((h) => h !== kw))
  }

  const charMeta  = form.meta_title.length
  const charDesc  = form.meta_description.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-[#9CA3AF]">
          <Link href="/admin/tours" className="hover:text-[#105fa3] transition-colors">Tours</Link>
          {' › '}
          <span className="text-[#374151]">Create New Package</span>
          {' › '}
          <span className="font-medium text-[#105fa3]">Media &amp; SEO</span>
        </p>
        <div className="flex items-baseline gap-3 mt-2">
          <h1
            className="text-3xl font-bold text-[#1A1A2E]"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            Media &amp; Discoverability
          </h1>
          <span
            className="text-xl text-[#914c00]"
            style={{ fontFamily: 'var(--font-satisfy, Satisfy, cursive)', fontStyle: 'italic' }}
          >
            the final touches
          </span>
        </div>
        <p className="mt-1 text-sm text-[#6B7280]">
          Bring your tour to life with immersive imagery and ensure travellers can find it through search optimisation.
        </p>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">

        {/* LEFT column */}
        <div className="space-y-5">

          {/* Gallery card */}
          <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF4FB]">
                  <Upload size={16} className="text-[#105fa3]" />
                </div>
                <h2
                  className="text-base font-bold text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                >
                  Gallery Management
                </h2>
              </div>
              <span className="text-xs font-semibold text-[#6B7280]">
                {photoCount} / 12 Photos uploaded
              </span>
            </div>

            {uploadError && (
              <div className="mb-4 rounded-xl bg-[#FEE2E2] px-3 py-2 text-xs text-[#991B1B]">
                {uploadError} — try pasting a URL below instead.
              </div>
            )}

            {/* Drop zone */}
            <div
              className="rounded-xl border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] flex flex-col items-center justify-center gap-3 py-10 cursor-pointer hover:border-[#105fa3] hover:bg-[#EEF4FB] transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DBEAFE]">
                <Upload size={20} className="text-[#105fa3]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#374151]">Drag &amp; drop your imagery here</p>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  JPEG, PNG or WebP up to 10MB per file. High-resolution 16:9 recommended.
                </p>
              </div>
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F3F4F6] transition-colors disabled:opacity-60"
              >
                {uploading ? 'Uploading to Cloudinary…' : 'Browse Files'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* Image thumbnails */}
            {photoCount > 0 && (
              <div className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] mb-3">
                  Featured Image &amp; Gallery
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {form.gallery_urls.map((url, i) => (
                    <div key={i} className="relative group">
                      <div
                        className={cn(
                          'aspect-video rounded-xl overflow-hidden ring-2 transition-all',
                          form.hero_image_url === url
                            ? 'ring-[#105fa3]'
                            : 'ring-transparent hover:ring-[#D1D5DB]',
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Gallery ${i + 1}`}
                          className="h-full w-full object-cover cursor-pointer"
                          onClick={() => update('hero_image_url', url)}
                        />
                      </div>
                      {form.hero_image_url === url && (
                        <div className="absolute top-1 left-1 rounded-full bg-[#105fa3] p-0.5">
                          <Check size={9} className="text-white" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute top-1 right-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                      >
                        <X size={9} />
                      </button>
                    </div>
                  ))}
                  {/* Empty placeholders */}
                  {Array.from({ length: Math.max(0, 4 - photoCount) }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="aspect-video rounded-xl bg-[#F3F4F6] flex items-center justify-center cursor-pointer hover:bg-[#E5E7EB] transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} className="text-[#9CA3AF]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback URL input */}
            {photoCount === 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] mb-2">
                  Or paste an image URL
                </p>
                <input
                  type="url"
                  value={form.hero_image_url}
                  onChange={(e) => {
                    update('hero_image_url', e.target.value)
                    if (e.target.value && !form.gallery_urls.includes(e.target.value)) {
                      update('gallery_urls', [e.target.value])
                    }
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl bg-[#F3F4F6] px-4 py-2.5 text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#105fa3]/20 transition-all"
                />
              </div>
            )}
          </div>

          {/* SEO card */}
          <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7]">
                <Search size={16} className="text-[#92400E]" />
              </div>
              <div>
                <h2
                  className="text-base font-bold text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                >
                  Search Engine Optimisation
                </h2>
                <p className="text-xs text-[#9CA3AF]">Configure how this tour appears in Google search results.</p>
              </div>
            </div>

            {/* Meta title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#374151]">
                  Meta Title
                </label>
                <span className={cn('text-[10px] font-medium', charMeta > 60 ? 'text-[#EF4444]' : 'text-[#9CA3AF]')}>
                  {charMeta} / 60
                </span>
              </div>
              <input
                type="text"
                value={form.meta_title}
                onChange={(e) => update('meta_title', e.target.value.slice(0, 60))}
                placeholder={`e.g. ${form.title || 'Luxury Safari in Yankari Game Reserve'} | ACE Voyages`}
                className="w-full rounded-xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#105fa3]/20 transition-all"
              />
            </div>

            {/* Meta description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#374151]">
                  Meta Description
                </label>
                <span className={cn('text-[10px] font-medium', charDesc > 160 ? 'text-[#EF4444]' : 'text-[#9CA3AF]')}>
                  {charDesc} / 160
                </span>
              </div>
              <textarea
                value={form.meta_description}
                onChange={(e) => update('meta_description', e.target.value.slice(0, 160))}
                placeholder="Describe the journey, highlights, and unique value..."
                rows={3}
                className="w-full rounded-xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#105fa3]/20 transition-all resize-none"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#374151] mb-2">
                Keywords
              </label>
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-[#F3F4F6] px-3 py-2.5 min-h-[44px]">
                {form.highlights.map((kw) => (
                  <span
                    key={kw}
                    className="flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-semibold text-[#92400E]"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      className="hover:text-[#EF4444] transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault()
                      addKeyword()
                    }
                  }}
                  placeholder="Add keyword…"
                  className="flex-1 min-w-[100px] bg-transparent text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT sidebar */}
        <div className="flex flex-col gap-4">
          {/* Live Preview */}
          <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#22C55E]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF]">
                  Live Preview
                </span>
              </div>
              <button type="button" className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                <ExternalLink size={13} />
              </button>
            </div>
            <LivePreview form={form} />
          </div>

          {/* Featured toggle */}
          <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[#374151]">Mark as Featured</span>
            <button
              type="button"
              role="switch"
              aria-checked={form.is_featured}
              onClick={() => update('is_featured', !form.is_featured)}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                form.is_featured ? 'bg-[#105fa3]' : 'bg-[#D1D5DB]',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  form.is_featured ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>

          {/* Publish button */}
          <button
            type="button"
            onClick={onPublish}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#105fa3] px-5 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Rocket size={16} />
            {isPending ? 'Publishing…' : 'Publish Tour Package'}
          </button>

          {/* Back / save */}
          <button
            type="button"
            onClick={onBack}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
          >
            <ChevronLeft size={15} />
            Save &amp; Go Back
          </button>

          <p className="text-center text-[10px] text-[#9CA3AF] leading-relaxed">
            By publishing, you agree to our{' '}
            <Link href="#" className="text-[#105fa3] hover:underline">Operator Terms</Link>.
          </p>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
        >
          <ChevronLeft size={15} />
          Back to Pricing
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#9CA3AF]">
            {photoCount} image{photoCount !== 1 ? 's' : ''} added
          </span>
          <button
            type="button"
            onClick={onPublish}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-[#105fa3] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Rocket size={14} />
            {isPending ? 'Publishing…' : 'Publish Tour Package'}
          </button>
        </div>
      </div>
    </div>
  )
}
