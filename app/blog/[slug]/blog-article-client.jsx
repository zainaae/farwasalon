'use client'

import Link from 'next/link'
import Image from 'next/image'
import { m } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { WA_DEFAULT, YEARS_ACTIVE, CAT_SLUGS, CAT_META } from '../../../src/data.js'
import { BLOG_POSTS } from '../../../src/blog-data.js'
import { BreadcrumbJsonLd } from '../../json-ld.jsx'
import { buildArticleSchema, countBlogWords } from '../../../lib/business-schema.js'

function getRelatedPosts(post, currentSlug, limit = 3) {
  const others = BLOG_POSTS.filter((p) => p.slug !== currentSlug)
  const sameCategory = others.filter((p) => p.category === post.category)
  const relatedCats = new Set(post.relatedCategories || [])
  const sameCategorySlugs = new Set(sameCategory.map((p) => p.slug))
  const byServiceOverlap = others.filter(
    (p) =>
      !sameCategorySlugs.has(p.slug) &&
      (p.relatedCategories || []).some((c) => relatedCats.has(c)),
  )
  const used = new Set([...sameCategorySlugs, ...byServiceOverlap.map((p) => p.slug)])
  const rest = others.filter((p) => !used.has(p.slug))
  return [...sameCategory, ...byServiceOverlap, ...rest].slice(0, limit)
}

function renderText(text) {
  if (!text) return null
  const parts = []
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match
  let key = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    const [, label, href] = match
    parts.push(
      href.startsWith('/')
        ? <Link key={key++} href={href} className="text-ink underline underline-offset-2 hover:text-stone transition-colors">{label}</Link>
        : <a key={key++} href={href} target="_blank" rel="noreferrer" className="text-ink underline underline-offset-2 hover:text-stone transition-colors">{label}</a>
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts.length ? parts : text
}

function ArticleJsonLd({ post }) {
  const wordCount = countBlogWords(post.content)
  const schema = buildArticleSchema(post, { wordCount })
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
      <main id="main" className="page-content">
        <div className="section-shell section-pad min-h-screen">
          <p className="text-body">Article not found.</p>
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
    <main id="main" className="page-content">
      <div className="section-shell section-pad min-h-screen">
        <ArticleJsonLd post={post} />
        <BreadcrumbJsonLd items={[
          { name: 'Home', url: 'https://farwasalon.com/' },
          { name: 'Blog', url: 'https://farwasalon.com/blog' },
          { name: post.title, url: `https://farwasalon.com/blog/${post.slug}` },
        ]} />

        <div className="max-w-2xl">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[11px] text-stone font-['Inter']">
              <li>
                <Link href="/" className="tap-safe inline-flex items-center min-h-[44px] px-1 -mx-1 hover:text-ink transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden className="text-stone/50">/</li>
              <li>
                <Link href="/blog" className="tap-safe inline-flex items-center min-h-[44px] px-1 -mx-1 hover:text-ink transition-colors">
                  Blog
                </Link>
              </li>
              <li aria-hidden className="text-stone/50">/</li>
              <li className="text-ink px-1 line-clamp-1">{post.title}</li>
            </ol>
          </nav>

          <m.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/blog"
              className="tap-safe inline-flex items-center gap-2 text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors mb-7"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> All Articles
            </Link>
          </m.div>

          <m.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 pb-8 border-b border-border-soft"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[9px] tracking-[0.24em] uppercase text-stone font-['Inter'] bg-mist px-2 py-1">
                {post.category}
              </span>
              <span className="text-stone text-[10px] font-['Inter']">{post.readTime}</span>
            </div>
            <h1 className="font-['Unbounded'] font-bold text-2xl md:text-3xl text-ink leading-tight mb-3">
              {post.title}
            </h1>
            <p className="text-stone text-sm font-light">
              By {post.author || 'Rubina'}, Founder · Farwa Beauty Salon · {formatted}
            </p>
          </m.header>

          {post.featuredImage && (
            <m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="relative overflow-hidden mb-10 aspect-[16/9]">
              <Image src={post.featuredImage} alt={post.title} fill className="object-cover" priority />
            </m.div>
          )}

          <m.div
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
              if (block.type === 'h3') {
                return (
                  <h3
                    key={i}
                    className="font-['Syne'] font-bold text-sm text-ink mt-5 mb-2"
                  >
                    {block.text}
                  </h3>
                )
              }
              if (block.type === 'ul') {
                return (
                  <ul
                    key={i}
                    className="list-disc pl-5 mb-4 space-y-1.5 text-stone text-[15px] font-light leading-relaxed font-['Inter'] marker:text-[#c9a98a]"
                  >
                    {block.items?.map((item, j) => (
                      <li key={j}>{renderText(item)}</li>
                    ))}
                  </ul>
                )
              }
              if (block.type === 'ol') {
                return (
                  <ol
                    key={i}
                    className="list-decimal pl-5 mb-4 space-y-1.5 text-stone text-[15px] font-light leading-relaxed font-['Inter'] marker:text-[#c9a98a]"
                  >
                    {block.items?.map((item, j) => (
                      <li key={j}>{renderText(item)}</li>
                    ))}
                  </ol>
                )
              }
              return (
                <p
                  key={i}
                  className="text-stone text-[15px] font-light leading-relaxed mb-4 font-['Inter']"
                >
                  {renderText(block.text)}
                </p>
              )
            })}
          </m.div>

          <div className="mt-10 pt-8 border-t border-border-soft">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-mist flex items-center justify-center flex-shrink-0">
                <span className="text-ink font-['Syne'] font-bold text-lg">R</span>
              </div>
              <div>
                <p className="font-['Syne'] font-bold text-sm text-ink">{post.author || 'Rubina'}</p>
                <p className="text-stone text-xs font-['Inter'] mt-0.5">Founder, Farwa Beauty Salon</p>
                <p className="text-stone text-[13px] font-light font-['Inter'] mt-2 leading-relaxed">
                  {`Rubina founded Farwa Beauty Salon in 2008 and has spent ${YEARS_ACTIVE}+ years perfecting bridal artistry, skincare, and brow techniques in Karachi. She writes to help women make confident beauty decisions.`}
                </p>
              </div>
            </div>
          </div>

          {post.relatedCategories?.length > 0 && (
            <section className="pt-8 border-t border-border-soft">
              <h2 className="font-['Syne'] font-bold text-base text-ink mb-4">Related Services</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {post.relatedCategories.map((cat) => {
                  const meta = CAT_META[cat]
                  const slug = CAT_SLUGS[cat]
                  if (!meta || !slug) return null
                  return (
                    <Link key={cat} href={`/services/${slug}`} className="group relative overflow-hidden aspect-[4/3]">
                      <Image src={meta.img} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 50vw, 33vw" />
                      <div className="absolute inset-0 bg-ink/50 group-hover:bg-ink/60 transition-colors" />
                      <div className="absolute inset-0 flex items-end p-3">
                        <span className="text-white font-['Syne'] font-bold text-xs uppercase">{cat}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          <div className="pt-8 border-t border-border-soft flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/book" className="tap-safe btn-primary">
              Book Online <ArrowUpRight className="w-4 h-4" />
            </Link>
            <a
              href={WA_DEFAULT}
              target="_blank"
              rel="noreferrer"
              className="text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors"
            >
              Or WhatsApp us
            </a>
            <Link
              href="/blog"
              className="text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors"
            >
              ← More articles
            </Link>
          </div>

          {(() => {
            const related = getRelatedPosts(post, slug, 3)
            return related.length > 0 && (
              <section className="mt-10 pt-8 border-t border-border-soft">
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
