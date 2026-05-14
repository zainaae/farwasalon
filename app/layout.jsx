import { Inter, Unbounded, Syne, Noto_Nastaliq_Urdu } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import ClientShell from './client-shell'
import JsonLd from './json-ld'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-unbounded',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-nastaliq',
  display: 'optional',
})

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  name: 'Farwa Beauty Salon',
  image: 'https://farwasalon.com/logo.jpg',
  url: 'https://farwasalon.com/',
  telephone: '+923222782254',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'PECHS Block 2',
    addressLocality: 'Karachi',
    addressRegion: 'Sindh',
    postalCode: '75400',
    addressCountry: 'PK',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 24.8797532,
    longitude: 67.0584185,
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    bestRating: '5',
    worstRating: '1',
    ratingCount: '6',
    reviewCount: '6',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '11:00',
      closes: '19:00',
    },
  ],
  sameAs: [
    'https://www.instagram.com/farwasalon/',
    'https://www.facebook.com/farwasalon',
  ],
  foundingDate: '2008',
  description:
    "Karachi's trusted beauty home since 2008. Bridal, facials, hair, nails, threading, waxing, massage and more.",
  areaServed: {
    '@type': 'City',
    name: 'Karachi',
    containedInPlace: { '@type': 'State', name: 'Sindh' },
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Salon Services',
    itemListElement: [
      {
        '@type': 'OfferCatalog',
        name: 'Bridal',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Bridal Makeup & Styling',
              description:
                'Complete wedding packages — trials, engagement looks, mehndi, and full bridal transformations.',
            },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PKR',
              minPrice: '8000',
              maxPrice: '25000',
            },
          },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Facials',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Facials',
              description: 'Organic, whitening, HD, and anti-ageing facials.',
            },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PKR',
              minPrice: '1400',
              maxPrice: '5500',
            },
          },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Hair',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Hair Services',
              description: 'Cuts, colour, blowdry, styling, and treatments.',
            },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PKR',
              minPrice: '1500',
              maxPrice: '8000',
            },
          },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Nails',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Nails',
              description:
                'Manicures, pedicures, nail art, French tips, and paraffin treatments.',
            },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PKR',
              minPrice: '300',
              maxPrice: '1600',
            },
          },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Threading',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Threading',
              description: 'Precision eyebrow, lip, and full face threading.',
            },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PKR',
              minPrice: '100',
              maxPrice: '1200',
            },
          },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Waxing',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Waxing',
              description:
                'Rica hot wax, honey wax, and body waxing for smooth, lasting results.',
            },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'PKR',
              minPrice: '150',
              maxPrice: '4000',
            },
          },
        ],
      },
    ],
  },
}

export const metadata = {
  title: {
    default: "Farwa Beauty Salon — Karachi's trusted beauty home since 2008",
    template: '%s — Farwa Beauty Salon',
  },
  description:
    "Farwa Beauty Salon in PECHS Block 2, Karachi — 100+ treatments from Rs 100. Bridal makeup, facials, threading, waxing, nails & microblading since 2008. Book on WhatsApp.",
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
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/logo.jpg',
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
      className={`${inter.variable} ${unbounded.variable} ${syne.variable} ${nastaliq.variable}`}
    >
      <head>
        <link rel="preload" as="image" href="/bleachpolish.jpg" fetchPriority="high" />
        <Script
          defer
          data-domain="farwasalon.com"
          src="https://plausible.io/js/script.tagged-events.outbound-links.js"
        />
        <Script id="plausible-setup" strategy="beforeInteractive">
          {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
        </Script>
      </head>
      <body>
        <ClientShell>{children}</ClientShell>
        <Analytics />
        <JsonLd data={localBusinessSchema} />
      </body>
    </html>
  )
}
