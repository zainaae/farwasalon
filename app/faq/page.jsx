import FaqClient from './faq-client'

export const metadata = {
  title: 'FAQ — Farwa Beauty Salon, Karachi',
  description: 'Frequently asked questions about Farwa Beauty Salon — parking, walk-ins, payment, cancellation, bridal trials, and more.',
  alternates: { canonical: 'https://farwasalon.com/faq' },
  openGraph: { images: ['/logo.jpg'] },
}

export default function FaqPage() {
  return <FaqClient />
}
