import Link from 'next/link'
import ArrowUpRight from './icon-sprite.jsx'
import WaCta from './wa-cta.jsx'
import { WA_NUMBER } from '../../src/data.js'

/**
 * Shared close for interior money/info pages — Farwa theme master:
 * decisive Book + WhatsApp on logo plum-deep. Asymmetric layout (not a
 * centered SaaS CTA slab). No purple wash, no glassmorphism.
 */
export default function PageCloseCta({
  eyebrow = '— Visit us in PECHS',
  title = 'Book online in under a minute',
  body = 'No prepayment. Cancel free up to 2 hours before. Or message us on WhatsApp — whichever is easier for you.',
  bookHref = '/book',
  bookLabel = 'Book an Appointment',
  waHref,
  waFrom = 'page-close',
  waLabel = 'WhatsApp us',
  onBookClick,
  children,
}) {
  const wa = waHref || `https://wa.me/${WA_NUMBER}`
  const bookClass =
    'btn-loud btn-loud--light tap-safe w-full sm:w-auto inline-flex items-center justify-center gap-2'

  return (
    <section
      className="cv-auto living-band--deep grain-on-dark border-t border-white/10 py-16 sm:py-20 md:py-24 px-4 sm:px-5 md:px-10"
    >
      <div className="max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
        <div className="lg:col-span-7">
          <p className="text-accent-gold text-[10px] sm:text-[11px] tracking-[0.22em] uppercase font-[family-name:var(--font-inter)] mb-4">
            {eyebrow}
          </p>
          <h2
            className="font-[family-name:var(--font-fraunces)] font-bold text-white leading-[1.12] text-balance"
            style={{ fontSize: 'clamp(1.75rem, 4.5vw + 0.4rem, 3rem)', letterSpacing: '-0.02em', maxWidth: '14ch' }}
          >
            {title}
          </h2>
          {body ? (
            <p className="text-body mt-4 max-w-md text-white/70">{body}</p>
          ) : null}
        </div>
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="cta-cluster w-full">
            {onBookClick ? (
              <button type="button" onClick={onBookClick} className={bookClass}>
                {bookLabel} <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>
            ) : (
              <Link href={bookHref} className={bookClass}>
                {bookLabel} <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </Link>
            )}
            <WaCta
              href={wa}
              from={waFrom}
              className="btn-ghost-on-dark tap-safe w-full sm:w-auto"
            >
              {waLabel}
            </WaCta>
          </div>
          {children}
        </div>
      </div>
    </section>
  )
}
