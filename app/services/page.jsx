import ServicesClient from './services-client'

export const metadata = {
  title: 'Services — Farwa Beauty Salon, Karachi',
  description: 'Explore our full menu — bridal packages, facials, hair, nails, threading, waxing, massage and more. Book any service directly on WhatsApp.',
  alternates: { canonical: 'https://farwasalon.com/services' },
  openGraph: { images: ['/logo.jpg'] },
}

export default function ServicesPage() {
  return <ServicesClient />
}
