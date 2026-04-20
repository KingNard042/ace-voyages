import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import SuperAdminDashboard from './SuperAdminDashboard'
import ManagerDashboard from './ManagerDashboard'
import AgentDashboard from './AgentDashboard'

export const metadata = { title: 'Dashboard — ACE Voyages Admin' }

export default async function DashboardPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const supabase = createServerSupabaseClient()

  if (session.role === 'super_admin') {
    // Fetch all KPI data
    const [
      { count: totalLeads },
      { count: newLeadsToday },
      { count: totalBookings },
      { data: revenueData },
      { data: agentStats },
      { count: pendingLeads },
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings')
        .select('created_at, total_amount_ngn')
        .eq('payment_status', 'paid')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true }),
      supabase.from('admin_users')
        .select('id, full_name, role')
        .eq('is_active', true),
      supabase.from('leads').select('*', { count: 'exact', head: true })
        .eq('status', 'new'),
    ])

    const totalRevenue = revenueData?.reduce((sum, b) => sum + (b.total_amount_ngn ?? 0), 0) ?? 0

    // Group revenue by day for chart
    const revenueByDay = groupRevenueByDay(revenueData ?? [])

    return (
      <SuperAdminDashboard
        stats={{
          totalLeads: totalLeads ?? 0,
          newLeadsToday: newLeadsToday ?? 0,
          totalBookings: totalBookings ?? 0,
          totalRevenue,
          pendingLeads: pendingLeads ?? 0,
          teamSize: agentStats?.length ?? 0,
        }}
        revenueChart={revenueByDay}
      />
    )
  }

  if (session.role === 'manager_admin') {
    const [
      { count: totalLeads },
      { count: openLeads },
      { data: agents },
      { count: bookingsThisMonth },
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true })
        .in('status', ['new', 'contacted', 'qualified']),
      supabase.from('admin_users')
        .select('id, full_name, role')
        .eq('role', 'agent_admin')
        .eq('is_active', true),
      supabase.from('bookings').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ])

    // Per-agent lead counts
    const agentLeadCounts = await Promise.all(
      (agents ?? []).map(async (agent) => {
        const { count } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', agent.id)
          .in('status', ['new', 'contacted', 'qualified'])
        return { ...agent, openLeads: count ?? 0 }
      })
    )

    return (
      <ManagerDashboard
        stats={{
          totalLeads: totalLeads ?? 0,
          openLeads: openLeads ?? 0,
          bookingsThisMonth: bookingsThisMonth ?? 0,
          agentCount: agents?.length ?? 0,
        }}
        agents={agentLeadCounts}
      />
    )
  }

  // agent_admin
  const [
    { count: myLeads },
    { count: myOpenLeads },
    { count: myBookings },
    { data: recentLeads },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true })
      .eq('assigned_to', session.userId),
    supabase.from('leads').select('*', { count: 'exact', head: true })
      .eq('assigned_to', session.userId)
      .in('status', ['new', 'contacted', 'qualified']),
    supabase.from('bookings').select('*', { count: 'exact', head: true })
      .eq('agent_id', session.userId),
    supabase.from('leads')
      .select('id, full_name, service_type, status, created_at')
      .eq('assigned_to', session.userId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <AgentDashboard
      agentName={session.name}
      stats={{
        myLeads: myLeads ?? 0,
        myOpenLeads: myOpenLeads ?? 0,
        myBookings: myBookings ?? 0,
      }}
      recentLeads={recentLeads ?? []}
    />
  )
}

function groupRevenueByDay(rows: Array<{ created_at: string; total_amount_ngn: number | null }>) {
  const map: Record<string, number> = {}
  rows.forEach((row) => {
    const day = row.created_at.slice(0, 10)
    map[day] = (map[day] ?? 0) + (row.total_amount_ngn ?? 0)
  })
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }))
}
