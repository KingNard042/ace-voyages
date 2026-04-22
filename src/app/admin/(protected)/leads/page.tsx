import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin/auth'
import { canAccess } from '@/lib/admin/access'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Users, Clock, Phone, Mail, MapPin, MessageSquare } from 'lucide-react'

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
  created_at: string
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  new:       { bg: '#DBEAFE', text: '#1D4ED8', label: 'New' },
  contacted: { bg: '#FEF3C7', text: '#92400E', label: 'Contacted' },
  converted: { bg: '#D1FAE5', text: '#065F46', label: 'Converted' },
  cold:      { bg: '#F3F4F6', text: '#6B7280', label: 'Cold' },
}

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

export default async function LeadsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!canAccess(session.role, 'leads')) redirect('/admin/dashboard')

  const supabase = createServerSupabaseClient()
  const { data: leads, error } = await supabase
    .from('leads')
    .select(
      'lead_id, customer_name, customer_email, customer_phone, customer_whatsapp, service_interest, destination_interest, message, source_page, lead_status, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('[leads page]', error.message)
  }

  const rows = (leads ?? []) as Lead[]
  const newCount = rows.filter((l) => l.lead_status === 'new').length

  return (
    <div className="space-y-6">
      {/* Page header */}
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
          </p>
        </div>
        {newCount > 0 && (
          <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-sm font-semibold text-[#1D4ED8]">
            {newCount} new
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total', value: rows.length, color: '#1B3A6B' },
          { label: 'New', value: rows.filter((l) => l.lead_status === 'new').length, color: '#1D4ED8' },
          { label: 'Contacted', value: rows.filter((l) => l.lead_status === 'contacted').length, color: '#92400E' },
          { label: 'Converted', value: rows.filter((l) => l.lead_status === 'converted').length, color: '#065F46' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          >
            <p className="text-sm text-[#6B7280]">{s.label}</p>
            <p
              className="mt-1 text-3xl font-bold"
              style={{ color: s.color, fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F4F6]">
            <Users size={24} className="text-[#9CA3AF]" />
          </div>
          <p className="font-semibold text-[#1A1A2E]">No leads yet</p>
          <p className="mt-1 text-sm text-[#6B7280]">
            Leads will appear here once customers submit a booking request.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F3F4F6]">
                  {['Customer', 'Contact', 'Interest', 'Source', 'Status', 'Date'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {rows.map((lead) => {
                  const status =
                    STATUS_STYLES[lead.lead_status] ?? STATUS_STYLES.new
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
                              <span className="truncate max-w-[140px]">
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
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{ backgroundColor: status.bg, color: status.text }}
                        >
                          {status.label}
                        </span>
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
