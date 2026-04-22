'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import Button from '@/components/ui/Button'

const schema = z.object({
  customer_name: z.string().min(2, 'Please enter your full name'),
  customer_email: z.string().email('Please enter a valid email address'),
  customer_phone: z.string().min(7, 'Please enter a valid phone number'),
  customer_whatsapp: z.string().optional(),
  message: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface TourLeadFormProps {
  tourName: string
  destination: string
  slug: string
  onSuccess: () => void
}

export default function TourLeadForm({ tourName, destination, slug, onSuccess }: TourLeadFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormValues) {
    setServerError(null)
    try {
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, tourName, destination, slug }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Something went wrong')
      onSuccess()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to submit. Please try again.')
    }
  }

  const inputClass =
    'h-12 w-full rounded-xl bg-[#E8EAED] px-4 text-sm text-[#1A1A2E] placeholder-[#9CA3AF] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/25'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {/* Tour summary */}
      <div className="rounded-xl bg-[#EEF4FB] px-4 py-3">
        <p className="text-xs text-[#6B7280]">Your booking interest</p>
        <p className="text-sm font-semibold text-[#1B3A6B]">{tourName}</p>
        <p className="text-xs text-[#9CA3AF]">{destination}</p>
      </div>

      {/* Full Name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#374151]">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register('customer_name')}
          placeholder="e.g. Adaeze Johnson"
          className={inputClass}
        />
        {errors.customer_name && (
          <p className="text-xs text-red-500">{errors.customer_name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#374151]">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          {...register('customer_email')}
          type="email"
          placeholder="you@example.com"
          className={inputClass}
        />
        {errors.customer_email && (
          <p className="text-xs text-red-500">{errors.customer_email.message}</p>
        )}
      </div>

      {/* Phone + WhatsApp */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#374151]">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            {...register('customer_phone')}
            type="tel"
            placeholder="+234 801 234 5678"
            className={inputClass}
          />
          {errors.customer_phone && (
            <p className="text-xs text-red-500">{errors.customer_phone.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#374151]">WhatsApp Number</label>
          <input
            {...register('customer_whatsapp')}
            type="tel"
            placeholder="Same as phone? Leave blank"
            className={inputClass}
          />
        </div>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#374151]">Message (optional)</label>
        <textarea
          {...register('message')}
          rows={3}
          placeholder="Travel dates, group size, special requests…"
          className="w-full rounded-xl bg-[#E8EAED] px-4 py-3 text-sm text-[#1A1A2E] placeholder-[#9CA3AF] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/25 resize-none"
        />
      </div>

      {serverError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{serverError}</p>
      )}

      <Button type="submit" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? 'Sending…' : 'Request This Tour'}
      </Button>

      <p className="text-center text-xs text-[#9CA3AF]">
        Our team will contact you within 24 hours.
      </p>
    </form>
  )
}
