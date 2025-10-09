import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Extract subdomain
  const subdomain = hostname.split('.')[0]
  const isMasterSubdomain = subdomain === 'master' || hostname.startsWith('admin.')

  const isStaticAsset = url.pathname.match(/\.(webp|jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i)
  if (isStaticAsset) {
    return NextResponse.next()
  }

  // --- 1. Block admin routes on main domain ---
  if (!isMasterSubdomain && (url.pathname.startsWith('/admin') || url.pathname === '/login')) {
    // Return 404 for admin routes accessed on main domain
    return new NextResponse('Not Found', { status: 404 })
  }

  // --- 2. Handle master subdomain routing ---
  if (isMasterSubdomain) {
    // For master subdomain, always rewrite to admin routes
    if (!url.pathname.startsWith('/admin') && url.pathname !== '/login') {
      // Redirect root and other paths to /admin
      if (url.pathname === '/') {
        url.pathname = '/admin'
      } else {
        url.pathname = `/admin${url.pathname}`
      }
    }

    // --- 3. Supabase Auth Guard for admin routes ---
    if (url.pathname.startsWith('/admin')) {
      // Prepare Supabase client
      let supabaseResponse = NextResponse.rewrite(url)

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
              supabaseResponse = NextResponse.rewrite(url)
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          // Redirect to login on the same subdomain
          const loginUrl = new URL('/login', request.url)
          loginUrl.hostname = hostname
          return NextResponse.redirect(loginUrl)
        }

        return supabaseResponse
      } catch (error) {
        console.error('Auth error:', error)
        // Redirect to login on error
        const loginUrl = new URL('/login', request.url)
        loginUrl.hostname = hostname
        return NextResponse.redirect(loginUrl)
      }
    }

    // --- 4. Handle login page on master subdomain ---
    if (url.pathname === '/login') {
      // Check if user is already authenticated
      let supabaseResponse = NextResponse.rewrite(url)

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
              supabaseResponse = NextResponse.rewrite(url)
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // User is already logged in, redirect to admin
          const adminUrl = new URL('/admin', request.url)
          adminUrl.hostname = hostname
          return NextResponse.redirect(adminUrl)
        }
      } catch (error) {
        console.error('Auth check error on login page:', error)
      }

      return supabaseResponse
    }

    // For any other paths on master subdomain, rewrite them
    return NextResponse.rewrite(url)
  }

  // --- 5. Handle main domain (non-admin) requests ---
  // Just continue normally for main domain
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - api routes (optional, add if needed)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
