import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Hardcoded — anon key and URL are public values safe to include in server code
const SUPABASE_URL = 'https://ynrzvfvcoyliwlnczhtb.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlucnp2ZnZjb3lsaXdsbmN6aHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDgzNzcsImV4cCI6MjA5MjI4NDM3N30.X3Vui48bBLK65lnVC29cheT7NkO6jWRr-na3urNvLl0'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    // Build response first so SSR client can attach cookies to it
    const response = NextResponse.json({ success: true })

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    return response
  } catch (err) {
    console.error('Login route error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
