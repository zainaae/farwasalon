'use client'
import { useEffect, useRef, useState, useCallback, createContext, useContext } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { X, Menu, ArrowUpRight, ChevronLeft, ChevronRight, Clock, Sparkles, Check, Phone, MessageCircle, Star } from 'lucide-react'
import { WA_NUMBER, MAPS_LINK, IG_LINK, WA_DEFAULT, waLink, waLinkBooking, SERVICES, ALL_SERVICES, CATEGORIES, formatPrice, formatDuration, track, CAT_SLUGS, CAT_SEO, CAT_FAQS } from './data.js'
import { toLocalDateString } from '../lib/date-local.js'
import { webmSourceFor } from '../lib/video-manifest.js'
import { SALON_ADDRESS_LINES } from '../lib/business-schema.js'
import FooterNewsletter from '../app/components/footer-newsletter.jsx'

/** Standard CTA copy — use for primary book actions sitewide. */
export const CTA_PRIMARY_LABEL = 'Book appointment'
export const CTA_WHATSAPP_HINT = 'Or message us on WhatsApp'

/* ─── Live "next available slot" based on Mon–Sat 11am–7pm ────── */
export function useNextSlot() {
  const [slot, setSlot] = useState({ label: 'Book Online', open: false })
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe: SSR uses static default, client computes live slot on mount
    setSlot(computeNextSlot())
    const id = setInterval(() => setSlot(computeNextSlot()), 60_000)
    return () => clearInterval(id)
  }, [])
  return slot
}
function computeNextSlot() {
  const now  = new Date()
  const day  = now.getDay() // 0 Sun..6 Sat
  const hr   = now.getHours()
  const isOpen = day !== 0 && hr >= 11 && hr < 19
  if (isOpen) {
    const min = now.getMinutes()
    let h = hr, m = min < 30 ? 30 : 0
    if (min >= 30) h = Math.min(18, hr + 1)
    if (h > 18 || (h === 18 && m > 30)) {
      return day === 6
        ? { label: 'Monday · 11:00am', open: false }
        : { label: 'Tomorrow · 11:00am', open: false }
    }
    const suffix = h >= 12 ? 'pm' : 'am'
    const h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h)
    return { label: `Today · ${h12}:${String(m).padStart(2,'0')}${suffix}`, open: true }
  }
  if (day === 0) return { label: 'Tomorrow · 11:00am', open: false } // Sunday closed → Monday
  if (day === 6 && hr >= 19) return { label: 'Monday · 11:00am', open: false }
  if (hr < 11) return { label: 'Today · 11:00am', open: false }
  return { label: 'Tomorrow · 11:00am', open: false }
}

/* ─── Skip-to-content link (keyboard a11y) ─────────────────────── */
export function SkipLink() {
  return (
    <a href="#main" className="skip-link">
      Skip to content
    </a>
  )
}

/* ─── Responsive Facebook post embed (scales iframe to container) ── */
export function FbEmbed({ src, height = 200, title, reviewerName }) {
  const wrapRef = useRef(null)
  const [scale,  setScale]  = useState(1)
  const [ready,  setReady]  = useState(false)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const compute = () => {
      const w = el.offsetWidth
      if (w > 0) {
        setScale(Math.min(1, w / 500))
        setReady(true)
      }
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={wrapRef} className="fb-embed-frame"
      style={{ height: ready ? height * scale : height }}>
      <iframe
        src={src}
        width="500"
        height={height}
        style={{ transform: `scale(${scale})`, width: '500px' }}
        scrolling="no"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        title={title || (reviewerName ? `Review by ${reviewerName} on Facebook` : 'Facebook review')}
        loading="lazy"
      />
    </div>
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

/* ─── Instagram icon (removed from lucide-react v1.x) ────────── */
export function IgIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4.5"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  )
}

/* ─── Animated counter ─────────────────────────────────────────── */
export function AnimatedNumber({ display, final, ariaLabel = display }) {
  const ref   = useRef(null)
  const [shown, setShown] = useState(display)
  const fired = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const isK    = display.includes('k')
    const hasPlus = display.includes('+')
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting || fired.current) return
      fired.current = true
      io.disconnect()
      const t0  = performance.now()
      const dur = 1800
      const tick = now => {
        const p    = Math.min((now - t0) / dur, 1)
        const ease = 1 - Math.pow(1 - p, 3)
        const val  = Math.round(final * ease)
        if (isK) setShown((val >= 1000 ? Math.floor(val / 1000) + 'k' : val) + (hasPlus ? '+' : ''))
        else setShown(val + (hasPlus ? '+' : ''))
        if (p < 1) requestAnimationFrame(tick)
        else setShown(display)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [display, final])
  return (
    <span ref={ref}>
      <span className="sr-only">{ariaLabel}</span>
      <span aria-hidden="true">{shown}</span>
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
              <p className="text-white text-[10px] tracking-[0.22em] uppercase font-['Inter']">{p.label}</p>
              <p className="text-white/50 text-[10px] font-['Inter'] mt-0.5 tabular-nums">{String(i + 1).padStart(2,'0')} / {String(count).padStart(2,'0')}</p>
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

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mt-5" role="group" aria-label="Choose photo">
        {photos.map((_, i) => (
          <button key={i} type="button" onClick={() => scrollTo(i)}
            aria-current={idx === i ? 'true' : undefined} aria-label={`Photo ${i + 1}`}
            className={`h-[2px] transition-all duration-300 ${idx === i ? 'w-8 bg-ink' : 'w-3 bg-stone/30 hover:bg-stone/60'}`} />
        ))}
      </div>
    </div>
  )
}

/* ─── Visual month calendar (used inside BookingSheet) ─────────── */
function MonthCalendar({ value, onChange }) {
  const [todayStart] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [yr, setYr] = useState(() => todayStart.getFullYear())
  const [mo, setMo] = useState(() => todayStart.getMonth())

  const firstWeekday = new Date(yr, mo, 1).getDay()
  const daysInMonth  = new Date(yr, mo + 1, 0).getDate()
  const monthLabel   = new Date(yr, mo).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const todayStr     = toLocalDateString(todayStart)

  const prev = () => { const d = new Date(yr, mo - 1); setYr(d.getFullYear()); setMo(d.getMonth()) }
  const next = () => { const d = new Date(yr, mo + 1); setYr(d.getFullYear()); setMo(d.getMonth()) }
  const canPrev = new Date(yr, mo) > new Date(todayStart.getFullYear(), todayStart.getMonth())

  const strFor   = (day) => toLocalDateString(new Date(yr, mo, day))
  const dayOfWk  = (day) => new Date(yr, mo, day).getDay()
  const isPast   = (day) => { const d = new Date(yr, mo, day); d.setHours(0,0,0,0); return d < todayStart }
  const isClosed = (day) => dayOfWk(day) === 0  // Sunday
  const isSel    = (day) => value === strFor(day)
  const isToday  = (day) => strFor(day) === todayStr

  /* Cells: leading nulls + day numbers */
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prev} disabled={!canPrev}
          className="w-9 h-9 flex items-center justify-center text-stone hover:text-ink disabled:opacity-25 transition-colors"
          aria-label="Previous month">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-['Syne'] font-bold text-sm text-ink">{monthLabel}</span>
        <button type="button" onClick={next}
          className="w-9 h-9 flex items-center justify-center text-stone hover:text-ink transition-colors"
          aria-label="Next month">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d, i) => (
          <div key={d}
            className={`text-center text-[9px] tracking-wide uppercase font-['Inter'] py-1.5 ${i === 0 ? 'text-stone/30' : 'text-stone'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const disabled = isPast(day) || isClosed(day)
          const sel      = isSel(day)
          const today    = isToday(day)
          return (
            <button key={day} type="button"
              onClick={() => !disabled && onChange(strFor(day))}
              disabled={disabled}
              aria-label={disabled ? undefined : strFor(day)}
              aria-pressed={sel}
              className={[
                'aspect-square flex items-center justify-center text-[12px] font-[\'Inter\'] transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a98a]',
                disabled
                  ? 'text-stone/20 cursor-not-allowed'
                  : 'hover:bg-[#f0ebe6] cursor-pointer text-ink',
                sel
                  ? '!bg-ink !text-white font-bold'
                  : '',
                today && !sel
                  ? 'border border-[#c9a98a]'
                  : '',
              ].filter(Boolean).join(' ')}
            >
              {day}
            </button>
          )
        })}
      </div>

      <p className="text-[9px] text-stone/45 font-['Inter'] mt-3 flex items-center gap-3">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 border border-[#c9a98a]" aria-hidden="true" /> Today
        </span>
        <span className="text-stone/25">Su = Closed</span>
      </p>
    </div>
  )
}

function BookingSheetSelectedChips({ picked, onRemove }) {
  if (picked.length === 0) return null
  return (
    <div>
      <p className="text-stone text-[10px] tracking-[0.22em] uppercase font-['Inter'] mb-2">Selected ({picked.length})</p>
      <ul className="flex flex-wrap gap-2 mb-4" aria-label="Selected services">
        {picked.map((p) => (
          <li key={p.id}>
            <span className="inline-flex items-center gap-1.5 max-w-full pl-3 pr-1 py-1.5 bg-mist border border-border-soft text-[11px] font-['Inter'] text-ink">
              <span className="truncate font-['Syne'] font-semibold uppercase tracking-tight">{p.name}</span>
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                className="tap-safe shrink-0 p-1.5 text-stone hover:text-ink rounded-none"
                aria-label={`Remove ${p.name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─── Smart Booking Sheet — multi-service step 1 → date → WhatsApp ── */
export function BookingSheet({ open, onClose, initialCategory = null, initialPicked = null }) {
  const [step, setStep] = useState(0)
  const [cat, setCat] = useState(initialCategory)
  /** @type {{ id: string|number, name: string }[]} */
  const [picked, setPicked] = useState([])
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [bkName, setBkName] = useState('')
  const [fallbackUrl, setFallbackUrl] = useState(null)
  const sheetRef = useRef(null)
  const returnRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync category/picked when overlay opens from provider
    setCat(initialCategory ?? null)
    if (initialPicked && initialPicked.length > 0) {
      setPicked(initialPicked)
    }
    return undefined
  }, [open, initialCategory, initialPicked])

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep(0)
        setCat(initialCategory)
        setPicked([])
        setDate('')
        setTime('')
        setBkName('')
        setFallbackUrl(null)
      }, 350)
      return () => clearTimeout(t)
    }
    return undefined
  }, [open, initialCategory])

  useEffect(() => {
    if (!open) return
    returnRef.current = document.activeElement
    document.body.style.overflow = 'hidden'

    const focusables = () => sheetRef.current?.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) ?? []
    const first = focusables()[0]
    first?.focus()

    const onKey = (e) => {
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
  }, [open, onClose])

  const toggleService = useCallback((s) => {
    const id = s.id
    setPicked((prev) => {
      const ex = prev.find((p) => p.id === id)
      if (ex) return prev.filter((p) => p.id !== id)
      return [...prev, { id, name: s.name }]
    })
  }, [])

  const removePick = useCallback((id) => {
    setPicked((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const toggleCategoryHint = useCallback(() => {
    if (!cat) return
    const id = `__cat__:${cat}`
    setPicked((prev) => {
      const ex = prev.find((p) => p.id === id)
      if (ex) return prev.filter((p) => p.id !== id)
      return [...prev, { id, name: cat }]
    })
  }, [cat])

  const serviceNamesSummary = picked.map((p) => p.name).join(', ')

  const handleBook = () => {
    const names = picked.map((p) => p.name).filter(Boolean)
    const url = waLinkBooking(names, { date, time, name: bkName })
    track('WhatsAppIntent', { source: 'BookingSheet', services: names.join(', ') })
    const win = window.open(url, '_blank', 'noopener,noreferrer')
    if (!win) {
      setFallbackUrl(url)
      return
    }
    onClose()
  }

  const timeOptions = ['11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM']

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-ink/[0.62]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="booking-title"
        >
          <m.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full md:max-w-xl md:mx-4 rounded-t-2xl md:rounded-none flex flex-col max-h-[min(92dvh,calc(100svh-env(safe-area-inset-bottom,0px)))] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] md:shadow-none"
          >
            <div className="flex items-center justify-between px-5 md:px-7 py-3.5 md:py-4 border-b border-border-soft">
              <div>
                <p className="text-stone text-[10px] tracking-[0.24em] uppercase font-['Inter']">Step {step + 1} of 3</p>
                <h2 id="booking-title" className="font-['Unbounded'] font-bold text-ink text-base md:text-lg mt-0.5">
                  {step === 0 && 'Choose services'}
                  {step === 1 && 'Pick a date'}
                  {step === 2 && 'Pick a time'}
                </h2>
              </div>
              <button type="button" onClick={onClose} aria-label="Close booking"
                className="tap-safe text-stone hover:text-ink transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-[2px] bg-[#e4ddd7] w-full">
              <div
                className="h-full bg-gradient-to-r from-[#c9a98a] to-[#8b6d59] transition-all duration-400"
                style={{ width: `${((step + 1) / 3) * 100}%` }}
              />
            </div>

            <div ref={sheetRef} className="flex-1 overflow-y-auto px-5 md:px-7 py-5 md:py-6 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] md:pb-6 overscroll-contain flex flex-col min-h-0">
              {fallbackUrl && (
                <div className="mb-4 p-3 border border-[#c9a98a] bg-[#faf7f5]">
                  <p className="text-ink text-xs font-['Inter'] mb-2">Popup was blocked. Open WhatsApp manually:</p>
                  <a href={fallbackUrl} target="_blank" rel="noreferrer"
                    className="text-[#8b6d59] underline text-xs font-['Inter'] font-medium break-all">
                    Open WhatsApp manually →
                  </a>
                </div>
              )}
              {step === 0 && (
                <>
                  <div className="mb-4">
                    <label htmlFor="bk-name" className="sr-only">Your name</label>
                    <input id="bk-name" type="text" placeholder="Your name" autoComplete="name"
                      value={bkName} onChange={e => setBkName(e.target.value)}
                      className="border border-border-soft text-ink placeholder-stone text-sm font-['Inter'] px-4 py-2.5 w-full focus:outline-none focus:border-ink transition-colors bg-white" />
                  </div>
                  <BookingSheetSelectedChips picked={picked} onRemove={removePick} />
                  {!cat ? (
                    <div className="flex-1">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {Object.keys(SERVICES).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCat(c)}
                            className="tap-safe p-3 border border-border-soft hover:border-ink hover:bg-mist transition-all text-left"
                          >
                            <p className="font-['Syne'] font-bold text-xs text-ink uppercase leading-tight">{c}</p>
                            <p className="text-stone text-[10px] font-['Inter'] mt-1">{SERVICES[c].length} services</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col min-h-0">
                      <button
                        type="button"
                        onClick={() => setCat(null)}
                        className="mb-3 shrink-0 inline-flex items-center gap-1.5 text-stone text-[10px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors"
                      >
                        <ChevronLeft className="w-3 h-3" /> Add from another category
                      </button>
                      <p className="text-stone text-[10px] tracking-[0.22em] uppercase font-['Inter'] mb-2">{cat}</p>
                      <p className="text-[11px] text-stone/80 font-['Inter'] font-light mb-3">
                        Tap to select one or more. Then continue when you&apos;re ready.
                      </p>
                      <div className="flex flex-col divide-y divide-[#e4ddd7] border-y border-border-soft flex-1 min-h-0 overflow-y-auto overscroll-contain">
                        {(SERVICES[cat] ?? []).map((s) => {
                          const sel = picked.some((p) => p.id === s.id)
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => toggleService(s)}
                              aria-pressed={sel}
                              className={`tap-safe flex items-center justify-between gap-3 py-3.5 text-left transition-colors ${
                                sel ? 'bg-[#faf7f5] pl-2' : 'hover:bg-mist hover:pl-2'
                              }`}
                            >
                              <div className="min-w-0">
                                <span className="font-['Syne'] font-bold text-[13px] text-ink uppercase block">{s.name}</span>
                                {(s.pricePkr != null || s.durationMinutes != null) && (
                                  <span className="text-stone text-[10px] font-['Inter'] mt-0.5 block">
                                    {s.pricePkr != null && formatPrice(s.pricePkr)}
                                    {s.pricePkr != null && s.durationMinutes != null && ' · '}
                                    {s.durationMinutes != null && formatDuration(s.durationMinutes)}
                                  </span>
                                )}
                              </div>
                              <span
                                className={`shrink-0 w-8 h-8 flex items-center justify-center border ${
                                  sel ? 'border-ink bg-ink text-white' : 'border-border-soft text-transparent'
                                }`}
                                aria-hidden="true"
                              >
                                <Check className="w-4 h-4" strokeWidth={2.5} />
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={toggleCategoryHint}
                        className="mt-4 text-left text-stone text-[10px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors"
                      >
                        {cat && picked.some((p) => p.id === `__cat__:${cat}`)
                          ? `Remove "${cat}" general booking`
                          : `Not sure which treatment · include "${cat}" as a note`}
                      </button>
                    </div>
                  )}

                  {picked.length > 0 && (
                    <div className="sticky bottom-0 z-[1] -mx-2 px-2 pt-4 mt-4 border-t border-border-soft bg-white shrink-0">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="tap-safe w-full inline-flex items-center justify-center gap-2 bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-3.5 hover:bg-stone transition-colors"
                      >
                        Continue · {picked.length} service{picked.length === 1 ? '' : 's'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {step === 1 && (
                <div>
                  <p className="text-stone text-sm font-['Inter'] font-light mb-2">
                    <span className="text-ink font-medium">{picked.length}</span>{' '}
                    service{picked.length === 1 ? '' : 's'} selected
                  </p>
                  {picked.length <= 3 ? (
                    <p className="text-ink text-xs font-['Inter'] mb-5 leading-relaxed">{serviceNamesSummary}</p>
                  ) : (
                    <ul className="text-ink text-xs font-['Inter'] mb-5 list-disc pl-5 space-y-1 max-h-[5.5rem] overflow-y-auto">
                      {picked.map((p) => (
                        <li key={p.id}>{p.name}</li>
                      ))}
                    </ul>
                  )}
                  <MonthCalendar value={date} onChange={(d) => { setDate(d); setStep(2) }} />
                  <div className="flex justify-start gap-2 mt-5 pt-4 border-t border-border-soft">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="tap-safe text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] px-4 py-3 hover:text-ink transition-colors"
                    >
                      ← Back
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <p className="text-stone text-sm font-['Inter'] font-light mb-2">
                    {picked.length} service{picked.length === 1 ? '' : 's'} ·{' '}
                    <span className="text-ink font-medium">{date ? new Date(`${date}T12:00:00`).toDateString() : ''}</span>
                  </p>
                  <div className="grid grid-cols-2 min-[420px]:grid-cols-3 gap-2 mb-5">
                    {timeOptions.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTime(t)}
                        className={`tap-safe py-3 border text-[11px] tracking-wide font-['Syne'] font-bold transition-all ${
                          time === t
                            ? 'bg-ink text-white border-ink'
                            : 'border-border-soft text-ink hover:border-ink hover:bg-mist'
                        }`}
                      >
                        <Clock className="w-3 h-3 inline mr-1 opacity-60" aria-hidden="true" />
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between gap-2 pt-3 border-t border-border-soft">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="tap-safe text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] px-4 py-3 hover:text-ink"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleBook}
                      disabled={!time}
                      className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-3.5 hover:bg-stone disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Send on WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

/* ─── Booking context (global access) ──────────────────────────── */
const BookingCtx = createContext({ open: () => {}, addService: () => {} })
export function BookingProvider({ children }) {
  const [state, setState] = useState({ open: false, category: null, initialPicked: null })
  const value = {
    open: (category = null, source = 'unknown') => {
      track('BookingStarted', { source, category: category || 'none' })
      setState({ open: true, category, initialPicked: null })
    },
    addService: (service, source = 'modal') => {
      track('BookingStarted', { source, category: service.category || 'none' })
      setState({ open: true, category: service.category, initialPicked: [{ id: service.id, name: service.name }] })
    },
    close: () => setState(s => ({ ...s, open: false })),
  }
  return (
    <BookingCtx.Provider value={value}>
      {children}
      <BookingSheet open={state.open} initialCategory={state.category} initialPicked={state.initialPicked} onClose={value.close} />
    </BookingCtx.Provider>
  )
}
export function useBooking() { return useContext(BookingCtx) }

/* ─── Urdu Nastaliq signature (cultural touch) ─────────────────── */
export function UrduSignature({ className = '' }) {
  return (
    <span className={`font-nastaliq text-[1.1em] ${className}`} dir="rtl" lang="ur" aria-label="Farwa Beauty Salon in Urdu">
      فروا بیوٹی سیلون
    </span>
  )
}

/* ─── Kinetic wordmark divider (replaces plain marquee) ────────── */
export function WordmarkDivider() {
  return (
    <div aria-hidden="true" className="bg-white border-y border-border-soft overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-5 sm:py-6 md:py-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 md:gap-8 text-center sm:text-left">
        <span className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c9a98a]/50 to-[#c9a98a]" />
        <span className="font-['Unbounded'] font-black text-ink tracking-[0.3em] text-[11px] md:text-[13px] shrink-0">
          F · B · S
        </span>
        <span className="hidden sm:inline text-[#c9a98a] text-xs" aria-hidden="true">✦</span>
        <span className="font-['Syne'] italic font-light text-stone text-[11px] md:text-[13px] shrink-0 tracking-wide">
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
  const booking    = useBooking()
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
              <span className="text-[10px] tracking-[0.2em] uppercase text-stone font-['Inter']">{service.category}</span>
              <button onClick={onClose} aria-label="Close dialog"
                className="text-stone hover:text-ink transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <h2 id={titleId} className="font-['Unbounded'] font-bold text-lg md:text-xl text-ink mb-2 leading-tight uppercase">
              {service.name}
            </h2>
            {(service.pricePkr != null || service.durationMinutes != null) && (
              <p className="text-[#c9a98a] text-sm font-['Inter'] font-medium mb-4 flex items-center gap-2">
                {service.pricePkr != null && <span>{formatPrice(service.pricePkr)}</span>}
                {service.pricePkr != null && service.durationMinutes != null && <span className="text-stone/30">·</span>}
                {service.durationMinutes != null && <span>{formatDuration(service.durationMinutes)}</span>}
              </p>
            )}
            {service.desc && (
              <p id={descId} className="text-stone text-sm font-light leading-relaxed mb-6">{service.desc}</p>
            )}
            {hasIncludes && (
              <div className="mb-7">
                <p className="text-[10px] tracking-widest uppercase font-medium text-stone mb-2 font-['Inter']">What's included</p>
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
              <button type="button"
                onClick={() => { booking.addService(service, 'modal'); onClose() }}
                className="inline-flex items-center justify-center gap-2 bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-4 hover:bg-stone active:scale-[0.98] transition-all duration-300">
                <Sparkles className="w-3.5 h-3.5" /> Add to Booking
              </button>
              <a href={waLink(service.name)} target="_blank" rel="noreferrer" onClick={onClose}
                className="inline-flex items-center justify-center gap-2 border border-border-soft text-ink text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-3.5 hover:bg-mist active:scale-[0.98] transition-all duration-300">
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
  /* On dark transparent hero: white text looks cleaner than inverting the JPG
     (JPG has white background so brightness-0+invert turns it into a flat white blob) */
  if (!light) {
    return (
      <span className="font-['Unbounded'] font-bold text-[12px] md:text-[13px] lg:text-[14px] tracking-[0.14em] md:tracking-[0.16em] text-white">
        FARWA
      </span>
    )
  }
  if (err) {
    return <span className="font-['Unbounded'] font-bold text-[12px] md:text-[13px] lg:text-[14px] tracking-[0.14em] md:tracking-[0.16em] text-ink">FARWA</span>
  }
  return (
    <Image
      src="/logo.jpg"
      alt="Farwa Beauty Salon"
      width={945}
      height={945}
      onError={() => setErr(true)}
      className="h-8 md:h-[2.125rem] w-auto object-contain transition-opacity duration-300"
    />
  )
}

/* ─── Navbar ───────────────────────────────────────────────────── */
export function Navbar({ transparent = false }) {
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
  const light = scrolled || !transparent

  const navLinks = [
    { label: 'Home',         href: '/', wideOnly: false },
    { label: 'Services',     href: '/services', wideOnly: false },
    { label: 'Book',         href: '/book', wideOnly: false, hideOnDesktop: true },
    { label: 'Gallery',      href: '/gallery', wideOnly: false },
    { label: 'Blog',         href: '/blog', wideOnly: true },
    { label: 'About',        href: '/about', wideOnly: true },
    { label: 'Team',         href: '/team', wideOnly: true },
    { label: 'FAQ',          href: '/faq', wideOnly: true },
    { label: 'Contact',      href: '/contact', wideOnly: false },
  ]

  const headerSurface = scrolled
    ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_#e4ddd7]'
    : transparent
      ? 'bg-ink/35 backdrop-blur-md border-b border-white/[0.08]'
      : 'bg-white/95 backdrop-blur-md'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 pt-[env(safe-area-inset-top,0px)] isolate [backface-visibility:hidden] animate-[navSlideIn_0.55s_cubic-bezier(0.16,1,0.3,1)_both] ${headerSurface}`}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-6 lg:px-10 h-[3.375rem] md:h-14 flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between md:justify-normal gap-3 min-w-0">
        <Link href="/" className="justify-self-start shrink-0 min-w-0">
          <Logo light={light} />
        </Link>
        <nav
          className="hidden md:flex items-center justify-center gap-x-3 md:gap-x-4 lg:gap-x-5 min-w-0 max-w-[min(100%,42rem)] justify-self-center px-1"
          aria-label="Main navigation"
        >
          {navLinks.map(({ label, href, wideOnly, hideOnDesktop }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`nav-link shrink-0 text-[9px] md:text-[10px] lg:text-[11px] tracking-[0.16em] md:tracking-[0.18em] lg:tracking-[0.2em] uppercase font-medium font-['Inter'] transition-colors duration-200 whitespace-nowrap
                ${hideOnDesktop ? 'md:hidden' : ''}
                ${wideOnly ? 'hidden lg:inline-block' : ''}
                ${isActive ? `nav-link--active ${light ? 'nav-link--on-light text-ink' : 'nav-link--on-dark text-white'}` : (light ? 'text-stone hover:text-ink' : 'text-white/65 hover:text-white')}`}>
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="justify-self-end flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <Link href="/book"
            className={`hidden md:inline-flex items-center gap-1.5 text-[9px] md:text-[10px] lg:text-[11px] tracking-[0.14em] lg:tracking-[0.16em] uppercase font-semibold font-['Inter'] px-3 md:px-3.5 lg:px-4 py-2 rounded-sm border transition-all duration-300 whitespace-nowrap active:scale-[0.98] ${
              light
                ? 'bg-ink text-white border-ink hover:bg-stone hover:border-stone'
                : 'bg-transparent text-white border-white/70 hover:bg-white hover:text-ink hover:border-white'
            }`}>
            <span className="lg:hidden">Book</span>
            <span className="hidden lg:inline">Book an Appointment</span>
          </Link>
          <button
            type="button"
            className={`md:hidden p-2 -m-1 min-w-[44px] min-h-[44px] flex items-center justify-center ${light ? 'text-ink' : 'text-white'}`}
            onClick={() => setMobileOpen((o) => !o)}
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
            <div className="px-5 py-5 flex flex-col gap-4">
              {navLinks.map(({ label, href }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                  className="text-[11px] tracking-[0.18em] uppercase text-stone hover:text-ink font-['Inter']">
                  {label}
                </Link>
              ))}
              <Link href="/book" onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] px-5 py-3 w-fit mt-1">
                Book an Appointment
              </Link>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  )
}

/* ─── Footer ───────────────────────────────────────────────────── */
export function Footer() {
  const serviceLinks = Object.keys(SERVICES).map((label) => ({
    label,
    slug: CAT_SLUGS[label],
  }))
  return (
    <footer className="bg-white">
      {/* Top bar — logo + Urdu signature + CTA */}
      <div className="border-t border-border-soft px-5 md:px-10 py-8 md:py-10">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Link href="/" className="shrink-0">
              <Image src="/logo.jpg" alt="Farwa Beauty Salon" width={945} height={945} loading="lazy" sizes="48px" className="h-10 md:h-12 w-auto"
                onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='block' }} />
              <span style={{display:'none'}} className="font-['Unbounded'] font-bold text-sm text-ink">FARWA</span>
            </Link>
            <span className="hidden sm:inline h-8 w-px bg-[#e4ddd7]" />
            <UrduSignature className="hidden sm:inline text-stone/80" />
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <Link href="/book"
              className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] px-6 py-3 hover:bg-stone transition-colors duration-300">
              {CTA_PRIMARY_LABEL} <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <a href={WA_DEFAULT} className="text-stone text-[10px] font-['Inter'] tracking-wide hover:text-ink transition-colors">
              {CTA_WHATSAPP_HINT}
            </a>
          </div>
        </div>
      </div>
      {/* Link grid */}
      <div className="border-t border-border-soft px-5 md:px-10 py-10 md:py-12">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-10">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium font-['Inter'] text-ink mb-4">Services</p>
              <ul className="flex flex-col gap-2 sm:gap-2.5">
                {serviceLinks.map(sl => (
                  <li key={sl.label}><Link href={`/services/${sl.slug}`} className="link-underline text-stone text-xs font-['Inter'] hover:text-ink transition-colors">{sl.label}</Link></li>
                ))}
                <li className="pt-1">
                  <Link href="/services" className="link-underline text-ink text-xs font-['Inter'] font-medium hover:text-stone transition-colors">
                    All services →
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium font-['Inter'] text-ink mb-4">Navigate</p>
              <ul className="flex flex-col gap-2.5">
                {[['Home','/'],['Services','/services'],['Book','/book'],['Bridal','/bridal'],['Gallery','/gallery'],['Blog','/blog'],['About','/about'],['Contact','/contact'],['Team','/team'],['FAQ','/faq']].map(([l,href]) => (
                  <li key={l}><Link href={href} className="link-underline text-stone text-xs font-['Inter'] hover:text-ink transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium font-['Inter'] text-ink mb-4">Visit Us</p>
              <ul className="flex flex-col gap-2.5">
                {SALON_ADDRESS_LINES.map(l => (
                  <li key={l}><span className="text-stone text-xs font-['Inter']">{l}</span></li>
                ))}
              </ul>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium font-['Inter'] text-ink mb-4">Connect</p>
              <ul className="flex flex-col gap-3">
                <li>
                  <a href={WA_DEFAULT} target="_blank" rel="noreferrer" className="link-underline !inline-flex items-center gap-2 text-stone text-xs leading-snug font-['Inter'] hover:text-ink">
                    <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">WhatsApp</span>
                  </a>
                </li>
                <li>
                  <a href={IG_LINK} target="_blank" rel="noreferrer" className="link-underline !inline-flex items-center gap-2 text-stone text-xs leading-snug font-['Inter'] hover:text-ink">
                    <IgIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">@farwasalon</span>
                  </a>
                </li>
                <li>
                  <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="link-underline !inline-flex items-center gap-2 text-stone text-xs leading-snug font-['Inter'] hover:text-ink">
                    <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">Google Maps</span>
                  </a>
                </li>
                <li>
                  <a href="https://g.page/farwasalon/review" target="_blank" rel="noreferrer" className="link-underline !inline-flex items-center gap-2 text-stone text-xs leading-snug font-['Inter'] hover:text-ink">
                    <Star className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">Leave a review</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <FooterNewsletter />
          <div className="mb-10 pb-8 border-b border-border-soft">
            <p className="text-[10px] tracking-[0.2em] uppercase font-medium font-['Inter'] text-ink mb-3">
              Location
            </p>
            <p className="text-stone text-xs font-['Inter']">
              PECHS Block 3, Karachi ·{' '}
              <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="link-underline hover:text-ink transition-colors">
                Directions on Google Maps
              </a>
              {' · '}
              <Link href="/beauty-salon-karachi" className="link-underline hover:text-ink transition-colors">
                Beauty salon in Karachi
              </Link>
            </p>
          </div>
          <div className="border-t border-border-soft pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-stone text-[11px] font-['Inter']">© {new Date().getFullYear()} Farwa Beauty Salon. All rights reserved.</p>
              <span className="text-[#e4ddd7] hidden sm:inline">·</span>
              <UrduSignature className="sm:hidden text-stone/70 text-[13px]" />
            </div>
            <div className="flex items-center gap-3">
              <Link href="/privacy" className="text-stone text-[11px] font-['Inter'] hover:text-ink transition-colors">Privacy Policy</Link>
              <span className="text-[#e4ddd7]">·</span>
              <p className="text-stone text-[11px] font-['Inter']">{SALON_ADDRESS_LINES[0]} · Est. 2008</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

const CATEGORY_SLUG_SET = new Set(Object.values(CAT_SLUGS))

/** Paths that show the 3-action mobile CTA bar (call / WhatsApp / book). */
export function shouldShowMobileCtaBar(pathname) {
  if (pathname === '/' || pathname === '/services') return true
  const m = pathname.match(/^\/services\/([^/]+)$/)
  if (!m) return false
  const slug = m[1]
  if (slug.includes('-in-') || slug.startsWith('best-')) return false
  return CATEGORY_SLUG_SET.has(slug)
}

/* ─── Mobile CTA bar: tel + WhatsApp + book (key landing pages) ─ */
export function StickyMobileCTA({ hidden = false }) {
  if (hidden) return null
  return (
    <>
      {/* flow spacer so page content never hides behind the fixed bar on mobile */}
      <div aria-hidden className="h-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:hidden shrink-0" />
      <nav
        className="fixed z-50 left-0 right-0 md:hidden max-w-[100vw]"
        style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        aria-label="Quick contact and booking"
      >
        <m.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.55, ease: [0.16,1,0.3,1] }}
          className="mx-3 flex items-stretch gap-1.5 rounded-xl bg-ink/95 backdrop-blur-md shadow-2xl shadow-ink/40 border border-white/10 p-1.5 min-w-0 max-w-[calc(100vw-1.5rem)]"
        >
          <a
            href={`tel:+${WA_NUMBER}`}
            aria-label="Call the salon"
            className="tap-safe flex-1 inline-flex items-center justify-center gap-1.5 text-white/85 hover:text-white active:scale-[0.97] text-[10px] tracking-[0.14em] uppercase font-medium font-['Inter'] py-3 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            Call
          </a>
          <span aria-hidden="true" className="w-px bg-white/15 my-1.5" />
          <a
            href={WA_DEFAULT}
            target="_blank"
            rel="noreferrer"
            aria-label="Message the salon on WhatsApp"
            className="tap-safe flex-1 inline-flex items-center justify-center gap-1.5 text-white/85 hover:text-white active:scale-[0.97] text-[10px] tracking-[0.14em] uppercase font-medium font-['Inter'] py-3 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
            WhatsApp
          </a>
          <Link
            href="/book"
            aria-label="Book an appointment online"
            className="tap-safe flex-[1.4] inline-flex items-center justify-center gap-1.5 bg-white text-ink active:scale-[0.97] text-[10px] tracking-[0.16em] uppercase font-semibold font-['Inter'] rounded-lg py-3 shadow-inner"
          >
            Book <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </m.div>
      </nav>
    </>
  )
}

/* ─── Sticky booking pill (other pages, mobile only) ───────────── */
export function StickyWA({ hidden = false }) {
  if (hidden) return null
  return (
    <>
      <div aria-hidden className="h-[calc(5rem+env(safe-area-inset-bottom,0px))] md:hidden" />
      <div className="fixed z-50 left-0 right-0 flex justify-center md:hidden pointer-events-none px-4"
        style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))' }}>
        <m.div
          initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, duration: 0.6, ease: [0.16,1,0.3,1] }}>
          <Link href="/book"
            className="pointer-events-auto inline-flex items-center gap-2 bg-ink text-white text-[10px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-7 py-3.5 shadow-2xl shadow-ink/30">
            Book Online <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </m.div>
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
      poster={poster}
      preload={visible ? 'auto' : 'none'}
      muted
      loop
      playsInline
      className={className}
      {...props}
    >
      {webm && <source src={webm} type="video/webm" />}
      <source src={src} type="video/mp4" />
    </video>
  )
}

/* ─── Re-exports ───────────────────────────────────────────────── */
export { WA_NUMBER, MAPS_LINK, IG_LINK, WA_DEFAULT, waLink, waLinkBooking, SERVICES, ALL_SERVICES, CATEGORIES, formatPrice, formatDuration, CAT_SLUGS, CAT_SEO, CAT_FAQS }
