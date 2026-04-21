'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Clock, ChevronLeft, ChevronRight,
  TrendingUp, Map, MoreVertical, Pencil, Trash2,
  ToggleLeft, ToggleRight, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteTour, toggleTourStatus } from './tourActions'

interface Tour {
  tour_id: string
  title: string
  slug: string
  destination_city: string
  destination_country: string
  price_naira: number
  duration_days: number
  max_guests: number
  hero_image_url: string | null
  short_description: string | null
  is_active: boolean
  is_featured: boolean
  category: string | null
}

interface Props {
  tours: Tour[]
  totalTours: number
  activeTours: number
  avgDuration: string
  currentPage: number
  pageSize: number
}

function formatNaira(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n.toLocaleString()}`
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  leisure:   'linear-gradient(135deg, #2D5A27 0%, #4A7C59 40%, #8B7355 70%, #D4A017 100%)',
  honeymoon: 'linear-gradient(135deg, #880E4F 0%, #C2185B 40%, #E91E63 70%, #F48FB1 100%)',
  corporate: 'linear-gradient(135deg, #1A237E 0%, #283593 40%, #3949AB 70%, #5C6BC0 100%)',
  adventure: 'linear-gradient(135deg, #BF360C 0%, #D84315 40%, #E64A19 70%, #FF7043 100%)',
  default:   'linear-gradient(135deg, #105fa3 0%, #1976D2 40%, #42A5F5 70%, #90CAF9 100%)',
}

function getGradient(category: string | null): string {
  if (!category) return CATEGORY_GRADIENTS.default
  return CATEGORY_GRADIENTS[category] ?? CATEGORY_GRADIENTS.default
}

function TourCard({ tour, onDeleted }: { tour: Tour; onDeleted: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [localActive, setLocalActive] = useState(tour.is_active)

  const statusBadge = tour.is_featured
    ? { label: 'FEATURED', cls: 'bg-[#EDE9FE] text-[#6D28D9]' }
    : localActive
    ? { label: 'ACTIVE', cls: 'bg-[#D1FAE5] text-[#065F46]' }
    : { label: 'INACTIVE', cls: 'bg-[#F3F4F6] text-[#6B7280]' }

  function handleToggle() {
    setMenuOpen(false)
    startTransition(async () => {
      const next = !localActive
      const result = await toggleTourStatus(tour.tour_id, next)
      if (result.success) setLocalActive(next)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTour(tour.tour_id)
      if (result.success) onDeleted(tour.tour_id)
      else setConfirmDelete(false)
    })
  }

  return (
    <div className="group relative rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col transition-shadow hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      {/* Delete confirmation overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/95 backdrop-blur-sm px-6 text-center">
          <Trash2 size={28} className="text-[#EF4444]" />
          <p className="text-sm font-bold text-[#1A1A2E]">Delete &ldquo;{tour.title}&rdquo;?</p>
          <p className="text-xs text-[#6B7280]">This action cannot be undone.</p>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={isPending}
              className="flex-1 rounded-xl border border-[#E5E7EB] py-2 text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 rounded-xl bg-[#EF4444] py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Image / gradient area */}
      <div className="relative h-44 shrink-0">
        {tour.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tour.hero_image_url}
            alt={tour.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: getGradient(tour.category) }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <span className={cn('absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm', statusBadge.cls)}>
          {statusBadge.label}
        </span>

        {/* Actions menu */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-[#374151] shadow-sm hover:bg-white transition-colors"
          >
            <MoreVertical size={13} />
          </button>

          {menuOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 w-44 rounded-xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-[#F3F4F6] overflow-hidden">
                <Link
                  href={`/admin/tours/${tour.tour_id}/edit`}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Pencil size={13} className="text-[#105fa3]" />
                  Edit Tour
                </Link>
                <button
                  onClick={handleToggle}
                  disabled={isPending}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
                >
                  {localActive
                    ? <ToggleLeft size={13} className="text-[#6B7280]" />
                    : <ToggleRight size={13} className="text-[#22C55E]" />}
                  {localActive ? 'Set Inactive' : 'Set Active'}
                </button>
                <div className="h-px bg-[#F3F4F6]" />
                <button
                  onClick={() => { setMenuOpen(false); setConfirmDelete(true) }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                >
                  <Trash2 size={13} />
                  Delete Tour
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF] mb-1">
          {tour.destination_city}, {tour.destination_country}
        </p>
        <h3
          className="text-sm font-bold text-[#1A1A2E] leading-snug line-clamp-1"
          style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
        >
          {tour.title}
        </h3>
        {tour.short_description && (
          <p className="mt-1.5 text-xs text-[#6B7280] leading-relaxed line-clamp-2">
            {tour.short_description}
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          <p className="text-base font-bold text-[#1A1A2E]">{formatNaira(tour.price_naira)}</p>
          <div className="flex items-center gap-3 text-[#9CA3AF]">
            <span className="flex items-center gap-1 text-xs">
              <Users size={11} />
              {tour.max_guests}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <Clock size={11} />
              {tour.duration_days}d
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddCard() {
  return (
    <Link
      href="/admin/tours/new"
      className="rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-white/50 flex flex-col items-center justify-center gap-2 min-h-[280px] transition-colors hover:border-[#105fa3] hover:bg-[#EEF4FB] group"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6] group-hover:bg-[#DBEAFE] transition-colors">
        <Plus size={20} className="text-[#9CA3AF] group-hover:text-[#105fa3] transition-colors" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-[#374151] group-hover:text-[#105fa3] transition-colors">
          Add New Package
        </p>
        <p className="text-xs text-[#9CA3AF] mt-0.5">Start a new curated journey</p>
      </div>
    </Link>
  )
}

export default function ToursClient({
  tours: initialTours,
  totalTours,
  activeTours,
  avgDuration,
  currentPage,
  pageSize,
}: Props) {
  const router = useRouter()
  const [tours, setTours] = useState(initialTours)
  const totalPages = Math.ceil(totalTours / pageSize)

  function handleDeleted(id: string) {
    setTours((prev) => prev.filter((t) => t.tour_id !== id))
  }

  function goToPage(p: number) {
    router.push(`/admin/tours?page=${p}`)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
            Tailored Experiences
          </p>
          <h1
            className="mt-1 text-3xl font-bold text-[#1A1A2E]"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            Tour Packages
          </h1>
          <p className="mt-1.5 text-sm text-[#6B7280] max-w-lg">
            Manage your curated travel experiences. Create, edit, and monitor performance of global and local Nigerian tour offerings.
          </p>
        </div>
        <Link
          href="/admin/tours/new"
          className="flex items-center gap-2 rounded-xl bg-[#914c00] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 shrink-0"
        >
          <Plus size={15} />
          Create New Tour
        </Link>
      </div>

      {/* Stats row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="flex gap-4 flex-wrap">
          <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-4 flex flex-col gap-1 min-w-[148px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Active Tours</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
                {activeTours}
              </p>
              <span className="mb-1 flex items-center gap-0.5 rounded-full bg-[#D1FAE5] px-2 py-0.5 text-[11px] font-semibold text-[#065F46]">
                <TrendingUp size={11} />
                +12%
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-4 flex flex-col gap-1 min-w-[148px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Avg. Duration</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
                {avgDuration}
              </p>
              <span className="mb-1 text-sm font-medium text-[#6B7280]">Days</span>
            </div>
          </div>
        </div>

        {/* Campaign card */}
        <div className="lg:ml-auto relative rounded-2xl overflow-hidden min-h-[128px] lg:w-80 flex-shrink-0">
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #1a5c3a 0%, #2d7a52 35%, #4a9a70 65%, #6db892 100%)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent" />
          <div className="absolute right-3 top-3 opacity-15">
            <Map size={90} className="text-white" />
          </div>
          <div className="relative p-5 flex flex-col h-full">
            <span className="self-start rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
              Campaign Active
            </span>
            <h3 className="mt-2 text-lg font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
              Nigerian Heritage Month
            </h3>
            <p className="mt-1 text-xs text-white/70 leading-relaxed">Promote active and Summer themed tour packages</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-colors">
                Manage Tours
              </button>
              <button className="rounded-lg bg-[#D4A017] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity">
                View Stats
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tour cards grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {tours.map((tour) => (
          <TourCard key={tour.tour_id} tour={tour} onDeleted={handleDeleted} />
        ))}
        <AddCard />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B7280]">
          Showing {tours.length} of {totalTours} packages
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                    currentPage === p ? 'bg-[#105fa3] text-white' : 'text-[#6B7280] hover:bg-[#F3F4F6]',
                  )}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
