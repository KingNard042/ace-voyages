'use client'

import { Users, AlertCircle, Calendar, UserCheck } from 'lucide-react'

interface Stats {
  totalLeads: number
  openLeads: number
  bookingsThisMonth: number
  agentCount: number
}

interface AgentRow {
  id: string
  full_name: string
  role: string
  openLeads: number
}

interface Props {
  stats: Stats
  agents: AgentRow[]
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

export default function ManagerDashboard({ stats, agents }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-[#1A1A2E]"
          style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
        >
          Team Overview
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">Monitor your team&apos;s pipeline and performance.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Leads" value={stats.totalLeads.toLocaleString()} />
        <StatCard icon={AlertCircle} label="Open Leads" value={stats.openLeads.toLocaleString()} sub="Active pipeline" />
        <StatCard icon={Calendar} label="Bookings This Month" value={stats.bookingsThisMonth.toLocaleString()} />
        <StatCard icon={UserCheck} label="Active Agents" value={stats.agentCount} />
      </div>

      {/* Agent table */}
      <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <div className="border-b border-[#F3F4F6] px-6 py-4">
          <h2 className="text-sm font-semibold text-[#1A1A2E]">Agent Pipeline</h2>
        </div>
        {agents.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-[#6B7280]">No agents found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F3F4F6]">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    Open Leads
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9FAFB]">
                {agents
                  .sort((a, b) => b.openLeads - a.openLeads)
                  .map((agent) => (
                    <tr key={agent.id} className="hover:bg-[#F9FAFB]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B3A6B] text-xs font-bold text-white">
                            {agent.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-[#1A1A2E]">{agent.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#6B7280] capitalize">
                        {agent.role.replace('_admin', '').replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            agent.openLeads > 10
                              ? 'bg-red-100 text-red-700'
                              : agent.openLeads > 5
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {agent.openLeads}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
