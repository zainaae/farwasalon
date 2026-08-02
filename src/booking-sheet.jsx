'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Clock, Check, Sparkles } from 'lucide-react'
import { SERVICES, formatServicePrice, formatDuration, track, waLinkBooking } from './data.js'
import { toLocalDateString } from '../lib/date-local.js'

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
            className={`text-center text-[9px] tracking-wide uppercase font-['Inter'] py-1.5 text-stone ${i === 0 ? 'line-through' : ''}`}>
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
                'aspect-square flex items-center justify-center text-[12px] font-[\'Inter\'] transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a98a]',
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

      <p className="text-[9px] text-stone font-['Inter'] mt-3 flex items-center gap-3">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 border border-[#c9a98a]" aria-hidden="true" /> Today
        </span>
        <span>Su = Closed</span>
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
                className="h-full bg-gradient-to-r from-[#c9a98a] to-[#8b6d59] transition-[width] duration-400"
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
                            className="tap-safe p-3 border border-border-soft hover:border-ink hover:bg-mist transition-colors text-left"
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
                                    {s.pricePkr != null && formatServicePrice(s)}
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
                        className={`tap-safe py-3 border text-[11px] tracking-wide font-['Syne'] font-bold transition-colors ${
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

