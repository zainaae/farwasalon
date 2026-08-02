import GalleryClient from './gallery-client'

/* Imagery here illustrates services — not claimed as client before/afters.
   Keep the SERP blurb quiet: studio framing + book path, no Instagram-as-proof. */
export const metadata = {
  title: 'Salon Work Gallery — Bridal, Hair & Facials in Karachi',
  description:
    'Services at Farwa Beauty Salon in PECHS, Karachi — bridal, hair, facials, threading and nails. Visit the studio or book online.',
  alternates: { canonical: '/gallery' },
  openGraph: { type: 'website', images: [{ url: '/bridal2.jpg', width: 1200, height: 630, alt: 'Bridal, hair and beauty services offered at Farwa Beauty Salon, PECHS Karachi' }] },
}

export default function GalleryPage() {
  return <GalleryClient />
}
