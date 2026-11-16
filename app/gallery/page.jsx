import GalleryClient from './gallery-client'
import JsonLd from '../json-ld'
import { pageSocialMeta } from '../../lib/page-metadata.js'
import { SITE_ORIGIN, buildSpeakableSchema } from '../../lib/business-schema.js'
import { GALLERY_SHOWCASE_ITEMS } from '../../src/data.js'

/* Owned studio media only — no stock bridal stills in the gallery or OG. */
const title = 'Salon Work Gallery — Farwa Beauty Salon PECHS'
const description =
  'Owned studio work at Farwa Beauty Salon in PECHS, Karachi — nails and craft details. Visit the studio or book online.'
const showcase = GALLERY_SHOWCASE_ITEMS[0]

export const metadata = {
  title,
  description,
  alternates: { canonical: '/gallery' },
  ...pageSocialMeta({
    title,
    description,
    path: '/gallery',
    image: showcase?.src,
    imageAlt: showcase?.alt || 'Studio craft at Farwa Beauty Salon, PECHS Karachi',
  }),
}

export default function GalleryPage() {
  return (
    <>
      <JsonLd
        data={buildSpeakableSchema({
          pageUrl: `${SITE_ORIGIN}/gallery`,
          cssSelectors: ['#gallery-lede'],
          ...(showcase
            ? {
                primaryImagePath: showcase.src,
                primaryImageDescription: showcase.alt,
              }
            : {}),
        })}
      />
      <GalleryClient />
    </>
  )
}
