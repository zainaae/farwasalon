'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Check, Loader2, ChevronDown } from 'lucide-react'
import { SERVICES, ALL_SERVICES, CAT_SLUGS, formatPrice, formatDuration, PHONE_RE, getAddonsForService } from '../../src/data.js'
import { isDateBlocked, getBlockedReason } from '../../lib/blocked-dates.js'
import { toLocalDateString } from '../../lib/date-local.js'
import { computeBookingDurationMinutes } from '../../lib/booking-duration.js'

const BOOK_DRAFT_KEY = 'farwa-book-draft'

function effectiveStep(step, selectedService, selectedDate, selectedTime) {
  if (!selectedService) return 0
  if (!selectedDate || !selectedTime) return Math.min(1, Math.max(0, step))
  return Math.min(2, Math.max(0, step))
}

function loadBookDraft(searchParams) {
  let draft = null
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(BOOK_DRAFT_KEY)
      if (raw) draft = JSON.parse(raw)
    } catch {
      draft = null
    }
  }

  const serviceIdParam = searchParams.get('serviceId')
  const categoryParam = searchParams.get('category')
  const dateParam = searchParams.get('date')
  const timeParam = searchParams.get('time')
  const stepParam = searchParams.get('step')

  const serviceId = serviceIdParam ?? (draft?.serviceId != null ? String(draft.serviceId) : null)
  let selectedService = null
  let expandedCat = categoryParam && CATEGORIES.includes(categoryParam) ? categoryParam : null
  if (serviceId) {
    const svc = ALL_SERVICES.find(s => s.id === parseInt(serviceId, 10))
    if (svc) {
      selectedService = svc
      expandedCat = svc.category
    }
  }

  const selectedDate = dateParam || draft?.date || ''
  const selectedTime = timeParam || draft?.time || ''
  let step = stepParam != null
    ? Math.min(2, Math.max(0, parseInt(stepParam, 10) || 0))
    : (draft?.step ?? (serviceId && selectedDate && selectedTime ? 2 : serviceId && selectedDate ? 1 : 0))
  step = effectiveStep(step, selectedService, selectedDate, selectedTime)

  const addonIds = Array.isArray(draft?.addonIds) ? draft.addonIds : []

  return {
    step,
    selectedService,
    expandedCat,
    selectedDate,
    selectedTime,
    clientName: draft?.clientName || '',
    clientPhone: draft?.clientPhone || '',
    notes: draft?.notes || '',
    addonIds,
  }
}

const CATEGORIES = Object.keys(SERVICES)

function formatTime12(t) {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

function formatDateNice(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

const stepVariants = {
  enter:  () => ({ opacity: 0, y: 12 }),
  center: { opacity: 1, y: 0 },
  exit:   () => ({ opacity: 0, y: -12 }),
}

function FirstVisitHint() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-8 border border-[#e4ddd7] bg-[#faf7f5]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="tap-safe w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-ink text-xs font-['Inter'] font-medium">First visit? Here&apos;s what to expect</span>
        <ChevronDown className={`w-4 h-4 text-stone transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <ul className="px-4 pb-4 flex flex-col gap-2.5">
              {[
                'Choose any service — no account needed',
                'Pick a date and time that works for you',
                'Confirm online — your slot is saved instantly',
                'Optional: message us on WhatsApp for directions or questions',
                'Walk-ins welcome — book online to skip the wait',
              ].map(tip => (
                <li key={tip} className="flex items-start gap-2 text-stone text-xs font-['Inter'] font-light">
                  <Check className="w-3.5 h-3.5 text-[#c9a98a] shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function BookClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initial = useRef(null)
  if (!initial.current) {
    initial.current = loadBookDraft(searchParams)
  }
  const boot = initial.current

  const [step, setStep] = useState(boot.step)
  const [direction, setDirection] = useState(1)

  const [expandedCat, setExpandedCat] = useState(boot.expandedCat)
  const [selectedService, setSelectedService] = useState(boot.selectedService)

  const [selectedDate, setSelectedDate] = useState(boot.selectedDate)
  const [selectedTime, setSelectedTime] = useState(boot.selectedTime)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [clientName, setClientName] = useState(boot.clientName)
  const [clientPhone, setClientPhone] = useState(boot.clientPhone)
  const [notes, setNotes] = useState(boot.notes)
  const [selectedAddonIds, setSelectedAddonIds] = useState(
    () => new Set(boot.addonIds || []),
  )
  const [slotsError, setSlotsError] = useState('')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedService) params.set('serviceId', String(selectedService.id))
    if (selectedDate) params.set('date', selectedDate)
    if (selectedTime) params.set('time', selectedTime)
    if (step > 0) params.set('step', String(step))

    const qs = params.toString()
    router.replace(qs ? `/book?${qs}` : '/book', { scroll: false })
  }, [selectedService, selectedDate, selectedTime, step, router])

  useEffect(() => {
    try {
      localStorage.setItem(BOOK_DRAFT_KEY, JSON.stringify({
        serviceId: selectedService?.id ?? null,
        date: selectedDate,
        time: selectedTime,
        step,
        clientName,
        clientPhone,
        notes,
        addonIds: [...selectedAddonIds],
      }))
    } catch {
      // ignore quota / private mode
    }
  }, [selectedService, selectedDate, selectedTime, step, clientName, clientPhone, notes, selectedAddonIds])

  const goTo = useCallback((target) => {
    const next = effectiveStep(target, selectedService, selectedDate, selectedTime)
    if (target === 1 && !selectedService) return
    if (target === 2 && (!selectedService || !selectedDate || !selectedTime)) return
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }, [step, selectedService, selectedDate, selectedTime])

  const addonIdsList = [...selectedAddonIds]
  const addonIdsKey = addonIdsList.sort((a, b) => a - b).join(',')
  const totalDurationMinutes = selectedService
    ? computeBookingDurationMinutes(selectedService, addonIdsList)
    : 0

  useEffect(() => {
    if (step !== 1 || !selectedDate || !selectedService) return
    setLoadingSlots(true) // eslint-disable-line react-hooks/set-state-in-effect -- set loading before async fetch
    setSlotsError('')
    setSelectedTime('')
    const addonQuery = addonIdsKey ? `&addonIds=${encodeURIComponent(addonIdsKey)}` : ''
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25_000)
    fetch(`/api/slots?date=${selectedDate}&serviceId=${selectedService.id}${addonQuery}`, {
      signal: controller.signal,
    })
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) {
          setSlots([])
          setSlotsError(data.error || 'Could not load times. Please try again.')
          return
        }
        setSlots(data.slots || [])
        if ((data.slots || []).length === 0) {
          setSlotsError('No times available for this date.')
        }
      })
      .catch((err) => {
        setSlots([])
        const aborted = err?.name === 'AbortError'
        setSlotsError(
          aborted
            ? 'Request timed out — slow connection. Try again or message us on WhatsApp.'
            : 'Could not load times. Check your connection and try again.',
        )
      })
      .finally(() => {
        clearTimeout(timeoutId)
        setLoadingSlots(false)
      })
  }, [step, selectedDate, selectedService, addonIdsKey])

  const validatePhone = (value) => {
    if (value && !PHONE_RE.test(value.replace(/\s/g, ''))) {
      setPhoneError('Enter a valid Pakistani number (e.g. 03xx-xxxxxxx)')
      return false
    }
    setPhoneError('')
    return true
  }

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      setError('Please complete service, date, and time before confirming.')
      return
    }
    if (!clientName.trim() || !clientPhone.trim()) {
      setError('Please fill in your name and phone number.')
      return
    }
    if (!validatePhone(clientPhone.trim())) return
    setError('')
    setSubmitting(true)
    const addons = getAddonsForService(selectedService.id).filter((a) =>
      selectedAddonIds.has(a.id),
    )
    const addonNote =
      addons.length > 0
        ? `Add-ons: ${addons.map((a) => a.name).join(', ')}`
        : ''
    const combinedNotes = [notes.trim(), addonNote].filter(Boolean).join('\n')

    const bookController = new AbortController()
    const bookTimeoutId = setTimeout(() => bookController.abort(), 25_000)
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: bookController.signal,
        body: JSON.stringify({
          serviceId: selectedService.id,
          addonIds: addonIdsList,
          date: selectedDate,
          time: selectedTime,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          notes: combinedNotes,
          website,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }
      try {
        localStorage.removeItem(BOOK_DRAFT_KEY)
      } catch {
        // ignore
      }
      const confirmPayload = {
        service: data.booking.service,
        name: data.booking.clientName,
        duration: data.booking.duration || totalDurationMinutes,
      }
      try {
        sessionStorage.setItem(
          `farwa-confirm-${data.booking.id}`,
          JSON.stringify(confirmPayload),
        )
      } catch {
        // ignore private mode
      }
      const params = new URLSearchParams({
        id: data.booking.id,
        date: data.booking.date,
        time: data.booking.time,
        duration: String(confirmPayload.duration),
      })
      if (data.booking.cancelToken) params.set('token', data.booking.cancelToken)
      router.push(`/book/confirmation?${params.toString()}`)
    } catch (err) {
      const aborted = err?.name === 'AbortError'
      setError(
        aborted
          ? 'Request timed out — slow connection. Try again or message us on WhatsApp.'
          : 'Network error. Please check your connection.',
      )
      setSubmitting(false)
    } finally {
      clearTimeout(bookTimeoutId)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    days.push(d)
  }

  return (
    <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))] overflow-x-clip">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-14 md:py-20 min-h-0 min-w-0 max-w-full overflow-x-clip pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">

        <div className="mb-10 md:mb-14 border-b border-[#e4ddd7] pb-8">
          <motion.div className="overflow-hidden">
            <motion.h1
              initial={{ y: '60%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="display-section text-ink mb-4 break-words"
            >
              BOOK<span className="text-[#e4ddd7] mx-1.5 sm:mx-3 font-light italic text-[0.6em]">—</span>ONLINE
            </motion.h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-stone text-sm font-light max-w-lg font-['Inter']"
          >
            Pick a service, choose a date and time, and confirm your appointment in under a minute.
          </motion.p>
        </div>

        {/* Step indicator */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-4 mb-8 min-w-0">
          {['Service', 'Date & Time', 'Details'].map((label, i) => (
            <div key={label} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className={`w-7 h-7 flex items-center justify-center text-[11px] font-['Inter'] font-bold transition-colors ${
                i < step ? 'bg-ink text-white' :
                i === step ? 'bg-ink text-white' :
                'border border-[#e4ddd7] text-stone'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={`text-[11px] tracking-[0.12em] uppercase font-['Inter'] hidden sm:inline ${
                i === step ? 'text-ink font-medium' : 'text-stone'
              }`}>
                {label}
              </span>
              {i < 2 && <span className="w-8 h-px bg-[#e4ddd7] hidden sm:block" />}
            </div>
          ))}
        </div>

        <div className="h-[2px] bg-[#e4ddd7] w-full mb-8">
          <motion.div
            className="h-full bg-gradient-to-r from-[#c9a98a] to-[#8b6d59]"
            animate={{ width: `${((step + 1) / 3) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <FirstVisitHint />

        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-6">— Choose a service</p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {CATEGORIES.map((cat) => {
                  const services = SERVICES[cat]
                  const isExpanded = expandedCat === cat

                  return (
                    <div key={cat} className={isExpanded ? 'col-span-2 md:col-span-3 lg:col-span-4' : ''}>
                      {!isExpanded ? (
                        <button
                          type="button"
                          onClick={() => setExpandedCat(cat)}
                          className="tap-safe w-full px-3 py-4 md:px-4 border border-[#e4ddd7] hover:border-ink hover:bg-mist transition-all text-left group"
                        >
                          <p className="font-['Syne'] font-bold text-xs text-ink uppercase leading-tight break-words">{cat}</p>
                          <p className="text-stone text-[10px] font-['Inter'] mt-1">{services.length} services</p>
                        </button>
                      ) : (
                        <div className="border border-[#e4ddd7] p-5 md:p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-['Syne'] font-bold text-sm text-ink uppercase">{cat}</p>
                              <p className="text-stone text-[10px] font-['Inter'] mt-0.5">{services.length} services</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setExpandedCat(null)}
                              className="text-stone text-[10px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors flex items-center gap-1"
                            >
                              <ChevronLeft className="w-3 h-3" /> All categories
                            </button>
                          </div>
                          <div className="flex flex-col divide-y divide-[#e4ddd7] border-y border-[#e4ddd7]">
                            {services.map((s) => {
                              const sel = selectedService?.id === s.id
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => setSelectedService(sel ? null : s)}
                                  aria-pressed={sel}
                                  className={`tap-safe flex items-center justify-between gap-3 py-3.5 text-left transition-colors ${
                                    sel ? 'bg-[#faf7f5] pl-2' : 'hover:bg-mist hover:pl-2'
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <span className="font-['Syne'] font-bold text-[13px] text-ink uppercase block">{s.name}</span>
                                    <span className="text-stone text-[10px] font-['Inter'] mt-0.5 block">
                                      {s.durationMinutes != null && formatDuration(s.durationMinutes)}
                                    </span>
                                  </div>
                                  {s.pricePkr != null && (
                                    <span className="shrink-0 text-[#c9a98a] text-sm font-['Inter'] font-semibold">
                                      {formatPrice(s.pricePkr)}
                                    </span>
                                  )}
                                  <span
                                    className={`shrink-0 w-8 h-8 flex items-center justify-center border transition-colors ${
                                      sel ? 'border-ink bg-ink text-white' : 'border-[#e4ddd7] text-transparent'
                                    }`}
                                    aria-hidden="true"
                                  >
                                    <Check className="w-4 h-4" strokeWidth={2.5} />
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {selectedService && (
                <div className="sticky bottom-0 z-[1] pt-5 mt-6 border-t border-[#e4ddd7] bg-white pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-['Syne'] font-bold text-sm text-ink uppercase truncate">{selectedService.name}</p>
                      <p className="text-stone text-[10px] font-['Inter']">
                        {formatPrice(selectedService.pricePkr)} · {formatDuration(selectedService.durationMinutes)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => goTo(1)}
                      className="tap-safe shrink-0 inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-3.5 hover:bg-stone transition-colors"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-2">— Selected service</p>
              <p className="font-['Syne'] font-bold text-sm text-ink uppercase mb-6">
                {selectedService?.name}
                <span className="text-stone font-normal text-[10px] font-['Inter'] ml-2">
                  {formatDuration(totalDurationMinutes)}
                </span>
              </p>

              {selectedService && getAddonsForService(selectedService.id).length > 0 && (
                <motion.div className="mb-6 max-w-md">
                  <p className="text-[10px] tracking-[0.2em] uppercase font-['Inter'] text-stone mb-3">
                    Optional add-ons (affects time slots)
                  </p>
                  <div className="flex flex-col gap-2">
                    {getAddonsForService(selectedService.id).map((addon) => {
                      const checked = selectedAddonIds.has(addon.id)
                      return (
                        <label
                          key={addon.id}
                          className={`flex items-center gap-3 border px-4 py-3 cursor-pointer transition-colors ${
                            checked ? 'border-ink bg-mist' : 'border-[#e4ddd7] hover:border-ink/40'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setSelectedAddonIds((prev) => {
                                const next = new Set(prev)
                                if (next.has(addon.id)) next.delete(addon.id)
                                else next.add(addon.id)
                                return next
                              })
                              setSelectedTime('')
                            }}
                            className="w-4 h-4 accent-ink"
                          />
                          <span className="flex-1 text-sm font-['Inter'] text-ink">{addon.name}</span>
                          {addon.durationMinutes != null && (
                            <span className="text-xs text-stone">+{formatDuration(addon.durationMinutes)}</span>
                          )}
                          {addon.pricePkr != null && (
                            <span className="text-xs text-stone">{formatPrice(addon.pricePkr)}</span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-4">— Pick a date</p>
              <div className="min-w-0 max-w-full overflow-x-hidden">
              <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-3 snap-x snap-mandatory scrollbar-none min-w-0">
                {days.map((d) => {
                  const iso = toLocalDateString(d)
                  const blocked = isDateBlocked(iso)
                  const blockReason = blocked ? getBlockedReason(iso) : null
                  const sel = selectedDate === iso
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
                  const dateNum = d.getDate()
                  const monthName = d.toLocaleDateString('en-US', { month: 'short' })

                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => !blocked && setSelectedDate(iso)}
                      disabled={blocked}
                      title={blockReason || undefined}
                      aria-label={blocked ? `${dayName} ${dateNum} ${monthName} — ${blockReason}` : `${dayName} ${dateNum} ${monthName}`}
                      className={`tap-safe snap-center shrink-0 min-w-[4.25rem] w-[4.5rem] py-3 border text-center transition-all ${
                        sel
                          ? 'bg-ink text-white border-ink'
                          : blocked
                            ? 'border-[#e4ddd7] text-stone/30 cursor-not-allowed'
                            : 'border-[#e4ddd7] text-ink hover:border-ink hover:bg-mist cursor-pointer'
                      }`}
                    >
                      <span className={`block text-[9px] tracking-wider uppercase font-['Inter'] ${sel ? 'text-white/70' : 'text-stone'}`}>
                        {dayName}
                      </span>
                      <span className="block font-['Syne'] font-bold text-lg leading-tight mt-0.5">{dateNum}</span>
                      <span className={`block text-[9px] font-['Inter'] ${sel ? 'text-white/70' : 'text-stone'}`}>
                        {blocked ? 'Call' : monthName}
                      </span>
                    </button>
                  )
                })}
              </div>
              </div>

              {selectedDate && (
                <div className="mt-6">
                  <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-4">
                    — Available times · {formatDateNice(selectedDate)}
                  </p>
                  {loadingSlots ? (
                    <div role="status" aria-live="polite" className="flex items-center justify-center py-10">
                      <Loader2 className="w-5 h-5 text-stone animate-spin" aria-hidden="true" />
                      <span className="text-stone text-sm font-['Inter'] ml-2">Checking availability…</span>
                    </div>
                  ) : slotsError || slots.length === 0 ? (
                    <motion.div
                      role="status"
                      className="border border-[#e4ddd7] bg-[#faf7f5] px-4 py-8 text-center"
                    >
                      <p className="text-stone text-sm font-['Inter'] font-light mb-4">
                        {slotsError || 'No open slots for this date. Try another day or message us on WhatsApp.'}
                      </p>
                      <a
                        href="https://wa.me/923222782254"
                        className="text-ink text-[11px] tracking-[0.14em] uppercase font-semibold font-['Inter'] underline underline-offset-2"
                      >
                        WhatsApp the salon
                      </a>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-3 min-[420px]:grid-cols-4 md:grid-cols-6 gap-2">
                      {slots.map(({ time, available }) => {
                        const sel = selectedTime === time
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => available && setSelectedTime(time)}
                            disabled={!available}
                            className={`tap-safe min-h-[44px] py-3 border text-[11px] tracking-wide font-['Syne'] font-bold transition-all ${
                              sel
                                ? 'bg-ink text-white border-ink'
                                : available
                                  ? 'border-[#e4ddd7] text-ink hover:border-ink hover:bg-mist'
                                  : 'border-[#e4ddd7] text-stone/25 cursor-not-allowed line-through'
                            }`}
                          >
                            <Clock className="w-3 h-3 inline mr-1 opacity-60" aria-hidden="true" />
                            {formatTime12(time)}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between gap-3 pt-5 mt-6 border-t border-[#e4ddd7]">
                <button
                  type="button"
                  onClick={() => goTo(0)}
                  className="tap-safe text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] px-4 py-3 hover:text-ink transition-colors"
                >
                  ← Back
                </button>
                {selectedTime && (
                  <button
                    type="button"
                    onClick={() => goTo(2)}
                    className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-3.5 hover:bg-stone transition-colors"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-6">— Your details</p>

              <div className="border border-[#e4ddd7] bg-[#faf7f5] p-4 mb-6">
                <p className="text-[10px] tracking-[0.2em] uppercase font-['Inter'] text-stone mb-2">Booking summary</p>
                <p className="font-['Syne'] font-bold text-sm text-ink uppercase">{selectedService?.name}</p>
                <p className="text-stone text-xs font-['Inter'] mt-1">
                  {formatDateNice(selectedDate)} · {formatTime12(selectedTime)} · {formatDuration(totalDurationMinutes)}
                </p>
                {selectedService?.pricePkr != null && (
                  <p className="text-[#c9a98a] text-xs font-['Inter'] font-medium mt-0.5">
                    {formatPrice(selectedService.pricePkr)}
                  </p>
                )}
                {selectedService &&
                  getAddonsForService(selectedService.id)
                    .filter((a) => selectedAddonIds.has(a.id))
                    .map((a) => (
                      <p key={a.id} className="text-stone text-xs font-['Inter'] mt-1">
                        + {a.name}
                        {a.pricePkr != null ? ` · ${formatPrice(a.pricePkr)}` : ''}
                      </p>
                    ))}
              </div>

              <div className="flex flex-col gap-3 max-w-md relative">
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
                />
                <div>
                  <label htmlFor="bk-name" className="text-[10px] tracking-[0.2em] uppercase font-['Inter'] text-stone mb-1.5 block">
                    Name <span className="text-[#c9a98a]">*</span>
                  </label>
                  <input
                    id="bk-name"
                    type="text"
                    placeholder="Your full name"
                    autoComplete="name"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    required
                    className="border border-[#e4ddd7] text-ink placeholder-stone/50 text-sm font-['Inter'] px-4 py-3 w-full focus:outline-none focus:border-ink transition-colors bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="bk-phone" className="text-[10px] tracking-[0.2em] uppercase font-['Inter'] text-stone mb-1.5 block">
                    Phone <span className="text-[#c9a98a]">*</span>
                  </label>
                  <input
                    id="bk-phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="03xx-xxxxxxx"
                    autoComplete="tel"
                    value={clientPhone}
                    onChange={e => { setClientPhone(e.target.value); if (phoneError) validatePhone(e.target.value) }}
                    onBlur={e => e.target.value && validatePhone(e.target.value)}
                    required
                    aria-invalid={!!phoneError}
                    aria-describedby={phoneError ? 'bk-phone-error' : undefined}
                    className="border border-[#e4ddd7] text-ink placeholder-stone/50 text-sm font-['Inter'] px-4 py-3 w-full focus:outline-none focus:border-ink transition-colors bg-white"
                  />
                  {phoneError && <p id="bk-phone-error" role="alert" className="text-red-600 text-xs font-['Inter'] mt-1">{phoneError}</p>}
                </div>
                <div>
                  <label htmlFor="bk-notes" className="text-[10px] tracking-[0.2em] uppercase font-['Inter'] text-stone mb-1.5 block">
                    Notes <span className="text-stone/40">(optional)</span>
                  </label>
                  <textarea
                    id="bk-notes"
                    placeholder="Any special requests or preferences…"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    className="border border-[#e4ddd7] text-ink placeholder-stone/50 text-sm font-['Inter'] px-4 py-3 w-full focus:outline-none focus:border-ink transition-colors bg-white resize-none"
                  />
                </div>
              </div>

              <div role="alert" aria-live="assertive">
                {error && (
                  <div className="mt-4 p-3 border border-red-200 bg-red-50 max-w-md">
                    <p className="text-red-700 text-xs font-['Inter']">{error}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-3 pt-5 mt-6 border-t border-[#e4ddd7]">
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  className="tap-safe text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] px-4 py-3 hover:text-ink transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !clientName.trim() || !clientPhone.trim()}
                  aria-busy={submitting}
                  className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-3.5 hover:bg-stone disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Booking…
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
