'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Calendar, Map, FileText, MessageSquare,
  Globe, UserCog, BarChart2, Settings, Activity, Mail,
  LogOut, Menu, X, ChevronRight,
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

const NAV_ITEMS: NavItem[] = [
  { feature: 'dashboard',     label: 'Dashboard',     href: '/admin/dashboard',    icon: LayoutDashboard },
  { feature: 'leads',         label: 'Leads',         href: '/admin/leads',        icon: Users },
  { feature: 'bookings',      label: 'Bookings',      href: '/admin/bookings',     icon: Calendar },
  { feature: 'tours',         label: 'Tours',         href: '/admin/tours',        icon: Map },
  { feature: 'blog',          label: 'Blog',          href: '/admin/blog',         icon: FileText },
  { feature: 'testimonials',  label: 'Testimonials',  href: '/admin/testimonials', icon: MessageSquare },
  { feature: 'visa_services', label: 'Visa Services', href: '/admin/visa-services',icon: Globe },
  { feature: 'team',          label: 'Team',          href: '/admin/team',         icon: UserCog },
  { feature: 'reports',       label: 'Reports',       href: '/admin/reports',      icon: BarChart2 },
  { feature: 'newsletter',    label: 'Newsletter',    href: '/admin/newsletter',   icon: Mail },
  { feature: 'activity_log',  label: 'Activity Log',  href: '/admin/activity',     icon: Activity },
  { feature: 'settings',      label: 'Settings',      href: '/admin/settings',     icon: Settings },
]

export default function AdminSidebarClient({ role }: { role: AdminRole }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleItems = NAV_ITEMS.filter((item) => canAccess(role, item.feature))

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 px-5 border-b border-white/10">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4A017]">
          <span className="text-xs font-bold text-white">A</span>
        </div>
        <span
          className="text-sm font-bold text-white"
          style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
        >
          ACE Voyages
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {visibleItems.map(({ feature, label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={feature}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon size={17} />
              {label}
              {active && <ChevronRight size={13} className="ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex w-56 shrink-0 flex-col"
        style={{ background: 'linear-gradient(180deg, #1B3A6B 0%, #0d2247 100%)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B3A6B] text-white shadow-lg lg:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 w-56 lg:hidden"
            style={{ background: 'linear-gradient(180deg, #1B3A6B 0%, #0d2247 100%)' }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 text-white/60 hover:text-white"
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
