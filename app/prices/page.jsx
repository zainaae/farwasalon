import Link from 'next/link'
import ArrowUpRight from '../components/icon-sprite.jsx'
import WaCta from '../components/wa-cta.jsx'
import { SERVICES, CAT_SLUGS, formatServicePrice, formatDuration, YEARS_ACTIVE } from '../../src/data.js'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import { LAST_SERVICE_UPDATE } from '../../lib/sitemap-data.js'
import JsonLd from '../json-ld'
import {
  buildFaqPageSchema,
  getAggregateRating,
  SERVICE_BOUNDARIES,
} from '../../lib/business-schema.js'
import { buildPriceListSchema, getMenuStats } from '../../lib/service-schema.js'
import { PRICES_PAGE_FAQS } from '../../src/faq-data.js'
import QuoteBuilder from './quote-builder'
import DealBanner from '../components/deal-banner'
import PageCloseCta from '../components/page-close-cta.jsx'
import { hairQuotePath, isHairQuoteCategory } from '../../lib/quote-request.js'

const title = 'Salon Price List Karachi 2026 — From Rs 100 | Farwa'
const description =
  'Full published price list — PECHS Karachi. Threading from Rs 100, facials from Rs 1,400, bridal from Rs 8,000. Every rate on the page. No hidden charges.'

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/prices' },
  ...pageSocialMeta({
    title,
    description,
    path: '/prices',
    imageAlt: 'Published salon price list — Farwa Beauty Salon PECHS Karachi',
  }),
}

const UPDATED = formatListDate(LAST_SERVICE_UPDATE)

/* The "updated" eyebrow must agree with the sitemap <lastmod> for the menu.
   Both read LAST_SERVICE_UPDATE, so a menu edit bumps one constant and both
   surfaces follow — the page cannot claim a fresher date than the sitemap
   does, or vice versa. */
function formatListDate(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(y, m - 1, d))
}

export default function PricesPage() {
  const categories = Object.keys(SERVICES)
  const faqSchema = buildFaqPageSchema(PRICES_PAGE_FAQS)
  const rating = getAggregateRating()
  /* Counted from SERVICES at build time, never typed. The claim and the table
     below it are the same list, so the claim cannot go stale while the list
     grows — which is exactly how "102" got out of step once already. */
  const menu = getMenuStats()
  return (
    <main id="main" className="page-content">
      {faqSchema && <JsonLd data={faqSchema} />}
      <JsonLd data={buildPriceListSchema()} />
      <div className="section-shell pt-14 md:pt-[4.5rem] pb-8 md:pb-10 min-h-0">
        <div className="title-stack mb-3 max-w-2xl border-l-2 border-plum pl-5 lg:pl-6">
          <p className="eyebrow text-plum">— Price list · updated {UPDATED}</p>
          <p className="numeral-hero text-ink mb-2" aria-hidden="true">
            {menu.total}
          </p>
          <h1 className="display-page text-ink">
            Printed prices — every service on the menu
          </h1>
          <p className="text-body md:text-lg leading-relaxed">
            This is the full published price list for Farwa Beauty Salon in Block 3 PECHS, Karachi:
            all <strong className="font-medium text-ink">{menu.total} services</strong> across{' '}
            {menu.categories} categories, and <strong className="font-medium text-ink">every one of
            them carries a printed price</strong> in Pakistani Rupees. No hidden quotes.
          </p>
        </div>
        <p className="text-body text-sm max-w-2xl mb-3 leading-relaxed">
          {menu.fixed} of those are fixed rates — what the list says is what you pay. The
          remaining {menu.startingFrom}{' '}are hair, hair-treatment, and bridal services shown as
          &ldquo;from&rdquo;, because length and density genuinely change the work; that figure is
          a floor and it is confirmed with you before anything starts.
        </p>
        <p className="text-stone text-sm font-[family-name:var(--font-inter)] font-light max-w-2xl mb-6 leading-relaxed">
          {YEARS_ACTIVE}+ years · women-only studio · {rating.ratingValue}★ · {rating.reviewCount} Google reviews · cash, JazzCash, EasyPaisa · Mon–Sat 11–7
        </p>

        {/* Mobile sticky already is Call / WhatsApp / Book — stacking the same
            pair here made fold 1 a CTA pile. Desktop keeps both. */}
        <div className="cta-cluster mb-8 hidden md:flex">
          <Link href="/book" className="tap-safe btn-loud w-full sm:w-auto justify-center">
            Book online <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <WaCta href="https://wa.me/923222782254" from="prices-quote"
            className="tap-safe btn-secondary w-full sm:w-auto justify-center">
            Ask on WhatsApp
          </WaCta>
        </div>
      </div>

      {/* Same DealStrip as home — full-bleed Azadi band, shared section-shell. */}
      <div className="mb-10 md:mb-12">
        <DealBanner from="prices" />
      </div>

      <div className="section-shell pb-10 md:pb-12 min-h-0">
        {/* Only the pill row sticks. The label and the guide link used to sit
            inside the sticky box too, which made it 144px tall on a phone —
            with the 57px header that is 198px of permanent chrome, 24% of a
            390x844 viewport, on the longest page of the site. They are
            ordinary flow content now and the sticky element is one row. */}
        <p className="text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone mb-2.5">Jump to category</p>
        <nav aria-label="Price list categories" className="w-full">
          <ul className="tab-scroller text-sm font-[family-name:var(--font-inter)] pb-1">
            <li>
              <a href="#quote" className="tap-safe tab-pill inline-flex items-center">
                Quote builder
              </a>
            </li>
            {categories.map((cat) => (
              <li key={cat}>
                <a
                  href={`#prices-${CAT_SLUGS[cat]}`}
                  className="tap-safe tab-pill inline-flex items-center"
                >
                  {cat === 'Eyebrow Tattoo' ? 'Microblading' : cat}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-3 mb-12 text-stone text-sm font-light">
          How to read a rate list:{' '}
          <Link href="/blog/salon-price-list-karachi-2026" className="link-underline hover:text-ink text-ink font-medium">
            Salon Price List Karachi 2026 guide
          </Link>
        </p>

        <QuoteBuilder />

        <section className="flow panel-soft p-5 md:p-6 shadow-soft" aria-labelledby="prices-bridal-strip">
          <h2 id="prices-bridal-strip" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-lg mb-2">
            Bridal packages
          </h2>
          <p className="text-body text-sm mb-3">
            Full Bridal Package <strong className="text-ink font-medium">from Rs 25,000</strong> — about five hours covering hair, makeup, draping, touch-ups and event presence.
            Separate SKUs: Bridal Trial, Mehndi / Dholki, and Engagement looks — each a starting floor; final quote before the day. See the bridal page for inclusions.
          </p>
          <Link href="/bridal" className="btn-secondary !py-2 !px-4">
            Bridal makeup packages <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </section>

        <div className="grid gap-12 md:gap-14">
          {categories.map((cat) => (
            <section key={cat} aria-labelledby={`prices-${CAT_SLUGS[cat]}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/30 pb-2.5 mb-4">
                <h2 id={`prices-${CAT_SLUGS[cat]}`} className="font-[family-name:var(--font-syne)] font-semibold text-ink text-xl md:text-2xl">
                  {cat}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <Link
                    href={`/book?category=${encodeURIComponent(cat)}`}
                    className="tap-safe inline-flex min-h-[44px] items-center text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] font-semibold text-ink hover:text-stone transition-colors"
                  >
                    Book {cat === 'Eyebrow Tattoo' ? 'brows' : cat}
                  </Link>
                  {isHairQuoteCategory(cat) && (
                    <a
                      href="#quote"
                      className="tap-safe inline-flex min-h-[44px] items-center text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone hover:text-ink transition-colors"
                    >
                      Get a quote
                    </a>
                  )}
                  <Link href={`/services/${CAT_SLUGS[cat]}`}
                    className="tap-safe inline-flex min-h-[44px] items-center text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone hover:text-ink transition-colors">
                    About →
                  </Link>
                </div>
              </div>
              <ul className="flex flex-col gap-3" aria-label={`${cat} prices`}>
                {SERVICES[cat].map((s) => (
                  <li key={s.id} className="price-rail border-b border-border-soft pb-3 last:border-0">
                    <div className="price-rail__name min-w-0">
                      <span className="text-ink text-[14px] sm:text-[15px] font-[family-name:var(--font-inter)] font-light">
                        {s.name}
                      </span>
                      {s.durationMinutes ? (
                        <span className="block text-stone text-[11px] font-[family-name:var(--font-inter)] tabular-nums mt-0.5">
                          {formatDuration(s.durationMinutes)}
                        </span>
                      ) : null}
                    </div>
                    <span className="price-rail__leader" aria-hidden="true" />
                    <span className="price-rail__price">{formatServicePrice(s)}</span>
                    <span className="shrink-0 ml-2 inline-flex flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-x-2.5">
                      <Link
                        href={`/book?service=${encodeURIComponent(s.name)}&category=${encodeURIComponent(cat)}`}
                        className="tap-safe text-[10px] tracking-[0.14em] uppercase font-semibold text-plum hover:text-ink"
                      >
                        Book
                      </Link>
                      {isHairQuoteCategory(cat) && (
                        <Link
                          href={hairQuotePath(s.id)}
                          className="tap-safe text-[10px] tracking-[0.14em] uppercase text-stone hover:text-ink font-normal"
                        >
                          Get quote
                        </Link>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* The other half of a complete price list is what is not on it. Same
            source as the `additionalProperty` boundaries in the salon JSON-LD,
            so the visible text and the machine-readable claim cannot disagree. */}
        <section className="mt-24 md:mt-[7.5rem] max-w-2xl" aria-labelledby="prices-not-offered">
          <h2 id="prices-not-offered" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-xl md:text-2xl mb-3">
            What is not on this list
          </h2>
          <p className="text-body text-sm mb-4">
            A price list is only complete if it also says where it stops. These are the things
            people ask for that we do not do, or do not print:
          </p>
          <dl className="space-y-3">
            {SERVICE_BOUNDARIES.map((b) => (
              <div key={b.name} className="text-sm">
                <dt className="font-[family-name:var(--font-syne)] font-bold text-ink inline">{b.name}: </dt>
                <dd className="text-body inline">{b.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-24 md:mt-[7.5rem] pt-10 border-t border-border-soft" aria-labelledby="prices-faq-heading">
          <h2 id="prices-faq-heading" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-xl md:text-2xl mb-6">
            Price questions
          </h2>
          <dl className="space-y-5 max-w-lg">
            {PRICES_PAGE_FAQS.map((f) => (
              <div key={f.q}>
                <dt className="font-[family-name:var(--font-syne)] font-bold text-sm text-ink">{f.q}</dt>
                <dd className="mt-1.5 text-body">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-10 text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone max-w-2xl">
          All prices in Pakistani Rupees (Rs). Cash, JazzCash and EasyPaisa accepted at the salon.
          Listed rates are starting prices, not a tax invoice.
        </p>
        <p className="mt-4 text-[12px] text-stone font-[family-name:var(--font-inter)] font-light max-w-2xl">
          Special works and hair floors —{' '}
          <a href="#quote" className="link-underline text-ink font-medium">Get a quote</a>
          {' '}·{' '}
          <Link href="/blog/party-makeup-karachi-guide" className="link-underline text-ink font-medium">party makeup</Link>
          {' · '}
          <Link href="/blog/keratin-treatment-price-karachi" className="link-underline text-ink font-medium">keratin</Link>
          {' · '}
          <Link href="/blog/haircut-blowdry-hair-colour-cost-karachi" className="link-underline text-ink font-medium">haircut &amp; colour</Link>
        </p>
        <p className="mt-6 pt-6 border-t border-border-soft text-xs text-stone font-[family-name:var(--font-inter)] flex flex-wrap gap-x-3 gap-y-2">
          <Link href="/book" className="link-underline hover:text-ink font-medium">Book online</Link>
          <Link href="/bridal" className="link-underline hover:text-ink font-medium">Bridal makeup</Link>
          <Link href="/blog/manicure-pedicure-price-list-karachi" className="link-underline hover:text-ink font-medium">Nails price guide</Link>
          <Link href="/blog/face-bleach-karachi-loreal" className="link-underline hover:text-ink font-medium">Face bleach</Link>
          <Link href="/blog/full-body-massage-karachi-women-salon" className="link-underline hover:text-ink font-medium">Massage</Link>
          <Link href="/blog/haircut-blowdry-hair-colour-cost-karachi" className="link-underline hover:text-ink font-medium">Haircut &amp; colour</Link>
          <Link href="/beauty-salon-karachi" className="link-underline hover:text-ink font-medium">Beauty salon Karachi</Link>
        </p>
      </div>

      <PageCloseCta waFrom="prices-footer" />
    </main>
  )
}
