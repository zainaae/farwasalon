import { Inter, Fraunces, Syne } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import ClientShell from './client-shell'
import MetaPixel from './components/meta-pixel'
import { StarSymbolDefs } from './components/star-rating.jsx'
import { IconSymbolDefs } from './components/icon-sprite.jsx'
import JsonLd from './json-ld'
import { buildBeautySalonSchema, buildWebSiteSchema } from '../lib/business-schema.js'

/* Inter is body copy — do not race the LCP image/font. Fraunces 700 is the
   display face for the home H1; display:optional avoids holding LCP on a
   late webfont swap (fallback stays if the face isn't ready in time). */
const inter = Inter({
  subsets: ['latin'],
  /* 400 default body; 300 kept for existing font-light utilities;
     500 eyebrows; 600 buttons. */
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
})

const fraunces = Fraunces({
  subsets: ['latin'],
  /* Soft optical serif for brand display. Numerals + letterpress craft depend
     on this face actually loading — swap + preload so mid-range PK mobile
     still gets Fraunces after LCP (stock bridal still is no longer the OG LCP). */
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-syne',
  display: 'swap',
  preload: false,
})

export const metadata = {
  title: {
    default: 'Beauty Salon PECHS Karachi — From Rs 100 | Farwa',
    template: '%s | Farwa Beauty Salon',
  },
  description:
    'Beauty salon in PECHS, Karachi — bridal, facials, threading, waxing & nails since 2008. 102 services from Rs 100. Book online.',
  keywords: [
    'beauty salon Karachi',
    'beauty parlour PECHS',
    'salon near me',
    'bridal makeup Karachi',
    'threading salon PECHS',
    'Farwa Beauty Salon',
  ],
  metadataBase: new URL('https://farwasalon.com'),
  /* OG/Twitter images come from app/opengraph-image.jsx + twitter-image.jsx
     (ImageResponse) — do not pin stock bridal stills here. */
  openGraph: {
    type: 'website',
    siteName: 'Farwa Beauty Salon',
    locale: 'en_PK',
  },
  twitter: {
    card: 'summary_large_image',
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
      className={`${inter.variable} ${fraunces.variable} ${syne.variable}`}
    >
      <head>
        {/* Fonts are self-hosted via next/font — no runtime Google Fonts connection. */}
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
        <StarSymbolDefs />
        <IconSymbolDefs />
        <MetaPixel />
        <ClientShell>{children}</ClientShell>
        <JsonLd data={buildBeautySalonSchema()} />
        <JsonLd data={buildWebSiteSchema()} />
      </body>
    </html>
  )
}
