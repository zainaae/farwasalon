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
  /* One header, and which one is a deploy-target decision rather than a guess.
     Reading only x-vercel-forwarded-for is right ON Vercel and wrong anywhere
     else: off it — local `next start`, a VPS, nginx, Docker — the header is
     absent on every request, every visitor keys to 'unknown', and the clamp
     below caps that shared bucket at 2. The third person to open /book in a
     minute would get a 429 and an empty time grid, with no log and no alarm.
     TRUSTED_IP_HEADER lets an operator name the header their proxy actually
     sets. It is opt-in, not a fallback chain — a chain is what lets an attacker
     rotate headers per request and defeat every limit. */
  const header = process.env.TRUSTED_IP_HEADER?.trim() || 'x-vercel-forwarded-for'
  const value = request.headers.get(header)
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
  entry.at = now

  /* Check before recording. Pushing first meant a customer who tapped "try
     again" after a 429 extended her own lockout to a fresh full window, having
     made only the allowed number of real attempts. A rejected request is not an
     attempt against the budget. */
  if (entry.ts.length >= effectiveMax) {
    const oldest = entry.ts[0]
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000)
    return { limited: true, retryAfter }
  }

  entry.ts.push(now)
  return { limited: false }
}
