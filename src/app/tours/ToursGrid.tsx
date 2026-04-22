'use client'

import { useState } from 'react'
import Image from 'next/image'
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

export default function ToursGrid({ tours }: { tours: Tour[] }) {
  const [modal, setModal] = useState<ModalState | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => {
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
              <div className="relative aspect-[3/2] overflow-hidden">
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
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h2
                  className="line-clamp-2 text-lg font-bold leading-snug text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                >
                  {tour.title}
                </h2>

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
