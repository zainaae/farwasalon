'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ArrowUpRight from '../components/icon-sprite.jsx'
import WaCta from '../components/wa-cta.jsx'
import {
  QUOTE_DENSITIES,
  QUOTE_LENGTHS,
  buildQuoteWaHref,
  getHairQuoteServices,
  getQuoteServiceById,
  isHairQuoteService,
  quoteFloorLabel,
} from '../../lib/quote-request.js'

/* Special works (no printed SKU) plus catalog Hair / Hair Treatments floors.
   Length + density make the WhatsApp request honest; the reply is the quote. */

const SPECIAL_WORKS = [
  { id: 'party', label: 'Party Makeup', asks: ['look'] },
  { id: 'signature', label: 'Signature / Engagement Look', asks: ['look'] },
  { id: 'hairdo', label: 'Event Hairdo & Styling', asks: ['length', 'density'] },
  { id: 'keratin', label: 'Keratin Smoothing', asks: ['length', 'density'] },
  { id: 'custom', label: 'Something Custom', asks: ['look', 'length', 'density'] },
]

const LOOKS = ['Soft glam', 'Full glam', 'Not sure yet']

function catalogWork(service) {
  return {
    id: `svc-${service.id}`,
    serviceId: service.id,
    label: service.name,
    category: service.category,
    service,
    asks: ['length', 'density'],
  }
}

function linkedHairWorkId(searchParams) {
  const service = getQuoteServiceById(searchParams.get('serviceId'))
  return service && isHairQuoteService(service) ? `svc-${service.id}` : null
}

function QuoteBuilderInner() {
  const searchParams = useSearchParams()
  const hairServices = useMemo(() => getHairQuoteServices().map(catalogWork), [])
  const works = useMemo(() => [...SPECIAL_WORKS, ...hairServices], [hairServices])
  const deepWorkId = linkedHairWorkId(searchParams)

  const [pickedId, setPickedId] = useState(null)
  const [look, setLook] = useState('')
  const [length, setLength] = useState('')
  const [density, setDensity] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')

  /* Deep-link wins until the guest picks a different work. */
  const workId = pickedId ?? deepWorkId ?? SPECIAL_WORKS[0].id
  const work = works.find((w) => w.id === workId) || works[0]
  const floorLabel = work.service ? quoteFloorLabel(work.service) : null

  useEffect(() => {
    const quoteFlag = searchParams.get('quote')
    if (quoteFlag === '1' || deepWorkId || window.location.hash === '#quote') {
      requestAnimationFrame(() => {
        document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [searchParams, deepWorkId])

  const waHref = buildQuoteWaHref({
    label: work.label,
    floorLabel,
    look: work.asks.includes('look') ? look : '',
    length: work.asks.includes('length') ? length : '',
    density: work.asks.includes('density') ? density : '',
    date,
    note,
  })

  /* Hair quote path asks length + density — gate Send until both are set so
     WhatsApp never goes out incomplete. Look-only works (party/signature) stay open. */
  const needsLength = work.asks.includes('length')
  const needsDensity = work.asks.includes('density')
  const sendReady =
    (!needsLength || Boolean(length)) && (!needsDensity || Boolean(density))

  const pill = (active) =>
    `tap-safe tab-pill ${active ? 'tab-pill-active' : ''}`

  return (
    <section id="quote" className="mb-12 panel-soft p-5 md:p-7 shadow-soft max-w-3xl" aria-labelledby="quote-heading">
      <p className="text-[10px] tracking-[0.24em] uppercase font-[family-name:var(--font-inter)] text-plum mb-2">
        Quote
      </p>
      <h2 id="quote-heading" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-xl md:text-2xl mb-5">
        Get a quote
      </h2>

      <div className="flex flex-col gap-4">
        <div>
          <p className="text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone mb-2">The work</p>
          <div className="flex flex-wrap gap-2">
            {SPECIAL_WORKS.map((w) => (
              <button key={w.id} type="button" onClick={() => setPickedId(w.id)}
                aria-pressed={workId === w.id} className={pill(workId === w.id)}>
                {w.label}
              </button>
            ))}
          </div>
          {hairServices.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone mb-2">
                Hair menu
              </p>
              <div className="flex flex-wrap gap-2">
                {hairServices.map((w) => (
                  <button key={w.id} type="button" onClick={() => setPickedId(w.id)}
                    aria-pressed={workId === w.id} className={pill(workId === w.id)}>
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {floorLabel && (
          <p className="text-sm font-[family-name:var(--font-inter)] text-ink">
            Floor <span className="font-medium tabular-nums">{floorLabel}</span>
          </p>
        )}

        {work.asks.includes('look') && (
          <div>
            <p className="text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone mb-2">The look</p>
            <div className="flex flex-wrap gap-2">
              {LOOKS.map((l) => (
                <button key={l} type="button" onClick={() => setLook(look === l ? '' : l)}
                  aria-pressed={look === l} className={pill(look === l)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {work.asks.includes('length') && (
          <div>
            <p className="text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone mb-2">Length</p>
            <div className="flex flex-wrap gap-2">
              {QUOTE_LENGTHS.map((l) => (
                <button key={l} type="button" onClick={() => setLength(length === l ? '' : l)}
                  aria-pressed={length === l} className={pill(length === l)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {work.asks.includes('density') && (
          <div>
            <p className="text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone mb-2">Density</p>
            <div className="flex flex-wrap gap-2">
              {QUOTE_DENSITIES.map((d) => (
                <button key={d} type="button" onClick={() => setDensity(density === d ? '' : d)}
                  aria-pressed={density === d} className={pill(density === d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="quote-date" className="block text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone mb-2">
            Date <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="quote-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-border-soft bg-white px-3.5 py-2.5 text-ink text-sm font-[family-name:var(--font-inter)] focus:border-ink"
          />
        </div>

        <div>
          <label htmlFor="quote-note" className="block text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone mb-2">
            Note <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="quote-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Colour goals, damage, event…"
            className="w-full max-w-md border border-border-soft bg-white px-3.5 py-2.5 text-ink text-sm font-[family-name:var(--font-inter)] focus:border-ink"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {sendReady ? (
            <WaCta href={waHref} from="prices-quote-builder" className="tap-safe btn-primary">
              Send for a quote <ArrowUpRight className="w-3.5 h-3.5" />
            </WaCta>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="tap-safe btn-primary opacity-40 cursor-not-allowed"
            >
              Send for a quote <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
          {!sendReady && (needsLength || needsDensity) && (
            <p className="text-xs font-[family-name:var(--font-inter)] text-stone">
              Pick length and density first
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default function QuoteBuilder() {
  return (
    <Suspense fallback={
      <section id="quote" className="mb-12 panel-soft p-5 md:p-7 shadow-soft max-w-3xl" aria-labelledby="quote-heading">
        <h2 id="quote-heading" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-xl md:text-2xl">
          Get a quote
        </h2>
      </section>
    }>
      <QuoteBuilderInner />
    </Suspense>
  )
}
