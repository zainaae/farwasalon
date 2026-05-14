import GalleryClient from './gallery-client'

export const metadata = {
  title: 'Salon Work Gallery — Bridal, Hair & Facials in Karachi',
  description: 'Real work from our Karachi salon — bridal transformations, hair, facials, nails and more. See what 18+ years of expertise looks like. Follow @farwasalon.',
  alternates: { canonical: '/gallery' },
  openGraph: { type: 'website', images: [{ url: '/bridal2.jpg', width: 1200, height: 630, alt: 'Gallery — bridal, hair & beauty transformations at Farwa Beauty Salon Karachi' }] },
}

export default function GalleryPage() {
  return <GalleryClient />
}
