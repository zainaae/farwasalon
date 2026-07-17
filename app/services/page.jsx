import ServicesClient from './services-client'
import JsonLd from '../json-ld'
import { buildServicesItemListSchema } from '../../lib/business-schema.js'
import { pageSocialMeta } from '../../lib/page-metadata.js'

const title = 'Salon Services Karachi — 100+ From Rs 100 | Farwa'
const description =
  '100+ salon services in PECHS, Karachi from Rs 100 — bridal, facials, threading, Rica wax, nails & microblading. Transparent PKR prices. Book online.'

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/services' },
  ...pageSocialMeta({
    title,
    description,
    path: '/services',
    image: '/glow3.jpg',
    imageAlt: 'Salon services menu — 100+ treatments at Farwa Beauty Salon PECHS Karachi',
  }),
}

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={buildServicesItemListSchema()} />
      <ServicesClient />
    </>
  )
}
