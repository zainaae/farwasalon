import Link from 'next/link'
import ArrowUpRight from './icon-sprite.jsx'
import WaCta from './wa-cta.jsx'
import { WA_NUMBER } from '../../src/data.js'

/**
 * Shared ink close for interior money/info pages — Quoti × Farwa north star:
 * decisive Book + WhatsApp pair on ink, no plum, no staccato.
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
}) {
  const wa = waHref || `https://wa.me/${WA_NUMBER}`
  const bookClass =
    'btn-loud btn-loud--light tap-safe w-full sm:w-auto inline-flex items-center justify-center gap-2'

  return (
    <section className="cv-auto grain-on-dark bg-ink py-20 sm:py-24 px-4 sm:px-5 md:px-10 border-t border-white/10">
      <div className="max-w-screen-xl mx-auto flex flex-col items-center text-center gap-8 sm:gap-10">
        <div className="w-full max-w-2xl">
          <p className="text-accent-gold text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-[family-name:var(--font-inter)] mb-4">
            {eyebrow}
          </p>
          <h2
            className="font-[family-name:var(--font-unbounded)] font-bold text-white leading-[1.12] text-balance mx-auto"
            style={{ fontSize: 'clamp(1.75rem, 4.5vw + 0.4rem, 3rem)', letterSpacing: '-0.02em', maxWidth: '18ch' }}
          >
            {title}
          </h2>
          {body ? (
            <p className="text-body mt-4 mx-auto max-w-md text-white/70">{body}</p>
          ) : null}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full max-w-xl">
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
            className="tap-safe inline-flex items-center justify-center gap-2 min-h-14 px-8 py-3.5 text-[13px] tracking-[0.14em] uppercase font-semibold font-[family-name:var(--font-inter)] text-white border border-white/70 hover:bg-white/10 transition-colors w-full sm:w-auto"
          >
            {waLabel}
          </WaCta>
        </div>
      </div>
    </section>
  )
}
