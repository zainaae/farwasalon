import JsonLd from '../json-ld'
import FaqClient from './faq-client'
import { FAQS } from '../../src/faq-data.js'
import { buildFaqPageSchema } from '../../lib/business-schema.js'
import { pageSocialMeta } from '../../lib/page-metadata.js'

const title = 'Salon FAQ Karachi — Prices, Parking & Booking | Farwa'
const description =
  'FAQ for Farwa Beauty Salon PECHS — walk-ins, parking, payment, cancellation, bridal trials, opening hours, and how to book online from Rs 100.'

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/faq' },
  ...pageSocialMeta({
    title,
    description,
    path: '/faq',
    image: '/logo.jpg',
    imageAlt: 'FAQ — Farwa Beauty Salon PECHS Karachi',
  }),
}

export default function FaqPage() {
  const faqSchema = buildFaqPageSchema(FAQS)
  return (
    <>
      {faqSchema && <JsonLd data={faqSchema} />}
      <FaqClient />
    </>
  )
}
