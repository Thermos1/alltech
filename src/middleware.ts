import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not write any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected routes: redirect to login if not authenticated
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin-login'
  const isProtected = ['/cabinet', '/checkout'].some((prefix) =>
    pathname.startsWith(prefix)
  ) || isAdminRoute

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = isAdminRoute ? '/admin-login' : '/login'
    if (!isAdminRoute) url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Auth routes: redirect authenticated users appropriately
  const authRoutes = ['/login', '/register', '/admin-login']
  const isAuthRoute = authRoutes.includes(pathname)

  if (isAuthRoute && user) {
    // Check if user is staff — redirect to admin panel instead of cabinet
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isStaff = profile?.role === 'admin' || profile?.role === 'manager'

    const url = request.nextUrl.clone()
    url.pathname = (pathname === '/admin-login' || isStaff) ? '/admin' : '/'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as-is.
  // If you need to modify the response, clone it first:
  // const newResponse = NextResponse.next({ request })
  // and copy all cookies from supabaseResponse to newResponse.

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)',
  ],
}
