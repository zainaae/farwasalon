import ContactClient from './contact-client'

export const metadata = {
  title: 'Book an Appointment — Farwa Beauty Salon, Karachi',
  description: 'Book your salon visit in PECHS Block 2, Karachi. WhatsApp +92 322 2782254 · Mon–Sat 11am–7pm.',
  alternates: { canonical: 'https://farwasalon.com/contact' },
  openGraph: { images: ['/logo.jpg'] },
}

export default function ContactPage() {
  return <ContactClient />
}
