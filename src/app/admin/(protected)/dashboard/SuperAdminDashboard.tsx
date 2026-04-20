'use client'

import { Users, Calendar, TrendingUp, AlertCircle, UserCheck, Banknote } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

interface Stats {
  totalLeads: number
  newLeadsToday: number
  totalBookings: number
  totalRevenue: number
  pendingLeads: number
  teamSize: number
}

interface RevenuePoint {
  date: string
  amount: number
}

interface Props {
  stats: Stats
  revenueChart: RevenuePoint[]
}

function formatNaira(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n.toLocaleString()}`
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  accent?: string
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
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: accent ?? '#EEF3F9' }}
        >
          <Icon size={18} className="text-[#1B3A6B]" />
        </div>
      </div>
    </div>
  )
}

function formatChartDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
}

export default function SuperAdminDashboard({ stats, revenueChart }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-[#1A1A2E]"
          style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">Welcome back — here&apos;s your business overview.</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={Users} label="Total Leads" value={stats.totalLeads.toLocaleString()} sub={`+${stats.newLeadsToday} today`} />
        <StatCard icon={AlertCircle} label="Pending Leads" value={stats.pendingLeads.toLocaleString()} sub="Awaiting contact" />
        <StatCard icon={Calendar} label="Total Bookings" value={stats.totalBookings.toLocaleString()} />
        <StatCard icon={Banknote} label="Revenue (30d)" value={formatNaira(stats.totalRevenue)} sub="Paid bookings" accent="#FEF3C7" />
        <StatCard icon={TrendingUp} label="Conversion" value={stats.totalLeads > 0 ? `${Math.round((stats.totalBookings / stats.totalLeads) * 100)}%` : '—'} sub="Leads → Bookings" />
        <StatCard icon={UserCheck} label="Team Size" value={stats.teamSize} sub="Active admins" />
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <h2 className="mb-5 text-sm font-semibold text-[#1A1A2E]">Revenue — Last 30 Days</h2>
        {revenueChart.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-[#6B7280]">
            No revenue data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueChart} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B3A6B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1B3A6B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartDate}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatNaira(v)}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                formatter={(value) => [formatNaira(Number(value ?? 0)), 'Revenue']}
                labelFormatter={(label) => formatChartDate(String(label ?? ''))}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#1B3A6B"
                strokeWidth={2}
                fill="url(#revGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
