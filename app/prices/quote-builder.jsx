'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

/* The two-tier pricing model: every fixed service is printed on this page;
   the "special works" (custom makeup looks, event hairdos, keratin) genuinely
   vary per person — so instead of a fake number, this builds a structured
   WhatsApp quote request. The reply is a binding quote. */

const WORKS = [
  { id: 'party', label: 'Party Makeup', asks: ['look'] },
  { id: 'signature', label: 'Signature / Engagement Look', asks: ['look'] },
  { id: 'hairdo', label: 'Event Hairdo & Styling', asks: ['length'] },
  { id: 'keratin', label: 'Keratin Smoothing', asks: ['length'] },
  { id: 'custom', label: 'Something Custom', asks: ['look', 'length'] },
]

const LOOKS = ['Soft glam', 'Full glam', 'Not sure yet']
const LENGTHS = ['Short', 'Shoulder length', 'Long', 'Very long']

export default function QuoteBuilder() {
  const [work, setWork] = useState(WORKS[0])
  const [look, setLook] = useState('')
  const [length, setLength] = useState('')
  const [date, setDate] = useState('')

  const parts = [
    `Quote please — ${work.label}`,
    work.asks.includes('look') && look ? `look: ${look}` : null,
    work.asks.includes('length') && length ? `hair: ${length}` : null,
    date ? `date: ${date}` : null,
  ].filter(Boolean)
  const waHref = `https://wa.me/923222782254?text=${encodeURIComponent(parts.join(', ') + ' (via farwasalon.com/prices)')}`

  const pill = (active) =>
    `tap-safe tab-pill ${active ? 'tab-pill-active' : ''}`

  return (
    <section id="quote" className="mb-12 panel-soft p-5 md:p-7 shadow-soft max-w-3xl" aria-labelledby="quote-heading">
      <p className="text-[10px] tracking-[0.24em] uppercase font-[family-name:var(--font-inter)] text-accent-gold-deep mb-2">
        The special works · quoted per person
      </p>
      <h2 id="quote-heading" className="font-[family-name:var(--font-syne)] font-semibold text-ink text-xl md:text-2xl mb-2">
        Construct your quote
      </h2>
      <p className="text-body text-sm mb-5 max-w-xl">
        Custom makeup looks, event hairdos, and keratin vary by look and hair — the only honest
        price is quoted for you. Pick below, send it, and the quote that comes back is binding:
        confirmed before you book, unchanged at the counter.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <p className="text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone mb-2">The work</p>
          <div className="flex flex-wrap gap-2">
            {WORKS.map((w) => (
              <button key={w.id} type="button" onClick={() => setWork(w)}
                aria-pressed={work.id === w.id} className={pill(work.id === w.id)}>
                {w.label}
              </button>
            ))}
          </div>
        </div>

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
            <p className="text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone mb-2">Hair length</p>
            <div className="flex flex-wrap gap-2">
              {LENGTHS.map((l) => (
                <button key={l} type="button" onClick={() => setLength(length === l ? '' : l)}
                  aria-pressed={length === l} className={pill(length === l)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="quote-date" className="block text-[11px] tracking-[0.14em] uppercase font-[family-name:var(--font-inter)] text-stone mb-2">
            Event date <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="quote-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-border-soft bg-white px-3.5 py-2.5 text-ink text-sm font-[family-name:var(--font-inter)] focus:outline-none focus:border-ink"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a href={waHref} target="_blank" rel="noreferrer" className="tap-safe btn-primary">
            Send for a quote <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
          <p className="text-stone text-[12px] font-[family-name:var(--font-inter)] font-light">
            Opens WhatsApp with your request pre-written — add a reference photo there.
          </p>
        </div>
      </div>
    </section>
  )
}
