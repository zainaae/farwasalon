import { Suspense } from 'react'
import BookClient from './book-client'
import { pageSocialMeta } from '../../lib/page-metadata.js'

const title = 'Book Online — Beauty Salon PECHS Karachi | Farwa'
const description =
  'Book a beauty appointment online at Farwa Beauty Salon, PECHS Karachi. Live slots for threading, facials, bridal, nails & waxing — instant confirmation.'

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/book' },
  ...pageSocialMeta({
    title,
    description,
    path: '/book',
    image: '/bleachpolish.jpg',
    imageAlt: 'Book an appointment at Farwa Beauty Salon',
  }),
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
