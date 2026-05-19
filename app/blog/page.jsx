import BlogIndexClient from './blog-index-client'

export const metadata = {
  title: 'Beauty Tips & Blog',
  description: 'Expert beauty tips, bridal prep guides, skincare advice, and salon insights from Farwa Beauty Salon in PECHS, Karachi.',
  alternates: {
    canonical: '/blog',
    types: { 'application/rss+xml': '/blog/rss.xml' },
  },
  openGraph: { type: 'website', images: [{ url: '/logo.jpg', width: 1200, height: 630, alt: 'Farwa Beauty Salon Blog' }] },
}

export default function BlogPage() {
  return <BlogIndexClient />
}
