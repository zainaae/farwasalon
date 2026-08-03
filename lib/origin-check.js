/** Allow-list of Origins permitted to POST to authenticated/state-changing endpoints.
 *  Blocks cross-site form spam without full CSRF tokens (no user auth on this site). */
const ALLOWED_ORIGINS = new Set([
  'https://farwasalon.com',
  'https://www.farwasalon.com',
  'http://localhost:3000',
  'http://localhost:3001',
  // Loopback IP variants — Playwright baseURL and Windows (localhost may
  // resolve to ::1 while Next binds IPv4) both reach the app via 127.0.0.1.
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
])

/** Hostname from an Origin / URL string, or null if unparseable. */
function originHost(origin) {
  try {
    return new URL(origin).hostname
  } catch {
    return null
  }
}

/** Strip protocol from VERCEL_URL (deployment host only). */
function vercelDeployHost() {
  const raw = process.env.VERCEL_URL?.trim()
  if (!raw) return null
  if (raw.includes('://')) return originHost(raw.startsWith('http') ? raw : `https://${raw}`)
  return raw.toLowerCase()
}

/** Comma-separated full origins (https://host) for preview / staging allowlist. */
function envAllowedOrigins() {
  const raw = process.env.ALLOWED_BOOKING_ORIGINS?.trim()
  if (!raw) return []
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

/* Preview / Vercel alias hosts for THIS deployment only.
   The old `host.startsWith('farwasalon-')` let anyone create
   farwasalon-evil.vercel.app and POST cross-site. We now allow:
   - exact production alias farwasalon.vercel.app
   - the current deployment host from VERCEL_URL (set by Vercel)
   - explicit ALLOWED_BOOKING_ORIGINS entries
   Custom domain traffic uses ALLOWED_ORIGINS (farwasalon.com). */
function isProjectPreview(origin) {
  if (!origin.endsWith('.vercel.app')) return false
  const host = originHost(origin)
  if (!host) return false
  if (host === 'farwasalon.vercel.app') return true
  const deployHost = vercelDeployHost()
  if (deployHost && host === deployHost) return true
  return false
}

export function isAllowedOrigin(request) {
  const origin = request.headers.get('origin')
  // No Origin header = non-browser request (curl, server-to-server). Allow.
  if (!origin) return true
  if (ALLOWED_ORIGINS.has(origin)) return true
  if (isProjectPreview(origin)) return true
  if (envAllowedOrigins().includes(origin)) return true
  return false
}
