import Link from 'next/link'
import {
  Plane,
  Briefcase,
  Globe,
  FileCheck,
  Building2,
  Heart,
  Users,
  ShieldCheck,
  Award,
  Zap,
  Star,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'
import TourCard from '@/components/ui/TourCard'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import FAQAccordion from '@/components/ui/FAQAccordion'
import NewsletterForm from '@/components/ui/NewsletterForm'
import { getFeaturedTours, getApprovedTestimonials } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'

// ─── Data ────────────────────────────────────────────────────────────────────

const PARTNERS = ['Air Peace', 'Ibom Air', 'United Airlines', 'Arik Air', 'Paystack', 'Flutterwave']

const SERVICES = [
  {
    icon: Plane,
    title: 'Flight Booking',
    description: 'Local and international flights at the best fares, any day, any route.',
  },
  {
    icon: Briefcase,
    title: 'Corporate Travel',
    description: 'End-to-end travel management solutions built for Nigerian businesses.',
  },
  {
    icon: Globe,
    title: 'Leisure Packages',
    description: 'Curated all-inclusive holiday experiences tailored to every budget.',
  },
  {
    icon: FileCheck,
    title: 'Visa Assistance',
    description: 'Expert guidance for UK, UAE, Canada, Schengen, Kenya and more.',
  },
  {
    icon: Building2,
    title: 'Hotel Reservations',
    description: 'Handpicked hotels worldwide with ACE-exclusive rates.',
  },
  {
    icon: Heart,
    title: 'Honeymoon Deals',
    description: 'Romantic getaways designed to make your first trip unforgettable.',
  },
]

// Fallback data shown until Sanity content is published
const FALLBACK_TOURS = [
  {
    image: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80',
    name: 'Cairo Explorer',
    destination: 'Cairo, Egypt',
    price: 1_000_000,
    duration: '7 days',
    badge: 'Popular',
    slug: 'cairo-explorer',
  },
  {
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    name: 'Luxe Dubai Escape',
    destination: 'Dubai, UAE',
    price: 1_500_000,
    duration: '5 days',
    badge: 'Best Seller',
    slug: 'luxe-dubai-escape',
  },
  {
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80',
    name: 'Zanzibar Shores',
    destination: 'Zanzibar, Tanzania',
    price: 800_000,
    duration: '6 days',
    slug: 'zanzibar-shores',
  },
]

const FALLBACK_TESTIMONIALS = [
  {
    name: 'Blessing Okonkwo',
    location: 'Lagos',
    quote:
      'ACE Voyages made our family vacation to London completely stress-free. Their visa processing is top-notch and the service was excellent from start to finish.',
  },
  {
    name: 'Ibrahim Musa',
    location: 'Kano',
    quote:
      'I booked a corporate trip to Dubai through ACE Voyages. Everything was handled professionally and the pricing was completely transparent. Highly recommended!',
  },
  {
    name: 'Funmi Adewale',
    location: 'Ibadan',
    quote:
      'My husband and I had the most beautiful honeymoon in Zanzibar, all thanks to ACE Voyages. They thought of every detail. We will absolutely use them again!',
  },
]

const WHY_US = [
  { icon: Users, stat: '1,000+', label: 'Happy Travellers' },
  { icon: ShieldCheck, stat: '100%', label: 'Transparent Pricing' },
  { icon: Award, stat: 'Bespoke', label: 'Personalised Planning' },
  { icon: Zap, stat: '5–15 min', label: 'Booking Confirmation' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  // Fetch from Sanity; fall back to hardcoded data while CMS is being populated
  let tours = FALLBACK_TOURS
  let testimonials = FALLBACK_TESTIMONIALS

  try {
    const [cmsToursRaw, cmsTestimonialsRaw] = await Promise.all([
      getFeaturedTours(),
      getApprovedTestimonials(),
    ])

    if (cmsToursRaw.length > 0) {
      tours = cmsToursRaw.map((t) => ({
        image: t.heroImage
          ? urlFor(t.heroImage).width(800).quality(80).url()
          : 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80',
        name: t.title,
        destination: `${t.destination.city}, ${t.destination.country}`,
        price: t.price,
        duration: `${t.duration} day${t.duration === 1 ? '' : 's'}`,
        badge: t.featured ? 'Featured' : undefined,
        slug: t.slug.current,
      }))
    }

    if (cmsTestimonialsRaw.length > 0) {
      testimonials = cmsTestimonialsRaw.map((t) => ({
        name: t.customerName,
        location: t.city ?? 'Nigeria',
        quote: t.quote,
      }))
    }
  } catch {
    // Sanity not yet configured or no content — hardcoded fallback stays active
  }

  return (
    <>
      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative flex min-h-screen items-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#0c1a3a]/68" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
          <p
            className="text-xl text-[#D4A017] sm:text-2xl"
            style={{ fontFamily: 'var(--font-satisfy, cursive)' }}
          >
            Your Journey Awaits
          </p>
          <h1
            className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            Explore the World,
            <br />
            One Trip at a Time
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
            Nigeria&apos;s most trusted travel partner for flights, curated tours, visa assistance,
            and holiday packages that go beyond the ordinary.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/tours">
              <Button variant="gold" size="lg">
                Book a Tour
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outlined"
                size="lg"
                className="text-white ring-white/35 hover:bg-white/10"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. PARTNERS STRIP ───────────────────────────────────────────── */}
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-[#6B7280]">
            Trusted Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PARTNERS.map((name) => (
              <div
                key={name}
                className="flex h-11 min-w-[7.5rem] items-center justify-center rounded-xl bg-[#F3F4F6] px-5 text-sm font-semibold text-[#6B7280]"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. SERVICES ─────────────────────────────────────────────────── */}
      <section className="bg-[#F8F9FA] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Everything You Need to Travel"
            subtitle="From your first flight booking to your dream honeymoon, ACE Voyages covers every stage of your journey."
            align="center"
            className="mb-12"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col gap-4 rounded-2xl bg-white p-6 transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(26,28,28,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF3F9]">
                  <Icon size={22} className="text-[#1B3A6B]" />
                </div>
                <div>
                  <h3
                    className="text-base font-bold text-[#1A1A2E]"
                    style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                  >
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FEATURED TOURS ───────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              title="Featured Tour Packages"
              subtitle="Handpicked destinations with everything included."
            />
            <Link href="/tours">
              <Button variant="outlined" size="sm">
                View All Tours
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.slug} {...tour} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. WHY CHOOSE US ────────────────────────────────────────────── */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(135deg, #1B4080 0%, #1B3A6B 100%)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 flex flex-col items-center gap-3 text-center">
            <div className="flex flex-col items-center gap-2">
              <h2
                className="text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                Why Nigerians Trust ACE Voyages
              </h2>
              <div className="h-1 w-12 rounded-full bg-[#D4A017]" />
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-white/70">
              Built for Nigerians — we understand exactly what matters to you when you travel.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {WHY_US.map(({ icon: Icon, stat, label }) => (
              <div key={label} className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <Icon size={26} className="text-[#D4A017]" />
                </div>
                <p
                  className="text-2xl font-bold text-white sm:text-3xl"
                  style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
                >
                  {stat}
                </p>
                <p className="text-sm text-white/65">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="bg-[#F8F9FA] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Real Stories, Real Journeys"
            subtitle="Join thousands of Nigerians who have discovered the world with our specialised concierge service."
            align="center"
            className="mb-12"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map(({ name, location, quote }) => (
              <div
                key={name}
                className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgba(26,28,28,0.05)]"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} className="fill-[#D4A017] text-[#D4A017]" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-[#1A1A2E]">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B3A6B]">
                    <span className="text-xs font-bold text-white">{name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A2E]">{name}</p>
                    <p className="text-xs text-[#6B7280]">{location}, Nigeria</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FAQ ──────────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Frequently Asked Questions"
            subtitle="Everything you need to know before you book."
            align="center"
            className="mb-10"
          />
          <FAQAccordion />
        </div>
      </section>

      {/* ── 8. NEWSLETTER ───────────────────────────────────────────────── */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0d2247 100%)' }}
      >
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <p
            className="mb-2 text-xl text-[#D4A017]"
            style={{ fontFamily: 'var(--font-satisfy, cursive)' }}
          >
            Stay in the loop
          </p>
          <h2
            className="mb-3 text-3xl font-bold text-white sm:text-4xl"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            Subscribe for Secret Deals
          </h2>
          <p className="mb-8 text-base leading-relaxed text-white/65">
            Exclusive travel deals, visa updates, and destination inspiration delivered straight to
            your inbox. No spam, ever.
          </p>
          <NewsletterForm />
        </div>
      </section>

      {/* ── Floating WhatsApp ────────────────────────────────────────────── */}
      <WhatsAppButton />
    </>
  )
}
