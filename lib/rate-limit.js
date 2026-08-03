const stores = new Map()
let checkCount = 0

/* Upper bound on tracked keys. Under a spoofed-IP/botnet flood each request
   would otherwise mint a fresh key and grow the map until the 2x-window
   cleanup runs — evicting at insert keeps memory bounded on serverless. */
const MAX_STORES = 5000

/** Real client IP, trusted-platform-header only.
 *
 *  On Vercel, `x-vercel-forwarded-for` is set by the edge and cannot be
 *  influenced by the client. `x-forwarded-for` / `cf-connecting-ip` are
 *  spoofable (first hop is client-controlled), so we deliberately do NOT
 *  fall back to them — a fallback chain is exactly what lets an attacker
 *  rotate IPs per request and defeat every limit. */
export function getClientIp(request) {
  const value = request.headers.get('x-vercel-forwarded-for')
  if (value) {
    const first = value.split(',')[0]?.trim()
    if (first) return first
  }
  return 'unknown'
}

export function checkRateLimit(ip, { scope = '', window = 600, max = 5 } = {}) {
  const now = Date.now()
  const windowMs = window * 1000

  if (++checkCount % 100 === 0) {
    for (const [key, entry] of stores) {
      if (now - entry.at > windowMs * 2) stores.delete(key)
    }
  }

  /* No trustworthy IP header → every such request shares one bucket. Clamp
     the budget hard so a headerless flood can't exhaust per-IP budgets, and
     give that bucket its own scope so a spoofed flood can't poison the
     'unknown' users of one route's budget only — it's shared already. */
  const effectiveMax = ip === 'unknown' ? Math.min(2, max) : max

  /* scope separates endpoints that share a window: /api/book and
     /api/book/cancel both use window:600, so without scope one route's
     traffic would exhaust the other's budget. */
  const key = `${scope}:${window}:${ip}`
  let entry = stores.get(key)

  if (!entry) {
    if (stores.size >= MAX_STORES) {
      /* evict the least-recently-seen entries to stay bounded */
      const oldest = [...stores.entries()].sort((a, b) => a[1].at - b[1].at)[0]
      if (oldest) stores.delete(oldest[0])
    }
    entry = { ts: [now], at: now }
    stores.set(key, entry)
    return { limited: false }
  }

  entry.ts = entry.ts.filter(t => now - t < windowMs)
  entry.ts.push(now)
  entry.at = now

  if (entry.ts.length > effectiveMax) {
    const oldest = entry.ts[0]
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000)
    return { limited: true, retryAfter }
  }

  return { limited: false }
}
