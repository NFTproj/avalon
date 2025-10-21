// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // bloqueia /dashboard, /profile e subrotas
  if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/profile')) {
    if (!req.cookies.get('accessToken')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  return NextResponse.next()
}

// quais rotas o middleware observa
export const config = { matcher: ['/dashboard/:path*', '/profile/:path*'] }
