'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Button from '@/components/ui/Button'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const tagRef = useRef<HTMLParagraphElement>(null)
  const headRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // ── Ken Burns: scale down from 1.08 → 1 on load ──────────────────────
      gsap.fromTo(
        bgRef.current,
        { scale: 1.08 },
        { scale: 1, duration: 2.5, ease: 'power2.out' },
      )

      // ── Text entrance: staggered fade + rise ─────────────────────────────
      const tl = gsap.timeline({ delay: 0.2 })
      tl.fromTo(
        tagRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
      )
        .fromTo(
          headRef.current,
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          '-=0.4',
        )
        .fromTo(
          bodyRef.current,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
          '-=0.45',
        )
        .fromTo(
          ctaRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
          '-=0.4',
        )

      // ── Parallax: background drifts up as user scrolls ───────────────────
      gsap.to(bgRef.current, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })
    },
    { scope: containerRef },
  )

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Background image — animated by GSAP */}
      <div
        ref={bgRef}
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // slightly oversized so parallax travel doesn't expose edges
          top: '-10%',
          bottom: '-10%',
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#0c1a3a]/68" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
        <p
          ref={tagRef}
          className="text-xl text-[#D4A017] sm:text-2xl"
          style={{ fontFamily: 'var(--font-satisfy, cursive)' }}
        >
          Your Journey Awaits
        </p>
        <h1
          ref={headRef}
          className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl"
          style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
        >
          Explore the World,
          <br />
          One Trip at a Time
        </h1>
        <p
          ref={bodyRef}
          className="mt-5 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg"
        >
          Nigeria&apos;s most trusted travel partner for flights, curated tours, visa assistance,
          and holiday packages that go beyond the ordinary.
        </p>
        <div ref={ctaRef} className="mt-8 flex flex-wrap gap-4">
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
  )
}
