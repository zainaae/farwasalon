import HomeClient from './home-client'
import { YEARS_ACTIVE } from '../src/data.js'

export const metadata = {
  title: { absolute: 'Beauty Salon in PECHS Karachi — Bridal, Facials & Threading | Farwa Beauty Salon' },
  description: `Farwa Beauty Salon in PECHS Block 3, Karachi — trusted since 2008. Expert bridal makeup, facials, threading, waxing, nails & eyebrow tattoo. ${YEARS_ACTIVE}+ years serving women across Karachi. Book via WhatsApp today.`,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', images: [{ url: '/bridal.jpg', width: 1200, height: 630, alt: 'Farwa Beauty Salon — Bridal makeup & beauty services in PECHS Karachi' }] },
}

export default function HomePage() {
  return <HomeClient />
}
