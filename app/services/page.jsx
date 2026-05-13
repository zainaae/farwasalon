import ServicesClient from './services-client'

export const metadata = {
  title: 'All Services',
  description: 'Explore our full menu — bridal packages, facials, hair, nails, threading, waxing, massage and more. Book any service directly on WhatsApp.',
  alternates: { canonical: '/services' },
  openGraph: { type: 'website', images: ['/logo.jpg'] },
}

export default function ServicesPage() {
  return <ServicesClient />
}
