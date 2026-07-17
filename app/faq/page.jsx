import JsonLd from '../json-ld'
import FaqClient from './faq-client'
import { FAQS } from '../../src/faq-data.js'
import { buildFaqPageSchema } from '../../lib/business-schema.js'

export const metadata = {
  title: { absolute: 'Common Questions — Farwa Beauty Salon PECHS Karachi' },
  description: 'Frequently asked questions about Farwa Beauty Salon — parking, walk-ins, payment methods, cancellation policy, bridal trials, opening hours, and how to book.',
  alternates: { canonical: '/faq' },
  openGraph: { type: 'website', images: [{ url: '/logo.jpg', width: 1200, height: 630, alt: 'FAQ — Farwa Beauty Salon PECHS Karachi' }] },
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
