import BookClient from './book-client'

export const metadata = {
  title: 'Book an Appointment Online',
  description:
    'Book your beauty appointment online at Farwa Beauty Salon, PECHS Block 2, Karachi. Choose from 100+ services — threading, facials, bridal, nails, waxing & more. Instant confirmation.',
  alternates: { canonical: '/book' },
  openGraph: { type: 'website', images: [{ url: '/bleachpolish.jpg', width: 1200, height: 630, alt: 'Book an appointment at Farwa Beauty Salon' }] },
}

export default function BookPage() {
  return <BookClient />
}
