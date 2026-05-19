'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { m } from 'framer-motion'
import { ArrowUpRight, ChevronRight, Star, Quote } from 'lucide-react'
import {
  AnimatedNumber, LazyVideo, CAT_SLUGS,
  WordmarkDivider,
} from '../src/shared.jsx'
import { formatPrice } from '../src/data.js'
import SalonLocalBlock from './components/salon-local-block.jsx'
import { SERVICES, CAT_META, YEARS_ACTIVE, WA_NUMBER } from '../src/data.js'

const CATEGORY_COUNT = Object.keys(SERVICES).length
const SERVICE_COUNT  = Object.values(SERVICES).reduce((a, v) => a + v.length, 0)

const FB_POSTS = [
  {
    name: 'Tathira B.', initials: 'TB', date: 'Aug 2024', service: 'Bridal',
    quote: 'Farwa Aapi ne itni care aur detail se kaam kiya ke har visit pe ghar jaisa lagta hai. Best salon in Karachi, hands down.',
    link: 'https://www.facebook.com/tathirabid/posts/pfbid02J73qHitLiSYbpvJPJEYvNfBHyjSfKEhWL1hS6VbMupr15TzuPuGtXNTKBDMuvRyKl',
  },
  {
    name: 'Jessica J.', initials: 'JJ', date: 'May 2024', service: 'Facial & Hair',
    quote: 'Been coming here for years and the quality never drops. Rubina knows my skin better than I do — I leave glowing every single time.',
    link: 'https://www.facebook.com/jessica.joseph.522/posts/pfbid02ZCUhHYUrNBsv9yEfCY5t5MiBPWzJEs6nMwtRSGYaNViyYEEUhKiUZYuSSL8yup9Ul',
  },
  {
    name: 'Tashfeen G.', initials: 'TG', date: 'Mar 2024', service: 'Full package',
    quote: 'The attention to detail is unmatched. From brow threading to bridal — everyone on the team treats you like family. Highly recommend to every girl in PECHS.',
    link: 'https://www.facebook.com/tashfeen.ghulamali/posts/pfbid0LHJDHEFyLs7AefDCPGH6kPxL3z5Kov6sT1gdfXFvDXNZoAL1RXjpEBwzz81GMoPLl',
  },
  {
    name: 'Sumaiya M.', initials: 'SM', date: 'Feb 2024', service: 'Bridal',
    quote: 'I cannot thank Farwa Aapi enough for making me feel like a queen on my wedding day. Every step — from trials to the final look — was perfection. My family still talks about it.',
    link: 'https://www.facebook.com/Sumaiya.Mohsi/posts/pfbid02Th9Xxwdqp5WK66n9MShW4orY8WxWvrSaAA3CoGwdpFJdK4J4zKJ6dbHWsvA86TpTl',
  },
  {
    name: 'Sara K.', initials: 'SK', date: 'Jan 2024', service: 'Skincare',
    quote: 'Honestly the most calm and professional salon experience in Karachi. No rush, no shortcuts — just clean, careful, beautiful work.',
    link: 'https://www.facebook.com/cutesara.1995/posts/pfbid029WwdkbBNG5xsdX61yp4ixzDdZaFnFoxwKXPkvoECyQnfLFwbry4jUJz4y5VwqWB7l',
  },
  {
    name: 'Nadia A.', initials: 'NA', date: 'Dec 2023', service: 'Threading & Facial',
    quote: 'Always leave feeling fresh and confident. Rubina has been doing my brows for years — no one else gets the shape right the way she does.',
    link: 'https://www.facebook.com/farwasalon/reviews',
  },
]

const FEATURED_REVIEW = {
  name: 'Tathira B.',
  quote: 'Farwa Aapi ne itni care aur detail se kaam kiya ke har visit pe ghar jaisa lagta hai. Best salon in Karachi, hands down.',
  translation: '"Farwa Aapi works with such care and detail that every visit feels like home. Best salon in Karachi, hands down."',
  link: 'https://www.facebook.com/tathirabid/posts/pfbid02J73qHitLiSYbpvJPJEYvNfBHyjSfKEhWL1hS6VbMupr15TzuPuGtXNTKBDMuvRyKl',
}

const EDITORIAL_PHOTOS = [
  { src: '/bridal.jpg',                label: 'Bridal' },
  { src: '/eyebrowtattoo.mp4',         label: 'Eyebrow Tattoo',   video: true, poster: '/eyebrowtattoo.jpg' },
  { src: '/manicurephotography.mp4',   label: 'Nail Craft',       video: true, poster: '/pedicure.jpg' },
  { src: '/glow3.jpg',                 label: 'Facials' },
  { src: '/threading.jpg',             label: 'Threading' },
  { src: '/hairdo.jpg',                label: 'Hair' },
  { src: '/oilwax.jpg',                label: 'Oil Wax' },
  { src: '/cleansing.mp4',             label: 'Cleansing',        video: true, poster: '/facialcleansing.jpg' },
  { src: '/massage.jpg',               label: 'Massage' },
  { src: '/nailpaintedhands.mp4',      label: 'Nail Finish',      video: true, poster: '/pedicure.jpg' },
  { src: '/wax2.jpg',                  label: 'Cold Wax' },
  { src: '/hairtreatment.jpg',         label: 'Hair Treatments' },
  { src: '/bleachpolish.jpg',                 label: 'Bleach & Polish' },
]

function StatsStrip() {
  return (
    <section className="cv-auto bg-white py-14 sm:py-16 md:py-[4.5rem] px-4 sm:px-5 md:px-10">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div className="overflow-hidden">
            <m.h2 initial={{ y: '60%', opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1.0, ease: [0.16,1,0.3,1] }}
              className="display-section text-ink">
              <span className="block">KARACHI&apos;S</span> <span className="block">MOST</span> <span className="block">TRUSTED</span> <span className="block">BEAUTY STUDIO</span>
            </m.h2>
          </div>
          <m.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15 }}
            className="flex flex-col gap-6 sm:gap-7">
            <p className="text-stone text-[15px] sm:text-base leading-relaxed font-light max-w-xl">
              For over {YEARS_ACTIVE} years, Farwa Beauty Salon has been the trusted choice for women across Karachi. Expert care, a warm welcome, and results that speak for themselves &mdash; every single visit.
            </p>
            <div className="grid grid-cols-3 max-[380px]:grid-cols-1 gap-3 sm:gap-4 border-t border-[#e4ddd7] pt-6 sm:pt-7">
              {[
                { display: `${YEARS_ACTIVE}+`,  final: YEARS_ACTIVE, label: 'Years of expertise' },
                { display: String(CATEGORY_COUNT), final: CATEGORY_COUNT, label: 'Service categories' },
                { display: String(SERVICE_COUNT) + '+', final: SERVICE_COUNT, label: 'Services on the menu' },
              ].map(({ display, final, label }) => (
                <div key={label} className="min-w-0">
                  <p className="font-['Unbounded'] font-bold text-lg sm:text-xl md:text-2xl text-ink mb-1 leading-none">
                    <AnimatedNumber display={display} final={final} />
                  </p>
                  <p className="text-stone text-[10px] sm:text-[11px] tracking-wide font-['Inter'] leading-tight">{label}</p>
                </div>
              ))}
            </div>
            <Link href="/about" className="tap-safe inline-flex items-center gap-2 text-ink text-sm font-medium font-['Inter'] group w-fit">
              <span className="link-underline">Read Our Story</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </m.div>
        </div>
      </div>
    </section>
  )
}

function EditorialSlideshow() {
  const doubled = [...EDITORIAL_PHOTOS, ...EDITORIAL_PHOTOS]

  return (
    <section className="cv-auto bg-white border-y border-[#e4ddd7] overflow-hidden" aria-label="Editorial photo showcase">
      <div className="md:hidden py-3 overflow-hidden">
        <div className="flex w-max" style={{ animation: 'marquee 45s linear infinite' }}>
          {doubled.map((p, i) => (
            <figure key={i}
              className="relative shrink-0 overflow-hidden mx-[5px]"
              style={{ width: 'min(62vw, 230px)', height: 'min(82vw, 306px)' }}>
              {p.video ? (
                <LazyVideo src={p.src} poster={p.poster}
                  className="w-full h-full object-cover" />
              ) : (
                <Image src={p.src} alt={p.label} loading="lazy"
                  width={230} height={306}
                  className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <figcaption className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <span className="text-white text-[10px] tracking-[0.2em] uppercase font-['Inter'] font-medium leading-none">
                  {p.label}
                </span>
                <span className="text-white/40 text-[9px] font-['Inter'] tabular-nums">
                  {String((i % EDITORIAL_PHOTOS.length) + 1).padStart(2, '0')}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="hidden md:block py-2">
        <div className="flex w-max" style={{ animation: 'marquee 65s linear infinite' }}>
          {doubled.map((p, i) => (
            <div key={i} className="relative shrink-0 w-[260px] lg:w-[300px] xl:w-[330px] aspect-[3/4] mx-1.5 overflow-hidden group cursor-default">
              {p.video ? (
                <LazyVideo src={p.src} poster={p.poster}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <Image src={p.src} alt={p.label} loading="lazy"
                  width={330} height={440}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 text-white text-[10px] tracking-[0.18em] uppercase font-['Inter'] font-medium">
                {p.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceMediaPanel({ hovered, categories }) {
  const activeVideo = hovered ? CAT_META[hovered]?.video : null

  return (
    <div className="relative w-full h-full bg-[#0d0609]">
      <LazyVideo
        src="/ct.mp4"
        poster="/bridal.jpg"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500"
        style={{ opacity: (hovered && activeVideo) ? 0 : 1 }}
      />
      {categories.map(cat => (
        <Image key={cat}
          src={CAT_META[cat]?.img || '/bleachpolish.jpg'}
          alt={cat}
          fill
          sizes="(max-width: 768px) 100vw, 45vw"
          className="absolute inset-0 object-cover transition-opacity duration-500 pointer-events-none"
          style={{ opacity: hovered === cat && !CAT_META[cat]?.video ? 1 : 0 }}
          aria-hidden="true"
          loading="lazy"
        />
      ))}
      {activeVideo && (
        <video
          key={activeVideo}
          src={activeVideo}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none animate-fadeIn"
          aria-hidden="true"
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 bg-gradient-to-t from-ink/80 to-transparent z-10">
        <p className="text-white/60 text-[10px] tracking-[0.24em] uppercase font-['Inter'] transition-all duration-300">
          {hovered ?? 'Farwa Beauty Salon'}
        </p>
        <p className="text-white font-['Syne'] font-bold text-sm transition-all duration-300">
          {hovered ? `${SERVICES[hovered]?.length} services` : 'PECHS, Karachi'}
        </p>
      </div>
    </div>
  )
}

function FeaturedServices() {
  const categories  = Object.keys(SERVICES)
  const [hovered, setHovered] = useState(null)

  return (
    <section className="cv-auto bg-white py-14 md:py-[4.5rem] px-4 sm:px-5 md:px-10 border-t border-[#e4ddd7]">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10 md:mb-12">
          <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-2">— What we do</p>
            <h2 className="font-['Unbounded'] font-bold text-2xl md:text-3xl text-ink leading-tight">Our Services</h2>
          </m.div>
          <m.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="shrink-0 self-start sm:self-auto">
            <Link href="/services"
              className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] text-ink border border-ink px-4 md:px-5 py-2.5 hover:bg-ink hover:text-white transition-all duration-300">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </m.div>
        </div>

        <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-12 items-start">
          <m.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
            className="relative overflow-hidden aspect-[4/3] md:aspect-[3/4] md:sticky md:top-24">
            <ServiceMediaPanel hovered={hovered} categories={categories} />
          </m.div>

          <div>
            <div className="divide-y divide-[#e4ddd7] border-t border-[#e4ddd7]">
              {categories.map((cat, i) => (
                <m.div key={cat}
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }}>
                  <Link href={`/services/${CAT_SLUGS[cat]}`}
                    onMouseEnter={() => setHovered(cat)}
                    onMouseLeave={() => setHovered(null)}
                    className="group flex items-center justify-between py-4 md:py-5 gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-['Unbounded'] text-[10px] text-stone/40 shrink-0 w-5 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-['Syne'] font-bold text-sm md:text-base uppercase text-ink group-hover:text-stone transition-colors duration-200 truncate">
                          {cat}
                        </span>
                        {CAT_META[cat]?.tagline && (
                          <span className="block text-stone text-[10px] font-['Inter'] font-light mt-0.5 truncate">
                            {CAT_META[cat].tagline}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-stone text-[10px] font-['Inter'] hidden sm:block">
                        {(() => {
                          const prices = SERVICES[cat].map((s) => s.pricePkr).filter(Boolean)
                          return prices.length
                            ? `${SERVICES[cat].length} · from ${formatPrice(Math.min(...prices))}`
                            : `${SERVICES[cat].length} services`
                        })()}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-stone/40 group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                    </div>
                  </Link>
                </m.div>
              ))}
            </div>

            <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
              className="mt-8 pt-6 border-t border-[#e4ddd7]">
              <p className="text-stone text-xs font-['Inter'] font-light">
                Book any service online — or <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer" className="underline hover:text-ink transition-colors">reach us on WhatsApp</a>.
              </p>
            </m.div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustPillars() {
  return (
    <section className="cv-auto bg-ink py-14 md:py-16 px-4 sm:px-5 md:px-10">
      <div className="max-w-screen-xl mx-auto">
        <m.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-10">— Why choose Farwa</m.p>
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {[
            { num: '01', title: `${YEARS_ACTIVE} Years of Expertise`,        desc: 'Since 2008, Farwa has been crafting beauty with skill, care, and love for every client who walks through the door.' },
            { num: '02', title: 'A Calm, Considered Space',      desc: 'The studio is unhurried by design — quiet rooms, careful lighting, conversations that stay at the chair.' },
            { num: '03', title: 'Every Woman, Every Look',       desc: 'From a quick brow thread to a full bridal transformation — no request is too big or too small.' },
          ].map((p, i) => (
            <m.div key={p.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.7 }}
              className="border-t border-white/10 pt-7">
              <p className="font-['Unbounded'] text-[10px] text-stone mb-4">{p.num}</p>
              <h3 className="font-['Syne'] font-bold text-base md:text-lg text-white mb-3 leading-snug">{p.title}</h3>
              <p className="text-stone text-sm font-light leading-relaxed font-['Inter']">{p.desc}</p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ReviewCard({ post, compact = false }) {
  return (
    <article className={`group relative bg-[#1a1614] border border-[#c9a98a]/20 hover:border-[#c9a98a]/50 transition-colors duration-500 flex flex-col overflow-hidden ${compact ? 'shrink-0 snap-start w-[85vw] max-w-[320px]' : 'h-full'}`}>
      <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'radial-gradient(circle at top right, rgba(201,169,138,0.22), transparent 60%)' }} />

      <header className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-gradient-to-br from-[#c9a98a] to-[#7a5c48] flex items-center justify-center shrink-0 ring-1 ring-[#c9a98a]/20">
            <span className="text-white font-['Syne'] font-bold text-[11px]">{post.initials}</span>
          </div>
          <div className="min-w-0">
            <p className="font-['Syne'] font-semibold text-[13px] text-white/90 truncate leading-tight">{post.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex gap-0.5 text-[#c9a98a]">
                {[...Array(5)].map((_, s) => <Star key={s} className="w-2.5 h-2.5 fill-current" />)}
              </div>
              <span className="text-white/30 text-[9px] font-['Inter']">· {post.date}</span>
            </div>
          </div>
        </div>
        <a href={post.link} target="_blank" rel="noreferrer"
          aria-label={`View ${post.name}'s review on Facebook`}
          className="shrink-0 text-white/25 group-hover:text-[#c9a98a] transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </header>

      <div className="flex-1 px-5 py-5 flex flex-col">
        <Quote className="w-5 h-5 text-[#c9a98a]/25 mb-3 rotate-180 shrink-0" aria-hidden="true" />
        <blockquote className="text-white/90 text-[13px] md:text-sm font-light leading-relaxed font-['Inter'] flex-1">
          {post.quote}
        </blockquote>
        <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-white/5">
          <span className="text-white/30 text-[9px] tracking-[0.22em] uppercase font-['Inter']">
            {post.service}
          </span>
          <span className="inline-flex items-center gap-1 text-[#c9a98a]/60 text-[9px] tracking-[0.2em] uppercase font-['Inter']">
            <span className="w-1 h-1 rounded-full bg-[#c9a98a]/70" /> Verified · Facebook
          </span>
        </div>
      </div>
    </article>
  )
}

function TestimonialsPreview() {
  return (
    <section className="cv-auto relative py-16 sm:py-[4.5rem] md:py-20 overflow-hidden bg-ink">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201,169,138,0.10) 0%, transparent 65%), radial-gradient(ellipse 50% 30% at 50% 100%, rgba(201,169,138,0.06) 0%, transparent 60%)' }} />

      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10">
        <m.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="flex flex-col sm:flex-row sm:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div className="min-w-0">
            <p className="text-[#c9a98a] text-[10px] tracking-[0.32em] uppercase font-['Inter'] mb-4">
              &mdash; Verified client love
            </p>
            <h2 className="font-['Unbounded'] font-bold text-white leading-[0.95]"
              style={{ fontSize: 'clamp(1.9rem, 5vw, 3.75rem)', letterSpacing: '-0.025em' }}>
              <span className="block">Five stars,</span>
              <span className="block font-['Syne'] italic font-extralight text-[#c9a98a]">a thousand times over.</span>
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 shrink-0 pb-1">
            <div className="flex gap-0.5 text-[#c9a98a]" aria-label="5 out of 5 stars">
              {[...Array(5)].map((_, s) => <Star key={s} className="w-3 h-3 fill-current" />)}
            </div>
            <span className="text-white/40 text-[10px] sm:text-[11px] font-['Inter'] leading-snug max-w-[16rem] sm:max-w-none">
              Hundreds of reviews · Facebook &amp; Google
            </span>
          </div>
        </m.div>

        <m.figure initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
          className="relative border border-[#c9a98a]/30 bg-[#1a1614] px-6 py-10 md:px-14 md:py-14 mb-3 md:mb-4">
          <Quote className="absolute top-6 left-6 md:top-8 md:left-10 w-7 h-7 md:w-10 md:h-10 text-[#c9a98a]/20 rotate-180" aria-hidden="true" />
          <blockquote className="font-['Syne'] italic font-light text-white/90 leading-[1.4] text-center max-w-3xl mx-auto"
            style={{ fontSize: 'clamp(1.1rem, 2.8vw, 1.85rem)' }}>
            {FEATURED_REVIEW.quote}
          </blockquote>
          <p className="text-white/35 text-center text-sm font-light mt-5 font-['Inter']">
            {FEATURED_REVIEW.translation}
          </p>
          <figcaption className="flex items-center justify-center gap-3 mt-7">
            <span className="h-px w-6 bg-[#c9a98a]/40" aria-hidden="true" />
            <span className="text-[#c9a98a] text-[10px] tracking-[0.3em] uppercase font-['Inter'] font-medium">
              {FEATURED_REVIEW.name}
            </span>
            <a href={FEATURED_REVIEW.link} target="_blank" rel="noreferrer"
              className="text-white/30 hover:text-[#c9a98a] text-[9px] tracking-[0.2em] uppercase font-['Inter'] inline-flex items-center gap-1 transition-colors">
              FB <ArrowUpRight className="w-2.5 h-2.5" />
            </a>
          </figcaption>
        </m.figure>

        <div className="mb-12 md:mb-14">
          <div className="flex items-baseline justify-between mb-5 md:mb-6 px-0.5">
            <p className="text-white/25 text-[9px] tracking-[0.32em] uppercase font-['Inter']">
              — Direct from Facebook
            </p>
            <a href="https://www.facebook.com/farwasalon/reviews" target="_blank" rel="noreferrer"
              className="text-white/40 hover:text-[#c9a98a] text-[9px] tracking-[0.24em] uppercase font-['Inter'] transition-colors inline-flex items-center gap-1">
              View all <ArrowUpRight className="w-2.5 h-2.5" />
            </a>
          </div>

          <p className="md:hidden text-white/30 text-[9px] tracking-[0.2em] uppercase font-['Inter'] mb-2 px-0.5">
            Swipe for more reviews →
          </p>
          <div className="md:hidden flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
            {FB_POSTS.map((post) => (
              <ReviewCard key={post.name} post={post} compact />
            ))}
          </div>

          <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {FB_POSTS.map((post, i) => (
              <m.div key={post.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.07, duration: 0.6, ease: [0.16,1,0.3,1] }}>
                <ReviewCard post={post} />
              </m.div>
            ))}
          </div>
        </div>

        <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="pt-8 border-t border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <p className="text-white/40 text-[11px] font-light font-['Inter'] tracking-wide">
            Loved your visit? Help us spread the word.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <a href="https://g.page/r/CRCiNE2kpFvlEBM/review" target="_blank" rel="noreferrer"
              className="tap-safe inline-flex items-center justify-center gap-1.5 bg-white text-ink text-[11px] tracking-[0.14em] uppercase font-semibold font-['Inter'] px-6 py-3 hover:bg-[#c9a98a] hover:text-white transition-colors duration-300">
              Write a Google review <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <a href="https://www.facebook.com/farwasalon" target="_blank" rel="noreferrer"
              className="tap-safe inline-flex items-center justify-center gap-1.5 text-white/50 text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors border border-white/10 hover:border-white/30 px-6 py-3">
              Follow on Facebook <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </m.div>
      </div>
    </section>
  )
}


function CtaBand() {
  return (
    <section className="cv-auto bg-ink py-14 sm:py-16 md:py-[4.5rem] px-4 sm:px-5 md:px-10">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-10">
        <m.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <p className="text-stone text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-['Inter'] mb-3">&mdash; Trusted by women across Karachi</p>
          <h2 className="font-['Unbounded'] font-bold text-white leading-tight"
            style={{ fontSize: 'clamp(1.5rem, 5vw, 2.75rem)' }}>
            <span className="block">Ready for your glow?</span> <span className="block">We&apos;re ready for you.</span>
          </h2>
        </m.div>
        <m.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 shrink-0 w-full md:w-auto">
          <Link href="/book"
            className="tap-safe inline-flex items-center gap-2 bg-white text-ink text-[11px] sm:text-[12px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 sm:px-7 md:px-8 py-3.5 md:py-4 hover:bg-nude active:scale-[0.97] transition-all duration-300 w-full sm:w-auto justify-center sm:justify-start">
            Book an Appointment <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link href="/services" className="tap-safe link-underline text-white/60 text-[11px] sm:text-[12px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors flex items-center justify-center sm:justify-start">
            View Services
          </Link>
          <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer"
            className="tap-safe text-white/40 text-[10px] tracking-[0.12em] uppercase font-['Inter'] hover:text-white/70 transition-colors flex items-center justify-center sm:justify-start">
            Or reach us on WhatsApp
          </a>
        </m.div>
      </div>
    </section>
  )
}

export default function HomeBelowFold() {
  return (
    <>
      <StatsStrip />
      <EditorialSlideshow />
      <WordmarkDivider />
      <FeaturedServices />
      <TrustPillars />
      <SalonLocalBlock />
      <TestimonialsPreview />
      <CtaBand />
    </>
  )
}
