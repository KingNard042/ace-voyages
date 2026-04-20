'use client'

import Link from 'next/link'
import { Users, AlertCircle, Calendar, Clock } from 'lucide-react'

interface Stats {
  myLeads: number
  myOpenLeads: number
  myBookings: number
}

interface LeadRow {
  id: string
  full_name: string
  service_type: string | null
  status: string
  created_at: string
}

interface Props {
  agentName: string
  stats: Stats
  recentLeads: LeadRow[]
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  booked: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-[#6B7280]">{label}</p>
          <p
            className="mt-2 text-2xl font-bold text-[#1A1A2E]"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-[#6B7280]">{sub}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F9]">
          <Icon size={18} className="text-[#1B3A6B]" />
        </div>
      </div>
    </div>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function AgentDashboard({ agentName, stats, recentLeads }: Props) {
  const firstName = agentName.split(' ')[0]

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-[#1A1A2E]"
          style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
        >
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">Here&apos;s your personal pipeline summary.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="My Leads" value={stats.myLeads.toLocaleString()} />
        <StatCard
          icon={AlertCircle}
          label="Open Leads"
          value={stats.myOpenLeads.toLocaleString()}
          sub="Needs follow-up"
        />
        <StatCard icon={Calendar} label="My Bookings" value={stats.myBookings.toLocaleString()} />
      </div>

      {/* Recent leads */}
      <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between border-b border-[#F3F4F6] px-6 py-4">
          <h2 className="text-sm font-semibold text-[#1A1A2E]">Recent Leads</h2>
          <Link
            href="/admin/leads"
            className="text-xs font-medium text-[#1B3A6B] hover:underline"
          >
            View all
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-[#6B7280]">No leads assigned yet.</p>
        ) : (
          <div className="divide-y divide-[#F9FAFB]">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF3F9] text-xs font-bold text-[#1B3A6B]">
                    {lead.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1A1A2E]">{lead.full_name}</p>
                    <p className="text-xs text-[#6B7280] capitalize">
                      {lead.service_type?.replace(/_/g, ' ') ?? 'General'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`hidden rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize sm:inline-flex ${
                      STATUS_STYLES[lead.status] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {lead.status}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                    <Clock size={11} />
                    {timeAgo(lead.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
