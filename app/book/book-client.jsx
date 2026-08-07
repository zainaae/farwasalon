'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { m, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Check, Loader2, ChevronDown, CalendarCheck } from 'lucide-react'
import { SERVICES, ALL_SERVICES, formatPrice, formatServicePrice, formatDuration, PHONE_RE, getAddonsForService, track, WA_NUMBER } from '../../src/data.js'
import WaCta from '../components/wa-cta.jsx'
import { isDateBlocked, getBlockedReason } from '../../lib/blocked-dates.js'
import { BOOKING_WINDOW_DAYS } from '../../lib/booking-date-rules.js'
import { toLocalDateString, salonTodayString } from '../../lib/date-local.js'
import {
  computeServicesDurationMinutes,
  computeServicesPricePkr,
  servicesHaveVariablePrice,
  MAX_BOOKING_SERVICES,
} from '../../lib/booking-duration.js'
import { getAttribution, formatAttributionCell } from '../../lib/attribution.js'
import { saveBookingRecord, readBookingRecord, listUpcomingBookings, resolveStoredCancelToken } from '../../lib/booking-storage.js'
import { getHeadlineDeal, isDealActive, isDealUpcoming, formatDealRange } from '../../src/deals-data.js'

const BOOK_DRAFT_KEY = 'farwa-book-draft'

function effectiveStep(step, selectedServices, selectedDate, selectedTime) {
  if (!selectedServices?.length) return 0
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
  const serviceIdsParam = searchParams.get('serviceIds')
  const categoryParam = searchParams.get('category')
  const dateParam = searchParams.get('date')
  const timeParam = searchParams.get('time')
  const stepParam = searchParams.get('step')

  const idsFromParam = serviceIdsParam
    ? serviceIdsParam.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n) && n > 0)
    : []
  const legacyId = serviceIdParam != null ? parseInt(serviceIdParam, 10) : NaN
  const draftIds = Array.isArray(draft?.serviceIds)
    ? draft.serviceIds.map((id) => parseInt(String(id), 10)).filter((n) => Number.isFinite(n) && n > 0)
    : draft?.serviceId != null
      ? [parseInt(String(draft.serviceId), 10)].filter((n) => Number.isFinite(n) && n > 0)
      : []

  let idList = idsFromParam.length > 0
    ? idsFromParam
    : Number.isFinite(legacyId) && legacyId > 0
      ? [legacyId]
      : draftIds
  idList = [...new Set(idList)]

  const selectedServices = idList
    .map((id) => ALL_SERVICES.find((s) => s.id === id))
    .filter(Boolean)

  let expandedCat = categoryParam && CATEGORIES.includes(categoryParam) ? categoryParam : null
  if (selectedServices.length > 0) {
    expandedCat = selectedServices[selectedServices.length - 1].category
  }

  const selectedDate = dateParam || draft?.date || ''
  const selectedTime = timeParam || draft?.time || ''
  let step = stepParam != null
    ? Math.min(2, Math.max(0, parseInt(stepParam, 10) || 0))
    : (draft?.step ?? (selectedServices.length && selectedDate && selectedTime ? 2 : selectedServices.length && selectedDate ? 1 : 0))
  step = effectiveStep(step, selectedServices, selectedDate, selectedTime)

  const addonIds = Array.isArray(draft?.addonIds) ? draft.addonIds : []

  return {
    step,
    selectedServices,
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
  enter:  () => ({ opacity: 0.92, y: 8 }),
  center: { opacity: 1, y: 0 },
  exit:   () => ({ opacity: 0.92, y: -6 }),
}

function FirstVisitHint() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-8 panel-muted shadow-soft">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="tap-safe w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-ink text-xs font-[family-name:var(--font-inter)] font-medium">First visit? Here&apos;s what to expect</span>
        <ChevronDown className={`w-4 h-4 text-stone transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <ul className="px-4 pb-4 flex flex-col gap-2.5">
              {[
                'Choose one or more services — no account needed',
                'Pick a date and time that works for you',
                'Confirm online — your slot is saved instantly',
                'Optional: message us on WhatsApp for directions or questions',
                'Walk-ins welcome — book online to skip the wait',
              ].map(tip => (
                <li key={tip} className="flex items-start gap-2 text-stone text-xs font-[family-name:var(--font-inter)] font-light">
                  <Check className="w-3.5 h-3.5 text-accent-gold-deep shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * The retrieval half of a durable confirmation: a customer who closed the tab no
 * longer has the confirmation URL, so /book is where she comes looking. Reads
 * only what this device already stored — nothing is fetched, nothing leaves.
 */
function UpcomingBookings() {
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    /* Deferred to a microtask: the server cannot know what this device stored,
       so reading during render would mismatch hydration. Matches the pattern the
       confirmation and cancel pages use. */
    queueMicrotask(() => setBookings(listUpcomingBookings()))
  }, [])

  if (bookings.length === 0) return null

  return (
    <div className="mb-8 panel-soft p-5 shadow-soft">
      <p className="eyebrow mb-3">
        — Your upcoming appointment{bookings.length > 1 ? 's' : ''}
      </p>
      <ul className="flex flex-col divide-y divide-border-soft">
        {bookings.map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-syne)] font-bold text-[13px] text-ink uppercase truncate">
                {b.service || 'Appointment'}
              </p>
              <p className="text-stone text-[11px] font-[family-name:var(--font-inter)] mt-0.5">
                {formatDateNice(b.date)}
                {b.time ? ` · ${formatTime12(b.time)}` : ''}
              </p>
            </div>
            <Link
              /* Only the id and the wall-clock details travel — the cancel token
                 and her name stay in storage, out of anything analytics reads. */
              href={`/book/confirmation?${new URLSearchParams({
                id: b.id,
                date: b.date,
                time: b.time,
                duration: String(b.duration),
              }).toString()}`}
              className="shrink-0 inline-flex items-center gap-1.5 text-ink text-[10px] tracking-[0.14em] uppercase font-semibold font-[family-name:var(--font-inter)] underline underline-offset-2 hover:text-accent-gold-deep transition-colors"
            >
              <CalendarCheck className="w-3.5 h-3.5" aria-hidden="true" />
              View or cancel
            </Link>
          </li>
        ))}
      </ul>
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
  const [selectedServices, setSelectedServices] = useState(boot.selectedServices)
  const primaryService = selectedServices[0] || null

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

  const headlineDeal = getHeadlineDeal()
  const dealLive = headlineDeal ? isDealActive(headlineDeal) : false
  const dealUpcoming = headlineDeal ? isDealUpcoming(headlineDeal) : false
  const dealThreshold = (dealLive || dealUpcoming) && headlineDeal?.thresholdPkr
    ? headlineDeal.thresholdPkr
    : 0
  const dealRange = headlineDeal ? formatDealRange(headlineDeal) : ''

  const serviceIdsKey = selectedServices.map((s) => s.id).join(',')

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedServices.length === 1) {
      params.set('serviceId', String(selectedServices[0].id))
    } else if (selectedServices.length > 1) {
      params.set('serviceIds', selectedServices.map((s) => s.id).join(','))
    }
    if (selectedDate) params.set('date', selectedDate)
    if (selectedTime) params.set('time', selectedTime)
    if (step > 0) params.set('step', String(step))

    const qs = params.toString()
    router.replace(qs ? `/book?${qs}` : '/book', { scroll: false })
  }, [selectedServices, selectedDate, selectedTime, step, router])

  useEffect(() => {
    try {
      localStorage.setItem(BOOK_DRAFT_KEY, JSON.stringify({
        serviceIds: selectedServices.map((s) => s.id),
        serviceId: primaryService?.id ?? null,
        date: selectedDate,
        time: selectedTime,
        step,
        clientName,
        clientPhone,
        notes,
        addonIds: selectedServices.length === 1 ? [...selectedAddonIds] : [],
      }))
    } catch {
      // ignore quota / private mode
    }
  }, [selectedServices, primaryService, selectedDate, selectedTime, step, clientName, clientPhone, notes, selectedAddonIds])

  const goTo = useCallback((target) => {
    const next = effectiveStep(target, selectedServices, selectedDate, selectedTime)
    if (target === 1 && selectedServices.length === 0) return
    if (target === 2 && (selectedServices.length === 0 || !selectedDate || !selectedTime)) return
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }, [step, selectedServices, selectedDate, selectedTime])

  const toggleService = useCallback((s) => {
    setSelectedServices((prev) => {
      const exists = prev.some((p) => p.id === s.id)
      if (exists) return prev.filter((p) => p.id !== s.id)
      if (prev.length >= MAX_BOOKING_SERVICES) return prev
      return [...prev, s]
    })
    setSelectedAddonIds(new Set())
    setSelectedTime('')
  }, [])

  const removeService = useCallback((id) => {
    setSelectedServices((prev) => prev.filter((p) => p.id !== id))
    setSelectedAddonIds(new Set())
    setSelectedTime('')
  }, [])

  const addonIdsList = selectedServices.length === 1 ? [...selectedAddonIds] : []
  const addonIdsKey = addonIdsList.sort((a, b) => a - b).join(',')
  const totalDurationMinutes = selectedServices.length
    ? computeServicesDurationMinutes(selectedServices, addonIdsList)
    : 0
  /* Basket value in PKR — BookingCompleted conversion + Freedom Deal meter. */
  const totalPricePkr = computeServicesPricePkr(selectedServices, addonIdsList)
  /* site-config.js documents the contract: the "from" qualifier must survive
     everywhere a price is shown, not just on the menu. The picker honoured it
     and every total below dropped it. */
  const priceIsFrom = servicesHaveVariablePrice(selectedServices)
  const totalLabel = priceIsFrom ? `from ${formatPrice(totalPricePkr)}` : formatPrice(totalPricePkr)

  useEffect(() => {
    if (step !== 1 || !selectedDate || selectedServices.length === 0) return
    setLoadingSlots(true) // eslint-disable-line react-hooks/set-state-in-effect -- set loading before async fetch
    setSlotsError('')
    setSelectedTime('')
    const addonQuery = addonIdsKey ? `&addonIds=${encodeURIComponent(addonIdsKey)}` : ''
    const idsQuery =
      selectedServices.length === 1
        ? `serviceId=${selectedServices[0].id}`
        : `serviceIds=${encodeURIComponent(serviceIdsKey)}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25_000)
    fetch(`/api/slots?date=${selectedDate}&${idsQuery}${addonQuery}`, {
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
  }, [step, selectedDate, serviceIdsKey, selectedServices, addonIdsKey])

  const validatePhone = (value) => {
    if (value && !PHONE_RE.test(value.replace(/\s/g, ''))) {
      setPhoneError('Enter a valid Pakistani number (e.g. 03xx-xxxxxxx)')
      return false
    }
    setPhoneError('')
    return true
  }

  const handleSubmit = async () => {
    if (selectedServices.length === 0 || !selectedDate || !selectedTime) {
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
    const addons =
      selectedServices.length === 1
        ? getAddonsForService(primaryService.id).filter((a) => selectedAddonIds.has(a.id))
        : []
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
          serviceId: primaryService.id,
          serviceIds: selectedServices.map((s) => s.id),
          addonIds: addonIdsList,
          date: selectedDate,
          time: selectedTime,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          notes: combinedNotes,
          source: formatAttributionCell(getAttribution()),
          website,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        let msg = data.error || 'Something went wrong. Please try again.'
        if (res.status === 429) {
          msg = 'Too many booking attempts — please wait a minute and try again.'
        } else if (res.status === 400 && /closed|sunday/i.test(String(data.error || ''))) {
          msg = 'We are closed that day. Please choose another date or message us on WhatsApp.'
        } else if (res.status === 409) {
          msg = 'That time was just taken. Please pick another slot.'
        }
        setError(msg)
        setSubmitting(false)
        return
      }
      try {
        localStorage.removeItem(BOOK_DRAFT_KEY)
      } catch {
        // ignore
      }
      const bookedDuration = data.booking.duration || totalDurationMinutes
      /* The whole record — including the cancel token — goes to durable storage,
         not sessionStorage. This is the only copy the customer will ever hold:
         nothing is texted, WhatsApped or emailed to her, so if it dies with the
         tab she has no proof the appointment exists and no way to cancel it,
         while the FAQ still penalises her for cancelling late.
         Idempotent retries return cancelToken: null — preserve any token we
         already stored for this id instead of wiping it to ''. */
      const existing = readBookingRecord(data.booking.id)
      saveBookingRecord({
        id: data.booking.id,
        service: data.booking.service,
        name: data.booking.clientName,
        date: data.booking.date,
        time: data.booking.time,
        duration: bookedDuration,
        cancelToken: resolveStoredCancelToken(data.booking.cancelToken, existing?.cancelToken),
      })
      /* The cancel token stays out of the URL. Plausible and the Meta Pixel both
         transmit location.href, so a token in the query string is a bearer
         credential handed to third parties on every confirmation view — and the
         customer's name went with it. It is never emailed or written to the
         sheet, so local storage loses nothing. */
      const params = new URLSearchParams({
        id: data.booking.id,
        date: data.booking.date,
        time: data.booking.time,
        duration: String(bookedDuration),
        /* Signals a fresh booking so confirmation can open WhatsApp once.
           Safe in the URL — not a secret; stripped after the prompt runs. */
        openWa: '1',
      })

      /* The conversion. BookingStarted was already tracked at step 1, so this
         is what makes booking completion rate measurable at all. Fired before
         the redirect so it survives the navigation. */
      track('BookingCompleted', {
        service: data.booking.service,
        category: primaryService?.category,
        services: selectedServices.length,
        addons: addonIdsList.length,
        value: totalPricePkr,
      })

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

  /* The booking server validates dates in salon time (Asia/Karachi), so the
     date strip must anchor on the SALON's today, not the visitor's device.
     For a visitor west of Karachi, device-today can be the salon's yesterday
     for ~10-14h a day — anchoring locally made the first chip a rejected past
     date and same-day booking silently impossible. */
  const today = new Date(`${salonTodayString()}T12:00:00`)
  const days = []
  for (let i = 0; i < BOOKING_WINDOW_DAYS; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    days.push(d)
  }

  return (
    <main id="main" className="page-content overflow-x-clip">
      {/* No max-w-full here. .section-shell is max-width:80rem, and the
          utility's max-width:100% beat it — so the conversion page ran its
          shell to the full viewport and started content at x=40 while every
          other page on the site starts at x=120. It was redundant as well as
          harmful: width:100% already prevents the container exceeding its
          parent, and min-w-0 + overflow-x-clip handle the child that forces
          a scrollbar, which is what it was reaching for. */}
      <div className="section-shell section-pad min-h-0 min-w-0 overflow-x-clip pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">

        <div className="mb-10 md:mb-14 border-b border-border-soft pb-8">
          <m.h1
            initial={{ y: 16, opacity: 0.85 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="display-page text-ink mb-4 break-words"
          >
            Book online
          </m.h1>
          <m.p
            initial={{ opacity: 0.85, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55 }}
            className="text-body max-w-lg"
          >
            Pick one or more services, choose a date and time, and confirm your appointment in under a minute.
            {dealThreshold ? (
              <> Combine anything toward {formatPrice(dealThreshold)} for the Freedom Deal ({dealRange}).</>
            ) : null}
          </m.p>
          {/* The step sequence used to be printed here as plain text and then
              again 110px below as the real numbered stepper, with the same
              three labels. The stepper says it better, shows which step you
              are on, and is already announced to screen readers by the
              sr-only live region beneath it — so this line was telling every
              visitor the same thing twice before they had done anything. */}
        </div>

        {step === 0 && <UpcomingBookings />}

        {/* Step indicator */}
        <p className="sr-only" aria-live="polite">
          Step {step + 1} of 3: {['Choose services', 'Pick date and time', 'Enter your details'][step]}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-4 mb-4 min-w-0" role="list" aria-label="Booking steps">
          {['Service', 'Date & Time', 'Details'].map((label, i) => (
            <div key={label} className="flex items-center gap-1.5 sm:gap-2 shrink-0" role="listitem">
              <span className={`w-7 h-7 flex items-center justify-center text-[11px] font-[family-name:var(--font-inter)] font-bold transition-colors ${
                i < step ? 'bg-plum-deep text-white' :
                i === step ? 'bg-plum-deep text-white' :
                'border border-border-soft text-stone'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={`text-[10px] sm:text-[11px] tracking-[0.1em] sm:tracking-[0.12em] uppercase font-[family-name:var(--font-inter)] ${
                i === step ? 'text-ink font-medium' : 'text-stone'
              }`}>
                {label}
              </span>
              {i < 2 && <span className="w-4 sm:w-8 h-px bg-border-soft" aria-hidden="true" />}
            </div>
          ))}
        </div>

        {selectedServices.length > 0 && (
          <div className="mb-6 panel-muted px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-ink text-xs font-[family-name:var(--font-inter)] min-w-0">
              <span className="font-medium">
                {selectedServices.length} service{selectedServices.length === 1 ? '' : 's'}
              </span>
              <span className="text-stone"> · {formatDuration(totalDurationMinutes)} · {totalLabel}</span>
              {selectedDate && selectedTime ? (
                <span className="text-stone"> · {formatDateNice(selectedDate)} · {formatTime12(selectedTime)}</span>
              ) : null}
            </p>
            <WaCta
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hi Farwa — I need help with an online booking.')}`}
              from="book-help"
              className="tap-safe shrink-0 text-[10px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone hover:text-ink transition-colors"
            >
              Need help? WhatsApp
            </WaCta>
          </div>
        )}

        <div className="h-px bg-border-soft w-full mb-8 overflow-hidden">
          <m.div
            className="h-full bg-plum"
            animate={{ width: `${((step + 1) / 3) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <FirstVisitHint />

        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <m.div
              key="step0"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="eyebrow mb-2">— Choose services</p>
              <p className="text-stone text-xs font-[family-name:var(--font-inter)] font-light mb-6 max-w-lg">
                Tap to add or remove. You can mix categories in one visit
                {dealThreshold
                  ? ` — build toward ${formatPrice(dealThreshold)} for Freedom Deal`
                  : ''}
                .
              </p>

              {selectedServices.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {selectedServices.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => removeService(s.id)}
                      className="tap-safe inline-flex items-center gap-1.5 border border-ink bg-mist px-2.5 py-1.5 text-[11px] font-[family-name:var(--font-inter)] text-ink"
                      aria-label={`Remove ${s.name}`}
                    >
                      <span className="font-medium">{s.name}</span>
                      {s.pricePkr != null && (
                        <span className="text-stone">{formatServicePrice(s)}</span>
                      )}
                      <span className="text-stone" aria-hidden="true">×</span>
                    </button>
                  ))}
                </div>
              )}

              {dealThreshold > 0 && selectedServices.length > 0 && (
                <div className="mb-6 max-w-md">
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <p className="text-[10px] tracking-[0.18em] uppercase font-[family-name:var(--font-inter)] text-stone">
                      Toward Freedom Deal · {formatPrice(dealThreshold)}
                      {dealUpcoming ? ` · ${dealRange}` : ''}
                    </p>
                    <p className="text-xs font-[family-name:var(--font-inter)] text-ink font-medium">
                      {totalPricePkr >= dealThreshold
                        ? `${dealLive ? (priceIsFrom ? 'Floor ready' : 'Qualified') : 'Ready'} · ${totalLabel}`
                        : `${totalLabel} of ${formatPrice(dealThreshold)}`}
                    </p>
                  </div>
                  <div className="h-1.5 bg-border-soft w-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-gold to-[#8b6d59] transition-[width] duration-300"
                      style={{
                        width: `${Math.min(100, Math.round((totalPricePkr / dealThreshold) * 100))}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-stone font-[family-name:var(--font-inter)] font-light mt-1.5">
                    {priceIsFrom
                      ? totalPricePkr >= dealThreshold
                        ? dealLive
                          ? 'Starting total reaches the Freedom Deal mark — final quote (by hair) confirms 14% at the counter.'
                          : `Starting total hits the Freedom Deal mark (${dealRange}); final quote still depends on hair.`
                        : `Starting from ${totalLabel} — hair/bridal finals are quoted before your visit. Add about ${formatPrice(dealThreshold - totalPricePkr)} more toward Freedom Deal.`
                      : totalPricePkr >= dealThreshold
                        ? dealLive
                          ? 'Your visit qualifies for 14% off at the counter.'
                          : `Basket hits the Freedom Deal mark (${dealRange}).`
                        : dealLive
                          ? `Add ${formatPrice(dealThreshold - totalPricePkr)} more to unlock 14% off.`
                          : `Add ${formatPrice(dealThreshold - totalPricePkr)} more toward Freedom Deal.`}
                  </p>
                </div>
              )}

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
                          className="tap-safe book-category-btn group"
                        >
                          <p className="font-[family-name:var(--font-syne)] font-bold text-xs text-ink uppercase leading-tight break-words">{cat}</p>
                          <p className="text-stone text-[10px] font-[family-name:var(--font-inter)] mt-1">
                            {services.length} services
                            {(() => {
                              const prices = services.map((s) => s.pricePkr).filter(Boolean)
                              return prices.length ? ` · from ${formatPrice(Math.min(...prices))}` : ''
                            })()}
                          </p>
                        </button>
                      ) : (
                        <div className="panel-soft p-5 md:p-6 shadow-soft">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-[family-name:var(--font-syne)] font-bold text-sm text-ink uppercase">{cat}</p>
                              <p className="text-stone text-[10px] font-[family-name:var(--font-inter)] mt-0.5">{services.length} services</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setExpandedCat(null)}
                              className="text-stone text-[10px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] hover:text-ink transition-colors flex items-center gap-1"
                            >
                              <ChevronLeft className="w-3 h-3" /> All categories
                            </button>
                          </div>
                          <div className="flex flex-col divide-y divide-border-soft border-y border-border-soft">
                            {services.map((s) => {
                              const sel = selectedServices.some((p) => p.id === s.id)
                              const atCap = !sel && selectedServices.length >= MAX_BOOKING_SERVICES
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => !atCap && toggleService(s)}
                                  disabled={atCap}
                                  aria-pressed={sel}
                                  className={`tap-safe flex items-center justify-between gap-3 py-3.5 text-left transition-colors ${
                                    sel ? 'bg-mist/80 pl-2' : atCap ? 'opacity-40 cursor-not-allowed' : 'hover:bg-mist hover:pl-2'
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <span className="font-[family-name:var(--font-syne)] font-bold text-[13px] text-ink uppercase block">{s.name}</span>
                                    <span className="text-stone text-[10px] font-[family-name:var(--font-inter)] mt-0.5 block">
                                      {s.durationMinutes != null && formatDuration(s.durationMinutes)}
                                    </span>
                                  </div>
                                  {s.pricePkr != null && (
                                    <span className="shrink-0 text-accent-gold-deep text-sm font-[family-name:var(--font-inter)] font-semibold">
                                      {formatServicePrice(s)}
                                    </span>
                                  )}
                                  <span
                                    className={`shrink-0 w-8 h-8 flex items-center justify-center border transition-colors ${
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
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {selectedServices.length > 0 && (
                <div className="sticky bottom-0 z-[1] pt-5 mt-6 book-step-footer pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-[family-name:var(--font-syne)] font-bold text-sm text-ink uppercase truncate">
                        {selectedServices.length === 1
                          ? selectedServices[0].name
                          : `${selectedServices.length} services`}
                      </p>
                      <p className="text-stone text-[10px] font-[family-name:var(--font-inter)]">
                        {totalLabel} · {formatDuration(totalDurationMinutes)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => goTo(1)}
                      className="btn-primary shrink-0"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </m.div>
          )}

          {step === 1 && (
            <m.div
              key="step1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="eyebrow mb-2">— Selected services</p>
              <div className="mb-6">
                {selectedServices.map((s) => (
                  <p key={s.id} className="font-[family-name:var(--font-syne)] font-bold text-sm text-ink uppercase">
                    {s.name}
                    {s.pricePkr != null && (
                      <span className="text-stone font-normal text-[10px] font-[family-name:var(--font-inter)] ml-2">
                        {formatServicePrice(s)}
                      </span>
                    )}
                  </p>
                ))}
                <p className="text-stone text-[10px] font-[family-name:var(--font-inter)] mt-1">
                  {formatDuration(totalDurationMinutes)}
                  {totalPricePkr > 0 ? ` · ${totalLabel}` : ''}
                  {dealThreshold && totalPricePkr >= dealThreshold
                    ? dealLive
                      ? priceIsFrom
                        ? ' · Freedom Deal on confirmed quote'
                        : ' · Freedom Deal eligible'
                      : ` · Toward Freedom Deal (${dealRange})`
                    : ''}
                </p>
                {priceIsFrom && (
                  <p className="text-stone text-[10px] font-[family-name:var(--font-inter)] font-light mt-1.5 max-w-md">
                    Hair and bridal prices start from the printed floor — final quote depends on your hair, confirmed before the appointment.
                  </p>
                )}
              </div>

              {primaryService &&
                selectedServices.length === 1 &&
                getAddonsForService(primaryService.id).length > 0 && (
                <m.div className="mb-6 max-w-md">
                  <p className="text-[10px] tracking-[0.2em] uppercase font-[family-name:var(--font-inter)] text-stone mb-3">
                    Optional add-ons (affects time slots)
                  </p>
                  <div className="flex flex-col gap-2">
                    {getAddonsForService(primaryService.id).map((addon) => {
                      const checked = selectedAddonIds.has(addon.id)
                      return (
                        <label
                          key={addon.id}
                          className={`flex items-center gap-3 border px-4 py-3 cursor-pointer transition-colors ${
                            checked ? 'border-ink bg-mist' : 'border-border-soft hover:border-ink/40'
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
                          <span className="flex-1 text-sm font-[family-name:var(--font-inter)] text-ink">{addon.name}</span>
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
                </m.div>
              )}

              <p className="eyebrow mb-4">— Pick a date</p>
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
                      className={`tap-safe snap-center shrink-0 min-w-[4.25rem] w-[4.5rem] py-3 border text-center transition-colors ${
                        sel
                          ? 'bg-ink text-white border-ink'
                          : blocked
                            ? 'border-border-soft text-stone/30 cursor-not-allowed'
                            : 'border-border-soft text-ink hover:border-ink hover:bg-mist cursor-pointer'
                      }`}
                    >
                      <span className={`block text-[9px] tracking-wider uppercase font-[family-name:var(--font-inter)] ${sel ? 'text-white/70' : 'text-stone'}`}>
                        {dayName}
                      </span>
                      <span className="block font-[family-name:var(--font-syne)] font-bold text-lg leading-tight mt-0.5">{dateNum}</span>
                      <span className={`block text-[9px] font-[family-name:var(--font-inter)] ${sel ? 'text-white/70' : 'text-stone'}`}>
                        {blocked ? 'Call' : monthName}
                      </span>
                    </button>
                  )
                })}
              </div>
              </div>

              {selectedDate && (
                <div className="mt-6">
                  <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-[family-name:var(--font-inter)] mb-4">
                    — Available times · {formatDateNice(selectedDate)}
                  </p>
                  {loadingSlots ? (
                    <div role="status" aria-live="polite" className="flex items-center justify-center py-10">
                      <Loader2 className="w-5 h-5 text-stone animate-spin" aria-hidden="true" />
                      <span className="text-stone text-sm font-[family-name:var(--font-inter)] ml-2">Checking availability…</span>
                    </div>
                  ) : slotsError || slots.length === 0 ? (
                    <m.div
                      role="status"
                      className="panel-muted px-4 py-8 text-center shadow-soft"
                    >
                      <p className="text-stone text-sm font-[family-name:var(--font-inter)] font-light mb-4">
                        {slotsError || 'No open slots for this date. Try another day or message us on WhatsApp.'}
                      </p>
                      <WaCta
                        href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hi Farwa — I need help finding an available time.')}`}
                        from="book-slots-empty"
                        className="text-ink text-[11px] tracking-[0.14em] uppercase font-semibold font-[family-name:var(--font-inter)] underline underline-offset-2"
                      >
                        WhatsApp the salon
                      </WaCta>
                    </m.div>
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
                            className={`book-slot tap-safe min-h-[44px] py-3 text-[11px] tracking-wide font-[family-name:var(--font-syne)] font-bold ${
                              sel
                                ? 'book-slot-selected'
                                : available
                                  ? 'book-slot-available text-ink'
                                  : 'border-border-soft text-stone/25 cursor-not-allowed line-through'
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

              <div className="flex justify-between gap-3 pt-5 mt-6 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => goTo(0)}
                  className="tap-safe text-stone text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] px-4 py-3 hover:text-ink transition-colors"
                >
                  ← Back
                </button>
                {selectedTime && (
                  <button
                    type="button"
                    onClick={() => goTo(2)}
                    className="btn-primary"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </m.div>
          )}

          {step === 2 && (
            <m.div
              key="step2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="eyebrow mb-6">— Your details</p>

              <div className="panel-muted p-4 mb-6 shadow-soft">
                <p className="text-[10px] tracking-[0.2em] uppercase font-[family-name:var(--font-inter)] text-stone mb-2">Booking summary</p>
                {selectedServices.map((s) => (
                  <p key={s.id} className="font-[family-name:var(--font-syne)] font-bold text-sm text-ink uppercase">
                    {s.name}
                    {s.pricePkr != null && (
                      <span className="text-accent-gold-deep font-[family-name:var(--font-inter)] font-medium text-xs ml-2 normal-case">
                        {formatServicePrice(s)}
                      </span>
                    )}
                  </p>
                ))}
                <p className="text-stone text-xs font-[family-name:var(--font-inter)] mt-1">
                  {formatDateNice(selectedDate)} · {formatTime12(selectedTime)} · {formatDuration(totalDurationMinutes)}
                </p>
                {totalPricePkr > 0 && (
                  <p className="text-accent-gold-deep text-xs font-[family-name:var(--font-inter)] font-medium mt-0.5">
                    {priceIsFrom ? `Starting from ${formatPrice(totalPricePkr)}` : `Total ${formatPrice(totalPricePkr)}`}
                    {dealThreshold && totalPricePkr >= dealThreshold
                      ? dealLive
                        ? priceIsFrom
                          ? ' · Freedom Deal on confirmed quote'
                          : ' · Freedom Deal — 14% off at the counter'
                        : ` · Toward Freedom Deal (${dealRange})`
                      : ''}
                  </p>
                )}
                {priceIsFrom && (
                  <p className="text-stone text-[10px] font-[family-name:var(--font-inter)] font-light mt-1.5">
                    Final PKR confirmed for your hair before the visit — not a fixed online total.
                  </p>
                )}
                {primaryService &&
                  selectedServices.length === 1 &&
                  getAddonsForService(primaryService.id)
                    .filter((a) => selectedAddonIds.has(a.id))
                    .map((a) => (
                      <p key={a.id} className="text-stone text-xs font-[family-name:var(--font-inter)] mt-1">
                        + {a.name}
                        {a.pricePkr != null ? ` · ${formatPrice(a.pricePkr)}` : ''}
                      </p>
                    ))}
              </div>

              <div className="flex flex-col gap-4 max-w-md relative">
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
                  <label htmlFor="bk-name" className="text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone mb-1.5 block">
                    Name <span className="text-accent-gold-deep">*</span>
                  </label>
                  <input
                    id="bk-name"
                    type="text"
                    placeholder="Your full name"
                    autoComplete="name"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="bk-phone" className="text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone mb-1.5 block">
                    Phone <span className="text-accent-gold-deep">*</span>
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
                    className="input-field"
                  />
                  {phoneError && <p id="bk-phone-error" role="alert" className="text-red-600 text-xs font-[family-name:var(--font-inter)] mt-1">{phoneError}</p>}
                </div>
                <div>
                  <label htmlFor="bk-notes" className="text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone mb-1.5 block">
                    Notes <span className="text-stone">(optional)</span>
                  </label>
                  <textarea
                    id="bk-notes"
                    placeholder="Any special requests or preferences…"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              </div>

              <div role="alert" aria-live="assertive">
                {error && (
                  <div className="mt-4 p-3 border border-red-200 bg-red-50 max-w-md">
                    <p className="text-red-700 text-xs font-[family-name:var(--font-inter)]">{error}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-3 pt-5 mt-6 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  className="tap-safe text-stone text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] px-4 py-3 hover:text-ink transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !clientName.trim() || !clientPhone.trim()}
                  aria-busy={submitting}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-ink"
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
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
