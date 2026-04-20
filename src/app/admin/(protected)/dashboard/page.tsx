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

  // ── Super Admin ────────────────────────────────────────────────────────────
  if (session.role === 'super_admin') {
    const [
      { count: totalBookings },
      { data: revenueData },
      { count: pendingLeads },
    ] = await Promise.all([
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase
        .from('bookings')
        .select('created_at, total_price')
        .eq('payment_status', 'paid')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('lead_status', 'new'),
    ])

    const totalRevenue = (revenueData ?? []).reduce(
      (sum: number, b: { total_price: number | null }) => sum + (b.total_price ?? 0),
      0,
    )

    const [toursResult, recentResult] = await Promise.allSettled([
      supabase.from('tours').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase
        .from('bookings')
        .select('booking_id, booking_reference, customer_name, tour_name, status, total_price')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const activeTours = toursResult.status === 'fulfilled' ? (toursResult.value.count ?? 0) : 0
    const rawBookings =
      recentResult.status === 'fulfilled' ? (recentResult.value.data ?? []) : []

    const recentBookings = rawBookings.map((b: Record<string, unknown>) => ({
      id: String(b.booking_id ?? ''),
      clientName: String(b.customer_name ?? 'Unknown'),
      bookingRef: b.booking_reference ? `#${String(b.booking_reference)}` : '',
      serviceType: String(b.tour_name ?? 'General'),
      destination: '—',
      status: String(b.status ?? 'pending'),
      amount: Number(b.total_price ?? 0),
    }))

    return (
      <SuperAdminDashboard
        stats={{ totalBookings: totalBookings ?? 0, totalRevenue, pendingVisas: pendingLeads ?? 0, activeTours }}
        recentBookings={recentBookings}
      />
    )
  }

  // ── Manager Admin ──────────────────────────────────────────────────────────
  if (session.role === 'manager_admin') {
    const [
      { count: totalLeads },
      { count: openLeads },
      { data: agents },
      { count: bookingsThisMonth },
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('lead_status', ['new', 'contacted']),
      supabase
        .from('admin_users')
        .select('id, full_name, role')
        .eq('role', 'agent_admin')
        .eq('is_active', true),
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte(
          'created_at',
          new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        ),
    ])

    const agentLeadCounts = await Promise.all(
      (agents ?? []).map(async (agent) => {
        const { count } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', agent.id)
          .in('lead_status', ['new', 'contacted'])
        return { ...agent, openLeads: count ?? 0 }
      }),
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

  // ── Agent Admin ────────────────────────────────────────────────────────────
  const [
    { count: myLeads },
    { count: myOpenLeads },
    { count: myBookings },
    { data: recentLeadsRaw },
  ] = await Promise.all([
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', session.userId),
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', session.userId)
      .in('lead_status', ['new', 'contacted']),
    // No agent FK in bookings — use converted leads as proxy for closed deals
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', session.userId)
      .eq('lead_status', 'converted'),
    supabase
      .from('leads')
      .select('lead_id, customer_name, service_interest, lead_status, created_at')
      .eq('assigned_to', session.userId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Map to the shape AgentDashboard expects
  const recentLeads = (recentLeadsRaw ?? []).map((l: Record<string, unknown>) => ({
    id: String(l.lead_id ?? ''),
    full_name: String(l.customer_name ?? 'Unknown'),
    service_type: l.service_interest ? String(l.service_interest) : null,
    status: String(l.lead_status ?? 'new'),
    created_at: String(l.created_at ?? ''),
  }))

  return (
    <AgentDashboard
      agentName={session.name}
      stats={{
        myLeads: myLeads ?? 0,
        myOpenLeads: myOpenLeads ?? 0,
        myBookings: myBookings ?? 0,
      }}
      recentLeads={recentLeads}
    />
  )
}
