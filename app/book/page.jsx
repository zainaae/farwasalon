import { Suspense } from 'react'
import Link from 'next/link'
import WaCta from '../components/wa-cta.jsx'
import { SERVICES, WA_NUMBER } from '../../src/data.js'
import { SALON_PHONE_DISPLAY } from '../../lib/business-schema.js'

/* Counted, never typed — same derivation the proof strip and stats use. */
const SERVICE_COUNT = Object.values(SERVICES).reduce((a, v) => a + v.length, 0)
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
    <div className="mb-10 md:mb-14 border-b border-border-soft pb-8 title-stack">
      <h1 className="display-page text-ink break-words">
        Book online
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
          {/* The reserved box used to hold nothing but "Loading booking…", which
              made /book the thinnest indexable URL on the site — 21 words of
              server-rendered text on the conversion page, in the sitemap, with
              a soft-404 shape. It is also what a visitor sees first on a slow
              Karachi connection, and what they are left with entirely if
              hydration fails.

              These are facts, not filler: they hold the space, they answer the
              questions someone on this page is actually asking, and they give
              a working path to booking that does not depend on JavaScript. */}
          <div className="min-h-[960px] md:min-h-[770px]">
            <p className="text-body" aria-live="polite">Loading the live slot picker…</p>
            <div className="mt-8 max-w-2xl">
              <p className="text-body">
                Every service is bookable online with a real slot — {SERVICE_COUNT} of them, from Rs 100.
                We are open Monday to Saturday, 11 AM to 7 PM, and closed on Sunday.
              </p>
              <p className="text-body mt-4">
                Booking takes about a minute and confirms immediately. You can pick several
                services in one appointment and the total updates as you go. There is no deposit
                and nothing to pay online — you settle at the counter, at the printed rate.
              </p>
              <p className="text-body mt-4">
                If the picker does not load, or you would rather just ask,{' '}
                <WaCta
                  href={`https://wa.me/${WA_NUMBER}`}
                  from="book-fallback"
                  className="link-underline text-ink font-medium"
                >
                  message us on WhatsApp
                </WaCta>{' '}
                or call{' '}
                <a href="tel:+923222782254" className="link-underline text-ink font-medium">
                  {SALON_PHONE_DISPLAY}
                </a>. Walk-ins are welcome when we have room.
              </p>
              <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link href="/prices" className="tap-safe link-underline text-stone hover:text-ink">
                  Full price list
                </Link>
                <Link href="/services" className="tap-safe link-underline text-stone hover:text-ink">
                  Browse services
                </Link>
                <Link href="/faq" className="tap-safe link-underline text-stone hover:text-ink">
                  Common questions
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    }>
      <BookClient />
    </Suspense>
  )
}
