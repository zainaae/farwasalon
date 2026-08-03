const stores = new Map()
let checkCount = 0

/** Best-effort real client IP. Prefers the platform headers Vercel/Cloudflare
 *  set at the edge over the client-influenced x-forwarded-for chain. */
export function getClientIp(request) {
  const pick = (header) => {
    const value = request.headers.get(header)
    if (value) {
      const first = value.split(',')[0]?.trim()
      if (first) return first
    }
    return null
  }
  return (
    pick('x-vercel-forwarded-for') ||
    pick('cf-connecting-ip') ||
    pick('x-forwarded-for') ||
    'unknown'
  )
}

export function checkRateLimit(ip, { scope = '', window = 600, max = 5 } = {}) {
  const now = Date.now()
  const windowMs = window * 1000

  if (++checkCount % 100 === 0) {
    for (const [key, entry] of stores) {
      if (now - entry.at > windowMs * 2) stores.delete(key)
    }
  }

  /* scope separates endpoints that share a window: /api/book and
     /api/book/cancel both use window:600, so without scope one route's
     traffic would exhaust the other's budget. */
  const key = `${scope}:${window}:${ip}`
  const entry = stores.get(key)

  if (!entry) {
    stores.set(key, { ts: [now], at: now })
    return { limited: false }
  }

  entry.ts = entry.ts.filter(t => now - t < windowMs)
  entry.ts.push(now)
  entry.at = now
  stores.set(key, entry)

  if (entry.ts.length > max) {
    const oldest = entry.ts[0]
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000)
    return { limited: true, retryAfter }
  }

  return { limited: false }
}
