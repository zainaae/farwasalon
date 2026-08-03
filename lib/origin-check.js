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

/* Preview deployments for THIS project only. The old blanket
   `origin.endsWith('.vercel.app')` let any free Vercel project POST cross-site,
   so it was not a CSRF control at all. Bound it to the project's own
   farwasalon-<hash>.vercel.app hosts. */
function isProjectPreview(origin) {
  if (!origin.endsWith('.vercel.app')) return false
  try {
    const host = new URL(origin).hostname
    /* Vercel preview hosts look like farwasalon-<hash>.vercel.app and the
       project's own production alias farwasalon.vercel.app. */
    return host === 'farwasalon.vercel.app' || host.startsWith('farwasalon-')
  } catch {
    return false
  }
}

export function isAllowedOrigin(request) {
  const origin = request.headers.get('origin')
  // No Origin header = non-browser request (curl, server-to-server). Allow.
  if (!origin) return true
  // Vercel preview deployments for this project
  if (isProjectPreview(origin)) return true
  return ALLOWED_ORIGINS.has(origin)
}
