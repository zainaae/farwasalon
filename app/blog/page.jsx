import BlogIndexClient from './blog-index-client'
import { BLOG_POSTS } from '../../src/blog-data.js'
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

/* The index needs seven fields per post to draw a card. Importing BLOG_POSTS
   into the client component shipped all 29 article bodies to the browser to
   render a list of titles. Read here, handed over as props; the component stays
   a client component because it filters and opens the booking modal. */
const CARD_FIELDS = ['slug', 'title', 'description', 'featuredImage', 'date', 'readTime', 'category']

export default function BlogPage() {
  const cards = BLOG_POSTS.map((post) => Object.fromEntries(CARD_FIELDS.map((f) => [f, post[f]])))
  return <BlogIndexClient posts={cards} />
}
