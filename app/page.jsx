import { preload } from 'react-dom'
import HomeClient from './home-client'
import { YEARS_ACTIVE } from '../src/data.js'
import { pageSocialMeta } from '../lib/page-metadata.js'

const title = 'Beauty Salon in PECHS Karachi — Bridal, Facials & Threading | Farwa Beauty Salon'
const description = `Farwa Beauty Salon in PECHS, Karachi — trusted since 2008. Bridal makeup, facials, threading, waxing, nails & more. ${YEARS_ACTIVE}+ years. Book online or WhatsApp +92 322 278 2254. ★ 4.9 on Google.`

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/' },
  ...pageSocialMeta({ title, description, path: '/', image: '/bridal.jpg', imageAlt: 'Farwa Beauty Salon — PECHS Karachi' }),
}

export default function HomePage() {
  preload('/bridal2.jpg', { as: 'image', fetchPriority: 'high' })
  return <HomeClient />
}
