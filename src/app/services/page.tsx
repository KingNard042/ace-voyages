import Image from 'next/image'
import Link from 'next/link'
import { Globe, Clock, ShieldCheck, CheckCircle, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'

// ─── Data ────────────────────────────────────────────────────────────────────

const TOURS = [
  {
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80',
    badge: 'European Escape',
    name: 'Venetian Serenade',
    tags: ['7 Days', '5-Star Accommodation', 'Guided History'],
    slug: 'venetian-serenade',
  },
  {
    image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&q=80',
    badge: 'Wild Africa',
    name: 'Maasai Mara Safari',
    tags: ['5 Days', 'Luxury Tented Camps', 'Photography Tours'],
    slug: 'maasai-mara-safari',
  },
  {
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    badge: 'Far East Discovery',
    name: 'Kyoto Zen Gardens',
    tags: ['10 Days', 'Culinary Focus', 'High-Speed Rail Pass'],
    slug: 'kyoto-zen-gardens',
  },
]

const WHY_ITEMS = [
  {
    icon: ShieldCheck,
    accentColor: '#1B3A6B',
    bgColor: '#EEF3F9',
    title: 'Local Expertise, Global Standards',
    description:
      'Deeply rooted in the Nigerian travel landscape while maintaining world-class service protocols.',
  },
  {
    icon: CheckCircle,
    accentColor: '#D4A017',
    bgColor: '#FFF4E0',
    title: 'Unwavering Trust',
    description: 'Thousands of successful journeys and happy travelers since 2018.',
  },
  {
    icon: Globe,
    accentColor: '#1B3A6B',
    bgColor: '#EEF3F9',
    title: 'Bespoke Personalization',
    description: 'Every itinerary is unique. We listen, then we design.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  return (
    <>
      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-white pt-24 pb-16 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left — text */}
            <div>
              <p
                className="text-lg text-[#D4A017] sm:text-xl"
                style={{ fontFamily: 'var(--font-satisfy, cursive)' }}
              >
                Your Journey
              </p>
              <h1
                className="mt-2 text-4xl font-bold leading-tight text-[#1B3A6B] sm:text-5xl lg:text-6xl"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                Our Services
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-[#6B7280]">
                ACE Voyages makes travel seamless, combining global reach with the warmth of Nigerian
                hospitality. Discover a world of curated experiences designed just for you.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="h-1 w-10 rounded-full bg-[#D4A017]" />
                <div className="h-1 w-6 rounded-full bg-[#D4A017]/40" />
              </div>
            </div>

            {/* Right — image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80"
                alt="Airplane wing above the clouds"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FLIGHT BOOKING ───────────────────────────────────────────── */}
      <section className="bg-[#F8F9FA] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Image + floating glass card */}
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src="https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=900&q=80"
                  alt="Commercial aircraft ready for departure"
                  fill
                  className="object-cover"
                />
              </div>
              <div
                className="absolute bottom-6 right-6 flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 12px 40px rgba(26,28,28,0.10)',
                }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9]">
                  <Globe size={18} className="text-[#1B3A6B]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">Global Reach</p>
                  <p className="text-xs text-[#6B7280]">5,000+ destinations worldwide</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <h2
                className="text-3xl font-bold text-[#1B3A6B] sm:text-4xl"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                Flight Booking
              </h2>
              <div className="mt-7 flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF4E0]">
                    <Clock size={18} className="text-[#D4A017]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A2E]">Competitive Pricing</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">
                      Access exclusive deals and wholesale rates for international and domestic routes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F9]">
                    <ShieldCheck size={18} className="text-[#1B3A6B]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A2E]">24/7 Concierge Support</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">
                      Dedicated agents ready to assist with rescheduling, upgrades, and cancellations.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/contact">
                  <Button variant="primary" size="md">
                    Search Flights <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. VISA SERVICES ────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <h2
              className="text-3xl font-bold text-[#1B3A6B] sm:text-4xl"
              style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
            >
              Visa Services
            </h2>
            <div className="h-1 w-12 rounded-full bg-[#D4A017]" />
            <p className="max-w-lg text-base leading-relaxed text-[#6B7280]">
              Navigating international borders shouldn&apos;t be a hurdle. Our experts simplify the
              Nigerian visa process for destinations worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Light card — Nigerian Expertise */}
            <div
              className="rounded-3xl bg-[#F8F9FA] p-8"
              style={{ boxShadow: '0 4px 24px rgba(26,28,28,0.04)' }}
            >
              <h3
                className="text-xl font-bold text-[#1B3A6B]"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                Nigerian Expertise
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
                Specialized document review and submission strategies tailored for Nigerian travelers
                and business professionals.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['UK', 'USA', 'Canada', 'Schengen', 'UAE', 'Kenya'].map((country) => (
                  <span
                    key={country}
                    className="rounded-full bg-[#EEF3F9] px-3 py-1 text-xs font-semibold text-[#1B3A6B]"
                  >
                    {country}
                  </span>
                ))}
              </div>
            </div>

            {/* Dark card — 98% Success Rate */}
            <div className="flex flex-col justify-between rounded-3xl bg-[#1B3A6B] p-8">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4A017]/20">
                  <CheckCircle size={24} className="text-[#D4A017]" />
                </div>
                <h3
                  className="mt-5 text-xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                >
                  98% Success Rate
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  Expert guidance on application forms and interview prep. We have helped thousands of
                  Nigerians secure their visas without stress.
                </p>
              </div>
              <div className="mt-8">
                <Link href="/contact">
                  <Button
                    variant="outlined"
                    size="sm"
                    className="text-white ring-white/30 hover:bg-white/10"
                  >
                    Get Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CURATED TOURS ────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#D4A017]">
                Featured Destinations
              </p>
              <h2
                className="text-3xl font-bold text-[#1A1A2E] sm:text-4xl"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                Curated Tours
              </h2>
              <p className="mt-2 text-sm text-[#6B7280]">
                Bespoke itineraries crafted for the discerning traveler.
              </p>
            </div>
            <Link
              href="/tours"
              className="flex items-center gap-1 text-sm font-semibold text-[#1B3A6B] transition-colors duration-200 hover:text-[#D4A017]"
            >
              Explore Packages <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TOURS.map((tour) => (
              <Link
                key={tour.slug}
                href={`/tours/${tour.slug}`}
                className="group block overflow-hidden rounded-3xl bg-[#F8F9FA]"
                style={{ boxShadow: '0 4px 24px rgba(26,28,28,0.06)' }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={tour.image}
                    alt={tour.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[#1B3A6B] backdrop-blur-sm">
                    {tour.badge}
                  </span>
                </div>
                <div className="p-5">
                  <h3
                    className="text-base font-bold text-[#1A1A2E]"
                    style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                  >
                    {tour.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#6B7280]">{tour.tags.join(' • ')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. WHY ACE VOYAGES ──────────────────────────────────────────── */}
      <section className="bg-[#F8F9FA] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left — reasons */}
            <div>
              <h2
                className="text-3xl font-bold text-[#1A1A2E] sm:text-4xl"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                Why ACE Voyages?
              </h2>
              <div className="mt-8 flex flex-col gap-7">
                {WHY_ITEMS.map(({ icon: Icon, accentColor, bgColor, title, description }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: bgColor }}
                    >
                      <Icon size={18} style={{ color: accentColor }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A2E]">{title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl lg:aspect-[3/4]">
              <Image
                src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=900&q=80"
                alt="Happy travelers with luggage"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
