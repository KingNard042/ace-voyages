export type AdminRole = 'super_admin' | 'manager_admin' | 'agent_admin'

export type AdminFeature =
  | 'dashboard'
  | 'leads'
  | 'bookings'
  | 'tours'
  | 'blog'
  | 'testimonials'
  | 'visa_services'
  | 'users'
  | 'team'
  | 'reports'
  | 'settings'
  | 'activity_log'
  | 'newsletter'
  | 'notifications'

const ACCESS_MATRIX: Record<AdminRole, AdminFeature[]> = {
  super_admin: [
    'dashboard', 'leads', 'bookings', 'tours', 'blog', 'testimonials',
    'visa_services', 'users', 'team', 'reports', 'settings', 'activity_log',
    'newsletter', 'notifications',
  ],
  manager_admin: [
    'dashboard', 'leads', 'bookings', 'tours', 'blog', 'testimonials',
    'visa_services', 'team', 'reports', 'newsletter', 'notifications',
  ],
  agent_admin: [
    'dashboard', 'leads', 'bookings', 'blog', 'notifications',
  ],
}

export function canAccess(role: AdminRole | null | undefined, feature: AdminFeature): boolean {
  if (!role) return false
  return ACCESS_MATRIX[role]?.includes(feature) ?? false
}

export function getRoleLabel(role: AdminRole): string {
  const labels: Record<AdminRole, string> = {
    super_admin: 'Super Administrator',
    manager_admin: 'Manager',
    agent_admin: 'Agent',
  }
  return labels[role]
}
