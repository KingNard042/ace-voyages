'use client'

import Link from 'next/link'
import {
  AlignLeft, Bold, Italic, List, Link as LinkIcon, ImageIcon,
  Landmark, Mountain, Heart, Briefcase, Tag,
  ChevronRight, Check, Minus, Plus, Clock, MapPin, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FormState, FormUpdater } from './types'

interface Props {
  form: FormState
  update: FormUpdater
  step: number
  onNext: () => void
  onSaveDraft: () => void
  isPending: boolean
}

const CATEGORIES = [
  { value: 'leisure',   label: 'Leisure',   Icon: Landmark,  bg: '#FEF3C7', color: '#92400E' },
  { value: 'adventure', label: 'Adventure', Icon: Mountain,  bg: '#EDE9FE', color: '#6D28D9' },
  { value: 'honeymoon', label: 'Honeymoon', Icon: Heart,     bg: '#FCE7F3', color: '#9D174D' },
  { value: 'corporate', label: 'Corporate', Icon: Briefcase, bg: '#DBEAFE', color: '#1D4ED8' },
]

function StepIndicator({ step }: { step: number }) {
  const steps = [
    { n: 1, label: 'Details' },
    { n: 2, label: 'Pricing' },
    { n: 3, label: 'Review' },
  ]
  return (
    <div className="flex items-start gap-2">
      {steps.map((s, i) => {
        const state = step > s.n ? 'done' : step === s.n ? 'active' : 'upcoming'
        return (
          <div key={s.n} className="flex items-start gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold',
                  state === 'active'   ? 'bg-[#105fa3] text-white shadow-[0_0_0_4px_rgba(16,95,163,0.15)]' :
                  state === 'done'     ? 'bg-[#105fa3] text-white' :
                                         'bg-[#F3F4F6] text-[#9CA3AF]',
                )}
              >
                {state === 'done' ? <Check size={14} /> : s.n}
              </div>
              <span
                className={cn(
                  'text-[9px] font-bold uppercase tracking-[0.1em]',
                  state === 'active' ? 'text-[#105fa3]' : 'text-[#9CA3AF]',
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'h-px w-10 mt-4',
                  state === 'done' ? 'bg-[#105fa3]' : 'bg-[#E5E7EB]',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
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

export default function Step1Details({ form, update, step, onNext, onSaveDraft, isPending }: Props) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="text-xs text-[#9CA3AF]">
            <Link href="/admin/tours" className="hover:text-[#105fa3] transition-colors">
              Tour Packages
            </Link>
            {' '}›{' '}
            <span className="font-medium text-[#105fa3]">New Tour</span>
          </p>
          <h1
            className="mt-2 text-4xl font-bold text-[#1A1A2E]"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            Create New Tour
          </h1>
          <p
            className="mt-1 text-xl text-[#914c00]"
            style={{ fontFamily: 'var(--font-satisfy, Satisfy, cursive)', fontStyle: 'italic' }}
          >
            Start your journey here
          </p>
        </div>
        <StepIndicator step={step} />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* LEFT — main content */}
        <div className="space-y-5">
          {/* Core Information card */}
          <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF4FB]">
                <AlignLeft size={16} className="text-[#105fa3]" />
              </div>
              <h2
                className="text-base font-bold text-[#1A1A2E]"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                Core Information
              </h2>
            </div>

            <div className="space-y-5">
              {/* Tour name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#374151] mb-2">
                  Tour Name
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="e.g. Serengeti Sunset Expedition"
                  className="w-full rounded-xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#105fa3]/20 transition-all"
                />
                <p className="mt-1.5 text-xs italic text-[#9CA3AF]">
                  Tip: Use evocative names that capture the essence of the experience.
                </p>
              </div>

              {/* Tour description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#374151] mb-2">
                  Tour Description
                </label>
                <div className="rounded-t-xl bg-[#F9FAFB] border-b border-[#F3F4F6] px-3 py-2 flex items-center gap-2.5">
                  {[Bold, Italic, List, LinkIcon, ImageIcon].map((Icon, i) => (
                    <button
                      key={i}
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#374151] transition-colors"
                    >
                      <Icon size={13} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={form.short_description}
                  onChange={(e) => update('short_description', e.target.value)}
                  placeholder="Describe the magical moments of this journey..."
                  rows={7}
                  className="w-full rounded-b-xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#105fa3]/20 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Duration + Destination + Capacity row */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {/* Duration */}
            <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDE9FE]">
                  <Clock size={16} className="text-[#6D28D9]" />
                </div>
                <h2
                  className="text-base font-bold text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                >
                  Duration
                </h2>
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
                <h2
                  className="text-base font-bold text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                >
                  Destination
                </h2>
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
                <h2
                  className="text-base font-bold text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                >
                  Capacity
                </h2>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] mb-3">
                Max Guests per Departure
              </p>
              <Counter value={form.max_guests} onChange={(v) => update('max_guests', v)} min={1} />
              <p className="mt-3 text-xs text-[#9CA3AF]">
                Controls seats available per tour date. Guests beyond this limit are waitlisted.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — sidebar */}
        <div className="flex flex-col gap-4">
          {/* Category */}
          <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7]">
                <Tag size={16} className="text-[#92400E]" />
              </div>
              <h2
                className="text-base font-bold text-[#1A1A2E]"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                Category
              </h2>
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
                      selected ? 'bg-[#FEF3C7]' : 'hover:bg-[#F9FAFB]',
                    )}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                      style={{ backgroundColor: bg }}
                    >
                      <Icon size={15} style={{ color }} />
                    </div>
                    <span
                      className={cn(
                        'flex-1 text-sm font-medium',
                        selected ? 'text-[#92400E]' : 'text-[#374151]',
                      )}
                    >
                      {label}
                    </span>
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0',
                        selected ? 'border-[#914c00] bg-[#914c00]' : 'border-[#D1D5DB]',
                      )}
                    >
                      {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Decorative preview */}
          <div
            className="relative rounded-2xl overflow-hidden min-h-[130px]"
            style={{
              background: 'linear-gradient(135deg, #2D5A27 0%, #4A7C59 30%, #8B7355 60%, #D4A017 100%)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="relative p-4 pt-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
                Preview Context
              </p>
              <p
                className="mt-1 text-sm font-bold text-white leading-tight"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                Visualizing your masterpiece in the concierge ecosystem.
              </p>
            </div>
          </div>

          {/* Next button */}
          <button
            type="button"
            onClick={onNext}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#105fa3] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            Next: Pricing & Itinerary
            <ChevronRight size={16} />
          </button>

          {/* Save draft */}
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isPending}
            className="w-full text-center text-sm font-medium text-[#105fa3] hover:underline disabled:opacity-60 transition-colors"
          >
            Save Draft for Later
          </button>
        </div>
      </div>
    </div>
  )
}
