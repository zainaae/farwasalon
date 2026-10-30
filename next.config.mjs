import {
  getBestLocationRedirects,
  getServiceAreaRedirects,
  getRetiredAreaRedirects,
} from './src/location-seo.js'
import { toCanonicalUrl } from './lib/canonical-origin.js'

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://connect.facebook.net"
  : "'self' 'unsafe-inline' https://plausible.io https://connect.facebook.net"

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
  /* connect.facebook.net is listed even though the pixel is not enabled yet:
     the moment NEXT_PUBLIC_META_PIXEL_ID is set in Vercel the pixel injects a
     script from that host, and without these entries CSP blocks it silently —
     no error, no events, and nothing obvious to debug. */
  /* *.supabase.co — staff auth for /admin (anon key + Auth REST). */
  "connect-src 'self' https://plausible.io https://wa.me https://connect.facebook.net https://www.facebook.com https://*.supabase.co wss://*.supabase.co",
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
    /* Freedom Deal (5–14 Aug 2026) has ended. Canonical /freedom-deal and every
       Azadi alias 301 to /deals so crawlers stop indexing an ended offer page.
       Absolute apex destinations avoid www → relative Location redirect errors. */
    { source: '/freedom-deal', destination: toCanonicalUrl('/deals'), permanent: true },
    { source: '/azadi', destination: toCanonicalUrl('/deals'), permanent: true },
    { source: '/azadi-sale', destination: toCanonicalUrl('/deals'), permanent: true },
    { source: '/azadi-deal', destination: toCanonicalUrl('/deals'), permanent: true },
    { source: '/azaadi-sale', destination: toCanonicalUrl('/deals'), permanent: true },
    { source: '/azadi-offer', destination: toCanonicalUrl('/deals'), permanent: true },
    { source: '/freedom', destination: toCanonicalUrl('/deals'), permanent: true },
    { source: '/jashn-e-azadi', destination: toCanonicalUrl('/deals'), permanent: true },
    { source: '/independence-day-offer', destination: toCanonicalUrl('/deals'), permanent: true },
    { source: '/independence-sale', destination: toCanonicalUrl('/deals'), permanent: true },
    { source: '/14-august-sale', destination: toCanonicalUrl('/deals'), permanent: true },
    { source: '/14-august-offer', destination: toCanonicalUrl('/deals'), permanent: true },
    {
      /* Retired: a 151-word post competing with the substantial Rica-vs-honey
         guide for the same query. Its full-body angle was absorbed there, so
         this 301 consolidates the signal instead of splitting it. */
      source: '/blog/full-body-wax-honey-vs-rica-karachi',
      destination: toCanonicalUrl('/blog/rica-wax-vs-honey-wax-karachi'),
      permanent: true,
    },
    {
      source: '/team',
      destination: toCanonicalUrl('/about'),
      permanent: true,
    },
    {
      source: '/pricing',
      destination: toCanonicalUrl('/prices'),
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
