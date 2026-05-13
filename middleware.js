import { NextResponse } from 'next/server'

const BOT_AGENTS = /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|msnbot|facebot|ia_archiver/i

export function middleware(request) {
  const { pathname } = request.nextUrl
  const ua = request.headers.get('user-agent') || ''
  const isBot = BOT_AGENTS.test(ua)
  const host = request.headers.get('host') || ''

  if (host.startsWith('www.')) {
    const url = request.nextUrl.clone()
    url.host = host.replace(/^www\./, '')
    return NextResponse.redirect(url, 301)
  }

  if (pathname !== '/' && pathname.endsWith('/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(0, -1)
    return NextResponse.redirect(url, 301)
  }

  const response = NextResponse.next()

  if (isBot) {
    response.headers.set('X-Robots-Tag', 'index, follow')
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  }

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.svg|favicon-32\\.png|logo\\.jpg|.*\\.(?:jpg|jpeg|png|gif|svg|mp4|webp|ico)).*)',
  ],
}
