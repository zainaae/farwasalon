const stores = new Map()
let checkCount = 0

export function checkRateLimit(ip, { window = 600, max = 5 } = {}) {
  const now = Date.now()
  const windowMs = window * 1000

  if (++checkCount % 100 === 0) {
    for (const [key, entry] of stores) {
      if (now - entry.at > windowMs * 2) stores.delete(key)
    }
  }

  const key = `${window}:${ip}`
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
