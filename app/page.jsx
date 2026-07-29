import HomeHero from './home-hero'
import DealStrip from './components/deal-strip'
import HomeClient from './home-client'
import JsonLd from './json-ld'
import { GOOGLE_GBP_STATS } from '../src/google-reviews-data.js'
import { pageSocialMeta } from '../lib/page-metadata.js'
import { SITE_ORIGIN, buildSpeakableSchema } from '../lib/business-schema.js'

const title = 'Beauty Salon PECHS Karachi — From Rs 100 | Farwa'
const description = `Trusted beauty salon in PECHS, Karachi since 2008. Bridal, facials, threading & waxing from Rs 100. ★ ${GOOGLE_GBP_STATS.rating} Google · book online or WhatsApp +92 322 278 2254.`

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
      <main id="main" className="overflow-x-clip max-w-full min-w-0">
        <HomeHero />
        <DealStrip />
        <HomeClient />
      </main>
    </>
  )
}
