import HomeHero from './home-hero'
import DealStrip from './components/deal-strip'
import ProofStrip from './components/proof-strip'
/* Static import — not next/dynamic with a loading fallback. That pattern
   streams the placeholder into the initial HTML and only fills below-fold
   after the client chunk; with JS off (crawlers / our SEO e2e) <main> shrunk
   to ~59 words. Client components still SSR; the eight sections already use
   content-visibility: auto so offscreen cost stays low. */
import HomeBelowFold from './home-below-fold'
import { isGooglePlacesConfigured } from '../lib/google-places.js'
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
        <ProofStrip />
        <DealStrip />
        <HomeBelowFold placesEnabled={isGooglePlacesConfigured()} />
      </main>
    </>
  )
}
