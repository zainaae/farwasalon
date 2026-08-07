import GalleryClient from './gallery-client'
import { pageSocialMeta } from '../../lib/page-metadata.js'

/* Owned studio media only — no stock bridal stills in the gallery or OG. */
const title = 'Salon Work Gallery — Farwa Beauty Salon PECHS'
const description =
  'Owned studio work at Farwa Beauty Salon in PECHS, Karachi — nails and craft details. Visit the studio or book online.'

export const metadata = {
  title,
  description,
  alternates: { canonical: '/gallery' },
  ...pageSocialMeta({
    title,
    description,
    path: '/gallery',
    imageAlt: 'Studio craft at Farwa Beauty Salon, PECHS Karachi',
  }),
}

export default function GalleryPage() {
  return <GalleryClient />
}
