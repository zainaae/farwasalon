import { NextResponse } from 'next/server'

const BOT_AGENTS = /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|msnbot|facebot|ia_archiver/i

export function proxy(request) {
  const ua = request.headers.get('user-agent') || ''
  const isBot = BOT_AGENTS.test(ua)

  const response = NextResponse.next()

  if (isBot) {
    response.headers.set('X-Robots-Tag', 'index, follow')
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.svg|favicon-32\\.png|logo\\.jpg|.*\\.(?:jpg|jpeg|png|gif|svg|mp4|webp|ico)).*)',
  ],
}
