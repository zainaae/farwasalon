import ContactClient from './contact-client'
import { pageSocialMeta } from '../../lib/page-metadata.js'

const title = 'Contact Beauty Salon PECHS — Directions | Farwa'
const description =
  'Visit Farwa Beauty Salon in PECHS Block 3, Karachi. Mon–Sat 11am–7pm. WhatsApp +92 322 278 2254 — or book online for threading, facials, bridal & more.'

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/contact' },
  ...pageSocialMeta({
    title,
    description,
    path: '/contact',
    image: '/logo.jpg',
    imageAlt: 'Contact Farwa Beauty Salon — PECHS Karachi',
  }),
}

export default function ContactPage() {
  return <ContactClient />
}
