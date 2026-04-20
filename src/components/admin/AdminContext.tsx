'use client'

import { createContext, useContext } from 'react'
import type { AdminRole } from '@/lib/admin/access'

export interface AdminUser {
  userId: string
  email: string
  name: string
  role: AdminRole
}

interface AdminContextValue {
  user: AdminUser
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({
  user,
  children,
}: {
  user: AdminUser
  children: React.ReactNode
}) {
  return <AdminContext.Provider value={{ user }}>{children}</AdminContext.Provider>
}

export function useAdminContext(): AdminContextValue {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdminContext must be used within AdminProvider')
  return ctx
}
