import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin, Clock, Users, CheckCircle, Star,
  ArrowLeft, Calendar, ChevronRight, Shield,
} from 'lucide-react'
import { getTourBySlug, getAllTours } from '@/lib/content'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import TourBookingPanel from './TourBookingPanel'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ItineraryDay {
  id: string
  title: string
  location: string
  description: string
  activities: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseItinerary(raw: string | null): ItineraryDay[] | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0 && 'description' in parsed[0]) {
      return parsed as ItineraryDay[]
    }
  } catch { /* not JSON */ }
  return null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

const CATEGORY_META: Record<string, { label: string; bg: string; text: string }> = {
  leisure:   { label: 'Leisure',   bg: '#FEF3C7', text: '#92400E' },
  honeymoon: { label: 'Honeymoon', bg: '#FCE7F3', text: '#9D174D' },
  corporate: { label: 'Corporate', bg: '#DBEAFE', text: '#1D4ED8' },
  adventure: { label: 'Adventure', bg: '#EDE9FE', text: '#6D28D9' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-1.5">
      <h2
        className="text-xl font-bold text-[#1A1A2E] sm:text-2xl"
        style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
      >
        {children}
      </h2>
      <div className="h-0.5 w-8 rounded-full bg-[#D4A017]" />
    </div>
  )
}

function ItinerarySection({ days }: { days: ItineraryDay[] }) {
  return (
    <div className="relative">
      {/* Connecting line — sits behind cards */}
      <div
        aria-hidden="true"
        className="absolute left-6 top-12 bottom-6 w-px"
        style={{ background: 'linear-gradient(to bottom, #1B3A6B22, #D4A01722, #1B3A6B11)' }}
      />

      <ol className="flex flex-col gap-6">
        {days.map((day, i) => (
          <li key={day.id} className="relative flex gap-5">

            {/* Day number — navy pill, gold number */}
            <div
              aria-label={`Day ${i + 1}`}
              className="relative z-10 flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#1B3A6B] shadow-sm"
            >
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">Day</span>
              <span
                className="text-sm font-bold leading-none text-[#D4A017]"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Card */}
            <div className="flex-1 rounded-2xl bg-white px-5 py-4 shadow-[0_2px_16px_rgba(26,28,28,0.06)] [transition:box-shadow_250ms_ease-out] hover:shadow-[0_8px_28px_rgba(26,28,28,0.10)]">
              {/* Title + location row */}
              {(day.title || day.location) && (
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {day.title && (
                    <h3
                      className="text-sm font-bold text-[#1A1A2E]"
                      style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                    >
                      {day.title}
                    </h3>
                  )}
                  {day.location && (
                    <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                      <MapPin size={10} className="shrink-0 text-[#D4A017]" aria-hidden="true" />
                      {day.location}
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              {day.description && (
                <p className="text-sm leading-relaxed text-[#4B5563]">{day.description}</p>
              )}

              {/* Activity pills */}
              {day.activities.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Activities">
                  {day.activities.map((act, j) => (
                    <li
                      key={j}
                      className="rounded-full bg-[#EEF4FB] px-3 py-1 text-[11px] font-semibold text-[#1B3A6B]"
                    >
                      {act}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const tours = await getAllTours()
  return tours.map((t) => ({ slug: t.slug }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tour = await getTourBySlug(slug)
  if (!tour) return { title: 'Tour Not Found | ACE Voyages' }
  return {
    title: `${tour.title} | ACE Voyages`,
    description: tour.short_description ?? `Explore ${tour.destination_city}, ${tour.destination_country} with ACE Voyages.`,
    openGraph: {
      title: tour.title,
      description: tour.short_description ?? undefined,
      images: tour.hero_image_url
        ? [{ url: tour.hero_image_url, width: 1200, height: 630, alt: tour.title }]
        : [],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tour = await getTourBySlug(slug)
  if (!tour) notFound()

  const cat = tour.category ? CATEGORY_META[tour.category] : null
  const itinerary = parseItinerary(tour.full_description)
  const destination = `${tour.destination_city}, ${tour.destination_country}`
  const gallery = (tour.gallery_urls ?? []).filter(Boolean)
  const spotsLeft = tour.departures.reduce((min, d) => {
    const avail = d.max_guests - d.guests_booked
    return Math.min(min, avail)
  }, Infinity)

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative h-[60vh] min-h-[400px] max-h-[620px] overflow-hidden">
        <Image
          src={tour.hero_image_url ?? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80'}
          alt={tour.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Rich layered gradient: dark bottom for text, slight vignette on sides */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08122a]/90 via-[#0c1a3a]/40 to-[#0c1a3a]/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08122a]/20 via-transparent to-[#08122a]/10" />

        {/* Content pinned to bottom */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">

            {/* Back link */}
            <Link
              href="/tours"
              className="mb-6 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white/85 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
            >
              <ArrowLeft size={13} aria-hidden="true" />
              All Tours
            </Link>

            {/* Category badge */}
            {cat && (
              <div className="mb-3">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm"
                  style={{ backgroundColor: cat.bg, color: cat.text }}
                >
                  {cat.label}
                </span>
              </div>
            )}

            {/* Title */}
            <h1
              className="max-w-3xl text-2xl font-bold leading-tight text-white drop-shadow-sm sm:text-3xl lg:text-[2.625rem] lg:leading-[1.18]"
              style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
            >
              {tour.title}
            </h1>

            {/* Meta strip */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/75">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[#D4A017]" aria-hidden="true" />
                {destination}
              </span>
              <span className="h-3 w-px bg-white/25" aria-hidden="true" />
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#D4A017]" aria-hidden="true" />
                {tour.duration_days} day{tour.duration_days === 1 ? '' : 's'}
              </span>
              <span className="h-3 w-px bg-white/25" aria-hidden="true" />
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-[#D4A017]" aria-hidden="true" />
                Up to {tour.max_guests} guests
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#F8F9FA]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[#9CA3AF]">
              <li>
                <Link
                  href="/"
                  className="rounded transition-colors hover:text-[#1B3A6B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B3A6B]/40"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li>
                <Link
                  href="/tours"
                  className="rounded transition-colors hover:text-[#1B3A6B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B3A6B]/40"
                >
                  Tours
                </Link>
              </li>
              <li aria-hidden="true"><ChevronRight size={13} /></li>
              <li className="max-w-[240px] truncate font-medium text-[#1A1A2E] sm:max-w-none">
                {tour.title}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">

            {/* ── Left: Main content ─────────────────────────────────────── */}
            <div className="flex flex-col gap-10">

              {/* Lede */}
              {tour.short_description && (
                <p className="rounded-2xl bg-[#FDF8EE] px-6 py-5 text-base font-medium leading-relaxed text-[#4B5563] lg:text-lg">
                  {tour.short_description}
                </p>
              )}

              {/* Itinerary */}
              {itinerary && itinerary.length > 0 && (
                <section aria-labelledby="itinerary-heading">
                  <SectionTitle>
                    <span id="itinerary-heading">Day-by-Day Itinerary</span>
                  </SectionTitle>
                  <ItinerarySection days={itinerary} />
                </section>
              )}

              {/* Plain description fallback */}
              {!itinerary && tour.full_description && (
                <section aria-labelledby="about-heading">
                  <SectionTitle>
                    <span id="about-heading">About This Tour</span>
                  </SectionTitle>
                  <div className="space-y-4 text-sm leading-relaxed text-[#4B5563]">
                    {tour.full_description.split('\n').map((para, i) =>
                      para.trim() ? <p key={i}>{para}</p> : null
                    )}
                  </div>
                </section>
              )}

              {/* Highlights */}
              {tour.highlights && tour.highlights.length > 0 && (
                <section aria-labelledby="highlights-heading">
                  <SectionTitle>
                    <span id="highlights-heading">Tour Highlights</span>
                  </SectionTitle>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {tour.highlights.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-xl bg-white px-4 py-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
                      >
                        <Star
                          size={14}
                          className="mt-0.5 shrink-0 fill-[#D4A017] text-[#D4A017]"
                          aria-hidden="true"
                        />
                        <span className="text-sm leading-relaxed text-[#374151]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* What's included */}
              {tour.whats_included && tour.whats_included.length > 0 && (
                <section aria-labelledby="included-heading">
                  <SectionTitle>
                    <span id="included-heading">What&apos;s Included</span>
                  </SectionTitle>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {tour.whats_included.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-xl bg-white px-4 py-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
                      >
                        <CheckCircle
                          size={14}
                          className="mt-0.5 shrink-0 text-[#166534]"
                          aria-hidden="true"
                        />
                        <span className="text-sm leading-relaxed text-[#374151]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Departures */}
              {tour.departures.length > 0 && (
                <section aria-labelledby="departures-heading">
                  <SectionTitle>
                    <span id="departures-heading">Available Departures</span>
                  </SectionTitle>
                  <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                    {tour.departures.slice(0, 6).map((dep, idx) => {
                      const available = dep.max_guests - dep.guests_booked
                      const full = available <= 0
                      const low = available > 0 && available <= 3
                      return (
                        <div
                          key={dep.departure_id}
                          className={[
                            'flex items-center justify-between px-5 py-4',
                            idx < tour.departures.length - 1 && idx < 5
                              ? 'border-b border-[#F3F4F6]'
                              : '',
                          ].join(' ')}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FB]">
                              <Calendar size={15} className="text-[#1B3A6B]" aria-hidden="true" />
                            </div>
                            <span className="text-sm font-semibold text-[#1A1A2E]">
                              {formatDate(dep.departure_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="hidden text-xs text-[#9CA3AF] sm:block">
                              {dep.max_guests} seats
                            </span>
                            <span
                              className={[
                                'rounded-full px-3 py-1 text-[11px] font-bold',
                                full
                                  ? 'bg-red-50 text-red-600'
                                  : low
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-[#F0FDF4] text-[#166534]',
                              ].join(' ')}
                            >
                              {full
                                ? 'Fully Booked'
                                : low
                                ? `${available} spot${available === 1 ? '' : 's'} left`
                                : `${available} available`}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Gallery */}
              {gallery.length > 0 && (
                <section aria-labelledby="gallery-heading">
                  <SectionTitle>
                    <span id="gallery-heading">Gallery</span>
                  </SectionTitle>
                  <div
                    className={[
                      'grid gap-3',
                      gallery.length >= 3
                        ? 'grid-cols-2 sm:grid-cols-3'
                        : 'grid-cols-2',
                    ].join(' ')}
                  >
                    {gallery.slice(0, 6).map((url, i) => (
                      <div
                        key={i}
                        className={[
                          'relative overflow-hidden rounded-2xl',
                          i === 0 && gallery.length >= 3
                            ? 'col-span-2 aspect-[16/9] sm:col-span-2'
                            : 'aspect-[4/3]',
                        ].join(' ')}
                      >
                        <Image
                          src={url}
                          alt={`${tour.title} — photo ${i + 1}`}
                          fill
                          sizes={i === 0 ? '(max-width: 640px) 100vw, 66vw' : '(max-width: 640px) 50vw, 33vw'}
                          className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Trust strip — mobile only */}
              <div className="flex items-start gap-3 rounded-2xl bg-white px-5 py-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] lg:hidden">
                <Shield size={15} className="mt-0.5 shrink-0 text-[#166534]" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-[#4B5563]">
                  No payment now — our team confirms your booking details within 24 hours.
                </p>
              </div>
            </div>

            {/* ── Right: Booking panel ───────────────────────────────────── */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <TourBookingPanel
                tourName={tour.title}
                destination={destination}
                slug={tour.slug}
                priceNaira={tour.price_naira}
                durationDays={tour.duration_days}
                maxGuests={tour.max_guests}
                spotsLeft={isFinite(spotsLeft) ? spotsLeft : null}
                isFeatured={tour.is_featured}
                nextDeparture={tour.departures[0]?.departure_date ?? null}
              />
            </div>
          </div>
        </div>
      </div>

      <WhatsAppButton />
    </>
  )
}
