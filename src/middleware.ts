import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/courts', '/events']
const AUTH_ROUTES = ['/login', '/signup', '/verify-email']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Redirect root to courts
  if (path === '/') {
    return NextResponse.redirect(new URL('/courts', request.url))
  }

  // Authenticated users don't need auth pages
  if (user && AUTH_ROUTES.some(r => path.startsWith(r))) {
    return NextResponse.redirect(new URL('/courts', request.url))
  }

  // Protected routes require auth
  const isProtected = !PUBLIC_ROUTES.some(r => path.startsWith(r)) &&
    !AUTH_ROUTES.some(r => path.startsWith(r))

  if (!user && isProtected) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|icons|manifest).*)'],
}
