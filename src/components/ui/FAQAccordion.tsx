'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: 'Can I pay in instalments?',
    a: 'Yes, we offer flexible payment options including instalment plans to make your dream trip more accessible. Contact our team to discuss what works best for your budget.',
  },
  {
    q: 'Do you help with visas?',
    a: 'Absolutely. We provide full visa assistance for UAE, UK, Canada, Schengen, Kenya, and many other destinations, with expert guidance at every step of the process.',
  },
  {
    q: 'How fast is booking confirmation?',
    a: 'Most bookings are confirmed within 5–15 minutes of payment. You will receive a booking confirmation and e-ticket delivered directly to your email address.',
  },
  {
    q: 'Can I book for a group?',
    a: 'Yes, we handle group bookings, family holiday packages, and full corporate travel management with dedicated account support throughout your journey.',
  },
  {
    q: 'What if my flight is cancelled?',
    a: 'We are here for you. Our team will guide you through the rebooking process or assist with refunds, working directly with the airline on your behalf at no extra charge.',
  },
]

export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-[#F3F4F6]">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 p-5 text-left"
            aria-expanded={open === i}
          >
            <span className="text-sm font-semibold text-[#1A1A2E] sm:text-base">{faq.q}</span>
            <ChevronDown
              size={18}
              className={cn(
                'shrink-0 text-[#6B7280] transition-transform duration-300',
                open === i && 'rotate-180 text-[#1B3A6B]'
              )}
            />
          </button>
          <div
            className={cn(
              'grid transition-all duration-300 ease-in-out',
              open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <p className="px-5 pb-5 text-sm leading-relaxed text-[#6B7280]">{faq.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
