'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { m } from 'framer-motion'
import { AlertTriangle, Check, X, ArrowUpRight } from 'lucide-react'

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

function CancelContent() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const id = params.get('id') || ''
  const service = params.get('service') || ''
  const date = params.get('date') || ''
  const time = params.get('time') || ''
  const name = params.get('name') || ''

  const [state, setState] = useState('idle')
  const [error, setError] = useState('')

  const handleCancel = async () => {
    setState('submitting')
    setError('')
    try {
      const res = await fetch('/api/book/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          token ? { token } : { bookingId: id, date },
        ),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to cancel. Please try again.')
        setState('error')
        return
      }
      setState('success')
    } catch {
      setError('Network error. Please check your connection or WhatsApp the salon.')
      setState('error')
    }
  }

  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Hi! I'd like to cancel my booking.\nBooking ID: ${id}\nService: ${service}\nDate: ${formatDateNice(date)}\nTime: ${formatTime12(time)}\nName: ${name}`,
  )}`

  if ((!token && !id) || !date) {
    return (
      <div className="w-full max-w-lg text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-mist flex items-center justify-center rounded-full">
          <AlertTriangle className="w-7 h-7 text-stone" strokeWidth={2} />
        </div>
        <h1 className="font-['Syne'] font-bold text-2xl text-ink uppercase tracking-tight mb-2">
          Invalid cancellation link
        </h1>
        <p className="text-stone text-sm font-['Inter'] font-light mb-8">
          This cancellation link is missing required information. Please WhatsApp the salon directly.
        </p>
        <a
          href={`https://wa.me/${WA_NUMBER}`}
          target="_blank"
          rel="noreferrer"
          className="tap-safe w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-4 hover:bg-[#20bd5a] transition-colors"
        >
          WhatsApp the salon <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="w-full max-w-lg text-center" role="status" aria-live="polite">
        <div className="w-16 h-16 mx-auto mb-6 bg-[#e8f5e3] flex items-center justify-center rounded-full">
          <Check className="w-8 h-8 text-[#4a9b3f]" strokeWidth={2.5} />
        </div>
        <h1 className="font-['Syne'] font-bold text-2xl md:text-3xl text-ink uppercase tracking-tight mb-2">
          Cancelled
        </h1>
        <p className="text-stone text-sm font-['Inter'] font-light mb-8">
          Your appointment has been cancelled. We&apos;re sorry to miss you — hope to see you soon.
        </p>
        <Link
          href="/book"
          className="btn-primary w-full"
        >
          Book another appointment <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg text-center"
    >
      <div className="w-16 h-16 mx-auto mb-6 bg-[#fbeaea] flex items-center justify-center rounded-full">
        <AlertTriangle className="w-7 h-7 text-[#c44a4a]" strokeWidth={2} />
      </div>

      <h1 className="font-['Syne'] font-bold text-2xl md:text-3xl text-ink uppercase tracking-tight mb-2">
        Cancel appointment?
      </h1>
      <p className="text-stone text-sm font-['Inter'] font-light mb-8">
        This will free your time slot for other guests. Online cancellation is available at least 2 hours before your appointment.
      </p>

      <div className="panel-soft p-6 text-left mb-8 shadow-soft">
        <p className="eyebrow mb-4">Appointment details</p>
        <div className="space-y-3">
          {service && (
            <>
              <div className="flex justify-between items-start">
                <span className="text-stone text-xs font-['Inter']">Service</span>
                <span className="font-['Syne'] font-bold text-sm text-ink uppercase text-right max-w-[60%]">{service}</span>
              </div>
              <div className="h-px bg-border-soft" />
            </>
          )}
          <div className="flex justify-between items-start">
            <span className="text-stone text-xs font-['Inter']">Date</span>
            <span className="text-ink text-sm font-['Inter'] font-medium">{formatDateNice(date)}</span>
          </div>
          {time && (
            <>
              <div className="h-px bg-border-soft" />
              <div className="flex justify-between items-start">
                <span className="text-stone text-xs font-['Inter']">Time</span>
                <span className="text-ink text-sm font-['Inter'] font-medium">{formatTime12(time)}</span>
              </div>
            </>
          )}
          <div className="h-px bg-border-soft" />
          <div className="flex justify-between items-start">
            <span className="text-stone text-xs font-['Inter']">Booking ID</span>
            <span className="text-stone text-xs font-['Inter'] font-mono">{id}</span>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" aria-live="assertive" className="mb-6 border border-[#c44a4a]/30 bg-[#fbeaea]/40 px-4 py-3 text-left">
          <p className="text-[#c44a4a] text-xs font-['Inter'] flex items-start gap-2">
            <X className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={state === 'submitting'}
          aria-busy={state === 'submitting'}
          className="tap-safe w-full inline-flex items-center justify-center gap-2 bg-[#c44a4a] text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-4 hover:bg-[#a83a3a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {state === 'submitting' ? 'Cancelling…' : 'Yes, cancel my appointment'}
        </button>
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          className="tap-safe w-full inline-flex items-center justify-center gap-2 text-stone text-[11px] tracking-[0.16em] uppercase font-['Inter'] hover:text-ink transition-colors"
        >
          Or message the salon on WhatsApp
        </a>
        <Link
          href="/"
          className="btn-secondary w-full"
        >
          Keep my appointment
        </Link>
      </div>
    </m.div>
  )
}

export default function CancelClient() {
  return (
    <main id="main" className="page-content">
      <div className="section-shell section-pad min-h-screen flex items-start justify-center">
        <Suspense fallback={<p className="text-stone text-sm font-['Inter']">Loading…</p>}>
          <CancelContent />
        </Suspense>
      </div>
    </main>
  )
}
