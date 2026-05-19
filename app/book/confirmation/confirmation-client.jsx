'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowUpRight, CalendarPlus } from 'lucide-react'
import { buildBookingIcs } from '../../../lib/calendar-ics.js'

const WA_NUMBER = '923222782254'

function formatDateNice(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime12(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const id      = searchParams.get('id') || ''
  const service = searchParams.get('service') || ''
  const date    = searchParams.get('date') || ''
  const time    = searchParams.get('time') || ''
  const name    = searchParams.get('name') || ''
  const duration = parseInt(searchParams.get('duration') || '60', 10) || 60
  const cancelToken = searchParams.get('token') || ''

  const calendarHref = useMemo(() => {
    if (!date || !time) return null
    const ics = buildBookingIcs({ id, service, date, time, name, durationMinutes: duration })
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
  }, [id, service, date, time, name, duration])

  const waText = [
    `Hi! I've just booked ${service} at Farwa Beauty Salon.`,
    `Date: ${formatDateNice(date)}`,
    `Time: ${formatTime12(time)}`,
    `Name: ${name}`,
    `Booking ID: ${id}`,
  ].join('\n')
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`
  const valid = Boolean(id && date && time && service)

  if (!valid) {
    return (
      <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">
        <motion.div className="max-w-screen-xl mx-auto px-4 py-20 min-h-screen flex items-center justify-center">
          <div className="max-w-md text-center">
            <h1 className="font-['Syne'] font-bold text-xl text-ink uppercase mb-3">Invalid confirmation link</h1>
            <p className="text-stone text-sm font-['Inter'] font-light mb-6">
              This page needs a valid booking reference. Return to booking or contact us on WhatsApp.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-3.5"
            >
              Book an appointment
            </Link>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-14 md:py-20 min-h-screen flex items-start justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-[#e8f5e3] flex items-center justify-center rounded-full">
            <Check className="w-8 h-8 text-[#4a9b3f]" strokeWidth={2.5} />
          </div>

          <div role="status" aria-live="polite">
            <h1 className="font-['Syne'] font-bold text-2xl md:text-3xl text-ink uppercase tracking-tight mb-2">
              You&apos;re booked!
            </h1>
            <p className="text-stone text-sm font-['Inter'] font-light mb-8">
              Your slot is reserved. Message us on WhatsApp for directions or any questions (optional).
            </p>
          </div>

          <div className="border border-[#e4ddd7] bg-[#faf7f5] p-6 text-left mb-8">
            <p className="text-[10px] tracking-[0.2em] uppercase font-['Inter'] text-stone mb-4">Appointment details</p>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-stone text-xs font-['Inter']">Service</span>
                <span className="font-['Syne'] font-bold text-sm text-ink uppercase text-right max-w-[60%]">{service}</span>
              </div>
              <div className="h-px bg-[#e4ddd7]" />
              <div className="flex justify-between items-start">
                <span className="text-stone text-xs font-['Inter']">Date</span>
                <span className="text-ink text-sm font-['Inter'] font-medium">{formatDateNice(date)}</span>
              </div>
              <div className="h-px bg-[#e4ddd7]" />
              <div className="flex justify-between items-start">
                <span className="text-stone text-xs font-['Inter']">Time</span>
                <span className="text-ink text-sm font-['Inter'] font-medium">{formatTime12(time)}</span>
              </div>
              <div className="h-px bg-[#e4ddd7]" />
              <div className="flex justify-between items-start">
                <span className="text-stone text-xs font-['Inter']">Name</span>
                <span className="text-ink text-sm font-['Inter'] font-medium">{name}</span>
              </div>
              {id && (
                <>
                  <div className="h-px bg-[#e4ddd7]" />
                  <div className="flex justify-between items-start">
                    <span className="text-stone text-xs font-['Inter']">Booking ID</span>
                    <span className="text-stone text-xs font-['Inter'] font-mono">{id}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="tap-safe w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-4 hover:bg-[#20bd5a] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Message us on WhatsApp
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            {calendarHref && (
              <a
                href={calendarHref}
                download={`farwa-booking-${id || 'appointment'}.ics`}
                className="tap-safe w-full inline-flex items-center justify-center gap-2 border border-[#e4ddd7] text-ink text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-3.5 hover:bg-mist transition-colors"
              >
                <CalendarPlus className="w-4 h-4" />
                Add to Calendar
              </a>
            )}
            <Link
              href="/book"
              className="tap-safe w-full inline-flex items-center justify-center gap-2 border border-[#e4ddd7] text-ink text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-3.5 hover:bg-mist transition-colors"
            >
              Book Another Appointment
            </Link>
          </div>

          {cancelToken && id && date && (
            <p className="mt-4 text-stone/60 text-[10px] font-['Inter']">
              Need to cancel?{' '}
              <Link
                href={`/book/cancel?${new URLSearchParams({
                  token: cancelToken,
                  id,
                  service,
                  date,
                  time,
                  name,
                }).toString()}`}
                className="underline underline-offset-2 hover:text-ink transition-colors"
              >
                Cancel this appointment
              </Link>
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-6">
            {['Slot reserved online', 'WhatsApp optional'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-[10px] text-stone font-['Inter']">
                <Check className="w-3 h-3 text-ink/40 shrink-0" /> {t}
              </span>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#e4ddd7]">
            <a
              href="https://g.page/farwasalon/review"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-stone text-xs font-['Inter'] hover:text-ink transition-colors"
            >
              Enjoyed your visit? Rate us on Google
              <span className="text-[#c9a98a]" aria-hidden="true">★★★★★</span>
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

export default function ConfirmationClient() {
  return (
    <Suspense fallback={
      <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">
        <div className="max-w-screen-xl mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
          <p className="text-stone text-sm font-['Inter']">Loading confirmation…</p>
        </div>
      </main>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
