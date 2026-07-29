import Link from 'next/link'
import { SERVICES, CAT_SLUGS, formatPrice } from '../src/data.js'

/* ── The Rate Index — this page's signature ───────────────────────────
   Macrostructure 11 (Catalogue): the page is a visual index of inventory.
   Every other Karachi salon hides its rates behind "DM for price"; the one
   thing they cannot copy without changing their business is a printed rate
   card. So the homepage IS the rate card — a ruled typographic index, not a
   grid of feature cards. Server-rendered, zero JS, tabular figures. */

const ORDER = [
  'Threading', 'Facials', 'Cleansing', 'Bleach & Polish',
  'Rica Hot Wax', 'Honey Wax', 'Rica Wax',
  'Hair', 'Hair Treatments', 'Nails', 'Massage',
  'Eyebrow Tattoo', 'Bridal',
]

const QUOTE_ONLY = [
  { name: 'Party makeup', note: 'by look' },
  { name: 'Keratin smoothing', note: 'by hair length' },
]

function rows() {
  return ORDER.filter((cat) => SERVICES[cat]).map((cat) => {
    const list = SERVICES[cat]
    const prices = list.map((s) => s.pricePkr).filter(Boolean)
    return {
      cat,
      href: `/services/${CAT_SLUGS[cat]}`,
      count: list.length,
      from: prices.length ? Math.min(...prices) : null,
    }
  })
}

export default function HomeRateIndex() {
  const index = rows()
  const total = index.reduce((n, r) => n + r.count, 0)

  return (
    <section
      className="bg-paper border-b border-border-soft"
      aria-labelledby="rate-index-heading"
    >
      <div className="section-shell py-16 md:py-24">
        <div className="max-w-3xl mb-10 md:mb-14">
          <h2
            id="rate-index-heading"
            className="font-['Unbounded'] font-bold text-ink leading-[1.02] tracking-[-0.02em] mb-5"
            style={{ fontSize: 'clamp(1.75rem, 4.6vw, 3.25rem)' }}
          >
            The rate card, printed.
          </h2>
          <p className="text-body md:text-lg leading-relaxed">
            {total} services across {index.length} specialities — every starting
            price in Pakistani Rupees, on the page, before you call. Longer hair or
            larger areas can adjust a quote, and we tell you before we begin.
          </p>
        </div>

        {/* The index itself: rule, name, count, figure. No cards. */}
        <ul className="border-t border-ink/25">
          {index.map(({ cat, href, count, from }) => (
            <li key={cat}>
              <Link
                href={href}
                className="group grid grid-cols-[1fr_auto] items-baseline gap-x-5 gap-y-1 py-4 md:py-[1.35rem] border-b border-border-soft hover:bg-mist/60 transition-colors duration-300 px-1 -mx-1"
              >
                <span className="min-w-0">
                  <span className="block font-['Syne'] font-semibold text-ink text-lg sm:text-xl md:text-[1.65rem] leading-tight">
                    {cat}
                  </span>
                  <span className="block text-stone text-[11px] md:text-xs font-['Inter'] mt-1 tracking-wide">
                    {count} {count === 1 ? 'service' : 'services'}
                  </span>
                </span>
                <span className="text-right whitespace-nowrap">
                  {from !== null && (
                    <>
                      <span className="block text-[9px] md:text-[10px] tracking-[0.22em] uppercase font-['Inter'] text-stone">
                        from
                      </span>
                      <span className="block font-['Unbounded'] font-bold text-ink text-base md:text-xl leading-tight tabular-nums">
                        {formatPrice(from)}
                      </span>
                    </>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* The two honest exceptions — stated, not hidden. */}
        <div className="mt-8 md:mt-10 pt-6 border-t border-ink/25 max-w-3xl">
          <p className="text-[10px] tracking-[0.24em] uppercase font-['Inter'] text-accent-gold-deep mb-3">
            Quoted per person
          </p>
          <ul className="flex flex-wrap gap-x-8 gap-y-2 mb-4">
            {QUOTE_ONLY.map(({ name, note }) => (
              <li key={name} className="text-ink text-sm font-['Inter']">
                {name}{' '}
                <span className="text-stone">— {note}</span>
              </li>
            ))}
          </ul>
          <p className="text-body text-sm max-w-xl">
            These two genuinely vary, so a single printed number would be dishonest
            in one direction or the other. Send the details and the quote comes back
            in minutes — binding, and unchanged at the counter.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3">
          <Link href="/prices" className="tap-safe btn-primary">
            See every price
          </Link>
          <Link
            href="/book"
            className="tap-safe link-underline text-ink text-[12px] tracking-[0.14em] uppercase font-['Inter'] font-medium"
          >
            Book online
          </Link>
        </div>
      </div>
    </section>
  )
}
