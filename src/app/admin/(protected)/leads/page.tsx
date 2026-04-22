import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin/auth'
import { canAccess } from '@/lib/admin/access'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Users, Clock, Phone, Mail, MapPin, MessageSquare } from 'lucide-react'
import LeadsStatusCards from './LeadsStatusCards'
import LeadStatusDropdown from '@/components/admin/LeadStatusDropdown'

interface Lead {
  lead_id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string
  customer_whatsapp: string | null
  service_interest: string | null
  destination_interest: string | null
  message: string | null
  source_page: string | null
  lead_status: string
  assigned_to: string | null
  created_at: string
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  new:       { bg: '#DBEAFE', text: '#1D4ED8',  label: 'New' },
  contacted: { bg: '#FEF3C7', text: '#92400E',  label: 'Contacted' },
  converted: { bg: '#D1FAE5', text: '#065F46',  label: 'Converted' },
  cold:      { bg: '#F3F4F6', text: '#6B7280',  label: 'Cold' },
}

const VALID_STATUSES = new Set(['new', 'contacted', 'converted', 'cold'])

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const metadata = { title: 'Leads — ACE Voyages Admin' }

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!canAccess(session.role, 'leads')) redirect('/admin/dashboard')

  const { status: rawStatus } = await searchParams
  const activeStatus = rawStatus && VALID_STATUSES.has(rawStatus) ? rawStatus : null

  const supabase = createServerSupabaseClient()

  // Always fetch full list for counts (light query — just status field)
  const { data: allLeads } = await supabase
    .from('leads')
    .select('lead_id, lead_status')

  const allRows = (allLeads ?? []) as { lead_id: string; lead_status: string }[]
  const total = allRows.length
  const counts: Record<string, number> = {
    new:       allRows.filter((l) => l.lead_status === 'new').length,
    contacted: allRows.filter((l) => l.lead_status === 'contacted').length,
    converted: allRows.filter((l) => l.lead_status === 'converted').length,
    cold:      allRows.filter((l) => l.lead_status === 'cold').length,
  }

  // Filtered query for the table
  let tableQuery = supabase
    .from('leads')
    .select(
      'lead_id, customer_name, customer_email, customer_phone, customer_whatsapp, service_interest, destination_interest, message, source_page, lead_status, assigned_to, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(100)

  if (activeStatus) {
    tableQuery = tableQuery.eq('lead_status', activeStatus)
  }

  const { data: leads, error } = await tableQuery
  if (error) console.error('[leads page]', error.message)

  const rows = (leads ?? []) as Lead[]
  const newCount = counts.new

  const filterLabel = activeStatus
    ? STATUS_STYLES[activeStatus]?.label
    : 'All'

  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-[#1A1A2E]"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            Leads
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Customer booking enquiries captured from the website.
            {activeStatus && (
              <span className="ml-1 font-medium text-[#1B3A6B]">
                Filtered: {filterLabel}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {newCount > 0 && (
            <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-sm font-semibold text-[#1D4ED8]">
              {newCount} new
            </span>
          )}
          <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-sm font-medium text-[#6B7280]">
            {total} total
          </span>
        </div>
      </div>

      {/* ── Status cards (client — needs Suspense for useSearchParams) ── */}
      <Suspense fallback={<StatusCardsSkeleton />}>
        <LeadsStatusCards counts={counts} total={total} />
      </Suspense>

      {/* ── Table ───────────────────────────────────────── */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F4F6]">
            <Users size={24} className="text-[#9CA3AF]" />
          </div>
          <p className="font-semibold text-[#1A1A2E]">
            {activeStatus ? `No ${filterLabel.toLowerCase()} leads` : 'No leads yet'}
          </p>
          <p className="mt-1 text-sm text-[#6B7280]">
            {activeStatus
              ? 'Try selecting a different status filter above.'
              : 'Leads will appear here once customers submit a booking request.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          {/* Table header row */}
          <div className="flex items-center justify-between border-b border-[#F3F4F6] px-5 py-3.5">
            <p className="text-sm font-semibold text-[#1A1A2E]">
              {rows.length} {filterLabel === 'All' ? '' : filterLabel + ' '}lead{rows.length === 1 ? '' : 's'}
            </p>
            {activeStatus && (
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: STATUS_STYLES[activeStatus]?.bg,
                  color: STATUS_STYLES[activeStatus]?.text,
                }}
              >
                {filterLabel}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F3F4F6]">
                  {['Customer', 'Contact', 'Interest', 'Source', 'Status', 'Date'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {rows.map((lead) => {
                  const canEdit =
                    session.role !== 'agent_admin' ||
                    lead.assigned_to === session.userId
                  return (
                    <tr
                      key={lead.lead_id}
                      className="transition-colors hover:bg-[#F8F9FA]"
                    >
                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#1A1A2E]">
                          {lead.customer_name}
                        </p>
                        {lead.message && (
                          <p className="mt-0.5 line-clamp-1 flex items-center gap-1 text-xs text-[#9CA3AF]">
                            <MessageSquare size={10} />
                            {lead.message}
                          </p>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <a
                            href={`tel:${lead.customer_phone}`}
                            className="flex items-center gap-1 text-[#1B3A6B] hover:underline"
                          >
                            <Phone size={11} />
                            {lead.customer_phone}
                          </a>
                          {lead.customer_email && (
                            <a
                              href={`mailto:${lead.customer_email}`}
                              className="flex items-center gap-1 text-[#6B7280] hover:underline"
                            >
                              <Mail size={11} />
                              <span className="max-w-[140px] truncate">
                                {lead.customer_email}
                              </span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Interest */}
                      <td className="px-5 py-4">
                        {lead.destination_interest && (
                          <span className="flex items-center gap-1 text-[#374151]">
                            <MapPin size={11} className="text-[#D4A017]" />
                            {lead.destination_interest}
                          </span>
                        )}
                        {lead.service_interest && (
                          <span className="mt-0.5 block text-xs capitalize text-[#9CA3AF]">
                            {lead.service_interest}
                          </span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="px-5 py-4 text-xs text-[#9CA3AF]">
                        {lead.source_page ?? '—'}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <LeadStatusDropdown
                          leadId={lead.lead_id}
                          currentStatus={lead.lead_status}
                          canEdit={canEdit}
                        />
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-[#9CA3AF]">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatDate(lead.created_at)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[108px] animate-pulse rounded-2xl bg-[#F3F4F6]"
        />
      ))}
    </div>
  )
}
