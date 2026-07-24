import ContactClient from './contact-client'
import { pageSocialMeta } from '../../lib/page-metadata.js'

const title = 'Contact Beauty Salon PECHS — Directions | Farwa'
const description =
  'Visit Farwa Beauty Salon — Plot 165/G-1, Saima Terrace, Block 3, PECHS, Karachi 75400. Mon–Sat 11–7. WhatsApp +92 322 278 2254. Women-only studio.'

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
