import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/admin/auth'
import { canAccess, getRoleLabel } from '@/lib/admin/access'
import { AdminProvider } from '@/components/admin/AdminContext'
import RoleGate from '@/components/admin/RoleGate'
import SessionGuard from '@/components/admin/SessionGuard'
import NotificationBell from '@/components/admin/NotificationBell'
import AdminSidebarClient from '@/components/admin/AdminSidebarClient'

export const metadata = { title: 'Admin — ACE Voyages' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <AdminProvider user={session}>
      <SessionGuard>
        <div className="flex min-h-screen bg-[#F8F9FA]">
          {/* Sidebar */}
          <AdminSidebarClient role={session.role} />

          {/* Main */}
          <div className="flex flex-1 flex-col min-w-0">
            {/* Topbar */}
            <header className="flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white px-6">
              <div />
              <div className="flex items-center gap-3">
                <RoleGate feature="notifications">
                  <NotificationBell />
                </RoleGate>
                <div className="h-5 w-px bg-[#E5E7EB]" />
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#1A1A2E] leading-none">{session.name}</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">{getRoleLabel(session.role)}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B3A6B] text-sm font-bold text-white">
                  {session.name.charAt(0).toUpperCase()}
                </div>
              </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </SessionGuard>
    </AdminProvider>
  )
}
