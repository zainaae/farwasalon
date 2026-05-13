import BlogIndexClient from './blog-index-client'

export const metadata = {
  title: 'Beauty Tips & Blog',
  description: 'Expert beauty tips, bridal prep guides, skincare advice, and salon insights from Farwa Beauty Salon in PECHS Block 2, Karachi.',
  alternates: { canonical: '/blog' },
  openGraph: { type: 'website', images: ['/logo.jpg'] },
}

export default function BlogPage() {
  return <BlogIndexClient />
}
