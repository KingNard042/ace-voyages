'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

interface SessionGuardProps {
  timeoutMs?: number
  children: React.ReactNode
}

export default function SessionGuard({ timeoutMs = DEFAULT_TIMEOUT_MS, children }: SessionGuardProps) {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.replace('/admin/login?reason=timeout')
  }, [router])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(signOut, timeoutMs)
  }, [signOut, timeoutMs])

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [resetTimer])

  return <>{children}</>
}
