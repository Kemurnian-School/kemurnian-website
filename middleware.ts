import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
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
            // Set cookies on the request for immediate use
            cookiesToSet.forEach(({ name, value, options }) => 
              request.cookies.set(name, value)
            )
            
            // Create new response to set cookies
            supabaseResponse = NextResponse.next({
              request,
            })
            
            // Set cookies on the response for the browser
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // This call will trigger session refresh if needed
    const { data: { user }, error } = await supabase.auth.getUser()
    
    console.log('Middleware - User:', user?.id)
    console.log('Middleware - Error:', error)
    
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    return supabaseResponse
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}