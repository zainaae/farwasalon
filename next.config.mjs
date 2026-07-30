import { getBestLocationRedirects } from './src/location-seo.js'

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io"
  : "'self' 'unsafe-inline' https://plausible.io"

// script-src keeps 'unsafe-inline': a nonce-based CSP would force every page to
// render dynamically (middleware per request), losing static/CDN serving — a bad
// trade for this mostly-static site. Fonts are self-hosted via next/font, so no
// Google Fonts origins are needed.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: https:",
  'frame-src https://www.google.com',
  "connect-src 'self' https://plausible.io https://wa.me",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy,
  },
]

const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    qualities: [50, 55, 60, 65, 75],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  trailingSlash: false,
  redirects: async () => [
    /* /azadi-sale shipped first and was submitted to IndexNow; the campaign is
       branded Freedom Deal to match the poster, so the old URL redirects
       rather than 404s. Both spellings people might type land in the right
       place. */
    /* Campaign name aliases. All 301 to the single canonical page rather than
       existing as separate pages: five near-identical pages competing for the
       same query is keyword cannibalisation, and Google treats thin
       location/name variants of one offer as doorway pages. Redirects capture
       typed traffic, printed URLs and any inbound link with none of that risk. */
    { source: '/azadi-sale', destination: '/freedom-deal', permanent: true },
    { source: '/azadi-deal', destination: '/freedom-deal', permanent: true },
    { source: '/azaadi-sale', destination: '/freedom-deal', permanent: true },
    { source: '/azadi-offer', destination: '/freedom-deal', permanent: true },
    { source: '/jashn-e-azadi', destination: '/freedom-deal', permanent: true },
    { source: '/independence-day-offer', destination: '/freedom-deal', permanent: true },
    { source: '/independence-sale', destination: '/freedom-deal', permanent: true },
    { source: '/14-august-sale', destination: '/freedom-deal', permanent: true },
    { source: '/14-august-offer', destination: '/freedom-deal', permanent: true },
    {
      source: '/team',
      destination: '/about',
      permanent: true,
    },
    {
      source: '/pricing',
      destination: '/prices',
      permanent: true,
    },
    {
      source: '/review',
      destination:
        'https://search.google.com/local/writereview?placeid=ChIJeVyXMig_szoQEKI0TaSkW-U',
      permanent: false,
    },
    // Legacy best-* location matrix → canonical -in-* (even if lander is not a priority hub)
    ...getBestLocationRedirects(),
  ],
  headers: async () => [
    {
      source: '/(.*)',
      headers: securityHeaders,
    },
    {
      source: '/:path*\\.(jpg|jpeg|png|webp|avif|svg|ico|mp4|webm|woff2)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=2592000, stale-while-revalidate=86400',
        },
      ],
    },
  ],
}

export default nextConfig
