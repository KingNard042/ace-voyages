'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import type { ToastVariant } from '@/lib/toast'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
  leaving: boolean
}

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    function onToast(e: Event) {
      const { id, message, variant } = (e as CustomEvent<ToastItem>).detail
      setToasts((prev) => [...prev, { id, message, variant, leaving: false }])

      setTimeout(() => {
        // Begin exit transition
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
        )
        // Remove after transition completes
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 350)
      }, 3500)
    }

    window.addEventListener('ace:toast', onToast)
    return () => window.removeEventListener('ace:toast', onToast)
  }, [])

  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-2.5">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300"
          style={{
            opacity: t.leaving ? 0 : 1,
            transform: t.leaving ? 'translateY(8px)' : 'translateY(0)',
            border: t.variant === 'success'
              ? '1px solid #D1FAE5'
              : '1px solid #FEE2E2',
          }}
        >
          {t.variant === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0 text-green-500" />
          ) : (
            <XCircle size={16} className="shrink-0 text-red-500" />
          )}

          <p className="text-sm font-medium text-[#1A1A2E]">{t.message}</p>

          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="ml-1 shrink-0 rounded-lg p-0.5 text-[#9CA3AF] transition-colors hover:text-[#374151]"
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
