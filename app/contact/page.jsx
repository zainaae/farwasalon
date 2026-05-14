import ContactClient from './contact-client'

export const metadata = {
  title: 'Book Appointment — Beauty Salon PECHS Block 3 Karachi',
  description: 'Book your appointment at Farwa Beauty Salon, PECHS Block 3, Karachi. WhatsApp +92 322 2782254. Mon–Sat 11 AM – 7 PM. Bridal, facials, threading & more.',
  alternates: { canonical: '/contact' },
  openGraph: { type: 'website', images: [{ url: '/logo.jpg', width: 1200, height: 630, alt: 'Book an appointment at Farwa Beauty Salon PECHS Block 3 Karachi' }] },
}

export default function ContactPage() {
  return <ContactClient />
}
