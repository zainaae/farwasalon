import FaqClient from './faq-client'

export const metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Farwa Beauty Salon — parking, walk-ins, payment, cancellation, bridal trials, and more.',
  alternates: { canonical: '/faq' },
  openGraph: { type: 'website', images: ['/logo.jpg'] },
}

export default function FaqPage() {
  return <FaqClient />
}
