import ServicesClient from './services-client'

export const metadata = {
  title: 'Salon Services in PECHS Karachi — 100+ Treatments',
  description: '13 service categories, 100+ treatments from Rs 100. Bridal packages, facials, threading, waxing, nails, microblading & more at Farwa Beauty Salon, PECHS Block 3. Book online.',
  alternates: { canonical: '/services' },
  openGraph: { type: 'website', images: [{ url: '/glow3.jpg', width: 1200, height: 630, alt: 'Salon services menu — 100+ treatments at Farwa Beauty Salon PECHS Karachi' }] },
}

export default function ServicesPage() {
  return <ServicesClient />
}
