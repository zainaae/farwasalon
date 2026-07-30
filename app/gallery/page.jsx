import GalleryClient from './gallery-client'

/* The description used to read "Real work from our Karachi salon". The imagery
   on this page is licensed stock illustrating each service — the salon's own
   client photography lives on Instagram. Claiming otherwise in the one place
   Google quotes verbatim was a straightforward untruth, so the copy now sends
   people to @farwasalon for actual work and describes what this page is. */
export const metadata = {
  title: 'Salon Work Gallery — Bridal, Hair & Facials in Karachi',
  description:
    'See every service Farwa offers in PECHS, Karachi — bridal, hair, facials, threading and nails, with prices. Client photos from the salon are on Instagram @farwasalon.',
  alternates: { canonical: '/gallery' },
  openGraph: { type: 'website', images: [{ url: '/bridal2.jpg', width: 1200, height: 630, alt: 'Bridal, hair and beauty services offered at Farwa Beauty Salon, PECHS Karachi' }] },
}

export default function GalleryPage() {
  return <GalleryClient />
}
