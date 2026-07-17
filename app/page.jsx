import HomeClient from './home-client'
import JsonLd from './json-ld'
import { YEARS_ACTIVE } from '../src/site-config.js'
import { GOOGLE_GBP_STATS } from '../src/google-reviews-data.js'
import { pageSocialMeta } from '../lib/page-metadata.js'
import {
  SITE_ORIGIN,
  buildSpeakableSchema,
  buildHeroVideoSchema,
} from '../lib/business-schema.js'

const title = 'Beauty Salon in PECHS Karachi — Bridal, Facials & Threading | Farwa Beauty Salon'
const description = `Farwa Beauty Salon in PECHS, Karachi — trusted since 2008. Bridal makeup, facials, threading, waxing, nails & more. ${YEARS_ACTIVE}+ years. Book online or WhatsApp +92 322 278 2254. ★ ${GOOGLE_GBP_STATS.rating} on Google.`

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/' },
  ...pageSocialMeta({ title, description, path: '/', image: '/bridal.jpg', imageAlt: 'Farwa Beauty Salon — PECHS Karachi' }),
}

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={buildSpeakableSchema({
          pageUrl: `${SITE_ORIGIN}/`,
          cssSelectors: ['#hero-headline', '#hero-lede'],
        })}
      />
      <JsonLd data={buildHeroVideoSchema()} />
      <HomeClient />
    </>
  )
}
