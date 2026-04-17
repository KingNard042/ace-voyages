import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'FAQs', href: '/#faq' },
]

export default function Footer() {
  return (
    <footer className="bg-[#F3F4F6]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div>
            <p
              className="text-lg font-bold text-[#1B3A6B]"
              style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
            >
              ACE <span className="text-[#D4A017]">Voyages</span>
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">Elevating Nigerian Travel</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {FOOTER_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm text-[#6B7280] transition-colors duration-200 hover:text-[#1B3A6B]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[#6B7280]">
          © {new Date().getFullYear()} ACE Voyages Ltd. All rights reserved. Elevating Nigerian Travel.
        </p>
      </div>
    </footer>
  )
}
