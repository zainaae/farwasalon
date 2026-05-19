import { Suspense } from 'react'
import BookClient from './book-client'

export const metadata = {
  title: 'Book an Appointment Online',
  description:
    'Book your beauty appointment online at Farwa Beauty Salon, PECHS, Karachi. Choose from 100+ services — threading, facials, bridal, nails, waxing & more. Instant confirmation.',
  alternates: { canonical: '/book' },
  openGraph: { type: 'website', images: [{ url: '/bleachpolish.jpg', width: 1200, height: 630, alt: 'Book an appointment at Farwa Beauty Salon' }] },
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <main id="main" className="page-content">
        <div className="section-shell section-pad flex items-center justify-center min-h-screen">
          <p className="text-body">Loading booking…</p>
        </div>
      </main>
    }>
      <BookClient />
    </Suspense>
  )
}
