import { createBrowserClient } from '@supabase/ssr'

// Fallback values allow the build to succeed when env vars aren't set yet.
// At runtime on Vercel, Next.js inlines the real NEXT_PUBLIC_* values.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL    || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
)
