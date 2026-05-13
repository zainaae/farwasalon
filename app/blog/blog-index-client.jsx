'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { useBooking } from '../../src/shared.jsx'
import { BLOG_POSTS } from '../../src/blog-data.js'

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
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

export default function BlogIndexClient() {
  const booking = useBooking()

  return (
    <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-14 md:py-20 min-h-screen">
        <BreadcrumbJsonLd items={[
          { name: 'Home', url: 'https://farwasalon.com/' },
          { name: 'Blog', url: 'https://farwasalon.com/blog' },
        ]} />

        <div className="mb-10 md:mb-14 border-b border-[#e4ddd7] pb-8">
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: '60%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="display-section text-ink mb-4"
            >
              BEAUTY TIPS<span className="text-[#e4ddd7] mx-3 font-light italic text-[0.6em]">—</span>&amp; GUIDES
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-stone text-sm font-light max-w-lg"
          >
            Expert advice from our team — bridal prep timelines, skincare for Karachi weather, and professional tips you can use at home.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {BLOG_POSTS.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group border border-[#e4ddd7] hover:border-ink transition-colors duration-300"
            >
              <Link href={`/blog/${post.slug}`} className="block p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[9px] tracking-[0.24em] uppercase text-stone font-['Inter'] bg-mist px-2 py-1">
                    {post.category}
                  </span>
                  <span className="text-stone/50 text-[10px] font-['Inter']">{post.readTime}</span>
                </div>
                <h2 className="font-['Syne'] font-bold text-base md:text-lg text-ink leading-snug mb-3 group-hover:text-stone transition-colors">
                  {post.title}
                </h2>
                <p className="text-stone text-sm font-light leading-relaxed line-clamp-2 mb-4">
                  {post.description}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.16em] uppercase font-medium font-['Inter'] text-ink group-hover:gap-2 transition-all">
                  Read article <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[#e4ddd7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-stone text-sm font-light font-['Inter']">
            Have a beauty question? We&apos;d love to answer it.
          </p>
          <button
            onClick={() => booking.open()}
            className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-semibold font-['Inter'] px-7 py-4 hover:bg-stone transition-colors"
          >
            Book a Consultation <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  )
}
