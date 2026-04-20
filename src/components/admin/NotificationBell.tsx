'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, UserPlus, CreditCard } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAdminContext } from './AdminContext'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'new_lead' | 'booking_paid'
  message: string
  time: Date
  read: boolean
}

export default function NotificationBell() {
  const { user } = useAdminContext()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const panelRef = useRef<HTMLDivElement>(null)

  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const isAgent = user.role === 'agent_admin'

    // Subscribe to new leads
    const leadsChannel = supabase
      .channel('admin-leads')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
          ...(isAgent ? { filter: `assigned_to=eq.${user.userId}` } : {}),
        },
        (payload) => {
          const rec = payload.new as Record<string, string>
          setNotifications((prev) => [
            {
              id: crypto.randomUUID(),
              type: 'new_lead',
              message: `New lead: ${rec.full_name ?? 'Someone'} (${rec.service_type ?? 'General'})`,
              time: new Date(),
              read: false,
            },
            ...prev.slice(0, 19),
          ])
        }
      )
      .subscribe()

    // Subscribe to booking payments
    const bookingsChannel = supabase
      .channel('admin-bookings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: 'payment_status=eq.paid',
        },
        (payload) => {
          const rec = payload.new as Record<string, string>
          setNotifications((prev) => [
            {
              id: crypto.randomUUID(),
              type: 'booking_paid',
              message: `Payment confirmed: Booking #${rec.id?.slice(0, 8) ?? '---'}`,
              time: new Date(),
              read: false,
            },
            ...prev.slice(0, 19),
          ])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(leadsChannel)
      supabase.removeChannel(bookingsChannel)
    }
  }, [user.userId, user.role])

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#1A1A2E]"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl bg-white shadow-[0_16px_48px_rgba(0,0,0,0.15)]">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3">
            <span className="text-sm font-semibold text-[#1A1A2E]">Notifications</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[#1B3A6B] hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-[#6B7280] hover:text-[#1A1A2E]">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#6B7280]">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 border-b border-[#F9FAFB] px-4 py-3 last:border-0',
                    !n.read && 'bg-[#EEF3F9]'
                  )}
                >
                  <div className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                    n.type === 'new_lead' ? 'bg-[#EEF3F9] text-[#1B3A6B]' : 'bg-green-50 text-green-600'
                  )}>
                    {n.type === 'new_lead' ? <UserPlus size={13} /> : <CreditCard size={13} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed text-[#1A1A2E]">{n.message}</p>
                    <p className="mt-0.5 text-[10px] text-[#9CA3AF]">{formatTime(n.time)}</p>
                  </div>
                  {!n.read && (
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1B3A6B]" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
