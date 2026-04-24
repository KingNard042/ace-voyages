'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'
import Button from './Button'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isValid = EMAIL_RE.test(email.trim())
  const showError = touched && !isValid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return

    setLoading(true)
    setServerError(null)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Something went wrong — please try again.')
      }
      setSubmitted(true)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
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
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={showError}
          aria-describedby={showError ? 'newsletter-error' : undefined}
          className={[
            'h-12 flex-1 rounded-2xl bg-white/10 px-4 text-white placeholder:text-white/45 outline-none transition-all duration-200 focus:bg-white/15 focus:ring-2 sm:min-w-[280px]',
            showError
              ? 'ring-2 ring-red-400/70 focus:ring-red-400/70'
              : 'focus:ring-[#D4A017]/50',
          ].join(' ')}
        />
        <Button type="submit" variant="gold" disabled={loading}>
          {loading ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </div>
      {showError && (
        <p id="newsletter-error" className="flex items-center gap-1.5 text-sm text-red-300">
          <AlertCircle size={14} />
          Please enter a valid email address.
        </p>
      )}
      {serverError && (
        <p className="flex items-center gap-1.5 text-sm text-red-300">
          <AlertCircle size={14} />
          {serverError}{' '}
          <a href="https://wa.me/2348061640504" className="underline">
            WhatsApp us instead.
          </a>
        </p>
      )}
    </form>
  )
}
