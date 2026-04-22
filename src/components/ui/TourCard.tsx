'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MapPin, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import Badge from './Badge'
import Button from './Button'
import TourLeadModal from './TourLeadModal'

interface TourCardProps {
  image: string
  name: string
  destination: string
  price: number
  duration: string
  badge?: string
  slug: string
  className?: string
}

export default function TourCard({
  image,
  name,
  destination,
  price,
  duration,
  badge,
  slug,
  className,
}: TourCardProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <article
        className={cn(
          'group flex flex-col overflow-hidden rounded-2xl bg-[#F3F4F6]',
          'transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(26,28,28,0.10)]',
          className
        )}
      >
        <div className="relative aspect-[3/2] overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {badge && (
            <div className="absolute left-3 top-3">
              <Badge label={badge} variant="sale" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 p-5">
          <h3
            className="line-clamp-2 text-lg font-bold leading-snug text-[#1A1A2E]"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            {name}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-[#D4A017]" />
              {destination}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} className="text-[#D4A017]" />
              {duration}
            </span>
          </div>

          <div className="mt-1 flex items-end justify-between">
            <div>
              <p className="text-xs text-[#6B7280]">From</p>
              <p
                className="text-xl font-bold text-[#D4A017]"
                style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
              >
                ₦{price.toLocaleString('en-NG')}
              </p>
            </div>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              Book Now
            </Button>
          </div>
        </div>
      </article>

      <TourLeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tourName={name}
        destination={destination}
        slug={slug}
      />
    </>
  )
}
