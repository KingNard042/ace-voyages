'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
  { label: 'About Us', href: '/about' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // Transparent hero overlay only on the homepage before scrolling
  const isTransparent = pathname === '/' && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    // Run once on mount to set initial state (e.g. page loaded mid-scroll)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/95 shadow-[0_4px_24px_rgba(26,28,28,0.08)] backdrop-blur-md'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ── Logo ── */}
        <Link href="/" className="shrink-0">
          <span
            className={cn(
              'text-xl font-bold transition-colors duration-300',
              isTransparent ? 'text-white' : 'text-[#1B3A6B]'
            )}
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            ACE <span className="text-[#D4A017]">Voyages</span>
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200',
                  isTransparent
                    ? active
                      ? 'text-[#D4A017]'
                      : 'text-white/85 hover:text-white'
                    : active
                    ? 'text-[#1B3A6B]'
                    : 'text-[#1A1A2E] hover:text-[#1B3A6B]'
                )}
              >
                {label}
                {active && (
                  <span className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full bg-[#D4A017]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* ── Desktop CTA ── */}
        <div className="hidden md:block">
          <Link href="/contact">
            <Button variant="gold" size="sm">Book Now</Button>
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200 md:hidden',
            isTransparent
              ? 'text-white hover:bg-white/10'
              : 'text-[#1B3A6B] hover:bg-[#F3F4F6]'
          )}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out md:hidden',
          menuOpen ? 'max-h-80' : 'max-h-0'
        )}
      >
        <div className="bg-white px-4 pb-5 pt-2 shadow-[0_8px_32px_rgba(26,28,28,0.10)]">
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex min-h-[48px] items-center justify-between rounded-xl px-4 text-sm font-medium transition-colors duration-200',
                  active
                    ? 'bg-[#EEF3F9] text-[#1B3A6B]'
                    : 'text-[#1A1A2E] hover:bg-[#F3F4F6] hover:text-[#1B3A6B]'
                )}
              >
                {label}
                {active && <span className="h-1.5 w-1.5 rounded-full bg-[#D4A017]" />}
              </Link>
            )
          })}
          <div className="mt-4 px-1">
            <Link href="/contact" className="block w-full">
              <Button variant="gold" size="sm" className="w-full">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
