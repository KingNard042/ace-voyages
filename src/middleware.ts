import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ynrzvfvcoyliwlnczhtb.supabase.co'
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlucnp2ZnZjb3lsaXdsbmN6aHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDgzNzcsImV4cCI6MjA5MjI4NDM3N30.X3Vui48bBLK65lnVC29cheT7NkO6jWRr-na3urNvLl0'

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, role, full_name, email, is_active')
    .eq('auth_user_id', user.id)
    .single()

  if (!adminUser || !adminUser.is_active) {
    return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url))
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-admin-id', adminUser.id)
  requestHeaders.set('x-admin-role', adminUser.role)
  requestHeaders.set('x-admin-name', adminUser.full_name ?? '')
  requestHeaders.set('x-admin-email', adminUser.email ?? user.email ?? '')

  response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
