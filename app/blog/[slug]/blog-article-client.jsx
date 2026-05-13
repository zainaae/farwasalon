'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { WA_DEFAULT } from '../../../src/data.js'
import { BLOG_POSTS } from '../../../src/blog-data.js'

function ArticleJsonLd({ post }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'Farwa Beauty Salon' },
    publisher: {
      '@type': 'Organization',
      name: 'Farwa Beauty Salon',
      logo: { '@type': 'ImageObject', url: 'https://farwasalon.com/logo.jpg' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://farwasalon.com/blog/${post.slug}`,
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function BreadcrumbJsonLd({ items }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default function BlogArticleClient({ slug }) {
  const post = BLOG_POSTS.find((p) => p.slug === slug)

  if (!post) {
    return (
      <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-14 md:py-20 min-h-screen">
          <p className="text-stone text-sm">Article not found.</p>
        </div>
      </main>
    )
  }

  const formatted = new Date(post.date + 'T12:00:00').toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-14 md:py-20 min-h-screen">
        <ArticleJsonLd post={post} />
        <BreadcrumbJsonLd items={[
          { name: 'Home', url: 'https://farwasalon.com/' },
          { name: 'Blog', url: 'https://farwasalon.com/blog' },
          { name: post.title, url: `https://farwasalon.com/blog/${post.slug}` },
        ]} />

        <div className="max-w-2xl">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-[10px] text-stone font-['Inter']">
              <li><Link href="/" className="hover:text-ink transition-colors">Home</Link></li>
              <li><ChevronRight className="w-2.5 h-2.5" /></li>
              <li><Link href="/blog" className="hover:text-ink transition-colors">Blog</Link></li>
              <li><ChevronRight className="w-2.5 h-2.5" /></li>
              <li className="text-ink line-clamp-1">{post.title}</li>
            </ol>
          </nav>

          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/blog"
              className="flex items-center gap-2 text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors mb-8"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> All Articles
            </Link>
          </motion.div>

          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 pb-8 border-b border-[#e4ddd7]"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[9px] tracking-[0.24em] uppercase text-stone font-['Inter'] bg-mist px-2 py-1">
                {post.category}
              </span>
              <span className="text-stone/50 text-[10px] font-['Inter']">{post.readTime}</span>
            </div>
            <h1 className="font-['Unbounded'] font-bold text-2xl md:text-3xl text-ink leading-tight mb-3">
              {post.title}
            </h1>
            <p className="text-stone text-sm font-light">
              Published {formatted} · Farwa Beauty Salon
            </p>
          </motion.header>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose-farwa"
          >
            {post.content.map((block, i) => {
              if (block.type === 'h2') {
                return (
                  <h2
                    key={i}
                    className="font-['Syne'] font-bold text-lg text-ink mt-8 mb-3"
                  >
                    {block.text}
                  </h2>
                )
              }
              return (
                <p
                  key={i}
                  className="text-stone text-[15px] font-light leading-relaxed mb-4 font-['Inter']"
                >
                  {block.text}
                </p>
              )
            })}
          </motion.div>

          <div className="mt-10 pt-8 border-t border-[#e4ddd7] flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <a
              href={WA_DEFAULT}
              target="_blank"
              rel="noreferrer"
              className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-semibold font-['Inter'] px-7 py-4 hover:bg-stone transition-colors"
            >
              Book on WhatsApp <ArrowUpRight className="w-4 h-4" />
            </a>
            <Link
              href="/blog"
              className="text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors"
            >
              ← More articles
            </Link>
          </div>

          {(() => {
            const related = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3)
            return related.length > 0 && (
              <section className="mt-10 pt-8 border-t border-[#e4ddd7]">
                <h2 className="font-['Syne'] font-bold text-base text-ink mb-4">Related Articles</h2>
                <div className="space-y-4">
                  {related.map((p) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`} className="block group">
                      <p className="font-['Syne'] font-bold text-sm text-ink group-hover:text-stone transition-colors leading-snug">{p.title}</p>
                      <p className="text-stone text-xs font-['Inter'] mt-1 line-clamp-1">{p.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })()}
        </div>
      </div>
    </main>
  )
}
