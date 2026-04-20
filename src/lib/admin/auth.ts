import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { AdminRole } from './access'

export interface AdminSession {
  userId: string
  email: string
  name: string
  role: AdminRole
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const headersList = await headers()
  const userId = headersList.get('x-admin-id')
  const role = headersList.get('x-admin-role') as AdminRole | null
  const name = headersList.get('x-admin-name') ?? ''
  const email = headersList.get('x-admin-email') ?? ''

  if (!userId || !role) return null
  return { userId, email, name, role }
}

export async function logActivity(params: {
  adminId: string
  action: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
}) {
  try {
    const supabase = createServerSupabaseClient()
    await supabase.from('activity_log').insert({
      admin_user_id: params.adminId,
      action: params.action,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? null,
    })
  } catch {
    // Non-blocking — never let logging break a user action
  }
}
