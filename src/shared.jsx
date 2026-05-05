import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Menu, ArrowUpRight, ChevronLeft, ChevronRight, Clock, Sparkles } from 'lucide-react'
import { WA_NUMBER, MAPS_LINK, IG_LINK, WA_DEFAULT, waLink, SERVICES, ALL_SERVICES, CATEGORIES } from './data.js'

/* ─── Live "next available slot" based on Mon–Sat 11am–7pm ────── */
export function useNextSlot() {
  const [slot, setSlot] = useState(() => computeNextSlot())
  useEffect(() => {
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
    // Round up to next half hour
    const min = now.getMinutes()
    let h = hr, m = min < 30 ? 30 : 0
    if (min >= 30) h = Math.min(18, hr + 1)
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

/* ─── Per-page document title + description hook ─────────────── */
export function usePageMeta({ title, description }) {
  useEffect(() => {
    if (title) document.title = title
    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', description)
    }
  }, [title, description])
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
export function AnimatedNumber({ display, final }) {
  const ref   = useRef(null)
  const [shown, setShown] = useState('0')
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
  return <span ref={ref}>{shown}</span>
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
    const left = child.offsetLeft - (el.clientWidth - child.clientWidth) / 2
    el.scrollTo({ left, behavior: 'smooth' })
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

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') scrollTo(Math.min(count - 1, idx + 1))
      if (e.key === 'ArrowLeft')  scrollTo(Math.max(0, idx - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [idx, count, scrollTo])

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="snap-x-row snap-center-child flex overflow-x-auto gap-3 md:gap-4 px-[max(1rem,calc(50vw-200px))] md:px-[max(2.5rem,calc(50vw-220px))] pb-2"
        role="region" aria-label="Salon photo gallery"
      >
        {photos.map((p, i) => (
          <figure key={i} className="relative shrink-0 overflow-hidden bg-[#0d0609]"
            style={{ width: 'clamp(260px,36vw,420px)', height: 'clamp(340px,50vw,560px)' }}>
            <img src={p.src} alt={p.label} loading="lazy" decoding="async" draggable={false}
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
      <div className="flex items-center justify-center gap-1.5 mt-5" role="tablist" aria-label="Gallery pagination">
        {photos.map((_, i) => (
          <button key={i} onClick={() => scrollTo(i)}
            role="tab" aria-selected={idx === i} aria-label={`Go to photo ${i + 1}`}
            className={`h-[2px] transition-all duration-300 ${idx === i ? 'w-8 bg-ink' : 'w-3 bg-stone/30 hover:bg-stone/60'}`} />
        ))}
      </div>
    </div>
  )
}

/* ─── Visual month calendar (used inside BookingSheet) ─────────── */
function MonthCalendar({ value, onChange }) {
  const todayRef = useRef((() => { const d = new Date(); d.setHours(0,0,0,0); return d })())
  const [yr, setYr] = useState(() => todayRef.current.getFullYear())
  const [mo, setMo] = useState(() => todayRef.current.getMonth())

  const firstWeekday = new Date(yr, mo, 1).getDay()
  const daysInMonth  = new Date(yr, mo + 1, 0).getDate()
  const monthLabel   = new Date(yr, mo).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const todayStr     = todayRef.current.toISOString().slice(0, 10)

  const prev = () => { const d = new Date(yr, mo - 1); setYr(d.getFullYear()); setMo(d.getMonth()) }
  const next = () => { const d = new Date(yr, mo + 1); setYr(d.getFullYear()); setMo(d.getMonth()) }
  const canPrev = new Date(yr, mo) > new Date(todayRef.current.getFullYear(), todayRef.current.getMonth())

  const strFor   = (day) => new Date(yr, mo, day).toISOString().slice(0, 10)
  const dayOfWk  = (day) => new Date(yr, mo, day).getDay()
  const isPast   = (day) => { const d = new Date(yr, mo, day); d.setHours(0,0,0,0); return d < todayRef.current }
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

/* ─── Smart Booking Sheet — 3-step flow → pre-filled WhatsApp ── */
export function BookingSheet({ open, onClose, initialCategory = null }) {
  const [step, setStep] = useState(0)
  const [cat,  setCat]  = useState(initialCategory)
  const [svc,  setSvc]  = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  // Reset on close
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep(0); setCat(initialCategory); setSvc(''); setDate(''); setTime('')
      }, 350)
      return () => clearTimeout(t)
    }
  }, [open, initialCategory])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open, onClose])

  const handleBook = () => {
    const chosenSvc = svc || cat || 'a service'
    const lines = [
      `Hi! I'd like to book an appointment at Farwa Beauty Salon.`,
      ``,
      `Service: ${chosenSvc}`,
      date ? `Preferred date: ${date}` : '',
      time ? `Preferred time: ${time}` : '',
    ].filter(Boolean).join('\n')
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  const timeOptions = ['11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM']
  const today = new Date().toISOString().slice(0,10)

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-ink/60 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="booking-title">
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            onClick={e => e.stopPropagation()}
            className="bg-white w-full md:max-w-xl md:mx-4 md:rounded-none flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 md:px-7 py-4 border-b border-[#e4ddd7]">
              <div>
                <p className="text-stone text-[10px] tracking-[0.24em] uppercase font-['Inter']">Step {step + 1} of 3</p>
                <h2 id="booking-title" className="font-['Unbounded'] font-bold text-ink text-base md:text-lg mt-0.5">
                  {step === 0 && 'Choose a service'}
                  {step === 1 && 'Pick a date'}
                  {step === 2 && 'Pick a time'}
                </h2>
              </div>
              <button onClick={onClose} aria-label="Close booking"
                className="tap-safe text-stone hover:text-ink transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress */}
            <div className="h-[2px] bg-[#e4ddd7] w-full">
              <div className="h-full bg-gradient-to-r from-[#c9a98a] to-[#8b6d59] transition-all duration-400"
                style={{ width: `${((step + 1) / 3) * 100}%` }} />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 md:px-7 py-5 md:py-6">
              {step === 0 && (
                <div>
                  {!cat ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {Object.keys(SERVICES).map(c => (
                        <button key={c} onClick={() => setCat(c)}
                          className="tap-safe p-3 border border-[#e4ddd7] hover:border-ink hover:bg-mist transition-all text-left">
                          <p className="font-['Syne'] font-bold text-xs text-ink uppercase leading-tight">{c}</p>
                          <p className="text-stone text-[10px] font-['Inter'] mt-1">{SERVICES[c].length} services</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <button onClick={() => setCat(null)}
                        className="mb-4 inline-flex items-center gap-1.5 text-stone text-[10px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors">
                        <ChevronLeft className="w-3 h-3" /> All categories
                      </button>
                      <p className="text-stone text-[10px] tracking-[0.22em] uppercase font-['Inter'] mb-3">{cat}</p>
                      <div className="flex flex-col divide-y divide-[#e4ddd7]">
                        {SERVICES[cat].map(s => (
                          <button key={s.id} onClick={() => { setSvc(s.name); setStep(1) }}
                            className="tap-safe flex items-center justify-between py-3.5 text-left hover:pl-2 transition-all">
                            <span className="font-['Syne'] font-bold text-[13px] text-ink uppercase">{s.name}</span>
                            <ArrowUpRight className="w-4 h-4 text-stone/40" />
                          </button>
                        ))}
                      </div>
                      <button onClick={() => { setSvc(cat); setStep(1) }}
                        className="mt-4 text-stone text-[10px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors">
                        Not sure yet · continue with &ldquo;{cat}&rdquo; →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div>
                  <p className="text-stone text-sm font-['Inter'] font-light mb-5">
                    Booking for <span className="text-ink font-medium">{svc}</span>
                  </p>
                  {/* Visual month calendar — tap a date to auto-advance */}
                  <MonthCalendar
                    value={date}
                    onChange={(d) => { setDate(d); setStep(2) }}
                  />
                  <div className="flex justify-start gap-2 mt-5 pt-4 border-t border-[#e4ddd7]">
                    <button onClick={() => setStep(0)}
                      className="tap-safe text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] px-4 py-3 hover:text-ink transition-colors">
                      ← Back
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <p className="text-stone text-sm font-['Inter'] font-light mb-4">
                    {svc} &middot; <span className="text-ink font-medium">{new Date(date).toDateString()}</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {timeOptions.map(t => (
                      <button key={t} onClick={() => setTime(t)}
                        className={`tap-safe py-3 border text-[11px] tracking-wide font-['Syne'] font-bold transition-all ${
                          time === t
                            ? 'bg-ink text-white border-ink'
                            : 'border-[#e4ddd7] text-ink hover:border-ink hover:bg-mist'
                        }`}>
                        <Clock className="w-3 h-3 inline mr-1 opacity-60" />{t}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between gap-2 pt-3 border-t border-[#e4ddd7]">
                    <button onClick={() => setStep(1)} className="tap-safe text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] px-4 py-3 hover:text-ink">Back</button>
                    <button onClick={handleBook} disabled={!time}
                      className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-3.5 hover:bg-stone disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <Sparkles className="w-3.5 h-3.5" /> Send on WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── Booking context (global access) ──────────────────────────── */
import { createContext, useContext } from 'react'
const BookingCtx = createContext({ open: () => {} })
export function BookingProvider({ children }) {
  const [state, setState] = useState({ open: false, category: null })
  const value = {
    open: (category = null) => setState({ open: true, category }),
    close: () => setState(s => ({ ...s, open: false })),
  }
  return (
    <BookingCtx.Provider value={value}>
      {children}
      <BookingSheet open={state.open} initialCategory={state.category} onClose={value.close} />
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
    <div aria-hidden="true" className="bg-white border-y border-[#e4ddd7] overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-5 md:px-10 py-6 md:py-8 flex items-center gap-5 md:gap-8">
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
  const titleId    = 'svc-modal-title'
  const descId     = 'svc-modal-desc'

  useEffect(() => {
    returnRef.current = document.activeElement
    document.body.style.overflow = 'hidden'

    // focus first focusable inside dialog
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
      <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={service.desc ? descId : undefined}
          className="bg-white w-full max-w-lg overflow-hidden"
          initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }} onClick={e => e.stopPropagation()}>
          <div className="p-6 md:p-8 flex flex-col max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <span className="text-[10px] tracking-[0.2em] uppercase text-stone font-['Inter']">{service.category}</span>
              <button onClick={onClose} aria-label="Close dialog"
                className="text-stone hover:text-ink transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <h2 id={titleId} className="font-['Unbounded'] font-bold text-lg md:text-xl text-ink mb-4 leading-tight uppercase">
              {service.name}
            </h2>
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
            <a href={waLink(service.name)} target="_blank" rel="noreferrer" onClick={onClose}
              className="mt-auto inline-flex items-center justify-center gap-2 bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-4 hover:bg-stone active:scale-[0.98] transition-all duration-300">
              Book on WhatsApp <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </motion.div>
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
      <span className="font-['Unbounded'] font-bold text-[13px] md:text-sm tracking-[0.12em] text-white drop-shadow-sm">
        FARWA
      </span>
    )
  }
  if (err) {
    return <span className="font-['Unbounded'] font-bold text-[13px] md:text-sm tracking-[0.12em] text-ink">FARWA</span>
  }
  return (
    <img
      src="/logo.jpg"
      alt="Farwa Beauty Salon"
      onError={() => setErr(true)}
      className="h-9 md:h-10 w-auto object-contain transition-opacity duration-300"
    />
  )
}

/* ─── Navbar ───────────────────────────────────────────────────── */
export function Navbar({ transparent = false }) {
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const booking = useBooking()
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  /* Close mobile drawer on route change */
  useEffect(() => { setMobileOpen(false) }, [pathname])
  const light = scrolled || !transparent

  const navLinks = [
    { label: 'Home',         to: '/' },
    { label: 'Services',     to: '/services' },
    { label: 'Gallery',      to: '/gallery' },
    { label: 'About',        to: '/about' },
    { label: 'Contact',      to: '/contact' },
  ]

  return (
    <motion.header initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-400 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_#e4ddd7]' : transparent ? '' : 'bg-white'}`}>
      <div className="max-w-screen-xl mx-auto px-5 md:px-10 h-16 md:h-[68px] flex items-center justify-between">
        <Link to="/" className="shrink-0">
          <Logo light={light} />
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map(({ label, to }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `link-underline text-[11px] tracking-[0.18em] uppercase font-medium font-['Inter'] transition-colors
                ${isActive ? (light ? 'text-ink' : 'text-white') : (light ? 'text-stone hover:text-ink' : 'text-white/70 hover:text-white')}`
              }>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => booking.open()}
            className={`hidden md:inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] px-5 py-2.5 transition-all duration-300 ${light ? 'bg-ink text-white hover:bg-stone' : 'bg-white text-ink hover:bg-nude'}`}>
            Book an Appointment
          </button>
          <button className={`md:hidden p-1 ${light ? 'text-ink' : 'text-white'}`} onClick={() => setMobileOpen(o => !o)} aria-label="Menu" aria-expanded={mobileOpen}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-white border-t border-[#e4ddd7]">
            <div className="px-5 py-6 flex flex-col gap-5">
              {navLinks.map(({ label, to }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                  className="text-[11px] tracking-[0.18em] uppercase text-stone hover:text-ink font-['Inter']">
                  {label}
                </Link>
              ))}
              <button onClick={() => { setMobileOpen(false); booking.open() }}
                className="inline-flex items-center justify-center bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] px-5 py-3 w-fit mt-1">
                Book an Appointment
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* ─── Footer ───────────────────────────────────────────────────── */
export function Footer() {
  const serviceLinks = ['Threading','Bridal','Facials','Nails','Eyebrow Tattoo','Massage']
  const booking = useBooking()
  const slot = useNextSlot()
  return (
    <footer className="bg-white">
      {/* Top bar — logo + Urdu signature + CTA */}
      <div className="border-t border-[#e4ddd7] px-5 md:px-10 py-8 md:py-10">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Link to="/" className="shrink-0">
              <img src="/logo.jpg" alt="Farwa Beauty Salon" className="h-10 md:h-12 w-auto"
                onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='block' }} />
              <span style={{display:'none'}} className="font-['Unbounded'] font-bold text-sm text-ink">FARWA</span>
            </Link>
            <span className="hidden sm:inline h-8 w-px bg-[#e4ddd7]" />
            <UrduSignature className="hidden sm:inline text-stone/80" />
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <button onClick={() => booking.open()}
              className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] px-6 py-3 hover:bg-stone transition-colors duration-300">
              Book an Appointment <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-stone text-[10px] font-['Inter'] tracking-wide">
              Next slot <span className="text-ink font-medium">{slot.label}</span>
            </p>
          </div>
        </div>
      </div>
      {/* Link grid */}
      <div className="border-t border-[#e4ddd7] px-5 md:px-10 py-10 md:py-12">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-10">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium font-['Inter'] text-ink mb-4">Services</p>
              <ul className="flex flex-col gap-2.5">
                {serviceLinks.map(l => (
                  <li key={l}><Link to="/services" className="link-underline text-stone text-xs font-['Inter'] hover:text-ink transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium font-['Inter'] text-ink mb-4">Navigate</p>
              <ul className="flex flex-col gap-2.5">
                {[['Home','/'],['Services','/services'],['Gallery','/gallery'],['About','/about'],['Contact','/contact']].map(([l,to]) => (
                  <li key={l}><Link to={to} className="link-underline text-stone text-xs font-['Inter'] hover:text-ink transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium font-['Inter'] text-ink mb-4">Visit Us</p>
              <ul className="flex flex-col gap-2.5">
                {['PECHS Block 2, Karachi','Mon–Sat: 11am–7pm','Closed Sunday'].map(l => (
                  <li key={l}><span className="text-stone text-xs font-['Inter']">{l}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium font-['Inter'] text-ink mb-4">Connect</p>
              <ul className="flex flex-col gap-2.5">
                <li><a href={WA_DEFAULT} target="_blank" rel="noreferrer" className="link-underline text-stone text-xs font-['Inter'] hover:text-ink">WhatsApp</a></li>
                <li><a href={IG_LINK}    target="_blank" rel="noreferrer" className="link-underline text-stone text-xs font-['Inter'] hover:text-ink">Instagram @farwasalon</a></li>
                <li><a href={MAPS_LINK}  target="_blank" rel="noreferrer" className="link-underline text-stone text-xs font-['Inter'] hover:text-ink">Find us on Maps</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#e4ddd7] pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-stone text-[11px] font-['Inter']">© {new Date().getFullYear()} Farwa Beauty Salon. All rights reserved.</p>
              <span className="text-[#e4ddd7] hidden sm:inline">·</span>
              <UrduSignature className="sm:hidden text-stone/70 text-[13px]" />
            </div>
            <p className="text-stone text-[11px] font-['Inter']">PECHS Block 2, Karachi · Est. 2008</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── Sticky WhatsApp pill (shown on all pages) ────────────────── */
export function StickyWA() {
  return (
    <>
      {/* flow spacer so page content never hides behind the fixed pill on mobile */}
      <div aria-hidden className="h-20 md:hidden" />
      <div className="fixed bottom-5 left-0 right-0 z-50 px-5 flex justify-center md:hidden pointer-events-none">
        <motion.a href={WA_DEFAULT} target="_blank" rel="noreferrer"
          className="pointer-events-auto inline-flex items-center gap-2 bg-ink text-white text-[10px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-7 py-3.5 shadow-2xl shadow-ink/30"
          initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, duration: 0.6, ease: [0.16,1,0.3,1] }}>
          Book on WhatsApp <ArrowUpRight className="w-3.5 h-3.5" />
        </motion.a>
      </div>
    </>
  )
}

/* ─── Page wrapper with Lenis ──────────────────────────────────── */
export { WA_NUMBER, MAPS_LINK, IG_LINK, WA_DEFAULT, waLink, SERVICES, ALL_SERVICES, CATEGORIES }
