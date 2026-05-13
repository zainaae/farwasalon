import GalleryClient from './gallery-client'

export const metadata = {
  title: 'Gallery',
  description: 'Real work from our Karachi salon — bridal transformations, hair, facials, nails and more. Follow us @farwasalon for daily updates.',
  alternates: { canonical: '/gallery' },
  openGraph: { type: 'website', images: ['/logo.jpg'] },
}

export default function GalleryPage() {
  return <GalleryClient />
}
