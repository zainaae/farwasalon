'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { m } from 'framer-motion'
import { Clock, ArrowUpRight } from 'lucide-react'
import { CTA_PRIMARY_LABEL } from '../../src/shared.jsx'
import { salonTodayString } from '../../lib/date-local.js'

const REFRESH_MS = 60_000

export default function LiveAvailability() {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let active = true
    async function load() {
      /* "Today" in salon time, matching how /api/slots judges past dates.
         Using device-local today would fetch a date the server sees as past
         for visitors west of Karachi, 400, and silently hide the widget. */
      const today = salonTodayString()
      try {
        // Allow short CDN/browser cache (slots route sets s-maxage=15).
        const res = await fetch(`/api/slots?date=${today}`)
        if (!active) return
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setState({ status: 'error' })
          return
        }
        if (data.closed) {
          setState({ status: 'closed', reason: data.reason || 'Closed today' })
          return
        }
        const slots = Array.isArray(data.slots) ? data.slots : []
        const free = slots.filter((s) => s.available).length
        const total = slots.length
        setState({ status: 'ok', free, total })
      } catch {
        if (active) setState({ status: 'error' })
      }
    }
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  // Hide if we hit an error or can't load — better silent than wrong
  if (state.status === 'loading' || state.status === 'error') return null

  if (state.status === 'closed') {
    return (
      <m.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-border-soft bg-mist/80 px-4 py-3 shadow-soft max-w-full min-w-0"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Clock className="w-4 h-4 text-stone shrink-0" aria-hidden="true" />
          <p className="text-stone text-xs font-[family-name:var(--font-inter)]">
            <span className="font-medium text-ink">{state.reason}.</span> Browse services and book ahead for the next open day.
          </p>
        </div>
      </m.div>
    )
  }

  const { free, total } = state
  const pct = total > 0 ? free / total : 0
  const tone =
    free === 0
      ? { dot: 'bg-[#c44a4a]', label: 'Fully booked today — book ahead for tomorrow' }
      : pct < 0.3
      ? { dot: 'bg-[#c9a98a]', label: 'Limited slots left today — book soon' }
      : { dot: 'bg-[#4a9b3f]', label: 'Slots available today' }

  return (
    <m.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-border-soft bg-mist/80 px-4 py-3 shadow-soft max-w-full min-w-0"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <span
          aria-hidden="true"
          className={`relative inline-flex w-2 h-2 rounded-full ${tone.dot}`}
        >
          <span className={`absolute inset-0 rounded-full ${tone.dot} animate-ping opacity-60`} />
        </span>
        <p className="text-ink text-xs font-[family-name:var(--font-inter)]">
          <span className="text-stone tracking-wider uppercase text-[10px] mr-2">Live · today</span>
          {tone.label}
        </p>
      </div>
      {free > 0 && (
        <Link
          href="/book"
          className="tap-safe shrink-0 inline-flex items-center gap-1 text-ink text-[10px] tracking-[0.14em] uppercase font-semibold font-[family-name:var(--font-inter)] hover:text-stone transition-colors"
        >
          {CTA_PRIMARY_LABEL} <ArrowUpRight className="w-3 h-3" />
        </Link>
      )}
    </m.div>
  )
}
