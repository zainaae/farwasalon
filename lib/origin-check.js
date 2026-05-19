/** Allow-list of Origins permitted to POST to authenticated/state-changing endpoints.
 *  Blocks cross-site form spam without full CSRF tokens (no user auth on this site). */
const ALLOWED_ORIGINS = new Set([
  'https://farwasalon.com',
  'https://www.farwasalon.com',
  'http://localhost:3000',
  'http://localhost:3001',
])

export function isAllowedOrigin(request) {
  const origin = request.headers.get('origin')
  // No Origin header = non-browser request (curl, server-to-server). Allow.
  if (!origin) return true
  // Vercel preview deployments
  if (origin.endsWith('.vercel.app')) return true
  return ALLOWED_ORIGINS.has(origin)
}
