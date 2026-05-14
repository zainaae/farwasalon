import FaqClient from './faq-client'
import { FAQS } from '../../src/faq-data.js'

export const metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Farwa Beauty Salon — parking, walk-ins, payment, cancellation, bridal trials, and more.',
  alternates: { canonical: '/faq' },
  openGraph: { type: 'website', images: ['/logo.jpg'] },
}

export default function FaqPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FaqClient />
    </>
  )
}
