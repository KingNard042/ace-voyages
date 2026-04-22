import { redirect } from 'next/navigation'
import { Search, HelpCircle } from 'lucide-react'
import { getAdminSession } from '@/lib/admin/auth'
import { canAccess, getRoleLabel } from '@/lib/admin/access'
import { AdminProvider } from '@/components/admin/AdminContext'
import RoleGate from '@/components/admin/RoleGate'
import SessionGuard from '@/components/admin/SessionGuard'
import NotificationBell from '@/components/admin/NotificationBell'
import AdminSidebarClient from '@/components/admin/AdminSidebarClient'
import Toaster from '@/components/ui/Toaster'

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
            <header className="flex h-16 items-center gap-4 border-b border-[#F3F4F6] bg-white px-6">
              {/* Search */}
              <div className="flex flex-1 items-center gap-2.5 max-w-sm rounded-xl bg-[#F3F4F6] px-4 py-2.5">
                <Search size={15} className="shrink-0 text-[#9CA3AF]" />
                <input
                  type="search"
                  placeholder="Search bookings, flights, or clients..."
                  className="w-full bg-transparent text-sm text-[#1A1A2E] placeholder-[#9CA3AF] outline-none"
                />
              </div>

              {/* Right side */}
              <div className="ml-auto flex items-center gap-2">
                <RoleGate feature="notifications">
                  <NotificationBell />
                </RoleGate>
                <button
                  aria-label="Help"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#1A1A2E]"
                >
                  <HelpCircle size={18} />
                </button>
                <div className="mx-1 h-5 w-px bg-[#E5E7EB]" />
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#1A1A2E] leading-none">{session.name}</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">{getRoleLabel(session.role)}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#105fa3] text-sm font-bold text-white">
                  {session.name.charAt(0).toUpperCase()}
                </div>
              </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </SessionGuard>
      <Toaster />
    </AdminProvider>
  )
}
