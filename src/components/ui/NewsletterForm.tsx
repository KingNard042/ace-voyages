'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import Button from './Button'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 text-white">
        <CheckCircle size={30} className="text-[#D4A017]" />
        <p className="text-base font-semibold">You&apos;re on the list!</p>
        <p className="text-sm text-white/65">
          Exclusive deals and travel inspiration heading your way.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:justify-center"
    >
      <input
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="h-12 flex-1 rounded-2xl bg-white/10 px-4 text-white placeholder:text-white/45 outline-none transition-all duration-200 focus:bg-white/15 focus:ring-2 focus:ring-[#D4A017]/50 sm:min-w-[280px]"
      />
      <Button type="submit" variant="gold">
        Subscribe
      </Button>
    </form>
  )
}
