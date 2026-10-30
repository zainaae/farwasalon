import Link from 'next/link'
import ArrowUpRight from '../components/icon-sprite.jsx'
import PageCloseCta from '../components/page-close-cta.jsx'
import { MapPin, Clock } from 'lucide-react'
import { AREA_CONTENT } from '../../src/area-content.js'
import { getKeptNeighborhoods, AREAS_HUB_HREF } from '../../lib/location-links.js'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import JsonLd from '../json-ld'
import { BreadcrumbJsonLd } from '../json-ld.jsx'
import {
  SITE_ORIGIN,
  SALON_ID,
  SALON_ADDRESS_LINES,
  SALON_PHONE_DISPLAY,
} from '../../lib/business-schema.js'
import { MAPS_LINK, YEARS_ACTIVE } from '../../src/data.js'

const title = 'Areas We Serve — PECHS Karachi | Farwa'
const description =
  'Farwa Beauty Salon serves greater Karachi from one women-only studio in Block 3 PECHS. Area guides for PECHS, Tariq Road, Bahadurabad & Gulshan — routes, drive times, parking.'

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: AREAS_HUB_HREF },
  ...pageSocialMeta({
    title,
    description,
    path: AREAS_HUB_HREF,
    imageAlt: 'Farwa Beauty Salon PECHS — areas we serve across Karachi',
  }),
}

export default function AreasHubPage() {
  const kept = getKeptNeighborhoods()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_ORIGIN}/areas`,
    name: 'Areas we serve — Farwa Beauty Salon, PECHS',
    about: { '@id': SALON_ID },
    isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
  }

  return (
    <main id="main" className="page-content">
      <JsonLd data={schema} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: `${SITE_ORIGIN}/` },
          { name: 'Areas', item: `${SITE_ORIGIN}/areas` },
        ]}
      />

      <div className="section-shell pt-14 md:pt-[4.5rem] pb-10 md:pb-12 min-h-0">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-2 text-stone text-[11px] font-[family-name:var(--font-inter)]">
            <li><Link href="/" className="link-underline hover:text-ink">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-ink">Areas</li>
          </ol>
        </nav>

        <div className="title-stack mb-5 max-w-2xl border-l-2 border-plum pl-5 lg:pl-6">
          <p className="eyebrow text-plum">— Greater Karachi from PECHS</p>
          <h1 className="display-page text-ink">
            Areas we serve
            <span className="block text-stone text-base md:text-lg font-[family-name:var(--font-inter)] font-light mt-2">
              One women-only studio in Block 3 — we serve greater Karachi from PECHS
            </span>
          </h1>
        </div>

        <p className="text-body text-sm md:text-[15px] leading-relaxed max-w-2xl mb-10">
          Farwa Beauty Salon sits at Plot 165/G-1, Saima Terrace, Block 3 PECHS — minutes from
          Tariq Road and Jheel Park. We do not run branches or at-home parlour visits. Clients
          drive in from across the city; the pages below cover the four catchments with the most
          useful route and timing detail.
        </p>

        <ul className="grid sm:grid-cols-2 gap-6 mb-12 max-w-3xl">
          {kept.map((n) => {
            const content = AREA_CONTENT[n.slug]
            return (
              <li key={n.slug} className="border-b border-border-soft pb-5">
                <Link href={`/areas/${n.slug}`} className="group block tap-safe">
                  <h2 className="font-[family-name:var(--font-syne)] font-semibold text-ink text-lg group-hover:text-plum transition-colors">
                    {n.name}
                    <ArrowUpRight className="inline-block w-3.5 h-3.5 ml-1.5 opacity-40 group-hover:opacity-100" aria-hidden="true" />
                  </h2>
                  <p className="text-stone text-[13px] font-[family-name:var(--font-inter)] mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      {content.driveTime}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      {content.distanceKm}
                    </span>
                  </p>
                  <p className="text-body text-sm mt-2 leading-relaxed line-clamp-3">
                    {n.detail}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>

        <section aria-labelledby="visit-heading" className="mb-10 max-w-2xl">
          <h2 id="visit-heading" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-lg md:text-xl mb-3">
            Visit the PECHS studio
          </h2>
          <address className="not-italic text-body text-sm leading-relaxed mb-3">
            {SALON_ADDRESS_LINES.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
            <span className="block mt-2">{SALON_PHONE_DISPLAY} · Mon–Sat 11am–7pm · {YEARS_ACTIVE} years</span>
          </address>
          <p className="text-stone text-[13px] font-[family-name:var(--font-inter)] font-light">
            Street parking nearby.{' '}
            <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="link-underline text-ink font-medium">
              Open in Google Maps
            </a>
            {' · '}
            <Link href="/beauty-salon-karachi" className="link-underline text-ink font-medium">
              Beauty salon Karachi overview
            </Link>
          </p>
        </section>
      </div>

      <PageCloseCta
        eyebrow="— Coming from across Karachi"
        title="Book a visit at the PECHS studio"
        body="Live slots online, or WhatsApp if you prefer. One address — Block 3 PECHS."
        waFrom="areas-hub-close"
      />
    </main>
  )
}
