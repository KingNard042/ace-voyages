import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, SlidersHorizontal } from 'lucide-react'
import { getAllTours } from '@/lib/content'
import Button from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import ToursGrid from './ToursGrid'

export const metadata: Metadata = {
  title: 'Tour Packages | ACE Voyages',
  description:
    "Explore Nigeria's most curated holiday packages — leisure, adventure, honeymoon, and corporate tours across Africa and beyond.",
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
            <ToursGrid tours={tours} />
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
