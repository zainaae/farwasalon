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

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false,
  },
  trailingSlash: false,
  redirects: async () => [
    {
      source: '/team',
      destination: '/about',
      permanent: true,
    },
    {
      source: '/review',
      destination:
        'https://search.google.com/local/writereview?placeid=ChIJeVyXMig_szoQEKI0TaSkW-U',
      permanent: false,
    },
  ],
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Content-Security-Policy',
          value: contentSecurityPolicy,
        },
      ],
    },
  ],
}

export default nextConfig
