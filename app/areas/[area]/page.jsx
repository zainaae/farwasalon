import Link from 'next/link'
import ArrowUpRight from '../../components/icon-sprite.jsx'
import WaCta from '../../components/wa-cta.jsx'
import PageCloseCta from '../../components/page-close-cta.jsx'
import { notFound } from 'next/navigation'
import { MapPin, Clock, Car } from 'lucide-react'
import { NEIGHBORHOODS, TOP_SERVICES } from '../../../src/location-seo.js'
import { AREA_CONTENT } from '../../../src/area-content.js'
import { CAT_SLUGS, SERVICES, formatPrice, YEARS_ACTIVE, MAPS_LINK, WA_DEFAULT } from '../../../src/data.js'
import JsonLd from '../../json-ld'
import { pageSocialMeta } from '../../../lib/page-metadata.js'
import { BreadcrumbJsonLd } from '../../json-ld.jsx'
import {
  SITE_ORIGIN,
  SALON_ID,
  SALON_ADDRESS_LINES,
  SALON_PHONE_DISPLAY,
} from '../../../lib/business-schema.js'

const areaFor = (slug) => NEIGHBORHOODS.find((n) => n.slug === slug)

function Fact({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      {icon}
      <div>
        <dt className="text-stone text-[10px] tracking-[0.18em] uppercase font-[family-name:var(--font-inter)]">{label}</dt>
        <dd className="text-ink text-sm font-[family-name:var(--font-inter)] mt-0.5">{value}</dd>
      </div>
    </div>
  )
}

export function generateStaticParams() {
  return NEIGHBORHOODS.filter((n) => AREA_CONTENT[n.slug]).map((n) => ({ area: n.slug }))
}

export async function generateMetadata({ params }) {
  const { area: slug } = await params
  const area = areaFor(slug)
  const content = AREA_CONTENT[slug]
  if (!area || !content) return {}
  /* These shipped with a bare `title` string, so the root template appended
     " | Farwa Beauty Salon" and every one of the ten ran 76-77 chars — Google
     truncates around 60. `absolute` is what the rest of the site uses. The
     description was unbudgeted too and ran 183-201 chars against a ~155 limit,
     so the drive time — the one fact that distinguishes these pages — was
     being cut off. Both now match the convention in
     app/services/[categorySlug]/page.jsx. */
  const title = `Beauty Salon for ${area.name} | Farwa PECHS`
  const descHead = `Coming from ${area.name}? Farwa Beauty Salon is ${content.driveTime} away, `
  const descTail = ` Women-only studio in Block 3 PECHS, 100+ services from Rs 100.`
  const routeBudget = 155 - descHead.length - descTail.length
  const route =
    content.route.length <= routeBudget
      ? `${content.route}.`
      : `${content.route.slice(0, Math.max(0, routeBudget - 1)).replace(/[\s,;—-]+\S*$/, '')}….`

  return {
    title: { absolute: title },
    description: `${descHead}${route}${descTail}`,
    alternates: { canonical: `/areas/${slug}` },
    ...pageSocialMeta({
      title,
      description: `${descHead}${route}${descTail}`,
      path: `/areas/${slug}`,
      imageAlt: `Farwa Beauty Salon, PECHS Karachi — serving clients from ${area.name}`,
    }),
  }
}

export default async function AreaPage({ params }) {
  const { area: slug } = await params
  const area = areaFor(slug)
  const content = AREA_CONTENT[slug]
  if (!area || !content) notFound()

  /* The salon does not move. This page describes the journey to one address —
     it never implies a branch, a service area, or an at-home visit, because
     none of those exist and schema that claimed otherwise would be a lie
     Google is well equipped to catch. */
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_ORIGIN}/areas/${slug}`,
    name: `Beauty Salon for ${area.name} — Farwa, Block 3 PECHS`,
    about: { '@id': SALON_ID },
    isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
  }

  return (
    <main id="main" className="page-content">
      <JsonLd data={schema} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: `${SITE_ORIGIN}/` },
          { name: 'Areas', item: `${SITE_ORIGIN}/beauty-salon-karachi` },
          { name: area.name, item: `${SITE_ORIGIN}/areas/${slug}` },
        ]}
      />

      <div className="section-shell section-pad min-h-0">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-2 text-stone text-[11px] font-[family-name:var(--font-inter)]">
            <li><Link href="/" className="link-underline hover:text-ink">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/beauty-salon-karachi" className="link-underline hover:text-ink">Areas</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-ink">{area.name}</li>
          </ol>
        </nav>

        <div className="title-stack mb-5 max-w-2xl">
          <p className="eyebrow">— Coming from {area.name}</p>
          <h1 className="display-page text-ink">
            Beauty Salon for {area.name}
            <span className="block text-stone text-base md:text-lg font-[family-name:var(--font-inter)] font-light mt-2">
              One studio in Block 3, PECHS — {content.driveTime} away
            </span>
          </h1>
        </div>

        <dl className="flex flex-wrap gap-x-8 gap-y-3 mb-8 pb-8 border-b border-border-soft">
          <Fact icon={<Car className="w-4 h-4 text-stone shrink-0 mt-0.5" aria-hidden="true" />}
            label="Distance" value={content.distanceKm} />
          <Fact icon={<Clock className="w-4 h-4 text-stone shrink-0 mt-0.5" aria-hidden="true" />}
            label="Typical drive" value={content.driveTime} />
          <Fact icon={<MapPin className="w-4 h-4 text-stone shrink-0 mt-0.5" aria-hidden="true" />}
            label="Route" value={content.route} />
        </dl>

        <section aria-labelledby="getting-here" className="mb-10 max-w-2xl">
          <h2 id="getting-here" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-lg md:text-xl mb-3">
            Getting here from {area.name}
          </h2>
          <p className="text-body text-sm md:text-[15px] leading-relaxed mb-4">{content.gettingHere}</p>
          <p className="text-body text-sm md:text-[15px] leading-relaxed">{area.blurb}</p>
        </section>

        <section aria-labelledby="worth-it" className="mb-10 max-w-2xl">
          <h2 id="worth-it" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-lg md:text-xl mb-3">
            What is worth booking from this distance
          </h2>
          <p className="text-body text-sm md:text-[15px] leading-relaxed mb-4">{content.worthTheTrip}</p>
          <p className="text-body text-sm md:text-[15px] leading-relaxed">{content.timing}</p>
        </section>

        <section aria-labelledby="services" className="mb-10">
          <h2 id="services" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-lg md:text-xl mb-4">
            Every service, with its price
          </h2>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 max-w-2xl mb-4">
            {TOP_SERVICES.map((svc) => {
              const list = SERVICES[svc.category] ?? []
              const prices = list.map((s) => s.pricePkr).filter(Boolean)
              const floor = prices.length ? formatPrice(Math.min(...prices)) : null
              return (
                <li key={svc.slug}>
                  <Link
                    href={`/services/${CAT_SLUGS[svc.category] ?? 'services'}`}
                    className="tap-safe inline-flex items-center min-h-[44px] link-underline text-ink text-sm font-[family-name:var(--font-inter)]"
                  >
                    {svc.name}
                    {floor && <span className="text-stone ml-2">from {floor}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
          <p className="text-stone text-[13px] font-[family-name:var(--font-inter)] font-light max-w-2xl">
            All 100+ rates stay on the{' '}
            <Link href="/prices" className="link-underline text-ink font-medium">price list</Link> —
            the number you read is the number at the counter.
          </p>
        </section>

        <section aria-labelledby="visit" className="mb-10 max-w-2xl">
          <h2 id="visit" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-lg md:text-xl mb-3">
            One address, {YEARS_ACTIVE} years
          </h2>
          <address className="not-italic text-body text-sm leading-relaxed mb-3">
            {SALON_ADDRESS_LINES.map((line) => <span key={line} className="block">{line}</span>)}
            <span className="block mt-2">{SALON_PHONE_DISPLAY} · Mon–Sat 11am–7pm</span>
          </address>
          <p className="text-stone text-[13px] font-[family-name:var(--font-inter)] font-light">
            Women-only studio. We do not run branches and we do not send anyone to homes —
            every appointment is at Block 3.{' '}
            <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="link-underline text-ink font-medium">
              Open in Google Maps
            </a>
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3 mb-12">
          <Link href="/book" className="tap-safe btn-primary !py-2.5 !px-5">
            Book online <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
          <WaCta href={WA_DEFAULT} from="area-page" className="tap-safe btn-secondary !py-2.5 !px-5">
            WhatsApp
          </WaCta>
          <Link href="/prices" className="tap-safe btn-secondary !py-2.5 !px-5">
            See the price list
          </Link>
        </div>

        <section aria-labelledby="other-areas" className="pt-8 border-t border-border-soft">
          <h2 id="other-areas" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-base mb-3">
            Other areas we see clients from
          </h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {NEIGHBORHOODS.filter((n) => AREA_CONTENT[n.slug] && n.slug !== slug).map((n) => (
              <li key={n.slug}>
                <Link
                  href={`/areas/${n.slug}`}
                  className="tap-safe inline-flex items-center min-h-[44px] link-underline text-stone text-sm font-[family-name:var(--font-inter)] hover:text-ink"
                >
                  {n.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <PageCloseCta
        eyebrow={`— Coming from ${area.name}`}
        title="Book a visit at the PECHS studio"
        body={`${content.driveTime} from ${area.name}. Live slots online, or WhatsApp if you prefer.`}
        waHref={WA_DEFAULT}
        waFrom="area-close"
      />
    </main>
  )
}
