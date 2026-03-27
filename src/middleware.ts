import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/panel', '/cihazlar', '/barkod', '/liste-yonetimi']

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Session'ı yenile
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Kimliği doğrulanmamış kullanıcıyı korumalı rotalardan /login'e yönlendir
  if (!user && isProtectedRoute(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Giriş yapmış kullanıcıyı /login'den /panel'e yönlendir
  if (user && pathname === '/login') {
    const panelUrl = request.nextUrl.clone()
    panelUrl.pathname = '/panel'
    return NextResponse.redirect(panelUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/login',
    '/panel/:path*',
    '/cihazlar/:path*',
    '/barkod/:path*',
    '/liste-yonetimi/:path*',
  ],
}
