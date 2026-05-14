import HomeClient from './home-client'
import { YEARS_ACTIVE } from '../src/data.js'

export const metadata = {
  title: { absolute: "Farwa Beauty Salon — Karachi's trusted beauty studio since 2008" },
  description: `Bridal, facials, hair, nails, threading, waxing and more in PECHS Block 2, Karachi. ${YEARS_ACTIVE}+ years of beauty expertise — book directly on WhatsApp.`,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', images: ['/logo.jpg'] },
}

export default function HomePage() {
  return <HomeClient />
}
