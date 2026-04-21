'use client'

import { useRouter } from 'next/navigation'
import {
  Plus, Clock, ChevronLeft, ChevronRight,
  TrendingUp, Map, MoreVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tour {
  tour_id: string
  title: string
  slug: string
  destination_city: string
  destination_country: string
  price_naira: number
  duration_days: number
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
  safari:    'linear-gradient(135deg, #2D5A27 0%, #4A7C59 40%, #8B7355 70%, #D4A017 100%)',
  city:      'linear-gradient(135deg, #1A237E 0%, #283593 40%, #3949AB 70%, #5C6BC0 100%)',
  beach:     'linear-gradient(135deg, #006064 0%, #00838F 40%, #0097A7 70%, #26C6DA 100%)',
  heritage:  'linear-gradient(135deg, #4A148C 0%, #6A1B9A 40%, #7B1FA2 70%, #9C27B0 100%)',
  adventure: 'linear-gradient(135deg, #BF360C 0%, #D84315 40%, #E64A19 70%, #FF7043 100%)',
  default:   'linear-gradient(135deg, #105fa3 0%, #1976D2 40%, #42A5F5 70%, #90CAF9 100%)',
}

function getGradient(category: string | null): string {
  if (!category) return CATEGORY_GRADIENTS.default
  const key = Object.keys(CATEGORY_GRADIENTS).find((k) =>
    category.toLowerCase().includes(k),
  )
  return key ? CATEGORY_GRADIENTS[key] : CATEGORY_GRADIENTS.default
}

function TourCard({ tour }: { tour: Tour }) {
  const statusBadge = tour.is_featured
    ? { label: 'FEATURED', cls: 'bg-[#EDE9FE] text-[#6D28D9]' }
    : tour.is_active
    ? { label: 'ACTIVE', cls: 'bg-[#D1FAE5] text-[#065F46]' }
    : { label: 'INACTIVE', cls: 'bg-[#F3F4F6] text-[#6B7280]' }

  return (
    <div className="group rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col transition-shadow hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
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
          <div
            className="absolute inset-0"
            style={{ background: getGradient(tour.category) }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <span
          className={cn(
            'absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm',
            statusBadge.cls,
          )}
        >
          {statusBadge.label}
        </span>

        <button className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-[#374151] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
          <MoreVertical size={13} />
        </button>
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
          <p className="text-base font-bold text-[#1A1A2E]">
            {formatNaira(tour.price_naira)}
          </p>
          <div className="flex items-center gap-1 text-[#9CA3AF]">
            <Clock size={12} />
            <span className="text-xs">{tour.duration_days} Days</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddCard() {
  return (
    <button className="rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-white/50 flex flex-col items-center justify-center gap-2 min-h-[280px] transition-colors hover:border-[#105fa3] hover:bg-[#EEF4FB] group">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6] group-hover:bg-[#DBEAFE] transition-colors">
        <Plus size={20} className="text-[#9CA3AF] group-hover:text-[#105fa3] transition-colors" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-[#374151] group-hover:text-[#105fa3] transition-colors">
          Add New Package
        </p>
        <p className="text-xs text-[#9CA3AF] mt-0.5">Start a new curated Journey</p>
      </div>
    </button>
  )
}

export default function ToursClient({
  tours,
  totalTours,
  activeTours,
  avgDuration,
  currentPage,
  pageSize,
}: Props) {
  const router = useRouter()
  const totalPages = Math.ceil(totalTours / pageSize)

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
        <button className="flex items-center gap-2 rounded-xl bg-[#914c00] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 shrink-0">
          <Plus size={15} />
          Create New Tour
        </button>
      </div>

      {/* Stats row + featured campaign card */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        {/* Stat chips */}
        <div className="flex gap-4 flex-wrap">
          <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-4 flex flex-col gap-1 min-w-[148px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
              Active Tours
            </p>
            <div className="flex items-end gap-2">
              <p
                className="text-3xl font-bold text-[#1A1A2E]"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                {activeTours}
              </p>
              <span className="mb-1 flex items-center gap-0.5 rounded-full bg-[#D1FAE5] px-2 py-0.5 text-[11px] font-semibold text-[#065F46]">
                <TrendingUp size={11} />
                +12%
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-4 flex flex-col gap-1 min-w-[148px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
              Avg. Duration
            </p>
            <div className="flex items-end gap-2">
              <p
                className="text-3xl font-bold text-[#1A1A2E]"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                {avgDuration}
              </p>
              <span className="mb-1 text-sm font-medium text-[#6B7280]">Days</span>
            </div>
          </div>
        </div>

        {/* Nigerian Heritage Month campaign card */}
        <div className="lg:ml-auto relative rounded-2xl overflow-hidden min-h-[128px] lg:w-80 flex-shrink-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, #1a5c3a 0%, #2d7a52 35%, #4a9a70 65%, #6db892 100%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent" />
          <div className="absolute right-3 top-3 opacity-15">
            <Map size={90} className="text-white" />
          </div>
          <div className="relative p-5 flex flex-col h-full">
            <span className="self-start rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
              Campaign Active
            </span>
            <h3
              className="mt-2 text-lg font-bold text-white leading-tight"
              style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
            >
              Nigerian Heritage Month
            </h3>
            <p className="mt-1 text-xs text-white/70 leading-relaxed">
              Promote active and Summer themed tour packages
            </p>
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
          <TourCard key={tour.tour_id} tour={tour} />
        ))}
        <AddCard />
      </div>

      {/* Footer: count + pagination */}
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
                    currentPage === p
                      ? 'bg-[#105fa3] text-white'
                      : 'text-[#6B7280] hover:bg-[#F3F4F6]',
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
