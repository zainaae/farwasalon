import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Menu, ArrowUpRight } from 'lucide-react'
import Core from 'smooothy'
import { WA_NUMBER, MAPS_LINK, IG_LINK, WA_DEFAULT, waLink, SERVICES, ALL_SERVICES, CATEGORIES } from './data.js'

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

/* ─── Particle field ───────────────────────────────────────────── */
export function ParticleField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const COLORS = ['#e8ddd5','#f8f5f1','#d4c4b8','#ffffff','#c8b8ac']
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const W = () => canvas.offsetWidth, H = () => canvas.offsetHeight
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 2.2 + 0.4,
      vx: (Math.random() - 0.5) * 0.00018,
      vy: (Math.random() - 0.5) * 0.00018,
      opacity: Math.random() * 0.45 + 0.08,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.008 + 0.003,
    }))
    let visible = true
    let docVisible = !document.hidden
    const animate = () => {
      if (!visible || !docVisible) { raf = null; return }
      const w = W(), h = H()
      ctx.clearRect(0, 0, w, h)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0
        if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0
        p.pulse += p.pulseSpeed
        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse))
        ctx.fill()
      })
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(animate)
    }
    const start = () => { if (raf == null) animate() }
    const io = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting
      if (visible) start()
    }, { threshold: 0 })
    io.observe(canvas)
    const onVis = () => { docVisible = !document.hidden; if (docVisible) start() }
    document.addEventListener('visibilitychange', onVis)
    start()
    return () => {
      if (raf != null) cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: 'screen', opacity: 0.6 }} />
}

/* ─── Smooothy gallery ─────────────────────────────────────────── */
export function SmoothyGallery({ photos }) {
  const wrapperRef = useRef(null)
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    let raf
    const slider = new Core(el, { infinite: true, snap: false, lerpFactor: 0.08 })
    const tick = () => { slider.update(); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); slider.destroy?.() }
  }, [])
  return (
    <div ref={wrapperRef} className="flex overflow-x-hidden cursor-grab active:cursor-grabbing select-none" style={{ userSelect: 'none' }}>
      {photos.map((p, i) => (
        <div key={i} className="relative shrink-0 overflow-hidden" style={{ width: 'clamp(240px,30vw,380px)', height: 'clamp(300px,40vw,500px)', marginRight: '12px' }}>
          <img src={p.src} alt={p.label} draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize: '180px 180px', opacity: 0.06, mixBlendMode: 'overlay' }} />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-ink/60 to-transparent">
            <p className="text-white text-[10px] tracking-[0.22em] uppercase font-['Inter']">{p.label}</p>
          </div>
        </div>
      ))}
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
          <a href={WA_DEFAULT} target="_blank" rel="noreferrer"
            className={`hidden md:inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] px-5 py-2.5 transition-all duration-300 ${light ? 'bg-ink text-white hover:bg-stone' : 'bg-white text-ink hover:bg-nude'}`}>
            Book an Appointment
          </a>
          <button className={`md:hidden p-1 ${light ? 'text-ink' : 'text-white'}`} onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
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
              <a href={WA_DEFAULT} target="_blank" rel="noreferrer" onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] px-5 py-3 w-fit mt-1">
                Book on WhatsApp
              </a>
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
  return (
    <footer className="bg-white">
      {/* Top bar */}
      <div className="border-t border-[#e4ddd7] px-5 md:px-10 py-8 md:py-10">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <Link to="/" className="shrink-0">
            <img src="/logo.jpg" alt="Farwa Beauty Salon" className="h-10 md:h-12 w-auto"
              onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='block' }} />
            <span style={{display:'none'}} className="font-['Unbounded'] font-bold text-sm text-ink">FARWA</span>
          </Link>
          <a href={WA_DEFAULT} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-medium font-['Inter'] px-6 py-3 hover:bg-stone transition-colors duration-300">
            Book an Appointment <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
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
          <div className="border-t border-[#e4ddd7] pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <p className="text-stone text-[11px] font-['Inter']">© {new Date().getFullYear()} Farwa Beauty Salon. All rights reserved.</p>
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
    <div className="fixed bottom-5 left-0 right-0 z-50 px-5 flex justify-center md:hidden pointer-events-none">
      <motion.a href={WA_DEFAULT} target="_blank" rel="noreferrer"
        className="pointer-events-auto inline-flex items-center gap-2 bg-ink text-white text-[10px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-7 py-3.5 shadow-2xl shadow-ink/30"
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, duration: 0.6, ease: [0.16,1,0.3,1] }}>
        Book on WhatsApp <ArrowUpRight className="w-3.5 h-3.5" />
      </motion.a>
    </div>
  )
}

/* ─── Page wrapper with Lenis ──────────────────────────────────── */
export { WA_NUMBER, MAPS_LINK, IG_LINK, WA_DEFAULT, waLink, SERVICES, ALL_SERVICES, CATEGORIES }
