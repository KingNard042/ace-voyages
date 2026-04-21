'use client'

import { useState } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, Trash2,
  CreditCard, MapPinned, Check, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FormState, FormUpdater, ItineraryDay } from './types'

interface Props {
  form: FormState
  update: FormUpdater
  step: number
  onNext: () => void
  onBack: () => void
  onSaveDraft: () => void
  isPending: boolean
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors duration-200',
        checked ? 'bg-[#105fa3]' : 'bg-[#D1D5DB]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  )
}

function NairaInput({
  label,
  value,
  onChange,
  hint,
  placeholder = '0',
}: {
  label: string
  value: number | null
  onChange: (v: number | null) => void
  hint?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#374151] mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-xl bg-[#F3F4F6] px-4 py-3">
        <span className="text-sm font-bold text-[#9CA3AF]">₦</span>
        <input
          type="number"
          min={0}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-base font-bold text-[#1A1A2E] outline-none placeholder-[#9CA3AF]"
        />
      </div>
      {hint && <p className="mt-1.5 text-xs text-[#9CA3AF]">{hint}</p>}
    </div>
  )
}

function StepBar({ step }: { step: number }) {
  const steps = [
    { n: 1, label: 'Basic Info' },
    { n: 2, label: 'Pricing & Itinerary' },
    { n: 3, label: 'Media & SEO' },
  ]
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => {
        const done   = step > s.n
        const active = step === s.n
        return (
          <div key={s.n} className="flex items-center gap-3 flex-1 last:flex-none">
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                  done   ? 'bg-[#105fa3] text-white' :
                  active ? 'bg-[#105fa3] text-white ring-4 ring-[#105fa3]/15' :
                           'bg-[#F3F4F6] text-[#9CA3AF]',
                )}
              >
                {done ? <Check size={14} /> : s.n}
              </div>
              <span
                className={cn(
                  'text-sm font-medium whitespace-nowrap',
                  active ? 'text-[#1A1A2E] font-semibold' : 'text-[#9CA3AF]',
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('flex-1 h-px mx-3', done ? 'bg-[#105fa3]' : 'bg-[#E5E7EB]')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Step2Pricing({ form, update, step, onNext, onBack, onSaveDraft, isPending }: Props) {
  const [newActivity, setNewActivity] = useState<Record<string, string>>({})

  function addDay() {
    const day: ItineraryDay = {
      id: Math.random().toString(36).slice(2),
      title: '',
      location: '',
      description: '',
      activities: [],
    }
    update('itinerary', [...form.itinerary, day])
  }

  function removeDay(id: string) {
    update('itinerary', form.itinerary.filter((d) => d.id !== id))
  }

  function updateDay(id: string, changes: Partial<Omit<ItineraryDay, 'id'>>) {
    update(
      'itinerary',
      form.itinerary.map((d) => (d.id === id ? { ...d, ...changes } : d)),
    )
  }

  function addActivity(dayId: string) {
    const text = (newActivity[dayId] ?? '').trim().toUpperCase()
    if (!text) return
    const day = form.itinerary.find((d) => d.id === dayId)
    if (!day || day.activities.includes(text)) return
    updateDay(dayId, { activities: [...day.activities, text] })
    setNewActivity((prev) => ({ ...prev, [dayId]: '' }))
  }

  function removeActivity(dayId: string, index: number) {
    const day = form.itinerary.find((d) => d.id === dayId)
    if (!day) return
    updateDay(dayId, { activities: day.activities.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">Step 2 of 3</p>
        <h1
          className="mt-1 text-3xl font-bold text-[#1A1A2E]"
          style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
        >
          Pricing &amp; Detailed Itinerary
        </h1>
      </div>

      <StepBar step={step} />

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ── Pricing Setup ── */}
        <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7]">
              <CreditCard size={16} className="text-[#92400E]" />
            </div>
            <h2
              className="text-base font-bold text-[#1A1A2E]"
              style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
            >
              Pricing Setup
            </h2>
          </div>

          <NairaInput
            label="Base Price (NGN)"
            value={form.price_naira || null}
            onChange={(v) => update('price_naira', v ?? 0)}
            hint="Standard retail price per person before any discounts."
          />

          <NairaInput
            label="Discounted Price (NGN)"
            value={form.discounted_price}
            onChange={(v) => update('discounted_price', v)}
            hint="Optional. If set, this will be the active price displayed."
          />

          <div className="space-y-3 pt-1 border-t border-[#F9FAFB]">
            <div className="flex items-center justify-between pt-3">
              <span className="text-sm font-medium text-[#374151]">Include VAT (7.5%)</span>
              <Toggle checked={form.include_vat} onChange={(v) => update('include_vat', v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#374151]">Early Bird Promo</span>
              <Toggle checked={form.early_bird} onChange={(v) => update('early_bird', v)} />
            </div>
          </div>

          {/* Pricing tip */}
          <div className="relative rounded-2xl bg-[#FEF9EC] p-4 overflow-hidden">
            <div className="absolute -right-3 -bottom-3 h-16 w-16 rounded-full bg-[#914c00]/10" />
            <p className="text-sm font-bold text-[#92400E]">Pricing Tip</p>
            <p className="mt-1 text-xs text-[#92400E]/80 leading-relaxed">
              Adding a &quot;Discounted Price&quot; increases conversion by up to 34% for luxury tours
              in the Lagos market.
            </p>
          </div>
        </div>

        {/* ── Itinerary Builder ── */}
        <div className="rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDE9FE]">
                <MapPinned size={16} className="text-[#6D28D9]" />
              </div>
              <h2
                className="text-base font-bold text-[#1A1A2E]"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                Itinerary Builder
              </h2>
            </div>
            <button
              type="button"
              onClick={addDay}
              className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              <Plus size={12} />
              Add Day
            </button>
          </div>

          {form.itinerary.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3">
                <MapPinned size={20} className="text-[#9CA3AF]" />
              </div>
              <p className="text-sm text-[#9CA3AF]">
                Click &quot;+ Add Day&quot; to start building your itinerary
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {form.itinerary.map((day, idx) => (
                <div key={day.id} className="flex gap-3">
                  {/* Day number + connector */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="h-8 w-8 rounded-full bg-[#105fa3] flex items-center justify-center text-[11px] font-bold text-white">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    {idx < form.itinerary.length - 1 && (
                      <div className="flex-1 w-px bg-[#E5E7EB] my-1.5" />
                    )}
                  </div>

                  {/* Day card */}
                  <div className="flex-1 rounded-xl bg-[#F9FAFB] p-4 space-y-3 mb-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => updateDay(day.id, { title: e.target.value })}
                          placeholder="Day title (e.g. Arrival & Sunset Reception)"
                          className="w-full bg-transparent text-sm font-bold text-[#1A1A2E] outline-none placeholder-[#9CA3AF]"
                        />
                        <input
                          type="text"
                          value={day.location}
                          onChange={(e) => updateDay(day.id, { location: e.target.value })}
                          placeholder="Location"
                          className="w-full bg-transparent text-xs font-medium text-[#105fa3] outline-none placeholder-[#9CA3AF]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDay(day.id)}
                        className="text-[#9CA3AF] hover:text-[#EF4444] transition-colors mt-0.5 shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <textarea
                      value={day.description}
                      onChange={(e) => updateDay(day.id, { description: e.target.value })}
                      placeholder="Describe the day's activities and highlights..."
                      rows={3}
                      className="w-full rounded-lg bg-white px-3 py-2.5 text-xs text-[#374151] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#105fa3]/20 transition-all resize-none"
                    />

                    {/* Activity chips */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {day.activities.map((act, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#92400E]"
                        >
                          {act}
                          <button
                            type="button"
                            onClick={() => removeActivity(day.id, i)}
                            className="hover:text-[#EF4444] transition-colors"
                          >
                            <X size={9} />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={newActivity[day.id] ?? ''}
                        onChange={(e) =>
                          setNewActivity((prev) => ({ ...prev, [day.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addActivity(day.id)
                          }
                        }}
                        placeholder="Add activity…"
                        className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-[10px] text-[#374151] outline-none w-28 placeholder-[#9CA3AF]"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Ghost "next day" row */}
              <div className="flex gap-3">
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={addDay}
                    className="h-8 w-8 rounded-full border-2 border-dashed border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] hover:border-[#105fa3] hover:text-[#105fa3] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-[#9CA3AF]">
                    Define Day {form.itinerary.length + 1} Activities
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
        >
          <ChevronLeft size={15} />
          Back to Basic Info
        </button>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isPending}
            className="text-sm font-medium text-[#105fa3] hover:underline disabled:opacity-60 transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-[#105fa3] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            Next: Media &amp; SEO
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
