import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, ChevronRight, Star, Quote } from 'lucide-react'
import {
  Navbar, Footer, AnimatedNumber, StickyWA, usePageMeta,
  FbEmbed, SkipLink, WordmarkDivider, useBooking, useNextSlot,
} from '../shared.jsx'
import { SERVICES, CAT_META } from '../data.js'

const CATEGORY_COUNT = Object.keys(SERVICES).length
const SERVICE_COUNT  = Object.values(SERVICES).reduce((a, v) => a + v.length, 0)

/* ─── Real Facebook review posts (verified public) ────────────── */
const FB_POSTS = [
  { name: 'Tathira B.',        initials: 'TB', src: 'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Ftathirabid%2Fposts%2Fpfbid02J73qHitLiSYbpvJPJEYvNfBHyjSfKEhWL1hS6VbMupr15TzuPuGtXNTKBDMuvRyKl&show_text=true&width=500', link: 'https://www.facebook.com/tathirabid/posts/pfbid02J73qHitLiSYbpvJPJEYvNfBHyjSfKEhWL1hS6VbMupr15TzuPuGtXNTKBDMuvRyKl', height: 169 },
  { name: 'Jessica J.',        initials: 'JJ', src: 'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fjessica.joseph.522%2Fposts%2Fpfbid02ZCUhHYUrNBsv9yEfCY5t5MiBPWzJEs6nMwtRSGYaNViyYEEUhKiUZYuSSL8yup9Ul&show_text=true&width=500', link: 'https://www.facebook.com/jessica.joseph.522/posts/pfbid02ZCUhHYUrNBsv9yEfCY5t5MiBPWzJEs6nMwtRSGYaNViyYEEUhKiUZYuSSL8yup9Ul', height: 169 },
  { name: 'Tashfeen G.',       initials: 'TG', src: 'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Ftashfeen.ghulamali%2Fposts%2Fpfbid0LHJDHEFyLs7AefDCPGH6kPxL3z5Kov6sT1gdfXFvDXNZoAL1RXjpEBwzz81GMoPLl&show_text=true&width=500', link: 'https://www.facebook.com/tashfeen.ghulamali/posts/pfbid0LHJDHEFyLs7AefDCPGH6kPxL3z5Kov6sT1gdfXFvDXNZoAL1RXjpEBwzz81GMoPLl', height: 207 },
  { name: 'Sumaiya M.',        initials: 'SM', src: 'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FSumaiya.Mohsi%2Fposts%2Fpfbid02Th9Xxwdqp5WK66n9MShW4orY8WxWvrSaAA3CoGwdpFJdK4J4zKJ6dbHWsvA86TpTl&show_text=true&width=500', link: 'https://www.facebook.com/Sumaiya.Mohsi/posts/pfbid02Th9Xxwdqp5WK66n9MShW4orY8WxWvrSaAA3CoGwdpFJdK4J4zKJ6dbHWsvA86TpTl', height: 250 },
  { name: 'Sara K.',           initials: 'SK', src: 'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fcutesara.1995%2Fposts%2Fpfbid029WwdkbBNG5xsdX61yp4ixzDdZaFnFoxwKXPkvoECyQnfLFwbry4jUJz4y5VwqWB7l&show_text=true&width=500', link: 'https://www.facebook.com/cutesara.1995/posts/pfbid029WwdkbBNG5xsdX61yp4ixzDdZaFnFoxwKXPkvoECyQnfLFwbry4jUJz4y5VwqWB7l', height: 185 },
  { name: 'Farwa Salon',       initials: 'FS', src: 'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Ffarwasalon%2Fposts%2F1158674182945883&show_text=true&width=500', link: 'https://www.facebook.com/farwasalon/posts/1158674182945883', height: 285 },
]

/* ─── Featured pull-quote (editorial hero above FB grid) ───────── */
const FEATURED_REVIEW = {
  name: 'Tathira B.',
  quote: 'Farwa Aapi ne itni care aur detail se kaam kiya ke har visit pe ghar jaisa lagta hai. Best salon in Karachi, hands down.',
  translation: '"Farwa Aapi works with such care and detail that every visit feels like home. Best salon in Karachi, hands down."',
  link: 'https://www.facebook.com/tathirabid/posts/pfbid02J73qHitLiSYbpvJPJEYvNfBHyjSfKEhWL1hS6VbMupr15TzuPuGtXNTKBDMuvRyKl',
}

/* ─── Editorial slideshow — visual rhythm: face ↔ technique ↔ product ── */
const EDITORIAL_PHOTOS = [
  { src: '/bridal.jpg',    label: 'Bridal' },
  { src: '/waxing.png',    label: 'Hot Wax' },
  { src: '/glow2.png',     label: 'Facials' },
  { src: '/pedicure.jpg',  label: 'Nails' },
  { src: '/threading.jpg', label: 'Threading' },
  { src: '/hairdo.jpg',    label: 'Hair' },
  { src: '/glow.jpg',      label: 'Bleach & Polish' },
  { src: '/massage.jpg',   label: 'Massage' },
  { src: '/facial.jpg',    label: 'Cleansing' },
  { src: '/wax2.jpg',      label: 'Cold Wax' },
  { src: '/bridal2.jpg',   label: 'Hair Treatments' },
  { src: '/glow3.jpg',     label: 'Radiance' },
]

/* ─── Hero — thesis copy + kinetic reveal + calmer video ──────── */
function Hero() {
  const { scrollY } = useScroll()
  const textY    = useTransform(scrollY, [0, 500], [0, -40])
  const overlayO = useTransform(scrollY, [0, 400], [0.58, 0.82])
  const videoRef = useRef(null)
  const booking  = useBooking()
  const slot     = useNextSlot()

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      v.pause()
    } else {
      // Slower, cinematic pacing — prior value was 0.5, now 0.35
      v.playbackRate = 0.35
    }
  }, [])

  /* Kinetic thesis — fragments revealed sequentially */
  const thesis = [
    { text: 'Bridal. Hair. Skin.',              em: true  },
    { text: 'Rubina\u2019s studio',             em: false },
    { text: 'in PECHS Block 2,',                em: false },
    { text: 'since 2008.',                      em: true  },
  ]

  return (
    <section className="relative w-full h-[100svh] min-h-[580px] max-h-[1100px] overflow-hidden bg-[#0d0609]">

      {/* Background video — less zoom via object-position offset */}
      <video
        ref={videoRef}
        autoPlay muted loop playsInline
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: '50% 35%' }}
        poster="/glow.jpg"
        preload="metadata"
      >
        <source src="/hero2.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay for text contrast */}
      <motion.div className="absolute inset-0 z-[1]"
        style={{
          opacity: overlayO,
          background: 'linear-gradient(to top, rgba(13,6,9,0.95) 0%, rgba(13,6,9,0.55) 38%, rgba(13,6,9,0.22) 68%, rgba(13,6,9,0.5) 100%)',
        }} />

      {/* Vignette (subtle) */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 48%, rgba(0,0,0,0.5) 100%)' }} />

      {/* Film grain — 6%, mood without noise */}
      <div className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px', opacity: 0.055, mixBlendMode: 'overlay',
        }} />

      {/* Hero content */}
      <motion.div
        style={{ y: textY }}
        className="absolute inset-x-0 bottom-0 z-10 px-4 sm:px-6 md:px-10 pb-20 sm:pb-12 md:pb-14">
        <div className="max-w-screen-2xl mx-auto">
          {/* Eyebrow */}
          <div className="overflow-hidden mb-4 md:mb-6">
            <motion.p
              initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ delay: 0.15, duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="text-white/70 text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-['Inter']">
              Est. 2008 &middot; PECHS Block 2, Karachi
            </motion.p>
          </div>

          {/* Kinetic thesis line — the real headline */}
          <h1 className="font-['Unbounded'] text-white leading-[0.95] mb-6 md:mb-8"
            style={{
              fontSize: 'clamp(1.9rem, 6.4vw, 5.25rem)',
              letterSpacing: '-0.02em',
              maxWidth: '22ch',
            }}>
            {thesis.map((line, i) => (
              <span key={i} className="block overflow-hidden">
                <motion.span
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.3 + i * 0.18, duration: 1.05, ease: [0.16,1,0.3,1] }}
                  className={`block ${line.em ? 'text-white font-black' : 'text-white/80 font-extralight italic font-[\'Syne\']'}`}>
                  {line.text}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* Signature */}
          <div className="overflow-hidden mb-8 md:mb-10">
            <motion.p
              initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ delay: 1.1, duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="text-white/55 text-[10px] sm:text-[11px] tracking-[0.32em] uppercase font-['Inter']">
              Farwa Beauty Salon
            </motion.p>
          </div>

          {/* CTAs + live slot */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.35, duration: 0.75, ease: [0.16,1,0.3,1] }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 max-w-md sm:max-w-none">
            <button
              onClick={() => booking.open()}
              className="tap-safe inline-flex items-center justify-center sm:justify-start gap-2 bg-white text-ink text-[11px] md:text-[12px] tracking-[0.14em] uppercase font-semibold font-['Inter'] px-6 md:px-8 py-3.5 md:py-4 hover:bg-nude active:scale-[0.97] transition-all duration-300 shadow-lg shadow-black/25">
              Book an Appointment <ArrowUpRight className="w-4 h-4" />
            </button>
            <Link to="/services"
              className="tap-safe link-underline text-white/80 text-[11px] md:text-[12px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors flex items-center justify-center sm:justify-start">
              Explore Services
            </Link>
            {/* Live-availability pill */}
            <div className="hidden sm:flex items-center gap-2 ml-auto">
              <span className={`w-1.5 h-1.5 rounded-full ${slot.open ? 'bg-[#9cd48c]' : 'bg-[#c9a98a]'} animate-pulse`} aria-hidden="true" />
              <span className="text-white/55 text-[10px] tracking-[0.22em] uppercase font-['Inter']">
                Next slot <span className="text-white font-medium ml-1">{slot.label}</span>
              </span>
            </div>
          </motion.div>

          {/* Mobile slot — own line */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.7 }}
            className="sm:hidden mt-4 text-white/55 text-[10px] tracking-[0.22em] uppercase font-['Inter'] flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${slot.open ? 'bg-[#9cd48c]' : 'bg-[#c9a98a]'} animate-pulse`} aria-hidden="true" />
            Next slot <span className="text-white font-medium">{slot.label}</span>
          </motion.p>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        aria-hidden="true"
        className="hidden md:flex absolute bottom-10 right-10 z-10 flex-col items-center gap-1.5">
        <div className="w-px h-10 bg-white/25 relative overflow-hidden">
          <motion.div className="absolute top-0 left-0 w-full bg-white"
            animate={{ y: ['-100%','200%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            style={{ height: '40%' }} />
        </div>
        <span className="text-white/45 text-[9px] tracking-[0.2em] uppercase font-['Inter'] rotate-90 origin-center mt-2">scroll</span>
      </motion.div>
    </section>
  )
}

/* ─── Stats strip ──────────────────────────────────────────────── */
function StatsStrip() {
  return (
    <section className="bg-white py-14 sm:py-16 md:py-24 px-4 sm:px-5 md:px-10">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center">
          <div className="overflow-hidden">
            <motion.h2 initial={{ y: '60%', opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1.0, ease: [0.16,1,0.3,1] }}
              className="display-section text-ink">
              KARACHI'S<br />MOST<br />TRUSTED<br />BEAUTY STUDIO
            </motion.h2>
          </div>
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15 }}
            className="flex flex-col gap-6 sm:gap-7">
            <p className="text-stone text-[15px] sm:text-base leading-relaxed font-light max-w-xl">
              For over 17 years, Farwa Beauty Salon has been the trusted choice for women across Karachi. Expert care, a warm welcome, and results that speak for themselves &mdash; every single visit.
            </p>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 border-t border-[#e4ddd7] pt-6 sm:pt-7">
              {[
                { display: '17+',  final: 17,             label: 'Years of expertise' },
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
            <Link to="/about" className="tap-safe inline-flex items-center gap-2 text-ink text-sm font-medium font-['Inter'] group w-fit">
              <span className="link-underline">Read Our Story</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── Editorial photo slideshow ─────────────────────────────────
   Desktop: auto-scrolling marquee with 320px-wide cards
   Mobile:  scroll-snap horizontal strip — full-bleed, swipe-friendly ── */
function EditorialSlideshow() {
  const doubled = [...EDITORIAL_PHOTOS, ...EDITORIAL_PHOTOS]

  return (
    <section className="bg-white border-y border-[#e4ddd7] overflow-hidden" aria-label="Editorial photo showcase">

      {/* ── Mobile: scroll-snap single-card swipe ── */}
      <div className="md:hidden snap-x-row snap-center-child flex overflow-x-auto py-3 gap-2.5 px-4">
        {EDITORIAL_PHOTOS.map((p, i) => (
          <figure key={i}
            className="relative shrink-0 overflow-hidden rounded-none"
            style={{ width: 'min(72vw, 260px)', height: 'min(96vw, 346px)' }}>
            <img src={p.src} alt={p.label} loading="lazy" decoding="async"
              className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            <figcaption className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <span className="text-white text-[10px] tracking-[0.2em] uppercase font-['Inter'] font-medium leading-none">
                {p.label}
              </span>
              <span className="text-white/40 text-[9px] font-['Inter'] tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* ── Desktop: auto-scrolling marquee ── */}
      <div className="hidden md:block py-2">
        <div className="flex w-max" style={{ animation: 'marquee 65s linear infinite' }}>
          {doubled.map((p, i) => (
            <div key={i} className="relative shrink-0 w-[260px] lg:w-[300px] xl:w-[330px] aspect-[3/4] mx-1.5 overflow-hidden group cursor-default">
              <img src={p.src} alt={p.label} loading="lazy" decoding="async" width="330" height="440"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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

/* ─── Featured services — hover-image left panel on desktop ──── */
function FeaturedServices() {
  const categories  = Object.keys(SERVICES)
  const [hovered, setHovered] = useState(null)

  /* Active image: hovered category's image, fallback to video */
  const activeImg = hovered ? CAT_META[hovered]?.img : null

  return (
    <section className="bg-white py-14 md:py-24 px-4 sm:px-5 md:px-10 border-t border-[#e4ddd7]">
      <div className="max-w-screen-xl mx-auto">

        {/* Header row */}
        <div className="flex items-end justify-between mb-10 md:mb-14 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-2">— What we do</p>
            <h2 className="font-['Unbounded'] font-bold text-2xl md:text-3xl text-ink leading-tight">Our Services</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Link to="/services"
              className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] text-ink border border-ink px-4 md:px-5 py-2.5 hover:bg-ink hover:text-white transition-all duration-300">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </motion.div>
        </div>

        {/* Two-column editorial layout */}
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 items-start">

          {/* Left — image/video panel, cross-fades on hover */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
            className="relative overflow-hidden aspect-[3/4] hidden md:block sticky top-24 bg-[#0d0609]">

            {/* Video base layer (always mounted, shown when no hover) */}
            <video autoPlay muted loop playsInline
              className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500"
              style={{ opacity: activeImg ? 0 : 1 }}
              poster="/bridal.jpg">
              <source src="/ct.mp4" type="video/mp4" />
            </video>

            {/* Category image cross-fade layer */}
            {categories.map(cat => (
              <img key={cat}
                src={CAT_META[cat]?.img}
                alt={cat}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-400 pointer-events-none"
                style={{ opacity: hovered === cat ? 1 : 0 }}
                aria-hidden="true"
                loading="eager"
              />
            ))}

            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-ink/80 to-transparent z-10">
              <p className="text-white/60 text-[10px] tracking-[0.24em] uppercase font-['Inter'] transition-all duration-300">
                {hovered ?? 'Farwa Beauty Salon'}
              </p>
              <p className="text-white font-['Syne'] font-bold text-sm transition-all duration-300">
                {hovered ? `${SERVICES[hovered]?.length} services` : 'PECHS Block 2, Karachi'}
              </p>
            </div>
          </motion.div>

          {/* Right — numbered category list */}
          <div>
            {/* Mobile video */}
            <div className="relative overflow-hidden aspect-[16/9] mb-8 md:hidden">
              <video autoPlay muted loop playsInline
                className="w-full h-full object-cover" poster="/bridal.jpg">
                <source src="/ct.mp4" type="video/mp4" />
              </video>
            </div>

            <div className="divide-y divide-[#e4ddd7] border-t border-[#e4ddd7]">
              {categories.map((cat, i) => (
                <motion.div key={cat}
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }}>
                  <Link to="/services"
                    onMouseEnter={() => setHovered(cat)}
                    onMouseLeave={() => setHovered(null)}
                    className="group flex items-center justify-between py-4 md:py-5 gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-['Unbounded'] text-[10px] text-stone/40 shrink-0 w-5 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-['Syne'] font-bold text-sm md:text-base uppercase text-ink group-hover:text-stone transition-colors duration-200 truncate">
                        {cat}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-stone text-[10px] font-['Inter'] hidden sm:block">
                        {SERVICES[cat].length} services
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-stone/40 group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
              className="mt-8 pt-6 border-t border-[#e4ddd7]">
              <p className="text-stone text-xs font-['Inter'] font-light">
                Book any service directly on WhatsApp — we confirm within a few hours.
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}

/* ─── Trust pillars ────────────────────────────────────────────── */
function TrustPillars() {
  return (
    <section className="bg-ink py-14 md:py-20 px-4 sm:px-5 md:px-10">
      <div className="max-w-screen-xl mx-auto">
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-10">— Why choose Farwa</motion.p>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {[
            { num: '01', title: '17 Years of Expertise',        desc: 'Since 2008, Farwa has been crafting beauty with skill, care, and love for every client who walks through the door.' },
            { num: '02', title: 'A Space That Feels Like Home',  desc: 'Our salon is warm, welcoming, and designed for every woman — a place where you can relax, be yourself, and leave glowing.' },
            { num: '03', title: 'Every Woman, Every Look',       desc: 'From a quick brow thread to a full bridal transformation — no request is too big or too small.' },
          ].map((p, i) => (
            <motion.div key={p.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.7 }}
              className="border-t border-white/10 pt-7">
              <p className="font-['Unbounded'] text-[10px] text-stone mb-4">{p.num}</p>
              <h3 className="font-['Syne'] font-bold text-base md:text-lg text-white mb-3 leading-snug">{p.title}</h3>
              <p className="text-stone text-sm font-light leading-relaxed font-['Inter']">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Testimonials — featured-quote hero + refined FB grid ──── */
function TestimonialsPreview() {
  return (
    <section className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-5 md:px-10 overflow-hidden bg-ink">
      {/* Warm ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,169,138,0.12) 0%, rgba(13,13,13,0) 60%)' }} />

      <div className="relative max-w-screen-xl mx-auto">
        {/* Header — centered editorial */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
          <p className="text-[#c9a98a] text-[10px] sm:text-[11px] tracking-[0.32em] uppercase font-['Inter'] mb-5">
            &mdash; Verified client love
          </p>
          <h2 className="font-['Unbounded'] font-bold text-white leading-[0.95] mb-5"
            style={{ fontSize: 'clamp(2rem, 6vw, 4.25rem)', letterSpacing: '-0.025em' }}>
            Five stars,<br />
            <span className="font-['Syne'] italic font-extralight text-[#c9a98a]">a thousand times over.</span>
          </h2>
          <div className="flex items-center justify-center gap-3 text-white/55 text-xs sm:text-sm font-['Inter'] font-light">
            <div className="flex gap-0.5 text-[#c9a98a]" aria-label="5 out of 5 stars">
              {[...Array(5)].map((_, s) => <Star key={s} className="w-3.5 h-3.5 fill-current" />)}
            </div>
            <span className="text-white/30">·</span>
            <span>Hundreds of reviews across Facebook &amp; Google</span>
          </div>
        </motion.div>

        {/* Featured pull-quote — hero review */}
        <motion.figure
          initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
          className="relative max-w-4xl mx-auto mb-14 md:mb-20 px-2 md:px-8">
          <Quote className="absolute -top-3 -left-1 md:-top-5 md:-left-5 w-9 h-9 md:w-14 md:h-14 text-[#c9a98a]/30 rotate-180" aria-hidden="true" />
          <blockquote className="font-['Syne'] italic font-light text-white leading-[1.35] text-center"
            style={{ fontSize: 'clamp(1.25rem, 3.2vw, 2.25rem)' }}>
            {FEATURED_REVIEW.quote}
          </blockquote>
          <p className="text-white/45 text-center text-sm md:text-base font-light mt-5 md:mt-6 font-['Inter']">
            {FEATURED_REVIEW.translation}
          </p>
          <figcaption className="flex items-center justify-center gap-3 mt-7 md:mt-8">
            <span className="h-px w-8 bg-[#c9a98a]/50" aria-hidden="true" />
            <span className="text-[#c9a98a] text-[11px] tracking-[0.3em] uppercase font-['Inter'] font-medium">
              {FEATURED_REVIEW.name}
            </span>
            <a href={FEATURED_REVIEW.link} target="_blank" rel="noreferrer"
              className="text-white/40 hover:text-white/80 text-[10px] tracking-[0.22em] uppercase font-['Inter'] inline-flex items-center gap-1 transition-colors">
              View on FB <ArrowUpRight className="w-3 h-3" />
            </a>
          </figcaption>
        </motion.figure>

        {/* Refined review grid */}
        <div className="mb-14 md:mb-16">
          <p className="text-white/30 text-[10px] tracking-[0.32em] uppercase font-['Inter'] text-center mb-6 md:mb-8">
            — More reviews, straight from Facebook
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {FB_POSTS.map((post, i) => (
              <motion.article key={post.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.06, duration: 0.7, ease: [0.16,1,0.3,1] }}
                className="group bg-[#fbf8f4] border border-[#c9a98a]/10 overflow-hidden flex flex-col">
                <header className="flex items-center justify-between px-4 md:px-5 py-3.5 border-b border-[#e4ddd7]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9a98a] to-[#8b6d59] flex items-center justify-center shrink-0">
                      <span className="text-white font-['Syne'] font-bold text-[11px] tracking-wider">{post.initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-['Syne'] font-bold text-[13px] text-ink truncate">{post.name}</p>
                      <div className="flex items-center gap-1 text-[#c9a98a]" aria-label="5 stars">
                        {[...Array(5)].map((_, s) => <Star key={s} className="w-2.5 h-2.5 fill-current" />)}
                      </div>
                    </div>
                  </div>
                  <a href={post.link} target="_blank" rel="noreferrer"
                    aria-label={`View ${post.name}'s review on Facebook`}
                    className="shrink-0 inline-flex items-center gap-1 text-stone group-hover:text-ink text-[9px] tracking-[0.14em] uppercase font-medium font-['Inter'] transition-colors">
                    View <ArrowUpRight className="w-3 h-3" />
                  </a>
                </header>
                <FbEmbed src={post.src} height={post.height} reviewerName={post.name} />
              </motion.article>
            ))}
          </div>
        </div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="pt-8 md:pt-10 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <p className="text-white/50 text-sm font-light font-['Inter']">
            Loved your visit? Help us spread the word.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
            <a href="https://g.page/r/CRCiNE2kpFvlEBM/review" target="_blank" rel="noreferrer"
              className="tap-safe inline-flex items-center justify-center gap-1.5 bg-white text-ink text-[11px] tracking-[0.14em] uppercase font-semibold font-['Inter'] px-6 py-3.5 hover:bg-[#c9a98a] hover:text-white transition-colors duration-300">
              Write a Google review <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <a href="https://www.facebook.com/farwasalon" target="_blank" rel="noreferrer"
              className="tap-safe link-underline text-white/60 text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors inline-flex items-center justify-center gap-1.5">
              Follow on Facebook <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  )
}

/* ─── CTA band ─────────────────────────────────────────────────── */
function CtaBand() {
  const booking = useBooking()
  return (
    <section className="bg-ink py-14 sm:py-16 md:py-24 px-4 sm:px-5 md:px-10">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-10">
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <p className="text-stone text-[10px] sm:text-[11px] tracking-[0.28em] uppercase font-['Inter'] mb-3">&mdash; Trusted by women across Karachi</p>
          <h2 className="font-['Unbounded'] font-bold text-white leading-tight"
            style={{ fontSize: 'clamp(1.5rem, 5vw, 2.75rem)' }}>
            Ready for your glow?<br />We're ready for you.
          </h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 shrink-0 w-full md:w-auto">
          <button onClick={() => booking.open()}
            className="tap-safe inline-flex items-center gap-2 bg-white text-ink text-[11px] sm:text-[12px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 sm:px-7 md:px-8 py-3.5 md:py-4 hover:bg-nude active:scale-[0.97] transition-all duration-300 w-full sm:w-auto justify-center sm:justify-start">
            Book an Appointment <ArrowUpRight className="w-4 h-4" />
          </button>
          <Link to="/services" className="tap-safe link-underline text-white/60 text-[11px] sm:text-[12px] tracking-[0.14em] uppercase font-['Inter'] hover:text-white transition-colors flex items-center justify-center sm:justify-start">
            View Services
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function Home() {
  usePageMeta({
    title: 'Farwa Beauty Salon — Karachi\'s trusted beauty studio since 2008',
    description: 'Bridal, facials, hair, nails, threading, waxing and more in PECHS Block 2, Karachi. 17+ years of beauty expertise — book directly on WhatsApp.',
  })
  return (
    <div className="bg-white overflow-x-hidden">
      <SkipLink />
      <Navbar transparent />
      <main id="main">
        <Hero />
        <StatsStrip />
        <EditorialSlideshow />
        <WordmarkDivider />
        <FeaturedServices />
        <TrustPillars />
        <TestimonialsPreview />
        <CtaBand />
      </main>
      <Footer />
      <StickyWA />
    </div>
  )
}
