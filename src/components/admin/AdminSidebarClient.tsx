'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Plane, Map, Globe, FileText,
  Settings, Users, Menu, X, Plus,
} from 'lucide-react'
import { canAccess, type AdminRole, type AdminFeature } from '@/lib/admin/access'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface NavItem {
  feature: AdminFeature
  label: string
  href: string
  icon: React.ElementType
}

const MAIN_NAV: NavItem[] = [
  { feature: 'dashboard',    label: 'Dashboard', href: '/admin/dashboard',      icon: LayoutDashboard },
  { feature: 'bookings',     label: 'Flights',   href: '/admin/bookings',       icon: Plane },
  { feature: 'tours',        label: 'Tours',     href: '/admin/tours',          icon: Map },
  { feature: 'visa_services',label: 'Visas',     href: '/admin/visa-services',  icon: Globe },
  { feature: 'blog',         label: 'Blog',      href: '/admin/blog',           icon: FileText },
]

const ADMIN_NAV: NavItem[] = [
  { feature: 'settings', label: 'Settings', href: '/admin/settings', icon: Settings },
  { feature: 'users',    label: 'Users',    href: '/admin/team',     icon: Users },
]

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem
  pathname: string
  onNavigate: () => void
}) {
  const active = pathname === item.href || pathname.startsWith(item.href + '/')
  const Icon = item.icon
  return (
    <div className="relative">
      {active && (
        <span className="absolute left-0 top-[8px] bottom-[8px] w-[3px] rounded-r-full bg-[#105fa3]" />
      )}
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-3 rounded-xl ml-1 mr-2 px-3 py-2.5 text-sm font-medium transition-colors',
          active
            ? 'bg-[#EEF4FB] text-[#105fa3]'
            : 'text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#105fa3]',
        )}
      >
        <Icon size={17} />
        {item.label}
      </Link>
    </div>
  )
}

export default function AdminSidebarClient({ role }: { role: AdminRole }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  const visibleMain = MAIN_NAV.filter((item) => canAccess(role, item.feature))
  const visibleAdmin = ADMIN_NAV.filter((item) => canAccess(role, item.feature))

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-[#F3F4F6]">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#105fa3]">
          <Plane size={14} className="text-white -rotate-45" />
        </div>
        <div>
          <p
            className="text-sm font-bold text-[#1A1A2E] leading-tight"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            ACE Voyages
          </p>
          <p className="text-[9px] font-semibold tracking-[0.12em] text-[#9CA3AF] uppercase leading-tight mt-0.5">
            Digital Concierge
          </p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
        {visibleMain.map((item) => (
          <NavLink
            key={item.feature}
            item={item}
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
        ))}

        {visibleAdmin.length > 0 && (
          <>
            <div className="px-5 pt-5 pb-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
                Administration
              </p>
            </div>
            {visibleAdmin.map((item) => (
              <NavLink
                key={item.feature}
                item={item}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </>
        )}
      </nav>

      {/* Sign out (hidden — only via New Booking area) */}
      <div className="px-4 pb-5 pt-3 border-t border-[#F3F4F6] space-y-2">
        <Link
          href="/admin/bookings/new"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#105fa3] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus size={15} />
          New Booking
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full text-center text-xs text-[#9CA3AF] hover:text-[#6B7280] py-1 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-white border-r border-[#F3F4F6] shadow-[1px_0_0_0_#F3F4F6]">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-xl bg-[#105fa3] text-white shadow-lg lg:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-56 bg-white shadow-xl lg:hidden">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 text-[#6B7280] hover:text-[#1A1A2E]"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}
