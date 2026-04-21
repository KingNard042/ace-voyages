'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveTour } from './actions'
import { INITIAL_FORM, type FormState, type FormUpdater } from './types'
import Step1Details from './Step1Details'
import Step2Pricing from './Step2Pricing'
import Step3Media from './Step3Media'

export default function CreateTourWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [draftId, setDraftId] = useState<string | undefined>()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const update: FormUpdater = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  function validate(forStep: number): string | null {
    if (forStep >= 1) {
      if (!form.title.trim()) return 'Tour name is required'
      if (!form.destination_city.trim()) return 'Destination city is required'
      if (!form.destination_country.trim()) return 'Destination country is required'
      if (form.duration_days < 1) return 'Duration must be at least 1 day'
    }
    if (forStep >= 2) {
      if (form.price_naira <= 0) return 'Base price must be greater than 0'
    }
    return null
  }

  function goNext() {
    const err = validate(step)
    if (err) { setError(err); return }
    setError('')
    setStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goBack() {
    setError('')
    setStep((s) => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSaveDraft() {
    const err = validate(1)
    if (err) { setError(err); return }
    startTransition(async () => {
      const result = await saveTour(form, false, draftId)
      if (result.success) {
        setDraftId(result.id)
        setError('')
        router.push('/admin/tours')
      } else {
        setError(result.error ?? 'Save failed')
      }
    })
  }

  function handlePublish() {
    const err = validate(2)
    if (err) { setError(err); return }
    startTransition(async () => {
      const result = await saveTour(form, true, draftId)
      if (result.success) {
        router.push('/admin/tours')
      } else {
        setError(result.error ?? 'Publish failed')
      }
    })
  }

  return (
    <div>
      {error && (
        <div className="mb-5 rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm font-medium text-[#991B1B]">
          {error}
        </div>
      )}

      {step === 1 && (
        <Step1Details
          form={form}
          update={update}
          step={step}
          onNext={goNext}
          onSaveDraft={handleSaveDraft}
          isPending={isPending}
        />
      )}
      {step === 2 && (
        <Step2Pricing
          form={form}
          update={update}
          step={step}
          onNext={goNext}
          onBack={goBack}
          onSaveDraft={handleSaveDraft}
          isPending={isPending}
        />
      )}
      {step === 3 && (
        <Step3Media
          form={form}
          update={update}
          step={step}
          onPublish={handlePublish}
          onBack={goBack}
          isPending={isPending}
        />
      )}
    </div>
  )
}
