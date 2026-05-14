import BookClient from './book-client'

export const metadata = {
  title: 'Book an Appointment Online — Farwa Beauty Salon',
  description:
    'Book your beauty appointment online at Farwa Beauty Salon, PECHS Block 2, Karachi. Choose from 100+ services — threading, facials, bridal, nails, waxing & more. Instant confirmation.',
  alternates: { canonical: '/book' },
}

export default function BookPage() {
  return <BookClient />
}
