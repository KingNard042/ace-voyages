'use client'

import { useState } from 'react'
import { Clock, Users, Star, MessageCircle, Shield, Calendar, Zap } from 'lucide-react'
import Button from '@/components/ui/Button'
import TourLeadModal from '@/components/ui/TourLeadModal'

interface TourBookingPanelProps {
  tourName: string
  destination: string
  slug: string
  priceNaira: number
  durationDays: number
  maxGuests: number
  spotsLeft: number | null
  isFeatured: boolean
  nextDeparture: string | null
}

function formatNextDeparture(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function TourBookingPanel({
  tourName,
  destination,
  slug,
  priceNaira,
  durationDays,
  maxGuests,
  spotsLeft,
  isFeatured,
  nextDeparture,
}: TourBookingPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const isLow = spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 3
  const isFull = spotsLeft !== null && spotsLeft <= 0

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_48px_rgba(26,28,28,0.12)]">

        {/* ── Price header ─────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden px-6 py-6"
          style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0d2247 100%)' }}
        >
          {/* Subtle decorative circle */}
          <div
            aria-hidden="true"
            className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5"
          />
          <div
            aria-hidden="true"
            className="absolute -right-2 bottom-0 h-16 w-16 rounded-full bg-[#D4A017]/10"
          />

          {isFeatured && (
            <div className="mb-3 flex items-center gap-1.5">
              <Star size={11} className="fill-[#D4A017] text-[#D4A017]" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A017]">
                Featured Package
              </span>
            </div>
          )}

          <p className="text-xs font-medium text-white/50 uppercase tracking-widest">Starting from</p>
          <p
            className="mt-1 text-4xl font-bold leading-none text-[#D4A017]"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            ₦{priceNaira.toLocaleString('en-NG')}
          </p>
          <p className="mt-1 text-xs text-white/45">per person, all inclusive</p>

          {/* Urgency badge */}
          {isLow && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1.5">
              <Zap size={11} className="text-amber-300" aria-hidden="true" />
              <span className="text-[11px] font-bold text-amber-300">
                Only {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} remaining
              </span>
            </div>
          )}
        </div>

        {/* ── Tour details ─────────────────────────────────────────────── */}
        <div className="divide-y divide-[#F3F4F6] px-6">
          <div className="flex items-center justify-between py-3.5">
            <span className="flex items-center gap-2 text-sm text-[#6B7280]">
              <Clock size={14} className="text-[#1B3A6B]" aria-hidden="true" />
              Duration
            </span>
            <span className="text-sm font-semibold text-[#1A1A2E]">
              {durationDays} day{durationDays === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex items-center justify-between py-3.5">
            <span className="flex items-center gap-2 text-sm text-[#6B7280]">
              <Users size={14} className="text-[#1B3A6B]" aria-hidden="true" />
              Group size
            </span>
            <span className="text-sm font-semibold text-[#1A1A2E]">
              Up to {maxGuests} guests
            </span>
          </div>

          {nextDeparture && (
            <div className="flex items-center justify-between py-3.5">
              <span className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Calendar size={14} className="text-[#1B3A6B]" aria-hidden="true" />
                Next departure
              </span>
              <span className="text-sm font-semibold text-[#1A1A2E]">
                {formatNextDeparture(nextDeparture)}
              </span>
            </div>
          )}

          {spotsLeft !== null && (
            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm text-[#6B7280]">Availability</span>
              <span
                className={[
                  'rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                  isFull
                    ? 'bg-red-50 text-red-600'
                    : isLow
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-[#F0FDF4] text-[#166534]',
                ].join(' ')}
              >
                {isFull ? 'Fully Booked' : isLow ? `${spotsLeft} left` : 'Available'}
              </span>
            </div>
          )}
        </div>

        {/* ── CTAs ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 px-6 pb-5 pt-4">
          <Button
            variant="gold"
            size="md"
            className="w-full font-bold"
            onClick={() => setModalOpen(true)}
            disabled={isFull}
            aria-label={`Book ${tourName}`}
          >
            {isFull ? 'Fully Booked' : 'Book This Tour'}
          </Button>

          <a
            href="https://wa.me/2348061640504"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#F0FDF4] px-4 text-sm font-semibold text-[#166534] transition-colors duration-200 hover:bg-[#DCFCE7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#166534]"
            aria-label="Ask about this tour on WhatsApp"
          >
            <MessageCircle size={15} aria-hidden="true" />
            Ask on WhatsApp
          </a>
        </div>

        {/* ── Trust footer ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 border-t border-[#F3F4F6] bg-[#FAFAFA] px-6 py-4">
          <Shield size={14} className="shrink-0 text-[#166534]" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-[#6B7280]">
            No payment now — our team confirms details within 24 hours.
          </p>
        </div>
      </div>

      <TourLeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tourName={tourName}
        destination={destination}
        slug={slug}
      />
    </>
  )
}
