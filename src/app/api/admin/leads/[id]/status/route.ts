import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, logActivity } from '@/lib/admin/auth'
import { canAccess } from '@/lib/admin/access'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const VALID_STATUSES = new Set(['new', 'contacted', 'converted', 'cold'])

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  if (!canAccess(session.role, 'leads')) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  // ── Parse & validate body ─────────────────────────────────────────────────
  let newStatus: string
  try {
    const body = await req.json()
    newStatus = body?.status
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!newStatus || !VALID_STATUSES.has(newStatus)) {
    return NextResponse.json(
      { error: `Invalid status. Allowed values: ${[...VALID_STATUSES].join(', ')}.` },
      { status: 400 }
    )
  }

  const { id: leadId } = await params

  const supabase = createServerSupabaseClient()

  // ── Fetch current lead (needed for RBAC scope check + activity log) ───────
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('lead_id, lead_status, assigned_to, customer_name')
    .eq('lead_id', leadId)
    .single()

  if (fetchError || !lead) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
  }

  // ── RBAC: agent_admin can only update their own assigned leads ────────────
  if (session.role === 'agent_admin' && lead.assigned_to !== session.userId) {
    return NextResponse.json(
      { error: 'Agents can only update leads assigned to them.' },
      { status: 403 }
    )
  }

  // No-op if status unchanged
  if (lead.lead_status === newStatus) {
    return NextResponse.json({ success: true, changed: false })
  }

  // ── Update ────────────────────────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from('leads')
    .update({ lead_status: newStatus })
    .eq('lead_id', leadId)

  if (updateError) {
    console.error('[leads/status PATCH]', updateError.message)
    return NextResponse.json(
      { error: 'Database error. Please try again.' },
      { status: 500 }
    )
  }

  // ── Activity log (non-blocking — never fails the response) ────────────────
  void logActivity({
    adminId: session.userId,
    action: 'update_lead_status',
    entityType: 'lead',
    entityId: leadId,
    metadata: {
      from: lead.lead_status,
      to: newStatus,
      lead_name: lead.customer_name,
      admin_name: session.name,
    },
  })

  return NextResponse.json({ success: true, changed: true })
}
