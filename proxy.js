import { NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware.js'

const BOT_AGENTS = /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|msnbot|facebot|ia_archiver/i
const CANONICAL_HOST = 'farwasalon.com'

/**
 * Next.js 16 network boundary (formerly middleware).
 * Keeps www→apex + bot headers; gates /admin via Supabase staff session.
 */
export async function proxy(request) {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase() ?? ''
  if (host === `www.${CANONICAL_HOST}`) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.host = CANONICAL_HOST
    return NextResponse.redirect(url, 308)
  }

  const pathname = request.nextUrl.pathname
  if (pathname.startsWith('/admin')) {
    return updateSession(request)
  }

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
    // Skip static assets and XML sitemaps/RSS — crawlers hit these hard; keep them off the proxy path.
    '/((?!_next/static|_next/image|favicon\\.svg|favicon-32\\.png|logo\\.jpg|sitemap.*\\.xml|.*\\.(?:jpg|jpeg|png|gif|svg|mp4|webp|ico|xml)).*)',
  ],
}
