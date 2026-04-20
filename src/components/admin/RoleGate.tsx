'use client'

import { canAccess, type AdminFeature } from '@/lib/admin/access'
import { useAdminContext } from './AdminContext'

interface RoleGateProps {
  feature: AdminFeature
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function RoleGate({ feature, children, fallback = null }: RoleGateProps) {
  const { user } = useAdminContext()
  if (!canAccess(user.role, feature)) return <>{fallback}</>
  return <>{children}</>
}
