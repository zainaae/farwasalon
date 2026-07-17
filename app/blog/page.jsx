import BlogIndexClient from './blog-index-client'
import { pageSocialMeta } from '../../lib/page-metadata.js'

const title = 'Beauty Tips Karachi — Bridal, Skin & Prices | Farwa'
const description =
  'Practical beauty guides from PECHS, Karachi — salon price lists, bridal prep, facials, microblading & “near me” checklists. Honest tips from Farwa Beauty Salon.'

export const metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: '/blog',
    types: { 'application/rss+xml': '/blog/rss.xml' },
  },
  ...pageSocialMeta({
    title,
    description,
    path: '/blog',
    image: '/logo.jpg',
    imageAlt: 'Farwa Beauty Salon Blog — beauty tips for Karachi',
  }),
}

export default function BlogPage() {
  return <BlogIndexClient />
}
