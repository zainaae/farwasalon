import BlogIndexClient from './blog-index-client'

export const metadata = {
  title: 'Beauty Tips & Blog — Farwa Beauty Salon, Karachi',
  description: 'Expert beauty tips, bridal prep guides, skincare advice, and salon insights from Farwa Beauty Salon in PECHS Block 2, Karachi.',
  alternates: { canonical: 'https://farwasalon.com/blog' },
  openGraph: { images: ['/logo.jpg'] },
}

export default function BlogPage() {
  return <BlogIndexClient />
}
