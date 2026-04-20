'use client'

import {
  TicketCheck, Banknote, ClipboardList, Briefcase,
  ChevronRight, AlertTriangle, Megaphone, MessageSquare,
  Download, Calendar, Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stats {
  totalBookings: number
  totalRevenue: number
  pendingVisas: number
  activeTours: number
}

interface RecentBooking {
  id: string
  clientName: string
  bookingRef: string
  serviceType: string
  destination: string
  status: string
  amount: number
}

interface Props {
  stats: Stats
  recentBookings: RecentBooking[]
}

function formatNaira(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n.toLocaleString()}`
}

function bookingRef(id: string) {
  const num = id.replace(/\D/g, '').slice(0, 4) || '0000'
  return `#BK-${num}`
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const AVATAR_COLORS = [
  '#105fa3', '#914c00', '#6D28D9', '#065F46', '#9D174D', '#1D4ED8', '#B45309',
]
function avatarColor(id: string) {
  let hash = 0
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffff
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// Mini sparkline bar chart
const SPARK_PRESETS: Record<string, { heights: number[]; color: string }> = {
  bookings: { heights: [30, 45, 35, 55, 50, 70, 80, 90], color: '#93C5FD' },
  revenue:  { heights: [40, 35, 55, 50, 65, 60, 80, 100], color: '#D4A017' },
  visas:    { heights: [50, 60, 45, 70, 60, 75, 70, 85], color: '#C4B5FD' },
  tours:    { heights: [65, 55, 65, 70, 60, 70, 72, 75], color: '#9CA3AF' },
}

function MiniChart({ preset }: { preset: keyof typeof SPARK_PRESETS }) {
  const { heights, color } = SPARK_PRESETS[preset]
  return (
    <div className="flex items-end gap-[3px] h-10">
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-full"
          style={{ height: `${h}%`, backgroundColor: color, opacity: 0.35 + (i / (heights.length - 1)) * 0.65 }}
        />
      ))}
    </div>
  )
}

interface KpiCardProps {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
  value: string
  badge: string
  badgeCls: string
  preset: keyof typeof SPARK_PRESETS
}

function KpiCard({ icon: Icon, iconBg, iconColor, label, value, badge, badgeCls, preset }: KpiCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', badgeCls)}>
          {badge}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">{label}</p>
        <p
          className="mt-1 text-2xl font-bold text-[#1A1A2E]"
          style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
        >
          {value}
        </p>
      </div>
      <MiniChart preset={preset} />
    </div>
  )
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-[#D1FAE5] text-[#065F46]',
  pending:   'bg-[#FEF3C7] text-[#92400E]',
  failed:    'bg-[#FEE2E2] text-[#991B1B]',
  cancelled: 'bg-[#FEE2E2] text-[#991B1B]',
  paid:      'bg-[#D1FAE5] text-[#065F46]',
}

const ACTION_ITEMS = [
  {
    icon: AlertTriangle,
    iconBg: '#FEF3C7',
    iconColor: '#92400E',
    title: 'Approve 14 Visa Applications',
    sub: 'Dubai group travel deadline: Tomorrow',
  },
  {
    icon: Megaphone,
    iconBg: '#DBEAFE',
    iconColor: '#1D4ED8',
    title: 'Update Holiday Rates',
    sub: 'Summer 2024 packages need review',
  },
  {
    icon: MessageSquare,
    iconBg: '#EDE9FE',
    iconColor: '#6D28D9',
    title: 'Client Dispute #9901',
    sub: 'Refund request for cancelled flight',
  },
]

export default function SuperAdminDashboard({ stats, recentBookings }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-[#1A1A2E]"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Welcome back, here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
            <Calendar size={14} />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-[#105fa3] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
            <Download size={14} />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard
          icon={TicketCheck}
          iconBg="#DBEAFE"
          iconColor="#1D4ED8"
          label="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          badge="+12.5%"
          badgeCls="bg-[#D1FAE5] text-[#065F46]"
          preset="bookings"
        />
        <KpiCard
          icon={Banknote}
          iconBg="#FEF3C7"
          iconColor="#92400E"
          label="Revenue (NGN)"
          value={formatNaira(stats.totalRevenue)}
          badge="+8.2%"
          badgeCls="bg-[#D1FAE5] text-[#065F46]"
          preset="revenue"
        />
        <KpiCard
          icon={ClipboardList}
          iconBg="#EDE9FE"
          iconColor="#6D28D9"
          label="Pending Visas"
          value={stats.pendingVisas.toLocaleString()}
          badge="24 Critical"
          badgeCls="bg-[#FEE2E2] text-[#991B1B]"
          preset="visas"
        />
        <KpiCard
          icon={Briefcase}
          iconBg="#F3F4F6"
          iconColor="#374151"
          label="Active Tours"
          value={stats.activeTours.toLocaleString()}
          badge="On Schedule"
          badgeCls="bg-[#E5E7EB] text-[#374151]"
          preset="tours"
        />
      </div>

      {/* Body: Recent Bookings + Action Required */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        {/* Recent Bookings */}
        <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4">
            <h2
              className="text-base font-bold text-[#1A1A2E]"
              style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
            >
              Recent Bookings
            </h2>
            <button className="text-sm font-medium text-[#105fa3] hover:underline">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-[#F9FAFB]">
                  {['Client', 'Service', 'Destination', 'Status', 'Amount'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#9CA3AF]">
                      No bookings yet
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => {
                    const statusKey = b.status.toLowerCase()
                    return (
                      <tr key={b.id} className="border-t border-[#F9FAFB] hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                              style={{ backgroundColor: avatarColor(b.id) }}
                            >
                              {initials(b.clientName)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#1A1A2E]">{b.clientName}</p>
                              <p className="text-[11px] text-[#9CA3AF]">{b.bookingRef || bookingRef(b.id)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-[#4B5563]">{b.serviceType}</td>
                        <td className="px-6 py-3.5 text-sm text-[#4B5563]">{b.destination}</td>
                        <td className="px-6 py-3.5">
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                              STATUS_STYLES[statusKey] ?? 'bg-[#F3F4F6] text-[#374151]',
                            )}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-sm font-medium text-[#1A1A2E]">
                          {formatNaira(b.amount)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Action Required */}
          <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F9FAFB]">
              <h2
                className="text-base font-bold text-[#1A1A2E]"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                Action Required
              </h2>
            </div>
            <div className="divide-y divide-[#F9FAFB]">
              {ACTION_ITEMS.map(({ icon: Icon, iconBg, iconColor, title, sub }) => (
                <button
                  key={title}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA]"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: iconBg }}
                  >
                    <Icon size={15} style={{ color: iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A2E] leading-tight">{title}</p>
                    <p className="mt-0.5 text-xs text-[#9CA3AF] leading-tight">{sub}</p>
                  </div>
                  <ChevronRight size={15} className="shrink-0 text-[#D1D5DB]" />
                </button>
              ))}
            </div>
          </div>

          {/* Featured Tour card */}
          <div className="relative rounded-2xl overflow-hidden min-h-[200px] bg-[#1A1A2E]">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            {/* Background texture (CSS gradient as image fallback) */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #2D5A27 0%, #4A7C59 30%, #8B7355 60%, #D4A017 100%)',
              }}
            />
            {/* Badge + Add */}
            <div className="relative flex items-center justify-between px-4 pt-4">
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                Featured Tour
              </span>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4A017] text-white shadow-md transition-opacity hover:opacity-90">
                <Plus size={14} />
              </button>
            </div>
            {/* Content */}
            <div className="relative px-4 pt-8 pb-4">
              <h3
                className="text-lg font-bold text-white leading-tight"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                Yankari Reserve<br />Exclusive Expedition
              </h3>
              <p className="mt-1 text-xs text-white/70">12 Bookings · Next departure: Sept 12</p>
              <button className="mt-3 w-full rounded-xl bg-white/15 backdrop-blur-sm py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/25">
                Manage Tour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
