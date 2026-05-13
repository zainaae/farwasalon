import GalleryClient from './gallery-client'

export const metadata = {
  title: 'Gallery — Farwa Beauty Salon, Karachi',
  description: 'Real work from our Karachi salon — bridal transformations, hair, facials, nails and more. Follow us @farwasalon for daily updates.',
  alternates: { canonical: 'https://farwasalon.com/gallery' },
  openGraph: { images: ['/logo.jpg'] },
}

export default function GalleryPage() {
  return <GalleryClient />
}
