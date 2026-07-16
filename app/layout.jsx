import { Inter, Unbounded, Syne } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import ClientShell from './client-shell'
import JsonLd from './json-ld'
import { buildBeautySalonSchema, buildWebSiteSchema } from '../lib/business-schema.js'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-unbounded',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-syne',
  display: 'swap',
})

export const metadata = {
  title: {
    default: "Farwa Beauty Salon — Karachi's trusted beauty home since 2008",
    template: '%s — Farwa Beauty Salon',
  },
  description:
    "Beauty salon & parlour in PECHS, Karachi — bridal makeup, facials, threading, waxing, nails since 2008. 100+ services from Rs 100. Book online.",
  keywords: [
    'beauty salon Karachi',
    'beauty parlour PECHS',
    'salon near me',
    'bridal makeup Karachi',
    'threading salon PECHS',
    'Farwa Beauty Salon',
  ],
  metadataBase: new URL('https://farwasalon.com'),
  openGraph: {
    type: 'website',
    siteName: 'Farwa Beauty Salon',
    locale: 'en_PK',
    images: [{
      url: '/bridal.jpg',
      width: 1200,
      height: 630,
      alt: 'Farwa Beauty Salon — Bridal, Facials & Threading in PECHS Karachi',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{
      url: '/bridal.jpg',
      alt: 'Farwa Beauty Salon — Bridal, Facials & Threading in PECHS Karachi',
    }],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: '/',
    languages: { 'en-pk': '/' },
  },
  verification: {
    google: 'RU3jY_9wI_1x4XXWI13vu6TI2UHxOHCqqVmFSpR42YY',
  },
  other: {
    'geo.region': 'PK-SD',
    'geo.placename': 'Karachi',
    'geo.position': '24.8797532;67.0584185',
    ICBM: '24.8797532, 67.0584185',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0d0d0d',
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${unbounded.variable} ${syne.variable}`}
    >
      <head>
        {/* Fonts are self-hosted via next/font — no runtime Google Fonts connection. */}
        <link rel="dns-prefetch" href="https://plausible.io" />
        <link rel="preconnect" href="https://plausible.io" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <Script
          defer
          data-domain="farwasalon.com"
          src="https://plausible.io/js/script.tagged-events.outbound-links.js"
          strategy="lazyOnload"
        />
        <Script id="plausible-setup" strategy="lazyOnload">
          {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
        </Script>
      </head>
      <body className="overflow-x-clip">
        <ClientShell>{children}</ClientShell>
        <Analytics />
        <JsonLd data={buildBeautySalonSchema()} />
        <JsonLd data={buildWebSiteSchema()} />
      </body>
    </html>
  )
}
