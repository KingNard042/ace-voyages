import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Clock, Users, SlidersHorizontal } from 'lucide-react'
import Image from 'next/image'
import { getAllTours } from '@/lib/content'
import Button from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'
import WhatsAppButton from '@/components/ui/WhatsAppButton'

export const metadata: Metadata = {
  title: 'Tour Packages | ACE Voyages',
  description:
    "Explore Nigeria's most curated holiday packages — leisure, adventure, honeymoon, and corporate tours across Africa and beyond.",
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80'

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

function formatPrice(n: number) {
  return `₦${n.toLocaleString('en-NG')}`
}

export default async function ToursPage() {
  const tours = await getAllTours()

  return (
    <>
      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <section
        className="relative flex min-h-[340px] items-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }}
      >
        <div className="absolute inset-0 bg-[#0c1a3a]/70" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <p
            className="text-xl text-[#D4A017]"
            style={{ fontFamily: 'var(--font-satisfy, cursive)' }}
          >
            Discover the world
          </p>
          <h1
            className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            Our Tour Packages
          </h1>
          <p className="mt-3 max-w-lg text-base text-white/70 sm:text-lg">
            Handpicked destinations with everything included — flights, accommodation, experiences,
            and a dedicated travel expert.
          </p>
        </div>
      </section>

      {/* ── Tour listing ─────────────────────────────────────────────────── */}
      <section className="bg-[#F8F9FA] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Header + count */}
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              title="Available Packages"
              subtitle={
                tours.length > 0
                  ? `${tours.length} tour${tours.length === 1 ? '' : 's'} available right now`
                  : 'New packages coming soon'
              }
            />
            <div className="flex items-center gap-2 rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-4 py-2.5">
              <SlidersHorizontal size={15} className="text-[#6B7280]" />
              <span className="text-sm font-medium text-[#374151]">
                {tours.length} result{tours.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {tours.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-24 text-center shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3F4F6]">
                <MapPin size={28} className="text-[#9CA3AF]" />
              </div>
              <h2
                className="text-xl font-bold text-[#1A1A2E]"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                No tours available yet
              </h2>
              <p className="mt-2 max-w-sm text-sm text-[#6B7280]">
                We&apos;re curating amazing experiences. In the meantime, reach out on WhatsApp —
                we&apos;ll build a custom itinerary just for you.
              </p>
              <a
                href="https://wa.me/2348061640504"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6"
              >
                <Button variant="gold">Chat with Us on WhatsApp</Button>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => {
                const catColor = CATEGORY_COLORS[tour.category ?? ''] ?? { bg: '#F3F4F6', text: '#6B7280' }
                const catLabel = CATEGORY_LABELS[tour.category ?? '']
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

                      {/* Category badge */}
                      {catLabel && (
                        <span
                          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: catColor.bg, color: catColor.text }}
                        >
                          {catLabel}
                        </span>
                      )}

                      {/* Featured flag */}
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
                          {tour.destination_city}, {tour.destination_country}
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
                      <div className="mt-auto flex items-end justify-between pt-3 border-t border-[#F3F4F6]">
                        <div>
                          <p className="text-xs text-[#9CA3AF]">From</p>
                          <p
                            className="text-xl font-bold text-[#D4A017]"
                            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                          >
                            {formatPrice(tour.price_naira)}
                          </p>
                          <p className="text-[10px] text-[#9CA3AF]">per person</p>
                        </div>
                        <Link href={`/tours/${tour.slug}`}>
                          <Button size="sm">Book Now</Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────────────────────────────── */}
      <section
        className="py-16"
        style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0d2247 100%)' }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2
            className="text-2xl font-bold text-white sm:text-3xl"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            Can&apos;t find your dream destination?
          </h2>
          <p className="mt-3 text-base text-white/65">
            Our travel experts design bespoke itineraries around you. Tell us where you want to go
            and we&apos;ll handle the rest.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <a href="https://wa.me/2348061640504" target="_blank" rel="noopener noreferrer">
              <Button variant="gold" size="lg">
                WhatsApp Us
              </Button>
            </a>
            <Link href="/contact">
              <Button
                variant="outlined"
                size="lg"
                className="text-white ring-white/35 hover:bg-white/10"
              >
                Send an Enquiry
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </>
  )
}
