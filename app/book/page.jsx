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

function BookHeading() {
  return (
    <div className="mb-10 md:mb-14 border-b border-border-soft pb-8">
      <h1 className="display-section text-ink mb-4 break-words">
        BOOK<span className="text-border-soft mx-1.5 sm:mx-3 font-light italic text-[0.6em]">—</span>ONLINE
      </h1>
      <p className="text-body max-w-lg">
        Pick a service, choose a date and time, and confirm your appointment in under a minute.
      </p>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <main id="main" className="page-content overflow-x-clip">
        <div className="section-shell section-pad min-h-0 min-w-0 max-w-full overflow-x-clip pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
          <BookHeading />
          {/* Reserve the height the real step-1 picker occupies (measured:
              ~960px mobile / ~770px desktop). Without it the footer sat one
              line below the heading and slammed down on hydration — CLS 0.54
              on the conversion page. */}
          <div className="min-h-[960px] md:min-h-[770px]">
            <p className="text-body" aria-live="polite">Loading booking…</p>
          </div>
        </div>
      </main>
    }>
      <BookClient />
    </Suspense>
  )
}
