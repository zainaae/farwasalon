import { NextResponse } from 'next/server'
import { isAllowedOrigin } from '../../../lib/origin-check.js'
import { checkRateLimit, getClientIp } from '../../../lib/rate-limit.js'
import { logger, hashIp } from '../../../lib/logger.js'

export const runtime = 'nodejs'

/** Client error-boundary reports → Vercel function logs.
 *  Free error monitoring: search level:error endpoint:/api/log-error in the
 *  Vercel dashboard. Strict caps; no PII beyond a hashed IP. */
export async function POST(request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const ip = getClientIp(request)
  const rl = checkRateLimit(ip, { scope: 'log-error', window: 600, max: 10 })
  if (rl.limited) return new NextResponse(null, { status: 429 })

  let body
  try {
    body = await request.json()
  } catch {
    return new NextResponse(null, { status: 400 })
  }

  const clip = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '')
  logger.error('/api/log-error', 'client-error-boundary', {
    ip: hashIp(ip),
    message: clip(body.message, 300),
    digest: clip(body.digest, 100),
    url: clip(body.url, 200),
    ua: clip(request.headers.get('user-agent') || '', 120),
  })
  return new NextResponse(null, { status: 204 })
}
