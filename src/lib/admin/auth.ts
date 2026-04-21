import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { AdminRole } from './access'

export interface AdminSession {
  userId: string
  email: string
  name: string
  role: AdminRole
}

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ynrzvfvcoyliwlnczhtb.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlucnp2ZnZjb3lsaXdsbmN6aHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDgzNzcsImV4cCI6MjA5MjI4NDM3N30.X3Vui48bBLK65lnVC29cheT7NkO6jWRr-na3urNvLl0'

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()

  // SSR client reads the Supabase auth session from request cookies
  const authClient = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {
        // No-op: server components cannot set cookies
      },
    },
  })

  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) return null

  // Service role key bypasses RLS — no policy ambiguity
  const adminClient = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: adminUser } = await adminClient
    .from('admin_users')
    .select('id, role, full_name, email, is_active')
    .eq('auth_user_id', user.id)
    .single()

  if (!adminUser || !adminUser.is_active) return null

  return {
    userId: adminUser.id,
    email: adminUser.email ?? user.email ?? '',
    name: adminUser.full_name ?? '',
    role: adminUser.role as AdminRole,
  }
}

export async function logActivity(params: {
  adminId: string
  action: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
}) {
  try {
    const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await supabase.from('activity_log').insert({
      admin_user_id: params.adminId,
      action: params.action,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      details: params.metadata ?? null,
    })
  } catch {
    // Non-blocking — never let logging break a user action
  }
}
