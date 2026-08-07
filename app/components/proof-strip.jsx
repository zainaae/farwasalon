import Link from 'next/link'
import { GOOGLE_GBP_STATS } from '../../src/google-reviews-data.js'
import { GOOGLE_REVIEW_LINK } from '../../lib/business-schema.js'
import { YEARS_ACTIVE, MONTHLY_APPOINTMENTS, SERVICES } from '../../src/data.js'

/* Counted, never typed. The stats strip below derives the same figure the
   same way; a literal here would be one more number to keep in sync by hand. */
const SERVICE_COUNT = Object.values(SERVICES).reduce((a, v) => a + v.length, 0)

/**
 * The proof a visitor needs, where they are still deciding whether to read on.
 *
 * All four of these numbers were already on the homepage. The rating sat 5.5
 * viewport-heights down, formatted as a line in the address block and styled
 * like the opening hours; the other three sat in the stats strip below that.
 * By the time anyone met them the decision was mostly made.
 *
 * Every figure is real and comes from the one place that owns it —
 * GOOGLE_GBP_STATS for the rating and count, FOUNDING_YEAR for the years,
 * MONTHLY_APPOINTMENTS for the volume. src/stated-numbers.test.js fails the
 * build if any of them drifts from its source, which is the reason this strip
 * can be trusted at all.
 *
 * It continues the hero's ink field rather than starting another band, so the
 * fold reads as one unit and the page gains a tonal step (ink -> ink -> the
 * campaign green) instead of another edge-to-edge stripe at the same
 * elevation as everything else.
 *
 * No row of stars here. StarRating draws five filled ones, and five filled
 * stars beside "4.6" claims a rating this salon does not have. The glyph in
 * "4.6★" carries the meaning without overstating it, which matters more than
 * decoration on the one strip whose whole job is to be believed.
 */
export default function ProofStrip() {
  const items = [
    {
      key: 'rating',
      lead: `${GOOGLE_GBP_STATS.rating}★`,
      /* Count lives in the reviews section — here the glyph is enough and
         avoids restating "19 Google reviews" under the hero. */
      label: null,
      href: GOOGLE_REVIEW_LINK,
      ariaLabel: `${GOOGLE_GBP_STATS.rating} stars from ${GOOGLE_GBP_STATS.reviewCount} Google reviews`,
    },
    { key: 'years', lead: `${YEARS_ACTIVE}+`, label: 'Years in PECHS' },
    { key: 'volume', lead: `${MONTHLY_APPOINTMENTS.toLocaleString('en-US')}+`, label: 'Appointments a month' },
    { key: 'prices', lead: String(SERVICE_COUNT), label: 'Services, every price printed', href: '/prices' },
  ]

  return (
    <aside className="bg-ink border-t border-white/10" aria-label="Why clients choose Farwa">
      <div className="section-shell py-5 md:py-6">
        {/* Mobile: 2×2 so stats don’t wrap into a messy chip pile.
            Desktop: single centered row with hairlines. */}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-4 md:flex md:flex-wrap md:items-center md:justify-center md:gap-x-10 md:gap-y-3">
          {items.map(({ key, lead, label, href, ariaLabel }, i) => {
            const body = (
              <>
                <span className="font-[family-name:var(--font-unbounded)] font-bold text-white text-[15px] md:text-base leading-none tabular-nums">
                  {lead}
                </span>
                {label ? (
                  <span className="text-white/70 text-[10px] md:text-xs font-[family-name:var(--font-inter)] leading-snug md:leading-none">
                    {label}
                  </span>
                ) : null}
              </>
            )

            return (
              <li key={key} className="flex items-center min-w-0">
                {i > 0 && (
                  <span aria-hidden="true" className="hidden md:block w-px h-6 bg-white/15 mr-10" />
                )}
                {href ? (
                  <Link
                    href={href}
                    {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                    {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
                    className="tap-safe inline-flex flex-col md:flex-row md:items-center gap-1 md:gap-2 hover:opacity-80 transition-opacity min-w-0"
                  >
                    {body}
                  </Link>
                ) : (
                  <span className="inline-flex flex-col md:flex-row md:items-center gap-1 md:gap-2 min-w-0">
                    {body}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
