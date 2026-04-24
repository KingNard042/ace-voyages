'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock } from 'lucide-react'
import Button from '@/components/ui/Button'
import TourLeadModal from '@/components/ui/TourLeadModal'
import type { Tour } from '@/lib/content'

const CATEGORY_LABELS: Record<string, string> = {
  leisure: 'Leisure',
  honeymoon: 'Honeymoon',
  corporate: 'Corporate',
  adventure: 'Adventure',
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  leisure:   { bg: '#FEF3C7', text: '#92400E' },
  honeymoon: { bg: '#FCE7F3', text: '#9D174D' },
  corporate: { bg: '#DBEAFE', text: '#1D4ED8' },
  adventure: { bg: '#EDE9FE', text: '#6D28D9' },
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80'

interface ModalState {
  tourName: string
  destination: string
  slug: string
}

const CATEGORY_ORDER = ['leisure', 'honeymoon', 'corporate', 'adventure']

export default function ToursGrid({ tours }: { tours: Tour[] }) {
  const [modal, setModal] = useState<ModalState | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const availableCategories = CATEGORY_ORDER.filter((cat) =>
    tours.some((t) => t.category === cat)
  )

  const filtered =
    activeCategory === 'all' ? tours : tours.filter((t) => t.category === activeCategory)

  return (
    <>
      {/* ── Category filter chips ─────────────────────────────────────── */}
      {availableCategories.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
              activeCategory === 'all'
                ? 'bg-[#1B3A6B] text-white shadow-sm'
                : 'bg-white text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A2E]',
            ].join(' ')}
          >
            All ({tours.length})
          </button>
          {availableCategories.map((cat) => {
            const color = CATEGORY_COLORS[cat] ?? { bg: '#F3F4F6', text: '#6B7280' }
            const label = CATEGORY_LABELS[cat] ?? cat
            const count = tours.filter((t) => t.category === cat).length
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200"
                style={
                  isActive
                    ? { backgroundColor: color.text, color: '#fff' }
                    : { backgroundColor: color.bg, color: color.text }
                }
              >
                {label} ({count})
              </button>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tour) => {
          const catColor =
            CATEGORY_COLORS[tour.category ?? ''] ?? { bg: '#F3F4F6', text: '#6B7280' }
          const catLabel = CATEGORY_LABELS[tour.category ?? '']
          const destination = `${tour.destination_city}, ${tour.destination_country}`

          return (
            <article
              key={tour.tour_id}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(26,28,28,0.12)]"
            >
              {/* Image */}
              <Link href={`/tours/${tour.slug}`} className="relative block aspect-[3/2] overflow-hidden">
                <Image
                  src={tour.hero_image_url ?? FALLBACK_IMAGE}
                  alt={tour.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {catLabel && (
                  <span
                    className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: catColor.bg, color: catColor.text }}
                  >
                    {catLabel}
                  </span>
                )}

                {tour.is_featured && (
                  <span className="absolute right-3 top-3 rounded-full bg-[#D4A017] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Featured
                  </span>
                )}
              </Link>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <Link href={`/tours/${tour.slug}`}>
                  <h2
                    className="line-clamp-2 text-lg font-bold leading-snug text-[#1A1A2E] transition-colors hover:text-[#1B3A6B]"
                    style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                  >
                    {tour.title}
                  </h2>
                </Link>

                <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#D4A017]" />
                    {destination}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-[#D4A017]" />
                    {tour.duration_days} day{tour.duration_days === 1 ? '' : 's'}
                  </span>
                </div>

                {tour.short_description && (
                  <p className="line-clamp-2 text-sm leading-relaxed text-[#6B7280]">
                    {tour.short_description}
                  </p>
                )}

                {/* Price + CTA */}
                <div className="mt-auto flex items-end justify-between border-t border-[#F3F4F6] pt-3">
                  <div>
                    <p className="text-xs text-[#9CA3AF]">From</p>
                    <p
                      className="text-xl font-bold text-[#D4A017]"
                      style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                    >
                      ₦{tour.price_naira.toLocaleString('en-NG')}
                    </p>
                    <p className="text-[10px] text-[#9CA3AF]">per person</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tours/${tour.slug}`}
                      className="text-xs font-semibold text-[#1B3A6B] hover:underline"
                    >
                      Details
                    </Link>
                    <Button
                      size="sm"
                      onClick={() =>
                        setModal({ tourName: tour.title, destination, slug: tour.slug })
                      }
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {modal && (
        <TourLeadModal
          isOpen={true}
          onClose={() => setModal(null)}
          tourName={modal.tourName}
          destination={modal.destination}
          slug={modal.slug}
        />
      )}
    </>
  )
}
