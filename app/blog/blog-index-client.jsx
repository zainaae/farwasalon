'use client'

import Link from 'next/link'
import Image from 'next/image'
import { m } from 'framer-motion'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { useBooking } from '../../src/shared.jsx'
import { BLOG_POSTS } from '../../src/blog-data.js'
import { BreadcrumbJsonLd } from '../json-ld.jsx'

function formatBlogDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-PK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function BlogIndexClient() {
  const booking = useBooking()

  return (
    <main id="main" className="page-content">
      <div className="section-shell section-pad min-h-screen">
        <BreadcrumbJsonLd items={[
          { name: 'Home', url: 'https://farwasalon.com/' },
          { name: 'Blog', url: 'https://farwasalon.com/blog' },
        ]} />

        <div className="mb-10 md:mb-14 border-b border-border-soft pb-8">
          <div className="overflow-hidden">
            <m.h1
              initial={{ y: '60%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="display-section text-ink mb-4"
            >
              BEAUTY TIPS<span className="text-border-soft mx-3 font-light italic text-[0.6em]">—</span>GUIDES
            </m.h1>
          </div>
          <m.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-body max-w-lg"
          >
            Expert advice from our team — bridal prep timelines, skincare for Karachi weather, and professional tips you can use at home.
          </m.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {BLOG_POSTS.map((post, i) => (
            <m.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group border border-border-soft hover:border-ink transition-colors duration-300"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                {post.featuredImage && (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image src={post.featuredImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                )}
                <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-stone text-[10px] font-['Inter']">
                  <span className="tracking-[0.18em] uppercase">{post.category}</span>
                  <span aria-hidden="true" className="text-border-soft">·</span>
                  <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
                  <span aria-hidden="true" className="text-border-soft">·</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="font-['Syne'] font-bold text-base md:text-lg text-ink leading-snug mb-3 group-hover:text-stone transition-colors">
                  {post.title}
                </h2>
                <p className="text-body line-clamp-2 mb-4">
                  {post.description}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.16em] uppercase font-medium font-['Inter'] text-ink group-hover:gap-2 transition-[gap]">
                  Read article <ChevronRight className="w-3 h-3" />
                </span>
                </div>
              </Link>
            </m.article>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-body">
            Have a beauty question? We&apos;d love to answer it.
          </p>
          <button
            onClick={() => booking.open()}
            className="tap-safe btn-primary"
          >
            Book a Consultation <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  )
}
