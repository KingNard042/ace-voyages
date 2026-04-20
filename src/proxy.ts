import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only gate /admin routes (not /admin/login)
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

  // Look up admin_users table for role
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, role, full_name, email, is_active')
    .eq('auth_user_id', user.id)
    .single()

  if (!adminUser || !adminUser.is_active) {
    return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url))
  }

  // Inject role into request headers for downstream server components
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
