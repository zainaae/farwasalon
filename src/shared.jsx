'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import ArrowUpRight from '../app/components/icon-sprite.jsx'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { X, Menu, ChevronLeft, ChevronRight, Phone, MessageCircle } from 'lucide-react'
import { WA_NUMBER, MAPS_LINK, IG_LINK, WA_DEFAULT, waLink, formatPrice, formatServicePrice, formatDuration, track, CAT_SLUGS } from './site-config.js'
import { useNextSlot } from './use-next-slot.js'
import { webmSourceFor } from '../lib/video-manifest.js'
import {
  CTA_PRIMARY_LABEL,
  CTA_WHATSAPP_HINT,
  IgIcon,
  UrduSignature,
} from './shared-chrome.jsx'

export { CTA_PRIMARY_LABEL, CTA_WHATSAPP_HINT, IgIcon, UrduSignature }

/* ─── Skip-to-content link (keyboard a11y) ─────────────────────── */
export function SkipLink() {
  return (
    <a href="#main" className="skip-link">
      Skip to content
    </a>
  )
}

/* ─── Per-page document title + description + OG/canonical hook ── */
function setMeta(selector, attr, value) {
  let tag = document.querySelector(selector)
  if (!value) { tag?.remove(); return }
  if (!tag) {
    tag = document.createElement(selector.startsWith('link') ? 'link' : 'meta')
    const parts = selector.match(/\[([^\]=]+)="([^"]+)"\]/g) || []
    parts.forEach(p => { const [, a, v] = p.match(/\[([^\]=]+)="([^"]+)"\]/); tag.setAttribute(a, v) })
    document.head.appendChild(tag)
  }
  tag.setAttribute(attr, value)
}

export function usePageMeta({ title, description, canonical, ogImage }) {
  useEffect(() => {
    if (title) document.title = title
    if (description) setMeta('meta[name="description"]', 'content', description)
    setMeta('link[rel="canonical"]', 'href', canonical || null)
    setMeta('meta[property="og:title"]', 'content', title || null)
    setMeta('meta[property="og:description"]', 'content', description || null)
    setMeta('meta[property="og:url"]', 'content', canonical || null)
    setMeta('meta[property="og:image"]', 'content', ogImage || null)
    setMeta('meta[name="twitter:title"]', 'content', title || null)
    setMeta('meta[name="twitter:description"]', 'content', description || null)
  }, [title, description, canonical, ogImage])
}

/* ─── Instagram icon — see shared-chrome.jsx ─────────────────── */

/* ─── Stat number ────────────────────────────────────────────────
 * Static truthful label only. A count-up used to jump to "0+" on the
 * first rAF (and briefly looked like 0 / -1 on /about), which read as
 * an unfinished page. Decorative tweening is not worth that. */
export function AnimatedNumber({ display, final: _final, ariaLabel = display }) {
  return (
    <span>
      <span className="sr-only">{ariaLabel}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  )
}

/* ─── Native scroll-snap gallery (replaces smooothy) ───────────── */
export function SmoothyGallery({ photos }) {
  const scrollerRef = useRef(null)
  const [idx, setIdx] = useState(0)
  const count = photos.length

  const scrollTo = useCallback((n) => {
    const el = scrollerRef.current
    if (!el) return
    const child = el.children[n]
    if (!child) return
    const left = child.offsetLeft + child.offsetWidth / 2 - el.clientWidth / 2
    el.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
    setIdx(n)
  }, [])

  const onScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const center = el.scrollLeft + el.clientWidth / 2
    let best = 0, bestDist = Infinity
    for (let i = 0; i < el.children.length; i++) {
      const c = el.children[i]
      const cCenter = c.offsetLeft + c.clientWidth / 2
      const d = Math.abs(cCenter - center)
      if (d < bestDist) { bestDist = d; best = i }
    }
    setIdx(best)
  }, [])

  const onRegionKeyDown = useCallback((e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    if (e.key === 'ArrowRight') scrollTo(Math.min(count - 1, idx + 1))
    else scrollTo(Math.max(0, idx - 1))
  }, [idx, count, scrollTo])

  return (
    <div className="relative overflow-x-clip max-w-full w-full isolate">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        onKeyDown={onRegionKeyDown}
        tabIndex={0}
        className="snap-x-row snap-center-child flex overflow-x-auto gap-3 md:gap-4 px-4 md:px-10 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-[#c9a98a] focus-visible:ring-offset-2 max-w-full"
        role="region"
        aria-label="Salon photo gallery"
        aria-describedby="gallery-swipe-hint"
      >
        {photos.map((p, i) => (
          <figure key={i} className="relative shrink-0 overflow-hidden bg-[#0d0609]"
            style={{ width: 'clamp(260px,36vw,420px)', height: 'clamp(340px,50vw,560px)' }}>
            <Image src={p.src} alt={p.label} loading="lazy" draggable={false}
              width={420} height={560} sizes="clamp(260px, 36vw, 420px)"
              className="w-full h-full object-cover select-none" />
            <figcaption className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-ink/70 via-ink/30 to-transparent">
              <p className="text-white text-[10px] tracking-[0.22em] uppercase font-[family-name:var(--font-inter)]">{p.label}</p>
              <p className="text-white/50 text-[10px] font-[family-name:var(--font-inter)] mt-0.5 tabular-nums">{String(i + 1).padStart(2,'0')} / {String(count).padStart(2,'0')}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Prev/next controls (desktop) */}
      <div className="hidden md:flex absolute top-1/2 left-5 -translate-y-1/2 z-10">
        <button onClick={() => scrollTo(Math.max(0, idx - 1))} aria-label="Previous photo"
          disabled={idx === 0}
          className="w-11 h-11 bg-white/90 text-ink flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      <div className="hidden md:flex absolute top-1/2 right-5 -translate-y-1/2 z-10">
        <button onClick={() => scrollTo(Math.min(count - 1, idx + 1))} aria-label="Next photo"
          disabled={idx === count - 1}
          className="w-11 h-11 bg-white/90 text-ink flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-0.5 mt-5" role="group" aria-label="Choose photo">
        {photos.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollTo(i)}
            aria-current={idx === i ? 'true' : undefined}
            aria-label={`Photo ${i + 1}`}
            className="tap-safe min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
          >
            <span
              className={`block h-[2px] transition-[width,background-color] duration-300 ${idx === i ? 'w-8 bg-ink' : 'w-3 bg-stone/30'}`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Urdu signature — see shared-chrome.jsx ───────────────────── */

/* ─── Kinetic wordmark divider (replaces plain marquee) ────────── */
export function WordmarkDivider() {
  return (
    <div aria-hidden="true" className="bg-white border-y border-border-soft overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-5 sm:py-6 md:py-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 md:gap-8 text-center sm:text-left">
        <span className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c9a98a]/50 to-[#c9a98a]" />
        <span className="font-[family-name:var(--font-fraunces)] font-bold text-ink tracking-[0.2em] text-[11px] md:text-[13px] shrink-0">
          F · B · S
        </span>
        <span className="hidden sm:inline text-[#c9a98a] text-xs" aria-hidden="true">✦</span>
        <span className="font-[family-name:var(--font-fraunces)] italic font-normal text-stone text-[11px] md:text-[13px] shrink-0 tracking-wide">
          Since 2008
        </span>
        <span className="flex-1 h-px bg-gradient-to-l from-transparent via-[#c9a98a]/50 to-[#c9a98a]" />
      </div>
    </div>
  )
}

/* ─── Service modal ────────────────────────────────────────────── */
export function ServiceModal({ service, onClose }) {
  const dialogRef  = useRef(null)
  const returnRef  = useRef(null)
  const titleId    = 'svc-modal-title'
  const descId     = 'svc-modal-desc'

  useEffect(() => {
    track('ServiceModalOpen', { service: service.name, category: service.category })
  }, [service.name, service.category])

  useEffect(() => {
    returnRef.current = document.activeElement
    document.body.style.overflow = 'hidden'

    const focusables = () => dialogRef.current?.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) ?? []
    const first = focusables()[0]
    first?.focus()

    const onKey = e => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab') {
        const list = Array.from(focusables())
        if (list.length === 0) return
        const f = list[0], l = list[list.length - 1]
        if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus() }
        else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      returnRef.current?.focus?.()
    }
  }, [onClose])

  const hasIncludes = Array.isArray(service.includes) && service.includes.length > 0

  return (
    <AnimatePresence>
      <m.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <m.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={service.desc ? descId : undefined}
          className="bg-white w-[min(100%,calc(100vw-1.5rem))] sm:w-full max-w-lg max-h-[min(85dvh,calc(100dvh-2rem))] overflow-hidden mx-auto"
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }} onClick={e => e.stopPropagation()}>
          <div className="p-6 md:p-8 flex flex-col max-h-[min(85dvh,calc(100dvh-2rem))] overflow-y-auto overscroll-contain">
            <div className="flex justify-between items-start mb-5">
              <span className="text-[10px] tracking-[0.2em] uppercase text-stone font-[family-name:var(--font-inter)]">{service.category}</span>
              {/* -m-2 keeps the icon where it was while the hit box grows to
                  44px; without it this was exactly the 20x20 icon. The booking
                  sheet's close button already does this. */}
              <button onClick={onClose} aria-label="Close dialog"
                className="tap-safe -m-2 p-2 inline-flex items-center justify-center text-stone hover:text-ink transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <h2 id={titleId} className="font-[family-name:var(--font-fraunces)] font-bold text-lg md:text-xl text-ink mb-2 leading-tight uppercase">
              {service.name}
            </h2>
            {(service.pricePkr != null || service.durationMinutes != null) && (
              <p className="text-accent-gold-deep text-sm font-[family-name:var(--font-inter)] font-medium mb-4 flex items-center gap-2">
                {service.pricePkr != null && <span>{formatServicePrice(service)}</span>}
                {service.pricePkr != null && service.durationMinutes != null && <span className="text-stone/30">·</span>}
                {service.durationMinutes != null && <span>{formatDuration(service.durationMinutes)}</span>}
              </p>
            )}
            {service.desc && (
              <p id={descId} className="text-stone text-sm font-light leading-relaxed mb-6">{service.desc}</p>
            )}
            {hasIncludes && (
              <div className="mb-7">
                <p className="text-[10px] tracking-widest uppercase font-medium text-stone mb-2 font-[family-name:var(--font-inter)]">What's included</p>
                <ul className="flex flex-col gap-1.5">
                  {service.includes.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-ink font-light">
                      <span className="w-1 h-1 rounded-full bg-ink shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-auto flex flex-col gap-2">
              <Link
                href={`/book?serviceId=${service.id}`}
                aria-label={`Continue to book ${service.name}`}
                onClick={() => {
                  track('BookingStarted', { source: 'service-modal', category: service.category || 'none' })
                  onClose()
                }}
                className="btn-primary tap-safe w-full"
              >
                Book {service.name} <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
              <a href={waLink(service.name)} target="_blank" rel="noreferrer"
                onClick={() => { track('WhatsAppIntent', { from: 'service-modal', service: service.name }); onClose() }}
                className="tap-safe inline-flex items-center justify-center gap-2 border border-border-soft text-ink text-[11px] tracking-[0.16em] uppercase font-semibold font-[family-name:var(--font-inter)] px-6 py-3.5 hover:bg-mist active:scale-[0.98] transition-[background-color,transform] duration-300">
                Book on WhatsApp <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>
  )
}

/* ─── Logo ─────────────────────────────────────────────────────── */
function Logo({ light }) {
  const [err, setErr] = useState(false)
  /* Fixed-height shell so wordmark ↔ image swap never shifts the header row. */
  const shell = 'inline-flex items-center justify-center h-8 w-auto max-w-[10rem]'
  const wordmark =
    "font-[family-name:var(--font-fraunces)] font-bold text-[13px] md:text-[14px] lg:text-[15px] tracking-[0.08em] md:tracking-[0.1em] leading-none"

  /* On dark transparent hero: white text looks cleaner than inverting the JPG
     (JPG has white background so brightness-0+invert turns it into a flat white blob) */
  if (!light) {
    return (
      <span className={`${shell} ${wordmark} text-white`}>
        FARWA
      </span>
    )
  }
  if (err) {
    return <span className={`${shell} ${wordmark} text-ink`}>FARWA</span>
  }
  return (
    <span className={shell}>
      <Image
        src="/logo.jpg"
        alt="Farwa Beauty Salon"
        width={40}
        height={40}
        sizes="40px"
        onError={() => setErr(true)}
        className="h-7 w-auto max-h-full object-contain object-left translate-y-px"
      />
    </span>
  )
}

/* ─── Navbar ───────────────────────────────────────────────────── */
export function Navbar({ transparent = false, onMobileOpenChange }) {
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => {
    setMobileOpen(false) // eslint-disable-line react-hooks/set-state-in-effect -- intentional: close mobile nav on route change
  }, [pathname])
  useEffect(() => {
    onMobileOpenChange?.(mobileOpen)
  }, [mobileOpen, onMobileOpenChange])
  const setMenuOpen = (next) => {
    setMobileOpen(next)
    onMobileOpenChange?.(next)
  }
  const light = scrolled || !transparent

  const navLinks = [
    { label: 'Home',         href: '/', wideOnly: false },
    { label: 'Services',     href: '/services', wideOnly: false },
    { label: 'Prices',       href: '/prices', wideOnly: false },
    { label: 'Book',         href: '/book', wideOnly: false, hideOnDesktop: true },
    /* Gallery / About stay reachable but not primary conversion paths vs Book. */
    { label: 'Gallery',      href: '/gallery', wideOnly: true },
    { label: 'Blog',         href: '/blog', wideOnly: true },
    { label: 'About',        href: '/about', wideOnly: true },
    { label: 'FAQ',          href: '/faq', wideOnly: true },
    { label: 'Contact',      href: '/contact', wideOnly: false },
  ]

  /* Always keep a 1px border slot so scroll color-swap never changes bar height. */
  const headerSurface = scrolled
    ? 'bg-white/95 backdrop-blur-md border-b border-[#e4ddd7]'
    : transparent
      ? 'bg-ink/35 backdrop-blur-md border-b border-white/[0.08]'
      : 'bg-white/95 backdrop-blur-md border-b border-[#e4ddd7]'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 pt-[env(safe-area-inset-top,0px)] isolate [backface-visibility:hidden] animate-[navSlideIn_0.55s_cubic-bezier(0.16,1,0.3,1)_both] ${headerSurface}`}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-6 lg:px-10 h-14 flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between md:justify-normal gap-3 min-w-0">
        <Link href="/" className="justify-self-start shrink-0 min-w-0 inline-flex items-center h-11">
          <Logo light={light} />
        </Link>
        <nav
          className="hidden md:flex items-center justify-center gap-x-2 md:gap-x-3 lg:gap-x-4 min-w-0 max-w-[min(100%,42rem)] justify-self-center self-center h-11 px-1"
          aria-label="Main navigation"
        >
          {navLinks.map(({ label, href, wideOnly, hideOnDesktop }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`nav-link shrink-0 h-11 min-h-[44px] px-1 text-[10px] md:text-[11px] lg:text-[12px] tracking-[0.18em] uppercase font-medium font-[family-name:var(--font-inter)] transition-colors duration-200 whitespace-nowrap
                ${hideOnDesktop ? 'md:hidden' : ''}
                ${wideOnly ? 'hidden lg:inline-flex' : ''}
                ${isActive ? `nav-link--active ${light ? 'nav-link--on-light text-ink' : 'nav-link--on-dark text-white'}` : (light ? 'text-ink/60 hover:text-ink' : 'text-white/65 hover:text-white')}`}>
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="justify-self-end flex items-center gap-2 sm:gap-3 shrink-0 min-w-0 h-11">
          <Link href="/book"
            className={`hidden md:inline-flex items-center justify-center gap-1.5 h-11 min-h-[44px] text-[11px] lg:text-[12px] tracking-[0.14em] uppercase font-semibold font-[family-name:var(--font-inter)] leading-none px-4 lg:px-5 rounded-sm border transition-colors duration-300 whitespace-nowrap active:scale-[0.98] ${
              light
                ? 'bg-ink text-white border-ink hover:bg-stone hover:border-stone'
                : 'bg-transparent text-white border-white/70 hover:bg-white hover:text-ink hover:border-white'
            }`}>
            <span className="lg:hidden">Book</span>
            <span className="hidden lg:inline">Book an Appointment</span>
          </Link>
          <button
            type="button"
            className={`md:hidden min-w-[44px] min-h-[44px] h-11 w-11 flex items-center justify-center ${light ? 'text-ink' : 'text-white'}`}
            onClick={() => setMenuOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Menu'}
            aria-expanded={mobileOpen}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-white border-t border-border-soft">
            <div className="px-5 py-5 flex flex-col gap-1">
              {navLinks.map(({ label, href }) => (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                  className="tap-safe inline-flex items-center min-h-[44px] text-[11px] tracking-[0.18em] uppercase text-stone hover:text-ink font-[family-name:var(--font-inter)]">
                  {label}
                </Link>
              ))}
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  track('DirectionsIntent', { from: 'mobile-nav' })
                  setMenuOpen(false)
                }}
                className="tap-safe inline-flex items-center min-h-[44px] text-[11px] tracking-[0.18em] uppercase text-stone hover:text-ink font-[family-name:var(--font-inter)] mt-2 border-t border-border-soft pt-3"
              >
                Visit Us · Directions
              </a>
              <Link href="/book" onClick={() => setMenuOpen(false)}
                className="tap-safe inline-flex items-center justify-center min-h-[44px] bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-medium font-[family-name:var(--font-inter)] px-5 py-3 w-full sm:w-fit mt-3">
                Book an Appointment
              </Link>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  )
}

/* ─── Footer lives in app/components/site-footer.jsx (separate chunk) ─ */

const CATEGORY_SLUG_SET = new Set(Object.values(CAT_SLUGS))

/** Paths that show the 3-action mobile CTA bar (call / WhatsApp / book). */
export function shouldShowMobileCtaBar(pathname) {
  if (
    pathname === '/' ||
    pathname === '/services' ||
    pathname === '/bridal' ||
    pathname === '/prices' ||
    pathname === '/gallery' ||
    pathname === '/beauty-salon-karachi' ||
    pathname === '/contact' ||
    pathname === '/freedom-deal' ||
    pathname === '/deals' ||
    pathname === '/about'
  ) {
    return true
  }
  const m = pathname.match(/^\/services\/([^/]+)$/)
  if (!m) return false
  const slug = m[1]
  if (slug.includes('-in-') || slug.startsWith('best-')) return false
  return CATEGORY_SLUG_SET.has(slug)
}

/* ─── Mobile CTA bar: tel + WhatsApp + book (key landing pages) ─ */
export function StickyMobileCTA({ hidden = false }) {
  const pathname = usePathname()
  const slot = useNextSlot()
  const showSlotHint = pathname === '/'
  if (hidden) return null
  return (
    <>
      <div
        aria-hidden
        className={`md:hidden shrink-0 ${showSlotHint ? 'h-[calc(7rem+env(safe-area-inset-bottom,0px))]' : 'h-[calc(5.5rem+env(safe-area-inset-bottom,0px))]'}`}
      />
      <nav
        className="fixed z-50 left-0 right-0 md:hidden max-w-[100vw] pointer-events-none"
        style={{ bottom: 'max(0.6rem, env(safe-area-inset-bottom, 0px))' }}
        aria-label="Quick contact and booking"
      >
        <div className="sticky-cta-enter pointer-events-auto mx-3.5 flex flex-col rounded-sm bg-ink/[0.94] backdrop-blur-md shadow-soft border border-white/[0.08] min-w-0 max-w-[calc(100vw-1.75rem)] overflow-hidden">
          {showSlotHint && (
            <p className="px-3 pt-1.5 pb-0 text-center text-[8px] tracking-[0.12em] uppercase text-white/40 font-[family-name:var(--font-inter)] leading-none">
              <span
                className={`inline-block w-1 h-1 rounded-full mr-1.5 align-middle ${slot.open ? 'bg-[#9cd48c]' : 'bg-[var(--accent-gold)]'}`}
                aria-hidden="true"
              />
              Next slot <span className="text-white/70 font-medium">{slot.label}</span>
            </p>
          )}
          <div className="flex items-stretch gap-0.5 p-1">
            <a
              href={`tel:+${WA_NUMBER}`}
              aria-label="Call the salon"
              onClick={() => track('CallIntent', { from: 'sticky-bar' })}
              className="tap-safe min-h-[44px] flex-1 inline-flex items-center justify-center gap-1.5 text-white/80 hover:text-white active:scale-[0.98] text-[10px] tracking-[0.12em] uppercase font-medium font-[family-name:var(--font-inter)] py-2.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Call
            </a>
            <span aria-hidden="true" className="w-px bg-white/10 my-2" />
            <a
              href={WA_DEFAULT}
              target="_blank"
              rel="noreferrer"
              onClick={() => track('WhatsAppIntent', { from: 'sticky-bar' })}
              aria-label="Message the salon on WhatsApp"
              className="tap-safe min-h-[44px] flex-1 inline-flex items-center justify-center gap-1.5 text-white/80 hover:text-white active:scale-[0.98] text-[10px] tracking-[0.12em] uppercase font-medium font-[family-name:var(--font-inter)] py-2.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              WhatsApp
            </a>
            <Link
              href="/book"
              aria-label="Book an appointment online"
              className="tap-safe min-h-[44px] flex-[1.3] inline-flex items-center justify-center gap-1.5 bg-white text-ink active:scale-[0.98] text-[10px] tracking-[0.14em] uppercase font-semibold font-[family-name:var(--font-inter)] rounded-sm py-2.5"
            >
              Book <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}

/* ─── Sticky booking pill (other pages, mobile only) ───────────── */
export function StickyWA({ hidden = false }) {
  if (hidden) return null
  return (
    <>
      <div aria-hidden className="h-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:hidden shrink-0" />
      <div className="fixed z-50 left-0 right-0 flex justify-center md:hidden pointer-events-none px-4"
        style={{ bottom: 'max(0.6rem, env(safe-area-inset-bottom, 0px))' }}>
        <div className="sticky-cta-enter">
          <Link href="/book"
            className="tap-safe min-h-[44px] pointer-events-auto inline-flex items-center gap-2 bg-ink/[0.92] backdrop-blur-md text-white text-[10px] tracking-[0.14em] uppercase font-semibold font-[family-name:var(--font-inter)] px-7 py-3 rounded-lg border border-white/[0.08] shadow-lg shadow-ink/25">
            Book Online <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </>
  )
}

/* ─── Lazy video — IntersectionObserver-controlled ─────────────── */
// eslint-disable-next-line no-unused-vars -- autoPlay is IO-controlled, not forwarded to <video>
export function LazyVideo({ src, poster, className, autoPlay, ...props }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    /* A looping autoplay video with no pause control is exactly what
       prefers-reduced-motion exists to stop (WCAG 2.2.2). The hero video already
       checks this; this component did not, so the same user got the animation
       anyway — and paid for the download. Bailing here also means the source is
       never attached, so nothing is fetched. */
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        el.play?.().catch(() => {})
      } else {
        el.pause?.()
      }
    }, { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const webm = webmSourceFor(src)

  return (
    <video
      ref={ref}
      poster={visible ? poster : undefined}
      preload={visible ? 'metadata' : 'none'}
      muted
      loop
      playsInline
      className={className}
      {...props}
    >
      {visible && webm && <source src={webm} type="video/webm" />}
      {visible && <source src={src} type="video/mp4" />}
    </video>
  )
}

/* ─── Re-exports ───────────────────────────────────────────────── */
export { WA_NUMBER, MAPS_LINK, IG_LINK, WA_DEFAULT, waLink, formatPrice, formatServicePrice, formatDuration, CAT_SLUGS }
export { useNextSlot } from './use-next-slot.js'
