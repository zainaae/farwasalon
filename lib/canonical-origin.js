/** Apex host for permanent redirects and sitemap URLs. */
export const CANONICAL_ORIGIN = 'https://farwasalon.com'

/**
 * Absolute URL on the apex host. Relative Location headers from next.config
 * redirects keep the request on `www` when that host serves the app, so
 * Googlebot sees www-alias → www-canonical → apex (a chain / Redirect error).
 * Absolute destinations collapse that to one hop from either host.
 */
export function toCanonicalUrl(pathOrUrl) {
  if (!pathOrUrl) return CANONICAL_ORIGIN
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${CANONICAL_ORIGIN}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`
}
