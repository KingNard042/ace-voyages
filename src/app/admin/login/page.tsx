'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const reasonParam = searchParams.get('reason')
    if (errorParam === 'unauthorized') setError('Your account does not have admin access.')
    if (reasonParam === 'timeout') setError('You were signed out due to inactivity.')
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.replace('/admin/dashboard')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-8 shadow-[0_24px_64px_rgba(0,0,0,0.3)]"
    >
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1A1A2E]">
          Email Address
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@acevoyages.net"
            className="w-full rounded-xl bg-[#E8EAED] py-3 pl-10 pr-4 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/25"
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#1A1A2E]">
          Password
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl bg-[#E8EAED] py-3 pl-10 pr-11 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/25"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A2E]"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #1B4080 0%, #1B3A6B 100%)' }}
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0d1f42 0%, #1B3A6B 100%)' }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4A017]">
            <Lock size={24} className="text-white" />
          </div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
          >
            ACE Voyages Admin
          </h1>
          <p className="mt-1 text-sm text-white/60">Sign in to your account</p>
        </div>

        <Suspense fallback={<div className="rounded-2xl bg-white p-8" />}>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-white/40">
          ACE Voyages Admin Panel · Authorised access only
        </p>
      </div>
    </div>
  )
}
