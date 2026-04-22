'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Loader2, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'

// Dot colors are solid so they read well at small sizes against the neutral trigger bg
const STATUSES = [
  { key: 'new',       label: 'New',       dot: '#1D4ED8', activeBg: '#EFF6FF', activeText: '#1D4ED8' },
  { key: 'contacted', label: 'Contacted', dot: '#D97706', activeBg: '#FFFBEB', activeText: '#B45309' },
  { key: 'converted', label: 'Converted', dot: '#10B981', activeBg: '#F0FDF4', activeText: '#065F46' },
  { key: 'cold',      label: 'Cold',      dot: '#9CA3AF', activeBg: '#F9FAFB', activeText: '#374151' },
] as const

type StatusKey = (typeof STATUSES)[number]['key']

interface PanelRect {
  top: number
  left: number
  minWidth: number
}

interface Props {
  leadId: string
  currentStatus: string
  canEdit: boolean
}

// Approximate panel height: 4 options × 36px + 12px padding
const PANEL_HEIGHT = 156

export default function LeadStatusDropdown({ leadId, currentStatus, canEdit }: Props) {
  const [localStatus, setLocalStatus] = useState(currentStatus)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [panelRect, setPanelRect] = useState<PanelRect>({ top: 0, left: 0, minWidth: 168 })
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  const current = STATUSES.find((s) => s.key === localStatus) ?? STATUSES[0]

  // Only render portals after client hydration
  useEffect(() => { setMounted(true) }, [])

  const openPanel = useCallback(() => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()

    // Flip upward if not enough space below
    const spaceBelow = window.innerHeight - r.bottom
    const top = spaceBelow >= PANEL_HEIGHT + 8
      ? r.bottom + 6
      : r.top - PANEL_HEIGHT - 6

    // Prevent panel from running off the right edge
    const minWidth = Math.max(r.width, 168)
    const left = Math.min(r.left, window.innerWidth - minWidth - 16)

    setPanelRect({ top, left, minWidth })
    setIsOpen(true)
  }, [])

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return
    function onMouseDown(e: MouseEvent) {
      if (!triggerRef.current?.contains(e.target as Node)) setIsOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  async function handleSelect(newStatus: StatusKey) {
    setIsOpen(false)
    if (newStatus === localStatus || isPending) return

    const prev = localStatus
    setLocalStatus(newStatus)
    setIsPending(true)

    try {
      const res = await fetch(`/api/admin/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? 'Failed to update status.')
      }
      toast('Lead status updated.', 'success')
      router.refresh()
    } catch (err) {
      setLocalStatus(prev)
      toast(err instanceof Error ? err.message : 'Failed to update status.', 'error')
    } finally {
      setIsPending(false)
    }
  }

  // Read-only badge — same visual language as the trigger but non-interactive
  if (!canEdit) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3F4F6] px-2.5 py-1.5 text-xs font-medium text-[#374151]"
        style={{ fontFamily: 'var(--font-inter, Inter, sans-serif)' }}
      >
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: current.dot }}
        />
        {current.label}
      </span>
    )
  }

  return (
    <>
      {/* ── Trigger button ─────────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        onClick={openPanel}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          // Base shape & spacing
          'inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5',
          // Typography — Inter, matches surrounding table text-xs
          'text-xs font-medium text-[#374151]',
          // Tonal surface — ghost border at ~10% opacity (DESIGN.md "No-Line" rule)
          'bg-[#F3F4F6] ring-1 ring-inset ring-[#1B3A6B]/10',
          // Hover — one shade darker surface, slightly stronger ghost border
          'hover:bg-[#E8EAED] hover:ring-[#1B3A6B]/20',
          // Open state — primary ghost border signals affordance
          isOpen && 'bg-[#E8EAED] ring-[#105fa3]/30',
          // Focus — accessible primary ring
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#105fa3]/30',
          // Transitions
          'transition-all duration-150',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        style={{ fontFamily: 'var(--font-inter, Inter, sans-serif)' }}
      >
        {isPending ? (
          <Loader2 size={11} className="animate-spin text-[#105fa3]" />
        ) : (
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: current.dot }}
          />
        )}

        <span>{current.label}</span>

        <ChevronDown
          size={11}
          aria-hidden
          className={cn(
            'text-[#9CA3AF] transition-transform duration-150',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {/* ── Portal panel — escapes table overflow clipping ─────────────── */}
      {mounted && isOpen && createPortal(
        <div
          role="listbox"
          aria-label="Lead status"
          className="fixed z-[300] overflow-hidden rounded-xl bg-white py-1.5"
          style={{
            top: panelRect.top,
            left: panelRect.left,
            minWidth: panelRect.minWidth,
            // Ambient diffused shadow per DESIGN.md "Elevation & Depth"
            boxShadow:
              '0 12px 40px rgba(26,28,28,0.10), 0 4px 12px rgba(26,28,28,0.06)',
            // Ghost border at 8% opacity — visible but not harsh
            outline: '1px solid rgba(27,58,107,0.08)',
          }}
        >
          {STATUSES.map((s) => {
            const isSelected = s.key === localStatus
            return (
              <button
                key={s.key}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(s.key)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs',
                  'transition-colors duration-100',
                  isSelected
                    ? 'font-semibold'
                    : 'font-medium text-[#374151] hover:bg-[#F3F4F6]',
                )}
                style={{
                  fontFamily: 'var(--font-inter, Inter, sans-serif)',
                  ...(isSelected
                    ? { backgroundColor: s.activeBg, color: s.activeText }
                    : {}),
                }}
              >
                {/* Status colour dot */}
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: s.dot }}
                />

                <span className="flex-1">{s.label}</span>

                {/* Checkmark for current selection */}
                {isSelected && (
                  <Check size={12} className="shrink-0 text-[#105fa3]" aria-hidden />
                )}
              </button>
            )
          })}
        </div>,
        document.body,
      )}
    </>
  )
}
