import { Suspense } from 'react'
import BookClient from './book-client'

export const metadata = {
  title: 'Book an Appointment Online',
  description:
    'Book your beauty appointment online at Farwa Beauty Salon, PECHS Block 3, Karachi. Choose from 100+ services — threading, facials, bridal, nails, waxing & more. Instant confirmation.',
  alternates: { canonical: '/book' },
  openGraph: { type: 'website', images: [{ url: '/bleachpolish.jpg', width: 1200, height: 630, alt: 'Book an appointment at Farwa Beauty Salon' }] },
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">
        <div className="max-w-screen-xl mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
          <p className="text-stone text-sm font-['Inter']">Loading booking…</p>
        </div>
      </main>
    }>
      <BookClient />
    </Suspense>
  )
}
