'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle } from 'lucide-react'
import TourLeadForm from '@/components/forms/TourLeadForm'

interface TourLeadModalProps {
  isOpen: boolean
  onClose: () => void
  tourName: string
  destination: string
  slug: string
}

export default function TourLeadModal({
  isOpen,
  onClose,
  tourName,
  destination,
  slug,
}: TourLeadModalProps) {
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setSubmitted(false)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Book tour: ${tourName}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0d2247 100%)' }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#D4A017]">
              Book Your Tour
            </p>
            <h2
              className="mt-0.5 line-clamp-1 text-lg font-bold text-white"
              style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
            >
              {tourName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3
                className="text-xl font-bold text-[#1A1A2E]"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                Request Received!
              </h3>
              <p className="mt-2 max-w-xs text-sm text-[#6B7280]">
                Thank you for your interest in{' '}
                <strong className="text-[#1B3A6B]">{tourName}</strong>. Our team will
                reach out within 24 hours with full details and pricing.
              </p>
              <button
                onClick={onClose}
                className="mt-6 text-sm font-semibold text-[#1B3A6B] hover:underline"
              >
                Close
              </button>
            </div>
          ) : (
            <TourLeadForm
              tourName={tourName}
              destination={destination}
              slug={slug}
              onSuccess={() => setSubmitted(true)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
