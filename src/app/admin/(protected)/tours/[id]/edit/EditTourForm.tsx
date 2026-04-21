'use client'

import { useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlignLeft, Bold, Italic, List, Link as LinkIcon, ImageIcon,
  Landmark, Mountain, Heart, Briefcase, Tag,
  Clock, MapPin, Users, CreditCard, Upload, Search,
  Minus, Plus, Check, X, Trash2, Star, Rocket, ChevronLeft, MapPinned,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateTour } from '../../new/actions'
import type { FormState, FormUpdater, ItineraryDay } from '../../new/types'

interface Props {
  tourId: string
  initialForm: FormState
  initialIsActive: boolean
}

const CATEGORIES = [
  { value: 'leisure',   label: 'Leisure',   Icon: Landmark,  bg: '#FEF3C7', color: '#92400E' },
  { value: 'adventure', label: 'Adventure', Icon: Mountain,  bg: '#EDE9FE', color: '#6D28D9' },
  { value: 'honeymoon', label: 'Honeymoon', Icon: Heart,     bg: '#FCE7F3', color: '#9D174D' },
  { value: 'corporate', label: 'Corporate', Icon: Briefcase, bg: '#DBEAFE', color: '#1D4ED8' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors duration-200',
        checked ? 'bg-[#105fa3]' : 'bg-[#D1D5DB]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  )
}

function Counter({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] transition-colors"
      >
        <Minus size={13} />
      </button>
      <span className="flex-1 text-center text-xl font-bold text-[#105fa3]">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] transition-colors"
      >
        <Plus size={13} />
      </button>
    </div>
  )
}

function NairaInput({
  label, value, onChange, hint,
}: {
  label: string; value: number | null; onChange: (v: number | null) => void; hint?: string
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#374151] mb-2">{label}</label>
      <div className="flex items-center gap-3 rounded-xl bg-[#F3F4F6] px-4 py-3">
        <span className="text-sm font-bold text-[#9CA3AF]">₦</span>
        <input
          type="number"
          min={0}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder="0"
          className="flex-1 bg-transparent text-base font-bold text-[#1A1A2E] outline-none placeholder-[#9CA3AF]"
        />
      </div>
      {hint && <p className="mt-1.5 text-xs text-[#9CA3AF]">{hint}</p>}
    </div>
  )
}

function formatNaira(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n.toLocaleString()}`
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
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.secure_url as string
}

export default function EditTourForm({ tourId, initialForm, initialIsActive }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(initialForm)
  const [isActive, setIsActive] = useState(initialIsActive)
  const [isPending, startTransition] = useTransition()
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Image upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Itinerary
  const [newActivity, setNewActivity] = useState<Record<string, string>>({})

  // SEO keyword
  const [keyword, setKeyword] = useState('')

  const update: FormUpdater = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ── Image upload ──────────────────────────────────────────────────────────
  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadError('')
    setUploading(true)
    let currentUrls = [...form.gallery_urls]
    let currentHero = form.hero_image_url
    for (const file of Array.from(files)) {
      try {
        const url = await uploadToCloudinary(file)
        currentUrls = [...currentUrls, url]
        update('gallery_urls', currentUrls)
        if (!currentHero) { currentHero = url; update('hero_image_url', url) }
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
    if (form.hero_image_url === url) update('hero_image_url', next[0] ?? '')
  }

  // ── Itinerary ─────────────────────────────────────────────────────────────
  function addDay() {
    const day: ItineraryDay = {
      id: Math.random().toString(36).slice(2),
      title: '', location: '', description: '', activities: [],
    }
    update('itinerary', [...form.itinerary, day])
  }

  function removeDay(id: string) {
    update('itinerary', form.itinerary.filter((d) => d.id !== id))
  }

  function updateDay(id: string, changes: Partial<Omit<ItineraryDay, 'id'>>) {
    update('itinerary', form.itinerary.map((d) => (d.id === id ? { ...d, ...changes } : d)))
  }

  function addActivity(dayId: string) {
    const text = (newActivity[dayId] ?? '').trim().toUpperCase()
    if (!text) return
    const day = form.itinerary.find((d) => d.id === dayId)
    if (!day || day.activities.includes(text)) return
    updateDay(dayId, { activities: [...day.activities, text] })
    setNewActivity((prev) => ({ ...prev, [dayId]: '' }))
  }

  function removeActivity(dayId: string, index: number) {
    const day = form.itinerary.find((d) => d.id === dayId)
    if (!day) return
    updateDay(dayId, { activities: day.activities.filter((_, i) => i !== index) })
  }

  // ── Keywords ──────────────────────────────────────────────────────────────
  function addKeyword() {
    const kw = keyword.trim()
    if (!kw || form.highlights.includes(kw)) return
    update('highlights', [...form.highlights, kw])
    setKeyword('')
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  function handleSave() {
    if (!form.title.trim()) { setSaveError('Tour name is required.'); return }
    setSaveError('')
    setSaveSuccess(false)
    startTransition(async () => {
      const result = await updateTour(form, tourId, isActive)
      if (result.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setSaveError(result.error ?? 'Failed to save changes.')
      }
    })
  }

  const photoCount = form.gallery_urls.length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs text-[#9CA3AF]">
            <Link href="/admin/tours" className="hover:text-[#105fa3] transition-colors">Tour Packages</Link>
            {' '}›{' '}
            <span className="font-medium text-[#105fa3]">Edit Tour</span>
          </p>
          <h1
            className="mt-2 text-4xl font-bold text-[#1A1A2E]"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            Edit Tour
          </h1>
          <p
            className="mt-1 text-xl text-[#914c00]"
            style={{ fontFamily: 'var(--font-satisfy, Satisfy, cursive)', fontStyle: 'italic' }}
          >
            {form.title || 'Untitled Tour'}
          </p>
        </div>

        {/* Status + save area */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-4 py-2.5">
            <span className="text-sm font-medium text-[#374151]">Published</span>
            <Toggle checked={isActive} onChange={setIsActive} />
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-[#105fa3] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Rocket size={15} />
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Feedback banners */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-[#D1FAE5] px-4 py-3 text-sm font-medium text-[#065F46]">
          <Check size={15} />
          Changes saved successfully.
        </div>
      )}
      {saveError && (
        <div className="rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">{saveError}</div>
      )}

      {/* ── Section 1: Core Information ───────────────────────────────────── */}
      <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF4FB]">
            <AlignLeft size={16} className="text-[#105fa3]" />
          </div>
          <h2 className="text-base font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
            Core Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-5">
            {/* Tour name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#374151] mb-2">Tour Name</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="e.g. Serengeti Sunset Expedition"
                className="w-full rounded-xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#105fa3]/20 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#374151] mb-2">Tour Description</label>
              <div className="rounded-t-xl bg-[#F9FAFB] border-b border-[#F3F4F6] px-3 py-2 flex items-center gap-2.5">
                {[Bold, Italic, List, LinkIcon, ImageIcon].map((Icon, i) => (
                  <button key={i} type="button" className="flex h-6 w-6 items-center justify-center rounded text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#374151] transition-colors">
                    <Icon size={13} />
                  </button>
                ))}
              </div>
              <textarea
                value={form.short_description}
                onChange={(e) => update('short_description', e.target.value)}
                placeholder="Describe the magical moments of this journey..."
                rows={6}
                className="w-full rounded-b-xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#105fa3]/20 transition-all resize-none"
              />
            </div>
          </div>

          {/* Category sidebar */}
          <div className="rounded-xl bg-[#F9FAFB] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={14} className="text-[#92400E]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#374151]">Category</span>
            </div>
            <div className="space-y-1.5">
              {CATEGORIES.map(({ value, label, Icon, bg, color }) => {
                const selected = form.category === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update('category', value)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      selected ? 'bg-[#FEF3C7]' : 'hover:bg-white',
                    )}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: bg }}>
                      <Icon size={13} style={{ color }} />
                    </div>
                    <span className={cn('flex-1 text-sm font-medium', selected ? 'text-[#92400E]' : 'text-[#374151]')}>{label}</span>
                    <div className={cn('h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0', selected ? 'border-[#914c00] bg-[#914c00]' : 'border-[#D1D5DB]')}>
                      {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Duration, Destination, Capacity ────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {/* Duration */}
        <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDE9FE]">
              <Clock size={16} className="text-[#6D28D9]" />
            </div>
            <h2 className="text-base font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>Duration</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] mb-2">Days</p>
              <Counter value={form.duration_days} onChange={(v) => update('duration_days', v)} min={1} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] mb-2">Nights</p>
              <Counter value={form.duration_nights} onChange={(v) => update('duration_nights', v)} />
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7]">
              <MapPin size={16} className="text-[#92400E]" />
            </div>
            <h2 className="text-base font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>Destination</h2>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={form.destination_city}
              onChange={(e) => update('destination_city', e.target.value)}
              placeholder="City (e.g. Lagos)"
              className="w-full rounded-xl bg-[#F3F4F6] px-4 py-2.5 text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#105fa3]/20 transition-all"
            />
            <input
              type="text"
              value={form.destination_country}
              onChange={(e) => update('destination_country', e.target.value)}
              placeholder="Country (e.g. Nigeria)"
              className="w-full rounded-xl bg-[#F3F4F6] px-4 py-2.5 text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#105fa3]/20 transition-all"
            />
          </div>
        </div>

        {/* Capacity */}
        <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D1FAE5]">
              <Users size={16} className="text-[#065F46]" />
            </div>
            <h2 className="text-base font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>Capacity</h2>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] mb-3">Max Guests per Departure</p>
          <Counter value={form.max_guests} onChange={(v) => update('max_guests', v)} min={1} />
          <p className="mt-3 text-xs text-[#9CA3AF]">Controls seats available per tour date.</p>
        </div>
      </div>

      {/* ── Section 3: Pricing ────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7]">
            <CreditCard size={16} className="text-[#92400E]" />
          </div>
          <h2 className="text-base font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>Pricing</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <NairaInput
            label="Base Price (NGN)"
            value={form.price_naira || null}
            onChange={(v) => update('price_naira', v ?? 0)}
            hint="Standard retail price per person."
          />
          <NairaInput
            label="Discounted Price (NGN)"
            value={form.discounted_price}
            onChange={(v) => update('discounted_price', v)}
            hint="Optional. Displayed as the active price."
          />
        </div>

        {form.price_naira > 0 && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#F9FAFB] px-4 py-3">
            <Star size={14} className="fill-[#D4A017] text-[#D4A017]" />
            <span className="text-sm text-[#374151]">
              Current price:{' '}
              <span className="font-bold text-[#1A1A2E]">
                {form.discounted_price ? formatNaira(form.discounted_price) : formatNaira(form.price_naira)}
              </span>
              {form.discounted_price && (
                <span className="ml-2 line-through text-[#9CA3AF] text-xs">{formatNaira(form.price_naira)}</span>
              )}
              <span className="text-xs text-[#9CA3AF] ml-1">/pp</span>
            </span>
          </div>
        )}
      </div>

      {/* ── Section 4: Itinerary ──────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDE9FE]">
              <MapPinned size={16} className="text-[#6D28D9]" />
            </div>
            <h2 className="text-base font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>Itinerary</h2>
          </div>
          <button
            type="button"
            onClick={addDay}
            className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
          >
            <Plus size={12} /> Add Day
          </button>
        </div>

        {form.itinerary.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3">
              <MapPinned size={20} className="text-[#9CA3AF]" />
            </div>
            <p className="text-sm text-[#9CA3AF]">No itinerary yet — click &quot;+ Add Day&quot; to build one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {form.itinerary.map((day, idx) => (
              <div key={day.id} className="flex gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className="h-8 w-8 rounded-full bg-[#105fa3] flex items-center justify-center text-[11px] font-bold text-white">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  {idx < form.itinerary.length - 1 && <div className="flex-1 w-px bg-[#E5E7EB] my-1.5" />}
                </div>
                <div className="flex-1 rounded-xl bg-[#F9FAFB] p-4 space-y-3 mb-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => updateDay(day.id, { title: e.target.value })}
                        placeholder="Day title (e.g. Arrival & Sunset Reception)"
                        className="w-full bg-transparent text-sm font-bold text-[#1A1A2E] outline-none placeholder-[#9CA3AF]"
                      />
                      <input
                        type="text"
                        value={day.location}
                        onChange={(e) => updateDay(day.id, { location: e.target.value })}
                        placeholder="Location"
                        className="w-full bg-transparent text-xs font-medium text-[#105fa3] outline-none placeholder-[#9CA3AF]"
                      />
                    </div>
                    <button type="button" onClick={() => removeDay(day.id)} className="text-[#9CA3AF] hover:text-[#EF4444] transition-colors mt-0.5 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <textarea
                    value={day.description}
                    onChange={(e) => updateDay(day.id, { description: e.target.value })}
                    placeholder="Describe the day's activities..."
                    rows={2}
                    className="w-full rounded-lg bg-white px-3 py-2 text-xs text-[#374151] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#105fa3]/20 transition-all resize-none"
                  />
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {day.activities.map((act, i) => (
                      <span key={i} className="flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#92400E]">
                        {act}
                        <button type="button" onClick={() => removeActivity(day.id, i)} className="hover:text-[#EF4444] transition-colors"><X size={9} /></button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={newActivity[day.id] ?? ''}
                      onChange={(e) => setNewActivity((prev) => ({ ...prev, [day.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addActivity(day.id) } }}
                      placeholder="Add activity…"
                      className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-[10px] text-[#374151] outline-none w-28 placeholder-[#9CA3AF]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 5: Gallery ────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF4FB]">
              <Upload size={16} className="text-[#105fa3]" />
            </div>
            <h2 className="text-base font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>Gallery</h2>
          </div>
          <span className="text-xs font-semibold text-[#6B7280]">{photoCount} / 12 photos</span>
        </div>

        {uploadError && (
          <div className="mb-4 rounded-xl bg-[#FEE2E2] px-3 py-2 text-xs text-[#991B1B]">{uploadError}</div>
        )}

        <div
          className="rounded-xl border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] flex flex-col items-center justify-center gap-3 py-8 cursor-pointer hover:border-[#105fa3] hover:bg-[#EEF4FB] transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DBEAFE]">
            <Upload size={18} className="text-[#105fa3]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#374151]">Drag &amp; drop images here</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">JPEG, PNG or WebP · 16:9 recommended</p>
          </div>
          <button
            type="button"
            disabled={uploading}
            className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-1.5 text-sm font-semibold text-[#374151] hover:bg-[#F3F4F6] transition-colors disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : 'Browse Files'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        </div>

        {photoCount > 0 && (
          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] mb-3">
              Click an image to set as hero / hover to remove
            </p>
            <div className="grid grid-cols-4 gap-3">
              {form.gallery_urls.map((url, i) => (
                <div key={i} className="relative group">
                  <div
                    className={cn(
                      'aspect-video rounded-xl overflow-hidden ring-2 transition-all',
                      form.hero_image_url === url ? 'ring-[#105fa3]' : 'ring-transparent hover:ring-[#D1D5DB]',
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover cursor-pointer" onClick={() => update('hero_image_url', url)} />
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
              {Array.from({ length: Math.max(0, 4 - photoCount) }).map((_, i) => (
                <div
                  key={`e${i}`}
                  className="aspect-video rounded-xl bg-[#F3F4F6] flex items-center justify-center cursor-pointer hover:bg-[#E5E7EB] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} className="text-[#9CA3AF]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {photoCount === 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] mb-2">Or paste an image URL</p>
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

      {/* ── Section 6: SEO / Keywords ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7]">
            <Search size={16} className="text-[#92400E]" />
          </div>
          <h2 className="text-base font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
            Keywords &amp; Highlights
          </h2>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#374151] mb-2">Keywords</label>
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-[#F3F4F6] px-3 py-2.5 min-h-[44px]">
            {form.highlights.map((kw) => (
              <span key={kw} className="flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-semibold text-[#92400E]">
                {kw}
                <button type="button" onClick={() => update('highlights', form.highlights.filter((h) => h !== kw))} className="hover:text-[#EF4444] transition-colors">
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addKeyword() } }}
              placeholder="Add keyword…"
              className="flex-1 min-w-[100px] bg-transparent text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-5 pb-10">
        <button
          type="button"
          onClick={() => router.push('/admin/tours')}
          className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
        >
          <ChevronLeft size={15} /> Back to Tours
        </button>

        <div className="flex items-center gap-3">
          {/* Featured toggle */}
          <div className="flex items-center gap-2 rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-4 py-2">
            <Star size={13} className={form.is_featured ? 'fill-[#D4A017] text-[#D4A017]' : 'text-[#9CA3AF]'} />
            <span className="text-sm font-medium text-[#374151]">Featured</span>
            <Toggle checked={form.is_featured} onChange={(v) => update('is_featured', v)} />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-[#105fa3] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Rocket size={15} />
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
